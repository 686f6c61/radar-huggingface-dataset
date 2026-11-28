# RakshithFury/maatu-15M-ift

## Resumen

Maatu 15M IFT es un modelo de lenguaje de 15.040.622 parametros, ajustado por instrucciones para mantener conversaciones breves y naturales en kannada. Lo desarrolla el usuario independiente RakshithFury y deriva del checkpoint base Maatu 15M Base 2B mediante un proceso de supervised fine-tuning (SFT) sobre conversaciones en kannada. Su proposito es demostrar que un modelo de escala muy reducida puede sostener dialogos multi-turno basicos, responder preguntas cortas a partir de contexto y redactar frases sencillas en un idioma de bajos recursos como el kannada.

El modelo emplea la arquitectura GPT del proyecto nanochat (transformer decoder-only) con una ventana de contexto de 512 tokens y un tokenizador BPE a nivel de byte especifico para kannada con un vocabulario de 4.864 tokens. Se distribuye en formato safetensors junto con un runtime de inferencia empaquetado, lo que permite ejecutarlo en CPU o en una GPU de consumo con BF16 sin infraestructura adicional.

Su relevancia es fundamentalmente practica y de investigacion: sirve como banco de pruebas reproducible de pipelines de SFT para lenguas indias de bajos recursos, con un coste de entrenamiento de unos 32 minutos en una unica RTX 5070 Ti de 16 GB. No esta pensado para produccion generalista ni para tareas que exijan conocimiento factual fiable, como el propio autor advierte en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT, implementacion nanochat) |
| Parametros totales | 15.040.622 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; la model card menciona BF16 para GPU) |
| Idiomas soportados | Kannada (kn) |
| Licencia | no disponible (el codigo de inferencia empaquetado usa licencia MIT; los pesos no declaran licencia) |
| Formato de pesos | safetensors (runtime PyTorch empaquetado) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en la arquitectura GPT del repositorio nanochat de Karpathy (commit fijado en la model card), con 15.040.622 parametros y contexto de 512 tokens. El tokenizador es un BPE a nivel de byte entrenado para kannada con 4.864 tokens. La inferencia empaquetada usa decodificacion greedy por defecto y soporta BF16 en GPU.

El ajuste por instrucciones se realizo en dos fases. La fase amplia uso 1.071.968 conversaciones del split kannada de SandLogic Indic Chat y 111.155 del export IndicAlign, con dos pasadas sobre la mezcla. La fase focalizada uso 230 ejemplos de Aya, 1.493 conversaciones de practica escritas por el autor y una muestra de replay de 480 ejemplos concisos de la fase amplia, con cuatro pasadas. En total se procesaron 1.184.846 conversaciones unicas y 191.538.934 tokens supervisados de asistente en 74.222 actualizaciones. El preprocesado normalizo Unicode, valido el script kannada en cada turno, rechazo turnos malformados o repetitivos y deduplico prompts de apertura entre splits. Se usaron las etiquetas `ಬಳಕೆದಾರ:` (usuario) y `ಸಹಾಯಕ:` (asistente), aplicando la perdida de next-token solo a las respuestas del asistente y a sus tokens de fin de turno.

El entrenamiento se ejecuto en una unica NVIDIA GeForce RTX 5070 Ti de 16 GB VRAM con AdamW fusionado en CUDA y activaciones BF16, durante aproximadamente 32 minutos excluyendo descarga y preparacion de datos. No se menciona RLHF ni DPO en la informacion disponible.

## Capacidades

- Generacion de texto conversacional breve en kannada, con saludos y respuestas naturales.
- Memoria de detalles a lo largo de pocos turnos dentro de la ventana de 512 tokens (por ejemplo, recordar un nombre o una preferencia indicada antes en la conversacion).
- Respuesta a preguntas cortas a partir de contexto proporcionado en el propio prompt.
- Redaccion de frases y mensajes sencillos en kannada (por ejemplo, una felicitacion de cumpleaños o una frase descriptiva).
- Respuestas factuales muy breves de una sola palabra cuando se le pide ese formato.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo thinking.
- Multilingue: no; unicamente kannada.

## Casos de uso

