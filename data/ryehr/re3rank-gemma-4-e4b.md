# Ryehr/RE3RANK-Gemma-4-E4B

## Resumen

RE3RANK-Gemma-4-E4B es un modelo de reranking desarrollado por Ryehr sobre el backbone de google/gemma-4-E4B-it. No es un modelo generativo de propósito general, sino un sistema de dos etapas (generador y scorer) diseñado para reordenar los candidatos de un recuperador de primera fase en pipelines de retrieval y RAG. La innovación principal es que el reranking no se hace con un clasificador de relevancia al uso, sino midiendo la masa de atención que una traza de razonamiento generada por el propio modelo deposita sobre los tokens de cada candidato a través de un conjunto fijo de cabezas de atención (capa-cabeza 35-0 y 29-4).

El modelo base es un Gemma 4 de 7.941.100.874 parámetros totales (según los tensores safetensors del repo, 29,4 GB), con torres de visión y audio heredadas del base pero no utilizadas. Solo se entrenó el decodificador de texto del generador, y el scorer es una copia truncada del backbone en fp32 que se carga por separado desde `scorer/scorer.safetensors`. Generador y scorer se entrenaron conjuntamente.

Es relevante ahora porque propone un enfoque de reranking basado en razonamiento (el modelo "piensa" la respuesta y luego se mide dónde mira) que evita entrenar un cabezal de clasificación dedicado y aprovecha las capacidades de razonamiento nativas del LLM. Los resultados reportados sobre nueve conjuntos de datos (9.205 consultas, top-50 de Qwen3-Embedding-8B) alcanzan R@1 de 44,51 % y NDCG@10 de 82,54 %, con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 4), con generador y scorer truncado; atención con capas KV-shared |
| Parametros totales | 7.941.100.874 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16 para el generador y fp32 para el scorer) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (generador bf16, scorer fp32) |

## Arquitectura y entrenamiento

El sistema consta de dos componentes que comparten backbone. El generador es un `Gemma4ForConditionalGeneration` en bf16 que, en modo thinking con el canal de razonamiento nativo forzado a abrirse y el system prompt "You are a helpful assistant.", lee la pregunta y los candidatos y escribe una traza de razonamiento como si fuera a responder; nunca se le indica que rerankee. El scorer es una segunda copia del backbone truncada en su capa superior de scoring, cargada en fp32, que lee el mismo prompt seguido de la traza y calcula, para cada candidato, la masa de atención que los tokens de la traza depositan sobre los tokens del candidato a través de las cabezas 35-0 y 29-4 (capa-cabeza), promediada sobre tokens de traza y cabezas. Solo se entrenó el decodificador de texto del generador; las torres de visión y audio son las del base y no se usan.

El entrenamiento consistió en 394 actualizaciones de 96 ítems (aproximadamente una época) sobre una mezcla de 38 000 preguntas de NarrativeQA, MuSiQue, ConvoMem, QAConv y FriendsQA con sus top-50 candidatos de Qwen3-Embedding-8B. Las preguntas de evaluación no se usaron para entrenar. Las trazas se muestrearon con temperatura 1,0 y un máximo de 1.024 tokens. Se usó AdamW paginado de 8 bits con learning rate 1e-5 para ambos modelos. El repo incluye `model-dropped.safetensors` con las proyecciones K/V y los pesos K-norm de las capas KV-shared, copiados del base, porque transformers no los instancia pero vLLM sí los espera.

## Capacidades

- Reranking de candidatos en dos fases: generación de traza de razonamiento y scoring por masa de atención.
- Razonamiento en modo thinking nativo del modelo base, forzado a abrir el canal de razonamiento.
- Procesamiento de preguntas con múltiples candidatos (entrenado y evaluado con 50 candidatos por pregunta).
- Soporte de etiquetas opcionales (`is_supporting`) para calcular métricas de recall durante la evaluación.
- Capacidad multimodal heredada del base (visión y audio) presente en el checkpoint pero no utilizada ni entrenada.
- Integración con vLLM para la generación de trazas y con PyTorch/transformers para el scorer.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Reranking en pipelines RAG: el modelo recibe el top-50 de un recuperador denso (por ejemplo, Qwen3-Embedding-8B) y reordena los pasajes midiendo la atención de la traza de razonamiento sobre cada candidato, mejorando la precisión del contexto que se pasa al generador final.
- Preguntas multi-hop: al generar una traza de razonamiento antes de puntuar, el modelo puede conectar evidencias repartidas entre varios documentos, lo que lo hace adecuado para HotpotQA, 2WikiMultihopQA y MuSiQue.
- Búsqueda en memoria conversacional: entrenado con ConvoMem y evaluado en LoCoMo y LongMemEval, sirve para recuperar el turno o pasaje relevante en asistentes con historial largo.
- Atención al cliente con base de conocimiento: el reranker filtra y ordena los fragmentos de documentación recuperados antes de que un LLM componga la respuesta, reduciendo alucinaciones por contexto irrelevante.
- Evaluación de sistemas de recuperación: el script `score.py` con `--keep-nogold` y etiquetas `is_supporting` permite calcular métricas de recall condicional y NDCG@10 sobre conjuntos propios.
- Investigación en reranking basado en atención: el diseño de scoring por cabezas de atención concretas (35-0, 29-4) es un punto de partida reproducible para estudiar interpretabilidad y selección de cabezas en tareas de ranking.
- Búsqueda documental en dominios narrativos: el entrenamiento con NarrativeQA y FriendsQA lo orienta a preguntas sobre textos largos y diálogos.

