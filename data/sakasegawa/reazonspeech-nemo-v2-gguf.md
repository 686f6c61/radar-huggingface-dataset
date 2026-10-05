# sakasegawa/reazonspeech-nemo-v2-GGUF

## Resumen

reazonspeech-nemo-v2-GGUF es una version cuantizada en formato GGUF del modelo de reconocimiento automatico del habla (ASR) reazon-research/reazonspeech-nemo-v2, desarrollado originalmente por Reazon Research. La conversion la firma el usuario sakasegawa y esta pensada exclusivamente para ejecutarse en speech.cpp, una implementacion en C++ sobre ggml que corre en Metal, Vulkan y CPU. El modelo resuelve transcripcion de audio en japones, con enfasis en audio largo: esta disenado para procesar ficheros completos sin segmentado previo.

La arquitectura combina un encoder FastConformer (atencion local mas un token global) con un decoder RNN-T que emplea una red de prediccion LSTM y una red conjunta. El checkpoint tiene 619.190.169 parametros (unos 619 millones) y se distribuye en un unico fichero de 1,24 GB en precision mixta F16/F32. La decodificacion replica la del checkpoint original: busqueda por haces con sincronizacion de longitud de alineamiento (ALSD) y un haz de 4.

Es relevante ahora porque permite ejecutar un ASR japones de calidad en hardware de consumo sin depender de frameworks Python pesados, con soporte para Metal, Vulkan y CPU, y con una API HTTP compatible con el endpoint de audio de OpenAI. La licencia Apache 2.0 del checkpoint original se mantiene en esta conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + RNN-T (red de prediccion LSTM + red conjunta) |
| Parametros totales | 619.190.169 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica como ventana de texto; atencion local de 128 frames de 80 ms a cada lado de cada frame mas un token global. Procesa audio de duracion variable (probado hasta 311 s) |
| Tipos de cuantizacion | F16 unicamente (matrices de capas lineales, LSTM y embedding de tokens en F16; kernels de convolucion, normalizaciones, sesgos y frontend en F32) |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF especifico de speech.cpp (no compatible con llama.cpp, LM Studio ni Ollama) |

## Arquitectura y entrenamiento

El modelo es una conversion del checkpoint reazon-research/reazonspeech-nemo-v2 (commit `33693408be76b7cba9fd4a7546a0a8772430211b`), sin reentrenamiento. La arquitectura es un encoder FastConformer con atencion local: cada frame atiende a 128 frames de 80 ms a cada lado mas un token global, de modo que el coste de tiempo y memoria crece de forma lineal con la duracion del audio en lugar de cuadratica. El decoder es un RNN-T con red de prediccion LSTM y red conjunta. El frontend, el encoder, el decoder RNN-T y el tokenizador van empaquetados en el mismo fichero GGUF. La conversion se realizo con `reference/fastconformer/convert.py` de speech.cpp y se mantienen en F32 los kernels de convolucion, las normalizaciones, los sesgos y el frontend, mientras que las matrices lineales, la LSTM y el embedding de tokens se almacenan en F16.

No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni si se aplicaron tecnicas de RLHF o DPO; esos datos corresponden al checkpoint original de reazon-research y no se reproducen aqui. La innovacion tecnica destacable es la decodificacion con ALSD (alignment-length synchronous beam search) con haz de 4, identica a la de NeMo `transcribe()` y del paquete reazonspeech, junto con la atencion local que permite transcribir ficheros largos sin cortes.

## Capacidades

- Transcripcion de voz a texto en japones (tarea `automatic-speech-recognition`).
- Procesamiento de audio largo en una sola pasada, sin segmentado: probado con entradas de hasta 311 s.
- Ejecucion en Metal (macOS arm64), Vulkan (Windows y Linux x64) y CPU.
- Interfaz de linea de comandos (`speech-asr`), worker con protocolo JSON Lines (`speech-worker`) y servidor HTTP (`speech-server`).
- Endpoint compatible con la API de audio de OpenAI: `POST /v1/audio/transcriptions`.
- API en C expuesta por speech.cpp.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de ASR, no un modelo de lenguaje generativo.
- No dispone de capacidades de vision, audio generativo ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion de reuniones largas: el modelo procesa ficheros completos sin cortes gracias a su atencion local, por lo que una reunion de audio de varios minutos se transcribe en una sola pasada sin perder coherencia entre segmentos.
- Subtitulado de contenido audiovisual en japones: mediante `speech-server` con el endpoint de transcripciones, se puede integrar en un pipeline que recibe audio y devuelve texto para generar subtitulos.
- Archivado y busqueda de audio historico: transcripcion por lotes con `speech-asr` sobre directorios de WAV de 16 kHz, alimentando un indice de busqueda de texto.
- Servicio de dictado o notas de voz: el binario `speech-server` expone una API HTTP local que puede consumir una aplicacion de escritorio o movil para convertir grabaciones en texto.
- Despliegue en dispositivos sin GPU dedicada: al correr en CPU con un pico de memoria de 1,35 GB para 6 s de audio y 1,55 GB para 65 s, es viable en portatiles y equipos modestos.
- Procesamiento en el borde con aceleracion grafica: los binarios precompilados con Metal y Vulkan permiten transcribir en macOS arm64 y en equipos con GPU NVIDIA sin stack Python.
- Integracion en flujos de trabajo por colas: el modo `speech-worker` con JSON Lines facilita su uso como consumidor de tareas en un sistema de procesamiento asincrono.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, WER sobre FLEURS completo, etc.) en la informacion disponible. La model card solo reporta una verificacion por etapas frente a NeMo 3.0.0 sobre ocho locuciones de FLEURS ja_jp (de 6,4 a 28,2 s) y sobre entradas de 65 s y 311 s construidas a partir de ellas.

