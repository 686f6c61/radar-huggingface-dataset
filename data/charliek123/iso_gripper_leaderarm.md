# charlieK123/iso_gripper_leaderArm

## Resumen

iso_gripper_leaderArm es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. El modelo lo publica el usuario charlieK123 en Hugging Face y se ha entrenado y exportado con LeRobot, la librería de Hugging Face para aprendizaje automático en robótica del mundo real. Su función concreta es controlar un brazo seguidor SO (tipo `so_follower`) equipado con dos cámaras, ejecutando la tarea "coger pinzas y depositarlas en un contenedor".

No es un modelo de lenguaje: consume una observación estructurada (estado del robot de 6 dimensiones más dos imágenes RGB de 480x640) y produce un vector de acción de 6 dimensiones. El checkpoint en safetensors contiene 51.668.614 parámetros (unos 0,2 GB en el repositorio), lo que lo sitúa en la categoría de políticas ligeras que pueden ejecutarse en hardware de consumo.

Su relevancia es práctica más que de investigación: es un ejemplo reproducible del flujo de trabajo completo de LeRobot (grabación de datos con teleoperación, entrenamiento con ACT y despliegue con `lerobot-rollout`) sobre 91 episodios y 76.601 fotogramas a 30 FPS. Resulta útil como referencia para quien quiera replicar una política de manipulación con dos cámaras, aunque carece de resultados de evaluación publicados y tiene un uso muy limitado fuera de su tarea y su montaje concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual; detalles completos en el paper arXiv:2304.13705 |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de imitación sobre observación única; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos en safetensors; no se documenta ninguna cuantización) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; solo procesa estado y visuales) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Entrada | `observation.state` (6,), `observation.images.gripperCam` (3, 480, 640), `observation.images.bevCam` (3, 480, 640) |
| Salida | `action` (6,) |
| Tipo de robot | `so_follower` |
| Camaras | `gripperCam`, `bevCam` |
| Libreria | lerobot |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 8 / 0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice chunks de acciones en lugar de un solo paso, lo que reduce el error de acumulación típico de las políticas paso a paso y suele aumentar la tasa de éxito. Según el paper referenciado (arXiv:2304.13705), la arquitectura combina un backbone visual convolucional y un transformer con componente CVAE. La model card de este checkpoint no documenta los hiperparámetros internos de la política (por ejemplo, el tamaño del chunk o la dimensión latente), por lo que esos valores deben considerarse no disponibles.

El entrenamiento se realizó con LeRobot 0.6.1 durante 50.000 pasos, con batch size 16, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. Los datos provienen del dataset `charlieK123/iso_gripper_leaderArm`: 91 episodios, 76.601 fotogramas a 30 FPS, correspondientes a una única tarea de teleoperación ("picking up forceps and placing them into a container"). No se indica en la información disponible si hubo etapas de RLHF, DPO ni ningún otro ajuste posterior; en ACT el entrenamiento es puramente supervisado sobre demostraciones (comportamiento clonado).

No hay innovaciones técnicas adicionales documentadas en la model card más allá del propio método ACT. El checkpoint se limita a ser una instancia entrenada de esa política sobre un montaje concreto.

## Capacidades

- Generación de acciones de control continuas: produce vectores de acción de 6 dimensiones a partir de estado y dos vistas de cámara.
- Manipulación robótica por imitación: ejecuta la tarea específica de recoger pinzas y colocarlas en un contenedor, tal y como se demostró en los datos de teleoperación.
- Fusión de estado propioceptivo y visión: combina el estado del robot con dos flujos de imagen (cámara de pinza y cámara cenital) a 480x640.
- Ejecución a la frecuencia de control del robot: los datos se grabaron a 30 FPS, que es la frecuencia de referencia del entrenamiento.
- Integración con el ecosistema LeRobot: se ejecuta y se reentrena mediante las herramientas estándar de la librería.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso (no es un modelo lingüístico).
- No dispone de capacidades multilingües, de texto, de audio ni de visión general: las imágenes solo se usan como entrada de la política de control.
- No dispone de modo de razonamiento (thinking), ni de generación de código o matemáticas.

## Casos de uso

