# avericaai/Fun-ASR-Nano-2512-gguf

## Resumen

Fun-ASR-Nano-2512 es un modelo de reconocimiento automático del habla (ASR) de extremo a extremo desarrollado por Tongyi Lab (Alibaba). Con aproximadamente 830 millones de parámetros, combina un codificador de audio SenseVoiceEncoderSmall congelado, un adaptador de audio de dos capas y un LLM Qwen3-0.6B que genera la transcripción de forma autorregresiva. El modelo está entrenado sobre decenas de millones de horas de audio real y está diseñado para transcripción offline en chino, inglés y japonés, además de siete dialectos chinos y 26 acentos regionales del mandarín.

La ficha que nos ocupa documenta la conversión a formato GGUF realizada por el usuario avericaai para su uso con la librería transcribe.cpp, derivada del modelo original FunAudioLLM/Fun-ASR-Nano-2512. Esta conversión permite ejecutar el modelo en CPU y GPU de consumo con cuantizaciones que van desde BF16 (1,67 GB) hasta Q4_K_M (557 MB), manteniendo una tasa de error de palabra (WER) muy baja en inglés: 1,78 % en BF16 y 1,92 % en Q4_K_M sobre LibriSpeech test-clean.

El interés actual de esta versión radica en que ofrece un ASR multilingüe de calidad cercana al estado del arte en un paquete ligero y ejecutable localmente, sin dependencia de servicios en la nube. No obstante, se trata de un modelo offline: no soporta streaming, no traduce, no genera marcas de tiempo y no incluye troceado automático para audio largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador SenseVoiceEncoderSmall congelado (50 bloques SAN-M principales + 20 bloques transformer) + adaptador de audio de 2 capas (512 → 1024) + LLM Qwen3-0.6B (28 capas, GQA 16/8, BF16) |
| Parametros totales | 829.791.840 (~830 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | zh, en, ja (además de 7 dialectos chinos: wu, cantonés, min, hakka, gan, xiang, jin; y 26 acentos regionales del mandarín) |
| Licencia | funasr-model-license-v1.1 (FunASR Model Open Source License Agreement v1.1) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de tipo audio-LLM. La entrada es un WAV mono a 16 kHz que se procesa mediante un codificador SenseVoiceEncoderSmall congelado, compuesto por 50 bloques SAN-M principales y 20 bloques transformer. La salida del codificador pasa por un adaptador de audio de dos capas que proyecta de 512 a 1024 dimensiones y alimenta un LLM Qwen3-0.6B (28 capas, atención GQA con 16 cabezas de consulta y 8 de clave/valor, en BF16) que genera la transcripción de forma autorregresiva con decodificación greedy.

Según la model card original, Fun-ASR se entrenó sobre decenas de millones de horas de audio real, con especial énfasis en dominios verticales como educación y finanzas, y con el objetivo explícito de mitigar la "alucinación" y la confusión de idiomas. La información disponible no detalla la composición exacta del dataset, el número de tokens de audio ni si se aplicaron fases de RLHF o DPO. La conversión GGUF está anclada al commit upstream a7088d6 (fijado el 2026-05-06) y validada contra la referencia FunASR en el commit f094d28 de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto offline en chino, inglés y japonés.
- Reconocimiento de 7 dialectos chinos (wu, cantonés, min, hakka, gan, xiang, jin) y 26 acentos regionales del mandarín.
- Detección automática de idioma (`lang_detect: true`) y selección explícita de idioma (`explicit_language_selection: true`).
- Normalización de texto inversa (ITN) opcional mediante el flag `--itn`, útil para dígitos y puntuación en chino; desactivada por defecto porque en inglés puede devolver texto en mayúsculas.
- Procesamiento de audio WAV mono a 16 kHz; requiere conversión previa con ffmpeg para otros formatos.
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No genera marcas de tiempo (`timestamps: none`).
- No incluye troceado automático para audio de larga duración.

## Casos de uso

- Transcripción de reuniones y entrevistas en local: el modelo convierte grabaciones WAV a texto en máquinas sin GPU dedicada gracias a sus cuantizaciones de 557-891 MB, adecuadas para portátiles con CPU moderna.
- Subtitulado y documentación de contenido en chino, inglés y japonés: útil para equipos que producen material audiovisual multilingüe y necesitan transcripciones sin enviar audio a servicios externos.
- Procesamiento de audio en entornos con requisitos de privacidad: al ejecutarse íntegramente en local mediante transcribe.cpp, el audio no sale del dispositivo, lo que encaja en sectores regulados como salud o legal.
- Investigación lingüística sobre dialectos chinos: el soporte de wu, cantonés, min, hakka, gan, xiang y jin permite construir corpus transcritos de variedades poco representadas en otros ASR.
- Integración en pipelines de accesibilidad: generación de transcripciones para vídeos o clases grabadas en inglés y chino, con la salvedad de que el troceado de audio largo debe gestionarse externamente.
- Evaluación y benchmarking de ASR en hardware de consumo: sus cifras de RTF en CPU (18,12 en M4; 7,95 en Ryzen 4750U) y en GPU integrada (Metal 32,87; Vulkan 10,73) permiten comparar el rendimiento de transcribe.cpp frente a otras implementaciones.

## Benchmarks y rendimiento

| Benchmark | Metrica | BF16 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---|---:|---:|---:|---:|---:|---:|
| LibriSpeech test-clean (2.620 enunciados) | WER (%) | 1,78 | 1,79 | 1,79 | 1,78 | 1,82 | 1,92 |
| FLEURS en | WER (%) | no disponible | no disponible | 5,49 | no disponible | no disponible | no disponible |
| FLEURS ja | CER (%) | no disponible | no disponible | 8,50 | no disponible | no disponible | no disponible |
| FLEURS zh | CER (%) | no disponible | no disponible | 8,59 | no disponible | no disponible | no disponible |

| Hardware | Backend | RTF | RTF max |
|---|---|---:|---:|
| Apple M4 | CPU | 18,12 | 28,06 |
| Apple M4 | Metal | 32,87 | 78,13 |
| AMD Ryzen 4750U | CPU | 7,95 | no disponible |
| AMD Ryzen 4750U | Vulkan | 10,73 | no disponible |

El editor del modelo original reporta 1,76 % de WER en LibriSpeech test-clean; la referencia FunASR 1.3.1 medida por el conversor obtiene 1,79 % (IC 95 % [1,63 %, 1,95 %]), y el port BF16 de transcribe.cpp queda a -0,01 puntos porcentuales de esa referencia. Las cifras de FLEURS solo están publicadas para Q8_0. No se han publicado resultados de benchmarks para AISHELL-1, WenetSpeech ni CommonVoice JA en la información disponible, pese a ser las comprobaciones complementarias recomendadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo GGUF más overhead. BF16/F16: ~1,67 GB; Q8_0: ~891 MB; Q6_K: ~691 MB; Q5_K_M: ~631 MB; Q4_K_M: ~557 MB.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. El modelo está validado en Apple M4 con backend Metal y en AMD Ryzen 4750U con Vulkan; por tamaño, cabe holgadamente en cualquier GPU consumer con al menos 2 GB de memoria.
- Cabe en GPU consumer: sí, en todas las tarjetas modernas (RTX 3060, RTX 4060, RTX 4090, etc.) y en GPUs integradas con soporte Metal o Vulkan.
- Opciones de despliegue: transcribe.cpp (compilación con CMake y binario `transcribe-cli`). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: el RTF (factor de tiempo real, menor es mejor) varía entre 7,95 en CPU Ryzen 4750U y 32,87 en Metal sobre M4; el RTF máximo llega a 78,13 en Metal M4. En la práctica, un RTF de 18 significa que procesar 1 segundo de audio requiere unos 18 segundos de cómputo en ese backend concreto, lo que limita el uso a transcripción por lotes más que a tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---:|---|---|---|
| Fun-ASR-Nano-2512 (este, GGUF) | ~830 M | zh, en, ja + dialectos | no disponible | funasr-model-license-v1.1 | GGUF | Offline, sin streaming ni timestamps |
| FunAudioLLM/Fun-ASR-Nano-2512 (original) | ~830 M | zh, en, ja + dialectos | no disponible | funasr-model-license-v1.1 | safetensors (upstream) | Modelo base; misma arquitectura |
| Whisper large-v3 | no disponible en la información | multilingüe | no disponible | no disponible en la información | no disponible | Alternativa ampliamente usada; sin datos comparativos en esta ficha |
| SenseVoice | no disponible en la información | multilingüe | no disponible | no disponible en la información | no disponible | Codificador reutilizado por este modelo; sin datos comparativos en esta ficha |

No se dispone de datos de benchmarks cruzados con Whisper o SenseVoice en la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Modelo exclusivamente offline: no soporta streaming ni transcripción de baja latencia en tiempo real.
- No realiza traducción: transcribe en el idioma de origen, no traduce entre idiomas.
- No genera marcas de tiempo, lo que dificulta la alineación con subtítulos o la sincronización con vídeo.
- No incluye troceado automático de audio largo: el usuario debe segmentar manualmente las grabaciones extensas.
- La ITN está desactivada por defecto; al activarla con `--itn`, el inglés puede devolver texto en mayúsculas.
- Riesgo de alucinación y confusión de idiomas, aunque el modelo original se entrenó explícitamente para mitigarlos.
- Sesgos: no se documentan sesgos específicos en la información disponible; al ser un modelo entrenado sobre audio real, puede heredar sesgos de los datos de origen.
- Licencia funasr-model-license-v1.1: es una licencia "other" con términos propios; debe revisarse el texto completo antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: la conversión GGUF es reciente y no cuenta aún con validación comunitaria amplia.
- Los benchmarks publicados se centran en inglés (LibriSpeech); las cifras para chino y japonés solo están disponibles para Q8_0 en FLEURS.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/avericaai/Fun-ASR-Nano-2512-gguf
- Modelo base original: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512
- Commit upstream de referencia: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512/commit/a7088d6
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/f094d28
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/fun-asr-nano-2512.md
- Licencia FunASR: https://github.com/modelscope/FunASR/blob/main/MODEL_LICENSE
- Conversión GGUF alternativa (audio.cpp): https://huggingface.co/audio-cpp/audio.cpp-gguf/blob/main/Fun-ASR-Nano-2512-GGUF/README.md
- Ficha de archivo en AIArchiveInfo: https://huggingface.co/AIArchiveInfo/Fun-ASR-Nano-2512
- Paper de referencia (arXiv): https://arxiv.org/abs/2509.12508
