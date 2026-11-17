# mrsoundmind/Breeze-ASR-25-gguf

## Resumen

Breeze-ASR-25-gguf es la conversión a formato GGUF del modelo de reconocimiento automático del habla MediaTek-Research/Breeze-ASR-25, publicada por el usuario mrsoundmind para su uso con transcribe.cpp. Se trata de un fine-tune de OpenAI Whisper large-v2 orientado específicamente a mandarín de Taiwán (con salida en chino tradicional) y a escenarios de code-switching mandarín-inglés, tanto intra como inter-oracional. El repositorio incluye seis cuantizaciones distintas, desde BF16 (3,10 GB) hasta Q4_K_M (1,00 GB).

El modelo base fue desarrollado por MediaTek Research y está descrito en el paper arXiv:2506.11130. Arquitectónicamente es idéntico a Whisper large-v2: un transformer encoder-decoder con ventanas de 30 segundos y decodificación por chunks para audio de formato largo. Cuenta con 1.543.321.440 parámetros y conserva el tokenizador de 99 idiomas de Whisper, aunque solo mandarín e inglés están optimizados y validados.

La relevancia de esta versión GGUF radica en que permite ejecutar un modelo ASR de 1,5 mil millones de parámetros en hardware de consumo mediante transcribe.cpp, con una pérdida de precisión prácticamente nula tras la cuantización: todos los niveles hasta Q4_K_M se mantienen dentro del ruido entre ejecuciones respecto a la referencia BF16, tanto en WER de inglés como en CER de chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v2) |
| Parametros totales | 1.543.321.440 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de 30 segundos con decodificación por chunks para audio largo |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | zh (mandarín de Taiwán, salida en chino tradicional), en; tokenizador de 99 idiomas pero solo zh/en optimizados |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder con la misma topología que Whisper large-v2: procesa audio en ventanas de 30 segundos y emplea decodificación por chunks para transcripciones de formato largo. El fine-tune se realizó sobre aproximadamente 11.749 horas de audio: 10.000 horas de mandarín sintético (ODC Synth), 1.738 horas de inglés (CommonVoice17) y 11 horas de code-switching real (NTUML2021). Esta composición explica su especialización en mandarín taiwanés y en alternancia de idiomas dentro y entre oraciones.

La conversión a GGUF se realizó a partir del commit upstream cffe7ccb404d025296a00758d0a33468bec3a9d0 (fijado el 2026-06-29) y se validó contra la referencia de transformers en el commit 3848875 de transcribe.cpp. Entre las capacidades técnicas destacables del modelo base figuran la alineación mejorada de marcas de tiempo (orientada a subtitulado automático), la detección de idioma y la traducción. La cuantización no degrada de forma medible la calidad: el WER en LibriSpeech test-clean oscila entre 2,25 % y 2,29 % en todas las variantes, y el CER en FLEURS zh entre 8,08 % y 8,12 %.

## Capacidades

- Transcripción de voz a texto (ASR) en mandarín de Taiwán e inglés.
- Salida en chino tradicional, adecuada para el mercado taiwanés.
- Code-switching mandarín-inglés intra-oracional e inter-oracional.
- Detección automática de idioma (`lang_detect: true`).
- Traducción de voz (`translate: true`).
- Marcas de tiempo a nivel de segmento (`timestamps: segment`), útiles para subtitulado.
- Alineación temporal mejorada respecto a Whisper large-v2.
- Tokenizador multilingüe de 99 idiomas heredado de Whisper (solo zh/en validados).
- No soporta streaming (`streaming: false`).

## Casos de uso

- Subtitulado automático de contenido audiovisual en mandarín taiwanés: las marcas de tiempo a nivel de segmento y la alineación mejorada permiten generar subtítulos sincronizados sin post-proceso manual intensivo.
- Transcripción de reuniones bilingües mandarín-inglés: el soporte explícito de code-switching intra e inter-oracional evita los errores típicos de Whisper al cambiar de idioma dentro de una misma frase.
- Atención al cliente en el mercado taiwanés: transcripción de llamadas y chats de voz con salida en chino tradicional, directamente consumible por sistemas downstream sin conversión de escritura.
- Generación de actas y notas de prensa: procesamiento por chunks de grabaciones largas (conferencias, ruedas de prensa) con detección de idioma para separar tramos en inglés y mandarín.
- Despliegue en hardware de consumo o periférico: con Q4_K_M (1,00 GB) el modelo cabe en equipos modestos y permite transcripción local sin conexión, con RTF de 0,6 en CPU Ryzen 4750U.
- Investigación en ASR multilingüe: la composición del dataset de entrenamiento (mandarín sintético + code-switch real) lo convierte en una referencia útil para estudiar el efecto del entrenamiento sintético en code-switching.
- Indexación y búsqueda de archivos de audio: transcripción por lotes en pipelines locales para hacer buscables archivos de audio de organizaciones taiwanesas.

