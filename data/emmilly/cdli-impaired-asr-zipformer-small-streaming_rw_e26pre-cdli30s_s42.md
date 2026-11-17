# emmilly/cdli-impaired-asr-zipformer-small-streaming_rw_e26pre-cdli30s_s42

## Resumen

El modelo `cdli-impaired-asr-zipformer-small-streaming_rw_e26pre-cdli30s_s42` es un sistema de reconocimiento automático del habla (ASR) en streaming para kinyarwanda, desarrollado por el usuario `emmilly` y publicado en Hugging Face. Se basa en la arquitectura Zipformer (variante small, aproximadamente 23 millones de parámetros) del framework icefall, con un decodificador de tipo transducer y configuración causal, lo que permite transcripción en tiempo real por fragmentos (chunks). El modelo está especializado en habla no estándar, concretamente en personas con tartamudez, un caso poco cubierto por los sistemas ASR convencionales.

El entrenamiento se realizó en dos fases: una primera fase sobre aproximadamente 500 horas de kinyarwanda estándar (Common Voice 27 y AfriVoice v0.2), y una segunda fase de ajuste fino sobre el conjunto de entrenamiento CDLI de habla no estándar ruandesa, incluyendo clips de hasta 30 segundos y perturbación de velocidad. El resultado es un modelo ligero, exportable a ONNX y compatible con sherpa-onnx, pensado para despliegue en entornos con recursos limitados y para aplicaciones de accesibilidad.

La relevancia del modelo radica en su enfoque: un idioma de bajos recursos (kinyarwanda) combinado con habla atípica (tartamudez) en un formato de streaming de bajo coste computacional. No obstante, sus métricas de error (WER entre 0,38 y 0,43 en el conjunto de test CDLI) reflejan la dificultad del dominio y quedan por detrás de referencias Whisper en el mismo conjunto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer small, transducer (encoder-decoder-joiner), causal (streaming) |
| Parametros totales | Aproximadamente 23 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesamiento por chunks de 320 ms o 640 ms; left-context frames 64/128/256) |
| Tipos de cuantizacion | ONNX float e int8 (variantes `.onnx` e `.int8.onnx`) |
| Idiomas soportados | Kinyarwanda (`rw`) |
| Licencia | `other` (entrenado con datos CDLI bajo los terminos de CDLI) |
| Formato de pesos | ONNX (sherpa-onnx) y PyTorch (`finetuned-averaged.pt`, state dict de icefall) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Zipformer en su variante small, un transformer eficiente con codificador jerárquico de seis etapas. La configuración declarada incluye `num-encoder-layers` de `2,2,2,2,2,2`, `feedforward-dim` de `512,768,768,768,768,768`, `encoder-dim` de `192,256,256,256,256,256` y `encoder-unmasked-dim` de `192,192,192,192,192,192`. El modo es causal (`causal: 1`) con `chunk-size` de `16,32,64,-1` y `left-context-frames` de `64,128,256,-1`, lo que habilita la decodificación en streaming. El sistema es un transducer con encoder, decoder y joiner, y admite decodificación greedy y beam search (beam 4).

El entrenamiento se estructuró en dos etapas. La primera partió del modelo preentrenado `emmilly/cdli-impaired-asr-zipformer-small-streaming_rw_cvafv500h-cdli_s42`, entrenado sobre aproximadamente 500 horas de kinyarwanda estándar (Common Voice 27 y AfriVoice v0.2) durante 20 épocas, incluyendo el tokenizer. La segunda etapa (experimento E28) ajustó fino hasta 8 épocas sobre el conjunto CDLI de habla no estándar, con todos los clips de hasta 30 segundos y perturbación de velocidad 0,9/1,1. El modelo final corresponde a la época 3 promediada sobre 2 épocas, seleccionada según la validación CDLI. Se construyó con icefall `f8c8578c9d`, k2 `1.24.4.dev20260625+cuda13.0.torch2.11.0` y lhotse `1.33.0`. La salida de texto está normalizada (minúsculas, sin puntuación).

