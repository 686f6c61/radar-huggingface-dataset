# Athithya117/bge-small-en-v1.5-openvino-qint8

## Resumen

`Athithya117/bge-small-en-v1.5-openvino-qint8` es una exportación estática cuantizada a INT8 del modelo de embeddings `BAAI/bge-small-en-v1.5`, empaquetada en formato OpenVINO para inferencia de alto rendimiento en CPU. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de los pesos originales de BAAI (Beijing Academy of Artificial Intelligence) realizada por el usuario Athithya117, que recupera los artefactos OpenVINO de un commit antiguo de la rama `main` del repositorio original (`baab320`), donde ya no están disponibles.

El modelo resuelve el problema de generar embeddings de frases y pasajes en inglés para tareas de similitud semántica, búsqueda y recuperación (retrieval). Su relevancia radica en que permite ejecutar un modelo BGE de la familia small (aproximadamente 33 millones de parámetros) con cuantización INT8 sobre CPU mediante OpenVINO, reduciendo el coste computacional y el uso de memoria frente a la versión en FP32, algo útil en entornos sin GPU o con requisitos estrictos de latencia y despliegue.

La ficha se basa únicamente en la información disponible en la model card y en las etiquetas del repositorio de Hugging Face; los datos no publicados (dimensiones exactas de embedding, longitud máxima de secuencia, resultados de benchmarks) se indican como no disponibles. La licencia es MIT, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-like) del modelo base BAAI/bge-small-en-v1.5, exportado a grafo OpenVINO |
| Parametros totales | no disponible (el modelo base bge-small-en-v1.5 es de la familia small; el dato exacto no figura en la informacion proporcionada) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 estatica (OpenVINO), fichero `openvino_model_qint8_quantized.xml` / `.bin` |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`); no se distribuyen safetensors ni GGUF en este repositorio |
| Dimension de embedding | no disponible |
| Funcion de similitud | coseno (segun el ejemplo de la model card) |
| Backend de inferencia | OpenVINO (via `sentence-transformers[openvino]`) |
| Pipeline | feature-extraction / sentence-similarity |
| Tamano del repo | 0.0 GB (segun metadatos de Hugging Face) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo `BAAI/bge-small-en-v1.5`, un transformer encoder de tipo BERT orientado a la generacion de embeddings de frases. Este repositorio no entrena ni afina el modelo: se limita a distribuir una exportacion estatica a INT8 del grafo OpenVINO, extraida del commit `baab320e3049c6c62dd63560765566dd9083985e` del repositorio original de BAAI, en la ruta `openvino/`. La cuantizacion es estatica (post-training), lo que implica calibracion previa con un conjunto de datos representativo, aunque la model card no detalla el procedimiento ni el dataset de calibracion empleado.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del corpus, ni sobre si el modelo base uso RLHF/DPO u otras tecnicas de alineacion. El modelo base BGE-small-en-v1.5 es conocido por su uso en tareas de retrieval y similitud semantica en ingles, pero los detalles de su entrenamiento no se reproducen en la informacion proporcionada. La innovacion tecnica de este repositorio es exclusivamente la conversion a OpenVINO INT8 para aceleracion en CPU.

## Capacidades

- Generacion de embeddings de frases y pasajes en ingles para tareas de similitud semantica.
- Extraccion de caracteristicas (`feature-extraction`) a partir de texto.
- Calculo de similitud por coseno entre embeddings (segun el ejemplo de la model card).
- Soporte para `text-embeddings-inference` (etiqueta presente en el repositorio).
- Compatibilidad con `sentence-transformers` mediante el backend `openvino`.
- Inferencia optimizada en CPU gracias a la cuantizacion INT8 estatica.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio.
- Capacidad multilingue limitada al ingles (`language: en`).

## Casos de uso

- Busqueda semantica en corpus en ingles: el modelo genera embeddings de documentos y consultas para recuperar pasajes relevantes mediante similitud coseno; su cuantizacion INT8 permite indexar grandes volumenes en CPU sin GPU.
- Deduplicacion y agrupamiento de textos: calcular embeddings de registros y agrupar por similitud para eliminar duplicados en bases de datos o catalogos, aprovechando la inferencia CPU de bajo coste.
- Sistemas de recomendacion basados en contenido: representar items y perfiles de usuario como vectores y calcular afinidad semantica en tiempo real sobre infraestructura CPU.
- Clasificacion zero-shot por similitud: comparar embeddings de textos con embeddings de etiquetas descriptivas para categorizar tickets, correos o resenas sin entrenamiento adicional.
- RAG (retrieval-augmented generation) en entornos sin GPU: servir como modelo de recuperacion en pipelines RAG desplegados en contenedores CPU, gracias al backend OpenVINO y a la cuantizacion INT8.
- Moderacion y filtrado de contenido: medir la similitud entre mensajes entrantes y listas de referencia de contenido no deseado para priorizar revision humana.
- Analisis de similitud en herramientas de soporte: comparar consultas de usuarios con una base de preguntas frecuentes para sugerir respuestas, con latencia reducida en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que el modelo esta optimizado para CPU mediante OpenVINO; el uso de memoria en RAM es reducido por la cuantizacion INT8, aunque no se especifica la cifra exacta.
- GPU recomendadas: no se documentan; el objetivo del repositorio es inferencia en CPU.
- Compatibilidad con GPU de consumo: no disponible (el backend OpenVINO puede ejecutar en GPU Intel, pero la model card no lo detalla).
- Opciones de despliegue: `sentence-transformers` con extra `openvino` (`pip install "sentence-transformers[openvino]"`), cargando el fichero `openvino_model_qint8_quantized.xml` mediante `model_kwargs={"file_name": ...}`. Tambien es compatible con `text-embeddings-inference` segun las etiquetas del repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Athithya117/bge-small-en-v1.5-openvino-qint8 | no disponible (familia small) | no disponible | en | MIT | OpenVINO IR INT8 | Exportacion cuantizada para CPU |
| BAAI/bge-small-en-v1.5 | no disponible (familia small) | no disponible | en | MIT | safetensors / PyTorch | Modelo base original, sin cuantizar |
| BAAI/bge-base-en-v1.5 | no disponible | no disponible | en | MIT | safetensors / PyTorch | Version de mayor tamano de la familia BGE; datos exactos no disponibles en la informacion proporcionada |
| sentence-transformers/all-MiniLM-L6-v2 | no disponible | no disponible | en | Apache-2.0 | safetensors / PyTorch | Alternativa popular para embeddings en ingles; datos exactos no disponibles en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo exclusivamente en ingles (`language: en`); no soporta otros idiomas de forma documentada.
- Al ser una cuantizacion INT8 estatica, puede producirse una perdida de precision en los embeddings respecto al modelo base en FP32; no se documenta la magnitud de esa degradacion.
- Riesgo de alucinacion no aplica en sentido generativo, pero si puede haber similitudes espurias o recuperaciones incorrectas en dominios alejados de los datos de entrenamiento del modelo base.
- Sesgos conocidos: no documentados en la informacion proporcionada; al heredar el modelo base, podria reflejar sesgos de su corpus de entrenamiento.
- Restricciones de licencia: MIT permite uso comercial, pero se recomienda verificar la atribucion al modelo base BAAI y al autor de la exportacion.
- Los artefactos OpenVINO proceden de un commit antiguo del repositorio original y ya no estan en la rama `main`; esto implica que la trazabilidad depende de ese commit concreto.
- El repositorio no incluye pesos en safetensors ni GGUF, por lo que no es directamente usable con llama.cpp u Ollama.
- No se documentan resultados de benchmarks ni latencias, lo que dificulta evaluar el impacto real de la cuantizacion en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Athithya117/bge-small-en-v1.5-openvino-qint8
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Commit original con los artefactos OpenVINO: https://huggingface.co/BAAI/bge-small-en-v1.5/tree/baab320e3049c6c62dd63560765566dd9083985e/openvino
- Documentacion de sentence-transformers con OpenVINO: no disponible en la informacion proporcionada
- Paper o blog del modelo base: no disponible en la informacion proporcionada
