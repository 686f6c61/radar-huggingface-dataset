# 360ZhiNao/Zhinao-ChineseModernBert-Embedding

## Resumen

Zhinao-ChineseModernBert-Embedding es un modelo de embeddings semánticos para chino desarrollado por 360ZhiNao (Qihoo 360), construido sobre la arquitectura ModernBert y publicado con licencia Apache 2.0. Resuelve el problema de la recuperación semántica de alta precisión en entornos con restricciones de memoria y requisitos de alto throughput, ofreciendo representaciones densas de 768 dimensiones con un coste computacional propio de un modelo Base (~100M parámetros en el transformer, 227M totales incluyendo la matriz de embeddings).

El modelo deriva del modelo base Zhinao-ChineseModernBert, preentrenado desde cero con 1T tokens de corpus chino-inglés (más del 65% en chino) mediante MLM y posteriormente RetroMAE. Sobre esa base se aplican dos fases de entrenamiento de embeddings: preentrenamiento contrastivo con cientos de millones de pares de recuperación y traducción, y un ajuste fino supervisado multi-tarea sobre los conjuntos de CMTEB y MTEB.

Su relevancia actual radica en que alcanza el estado del arte en la categoría Base de CMTEB (70,16 de media), superando en rendimiento agregado a modelos mucho mayores como Qwen3-Embedding-0.6B (67,45), con un coste de inferencia muy inferior. Es una pieza adecuada para pipelines de RAG, bases de datos vectoriales y búsqueda semántica en producción donde la latencia y la VRAM son factores críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBert (transformer encoder) + pooling CLS + normalizacion L2 |
| Parametros totales | 227.018.496 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos safetensors en el repo; compatible con cuantizacion via herramientas externas) |
| Idiomas soportados | zh (con corpus de entrenamiento que incluye ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimension de salida | 768 |
| Funcion de similitud | coseno |
| Tokenizador | Qwen2Tokenizer |
| Libreria | sentence-transformers |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ModernBert, una evolución del transformer encoder de BERT que incorpora mejoras de eficiencia (atención con soporte para longitudes mayores, rotatory positional embeddings y normalización moderna) orientadas a alto throughput y bajo consumo de memoria. La cabeza de sentence-transformers aplica pooling sobre el token CLS y normalización L2, produciendo vectores de 768 dimensiones comparables por similitud coseno.

El entrenamiento se estructura en varias fases. Primero, un preentrenamiento MLM desde cero sobre 1T tokens de corpus chino-inglés con secuencias de 8192 tokens y enmascaramiento WWM dinámico. Después, una fase RetroMAE con secuencias de hasta 1536 tokens orientada a la representación a nivel de frase. Sobre el modelo base, la versión Embedding añade un preentrenamiento contrastivo de recuperación con cientos de millones de pares chino-inglés y un ajuste fino supervisado multi-tarea sobre CMTEB y MTEB, cubriendo recuperación, clustering, clasificación, STS y reranking. El tokenizador Qwen2Tokenizer, con vocabulario amplio, reduce la tasa de OOV en texto chino y en mezclas chino-inglés.

## Capacidades

- Generación de embeddings densos de 768 dimensiones para frases, párrafos y documentos de hasta 512 tokens.
- Similitud semántica y detección de duplicados mediante similitud coseno.
- Recuperación de información (retrieval) en corpus chinos, incluyendo consultas con mezcla chino-inglés.
- Clustering y clasificación de textos a partir de representaciones vectoriales.
- Reranking de resultados de búsqueda.
- Extracción de características (feature-extraction) para pipelines downstream.
- Soporte de despliegue con Text Embeddings Inference (TEI) y endpoints compatibles.
- No soporta tool calling, agentes ni generación de texto: es un modelo exclusivamente de representación.

## Casos de uso

- RAG sobre documentación interna en chino: el modelo indexa fragmentos de hasta 512 tokens en una base vectorial y recupera los pasajes relevantes para alimentar a un LLM generador, con un coste de embedding muy bajo gracias a sus ~100M parámetros efectivos.
- Búsqueda semántica en e-commerce: permite mapear consultas de usuarios y descripciones de producto al mismo espacio vectorial de 768 dimensiones, gestionando términos coloquiales y mezclas chino-inglés gracias al tokenizador Qwen2.
- Deduplicación y near-duplicate detection en grandes corpus: el cálculo de similitud coseno sobre vectores normalizados permite filtrar documentos repetidos en pipelines de curación de datos a alta velocidad.
- Clasificación de tickets de soporte: los embeddings sirven como entrada a un clasificador ligero para enrutar incidencias por temática, evitando desplegar un LLM para una tarea de categorización.
- Reranking en motores de búsqueda híbridos: tras una recuperación BM25, el modelo reordena los candidatos por similitud semántica, mejorando la precisión del top-k con latencia de milisegundos.
- Moderación y clustering de contenido generado por usuarios: agrupa textos similares para detectar campañas de spam o contenido duplicado en foros y redes.
- Construcción de índices vectoriales para asistentes de atención al cliente: permite recuperar respuestas de una base de conocimiento con contexto limitado a 512 tokens por fragmento, adecuado para FAQ y artículos breves.

## Benchmarks y rendimiento

Resultados en CMTEB (media por tipo de tarea):

| Modelo | Parametros | Dimension | Classification | Clustering | Pair Classification | Reranking | Retrieval | STS | Media |
|---|---|---|---|---|---|---|---|---|---|
| bge-base-zh-v1.5 | ~90M | 1024 | 71,79 | 47,49 | 73,18 | 65,02 | 69,41 | 51,67 | 63,07 |
| piccolo-base-zh | ~90M | 768 | 70,05 | 47,12 | 70,17 | 66,68 | 71,20 | 54,39 | 63,27 |
| setlla-base-zh-v3-1792d | ~90M | 1792 | 74,40 | 53,29 | 82,50 | 67,84 | 72,28 | 61,92 | 68,71 |
| setlla-large-zh-v3.5-1792d | ~310M | 1792 | 74,66 | 54,31 | 82,92 | 68,45 | 73,52 | 51,93 | 69,30 |
| Qwen3-Embedding-0.6B | ~596M | 1024 | 71,40 | 68,74 | 76,42 | 62,58 | 71,03 | 54,52 | 67,45 |
| 360Zhinao-Embedding-Base | ~110M | 768 | 73,50 | 65,36 | 86,15 | 67,99 | 69,32 | 60,29 | 70,16 |

Resultados del modelo base Zhinao-ChineseModernBert en CLUE:

| Modelo | Parametros | afqmc | tnews | iflytek | cmnli | wsc | csl | ocnli | c3 | Media |
|---|---|---|---|---|---|---|---|---|---|---|
| ChineseModernBERT (large) | ~310M | 73,87 | 56,90 | 60,15 | 83,96 | 52,10 | 86,20 | 79,10 | 82,65 | 71,87 |
| RoBERTa-wwm-large | ~310M | 76,55 | 58,61 | 62,98 | 82,12 | 74,60 | 82,13 | 78,20 | 73,82 | 73,63 |
| RoBERTa-wwm-ext (base) | ~90M | 74,04 | 56,94 | 60,31 | 80,51 | 67,80 | 81,00 | 74,72 | 66,50 | 70,23 |
| Zhinao-ChineseModernBERT (base) | ~110M | 76,99 | 57,51 | 59,56 | 83,82 | 78,95 | 85,70 | 79,08 | 75,42 | 74,63 |

No se han publicado resultados de benchmarks de la versión Embedding en MMLU, HumanEval o GSM8K, ya que no es un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,9 GB de pesos; en fp16/bf16, unos 0,45 GB. El overhead de activaciones depende del batch y de la longitud de secuencia.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, así como en CPU para cargas moderadas.
- GPU recomendadas para producción de alto throughput: A100, H100, L40S o RTX 4090 con batching dinámico.
- Despliegue mediante Text Embeddings Inference (TEI), sentence-transformers, vLLM (con soporte de embedding), Hugging Face Inference Endpoints y llama.cpp para conversión a GGUF si se requiere ejecución en CPU.
- Latencia y throughput: no disponibles en la información proporcionada; la arquitectura ModernBert está optimizada para alto throughput, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | CMTEB (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Zhinao-ChineseModernBert-Embedding | 227M (total) | 512 | 768 | 70,16 | Apache 2.0 | Hugging Face |
| bge-base-zh-v1.5 | ~90M | 512 | 1024 | 63,07 | MIT (no confirmado en la informacion) | Hugging Face |
| Qwen3-Embedding-0.6B | ~596M | no disponible | 1024 | 67,45 | no disponible en la informacion | Hugging Face |
| setlla-large-zh-v3.5-1792d | ~310M | no disponible | 1792 | 69,30 | no disponible en la informacion | Hugging Face |

El modelo de 360ZhiNao ofrece la mejor media agregada de CMTEB entre los comparables listados, con un tamaño intermedio y una dimensión de salida compacta (768) que reduce el coste de almacenamiento en bases vectoriales frente a alternativas de 1024 o 1792 dimensiones.

## Limitaciones y advertencias

- Modelo exclusivamente de embeddings: no genera texto ni soporta razonamiento, tool calling o agentes.
- Ventana de contexto limitada a 512 tokens; documentos más largos deben fragmentarse, lo que puede perder coherencia en pasajes extensos.
- Entrenado principalmente en chino; el rendimiento en otros idiomas, aunque el corpus incluye inglés, no está documentado y no debe asumirse equiparable.
- Riesgo de sesgos presentes en el corpus de 1T tokens (noticias, web, libros, código): pueden reflejarse en los embeddings y afectar a tareas sensibles.
- La similitud coseno sobre embeddings densos puede producir falsos positivos en textos con solapamiento léxico pero significado distinto; se recomienda validación con datos propios.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar las licencias de los datasets de ajuste fino de CMTEB/MTEB si se redistribuye el modelo.
- No se dispone de información sobre latencia, throughput ni robustez frente a dominios muy especializados (legal, médico) más allá de lo declarado en la model card.
- El repositorio indica 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/360ZhiNao/Zhinao-ChineseModernBert-Embedding
- Repositorio del autor en Hugging Face (referenciado en la model card): https://huggingface.co/qihoo360/Zhinao-ChineseModernBert-Embedding
- Documentación de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Modelos sentence-transformers en Hugging Face: https://huggingface.co/models?library=sentence-transformers
- Leaderboard CMTEB: https://huggingface.co/spaces/mteb/leaderboard
- Búsqueda de ModernBERT en ModelScope: https://modelscope.cn/search?search=ModernBERT