## Capacidades

- Reconocimiento de voz en streaming para kinyarwanda con latencia configurable por chunk (320 ms o 640 ms).
- Transcripción de habla no estándar, específicamente habla con tartamudez, gracias al ajuste fino sobre el corpus CDLI.
- Decodificación greedy y beam search (beam 4).
- Ejecución con cuantización int8 para reducir requisitos de cómputo y memoria.
- Compatibilidad con sherpa-onnx mediante `OnlineRecognizer.from_transducer` (feature_dim 80, 16 kHz).
- Salida de texto normalizada (minúsculas, sin puntuación).
- No dispone de tool calling, capacidades de agente, visión, audio más allá del ASR ni modo de razonamiento; la información disponible no indica ninguna de estas funciones.

## Casos de uso

- Accesibilidad para personas con tartamudez: el modelo está ajustado específicamente sobre habla con disfluencias, por lo que puede emplearse en herramientas de subtitulado en vivo para hablantes de kinyarwanda con tartamudez, un perfil habitualmente mal atendido por ASR estándar.
- Subtitulado en tiempo real de reuniones y clases: con chunks de 320 o 640 ms y RTF de 0,022-0,035 en 4 hilos, puede alimentar pipelines de subtitulado de baja latencia en entornos con CPU modesta.
- Transcripción de entrevistas clínicas o de investigación: útil para documentar sesiones con hablantes con disfluencias, aunque con revisión humana obligatoria dado el WER del 38-43 % en el dominio de test.
- Asistentes de voz para kinyarwanda en dispositivos de borde: el tamaño de aproximadamente 23 M de parámetros y la exportación ONNX int8 permiten despliegue en hardware limitado sin GPU.
- Investigación en ASR multilingüe y de bajos recursos: sirve como punto de partida o referencia para experimentos de adaptación a habla atípica en idiomas africanos.
- Integración en aplicaciones de dictado o notas de voz: el formato sherpa-onnx facilita su incorporación en aplicaciones de escritorio y móviles que ya usan esta librería.
- Evaluación comparativa de modelos ASR en kinyarwanda: las métricas publicadas sobre el conjunto CDLI permiten usarlo como baseline en estudios de robustez frente a habla no estándar.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test CDLI Kinyarwanda (1.169 clips, 9 hablantes, todos con tartamudez; 71 % descripciones espontáneas de imágenes, resto frases leídas), decodificación en streaming con sherpa-onnx 1.13.8:

| Configuracion | WER por utt. | WER | CER | RTF (4 hilos) |
|---|---|---|---|---|
| c320ms-greedy-int8 | 0,433 | 0,426 | 0,226 | 0,031 |
| c320ms-beam4-int8 | 0,396 | 0,391 | 0,183 | 0,035 |
| c640ms-greedy-int8 | 0,421 | 0,416 | 0,215 | 0,022 |
| c640ms-beam4-int8 | 0,384 | 0,380 | 0,167 | 0,022 |
| E21 (Whisper greedy, referencia) | 0,362 | 0,367 | 0,130 | No disponible |
| E18 (Whisper greedy, referencia) | 0,374 | 0,387 | 0,147 | No disponible |
| E26 c320ms-greedy-int8 (referencia) | 0,571 | 0,590 | 0,401 | No disponible |
| E26 c320ms-beam4-int8 (referencia) | 0,541 | 0,557 | 0,354 | No disponible |
| E26 c640ms-greedy-int8 (referencia) | 0,560 | 0,576 | 0,388 | No disponible |
| E26 c640ms-beam4-int8 (referencia) | 0,521 | 0,533 | 0,328 | No disponible |

