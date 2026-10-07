# jayyun98/embeddinggemma-2-text-image-440m-mlx-fp32

## Resumen

EmbeddingGemma 2 — Text + Image — FP32 — MLX es un export de despliegue del modelo de embeddings multimodal EmbeddingGemma 2 de Google DeepMind, publicado por el usuario jayyun98. No se trata de un modelo entrenado desde cero ni de un fine-tuning: es una conversión modular que conserva únicamente el backbone de texto, el encoder de visión y la proyección de visión, y elimina por completo el encoder y la proyección de audio. El resultado es un modelo de extracción de características (feature-extraction) con 438.760.448 parámetros efectivos que genera embeddings de 768 dimensiones a partir de texto, código, imágenes o combinaciones de texto e imagen.

La relevancia de esta ficha está en su formato y su runtime: los pesos se almacenan en FP32 sobre safetensors y se cargan mediante MLX, la librería de Apple para ejecución sobre silicio de Apple (GPU unificada). Esto permite generar embeddings multimodales en local sobre Macs con chip M-series, sin depender de servicios en la nube. El modelo conserva los prompts originales, el tokenizador y los assets del processor del checkpoint de Google, y mantiene la ventana de contexto de 8.192 tokens, además de soporte de Matryoshka Representation Learning (MRL) con truncado a 512, 256 y 128 dimensiones.

