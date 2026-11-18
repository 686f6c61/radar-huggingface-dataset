# alphaedge-ai/whisper-large-v3-turbo-afr-16384

## Resumen

whisper-large-v3-turbo-afr-16384 es una variante "trimmed" (podada) de openai/whisper-large-v3-turbo, publicada por alphaedge-ai, especializada en el reconocimiento automatico del habla (ASR) en afrikaans. La poda consiste en reducir el vocabulario del tokenizer de 51.865 a 16.384 tokens, conservando unicamente los tokens relevantes para el idioma objetivo, lo que se traduce en una reduccion del 68,41% del vocabulario y del 5,61% del numero de parametros totales (de 808.878.080 a 763.461.120).

El modelo mantiene la arquitectura encoder-decoder transformer propia de Whisper, con el mismo mecanismo de atencion y el mismo preprocesado de audio (resampleo obligatorio a 16 kHz), por lo que es compatible con el pipeline `automatic-speech-recognition` de transformers. La reduccion de vocabulario disminuye la huella de memoria del modelo, lo que facilita su despliegue en entornos con recursos limitados.

Es relevante para equipos que necesiten transcripcion de audio en afrikaans con un coste de memoria inferior al del modelo original de OpenAI, a cambio de renunciar a la capacidad multilingue del checkpoint base. El modelo se distribuye bajo licencia Apache 2.0 y esta etiquetado como compatible con endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 763.461.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper; no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en el formato original; no se listan variantes GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | af (afrikaans) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-large-v3-turbo, un transformer encoder-decoder disenado para ASR y traduccion de voz, y aplica la tecnica de trimming descrita en el blog de Hugging Face "Introduction to Trimming". Esta tecnica no reentrena el modelo desde cero: selecciona los tokens del vocabulario que son relevantes para el idioma objetivo y elimina el resto, ajustando en consecuencia las dimensiones de las capas de embedding y de la cabeza de salida. El resultado es un checkpoint con 16.384 tokens de vocabulario frente a los 51.865 del original.

La seleccion de tokens se realizo mediante mineria sobre 200.000 textos del dataset lbourdois/fineweb-2-trimming, filtrando los tokens que aparecen con frecuencia en afrikaans. No se dispone de informacion sobre el numero de tokens de audio utilizados en el entrenamiento original de Whisper large-v3-turbo, la composicion exacta del dataset de OpenAI ni si hubo etapas de RLHF o DPO; esos detalles pertenecen al modelo base y no se reproducen en la model card de esta variante. La innovacion tecnica destacable es, por tanto, la reduccion de vocabulario como estrategia de compresion sin reentrenamiento completo.

## Capacidades

- Transcripcion de audio en afrikaans (tarea `transcribe`) mediante el pipeline de ASR de transformers.
- Traduccion de voz a texto (tarea `translate` de Whisper) hacia ingles, aunque la model card no garantiza el rendimiento en este modo tras la poda.
- Preprocesado de audio estandar de Whisper: entrada resampleada a 16 kHz.
- Compatibilidad con `AutoProcessor`, `AutoModelForSpeechSeq2Seq` y `pipeline` de transformers.
- Etiquetado como `endpoints_compatible`, lo que indica compatibilidad con los endpoints de Hugging Face.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio multimodal mas alla del ASR.
- Capacidad multilingue limitada: la poda elimina tokens no usados en afrikaans, por lo que el rendimiento en otros idiomas puede degradarse notablemente.

## Casos de uso

- Transcripcion de reuniones y notas de voz en afrikaans: el modelo convierte audio resampleado a 16 kHz en texto, con una huella de memoria inferior a la del checkpoint original gracias a la reduccion del vocabulario.
- Subtitulado automatico de contenido audiovisual en afrikaans: integrable en pipelines que ya usan `pipeline("automatic-speech-recognition")`, con generacion de subtitulos por segmentos de audio.
- Atencion al cliente en afrikaans: transcripcion de llamadas o mensajes de voz para su posterior procesamiento por un LLM o sistema de tickets, aprovechando el menor coste de despliegue.
- Archivado y busqueda de audio historico: conversion de grabaciones en afrikaans a texto indexable, con un modelo de 1,5 GB de repo que cabe en infraestructura modesta.
- Investigacion en ASR de bajos recursos: punto de partida para estudiar el impacto de la poda de vocabulario en la calidad de transcripcion de un idioma concreto.
- Despliegue en el borde o en contenedores con VRAM limitada: la reduccion de parametros y de vocabulario facilita ejecutar el modelo en GPUs de gama media o en CPU para cargas por lotes.
- Generacion de transcripciones para evaluacion de calidad de datos: uso del modelo como anotador automatico en la construccion de corpus en afrikaans.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta las metricas de reduccion de vocabulario (68,41%) y de parametros (5,61%), sin valores de WER (word error rate) ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 763 millones de parametros en safetensors, el checkpoint ocupa aproximadamente 1,5 GB en disco y requiere un orden de magnitud similar de memoria en fp32/fp16, sin contar activaciones ni buffers de audio.
- GPU recomendadas: no especificadas en la model card. Por tamano, el modelo es apto para GPUs consumer de gama media (por ejemplo, RTX 3060 en adelante) y para GPUs de datacenter (A100, H100) en despliegues por lotes.
- Cabe en GPU consumer: si, por el tamano del checkpoint; no se dispone de mediciones oficiales de VRAM pico.
- Opciones de despliegue: transformers (pipeline de ASR), y por compatibilidad con safetensors, cualquier runtime que cargue el checkpoint; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Contexto de audio |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-large-v3-turbo-afr-16384 | 763.461.120 | 16.384 tokens | af | apache-2.0 | no disponible |
| openai/whisper-large-v3-turbo | 808.878.080 | 51.865 tokens | multilingue | apache-2.0 | no disponible |
| openai/whisper-large-v3 | no disponible en la informacion | no disponible | multilingue | apache-2.0 | no disponible |

La comparativa se limita al modelo base y a la version large-v3 de la familia Whisper, ya que la informacion proporcionada no incluye otros modelos de ASR comparables. La diferencia principal frente al base es la reduccion de vocabulario y parametros, a cambio de perder cobertura multilingue.

## Limitaciones y advertencias

- La poda del vocabulario elimina tokens no usados en afrikaans; el modelo puede rendir mal en otros idiomas, incluido el ingles en tareas de traduccion.
- No se han publicado metricas de WER que confirmen que el rendimiento es equivalente al del modelo original en afrikaans; la model card solo afirma que "deberia" comportarse de forma similar.
- Riesgo de alucinacion en audio con ruido, silencios largos o habla no afrikaans, comportamiento comun en la familia Whisper.
- Sesgos inheridos del modelo base y del corpus de mineria (fineweb-2-trimming), no evaluados en esta variante.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base de OpenAI y citar adecuadamente.
- Sin datos publicados sobre cuantizaciones, latencia, throughput ni contexto de audio maximo en esta variante concreta.
- El modelo tiene 34 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/alphaedge-ai/whisper-large-v3-turbo-afr-16384
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de mineria: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Whisper: https://arxiv.org/abs/2212.04356
