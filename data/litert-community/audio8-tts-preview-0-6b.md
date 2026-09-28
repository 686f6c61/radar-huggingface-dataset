# litert-community/Audio8-TTS-Preview-0.6b

## Resumen

Audio8-TTS-Preview-0.6b es un modelo de sintesis de voz (text-to-speech) con clonacion de voz zero-shot, distribuido por litert-community como conversion oficial del modelo original Edge0/Audio8-TTS-Preview-0.6b. El formato de publicacion es LiteRT (`.tflite`), lo que lo orienta explicitamente a inferencia en dispositivo (on-device) sin depender de GPU de servidor. El repositorio contiene los cuatro grafos del sistema mas un bucle anfitrion en Python que reproduce el proceso de generacion y el sampler del proveedor original.

La arquitectura es un DualAR speech language model perteneciente a la estirpe de Fish Audio S2 Pro: un transformer "lento" de 24 capas predice un token semantico por trama de 46 ms, un transformer "rapido" de 4 capas predice los diez codebooks del codec trama a trama, y un codec neuronal (RVQ, con un transformer ventaneado de 8 capas y una ConvNet de sobremuestreo causal) convierte las tramas en audio. El nombre indica 0,6 mil millones de parametros y el audio de salida se genera a 44,1 kHz nativos.

