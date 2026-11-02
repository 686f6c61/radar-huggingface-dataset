# Ryehr/RE3RANK-Qwen3-8B

## Resumen

RE3RANK-Qwen3-8B es un modelo de reranking para pipelines de recuperación aumentada por generación (RAG) desarrollado por el usuario Ryehr, construido sobre el checkpoint Qwen/Qwen3-8B. A diferencia de los rerankers clásicos de tipo cross-encoder, este sistema emplea el propio modelo generativo en modo *thinking* para producir una traza de razonamiento sobre la pregunta y los candidatos, y después utiliza una segunda copia del backbone truncada en su capa superior de puntuación para medir la masa de atención que los tokens de la traza depositan sobre cada candidato. La puntuación de un candidato es, por tanto, una señal de atención interpretable y no una probabilidad de relevancia directa.

El modelo se distribuye como un paquete de dos componentes: el generador (checkpoint `Qwen3ForCausalLM` en bf16, con tokenizador y plantilla de chat de Qwen3-8B) y el scorer (`scorer/scorer.safetensors` en fp32), que debe cargarse mediante la función `re3rank.scorer.load_scorer` del repositorio de código asociado. La arquitectura subyacente es un transformer denso de 8.190.735.360 parámetros, por lo que hereda las capacidades de razonamiento y multilingüismo de Qwen3-8B, aunque el uso previsto es exclusivamente el reranking de candidatos recuperados en primera etapa.

Su relevancia actual radica en que propone un enfoque de reranking basado en razonamiento explícito en lugar de scoring supervisado directo, con resultados reportados sobre nueve conjuntos de evaluación (HotpotQA, 2WikiMultihopQA, MuSiQue, NQ, PopQA, NarrativeQA, DetectiveQA, LoCoMo y LongMemEval) y 9.205 consultas, rerankeando el top-50 de Qwen3-Embedding-8B. La licencia Apache-2.0 facilita su adopción comercial, aunque el modelo es muy reciente y cuenta con cero descargas y cero likes en HuggingFace en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) con cabezas de atención de puntuación seleccionadas (layer-head 15-11 y 23-10) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B, no confirmada en la información proporcionada) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 para el generador y fp32 para el scorer) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (generador en bf16 en la raíz del repo; scorer en fp32 en `scorer/scorer.safetensors`) |

## Arquitectura y entrenamiento

El sistema se compone de dos redes que comparten el backbone Qwen3-8B. El generador es un `Qwen3ForCausalLM` completo que opera en modo thinking con el bloque `<think>` forzado a abrirse y un system prompt genérico ("You are a helpful assistant."); se le pide que razone sobre la pregunta y los candidatos como si fuera a responder, sin indicarle explícitamente que rerankee. El scorer es una copia del backbone truncada en su capa superior de puntuación, que lee el mismo prompt seguido de la traza generada y calcula, para cada candidato, la masa de atención que los tokens de la traza proyectan sobre los tokens del candidato a través de las cabezas 15-11 y 23-10 (identificadas como layer-head), promediada sobre tokens de traza y cabezas. Ambos componentes se entrenaron de forma conjunta.

El entrenamiento consistió en 394 actualizaciones de 96 ítems (aproximadamente una época) sobre una mezcla de 38 000 preguntas de NarrativeQA, MuSiQue, ConvoMem, QAConv y FriendsQA, cada una con sus 50 candidatos top de Qwen3-Embedding-8B. Las trazas se muestrearon con temperatura 1.0 y un máximo de 1 024 tokens. Se empleó AdamW paginado de 8 bits con una tasa de aprendizaje de 1e-5 para ambos modelos. Las preguntas de evaluación no se utilizaron en el entrenamiento. La innovación técnica principal es el uso de la atención del propio modelo generativo como señal de relevancia, lo que evita entrenar una cabeza de clasificación adicional y aprovecha el razonamiento del modelo como mecanismo de scoring.

## Capacidades

- Reranking de candidatos recuperados en primera etapa: puntúa cada candidato en función de la atención que recibe de la traza de razonamiento generada.
- Generación de trazas de razonamiento en modo thinking sobre la pregunta y los candidatos, sin instrucción explícita de reranking.
- Scoring basado en atención multi-cabeza (cabezas 15-11 y 23-10), promediado sobre tokens de traza y cabezas.
- Soporte de evaluación con métricas de recall (R@1, R@3, R@5) y NDCG@10 cuando los candidatos llevan etiquetas `is_supporting`.
- Capacidad de razonamiento multihop y sobre contextos largos, heredada del backbone Qwen3-8B y validada en conjuntos como HotpotQA, 2WikiMultihopQA y MuSiQue.
- Integración con vLLM para la generación de trazas y con PyTorch/transformers para el scorer.
- Capacidades multilingües: no disponibles en la información proporcionada (aunque el backbone Qwen3-8B las soporta, no se documentan para este modelo).
- Tool calling, function calling, agentes y visión: no disponibles en la información proporcionada; el modelo está especializado en reranking y no se documentan estas capacidades.

## Casos de uso

