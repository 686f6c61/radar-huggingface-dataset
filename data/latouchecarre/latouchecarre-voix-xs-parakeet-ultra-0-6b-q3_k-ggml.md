# LaToucheCarre/LaToucheCarre-Voix-XS-Parakeet-Ultra-0.6B-Q3_K-GGML

## Resumen

LaToucheCarre-Voix-XS-Parakeet-Ultra-0.6B-Q3_K-GGML es un modelo de reconocimiento automatico del habla (ASR) en formato ggml, cuantizado a Q3_K, derivado de moondream/parakeet-ultra, que a su vez es un post-entrenamiento de nvidia/parakeet-tdt-0.6b-v3. Lo publica La Touche Carre, un asistente de escritura para Windows que ejecuta dictado y correccion de texto de forma totalmente local, sin enviar audio ni transcripciones fuera de la maquina. Este repositorio concreto corresponde al palier "XS" de su producto "Voice XS" y existe para ofrecer una URL de descarga estable y verificable mediante SHA-256.

El modelo emplea la arquitectura TDT (Token-and-Duration Transducer) de NVIDIA con 0,6 mil millones de parametros, heredada de Parakeet TDT 0.6B v3, e incorpora los pesos ajustados de Parakeet Ultra de Moondream. El archivo publicado ocupa 334.751.719 bytes (aproximadamente 0,3 GB) y esta pensado para ser leido por `parakeet-cli` del proyecto whisper.cpp, con soporte de aceleracion Vulkan.

Su relevancia practica radica en que, segun las mediciones del autor, esta cuantizacion Q3_K alcanza un CER del 0,89 % y un WER del 3,90 % en su banco de voz, superando ligeramente a Parakeet TDT 0.6B v3 Q3_K (CER 1,10 %, WER 4,72 %) y a un Whisper large-v3 french distil Q5_0 (CER 1,28 %, WER 4,72 %), con un consumo de unos 395 MB de RAM y 746 MB de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), derivada de nvidia/parakeet-tdt-0.6b-v3 |
| Parametros totales | 0,6 mil millones (segun denominacion del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR; procesa audio, no texto con ventana de contexto) |
| Tipos de cuantizacion | Q3_K (este repositorio); el autor publica ademas Q2_K, Q4_K, Q5_K, Q6_K, Q8_0 y F16 en otros palieres |
| Idiomas soportados | fr, en, multilingue |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ggml (archivo `ggml-parakeet-ultra-0.6b-q3_k.bin`) |
| Tamano del archivo | 334.751.719 bytes |
| SHA-256 | `3a1bf00e60e30853a5cf3a02030fa3a0b136d478df85ccae3251e102416f6e93` |
| Libreria de inferencia | whisper.cpp (`parakeet-cli`) |
| Entrada de audio | WAV, 16 kHz, mono |
| Modelo base | moondream/parakeet-ultra (revision `73175eb7ae`) |
| Modelo original | nvidia/parakeet-tdt-0.6b-v3 |

## Arquitectura y entrenamiento

El modelo es un transductor TDT, una variante de las arquitecturas transducer para ASR que predice conjuntamente tokens y duraciones, lo que permite emitir varios tokens por paso de decodificacion y mejora la eficiencia frente a los transductores clasicos. La conversion a ggml tomo como plantilla el fichero ggml f32 oficial de Parakeet TDT 0.6B v3 publicado por ggml-org, con la misma arquitectura y vocabulario: se copio tal cual la cabecera (hiperparametros, banco de filtros mel, ventana, duraciones TDT y jetones) y se sustituyo cada tensor por su homologo de `model.safetensors` de Parakeet Ultra, traduciendo nombres de transformers a NeMo, plegando los sesgos LSTM ih en hh y reordenando las puertas de [i,f,g,o] a [i,f,o,g]. La cabeza VAD se ignoro.

