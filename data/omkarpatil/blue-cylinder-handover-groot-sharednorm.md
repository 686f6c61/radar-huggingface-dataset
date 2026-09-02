# omkarpatil/blue-cylinder-handover-groot-sharednorm

## Resumen

El modelo `omkarpatil/blue-cylinder-handover-groot-sharednorm` es un fine-tune del modelo base `nvidia/GR00T-N1.7-3B`, un VLA (vision-language-action) de NVIDIA, especializado en la tarea de entregar un cilindro azul con un robot bimanual ROBOTIS FFW SG2 Rev1. Desarrollado por Omkar Patil, este checkpoint forma parte de un grupo de tres modelos que comparten una misma normalización (shared-norm) para permitir la composición de políticas en el espacio de puntuaciones. El modelo tiene 3.144.016.000 parámetros (3,14 B) y se distribuye bajo licencia Apache-2.0.

La relevancia de este modelo radica en su enfoque en la composición de políticas robóticas: al compartir una transformación de normalización idéntica con sus hermanos de grupo, las puntuaciones de cada política pueden combinarse directamente, lo que facilita la creación de comportamientos más complejos a partir de tareas individuales. Está entrenado con 11 episodios (2408 frames) a 15 fps, con un horizonte de acción de 16 pasos (≈1,07 s), y alcanza una pérdida final de entrenamiento de 0,03711.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basado en transformer (fine-tune de nvidia/GR00T-N1.7-3B) |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en fp32) |
| Idiomas soportados | no disponible (instruccion en ingles: "Hand over the blue cylinder") |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32, 3 shards, ≈12,6 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo del VLA `nvidia/GR00T-N1.7-3B`, que emplea una arquitectura transformer multimodal que procesa observaciones visuales (tres camaras: `cam_left_head`, `cam_left_wrist`, `cam_right_wrist`) y estados del robot (22 dimensiones) para predecir acciones de 16 dimensiones (brazos, cabeza, elevador y odometria). El entrenamiento se realizó con el script estándar `launch_finetune.py` sin modificaciones de código, solo cambiando las estadísticas del dataset para aplicar la receta shared-norm.

La normalización shared-norm agrupa las estadísticas de tres tareas (pick con brazo derecho, pick con brazo izquierdo y handover) en un único transform q01/q99 min-max que mapea a [-1, 1] con clipping de outliers (~2% de la cola). Esto permite que las políticas del grupo sean componibles en el espacio de puntuaciones, ya que todas comparten el mismo `statistics.json` (hash `c89d17a12a2d8642`). El entrenamiento usó 20 000 pasos, batch global de 32, learning rate 1e-4 con warmup 0.05 y weight decay 1e-5, en fp32 (sin bf16). La atención se ejecutó con PyTorch sdpa en lugar de flash-attention-2, por limitaciones del host, aunque ambos son exactos.

## Capacidades

- Control bimanual de robot ROBOTIS FFW SG2 Rev1: genera acciones de 16 dimensiones (8 por brazo, más cabeza, elevador y odometria) a partir de observaciones visuales y de estado.
- Ejecución de la tarea específica "Hand over the blue cylinder" (entregar el cilindro azul) con un horizonte de acción de 16 pasos a 15 fps.
- Composición de políticas: al compartir la normalización con otros dos modelos del grupo, sus puntuaciones pueden combinarse directamente para crear comportamientos multi-tarea.
- Percepción multimodal: procesa imágenes de tres cámaras (cabeza izquierda, muñeca izquierda, muñeca derecha) junto con el estado del robot.
- Inferencia lista: el checkpoint incluye solo los pesos y configuración necesarios para inferencia, sin estado de optimizador.

## Casos de uso

