# emmilly/cdli-impaired-asr-zipformer-small-streaming_en_e28init-cdli30s_s42

## Resumen

El modelo `cdli-impaired-asr-zipformer-small-streaming_en_e28init-cdli30s_s42` es un sistema de reconocimiento automático del habla (ASR) en inglés, en modo streaming, especializado en habla no estándar (tartamudeo). Lo desarrolla el usuario `emmilly` dentro del proyecto CDLI, y se construye con la herramienta icefall sobre la arquitectura Zipformer2 en configuración small, con un total de 23.627.887 parámetros y un decodificador de tipo transducer (RNN-T). Su rasgo diferencial es que está pensado para transcribir habla con disfluencias, un dominio donde los ASR convencionales entrenados con habla fluida rinden muy por debajo.

Se trata de un modelo causal (streaming), con chunks de 320 ms o 640 ms, y se distribuye principalmente en formato ONNX para su uso con sherpa-onnx, además de un checkpoint en PyTorch (icefall). Se ha afinado a partir de un modelo previo del mismo proyecto para kinyarwanda, conservando su tokenizador BPE-500, de modo que el inglés se representa con piezas de palabra del kinyarwanda en minúsculas. El entrenamiento se ha hecho sobre el conjunto de habla no estándar en inglés de CDLI, con etiquetas verbatim y hasta 8 épocas.

Su relevancia actual radica en que aborda un nicho poco cubierto: ASR en tiempo real para personas con tartamudeo, con métricas publicadas sobre 9 hablantes del conjunto de test de CDLI. Aunque el WER absoluto es alto (en torno a 0,37-0,45 en verbatim), mejora de forma muy clara al modelo base antes del ajuste en inglés (WER cercano a 0,99), lo que demuestra la utilidad del fine-tuning específico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Zipformer2 small, transducer (RNN-T), causal (streaming) |
| Parámetros totales | 23.627.887 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | chunks de 320 ms o 640 ms (streaming); cortes de audio de hasta 30 s en entrenamiento |
| Tipos de cuantización | int8 (ONNX); pesos float en ONNX y PyTorch |
| Idiomas soportados | inglés (con tokenizador BPE-500 de kinyarwanda) |
| Licencia | other (entrenado con datos CDLI bajo sus términos) |
| Formato de pesos | ONNX (encoder/decoder/joiner, con y sin int8) y PyTorch (`finetuned-averaged.pt`, state dict de icefall) |

## Arquitectura y entrenamiento

El modelo es un transducer Zipformer2 de icefall en variante small, con 6 bloques de encoder de dimensiones escalonadas (`encoder-dim` 192,256,256,256,256,256; `feedforward-dim` 512,768,768,768,768,768; `encoder-unmasked-dim` 192 en todos), `causal=1` y `chunk-size` 16,32,64,-1 con `left-context-frames` 64,128,256,-1. Usa únicamente transducer (`use-transducer=1`, `use-ctc=0`). El modelo se construyó con icefall `f8c8578c9d`, k2 `1.24.4.dev20260625+cuda13.0.torch2.11.0` y lhotse `1.33.0`.

El punto de partida es el modelo streaming del proyecto para kinyarwanda `emmilly/cdli-impaired-asr-zipformer-small-streaming_rw_e26pre-cdli30s_s42` (commit `fafd9588`), entrenado con Common Voice + AfriVoice kinyarwanda (500 h) y después con CDLI impaired kinyarwanda. Sobre él se hizo fine-tuning de hasta 8 épocas con el conjunto de entrenamiento de habla no estándar en inglés de CDLI, con cortes de hasta 30 s y perturbación de velocidad 0,9/1,1. Se conserva el tokenizador BPE-500 de kinyarwanda. Las etiquetas de entrenamiento son verbatim, y el modelo publicado es la media de las épocas 8 (promediado sobre 3 épocas) seleccionada por WER verbatim por utterance en validación de CDLI English.

## Capacidades

