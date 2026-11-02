# Ryehr/RE3RANK-Qwen3-4B

## Resumen

RE3RANK-Qwen3-4B es un modelo de reranking desarrollado por Ryehr sobre el backbone de Qwen/Qwen3-4B. A diferencia de los rerankers clasicos basados en cross-encoders que producen una puntuacion de relevancia directamente, este modelo implementa el esquema RE³Rank en dos etapas: un generador que escribe una traza de razonamiento en modo thinking y un scorer que puntua cada candidato midiendo la masa de atencion que los tokens de la traza depositan sobre los tokens del candidato a traves de cabezas de atencion concretas (capa-cabeza 23-10 y 21-8).

El modelo resuelve el problema del reranking en pipelines RAG y recuperacion multi-salto, donde un retriever de primera etapa (en este caso Qwen3-Embedding-8B con top-50 candidatos) devuelve un conjunto ruidoso que debe reordenarse. La innovacion es que el reranking no se aprende como una tarea supervisada explicita, sino que se deriva de la propia traza de razonamiento del generador, lo que permite aprovechar la capacidad de razonamiento del modelo base sin anadir una cabeza de clasificacion.

Con 4.022 millones de parametros, contexto heredado de Qwen3-4B y licencia Apache-2.0, el modelo se posiciona como una alternativa de codigo abierto para reranking razonado en espanol y otros idiomas, aunque la model card no detalla la composicion linguistica del entrenamiento. El repositorio ocupa 17,4 GB e incluye el checkpoint del generador en bf16 y el scorer en fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B) con esquema de reranking en dos etapas: generador + scorer truncado con cabezas de atencion 23-10 y 21-8 |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B; la model card no la explicita) |
| Tipos de cuantizacion | no disponible (checkpoint en bf16 para el generador y fp32 para el scorer) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (generador en bf16 en la raiz; scorer en fp32 en `scorer/scorer.safetensors`) |

## Arquitectura y entrenamiento

El modelo se compone de dos copias del backbone Qwen3-4B entrenadas conjuntamente. El generador es un `Qwen3ForCausalLM` completo que, con el bloque `<think>` forzado a abrirse y el system prompt "You are a helpful assistant.", produce una traza de razonamiento codiciosa de hasta 1.024 tokens por item. El scorer es una copia truncada del backbone en su capa superior de puntuacion, que lee el mismo prompt seguido de la traza y calcula la puntuacion de cada candidato como la masa de atencion que los tokens de la traza depositan sobre los tokens del candidato a traves de las cabezas 23-10 y 21-8, promediada sobre tokens de traza y cabezas. El scorer se carga mediante `re3rank.scorer.load_scorer`, que construye el backbone truncado desde Qwen/Qwen3-4B y superpone los pesos de `scorer/scorer.safetensors`.

El entrenamiento consistio en 394 actualizaciones de 96 items (aproximadamente una epoca) sobre una mezcla de 38.000 preguntas de NarrativeQA, MuSiQue, ConvoMem, QAConv y FriendsQA, cada una con sus top-50 candidatos de Qwen3-Embedding-8B. Las trazas se muestrearon a temperatura 1.0 con un maximo de 1.024 tokens. Se uso AdamW paginado de 8 bits con learning rate 1e-5 para ambos modelos. Las preguntas de evaluacion no se usaron en entrenamiento. La innovacion tecnica central es el uso de la atencion como senal de relevancia en lugar de una cabeza de clasificacion supervisada, lo que vincula el reranking al razonamiento generativo del modelo base.

## Capacidades

