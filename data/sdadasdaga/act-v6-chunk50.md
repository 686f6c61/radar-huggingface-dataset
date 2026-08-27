# sdadasdaga/act-v6-chunk50

## Resumen

El modelo `sdadasdaga/act-v6-chunk50` es una política de aprendizaje por imitación basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario sdadasdaga (김민준) y entrenada con el framework LeRobot. ACT, propuesto por Zhao et al. en 2023 (arXiv:2304.13705), aborda el problema del control robótico por imitación prediciendo secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. Este modelo concreto está entrenado para la tarea "Grab the black cube" (agarrar un cubo negro) sobre un robot tipo `so_follower` con una cámara frontal.

El modelo tiene 51.617.414 parámetros (aproximadamente 51,6 millones) y un tamaño de repositorio de 0,2 GB, lo que lo hace ligero y ejecutable en hardware de consumo. Su relevancia radica en que demuestra un flujo completo de entrenamiento y despliegue de políticas robóticas con LeRobot, una librería de código abierto que estandariza el proceso de recopilación de datos, entrenamiento y evaluación. Al ser un modelo de robótica, no es un modelo de lenguaje ni de visión general; su entrada es una imagen (480×640) y un vector de estado de 6 dimensiones, y su salida es un vector de acción de 6 dimensiones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.617.414 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible (no es modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura basada en transformers que recibe observaciones multimodales —una imagen de cámara y el estado del robot— y produce un chunk de acciones futuras. En lugar de predecir una única acción por paso de control, el modelo genera una secuencia de acciones (por ejemplo, 50 pasos) que el robot ejecuta de forma autónoma, reduciendo la acumulación de errores y mejorando la suavidad del movimiento. El entrenamiento se realiza mediante aprendizaje por imitación a partir de demostraciones teleoperadas.

En este caso, el modelo fue entrenado con el dataset `sdadasdaga/grab-black-cube-30ep-v6_20260827_150153`, que contiene 30 episodios y 8.984 frames a 30 FPS, todos correspondientes a la tarea de agarrar un cubo negro. La configuración de entrenamiento incluye 100.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000, utilizando la versión 0.6.2 de LeRobot. No se especifica si se aplicaron técnicas adicionales como RLHF o DPO, ya que no son habituales en este tipo de políticas robóticas.

## Capacidades

- Aprendizaje por imitación: el modelo reproduce comportamientos aprendidos de demostraciones teleoperadas, específicamente la tarea de agarrar un cubo negro.
- Control robótico de 6 grados de libertad: entrada de estado de 6 dimensiones y salida de acción de 6 dimensiones, adecuado para robots tipo `so_follower`.
- Percepción visual: procesa imágenes de una cámara frontal de 480×640 píxeles en formato RGB.
- Predicción por chunks: genera secuencias de acciones (chunking) que permiten una ejecución más estable y fluida.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente robótico.

## Casos de uso

- Manipulación robótica de precisión: el modelo puede controlar un brazo robótico para agarrar objetos pequeños (como un cubo negro) en entornos controlados, útil en líneas de montaje o laboratorios de automatización.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del chunking de acciones en la tasa de éxito y la robustez frente a perturbaciones.
- Prototipado rápido de políticas robóticas: gracias a su pequeño tamaño (51,6 M parámetros) y al flujo de LeRobot, se puede entrenar y desplegar en pocas horas con un dataset reducido.
- Automatización de tareas repetitivas: en entornos de fabricación donde la tarea de "agarrar y colocar" es recurrente, el modelo puede sustituir la programación manual por aprendizaje a partir de demostraciones.
- Educación y formación en robótica: permite a estudiantes e investigadores experimentar con políticas de imitación sin necesidad de hardware de gama alta.
- Benchmarking de algoritmos de imitación: al estar disponible públicamente, puede usarse como referencia para comparar con otras arquitecturas (Diffusion Policy, etc.) en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." Por tanto, no hay datos de tasa de éxito en robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 51,6 M parámetros, la inferencia requiere menos de 1 GB de VRAM en FP32 (aproximadamente 206 MB de pesos). Con cuantización a FP16 o INT8, el consumo sería aún menor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060, etc. También puede ejecutarse en CPU para pruebas de baja frecuencia.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna.
- Opciones de despliegue: el modelo se ejecuta mediante el comando `lerobot-rollout` de LeRobot, que gestiona la captura de imágenes, el control del robot y la inferencia. No es compatible directamente con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se dispone de datos medidos. Dado el tamaño del modelo y la resolución de imagen (480×640), se espera una inferencia en tiempo real (≥30 FPS) en GPUs de gama media, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo concreto. Como referencia general, ACT se compara habitualmente con Diffusion Policy y Behavior Transformers en tareas de imitación robótica, pero no hay resultados específicos de este checkpoint. La siguiente tabla resume las diferencias arquitectónicas conocidas:

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo) | Transformer con chunking | 51,6 M | no aplica | Apache-2.0 | HuggingFace |
| Diffusion Policy | Red de difusion condicionada | variable (tipicamente 10-100 M) | no aplica | MIT (referencia) | Repos oficiales |
| Behavior Transformers | Transformer con discretizacion | variable | no aplica | MIT (referencia) | Repos oficiales |

Nota: los datos de Diffusion Policy y Behavior Transformers son orientativos y no provienen de la informacion proporcionada; se indican como contexto general.

## Limitaciones y advertencias

- Sin evaluacion en robot real: la model card no incluye resultados de pruebas físicas, por lo que la tasa de éxito real es desconocida.
- Dataset de entrenamiento pequeño: solo 30 episodios, lo que limita la generalización a variaciones de posición, iluminación o presencia de distractores.
- Tarea específica: el modelo está entrenado únicamente para "Grab the black cube"; no es transferible a otras tareas sin reentrenamiento.
- Dependencia de la configuración del robot: las entradas (estado de 6 dimensiones, cámara frontal) y la salida (acción de 6 dimensiones) están ligadas al robot `so_follower`; usarlo en otro hardware requiere adaptación.
- Riesgo de sobreajuste: con 100.000 pasos de entrenamiento sobre 8.984 frames, existe posibilidad de memorización de las demostraciones en lugar de aprendizaje de una política general.
- Sin soporte de idiomas ni procesamiento de lenguaje: no es un modelo multimodal en el sentido de texto o audio.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sdadasdaga/act-v6-chunk50
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Dataset de entrenamiento: https://huggingface.co/datasets/sdadasdaga/grab-black-cube-30ep-v6_20260827_150153
- Perfil del autor: https://huggingface.co/sdadasdaga
