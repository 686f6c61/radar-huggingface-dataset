# igorls/Qwen3.8-27B-Uncensored-NVFP4-NInfer

## Resumen

Qwen3.8-27B-Uncensored-NVFP4-NInfer es un artefacto de inferencia publicado por el usuario igorls que empaqueta, en formato nativo `.ninfer`, una conversion del checkpoint abliterado orcarouter/Qwen3.8-27B-Uncensored-NVFP4 junto con el companero de decodificacion especulativa incoai/Qwen3.8-27B-DFlash2. No es un modelo entrenado desde cero ni un ajuste adicional: el autor indica explicitamente que se preservan los embeddings de tokens y la cabeza de salida originales en BF16 y que no se realizo ningun procedimiento adicional de eliminacion de rechazos ni de fine-tuning para esta conversion.

El modelo esta pensado para ejecutarse exclusivamente con el fork NInfer de igorls (revision `91ce2f2c73c27ffbff3bd7c43a319f295e9597cc`), un motor que carga el formato `.ninfer` y que no es compatible con Transformers, vLLM, Ollama ni llama.cpp. El artefacto integra el modelo objetivo, los componentes de vision y MTP, una cabeza de propuesta optimizada, el companero DFlash2 y los recursos de tokenizador, plantilla y medios, de modo que no hace falta descargar el checkpoint fuente por separado.

La relevancia actual del artefacto es de nicho: demuestra un flujo completo de cuantizacion mixta NVFP4/FP8 con decodificacion especulativa sobre GPU Blackwell (objetivo CUDA `sm_120a`), validado en una RTX PRO 6000 Blackwell Workstation Edition de 96 GB bajo Windows. Su licencia Apache 2.0 y su naturaleza abliterada lo orientan a experimentacion e investigacion, con un soporte de hardware y sistema operativo muy restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no especificada en la model card; derivado de la familia Qwen3.8, con componentes Vision y MTP) |
| Parametros totales | 27B nominales (segun la denominacion Qwen3.8-27B); recuento exacto no disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 32.768 tokens por peticion en la configuracion de ejemplo (`--max-context 32768`); pool KV de 65.536 tokens compartido entre peticiones; maximo del modelo no disponible |
| Tipos de cuantizacion | Pesos mixtos NVFP4/FP8; embeddings de tokens y cabeza de salida en BF16; cache KV en FP8 (`--kv-dtype fp8`); existe una variante de cabeza de propuesta en BF16 completo para DFlash2 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | `.ninfer` (artefacto nativo del motor NInfer); no compatible con safetensors, GGUF, vLLM, Ollama ni llama.cpp |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base mas alla de su pertenencia a la familia Qwen3.8 y de la presencia de componentes diferenciados: un modulo de Vision para entrada de imagen y video, un modulo MTP (multi-token prediction) y una cabeza de propuesta optimizada para decodificacion especulativa. El artefacto pesa 26.268.462.848 bytes (26,27 GB / 24,46 GiB) y su identidad de motor es `qwen3.8-27b-orcarouter/nvfp4`. Al tratarse de una conversion cuantizada, el pipeline declarado en HuggingFace es `image-text-to-text`, lo que confirma la capacidad multimodal texto-imagen.

En cuanto al entrenamiento, la informacion disponible solo indica que OrcaRouter produjo el modelo abliterado y sus pesos mixtos NVFP4/FP8, y que este release se limita a empaquetar esos pesos para NInfer conservando los embeddings y la cabeza de salida en BF16. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, ni sobre si hubo RLHF o DPO en el modelo original. La innovacion tecnica destacable de este artefacto es la integracion de dos rutas de decodificacion especulativa (MTP con `--draft-tokens 5` y DFlash2 con `--draft-tokens 7`) sobre pesos de 4 y 8 bits, con verificacion de los tokens propuestos por parte del modelo objetivo.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con plantilla de chat propia incluida en el artefacto.
- Comprension de imagen y video: el pipeline es `image-text-to-text` y el artefacto contiene los componentes de vision; requiere compilar con `NINFER_BUILD_MEDIA=ON` y arrancar con `--vision`.
- Salida estructurada: la validacion de integracion incluye comprobacion de salida con JSON Schema.
- Streaming mediante SSE y reutilizacion de continuaciones a traves de la API de tipo Responses.
- Control de esfuerzo de razonamiento por peticion mediante el parametro `reasoning_effort` (el ejemplo de la model card usa `"none"`).
- Decodificacion especulativa con dos backends (MTP y DFlash2) y cabeza de propuesta optimizada, orientada a reducir latencia.
- Servicio concurrente: la configuracion de ejemplo admite hasta 4 peticiones simultaneas compartiendo un pool KV de 65.536 tokens.
- Comportamiento abliterated: el modelo base ha sido sometido a un proceso de eliminacion de rechazos por parte de OrcaRouter, lo que modifica su comportamiento por defecto ante peticiones sensibles.
- No documentado: no se indica soporte de tool calling ni de function calling, ni capacidades de audio.

