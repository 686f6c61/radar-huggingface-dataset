# Chaenn/act_so101_cube_pnp_realsim_0902

## Resumen

El modelo `Chaenn/act_so101_cube_pnp_realsim_0902` es una política robótica de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), entrenada con la librería LeRobot de Hugging Face. Desarrollado por Chaenn, el modelo controla un brazo robótico SO-101 (SO-ARM101) para realizar tareas de pick-and-place de cubos, con un enfoque de transferencia sim-to-real: se entrena en simulación y se despliega en el mundo real sin ajuste adicional. Con 51,7 millones de parámetros y un peso de 0,2 GB, es un modelo compacto adecuado para entornos de investigación y prototipado.

La relevancia de este modelo radica en su naturaleza abierta (licencia Apache 2.0) y su integración completa con el ecosistema LeRobot, lo que permite reproducir el entrenamiento, evaluar la política y desplegarla en hardware real de forma estandarizada. ACT, propuesto en el paper arXiv:2304.13705, predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación frente a métodos que predicen una sola acción por paso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers, encoder-decoder Transformer) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ACT usa ventanas de observación y predicción por chunks, sin especificar) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no aplica (modelo de control robótico, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que utiliza un transformer encoder-decoder para predecir un chunk de acciones futuras (típicamente 10-100 pasos) a partir de una observación actual. El encoder procesa la observación (imágenes RGB y estado del robot) y el decoder autoregresivo genera la secuencia de acciones. Este enfoque reduce el error de acumulación frente a políticas que predicen una sola acción, y permite entrenar con datos teleoperados de forma eficiente.

El modelo fue entrenado con LeRobot sobre el dataset `Chaenn/so101_cube_place_simreal_0902_670`, que contiene episodios de colocación de cubos en simulación y en el mundo real (sim-to-real). No se especifican el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; el entrenamiento es puramente de imitación supervisada. La política se guarda en formato safetensors y se puede cargar directamente con LeRobot para inferencia o evaluación.

## Capacidades

- Control robótico de manipulación: ejecuta tareas de pick-and-place de cubos con un brazo SO-101, incluyendo agarre, transporte y colocación.
- Transferencia sim-to-real: entrenado en simulación y desplegable en el mundo real sin ajuste adicional (zero-shot), según la metodología de LeRobot Sim2Real.
- Aprendizaje por imitación: aprende de demostraciones teleoperadas, sin necesidad de ingeniería de recompensas.
- Integración con LeRobot: compatible con el pipeline estándar de entrenamiento, evaluación y registro de episodios de LeRobot.
- No incluye capacidades de lenguaje, visión general, tool calling ni razonamiento simbólico; es un modelo puramente motor.

## Casos de uso

- Automatización de tareas repetitivas en laboratorio: el modelo puede colocar cubos en posiciones definidas, útil para experimentos de manipulación o montaje de piezas pequeñas.
- Investigación en sim-to-real: sirve como caso de estudio para evaluar la transferencia de políticas entrenadas en simulación a hardware real, con el brazo SO-101 como plataforma de bajo coste.
- Prototipado rápido de políticas robóticas: gracias a LeRobot, se puede reentrenar con nuevos datos o ajustar la tarea en pocos comandos, acelerando iteraciones de desarrollo.
- Educación en robótica: permite a estudiantes y desarrolladores experimentar con aprendizaje por imitación en un brazo asequible, sin necesidad de un laboratorio avanzado.
- Benchmarking de algoritmos de imitación: al ser un modelo abierto y reproducible, puede usarse como referencia para comparar variantes de ACT u otros métodos en la misma tarea.
- Despliegue en entornos controlados de producción ligera: en líneas de montaje sencillas donde la tarea de pick-and-place está bien definida y el entorno es estable, el modelo puede operar de forma autónoma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de tasas de éxito, métricas de precisión ni comparaciones con otros modelos en la tarea de pick-and-place.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con 51,7 millones de parámetros y 0,2 GB de pesos en safetensors, la inferencia requiere menos de 1 GB de VRAM en FP32, y cabe en cualquier GPU con al menos 2 GB (p. ej., NVIDIA Jetson Nano, GTX 1050 Ti, RTX 3060).
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; LeRobot soporta aceleración en Jetson Orin NX, RTX 4090, A100, etc. Para entrenamiento, se recomienda al menos 8 GB de VRAM.
- Compatibilidad con GPU de consumo: sí, el modelo es lo suficientemente pequeño para ejecutarse en GPUs de gama baja y media.
- Opciones de despliegue: LeRobot (inferencia y evaluación), Hugging Face Hub para descarga de pesos, y posible integración con ROS mediante los adaptadores de LeRobot.
- Latencia y throughput: no disponibles. Dado el tamaño, se espera una latencia de pocos milisegundos por paso en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo. Existen otros checkpoints del mismo autor para tareas similares (p. ej., `Chaenn/act_policy_so101_cube_multitask_real_sim_0824` y `Chaenn/act_policy_so101_cube_multitask_realsim_0827`), pero no se han publicado especificaciones detalladas ni resultados que permitan una comparación objetiva. En la categoría de políticas ACT para SO-101, este modelo es uno de los pocos disponibles públicamente con licencia Apache 2.0.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado únicamente para la tarea de pick-and-place de cubos con el brazo SO-101; no generaliza a otras tareas, objetos o configuraciones sin reentrenamiento.
- Dependencia del hardware: requiere el brazo SO-101 y la configuración de cámaras y calibración específica del dataset; cambios en la iluminación, posición de la cámara o cinemática degradarán el rendimiento.
- Riesgo de alucinación motora: como todo modelo de imitación, puede ejecutar acciones no deseadas si la observación difiere del dominio de entrenamiento; no hay mecanismos de seguridad integrados.
- Sin datos de robustez: no se han publicado pruebas en entornos no vistos, variaciones de objetos o condiciones adversas.
- Licencia: Apache 2.0 permite uso comercial, pero el hardware asociado (SO-101) puede tener sus propias restricciones; verificar la licencia del brazo y los componentes.
- Fecha de creación futura: el modelo fue creado el 2026-09-02, lo que sugiere que es un artefacto reciente; la documentación es mínima y no hay comunidad activa reportada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chaenn/act_so101_cube_pnp_realsim_0902
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (librería): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset asociado: https://huggingface.co/datasets/Chaenn/so101_cube_place_simreal_0902_670
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Tutorial de sim-to-real con SO-101: https://github.com/Luoyadan/lerobot_so101-sim2real
- Tutorial de SO-ARM101 con LeRobot: https://circuitdigest.com/tutorial/physical-ai-robot-arm-lerobot-tutorial
