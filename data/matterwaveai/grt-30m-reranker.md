# MatterWaveAI/grt-30m-reranker

## Resumen

GRT-30M-Reranker es un modelo de reranking del tipo cross-encoder desarrollado por MatterWaveAI, diseñado para reordenar un conjunto de documentos candidatos en función de su relevancia respecto a una consulta. Se construye sobre el modelo base MatterWaveAI/grt-30m-embedding y emplea una arquitectura que el autor denomina "rotational transformer", basada en rotaciones de Givens y álgebra de Clifford, con la particularidad de no contener capas `nn.Linear`. Cuenta con 29.305.627 parámetros según la model card (29.844.858 según los pesos en safetensors) y está publicado bajo licencia Apache 2.0.

El modelo resuelve la segunda etapa de los pipelines de recuperación de información: dado un conjunto de documentos previamente recuperados por un bi-encoder, el cross-encoder evalúa cada par consulta-documento de forma conjunta y produce una puntuación de relevancia más precisa. Su tamaño reducido (30M de parámetros) lo hace adecuado para entornos con recursos limitados o para etapas de reranking de baja latencia.

Es relevante por su enfoque arquitectónico poco habitual (sustitución de proyecciones densas por rotaciones estructuradas) y por su compatibilidad con las interfaces estándar de Hugging Face y sentence-transformers. No obstante, el modelo es muy reciente (publicado en noviembre de 2026), no tiene descargas ni valoraciones registradas en Hugging Face, y no se dispone de información sobre idiomas soportados ni sobre el proceso de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Rotational transformer (GRT, Givens rotations, Clifford algebra); cross-encoder `GRTForSequenceClassification` |
| Parámetros totales | 29.305.627 según model card; 29.844.858 según safetensors |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors; compatible con cuantización estándar vía herramientas de Hugging Face, sin datos publicados) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder construido sobre la arquitectura GRT (rotational transformer) del modelo base grt-30m-embedding. La innovación principal declarada por el autor es la eliminación total de capas `nn.Linear`: en su lugar, el modelo utiliza rotaciones 2D de Givens en cascada y permutaciones tipo butterfly para mezclar pares de coordenadas planares, con un coste de O(D log D) pasos. El autor relaciona este diseño con el álgebra de Clifford y lo enmarca en una familia de modelos denominada "matterwave". La cabeza de clasificación para ranking se implementa como `GRTForSequenceClassification`.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni sobre el proceso de ajuste específico para la tarea de reranking. La model card únicamente indica que el modelo deriva del embedding grt-30m-embedding mediante fine-tuning, pero no detalla la metodología.

## Capacidades

- Reranking de documentos: puntúa pares consulta-documento y devuelve una ordenación por relevancia mediante `CrossEncoder.rank`.
- Integración con sentence-transformers: compatible con la clase `CrossEncoder` y con `AutoModelForSequenceClassification` de Hugging Face.
- Pipeline híbrido de dos etapas: puede combinarse con el bi-encoder grt-30m-embedding para recuperación y reranking en cascada.
- Evaluación de similitud semántica: obtiene un Spearman de 61,75 en STS-B test, lo que indica capacidad de capturar similitud semántica a nivel de par.
- Sin capas `nn.Linear`: la arquitectura basada en rotaciones puede ofrecer ventajas de eficiencia computacional en determinados hardware, aunque no se han publicado mediciones detalladas.
- No se dispone de información sobre soporte de tool calling, agentes, modo thinking, visión, audio ni capacidades multilingües.

## Casos de uso

