# furiosa-ai/harrier-oss-v1-0.6b

## Resumen

harrier-oss-v1-0.6b es un modelo de embeddings de texto multilingüe desarrollado originalmente por Microsoft y redistribuido por FuriosaAI junto con un Furiosa Executable Bundle (FXB) para ejecutarse sobre aceleradores FuriosaAI RNGD mediante la librería Furiosa-LLM. El modelo parte de la arquitectura Qwen3 densa (decoder-only) y se entrena con la receta de embeddings multilingüe e instruction-aware propia de la familia Harrier, no con la receta de Qwen3-Embedding. Genera vectores de 1.024 dimensiones mediante last-token pooling y normalización L2.

El modelo resuelve tareas de representación semántica: recuperación de información (retrieval), clustering, similitud semántica, clasificación, minería de bitextos y reranking. Su rasgo diferencial es el soporte de instrucciones por consulta en formato `Instruct: ...\nQuery: ...`, lo que permite adaptar el espacio de embeddings a la tarea sin reentrenar. Cubre más de 90 idiomas, incluido el castellano.

Esta variante concreta es relevante para equipos que despliegan sobre hardware FuriosaAI: incluye el bundle ejecutable precompilado y expone un servidor compatible con la API de OpenAI (`/v1/embeddings`), lo que facilita la integración con clientes existentes. Con 596.049.920 parámetros y licencia MIT, es una opción ligera para pipelines de búsqueda semántica y RAG en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 densa (decoder-only), clase `Qwen3Model` |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | sin cuantización; ejecución en BF16 nativo |
| Idiomas soportados | multilingüe (más de 90 idiomas, incluidos es, en, de, fr, pt, it, zh, ja, ar, hi, ru, entre otros) |
| Licencia | MIT |
| Formato de pesos | safetensors, más Furiosa Executable Bundle (FXB) |
| Dimension de embedding | 1.024 |
| Pooling | last-token pooling con normalización L2 |
| Hardware soportado | FuriosaAI RNGD (tensor-parallel de 8 PEs, una tarjeta) |
| Libreria | furiosa-llm (también compatible con transformers y sentence-transformers vía el modelo base) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer densa decoder-only basada en Qwen3, reutilizada como codificador de embeddings. La salida se obtiene tomando el último token y aplicando normalización L2, de modo que el producto escalar entre vectores equivale a la similitud coseno. El modelo es instruction-aware: las consultas se prefijan con una descripción de tarea de una frase en el formato `Instruct: <tarea>\nQuery: <consulta>`, mientras que los documentos se codifican sin instrucción.

El entrenamiento sigue la receta multilingüe e instruction-aware de Harrier, distinta de la utilizada en Qwen3-Embedding, según indica la model card. No se proporcionan en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales más allá del esquema de pooling y del condicionamiento por instrucción.

## Capacidades

- Generación de embeddings de texto densos de 1.024 dimensiones con normalización L2.
- Recuperación de información (retrieval) multilingüe con condicionamiento por instrucción.
- Similitud semántica entre pares de textos.
- Clustering y agrupamiento semántico de documentos.
- Clasificación de textos mediante representaciones vectoriales.
- Minería de bitextos (bitext mining) para corpus paralelos.
- Reranking de resultados de búsqueda.
- Cobertura multilingüe amplia (más de 90 idiomas).
- Servidor compatible con la API de OpenAI (`/v1/embeddings`).
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Búsqueda semántica en aplicaciones corporativas: indexar documentos con embeddings de 1.024 dimensiones y recuperar los pasajes relevantes ante consultas en lenguaje natural, usando la instrucción de retrieval para mejorar la precisión.
- RAG (generación aumentada por recuperación): servir como recuperador en pipelines que alimentan a un LLM generativo, con despliegue sobre RNGD mediante el endpoint compatible con OpenAI.
- Atención al cliente y bases de conocimiento: emparejar preguntas de usuarios con artículos de ayuda en castellano y otros idiomas, aprovechando la cobertura multilingüe para entornos con documentación en varios idiomas.
- Deduplicación y clustering de contenidos: agrupar noticias, tickets o reseñas por similitud semántica para análisis de temas y eliminación de duplicados.
- Clasificación de textos sin etiquetas abundantes: usar los embeddings como entrada a clasificadores ligeros en moderación de contenido o enrutamiento de tickets.
- Minería de bitextos para traducción automática: alinear oraciones en corpus paralelos multilingües gracias a la calidad de similitud entre idiomas.
- Reranking en motores de búsqueda híbridos: reordenar los candidatos recuperados por un motor léxico (BM25) según la similitud semántica del embedding.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona la integración con MTEB como etiqueta, pero no incluye puntuaciones concretas ni comparativas numéricas.

## Requisitos de hardware

- VRAM estimada: con 596 millones de parámetros en BF16, el peso del modelo ocupa aproximadamente 1,2 GB; el consumo total depende del tamaño de lote y de la longitud de secuencia.
- GPU recomendadas: el despliegue de referencia es sobre FuriosaAI RNGD, con tensor-parallel de 8 PEs en una sola tarjeta.
- GPU de consumo: por tamaño, cabe en GPUs de consumo con al menos 4-6 GB de VRAM en BF16 (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090), aunque no se documenta oficialmente el rendimiento en estas.
- Opciones de despliegue: Furiosa-LLM (`furiosa-llm serve`), con API compatible con OpenAI; también transformers y sentence-transformers mediante el modelo base de Microsoft.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de embedding | Idiomas | Licencia | Despliegue destacado |
|---|---|---|---|---|---|
| harrier-oss-v1-0.6b (esta variante) | 596 M | 1.024 | más de 90 | MIT | FuriosaAI RNGD, Furiosa-LLM |
| microsoft/harrier-oss-v1-0.6b | 596 M | 1.024 | más de 90 | MIT | transformers, sentence-transformers |
| Modelos de embeddings multilingües de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas de otros fabricantes no está disponible en la información proporcionada; no se aportan datos de rendimiento comparado.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce embeddings; no puede usarse para chat, generación de código ni razonamiento.
- Riesgo de sesgos heredados de los datos de entrenamiento del modelo base de Microsoft; no se documentan evaluaciones de sesgo.
- La efectividad depende del uso correcto de las instrucciones en consultas; omitirlas o aplicarlas a documentos puede degradar la calidad de recuperación.
- La longitud máxima de contexto no está documentada en la información disponible.
- El rendimiento fuera de hardware FuriosaAI RNGD no está validado oficialmente en esta variante.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del modelo base de Microsoft por si hubiera términos adicionales.
- En producción, la calidad de los embeddings debe validarse sobre el dominio concreto, ya que no hay benchmarks publicados para esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/furiosa-ai/harrier-oss-v1-0.6b
- Modelo base: https://huggingface.co/microsoft/harrier-oss-v1-0.6b
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Servidor Furiosa-LLM (`furiosa-llm serve`): https://developer.furiosa.ai/latest/en/furiosa_llm/furiosa-llm-serve.html
- Guía de instalación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- FuriosaAI: https://furiosa.ai
- Licencia MIT: https://opensource.org/license/mit
