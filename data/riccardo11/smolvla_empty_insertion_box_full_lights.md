# Riccardo11/smolvla_empty_insertion_box_full_lights

## Resumen

`Riccardo11/smolvla_empty_insertion_box_full_lights` es una política de visión-lenguaje-acción (VLA) compacta, resultado del ajuste fino del modelo base `lerobot/smolvla_base` sobre el dataset `Riccardo11/empty_insertion_box_blue_cylinder_all_lights`. La desarrolla el usuario Riccardo11 y se publica en Hugging Face bajo licencia Apache 2.0, con 450.046.176 parámetros en formato safetensors. Está pensada para controlar un robot bimanual del tipo `bi_so_follower` equipado con tres cámaras (frontal, muñeca izquierda y muñeca derecha), consumiendo observaciones multimodales y emitiendo acciones de 12 dimensiones.

El modelo resuelve la tarea concreta de agarre de un cilindro azul ("grasp the blue cylinder") en un escenario de inserción en caja vacía con iluminación variada. Se enmarca en el ecosistema LeRobot de Hugging Face, que proporciona las herramientas de entrenamiento, evaluación y despliegue en robot real. Su relevancia radica en que SmolVLA está diseñado para ejecutarse en hardware de consumo, lo que democratiza la experimentación con políticas VLA sin necesidad de clústeres de GPU.

La información disponible es limitada: la model card no incluye resultados de evaluación en robot real ni benchmarks cuantitativos, y el repositorio no registra descargas ni interacciones. Esta ficha se basa exclusivamente en los metadatos del repositorio, la model card y el paper de referencia (arXiv:2506.01844).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), transformer multimodal con codificador visual y decodificador de acciones |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés: "grasp the blue cylinder") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot 0.6.1 |
| Tipo de robot | `bi_so_follower` (bimanual) |
| Cámaras | `front`, `left_wrist`, `right_wrist` (3 × 480 × 640) |
| Dimensión de observación de estado | 12 |
| Dimensión de acción | 12 |
| Modelo base | `lerobot/smolvla_base` |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura VLA compacta que combina un codificador visual y lingüístico con un decodificador de acciones, diseñada para inferencia eficiente en hardware de consumo. El modelo consume tres flujos visuales de 480 × 640 píxeles junto con un vector de estado de 12 dimensiones, y produce un vector de acción de 12 dimensiones que controla el robot bimanual `bi_so_follower`. La model card no detalla la composición interna de capas ni el mecanismo de atención, por lo que no se dispone de información adicional sobre innovaciones arquitectónicas específicas más allá de lo descrito en el paper de SmolVLA.

El ajuste fino se realizó sobre el dataset `Riccardo11/empty_insertion_box_blue_cylinder_all_lights`, compuesto por 242 episodios y 47.523 fotogramas a 30 FPS, con las tareas "grasp the blue cylinder" y "Grasp the blue cylinder". La configuración de entrenamiento fue de 50.000 pasos, batch size 32, optimizador AdamW, learning rate 0,0001 y semilla 1000, usando LeRobot 0.6.1. No se especifica en la información disponible si hubo RLHF, DPO ni la composición exacta del dataset más allá de los episodios y fotogramas indicados.

## Capacidades

