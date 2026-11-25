# GhaythMahadin/Voxtral-Mini-3B-2507-gguf

## Resumen

Voxtral-Mini-3B-2507-gguf es una conversión a formato GGUF del modelo mistralai/Voxtral-Mini-3B-2507, publicada por el usuario GhaythMahadin para su uso con transcribe.cpp, un runtime de inferencia de audio-LLM en C++. Voxtral Mini es un modelo de reconocimiento automático del habla (ASR) y traducción de voz desarrollado por Mistral AI que combina un codificador de audio bidireccional derivado de Whisper-large-v3 con un decodificador de lenguaje causal Ministral-3B de 30 capas. El modelo resuelve tareas de transcripción, traducción y comprensión de audio en modo offline.

La relevancia de esta ficha concreta radica en que ofrece los pesos en cuantizaciones que van desde BF16 (9,37 GB) hasta Q4_K_M (2,98 GB), lo que permite ejecutar un modelo de audio-LLM de 4.676 millones de parámetros en hardware de consumo, incluyendo CPU y GPU integradas mediante backend Vulkan o Metal. El modelo soporta ocho idiomas (inglés, francés, alemán, español, italiano, portugués, neerlandés e hindi), detección automática de idioma y traducción de voz, con una licencia Apache-2.0 heredada del modelo base.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 25 de noviembre de 2026. La conversión está validada contra la referencia de Transformers con paridad a nivel de tensor (43 tensores dentro de tolerancia, transcripción byte-exacta en BF16).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Audio-LLM: codificador de audio bidireccional (Whisper-large-v3) + proyector de 4 frame-groups + decodificador causal Ministral-3B (30 capas, GQA 32/8, NEOX RoPE, SwiGLU) |
| Parámetros totales | 4.676.297.232 (4,68 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32k tokens (hasta 30 min de audio para transcripción, 40 min para comprensión) |
| Tipos de cuantización | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, de, es, it, pt, nl, hi |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (runtime transcribe.cpp) |
| Tokens de audio | 375 tokens de audio por fragmento de 30 s |
| Entrada de audio | WAV mono a 16 kHz, frontend log-mel |
| Tokenizador | Tekken (mistral-common) |
| Decodificación | greedy (por defecto) |
| Tamaño del repo | 8,0 GB |

## Arquitectura y entrenamiento

Voxtral Mini sigue una arquitectura de audio-LLM en la que un codificador de audio bidireccional basado en Whisper-large-v3 procesa la señal de audio y la proyecta mediante un proyector de 4 frame-groups que genera 375 tokens de audio por cada fragmento de 30 segundos. Estos tokens se inyectan en un decodificador causal Ministral-3B con 30 capas, atención GQA con 32 cabezas de consulta y 8 de clave/valor, RoPE de tipo NEOX y activación SwiGLU. El modelo comparte codificador, proyector, frontend log-mel y tokenizador Tekken con su hermano mayor Voxtral Small 24B, sustituyendo el decodificador Mistral-Small-24B por uno de 3B.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card del autor de la conversión no incluye estos datos y la sección reproducida del modelo original está truncada. La innovación técnica destacable es la inyección de tokens de audio en un decodificador de lenguaje causal, que permite realizar transcripción, traducción y comprensión de audio con un único modelo sin necesidad de un ASR y un LLM separados. La conversión GGUF preserva la paridad numérica con la referencia de Transformers: 43 tensores verificados dentro de tolerancia y transcripción byte-exacta en BF16.

## Capacidades

- Transcripción de voz a texto con modo dedicado de ASR y predicción automática del idioma de origen.
- Traducción de voz (speech translation) mediante la plantilla instruct de mistral-common.
- Detección automática de idioma entre los ocho idiomas soportados.
- Comprensión de audio: preguntas y respuestas directamente sobre el audio y generación de resúmenes estructurados sin pipeline ASR + LLM separado.
- Function calling a partir de la voz: activación de funciones de backend, flujos de trabajo o llamadas a API según la intención hablada.
- Capacidades de texto heredadas del backbone Ministral-3B.
- Procesamiento offline de audio de larga duración (hasta 30 min para transcripción, 40 min para comprensión) gracias a la ventana de 32k tokens.
- No soporta streaming (streaming: false según metadatos del autor).
- No genera timestamps (timestamps: none según metadatos del autor).

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa hasta 30 minutos de audio en una sola pasada con su contexto de 32k tokens, generando la transcripción completa sin fragmentar la señal y con detección automática del idioma de los participantes.
- Subtitulado y traducción de contenido audiovisual: la capacidad de speech translation permite generar subtítulos traducidos entre los ocho idiomas soportados usando la plantilla instruct de mistral-common, adecuado para localización de vídeos y pódcast.
- Asistentes de voz con function calling: la activación de funciones de backend a partir de la intención hablada permite construir interfaces de voz que desencadenan acciones (reservas, consultas de estado, control de dispositivos) sin un componente NLU separado.
- Análisis y resumen de llamadas de atención al cliente: el modelo puede responder preguntas directamente sobre el audio y generar resúmenes estructurados, lo que simplifica la integración al eliminar la necesidad de encadenar un ASR con un LLM de texto.
- Despliegue en hardware de consumo y entornos sin GPU dedicada: las cuantizaciones Q4_K_M (2,98 GB) y Q5_K_M (3,46 GB) permiten ejecutar el modelo en CPU y GPU integradas mediante Vulkan o Metal, con ratios de tiempo real de 1,2 en Vulkan sobre Ryzen 4750U y 14,9 en Metal sobre M4 Max.
- Procesamiento offline y privado de audio sensible: al ejecutarse localmente con transcribe.cpp sobre WAV mono de 16 kHz, el audio no abandona el dispositivo, lo que encaja en entornos con requisitos de privacidad como sanidad, legal o investigación.
- Investigación en ASR multilingüe: la paridad numérica verificada con la referencia de Transformers y las métricas WER publicadas por cuantización facilitan la reproducibilidad en experimentos de reconocimiento de habla.

## Benchmarks y rendimiento

Resultados de WER sobre LibriSpeech test-clean (2620 utterances, normalizador de texto inglés de Whisper, batch size 8 en NVIDIA L40S):

| Cuantización | Tamaño | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 9,37 GB | 1,88 % |
| F16 | 9,38 GB | 1,89 % |
| Q8_0 | 5,00 GB | 1,87 % |
| Q6_K | 3,87 GB | 1,87 % |
| Q5_K_M | 3,46 GB | 1,91 % |
| Q4_K_M | 2,98 GB | 1,94 % |
| Referencia Transformers BF16 (misma máquina) | no disponible | 1,87 % |

Ratios de tiempo real (RTF) publicados por el autor:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 14,9 |
| Apple M4 Max | CPU | 2 |
| AMD Ryzen 4750U | Vulkan | 1,2 |
| AMD Ryzen 4750U | CPU | 0,5 |

La model card original menciona resultados de benchmarks de audio (WER medio) pero la sección está truncada en la información disponible, por lo que no se incluyen cifras adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en Q4_K_M, 3,5 GB en Q5_K_M, 3,9 GB en Q6_K, 5 GB en Q8_0 y 9,4 GB en BF16/F16, según los tamaños de archivo publicados.
- GPU recomendadas: NVIDIA L40S para validación y referencia; cualquier GPU con soporte de los backends de transcribe.cpp (Metal en Apple Silicon, Vulkan en GPUs integradas y discretas AMD/Intel).
- Cabe en GPU de consumo: sí, las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs con 4-6 GB de VRAM y en GPU integradas con Vulkan o Metal.
- Opciones de despliegue: transcribe.cpp (runtime oficial de esta conversión, compilado con CMake). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 14,9 en Metal sobre M4 Max, 2 en CPU sobre M4 Max, 1,2 en Vulkan sobre Ryzen 4750U y 0,5 en CPU sobre Ryzen 4750U. No se publican cifras de throughput en tokens por segundo.
- Entrada requerida: WAV mono a 16 kHz; la model card recomienda convertir con ffmpeg (`-ar 16000 -ac 1`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / disponibilidad |
|---|---:|---|---|---|---|
| Voxtral-Mini-3B-2507-gguf (esta ficha) | 4,68 B | 32k tokens (30-40 min audio) | 8 | Apache-2.0 | GGUF para transcribe.cpp |
| Voxtral Small 24B | no disponible en la información | no disponible | no disponible | no disponible | pesos originales de Mistral AI |
| Ministral-3B | 3 B (backbone de texto) | no disponible | no disponible | no disponible | modelo de texto, sin audio |
| Whisper-large-v3 | no disponible | no disponible | no disponible | no disponible | codificador de audio base, solo ASR |

La información disponible solo permite comparar con Voxtral Small 24B, que comparte codificador, proyector, frontend log-mel y tokenizador Tekken pero sustituye el decodificador de 3B por Mistral-Small-24B, y con Ministral-3B, backbone de texto del modelo. No se dispone de datos de benchmarks ni de licencia de estos comparables en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos de lenguaje: el decodificador causal puede generar texto no presente en el audio, especialmente con audio ruidoso o con solapamiento de hablantes.
- Sesgos no documentados: la información disponible no detalla sesgos conocidos por idioma, acento, género o dominio.
- Cobertura lingüística limitada a ocho idiomas (en, fr, de, es, it, pt, nl, hi); no se garantiza rendimiento fuera de esa lista.
- Sin soporte de streaming: el modelo procesa el audio de forma offline, lo que lo hace inadecuado para transcripción en tiempo real continua.
- Sin generación de timestamps: no produce marcas temporales por palabra o segmento, lo que limita su uso en subtitulado fino o alineación forzada.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación independiente por parte de la comunidad.
- La conversión está fijada a un commit concreto del modelo base (3060fe3) y validada contra un commit concreto de transcribe.cpp (483c122); cambios posteriores en cualquiera de los dos pueden romper la paridad.
- Requiere audio de entrada en WAV mono a 16 kHz; otros formatos necesitan conversión previa con ffmpeg.
- Licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar los términos completos en la model card original de mistralai/Voxtral-Mini-3B-2507.
- El runtime transcribe.cpp debe compilarse desde el código fuente; no se documentan binarios precompilados ni integración con frameworks de servicio estándar.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/GhaythMahadin/Voxtral-Mini-3B-2507-gguf
- Modelo base en Hugging Face: https://huggingface.co/mistralai/Voxtral-Mini-3B-2507
- Commit del modelo base utilizado: https://huggingface.co/mistralai/Voxtral-Mini-3B-2507/commit/3060fe3
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de transcribe.cpp usado para validación: https://github.com/handy-computer/transcribe.cpp/tree/483c122
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/voxtral-mini-3b-2507.md
- Blog de Mistral AI sobre Voxtral: https://mistral.ai/news/voxtral
- Artículo de investigación (arXiv 2507.13264): https://arxiv.org/abs/2507.13264
- Anuncio de Ministral: https://mistral.ai/news/ministraux
- Pesos GGUF alternativos (handy-computer): https://huggingface.co/handy-computer/Voxtral-Mini-3B-2507-gguf
