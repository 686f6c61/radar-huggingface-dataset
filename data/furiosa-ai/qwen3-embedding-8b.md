# furiosa-ai/Qwen3-Embedding-8B

## Resumen

El modelo `furiosa-ai/Qwen3-Embedding-8B` es una versión precompilada del modelo de embeddings de texto `Qwen/Qwen3-Embedding-8B`, publicada por FuriosaAI. Se trata de un modelo de 8.000 millones de parámetros basado en la arquitectura densa Qwen3, diseñado para mapear texto en representaciones vectoriales densas para búsqueda semántica, recuperación de información y cálculo de similitud. Incluye soporte para Matryoshka Representation Learning (MRL), lo que permite solicitar embeddings con dimensionalidad reducida mediante el parámetro `dimensions`.

La relevancia de este modelo radica en que ofrece una implementación optimizada para el hardware FuriosaAI RNGD, con un bundle ejecutable (FXB) que permite su despliegue mediante Furiosa-LLM, tanto a través de un servidor compatible con la API de OpenAI como mediante la API Python offline. El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, y mantiene las mismas capacidades que el modelo original de Qwen, aunque su ejecución está restringida al hardware de FuriosaAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (dense transformer) |
| Parametros totales | 7.567.295.488 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (corre en BF16 nativo, sin cuantizacion) |
| Idiomas soportados | en (segun model card; el modelo base tiene cobertura multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, FXB (Furiosa Executable Bundle) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3 densa, un transformer estándar sin mezcla de expertos. Está diseñado específicamente para generar embeddings de texto, con soporte para Matryoshka Representation Learning (MRL), que permite reducir la dimensionalidad de los vectores de salida sin necesidad de reentrenar. No se dispone de información detallada sobre el proceso de entrenamiento, el número de tokens utilizados o la composición del dataset en la documentación proporcionada. La versión de FuriosaAI es una compilación precompilada del modelo original de Qwen, por lo que las características de entrenamiento corresponden al modelo base.

## Capacidades

- Generacion de embeddings de texto densos para busqueda semantica, recuperacion y similitud.
- Soporte de Matryoshka Representation Learning (MRL) para solicitar embeddings con dimensionalidad reducida mediante el parametro `dimensions`.
- API compatible con OpenAI para el endpoint `/v1/embeddings`, lo que facilita la integracion con clientes existentes.
- Ejecucion offline mediante la API Python de Furiosa-LLM con el metodo `embed`.
- Cobertura multilingue segun el modelo base Qwen3-Embedding-8B, aunque la model card de este repositorio solo indica ingles.
- Despliegue en hardware FuriosaAI RNGD con paralelismo tensorial de 8 PEs (una tarjeta).

## Casos de uso

- Busqueda semantica en bases de conocimiento: el modelo genera vectores densos para documentos y consultas, permitiendo recuperar informacion relevante por similitud coseno. Su tamano de 8B proporciona alta precision en dominios especializados.
- Sistemas de recomendacion basados en contenido: al convertir descripciones de productos o articulos en embeddings, se pueden calcular similitudes para sugerir elementos relacionados.
- Clasificacion de texto y agrupacion (clustering): los embeddings sirven como caracteristicas de entrada para algoritmos de clasificacion o para agrupar documentos por tema.
- Deduplicacion de documentos: comparando embeddings de textos se pueden identificar duplicados o variantes cercanas en grandes corpus.
- RAG (Retrieval-Augmented Generation): el modelo puede integrarse en pipelines de generacion aumentada por recuperacion para seleccionar fragmentos relevantes antes de la generacion de respuestas.
- Analisis de sentimiento y opinion: los embeddings de frases o resenas pueden alimentar clasificadores ligeros o servir para medir similitud entre opiniones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de evaluacion como MMLU, MTEB u otras metricas de calidad de embeddings para este modelo.

## Requisitos de hardware

- El modelo esta precompilado exclusivamente para hardware FuriosaAI RNGD, con un tensor-parallel de 8 PEs que se mapea a una unica tarjeta RNGD (8 PEs por tarjeta).
- No se indican requisitos de VRAM en la documentacion proporcionada; el modelo corre en precision BF16 nativa.
- No es compatible con GPUs de consumo general (NVIDIA, AMD) en esta version; para otros frameworks se debe usar el modelo base de Qwen.
- Opciones de despliegue: servidor Furiosa-LLM con API OpenAI-compatible (`furiosa-llm serve`) o API Python offline (`LLM` con metodo `embed`).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones con otros modelos de embeddings en la informacion proporcionada. Se recomienda consultar la model card del modelo base Qwen/Qwen3-Embedding-8B para comparativas con alternativas de la misma categoria.

## Limitaciones y advertencias

- El modelo esta limitado al hardware FuriosaAI RNGD; no se puede ejecutar en GPUs estandar sin recompilar o usar el modelo base.
- La model card de este repositorio indica solo ingles como idioma, aunque el modelo base tiene cobertura multilingue; se debe verificar el comportamiento en otros idiomas.
- No se dispone de informacion sobre sesgos especificos, pero al ser un modelo de embeddings, el riesgo de alucinacion no aplica directamente; sin embargo, los embeddings pueden reflejar sesgos presentes en los datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se debe cumplir con los terminos de la licencia del modelo base.
- No se proporcionan detalles sobre la longitud de contexto maxima, lo que puede limitar su uso en documentos muy largos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/furiosa-ai/Qwen3-Embedding-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Documentacion de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guia de Qwen3-Embedding en FuriosaAI: https://developer.furiosa.ai/latest/en/furiosa_llm/models/qwen3-embedding.html
