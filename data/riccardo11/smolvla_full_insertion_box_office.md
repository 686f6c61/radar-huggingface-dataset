# Riccardo11/smolvla_full_insertion_box_office

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante imitación a partir de demostraciones. Esta ficha concreta, `Riccardo11/smolvla_full_insertion_box_office`, es un fine-tuning del checkpoint base `lerobot/smolvla_base` sobre un dataset propio de 81 episodios y 14.444 fotogramas a 30 FPS, orientado a la tarea "grasp the blue cylinder" con un robot bimanual `bi_so_follower` y tres cámaras (frontal y dos muñecas).

El modelo resuelve el problema de llevar políticas VLA a hardware asequible: con 450 millones de parámetros y pesos en safetensors, está pensado para inferencia en tiempo real en GPUs de consumo, algo que modelos VLA de mayor escala no permiten. Su relevancia actual radica en que demuestra el flujo completo de LeRobot (grabación de datos, entrenamiento por imitación, despliegue con `lerobot-rollout`) sobre una tarea de manipulación concreta.

Es importante subrayar que se trata de una política específica de tarea y de robot, no de un modelo generalista: las observaciones esperadas son un vector de estado de 12 dimensiones y tres imágenes de 480x640, y la salida es un vector de acción de 12 dimensiones. No hay información publicada sobre idiomas, benchmarks ni evaluación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, según el paper SmolVLA (arXiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de texto general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Modelo base | `lerobot/smolvla_base` (fine-tune) |
| Tipo de robot | `bi_so_follower` |
| Cámaras de entrada | `front`, `left_wrist`, `right_wrist` (3, 480, 640) |
| Estado de observación | `(12,)` |
| Salida de acción | `(12,)` |
| Tamaño del repositorio | 13,2 GB |
| Descargas | 29 |
| Likes | 0 |

## Arquitectura y entrenamiento

SmolVLA es una política VLA compacta que combina un codificador visual y de lenguaje con un cabezal de acciones, siguiendo el diseño descrito en el paper arXiv:2506.01844. El modelo consume tres flujos de imagen (cámara frontal y dos cámaras de muñeca) junto con el estado propioceptivo del robot (12 dimensiones) y emite directamente un vector de acción de 12 dimensiones, sin pasos intermedios de planificación explícita. El checkpoint base `lerobot/smolvla_base` se fine-tunea con el pipeline de imitación de LeRobot.

El fine-tuning de esta ficha se realizó sobre el dataset `Riccardo11/full_insertion_box_blue_cylinder_office`: 81 episodios, 14.444 fotogramas a 30 FPS, con la instrucción de tarea "grasp the blue cylinder". La configuración de entrenamiento reportada es de 50.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-4, semilla 1000 y LeRobot 0.6.1. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del corpus del modelo base, ni si hubo etapas de RLHF o DPO.

## Capacidades

- Control robótico por imitación: genera acciones de 12 dimensiones para un robot bimanual `bi_so_follower` a partir de observaciones visuales y propioceptivas.
- Fusión multimodal: integra tres cámaras simultáneas (frontal, muñeca izquierda, muñeca derecha) con el estado del robot.
- Ejecución condicionada por tarea: acepta una instrucción en lenguaje natural (`--task="grasp the blue cylinder"`) que condiciona la política.
- Despliegue en hardware de consumo: el tamaño de 450 M de parámetros está pensado para inferencia en GPUs asequibles.
- Integración con LeRobot: entrenamiento y ejecución mediante `lerobot-train` y `lerobot-rollout`.
- No se ha documentado soporte de tool calling, function calling, razonamiento multi-paso, ni capacidades de visión general más allá del uso como entrada de política.

## Casos de uso

- Manipulación de picking en laboratorio: la política ejecuta la tarea de agarre del cilindro azul sobre el montaje `bi_so_follower` con el que fue entrenada, sirviendo como referencia reproducible para validar un pipeline de imitación completo.
- Prototipado rápido de nuevas tareas: partiendo de `lerobot/smolvla_base`, un equipo puede grabar 80-100 episodios de una tarea nueva y fine-tunear con los mismos hiperparámetros (50k pasos, batch 32, lr 1e-4) para obtener una política funcional en pocas horas de GPU.
- Investigación en aprendizaje por imitación: el repositorio y el dataset público permiten reproducir el entrenamiento y analizar el efecto del número de episodios, la posición de cámaras o la variabilidad de la tarea.
- Benchmark interno de políticas VLA: al ser un modelo de 450 M de parámetros, sirve como línea base de bajo coste frente a políticas VLA mayores en experimentos de comparación.
- Despliegue en estaciones de robótica con GPU de consumo: permite ejecutar la política en un PC con una RTX de gama media conectado al robot, sin depender de clústeres.
- Educación y formación: el flujo LeRobot completo (grabar, entrenar, desplegar) con un modelo pequeño y una licencia permisiva facilita su uso en cursos y talleres de robótica.
- Generación de datos sintéticos de evaluación: la política puede ejecutarse de forma indefinida (`--duration` omitido) para recoger trayectorias y estudiar derivas o fallos del controlador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en precisión completa (fp32) el peso ocupa aproximadamente 1,8 GB, y en fp16/bf16 alrededor de 0,9 GB, a lo que hay que sumar el coste de procesar tres imágenes de 480x640 por paso.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, una GPU de consumo con 8 GB o más de VRAM debería ser suficiente para inferencia en fp16, aunque no hay confirmación del autor.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo, pero el dato no está verificado en la model card.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` para ejecución sin grabación; el ecosistema LeRobot es la vía documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La política se ejecuta a 30 FPS en la captura de datos, pero no se publica la frecuencia de inferencia alcanzada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Riccardo11/smolvla_full_insertion_box_office` | 450 M | VLA fine-tune para tarea de agarre | no disponible | Apache 2.0 | Hugging Face, 29 descargas |
| `lerobot/smolvla_base` | no disponible en la información | VLA base preentrenada | no disponible | no disponible en la información | Hugging Face (modelo base) |
| `Riccardo11/smolvla_empty_insertion_box_office` | no disponible en la información | VLA fine-tune (variante del mismo autor) | no disponible | no disponible en la información | Hugging Face (referenciado en la model card) |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Política específica de tarea y robot: solo se ha entrenado para "grasp the blue cylinder" con el robot `bi_so_follower` y las tres cámaras indicadas; no generaliza a otras tareas, objetos ni configuraciones de cámara.
- Sin evaluación publicada: la model card declara que no hay resultados de éxito en robot real, por lo que se desconoce la tasa de acierto.
- Dataset pequeño: 81 episodios y 14.444 fotogramas limitan la robustez ante cambios de iluminación, posiciones de objeto o distractores.
- Riesgo de sobreajuste al entorno: el nombre del dataset sugiere un montaje de oficina concreto; el rendimiento fuera de ese entorno es incierto.
- Idiomas: no hay información sobre capacidades lingüísticas; la instrucción de tarea es en inglés y no se documenta soporte multilingüe.
- Sesgos: no se han documentado sesgos específicos, pero al ser un modelo entrenado con demostraciones humanas puede heredar sesgos de las trayectorias del operador.
- Licencia Apache 2.0: permisiva para uso comercial, pero el usuario debe verificar las licencias del modelo base y del dataset subyacente.
- Repositorio de 13,2 GB: el tamaño incluye probablemente checkpoints y artefactos de entrenamiento; conviene revisar qué se descarga antes de integrarlo en producción.
- Fecha de creación indicada como 2026-10-31: dato anómalo en los metadatos que conviene contrastar antes de citar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Riccardo11/smolvla_full_insertion_box_office
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Riccardo11/full_insertion_box_blue_cylinder_office
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Riccardo11/full_insertion_box_blue_cylinder_office
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Variante del mismo autor: https://huggingface.co/Riccardo11/smolvla_empty_insertion_box_office
