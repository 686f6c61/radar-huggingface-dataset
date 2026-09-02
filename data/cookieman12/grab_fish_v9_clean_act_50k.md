# Cookieman12/grab_fish_v9_clean_ACT_50k

## Resumen

El modelo `Cookieman12/grab_fish_v9_clean_ACT_50k` es un policy de robótica basado en Action Chunking with Transformers (ACT), entrenado con el framework LeRobot de Hugging Face. Está diseñado para controlar un brazo robótico SO-101 en la tarea de agarrar un pez (grab the fish) a partir de teleoperación. El modelo consume imágenes de dos cámaras (frontal y lateral) junto con el estado del robot, y predice secuencias de acciones (chunks) de 6 dimensiones.

Desarrollado por el usuario Cookieman12, este modelo se entrena sobre un dataset propio de 52 episodios teleoperados (27.923 frames a 30 FPS) y representa un ejemplo práctico de imitación learning aplicado a manipulación robótica. Con 51,7 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware modesto, lo que lo hace accesible para investigación y prototipado. Su relevancia radica en demostrar el flujo completo de LeRobot: recopilación de datos, entrenamiento de un policy ACT y despliegue en un robot real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de imitación learning que predice un chunk de acciones (varias acciones futuras) en lugar de una sola acción por paso. La arquitectura combina un codificador de visión (típicamente ResNet) para procesar las imágenes de las cámaras, un codificador de estado para las observaciones proprioceptivas, y un transformer que genera la secuencia de acciones. El entrenamiento se realiza mediante comportamiento clonado (behavior cloning) sobre datos teleoperados, sin refuerzo ni ajuste por preferencias humanas.

El modelo se entrenó durante 50.000 pasos con un batch size de 8, optimizador AdamW y una tasa de aprendizaje de 1e-5, usando la versión 0.6.1 de LeRobot. El dataset de entrenamiento contiene 52 episodios de la tarea "Grab the fish", con 27.923 frames a 30 FPS, capturados con dos cámaras (frontal y lateral) a resolución 480x640. No se reportan técnicas adicionales como aumentación de datos o regularización específica.

## Capacidades

- Control de un brazo robótico SO-101 para la tarea específica de agarrar un pez.
- Entrada multimodal: dos imágenes RGB (480x640) y un vector de estado de 6 dimensiones (posición/velocidad de las articulaciones).
- Salida de acciones de 6 dimensiones, correspondientes a los comandos del robot.
- Predicción de chunks de acciones (varias acciones a la vez), lo que mejora la estabilidad del movimiento frente a políticas paso a paso.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento simbólico.

## Casos de uso

- Investigación en imitación learning: sirve como punto de partida para estudiar el efecto de la longitud del chunk, el número de episodios o la configuración de cámaras en el rendimiento de ACT.
- Prototipado de tareas de manipulación: puede adaptarse mediante fine-tuning a tareas similares de agarre o posicionamiento con el mismo robot SO-101.
- Demostración del flujo LeRobot: útil para desarrolladores que quieran aprender a entrenar y desplegar policies robóticos con esta librería.
- Benchmark de generalización: al ser un modelo pequeño y específico, permite evaluar la robustez frente a cambios de iluminación, posición del objeto o variaciones en el robot.
- Educación en robótica: adecuado para cursos o talleres donde se necesite un ejemplo funcional de control por imitación sin requerir hardware de gama alta.
- Base para comparación de métodos: puede compararse con otros policies (p. ej., Diffusion Policy) entrenados sobre el mismo dataset para analizar diferencias de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación del policy en el robot real.

## Requisitos de hardware

- Inferencia: el modelo tiene 51,7 millones de parámetros, lo que ocupa aproximadamente 200 MB en FP32. Cualquier GPU con al menos 1 GB de VRAM puede ejecutarlo sin problemas; incluso una GPU integrada o CPU son viables para inferencia no en tiempo real.
- GPU recomendada: para control en tiempo real (30 FPS) se recomienda una GPU de gama media como una NVIDIA GTX 1660 o superior. En el entrenamiento se usó CUDA, por lo que se asume una GPU NVIDIA.
- Robot: requiere un brazo robótico SO-101 (follower) y dos cámaras compatibles con OpenCV (frontal y lateral).
- Despliegue: se utiliza el comando `lerobot-rollout` de LeRobot, que gestiona la comunicación con el robot y las cámaras. No se mencionan opciones como vLLM u Ollama, ya que no es un modelo de lenguaje.
- Latencia: no se dispone de datos medidos, pero al ser un modelo pequeño, la inferencia en GPU debería ser inferior a 10 ms por paso.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de otros modelos entrenados sobre el mismo dataset. Sin embargo, ACT es uno de los métodos de imitación más utilizados en LeRobot, junto con Diffusion Policy. A continuación se comparan características generales (sin cifras de rendimiento):

| Modelo | Arquitectura | Parametros (típico) | Entrenamiento | Licencia |
|---|---|---|---|---|
| ACT (este modelo) | Transformer + ResNet | ~50M | Behavior cloning | Apache 2.0 |
| Diffusion Policy | Red de difusión (UNet) | ~10-100M | Behavior cloning | Apache 2.0 |
| VQ-BeT | Transformer con cuantización vectorial | ~50M | Behavior cloning | Apache 2.0 |

La elección entre estos métodos depende de la tarea: ACT suele ser más estable para movimientos precisos, mientras que Diffusion Policy destaca en tareas con multimodalidad. No se dispone de comparativas numéricas en este repositorio.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea "Grab the fish" con un robot SO-101 específico. No generaliza a otros objetos, posiciones o configuraciones de robot sin fine-tuning.
- Depende de la calibración de las cámaras y de la posición del robot. Cambios en la iluminación, fondo o ángulo de las cámaras pueden degradar el rendimiento.
- No se han reportado evaluaciones en el robot real, por lo que se desconoce su tasa de éxito real.
- El dataset es pequeño (52 episodios), lo que puede provocar sobreajuste a las condiciones de recogida de datos.
- Al ser un modelo de imitación, hereda los sesgos de las demostraciones teleoperadas (p. ej., trayectorias subóptimas).
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe asegurarse de que el robot y los componentes cumplen con las normativas aplicables.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Cookieman12/grab_fish_v9_clean_ACT_50k
- Dataset de entrenamiento: https://huggingface.co/datasets/Cookieman12/grab_fish_v9_clean
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (librería): https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Cookieman12/grab_fish_v9_clean
