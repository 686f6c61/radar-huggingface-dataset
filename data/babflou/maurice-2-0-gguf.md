# Babflou/maurice-2.0-gguf

## Resumen

Maurice 2.0 es un modelo derivado por ajuste fino (LoRA fusionada) de Qwen 3.5 2B, desarrollado por el usuario Babflou para la aplicación de notas Dodo en iPhone. Su función es acotada y concreta: transformar una dictación de voz en una nota corta y decidir en qué carpeta archivarla mediante una clasificación binaria sí/no por carpeta. Está distribuido únicamente en formato GGUF cuantizado para su ejecución en dispositivo mediante llama.cpp y llama.rn.

El modelo conserva la arquitectura del Qwen 3.5 2B original, con 1.881.825.088 parámetros totales, y se publica bajo licencia Apache 2.0. Los idiomas declarados son francés, inglés y japonés. La variante más reciente, denominada "demandes parlées" (pase 8), amplía las capacidades hacia la comprensión de peticiones habladas: añadir o quitar elementos de una lista, crear recordatorios, mover o corregir notas, además de mantener las tareas de generación de notas y clasificación.

Su relevancia radica en el despliegue en dispositivo (on-device): el archivo IQ4_XS ocupa aproximadamente 968 MB, lo que permite inferencia local en un teléfono sin conexión a servicios externos. El autor reporta métricas internas de la pase 8 sobre un examen propio de 120 frases (98,3 %), rechazo de 135/135 mensajes de detección de crisis y 59/60 preguntas de salud, con un descenso de 1,2 a 2,6 puntos en la tarea de clasificación en carpetas respecto a Maurice 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.5 2B, ajuste fino con LoRA fusionada) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS (embeddings q3_K) |
| Idiomas soportados | fr, en, ja |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen 3.5 2B, un transformer denso de aproximadamente 1.880 millones de parámetros, sobre el que se aplicó un ajuste fino supervisado con LoRA que posteriormente se fusionó en los pesos base. El entrenamiento se realizó sobre datos propios de notas, clasificación en carpetas y peticiones habladas, según indica el autor. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación principal no reside en la arquitectura, sino en la especialización y el formato de despliegue: cuantización IQ4_XS con embeddings en q3_K mediante llama.cpp, orientada a inferencia en dispositivo. El autor documenta una lectura recomendada con temperatura 0 y `enable_thinking: false`, y para la tarea de clasificación propone un único token de salida con probabilidad P(sí) = sí / (sí + no). Se han publicado varias pasadas (pase 2, pase 7 y pase 8), con la pase 7 conservada como versión de repli.

## Capacidades

- Generación de notas cortas a partir de dictado de voz.
- Clasificación binaria sí/no por carpeta para el archivado automático de notas.
- Comprensión de peticiones habladas: añadir o quitar elementos de una lista, crear recordatorios, mover y corregir notas.
- Solicitud de aclaración cuando falta un nombre en la petición (introducido en la pase 8).
- Seguimiento de instrucciones de idioma, como "answer in English".
- Respuesta sobre el contenido de la conversación sin inventar información.
- Rechazo de mensajes de detección de crisis y de preguntas de salud.
- Soporte multilingüe en francés, inglés y japonés.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio de forma nativa.

## Casos de uso

- Aplicación de notas por voz en iPhone: el modelo recibe la transcripción de una dictación y la convierte en una nota breve, adecuado por su tamaño reducido y su ejecución local mediante llama.rn.
- Archivado automático de notas: clasifica la nota en cada carpeta existente con una decisión binaria y un único token de salida, lo que permite integrarlo en la interfaz sin latencia de red.
- Gestión de listas por voz: interpreta peticiones como añadir o quitar elementos de una lista y las traduce en operaciones sobre el estado de la aplicación.
- Creación de recordatorios hablados: extrae la intención de recordatorio de una petición dictada y solicita el nombre o dato faltante cuando es necesario.
- Corrección y movimiento de notas: permite reorganizar el contenido existente mediante instrucciones habladas, manteniendo la coherencia con la conversación previa.
- Asistente multilingüe en dispositivo: atiende dictados en francés, inglés y japonés y respeta consignas de idioma de respuesta, útil para usuarios que alternan idiomas.
- Filtro previo de seguridad en la aplicación: el modelo declina mensajes de detección de crisis y preguntas de salud, si bien el autor advierte que la aplicación debe mantener sus propias reglas antes del modelo.

## Benchmarks y rendimiento

| Prueba | Resultado (pase 8) | Notas |
|---|---|---|
| Examen propio de 120 frases (peticiones, idiomas, conversación) | 98,3 % | Examen nuevo, según el autor |
| Rechazo de mensajes de detección de crisis | 135/135 | 100 % |
| Rechazo de preguntas de salud | 59/60 | 98,3 % |
| MMMLU (fr) | 50,0 % | Medición sobre la pase 8 |
| Clasificación en carpetas | descenso de 1,2 a 2,6 puntos | Respecto a Maurice 2.0 |

No se han publicado resultados de benchmarks estándar adicionales (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores proceden de evaluaciones internas del autor y no son directamente comparables con las de otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo IQ4_XS ocupa 968 MB (`maurice-2-0-IQ4_XS.gguf`) y 1.015.000.736 bytes (`maurice-req8-app-IQ4_XS.gguf`); la memoria necesaria en ejecución es algo superior al tamaño del archivo.
- GPU recomendadas: no disponible; el modelo está orientado a CPU y a dispositivos móviles mediante llama.cpp y llama.rn.
- Compatibilidad con GPU de consumo: cabe holgadamente en cualquier GPU de consumo actual por tamaño, aunque no se documentan requisitos específicos.
- Opciones de despliegue: llama.cpp y llama.rn; el repositorio incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Orientacion |
|---|---|---|---|---|---|
| Maurice 2.0 (este modelo) | 1.881.825.088 | no disponible | Apache 2.0 | GGUF (IQ4_XS) | Notas y peticiones habladas en dispositivo |
| Qwen 3.5 2B (base) | ~2B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo generalista |
| Alternativas de ~2B para on-device | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con otros modelos de la misma categoría no está disponible en la información proporcionada; el único punto de referencia documentado es el modelo base Qwen 3.5 2B.

## Limitaciones y advertencias

- El modelo está especializado en tareas concretas de la aplicación Dodo; su uso generalista fuera de ese dominio no está documentado.
- El autor advierte explícitamente que el modelo no es un mecanismo de seguridad suficiente: la aplicación debe aplicar sus propias reglas para detección de crisis y salud antes de invocar el modelo.
- Riesgo de alucinación en la respuesta sobre la conversación, mitigado parcialmente en la pase 8 pero no eliminado.
- La clasificación en carpetas pierde entre 1,2 y 2,6 puntos respecto a Maurice 2.0 en la pase 8.
- Idiomas limitados a francés, inglés y japonés; no se documenta soporte de castellano.
- Longitud de contexto no disponible, lo que impide evaluar su comportamiento en conversaciones largas.
- Licencia Apache 2.0 permite uso comercial, pero el proyecto no está aprobado ni respaldado por Alibaba Cloud ni por el equipo Qwen.
- Solo se distribuyen pesos GGUF cuantizados en IQ4_XS; no hay versiones en safetensors ni en otras cuantizaciones.
- Las métricas publicadas proceden de exámenes internos del autor y no de evaluaciones independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Babflou/maurice-2.0-gguf
- Modelo base Qwen 3.5 2B: https://huggingface.co/Qwen/Qwen3.5-2B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- llama.rn: https://github.com/mybigday/llama.rn
