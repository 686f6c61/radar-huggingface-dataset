# HOLOGRAMTECH/q-qwen2.5-1.5b-instruct

## Resumen

q-qwen2.5-1.5b-instruct es una redistribución empaquetada de Qwen2.5-1.5B-Instruct, el modelo de lenguaje denso de 1.500 millones de parámetros desarrollado por Alibaba Qwen, adaptado por HOLOGRAMTECH para su motor Hologram Q, que ejecuta inferencia en el navegador mediante WebGPU. El modelo no introduce pesos nuevos: parte del GGUF Q4_K_M oficial de Qwen, dequantiza y recuantiza cada tensor a bloques de 4 bits con una escala f32 por cada 32 pesos, y lo serializa en un contenedor propietario `.holo` de 972 MB que el motor consume directamente en el cliente.

La relevancia de esta ficha no está en el modelo base, ampliamente conocido, sino en el formato y el caso de uso: inferencia 100 % local en navegador sin backend, con un único fichero reproducible (mismo sha256 al reconstruirlo desde el mismo GGUF). Está pensado como modelo de dispositivo de Prism AI Foundry, donde además de chat se usa para generar especificaciones de aplicación conformes a la gramática `prism/spec/1`.

El modelo hereda la licencia Apache-2.0 del original y las capacidades de Qwen2.5-1.5B-Instruct: generación de texto, razonamiento ligero, código y soporte multilingüe, con una ventana de contexto nativa de 32.768 tokens en el modelo base (no confirmada para este empaquetado).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5), empaquetado en contenedor `.holo` para motor Hologram Q (WebGPU) |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada para el empaquetado (el base Qwen2.5-1.5B-Instruct declara 32.768 tokens) |
| Tipos de cuantizacion | 4 bits con escala f32 por bloque de 32 pesos; normas y sesgos en f32; origen Q4_K_M (tensores Q4_K y Q6_K dequantizados y recuantizados) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache-2.0 (LICENSE de Qwen copiada sin cambios) |
| Formato de pesos | `.holo` (cabecera + cabecera GGUF como tokenizer + bloques de tensores gzip nombrados por BLAKE3); origen GGUF Q4_K_M |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con atención por causalidad estándar, entrenado por Alibaba Qwen con un pipeline que incluye preentrenamiento en gran escala y ajuste por instrucciones (los detalles exactos de composición del dataset y fases de RLHF/DPO no se recogen en la información proporcionada). El empaquetado de HOLOGRAMTECH no reentrena ni modifica los pesos en términos semánticos: toma el GGUF Q4_K_M oficial (revisión `91cad51170dc346986eccefdc2dd33a9da36ead9`, sha256 `6a1a2eb6d15622bf3c96857206351ba97e1af16c30d7a74ee38970e434e9407e`) y aplica su propio `qvac-ingest.mjs` con `buildManifest` y `makeDiskFetcher` para producir los mismos bloques que el motor generaría al ingerir el GGUF en el navegador.

La innovación técnica está en el contenedor y el runtime, no en el modelo: el fichero `.holo` incluye cabecera, la cabecera GGUF reutilizada como tokenizer y los tensores comprimidos con gzip ordenados según el orden de lectura del motor, con nombres derivados de su hash BLAKE3. El proceso es determinista (dos construcciones desde el mismo GGUF producen el mismo sha256). La decodificación puede restringirse mediante la gramática `prism/spec/1`, que fija la forma sintáctica de la salida pero no su corrección semántica.

## Capacidades

- Generación de texto conversacional multi-turno en modo chat.
- Razonamiento básico y respuesta a instrucciones, heredado de Qwen2.5-1.5B-Instruct.
- Generación de código y explicaciones técnicas a escala de modelo pequeño.
- Capacidades multilingües del modelo base (el conjunto exacto de idiomas no se detalla en la información disponible).
- Generación de especificaciones de aplicación restringidas por gramática `prism/spec/1` (modo específico de Prism AI Foundry).
- Ejecución local en navegador mediante WebGPU, sin backend ni envío de datos a servidores.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para este empaquetado.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Chat local en navegador: el motor Hologram Q carga el `.holo` de 972 MB y ejecuta la conversación íntegramente en el cliente con WebGPU, útil para asistentes integrados en webs que no pueden enviar datos a un backend por privacidad o cumplimiento.
- Generación de especificaciones de aplicación en Prism AI Foundry: el modelo recibe una petición de una frase y emite una spec conforme a `prism/spec/1`; según la medición del autor, 8 de 10 specs pasaron el checker y unas 3 de 10 eran semánticamente la aplicación pedida, por lo que encaja en un flujo con revisión humana.
- Prototipado sin infraestructura: equipos que quieren validar una idea de asistente conversacional sin provisionar GPUs ni contenedores, aprovechando los 50-63 tokens/s medidos en una GPU integrada Radeon 8050S.
- Demos y documentación interactiva: incrustar un chat de ejemplo en una página de producto con primera respuesta en ~0,3 s en hardware de gama media.
- Educación y experimentación con cuantización: el repositorio y el script de ingesta permiten estudiar el paso GGUF Q4_K_M a bloques de 4 bits con escala f32 por 32 pesos y verificar la reproducibilidad por sha256.
- Aplicaciones offline-first o PWA: al no requerir red tras la descarga del fichero, sirve para entornos con conectividad intermitente o dispositivos donde no se puede instalar un runtime de inferencia nativo.
- Filtrado y clasificación de texto ligera en cliente: tareas de etiquetado o resumen corto donde 1.5B parámetros y la latencia de WebGPU son suficientes y se prefiere no exponer el texto del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas métricas aportadas son las del autor, medidas el 2026-11-14 en una GPU integrada Radeon 8050S con Chromium y WebGPU:

