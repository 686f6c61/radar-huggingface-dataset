# MakinoKF/rebot_pick_multiple_nut_dataset_20261111_170441_act-policy-v1

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación robótica. Este repositorio concreto, publicado por el usuario MakinoKF, contiene una política ACT entrenada con LeRobot 0.6.0 sobre un dataset propio de 88 episodios y 15.841 fotogramas grabados a 30 FPS para la tarea "pick the nut" (recoger una tuerca).

El modelo consume el estado del robot (vector de 7 dimensiones) y dos flujos de imagen de 480x640 píxeles procedentes de las cámaras `top` y `right`, y produce un vector de acción de 7 dimensiones. Está diseñado para el robot `rebot_b601_follower`, por lo que su aplicabilidad fuera de esa plataforma es limitada sin reentrenamiento.

Es relevante como ejemplo reproducible de un pipeline completo de imitación robótica con LeRobot: dataset público, configuración de entrenamiento documentada (50.000 pasos, batch 32, AdamW, LR 1e-5) y script de despliegue listo para ejecutar. No obstante, se trata de un artefacto de investigación con cero descargas y sin evaluación publicada, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea se especifica por cadena fija) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.6.0 |
| Tipo de robot | rebot_b601_follower |
| Camaras de entrada | top, right (3x480x640 cada una) |
| Entrada de estado | observation.state, shape (7,) |
| Salida de accion | action, shape (7,) |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación visomotora que predice un chunk de acciones futuras a partir de observaciones multimodales (imágenes de cámaras y estado propioceptivo del robot). La arquitectura combina un backbone visual tipo ResNet para extraer características de las dos cámaras, un encoder transformer que fusiona las representaciones visuales con el estado del robot, y un decoder transformer que emite la secuencia de acciones. La predicción por chunks, frente a la predicción paso a paso, es la innovación central del método y reduce el error compuesto característico de las políticas de imitación clásicas.

El entrenamiento se realizó sobre el dataset `MakinoKF/rebot_pick_multiple_nut_dataset_20261111_170441`, compuesto por 88 episodios y 15.841 fotogramas a 30 FPS, todos ellos correspondientes a la tarea única "pick the nut". La configuración reportada es de 50.000 pasos de entrenamiento, batch size 32, optimizador AdamW con learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; es aprendizaje supervisado puro por imitación a partir de demostraciones de teleoperación.

## Capacidades

- Generación de comandos de acción de 7 dimensiones para control de un brazo robótico en la tarea de recogida de una tuerca.
- Percepción visual multimodal a partir de dos cámaras simultáneas (`top` y `right`) a resolución 480x640.
- Fusión de estado propioceptivo del robot (7 valores) con información visual para la predicción de acciones.
- Predicción de chunks de acciones, lo que aporta suavidad y consistencia temporal en la ejecución.
- Ejecución autónoma en bucle cerrado sobre el robot `rebot_b601_follower` mediante `lerobot-rollout`.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No dispone de capacidades multilingües ni de procesamiento de lenguaje natural.
- No dispone de modo de razonamiento explícito (thinking), visión general, audio ni otras capacidades de modelos fundacionales.

## Casos de uso

- Automatización de una celda de pick-and-place de piezas pequeñas: la política puede ejecutar la recogida de tuercas en el robot `rebot_b601_follower` de forma autónoma durante sesiones de hasta 60 segundos mediante `lerobot-rollout --duration=60`, adecuada para validar un prototipo de línea de montaje.
- Base para reentrenamiento con datos propios: el repositorio sirve como plantilla de configuración (ACT, 50.000 pasos, batch 32) para generar nuevas políticas sobre datasets de manipulación propios usando `lerobot-train`.
- Estudio de reproducibilidad en imitación robótica: al publicar dataset, configuración y pesos, permite reproducir el experimento y comparar variaciones de hiperparámetros con una referencia fija.
- Docencia y formación en robótica de imitación: el pipeline completo (grabación, entrenamiento, despliegue) es un ejemplo didáctico de extremo a extremo con LeRobot 0.6.0.
- Benchmark interno de hardware robótico: sirve para medir latencia de inferencia y estabilidad de control en el `rebot_b601_follower` antes de escalar a tareas más complejas.
- Prueba de concepto de manipulación con dos cámaras: permite evaluar el impacto de la configuración `top` + `right` en la tasa de éxito frente a configuraciones de cámara única.
- Integración en pipelines de investigación con Hugging Face Hub: el formato LeRobot y safetensors facilita la carga programática del modelo en scripts de evaluación personalizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (tabla de trials/successes vacía).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 millones de parámetros y dos flujos de imagen de 480x640, la huella es moderada y cabe holgadamente en GPUs de consumo actuales (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Para entrenamiento con batch 32 y dos cámaras se recomienda una GPU con al menos 16-24 GB de VRAM; para inferencia en tiempo real, una GPU de gama media es suficiente en la mayoría de casos.
- Compatibilidad con GPU de consumo: previsiblemente sí (RTX 3060/4060 en adelante), aunque no hay confirmación oficial.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path` apuntando al repositorio del Hub; también es posible cargar los safetensors mediante la API de LeRobot en scripts propios.
- Latencia y throughput: no disponibles. La política está pensada para operar a 30 FPS, la frecuencia de grabación del dataset, pero no se documenta el tiempo de inferencia real.
- Almacenamiento: 0,2 GB para el repositorio completo.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Tarea | Licencia | Evaluacion publicada |
|---|---|---|---|---|---|
| MakinoKF/rebot_pick_multiple_nut_dataset_20261111_170441_act-policy-v1 | 51,7 M | ACT / imitacion | pick the nut (rebot_b601_follower) | apache-2.0 | No |
| Políticas ACT genericas de LeRobot | variable | ACT / imitacion | manipulacion general | apache-2.0 | Depende del repo |
| Diffusion Policy (referencia del estado del arte en imitacion) | variable | diffusion | manipulacion general | variable | Si, en papers |
| VLA tipo OpenVLA / pi0 | miles de millones | VLA | manipulacion guiada por lenguaje | variable | Si, en papers |

La comparación directa con modelos fundacionales de robótica (VLA) no es homogénea: este modelo es una política específica de tarea y robot, mientras que los VLA son modelos generalistas con instrucciones en lenguaje natural. Frente a otras políticas ACT de LeRobot, la diferencia principal es el dataset y el robot objetivo, no la arquitectura.

## Limitaciones y advertencias

- Especialización extrema: entrenada únicamente para la tarea "pick the nut" en el robot `rebot_b601_follower`; no generaliza a otras tareas, objetos ni plataformas sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito medida, por lo que se desconoce su fiabilidad real en producción.
- Dataset pequeño: 88 episodios y 15.841 fotogramas son una base limitada; es probable que la política sea sensible a cambios de iluminación, posiciones de objeto o distracciones no representadas.
- Dependencia de hardware concreto: requiere el robot `rebot_b601_follower` y dos cámaras con los nombres `top` y `right` exactamente como en el entrenamiento.
- Sin capacidades lingüísticas: no procesa instrucciones en lenguaje natural; la tarea se fija por cadena literal en el comando de despliegue.
- Riesgo de sobreajuste a las condiciones de grabación: al no documentarse variaciones de entorno, la robustez fuera del entorno de entrenamiento es incierta.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el despliegue en producción es responsabilidad del integrador.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de validación por parte de la comunidad.
- Sin información sobre sesgos: no aplica el concepto de sesgo de lenguaje, pero sí el de sesgo de distribución del dataset de demostración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MakinoKF/rebot_pick_multiple_nut_dataset_20261111_170441_act-policy-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/MakinoKF/rebot_pick_multiple_nut_dataset_20261111_170441
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MakinoKF/rebot_pick_multiple_nut_dataset_20261111_170441
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
