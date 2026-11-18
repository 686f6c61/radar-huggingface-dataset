# alphaedge-ai/whisper-large-v3-turbo-tgl-16384

## Resumen

whisper-large-v3-turbo-tgl-16384 es una version "trimmed" (podada) de openai/whisper-large-v3-turbo, publicada por alphaedge-ai y especializada en tagalo. El modelo parte del checkpoint original de OpenAI (un encoder-decoder transformer para reconocimiento automatico del habla) y reduce su vocabulario de 51.865 a 16.384 tokens mediante la tecnica de trimming descrita por Hugging Face, conservando unicamente los tokens relevantes para el tagalo. El resultado es un modelo un 5,61% mas pequeno en parametros (763,46 M frente a 808,88 M) y con un footprint de memoria notablemente inferior.

La relevancia de esta ficha es practica: el modelo esta pensado para despliegues de ASR en tagalo donde el ahorro de memoria y el rendimiento en inferencia importan, a costa de perder capacidad multilingue. Al haber recortado el vocabulario a los tokens frecuentes en tagalo, el modelo deja de ser util para otros idiomas, pero mantiene la arquitectura y el comportamiento del Whisper original para la lengua objetivo.

El repo ocupa 1,5 GB, usa safetensors y la libreria transformers, y esta publicado bajo licencia Apache 2.0. El modelo base es el turbo de Whisper large-v3, que ya de por si es una variante optimizada para velocidad (menos capas en el decoder) respecto a large-v3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), variante turbo de large-v3 |
| Parametros totales | 763.461.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper; no se explicita en la informacion) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no se listan cuantizaciones) |
| Idiomas soportados | tl (tagalo) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper de OpenAI: un transformer encoder-decoder con atencion estandar, disenado para transcripcion y traduccion de voz. La variante large-v3-turbo reduce el numero de capas del decoder respecto a large-v3, lo que acelera la decodificacion manteniendo calidad cercana. Sobre ese checkpoint, alphaedge-ai aplica trimming de vocabulario: se seleccionan 110.351 textos del dataset lbourdois/fineweb-2-trimming para determinar que tokens del vocabulario original son relevantes en tagalo, y se recorta el vocabulario de 51.865 a 16.384 tokens (reduccion del 68,41%). Esto elimina los embeddings de tokens no usados y reduce el tamano del modelo un 5,61%.

No se indica en la informacion proporcionada si hubo reentrenamiento adicional, fine-tuning supervisado o ajuste con RLHF/DPO tras el trimming; la model card presenta el modelo como una poda del checkpoint original, no como un reentrenamiento. Tampoco se detalla el numero de tokens de audio usados en el entrenamiento original de Whisper ni la composicion exacta del dataset de minado mas alla del numero de textos.

## Capacidades

- Reconocimiento automatico del habla (ASR) en tagalo, con transcripcion de audio a texto.
- Traduccion de voz a texto (task "translate" en la API de Whisper), aunque la model card solo ejemplifica "transcribe".
- Procesamiento de audio a 16 kHz, con la ventana de 30 s propia de Whisper.
- No soporta tool calling ni function calling: es un modelo puramente de speech-to-text.
- No soporta agentes ni razonamiento multi-step.
- Capacidad multilingue limitada: el vocabulario recortado elimina tokens de otros idiomas, por lo que el rendimiento fuera del tagalo se degrada.
- No dispone de vision, audio generativo ni modo "thinking".

## Casos de uso

- Transcripcion de reuniones y llamadas en tagalo: el modelo convierte audio de 16 kHz en texto, adecuado para actas automaticas y subtitulado en entornos donde el tagalo es la lengua principal.
- Subtitulado de video en tagalo: integrable en pipelines de postproduccion para generar subtitulos con menor huella de memoria que el Whisper large-v3-turbo completo.
- Atencion al cliente en tagalo: transcripcion de grabaciones de call centers para analitica y control de calidad, con un modelo mas ligero que el original.
- Investigacion en ASR de bajos recursos: sirve como punto de partida para experimentos de trimming y evaluacion de vocabularios reducidos en lenguas filipinas.
- Despliegue en edge o en GPUs de gama media: al ocupar 1,5 GB en safetensors y 763 M de parametros, es viable en entornos con VRAM limitada donde el large-v3-turbo completo no cabe con holgura.
- Generacion de transcripciones para datasets de entrenamiento: util para etiquetar audio en tagalo a escala antes de entrenar otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que el modelo "deberia rendir de forma similar al original" para tagalo, pero no aporta cifras de WER, MMLU ni otras metricas.

## Requisitos de hardware

- VRAM estimada: el repo pesa 1,5 GB en safetensors; en fp16 la inferencia requiere del orden de 2-3 GB de VRAM, y en cuantizacion de 8 bits o 4 bits puede bajar a 1-2 GB (estimacion, no confirmada en la informacion).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; A100, H100 o RTX 4090 sobran para este tamano.
- Cabe en GPU consumer: si, en GTX 1660, RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: transformers (pipeline de automatic-speech-recognition), y por compatibilidad con Whisper, tambien llama.cpp, faster-whisper y vLLM (no confirmado en la informacion para este checkpoint trimmed).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-large-v3-turbo-tgl-16384 | 763,46 M | no disponible (ventana 30 s) | tl | apache-2.0 | Hugging Face |
| openai/whisper-large-v3-turbo | 808,88 M | no disponible (ventana 30 s) | multilingue | apache-2.0 | Hugging Face |
| openai/whisper-large-v3 | no disponible en la informacion | no disponible (ventana 30 s) | multilingue | apache-2.0 | Hugging Face |

La diferencia principal frente al turbo original es el vocabulario reducido (16.384 frente a 51.865 tokens) y el menor tamano (5,61% menos parametros), a cambio de perder cobertura multilingue. No se dispone de datos de rendimiento comparado en la informacion.

## Limitaciones y advertencias

- El recorte de vocabulario elimina tokens de otros idiomas: el modelo no debe usarse para lenguas distintas del tagalo.
- Riesgo de alucinacion: como todos los modelos Whisper, puede generar texto plausible en segmentos de silencio o ruido.
- No se han publicado metricas de WER ni evaluaciones formales en la model card; el rendimiento real en tagalo no esta cuantificado.
- Sesgos: hereda los sesgos del dataset de entrenamiento original de Whisper y del corpus de minado (fineweb-2), no documentados.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset de minado tienen sus propias condiciones que conviene revisar.
- El modelo no esta reentrenado para tagalo: solo se poda el vocabulario, por lo que la calidad depende del conocimiento multilingue previo de Whisper.
- Solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones oficiales en el repo.

## Enlaces

- Hugging Face: https://huggingface.co/alphaedge-ai/whisper-large-v3-turbo-tgl-16384
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog de trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Whisper: https://arxiv.org/abs/2212.04356