## Benchmarks y rendimiento

Macro promedio sobre nueve conjuntos (HotpotQA, 2WikiMultihopQA, MuSiQue, NQ, PopQA, NarrativeQA, DetectiveQA, LoCoMo, LongMemEval; 9.205 consultas), rerankeando el top-50 de Qwen3-Embedding-8B. Recall condicional: solo cuentan consultas con un candidato gold entre los 50, y R@k divide por el número de candidatos gold en el pool; NDCG@10 con relevancia binaria. En porcentaje:

| Metrica | Valor |
|---|---|
| R@1 | 44,51 |
| R@3 | 77,14 |
| R@5 | 84,06 |
| NDCG@10 | 82,54 |

No se han publicado en la información disponible resultados desglosados por conjunto ni comparaciones numéricas directas con otros rerankers.

## Requisitos de hardware

- VRAM estimada para inferencia: el generador en bf16 ocupa aproximadamente 15,9 GB (7.941.100.874 parámetros × 2 bytes); el scorer en fp32 requiere alrededor de 31,8 GB si se carga completo, aunque al truncarse en la capa de scoring puede reducirse. El repo completo pesa 29,4 GB.
- GPU recomendadas: A100 40/80 GB o H100 para ejecutar generador y scorer simultáneamente sin cuantización; una RTX 4090 de 24 GB puede alojar el generador en bf16 pero no el scorer en fp32 completo.
- Cabe en consumer GPU: el generador en bf16 sí cabe en RTX 4090 (24 GB) y, con cuantización, en GPUs de 16 GB; el scorer en fp32 requiere al menos 32 GB o cuantización adicional (no documentada).
- Opciones de despliegue: vLLM para la generación de trazas (`scripts/eval/generate_traces.py`), PyTorch + transformers para el scorer (`re3rank.scorer.load_scorer`). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados numéricos de otros rerankers sobre los mismos nueve conjuntos, por lo que la comparación cuantitativa no está disponible. A nivel estructural:

| Modelo | Base | Parametros | Enfoque de ranking | Licencia |
|---|---|---|---|---|
| RE3RANK-Gemma-4-E4B | google/gemma-4-E4B-it | 7.941.100.874 | Traza de razonamiento + masa de atención en cabezas 35-0, 29-4 | Apache-2.0 |
| Rerankers cross-encoder tipo BGE | BERT-like | no disponible | Clasificación de relevancia query-pasaje | variable |
| Qwen3-Embedding-8B (recuperador de primera fase) | Qwen3 | no disponible | Embedding denso para retrieval | no disponible |

## Limitaciones y advertencias

- El modelo está entrenado y evaluado exclusivamente con 50 candidatos por pregunta procedentes de Qwen3-Embedding-8B; su comportamiento con otros recuperadores o con otro número de candidatos no está documentado.
- Solo se entrenó el decodificador de texto; las torres de visión y audio están presentes en el checkpoint pero no se usan ni se validaron.
- El scoring depende de dos cabezas de atención concretas (35-0 y 29-4); cualquier cambio en el backbone base invalida el scorer.
- El scorer se distribuye en fp32 y requiere cargarse con la librería específica del repo; no es un checkpoint estándar de transformers.
- Riesgo de alucinación en la traza de razonamiento: si el generador produce razonamientos incorrectos, la masa de atención puede favorecer candidatos irrelevantes.
- Sesgos conocidos: no disponibles en la información proporcionada; hereda los del modelo base Gemma 4.
- Idiomas soportados: no disponibles; el entrenamiento se realizó sobre conjuntos en inglés (NarrativeQA, MuSiQue, NQ, etc.).
- Longitud de contexto máxima: no disponible.
- Uso comercial: permitido bajo Apache-2.0, con la licencia del base Gemma 4 referenciada por el autor.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de los resultados reportados.

## Enlaces

- Hugging Face: https://huggingface.co/Ryehr/RE3RANK-Gemma-4-E4B
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Código: https://github.com/ryehr/RE3RANK
- Licencia del base: https://ai.google.dev/gemma/docs/gemma_4_license
