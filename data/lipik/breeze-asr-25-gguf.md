# lipik/Breeze-ASR-25-gguf

## Resumen

Breeze-ASR-25-gguf es una conversión a formato GGUF del modelo de reconocimiento automático del habla MediaTek-Research/Breeze-ASR-25, publicada por el usuario lipik para su uso con el runtime transcribe.cpp. El modelo subyacente lo desarrolla MediaTek Research y es un ajuste fino de OpenAI Whisper large-v2 orientado a mandarín de Taiwán (emite caracteres tradicionales) e inglés, con soporte explícito de alternancia de código mandarín-inglés tanto intra como inter-frase. Esta conversión conserva la licencia Apache-2.0 del modelo base y añade cuantizaciones de 1,00 GB a 3,11 GB.

El interés práctico de esta ficha es doble. Por un lado, ofrece una vía de despliegue ligera y sin dependencias de Python: un binario de transcribe.cpp con un único fichero GGUF, apto para CPU y GPU consumer. Por otro, cuantiza un modelo de 1.543.321.440 parámetros sin pérdida medible: todas las cuantizaciones hasta Q4_K_M (1,00 GB) quedan dentro del ruido entre ejecuciones respecto a la referencia BF16, con 2,25-2,29 % de WER en LibriSpeech test-clean y 8,08-8,12 % de CER en FLEURS zh.

Arquitectónicamente es idéntico a Whisper large-v2: transformer encoder-decoder con ventanas de 30 segundos y decodificación troceada para audio largo. La model card declara detección de idioma, traducción al inglés y marcas de tiempo a nivel de segmento, pero no soporte de streaming.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v2), ventanas de 30 s con decodificación long-form troceada |
| Parámetros totales | 1.543.321.440 (≈1,54 mil millones) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Ventana de audio de 30 s por segmento; audio largo mediante troceado. Ventana de texto no aplicable (modelo ASR) |
| Tipos de cuantización | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Chino mandarín (salida en caracteres tradicionales) e inglés, incluida alternancia de código; el tokenizador conserva 99 idiomas de Whisper pero solo zh/en están optimizados y validados |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base |

Tamaños de fichero por cuantización, según la model card:

| Cuantización | Fichero | Tamaño |
|---|---|---:|
| BF16 | Breeze-ASR-25-BF16.gguf | 3,10 GB |
| F16 | Breeze-ASR-25-F16.gguf | 3,11 GB |
| Q8_0 | Breeze-ASR-25-Q8_0.gguf | 1,67 GB |
| Q6_K | Breeze-ASR-25-Q6_K.gguf | 1,30 GB |
| Q5_K_M | Breeze-ASR-25-Q5_K_M.gguf | 1,16 GB |
| Q4_K_M | Breeze-ASR-25-Q4_K_M.gguf | 1,00 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v2 sin cambios estructurales: encoder-decoder transformer que procesa espectrogramas mel en ventanas de 30 segundos y decodifica texto de forma autorregresiva, con decodificación troceada para audio de mayor duración. El ajuste fino va dirigido a tres objetivos declarados por MediaTek Research: mejorar el reconocimiento de mandarín de Taiwán, mejorar los escenarios de alternancia mandarín-inglés (intra e inter-frase) y reforzar la alineación temporal para generación automática de subtítulos. El modelo conserva el tokenizador multilingüe de 99 idiomas de Whisper, aunque solo chino e inglés están optimizados y validados.

El entrenamiento declarado suma aproximadamente 11.749 horas: 10.000 horas de mandarín sintético (ODC Synth), 1.738 horas de inglés (CommonVoice 17) y 11 horas de alternancia de código real (NTUML2021). No se detalla en la información disponible si hubo etapas de RLHF, DPO u otro ajuste por preferencias, ni la composición exacta del dataset más allá de esas tres fuentes. La conversión GGUF parte del commit upstream `cffe7ccb404d025296a00758d0a33468bec3a9d0`, fijado el 2026-06-29, y se validó numéricamente contra la referencia de transformers con el commit `3848875` de transcribe.cpp en la misma fecha.

## Capacidades

- Reconocimiento de voz (speech-to-text) en mandarín de Taiwán con salida en chino tradicional e inglés.
- Alternancia de código mandarín-inglés, tanto dentro de una misma frase como entre frases.
- Detección automática de idioma (`lang_detect: true` según la model card).
- Traducción de voz al inglés (`translate: true`), capacidad heredada de Whisper.
- Marcas de tiempo a nivel de segmento (`timestamps: segment`), adecuadas para subtitulado automático.
- Procesamiento de audio largo mediante troceado de ventanas de 30 s.
- Inferencia en CPU y GPU a través de transcribe.cpp, con ficheros GGUF autocontenidos.
- No soporta streaming (`streaming: false`): requiere el audio completo o troceado por parte del usuario.
- No es un modelo de texto ni de chat: no hay generación de texto libre, tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- Sin soporte de visión, audio-vision, diarización de hablantes ni salida JSON estructurada documentada.

