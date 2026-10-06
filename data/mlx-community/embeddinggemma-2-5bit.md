# mlx-community/embeddinggemma-2-5bit

## Resumen

mlx-community/embeddinggemma-2-5bit es una conversion a formato MLX del modelo de embeddings multimodal google/embeddinggemma-2, publicada por la comunidad mlx-community. Se distribuye cuantizada en 5 bits con modo affine y tamano de grupo 64, conservando los codificadores de texto, imagen, audio y video del modelo original. El resultado es un extractor de caracteristicas que genera embeddings normalizados de 768 dimensiones, con soporte de truncado Matryoshka a 128, 256, 512 o 768 dimensiones.

El modelo resuelve tareas de representacion densa para recuperacion y similitud semantica: busqueda, RAG, clasificacion, clustering y deduplicacion, tanto en texto como en modalidades mixtas (texto-imagen, audio y video). Su relevancia practica esta en que reduce el peso de almacenamiento a 1,132 GB (frente a un checkpoint original en BF16 o FP32) y permite ejecutar inferencia local en hardware Apple Silicon mediante MLX, sin depender de GPUs NVIDIA.

La ficha se centra en lo que la model card documenta. No se publican datos de contexto maximo, composicion del dataset de entrenamiento ni resultados MTEB; si se documentan comprobaciones numericas de fidelidad de la conversion frente al checkpoint original en PyTorch FP32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; modelo base google/embeddinggemma-2 con codificadores de texto, imagen, audio y video |
| Parametros totales | 744.371.512 (aproximadamente 744 M), segun safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Affine de 5 bits, group size 64 (encoder de texto y proyeccion de audio cuantizados; torres de vision y audio y proyeccion de vision en BF16) |
| Idiomas soportados | Multilingue (no se detalla la lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |
| Dimension de embedding | 768, normalizada; truncado Matryoshka a 128, 256 o 512 |
| Modelo base | google/embeddinggemma-2 (revision 914f7f89142e33e77833254d9c9b90c3cef7303b) |
| Tamano del repositorio | 1,2 GB (pesos: 1,132 GB en notacion decimal) |
| Libreria | mlx (mlx-vlm) |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna del modelo base ni su proceso de entrenamiento; solo indica que se trata de una conversion MLX que conserva los codificadores de texto, imagen, audio y video de google/embeddinggemma-2. La politica estandar de cuantizacion de MLX-VLM aplicada en esta conversion cuantiza el encoder de texto y la proyeccion de audio, mientras que las torres de vision y audio junto con la proyeccion de vision permanecen en BF16. No hay informacion sobre numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

La innovacion tecnica relevante en esta publicacion es la propia conversion: pesos en 5 bits con cuantizacion affine y group size 64, mas la integracion con MLX-VLM para cargar el modelo como extractor de embeddings multimodal. La conversion se genero con MLX-VLM en la revision 3d87e884 (rama pc/embeddinggemma-2) y MLX 0.32.3, a partir del checkpoint original. El modelo aplica prefijos de tarea definidos en config_sentence_transformers.json (por ejemplo, "task: search result | query:" para consultas y "title: none | text:" para documentos), y el autor recomienda mantener pesos y activaciones no cuantizados en BF16, sin convertir el modelo a float16. Los embeddings deben normalizarse y consultas y documentos tienen que usar la misma dimension.

## Capacidades

- Generacion de embeddings de texto normalizados de 768 dimensiones para similitud semantica y recuperacion.
- Embeddings multimodales: imagen, audio y video, ademas de combinaciones texto+imagen.
- Truncado Matryoshka a 128, 256, 512 o 768 dimensiones para reducir coste de almacenamiento y de busqueda vectorial.
- Soporte multilingue declarado (sin lista de idiomas especificada).
- Similitud de frases y recuperacion texto-texto con prefijos de tarea diferenciados para consulta y documento.
- Extraccion de caracteristicas (feature-extraction) como pipeline principal.
- No se documenta soporte de tool calling, function calling, agentes ni modo de razonamiento: el modelo es un encoder de embeddings, no un modelo generativo de instrucciones.

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar los documentos con el prefijo de documento y las consultas con el prefijo de consulta, generando vectores de 768 dimensiones que se comparan por similitud coseno.
- RAG sobre bases de conocimiento internas: usar el modelo como encoder del recuperador, con truncado a 256 o 512 dimensiones si el indice vectorial necesita reducir memoria y latencia de busqueda.
- Deduplicacion y clustering de articulos o tickets de soporte: agrupar elementos por cercania en el espacio de embeddings tras normalizar los vectores.
- Recuperacion multimodal de imagenes: indexar un catalogo de imagenes con el codificador de vision y consultar en lenguaje natural con el codificador de texto, comparando ambos en el mismo espacio de 768 dimensiones.
- Busqueda sobre archivos de audio: generar embeddings de audio para localizar fragmentos por contenido (por ejemplo, localizar una locucion concreta dentro de un archivo de horas) usando el codificador de audio.
- Recuperacion de fragmentos de video: indexar fotogramas o clips cortos con el codificador de video y recuperar el fragmento relevante a partir de una consulta textual.
- Clasificacion y enrutado ligero: entrenar un clasificador lineal sobre los embeddings congelados para etiquetar correos, intentos de contacto o categorias de producto.
- Recomendacion por similitud de contenido: representar items y preferencias del usuario como vectores y ordenar candidatos por similitud coseno.
- Ejecucion local en portatiles Apple Silicon: al pesar 1,132 GB, el modelo se puede cargar en memoria unificada para prototipos y pruebas sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MTEB u otros) en la informacion disponible. La model card solo incluye comprobaciones numericas de fidelidad de la conversion frente al checkpoint original en PyTorch FP32, que no constituyen una evaluacion de calidad de recuperacion.

