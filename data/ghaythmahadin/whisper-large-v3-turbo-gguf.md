# GhaythMahadin/whisper-large-v3-turbo-gguf

## Resumen

whisper-large-v3-turbo-gguf es una conversión al formato GGUF del modelo openai/whisper-large-v3-turbo, publicada por el usuario GhaythMahadin para su uso con transcribe.cpp, una implementación en C/C++ del pipeline de inferencia de Whisper. El modelo original lo desarrolla OpenAI y es una variante podada de Whisper large-v3 en la que las capas del decodificador se reducen de 32 a 4, lo que rebaja drásticamente el coste de decodificación a cambio de una degradación menor de calidad. El repositorio incluye únicamente los pesos cuantizados en GGUF, no el modelo completo en safetensors.

La relevancia de esta ficha reside en que permite ejecutar un sistema de reconocimiento automático del habla multilingüe de alta calidad en hardware modesto, incluidos equipos de consumo con CPU o GPU integrada, sin depender de PyTorch ni de CUDA. El modelo cubre transcripción en 100 idiomas, detección de idioma y marcas de tiempo a nivel de segmento, pero no soporta traducción de voz a texto, ya que la variante turbo fue ajustada excluyendo datos de traducción.

Arquitectónicamente es un transformer encoder-decoder con ventanas de 30 segundos y decodificación por trozos para audio largo. Los pesos publicados suman 808.904.208 parámetros y el repositorio ocupa 1,4 GB, con cinco niveles de cuantización que van de F16 (1,51 GB) a Q4_K_M (511 MB).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo, decodificador podado a 4 capas) |
| Parámetros totales | 808.904.208 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos con decodificación por trozos para audio largo |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 100 idiomas, incluidos en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su, yue |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo base es Whisper large-v3-turbo, una versión ajustada de Whisper large-v3 en la que el decodificador pasa de 32 a 4 capas. Mantiene la arquitectura encoder-decoder original de Whisper, descrita en el artículo "Robust Speech Recognition via Large-Scale Weak Supervision" de Radford et al. (OpenAI), y emplea una entrada mel de 128 bins introducida en la familia v3, además de incorporar cantonés (yue) entre sus idiomas. El entrenamiento original se realizó sobre más de 5 millones de horas de datos etiquetados, lo que explica su capacidad de generalización zero-shot a dominios y conjuntos de datos no vistos.

La variante turbo se obtuvo podando el decodificador y ajustando el modelo resultante únicamente con datos de transcripción, excluyendo la traducción. De ahí que `task="translate"` no esté soportado y que, para traducción de voz, la model card remita a whisper-large-v3. La conversión a GGUF se realizó a partir del commit upstream 41f01f3 (fijado el 2026-04-25) y se validó numéricamente contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp el 2026-04-26. La decodificación por defecto en transcribe.cpp es greedy con supresión de tokens, fallback de temperatura y marcas de tiempo de segmento activadas.

## Capacidades

- Transcripción automática del habla multilingüe en 100 idiomas, con salida de texto plano.
- Detección automática de idioma (`lang_detect: true`).
- Marcas de tiempo a nivel de segmento (`timestamps: segment`).
- Procesamiento de audio largo mediante ventanas de 30 segundos y decodificación por trozos.
- No soporta traducción de voz a texto (`translate: false`); para ello debe usarse whisper-large-v3.
- No soporta streaming (`streaming: false`); el procesamiento es por bloques completos.
- Inferencia en CPU y GPU a través de transcribe.cpp, con backends Metal, Vulkan y CUDA.
- No es un modelo de texto: no genera código, no razona sobre lenguaje natural ni soporta tool calling.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo procesa audio largo mediante trozos de 30 segundos y devuelve marcas de tiempo por segmento, lo que facilita la generación de actas indexadas y la búsqueda posterior dentro de la grabación.
- Subtitulado automático de vídeo: las marcas de tiempo de segmento permiten alinear los subtítulos con el audio; la cuantización Q5_K_M (591 MB) mantiene un WER del 2,00 % en LibriSpeech test-clean, suficiente para subtitulado de consumo.
- Dictado y notas de voz en aplicaciones de escritorio: con Q4_K_M (511 MB) el modelo cabe en memoria de un portátil convencional y puede ejecutarse en CPU, lo que permite integrarlo en herramientas locales sin conexión.
- Asistentes de voz para atención al cliente: la detección de idioma y el soporte de 100 lenguas permiten enrutar llamadas multilingües y transcribir conversaciones para su análisis posterior, aunque no hay soporte de streaming y la latencia depende del backend.
- Indexación y búsqueda de archivos de audio: la transcripción con marcas de tiempo habilita la construcción de índices de texto sobre archivos de audio y vídeo, útil en archivos periodísticos o repositorios de formación.
- Investigación en ASR y evaluación de cuantizaciones: al publicarse cinco niveles de cuantización con WER medido sobre el mismo conjunto, el repositorio sirve como referencia para estudiar el impacto de la cuantización en la calidad de transcripción.
- Despliegue en dispositivos con GPU integrada: los datos de rendimiento en Ryzen 4750U con Vulkan (RTF 3,4) y en M4 Max con Metal (RTF 46,4) permiten planificar su uso en equipos sin GPU dedicada.

