# cstr/ettin-reranker-17m-v1-GGUF

## Resumen

El modelo `cstr/ettin-reranker-17m-v1-GGUF` es una cuantización en formato GGUF del reranker cross-encoder `cross-encoder/ettin-reranker-17m-v1`, desarrollado por el usuario `cstr` y convertido con la librería CrispEmbed. Se trata de un modelo de reranking de documentos basado en la arquitectura ModernBERT con 17,3 millones de parámetros, diseñado para mejorar la precisión de sistemas de recuperación de información (RAG, búsqueda semántica, etc.) reordenando los resultados devueltos por un modelo de embeddings.

La familia Ettin Reranker, a la que pertenece este modelo, se entrenó con una receta unificada de destilación por MSE (pointwise) desde un modelo teacher de mayor calidad, y sus creadores afirman que alcanza el estado del arte en todos los tamaños publicados hasta 1B de parámetros. La versión GGUF permite desplegar el modelo en entornos con recursos limitados, con tamaños de archivo de entre 17 y 69 MB según la cuantización, y es compatible con motores de inferencia como llama.cpp, Ollama o vLLM. La licencia Apache-2.0 permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (cross-encoder) con head de clasificación Dense(256→256, GELU) → LayerNorm → Dense(256→1) |
| Parametros totales | 17.320.328 (17,3 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (ModernBERT típicamente soporta 512 tokens, pero no confirmado en la documentación) |
| Tipos de cuantizacion | F32, Q8_0, Q4_K |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (también safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo base `cross-encoder/ettin-reranker-17m-v1` emplea una arquitectura cross-encoder basada en ModernBERT con 7 capas y 256 unidades de ocultación, añadiendo una cabeza de clasificación que transforma la representación de la secuencia en un score de relevancia. El tokenizador es GPT-2 ByteLevel BPE con 50.368 tokens, lo que permite procesar texto de forma eficiente y con un vocabulario reducido.

Según la documentación de la familia Ettin Reranker, el entrenamiento se realizó mediante destilación pointwise con pérdida MSE desde un modelo teacher de alta calidad, sobre una mezcla de datos de dominio general y específicos de recuperación. La receta de entrenamiento escala desde 17M hasta 1B de parámetros cambiando únicamente la tasa de aprendizaje y el tamaño de batch por dispositivo. La conversión a GGUF se realizó con CrispEmbed, que permite exportar el modelo a formatos cuantizados sin pérdida significativa de calidad.

## Capacidades

- Reranking de documentos: clasifica pares (consulta, documento) y devuelve un score de relevancia, ideal para sistemas de recuperación en dos etapas.
- Integración con pipelines de RAG: puede usarse para reordenar los resultados de un primer recuperador (bi-encoder) y mejorar la precisión final.
- Soporte para cuantización GGUF: permite ejecución en CPU con uso reducido de memoria (17-69 MB según cuantización).
- Compatibilidad con el ecosistema Hugging Face: se puede cargar con `transformers` o con motores de inferencia que soporten GGUF.
- Bajo coste computacional: con solo 17M de parámetros, es adecuado para entornos con recursos limitados.
- Entrenamiento por destilación: hereda el rendimiento de un teacher más grande, lo que le permite superar a modelos de tamaño similar.

## Casos de uso

- **Reordenación de resultados en búsqueda semántica**: en un pipeline de RAG, se utiliza un bi-encoder (por ejemplo, un modelo de embeddings) para obtener los 100 primeros resultados y luego se aplica este reranker para reordenarlos por relevancia, mejorando la precisión del sistema final.
- **Sistemas de preguntas y respuestas**: para filtrar y priorizar las pasajes que contienen la respuesta correcta antes de pasarlos al generador, reduciendo el ruido y mejorando la fidelidad de las respuestas.
- **Clasificación de documentos por relevancia**: en entornos empresariales, para ordenar documentos internos según su pertinencia a una consulta específica, sin necesidad de reentrenar el modelo.
- **Moderación de contenidos**: dada una consulta y un texto, el modelo puede puntuar si el texto es relevante para la consulta, útil en sistemas de recomendación de contenidos o de moderación.
- **Sistemas de soporte técnico**: para priorizar las respuestas de una base de conocimiento que mejor se adapten a la pregunta del usuario, reduciendo el tiempo de resolución.
- **Búsqueda en bases de datos vectoriales**: como etapa de reranking tras la recuperación inicial con embeddings, para refinar los resultados de búsqueda en aplicaciones de e-commerce o bibliotecas digitales.
- **Entornos con recursos limitados**: gracias a su tamaño reducido y a las cuantizaciones GGUF, puede desplegarse en CPU de baja potencia o en dispositivos edge, por ejemplo en aplicaciones de búsqueda móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el modelo de 17M en la información disponible. La documentación de la familia Ettin Reranker indica que el conjunto de modelos fue evaluado en el benchmark MTEB (inglés, v2) de Retrieval, con 10 tareas y top-100 reranking, combinado con seis modelos de embeddings distintos, y que la familia alcanza el estado del arte en todos los tamaños hasta 1B. Sin embargo, no se aportan cifras concretas de MMLU, HumanEval u otros benchmarks en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K, el modelo pesa ~17 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM, o incluso en CPU sin VRAM dedicada.
- GPU recomendadas: cualquier GPU con más de 2 GB de VRAM (GTX 1060, RTX 3050, etc.) es suficiente para inferencia en lote. Para despliegue en producción con alta concurrencia, se recomienda al menos una GPU de 8 GB (RTX 3070, A10, etc.).
- CPU: el formato GGUF permite ejecución en CPU con llama.cpp u Ollama; el modelo completo en F32 ocupa 69 MB, por lo que es viable en cualquier CPU moderna.
- Opciones de despliegue: llama.cpp, Ollama, CrispEmbed, Hugging Face Transformers (cargando el modelo base), o servidores de inferencia compatibles con GGUF como llama-cpp-python.
- Latencia y throughput estimados: no disponibles. Dado el tamaño de 17 M de parámetros, la latencia por consulta debería ser inferior a 10 ms en GPU y a 50 ms en CPU, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| ettin-reranker-17m-v1 (este) | 17,3 M | no disponible | Apache-2.0 | GGUF / safetensors | SOTA en la familia hasta 1B (según el autor) |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | 22,7 M | 512 | Apache-2.0 | safetensors | Referencia clásica en reranking, menos preciso que Ettin |
| bge-reranker-base | 278 M | 512 | MIT | safetensors | Más grande y preciso, pero requiere más recursos |

La comparativa directa con otros modelos de la misma categoría no está disponible en la información proporcionada. Los datos de rendimiento del modelo original se pueden consultar en el repositorio de la familia Ettin Reranker, pero no se han extraído cifras concretas.

## Limitaciones y advertencias

- **Idioma**: la documentación no especifica los idiomas soportados; se recomienda validar su comportamiento en idiomas distintos del inglés antes de desplegarlo en producción.
- **Alucinaciones**: al ser un reranker y no un generador, no produce texto, pero puede dar scores de relevancia incorrectos en dominios muy específicos o con vocabulario técnico no representado en sus datos de entrenamiento.
- **Contexto**: la longitud de contexto no está documentada en la información proporcionada; con ModernBERT se esperan 512 tokens, pero no está confirmado.
- **Rendimiento en dominios especializados**: al ser un modelo pequeño, puede tener un rendimiento inferior en dominios verticales (medicina, derecho, etc.) comparado con modelos más grandes.
- **Licencia**: Apache-2.0 permite uso comercial, pero hay que revisar las condiciones del modelo base original para asegurar que no hay restricciones adicionales.
- **Cuantización**: las versiones Q4_K y Q8_0 pueden introducir una pequeña degradación en la calidad de los scores; se recomienda validar el impacto en el caso de uso específico.

## Enlaces

- [Repositorio Hugging Face del modelo GGUF](https://huggingface.co/cstr/ettin-reranker-17m-v1-GGUF)
- [Modelo base en Hugging Face](https://huggingface.co/cross-encoder/ettin-reranker-17m-v1)
- [Documentación de la familia Ettin Reranker](https://aiflashreport.com/models/the-ettin-reranker-family/)
- [Noticia sobre la familia Ettin Reranker](https://aigcdev.com/en/news/2026051903)
- [CrispEmbed en GitHub](https://github.com/CrispStrobe/CrispEmbed)