| Metrica | Valor |
|---|---|
| Primer token (chat) | 0,3 s |
| Throughput (chat) | 50 a 63 tokens/s |
| Specs generadas con gramatica `prism/spec/1` | 10 solicitudes |
| Specs que pasan el checker de Foundry | 8 de 10 |
| Specs semanticamente correctas (lectura manual) | ~3 de 10 |
| Tiempo por spec | 15 a 60 s |

## Requisitos de hardware

- VRAM/almacenamiento: el fichero `.holo` ocupa 972.462.854 bytes (~927 MiB); la memoria necesaria en el navegador es superior por buffers de trabajo y contexto, aunque no se especifica en la información disponible.
- GPU recomendadas: cualquier GPU con soporte WebGPU en Chromium; el autor valida con una Radeon 8050S integrada. No hay datos publicados para A100, H100 o RTX 4090 en este runtime.
- GPU de consumo: sí, cabe en equipos con GPU integrada moderna; el cuello de botella es el soporte WebGPU del navegador, no la VRAM.
- Opciones de despliegue: motor Hologram Q (WebGPU, navegador). El GGUF de origen Q4_K_M puede ejecutarse con llama.cpp, Ollama u otros runtimes GGUF, aunque esa ruta no forma parte de este empaquetado.
- Latencia y throughput: 0,3 s hasta el primer token y 50-63 tokens/s en la configuración medida; la generación restringida por gramática es mucho más lenta (15-60 s por spec).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| HOLOGRAMTECH/q-qwen2.5-1.5b-instruct | 1.5B | no disponible en el empaquetado (base: 32.768) | `.holo`, WebGPU en navegador | Apache-2.0 | Cuantización 4 bits propia, reproducible por sha256 |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | 32.768 | safetensors, transformers, vLLM | Apache-2.0 | Modelo base oficial, sin restricción de gramática |
| Qwen/Qwen2.5-1.5B-Instruct-GGUF | 1.5B | 32.768 | GGUF (Q4_K_M y otras) | Apache-2.0 | Ejecutable con llama.cpp/Ollama en local nativo |
| Modelos ~1.5B en navegador (p. ej. variantes WebLLM de Llama 3.2 1B) | ~1-1.5B | variable | MLC / WebGPU | según modelo | Alternativa de runtime; datos concretos no disponibles en la información proporcionada |

## Limitaciones y advertencias

- Calidad semántica limitada en generación de specs: solo ~3 de 10 salidas fueron la aplicación pedida; la gramática garantiza forma, no corrección. Requiere validación humana o automática aguas abajo.
- Modelo de 1.5B parámetros: razonamiento complejo, matemáticas avanzadas y código de producción quedan por debajo de modelos de 7B o superiores; riesgo de alucinación notable en dominios especializados.
- Dependencia de WebGPU: solo funciona en navegadores y plataformas con soporte WebGPU (Chromium moderno); no hay ruta de despliegue en servidor documentada para el contenedor `.holo`.
- Formato propietario: el `.holo` no es portable a otros runtimes; para usar los pesos fuera de Hologram Q hay que partir del GGUF original de Qwen.
- Idiomas: el conjunto exacto de idiomas soportados no está documentado en la información disponible; conviene validar el idioma objetivo antes de producción.
- Contexto: la longitud efectiva en el motor no está confirmada; no asumir los 32.768 tokens del modelo base sin verificación.
- Sesgos: no se documentan evaluaciones de sesgo para este empaquetado; hereda los del modelo base Qwen2.5, no auditados aquí.
- Licencia Apache-2.0 permite uso comercial, pero el `LICENSE` es el de Qwen copiado sin cambios; conviene revisar los términos del motor Hologram Q, que no se detallan en la model card.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin garantías de mantenimiento ni soporte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HOLOGRAMTECH/q-qwen2.5-1.5b-instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- GGUF de origen: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF
- Revisión del GGUF usada: `91cad51170dc346986eccefdc2dd33a9da36ead9`
- Paper, blog, repositorio del motor Hologram Q o demos: no disponibles en la información proporcionada.
