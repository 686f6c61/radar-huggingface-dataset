# FrontiersMind/EmbeddingNandi-450M

## Resumen

EmbeddingNandi-450M es un modelo de embeddings de frases (sentence embeddings) desarrollado por FrontiersMind, construido sobre el encoder bidireccional NandiBERT-450M de la misma casa. Su función es convertir texto en vectores densos de 1.024 dimensiones para búsqueda semántica, generación aumentada por recuperación (RAG), agrupamiento (clustering), deduplicación y puntuación de similitud. Cubre inglés, 13 lenguas índicas en escritura nativa (más texto índico romanizado como hinglish), árabe, indonesio y malayo en un único modelo.

La relevancia del modelo reside en su ventana de contexto de 32.768 tokens, que permite embeber documentos completos (contratos, informes, artículos) en una sola pasada sin troceado, y en su rendimiento en MTEB(Indic, v1), donde obtiene 76,62 frente a los 68,39 de EmbeddingGemma 2 o los 64,10 de Qwen3-Embedding-0.6B. Con 444.661.760 parámetros reales (etiquetado comercialmente como 450M), compite en la franja de 270M-600M con licencia Apache-2.0.

Arquitectónicamente hereda de NandiBERT-450M: 28 capas con tamaño oculto de 1.024, atención de consultas agrupadas (GQA) con 8 cabezas de consulta y 2 de clave-valor, normalización QK y SwiGLU. Emplea un vocabulario multilingüe de 100K tokens almacenado como embedding factorizado de rango 512, y entrena con Matryoshka Representation Learning, lo que permite truncar los vectores a 768, 512, 256 o 128 dimensiones sin reentrenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (NandiBERT-450M) con GQA, QK-norm y SwiGLU |
| Parametros totales | 444.661.760 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible (pesos en safetensors; sin GGUF publicado) |
| Idiomas soportados | en, hi, mr, pa, ta, te, kn, ml, bn, gu, as, or, ur, ne, ar, id, ms (mas texto indico romanizado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (custom_code, compatible con sentence-transformers y transformers) |
| Dimension del embedding | 1.024 (truncable a 768, 512, 256, 128) |
| Capas / tamano oculto | 28 / 1.024 |
| Cabezas de atencion | 8 de consulta, 2 de clave-valor (GQA) |
| Vocabulario | 100.000 tokens, embedding factorizado de rango 512 |
| Pooling | Mean pooling sobre todos los tokens (incluido el prompt de tarea) + normalizacion L2 |
| Similitud | Coseno |
| Tamano del repo | 2,7 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional de 28 capas y 1.024 dimensiones ocultas, derivado de NandiBERT-450M. Usa atención de consultas agrupadas (8 cabezas de consulta, 2 de clave-valor) para reducir el consumo de memoria en secuencias largas, normalización QK para estabilizar el entrenamiento y activación SwiGLU. El vocabulario de 100.000 tokens se guarda como embedding factorizado de rango 512, una técnica que reduce el número de parámetros dedicados a la tabla de embeddings manteniendo cobertura multilingüe.

El entrenamiento es contrastivo en tres etapas sobre NandiBERT-450M: primero pares de texto débilmente supervisados con lotes muy grandes (16.384), después un conjunto de pares curado y finalmente ajuste fino sobre datos etiquetados de recuperación, código, clasificación, agrupamiento, similitud y bitexto en inglés y lenguas índicas, con hasta tres negativos duros minados por consulta, pérdida CoSENT para los datos de similitud y documentos de hasta 32K tokens. Se aplica pérdida Matryoshka en 1.024, 768, 512, 256 y 128 dimensiones. Los pesos publicados son la media equitativa de dos ejecuciones de ajuste fino. El modelo admite prompts de tarea en el formato de EmbeddingGemma (por ejemplo, `task: search result | query: `) que orientan el embedding hacia búsqueda, búsqueda de código, clasificación, agrupamiento o similitud.

## Capacidades

- Generación de embeddings de frases y documentos de hasta 32.768 tokens en una sola pasada.
- Búsqueda semántica y recuperación de información (retrieval) en inglés, lenguas índicas y sudeste asiático.
- Soporte de prompts de tarea para especializar el vector según el caso de uso (search, code search, classification, clustering, similarity).
- Embeddings Matryoshka truncables a 768, 512, 256 y 128 dimensiones para equilibrar precisión y coste de almacenamiento.
- Capacidades multilingües y multiescritura: escritura nativa índica, texto índico romanizado (hinglish), árabe, indonesio y malayo.
- Puntuación de similitud semántica entre pares de textos y detección de duplicados.
- Extracción de características (feature-extraction) para pipelines de clasificación y agrupamiento.
- Integración con Sentence Transformers y con `transformers` de Hugging Face, además de endpoints compatibles.
- No dispone de tool calling, razonamiento multi-paso ni generación de texto: es un encoder, no un modelo generativo.

## Casos de uso

- Búsqueda semántica multilingüe en comercio electrónico: indexar catálogos de productos en inglés e hindi (u otras lenguas índicas) y responder consultas en cualquiera de esos idiomas; el modelo alinea consultas y documentos en un mismo espacio vectorial, como muestra el widget de la model card con "How do I return a damaged product?" frente a su equivalente en hindi y en hinglish.
- RAG sobre documentación larga: embeber contratos, informes o artículos completos de hasta 32K tokens sin troceado, reduciendo la pérdida de contexto que introduce el chunking y mejorando la recuperación de pasajes en asistentes documentales.
- Deduplicación y agrupamiento de corpus: usar los vectores truncados a 256 o 128 dimensiones para agrupar noticias, reseñas o tickets de soporte por similitud semántica con un coste de almacenamiento reducido.
- Búsqueda de código: gracias a la puntuación de 78,42 en MTEB(Code, v1), sirve para indexar repositorios y recuperar fragmentos de código por descripción en lenguaje natural.
- Moderación y clasificación de contenido: emplear el prompt de tarea de clasificación para alimentar clasificadores lineales sobre los embeddings en inglés e índico, útil en plataformas con audiencias multilingües.
- Sistemas de preguntas frecuentes y atención al cliente: recuperar respuestas canónicas ante consultas de usuarios en varias lenguas índicas con un único índice vectorial, evitando mantener un modelo por idioma.
- Minería de bitextos y alineación de corpus: la puntuación de 88,85 en bitext mining de MTEB(Indic) lo hace adecuado para emparejar oraciones entre inglés y lenguas índicas en la construcción de datasets de traducción.

## Benchmarks y rendimiento

Resultados medios en MTEB(eng, v2) (41 tareas), MTEB(Code, v1) (12 tareas) y MTEB(Indic, v1) (20 tareas), reevaluados por el autor con la librería MTEB 2.26.19 y la longitud máxima documentada de cada modelo (32.768 tokens para EmbeddingNandi-450M, Qwen3, harrier y pplx; 8.192 para EmbeddingGemma 2; 512 para multilingual-e5 y LFM2.5). EmbeddingNandi-450M se evaluó en float32 (Touche2020 en bfloat16).

| Modelo | MTEB(eng, v2) | MTEB(Code, v1) | MTEB(Indic, v1) | Media |
|---|---|---|---|---|
| EmbeddingNandi-450M (445M) | 67,61 | 78,42 | 76,62 | 74,22 |
| EmbeddingGemma 2 (271M) | 67,53 | 78,27 | 68,39 | 71,40 |
| LFM2.5-Embedding-350M (354M) | 60,33 | 44,27 | 34,94 | 46,51 |
| Qwen3-Embedding-0.6B (596M) | 70,09 | 74,88 | 64,10 | 69,69 |
| pplx-embed-v1-0.6b (596M) | 62,01 | 75,21 | 63,83 | 67,02 |
| harrier-oss-v1-270m (268M) | 67,19 | 62,98 | 67,99 | 66,05 |
| multilingual-e5-large-instruct (560M) | 65,74 | 58,49 | 69,64 | 64,62 |

Desglose de MTEB(Indic, v1) por tipo de tarea (parcial, según la model card):

| Modelo | Media (20) | Bitext Mining (2) | Classification (12) | Clustering (1) | Pair Classification (1) | Reranking (1) | Retrieval (2) | STS (1) |
|---|---|---|---|---|---|---|---|---|
| EmbeddingNandi-450M (445M) | 76,62 | 88,85 | 73,66 | 58,64 | 85,19 | 87,03 | 90,89 | 58,04 |
| EmbeddingGemma 2 (271M) | 68,39 | 62,88 | 70,46 | 31,65 | 75,14 | 85,34 | 83,84 | no disponible |

## Requisitos de hardware

- VRAM para inferencia: los pesos ocupan aproximadamente 1,8 GB en float32 (444,6M de parámetros). En float16/bfloat16 bajan a unos 0,9 GB; en int8, a unos 0,45 GB. A esto hay que sumar la memoria de activaciones, que crece con la longitud de secuencia: procesar 32K tokens en una sola pasada exige bastante más memoria que embeber frases cortas.
- GPU recomendadas: para lotes grandes y contexto completo, A100 (40/80 GB) o H100. Para uso en producción con secuencias moderadas, L40S, A10G o RTX 4090 (24 GB) son suficientes.
- Cabe en GPU de consumo: sí. En RTX 4090, RTX 3090 o RTX 4080 (16 GB o más) se puede ejecutar con comodidad en float16 para secuencias cortas y medias; las secuencias cercanas a 32K requieren cuidado con el tamaño de lote.
- Opciones de despliegue: Sentence Transformers (`SentenceTransformer`), `transformers` con `AutoModel`, y servidores de embeddings compatibles con la API de Hugging Face (endpoints compatibles). No hay pesos GGUF publicados, por lo que llama.cpp u Ollama no están soportados de forma nativa salvo conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia estructural, el uso de GQA (2 cabezas KV) y del embedding factorizado reduce el coste de memoria frente a un encoder denso equivalente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MTEB(eng, v2) | MTEB(Indic, v1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| EmbeddingNandi-450M | 445M | 32.768 | 67,61 | 76,62 | Apache-2.0 | Hugging Face |
| EmbeddingGemma 2 | 271M | 8.192 | 67,53 | 68,39 | no disponible en la informacion | Hugging Face |
| Qwen3-Embedding-0.6B | 596M | 32.768 | 70,09 | 64,10 | no disponible en la informacion | Hugging Face |
| multilingual-e5-large-instruct | 560M | 512 | 65,74 | 69,64 | no disponible en la informacion | Hugging Face |

EmbeddingNandi-450M destaca en cobertura índica y en código, mientras que Qwen3-Embedding-0.6B lidera en inglés. Frente a multilingual-e5-large-instruct, ofrece 64 veces más contexto (32.768 frente a 512 tokens) y mejor media global, aunque e5 mantiene una puntuación índica competitiva con una ventana mucho menor.

## Limitaciones y advertencias

- Es un encoder de embeddings: no genera texto, no razona de forma multi-paso y no soporta tool calling. No debe emplearse como sustituto de un LLM.
- Riesgo de alucinación no aplica directamente, pero sí el riesgo de recuperación errónea: un embedding puede situar documentos semánticamente próximos pero factualmente irrelevantes, lo que en RAG se traduce en respuestas incorrectas aguas abajo.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible. Al entrenarse con pares web débilmente supervisados y datos curados, puede heredar sesgos de esos corpus, especialmente en lenguas con menos recursos.
- Cobertura idiomática: el soporte se limita a los 17 idiomas listados; otras lenguas índicas o del sudeste asiático no están cubiertas de forma explícita.
- El prompt de tarea es parte del formato de entrenamiento: omitirlo o usar un formato distinto puede degradar el rendimiento, especialmente en búsqueda y clasificación.
- Los vectores truncados con Matryoshka pierden calidad de forma progresiva; 128 dimensiones es la opción más agresiva y debe validarse en la tarea concreta.
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene revisar las condiciones de los datos de entrenamiento subyacentes, no detalladas en la model card.
- El informe técnico figura como "TODO" en la model card, por lo que no hay documentación formal de la composición exacta del dataset ni de las evaluaciones de robustez.
- El modelo se publicó en noviembre de 2026 y cuenta con 0 descargas y 1 like en el momento de la consulta; la validación comunitaria es todavía inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FrontiersMind/EmbeddingNandi-450M
- Modelo base NandiBERT-450M: https://huggingface.co/FrontiersMind/NandiBERT-450M
- Variante compacta EmbeddingNandi-150M: https://huggingface.co/FrontiersMind/EmbeddingNandi-150M
- Encoder NandiBERT-150M: https://huggingface.co/FrontiersMind/NandiBERT-150M
- Organización en Hugging Face: https://huggingface.co/FrontiersMind
- GitHub de FrontiersMind: https://github.com/FrontiersMindAI/
- Blog de lanzamiento: https://www.frontiersmind.ai/
- Sitio web: https://www.frontiersmind.ai/
- Informe técnico: no disponible (marcado como "TODO" en la model card)
- Librería MTEB: https://github.com/embeddings-benchmark/mteb
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
