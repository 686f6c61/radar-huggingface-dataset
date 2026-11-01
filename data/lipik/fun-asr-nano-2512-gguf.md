# lipik/Fun-ASR-Nano-2512-gguf

## Resumen

Fun-ASR-Nano-2512 es un modelo de reconocimiento automático del habla (ASR) end-to-end desarrollado por Tongyi Lab (Alibaba). Combina un codificador de audio SenseVoiceEncoderSmall congelado con un LLM Qwen3-0.6B que genera la transcripción de forma autorregresiva, sumando aproximadamente 830 millones de parámetros entrenables. El modelo está entrenado sobre decenas de millones de horas de audio real y cubre chino, inglés y japonés, además de siete dialectos chinos y 26 acentos regionales del mandarín.

El repositorio analizado aquí es una conversión a GGUF realizada por el usuario `lipik` (los ficheros apuntan al espacio `handy-computer`) para su uso con `transcribe.cpp`, un runtime C++ ligero centrado en inferencia local de modelos de transcripción. La conversión preserva el comportamiento del modelo original con pérdidas mínimas de precisión: el WER en LibriSpeech test-clean varía entre 1,78 % en BF16 y 1,92 % en Q4_K_M, lo que demuestra que la cuantización agresiva degrada muy poco la calidad.

La relevancia actual radica en que ofrece transcripción multilingüe de alta calidad en un paquete de menos de 1 GB que corre en CPU y GPU de consumo, sin dependencia de frameworks Python pesados. No obstante, es un modelo offline: no soporta streaming, traducción, detección de idioma ni marcas de tiempo, y no incluye segmentación de audio largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder híbrido: SenseVoiceEncoderSmall (50 bloques SAN-M + 20 bloques transformer) + adaptador de audio de 2 capas (512 → 1024) + LLM Qwen3-0.6B (28 capas, GQA 16/8, BF16) |
| Parametros totales | 829.791.840 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Chino (zh), inglés (en), japonés (ja); además 7 dialectos chinos (wu, cantonés, min, hakka, gan, xiang, jin) y 26 acentos regionales del mandarín |
| Licencia | FunASR Model Open Source License Agreement v1.1 (heredada del modelo base) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo sigue un diseño de audio-LLM en dos etapas. La primera es un codificador SenseVoiceEncoderSmall congelado, compuesto por 50 bloques SAN-M principales y 20 bloques transformer, que transforma la señal de audio de 16 kHz en representaciones latentes. La segunda es un adaptador de dos capas que proyecta esas representaciones de 512 a 1024 dimensiones y las inyecta en un Qwen3-0.6B (28 capas, atención GQA con 16 cabezas de consulta y 8 de clave/valor, precisión BF16), que genera el texto de forma autorregresiva. Solo el adaptador y el LLM se entrenan; el codificador permanece congelado.

El entrenamiento se realizó sobre decenas de millones de horas de audio real, según la model card original, con énfasis en dominios verticales como educación y finanzas para mejorar el reconocimiento de terminología especializada y reducir alucinaciones y confusión de idioma. No se detalla en la información disponible la composición exacta del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. El modelo soporta normalización inversa de texto (ITN) mediante el flag `--itn` en la CLI y el parámetro `transcribe_funasr_nano_params { use_itn }` en la API de la librería.

## Capacidades

- Transcripción de voz a texto offline en chino, inglés y japonés.
- Reconocimiento de 7 dialectos chinos (wu, cantonés, min, hakka, gan, xiang, jin) y 26 acentos regionales del mandarín.
- Normalización inversa de texto (ITN) opcional para convertir números y expresiones habladas a formato escrito.
- Entrada de audio: WAV mono a 16 kHz.
- Generación autorregresiva de la transcripción mediante el cabezal Qwen3-0.6B.
- No soporta streaming (procesamiento por lotes de audio completo).
- No soporta traducción entre idiomas.
- No incluye detección automática de idioma.
- No genera marcas de tiempo.
- No incluye segmentación integrada de audio de larga duración.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo de razonamiento (thinking mode), visión ni audio de salida.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo convierte grabaciones WAV de 16 kHz en texto con buena precisión en inglés (WER 1,78 % en LibriSpeech test-clean), adecuado para actas y documentación interna; requiere trocear manualmente el audio si supera la ventana manejable por el LLM.
- Subtitulado de contenido en chino, inglés y japonés: útil para generar borradores de subtítulos en plataformas de vídeo, con la salvedad de que no produce marcas de tiempo y habría que alinearlas con otra herramienta.
- Atención al cliente en centros de llamadas: permite transcribir conversaciones grabadas en mandarín con acentos regionales y dialectos, lo que facilita el análisis de calidad y la extracción de motivos de consulta en mercados chinos.
- Investigación lingüística y dialectología: el soporte de 7 dialectos chinos y 26 acentos del mandarín lo hace útil para corpus de estudio fonético y sociolingüístico, siempre que se disponga de audio limpio y segmentado.
- Despliegue en dispositivos de borde: con cuantización Q4_K_M (531 MB) cabe en equipos con poca memoria y corre en CPU (RTF 6,5 en Ryzen 4750U) o GPU integrada con Vulkan (RTF 10,5), lo que permite transcripción local sin conexión.
- Transcripción de clases y seminarios en educación: el modelo está entrenado para dominios verticales como educación y finanzas, por lo que reconoce terminología especializada mejor que modelos genéricos; requiere dividir el audio en fragmentos por la ausencia de chunking integrado.
- Generación de actas en finanzas y banca: útil para transcribir llamadas con terminología financiera en chino e inglés, con ITN activado para normalizar cifras y fechas en el texto final.

