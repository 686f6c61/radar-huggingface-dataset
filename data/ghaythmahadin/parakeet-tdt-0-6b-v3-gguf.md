# GhaythMahadin/parakeet-tdt-0.6b-v3-gguf

## Resumen

`parakeet-tdt-0.6b-v3-gguf` es la conversión a formato GGUF del modelo de reconocimiento automático del habla `nvidia/parakeet-tdt-0.6b-v3` de NVIDIA, publicada por el usuario GhaythMahadin (el autor original de la conversión es handy-computer) para su uso con el motor [transcribe.cpp](https://github.com/handy-computer/transcribe.cpp). El modelo base es un ASR multilingüe de 627 millones de parámetros que cubre 25 lenguas europeas, incluido el castellano, y que detecta automáticamente el idioma del audio sin necesidad de indicación explícita.

La arquitectura combina un codificador Conformer de tipo FastConformer con un decodificador transducer TDT/RNNT, lo que permite transcripción de alta velocidad con timestamps a nivel de token. Esta conversión GGUF reduce el peso del modelo desde los 2,51 GB en F32 hasta los 502 MB en Q4_K_M, manteniendo un WER en LibriSpeech test-clean prácticamente idéntico (1,92-1,98 % frente al 1,95 % de referencia), lo que la hace viable en hardware de consumo.

Su relevancia actual reside en que ofrece una alternativa local, sin dependencia de API, para transcripción multilingüe de alta calidad, con licencia CC-BY-4.0 que permite uso comercial. No es un modelo de streaming ni traduce: transcribe audio de 16 kHz mono WAV en modo offline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + TDT/RNNT (decoder transducer) |
| Parametros totales | 627.052.166 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR offline; procesa audio completo, no ventana de texto) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 25: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, ru, sk, sl, es, sv, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura FastConformer-TDT: un codificador Conformer optimizado para velocidad que procesa el audio de entrada y un decodificador transducer Token-and-Duration Transducer (TDT), variante de RNNT que predice conjuntamente tokens y duraciones, lo que acelera la decodificación frente a un RNNT clásico. El modelo se entrenó sobre el corpus multilingüe [Granary](https://huggingface.co/datasets/nvidia/Granary) de NVIDIA, según indica la model card del modelo original. No se detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición pormenorizada del dataset.

Esta conversión GGUF se generó a partir del commit `6d590f7` del modelo original (fijado el 2026-04-16) y se validó numéricamente contra la referencia de NeMo en el commit `bf0d0b7` de transcribe.cpp (2026-04-18). La cuantización se aplica sobre los pesos del encoder y del decodificador; el WER se mantiene estable en todas las precisiones, con variaciones de ±0,03 puntos porcentuales respecto a F32. El modelo incluye detección automática de idioma y timestamps a nivel de token.

## Capacidades

- Transcripción de voz a texto offline en 25 lenguas europeas, con detección automática del idioma del audio.
- Puntuación y capitalización automáticas en la salida.
- Timestamps a nivel de token (marcas temporales por palabra/token).
- Detección de idioma integrada (`lang_detect: true`).
- Salida con timestamps de palabra, según la model card original (la información se corta en ese punto).
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.
- Entrada: audio de 16 kHz mono en formato WAV.

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa grabaciones completas de audio de 16 kHz mono y genera transcripciones con puntuación y timestamps, adecuado para generar actas automáticas en entornos corporativos multilingües.
- Subtitulado de vídeo: los timestamps a nivel de token permiten alinear la transcripción con la pista de vídeo para generar subtítulos en 25 idiomas europeos, incluido el castellano.
- Atención al cliente y análisis de llamadas: transcripción local de grabaciones de call center sin enviar audio a servicios en la nube, con detección automática de idioma para entornos con clientes de distintos países.
- Investigación en lingüística computacional: corpus de audio en varias lenguas europeas pueden transcribirse de forma reproducible y local con un modelo de 627 M de parámetros que cabe en GPU de consumo.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en aplicaciones de escritorio o embebidas, gracias a que el modelo Q4_K_M ocupa 502 MB y puede ejecutarse en CPU con Vulkan.
- Procesamiento por lotes en servidores modestos: el rendimiento medido (RTF 12,5 en Vulkan sobre Ryzen 4750U y RTF 151 en Metal sobre M4 Max) permite procesar horas de audio en minutos en hardware de gama media, sin GPU dedicada de datacenter.
- Archivado y búsqueda de audio: transcripción masiva de archivos históricos en múltiples lenguas para indexación y búsqueda textual posterior.

## Benchmarks y rendimiento

WER sobre LibriSpeech test-clean (2620 utterances, decodificación greedy sin LM externo). Referencia F32: 1,95 %; cifra autoinformada por NVIDIA: 1,93 %.

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 2,51 GB | 1,95 % |
| F16 | 1,26 GB | 1,95 % |
| Q8_0 | 740 MB | 1,94 % |
| Q6_K | 627 MB | 1,93 % |
| Q5_K_M | 565 MB | 1,92 % |
| Q4_K_M | 502 MB | 1,98 % |

Rendimiento (RTF, factor de tiempo real; mayor es mejor):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 151 |
| Apple M4 Max | CPU | 28 |
| AMD Ryzen 4750U | Vulkan | 12,5 |
| AMD Ryzen 4750U | CPU | 7,5 |

No se han publicado en la información disponible resultados de benchmarks multilingües (p. ej., FLEURS o MLS) para las 25 lenguas soportadas.

## Requisitos de hardware

- VRAM estimada: 502 MB (Q4_K_M), 565 MB (Q5_K_M), 627 MB (Q6_K), 740 MB (Q8_0), 1,26 GB (F16), 2,51 GB (F32). Cifras correspondientes al tamaño de los ficheros GGUF; el consumo real en memoria puede ser algo superior por buffers de decodificación.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA). No requiere GPU de datacenter.
- Cabe holgadamente en GPU de consumo: RTX 3060/4060/4090, Apple M1/M2/M3/M4, iGPU con Vulkan.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), compilado desde fuente con CMake. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF 151 en Metal sobre M4 Max, 28 en CPU sobre M4 Max, 12,5 en Vulkan sobre Ryzen 4750U y 7,5 en CPU sobre Ryzen 4750U. Un RTF de 12,5 implica procesar 12,5 segundos de audio por segundo de cómputo.
- Entrada obligatoria: audio de 16 kHz mono WAV; es necesario convertir con ffmpeg si el origen es MP3 u otro formato.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Streaming | Traduccion | Licencia | Formato |
|---|---|---:|---|---|---|---|
| parakeet-tdt-0.6b-v3 (GGUF, esta ficha) | 627 M | 25 europeos | No | No | CC-BY-4.0 | GGUF |
| nvidia/parakeet-tdt-0.6b-v2 | no disponible | Ingles | No | No | CC-BY-4.0 | NeMo |
| Whisper large-v3 | no disponible en la informacion | 99 | No | Si | MIT (segun conocimiento general, no verificado en la informacion) | safetensors, GGUF via terceros |
| Whisper small | no disponible en la informacion | 99 | No | Si | MIT (segun conocimiento general, no verificado en la informacion) | safetensors, GGUF via terceros |

