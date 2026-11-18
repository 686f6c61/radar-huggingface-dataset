# infly/inf-retriever-v1-1.5b-tool

## Resumen

INF-Retriever-v1-1.5B-Tool es un modelo de recuperación densa (dense retrieval) especializado en la búsqueda de herramientas para agentes basados en LLM, desarrollado por INF TECH. Se trata de un fine-tune de INF-Retriever-v1-1.5B, un modelo de embeddings de 1.500 millones de parámetros construido sobre una arquitectura transformer tipo decoder, adaptado ahora al escenario de tool retrieval mediante entrenamiento sobre el conjunto de datos del benchmark ToolRet (ACL 2025) combinado con consultas sintéticas generadas por LLM.

El problema que resuelve es concreto: los agentes que operan sobre catálogos de herramientas de gran tamaño (decenas de miles de funciones con sus descripciones JSON) necesitan seleccionar las candidatas relevantes antes de invocar al LLM planificador. Los modelos de embeddings de propósito general rinden por debajo en este dominio porque las consultas de usuario y las descripciones de herramientas tienen una distribución léxica y semántica particular. Este modelo cubre ese hueco sin degradar las capacidades del modelo base.

Es relevante porque demuestra una receta de adaptación al dominio que iguala el rendimiento zero-shot del modelo base (NDCG@10 de 0.509 frente a 0.511) y supera al mejor embedding previo del leaderboard oficial de ToolRet (0.4596), con licencia Apache 2.0 y publicación completa de la composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de embeddings derivado de INF-Retriever-v1-1.5B; pooling sobre el último token) |
| Parametros totales | 1.500 millones (1.5B, segun el nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_seq_length configurado en los ejemplos de uso) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato estandar de transformers; no se detalla explicitamente en la model card) |

## Arquitectura y entrenamiento

El modelo parte de INF-Retriever-v1-1.5B, un retriever denso basado en LLM que produce embeddings normalizados L2 mediante pooling del último token (last-token pooling), tal como muestra el ejemplo con `transformers`. El fine-tune es de parámetros completos (full-parameter), con DeepSpeed ZeRO-2 y precisión bf16, learning rate constante de 1e-5, una época y batch efectivo de 64, con 7 negativos por consulta. La longitud máxima de secuencia usada es 512 tokens.

Los datos de entrenamiento se publican con transparencia total: 34.676 pares del shard 0 del conjunto oficial ToolRet-Training-20w (con filtro de contaminación de 129 coincidencias exactas con consultas de test eliminadas) y 87.747 consultas sintéticas generadas por LLM en estilo escena, con una puerta de solapamiento léxico (Jaccard consulta↔positivo ≤ 0.35). El corpus de entrenamiento es el conjunto completo oficial de 44.453 herramientas. La minería de negativos duros combina confusión entre herramientas de la misma familia y negativos léxicos BM25 entre familias distintas. Se aplica el protocolo de instrucción (`Instruct: ...\nQuery: ...`) en el momento de la codificación de consultas.

## Capacidades

- Recuperación densa de herramientas (tool retrieval) a partir de consultas en lenguaje natural, devolviendo rankings de funciones candidatas sobre corpus de decenas de miles de herramientas.
- Codificación de consultas y documentos en un espacio vectorial común, con similitud por producto escalar (embeddings normalizados L2, puntuación escalada ×100).
- Soporte del protocolo de instrucción: la consulta se prefija con una tarea (`Instruct: Given a tool-use task, retrieve tools that can accomplish the task`) para guiar la representación.
- Manejo de documentos en formato JSON estructurado (nombre y descripción de la herramienta) como texto de entrada.
- Capacidad multilingüe limitada: solo inglés declarado.
- No es un modelo generativo: no produce texto, no hace tool calling ni razonamiento multi-paso por sí mismo; es un componente de recuperación para pipelines de agentes.

## Casos de uso

