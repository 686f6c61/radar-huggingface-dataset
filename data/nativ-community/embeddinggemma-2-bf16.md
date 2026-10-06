# nativ-community/embeddinggemma-2-bf16

## Resumen

nativ-community/embeddinggemma-2-bf16 es una conversion a formato MLX, en precision BF16, del modelo de embeddings multimodal google/embeddinggemma-2. Lo publica la organizacion nativ-community y su funcion es producir embeddings normalizados de 768 dimensiones a partir de entradas de texto, imagen, audio y video, ademas de combinaciones como texto mas imagen. No es un modelo generativo: es un modelo de representacion (feature-extraction) pensado para busqueda semantica, recuperacion de informacion, similitud de frases y clasificacion por similitud.

Su relevancia actual radica en que traslada un modelo de embeddings multimodal de Google al ecosistema MLX, lo que permite ejecutarlo de forma nativa en hardware Apple Silicon con la libreria mlx-vlm. Mantiene los cuatro codificadores de modalidad del modelo original y ofrece truncamiento Matryoshka a 128, 256, 512 o 768 dimensiones, lo que permite reducir el coste de almacenamiento y de comparacion vectorial sin reentrenar. El repositorio ocupa 1,5 GB (1,489 GB de pesos en decimal) y declara 744.371.512 parametros reales segun los safetensors.