## Benchmarks y rendimiento

| Benchmark | BF16 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1,78 | 1,79 | 1,79 | 1,78 | 1,82 | 1,92 |

| Plataforma | Backend | RTF (real-time factor) |
|---|---|---:|
| Apple M4 Max | Metal | 77,5 |
| Apple M4 Max | CPU | 27,0 |
| AMD Ryzen 4750U | Vulkan | 10,5 |
| AMD Ryzen 4750U | CPU | 6,5 |

El WER se midió sobre la partición completa de LibriSpeech test-clean (2620 enunciados) con decodificación greedy del LLM. El editor del modelo base reporta 1,76 % en esa misma partición; la ejecución de referencia con FunASR 1.3.1 obtiene 1,79 % (IC 95 % [1,63 %, 1,95 %]), dentro del ruido bootstrap. La conversión BF16 de transcribe.cpp coincide con esa línea base con una diferencia de -0,01 puntos porcentuales. LibriSpeech es solo inglés; para chino se recomiendan AISHELL-1 y WenetSpeech, y para japonés CommonVoice JA, pero no se aportan resultados numéricos de estas evaluaciones en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 531 MB (Q4_K_M) y 1590 MB (BF16/F16) solo para los pesos; el consumo real depende del backend y del audio de entrada.
- GPU recomendadas: Apple M4 Max con Metal (RTF 77,5) y GPUs AMD con Vulkan (RTF 10,5 en Ryzen 4750U). No se aportan datos para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, con cuantizaciones Q4_K_M a Q8_0 (531–850 MB), aunque no se especifican modelos concretos de NVIDIA.
- Opciones de despliegue: `transcribe.cpp` (CLI `transcribe-cli` y API de librería). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 77,5 en M4 Max con Metal, 27 en CPU del M4 Max, 10,5 con Vulkan en Ryzen 4750U y 6,5 en CPU del Ryzen 4750U. Valores más altos indican mayor velocidad relativa.
- El audio debe convertirse previamente a WAV mono de 16 kHz con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---:|---|---|---|---|
| Fun-ASR-Nano-2512 (este) | ~830 M | zh, en, ja + dialectos | no disponible | FunASR v1.1 | GGUF | Offline, sin streaming ni timestamps |
| Whisper large-v3 | ~1550 M | multilingüe amplio | 30 s por ventana | MIT | safetensors, GGUF | Soporta timestamps y traducción; no se dispone de WER comparable en esta información |
| SenseVoice-Small | no disponible | multilingüe | no disponible | no disponible | no disponible | Codificador base reutilizado por este modelo; no se aportan datos comparativos |

No se dispone de resultados de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación numérica de rendimiento queda como no disponible.

## Limitaciones y advertencias

- No es un modelo de streaming: procesa el audio completo de una vez y no emite resultados parciales.
- No soporta traducción: transcribe en el idioma hablado, no traduce a otro.
- No detecta el idioma automáticamente: el usuario debe conocer o fijar el idioma de entrada.
- No genera marcas de tiempo, lo que limita su uso directo en subtitulado.
- No incluye segmentación integrada de audio largo; es necesario trocear manualmente las grabaciones.
- Riesgo de alucinación y confusión de idioma, aunque el editor afirma haberlo mitigado con entrenamiento en dominios verticales.
- Sesgos no documentados en la información disponible; el entrenamiento se centra en chino, inglés y japonés, por lo que el rendimiento en otras lenguas no está garantizado.
- Licencia FunASR Model Open Source License Agreement v1.1: es una licencia "other", no OSI estándar; conviene revisar los términos completos antes de uso comercial.
- La conversión GGUF es de un tercero (`lipik`), no oficial de Tongyi Lab; la validación se hizo contra FunASR 1.3.1 y transcribe.cpp en fechas concretas (2026-05-06), por lo que cambios posteriores en el runtime pueden afectar la reproducibilidad.
- El repositorio tiene muy pocas descargas (28) y ningún "like", lo que indica poca validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/lipik/Fun-ASR-Nano-2512-gguf
- Modelo base: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512
- Commit del modelo base referenciado: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512/commit/a7088d620f755dcdca575b63db184c3ad55b2865
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/f094d28
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/fun-asr-nano-2512.md
- Página del proyecto Fun-ASR: https://funaudiollm.github.io/funasr
- Modelo en ModelScope: https://www.modelscope.cn/models/FunAudioLLM/Fun-ASR-Nano-2512
- Demo en ModelScope: https://modelscope.cn/studios/FunAudioLLM/Fun-ASR-Nano
- Paper referenciado (arXiv:2509.12508): https://arxiv.org/abs/2509.12508