- Automatización de tareas de manipulación en entornos industriales: el modelo puede integrarse en un robot FFW SG2 Rev1 para realizar entregas de objetos en líneas de montaje, aprovechando su capacidad de generar acciones precisas a partir de instrucciones en lenguaje natural.
- Investigación en aprendizaje por imitación y composición de políticas: al ser parte de un grupo shared-norm, sirve como bloque para experimentos de composición en el espacio de puntuaciones, permitiendo estudiar cómo combinar habilidades robóticas.
- Desarrollo de robots colaborativos en logística: la tarea de handover es fundamental en escenarios de colaboración humano-robot; este modelo puede desplegarse en celdas de trabajo donde un robot debe entregar piezas a un operario.
- Benchmark de fine-tuning de VLA: al estar entrenado con una receta estándar y documentada, puede usarse como referencia para comparar estrategias de normalización y composición en robótica.
- Prototipado rápido en laboratorios de robótica: con solo 3,14 B de parámetros y pesos en fp32, es viable para pruebas en estaciones con una GPU de 16-24 GB, facilitando iteraciones de desarrollo.
- Entrenamiento de políticas multi-tarea: combinando este modelo con sus hermanos de grupo, se puede construir un controlador que ejecute pick-and-place y handover de forma secuencial, sin reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida final de entrenamiento (0,03711) y el tiempo de entrenamiento (3h 59m en una A100-80GB), pero no hay métricas de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan ≈12,6 GB, por lo que se necesita al menos 16 GB de VRAM para cargar el modelo sin cuantización. Con cuantización (no disponible en el repo) podría reducirse, pero no hay datos.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o superior es suficiente para inferencia en fp32. Para entrenamiento se usó una A100-80GB, pero la inferencia es menos exigente.
- Si cabe en consumer GPU: sí, en GPUs con 16 GB o más (RTX 4080, RTX 4090, etc.), aunque se recomienda verificar el uso de memoria con el framework de despliegue.
- Opciones de despliegue: al ser un modelo de robótica con pipeline `robotics` y librería `lerobot`, se puede cargar con el framework LeRobot. También es posible usar vLLM o TGI si se adapta, pero no hay documentación específica. Para integración con ROS 2, se puede usar el convertidor `cyclo_data` mencionado en la procedencia.
- Latencia y throughput: no disponibles. Depende del hardware y del framework; con una RTX 4090 se espera una inferencia en tiempo real (15 fps) dado el tamaño del modelo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| omkarpatil/blue-cylinder-handover-groot-sharednorm | 3,14 B | no disponible | Apache-2.0 | HuggingFace |
| nvidia/GR00T-N1.7-3B (base) | 3,14 B | no disponible | Apache-2.0 | HuggingFace |
| OpenVLA (7B) | 7 B | no disponible | MIT | HuggingFace |
| RT-2 (55B) | 55 B | no disponible | no disponible | no publico |

La comparativa se limita a parámetros y licencia, ya que no hay datos de rendimiento. Este modelo es un fine-tune especializado, mientras que OpenVLA y RT-2 son VLA generales. La ventaja de este checkpoint es su composabilidad con otros modelos del mismo grupo, algo que no ofrecen los modelos generales.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ejecuta la tarea de handover del cilindro azul en la plataforma FFW SG2 Rev1; no es generalizable a otras tareas o robots sin reentrenamiento.
- Sin capacidad de reanudar entrenamiento: el checkpoint no incluye `optimizer.pt` ni checkpoints intermedios, por lo que no se puede continuar el fine-tuning.
- Dependencia de la normalización compartida: para componer con otros modelos, es imprescindible que compartan el mismo hash de estadísticas (`c89d17a12a2d8642`); usar modelos con otra normalización romperá la composición.
- Riesgo de errores de ejecución: como todo VLA, puede fallar en condiciones no vistas (iluminación, oclusiones, variaciones del objeto), lo que debe tenerse en cuenta en entornos de producción.
- Sin datos de robustez: no hay benchmarks de éxito en tareas reales, por lo que se desconoce su tasa de fallos.
- Limitaciones de idioma: la instrucción está en inglés; no se ha probado con otros idiomas.
- Atención con sdpa: los resultados pueden diferir ligeramente de una build con flash-attention-2, aunque ambos son exactos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/omkarpatil/blue-cylinder-handover-groot-sharednorm
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Perfil del autor: https://huggingface.co/omkarpatil
- Lista de modelos del autor: https://huggingface.co/omkarpatil/models