- Reconocimiento de habla en inglés en modo streaming (causal), con chunks configurables de 320 ms o 640 ms.
- Transcripción de habla no estándar, específicamente tartamudeo (todos los hablantes del test tienen `type_nonstandard_speech` = Stuttering, etiología desconocida).
- Decodificación greedy y beam search (beam 4) sobre sherpa-onnx.
- Salida verbatim (incluye disfluencias) y, aplicando la regla de disfluencias del proyecto, salida "clean".
- Ejecución en CPU con cuantización int8 (RTF en torno a 0,02-0,03 con 4 hilos).
- Integración con sherpa-onnx mediante `OnlineRecognizer.from_transducer` (feature_dim 80, 16 kHz).
- No dispone de tool calling, capacidades multimodales, visión, audio de entrada más allá del propio ASR ni modos de razonamiento.

## Casos de uso

- Subtitulado en tiempo real para personas con tartamudeo: el modelo está entrenado específicamente con habla disfluente y decodifica en streaming con chunks de 320/640 ms, lo que permite generar subtítulos en vivo en videollamadas o clases.
- Transcripción de reuniones con participantes con habla no estándar: al mantener contexto causal y aceptar audio de hasta 30 s por corte, puede integrarse en pipelines de diarización y transcripción por turnos.
- Asistentes de voz accesibles: sustituir un ASR genérico por este modelo en un asistente doméstico o de escritorio para mejorar la tasa de acierto con usuarios que tartamudean, ejecutándolo en CPU con int8.
- Herramientas clínicas o de investigación lingüística: generar transcripciones verbatim de muestras de habla para análisis de disfluencias, con la opción de aplicar la regla de limpieza del proyecto para obtener la versión "clean".
- Despliegue en dispositivos de borde: el tamaño reducido (23,6 M de parámetros) y los modelos ONNX int8 permiten ejecución local en equipos sin GPU, con RTF bajo en CPU de 4 hilos.
- Prototipado de ASR específico de dominio: servir como base para fine-tuning adicional sobre otros tipos de habla no estándar, reutilizando el tokenizador y la receta de icefall del proyecto.
- Evaluación comparativa de ASR en habla disfluente: usar sus métricas publicadas (WER/CER por utterance) como referencia frente a Whisper u otros sistemas en este dominio.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el test de CDLI English (9 hablantes; decodificación streaming con sherpa-onnx 1.13.8; las filas int8 corresponden al formato de teléfono). WER por utterance en verbatim y en clean (regla de disfluencias aplicada a referencias e hipótesis):

