# HY-2012/zipformer_streaming.axera

## Resumen

Zipformer-Streaming.AXERA es un paquete de inferencia cuantizada para el chip AX650N de AXERA, derivado del modelo de reconocimiento automatico del habla (ASR) Zipformer en su variante streaming, bilingue chino-ingles. Lo publica el usuario HY-2012 a partir del checkpoint original de pfluo (`k2fsa-zipformer-chinese-english-mixed`), entrenado con la receta `pruned_transducer_stateless7_streaming` de icefall. El repositorio no contiene pesos entrenados desde cero, sino los grafos ya compilados y cuantizados (`.axmodel`) listos para ejecutarse en la NPU del AX650N, junto con runtimes en Python y C++ y scripts de arranque.

El modelo resuelve el problema de desplegar ASR en tiempo real sobre hardware de borde con acelerador NPU, sin depender de GPUs ni de servicios en la nube. La arquitectura subyacente es un transducer Zipformer con atencion por chunks de 32 frames (320 ms) y contexto izquierdo de 7 frames, que mantiene 35 estados recurrentes entre chunks para preservar la coherencia en streaming continuo. El paquete ocupa 0,2 GB e incluye tres grafos: encoder (80 MB, cuantizado U16/S8), decoder (14 MB, FP32) y joiner (3,3 MB, U16/S8).

Su relevancia actual reside en que demuestra una cadena completa de conversion y cuantizacion (ONNX estatico, calibracion con estados reales de streaming y Pulsar2 U16) que conserva una precision muy alta respecto al modelo FP32 de referencia, con un RTF de 0,103-0,121 en la placa. Es un ejemplo practico de portado de un modelo de speech a silicio especifico con perdida minima de exactitud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer streaming (transducer RNN-T), receta icefall `pruned_transducer_stateless7_streaming` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | chunk de 32 frames (320 ms), encoder con T=39 frames y 7 frames de contexto izquierdo; 35 estados recurrentes entre chunks |
| Tipos de cuantizacion | encoder: U16 activaciones + S8 pesos (proyecciones key/value de atencion en FP32); decoder: FP32; joiner: U16 + S8 |
| Idiomas soportados | chino e ingles (mezcla bilingue, segun tags y model card) |
| Licencia | Apache-2.0 para el codigo de inferencia; los pesos siguen la licencia upstream de pfluo / icefall |
| Formato de pesos | `.axmodel` (grafos compilados para NPU AX650N); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un transducer Zipformer en modo streaming. El encoder procesa ventanas de 39 frames de features fbank de 80 dimensiones (32 frames de chunk mas 7 de contexto izquierdo) y produce una salida de 8 frames x 512 dimensiones junto con 35 estados nuevos que se realimentan en el siguiente chunk. Los estados cubren `cached_len`, `avg`, `key`, `val`, `val2`, `conv1` y `conv2` en cinco etapas con reparto de capas 2/4/3/2/4 y contextos izquierdos de 64/32/16/8/32. El decoder es un predictor de 2 tokens de contexto que genera un vector de 512 dimensiones, y el joiner combina encoder y decoder para producir un logit sobre un vocabulario de 6254 simbolos (blank=0, context=2). La decodificacion es greedy.

El entrenamiento original corre a cargo de pfluo sobre icefall; este repositorio no reentrena, sino que convierte el checkpoint a ONNX estatico (chunk 32, T 39), verifica la equivalencia con el modelo jit de pfluo (cosine 1.0 en la comparacion por particiones), calibra los estados con streaming real y cuantiza con Pulsar2 en U16. La innovacion tecnica destacable es precisamente esa calibracion con estados reales de streaming, que evita la deriva que suele aparecer al cuantizar modelos recurrentes y permite conservar un cosine de 0,9992 en `encoder_out` de estados nuevos (0,946 en el arrastre de estado), 0,99998 en `decoder_out` y 0,999999 en el logit del joiner. Se ofrecen dos compilaciones: `models/` para los tres nucleos NPU y `models_npu1/` para un solo nucleo, pensada para coexistir con otros modelos en el mismo SoC.

