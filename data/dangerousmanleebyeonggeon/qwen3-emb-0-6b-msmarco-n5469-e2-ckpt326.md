# dangerousmanleebyeonggeon/qwen3-emb-0.6b-msmarco-n5469-e2-ckpt326

## Resumen

El modelo `dangerousmanleebyeonggeon/qwen3-emb-0.6b-msmarco-n5469-e2-ckpt326` es un modelo de embeddings de texto (sentence-similarity) publicado por el usuario `dangerousmanleebyeonggeon`. Se trata de un ajuste fino completo del modelo base `Qwen/Qwen3-Embedding-0.6B`, entrenado con la libreria ms-swift y la funcion de perdida InfoNCE sobre un subconjunto de 5.469 consultas del corpus `microsoft/ms_marco` v1.1. El propio autor lo describe explicitamente como un experimento de ablacion de datos de entrenamiento ("training-data ablation"), con un tamano de dataset equiparable a su conjunto propio de referencia, `canho/ours-6k`.

El checkpoint publicado es el final del entrenamiento (paso 326 de 326), con una perdida de evaluacion de 1,8911. El modelo tiene 595.776.512 parametros (aproximadamente 0,6B), pesos en formato safetensors y un tamano de repositorio de 1,2 GB. Por su tamano, es un modelo de recuperacion densa pensado para ejecutarse en hardware modesto, incluso en CPU, y compatible con pipelines de sentence-transformers y text-embeddings-inference.

