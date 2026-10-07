# qualcomm/Pyannote-Speaker-Diarization

## Resumen

Pyannote-Speaker-Diarization (qualcomm/Pyannote-Speaker-Diarization) es una compilación del modelo de diarización de hablantes de pyannote-audio, optimizada y empaquetada por Qualcomm para ejecutarse en dispositivos con sus SoC. El modelo resuelve el problema de "quién habló y cuándo" en una grabación de audio: detecta actividad de voz por fotograma y genera embeddings de identidad de hablante, lo que permite atribuir cada segmento a un interlocutor concreto en reuniones, entrevistas y conversaciones multiparte. No es un modelo generativo ni un sistema de reconocimiento automático del habla: no transcribe, solo segmenta y agrupa por hablante.

La relevancia de este repositorio es que no distribuye un checkpoint entrenado desde cero, sino artefactos ya exportados y compilados para QAIRT 2.50 con el runtime VOICE_AI de Qualcomm, listos para desplegar en NPU en más de diez plataformas distintas: desde móviles (Snapdragon 8 Gen 1, 8 Gen 3, 8 Elite, 8 Elite Gen 5) hasta portátiles (Snapdragon X Elite, X2 Elite), pasando por plataformas automotrices (SA8295P, SA7255P), industriales (IQ-9075, IQ-8275, QCS8550) y de infraestructura de red (SA8775P). Esto lo sitúa como una pieza de inferencia en el borde (edge) para pipelines de audio en tiempo real.

El modelo se apoya en la implementación de referencia de pyannote-audio en GitHub y conserva la licencia MIT. La model card no publica el número de parámetros, la longitud de contexto ni la composición del dataset de entrenamiento, por lo que varios apartados de esta ficha quedan marcados como no disponibles. En el momento de la consulta el repositorio registra 0 descargas y 0 likes, lo que sugiere una publicación reciente o de uso interno para el ecosistema de Qualcomm AI Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en la implementacion de pyannote-audio; red de segmentacion por fotogramas con embeddings de hablante) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (procesa audio por ventanas, no texto) |
| Tipos de cuantizacion | exportacion en precision mixed_with_float para el runtime VOICE_AI; no se documentan otros esquemas (INT8, INT4, GGUF, AWQ) |
| Idiomas soportados | no disponible (la tarea de diarizacion es independiente del idioma, pero no se declara soporte explicito) |
| Licencia | MIT |
| Formato de pesos | artefactos compilados para QAIRT 2.50 distribuidos en .zip por chipset; pesos de origen en PyTorch (formato concreto no especificado) |
| Tarea | audio-classification (diarizacion de hablantes: deteccion de actividad de voz y codificacion de identidad) |
| Runtime | VOICE_AI |
| SDK | QAIRT 2.50 |
| Tamano de entrada | no disponible |
| Fecha de publicacion | 2026-10-07 |

## Arquitectura y entrenamiento

La model card indica que esta version se basa en la implementacion de Pyannote-Speaker-Diarization disponible en el repositorio pyannote/pyannote-audio. La arquitectura concreta, el numero de parametros y la configuracion de capas no se detallan en la informacion proporcionada. Las etiquetas del repositorio incluyen la referencia arXiv:1911.01255, que corresponde al paper asociado a la implementacion de pyannote citada por el autor.

El modelo produce dos salidas complementarias: actividad de hablante por fotograma (deteccion de voz) y una representacion de identidad de hablante que permite agrupar segmentos de la misma persona. Esta combinacion es la que habilita la atribucion multiparte sin necesidad de voces preregistradas.

No hay informacion en la model card sobre el volumen de datos de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO. El material publicado se centra exclusivamente en el proceso de exportacion, compilacion y despliegue: pesos pre-exportados para distintos chipsets y una via alternativa de exportacion personalizada mediante la libreria ai-hub-models (pesos ajustados, formas de entrada propias y configuraciones de dispositivo y runtime a medida). Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o mecanismos de atencion alternativos.

## Capacidades

- Diarizacion de hablantes: identifica "quien hablo cuando" en grabaciones con multiples interlocutores.
- Deteccion de actividad de voz por fotograma, con marca temporal de los turnos de palabra.
- Codificacion de identidad de hablante, que permite agrupar segmentos pertenecientes a la misma persona a lo largo de una conversacion.
- Aplicable a reuniones, entrevistas y conversaciones multiparte en general, segun la descripcion del autor.
- No realiza reconocimiento automatico del habla: no genera transcripciones, solo segmentacion y atribucion.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte para agentes ni razonamiento multi-paso.
- No se documenta soporte multilingue explicito (la tarea es intrinsecamente independiente del idioma, pero no hay declaracion del autor al respecto).
- No se documentan capacidades de vision, audio generativo, ni modos de razonamiento extendido.

## Casos de uso

