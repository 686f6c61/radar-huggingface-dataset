# armnet/diffusion_so101_insert_gear_in_gripper

## Resumen

`armnet/diffusion_so101_insert_gear_in_gripper` es un checkpoint de política robótica basado en Diffusion Policy, entrenado con el framework LeRobot 0.5.1 para la tarea de inserción de un engranaje en la pinza del robot SO-101. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un bundle de pesos de control motor que mapea observaciones visuales multimodales a secuencias de acciones articulares a 30 Hz. Lo publica el usuario `armnet` como baseline dentro del conjunto de referencia RoboBuilderBench.

El repositorio contiene cinco checkpoints intermedios (pasos 4.000, 8.000, 12.000, 16.000 y 20.000) más los ficheros de configuración y procesadores asociados, con un total de 5,6 GB en formato `safetensors`. El entrenamiento se ejecutó en una única NVIDIA GH200 de 120 GB durante 1 hora y 53 minutos, partiendo del dataset `armnet/so101_insert_gear_in_gripper` fijado al commit `42e271c25c30d934449c4acf73af96c48ff86b6f`.

Su relevancia es acotada pero clara: sirve como referencia reproducible para comparar políticas de imitación en una tarea de manipulación fina con un brazo de 6 grados de libertad, y como punto de partida para quien quiera reentrenar o ajustar Diffusion Policy sobre hardware SO-101. No hay información sobre licencia, idiomas ni pipeline de inferencia en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (LeRobot 0.5.1), encoder visual ResNet18 y cabeza de difusión de acciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; horizonte de predicción de 64 pasos, 32 pasos de acción y 2 pasos de observación |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, sin interfaz de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | inserción de engranaje en pinza sobre SO-101 (6-D, 30 Hz, vista superior y de muñeca) |
| Entradas | imágenes RGB de varias cámaras con `resize_shape=[576, 1024]`, sin recorte |
| Salidas | secuencias de acciones de 6 dimensiones a 30 Hz |
| Pasos de inferencia | 50 (difusión) |
| Checkpoints incluidos | 4.000, 8.000, 12.000, 16.000 y 20.000 pasos |
| Tamaño del repositorio | 5,6 GB |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, un enfoque de imitación que formula la generación de trayectorias de acción como un proceso de difusión denoising. La red condiciona la predicción de acciones sobre observaciones visuales procesadas por un ResNet18 preentrenado en ImageNet (`IMAGENET1K_V1`), con un encoder RGB separado por cámara (`use_separate_rgb_encoder_per_camera=true`) y sin GroupNorm. Las imágenes se redimensionan a 576×1024 sin recorte, lo que preserva el campo de visión completo de las cámaras superior y de muñeca del SO-101.

El entrenamiento usó 20.000 pasos con batch de 32, learning rate de 1e-4, warmup de 500 pasos y semilla 1000, sobre el dataset `armnet/so101_insert_gear_in_gripper`. La pérdida bajó de 0,456 en el paso 200 a 0,004 en el paso 20.000 (época 20,90), con una norma de gradiente que descendió de 0,233 en el paso 6.000 a 0,089 en el 20.000. El horizonte de predicción es de 64 pasos, con 32 pasos de acción ejecutables y 2 pasos de observación. La receta incluye un parche para resolución heterogénea de cámaras, lo que sugiere que las cámaras del montaje no comparten resolución nativa.

## Capacidades

- Control robótico de manipulación fina: genera trayectorias de 6 grados de libertad para insertar un engranaje en la pinza del SO-101.
- Política de imitación multimodal: consume imágenes de varias cámaras (vista superior y de muñeca) y produce acciones a 30 Hz.
- Predicción de secuencias de acción con horizonte de 64 pasos y ejecución en bloques de 32, lo que permite replanificación periódica.
- Inferencia por difusión con 50 pasos de denoising, configurable en el pipeline de LeRobot.
- No soporta tool calling, function calling, agentes basados en lenguaje, razonamiento multi-paso simbólico ni capacidades multilingües.
- No es un modelo de texto, visión general, audio ni código.

## Casos de uso