Su relevancia es limitada y muy acotada: no es un modelo de proposito general ni un lanzamiento de produccion, sino un artefacto de investigacion sobre el efecto del volumen y la composicion de datos en el ajuste de modelos de embeddings. No tiene descargas ni "likes", no declara licencia ni idiomas soportados y no publica resultados de benchmarks. Debe tratarse, por tanto, como un punto de partida reproducible para experimentos de ablacion, no como un modelo listo para produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder de Qwen3 adaptado a embeddings; heredada del modelo base) |
| Parametros totales | 595.776.512 (segun safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card (el modelo base Qwen3-Embedding-0.6B declara 32.768 tokens; no verificado en este ajuste) |
| Tipos de cuantizacion | No disponible en el repositorio (solo safetensors; no se publican GGUF ni ONNX) |
| Idiomas soportados | No disponibles (el modelo base es multilingue; este ajuste se entrena solo con MS MARCO en ingles) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Dimension de embedding | No disponible en la model card (el modelo base declara 1.024; no verificado en este ajuste) |
| Pipeline | sentence-similarity |
| Libreria | sentence-transformers |
| Prompt de consulta | `Query:` (los documentos sin prompt) |
| Modelo base | Qwen/Qwen3-Embedding-0.6B |
| Tamano del repositorio | 1,2 GB |
| Fecha de creacion | 2026-10-09 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo `Qwen/Qwen3-Embedding-0.6B`, un transformer denso derivado de la familia Qwen3 y adaptado a la generacion de representaciones vectoriales. El ajuste se realiza sobre todos los parametros (full fine-tuning), sin LoRA ni adaptadores, segun se deduce de la receta declarada. La tarea es de similitud asimetrica consulta-documento: la consulta se codifica con el prompt `Query:` (definido en `config_sentence_transformers.json`) y el documento se codifica sin prompt.

El entrenamiento usa ms-swift con `--task_type embedding` y `--loss_type infonce`, con los siguientes hiperparametros: learning rate 6e-6 con decaimiento coseno, 2 epocas, 8 GPUs con batch por dispositivo de 1 y acumulacion de gradiente 4 (32 consultas por paso), negativos in-batch recogidos con all-gather entre las 8 consultas de un micro-lote, temperatura 0,1, DeepSpeed ZeRO-3, precision bf16, 5% de datos reservados para evaluacion y semilla 42. Los datos son 5.469 filas de `microsoft/ms_marco` v1.1 (split de train), muestreadas con semilla 42, tomando exactamente un pasaje seleccionado por consulta como positivo y los 9 primeros pasajes no seleccionados de la misma consulta como negativos duros.

Como innovacion tecnica no hay ninguna aportacion propia: se trata de una receta estandar de InfoNCE con negativos in-batch. El interes del artefacto esta en el diseno experimental (control del tamano del dataset frente al conjunto propio del autor) y no en la arquitectura o el metodo de entrenamiento. El valor de perdida de evaluacion reportado (1,8911 en el paso final) es una metrica de entrenamiento y no permite inferir calidad de recuperacion en produccion.

## Capacidades

- Generacion de embeddings de texto para similitud semantica y recuperacion densa (retrieval) consulta-documento.
- Busqueda semantica asimetrica: codificacion separada de consultas (con prompt `Query:`) y documentos (sin prompt).
- Calculo de similitud entre frases y agrupamiento o deduplicacion semantica sobre representaciones vectoriales.
- Uso como codificador en pipelines de sentence-transformers y en text-embeddings-inference (los tags incluyen `text-embeddings-inference` y `endpoints_compatible`).
- Reclasificacion (reranking) de candidatos recuperados por un sistema de busqueda de primera etapa, mediante similitud coseno.
- Capacidades multilingues: no verificadas en este ajuste, aunque el modelo base Qwen3-Embedding es multilingue. El ajuste fino solo ha visto datos en ingles.
- Tool calling, function calling, agentes, razonamiento multi-paso, vision y audio: no disponibles. Es un modelo de embeddings, no generativo.

## Casos de uso

- Recuperacion de pasajes en un sistema RAG monolingue en ingles: indexar un corpus de documentos y recuperar los pasajes mas relevantes para una consulta mediante similitud coseno, usando el prompt `Query:` en la consulta y sin prompt en los documentos.
- Reranking de resultados de un motor de busqueda lexical (por ejemplo BM25): recuperar 100 candidatos con la busqueda de primera etapa y reordenarlos con las puntuaciones de similitud de este modelo, que es rapido por su tamano de 0,6B.
- Deduplicacion y agrupamiento de documentos: calcular embeddings de un corpus y aplicar clustering o umbral de similitud para detectar duplicados y agrupar contenido tematicamente proximo.
- Clasificacion zero-shot ligera por similitud: definir descripciones textuales de cada clase y asignar cada texto a la clase con mayor similitud coseno, sin entrenar un clasificador adicional.
- Prototipado y evaluacion de estrategias de negativos duros: al ser un artefacto de ablacion con receta y semilla documentadas, sirve para reproducir experimentos sobre como afecta el tamano y la composicion del dataset de entrenamiento a la calidad del retrieval.
- Filtrado de candidatos en pipelines de anotacion: priorizar pares consulta-documento con alta similitud para revision humana en tareas de etiquetado, reduciendo el volumen a revisar manualmente.
- Cache semantica de respuestas: almacenar embeddings de preguntas frecuentes y resolver una consulta nueva por similitud con una ya respondida, evitando llamadas a un modelo generativo.
- Analisis de similitud en soporte tecnico: agrupar tickets o incidencias por contenido semantico para detectar duplicados y patrones recurrentes.

En todos los casos conviene validar antes el rendimiento real: no hay benchmarks publicados y la perdida de evaluacion es relativamente alta, por lo que el modelo puede quedar por debajo del propio modelo base sin ajustar en tareas fuera del dominio de MS MARCO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es la perdida de evaluacion del paso final (1,8911), que no es directamente comparable con metricas de recuperacion como nDCG@10, Recall@k o MRR. Tampoco se incluye evaluacion sobre MTEB, BEIR ni sobre el conjunto reservado del 5%, mas alla del valor escalar de la perdida.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 1,2 GB solo para pesos; en la practica, entre 2 y 3 GB contando activaciones y overhead del runtime para lotes pequenos.
- VRAM estimada en fp32: alrededor de 2,4 GB para pesos.
- Cuantizacion: no se publican pesos cuantizados en el repositorio. Una conversion a int8 reduciria los pesos a unos 0,6 GB y a 4 bits a unos 0,3 GB, pero requeriria generar los ficheros (por ejemplo con llama.cpp) y no esta validada por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4090, T4, L4). Para lotes grandes o indexacion masiva, A100 o H100 aportan mayor paralelismo, aunque el modelo esta muy sobredimensionado para ese hardware.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida. Tambien es viable en CPU para cargas de baja concurrencia.
- Opciones de despliegue: sentence-transformers (metodo de referencia, con `processor_kwargs={"padding_side": "left"}`), text-embeddings-inference y endpoints compatibles, vLLM con soporte de tareas de embedding y ms-swift para reentrenamiento. No se publican pesos GGUF ni ONNX, por lo que Ollama o llama.cpp requeririan conversion previa.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud, un modelo denso de 0,6B en una GPU moderna permite codificar cientos o miles de textos cortos por segundo con lotes de tamano medio, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de embedding | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-emb-0.6b-msmarco-n5469-e2-ckpt326 | 595,8 M | No disponible | No disponible | No disponible | HuggingFace, safetensors |
| Qwen/Qwen3-Embedding-0.6B (modelo base) | 595,8 M | 1.024 (segun documentacion del base) | 32.768 tokens (segun documentacion del base) | Apache 2.0 (segun documentacion del base) | HuggingFace, safetensors |
| BAAI/bge-m3 | 568 M | 1.024 | 8.192 tokens | MIT | HuggingFace, safetensors |
| intfloat/multilingual-e5-large | 560 M | 1.024 | 512 tokens | MIT | HuggingFace, safetensors |
| Alibaba-NLP/gte-multilingual-base | 305 M | 768 | 8.192 tokens | Apache 2.0 | HuggingFace, safetensors |

