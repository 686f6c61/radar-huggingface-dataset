# iFaz/eqm-pusht-seed3-half

## Resumen

El modelo `iFaz/eqm-pusht-seed3-half` es una política de aprendizaje por imitación (imitation learning) desarrollada por el usuario iFaz y entrenada con la librería LeRobot de Hugging Face. Está diseñada específicamente para resolver la tarea PushT-v0, un entorno de robótica simulado en MuJoCo donde un brazo robótico debe empujar un objeto con forma de T hasta una posición objetivo. El modelo emplea una arquitectura denominada "eqm" (no documentada públicamente) con 18,7 millones de parámetros, y su configuración indica que tiene desactivado un posible world model y utiliza dos vistas de predictor.

Este modelo es relevante como ejemplo de aplicación de técnicas de imitación a tareas de manipulación robótica de baja dimensión, y está publicado bajo licencia Apache 2.0, lo que permite su uso y modificación libre. Sin embargo, los resultados de evaluación muestran una tasa de éxito de solo el 8%, lo que indica un rendimiento limitado en la tarea. La fecha de creación (junio de 2026) y actualización (agosto de 2026) sugieren que es un trabajo reciente, probablemente experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | eqm (no documentada; config con `enable_world_model=False` y `num_predictor_views=2`) |
| Parametros totales | 18.688.308 |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de control motor, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta de idioma, aunque no es un modelo de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura "eqm" no está documentada en la información proporcionada. Según la configuración de entrenamiento, el modelo tiene un parámetro `enable_world_model` en falso y `num_predictor_views` igual a 2, lo que sugiere una arquitectura que predice acciones desde múltiples vistas o representaciones del estado. Es una política de imitación, es decir, aprende a mapear observaciones (imágenes o estados) a acciones a partir de demostraciones.

El entrenamiento se realizó con el dataset `lerobot/pusht`, que contiene demostraciones de la tarea PushT. Se usaron 20.000 pasos de entrenamiento con un batch size de 8 y semilla 3. No se especifica el número de tokens ni la composición del dataset, pero es un entorno de robótica simulado con estados de baja dimensión (posiciones y velocidades). No se menciona el uso de RLHF ni DPO; es un entrenamiento de imitación supervisada estándar.

## Capacidades

- Control motor para tareas de empuje de objetos en entornos simulados (PushT-v0).
- Aprendizaje por imitación a partir de demostraciones.
- Predicción de acciones con múltiples vistas del estado (según `num_predictor_views=2`).
- Integración con LeRobot para entrenamiento y evaluación.
- No es un modelo de lenguaje ni de visión; no genera texto ni procesa imágenes de forma autónoma.

## Casos de uso

- Investigación en aprendizaje por imitación para robótica: el modelo sirve como referencia para estudiar arquitecturas de predicción de acciones en tareas de manipulación.
- Benchmark de algoritmos de imitación: al estar publicado en LeRobot, puede compararse con otras políticas (ACT, Diffusion Policy, etc.) en el entorno PushT.
- Prototipado de controladores robóticos en simulación: aunque la tasa de éxito es baja, puede usarse como base para desarrollar variantes mejoradas.
- Educación en robótica y aprendizaje automático: útil para demostrar el flujo de entrenamiento y evaluación de políticas con LeRobot.
- Evaluación de técnicas de regularización o aumento de datos: al ser un modelo pequeño, permite iterar rápidamente en experimentos.
- Transferencia a entornos similares: el modelo puede adaptarse a variantes de PushT (por ejemplo, con Gazebo, como se ve en otro repo del mismo autor).

## Benchmarks y rendimiento

Según la model card, el modelo fue evaluado en 100 episodios de la tarea PushT-v0:

| Metrica | Valor |
|---|---|
| Episodios | 100 |
| Tasa de exito | 8.0% |
| Recompensa media acumulada | 55.76 |
| Recompensa maxima media | 0.54 |
| Tiempo de evaluacion (s) | 467.0 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo tiene solo 18,7 millones de parámetros, por lo que los pesos en precisión FP32 ocupan aproximadamente 75 MB (18.688.308 × 4 bytes). Cabe en cualquier GPU con al menos 1 GB de VRAM, incluso en CPU.
- La evaluación se realizó en CUDA, lo que indica que se usó una GPU, pero no se especifica el modelo exacto.
- Para entrenamiento, el batch size de 8 y 20.000 pasos son manejables en una GPU de gama media (por ejemplo, RTX 3060 o superior).
- El repositorio tiene un tamaño de 38.4 GB, lo que sugiere que incluye datos adicionales (posiblemente el dataset o checkpoints intermedios), pero la inferencia solo requiere los pesos safetensors.
- Opciones de despliegue: al ser compatible con LeRobot, puede ejecutarse en entornos Python con PyTorch. No se menciona soporte para vLLM, llama.cpp u otros motores de inferencia, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de imitación para PushT con parámetros similares). Existen otras políticas en LeRobot como ACT o Diffusion Policy, pero no se proporcionan datos de rendimiento para comparar. La tasa de éxito del 8% es baja en comparación con los resultados típicos reportados en la literatura para PushT (que suelen superar el 50% con métodos modernos), pero no hay datos concretos de otros modelos en este contexto.

## Limitaciones y advertencias

- Rendimiento muy bajo: la tasa de éxito del 8% indica que el modelo no es fiable para uso práctico en la tarea PushT.
- Entrenamiento limitado: solo 20.000 pasos y sin evaluación durante el entrenamiento (`eval_freq=0`), lo que puede haber provocado overfitting o falta de generalización.
- Arquitectura no documentada: no se explica qué es "eqm" ni sus fundamentos teóricos, lo que dificulta su reproducibilidad.
- Entorno simulado: el modelo está entrenado y evaluado en MuJoCo, no en hardware real; la transferencia a robots físicos no está validada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está listo para producción debido a su baja precisión.
- El repositorio es grande (38.4 GB) a pesar de los pesos pequeños, lo que puede dificultar la descarga y el uso en entornos con poco ancho de banda.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/iFaz/eqm-pusht-seed3-half
- Repositorio relacionado (variante Gazebo): https://huggingface.co/iFaz/eqm-pusht_gazebo-seed3-half
- Librería LeRobot: https://github.com/huggingface/lerobot
- Dataset `lerobot/pusht`: https://huggingface.co/datasets/lerobot/pusht
