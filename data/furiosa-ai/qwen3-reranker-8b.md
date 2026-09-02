# furiosa-ai/Qwen3-Reranker-8B

## Resumen

Qwen3-Reranker-8B es un modelo de reranking de 8.000 millones de parámetros desarrollado por FuriosaAI, que publica una versión empaquetada del modelo homónimo de Qwen (Qwen/Qwen3-Reranker-8B) junto con un Furiosa Executable Bundle (FXB) para ejecutarlo en su hardware acelerador RNGD mediante el framework Furiosa-LLM. Su función es asignar una puntuación de relevancia a pares consulta-documento, lo que permite reordenar los resultados de un sistema de recuperación en una segunda etapa, típica en pipelines de generación aumentada por recuperación (RAG) y motores de búsqueda.

El modelo se basa en el backbone transformer denso de Qwen3 y se distribuye bajo licencia Apache 2.0. A diferencia de los modelos generativos de chat, este es un modelo de clasificación de texto que solo acepta entradas en inglés. La versión de FuriosaAI no aplica cuantización: el modelo se ejecuta en precisión nativa BF16 sobre una tarjeta RNGD, con paralelismo tensorial de 8 unidades de procesamiento (PE). Su relevancia radica en ofrecer una integración optimizada y lista para producción en el ecosistema FuriosaAI, con una API compatible con los estándares de facto de reranking (Cohere, Jina, vLLM).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer denso) |
| Parametros totales | 8.188.548.096 (8B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ninguna (BF16 nativo) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, FXB (Furiosa Executable Bundle) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen3-Reranker-8B original de Qwen, que emplea una arquitectura transformer densa de la familia Qwen3. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO; la model card de FuriosaAI se limita a indicar que el modelo base es el upstream de Qwen y que su uso previsto es idéntico al de aquel.

La innovación principal de esta versión no está en la arquitectura del modelo, sino en su empaquetado: FuriosaAI compila el modelo en un FXB, un formato ejecutable optimizado para su acelerador RNGD, y lo integra con Furiosa-LLM, su framework de inferencia. Esto permite desplegar el reranker con una única tarjeta RNGD (8 PEs en paralelo tensorial) y exponerlo mediante una API compatible con los endpoints `/v1/rerank` y `/v1/score`, similares a los de Cohere, Jina y vLLM.

## Capacidades

- Reranking de documentos: dado un query y un conjunto de documentos candidatos, devuelve los documentos reordenados por puntuación de relevancia.
- Puntuación directa de pares query-documento a través del endpoint `/v1/score`.
- Integración con pipelines RAG como etapa de segunda pasada (re-ranking) sobre resultados de recuperación inicial.
- Compatibilidad de API con el estándar de facto de servicios de reranking (Cohere, Jina, vLLM), lo que facilita su adopción en sistemas existentes.
- Ejecución offline mediante la API Python de Furiosa-LLM, además del modo servidor.
- Soporte del parámetro `top_n` para limitar el número de documentos devueltos.
- No es un modelo generativo: no produce texto, solo puntuaciones de relevancia.
- Limitado al idioma inglés (según la model card).

## Casos de uso

- Mejora de pipelines RAG: tras una primera recuperación con un modelo de embeddings o BM25, el reranker reordena los documentos candidatos para que el generador reciba solo el contexto más relevante, reduciendo ruido y mejorando la fidelidad de las respuestas.
- Búsqueda semántica en bases de conocimiento corporativas: se puede integrar como segunda etapa en un buscador interno para priorizar resultados según la intención de la consulta, en lugar de depender solo de similitud vectorial.
- Filtrado de candidatos en sistemas de recomendación: dado un ítem de referencia y una lista de ítems candidatos, el modelo puntúa la relevancia de cada par para seleccionar los más adecuados.
- Moderación y clasificación de contenido: aunque no es su uso principal, la puntuación de relevancia puede adaptarse para tareas de clasificación binaria o de ranking en dominios específicos.
- Evaluación de calidad de recuperación: se puede usar para generar juicios de relevancia automáticos sobre conjuntos de documentos, ayudando a depurar pipelines de búsqueda sin intervención manual.
- Despliegue en producción con hardware dedicado: al estar empaquetado para RNGD, es adecuado para entornos que ya utilizan la infraestructura de FuriosaAI y necesitan un servicio de reranking de baja latencia con una API estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de FuriosaAI no incluye métricas como MMLU, HumanEval o datasets de reranking (p. ej., BEIR), y la documentación del desarrollador tampoco las proporciona. Para datos de rendimiento del modelo subyacente, se debe consultar la model card upstream de Qwen/Qwen3-Reranker-8B.

## Requisitos de hardware

- Hardware objetivo: una tarjeta FuriosaAI RNGD (8 PEs por tarjeta), con paralelismo tensorial de tamaño 8.
- Precisión: BF16 nativo, sin cuantización. No se ofrecen variantes cuantizadas (GGUF, AWQ, etc.).
- VRAM: no especificada, pero el tamaño del repositorio es de 32 GB, lo que sugiere que el modelo completo en BF16 requiere al menos esa capacidad de memoria en el acelerador.
- No es compatible con GPUs de consumo (NVIDIA RTX, AMD, etc.) en esta versión, ya que el FXB está compilado exclusivamente para RNGD. Para ejecutar el modelo en otro hardware, se debe usar el modelo upstream de Qwen con frameworks como Sentence Transformers, vLLM o Transformers.
- Opciones de despliegue: servidor Furiosa-LLM (`furiosa-llm serve`) con endpoints `/v1/rerank` y `/v1/score`, o API offline de Python (`LLM` de `furiosa_llm`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware objetivo | Notas |
|---|---|---|---|---|---|
| furiosa-ai/Qwen3-Reranker-8B | 8B | no disponible | Apache 2.0 | FuriosaAI RNGD | Empaquetado FXB, BF16, solo inglés |
| Qwen/Qwen3-Reranker-8B (upstream) | 8B | no disponible | Apache 2.0 | Multiplataforma (Transformers, vLLM, Sentence Transformers) | Modelo base original, sin FXB |
| BGE-Reranker-v2-M3 | 568M | 8k | MIT | Multiplataforma | Modelo más pequeño, multilingüe, ampliamente usado en RAG |
| Cohere Rerank 3.5 | no disponible | no disponible | Propietario | API gestionada | Servicio comercial, no open source |

La comparativa se limita a los datos disponibles; no se han encontrado benchmarks públicos que permitan una comparación cuantitativa de rendimiento entre estos modelos.

## Limitaciones y advertencias

- Solo soporta inglés; no es adecuado para consultas o documentos en otros idiomas.
- Requiere hardware FuriosaAI RNGD específico; el FXB no es portable a GPUs convencionales. Para otros entornos, se debe usar el modelo upstream.
- No hay cuantización disponible en esta versión, lo que puede limitar su uso en entornos con restricciones de memoria.
- No se han publicado benchmarks ni métricas de rendimiento en la información proporcionada, por lo que no es posible evaluar su calidad relativa frente a otros rerankers.
- Al ser un modelo de reranking, no genera texto; su uso en tareas generativas es inadecuado.
- La licencia Apache 2.0 permite uso comercial, pero el hardware propietario de FuriosaAI puede suponer una barrera de adopción.
- El modelo puede presentar sesgos derivados de los datos de entrenamiento del modelo base Qwen3, aunque no se detallan en la documentación disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/furiosa-ai/Qwen3-Reranker-8B
- Model card upstream: https://huggingface.co/Qwen/Qwen3-Reranker-8B
- Documentación de Furiosa-LLM (Qwen3-Reranker): https://developer.furiosa.ai/latest/en/furiosa_llm/models/qwen3-reranker.html
- Documentación de Furiosa-LLM (introducción): https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Referencia del servidor Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/furiosa-llm-serve.html
