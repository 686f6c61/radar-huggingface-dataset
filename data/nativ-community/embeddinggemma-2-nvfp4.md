# nativ-community/embeddinggemma-2-nvfp4

## Resumen

`nativ-community/embeddinggemma-2-nvfp4` es una conversión al formato MLX del modelo de embeddings multimodales Google EmbeddingGemma 2, cuantizada en NVFP4 (4 bits, tamaño de grupo 16). La publica el usuario `nativ-community` y conserva los codificadores de texto, imagen, audio y vídeo del modelo original, generando embeddings normalizados de 768 dimensiones. Su propósito es la extracción de características y la similitud semántica (pipeline `feature-extraction`), no la generación de texto.

El modelo base, `google/embeddinggemma-2`, es un modelo de embeddings multilingües de Google con licencia Apache-2.0. Esta variante pesa 744.371.512 parámetros en total y almacena 1,098 GB de pesos (el repositorio ocupa 1,1 GB). Emplea la política estándar de MLX-VLM: cuantiza el codificador de texto y la proyección de audio a NVFP4, mientras que las torres de visión y audio y la proyección de visión permanecen en BF16.

Es relevante porque permite ejecutar un modelo de embeddings multimodal de casi 744 M de parámetros en hardware Apple Silicon con un coste de memoria muy bajo, manteniendo la licencia permisiva Apache-2.0. La contrapartida es que la cuantización a 4 bits introduce una deriva medible en los embeddings respecto a FP32 (coseno mínimo de 0,98 en las comprobaciones del autor), por lo que su uso en producción con requisitos altos de fidelidad exige una validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | embedding_gemma2 (modelo de embeddings con torres de texto, vision, audio y video) |
| Parametros totales | 744.371.512 (~744 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4, 4 bits, group size 16 (text encoder y audio projection); towers de vision/audio y vision projection en BF16. No convertir a float16 |
| Idiomas soportados | multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |
| Dimension de embedding | 768 (con truncado Matryoshka a 128, 256, 512 o 768) |
| Tamano del repositorio | 1,1 GB (1,098 GB de pesos en decimal) |
| Libreria | mlx / mlx-vlm |
| Modelo base | google/embeddinggemma-2 (revision 914f7f89142e33e77833254d9c9b90c3cef7303b) |
| Revision de conversion | MLX-VLM 3d87e884, MLX 0.32.3 |

## Arquitectura y entrenamiento

Se trata de un modelo de embeddings basado en la familia `embedding_gemma2` de Google, con arquitectura de codificador tipo transformer y torres especificas para cada modalidad: texto, vision, audio y video. El texto se procesa mediante un tokenizador propio y los embeddings resultantes se normalizan a vectores de 768 dimensiones; las comprobaciones del autor confirman salidas finitas, unit-normalizadas y de 768 dimensiones en todas las modalidades. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica de esta ficha es la cuantizacion: MLX-VLM aplica NVFP4 (4 bits, grupo de 16) al codificador de texto y a la proyeccion de audio, mientras que las torres de vision y audio y la proyeccion de vision se mantienen en BF16 para preservar calidad. La conversion se reproduce con el comando `mlx_vlm convert --hf-path google/embeddinggemma-2 --revision 914f7f89142e33e77833254d9c9b90c3cef7303b --dtype bfloat16 -q --q-mode nvfp4 --q-bits 4 --q-group-size 16`. El modelo admite truncado Matryoshka a 128, 256, 512 o 768 dimensiones, con la condicion de que consultas y documentos usen la misma dimension. Los detalles de entrenamiento, evaluacion y limitaciones remiten a la model card original de Google.

## Capacidades

- Generacion de embeddings de texto normalizados de 768 dimensiones para similitud semantica y busqueda.
- Comparacion de similitud mediante producto escalar o distancia coseno entre embeddings de consulta y documento.
- Extraccion de caracteristicas de imagen (image-feature-extraction).
- Extraccion de caracteristicas de audio (audio-feature-extraction).
- Extraccion de caracteristicas de video (video-feature-extraction).
- Embeddings multimodales combinados, incluyendo entradas de texto e imagen simultaneas (text_image).
- Soporte multilingue de texto.
- Truncado Matryoshka a 128, 256, 512 o 768 dimensiones para equilibrar coste y calidad.
- Uso de prefijos de tarea definidos en `config_sentence_transformers.json` (por ejemplo `task: search result | query:` y `title: none | text:`).
- No es un modelo generativo: no produce texto, no hace razonamiento, no soporta tool calling ni agentes.

## Casos de uso

- Busqueda semantica y RAG: el modelo indexa documentos y consultas como vectores de 768 dimensiones y permite recuperar pasajes relevantes por similitud coseno. Es adecuado cuando se necesita ejecutar la recuperacion en local sobre Apple Silicon sin depender de una API externa, aplicando los prefijos de tarea correspondientes.
- Deduplicacion y deteccion de near-duplicates: generar embeddings de un corpus y agrupar por umbral de distancia permite eliminar documentos o registros casi identicos. La dimension reducible (128-512) abarata el almacenamiento vectorial en colecciones grandes.
- Clasificacion y clustering de texto sin etiquetas: los embeddings sirven como entrada para clasificadores ligeros o algoritmos de agrupamiento (k-means, HDBSCAN) en tareas de organizacion de tickets, resenas o articulos.
- Busqueda multimodal texto-imagen: al conservar la torre de vision, permite recuperar imagenes a partir de consultas textuales en un mismo espacio de embedding, util en catalogos de producto o bibliotecas de activos.
- Recuperacion sobre audio y video: la extraccion de caracteristicas de audio y video permite indexar fragmentos de audio o fotogramas de video y buscarlos por similitud con otros elementos del mismo espacio, por ejemplo en archivado de medios.
- Sistemas de recomendacion por contenido: comparar el embedding de un item con el de los que ha consumido un usuario permite generar recomendaciones basadas en contenido sin entrenar un modelo especifico.
- Filtrado y analisis en local con privacidad: al ejecutarse con MLX en un Mac y pesar poco mas de 1 GB, es viable procesar datos sensibles sin enviarlos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay datos de MTEB ni de evaluacion de calidad de recuperacion). El autor aporta comprobaciones numericas de conversion frente al checkpoint original en PyTorch FP32 (coseno minimo y error absoluto maximo), que son pruebas de humo, no un benchmark de calidad:

