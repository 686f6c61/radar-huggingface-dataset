# Myungkyu/banana-challenge-ckpts

## Resumen

El modelo `Myungkyu/banana-challenge-ckpts` es un conjunto de checkpoints de aprendizaje por imitación para robótica, desarrollado por Myungkyu, que resuelve la tarea de colocar un plátano en una cesta usando un brazo OpenArm y una mano Inspire (derecha). Está basado en dos arquitecturas de modelos de visión-lenguaje-acción (VLA): Pi0.5 de Physical Intelligence y RLDX-1-PT-IMG de RLWRLD, ambos adaptados para control de bajo nivel en espacio de articulaciones. El repositorio incluye checkpoints finales e intermedios, entrenados con 54 episodios de demostración (16.202 frames a 30 fps) y visión estereoscópica. Es relevante para investigadores que trabajan en manipulación robótica con LeRobot, ya que proporciona modelos preentrenados para una tarea concreta y reproducible.

El modelo se distribuye bajo licencia Apache 2.0 y utiliza el formato safetensors. El tamaño total del repositorio es de 139,1 GB, lo que incluye múltiples checkpoints. No se proporcionan métricas de rendimiento generales más allá de la pérdida final de entrenamiento, y no hay información sobre parámetros totales, contexto o cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0.5 (VLA) y RLDX-1-PT-IMG (VLA) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (action horizon: 50 para Pi0.5, 16 para RLDX) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (modelo de control robótico, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio contiene dos modelos independientes: `banana_pi05_openarm_right_60k` basado en Pi0.5 (checkpoint base `gs://openpi-assets/checkpoints/pi05_base` con hash `7de66397`) y `banana_rldxptimg_openarm_right_60k` basado en RLDX-1-PT-IMG (checkpoint base `RLWRLD/RLDX-1-PT-IMG` con hash `d67fc642`). Ambos operan en espacio de articulaciones absoluto con una dimensionalidad de 13 (7 para el brazo y 6 para la mano). La entrada visual consiste en dos vistas estereoscópicas (`ego_left` y `ego_right`) a 640x360 píxeles.

El entrenamiento se realizó con un batch size de 64 y 60.000 pasos, lo que equivale a 237 épocas (253 pasos por época). Los datos provienen de 54 episodios de demostración con 16.202 frames a 30 fps. El entrenamiento se llevó a cabo en un clúster de 8 GPUs H100 de SKT entre el 31 de agosto y el 1 de septiembre de 2026. Se excluyó el estado del optimizador de DeepSpeed (`global_step*`) porque RLDX no tiene reanudación cableada y no podría consumirse. También se incluyen checkpoints intermedios en intervalos de 10.000 pasos (aproximadamente 40, 79, 118, 158 y 198 épocas) para evitar el sobreajuste del checkpoint final.

## Capacidades

- Control robótico de bajo nivel: genera acciones de articulación (7 para el brazo, 6 para la mano) para ejecutar la tarea de colocar un plátano en una cesta.
- Percepción visual estereoscópica: procesa dos imágenes de cámara ego (izquierda y derecha) para guiar la manipulación.
- Aprendizaje por imitación: los modelos han sido entrenados con demostraciones humanas y pueden replicar la política aprendida.
- Soporte de múltiples checkpoints: permite seleccionar entre el checkpoint final (237 épocas) o intermedios (40-198 épocas) según el nivel de sobreajuste deseado.
- Integración con LeRobot: los pesos están en formato safetensors y son compatibles con la librería LeRobot para despliegue en robots reales o simulados.

## Casos de uso

- Investigación en aprendizaje por imitación: los checkpoints sirven como punto de partida para estudiar la transferencia de políticas robóticas, comparar arquitecturas VLA (Pi0.5 vs RLDX) o analizar el efecto del número de épocas en el rendimiento.
- Desarrollo de habilidades de manipulación: el modelo puede desplegarse en un robot OpenArm con mano Inspire para ejecutar tareas de pick-and-place en entornos controlados, como laboratorios de robótica.
- Evaluación de generalización: al tener checkpoints intermedios, se puede medir cómo evoluciona la política con el entrenamiento y si el sobreajuste afecta la robustez ante variaciones del entorno.
- Benchmarking de hardware: el repositorio permite probar el rendimiento de inferencia de modelos VLA en diferentes GPUs (por ejemplo, RTX 4090, A100) usando LeRobot y herramientas como vLLM o llama.cpp, aunque no se proporcionan métricas de latencia.
- Educación en robótica: sirve como ejemplo práctico de entrenamiento de un modelo de imitación con datos de demostración, útil para cursos de robótica o aprendizaje automático.
- Reproducción de experimentos: al estar disponible el código de entrenamiento (implícito en LeRobot) y los checkpoints, otros investigadores pueden replicar el experimento o extenderlo a nuevas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida final de entrenamiento: 0.001–0.003 para Pi0.5 y 0.0087 (train_loss) para RLDX-1-PT-IMG. No hay comparaciones con otros modelos ni métricas de éxito en la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (139,1 GB) incluye múltiples checkpoints, pero el peso de un solo modelo no se especifica. Dado que son modelos VLA con entrada visual, se espera que requieran al menos 10-20 GB de VRAM en FP32, pero no hay confirmación.
- GPU recomendadas: no disponible. El entrenamiento se realizó en 8 H100, pero para inferencia podría bastar con una GPU de gama alta (RTX 4090, A100, etc.) dependiendo de la cuantización.
- Compatibilidad con consumer GPU: no confirmado. Sin datos de tamaño de parámetros, no se puede asegurar que quepa en GPUs de consumo.
- Opciones de despliegue: al usar LeRobot, se puede integrar con frameworks como vLLM, TGI o llama.cpp, pero no hay instrucciones específicas en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (tareas de manipulación robótica con LeRobot). La model card no menciona alternativas ni benchmarks comparativos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo específico de tarea: está entrenado únicamente para la tarea "colocar el plátano en la cesta" con un hardware concreto (OpenArm + Inspire Hand). No es generalizable a otras tareas o configuraciones de robot sin reentrenamiento.
- Riesgo de sobreajuste: el checkpoint final (237 épocas) puede estar sobreajustado a los datos de demostración; los checkpoints intermedios se ofrecen como alternativa para mitigar este problema.
- Sin datos de rendimiento: no hay métricas de éxito en el mundo real ni benchmarks estandarizados, por lo que no se puede evaluar la robustez del modelo.
- Dependencia del entorno: la política aprendida puede fallar si las condiciones de iluminación, posición de la cámara o disposición de los objetos difieren de las de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que los modelos base (Pi0.5 y RLDX) tengan licencias compatibles, ya que no se especifican en la model card.
- Sin soporte de lenguaje: no es un modelo de lenguaje; no procesa texto ni instrucciones en lenguaje natural.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Myungkyu/banana-challenge-ckpts
- Perfil del autor: https://huggingface.co/Myungkyu
- Página personal del autor: https://myungkyukoo.github.io/
