# emmilly/cdli-impaired-asr-zipformer-small-streaming_rw_cvafv500h-aug-cdli30s_s42

## Resumen

El modelo `emmilly/cdli-impaired-asr-zipformer-small-streaming_rw_cvafv500h-aug-cdli30s_s42` es un sistema de reconocimiento automático del habla (ASR) en streaming para kinyarwanda, desarrollado por el usuario emmilly y orientado específicamente al habla no estándar (tartamudeo). Se basa en la arquitectura Zipformer-small de icefall, un transformer causal de aproximadamente 23 millones de parámetros con estructura de transductor (encoder, decoder y joiner) y decodificación en tiempo real. El modelo se distribuye en formato ONNX para su uso con sherpa-onnx, lo que lo hace desplegable en entornos de bajos recursos.

El modelo se entrena en dos fases: primero sobre unas 500 horas de kinyarwanda estándar (Common Voice 27 y AfriVoice v0.2) con una copia aumentada de cada clip (velocidad, tono, ruido, banda telefónica, ganancia, clipping y padding), y después se afina sobre el conjunto de entrenamiento de habla no estándar de CDLI, con clips de hasta 30 segundos y perturbación de velocidad. La relevancia actual radica en que aborda un idioma de bajos recursos (kinyarwanda) y una condición poco cubierta por los sistemas comerciales (habla con tartamudeo), y lo hace con un modelo causal de bajo coste computacional apto para streaming.

La salida del modelo está normalizada (minúsculas y sin puntuación). El repositorio ocupa 6,5 GB e incluye pesos en ONNX (con variantes int8) y un checkpoint PyTorch en formato icefall. La licencia es "other", con datos de entrenamiento sujetos a los términos de CDLI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Zipformer-small causal, transductor (encoder-decoder-joiner), streaming |
| Parámetros totales | ≈ 23 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de streaming por chunks; chunk-size 16,32,64,-1) |
| Tipos de cuantización | ONNX float e int8 (variantes `{encoder,decoder,joiner}.onnx` e `.int8.onnx`) |
| Idiomas soportados | kinyarwanda (rw) |
| Licencia | other (datos de entrenamiento bajo términos de CDLI) |
| Formato de pesos | ONNX (sherpa-onnx) y PyTorch (`.pt`, state dict de icefall) |

## Arquitectura y entrenamiento

El modelo es un Zipformer-small causal, es decir, un transformer con atención enmascarada que solo puede ver el pasado, lo que permite decodificación en streaming. La configuración del encoder consta de 6 etapas con `num-encoder-layers` de 2 capas cada una, `encoder-dim` de 192,256,256,256,256,256, `feedforward-dim` de 512,768,768,768,768,768 y `encoder-unmasked-dim` de 192 en todas las etapas. El tamaño de chunk es 16,32,64,-1 y el contexto izquierdo es 64,128,256,-1. La cabeza es un transductor con encoder, decoder y joiner, entrenado con la librería icefall (commit f8c8578c9d), k2 1.24.4 y lhotse 1.33.0.

El entrenamiento se divide en dos etapas. La etapa 1 usa aproximadamente 500 horas de kinyarwanda estándar (Common Voice 27 y AfriVoice v0.2) más una copia aumentada de cada clip con perturbaciones sintéticas de velocidad, tempo, tono, sala, ruido o babble, banda telefónica, ganancia, clipping y padding, dejando cerca del 30 % de los clips sin aumentar, durante 20 épocas. La etapa 2 afina el modelo hasta 8 épocas sobre el conjunto de entrenamiento de habla no estándar de CDLI, con clips de hasta 30 segundos y perturbación de velocidad 0.9/1.1. El checkpoint publicado corresponde a la época 3 promediada sobre 2 épocas, seleccionada por validación en CDLI. El tokenizador es el del modelo `emmilly/cdli-impaired-asr-zipformer-small-streaming_rw_cvafv500h-cdli_s42`. No se indica en la información disponible el uso de RLHF o DPO.

## Capacidades

- Reconocimiento de voz en streaming para kinyarwanda con latencia controlada por chunk (320 ms o 640 ms).
- Reconocimiento de habla no estándar, específicamente habla con tartamudeo, gracias al afinamiento sobre el conjunto CDLI.
- Decodificación greedy y beam search (beam 4) con modelos int8.
- Salida de texto normalizada: minúsculas y sin puntuación.
- Funcionamiento causal apto para audio en tiempo real (16 kHz, feature_dim 80).
- Integración con sherpa-onnx mediante `OnlineRecognizer.from_transducer`.
- No se dispone de información sobre tool calling, capacidades de agente, multilingüismo (solo rw) ni visión o audio más allá del ASR.

## Casos de uso

- Subtitulado en tiempo real de kinyarwanda: el modelo causal permite transcribir audio en streaming con chunks de 320 o 640 ms, adecuado para emisiones o reuniones con latencia baja.
- Accesibilidad para personas con tartamudeo: el afinamiento específico sobre habla no estándar de CDLI lo hace útil en aplicaciones de dictado o transcripción para hablantes que tartamudean, un caso poco cubierto por ASR genéricos.
- Transcripción de reuniones y entrevistas: con clips de hasta 30 segundos en entrenamiento y decodificación por chunks, puede integrarse en pipelines de actas automáticas en kinyarwanda.
- Asistentes de voz de bajo consumo: sus 23 M de parámetros y las variantes int8 permiten desplegarlo en dispositivos con recursos limitados mediante sherpa-onnx.
- Investigación en ASR de bajos recursos: sirve como línea base reproducible para kinyarwanda y habla no estándar, con checkpoints PyTorch de icefall para fine-tuning posterior.
- Procesamiento por lotes de archivos de audio: la variante int8 con RTF de 0.021-0.031 (4 hilos) permite transcribir grandes volúmenes de audio con coste computacional bajo.
- Atención al cliente en kinyarwanda: la transcripción en streaming puede alimentar sistemas de análisis de llamadas, aunque la ausencia de puntuación exige postprocesado.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test CDLI Kinyarwanda (1.169 clips, 9 hablantes; decodificación en streaming con sherpa-onnx 1.13.8; las filas int8 son el formato telefónico):

| Configuración | WER por utterance | WER | CER | RTF (4 hilos) |
|---|---|---|---|---|
| c320ms-greedy-int8 | 0.422 | 0.414 | 0.206 | 0.027 |
| c320ms-beam4-int8 | 0.382 | 0.380 | 0.168 | 0.031 |
| c640ms-greedy-int8 | 0.408 | 0.404 | 0.202 | 0.021 |
| c640ms-beam4-int8 | 0.366 | 0.365 | 0.153 | 0.025 |
| E21 (Whisper greedy, referencia) | 0.362 | 0.367 | 0.130 | no disponible |
| E20 (Whisper greedy, referencia) | 0.371 | 0.371 | 0.134 | no disponible |
| E18 (Whisper greedy, referencia) | 0.374 | 0.387 | 0.147 | no disponible |
| E28 c320ms-greedy-int8 (referencia) | 0.433 | 0.426 | 0.226 | no disponible |
| E28 c320ms-beam4-int8 (referencia) | 0.396 | 0.391 | 0.183 | no disponible |
| E28 c640ms-greedy-int8 (referencia) | 0.421 | 0.416 | 0.215 | no disponible |
| E28 c640ms-beam4-int8 (referencia) | 0.384 | 0.380 | 0.167 | no disponible |

Todos los hablantes de test tartamudean; el 71 % de los clips son descripciones espontáneas de imágenes y el resto frases leídas. No se ha medido el rendimiento en campo (salas ruidosas, otros hablantes).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con ≈ 23 M de parámetros, los pesos en int8 ocupan del orden de decenas de MB, por lo que cabe en CPU y en GPUs de gama baja.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU con sherpa-onnx. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es más que suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en dispositivos embebidos.
- Opciones de despliegue: sherpa-onnx (`OnlineRecognizer.from_transducer`, feature_dim 80, 16 kHz), con modelos ONNX float o int8; checkpoint PyTorch para icefall.
- Latencia y throughput: RTF de 0.021-0.031 con 4 hilos en las configuraciones int8 medidas, es decir, procesa audio aproximadamente 30-50 veces más rápido que tiempo real en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (CDLI test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Zipformer-small streaming) | ≈ 23 M | streaming por chunks | 0.365 (c640ms-beam4-int8) | other | Hugging Face, ONNX + PyTorch |
| E28 (referencia del autor, Zipformer-small streaming) | ≈ 23 M | streaming por chunks | 0.380 (c640ms-beam4-int8) | no disponible | no disponible |
| E21 (Whisper greedy, referencia) | no disponible | no disponible (no streaming) | 0.367 | no disponible | no disponible |
| E20 (Whisper greedy, referencia) | no disponible | no disponible (no streaming) | 0.371 | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de ASR en kinyarwanda con habla no estándar.

## Limitaciones y advertencias

- Solo soporta kinyarwanda; no es multilingüe.
- La salida es texto normalizado en minúsculas y sin puntuación, lo que requiere postprocesado para muchos usos.
- El rendimiento en campo (salas ruidosas, hablantes distintos de los de test) no se ha medido; los resultados de WER (0.365-0.414) son relativamente altos y deben validarse en el dominio de despliegue.
- El modelo está especializado en habla con tartamudeo; su comportamiento con habla estándar no se documenta en la información disponible.
- La licencia es "other" y los datos de entrenamiento están sujetos a los términos de CDLI; es necesario revisar las condiciones antes de un uso comercial.
- Riesgo de alucinación y errores en palabras poco frecuentes, habitual en modelos de ASR de bajos recursos.
- No se han documentado sesgos específicos, pero el conjunto de test tiene solo 9 hablantes, lo que limita la generalización.
- El repositorio ocupa 6,5 GB, aunque los artefactos ONNX necesarios para inferencia son mucho más pequeños.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emmilly/cdli-impaired-asr-zipformer-small-streaming_rw_cvafv500h-aug-cdli30s_s42
- Modelo del tokenizador: https://huggingface.co/emmilly/cdli-impaired-asr-zipformer-small-streaming_rw_cvafv500h-cdli_s42
- icefall (framework de entrenamiento): https://github.com/k2-fsa/icefall
- sherpa-onnx (runtime de inferencia): https://github.com/k2-fsa/sherpa-onnx
- k2: https://github.com/k2-fsa/k2
- lhotse: https://github.com/lhotse-speech/lhotse
- Common Voice: https://commonvoice.mozilla.org/
- AfriVoice: no disponible
- CDLI: no disponible
