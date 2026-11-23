# SoSolaris/xvla-b1123-1444-xv1_full

## Resumen

X-VLA es un marco de vision-lenguaje-acción (VLA) basado en flow matching y soft prompting, presentado en el artículo arXiv 2510.10274. La idea central es tratar cada configuración de robot o hardware como una "tarea" codificada mediante un pequeño conjunto de embeddings de Soft Prompt aprendibles, lo que permite que un único modelo reconcilie morfologías de robot, sensores y espacios de acción diversos. El modelo base es `lerobot/xvla-base`, publicado por el equipo de LeRobot de Hugging Face.

Esta ficha concreta, `SoSolaris/xvla-b1123-1444-xv1_full`, es un fine-tuning del modelo base sobre un dataset propio de manipulación bimanual. El autor es el usuario SoSolaris y el modelo está pensado para una tarea muy específica: coger una lata y verter su contenido en una taza, sin agua. No es un modelo de propósito general, sino una política de imitación entrenada para un robot concreto (`solaria_bimanual`) con tres cámaras y un espacio de acciones de 14 dimensiones.

El modelo tiene 879.687.256 parámetros (dato real de los pesos en safetensors), un repositorio de 1,8 GB y licencia Apache 2.0. Es relevante ahora porque forma parte del ecosistema LeRobot, que está estandarizando el entrenamiento y despliegue de políticas robóticas, y porque ejemplifica el patrón de fine-tuning de un VLA base para tareas de manipulación concretas con hardware asequible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | X-VLA: vision-lenguaje-acción con flow matching y soft prompting (transformer) |
| Parametros totales | 879.687.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

X-VLA es un framework de vision-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un cabezal de acciones entrenado con flow matching. La innovación principal es el uso de Soft Prompts aprendibles: cada robot o configuración de hardware se representa mediante un conjunto reducido de embeddings que se anteponen a la entrada del modelo, de modo que una sola red puede adaptarse a distintas morfologías, sensores y espacios de acción sin necesidad de arquitecturas separadas. El modelo procesa observaciones multimodales (imágenes de varias cámaras más el estado del robot) y genera vectores de acción de forma continua mediante flow matching.

Este fine-tuning concreto se entrenó sobre el dataset `SoSolaris/can_to_mug_merged_20261117_trimmed`, con 195 episodios y 200.716 frames a 30 FPS, para la tarea "Grab the can and pour its contain in the mug (without water)". La configuración de entrenamiento fue de 30.000 pasos, batch size 32, optimizador `xvla-adamw`, learning rate 0,0001 y semilla 1000, usando LeRobot 0.6.2. El robot es de tipo `solaria_bimanual` con tres cámaras (`up`, `right`, `left`): dos entradas visuales de 3×256×256 y una de 3×224×224, más un vector de estado de 8 dimensiones; la salida es un vector de acción de 14 dimensiones.

## Capacidades

- Generación de acciones robóticas continuas de 14 dimensiones para control bimanual.
- Percepción visual multimodal a partir de tres cámaras simultáneas (vistas superior, derecha e izquierda).
- Fusión de estado propioceptivo del robot (vector de 8 dimensiones) con la información visual.
- Ejecución de una tarea de manipulación específica: coger una lata y verter su contenido en una taza.
- Aprendizaje por imitación (imitation learning) a partir de demostraciones teleoperadas.
- Compatible con el pipeline de LeRobot para rollout y entrenamiento (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, agentes multi-paso ni razonamiento textual: es una política de control motor, no un modelo de lenguaje conversacional.
- Capacidades multilingües: no aplicable.

## Casos de uso

- Automatización de una tarea de vertido en laboratorio: el modelo ejecuta de forma autónoma la secuencia de coger la lata y verterla en la taza sobre el robot `solaria_bimanual`, sustituyendo la teleoperación manual en experimentos repetitivos.
- Generación de datos de evaluación para investigación en VLA: al ser un fine-tuning reproducible sobre un dataset público, sirve como referencia para comparar variantes de X-VLA o de otras políticas de imitación.
- Prototipado de pipelines de imitation learning: el modelo se puede usar como punto de partida para validar el flujo completo de LeRobot (grabación de datos, entrenamiento, rollout) antes de escalar a tareas más complejas.
- Base para fine-tuning adicional: al derivar de `lerobot/xvla-base` con licencia Apache 2.0, se puede reentrenar sobre nuevos datasets de manipulación sin restricciones de licencia.
- Demostraciones de robótica bimanual: útil para vídeos y presentaciones que muestren manipulación con dos brazos y múltiples cámaras en entornos controlados.
- Investigación en adaptación multi-robot: el mecanismo de Soft Prompts permite estudiar cómo un mismo backbone se adapta a distintas morfologías, y este checkpoint sirve como caso concreto de una de ellas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 879,7 M de parámetros, en fp32 serían aproximadamente 3,5 GB solo de pesos; en fp16 unos 1,8 GB; en int8 unos 0,9 GB. A esto hay que sumar el coste de los codificadores visuales y las activaciones, por lo que se recomienda al menos 8 GB de VRAM en fp16 para operar con margen.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3090, RTX 4090, A100 o H100 son suficientes; una GPU consumer de gama media con 8-12 GB debería bastar en precisión reducida.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es el método documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La inferencia debe ejecutarse a la frecuencia de control del robot; el dataset se grabó a 30 FPS, lo que sugiere que el bucle de control opera en ese orden de magnitud, pero no se confirma.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SoSolaris/xvla-b1123-1444-xv1_full | 879,7 M | no disponible | Vertido lata-taza (bimanual) | Apache 2.0 | Hugging Face |
| lerobot/xvla-base | no disponible | no disponible | VLA base multi-robot | no disponible en la información | Hugging Face |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Imitation learning genérico | no disponible en la información | Hugging Face / GitHub |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado exclusivamente para la tarea "coger la lata y verter su contenido en la taza", sobre un robot concreto (`solaria_bimanual`) y una disposición de cámaras específica. No generaliza a otras tareas ni robots sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay tasas de éxito ni pruebas en robot real documentadas, por lo que se desconoce su fiabilidad en producción.
- Dependencia del hardware: las claves de observación (`observation.images.image`, `image2`, `image3`, `observation.state`) y las dimensiones deben coincidir exactamente con las del robot y cámaras usados en el entrenamiento.
- Riesgo de sobreajuste al dataset: 195 episodios y 200.716 frames son un volumen modesto; es probable que el modelo sea sensible a cambios de iluminación, posiciones de objetos o distracciones no presentes en los datos.
- Sesgos: no documentados, pero al ser un modelo entrenado con demostraciones humanas puede heredar sesgos de las trayectorias del operador.
- Alucinación: no aplica en el sentido textual, pero sí puede producir acciones erráticas o inseguras si la observación se sale de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Idiomas: no aplicable; el modelo no procesa lenguaje natural de forma conversacional, aunque X-VLA incorpora un componente de lenguaje para condicionar la tarea.
- Fecha de creación futura en los metadatos (2026-11-23): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SoSolaris/xvla-b1123-1444-xv1_full
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Artículo X-VLA (arXiv 2510.10274): https://huggingface.co/papers/2510.10274
- Dataset de entrenamiento: https://huggingface.co/datasets/SoSolaris/can_to_mug_merged_20261117_trimmed
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SoSolaris/can_to_mug_merged_20261117_trimmed
- Guía LeRobot X-VLA: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