## Casos de uso

- Atencion al cliente automatizada en ingles o chino: con 32.768 tokens de contexto por peticion y un pool KV compartido de 65.536 tokens, el modelo puede mantener conversaciones multi-turno largas y atender hasta 4 peticiones concurrentes en una sola estacion de trabajo.
- Asistente de programacion en produccion local: la medicion publicada sobre un prompt de reparacion de codigo Python (cola con `asyncio.Queue`) alcanza 208,8 tok/s con DFlash2 K=7, lo que permite integrarlo en un bucle de edicion interactiva con latencia baja.
- Comprension de documentos con imagenes: gracias al componente de vision y al pipeline `image-text-to-text`, se puede usar para extraer informacion de capturas de pantalla, diagramas o documentos escaneados, activando `--vision` y compilando con soporte multimedia.
- Generacion de datos sinteticos y etiquetado estructurado: la salida validada con JSON Schema permite usarlo como anotador automatico que devuelve campos tipados consumibles por un pipeline posterior.
- Investigacion en seguridad y alineacion: al ser una variante abliterated, sirve para estudiar diferencias de comportamiento respecto al modelo original en tareas de rechazo, sesgo y robustez, siempre que se documente la procedencia del checkpoint.
- Prototipado en estacion de trabajo Windows con GPU Blackwell: el flujo cualificado (Visual Studio 2026, CUDA 13.3, `ninfer-serve` y `ninfer-supervisor` con panel que expone decodificacion ordinaria, MTP y DFlash2) permite validar aplicaciones antes de portarlas a otros entornos.
- Procesamiento por lotes de texto largo: con 2.048 tokens de chunk de prefill y contexto de 32K por peticion, es adecuado para resumir o analizar documentos extensos en un equipo unico.
- Servicio compatible con OpenAI: al exponer `/v1/chat/completions`, se puede insertar en herramientas existentes que ya hablan ese protocolo sin reescribir el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta mediciones de velocidad de generacion sobre un unico prompt de 169 tokens (reparacion de una cola en Python), que se recogen en la seccion de requisitos de hardware. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion de calidad, ni comparaciones numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada: no disponible como cifra cerrada. El autor advierte explicitamente que el tamano en disco (26,27 GB) no equivale al uso total de VRAM, ya que las funciones habilitadas, los grafos CUDA, la concurrencia y las caches de contexto requieren memoria adicional.
- GPU cualificada: RTX PRO 6000 Blackwell Workstation Edition con 96 GB, bajo Windows. Es el unico hardware declarado como validado.
- Objetivo CUDA: `sm_120a` (Blackwell). El autor indica que las GPU mas pequenas y la operacion a contexto maximo no han sido cualificadas para este release.
- Cabe en GPU de consumo: no disponible; no se ha cualificado ningun modelo de consumo.
- Cadena de herramientas: Visual Studio 2026 y CUDA 13.3, compilando el fork NInfer en `x64` con `-DNINFER_BUILD_MEDIA=OFF` para texto y `NINFER_BUILD_MEDIA=ON` (con FFmpeg y libcurl) para imagen y video.
- Opciones de despliegue: unicamente `ninfer-serve` y `ninfer-supervisor` del fork NInfer. Transformers, vLLM, Ollama y llama.cpp no cargan el formato `.ninfer`.
- Parametros de servicio de ejemplo: `--max-context 32768 --kv-capacity 65536 --max-concurrency 4 --prefill-chunk 2048 --kv-dtype fp8 --desktop-reserve-gib 3`.
- Throughput medido (prompt unico de 169 tokens):

| Modo de decodificacion | Velocidad |
|---|---|
| Ordinaria | 70,8 tok/s |
| MTP, K=5, cabeza de propuesta optimizada | 196,0 tok/s |
| DFlash2, K=7, cabeza de propuesta optimizada | 208,8 tok/s |

