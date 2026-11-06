# FluidInference/lfm3-audio-2b-coreml

## Resumen

LFM3-Audio-2B Core ML es una conversión del modelo LiquidAI/LFM3-Audio-2B de Liquid AI a formato Core ML, orientada a la ejecución local en dispositivos Apple (macOS 15 / iOS 18 en adelante). El modelo original es un modelo de lenguaje de audio de 2.000 millones de parámetros que unifica reconocimiento automático del habla (ASR), transcripción en streaming y síntesis de voz (TTS) dentro de una única arquitectura. Esta versión, publicada por FluidInference, mantiene el encoder, el decodificador de profundidad y el códec en fp16, mientras que cuantiza el backbone del modelo de lenguaje a int8 con bloques de 32.

La relevancia de esta conversión radica en que permite ejecutar ASR de formato largo, LiveASR (transcripción en streaming en inglés con fragmentos de 0,96 s) y TTS sobre hardware consumer de Apple sin depender de la nube. Según la model card, el rendimiento medido en un M5 Pro (24 GB) alcanza un WER de 1,32 % en LibriSpeech test-clean con un RTFx de 18,4 para ASR offline, y un WER de 1,46 % con RTFx de 10,4 para LiveASR. El pico de memoria para ASR es de 1,9 GB y el paquete de archivos necesario ronda los 2,5 GB (unos 2,9 GB si se añade TTS).

El contexto del modelo es de 4.096 posiciones. La licencia es LFM1.0 (etiquetada como "other" en Hugging Face), heredada del modelo base, y la librería de ejecución es FluidAudio, que expone una API en Swift (`LFM3AudioManager`) y una CLI (`fluidaudiocli`). No se han publicado datos sobre idiomas soportados más allá de las referencias a inglés, francés y "American English" en los ejemplos de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de audio (backbone transformer + encoder de audio causal + decodificador de profundidad MaskGIT + códec LiquidCodec); conversión a Core ML |
| Parametros totales | 2B (modelo base LiquidAI/LFM3-Audio-2B) |
| Parametros activos | no disponible |
| Longitud de contexto | 4.096 posiciones |
| Tipos de cuantizacion | LM: int8 por bloque de 32 (pesos), cómputo fp16; encoder de audio, decodificador de profundidad y códec: fp16; tablas host: fp16/fp32; build ANE experimental: LUT8 grupo 8 |
| Idiomas soportados | no disponible (la model card menciona inglés, francés y "American English" en ejemplos; LiveASR es solo inglés) |
| Licencia | LFM1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | Core ML (`.mlmodelc`), más tablas binarias host (`.bin`) y assets JSON |

## Arquitectura y entrenamiento

La arquitectura subyacente es un modelo de lenguaje de audio de 2B parámetros que combina un encoder de audio causal, un backbone transformer con 24 capas (dividido en dos mitades, capas 0-11 y 12-23, con estado K/V y estados de convolución persistidos como `MLState`), una cabeza de lenguaje con vocabulario de 128k tokens y decodificación por chunks con top-64, un decodificador de profundidad MaskGIT y un decodificador de códec LiquidCodec. La conversión a Core ML separa el backbone en dos modelos stateful con funciones `decode_q1` y `prefill_q256/64/16/13`, y expone el encoder de audio con funciones `n12`/`n96`/`n375` según el número de tokens por llamada.

No se detallan en la información disponible los datos de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO). La model card de esta conversión se centra en el proceso de cuantización y paridad: el LM se cuantiza a int8 por bloque de 32, con estados ocultos de TTS teacher-forced que coinciden con fp32 a coseno 0,9999 y transcripciones ASR idénticas a las del modelo original en 100 utterances de LibriSpeech; un build int4 falló la comprobación de frames de habla. El decodificador de profundidad produce códigos idénticos al original en el 99,6 % de 319 frames dorados, y el códec obtiene una SNR de 43-49 dB frente a fp32. El log-mel del host coincide con el extractor original a 8,3e-5.

