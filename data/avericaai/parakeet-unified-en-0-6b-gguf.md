# avericaai/parakeet-unified-en-0.6b-gguf

## Resumen

Parakeet-unified-en-0.6b-gguf es la conversión a formato GGUF del modelo de reconocimiento automático del habla (ASR) `nvidia/parakeet-unified-en-0.6b`, publicada por el usuario avericaai. El modelo original lo desarrolla NVIDIA y está pensado para transcripción de voz en inglés con puntuación y mayúsculas, empleando una arquitectura transducer RNN-T con encoder FastConformer. Esta conversión concreta se distribuye para su uso con transcribe.cpp, una implementación en C++ de inferencia ASR.

El modelo base combina en una sola red la inferencia offline (por lotes) y la inferencia en streaming con una latencia mínima de 160 ms, lo que lo hace relevante para aplicaciones que necesitan tanto transcripción de alta precisión como dictado en tiempo real. Con 618 millones de parámetros y un tamaño de repo de 6,1 GB, las cuantizaciones GGUF reducen el peso de los pesos hasta los 477 MB en Q4_K_M sin degradación apreciable del WER.

Esta ficha se centra en la versión GGUF publicada por avericaai, que reproduce la conversión de referencia de handy-computer y mantiene la licencia NVIDIA Open Model License del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + RNN-T (decoder transducer) |
| Parámetros totales | 618.309.121 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no de contexto textual) |
| Tipos de cuantización | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (inglés, en-US) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | GGUF (transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura transducer RNN-T con encoder FastConformer, una variante de Conformer optimizada para velocidad. El decoder es un transducer que genera tokens de forma autorregresiva con decodificación greedy. El modelo "unified" se entrenó para operar tanto en modo offline como en streaming, con tamaños de chunk configurables que permiten elegir la latencia entre 2080 ms y 160 ms en pasos de 80 ms.

El entrenamiento se realizó mayoritariamente sobre la parte inglesa del dataset Granary, que contiene aproximadamente 250.000 horas de voz en inglés estadounidense (en-US) en condiciones acústicas diversas. La model card no detalla el uso de RLHF o DPO, algo poco habitual en modelos ASR. La conversión a GGUF se realizó desde el commit `d4ac992` del repositorio original y se validó contra la referencia NeMo en el commit `42528dd` de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto en inglés con puntuación y mayúsculas.
- Inferencia offline (por lotes) y en streaming con un único modelo.
- Latencia de streaming configurable entre 160 ms y 2080 ms.
- Generación de timestamps a nivel de token.
- Decodificación greedy RNN-T sin modelo de lenguaje externo.
- No soporta traducción (`translate: false`).
- No soporta detección de idioma (`lang_detect: false`).
- No dispone de tool calling ni capacidades de agente (es un modelo ASR puro).

## Casos de uso

- Transcripción de reuniones y actas: el modo offline con encoder FastConformer procesa audio de larga duración y produce texto con puntuación y mayúsculas, adecuado para generar actas automáticas.
- Subtitulado en tiempo real: el modo streaming con latencia mínima de 160 ms permite generar subtítulos en directo para retransmisiones o videollamadas en inglés.
- Dictado por voz en aplicaciones de escritorio: la cuantización Q4_K_M (477 MB) cabe en memoria de sistemas modestos y permite integrar dictado local sin dependencia de la nube.
- Asistentes de voz embebidos: la implementación transcribe.cpp en C++ y el soporte de Metal y Vulkan permiten desplegar ASR en dispositivos Apple Silicon o GPUs integradas.
- Indexación y búsqueda de archivos de audio: la transcripción offline con timestamps por token facilita la alineación y búsqueda dentro de grabaciones.
- Análisis de llamadas de atención al cliente: el modelo transcribe conversaciones en inglés con condiciones acústicas diversas, lo que permite alimentar pipelines de análisis de sentimiento o cumplimiento.
- Transcripción de podcasts y contenido multimedia: la conversión previa a WAV 16 kHz mono con ffmpeg y el procesado por lotes permiten generar transcripciones de catálogos completos.

## Benchmarks y rendimiento

| Benchmark | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1,59 | 1,59 | 1,60 | 1,61 | 1,58 | 1,62 |
| WER FLEURS en (%) | no disponible | no disponible | 3,99 | no disponible | no disponible | no disponible |

| Métrica | Plataforma | Valor |
|---|---|---:|
| RTF (real-time factor) | Apple M4 Max, CPU | 37,32 |
| RTF | Apple M4 Max, Metal | 208,06 |
| RTF | Ryzen 4750U, CPU | 13,96 |
| RTF | Ryzen 4750U, Vulkan | 25,28 |

El WER de referencia de NVIDIA en LibriSpeech test-clean es 1,63 %, ligeramente superior al 1,59 % obtenido por esta conversión en F32. Las cifras de WER corresponden al split completo de test-clean (2.620 enunciados), batch size 1 y sin timestamps. Los RTF se expresan como factor de velocidad respecto al tiempo real (valores mayores indican mayor velocidad de procesado).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño de pesos, entre 0,5 GB (Q4_K_M) y 2,5 GB (F32).
- GPU recomendadas: no se especifican modelos concretos; la validación reportada usa Apple M4 Max (Metal) y Ryzen 4750U (Vulkan).
- Cabe en GPU de consumo: sí, dado que la cuantización Q4_K_M ocupa 477 MB y F16 1,24 GB.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), con soporte de CPU, Metal y Vulkan.
- Latencia y throughput: RTF de 37,32 (CPU M4 Max), 208,06 (Metal M4 Max), 13,96 (CPU Ryzen 4750U) y 25,28 (Vulkan Ryzen 4750U).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| parakeet-unified-en-0.6b-gguf (esta ficha) | 618 M | no disponible | en | NVIDIA Open Model License | GGUF |
| nvidia/parakeet-unified-en-0.6b | 618 M | no disponible | en | NVIDIA Open Model License | NeMo |
| myflow-ai/parakeet-unified-en-0.6b-gguf | 618 M | no disponible | en | no disponible | GGUF |

La alternativa directa es el modelo original de NVIDIA en formato NeMo, con idéntica precisión pero sin las ventajas de portabilidad de GGUF. La conversión de myflow-ai ofrece el mismo modelo en GGUF, aunque la información disponible no detalla sus cuantizaciones ni sus métricas de validación.

## Limitaciones y advertencias

- Solo soporta inglés (en-US); no transcribe otros idiomas ni detecta el idioma de entrada.
- No soporta traducción automática.
- Es un modelo ASR puro: no tiene tool calling, agentes ni razonamiento multi-step.
- El WER puede degradarse en dominios con acentos no estadounidenses, ruido extremo o vocabulario técnico específico, aunque no se aportan métricas por dominio.
- La licencia NVIDIA Open Model License impone condiciones específicas para uso comercial; es necesario revisar el texto completo antes de desplegar en producción.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria independiente.
- La conversión GGUF depende de transcribe.cpp; no es compatible con llama.cpp, vLLM ni Ollama.
- El audio debe convertirse previamente a WAV mono a 16 kHz.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/avericaai/parakeet-unified-en-0.6b-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-unified-en-0.6b
- Conversión de referencia: https://huggingface.co/handy-computer/parakeet-unified-en-0.6b-gguf
- Conversión alternativa: https://huggingface.co/myflow-ai/parakeet-unified-en-0.6b-gguf
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-unified-en-0.6b.md
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Commit del modelo base: https://huggingface.co/nvidia/parakeet-unified-en-0.6b/commit/d4ac992
- Commit de validación transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/42528dd
