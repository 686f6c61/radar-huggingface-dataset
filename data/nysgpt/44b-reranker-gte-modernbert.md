# NYSgpt/44b-reranker-gte-modernbert

## Resumen

El modelo `NYSgpt/44b-reranker-gte-modernbert` es un cross-encoder de reranking especializado en documentos científicos, desarrollado por NYSgpt (Brendan Stanton). Se obtiene por fine-tuning del modelo `Alibaba-NLP/gte-reranker-modernbert-base` (basado en ModernBERT, un encoder-only transformer moderno de 149,6 millones de parámetros) sobre un corpus de pares «revisión por pares → paper» extraído del corpus 44B. La supervisión es inusual: la consulta es el resumen escrito por un revisor experto sobre un artículo, y el positivo es el propio artículo revisado, sin etiquetas heurísticas ni generadas por LLM.

El modelo resuelve el problema de seleccionar el documento correcto dentro de un conjunto de candidatos (reranking) en el ámbito académico, superando en las evaluaciones publicadas a métodos generalistas como embeddings densos de OpenAI, búsqueda híbrida y BM25. Su relevancia radica en demostrar que un modelo especializado y pequeño (149M) puede superar a alternativas mucho más grandes o genéricas en tareas de ranking de dominio, con una latencia de 41 ms por consulta en hardware auto-alojado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en ModernBERT (encoder-only transformer) |
| Parametros totales | 149.605.633 (149,6 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (secuencia maxima de entrenamiento); el modelo base ModernBERT soporta hasta 8192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente ingles, dado el corpus de origen) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, un transformer encoder-only que incorpora optimizaciones modernas sobre BERT (rotary embeddings, attention con FlashAttention, normalización, etc.) y que fue presentado en el articulo «Smarter, Better, Faster, Longer: A Modern Bidirectional Encoder...» (arXiv:2412.13663). El fine-tuning parte de `Alibaba-NLP/gte-reranker-modernbert-base` (150M de parametros) y se entrena con una funcion de perdida de entropia cruzada agrupada: cada grupo contiene un positivo y siete negativos minados por similitud semantica (HNSW sobre `text-embedding-3-small`) y lexica (Postgres FTS sobre abstracts). El entrenamiento se realizo en 2 epocas con una secuencia maxima de 512 tokens, truncando consultas y documentos a 600 y 900 caracteres respectivamente, con una tasa de aprendizaje de 2e-5, en una unica NVIDIA A10G (g5.xlarge) durante 83 minutos, reduciendo la perdida de 0,4734 a 0,0883.

Los datos de entrenamiento provienen de 24.177 grupos con 7 negativos por grupo, 12.058 papers distintos en entrenamiento y 3.099 papers reservados para validacion y test, con divisiones disjuntas por paper (no por par) para evitar fuga de informacion. Las fuentes son ICLR 2024, ICLR 2025 y NeurIPS 2024.

## Capacidades

- Reranking de documentos cientificos: dado un query en prosa (resumen de una revision por pares), ordena un conjunto de candidatos y devuelve el mas relevante.
- Especializado en dominios academicos: entrenado exclusivamente sobre revisiones de conferencias de aprendizaje automatico (ICLR, NeurIPS).
- Manejo de consultas largas: soporta queries de ~700 caracteres (~174 tokens) de texto fluido, algo poco comun en modelos de ranking.
- Integrable como segunda etapa en pipelines de retrieval-augmented generation (RAG) o busqueda en dos fases.
- No genera texto: es un modelo encoder, no un LLM generativo.
- No soporta tool calling ni agentes.

## Casos de uso

- Busqueda de literatura cientifica: dado un resumen descriptivo de un trabajo, el modelo selecciona el paper correcto entre una lista de candidatos recuperados por BM25 o embeddings, mejorando la precision de top-1 en un 25% respecto a embeddings generalistas.
- Revision por pares asistida: en plataformas de gestion de conferencias, puede emparejar automaticamente una revision con el articulo correspondiente, reduciendo errores administrativos.
- Deduplicacion de documentos academicos: dado un texto que describe un paper (por ejemplo, un resumen generado por un LLM), identifica si corresponde a un articulo ya existente en una base de datos.
- Moderacion de contenido en repositorios: verifica que una revision o comentario esta asociado al paper correcto, evitando asignaciones erroneas.
- Asistente de investigacion personal: integrado en un sistema RAG, reranker los resultados de una busqueda inicial para mostrar los articulos mas relevantes a partir de una descripcion en lenguaje natural.
- Recomendacion de articulos en plataformas de preprints: dado el resumen de un nuevo articulo, selecciona entre papers relacionados los que probablemente sean citados o relevantes para el autor.

## Benchmarks y rendimiento

El modelo se evaluo sobre 3.157 consultas held-out (disjuntas de entrenamiento) sobre 1.534 papers, con una tarea de ranking de 9 candidatos (1 positivo y 8 negativos duros). Los resultados comparados con el modelo base y con otros metodos de primera etapa son:

| Modelo / metodo | P@1 | P@3 | MRR | Mean rank | ms/query |
|---|---:|---:|---:|---:|---:|
| **44b-reranker-gte-modernbert** (este modelo) | **0,9290** | **0,9816** | **0,9563** | **1,148** | 41,1 |
| `gte-reranker-modernbert-base` (base) | 0,8334 | 0,9262 | 0,8888 | 1,464 | 53,1 |
| `44b-reranker-minilm-l6` (hermano, 22,7M) | 0,8654 | 0,9540 | 0,9140 | no disponible | 7,4 |
| BM25 (busqueda lexica) | 0,8562 | no disponible | 0,9046 | no disponible | no disponible |
| Hybrid RRF (k=60) | 0,7282 | no disponible | 0,7881 | no disponible | no disponible |
| Dense embeddings OpenAI `text-embedding-3-small` | 0,6807 | no disponible | 0,7450 | no disponible | no disponible |
| Azar | 0,1111 | 0,3333 | — | 5,000 | — |

La tasa de error se reduce de 16,66% a 7,10% respecto al modelo base, una mejora relativa del 57,4%. La significancia estadistica se reporta con z ≈ 11,9 sobre error estandar no pareado (conservador, al ser mediciones pareadas).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 149,6M de parametros (~600 MB en fp32, ~300 MB en fp16), por lo que cabe en cualquier GPU consumer con al menos 1 GB de VRAM, e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna (NVIDIA T4, RTX 3060, A10G, etc.) es suficiente. El entrenamiento se realizo en una unica A10G (g5.xlarge) en 83 minutos.
- Inferencia en CPU: viable, con latencia esperable de decenas de milisegundos por consulta (41 ms medidos en GPU, probablemente mas en CPU).
- Opciones de despliegue: compatible con sentence-transformers, Text Embeddings Inference (TEI) y endpoints compatibles con Hugging Face. Puede servirse con vLLM (aunque es un encoder, no un LLM generativo) o con librerias de cross-encoders como `sentence-transformers` o `FlagEmbedding`.
- Throughput: 41,1 ms/query medido en el hardware de evaluacion (no especificado), lo que permite ~24 consultas por segundo en un solo dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | P@1 (9-way) | Latencia | Licencia |
|---|---|---|---|---|---|
| **NYSgpt/44b-reranker-gte-modernbert** | 149,6M | 512 (entrenamiento) | 0,9290 | 41,1 ms/query | Apache 2.0 |
| `Alibaba-NLP/gte-reranker-modernbert-base` | 150M | 8192 (base) | 0,8334 | 53,1 ms/query | Apache 2.0 |
| `NYSgpt/44b-reranker-minilm-l6` | 22,7M | 512 (entrenamiento) | 0,8654 | 7,4 ms/query | Apache 2.0 |
| OpenAI `text-embedding-3-small` (embeddings densos) | no disponible | no disponible | 0,6807 | no disponible | Propietaria |

El modelo supera a su base en +9,6 puntos de P@1 y reduce la latencia en un 23%. Frente al modelo hermano miniLM, sacrifica ~6 puntos de P@1 a cambio de ~5,5 veces mas velocidad. Comparado con embeddings densos de OpenAI, la ventaja es de +25 puntos en P@1, aunque hay que tener en cuenta que estos embeddings no son rerankers especificos.

## Limitaciones y advertencias

- El registro de consultas es prosa larga (~700 caracteres, ~174 tokens). El modelo no ha visto consultas cortas de palabras clave; usarlo con queries tipo «transformers attention» probablemente degrade su rendimiento.
- La evaluacion se realizo en una tarea cerrada de 9 candidatos, no en busqueda de corpus abierto. Un P@1 de 0,9290 no implica que encuentre el paper correcto entre millones de documentos.
- Dominio limitado: entrenado exclusivamente con papers de ICLR y NeurIPS (aprendizaje automatico). Su rendimiento en otras disciplinas cientificas no esta verificado.
- Los negativos se minaron con embeddings de OpenAI y busqueda lexica; puede haber sesgo hacia esos metodos de mineria.
- Se detecto que el 1,5% de los positivos de test aparecen como negativos de otros queries, lo que sesga ligeramente en contra del modelo, pero no se evaluo el impacto en produccion.
- No se proporcionan datos sobre sesgos demograficos o de idioma; el corpus es en ingles.
- Licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo no incluye garantias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NYSgpt/44b-reranker-gte-modernbert
- Modelo hermano (miniLM): https://huggingface.co/NYSgpt/44b-reranker-minilm-l6
- Corpus 44B: https://44b.nysgpt.com
- Paper de ModernBERT: https://arxiv.org/abs/2412.13663
- Repositorio de ModernBERT: https://github.com/AnswerDotAI/ModernBERT
- Perfil del autor en Hugging Face: https://huggingface.co/NYSgpt/models
