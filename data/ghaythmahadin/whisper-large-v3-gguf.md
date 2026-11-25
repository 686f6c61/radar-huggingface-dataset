# GhaythMahadin/whisper-large-v3-gguf

## Resumen

whisper-large-v3-gguf es una conversión al formato GGUF del modelo openai/whisper-large-v3, publicada por el usuario GhaythMahadin para su uso con el runtime transcribe.cpp. No se trata de un modelo nuevo, sino de una redistribución cuantizada del checkpoint original de OpenAI, fijada al commit 06f233f (25 de abril de 2026) y validada contra la referencia de transformers en la versión 5.6.1 de transcribe.cpp. El objetivo es permitir la inferencia local de transcripción de voz en hardware modesto mediante cuantizaciones de 4 a 8 bits.

El modelo subyacente es un transformer encoder-decoder de aproximadamente 1.543 millones de parámetros (1,54 B), diseñado para reconocimiento automático del habla (ASR), detección de idioma y traducción de voz a texto en inglés. La versión v3 introduce dos cambios respecto a large-v2: entrada mel de 128 bins en lugar de 80 y un token de idioma nuevo para cantonés (yue). Soporta 99 idiomas y procesa audio en ventanas de 30 segundos con decodificación por trozos para audio largo.

La relevancia de esta ficha radica en el formato: los ficheros GGUF de 951 MB (Q4_K_M) a 2,88 GB (F16) permiten ejecutar un modelo ASR de gama alta en CPU, GPU integrada o GPUs de consumo, con una degradación de WER mínima (de 1,81 % a 1,86 % en LibriSpeech test-clean entre F16 y Q4_K_M). La licencia Apache-2.0 heredada facilita el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parámetros totales | 1.543.516.688 (1,54 B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 s con decodificación por trozos para audio largo |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 99 idiomas (en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su, yue) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (runtime transcribe.cpp) |

## Arquitectura y entrenamiento

Whisper large-v3 sigue la arquitectura encoder-decoder original de Whisper, presentada en el paper *Robust Speech Recognition via Large-Scale Weak Supervision* (Radford et al., 2022). La entrada es un espectrograma mel de 128 bins (frente a los 80 bins de versiones anteriores), procesado en ventanas de 30 segundos. El decoder genera texto de forma autorregresiva con tokens especiales para idioma, transcripción, traducción y marcas de tiempo.

El entrenamiento original de OpenAI utilizó más de 5 millones de horas de audio: 1 millón de horas con etiquetas débiles y 4 millones de horas pseudo-etiquetadas generadas con whisper-large-v2, durante 2 épocas sobre esa mezcla. La información disponible no detalla el uso de RLHF o DPO. La versión v3 reporta reducciones de error del 10 % al 20 % frente a large-v2 en una amplia variedad de idiomas. La conversión a GGUF no altera los pesos más allá de la cuantización; el autor indica que el port se validó numéricamente contra la implementación de referencia de transformers.

## Capacidades

- Transcripción de voz a texto multilingüe en 99 idiomas, incluido el castellano.
- Detección automática de idioma (`lang_detect: true`).
- Traducción de voz a texto en inglés desde cualquier idioma soportado (`translate: true`).
- Marcas de tiempo a nivel de segmento (`timestamps: segment`).
- Procesamiento de audio largo mediante decodificación por trozos sobre ventanas de 30 s.
- Decodificación con estrategia greedy, supresión de tokens y fallback de temperatura.
- Soporte de audio de entrada a 16 kHz mono WAV (conversión previa con ffmpeg para otros formatos).
- No soporta streaming (`streaming: false` en la model card).
- No incluye tool calling, capacidades de agente ni modalidad de visión.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo convierte grabaciones de audio en texto con marcas de tiempo por segmento, lo que permite generar actas indexadas y buscables. La decodificación por trozos gestiona grabaciones de más de 30 segundos sin intervención manual.
- Subtitulado automático de vídeo: las marcas de tiempo por segmento facilitan la generación de ficheros de subtítulos; el soporte de 99 idiomas permite subtitular contenido en castellano y en idiomas minoritarios sin modelos adicionales.
- Traducción de contenido audiovisual a inglés: con `translate: true`, el modelo transcribe directamente audio en cualquier idioma soportado a texto en inglés, útil para la localización de pódcast o material formativo.
- Atención al cliente con análisis de llamadas: la transcripción local con Q4_K_M (951 MB) permite procesar grabaciones en infraestructura propia sin enviar audio a servicios externos, lo que simplifica el cumplimiento de protección de datos.
- Investigación lingüística y de campo: el soporte de lenguas de bajos recursos (haw, mi, yue, sn, yo, entre otras) y la licencia Apache-2.0 permiten usar el modelo en estudios académicos y proyectos de documentación de lenguas.
- Despliegue en dispositivos sin GPU dedicada: los ficheros GGUF de 951 MB a 1,55 GB se ejecutan en CPU mediante transcribe.cpp, lo que habilita transcripción en portátiles, mini-PC o servidores sin acelerador.
- Accesibilidad: generación de transcripciones para contenido de audio en aplicaciones de accesibilidad, con la ventaja de ejecución local y sin coste por minuto.

## Benchmarks y rendimiento

El autor publica el WER sobre la partición completa LibriSpeech test-clean (2620 enunciados) con la decodificación por defecto de transcribe.cpp (greedy, suppress_tokens, fallback de temperatura, marcas de tiempo activadas):

| Cuantización | Tamaño | WER LibriSpeech test-clean |
|---|---:|---:|
| F16 | 2,88 GB | 1,81 % |
| Q8_0 | 1,55 GB | 1,82 % |
| Q6_K | 1,21 GB | 1,83 % |
| Q5_K_M | 1,08 GB | 1,84 % |
| Q4_K_M | 951 MB | 1,86 % |

OpenAI reporta un 2,01 % en la misma partición; el autor atribuye la diferencia a que `model.generate()` usa por defecto `<|notimestamps|>` mientras que el pipeline de transcribe.cpp activa marcas de tiempo. Los números provienen de una única ejecución sobre Metal, con variación estimada de ~0,1 pp entre ejecuciones por reducciones paralelas no deterministas.

Rendimiento en tiempo real (RTF, factor de tiempo real):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 23,6 |
| Apple M4 Max | CPU | 1,5 |
| Ryzen 4750U | Vulkan | 2,1 |
| Ryzen 4750U | CPU | 0,6 |

No se han publicado resultados de benchmarks multilingües (FLEURS, Common Voice) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 951 MB (Q4_K_M), 1,08 GB (Q5_K_M), 1,21 GB (Q6_K), 1,55 GB (Q8_0), 2,88 GB (F16), más el overhead del runtime.
- Cabe en cualquier GPU de consumo: RTX 3060/4060 y superiores con margen amplio; también en GPUs integradas y CPU.
- GPU de centro de datos (A100, H100) no son necesarias para este tamaño; aportan throughput pero no son requisito.
- Despliegue: transcribe.cpp (compilación con CMake; binario `transcribe-cli`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato GGUF está adaptado a transcribe.cpp.
- Aceleración: backends Metal y Vulkan documentados; CPU como alternativa.
- Throughput observado: RTF de 23,6 en Metal (M4 Max), 2,1 en Vulkan (Ryzen 4750U) y 1,5 en CPU (M4 Max). En CPU del Ryzen 4750U el RTF es 0,6, es decir, por debajo del tiempo real.
- Entrada: WAV mono a 16 kHz; conversión previa necesaria para MP3 u otros formatos.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| whisper-large-v3-gguf (esta ficha) | 1,54 B | 99 | GGUF (transcribe.cpp) | Apache-2.0 | Cuantizaciones de 951 MB a 2,88 GB; WER 1,81–1,86 % en LibriSpeech test-clean |
| openai/whisper-large-v3 | 1,54 B | 99 | safetensors | Apache-2.0 | Modelo original; requiere transformers o similar; WER reportado 2,01 % |
| openai/whisper-large-v2 | ~1,55 B | 99 (sin yue) | safetensors | Apache-2.0 | Entrada mel de 80 bins; errores un 10–20 % superiores a v3 según OpenAI |
| whisper-large-v3-turbo | no disponible en la información | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada |

## Limitaciones y advertencias

- No soporta streaming: la model card indica `streaming: false`; la transcripción es por lotes sobre ficheros completos.
- Ventanas de 30 s: el audio largo depende de la decodificación por trozos, lo que puede introducir errores en las fronteras entre segmentos.
- Riesgo de alucinación: el propio autor señala que parte de la variación del WER proviene de «short-clip hallucination outcomes on the noise floor», es decir, alucinaciones en clips cortos con ruido de fondo.
- Solo salida en texto: no hay salida de audio, visión ni tool calling; el modelo no es un LLM de propósito general.
- Traducción limitada al inglés: la función `translate` genera texto en inglés, no en otros idiomas de destino.
- Idiomas de bajos recursos: aunque se listan 99 idiomas, el rendimiento en lenguas con pocos datos (por ejemplo, haw, mi, sn) no está cuantificado en la información disponible.
- Dependencia de runtime: los GGUF están pensados para transcribe.cpp; no se garantiza su uso con llama.cpp u otros motores GGUF.
- Precisión de las marcas de tiempo: a nivel de segmento, no a nivel de palabra.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; la fuente canónica de los ficheros enlazados en la model card es el repositorio handy-computer/whisper-large-v3-gguf, no el de este autor.
- Licencia Apache-2.0 heredada del modelo base: permite uso comercial, pero conviene revisar los términos del modelo original de OpenAI.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GhaythMahadin/whisper-large-v3-gguf
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Commit del modelo base referenciado: https://huggingface.co/openai/whisper-large-v3/commit/06f233f
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Versión validada de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/5.6.1
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/whisper-large-v3.md
- Repositorio de los ficheros GGUF enlazados: https://huggingface.co/handy-computer/whisper-large-v3-gguf
- Paper de Whisper: https://huggingface.co/papers/2212.04356 (arXiv:2212.04356)
