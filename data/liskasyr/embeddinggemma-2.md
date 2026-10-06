# liskasYR/embeddinggemma-2

## Resumen

EmbeddingGemma 2 es un modelo de embeddings multimodal abierto desarrollado por Google DeepMind que proyecta texto (incluido código), imágenes, vídeo y audio, así como combinaciones de estas modalidades, en un único espacio vectorial compartido de 768 dimensiones. El checkpoint publicado en el repositorio `liskasYR/embeddinggemma-2` corresponde a una resubida no oficial del modelo de Google, con licencia declarada Apache 2.0 y biblioteca `transformers`.

El modelo cuenta con 740 millones de parámetros totales (744.371.512 según los pesos safetensors) y está diseñado para ejecutarse en hardware de consumo, como portátiles y dispositivos móviles. Combina un backbone de texto de 270M de parámetros (130M transformer más 140M embedder) con codificadores modulares opcionales de visión (170M) y audio (300M), de modo que el desarrollador puede cargar únicamente las modalidades que necesite.

Su relevancia radica en la unificación de cuatro modalidades en un mismo espacio de embeddings, el soporte de más de 100 idiomas, una ventana de contexto de 8K tokens y el uso de Matryoshka Representation Learning (MRL), que permite truncar las representaciones a 128, 256 o 512 dimensiones y reducir el coste de almacenamiento vectorial hasta seis veces con un impacto mínimo en la calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone de texto más codificadores de visión y audio), atención GQA/MQA, ventana deslizante |
| Parámetros totales | 744.371.512 (740M según la model card) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Multilingüe, más de 100 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

EmbeddingGemma 2 se construye sobre los avances arquitectónicos de Gemma 4. El backbone de texto tiene 24 capas, una dimensión de modelo de 512 y una dimensión oculta de 2.048. Emplea 4 cabezas de atención, con 2 cabezas KV locales y 1 global (proporción local:global de 5:1), atención GQA/MQA, activación Gated FFN con GELU, pooling de media y una capa de proyección de 512 a 768 dimensiones. El vocabulario es de 262.144 tokens. Los codificadores de modalidad son modulares: visión (170M) y audio (300M), seleccionables según el caso de uso.

El modelo incorpora Matryoshka Representation Learning (MRL) para soportar embeddings truncados nativos en 128, 256, 512 y 768 dimensiones, y representaciones guiadas por tarea mediante prefijos de instrucción ligeros que optimizan el embedding para búsqueda, clasificación, clustering o similitud semántica. En cuanto al entrenamiento, la model card no especifica el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de embeddings multimodales unificados de texto, imagen, vídeo y audio en un espacio compartido de 768 dimensiones.
- Embeddings de texto multilingüe en más de 100 idiomas.
- Mejora de aproximadamente el 14% en tareas de código respecto a EmbeddingGemma 1, según la model card.
- Salidas truncadas nativas mediante MRL a 128, 256 y 512 dimensiones, con re-normalización.
- Representaciones guiadas por tarea mediante prefijos de instrucción (search, classification, clustering, semantic similarity).
- Codificadores de modalidad (visión y audio) cargables de forma selectiva.
- Procesamiento de documentos visuales (VisDoc) y de vídeo.
- Procesamiento de audio y vídeo de varios minutos gracias a la ventana de 8K tokens.
- No es un modelo generativo: no produce texto ni respuestas, solo representaciones vectoriales. No dispone de tool calling, agentes ni modo de razonamiento.

## Casos de uso

- Búsqueda semántica multilingüe: el modelo genera embeddings normalizados de consultas y documentos en más de 100 idiomas, lo que permite construir índices vectoriales que recuperan resultados relevantes sin coincidencia léxica exacta.
- RAG (retrieval-augmented generation): actúa como recuperador en pipelines de generación aumentada, indexando fragmentos de texto de hasta 8.192 tokens y devolviendo los fragmentos más similares a una consulta para alimentar a un LLM generativo.
- Clasificación y clustering de documentos: los embeddings pueden alimentar clasificadores lineales o algoritmos de clustering (por ejemplo, k-means) para agrupar noticias, tickets de soporte o reseñas por similitud semántica.
- Búsqueda de código: con una mejora de ~14% en tareas de código, es adecuado para indexar repositorios y recuperar fragmentos de código relevantes a partir de descripciones en lenguaje natural.
- Búsqueda multimodal texto-a-imagen: gracias al codificador de visión, permite consultar catálogos de imágenes mediante descripciones textuales y viceversa, útil en comercio electrónico o gestión de activos digitales.
- Recuperación de audio y vídeo: con los codificadores de audio y vídeo puede indexar fragmentos de audio o clips de vídeo de varios minutos y recuperarlos mediante consultas de texto o de otra modalidad.
- Deduplicación y clustering de conjuntos multimodales: la representación unificada permite detectar duplicados o agrupar elementos de distintas modalidades (imágenes, audio, texto) en un único espacio.
- Búsqueda en documentos visuales: el rendimiento en MMEB v2 VisDoc (67,84 NDCG@5) lo hace apto para indexar y recuperar páginas de documentos escaneados o capturas.