- Enrutamiento de herramientas en agentes LLM: dado un catálogo de miles de funciones (APIs, plugins, skills), el modelo indexa las descripciones con FAISS y recupera las top-k candidatas para una consulta de usuario; esas candidatas se inyectan en el prompt del LLM planificador, reduciendo el coste de contexto y mejorando la precisión de selección.
- Construcción de sistemas RAG sobre APIs: indexación del corpus de endpoints de una organización y recuperación semántica de la función adecuada para cada petición, con NDCG@10 de 0.509 en el benchmark de referencia.
- Selección de herramientas en asistentes de finanzas o datos: el ejemplo de la model card (consulta sobre datos de straddle de un ticker) ilustra la recuperación de funciones de un proveedor de datos de mercado.
- Filtrado previo en pipelines de function calling: reducir el conjunto de herramientas expuestas al LLM a las más relevantes antes de la decisión de invocación, mitigando errores de selección en catálogos grandes.
- Evaluación y benchmarking interno de retrievers: servir como referencia especializada para comparar estrategias de tool retrieval (BM25, embeddings generales, fine-tunes de dominio) sobre corpus propios.
- Indexación de documentación técnica de herramientas: codificar documentación de SDKs o librerías y recuperar la función concreta que resuelve una tarea descrita en lenguaje natural.
- Búsqueda semántica en registros de plugins o marketplaces de integraciones: recuperación de la integración adecuada a partir de la descripción de la necesidad del usuario.

## Benchmarks y rendimiento

Resultados en el benchmark oficial ToolRet (ACL 2025): corpus completo de 44.453 herramientas, recuperación por producto interno con FAISS, métricas micro-promediadas sobre 7.961 consultas de test, con protocolo de instrucción.

| Modelo | NDCG@10 | Recall@10 | Recall@100 |
|---|---|---|---|
| INF-Retriever-v1-1.5B-Tool | 0.509 | 0.609 | 0.753 |
| INF-Retriever-v1-1.5B (zero-shot) | 0.511 | 0.620 | 0.805 |
| gte-qwen2 (entrenamiento oficial, mejor embedding del leaderboard) | 0.4596 | no disponible | no disponible |
| BM25 (arnés propio) | 0.383 | 0.475 | no disponible |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; el modelo es un retriever y no un LLM generativo, por lo que esas métricas no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3 GB solo para pesos (1.5B parámetros × 2 bytes), más overhead de activaciones y tokenizador; en la práctica, entre 4 y 6 GB para lotes pequeños con secuencias de 512 tokens.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16; A100, H100 o L40S para indexación masiva del corpus de 44.453 herramientas con alto throughput.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090; también en GPUs de 8 GB con lotes reducidos o cuantización (la model card no documenta cuantizaciones específicas).
- Opciones de despliegue: sentence-transformers (recomendado por el autor), transformers con pooling manual, y servidores de embeddings compatibles con la API de Hugging Face (el tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints). El índice vectorial puede construirse con FAISS, tal como se usó en la evaluación.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | NDCG@10 (ToolRet) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| INF-Retriever-v1-1.5B-Tool | 1.5B | 512 | 0.509 | Apache 2.0 | Hugging Face |
| INF-Retriever-v1-1.5B (zero-shot) | 1.5B | 512 (uso) | 0.511 | no disponible en la informacion | Hugging Face |
| gte-qwen2 (entrenamiento oficial) | no disponible | no disponible | 0.4596 | no disponible | Hugging Face |
| BM25 | n/a (léxico) | n/a | 0.383 | n/a | implementaciones libres |

La comparativa se limita a los modelos reportados en la model card. No se dispone de datos de otros retrievers especializados en herramientas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo inglés declarado: el rendimiento en consultas en castellano u otros idiomas no está evaluado y probablemente sea inferior.
- Ventana de contexto de 512 tokens: las descripciones de herramientas largas se truncan, lo que puede perder información relevante en documentos extensos.
- Ligera degradación frente al modelo base en Recall@100 (0.753 frente a 0.805) y Recall@10 (0.609 frente a 0.620), aunque la mejora en NDCG@10 es marginal (0.509 frente a 0.511); el autor lo presenta como paridad, no como mejora sobre el base.
- Riesgo de sesgo y alucinación: al ser un retriever, no genera texto, pero puede recuperar herramientas irrelevantes o con descripciones engañosas; la calidad depende de la calidad de las descripciones indexadas.
- No es un modelo generativo ni soporta tool calling directo: debe integrarse como componente de recuperación en un pipeline mayor.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base INF-Retriever-v1-1.5B, no detallada en la informacion proporcionada.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa independiente.
- La fecha de creación indicada (2026-11-18) es futura respecto a la información habitual de benchmarks; conviene verificar la vigencia de los datos antes de adoptarlo.
- El corpus de evaluación y entrenamiento es el oficial de ToolRet; el rendimiento en catálogos de herramientas propios puede diferir y requiere evaluación específica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infly/inf-retriever-v1-1.5b-tool
- Modelo base: https://huggingface.co/infly/inf-retriever-v1-1.5b
- Paper del benchmark ToolRet (arXiv): https://arxiv.org/abs/2503.01763
- Envío al leaderboard de ToolRet: https://github.com/mangopy/tool-retrieval-benchmark/issues/21
