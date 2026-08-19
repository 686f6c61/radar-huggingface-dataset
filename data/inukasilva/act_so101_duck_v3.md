# InukaSilva/act_so101_duck_v3

## Resumen

`InukaSilva/act_so101_duck_v3` es un modelo de robótica basado en Action Chunking with Transformers (ACT), entrenado con el framework LeRobot de Hugging Face. El modelo implementa una política de imitación que aprende a controlar un brazo robótico SO-101 (SO-ARM100) para realizar la tarea de recoger un pato y colocarlo en un agujero. Fue desarrollado por InukaSilva y publicado en agosto de 2026 bajo licencia Apache-2.0.

El modelo consume observaciones de estado (6 dimensiones) y dos cámaras RGB (muñeca y lateral) a 480x640 píxeles, y produce acciones de 6 dimensiones para controlar el robot. Con 51,7 millones de parámetros, es un modelo compacto diseñado específicamente para control robótico en tiempo real. Su relevancia radica en que demuestra el flujo de trabajo completo de LeRobot: desde la recopilación de datos teleoperados hasta el entrenamiento y despliegue de una política de imitación en un robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos de acciones (action chunks) en lugar de pasos individuales. La arquitectura se basa en un transformer que procesa simultáneamente las observaciones visuales de dos cámaras (muñeca y lateral) junto con el estado del robot (posiciones de articulaciones y pinza), y genera secuencias de acciones futuras. Este enfoque reduce el error de acumulación típico de las políticas paso a paso y mejora la estabilidad del control.

El modelo fue entrenado con un dataset de 50 episodios teleoperados (22.239 fotogramas a 30 FPS) recopilados con un robot SO-101. La configuración de entrenamiento incluye 100.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-05 y semilla 1000. Se utilizó LeRobot versión 0.6.2 para el entrenamiento y la publicación del modelo. El dataset está disponible en Hugging Face como `InukaSilva/so101_duck_v3_20260814_150442`.

## Capacidades

- Control robótico por imitación: ejecuta la tarea de recoger un pato y colocarlo en un agujero con un brazo SO-101.
- Percepción visual multimodal: procesa simultáneamente imágenes de dos cámaras (muñeca y lateral) a 480x640 píxeles.
- Generación de acciones de 6 grados de libertad: controla las articulaciones del brazo y la pinza.
- Aprendizaje por demostración: la política se entrena exclusivamente con datos teleoperados, sin necesidad de ingeniería de recompensas.
- Ejecución en tiempo real: diseñado para inferencia a 30 FPS, compatible con el flujo de rollout de LeRobot.
- No soporta tool calling, agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorio: el modelo puede integrarse en un robot SO-101 para realizar tareas repetitivas de manipulación de objetos pequeños, como el pato del dataset, en entornos controlados.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el rendimiento de ACT en tareas de manipulación con visión desde múltiples cámaras, comparando con otras arquitecturas.
- Desarrollo de pipelines robóticos con LeRobot: el modelo demuestra el flujo completo de LeRobot (recopilación de datos, entrenamiento y despliegue) y puede usarse como referencia para entrenar políticas en otras tareas.
- Prototipado de soluciones de robótica educativa: con un SO-101 y las cámaras adecuadas, el modelo permite montar una demo funcional de manipulación autónoma en entornos académicos.
- Benchmarking de políticas ACT: al estar disponible públicamente con su dataset asociado, permite reproducir experimentos y comparar variaciones del método ACT.
- Base para fine-tuning en tareas similares: el modelo puede servir como inicialización para entrenar políticas en tareas de manipulación con la misma configuración de robot y cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación: "No evaluation results have been provided for this policy yet". No se dispone de tasas de éxito en robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 51,7 millones de parámetros, la inferencia es ligera. Con pesos en fp32 (aproximadamente 207 MB), cabría en cualquier GPU con al menos 1 GB de VRAM. En cuantización fp16, el uso de VRAM sería de unos 104 MB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA, incluyendo gamas de consumo como GTX 1650, RTX 3060 o superiores. También es viable la inferencia en CPU para pruebas, aunque con mayor latencia.
- Compatibilidad con consumer GPU: sí, el modelo cabe holgadamente en cualquier GPU de consumo actual.
- Opciones de despliegue: LeRobot CLI (`lerobot-rollout`), Hugging Face Inference Endpoints, o integración directa con PyTorch.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño del modelo y la resolución de entrada (2 cámaras a 480x640), se espera una latencia de inferencia de decenas de milisegundos en GPU moderna, compatible con el control a 30 FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| InukaSilva/act_so101_duck_v3 | 51,7 M | Pick-and-place (pato) | 50 episodios, SO-101 | Apache-2.0 | Hugging Face |
| Modelos ACT de LeRobot (referencia) | variable | Manipulacion general | variable | Apache-2.0 | Hugging Face |
| Políticas basadas en Diffusion Policy | variable | Manipulacion general | variable | variable | variable |

No se dispone de información suficiente sobre modelos comparables específicos para la misma tarea y configuración de robot. La comparativa se limita a la familia de políticas ACT entrenadas con LeRobot, que comparten arquitectura y flujo de entrenamiento.

## Limitaciones y advertencias

- Sin resultados de evaluación: no hay datos de tasa de éxito en robot real, por lo que el rendimiento real del modelo es desconocido.
- Específico de una tarea: el modelo está entrenado únicamente para "pick up the duck and place it in the hole". No generaliza a otras tareas sin fine-tuning.
- Dependencia del hardware: requiere la configuración exacta de robot SO-101 y las dos cámaras (muñeca y lateral) con las mismas posiciones y calibración.
- Dataset limitado: 50 episodios es un dataset pequeño; el modelo puede no ser robusto ante variaciones de iluminación, posición de objetos o distracciones.
- Sin soporte de lenguaje: no es un modelo multimodal de lenguaje; no procesa instrucciones textuales ni mantiene diálogos.
- Licencia Apache-2.0: permite uso comercial, pero el usuario es responsable de cumplir los términos de la licencia y de los componentes subyacentes (LeRobot, SO-101).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/InukaSilva/act_so101_duck_v3
- Dataset de entrenamiento: https://huggingface.co/datasets/InukaSilva/so101_duck_v3_20260814_150442
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Guía de hardware SO-101: https://github.com/TheRobotStudio/SO-ARM100/blob/main/Simulation/SO101/README.md
- Guía de entrenamiento ACT para SO101: https://github.com/omkarputti/SO101_ACT_Training
