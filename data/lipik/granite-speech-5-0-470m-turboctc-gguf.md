# lipik/granite-speech-5.0-470m-turboctc-gguf

## Resumen

Granite Speech 5.0 470M TurboCTC es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por IBM, publicado originalmente como `ibm-granite/granite-speech-5.0-470m-turboctc`. La ficha que nos ocupa, `lipik/granite-speech-5.0-470m-turboctc-gguf`, es una conversión a formato GGUF realizada por el usuario `lipik` para su uso con la librería `transcribe.cpp`, una implementación en C/C++ orientada a inferencia local eficiente.

El modelo consta de un encoder acústico de tipo Conformer con atención por bloques, self-conditioning y downsampling temporal, coronado por una cabeza CTC con un vocabulario de 16.384 unidades BPE. Con 473 millones de parámetros, está diseñado explícitamente para despliegue en portátiles, smartphones y otros dispositivos edge, priorizando velocidad de inferencia sobre tamaño.

Su relevancia actual reside en que ofrece una alternativa compacta, con licencia Apache-2.0 y sin dependencias de frameworks pesados, para transcripción offline en inglés con una tasa de error muy baja en condiciones limpias (1,33% WER en LibriSpeech test-clean). La decodificación es no autorregresiva y voraz, lo que reduce la latencia de forma notable frente a modelos encoder-decoder.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder acústico) con block self-attention, self-conditioning y downsampling temporal; cabeza CTC |
| Parametros totales | 473.014.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR de formato corto; entrada de audio a 16 kHz mono) |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp); pesos originales en safetensors en el modelo base |
| Vocabulario de salida | 16.384 unidades BPE |
| Frecuencia de muestreo de entrada | 16 kHz mono WAV |
| Decodificacion | CTC voraz (greedy), no autorregresiva, sin LM externo |
| Streaming | no |
| Timestamps | no (ninguno) |
| Deteccion de idioma | no |
| Traduccion | no |
| Tamano del repo | 0,5 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Conformer: un encoder acústico con atención por bloques, mecanismo de self-conditioning y reducción temporal (downsampling) que alimenta una cabeza de clasificación CTC sobre 16.384 unidades BPE. La decodificación es CTC voraz no autorregresiva, lo que implica una sola pasada sobre la secuencia de entrada y elimina el bucle de generación token a token típico de los modelos encoder-decoder.

El entrenamiento se realizó sobre aproximadamente 60.000 horas de audio en inglés procedente de corpus públicos, optimizando la función de pérdida CTC (Connectionist Temporal Classification). La model card original no detalla la composición exacta del dataset ni si hubo etapas de ajuste fino adicionales, RLHF o DPO; al tratarse de un modelo ASR puro, estos mecanismos no resultan de aplicación habitual. La innovación destacable es la combinación de self-conditioning con CTC para lograr velocidad de inferencia muy alta manteniendo un WER competitivo en un modelo de menos de 500 millones de parámetros.

## Capacidades

- Transcripción de voz a texto offline en inglés a partir de audio WAV de 16 kHz mono.
- Decodificación CTC voraz no autorregresiva, con una sola pasada por utterance.
- Modelo de formato corto: procesa utterances completas, no streaming.
- No soporta timestamps a nivel de palabra ni de segmento.
- No soporta detección automática de idioma (requiere hint `en`).
- No soporta traducción (solo transcripción en el idioma de entrada).
- No dispone de tool calling, function calling ni capacidades de agente.
- No es un modelo multimodal: no procesa texto, imagen ni audio más allá de la transcripción.
- Ejecutable en CPU y en aceleradores (Metal, Vulkan, CUDA) mediante transcribe.cpp.

## Casos de uso

- Transcripción offline en portátil: con la cuantización Q4_K_M (279 MB), el modelo cabe holgadamente en memoria y permite transcribir reuniones o notas de voz sin conexión, usando `transcribe-cli` sobre WAV de 16 kHz.
- Subtitulado de material audiovisual en inglés: dado su WER de 1,33% en LibriSpeech test-clean, es adecuado para generar subtítulos de grabaciones con buena relación señal-ruido, convirtiendo previamente el audio con `ffmpeg -ar 16000 -ac 1`.
- Procesamiento por lotes en servidor: con RTFx de 355,75 en Metal (M4 Max) y 46,07 en CPU, permite transcribir grandes volúmenes de audio en pipelines batch sin GPU dedicada.
- Integración en aplicaciones de escritorio y móviles: al ser un GGUF de 279-506 MB y no requerir framework de deep learning, se puede empaquetar en apps nativas para dictado o búsqueda por voz.
- Transcripción en dispositivos edge con Vulkan: el RTFx de 22,87 en un Ryzen 4750U con Vulkan (frente a 17,24 en CPU) lo hace viable en equipos de consumo sin GPU dedicada.
- Análisis de llamadas y atención al cliente: transcripción de grabaciones cortas en inglés para posterior indexación o análisis de sentimiento, siempre que el audio sea limpio y de un solo hablante.
- Generación de corpus textual a partir de archivos de audio: por su licencia Apache-2.0 y su bajo coste computacional, sirve para poblar bases de datos de transcripciones en proyectos de investigación.

