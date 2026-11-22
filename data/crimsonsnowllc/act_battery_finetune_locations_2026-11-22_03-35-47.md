# CrimsonSnowLLC/act_battery_finetune_locations_2026-11-22_03-35-47

## Resumen

ACT (Action Chunking Transformer) es un modelo de imitación para control robótico, y esta versión concreta es un fine-tune del modelo base `CrimsonSnowLLC/act_battery_full_100k`, desarrollado por el equipo CrimsonSnow para el hackathon LeRobot Bilbao 2026. El modelo resuelve una tarea muy concreta: que un brazo robótico SO-101 sea capaz de recoger una batería situada en cualquier punto del arco de trabajo, incluidas dos zonas que el modelo base no había visto durante su entrenamiento original.

El modelo parte de un entrenamiento previo de 100.000 pasos sobre 281 episodios y se ha ajustado durante 20.000 pasos adicionales con un conjunto de datos ampliado (305 episodios, 202.830 frames) que incorpora 12 episodios nuevos con la batería repartida a lo largo de todo el arco. El ajuste se realizó en aproximadamente 25 minutos sobre una única GPU A100 mediante Hugging Face Jobs, con un batch de 8 y una tasa de aprendizaje de 1e-5.

Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a despliegue en el propio brazo robótico o en un equipo de control cercano. Su relevancia radica en que ilustra el flujo típico de trabajo en robótica con LeRobot: partir de una política preentrenada, ampliar la distribución de datos y ajustar de forma económica para cubrir casos no vistos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política de imitación para robótica |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones de imagen y estado del robot) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |
| Modelo base | CrimsonSnowLLC/act_battery_full_100k |
| Dataset de ajuste | CrimsonSnowLLC/battery-full-plus-locations |
| Pasos de fine-tuning | 20.000 |
| Batch | 8 |
| Learning rate | 1e-5 |
| Hardware de entrenamiento | 1 GPU A100 (Hugging Face Jobs) |
| Duracion del entrenamiento | ~25 minutos |
| Entradas | `observation.images.front` (640×480) y `observation.images.gripper` (640×480) |
| Robot objetivo | SO-101 (calibración `so100_follower` de SenseCraft Robotics) |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ACT (Action Chunking Transformer), una política de imitación diseñada para predecir secuencias de acciones (chunks) a partir de observaciones visuales y del estado del robot. No es un transformer de lenguaje: sus entradas son dos flujos de imagen (cámara frontal cenital y cámara de la pinza) a resolución 640×480, y su salida son comandos de control para el brazo SO-101. El número de parámetros (51,7 millones) es coherente con una política compacta pensada para inferencia en tiempo real.

El entrenamiento se realizó en dos fases. La primera, ya incluida en el modelo base, consistió en 100.000 pasos sobre 281 episodios. La segunda, que da lugar a esta versión, añadió 12 episodios con la batería distribuida por todo el arco de trabajo, duplicando esos episodios nuevos para que pesaran aproximadamente el 9 % del total (305 episodios, 202.830 frames). El ajuste se ejecutó durante 20.000 pasos con batch 8 y learning rate 1e-5, en unos 25 minutos sobre una A100. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal, ni detalles sobre RLHF o DPO, que no aplican a este tipo de política.

## Capacidades