## Capacidades

- Reconocimiento automático del habla (ASR) offline, incluido audio de formato largo, con entrada mono a 16 kHz.
- LiveASR: transcripción en streaming en inglés con fragmentos de 0,96 s y piezas de 160 ms.
- Síntesis de voz (TTS) a 24 kHz, emitida en streaming a medida que se decodifica, con selección de voz (`female`) e idioma (`American English`).
- Inferencia totalmente on-device en Apple Silicon, sin dependencia de red.
- Ejecución con GPU (backend por defecto) y build experimental para Neural Engine (ANE) del LM.
- API en Swift mediante `LFM3AudioManager` y CLI con subcomandos `transcribe`, `live`, `tts` y `benchmark`.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá del habla.

## Casos de uso

- Transcripción de reuniones y notas de voz en macOS/iOS: el modelo procesa audio de formato largo con contexto de 4.096 posiciones y un WER de 1,32 % en LibriSpeech test-clean, adecuado para dictado y actas ejecutadas localmente sin enviar audio a la nube.
- Subtitulado en directo en inglés: LiveASR con fragmentos de 0,96 s y RTFx de 10,4 permite generar subtítulos casi en tiempo real en un M5 Pro, útil para accesibilidad en aplicaciones de videollamada.
- Asistentes de voz integrados en apps iOS: la API `startLiveTranscription`/`appendLiveAudio`/`finishLiveTranscription` facilita la captura de micrófono por chunks y la transcripción incremental dentro de una app nativa.
- Síntesis de voz para lectores de pantalla y audiolibros: TTS a 24 kHz con primer audio a 37 ms (mediana) y RTFx de 4,3-4,5, con voz femenina e idioma configurable, permite narrar texto en local.
- Procesamiento por lotes de archivos de audio en macOS: la CLI `fluidaudiocli lfm3-audio transcribe` permite automatizar la transcripción de carpetas de audio en pipelines de escritorio.
- Prototipado de productos de voz sin backend: al requerir unos 2,5 GB de archivos para ASR y un pico de 1,9 GB de memoria, cabe en un Mac con 24 GB y evita costes de inferencia en servidor.
- Evaluación de la variante ANE en iPhone: el build experimental `ane/` está pensado para pruebas en dispositivos de clase iPhone, donde el ANE podría igualar la latencia de GPU con menor consumo (no medido aún según la model card).

## Benchmarks y rendimiento

Datos publicados en la model card, medidos en Apple M5 Pro (24 GB), macOS 27.0, build de release de FluidAudio, backend Core ML; el tiempo de pared incluye el warm-up y excluye la decodificación de audio.

| Tarea | Datos | Resultado |
|---|---|---|
| ASR offline | LibriSpeech test-clean, primeras 100 utterances (901 s) | WER 1,32 %, RTFx 18,4; transcripciones 100/100 idénticas al modelo original (HF fp32 en MPS, greedy) |
| LiveASR (piezas de 160 ms) | LibriSpeech test-clean, primeras 20 utterances (157 s) | WER 1,46 %, RTFx 10,4 |
| TTS | 20 frases (72 s de habla, voz femenina) | RTFx 4,3-4,5 entre ejecuciones; primer audio a 37 ms (mediana); WER de ida y vuelta con Parakeet TDT v3 del 2,5 % |

Por frame de habla (80 ms): LM 9,4 ms + decodificador de profundidad 4,9 ms en GPU; el códec decodifica en el ANE en paralelo. Pico de memoria para ASR: 1,9 GB.

Build ANE experimental en M5 Pro (más lento que el paquete GPU):

| Parte | Archivo | Pesos | Colocación ANE | ms por llamada |
|---|---|---|---|---|
| Capas 0-11 | `ane/LFM3-L0-12-q1-S1024-lut8g8.mlmodelc` | LUT8, grupo 8 | 100 % | 5,77 |
| Capas 12-23 + norm final | `ane/LFM3-L12-24-q1-S1024-lut8g8.mlmodelc` | LUT8, grupo 8 | 100 % | 6,01 |
| Cabeza (4 x 32.000 logits) | `ane/LFM3-Head-lut8g8.mlmodelc` | LUT8, grupo 8 | 100 % | 2,08 |