Es importante subrayar que esta conversión no aplica entrenamiento, destilación ni cuantización, y que la expansión a FP32 desde los valores BF16 originales es sin pérdida pero no recupera precisión que no existiera en el checkpoint entrenado. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que se trata de una exportación personal, no de un release oficial de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle (backbone de texto tipo transformer + encoder de visión + proyección de visión; encoder y proyección de audio eliminados). Familia base: EmbeddingGemma 2 de Google DeepMind |
| Parametros totales | 438.760.448 (dato real declarado en safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No disponible en este repositorio; los pesos almacenados son FP32 (expansión sin pérdida de los BF16 originales). Cargar como BF16 cambia la precisión en runtime |
| Idiomas soportados | Multilingüe (verificación explícita en inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (runtime MLX); incluye conversion.json y verification.json |
| Dimension de salida | 768 dimensiones; MRL truncable a 512, 256 y 128 |
| Modalidades de entrada | Texto, código, imágenes, texto + imagen (audio no disponible) |
| Tamano del repo | 1,8 GB; fichero de pesos de 1.755,12 MB (decimal) |
| Libreria / runtime | mlx (probado con MLX 0.32.3 y Transformers 5.19.0) |
| Modelo base | google/embeddinggemma-2 |

## Arquitectura y entrenamiento

La model card describe el paquete como una exportación modular de despliegue del checkpoint EmbeddingGemma 2 de Google DeepMind. Se retienen tres componentes: el backbone de texto, el encoder de visión y la proyección de visión. Se eliminan el encoder de audio y la proyección de audio. No se aplicó entrenamiento, destilación ni cuantización sobre el modelo original: la conversión es exclusivamente de formato y precisión de almacenamiento (BF16 a FP32), por lo que el comportamiento del modelo depende íntegramente del checkpoint base de Google. Esta ficha no dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original; esos datos habría que consultarlos en la model card de google/embeddinggemma-2.

La innovación relevante de este paquete es de tipo operativo, no algorítmico: es una conversión estricta a MLX verificada numéricamente contra el checkpoint FP32 de referencia. La verificación cubre búsqueda y documentos en inglés y coreano, consultas de código e imágenes, además de vectores normalizados de 128, 256 y 512 dimensiones. Los pesos FP32 son una expansión sin pérdida de los valores BF16 del upstream, de modo que no se recupera precisión ausente en el checkpoint original entrenado. El modelo depende de una revisión fijada del implementador MLX-VLM (`3d87e884`) para cargar correctamente, lo que implica que la reproducibilidad está atada a ese commit concreto.

## Capacidades

- Generación de embeddings de texto para tareas de sentence-similarity y recuperación semántica.
- Embeddings de código, con prefijo específico `CodeRetrieval` para consultas de búsqueda en código.
- Embeddings de imagen, mediante el encoder de visión y el processor asociado.
- Embeddings multimodales de texto + imagen, usando el token `<|image|>` para combinar ambos tipos de contenido.
- Soporte de entradas con dos imágenes intercaladas (verificado por el autor).
- Soporte multilingüe, con verificación explícita de recuperación en inglés y coreano.
- Dimensiones Matryoshka (MRL): truncado a 512, 256 y 128 dimensiones con normalización posterior.
- Prompts y prefijos de tarea diferenciados: `SearchQuery`, `CodeRetrieval` y `Document`, más el formato `title: {title} | text: {content}` para documentos con título.
- No es un modelo generativo: no produce texto, no hace tool calling ni razonamiento multi-paso. Es exclusivamente un modelo de representación vectorial.
- Capacidad de audio: no disponible en este export (encoder y proyección eliminados).
- Capacidad de vídeo: no evaluada por el autor.

## Casos de uso

- Búsqueda semántica en corpus multilingües: el modelo genera embeddings de consulta y documento con prefijos distintos (`SearchQuery` y `Document`) y una ventana de 8.192 tokens, lo que permite indexar pasajes largos sin troceado agresivo y recuperar resultados en varios idiomas.
- Recuperación aumentada por generación (RAG) sobre bases de conocimiento mixtas: al producir vectores comparables para texto e imagen, un pipeline de RAG puede recuperar tanto documentación escrita como diagramas o capturas asociadas en un único índice.
- Búsqueda de código en repositorios: con el prefijo `CodeRetrieval`, se pueden construir índices de funciones y ficheros para que un IDE o un bot interno localice implementaciones a partir de una descripción en lenguaje natural.
- Deduplicación y clustering de documentos: los embeddings de 768 dimensiones (o 128 tras truncado MRL) permiten agrupar documentos similares, detectar duplicados y organizar grandes volúmenes de contenido con un coste de almacenamiento reducido si se usa el truncado.
- Búsqueda visual en catálogos de producto: el encoder de visión permite indexar imágenes de producto y recuperarlas mediante consultas de texto o mediante imágenes de referencia, útil en comercio electrónico y en gestión de activos digitales.
- Clasificación zero-shot y reranking: calculando la similitud coseno entre un texto y etiquetas descriptivas se puede clasificar sin entrenamiento adicional, y también reordenar los resultados de un primer recuperador léxico.
- Procesamiento en local con privacidad: al ejecutarse sobre MLX en silicio de Apple, todo el cálculo de embeddings puede hacerse en el propio portátil o estación de trabajo, sin enviar documentos ni imágenes a servicios externos.
- Moderación y análisis de contenido multimodal: comparar captions, imágenes y textos contra un conjunto de vectores de referencia permite marcar contenido similar a casos conocidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas MTEB ni de recuperación, y advierte explícitamente que las mediciones incluidas son comprobaciones numéricas de conversión y carga, no evaluaciones de calidad de recuperación ni de velocidad.

Tabla de verificación técnica aportada por el autor (similitud coseno mínima y diferencia absoluta máxima frente al checkpoint FP32 de origen):

| Fixture | Similitud coseno minima | Diferencia absoluta maxima |
|---|---:|---:|
| search_english_korean | 1.000000000 | 1.2293458e-07 |
| documents | 1.000000000 | 1.49011612e-07 |
| code | 1.000000000 | 1.53668225e-07 |
| image | 1.000000000 | 1.28522515e-07 |
| mixed_text_image | 1.000000000 | 1.16415322e-07 |
| interleaved_two_images | 1.000000000 | 1.63912773e-07 |

## Requisitos de hardware

- VRAM / memoria unificada estimada para inferencia: los pesos ocupan 1,8 GB en FP32 (fichero de 1.755,12 MB); con activaciones, buffers del tokenizador y del processor, cabe esperar un consumo del orden de 2,5 a 3,5 GB en FP32. Estas cifras son una estimación derivada del recuento de parámetros, no un dato medido publicado.
- Si se convierte a BF16 o FP16, el peso de los pesos baja a aproximadamente 0,9 GB, aunque la model card advierte que cargar este paquete FP32 como BF16 altera la precisión en runtime.
- GPU compatibles: el autor verificó la carga nativa en MLX y la inferencia sobre GPU de Apple Silicon. No se proporcionan datos de rendimiento para A100, H100, RTX 4090 ni otras GPU NVIDIA, y este repositorio no ofrece pesos para CUDA.
- Cabe en GPU de consumo: sí, en el sentido de que un Mac con memoria unificada de 8 GB o más puede alojar el modelo en FP32 con holgura. No hay confirmación de funcionamiento en GPUs de consumo NVIDIA a través de este paquete.
- Opciones de despliegue: MLX con la revisión fijada de MLX-VLM (`3d87e884`), `mlx>=0.32.3` y `transformers>=5.19.0`. Se cargan pesos safetensors. No se incluyen pesos GGUF, por lo que llama.cpp u Ollama no son una vía directa con este repositorio; tampoco se documenta integración con vLLM ni TGI.
- Latencia y throughput: no disponibles. No se ha publicado ninguna medición de velocidad (la model card lo indica expresamente).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de salida | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|---|
| jayyun98/embeddinggemma-2-text-image-440m-mlx-fp32 | 438.760.448 | 8.192 tokens | 768 (MRL 512/256/128) | Texto, codigo, imagen, texto+imagen | Apache 2.0 | safetensors (MLX, FP32) |
| google/embeddinggemma-2 (upstream) | No disponible | No disponible en esta ficha | No disponible en esta ficha | Incluye audio ademas de texto e imagen | Apache 2.0 (segun la atribucion del export) | No disponible en esta ficha (BF16 como origen de la conversion) |
| Otros modelos de embeddings multilingues de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este export frente a alternativas de la misma categoria. Cualquier comparativa de calidad tendria que apoyarse en resultados MTEB publicados por terceros, que no forman parte de la informacion disponible.

## Limitaciones y advertencias

- No se han publicado resultados de calidad de recuperación (MTEB ni similares). Las unicas metricas incluidas son comprobaciones de conversion numerica, no evaluaciones de rendimiento.
- El encoder y la proyeccion de audio se han eliminado: cualquier flujo de trabajo que dependa de audio no funcionara con este paquete. Los procesadores conservados no restauran esos pesos.
- Los flujos con video no fueron evaluados por el autor.
- La expansion a FP32 no recupera precision que no estuviera presente en el checkpoint BF16 original; es un cambio de almacenamiento, no una mejora de calidad.
- Las diferencias de aritmetica entre runtimes y el redondeo a BF16 pueden producir pequenas discrepancias frente a PyTorch FP32, aunque las diferencias absolutas medidas estan en el orden de 1e-07.
- Dependencia fragil de versiones: el modelo exige una revision concreta de MLX-VLM (`3d87e884`), ademas de MLX 0.32.3 y Transformers 5.19.0. Cambios en esas dependencias pueden romper la carga.
- Solo se ejecuta sobre MLX; no hay soporte documentado para CUDA, vLLM, TGI, llama.cpp u Ollama con este repositorio.
- Riesgo de sesgo y de alucinacion: al ser un modelo de embeddings y no generativo, no alucina texto, pero hereda los sesgos del checkpoint de Google DeepMind sobre el que se construye. No se aporta informacion especifica sobre sesgos medidos.
- La ventana de contexto esta limitada a 8.192 tokens; los documentos mas largos deben trocearse.
- Si se aplica truncado MRL, es obligatorio normalizar despues del recorte y usar dimensiones coincidentes entre consultas y documentos.
- Repositorio con 0 descargas y 0 likes: es una exportacion personal, no auditada por Google, y no debe tratarse como un release oficial. La atribucion de pesos y tokenizador corresponde a Google DeepMind, y la implementacion a los contribuidores de MLX-VLM.
- Uso comercial: la licencia Apache 2.0 lo permite, pero conviene revisar la model card del modelo original para condiciones adicionales de uso responsable.
- La fecha de creacion que figura en los metadatos del repositorio es 2026-10-06, posterior a la fecha habitual de publicacion de otros modelos de la familia; no se dispone de explicacion para este dato.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jayyun98/embeddinggemma-2-text-image-440m-mlx-fp32
- Modelo base (Google DeepMind): https://huggingface.co/google/embeddinggemma-2
- Revision de origen del checkpoint: https://huggingface.co/google/embeddinggemma-2/tree/914f7f89142e33e77833254d9c9b90c3cef7303b
- Implementacion MLX-VLM (revision fijada): https://github.com/Blaizzy/mlx-vlm/tree/3d87e88402f307efbf68e568971aa887ee7d9ed0
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- conversion.json (precision de almacenamiento y comprobaciones de conversion): https://huggingface.co/jayyun98/embeddinggemma-2-text-image-440m-mlx-fp32/blob/main/conversion.json
- verification.json (runtime, resultados numericos y entorno probado): https://huggingface.co/jayyun98/embeddinggemma-2-text-image-440m-mlx-fp32/blob/main/verification.json
- LICENSE (Apache 2.0): https://huggingface.co/jayyun98/embeddinggemma-2-text-image-440m-mlx-fp32/blob/main/LICENSE
- NOTICE: https://huggingface.co/jayyun98/embeddinggemma-2-text-image-440m-mlx-fp32/blob/main/NOTICE
