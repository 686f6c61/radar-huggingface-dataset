# Riccardo11/smolvla_empty_insertion_box_dark_bright_light

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, orientado a control robótico mediante imitación. Esta ficha concreta, `Riccardo11/smolvla_empty_insertion_box_dark_bright_light`, es un fine-tuning de `lerobot/smolvla_base` realizado por un usuario independiente para una tarea específica de manipulación con un robot bimanual `bi_so_follower`: agarrar un cilindro azul en un entorno de caja de inserción con condiciones de iluminación variables (clara y oscura).

El modelo resuelve el problema de llevar un VLA preentrenado a una tarea concreta de laboratorio con pocos datos (161 episodios, 33.941 frames a 30 FPS). Su interés radica en que demuestra el flujo típico de fine-tuning de SmolVLA en LeRobot 0.6.1, con 50.000 pasos de entrenamiento y un total de 450 millones de parámetros, un tamaño que permite inferencia en hardware de consumo.

La relevancia actual es doble: por un lado, SmolVLA (paper arXiv:2506.01844) propone un VLA eficiente que compite con modelos mucho mayores en tareas de manipulación; por otro, este checkpoint es un ejemplo práctico de cómo un usuario puede adaptar la base a su robot, sus cámaras y su tarea en un único entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), transformer multimodal con política de imitación |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; el repo no documenta variantes GGUF/cuantizadas) |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tarea en inglés: "grasp the blue cylinder") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | bi_so_follower |
| Cámaras de entrada | front, left_wrist, right_wrist (3, 480, 640) |
| Entrada de estado | observation.state (12,) |
| Salida de acción | action (12,) |
| Dataset de entrenamiento | Riccardo11/merged_dark_and_bright_light (161 episodios, 33.941 frames, 30 FPS) |
| Tamaño del repo | 13,2 GB |
| Librería | lerobot |
| Pipeline | robotics |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones para producir comandos motores directamente a partir de observaciones multimodales (tres cámaras RGB más el estado articular) y una instrucción en lenguaje natural. El modelo base `lerobot/smolvla_base` se preentrena sobre datos de manipulación y luego se ajusta por imitación supervisada a la tarea concreta; en este caso, el fine-tuning se realizó con LeRobot 0.6.1 durante 50.000 pasos, batch de 32, optimizador AdamW, learning rate 1e-4 y semilla 1000.

El dataset de ajuste, `Riccardo11/merged_dark_and_bright_light`, contiene 161 episodios y 33.941 frames a 30 FPS, con dos variantes de la instrucción ("grasp the blue cylinder" y "Grasp the blue cylinder"), lo que sugiere una fusión de grabaciones en condiciones de iluminación clara y oscura. No se documenta en la model card el uso de RLHF/DPO ni innovaciones adicionales más allá de las propias del método SmolVLA descrito en el paper (arXiv:2506.01844), que enfatiza la eficiencia computacional y el despliegue en hardware de consumo.

## Capacidades

- Control robótico por imitación: genera acciones de 12 dimensiones para un robot bimanual `bi_so_follower` a partir de observaciones de estado y tres cámaras.
- Percepción visual multi-cámara: procesa simultáneamente vistas frontal, muñeca izquierda y muñeca derecha a resolución 480x640.
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica con un prompt de texto ("grasp the blue cylinder").
- Robustez a condiciones de iluminación: el dataset de entrenamiento fusiona escenas claras y oscuras, lo que sugiere cierta tolerancia a cambios de luz.
- Ejecución en bucle cerrado: la política se despliega en tiempo real mediante `lerobot-rollout` con `--strategy.type=base`.
- No dispone de tool calling, function calling, razonamiento multi-paso genérico ni capacidades de audio; es un modelo especializado en acción motora, no un LLM conversacional.

## Casos de uso

- Automatización de picking en laboratorio: el modelo ejecuta la tarea de agarrar un cilindro azul con un robot bimanual, adecuado para experimentos de manipulación repetitivos donde se quiere eliminar la programación manual de trayectorias.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para comparar variantes de SmolVLA, ya que la configuración de entrenamiento (50.000 pasos, batch 32, lr 1e-4, semilla 1000) está documentada.
- Evaluación de robustez ante iluminación: al haberse entrenado con datos claros y oscuros, permite estudiar la generalización de políticas VLA ante cambios de luz en entornos de caja de inserción.
- Prototipado rápido con LeRobot: un equipo puede clonar este checkpoint y desplegarlo con `lerobot-rollout` en un `bi_so_follower` para validar su pipeline de hardware y cámaras antes de grabar datos propios.
- Base para fine-tuning con datos propios: al ser un fine-tuning de `lerobot/smolvla_base` con licencia Apache 2.0, se puede reutilizar como inicialización para tareas similares de inserción o agarre.
- Docencia y demostraciones: su tamaño de 450 M de parámetros y su despliegue en hardware de consumo lo hacen apto para talleres y demos de robótica con VLA en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real ni de comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en safetensors (probablemente fp32/bf16), la inferencia requiere del orden de 2-4 GB de VRAM, aunque no está confirmado en la documentación.
- GPU recomendadas: no especificadas por el autor; SmolVLA se describe como desplegable en hardware de consumo, por lo que una RTX 4090 o superior es holgada, y GPUs de gama media podrían ser suficientes.
- Cabe en GPU de consumo: sí, según la descripción del método SmolVLA ("deployed on consumer-grade hardware"); no se detalla el modelo mínimo.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; el control se ejecuta a 30 FPS según la tasa del dataset, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (smolvla_empty_insertion_box_dark_bright_light) | 450 M | no disponible | Manipulación bimanual (agarrar cilindro azul) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la información | no disponible | VLA base para fine-tuning | no disponible en la información | Hugging Face |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Imitación robótica | no disponible | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea "grasp the blue cylinder" con un robot `bi_so_follower` y tres cámaras concretas; no generaliza a otras tareas, objetos ni configuraciones de hardware.
- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real, por lo que su fiabilidad en producción es desconocida.
- Dependencia del entorno: el nombre del checkpoint sugiere condiciones de caja de inserción con luz clara y oscura; cambios en posiciones de objetos, distractores o iluminación no cubiertos pueden degradar el rendimiento.
- Riesgo de sobreajuste: 161 episodios y 50.000 pasos de entrenamiento con batch 32 pueden provocar sobreajuste al dataset; no se documenta validación.
- Idioma: las instrucciones están en inglés y con dos capitalizaciones distintas; no se garantiza comportamiento con otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías; el modelo base y el dataset deben verificarse por separado.
- Tamaño del repo: 13,2 GB, lo que incluye probablemente checkpoints y artefactos de entrenamiento; conviene revisar qué se descarga antes de desplegar.
- Sin soporte de cuantización documentado: no hay variantes GGUF ni instrucciones para reducir precisión, lo que limita optimizaciones de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Riccardo11/smolvla_empty_insertion_box_dark_bright_light
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Riccardo11/merged_dark_and_bright_light
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Riccardo11/merged_dark_and_bright_light
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