## Casos de uso

- Subtitulado automático de vídeo en chino tradicional: el modelo emite marcas de tiempo por segmento y caracteres tradicionales de forma nativa, por lo que un pipeline de ffmpeg (extracción a WAV 16 kHz mono) más transcribe-cli produce un SRT utilizable sin post-procesado de conversión de escritura.
- Transcripción de reuniones técnicas con alternancia de código: en entornos de Taiwán es habitual mezclar mandarín e inglés en la misma frase ("open mind, open heart", nombres de producto, siglas); el ajuste con NTUML2021 y datos sintéticos cubre ese patrón, que los Whisper genéricos suelen romper.
- Atención al cliente y análisis de calidad en centros de llamadas bilingües zh/en: la transcripción por lotes con Q8_0 (1,67 GB) permite procesar grabaciones en servidores sin GPU dedicada, y el CER de 8,1 % en FLEURS zh es suficiente para analítica de temas y búsqueda de palabras clave.
- Archivística y documentación histórica en mandarín: digitalización de fondos de audio con salida en tradicional, usando Q4_K_M (1,00 GB) para ejecución masiva en CPU y revisión humana posterior sobre los segmentos con marcas de tiempo.
- Despliegue en portátil o equipo de campo sin conectividad: con Q5_K_M (1,16 GB) o Q4_K_M el modelo cabe en RAM y se ejecuta con el backend de CPU de transcribe.cpp, útil para entrevistas o trabajo de campo donde no se puede enviar audio a la nube.
- Generación de subtítulos en inglés a partir de audio en mandarín: la capacidad de traducción (`translate: true`) permite producir pistas en inglés para distribución internacional, con la advertencia de que la traducción integrada de Whisper puede perder matices frente a un pipeline ASR + traducción separada.
- Preprocesado de corpus para entrenamiento de modelos de lenguaje: transcripción de horas de audio a texto con detección de idioma para filtrar segmentos zh, en, o mixtos antes de la curación del dataset.

## Benchmarks y rendimiento

Resultados declarados en la model card. Inglés: WER sobre LibriSpeech test-clean (2.620 enunciados completos, normalizador `EnglishTextNormalizer`). Chino: CER sobre FLEURS `cmn_hans_cn` test (945 enunciados), calculado tras convertir hipótesis y referencia a simplificado con OpenCC (`t2s`), ya que el modelo emite tradicional; sin esa normalización el CER bruto ronda el 35 % y no es comparable. Decodificación con la receta por defecto de transcribe.cpp (greedy con fallback de temperatura, suppress_tokens, timestamps de segmento), batch 1, sobre una NVIDIA L40S en Modal.

| Cuantización | WER LibriSpeech test-clean | CER FLEURS zh (normalizado) |
|---|---:|---:|
| BF16 | 2,29 % | 8,12 % |
| F16 | 2,29 % | 8,11 % |
| Q8_0 | 2,27 % | 8,10 % |
| Q6_K | 2,29 % | 8,12 % |
| Q5_K_M | 2,25 % | 8,12 % |
| Q4_K_M | 2,26 % | 8,08 % |

La cuantización resulta prácticamente gratuita en ambos idiomas: la horquilla completa (2,25-2,29 % en inglés, 8,08-8,12 % en chino) cae dentro del ruido entre ejecuciones. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros conjuntos estándar de LLM, que no aplican a un modelo ASR.

Rendimiento de inferencia declarado (factor de tiempo real, RTF). La model card no especifica la unidad ni la dirección de mejora, y los valores son inconsistentes entre backends, por lo que se reproducen tal cual:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 23,7 |
| Apple M4 Max | CPU | 1,5 |
| AMD Ryzen 7 4750U | Vulkan | 2,1 |
| AMD Ryzen 7 4750U | CPU | 0,6 |

## Requisitos de hardware

