# ShiangYu/act_so101_pick_place_v3

## Resumen

El modelo `ShiangYu/act_so101_pick_place_v3` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. Ha sido desarrollado por el usuario ShiangYu y entrenado con la librería LeRobot de Hugging Face para controlar un brazo robótico SO-101 (tipo `so_follower`) en una tarea de recoger y colocar un cubo en una caja. El modelo consume observaciones de estado (posición del robot) y una cámara frontal, y produce comandos de acción de 6 dimensiones.

Con 51,6 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo ligero pensado para ejecutarse en tiempo real en hardware de bajo coste. Su relevancia radica en que demuestra el flujo completo de entrenamiento de políticas robóticas con LeRobot, desde la recopilación de datos teleoperados hasta el despliegue, y está publicado bajo licencia Apache 2.0, lo que permite su uso comercial y modificación libre. La tarea específica es "coger el cubo y colocarlo en la caja", con un dataset de 85 episodios y 19.330 fotogramas a 30 FPS.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - transformer encoder-decoder con VAE |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (modelo de control robótico, no de procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT descrita en el paper [Action Chunking with Transformers](https://huggingface.co/papers/2304.13705). ACT utiliza un transformer encoder-decoder que predice un "chunk" de acciones futuras (típicamente entre 5 y 10 pasos) en lugar de una sola acción, lo que reduce el error acumulado y mejora la estabilidad del control. Además, incorpora un módulo VAE (variational autoencoder) para modelar la variabilidad multimodal de las demostraciones, permitiendo que la política genere trayectorias diversas pero coherentes con la tarea.

El entrenamiento se realizó con LeRobot versión 0.6.1, utilizando el dataset `ShiangYu/so101_pick_place_merged_v2` que contiene 85 episodios teleoperados de la tarea de pick-and-place. La configuración de entrenamiento incluye 100.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-05 y semilla 1000. No se menciona el uso de RLHF ni DPO; se trata de un aprendizaje por imitación supervisado puro. Las observaciones consisten en el estado del robot (6 dimensiones) y una imagen frontal de 480x640 píxeles en RGB.

## Capacidades

- Control robótico de pick-and-place: ejecuta la tarea de recoger un cubo y colocarlo en una caja, basándose en visión y estado propioceptivo.
- Aprendizaje por imitación: reproduce trayectorias aprendidas de demostraciones humanas teleoperadas.
- Generación de acciones en chunk: predice secuencias de acciones (6 dimensiones cada una) en lugar de pasos individuales, mejorando la suavidad del movimiento.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para entrenamiento, evaluación y despliegue en robots reales.
- Multimodalidad: combina entrada visual (imagen frontal) y estado del robot para tomar decisiones.
- Generalización limitada: entrenado específicamente para la tarea y el robot SO-101; no soporta otras tareas sin reentrenamiento.

## Casos de uso

- Automatización de tareas de manipulación en laboratorios: el modelo puede controlar un brazo SO-101 para mover objetos pequeños de una posición a otra, útil en entornos de investigación y prototipado.
- Pruebas de integración de LeRobot: sirve como ejemplo de referencia para desarrolladores que quieran verificar el flujo de entrenamiento y despliegue de políticas ACT con LeRobot.
- Educación en robótica: permite a estudiantes experimentar con aprendizaje por imitación en un robot real de bajo coste, sin necesidad de GPU potentes.
- Benchmarking de hardware robótico: puede usarse para evaluar la repetibilidad y precisión del brazo SO-101 en tareas estandarizadas de pick-and-place.
- Desarrollo de sistemas de teleoperación asistida: al predecir chunks de acción, puede integrarse en interfaces hombre-máquina para reducir la carga del operador.
- Base para fine-tuning: al estar licenciado bajo Apache 2.0, puede servir como punto de partida para entrenar políticas en tareas similares con datasets propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay datos de tasa de éxito, precisión ni comparación con otros métodos en tareas reales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación, pero al tratarse de un modelo de 51,6 millones de parámetros, se estima que cabe en GPUs con 4-6 GB de VRAM (por ejemplo, RTX 3060 o RTX 4060).
- GPU recomendadas: no se especifican, pero el entrenamiento se realizó con CUDA (según la configuración `--policy.device=cuda`). Cualquier GPU moderna con al menos 8 GB de VRAM debería ser suficiente para inferencia en tiempo real.
- Compatibilidad con GPUs de consumo: sí, es un modelo ligero que puede ejecutarse en hardware de gama media.
- Opciones de despliegue: LeRobot proporciona la CLI `lerobot-rollout` para ejecutar la política en un robot SO-101. No se mencionan otros runtime como vLLM u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; dependerá de la GPU y del bucle de control del robot.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa directa con otros modelos de la misma categoría. Existen otros repositorios de políticas ACT para el brazo SO-101 (por ejemplo, `ShiangYu/act_so101_pick_place` o los proyectos en GitHub de la comunidad), pero no se han publicado métricas comparativas. Se recomienda consultar el [paper de ACT](https://huggingface.co/papers/2304.13705) para comparaciones con métodos anteriores, aunque no se aplican directamente a este modelo concreto.

## Limitaciones y advertencias

- Sesgos y generalización: el modelo está entrenado únicamente con 85 episodios de una tarea específica y un robot concreto. No generaliza a otras tareas, objetos, posiciones o variaciones de iluminación sin reentrenamiento.
- Riesgo de alucinación: aunque no es un modelo de lenguaje, puede producir acciones erróneas si las observaciones se desvían de la distribución de entrenamiento, lo que podría causar movimientos inseguros.
- Limitaciones de contexto: la ventana de acción está limitada al chunk predicho (típicamente 5-10 pasos); no hay memoria a largo plazo del entorno.
- Dependencia de la calidad de las demostraciones: el rendimiento depende directamente de la calidad y cobertura del dataset teleoperado.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero se debe mantener el aviso de copyright y citar el método (paper de ACT y LeRobot) según la sección de citación de la model card.
- Sin resultados de evaluación: no hay evidencia publicada de tasa de éxito en el robot real, por lo que su fiabilidad en producción no está verificada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ShiangYu/act_so101_pick_place_v3)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Dataset de entrenamiento](https://huggingface.co/datasets/ShiangYu/so101_pick_place_merged_v2)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Visualización del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=ShiangYu/so101_pick_place_merged_v2)
