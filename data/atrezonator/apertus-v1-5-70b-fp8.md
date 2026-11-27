# atrezonator/Apertus-v1.5-70B-FP8

## Resumen

Apertus-v1.5-70B-FP8 es una cuantizacion en FP8 del modelo multimodal Apertus v1.5 70B desarrollado por Swiss AI. Se trata de un checkpoint derivado, publicado por el usuario atrezonator, que reduce el peso de los pesos originales de 135 GiB en BF16 a 71 GiB manteniendo, segun el autor, la calidad del modelo base sin perdida medible en MMLU. El modelo original es un transformer multimodal de tipo image-text-to-text con capacidad de procesar imagen, audio y texto, e incluye modo de razonamiento y soporte de tool calling.

La relevancia de esta ficha radica en que ofrece una via practica para desplegar un modelo de 72.005.819.139 parametros en una unica GPU de 96 GiB, algo inviable con los pesos en BF16. La cuantizacion emplea el esquema FP8_DYNAMIC de compressed-tensors sobre todas las proyecciones lineales, dejando en BF16 el lm_head, los embeddings y los tokenizadores de vision y audio, de modo que las capacidades multimodales se preservan.

El checkpoint esta pensado exclusivamente para vLLM, requiere una imagen con soporte de la arquitectura Apertus1p5 (aun no incluida en releases nativas de vLLM en el momento de su publicacion) y esta liberado bajo licencia Apache 2.0. No se han publicado datos sobre idiomas soportados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con modo de razonamiento; arquitectura Apertus1p5 |
| Parametros totales | 72.005.819.139 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el autor estima ~60k tokens con KV cache en FP8 en una GPU de 96 GiB |
| Tipos de cuantizacion | FP8_DYNAMIC (compressed-tensors) en proyecciones lineales; BF16 en lm_head, embeddings y tokenizadores de vision/audio. Existe tambien un checkpoint NVFP4 del mismo modelo base |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), libreria vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Swiss AI que integra un codificador de vision basado en Emu3.5 y un codificador de audio WavTokenizer, segun la atribucion de la model card, con un refactor GPU-native de los codificadores multimodales realizado por blancsw en Infomaniak. El checkpoint aqui descrito no reentrena el modelo: aplica una cuantizacion de una sola pasada y sin calibracion mediante llm-compressor 0.12.0, con el esquema FP8_DYNAMIC sobre todas las capas Linear y una lista de ignorados que excluye lm_head, embed_tokens y los tokenizadores de vision y audio (regex `.*vision_tokenizer.*` y `.*audio_tokenizer.*`).

La cuantizacion se completo en aproximadamente 4 minutos en una RTX PRO 6000 Blackwell. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF/DPO del modelo original en la informacion proporcionada. El modelo incorpora parsers especificos de tool calling y de razonamiento (`--tool-call-parser apertus` y `--reasoning-parser apertus`), lo que confirma la existencia de un modo de razonamiento explicito en la arquitectura base.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con codificador de vision Emu3.5 preservado sin cuantizar.
- Procesamiento de audio mediante WavTokenizer, tambien preservado en BF16.
- Modo de razonamiento explicito, con parser dedicado en vLLM (`reasoning-parser apertus`).
- Tool calling / function calling nativo, con parser dedicado (`tool-call-parser apertus`) y soporte de auto tool choice en vLLM.
- Capacidades de agente y razonamiento multi-paso derivadas del soporte de tool calling y del modo de razonamiento.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional multimodal en produccion: el modelo puede gestionar dialogos multi-turno que combinen texto, imagenes y audio, gracias a sus codificadores multimodales preservados en BF16 y a una ventana de contexto estimada de ~60k tokens en una GPU de 96 GiB con KV cache en FP8.
- Analisis de documentos con imagenes: extraccion y razonamiento sobre capturas, diagramas o formularios escaneados, usando el pipeline image-text-to-text y el modo de razonamiento para justificar conclusiones.
- Transcripcion y analisis de audio con contexto: el codificador WavTokenizer permite incorporar audio a la conversacion y razonar sobre el junto con texto e imagenes en una misma sesion.
- Agentes con tool calling: integracion en flujos de automatizacion donde el modelo decide que funcion invocar (APIs internas, busquedas, calculos) gracias al parser de tool calling nativo de vLLM y a `--enable-auto-tool-choice`.
- Despliegue on-premise con requisitos de privacidad: al caber en una unica GPU de 96 GiB y ser Apache 2.0, es adecuado para entornos donde los datos no pueden salir de la infraestructura, como sanidad, legal o administracion publica.
- Razonamiento asistido en entornos de investigacion: el modo de razonamiento explicito y la licencia permisiva permiten usarlo como base para experimentos de evaluacion y ajuste fino sobre tareas cientificas o tecnicas.
- Servicio de inferencia de alta calidad con throughput moderado: con ~20 TPS de decodificacion y ~2500 TPS de prefill en RTX PRO 6000 Blackwell, es viable para cargas interactivas de un solo usuario o pocos usuarios concurrentes donde prima la calidad sobre el coste por token.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (MMLU, 5-shot, 100 muestras, lm-evaluation-harness, RTX PRO 6000 Blackwell):