El control de calidad de la conversion reporta una similitud coseno con el tensor v3 original de al menos 0,954 en todos los tensores. La cuantizacion Q3_K se realizo con `parakeet-quantize` de whisper.cpp (revision `c44b60b`) partiendo del f32 convertido, nunca desde f16, para evitar que `decoder.prediction.embed.weight` quedase con el doble de tamano. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en frances, ingles y modo multilingue.
- Dictado en tiempo real o por lotes sobre audio WAV de 16 kHz mono.
- Manejo de homofonos y de vocabulario real en dictado, segun el banco de pruebas del autor (extracto de 25 s con homofonos).
- Transcripcion de audio leido y de habla espontanea, con buen rendimiento en FLEURS (95,64 % de palabras correctas en la medicion del autor).
- Ejecucion local completa, sin salida de datos a la red.
- Inferencia en CPU o en GPU mediante Vulkan (`-ng` fuerza CPU; `-dev N` selecciona dispositivo Vulkan).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo ASR.
- No dispone de vision ni audio generativo; la entrada es audio y la salida es texto.

## Casos de uso

- Dictado por voz en aplicaciones de escritorio: integrado en `parakeet-cli`, permite transcribir la voz del usuario a texto en local, sin enviar audio a servidores, lo que encaja en herramientas de productividad con requisitos de privacidad.
- Asistente de escritura con correccion posterior: el modelo produce la transcripcion y el producto de La Touche Carre aplica despues correccion de texto; el CER del 0,89 % reduce la carga de correccion manual.
- Subtitulado y transcripcion de reuniones en frances e ingles: con 746 MB de VRAM en Q3_K puede ejecutarse en paralelo a otras tareas en una GPU de consumo.
- Transcripcion por lotes en servidores sin GPU: en CPU rinde del orden de x0,1 a x0,2 del tiempo real, suficiente para procesar archivos de audio en segundo plano.
- Prototipado de pipelines ASR en investigacion: al ser un ggml compatible con whisper.cpp, se integra facilmente en scripts y comparaciones con Whisper.
- Aplicaciones de accesibilidad: dictado local para usuarios con movilidad reducida, con verificacion de integridad del binario mediante SHA-256 antes de la ejecucion.
- Despliegue en equipos con poca memoria: 395 MB de RAM en CPU permiten ejecutarlo en maquinas modestas, algo relevante para portatiles antiguos.

## Benchmarks y rendimiento

Mediciones del autor en un banco de voz propio (27/10/2026), sobre PC con Ryzen 7 7800X3D y RTX 5090, `parakeet-cli` con Vulkan, una sola pasada. Extractos: dictado casero (17 s), voz real con homofonos (25 s) y FLEURS leido (2 min 26 s); unos 2.830 caracteres y 487 palabras de referencia. Las columnas d/p/f indican errores por extracto (dictado, palabra, FLEURS).

| Modelo / cuantizacion | Bytes | Errores d/p/f | Total | CER % | WER % | FLEURS % palabras | RAM / VRAM MB |
|---|---|---|---|---|---|---|---|
| Parakeet Ultra Q3_K (este repo) | 334.751.719 | 1/4/20 | 25 | 0,89 | 3,90 | 95,64 | 395 / 746 |
| Parakeet Ultra Q2_K (descartado) | 272.917.479 | 51/47/610 | 708 | 25,19 | 41,48 | 53,95 | 396 / 684 |
| Parakeet Ultra Q4_K (descartado) | 415.611.879 | 1/1/27 | 29 | 1,03 | 4,52 | 94,55 | 470 / 827 |
| Parakeet Ultra Q5_K | 491.715.559 | 1/1/23 | 25 | 0,89 | 4,11 | 95,10 | 543 / 903 |
| Parakeet Ultra Q6_K | 572.575.719 | 1/1/23 | 25 | 0,89 | 4,11 | 95,10 | 621 / 984 |
| Parakeet Ultra Q8_0 | 668.757.119 | 1/1/23 | 25 | 0,89 | 4,11 | 95,10 | 713 / 1.080 |
| Parakeet Ultra F16 | 1.255.897.319 | 1/1/23 | 25 | 0,89 | 4,11 | 95,10 | 1.098 / 1.667 |
| Parakeet TDT 0.6B v3 Q3_K (referencia) | 334.751.719 | 1/2/28 | 31 | 1,10 | 4,72 | 94,55 | 396 / 746 |
| Whisper large-v3 french distil Q5_0 (referencia) | 791.369.259 | 0/0/36 | 36 | 1,28 | 4,72 | 93,73 | 843 / 1.207 |

