# myflow-ai/whisper-large-v3-turbo-gguf

## Resumen

myflow-ai/whisper-large-v3-turbo-gguf es una conversion a formato GGUF del modelo OpenAI Whisper large-v3-turbo, publicada por el usuario myflow-ai para su uso con el motor de inferencia transcribe.cpp. Se trata, por tanto, de una reempaquetacion cuantizada del modelo base openai/whisper-large-v3-turbo, no de un modelo nuevo entrenado desde cero. El objetivo es ofrecer reconocimiento automatico del habla (ASR) multilingue con un consumo de memoria muy reducido y ejecutable en CPU, GPU o aceleradores de forma local.

Whisper large-v3-turbo es una version podada de Whisper large-v3: mantiene intacto el encoder, pero reduce el numero de capas del decoder de 32 a 4, lo que lo hace mucho mas rapido a cambio de una degradacion de calidad minima. La arquitectura es un transformer encoder-decoder seq2seq que procesa ventanas de audio de 30 segundos con entradas mel de 128 bins, y admite decodificacion por chunks para audio de formato largo. El modelo original fue entrenado por OpenAI sobre mas de 5 millones de horas de datos etiquetados de forma debilmente supervisada.

La relevancia de esta ficha concreta reside en el empaquetado: se ofrecen cinco cuantizaciones (F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) que van de 1,51 GB a 511 MB, con una calidad de transcripcion practicamente identica entre ellas segun la WER medida sobre LibriSpeech test-clean (en torno al 2,0 %). Esto permite desplegar el modelo en equipos modestos, incluidos CPU de portatil, manteniendo un rendimiento competitivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq); ventanas de audio de 30 s; entrada mel de 128 bins; decoder podado a 4 capas |
| Parametros totales | 808.904.208 (~809 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventanas de 30 segundos con decodificacion por chunks para formato largo (no aplica una longitud en tokens) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | aproximadamente 100 idiomas (incluye cantones, yue) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura clasica de Whisper: un transformer encoder-decoder de tipo seq2seq. El encoder procesa espectrogramas mel de 128 bins calculados sobre ventanas de audio de 30 segundos, y el decoder genera texto autoregresivamente. La variante "turbo" es el resultado de podar el decoder de Whisper large-v3 de 32 capas a solo 4, conservando el resto del modelo. Esto reduce drasticamente el coste de decodificacion y por tanto aumenta la velocidad de inferencia, con una perdida de precision pequena. La familia v3 anade el cantones (yue) al conjunto de idiomas y emplea la entrada mel de 128 bins.

El entrenamiento original, descrito en el paper "Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al., OpenAI, arXiv:2212.04356), se realizo sobre mas de 5 millones de horas de audio etiquetado de forma debilmente supervisada, lo que le confiere una gran capacidad de generalizacion zero-shot a dominios y datasets no vistos. A diferencia del resto de la familia multilingue, large-v3-turbo se afino solo con datos de transcripcion, excluyendo la traduccion, por lo que no soporta la tarea de traduccion de voz. La conversion GGUF esta basada en el commit upstream 41f01f3 y se valido contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp.

## Capacidades

- Transcripcion automatica del habla (ASR) multilingue en aproximadamente 100 idiomas.
- Deteccion automatica de idioma (`lang_detect: true`).
- Marcas de tiempo a nivel de segmento (`timestamps: segment`).
- Procesamiento de audio de formato largo mediante decodificacion por chunks sobre ventanas de 30 segundos.
- Cuantizacion GGUF con cinco niveles de precision, lo que permite ejecucion en CPU, Metal y Vulkan.
- No soporta traduccion de voz (`translate: false`); para esa tarea debe usarse whisper-large-v3 completo.
- No soporta streaming (`streaming: false`); el audio debe procesarse como fichero o bloque completo.
- No es un modelo generativo de texto ni de codigo, ni soporta tool calling, function calling ni razonamiento multi-paso. Su unica funcion es la transcripcion de voz a texto.

## Casos de uso

- Transcripcion de reuniones y notas de voz: el modelo convierte grabaciones de audio en texto con marcas de tiempo por segmento, lo que permite generar actas o subtitulos sin depender de servicios en la nube, ejecutandose en local gracias a las cuantizaciones de 511 MB a 845 MB.
- Subtitulado de video multilingue: con deteccion automatica de idioma y timestamps por segmento, encaja en pipelines de generacion de subtitulos (SRT/VTT) para contenido en decenas de idiomas, integrable con ffmpeg para el preprocesado a 16 kHz mono WAV.
- Asistentes de voz en dispositivos de borde: la cuantizacion Q4_K_M (511 MB) cabe en equipos sin GPU dedicada y puede integrarse en aplicaciones de escritorio o sistemas embebidos con backend CPU, con un RTF de 0,8 sobre un Ryzen 4750U (mas rapido que tiempo real).
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de grandes volumenes de grabaciones (podcasts, llamadas, entrevistas) para su indexacion en motores de busqueda o bases de datos vectoriales.
- Accesibilidad y transcripcion en tiempo cuasi real: sobre hardware Apple Silicon, el backend Metal alcanza un RTF de 46,4 sobre un M4 Max, lo que permite transcripcion muy por encima de tiempo real en grabaciones por bloques.
- Transcripcion offline en entornos con requisitos de privacidad: al ejecutarse de forma totalmente local y con licencia Apache-2.0, es apto para sectores como salud, legal o banca donde el audio no puede salir del perimetro de la organizacion.
- Generacion de datos de entrenamiento: transcripcion masiva de corpus de audio para construir datasets de texto o pares audio-texto destinados a otros modelos.

## Benchmarks y rendimiento

WER medido sobre la particion completa LibriSpeech test-clean (2620 enunciados) con la decodificacion por defecto de transcribe.cpp (greedy, suppress_tokens, temperature fallback y timestamps de segmento activados). Los numeros provienen de una unica ejecucion en CUDA (L4) contra estos GGUFs concretos.

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F16 | 1,51 GB | 2,00 % |
| Q8_0 | 845 MB | 2,00 % |
| Q6_K | 660 MB | 1,96 % |
| Q5_K_M | 591 MB | 2,00 % |
| Q4_K_M | 511 MB | 2,00 % |

Referencia: OpenAI reporta un 2,10 % en la misma particion con su configuracion de evaluacion. La variacion entre ejecuciones y backends sobre este corpus es de aproximadamente 0,1 puntos porcentuales.

Rendimiento de inferencia (RTF, real-time factor; valores mas altos indican mayor velocidad respecto a tiempo real):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 46,4 |
| Apple M4 Max | CPU | 1,8 |
| AMD Ryzen 4750U | Vulkan | 3,4 |
| AMD Ryzen 4750U | CPU | 0,8 |

## Requisitos de hardware

- VRAM/almacenamiento por cuantizacion: F16 1,51 GB; Q8_0 845 MB; Q6_K 660 MB; Q5_K_M 591 MB; Q4_K_M 511 MB. Con el overhead del runtime, el pico de memoria suele quedar por debajo de 2-3 GB en F16 y en torno a 1 GB en Q4_K_M.
- Cabe en GPU de consumo: practicamente cualquier GPU con 2-3 GB libres de VRAM puede ejecutar cualquiera de las cuantizaciones, incluidas GTX 1650, RTX 3050, RTX 4090 y superiores.
- Ejecucion en CPU: viable sin GPU; el modelo se ejecuta a velocidad superior a tiempo real en un Ryzen 4750U con backend CPU (RTF 0,8) y a 1,8 veces tiempo real en el CPU de un M4 Max.
- Aceleracion por GPU: soportada mediante backend Metal en Apple Silicon (RTF 46,4 en M4 Max) y Vulkan en GPU AMD/Intel (RTF 3,4 en Ryzen 4750U con iGPU). Referencia de rendimiento en CUDA medida sobre una NVIDIA L4.
- Opciones de despliegue: transcribe.cpp como libreria y CLI (compilado con CMake). No esta pensado para vLLM, TGI ni Ollama, ya que estos estan orientados a modelos de lenguaje y no a ASR.
- Preprocesado requerido: audio de entrada en WAV mono a 16 kHz; se recomienda ffmpeg para convertir cualquier formato.
- Latencia y throughput: dependen del backend y la cuantizacion; el RTF de 46,4 en M4 Max implica procesar unas 46 veces mas rapido que tiempo real, mientras que el modo CPU puro en Ryzen 4750U (RTF 0,8) queda ligeramente por encima de tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Traduccion | Licencia | Formato |
|---|---:|---|---|---|---|---|
| myflow-ai/whisper-large-v3-turbo-gguf | ~809 M | ventanas de 30 s | ~100 | no | Apache-2.0 | GGUF |
| openai/whisper-large-v3-turbo | ~809 M | ventanas de 30 s | ~100 | no | Apache-2.0 | safetensors |
| openai/whisper-large-v3 | ~1550 M | ventanas de 30 s | ~100 | si | Apache-2.0 | safetensors |
| openai/whisper-medium | ~769 M | ventanas de 30 s | ~100 | si | Apache-2.0 | safetensors |

Frente al modelo base openai/whisper-large-v3-turbo (safetensors), esta conversion ofrece el mismo resultado de transcripcion en un formato cuantizado que reduce el tamano de 1,51 GB (F16) a 511 MB (Q4_K_M), a costa de una ligera variacion de WER. Frente a whisper-large-v3 completo, el turbo es mas rapido y ligero pero pierde la capacidad de traduccion y algo de precision. Frente a whisper-medium, el turbo mantiene la precision del nivel large con un tamano de parametros similar al medium.

## Limitaciones y advertencias

- Solo transcripcion: no soporta traduccion de voz (`task="translate"`). Para ello debe usarse whisper-large-v3.
- No soporta streaming: el audio debe procesarse en bloques o como fichero completo, lo que limita su uso en escenarios de dictado continuo en tiempo real sin segmentacion propia.
- Riesgo de alucinacion en silencios o clips ruidosos: el propio autor advierte que la variacion del WER en torno a la WER de referencia esta dominada por alucinaciones en clips cortos cercanos al suelo de ruido.
- Degradacion de calidad por cuantizacion: aunque la diferencia de WER sobre LibriSpeech es minima, en dominios ruidosos o idiomas de pocos recursos puede haber una perdida mayor que la reflejada en la tabla.
- Marcas de tiempo solo a nivel de segmento, no a nivel de palabra.
- Rendimiento variable segun backend: la ejecucion en CPU sobre Ryzen 4750U apenas supera el tiempo real (RTF 0,8); para produccion puede requerir GPU o Apple Silicon.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial, pero cualquier uso debe respetar los terminos del modelo upstream de OpenAI.
- Los enlaces de descarga de la model card apuntan al repositorio handy-computer/whisper-large-v3-turbo-gguf; conviene verificar que el repositorio myflow-ai contiene los mismos artefactos antes de integrarlos en produccion.
- El README indica que la conversion se valido contra una unica ejecucion de referencia; pequenas divergencias numericas entre backends son esperables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/myflow-ai/whisper-large-v3-turbo-gguf
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Motor transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-large-v3-turbo.md
- Repositorio GGUF de referencia (handy-computer): https://huggingface.co/handy-computer/whisper-large-v3-turbo-gguf
- Commit upstream del modelo base: https://huggingface.co/openai/whisper-large-v3-turbo/commit/41f01f3
- Paper original de Whisper: https://huggingface.co/papers/2212.04356
- Discusion sobre la variante turbo: https://github.com/openai/whisper/discussions/2363
