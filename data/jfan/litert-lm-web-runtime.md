# jfan/litert-lm-web-runtime

## Resumen

`jfan/litert-lm-web-runtime` no es un modelo de lenguaje con pesos propios, sino la distribucion oficial del runtime **LiteRT-LM Web** (`@litert-lm/core@0.17.8-dev`): un SDK en WebAssembly y TypeScript que permite ejecutar modelos Gemma 4 integramente en el navegador con aceleracion WebGPU, sin servidor ni llamadas a API externas. El paquete incluye los binarios `.wasm`, el pegamento JavaScript generado con Emscripten y el tarball de npm necesario para cargar los bundles de **Gemma 4 E2B** y **Gemma 4 E4B** con decodificacion especulativa basada en *Multi-Token Prediction* (MTP) neuronal y vision multimodal.

El objetivo del proyecto es habilitar inferencia 100% en el cliente (client-side) para tareas de texto e imagen, apoyandose en tres piezas tecnicas: gestion dinamica de atencion agrupada (GQA/MQA) con enlace zero-copy de la cache KV compartida a capas concretas, externalizacion de los pesos del *drafter* MTP en formato FlatBuffer para evitar duplicacion de memoria, y un pipeline especulativo sin lectura de vuelta desde GPU que escribe los IDs de token muestreados directamente en los buffers de embedding en VRAM. El resultado declarado es un consumo de heap del navegador por debajo de 2,2 GB, dentro del limite de 4 GB impuesto por `wasm32`.

Es relevante ahora porque traslada la inferencia multimodal a un entorno puramente web: elimina costes de servidor, mantiene los datos en el dispositivo y aprovecha la GPU local del usuario. Como contrapartida, la informacion publicada es exclusivamente la model card del autor, sin benchmarks independientes ni datos de contexto, cuantizacion o idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Runtime de inferencia web (WebAssembly + WebGPU); no es un modelo de pesos. Modelos compatibles: Gemma 4 E2B (transformer con MQA) y Gemma 4 E4B (transformer con GQA), con drafter MTP y vision multimodal |
| Parametros totales | No disponible para el runtime. Bundles de modelos compatibles: 2,28 GB (E2B) y 3,25 GB (E4B) en disco |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (FlatBuffer con buffers externos para el drafter MTP), `.wasm` (builds estandar, compat y asyncify), JS de Emscripten (`.js`) y tarball npm (`.tgz`) |
| Version del paquete | `@litert-lm/core@0.17.8-dev` |
| Tamano del repositorio | 0,2 GB |
| Backend de ejecucion | WebGPU (`Backend.GPU_ARTISAN`) |
| Idiomas de la libreria | TypeScript / JavaScript (npm) |
| Libreria asociada en HuggingFace | `litert` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio distribuye exclusivamente artefactos de ejecucion, no pesos entrenados, por lo que no hay informacion sobre dataset, numero de tokens, composicion de datos ni fases de RLHF/DPO. La arquitectura relevante es la del runtime: un nucleo compilado a WebAssembly que actua como orquestador sobre WebGPU. Sobre el se apoyan los modelos Gemma 4, que segun la model card incorporan atencion multi-query (MQA con 1 cabeza KV) en E2B y atencion agrupada (GQA con 2 cabezas KV) en E4B, ademas de un encoder de vision y un *drafter* MTP para decodificacion especulativa.

Las innovaciones tecnicas declaradas en la version 0.17.8-dev son cuatro. Primera, enlace dinamico de la cache KV compartida: se realiza un binding zero-copy en VRAM a las capas `[13, 14]` para el modelo de 35 capas (E2B) y a las capas `[22, 23]` para el de 42 capas (E4B), de modo que el drafter comparte estado con el modelo principal. Segunda, externalizacion de los pesos del drafter MTP: los tensores se resuelven contra `Model.external_buffers` en formato FlatBuffer, lo que permite concatenar los drafters de la seccion 11 y la seccion 21 sin duplicar memoria ni en VRAM ni en el host. Tercera, optimizacion del heap de `wasm32`: los buffers de modelo en el host (`kTfLiteEndOfVision`, `kTfLiteMtpDrafter`) se liberan inmediatamente despues de crear los tensores en WebGPU, manteniendo el heap total del navegador por debajo de 2,2 GB de los 4 GB disponibles en `wasm32`. Cuarta, pipeline especulativo sin *readback*: un shader WGSL de ArgMax con reduccion en dos etapas de workgroup escribe los IDs de token muestreados directamente en los buffers de embedding en VRAM, con una unica descarga de buffer por paso de decodificacion.

## Capacidades