| Metrica | BF16 (oficial) | FP8 | Delta |
|---|---|---|---|
| MMLU overall | baseline | 0.7205 | indistinguible |
| MMLU humanities | baseline | 0.7646 | indistinguible |
| MMLU social sciences | baseline | 0.8158 | indistinguible |
| MMLU STEM | baseline | 0.6258 | indistinguible |
| MMLU other | baseline | 0.7269 | indistinguible |

Rendimiento de inferencia medido con llmapibenchmark en RTX PRO 6000 Blackwell (96 GiB):

| Metrica | Valor |
|---|---|
| Throughput de decodificacion | ~20 TPS (un usuario) |
| Throughput de prefill | ~2500 TPS |
| Throughput de decodificacion del checkpoint NVFP4 (referencia) | ~31 TPS |

No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, MMMU, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 71 GiB de pesos en FP8; se requieren 96 GiB para multimodal completo con contexto util (quedan ~14 GiB para KV cache, suficiente para ~60k tokens con KV cache en FP8).
- Para inferencia solo texto y contexto corto, los 71 GiB pueden caber en GPUs de 80 GiB si se desactiva el multimodal.
- GPUs compatibles segun el autor: NVIDIA RTX PRO 6000 Blackwell (GB202, SM100), B100/B200/B300/GB200 (SM100), H100/H200 (SM90) y DGX Spark (GB10, SM121).
- No cabe en GPUs de consumo de 24-48 GiB (RTX 4090, RTX 5090, etc.) en esta cuantizacion.
- Despliegue: exclusivamente vLLM, usando la imagen `ghcr.io/swiss-ai/vllm_apertus_1.5_release` o compilando desde el PR upstream #50496. SGLang no soporta checkpoints compressed-tensors. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~20 TPS de decodificacion y ~2500 TPS de prefill en RTX PRO 6000 Blackwell. El checkpoint NVFP4 del mismo modelo base alcanza ~31 TPS de decodificacion por su menor ancho de banda de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Calidad MMLU | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| Apertus-v1.5-70B-FP8 (este) | 72,0B | no disponible (~60k estimado en 96 GiB) | FP8_DYNAMIC | 0.7205 | Apache 2.0 | vLLM (imagen especifica) |
| Apertus-v1.5-70B (BF16 original) | 72,0B | no disponible | BF16 | baseline | Apache 2.0 | vLLM con soporte Apertus1p5 |
| Apertus-v1.5-70B-NVFP4 (onprem-ai) | 72,0B | no disponible | NVFP4 | baseline -0,8 puntos | Apache 2.0 | vLLM; ~31 TPS decode |

No se dispone de datos de benchmarks comparativos con otros modelos multimodales de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Solo funciona en vLLM; SGLang no soporta checkpoints compressed-tensors.
- Requiere una version de vLLM con soporte de la arquitectura Apertus1p5 (imagen `ghcr.io/swiss-ai/vllm_apertus_1.5_release` o PR #50496); las releases nativas de vLLM pueden no incluirlo.
- Requiere 96 GiB de GPU para multimodal completo; en GPUs de 80 GiB solo es viable con texto y contexto corto.
- El checkpoint es una cuantizacion de terceros (atrezonator), no una publicacion oficial de Swiss AI; la calidad y el mantenimiento dependen del autor del derivado.
- La cuantizacion FP8_DYNAMIC no incluye calibracion; aunque el autor reporta perdida indistinguible en MMLU con 100 muestras, no se han publicado evaluaciones mas amplias ni de tareas multimodales.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion especifico, idiomas soportados ni limitaciones de contexto del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base original y las atribuciones de componentes de terceros (Emu3.5, WavTokenizer).
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria independiente.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/atrezonator/Apertus-v1.5-70B-FP8
- Modelo base: https://huggingface.co/swiss-ai/Apertus-v1.5-70B
- Checkpoint NVFP4 alternativo: https://huggingface.co/onprem-ai/Apertus-v1.5-70B-NVFP4
- Swiss AI en Hugging Face: https://huggingface.co/swiss-ai
- Imagen de vLLM para Apertus 1.5: https://github.com/swiss-ai/model-launch/pkgs/container/vllm_apertus_1.5_release
- Receta de build de la imagen: https://github.com/swiss-ai/model-launch/tree/main/images/vllm_apertus_1.5
- PR upstream de vLLM: https://github.com/vllm-project/vllm/pull/50496
- llm-compressor (Neural Magic): https://github.com/vllm-project/llm-compressor
- llmapibenchmark (onprem-ai): https://github.com/onpremai/llmapibenchmark
