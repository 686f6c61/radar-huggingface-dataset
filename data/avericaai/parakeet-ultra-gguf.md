# avericaai/parakeet-ultra-gguf

## Resumen

parakeet-ultra-gguf es la conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) moondream/parakeet-ultra, publicada por el usuario avericaai para su uso con el runtime transcribe.cpp. El modelo base es un post-entrenamiento de parakeet-tdt-0.6b-v3 de NVIDIA, desarrollado por Moondream, que mantiene la misma arquitectura, tokenizer y 0,6 mil millones de parámetros en precisión completa. Esta conversión permite ejecutar el modelo en C++ sobre CPU, Metal y Vulkan con cuantizaciones que van desde F32 (2,51 GB) hasta Q4_K_M (486 MB).

El modelo resuelve transcripción multilingüe offline de audio en 25 idiomas europeos, con puntuación, mayúsculas y marcas de tiempo opcionales a nivel de token. Incorpora una cabeza de detección de actividad de voz que segmenta grabaciones largas en cortes de pausa de hasta 30 segundos, lo que lo hace adecuado para audio de formato largo sin preprocesado manual. No es un modelo de streaming ni traduce entre idiomas.

Su relevancia actual radica en que ofrece una alternativa de código abierto (CC-BY-4.0) con tasas de error inferiores a la versión v3 en inglés y en todos los idiomas FLEURS medidos, con un tamaño reducido que cabe en hardware de consumo y con un rendimiento en CPU que permite desplegarlo sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + TDT (transducer decoder) + cabeza de voice activity |
| Parametros totales | 627.265.543 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (segmentacion por VAD en tramos de hasta 30 s) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 25: en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura parakeet-tdt-0.6b-v3: un encoder FastConformer combinado con un decodificador transducer TDT (Token-and-Duration Transducer). Sobre esa base, Moondream aplica un post-entrenamiento que conserva arquitectura, tokenizer y número de parámetros, pero mejora los resultados en todos los grupos de benchmarks reportados. Adicionalmente, el modelo incorpora una pequeña cabeza de detección de actividad de voz que utiliza para cortar grabaciones largas en pausas y generar segmentos de como máximo 30 segundos, replicando el comportamiento del runtime de referencia kestrel 0.9.1 (el motor detrás de Photon).

La conversión a GGUF fue realizada por avericaai a partir del commit upstream 73175eb (fijado el 2026-10-04) y validada contra la referencia kestrel 0.9.1 en el commit 08f9e6f0 de transcribe.cpp el 2026-10-05. La decodificación es greedy transducer sin modelo de lenguaje externo. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el post-entrenamiento.

## Capacidades

- Transcripción de voz a texto offline en 25 idiomas europeos.
- Salida con puntuación y mayúsculas (transcripción "cased and punctuated").
- Marcas de tiempo opcionales a nivel de token.
- Detección automática de idioma (lang_detect: true).
- Segmentación de audio de formato largo mediante cabeza de voice activity, con cortes en pausas y tramos de hasta 30 segundos.
- Entrada de audio a 16 kHz mono WAV.
- No soporta streaming (streaming: false).
- No soporta traducción entre idiomas (translate: false).
- No dispone de tool calling, function calling ni capacidades de agente; es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo procesa audio de formato largo segmentándolo automáticamente por actividad de voz en tramos de hasta 30 segundos, lo que permite transcribir conversaciones completas sin cortes manuales previos.
- Subtitulado y generación de actas: las marcas de tiempo a nivel de token permiten alinear la transcripción con el audio para producir subtítulos o actas con referencias temporales.
- Atención al cliente y análisis de llamadas: con 0,6B parámetros y cuantización Q4_K_M de 486 MB, puede desplegarse en servidores modestos o incluso en CPU para transcribir grandes volúmenes de llamadas en varios idiomas europeos.
- Investigación lingüística multilingüe: cubre 25 idiomas (incluidos eslavos, bálticos y maltés) con un único modelo, lo que simplifica estudios comparativos de ASR sin gestionar múltiples modelos por idioma.
- Despliegue en dispositivos sin GPU: los benchmarks de rendimiento en Ryzen 4750U (RTF 13,29 en CPU y 23,0 en Vulkan) y en M4 Max (RTF 35,03 en CPU y 189,12 en Metal) indican que es viable en portátiles y equipos de consumo.
- Pipelines de accesibilidad: transcripción local de audio para personas con discapacidad auditiva, con la ventaja de que el procesamiento es offline y no requiere enviar audio a servicios externos.
- Archivado y búsqueda de contenido audiovisual: la transcripción con timestamps permite indexar y buscar dentro de grabaciones largas de podcasts, clases o seminarios.

## Benchmarks y rendimiento

Tasa de error de palabra (WER) en LibriSpeech test-clean (2.620 enunciados, batch 8, timestamps none, language hint `en`, decodificado en CUDA, transcribe.cpp 021aa17d):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 2,51 GB | 1,80 % |
| F16 | 1,26 GB | 1,80 % |
| Q8_0 | 740 MB | 1,80 % |
| Q6_K | 611 MB | 1,81 % |
| Q5_K_M | 550 MB | 1,81 % |
| Q4_K_M | 486 MB | 1,82 % |

