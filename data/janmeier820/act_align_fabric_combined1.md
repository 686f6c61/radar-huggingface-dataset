# Janmeier820/act_align_fabric_combined1

## Resumen

El modelo `Janmeier820/act_align_fabric_combined1` es una política de imitación basada en Action Chunking with Transformers (ACT), entrenada con el framework LeRobot para la tarea de alineación de tela (fabric alignment) en robótica. ACT, propuesto en el paper arXiv:2304.13705, predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y precisión en tareas de manipulación que requieren coordinación fina. Este modelo concreto ha sido desarrollado por el usuario Janmeier820 y publicado en Hugging Face bajo licencia Apache-2.0, con un total de 51.641.996 parámetros.

La relevancia de este modelo radica en que aborda un problema poco cubierto en los datasets públicos de robótica: la manipulación de objetos deformables, específicamente telas. El dataset de entrenamiento asociado, `Janmeier820/align_fabric_dataset_combined`, contiene demostraciones teleoperadas en formato LeRobot (video, series temporales y datos tabulares) y supone un recurso valioso para la comunidad de investigación en manipulación flexible. Al estar publicado con pesos en safetensors y compatible con LeRobot, puede ser reproducido, evaluado y adaptado fácilmente por otros desarrolladores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - transformer con codificador y decodificador |
| Parametros totales | 51.641.996 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no procesa texto) |
| Tipos de cuantizacion | no disponible (pesos en precisión completa, safetensors) |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un transformer con una estrategia de "action chunking": en lugar de predecir una única acción por paso de tiempo, el modelo predice un bloque de acciones futuras (típicamente de 10 a 100 pasos). Esto reduce el error acumulativo y mejora la suavidad de los movimientos. La arquitectura incluye un codificador que procesa observaciones (imágenes de cámaras y estados del robot) y un decodificador autorregresivo que genera los chunks de acciones. En la implementación de LeRobot, se utiliza una variante con atención causal y un módulo de estilo (style token) para capturar variaciones en las demostraciones.

El entrenamiento se realizó sobre el dataset `Janmeier820/align_fabric_dataset_combined`, que contiene demostraciones teleoperadas de alineación de tela. Según la información disponible, el dataset tiene un tamaño de 5.19 GB y está compuesto por datos de video, series temporales y tabulares en formato parquet. No se especifican el número exacto de episodios ni la composición detallada del dataset. El modelo fue entrenado con el framework LeRobot, que utiliza una pérdida de regresión L1 sobre las acciones y una pérdida auxiliar de clasificación para el token de estilo. No se menciona el uso de RLHF ni DPO, ya que es un modelo de imitación puro.

## Capacidades

- Control robótico de precisión: predice secuencias de acciones articulares para tareas de manipulación fina, como alinear telas.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas, sin necesidad de ingeniería de recompensas.
- Manejo de observaciones multimodales: procesa imágenes de cámaras y estados del robot (posición de articulaciones, fuerzas, etc.) para generar acciones.
- Generalización dentro de la tarea: puede adaptarse a variaciones en la posición inicial de la tela o del robot, dentro del rango de las demostraciones.
- Compatibilidad con LeRobot: integración directa con el ecosistema de Hugging Face para robótica, permitiendo evaluación y despliegue con robots SO-100 y otros compatibles.
- No soporta procesamiento de lenguaje natural, visión general ni tool calling: es un modelo especializado exclusivamente en control motor.

## Casos de uso

- Alineación de tela en entornos industriales: el modelo puede controlar un brazo robótico para alinear piezas de tela antes de procesos de costura o corte, reduciendo la intervención manual.
- Manipulación de objetos deformables en investigación: sirve como punto de partida para estudiar estrategias de control de materiales flexibles, donde los métodos tradicionales de planificación fallan.
- Automatización de tareas de plegado o extendido de textiles: aunque el modelo está entrenado específicamente para alineación, su arquitectura puede adaptarse a tareas similares con fine-tuning.
- Evaluación de políticas de imitación en robótica: los investigadores pueden usar este modelo como referencia para comparar métodos de action chunking frente a otras arquitecturas (Diffusion Policy, etc.).
- Desarrollo de sistemas de teleoperación asistida: el modelo puede integrarse en interfaces de control compartido donde el robot sugiere o completa movimientos iniciados por un operador humano.
- Benchmarking de datasets de manipulación flexible: al estar publicado con su dataset, permite reproducir experimentos y medir la calidad de los datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de tasas de éxito, métricas de precisión ni comparaciones con otros modelos en la model card ni en la documentación asociada. Se recomienda a los usuarios evaluar el modelo en su propio entorno robótico siguiendo el procedimiento de evaluación de LeRobot (`lerobot-record` con el flag `--policy.path`).

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo con ~51.6M de parámetros, la inferencia es ligera. Con pesos en FP32, el modelo ocupa aproximadamente 207 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (GTX 1060 o superior, RTX series, A100, etc.). También puede ejecutarse en CPU para pruebas de baja frecuencia, aunque con mayor latencia.
- Compatibilidad con consumer GPU: sí, el modelo es perfectamente ejecutable en GPUs de consumo como RTX 3060, RTX 4090, etc.
- Opciones de despliegue: LeRobot proporciona scripts de evaluación e inferencia (`lerobot-record`, `lerobot-eval`). También puede integrarse en ROS o en entornos personalizados mediante la carga de los safetensors con PyTorch.
- Latencia y throughput: no se dispone de mediciones oficiales. Dado el tamaño del modelo, se espera una inferencia en tiempo real (frecuencias de 10-30 Hz) en GPUs modernas, pero esto depende del número de cámaras y de la resolución de las imágenes.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Janmeier820/act_align_fabric_combined1 | ACT (transformer) | 51.6M | Alineación de tela | Apache-2.0 | Hugging Face |
| ACT original (paper 2304.13705) | ACT (transformer) | ~30-80M (según config) | Manipulación general (ej. insertar, doblar) | MIT (código) | GitHub |
| Diffusion Policy (Chi et al., 2023) | U-Net + diffusion | ~10-100M | Manipulación general | MIT | GitHub |

Nota: no se dispone de comparativas de rendimiento numérico entre estos modelos en la información proporcionada. La comparación se basa en características arquitectónicas y de publicación. El modelo de Janmeier820 se distingue por estar específicamente entrenado para un dataset de tela y por su integración directa con LeRobot.

## Limitaciones y advertencias

- Sesgos del dataset: el modelo está entrenado exclusivamente con demostraciones de alineación de tela; no generalizará a otras tareas de manipulación sin fine-tuning.
- Riesgo de sobreajuste: al ser un dataset de tamaño moderado (5.19 GB), el modelo puede memorizar las demostraciones y fallar ante configuraciones muy diferentes a las vistas en entrenamiento.
- Dependencia de la calidad de las teleoperaciones: la política imita los comportamientos demostrados; si las demostraciones contienen errores o variabilidad excesiva, el modelo los replicará.
- Sin soporte para percepción avanzada: no incluye detección de objetos ni razonamiento simbólico; solo procesa las observaciones directas del robot.
- Limitaciones de hardware: aunque es ligero, requiere un robot físico compatible (por ejemplo, SO-100) y un entorno de simulación o real para su evaluación.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el usuario debe verificar que el dataset asociado también cumple con los términos de uso (el dataset está bajo Apache-2.0 según su ficha).
- Sin información sobre versiones de entrenamiento: no se especifican hiperparámetros, número de épocas ni configuración exacta del transformer, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Janmeier820/act_align_fabric_combined1
- Dataset de entrenamiento: https://huggingface.co/datasets/Janmeier820/align_fabric_dataset_combined
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
