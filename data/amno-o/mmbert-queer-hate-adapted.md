# AmnO-O/mmbert-queer-hate-adapted

## Resumen

`AmnO-O/mmbert-queer-hate-adapted` es un modelo de lenguaje tipo encoder publicado en Hugging Face por el usuario AmnO-O. Por el identificador y las etiquetas del repositorio (`modernbert`, `fill-mask`, `transformers`, `safetensors`), se trata de un modelo de la familia ModernBERT adaptado, presumiblemente, a tareas de detección de discurso de odio dirigido a personas LGTBQ+. El repositorio tiene 0 descargas y 0 likes, y su model card es la plantilla automática de Hugging Face sin cumplimentar.

El modelo cuenta con 504.394.240 parametros (unos 504,4 millones) almacenados en safetensors, con un tamano de repositorio de 2,1 GB, lo que es coherente con pesos en fp32. Su pipeline declarado es `fill-mask`, es decir, modelado de lenguaje enmascarado, por lo que no es un modelo generativo autoregresivo ni un modelo conversacional.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: al no existir documentacion tecnica, licencia declarada, idiomas especificados ni resultados de evaluacion, cualquier uso en produccion exige validacion propia previa. El interes principal es como punto de partida para tareas de clasificacion de texto y moderacion de contenido, siempre que se aclaren primero los terminos de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo BERT, familia ModernBERT (segun etiqueta `modernbert` del repositorio); detalle no disponible |
| Parametros totales | 504.394.240 (~504,4 M) |
| Parametros activos | No aplica: no hay indicios de que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, aparentemente fp32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | `fill-mask` (modelado de lenguaje enmascarado) |
| Libreria | transformers |
| Tamano del repositorio | 2,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion en el Hub | 2026-09-27 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

La unica informacion estructural disponible son las etiquetas del repositorio. La etiqueta `modernbert` apunta a que el modelo deriva de la familia ModernBERT, una arquitectura de encoder transformer con mejoras de eficiencia respecto a BERT clasico (atención con rotaciones posicionales y capas de alternancia local/global, entre otras). La etiqueta `fill-mask` confirma que la cabeza de salida es de modelado enmascarado, no una cabeza de clasificacion. El recuento real de parametros, 504.394.240, no coincide con los tamanos publicos habituales de ModernBERT (aproximadamente 149 M en la variante base y 395 M en la large), por lo que no es posible mapear el modelo a una variante conocida sin documentacion adicional.

No hay ningun dato sobre el procedimiento de entrenamiento: ni numero de tokens, ni composicion del dataset, ni si hubo ajuste fino supervisado, DPO o RLHF, ni hiperparametros. El nombre `queer-hate-adapted` sugiere una adaptacion o ajuste fino orientado a discurso de odio contra personas LGTBQ+, pero esto es una inferencia a partir del identificador, no un dato confirmado. La referencia `arxiv:1910.09700` que aparece en las etiquetas corresponde al articulo de Lacoste et al. sobre el calculo de emisiones de carbono, citado en la plantilla automatica de la model card: no es el articulo del modelo ni evidencia de su metodo de entrenamiento.

## Capacidades

