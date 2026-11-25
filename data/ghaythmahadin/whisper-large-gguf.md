# GhaythMahadin/whisper-large-gguf

## Resumen

whisper-large-gguf es una conversión al formato GGUF del modelo openai/whisper-large, realizada por GhaythMahadin y pensada para su uso con el motor de inferencia transcribe.cpp. Se trata, por tanto, de una redistribución cuantizada de un modelo ya existente, no de un entrenamiento nuevo: el modelo base es el Whisper large original de OpenAI, un transformer encoder-decoder especializado en reconocimiento automático del habla (ASR) y traducción de voz a texto en inglés, publicado originalmente en 2022 junto con el paper *Robust Speech Recognition via Large-Scale Weak Supervision*.

La relevancia de esta ficha no está en el modelo en sí, sino en el empaquetado: ofrece el mismo Whisper large en seis niveles de cuantización (de F32 a Q4_K_M) con pesos que van de 5,75 GB a 950 MB, lo que permite ejecutar ASR multilingüe de alta calidad en hardware muy modesto, incluidos portátiles sin GPU dedicada. El repositorio incluye además métricas WER verificadas sobre LibriSpeech test-clean y tasas de tiempo real (RTF) medidas en Apple M4 Max (Metal y CPU) y en un Ryzen 4750U (Vulkan y CPU), lo que facilita una estimación realista del rendimiento antes de desplegar.

