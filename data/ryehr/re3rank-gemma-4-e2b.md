# Ryehr/RE3RANK-Gemma-4-E2B

## Resumen

RE3RANK-Gemma-4-E2B es un modelo de reranking desarrollado por Ryehr sobre `google/gemma-4-E2B-it`. Implementa RE³Rank, un enfoque que combina un generador en modo thinking con un scorer basado en cabezas de atención. El generador produce una traza de razonamiento para responder a la pregunta sin que se le indique explícitamente que rerankee; el scorer, una copia truncada del backbone, puntúa cada candidato según la masa de atención que los tokens de la traza depositan sobre los tokens del candidato en las cabezas 34-2 y 9-7 (capa-cabeza). Ambos componentes se entrenan conjuntamente.

El modelo resuelve el problema de reranking en pipelines de recuperación aumentada (RAG) y búsqueda multi-hop, donde un primer retriever devuelve candidatos que deben reordenarse por relevancia. Su innovación principal es sustituir el scoring tradicional por un mecanismo de atención sobre trazas de razonamiento, lo que permite capturar dependencias semánticas profundas entre pregunta y pasaje sin un clasificador dedicado.

Con 5.104.297.539 parámetros totales y un repositorio de 17,6 GB, el checkpoint raíz es un `Gemma4ForConditionalGeneration` en bf16 con tokenizer, chat template y processor config heredados del modelo base. Solo se entrenó el decodificador de texto; las torres de visión y audio no se usan. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4) con decodificador de texto entrenado; scorer truncado con cabezas de atención seleccionadas |
| Parametros totales | 5.104.297.539 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (generador), fp32 (scorer); no se documentan otras |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, `scorer/scorer.safetensors`, `model-dropped.safetensors`) |

## Arquitectura y entrenamiento

El modelo se compone de dos piezas entrenadas conjuntamente. El generador es un checkpoint `Gemma4ForConditionalGeneration` en bf16 cuyo decodificador de texto se ha afinado; las torres de visión y audio se mantienen congeladas y no se utilizan. El scorer es una copia del backbone truncada en su capa superior de scoring, en fp32, que lee el mismo prompt seguido de la traza generada. La puntuación de un candidato es la masa de atención que los tokens de la traza proyectan sobre sus tokens a través de las cabezas 34-2 y 9-7, promediada sobre tokens de traza y cabezas. El fichero `model-dropped.safetensors` contiene las proyecciones K/V y los pesos de K-norm de las capas con KV compartida, copiados del modelo base, que transformers no instancia pero vLLM sí espera.

El entrenamiento consistió en 394 actualizaciones de 96 ítems (aproximadamente una época) sobre una mezcla de 38 000 preguntas de NarrativeQA, MuSiQue, ConvoMem, QAConv y FriendsQA, junto con sus top-50 candidatos de Qwen3-Embedding-8B. Las preguntas de evaluación no se usaron en entrenamiento. Las trazas se muestrearon con temperatura 1,0 y un máximo de 1 024 tokens. Se empleó AdamW paginado de 8 bits con learning rate 1e-5 para ambos modelos.

## Capacidades

- Generación de trazas de razonamiento en modo thinking para responder preguntas sobre candidatos recuperados.
- Reranking de candidatos mediante scoring por atención sobre trazas, sin clasificador dedicado.
- Soporte de pipelines RAG y búsqueda multi-hop con reordenación de top-50 candidatos.
- Manejo de preguntas con múltiples pasajes de soporte y etiquetas opcionales (`is_supporting`).
- Evaluación integrada de métricas de recall cuando se proporcionan etiquetas.
- Compatibilidad con vLLM para la generación de trazas y con transformers para el scorer.
- Capacidades multimodales del modelo base (visión y audio) presentes en los pesos pero no utilizadas por este fine-tuning.
- Soporte de tool calling, agentes o multi-step reasoning: no documentado en la información disponible.

## Casos de uso

