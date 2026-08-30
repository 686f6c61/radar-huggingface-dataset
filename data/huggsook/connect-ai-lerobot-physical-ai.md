# huggsook/connect-ai-lerobot-physical-ai

## Resumen

El modelo `connect-ai-lerobot-physical-ai` es una suite de políticas de aprendizaje por imitación para robótica física, desarrollada bajo la iniciativa connect-ai por el usuario huggsook. Está construida sobre el framework LeRobot de Hugging Face y está diseñada para resolver tareas de manipulación en entornos simulados, concretamente dos entornos clásicos: PushT (manipulación 2D de precisión) y ALOHA (manipulación bimanual 3D). El modelo combina dos arquitecturas de política: ACT Transformer para tareas bimanuales y Diffusion Policy con codificador visual ResNet-18 para tareas de empuje. El repositorio incluye políticas entrenadas, scripts de evaluación en tiempo real y un estudio web interactivo para visualizar los resultados.

El modelo tiene 262.709.062 parámetros (según los pesos safetensors) y un tamaño de repositorio de 1,1 GB. No es un modelo de lenguaje, sino un modelo de control para robótica, por lo que no tiene longitud de contexto ni soporte de idiomas en el sentido tradicional. Su relevancia radica en que demuestra la viabilidad de aplicar técnicas de imitación y difusión a problemas de control continuo, con resultados cuantificados en términos de recompensa y éxito en simulaciones MuJoCo y PyMunk. La licencia Apache 2.0 permite uso comercial y modificación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT Transformer (para ALOHA) y Diffusion Policy con ResNet-18 (para PushT) |
| Parametros totales | 262.709.062 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica, es un modelo de control) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo integra dos arquitecturas de política distintas según la tarea. Para el entorno ALOHA (manipulación bimanual 3D) se utiliza un transformer ACT (Action Chunking with Transformers) con un tamaño de chunk de 100 pasos, que procesa observaciones de cámara RGB de 480x640 y estado articular de 14 grados de libertad (DoF), generando acciones de 14-DoF. Para el entorno PushT (manipulación 2D) se emplea una Diffusion Policy con un codificador visual ResNet-18 y un UNet de denoising de 100 pasos, que recibe imágenes RGB de 96x96 y la posición del agente (x, y), y produce acciones 2D. Ambas políticas incorporan temporal ensembling con un factor lambda de 0,01 para suavizar las acciones y reducir el jitter en la ejecución.

No se proporcionan datos sobre el conjunto de entrenamiento, el número de tokens o el proceso de optimización (RLHF, DPO, etc.). El modelo se entrena mediante aprendizaje por imitación, pero los detalles específicos del dataset y el procedimiento de entrenamiento no están disponibles en la información publicada. La implementación se apoya en el framework LeRobot v0.6.2 y utiliza MuJoCo para simulación 3D y PyMunk para simulación 2D.

## Capacidades

- Control de manipulación bimanual en 3D: el modelo puede ejecutar tareas de transferencia de objetos entre dos brazos robóticos (handover) y de inserción de piezas (peg-in-hole) con precisión submilimétrica.
- Manipulación 2D de precisión: es capaz de empujar un bloque con forma de T hasta una pose objetivo con alta exactitud, como se demuestra en el entorno PushT.
- Generación de acciones continuas de alta frecuencia: las políticas ACT alcanzan 52,88 FPS en la tarea de transferencia y 47,20 FPS en inserción, lo que permite control en tiempo real.
- Integración con simulación física: funciona con MuJoCo (3D) y PyMunk (2D), lo que facilita la evaluación y el desarrollo de pipelines de robótica.
- Visualización y teleoperación: incluye un servidor web que permite inspeccionar dinámicas de pérdida, sandboxes de teleoperación y galerías de vídeo.
- Reproducibilidad: se proporcionan scripts de línea de comandos para ejecutar rollouts en los tres entornos (PushT, ALOHA transfer, ALOHA insertion).

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo sirve como punto de partida para estudiar técnicas de ACT y Diffusion Policy en tareas de manipulación, permitiendo comparar arquitecturas y hiperparámetros en entornos estandarizados.
- Desarrollo de controladores para robots bimanuales: la política ACT entrenada para ALOHA puede transferirse a robots reales de doble brazo, siempre que se adapten las observaciones y el espacio de acción, para tareas de ensamblaje o manipulación de objetos.
- Prototipado rápido de sistemas de control en simulación: los scripts de rollout permiten validar rápidamente si una política es adecuada para una tarea concreta antes de invertir en hardware físico.
- Generación de datos sintéticos para entrenamiento: al ejecutar la política en simulación, se pueden generar trayectorias de demostración que luego se utilizan para entrenar otros modelos o para aumentar datasets existentes.
- Educación y formación en robótica: el estudio web interactivo y los vídeos de demostración facilitan la comprensión de conceptos como temporal ensembling, chunking de acciones y políticas de difusión en un contexto práctico.
- Benchmarking de algoritmos de control: los entornos PushT y ALOHA son estándar en la comunidad; este modelo proporciona una línea base con métricas de recompensa y éxito que pueden compararse con otros enfoques.