- Advertencia del autor sobre decodificacion especulativa: el companero DFlash2 se entreno para el Qwen3.8-27B canonico y su tasa de aceptacion en este derivado depende de la carga de trabajo; distintas anchuras de verificacion seleccionan rutas de kernel en coma flotante distintas, por lo que no se garantiza una salida identica byte a byte respecto a la decodificacion ordinaria. La tasa de aceptacion no es una metrica de calidad de respuesta.
- Validacion declarada: tokenizacion especifica de la fuente, oraculos numericos BF16 independientes para Linear/LinearTopK, servicio ordinario/MTP/DFlash2, salida con JSON Schema, concurrencia de dos peticiones, comprobacion de lectura de imagen, streaming SSE y reutilizacion de continuaciones.

## Comparativa con modelos similares

No se dispone de informacion sobre alternativas equivalentes de terceros, por lo que la comparacion se limita a los artefactos citados en la propia model card.

| Modelo | Relacion | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| igorls/Qwen3.8-27B-Uncensored-NVFP4-NInfer | Artefacto .ninfer objeto de esta ficha | 27B nominales | 32K por peticion en la configuracion de ejemplo | 70,8 tok/s ordinario; 208,8 tok/s con DFlash2 K=7 | Apache 2.0 | Solo motor NInfer, Windows, `sm_120a` |
| orcarouter/Qwen3.8-27B-Uncensored-NVFP4 | Checkpoint fuente abliterado con pesos NVFP4/FP8 | no disponible | no disponible | no disponible | no disponible | no disponible |
| incoai/Qwen3.8-27B-DFlash2 | Companero de decodificacion especulativa, no un modelo independiente | no disponible | no disponible | Entrenado para el Qwen3.8-27B canonico | no disponible | Requiere integracion en NInfer para este artefacto |

Otros modelos comparables de la misma categoria: no disponible.

## Limitaciones y advertencias

- Compatibilidad de formato: el archivo `.ninfer` no se puede cargar con Transformers, vLLM, Ollama ni llama.cpp. Migrar a otro motor exige volver al checkpoint fuente o reconvertir.
- Dependencia de una revision concreta del fork NInfer (`91ce2f2c73c27ffbff3bd7c43a319f295e9597cc`); otras revisiones pueden no ser compatibles.
- Plataforma cualificada muy estrecha: Windows, Visual Studio 2026, CUDA 13.3 y GPU Blackwell con objetivo `sm_120a`. No se ha cualificado hardware menor ni el funcionamiento a contexto maximo.
- El tamano en disco no es el consumo de VRAM. Cualquier planificacion de capacidad debe anadir margen para grafos CUDA, concurrencia y caches de contexto.
- Modelo abliterated: el proceso de eliminacion de rechazos incrementa el riesgo de generar contenido inapropiado, danino o ilegal segun el contexto de uso. Requiere moderacion externa si se expone a usuarios finales.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad factual en la informacion disponible; debe asumirse el comportamiento tipico de un modelo de 27B sin datos de verificacion.
- Idiomas: solo ingles y chino declarados. El rendimiento en castellano u otras lenguas no esta documentado.
- Contexto limitado a 32K tokens por peticion en la configuracion de ejemplo, con un pool KV de 65K compartido entre un maximo de 4 peticiones; solicitudes mas largas o mayor concurrencia pueden degradar el servicio.
- Decodificacion especulativa no reproducible byte a byte respecto a la decodificacion ordinaria, segun advierte el propio autor; la tasa de aceptacion no mide calidad.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- Licencia Apache 2.0 en el artefacto, pero la model card no aclara la licencia de los checkpoints fuente (orcarouter/Qwen3.8-27B-Uncensored-NVFP4 e incoai/Qwen3.8-27B-DFlash2); conviene verificarla antes de un uso comercial.
- El artefacto tiene fecha de creacion y actualizacion del 12 de septiembre de 2026, con 0 descargas: cualquier problema de integracion detectado por terceros podria no estar documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/igorls/Qwen3.8-27B-Uncensored-NVFP4-NInfer
- Checkpoint fuente abliterado: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-NVFP4
- Companero de decodificacion especulativa: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Fork NInfer utilizado (revision fijada): https://github.com/igorls/ninfer/tree/91ce2f2c73c27ffbff3bd7c43a319f295e9597cc
- Instrucciones de compilacion en Windows: https://github.com/igorls/ninfer/blob/91ce2f2c73c27ffbff3bd7c43a319f295e9597cc/README.md#build-on-windows
- SHA-256 esperado del artefacto: `003f8c65175e262e66f83a803f7b1d286f7226ede0e672d3b3e5c4b6c75f3e7f`
- Archivos auxiliares del repositorio: `SHA256SUMS`, `artifact-manifest.json`, `qwen3_8_27b_orcarouter_nvfp4.ninfer.conversion.json`
