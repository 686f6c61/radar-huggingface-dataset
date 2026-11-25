# emmilly/cdli-impaired-asr-zipformer-lsgiga-streaming_en_cdli-ft_s42

## Resumen

El modelo `emmilly/cdli-impaired-asr-zipformer-lsgiga-streaming_en_cdli-ft_s42` es un sistema de reconocimiento automatico del habla (ASR) en ingles, de tipo transducer Zipformer en modo streaming, especializado en habla no estandar, concretamente habla con tartamudeo. Lo desarrolla el usuario `emmilly` dentro del proyecto CDLI (Rwandan English non-standard speech) y parte del checkpoint base `marcoyang/icefall-libri-giga-pruned-transducer-stateless7-streaming-2023-04-04`, entrenado con LibriSpeech (960 h) y GigaSpeech (10.000 h), que se afina sobre el conjunto de entrenamiento de habla no estandar de CDLI.

La relevancia del modelo esta en su nicho: los ASR generalistas degradan mucho con disfluencias y tartamudeo, y este checkpoint se ha ajustado especificamente para ese dominio manteniendo una arquitectura causal compatible con inferencia en tiempo real. La model card reporta mejoras sustanciales frente al modelo base en el test de CDLI English (por ejemplo, WER verbatim de 0,343 con beam4 y chunk de 640 ms frente a 0,668 del base), aunque sigue por detras de referencias Whisper en el mismo conjunto.

Se distribuye principalmente en formato ONNX para `sherpa-onnx` (carpetas por tamano de chunk, con variantes float e int8), ademas de un state dict de PyTorch para icefall. El repositorio ocupa 11 GB y no registra descargas ni likes en el momento de la consulta. La licencia figura como "other", con entrenamiento sujeto a los terminos de CDLI, lo que exige revision legal antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer v1, transducer (encoder-decoder-joiner), receta icefall `pruned_transducer_stateless7_streaming`, causal (streaming) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de decodificacion por chunk configurable: 320 ms y 640 ms (carpetas `chunk-<ms>`) |
| Tipos de cuantizacion | float32 e int8 (ONNX `{encoder,decoder,joiner}.onnx` y `{.int8}.onnx`) |
| Idiomas soportados | en (ingles) |
| Licencia | other (entrenado con datos CDLI bajo sus terminos; base Apache-2.0) |
| Formato de pesos | ONNX (sherpa-onnx), PyTorch state dict (`pytorch/finetuned-averaged.pt`, icefall) |

## Arquitectura y entrenamiento

El modelo es un transducer Zipformer v1 con configuracion `pruned_transducer_stateless7_streaming`, es decir, un encoder Zipformer causal pensado para decodificacion en streaming. Los argumentos del modelo indican cinco stages de encoder con dims `384,384,384,384,384`, feedforward `1024,1024,2048,2048,1024`, 8 cabezas por stage, dims de atencion `192` y unmasked `256`, factores de downsampling `1,2,4,8,2`, kernels de modulo CNN de 31, decoder de 512 y joiner de 512. La configuracion de streaming usa `short-chunk-size` 50, `num-left-chunks` 4 y `decode-chunk-len` 32. La entrada es de 80 dimensiones (feature_dim 80) a 16 kHz.

El entrenamiento parte del checkpoint `marcoyang/icefall-libri-giga-pruned-transducer-stateless7-streaming-2023-04-04` (commit `df8a1ee6`), entrenado con LibriSpeech 960 h y GigaSpeech 10.000 h bajo Apache-2.0. El ajuste fino se realizo durante hasta 8 epocas sobre el conjunto de entrenamiento de habla no estandar de CDLI (ingles ruandes), con perturbacion de velocidad 0.9/1.1 y etiquetas en mayusculas para el BPE-500 de LibriSpeech. El checkpoint publicado es la epoca 8 promediada sobre 3 epocas, seleccionada por WER verbatim por enunciado en validacion CDLI English. La herramienta de construccion fue icefall `f8c8578c9d`, con k2 `1.24.4.dev20260625+cuda13.0.torch2.11.0` y lhotse `1.33.0`. No se menciona RLHF ni DPO; es un ajuste supervisado con funcion de perdida transducer estandar.