- Reranking en pipelines RAG: el modelo recibe la pregunta y los top-50 candidatos de un retriever denso como Qwen3-Embedding-8B, genera una traza de razonamiento y reordena los pasajes según la atención de la traza sobre cada candidato. Es adecuado porque el scoring captura relaciones semánticas profundas entre pregunta y pasaje.
- Búsqueda multi-hop: en conjuntos como HotpotQA, 2WikiMultihopQA y MuSiQue, el modelo puede priorizar pasajes que conectan entidades a través de varios saltos de razonamiento, gracias a la traza generada en modo thinking.
- Preguntas sobre documentos largos: con NarrativeQA, el reranker ayuda a seleccionar los fragmentos relevantes de narrativas extensas antes de pasarlos a un generador de respuestas.
- Memoria conversacional: en LoCoMo y LongMemEval, el modelo reordena recuerdos recuperados de conversaciones largas, útil para asistentes con memoria persistente.
- Detección de evidencia en QA: en DetectiveQA, el scoring por atención permite identificar pasajes que contienen la evidencia necesaria para responder, no solo pasajes topicalmente similares.
- Evaluación de retrievers: el modelo puede usarse como juez de relevancia para medir la calidad de un primer-stage retriever sobre un corpus propio, comparando el orden antes y después del reranking.
- Filtrado previo a generación: en sistemas de atención al cliente con base documental, el reranker reduce el número de pasajes que se envían al LLM generador, disminuyendo coste y latencia.

## Benchmarks y rendimiento

Resultados sobre media macro de nueve conjuntos (HotpotQA, 2WikiMultihopQA, MuSiQue, NQ, PopQA, NarrativeQA, DetectiveQA, LoCoMo, LongMemEval; 9 205 consultas), rerankeando el top-50 de Qwen3-Embedding-8B. Recall condicional: solo cuentan consultas con candidato gold entre los 50, y R@k divide por el número de candidatos gold en el pool; NDCG@10 con relevancia binaria. Valores en %:

| Metrica | Valor |
|---|---|
| R@1 | 44,00 |
| R@3 | 75,44 |
| R@5 | 82,99 |
| NDCG@10 | 81,47 |

No se han publicado resultados comparativos con otros rerankers en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el generador en bf16 ocupa aproximadamente 10,2 GB para los 5,1 mil millones de parámetros; el scorer en fp32 añade unos 20,4 GB si se carga completo, aunque al truncarse en la capa de scoring el consumo real es menor (no cuantificado en la información disponible).
- GPU recomendadas: A100 40/80 GB o H100 para ejecutar generador y scorer simultáneamente sin cuantización; RTX 4090 (24 GB) puede alojar el generador en bf16 y el scorer truncado si se gestiona la memoria con cuidado.
- Cabe en GPU de consumo: el generador en bf16 sí cabe en RTX 4090; en GPUs de 16 GB requeriría cuantización, no documentada oficialmente.
- Opciones de despliegue: vLLM para la generación de trazas (`scripts/eval/generate_traces.py`), transformers y PyTorch para el scorer (`re3rank.scorer.load_scorer`). No se documentan integraciones con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RE3RANK-Gemma-4-E2B | 5,10 B | no disponible | Reranking por atención sobre trazas | Apache-2.0 | HuggingFace, código en GitHub |
| Qwen3-Embedding-8B | 8 B (no confirmado en la información) | no disponible | Embedding denso de primera etapa | no disponible | HuggingFace |
| Rerankers cross-encoder clasicos | no disponible | no disponible | Clasificador de pares pregunta-pasaje | variable | variable |

La comparación directa con otros rerankers no está disponible en la información proporcionada; los datos de Qwen3-Embedding-8B solo se mencionan como primer-stage retriever del que se toman los top-50 candidatos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Gemma 4, puede heredar sesgos del modelo base.
- Riesgo de alucinación: el generador produce trazas de razonamiento que pueden contener afirmaciones incorrectas; el scoring depende de esas trazas, por lo que errores en ellas afectan al ranking.
- Limitaciones de contexto o idioma: la longitud de contexto no está documentada y los idiomas soportados no se especifican.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Gemma 4 enlazada por el autor.
- El modelo está diseñado específicamente para reranking con 50 candidatos por pregunta; su comportamiento con otros tamaños de pool no está documentado.
- Solo se entrenó el decodificador de texto; las capacidades de visión y audio del modelo base no son utilizables en este checkpoint.
- El scorer requiere cargar el backbone truncado y las tablas congeladas del modelo base, lo que añade complejidad de despliegue frente a un cross-encoder convencional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.

## Enlaces

- HuggingFace: https://huggingface.co/Ryehr/RE3RANK-Gemma-4-E2B
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Código: https://github.com/ryehr/RE3RANK
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