## Capacidades

- Reconocimiento automatico del habla en streaming bilingue chino-ingles, con mezcla de ambos idiomas dentro de una misma frase (los ejemplos muestran alternancia natural: "昨天是 MONDAY TODAY IS礼拜二...").
- Procesamiento por chunks de 320 ms con realimentacion de estado, apto para audio continuo sin cortes.
- Inferencia en la NPU del AX650N mediante los grafos `.axmodel`, con runtimes en Python (`axengine` + `kaldi-native-fbank`) y C++ (binario aarch64 precompilado).
- Extraccion de features fbank integrada en el flujo Python, o carga de features precalculadas en `.npy` con forma `[T,80]`.
- Soporte de ejecucion en configuracion NPU de tres nucleos o de un solo nucleo.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio generativo ni modo de razonamiento extendido; es exclusivamente un modelo ASR.

## Casos de uso

- Asistentes de voz embebidos: el modelo se ejecuta en la NPU del AX650N con RTF en torno a 0,11, lo que deja margen de computo para el resto del pipeline (VAD, wake word, NLU) en el mismo SoC; la variante `models_npu1/` permite reservar nucleos para otros modelos.
- Subtitulado en directo de reuniones bilingues chino-ingles: la decodificacion por chunks de 320 ms y el mantenimiento de estado entre chunks permiten generar texto incremental con latencia baja.
- Transcripcion de notas de voz en dispositivos de borde sin conectividad: al no requerir GPU ni nube, encaja en grabadoras, auriculares o terminales industriales con AX650N.
- Control por voz en entornos industriales o domesticos: la inferencia local evita enviar audio a servidores externos, lo que simplifica el cumplimiento de privacidad.
- Evaluacion y prototipado de ASR en hardware AXERA: los scripts `run_ax650.sh` y los informes de precision y rendimiento permiten validar rapidamente un caso de uso antes de integrarlo en producto.
- Docencia e investigacion en despliegue de speech en NPU: el repositorio documenta la cadena completa de conversion (ONNX, calibracion, Pulsar2), util como referencia reproducible para portar otros modelos de icefall.
- Postproceso por lotes de archivos WAV de 16 kHz mono: el binario C++ acepta un directorio completo (`--audio-dir`), adecuado para transcribir corpus pequenos en el propio dispositivo.

## Benchmarks y rendimiento

Precision en AX650N frente a la referencia FP32 ONNX (comparacion de secuencias de tokens, sin anotacion humana):

| Test set | Token error | Detalle |
|---|---|---|
| 20 WAV del dominio | 0,735 % (2/272) | 2 errores de 1 token cada uno |
| 8 WAV de test publico | 2,27 % (6/264) | 4 tokens al final de 3.wav; 1 token en 46.wav y en 8k |

Similitud por tensor (cosine frente a FP32):

| Tensor | Cosine |
|---|---|
| encoder_out (estados nuevos) | 0,9992 |
| encoder_out (arrastre de estado) | 0,946 |
| decoder_out | 0,99998 |
| joiner logit | 0,999999 |

Velocidad en AX650N con runtime C++:

| Metrica | Valor |
|---|---|
| RTF (incluye fbank) | 0,103-0,121 (media 0,114 en 6 WAV) |
| Carga del modelo | ~0,7 s |
| Extremo a extremo (audio de 10 s) | ~1,0 s |
| Python, audio de 10,35 s | ~0,87 s (RTF ~0,084) |
| NPU1, C++ | RTF 0,108 |
| NPU1, Python (sin fbank) | RTF 0,078 |

No se han publicado resultados en benchmarks academicos estandar (MMLU, HumanEval, GSM8K, LibriSpeech WER, etc.) en la informacion disponible.

## Requisitos de hardware

