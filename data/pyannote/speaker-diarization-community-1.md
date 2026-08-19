# pyannote/speaker-diarization-community-1

## Resumen

`pyannote/speaker-diarization-community-1` es un pipeline de diarización de hablantes desarrollado por el equipo de pyannote, un proyecto de investigación open source especializado en procesamiento de audio. Este modelo resuelve el problema de identificar "quién habla y cuándo" en grabaciones de audio, una tarea fundamental para transcripción de reuniones, análisis de llamadas, subtitulado y sistemas de voz. La versión `community-1` se presenta como una mejora significativa respecto al anterior `speaker-diarization-3.1`, con una reducción del error de diarización (DER) en la mayoría de los benchmarks académicos, una mejor asignación y conteo de hablantes, y una modalidad de diarización "exclusiva" que simplifica la reconciliación con timestamps de transcripción.

El pipeline acepta audio mono a 16 kHz (con downmix automático de estéreo o multicanal y resampleo) y devuelve intervalos de tiempo etiquetados por hablante. Está diseñado para funcionar tanto en local (offline) como a través de un servicio cloud opcional. La licencia es CC-BY-4.0, aunque el acceso está restringido mediante un formulario de aceptación de condiciones. No se han publicado detalles sobre la arquitectura interna, el número de parámetros ni el proceso de entrenamiento en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (pipeline de pyannote-audio que combina detección de actividad de voz, detección de cambio de hablante y agrupamiento) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa audio, no texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la model card no especifica idiomas) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | No disponible (se distribuye como pipeline de pyannote.audio, probablemente PyTorch) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del pipeline. Se sabe que `pyannote/speaker-diarization-community-1` es un pipeline de `pyannote-audio` que integra varios componentes típicos de diarización: detección de actividad de voz (VAD), detección de cambio de hablante (SCD) y agrupamiento de segmentos por hablante. El pipeline ingiere audio mono a 16 kHz y produce una secuencia de turnos con etiquetas de hablante. No se especifican los datos de entrenamiento, el número de tokens (no aplica), ni si se usaron técnicas como RLHF o DPO. Las innovaciones destacadas en la model card son: mejora en la asignación y conteo de hablantes, una modalidad de diarización "exclusiva" que evita solapamientos entre turnos para facilitar la integración con transcripciones, y la posibilidad de uso offline sin conexión a internet.

## Capacidades

- Diarización de hablantes: identifica intervalos de tiempo y asigna cada uno a un hablante distinto.
- Detección de actividad de voz: distingue segmentos con voz de silencio o ruido.
- Detección de cambio de hablante: marca los puntos donde cambia el interlocutor.
- Detección de habla solapada: el pipeline está diseñado para manejar casos donde varios hablantes se superponen (aunque no se detalla el método).
- Procesamiento de audio mono a 16 kHz, con downmix automático de estéreo o multicanal y resampleo.
- Diarización exclusiva: los turnos de hablante no se solapan, lo que simplifica la alineación con timestamps de transcripción automática.
- Uso offline: el pipeline puede ejecutarse completamente en local sin necesidad de conexión a internet.
- Integración con pyannote.audio: se puede cargar mediante `Pipeline.from_pretrained` y usar con un token de HuggingFace.

## Casos de uso

- Transcripción de reuniones: el pipeline asigna cada segmento de audio a un participante, permitiendo generar actas con atribución de hablante. Su mejora en el conteo de hablantes reduce errores en entornos con múltiples interlocutores.
- Análisis de centros de llamadas (CCaaS): en grabaciones de servicio al cliente, identifica turnos de agente y cliente, facilitando el análisis de calidad, detección de sentimiento y extracción de métricas de interacción.
- Asistentes de voz y agentes telefónicos: permite que un sistema distinga entre varios usuarios en una conversación, mejorando la personalización y el seguimiento del contexto.
- Subtitulado y doblaje de medios: en podcasts, vídeos o programas de TV, la diarización ayuda a generar subtítulos con etiquetas de hablante y a sincronizar doblajes.
- Herramientas de accesibilidad: para personas con discapacidad auditiva, la identificación de hablantes en tiempo real o en grabaciones mejora la comprensión de conversaciones grupales.
- Investigación académica en procesamiento de habla: sirve como baseline o componente en sistemas de análisis de conversaciones, estudios sociolingüísticos o evaluación de modelos de ASR.
- Formación y evaluación educativa: en entornos de aprendizaje, permite analizar interacciones en clase o en tutorías, identificando patrones de participación.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de tasas de error de diarización (DER, en %) en varios benchmarks académicos, comparando `legacy` (speaker-diarization-3.1), `community-1` y `precision-2`. Los resultados se obtuvieron con procesamiento totalmente automático, sin collar de perdón y sin omitir habla solapada.

