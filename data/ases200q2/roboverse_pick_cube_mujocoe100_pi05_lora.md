# ases200q2/roboverse_pick_cube_mujocoE100_pi05_lora

## Resumen

Este modelo es una política de robótica Vision-Language-Action (VLA) basada en π₀.₅ (Pi05), desarrollada por Physical Intelligence y adaptada a LeRobot. Ha sido fine-tuneado con la técnica LoRA sobre el modelo base `lerobot/pi05_base`, utilizando el dataset `ases200q2/roboverse-pick_cube-mujocoE100`, compuesto por 100 episodios y 19.700 frames a 30 FPS en el entorno MuJoCo. La tarea concreta es `pick_cube`, en la que un brazo robótico de tipo Franka debe recoger un cubo a partir de observaciones de estado, velocidad e imágenes de una cámara principal. Su relevancia reside en que permite evaluar y comparar políticas VLA de código abierto en entornos simulados de manipulación robótica, un paso habitual antes de transferir a robots reales. El modelo está publicado bajo licencia Apache-2.0, lo que lo hace adecuado tanto para investigación como para uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05) con fine-tune LoRA |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre el modelo base `lerobot/pi05_base`. Pi05 es una arquitectura VLA de Physical Intelligence que, según la documentación, evoluciona el modelo π₀ para generalizar a entornos completamente nuevos nunca vistos durante el entrenamiento. La implementación en LeRobot se adapta del repositorio open-source OpenPI de Physical Intelligence. El fine-tune se ha realizado con el dataset `ases200q2/roboverse-pick_cube-mujocoE100`, que contiene 100 episodios y 19.700 frames a 30 FPS para la tarea `pick_cube`. La configuración de entrenamiento documentada es de 40.000 pasos, batch size 32, optimizador AdamW, learning rate 2.5e-05, seed 1000 y LeRobot version 0.6.1. No se indica el uso de RLHF, DPO ni otras técnicas de alineación posteriores.

## Capacidades

- Control robótico de un brazo Franka: genera acciones de 9 dimensiones a partir del estado (9), la velocidad (9) y una imagen RGB de la cámara principal con resolución 3×240×320.
- Aprendizaje por imitación: reproduce la política de la tarea `pick_cube` a partir de los 100 episodios del dataset simulado en MuJoCo.
- Arquitectura VLA: al estar basado en pi05, incorpora un modelo de lenguaje y visión que permite interpretar instrucciones en lenguaje natural para seleccionar acciones, aunque esta capacidad no se ha evaluado en este fine-tune.
- Generalización open-world: el modelo base pi05 está diseñado para generalizar a entornos no vistos; en este adaptador no se reportan evaluaciones que confirmen esa capacidad.
- No soporta tool calling, generación de texto libre, código, matemáticas ni conversación; no es un modelo de lenguaje conversacional.

## Casos de uso

- Evaluación de políticas en simulación: se puede ejecutar `lerobot-rollout` con este modelo en un entorno MuJoCo para registrar episodios y medir la tasa de éxito de la tarea de agarre de cubo, sin necesidad de un robot físico.
- Investigación en sim-to-real: al estar entrenado en simulación, sirve para estudiar la transferencia al mando de un brazo Franka real, evaluando la robustez ante variaciones de iluminación o posición.
- Base para fine-tune en tareas de manipulación: el adaptador LoRA puede ser un punto de partida para entrenar sobre nuevas tareas de pick-and-place con datasets propios, reutilizando el conocimiento del modelo base.
- Benchmarking de VLA: permite comparar el rendimiento de pi05 con otros modelos en la infraestructura RoboVerse o en el dataset `roboverse-pick_cube`, para trabajos sobre simulación de robots.
- Educación y formación: estudiantes y docentes pueden cargar el modelo con LeRobot y ejecutarlo en un simulador, aprendiendo el flujo de entrenamiento, inferencia y evaluación de políticas de imitación.
- Automatización de celdas de laboratorio: para tareas repetitivas de recoger y colocar cubos, la política puede integrarse en un pipeline con el brazo Franka y la cámara principal, siempre que las condiciones operativas coincidan con las del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo es un adaptador LoRA sobre pi05_base, pero no se especifica el consumo de memoria.
- GPU recomendadas: no disponible.
- Capacidad en GPU de consumo: no disponible.
- Despliegue: LeRobot 0.6.1. Inferencia con `lerobot-rollout --strategy.type=base --policy.path=ases200q2/roboverse_pick_cube_mujocoE100_pi05_lora --task="pick_cube"`. Entrenamiento con `lerobot-train`. No aplican vLLM, llama.cpp ni Ollama al ser una política de robótica.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ases200q2/roboverse_pick_cube_mujocoE100_pi05_lora | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |

No se han encontrado otros modelos comparables con datos verificables en la información proporcionada. El modelo base `lerobot/pi05_base` es el punto de partida del que deriva este adaptador.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados, por lo que no se puede validar el rendimiento real en la tarea `pick_cube` ni en otros entornos.
- Está entrenado exclusivamente para la tarea `pick_cube` en MuJoCo con un brazo Franka; no se puede esperar que generalice a otras tareas sin reentrenar.
- El dataset de entrenamiento es pequeño (100 episodios, 19.700 frames), lo que puede provocar sobreajuste y una menor robustez ante cambios de iluminación, posición u oclusión.
- Depende de observaciones específicas: estado, velocidad e imagen de tamaño 240×320; cualquier cambio en la cámara o en la dinámica del robot puede degradar el rendimiento.
- No es un modelo conversacional ni soporta tool calling; su ámbito es exclusivamente el control robótico.
- La licencia Apache-2.0 permite uso comercial, pero exige mantener la atribución y, en su caso, la distribución de las modificaciones bajo los mismos términos.

## Enlaces

- [Repositorio Hugging Face](https://huggingface.co/ases200q2/roboverse_pick_cube_mujocoE100_pi05_lora)
- [Modelo base lerobot/pi05_base](https://huggingface.co/lerobot/pi05_base)
- [Dataset de entrenamiento](https://huggingface.co/datasets/ases200q2/roboverse-pick_cube-mujocoE100)
- [Blog de Pi05 (Physical Intelligence)](https://www.physicalintelligence.company/blog/pi05)
- [LeRobot (GitHub)](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot para pi05](https://huggingface.co/docs/lerobot/main/en/pi05)
- [Documentación general de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Visualizador del dataset en Hugging Face Spaces](https://huggingface.co/spaces/lerobot/visualize_dataset?path=ases200q2/roboverse-pick_cube-mujocoE100)
- [RoboVerse: plataforma y benchmark de robótica](https://roboverseorg.github.io/)
