# nativ-community/embeddinggemma-2-mxfp8

## Resumen

`nativ-community/embeddinggemma-2-mxfp8` es una conversión a formato MLX del modelo de embeddings multimodal EmbeddingGemma 2 de Google, publicada por el usuario nativ-community. No se trata de un modelo entrenado desde cero, sino de un checkpoint cuantizado a MXFP8 (8 bits, group size 32) que conserva los codificadores de texto, imagen, audio y video del modelo original y produce embeddings normalizados de 768 dimensiones.

El interés principal de esta ficha radica en que permite ejecutar un modelo de embeddings multimodal sobre hardware Apple Silicon mediante el framework MLX, con un peso en disco de tan solo 1,226 GB. La cuantización aplica únicamente al codificador de texto y a la proyección de audio, mientras que las torres de visión y audio y la proyección de visión se mantienen en BF16 para preservar la fidelidad numérica en las modalidades no textuales.

Con 744.371.512 parámetros totales según los safetensors y licencia Apache 2.0, el modelo está pensado para tareas de recuperación, similitud semántica y extracción de características (feature extraction) en entornos multilingües. Al ser una conversión, sus capacidades de entrenamiento, sesgos y limitaciones son heredadas del checkpoint original `google/embeddinggemma-2`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de embeddings multimodal con codificadores de texto, imagen, audio y video; arquitectura interna detallada no disponible |
| Parametros totales | 744.371.512 (~744 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP8 (8 bits, group size 32); codificador de texto y proyección de audio cuantizados; torres de visión y audio y proyección de visión en BF16 |
| Idiomas soportados | Multilingüe (lista de idiomas concreta no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors para MLX (librería `mlx`) |
| Dimension de embedding | 768 (normalizado); truncable a 128, 256 o 512 mediante Matryoshka |
| Tamano del repositorio | 1,3 GB |
| Tamano de los pesos | 1,226 GB (decimal) |
| Pipeline | feature-extraction |
| Revision del modelo fuente | `914f7f89142e33e77833254d9c9b90c3cef7303b` |

## Arquitectura y entrenamiento

Se trata de una conversión de cuantización, no de un entrenamiento nuevo. El modelo fuente es `google/embeddinggemma-2`, y esta versión ha sido generada con MLX-VLM (revisión `3d87e884`, rama `pc/embeddinggemma-2`) y MLX 0.32.3. La política de cuantización estándar de MLX-VLM en modo `mxfp8` con 8 bits y group size 32 se aplica al codificador de texto y a la proyección de audio; las torres de visión y audio y la proyección de visión permanecen en BF16. Esta decisión de diseño busca limitar la pérdida de precisión en las modalidades no textuales, donde la sensibilidad a la cuantización suele ser mayor.

Los detalles de arquitectura interna (tipo de transformer, número de capas, mecanismo de atención, composición del dataset de entrenamiento, uso de RLHF o DPO) no están recogidos en la información disponible y deben consultarse en la model card del modelo original. La innovación técnica más destacable de esta conversión es el soporte de truncamiento Matryoshka: los embeddings pueden recortarse a 128, 256 o 512 dimensiones y renormalizarse, lo que permite ajustar el coste de almacenamiento y de búsqueda vectorial según la precisión requerida. La conversión también expone el uso de prefijos de tarea (por ejemplo, `task: search result | query:` y `title: none | text:`) definidos en `config_sentence_transformers.json`, que deben aplicarse de forma coherente entre consultas y documentos.

## Capacidades

- Generación de embeddings de texto normalizados de 768 dimensiones, con soporte de truncamiento Matryoshka a 128, 256 o 512 dimensiones.
- Extracción de características de imagen (image-feature-extraction).
- Extracción de características de audio (audio-feature-extraction).
- Extracción de características de video (video-feature-extraction, validado con entradas sintéticas de dos fotogramas).
- Embeddings multimodales combinados, incluyendo pares texto+imagen.
- Similitud semántica de frases (sentence-similarity) y recuperación de pasajes.
- Soporte multilingüe, verificado con seis entradas de texto en varios idiomas en las comprobaciones de conversión.
- Compatibilidad con prefijos de tarea para consultas y documentos, lo que permite adaptar el embedding al caso de uso sin reentrenamiento.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico; es un modelo de embeddings, no un modelo generativo de instrucciones.

## Casos de uso

- Búsqueda semántica multilingüe: el modelo genera embeddings normalizados que pueden indexarse en bases vectoriales para recuperar documentos relevantes a partir de consultas en distintos idiomas, aplicando el prefijo de tarea correspondiente tanto a la consulta como al documento.
- RAG (generación aumentada por recuperación): actúa como recuperador de pasajes que alimentan a un LLM generativo, con la ventaja de que el truncamiento Matryoshka a 256 o 128 dimensiones reduce el uso de memoria en el índice vectorial sin cambiar de modelo.
- Recuperación multimodal texto-imagen: permite buscar imágenes a partir de una consulta textual, o viceversa, gracias a la torre de visión conservada en BF16, útil en catálogos de producto o bibliotecas de activos.
- Recuperación texto-audio: la torre de audio y su proyección, parcialmente cuantizada, permiten construir índices de fragmentos de audio buscables por descripción textual, por ejemplo en archivos de podcasts o grabaciones.
- Búsqueda sobre video: con la torre de video integrada, se pueden indexar fotogramas o clips y recuperarlos mediante consultas en lenguaje natural, adecuado para archivos audiovisuales y monitorización de contenido.
- Deduplicación y clustering de documentos: los embeddings permiten agrupar o descartar elementos casi idénticos en corpus grandes, aplicando umbrales de similitud coseno sobre vectores normalizados.
- Clasificación zero-shot por similitud: comparar la representación de un texto con las de etiquetas descriptivas para asignar categorías sin entrenar un clasificador específico.
- Sistemas de recomendación basados en contenido: representar ítems y preferencias de usuario en el mismo espacio de 768 dimensiones para calcular afinidades, con truncamiento a 128 dimensiones si se prioriza la latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MTEB, MMLU, etc.) en la información disponible. La model card indica explícitamente que las comprobaciones realizadas son pruebas de humo numéricas y no un benchmark de calidad de recuperación. Se reproduce a continuación la tabla de fidelidad de la conversión frente al checkpoint original en PyTorch FP32, que mide similitud coseno mínima y error absoluto máximo:

| Entrada | Coseno mínimo vs FP32 | Error absoluto máximo |
|---|---:|---:|
| audio | 0,998335 | 0,006558 |
| image | 0,999487 | 0,003610 |
| text | 0,998305 | 0,006092 |
| text_image | 0,999264 | 0,004823 |
| video | 0,999231 | 0,007177 |

Todas las salidas verificadas fueron finitas, normalizadas a norma unitaria y de 768 dimensiones. La prueba de humo de recuperación textual clasificó el pasaje sobre Marte por encima del de Venus. Las mediciones completas, incluidas las comparaciones con vectores truncados, están en el archivo `validation.json` del repositorio.

## Requisitos de hardware

- El modelo está empaquetado para MLX, por lo que su entorno de ejecución nativo es Apple Silicon (familias M1, M2, M3 y M4). No es una conversión orientada a CUDA.
- Peso de los pesos en disco: 1,226 GB (decimal). La VRAM/unified memory necesaria para inferencia será algo superior al sumar activaciones y buffers; una estimación prudente se sitúa en el entorno de 2 a 4 GB, aunque no se proporciona una cifra oficial.
- Cabe holgadamente en cualquier Mac con Apple Silicon y memoria unificada de 8 GB o superior, dado el reducido tamaño del checkpoint.
- No se dispone de datos oficiales de latencia ni throughput.
- Opciones de despliegue: MLX-VLM (versión que incluya soporte de EmbeddingGemma 2, revisión `3d87e884`) junto con `mlx>=0.32.3` y `transformers>=5.18.0`.
- Para el preprocesamiento de imagen, audio y video se requiere una build de Transformers que exponga `EmbeddingGemma2Processor`; la versión estándar de PyPI 5.18.0 todavía no lo expone. El ejemplo solo texto utiliza `AutoTokenizer` y no necesita dicho procesador.
- Nota de precisión: mantener los pesos y activaciones no cuantizados en BF16; no convertir el modelo a float16.

## Comparativa con modelos similares

| Modelo | Parametros | Dimensiones | Modalidades | Formato | Licencia |
|---|---:|---|---|---|---|
| embeddinggemma-2-mxfp8 (este) | 744 M | 768 (truncable) | texto, imagen, audio, video | MLX MXFP8 | Apache 2.0 |
| google/embeddinggemma-2 | No disponible | 768 (truncable) | texto, imagen, audio, video | No disponible | Apache 2.0 (declarada por el autor de la conversión) |
| google/embeddinggemma (generación anterior) | No disponible en la información proporcionada | No disponible | Texto | No disponible | No disponible |

No se dispone de datos suficientes en la información proporcionada para comparar con alternativas de otros fabricantes (por ejemplo, modelos de embeddings multilingües de terceros) en cuanto a parámetros, contexto o rendimiento. La comparativa queda limitada al modelo fuente y a su predecesor.

## Limitaciones y advertencias

- Es una conversión de cuantización de terceros publicada por el usuario nativ-community, no un artefacto oficial de Google. La responsabilidad sobre el proceso de conversión y su validación recae en el autor de la conversión.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado en octubre de 2026, por lo que no cuenta con validación de la comunidad ni historial de uso en producción.
- La cuantización MXFP8 puede introducir desviaciones respecto al checkpoint original, con cosenos mínimos de aproximadamente 0,998 frente a FP32 según las pruebas del autor, que no constituyen un benchmark de calidad.
- La longitud de contexto no está documentada en la información disponible, lo que impide planificar el troceado (chunking) de documentos largos con precisión.
- La lista concreta de idiomas soportados no se detalla; solo se indica «multilingual», con una validación limitada a seis entradas de texto.
- Riesgo de alucinación no aplicable en el sentido generativo (no produce texto libre), pero sí existe riesgo de recuperaciones semánticamente plausibles pero incorrectas, especialmente fuera del dominio de entrenamiento.
- El preprocesamiento multimodal está condicionado a una build específica de Transformers que exponga `EmbeddingGemma2Processor`; con la versión estándar de PyPI, las rutas de imagen, audio y video no funcionan directamente.
- No se debe convertir el modelo a float16; los pesos no cuantizados deben permanecer en BF16.
- La licencia declarada es Apache 2.0, que permite uso comercial, pero el usuario debe verificar la licencia efectiva del checkpoint original `google/embeddinggemma-2` antes de un despliegue comercial.
- Al ser un modelo exclusivamente de embeddings, no puede emplearse para generación de texto, razonamiento, código ni uso agéntico.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/nativ-community/embeddinggemma-2-mxfp8
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Revisión concreta del modelo fuente: https://huggingface.co/google/embeddinggemma-2/tree/914f7f89142e33e77833254d9c9b90c3cef7303b
- Repositorio MLX-VLM (revisión usada para la conversión): https://github.com/Blaizzy/mlx-vlm/tree/3d87e88402f307efbf68e568971aa887ee7d9ed0
- Los resultados de la búsqueda web realizada no contienen enlaces relevantes para este modelo: los dominios devueltos corresponden a productos y servicios no relacionados con el modelo de embeddings.
