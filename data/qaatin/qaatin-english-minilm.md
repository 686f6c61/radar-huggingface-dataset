# qaatin/qaatin-english-minilm

## Resumen

qaatin-english-minilm es una conversion a ONNX Runtime del modelo de embeddings de frases sentence-transformers/all-MiniLM-L6-v2, publicada por el usuario qaatin. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: los pesos son los mismos del modelo original de sentence-transformers, reorganizados para su uso con ONNX Runtime dentro del proyecto Qaatin (herramienta de codigo abierto alojada en GitHub).

La modificacion principal respecto al original es que la tabla de embeddings de palabras se almacena por separado en un fichero `embeddings.npy`, de modo que puede leerse de disco bajo demanda en lugar de ir empaquetada dentro del grafo. El fichero `model.onnx` acepta `inputs_embeds` (filas de esa tabla) y `attention_mask`, y devuelve un vector por cada word piece; el vector de frase se obtiene como la media de esos vectores.

El interes practico es limitado pero concreto: permite ejecutar el conocido MiniLM-L6-v2 (arquitectura transformer encoder de 6 capas, 384 dimensiones de embedding) en entornos donde ONNX Runtime es preferible a PyTorch, con una huella de repositorio de 0,1 GB. El modelo original esta pensado para similitud semantica y recuperacion de informacion en ingles; esta version hereda esas capacidades sin cambios en los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM, 6 capas), exportado a ONNX |
| Parametros totales | no disponible (el modelo base all-MiniLM-L6-v2 tiene aproximadamente 22,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base admite hasta 256 tokens) |
| Tipos de cuantizacion | no disponible (tag `base_model:quantized` presente, sin detalle del esquema) |
| Idiomas soportados | no disponible (el modelo base esta orientado al ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`) mas tabla de embeddings en NumPy (`embeddings.npy`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo sentence-transformers/all-MiniLM-L6-v2: un transformer encoder MiniLM de 6 capas con embeddings de 384 dimensiones, entrenado originalmente por sentence-transformers para generar representaciones de frases mediante similitud coseno. Esta publicacion no entrena ni afina el modelo; se limita a exportarlo a ONNX Runtime y a separar la tabla de embeddings de palabras en un fichero NumPy externo.

El grafo ONNX expone dos entradas: `inputs_embeds`, que recibe las filas de la tabla correspondientes a los tokens de entrada, y `attention_mask`. La salida es un vector por word piece y el pooling se realiza fuera del grafo, calculando la media de esos vectores para obtener el embedding de frase. No se dispone de informacion sobre datos de entrenamiento, tokens vistos ni procesos de RLHF o DPO en la informacion proporcionada, ya que corresponden al modelo base y no se detallan aqui. El artefacto se genero con el script `tools/build_models.py` del proyecto Qaatin.

## Capacidades

- Generacion de embeddings de frases en ingles para tareas de similitud semantica y recuperacion, heredadas del modelo base.
- Busqueda semantica y ranking de pasajes mediante similitud coseno entre vectores de 384 dimensiones.
- Clustering y deduplicacion de textos a partir de sus representaciones vectoriales.
- Inferencia con ONNX Runtime, lo que permite despliegue sin dependencia de PyTorch.
- Carga diferida de la tabla de embeddings desde disco (`embeddings.npy`), util para reducir el uso de memoria en el arranque.
- No dispone de generacion de texto, tool calling, capacidades de agente, vision ni audio: es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar fragmentos de manuales en ingles y recuperar los mas relevantes ante una consulta en lenguaje natural, usando los embeddings de 384 dimensiones y similitud coseno.
- Deduplicacion de registros en pipelines de datos: calcular el embedding de cada texto y agrupar los que superen un umbral de similitud para eliminar duplicados antes de ingestarlos en un almacen.
- Clasificacion de tickets de soporte por similitud: comparar el embedding de un ticket entrante con embeddings de referencia de categorias conocidas y asignar la mas proxima.
- Despliegue en entornos con ONNX Runtime: integrar el modelo en servicios escritos en C++, C# o Java donde no se quiere arrastrar el stack de PyTorch, aprovechando el grafo ONNX y la tabla de embeddings externa.
- Sistemas de recomendacion de contenido textual: representar articulos o productos y calcular vecinos mas cercanos para sugerir items relacionados.
- Filtrado previo en pipelines RAG: usar MiniLM como recuperador ligero de primera fase para reducir el conjunto de candidatos antes de un reordenador mas costoso.
- Moderacion o agrupacion de comentarios: clusterizar mensajes por tematica a partir de sus embeddings para revision manual posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo base ronda los 23 M de parametros, por lo que en fp32 ocupa del orden de 90 MB y en cuantizaciones de 8 bits alrededor de 25-30 MB (estimacion a partir del tamano del modelo base, no confirmada en la informacion proporcionada).
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 o H100. En la practica, la CPU suele ser suficiente para cargas moderadas.
- Cabe en cualquier GPU de consumo actual e incluso en dispositivos de borde con ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (obligatorio para este artefacto); tambien es posible usar el modelo base original con sentence-transformers, vLLM no aplica a modelos de embeddings de este tipo, y llama.cpp u Ollama no soportan directamente este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de embedding | Licencia | Formato |
|---|---|---|---|---|---|
| qaatin-english-minilm | no disponible (base ~22,7 M) | no disponible (base 256 tokens) | 384 | Apache 2.0 | ONNX + NumPy |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | 256 tokens | 384 | Apache 2.0 | safetensors / PyTorch |
| sentence-transformers/all-MiniLM-L12-v2 | ~33,4 M | 256 tokens | 384 | Apache 2.0 | safetensors / PyTorch |
| BAAI/bge-small-en-v1.5 | ~33 M | 512 tokens | 384 | MIT | safetensors / PyTorch |

Los datos de los modelos alternativos corresponden a sus especificaciones publicas conocidas; no se dispone de comparaciones de rendimiento en la informacion proporcionada.

## Limitaciones y advertencias

- Es un artefacto de conversion, no un modelo nuevo: cualquier limitacion del modelo base (sesgos del corpus de entrenamiento, calidad en dominios especializados) se hereda sin cambios.
- Orientado al ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- No genera texto ni razona: solo produce embeddings; no debe evaluarse como modelo generativo.
- El tag `base_model:quantized` sugiere algun tipo de cuantizacion, pero no se especifica el esquema ni el impacto en la precision de los embeddings; conviene validar la calidad en la tarea concreta antes de produccion.
- La separacion de la tabla de embeddings en `embeddings.npy` exige que el codigo cliente gestione la carga y el mapeo de tokens a filas; no es un ONNX autocontenido y no funcionara con herramientas que esperen un grafo ONNX estandar con entradas de token IDs.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Licencia Apache 2.0, compatible con uso comercial, pero se recomienda conservar el aviso de licencia y la atribucion al modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qaatin/qaatin-english-minilm
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Proyecto Qaatin: https://github.com/ShaunDier/qaatin