| Configuración | WER por utt. (verbatim) | WER por utt. (clean) | WER | CER | RTF (4 hilos) |
|---|---|---|---|---|---|
| c320ms-greedy-int8 | 0,449 | 0,380 | 0,437 | 0,307 | 0,028 |
| c320ms-beam4-int8 | 0,391 | 0,325 | 0,383 | 0,261 | 0,030 |
| c640ms-greedy-int8 | 0,442 | 0,372 | 0,431 | 0,302 | 0,021 |
| c640ms-beam4-int8 | 0,372 | 0,306 | 0,365 | 0,246 | 0,023 |
| E22 (Whisper greedy, referencia) | 0,259 | 0,174 | 0,249 | 0,167 | no disponible |
| E23 (Whisper greedy, referencia) | 0,263 | 0,174 | 0,254 | 0,170 | no disponible |
| E20 (Whisper greedy, referencia) | 0,272 | 0,185 | 0,260 | 0,173 | no disponible |
| E30 c320ms-greedy-int8 (init LibriSpeech, referencia) | 0,405 | 0,323 | 0,391 | 0,297 | no disponible |
| E30 c320ms-beam4-int8 (init LibriSpeech, referencia) | 0,384 | 0,315 | 0,366 | 0,262 | no disponible |
| E30 c640ms-greedy-int8 (init LibriSpeech, referencia) | 0,396 | 0,313 | 0,382 | 0,290 | no disponible |
| E30 c640ms-beam4-int8 (init LibriSpeech, referencia) | 0,379 | 0,309 | 0,360 | 0,257 | no disponible |
| base-c320ms-greedy-int8 (E28 kinyarwanda, antes del ajuste en inglés) | 0,994 | 0,994 | 0,994 | 0,818 | no disponible |
| base-c320ms-beam4-int8 (E28 kinyarwanda, antes del ajuste en inglés) | 0,993 | 0,992 | 0,993 | 0,818 | no disponible |
| base-c640ms-greedy-int8 (E28 kinyarwanda, antes del ajuste en inglés) | 0,994 | 0,993 | 0,994 | 0,822 | no disponible |
| base-c640ms-beam4-int8 (E28 kinyarwanda, antes del ajuste en inglés) | 0,991 | 0,990 | 0,991 | 0,815 | no disponible |

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, por no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- Inferencia en CPU: el modelo int8 ONNX está pensado para ejecución en CPU; la model card reporta RTF de 0,021-0,030 con 4 hilos, es decir, entre 33 y 48 veces más rápido que tiempo real en ese entorno.
- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño (23,6 M de parámetros) el modelo es muy ligero, pero no se publican cifras de VRAM.
- GPU recomendadas: no disponible; no se especifican GPU concretas (A100, H100, RTX 4090, etc.).
- ¿Cabe en GPU de consumo? No se indica explícitamente, pero por tamaño y formato ONNX int8 está diseñado para ejecución en CPU, por lo que no requiere GPU.
- Opciones de despliegue: sherpa-onnx (`OnlineRecognizer.from_transducer`, feature_dim 80, 16 kHz) con los ONNX en `sherpa-onnx/chunk-<ms>/`; también se puede cargar el checkpoint de PyTorch (`pytorch/finetuned-averaged.pt`) con icefall.
- Latencia y throughput: RTF medido de 0,021 (c640ms-greedy-int8) a 0,030 (c320ms-beam4-int8) con 4 hilos; no se publican cifras de latencia absoluta ni throughput en otros entornos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / streaming | WER por utt. (verbatim) en CDLI English test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (c640ms-beam4-int8) | 23,6 M | Streaming, chunks 320/640 ms | 0,372 | other | ONNX + PyTorch en Hugging Face |
| E30 (init LibriSpeech, c640ms-beam4-int8) | no disponible | Streaming, chunks 320/640 ms | 0,379 | no disponible | referencia del proyecto |
| E22 (Whisper greedy) | no disponible | No streaming (greedy) | 0,259 | no disponible | referencia del proyecto |
| E23 (Whisper greedy) | no disponible | No streaming (greedy) | 0,263 | no disponible | referencia del proyecto |
| E20 (Whisper greedy) | no disponible | No streaming (greedy) | 0,272 | no disponible | referencia del proyecto |
| Base E28 kinyarwanda (c640ms-beam4-int8) | 23,6 M (misma arquitectura) | Streaming | 0,991 | other | disponible en Hugging Face |

Los modelos Whisper de referencia obtienen mejor WER que este Zipformer en el test, pero no son streaming; entre los sistemas streaming del proyecto, este modelo supera ligeramente a E30 (inicializado con LibriSpeech) y de forma muy amplia al base E28 antes del ajuste en inglés.

## Limitaciones y advertencias

- El WER es alto en términos absolutos (0,365-0,437 según configuración), por lo que no es adecuado para transcripción de alta precisión sin revisión humana.
- El rendimiento en campo (salas ruidosas, otros hablantes) no se ha medido; los resultados proceden de 9 hablantes del test de CDLI.
- Todos los hablantes de test tartamudean; no se documenta el comportamiento con habla fluida ni con otras condiciones de habla no estándar.
- El tokenizador es BPE-500 de kinyarwanda y el inglés se representa con piezas de palabra en minúsculas, lo que puede afectar a mayúsculas, puntuación y nombres propios.
- Solo soporta inglés; no hay capacidades multilingües.
- La licencia es "other" y el modelo se entrenó con datos CDLI bajo sus términos; es necesario revisar las condiciones de CDLI antes de cualquier uso comercial.
- Riesgo de sesgo: el conjunto de entrenamiento y evaluación es pequeño y específico (habla no estándar en inglés de Ruanda), lo que limita la generalización a otras poblaciones y acentos.
- No dispone de tool calling, agentes, visión ni otras capacidades más allá del ASR.
- El modelo se publicó con fecha de creación 2026-11-24 y 0 descargas; no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emmilly/cdli-impaired-asr-zipformer-small-streaming_en_e28init-cdli30s_s42
- Modelo base kinyarwanda: https://huggingface.co/emmilly/cdli-impaired-asr-zipformer-small-streaming_rw_e26pre-cdli30s_s42
- icefall (framework de entrenamiento): https://github.com/k2-fsa/icefall
- sherpa-onnx (runtime de inferencia): https://github.com/k2-fsa/sherpa-onnx
- k2: https://github.com/k2-fsa/k2
- lhotse: https://github.com/lhotse-speech/lhotse
