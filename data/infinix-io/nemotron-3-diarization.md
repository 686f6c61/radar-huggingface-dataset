# Infinix-io/Nemotron-3-Diarization

## Resumen

Nemotron 3 Diarization es un modelo de diarización de hablantes (identificación de "quién habla y cuándo") desarrollado por NVIDIA, publicado bajo el identificador Infinix-io/Nemotron-3-Diarization en Hugging Face. Está diseñado para funcionar tanto en modo streaming como en modo offline, con soporte para hasta ocho hablantes simultáneos. Su relevancia radica en que un único checkpoint permite configuraciones de baja latencia (buffer de entrada desde 80 ms, con 0,32 s como mínimo recomendado) y configuraciones de tipo offline con buffer de 30,4 s, sin límite máximo de duración de audio en inferencia por chunks.

El modelo sigue la arquitectura Sortformer para resolver la permutación de hablantes, ordenando los canales de salida según la primera aparición de cada hablante en el audio. Para inferencia en streaming incorpora la Arrival-Order Speaker Cache (AOSC) y una cola FIFO, que preservan la identidad de los hablantes a lo largo del tiempo y proporcionan contexto de frames recientes. La resolución de los frames de salida es configurable en múltiplos de 10 ms.

Con aproximadamente 99,2 millones de parámetros y un tamaño de repositorio de 0,7 GB, se trata de un modelo compacto orientado a tareas de clasificación de frames de audio. La licencia openmdw-1.1 permite uso comercial y no comercial. La fecha de publicación indicada es el 23 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sortformer (streaming Sortformer con Arrival-Order Speaker Cache y cola FIFO) |
| Parametros totales | 99.226.504 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana de texto; buffer de entrada configurable: 80 ms (mínimo), 0,32 s (mínimo recomendado), 30,4 s (configuración offline); duración máxima ilimitada con inferencia por chunks |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors y GGUF) |
| Idiomas soportados | no disponible (modelo de audio, no de texto; independiente del idioma en principio, pero no se especifica) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors, GGUF, .nemo |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura basada en Sortformer, un esquema de diarización que resuelve el problema de permutación de hablantes ordenando los canales de salida según el orden de llegada (first arrival) de cada hablante en la señal de audio. Para el modo streaming, incorpora dos mecanismos clave: la Arrival-Order Speaker Cache (AOSC), que retiene información de hablantes de chunks anteriores para mantener la identidad a lo largo del tiempo, y una cola FIFO que aporta contexto de frames recientes en cada paso de procesamiento. La resolución de salida es configurable en múltiplos de 10 ms y el modelo soporta hasta ocho hablantes.

Los detalles concretos sobre el volumen de datos de entrenamiento, la composición del dataset y si se aplicaron técnicas de RLHF o DPO no están disponibles en la información proporcionada. La model card remite al paper de investigación (arXiv:2611.12246) para los detalles de arquitectura, entrenamiento y evaluación. El modelo se distribuye a través de la librería NeMo y también cuenta con un runtime nativo en C++ (NeMo-Speech.cpp) para despliegue local.

## Capacidades

- Diarización de hablantes ("who spoke when") en audio del mundo real, con soporte de hasta ocho hablantes.
- Inferencia en streaming con latencia configurable (buffer de entrada desde 80 ms; mínimo recomendado de 0,32 s).
- Inferencia offline con buffer de entrada de 30,4 s.
- Inferencia por chunks sin límite máximo de duración de audio.
- Resolución de frames de salida configurable en múltiplos de 10 ms.
- Etiquetado de hablante a nivel de palabra cuando se combina con transcripción (`nemo-speech transcribe --diarize --json`).
- Clasificación de frames de audio y detección de actividad de voz (pipeline voice-activity-detection).
- No se especifican capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes; es un modelo especializado en audio.

## Casos de uso

