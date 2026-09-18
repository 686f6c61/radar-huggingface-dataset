# palli23/wav2vec2-base-samromur-50h

## Resumen

wav2vec2-base-samromur-50h es un modelo de reconocimiento automatico del habla (ASR) publicado por el usuario palli23 en HuggingFace. Se trata de un ajuste fino de la arquitectura wav2vec2-base (94.402.472 parametros) sobre un subconjunto anidado de 50 horas extraido del corpus islandes Miljon/samromur-500h. El modelo esta especializado exclusivamente en islandes (codigo de idioma `is`) y se distribuye bajo licencia CC BY-SA 4.0.

El modelo forma parte de un conjunto de checkpoints de escalado ("scaling checkpoint set") elaborado para el articulo "Scaling Smaller ASR Models Against Multilingual ASR Giants", aceptado en ICASSP 2027 segun la propia model card. El objetivo declarado de ese trabajo es estudiar como modelos ASR pequenos (del orden de decenas o centenas de millones de parametros) rinden frente a modelos multilingues mucho mas grandes cuando se les proporciona datos de entrenamiento especificos de un idioma concreto.

Con 21 descargas y 0 likes en el momento de la consulta, es un modelo de investigacion con una adopcion muy limitada y sin pipeline declarado en HuggingFace. Su relevancia es por tanto experimental y academica: sirve como punto de referencia en un estudio de escalado de datos para ASR islandes, mas que como solucion lista para produccion. La model card no documenta metricas de WER o CER, y remite al articulo para la metodologia y los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-base (extractor convolucional de caracteristicas + encoder transformer) |
| Parametros totales | 94.402.472 (dato real de los pesos safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no especifica duracion maxima de audio ni estrategia de segmentacion) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors sin variantes cuantizadas publicadas) |
| Idiomas soportados | islandes (`is`) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es wav2vec2-base, un modelo de representacion de voz que combina un extractor de caracteristicas convolucional que opera directamente sobre la onda de audio en bruto con un encoder de tipo transformer. Con 94,4 millones de parametros, corresponde exactamente al tamano "base" de la familia wav2vec2 de Meta. Para tareas ASR este tipo de modelos se ajusta habitualmente con una cabeza de clasificacion CTC, aunque la model card no especifica la cabeza concreta utilizada en este checkpoint.

El entrenamiento consiste en un ajuste fino sobre un subconjunto anidado de 50 horas tomado del pool de escalado principal Miljon/samromur-500h. El termino "nested subset" indica que las 50 horas son un subconjunto contenido dentro de las 500 horas, lo que permite comparaciones controladas entre checkpoints entrenados con distintos volumenes de datos dentro del mismo trabajo de escalado. No se documentan en la informacion disponible el numero de tokens o muestras procesadas, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras (poco habituales en ASR, donde predominan CTC o seq2seq con atencion). Tampoco se detallan innovaciones tecnicas adicionales: el valor del checkpoint esta en el estudio de escalado, no en una arquitectura novedosa.

## Capacidades

- Reconocimiento automatico del habla (ASR) en islandes: transcripcion de audio a texto en un unico idioma.
- Modelo especializado y monoidioma: no soporta otros idiomas distintos del islandes.
- No dispone de capacidad de generacion de texto libre, razonamiento, codigo ni matematicas; es un modelo acustico orientado a transcripcion.
- No soporta tool calling ni function calling.
- No esta disenado para agentes ni razonamiento multi-paso.
- No tiene capacidades de vision, audio generativo ni modo de "pensamiento" (thinking mode).
- Capacidad multilingue: no; el alcance es exclusivamente islandes.
- Al ser un checkpoint de investigacion de un estudio de escalado, su valor anadido es servir como punto de comparacion frente a otros tamanos de dataset del mismo pool.

## Casos de uso

