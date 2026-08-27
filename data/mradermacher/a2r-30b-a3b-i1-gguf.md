# mradermacher/A2R-30B-A3B-i1-GGUF

## Resumen

El modelo A2R-30B-A3B-i1-GGUF es una cuantización en formato GGUF del modelo base A2R-30B-A3B, desarrollado por PleasedPenguin y cuantizado por mradermacher. Según los metadatos, se trata de un modelo de lenguaje y audio (audio-language model) orientado a la atribución de hablante en conversaciones multiparte (speaker attribution, multi-party). El nombre sugiere una arquitectura de mezcla de expertos (MoE) con 30 000 millones de parámetros totales y 3 000 millones activos, aunque esta información no está confirmada en la documentación disponible.

La relevancia de este modelo radica en su especialización en tareas de audio y diálogo multi-interlocutor, un área emergente en la IA conversacional. Al estar publicado bajo licencia Apache-2.0, permite uso comercial y modificación. La versión GGUF facilita su ejecución en entornos locales con herramientas como llama.cpp u Ollama, aunque la documentación pública es muy limitada y no se han publicado detalles técnicos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre sugiere MoE, sin confirmar) |
| Parametros totales | 30 532 646 912 (30,5 B) |
| Parametros activos | No disponible (el nombre sugiere 3 B, sin confirmar) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q2_K (11,4 GB), archivo imatrix (0,2 GB); se mencionan otros quants estáticos en el repositorio hermano |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna, el proceso de entrenamiento, el dataset utilizado o las técnicas de alineación (RLHF, DPO, etc.) del modelo base A2R-30B-A3B. Los únicos datos disponibles son los metadatos de HuggingFace, que indican que se trata de un modelo de audio y lenguaje con capacidades de atribución de hablante en contextos multiparte. El nombre del modelo sugiere una arquitectura de mezcla de expertos (MoE) con 30 000 millones de parámetros totales y 3 000 millones activos, pero esta información no ha sido confirmada por el autor. La cuantización GGUF realizada por mradermacher emplea la técnica imatrix (importance matrix) para optimizar la calidad de los quants de baja precisión.

## Capacidades

- Procesamiento de audio y lenguaje: según los tags, el modelo integra modalidad de audio y texto, aunque no se especifican los formatos de audio soportados ni las tareas exactas.
- Atribución de hablante: diseñado para identificar quién habla en conversaciones con múltiples participantes, lo que implica comprensión de diálogos y diarización de hablantes.
- Conversación multiparte: capaz de manejar interacciones con varios interlocutores, probablemente con seguimiento de turnos y contexto.
- Generación de texto: al ser un modelo de lenguaje, puede generar respuestas textuales, aunque no se detallan sus capacidades de razonamiento, código o matemáticas.
- Multilingüismo: solo se declara soporte para inglés.

## Casos de uso

- Transcripción y diarización de reuniones: el modelo puede transcribir audio de reuniones y atribuir cada intervención al hablante correcto, facilitando actas y búsquedas por persona.
- Asistentes de voz para atención al cliente: integrado en sistemas de call center, puede identificar al cliente y al agente, y generar resúmenes o respuestas automáticas.
- Análisis de debates o entrevistas: útil para medios y periodistas que necesitan extraer citas textuales de cada participante en grabaciones.
- Subtitulado de contenido multimedia: puede generar subtítulos con etiquetas de hablante para vídeos o podcasts.
- Investigación en lingüística conversacional: permite analizar patrones de interacción y turnos de habla en corpus de audio.
- Sistemas de archivo y búsqueda de audio: indexar grabaciones por hablante y contenido, facilitando la recuperación de información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar, ni comparaciones con modelos similares.

## Requisitos de hardware

- El archivo GGUF i1-Q2_K ocupa 11,4 GB, por lo que se necesita al menos 12 GB de VRAM para cargarlo en GPU (por ejemplo, una RTX 3060 12 GB o superior). Para mayor calidad, se recomienda usar cuantizaciones más grandes (Q4_K_M, Q5_K_M, etc.) que requerirán entre 16 y 24 GB de VRAM.
- Dado el tamaño total de 30,5 B parámetros, incluso con MoE (si se confirma), la inferencia en CPU es posible con llama.cpp, pero será lenta. Se recomienda GPU para un uso interactivo.
- Herramientas de despliegue compatibles: llama.cpp, Ollama, LM Studio, kobold.cpp, entre otras que soporten GGUF.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (audio-language models con atribución de hablante). El modelo base no tiene documentación pública que permita establecer comparaciones con alternativas como Qwen2-Audio, SALMONN o modelos de diarización específicos. Por tanto, no se puede ofrecer una comparativa fiable.

## Limitaciones y advertencias

- La documentación pública es prácticamente inexistente: no hay model card del modelo base, ni papers, ni ejemplos de uso. Esto dificulta evaluar sus capacidades reales y sus limitaciones.
- Al ser una cuantización de baja precisión (i1-Q2_K), puede haber una pérdida significativa de calidad en la generación de texto y en la comprensión del audio en comparación con el modelo original en full precision.
- El modelo solo declara soporte para inglés; su rendimiento en otros idiomas es desconocido.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez. Al ser un modelo de audio, podría heredar sesgos de los datos de entrenamiento, pero no hay información al respecto.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base cumpla con los mismos términos (aunque el cuantizador indica que el base también es Apache-2.0).
- Para producción, se recomienda probar exhaustivamente el modelo en el dominio específico antes de desplegarlo, dado el desconocimiento de sus límites.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/A2R-30B-A3B-i1-GGUF
- Modelo base: https://huggingface.co/PleasedPenguin/A2R-30B-A3B
- Repositorio de quants estáticos: https://huggingface.co/mradermacher/A2R-30B-A3B-GGUF
- Página de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
