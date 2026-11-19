# hearken-models/bge-small-en-v1.5-onnx

## Resumen

`hearken-models/bge-small-en-v1.5-onnx` es una copia sin modificaciones del modelo de embeddings `BAAI/bge-small-en-v1.5` de la Beijing Academy of Artificial Intelligence (BAAI), exportado originalmente a formato ONNX por Xenova y redistribuido por el usuario Hearken para garantizar una fuente estable de descarga. No se trata de un modelo generativo, sino de un encoder de frases (sentence embedding) disenado para tareas de similitud semantica, recuperacion de informacion y feature extraction.

El modelo resuelve el problema de convertir texto en vectores densos de 384 dimensiones que pueden compararse mediante similitud coseno. Es la variante "small" de la familia BGE (BAAI General Embedding) v1.5, pensada para entornos con recursos limitados donde se prioriza latencia y huella de memoria reducida frente a la maxima calidad de representacion.

Su relevancia actual radica en que el formato ONNX permite ejecutar el modelo fuera de PyTorch (por ejemplo con ONNX Runtime, Transformers.js o navegador), y en que el repositorio garantiza integridad mediante hashes SHA-256 de cada fichero. El tamano del repositorio es de aproximadamente 0,1 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-like), exportado a ONNX |
| Parametros totales | no disponible (modelo base BGE-small, ~33M segun la familia; no confirmado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el fichero distribuido es `model.onnx` sin cuantizar, 133.093.490 bytes) |
| Idiomas soportados | no disponible (el sufijo `-en` sugiere ingles; no confirmado explicitamente) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`) + `vocab.txt` |

## Arquitectura y entrenamiento

El modelo subyacente es un encoder transformer de tipo BERT en su variante "small", orientado a producir embeddings de frases mediante pooling. La exportacion a ONNX conserva la topologia del modelo original sin cambios; el repositorio de Hearken es una copia byte a byte del artefacto publicado por Xenova, con verificacion por SHA-256 (`828e1496...` para el modelo y `07eced37...` para el vocabulario).

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o entrenamiento contrastivo especifico. La model card del repositorio redistribuido no incluye esa informacion; habria que consultar la ficha original de BAAI para obtenerla.

## Capacidades

- Generacion de embeddings de frases y documentos (feature extraction) en 384 dimensiones.
- Similitud semantica entre pares de textos (sentence-similarity).
- Recuperacion densa de informacion (dense retrieval) para sistemas RAG.
- Clasificacion de texto por similitud a prototipos.
- Clustering y deduplicacion semantica de documentos.
- Ejecucion en runtime ONNX (ONNX Runtime, Transformers.js, etc.), sin dependencia de PyTorch.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso: es exclusivamente un encoder.
- Capacidades multilingues: no confirmadas; el identificador sugiere uso en ingles.

## Casos de uso

- Busqueda semantica en bases de conocimiento: indexar documentos como vectores de 384 dimensiones y recuperar los mas similares a una consulta mediante similitud coseno; el tamano reducido del modelo permite indexar grandes volumenes con bajo coste.
- RAG (retrieval-augmented generation): usar el modelo como retriever en pipelines que alimentan a un LLM generativo, gracias a su baja latencia y a la posibilidad de ejecutarlo en ONNX Runtime.
- Deduplicacion de registros: calcular embeddings de entradas de una base de datos y agrupar por umbral de similitud para eliminar duplicados semanticos.
- Clasificacion zero-shot ligera: comparar el embedding de un texto con embeddings de etiquetas descriptivas para asignar categorias sin entrenamiento adicional.
- Moderacion y filtrado de contenido: detectar textos proximos a patrones conocidos mediante similitud vectorial en tiempo real.
- Despliegue en el navegador o en el edge: al estar en ONNX, puede ejecutarse con Transformers.js en cliente o en dispositivos sin GPU, evitando enviar texto a servidores externos.
- Enrutamiento de consultas: clasificar la intencion de una consulta de usuario comparandola con embeddings de intenciones predefinidas antes de derivarla a un flujo concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio redistribuido no incluye metricas (MTEB, MMLU, etc.) y no se dispone de datos verificables para esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero ONNX ocupa 133 MB en precision original; en FP32 requiere aproximadamente 130-150 MB de memoria, y menos si se aplica cuantizacion (no incluida en el repo).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el modelo cabe en GPUs integradas y en CPU.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna e incluso en muchas integradas; tambien en CPU.
- Opciones de despliegue: ONNX Runtime, Transformers.js, y cualquier runtime compatible con ONNX. No se distribuyen pesos en formato GGUF, safetensors ni PyTorch en este repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| hearken-models/bge-small-en-v1.5-onnx | no disponible (~33M en la familia) | no disponible | MIT | ONNX | Copia de BAAI v1.5 exportada por Xenova |
| BAAI/bge-small-en-v1.5 | no disponible | no disponible | MIT | safetensors/PyTorch | Modelo original; misma arquitectura y pesos |
| Xenova/bge-small-en-v1.5 | no disponible | no disponible | MIT | ONNX | Exportacion original a ONNX de la que deriva este repo |

La comparativa con alternativas de distinto tamano (por ejemplo BGE-base o BGE-large) no puede completarse con datos verificables en la informacion disponible.

## Limitaciones y advertencias

- Es un encoder de embeddings, no un modelo generativo: no produce texto ni responde preguntas directamente.
- El identificador `-en` sugiere entrenamiento en ingles; el rendimiento en castellano u otros idiomas no esta confirmado y probablemente sea inferior.
- No se han publicado datos de sesgos ni evaluaciones de robustez en la informacion disponible.
- Riesgo de alucinacion no aplica en sentido estricto (no genera texto), pero los embeddings pueden producir similitudes erroneas en dominios muy especializados.
- La licencia MIT permite uso comercial, pero el autor del repo redistribuido recomienda citar y enlazar el trabajo original de BAAI, no este repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-19: es una copia reciente sin validacion comunitaria.
- No se distribuyen pesos cuantizados ni en otros formatos; para despliegues con cuantizacion habria que generarlos a partir del ONNX original.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hearken-models/bge-small-en-v1.5-onnx
- Modelo original de BAAI: https://huggingface.co/BAAI/bge-small-en-v1.5
- Exportacion ONNX original de Xenova: https://huggingface.co/Xenova/bge-small-en-v1.5
- Fichero ONNX de origen (commit `ea104dacec62c0de699686887e3f920caeb4f3e3`): https://huggingface.co/Xenova/bge-small-en-v1.5/resolve/ea104dacec62c0de699686887e3f920caeb4f3e3/onnx/model.onnx