La referencia kestrel 0.9.1 obtiene 1,80 % en el mismo manifiesto; la model card de Moondream reporta 1,41 % en el mismo split con el normalizador del Open ASR Leaderboard. En formato largo, sobre 11 charlas completas de TED-LIUM 3 segmentadas por la cabeza de VAD, F32 obtiene 2,22 % (idéntico a kestrel) y todas las cuantizaciones se mantienen dentro de 0,05 pp.

WER en FLEURS con cuantización Q8_0:

| Idioma | WER Q8_0 |
|---|---:|
| en | 4,26 % |
| de | 4,58 % |
| fr | 4,66 % |
| es | 3,06 % |
| it | 2,34 % |
| pt | 4,16 % |
| ru | 5,63 % |
| uk | 5,71 % |
| hr | 11,30 % |
| sl | 18,98 % |
| lv | 18,04 % |
| lt | 17,06 % |
| et | 14,44 % |
| fi | 11,14 % |
| sv | 12,83 % |
| da | 15,98 % |
| nl | 6,70 % |
| pl | 6,16 % |
| cs | 11,04 % |
| sk | 7,83 % |
| hu | 13,09 % |
| ro | 10,12 % |
| bg | 11,04 % |
| el | 32,25 % |
| mt | 17,01 % |

Rendimiento relativo (RTF, factor de tiempo real):

| Plataforma | CPU | Aceleracion |
|---|---:|---:|
| M4 Max | 35,03 | Metal: 189,12 |
| Ryzen 4750U | 13,29 | Vulkan: 23,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: entre 486 MB (Q4_K_M) y 2,51 GB (F32); F16 ocupa 1,26 GB y Q8_0 740 MB.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; el modelo se ha validado en CUDA, Metal y Vulkan.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_M a Q8_0 (486-740 MB) en cualquier GPU con al menos 1 GB de VRAM; incluso la versión F32 (2,51 GB) cabe en GPUs de gama media.
- Opciones de despliegue: transcribe.cpp (runtime principal, compilado desde fuente con CMake), con soporte de CPU, Metal (Apple Silicon) y Vulkan. No se mencionan vLLM, llama.cpp ni Ollama, ya que es un formato GGUF específico de transcribe.cpp para ASR.
- Latencia y throughput: RTF de 35,03 (CPU) y 189,12 (Metal) en M4 Max; RTF de 13,29 (CPU) y 23,0 (Vulkan) en Ryzen 4750U. Un RTF superior a 1 indica procesamiento más rápido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---|---|---|---|
| parakeet-ultra (este GGUF) | 0,6B | 25 | 1,80 % (kestrel) / 1,41 % (Open ASR Leaderboard) | CC-BY-4.0 | GGUF |
| parakeet-tdt-0.6b-v3 (NVIDIA) | 0,6B | 25 | no disponible en la informacion | no disponible en la informacion | safetensors |
| whisper-large-v3 (referencia de categoria) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

La información proporcionada solo permite comparar con parakeet-tdt-0.6b-v3, del cual parakeet-ultra es un post-entrenamiento que mejora los resultados en inglés y en todos los idiomas FLEURS medidos. No se dispone de datos de benchmarks de otros modelos ASR comparables en la información disponible.

## Limitaciones y advertencias

- No es un modelo de streaming: no puede transcribir audio en tiempo real mientras se captura.
- No traduce: solo transcribe en el idioma del audio.
- Requiere entrada de audio a 16 kHz mono WAV; es necesario convertir otros formatos con ffmpeg antes de la inferencia.
- El rendimiento es muy desigual entre idiomas: el WER en FLEURS varía desde 2,34 % en italiano hasta 32,25 % en griego, pasando por 18,98 % en esloveno o 18,04 % en letón. Para idiomas con WER alto, la calidad puede ser insuficiente en producción.
- Riesgo de alucinación: no se documenta explícitamente en la información disponible, pero es un riesgo inherente a los modelos transducer en segmentos con ruido o silencio.
- Sesgos conocidos: no se documentan en la información disponible.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución; es necesario conservar el aviso de licencia y el NOTICE de derivación.
- La conversión GGUF está validada contra kestrel 0.9.1 en un commit concreto de transcribe.cpp (08f9e6f0); cambios en el runtime pueden alterar los resultados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor (avericaai) no es el mismo que el del repositorio de referencia (handy-computer) que aparece en los enlaces de descarga de la model card; conviene verificar la procedencia de los archivos antes de usarlos en producción.
- No hay información sobre el proceso de post-entrenamiento (datos, RLHF/DPO), lo que limita la evaluación de riesgos de sesgo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/avericaai/parakeet-ultra-gguf
- Modelo base: https://huggingface.co/moondream/parakeet-ultra
- Commit upstream de referencia: https://huggingface.co/moondream/parakeet-ultra/commit/73175eb
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/08f9e6f0
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-ultra.md
- Modelo original NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Repositorio alternativo de la conversión: https://huggingface.co/tryambientai/parakeet-ultra-gguf
- Licencia: https://huggingface.co/handy-computer/parakeet-ultra-gguf/blob/main/LICENSE
- NOTICE de derivación: https://huggingface.co/handy-computer/parakeet-ultra-gguf/blob/main/NOTICE
