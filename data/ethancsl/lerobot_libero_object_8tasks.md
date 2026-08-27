# ethanCSL/lerobot_libero_object_8tasks

## Resumen

El modelo `ethanCSL/lerobot_libero_object_8tasks` es un Vision-Language-Action (VLA) compacto y eficiente, desarrollado por ethanCSL sobre la arquitectura SmolVLA (paper arXiv:2506.01844). Está diseñado para tareas de manipulación robótica, concretamente para el benchmark LIBERO-Object, donde el robot debe mover y colocar objetos según instrucciones en lenguaje natural. Su tamaño de 450 millones de parámetros lo hace apto para despliegue en hardware de consumo, lo que contrasta con modelos VLA de mayor escala como OpenVLA (7B) o RT-2 (55B).

El modelo se ha entrenado y subido al hub mediante el framework LeRobot, usando el dataset `ethanCSL/lerobot_libero_object_8tasks` (8 tareas del suite LIBERO-Object). Su licencia Apache 2.0 permite uso comercial y modificación sin restricciones. Aunque la ficha oficial no detalla el proceso de entrenamiento ni benchmarks específicos, la arquitectura SmolVLA está documentada en el paper asociado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (Vision-Language-Action) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo con pesos safetensors) |
| Idiomas soportados | no disponible (instrucciones del benchmark LIBERO en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura compacta que combina un codificador de visión (ViT) con un modelo de lenguaje (SmolLM) para generar acciones de control del robot de forma autoregresiva. El modelo recibe una secuencia de imágenes y una instrucción textual, y produce la trayectoria de acciones del efector final (posición y orientación). Se entrena mediante aprendizaje por imitación, típicamente con datasets de demostraciones humanas o teleoperadas.

El modelo aquí presentado se entrenó con LeRobot sobre el dataset `ethanCSL/lerobot_libero_object_8tasks`, que contiene 8 tareas de manipulación del benchmark LIBERO-Object (p. ej., "pick up the black bowl and place it on the plate"). No se han publicado detalles sobre el número de tokens de entrenamiento, composición exacta del dataset ni el uso de técnicas como RLHF o DPO. La arquitectura base está descrita en el paper de SmolVLA (arXiv:2506.01844).

## Capacidades

- **Control de acciones robóticas**: genera posiciones y orientaciones del efector final (6-DOF) para tareas de manipulación.
- **Comprensión de instrucciones en lenguaje natural**: interpreta comandos como "pick up the red block and place it on the shelf".
- **Razonamiento espacial**: localiza y distingue objetos por color, forma y posición en la escena.
- **Integración con LeRobot**: compatible con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales (p. ej., SO-100).
- **Ejecución multi-turno**: puede ejecutar tareas de varias etapas si se le dan instrucciones secuenciales.
- **No soporta**: conversación general, generación de texto libre, ni tareas fuera del dominio de manipulación robótica.

## Casos de uso

- **Automatización de pick-and-place en entornos controlados**: el modelo puede gestionar la selección y colocación de objetos en líneas de montaje o almacenes, dado que entiende instrucciones de alto nivel y genera trayectorias de 6-DOF.
- **Evaluación de políticas de aprendizaje por imitación**: es útil para investigadores que comparan VLAs en el benchmark LIBERO-Object, ya que se integra directamente con LeRobot y permite reproducir experimentos con métricas estandarizadas.
- **Prototipado de robots de bajo coste**: con 450M parámetros, se puede ejecutar en GPU de consumo (p. ej., RTX 3060), facilitando pruebas en robots asequibles como SO-100 o SO-200.
- **Transferencia de conocimiento en tareas de manipulación**: dado que LIBERO está diseñado para estudiar la transferencia entre tareas, el modelo sirve para experimentos de meta-aprendizaje o lifelong learning en robótica.
- **Entrenamiento de políticas en simulación**: se puede usar en entornos simulados (p. ej., MuJoCo) para validar algoritmos antes de trasladarlos a hardware real, reduciendo costes y riesgos.
- **Investigación en VLA compactos**: es un punto de partida para comparar el rendimiento de modelos ligeros frente a VLAs grandes (OpenVLA, RT-2) en tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo se entrenó en el benchmark LIBERO-Object, pero no se especifican tasas de éxito ni comparativas con otros modelos en la model card. El paper de SmolVLA (arXiv:2506.01844) reporta rendimiento competitivo en LIBERO, pero los datos concretos de esta variante con 8 tareas no están disponibles.

## Requisitos de hardware

- **VRAM estimada**: con 450M parámetros, en FP16 se necesitan ~0.9 GB solo de pesos; con entrada de imágenes y buffer de acciones, se recomienda al menos 2 GB de VRAM para inferencia en tiempo real.
- **GPU recomendadas**: NVIDIA GTX 1650 (4 GB), RTX 3060 (12 GB), RTX 4090 (24 GB). Cabe en GPUs de consumo y en la mayoría de equipos de desarrollo.
- **Despliegue**: se integra con el framework LeRobot (Python/PyTorch). No hay soporte nativo para vLLM u Ollama, ya que el modelo genera acciones y no texto.
- **Latencia y throughput**: no se dispone de datos medidos; al ser un modelo compacto, se espera inferencia en tiempo real (>10 Hz) en una GPU moderna, pero no hay cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (este) | 450M | VLA (ViT + SmolLM) | no disponible | Apache 2.0 | HuggingFace |
| OpenVLA | 7B | VLA (LLaMA-2 + ViT) | 2048 tokens | MIT | HuggingFace |
| RT-2 | 55B | VLM (PaLI-X) | 4096 tokens | Propietaria | no abierto |
| ACT | 3.6M | Transformer (acción) | no aplica | MIT | GitHub |

SmolVLA es notablemente más ligero que OpenVLA (7B) y RT-2 (55B), lo que permite ejecutarlo en hardware de consumo. Aunque OpenVLA ofrece mayor capacidad de razonamiento, SmolVLA compensa con menor latencia y requisitos de memoria, ideal para robots con recursos limitados. ACT es una alternativa puramente de acción sin comprensión de lenguaje, menos flexible.

## Limitaciones y advertencias

- **Entrenamiento limitado a 8 tareas**: el modelo solo ha visto tareas de LIBERO-Object; no generaliza a otros objetos, escenarios o instrucciones fuera de ese conjunto.
- **Dominio simulado**: las tareas LIBERO se realizan en simulación; puede haber discrepancia al trasladar a entornos reales (gap sim2real).
- **Riesgo de alucinación**: aunque es un modelo de acción, puede interpretar incorrectamente instrucciones ambiguas o con objetos no visibles, generando trayectorias inválidas.
- **Idioma**: no se especifica soporte multilingüe; las instrucciones están en inglés, por lo que no funcionará con comandos en otros idiomas.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo base SmolVLA y el dataset LIBERO pueden tener restricciones adicionales; es necesario revisar las licencias de los componentes.
- **Sin soporte de conversación**: no es un chatbot ni un asistente; solo genera acciones de robot, no texto.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/ethanCSL/lerobot_libero_object_8tasks)
- [Paper SmolVLA](https://huggingface.co/papers/2506.01844)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio LIBERO](https://github.com/Lifelong-Robot-Learning/LIBERO)
- [Guía de entrenamiento de LeRobot](https://huggingface.co/docs/lerobot/il_robots)
