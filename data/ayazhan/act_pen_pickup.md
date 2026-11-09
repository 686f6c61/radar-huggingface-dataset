# ayazhan/act_pen_pickup

## Resumen

`ayazhan/act_pen_pickup` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo lo publica el usuario ayazhan en Hugging Face utilizando LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real. Resuelve una tarea concreta de manipulación: recoger la tapa de un bolígrafo y colocarla en una zona marcada, sobre un robot de tipo `so_follower`.

La arquitectura es un transformer ACT con 51.668.614 parámetros totales, que consume el estado articular (vector de 6 dimensiones) y dos cámaras (muñeca y frontal, ambas a 480x640 píxeles) para producir un vector de acción de 6 dimensiones. El entrenamiento se realizó sobre un dataset propio de 20 episodios y 7804 fotogramas a 30 FPS, durante 5000 pasos con batch de 8 y optimizador AdamW.

Es relevante como ejemplo práctico de política de imitación lista para desplegar con LeRobot en un robot SO-100/SO-101, y como referencia de cómo se estructura y publica un checkpoint ACT en el ecosistema de Hugging Face. No es un modelo de lenguaje: no procesa ni genera texto, y sus capacidades están acotadas estrictamente a la tarea física para la que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de robótica) |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de un único paso, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La política recibe como entrada el estado del robot (`observation.state`, shape `(6,)`) y dos flujos visuales (`observation.images.wrist` y `observation.images.front`, shape `(3, 480, 640)`), y emite un vector de acción de shape `(6,)`. El modelo tiene 51.668.614 parámetros y se distribuye en safetensors dentro de un repositorio de 0,2 GB.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `ayazhan/pen_pickup_20261108_174043`, compuesto por 20 episodios y 7804 fotogramas a 30 FPS, con la tarea "Pick up the pen cover and place it in the marked zone." La configuración fue de 5000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; es aprendizaje supervisado a partir de demostraciones de teleoperación.

## Capacidades

- Manipulación robótica de una tarea concreta: recoger la tapa de un bolígrafo y depositarla en una zona marcada.
- Control de un robot `so_follower` con 6 dimensiones de acción y 6 dimensiones de estado.
- Fusión de dos cámaras (muñeca y frontal) con resolución 480x640 a 30 FPS.
- Predicción de action chunks, lo que permite ejecutar movimientos más suaves y con menor deriva que políticas paso a paso.
- Ejecución en bucle mediante `lerobot-rollout` con duración configurable.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modo de pensamiento; no es un modelo de lenguaje.

## Casos de uso

- Automatización de una celda de pick-and-place de laboratorio: la política se ejecuta en bucle con `lerobot-rollout` sobre un SO-100/SO-101 para mover repetidamente la tapa de un bolígrafo a la zona marcada, aprovechando que la tarea es de corto alcance y el modelo está especializado en ella.
- Base para fine-tuning con más datos: al ser un checkpoint ACT entrenado con LeRobot, se puede reutilizar como inicialización en `lerobot-train` para tareas de manipulación similares, reduciendo el número de pasos necesarios frente a entrenar desde cero.
- Referencia de pipeline de aprendizaje por imitación: sirve como ejemplo reproducible de grabación de datos con teleoperación, entrenamiento ACT y publicación en el Hub, útil para docencia o para validar una instalación de LeRobot.
- Pruebas de integración hardware-software: permite verificar la calibración de cámaras, la asignación de puertos del robot y la frecuencia de control antes de abordar tareas más complejas.
- Benchmark interno de éxito en manipulación: aunque el autor no publica tasas de éxito, la política se puede usar como línea base para comparar variantes de ACT, cambios de resolución o aumentos de datos en el mismo montaje físico.
- Demostración de robótica en entornos educativos: el repositorio es ligero (0,2 GB) y el comando de despliegue está documentado, lo que facilita montar una demo de manipulación con hardware de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del checkpoint (51,7 M de parámetros, repo de 0,2 GB), la inferencia es viable en GPUs de consumo con pocos GB de VRAM.
- GPU recomendadas: no especificadas por el autor. El comando de entrenamiento documentado usa `--policy.device=cuda`, por lo que se asume una GPU NVIDIA compatible con CUDA.
- GPU de consumo: previsiblemente cabe en tarjetas consumer modernas (por ejemplo, RTX 3060 o superiores) dado el reducido número de parámetros, aunque no hay cifras publicadas de consumo real.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La política opera a 30 FPS según la frecuencia del dataset, pero no se publican medidas de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ayazhan/act_pen_pickup | 51.668.614 | no aplica | Pick-and-place de tapa de bolígrafo en `so_follower` | no disponible | Hugging Face (LeRobot) |
| ACT (paper original, 2304.13705) | no disponible | no aplica | Método general de imitación con action chunks | no disponible | Paper y código de referencia |
| Otras políticas LeRobot del Hub | no disponible | no aplica | Varían por tarea y robot | varían | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política solo se ha entrenado para la tarea "Pick up the pen cover and place it in the marked zone." y no generaliza a otras tareas sin reentrenamiento.
- Dataset muy reducido: 20 episodios y 7804 fotogramas, lo que aumenta el riesgo de sobreajuste al montaje, posiciones de objeto e iluminación concretos.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robot real documentadas, por lo que se desconoce su robustez.
- Dependencia del hardware: requiere un robot `so_follower` y dos cámaras con los nombres y resoluciones exactos (`wrist`, `front`, 480x640, 30 FPS); cambios de cámara o calibración pueden degradar el comportamiento.
- Licencia no especificada: no se puede confirmar el uso comercial; hay que contactar con el autor antes de un despliegue productivo.
- Sin capacidades de lenguaje, tool calling ni razonamiento simbólico: no debe confundirse con un modelo de propósito general.
- Riesgo de fallo ante distracciones, cambios de iluminación u objetos distintos a los vistos en entrenamiento, algo habitual en políticas de imitación con pocos datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ayazhan/act_pen_pickup
- Dataset de entrenamiento: https://huggingface.co/datasets/ayazhan/pen_pickup_20261108_174043
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ayazhan/pen_pickup_20261108_174043
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
