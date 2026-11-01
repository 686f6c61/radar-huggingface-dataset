# saybeok03/folding_final_expert_lora_224

## Resumen

`saybeok03/folding_final_expert_lora_224` es un ajuste fino (fine-tuning) del modelo visión-lenguaje-acción π₀.₅ (Pi05) de Physical Intelligence, empaquetado para la librería LeRobot de Hugging Face. El modelo parte de `lerobot/pi05_base` y se ha especializado en una única tarea robótica de manipulación: doblar una camiseta correctamente ("Fold the T-shirt properly"). Lo publica el usuario saybeok03 bajo licencia Apache 2.0.

A diferencia de un modelo de lenguaje, este artefacto es una política de imitación (imitation learning) que consume observaciones multimodales de un robot bimanual —estado de las articulaciones y tres cámaras RGB— y emite directamente un vector de acciones de 16 dimensiones. La arquitectura subyacente es la de π₀.₅, un modelo VLA de Physical Intelligence diseñado para generalización en entornos abiertos, aunque el ajuste aquí publicado está acotado a un único escenario y robot.

Su relevancia es práctica: sirve como ejemplo reproducible de un pipeline completo de LeRobot (grabación de datos, entrenamiento y despliegue) sobre hardware asequible `bi_openarm_follower`, y como punto de partida para quien quiera adaptar π₀.₅ a sus propias tareas de manipulación. El repositorio es pequeño (0,0 GB reportados) y tiene un uso muy limitado (23 descargas, 0 likes), por lo que debe tratarse como un experimento y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅, adaptación LeRobot del repositorio OpenPI de Physical Intelligence |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; no se declaran idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `lerobot/pi05_base`, la implementación en LeRobot del VLA π₀.₅ de Physical Intelligence, pensado para generalización en entornos abiertos. La política consume `observation.state` con forma `(16,)` y tres imágenes RGB de `(3, 224, 224)` procedentes de las cámaras `base`, `left_wrist` y `right_wrist`, y produce un vector `action` de `(16,)`. El robot objetivo es `bi_openarm_follower`, un brazo bimanual de tipo OpenArm.

El entrenamiento se realizó con el dataset `saybeok03/full_folding_pi05_224`: 50 episodios, 135.351 fotogramas a 30 FPS, todos correspondientes a la tarea "Fold the T-shirt properly". La configuración reportada es de 5.000 pasos, batch de 32, optimizador AdamW, learning rate 3,75e-05 y semilla 1000, sobre LeRobot 0.6.1. No se documentan detalles sobre el corpus de preentrenamiento de la base, el uso de RLHF/DPO ni innovaciones adicionales más allá de las propias de π₀.₅.

## Capacidades

- Control robótico de manipulación bimanual: genera acciones de 16 dimensiones para el robot `bi_openarm_follower`.
- Percepción multimodal: integra estado de articulaciones y tres vistas de cámara (base, muñeca izquierda, muñeca derecha) a resolución 224x224.
- Ejecución de una tarea concreta de plegado de camiseta, condicionada por la instrucción "Fold the T-shirt properly".
- Aprendizaje por imitación: reproduce comportamientos derivados de 50 episodios de demostración.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni modo "thinking".

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como referencia reproducible para estudiar cómo se ajusta π₀.₅ a una tarea nueva con un dataset pequeño (50 episodios) y una configuración de entrenamiento documentada.
- Reproducción de un pipeline LeRobot completo: permite recorrer el flujo grabación de datos, entrenamiento y despliegue con los comandos `lerobot-train` y `lerobot-rollout` documentados en la model card.
- Prototipado de manipulación textil: el modelo está especializado en plegar camisetas, un caso representativo de manipulación deformable, útil para evaluar políticas VLA en tareas no rígidas.
- Base para ajustes posteriores: al derivar de `lerobot/pi05_base` con licencia Apache 2.0, puede reutilizarse como punto de partida para otras tareas de plegado o manipulación con el mismo robot.
- Docencia y formación: ejemplo didáctico de cómo se estructura una política VLA (entradas, salidas, dataset y configuración) en LeRobot.
- Evaluación comparativa de hardware: al estar atado a `bi_openarm_follower` y a tres cámaras concretas, permite medir la transferibilidad de políticas entrenadas a configuraciones de hardware similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio se reporta como 0,0 GB y no se publican recuentos de parámetros.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: LeRobot, mediante el comando `lerobot-rollout` con `--policy.path=saybeok03/folding_final_expert_lora_224`; el entrenamiento se realiza con `lerobot-train` sobre `lerobot/pi05_base`.
- Hardware robótico requerido: robot `bi_openarm_follower` con tres cámaras (`base`, `left_wrist`, `right_wrist`) configuradas a 640x480 y 30 FPS en el ejemplo de la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `saybeok03/folding_final_expert_lora_224` | VLA π₀.₅ ajustado a plegado de camiseta | no disponible | no disponible | Apache 2.0 | Hugging Face (LeRobot) |
| `lerobot/pi05_base` | VLA π₀.₅ base, generalista | no disponible | no disponible | no disponible en la informacion proporcionada | Hugging Face (LeRobot) |
| π₀.₅ (Physical Intelligence) | VLA original, generalización en entornos abiertos | no disponible | no disponible | no disponible en la informacion proporcionada | Blog y repositorio OpenPI de Physical Intelligence |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado únicamente para la tarea "Fold the T-shirt properly"; no se espera que funcione en otras tareas sin reentrenamiento.
- Dependencia de hardware: requiere el robot `bi_openarm_follower` y exactamente las tres cámaras (`base`, `left_wrist`, `right_wrist`) con las que se entrenó; cambios de cámara o posición invalidan la política.
- Dataset pequeño: solo 50 episodios y 135.351 fotogramas, lo que limita la robustez ante variaciones de iluminación, posición de objetos o distractores.
- Sin evaluación publicada: la model card declara que no hay resultados de éxito en robot real, por lo que se desconoce la tasa de acierto.
- Riesgo de sobreajuste y comportamiento frágil fuera de la distribución de entrenamiento.
- No se documentan sesgos, pero al ser un modelo de robótica no aplican las métricas habituales de sesgo lingüístico; sí puede heredar sesgos de las demostraciones humanas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las condiciones del modelo base `lerobot/pi05_base` y de cualquier componente de terceros.
- Repositorio con muy poca tracción (23 descargas, 0 likes) y sin mantenimiento documentado; no debe considerarse listo para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saybeok03/folding_final_expert_lora_224
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/saybeok03/full_folding_pi05_224
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=saybeok03/full_folding_pi05_224
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot: https://github.com/huggingface/lerobot
- Guía de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