- Replicación de una política de manipulación con dos cámaras: sirve como referencia para montar un pipeline ACT completo con LeRobot sobre un brazo SO, comparando los resultados propios con este checkpoint entrenado con 91 episodios.
- Automatización de una tarea de recogida y deposición: el modelo se puede desplegar con `lerobot-rollout` para que el robot coja pinzas y las deposite en un contenedor durante una sesión controlada de 60 segundos o de forma indefinida.
- Generación de datos y evaluación interna: al ejecutar la política sobre el robot real se pueden registrar episodios y medir la tasa de éxito del montaje, algo que el autor no ha publicado todavía.
- Base para ajuste fino con datos propios: dado su tamaño (51,7 M de parámetros) y su licencia apache-2.0, se puede reentrenar con `lerobot-train` sobre un dataset propio del mismo tipo de robot para adaptarlo a otra tarea.
- Pruebas de calibración de cámaras y del montaje: al depender de las claves de observación `gripperCam` y `bevCam`, es útil para validar que la disposición de cámaras y la calibración coinciden con las del entrenamiento antes de escalar a un modelo mayor.
- Investigación en aprendizaje por imitación: como caso de estudio de comportamiento clonado con acción fragmentada (chunking) y su sensibilidad al número de episodios y a la variabilidad de posiciones.
- Demostraciones educativas: ejemplo mínimo y ligero para explicar el ciclo teleoperación-datos-entrenamiento-despliegue en robótica con LeRobot, ejecutable en hardware de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la sección de evaluación vacía, con la nota "No evaluation results have been provided for this policy yet", por lo que no hay tasa de éxito, número de ensayos ni condiciones de prueba que se puedan citar. Tampoco se proporcionan métricas de pérdida de entrenamiento ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia aritmética, 51.668.614 parámetros ocupan aproximadamente 207 MB en fp32 y 103 MB en fp16, a lo que hay que sumar el coste de los dos backbones visuales y de los búferes de activaciones; la estimación completa no está documentada.
- GPU recomendadas: no disponible. Por el tamaño del modelo, cualquier GPU con soporte CUDA moderno debería ser suficiente, pero no se especifica ninguna recomendación oficial.
- Cabe en GPU de consumo: no confirmado de forma explícita, pero el tamaño de los pesos (por debajo de 0,3 GB) hace plausible su ejecución en GPU de consumo e incluso en CPU; se trata de una inferencia a partir del recuento de parámetros, no de un dato publicado.
- Opciones de despliegue: LeRobot, mediante `lerobot-rollout` para inferencia sobre el robot y `lerobot-train` para reentrenamiento; también se puede cargar directamente con PyTorch al estar en safetensors. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El único dato relacionado es la frecuencia de los datos de entrenamiento, 30 FPS, que marca el ritmo de control esperado.
- Otros requisitos: dos cámaras configuradas con las mismas claves de observación (`gripperCam`, `bevCam`) y resolución 480x640 a 30 FPS, el puerto del robot `so_follower` y la tarea declarada como cadena de texto en el comando de ejecución.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iso_gripper_leaderArm (ACT) | 51.668.614 | no aplica | sin evaluación publicada | apache-2.0 | Hugging Face, vía LeRobot |
| Diffusion Policy | no disponible | no aplica | no disponible | no disponible | implementación en LeRobot |
| SmolVLA | no disponible | no aplica | no disponible | no disponible | implementación en LeRobot |
| Otras políticas ACT de LeRobot | no disponible | no aplica | no disponible | variable según repositorio | Hugging Face |

No se dispone de datos verificables de parámetros, contexto ni rendimiento de las alternativas dentro de la información proporcionada, por lo que la comparación cuantitativa no es posible. La comparación relevante es cualitativa: ACT destaca por predecir chunks de acción y por su simplicidad y ligereza, mientras que alternativas como Diffusion Policy o los modelos visión-lenguaje-acción (SmolVLA, pi0) aportan mayor generalización entre tareas a costa de más parámetros y más requisitos de cómputo.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito publicada, ni número de ensayos, ni condiciones de prueba. No se puede afirmar que la política funcione de forma fiable en el robot real.
- Especialización extrema: está entrenada para una única tarea ("picking up forceps and placing them into a container") y un único montaje con robot `so_follower` y dos cámaras concretas. Fuera de ese escenario no hay garantía de comportamiento.
- Sensibilidad al montaje: cambios en la posición de las cámaras, la iluminación, el fondo, la posición inicial de los objetos o la calibración del robot pueden degradar el rendimiento de forma severa.
- Dataset pequeño: 91 episodios y 76.601 fotogramas. La diversidad de posiciones y condiciones es limitada, lo que favorece el sobreajuste a las condiciones de grabación.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe el equivalente en políticas de imitación: el modelo puede generar acciones plausibles pero incorrectas cuando se sale de la distribución de los datos de entrenamiento, sin ninguna señal de incertidumbre.
- Sesgos: pueden aparecer sesgos derivados de las posiciones, velocidades y estilo de teleoperación de la persona que grabó los datos; la política reproduce esas tendencias.
- Limitaciones de idioma: no aplica; el modelo no procesa texto salvo la cadena de tarea que se pasa como parámetro en la interfaz de LeRobot.
- Restricciones de licencia: apache-2.0 permite uso comercial, modificación y redistribución, con la obligación habitual de conservar el aviso de licencia y el archivo de cambios; conviene citar además LeRobot y el paper de ACT.
- Caveat de producción: al no existir evaluación publicada ni métricas de latencia, cualquier despliegue en un entorno real debería ir precedido de una validación propia con ensayos repetidos y condiciones variadas, además de medidas de seguridad física sobre el robot.
- Metadatos poco fiables: el repositorio tiene solo 8 descargas y 0 likes, y la fecha de creación registrada en el Hub es muy posterior a la de los modelos de referencia; conviene tratar el checkpoint como un experimento personal y no como una política validada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/charlieK123/iso_gripper_leaderArm
- Dataset de entrenamiento: https://huggingface.co/datasets/charlieK123/iso_gripper_leaderArm
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=charlieK123/iso_gripper_leaderArm
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
