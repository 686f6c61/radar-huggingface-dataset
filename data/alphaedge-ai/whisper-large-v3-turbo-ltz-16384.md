# alphaedge-ai/whisper-large-v3-turbo-ltz-16384

## Resumen

Whisper-large-v3-turbo-ltz-16384 es una variante podada (*trimmed*) del modelo de reconocimiento automatico del habla openai/whisper-large-v3-turbo, publicada por alphaedge-ai. El modelo conserva la arquitectura encoder-decoder transformer original de Whisper pero reduce el vocabulario del tokenizer de 51.865 a 16.384 tokens, lo que se traduce en una disminucion del 68,41% en el tamano del vocabulario y del 5,61% en el numero de parametros (de 808.878.080 a 763.461.120). El objetivo declarado es optimizar el modelo para el idioma luxemburgues (codigo ISO `lb`), eliminando del vocabulario aquellos tokens poco frecuentes en ese idioma.

La tecnica de *trimming* consiste en identificar, mediante un corpus de minado de 200.000 textos del dataset lbourdois/fineweb-2-trimming, que tokens del vocabulario original son realmente utilizados en el idioma objetivo, y reconstruir el modelo con un vocabulario reducido que solo contiene esos tokens. Esto reduce el uso de memoria y el tamano del checkpoint (1,5 GB en el repositorio) manteniendo, segun el autor, un rendimiento similar al original para el idioma seleccionado.

