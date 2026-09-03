# mkche9/sponge_policy

## Resumen

`mkche9/sponge_policy` es un modelo de política robótica (policy) basado en Action Chunking with Transformers (ACT), una arquitectura de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Ha sido desarrollado por mkche9 y entrenado con el framework LeRobot de Hugging Face para ejecutar la tarea de manipulación "coger una esponja y colocarla en una caja" (pick sponge and place in box) sobre un robot tipo `so_follower`. El modelo consume imágenes de dos cámaras (vista cenital y muñeca) junto con el estado del robot, y produce comandos de acción de 6 dimensiones.

Con 51,7 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto pensado para inferencia en tiempo real en robots de bajo coste. Su relevancia radica en que demuestra el flujo completo de LeRobot: desde la recopilación de datos teleoperados hasta el entrenamiento y despliegue de una política de imitación, con una licencia Apache 2.0 que permite uso comercial. No se trata de un modelo de lenguaje ni de visión general, sino de un controlador específico para una tarea concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control robótico, no procesa texto) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no aplica (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT, una arquitectura basada en transformers que aprende a predecir "chunks" de acciones (secuencias de varios pasos) a partir de observaciones visuales y del estado del robot. A diferencia de los métodos que predicen una sola acción por paso, ACT reduce la acumulación de errores y mejora la estabilidad del control. El entrenamiento se realizó mediante aprendizaje por imitación con datos teleoperados: 84 episodios y 41.614 fotogramas a 30 FPS, recopilados con el robot `so_follower` y dos cámaras (overhead y wrist). La configuración de entrenamiento incluye 80.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000, todo bajo la versión 0.6.1 de LeRobot. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento posteriores a la imitación.

## Capacidades

- Manipulación robótica de precisión: ejecuta la tarea de pick-and-place de una esponja en una caja, con control de posición/orientación del efector final (acción de 6 dimensiones).
- Percepción visual multimodal: procesa simultáneamente imágenes de dos cámaras (vista cenital de 360x640 y vista de muñeca de 480x640) para localizar el objeto y el contenedor.
- Control en tiempo real: al predecir chunks de acciones, puede operar a la frecuencia de control del robot (30 FPS) sin necesidad de replanificación constante.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo scripts de rollout y entrenamiento.
- No soporta tool calling, agentes, razonamiento simbólico ni capacidades de lenguaje, ya que es un modelo puramente motor.

## Casos de uso

- Automatización de líneas de montaje ligeras: el modelo puede integrarse en celdas de trabajo donde se requiera recoger piezas pequeñas (como esponjas) y depositarlas en contenedores, reduciendo la intervención manual en entornos controlados.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre robots o la robustez frente a variaciones de iluminación y posición de objetos, gracias a su tamaño reducido y a la disponibilidad del dataset de entrenamiento.
- Prototipado rápido con LeRobot: los desarrolladores pueden clonar el repositorio y ejecutar `lerobot-rollout` para validar el comportamiento en su propio hardware `so_follower`, ajustando cámaras y puertos según su configuración.
- Benchmark de control robótico: al estar entrenado con una tarea bien definida y datos públicos, puede utilizarse como referencia para comparar arquitecturas de imitación (ACT frente a Diffusion Policy, etc.) en términos de tasa de éxito y precisión.
- Educación en robótica: en laboratorios universitarios, el modelo permite a estudiantes experimentar con políticas de imitación sin necesidad de entrenar desde cero, usando el flujo de LeRobot documentado.
- Base para fine-tuning en tareas similares: dado su tamaño compacto, puede reentrenarse con pocos datos para adaptarlo a objetos o contenedores distintos, siempre que se mantenga la misma configuración de cámaras y robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito, precisión de agarre ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo ocupa aproximadamente 0,2 GB en safetensors, por lo que la inferencia en FP32 requiere menos de 1 GB de VRAM. Con una GPU de gama media (por ejemplo, RTX 3060 con 12 GB) hay margen más que suficiente para el procesamiento de imágenes y el control en tiempo real.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) es suficiente. Para entrenamiento, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080, A100) dado el batch size de 8 y las imágenes de entrada.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en cualquier GPU consumer moderna, incluso en placas integradas con memoria compartida, aunque el rendimiento en tiempo real dependerá de la latencia de captura de cámaras.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot, que soporta inferencia local con `lerobot-rollout`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no hay datos oficiales. Dado el tamaño del modelo y la resolución de las cámaras, se estima una latencia de inferencia inferior a 50 ms en una GPU moderna, lo que permite operar a 30 FPS.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas ACT para pick-and-place con LeRobot) dentro de los resultados de búsqueda. El modelo es una instancia específica de la arquitectura ACT, y no se han encontrado otros repositorios públicos con características equivalentes para establecer una comparación directa.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ejecuta la tarea "coger esponja y colocar en caja" con la configuración exacta de cámaras y robot `so_follower`. Cualquier cambio en la posición de la cámara, el tipo de objeto o el robot requerirá reentrenamiento.
- Dataset de entrenamiento pequeño: con solo 84 episodios, la generalización a variaciones no vistas (iluminación, fondo, orientación del objeto) es limitada y puede provocar fallos en producción.
- Sin evaluación publicada: no hay resultados de tasa de éxito en robot real, por lo que el rendimiento real es desconocido y debe validarse antes de cualquier uso crítico.
- Dependencia de la calibración: el rendimiento depende de que las cámaras estén correctamente calibradas y alineadas con las observaciones de entrenamiento; desviaciones en la posición de la cámara degradan la precisión.
- Riesgo de alucinación motora: como todo modelo de imitación, puede generar acciones incoherentes si recibe observaciones fuera de la distribución de entrenamiento, lo que en robótica puede causar movimientos bruscos o colisiones.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable de cumplir con las condiciones de la licencia y de citar el método ACT y LeRobot según la indicación de la model card.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mkche9/sponge_policy
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/mkche9/sponge_pick_v1_20260902_161539
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Perfil del autor: https://huggingface.co/mkche9
