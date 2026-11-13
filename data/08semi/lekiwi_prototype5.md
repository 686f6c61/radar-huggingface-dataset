# 08semi/lekiwi_prototype5

## Resumen

lekiwi_prototype5 es una política de imitación robótica entrenada mediante el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv 2304.13705. El modelo lo desarrolla el usuario 08semi y está empaquetado con la librería LeRobot de Hugging Face, lo que permite entrenarlo y desplegarlo con la CLI oficial sobre un robot de tipo `lekiwi_client`. No es un modelo de lenguaje: es una política visomotora que transforma observaciones del robot (estado de las articulaciones e imágenes de dos cámaras) en comandos de acción.

El modelo resuelve el problema de control robótico por imitación: aprende de datos de teleoperación y predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error acumulado y suele aumentar la tasa de éxito en tareas de manipulación. Cuenta con 51,67 millones de parámetros y un repositorio de 0,6 GB, por lo que es un modelo compacto y ligero en comparación con los grandes modelos fundacionales.

Es relevante ahora porque forma parte del ecosistema LeRobot, que estandariza el entrenamiento, la evaluación y el despliegue de políticas robóticas en PyTorch. Sin embargo, se trata de un prototipo (prototype5) entrenado con un dataset muy pequeño (46 episodios, 20.700 frames) y sin resultados de evaluación publicados, así que debe considerarse un artefacto experimental y no una política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.674.761 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija por observación) |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (modelo robótico, no lingüístico) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |
| Tipo de robot | lekiwi_client |
| Cámaras | front (3, 480, 640), wrist (3, 640, 480) |
| Entrada de estado | observation.state (9,) |
| Salida de acción | action (9,) |
| Dataset de entrenamiento | 08semi/dataset_roll (46 episodios, 20.700 frames, 30 FPS) |
| Pasos de entrenamiento | 15.000 |
| Batch size | 2 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación basado en un transformer que predice chunks de acciones, es decir, secuencias cortas de comandos futuros en lugar de una única acción por paso. La política consume dos imágenes RGB (cámara frontal a 480x640 y cámara de muñeca a 640x480) junto con un vector de estado de 9 dimensiones, y produce un vector de acción de 9 dimensiones. Este diseño mitiga el problema de acumulación de errores típico de las políticas que predicen un solo paso y facilita movimientos más suaves y coherentes.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset 08semi/dataset_roll, compuesto por 46 episodios de teleoperación a 30 FPS (20.700 frames en total), durante 15.000 pasos con batch size 2, optimizador AdamW y learning rate 1e-05. No se documentan en la información disponible detalles sobre composición del dataset, aumento de datos, RLHF/DPO ni innovaciones técnicas adicionales más allá del propio action chunking. La tarea entrenada aparece en la model card como "My task description", un marcador de plantilla que sugiere que la descripción real de la tarea no se ha completado.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 9 dimensiones a partir de observaciones visomotoras.
- Percepción visual multi-cámara: procesa simultáneamente una cámara frontal y una cámara de muñeca.
- Predicción de chunks de acción: emite secuencias cortas de acciones en lugar de pasos aislados.
- Ejecución en tiempo real: entrenado con datos a 30 FPS, pensado para inferencia en bucle de control.
- Integración con LeRobot: compatible con `lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No se documentan modos especiales (thinking, visión general, audio) más allá de las dos cámaras de entrada.

## Casos de uso

- Manipulación robótica de precisión: la política puede ejecutar tareas de coger y colocar sobre el robot lekiwi_client usando la cámara de muñeca para el ajuste fino y la frontal para la localización global.
- Prototipado rápido de políticas de imitación: al estar empaquetada con LeRobot, sirve como base para validar pipelines de entrenamiento y despliegue antes de escalar a datasets mayores.
- Investigación en aprendizaje por imitación: permite reproducir el método ACT y comparar variantes de action chunking con un checkpoint público de referencia.
- Teleoperación aumentada: puede usarse como política de asistencia que sugiere o ejecuta acciones en entornos controlados donde se ha recogido teleoperación.
- Automatización de tareas repetitivas en laboratorio: adecuada para entornos acotados con iluminación y posiciones de objeto estables, similares a las del dataset de entrenamiento.
- Base para fine-tuning con nuevos datasets: el checkpoint puede reentrenarse con `lerobot-train` sobre datos propios del mismo tipo de robot para adaptar la política a nuevas tareas.
- Evaluación de infraestructura de robótica: útil para probar la cadena completa de LeRobot (grabación, entrenamiento, rollout) en hardware lekiwi_client.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks ni de evaluación en robot real en la información disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,67 millones de parámetros en safetensors (precisión completa), el checkpoint ocupa aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en GPUs consumer.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder ejecutar la política; se recomienda una GPU con soporte CUDA para `--policy.device=cuda`.
- Cabe en GPU consumer: sí, por el reducido número de parámetros; no se especifican modelos concretos.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base` y `--policy.path=08semi/lekiwi_prototype5`), con dispositivo configurable vía `--policy.device=cuda`.
- Latencia y throughput estimados: no disponibles; el entrenamiento se realizó a 30 FPS, lo que sugiere que el bucle de control está pensado para esa cadencia, pero no se documentan medidas reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 08semi/lekiwi_prototype5 | 51,67 M | no aplica | sin evaluación publicada | no disponible | Hugging Face (LeRobot) |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | no disponible | según repositorio | Hugging Face |
| Otros checkpoints lekiwi_client | no disponible | no aplica | no disponible | no disponible | Hugging Face |

No se dispone de datos suficientes sobre modelos comparables de la misma categoría (políticas ACT para lekiwi_client) en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Modelo experimental: se trata de un prototipo (prototype5) con dataset pequeño (46 episodios) y sin evaluación publicada; no hay evidencia de tasa de éxito en robot real.
- Riesgo de sobreajuste: con solo 20.700 frames y batch size 2, la política puede memorizar posiciones e iluminación del dataset y fallar ante variaciones.
- Generalización limitada: no se documenta robustez ante cambios de objeto, iluminación, distractores o robots distintos del mismo tipo.
- Descripción de tarea incompleta: la model card usa el marcador "My task description", por lo que la tarea real entrenada no está claramente especificada.
- Licencia no disponible: la model card indica "More Information Needed"; no se puede confirmar el uso comercial.
- Sesgos conocidos: no disponibles; al ser un modelo robótico, los sesgos relevantes serían de distribución de datos (posiciones, objetos, condiciones de captura), no lingüísticos.
- Restricciones de contexto e idioma: no aplica contexto textual ni idiomas; la entrada es fija (estado de 9 dimensiones y dos imágenes).
- Caveat de producción: requiere calibración de robot y cámaras, y los nombres de cámara deben coincidir con las claves de observación (`front`, `wrist`); no debe desplegarse en entornos no controlados sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/08semi/lekiwi_prototype5
- Dataset de entrenamiento: https://huggingface.co/datasets/08semi/dataset_roll
- Artículo ACT (arXiv 2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=08semi/dataset_roll