## Capacidades

- Reconocimiento de voz en ingles en modo streaming con latencia controlada por el tamano de chunk (320 ms o 640 ms).
- Decodificacion greedy y beam search (beam 4 reportado en la model card).
- Manejo especifico de habla no estandar con tartamudeo, incluyendo una regla de desfluencia del proyecto aplicada a referencias e hipotesis para el calculo de WER "clean".
- Salida con etiquetas en mayusculas segun el vocabulario BPE-500 de LibriSpeech (`tokens.txt`).
- Inferencia optimizada para CPU mediante ONNX Runtime a traves de `sherpa-onnx` (`OnlineRecognizer.from_transducer`).
- No se documentan capacidades de tool calling, agentes, vision, audio adicional ni modo thinking; es exclusivamente ASR.

## Casos de uso

- Subtitulado en tiempo real de reuniones o clases con participantes que tartamudean: el modo streaming con chunk de 320 ms permite emitir texto parcial mientras se habla, y el ajuste fino sobre CDLI reduce el impacto de repeticiones y bloqueos.
- Transcripcion de sesiones de logopedia: el modelo puede generar transcripciones verbatim utiles para analizar patrones de disfluencia, ya que la model card reporta WER verbatim por enunciado y una variante "clean" con regla de desfluencia.
- Asistentes de voz para usuarios con tartamudeo: integrado en un pipeline de comandos por voz, el modelo tolera repeticiones y prolongaciones que rompen los ASR generalistas; conviene validar antes en el dominio concreto del usuario.
- Generacion de actas o notas en entornos con conectividad limitada: al ejecutarse en ONNX Runtime sobre CPU (RTF de 0,030-0,047 con 4 hilos en los tests), puede desplegarse en equipos sin GPU.
- Investigacion en ASR para habla atipica: sirve como punto de partida o linea base afinable para otros corpus de habla no estandar, dado que se publica el state dict de icefall y la carpeta `sherpa-onnx/base/` con el modelo previo al ajuste.
- Prototipado de interfaces de accesibilidad: permite construir demos de dictado o control por voz con latencia baja y sin dependencia de servicios en la nube, siempre que se respete la licencia.
- Evaluacion comparativa de tecnicas de adaptacion: el par base/afinado incluido en el repositorio facilita medir la ganancia del ajuste fino en un corpus concreto.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el test CDLI English (9 hablantes, todos con tartamudeo; decodificacion streaming con sherpa-onnx 1.13.8; filas int8 en formato telefono). WER por enunciado verbatim y "clean" (regla de desfluencia aplicada a referencias e hipotesis), WER y CER agregados, y RTF con 4 hilos:

