# jigmam/embeddinggemma-int8

## Resumen

jigmam/embeddinggemma-int8 es una version cuantizada a int8 del modelo de embeddings EmbeddingGemma-300M, desarrollado originalmente por Google DeepMind. Se trata de una conversion de pesos publicada por el usuario jigmam en Hugging Face, orientada a reducir el espacio en disco (el repositorio ocupa 0,4 GB) y facilitar el despliegue en entornos con recursos limitados. El modelo base es un codificador de texto de 300 millones de parametros derivado de Gemma 3, con inicializacion T5Gemma, que genera representaciones vectoriales de texto para tareas de busqueda, recuperacion, clasificacion, agrupamiento y similitud semantica.

El modelo original es relevante por su enfoque "on-device": con 300M de parametros y una longitud de contexto de 2048 tokens, puede ejecutarse en telefonos moviles, portatiles y equipos de sobremesa sin GPU dedicada. Fue entrenado con datos en mas de 100 idiomas hablados y emplea Matryoshka Representation Learning (MRL), lo que permite truncar la salida de 768 dimensiones a 512, 256 o 128 y volver a normalizar manteniendo una calidad razonable. Esta variante int8 hereda esas caracteristicas y anade el formato ONNX ademas de safetensors.

La ficha de este repositorio concreto no incluye informacion propia del autor sobre el procedimiento de cuantizacion, el calibrado ni las metricas de degradacion respecto al modelo original. La model card publicada es una copia de la tarjeta de EmbeddingGemma, por lo que los datos tecnicos que se detallan a continuacion corresponden al modelo base y no necesariamente a la conversion int8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer codificador (encoder) derivado de Gemma 3, con inicializacion T5Gemma |
| Parametros totales | 300 millones (modelo base); no disponible el recuento exacto tras la cuantizacion |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | int8 (pesos); no se especifican detalles de calibrado ni granularidad |
| Idiomas soportados | Mas de 100 idiomas hablados (modelo base); la model card del repositorio no lista idiomas concretos |
| Licencia | Gemma (requiere aceptar los terminos de uso de Google) |
| Formato de pesos | safetensors y ONNX |
| Dimension de embedding | 768, truncable a 512, 256 o 128 mediante MRL |
| Tamano del repositorio | 0,4 GB |
| Libreria | sentence-transformers |
| Pipeline | sentence-similarity / feature-extraction |
| Fecha de creacion | 18 de septiembre de 2026 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo encoder con 300 millones de parametros, construido a partir de Gemma 3 con inicializacion T5Gemma, segun la documentacion de Google DeepMind. La innovacion principal es el uso de Matryoshka Representation Learning (MRL), una tecnica que entrena la representacion para que las primeras dimensiones del vector concentren la informacion mas relevante, de modo que el usuario puede truncar la salida de 768 a 512, 256 o 128 dimensiones y renormalizar sin reentrenar. Esto permite ajustar el coste de almacenamiento y de comparacion vectorial segun la aplicacion.

Los datos de entrenamiento cubren mas de 100 idiomas hablados, aunque la model card no detalla el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO (en modelos de embeddings son poco habituales frente al entrenamiento contrastivo). La documentacion menciona que el modelo comparte investigacion y tecnologia con los modelos Gemini. La tarjeta advierte ademas de que las activaciones del modelo base no soportan float16, por lo que debe usarse float32 o bfloat16; no se indica si esta limitacion se mantiene o se corrige en la conversion int8 publicada en este repositorio, ni que herramienta (por ejemplo, ONNX Runtime, optimum o similar) se empleo para cuantizar.

## Capacidades