El modelo se distribuye bajo licencia Apache-2.0, conserva la atribucion a Google y esta etiquetado como multilingue. La conversion se realizo con MLX 0.32.3 y una revision de MLX-VLM que incluye soporte para EmbeddingGemma 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de embeddings multimodal (base Google EmbeddingGemma 2); conserva codificadores de texto, imagen, audio y video |
| Parametros totales | 744.371.512 (744,37 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en este repositorio; los pesos se distribuyen en BF16 (el autor advierte de no convertir el modelo a float16) |
| Idiomas soportados | multilingue (sin desglose de idiomas en la informacion disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en BF16, formato MLX (libreria mlx) |
| Dimension de los embeddings | 768 (normalizados); truncamiento Matryoshka a 128, 256 o 512 |
| Tamano del repositorio | 1,5 GB (1,489 GB de pesos) |
| Revision de origen | google/embeddinggemma-2 en la revision 914f7f89142e33e77833254d9c9b90c3cef7303b |

## Arquitectura y entrenamiento

La ficha no documenta el entrenamiento del modelo original: no se indican numero de tokens, composicion del dataset ni si hubo fases de RLHF o DPO. Se trata de una conversion, no de un entrenamiento nuevo, por lo que la informacion de entrenamiento debe consultarse en la model card de google/embeddinggemma-2. La arquitectura es la de EmbeddingGemma 2, con codificadores separados por modalidad (texto, imagen, audio y video) que el autor declara conservar integramente en la conversion, junto con los ficheros de configuracion del procesador.

Tecnicamente, el modelo genera embeddings normalizados de 768 dimensiones y aplica una estrategia Matryoshka que permite truncar a 128, 256 o 512 dimensiones y renormalizar despues, reduciendo el coste de indexacion. La conversion se realizo con mlx-vlm en la revision 3d87e884 (rama pc/embeddinggemma-2) y MLX 0.32.3, dando como resultado pesos BF16. El autor solo publica comprobaciones numericas de fidelidad frente al checkpoint original en PyTorch FP32, no evaluaciones de recuperacion:

| Entrada | Similitud coseno minima frente a FP32 | Error absoluto maximo |
|---|---:|---:|
| audio | 0,999947 | 0,001258 |
| image | 0,999954 | 0,001135 |
| text | 0,999937 | 0,001468 |
| text_image | 0,999905 | 0,001864 |
| video | 0,999900 | 0,001688 |

El autor indica que la conversion BF16 y su recarga fueron identicas bit a bit respecto al checkpoint MLX BF16 original en todas las entradas comprobadas.

## Capacidades

- Generacion de embeddings de texto normalizados de 768 dimensiones para busqueda semantica y similitud de frases.
- Extraccion de caracteristicas de imagen (image-feature-extraction) con el mismo espacio de representacion.
- Extraccion de caracteristicas de audio y de video (en las pruebas se uso un video sintetico de dos fotogramas), ademas de combinaciones texto mas imagen.
- Truncamiento Matryoshka a 128, 256, 512 o 768 dimensiones con renormalizacion posterior.
- Soporte multilingue declarado, con seis entradas de texto multilingue usadas en las comprobaciones de conversion.
- Uso con prefijos de tarea definidos en config_sentence_transformers.json (por ejemplo, "task: search result | query:" para consultas).
- Compatibilidad con sentence-similarity y recuperacion documento-consulta mediante producto escalar de embeddings.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling ni comportamiento agentico, ya que no es un modelo generativo.

## Casos de uso

- Busqueda semantica multilingue: el modelo indexa documentos y consultas en un espacio vectorial comun, de modo que una consulta en un idioma puede recuperar pasajes relevantes en otro sin traduccion intermedia.
- Motor de recuperacion aumentada (RAG): generar embeddings de fragmentos de documentacion y de la pregunta del usuario para alimentar una base vectorial y devolver contexto a un LLM generativo.
- Deduplicacion y agrupacion de contenido: al producir embeddings normalizados y comparables por producto escalar, permite detectar noticias o tickets casi identicos y agruparlos por similitud.
- Busqueda multimodal en archivos de imagen: indexar imagenes por su embedding y recuperarlas mediante consultas en lenguaje natural, usando el codificador de imagen del modelo.
- Recuperacion en bibliotecas de audio y video: generar embeddings de audio y de fotogramas de video para localizar fragmentos por descripcion textual o por similitud entre clips.
- Filtrado y clasificacion de contenido en pipelines de datos: usar los embeddings truncados a 128 o 256 dimensiones para clasificadores ligeros que necesitan bajo coste de almacenamiento.
- Recomendacion por similitud: representar items y usuarios en el mismo espacio y ordenar candidatos por cercania coseno.
- Ejecucion local en Mac para prototipado: al estar en formato MLX, permite levantar un servicio de embeddings en un portatil Apple Silicon sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que las comprobaciones incluidas (texto multilingue y entradas sinteticas de imagen, audio, video de dos fotogramas y texto mas imagen) son pruebas de humo numericas y no un benchmark MTEB ni una evaluacion de calidad de recuperacion. La unica prueba funcional descrita es un smoke test de recuperacion de texto en el que el pasaje sobre Marte quedo mejor clasificado que el pasaje sobre Venus.

## Requisitos de hardware

- VRAM o memoria unificada estimada para inferencia en BF16: alrededor de 1,5 GB solo para pesos; con activaciones y procesadores multimodales, un margen practico de 2 a 3 GB.
- Al ser un modelo MLX, el destino principal es Apple Silicon (familia M1 en adelante); cabe en equipos con 8 GB de memoria unificada.
- En GPU NVIDIA el repositorio no es directamente ejecutable: haria falta reconvertir los pesos a otro formato, algo que el autor no documenta.
- GPU recomendadas: no disponibles para este formato; el modelo esta pensado para ejecucion en CPU y GPU integrada de Apple, no para A100 o H100 en su distribucion actual.
- Si cabe en GPU de consumo: si, en el sentido de que 744 M de parametros en BF16 ocupan poco mas de 1,5 GB, pero solo mediante el stack MLX en Apple Silicon o tras una conversion no oficial a formatos como GGUF.
- Opciones de despliegue: mlx-vlm (revision 3d87e884 o superior) con mlx>=0.32.3 y transformers>=5.18.0. Para el procesador multimodal se requiere una build de Transformers que exponga EmbeddingGemma2Processor; segun el autor, la version estandar de PyPI 5.18.0 todavia no lo expone. El ejemplo solo texto funciona con AutoTokenizer.
- Latencia y throughput estimados: no disponibles. El rendimiento dependera del lote, de la modalidad y del chip Apple utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de embedding | Contexto | Licencia | Formato |
|---|---:|---:|---|---|---|
| nativ-community/embeddinggemma-2-bf16 | 744,37 M | 768 (Matryoshka 128/256/512) | no disponible | Apache-2.0 | safetensors BF16 (MLX) |
| google/embeddinggemma-2 (modelo base) | 744,37 M (misma arquitectura) | 768 | no disponible | Apache-2.0 | safetensors (PyTorch) |
| Otras alternativas de embeddings multilingues (por ejemplo, BGE-M3 o multilingual-e5) | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion verificable con los datos proporcionados es contra el modelo base: mismo numero de parametros, misma dimension de salida y misma licencia, con la diferencia de que esta version esta convertida a BF16 y empaquetada para MLX. Para el resto de alternativas no se dispone de especificaciones contrastadas en la informacion facilitada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni razonamiento; solo representaciones vectoriales.
- Riesgo de alucinacion no aplica en el sentido habitual, pero si existe riesgo de recuperaciones irrelevantes o erroneas cuando el corpus o los prefijos de tarea no se aplican correctamente.
- Los prefijos de tarea deben tomarse de config_sentence_transformers.json; usar prefijos distintos entre consulta y documento degrada la similitud.
- Consulta y documento deben usar la misma dimension de embedding; mezclar dimensiones truncadas y completas invalida las comparaciones.
- El autor advierte de no convertir el modelo a float16 y de mantener pesos y activaciones no cuantizados en BF16.
- El procesador multimodal requiere una build de Transformers que exponga EmbeddingGemma2Processor; con la version estandar de PyPI 5.18.0 el ejemplo de imagen, audio o video no funcionara.
- No se documenta la longitud de contexto soportada ni el desglose de idiomas, por lo que no puede garantizarse un comportamiento homogeneo en todos los idiomas cubiertos por la etiqueta "multilingual".
- No hay evaluacion de calidad de recuperacion publicada; las unicas metricas son de fidelidad numerica de la conversion.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar la atribucion a Google y revisar las condiciones del modelo base.
- El modelo base puede incorporar sesgos presentes en sus datos de entrenamiento; no se detallan en la informacion disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-10-06: no hay evidencia de uso en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nativ-community/embeddinggemma-2-bf16
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Revision de origen del modelo base: https://huggingface.co/google/embeddinggemma-2/tree/914f7f89142e33e77833254d9c9b90c3cef7303b
- Implementacion MLX-VLM usada en la conversion: https://github.com/Blaizzy/mlx-vlm/tree/3d87e88402f307efbf68e568971aa887ee7d9ed0
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a servicios y marcas sin relacion (aprendizaje de idiomas, agencias de viaje, nutricion y ropa).