- Reranking en pipelines RAG de documentación técnica: el modelo recibe la pregunta del usuario y los 50 candidatos recuperados por un retriever denso (por ejemplo, Qwen3-Embedding-8B) y reordena los fragmentos según la atención que la traza de razonamiento deposita sobre cada uno; es adecuado porque el scoring se basa en razonamiento explícito y no en coincidencia léxica.
- Preguntas multihop sobre bases de conocimiento: en conjuntos como HotpotQA y 2WikiMultihopQA, el modelo puede razonar sobre cadenas de evidencia y priorizar los pasajes que conectan las entidades de la pregunta, lo que mejora el recall condicional frente a rerankers de una sola pasada.
- Asistentes conversacionales con memoria a largo plazo: en escenarios tipo LoCoMo y LongMemEval, el modelo rerankea recuerdos recuperados de conversaciones extensas, aprovechando la traza para desambiguar referencias y seleccionar los turnos relevantes.
- Búsqueda en narrativas y documentos largos: en NarrativeQA, el modelo puntúa pasajes de obras literarias o informes extensos, donde la relevancia depende de la trama o del contexto global más que de palabras clave.
- Sistemas de preguntas y respuestas sobre noticias y entidades: en NQ y PopQA, el modelo puede filtrar los candidatos recuperados para una pregunta factual y priorizar los pasajes que contienen la respuesta correcta, reduciendo el ruido antes de la generación final.
- Detección de evidencia en dominios de investigación (DetectiveQA): el modelo rerankea pasajes para tareas de investigación detectivesca o análisis documental, donde la evidencia relevante puede estar dispersa entre múltiples candidatos.
- Evaluación y auditoría de retrievers: al puntuar candidatos con una señal de atención interpretable, el modelo puede usarse para diagnosticar qué recupera bien y qué recupera mal un retriever de primera etapa en un corpus concreto.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card. Media macro sobre nueve conjuntos (HotpotQA, 2WikiMultihopQA, MuSiQue, NQ, PopQA, NarrativeQA, DetectiveQA, LoCoMo, LongMemEval; 9.205 consultas), rerankeando el top-50 de Qwen3-Embedding-8B. Recall condicional: solo cuentan consultas con un candidato gold entre los 50, y R@k divide por el número de candidatos gold en el pool; NDCG@10 con relevancia binaria. Valores en porcentaje:

| Métrica | Valor |
|---|---|
| R@1 | 44,12 |
| R@3 | 76,68 |
| R@5 | 84,36 |
| NDCG@10 | 82,36 |

No se han publicado en la información disponible resultados comparativos con otros rerankers (por ejemplo, cross-encoders de la misma familia o modelos de reranking comerciales), ni desglose por conjunto individual.

## Requisitos de hardware

- VRAM estimada para inferencia: el generador en bf16 ocupa aproximadamente 16,4 GB de pesos (8,19 mil millones de parámetros × 2 bytes); el scorer en fp32 añade aproximadamente 32,8 GB si se carga completo, aunque al ser un backbone truncado puede requerir menos según la implementación de `load_scorer`.
- Para ejecutar ambos componentes simultáneamente se recomienda al menos 48-80 GB de VRAM; una GPU A100 de 80 GB o H100 de 80 GB es la opción más segura.
- En GPUs de consumo: el generador en bf16 cabe en una RTX 4090 (24 GB) con margen ajustado; el scorer en fp32 probablemente no cabe junto al generador en una sola GPU de consumo, por lo que se requeriría cuantización o carga secuencial.
- Opciones de despliegue: vLLM para la generación de trazas (según los scripts del repositorio), PyTorch + transformers para el scorer mediante `re3rank.scorer.load_scorer`. No se documentan integraciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. El coste incluye una generación de traza de hasta 1 024 tokens por ítem más el paso de scoring sobre 50 candidatos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RE3RANK-Qwen3-8B | 8,19 B | no disponible | Reranking por atención sobre traza de razonamiento | Apache-2.0 | HuggingFace (repo Ryehr/RE3RANK-Qwen3-8B) |
| Qwen3-8B (base) | 8,19 B | no disponible en esta ficha | LLM generativo denso | Apache-2.0 | HuggingFace (Qwen/Qwen3-8B) |
| Qwen3-Embedding-8B | no disponible en esta ficha | no disponible | Embedding denso para recuperación | no disponible en esta ficha | HuggingFace (Qwen/Qwen3-Embedding-8B) |

No se dispone de datos de benchmarks comparativos con otros rerankers en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El modelo está especializado en reranking: no debe usarse como LLM generativo general ni como chatbot, ya que su entrenamiento se centró en la generación de trazas y el scoring de candidatos.
- El scorer requiere cargarse mediante el código del repositorio (`re3rank.scorer.load_scorer`) y depende de las cabezas 15-11 y 23-10; un uso incorrecto de las cabezas o de la truncación invalida las puntuaciones.
- El sistema asume 50 candidatos por pregunta, el formato con el que fue entrenado y evaluado; su comportamiento con otros tamaños de pool no está documentado.
- Las métricas reportadas son condicionales (solo consultas con gold en el pool) y con NDCG@10 de relevancia binaria, lo que puede sobreestimar el rendimiento frente a métricas no condicionales.
- El modelo es muy reciente (creado en noviembre de 2026 según los metadatos) y no tiene descargas ni likes, por lo que no hay validación independiente de los resultados.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones idiomáticas; al heredar el backbone Qwen3-8B, es razonable esperar los sesgos del modelo base, pero no están cuantificados en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero el scorer en fp32 y el generador en bf16 imponen requisitos de memoria considerables para producción.
- El repositorio de código y los scripts de evaluación son necesarios para reproducir los resultados; la model card no incluye una entrada BibTeX (marcada como TODO).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ryehr/RE3RANK-Qwen3-8B
- Repositorio de código: https://github.com/ryehr/RE3RANK
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-8B/blob/main/LICENSE
- Retriever de primera etapa mencionado: Qwen/Qwen3-Embedding-8B (sin enlace directo en la información proporcionada)
