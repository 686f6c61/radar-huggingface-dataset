# Ryehr/RE3RANK-Qwen3-0.6B

## Resumen

RE3RANK-Qwen3-0.6B es un modelo de reranking desarrollado por el usuario Ryehr, construido sobre el backbone de Qwen/Qwen3-0.6B (596 millones de parámetros). Resuelve el problema de reordenar los candidatos devueltos por un recuperador de primera etapa en pipelines de generación aumentada por recuperación (RAG), y lo hace mediante un mecanismo poco habitual: en lugar de clasificar pares consulta-documento con una cabeza de clasificación, aprovecha las trazas de razonamiento del propio modelo generador y mide la masa de atención que esas trazas depositan sobre los tokens de cada candidato.

La innovación central es el desacoplamiento en dos componentes entrenados conjuntamente. Un generador en modo *thinking* escribe una traza de razonamiento sin que se le indique explícitamente que reordene, y un segundo ejemplar del backbone, truncado en su capa superior de puntuación, lee el mismo prompt seguido de la traza y asigna a cada candidato la atención media que los tokens de la traza dirigen hacia sus tokens a través de las cabezas 20-4 y 16-8 (capa-cabeza). El resultado es un reranker de 0.6B que se apoya en el razonamiento latente del modelo en lugar de en una señal supervisada directa de relevancia.

Es relevante ahora porque demuestra que un modelo del tamaño de un pequeño asistente puede funcionar como reranker competitivo en escenarios multihop y de memoria conversacional, con un coste computacional muy inferior al de los rerankers de varios miles de millones de parámetros, y porque publica una evaluación sobre nueve conjuntos de datos con 9.205 consultas. La licencia Apache-2.0 y la disponibilidad de los pesos en safetensors facilitan su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con generador de trazas y scorer truncado con cabezas de atención seleccionadas |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-0.6B soporta contexto largo, pero la model card no especifica el valor exacto usado) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 para el generador y fp32 para el scorer) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (generador en bf16 en la raíz del repo; scorer en `scorer/scorer.safetensors` en fp32) |

## Arquitectura y entrenamiento

El modelo se compone de dos copias del backbone Qwen3-0.6B entrenadas de forma conjunta. El generador es un `Qwen3ForCausalLM` estándar en bf16 con el tokenizador y la plantilla de chat de Qwen/Qwen3-0.6B; se le fuerza la apertura del bloque `<think>` y se le da el system prompt "You are a helpful assistant.", de modo que produce una traza de razonamiento codiciosa (greedy) para cada ítem. El scorer es una segunda copia del backbone truncada en su capa superior de puntuación, que carga las tablas congeladas del modelo base (`from_base`) y se inicializa desde `scorer/scorer.safetensors` en fp32 mediante `re3rank.scorer.load_scorer`. La puntuación de un candidato es la masa de atención que los tokens de la traza proyectan sobre los tokens del candidato a través de las cabezas 20-4 y 16-8 (identificadas como capa-cabeza), promediada sobre los tokens de la traza y sobre ambas cabezas.

El entrenamiento consistió en 394 actualizaciones de 96 ítems (aproximadamente una época) sobre una mezcla de 38.000 preguntas de NarrativeQA, MuSiQue, ConvoMem, QAConv y FriendsQA, cada una con sus 50 candidatos principales recuperados por Qwen3-Embedding-8B. Las preguntas de evaluación no se usaron en entrenamiento. Las trazas se muestrearon con temperatura 1.0 y un máximo de 1.024 tokens. Se empleó AdamW paginado de 8 bits con tasa de aprendizaje 1e-5 para ambos modelos. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Reranking de candidatos en dos etapas: generación de traza de razonamiento y puntuación por masa de atención sobre tokens del candidato.
- Generación de texto y razonamiento en modo *thinking* heredados del backbone Qwen3-0.6B.
- Manejo de preguntas multihop y de memoria conversacional, según los conjuntos de evaluación empleados (HotpotQA, 2WikiMultihopQA, MuSiQue, LoCoMo, LongMemEval).
- Procesamiento de lotes de 50 candidatos por consulta, el tamaño con el que fue entrenado y evaluado.
- Soporte de etiquetas opcionales (`is_supporting`) para calcular métricas de recall durante la evaluación.
- Integración con vLLM para la fase de generación de trazas y con PyTorch/transformers para la fase de puntuación.
- Capacidades multilingües: no disponible.
- Tool calling, function calling y uso como agente: no disponible en la información proporcionada.

## Casos de uso