- Transcripción de reuniones con etiquetado de hablantes: el modelo añade etiquetas de hablante a nivel de palabra sobre la transcripción, permitiendo generar actas con atribución correcta de intervenciones en reuniones de hasta ocho participantes.
- Subtitulado y análisis de entrevistas: con la configuración offline (buffer de 30,4 s) se puede procesar audio grabado de duración arbitraria mediante inferencia por chunks, identificando quién habla en cada segmento.
- Atención al cliente y análisis de llamadas: la diarización permite separar las voces de agente y cliente en grabaciones de centros de contacto para su posterior análisis de calidad o cumplimiento.
- Streaming en aplicaciones de baja latencia: con buffers de 80-320 ms, el modelo puede integrarse en sistemas de transcripción en vivo que necesitan identificar hablantes en tiempo real.
- Investigación en lingüística y ciencias sociales: permite segmentar corpus de audio multihablante para análisis de turnos de palabra, solapamientos y patrones de interacción.
- Integración en pipelines de ASR con NeMo: al cargarse mediante `SortformerEncLabelModel` en NeMo, se puede encadenar con modelos de reconocimiento de voz para producir transcripciones diarizadas de extremo a extremo.
- Despliegue local embebido: gracias al runtime NeMo-Speech.cpp y a los pesos GGUF, puede ejecutarse en entornos nativos ligeros sin depender de Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 99,2 millones de parámetros y pesos safetensors, el modelo es muy compacto (el repositorio completo ocupa 0,7 GB), por lo que la huella de memoria es reducida en comparación con modelos de lenguaje.
- GPU recomendadas: no especificadas en la información disponible; el modelo se ejecuta mediante NeMo (PyTorch) y mediante el runtime nativo NeMo-Speech.cpp.
- Compatibilidad con GPU de consumo: no confirmada explícitamente, pero el reducido número de parámetros y el tamaño del repositorio sugieren que puede ejecutarse en hardware de consumo; no se dispone de datos oficiales al respecto.
- Opciones de despliegue: NVIDIA NeMo Speech (`nemo-toolkit[asr]`), NeMo-Speech.cpp (runtime nativo en C++), pesos GGUF para despliegue ligero.
- Latencia: buffer de entrada desde 80 ms; mínimo recomendado de 0,32 s; configuración offline de 30,4 s de buffer.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / buffer | Hablantes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron 3 Diarization | 99,2 M | 80 ms a 30,4 s (configurable); duración ilimitada por chunks | Hasta 8 | openmdw-1.1 | Hugging Face, NeMo, NeMo-Speech.cpp |
| Alternativas de diarización | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Límite de ocho hablantes simultáneos; no se especifica el comportamiento con más hablantes.
- No se han publicado datos de sesgos ni de robustez ante acentos, ruido o solapamientos de voz en la información disponible.
- Riesgo de alucinación no aplicable en el sentido de generación de texto, pero sí existe riesgo de asignación errónea de hablantes, especialmente en condiciones de audio adversas o con voces similares.
- No se especifican los idiomas soportados ni la cobertura lingüística; el rendimiento puede variar según el idioma y la calidad del audio.
- La licencia openmdw-1.1 permite uso comercial y no comercial según la model card, pero deben revisarse los términos completos de la licencia para producción.
- El modelo requiere audio a 16 kHz por defecto (sample rate configurable al usar arrays numpy).
- Los parámetros de streaming (chunk_len, right_context, fifo_len, spkcache_update_period) deben configurarse y validarse con `_check_streaming_parameters()` antes de la inferencia en streaming.
- No se dispone de datos de benchmarks que permitan estimar el rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infinix-io/Nemotron-3-Diarization
- Blog de NVIDIA sobre Nemotron Diarization: https://huggingface.co/blog/nvidia/nemotron-diarization
- Paper de investigación: https://arxiv.org/abs/2611.12246
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/nvidia/nemotron-diarization
- Repositorio NeMo-Speech.cpp: https://github.com/NVIDIA/NeMo-Speech.cpp
- Guía de diarización de NeMo-Speech.cpp: https://github.com/NVIDIA/NeMo-Speech.cpp/blob/main/docs/cli.md#diarize-audio
- NVIDIA NeMo Speech: https://github.com/NVIDIA-NeMo/Speech
- Referencias adicionales citadas en la model card: arXiv:2409.06656, arXiv:2507.18446, arXiv:2605.15442, arXiv:2507.09226, arXiv:2408.13106