- Prototipado de asistentes conversacionales en kannada: el modelo permite validar rapidamente flujos de dialogo multi-turno de pocos turnos con contexto de 512 tokens antes de invertir en modelos mayores.
- Investigacion en SFT para lenguas de bajos recursos: sirve como referencia reproducible de un pipeline completo (normalizacion Unicode, validacion de script, deduplicacion, enmascarado de perdida solo en el asistente) sobre un corpus kannada publico.
- Docencia y experimentacion: su tamano de 15 M de parametros y su ejecucion en CPU o en una GPU de consumo lo hacen adecuado para cursos de ajuste fino y evaluacion de modelos de lenguaje.
- Generacion de respuestas cortas en plantillas: puede producir felicitaciones, frases de cortesia o mensajes breves en kannada para formularios y aplicaciones sencillas, siempre con revision humana.
- Extraccion de respuestas de un contexto breve: util para tareas tipo lectura comprensiva de un parrafo corto en kannada con respuesta de una palabra o frase.
- Pruebas de regresion de infraestructura de inferencia: al incluir runtime empaquetado y pesos safetensors ligeros (0,1 GB), es comodo para validar despliegues en CPU, CUDA y entornos con BF16.
- Baseline para comparativas de escalado: permite medir cuanto de una capacidad conversacional concreta se obtiene con 15 M de parametros frente a modelos mayores entrenados con los mismos datos.

## Benchmarks y rendimiento

La model card no incluye benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Los unicos datos de evaluacion publicados son la perdida en validacion y una prueba informal de cinco sondas de respuesta corta.

| Checkpoint | Perdida de asistente en held-out | Sondas exactas de respuesta corta |
|---|---:|---:|
| Maatu 15M Base 2B | 2,657 | 0/5 |
| SFT fase amplia | 1,583 | 0/5 |
| Checkpoint focalizado publicado | 1,694 | 3/5 |

El checkpoint publicado alcanza una perdida de test de 1,694 (perplejidad 5,44) sobre 65.602 conversaciones held-out. Las cinco sondas de chat son una comprobacion informal del comportamiento de respuesta corta, no un benchmark estandarizado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 (15 M de parametros, aproximadamente 30 MB de pesos mas overhead del runtime); el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con soporte BF16; la model card cita una RTX 5070 Ti de 16 GB para el entrenamiento y permite `--device cuda` para inferencia. Tambien funciona en GPU de gama baja y en CPU.
- Cabe en cualquier GPU de consumo; la inferencia por defecto es en CPU con decodificacion greedy.
- Opciones de despliegue: script `chat.py` empaquetado con runtime nanochat y PyTorch; requiere Python 3.11 o superior y `huggingface_hub` para descargar. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa de rendimiento no esta disponible. A continuacion se comparan solo caracteristicas objetivas de modelos de escala similar o del mismo ecosistema de lenguas indias, segun conocimiento general; los datos de rendimiento de esos modelos no se verifican aqui.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Maatu 15M IFT | 15,04 M | 512 | Kannada | no disponible | safetensors |
| Modelos GPT-2 pequenos (referencia de escala) | ~124 M | 1.024 | Ingles principalmente | MIT (segun variante) | safetensors, GGUF |
| Modelos indicos pequenos de ai4bharat (familia IndicBERT/IndicBART) | decenas a cientos de M | 512 | Multiples lenguas indias | mayoritariamente permisiva (verificar por modelo) | safetensors, PyTorch |

La comparativa directa con alternativas de 15 M de parametros ajustadas a instrucciones en kannada no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Errores factuales basicos: la propia model card documenta que respondio "ಏಳು" (siete) al preguntar cuantos meses tiene un ano.
- Riesgo de repeticiones y de ignorar instrucciones, especialmente fuera de formatos muy sencillos.
- Ventana de contexto de 512 tokens: no admite documentos largos ni conversaciones extensas; la memoria de detalles se limita a pocos turnos.
- Unico idioma soportado: kannada; no hay capacidades multilingues ni de traduccion documentadas.
- Licencia de los pesos no disponible: no se puede confirmar el uso comercial. El codigo de inferencia empaquetado es MIT, pero los datos de entrenamiento conservan sus terminos upstream.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso, lo que descarta su uso en pipelines de automatizacion complejos.
- Sin datos de sesgos publicados; al entrenarse sobre corpus conversacionales de terceros puede heredar sesgos de esas fuentes.
- Modelo de investigacion con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en produccion ni de validacion externa.
- La evaluacion publicada se limita a perdida en held-out y cinco sondas informales; no hay benchmarks estandarizados que permitan comparaciones rigurosas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RakshithFury/maatu-15M-ift
- Modelo base: https://huggingface.co/RakshithFury/Maatu-15m-base-2b
- Dataset SandLogic Indic Chat (split kannada): https://huggingface.co/datasets/SandLogicTechnologies/Indic_Chat_Dataset/viewer/default/kannada
- Snapshot de IndicAlign y Aya (SFT): https://huggingface.co/datasets/SuhasBhairav/kannada-llm-base-model-dataset-clean/tree/75c039e2f2379757cec272921d2bd431d8aaaf98/sft
- Codigo base Udgam English 125M: https://github.com/udgamlabs/udgam-english-125m
- Organizacion Udgam Labs en Hugging Face: https://huggingface.co/udgamlabs
- Arquitectura nanochat (commit fijado): https://github.com/karpathy/nanochat/tree/92d63d4e8bb4df75c3b71618f31ddde2378b2bcd
