# LinguaSpanApp/Yoruba-model-ssl-v2-nov-12

## Resumen

LinguaSpanApp/Yoruba-model-ssl-v2-nov-12 es un modelo de reconocimiento automatico del habla (ASR) publicado en Hugging Face por el usuario LinguaSpanApp. Se trata de un modelo basado en la arquitectura Whisper, tal como indica la etiqueta `whisper` y la referencia al paper fundacional de Whisper (arXiv:1910.09700, Radford et al., 2022). El nombre sugiere un entrenamiento de tipo self-supervised learning (SSL) orientado al yoruba, aunque la model card no confirma ni detalla este extremo.

El modelo cuenta con 763.857.920 parametros (aproximadamente 764 millones), lo que lo situa en el rango de Whisper large, y el repositorio ocupa 3,1 GB en formato safetensors. Esta pensado para la tarea de transcripcion de audio a texto, segun declara el pipeline `automatic-speech-recognition`.

La relevancia de este modelo radica en su posible orientacion a una lengua de bajos recursos como el yoruba, un idioma hablado por mas de 40 millones de personas principalmente en Nigeria y Benin, y que suele estar infrarrepresentado en los sistemas ASR comerciales. Sin embargo, la ausencia de una model card sustantiva, de datos de entrenamiento, de evaluacion y de licencia explicita limita seriamente su evaluacion y su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder para ASR) |
| Parametros totales | 763.857.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper estandar: ventanas de 30 s de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere yoruba; no confirmado en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Whisper, un transformer encoder-decoder disenado para transcripcion de voz multilingue. La etiqueta `whisper` y la referencia al paper arXiv:1910.09700 en los metadatos asi lo indican. Con 764 millones de parametros, el tamano corresponde a la variante large de la familia Whisper, aunque no se especifica la configuracion exacta de capas, dimensiones ni cabezas de atencion.

No se dispone de informacion sobre los datos de entrenamiento: ni el numero de horas de audio, ni la composicion del corpus, ni si se aplico preentrenamiento self-supervised (a pesar del sufijo `ssl` en el nombre), ni si hubo ajuste fino supervisado, RLHF o alguna otra etapa. La model card es la plantilla autogenerada de Hugging Face sin contenido sustantivo. Tampoco se documentan hiperparametros, infraestructura de computo ni innovaciones tecnicas destacables.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto), segun el pipeline declarado.
- Posible especializacion en yoruba, inferida unicamente del nombre del modelo; no confirmada en la documentacion.
- Capacidades multilingues: no disponible.
- Soporte de tool calling / function calling: no aplicable a un modelo ASR.
- Soporte de agentes y razonamiento multi-paso: no aplicable.
- Modo thinking, vision o audio adicional: no disponible.
- Capacidad de traduccion de voz: no disponible (Whisper original la soporta, pero no se confirma en este checkpoint).

## Casos de uso

- Transcripcion de audio en yoruba: si la especializacion linguistica se confirma, el modelo podria transcribir grabaciones de habla yoruba en entornos de investigacion linguistica o archivo cultural. Requiere validacion previa con datos propios, dado que no hay evaluacion publicada.
- Subtitulado de contenido audiovisual en yoruba: integrable en pipelines de generacion de subtitulos para medios de comunicacion nigerianos, previa comprobacion de calidad en el dominio concreto.
- Investigacion en ASR de bajos recursos: util como punto de partida o baseline para experimentos academicos sobre lenguas africanas, siempre citando la procedencia y asumiendo la falta de garantias.
- Prototipado de asistentes de voz para comunidades yorubahablantes: adecuado para pruebas de concepto en entornos controlados, no para despliegue en produccion sin evaluacion exhaustiva.
- Digitalizacion de archivos orales: transcripcion de entrevistas, tradiciones orales o material de archivo en yoruba para su indexacion y busqueda.
- Evaluacion comparativa de modelos ASR: como checkpoint de referencia en estudios que comparen arquitecturas Whisper ajustadas a lenguas africanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,5-2 GB solo para los pesos; con overhead de activaciones y cache, alrededor de 2-3 GB.
- VRAM estimada en fp32: unos 3-3,5 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas (GTX 1650, RTX 3050 en adelante).
- Opciones de despliegue: transformers (libreria declarada), potencialmente vLLM no aplica de forma estandar a Whisper; alternativas como faster-whisper, whisper.cpp u Ollama requeririan conversion a los formatos correspondientes (no confirmada su compatibilidad).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LinguaSpanApp/Yoruba-model-ssl-v2-nov-12 | 764 M | no disponible (ventanas de 30 s) | no disponible (posible yoruba) | no disponible | Hugging Face |
| openai/whisper-large-v3 | 1.550 M | ventanas de 30 s | multilingue (99 idiomas) | MIT | Hugging Face, ampliamente desplegado |
| openai/whisper-medium | 769 M | ventanas de 30 s | multilingue (99 idiomas) | MIT | Hugging Face |
| openai/whisper-small | 244 M | ventanas de 30 s | multilingue (99 idiomas) | MIT | Hugging Face |

El modelo se situa en el rango de parametros de whisper-medium, pero sin la documentacion, evaluacion ni licencia clara de los modelos oficiales de OpenAI. La comparacion de rendimiento no es posible por ausencia de benchmarks publicados.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre datos de entrenamiento, evaluacion, sesgos ni uso previsto.
- Licencia no especificada: no se puede garantizar el uso comercial; contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no confirmados oficialmente: la orientacion al yoruba se infiere solo del nombre del repositorio.
- Riesgo de alucinacion y errores de transcripcion: sin evaluacion publicada, no hay garantias de calidad ni de comportamiento en dominios ruidosos o con acentos diversos.
- Sesgos potencialmente desconocidos: al no documentarse la composicion del corpus, no se pueden evaluar sesgos de genero, dialectales o sociolectales.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validacion por parte de la comunidad.
- Fecha de creacion futura en los metadatos (2026-11-13): inconsistencia que sugiere posible error de publicacion o cuenta automatizada.
- No apto para produccion sin una evaluacion propia con datos representativos del dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LinguaSpanApp/Yoruba-model-ssl-v2-nov-12
- Paper de referencia de Whisper (Radford et al., 2022): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact
