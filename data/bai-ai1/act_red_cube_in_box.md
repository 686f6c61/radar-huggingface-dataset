# bai-AI1/act_red_cube_in_box

## Resumen

El modelo `bai-AI1/act_red_cube_in_box` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario bai-AI1 y publicada a través del framework LeRobot. Está diseñada para que un robot manipulador tipo `so_follower` ejecute la tarea de agarrar un cubo rojo y colocarlo dentro de una caja, a partir de demostraciones teleoperadas. El modelo resuelve el problema del aprendizaje por imitación en robótica, donde la política debe generar secuencias de acciones coherentes a partir de observaciones visuales y del estado del robot.

Con aproximadamente 51,7 millones de parámetros, es un modelo compacto que procesa imágenes de dos cámaras (frontal y lateral) junto con el estado del efector final, y produce acciones de 6 dimensiones. Su relevancia radica en ser un ejemplo práctico de entrenamiento de políticas robóticas con LeRobot, una librería de código abierto que democratiza el aprendizaje por imitación. Al estar licenciado bajo Apache 2.0, puede utilizarse y modificarse libremente, aunque su aplicabilidad está limitada a la tarea y configuración específicas para las que fue entrenado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No aplica (modelo de robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ACT, presentada en el artículo "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). ACT se basa en un transformer que predice *chunks* de acciones (secuencias de varios pasos) en lugar de una única acción, lo que mejora la estabilidad y la precisión en tareas de manipulación. La política consume observaciones de estado (6 dimensiones) e imágenes de dos cámaras (frontal y lateral, cada una de 480x640 píxeles) y genera acciones de 6 dimensiones correspondientes al movimiento del efector final.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre un dataset propio de 50 episodios teleoperados, con un total de 22.264 fotogramas a 30 FPS. Se utilizaron 60.000 pasos de entrenamiento con un tamaño de lote de 4, optimizador AdamW y una tasa de aprendizaje de 1e-5, con semilla 1000. No se aplicaron técnicas de refuerzo con feedback humano (RLHF/DPO); el aprendizaje es puramente por imitación supervisada.

## Capacidades

- Control robótico de efector final: genera acciones de 6 grados de libertad (posición y orientación) para el robot `so_follower`.
- Percepción visual multimodal: procesa simultáneamente imágenes de dos cámaras (frontal y lateral) para guiar la manipulación.
- Aprendizaje por imitación: reproduce la tarea demostrada "Grab the red cube and put in the box" con alta fidelidad al dataset de entrenamiento.
- Generación de acciones en chunks: predice secuencias de acciones, lo que reduce la frecuencia de decisiones y mejora la suavidad del movimiento.
- Integración con LeRobot: compatible con el ecosistema de herramientas de LeRobot para entrenamiento, evaluación y despliegue.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos de laboratorio: el modelo puede controlar un brazo robótico para recoger objetos de una posición fija y depositarlos en un contenedor, útil en experimentos de robótica o líneas de montaje sencillas.
- Prototipado de controladores robóticos con LeRobot: sirve como punto de partida para desarrolladores que deseen entrenar sus propias políticas ACT, ya que demuestra el flujo completo de registro de datos, entrenamiento y despliegue.
- Investigación en aprendizaje por imitación: permite estudiar el efecto del número de demostraciones, la arquitectura del transformer y los hiperparámetros en el rendimiento de tareas de manipulación.
- Benchmarking de algoritmos de imitación: puede utilizarse como referencia para comparar ACT con otros métodos (por ejemplo, Diffusion Policy) en una tarea estandarizada de manipulación.
- Educación en robótica y aprendizaje automático: al ser un modelo pequeño y de código abierto, es adecuado para cursos que enseñen a entrenar políticas robóticas con datos reales.
- Entrenamiento de robots colaborativos en entornos controlados: en fábricas o almacenes con tareas repetitivas y posiciones fijas, el modelo puede automatizar la manipulación de piezas sin necesidad de programación explícita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de métricas de éxito, tasas de acierto ni comparaciones con otros modelos.

## Requisitos de hardware

- Inferencia: al ser un modelo de ~51,7 millones de parámetros, la inferencia puede ejecutarse en CPU o en cualquier GPU con al menos 1-2 GB de VRAM. No requiere hardware especializado.
- Entrenamiento: el autor utilizó CUDA (según la configuración `--policy.device=cuda`), por lo que se recomienda una GPU con al menos 4-8 GB de VRAM para reproducir el entrenamiento en un tiempo razonable.
- Hardware adicional: se necesita el robot `so_follower` y dos cámaras compatibles con OpenCV (frontal y lateral) para la ejecución en tiempo real.
- Opciones de despliegue: el modelo se ejecuta mediante el comando `lerobot-rollout` de LeRobot. No es compatible con vLLM, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se dispone de datos medidos. Dado el tamaño del modelo, se espera una latencia de inferencia en el orden de milisegundos en GPU, pero depende del hardware y de la resolución de las cámaras.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos ACT similares. Existen en Hugging Face otros repositorios con nombres parecidos (por ejemplo, `Terra11113/act_red_box_v5_precision_b8` o `TECHIdesu/act_red_cube_into_white_box_v5_clean_9eps`), pero no se han encontrado especificaciones detalladas ni resultados de evaluación que permitan una comparación rigurosa. Se recomienda consultar directamente cada repositorio para obtener datos de parámetros, datasets y rendimiento.

## Limitaciones y advertencias

- Sobreajuste al dataset: el modelo fue entrenado con solo 50 episodios de una tarea específica, por lo que es probable que no generalice a variaciones en la posición de los objetos, iluminación o configuraciones del robot.
- Dependencia de la configuración hardware: la política espera exactamente dos cámaras (frontal y lateral) con resoluciones de 480x640 y un robot `so_follower`. Cualquier cambio en la disposición de las cámaras o en el robot invalidará el modelo.
- Sin evaluación en robot real: no se han reportado pruebas de éxito en un robot físico, por lo que el rendimiento real es desconocido.
- Riesgo de alucinación en acciones: como cualquier modelo de imitación, puede generar acciones incorrectas o inestables si las observaciones difieren de las del entrenamiento.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías sobre el funcionamiento en entornos de producción.
- Fecha de creación futura: el modelo fue creado el 2 de septiembre de 2026, lo que sugiere que puede ser un artefacto de prueba o un experimento; se recomienda verificar su validez antes de usarlo en proyectos serios.

## Enlaces

- Repositorio del modelo: https://huggingface.co/bai-AI1/act_red_cube_in_box
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/bai-AI1/record-test_20260902_214833
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=bai-AI1/record-test_20260902_214833
