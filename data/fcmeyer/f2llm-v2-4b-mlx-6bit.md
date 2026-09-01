# fcmeyer/F2LLM-v2-4B-mlx-6bit

## Resumen

F2LLM-v2-4B-mlx-6bit es una conversión al formato nativo MLX del modelo de embeddings de texto multilingüe F2LLM-v2-4B, desarrollado originalmente por el equipo CodeFuse de Alibaba. El repositorio ha sido creado por fcmeyer, que ha cuantizado los pesos a 6 bits (afine, grupo de 64) para que el modelo pueda ejecutarse de forma eficiente en Apple Silicon a través de la librería mlx-embeddings. El modelo original está diseñado para tareas de recuperación de información, búsqueda semántica y clasificación de texto en más de 200 idiomas, con especial atención a lenguas de bajos recursos. Esta versión cuantizada reduce el tamaño a 3,1 GB en disco, manteniendo una fidelidad coseno superior a 0,996 frente a la referencia en bfloat16, lo que la hace adecuada para entornos con recursos limitados o para despliegues en dispositivos Apple.

La arquitectura se basa en el tronco de Qwen3, genera embeddings de 2560 dimensiones y utiliza pooling de último token con normalización L2. El modelo original fue entrenado sobre un conjunto de 60 millones de muestras públicas de alta calidad en dos etapas con supervisión basada en LLM. Esta conversión no modifica los pesos, solo el formato, e incluye la cuantización de todas las capas lineales y de la tabla de embeddings, mientras que las escalas y sesgos de cuantización se mantienen en bfloat16. Es una opción práctica para quienes necesitan embeddings multilingües de alto rendimiento sin depender de GPUs dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3 (trunk), embeddings de 2560 dimensiones, pooling last-token con normalizacion L2 |
| Parametros totales | 4B (segun model card; el archivo safetensors muestra 880.068.096 parametros, probablemente parcial) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea max_length=8192) |
| Tipos de cuantizacion | MLX affine 6-bit con grupo de 64; tambien disponibles versiones bf16 y 8-bit del mismo autor |
| Idiomas soportados | Mas de 80 idiomas listados en HuggingFace (incluye es, en, zh, ru, fr, de, etc.); el modelo original soporta mas de 200 |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo original F2LLM-v2-4B pertenece a la familia F2LLM-v2, una serie de modelos de embeddings de proposito general en 8 tamanos que van desde 80M hasta 14B de parametros. Segun el articulo de arXiv (2603.19223), se entrena sobre un conjunto de 60 millones de muestras publicas de alta calidad, con un enfasis especial en lenguas de recursos medios y bajos. El proceso de entrenamiento integra una etapa de supervision basada en LLM en dos fases, lo que permite mejorar la calidad de las representaciones para tareas de recuperacion y busqueda semantica.

La conversion a MLX realizada por fcmeyer cuantiza todas las capas lineales y la tabla de embeddings a 6 bits con cuantizacion afine y grupo de 64, mientras que los pesos de RMSNorm y las escalas/sesgos de cuantizacion se mantienen en bfloat16. El proceso de conversion se llevo a cabo con mlx 0.32.2 y mlx-embeddings 0.1.1. No se han introducido cambios en la arquitectura ni en los pesos; solo se ha cambiado el formato para permitir la ejecucion nativa en Apple Silicon.

## Capacidades

- Generacion de embeddings de texto densos de 2560 dimensiones para tareas de busqueda semantica, recuperacion de informacion, clasificacion de texto, similitud de sentencias (STS), clustering y mineria de bitext.
- Soporte de instrucciones personalizadas en el prompt (formato "Instruct: ... Query: ...") para adaptar el comportamiento a tareas especificas de retrieval y reranking.
- Multilingue: cubre mas de 80 idiomas en esta version (y mas de 200 en el modelo original), incluyendo lenguas de bajos recursos.
- Compatible con mlx-embeddings para uso en Python en Apple Silicon, y con text-embeddings-inference segun las etiquetas del repositorio.
- No es un modelo generativo: no genera texto, no soporta tool calling, ni tiene modo agente ni razonamiento multi-paso.

## Casos de uso