- Reranking en motores de búsqueda internos: tras una recuperación inicial con un bi-encoder, el cross-encoder reordena los candidatos para mejorar la precisión de los primeros resultados; su tamaño de 30M permite desplegarlo en la misma instancia que el recuperador.
- Búsqueda semántica en documentación técnica: dado un conjunto de fragmentos recuperados, el modelo puntúa cada par consulta-fragmento y selecciona los más relevantes para alimentar un sistema RAG.
- Filtrado de candidatos en sistemas de preguntas y respuestas: el modelo puede descartar documentos irrelevantes antes de pasarlos a un LLM generador, reduciendo el coste de tokens y las alucinaciones por contexto irrelevante.
- Deduplicación y ordenación de resultados en agregadores de contenido: el cross-encoder permite priorizar artículos o entradas según su afinidad con la consulta del usuario.
- Evaluación de calidad de recuperación en pipelines de investigación: sirve como componente de referencia para medir MRR y NDCG en experimentos de recuperación de información.
- Despliegue en entornos con recursos limitados: con 30M de parámetros y un repo de 0,1 GB, puede ejecutarse en CPU o en GPUs de gama baja para tareas de ranking en tiempo real.
- Prototipado de arquitecturas alternativas: útil para investigadores interesados en arquitecturas sin proyecciones densas y en el estudio de rotaciones de Givens en transformers.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Modelo / Pipeline | Arquitectura | AllNLI Rerank MRR@10 | AllNLI Rerank NDCG@10 | Recall@1 | Recall@3 | STS-B Test Spearman | Throughput (pares/s) |
|---|---|---|---|---|---|---|---|
| grt-30m (base sin alinear) | GRTModel (circular pool) | 37,99 | 52,12 | 20,5% | 41,0% | 32,51 | 120 |
| grt-30m-embedding (bi-encoder) | SentenceTransformer (circular) | 52,56 | 63,74 | 32,5% | 68,0% | 62,42 | 152 |
| grt-30m-reranker (cross-encoder) | GRTForSequenceClassification (CrossEncoder) | 56,93 | 67,13 | 38,5% | 70,0% | 61,75 | 123 |
| Híbrido de dos etapas (embedding + reranker) | Bi-encoder + cross-encoder | 57,05 | 67,21 | 38,5% | 70,0% | 62,94 | 123 |

El reranker supera al bi-encoder en MRR@10 (56,93 frente a 52,56) y NDCG@10 (67,13 frente a 63,74), con un throughput ligeramente inferior (123 frente a 152 pares/s). El pipeline híbrido obtiene la mejor puntuación global. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo está especializado en ranking.

## Requisitos de hardware

- VRAM estimada para inferencia: con 29,8M de parámetros en fp32, aproximadamente 120 MB de pesos; en fp16, unos 60 MB. El consumo total depende del tamaño del lote y de la longitud de las secuencias.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4090, A100 o H100 pueden ejecutarlo sin problemas, aunque el modelo es tan pequeño que el cuello de botella será el preprocesado y el tamaño de lote.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU para cargas moderadas.
- Opciones de despliegue: sentence-transformers (`CrossEncoder`), Hugging Face Transformers (`AutoModelForSequenceClassification`), y potencialmente ONNX Runtime o llama.cpp si se generan los pesos convertidos (no se han publicado conversiones).
- Latencia y throughput estimados: el autor reporta 123 pares/s en el benchmark de reranking, aunque no especifica el hardware utilizado. No se dispone de mediciones de latencia por par.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Tipo | Disponibilidad |
|---|---|---|---|---|---|
| MatterWaveAI/grt-30m-reranker | 29,3M | No disponible | Apache 2.0 | Cross-encoder | Hugging Face |
| BAAI/bge-reranker-base | 278M | 512 tokens | MIT | Cross-encoder | Hugging Face |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | 22,7M | 512 tokens | Apache 2.0 | Cross-encoder | Hugging Face |
| jinaai/jina-reranker-v1-tiny-en | 33M | 512 tokens | Apache 2.0 | Cross-encoder | Hugging Face |

No se dispone de comparaciones directas de rendimiento entre grt-30m-reranker y estos modelos en los mismos benchmarks, por lo que no es posible establecer una comparación cuantitativa fiable. La model card solo compara el modelo con sus propios derivados (grt-30m y grt-30m-embedding).

## Limitaciones y advertencias

- Modelo muy reciente (noviembre de 2026) sin descargas ni valoraciones en Hugging Face; no hay evidencia de uso en producción ni validación independiente.
- No se dispone de información sobre los idiomas soportados; el entrenamiento y los benchmarks publicados parecen centrados en inglés (AllNLI, STS-B), por lo que el rendimiento en castellano es desconocido.
- No se detalla el proceso de entrenamiento ni la composición de los datos, lo que dificulta evaluar sesgos y riesgos de alucinación en la puntuación.
- Los benchmarks publicados son limitados (AllNLI y STS-B) y no cubren dominios diversos ni tareas multilingües.
- La arquitectura sin capas `nn.Linear` es poco habitual; la compatibilidad con herramientas de cuantización y optimización estándar no está documentada.
- Licencia Apache 2.0 permite uso comercial, pero al no haber validación externa se recomienda evaluar el modelo en el dominio concreto antes de desplegarlo.
- El throughput reportado (123 pares/s) no especifica el hardware, por lo que no es directamente comparable con otras mediciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-30m-reranker
- Modelo base (embedding): https://huggingface.co/MatterWaveAI/grt-30m-embedding
- Modelo base sin alinear: https://huggingface.co/MatterWaveAI/grt-30m
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
