# nkatsitadze/georgian-e5-small

## Resumen

georgian-e5-small es un modelo de embeddings de texto especializado en georgiano (ქართული), desarrollado por nkatsitadze. Se trata de un fine-tuning por destilación de intfloat/multilingual-e5-small (118M parámetros) orientado a tareas de búsqueda semántica y recuperación de información (retrieval) en georgiano. Convierte texto en vectores de 384 dimensiones, de modo que textos con significado similar quedan próximos en el espacio vectorial, lo que lo hace útil para búsqueda semántica, RAG, emparejamiento de FAQ y detección de duplicados.

El modelo parte de la arquitectura BERT de multilingual-e5-small y se entrena mediante destilación de conocimiento desde modelos "profesor" mucho mayores (BAAI/bge-m3 y BAAI/bge-reranker-v2-m3). Su relevancia radica en que mejora sustancialmente el rendimiento en georgiano respecto al modelo base (77,9 frente a 61,5 nDCG@10 en las tareas de retrieval georgianas de MTEB), superando incluso a modelos cinco veces más grandes como multilingual-e5-large, manteniendo un coste computacional muy bajo: funciona en CPU a unas 100 documentos por segundo.

El modelo soporta georgiano e inglés, tiene licencia MIT y está disponible en formato safetensors para su uso con sentence-transformers y text-embeddings-inference. Existe además una versión "lite" con vocabulario reducido que mantiene las mismas puntuaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder), fine-tuning de intfloat/multilingual-e5-small |
| Parametros totales | 117.653.760 (~118M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (entradas más largas se truncan) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | georgiano (ka), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo BERT con 118M parámetros que produce embeddings de 384 dimensiones. Se entrena en dos fases mediante destilación de conocimiento desde modelos profesor de mayor tamaño. En la primera fase (destilación de embeddings, 6 épocas) el estudiante aprende a reproducir los embeddings de BAAI/bge-m3 comprimidos de 1024 a 384 dimensiones mediante PCA, sobre 441.624 textos procedentes de Wikipedia georgiana, texto web georgiano de FineWeb-2, WebFAQ georgiano y algo de Wikipedia inglesa.

En la segunda fase (destilación de ranking, 1 época) se usan aproximadamente 175.000 pares pregunta-pasaje en georgiano (principalmente de tbilisi-ai-lab/wiki-ka-QA y WebFAQ), cada uno con 7 pasajes "hard negative" de otros artículos. El estudiante aprende a ordenar los pasajes como lo hace el profesor mediante divergencia KL entre distribuciones de puntuaciones, manteniendo además la pérdida de embeddings de la fase 1. Este proceso se realiza dos veces con dos profesores distintos (bge-m3 y el cross-encoder bge-reranker-v2-m3), y el modelo final es la media de los pesos de ambos. El entrenamiento se ejecutó en GPUs gratuitas de Kaggle (2× T4) y se eliminaron de los datos de entrenamiento todos los textos que compartían una secuencia de 8 palabras con cualquiera de los 11.941 textos de test de los benchmarks.

## Capacidades

- Generación de embeddings de texto de 384 dimensiones para similitud semántica y recuperación.
- Búsqueda semántica y retrieval multilingüe entre georgiano e inglés (en ambas direcciones).
- Emparejamiento pregunta-respuesta y FAQ matching.
- Detección de duplicados y near-duplicates.
- Recuperación de pasajes para pipelines RAG (retrieval para chatbots con LLM).
- Soporte de los prefijos e5 (`"query: "` y `"passage: "`) mediante `prompt_name="query"` / `"document"` en sentence-transformers.
- Compatible con text-embeddings-inference y endpoints compatibles.
- No soporta tool calling, agentes ni generación de texto: es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica en georgiano: indexar un corpus de documentos georgianos y recuperar los más relevantes ante una consulta, aprovechando la ventana de 512 tokens por pasaje y su velocidad de ~100 documentos/s en CPU.
- RAG para chatbots en georgiano: usar el modelo como recuperador de pasajes antes de pasar el contexto a un LLM generador; su bajo coste permite mantener los documentos en servidores propios sin GPU.
- Emparejamiento de FAQ: comparar la consulta del usuario con una base de preguntas frecuentes mediante similitud de embeddings, adecuado por su entrenamiento específico en WebFAQ georgiano.
- Detección de duplicados y near-duplicates: comparar embeddings de documentos para identificar contenido repetido en corpus georgianos.
- Búsqueda cross-lingüe georgiano-inglés: recuperar pasajes en inglés ante consultas en georgiano y viceversa, gracias a su entrenamiento con tareas Belebele en ambas direcciones.
- Deduplicación y curación de datasets: filtrar textos casi idénticos en la construcción de corpus de entrenamiento en georgiano.
- Búsqueda en atención al cliente: desplegar un motor de búsqueda semántica sobre documentación de producto en georgiano con latencia de ~6 ms por consulta en CPU de portátil.

## Benchmarks y rendimiento

nDCG@10 (0-100, mayor es mejor) en los subconjuntos georgianos de las tareas de retrieval de MTEB. Belebele tiene tres direcciones: pregunta en inglés → pasaje en georgiano, pregunta en georgiano → pasaje en inglés, y georgiano → georgiano.

| Modelo | Params | avg | Belebele en→ka | Belebele ka→en | Belebele ka→ka | GeorgianFAQ | WebFAQ ka |
|---|---|---|---|---|---|---|---|
| Snowflake/snowflake-arctic-embed-l-v2.0 | 568M | 85,5 | 85,9 | 89,2 | 91,0 | 69,5 | 91,8 |
| BAAI/bge-m3 (profesor) | 568M | 85,1 | 87,6 | 89,0 | 91,1 | 67,2 | 90,7 |
| **georgian-e5-small (este modelo)** | **118M** | **77,9** | 78,7 | 82,5 | 87,9 | 56,7 | 84,0 |
| georgian-e5-small-lite | 58M | 77,9 | 78,7 | 82,5 | 87,9 | 56,6 | 84,0 |
| l4sha/georgian-text-embeddings | 118M | 74,4 | 72,0 | 79,4 | 82,6 | 56,6 | 81,5 |
| intfloat/multilingual-e5-large | 560M | 73,4 | 77,5 | 87,5 | 81,8 | 45,1 | 74,9 |
| altaidevorg/bge-m3-distill-8l | no disponible | 70,3 | 64,9 | 76,1 | 76,6 | 53,6 | 80,3 |
| Vibels/georgian-e5-finetuned | no disponible | 69,8 | 67,3 | 78,6 | 79,1 | 47,5 | 76,2 |
| microsoft/harrier-oss-v1-270m | 270M | 68,9 | 64,5 | 81,2 | 73,5 | 49,1 | 76,4 |
| Qwen/Qwen3-Embedding-0.6B | 596M | 66,5 | 56,1 | 76,1 | 73,1 | 49,2 | 77,9 |
| intfloat/multilingual-e5-base | 278M | 64,1 | 61,3 | 78,9 | 75,6 | 38,7 | 66,2 |
| intfloat/multilingual-e5-small (punto de partida) | 118M | 61,5 | 57,2 | 72,8 | 67,0 | 41,4 | 69,1 |

Velocidad en CPU de portátil (6 hilos, documentos de Georgian FAQ): este modelo y multilingual-e5-small indexan ~102 documentos/s; bge-m3, Snowflake-L y e5-large ~11 documentos/s (9 veces más lentos).

## Requisitos de hardware

- VRAM estimada: muy baja; con 118M parámetros en fp32 ocupa aproximadamente 0,5 GB, y menos aún en fp16 o int8.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es más que suficiente; también funciona en GPU de datacenter (A100, H100) para despliegues de alto throughput.
- Cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: sentence-transformers, text-embeddings-inference, endpoints compatibles; también puede exportarse a otros formatos, aunque no se documentan cuantizaciones específicas.
- Latencia y throughput: ~6 ms por consulta y ~102 documentos/s en CPU de portátil (6 hilos) para indexación.

## Comparativa con modelos similares

| Modelo | Params | Contexto | avg nDCG@10 (georgiano) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| georgian-e5-small | 118M | 512 | 77,9 | MIT | Hugging Face |
| intfloat/multilingual-e5-small | 118M | 512 | 61,5 | MIT | Hugging Face |
| intfloat/multilingual-e5-large | 560M | 512 | 73,4 | MIT | Hugging Face |
| BAAI/bge-m3 | 568M | 8192 | 85,1 | MIT | Hugging Face |
| l4sha/georgian-text-embeddings | 118M | no disponible | 74,4 | no disponible (entrenado con MS MARCO, licencia no comercial) | Hugging Face |

## Limitaciones y advertencias

- El benchmark es pequeño y también guió las decisiones de diseño: la receta final se eligió entre varias variantes por su puntuación en estas tareas, por lo que los números son ligeramente optimistas; la mejora real frente a la mejor ejecución individual se estima en torno a medio punto.
- Entradas de más de 512 tokens se truncan, por lo que es necesario dividir documentos largos en pasajes.
- Requiere los prefijos e5 (`"query: "` y `"passage: "`) para un funcionamiento óptimo; sin ellos el rendimiento puede degradarse.
- Solo soporta georgiano e inglés; no está pensado para otros idiomas.
- Es un modelo exclusivamente de embeddings: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- Riesgo de sesgos heredados de los corpus de entrenamiento (Wikipedia, FineWeb-2, WebFAQ) y de los modelos profesor.
- No se documentan riesgos específicos de alucinación al no ser un modelo generativo, pero la recuperación puede devolver pasajes irrelevantes en dominios muy alejados de los datos de entrenamiento.
- Licencia MIT: permite uso comercial, pero conviene verificar las licencias de los datasets de entrenamiento subyacentes si se redistribuye el modelo en productos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nkatsitadze/georgian-e5-small
- Versión lite: https://huggingface.co/nkatsitadze/georgian-e5-small-lite
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Profesor bge-m3: https://huggingface.co/BAAI/bge-m3
- Profesor reranker: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Dataset wiki-ka-QA: https://huggingface.co/datasets/tbilisi-ai-lab/wiki-ka-QA
