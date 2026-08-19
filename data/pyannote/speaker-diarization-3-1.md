# pyannote/speaker-diarization-3.1

## Resumen

`pyannote/speaker-diarization-3.1` es un pipeline de diarización de hablantes desarrollado por el equipo de pyannote, especializado en el análisis de audio conversacional. Este modelo identifica quién habla y en qué intervalos de tiempo dentro de una grabación, devolviendo una anotación estructurada con las intervenciones de cada interlocutor. Se trata de una versión revisada del pipeline 3.0, con la diferencia principal de que elimina la dependencia de `onnxruntime` y ejecuta tanto la segmentación como la extracción de embeddings de hablante en PyTorch puro, lo que simplifica el despliegue y acelera la inferencia.

El pipeline ingiere audio mono muestreado a 16 kHz (con downmix automático de pistas estéreo o multicanal y resampleo si es necesario) y produce una instancia `Annotation` de la librería pyannote. Es un componente fundamental para tareas como transcripción de reuniones, subtitulado de vídeos o análisis de llamadas, y se distribuye bajo licencia MIT, aunque su acceso en Hugging Face está restringido y requiere aceptar condiciones de uso adicionales. La versión 3.1 se publicó en noviembre de 2023 y ha acumulado más de 9,8 millones de descargas, lo que refleja su adopción generalizada en la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de diarización basado en PyTorch (segmentación + embeddings de hablante) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (procesa audio continuo, sin ventana de contexto fija) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible (la diarización es independiente del idioma, pero no se especifica cobertura) |
| Licencia | MIT (con condiciones de acceso adicionales en Hugging Face) |
| Formato de pesos | PyTorch (archivos `.pt` o `.bin`, no se especifica safetensors) |

## Arquitectura y entrenamiento

El pipeline combina dos componentes principales: un modelo de segmentación de voz (`pyannote/segmentation-3.0`) que detecta actividad vocal y cambios de hablante, y un modelo de embeddings de hablante que genera representaciones vectoriales para agrupar segmentos por identidad. Ambos modelos se ejecutan en PyTorch puro en la versión 3.1, eliminando la capa de `onnxruntime` que causaba problemas de compatibilidad y rendimiento en la versión 3.0. El pipeline completo se encarga de orquestar estos componentes, aplicando agrupamiento espectral sobre los embeddings para asignar hablantes a los segmentos detectados.

Los detalles específicos del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no se documentan en la información disponible. Sin embargo, los artículos académicos asociados (arXiv:2111.14448 y arXiv:2012.01477) describen los fundamentos de los modelos de segmentación y embeddings utilizados, basados en arquitecturas neuronales recurrentes y convolucionales entrenadas con datos de audio anotados. El pipeline está diseñado para funcionar de manera totalmente automática, sin ajuste manual de hiperparámetros por dataset, lo que garantiza un comportamiento consistente en entornos variados.

## Capacidades

- Diarización de hablantes: identifica cuántos hablantes intervienen en una grabación y asigna cada segmento de audio a un hablante concreto, con marcas de inicio y fin.
- Detección de actividad de voz (VAD): distingue entre voz y silencio o ruido de fondo.
- Detección de cambios de hablante: marca los puntos exactos donde cambia el interlocutor.
- Detección de habla solapada: identifica cuando dos o más hablantes hablan simultáneamente.
- Control del número de hablantes: permite especificar el número exacto (`num_speakers`) o un rango (`min_speakers`, `max_speakers`) para mejorar la precisión en escenarios conocidos.
- Integración con pyannote.audio: se puede combinar con otras herramientas de la librería para análisis posterior, como transcripción automática (ASR) o extracción de características.
- Procesamiento en memoria: acepta waveforms pre-cargados en RAM para acelerar la inferencia en lotes.

## Casos de uso

