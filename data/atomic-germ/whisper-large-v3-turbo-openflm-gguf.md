# Atomic-Germ/whisper-large-v3-turbo-OpenFLM-GGUF

## Resumen

whisper-large-v3-turbo-OpenFLM-GGUF es una conversión a formato GGUF del modelo openai/whisper-large-v3-turbo, publicada por el usuario Atomic-Germ para su uso con transcribe.cpp, un runtime de inferencia centrado en modelos de reconocimiento automático del habla. El modelo original lo desarrolla OpenAI y deriva de Whisper large-v3, del que se han podado las capas del decodificador de 32 a 4, lo que reduce drásticamente el coste de inferencia a cambio de una degradación menor de calidad.

La relevancia de esta conversión radica en que empaqueta un modelo ASR multilingüe de referencia en cuantizaciones de 511 MB a 1,51 GB, con una tasa de error de palabra (WER) de en torno al 2 % en LibriSpeech test-clean, prácticamente idéntica a la del modelo en precisión completa. Esto permite desplegar transcripción multilingüe en hardware modesto, incluidas CPU y GPU de consumo, mediante el binario transcribe-cli.

El modelo es un transformer encoder-decoder con ventanas de 30 segundos y decodificación por trozos para audio largo. Soporta detección de idioma y transcripción en más de 90 idiomas, pero no soporta traducción de voz (task="translate"), capacidad que sí está presente en whisper-large-v3. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3 podado: 4 capas de decodificador en lugar de 32) |
| Parametros totales | 808.904.208 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos con decodificación por trozos para audio largo |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | más de 90 idiomas, incluidos en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su, yue |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo base es Whisper large-v3-turbo, una versión podada de Whisper large-v3 en la que el decodificador pasa de 32 a 4 capas, manteniendo el codificador. Es un transformer encoder-decoder que procesa audio en ventanas de 30 segundos representadas con 128 bins mel (frente a los 80 bins de versiones anteriores de la familia). Para audio de mayor duración, el pipeline de transcribe.cpp aplica decodificación por trozos con marcas de tiempo a nivel de segmento.

El entrenamiento original de Whisper se realizó sobre más de 5 millones de horas de audio etiquetado, según el paper "Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al., OpenAI). La variante turbo se ajustó específicamente con datos de transcripción, excluyendo la traducción, de ahí que no soporte task="translate". La conversión GGUF se realizó a partir del commit 41f01f3 de openai/whisper-large-v3-turbo (fijado el 2026-04-25) y se validó contra la referencia de transformers en el commit 5.6.1 de transcribe.cpp el 2026-04-26. No se dispone de información sobre procesos de RLHF o DPO en la información proporcionada.

## Capacidades

- Transcripción automática de voz multilingüe en más de 90 idiomas, incluidos castellano, catalán, euskera y gallego.
- Detección automática de idioma (lang_detect: true).
- Marcas de tiempo a nivel de segmento (timestamps: segment).
- Procesamiento de audio largo mediante decodificación por trozos sobre ventanas de 30 segundos.
- Soporte de la variante v3 para cantonés (yue) y entrada mel de 128 bins.
- No soporta traducción de voz (translate: false); para ello debe usarse whisper-large-v3.
- No soporta streaming (streaming: false).
- No dispone de tool calling, function calling ni capacidades de agente; es un modelo exclusivamente ASR.

## Casos de uso

- Subtitulado automático de vídeo y audio: el modelo genera marcas de tiempo por segmento, lo que permite producir ficheros de subtítulos (SRT/VTT) de forma directa con el pipeline de transcribe.cpp.
- Transcripción de reuniones y entrevistas: con detección de idioma y ventanas de 30 segundos con decodificación por trozos, puede procesar grabaciones de larga duración en una sola pasada.
- Atención al cliente y análisis de llamadas: la cuantización Q4_K_M (511 MB) permite ejecutar la transcripción en servidores modestos o en el borde, con un WER de en torno al 2 % en inglés limpio.
- Accesibilidad y dictado: integración en aplicaciones de escritorio o móviles mediante el binario transcribe-cli, con conversión previa del audio a WAV mono de 16 kHz con ffmpeg.
- Indexación y búsqueda de archivos de audio: transcripción masiva de archivos para alimentar motores de búsqueda o sistemas de gestión documental, aprovechando el reducido tamaño de los pesos cuantizados.
- Investigación en ASR multilingüe: evaluación de la degradación por cuantización (F16 frente a Q4_K_M) sobre corpus propios, dado que las tasas de error publicadas son casi idénticas entre cuantizaciones.
- Despliegue en hardware sin GPU dedicada: la tasa de tiempo real (RTF) de 0,8 en CPU Ryzen 4750U permite transcripción más rápida que tiempo real sin acelerador.

