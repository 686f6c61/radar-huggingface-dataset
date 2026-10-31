# AtomicChat/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF

## Resumen

NVIDIA Nemotron 3.5 Transcribe 30B-A4B GGUF es una conversión a formato GGUF, realizada por AtomicChat, del modelo de reconocimiento de voz (ASR) open-weight de NVIDIA [nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B). El modelo original es un sistema de speech-to-text multilingüe capaz de transcribir grabaciones de hasta una hora de duración, generar marcas de tiempo a nivel de palabra, etiquetar hablantes (diarización), traducir voz y aceptar instrucciones personalizadas.

Esta versión GGUF está pensada para el runtime propio de NVIDIA [NeMo-Speech.cpp](https://github.com/NVIDIA/NeMo-Speech.cpp) y permite ejecutar el modelo localmente sin descargar el checkpoint original de 67 GB ni realizar conversiones en Python. El repositorio incluye siete decodificadores cuantizados (de 13,57 a 35 GB), un codificador de voz en F16 y un draft model DFlash2 para decodificación especulativa.

El modelo base tiene 32.913.266.240 parámetros con arquitectura MoE (aproximadamente 4B activos, según la nomenclatura A4B), lo que lo hace especialmente relevante: ofrece calidad de transcripción de nivel industrial con coste computacional reducido, y las cuantizaciones aquí publicadas lo hacen accesible desde GPUs de consumo de 16 GB hasta aceleradores Blackwell con soporte nativo NVFP4.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE decoder + encoder de voz (speech encoder, rama de hablantes y cabecera CTC de timestamps) |
| Parametros totales | 32.913.266.240 (~32,9B) |
| Parametros activos | ~4B (según nomenclatura A4B; no disponible el dato exacto) |
| Longitud de contexto | No disponible (soporta grabaciones de audio de hasta 1 hora) |
| Tipos de cuantizacion | Q8_0, AD-Q5_0_XL, AD-IQ4_NL_L, AD-IQ4_NL, AD-NVFP4, AD-Q2_0_L, AD-Q2_0_M (con imatrix); encoder en F16 |
| Idiomas soportados | 40 según NVIDIA (14 etiquetados en el repo: en, de, fr, es, it, pt, nl, pl, cs, sk, hi, ja, ko, zh) |
| Licencia | openmdw-1.1 (otra licencia, "other") |
| Formato de pesos | GGUF (para el runtime NeMo-Speech.cpp de NVIDIA) |

## Arquitectura y entrenamiento

El modelo original de NVIDIA combina un encoder de voz (incluido en el archivo `...-Encoder-F16.gguf`, junto con la rama de diarización de hablantes y la cabecera CTC para timestamps de palabra) con un decodificador MoE de 32,9B parámetros con unos 4B activos por token. Esta separación encoder/decoder se refleja en la estructura del repositorio GGUF: el decodificador referencia por nombre al archivo del encoder, que debe conservar su nombre original.

Sobre el proceso de entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) no se ha publicado información en la documentación disponible. En cuanto a la conversión de AtomicChat, destaca el uso de matrices de importancia (imatrix) para las cuantizaciones IQ4_NL, Q5 y Q2_0, embeddings y cabeza de salida en Q8_0 en lugar de BF16, y una variante AD-NVFP4 con expertos en formato NVFP4 nativo para GPUs Blackwell. Los archivos AD-NVFP4 e IQ4_NL ocupan 19,68 GB frente a los 21,79 GB y 20,35 GB de las conversiones por defecto del propio conversor de NVIDIA, respectivamente.

## Capacidades

- Transcripción automática de voz (ASR) en 40 idiomas según NVIDIA, con 14 idiomas etiquetados explícitamente (inglés, alemán, francés, español, italiano, portugués, neerlandés, polaco, checo, eslovaco, hindi, japonés, coreano y chino).
- Procesamiento de grabaciones de audio de hasta una hora de duración.
- Marcas de tiempo a nivel de palabra (word timestamps) mediante cabecera CTC.
- Diarización de hablantes (etiquetado de quién habla en cada momento).
- Traducción de voz (speech translation).
- Aceptación de instrucciones personalizadas (custom instructions).
- Decodificación especulativa mediante el draft model DFlash2 incluido (1,15 GB, BF16), en la ruta CUDA por lotes.
- Ejecución en CPU, Metal y Vulkan, además de CUDA.

## Casos de uso

- Transcripción de reuniones y videoconferencias: la diarización de hablantes y los timestamps por palabra permiten generar actas con atribución de intervenciones y navegación temporal por la grabación, sin enviar audio a servicios externos.
- Subtitulado y accesibilidad: los word timestamps facilitan sincronizar subtítulos con precisión, y la traducción de voz permite generar subtítulos traducidos directamente.
- Procesamiento de podcasts y contenido audiovisual de larga duración: la ventana de hasta una hora por grabación evita fragmentación compleja del audio.
- Transcripción médica, legal o empresarial offline: la ejecución local con NeMo-Speech.cpp garantiza que datos sensibles no salgan de la infraestructura propia.
- Asistentes de voz y agentes con entrada de audio: el modelo puede integrarse como capa ASR en pipelines de agentes que requieren comprensión de instrucciones habladas.
- Traducción de conferencias y contenido multilingüe: la capacidad de speech translation sobre 40 idiomas permite flujos de subtitulado en directo o diferido.
- Análisis de call centers: la combinación de diarización, timestamps y transcripción multilingüe permite indexar y analizar grandes volúmenes de llamadas.
- Despliegue en estaciones de trabajo sin datacenter: las cuantizaciones AD-Q2_0_M (13,57 GB) y AD-IQ4_NL (19,68 GB) permiten ejecutar el modelo en GPUs de consumo de 16-24 GB o incluso en CPU.

