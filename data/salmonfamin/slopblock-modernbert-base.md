# salmonfamin/slopblock-modernbert-base

## Resumen

`salmondfamin/slopblock-modernbert-base` es un checkpoint publicado en HuggingFace por el usuario salmonfamin y etiquetado con los tags `onnx`, `modernbert` y `region:us`. La unica informacion objetiva disponible en el repositorio es el propio identificador, los tags, el tamano del repositorio (0,2 GB), la fecha de creacion (24 de septiembre de 2026) y las metricas de uso (13 descargas, 0 likes). No hay model card descriptiva, ni licencia declarada, ni idiomas, ni pipeline asignado.

Los tags y el sufijo del nombre indican que se trata de un derivado de ModernBERT, la familia de encoders de Answer.AI y LightOn presentada a finales de 2024, exportado a formato ONNX para inferencia. El prefijo "slopblock" sugiere, sin que exista documentacion que lo confirme, un uso orientado a filtrado o bloqueo de contenido generado automaticamente de baja calidad; esta interpretacion es una inferencia a partir del nombre y no un dato verificado.

Por tanto, esta ficha describe la arquitectura base sobre la que se apoya el checkpoint y advierte de forma explicita de que cualquier dato especifico del ajuste (dataset, tarea objetivo, licencia, idiomas) no esta publicado. Es relevante ahora porque los encoders ModernBERT han desplazado a BERT y RoBERTa en tareas de clasificacion y recuperacion gracias a su ventana de 8192 tokens, y los checkpoints ONNX son el formato habitual para desplegar estos modelos en entornos sin GPU o con ONNX Runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional tipo ModernBERT (atencion alterna local/global, RoPE, GeGLU, unpadding), exportado a ONNX |
| Parametros totales | No disponible para este checkpoint; la arquitectura ModernBERT-base declara ~149 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en el repositorio; la arquitectura ModernBERT-base admite hasta 8192 tokens |
| Tipos de cuantizacion | No disponibles; el repositorio contiene pesos en formato ONNX (0,2 GB en total) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | ONNX (tag `onnx`; no se declaran safetensors ni GGUF) |

## Arquitectura y entrenamiento

El checkpoint se apoya en ModernBERT, un encoder transformer de tipo bidireccional disenado como sustituto directo de BERT y RoBERTa. Sus innovaciones conocidas son la alternancia de capas de atencion local (ventana de 128 tokens) con capas de atencion global, el uso de embeddings posicionales rotatorios (RoPE) en lugar de embeddings posicionales absolutos, la activacion GeGLU, la eliminacion del relleno (unpadding) para evitar computo en tokens de padding y la integracion de Flash Attention 2. La variante base publicada por Answer.AI y LightOn tiene 22 capas, 149 millones de parametros y fue entrenada sobre aproximadamente 2 billones de tokens, con una fase de ajuste de contexto largo. La variante large alcanza 395 millones de parametros y 28 capas.

No hay informacion alguna sobre el proceso de ajuste de este checkpoint concreto: se desconoce el dataset utilizado, el numero de tokens de entrenamiento, la tarea objetivo (clasificacion, filtrado, similitud semantica, enmascarado), si hubo destilacion, ajuste supervisado o preferencias (RLHF/DPO) y si el modelo conserva la cabeza de masked language modeling. El unico dato estructural confirmado es la exportacion a ONNX, que implica grafos optimizados para ONNX Runtime y, presumiblemente, cuantizacion o precision reducida dado el tamano del repositorio.

## Capacidades

No se documentan capacidades especificas de este checkpoint. Las siguientes son capacidades tipicas de la arquitectura ModernBERT y deben tratarse como potenciales, no confirmadas para este repositorio:

- Codificacion de texto para clasificacion de secuencias (sentimiento, toxicidad, spam, intencion).
- Etiquetado de tokens para tareas tipo NER, extraccion de entidades o chunking.
- Generacion de embeddings para busqueda semantica y recuperacion (retrieval) con contexto de hasta 8192 tokens.
- Masked language modeling (relleno de tokens enmascarados), si el checkpoint conserva esa cabeza.
- Procesamiento de documentos largos en una sola pasada, sin chunking, gracias a la ventana extendida de la arquitectura base.
- Inferencia en CPU mediante ONNX Runtime, dado el formato de los pesos.
- Soporte de tool calling, function calling o agentes: no disponible (es un encoder, no un modelo generativo de instrucciones).
- Capacidades multilingues: no disponibles.
- Capacidades de vision, audio o modo "thinking": no disponibles.

## Casos de uso