- Control robótico de imitación: genera acciones de 12 dimensiones para un robot bimanual a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa simultáneamente imágenes frontal y de ambas muñecas a 480 × 640.
- Comprensión de instrucciones en lenguaje natural: la tarea se especifica mediante texto ("grasp the blue cylinder").
- Ejecución de tareas de manipulación: agarre de objetos (cilindro azul) en un escenario de inserción en caja.
- Despliegue en hardware de consumo: según el paper de SmolVLA, está diseñado para ejecutarse en GPUs de gama consumer.
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`.
- No se dispone de información sobre soporte de tool calling, agentes multi-paso, capacidades multilingües amplias ni modos de razonamiento explícito.

## Casos de uso

- **Automatización de pick-and-place en laboratorio**: el modelo se usa para que un robot bimanual agarre un cilindro azul y lo inserte en una caja, con la instrucción de tarea pasada como texto. Es adecuado por su entrenamiento específico sobre 242 episodios de esa tarea.
- **Investigación en imitación visual-motora**: sirve como política de referencia para experimentar con SmolVLA y LeRobot, permitiendo reproducir el pipeline de entrenamiento con `lerobot-train` y evaluar variaciones de iluminación.
- **Prototipado rápido de políticas VLA en hardware de consumo**: al estar basado en SmolVLA, puede desplegarse en estaciones de trabajo con GPU consumer, lo que facilita iteraciones sin infraestructura de clúster.
- **Evaluación de robustez ante cambios de iluminación**: el dataset incluye "all lights", por lo que el modelo es un candidato para estudiar cómo afecta la iluminación variable al éxito del agarre.
- **Docencia y formación en robótica de manipulación**: el repositorio incluye comandos de despliegue y entrenamiento que permiten usarlo como ejemplo práctico en cursos de aprendizaje por imitación.
- **Base para ajuste fino en tareas de inserción**: al partir de `lerobot/smolvla_base`, puede reentrenarse con nuevos datasets de inserción para adaptarlo a otras geometrías de caja u objetos.
- **Integración en pipelines de evaluación con LeRobot**: se puede ejecutar con `lerobot-rollout` durante 60 segundos para medir comportamiento en robot real, aunque no hay tasas de éxito publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible en la información proporcionada. Con 450 millones de parámetros, una estimación orientativa en FP16 sería de aproximadamente 0,9 GB solo para pesos, más el coste de los tres flujos visuales de 480 × 640; sin embargo, no se confirma en la documentación.
- **GPU recomendadas**: no disponible. El paper de SmolVLA indica que está pensado para hardware de consumo, pero la model card no especifica modelos concretos.
- **Compatibilidad con GPU consumer**: según la descripción del paper, SmolVLA puede desplegarse en hardware de consumo; no se detalla qué tarjetas concretas.
- **Opciones de despliegue**: LeRobot mediante `lerobot-rollout` con `--policy.path=Riccardo11/smolvla_empty_insertion_box_full_lights`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- **Latencia y throughput**: no disponible. La model card no reporta métricas de latencia ni frecuencia de control efectiva.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Riccardo11/smolvla_empty_insertion_box_full_lights` | 450 M | no disponible | Agarre de cilindro azul con robot bimanual | Apache 2.0 | Hugging Face |
| `lerobot/smolvla_base` | no disponible en esta ficha | no disponible | Política VLA base para ajuste fino | no disponible en esta ficha | Hugging Face |
| Políticas ACT de LeRobot | no disponible | no disponible | Imitación visual-motora | no disponible | Hugging Face / LeRobot |
| Políticas Diffusion Policy de LeRobot | no disponible | no disponible | Imitación visual-motora | no disponible | Hugging Face / LeRobot |

La comparación cuantitativa con alternativas no está disponible porque no se han publicado resultados de evaluación de esta política ni de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- **Sin evaluación publicada**: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad fuera del conjunto de entrenamiento.
- **Alta especificidad de tarea**: entrenada únicamente para "grasp the blue cylinder" en un escenario de caja de inserción; no generaliza a otras tareas sin ajuste fino.
- **Dependencia de la configuración de hardware**: requiere un robot `bi_so_follower` y tres cámaras con nombres `front`, `left_wrist` y `right_wrist`; cualquier cambio de montaje o calibración puede degradar el rendimiento.
- **Riesgo de sobreajuste al dataset**: 242 episodios y 47.523 fotogramas son un volumen modesto; la variabilidad de posiciones, iluminación y distractores no está documentada.
- **Idioma**: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- **Licencia Apache 2.0**: permite uso comercial, pero el autor no ofrece garantías ni soporte; el usuario asume el riesgo de despliegue.
- **Sin datos de sesgos**: no se ha documentado ningún análisis de sesgos visuales o de comportamiento.
- **Repositorio sin tracción**: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Riccardo11/smolvla_empty_insertion_box_full_lights
- Dataset de entrenamiento: https://huggingface.co/datasets/Riccardo11/empty_insertion_box_blue_cylinder_all_lights
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Riccardo11/empty_insertion_box_blue_cylinder_all_lights
