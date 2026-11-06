# ResidentEvian/act_50_episodes_static_pos

## Resumen

`ResidentEvian/act_50_episodes_static_pos` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada en Hugging Face Hub mediante la librería LeRobot. No es un modelo de lenguaje: es un modelo visomotor que, a partir del estado de las articulaciones (vector de 6 dimensiones) y dos cámaras RGB de 480x640 (vista superior y vista de muñeca), predice directamente un vector de acción de 6 dimensiones para un robot seguidor de tipo `so_follower`.

El modelo ha sido entrenado sobre un único dataset de 50 episodios teleoperados (16.789 fotogramas a 30 FPS) para una tarea concreta: coger un cubo azul y depositarlo en una caja naranja. Con 51.668.614 parámetros y un repositorio de apenas 0,2 GB, es un modelo pequeño y especializado, pensado para ejecutarse en tiempo real en el ordenador que controla el robot, no para despliegue en servidores de inferencia de texto.

Su relevancia es la de un ejemplo reproducible de flujo completo de aprendizaje por imitación con LeRobot 0.6.1: desde la grabación de demostraciones hasta el entrenamiento (20.000 pasos, batch 8, AdamW, LR 1e-5) y el despliegue con `lerobot-rollout`. La licencia Apache 2.0 y la ausencia de resultados de evaluación publicados condicionan su uso a experimentación y no a producción sin validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones por chunks |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política visomotora, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión original; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la instrucción de tarea es una cadena fija) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice chunks de acciones (varias acciones futuras de golpe) en lugar de un único paso, lo que reduce el error de acumulación y suaviza la ejecución. La política consume `observation.state` con forma `(6,)` y dos imágenes `observation.images.top` y `observation.images.wrist` de `(3, 480, 640)`, y produce `action` con forma `(6,)`. El modelo usa LeRobot 0.6.1 y el robot objetivo es `so_follower` con dos cámaras (top y wrist).

El entrenamiento se realizó sobre el dataset `ResidentEvian/blue-cube-into-box_20261015_112154`: 50 episodios, 16.789 fotogramas a 30 FPS, con la tarea "Grab the blue cube and put it in the orange box". La configuración fue de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni aumentos de datos; se trata de imitación supervisada pura sobre teleoperación. El nombre del repo (`static_pos`) sugiere posiciones estáticas de los objetos en la recogida de datos, aunque el autor no lo detalla explícitamente.

## Capacidades

- Manipulación robótica visomotora: predicción de acciones de 6 dimensiones para un robot `so_follower` a partir de estado articular y dos cámaras.
- Ejecución de una tarea concreta de pick-and-place: coger un cubo azul y meterlo en una caja naranja.
- Fusión de dos vistas (superior y de muñeca) para localizar objeto y destino.
- Generación de chunks de acción para ejecución fluida en tiempo real a 30 FPS.
- Integración con el ecosistema LeRobot: entrenamiento, rollout y visualización de datasets mediante CLI.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Automatización de pick-and-place en línea de laboratorio: el modelo recibe el estado articular y las dos cámaras y emite acciones de 6 dimensiones para depositar un cubo en una caja, adecuado para tareas repetitivas de clasificación con objetos de color fijo.
- Banco de pruebas de aprendizaje por imitación: sirve como referencia reproducible para validar un pipeline LeRobot completo (grabación, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) antes de escalar a tareas propias.
- Prototipado rápido de políticas con pocos datos: con solo 50 episodios y 16.789 fotogramas, permite evaluar si la tarea es aprendible con teleoperación mínima antes de invertir en más demos.
- Docencia y formación en robótica: ejemplo didáctico de ACT con configuración explícita (20.000 pasos, batch 8, LR 1e-5) para explicar el efecto de los hiperparámetros en una política visomotora.
- Base para fine-tuning en tareas similares: al estar en safetensors y licencia Apache 2.0, puede reentrenarse sobre un dataset propio de pick-and-place con el mismo robot y cámaras.
- Evaluación de robustez ante cambios de posición: útil para medir la degradación de una política entrenada con posiciones estáticas cuando se varía la colocación de objetos, iluminación o distractores.
- Integración en entornos de simulación o gemelos digitales: la interfaz de observación/acción es explícita y permite conectar la política a un simulador compatible con el formato LeRobot para pruebas previas al robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, número de ensayos ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en FP32 los pesos ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más, incluyendo las cámaras y buffers.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU NVIDIA con soporte CUDA es suficiente; el entrenamiento se realizó con `--policy.device=cuda`.
- ¿Cabe en GPU consumer? Sí, por tamaño (0,2 GB de pesos); el cuello de botella real es el procesamiento de dos streams de vídeo a 480x640 y 30 FPS, no la memoria.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. La tarea se ejecuta a 30 FPS según la tasa del dataset, pero no se publican mediciones de latencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ResidentEvian/act_50_episodes_static_pos | 51,7 M | no aplica | Pick-and-place cubo azul en caja naranja, robot so_follower | Apache 2.0 | Hugging Face Hub, 37 descargas |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | Tareas diversas de manipulación | Apache 2.0 (LeRobot) | Hugging Face Hub / docs LeRobot |
| Políticas Diffusion Policy (LeRobot) | no disponible | no aplica | Manipulación visomotora | Apache 2.0 (LeRobot) | Hugging Face Hub / docs LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea ("Grab the blue cube and put it in the orange box") y un único robot (`so_follower`); no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni número de ensayos, por lo que se desconoce su fiabilidad real en el robot.
- Posible sobreajuste a posiciones estáticas: el nombre del repo (`static_pos`) sugiere que los objetos se colocaron en posiciones fijas durante la recogida; es probable una degradación ante variaciones de posición, iluminación o distractores.
- Dataset pequeño: 50 episodios y 16.789 fotogramas son suficientes para una demo, pero limitan la robustez y la diversidad de escenarios cubiertos.
- Dependencia de hardware concreto: requiere el robot `so_follower` y dos cámaras con los nombres `top` y `wrist`; los índices de cámara y el puerto del robot deben coincidir con los usados en el entrenamiento.
- Sin capacidades de lenguaje: no procesa instrucciones en lenguaje natural; la tarea es una cadena fija pasada por `--task`.
- Riesgo de alucinación en el sentido de acciones incorrectas: al ser una política de imitación, puede ejecutar movimientos plausibles pero erróneos ante observaciones fuera de distribución, sin mecanismo de verificación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación en producción recae en el integrador.
- Sin datos de sesgos: no se documentan sesgos demográficos, lingüísticos ni de otro tipo; los sesgos relevantes serían los del dataset de teleoperación (posiciones, colores y condiciones de iluminación concretas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ResidentEvian/act_50_episodes_static_pos
- Dataset de entrenamiento: https://huggingface.co/datasets/ResidentEvian/blue-cube-into-box_20261015_112154
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ResidentEvian/blue-cube-into-box_20261015_112154
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