- Relleno de mascaras (`fill-mask`): el modelo puede predecir tokens enmascarados en una secuencia de entrada, la unica tarea declarada de forma explicita.
- Extraccion de representaciones: al ser un encoder bidireccional, sus estados ocultos pueden usarse como embeddings de frase o de documento mediante pooling, aunque la ficha no documenta ninguna capa o procedimiento de pooling.
- Ajuste fino para clasificacion: la arquitectura es apta para anadir una cabeza de clasificacion y entrenar tareas de etiquetado de secuencias o de texto completo, siempre que la licencia lo permita.
- Deteccion de contenido de odio: capacidad inferida del nombre del modelo, no confirmada por ninguna evaluacion publicada.
- Soporte de tool calling o function calling: no disponible; no es una capacidad esperable en un encoder `fill-mask`.
- Soporte de agentes o razonamiento multi-paso: no disponible; fuera del alcance de la arquitectura.
- Capacidades multilingues: no disponibles; no se declara ninguna lista de idiomas.
- Capacidades multimodales (vision, audio): no disponibles; las etiquetas no indican ninguna modalidad adicional.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Moderacion de contenido en plataformas: el modelo puede ajustarse con una cabeza de clasificacion binaria o multietiqueta para marcar mensajes potencialmente ofensivos hacia colectivos LGTBQ+, integrándose en un pipeline de revision previa a la publicacion. Requiere validacion propia porque no hay metricas publicadas.
- Preetiquetado para anotacion humana: usar las predicciones del modelo como primera pasada sobre grandes volumenes de comentarios y reservar la revision humana para los casos de baja confianza, reduciendo el coste de anotacion.
- Filtrado de datasets de entrenamiento: aplicar el modelo para detectar y eliminar contenido de odio en corpus recopilados de internet antes de usarlos para entrenar otros sistemas.
- Analisis de discurso en investigacion social: clasificar grandes corpus de redes sociales para estudiar la prevalencia y la evolucion de discurso hostil hacia personas LGTBQ+ a lo largo del tiempo.
- Extraccion de embeddings para busqueda semantica: aprovechar los estados ocultos del encoder para indexar y recuperar documentos con similitud semantica en dominios sensibles donde el vocabulario especifico importa.
- Sistemas de alerta temprana en comunidades online: procesar en streaming los mensajes de un foro o chat y escalar a moderadores aquellos que superen un umbral de probabilidad, con latencia baja por el tamano reducido del modelo.
- Evaluacion comparativa de tecnicas de adaptacion: emplear el checkpoint como referencia en estudios que comparen estrategias de ajuste fino para deteccion de discurso de odio en castellano y otros idiomas, una vez confirmados los idiomas soportados.
- Prototipado rapido en CPU: por su tamano de ~504 M de parametros, puede ejecutarse en CPU para pruebas de concepto antes de decidir un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio es la plantilla automatica de Hugging Face y todas las secciones de evaluacion aparecen como `[More Information Needed]`.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 504,4 M de parametros ocupan aproximadamente 2,0 GB solo en pesos; en fp16/bf16, alrededor de 1,0 GB; en int8, unos 0,5 GB; en int4, unos 0,25 GB. Hay que anadir el consumo de activaciones y del contexto, que crece con la longitud de secuencia.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en fp16 para secuencias cortas. Una RTX 3060, RTX 4060, RTX 3090 o RTX 4090 lo ejecutan con holgura. En centros de datos, A100, H100 o L40S estan sobredimensionadas para un modelo de este tamano y solo se justifican para procesamiento por lotes a gran escala.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo moderna e incluso en GPUs integradas con memoria compartida si se usa cuantizacion int8.
- CPU: es viable para inferencia en CPU con ONNX Runtime o PyTorch, con latencias del orden de decenas de milisegundos por secuencia corta, aunque no hay mediciones publicadas para este checkpoint.
- Opciones de despliegue: pipeline de `transformers` con `AutoModelForMaskedLM`, exportacion a ONNX, Hugging Face Inference Endpoints (la etiqueta `endpoints_compatible` esta presente) y Text Embeddings Inference si se usa como encoder de representaciones. No se recomienda vLLM ni llama.cpp para esta tarea, ya que estan orientados a modelos generativos; llama.cpp solo tendria sentido para convertir el encoder a embeddings.
- Latencia y throughput: no disponibles. No hay ningun dato de velocidad, tamano de lote optimo o tiempo de respuesta publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AmnO-O/mmbert-queer-hate-adapted | 504,4 M | no disponible | `fill-mask` | no disponible | Hugging Face, 0 descargas |
| ModernBERT-base | ~149 M | 8192 tokens | `fill-mask` / embeddings | Apache 2.0 | Hugging Face |
| ModernBERT-large | ~395 M | 8192 tokens | `fill-mask` / embeddings | Apache 2.0 | Hugging Face |
| BERT-base-uncased | 110 M | 512 tokens | `fill-mask` / clasificacion | Apache 2.0 | Hugging Face |
| RoBERTa-base | 125 M | 512 tokens | `fill-mask` / clasificacion | MIT | Hugging Face |

Nota: los datos de los modelos comparativos proceden de sus fichas publicas y se incluyen como referencia de categoria. Para el modelo objeto de esta ficha no hay datos de rendimiento, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no se puede asumir permiso para uso comercial. Es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Model card vacia: no hay informacion sobre datos de entrenamiento, composicion del dataset, proceso de ajuste ni hiperparametros, lo que impide auditar el modelo.
- Sesgos: un modelo adaptado a discurso de odio puede heredar y amplificar los sesgos presentes en sus datos de ajuste, incluyendo sobrerrepresentacion de determinados registros linguisticos, variantes dialectales o comunidades concretas. No hay ninguna evaluacion de sesgo publicada.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos en la clasificacion derivada, sin tasas de error conocidas.
- Idiomas: no se declara ningun idioma soportado. El identificador `mmbert` podria sugerir multilingue, pero es una especulacion sin confirmar.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento con documentos largos ni saber si trunca a 512 tokens o admite secuencias mayores.
- Uso fuera de alcance: al ser un modelo `fill-mask`, no es adecuado para generacion de texto, dialogos, resumen, traduccion ni function calling.
- Validacion pendiente: 0 descargas y 0 likes implican ausencia de validacion por parte de la comunidad; no hay terceros que hayan reproducido resultados.
- Aplicacion a contenido sensible: el uso para moderacion afecta a libertad de expresion. Se recomienda mantener supervision humana, registrar las decisiones del modelo y ofrecer vias de apelacion.
- Anomalia en los metadatos: la fecha de creacion registrada en el Hub (2026-09-27) no es coherente con un uso normal del repositorio; conviene verificar la procedencia del checkpoint antes de reutilizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmnO-O/mmbert-queer-hate-adapted
- Articulo citado en las etiquetas del repositorio (Lacoste et al., 2019, sobre emisiones de carbono en aprendizaje automatico): https://arxiv.org/abs/1910.09700
