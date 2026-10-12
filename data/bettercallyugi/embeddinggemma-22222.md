# bettercallyugi/embeddinggemma-22222

## Resumen

EmbeddingGemma 2 es un modelo de embeddings multimodal desarrollado por Google DeepMind que proyecta entradas de texto (incluido codigo), imagenes, video y audio, asi como combinaciones de estas, en un unico espacio vectorial compartido de 768 dimensiones. Se presenta como la segunda generacion de la familia EmbeddingGemma y esta disenado para ejecutarse en hardware de consumo (moviles y portatiles), ofreciendo representaciones semanticas de baja latencia para busqueda, RAG, clasificacion y clustering. La ficha tecnica que nos ocupa, sin embargo, corresponde al repositorio `bettercallyugi/embeddinggemma-22222`, una resubida de terceros cuyo contenido de model card reproduce la descripcion oficial de Google.

El modelo combina un backbone de texto de 270M parametros (130M de transformer mas 140M de embedder) con encoders modulares cargables de forma selectiva: vision (170M) y audio (300M), sumando 744.371.512 parametros totales segun los pesos en safetensors del repositorio (1,5 GB). Soporta una ventana de contexto de 8.192 tokens y emplea Matryoshka Representation Learning (MRL) para permitir truncado nativo de los embeddings a 128, 256, 512 y 768 dimensiones, reduciendo hasta 6x el coste de almacenamiento vectorial.