- Inferencia de modelos Gemma 4 (E2B y E4B) completamente en el navegador, con aceleracion WebGPU y sin backend remoto.
- Vision multimodal: acepta contenido mixto imagen + texto en un mismo mensaje (`{ type: 'image', data }` junto a `{ type: 'text', text }`) para描述 y analisis de imagenes.
- Decodificacion especulativa neuronal (MTP) activable por sesion mediante `enableSpeculativeDecoding: true`.
- Gestion de conversaciones multi-turno a traves de `engine.createConversation` y `sessionConfig` (por ejemplo `maxOutputTokens: 512`, `temperature`).
- Muestreo configurable: la model card recomienda `temperature: 0.0` (greedy) para maximizar la tasa de aceptacion especulativa.
- Telemetria de rendimiento en tiempo real via `getBenchmarkInfo()`, con metricas de `lastPrefillTokensPerSecond` y `lastDecodeTokensPerSecond`.
- Compatibilidad con tres builds de WASM para adaptarse al navegador: build estandar (JSPI + Relaxed SIMD), build compat (JSPI + SIMD estandar) y build asyncify (para navegadores sin soporte de JSPI).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes o multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (no se declaran idiomas soportados para el runtime).
- Capacidades de audio: no disponible.

## Casos de uso

- Asistentes conversacionales embebidos en una web: el runtime carga Gemma 4 E2B o E4B en el navegador y permite crear sesiones multi-turno con `maxOutputTokens` y `temperature` configurables, sin desplegar infraestructura de servidor ni exponer los prompts del usuario.
- Analisis de imagenes en el cliente: con vision multimodal se puede enviar una fotografia junto a una instruccion de texto para clasificar alimentos, describir productos o extraer informacion visual. El ejemplo de la propia model card analiza un plato para describir ingredientes y estimar su perfil nutricional.
- Aplicaciones web con requisitos de privacidad o RGPD: al ejecutarse todo el calculo en el dispositivo, los datos sensibles (documentos, imagenes medicas, capturas) no salen del navegador del usuario, lo que simplifica el cumplimiento normativo.
- Aplicaciones progresivas y modo offline: el SDK se instala como tarball de npm (`npm install` del `.tgz`) y los binarios `.wasm` pueden servirse localmente, lo que permite funcionar sin conexion una vez cacheado el bundle de pesos.
- Prototipado y demos de Gemma 4 sin hardware dedicado: investigadores y desarrolladores pueden evaluar el comportamiento del modelo en un portatil con WebGPU, usando el build asyncify en navegadores sin JSPI, sin aprovisionar GPU en la nube.
- Reduccion de costes de inferencia en productos de bajo volumen: al eliminar el coste marginal por token en servidor, resulta adecuado para herramientas internas, demos y aplicaciones con usuarios dispersos.
- Integracion en editores y herramientas web: el runtime expone una API TypeScript (`loadEngine`, `createConversation`, `sendMessage`), lo que facilita incrustar generacion de texto o analisis de imagenes en IDEs en linea, plataformas de documentacion o paneles de analisis.
- Aprendizaje y divulgacion: permite demostrar decodificacion especulativa, GQA frente a MQA y binding zero-copy de cache KV en un entorno reproducible dentro del navegador, con metricas de prefill y decode en directo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El runtime expone una API de telemetria (`getBenchmarkInfo()`) que devuelve `lastPrefillTokensPerSecond` y `lastDecodeTokensPerSecond`, pero la model card no incluye valores numericos de throughput ni de latencia para ninguna GPU concreta, ni resultados de MMLU, HumanEval, GSM8K u otros conjuntos de evaluacion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, los bundles de pesos ocupan 2,28 GB (Gemma 4 E2B) y 3,25 GB (Gemma 4 E4B), a lo que hay que anadir cache KV, buffers de trabajo, encoder de vision y tensores del drafter MTP.
- Memoria del host: la model card indica que, tras crear los tensores en WebGPU, se liberan los buffers `kTfLiteEndOfVision` y `kTfLiteMtpDrafter`, manteniendo el heap del navegador por debajo de 2,2 GB. El limite duro de `wasm32` es de 4 GB de heap.
- GPU recomendadas: no disponible. El requisito real es que el navegador y la GPU soporten WebGPU.
- Compatibilidad con GPU de consumo: si, siempre que exista soporte WebGPU en el navegador; se espera funcionamiento en GPU integradas y dedicadas modernas, aunque no se especifican modelos concretos (RTX 4090, A100, H100, etc.).
- Navegadores y compilaciones: build estandar (WebGPU + JSPI + Relaxed SIMD), build compat (WebGPU + JSPI + SIMD estandar) y build asyncify (34,7 MB / 34,5 MB) para navegadores sin JSPI.
- Opciones de despliegue: instalacion del tarball npm (`litert-lm-core-0.17.8-dev.tgz`, 37,5 MB) y carga del motor con `loadEngine({ wasmPath, backend: Backend.GPU_ARTISAN, modelUrl })`. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que el destino es el navegador.
- Artefactos WASM: `litertlm_wasm_internal.wasm` (22,1 MB), `litertlm_wasm_compat_internal.wasm` (21,9 MB), `litertlm_wasm_asyncify_internal.wasm` (34,7 MB), `litertlm_wasm_compat_asyncify_internal.wasm` (34,5 MB), con ficheros JS de pegamento de 299-307 KB.
- Latencia y throughput: no disponibles. Solo se documenta que el pipeline especulativo realiza una unica descarga de buffer por paso de decodificacion y que el ArgMax en WGSL evita el readback a CPU.

