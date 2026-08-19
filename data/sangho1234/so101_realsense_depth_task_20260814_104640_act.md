# SANGHO1234/so101_realsense_depth_task_20260814_104640_act

## Resumen

Este modelo es una política de robótica entrenada con el método ACT (Action Chunking with Transformers), publicada por SANGHO JUNG (usuario SANGHO1234) en Hugging Face. Se trata de un sistema de aprendizaje por imitación que predice fragmentos de acciones (action chunks) en lugar de pasos individuales, lo que permite ejecutar tareas de manipulación robótica con alta tasa de éxito a partir de datos teleoperados. La política está especializada en una tarea de pick and place con percepción de profundidad sobre un brazo robótico SO-101 en configuración follower.

El modelo consume imágenes RGB y de profundidad de dos cámaras (externa y externa de profundidad) junto con el estado del robot (6 dimensiones), y produce acciones de 6 dimensiones. Fue entrenado con el framework LeRobot (versión 0.6.2) sobre un dataset de 18 episodios y 5405 frames a 30 FPS. Con 51,7 millones de parámetros, es un modelo compacto que cabe en cualquier GPU de consumo. Su relevancia radica en demostrar el uso de visión por profundidad en políticas de imitación para manipulación robótica de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), CVAE con backbone transformer |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica robotica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (politica robotica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion propuesto en el articulo "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). La arquitectura combina un autoencoder variacional condicional (CVAE) con un backbone transformer: el encoder condiciona la representacion latente sobre las observaciones actuales, y el decoder autoregresivo predice un fragmento de acciones futuras (action chunk) en lugar de una unica accion. Esto reduce la acumulacion de errores durante la ejecucion y mejora la consistencia del movimiento.

El entrenamiento se realizo con LeRobot 0.6.2 sobre un dataset de teleoperacion de 18 episodios (5405 frames, 30 FPS) para la tarea "pick and place task with depth". La configuracion de entrenamiento incluye 50.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-05 y semilla 1000. Las observaciones incluyen el estado del robot (6 dimensiones), una imagen RGB de 480x640 (3 canales) y una imagen de profundidad de 480x640 (1 canal). No se menciona el uso de RLHF, DPO ni otras tecnicas de refinamiento posterior al aprendizaje por imitacion.

## Capacidades

- Ejecucion de tareas de pick and place con percepcion de profundidad sobre el brazo robotico SO-101.
- Prediccion de fragmentos de acciones (action chunks) de 6 dimensiones, lo que permite movimientos suaves y coherentes.
- Fusion de multiples modalidades de entrada: estado del robot, imagen RGB e imagen de profundidad.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas, sin necesidad de recompensas ni refuerzo.
- Inferencia en tiempo real a 30 FPS, compatible con el pipeline de rollout de LeRobot.
- Integracion nativa con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue.

## Casos de uso

- Automatizacion de pick and place en laboratorios de investigacion: el modelo puede ejecutar tareas repetitivas de recogida y colocacion de objetos con percepcion de profundidad, lo que permite validar algoritmos de manipulacion sin intervencion humana.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para comparar variantes de ACT, modificar la arquitectura o probar nuevas tecnicas de aumento de datos en tareas con vision de profundidad.
- Prototipado rapido de politicas roboticas: gracias a LeRobot, se puede reentrenar el modelo con nuevos datasets teleoperados en pocas horas, acelerando el ciclo de iteracion en entornos de investigacion.
- Ensenanza de robots por demostracion: un operador puede teleoperar el brazo SO-101 para demostrar la tarea, y el modelo aprende a replicarla, lo que resulta util en entornos educativos y de formacion en robotica.
- Benchmarking de metodos de manipulacion con profundidad: al incluir una camara de profundidad como entrada, el modelo permite evaluar el impacto de la informacion de profundidad en la tasa de exito de tareas de manipulacion.
- Despliegue en entornos de bajo coste: con solo 51,7 millones de parametros, la politica puede ejecutarse en hardware modesto (GPU de consumo o incluso CPU), lo que la hace accesible para laboratorios con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet". No se dispone de datos de tasa de exito en el robot real ni de comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51.668.614 parametros. En FP32 ocupa aproximadamente 207 MB, y en FP16 unos 103 MB. Con overhead de activaciones y buffers, el consumo total de VRAM deberia ser inferior a 1 GB.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, A100, H100). Tambien es viable la inferencia en CPU para pruebas de baja frecuencia.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU consumer actual e incluso en integradas con suficiente memoria compartida.
- Opciones de despliegue: LeRobot CLI (`lerobot-rollout`), PyTorch directo, y el ecosistema LeRobot para entrenamiento y evaluacion. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. El modelo fue entrenado para operar a 30 FPS, lo que sugiere que la inferencia debe completarse en menos de 33 ms por paso, pero no se han publicado mediciones concretas.

## Comparativa con modelos similares

No se dispone de datos de comparacion directa con otras politicas ACT o modelos de manipulacion robotica en la informacion proporcionada. El modelo comparte la arquitectura ACT con otras politicas publicadas en el ecosistema LeRobot, pero no se han publicado resultados comparativos de rendimiento, tasa de exito ni latencia frente a alternativas como Diffusion Policy, CACTI u otros metodos de aprendizaje por imitacion.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: solo 18 episodios y 5405 frames, lo que limita la generalizacion a variaciones de posicion de objetos, iluminacion o condiciones del entorno no vistas durante el entrenamiento.
- Sin resultados de evaluacion: la model card no incluye tasa de exito en el robot real, por lo que el rendimiento real del modelo es desconocido.
- Especifico del robot SO-101: la politica esta entrenada para el brazo SO-101 en configuracion follower y no es directamente transferible a otros robots sin reentrenamiento.
- Dependencia de la calibracion de camaras: las observaciones incluyen imagenes de camaras externas (RGB y profundidad) que deben estar correctamente calibradas y posicionadas para que la politica funcione.
- Riesgo de sobreajuste: con solo 18 episodios, el modelo podria memorizar las demostraciones en lugar de aprender una politica generalizable.
- Sin soporte multilingue ni de lenguaje natural: es una politica robotica pura, no un modelo de lenguaje, por lo que no procesa instrucciones textuales.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que el hardware y el dataset asociado no tengan restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SANGHO1234/so101_realsense_depth_task_20260814_104640_act
- Dataset de entrenamiento: https://huggingface.co/datasets/SANGHO1234/so101_realsense_depth_task_20260814_104640
- Articulo ACT (arXiv): https://huggingface.co/papers/2304.13705
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentacion de LeRobot ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Referencia de comandos CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout de LeRobot: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SANGHO1234/so101_realsense_depth_task_20260814_104640