Observaciones del autor: Q3_K y F16 obtienen practicamente el mismo resultado; la escala de palieres es de memoria, no de precision. Q8_0 y F16 producen el mismo texto caracter a caracter. Q2_K se degrada de forma severa. La velocidad en GPU es identica entre cuantizaciones (188 s de audio en 3,6 a 4,4 s); en CPU, del orden de x0,1 a x0,2 del tiempo real. El ingles forzado en modo frances se transcribe tal cual, igual que en Parakeet v3.

## Requisitos de hardware

- VRAM estimada en Q3_K: 746 MB en GPU; 395 MB de RAM en CPU.
- GPU recomendadas: cualquier GPU compatible con Vulkan; el autor mide con RTX 5090. Para otras cuantizaciones, la VRAM va de 684 MB (Q2_K) a 1.667 MB (F16).
- Cabe en GPU de consumo: si, con margen amplio en cualquier tarjeta con 2 GB o mas de VRAM; en Q3_K basta con menos de 1 GB.
- Despliegue: `parakeet-cli` de whisper.cpp con backend Vulkan; `-ng` para CPU; `-dev N` para seleccionar dispositivo Vulkan.
- Latencia y throughput: 188 s de audio procesados en 3,6-4,4 s en GPU (RTX 5090), es decir, entre 43x y 52x el tiempo real; en CPU, x0,1 a x0,2 del tiempo real.
- Formato de audio requerido: WAV, 16 kHz, mono.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | CER % (banco del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Parakeet Ultra 0.6B Q3_K (este repo) | 0,6 B | audio WAV 16 kHz mono | 0,89 | CC-BY-4.0 | HuggingFace (ggml) |
| Parakeet TDT 0.6B v3 Q3_K | 0,6 B | audio WAV 16 kHz mono | 1,10 | CC-BY-4.0 | HuggingFace (ggml-org/parakeet-GGUF) |
| Whisper large-v3 french distil Q5_0 | no disponible | audio WAV 16 kHz mono | 1,28 | no disponible en la informacion | HuggingFace (whisper.cpp) |

## Limitaciones y advertencias

- El modelo es exclusivamente ASR: no genera texto libre, no razona y no soporta tool calling ni agentes.
- Q2_K se degrada gravemente (CER 25,19 %); no debe usarse en produccion.
- El modo de idioma forzado puede transcribir literalmente audio en otro idioma (el autor documenta que el ingles forzado en frances se transcribe tal cual).
- Los benchmarks proceden de un banco propio del autor con pocos extractos (487 palabras de referencia); no equivalen a una evaluacion independiente y deben tomarse como indicativos.
- La licencia CC-BY-4.0 exige atribucion a Moondream y NVIDIA; el autor declara que ninguna de las dos esta asociada a este repositorio.
- La cabeza VAD del modelo original se ignoro en la conversion, por lo que no hay deteccion de actividad de voz integrada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion externa de la comunidad.
- El SHA-256 del binario debe verificarse antes de su uso, tal como hace la aplicacion del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LaToucheCarre/LaToucheCarre-Voix-XS-Parakeet-Ultra-0.6B-Q3_K-GGML
- Modelo base (Moondream): https://huggingface.co/moondream/parakeet-ultra
- Modelo original (NVIDIA): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Plantilla ggml oficial: https://huggingface.co/ggml-org/parakeet-GGUF
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Sitio del autor: https://latouchecarre.fr
