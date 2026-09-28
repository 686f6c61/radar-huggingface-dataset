# IbrahimSeven/medgemma-1.5-4b-fundus-cot

## Resumen

`IbrahimSeven/medgemma-1.5-4b-fundus-cot` es un modelo multimodal de tipo image-text-to-text publicado en HuggingFace por el usuario IbrahimSeven, construido sobre la arquitectura etiquetada como `gemma3` (segun los tags) y ajustado mediante SFT con la libreria `trl`. El identificador del repositorio sugiere una especializacion en analisis de fondo de ojo (fundus) con razonamiento en cadena de pensamiento (chain-of-thought), probablemente derivada de la familia MedGemma 1.5 de Google, si bien la model card no confirma ninguna de estas dos afirmaciones.

El problema que aborda es acotado: asistencia diagnostica sobre imagenes de retina. Ahora bien, la model card publicada es la plantilla automatica de HuggingFace, con todos los campos de descripcion, uso, entrenamiento, evaluacion y licencia marcados como `[More Information Needed]`. Esto significa que no hay informacion verificable sobre datos de entrenamiento, composicion del dataset, proceso de ajuste, idiomas, licencia ni evaluacion.

El modelo tiene 4.300.079.472 parametros reales segun los pesos en safetensors, un tamano de repositorio de 8,6 GB (compatible con pesos en bf16/fp16) y, en el momento de redactar esta ficha, 0 descargas y 0 likes. Se creo el 27 de septiembre de 2026 y se actualizo el 28 de septiembre de 2026. Su relevancia practica es limitada hasta que el autor publique documentacion: no hay evidencia de evaluacion clinica ni de validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Etiquetada como `gemma3` en los tags del repositorio; detalles concretos no disponibles |
| Parametros totales | 4.300.079.472 (segun pesos safetensors) |
| Parametros activos | No aplica (no consta que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponibles; el repositorio solo contiene safetensors |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Tamano del repositorio | 8,6 GB |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna. Los tags del repositorio indican `gemma3` y `image-text-to-text`, lo que situa el modelo en la familia de modelos multimodales decoder-only de Google con codificador visual, pero la model card no detalla numero de capas, dimension del modelo, atencion, resolucion de imagen de entrada ni estrategia de fusion visio-linguistica. Tampoco se especifica si el contexto es extenso, ni si se empleo atencion lineal o alguna variante de eficiencia.

Respecto al entrenamiento, los tags `trl` y `sft` indican que se realizo un ajuste supervisado (supervised fine-tuning) con la libreria TRL, presumiblemente partiendo de un modelo base (el nombre apunta a MedGemma 1.5 4B, no confirmado). No se documentan volumen de tokens, composicion del dataset, tecnicas de RLHF/DPO, hiperparametros, infraestructura ni proceso de filtrado. El sufijo `-cot` del identificador sugiere que los datos de ajuste incluyen cadenas de razonamiento, pero es una inferencia, no un dato confirmado.

## Capacidades

- Generacion de texto y descripcion de imagenes medicas de fondo de ojo (retinografia), segun el pipeline image-text-to-text y el nombre del repositorio.
- Razonamiento en cadena de pensamiento (chain-of-thought) aplicado al dominio oftalmologico, a juzgar por el sufijo `-cot` del identificador; no confirmado en la model card.
- Conversacion multiturno: el tag `conversational` indica formato de dialogo.
- Compatibilidad con Text Generation Inference y endpoints, segun los tags `text-generation-inference` y `endpoints_compatible`.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponibles.
- Capacidades multilingues: no disponibles.
- Otras modalidades (audio, video): no disponibles.

## Casos de uso

- Triaje asistido de retinografias: el modelo recibe una imagen de fondo de ojo y devuelve una descripcion textual con hallazgos, lo que permitiria preclasificar estudios antes de la revision por un oftalmologo. Requiere validacion clinica previa, inexistente por ahora.
- Generacion de informes preliminares: a partir de una retinografia, producir un borrador de informe con razonamiento explicito paso a paso que el especialista revise y edite, aprovechando el supuesto modo chain-of-thought.
- Educacion medica: uso como herramienta de apoyo en residentes de oftalmologia para practicar la identificacion de estructuras y patologias retinianas, mostrando la cadena de razonamiento que lleva a cada conclusion.
- Investigacion en vision clinica: servir de punto de partida para experimentos de ajuste fino sobre datasets de retina, dado que el repositorio solo pesa 8,6 GB y es manejable en hardware de laboratorio.
- Preprocesado de cohortes: etiquetado automatico de grandes volumenes de retinografias para construir indices de busqueda o seleccionar subconjuntos de interes antes de la anotacion manual.
- Integracion en prototipos de teledermatologia/teleoftalmologia: desplegado tras TGI o transformers para ofrecer una primera pasada descriptiva sobre imagenes enviadas desde centros remotos.
- Documentacion estructurada: convertir hallazgos visuales en texto estructurado (JSON o plantillas) para alimentar historiales clinicos electronicos, siempre con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion cumplimentada, y no hay metricas de exactitud, sensibilidad, especificidad, AUC ni comparaciones con otros modelos en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 8,6-10 GB, segun los 4.300 millones de parametros y el tamano del repositorio (8,6 GB).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4,5-5,5 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 2,5-3,5 GB (incluyendo overhead del codificador visual y del contexto).
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 24 GB para ejecucion holgada en bf16 y lotes grandes.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en bf16; cabe en RTX 3060 12 GB, RTX 4070 y similares si se aplica cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers (libreria declarada), Text Generation Inference (tag `text-generation-inference`), endpoints compatibles. Ollama, llama.cpp y vLLM no estan confirmados y requeririan conversion previa, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo, por lo que la comparacion se limita a caracteristicas estructurales verificables.

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IbrahimSeven/medgemma-1.5-4b-fundus-cot | 4,30 B | No disponible | Image-text-to-text | No disponible | HuggingFace, safetensors |
| google/medgemma-1.5-4b (modelo base presumible) | ~4,3 B | No disponible en esta ficha | Image-text-to-text | No disponible en esta ficha | HuggingFace |
| Google Gemma 3 4B (familia de la que deriva el tag `gemma3`) | ~4,3 B | No disponible en esta ficha | Texto y vision | No disponible en esta ficha | HuggingFace |
| Otros VLM medicos de ~3-4 B | No disponible | No disponible | Image-text-to-text | No disponible | No disponible |

No se dispone de datos verificados de benchmarks que permitan una comparacion de rendimiento con alternativas.

## Limitaciones y advertencias

- La model card es la plantilla automatica sin rellenar: no hay informacion sobre datos, sesgos, evaluacion ni uso previsto, lo que impide auditar el modelo.
- Licencia no especificada. Sin licencia explicita no se puede asumir permiso de uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinacion alto en dominio clinico: un modelo de 4 B ajustado con SFT, sin evaluacion publicada, puede generar hallazgos inexistentes o descripciones plausibles pero incorrectas de una retinografia.
- No es un dispositivo medico ni ha pasado validacion regulatoria. Su uso en decision clinica sin supervision de un especialista cualificado es inadecuado.
- Idiomas soportados no declarados: se desconoce el comportamiento en castellano y si el ajuste se hizo solo en ingles.
- Longitud de contexto no documentada, lo que impide planificar conversaciones largas o analisis de series de imagenes.
- 0 descargas y 0 likes: no existe comunidad que haya reproducido o validado el modelo.
- Fecha de creacion futura (2026) en los metadatos, lo que sugiere que la ficha puede estar en un estado provisional o que los metadatos no son fiables.
- Ausencia de formatos GGUF: el despliegue en CPU o en hardware muy limitado exige convertir los pesos manualmente.
- La busqueda web no devolvio ninguna fuente tecnica relevante sobre este modelo; los resultados obtenidos correspondian a sitios sin relacion con inteligencia artificial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IbrahimSeven/medgemma-1.5-4b-fundus-cot
- Referencia citada en la plantilla de la model card (calculadora de impacto ambiental, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- La busqueda web realizada no devolvio enlaces relevantes sobre el modelo, su entrenamiento o su evaluacion.