| Entrada | Coseno minimo vs FP32 | Error absoluto maximo |
|---|---:|---:|
| audio | 0,980227 | 0,020032 |
| image | 0,991593 | 0,017620 |
| text | 0,980619 | 0,023787 |
| text_image | 0,987701 | 0,017078 |
| video | 0,987531 | 0,018629 |

En la prueba de humo de recuperacion de texto, el modelo clasifico el pasaje sobre Marte por encima del de Venus. El autor advierte que esta variante de bajo bit muestra una deriva medible en los embeddings y recomienda compararla contra BF16 o 8 bits sobre datos de recuperacion propios cuando la fidelidad sea critica.

## Requisitos de hardware

- Peso de los pesos: 1,098 GB (decimal); repositorio de 1,1 GB. La memoria total necesaria anade el coste de activaciones y del procesador multimodal.
- Hardware objetivo: Apple Silicon mediante MLX (familias M1, M2, M3, M4). No es compatible de forma nativa con CUDA ni ROCm, ya que el formato y la libreria son MLX.
- Cabe en GPU de consumo: si, en Macs con memoria unificada de 8 GB o mas; el peso del modelo es de aproximadamente 1 GiB.
- GPUs recomendadas: no se aplican GPU de datacenter tipo A100, H100 o RTX 4090 para este formato; el despliegue esta orientado a chips Apple con soporte MLX.
- Opciones de despliegue: MLX-VLM en la revision `3d87e884` (rama `pc/embeddinggemma-2`), con `mlx>=0.32.3` y `transformers>=5.18.0`. Para texto basta `AutoTokenizer`; el preprocesado de imagen, audio y video requiere una build de Transformers que exponga `EmbeddingGemma2Processor` (la version de PyPI 5.18.0 no lo expone todavia).
- Restriccion de precision: mantener pesos y activaciones no cuantizados en BF16; no convertir el modelo a float16.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Los datos del modelo base proceden de la informacion proporcionada; los de las alternativas provienen de sus model cards publicas y no forman parte de la busqueda realizada.

| Modelo | Parametros | Dimension de embedding | Modalidades | Licencia |
|---|---|---:|---|---|
| nativ-community/embeddinggemma-2-nvfp4 | ~744 M (NVFP4) | 768 (Matryoshka 128-768) | texto, imagen, audio, video | apache-2.0 |
| google/embeddinggemma-2 (base, BF16) | ~744 M | 768 | texto, imagen, audio, video | apache-2.0 |
| BAAI/bge-m3 | ~568 M | 1024 | texto | MIT |
| intfloat/multilingual-e5-large | ~560 M | 1024 | texto | MIT |

La diferencia principal frente al base es la cuantizacion a 4 bits, que reduce el peso a aproximadamente 1 GB a cambio de una deriva medible en los embeddings. Frente a alternativas como BGE-M3 o multilingual-e5-large, esta variante aporta soporte multimodal (imagen, audio y video) y ejecucion en MLX, mientras que aquellas son exclusivamente de texto y se distribuyen en formatos orientados a PyTorch. No se dispone de datos comparativos de rendimiento entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- Deriva por cuantizacion: el autor reconoce explicitamente una deriva medible en los embeddings a 4 bits; para aplicaciones sensibles a la fidelidad recomienda comparar contra BF16 o 8 bits sobre datos propios.
- No es un modelo generativo: no produce texto ni razonamiento; no admite tool calling, function calling ni flujos de agentes.
- Riesgo de alucinacion: no aplica a la generacion, pero si puede haber recuperaciones incorrectas si los embeddings degradan la separacion semantica.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; se heredan los del modelo base de Google.
- Contexto e idioma: la longitud de contexto no esta disponible; el soporte es multilingue pero sin listado de idiomas ni garantias por idioma.
- Uso comercial: la licencia apache-2.0 lo permite, siempre que se preserve la atribucion a Google, tal como indica el autor de la conversion.
- Dependencias fragiles: el preprocesado multimodal exige una build de Transformers que exponga `EmbeddingGemma2Processor`, no presente en la version estandar de PyPI 5.18.0, lo que complica su despliegue en entornos no controlados.
- Restriccion de precision: no convertir a float16; hacerlo puede degradar aun mas la calidad de los embeddings.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide su comportamiento en produccion.
- Las comprobaciones publicadas son pruebas numericas de humo, no evaluaciones de calidad de recuperacion (no hay MTEB ni metricas de retrieval).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nativ-community/embeddinggemma-2-nvfp4
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Revision del modelo base: https://huggingface.co/google/embeddinggemma-2/tree/914f7f89142e33e77833254d9c9b90c3cef7303b
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Revision de MLX-VLM usada en la conversion: https://github.com/Blaizzy/mlx-vlm/tree/3d87e88402f307efbf68e568971aa887ee7d9ed0
- Los resultados de la busqueda web realizada no contienen enlaces relevantes a este modelo.