La información disponible no incluye comparativas directas de WER frente a Whisper u otros modelos ASR, por lo que no se presentan cifras comparativas que no estén verificadas.

## Limitaciones y advertencias

- No es un modelo de streaming: requiere el audio completo antes de transcribir.
- No traduce: solo transcribe en el idioma detectado.
- Solo admite audio de 16 kHz mono WAV como entrada; hay que preprocesar el resto de formatos.
- Cobertura limitada a 25 lenguas europeas; no cubre otras familias lingüísticas.
- Riesgo de alucinación y errores en audio con ruido, acentos no representados en el corpus de entrenamiento o solapamiento de hablantes; no se documentan métricas de robustez en la información disponible.
- No se documentan sesgos específicos por idioma o variedad dialectal en la información proporcionada.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario citar al autor original (NVIDIA) y respetar los términos del modelo base.
- Esta conversión GGUF es de un tercero (GhaythMahadin/handy-computer) y no está publicada por NVIDIA; la model card original es la fuente autoritativa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria amplia.
- La información de la model card original se corta en la descripción de timestamps de palabra; no se dispone del resto de detalles (datos de entrenamiento, limitaciones declaradas por NVIDIA).

## Enlaces

- Repositorio GGUF: https://huggingface.co/GhaythMahadin/parakeet-tdt-0.6b-v3-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Modelo predecesor: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-tdt-0.6b-v3.md
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/bf0d0b7
- Commit del modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3/commit/6d590f7
- Dataset Granary: https://huggingface.co/datasets/nvidia/Granary
- Demo: https://huggingface.co/spaces/nvidia/parakeet-tdt-0.6b-v3
- Papers referenciados en los tags: arXiv 2509.14128, 2505.13404, 2305.05084, 2304.06795, 2410.01036, 2406.00899, 2205.12446, 2012.03411, 2007.10310, 1510.08484
