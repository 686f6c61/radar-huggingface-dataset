# maedmatt/DREAM_ACT_filtered_v2

## Resumen

El modelo `maedmatt/DREAM_ACT_filtered_v2` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Ha sido desarrollado por el usuario maedmatt y entrenado con la librería LeRobot de HuggingFace sobre un conjunto de datos teleoperado específico. El modelo está diseñado para ejecutar la tarea "Fill the pyramid with circles" con un robot tipo `so_follower` y una cámara frontal.

Con 51,7 millones de parámetros, es un modelo compacto que se ajusta a entornos de investigación y prototipado. Su relevancia radica en demostrar el flujo completo de LeRobot para entrenar y desplegar políticas de imitación en robótica real, aunque no se han publicado resultados de evaluación. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas.

El modelo consume observaciones de estado (6 dimensiones) e imágenes RGB de 480x640 píxeles, y produce acciones de 6 dimensiones. Está entrenado con 151 episodios (81 266 fotogramas) y 12 500 pasos de optimización, lo que lo convierte en un ejemplo de política de imitación a pequeña escala, útil para validar metodologías y experimentar con ACT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), basada en transformer con CVAE (paper arxiv:2304.13705) |
| Parametros totales | 51 668 614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo procesa imágenes y estado, no texto) |
| Tipos de cuantizacion | no disponible (pesos en precisión completa, sin cuantización publicada) |
| Idiomas soportados | no aplica (modelo de robótica, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT, que combina un transformer con un Conditional Variational Autoencoder (CVAE). En lugar de predecir una única acción por paso, ACT genera un "chunk" de acciones futuras, lo que mejora la estabilidad y el éxito en tareas de manipulación. La entrada se compone de un vector de estado de 6 dimensiones y una imagen RGB de 480x640, mientras que la salida es un vector de acción de 6 dimensiones.

El entrenamiento se realizó con LeRobot versión 0.6.2 sobre el dataset `maedmatt/DREAM-pyramid-circles`, que contiene 151 episodios teleoperados (81 266 fotogramas a 30 FPS) de la tarea "Fill the pyramid with circles". Se usaron 12 500 pasos de entrenamiento con batch size 64, optimizador AdamW y learning rate 2e-5, con semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento; es un entrenamiento puramente supervisado de imitación.

## Capacidades

- Control de robot manipulador: genera acciones de 6 grados de libertad a partir de observaciones de estado e imágenes.
- Aprendizaje por imitación: reproduce comportamientos teleoperados en la tarea específica de apilar círculos en una pirámide.
- Procesamiento visual: utiliza una cámara frontal para percibir el entorno (imágenes de 480x640).
- Predicción por chunks: emite secuencias de acciones, lo que reduce la acumulación de errores frente a políticas paso a paso.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de HuggingFace.
- No tiene capacidades de lenguaje, tool calling, agentes ni razonamiento simbólico; es una política puramente motora.

## Casos de uso

- Automatización de tareas de manipulación en laboratorio: el modelo puede ejecutar tareas repetitivas de apilado o colocación de objetos con un brazo robótico, reduciendo la intervención humana.
- Prototipado de políticas de imitación: sirve como base para experimentar con ACT en LeRobot, permitiendo iterar sobre datasets y configuraciones de entrenamiento.
- Investigación en aprendizaje por imitación: su pequeño tamaño facilita estudios comparativos de arquitecturas, hiperparámetros y técnicas de aumento de datos.
- Demostración de despliegue en robótica real: el flujo `lerobot-rollout` permite validar la política en un robot físico `so_follower` con configuración mínima.
- Benchmark de rendimiento de políticas: aunque no hay resultados publicados, puede usarse como punto de partida para medir tasas de éxito en la tarea de pirámide de círculos.
- Educación y formación: útil para enseñar el ciclo completo de recolección de datos, entrenamiento y evaluación en robótica con herramientas open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente "No evaluation results have been provided for this policy yet". Por tanto, no hay datos de tasas de éxito, precisión ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 51,7 millones de parámetros con entrada de imagen 480x640, la inferencia requiere aproximadamente 2-4 GB de VRAM en precisión FP32, dependiendo del batch size y del framework. No se dispone de datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1650, RTX 3060 o superiores. Para entrenamiento, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080, A100).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media y baja gracias a su tamaño reducido.
- Opciones de despliegue: LeRobot proporciona el comando `lerobot-rollout` para ejecutar la política en robots compatibles. También puede integrarse con frameworks de inferencia como PyTorch directamente.
- Latencia y throughput: no disponibles. La latencia dependerá del hardware, la resolución de imagen y el tamaño del chunk de acciones.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas ACT para la misma tarea o robot). El modelo es específico de un dataset y un robot concretos, y no se han publicado comparativas con otras políticas como Diffusion Policy o RDT. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo es válido para la tarea "Fill the pyramid with circles" y el robot `so_follower`; no generaliza a otras tareas ni entornos sin reentrenamiento.
- Sin evaluación publicada: no hay datos de éxito en el robot real, por lo que su rendimiento efectivo es desconocido.
- Dataset pequeño: 151 episodios pueden ser insuficientes para cubrir variaciones de iluminación, posición de objetos o perturbaciones, lo que puede provocar fallos en condiciones no vistas.
- Dependencia de la cámara: la política requiere una cámara frontal calibrada con la misma resolución y orientación que en el entrenamiento; cambios en la configuración degradan el rendimiento.
- Sin soporte de lenguaje ni interacción simbólica: no puede interpretar instrucciones verbales ni razonar sobre tareas abstractas.
- Riesgo de sobreajuste: el entrenamiento con un único dataset y sin regularización explícita puede llevar a memorizar trayectorias específicas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no incluye garantías de seguridad; su uso en robots físicos requiere supervisión y pruebas exhaustivas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/maedmatt/DREAM_ACT_filtered_v2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/maedmatt/DREAM-pyramid-circles
- Librería LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
