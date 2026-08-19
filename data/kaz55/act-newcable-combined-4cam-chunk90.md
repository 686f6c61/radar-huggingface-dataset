# Kaz55/act-newcable-combined-4cam-chunk90

## Resumen

El modelo `Kaz55/act-newcable-combined-4cam-chunk90` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales. Ha sido entrenado con la librería LeRobot sobre un conjunto de datos de teleoperación del robot UR5e con una mano DG-5F, especializado en tareas de manipulación de cables. El modelo combina observaciones de estado del robot (26 dimensiones) con imágenes de cuatro cámaras (dos Realsense y dos GelSight) para generar comandos de acción de 26 dimensiones.

Desarrollado por Kaz55 (Kazutaka), este modelo forma parte de una serie de políticas ACT publicadas en Hugging Face para el mismo robot y tarea. Con 51,7 millones de parámetros, es una política de tamaño moderado que puede ejecutarse en hardware de consumo. Su relevancia radica en que demuestra la aplicación práctica de ACT en un escenario real de manipulación con múltiples sensores, incluyendo cámaras táctiles, y está disponible bajo licencia Apache 2.0, lo que permite su uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con VAE condicional |
| Parametros totales | 51.699.354 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo procesa observaciones de un solo paso, no secuencias de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión completa) |
| Idiomas soportados | no aplica (modelo de control robótico, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura basada en transformers que utiliza un codificador-decodificador con una VAE condicional (CVAE) para modelar la distribución de acciones. El modelo recibe observaciones visuales (imágenes de cuatro cámaras) y el estado del robot (posición, velocidad, etc.) y genera un chunk de 90 acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad del control en tareas de manipulación. El nombre del repositorio indica `chunk90`, lo que sugiere que el tamaño del chunk es 90, aunque la model card no lo especifica explícitamente.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.0) sobre el dataset `Kaz55/dg5f_ur5e_newcable_combined`, que contiene 180 episodios teleoperados y 208.933 frames a 30 FPS. Se utilizó el optimizador AdamW con una tasa de aprendizaje de 1e-5, batch size de 8 y 200.000 pasos de entrenamiento. El modelo se entrenó para la tarea "DG-5F and UR5e manipulation", centrada en la manipulación de cables. No se menciona el uso de técnicas de RLHF o DPO, ya que es un método de aprendizaje por imitación supervisado.

## Capacidades

- Generación de comandos de acción para control robótico: predice 26 dimensiones de acción (posiciones articulares, fuerzas, etc.) para el robot UR5e con mano DG-5F.
- Procesamiento multimodal: integra observaciones de estado (vector de 26 dimensiones) y visión de cuatro cámaras simultáneas (dos RGB y dos táctiles GelSight).
- Aprendizaje por imitación: reproduce comportamientos teleoperados con alta fidelidad en la tarea específica de manipulación de cables.
- Generalización limitada: el modelo está especializado en la tarea y configuración de sensores con las que fue entrenado; no es un modelo generalista.
- Sin capacidades de lenguaje, razonamiento simbólico o tool calling: es exclusivamente una política de control de bajo nivel.

## Casos de uso

- Manipulación de cables en entornos industriales: el modelo puede controlar un UR5e equipado con una mano DG-5F para realizar tareas de inserción, guiado o conexión de cables, reduciendo la intervención humana en líneas de ensamblaje.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del tamaño de chunk, el número de cámaras o la combinación de sensores táctiles y visuales en políticas ACT.
- Desarrollo de sistemas de teleoperación asistida: el modelo puede ejecutarse en tiempo real para asistir a un operador humano, sugiriendo o ejecutando acciones parciales durante tareas de cableado.
- Automatización de bancos de prueba: en laboratorios de electrónica, el robot puede realizar tareas repetitivas de conexión de conectores o verificación de cables, liberando a los técnicos.
- Benchmark de robótica de manipulación: al estar disponible con un dataset público y licencia abierta, puede usarse como referencia para comparar nuevos algoritmos de aprendizaje por imitación.
- Transferencia a tareas similares: con un fine-tuning sobre datos de otras tareas de manipulación de objetos deformables, el modelo podría adaptarse a nuevos escenarios, aunque requiere datos adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay datos de tasas de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con 51,7 millones de parámetros y entradas de imagen de 480x640 (dos) y 375x500 (dos), se estima que la inferencia requiere entre 2 y 4 GB de VRAM en precisión FP32, y menos de 2 GB en FP16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) debería ser suficiente para inferencia en tiempo real. Para entrenamiento, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4070, A100).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo gracias a su tamaño reducido.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) que se integran con el robot y las cámaras. También es posible exportar el modelo a ONNX o TensorRT para despliegue en edge, aunque no está documentado en el repositorio.
- Latencia y throughput: no disponibles. Dependerá de la GPU y del pipeline de captura de imágenes (cuatro cámaras simultáneas).

## Comparativa con modelos similares

No se dispone de modelos comparables con datos públicos de rendimiento en la misma tarea y robot. El autor ha publicado otras variantes de ACT para el mismo robot (por ejemplo, `Kaz55/act-newcablev5-4cam-chunk60` y `Kaz55/act_cablesort_ebata_chunk_size_53`), que probablemente difieren en el tamaño de chunk o en la configuración de datos, pero no se han publicado comparativas entre ellos. En general, las políticas ACT de LeRobot suelen tener arquitecturas similares con variaciones en el número de parámetros según el backbone de visión y el tamaño del transformer.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay datos de éxito en tareas reales, por lo que su rendimiento efectivo es desconocido.
- Especialización limitada: el modelo solo funciona con el robot DG-5F y UR5e, con las cámaras específicas (Realsense y GelSight) y la tarea de manipulación de cables. Cambiar la configuración de sensores o el robot requiere reentrenamiento.
- Riesgo de sobreajuste: entrenado con 180 episodios, puede no generalizar a variaciones de posición de objetos, iluminación o condiciones del entorno no vistas en el dataset.
- Dependencia de calibración: el uso en el robot real requiere una calibración precisa de las cámaras y del espacio de trabajo, como se indica en la documentación de LeRobot.
- Sin capacidades de razonamiento o planificación: es una política reactiva que no puede manejar tareas que requieran razonamiento de alto nivel o planificación a largo plazo.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario es responsable del cumplimiento de las patentes asociadas al método ACT si las hubiera.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Kaz55/act-newcable-combined-4cam-chunk90
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Dataset de entrenamiento: https://huggingface.co/datasets/Kaz55/dg5f_ur5e_newcable_combined
- LeRobot (librería): https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guía de rollout de LeRobot: https://huggingface.co/docs/lerobot/main/en/inference
- Perfil del autor: https://huggingface.co/Kaz55
