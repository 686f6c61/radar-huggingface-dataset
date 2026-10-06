# mlx-community/embeddinggemma-2-nvfp4

## Resumen

mlx-community/embeddinggemma-2-nvfp4 es una conversion a formato MLX del modelo Google EmbeddingGemma 2, publicada por la organizacion mlx-community. Se trata de un modelo de extraccion de caracteristicas (feature-extraction) disenado para generar embeddings, no para generar texto, y conserva los codificadores de texto, imagen, audio y video del modelo original. La conversion aplica cuantizacion NVFP4 de 4 bits con grupo de 16 sobre el codificador de texto y la proyeccion de audio, mientras que las torres de vision y audio y la proyeccion de vision permanecen en BF16.

El modelo produce embeddings normalizados de 768 dimensiones y admite truncamiento Matryoshka a 128, 256, 512 o 768 dimensiones, lo que permite ajustar el coste de almacenamiento y la latencia de recuperacion segun la aplicacion. Su relevancia actual radica en que permite ejecutar un modelo de embeddings multimodal de forma local sobre Apple Silicon mediante MLX, con un peso almacenado de 1,098 GB, sin depender de GPU dedicadas ni de servicios en la nube.

La contrapartida es que, al ser una variante de bajo bit, el propio autor advierte de una deriva medible en los embeddings y recomienda comparar contra BF16 u 8 bits sobre datos de recuperacion propios cuando la fidelidad del embedding sea critica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de embeddings basado en Google EmbeddingGemma 2, con codificador de texto y torres de vision y audio mas proyecciones multimodales; detalles internos de capas no disponibles |
| Parametros totales | 744.371.512 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 de 4 bits (group size 16) en codificador de texto y proyeccion de audio; BF16 en torres de vision y audio y en proyeccion de vision |
| Idiomas soportados | Multilingue (lista concreta de idiomas no disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

Se trata de una conversion de pesos, no de un entrenamiento nuevo. El modelo parte de google/embeddinggemma-2 en la revision 914f7f89142e33e77833254d9c9b90c3cef7303b y se convierte con MLX-VLM en la revision 3d87e884 (rama pc/embeddinggemma-2) sobre MLX 0.32.3, usando dtype bfloat16 con cuantizacion nvfp4, 4 bits y group size 16. Esta es la politica estandar de MLX-VLM: cuantiza el codificador de texto y la proyeccion de audio, mientras que las torres de vision y audio y la proyeccion de vision quedan en BF16.

La salida son embeddings normalizados de 768 dimensiones, con soporte de truncamiento Matryoshka a 128, 256, 512 o 768 dimensiones. El modelo incluye todos los pesos de cada modalidad y los ficheros de configuracion del procesador. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre fases de RLHF o DPO del modelo original en la informacion proporcionada; esos detalles remiten a la model card de Google EmbeddingGemma 2. El autor indica que las lecturas no cuantizadas y las activaciones deben mantenerse en BF16 y que el modelo no debe convertirse a float16.

## Capacidades

- Generacion de embeddings de texto normalizados de 768 dimensiones.
- Extraccion de caracteristicas de imagen (image-feature-extraction).
- Extraccion de caracteristicas de audio (audio-feature-extraction).
- Extraccion de caracteristicas de video, con soporte de entrada de dos fotogramas en las pruebas sinteticas (video-feature-extraction).
- Embeddings multimodales combinados, por ejemplo texto mas imagen.
- Similitud semantica entre frases (sentence-similarity) y recuperacion de informacion.
- Soporte multilingue.
- Truncamiento Matryoshka a 128, 256, 512 o 768 dimensiones con renorma­lizacion posterior.
- Uso de prefijos de tarea (task prefixes) definidos en config_sentence_transformers.json, aplicando el mismo prefijo a consultas y documentos.
- No es un modelo generativo: no produce texto, razonamiento, codigo ni soporte de tool calling.

## Casos de uso

- Busqueda semantica local y RAG sobre Apple Silicon: al generar embeddings de 768 dimensiones con 1,098 GB de pesos en disco, permite indexar y consultar una base documental sin salir del equipo, usando truncamiento a 256 o 512 dimensiones para reducir memoria en el indice vectorial.
- Deduplicacion y agrupacion de documentos: los embeddings normalizados y la similitud coseno permiten detectar documentos casi duplicados o agrupar corpus por tematica; el truncamiento Matryoshka facilita calcular una primera pasada rapida a baja dimension y refinar despues.
- Recuperacion multimodal texto-imagen: gracias a la extraccion de caracteristicas de imagen y a los embeddings conjuntos texto-imagen, se puede construir un buscador que recupere imagenes a partir de una consulta textual.
- Indexacion y busqueda de audio: la torre de audio permite generar embeddings de clips para busqueda por similitud o clasificacion de contenido sonoro, con la salvedad de que el codificador de audio esta cuantizado a 4 bits.
- Recuperacion sobre video: con soporte de entradas de video, se pueden generar embeddings de fragmentos o fotogramas clave para busqueda dentro de archivos de video.
- Sistemas de recomendacion por similitud de contenido: los embeddings de texto e imagen de un catalogo permiten calcular vecinos mas cercanos y recomendar articulos relacionados.
- Clasificacion y enrutado de tickets de soporte: los embeddings multilingues sirven como entrada a clasificadores ligeros para asignar categoria o prioridad en varias lenguas.
- Filtrado y moderacion de contenido: comparar embeddings de un texto o imagen contra un conjunto de referencia permite detectar contenido proximo a categorias prohibidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de recuperacion (por ejemplo MTEB) en la informacion disponible. El autor indica explicitamente que las comprobaciones realizadas son pruebas numericas de humo, no un benchmark de calidad de recuperacion. Se incluye una prueba de recuperacion de texto en la que el pasaje sobre Marte se situa por encima del pasaje sobre Venus.

Comprobaciones de conversion frente al checkpoint original en PyTorch FP32:

| Entrada | Coseno minimo vs FP32 | Error absoluto maximo |
|---|---:|---:|
| audio | 0.980227 | 0.020032 |
| imagen | 0.991593 | 0.017620 |
| texto | 0.980619 | 0.023787 |
| texto_imagen | 0.987701 | 0.017078 |
| video | 0.987531 | 0.018629 |

Todas las salidas comprobadas fueron finitas, normalizadas a norma unitaria y de 768 dimensiones. Las mediciones completas, incluidas las comparaciones con vectores truncados, estan en validation.json del repositorio.

## Requisitos de hardware

- Al ser un modelo MLX, el destino principal es Apple Silicon (familia M de Apple) con memoria unificada; los detalles de compatibilidad con CPU o GPU no Apple no estan especificados en la informacion disponible.
- Peso almacenado en disco: 1,098 GB (tamano del repositorio, 1,1 GB).
- Memoria necesaria para inferencia: no disponible de forma oficial. Como referencia orientativa, el grueso de los pesos son 1,098 GB y las torres de vision y audio y las proyecciones en BF16 anaden mas peso, mas activaciones y buffers; un equipo con 16 GB de memoria unificada o superior es un punto de partida razonable, pero no es un dato confirmado por el autor.
- GPU dedicadas (A100, H100, RTX 4090): no aplica de forma nativa, ya que el modelo esta empaquetado para MLX. No se dispone de informacion sobre ejecucion en CUDA.
- Opciones de despliegue: MLX y MLX-VLM, requiriendo la revision concreta del repositorio de Blaizzy/mlx-vlm (3d87e88402f307efbf68e568971aa887ee7d9ed0), MLX 0.32.3 o superior y Transformers 5.18.0 o superior. El procesador multimodal EmbeddingGemma2Processor no esta disponible aun en la version estandar de PyPI de Transformers 5.18.0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de embedding | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mlx-community/embeddinggemma-2-nvfp4 | 744.371.512 | 768 (Matryoshka 128/256/512/768) | NVFP4 4 bits + BF16 parcial | no disponible | Apache-2.0 | MLX/MLX-VLM |
| google/embeddinggemma-2 (modelo base) | no disponible de forma aislada | 768 (segun el modelo base) | BF16 (checkpoint original) | no disponible | Apache-2.0 | PyTorch/Transformers |
| Variante de 8 bits citada por el autor | no disponible | 768 | 8 bits | no disponible | Apache-2.0 | segun implementacion de MLX-VLM |

El autor recomienda comparar esta variante de 4 bits contra BF16 o 8 bits sobre datos de recuperacion propios. No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Deriva de embeddings medible: el autor advierte explicitamente de que esta variante de bajo bit muestra una deriva cuantificable, con cosenos minimos frente a FP32 de 0.980 en audio, 0.980619 en texto, 0.987531 en video, 0.987701 en texto mas imagen y 0.991593 en imagen.
- No debe convertirse a float16: el autor indica que los pesos y activaciones no cuantizados deben mantenerse en BF16.
- El procesamiento multimodal requiere una build de Transformers que exponga EmbeddingGemma2Processor; la version estandar de PyPI 5.18.0 no lo incluye, solo la build upstream 5.18.0.dev0.
- Consultas y documentos deben usar la misma dimension de embedding; si se aplica truncamiento, hay que renormar­lizar.
- Sin resultados de benchmarks de recuperacion publicados (ni MTEB ni equivalentes); las unicas comprobaciones son pruebas numericas de humo.
- Riesgo de alucinacion: no aplica directamente porque no es un modelo generativo, pero si puede producir similitudes espurias en casos limite por la cuantizacion.
- Sesgos conocidos: no disponibles en la informacion facilitada; remiten a la model card del modelo base de Google.
- Idiomas: se declara multilingue, pero no se detalla la lista concreta de lenguas ni su cobertura relativa.
- Longitud de contexto: no documentada en la informacion disponible.
- Licencia Apache-2.0, lo que en principio permite uso comercial; la conversion preserva la licencia y la atribucion a Google.
- Repositorio sin descargas ni likes registrados en el momento de la consulta, lo que implica poca validacion por parte de la comunidad.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/mlx-community/embeddinggemma-2-nvfp4
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Revision del modelo base usada en la conversion: https://huggingface.co/google/embeddinggemma-2/tree/914f7f89142e33e77833254d9c9b90c3cef7303b
- Repositorio MLX-VLM (revision de conversion): https://github.com/Blaizzy/mlx-vlm/tree/3d87e88402f307efbf68e568971aa887ee7d9ed0
- Libreria MLX: https://github.com/ml-explore/mlx
- Transformers: https://github.com/huggingface/transformers