- Acelerador obligatorio: NPU del AX650N (AXERA). Los `.axmodel` no se ejecutan en GPU ni CPU convencionales.
- VRAM: no aplica; el modelo reside en la memoria del SoC. Los grafos suman aproximadamente 97 MB (encoder 80 MB, decoder 14 MB, joiner 3,3 MB).
- GPU recomendadas: no aplica; no hay ruta de despliegue en GPU.
- Compatibilidad consumer: no aplica en el sentido habitual; el hardware objetivo es una placa integrada con AX650N, no una GPU de escritorio.
- Despliegue: runtime Python con `axengine` y `kaldi-native-fbank`, o binario C++ aarch64 `bin/zipformer_asr_ax650`; script `run_ax650.sh` para ejecucion directa. No hay soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF 0,103-0,121 en C++ con fbank incluido; aproximadamente 1,0 s de extremo a extremo para 10 s de audio; carga del modelo en torno a 0,7 s.
- AX630C no esta verificado; el codigo C++ puede recompilarse para AX620E desde el repositorio GitHub.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Idiomas | Licencia | Hardware |
|---|---|---|---|---|---|
| Zipformer-Streaming.AXERA (este) | no disponible | chunk 32 frames (320 ms), T=39 | zh, en | Apache-2.0 (codigo); pesos segun upstream | NPU AX650N |
| pfluo/k2fsa-zipformer-chinese-english-mixed | no disponible | streaming, misma receta icefall | zh, en | segun upstream (no detallada aqui) | ONNX / PyTorch, CPU o GPU |
| sherpa-onnx Zipformer streaming (checkpoint 2023-02-20) | no disponible | streaming | zh, en | Apache-2.0 (tipicamente) | CPU, ONNX Runtime |
| Whisper (variantes pequenas) | no disponible en esta ficha | ventana fija, no streaming nativo | multilingue | MIT (tipicamente) | CPU, GPU |

La comparativa cuantitativa con alternativas no esta disponible en la informacion proporcionada; los datos de parametros y benchmarks de los modelos alternativos no se han incluido para no inventar cifras.

## Limitaciones y advertencias

- Solo decodificacion greedy con `context_size=2`; no hay busqueda por haz ni rescoring, lo que limita la precision en audio ruidoso.
- El demo realiza inferencia a nivel de archivo con realimentacion interna por chunks; no incluye VAD ni captura de microfono en tiempo real, que habria que anadir para un producto.
- El binario C++ solo acepta WAV de 16 kHz mono PCM de 16 bits; rechaza directamente 8 kHz, por lo que es necesario remuestrear.
- La evaluacion de precision se hizo contra la salida FP32 del propio modelo, no contra un test set anotado por humanos; las cifras de token error no equivalen a WER sobre un corpus de referencia.
- El arrastre de estado del encoder baja a cosine 0,946, el punto de mayor desviacion de la cuantizacion; conviene vigilarlo en audios largos.
- AX630C no esta validado; el soporte en otras variantes de la familia requiere recompilacion.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un modelo ASR, los errores se manifiestan como sustituciones o inserciones de tokens, especialmente en cambios de idioma y en audio con ruido.
- Restricciones de licencia: el codigo de inferencia es Apache-2.0, pero los pesos heredan la licencia de pfluo / icefall; es necesario verificar esa licencia upstream antes de un uso comercial.
- El repositorio tiene muy poca traccion (12 descargas, 0 likes) y fue creado en octubre de 2026; no hay evidencia de mantenimiento a largo plazo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HY-2012/zipformer_streaming.axera
- Codigo fuente y conversion: https://github.com/ZY-2012/zipformer_streaming.axera
- Modelo upstream: https://huggingface.co/pfluo/k2fsa-zipformer-chinese-english-mixed
- icefall: https://github.com/k2-fsa/icefall
- Pulsar2: https://huggingface.co/AXERA-TECH/Pulsar2
- Runtime Python: https://github.com/AXERA-TECH/pyaxengine
- BSP AX650N: https://github.com/AXERA-TECH/ax650n_bsp_sdk
- kaldi-native-fbank: https://github.com/csukuangfj/kaldi-native-fbank
- Conversion de modelo: https://github.com/ZY-2012/zipformer_streaming.axera/tree/main/model_convert