Es relevante ahora porque cubre una carencia habitual en modelos de embeddings multilingues: la unificacion de cuatro modalidades en un solo espacio vectorial y con una huella lo bastante pequena como para desplegarse on-device. Ademas, declara soporte para mas de 100 idiomas y una mejora del ~14 % en tareas de codigo respecto a su predecesor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con GQA/MQA, gated FFN con GELU, mean pooling; proyeccion 512 a 768. Encoders modulares de vision y audio |
| Parametros totales | 744.371.512 (740M declarados en model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (sliding window de 1.024 tokens) |
| Tipos de cuantizacion | No especificados en la informacion disponible (los pesos distribuidos son safetensors en precision completa) |
| Idiomas soportados | Multilingue (mas de 100 idiomas declarados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Desglose de parametros: backbone de texto 130M + embedder 140M + encoder de vision 170M + encoder de audio 300M. Dimension del modelo 512, dimension oculta 2.048, 24 capas, 4 cabezas de atencion, 2 cabezas KV locales y 1 global (ratio local:global 5:1), vocabulario de 262.144 tokens, pooling por media.

## Arquitectura y entrenamiento

La arquitectura se describe como una evolucion de Gemma 4 y esta compuesta por un backbone de texto de tipo transformer (130M parametros) seguido de un embedder (140M) que proyecta la representacion interna de 512 dimensiones a un vector de 768 dimensiones. La atencion usa GQA/MQA con un esquema de ventana deslizante de 1.024 tokens y una combinacion de atencion local y global en proporcion 5:1, con 24 capas. La funcion de activacion es una FFN con gating y GELU, y el pooling empleado es mean pooling. Los encoders de modalidad son modulares y cargables de forma independiente: uno de vision de 170M y uno de audio de 300M, lo que permite desplegar solo las modalidades que interesen.

La model card declara un contexto de 8.192 tokens, capaz de procesar minutos de audio o video, y soporte nativo de Matryoshka Representation Learning, que permite truncar y renormalizar los embeddings a 128, 256, 512 y 768 dimensiones con impacto minimo en calidad hasta 256 dimensiones (128 dimensiones se recomienda solo para cargas de texto). El modelo incorpora ademas "task-steered representations", es decir, representaciones guiadas por prefijos de instruccion de texto ligeros para optimizar los embeddings segun la tarea (busqueda, clasificacion, clustering o similitud semantica). No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de embeddings de texto y codigo en un espacio comun de 768 dimensiones (multilingue, mas de 100 idiomas).
- Embeddings de imagenes, video y audio gracias a los encoders de modalidad de vision (170M) y audio (300M).
- Embeddings multimodales combinados (por ejemplo, texto junto a imagen) en el mismo espacio vectorial.
- Similitud semantica y sentence-similarity para tareas de recuperacion, agrupamiento y deduplicacion.
- Clasificacion y clustering de contenido textual y multimodal.
- Representaciones guiadas por tarea mediante prefijos de instruccion de texto para adecuar el embedding al caso de uso.
- Truncado nativo de embeddings via MRL (128d, 256d, 512d, 768d) para reducir coste de almacenamiento.
- Carga selectiva de modalidades: es posible cargar solo texto, o anadir vision y audio segun necesidad.
- Capacidad de procesar minutos de audio o video dentro de su ventana de 8.192 tokens.

No se especifica en la informacion disponible soporte de tool calling, function calling ni capacidades de agente o razonamiento multi-step (el modelo esta orientado a extraccion de features y embeddings, no a generacion de texto libre).

## Casos de uso

- Busqueda semantica multilingue: indexar documentos en mas de 100 idiomas en un unico espacio vectorial de 768 dimensiones, de modo que una consulta en un idioma recupere resultados en otro gracias a la representacion compartida.
- Retrieval-augmented generation (RAG): generar embeddings de pasajes y consultas para alimentar una base vectorial; el contexto de 8.192 tokens permite indexar fragmentos largos sin trocear en exceso, y el truncado MRL a 256d reduce el coste de almacenamiento sin perdida relevante de calidad.
- Busqueda multimodal en catalogo de productos: combinar embeddings de texto (descripciones) e imagenes (fotografias de producto) en el mismo espacio para permitir busquedas por texto que devuelvan imagenes relevantes y viceversa.
- Deduplicacion y clustering de contenido audiovisual: generar embeddings de audio o video para agrupar fragmentos similares, util en plataformas de medios que necesitan detectar duplicados o clasificar automaticamente grandes volumenes.
- Clasificacion de documentos con embeddings: usar las representaciones como entrada para un clasificador ligero en tareas de moderacion, enrutado o etiquetado, aprovechando el soporte de representaciones guiadas por tarea.
- Recuperacion de codigo: el modelo declara una mejora del ~14 % en tareas de codigo respecto a su predecesor (MTEB code 78,68), lo que lo hace util para busqueda semantica en repositorios de codigo o para asistentes de completado que recuperan fragmentos relevantes.
- Aplicaciones on-device: con solo 270M parametros en el backbone de texto, puede desplegarse en moviles y portatiles para busqueda local, protegiendo la privacidad al no requerir envio de datos a servidores externos.

## Benchmarks y rendimiento

Resultados declarados en la model card con el checkpoint en precision completa (768d):

| Modalidad | Benchmark | Metrica | EmbeddingGemma 2 | EmbeddingGemma 1 |
|---|---|---|---|---|
| Texto | MTEB (multilingual, v2) | Mean(Task), Multiple | 61,36 | 61,15 |
| Texto | MTEB (code, v1) | Mean(Task), NDCG@10 | 78,68 | 68,76 |
| Imagen | MIEB (lite) | Mean(TaskType), Multiple | 64,64 | - |
| Imagen | MMEB v2 (Image) | Mean(Task), Hit@1 | 57,28 | - |
| Imagen | MMEB v2 (VisDoc) | Mean(Task), NDCG@5 | 67,84 | - |
| Video | MMEB v2 (Video) | Mean(Task), Hit@1 | 50,67 | - |
| Audio | MSEB (Retrieval) | Mean(Task), MRR@10 | 69,54 | - |
| Audio | MAEB (Hugging Face) | Mean(Task), Multiple | 49,39 | - |

Resultados con truncado de vector (MRL):

| Dimension | Ratio de compresion | MTEB (multilingue v2) | MTEB (eng v2) | MTEB (code v1) | MIEB (lite) | MMEB v2 (overall) | MSEB (Retrieval) | MAEB |
|---|---|---|---|---|---|---|---|---|
| 768d (completo) | 1:1 | 61,36 | 68,46 | 78,68 | 64,64 | 59,01 | 69,54 | 49,39 |
| 512d | 1:1,5 | 61,17 | 68,41 | 77,24 | 64,32 | 58,38 | 69,18 | 49,21 |
| 256d | 1:3 | 60,41 | 67,78 | 76,18 | 63,13 | 56,24 | 66,76 | 48,91 |
| 128d | 1:6 | 57,89 | 65,68 | 71,41 | 59,06 | 45,65 | 56,71 | 46,92 |

## Requisitos de hardware

- VRAM estimada para inferencia: los 744M parametros en fp16 ocupan aproximadamente 1,5 GB (coincide con el tamano del repositorio). Solo el backbone de texto (270M) en fp16 requiere en torno a 0,54 GB. En int8, el modelo completo se situaria en torno a 0,75 GB; en int4, alrededor de 0,4 GB (valores estimados, no confirmados en la informacion disponible).
- GPU recomendadas: al tratarse de un modelo de menos de mil millones de parametros, cualquier GPU moderna es suficiente. Resulta adecuado para NVIDIA RTX 3060/4070/4090, Apple Silicon (M-series) y telefonos de gama alta. No requiere A100 ni H100.
- Cabe en GPU de consumo: si, con margen amplio. El modelo esta explicitamente disenado para hardware de consumo, incluidos moviles y portatiles.
- Opciones de despliegue: la model card indica la libreria `sentence-transformers` (junto con `transformers`). El tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. No se confirman en la informacion disponible soportes especificos de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: la model card menciona "baja latencia" como objetivo de diseno, pero no se proporcionan cifras concretas de latencia ni de throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Rendimiento (MTEB multilingue v2) |
|---|---|---|---|---|---|
| EmbeddingGemma 2 (este repositorio) | 740M | 8.192 tokens | Texto, imagen, video, audio | Apache 2.0 | 61,36 |
| EmbeddingGemma 1 | No disponible | No disponible | Texto | No disponible | 61,15 |
| Otros modelos de embeddings multimodales | No disponible | No disponible | No disponible | No disponible | No disponible |

La unica comparacion directa documentada en la informacion disponible es con EmbeddingGemma 1, sobre el que se observa una mejora de 0,21 puntos en MTEB multilingue y de 9,92 puntos en MTEB code. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio `bettercallyugi/embeddinggemma-22222` es una resubida de terceros (autor `bettercallyugi`), no el repositorio oficial de Google. El modelo original se publica en `google/embeddinggemma-2`. Conviene verificar la integridad de los pesos antes de usarlos en produccion.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- La model card del repositorio reproduce la descripcion oficial de Google DeepMind, por lo que las capacidades y benchmarks declarados corresponden al modelo original y no necesariamente a una validacion independiente de esta copia.
- Riesgo de alucinacion: al ser un modelo de embeddings y no de generacion, no produce texto, pero si puede generar representaciones poco fiables en dominios muy alejados de sus datos de entrenamiento.
- No se detallan sesgos conocidos, composicion del dataset ni procesos de alineacion (RLHF/DPO) en la informacion disponible.
- Limitacion de contexto: la ventana de 8.192 tokens implica que documentos o medios mas largos deben trocearse. La sliding window de 1.024 tokens puede afectar a dependencias de largo alcance dentro de una misma secuencia.
- El truncado a 128 dimensiones degrada notablemente el rendimiento en tareas multimodales (MMEB v2 cae a 45,65), por lo que se recomienda reservarlo para cargas de texto.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse que la resubida de terceros mantiene las condiciones de licencia originales del modelo de Google.

## Enlaces

- Repositorio en Hugging Face (esta ficha): https://huggingface.co/bettercallyugi/embeddinggemma-22222
- Modelo oficial de Google: https://huggingface.co/google/embeddinggemma-2
- Repositorio GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2
- Documentacion de EmbeddingGemma: https://ai.google.dev/gemma/docs/embeddinggemma
- Licencia Gemma: https://ai.google.dev/gemma/docs/gemma_4_license
