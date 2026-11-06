# manateelazycat/Nemotron-3-Diarization-AIPod-HF

## Resumen

Nemotron-3-Diarization-AIPod-HF es una distribución cuantizada en GGUF del modelo nvidia/Nemotron-3-Diarization, publicada por el usuario manateelazycat. Su propósito no es la generación de texto, sino la diarización de hablantes (speaker diarization): identificar quién habla y en qué intervalo de tiempo dentro de un audio. El repositorio está orientado a su despliegue en dispositivos NVIDIA Jetson (en concreto, una placa Thor en la red 192.168.1.104) dentro de un paquete de aplicación propio denominado AI Pod, con puerto de servicio 18036.

El modelo base cuenta con 99.260.363 parámetros (aproximadamente 99,3 millones) según los pesos en safetensors del repositorio, y se distribuye en formato GGUF con cuantización Q8_0 oficial. La model card describe una implementación nativa sobre NeMo-Speech.cpp con soporte CUDA, junto con un controlador que gestiona descarga, verificación, montaje de pesos en solo lectura y aislamiento por usuario.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue muy específico, con documentación mayoritariamente en chino y centrada en el proceso de empaquetado y aceptación en hardware concreto, más que en las capacidades intrínsecas del modelo. No se publican resultados de benchmarks ni detalles del entrenamiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de diarización de hablantes; implementación sobre NeMo-Speech.cpp) |
| Parámetros totales | 99.260.363 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | GGUF (repo de 1,2 GB; árbol principal de 760 MB) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base nvidia/Nemotron-3-Diarization en la documentación proporcionada. La model card del repositorio derivado se centra en la infraestructura de despliegue: implementación nativa sobre NeMo-Speech.cpp con CUDA, pesos Q8_0 oficiales y un paquete de modelo independiente (cloud.lazycat.aipod.nemotron3diar). El pipeline declarado en Hugging Face es voice-activity-detection, lo que sitúa la tarea en el ámbito del procesamiento de audio y la segmentación de habla.

Tampoco se detallan los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO), ni innovaciones técnicas del modelo en sí. La documentación sí describe elementos de ingeniería del despliegue: validación y reutilización exacta de pesos e imágenes, montaje de pesos en solo lectura, aislamiento de usuarios, operaciones de cancelación y reintento, y una política de producción sin descarga de pesos, sin instalación de dependencias en red y sin construcción de imágenes. Se mencionan diez rondas de perfilado y optimización de rendimiento realizadas en la placa Thor (192.168.1.104), con datos crudos en docs/evidence/ y un informe en docs/performance-report.md, aunque los resultados numéricos no se incluyen en la información disponible.

## Capacidades

- Diarización de hablantes: devuelve identificadores de hablante y tiempos de inicio y fin de cada intervención.
- Detección de actividad de voz (voice activity detection), según el pipeline declarado.
- Exposición mediante API HTTP con endpoints /ready, /v1/models, /v1/audio/diarizations y /metrics.
- Ejecución nativa sobre NeMo-Speech.cpp con aceleración CUDA.
- Despliegue empaquetado en LPK para dispositivos NVIDIA Jetson, con controlador de host para descarga, verificación y montaje de pesos.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes; el modelo no está orientado a esas tareas.

## Casos de uso

- Transcripción de reuniones con atribución de hablante: el endpoint /v1/audio/diarizations devuelve hablante y marcas temporales, lo que permite alinear después una transcripción ASR con cada interlocutor.
- Actas y resúmenes de entrevistas: al segmentar por hablante, un pipeline posterior puede separar preguntas y respuestas y generar resúmenes atribuidos.
- Subtitulado de contenido audiovisual: la salida con tiempos de inicio y fin facilita la generación de subtítulos con etiquetas de interlocutor.
- Análisis de llamadas de atención al cliente: la diarización permite medir tiempos de habla de agente y cliente y detectar solapamientos, útil para control de calidad.
- Investigación cualitativa: procesamiento de grabaciones de grupos focales o entrevistas semiestructuradas para separar participantes de forma automática.
- Despliegue en el borde con NVIDIA Jetson: el paquete AI Pod y los pesos Q8_0 permiten ejecutar la diarización en una placa Thor sin depender de servicios en la nube, con métricas expuestas en /metrics para monitorización.
- Integración en sistemas de videoconferencia autoalojados: el servicio en el puerto 18036 y los endpoints compatibles con el patrón /v1 permiten conectarlo a un orquestador interno de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona diez rondas de perfilado y optimización con datos en docs/evidence/ y un informe en docs/performance-report.md, pero las cifras concretas no se incluyen en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 99,3 millones de parámetros y cuantización Q8_0, el peso de los pesos ronda 1 GB, por lo que la huella de memoria es reducida, pero no se documentan cifras oficiales de VRAM.
- GPU recomendadas: el despliegue documentado se ha validado en una NVIDIA Jetson Thor (192.168.1.104). No se especifican otras GPU compatibles.
- GPU de consumo: no se confirma compatibilidad con GPU de consumo; el foco declarado es Jetson.
- Opciones de despliegue: paquete LPK propio (cloud.lazycat.aipod.nemotron3diar v0.1.0) con servicio en el puerto 18036; ejecución nativa sobre NeMo-Speech.cpp con CUDA. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; el informe de rendimiento referenciado no incluye cifras en el material disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos de diarización comparables (parámetros, contexto, rendimiento o licencia) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La documentación está mayoritariamente en chino y muy centrada en el proceso de empaquetado y aceptación en hardware concreto, no en las capacidades del modelo.
- El estado de validación es parcial: la fase en la placa Thor (192.168.1.104) se declara completada, pero el despliegue en 192.168.1.50 queda pendiente de notificación del usuario y no se declara operativo. La matriz de soporte oficial depende de la lista final aceptada.
- No se publican benchmarks, detalles de entrenamiento ni composición del dataset, lo que impide evaluar sesgos y calidad de forma independiente.
- No se documentan idiomas soportados; la diarización puede degradarse en condiciones de solapamiento de voces, ruido o códigos de cambio de idioma, aunque no se aportan datos concretos al respecto.
- Riesgo de alucinación no aplicable en el sentido de generación de texto, pero sí existe riesgo de asignación errónea de hablantes o de segmentación incorrecta en audios complejos; no se cuantifica.
- Licencia openmdw-1.1: deben revisarse sus términos antes de uso comercial; la información disponible no detalla las obligaciones concretas.
- El repositorio tiene un uso muy bajo (55 descargas, 0 likes) y un único contribuidor, por lo que no cuenta con validación comunitaria amplia.
- La política de producción descrita exige no descargar pesos ni instalar dependencias en red en tiempo de ejecución, lo que condiciona el diseño del despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/manateelazycat/Nemotron-3-Diarization-AIPod-HF
- Árbol de ficheros: https://huggingface.co/manateelazycat/Nemotron-3-Diarization-AIPod-HF/tree/main
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Documentación interna referenciada en la model card (no enlazada directamente en la información disponible): docs/model-host-protocol.md, docs/benchmark-contract.md, docs/performance-report.md, docs/operation-notes.md, docs/evidence/final-lpk-acceptance.json, docs/evidence/migration-state.json
- Paquete de despliegue referenciado: lpk/cloud.lazycat.aipod.nemotron3diar-v0.1.0.lpk y release-receipt.json (rutas relativas dentro del repositorio)
