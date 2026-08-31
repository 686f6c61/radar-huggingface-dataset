# ilikirobot/act_generated_demo_20ep_50ep

## Resumen

Este modelo es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. Ha sido desarrollado por el usuario ilikirobot y entrenado con el framework LeRobot de Hugging Face. El modelo está diseñado para controlar un brazo robótico SO-101 en un entorno simulado, ejecutando la tarea de recoger un cubo rojo y colocarlo en un contenedor (bin A). Es relevante porque demuestra el flujo completo de entrenamiento y despliegue de políticas de manipulación robótica con ACT sobre datos generados sintéticamente, y puede servir como punto de partida para experimentos en simulación o como base para transferir a hardware real.

La arquitectura es un transformer con aproximadamente 51,6 millones de parámetros. No se especifica una longitud de contexto en la documentación disponible, pero al tratarse de ACT, el contexto se refiere al historial de observaciones y al chunk de acciones a predecir. El modelo consume imágenes de dos cámaras (lateral y de muñeca) junto con el estado del robot (6 dimensiones) y produce comandos de acción de 6 dimensiones. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.596.934 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende de la configuracion del chunk y del historial de observaciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision completa) |
| Idiomas soportados | no disponible (modelo no lingüistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT, descrita en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arxiv:2304.13705). ACT combina un codificador de imágenes (típicamente un ResNet) con un transformer que procesa el estado del robot y las características visuales para predecir un chunk de acciones futuras. Durante el entrenamiento se optimiza con una pérdida de regresión (L1) sobre las acciones y una pérdida de consistencia para los tokens de estilo (style tokens). En este caso, el modelo se entrenó durante 150.000 pasos con un batch de 8, optimizador AdamW y una tasa de aprendizaje de 1e-5, usando el framework LeRobot versión 0.6.1.

El conjunto de datos de entrenamiento (ilikirobot/generated_demo_20ep_50ep) contiene 50 episodios y 17.351 fotogramas a 30 FPS, capturados con dos cámaras (side_cam y wrist_cam). Las demostraciones fueron generadas sintéticamente, presumiblemente mediante un controlador automático o un sistema de teleoperación simulado. No se menciona el uso de RLHF ni DPO; el entrenamiento es puramente supervisado sobre las demostraciones.

## Capacidades

- Control robótico en simulación: genera comandos de acción de 6 grados de libertad (posición y orientación del efector) para el robot SO-101 en el entorno simulado.
- Percepción visual: procesa dos flujos de imágenes (cámara lateral y cámara de muñeca) de 480x640 píxeles para guiar la manipulación.
- Aprendizaje por imitación: reproduce la tarea específica de pick-and-place de un cubo rojo en un contenedor, aprendida de las demostraciones.
- No soporta tool calling, agentes ni razonamiento multi-paso en el sentido de modelos de lenguaje; su salida es directamente el vector de acción.
- Capacidades multilingües: no aplica, al ser un modelo de control motor.

## Casos de uso

- Entrenamiento de políticas de manipulación en simulación: sirve como punto de partida para investigar el efecto de diferentes conjuntos de demostraciones en el éxito de tareas de pick-and-place.
- Validación de pipelines de LeRobot: permite probar el flujo completo de entrenamiento, evaluación y despliegue con un robot simulado antes de pasar a hardware real.
- Generación de datos sintéticos para imitación: el dataset asociado puede usarse para estudiar la influencia de la cantidad y calidad de demostraciones generadas automáticamente.
- Benchmark de control robótico: puede emplearse como referencia para comparar otros métodos de aprendizaje por imitación en la misma tarea simulada.
- Educación y prototipado rápido: estudiantes e investigadores pueden ejecutar el rollout del modelo en el simulador para entender cómo funciona ACT sin necesidad de un robot físico.
- Base para transferencia a robot real: aunque el modelo está entrenado en simulación, podría servir como inicialización para fine-tuning con datos reales, siempre que el robot y las cámaras coincidan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo pequeño (~51M parámetros), la inferencia puede ejecutarse en GPUs con 4-8 GB de VRAM, dependiendo de la resolución de las imágenes y el tamaño del batch.
- GPU recomendadas: cualquier GPU con soporte CUDA (por ejemplo, NVIDIA GTX 1080 Ti, RTX 2060, RTX 3090) es suficiente para inferencia en tiempo real en simulación.
- Cabe en GPUs de consumo: sí, cualquier GPU moderna con al menos 8 GB de VRAM puede manejar el modelo sin problemas.
- Opciones de despliegue: se usa principalmente mediante el framework LeRobot, que proporciona scripts de rollout (`lerobot-rollout`) y soporta ejecución en simulación con `so101_follower_sim`. También puede exportarse a otros formatos si se convierte.
- Latencia y throughput: no se proporcionan datos específicos, pero dado el tamaño del modelo y la resolución de entrada, se espera que la inferencia sea de decenas de milisegundos por paso en una GPU media.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos entrenados para la misma tarea o configuración. ACT es un método estándar en robótica de imitación, y existen múltiples variantes en el Hub de Hugging Face, pero sin datos de rendimiento comparables no es posible establecer una comparativa cuantitativa.

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| ilikirobot/act_generated_demo_20ep_50ep | 51,6M | no disponible | pick and place en simulacion | Apache-2.0 |
| Otros modelos ACT de LeRobot | varian (típicamente 50-100M) | no disponible | tareas de manipulacion variadas | Apache-2.0 |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con datos generados sintéticamente, por lo que su rendimiento en un robot real puede degradarse significativamente (problema de sim-to-real).
- Solo es capaz de ejecutar la tarea específica "pick red cube and place it in to the bin a"; no generaliza a otras tareas o variaciones de objetos sin reentrenamiento.
- No se han reportado evaluaciones en robot real ni en entornos variados; los resultados de éxito son desconocidos.
- Las imágenes de entrada deben coincidir exactamente con las cámaras y resoluciones usadas en el entrenamiento (side_cam y wrist_cam a 480x640), de lo contrario el modelo fallará.
- Al ser un modelo de imitación, puede heredar sesgos de las demostraciones (por ejemplo, trayectorias subóptimas o movimientos específicos del generador de datos).
- Riesgo de alucinación de acciones: si el entorno difiere del entrenamiento, el modelo puede producir comandos de acción erróneos sin mecanismos de seguridad adicionales.
- Licencia Apache-2.0 permite uso comercial, pero el autor no proporciona garantías de funcionamiento en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ilikirobot/act_generated_demo_20ep_50ep)
- [Dataset de entrenamiento](https://huggingface.co/datasets/ilikirobot/generated_demo_20ep_50ep)
- [Paper de ACT](https://huggingface.co/papers/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Guía de rollout de LeRobot](https://huggingface.co/docs/lerobot/main/en/inference)