- Benchmark de políticas de imitación: sirve como baseline reproducible para comparar Diffusion Policy frente a ACT, VQ-BeT u otras políticas sobre la misma tarea y dataset, gracias a los cinco checkpoints intermedios publicados.
- Reentrenamiento sobre hardware SO-101: el bundle incluye configuración, procesadores y manifiesto de integridad, lo que facilita reproducir la receta con LeRobot 0.5.1 sobre una GH200 o GPUs equivalentes.
- Evaluación de robustez visual: al usar encoders separados por cámara y resolución 576×1024, permite estudiar cómo afectan cambios de iluminación o encuadre a una tarea de inserción fina.
- Estudio de convergencia y selección de checkpoint: la progresión de pérdida documentada permite analizar el compromiso entre checkpoints tempranos (4.000) y finales (20.000) en términos de estabilidad de la política.
- Integración en pipelines de evaluación RoboBuilderBench: el manifiesto `CHECKPOINT_MANIFEST.json` y la utilidad `verify-checkpoint` permiten validar la integridad de los pesos antes de lanzar barridos comparativos.
- Punto de partida para fine-tuning en tareas de ensamblaje: la política puede adaptarse a variantes de la tarea (otro tipo de pieza, otra pinza) reentrenando sobre un dataset propio con la misma receta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la progresión de pérdida de entrenamiento:

| Paso | Pérdida | Norma de gradiente |
|---:|---:|---:|
| 200 | 0,456 | — |
| 1.000 | 0,028 | — |
| 6.000 | 0,012 | 0,233 |
| 8.000 | 0,011 | 0,173 |
| 12.000 | 0,008 | 0,152 |
| 16.000 | 0,005 | 0,115 |
| 20.000 | 0,004 | 0,089 |

No hay tasas de éxito en simulación o en robot real, ni comparación con otras políticas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio pesa 5,6 GB e incluye cinco checkpoints, por lo que un único checkpoint ocuparía del orden de 1 GB o algo más en `safetensors`, más el encoder ResNet18. Cabe en GPUs de consumo con holgura, pero el dato exacto no está publicado.
- GPU recomendadas: el entrenamiento se realizó en 1× NVIDIA GH200 de 120 GB; para inferencia basta una GPU mucho menor, aunque no se especifica el mínimo.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060/4060 en adelante), dado el tamaño del checkpoint, pero no confirmado por el autor.
- Opciones de despliegue: LeRobot 0.5.1 (`DiffusionPolicy`) es el framework de referencia; no se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp ni Ollama (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles. La política opera a 30 Hz en el robot, pero no se reporta el tiempo de inferencia por paso de difusión ni el throughput en la GH200.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas de imitación (ACT, VQ-BeT, Diffusion Policy en otras tareas) ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- Específico de una única tarea y un único robot: la política está entrenada para insertar un engranaje en la pinza del SO-101 y no generaliza a otras tareas sin reentrenamiento.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor; la ausencia de licencia es un riesgo legal en producción.
- Sin métricas de éxito: la pérdida de entrenamiento baja no garantiza buen desempeño en el robot real; no hay evaluación publicada.
- Dependencia de la configuración de cámaras: el modelo espera vistas superior y de muñeca con resolución 576×1024 y encoders separados; cambios de montaje o calibración pueden degradar el rendimiento.
- Riesgo de sobreajuste al dataset: 20.000 pasos sobre un único dataset con pérdida de 0,004 puede indicar ajuste fino excesivo a las condiciones de recogida.
- Sin soporte de lenguaje ni interfaces conversacionales: no debe presentarse como modelo de propósito general.
- Integridad de los pesos: el autor recomienda verificar con `verify-checkpoint` contra `CHECKPOINT_MANIFEST.json` antes de usar; descargas parciales o corruptas pueden pasar desapercibidas.
- Fecha de creación futura (2026-11-24): conviene confirmar la vigencia del repositorio y de la versión de LeRobot antes de reproducir la receta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/armnet/diffusion_so101_insert_gear_in_gripper
- Dataset asociado: `armnet/so101_insert_gear_in_gripper` (commit `42e271c25c30d934449c4acf73af96c48ff86b6f`)
- Run de W&B: https://wandb.ai/pravsels/lerobot-rbb-diffusion/runs/38n46ie9
- Framework LeRobot: https://github.com/huggingface/lerobot
- Referencia de Diffusion Policy: no disponible en la información proporcionada
