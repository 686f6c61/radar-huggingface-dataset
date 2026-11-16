# davitlive5/Lapillus-v1

## Resumen

Lapillus-v1 es un modelo de reconocimiento automático del habla (ASR) especializado en armenio oriental, desarrollado por David Ghazaryan. Se trata de un fine-tuning del modelo `nvidia/stt_hy_fastconformer_hybrid_large_pc` de NVIDIA, una arquitectura FastConformer con decodificación híbrida RNN-T + CTC y 115 millones de parámetros. El modelo parte de una base ya entrenada en armenio y la especializa sobre un corpus privado de habla armenia oriental, incorporando puntuación y mayúsculas en la salida.

La relevancia del modelo reside en su nicho: el armenio es un idioma con recursos limitados en el ecosistema ASR, y las mejoras reportadas sobre la base de NVIDIA son consistentes en todos los subconjuntos de evaluación (entre 0,2 y 3,5 puntos de WER según el dominio). El modelo se distribuye bajo licencia CC-BY-4.0, lo que facilita su uso comercial con atribución, y se integra en el ecosistema NeMo, lo que simplifica su despliegue en pipelines existentes.

Con un tamaño de repositorio de 0,5 GB y 115M de parámetros, Lapillus-v1 está pensado para transcripción de audio de 16 kHz en mono, con segmentación manual para audios superiores a unos 30 segundos. No es un modelo multimodal ni un LLM: es un sistema ASR puro orientado a producción en un idioma concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer híbrido (RNN-T + CTC) |
| Parametros totales | 115M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio recomendado: segmentos de hasta ~30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | armenio (hy), variante oriental |
| Licencia | CC-BY-4.0 |
| Formato de pesos | NeMo (.nemo); repo de 0,5 GB |

## Arquitectura y entrenamiento

Lapillus-v1 emplea la arquitectura FastConformer en configuración híbrida, combinando un decodificador RNN-T y un decodificador CTC sobre el mismo encoder. Esta configuración permite alternar entre decodificación conjunta (mayor precisión) y CTC puro (mayor velocidad) mediante `change_decoding_strategy(decoder_type="ctc")`. El modelo base de NVIDIA ya estaba entrenado para armenio; el fine-tuning se realizó durante 8 épocas sobre un dataset privado de habla armenia oriental con aumentación de ruido, códec y velocidad. El checkpoint final es el promedio de los 5 mejores checkpoints del entrenamiento.

No se especifican en la información disponible el número de horas de audio, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no procede en ASR). La innovación principal es la especialización sobre la base de NVIDIA con aumentación agresiva y promediado de checkpoints, que se traduce en mejoras medibles en dominios difíciles como diálogo de películas o poemas.

## Capacidades

- Transcripción de voz a texto en armenio oriental con puntuación y mayúsculas.
- Decodificación híbrida: RNN-T (por defecto) o CTC (más rápida) sobre el mismo modelo.
- Entrada de audio a 16 kHz en mono.
- Manejo de audio con ruido, variaciones de códec y cambios de velocidad gracias a la aumentación durante el entrenamiento.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un LLM).
- No soporta visión, audio multimodal ni otras modalidades distintas de ASR.
- No soporta otros idiomas distintos del armenio oriental (el armenio occidental presenta más errores).

## Casos de uso

- Transcripción de reuniones y entrevistas en armenio oriental: el modelo genera texto con puntuación y mayúsculas directamente, lo que reduce el post-procesado. Adecuado para audios segmentados en trozos de hasta 30 segundos.
- Subtitulado de contenido audiovisual armenio: aunque el WER sube en diálogo de películas (33,05 en el subconjunto Movies), sigue siendo mejor que la base de NVIDIA (37,42), por lo que es útil para subtitulado asistido con revisión humana.
- Archivado y búsqueda de audio histórico: la transcripción permite indexar grabaciones y habilitar búsqueda por texto en archivos de audio en armenio.
- Atención al cliente y call centers: transcripción de llamadas para análisis de calidad, extracción de intenciones y generación de resúmenes posteriores mediante un LLM separado.
- Investigación lingüística y corpus: generación de transcripciones para estudios de fonética, morfología o análisis de discurso en armenio oriental.
- Accesibilidad: subtitulado automático para personas con discapacidad auditiva en contenido en armenio, con revisión posterior dado el WER reportado.
- Integración en pipelines de ASR existentes sobre NeMo: sustitución directa del modelo base de NVIDIA para obtener mejoras de precisión sin cambiar la infraestructura.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ArmBench-ASR, evaluados por Metric AI. WER y CER normalizados (%), menor es mejor.

| Dataset | WER base NVIDIA | WER Lapillus-v1 | CER base NVIDIA | CER Lapillus-v1 |
|---|---|---|---|---|
| Combined | 10,23 | 9,03 | 3,06 | 2,76 |
| MCV26 | 5,22 | 5,02 | 1,17 | 1,11 |
| FLEURS | 7,29 | 6,46 | 2,33 | 1,93 |
| Poems | 11,68 | 10,09 | 3,22 | 3,02 |
| Movies | 37,42 | 33,05 | 18,54 | 17,32 |
| Infocom May 2026 | 9,22 | 6,92 | 2,50 | 1,88 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 115M de parámetros, la inferencia cabe holgadamente en GPUs de consumo (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente para inferencia en FP16.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: NeMo Toolkit (`nemo_toolkit[asr]`), con soporte de decodificación RNN-T o CTC. No se indica soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (Combined) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lapillus-v1 | 115M | segmentos ~30 s | 9,03 | CC-BY-4.0 | Hugging Face (NeMo) |
| nvidia/stt_hy_fastconformer_hybrid_large_pc | 115M | segmentos ~30 s | 10,23 | CC-BY-4.0 | Hugging Face (NeMo) |
| Alternativas ASR armenio | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada en la información disponible es con el modelo base de NVIDIA, sobre el que Lapillus-v1 mejora en todos los subconjuntos evaluados. No se dispone de datos de otros modelos ASR para armenio en la información proporcionada.

## Limitaciones y advertencias

- Solo armenio oriental: el rendimiento en armenio occidental es peor según el propio autor.
- La precisión cae en diálogo de películas, ruido de fondo intenso, nombres poco frecuentes y terminología especializada (WER de 33,05 en Movies).
- Riesgo de errores en nombres propios y términos técnicos; se recomienda revisión humana en dominios críticos.
- El audio debe segmentarse en trozos de hasta ~30 segundos; no gestiona audios largos de forma nativa.
- Los benchmarks están declarados por el autor y marcados como no verificados (`verified: false`); no han sido validados de forma independiente.
- Licencia CC-BY-4.0: permite uso comercial con atribución; hay que conservar la atribución a David Ghazaryan y a NVIDIA como modelo base.
- No se especifican sesgos demográficos ni de acento; el dataset de entrenamiento es privado y no se detalla su composición.
- No apto para tareas de razonamiento, generación libre de texto ni tool calling: es exclusivamente un modelo ASR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davitlive5/Lapillus-v1
- Modelo base: https://huggingface.co/nvidia/stt_hy_fastconformer_hybrid_large_pc
- NeMo Toolkit (documentación): https://github.com/NVIDIA/NeMo
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repos o demos.
