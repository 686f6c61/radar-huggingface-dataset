# shangarot/moveT_TaskB

## Resumen

`shangarot/moveT_TaskB` es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers), publicada en Hugging Face Hub mediante la librería LeRobot. El modelo predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, una técnica que mejora la estabilidad y la tasa de éxito en tareas de manipulación robótica aprendidas a partir de datos de teleoperación. Está entrenado para una única tarea concreta: "Pull T box", sobre un robot de tipo `so_follower` con dos cámaras (vista superior y muñeca).

El modelo tiene 51.668.614 parámetros, un tamaño de repositorio de 0,2 GB y consume observaciones compuestas por el estado articular (vector de 6 dimensiones) y dos imágenes RGB de 480x640 píxeles, produciendo un vector de acción de 6 dimensiones. Es, por tanto, una política de robótica específica de tarea, no un modelo de lenguaje: no procesa texto ni genera lenguaje natural, y su relevancia radica en servir como ejemplo reproducible de un pipeline completo de imitación con LeRobot (grabación de datos, entrenamiento, despliegue en robot real).

El modelo se entrenó con 40 episodios (13.492 fotogramas a 30 FPS) durante 20.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-05. No se han publicado resultados de evaluación en robot real ni métricas de éxito, y la licencia no está especificada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política de robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras de entrada | `top`, `wrist` (3x480x640 cada una) |
| Entrada de estado | `observation.state` (6,) |
| Salida de acción | `action` (6,) |
| Tarea entrenada | "Pull T box" |
| Dataset de entrenamiento | `shangarot/moveT_TaskB` (40 episodios, 13.492 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 20.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un backbone visual (codificador de imágenes) con un transformer que genera secuencias de acciones en forma de chunks. En lugar de predecir una acción por paso de control, el modelo predice un bloque de acciones futuras, lo que reduce el error de acumulación y suaviza el comportamiento del robot. La política recibe dos flujos visuales (cámara superior y cámara de muñeca) junto con el estado articular de 6 dimensiones, y emite un vector de acción de 6 dimensiones por paso.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `shangarot/moveT_TaskB`, compuesto por 40 episodios teleoperados de la tarea "Pull T box" (13.492 fotogramas a 30 FPS). Se ejecutaron 20.000 pasos con batch size 8, AdamW y learning rate 1e-05, con semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de imitación supervisada pura sobre datos de demostración. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal, que no aplican a este tipo de política.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot `so_follower` a partir de observaciones visuales y de estado articular.
- Percepción visual multi-cámara: procesa simultáneamente dos imágenes RGB de 480x640 (vista superior y muñeca).
- Ejecución de una tarea específica: "Pull T box" (arrastrar una caja en T), aprendida por imitación.
- Predicción por chunks de acción: emite secuencias cortas de acciones en lugar de pasos aislados, lo que mejora la estabilidad del control.
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train` para despliegue y reentrenamiento.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Automatización de una celda de manipulación concreta: desplegar la política en un robot `so_follower` para ejecutar repetidamente la tarea "Pull T box" en un entorno controlado, usando `lerobot-rollout` con las cámaras `top` y `wrist` calibradas.
- Base para fine-tuning en tareas similares: reentrenar la política con `lerobot-train` sobre un dataset propio de arrastre o manipulación de objetos, partiendo de la configuración ACT documentada (20.000 pasos, batch 8, lr 1e-05).
- Prototipado rápido de imitación en robótica de bajo coste: servir como ejemplo reproducible de un pipeline completo (grabación, entrenamiento, despliegue) para equipos que se inician en LeRobot con el robot `so_follower`.
- Investigación en aprendizaje por imitación: usar la política como línea base para comparar variantes de ACT, tamaños de chunk o configuraciones de cámaras en una tarea de referencia.
- Validación de infraestructura de despliegue: probar la integración de políticas LeRobot en un robot real antes de escalar a tareas más complejas, verificando latencia y sincronización de cámaras a 30 FPS.
- Docencia y demostraciones: ilustrar en cursos o talleres cómo se entrena y ejecuta una política de imitación con datos teleoperados y cómo se interpretan las observaciones y acciones de 6 dimensiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"), por lo que no existe tasa de éxito, número de ensayos ni métricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos en safetensors, el modelo es muy ligero (del orden de centenares de MB en fp32) y cabe holgadamente en cualquier GPU consumer, aunque no se documenta el consumo exacto.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU con suficiente memoria para el backbone visual y las dos cámaras de 480x640 sería suficiente, pero no se especifica.
- Cabe en GPU consumer: previsiblemente sí, dado el reducido número de parámetros, aunque no se confirma en la model card.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia en robot, `lerobot-train` para reentrenamiento); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; el dataset se grabó a 30 FPS, pero no se publica latencia de inferencia ni throughput medido.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `shangarot/moveT_TaskB` | ACT (LeRobot) | 51.668.614 | no aplica | "Pull T box" en `so_follower` | no disponible | Hugging Face Hub |
| Otras políticas ACT en LeRobot Hub | ACT (LeRobot) | variable | no aplica | tareas específicas | variable | Hugging Face Hub |
| Políticas Diffusion Policy en LeRobot | Diffusion Policy | variable | no aplica | manipulación | variable | Hugging Face Hub |
| Políticas VLA (p. ej. RT-2, OpenVLA) | Vision-Language-Action | mucho mayor | no disponible | manipulación generalista | variable | repositorios públicos |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada; la comparación se limita a tipo de arquitectura, tamaño y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea "Pull T box"; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito ni resultados en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia del hardware: requiere un robot `so_follower` y dos cámaras con nombres e índices que coincidan con las claves de observación (`top`, `wrist`); cualquier cambio de calibración o montaje puede degradar el comportamiento.
- Dataset pequeño: 40 episodios y 13.492 fotogramas son una base limitada; el modelo puede ser sensible a variaciones de posición de objetos, iluminación o distracciones no presentes en los datos.
- Licencia no especificada: al no indicarse licencia, no se puede confirmar el uso comercial; conviene contactar con el autor antes de desplegarlo en producción.
- Riesgo de sobreajuste a la tarea y al entorno de grabación, con posible degradación fuera de la distribución de demostración.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes, y no tiene capacidades multilingües.
- Sesgos: no se documentan sesgos específicos, pero al ser una política de imitación hereda los sesgos y limitaciones de las demostraciones teleoperadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shangarot/moveT_TaskB
- Dataset de entrenamiento: https://huggingface.co/datasets/shangarot/moveT_TaskB
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=shangarot/moveT_TaskB
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
