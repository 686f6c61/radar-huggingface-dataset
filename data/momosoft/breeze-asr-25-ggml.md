# MomoSoft/Breeze-ASR-25-ggml

## Resumen

Breeze ASR 25 es un modelo de reconocimiento automático del habla (ASR) desarrollado por MediaTek Research, obtenido mediante fine-tuning de Whisper large-v2 de OpenAI. Está optimizado específicamente para el mandarín taiwanés y para escenarios de code-switching entre mandarín e inglés, tanto a nivel intraoracional como interoracional. El modelo incorpora un mecanismo de "unified mix embedding" en la decodificación que mejora la transcripción de frases mixtas, y presenta una alineación temporal mejorada, lo que lo hace adecuado para subtitulado automático.

Este repositorio concreto, `MomoSoft/Breeze-ASR-25-ggml`, contiene una conversión a formato GGML para su uso con whisper.cpp, realizada a partir de los pesos oficiales en safetensors. La conversión está documentada con hashes SHA256 y pasos reproducibles, y se ha verificado que los tensores coinciden exactamente con otra conversión independiente. El modelo se distribuye bajo licencia Apache 2.0, igual que el modelo original.

La relevancia actual de este modelo radica en su especialización en un idioma y un fenómeno lingüístico (code-switching) que los modelos ASR genéricos suelen manejar peor, y en su disponibilidad en un formato ligero (GGML) que permite ejecutarlo en CPU y en dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper encoder-decoder (fine-tune de Whisper large-v2) |
| Parametros totales | no disponible (heredados de Whisper large-v2, ~1550M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (estandar de Whisper: ventanas de 30 s de audio) |
| Tipos de cuantizacion | q5_0, f16 |
| Idiomas soportados | zh (mandarin, especialmente taiwanes), en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGML (binarios para whisper.cpp) |

## Arquitectura y entrenamiento

El modelo base es Whisper large-v2, un transformer encoder-decoder con atención estándar, entrenado por OpenAI sobre 680 000 horas de audio multilingüe. Breeze ASR 25 se obtiene mediante fine-tuning de este modelo sobre datos específicos para mandarín taiwanés y code-switching mandarín-inglés. Según la documentación de MediaTek Research, el fine-tuning emplea un "unified mix embedding" en la decodificación, que permite al modelo representar de forma conjunta los tokens de ambos idiomas y manejar mejor los cambios de idioma dentro de una misma frase o entre frases consecutivas.

El tokenizer y el preprocesamiento (filtros mel) no se modifican respecto a Whisper original. Los datos de entrenamiento incluyen conjuntos sintéticos derivados de FineWeb2 (licencia ODC) y BreezyVoice (Apache-2.0), así como el corpus NTUML2021 (MIT), todos con licencias permisivas. No se dispone de información sobre el número exacto de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO; el fine-tuning es supervisado sobre datos de audio transcrito.

## Capacidades

- Reconocimiento automático del habla en mandarín taiwanés, con buena precisión en acentos y expresiones locales.
- Code-switching mandarín-inglés: maneja cambios de idioma intraoracionales (p. ej., "quiero un coffee") e interoracionales (p. ej., "Hoy hace buen tiempo. Let's go for a walk.").
- Alineación temporal mejorada: produce marcas de tiempo más precisas que Whisper base, adecuadas para subtitulado automático.
- Transcripción de audio en inglés estándar, aunque su especialización principal es el mandarín taiwanés.
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de transcripción de voz a texto.

## Casos de uso

- Subtitulado automático de vídeos en mandarín taiwanés o con mezcla de idiomas: la alineación temporal mejorada permite generar subtítulos sincronizados con precisión, tanto para plataformas de vídeo como para herramientas de edición.
- Transcripción de reuniones y entrevistas bilingües: en entornos donde los participantes alternan entre mandarín e inglés, el modelo mantiene la coherencia y reduce errores de cambio de idioma.
- Asistentes de voz para aplicaciones locales: al poder ejecutarse en CPU mediante whisper.cpp, puede integrarse en asistentes domésticos o aplicaciones móviles sin depender de la nube.
- Análisis de llamadas de servicio al cliente: transcripción de conversaciones telefónicas en las que el cliente mezcla mandarín e inglés, para su posterior análisis o búsqueda.
- Generación de actas o resúmenes de audio: combinado con un modelo de lenguaje, se puede transcribir el audio y luego resumir el contenido.
- Accesibilidad: transcripción en tiempo real para personas con discapacidad auditiva en contextos donde se habla mandarín taiwanés o bilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de HuggingFace no incluye métricas como WER o CER, y la búsqueda web no ha proporcionado tablas comparativas. Se recomienda consultar el artículo arXiv:2506.11130 o el repositorio oficial de MediaTek Research para obtener datos de evaluación.

## Requisitos de hardware

- El archivo cuantizado q5_0 ocupa aproximadamente 1,08 GB, por lo que puede cargarse en memoria RAM o VRAM de cualquier GPU moderna, incluso en GPUs integradas.
- El archivo f16 ocupa unos 3,09 GB, requiriendo al menos 4 GB de VRAM para inferencia en GPU, o memoria RAM suficiente en CPU.
- En una Apple M2 Pro, whisper.cpp tarda unos 1,7 segundos en procesar 10 segundos de audio con el modelo f16, y unos 2,0 segundos con q5_0 (la cuantización no acelera la inferencia, solo reduce el tamaño del archivo).
- Se puede ejecutar en CPU con whisper.cpp, en GPU con herramientas compatibles con GGML, o mediante Ollama si se integra en un entorno de servidor.
- Para uso en producción con múltiples peticiones, se recomienda un servidor con GPU (p. ej., RTX 3060 o superior) y vLLM o TGI, aunque estos últimos no soportan directamente GGML; habría que convertir a otro formato o usar whisper.cpp en modo servidor.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| Breeze ASR 25 (GGML) | Whisper large-v2 fine-tuned | ~1,5B | 30 s audio | zh (taiwanes), en | Apache-2.0 | GGML |
| Whisper large-v2 (original) | Whisper encoder-decoder | ~1,5B | 30 s audio | 99 idiomas | MIT | safetensors, GGML |
| Whisper large-v3 | Whisper encoder-decoder | ~1,5B | 30 s audio | 99 idiomas | MIT | safetensors, GGML |

La principal diferencia frente a Whisper large-v2 o v3 es la especialización en mandarín taiwanés y code-switching, que suele traducirse en un WER menor en esos dominios, aunque no se dispone de cifras concretas. Whisper large-v3 tiene mejor rendimiento general en inglés y otros idiomas, pero no está optimizado para el fenómeno de mezcla de idiomas. La licencia Apache-2.0 de Breeze ASR 25 es más permisiva que la MIT de Whisper en cuanto a uso comercial sin atribución, aunque ambas lo permiten.

## Limitaciones y advertencias

- El modelo está especializado en mandarín taiwanés; su rendimiento en otros dialectos del chino (p. ej., mandarín de Pekín o cantonés) puede ser inferior.
- No soporta otros idiomas más allá de zh y en; no es multilingüe como Whisper original.
- La cuantización q5_0 no mejora la velocidad de inferencia, solo reduce el tamaño del archivo; en algunos casos puede ser incluso más lenta que f16.
- Al ser un modelo de transcripción, puede presentar alucinaciones en segmentos de audio con ruido o silencio, como cualquier modelo Whisper.
- No se han publicado benchmarks oficiales en la información disponible, por lo que el rendimiento real debe validarse con datos propios.
- El repositorio GGML es una conversión de terceros; aunque se documenta la reproducibilidad, no hay garantía de que el mantenimiento sea continuo.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribución correspondiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MomoSoft/Breeze-ASR-25-ggml
- Modelo original de MediaTek Research: https://huggingface.co/MediaTek-Research/Breeze-ASR-25
- Repositorio GitHub de Breeze ASR 25: https://github.com/mtkresearch/Breeze-ASR-25
- Artículo arXiv: https://arxiv.org/abs/2506.11130
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Conversión alternativa (danielkao0421): https://huggingface.co/danielkao0421/Breeze-ASR-25-ggml
