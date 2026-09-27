# Prompt48/my-jev-4b

## Resumen

my-jev-4b es un ajuste fino (fine-tune) de Qwen/Qwen3.5-4B desarrollado por el usuario Prompt48 y publicado en HuggingFace bajo licencia Apache 2.0. No es un modelo generativo de proposito general: es un clasificador especializado de tipo "system one" que recibe un estado (`state`), una pregunta (`question`) y una lista cerrada de opciones (`options`), y devuelve exactamente una letra correspondiente a la opcion elegida. Su funcion es resolver tareas de decision y clasificacion en un solo paso, sin cadena de razonamiento.

El modelo tiene 4.659.865.088 parametros (unos 4,66 mil millones) y un repositorio de 9,3 GB en safetensors. Se entreno con Unsloth mediante LoRA (r=8, alpha=16) sobre el dataset abierto "new-v1" del proyecto tev1, compuesto por 37.840 ejemplos, en una unica epoca que consumio 282,2 minutos en una NVIDIA A40. Los datos de entrenamiento derivan de MultiNLI, BoolQ, Banking77, AG News y SST-5, mas tareas sinteticas de politica, enrutamiento y taxonomia de investigacion.

Su relevancia practica esta en el nicho: ofrece una mejora muy grande frente al modelo base en tareas de decision con opciones (87,2 % de exactitud frente al 72,6 % del base en el conjunto de desarrollo de 594 ejemplos), con un coste de inferencia minimo al generar un solo token. Es util como componente de enrutamiento o clasificacion dentro de pipelines de agentes, no como modelo conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia Qwen3.5 (modelo base Qwen/Qwen3.5-4B); detalles internos no disponibles |
| Parametros totales | 4.659.865.088 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el ejemplo de despliegue usa `--max-model-len 4096` |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | No disponible; los datasets de entrenamiento citados (MultiNLI, BoolQ, Banking77, AG News, SST-5) son mayoritariamente en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder de 4,66 mil millones de parametros, y se adapta mediante LoRA con rango r=8, alpha=16, learning rate 5e-05, scheduler coseno, 1 epoca, batch de 8 y funcion de perdida restringida a los tokens de completion (completion-only loss). El entrenamiento se ejecuto con Unsloth y consumio 282,2 minutos en una NVIDIA A40 sobre 37.840 ejemplos del dataset "new-v1" del proyecto tev1. No se documenta ningun proceso de RLHF, DPO ni decodificacion especulativa.

La innovacion tecnica no esta en la arquitectura sino en el formato de tarea: el modelo se ha entrenado para emitir una unica letra como respuesta a una tarea estructurada en JSON, y se espera que se use con `temperature=0`, `max_tokens=1` y `enable_thinking=False`. Al leer los logprobs de ese unico token se puede reconstruir una distribucion de probabilidad normalizada sobre las etiquetas disponibles, lo que convierte al modelo en un clasificador con puntuaciones de confianza, no solo en un selector discreto. El conjunto de datos combina tareas de clasificacion de intenciones, inferencia de lenguaje natural, respuesta booleana, sentimiento de cinco clases y taxonomias sinteticas de politica y enrutamiento.

## Capacidades

- Clasificacion con opciones cerradas: dado un estado, una pregunta y una lista de opciones etiquetadas, devuelve la etiqueta correcta como una letra unica.
- Clasificacion de intenciones en dominios de atencion al cliente (entrenado con Banking77).
- Inferencia de lenguaje natural y deteccion de relaciones entre frases (entrenado con MultiNLI).
- Preguntas de respuesta booleana (entrenado con BoolQ).
- Clasificacion de temas de noticias (entrenado con AG News).
- Analisis de sentimiento en cinco clases (entrenado con SST-5).
- Tareas sinteticas de decision: enrutamiento entre opciones, cumplimiento de politicas y taxonomia de investigacion.
- Estimacion de confianza por etiqueta: exponiendo `logprobs` con `top_logprobs` alto se obtiene una distribucion normalizada sobre las etiquetas.
- Salida controlada: con `enable_thinking=False` y `max_tokens=1` la respuesta es determinista en formato.
- Soporte de tool calling, agentes multi-paso, vision o audio: no documentado en la informacion proporcionada. El tag `image-text-to-text` aparece en los metadatos heredados del modelo base, pero no se reporta ninguna capacidad ni evaluacion multimodal para este fine-tune.
- Capacidades multilingues: no documentadas.