| Setup | WER por utt. (verbatim) | WER por utt. (clean) | WER | CER | RTF (4 hilos) |
|---|---|---|---|---|---|
| c320ms-greedy-int8 | 0,450 | 0,367 | 0,464 | 0,384 | 0,047 |
| c320ms-beam4-int8 | 0,359 | 0,280 | 0,365 | 0,285 | 0,041 |
| c640ms-greedy-int8 | 0,455 | 0,372 | 0,469 | 0,391 | 0,030 |
| c640ms-beam4-int8 | 0,343 | 0,263 | 0,350 | 0,271 | 0,034 |
| E22 (Whisper greedy, referencia) | 0,259 | 0,174 | 0,249 | 0,167 | no disponible |
| E23 (Whisper greedy, referencia) | 0,263 | 0,174 | 0,254 | 0,170 | no disponible |
| E20 (Whisper greedy, referencia) | 0,272 | 0,185 | 0,260 | 0,173 | no disponible |
| base-c320ms-greedy-int8 (antes del ajuste) | 0,678 | 0,684 | 0,660 | 0,397 | no disponible |
| base-c320ms-beam4-int8 (antes del ajuste) | 0,687 | 0,689 | 0,679 | 0,408 | no disponible |
| base-c640ms-greedy-int8 (antes del ajuste) | 0,652 | 0,651 | 0,629 | 0,382 | no disponible |
| base-c640ms-beam4-int8 (antes del ajuste) | 0,668 | 0,667 | 0,656 | 0,396 | no disponible |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) porque el modelo es exclusivamente ASR; los unicos datos disponibles son los de la tabla anterior.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el despliegue de referencia es en CPU con ONNX Runtime, por lo que no requiere GPU.
- GPU recomendadas: no se especifican; al ser un modelo ONNX pequeno (repo de 11 GB que incluye multiples variantes y el state dict de PyTorch), cualquier GPU moderna con soporte de ONNX Runtime o CUDA seria suficiente, pero no hay datos publicados.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU de consumo actual, aunque no se documenta una medicion concreta.
- Opciones de despliegue: `sherpa-onnx` (`OnlineRecognizer.from_transducer`, feature_dim 80, 16 kHz, chunk fijo por carpeta); el state dict `pytorch/finetuned-averaged.pt` permite cargarlo con icefall. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: RTF de 0,030 a 0,047 con 4 hilos en CPU en los tests reportados (menor RTF con chunk de 640 ms y greedy); no hay datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / chunk | WER por utt. verbatim en CDLI English | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (c640ms-beam4-int8) | Zipformer transducer streaming | no disponible | chunk 640 ms | 0,343 | other | ONNX + PyTorch en HF |
| Base LibriSpeech+GigaSpeech (`sherpa-onnx/base/`) | Zipformer transducer streaming | no disponible | chunk 320/640 ms | 0,652-0,687 | Apache-2.0 (base) | incluido en el repo |
| Whisper greedy (E20/E22/E23, referencia del proyecto) | Encoder-decoder no streaming | no disponible | no aplica (no streaming) | 0,259-0,272 | no disponible en la informacion | no disponible |

La comparativa se limita a los datos de la model card; no se dispone de informacion sobre otros ASR especializados en habla con tartamudeo para contrastar.

## Limitaciones y advertencias

- Dominio muy restringido: el test es de 9 hablantes, todos con tartamudeo (`type_nonstandard_speech` = Stuttering, etiologia desconocida); el rendimiento en salas ruidosas, con otros hablantes o con otras formas de habla atipica no se ha medido.
- El WER absoluto sigue siendo alto (0,343-0,455 por enunciado verbatim en el mejor caso), muy por encima de lo aceptable para dictado general; es un modelo de investigacion, no un producto listo para produccion.
- Las referencias Whisper del mismo proyecto obtienen WER notablemente mejores (0,259-0,272 verbatim), aunque no son streaming; la eleccion entre ambos depende del requisito de latencia.
- Solo ingles; no hay soporte multilingue.
- Licencia "other" con entrenamiento bajo los terminos de CDLI: es imprescindible revisar las condiciones de uso comercial y de redistribucion antes de desplegarlo.
- Riesgo de alucinacion y de errores sistematicos en palabras poco frecuentes, propio de los transducers con vocabulario BPE-500; no se documentan sesgos especificos.
- El chunk es fijo por carpeta (`chunk-320` o `chunk-640`); no se puede cambiar en tiempo de ejecucion sin usar la carpeta correspondiente.
- Sin descargas ni validacion de la comunidad en el momento de la consulta; el soporte y mantenimiento del checkpoint no estan garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emmilly/cdli-impaired-asr-zipformer-lsgiga-streaming_en_cdli-ft_s42
- Checkpoint base: https://huggingface.co/marcoyang/icefall-libri-giga-pruned-transducer-stateless7-streaming-2023-04-04
- icefall (framework de entrenamiento): https://github.com/k2-fsa/icefall
- sherpa-onnx (runtime de inferencia): https://github.com/k2-fsa/sherpa-onnx
- k2: https://github.com/k2-fsa/k2
- lhotse: https://github.com/lhotse-speech/lhotse
