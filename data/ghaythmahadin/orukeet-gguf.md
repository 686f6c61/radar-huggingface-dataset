# GhaythMahadin/orukeet-gguf

## Resumen

Orukeet es un modelo de reconocimiento automático del habla (ASR) multilingüe desarrollado por Oruk AI en colaboración con investigadores de Stanford, Cambridge, OpenWhispr y Hoid. Se construye a partir de NVIDIA Parakeet TDT 0.6B v3, sustituyendo la mitad de los filtros depthwise temporales del encoder por 12.288 kernels Gabor ajustados y congelados, y reentrenando el resto de parámetros sobre datos multilingües y multiacento. El resultado es un modelo de 627 millones de parámetros que transcribe voz a texto en 25 lenguas europeas con puntuación y mayúsculas automáticas.

La ficha que nos ocupa corresponde a la conversión GGUF publicada por GhaythMahadin para su uso con transcribe.cpp, una implementación en C++ pensada para inferencia local y offline. El repositorio incluye seis niveles de cuantización (F32, F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) que van desde 2,51 GB hasta 485 MB, manteniendo un WER de 1,83-1,95 % en LibriSpeech test-clean. Esto permite ejecutar el modelo en hardware de consumo, incluyendo Mac con Metal y CPUs x86 con Vulkan.

Su relevancia actual radica en que ofrece una alternativa local y ligera a servicios de transcripción en la nube, con cobertura de 25 idiomas europeos y un rendimiento que, según el autor, supera a Parakeet v3 en 61 de 74 particiones evaluadas. No obstante, el modelo no soporta streaming ni traducción, y su licencia CC-BY-SA-4.0 impone obligaciones de compartir igual para obras derivadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con TDT (Token-and-Duration Transducer), encoder basado en Parakeet TDT 0.6B v3 con filtros Gabor congelados |
| Parametros totales | 627.052.166 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no de contexto textual) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 25: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, ru, sk, sl, es, sv, uk |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | GGUF (para transcribe.cpp); el modelo base en safetensors |
| Tamano del repositorio | 1,2 GB |
| Entrada de audio | WAV mono a 16 kHz |
| Timestamps | A nivel de token |
| Deteccion de idioma | Si |
| Streaming | No |
| Traduccion | No |

## Arquitectura y entrenamiento

Orukeet parte de NVIDIA Parakeet TDT 0.6B v3, un modelo Conformer con decodificador TDT (Token-and-Duration Transducer). La innovación principal consiste en reemplazar la mitad de los filtros depthwise temporales del encoder por 12.288 kernels Gabor ajustados y congelados, lo que reduce el número de parámetros entrenables y aporta una base espectral inductiva al procesamiento temporal. El resto de parámetros se reentrena sobre datos multilingües y multiacento, aunque la información disponible no detalla el volumen de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

La conversión GGUF realizada por GhaythMahadin se basa en el commit upstream b59c13a (fijado el 2026-10-06) y se validó contra la referencia NeMo en el commit 65856fac de transcribe.cpp. El modelo no soporta streaming ni traducción, pero sí detección de idioma y timestamps a nivel de token. La inferencia se realiza sobre audio WAV mono a 16 kHz, con puntuación y mayúsculas generadas automáticamente.

## Capacidades

- Transcripción de voz a texto en 25 lenguas europeas (búlgaro, croata, checo, danés, neerlandés, inglés, estonio, finés, francés, alemán, griego, húngaro, italiano, letón, lituano, maltés, polaco, portugués, rumano, ruso, eslovaco, esloveno, español, sueco y ucraniano).
- Generación automática de puntuación y mayúsculas en la salida.
- Detección automática de idioma (`lang_detect: true`).
- Timestamps a nivel de token.
- Inferencia offline y local mediante transcribe.cpp.
- Ejecución en CPU (x86 con Vulkan) y en Apple Silicon con Metal.
- No soporta streaming ni traducción.

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa audio WAV mono a 16 kHz y genera texto con puntuación y mayúsculas, adecuado para pipelines de post-procesado que requieran actas o resúmenes posteriores.
- Subtitulado offline: los timestamps a nivel de token permiten alinear el texto con el audio para generar subtítulos en 25 idiomas europeos sin depender de servicios en la nube.
- Dictado local en aplicaciones de escritorio: con cuantizaciones Q4_K_M (485 MB) o Q5_K_M (549 MB), el modelo cabe en memoria de un portátil convencional y puede integrarse en herramientas de dictado que requieran privacidad.
- Transcripción de archivos de audio históricos o periodísticos: la cobertura de 25 lenguas y la detección automática de idioma facilitan el procesamiento por lotes de archivos multilingües.
- Atención al cliente con voz: integración en sistemas de call center para transcribir llamadas en tiempo diferido (no streaming) y alimentar análisis de calidad o búsqueda semántica.
- Investigación lingüística y corpus orales: la licencia CC-BY-SA-4.0 y la disponibilidad de pesos GGUF permiten reproducir experimentos y comparar WER por idioma con Fleurs.
- Procesamiento en dispositivos con recursos limitados: la cuantización Q4_K_M (485 MB) y el soporte de Vulkan en CPU (RTF 13,62 en Ryzen 4750U) permiten desplegar ASR en equipos sin GPU dedicada.

