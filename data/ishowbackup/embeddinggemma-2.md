# Ishowbackup/embeddinggemma-2

## Resumen

EmbeddingGemma 2 es un modelo de embeddings multimodal de código abierto desarrollado por Google DeepMind que proyecta texto (incluido código), imágenes, vídeo y audio, y combinaciones de ellos, en un único espacio vectorial de 768 dimensiones. Con 740M parámetros totales, combina un backbone de texto de 270M con encoders modulares de visión (170M) y audio (300M) que pueden cargarse de forma selectiva. Está construido sobre la arquitectura del decodificador de Gemma 4 y se distribuye bajo licencia Apache 2.0.

El modelo que documenta esta ficha es la reproducción `Ishowbackup/embeddinggemma-2`, un reupload de un tercero del modelo original `google/embeddinggemma-2`. El repositorio no registra descargas ni interacciones en el momento de la consulta y su autor no es el desarrollador original.

Su relevancia radica en que ofrece representaciones semánticas de baja latencia pensadas para ejecutarse en hardware de consumo (móviles y portátiles), habilitando aplicaciones en el dispositivo como búsqueda semántica, generación aumentada por recuperación (RAG), clasificación y clustering. Incluye soporte nativo de Matryoshka Representation Learning (MRL), lo que permite truncar los embeddings a 128, 256 o 512 dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador transformer basado en Gemma 4; backbone de texto + encoders modulares de visión y audio |
| Parametros totales | 744.371.512 (~740M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Multilingue (mas de 100 idiomas, segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimension nativa de salida | 768 |
| Dimensiones MRL | 128, 256, 512 y 768 |
| Pipeline | feature-extraction |
| Libreria | transformers |

## Arquitectura y entrenamiento

EmbeddingGemma 2 sigue la arquitectura de decodificador de Gemma 4 y esta disenado exclusivamente para producir embeddings, no texto generado. El backbone de texto (270M parametros, compuesto por 130M de transformer y 140M de embedder) consta de 24 capas, dimension de modelo 512, dimension oculta 2048, vocabulario de 262.144 tokens y una ventana de atencion deslizante de 1024 tokens. Emplea atencion GQA/MQA con 4 cabezas y 2/1 cabezas KV (locales/globales) en una proporcion local:global de 5:1, activacion Gated FFN con GELU, mean pooling como estrategia de agregacion y una capa de proyeccion de 512 a 768 dimensiones. Los encoders de modalidad son modulares: vision (170M) y audio (300M), cargables de forma independiente.

La innovacion mas destacable es su soporte nativo de Matryoshka Representation Learning (MRL), que permite truncar el vector de 768 dimensiones a 128, 256 o 512 y renormalizarlo, reduciendo el almacenamiento hasta 6x con una perdida de calidad minima hasta 256 dimensiones. Ademas, incorpora representaciones dirigidas por tarea mediante prefijos de instruccion en texto ligero, lo que permite optimizar el embedding para busqueda, clasificacion, clustering o similitud semantica.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de embeddings multimodales nativos: texto, imagenes, video y audio, incluyendo combinaciones de estas modalidades, en un unico espacio vectorial compartido de 768 dimensiones.
- Embeddings de texto y codigo, con una mejora aproximada del 14% en tareas de codigo respecto a su predecesor segun la model card.
- Comprension multilingue en mas de 100 idiomas.
- Similitud semantica de frases (sentence-similarity) y recuperacion de informacion.
- Extraccion de caracteristicas de imagen, audio y video (image/audio/video-feature-extraction).
- Representaciones dirigidas por tarea mediante prefijos de instruccion.
- Truncado de embeddings mediante MRL a 128, 256 o 512 dimensiones.
- Capacidad de procesar minutos de audio o video gracias a su ventana de contexto de 8K tokens.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso de agentes.

## Casos de uso

- Busqueda semantica en el dispositivo: el modelo puede indexar documentos y consultas como vectores de 768 dimensiones y ejecutar busquedas por similitud directamente en un portatil o movil, aprovechando su tamano reducido y su baja latencia.
- RAG (generacion aumentada por recuperacion): se integra en pipelines de recuperacion para alimentar a un LLM generativo con fragmentos relevantes, reduciendo costes de almacenamiento vectorial hasta 6x si se truncan a 128 dimensiones.
- Clasificacion de contenido multimodal: permite clasificar imagenes, audio o texto combinando sus embeddings con un clasificador ligero, util en moderacion de contenido o etiquetado automatico.
- Clustering de grandes colecciones: agrupa documentos, imagenes o clips de audio por similitud semantica en su espacio unificado, sin necesidad de procesar cada modalidad por separado.
- Busqueda de codigo: con su mejora en tareas de codigo, puede indexar repositorios y recuperar fragmentos relevantes a partir de consultas en lenguaje natural o en el propio lenguaje de programacion.
- Deduplicacion multimodal: detecta contenido duplicado o casi duplicado entre texto, imagenes y audio en un mismo espacio vectorial.
- Recuperacion de video y audio: localiza segmentos concretos dentro de grabaciones procesando minutos de material gracias a la ventana de 8K tokens.
- Sistemas de recomendacion: genera representaciones de items y usuarios para calcular similitudes y ordenar recomendaciones en tiempo real.

## Benchmarks y rendimiento

Resultados de la model card para el checkpoint en precision completa (768 dimensiones):

| Modalidad | Benchmark | Metrica | EmbeddingGemma 2 | EmbeddingGemma 1 |
|---|---|---|---|---|
| Texto | MTEB (multilingue, v2) | Mean(Task), Multiple | 61,36 | 61,15 |
| Codigo | MTEB (code, v1) | Mean(Task), NDCG@10 | 78,68 | 68,76 |
| Imagen | MIEB (lite) | Mean(TaskType), Multiple | 64,64 | no disponible |
| Imagen | MMEB v2 - Image | Mean(Task), Hit@1 | 57,28 | no disponible |
| Documento visual | MMEB v2 - VisDoc | Mean(Task), NDCG@5 | 67,84 | no disponible |
| Video | MMEB v2 - Video | Mean(Task), Hit@1 | 50,67 | no disponible |
| Audio | MSEB (Retrieval) | Mean(Task), MRR@10 | 69,54 | no disponible |
| Audio | MAEB (Hugging Face) | Mean(Task), Multiple | 49,39 | no disponible |

Resultados con truncado de vectores (MRL), mostrando el impacto de reducir dimensiones:

| Dimension de salida | Ratio de compresion | MTEB (multilingue, v2) | MTEB (eng, v2) | MTEB (code, v1) | MIEB (lite) | MMEB v2 (Overall) | MSEB (Retrieval) | MAEB |
|---|---|---|---|---|---|---|---|---|
| 768d (completa) | 1:1 | 61,36 | 68,46 | 78,68 | 64,64 | 59,01 | 69,54 | 49,39 |
| 512d | 1:1,5 | 61,17 | 68,41 | 77,24 | 64,32 | 58,38 | 69,18 | 49,21 |
| 256d | 1:3 | 60,41 | 67,78 | 76,18 | 63,13 | 56,24 | 66,76 | 48,91 |
| 128d | 1:6 | 57,89 | 65,68 | 71,41 | 59,06 | 45,65 | 56,71 | 46,92 |

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros; el modelo se publica en precision completa): aproximadamente 3 GB en fp32, 1,5 GB en fp16/bf16, 0,75 GB en int8 y 0,37 GB en int4.
- El backbone de texto solo (270M parametros) requiere una fraccion de esa VRAM, ya que los encoders de vision (170M) y audio (300M) pueden cargarse de forma selectiva segun la modalidad necesaria.
- El tamano del repositorio es de 1,5 GB, consistente con pesos en fp16 o bf16.
- Cabe con holgura en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, entre otras, y esta disenado explicitamente para ejecutarse en moviles y portatiles.
- Opciones de despliegue: transformers y sentence-transformers (soportados oficialmente en la model card). Unsloth documenta su ejecucion local. No se confirman otras opciones como vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodalidad | Licencia | Benchmark destacado |
|---|---|---|---|---|---|
| EmbeddingGemma 2 | 740M (270M texto + 170M vision + 300M audio) | 8.192 tokens | Texto, codigo, imagen, video, audio | Apache 2.0 | MTEB code v1: 78,68; MIEB lite: 64,64 |
| EmbeddingGemma 1 | no disponible en la informacion | no disponible en la informacion | Solo texto (segun los datos aportados) | Apache 2.0 | MTEB multilingue v2: 61,15; MTEB code v1: 68,76 |
| Otros modelos de embeddings de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con alternativas de la misma categoria (por ejemplo, modelos de embeddings multimodales de tamano sub-1B de otros fabricantes) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio documentado (`Ishowbackup/embeddinggemma-2`) es una reproduccion de un tercero, no la publicacion oficial de Google DeepMind. Se recomienda usar la version oficial `google/embeddinggemma-2` para produccion.
- El repositorio no registra descargas ni likes, lo que impide verificar su uso o mantenimiento por parte de la comunidad.
- Es un modelo de embeddings, no generativo: no produce texto ni responde a instrucciones, por lo que no es adecuado para tareas de generacion, tool calling o razonamiento agentico.
- Como todo modelo de embeddings, puede producir representaciones de baja calidad o sesgadas para dominios poco representados en sus datos de entrenamiento; no se dispone de informacion sobre la composicion del dataset ni sobre sesgos evaluados.
- No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre tecnicas de alineacion (RLHF/DPO).
- El truncado a 128 dimensiones degrada notablemente el rendimiento en tareas multimodales (MMEB v2 cae de 59,01 a 45,65), por lo que la model card recomienda reservar 128d para cargas de trabajo exclusivamente de texto.
- La ventana de contexto esta limitada a 8.192 tokens, con una ventana deslizante de 1024 tokens, lo que puede afectar a documentos o grabaciones muy extensos.
- No se detallan los tipos de cuantizacion soportados oficialmente, lo que puede dificultar el despliegue en entornos con restricciones de memoria.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo original de Google DeepMind.

## Enlaces

- Repositorio HuggingFace (reproduccion): https://huggingface.co/Ishowbackup/embeddinggemma-2
- Repositorio HuggingFace oficial: https://huggingface.co/google/embeddinggemma-2
- Blog de lanzamiento de Google DeepMind: https://deepmind.google/blog/embeddinggemma-2-an-open-lightweight-multimodal-embedding-model/
- Pagina del modelo en Google DeepMind: https://deepmind.google/models/gemma/embeddinggemma/
- Blog para desarrolladores de Google: https://developers.googleblog.com/embeddinggemma-2-the-developer-guide/
- Documentacion oficial: https://ai.google.dev/gemma/docs/embeddinggemma
- Repositorio GitHub de Gemma: https://github.com/google-gemma
- Blog de lanzamiento en blog.google: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2
- Documentacion de Unsloth para ejecucion local: https://unsloth.ai/docs/models/embeddinggemma-2