- Transcripcion de audio en islandes: convertir grabaciones de voz en texto para archivos, entrevistas o contenido audiovisual en islandes, aprovechando el ajuste especifico sobre habla islandesa del corpus Samromur.
- Generacion de subtitulos: integracion en un pipeline de ASR por segmentos para producir subtitulos en islandes, con la salvedad de que la model card no documenta la duracion maxima de audio admitida, por lo que habria que segmentar.
- Investigacion en ASR de bajos recursos: uso como checkpoint de referencia en experimentos de escalado de datos, comparando su rendimiento con el de otros checkpoints del mismo pool (por ejemplo, subconjuntos mayores de las 500 horas).
- Anotacion asistida de corpus: pretranscripcion automatica de grabaciones islandesas para que anotadores humanos corrijan despues, reduciendo el coste de crear nuevos datos de habla.
- Evaluacion comparativa frente a modelos multilingues grandes: sirve para medir la brecha de rendimiento entre un modelo pequeno especializado y modelos como Whisper o XLS-R en islandes, que es precisamente el objeto del articulo asociado.
- Accesibilidad: transcripcion de contenido hablado en islandes para personas con discapacidad auditiva, siempre que se valide la calidad real del modelo con datos propios.
- Sistemas de dictado o comandos de voz en islandes: uso como componente acustico dentro de una aplicacion de voz de dominio cerrado, con postprocesado y vocabulario restringido para compensar la ausencia de un modelo de lenguaje acoplado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de WER (Word Error Rate) y CER (Character Error Rate) se encuentran en el articulo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2027), al que no se ha tenido acceso durante la elaboracion de esta ficha. No se incluyen comparaciones con otros modelos ni cifras de MMLU, HumanEval o GSM8K, que ademas no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 378 MB en fp32 y unos 189 MB en fp16/bf16, calculados a partir de los 94,4 millones de parametros. En int8 seria del orden de 95 MB, aunque no hay variantes cuantizadas publicadas.
- Cabe sin dificultad en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o en CPU.
- GPU de gama alta (A100, H100) no son necesarias; se usarian solo para procesar grandes volumenes de audio en paralelo o para reentrenamiento.
- Inferencia en CPU viable: con 94M de parametros, la transcripcion por lotes en CPU es practica para cargas moderadas.
- Opciones de despliegue: al ser un modelo compatible con la libreria transformers, puede servirse con un pipeline de ASR estandar; tambien es convertible a ONNX o a formatos de runtime ligero (por ejemplo, sherpa-onnx o similar) y se puede servir con TGI o vLLM si se adapta la tarea, aunque ninguna de estas opciones esta documentada en la model card.
- Latencia y throughput: no disponible. No se publican medidas de velocidad en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / alcance | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| palli23/wav2vec2-base-samromur-50h | 94,4 M | ASR; duracion de audio no especificada | Islandes | CC BY-SA 4.0 | HuggingFace |
| facebook/wav2vec2-base-960h | 94,4 M (referencia publica) | ASR sobre LibriSpeech 960h | Ingles | Apache 2.0 (referencia publica) | HuggingFace |
| openai/whisper-small | 244 M (referencia publica) | ASR + traduccion, ventanas de 30 s | Multilingue (incluye islandes) | Apache 2.0 (referencia publica) | HuggingFace / OpenAI |
| facebook/wav2vec2-xls-r-300m | 300 M (referencia publica) | ASR, 128 idiomas en preentrenamiento | Multilingue | Apache 2.0 (referencia publica) | HuggingFace |

La comparacion es estructural: los datos de parametros y licencias de los modelos alternativos son cifras publicas conocidas, no resultados medidos en este trabajo. No se dispone de una comparativa de WER porque no hay metricas publicadas en la informacion disponible.

## Limitaciones y advertencias

- Modelo monoidioma: no transcribe ni traduce otros idiomas distintos del islandes, y no dispone de deteccion automatica de idioma.
- Riesgo de alucinacion y de errores de transcripcion: como cualquier modelo ASR, puede producir texto plausible pero incorrecto, especialmente con ruido de fondo, acentos no representados en Samromur o vocabulario tecnico. No se documentan cifras de WER que permitan acotar ese riesgo.
- Sesgos potenciales derivados del corpus de entrenamiento: Samromur es un corpus de habla islandesa con una composicion demografica y de dominio concreta; el rendimiento fuera de esa distribucion (por ejemplo, habla espontanea, dialectos o audio telefonico) no esta documentado.
- Limitaciones de longitud de audio: la model card no especifica la duracion maxima de entrada ni la estrategia de segmentacion, por lo que en produccion hay que definirla y validarla.
- Ausencia de modelo de lenguaje acoplado: al ser un encoder ASR ajustado, la salida puede carecer de fluidez y requerir postprocesado o un modelo de lenguaje externo.
- Restricciones de licencia: CC BY-SA 4.0 permite uso comercial, pero exige atribucion y que las obras derivadas se distribuyan bajo la misma licencia o una compatible (copyleft). Esto puede condicionar la integracion en productos propietarios que no quieran liberar sus derivados.
- Modelo sin mantenimiento aparente y con adopcion muy baja (21 descargas, 0 likes), sin garantias de soporte ni de actualizaciones.
- Fecha de creacion y actualizacion en HuggingFace posteriores a 2026, coherentes con un articulo de ICASSP 2027: se trata de un artefacto de investigacion, no de un modelo validado en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/palli23/wav2vec2-base-samromur-50h
- Dataset de escalado de referencia citado en la model card: Miljon/samromur-500h (identificador de HuggingFace, sin URL verificado en la informacion disponible)
- Articulo asociado: "Scaling Smaller ASR Models Against Multilingual ASR Giants", ICASSP 2027 (citado en la model card; no se ha encontrado enlace directo en la busqueda web)
- Nota sobre la busqueda web: los resultados obtenidos no contienen informacion relevante sobre el modelo, el articulo ni el corpus Samromur, por lo que no se anaden enlaces adicionales.
