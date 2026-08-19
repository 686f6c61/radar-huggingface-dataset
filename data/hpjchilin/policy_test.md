# hpjchilin/policy_test

## Resumen

El modelo `hpjchilin/policy_test` es una política robótica entrenada mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT), implementado con la librería LeRobot de Hugging Face. Desarrollado por el usuario hpjchilin, este modelo está diseñado para controlar un robot seguidor de tipo `so_follower` en la tarea concreta de "poner un ladrillo rojo en un cuenco". El modelo consume imágenes de dos cámaras (muñeca y lateral) junto con el estado del robot (6 dimensiones) y produce acciones de 6 dimensiones.

Con 51,7 millones de parámetros, este modelo representa un ejemplo de aplicación de transformadores a la robótica de manipulación, donde se predicen secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad del control. Su relevancia radica en ser una demostración práctica del flujo de trabajo de LeRobot para entrenar y desplegar políticas de imitación, aunque su entrenamiento es extremadamente limitado (solo 10 pasos y 11 episodios), lo que lo convierte en un prototipo de prueba más que en un sistema listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - transformer encoder-decoder |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de robótica, no procesa texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura ACT (Action Chunking with Transformers), presentada en el paper arXiv:2304.13705. Esta arquitectura se basa en un transformer encoder-decoder que procesa observaciones visuales y de estado para predecir un chunk de acciones futuras (típicamente de 10 a 100 pasos), en lugar de una sola acción. Esto permite un control más suave y consistente en tareas de manipulación robótica.

El entrenamiento se realizó con el framework LeRobot versión 0.6.1, sobre un dataset propio (`hpjchilin/so101_dataset_test_20260722_165800`) que contiene 11 episodios teleoperados, con 3444 frames a 30 FPS, correspondientes a la tarea "put the red brick in a bowl". La configuración de entrenamiento incluye 10 pasos de optimización, batch size de 8, optimizador AdamW y una tasa de aprendizaje de 1e-5. No se aplicaron técnicas de RLHF ni DPO, ya que es un método de aprendizaje supervisado por imitación.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones (posición y orientación del efector) para un robot seguidor.
- Percepción visual multimodal: procesa imágenes de dos cámaras (muñeca y lateral) con resolución 480x640 píxeles y 3 canales.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Predicción de secuencias de acciones: genera chunks de acciones para mejorar la estabilidad del movimiento.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot (comandos `lerobot-rollout` y `lerobot-train`).
- Tarea específica: entrenado para una única tarea de pick-and-place (ladrillo rojo en cuenco), no generaliza a otras tareas sin reentrenamiento.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el comportamiento de ACT con datasets pequeños y evaluar el impacto del número de episodios en el rendimiento.
- Demostración de LeRobot: útil para probar el flujo completo de LeRobot (grabación de datos, entrenamiento, despliegue) en un entorno de laboratorio.
- Prototipado rápido de tareas de manipulación: en entornos controlados, permite validar la viabilidad de una tarea antes de invertir en datasets más grandes.
- Educación en robótica: como ejemplo didáctico para enseñar conceptos de aprendizaje por imitación y control basado en transformadores.
- Benchmarking de hardware: permite medir la latencia de inferencia de modelos ACT en diferentes GPUs o incluso CPU, dado su tamaño reducido.
- Pruebas de integración de sensores: al requerir dos cámaras y un robot específico, puede usarse para verificar la calibración y sincronización de sensores en el entorno LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito ni métricas de evaluación en el robot real. El campo de evaluación está marcado como "No evaluation results have been provided for this policy yet".

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 51,7 millones de parámetros, la inferencia requiere menos de 1 GB de VRAM en FP32 (aproximadamente 207 MB para los pesos). Con cuantización a FP16 o INT8, el requisito es aún menor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo NVIDIA GTX 1050 Ti, RTX 2060 o superiores. También puede ejecutarse en CPU para pruebas de baja frecuencia.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna. Incluso en hardware integrado como una Raspberry Pi podría ejecutarse, aunque con baja frecuencia de control.
- Opciones de despliegue: LeRobot ofrece comandos CLI (`lerobot-rollout`) que gestionan la inferencia. También es posible exportar el modelo a otros formatos (por ejemplo, ONNX) para despliegue con TensorRT o similar.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño del modelo, se espera una latencia de inferencia inferior a 10 ms en una GPU moderna (por ejemplo, RTX 3080), lo que permite operar a 30 FPS sin problemas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El modelo es una implementación de ACT dentro de LeRobot, por lo que es comparable en arquitectura al ACT original descrito en el paper arXiv:2304.13705, pero con un entrenamiento mucho más limitado. Alternativas como Diffusion Policy (también disponible en LeRobot) ofrecen un enfoque diferente basado en modelos de difusión para generar acciones, pero no hay resultados de rendimiento comparables publicados para este modelo concreto.

## Limitaciones y advertencias

- Entrenamiento extremadamente limitado: solo 10 pasos de optimización y 11 episodios de datos, lo que hace que el modelo esté muy sobreajustado al dataset de entrenamiento y probablemente no generalice a variaciones de la tarea (nuevas posiciones, iluminación, etc.).
- Sin evaluación en robot real: no se han reportado tasas de éxito, por lo que se desconoce su rendimiento real en el hardware.
- Tarea específica: el modelo solo puede ejecutar la tarea "put the red brick in a bowl"; cualquier otra tarea requiere reentrenamiento.
- Riesgo de alucinación de acciones: al ser un modelo de imitación con pocos datos, puede producir acciones incoherentes si las observaciones difieren de las del entrenamiento.
- Sesgos del dataset: los datos provienen de un único operador y entorno, lo que limita la robustez ante cambios en el escenario.
- Licencia Apache-2.0: permite uso comercial, pero el modelo se distribuye sin garantías y no incluye responsabilidad del autor por daños derivados de su uso.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/hpjchilin/policy_test)
- [Dataset de entrenamiento](https://huggingface.co/datasets/hpjchilin/so101_dataset_test_20260722_165800)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [LeRobot (GitHub)](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