## Benchmarks y rendimiento

WER sobre LibriSpeech test-clean completo (2620 enunciados), decodificación por defecto de transcribe.cpp, ejecución única en CUDA (L4):

| Cuantización | Tamaño | WER (LibriSpeech test-clean) |
|---|---:|---:|
| F16 | 1,51 GB | 2,00 % |
| Q8_0 | 845 MB | 2,00 % |
| Q6_K | 660 MB | 1,96 % |
| Q5_K_M | 591 MB | 2,00 % |
| Q4_K_M | 511 MB | 2,00 % |

El dato autodeclarado por OpenAI sobre el mismo conjunto es 2,10 %. La diferencia probable se atribuye a que `model.generate()` de OpenAI usa por defecto `<|notimestamps|>`, mientras que el pipeline de transcribe.cpp ejecuta con marcas de tiempo activadas. La variación entre ejecuciones y backends es de aproximadamente 0,1 puntos porcentuales.

Rendimiento en tiempo real (RTF, mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 46,4 |
| Apple M4 Max | CPU | 1,8 |
| AMD Ryzen 4750U | Vulkan | 3,4 |
| AMD Ryzen 4750U | CPU | 0,8 |

## Requisitos de hardware

- VRAM estimada: 1,51 GB para F16; 845 MB para Q8_0; 660 MB para Q6_K; 591 MB para Q5_K_M; 511 MB para Q4_K_M.
- GPU recomendadas: cualquier GPU con soporte CUDA, Metal o Vulkan; los datos publicados se obtuvieron en una NVIDIA L4 (CUDA), un Apple M4 Max (Metal) y un AMD Ryzen 4750U (Vulkan).
- Cabe en GPU de consumo: sí, todas las cuantizaciones caben en GPUs de consumo con 2 GB o más de VRAM, e incluso en memoria compartida de gráficas integradas.
- Opciones de despliegue: transcribe.cpp (compilación con CMake y binario `transcribe-cli`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que el formato GGUF está adaptado a transcribe.cpp.
- Latencia y throughput: RTF de 46,4 en M4 Max con Metal, 3,4 en Ryzen 4750U con Vulkan, 1,8 en M4 Max con CPU y 0,8 en Ryzen 4750U con CPU. Un RTF superior a 1 indica procesamiento más rápido que el tiempo real.
- El audio de entrada debe convertirse previamente a WAV mono a 16 kHz (por ejemplo, con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Traducción de voz | Streaming | Licencia | Formato |
|---|---:|---|---|---|---|---|
| whisper-large-v3-turbo-gguf (este) | 808.904.208 | 100 | no | no | Apache-2.0 | GGUF |
| openai/whisper-large-v3-turbo | no disponible en la información | 100 | no | no | Apache-2.0 | safetensors |
| openai/whisper-large-v3 | no disponible en la información | 100 | sí | no | Apache-2.0 | safetensors |
| openai/whisper-large-v3-gguf (handy-computer) | no disponible en la información | 100 | sí | no | Apache-2.0 | GGUF |

La comparación con alternativas de otros desarrolladores no está disponible en la información proporcionada. Frente a whisper-large-v3, la variante turbo reduce el decodificador de 32 a 4 capas, lo que la hace mucho más rápida a costa de una degradación menor de calidad, pero pierde la capacidad de traducción de voz.

## Limitaciones y advertencias

- No soporta traducción de voz a texto: `task="translate"` no está disponible; para traducción debe usarse whisper-large-v3.
- No soporta streaming: el procesamiento es por bloques, lo que impide su uso en transcripción en vivo con latencia baja.
- La decodificación es greedy con fallback de temperatura; no se documentan modos de decodificación alternativos como beam search en transcribe.cpp.
- La variación entre ejecuciones y backends es de aproximadamente 0,1 puntos porcentuales de WER, atribuida en parte a alucinaciones en clips cortos cerca del umbral de ruido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no procede del equipo oficial de OpenAI ni del repositorio handy-computer; conviene verificar la integridad de los pesos antes de usarlos en producción.
- Los enlaces de descarga de la model card apuntan al repositorio handy-computer/whisper-large-v3-turbo-gguf, no al repositorio de GhaythMahadin, lo que puede indicar que se trata de una réplica de una conversión ajena.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial con las obligaciones habituales de atribución y aviso.
- Riesgo de alucinación en audio con ruido, silencios largos o clips muy cortos, comportamiento conocido en la familia Whisper.
- El modelo solo procesa audio; no admite entradas de texto ni tareas de razonamiento, código o matemáticas.
- La conversión se validó contra un commit concreto de transcribe.cpp (5.6.1); versiones distintas pueden introducir diferencias numéricas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/GhaythMahadin/whisper-large-v3-turbo-gguf
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Commit del modelo base usado en la conversión: https://huggingface.co/openai/whisper-large-v3-turbo/commit/41f01f3
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-large-v3-turbo.md
- Conversión GGUF de referencia (handy-computer): https://huggingface.co/handy-computer/whisper-large-v3-turbo-gguf
- Artículo de Whisper: https://huggingface.co/papers/2212.04356
- Discusión sobre la variante turbo: https://github.com/openai/whisper/discussions/2363