## Benchmarks y rendimiento

Datos publicados en la model card de la conversión GGUF (WER sobre LibriSpeech test-clean completo, 2.620 utterances, batch 8, hint `en`, decodificado en CUDA):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 948 MB | 1,34% |
| F16 | 948 MB | 1,33% |
| Q8_0 | 506 MB | 1,33% |
| Q6_K | 392 MB | 1,33% |
| Q5_K_M | 336 MB | 1,34% |
| Q4_K_M | 279 MB | 1,35% |

Referencia del modelo original (transformers 5.17.0, F32, CPU): 1,33% WER, IC 95% [1,20; 1,47]. WER en FLEURS inglés con Q8_0: 4,61%.

Rendimiento (RTFx, mayor es mejor):

| Plataforma | Acelerador | RTFx |
|---|---|---:|
| Apple M4 Max | CPU | 46,07 |
| Apple M4 Max | Metal | 355,75 |
| AMD Ryzen 4750U | CPU | 17,24 |
| AMD Ryzen 4750U | Vulkan | 22,87 |

La model card original de IBM incluye gráficas comparativas en el Open ASR Leaderboard y el FFASR Leaderboard (resultados a 25 de agosto de 2026), pero los valores numéricos no están disponibles en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; Q4_K_M ocupa 279 MB y BF16/F16 948 MB.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU con Vulkan; no requiere GPU dedicada.
- GPU recomendadas: no aplica para uso intensivo; en servidor, una L4 o H200 permite throughput muy alto, pero el modelo está pensado para CPU y edge.
- Despliegue: exclusivamente mediante `transcribe.cpp` (build con CMake); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: RTFx de 355,75 en Metal (M4 Max), 46,07 en CPU (M4 Max), 22,87 en Vulkan (Ryzen 4750U) y 17,24 en CPU (Ryzen 4750U). En una L4 o H200 el RTFx sería sustancialmente mayor, aunque no se dispone de cifras concretas en la información proporcionada.
- Preprocesado obligatorio: audio de entrada en WAV de 16 kHz mono; conversión con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / formato | Idiomas | Licencia | Formato |
|---|---:|---|---|---|---|
| granite-speech-5.0-470m-turboctc (este) | 473 M | formato corto, no streaming | en | Apache-2.0 | GGUF, safetensors |
| Whisper large-v3 | 1.550 M | formato corto y largo, no streaming nativo | multilingue | MIT | safetensors, GGUF, etc. |
| Whisper small | 244 M | formato corto y largo | multilingue | MIT | safetensors, GGUF, etc. |
| Parakeet CTC (NVIDIA) | ~120 M | formato corto | en | CC-BY-4.0 | NeMo |

La comparación con Whisper large-v3 y Whisper small es la más habitual en la categoría: Whisper ofrece multilingüismo y timestamps, mientras que este modelo prioriza velocidad, tamano reducido y WER muy bajo en inglés limpio. No se dispone de cifras comparativas de WER entre estos modelos en la información proporcionada, por lo que no se incluyen valores numéricos cruzados.

## Limitaciones y advertencias

- Solo inglés: no transcribe otros idiomas ni detecta el idioma automáticamente.
- No es streaming: requiere el utterance completo antes de transcribir, lo que impide su uso en reconocimiento en tiempo real continuo.
- No genera timestamps: no apto para subtitulado con sincronización a nivel de palabra o segmento.
- No traduce: únicamente transcribe en el idioma de entrada.
- WER degradado en condiciones ruidosas o reverberantes: el 1,33% de LibriSpeech test-clean no es representativo de audio real; en FLEURS inglés sube a 4,61% con Q8_0.
- Riesgo de alucinación y errores en nombres propios, siglas y términos técnicos, inherente a los modelos CTC sin LM externo.
- Sin LM externo en la decodificación voraz: no se corrige contexto lingüístico, lo que puede producir errores gramaticales o de puntuación.
- Licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base; conviene revisar la model card original de IBM para términos completos.
- La conversión GGUF está validada contra transformers en un commit concreto (transcribe.cpp `b9427cf`, 2026-09-12); cambios en la librería pueden alterar los resultados.
- Repositorio con solo 25 descargas y 0 likes: ecosistema pequeño, soporte comunitario limitado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/lipik/granite-speech-5.0-470m-turboctc-gguf
- Modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Commit del modelo base usado: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc/commit/18ca3c1
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/b9427cf
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/granite-speech-5.0-470m-turboctc.md
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- FFASR Leaderboard: https://huggingface.co/spaces/treble-technologies/ffasr
