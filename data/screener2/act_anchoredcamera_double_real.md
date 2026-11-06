# Screener2/act_AnchoredCamera_double_real

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de composición acumulado y suele lograr tasas de éxito elevadas en manipulación robótica. Este repositorio concreto, `Screener2/act_AnchoredCamera_double_real`, es una política entrenada con LeRobot (versión 0.5.2) sobre el robot `so_follower` con una única cámara cenital (`overhead`), orientada a la tarea "Green cylinder to yellow bucket".

La política consume el estado del robot (vector de 6 dimensiones) y una imagen RGB de 480x640 y produce un vector de acción de 6 dimensiones. Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto pensado para inferencia en tiempo real a 30 FPS sobre hardware modesto. Se distribuye bajo licencia Apache 2.0 en formato safetensors para la librería LeRobot.

Es relevante como ejemplo reproducible de extremo a extremo de un pipeline de imitación: dataset público, configuración de entrenamiento documentada y comando de despliegue listo para ejecutar en un robot real. No es un modelo de propósito general ni procesa lenguaje natural; su alcance es exclusivamente la política visomotora entrenada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija de estado e imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT sigue el planteamiento de Zhao et al. (2023): un transformer que combina un codificador visual (procesa la imagen `observation.images.overhead` de 3x480x640) y un codificador del estado propioceptivo (`observation.state`, vector de 6 dimensiones), fusionados en un decodificador que genera un chunk de acciones de 6 dimensiones. La predicción por chunks, en lugar de paso a paso, mitiga el problema de la composición de errores en horizontes largos y permite control a 30 FPS.

El entrenamiento se realizó exclusivamente con el dataset `Screener2/AnchoredCamera_double_real`: 30 episodios, 13.476 fotogramas a 30 FPS, una sola tarea ("Green cylinder to yellow bucket"). La configuración documentada es de 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni datos adicionales; se trata de aprendizaje por imitación supervisado a partir de teleoperación. La model card no especifica innovaciones técnicas adicionales más allá del propio mecanismo de action chunking.

## Capacidades

- Control visomotor para manipulación robótica: genera comandos de acción de 6 dimensiones a partir de una imagen cenital y del estado del robot.
- Predicción de chunks de acciones, lo que proporciona movimientos más suaves y menor deriva que el control paso a paso.
- Ejecución de la tarea específica "Green cylinder to yellow bucket" con el robot `so_follower` y una cámara `overhead`.
- Inferencia en tiempo real a 30 FPS en el bucle de control.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en lenguaje natural ni planificación simbólica.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de razonamiento (thinking), visión general, audio ni otras modalidades fuera de la política visomotora.

## Casos de uso

- Automatización de una tarea de pick-and-place en laboratorio: la política ejecuta el traslado de un cilindro verde a un cubo amarillo con el robot `so_follower`, útil como banco de pruebas de imitación antes de escalar a tareas más complejas.
- Reproducción de experimentos de investigación: al estar entrenada con un dataset público de 30 episodios, sirve para replicar resultados y comparar variantes de ACT con la misma base de datos.
- Base para fine-tuning con datos propios: el comando `lerobot-train` permite reentrenar la política sobre un dataset nuevo manteniendo la arquitectura y la configuración de referencia.
- Validación de pipelines de LeRobot: sirve como política de referencia para verificar la instalación, la calibración de cámaras y el cableado del robot antes de abordar proyectos mayores.
- Demostración educativa de aprendizaje por imitación: el flujo completo (grabar teleoperación, entrenar, desplegar) es reproducible con hardware de bajo coste tipo `so_follower`.
- Pruebas de robustez ante variaciones de iluminación o posición de objetos: al ser una política de una sola cámara y una sola tarea, permite medir la degradación del éxito al cambiar condiciones controladas.
- Integración en un banco de evaluación comparativa de políticas robóticas, junto con otras políticas ACT o difusión entrenadas sobre el mismo dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa por el tamaño del modelo (51,7 M de parámetros); en la práctica el cuello de botella es la codificación de imagen a 480x640 y el pipeline de cámaras.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior cubre holgadamente la inferencia a 30 FPS.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: LeRobot con el comando `lerobot-rollout` (estrategia `base`), con backend PyTorch sobre CUDA o CPU; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no se publican cifras medidas; el bucle de control está pensado para operar a 30 FPS, coincidiendo con la tasa del dataset de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Screener2/act_AnchoredCamera_double_real | 51,7 M | estado (6,) + imagen 3x480x640 | Pick-and-place "green cylinder to yellow bucket" | Apache 2.0 | Hugging Face (LeRobot) |
| Políticas ACT genéricas de LeRobot | variable | estado + imagen | Manipulación según dataset | Apache 2.0 | Hugging Face (LeRobot) |
| Políticas de difusión (Diffusion Policy) en LeRobot | variable | estado + imagen | Manipulación según dataset | Apache 2.0 | Hugging Face (LeRobot) |
| Modelos VLA de propósito general | cientos de millones a miles de millones | instrucciones en lenguaje + imagen | Múltiples tareas | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, modalidad de entrada y licencia.

## Limitaciones y advertencias

- Entrenada para una única tarea ("Green cylinder to yellow bucket") y un único robot (`so_follower`); no generaliza a otras tareas sin reentrenamiento.
- Depende de una cámara cenital (`overhead`) con la misma configuración de resolución y nombre de clave de observación; cambios en el montaje o la calibración degradan el comportamiento.
- Dataset de entrenamiento muy reducido (30 episodios, 13.476 fotogramas), lo que aumenta el riesgo de sobreajuste a posiciones, iluminación y fondo concretos.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito en robot real.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas o inseguras ante entradas fuera de distribución.
- No procesa lenguaje natural ni instrucciones; el campo `--task` es una etiqueta de la tarea, no una orden interpretada semánticamente.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y el alcance limitado hacen desaconsejable su despliegue en producción sin validación propia.
- No se documentan sesgos demográficos ni lingüísticos por la naturaleza del modelo; los sesgos relevantes son de dominio (entorno, objetos y robot de entrenamiento).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Screener2/act_AnchoredCamera_double_real
- Dataset de entrenamiento: https://huggingface.co/datasets/Screener2/AnchoredCamera_double_real
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Screener2/AnchoredCamera_double_real
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
