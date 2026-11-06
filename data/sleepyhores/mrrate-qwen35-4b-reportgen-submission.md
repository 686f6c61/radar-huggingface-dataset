# sleepyhores/mrrate-qwen35-4b-reportgen-submission

## Resumen

MR-RATE Qwen3.5-4B Report Generation es un ajuste fino del modelo base Qwen/Qwen3.5-4B orientado a la generacion automatica de informes de resonancia magnetica. Lo desarrolla el equipo Medical Image Insights & FDU como envio a la pista de generacion de informes MR del reto Forithmus, y se distribuye como checkpoint fusionado listo para inferencia. El modelo resuelve la tarea de convertir estudios de RM (modalidades T1w, T2w y FLAIR) en un informe estructurado con seccion de hallazgos y cuerpo de texto libre.

Tecnicamente se trata de un VLM derivado de un transformer de 4.539.265.536 parametros (aproximadamente 4,54 mil millones), entrenado mediante un LoRA de cinco epocas que posteriormente se fusiono con los pesos base. El pipeline declarado es image-text-to-text, y el preprocesado convierte los volumenes seleccionados en una entrada tipo video. Es relevante ahora porque ejemplifica el uso de modelos multimodales abiertos de tamano medio en dominios medicos especializados, aunque su estado de envio fue fallido y no cuenta con validacion clinica.

La ficha se basa unicamente en la informacion publicada en Hugging Face y en la model card del autor; los datos no disponibles se indican explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) derivado de Qwen3.5-4B; el pipeline declarado es image-text-to-text |
| Parametros totales | 4.539.265.536 (aproximadamente 4,54 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors sin cuantizar; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | other (sin licencia adicional concedida por la model card; hay que revisar los terminos del modelo base y del dataset) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y se ajusta mediante un LoRA de cinco epocas que se fusiona para inferencia, generando un checkpoint unico de aproximadamente 4,54 mil millones de parametros. El checkpoint enviado es `checkpoint-4825`, inicializado desde el SFT `checkpoint-1930`. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovacion tecnica principal es el tratamiento de la entrada: el modelo espera una plantilla de inferencia y un preprocesado personalizados que toman las modalidades T1w, T2w y FLAIR, seleccionan volumenes y los convierten en una entrada tipo video. La salida es una seccion de hallazgos estructurada mas un informe; el contenedor del reto emite solo el cuerpo del informe en texto libre. El codigo de inferencia y una plantilla Docker acompanan al modelo en un repositorio GitHub, aunque la imagen base `med-swift:v4-20260821-2` no es publica.

## Capacidades

- Generacion de informes radiologicos de resonancia magnetica a partir de estudios multimodales (T1w, T2w, FLAIR).
- Entrada image-text-to-text: procesa imagenes medicas junto con instrucciones textuales.
- Conversion de volumenes seleccionados en una representacion tipo video para el modelo.
- Emision de una seccion de hallazgos estructurada y un cuerpo de informe en texto libre.
- Conversacion multi-turno segun el tag `conversational`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): vision medica confirmada por el pipeline; audio y thinking mode no disponibles.

## Casos de uso

- Generacion de borradores de informes de RM: el modelo recibe volumenes T1w, T2w y FLAIR y produce un informe estructurado que el radiologo revisa y edita, reduciendo el tiempo de dictado en estudios rutinarios.
- Investigacion en generacion de informes radiologicos: sirve como checkpoint de referencia para comparar tecnicas de preprocesado volumetrico y plantillas de inferencia en tareas de report generation.
- Reproducibilidad de retos academicos: el repositorio GitHub y la plantilla Docker permiten reconstruir el pipeline de inferencia para auditar resultados de la pista MR Report Generation.
- Sistemas de triaje y priorizacion: el texto de hallazgos puede alimentar colas de lectura priorizadas, siempre con supervision profesional y sin uso clinico directo.
- Formacion y docencia: el modelo puede generar ejemplos de informes a partir de estudios anonimizados para practicar la redaccion de hallazgos.
- Integracion en pipelines de investigacion multimodal: su tamano de 4,54 B y formato safetensors facilita el despliegue en entornos de laboratorio con una sola GPU de gama alta.
- Prototipado de asistentes de dictado estructurado: la salida separada en hallazgos y cuerpo de informe simplifica el parseo en aplicaciones de documentacion clinica experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el ultimo registro de plataforma para el envio identificado fue `failed`, sin puntuacion ni clasificacion oficial devuelta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 4,54 B en safetensors a precision completa ocupa unos 9,1 GB (tamano del repo); en fp16 rondaria los 9 GB de pesos mas memoria para activaciones y el procesado de volumenes tipo video.
- GPU recomendadas: no disponibles en la informacion publicada. Por tamano, encaja en GPUs de 24 GB o mas (por ejemplo RTX 4090, A100 40 GB, H100), aunque el procesado de volumenes 3D puede elevar los requisitos.
- Cabe en consumer GPU: previsiblemente si, en GPUs de 24 GB, sujeto a la memoria adicional del preprocesado volumetrico; no confirmado por el autor.
- Opciones de despliegue: el modelo requiere la plantilla de inferencia y el preprocesado del repositorio GitHub; se monta en un contenedor compatible con el directorio `/weights/model`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MR-RATE Qwen3.5-4B Report Generation | 4,54 B | no disponible | Informes de RM (image-text-to-text) | other | Hugging Face, safetensors, requiere pipeline propio |
| Qwen/Qwen3.5-4B (base) | aproximadamente 4 B (segun el nombre) | no disponible | Multimodal general | no disponible | Hugging Face |
| Alternativas especializadas en report generation de RM | no disponible | no disponible | Informes radiologicos | no disponible | no disponible |

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion no validado para uso clinico; no debe emplearse en decision clinica sin revision profesional.
- El envio registrado en la plataforma figura como `failed`, sin puntuacion ni clasificacion oficial.
- La licencia es `other` y la model card no concede licencia adicional; es necesario revisar los terminos del modelo base Qwen3.5-4B y del dataset MR-RATE antes de cualquier uso, incluido el comercial.
- El entorno exacto de entrenamiento e inferencia (imagen base `med-swift:v4-20260821-2`) no es publico, lo que limita la reproducibilidad completa.
- Los datos MR-RATE no se incluyen y requieren autorizacion del propietario del dataset.
- Riesgo de alucinacion en la generacion de hallazgos: no se documentan evaluaciones de fidelidad clinica.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto e idioma: no disponibles.
- El modelo depende de una plantilla de inferencia y un preprocesado personalizados; un uso fuera de ese pipeline puede degradar la calidad de salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sleepyhores/mrrate-qwen35-4b-reportgen-submission
- Repositorio GitHub con codigo de inferencia y plantilla Docker: https://github.com/trensetter/VLM3D-MR-Report-Medical-Image-Insights-FDU
- Registro de artefactos del envio (SHA-256): https://github.com/trensetter/VLM3D-MR-Report-Medical-Image-Insights-FDU/blob/main/docs/SUBMISSION_ARTIFACTS.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
