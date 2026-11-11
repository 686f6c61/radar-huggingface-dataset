# Rigel97/snowflake-arctic-embed-l-v2.0-ko-onnx

## Resumen

`snowflake-arctic-embed-l-v2.0-ko-onnx` es una conversion a ONNX (FP32) del modelo de embeddings `dragonkue/snowflake-arctic-embed-l-v2.0-ko`, publicado por el usuario Rigel97. Se trata de un modelo de recuperacion de informacion (retrieval) especializado en coreano, derivado a su vez del `Snowflake/snowflake-arctic-embed-l-v2.0` de Snowflake, que emplea una arquitectura XLM-RoBERTa de tipo encoder. El objetivo de esta version es permitir la ejecucion en el backend CPU de Text Embeddings Inference (TEI) mediante ONNX Runtime, sin necesidad de GPU.

El modelo base parte de la familia Arctic Embed v2 de Snowflake, disenada para tareas de busqueda semantica y RAG (Retrieval-Augmented Generation). La variante `-ko` ha sido adaptada al coreano por el autor `dragonkue`, y esta version ONNX mantiene los pesos originales: el autor declara una similitud coseno de embeddings superior a 0.999 respecto al modelo de referencia.

Es relevante porque cubre un hueco practico: desplegar embeddings multilingues/coreanos en infraestructura CPU-only o en entornos donde ONNX Runtime es preferible a PyTorch. El repositorio ocupa 2,3 GB y se distribuye bajo licencia Apache 2.0. No se dispone de informacion detallada sobre el numero exacto de parametros ni la longitud de contexto en la documentacion proporcionada, aunque por la arquitectura XLM-RoBERTa-large se infiere un tamano del orden de cientos de millones de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (unica version publicada en este repo) |
| Idiomas soportados | Coreano (etiqueta `korean`); multilingue heredado del base no confirmado |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (FP32) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer basado en XLM-RoBERTa, la arquitectura sobre la que se construye Snowflake Arctic Embed v2. Se utiliza para generar embeddings de frases y documentos orientados a similitud semantica y recuperacion. Esta version concreta no reentrena el modelo: es una exportacion a ONNX FP32 del checkpoint `dragonkue/snowflake-arctic-embed-l-v2.0-ko`, cuyo entrenamiento y datos originales se documentan en la model card del modelo base (no incluidos en la informacion disponible).

La innovacion tecnica de esta publicacion es la conversion a ONNX para su uso con ONNX Runtime en el backend CPU de Text Embeddings Inference. El autor verifica que los embeddings generados mantienen una similitud coseno superior a 0.999 respecto al original, lo que indica que la cuantizacion y exportacion no degradan de forma apreciable la representacion. El modelo distingue entre consultas y documentos: las consultas se codifican con el prompt `query` (`prompt_name: "query"`) y los documentos sin prompt, siguiendo el esquema asimetrico habitual en recuperacion.

## Capacidades

- Generacion de embeddings de texto para busqueda semantica y recuperacion de informacion.
- Codificacion asimetrica consulta/documento mediante el prompt `query`.
- Extraccion de caracteristicas (`feature-extraction`) compatible con la libreria `sentence-transformers`.
- Ejecucion en CPU mediante ONNX Runtime a traves del backend de Text Embeddings Inference (TEI).
- Especializacion en coreano para tareas de retrieval.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se documentan capacidades de generacion de texto, tool calling, agentes, vision ni audio; es un modelo puramente de embeddings.

## Casos de uso

- Busqueda semantica en coreano: indexar un corpus de documentos coreanos y recuperar los fragmentos mas relevantes para una consulta, usando el prompt `query` para las preguntas y la codificacion sin prompt para los documentos.
- RAG sobre documentacion coreana: generar embeddings de fragmentos de conocimiento para alimentar un pipeline de recuperacion que sirva contexto a un LLM generativo en aplicaciones de preguntas y respuestas.
- Despliegue en infraestructura CPU-only: al estar exportado a ONNX y pensado para el backend CPU de TEI, permite servir embeddings sin GPU en entornos con restricciones de hardware.
- Deduplicacion y agrupamiento de documentos: calcular similitudes entre textos coreanos para detectar duplicados o agrupar contenido tematicamente.
- Moderacion y clasificacion por similitud: comparar mensajes de usuarios contra un conjunto de referencia de textos etiquetados para tareas de filtrado o enrutamiento.
- Sistemas de recomendacion basados en contenido: representar articulos o productos en coreano y recomendar elementos con embeddings proximos.
- Migracion desde PyTorch a ONNX: sustituir un despliegue existente de sentence-transformers por ONNX Runtime manteniendo la calidad de embeddings (similitud coseno > 0.999 declarada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento aportado por el autor es la similitud coseno superior a 0.999 entre los embeddings de esta version ONNX y los del modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU si se ejecuta con ONNX Runtime en CPU; en GPU, el modelo FP32 de 2,3 GB de repositorio requiere en torno a 3-4 GB de memoria (estimacion orientativa, no confirmada en la documentacion).
- GPU recomendadas: no especificadas; al ser un encoder de embeddings, cualquier GPU consumer moderna (RTX 3060 en adelante) es suficiente para inferencia en FP32.
- Compatibilidad con GPU consumer: si, en principio cabe en GPUs consumer con al menos 4 GB de memoria, aunque el caso de uso principal es CPU.
- Opciones de despliegue: Text Embeddings Inference (TEI) con backend CPU y ONNX Runtime; tambien puede cargarse con `sentence-transformers` u ONNX Runtime directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Rigel97/snowflake-arctic-embed-l-v2.0-ko-onnx (este) | XLM-RoBERTa / ONNX | Coreano | ONNX FP32 | Apache 2.0 | Version ONNX para TEI CPU |
| dragonkue/snowflake-arctic-embed-l-v2.0-ko | XLM-RoBERTa | Coreano | PyTorch (safetensors) | Apache 2.0 | Modelo base, requiere PyTorch |
| Snowflake/snowflake-arctic-embed-l-v2.0 | XLM-RoBERTa | Multilingue | safetensors / GGUF | Apache 2.0 | Modelo original de Snowflake, sin especializacion coreana |

## Limitaciones y advertencias

- Es un modelo de embeddings, no un modelo generativo: no produce texto ni soporta razonamiento, tool calling o agentes.
- La especializacion declarada es el coreano; el rendimiento en otros idiomas no esta documentado en esta ficha.
- Solo se publica la version FP32 en ONNX; no hay variantes cuantizadas (INT8, FP16) en este repositorio.
- La longitud maxima de contexto no se especifica en la informacion disponible; conviene verificar la model card del modelo base antes de indexar documentos largos.
- Requiere usar el prompt `query` para consultas y codificar documentos sin prompt; omitir esta distincion puede degradar la calidad de recuperacion.
- Riesgo de sesgos y alucinacion: al ser un encoder de similitud, puede recuperar fragmentos irrelevantes si el corpus o las consultas estan fuera de dominio; no se documentan evaluaciones de sesgo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion comunitaria amplia.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones de los datos de entrenamiento originales deben consultarse en la model card del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rigel97/snowflake-arctic-embed-l-v2.0-ko-onnx
- Modelo base (adaptacion coreana): https://huggingface.co/dragonkue/snowflake-arctic-embed-l-v2.0-ko
- Modelo original de Snowflake (referencia de la familia): https://huggingface.co/Snowflake/snowflake-arctic-embed-l-v2.0
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