Los datos de los modelos comparativos provienen de su documentacion publica y no han sido verificados en el contexto de esta ficha. La diferencia clave de este checkpoint frente a ellos no es el rendimiento, sino su naturaleza experimental: frente al modelo base Qwen3-Embedding-0.6B, que es multilingue y esta alineado con instrucciones, este ajuste solo ha visto 5.469 consultas en ingles de MS MARCO durante 2 epocas. Sin evaluacion publicada, no hay base para afirmar que lo supere.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay resultados en MTEB, BEIR ni en el propio conjunto de validacion mas alla de la perdida, por lo que se desconoce si mejora al modelo base sin ajustar.
- Dataset de entrenamiento muy reducido (5.469 consultas) y solo 2 epocas, con una perdida de evaluacion de 1,8911 que sugiere margen de mejora o posible infraajuste.
- Sesgo de dominio: los datos provienen exclusivamente de MS MARCO en ingles, un corpus de consultas web. El rendimiento en otros dominios (texto cientifico, legal, codigo) o en otros idiomas no esta validado y probablemente se degrade.
- Riesgo de olvido catastrofico: el ajuste fino completo sobre datos en ingles puede degradar las capacidades multilingues del modelo base, aunque esto no se ha medido.
- Negativos duros debiles: se toman los 9 primeros pasajes no seleccionados de la misma consulta, sin mineria de negativos por similitud, lo que limita la senal de entrenamiento.
- Uso obligatorio del prompt `Query:` en consultas: omitirlo o aplicarlo a los documentos altera la representacion y degrada la similitud.
- Licencia no declarada: no se especifican terminos de uso, lo que impide confirmar si el uso comercial esta permitido. Esta es una advertencia critica para cualquier despliegue en produccion.
- Idiomas soportados no declarados; no hay garantia de comportamiento correcto fuera del ingles.
- Sin descargas ni validacion de la comunidad: es un artefacto sin contraste externo, en un repositorio creado y actualizado el mismo dia (2026-10-09).
- Tamano de contexto efectivo no declarado: el modelo base soporta contextos largos, pero el entrenamiento usara probablemente longitudes mucho menores, y no se especifica el `max_seq_length` efectivo.
- Riesgo de sobreajuste al formato de MS MARCO: el modelo puede puntuar alto pasajes que se parezcan estilisticamente a los del corpus de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dangerousmanleebyeonggeon/qwen3-emb-0.6b-msmarco-n5469-e2-ckpt326
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/microsoft/ms_marco
- Framework de entrenamiento ms-swift: https://github.com/modelscope/ms-swift
- Libreria sentence-transformers: https://github.com/UKPLab/sentence-transformers
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference

Nota: la busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo. Las unicas referencias verificables son las anteriores. No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este checkpoint.