## Casos de uso

- Clasificacion de intenciones en atencion al cliente: el modelo recibe el mensaje del cliente como `state` y una lista de intenciones candidatas como `options`, y devuelve la mas probable. En el conjunto de evaluacion alcanza el 84,9 % en las tareas tipo Banking77, muy por encima del modelo base (83,3 %).
- Enrutamiento de consultas en sistemas multi-agente: las tareas sinteticas de enrutamiento pasan del 54,5 % del base al 87,9 %, lo que lo hace viable como router que decide que herramienta, agente o cola debe atender una peticion.
- Triaje y cumplimiento de politicas internas: en las tareas de politica sintetica el salto es del 80,3 % al 98,5 % (policy) y del 53,0 % al 95,5 % (policy_v2), por lo que es adecuado para decidir si un caso cumple una politica o a que categoria normativa pertenece.
- Etiquetado de corpus para investigacion: con el 100 % de exactitud en la taxonomia de investigacion `research_taxonomy_v21`, puede usarse para clasificar documentos o notas en una taxonomia predefinida de forma automatizada.
- Verificacion de afirmaciones y control de calidad de datos: con el 93,9 % en tareas tipo BoolQ, sirve para responder preguntas de si/no sobre un texto, por ejemplo para validar si un pasaje respalda una afirmacion.
- Moderacion y deduplicacion de contenido: usando MultiNLI (81,8 %) permite detectar contradicciones o equivalencias entre dos textos, util en pipelines de limpieza de datos o deteccion de duplicados semanticos.
- Analisis de sentimiento en encuestas y resenas: aunque es su punto mas debil (54,5 % en SST-5 frente al 39,4 % del base), sigue siendo mejor que el base y puede combinarse con umbrales de confianza para derivar casos dudosos a revision humana.
- Clasificacion de actualidad y agregacion de noticias: con el 87,9 % en tareas tipo AG News, puede etiquetar articulos por tema dentro de un pipeline de ingestion.
- Filtro previo de bajo coste en cadenas de agentes: al generar un unico token, el coste por decision es minimo, por lo que encaja como primera etapa ("system one") que descarta opciones antes de invocar un modelo mayor con razonamiento.

## Benchmarks y rendimiento

Resultados sobre el conjunto de desarrollo reservado (594 ejemplos, estratificado por fuente), reportados por el autor:

| Modelo | Accuracy | Brier | ECE |
|---|---:|---:|---:|
| Qwen3.5-4B (base) | 72,6 % | 0,372 | 0,038 |
| my-jev-4b | 87,2 % | 0,169 | 0,048 |

Desglose por fuente:

| Fuente | Base | Fine-tuned |
|---|---:|---:|
| ag_news | 86,4 % | 87,9 % |
| banking77 | 83,3 % | 84,9 % |
| boolq | 86,4 % | 93,9 % |
| mnli | 75,8 % | 81,8 % |
| policy | 80,3 % | 98,5 % |
| policy_v2 | 53,0 % | 95,5 % |
| research_taxonomy_v21 | 93,9 % | 100,0 % |
| routing_v2 | 54,5 % | 87,9 % |
| sst5 | 39,4 % | 54,5 % |

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 9,3 GB en safetensors, coherente con pesos en bf16/fp16 para 4,66 mil millones de parametros. Se necesitan aproximadamente 10-11 GB de VRAM en bf16 contando pesos y cache KV; en cuantizacion de 8 bits rondaria los 5-6 GB y en 4 bits los 3-4 GB (estimaciones derivadas del numero de parametros, no publicadas por el autor).
- GPU recomendadas: el autor entreno en NVIDIA A40. Para inferencia, cualquier GPU con 12 GB o mas de VRAM es suficiente en bf16 (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, L40S, A100, H100).
- Cabe en GPU de consumo: si, en tarjetas de 12 GB o mas en bf16 y en tarjetas de 8 GB o menos si se cuantiza a 4 u 8 bits.
- Opciones de despliegue: vLLM es la opcion documentada por el autor (`vllm serve Prompt48/my-jev-4b --served-model-name my-jev --max-model-len 4096`), con API compatible con OpenAI y soporte de `logprobs`. Al ser un modelo transformers con pesos safetensors, tambien es desplegable con TGI, y con llama.cpp u Ollama si se convierte a GGUF (conversion no publicada por el autor).
- Latencia y throughput: no disponibles. El uso previsto genera un unico token por peticion con `temperature=0` y `max_tokens=1`, lo que reduce el coste de decodificacion al minimo, pero no se han publicado mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (dev, 594 ej.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| my-jev-4b | 4,66 B | no disponible | 87,2 % | apache-2.0 | HuggingFace (transformers, safetensors) |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible | 72,6 % | no indicada en la informacion disponible | HuggingFace |
| Otros clasificadores "jev" comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

El modelo base Qwen3.5-4B es la unica referencia cuantitativa directa disponible. No se dispone de datos de otros clasificadores de decision del mismo tamano en la informacion proporcionada, por lo que la comparativa con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- Modelo de tarea unica: no esta pensado para generacion abierta ni conversacion. Usarlo fuera del formato entrenado (system prompt exacto, mensaje de usuario en JSON, `temperature=0`, `enable_thinking=False`) degrada la calidad de forma no medida.
- Sensibilidad al formato: la model card insiste en usar exactamente el system prompt indicado, el `state` como JSON y una unica letra como salida. Cualquier variacion de plantilla puede alterar los resultados.
- Riesgo de inyeccion de prompt: la propia model card advierte de tratar el contenido de `state` como datos y no como instrucciones, lo que implica que el modelo puede ser vulnerable a instrucciones maliciosas embebidas en el texto de entrada.
- Calibracion: el ECE empeora ligeramente respecto al base (0,048 frente a 0,038), por lo que las probabilidades derivadas de los logprobs no deben tratarse como calibradas sin recalibracion adicional. El Brier, en cambio, mejora notablemente (0,169 frente a 0,372).
- Rendimiento desigual por tarea: en SST-5 solo alcanza el 54,5 % de exactitud, insuficiente para produccion sin revision humana; en mnli (81,8 %) y banking77 (84,9 %) las ganancias son moderadas.
- Idiomas: no se documentan los idiomas soportados y los conjuntos de entrenamiento son mayoritariamente en ingles, por lo que el rendimiento en castellano es desconocido y probablemente inferior.
- Licencias de los datos: el entrenamiento deriva de MultiNLI, BoolQ, Banking77, AG News y SST-5, cada uno con su propia licencia. La model card recomienda comprobar la licencia de cada fuente antes de un uso comercial, aunque los pesos se publiquen como apache-2.0.
- Contexto: se desconoce la longitud de contexto efectiva del fine-tune; el ejemplo de despliegue limita a 4096 tokens con `--max-model-len 4096`.
- Adopcion nula: el repositorio registra 0 descargas y 0 "likes", por lo que no existe validacion independiente de los resultados reportados por el autor.
- Riesgo de alucinacion: al restringirse a elegir entre opciones cerradas, el modo de fallo tipico no es inventar contenido, sino seleccionar la etiqueta incorrecta, especialmente fuera de la distribucion de las tareas de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Prompt48/my-jev-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset tev1 "new-v1": https://github.com/togethercomputer/tev1
- Unsloth: https://github.com/unslothai/unsloth