## Benchmarks y rendimiento

Los resultados oficiales declarados en el model-index son los siguientes:

| Tarea | Métrica | Valor |
|---|---|---|
| ALOHA 3D Transfer Cube | Handover Success Reward (mean_reward) | 8,0 |
| PushT 2D Block Precision | Alignment Reward (mean_reward) | 66,7 |

Además, la model card del autor reporta métricas adicionales no verificadas de forma independiente:

| Entorno | Tasa de éxito | FPS de inferencia |
|---|---|---|
| ALOHA Transfer Cube | 100% handover | 52,88 |
| PushT Manipulation | 96,5% alineación | 2,10 |
| ALOHA Peg Insertion | 84,0% inserción | 47,20 |

Estos valores provienen de las declaraciones del autor y no han sido verificados por terceros. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- No se especifican requisitos oficiales de VRAM ni de GPU en la documentación del modelo.
- Dado el tamaño de los pesos (262M parámetros, 1,1 GB en safetensors), se estima que la inferencia puede ejecutarse en GPUs de consumo con al menos 4-6 GB de VRAM, aunque esta es una estimación orientativa no confirmada por el autor.
- El modelo está diseñado para ejecutarse en entornos de simulación (MuJoCo, PyMunk) y puede funcionar en CPU, aunque con menor rendimiento. La model card menciona soporte para Apple Silicon (MPS) y CUDA.
- Para las tareas ALOHA, que requieren mayor resolución de imagen (480x640), se recomienda una GPU con suficiente memoria para el procesamiento visual.
- Opciones de despliegue: el repositorio incluye scripts Python (`run_simulation.py`) y un servidor web (`server.py`). No se mencionan integraciones con vLLM, llama.cpp u otros motores de inferencia, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han encontrado referencias a otros modelos de política para robótica con los que se pueda establecer una comparación directa en términos de parámetros, rendimiento o licencia. Por tanto, esta sección queda sin datos disponibles.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para entornos simulados específicos (PushT y ALOHA) y no se ha validado en hardware robótico real. La transferencia a robots físicos requeriría adaptación y calibración adicionales.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente. Las métricas de éxito y FPS pueden variar en otras condiciones de ejecución.
- No se proporcionan detalles sobre el dataset de entrenamiento, por lo que se desconoce la diversidad de las demostraciones y la posible presencia de sesgos en las políticas aprendidas.
- Al ser un modelo de control, no presenta riesgos de alucinación ni problemas de lenguaje, pero sí puede generar acciones inseguras si se utiliza sin supervisión en entornos reales.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario asegurarse de que las dependencias (LeRobot, MuJoCo, PyMunk) cumplen con sus propias licencias.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente o poco difundido; se recomienda verificar la calidad y reproducibilidad antes de usarlo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggsook/connect-ai-lerobot-physical-ai
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Noticia sobre colaboración NVIDIA-Hugging Face en LeRobot: https://zglg.work/en/ai/news/2026-07-07-nvidia-and-hugging-face-bring-new-models-and-frameworks-to-lerobot-for-open-r
- Artículo sobre LeRobot y la revolución de la IA física: https://www.startuphub.ai/ai-news/ai-video/2025/hugging-faces-lerobot-ignites-physical-ai-revolution