El modelo mejora de forma sustancial sobre la referencia E26 del mismo autor (por ejemplo, WER 0,380 frente a 0,533 en c640ms-beam4-int8), pero queda por detrás de las referencias Whisper E21 y E18 en este conjunto. El rendimiento en condiciones de campo (salas ruidosas, otros hablantes) no se ha medido.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con aproximadamente 23 M de parámetros, el modelo int8 ocupa del orden de decenas de MB y puede ejecutarse en CPU sin GPU.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna (RTX 4090, A100, H100) es sobredimensionada para este modelo y solo aportaría margen de paralelismo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en CPU y dispositivos de borde.
- Opciones de despliegue: sherpa-onnx (`OnlineRecognizer.from_transducer`, feature_dim 80, 16 kHz) con los ficheros `chunk-<ms>/{encoder,decoder,joiner}{,.int8}.onnx` y `tokens.txt`; el state dict de PyTorch (`finetuned-averaged.pt`) permite reexportar o continuar el entrenamiento con icefall.
- Latencia y throughput: RTF de 0,031 (c320ms-greedy-int8), 0,035 (c320ms-beam4-int8), 0,022 (c640ms-greedy-int8) y 0,022 (c640ms-beam4-int8) con 4 hilos; es decir, entre 28 y 45 veces más rápido que tiempo real en CPU con 4 hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | WER (CDLI test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (E28) | ~23 M | Chunks de 320/640 ms, causal | 0,380-0,426 | `other` | Hugging Face, ONNX + PyTorch |
| E26 (mismo autor, predecesor) | ~23 M | Chunks de 320/640 ms, causal | 0,533-0,590 | `other` | Hugging Face |
| Whisper E21 (referencia) | No disponible | No disponible (no streaming) | 0,367 | No disponible | Referencia interna del autor |
| Whisper E18 (referencia) | No disponible | No disponible (no streaming) | 0,387 | No disponible | Referencia interna del autor |

La comparación con Whisper no es estrictamente equivalente: las referencias Whisper del autor no son modelos en streaming y no se detalla su configuración exacta. No se dispone de datos de otros modelos ASR públicos en kinyarwanda para una comparación más amplia.

## Limitaciones y advertencias

- El WER en el conjunto de test CDLI es alto (0,380-0,426), por lo que la transcripción requiere revisión humana en aplicaciones sensibles.
- El rendimiento en condiciones de campo (ruido, hablantes no vistos, micrófonos distintos) no se ha medido; los resultados provienen de un conjunto controlado de 9 hablantes.
- El modelo está entrenado únicamente para kinyarwanda; no soporta otros idiomas.
- La salida está normalizada (minúsculas, sin puntuación), lo que limita su uso directo en tareas que requieran formato o mayúsculas.
- Licencia `other`: el entrenamiento se realizó con datos CDLI bajo los términos de CDLI, por lo que el uso comercial puede estar restringido; es necesario consultar dichos términos antes de un despliegue productivo.
- Riesgo de alucinación y de errores sistemáticos en habla con disfluencias severas o solapamientos, dado el dominio de entrenamiento.
- El modelo se seleccionó en la época 3 promediada sobre 2 épocas según validación CDLI; no hay garantía de que sea óptimo para otros dominios.
- No se han publicado análisis de sesgos demográficos ni de robustez más allá del conjunto CDLI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emmilly/cdli-impaired-asr-zipformer-small-streaming_rw_e26pre-cdli30s_s42
- Modelo preentrenado de la etapa 1: https://huggingface.co/emmilly/cdli-impaired-asr-zipformer-small-streaming_rw_cvafv500h-cdli_s42
- Framework icefall: https://github.com/k2-fsa/icefall
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- k2: https://github.com/k2-fsa/k2
- lhotse: https://github.com/lhotse-speech/lhotse
- Common Voice: https://commonvoice.mozilla.org/
- AfriVoice: no disponible (enlace no incluido en la informacion proporcionada)
- CDLI (corpus y terminos): no disponible (enlace no incluido en la informacion proporcionada)
