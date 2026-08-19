# Kouch/SO101_IsaacSim_Test_V3

## Resumen

El modelo `Kouch/SO101_IsaacSim_Test_V3` es un agente robótico basado en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Desarrollado por el usuario Kouch, el modelo ha sido entrenado con la librería LeRobot de Hugging Face para controlar un brazo robótico SO-101 en una tarea de pick-and-place de un cubo azul en un entorno simulado con NVIDIA Isaac Sim. Con 51,7 millones de parámetros, el modelo consume una imagen de una cámara superior y el estado del robot (6 valores) para generar acciones de control de 6 dimensiones.

La relevancia de este modelo radica en que ejemplifica un flujo completo de entrenamiento de políticas robóticas en simulación con LeRobot y su posterior publicación en el Hub de Hugging Face, sirviendo como referencia para la comunidad de robótica de bajo coste y para experimentos de simulación a real (sim-to-real). Aunque no se han publicado resultados de evaluación, el modelo está disponible bajo licencia Apache 2.0 y puede ser ejecutado directamente con las herramientas de LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión y control robótico) |
| Tipos de cuantización | No disponible (pesos en safetensors) |
| Idiomas soportados | No aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (0.2 GB) |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura **Action Chunking with Transformers (ACT)**, presentada en el paper [2304.13705](https://huggingface.co/papers/2304.13705). ACT es un método de aprendizaje por imitación que utiliza un transformer para predecir una secuencia de acciones (chunk) a partir de observaciones actuales. El modelo se entrena con datos teleoperados y ha demostrado alta tasa de éxito en tareas de manipulación. En este caso, el entrenamiento se realizó con el dataset `Kouch/SO101_IsaacSim_Block_Pick_and_Place_V2`, que contiene 20 episodios y 8.083 fotogramas a 30 FPS, capturados en simulación. La configuración de entrenamiento incluyó 100.000 pasos, batch size de 8, optimizador AdamW con learning rate 1e-5 y semilla 1000, usando la versión 0.6.2 de LeRobot. No se menciona el uso de RLHF ni DPO; se trata de un aprendizaje por imitación puro.

## Capacidades

- **Control robótico de tarea de pick-and-place**: el modelo recibe una imagen RGB de 480x640 píxeles de una cámara superior y el estado del robot (6 valores), y produce una acción de control de 6 dimensiones (posiciones de articulaciones o comandos de pinza).
- **Predicción de acciones por lotes (chunking)**: gracias a ACT, el modelo predice secuencias de acciones en lugar de pasos individuales, lo que mejora la estabilidad del control.
- **Ejecución en simulación**: está diseñado para operar en entornos de Isaac Sim, pero puede transferirse a un robot real SO-101 (según la guía del curso de NVIDIA).
- **No soporta**: lenguaje natural, tool calling, razonamiento de múltiples pasos ni procesamiento de texto. Es un modelo puramente sensoriomotor.

## Casos de uso

- **Investigación en aprendizaje por imitación**: sirve como ejemplo de entrenamiento de políticas con LeRobot en entornos simulados, permitiendo estudiar el efecto de la arquitectura ACT en tareas de manipulación.
- **Benchmark de simulación para sim-to-real**: el modelo puede utilizarse como punto de partida para experimentos de transferencia sim-to-real con el robot SO-101, siguiendo la guía oficial de NVIDIA.
- **Prototipado rápido de tareas de manipulación**: dado su pequeño tamaño (51.7 M parámetros), es adecuado para probar pipelines de entrenamiento en GPU de gama media antes de escalar a modelos más grandes.
- **Educación y talleres**: se integra en el taller de NVIDIA "Sim-to-Real SO-101", que enseña el flujo completo de recopilación de datos, entrenamiento y despliegue de políticas robóticas.
- **Pruebas de robustez en simulación**: se puede ejecutar en múltiples episodios de simulación para medir la tasa de éxito en la tarea de pick-and-place bajo diferentes configuraciones.
- **Integración con LeRobot**: permite a los desarrolladores aprender a usar la API de LeRobot para entrenar, evaluar y publicar políticas robóticas en el Hub.

## Benchmarks y rendimiento

No se han publicado resultados de evaluación para este modelo. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." Por tanto, no se dispone de métricas de éxito en robot real ni en simulación.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 51.7 M parámetros con entradas de imagen, la inferencia puede ejecutarse en una GPU con 4-6 GB de VRAM. En CPU también es factible, aunque con mayor latencia.
- **GPU recomendadas**: cualquier GPU moderna con soporte CUDA (por ejemplo, RTX 3060, RTX 4090, A100) para inferencia y entrenamiento. El entrenamiento con 100.000 pasos y batch 8 probablemente requiera al menos 8 GB de VRAM.
- **Compatibilidad con GPUs de consumo**: sí, cabe en tarjetas de gama media como RTX 3060 (12 GB) o RTX 4070.
- **Opciones de despliegue**: LeRobot ofrece scripts de rollout (por ejemplo, `lerobot-rollout`) para ejecutar el modelo en el robot SO-101. También puede usarse con la API de Python de LeRobot para inferencia en simulación.
- **Latencia y throughput**: no disponible, depende del hardware y de la configuración de la cámara.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables dentro del mismo ámbito (políticas ACT entrenadas en simulación para SO-101). La comparación con otras arquitecturas de aprendizaje robótico (por ejemplo, Diffusion Policy) no se ha documentado en la información proporcionada.

## Limitaciones y advertencias

- **Sesgo de simulación**: el modelo se entrenó exclusivamente en Isaac Sim, por lo que puede no transferirse bien al mundo real sin adaptación (sim-to-real gap).
- **Alucinación de acciones**: al ser un modelo de imitación, puede generar acciones erróneas si la observación difiere de las distribuciones de entrenamiento.
- **Limitación de contexto**: no soporta entrada de texto ni instrucciones complejas; solo la tarea específica de pick-and-place.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en aplicaciones reales.
- **Datos de entrenamiento limitados**: solo 20 episodios, lo que limita la generalización a variaciones de la tarea o del entorno.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Kouch/SO101_IsaacSim_Test_V3)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Kouch/SO101_IsaacSim_Block_Pick_and_Place_V2)
- [Paper de ACT (arXiv)](https://huggingface.co/papers/2304.13761)
- [LeRobot (GitHub)](https://github.com/huggingface/lerobot)
- [Curso de NVIDIA sobre SO-101 sim-to-real](https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/index.html)
- [Repositorio de código del workshop de NVIDIA](https://github.com/isaac-sim/Sim-to-Real-SO-101-Workshop)
