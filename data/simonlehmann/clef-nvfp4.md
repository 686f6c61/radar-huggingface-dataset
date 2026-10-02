# simonlehmann/clef-NVFP4

## Resumen

Clef-NVFP4 es una cuantizacion mixta NVFP4/FP8, no oficial, del modelo multimodal Cloudflare/clef, publicada por el usuario simonlehmann. El modelo base es un modelo de decision multimodal de 27B (segun la model card) construido sobre la arquitectura Qwen3.5; su particularidad es que no genera texto libre, sino que responde preguntas tipadas sobre un estado de entrada (texto, JSON, imagenes o video) devolviendo una probabilidad por cada opcion permitida en una sola pasada de prefill. El valor del modelo esta en esas probabilidades, por lo que esta cuantizacion se valido opcion por opcion contra la version BF16, no solo en exactitud agregada.

El checkpoint pesa 23 GB en disco frente a los 55 GB de la version BF16, y ocupa 20,2 GiB de pesos en vLLM. La receta mezcla capas MLP en NVFP4 (W4A4, grupo 16), proyecciones de atencion y las ocho ultimas capas MLP en FP8, y deja en BF16 el codificador de vision, los embeddings, las normas, el `lm_head` y la cabeza conjunta de esquema. El numero total de parametros reportado por los safetensors es de 19.869.895.920 (~19,87 B), cifra que no coincide con la denominacion "27B" que usa la model card del autor.

