# pameydorke/arcanumchat-reranker-bge-reranker-v2-m3-hybrid-search

## Resumen

ArcanumChat Reranker es un modelo de reordenación (reranking) de tipo cross-encoder afinado por el usuario pameydorke a partir de BAAI/bge-reranker-v2-m3. Su función es puntuar pares de textos (consulta, documento) para reordenar los resultados de un sistema de búsqueda, habitualmente dentro de una arquitectura de recuperación híbrida (búsqueda léxica y densa combinadas). El nombre del repositorio sugiere que se ha entrenado para el dominio del videojuego Arcanum: Of Steamworks and Magick Obscura, aunque la model card no lo confirma explícitamente.

Técnicamente es un transformer XLM-RoBERTa configurado como `XLMRobertaForSequenceClassification` con una única etiqueta de salida, lo que permite producir una puntuación de relevancia por par de textos. Cuenta con 567.755.777 parámetros totales y una longitud máxima de secuencia de 8192 tokens, lo que lo hace apto para reordenar pasajes largos o hilos de conversación extensos sin truncar.

Su relevancia es acotada pero clara: es un ajuste fino ligero (23.690 ejemplos de entrenamiento, pérdida BinaryCrossEntropyLoss) que declara buenas métricas de reordenación sobre un conjunto de validación con negativos duros. No obstante, es un modelo recién publicado, sin descargas ni validación externa, y con licencia e idiomas sin especificar, lo que exige cautela antes de llevarlo a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa para clasificación de secuencias (cross-encoder) |
| Parámetros totales | 567.755.777 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización GGUF no publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Etiquetas de salida | 1 |
| Modalidad | texto |
| Modelo base | BAAI/bge-reranker-v2-m3 |
| Tamaño del repositorio | 2,3 GB |
| Librería | sentence-transformers |
| Pipeline | text-ranking |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en XLM-RoBERTa con cabeza de clasificación de una sola etiqueta. A diferencia de los bi-encoders, procesa conjuntamente la consulta y el documento en una única pasada del transformer, lo que permite capturar interacciones token a token entre ambos y suele traducirse en una mayor precisión de reordenación a costa de un coste de inferencia proporcional al número de pares a puntuar. La longitud máxima de 8192 tokens hereda la ventana del modelo base BAAI/bge-reranker-v2-m3.

El ajuste fino se realizó con la librería sentence-transformers sobre 23.690 ejemplos y con BinaryCrossEntropyLoss, una configuración típica para reordenación con etiquetas binarias de relevancia y negativos duros. La model card no documenta la composición del dataset, el número de tokens de entrenamiento, la procedencia de los datos ni si hubo etapas de RLHF o DPO. Tampoco se especifican innovaciones técnicas adicionales más allá del propio ajuste fino; no hay decodificación especulativa ni mecanismos de atención lineal, ya que no es un modelo generativo.

## Capacidades

- Puntuación de relevancia para pares (consulta, documento), orientada a reordenar resultados de búsqueda.
- Reordenación en pipelines de búsqueda híbrida, combinando recuperación léxica y densa antes de la fase de reranking.
- Manejo de pasajes largos gracias a la ventana de 8192 tokens, útil para hilos de foro, documentación extensa o conversaciones multi-turno.
- Capacidad multilingüe potencial heredada de XLM-RoBERTa, aunque no confirmada por el autor (idiomas no disponibles).
- No es un modelo generativo: no produce texto, no soporta tool calling ni function calling, y no implementa razonamiento multi-paso ni modo thinking.
- No dispone de capacidades de visión ni audio.
- Integración con la librería sentence-transformers mediante la clase `CrossEncoder`.

## Casos de uso

- Reordenación de resultados en un motor de búsqueda documental: se recuperan candidatos con un bi-encoder o BM25 y el cross-encoder puntúa cada par para reordenar el top-k, mejorando la precisión del ranking final.
- Búsqueda sobre comunidades y foros de videojuegos: el modelo parece ajustado sobre contenido de Arcanum, por lo que encaja en asistentes o wikis que respondan a preguntas sobre builds, hechizos y mecánicas del juego.
- Sistemas de preguntas y respuestas con recuperación aumentada (RAG): el reranker filtra y ordena los fragmentos recuperados antes de pasarlos al modelo generativo, reduciendo el ruido en el contexto.
- Atención al cliente con base de conocimiento: se reordenan artículos de ayuda para que el fragmento más relevante se sitúe primero, aprovechando la ventana de 8192 tokens para artículos largos.
- Búsqueda semántica en documentación técnica: útil cuando las consultas son ambiguas y se necesita desambiguar por contexto, algo que un bi-encoder resuelve peor.
- Filtrado de candidatos en pipelines de moderación o deduplicación: la puntuación por par permite priorizar pares similares o relevantes antes de una revisión más costosa.
- Evaluación y ajuste de sistemas de recuperación: sirve como componente de referencia para medir la ganancia de un reranking supervisado frente a la recuperación inicial.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, sobre el conjunto "val hard negatives". No están verificados de forma independiente.

