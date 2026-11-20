# pangzs/MeCo-Phi3-Mini-Stage-3

## Resumen

MeCo-Phi3-Mini-Stage-3 es el checkpoint final (etapa 3) del modelo MeCo, un video LLM orientado a la localización temporal de eventos en vídeo, presentado en el artículo "Measure Twice, Cut Once: A Semantic-Oriented Approach to Video Temporal Localization with Video LLMs" (ICLR 2026). Lo desarrolla el autor identificado como pangzs en Hugging Face, sobre el backbone de lenguaje Phi-3-Mini-4K-Instruct, y se inicializa a partir del checkpoint intermedio PolyU-ChenLab/ETChat-Phi3-Mini-Stage-2.

El modelo resuelve la tarea de *temporal grounding* en vídeo: dado un vídeo y una consulta en lenguaje natural, localizar los instantes o intervalos relevantes. Para ello combina un agregador visual, un proyector y el LLM ajustado con LoRA sobre el conjunto ET-Instruct-164K, incorporando las anotaciones de *structural-token* y *query-focused captioning* propias de MeCo.

Es relevante porque aborda un problema clásico de los video LLM (la imprecisión al delimitar fronteras temporales) con un enfoque semántico estructurado, y lo hace sobre un modelo compacto de aproximadamente 5.000 millones de parámetros, lo que facilita su despliegue en infraestructura moderada. El checkpoint se publica en formato transformers con safetensors y código personalizado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Video LLM: agregador visual + proyector + LLM Phi-3-Mini-4K-Instruct (transformer decoder) |
| Parámetros totales | 5.020.945.408 (≈5,02 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4K tokens en el backbone Phi-3-Mini (contexto de vídeo no especificado) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers, código personalizado) |

## Arquitectura y entrenamiento

MeCo sigue un diseño típico de video LLM: un codificador/agregador visual que resume la información de los fotogramas, un proyector que la alinea con el espacio de embeddings del LLM y un backbone de lenguaje Phi-3-Mini-4K-Instruct. Este checkpoint corresponde a la etapa 3 del entrenamiento, centrada en localización temporal: se entrenan el agregador, el proyector y el LLM mediante LoRA sobre el conjunto ET-Instruct-164K, enriquecido con las anotaciones de *structural-token* y *query-focused captioning* que define el método MeCo.

La innovación principal del trabajo es el enfoque semántico orientado a la localización temporal: en lugar de predecir directamente marcas de tiempo, el modelo usa representaciones estructuradas (tokens estructurales) y descripciones enfocadas a la consulta para razonar sobre los límites del evento antes de emitir la localización. No se dispone de información sobre el número total de tokens de entrenamiento, la composición completa del dataset ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Localización temporal de eventos en vídeo (*temporal grounding*) a partir de consultas en lenguaje natural.
- Generación de texto condicionada a vídeo (pipeline `video-text-to-text`).
- Razonamiento semántico sobre intervalos temporales mediante tokens estructurales y captioning enfocado a la consulta.
- Comprensión de vídeo asistida por el backbone Phi-3-Mini-4K-Instruct.
- Soporte de *tool calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo *thinking*, visión de imágenes, audio: no disponible en la información proporcionada.

## Casos de uso

- Indexación y búsqueda semántica en archivos audiovisuales: dado un vídeo largo y una consulta textual, el modelo devuelve los intervalos relevantes, lo que permite construir un índice temporal para buscadores internos de vídeo.
- Resumen de eventos deportivos o retransmisiones: localizar los momentos clave (goles, jugadas, incidencias) para generar clips automáticos o resúmenes con marcas de tiempo.
- Moderación y revisión de contenido en vídeo: identificar tramos que cumplen un criterio descrito en lenguaje natural para su revisión humana posterior.
- Anotación asistida para datasets de vídeo: prelocalizar eventos antes de la revisión manual, reduciendo el coste de etiquetado en pipelines de datos.
- Análisis de vigilancia y grabaciones: localizar episodios descritos por el operador (por ejemplo, "una persona cruzando la zona restringida") dentro de grabaciones largas.
- Postproducción y edición: generar marcas temporales para cortes automáticos o para la sincronización de subtítulos y capítulos en herramientas de edición.
- Investigación en video LLM: servir como checkpoint de referencia para reproducir y comparar el método MeCo sobre ET-Instruct-164K.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 10 GB en FP16 para los 5,02 B de parámetros, más el coste del codificador visual y de los fotogramas de vídeo procesados; no se dispone de cifras oficiales.
- GPU recomendadas: A100 o H100 para lotes grandes y vídeos con muchos fotogramas; RTX 4090 (24 GB) para inferencia en FP16 con margen.
- GPU de consumo: cabe en GPUs de 24 GB en FP16; en GPUs de 8-16 GB requeriría cuantización, cuyos formatos no están documentados en la información disponible.
- Opciones de despliegue: transformers con código personalizado (requiere `trust_remote_code`); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MeCo-Phi3-Mini-Stage-3 | ≈5,02 B | 4K (backbone) | Localización temporal en vídeo | no disponible | Hugging Face (pangzs) |
| ETChat-Phi3-Mini-Stage-2 | no disponible | 4K (backbone Phi-3-Mini) | Chat sobre vídeo (etapa previa) | no disponible | Hugging Face (PolyU-ChenLab) |
| Phi-3-Mini-4K-Instruct | ≈3,8 B | 4K | Texto, instrucciones | MIT (modelo original de Microsoft) | Hugging Face (microsoft) |

La comparación con alternativas específicas de *temporal grounding* en vídeo no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está indicada en la model card ni en los metadatos; no se puede asumir uso comercial sin confirmación del autor.
- No se documentan los idiomas soportados; el backbone Phi-3-Mini está orientado principalmente al inglés, pero no hay confirmación para este checkpoint.
- El contexto del backbone es de 4K tokens, lo que limita la cantidad de fotogramas o la duración de vídeo procesable por pasada.
- Riesgo de alucinación en la localización de intervalos, especialmente en vídeos largos, escenas ambiguas o consultas poco específicas.
- Requiere `trust_remote_code` por el código personalizado del modelo, lo que implica revisar el código antes de ejecutarlo en producción.
- Es un checkpoint de investigación (etapa 3 de un pipeline de entrenamiento); no se documentan evaluaciones de robustez ni sesgos.
- No se dispone de información sobre sesgos conocidos, latencia en producción ni throughput medido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pangzs/MeCo-Phi3-Mini-Stage-3
- Modelo base (etapa 2): https://huggingface.co/PolyU-ChenLab/ETChat-Phi3-Mini-Stage-2
- Repositorio GitHub de MeCo: https://github.com/pangzss/MeCo
- Paper (arXiv): https://arxiv.org/abs/2503.09027