Arquitectura transformer encoder-decoder con ventanas de audio de 30 segundos y decodificación troceada para audio largo; 1.543.321.440 parámetros totales según los pesos en safetensors del modelo base. Soporta 99 idiomas, detección de idioma, marcas de tiempo a nivel de segmento y traducción de cualquier idioma soportado a inglés. Licencia Apache-2.0 heredada del modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large) |
| Parametros totales | 1.543.321.440 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | ventanas de audio de 30 s con decodificación troceada para audio largo; contexto textual no disponible |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 99 idiomas (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (exclusivamente; no se distribuyen safetensors en este repo) |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper large, un transformer encoder-decoder con atención completa estándar. El encoder procesa espectrogramas mel de 30 segundos y el decoder genera tokens de texto de forma autorregresiva, con tokens especiales para detección de idioma, traducción y marcas de tiempo. Para audio de más de 30 segundos, transcribe.cpp aplica decodificación troceada (*chunked long-form decoding*), encadenando ventanas con solapamiento. La conversión a GGUF no modifica la arquitectura, solo la representación numérica de los pesos.

El entrenamiento original, realizado por OpenAI, empleó 680.000 horas de audio etiquetado de forma débil y supervisión a gran escala, lo que le confiere una capacidad de generalización notable a dominios y datasets no vistos sin necesidad de fine-tuning. No hay información en la documentación proporcionada sobre el uso de RLHF o DPO en el modelo base. La conversión a GGUF se realizó a partir del commit `4ef9b41` de openai/whisper-large (fijado el 2026-04-25) y se validó numéricamente contra la referencia de transformers en el commit `5.6.1` de transcribe.cpp (2026-04-26).

## Capacidades

- Transcripción de voz a texto multilingüe en 99 idiomas, con calidad competitiva sin fine-tuning.
- Detección automática del idioma del audio (`lang_detect: true`).
- Traducción de voz a texto en inglés desde cualquiera de los idiomas soportados (`translate: true`).
- Marcas de tiempo a nivel de segmento (`timestamps: segment`).
- Procesamiento de audio largo mediante decodificación troceada de ventanas de 30 segundos.
- No soporta streaming (`streaming: false`): requiere el audio completo o troceado manual.
- No es un modelo de texto: no genera código, no razona sobre texto, no soporta tool calling ni agentes.

## Casos de uso

- Transcripción de reuniones y actas: con Q8_0 (1,55 GB) o Q4_K_M (950 MB) se puede ejecutar en un portátil y transcribir audio de reuniones en cualquiera de los 99 idiomas, generando marcas de tiempo por segmento que facilitan la revisión posterior.
- Subtitulado automático de vídeo: las marcas de tiempo a nivel de segmento permiten generar ficheros de subtítulos alineados con el audio; el flujo típico es extraer el audio con ffmpeg a WAV 16 kHz mono y pasarlo por `transcribe-cli`.
- Traducción de contenido audiovisual a inglés: la capacidad `translate` convierte directamente audio en cualquier idioma soportado a texto en inglés, útil para indexar o publicar contenido internacional.
- Atención al cliente con notas de voz: transcribir mensajes de voz entrantes en un backend sin GPU dedicada usando Q4_K_M o Q5_K_M, con RTF de 2,1 sobre Vulkan en un Ryzen 4750U (aproximadamente el doble de rápido que tiempo real).
- Investigación lingüística y corpus: la cobertura de 99 idiomas, incluidas lenguas de bajos recursos (haw, mi, yi, bo, etc.), permite construir corpus transcritos de forma automática para estudios comparativos.
- Despliegue en dispositivos de borde: con Q4_K_M (950 MB) cabe en sistemas con poca memoria y puede ejecutarse por CPU pura (RTF 0,5 en Ryzen 4750U, es decir, aproximadamente el doble del tiempo real), adecuado para procesamiento por lotes no interactivo.
- Accesibilidad: transcripción de audio a texto para personas con discapacidad auditiva en aplicaciones de escritorio, aprovechando el rendimiento en Apple Silicon vía Metal (RTF 24,9 en M4 Max).

## Benchmarks y rendimiento

WER sobre LibriSpeech test-clean (2620 utterances, decodificación por defecto de transcribe.cpp: greedy, suppress_tokens, temperature fallback, timestamps de segmento activados):

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 5,75 GB | 2,72 % |
| F16 | 2,89 GB | 2,74 % |
| Q8_0 | 1,55 GB | 2,74 % |
| Q6_K | 1,21 GB | 2,62 % |
| Q5_K_M | 1,08 GB | 2,70 % |
| Q4_K_M | 950 MB | 2,67 % |

El WER autoinformado por OpenAI sobre la misma partición es 2,73 %. La diferencia más probable entre configuraciones es que `model.generate()` de OpenAI usa `<|notimestamps|>` por defecto, mientras que el pipeline de transcribe.cpp ejecuta con timestamps activados. Las cifras provienen de una única ejecución con backend Metal; las reducciones paralelas no deterministas de Metal pueden desplazar el WER del corpus en torno a 0,1 pp entre ejecuciones.

Rendimiento (RTF, *real-time factor*):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 24,9 |
| Apple M4 Max | CPU | 1,5 |
| Ryzen 4750U | Vulkan | 2,1 |
| Ryzen 4750U | CPU | 0,5 |

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: desde ~950 MB (Q4_K_M) hasta ~5,75 GB (F32); F16 ~2,89 GB, Q8_0 ~1,55 GB, Q6_K ~1,21 GB, Q5_K_M ~1,08 GB.
- GPU recomendadas: Apple Silicon con Metal (M4 Max alcanza RTF 24,9); GPUs con soporte Vulkan (Ryzen 4750U con iGPU alcanza RTF 2,1). No hay datos publicados para A100, H100 o RTX 4090 en la información disponible.
- Cabe en GPU de consumo: sí, incluso en iGPU; Q4_K_M y Q5_K_M son viables en cualquier equipo con ~1 GB de memoria libre.
- Opciones de despliegue: transcribe.cpp (único motor validado explícitamente); no hay confirmación de soporte en vLLM, llama.cpp, Ollama o TGI para este formato concreto.
- Latencia y throughput: RTF de 24,9 (Metal, M4 Max) implica procesar ~25 veces más rápido que tiempo real; RTF 0,5 en CPU de Ryzen 4750U implica procesar a la mitad de velocidad que tiempo real. El audio debe convertirse previamente a WAV 16 kHz mono.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---:|---|---|---|
| whisper-large-gguf (este) | 1.543 M | 99 | GGUF | Apache-2.0 | Cuantizado para transcribe.cpp, WER 2,62-2,74 % en LibriSpeech test-clean |
| openai/whisper-large (base) | 1.543 M | 99 | safetensors/PyTorch | Apache-2.0 | Referencia original; requiere transformers y más memoria |
| openai/whisper-large-v2 | 1.543 M | 99 | safetensors/PyTorch | Apache-2.0 | Entrenado 2,5 veces más épocas con regularización; supera al large original, misma arquitectura |
| openai/whisper-large-v3 | no disponible en la información | 99 | safetensors/PyTorch | Apache-2.0 | No hay datos de benchmarks en la información proporcionada |

## Limitaciones y advertencias

- Modelo base obsoleto: OpenAI recomienda usar whisper-large-v2 en lugar de whisper-large, ya que v2 supera su rendimiento sin cambios de arquitectura. Esta conversión usa el large original.
- Sin streaming: no admite transcripción en tiempo real; requiere audio completo o troceado manual.
- Ventanas de 30 segundos: el audio largo depende de la decodificación troceada, que puede introducir errores en las fronteras entre ventanas.
- Riesgo de alucinación en silencios o ruido de fondo: el propio autor señala que las diferencias de WER entre ejecuciones se deben en gran medida a "short-clip hallucination outcomes on the noise floor".
- El WER de 2,62 % en Q6_K no debe interpretarse como superioridad de esa cuantización: la variabilidad entre ejecuciones con Metal es de ~0,1 pp.
- Solo se distribuye en GGUF y solo está validado con transcribe.cpp; no hay garantía de compatibilidad con otros motores.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar la model card original de OpenAI para términos completos.
- No hay datos publicados sobre sesgos por idioma o acento; la cobertura de 99 idiomas no implica calidad uniforme, especialmente en lenguas de bajos recursos.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de adopción ni validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/GhaythMahadin/whisper-large-gguf
- Modelo base: https://huggingface.co/openai/whisper-large
- Commit del modelo base usado: https://huggingface.co/openai/whisper-large/commit/4ef9b41
- Motor transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-large.md
- Paper: https://arxiv.org/abs/2212.04356
- Repositorio original de OpenAI: https://github.com/openai/whisper
- Whisper large-v2 (recomendado por OpenAI): https://huggingface.co/openai/whisper-large-v2