- Actas de reunion en movil: la diarizacion se ejecuta en la NPU del Snapdragon y permite etiquetar cada intervencion antes de enviar el audio a un servicio de transcripcion en la nube, reduciendo el ancho de banda necesario al no tener que subir el audio completo.
- Subtitulado en directo con atribucion: en una aplicacion de accesibilidad, el modelo segmenta los turnos de palabra en tiempo real y el texto transcrito por un motor ASR se etiqueta con el hablante correspondiente.
- Analisis de llamadas en centros de contacto: sobre plataformas como SA8775P o QCS8550, permite separar las intervenciones del agente y del cliente para calcular tiempos de habla, solapamientos e interrupciones.
- Grabadoras y dispositivos de captura de voz: en un dispositivo con Snapdragon 8 Gen 3 o 8 Gen 1, la diarizacion se ejecuta de forma local y permite indexar notas de voz por interlocutor sin salida de datos del dispositivo.
- Cabina de automocion: en las plataformas SA8295P y SA7255P, el modelo puede distinguir al conductor del acompanante para dirigir respuestas de un asistente de voz solo al hablante relevante.
- Reuniones en portatil: sobre Snapdragon X Elite o X2 Elite, se integra en aplicaciones de videoconferencia para anotar participantes y generar resumenes por persona en el propio equipo.
- Audio industrial y de vigilancia: en los modulos IQ-9075 e IQ-8275, permite procesar streams de audio en el borde para detectar y clasificar conversaciones sin depender de conectividad cloud.
- Investigacion cualitativa y periodismo: sobre entrevistas largas, genera una primera segmentacion por hablante que acelera la fase de transcripcion y analisis manual.
- Pipelines de post-produccion de audio: la salida por fotogramas y los embeddings de hablante se pueden usar para separar pistas o etiquetar material de archivo antes de un procesado posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de una seccion de resumen de rendimiento y enlaza a la pagina de Qualcomm AI Hub del modelo para consultar metricas por dispositivo, pero no incluye cifras concretas en el repositorio de HuggingFace.

## Requisitos de hardware

- El modelo no esta pensado para GPU de escritorio: los artefactos distribuidos son binarios compilados para el runtime VOICE_AI de Qualcomm sobre QAIRT 2.50, y se ejecutan en la NPU/Hexagon del SoC de destino.
- Chipsets con artefactos pre-exportados: Snapdragon 8 Elite Gen 5 For Galaxy, Snapdragon 8 Elite For Galaxy, Snapdragon X2 Elite, Snapdragon X Elite, Snapdragon 8 Gen 3, Snapdragon 8 Gen 1, Qualcomm Dragonwing IQ-8275, Dragonwing QCS8550 (proxy), Dragonwing IQ-9075, SA8775P, SA7255P y SA8295P.
- VRAM estimada: no disponible, ya que no se publican los parametros totales del modelo ni su huella de memoria.
- GPU de consumo (RTX 4090 y similares): no aplica a esta distribucion. La implementacion upstream de pyannote-audio si puede ejecutarse en CPU o GPU con PyTorch, pero este repositorio no documenta una ruta CUDA.
- Opciones de despliegue: descarga directa de los .zip pre-exportados por chipset, o exportacion personalizada mediante la libreria Qualcomm AI Hub Models (pesos ajustados, formas de entrada propias y configuracion de dispositivo/runtime).
- Herramientas asociadas: Qualcomm AI Hub Workbench para compilar, perfilar y evaluar el modelo en dispositivos alojados.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| qualcomm/Pyannote-Speaker-Diarization | Diarizacion de hablantes, exportado para NPU Qualcomm | no disponible | audio por ventanas, no disponible | MIT | Artefactos por chipset en HuggingFace y Qualcomm AI Hub | Optimizado para QAIRT 2.50 y runtime VOICE_AI |
| pyannote/speaker-diarization-3.1 (upstream) | Pipeline de diarizacion sobre PyTorch | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | HuggingFace | Referencia de partida de esta version; requiere acceso y ejecucion en CPU/GPU |
| pyannote/segmentation-3.0 (upstream) | Modelo de segmentacion de hablante | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | HuggingFace | Componente de segmentacion del pipeline de diarizacion |
| NVIDIA NeMo MSDD | Diarizacion multi-escala sobre NeMo | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | NGC / GitHub | Alternativa orientada a despliegue en GPU NVIDIA |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada. La diferencia principal y verificable es el objetivo de despliegue: la version de Qualcomm esta empaquetada para inferencia en NPU de dispositivos moviles, automotrices e industriales, mientras que las alternativas se distribuyen como pesos PyTorch para ejecucion en CPU o GPU.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero cualquier sistema de diarizacion puede degradarse con acentos poco representados, ruido de fondo, solapamiento de voces o audio telefónico de banda estrecha.
- Riesgo de asignacion incorrecta de hablante en conversaciones con voces muy similares, cambios de tono marcados o segmentos de voz muy cortos. No hay metricas de DER (Diarization Error Rate) publicadas en la informacion disponible.
- La diarizacion no implica transcripcion: para obtener texto es necesario encadenar un motor ASR independiente.
- No se declaran idiomas soportados ni limites de duracion de audio; la ventana de contexto en terminos de texto no aplica a este modelo.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones de los pesos de origen de pyannote-audio si se redistribuyen artefactos derivados.
- El uso esta fuertemente acoplado al hardware: los binarios pre-exportados solo funcionan en los chipsets y versiones de SDK listados (QAIRT 2.50). Cambiar de SoC o de version de SDK exige reexportar el modelo.
- Consideraciones legales y de privacidad: la diarizacion de conversaciones puede constituir tratamiento de datos biométricos o de voz en determinadas jurisdicciones; hay que revisar el cumplimiento del RGPD antes de usarla en produccion.
- El repositorio registra 0 descargas y 0 likes, y la fecha de publicacion es muy reciente, por lo que no hay evidencia de uso en produccion ni validacion independiente.
- No se documenta soporte de tool calling, agentes ni integracion con frameworks de orquestacion, por lo que no es sustituible por un LLM en flujos conversacionales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/qualcomm/Pyannote-Speaker-Diarization
- Pagina del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/pyannote_speaker_diarization
- Implementacion en Qualcomm AI Hub Models (v0.64.0): https://github.com/qualcomm/ai-hub-models/blob/v0.64.0/src/qai_hub_models/models/pyannote_speaker_diarization
- Libreria Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Implementacion de referencia de pyannote-audio: https://github.com/pyannote/pyannote-audio
- Paper asociado en las etiquetas del modelo: https://arxiv.org/abs/1911.01255
- Demo grafica del modelo: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/pyannote_speaker_diarization/web-assets/model_demo.png