- Transcripción de reuniones con atribución de hablante: el pipeline asigna cada intervención a un participante, lo que permite generar actas estructuradas donde se indica quién dijo qué. Es adecuado porque su salida `Annotation` se puede convertir fácilmente a formatos como RTTM o JSON para integrarse con motores de transcripción.
- Subtitulado de vídeos y podcasts: al conocer los intervalos de habla de cada persona, se pueden generar subtítulos con etiquetas de color o nombre por hablante, mejorando la accesibilidad del contenido audiovisual.
- Análisis de llamadas de atención al cliente: las empresas pueden procesar grabaciones de call centers para identificar patrones de conversación, medir tiempos de habla por agente y cliente, y detectar conflictos o solapamientos.
- Archivado y búsqueda de audio en medios: permite indexar grandes colecciones de grabaciones (entrevistas, noticiarios, debates) por hablante, facilitando búsquedas posteriores como "todas las intervenciones de X".
- Investigación en ciencias sociales y lingüística: los investigadores pueden analizar conversaciones naturales para estudiar turnos de habla, dominancia conversacional o estructuras de interacción, gracias a la precisión temporal del pipeline.
- Preparación de datos para ASR con atribución: al combinar diarización con reconocimiento automático del habla, se pueden generar transcripciones con etiquetas de hablante para entrenar modelos de ASR o para crear subtítulos en tiempo real en sistemas de videoconferencia.

## Benchmarks y rendimiento

El pipeline se ha evaluado en múltiples conjuntos de datos públicos con el error de diarización (DER) más exigente, sin collar de perdón y evaluando el habla solapada. Los resultados disponibles en la model card se muestran a continuación.

| Benchmark | DER (%) | FA (%) | Miss (%) | Conf (%) |
|---|---|---|---|---|
| AISHELL-4 | 12,2 | 3,8 | 4,4 | 4,0 |
| AliMeeting (canal 1) | no disponible | no disponible | no disponible | no disponible |

La tabla de la model card continúa con más conjuntos de datos, pero la información proporcionada solo incluye estos dos. No se han publicado comparaciones directas con otros sistemas de diarización en la información disponible, por lo que no es posible establecer una comparativa cuantitativa con alternativas como los pipelines de NVIDIA o los modelos comerciales.

## Requisitos de hardware

- No se especifican requisitos de VRAM exactos en la documentación disponible.
- El pipeline funciona por defecto en CPU, pero se recomienda GPU para acelerar la inferencia en grabaciones largas o procesamiento por lotes. Se puede mover a GPU con `pipeline.to(torch.device("cuda"))`.
- Al ser un modelo de audio relativamente ligero (comparado con LLMs), es probable que quepa en GPUs de consumo como una RTX 3060 o superior, pero no hay datos oficiales de consumo de memoria.
- Opciones de despliegue: se integra con la librería `pyannote.audio` y se puede usar desde Python. No se mencionan adaptadores específicos para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia depende de la duración del audio y del hardware. No hay cifras oficiales de throughput en la información disponible.

## Comparativa con modelos similares

No se dispone de información comparativa con otros sistemas de diarización de hablantes en la documentación proporcionada. Existen alternativas como los pipelines de NVIDIA (NeMo) o los servicios comerciales de diarización, pero no se han publicado datos de rendimiento comparables en la model card. Por tanto, esta sección se limita a indicar que no hay datos disponibles.

## Limitaciones y advertencias

- Acceso restringido en Hugging Face: aunque la licencia es MIT, el modelo requiere aceptar condiciones de uso adicionales y disponer de un token de acceso. Esto puede dificultar su integración en entornos automatizados.
- Dependencia de pyannote.audio: es necesario instalar la versión 3.1 o superior de la librería, lo que puede generar conflictos de dependencias en proyectos existentes.
- El pipeline no realiza reconocimiento del habla (ASR); solo diarización. Para obtener transcripciones con texto es necesario combinarlo con un modelo ASR externo.
- La precisión puede degradarse en grabaciones con mucho ruido de fondo, reverberación o acentos muy marcados, aunque no se documentan casos específicos.
- No se especifican limitaciones de idioma, pero los modelos de segmentación y embeddings pueden estar sesgados hacia los idiomas y acentos presentes en sus datos de entrenamiento.
- El uso en producción puede requerir la consideración de los servicios comerciales de pyannoteAI, que ofrecen opciones premium y más rápidas, según se menciona en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pyannote/speaker-diarization-3.1
- Modelo de segmentación asociado: https://huggingface.co/pyannote/segmentation-3.0
- Sitio web de pyannoteAI: https://www.pyannote.ai
- Repositorio de pyannote-audio: https://github.com/pyannote/pyannote-audio
- Artículo sobre segmentación: https://arxiv.org/abs/2111.14448
- Artículo sobre embeddings de hablante: https://arxiv.org/abs/2012.01477
