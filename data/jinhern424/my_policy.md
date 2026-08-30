# jinhern424/my_policy

## Resumen

El modelo `jinhern424/my_policy` es una política robótica basada en el método Action Chunking with Transformers (ACT), publicada en el paper arXiv:2304.13705. Ha sido entrenada con el framework LeRobot de HuggingFace mediante aprendizaje por imitación a partir de datos teleoperados. El modelo está diseñado para controlar un robot tipo `so_follower` con dos cámaras (`front` y `realsense`) y ejecutar la tarea de agarrar un bolígrafo ("Grab the pen").

Con 51,7 millones de parámetros y un tamaño de repositorio de 0,2 GB, esta política representa un caso práctico de entrenamiento de políticas robóticas con ACT en un escenario real de laboratorio. Su relevancia radica en que ACT es uno de los métodos de imitación más utilizados en robótica manipuladora por su capacidad de predecir secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación.

El modelo se distribuye bajo licencia Apache 2.0 y no se han publicado resultados de evaluación en el momento de la creación de esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - Transformer con VAE condicional |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un transformer con una VAE condicional (CVAE). La arquitectura consume observaciones visuales de dos cámaras (imágenes de 480x640 píxeles) y un vector de estado del robot (6 dimensiones), y produce una secuencia de acciones (6 dimensiones por paso) que se ejecutan de forma encadenada, en lugar de predecir una sola acción. Esto reduce los errores de acumulación y mejora la robustez en tareas de manipulación.

El entrenamiento se realizó con el framework LeRobot versión 0.6.2, utilizando el dataset `jinhern424/record-test_20260829_162539` compuesto por 50 episodios y 21.050 fotogramas a 30 FPS, todos de la tarea "Grab the pen". La configuración de entrenamiento incluye 100.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-05 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento posteriores al entrenamiento supervisado.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 grados de libertad a partir de observaciones visuales y de estado.
- Aprendizaje por imitación: replica comportamientos teleoperados, lo que permite transferir habilidades humanas al robot.
- Predicción de secuencias de acciones (action chunking): mejora la estabilidad del movimiento frente a la predicción paso a paso.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de HuggingFace para robótica.
- Soporte de múltiples cámaras: procesa simultáneamente imágenes de dos cámaras (frontal y realsense) para la percepción del entorno.
- Tarea específica: entrenado para agarrar un bolígrafo, aunque la arquitectura ACT es generalizable a otras tareas de manipulación con datos adecuados.

## Casos de uso

- **Investigación en robótica manipuladora**: sirve como punto de partida para estudiar el comportamiento de ACT en tareas de agarre, permitiendo reproducir experimentos y comparar con otras políticas.
- **Desarrollo de habilidades de agarre**: el modelo puede desplegarse en un robot `so_follower` para ejecutar la tarea de agarrar objetos pequeños (bolígrafos), útil en líneas de montaje o entornos de laboratorio.
- **Validación de pipelines de imitación**: al estar entrenado con LeRobot, puede utilizarse para verificar el flujo completo de registro de datos, entrenamiento y despliegue en un robot real.
- **Benchmark de políticas robóticas**: su tamaño moderado (51,7M parámetros) lo hace adecuado para evaluar métricas de latencia y consumo de recursos en hardware de gama media.
- **Educación y formación**: permite a estudiantes y desarrolladores aprender a entrenar y desplegar políticas robóticas con un ejemplo funcional y documentado.
- **Base para fine-tuning**: dado que es un modelo ACT estándar, puede reentrenarse o ajustarse con nuevos datasets para adaptarlo a otras tareas de manipulación (apilar bloques, insertar piezas, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente "No evaluation results have been provided for this policy yet", por lo que no existen datos de tasa de éxito ni comparativas con otros modelos en tareas reales.

## Requisitos de hardware

- No se dispone de información específica sobre requisitos de hardware en la model card.
- Dado el tamaño del modelo (51,7M parámetros), es razonable estimar que puede ejecutarse en GPUs consumer con al menos 6-8 GB de VRAM, aunque no hay datos confirmados.
- LeRobot suele requerir una GPU NVIDIA con CUDA para entrenamiento e inferencia; el comando de entrenamiento incluye `--policy.device=cuda`.
- Para el despliegue, la documentación de LeRobot recomienda usar el comando `lerobot-rollout` con el robot `so_follower` y cámaras OpenCV.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo con otros modelos de robótica (como Diffusion Policy o ACT con otras configuraciones). Al ser un modelo ACT estándar entrenado con LeRobot, su arquitectura es idéntica a la publicada en el paper original, pero no se pueden establecer comparaciones cuantitativas sin resultados de evaluación.

## Limitaciones y advertencias

- **Sin evaluación publicada**: no se han proporcionado tasas de éxito ni pruebas en robot real, por lo que su rendimiento efectivo es desconocido.
- **Dataset limitado**: entrenado con solo 50 episodios de una única tarea, lo que puede limitar la generalización a otras posiciones, objetos o condiciones de iluminación.
- **Tarea específica**: el modelo solo ha sido entrenado para "Grab the pen"; no es apto para otras tareas sin reentrenamiento.
- **Sesgos del entorno**: los datos provienen de un entorno de laboratorio concreto, por lo que puede fallar en entornos con mayor variabilidad.
- **Sin soporte de idiomas ni texto**: al ser un modelo de robótica, no procesa lenguaje natural ni genera texto.
- **Licencia Apache 2.0**: permite uso comercial y modificación, pero es responsabilidad del usuario verificar la conformidad con las leyes aplicables en robótica.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/jinhern424/my_policy)
- [Dataset de entrenamiento](https://huggingface.co/datasets/jinhern424/record-test_20260829_162539)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [LeRobot (framework)](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware de LeRobot](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Guía de registro y entrenamiento](https://huggingface.co/docs/lerobot/en/il_robots)
- [Referencia de comandos CLI de LeRobot](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
- [Perfil de GitHub del autor](https://github.com/jinhern424/)
