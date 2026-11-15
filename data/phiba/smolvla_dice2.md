# phiba/smolvla_dice2

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante imitación. Esta ficha concreta, `phiba/smolvla_dice2`, es un ajuste fino del modelo base `lerobot/smolvla_base` entrenado por el usuario phiba para una tarea específica: recoger un dado de seis caras (D6) y dejarlo caer sobre una bandeja de dados. El modelo resuelve el problema de dotar a un brazo robótico de bajo coste de una política de control visual capaz de ejecutarse en hardware de consumo.

Con 450 millones de parámetros y un repositorio de 1,3 GB, el modelo procesa tres cámaras RGB de 256x256 píxeles y un vector de estado articular de 6 dimensiones, y produce una acción de 6 dimensiones por paso. La arquitectura subyacente combina un codificador visual-lenguaje con un decodificador de acciones, siguiendo el diseño presentado en el paper SmolVLA (arXiv:2506.01844), orientado a reducir el coste computacional frente a los VLA de gran escala.

Es relevante ahora porque demuestra el flujo completo de ajuste fino de políticas robóticas con LeRobot 0.7.0 sobre datos teleoperados propios (50 episodios, 15.331 fotogramas a 30 FPS), un patrón reproducible para investigadores y desarrolladores que quieran adaptar un VLA a tareas manipulativas concretas sin infraestructura de entrenamiento masiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA): codificador visual-lenguaje mas decodificador de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo recibe una instruccion de tarea en lenguaje natural, pero no se declaran idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina percepción visual y comprensión del lenguaje con la generación directa de comandos motores. La política consume tres flujos de imagen (`observation.images.camera1`, `camera2`, `camera3`, cada uno de forma `(3, 256, 256)`) y un vector de estado (`observation.state`, forma `(6,)`), y emite una acción de forma `(6,)`. El modelo base se describe en el paper arXiv:2506.01844 como un VLA compacto y eficiente, pensado para desplegarse en hardware de consumo.

Este ajuste fino se entrenó con LeRobot 0.7.0 sobre el dataset `phiba/Dice2_20261115_163146`: 50 episodios, 15.331 fotogramas a 30 FPS, con la tarea "Picking up a D6 and letting it drop above a dice tray". La configuración de entrenamiento fue de 20.000 pasos, batch size 64, optimizador AdamW, learning rate 0,0001 y semilla 1000. El robot empleado es un `so_follower` con cámaras `arm` y `top`. No se documenta en la información disponible el número de tokens de entrenamiento del modelo base, la composición de su dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de acciones motoras de 6 dimensiones a partir de observaciones visuales multimodales (tres cámaras) y estado articular.
- Control robótico por imitación para una tarea manipulativa concreta: recoger un D6 y soltarlo sobre una bandeja de dados.
- Condicionamiento por instrucción de tarea en lenguaje natural (`--task="Picking up a D6 and letting it drop above a dice tray"`).
- Percepción visual multi-cámara a resolución 256x256.
- Inferencia en tiempo real a 30 FPS, coherente con la frecuencia de captura del dataset.
- Ejecución mediante el comando `lerobot-rollout` del ecosistema LeRobot.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni capacidades de audio o thinking mode.

## Casos de uso

- Manipulación de dados en entornos de demostración: el modelo ejecuta la secuencia de agarre y soltado de un D6 sobre una bandeja, útil como banco de pruebas de políticas VLA en robots de bajo coste tipo `so_follower`.
- Replicación de experimentos de imitación: sirve como referencia reproducible del flujo `lerobot-train` con 20.000 pasos y batch 64 para validar pipelines de entrenamiento propios.
- Punto de partida para ajuste fino: al derivar de `lerobot/smolvla_base` con licencia Apache 2.0, puede reentrenarse con nuevos datasets para tareas de pick-and-place similares.
- Investigación en VLA compactos: permite estudiar el rendimiento de un modelo de 450 M de parámetros en tareas visomotoras reales frente a VLA de mayor escala.
- Docencia y formación en robótica: el comando `lerobot-rollout` con `--strategy.type=base` y `--duration=60` facilita demostraciones guiadas sin grabación de episodios.
- Evaluación de robustez visual: al depender de tres cámaras (`arm`, `top` y una tercera), es adecuado para analizar cómo afectan cambios de iluminación o posición de cámara a la política.
- Automatización de tareas de recogida y soltado en laboratorio: con 15.331 fotogramas de entrenamiento a 30 FPS, el modelo cubre variaciones de posición dentro del espacio de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M de parámetros en safetensors, el peso en precisión completa ronda 1,8 GB en FP32 y aproximadamente 0,9 GB en FP16, a lo que se suma el coste de los tres flujos de imagen de 256x256.
- GPU recomendadas: no disponibles en la información proporcionada; el paper del modelo base indica que SmolVLA puede desplegarse en hardware de consumo.
- Compatibilidad con GPU de consumo: el diseño del modelo base apunta a que sí es viable en GPU de consumo, aunque no se especifican modelos concretos.
- Opciones de despliegue: LeRobot 0.7.0 mediante `lerobot-rollout` (inferencia) y `lerobot-train` (entrenamiento); el entrenamiento documentado usa `--policy.device=cuda`.
- Latencia y throughput: no disponibles; el dataset se capturó a 30 FPS, pero no se documenta la latencia real de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| phiba/smolvla_dice2 | 450.046.176 | no disponible | Manipulacion robotica (D6 sobre bandeja) | Apache 2.0 | Hugging Face, via LeRobot |
| lerobot/smolvla_base | no disponible | no disponible | VLA general para ajuste fino | no disponible en la informacion | Hugging Face, via LeRobot |
| Otros VLA de gran escala (p. ej. RT-2, OpenVLA) | no disponible en la informacion | no disponible | Manipulacion robotica general | no disponible en la informacion | no disponible en la informacion |

La comparación cuantitativa con alternativas no está disponible: no se han publicado métricas de éxito para esta política ni se dispone de datos de rendimiento de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Política especializada en una única tarea ("Picking up a D6 and letting it drop above a dice tray"); no es un modelo generalista y su rendimiento fuera de ese dominio no está validado.
- Sin resultados de evaluación publicados: no hay tasa de éxito medida, por lo que se desconoce su fiabilidad en producción.
- Entrenada con solo 50 episodios y 15.331 fotogramas; la cobertura de posiciones, iluminación y distracciones es limitada y puede degradar la generalización.
- Depende de la configuración exacta de cámaras (`arm`, `top` y una tercera) y del robot `so_follower`; cambios de montaje o de tipo de robot pueden invalidar la política.
- Riesgo de alucinación motora: como toda política de imitación, puede generar acciones plausibles pero incorrectas ante observaciones fuera de distribución.
- No se documentan sesgos demográficos ni lingüísticos, pero tampoco se declaran idiomas soportados para la instrucción de tarea.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y la especialización de la tarea desaconsejan su despliegue en producción sin validación previa.
- No se especifican requisitos mínimos de hardware ni latencias, lo que dificulta planificar un despliegue en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phiba/smolvla_dice2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/phiba/Dice2_20261115_163146
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=phiba/Dice2_20261115_163146