Es relevante porque combina tres factores poco frecuentes en el mismo paquete: clonacion de voz zero-shot a partir de un clip de 0,5 a 10 segundos con su transcripcion exacta, soporte de 11 idiomas y despliegue totalmente local en moviles y portatiles mediante cuantizacion int8 e int4. La licencia Apache-2.0 facilita su integracion en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR speech LM (transformer lento de 24 capas + transformer rapido de 4 capas + codec neuronal RVQ con transformer ventaneado de 8 capas y ConvNet de sobremuestreo causal) |
| Parametros totales | 0,6 mil millones (segun denominacion del modelo; desglose exacto no disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (KV cache del slow AR, `max_seq_len`); maximo de 512 tramas por generacion |
| Tipos de cuantizacion | int8 dinamico (per-channel) en slow y fast AR; int4 blockwise-32 OCTAV en slow AR; fp16 en decoder de codec; int8 en decoder de codec (export-time PT2E) y en encoder |
| Idiomas soportados | en, zh, yue, ja, ko, de, fr, es, it, nl, pl (11 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT / TensorFlow Lite (`.tflite`); Fichero `tokenizer.json` (Qwen2 BPE) |
| Tamano del repositorio | 2,1 GB |
| Frecuencia de muestreo de audio | 44,1 kHz (nativa del modelo) |
| Duracion de audio de entrada para clonacion | 0,5 a 10 s (el encoder acepta hasta 10,03 s -> 10 x 216 codigos) |
| Modelo base | Edge0/Audio8-TTS-Preview-0.6b |

## Arquitectura y entrenamiento

El sistema separa generacion semantica y sintesis acustica en dos transformers autorregresivos. El "slow AR" (24 capas, KV cache de 2048) procesa el prompt y produce, por cada trama de 46 ms, un token semantico elegido entre 4097 logits (4096 tokens semanticos mas un token de fin de habla) junto con un estado oculto normalizado que condiciona la etapa siguiente. El "fast AR" (4 capas, KV cache de 10 posiciones) se invoca diez veces por trama: la posicion 0 toma el estado oculto del slow AR y las posiciones 1 a 9 el token de codebook previo, generando los diez codebooks del codec. Un codec neuronal RVQ (transformer ventaneado de 8 capas mas ConvNet de sobremuestreo causal) convierte esas tramas en audio a 44,1 kHz.

La conversion de PyTorch a LiteRT aplica cuantizacion dinamica int8 per-channel en las proyecciones del slow y fast AR, tablas de embedding int8, una variante int4 blockwise-32 OCTAV para el slow AR y, opcionalmente, cuantizacion int8 PT2E de todas las convoluciones y proyecciones del decoder de codec (manteniendo codebooks en fp32). El sampler y el formato de prompt son los del proveedor: temperatura 0,7, top-p 0,9, top-k 50 y un maximo de 512 tramas, con redibujado consciente de repeticiones. El repositorio incluye un encoder de codec (`codec_encoder_fp16_10s.tflite`) que registra una voz de referencia a partir de 10,03 s de audio. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens visto ni si hubo fases de RLHF o DPO.

## Capacidades

- Sintesis de voz de texto a audio a 44,1 kHz con calidad nativa del modelo.
- Clonacion de voz zero-shot: registra una voz a partir de un clip de 0,5 a 10 s con su transcripcion exacta y la reutiliza en generaciones posteriores.
- Generacion sin voz de referencia (modo `noref`), util cuando no se necesita identidad de hablante.
- Soporte de 11 idiomas: ingles, chino mandarin, cantonés, japones, coreano, aleman, frances, espanol, italiano, neerlandés y polaco.
- Generacion de voz condicionada por prompt/transcripcion con parametros de sampler expuestos (temperatura, top-k, top-p, maximo de tramas).
- Ejecucion totalmente on-device: no requiere red ni servicio en la nube.
- Capacidad de decodificacion por ventanas mediante dos grafos de decoder (T128 y T192) para textos largos.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio de entrada distinto a la clonacion ni modo de razonamiento explicito; no aplica a un modelo TTS.

## Casos de uso

- Lectura por voz de articulos y documentos en movil: el modelo cabe en formato LiteRT y funciona sin conexion, de modo que una aplicacion puede leer textos largos en tramos gracias a los grafos de decoder T128 (5,9 s por llamada) y T192 (8,9 s por llamada).
- Asistentes de voz personalizados: al registrar una voz concreta (0,5 a 10 s) se puede fijar una identidad de hablante consistente para todas las interacciones, integrándose en asistentes locales.
- Localizacion y doblaje multilingue ligero: con 11 idiomas soportados, se puede reutilizar la misma voz de referencia para producir las mismas frases en varios idiomas dentro de un flujo de trabajo.
- Audiolibros y contenido accesible en dispositivo restringido: el modelo a 0,6B y con variante int4 (386 MB para el slow AR) permite generar voz en hardware sin GPU dedicada.
- Prototipado e investigacion en TTS: el repositorio incluye el bucle anfitrion en Python (`audio8_tts_litert.py`) que reproduce la logica del proveedor, util para experimentar con sampler y prompts.
- Integracion embebida en aplicaciones moviles nativas: los grafos `.tflite` estan pensados para invocarse desde Kotlin o C++ mediante la LiteRT Compiled Model API, lo que facilita empaquetar el TTS dentro de una app.
- Sistemas de accesibilidad (lectura de pantalla, TTS para usuarios con discapacidad visual): la ejecucion local y sin cuotas de API lo hace apto para uso continuo en dispositivo.
- Generacion de voces sinteticas para pruebas de audio en pipelines de QA: permite producir clips de habla controlados y reproducibles a partir de texto, sin depender de servicios externos.

## Benchmarks y rendimiento

La model card reporta exactitud medida frente a la implementacion de referencia en PyTorch (transformers 4.57, CPU fp32) sobre 14 frases con semilla: 6 en ingles y 6 en japones con voz de referencia clonada, y una de cada sin referencia. La verificacion combina reconocimiento automatico del audio generado (whisper large-v3-turbo) contra el texto de entrada y similitud de hablante (coseno con TitaNet-L) contra el clip de referencia.

| Configuracion | WER en | CER ja | Coseno hablante en / ja |
|---|---|---|---|
| Referencia PyTorch | 1,1 % | 0,0 % | 0,66 / 0,74 |
| `slow_ar_int8` + `fast_ar_int8` + `codec_decoder_fp16` | 1,1 % | 0,0 % | 0,68 / 0,76 |
| `slow_ar_int4` + `fast_ar_int8` + `codec_decoder_fp16` | 1,1 % | 0,0 % | 0,63 / 0,77 |
| `codec_decoder_int8` (codes de referencia decodificados) | 1,1 % | 0,0 % | 0,67 / 0,73 |

Notas sobre la medicion: los grafos fp32 reproducen la secuencia de codigos de referencia trama a trama en las 14 frases; el decoder de codec es bit-exacto a nivel de torch y queda dentro de 2e-6 como `.tflite`. El unico error en ingles es compartido con la referencia (el modelo omite la primera palabra de una frase). En modelos muestreados, la coincidencia trama a trama no se considera metrica valida, por lo que la verificacion se hace sobre transcripcion y voz.

Rendimiento medido (no estimado) en Apple silicon Mac, CPU, 4 hilos, ai-edge-litert 2.2.0:

| Configuracion | slow AR / trama | fast AR / trama (10 llamadas) | codec (llamada T128) | RTF (mediana de 14) |
|---|---|---|---|---|
| int8 / int8 / fp16 | 9,0 ms | 9,2 ms | 1,43 s | 0,81 (0,73-0,98) |
| int4 / int8 / fp16 | 12,2 ms | 9,2 ms | 1,43 s | 0,92 (0,81-1,07) |
| int8 / int8 / int8 codec | 8,9 ms | 9,4 ms | 0,96 s | 0,70 (0,64-0,82) |

La informacion de rendimiento se corta al inicio del bloque correspondiente a Galaxy S26 (SM-S9...); los datos completos de ese dispositivo no estan disponibles en la informacion proporcionada.

## Requisitos de hardware

- Al ser LiteRT/TFLite, el modelo esta disenado para inferencia on-device en CPU y GPU movil, no exclusivamente sobre GPU de servidor.
- Tamano de pesos por grafo: slow AR int8 552 MB, slow AR int4 386 MB, fast AR int8 68 MB, decoder de codec fp16 262 MB (T128 y T192) o int8 132 MB, encoder de codec fp16 419 MB. El repositorio completo ocupa 2,1 GB.
- VRAM/RAM estimada para inferencia: no disponible de forma explicita en la informacion. Como referencia, la suma de los grafos activos mas habituales (slow AR int8 552 MB + fast AR 68 MB + decoder fp16 262 MB) ronda los 880 MB de pesos antes de overhead de runtime y KV cache.
- GPU recomendadas por modelo: no disponible. La model card indica que los grafos de codec decoder (fp16) estan pensados para GPU movil y que el decoder int8 es la opcion de CPU.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible; no se documenta despliegue en GPU de escritorio para esta publicacion.
- Despliegue probado: LiteRT (`ai-edge-litert`) con bucle Python en Apple silicon; en movil, a traves de LiteRT Compiled Model API desde Kotlin/C++.
- Opciones de despliegue adicionales (vLLM, llama.cpp, Ollama, TGI): no disponibles para este formato `.tflite`.
- Latencia/throughput: en Apple silicon con 4 hilos, RTF mediano de 0,70 a 0,92 segun cuantizacion (por debajo de 1,0 significa mas rapido que tiempo real), con el coste dominante en la llamada al decoder de codec (1,43 s fp16, 0,96 s int8).

## Comparativa con modelos similares

La model card situa Audio8 TTS en la estirpe de Fish Audio S2 Pro, pero no se incluyen en la informacion proporcionada datos numericos de modelos comparables (por ejemplo, otras familias TTS con clonacion zero-shot o modelos TTS on-device). Por tanto, no es posible construir una comparativa cuantitativa con parametros, contexto y rendimiento verificados.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Audio8-TTS-Preview-0.6b (LiteRT) | 0,6B | 2048 tokens | Apache-2.0 | LiteRT `.tflite`, on-device | Conversion del modelo Edge0 |
| Alternativas comparables (otros TTS zero-shot / on-device) | no disponible | no disponible | no disponible | no disponible | No se aportan datos en la informacion disponible |

## Limitaciones y advertencias

- Es una version "Preview" (0.6b) del modelo; no se garantiza estabilidad de API ni de calidad frente a versiones posteriores.
- No se documentan sesgos especificos de hablante, idioma o acento; al ser un modelo de voz, hereda los sesgos del dataset de entrenamiento original, que no se detalla.
- Riesgo de alucinacion acustica: en TTS se manifiesta como omision, repeticion o pronunciacion incorrecta. La propia model card documenta el caso en que el modelo omite la primera palabra de una frase en ingles, error compartido con la referencia PyTorch.
- Cobertura idiomatica: aunque se listan 11 idiomas, los datos de evaluacion solo cubren ingles y japones; el rendimiento en espanol, cantonés, coreano, aleman, frances, italiano, neerlandes y polaco no esta medido en la informacion disponible.
- La clonacion de voz exige una transcripcion exacta del clip de referencia; una transcripcion incorrecta degrada la calidad de la voz clonada.
- Limitacion de contexto: maximo de 512 tramas por generacion y KV cache de 2048; los textos largos requieren decodificacion por ventanas.
- Coste computacional concentrado en el decoder de codec: la llamada T128 tarda 1,43 s en fp16 en Apple silicon, lo que marca el RTF.
- No se documenta en la informacion proporcionada si existen filtros de contenido, marcas de agua o mecanismos de consentimiento para clonacion de voz; para uso comercial o en produccion conviene verificar la politica del modelo base Edge0/Audio8-TTS-Preview-0.6b y las obligaciones legales sobre sintesis de voz.
- Licencia Apache-2.0: permite uso comercial, pero se debe conservar el aviso de licencia y atribucion correspondiente.
- El rendimiento de los grafos `.tflite` esta verificado en Apple silicon y, parcialmente, en Galaxy S26 (datos truncados); no hay confirmacion de rendimiento en otras plataformas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/litert-community/Audio8-TTS-Preview-0.6b
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Preview-0.6b
- Voces de referencia incluidas: LibriSpeech dev-clean (CC BY 4.0) y ejemplo japones de FunAudioLLM/Fun-ASR-Nano-2512 (Apache-2.0)