- Reranking de candidatos en dos etapas: generacion de traza de razonamiento y puntuacion por masa de atencion sobre tokens del candidato.
- Razonamiento en modo thinking con el bloque `<think>` forzado, orientado a preguntas de QA multi-salto y recuperacion.
- Puntuacion de relevancia por candidato, con soporte para etiquetas `is_supporting` que activan el calculo de metricas de recall.
- Integracion con pipelines RAG y recuperacion de primera etapa (entrenado y evaluado con top-50 de Qwen3-Embedding-8B).
- Procesamiento de preguntas con multiples parrafos candidatos en formato JSON (`id`, `question`, `paragraphs` con `title` y `paragraph_text`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible como capacidad declarada; el razonamiento se limita a la traza de reranking.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Reranking en pipelines RAG sobre documentacion tecnica: el modelo recibe la pregunta del usuario y los top-50 fragmentos recuperados por un embedding model, genera una traza de razonamiento y reordena los fragmentos por masa de atencion, mejorando la precision del contexto que se pasa al LLM generador.
- QA multi-salto sobre bases de conocimiento: para preguntas que requieren combinar informacion de varios documentos (estilo HotpotQA o MuSiQue), el generador razona sobre los candidatos y el scorer prioriza los parrafos que la traza efectivamente consulta.
- Busqueda conversacional con memoria: en escenarios tipo LoCoMo o LongMemEval, el modelo puede reordenar recuerdos recuperados de un historial de conversacion antes de inyectarlos en el prompt del asistente.
- Sistemas de atencion al cliente con base documental: reranking de articulos de ayuda recuperados por similitud vectorial para seleccionar los mas relevantes antes de la respuesta final, reduciendo alucinaciones por contexto irrelevante.
- Evaluacion y depuracion de retrievers: el script `score.py` con `--keep-nogold` permite inspeccionar puntuaciones por candidato y detectar fallos sistematicos del retriever de primera etapa.
- Investigacion en reranking razonado: el codigo abierto y la separacion generador/scorer permiten experimentar con otras cabezas de atencion, otros retrievers o distintas estrategias de muestreo de trazas.
- Despliegue en entornos con GPU de gama media: al ser un modelo de 4B en bf16, puede servirse con vLLM en una unica GPU consumer de gama alta para la etapa de generacion de trazas.

## Benchmarks y rendimiento

Resultados publicados en la model card: media macro sobre nueve conjuntos (HotpotQA, 2WikiMultihopQA, MuSiQue, NQ, PopQA, NarrativeQA, DetectiveQA, LoCoMo, LongMemEval; 9.205 consultas), rerankeando el top-50 de Qwen3-Embedding-8B. Recall condicional (solo consultas con candidato gold entre los 50, R@k dividido por el numero de candidatos gold) y NDCG@10 con relevancia binaria, en porcentaje:

| R@1 | R@3 | R@5 | NDCG@10 |
|---|---|---|---|
| 44,20 | 76,70 | 84,01 | 82,23 |

No se han publicado en la informacion disponible resultados desagregados por conjunto ni comparaciones directas con otros rerankers.

## Requisitos de hardware

- VRAM estimada para el generador en bf16: aproximadamente 8 GB de pesos mas overhead de KV cache; con contexto largo y lote pequeno, el consumo real puede situarse en el rango de 12-24 GB.
- VRAM estimada para el scorer en fp32: aproximadamente 16 GB de pesos para la copia truncada, mas overhead; en la practica puede requerir una GPU de 24 GB o mas si se ejecuta en paralelo con el generador.
- GPU recomendadas: A100 40/80 GB o H100 para ejecutar generador y scorer simultaneamente con lotes grandes; RTX 4090 (24 GB) o L40S para el generador en bf16 y el scorer con precision reducida o serializacion.
- Cabe en GPU consumer: el generador de 4B en bf16 cabe en RTX 4090, RTX 3090 y GPUs de 16 GB o mas; el scorer en fp32 es mas exigente y puede requerir cuantizacion o ejecucion secuencial.
- Opciones de despliegue: vLLM para la generacion de trazas (`scripts/eval/generate_traces.py`), PyTorch + transformers para el scorer (`scripts/eval/score.py`), y el paquete `re3rank` instalable con `pip install -e .` desde el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la informacion proporcionada. Como referencia estructural, se compara con alternativas de la misma categoria (rerankers de codigo abierto sobre backbones de 3-8B):

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RE3RANK-Qwen3-4B | 4,02B | no disponible | Reranking por atencion sobre traza de razonamiento | Apache-2.0 | HuggingFace + GitHub |
| BGE-reranker-v2-m3 | no disponible en esta ficha | no disponible | Cross-encoder clasico | no disponible en esta ficha | HuggingFace |
| Qwen3-Reranker-4B | no disponible en esta ficha | no disponible | Reranker generativo de Qwen | no disponible en esta ficha | HuggingFace |

Los datos de las alternativas no estan verificados en la informacion proporcionada y se incluyen solo como referencia de categoria; no deben interpretarse como una comparacion de rendimiento.

## Limitaciones y advertencias

- El modelo esta entrenado y evaluado exclusivamente con top-50 candidatos de Qwen3-Embedding-8B; su comportamiento con otros retrievers o tamanos de pool no esta validado.
- El reranking depende de una traza de razonamiento generada por el propio modelo; si la traza es incorrecta o divaga, la puntuacion por atencion puede degradarse.
- Las metricas publicadas son condicionales (solo consultas con gold en el pool) y el NDCG@10 usa relevancia binaria, lo que limita la comparacion directa con otros benchmarks.
- No se detalla la composicion linguistica del entrenamiento; el soporte multilingue no esta garantizado ni documentado.
- Riesgo de alucinacion en la traza de razonamiento: el generador no esta supervisado para rerankear, por lo que puede producir razonamientos plausibles pero irrelevantes para la pregunta.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al heredar Qwen3-4B, puede arrastrar sesgos del modelo base.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen3-4B tiene su propia licencia que debe verificarse en el enlace oficial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validacion comunitaria independiente.
- El scorer en fp32 incrementa los requisitos de memoria y puede complicar el despliegue en produccion frente a alternativas de menor precision.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ryehr/RE3RANK-Qwen3-4B
- Repositorio de codigo: https://github.com/ryehr/RE3RANK
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B/blob/main/LICENSE
- Paper: no disponible en la informacion proporcionada (la model card incluye un TODO para la cita BibTeX).
