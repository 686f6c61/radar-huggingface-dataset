# alphaedge-ai/whisper-large-v3-turbo-bak-16384

## Resumen

whisper-large-v3-turbo-bak-16384 es un modelo de reconocimiento automatico del habla (ASR) derivado de openai/whisper-large-v3-turbo, publicado por alphaedge-ai. Se trata de una version "trimmed" (podada) del modelo original en la que se ha reducido el vocabulario del tokenizador de 51.865 a 16.384 tokens, lo que supone una reduccion del 68,41% en el tamano del vocabulario y del 5,61% en el numero total de parametros (de 808.878.080 a 763.461.120). El modelo esta especializado para el idioma bashkir (codigo ISO 639-1 "ba") y ha sido optimizado mediante la tecnica de trimming descrita por Loick Bourdois y colaboradores en el blog de Hugging Face.

La relevancia de este modelo radica en su menor huella de memoria en comparacion con el original, manteniendo presumiblemente un rendimiento similar para el idioma objetivo. Al eliminar del vocabulario los tokens poco frecuentes en bashkir, se reduce el tamano del embedding y de la capa de salida, lo que abarata el despliegue en entornos con recursos limitados. El repositorio ocupa 1,5 GB y los pesos estan en formato safetensors.

No obstante, conviene subrayar que se trata de un modelo altamente especializado: al haber eliminado tokens no usados en bashkir, su rendimiento en otros idiomas se degrada severamente. Es, por tanto, una herramienta de nicho para transcripcion de audio en bashkir, no un modelo ASR multilingue de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), segun arxiv:2212.04356 |
| Parametros totales | 763.461.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bashkir (ba) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper de OpenAI: un transformer encoder-decoder disenado para ASR, descrito en el paper "Robust Speech Recognition via Large-Scale Weak Supervision" (arxiv:2212.04356). La innovacion concreta de esta version no reside en la arquitectura ni en el entrenamiento, sino en la reduccion del vocabulario mediante la tecnica de trimming. Segun la model card, se utilizaron 179.964 textos del dataset lbourdois/fineweb-2-trimming para determinar que tokens del vocabulario original eran relevantes para bashkir; los tokens no utilizados se eliminaron, reduciendo el vocabulario de 51.865 a 16.384 tokens.

No se detalla en la informacion disponible si hubo reentrenamiento adicional, ajuste fino supervisado, RLHF o DPO tras el trimming. La model card indica que el modelo podado "deberia comportarse de forma similar al original" para el idioma objetivo, pero no especifica el proceso de calibracion ni los datos de audio empleados. El tag "base_model_relation: quantized" sugiere una relacion de derivacion respecto al modelo base, aunque el termino "quantized" en este contexto parece referirse a la reduccion del vocabulario mas que a una cuantizacion numerica de los pesos.

## Capacidades

- Reconocimiento automatico del habla (transcripcion) para audio en bashkir.
- Tarea de transcripcion configurable mediante `generate_kwargs={"language": "bashkir", "task": "transcribe"}`.
- Uso a traves de la pipeline `automatic-speech-recognition` de la libreria transformers.
- Compatible con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue como servicio.
- No se documentan capacidades de traduccion, tool calling, agentes, vision ni audio mas alla de la transcripcion.
- Capacidad multilingue muy limitada: solo bashkir; otros idiomas probablemente degradados por la poda del vocabulario.

## Casos de uso

- Transcripcion de reuniones y entrevistas en bashkir: el modelo puede convertir audio en texto para actas y documentacion, aprovechando su especializacion en el idioma y su menor huella de memoria frente al original.
- Subtitulado de contenido audiovisual en bashkir: integrable en pipelines de postproduccion para generar subtitulos automaticos con un coste de inferencia reducido.
- Archivado y busqueda de audio historico: transcripcion de archivos sonoros en bashkir para indexacion y busqueda textual posterior.
- Atencion al cliente en centros de llamadas de habla bashkir: transcripcion de conversaciones para analisis de calidad y cumplimiento, con despliegue en infraestructura modesta.
- Investigacion linguistica: generacion de corpus transcritos de bashkir para estudios de linguistica computacional y entrenamiento de otros modelos.
- Asistentes de voz locales: integracion en aplicaciones de dictado o asistentes para usuarios de bashkir, donde el tamano reducido permite ejecucion en servidores con menos VRAM.
- Despliegue en el borde o en contenedores ligeros: el menor tamano del repositorio (1,5 GB) y de parametros facilita su inclusion en entornos con restricciones de memoria, siempre que el audio sea en bashkir.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de WER (word error rate) ni comparaciones cuantitativas con el modelo original para bashkir.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 763 millones de parametros, en fp32 serian aproximadamente 3 GB de pesos, y en fp16 alrededor de 1,5 GB, mas memoria para activaciones y buffer de audio.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, una GPU consumer moderna (por ejemplo, RTX 3060 o superior) seria suficiente en fp16, aunque no hay confirmacion oficial.
- Cabe en GPU consumer: probablemente si, dado el tamano de parametros, pero no confirmado en la model card.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), endpoints compatibles segun los tags. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-large-v3-turbo-bak-16384 | 763.461.120 | no disponible | bashkir | Apache 2.0 | Hugging Face |
| openai/whisper-large-v3-turbo | 808.878.080 | no disponible | multilingue | Apache 2.0 | Hugging Face |
| openai/whisper-large-v3 | no disponible en esta ficha | no disponible | multilingue | Apache 2.0 | Hugging Face |

El modelo podado reduce parametros y vocabulario respecto a whisper-large-v3-turbo, a costa de perder cobertura multilingue. Frente a whisper-large-v3, la comparacion cuantitativa no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Especializado exclusivamente en bashkir: la poda del vocabulario elimina tokens de otros idiomas, por lo que el rendimiento en lenguas distintas al bashkir sera probablemente deficiente.
- No se han publicado metricas de calidad (WER) que confirmen que el rendimiento es equivalente al original en bashkir.
- Riesgo de alucinacion y errores de transcripcion inherente a los modelos ASR, especialmente con audio ruidoso o acentos no representados en los datos.
- Sesgos potenciales derivados de los datos de mineria (fineweb-2-trimming) y del modelo base; no documentados en la model card.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar el cumplimiento de las condiciones de la licencia del modelo base.
- El tag `base_model_relation: quantized` puede inducir a confusion: no se trata de una cuantizacion numerica de pesos, sino de una reduccion de vocabulario.
- Numero de descargas muy bajo (28) y sin likes, lo que sugiere poca validacion comunitaria; no hay evidencia de uso en produccion.
- No se documentan limitaciones de longitud de audio mas alla de las propias de Whisper (ventana de 30 s), aunque no se confirma en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-large-v3-turbo-bak-16384
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de mineria: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Whisper: https://arxiv.org/abs/2212.04356
