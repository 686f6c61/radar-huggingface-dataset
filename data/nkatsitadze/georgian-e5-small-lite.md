# nkatsitadze/georgian-e5-small-lite

## Resumen

georgian-e5-small-lite es un modelo de embeddings de texto (sentence-transformers) especializado en recuperación de información en georgiano (ქართული), desarrollado por el usuario de Hugging Face nkatsitadze. Se construye por destilación de conocimiento a partir de intfloat/multilingual-e5-small, un transformer BERT de 118M de parámetros, cuyo vocabulario se ha recortado a georgiano, inglés y ruso, reduciendo el peso a 57,7M de parámetros (223 MB en safetensors frente a los 458 MB del modelo original). Genera vectores de 384 dimensiones y está pensado para búsqueda semántica, RAG, emparejamiento de FAQ y detección de duplicados.

El modelo resuelve un problema concreto: los embeddings multilingües genéricos rinden mal en georgiano, un idioma de bajos recursos con morfología aglutinante y alfabeto propio (mkhedruli). Según la model card, alcanza 77,9 nDCG@10 de media en los subconjuntos georgianos de tareas de retrieval de MTEB, frente a 61,5 del modelo de partida y 73,4 de multilingual-e5-large, que es cinco veces más grande. Su tamaño reducido le permite indexar aproximadamente 102 documentos por segundo en una CPU de portátil (6 hilos) y resolver una consulta en unos 6 ms.

La relevancia actual reside en que demuestra que la destilación desde modelos maestros grandes (bge-m3, bge-reranker-v2-m3) combinada con un recorte de vocabulario específico por idioma puede igualar el rendimiento del modelo completo con la mitad de parámetros y un coste de inferencia muy inferior. La licencia MIT y la compatibilidad con text-embeddings-inference facilitan su despliegue en producción sin coste de licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder), base intfloat/multilingual-e5-small, vocabulario recortado a ka/en/ru |
| Parámetros totales | 57.666.048 (57,7M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (entradas más largas se truncan) |
| Tipos de cuantización | no disponible (pesos safetensors en el repo; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | georgiano (ka), inglés (en), ruso (ru) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimensión del embedding | 384 |
| Pipeline | sentence-similarity / feature-extraction |
| Prefijos requeridos | `"query: "` para consultas, `"passage: "` para documentos |
| Tamaño del repo | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer BERT de 12 capas y 384 dimensiones de salida, heredado de intfloat/multilingual-e5-small. La modificación estructural principal es el recorte del vocabulario multilingüe original a solo los tokens de georgiano, inglés y ruso, lo que reduce los parámetros de embedding y, con ello, el tamaño total de 118M a 57,7M de parámetros sin pérdida de rendimiento en los benchmarks reportados.

El entrenamiento se articula en tres fases. Primero, destilación de embeddings durante 6 épocas sobre 441.624 textos (Wikipedia en georgiano, texto web georgiano de FineWeb-2, WebFAQ georgiano y algo de Wikipedia en inglés), donde el estudiante aprende a reproducir los embeddings de BAAI/bge-m3 comprimidos de 1024 a 384 dimensiones mediante PCA. Segundo, destilación de ranking durante 1 época sobre aproximadamente 175.000 pares pregunta-respuesta en georgiano (principalmente tbilisi-ai-lab/wiki-ka-QA y WebFAQ), cada uno con 7 pasajes "hard negative" de otros artículos, minimizando la divergencia KL entre las distribuciones de puntuaciones del estudiante y del maestro, manteniendo además la pérdida de embeddings de la fase 1. Esta segunda fase se ejecutó dos veces con maestros distintos (bge-m3 y el cross-encoder bge-reranker-v2-m3) y el modelo final es la media de los pesos de ambos. El entrenamiento se realizó en GPUs gratuitas de Kaggle (2× T4) y se eliminaron de los datos de entrenamiento todos los textos que compartían una secuencia de 8 palabras con cualquiera de los 11.941 textos de test de los benchmarks, para evitar contaminación.

## Capacidades

- Generación de embeddings de texto de 384 dimensiones para similitud semántica y recuperación densa.
- Búsqueda semántica multilingüe limitada a georgiano, inglés y ruso, incluyendo recuperación cruzada entre idiomas (en→ka y ka→en).
- Emparejamiento pregunta-respuesta y FAQ matching en georgiano.
- Detección de duplicados y near-duplicates de documentos.
- Recuperación para pipelines RAG (retrieval para chatbots con LLM).
- Extracción de características (feature-extraction) para clasificación y clustering aguas abajo.
- Soporte de los prefijos e5 (`query: ` / `passage: `) mediante `prompt_name="query"` / `"document"` en sentence-transformers.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio: es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica en sitios web o bases documentales en georgiano: el modelo indexa documentos como vectores de 384 dimensiones y recupera por significado, no por coincidencia léxica, lo que resulta crítico dada la riqueza morfológica del georgiano.
- RAG para chatbots con LLM en georgiano: actúa como recuperador en pipelines de generación aumentada, con latencia de ~6 ms por consulta que permite recuperación interactiva sin GPU.
- Emparejamiento de FAQ en atención al cliente: con 56,6 nDCG@10 en GeorgianFAQ, identifica la respuesta correcta entre preguntas parafraseadas de usuarios.
- Detección de duplicados y deduplicación de corpus: agrupa documentos con significado equivalente mediante similitud coseno sobre los embeddings.
- Recuperación cross-lingual en→ka y ka→en: permite que usuarios formulen consultas en inglés y recuperen pasajes georgianos (78,7 y 82,5 nDCG@10 en Belebele), útil en bases de conocimiento bilingües.
- Despliegue en servidores sin GPU: la indexación a ~102 documentos/s en CPU de portátil permite mantener los documentos en infraestructura propia sin aceleradores.
- Clasificación y clustering de textos georgianos: los embeddings sirven como características de entrada para modelos downstream de moderación, etiquetado o análisis de temas.

## Benchmarks y rendimiento

Resultados en nDCG@10 (0-100, mayor es mejor) sobre los subconjuntos georgianos de tareas de retrieval de MTEB, según la model card:

| Modelo | Parámetros | Media | Belebele en→ka | Belebele ka→en | Belebele ka→ka | GeorgianFAQ | WebFAQ ka |
|---|---|---|---|---|---|---|---|
| Snowflake/snowflake-arctic-embed-l-v2.0 | 568M | 85,5 | 85,9 | 89,2 | 91,0 | 69,5 | 91,8 |
| BAAI/bge-m3 (maestro) | 568M | 85,1 | 87,6 | 89,0 | 91,1 | 67,2 | 90,7 |
| georgian-e5-small | 118M | 77,9 | 78,7 | 82,5 | 87,9 | 56,7 | 84,0 |
| **georgian-e5-small-lite (este modelo)** | **58M** | **77,9** | 78,7 | 82,5 | 87,9 | 56,6 | 84,0 |
| l4sha/georgian-text-embeddings | 118M | 74,4 | 72,0 | 79,4 | 82,6 | 56,6 | 81,5 |
| intfloat/multilingual-e5-large | 560M | 73,4 | 77,5 | 87,5 | 81,8 | 45,1 | 74,9 |
| altaidevorg/bge-m3-distill-8l | no disponible | 70,3 | 64,9 | 76,1 | 76,6 | 53,6 | 80,3 |
| Vibels/georgian-e5-finetuned | no disponible | 69,8 | 67,3 | 78,6 | 79,1 | 47,5 | 76,2 |
| microsoft/harrier-oss-v1-270m | 270M | 68,9 | 64,5 | 81,2 | 73,5 | 49,1 | 76,4 |
| Qwen/Qwen3-Embedding-0.6B | 596M | 66,5 | 56,1 | 76,1 | 73,1 | 49,2 | 77,9 |
| intfloat/multilingual-e5-base | 278M | 64,1 | 61,3 | 78,9 | 75,6 | 38,7 | 66,2 |
| intfloat/multilingual-e5-small (punto de partida) | 118M | 61,5 | 57,2 | 72,8 | 67,0 | 41,4 | 69,1 |

Velocidad medida en CPU de portátil (6 hilos, documentos Georgian FAQ): este modelo y multilingual-e5-small indexan ~102 documentos/s; bge-m3, Snowflake-L y e5-large ~11 documentos/s (9 veces más lentos).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (57,7M de parámetros, ~230 MB de pesos más activaciones); puede ejecutarse íntegramente en CPU.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o profesional (T4, A100, H100) para indexación a gran escala; no requiere acelerador para uso interactivo.
- Cabe en cualquier GPU consumer, e incluso en entornos sin GPU; el autor lo ejecutó en 2× T4 (Kaggle) para entrenamiento.
- Opciones de despliegue: sentence-transformers, text-embeddings-inference (etiqueta `text-embeddings-inference` y `endpoints_compatible` en el repo), Hugging Face Inference Endpoints; no se documentan variantes GGUF para llama.cpp ni Ollama.
- Latencia y throughput: ~6 ms por consulta y ~102 documentos/s en indexación sobre CPU de portátil con 6 hilos (documentos Georgian FAQ).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | nDCG@10 medio (georgiano) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| georgian-e5-small-lite | 57,7M | 512 tokens | 77,9 | MIT | Hugging Face |
| georgian-e5-small | 118M | 512 tokens | 77,9 | no disponible en la información | Hugging Face |
| intfloat/multilingual-e5-small | 118M | 512 tokens | 61,5 | MIT | Hugging Face |
| intfloat/multilingual-e5-large | 560M | 512 tokens | 73,4 | MIT | Hugging Face |
| BAAI/bge-m3 | 568M | 8192 tokens (modelo multilingüe de referencia) | 85,1 | MIT | Hugging Face |

Frente a multilingual-e5-small, el modelo lite ofrece +16,4 puntos de nDCG@10 con la mitad de parámetros. Frente a multilingual-e5-large, gana +4,5 puntos con una décima parte de parámetros y ~9 veces más throughput en CPU. Solo los modelos de 568M (bge-m3, Snowflake Arctic Embed L v2.0) lo superan, a costa de un tamaño y un coste de inferencia muy superiores.

## Limitaciones y advertencias

- El benchmark georgiano es pequeño y las decisiones de diseño del modelo se guiaron por él, según reconoce el autor; los resultados pueden no generalizar a dominios fuera de los evaluados.
- Riesgo de alucinación no aplicable directamente (no genera texto), pero los embeddings pueden producir similitudes engañosas en dominios muy alejados de los datos de entrenamiento (Wikipedia, web, FAQ).
- Contexto limitado a 512 tokens: los documentos largos deben dividirse en pasajes, lo que puede perder coherencia global.
- Cobertura lingüística restringida a georgiano, inglés y ruso; otros idiomas no están soportados tras el recorte de vocabulario.
- Requiere el uso correcto de los prefijos `query: ` y `passage: `; omitirlos degrada el rendimiento (el modelo original bajaba de 61,5 a 57,3 con prefijos oficiales, y el autor reporta su mejor configuración sin ellos).
- Entrenado principalmente con datos de Wikipedia, FineWeb-2 y WebFAQ: posible sesgo hacia registros enciclopédicos y de FAQ, con menor cobertura de jerga técnica, dialectos o texto informal.
- Licencia MIT: permite uso comercial sin restricciones, pero el modelo deriva de multilingual-e5-small (MIT) y de la destilación de bge-m3 (MIT); conviene verificar las licencias de los datasets de entrenamiento (Wikipedia, FineWeb-2, WebFAQ, wiki-ka-QA) para usos concretos.
- Sin descargas ni validación independiente en el momento de la ficha: los resultados proceden únicamente de la model card del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nkatsitadze/georgian-e5-small-lite
- Versión completa (sin recorte de vocabulario): https://huggingface.co/nkatsitadze/georgian-e5-small
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Maestro de destilación: https://huggingface.co/BAAI/bge-m3
- Maestro cross-encoder: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Dataset de pares QA: https://huggingface.co/datasets/tbilisi-ai-lab/wiki-ka-QA
- Dataset WebFAQ: https://huggingface.co/datasets/PaDaS-Lab/webfaq
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
