# furiosa-ai/harrier-oss-v1-0.6b

## Resumen

Harrier OSS v1 es una familia de modelos de embeddings de texto multilingües desarrollada por Microsoft. La variante de 0.6B parámetros, publicada por FuriosaAI como `furiosa-ai/harrier-oss-v1-0.6b`, es una redistribución del modelo base `microsoft/harrier-oss-v1-0.6b` que incluye un Furiosa Executable Bundle (FXB) para ejecutarse en hardware FuriosaAI RNGD mediante el framework Furiosa-LLM. El modelo está diseñado para tareas de recuperación de información, similitud semántica, clustering, clasificación, minería de bitext y reranking, y produce embeddings densos de 1.024 dimensiones mediante pooling de último token y normalización L2.

A diferencia de otros modelos de embeddings basados en Qwen3, Harrier OSS v1 no utiliza la receta de entrenamiento de Qwen3-Embedding, sino una receta propia de Harrier, orientada a instrucciones y multilingüe, con objetivos de aprendizaje contrastivo sobre una mezcla de datasets multilingües. El modelo es de tipo decoder-only denso, con arquitectura Qwen3, y soporta una longitud de contexto de 32.768 tokens. Se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones. Su relevancia actual radica en que ofrece un rendimiento competitivo en MTEB v2 (69.0) con un tamaño reducido, y en que FuriosaAI lo ha optimizado para su acelerador RNGD, aunque también puede ejecutarse con frameworks estándar como Sentence Transformers o Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (dense, decoder-only) |
| Parametros totales | 596.049.920 (0.6B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (nativo BF16, sin cuantizacion) |
| Idiomas soportados | 94 idiomas (multilingue, incluye es, en, fr, de, zh, ja, ar, etc.) |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) y FXB (Furiosa Executable Bundle) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura Qwen3 densa y decoder-only, con la clase `Qwen3Model`. Genera embeddings de 1.024 dimensiones mediante pooling del último token y normalización L2, de modo que el producto escalar entre vectores equivale a la similitud coseno. A diferencia de Qwen3-Embedding, Harrier OSS v1 se entrena con la receta propia de Harrier, que es multilingüe y consciente de instrucciones: se recomienda anteponer una descripción de la tarea en formato `Instruct: ...\nQuery: ...` para las consultas, mientras que los documentos no llevan instrucción.

El entrenamiento se basa en objetivos de aprendizaje contrastivo sobre una gran mezcla de datasets multilingües que cubren diversas tareas. No se han publicado detalles adicionales sobre el número de tokens de entrenamiento, la composición exacta del dataset o el uso de técnicas como RLHF o DPO, ya que no aparecen en la información disponible. El modelo se distribuye en precisión BF16 nativa, sin cuantización, y FuriosaAI lo ha empaquetado en un FXB para su ejecución en el acelerador RNGD con tensor-parallel de 8 PEs (una tarjeta RNGD).

## Capacidades

- Generacion de embeddings densos de 1.024 dimensiones para texto, con normalizacion L2.
- Recuperacion de informacion (retrieval) y busqueda semantica, tanto en escenarios monolingues como multilingues.
- Similitud semantica entre pares de textos (cosine similarity).
- Clustering de documentos y agrupacion por temas.
- Clasificacion de texto mediante representaciones vectoriales (por ejemplo, con un clasificador lineal sobre los embeddings).
- Mineria de bitext: alineacion de frases o documentos entre idiomas.
- Reranking de resultados de busqueda mediante similitud entre consulta y documento.
- Soporte de instrucciones: el modelo es consciente de la tarea si se usa el formato `Instruct: ...\nQuery: ...`.
- Multilingue: cubre 94 idiomas, incluyendo lenguas de baja representacion como af, am, as, br, cy, fy, ga, gd, gu, ha, etc.
- Compatible con frameworks estandar: ademas de Furiosa-LLM, puede usarse con Sentence Transformers y Transformers (segun la model card del modelo base).

## Casos de uso