## Benchmarks y rendimiento

Resultados a 768 dimensiones con precisión completa, según la model card:

| Modalidad | Benchmark | Métrica | EmbeddingGemma 2 | EmbeddingGemma 1 |
|---|---|---|---|---|
| Texto | MTEB (multilingual, v2) | Mean(Task), Multiple | 61,36 | 61,15 |
| Texto | MTEB (code, v1) | Mean(Task), NDCG@10 | 78,68 | 68,76 |
| Imagen | MIEB (lite) | Mean(TaskType), Multiple | 64,64 | no disponible |
| Imagen | MMEB v2 (Image) | Mean(Task), Hit@1 | 57,28 | no disponible |
| Imagen | MMEB v2 (VisDoc) | Mean(Task), NDCG@5 | 67,84 | no disponible |
| Vídeo | MMEB v2 (Video) | Mean(Task), Hit@1 | 50,67 | no disponible |
| Audio | MSEB (Retrieval) | Mean(Task), MRR@10 | 69,54 | no disponible |
| Audio | MAEB | Mean(Task), Multiple | 49,39 | no disponible |

Resultados con truncado de vectores (MRL):

| Dimensión de salida | Ratio de compresión | MTEB (multilingual, v2) | MTEB (eng, v2) | MTEB (code, v1) | MIEB (lite) | MMEB v2 (overall) | MSEB (Retrieval) | MAEB |
|---|---|---|---|---|---|---|---|---|
| 768d (completa) | 1:1 | 61,36 | 68,46 | 78,68 | 64,64 | 59,01 | 69,54 | 49,39 |
| 512d | 1:1,5 | 61,17 | 68,41 | 77,24 | 64,32 | 58,38 | 69,18 | 49,21 |
| 256d | 1:3 | 60,41 | 67,78 | 76,18 | 63,13 | 56,24 | 66,76 | 48,91 |
| 128d | 1:6 | 57,89 | 65,68 | 71,41 | 59,06 | 45,65 | 56,71 | 46,92 |

## Requisitos de hardware

- VRAM estimada: el checkpoint completo de 740M en fp16 ocupa aproximadamente 1,5 GB; en fp32, alrededor de 3 GB. El backbone de texto de 270M en fp16 requiere en torno a 540 MB. La model card indica que se puede cargar solo el subconjunto de modalidades necesario, reduciendo el consumo.
- GPU recomendadas: la información disponible no especifica modelos concretos de GPU.
- GPU de consumo: el modelo está explícitamente diseñado para ejecutarse en hardware de consumo, incluidos portátiles y dispositivos móviles, según su autor.
- Opciones de despliegue: la librería indicada es `transformers`, con soporte de `sentence-transformers` y la etiqueta `endpoints_compatible`. No se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensiones | MTEB (multilingual, v2) | MTEB (code, v1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| EmbeddingGemma 2 (este checkpoint) | 740M | 8.192 tokens | 768 (128/256/512 por MRL) | 61,36 | 78,68 | Apache 2.0 | HuggingFace (resubida de terceros) |
| EmbeddingGemma 1 | no disponible | no disponible | no disponible | 61,15 | 68,76 | no disponible | HuggingFace |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con EmbeddingGemma 1, su predecesor directo. No se dispone de datos de otros modelos alternativos de embeddings en la documentación facilitada.

## Limitaciones y advertencias

- El repositorio `liskasYR/embeddinggemma-2` es una resubida de terceros, no el repositorio oficial de Google DeepMind (`google/embeddinggemma-2`). No hay garantía de integridad de los pesos ni de que correspondan exactamente al modelo original.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación de la comunidad.
- Existe una discrepancia documental: la model card enlaza a la licencia de Gemma 4 (`gemma_4_license`), mientras que la licencia declarada en los metadatos es Apache 2.0. Conviene verificar los términos reales antes de un uso comercial.
- Las fechas de creación y actualización del repositorio (2026) no coinciden con el ciclo de publicación habitual de la familia Gemma; conviene contrastar con la fuente oficial.
- Al ser un modelo de embeddings y no generativo, no produce texto y no presenta riesgo de alucinación en el sentido clásico; sin embargo, puede devolver representaciones poco discriminativas en dominios fuera de su distribución de entrenamiento.
- La dimensión de 128d solo se recomienda para cargas de trabajo basadas exclusivamente en texto, según la model card.
- La model card no detalla sesgos conocidos, composición del dataset de entrenamiento ni estrategias de mitigación.
- No se especifican los tipos de cuantización soportados ni el rendimiento tras cuantización.
- El rendimiento en vídeo (50,67 Hit@1 en MMEB v2) y en audio (49,39 en MAEB) es notablemente inferior al de texto, por lo que conviene calibrar expectativas en esas modalidades.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/liskasYR/embeddinggemma-2
- Modelo oficial en HuggingFace: https://huggingface.co/google/embeddinggemma-2
- GitHub de la familia Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/embeddinggemma-2
- Documentación: https://ai.google.dev/gemma/docs/embeddinggemma
- Licencia: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de Gemma en Google DeepMind: https://deepmind.google/models/gemma/
