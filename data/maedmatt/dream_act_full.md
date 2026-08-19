# maedmatt/DREAM_ACT_full

## Resumen

DREAM_ACT_full es una política de imitación para robótica basada en el método Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. El modelo fue desarrollado por el usuario maedmatt y está diseñado para controlar un robot tipo `so_follower` (un seguidor de bajo coste) en la tarea específica de "Fill the pyramid with circles" (rellenar una pirámide con círculos), utilizando una única cámara frontal como entrada visual junto con el estado del robot.

El modelo resuelve el problema de aprender políticas de manipulación a partir de demostraciones teleoperadas, prediciendo secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de precisión. Con 51,7 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo. Su relevancia radica en ser un ejemplo práctico de entrenamiento y despliegue de políticas robóticas con herramientas open source (LeRobot), bajo licencia Apache-2.0, lo que permite su uso comercial sin restricciones.

La arquitectura es un transformer que procesa observaciones visuales y de estado para generar acciones de 6 dimensiones. El modelo fue entrenado durante 12.000 pasos con un dataset de 251 episodios y 134.782 frames a 30 FPS, recopilados mediante teleoperación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice secuencias de acciones futuras (chunks) en lugar de una única acción por paso. La arquitectura se basa en un transformer encoder-decoder que procesa dos tipos de observaciones: el estado del robot (vector de 6 dimensiones) y una imagen RGB de la cámara frontal (480x640 píxeles). La salida es un vector de acción de 6 dimensiones que representa los comandos de los actuadores del robot.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre el dataset `maedmatt/DREAM-pyramid-circles`, que contiene 251 episodios teleoperados (134.782 frames a 30 FPS) de la tarea de rellenar una pirámide con círculos. Se usó el optimizador AdamW con una tasa de aprendizaje de 1e-5, batch size de 64 y semilla 1000 durante 12.000 pasos de entrenamiento. No se aplicaron técnicas de RLHF ni DPO, ya que es un modelo de imitación puro.

## Capacidades

- Control robótico por imitación: ejecuta tareas de manipulación aprendidas de demostraciones teleoperadas.
- Percepción visual: procesa imágenes RGB de una cámara frontal (480x640) para guiar las acciones.
- Predicción de secuencias de acciones: genera chunks de acciones que mejoran la fluidez y precisión del movimiento.
- Entrada multimodal: combina estado del robot (6 dimensiones) con información visual.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de Hugging Face.
- Específico para robot `so_follower`: calibrado para un robot seguidor de bajo coste.

## Casos de uso

- Automatización de tareas de picking and placing: el modelo puede manipular objetos pequeños (círculos) y colocarlos en posiciones precisas (pirámide), demostrando capacidad para tareas repetitivas de ensamblaje.
- Prototipado rápido de políticas robóticas: investigadores pueden usar este modelo como punto de partida para entrenar políticas similares en sus propios robots con LeRobot, reduciendo el tiempo de desarrollo.
- Educación en robótica: sirve como ejemplo didáctico para enseñar aprendizaje por imitación con transformers y pipelines de entrenamiento reproducibles.
- Evaluación de hardware robótico de bajo coste: al estar diseñado para el robot `so_follower`, permite validar el rendimiento de plataformas económicas en tareas de manipulación.
- Benchmark de generalización: puede utilizarse para comparar el rendimiento de ACT frente a otros métodos de imitación (p. ej., Diffusion Policy) en tareas de precisión.
- Investigación en action chunking: el modelo proporciona una implementación de referencia de ACT con pesos entrenados, útil para estudiar el efecto de la longitud del chunk y otras variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se proporcionan métricas como tasa de éxito en la tarea, por lo que no es posible comparar cuantitativamente con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 51,7 millones de parámetros, la inferencia requiere aproximadamente 200-400 MB de VRAM en FP32, y menos en FP16. Cabe en cualquier GPU moderna con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (GTX 1060 o superior, RTX 3060, RTX 4090, A100, etc.). También puede ejecutarse en CPU para pruebas lentas.
- Compatibilidad con GPU de consumo: sí, es perfectamente ejecutable en GPUs de gama baja y media.
- Opciones de despliegue: LeRobot (pip install lerobot) con el comando `lerobot-rollout` para ejecutar la política en el robot. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. La latencia dependerá del hardware y de la velocidad de captura de cámara (30 FPS). En una GPU moderna se espera inferencia en tiempo real (< 33 ms por paso).

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DREAM_ACT_full (este) | ACT (Transformer) | 51,7 M | No aplica (robótica) | Apache-2.0 | Hugging Face |
| Diffusion Policy (Chi et al., 2023) | Diffusion sobre acciones | Variable (típicamente 10-100 M) | No aplica | MIT (código) | GitHub |
| ACT original (Zhao et al., 2023) | Transformer con action chunking | Variable (típicamente 80 M) | No aplica | MIT (código) | GitHub |

No se dispone de benchmarks comparativos entre estos modelos en la información proporcionada. ACT y Diffusion Policy son métodos alternativos de aprendizaje por imitación; ACT suele destacar en tareas de precisión con pocas demostraciones, mientras que Diffusion Policy puede manejar distribuciones multimodales de acciones. La elección depende de la tarea y los datos disponibles.

## Limitaciones y advertencias

- Entrenado para una única tarea: el modelo solo es capaz de ejecutar "Fill the pyramid with circles" y no generaliza a otras tareas sin reentrenamiento.
- Dependencia del hardware: requiere el robot `so_follower` y la configuración exacta de cámara (posición, orientación, resolución 480x640) con la que fue entrenado. Cambios en la iluminación o el fondo pueden degradar el rendimiento.
- Sin evaluación publicada: no hay resultados de tasa de éxito en robot real, por lo que su rendimiento efectivo es desconocido.
- Riesgo de sobreajuste: entrenado con 251 episodios, puede no generalizar a variaciones de la tarea (posiciones de objetos, distracciones).
- No es un modelo de lenguaje: no admite instrucciones en texto ni interacción conversacional.
- Sin cuantización publicada: no se ofrecen versiones GGUF u otros formatos optimizados para despliegue en edge.
- Requiere el ecosistema LeRobot: para ejecutar la política es necesario instalar la librería LeRobot y cumplir con sus dependencias (PyTorch, OpenCV, etc.).

## Enlaces

- Repositorio del modelo: https://huggingface.co/maedmatt/DREAM_ACT_full
- Dataset de entrenamiento: https://huggingface.co/datasets/maedmatt/DREAM-pyramid-circles
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
