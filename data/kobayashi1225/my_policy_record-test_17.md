# kobayashi1225/my_policy_record-test_17

## Resumen

`kobayashi1225/my_policy_record-test_17` es una política de imitación (imitation learning) para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado por primera vez en el artículo arXiv:2304.13705 y empaquetada con la librería LeRobot de Hugging Face. El autor del repositorio es kobayashi1225 y el modelo se distribuye con licencia Apache 2.0. No es un modelo de lenguaje: es un controlador visomotor que mapea observaciones (estado articular y dos cámaras) a acciones de robot de 6 dimensiones.

El modelo resuelve una tarea concreta de manipulación: "Pick up red cube" (coger un cubo rojo). Consume un vector de estado de 6 componentes y dos imágenes RGB de 240x320 píxeles (cámaras `arm` y `side`) y produce un vector de acción de 6 componentes. Está pensado para el robot `so_follower` (SO-100/SO-101 de LeRobot) y se ejecuta a 30 FPS.

Es relevante ahora como ejemplo de extremo a extremo del flujo de trabajo de LeRobot: grabación de datos de teleoperación, entrenamiento con ACT y despliegue en robot real. Con 51.668.614 parámetros (unos 51,7 millones) y un repositorio de 0,2 GB, es un modelo pequeño que cabe en GPUs de consumo y sirve como referencia para quien quiera reproducir el pipeline de imitación en robots de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación definida por la configuración de ACT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot 0.5.2 |
| Tipo de robot | `so_follower` |
| Camaras | `arm`, `side` (RGB 3x240x320) |
| Entrada de estado | `observation.state` (6,) |
| Salida de accion | `action` (6,) |
| Frecuencia de datos | 30 FPS |

## Arquitectura y entrenamiento

ACT es un método de imitación que predice trozos (chunks) de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y permite un control más suave. La arquitectura combina un codificador visual (procesa las dos cámaras), un codificador del estado articular y un transformador que genera secuencias de acciones. El modelo tiene 51.668.614 parámetros y está entrenado para el robot `so_follower` con dos cámaras (`arm` y `side`) a resolución 240x320.

El entrenamiento se realizó sobre el dataset `kobayashi1225/record-test_17_20261119_123025`, con 51 episodios, 30.498 fotogramas y una tasa de 30 FPS, para la tarea "Pick up red cube". La configuración de entrenamiento documentada es: 25.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.5.2. No se documentan detalles sobre aumentación de datos, regularización ni composición exacta del dataset más allá del número de episodios y fotogramas.

## Capacidades

- Control visomotor de robot: mapea estado articular (6 dimensiones) e imágenes de dos cámaras a acciones de 6 dimensiones.
- Imitación de tareas de manipulación: entrenado específicamente para "Pick up red cube".
- Predicción de chunks de acciones, lo que mejora la estabilidad del control frente a políticas paso a paso.
- Ejecución en tiempo real a 30 FPS en el robot `so_follower`.
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante CLI (`lerobot-train`, `lerobot-rollout`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Recogida de objetos en laboratorio: el modelo ejecuta la tarea "Pick up red cube" sobre el robot `so_follower` con dos cámaras; es adecuado para experimentos de manipulación reproducibles en entornos controlados.
- Reproducción de pipelines de imitación: sirve como referencia para validar el flujo completo de LeRobot (grabación, entrenamiento con ACT y despliegue) antes de escalar a tareas propias.
- Docencia y formación en robótica: al ser un modelo pequeño (51,7 M de parámetros) y con licencia Apache 2.0, se puede usar en cursos para ilustrar imitation learning con hardware de bajo coste.
- Pruebas de integración de hardware: permite verificar la calibración de cámaras y brazos del SO-100/SO-101 comparando el comportamiento del modelo con el esperado.
- Base para fine-tuning: el checkpoint puede servir como punto de partida para reentrenar en tareas similares de picking con el mismo robot y configuración de cámaras.
- Evaluación de robustez: útil para medir cómo afectan cambios de iluminación, posición de objetos o distracciones a una política ACT entrenada con pocos episodios (51).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 51,7 M de parámetros; en la práctica, el cuello de botella es el procesamiento de las dos cámaras a 240x320 y 30 FPS, no el tamaño del modelo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; se documenta entrenamiento con `--policy.device=cuda`. Para entrenamiento se recomienda una GPU de gama media o superior (RTX 3060/4060 o superior).
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de consumo (GTX 1650, RTX 3050, RTX 4090, etc.).
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de PyTorch/CUDA. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; la model card solo especifica que los datos se graban a 30 FPS y que la política se ejecuta en el robot a esa frecuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kobayashi1225/my_policy_record-test_17 (ACT) | 51,7 M | no aplica | Pick up red cube (so_follower) | Apache 2.0 | Hugging Face |
| Políticas ACT de LeRobot (generales) | ~50 M (típico) | no aplica | Manipulación con SO-100/SO-101 | Apache 2.0 | Hugging Face / LeRobot |
| Políticas Diffusion Policy | no disponible | no aplica | Manipulación visomotora | varía | Hugging Face / LeRobot |
| Políticas π0 (Physical Intelligence) | no disponible | no aplica | Manipulación generalista | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de tarea: entrenado únicamente para "Pick up red cube"; no generaliza a otras tareas sin reentrenamiento.
- Dataset pequeño: 51 episodios y 30.498 fotogramas; riesgo de sobreajuste y baja robustez ante cambios de iluminación, posición de objetos o distracciones.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Dependencia de hardware concreto: diseñado para `so_follower` con cámaras `arm` y `side` a 240x320; requiere calibración y nombres de cámara coincidentes.
- Sin capacidades lingüísticas ni de razonamiento: no es un modelo de lenguaje ni un agente; no soporta tool calling.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Sesgos: no documentados; al ser un modelo de robótica, los sesgos relevantes serían de distribución de datos (posiciones, colores, condiciones de laboratorio).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kobayashi1225/my_policy_record-test_17
- Dataset de entrenamiento: https://huggingface.co/datasets/kobayashi1225/record-test_17_20261119_123025
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kobayashi1225/record-test_17_20261119_123025
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
