# Leberkaesweckle/Dataset_UR5e_Schunk_Gripper_150_episodes_merged6_SMOLVLA

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para controlar robots manipuladores a partir de observaciones visuales e instrucciones en lenguaje natural. Este repositorio concreto contiene un *fine-tuning* del modelo base `lerobot/smolvla_base` sobre un conjunto de datos propio de 150 episodios grabados con un brazo UR5e equipado con pinza Schunk, orientado a la tarea de recoger un bloque naranja y depositarlo en una caja azul.

El modelo resuelve el problema de la política de imitación extremo a extremo: en lugar de programar trayectorias, aprende una función que mapea imágenes de dos cámaras y el estado de las articulaciones a comandos de acción de 7 dimensiones. Con unos 450 millones de parámetros y licencia Apache 2.0, está pensado para desplegarse en hardware de consumo, lo que lo hace relevante para laboratorios y desarrolladores que quieren experimentar con robótica basada en aprendizaje sin infraestructura de gran escala.

La relevancia actual del modelo radica en su carácter abierto y reproducible: el *checkpoint*, el *dataset* de entrenamiento y la configuración completa están publicados en el Hub, de modo que cualquier equipo con un UR5e y una pinza Schunk puede reproducir el entrenamiento o adaptarlo a nuevas tareas mediante *fine-tuning*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), política de imitación sobre backbone transformer con encoder visual |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica como ventana de texto; consume observaciones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es una política de visión-lenguaje-acción compacta que combina un codificador visual para las imágenes de cámara con un componente de lenguaje que procesa la instrucción de la tarea, y una cabeza de acción que produce el vector de comandos del robot. El modelo consume tres entradas visuales de forma `(3, 256, 256)`, un vector de estado de `(6,)` y genera una acción de `(7,)`, correspondiente a los grados de libertad del UR5e más la pinza Schunk. Según la model card, el diseño busca rendimiento competitivo con coste computacional reducido y despliegue en hardware de consumo.

El *fine-tuning* se realizó sobre el *dataset* `Dataset_UR5e_Schunk_Gripper_150_episodes_merged`, con 150 episodios, 44.494 fotogramas a 15 FPS y una única tarea: "Grip the orange block and drop them into the blue box". La configuración de entrenamiento fue de 20.000 pasos, tamaño de lote 64, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 1000, usando LeRobot 0.6.2. No se especifican en la información disponible detalles sobre la composición del corpus de preentrenamiento del modelo base ni sobre si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Control robótico de manipulación extremo a extremo: genera comandos de acción de 7 dimensiones a partir de imágenes y estado articular.
- Percepción visual multi-cámara: procesa simultáneamente tres flujos de imagen de 256x256 píxeles.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica como texto ("Grip the orange block and drop them into the blue box").
- Política de imitación entrenada para una tarea concreta de *pick-and-place*.
- Integración nativa con LeRobot: ejecución mediante `lerobot-rollout` y reentrenamiento mediante `lerobot-train`.
- No se documentan capacidades de *tool calling*, razonamiento multi-paso, generación de texto libre, matemáticas ni otras modalidades (audio) en la información disponible.

## Casos de uso

- **Automatización de pick-and-place en laboratorio**: el modelo ejecuta la tarea de recoger un bloque y depositarlo en una caja sobre un UR5e con pinza Schunk, sirviendo como base reproducible para experimentos de manipulación.
- **Investigación en aprendizaje por imitación**: al estar publicados el *checkpoint*, el *dataset* y la configuración de entrenamiento, permite reproducir resultados y estudiar el efecto de hiperparámetros en políticas VLA.
- **Punto de partida para fine-tuning en nuevas tareas**: el modelo se puede reentrenar con `lerobot-train` sobre otros *datasets* de demostraciones para adaptarlo a objetos o contenedores distintos.
- **Prototipado rápido en robótica de bajo coste**: con 450 millones de parámetros y despliegue orientado a hardware de consumo, es adecuado para equipos con presupuesto limitado que quieran validar un *pipeline* VLA completo.
- **Docencia y formación**: el flujo completo (grabación de datos, entrenamiento, *rollout*) documentado en LeRobot lo convierte en un caso práctico para cursos de robótica e IA.
- **Evaluación comparativa de políticas VLA**: sirve como referencia *fine-tuned* frente al modelo base `smolvla_base` para medir el impacto del ajuste específico de dominio.
- **Integración en cadenas de manipulación industrial sencillas**: tareas repetitivas de trasvase de piezas en entornos controlados donde la variabilidad visual es baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros en precisión completa el peso ronda 1,8 GB, y el consumo adicional depende de los tres flujos de imagen de 256x256 y del *runtime* de LeRobot.
- GPU recomendadas: no especificadas en la información disponible; el modelo base se describe como desplegable en hardware de consumo.
- Compatibilidad con GPU de consumo: el diseño compacto de SmolVLA apunta a que cabe en GPU de consumo, pero no se detalla un modelo concreto en la información proporcionada.
- Opciones de despliegue: LeRobot mediante el comando `lerobot-rollout` con `--strategy.type=base`; el reentrenamiento se realiza con `lerobot-train`.
- Latencia y throughput: no disponibles. El *dataset* de entrenamiento se grabó a 15 FPS, pero no se documenta la frecuencia de inferencia alcanzada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SmolVLA fine-tuned) | 450.046.176 | no aplica | Pick-and-place UR5e + Schunk | Apache 2.0 | Hugging Face Hub |
| `lerobot/smolvla_base` | no disponible | no aplica | Política VLA base para fine-tuning | no disponible | Hugging Face Hub |
| Otras políticas VLA de gran escala (p. ej. familias tipo RT-2 o OpenVLA) | no disponible en la información proporcionada | no disponible | Manipulación generalista | no disponible | no disponible |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; únicamente se conoce la relación directa con el modelo base del que deriva.

## Limitaciones y advertencias

- **Sobreajuste a una única tarea**: la política está entrenada exclusivamente para "Grip the orange block and drop them into the blue box"; no se espera generalización a otros objetos, contenedores o disposiciones sin reentrenamiento.
- **Dependencia del montaje físico**: las cámaras, su posición y los índices deben coincidir con los usados en el entrenamiento (`front`, `side` y las claves de observación), por lo que cambios de calibración o iluminación pueden degradar el rendimiento.
- **Sin evaluación publicada**: no hay tasas de éxito en robot real, lo que impide estimar la fiabilidad en producción.
- **Riesgo de alucinación motora**: como toda política de imitación, puede generar acciones fuera de distribución ante situaciones no vistas durante el entrenamiento.
- **Sesgos de los datos**: el *dataset* proviene de un único operador, robot y entorno, por lo que hereda sus sesgos de trayectoria y estilo de manipulación.
- **Idiomas**: no se documenta soporte multilingüe; la instrucción de tarea está en inglés y no se especifica cómo afectan otras formulaciones.
- **Licencia**: Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias de dependencias (LeRobot) y de los datos subyacentes.
- **Fecha de creación futura**: el repositorio figura creado el 2026-11-04, dato que conviene contrastar antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Leberkaesweckle/Dataset_UR5e_Schunk_Gripper_150_episodes_merged6_SMOLVLA
- Dataset de entrenamiento: https://huggingface.co/datasets/Leberkaesweckle/Dataset_UR5e_Schunk_Gripper_150_episodes_merged
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Leberkaesweckle/Dataset_UR5e_Schunk_Gripper_150_episodes_merged