- Control robótico por imitación: predice secuencias de acciones para que el brazo SO-101 recoja una batería situada en el arco de trabajo.
- Generalización a posiciones no vistas: el fine-tune cubre dos huecos del área de trabajo que el modelo base no había visto.
- Percepción visual multimodal: utiliza dos cámaras simultáneas (vista cenital y vista de la pinza) a 640×480.
- Ejecución de tareas de pick-and-place de un solo objeto (batería) en un entorno de trabajo acotado.
- Integración con LeRobot 0.7.0 y con el repositorio del equipo, que ofrece comandos `so demo` y `so try`.
- No soporta tool calling, function calling, agentes multi-paso, generación de texto, código, matemáticas ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Recogida automatizada de baterías en el arco de trabajo: el modelo mueve el brazo SO-101 hasta la batería y la agarra, incluyendo las dos posiciones nuevas que motivaron el fine-tune. Es adecuado porque su entrenamiento ampliado cubre toda la distribución espacial del arco.
- Demostración en hackathon o entorno de investigación: sirve como ejemplo reproducible de flujo LeRobot (modelo base, dataset ampliado, fine-tune en A100 y despliegue en el brazo). El coste de entrenamiento (~25 min en una A100) lo hace accesible para equipos pequeños.
- Prueba de concepto de generalización por aumento de datos: permite evaluar cómo 12 episodios nuevos (ponderados al 9 %) mejoran la cobertura de posiciones no vistas por el modelo base.
- Automatización de una celda de montaje con un único objeto: en una línea donde una batería debe trasladarse desde cualquier punto de un arco hasta una posición fija, el modelo puede sustituir a un operario en esa subtarea.
- Validación de políticas de imitación en robótica de bajo coste: con 51,7 M de parámetros y 0,2 GB, se puede desplegar en equipos modestos junto al brazo, lo que facilita ciclos de iteración rápidos.
- Base para nuevos fine-tunes: al estar publicado en Hugging Face con la librería lerobot, otro equipo puede partir de este modelo y añadir sus propios episodios para nuevas posiciones u objetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el modelo está siendo probado por el equipo sobre el brazo para la demo final, pero no aporta métricas de éxito, tasas de acierto ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y pesos en safetensors (0,2 GB de repositorio), la huella es muy reducida y cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no se especifican; el entrenamiento se realizó en una A100. Para inferencia, una GPU consumer con varios GB de VRAM debería ser suficiente, aunque no se confirma en la información.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo, aunque no se detalla el modelo mínimo.
- Opciones de despliegue: LeRobot 0.7.0 (`lerobot-rollout --policy.path=...`) y el repositorio del equipo (`so demo`, `so try`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CrimsonSnowLLC/act_battery_finetune_locations_2026-11-22_03-35-47 | 51.668.614 | no aplica | Pick de batería en SO-101 | no disponible | Hugging Face |
| CrimsonSnowLLC/act_battery_full_100k (modelo base) | no disponible | no aplica | Pick de batería en SO-101 | no disponible | Hugging Face |
| Otras políticas ACT para LeRobot | no disponible | no aplica | Tareas de imitación genéricas | variable | Hugging Face |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. El único punto de referencia directo es el modelo base, del que este fine-tune hereda la arquitectura y amplía la cobertura espacial.

## Limitaciones y advertencias

- Tarea muy específica: solo recoge una batería en un arco de trabajo concreto con un brazo SO-101; no es un modelo generalista.
- Dependencia de calibración: requiere la calibración `so100_follower` de SenseCraft Robotics con la que se grabaron los episodios; otra calibración puede degradar el rendimiento.
- Dependencia de las cámaras: espera `observation.images.front` y `observation.images.gripper` a 640×480; cambios de montaje o resolución pueden invalidar la política.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de un despliegue en producción.
- Sesgos conocidos: no documentados, pero al entrenarse con 305 episodios de un entorno concreto, el modelo puede fallar ante iluminación, fondo u objeto distintos.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones erróneas o agarres fallidos fuera de la distribución entrenada.
- Estado de validación: la model card indica que el modelo está siendo probado para la demo final, sin métricas publicadas de éxito.
- Sin soporte de lenguaje, tool calling ni agentes: no debe evaluarse con benchmarks de LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CrimsonSnowLLC/act_battery_finetune_locations_2026-11-22_03-35-47
- Modelo base: https://huggingface.co/CrimsonSnowLLC/act_battery_full_100k
- Dataset de ajuste: https://huggingface.co/datasets/CrimsonSnowLLC/battery-full-plus-locations
- Repositorio del equipo: https://github.com/SO-101-Hackathon/CrimsonSnow
