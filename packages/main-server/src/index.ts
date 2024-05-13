import { Hono } from 'hono'

async function signWithECDSA(privateKey:CryptoKey, message:string) {
  const encoder = new TextEncoder();
  const encodedMessage = encoder.encode(message);

  const signature = await crypto.subtle.sign(
    {
      name: "ECDSA",
      hash: { name: "SHA-384" },
    },
    privateKey,
    encodedMessage
  );

  return signature;
}

async function generateEcdsaKeyPair() {
  const algorithm = { name: "ECDSA", namedCurve: "P-384" };
  const exportable = true;
  const usage:KeyUsage[] = ['sign', 'verify'];
  return await crypto.subtle.generateKey(algorithm, exportable, usage);
}


const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('tetetet', async (c) => {
  const keys = await generateEcdsaKeyPair();
  const signature = await signWithECDSA(keys.privateKey, 'Hello World!');
  const publicKey = await crypto.subtle.exportKey('spki', keys.publicKey);
  const importedPublicKey = await crypto.subtle.importKey('spki', publicKey, { name: 'ECDSA', namedCurve: 'P-384' }, false, ['verify']);
  const verify = await crypto.subtle.verify(
    {name: "ECDSA",hash: { name: "SHA-384" },},importedPublicKey,signature,signature)
  console.log(verify)
  return c.json({ keys, signature, publicKey, verify });
})

export default app
