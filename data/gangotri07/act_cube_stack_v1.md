# gangotri07/act_cube_stack_v1

## Resumen

El modelo `gangotri07/act_cube_stack_v1` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Ha sido desarrollado por Gangotri Kasturi (usuario `gangotri07` en Hugging Face) y entrenado con el framework LeRobot de Hugging Face. El modelo está especializado en la tarea de apilar cubos (cube stack) a partir de datos teleoperados, y se distribuye con licencia Apache 2.0.

La arquitectura ACT, descrita en el paper arXiv:2304.13705, utiliza un transformer que procesa observaciones visuales y de estado del robot para generar "chunks" de acciones de longitud fija. Esto reduce la acumulación de errores en tareas de manipulación y mejora la estabilidad del control. El modelo tiene aproximadamente 51,7 millones de parámetros, un tamaño modesto que lo hace viable para inferencia en GPU de consumo.

La relevancia de este modelo radica en que es un ejemplo práctico de cómo LeRobot permite entrenar y compartir políticas robóticas de forma reproducible. Al estar publicado en el Hub, otros investigadores pueden descargarlo, evaluarlo y adaptarlo a sus propios entornos, lo que facilita la comparación y el avance en el campo de la manipulación robótica por imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un modelo transformer diseñado específicamente para aprendizaje por imitación en robótica. Su innovación principal es la predicción de "chunks" de acciones: en lugar de emitir una sola acción por paso de tiempo, el modelo genera una secuencia de acciones futuras (por ejemplo, 50 pasos) de una sola vez. Esto se combina con un mecanismo de ejecución temporal que aplica las acciones de forma continua, lo que reduce la propagación de errores y permite movimientos más suaves y precisos.

El modelo fue entrenado mediante imitación supervisada sobre el dataset `gangotri07/cube_stack_20260818_105409`, que contiene demostraciones teleoperadas de la tarea de apilar cubos. No se especifica el número exacto de episodios ni la composición del dataset, pero el entrenamiento se realizó con LeRobot, que utiliza una arquitectura de codificador-decodificador con atención y una función de pérdida que combina error cuadrático medio y pérdida de entropía cruzada para las acciones discretizadas. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento posteriores.

## Capacidades

- Control robótico de precisión para tareas de manipulación, específicamente apilado de cubos con un brazo articulado (probablemente SO-100, aunque no está confirmado en la ficha).
- Generación de secuencias de acciones (chunks) de longitud fija, lo que permite movimientos coordinados y estables.
- Integración nativa con el framework LeRobot, lo que facilita la carga, evaluación y despliegue en robots reales o simulados.
- Aprendizaje por imitación a partir de datos teleoperados, sin necesidad de recompensas explícitas ni modelos de entorno.
- No incluye capacidades de visión general (el modelo procesa imágenes pero como entrada de control, no como tarea de visión por computadora).
- No soporta tool calling, agentes conversacionales ni razonamiento multi-paso en el sentido de los modelos de lenguaje.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos de laboratorio: el modelo puede ejecutar secuencias de apilado de cubos de forma autónoma, reduciendo la intervención humana en experimentos repetitivos.
- Investigación en aprendizaje por imitación: sirve como punto de partida para comparar arquitecturas ACT con otras políticas (diffusion policies, etc.) en tareas de manipulación.
- Desarrollo de nuevas políticas robóticas: los investigadores pueden cargar este modelo como checkpoint inicial y fine-tuning en otros datasets o tareas similares con LeRobot.
- Evaluación de robots de bajo coste: al ser un modelo pequeño (51M parámetros), es adecuado para brazos robóticos económicos como el SO-100, permitiendo validar hardware y software de control.
- Demostraciones educativas en robótica: se puede utilizar en cursos o talleres para ilustrar el flujo completo de entrenamiento y despliegue de una política robótica con LeRobot.
- Benchmarking de entornos simulados: el modelo puede ejecutarse en simuladores compatibles con LeRobot para medir la robustez de la política ante variaciones de iluminación, posición de objetos o dinámica del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error ni comparaciones con otras políticas. El autor no ha proporcionado datos cuantitativos sobre el rendimiento en la tarea de apilado de cubos.

## Requisitos de hardware

- El modelo tiene 51,7 millones de parámetros, lo que en precisión FP32 ocupa aproximadamente 207 MB (0,2 GB). En cuantización FP16 ocuparía unos 103 MB.
- VRAM estimada para inferencia: no se dispone de datos oficiales, pero por el tamaño del modelo, una GPU con 4 GB de VRAM debería ser suficiente incluso con batch pequeño. En la práctica, la carga principal proviene del procesamiento de imágenes (resolución y batch), no del modelo en sí.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, por ejemplo NVIDIA GTX 1660, RTX 2060 o superiores. También puede ejecutarse en CPU, aunque la latencia sería mayor.
- El modelo cabe sin problema en GPUs de consumo (RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: LeRobot ofrece scripts de evaluación e inferencia (`lerobot-record`, `lerobot-eval`). No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje. Se puede integrar con ROS u otros middlewares robóticos mediante los adaptadores de LeRobot.
- Latencia y throughput: no disponibles. Dependen del hardware y de la resolución de las imágenes de entrada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas ACT para apilado de cubos) dentro de la documentación proporcionada. El autor tiene otro modelo similar, `gangotri07/act_so101_pickplace`, que parece estar entrenado para una tarea de pick-and-place con el robot SO-101, pero no se detallan sus métricas. No se puede establecer una comparación cuantitativa sin datos de benchmarks.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para la tarea de apilado de cubos en un entorno concreto. No generaliza a otras tareas ni a variaciones significativas del entorno (cambios de iluminación, colores, texturas o posiciones iniciales) sin reentrenamiento.
- Depende de la configuración del robot (calibración de cámaras, cinemática, controladores). Si se usa en otro brazo distinto al empleado en el entrenamiento, el rendimiento puede degradarse notablemente.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos teleoperados, puede heredar los sesgos del operador humano (por ejemplo, preferencia por ciertas rutas de movimiento).
- Riesgo de alucinación: no aplica en el sentido de los modelos de lenguaje, pero la política puede generar acciones erróneas si las observaciones están fuera de la distribución de entrenamiento.
- No se especifica si el dataset contiene variaciones de escenarios o si se realizaron pruebas de robustez. Se recomienda validar en el entorno objetivo antes de cualquier uso en producción.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar que el dataset de entrenamiento (gangotri07/cube_stack_20260818_105409) no tenga restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gangotri07/act_cube_stack_v1
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Perfil del autor: https://huggingface.co/gangotri07