## Benchmarks y rendimiento

| Metrica | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 2,00 | 2,00 | 1,96 | 2,00 | 2,00 |
| Tamano (GB) | 1,51 | 0,845 | 0,660 | 0,591 | 0,511 |

| Entorno | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 46,4 |
| Apple M4 Max | CPU | 1,8 |
| AMD Ryzen 4750U | Vulkan | 3,4 |
| AMD Ryzen 4750U | CPU | 0,8 |

El WER se midió sobre el conjunto completo LibriSpeech test-clean (2620 enunciados) con la decodificación por defecto de transcribe.cpp (greedy, suppress_tokens, temperature fallback y marcas de tiempo por segmento). OpenAI reporta un 2,10 % en el mismo conjunto con su propia configuración de evaluación. Las cifras proceden de una única ejecución en CUDA (L4) con estos GGUF exactos; la variación entre ejecuciones y backends es de aproximadamente 0,1 puntos porcentuales. La diferencia con OpenAI se atribuye probablemente a que model.generate() usa <|notimestamps|> por defecto, mientras que el pipeline de transcribe.cpp activa las marcas de tiempo. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) porque no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB con Q4_K_M, 0,85 GB con Q8_0 y 1,5 GB con F16, más el margen del runtime y del búfer de audio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; las mediciones publicadas usan una NVIDIA L4 en CUDA.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 2 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050 en adelante).
- Despliegue: transcribe.cpp (binario transcribe-cli) con backends Metal, Vulkan, CUDA y CPU. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 46,4 en Metal (M4 Max), 3,4 en Vulkan (Ryzen 4750U), 1,8 en CPU (M4 Max) y 0,8 en CPU (Ryzen 4750U). Un RTF superior a 1 implica procesar audio más rápido que tiempo real.
- El audio debe convertirse previamente a WAV mono de 16 kHz (por ejemplo, con ffmpeg -ar 16000 -ac 1).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| whisper-large-v3-turbo-OpenFLM-GGUF | 808.904.208 | ventanas de 30 s con chunking | más de 90 | Apache-2.0 | GGUF |
| openai/whisper-large-v3-turbo | no disponible en la información | ventanas de 30 s con chunking | más de 90 | Apache-2.0 | safetensors |
| openai/whisper-large-v3 | no disponible en la información | ventanas de 30 s con chunking | más de 90 | Apache-2.0 | safetensors |

Frente a whisper-large-v3, la variante turbo reduce el decodificador de 32 a 4 capas, lo que la hace mucho más rápida con una degradación menor de calidad, pero pierde la capacidad de traducción de voz. Frente al modelo original en safetensors, esta conversión GGUF ofrece cuantizaciones de 511 MB a 1,51 GB con un WER equivalente, a cambio de requerir el runtime transcribe.cpp. No se dispone de datos de benchmarks comparativos con otros modelos ASR en la información proporcionada.

## Limitaciones y advertencias

- No soporta traducción de voz: task="translate" no está disponible; para traducción debe usarse whisper-large-v3.
- No soporta streaming: la transcripción requiere audio completo o troceado externo.
- Riesgo de alucinación en clips cortos o con ruido de fondo, según señala el autor; es la principal fuente de variación en el WER.
- El WER publicado corresponde a LibriSpeech test-clean en inglés; el rendimiento en otros idiomas y en audio con ruido, acentos o solapamiento de hablantes no está cuantificado en la información disponible.
- Las cifras de WER proceden de una única ejecución en CUDA (L4); pueden variar según backend y hardware.
- Requiere entrada en WAV mono de 16 kHz; el audio en otros formatos debe convertirse previamente.
- Licencia Apache-2.0, que permite uso comercial, pero sujeta a los términos del modelo base de OpenAI; conviene revisar la model card upstream.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- No dispone de capacidades de tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo ASR.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Atomic-Germ/whisper-large-v3-turbo-OpenFLM-GGUF
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Commit del modelo base: https://huggingface.co/openai/whisper-large-v3-turbo/commit/41f01f3
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Versión de transcribe.cpp usada para validación: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-large-v3-turbo.md
- Paper de Whisper: https://huggingface.co/papers/2212.04356
- Discusión de OpenAI sobre la variante turbo: https://github.com/openai/whisper/discussions/2363
- Pesos GGUF alternativos del mismo modelo base: https://huggingface.co/handy-computer/whisper-large-v3-turbo-gguf
