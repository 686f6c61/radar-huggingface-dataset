# alphaedge-ai/multilingual-e5-large-instruct-nya-32768

## Resumen

`multilingual-e5-large-instruct-nya-32768` es un modelo de embeddings de frases (sentence-similarity) derivado de `intfloat/multilingual-e5-large-instruct`, publicado por `alphaedge-ai`. No es un modelo nuevo entrenado desde cero, sino una versión podada del vocabulario (*trimming*) del modelo original, especializada en chichewa (código ISO `ny`). El objetivo es reducir drásticamente el tamaño del vocabulario y, con ello, el número de parámetros y la huella de memoria, manteniendo un comportamiento similar al original para el idioma objetivo.

La poda reduce el vocabulario de 250.037 a 32.768 tokens (-86,89%) y el total de parámetros de 559.890.432 a 337.442.816 (-39,73%). El repositorio ocupa 0,7 GB y los pesos están en formato safetensors, con integración directa en `sentence-transformers` y compatibilidad con Text Embeddings Inference (TEI) y endpoints de Hugging Face.

Es relevante para equipos que despliegan búsqueda semántica o RAG en chichewa con restricciones de memoria: obtienen un encoder XLM-RoBERTa con la misma dimensionalidad de embedding que el original, pero con una matriz de embeddings mucho menor. La contrapartida es que el vocabulario eliminado degrada el rendimiento en otros idiomas, por lo que no sustituye al modelo multilingüe completo en cargas de trabajo plurilingües.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa, derivado de `intfloat/multilingual-e5-large-instruct`) |
| Parametros totales | 337.442.816 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el sufijo `32768` del nombre hace referencia al tamano de vocabulario, no a la ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | chichewa (`ny`); el resto de idiomas del modelo base se degradan por la poda de vocabulario |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | no disponible en la informacion proporcionada |
| Tamano del vocabulario | 32.768 tokens |
| Tamano del repositorio | 0,7 GB |
| Libreria | sentence-transformers |
| Pipeline | sentence-similarity |

## Arquitectura y entrenamiento

El modelo es un encoder XLM-RoBERTa heredado de `intfloat/multilingual-e5-large-instruct`, que a su vez se entrena con objetivos de contraste para embeddings de texto (pares consulta-documento y pares de similitud). Sobre esa base, `alphaedge-ai` aplica la técnica de *trimming* descrita en el blog de Hugging Face: se calcula la frecuencia de tokens sobre un corpus del idioma objetivo, se seleccionan los 32.768 tokens más relevantes, se recorta la matriz de embeddings y se reindexan los identificadores de token.

El corpus de minería empleado consta de 97.692 textos procedentes del dataset `lbourdois/fineweb-2-trimming`. No se documenta un reentrenamiento adicional del encoder tras la poda: el modelo card indica que el modelo podado "debería comportarse de forma similar al original" para el idioma seleccionado, lo que implica que los pesos de las capas internas se conservan y solo se ajusta la capa de embeddings. No hay información sobre RLHF, DPO ni datos de entrenamiento adicionales más allá de la minería de vocabulario.

## Capacidades

- Generación de embeddings de frases para similitud semántica, con API diferenciada `encode_query` y `encode_document`.
- Recuperación de información (retrieval) y ranking de documentos mediante similitud coseno.
- Búsqueda semántica monolingüe en chichewa.
- Soporte de instrucciones de tarea (herencia del sufijo `instruct` del modelo base), aunque no se detalla el formato exacto de prompts en la información disponible.
- Integración con `sentence-transformers`, Text Embeddings Inference y endpoints compatibles de Hugging Face.
- No soporta generación de texto, tool calling, agentes ni visión: es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica en chichewa: indexar un corpus de documentos en chichewa y recuperar los fragmentos más relevantes para una consulta mediante similitud coseno entre `encode_query` y `encode_document`.
- RAG sobre documentación local: usar el modelo como retriever en un pipeline de generación aumentada, con una huella de memoria un 39,73% menor que el modelo base, lo que facilita el despliegue junto a un LLM generador en la misma máquina.
- Deduplicación y clustering de textos: agrupar noticias o registros en chichewa por similitud de embeddings para eliminar duplicados o organizar un archivo documental.
- Moderación y clasificación semántica: comparar mensajes de usuarios contra un conjunto de prototipos etiquetados para enrutar o filtrar contenido en chichewa.
- Sistemas de recomendación de contenido: calcular embeddings de artículos y perfiles de usuario para recomendar lecturas por afinidad temática.
- Despliegue en entornos con memoria limitada: al reducir el vocabulario a 32.768 tokens, el modelo cabe en instancias más pequeñas que el original, útil para servicios de embeddings a escala con presupuesto de VRAM ajustado.
- Evaluación de similitud entre pares de frases: tareas de paráfrasis o respuesta a preguntas basadas en similitud semántica en chichewa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,35 GB solo para pesos (337,4 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador.
- VRAM estimada en fp16/bf16: aproximadamente 0,68 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre para fp16; tarjetas consumer como RTX 3060, RTX 4060 o superiores son suficientes. Para lotes grandes, A10G, L4 o A100 ofrecen mayor throughput.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU dedicadas modernas e incluso en CPU para cargas moderadas.
- Opciones de despliegue: `sentence-transformers` (Python), Text Embeddings Inference (TEI), endpoints de Hugging Face; al ser un encoder estándar, también es compatible con librerías de inferencia que acepten safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Contexto |
|---|---|---|---|---|---|
| `alphaedge-ai/multilingual-e5-large-instruct-nya-32768` | 337,4 M | 32.768 | chichewa (poda del resto) | MIT | no disponible |
| `intfloat/multilingual-e5-large-instruct` (base) | 559,9 M | 250.037 | multilingüe | MIT | no disponible |
| `intfloat/multilingual-e5-large` | no disponible | no disponible | multilingüe | MIT | no disponible |
| `BAAI/bge-m3` | no disponible | no disponible | multilingüe | MIT | no disponible |

La comparación principal es con su modelo base: el podado reduce parámetros un 39,73% y vocabulario un 86,89%, a costa de perder cobertura en idiomas distintos del chichewa. Frente a alternativas multilingües como `bge-m3`, el modelo podado ofrece menor huella pero sin cobertura plurilingüe; los datos de rendimiento de esas alternativas no se incluyen en la información proporcionada.

## Limitaciones y advertencias

- La poda de vocabulario elimina tokens poco frecuentes en chichewa; el rendimiento en otros idiomas puede degradarse de forma significativa respecto al modelo base.
- No se han publicado evaluaciones cuantitativas que confirmen la equivalencia de rendimiento con el modelo original para chichewa.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos en similitud si los textos contienen vocabulario fuera del vocabulario podado (tokens mapeados a `unk`).
- El sufijo `32768` del nombre alude al tamaño de vocabulario, no a la longitud de contexto; no debe interpretarse como una ventana de 32.768 tokens.
- Licencia MIT: permite uso comercial, pero conviene conservar los avisos de copyright del modelo base y de los autores del método de trimming.
- Para producción multilingüe, usar el modelo base `intfloat/multilingual-e5-large-instruct` en lugar de esta variante.
- El modelo tiene 41 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y con poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/multilingual-e5-large-instruct-nya-32768
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-large-instruct
- Blog de introducción a trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minería: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Paper Multilingual E5: https://arxiv.org/abs/2402.05672