| Benchmark | `legacy` (3.1) | `community-1` | `precision-2` |
|---|---|---|---|
| AISHELL-4 | 12.2 | 11.7 | 11.4 |
| AliMeeting (channel 1) | 24.5 | 20.3 | 15.2 |
| AMI (IHM) | 18.8 | 17.0 | 12.9 |
| AMI (SDM) | 22.7 | 19.9 | 15.6 |
| AVA-AVD | 49.7 | 44.6 | 37.1 |
| CALLHOME (part 2) | 28.5 | 26.7 | 16.6 |
| DIHARD 3 (full) | 21.4 | 20.2 | 14.7 |
| Ego4D (dev.) | 51.2 | 46.8 | 39.0 |
| MSDWild | 25.4 | 22.8 | 17.3 |
| RAMC | 22.2 | 20.8 | 10.5 |
| REPERE (phase2) | 7.9 | 8.9 | 7.4 |
| VoxConverse (v0.3) | 11.2 | 11.2 | 8.5 |

`community-1` supera a `legacy` en todos los benchmarks excepto en REPERE, donde es ligeramente peor (8.9 vs 7.9). El modelo `precision-2` (accesible vía API de pago) obtiene mejores resultados en la mayoría de los casos.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada.
- GPU recomendadas: no disponible. El pipeline se ejecuta con PyTorch, por lo que puede funcionar en CPU, aunque una GPU acelera el procesamiento. No se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no se indica, pero al ser un pipeline de audio, es probable que funcione en GPUs con al menos 4-8 GB de VRAM, aunque no hay confirmación.
- Opciones de despliegue: se puede ejecutar localmente con `pyannote.audio` (Python) o mediante el servicio cloud opcional `pyannote/speaker-diarization-community-1-cloud`. También es posible integrarlo en aplicaciones propias usando el pipeline como componente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa se basa en los datos de la model card, que incluye dos alternativas del mismo ecosistema: `speaker-diarization-3.1` (legacy) y `precision-2` (accesible vía API de pago). No se dispone de información sobre otros modelos de diarización externos.

| Modelo | Tipo | Licencia | DER medio (aprox.) | Acceso |
|---|---|---|---|---|
| `speaker-diarization-3.1` | Pipeline pyannote | CC-BY-4.0 (gated) | ~24.6 (media de benchmarks) | Gratuito con registro |
| `speaker-diarization-community-1` | Pipeline pyannote | CC-BY-4.0 (gated) | ~22.6 (media de benchmarks) | Gratuito con registro |
| `precision-2` | Pipeline pyannote (cloud) | Comercial (API) | ~17.1 (media de benchmarks) | De pago, requiere API key |

`community-1` ofrece una mejora media de ~2 puntos de DER respecto a `legacy`, mientras que `precision-2` es significativamente mejor pero requiere un servicio de pago. No se han publicado comparaciones con modelos de otros proveedores (p. ej., NVIDIA NeMo, SpeechBrain) en la información disponible.

## Limitaciones y advertencias

- Acceso restringido: aunque la licencia es CC-BY-4.0, el uso requiere aceptar condiciones adicionales y proporcionar datos personales (empresa, caso de uso) a través de un formulario gated en HuggingFace.
- Sin detalles de arquitectura: no se publican parámetros, arquitectura ni datos de entrenamiento, lo que dificulta la reproducibilidad y la evaluación independiente.
- Rendimiento dependiente del dominio: los benchmarks muestran variabilidad según el tipo de audio (reuniones, llamadas, vídeos egocéntricos). En entornos con mucho ruido, solapamiento extremo o acentos no representados, el error puede ser mayor.
- Diarización exclusiva: la modalidad "exclusiva" evita solapamientos entre turnos, lo que puede no reflejar la realidad en conversaciones con habla simultánea; esto puede afectar a aplicaciones que requieran precisión temporal en solapamientos.
- Sin soporte multilingüe declarado: la model card no especifica idiomas, por lo que el rendimiento en idiomas distintos del inglés (u otros mayoritarios) no está garantizado.
- Requisito de token de HuggingFace: es necesario crear un token de acceso y tener una cuenta para descargar el pipeline.
- Sin garantías de producción: no se indican SLA, soporte ni mantenimiento; el modelo se ofrece "tal cual" para la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pyannote/speaker-diarization-community-1
- Blog de anuncio de Community-1: https://www.pyannote.ai/blog/community-1
- Blog de Precision-2 (modelo comparado): https://www.pyannote.ai/blog/precision-2
- Referencias de benchmarks (en los tags del modelo):
  - AISHELL-4: https://arxiv.org/abs/2104.03603
  - AVA-AVD: https://arxiv.org/abs/2111.14448
  - DIHARD 3: https://arxiv.org/abs/2012.01477
  - Ego4D: https://arxiv.org/abs/2110.07058
- Documentación de pyannote.audio: https://github.com/pyannote/pyannote-audio