- Reranking en pipelines RAG de documentación técnica: tras una recuperación densa con un modelo de embeddings, RE3RANK reordena los 50 fragmentos principales y coloca arriba los pasajes que el razonamiento del generador considera relevantes, mejorando la precisión del contexto que se inyecta al LLM de respuesta.
- Preguntas multihop sobre bases de conocimiento: en consultas que requieren combinar evidencia de varios documentos (HotpotQA, MuSiQue), el generador produce una traza que conecta entidades y el scorer premia los candidatos que esa traza consulta, lo que resulta adecuado para asistentes de investigación.
- Memoria conversacional en asistentes de larga duración: en escenarios tipo LoCoMo o LongMemEval, el modelo puede priorizar turnos antiguos de la conversación que son relevantes para la pregunta actual, algo que los rerankers de pares consulta-documento suelen fallar.
- Búsqueda en atención al cliente: dado un histórico de tickets y una consulta del usuario, el reranker selecciona los tickets previos más pertinentes para que el agente generativo responda con contexto histórico, con un coste de 0.6B parámetros por copia.
- Filtrado de candidatos en sistemas de preguntas y respuestas sobre noticias o enciclopedias (NQ, PopQA, NarrativeQA): se usa como segunda etapa tras un recuperador de primera etapa para reducir el ruido antes de la generación final.
- Evaluación y depuración de recuperadores: al exponer la traza de razonamiento y las puntuaciones por candidato, permite inspeccionar por qué un documento se considera relevante, lo que sirve para diagnosticar fallos del recuperador de primera etapa.
- Despliegue en entornos con recursos limitados: al ocupar el generador y el scorer un espacio reducido en bf16/fp32, puede ejecutarse en una única GPU consumer para prototipos y en GPUs de centro de datos para producción.

## Benchmarks y rendimiento

Macro promedio sobre nueve conjuntos (HotpotQA, 2WikiMultihopQA, MuSiQue, NQ, PopQA, NarrativeQA, DetectiveQA, LoCoMo, LongMemEval; 9.205 consultas), reordenando los 50 candidatos principales de Qwen3-Embedding-8B. El recall es condicional: solo cuentan las consultas con un candidato correcto entre los 50, y R@k divide por el número de candidatos correctos en el pool; NDCG@10 usa relevancia binaria. Valores en %:

| Metrica | Valor |
|---|---|
| R@1 | 42,34 |
| R@3 | 73,55 |
| R@5 | 81,43 |
| NDCG@10 | 79,67 |

No se han publicado en la información disponible resultados desglosados por conjunto ni comparaciones directas con otros rerankers.

## Requisitos de hardware

- VRAM estimada para inferencia: el generador en bf16 ocupa aproximadamente 1,2 GB y el scorer en fp32 aproximadamente 2,4 GB, más el espacio de activaciones y la caché KV durante la generación de trazas de hasta 1.024 tokens.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para ejecutar ambas fases; para producción con lotes grandes se recomienda A100 o H100.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090, siempre que se gestione el tamaño de lote de trazas.
- Opciones de despliegue: vLLM para la generación de trazas (usado en los scripts oficiales), PyTorch con transformers para el scorer; no se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RE3RANK-Qwen3-0.6B | 596 M | no disponible | Reranking por masa de atención sobre trazas de razonamiento | Apache-2.0 | HuggingFace y GitHub |
| Qwen3-Embedding-8B (recuperador de primera etapa) | 8 B | no disponible | Embeddings densos para recuperación | no disponible en la información | HuggingFace |
| Qwen3-0.6B (base) | 596 M | no disponible | Modelo generativo decoder-only | Apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de benchmarks.

## Limitaciones y advertencias

- El modelo fue entrenado y evaluado exclusivamente con 50 candidatos por consulta procedentes de Qwen3-Embedding-8B; su comportamiento con otros recuperadores o con tamaños de pool distintos no está documentado.
- La puntuación depende de las cabezas 20-4 y 16-8 seleccionadas; no se documenta la robustez de esta elección frente a otros dominios o idiomas.
- El generador produce trazas con decodificación codiciosa de hasta 1.024 tokens, lo que añade latencia por consulta y puede degradar el reranking si la traza divaga.
- No hay información sobre sesgos conocidos, riesgo de alucinación en las trazas ni cobertura multilingüe.
- La model card no incluye BibTeX ni detalles sobre evaluación fuera de los nueve conjuntos citados.
- Aunque la licencia es Apache-2.0 y permite uso comercial, se recomienda verificar la licencia del modelo base Qwen/Qwen3-0.6B y de los datasets de entrenamiento (NarrativeQA, MuSiQue, ConvoMem, QAConv, FriendsQA) antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente del rendimiento declarado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ryehr/RE3RANK-Qwen3-0.6B
- Repositorio de código: https://github.com/ryehr/RE3RANK
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE
