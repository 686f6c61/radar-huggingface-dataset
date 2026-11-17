# emmilly/cdli-impaired-asr-zipformer-small-streaming_rw_cvafv500h-cdli_s42

## Resumen

El modelo `cdli-impaired-asr-zipformer-small-streaming_rw_cvafv500h-cdli_s42` es un sistema de reconocimiento automático del habla (ASR) en kinyarwanda desarrollado por el usuario emmilly, orientado específicamente al habla no estándar (tartamudeo). Se basa en la arquitectura Zipformer en su variante small (aproximadamente 23 millones de parámetros) configurada en modo causal, lo que permite decodificación en streaming. El modelo se ha construido con el framework icefall y se distribuye en formato ONNX para su uso con sherpa-onnx.

El modelo parte de un preentrenamiento sobre unas 500 horas de kinyarwanda estándar (Common Voice 27 y AfriVoice v0.2, 20 épocas) y se afina durante 20 épocas adicionales sobre el conjunto de entrenamiento CDLI de habla no estándar ruandesa, con perturbación de velocidad 0,9/1,1. Es relevante porque aborda un nicho poco cubierto: ASR para una lengua de bajos recursos (kinyarwanda) y para hablantes con dificultades del habla, un colectivo habitualmente desatendido por los sistemas comerciales.

La salida de texto está normalizada (minúsculas, sin puntuación). El repositorio ocupa 7,2 GB e incluye pesos ONNX en varias ventanas de chunk (con y sin cuantización int8) y un checkpoint PyTorch en formato icefall. No se han publicado resultados de benchmarks más allá de la tabla de WER/CER sobre el conjunto de test CDLI incluida en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer (transducer), variante small, causal (streaming) |
| Parametros totales | ≈ 23 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventanas de chunk de 320 ms y 640 ms; left-context-frames 64,128,256,-1) |
| Tipos de cuantizacion | fp32 e int8 (ONNX) |
| Idiomas soportados | kinyarwanda (rw) |
| Licencia | other (entrenado con datos CDLI bajo sus términos) |
| Formato de pesos | ONNX (encoder, decoder, joiner, con y sin int8) y PyTorch `.pt` (state dict de icefall) |

## Arquitectura y entrenamiento

El modelo es un transducer Zipformer de icefall en configuración small, con seis bloques de encoder (`num-encoder-layers: 2,2,2,2,2,2`), dimensiones de feedforward de 512/768 y dimensiones de encoder de 192/256 con dimensión unmasked de 192. La configuración es causal (`causal: 1`), con `chunk-size: 16,32,64,-1` y `left-context-frames: 64,128,256,-1`, lo que habilita decodificación en streaming con sherpa-onnx. El modelo usa `feature_dim` 80 y entrada de audio a 16 kHz.

El entrenamiento se realizó en dos fases: preentrenamiento sobre aproximadamente 500 horas de kinyarwanda estándar (Common Voice 27 + AfriVoice v0.2) durante 20 épocas, seguido de afinamiento durante 20 épocas sobre el conjunto de entrenamiento CDLI de habla no estándar ruandesa con perturbación de velocidad 0,9/1,1. El modelo final corresponde a la época 20 promediada sobre 8 épocas, seleccionada según validación CDLI. Se construyó con icefall f8c8578c9d, k2 1.24.4.dev20260625+cuda13.0.torch2.11.0 y lhotse 1.33.0. No se documenta uso de RLHF ni DPO.

## Capacidades

- Reconocimiento de voz en streaming en kinyarwanda, con arquitectura causal que permite decodificación incremental.
- Reconocimiento de habla no estándar (tartamudeo) gracias al afinamiento específico sobre el corpus CDLI.
- Salida de texto normalizada: minúsculas y sin puntuación.
- Decodificación greedy y beam search (beam 4) documentadas en la model card.
- Ejecución en CPU y GPU mediante sherpa-onnx, con variantes fp32 e int8.
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo puramente ASR).
- No dispone de capacidades de visión, audio más allá del ASR ni modo thinking.
- Capacidad multilingüe limitada al kinyarwanda.

## Casos de uso

- Subtitulado en tiempo real de habla kinyarwanda: el modo causal y las ventanas de chunk de 320/640 ms permiten generar transcripciones incrementales con RTF de 0,021-0,046 en 4 hilos, adecuado para emisión en directo.
- Accesibilidad para hablantes con tartamudeo: el afinamiento sobre el corpus CDLI está orientado a este colectivo, de modo que puede integrarse en aplicaciones de dictado o comunicación asistida para usuarios ruandeses.
- Transcripción de entrevistas y material clínico en kinyarwanda: útil en contextos de logopedia o investigación lingüística donde se requiere procesar habla no fluida, aunque con las reservas de WER documentadas.
- Despliegue en dispositivos de recursos limitados: con ≈ 23 M de parámetros y variantes int8, el modelo puede ejecutarse en CPU con sherpa-onnx sin GPU dedicada.
- Integración en pipelines de atención al ciudadano en Ruanda: transcripción de llamadas o mensajes de voz en kinyarwanda para su posterior procesamiento, siempre que se acepte la tasa de error actual.
- Investigación en ASR de bajos recursos: sirve como línea base reproducible (experimento E26) para comparar estrategias de afinamiento sobre habla no estándar en lenguas africanas.
- Prototipado de interfaces de voz offline: el formato ONNX y la compatibilidad con sherpa-onnx facilitan su incorporación en aplicaciones de escritorio o móviles sin conexión.

## Benchmarks y rendimiento

Resultados sobre el test CDLI Kinyarwanda (1.169 clips, 9 hablantes, todos con tartamudeo, habla leída; decodificación en streaming con sherpa-onnx 1.13.8):

| Configuracion | WER por enunciado | WER | CER | RTF (4 hilos) |
|---|---|---|---|---|
| c320ms-greedy-fp32 | 0,572 | 0,590 | 0,399 | 0,032 |
| c320ms-beam4-fp32 | 0,541 | 0,557 | 0,352 | 0,046 |
| c320ms-greedy-int8 | 0,571 | 0,590 | 0,401 | 0,028 |
| c320ms-beam4-int8 | 0,541 | 0,557 | 0,354 | 0,031 |
| c640ms-greedy-fp32 | 0,560 | 0,575 | 0,390 | 0,029 |
| c640ms-beam4-fp32 | 0,521 | 0,534 | 0,330 | 0,026 |
| c640ms-greedy-int8 | 0,560 | 0,576 | 0,388 | 0,021 |
| c640ms-beam4-int8 | 0,521 | 0,533 | 0,328 | 0,026 |
| E21 (Whisper greedy, referencia) | 0,362 | 0,367 | 0,130 | no disponible |
| E18 (Whisper greedy, referencia) | 0,374 | 0,387 | 0,147 | no disponible |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo ASR.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con ≈ 23 M de parámetros el modelo es muy ligero y las variantes int8 reducen aún más el uso de memoria.
- GPU recomendadas: no especificadas en la model card; por tamaño, cualquier GPU moderna (RTX 4090, A100, H100) es sobredimensionada y el modelo está pensado para ejecución en CPU.
- Cabe en GPU de consumo: sí, con amplio margen, e incluso en CPU.
- Opciones de despliegue: sherpa-onnx (OnlineRecognizer.from_transducer, feature_dim 80, 16 kHz); el checkpoint PyTorch en formato icefall permite reexportación.
- Latencia y throughput: RTF de 0,021-0,046 con 4 hilos según configuración (ver tabla de benchmarks); el modo beam4 con chunk de 640 ms ofrece el mejor equilibrio WER/RTF (0,533 de WER, RTF 0,026 en fp32).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/streaming | WER (test CDLI) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Zipformer-small streaming) | ≈ 23 M | Causal, chunks 320/640 ms | 0,533 (beam4, c640ms) | other (términos CDLI) | ONNX + PyTorch en HF |
| E21 (Whisper greedy, referencia) | no disponible | No streaming (según referencia) | 0,367 | no disponible | no disponible |
| E18 (Whisper greedy, referencia) | no disponible | No streaming (según referencia) | 0,387 | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de ASR en kinyarwanda para habla no estándar en la documentación proporcionada.

## Limitaciones y advertencias

- WER elevado: 0,533 en el mejor caso (beam4, c640ms), muy superior al de las referencias Whisper (0,367 y 0,387), lo que limita su uso en producción sin revisión humana.
- El rendimiento en campo (habla espontánea y con ruido) no se ha medido; los resultados proceden de habla leída.
- El conjunto de test es reducido (1.169 clips, 9 hablantes), por lo que la generalización a otros hablantes y acentos no está validada.
- Salida normalizada (minúsculas, sin puntuación), lo que puede requerir postprocesado para muchos casos de uso.
- Solo soporta kinyarwanda; no es multilingüe.
- Licencia "other" con términos de CDLI: es necesario revisar las condiciones del corpus CDLI antes de cualquier uso comercial.
- Riesgo de alucinación y errores en palabras poco frecuentes o nombres propios, inherente a los modelos transducer con vocabulario limitado.
- No se documentan sesgos específicos, pero el entrenamiento sobre un corpus concreto puede introducir sesgos demográficos y de dominio.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emmilly/cdli-impaired-asr-zipformer-small-streaming_rw_cvafv500h-cdli_s42
- icefall (framework de entrenamiento): https://github.com/k2-fsa/icefall
- sherpa-onnx (runtime de despliegue): https://github.com/k2-fsa/sherpa-onnx
- k2: https://github.com/k2-fsa/k2
- lhotse: https://github.com/lhotse-speech/lhotse
- Common Voice: https://commonvoice.mozilla.org/
- No se han encontrado enlaces adicionales (paper, blog o demo) en la información proporcionada.