## Benchmarks y rendimiento

WER en LibriSpeech test-clean (2.620 enunciados, batch 8, sin timestamps, hint de idioma `en`, decodificado en CUDA):

| Cuantizacion | WER LibriSpeech test-clean |
|---|---:|
| F32 | 1,86 % |
| F16 | 1,86 % |
| Q8_0 | 1,86 % |
| Q6_K | 1,86 % |
| Q5_K_M | 1,83 % |
| Q4_K_M | 1,95 % |

WER en Fleurs por idioma (cuantización Q8_0):

| Idioma | WER |
|---|---:|
| bg | 11,14 % |
| hr | 11,26 % |
| cs | 10,22 % |
| da | 16,58 % |
| nl | 6,93 % |
| en | 4,43 % |
| et | 15,16 % |
| fi | 11,88 % |
| fr | 6,17 % |
| de | 5,64 % |
| el | 33,12 % |
| hu | 13,53 % |
| it | 3,11 % |
| lv | 19,53 % |
| lt | 17,72 % |
| mt | 17,18 % |
| pl | 7,35 % |
| pt | 4,56 % |
| ro | 10,86 % |
| ru | 6,70 % |
| sk | 8,99 % |
| sl | 24,00 % |
| es | 3,75 % |
| sv | 13,26 % |
| uk | 6,53 % |

Rendimiento en tiempo real (RTF, menor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Mac M4 Max | CPU | 36,31 |
| Mac M4 Max | Metal | 203,70 |
| Ryzen 4750U | CPU | 13,62 |
| Ryzen 4750U | Vulkan | 25,09 |

El autor indica que Orukeet supera a Parakeet v3 en 61 de 74 particiones evaluadas, incluyendo LibriSpeech, y que parakeet-ultra es más preciso que ambos en casi todo. No se han publicado en la información disponible resultados comparativos adicionales (MMLU, HumanEval, GSM8K no aplican a un modelo ASR).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo GGUF más overhead de runtime. F32: ~2,51 GB; F16: ~1,26 GB; Q8_0: ~740 MB; Q6_K: ~610 MB; Q5_K_M: ~549 MB; Q4_K_M: ~485 MB.
- GPU recomendadas: cualquier GPU con soporte CUDA para transcribe.cpp; en Apple Silicon se usa Metal. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, las cuantizaciones Q4_K_M a Q8_0 caben en GPUs con 2 GB o más de VRAM; F32 requiere ~3 GB.
- Opciones de despliegue: transcribe.cpp (compilación desde fuente con CMake), con binario `transcribe-cli`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este formato ASR).
- Latencia y throughput: RTF de 13,62 (CPU Ryzen 4750U) a 203,70 (Metal en M4 Max); en la práctica, un RTF bajo indica mayor velocidad relativa, y los valores reportados sugieren que el modelo procesa audio más rápido que tiempo real en las plataformas medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---:|---:|---|---|
| Orukeet (este) | 627 M | 25 | 1,83-1,95 % (segun cuantizacion) | CC-BY-SA-4.0 | GGUF, safetensors |
| Parakeet TDT 0.6B v3 | ~600 M | 25 | no disponible en la informacion | no disponible | safetensors |
| parakeet-ultra | no disponible | no disponible | no disponible (el autor indica que es mas preciso que Orukeet en casi todo) | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos adicionales en la información proporcionada.

## Limitaciones y advertencias

- No soporta streaming: la transcripción es por lotes sobre archivos completos.
- No soporta traducción: solo transcribe en el idioma de origen.
- Requiere audio WAV mono a 16 kHz; es necesario convertir otros formatos con ffmpeg.
- El WER varía notablemente por idioma: griego (33,12 %), esloveno (24,00 %), letón (19,53 %) y lituano (17,72 %) presentan errores mucho mayores que italiano (3,11 %), español (3,75 %) o inglés (4,43 %).
- Riesgo de alucinación y errores en audio con ruido, acentos no representados en el entrenamiento o solapamiento de hablantes; no se documentan sesgos específicos en la información disponible.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero obliga a compartir igual las obras derivadas y a atribuir; revisar términos upstream en oruk/orukeet.
- El repositorio GGUF es una conversión de terceros (GhaythMahadin); la fuente autoritativa es el modelo base oruk/orukeet.
- No se documentan garantías de producción ni SLA; validar numéricamente contra NeMo antes de desplegar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/GhaythMahadin/orukeet-gguf
- Modelo base: https://huggingface.co/oruk/orukeet
- Commit upstream: https://huggingface.co/oruk/orukeet/commit/b59c13a
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/orukeet.md
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/65856fac
- Web de Oruk AI: https://oruk.ai
- Paper referenciado (arXiv): https://arxiv.org/abs/2609.10054