| Comprobacion | Metal con pesos F16 | CPU con F32 |
|---|---|---|
| Salida del encoder (SNR) | 55 a 71 dB | 104 a 119 dB |
| Red de prediccion (SNR) | 69 a 73 dB | 125 a 128 dB |
| Red conjunta (SNR) | 83 a 88 dB | 124 a 126 dB |
| Texto de las diez entradas | Igual que NeMo | Igual que NeMo |

Tiempos de audio a texto con `speech-asr` en un Apple M5 (Metal), una vez cargado el modelo:

| Duracion del audio | Tiempo |
|---|---|
| 6,4 s | 0,17 s |
| 25,5 s | 0,55 s |
| 65 s | 1,4 s |
| 311 s | 4,9 s |

## Requisitos de hardware

- Pico de memoria en CPU: 1,35 GB para 6 s de audio, 1,55 GB para 65 s y 2,35 GB para 311 s.
- El fichero de pesos ocupa 1,24 GB, por lo que cabe en GPU de consumo con al menos 2 GB de VRAM libre en el peor caso probado (audio de 311 s).
- Backends soportados y verificados: Metal (macOS arm64), Vulkan (NVIDIA) y CPU.
- Binarios precompilados disponibles para macOS arm64 (Metal), Windows x64 (Vulkan) y Linux x64 (Vulkan o CPU) en la pagina de releases de speech.cpp.
- Opciones de despliegue: herramientas de speech.cpp (`speech-asr`, `speech-worker`, `speech-server`) y la API en C. No es compatible con vLLM, llama.cpp, Ollama ni LM Studio, ya que el layout del GGUF es especifico de speech.cpp.
- Requiere speech.cpp v0.7.0 o superior.
- El servidor acepta ficheros de hasta 25 MB, equivalentes a unos 13 minutos de audio de 16 bits.
- Solo acepta WAV de 16 kHz; rechaza otras frecuencias en lugar de remuestrear, por lo que hay que convertir antes con `ffmpeg -i in.mp3 -ar 16000 -ac 1 out.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Formato | Runtime | Licencia | Notas |
|---|---|---|---|---|---|---|
| sakasegawa/reazonspeech-nemo-v2-GGUF | 619.190.169 | Japones | GGUF (speech.cpp) | speech.cpp | Apache 2.0 | ASR para audio largo; mas rapido en audio extenso |
| sakasegawa/parakeet-tdt_ctc-0.6b-ja-GGUF | No disponible en la informacion proporcionada | Japones | GGUF (speech.cpp) | speech.cpp | No disponible en la informacion proporcionada | Segun el autor, mas rapido en una sola locucion |
| reazon-research/reazonspeech-nemo-v2 | No disponible en la informacion proporcionada | Japones | Formato NeMo (no confirmado) | NeMo 3.0.0 / paquete reazonspeech | Apache 2.0 | Checkpoint original en precision completa; referencia de exactitud |

No se dispone de datos de rendimiento comparativo (WER, RTF) entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta japones; no se ha declarado soporte multilingue.
- No es un modelo de lenguaje: no hace tool calling, ni generacion de texto libre, ni razonamiento multi-paso.
- El formato GGUF es especifico de speech.cpp; no funciona en llama.cpp, LM Studio, Ollama ni otras herramientas que leen GGUF.
- La conversion reduce la precision a F16, lo que aleja ligeramente la salida de la del checkpoint original en F32 (diferencias medidas en SNR, aunque el texto coincide en las pruebas realizadas).
- Solo acepta WAV de 16 kHz mono; no remuestrea automaticamente, lo que puede provocar rechazos si la entrada no esta en el formato correcto.
- El servidor HTTP limita los ficheros a 25 MB (aproximadamente 13 minutos de audio de 16 bits), lo que condiciona la transcripcion de audios mas largos a traves de esa via.
- Riesgo de alucinacion y errores de transcripcion inherentes a los modelos ASR, especialmente con audio ruidoso, solapamiento de voces o vocabulario especializado; no se han publicado tasas de error (WER) en la informacion disponible.
- Sesgos conocidos del modelo base (variedades dialectales, terminos especializados) no estan documentados en la informacion proporcionada.
- La licencia es Apache 2.0, que permite uso comercial, pero conviene revisar los terminos del checkpoint original de reazon-research, ya que la model card remite a ellos para el modelo, los datos de entrenamiento y sus condiciones.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente nula.
- Requiere speech.cpp v0.7.0 o posterior; versiones anteriores no cargaran el fichero.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sakasegawa/reazonspeech-nemo-v2-GGUF
- Modelo base: https://huggingface.co/reazon-research/reazonspeech-nemo-v2
- Repositorio de speech.cpp: https://github.com/nyosegawa/speech.cpp
- Releases con binarios precompilados: https://github.com/nyosegawa/speech.cpp/releases
- Tabla de modelos soportados por speech.cpp: https://github.com/nyosegawa/speech.cpp#readme
- Modelo alternativo mencionado por el autor: https://huggingface.co/sakasegawa/parakeet-tdt_ctc-0.6b-ja-GGUF
