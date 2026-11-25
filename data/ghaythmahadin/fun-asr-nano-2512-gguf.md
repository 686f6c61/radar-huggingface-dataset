# GhaythMahadin/Fun-ASR-Nano-2512-gguf

## Resumen

Fun-ASR-Nano-2512 es un modelo de reconocimiento automático del habla (ASR) end-to-end desarrollado por Tongyi Lab (Alibaba). Combina un codificador de audio SenseVoiceEncoderSmall congelado (~50 bloques SAN-M principales y 20 bloques transformer), un adaptador de audio de 2 capas (512 → 1024) y un LLM Qwen3-0.6B (28 capas, GQA 16/8, BF16) que genera la transcripción de forma autorregresiva. El total de parámetros entrenables ronda los 830 millones.

Esta ficha documenta la conversión a GGUF publicada por GhaythMahadin para su uso con la librería `transcribe.cpp`, derivada del modelo base `FunAudioLLM/Fun-ASR-Nano-2512` (commit `a7088d6` fijado el 2026-05-06). La conversión incluye cuantizaciones desde BF16 hasta Q4_K_M y está validada numéricamente contra la implementación de referencia FunASR 1.3.1.

El modelo resuelve transcripción offline de audio de 16 kHz mono WAV en chino, inglés y japonés, además de 7 dialectos chinos (wu, cantonés, min, hakka, gan, xiang, jin) y 26 acentos regionales del mandarín. No es streaming, no traduce, no detecta idioma y no genera marcas de tiempo; su interés reside en el excelente equilibrio tamaño/precisión (WER de 1,78 % en LibriSpeech test-clean con BF16) y en que cabe en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: encoder SenseVoiceEncoderSmall (50 bloques SAN-M + 20 bloques transformer) + adaptador de audio 2 capas (512 → 1024) + LLM Qwen3-0.6B autorregresivo |
| Parametros totales | 829.791.840 (~830 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | zh, en, ja + 7 dialectos chinos (wu, cantonés, min, hakka, gan, xiang, jin) + 26 acentos regionales del mandarín |
| Licencia | FunASR Model Open Source License Agreement v1.1 (heredada del modelo base; etiquetada como "other") |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue un esquema audio-LLM en dos etapas. El encoder de audio SenseVoiceEncoderSmall procesa la señal acústica y produce representaciones que pasan por un adaptador de 2 capas (de 512 a 1024 dimensiones); a continuación, el LLM Qwen3-0.6B genera la transcripción token a token de forma autorregresiva. El encoder permanece congelado durante el ajuste, mientras que el adaptador y el cabezal LLM son los componentes entrenados (de ahí los ~800 M de parámetros "entrenables" frente a los ~830 M totales).

Según la model card del modelo base, Fun-ASR se entrenó sobre decenas de millones de horas de audio real y cubre 31 idiomas en su versión completa (esta variante Nano se limita a zh/en/ja más dialectos). No se detalla en la información disponible la composición exacta del dataset, el número de tokens de audio ni si se aplicó RLHF o DPO. La decodificación en la conversión GGUF es greedy mediante el cabezal Qwen3-0.6B, y el modelo soporta normalización inversa de texto (ITN) mediante el flag `--itn` en la CLI o el parámetro `use_itn` en la API de la librería.

## Capacidades

- Transcripción de voz a texto offline en chino, inglés y japonés.
- Reconocimiento de 7 dialectos chinos (wu, cantonés, min, hakka, gan, xiang, jin) y 26 acentos regionales del mandarín.
- Normalización inversa de texto (ITN): convierte números hablados y expresiones a formato escrito, activable por flag.
- Manejo de terminología profesional y expresiones de dominios verticales (educación, finanzas) según el modelo base.
- Procesamiento de audio de 16 kHz mono WAV; requiere conversión previa con ffmpeg si el origen no cumple ese formato.
- Sin soporte de streaming, traducción, detección de idioma ni marcas de tiempo.
- Sin soporte documentado de tool calling ni de agentes multi-paso (es un modelo ASR puro).
- Capacidad conversacional etiquetada en el repo, pero sin interfaz de chat documentada en la información disponible.

## Casos de uso

- Transcripción por lotes de reuniones y entrevistas: el modelo toma WAV de 16 kHz mono y devuelve texto; con Q8_0 (850 MB) puede ejecutarse en CPU y procesar colas de archivos sin GPU dedicada.
- Subtitulado de contenido en inglés, chino y japonés: útil para plataformas de vídeo que necesitan transcripciones en varios idiomas, aunque sin marcas de tiempo habría que alinear los segmentos con otra herramienta.
- Atención al cliente con grabaciones: transcripción de llamadas en centros de soporte en China (incluidos dialectos y acentos regionales) para análisis de calidad y extracción de motivos de contacto.
- Documentación clínica o financiera dictada: el modelo base destaca en terminología vertical y en reducir alucinaciones y confusión de idioma, lo que encaja con dictado profesional en mandarín e inglés.
- Investigación lingüística sobre dialectos chinos: permite transcribir corpus de wu, cantonés, min, hakka, gan, xiang y jin, una cobertura poco habitual en modelos ASR abiertos.
- Despliegue en dispositivos de borde: la cuantización Q4_K_M (531 MB) con WER de 1,92 % en LibriSpeech permite integrar ASR en portátiles o mini-PC sin GPU; los datos del autor reportan RTF de 6,5 en CPU Ryzen 4750U y 10,5 con Vulkan.
- Transcripción en Mac con Apple Silicon: el autor reporta RTF de 27 en CPU y 77,5 con Metal en un M4 Max, por lo que es viable para procesamiento local de audio en equipos de sobremesa.

## Benchmarks y rendimiento

WER sobre LibriSpeech test-clean completo (2620 enunciados), decodificación greedy con el cabezal Qwen3-0.6B, según datos del autor de la conversión:

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 1590 MB | 1,78 % |
| F16 | 1590 MB | 1,79 % |
| Q8_0 | 850 MB | 1,79 % |
| Q6_K | 659 MB | 1,78 % |
| Q5_K_M | 602 MB | 1,82 % |
| Q4_K_M | 531 MB | 1,92 % |

Referencia: el editor del modelo base reporta 1,76 % en el mismo split; la ejecución de referencia con FunASR 1.3.1 obtiene 1,79 % (IC 95 % [1,63 %, 1,95 %]), y el port a transcribe.cpp en BF16 queda a −0,01 puntos porcentuales de esa línea base. LibriSpeech es solo inglés; el autor recomienda complementar con AISHELL-1 y WenetSpeech (chino) y CommonVoice JA (japonés), pero no se aportan cifras para esos conjuntos.

Rendimiento (RTF, factor de tiempo real; mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 77,5 |
| Apple M4 Max | CPU | 27 |
| AMD Ryzen 4750U | Vulkan | 10,5 |
| AMD Ryzen 4750U | CPU | 6,5 |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni otras tareas de lenguaje general, ya que el modelo es exclusivamente ASR.

## Requisitos de hardware

- VRAM estimada: BF16/F16 requieren ~1,6 GB; Q8_0 ~0,9 GB; Q6_K ~0,7 GB; Q5_K_M ~0,6 GB; Q4_K_M ~0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para BF16; para cuantizaciones Q4/Q5 basta con GPUs integradas o de gama baja. No se documentan requisitos para A100/H100, aunque cabría holgadamente.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060 en adelante) e incluso en iGPU con Vulkan.
- Opciones de despliegue: `transcribe.cpp` (compilación con CMake; CLI `transcribe-cli` y API de librería con `transcribe_funasr_nano_params`). No se mencionan soportes de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 77,5 (Metal, M4 Max), 27 (CPU, M4 Max), 10,5 (Vulkan, Ryzen 4750U) y 6,5 (CPU, Ryzen 4750U). Un RTF de 6,5 implica procesar audio unas 6,5 veces más rápido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | WER LibriSpeech test-clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Fun-ASR-Nano-2512 (esta conversión) | ~830 M | zh, en, ja + dialectos | no disponible | 1,78 % (BF16) | FunASR License v1.1 | GGUF en HF |
| Fun-ASR-Nano-2512 (original) | ~830 M | zh, en, ja + dialectos | no disponible | 1,76 % (reportado) | FunASR License v1.1 | HF / ModelScope |
| Whisper large-v3 | 1550 M | multilingüe (99 idiomas) | 30 s de audio | ~1,8-2,0 % (referencia habitual) | MIT | Amplia (whisper.cpp, HF, etc.) |
| SenseVoice-Small | ~234 M | multilingüe + dialectos | no disponible | no disponible | SenseVoice License | HF / FunASR |

La comparación con Whisper large-v3 se basa en cifras de referencia pública habituales, no en una ejecución directa sobre esta conversión; el autor no incluye comparativas con otros modelos ASR en la información disponible.

## Limitaciones y advertencias

- Solo acepta audio de 16 kHz mono WAV; es necesario convertir previamente con ffmpeg u otra herramienta.
- No es streaming: no sirve para transcripción en tiempo real de baja latencia, pese a que el modelo base la soporte en su versión completa.
- No traduce, no detecta idioma automáticamente y no genera marcas de tiempo.
- No incluye chunking integrado para audio largo; el usuario debe segmentar manualmente los archivos extensos.
- Cobertura lingüística limitada a zh, en, ja y dialectos chinos; no cubre el español ni otras lenguas.
- Riesgo de alucinación y confusión de idioma inherente a los modelos ASR autorregresivos, aunque el modelo base declara mitigarlo.
- Licencia FunASR Model Open Source License Agreement v1.1: conviene revisar los términos completos en la model card del modelo base antes de un uso comercial; no es una licencia permisiva tipo MIT o Apache.
- Conversión no oficial: el autor del GGUF es un tercero (GhaythMahadin) y el repo registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es aún inexistente.
- Los enlaces de descarga de la model card apuntan al repositorio `handy-computer/Fun-ASR-Nano-2512-gguf`, no al repo de GhaythMahadin; verificar el origen de los pesos antes de desplegar.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/GhaythMahadin/Fun-ASR-Nano-2512-gguf
- Modelo base: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512
- Commit del modelo base fijado: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512/commit/a7088d620f755dcdca575b63db184c3ad55b2865
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/f094d28
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/fun-asr-nano-2512.md
- Repositorio de pesos GGUF referenciado en la model card: https://huggingface.co/handy-computer/Fun-ASR-Nano-2512-gguf
- Página del proyecto Fun-ASR: https://funaudiollm.github.io/funasr
- Modelo en ModelScope: https://www.modelscope.cn/models/FunAudioLLM/Fun-ASR-Nano-2512
- Demo en ModelScope: https://modelscope.cn/studios/FunAudioLLM/Fun-ASR-Nano
- Paper (arXiv): https://arxiv.org/abs/2509.12508
