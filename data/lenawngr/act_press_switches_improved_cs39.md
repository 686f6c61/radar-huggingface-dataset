# lenawngr/ACT_press_switches_improved_cs39

## Resumen

ACT_press_switches_improved_cs39 es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado originalmente en el paper arXiv:2304.13705. El modelo lo ha desarrollado el usuario lenawngr y se distribuye a través de Hugging Face con la librería LeRobot, el framework de Hugging Face para aprendizaje por imitación en robótica. No es un modelo de lenguaje: es un controlador visuomotor que traduce observaciones (imágenes de cámara y estado de las articulaciones) en secuencias de acciones para un brazo robótico.

El modelo está especializado en una tarea concreta: pulsar interruptores (press switches) con un robot SO-101, según se deduce del identificador del dataset de entrenamiento (`press_switches_so101_improved`). Con 51.606.150 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto pensado para inferencia en tiempo real sobre hardware modesto.

Su relevancia es práctica: ejemplifica el flujo actual de entrenamiento de políticas robóticas con LeRobot, donde un usuario puede entrenar, publicar y desplegar un controlador específico de tarea en pocas horas. La licencia Apache 2.0 facilita su reutilización y adaptación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.606.150 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; procesa observaciones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo visuomotor, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot |
| Pipeline | robotics |
| Dataset de entrenamiento | lenawngr/press_switches_so101_improved |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice trozos cortos de acciones (action chunks) en lugar de pasos individuales. La arquitectura combina un codificador de imágenes (típicamente ResNet) con un transformer que fusiona observaciones visuales y el estado de las articulaciones, y un decodificador que genera la secuencia de acciones. La predicción por chunks reduce el error de acumulación y mejora la estabilidad del control, además de permitir un entrenamiento eficiente con datasets de teleoperación relativamente pequeños.

El modelo se ha entrenado con el dataset `lenawngr/press_switches_so101_improved`, que contiene episodios de teleoperación de la tarea de pulsar interruptores con un robot SO-101. No se dispone de información sobre el número de episodios, el volumen de tokens de entrenamiento (no aplica en el sentido lingüístico) ni sobre el uso de técnicas de RLHF o DPO; en ACT el entrenamiento es supervisado por imitación (behavior cloning) con una pérdida L1 sobre las acciones predichas. No se han documentado innovaciones adicionales más allá del propio método ACT.

## Capacidades

- Control visuomotor: genera secuencias de acciones articulares a partir de imágenes de cámara y del estado del robot.
- Predicción por chunks: emite bloques de acciones en lugar de pasos sueltos, lo que mejora la suavidad y la robustez del movimiento.
- Ejecución de una tarea específica: pulsar interruptores con un robot SO-101.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de datos de teleoperación.
- Integración con LeRobot: entrenamiento, evaluación y despliegue mediante las herramientas `lerobot-train` y `lerobot-record`.
- No soporta tool calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Automatización de una tarea de pulsado de interruptores en un banco de pruebas: el modelo controla el brazo SO-101 para accionar interruptores de forma repetible, útil en entornos de laboratorio o demostraciones.
- Prototipado rápido de políticas robóticas: sirve como punto de partida para que otros usuarios adapten el pipeline de LeRobot a sus propias tareas de manipulación.
- Evaluación de métodos de imitación: al ser un checkpoint ACT publicado, permite comparar el rendimiento de ACT frente a otras políticas sobre el mismo robot y tarea.
- Formación y docencia: ejemplo real y reproducible de entrenamiento de una política visuomotora con datos de teleoperación.
- Investigación en manipulación robótica: base para experimentos de generalización, variaciones de iluminación o cambios de posición de los interruptores.
- Despliegue en hardware de bajo coste: al tener 51,6 millones de parámetros y 0,2 GB de pesos, puede ejecutarse en estaciones de trabajo con GPU consumer para inferencia en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del modelo (51,6 M de parámetros y 0,2 GB de pesos) es previsible que quepa en GPUs con 4-8 GB de VRAM, aunque no se ha confirmado.
- GPU recomendadas: no disponible. El comando de entrenamiento de la model card usa `--policy.device=cuda`, lo que indica soporte para GPU NVIDIA.
- GPU consumer: muy probablemente compatible con RTX 3060, RTX 4060 o superiores, dado el reducido tamaño del modelo; sin datos oficiales de latencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de CUDA. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT_press_switches_improved_cs39 | 51,6 M | no aplica | Pulsar interruptores (SO-101) | Apache 2.0 | Hugging Face |
| Diffusion Policy (referencia del estado del arte en imitación) | no disponible | no aplica | Manipulación robótica general | no disponible | Repositorios de investigación |
| Otras políticas LeRobot publicadas | variable | no aplica | Tareas específicas de robot | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una única tarea (pulsar interruptores con SO-101) y no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Sin datos de evaluación: no hay métricas publicadas de tasa de éxito, robustez o generalización.
- Dependencia del entorno: el rendimiento puede degradarse con cambios de iluminación, posición de los interruptores o del robot respecto a las condiciones de entrenamiento.
- Sin capacidades lingüísticas ni de razonamiento: no debe usarse como modelo de lenguaje ni para tareas de texto.
- Sesgos: no documentados; en robótica, los sesgos provienen de la distribución de los datos de teleoperación, que no se ha detallado.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas fuera de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lenawngr/ACT_press_switches_improved_cs39
- Dataset de entrenamiento: https://huggingface.co/datasets/lenawngr/press_switches_so101_improved
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