- VRAM estimada para inferencia (a partir del tamaño de fichero más overhead de runtime y buffers de audio): Q4_K_M ≈1,2-1,5 GB; Q5_K_M ≈1,3-1,6 GB; Q6_K ≈1,5-1,8 GB; Q8_0 ≈1,9-2,2 GB; F16/BF16 ≈3,3-3,6 GB.
- Cabe holgadamente en GPU consumer: cualquier tarjeta con 4 GB o más (RTX 3050, RTX 4060, RTX 4090) ejecuta incluso la variante F16; con 2 GB basta para Q4_K_M o Q5_K_M.
- Ejecución en CPU viable: el autor reporta RTF de 0,6 en CPU sobre un Ryzen 7 4750U con la variante cuantizada, lo que indica procesamiento por debajo del tiempo real en ese equipo.
- GPU de datacenter (A100, H100, L40S) innecesarias para un modelo de 1,54B; la validación de los benchmarks se hizo en L40S, pero el modelo no requiere esa clase de hardware.
- Backends y despliegue: transcribe.cpp (compilación con CMake, binario `transcribe-cli`), con soporte declarado de Metal, Vulkan y CPU. No hay soporte documentado en la información disponible para vLLM, TGI, Ollama ni llama.cpp con estos ficheros GGUF.
- Preprocesado obligatorio: audio a WAV mono 16 kHz (`ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).
- Throughput y latencia: no disponibles más allá de los RTF de la tabla anterior.

## Comparativa con modelos similares

| Modelo | Parámetros | Ventana de audio | Idiomas | Licencia | Formato | WER LibriSpeech test-clean |
|---|---|---|---:|---|---|---:|
| Breeze-ASR-25 GGUF (este repo) | 1,54 B | 30 s | zh (tradicional) + en, alternancia de código | Apache-2.0 | GGUF | 2,25-2,29 % |
| MediaTek-Research/Breeze-ASR-25 (original) | 1,54 B | 30 s | zh + en | Apache-2.0 | safetensors | no disponible en esta ficha |
| OpenAI Whisper large-v2 | ≈1,55 B | 30 s | 99 | MIT (según repositorio de OpenAI; verificar términos) | `.pt` / safetensors | no disponible en esta ficha |
| OpenAI Whisper large-v3 | ≈1,55 B (según documentación pública de OpenAI) | 30 s | multilingüe | MIT (según repositorio de OpenAI; verificar términos) | safetensors | no disponible en esta ficha |

La comparación cuantitativa con Whisper large-v2 y large-v3 no puede completarse con la información proporcionada: la model card de esta conversión solo reporta los resultados de Breeze-ASR-25. La diferencia funcional relevante frente a los Whisper genéricos es la especialización en mandarín de Taiwán con salida en tradicional y en alternancia de código zh/en, a costa de renunciar a la cobertura optimizada del resto de idiomas.

## Limitaciones y advertencias

- Escritura de salida: el modelo emite chino tradicional. Cualquier evaluación contra referencias en simplificado (FLEURS, por ejemplo) exige normalización con OpenCC; sin ella el CER ronda el 35 % y las métricas no son interpretables.
- Cobertura lingüística real: solo zh y en están optimizados y validados. El tokenizador de 99 idiomas sigue presente, pero usar el modelo con otros idiomas queda fuera del alcance declarado y sin garantías de calidad.
- Datos de entrenamiento mayoritariamente sintéticos: 10.000 de las 11.749 horas son mandarín sintético (ODC Synth) y solo 11 horas corresponden a alternancia de código real. Es esperable un dominio limitado en acentos, ruido de fondo, solapamientos de hablantes y registros coloquiales no representados.
- Alucinación y repetición: al heredar la arquitectura y la receta de decodificación de Whisper, el modelo es susceptible de bucles, texto inventado en silencios o música y desplazamientos de marcas de tiempo, especialmente en pasajes ruidosos. La receta por defecto incluye fallback de temperatura para mitigarlo, no para eliminarlo.
- Sin streaming: la inferencia requiere audio completo o troceado manual, lo que añade latencia en casos de uso en vivo y riesgo de errores en las fronteras entre trozos.
- Sin diarización: no distingue hablantes; para actas de reuniones hace falta un componente externo.
- Licencia: Apache-2.0 heredada del modelo base, permisiva para uso comercial. Aun así, el modelo base es un ajuste de Whisper large-v2, por lo que conviene revisar la model card upstream como fuente autoritativa de términos.
- Trazabilidad del repositorio: el autor es `lipik`, mientras que la model card enlaza descargas al repositorio `handy-computer/Breeze-ASR-25-gguf`. Con 0 descargas y 0 likes, conviene verificar la integridad de los ficheros GGUF (checksums, commit de conversión) antes de usarlos en producción, y preferir el repositorio referenciado por la propia model card si se busca la publicación original de la conversión.
- Integración limitada: al depender de transcribe.cpp, no se beneficia del ecosistema de servidores de inferencia (vLLM, TGI) ni de tooling de Python habitual; requiere compilar desde fuente y gestionar el preprocesado de audio por separado.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/lipik/Breeze-ASR-25-gguf
- Modelo base: https://huggingface.co/MediaTek-Research/Breeze-ASR-25
- Commit upstream usado para la conversión: https://huggingface.co/MediaTek-Research/Breeze-ASR-25/commit/cffe7ccb404d025296a00758d0a33468bec3a9d0
- Repositorio de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/3848875
- Página de modelo Whisper large-v2 en transcribe.cpp (rendimiento y reproducción): https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-large-v2.md
- Repositorio GGUF referenciado en la model card: https://huggingface.co/handy-computer/Breeze-ASR-25-gguf
- Repositorio GitHub de Breeze ASR 25: https://github.com/mtkresearch/Breeze-ASR-25
- Paper: https://arxiv.org/pdf/2506.11130 (arXiv:2506.11130)
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Demo de alternancia de código (MediaTek 24th Anniversary): https://www.youtube.com/watch?v=YkUv5qyhVhw&t=261s