- Busqueda semantica en bases de conocimiento: indexar documentos y consultas con el modelo, y recuperar los pasajes mas relevantes mediante similitud coseno. Su contexto de 32.768 tokens permite procesar documentos largos sin truncamiento agresivo.
- RAG (generacion aumentada por recuperacion): integrar el modelo como componente de embeddings en un pipeline de RAG para recuperar informacion relevante antes de pasarla a un LLM generativo. La compatibilidad con OpenAI-compatible API de Furiosa-LLM facilita la integracion.
- Clasificacion de textos en produccion: generar embeddings para entrenar clasificadores ligeros (regresion logistica, SVM) sobre datos etiquetados, aprovechando la representacion semantica multilingue.
- Deduplicacion y limpieza de datos: detectar documentos duplicados o casi duplicados calculando la similitud entre embeddings, util en pipelines de datos o en la gestion de grandes corpus.
- Mineria de bitext para traduccion: alinear pares de frases en distintos idiomas usando la similitud de los embeddings, lo que facilita la construccion de corpus paralelos.
- Reranking de resultados de busqueda: combinar una primera etapa de recuperacion (por ejemplo, BM25) con un reranker basado en Harrier para mejorar la precision de los resultados finales.
- Chatbots y atencion al cliente multilingue: recuperar respuestas de una base de conocimiento en el idioma del usuario, gracias a la cobertura de 94 idiomas y a la capacidad de entender instrucciones de tarea.

## Benchmarks y rendimiento

Segun los datos recogidos en Inferix, el modelo `harrier-oss-v1-0.6b` obtiene una puntuacion de 69.0 en MTEB v2. No se dispone de resultados detallados para otros benchmarks (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es generativo, sino de embeddings. La informacion disponible no incluye comparaciones con otros modelos de embeddings en la misma tabla.

| Benchmark | Puntuacion |
|---|---|
| MTEB v2 | 69.0 |

Fuente: Inferix (https://inferix.co/models/microsoft/harrier-oss-v1-0.6b). No se han publicado resultados adicionales en la informacion proporcionada.

## Requisitos de hardware

- El modelo esta optimizado para FuriosaAI RNGD, con tensor-parallel de 8 PEs (una tarjeta RNGD). No se especifican requisitos de VRAM para otras plataformas.
- Al ser un modelo de 0.6B en BF16, los pesos ocupan aproximadamente 1,2 GB, por lo que es plausible que quepa en GPUs de consumo con al menos 4 GB de VRAM, aunque no hay datos oficiales al respecto.
- Para ejecutarlo en RNGD, se requiere instalar Furiosa-LLM y sus prerequisitos (ver documentacion oficial).
- El modelo tambien puede ejecutarse con Sentence Transformers o Transformers en GPUs estandar, segun la model card del modelo base, pero no se proporcionan requisitos especificos de hardware para esos frameworks.
- Opciones de despliegue: Furiosa-LLM server (compatible con OpenAI API), API de Python de Furiosa-LLM, o frameworks estandar como Transformers/Sentence Transformers.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de embeddings en la informacion proporcionada. La familia Harrier OSS v1 incluye variantes de 270M, 0.6B y 27B, con puntuaciones MTEB v2 de 66.5, 69.0 y 74.3 respectivamente, pero no se han publicado comparaciones con modelos externos como BGE, E5 o GTE. Por tanto, la comparativa con modelos similares se considera no disponible.

## Limitaciones y advertencias

- El modelo es exclusivamente de embeddings; no genera texto ni responde a prompts conversacionales.
- Requiere el formato de instruccion `Instruct: ...\nQuery: ...` para las consultas; no aplicarlo puede degradar el rendimiento en tareas de recuperacion.
- No se han publicado analisis de sesgos o de riesgos de alucinacion, al ser un modelo no generativo. Sin embargo, los embeddings pueden reflejar sesgos presentes en los datos de entrenamiento.
- La informacion sobre el entrenamiento (datasets, numero de tokens, tecnicas de alineacion) no esta disponible en la documentacion publica.
- El bundle FXB esta pensado para hardware FuriosaAI RNGD; para otras plataformas hay que usar el modelo base de Microsoft con frameworks estandar.
- La licencia MIT permite uso comercial, pero se recomienda revisar los terminos de la licencia del modelo base y de los datasets utilizados en el entrenamiento, que no se detallan.

## Enlaces

- Repositorio HuggingFace de FuriosaAI: https://huggingface.co/furiosa-ai/harrier-oss-v1-0.6b
- Modelo base de Microsoft: https://huggingface.co/microsoft/harrier-oss-v1-0.6b
- Documentacion de Furiosa-LLM para Harrier OSS v1: https://developer.furiosa.ai/v2026.4.0/en/furiosa_llm/models/harrier-oss-v1.html
- Referencia de Inferix con datos de MTEB: https://inferix.co/models/microsoft/harrier-oss-v1-0.6b