- Generacion de representaciones vectoriales densas de texto para busqueda semantica y recuperacion de informacion.
- Similitud semantica entre consultas y documentos, con API diferenciada de codificacion para consultas (`encode_query`) y documentos (`encode_document`).
- Clasificacion de texto mediante embeddings (por ejemplo, con un clasificador lineal sobre los vectores).
- Agrupamiento (clustering) de documentos o frases por proximidad semantica.
- Deduplicacion y deteccion de near-duplicates en corpus de texto.
- Salida con dimension reducible (768, 512, 256 o 128) gracias a MRL.
- Cobertura multilingue derivada del entrenamiento en mas de 100 idiomas.
- Integracion con Text Embeddings Inference (TEI) segun las etiquetas del repositorio.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso, y no tiene capacidades de vision ni audio.

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar los fragmentos de una base de conocimiento con `encode_document` y consultar con `encode_query`, aprovechando la ventana de 2048 tokens para trocear secciones completas sin perder contexto.
- Recuperacion aumentada (RAG) en produccion: usar el modelo como recuperador en un pipeline de generacion, con embeddings de 256 o 512 dimensiones para reducir el consumo de memoria del indice vectorial.
- Deduplicacion de registros en bases de datos internas: calcular similitudes coseno entre embeddings de 768 dimensiones y marcar pares por encima de un umbral para revision manual.
- Clasificacion de tickets de soporte: entrenar un clasificador ligero sobre los embeddings congelados para enrutar incidencias por categoria, con coste de inferencia bajo al tener solo 300M de parametros.
- Moderacion o filtrado de contenido por similitud: comparar textos entrantes con un conjunto de referencia de ejemplos etiquetados y aplicar umbrales de distancia.
- Busqueda multilingue en catalogos de producto: codificar consultas en un idioma y documentos en otro dentro del mismo espacio vectorial, cubriendo los mas de 100 idiomas del entrenamiento.
- Despliegue en dispositivo (movil o portatil): ejecutar la variante int8 en CPU con ONNX Runtime para funciones de busqueda local sin conexion, dado el tamano reducido del repositorio.
- Agrupamiento exploratorio de corpus de investigacion: generar embeddings de abstracts o notas y aplicar k-means o HDBSCAN para descubrir temas latentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas con MTEB, MIRACL, BEIR ni ninguna otra metrica, ni compara la version int8 con el modelo original en cuanto a degradacion de calidad. El paper asociado (arXiv:2509.20354) contiene resultados del modelo base, pero su contenido no forma parte de la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: para el modelo base en float32, en torno a 1,2-1,5 GB de pesos mas activaciones; la conversion int8 reduce los pesos a aproximadamente 0,3-0,4 GB, coherente con el tamano del repositorio (0,4 GB).
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 e incluso GPUs integradas con suficiente memoria compartida.
- Puede ejecutarse en CPU sola, que es el escenario habitual para un modelo de 300M en formato ONNX int8.
- Apta para despliegue en moviles y portatiles segun el enfoque on-device declarado por Google.
- GPU de datacenter (A100, H100) solo tendrian sentido para indexado masivo por lotes, no por requisitos de memoria.
- Opciones de despliegue: sentence-transformers, Hugging Face Transformers con la implementacion Gemma 3, ONNX Runtime para los pesos ONNX, y Text Embeddings Inference (TEI) segun las etiquetas del repositorio. Compatible con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento de modelos alternativos, por lo que la comparacion se limita a caracteristicas estructurales ampliamente conocidas. Los valores de los competidores no han sido verificados en las fuentes de esta busqueda y deben contrastarse antes de tomar decisiones.

| Modelo | Parametros | Contexto | Dimension de salida | Licencia |
|---|---|---|---|---|
| EmbeddingGemma-300M (base de este repositorio) | 300M | 2048 tokens | 768 (MRL a 512/256/128) | Gemma |
| jigmam/embeddinggemma-int8 | 300M (base), int8 | 2048 tokens (heredado) | 768 (MRL) | Gemma |
| all-MiniLM-L6-v2 | 22M | 256 tokens | 384 | Apache 2.0 |
| multilingual-e5-small | 118M | 512 tokens | 384 | MIT |
| bge-m3 | 568M | 8192 tokens | 1024 | MIT |

No se dispone de comparaciones de rendimiento (MTEB u otras) entre estas opciones dentro de la informacion consultada.

## Limitaciones y advertencias

- La model card publicada en el repositorio es una copia de la tarjeta de EmbeddingGemma; no documenta el proceso de cuantizacion, el conjunto de calibrado ni la perdida de precision esperada frente al modelo en float32 o bfloat16.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia publica de validacion por parte de la comunidad.
- La licencia Gemma exige aceptar los terminos de uso de Google y puede imponer restricciones adicionales al uso comercial; conviene revisarlos antes de integrar el modelo en produccion.
- El acceso al modelo original esta sujeto a un formulario de aceptacion de licencia en Hugging Face.
- Las activaciones del modelo base no soportan float16; si la conversion int8 mantiene esa restriccion, ejecutar en float16 puede dar resultados incorrectos. No se especifica en la informacion disponible.
- Longitud de contexto limitada a 2048 tokens: los documentos mas largos deben trocearse, lo que puede fragmentar el significado en textos con dependencias largas.
- Riesgo de sesgos heredado de los datos de entrenamiento de Gemma 3, no cuantificado en la informacion disponible.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de similitudes espurias cuando los textos comparten vocabulario sin compartir significado.
- La reduccion de dimension mediante MRL implica una perdida de calidad no especificada numericamente para cada tamano de truncado.
- No se detallan los idiomas concretos soportados ni su cobertura relativa; "mas de 100 idiomas" es una afirmacion del modelo base sin desglose.
- No se indican requisitos de version de sentence-transformers, transformers ni ONNX Runtime para cargar esta conversion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jigmam/embeddinggemma-int8
- Pagina del modelo original: https://huggingface.co/google/embeddinggemma-300m
- Pagina oficial de EmbeddingGemma: https://ai.google.dev/gemma/docs/embeddinggemma
- Paper: https://arxiv.org/abs/2509.20354
- EmbeddingGemma en Kaggle: https://www.kaggle.com/models/google/embeddinggemma/
- EmbeddingGemma en Vertex Model Garden: https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/embeddinggemma
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Responsible Generative AI Toolkit: https://ai.google.dev/responsible
- Documentacion de Sentence Transformers: https://www.SBERT.net
- Documentacion de Gemma 3 en Transformers: https://huggingface.co/docs/transformers/main/en/model_doc/gemma3
- Documentacion de Hugging Face Transformers: https://huggingface.co/docs/transformers/en/index

Nota: la busqueda web realizada no devolvio resultados relacionados con el modelo. Todos los enlaces encontrados correspondian a dominios de calzado ortopedico (thanner-gmbh.com y thannershop.com) y no guardan relacion con esta ficha, por lo que se han descartado.