| Tarea | Conjunto | Métrica | Valor |
|---|---|---|---|
| Cross Encoder Reranking | val hard negatives | MAP | 0,8572 |
| Cross Encoder Reranking | val hard negatives | MRR@20 | 0,9027 |
| Cross Encoder Reranking | val hard negatives | NDCG@20 | 0,9285 |

No se han publicado resultados de benchmarks en la información disponible más allá de los anteriores, ni comparaciones con el modelo base u otros rerankers en conjuntos estándar como BEIR o MS MARCO.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 2,3 GB solo para los pesos, más memoria para activaciones; en la práctica se recomienda al menos 4-6 GB para lotes pequeños.
- En fp16/bf16 los pesos ocupan aproximadamente 1,1-1,2 GB, por lo que cabe con holgura en GPUs de consumo.
- GPUs de consumo compatibles: RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090; también funciona en GPUs con 6-8 GB para lotes reducidos.
- GPUs de centro de datos: A100, H100, L40S y A10G para despliegues de alto rendimiento.
- Despliegue: sentence-transformers (CrossEncoder), Hugging Face Text Embeddings Inference (el repositorio incluye la etiqueta `text-embeddings-inference` y `endpoints_compatible`), y servidores de inferencia compatibles con transformers.
- Latencia y throughput: no disponibles. Al ser un cross-encoder, el coste escala linealmente con el número de pares a puntuar, por lo que conviene limitar el reranking al top-k recuperado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| pameydorke/arcanumchat-reranker-bge-reranker-v2-m3-hybrid-search | 567,8 M | 8192 | Cross-encoder | no disponible | Ajuste fino sobre 23.690 ejemplos; métricas solo en validación propia |
| BAAI/bge-reranker-v2-m3 | no disponible en la información | 8192 | Cross-encoder | no disponible en la información | Modelo base; referencia directa del ajuste |
| BAAI/bge-reranker-base | no disponible en la información | no disponible | Cross-encoder | no disponible en la información | Alternativa de menor tamaño de la misma familia |
| Cohere Rerank | no disponible | no disponible | Cross-encoder (API) | propietaria | Servicio comercial, sin pesos abiertos |

La comparación cuantitativa con alternativas no está disponible: el autor no publica resultados frente al modelo base ni frente a otros rerankers en conjuntos estándar.

## Limitaciones y advertencias

- Modelo recién publicado, con 0 descargas y 0 likes: no hay validación externa ni evidencia de robustez en producción.
- Las métricas declaradas no están verificadas y proceden de un único conjunto de validación con negativos duros, no de benchmarks estándar como BEIR o MS MARCO.
- Licencia no disponible: no se puede confirmar el uso comercial ni las obligaciones de atribución; conviene contactar con el autor antes de desplegarlo.
- Idiomas no disponibles: aunque XLM-RoBERTa es multilingüe, no hay confirmación de que el ajuste fino preserve un rendimiento equilibrado entre idiomas.
- Riesgo de sobreajuste al dominio de Arcanum si el dataset de entrenamiento está sesgado hacia ese contenido; el rendimiento en otros dominios es desconocido.
- Al ser un cross-encoder, no genera texto ni admite tool calling; su uso está restringido a puntuación de pares.
- El coste de inferencia crece con el número de pares; con contexto de 8192 tokens y muchos candidatos, la latencia puede ser significativa.
- No hay información sobre sesgos, alucinación (no aplica al no generar texto) ni comportamiento con consultas adversarias.

## Enlaces

- HuggingFace: https://huggingface.co/pameydorke/arcanumchat-reranker-bge-reranker-v2-m3-hybrid-search
- Modelo base: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Documentación de Sentence Transformers: https://sbert.net
- Documentación de Cross Encoder: https://www.sbert.net/docs/cross_encoder/usage/usage.html
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Cross Encoders en Hugging Face: https://huggingface.co/models?library=sentence-transformers&other=cross-encoder
- Paper de referencia (arXiv 1908.10084): https://arxiv.org/abs/1908.10084