Es relevante ahora porque demuestra que un modelo de decision multimodal puede cuantizarse a FP4 con una deriva minima en la distribucion de probabilidades (acuerdo del 96,7-98,5% con BF16 segun el conjunto de evaluacion), y porque habilita despliegues de baja latencia en GPUs Blackwell mediante kernels reales de FP4 en vLLM. La contrapartida es que exige hardware Blackwell, codigo custom y una comprobacion cuidadosa de licencia y procedencia al tratarse de una cuantizacion de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido basado en Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con capas de atencion completa y capas de atencion lineal; 64 capas con MLP `gate/up/down_proj`; incluye codificador de vision y una cabeza conjunta de esquema (`joint_head`) |
| Parametros totales | 19.869.895.920 (~19,87 B) segun safetensors; la model card describe el modelo base como "27B multimodal" |
| Parametros activos | no disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso con vLLM configura `max_model_len=16384`) |
| Tipos de cuantizacion | NVFP4 W4A4, grupo 16, escalas FP8 y escala de activacion global estatica (MLP `gate/up/down_proj`, capas 0-55); FP8 con pesos por canal y activaciones dinamicas por token (MLP capas 56-63 y proyecciones `q/k/v/o_proj` de atencion completa e `in_proj_qkv/in_proj_z/out_proj` de atencion lineal); BF16 sin cuantizar (`in_proj_a/in_proj_b`, normas, conv, embeddings, codificador de vision, `lm_head` y cabeza conjunta) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con `compressed-tensors` (generado con llm-compressor); incluye `joint_head.safetensors` en BF16 y `recipe.yaml` con la receta exacta; requiere codigo custom (`clef_vllm.py`, `joint_schema_model.py`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3.5, en una configuracion hibrida que combina capas de atencion completa con capas de atencion lineal, mas un codificador de vision para entradas de imagen y video. Sobre ese backbone, Clef anade una cabeza conjunta de esquema (`joint_head.safetensors`) que lee directamente las filas del `lm_head` como embeddings de opcion: en lugar de generar tokens, el modelo produce una probabilidad por cada opcion permitida de cada pregunta en una unica pasada de prefill. Los tipos de pregunta documentados son `choice`, `score` y `noul`.

El proceso de cuantizacion es una modificacion de la receta comunitaria para Qwen3.8-27B con un cambio: el `lm_head` se mantiene en BF16. Las ocho ultimas capas MLP se dejan en FP8 de forma deliberada, porque al comparar la version original con Qwen/Qwen3.8-27B el codificador de vision y las capas tempranas son identicas byte a byte, y el post-entrenamiento de Clef reside en las capas superiores. El metodo empleado es `QuantizationModifier` de llm-compressor con redondeo al vecino mas cercano (round-to-nearest), sin GPTQ, calibrado sobre 374 registros en formato Clef: 128 preguntas de intencion BANKING77 (esquemas de 77 y 10 vias), 150 registros de estado de agente de juego con pregunta `choice` y 96 fotos de Flickr30k con preguntas `noul`/`choice`/`score`. Los registros de calibracion y de evaluacion son disjuntos. No se documentan datos de RLHF, DPO ni el volumen de tokens de entrenamiento del modelo base.

## Capacidades

- Decision y clasificacion con salida probabilistica: devuelve una probabilidad por opcion permitida, no texto libre, en una sola pasada de prefill.
- Preguntas tipadas: soporta al menos los tipos `choice` (eleccion entre opciones), `score` (puntuacion sobre criterios ordenados) y `noul` (pregunta booleana).
- Entrada multimodal: acepta estado en texto, JSON, imagenes y video; el codificador de vision se mantiene en BF16.
- Imagenes y video por peticion: los parametros `max_images` y `max_videos` del constructor de vLLM fijan los limites de medios por peticion (por defecto, 1 imagen).
- Procesamiento por lotes: el metodo `probabilities([record, ...])` permite pasar multiples registros, imagenes PIL incluidas, en batch a traves de vLLM.
- Salida estructurada: API `systemone` con esquema de preguntas, criterios y opciones; pensada para integrarse en flujos de clasificacion y enrutado.
- Clasificacion multietiqueta por diseno: cada pregunta se responde de forma independiente dentro de la misma peticion.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Enrutado de tickets de soporte: el modelo responde en una sola pasada preguntas como "que equipo debe gestionar el mensaje" (`choice`), "urgencia" (`score`) y "hay un servicio caido" (`noul`). En el ejemplo de la model card se aplica a un mensaje de errores en el checkout con 177 ms de latencia para 288 tokens de entrada.
- Clasificacion de intenciones bancarias a gran escala: sobre BANKING77 con esquema completo de 77 vias alcanza un 94,50% de exactitud en NVFP4 (frente a 94,25% en BF16) con 705 ms por registro de 1834 tokens, lo que permite clasificar conversaciones de banca con etiquetas finas.
- Triage con umbrales calibrados: al devolver distribuciones de probabilidad, se puede fijar un umbral de confianza y derivar los casos dudosos a revision humana en lugar de forzar una etiqueta, usando la distancia TV frente a BF16 como referencia de estabilidad.
- Extraccion de decisiones sobre documentos e imagenes: con preguntas `noul` y `score` sobre fotos, el modelo evalua atributos concretos de una imagen (el caso documentado usa 96 fotos de Flickr30k y 256 preguntas mixtas en evaluacion).
- Etiquetado masivo de conjuntos de datos visuales: el batching via `probabilities()` permite procesar lotes de imagenes PIL por peticion, adecuado para anotacion asistida o filtrado previo a entrenamiento.
- Agentes de juego y simulacion: sobre estados de agente con preguntas `choice` de 2 a 4 opciones, el modelo puntua cada accion candidata; util como politica de decision o como evaluador offline de trayectorias.
- Enrutado y guardarrailes en pipelines de agentes: dado un estado en JSON, decide de forma determinista entre rutas permitidas antes de invocar herramientas externas, con el coste de un unico prefill.
- Analisis de facturas y documentos estructurados: el ejemplo del README con dos preguntas sobre una factura muestra una deriva de 0,0007 en TV y un 100% de acuerdo con BF16, lo que respalda su uso en extraccion de campos con validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor publica una evaluacion de deriva frente a la version BF16, ejecutada sobre los mismos 615 registros con los kernels reales NVFP4/FP8 de vLLM (FlashInfer CUTLASS FP4 GEMM). `agreement` es el porcentaje de preguntas cuya opcion top coincide con BF16; `TV` es la distancia de variacion total media entre distribuciones (0 = identicas, 1 = disjuntas):

| Conjunto de evaluacion | Preguntas | Agreement | TV media | Exactitud BF16 -> NVFP4 |
|---|---:|---:|---:|---|
| BANKING77 test, esquema completo de 77 vias | 400 | 98,5% | 0,019 | 94,25% -> 94,50% |
| Fotos Flickr30k, 4 preguntas mixtas cada una | 256 | 96,9% | 0,017 | (sin etiquetas) |
| Estados de agente de juego, `choice` de 2-4 opciones | 150 | 96,7% | 0,047 | 68,7% -> 67,3% * |
| Ejemplo de factura del README | 2 | 100% | 0,0007 | - |

\* La exactitud de esta fila se calcula contra etiquetas sinteticas que el propio modelo BF16 solo acierta el 69% de las veces; el autor recomienda leer la columna de agreement, no la de exactitud.

Los desacuerdos se concentran en empates tecnicos: en la ejecucion de calibracion (cuantizacion simulada), las 15 preguntas que cambiaron de opcion tenian un margen mediano entre top-1 y top-2 en BF16 de 0,13 (11 de 15 por debajo de 0,2), frente a 0,95 en las preguntas que coincidieron.

## Requisitos de hardware

- La ruta NVFP4 exige una GPU Blackwell para usar kernels reales de FP4; segun el autor, el script `clef_vllm.py` necesita una GPU Blackwell y una build de vLLM con `Qwen3_5ForConditionalGeneration` (probado con 0.23.1 nightly).
- Peso en disco: 23 GB de checkpoint (frente a 55 GB de la version BF16). En vLLM, 20,2 GiB de pesos.
- La ruta de transformers no puede ejecutar las capas mixtas NVFP4/FP8 comprimidas: hay que cargar con `run_compressed=False`, lo que descomprime a BF16 en tiempo de carga y requiere unos 57 GB de memoria de GPU, sin ninguna ganancia de velocidad. Es util para verificar salidas, no para ahorrar memoria.
- Latencia medida en un NVIDIA DGX Spark (GB10, 273 GB/s de memoria unificada), vLLM 0.23.1 con CUDA graphs activados y lote de 1: 177 ms para un estado de texto de 288 tokens y 1 pregunta; 257 ms para una imagen de 640 px y 4 preguntas (621 tokens); 705 ms para BANKING77 con 77 opciones (1834 tokens). La cabeza conjunta aporta solo 3-6 ms de ese total.
- El suelo de latencia en ese equipo (~170 ms) lo fija la lectura de los pesos una vez por pasada; el autor indica que GPUs con mas ancho de banda de memoria deberian ser considerablemente mas rapidas, pero no aporta mediciones.
- Cabe en GPU de consumo: no disponible. No se documentan pruebas en tarjetas consumer; la unica medicion publicada es sobre GB10. La exigencia de arquitectura Blackwell limita la ruta cuantizada a esa generacion.
- Opciones de despliegue: vLLM 0.23.1 (o nightly) como modelo de pooling mas la cabeza conjunta en el mismo proceso, mediante `clef_vllm.py`; transformers con `run_compressed=False` y `joint_schema_model.load_release_model` solo como compatibilidad. No se documenta soporte para llama.cpp, Ollama, TGI ni formato GGUF.
- Throughput: no disponible; las unicas cifras publicadas son latencias con lote de 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| simonlehmann/clef-NVFP4 | ~19,87 B (safetensors) | no disponible | 94,50% en BANKING77 77 vias; 96,7-98,5% de acuerdo con BF16 | apache-2.0 | HuggingFace, requiere codigo custom y GPU Blackwell |
| Cloudflare/clef (BF16) | descrito como 27B en la model card | no disponible | 94,25% en BANKING77 77 vias; referencia de la cuantizacion | apache-2.0 (heredada) | HuggingFace, 55 GB en disco |
| Qwen/Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | HuggingFace; se cita como referencia en la receta de cuantizacion, ya que el codificador de vision y las capas tempranas de Clef son identicas byte a byte |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la informacion proporcionada. La comparacion mas fiable es la de deriva BF16 frente a NVFP4 incluida en la seccion anterior, que usa los mismos registros y los mismos kernels.

## Limitaciones y advertencias

- Cuantizacion no oficial: el autor indica explicitamente que no esta afiliada ni respaldada por Cloudflare. Para uso en produccion conviene partir del modelo base original y reproducir la receta.
- Deriva en las probabilidades: aunque el acuerdo con BF16 es alto, existe entre un 1,5% y un 3,3% de preguntas cuya opcion top cambia. Los cambios se concentran en empates tecnicos (margen mediano top-1/top-2 de 0,13 en BF16), por lo que los umbrales de decision deben recalibrarse si el flujo depende de margenes estrechos.
- Exactitud en el conjunto de agente de juego: el 67,3% reportado se mide contra etiquetas sinteticas que el propio BF16 solo reproduce en un 69% de los casos; esa cifra no debe interpretarse como calidad real del modelo.
- Dependencia de hardware: la ruta cuantizada requiere una GPU Blackwell. En hardware anterior solo se puede usar la descompresion a BF16, que consume unos 57 GB de memoria de GPU y no aporta mejora de velocidad.
- Requiere codigo custom: el uso implica cargar `clef_vllm.py` o `joint_schema_model.py` y una build concreta de vLLM, lo que complica el versionado y el mantenimiento en produccion.
- Formato de salida restringido: el modelo devuelve probabilidades sobre opciones predefinidas, no texto generado; no sirve para tareas generativas abiertas.
- Idiomas soportados: no disponibles. No hay evaluacion multilingue publicada, y toda la calibracion se hizo con conjuntos en ingles (BANKING77, Flickr30k y registros de juego).
- Longitud de contexto: no documentada. El unico dato es el valor de 16384 configurado en el ejemplo de uso, que no debe tomarse como el maximo del modelo.
- Riesgo de alucinacion: no evaluado como tal, pero al tratarse de un modelo de decision, el fallo se manifiesta como una distribucion de probabilidad mal calibrada y no como texto inventado; no se aportan curvas de calibracion.
- Sesgos conocidos: no disponible. No se han publicado analisis de sesgo sobre el modelo base ni sobre esta cuantizacion.
- Adopcion incipiente: 0 descargas y 2 likes en el momento del analisis, creado y actualizado el 1 de octubre de 2026, lo que limita la validacion por parte de terceros.
- Discrepancia de parametros: la model card describe un modelo "27B" mientras que los safetensors declaran 19.869.895.920 parametros; conviene verificar las cifras antes de dimensionar infraestructura.
- La model card proporcionada esta truncada en la seccion de uso con transformers, por lo que parte de las instrucciones de carga no estan disponibles.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/simonlehmann/clef-NVFP4
- Modelo base: https://huggingface.co/Cloudflare/clef
- Modelo de referencia de la receta de cuantizacion: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado enlaces adicionales relevantes en la busqueda web; los resultados devueltos no guardan relacion con el modelo.
