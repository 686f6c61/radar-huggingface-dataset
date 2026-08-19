# NYSgpt/44b-reranker-minilm-l6

## Resumen

El modelo `NYSgpt/44b-reranker-minilm-l6` es un reranker de tipo cross-encoder desarrollado por NYSgpt (Brendan Stanton) para la reordenación de documentos científicos en tareas de recuperación de información. Está fine-tuneado sobre el modelo base `cross-encoder/ms-marco-MiniLM-L-6-v2` (22,7 millones de parámetros) utilizando un corpus propio llamado 44B, que contiene pares de revisiones por pares (peer reviews) y los artículos científicos a los que se refieren. La singularidad de su entrenamiento radica en que las consultas son resúmenes escritos por revisores expertos, no generados por LLM ni basados en clics, lo que proporciona una señal de relevancia más fiable.

Con solo 22,7 millones de parámetros y una latencia de 7,4 ms por consulta, este modelo consigue superar en precisión a alternativas mucho más grandes como `gte-reranker-modernbert-base` (150M) y a métodos de primera etapa como BM25 o embeddings densos de OpenAI en una evaluación específica de 9 vías con negativos difíciles. Su relevancia actual radica en ofrecer un equilibrio excepcional entre coste computacional y rendimiento para sistemas de recuperación aumentada por generación (RAG) en el ámbito científico, donde la precisión en la selección de documentos es crítica.