## Comparativa con modelos similares

Dentro de este runtime solo se declaran dos bundles de modelo compatibles. No hay informacion en la documentacion proporcionada que permita comparar con otros runtimes de inferencia en navegador (WebLLM, transformers.js, ONNX Runtime Web) ni con modelos alternativos de la misma categoria.

| Modelo | Tamano del bundle | Capas | Cache KV | Drafter especulativo | Repositorio |
|---|---|---|---|---|---|
| Gemma 4 E2B | 2,28 GB | 35 | MQA (1 cabeza KV) | Compartido L13/L14 | `jfan/gemma-4-e2b-web-mtp-vision-litert-lm` |
| Gemma 4 E4B | 3,25 GB | 42 | GQA (2 cabezas KV) | Compartido L22/L23 | `jfan/gemma-4-e4b-web-mtp-vision-litert-lm` |

Comparativa con modelos o runtimes alternativos: no disponible.

## Limitaciones y advertencias

- La model card del autor es la unica fuente de informacion: no hay benchmarks independientes, ni documentacion de dataset, licencias de los pesos subyacentes, ni validacion por terceros.
- No se declaran idiomas soportados ni longitud de contexto, por lo que no se puede garantizar cobertura multilingue ni conversaciones de contexto largo.
- No se especifica el esquema de cuantizacion de los bundles `.litertlm`, lo que impide estimar con precision la perdida de calidad frente a los pesos originales.
- Riesgo de alucinacion inherente a los modelos generativos; la model card recomienda `temperature: 0.0` por motivos de aceptacion especulativa, no porque reduzca el riesgo de error factual.
- Dependencia estricta de WebGPU: en navegadores o equipos sin soporte WebGPU el runtime no funciona, y las builds asyncify son un mecanismo de compatibilidad para la ausencia de JSPI, no un sustituto de WebGPU.
- Limite de memoria de `wasm32`: 4 GB de heap, con un consumo declarado por debajo de 2,2 GB. Los bundles de 3,25 GB (E4B) dejan poco margen para contextos largos o lotes grandes.
- La version distribuida es `0.17.8-dev`, es decir, una version de desarrollo sin garantias de estabilidad de API ni soporte a largo plazo.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso en produccion ni de mantenimiento continuado por parte de la comunidad.
- Licencia Apache 2.0 para el runtime; la licencia aplicable a los pesos de los modelos Gemma 4 compatibles no se especifica en la informacion proporcionada y debe verificarse por separado antes de un uso comercial.
- La fecha de creacion y actualizacion del repositorio es 2026-09-22, con apenas cinco segundos entre ambos eventos, lo que sugiere una publicacion automatizada y sin historial de revisiones.
- La busqueda web realizada no devolvio fuentes relevantes (unicamente resultados genericos de Reddit), por lo que no se ha podido contrastar la informacion con documentacion externa, papers o repositorios de referencia.

## Enlaces

- Repositorio del runtime: https://huggingface.co/jfan/litert-lm-web-runtime
- Modelo compatible Gemma 4 E2B: https://huggingface.co/jfan/gemma-4-e2b-web-mtp-vision-litert-lm
- Modelo compatible Gemma 4 E4B: https://huggingface.co/jfan/gemma-4-e4b-web-mtp-vision-litert-lm
- Tarball npm: https://huggingface.co/jfan/litert-lm-web-runtime/resolve/main/litert-lm-core-0.17.8-dev.tgz
- Directorio de binarios WASM: https://huggingface.co/jfan/litert-lm-web-runtime/resolve/main/wasm/
- Papers, blogs, repositorios adicionales o demos: no disponible en la informacion proporcionada.
