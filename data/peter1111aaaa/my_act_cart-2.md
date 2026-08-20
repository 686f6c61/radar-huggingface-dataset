# peter1111aaaa/my_act_cart-2

## Resumen

El modelo `peter1111aaaa/my_act_cart-2` es una política de robótica basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario peter1111aaaa y entrenada con el framework LeRobot de Hugging Face. ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite un control más suave y robusto en tareas de manipulación robótica. Este modelo concreto está entrenado para la tarea de recoger un producto de un supermercado y colocarlo en una cesta, utilizando un robot tipo `omx_follower` con dos cámaras (frontal y de muñeca).

El modelo tiene 51,67 millones de parámetros y se distribuye en formato safetensors bajo licencia Apache-2.0. Fue entrenado con un dataset propio de 41 episodios teleoperados (58.805 frames a 30 FPS) durante 50.000 pasos de entrenamiento. Su relevancia radica en que demuestra un flujo completo de entrenamiento y despliegue de políticas ACT con LeRobot, un ecosistema de código abierto para robótica, y puede servir como punto de partida para desarrolladores que quieran implementar tareas similares de manipulación con aprendizaje por imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - Transformer con codificador y decodificador |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo procesa observaciones de estado e imágenes, no texto) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura basada en transformers diseñada para aprendizaje por imitación en robótica. El modelo recibe como entrada el estado del robot (6 dimensiones) y dos imágenes RGB de 480x640 píxeles (cámara frontal y cámara de muñeca), y produce como salida una secuencia de acciones de 6 dimensiones. La innovación clave de ACT es la predicción de chunks de acciones (varias acciones a la vez) en lugar de una sola acción, lo que reduce la acumulación de errores y mejora la suavidad del movimiento.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre un dataset propio (`peter1111aaaa/my_ACT_v1_20260819_115501`) que contiene 41 episodios teleoperados de la tarea "recoger un producto y ponerlo en la cesta". Se usaron 50.000 pasos de entrenamiento con batch size 8, optimizador AdamW y learning rate de 1e-5, con semilla 1000. No se menciona el uso de RLHF ni DPO; es un entrenamiento puramente supervisado de imitación.

## Capacidades

- Control robótico de manipulación: el modelo genera comandos de acción de 6 grados de libertad (posición y orientación del efector final) para ejecutar la tarea de pick-and-place.
- Percepción visual multimodal: procesa simultáneamente dos flujos de imagen (cámara frontal y cámara de muñeca) junto con el estado propioceptivo del robot.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Generalización limitada a la tarea específica: el modelo está especializado en la tarea de recoger un producto y colocarlo en una cesta, con el robot `omx_follower`.
- Integración con LeRobot: compatible con el ecosistema de herramientas de LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- No soporta tool calling, agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje; su "razonamiento" es implícito en la política de control.

## Casos de uso

- Automatización de picking en almacenes: el modelo puede integrarse en un robot `omx_follower` para recoger productos de estanterías y depositarlos en contenedores, reduciendo la intervención manual en tareas repetitivas de logística.
- Manipulación en entornos de retail: en tiendas o supermercados, el robot puede asistir en la preparación de pedidos, recogiendo artículos individuales y colocándolos en bolsas o cestas.
- Investigación en aprendizaje por imitación: sirve como referencia para estudiar el rendimiento de ACT con datasets pequeños (41 episodios) y para comparar con otras políticas entrenadas con LeRobot.
- Prototipado rápido de tareas robóticas: los desarrolladores pueden clonar este repositorio, adaptar el dataset y reentrenar el modelo para nuevas tareas de manipulación con el flujo de trabajo de LeRobot.
- Demostraciones educativas: es un ejemplo práctico de cómo entrenar y desplegar una política ACT en un robot real, útil para cursos de robótica y aprendizaje automático.
- Benchmarking de hardware robótico: el modelo puede usarse para validar el rendimiento de diferentes configuraciones de robots y cámaras, ya que sus entradas están estandarizadas (estado de 6 dimensiones, imágenes 480x640).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No hay datos de éxito en tareas, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,67 millones de parámetros, el modelo es muy ligero. En precisión FP32 ocupa aproximadamente 207 MB (51,67M × 4 bytes). En FP16 serían unos 103 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, GTX 1650, RTX 3060, RTX 4090) o incluso CPU para inferencia en tiempo real, dado el pequeño tamaño del modelo.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna, incluso en Jetson Nano o Raspberry Pi con aceleración.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo ejecutan en el robot. También se puede exportar a otros formatos si se desea, aunque no se documenta.
- Latencia y throughput: no se proporcionan datos oficiales. Dado el tamaño del modelo y la entrada de dos imágenes 480x640, se espera una inferencia en tiempo real (30 FPS) en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| peter1111aaaa/my_act_cart-2 | 51,67M | no disponible | Pick-and-place de un producto | Apache-2.0 | Hugging Face |
| ACT original (Zhao et al., 2023) | ~35M (configuración base) | no disponible | Manipulación general (tareas de la mesa) | MIT (paper) | Código abierto en GitHub |
| SmolVLA (peter1111aaaa/my_smolVLA_v2) | no disponible | no disponible | Visión-lenguaje-acción | Apache-2.0 | Hugging Face |

La comparativa es limitada porque no hay datos de rendimiento publicados para este modelo. ACT original es el método base, con una arquitectura similar pero entrenado en tareas diferentes. SmolVLA es un modelo más reciente de visión-lenguaje-acción que también se entrena con LeRobot, pero no se dispone de especificaciones detalladas en la información proporcionada.

## Limitaciones y advertencias

- No hay evaluación en robot real: la model card indica que no se han proporcionado resultados de éxito, por lo que se desconoce la fiabilidad del modelo en condiciones reales.
- Dataset de entrenamiento pequeño: solo 41 episodios, lo que puede limitar la generalización a variaciones de posición, iluminación o tipos de productos.
- Especialización limitada: el modelo está entrenado para una única tarea ("recoger un producto y ponerlo en la cesta") y no es transferible a otras tareas sin reentrenamiento.
- Dependencia de la configuración del robot: las observaciones y acciones están calibradas para el robot `omx_follower`; usarlo en otro robot requeriría adaptación.
- Riesgo de alucinación en acciones: como cualquier política de imitación, puede generar acciones incorrectas si las observaciones difieren del dominio de entrenamiento.
- Sin soporte de cuantización: no se proporcionan versiones cuantizadas, lo que puede limitar su despliegue en hardware muy restringido.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe verificar que el dataset de entrenamiento no tenga restricciones adicionales (no se especifican).

## Enlaces

- Repositorio del modelo: https://huggingface.co/peter1111aaaa/my_act_cart-2
- Dataset de entrenamiento: https://huggingface.co/datasets/peter1111aaaa/my_ACT_v1_20260819_115501
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=peter1111aaaa/my_ACT_v1_20260819_115501
