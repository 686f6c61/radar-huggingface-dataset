# arjunjuneja/act_vials_50k

## Resumen

El modelo `act_vials_50k` es una política de robótica basada en el método Action Chunking with Transformers (ACT), desarrollada por Arjun y publicada en Hugging Face bajo la licencia Apache 2.0. ACT es un método de aprendizaje por imitación que predice secuencias de acciones (action chunks) en lugar de pasos individuales, lo que permite un control más suave y robusto del robot. El modelo ha sido entrenado con el framework LeRobot y está especializado en la tarea de recoger un vial y colocarlo en un rack, utilizando un robot tipo SO-101 con dos cámaras.

La relevancia de este modelo reside en su demostración práctica de cómo aplicar ACT a tareas de manipulación reales con datos teleoperados. Con 51,7 millones de parámetros, es un modelo relativamente compacto que puede ejecutarse en hardware de consumo, lo que lo hace accesible para laboratorios de robótica y desarrolladores. El entrenamiento se realizó sobre un dataset de 145 episodios (38.990 frames a 30 FPS) con 50.000 pasos de entrenamiento, lo que refleja un pipeline completo y reproducible dentro del ecosistema LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - Transformer con codificador y decodificador |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control robotico, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizacion publicada) |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que emplea un transformer con arquitectura encoder-decoder. La innovacion principal es que predice un "chunk" de acciones futuras (tipicamente 10-100 pasos) en lugar de una sola accion, lo que reduce el error de acumulacion y mejora la suavidad del movimiento. El modelo recibe observaciones de estado del robot (vector de 6 dimensiones) y dos imagenes RGB (ego y externa, ambas de 480x640), y produce una secuencia de acciones de 6 dimensiones.

El entrenamiento se realizo con el framework LeRobot (version 0.6.2) sobre el dataset `sreetz-nv/so101_teleop_vials_rack_left_cosmos_70`, que contiene 145 episodios de teleoperacion (38.990 frames a 30 FPS) de la tarea "recoger el vial y colocarlo en el rack". Se usaron 50.000 pasos de entrenamiento con batch size 8, optimizador AdamW y learning rate 1e-5, con semilla 1000. No se menciona el uso de RLHF, DPO ni tecnicas de refuerzo; es aprendizaje por imitacion puro (behavior cloning).

## Capacidades

- Control robotico de manipulacion: el modelo genera comandos de accion de 6 grados de libertad (posicion y orientacion del efector final) para el robot SO-101.
- Percepcion visual multimodal: procesa simultaneamente dos camaras RGB (ego y externa D455) junto con el estado del robot.
- Aprendizaje por imitacion: reproduce la tarea demostrada mediante teleoperacion, sin necesidad de programacion explicita de trayectorias.
- Generalizacion dentro de la tarea: puede manejar variaciones leves en la posicion de los objetos dentro del espacio de trabajo, aunque no se han publicado evaluaciones cuantitativas.
- Integracion con LeRobot: compatible con el ecosistema de herramientas de LeRobot para entrenamiento, evaluacion y despliegue.
- Ejecucion en tiempo real: al predecir chunks de acciones, el modelo puede operar a frecuencias de control adecuadas para manipulacion (30 FPS de entrada).
- Sin capacidades de lenguaje, tool calling ni razonamiento simbolico: es un modelo puramente motor.

## Casos de uso