El modelo es relevante para despliegues de ASR en luxemburgues con recursos limitados, donde un checkpoint mas pequeno y un vocabulario especializado pueden facilitar la inferencia en entornos con poca VRAM. Sin embargo, la poda del vocabulario implica que el modelo pierde capacidad para transcribir otros idiomas de forma fiable, por lo que debe considerarse un modelo monoidioma especializado y no un sustituto general de Whisper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 763.461.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s, propia de Whisper) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | luxemburgues (`lb`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper large-v3-turbo: un transformer encoder-decoder con atencion estandar, disenado para transcripcion de audio. Whisper large-v3-turbo reduce el numero de capas del decoder respecto a large-v3 (de 32 a 4 capas en el decoder), lo que disminuye la latencia de decodificacion manteniendo el encoder completo. El modelo original fue entrenado por OpenAI con supervision debil a gran escala sobre audio y texto emparejados (paper arXiv:2212.04356).

La innovacion de esta variante no esta en el entrenamiento sino en la poda del vocabulario: se minaron 200.000 textos del dataset lbourdois/fineweb-2-trimming para determinar que tokens del vocabulario original (51.865) se usan en luxemburgues, y se reconstruyo el modelo con solo 16.384 tokens. No se documenta en la informacion disponible si hubo reentrenamiento adicional, ajuste fino o calibracion tras la poda; el autor indica que el modelo podado "deberia comportarse de forma similar al original" para el idioma seleccionado. No se especifican datos sobre RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Reconocimiento automatico del habla (ASR) para luxemburgues, con tarea de transcripcion configurable mediante `generate_kwargs={"language": "luxembourgish", "task": "transcribe"}`.
- Transcripcion de audio muestreado a 16 kHz, tal y como requiere Whisper.
- Integracion con el pipeline `automatic-speech-recognition` de la libreria transformers.
- Compatible con endpoints de Hugging Face (`endpoints_compatible` en los tags).
- Capacidad multilingue: limitada al luxemburgues; el autor advierte que el rendimiento en otros idiomas puede degradarse porque se eliminaron tokens no usados en el idioma objetivo.
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni modo de razonamiento (thinking); el modelo es exclusivamente ASR.

## Casos de uso

- Transcripcion de reuniones y actas en luxemburgues: el modelo puede procesar audio de 30 segundos por ventana, adecuado para reuniones divididas en segmentos, con un checkpoint de 1,5 GB que cabe en GPUs de gama media.
- Subtitulado de contenido audiovisual en luxemburgues: integrado en un pipeline de transformers, permite generar subtitulos para videos institucionales o educativos en este idioma de bajos recursos, donde los modelos ASR generales rinden peor.
- Archivado y busqueda de material oral: transcripcion de entrevistas, archivos historicos o grabaciones administrativas en luxemburgues para indexacion y busqueda textual posterior.
- Atencion al cliente en luxemburgues: transcripcion de llamadas o mensajes de voz en centros de contacto del pais, aprovechando el vocabulario especializado para reducir errores en terminos locales.
- Accesibilidad: generacion de transcripciones para personas con discapacidad auditiva en contenido en luxemburgues, con un modelo ligero que puede desplegarse en infraestructura local.
- Despliegue en el borde o en entornos con VRAM limitada: al tener 763 M de parametros y 1,5 GB de pesos, puede ejecutarse en GPUs consumer y en servidores modestos, a diferencia de variantes mas grandes de Whisper.
- Investigacion en ASR de bajos recursos: util como punto de partida para estudiar el efecto del *trimming* de vocabulario en idiomas con pocos datos, comparandolo con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de WER (word error rate) ni comparaciones cuantitativas con el modelo base en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3 GB (763 M de parametros a 4 bytes por parametro).
- VRAM estimada en fp16/bf16: aproximadamente 1,5-2 GB, mas el overhead de activaciones y del feature extractor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes; el modelo cabe holgadamente en GPUs consumer.
- Despliegue: compatible con transformers (pipeline `automatic-speech-recognition`), y por tanto con servidores basados en esa libreria (TGI no soporta ASR de forma nativa; vLLM no esta orientado a Whisper; llama.cpp/Ollama no soportan Whisper de forma estandar). La opcion documentada es transformers con `AutoModelForSpeechSeq2Seq` y `AutoProcessor`.
- Latencia y throughput: no disponibles en la informacion proporcionada. La arquitectura turbo (decoder de 4 capas) esta disenada para reducir latencia frente a large-v3, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-large-v3-turbo-ltz-16384 | 763.461.120 | 16.384 | luxemburgues | apache-2.0 | safetensors |
| openai/whisper-large-v3-turbo | 808.878.080 | 51.865 | multilingue (amplio) | apache-2.0 | safetensors |
| openai/whisper-large-v3 | no disponible en la informacion | no disponible | multilingue (amplio) | apache-2.0 | safetensors |

La comparativa se limita a los datos disponibles; no se dispone de metricas de rendimiento comparadas (WER) entre estas variantes en la informacion proporcionada. Frente al modelo base, la variante podada ofrece un checkpoint un 5,61% mas pequeno en parametros y un vocabulario un 68,41% menor, a costa de perder cobertura multilingue.

## Limitaciones y advertencias

- Modelo monoidioma: el vocabulario podado elimina tokens no usados en luxemburgues, por lo que el rendimiento en otros idiomas puede degradarse significativamente; el propio autor lo advierte.
- Riesgo de alucinacion: como todos los modelos Whisper, puede generar texto plausible no presente en el audio, especialmente en segmentos con silencio, ruido o audio de baja calidad.
- Sesgos: no se documentan analisis de sesgos; al derivar de Whisper, hereda los sesgos del entrenamiento original de OpenAI, no evaluados en esta variante.
- Licencia apache-2.0: permite uso comercial, pero se recomienda verificar las condiciones del modelo base y del dataset de minado (lbourdois/fineweb-2-trimming) antes de un despliegue en produccion.
- Sin benchmarks publicados: no hay metricas de WER que respalden la afirmacion de rendimiento similar al original; conviene evaluar en el dominio concreto antes de produccion.
- Requiere audio a 16 kHz: el pipeline de ejemplo usa librosa con `sr=16000`; no se documenta soporte para otras frecuencias de muestreo sin remuestreo previo.
- Ventana de audio de 30 segundos: limitacion estructural de Whisper; audios mas largos requieren segmentacion.
- Modelo con muy poca traccion (36 descargas, 0 likes en el momento de la consulta): no hay validacion comunitaria ni reportes de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-large-v3-turbo-ltz-16384
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Whisper: https://arxiv.org/abs/2212.04356
