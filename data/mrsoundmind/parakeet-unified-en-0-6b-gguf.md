# mrsoundmind/parakeet-unified-en-0.6b-gguf

## Resumen

parakeet-unified-en-0.6b-gguf es una conversión a formato GGUF del modelo de reconocimiento automático del habla nvidia/parakeet-unified-en-0.6b, publicada por el usuario mrsoundmind para su uso con transcribe.cpp, un motor de inferencia en C++ derivado del ecosistema llama.cpp pero orientado a modelos de audio. El modelo original lo desarrolla NVIDIA y se distribuye bajo licencia CC-BY-4.0. Resuelve el problema de transcripción de voz a texto en inglés con puntuación y capitalización automáticas, ofreciendo un único modelo que cubre tanto inferencia offline como streaming (aunque esta conversión GGUF solo expone el modo offline).

La arquitectura combina un encoder FastConformer de unos 618 millones de parámetros con un decoder RNN-T (transducer). El modelo fue entrenado por NVIDIA sobre aproximadamente 250.000 horas de audio en inglés estadounidense del dataset Granary, con soporte nativo de puntuación y mayúsculas. Su relevancia ahora radica en que permite ejecutar un sistema ASR de calidad cercana al estado del arte en hardware de consumo gracias a las cuantizaciones GGUF (desde 477 MB en Q4_K_M), con una tasa de error de palabra (WER) del 1,58-1,62 % en LibriSpeech test-clean.

Esta ficha describe la conversión GGUF y, por extensión, el modelo base del que hereda capacidades y limitaciones. La conversión está fijada al commit d4ac992 del modelo original (fechado el 2026-05-10) y validada contra la referencia NeMo en el commit 42528dd de transcribe.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + RNN-T / transducer (decoder) |
| Parametros totales | 618.309.121 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio; streaming con latencia mínima de 160 ms en el modelo base) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (inglés, principalmente en-US) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |
| Tamano del repo | 0,7 GB |
| Entrada de audio | WAV mono a 16 kHz |
| Soporte de streaming | sí en el modelo base; no expuesto aún en transcribe.cpp (solo offline) |
| Timestamps | a nivel de token |
| Traduccion | no |
| Deteccion de idioma | no |

## Arquitectura y entrenamiento

El modelo base emplea un encoder FastConformer, una variante de Conformer optimizada para reducir coste computacional en audio, acoplado a un decoder RNN-T (transducer). El modelo se entrenó de forma conjunta en modos offline y streaming, de manera que un único conjunto de pesos sirve para ambos regímenes; en streaming permite elegir latencias entre 160 ms y 2080 ms en pasos de 80 ms ajustando el tamaño de chunk y el contexto derecho. El entrenamiento se realizó mayoritariamente sobre la porción en inglés del dataset Granary, con unas 250.000 horas de habla en inglés estadounidense en condiciones acústicas diversas. El modelo produce texto en alfabeto inglés, espacios y apóstrofos, con puntuación y capitalización integradas.

La conversión GGUF replica los pesos del modelo original y los valida numéricamente contra la implementación de referencia NeMo. La decodificación es greedy RNN-T sin modelo de lenguaje externo. La innovación práctica de esta conversión es doble: por un lado, traslada un modelo ASR de NVIDIA al ecosistema transcribe.cpp (basado en GGUF, ejecutable en CPU, Metal y Vulkan); por otro, demuestra que las cuantizaciones agresivas degradan el WER de forma marginal (de 1,59 % en F32 a 1,62 % en Q4_K_M).

## Capacidades

- Transcripción de voz a texto en inglés con puntuación y capitalización automáticas.
- Reconocimiento de habla en modo offline (único modo expuesto en esta conversión GGUF).
- El modelo base soporta streaming con latencia mínima de 160 ms, aunque transcribe.cpp aún no expone una entrada de streaming.
- Generación de timestamps a nivel de token.
- Manejo de condiciones acústicas diversas gracias al entrenamiento sobre 250.000 horas de audio.
- No soporta traducción.
- No soporta detección de idioma.
- No soporta tool calling ni function calling (es un modelo ASR, no un LLM).
- No soporta razonamiento multi-paso ni agentes.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Subtitulado y transcripción de reuniones: el modelo convierte grabaciones de audio en inglés en texto con puntuación y capitalización, adecuado para actas automáticas y resúmenes posteriores, ejecutable en local con la cuantización Q8_0 (731 MB).
- Atención al cliente y análisis de llamadas: transcripción por lotes de grabaciones telefónicas en inglés para extraer métricas, palabras clave y sentimiento, aprovechando el bajo coste de despliegue en CPU.
- Generación de subtítulos para vídeo: procesado de pistas de audio extraídas con ffmpeg a WAV mono 16 kHz y conversión a texto con timestamps a nivel de token para alinear subtítulos.
- Transcripción en el dispositivo (edge): con Q4_K_M (477 MB) el modelo cabe en dispositivos con recursos limitados y puede ejecutarse vía Vulkan o CPU en portátiles modestos (RTF de 12,5 en Vulkan y 7,5 en CPU sobre un Ryzen 4750U).
- Investigación en ASR: servir como referencia reproducible en formato GGUF para comparar cuantizaciones y validar implementaciones alternativas contra NeMo, con un WER conocido por cuantización.
- Accesibilidad: dictado y transcripción de audio en inglés para personas con dificultades auditivas o para generar texto a partir de notas de voz, ejecutándose localmente sin dependencia de la nube.
- Prototipado rápido de pipelines de voz: integración en scripts de línea de comandos mediante transcribe-cli para pruebas de concepto de transcripción sin infraestructura GPU.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 1,59 | 1,59 | 1,60 | 1,61 | 1,58 | 1,62 |
| Tamano (GB) | 2,47 | 1,24 | 0,731 | 0,602 | 0,541 | 0,477 |

| Metrica de velocidad (RTF) | Metal (M4 Max) | CPU (M4 Max) | Vulkan (Ryzen 4750U) | CPU (Ryzen 4750U) |
|---|---:|---:|---:|---:|
| RTF | 163 | 28,5 | 12,5 | 7,5 |

El WER se midió sobre el split completo de LibriSpeech test-clean (2620 enunciados) con decodificación greedy RNN-T y sin modelo de lenguaje externo. La referencia F32 es 1,59 %; NVIDIA reporta 1,63 % en el mismo split para el modelo original. El RTF (factor de tiempo real) indica cuántas veces más rápido que el tiempo real procesa el audio: valores más altos son mejores.

## Requisitos de hardware

- VRAM/RAM estimada: entre 477 MB (Q4_K_M) y 2,47 GB (F32) para los pesos; el consumo adicional de memoria de trabajo es reducido por el tamaño del modelo.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA) es suficiente; no requiere GPU de datacenter.
- Cabe en GPU de consumo: sí, en cualquier GPU integrada o dedicada moderna; también en CPU.
- Opciones de despliegue: transcribe.cpp (compilación desde fuente con CMake), ejecutable transcribe-cli; no se indica soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: RTF de 163 en Metal sobre M4 Max, 28,5 en CPU sobre M4 Max, 12,5 en Vulkan y 7,5 en CPU sobre Ryzen 4750U (cuanto mayor, más rápido que tiempo real).
- Preprocesado: el audio debe convertirse a WAV mono 16 kHz (por ejemplo con ffmpeg) antes de la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Streaming | Licencia | Formato | WER LibriSpeech test-clean |
|---|---|---|---:|---|---|---:|
| parakeet-unified-en-0.6b-gguf (esta ficha) | 618 M | en | no expuesto (sí en base) | CC-BY-4.0 | GGUF | 1,58-1,62 % |
| nvidia/parakeet-unified-en-0.6b (original) | 618 M | en | sí (160 ms mín.) | CC-BY-4.0 | NeMo | 1,63 % (reportado) |
| Whisper large-v3 | no disponible en la información proporcionada | multilingüe | no | MIT (según información pública, no verificada aquí) | safetensors, GGUF | no disponible |
| Whisper small | no disponible en la información proporcionada | multilingüe | no | MIT (según información pública, no verificada aquí) | safetensors, GGUF | no disponible |

La comparación con alternativas de la misma categoría (modelos ASR) se limita a los datos disponibles: el modelo original de NVIDIA y, de forma cualitativa, la familia Whisper. No se dispone en la información proporcionada de cifras de WER de Whisper en el mismo split ni de sus parámetros exactos, por lo que no se incluyen números no verificados.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas ni traducción; el entrenamiento se centró en inglés estadounidense, por lo que el rendimiento en otros acentos puede degradarse.
- Solo modo offline en esta conversión: aunque el modelo base soporta streaming, transcribe.cpp no expone aún esa funcionalidad; las ventajas de latencia baja (160 ms) no están disponibles aquí.
- Sin detección de idioma: si se introduce audio en otro idioma, el modelo intentará transcribirlo como inglés, produciendo texto incorrecto.
- Riesgo de alucinación en audio ruidoso o silencioso: como todo modelo ASR, puede generar texto plausible en segmentos sin habla o con ruido extremo.
- Sesgos acústicos: el dominio de entrenamiento (Granary, en-US) puede introducir peor rendimiento en acentos no estadounidenses, habla con ruido de fondo atípico o audio de baja calidad.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar la autoría de NVIDIA y respetar los términos del modelo base.
- Dependencia de transcribe.cpp: requiere compilar desde fuente y el ecosistema es menos maduro que llama.cpp; el soporte de herramientas y comunidad es limitado (0 descargas, 0 likes en el momento de la ficha).
- Validación fijada a commits concretos: la conversión se validó contra NeMo en el commit d4ac992; cambios futuros en el modelo base o en transcribe.cpp podrían no estar cubiertos.
- Timestamps a nivel de token: no se ofrecen timestamps a nivel de palabra o segmento de forma nativa, lo que puede complicar el alineado fino de subtítulos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrsoundmind/parakeet-unified-en-0.6b-gguf
- Modelo base original: https://huggingface.co/nvidia/parakeet-unified-en-0.6b
- Commit del modelo base usado: https://huggingface.co/nvidia/parakeet-unified-en-0.6b/commit/d4ac992
- Repositorio transcribe.cpp: https://github.com/mrsoundmind/transcribe.cpp
- Paper de referencia (arXiv:2604.19079): https://arxiv.org/abs/2604.19079
- Paper de referencia (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
- Paper de referencia (arXiv:2304.09325): https://arxiv.org/abs/2304.09325
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