- Automatizacion de tareas de pick-and-place en laboratorios: el modelo puede integrarse en un robot SO-101 para recoger viales y colocarlos en racks, una tarea comun en entornos de biologia o quimica. Su robustez al predecir chunks de acciones reduce vibraciones y errores acumulados.
- Prototipado rapido de politicas de manipulacion: investigadores pueden usar este modelo como punto de partida para entrenar politicas en tareas similares, ajustando el dataset y reentrenando con LeRobot.
- Evaluacion de metodos de aprendizaje por imitacion: sirve como baseline para comparar ACT con otros metodos (diffusion policies, etc.) en tareas de manipulacion con vision.
- Educacion en robotica: permite a estudiantes y desarrolladores experimentar con un pipeline completo de entrenamiento y despliegue de politicas neuronales en robots reales, usando un modelo pequeno y manejable.
- Teleoperacion asistida: el modelo puede usarse en modo de asistencia, donde el operador humano corrige la trayectoria y el modelo completa la tarea de forma autonoma.
- Benchmarking de hardware robotico: al ser un modelo ligero, puede ejecutarse en GPUs de gama media para medir latencias y throughput en diferentes configuraciones de robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito en pruebas reales con el robot. El autor indica explicitamente que no hay resultados de evaluacion ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 51,7 millones de parametros, la inferencia requiere aproximadamente 200-400 MB de VRAM en FP32 (los pesos ocupan 0.2 GB). Con cuantizacion (no publicada) podria reducirse, pero no hay datos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia; por ejemplo, NVIDIA GTX 1650, RTX 3060 o superiores. Para entrenamiento, se recomienda una GPU con 8-12 GB (RTX 3080, RTX 4090, A100) para manejar el batch size de 8 con imagenes de 480x640.
- Compatibilidad con consumer GPU: si, cabe perfectamente en GPUs de consumo para inferencia; el entrenamiento tambien es viable en GPUs de gama media-alta.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) que funcionan con el robot SO-101. Tambien puede exportarse a ONNX o TensorRT para inferencia en edge, aunque no hay documentacion especifica en la model card.
- Latencia y throughput: no disponibles. Al ser un transformer con dos entradas visuales, la latencia dependera de la GPU y de la optimizacion del codigo; en una GPU moderna se espera inferencia en tiempo real (<50 ms por paso), pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa. Sin embargo, se puede contextualizar frente a otras politicas de manipulacion:

| Modelo | Parametros | Tarea | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_vials_50k (este) | 51,7 M | Pick-and-place de viales | Imitacion, 50k pasos | Apache 2.0 | Hugging Face |
| Diffusion Policy (Chi et al., 2023) | variable (tipicamente 50-100 M) | Manipulacion general | Imitacion con denoising | MIT | Codigo abierto |
| ACT original (Zhao et al., 2023) | ~80 M (configuracion base) | Manipulacion de precision | Imitacion | MIT | Codigo abierto |

La comparativa es orientativa; no hay benchmarks compartidos que permitan comparar directamente el rendimiento de este modelo con los otros. La principal diferencia es que este modelo esta entrenado para una tarea especifica y empaquetado en el formato LeRobot.

## Limitaciones y advertencias

- No hay resultados de evaluacion publicados: se desconoce la tasa de exito real en el robot, por lo que no se puede garantizar su fiabilidad en produccion.
- Especificidad de la tarea: el modelo esta entrenado para una unica tarea (recoger vial y colocarlo en rack) con un robot concreto (SO-101) y una configuracion de camaras fija. No generaliza a otras tareas ni a cambios significativos en el entorno (iluminacion, posicion de camaras, tipo de robot).
- Riesgo de sobreajuste al dataset: con solo 145 episodios, el modelo puede memorizar las trayectorias especificas y fallar ante variaciones no vistas.
- Dependencia de la calibracion del robot: el modelo espera observaciones de estado y acciones en el mismo espacio de coordenadas que el robot usado en el entrenamiento; cualquier cambio en la calibracion puede degradar el rendimiento.
- Sesgos del dataset: los datos teleoperados reflejan el estilo del operador; si el operador tiene una forma particular de realizar la tarea, el modelo la replicara, incluyendo posibles ineficiencias.
- Sin soporte para tareas de largo horizonte: la prediccion de chunks de acciones esta limitada a la longitud del chunk (no especificada en la model card); tareas que requieren planificacion a largo plazo pueden fallar.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el usuario es responsable de cumplir con las condiciones de la licencia y de citar el metodo y LeRobot segun la bibtex proporcionada.
- No se proporcionan pesos cuantizados ni formatos alternativos (GGUF, ONNX), lo que limita el despliegue en hardware muy restringido.

## Enlaces

- Repositorio del modelo: https://huggingface.co/arjunjuneja/act_vials_50k
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Framework LeRobot: https://github.com/huggingface/lerobot
- Documentacion de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Dataset de entrenamiento: https://huggingface.co/datasets/sreetz-nv/so101_teleop_vials_rack_left_cosmos_70
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sreetz-nv/so101_teleop_vials_rack_left_cosmos_70
