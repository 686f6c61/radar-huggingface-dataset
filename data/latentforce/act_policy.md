# latentforce/act_policy

## Resumen

`latentforce/act_policy` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), publicada en el repositorio de HuggingFace por el usuario `latentforce`. El modelo ha sido entrenado mediante aprendizaje por imitación con datos teleoperados y está diseñado para ejecutar la tarea "recoger la bola naranja y ponerla en el cuenco naranja" sobre un robot de tipo `so_follower`. Se integra con el ecosistema LeRobot, lo que permite cargarlo, ejecutarlo y reentrenarlo mediante las herramientas CLI de dicha librería.

El modelo consume observaciones de dos cámaras (superior y de muñeca) junto con el estado del robot (6 dimensiones) y produce acciones de 6 dimensiones. Con aproximadamente 51,7 millones de parámetros, es una política compacta adecuada para despliegue en robots reales con hardware modesto. Su relevancia radica en que ACT es uno de los métodos de imitación más utilizados en robótica manipulativa por su capacidad de predecir secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers que predice secuencias de acciones (action chunks) en lugar de acciones individuales. La política está entrenada para mapear observaciones visuales (dos cámaras RGB de 480x640) y el estado propioceptivo del robot (vector de 6 dimensiones) a un vector de acción de 6 dimensiones. El entrenamiento se realizó con el framework LeRobot sobre un dataset propio (`latentforce/pick_orange_ball_merged`) que contiene 48 episodios y 28.719 frames a 30 FPS, correspondientes a la tarea de recoger una bola naranja y depositarla en un cuenco naranja.

La configuración de entrenamiento incluye 100.000 pasos, tamaño de lote 8, optimizador AdamW con tasa de aprendizaje 1e-5 y semilla 1000. No se mencionan técnicas de refuerzo adicionales (RLHF/DPO) ni innovaciones arquitectónicas más allá de las propias de ACT. El modelo se distribuye como un checkpoint de LeRobot, listo para inferencia o fine-tuning.

## Capacidades

- Control robótico de manipulación: ejecuta la tarea específica de pick-and-place de una bola naranja.
- Percepción visual multimodal: procesa simultáneamente imágenes de dos cámaras (superior y de muñeca) junto con el estado propioceptivo.
- Predicción de acciones en chunk: genera secuencias de acciones que mejoran la suavidad y precisión del movimiento.
- Integración con LeRobot: compatible con el flujo de rollout y entrenamiento de la librería.
- No es un modelo de lenguaje: no genera texto, código ni responde a prompts; su salida es exclusivamente un vector de acciones.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos de laboratorio o fabricación ligera: el modelo puede integrarse en un robot `so_follower` para clasificar objetos de colores específicos (en este caso, bolas naranjas) y depositarlos en contenedores designados.
- Investigación en aprendizaje por imitación: sirve como punto de partida para experimentos de fine-tuning con nuevos datasets o variaciones de la tarea, gracias a su formato LeRobot.
- Prototipado de celdas robóticas: al ser una política pequeña (51,7M parámetros), puede ejecutarse en hardware de bajo coste para validar conceptos antes de escalar a sistemas más complejos.
- Educación y formación en robótica: permite a estudiantes y desarrolladores estudiar el comportamiento de una política ACT real entrenada con datos teleoperados, incluyendo la inspección de entradas/salidas y la modificación de hiperparámetros.
- Benchmarking de métodos de imitación: puede compararse con otras políticas entrenadas en el mismo dataset o con variantes de ACT para evaluar métricas de éxito en tareas de manipulación.
- Desarrollo de sistemas de control reactivo: su baja latencia (inferencia de un transformer pequeño) lo hace apto para bucles de control en tiempo real a 30 FPS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real.

## Requisitos de hardware

- No se publican requisitos oficiales de VRAM ni GPU en la model card.
- Dado el tamaño del modelo (51,7M parámetros), la inferencia es viable en cualquier GPU con al menos 2-4 GB de VRAM, incluyendo tarjetas consumer como RTX 3060 o superiores.
- El entrenamiento completo (100k pasos) requiere una GPU con suficiente memoria para el lote de 8 y las imágenes de 480x640; una GPU con 8-12 GB de VRAM (por ejemplo, RTX 3070/3080) sería adecuada.
- Opciones de despliegue: el modelo está diseñado para ejecutarse con LeRobot (`lerobot-rollout`), que gestiona la carga del checkpoint y la interfaz con el robot.
- No se dispone de datos de latencia o throughput específicos, pero al ser un transformer pequeño, la inferencia debería ser inferior a 50 ms en GPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo repositorio o dataset. Como referencia genérica, otras políticas de imitación en LeRobot (por ejemplo, Diffusion Policy o ACT con diferentes tamaños) podrían compararse, pero no hay datos públicos de rendimiento para esta tarea concreta.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea muy específica (recoger bola naranja y ponerla en cuenco naranja) con un robot concreto (`so_follower`); no generaliza a otras tareas o configuraciones sin reentrenamiento.
- Depende de la calibración de las cámaras y del robot; cambios en iluminación, posición de objetos o distracciones pueden degradar el rendimiento.
- No se han reportado evaluaciones formales en robot real, por lo que la tasa de éxito esperada es desconocida.
- Al ser un modelo de control, no presenta riesgo de alucinación textual, pero sí puede generar acciones erróneas si las observaciones difieren del dominio de entrenamiento.
- La licencia Apache 2.0 permite uso comercial y modificación, pero se debe citar el método ACT y LeRobot según la sección de citación.
- El dataset de entrenamiento es reducido (48 episodios), lo que puede limitar la robustez frente a variaciones no vistas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/latentforce/act_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/latentforce/pick_orange_ball_merged
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (librería y documentación): https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=latentforce/pick_orange_ball_merged
