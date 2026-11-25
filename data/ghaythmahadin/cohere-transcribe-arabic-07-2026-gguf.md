# GhaythMahadin/cohere-transcribe-arabic-07-2026-gguf

## Resumen

Cohere Transcribe Arabic es un modelo de reconocimiento automático del habla (ASR) de 2.049 millones de parámetros desarrollado por Cohere y Cohere Labs, publicado originalmente en julio de 2026. La versión aquí descrita es una conversión a formato GGUF realizada por GhaythMahadin para su uso con el motor de inferencia transcribe.cpp, portada desde el commit upstream 0a8193c del modelo base CohereLabs/cohere-transcribe-arabic-07-2026. El modelo resuelve la transcripción de audio a texto para árabe (incluido árabe dialectal) e inglés, con especial énfasis en el cambio de código árabe-inglés.

La arquitectura es un encoder Conformer con una cabeza encoder-decoder Transformer (atención cruzada y embeddings de tokens compartidos), derivada de la arquitectura Cohere Transcribe 03-2026. La entrada es un WAV mono a 16 kHz que se convierte en espectrograma log-Mel; la decodificación es autorregresiva y requiere indicar el idioma mediante un flag (`-l ar` o `-l en`).

La relevancia de esta ficha radica en que ofrece una vía de despliegue local y ligera (desde 1,56 GB en Q4_K_M) para un modelo ASR especializado en árabe, un ámbito donde la mayoría de alternativas abiertas tienen un rendimiento notablemente inferior en dialectos. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Conformer + cabeza encoder-decoder Transformer (atención cruzada, embeddings de tokens compartidos) |
| Parametros totales | 2.049.026.832 (aproximadamente 2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Árabe (incluido dialectal) e inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder basada en Conformer: un encoder Conformer procesa el espectrograma log-Mel del audio de entrada y una cabeza Transformer encoder-decoder con atención cruzada genera la transcripción de forma autorregresiva. Los embeddings de tokens están compartidos entre encoder y decoder. La entrada se remuestrea automáticamente a 16 kHz y se convierte en representación log-Mel. El modelo base es una adaptación centrada en árabe de la arquitectura Cohere Transcribe 03-2026, optimizada para dialectos árabes y para el cambio de código árabe-inglés.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni sobre si se aplicaron técnicas de RLHF o DPO. La model card únicamente indica que el modelo está optimizado para árabe e inglés, con foco en dialectos árabes y code-switching. La conversión GGUF fue validada numéricamente contra la referencia de Transformers en el commit d89ecb7 de transcribe.cpp, con fecha 2026-07-07.

## Capacidades

- Transcripción de voz a texto offline para árabe (incluido árabe dialectal, p. ej. egipcio) e inglés.
- Manejo de cambio de código árabe-inglés dentro de una misma locución.
- Entrada de audio en WAV mono a 16 kHz (conversión previa con ffmpeg si es necesario).
- Selección explícita de idioma mediante flag (`-l ar` o `-l en`).
- Decodificación autorregresiva con decodificación greedy.
- Inferencia local en CPU, Metal (Apple Silicon) y Vulkan (GPU AMD/Intel) a través de transcribe.cpp.
- No soporta streaming (según metadatos: `streaming: false`).
- No soporta traducción (`translate: false`).
- No soporta detección automática de idioma (`lang_detect: false`).
- No genera timestamps (`timestamps: none`).
- No soporta tool calling ni function calling (es un modelo puramente ASR).

## Casos de uso

- Transcripción de reuniones y llamadas en árabe: el modelo puede procesar grabaciones completas de audio en árabe dialectal y generar actas o resúmenes posteriores, gracias a su especialización en dialectos y a la posibilidad de ejecutarse en local sin enviar datos a la nube.
- Subtitulado de contenido audiovisual en árabe: integrado en un pipeline con ffmpeg para extraer audio a 16 kHz mono, el modelo genera la transcripción base que luego puede alinearse o segmentarse manualmente, dado que no produce timestamps.
- Atención al cliente en centros de contacto: transcripción de llamadas en árabe e inglés para análisis de calidad, detección de motivos de contacto y generación de bases de conocimiento, con despliegue en servidores modestos gracias a las cuantizaciones de 1,5-2,4 GB.
- Investigación lingüística sobre dialectos árabes: el modelo permite transcribir corpus de habla dialectal (p. ej. egipcio) de forma reproducible y offline, con un WER de referencia del 11 % en FLEURS Arabic, útil para estudios sociolingüísticos y de variación dialectal.
- Aplicaciones de accesibilidad: dictado y transcripción en tiempo no real para usuarios de árabe en entornos de escritorio, ejecutable en CPU (RTF 3 en Ryzen 4750U) o en GPU integrada vía Vulkan (RTF 8), sin necesidad de hardware dedicado.
- Procesamiento por lotes en servidores sin GPU: con la cuantización Q4_K_M (1,56 GB) el modelo cabe en memoria RAM de sistemas modestos y permite transcribir archivos en cola con un coste de infraestructura mínimo.
- Transcripción de contenido mixto árabe-inglés: podcasts, entrevistas o formaciones donde el hablante alterna ambos idiomas, aprovechando la capacidad de code-switching del modelo.

## Benchmarks y rendimiento

Resultados de WER sobre el conjunto de test completo de FLEURS Arabic (`ar_eg`, 428 enunciados), decodificación greedy sin LM externo, normalización Whisper BasicTextNormalizer:

| Cuantizacion | Tamano | WER FLEURS Arabic test |
|---|---:|---:|
| BF16 | 4,10 GB | 11,02 % |
| F16 | 4,11 GB | 11,00 % |
| Q8_0 | 2,41 GB | 11,06 % |
| Q6_K | 1,97 GB | 11,07 % |
| Q5_K_M | 1,77 GB | 10,95 % |
| Q4_K_M | 1,56 GB | 11,18 % |
| Referencia Transformers (BF16) | — | 11,00 % |

Todas las cuantizaciones caen dentro del intervalo de confianza del 95 % de la referencia. FLEURS Arabic es habla en dialecto egipcio; los números publicados por el autor original en otros conjuntos de test árabes no son directamente comparables.

Rendimiento de velocidad (RTF, real-time factor):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 73 |
| Apple M4 Max | CPU | 9 |
| AMD Ryzen 4750U | Vulkan | 8 |
| AMD Ryzen 4750U | CPU | 3 |

No se han publicado resultados de benchmarks comparativos con otros modelos ASR en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: desde 1,56 GB (Q4_K_M) hasta 4,11 GB (F16/BF16), incluyendo overhead del runtime.
- GPU recomendadas: no se especifican modelos concretos; el modelo se ha validado en Apple M4 Max (Metal) y AMD Ryzen 4750U con GPU integrada (Vulkan).
- Cabe en GPU de consumo: sí, cualquier GPU con al menos 2-4 GB de memoria libre puede ejecutar las cuantizaciones Q4_K_M a Q8_0; también funciona en CPU.
- Opciones de despliegue: transcribe.cpp (compilación desde fuente con CMake); no se mencionan vLLM, llama.cpp, Ollama ni TGI, dado que el formato GGUF está adaptado específicamente a transcribe.cpp.
- Latencia y throughput: RTF de 73 en Metal (M4 Max), 9 en CPU (M4 Max), 8 en Vulkan (Ryzen 4750U) y 3 en CPU (Ryzen 4750U); un RTF de 73 implica procesar aproximadamente 73 segundos de audio por segundo de cómputo.
- Requiere audio de entrada en WAV mono a 16 kHz; conversión previa con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Cohere Transcribe Arabic 07-2026 (este, GGUF) | ~2B | Árabe, inglés | No disponible | Apache-2.0 | GGUF | Especializado en dialectos árabes y code-switching; WER 11,0 % en FLEURS Arabic |
| Cohere Transcribe 03-2026 | No disponible | No disponible | No disponible | No disponible | No disponible | Arquitectura base del modelo; orientación multilingüe general |
| Whisper large-v3 | ~1,55B | Multilingüe (~99 idiomas) | 30 s por ventana | MIT | Safetensors, GGUF, etc. | Referencia generalista; rendimiento en dialectos árabes inferior según la model card upstream |
| Otros ASR abiertos para árabe | No disponible | Árabe | No disponible | Variable | Variable | No se dispone de datos comparativos en la información proporcionada |

No se han publicado en la información disponible resultados de benchmarks comparativos directos con Whisper u otros modelos ASR; la comparación anterior es estructural y no de rendimiento.

## Limitaciones y advertencias

- El modelo no soporta streaming: debe procesarse audio completo, no en tiempo real por fragmentos.
- No realiza detección automática de idioma; es obligatorio indicar `-l ar` o `-l en`.
- No genera timestamps, lo que limita su uso directo en subtitulado sincronizado sin post-procesado de alineación.
- No traduce: solo transcribe en el idioma de la locución.
- El rendimiento se ha validado principalmente en dialecto egipcio (FLEURS `ar_eg`); el WER en otros dialectos árabes puede diferir y no se han publicado cifras.
- Riesgo de alucinación y errores en audio con ruido, solapamiento de hablantes o acentos no representados en el entrenamiento; no se dispone de información sobre la composición del dataset para evaluar sesgos.
- La conversión GGUF está vinculada a una versión concreta de transcribe.cpp (commit d89ecb7) y del modelo base (commit 0a8193c); cambios futuros en el runtime pueden requerir reconversión.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda consultar la model card upstream para términos completos y posibles restricciones adicionales del autor original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validación comunitaria independiente del port.
- No se dispone de información sobre el volumen de entrenamiento ni sobre posibles sesgos de género, dialecto o registro.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/GhaythMahadin/cohere-transcribe-arabic-07-2026-gguf
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
- Commit del modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026/commit/0a8193c
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/d89ecb7
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/cohere-transcribe-arabic-07-2026.md
- Cohere: https://cohere.com
- Cohere Labs: https://cohere.com/research
- Arquitectura base Cohere Transcribe 03-2026: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