Un token de texto tarda 14,43 ms en el build ANE frente a ~10,8 ms en el paquete GPU; un frame de habla (solo backbone) 12,03 ms frente a 9,07 ms.

## Requisitos de hardware

- Pico de memoria para ASR: 1,9 GB (según la model card).
- Espacio en disco: ~2,5 GB para ASR y LiveASR; ~0,4 GB adicionales para TTS (decodificador de profundidad, códec y tablas); repositorio total de 4,8 GB.
- Hardware objetivo: Apple Silicon con macOS 15 / iOS 18 o superior; el build Core AI (macOS 27 / iOS 27) está en un repositorio separado.
- GPU integrada de Apple Silicon como unidad de cómputo por defecto para LM, cabeza y encoder de audio offline; ANE para el códec y para el encoder en LiveASR (`n12`).
- Cabe en equipos consumer de Apple con 24 GB (medido en M5 Pro); no se documentan requisitos para modelos anteriores de Apple Silicon.
- Despliegue mediante la librería FluidAudio (`LFM3AudioManager.downloadAndLoad()`) o la CLI `fluidaudiocli lfm3-audio`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a Core ML.
- Latencia y throughput: ASR offline RTFx 18,4; LiveASR RTFx 10,4; TTS RTFx 4,3-4,5 con primer audio a 37 ms (mediana).

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks de modelos alternativos comparables (por ejemplo, otros modelos de audio on-device o ASR/TTS de tamaño similar) que permitan una comparación cuantitativa rigurosa. La model card únicamente referencia el modelo original LiquidAI/LFM3-Audio-2B (fp32 en MPS) como referencia de paridad, con transcripciones idénticas en las 100 utterances evaluadas, y el modelo Parakeet TDT v3 como evaluador de ida y vuelta del TTS (WER 2,5 %).

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FluidInference/lfm3-audio-2b-coreml | 2B | 4.096 | LFM1.0 | Core ML | ASR + LiveASR + TTS on-device Apple |
| LiquidAI/LFM3-Audio-2B | 2B | no disponible | LFM1.0 | safetensors (presumiblemente) | Modelo base original; referencia de paridad |
| FluidInference/lfm3-audio-2b-coreai | 2B | no disponible | no disponible | Core ML (Core AI) | Build Core AI para macOS 27 / iOS 27 |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- LiveASR está limitado al inglés según la model card; el ASR offline acepta un parámetro de idioma ("English", "French", ...) pero no se detalla la lista completa de idiomas soportados.
- El contexto está acotado a 4.096 posiciones, lo que limita la duración de audio o texto procesable en una sola pasada.
- El build ANE del LM es experimental, FluidAudio no lo descarga ni lo carga, y en M5 Pro es más lento que el paquete GPU; su rendimiento en iPhone no se ha medido.
- La cuantización int8 introduce desviaciones mínimas pero medibles (coseno 0,9999 en estados ocultos de TTS, SNR de códec 43-49 dB frente a fp32); un build int4 no superó la comprobación de frames de habla.
- La licencia LFM1.0 ("other") puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE del repositorio antes de desplegar en producción.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de robustez en dominios distintos de LibriSpeech.
- Dependencia del ecosistema Apple: requiere macOS 15 / iOS 18 o superior y no es portable a otras plataformas sin reconversión.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopción aún muy limitada y poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FluidInference/lfm3-audio-2b-coreml
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Build Core AI: https://huggingface.co/FluidInference/lfm3-audio-2b-coreai
- Repositorio FluidAudio: https://github.com/FluidInference/FluidAudio
- Licencia (archivo LICENSE del repositorio): https://huggingface.co/FluidInference/lfm3-audio-2b-coreml/blob/main/LICENSE