## Benchmarks y rendimiento

AtomicChat ha medido el word error rate (WER) del decodificador BF16 de referencia sobre 2.200 utterances, y las diferencias de las cuantizaciones frente a BF16 mediante bootstrap pareado. Los valores absolutos publicados del decodificador BF16 son:

| Benchmark | WER / CER (BF16) |
|---|---|
| LibriSpeech clean | 1,58% |
| LibriSpeech other | 3,34% |
| MLS German | 4,04% |
| MLS French | 3,79% |
| MLS Spanish | 3,23% |
| FLEURS Chinese (CER) | 9,77% |

Según la model card, todos los decodificadores desde 15,55 GB transcriben prácticamente igual que BF16: el error se mantiene dentro de ±0,18 puntos frente a BF16 en inglés, alemán, francés y español, y el error de carácter en chino se mueve entre +0,02 y +0,41 puntos. El decodificador AD-Q2_0_M (13,57 GB) mantiene inglés, alemán, francés y español dentro del margen de ruido, con chino +1,5 puntos de CER. Los valores absolutos por cuantización no se han incluido completos en la información disponible.

## Requisitos de hardware

- Encoder obligatorio en todos los casos: 1,67 GB (`...-Encoder-F16.gguf`).
- AD-Q2_0_M (13,57 GB): GPUs de 16 GB; pico de memoria GPU de 15,6 GiB con los ajustes indicados en la model card.
- AD-Q2_0_L (15,55 GB): Macs de 24 GB (17,2 GB totales con encoder).
- AD-IQ4_NL y AD-NVFP4 (19,68 GB): GPUs de 24 GB (RTX 3090/4090), CPU, Metal y Vulkan; NVFP4 recomendado en Blackwell (RTX 50xx, RTX PRO 6000, DGX Spark, B200).
- AD-IQ4_NL_L (22,55 GB): GPUs y Macs de 32 GB.
- AD-Q5_0_XL (29,26 GB) y Q8_0 (35,00 GB): GPUs de 48 GB o más, Macs de 64 GB.
- Sí cabe en GPUs de consumo: desde 16 GB (cuantización Q2_0_M) hasta 24 GB (IQ4_NL/NVFP4, opción recomendada).
- Despliegue mediante el runtime NVIDIA NeMo-Speech.cpp (soporta CUDA por lotes, CPU, Metal y Vulkan); no es un GGUF estándar de llama.cpp. No se menciona soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponible; se incluye DFlash2 para acelerar la decodificación especulativa en la ruta CUDA por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Nemotron 3.5 Transcribe 30B-A4B (este repo) | 32,9B (~4B activos) | GGUF (NeMo-Speech.cpp) | 40 | openmdw-1.1 | Diarización, timestamps por palabra, speech translation, audio de 1 h |
| Whisper large-v3 (OpenAI) | ~1,5B | PyTorch / GGUF (whisper.cpp) | ~99 | MIT (modelos) | ASR y traducción, sin diarización nativa ni timestamps de palabra nativos |
| Canary 1B (NVIDIA) | ~1B | NeMo | ~25 (con traducción) | CC-BY-4.0 | ASR + traducción, sin diarización integrada |

No se han publicado comparaciones numéricas directas contra estos modelos en la información disponible.

## Limitaciones y advertencias

- El formato GGUF es específico del runtime NeMo-Speech.cpp de NVIDIA; no es directamente compatible con llama.cpp, Ollama u otros runtimes GGUF habituales.
- En las cuantizaciones más agresivas (AD-Q2_0_L y AD-Q2_0_M) la calidad en chino se degrada de forma medible (+0,41 a +1,5 puntos de CER).
- El contador de transcripciones idénticas a BF16 es ruidoso (el orden de batching lo altera), por lo que pequeñas diferencias en esa métrica no son significativas.
- La licencia es "other" (openmdw-1.1): conviene revisar sus términos antes de uso comercial, ya que no es una licencia estándar tipo Apache/MIT.
- La lista de idiomas etiquetada en el repositorio (14) es menor que los 40 idiomas anunciados por NVIDIA para el modelo base.
- Riesgo de alucinación típico de sistemas ASR en segmentos de audio silencioso o ruidoso: no hay datos específicos publicados al respecto.
- Sesgos conocidos, rendimiento en acentos no cubiertos por los benchmarks y datos de entrenamiento del modelo base: no disponible en la información proporcionada.

## Enlaces

- Repositorio GGUF (AtomicChat): https://huggingface.co/AtomicChat/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF
- Modelo base (NVIDIA): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Runtime NeMo-Speech.cpp: https://github.com/NVIDIA/NeMo-Speech.cpp
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Atomic Chat: https://atomic.chat/
- Discord de AtomicChat: https://discord.gg/8wGSsvmg4V
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- X (Twitter): https://x.com/atomic_chat_hq