| Entrada | Minimo coseno frente a FP32 | Error absoluto maximo |
|---|---:|---:|
| audio | 0,992494 | 0,012261 |
| image | 0,997334 | 0,007859 |
| text | 0,992759 | 0,013390 |
| text_image | 0,996334 | 0,009012 |
| video | 0,996727 | 0,009256 |

Segun el autor, todas las salidas verificadas fueron finitas, normalizadas a norma unitaria y de 768 dimensiones. La prueba de recuperacion textual situo el pasaje sobre Marte por delante del de Venus. Las comprobaciones cubren seis entradas de texto multilingue y entradas sinteticas de imagen, audio, video de dos fotogramas y texto+imagen. El autor indica explicitamente que son pruebas de humo numericas y no una evaluacion MTEB ni de calidad de recuperacion. Las mediciones completas, incluidas las comparaciones con vectores truncados, estan en validation.json.

## Requisitos de hardware

- Pesos cuantizados: 1,132 GB en notacion decimal; repositorio completo de 1,2 GB.
- Las torres de vision y audio y la proyeccion de vision permanecen en BF16, por lo que el consumo real de memoria en inferencia multimodal es superior al de los pesos cuantizados.
- Memoria estimada para inferencia: del orden de 1,5 a 3 GB segun modalidad y tamano de lote (estimacion a partir del tamano de los pesos, no publicada por el autor).
- Destino principal: Apple Silicon con memoria unificada, ya que la libreria declarada es MLX y las instrucciones de carga usan mlx-vlm y mlx>=0.32.3.
- No se documentan GPU NVIDIA, A100, H100 ni RTX 4090 en la informacion proporcionada.
- Despliegue: MLX-VLM (load_embedding_model o load), con dependencia de transformers>=5.18.0. Para el ejemplo solo texto basta AutoTokenizer; el preprocesado de imagen, audio y video requiere una build de Transformers que exponga EmbeddingGemma2Processor, algo que Transformers 5.18.0 de PyPI no incluye todavia segun el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de embedding | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mlx-community/embeddinggemma-2-5bit | 744.371.512 | 768 (Matryoshka 128-768) | No disponible | Affine 5 bits, group size 64 | Apache-2.0 | HuggingFace, libreria MLX |
| google/embeddinggemma-2 | No disponible en la informacion proporcionada | 768 (segun la conversion) | No disponible | BF16 / FP32 en el checkpoint original | Apache-2.0 | HuggingFace |
| Otros modelos de embeddings de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos entre esta conversion y otras alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No hay resultados MTEB ni de calidad de recuperacion publicados en la informacion disponible; las unicas metricas documentadas son de fidelidad numerica frente al checkpoint FP32.
- La cuantizacion de 5 bits introduce un error medible: el error absoluto maximo documentado llega a 0,013390 en texto y la similitud coseno minima baja hasta 0,992494 en audio.
- El autor advierte de no convertir el modelo a float16: los pesos y activaciones no cuantizados deben mantenerse en BF16.
- El preprocesado de imagen, audio y video requiere una build de Transformers que exponga EmbeddingGemma2Processor; la version 5.18.0 de PyPI no la incluye segun la model card, lo que complica el uso multimodal en entornos estandar.
- Consultas y documentos deben usar siempre la misma dimension de embedding; mezclar dimensiones truncadas y completas invalida la comparacion.
- Es necesario aplicar los prefijos de tarea correctos de config_sentence_transformers.json; omitirlos degrada la calidad de la recuperacion.
- Longitud de contexto no documentada en la informacion proporcionada, lo que impide planificar el troceado de documentos con precision.
- Sesgos conocidos: no disponibles en la informacion proporcionada; dependen del dataset de entrenamiento del modelo base, que no se documenta aqui.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que es un modelo de embeddings y no produce texto; el riesgo equivalente es la recuperacion de pasajes irrelevantes.
- Licencia Apache-2.0, que permite uso comercial manteniendo la atribucion a Google y el aviso de licencia.
- La revision de MLX-VLM necesaria (3d87e884, rama pc/embeddinggemma-2) es una revision concreta de Git, no una version estable publicada en PyPI, lo que anade riesgo de reproducibilidad en produccion.
- El modelo no soporta generacion de texto, tool calling ni razonamiento multi-paso; no debe emplearse como LLM generativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/embeddinggemma-2-5bit
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Revision concreta del modelo base usada en la conversion: https://huggingface.co/google/embeddinggemma-2/tree/914f7f89142e33e77833254d9c9b90c3cef7303b
- Repositorio MLX-VLM (revision usada): https://github.com/Blaizzy/mlx-vlm/tree/3d87e88402f307efbf68e568971aa887ee7d9ed0
- Repositorio MLX-VLM (rama pc/embeddinggemma-2): https://github.com/Blaizzy/mlx-vlm/tree/pc/embeddinggemma-2
- Fichero de validacion de la conversion: validation.json (incluido en el repositorio del modelo)