La licencia Apache 2.0 permite uso comercial sin restricciones, y su pequeño tamaño lo hace desplegable en hardware modesto, incluida CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en MiniLM-L6 (BERT de 6 capas, 12 heads, 384 dimensiones ocultas) |
| Parametros totales | 22.713.601 (22,7M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens (máximo usado en entrenamiento; el base soporta 512) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (entrenado principalmente con textos científicos en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en la arquitectura MiniLM-L6, una variante compacta de BERT con 6 capas de transformer y 22,7 millones de parámetros. A diferencia de los bi-encoders, un cross-encoder procesa conjuntamente la consulta y el documento como una única secuencia, lo que permite una modelización más fina de la interacción entre ambos. Esta arquitectura es adecuada para tareas de reranking donde se evalúan un número limitado de candidatos (típicamente entre 10 y 100) y la latencia no es un factor limitante.

El entrenamiento se realizó sobre pares "revisión por pares → artículo" extraídos del corpus 44B, con 24.177 grupos de entrenamiento, cada uno compuesto por una consulta (el resumen o meta-resumen de una revisión oficial) y 8 documentos candidatos: 1 positivo (el artículo al que se adjunta la revisión) y 7 negativos difíciles minados mediante similitud semántica (HNSW sobre embeddings de `text-embedding-3-small`) y similitud léxica (Postgres FTS sobre abstracts). Las fuentes fueron artículos de ICLR 2024, ICLR 2025 y NeurIPS 2024, con división disjunta por artículo para evitar fuga de datos.

El objetivo de entrenamiento fue grouped cross-entropy (una positiva contra 7 negativas por grupo), con 2 épocas, longitud máxima de secuencia de 256 tokens, truncamiento de consulta/documento a 600/900 caracteres, 8 grupos por batch, learning rate 2e-5 y hardware de una única NVIDIA A10G (g5.xlarge). El entrenamiento completo tardó solo 621 segundos. La innovación principal no es arquitectónica sino de datos: la supervisión proviene de resúmenes escritos por revisores expertos, no de heurísticas ni de generación automática, lo que reduce el error del modelo base en un 62,3% relativo.

## Capacidades

- Reranking de documentos: dado un query y un conjunto de candidatos, devuelve una puntuación de relevancia para cada par, permitiendo reordenar los resultados.
- Especialización en dominios científicos: entrenado específicamente con artículos de conferencias de aprendizaje automático (ICLR, NeurIPS) y sus revisiones, por lo que entiende vocabulario técnico y matices de la literatura académica.
- Alta precisión con negativos difíciles: en la evaluación de 9 vías, alcanza un P@1 de 0,8654, superando a métodos de primera etapa como BM25 (0,8562) y a embeddings densos de OpenAI (0,6807).
- Baja latencia: 7,4 ms por consulta en GPU, lo que permite su integración en pipelines de recuperación en tiempo real.
- Compatibilidad con sentence-transformers: se puede cargar y usar directamente con la librería `sentence-transformers` para tareas de reranking.
- No soporta generación de texto, tool calling ni capacidades multimodales: es un modelo puramente discriminativo para ranking.

## Casos de uso

- Búsqueda de literatura científica: un investigador introduce una consulta sobre un tema concreto y el modelo reordena los artículos candidatos obtenidos mediante búsqueda lexical o vectorial, priorizando los más relevantes. Su precisión en dominios de ML lo hace especialmente útil para bases de datos de papers como arXiv o actas de conferencias.
- Sistemas RAG para documentos técnicos: en un pipeline de recuperación aumentada por generación, el reranker se coloca después de la primera etapa de recuperación para seleccionar los 3-5 documentos más relevantes que se pasarán al LLM. Su baja latencia permite procesar decenas de candidatos sin penalizar el tiempo de respuesta.
- Revisión por pares asistida: los editores de conferencias pueden usar el modelo para emparejar revisiones con artículos o para detectar revisiones duplicadas o solapadas, aprovechando que ha sido entrenado precisamente con ese tipo de datos.
- Filtrado de noticias o alertas científicas: dado un conjunto de nuevos preprints, el modelo puede priorizar aquellos que coinciden con los intereses de un investigador, usando como consulta un perfil o resumen de sus líneas de trabajo.
- Clasificación de tickets de soporte técnico: aunque no es su dominio principal, la capacidad de reranking puede adaptarse a otros ámbitos con fine-tuning, dada su base MiniLM y su licencia permisiva.
- Evaluación de calidad de recuperación: el modelo puede usarse como oráculo para medir la relevancia de resultados de búsqueda en sistemas de información científica, proporcionando una señal más fiable que los clics o las métricas heurísticas.

## Benchmarks y rendimiento

La evaluación se realizó sobre un conjunto de test de 3.157 consultas (sobre 1.534 artículos) con 9 candidatos por consulta (1 positivo y 8 negativos difíciles). Los resultados se muestran en la siguiente tabla, comparando con el modelo base y con otros métodos de primera etapa.

| Metodo | P@1 | P@3 | MRR | Mean rank | ms/query |
|---|---:|---:|---:|---:|---:|
| **44b-reranker-minilm-l6** (este modelo) | **0,8654** | **0,9541** | **0,9141** | **1,322** | **7,4** |
| `ms-marco-MiniLM-L-6-v2` (base) | 0,6427 | 0,8166 | 0,7500 | 2,210 | 9,4 |
| `gte-reranker-modernbert-base` (150M, off-the-shelf) | 0,8334 | — | — | — | 53,1 |
| BM25 (lexical) | 0,8562 | — | 0,9046 | — | — |
| Hybrid RRF (k=60) | 0,7282 | — | 0,7881 | — | — |
| Dense embeddings OpenAI `text-embedding-3-small` | 0,6807 | — | 0,7450 | — | — |
| Azar (9 candidatos) | 0,1111 | 0,3333 | — | 5,000 | — |

Nota: los datos de `gte-reranker-modernbert-base` y los métodos de primera etapa provienen de la misma evaluación descrita en la model card. No se han publicado resultados en otros benchmarks estándar (MMLU, HumanEval, etc.) porque este modelo no es generativo.

## Requisitos de hardware

- Inferencia extremadamente ligera: 22,7 millones de parámetros ocupan aproximadamente 91 MB en FP32 y 45 MB en FP16, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM.
- Puede ejecutarse en CPU sin problemas: la latencia en CPU será mayor que los 7,4 ms/query reportados en GPU, pero sigue siendo viable para aplicaciones de baja concurrencia.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 o superior, RTX series) o incluso hardware integrado. Se entrenó en una NVIDIA A10G, pero la inferencia no requiere ese nivel.
- Opciones de despliegue: compatible con `sentence-transformers` (carga directa), Hugging Face Inference Endpoints (text-ranking), y puede exportarse a ONNX o TensorRT para optimización.
- Throughput estimado: a 7,4 ms/query en GPU, se pueden procesar aproximadamente 135 consultas por segundo en un solo dispositivo, asumiendo un batch de 1. Con batching, el throughput puede aumentar significativamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | P@1 (9-way) | ms/query | Licencia |
|---|---|---|---:|---:|---|
| **44b-reranker-minilm-l6** | 22,7M | 256 | 0,8654 | 7,4 | Apache 2.0 |
| `ms-marco-MiniLM-L-6-v2` (base) | 22,7M | 512 | 0,6427 | 9,4 | Apache 2.0 |
| `gte-reranker-modernbert-base` (off-the-shelf) | 149,6M | 512 | 0,8334 | 53,1 | MIT |
| `NYSgpt/44b-reranker-gte-modernbert` (hermano) | 149,6M | 512 | 0,9290 | 41,1 | Apache 2.0 |

El modelo de 22,7M supera al base del que parte por un margen enorme (+22 puntos de P@1) y también supera al `gte-reranker-modernbert-base` de 150M con 7 veces menos parámetros y 7 veces menos latencia. El hermano mayor (`gte-modernbert`) ofrece mayor precisión (0,9290) pero a costa de más recursos, lo que lo convierte en la opción de calidad máxima dentro de la misma familia.

## Limitaciones y advertencias

- Dominio limitado: entrenado exclusivamente con artículos de ICLR y NeurIPS (2024-2025), por lo que su rendimiento en otros dominios científicos (biología, física, humanidades) puede degradarse significativamente.
- Contexto corto: la longitud máxima de secuencia usada en entrenamiento es de 256 tokens, lo que puede ser insuficiente para documentos extensos. Se recomienda truncar o dividir los textos antes de pasarlos al modelo.
- Evaluación cerrada: los resultados reportados corresponden a una tarea de ranking de 9 vías con negativos difíciles, no a una búsqueda en corpus abierto. Las métricas no son directamente comparables con benchmarks de recuperación estándar como MS MARCO o BEIR.
- Posible sesgo hacia conferencias concretas: al entrenar solo con ICLR y NeurIPS, el modelo puede favorecer estilos de escritura y temáticas propias de esas conferencias, discriminando artículos de otras procedencias.
- No es un modelo generativo: no puede responder preguntas ni generar texto; su única función es puntuar la relevancia de pares consulta-documento.
- No se han documentado sesgos demográficos o de contenido, pero al estar entrenado con textos académicos en inglés, su vocabulario y comprensión están limitados a ese idioma y registro.
- La licencia Apache 2.0 permite uso comercial, pero el corpus 44B puede tener restricciones adicionales; se recomienda revisar los términos del corpus antes de usarlo para entrenar modelos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NYSgpt/44b-reranker-minilm-l6
- Modelo hermano de mayor calidad: https://huggingface.co/NYSgpt/44b-reranker-gte-modernbert
- Corpus 44B: https://44b.nysgpt.com
- Librería sentence-transformers: https://github.com/huggingface/sentence-transformers