## Benchmarks y rendimiento

| Benchmark | BF16 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 2,29 | 2,29 | 2,27 | 2,29 | 2,25 | 2,26 |
| CER FLEURS zh (%) | 8,12 | 8,11 | 8,10 | 8,12 | 8,12 | 8,08 |

Mediciones realizadas sobre las particiones de test completas (2620 enunciados en LibriSpeech test-clean, 945 en FLEURS `cmn_hans_cn` test), decodificadas en una Modal L40S con la receta por defecto de transcribe.cpp (greedy + temperature fallback, suppress_tokens, marcas de tiempo por segmento), batch 1. La puntuación inglesa usa el `EnglishTextNormalizer` estándar de Whisper. El CER en chino se calcula tras normalizar hipótesis y referencia a chino simplificado con OpenCC (`t2s`), ya que Breeze emite chino tradicional y FLEURS no dispone de partición en tradicional; sin esa normalización el CER bruto ronda el 35 % y carece de significado.

Rendimiento (RTF, real-time factor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 23,7 |
| Apple M4 Max | CPU | 1,5 |
| AMD Ryzen 4750U | Vulkan | 2,1 |
| AMD Ryzen 4750U | CPU | 0,6 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0 GB con Q4_K_M, 1,67 GB con Q8_0 y 3,1 GB con BF16/F16.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de memoria para las cuantizaciones bajas; L40S validada para benchmarks; soporte Metal en Apple Silicon (M4 Max medido).
- Cabe en GPU de consumo: sí, todas las cuantizaciones caben en GPUs consumer con 4 GB o más; Q4_K_M y Q5_K_M son adecuadas incluso para iGPU y sistemas con poca memoria.
- Opciones de despliegue: transcribe.cpp (requiere compilación desde fuente con CMake); backends CPU, Metal y Vulkan. No se indica soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 0,6 en CPU Ryzen 4750U y 1,5 en CPU M4 Max; 2,1 con Vulkan en Ryzen 4750U y 23,7 con Metal en M4 Max. El audio debe estar en WAV mono a 16 kHz (conversión previa con ffmpeg).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Breeze-ASR-25 (este) | 1,54 B | ventanas de 30 s | zh (tradicional), en | Apache-2.0 | GGUF |
| Whisper large-v2 | 1,55 B | ventanas de 30 s | 99 idiomas | MIT | safetensors, GGUF |
| Whisper large-v3 | 1,55 B | ventanas de 30 s | 99 idiomas | MIT | safetensors, GGUF |

Frente a Whisper large-v2, del que deriva, Breeze-ASR-25 mejora la transcripción de mandarín taiwanés, el code-switching y la alineación temporal, y emite chino tradicional. Whisper large-v2 y large-v3 cubren más idiomas pero no están específicamente optimizados para mandarín de Taiwán ni para code-switching. No se dispone de datos de benchmarks comparativos directos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo mandarín e inglés están optimizados y validados; el resto de idiomas del tokenizador de 99 entradas quedan fuera del alcance previsto y su calidad no está garantizada.
- Emite chino tradicional: los sistemas downstream que esperen chino simplificado requieren normalización con OpenCC u equivalente.
- No soporta streaming (`streaming: false`); está pensado para decodificación por lotes o por chunks.
- La decodificación de audio largo depende de chunking con ventanas de 30 segundos; audios mal segmentados pueden degradar la coherencia.
- Riesgo de alucinación inherente a los modelos Whisper en segmentos con silencio, ruido o música.
- El CER en chino (≈8 %) es notablemente superior al WER en inglés (≈2,3 %), por lo que la precisión en mandarín es menor.
- La licencia Apache-2.0 se hereda del modelo base; conviene revisar la model card upstream para los términos completos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la librería transcribe.cpp requiere compilación desde fuente, lo que añade fricción de despliegue.
- Las mediciones de RTF y benchmarks provienen del autor de la conversión; no se han replicado de forma independiente en la información disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mrsoundmind/Breeze-ASR-25-gguf
- Modelo base: https://huggingface.co/MediaTek-Research/Breeze-ASR-25
- Commit upstream fijado: https://huggingface.co/MediaTek-Research/Breeze-ASR-25/commit/cffe7ccb404d025296a00758d0a33468bec3a9d0
- Paper: https://arxiv.org/pdf/2506.11130
- Repositorio GitHub de Breeze-ASR-25: https://github.com/mtkresearch/Breeze-ASR-25
- Repositorio transcribe.cpp: https://github.com/mrsoundmind/transcribe.cpp
- Whisper (OpenAI): https://github.com/openai/whisper
- Ejemplo de code-switching: https://www.youtube.com/watch?v=YkUv5qyhVhw&t=261s