- Filtrado de contenido generado por IA: un clasificador derivado de un encoder ModernBERT puede puntuar textos entrantes y descartar los que superen un umbral de baja calidad o spam; el nombre del checkpoint apunta a este escenario, aunque no esta documentado.
- Moderacion de comunidades y foros: clasificacion por lotes de comentarios en ONNX Runtime sobre CPU, con coste por inferencia bajo y latencia de milisegundos para secuencias cortas.
- Busqueda semantica en documentacion tecnica: generar embeddings de fragmentos de hasta 8192 tokens y almacenarlos en un indice vectorial para recuperacion aumentada.
- Clasificacion de tickets de soporte: asignar categoria y prioridad a incidencias en un pipeline de atencion al cliente, ejecutando el modelo en el mismo servidor de aplicaciones sin GPU.
- Extraccion de entidades en contratos o facturas: etiquetado de tokens para identificar partes, importes y fechas en documentos largos procesados completos.
- Deteccion de duplicados y near-duplicates: comparar embeddings de articulos o publicaciones para agrupar contenido repetido en un CMS.
- Preprocesado en pipelines de LLM: usar el encoder como reranker barato o como filtro previo que decide que documentos merecen pasar a un modelo generativo mayor.
- Clasificacion de textos en entornos con restricciones de hardware o de privacidad: al ser un modelo de ~0,2 GB en ONNX, puede ejecutarse en el borde (edge) o en contenedores sin acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion, ni metricas de GLUE, SuperGLUE, MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y tampoco se declara la tarea para la que fue ajustado.

## Requisitos de hardware

- VRAM estimada: no disponible para este checkpoint. Como referencia, un encoder de ~149 millones de parametros ocupa aproximadamente 0,6 GB en fp32, 0,3 GB en fp16 y 0,15 GB en int8; el repositorio de 0,2 GB es coherente con una exportacion cuantizada o en precision reducida.
- GPU recomendadas: no disponibles. Cualquier GPU con 2 GB o mas de memoria es suficiente para un encoder de este tamano; no requiere A100 ni H100 salvo para procesamiento por lotes masivo.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU consumer de los ultimos diez anos (GTX 1050, RTX 3060, RTX 4090), asi como en CPU y en aceleradores de borde.
- Opciones de despliegue: ONNX Runtime es la via natural dado el formato de pesos; tambien son viables transformers.js, FastAPI con onnxruntime, Triton Inference Server y Hugging Face Inference Endpoints. vLLM, llama.cpp y Ollama no aplican a un encoder ONNX de este tipo.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| salmonfamin/slopblock-modernbert-base | No disponible (base ~149 M) | No disponible (base hasta 8192) | ONNX | No disponible | HuggingFace, 13 descargas |
| answerdotai/ModernBERT-base | ~149 M | 8192 | safetensors | Apache 2.0 | HuggingFace, ampliamente utilizado |
| google-bert/bert-base-uncased | 110 M | 512 | safetensors, PyTorch | Apache 2.0 | HuggingFace, referencia historica |
| FacebookAI/roberta-base | 125 M | 512 | safetensors, PyTorch | MIT | HuggingFace, muy extendido |

La comparativa se limita a parametros, contexto, formato y licencia porque no existen resultados de evaluacion publicados para el checkpoint analizado.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan tarea objetivo, datos de entrenamiento, metricas ni limitaciones, lo que impide validar el modelo antes de usarlo en produccion.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial; hay que contactar con el autor o asumir el riesgo legal.
- Idiomas no declarados: se desconoce si el modelo funciona en castellano o si esta limitado al ingles.
- Sesgos: no evaluados ni publicados; los encoders entrenados sobre rastreos web suelen heredar sesgos de genero, raza y nacionalidad.
- Riesgo de alucinacion: limitado en clasificacion, pero presente si se usa para extraccion de entidades o resumen, donde puede producir etiquetas plausibles pero incorrectas.
- Ambiguedad del proposito: la interpretacion de "slopblock" como filtro de contenido es una suposicion derivada del nombre, no un dato confirmado.
- Trazabilidad: 13 descargas y 0 likes indican un checkpoint sin validacion por parte de la comunidad.
- Formato ONNX: no incluye pesos PyTorch ni safetensors en el repositorio, lo que complica el reajuste fino y obliga a usar ONNX Runtime o a convertir el grafo.
- Fecha de publicacion inusual (2026): conviene verificar la integridad del repositorio y el hash de los archivos antes de desplegarlo.
- Contexto: aunque la arquitectura base soporte 8192 tokens, no hay confirmacion de que este checkpoint conserve esa ventana tras la exportacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/salmondfamin/slopblock-modernbert-base
- Modelo base de referencia (Answer.AI / LightOn): https://huggingface.co/answerdotai/ModernBERT-base
- Paper de la arquitectura ModernBERT: https://arxiv.org/abs/2412.13663
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) asociados a este checkpoint en la informacion disponible.