- Busqueda semantica en documentacion tecnica multilingue: el modelo puede indexar documentos en varios idiomas y recuperar los mas relevantes para una consulta dada, gracias a sus embeddings de alta calidad y su soporte de mas de 80 idiomas.
- Clasificacion de tickets de soporte: se pueden generar embeddings de los tickets y entrenar un clasificador ligero sobre ellos, o usar similitud coseno con ejemplos etiquetados para categorizar automaticamente las solicitudes.
- Deduplicacion de contenidos: comparar embeddings de articulos, entradas de base de datos o mensajes para identificar duplicados o casi duplicados, incluso en diferentes idiomas.
- Sistemas de recomendacion basados en contenido: representar items (productos, noticias, articulos) mediante embeddings y calcular similitudes para sugerir elementos relacionados al usuario.
- Mineria de bitext para traduccion: alinear frases equivalentes en distintos idiomas mediante la similitud de sus embeddings, util para construir corpus paralelos.
- Clustering de noticias o articulos cientificos: agrupar documentos por tema usando los embeddings generados, facilitando la organizacion y el analisis de grandes volumenes de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks MTEB ni de recuperacion para esta version cuantizada. La model card incluye una prueba de humo (smoke test) que compara la fidelidad de la cuantizacion frente a una referencia en PyTorch bfloat16, sobre un conjunto fijo de 5 textos (una consulta en ingles y cuatro documentos en ingles, chino y ruso). Los resultados son los siguientes:

| Build | Tamano | Minimo coseno vs PyTorch | Maxima variacion en similitud consulta-documento | Ranking preservado |
|---|---|---|---|---|
| F2LLM-v2-4B-mlx-bf16 | 7,5 GB | 0,99984 | 0,0017 | si |
| F2LLM-v2-4B-mlx-8bit | 4,0 GB | 0,99954 | 0,0020 | si |
| F2LLM-v2-4B-mlx-6bit (este repo) | 3,1 GB | 0,99696 | 0,0078 | si |

Esta prueba no sustituye a una evaluacion completa; el propio autor advierte que no se ha ejecutado MTEB ni evaluacion de retrieval sobre las versiones cuantizadas y recomienda medir la perdida de calidad en los datos propios del usuario.

## Requisitos de hardware

- Tamano del repositorio: 3,3 GB (3,1 GB en disco para los pesos cuantizados).
- Al ser un modelo de embeddings y no generativo, no requiere VRAM dedicada; puede ejecutarse en CPU o GPU de Apple Silicon con suficiente RAM (recomendable 8 GB o mas).
- Compatible con Apple Silicon (M1/M2/M3/M4) a traves de mlx-embeddings.
- Tambien es compatible con text-embeddings-inference (segun etiquetas del repositorio), lo que permite desplegarlo en servidores con GPU NVIDIA.
- Para inferencia en lote, se puede usar con vLLM o TGI si se convierte a formato compatible, aunque el formato nativo es MLX.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del numero de textos a procesar.

## Comparativa con modelos similares

No se dispone de informacion suficiente en los materiales proporcionados para realizar una comparativa con otros modelos de embeddings de tamano similar (por ejemplo, BGE-M3, E5-mistral-7b o GTE-Qwen2-7B). El modelo original F2LLM-v2 se presenta como una familia de modelos completamente abiertos con un equilibrio entre tamano, datos de entrenamiento y rendimiento, pero no se incluyen cifras comparativas concretas en la informacion disponible.

## Limitaciones y advertencias

- La cuantizacion a 6 bits introduce una leve perdida de precision: el minimo coseno frente a la referencia bfloat16 es de 0,99696, y la variacion maxima en similitudes consulta-documento es de 0,0078. Para tareas donde la precision sea critica, se recomienda usar la version bf16 o 8-bit.
- No es un modelo generativo: no puede completar texto, responder preguntas abiertas ni mantener conversaciones.
- La longitud de contexto maxima no esta documentada; el ejemplo de uso emplea 8192 tokens, pero valores superiores podrian degradar el rendimiento o no estar soportados.
- Al ser un modelo de embeddings, puede presentar sesgos presentes en los datos de entrenamiento, especialmente en lenguas de bajos recursos donde la cobertura puede ser menor.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se debe mantener la atribucion al modelo original.
- No se han realizado evaluaciones MTEB completas sobre esta version cuantizada; el rendimiento real en tareas especificas puede variar.

## Enlaces

- Repositorio HuggingFace de esta conversion: https://huggingface.co/fcmeyer/F2LLM-v2-4B-mlx-6bit
- Modelo base original: https://huggingface.co/codefuse-ai/F2LLM-v2-4B
- Articulo de investigacion (arXiv): https://arxiv.org/abs/2603.19223
- Repositorio GitHub de CodeFuse-Embeddings: https://github.com/codefuse-ai/CodeFuse-Embeddings/blob/main/F2LLM/README.md
- Libreria mlx-embeddings: https://github.com/Blaizzy/mlx-embeddings
