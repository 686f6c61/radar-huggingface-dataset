# namiciro/blue-only35-act-policy

## Resumen

`namiciro/blue-only35-act-policy` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv 2304.13705, y empaquetada con la librería LeRobot de Hugging Face. El modelo ha sido desarrollado por el usuario namiciro y resuelve una tarea concreta de manipulación de bloques sobre un robot de tipo `so_follower` (SO-100/SO-101 de LeRobot), a partir de observaciones consistentes en el estado de las articulaciones (vector de 6 dimensiones) y una única cámara frontal de 480x640 píxeles.

La arquitectura es un transformer ACT que predice *chunks* de acciones (secuencias cortas de comandos) en lugar de pasos individuales, lo que reduce el error de composición y mejora la estabilidad en tareas de imitación. El modelo tiene 51.668.614 parámetros (unos 51,7 M) y un tamaño de repositorio de 0,2 GB en formato safetensors. No es un modelo de lenguaje: no procesa texto libre ni tiene ventana de contexto en el sentido habitual, sino que mapea observaciones sensoriales a acciones motoras de 6 grados de libertad.

Es relevante ahora porque forma parte del ecosistema creciente de políticas robóticas reproducibles y de bajo coste que LeRobot está popularizando: cualquier persona con un SO-100 puede descargar la política, conectarla a su robot y ejecutar la tarea sin entrenar desde cero. La model card, sin embargo, no incluye resultados de evaluación en robot real, licencia declarada ni idiomas soportados, lo que limita su uso directo en producción sin una validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; predice chunks de acciones a partir de una observación (estado de 6 dims + imagen 3x480x640) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las tareas se especifican en inglés en la model card) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (repositorio de 0,2 GB) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone visual (codificador de imágenes) con un transformer encoder-decoder que genera secuencias de acciones de longitud fija (action chunks). La innovación principal del método es predecir varios pasos de acción a la vez, lo que mitiga el problema de acumulación de errores típico de las políticas que predicen un único paso, y permite un control más suave y consistente en tareas de manipulación. En este caso concreto, la política consume `observation.state` (6,) y `observation.images.front` (3, 480, 640) y produce `action` (6,).

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `namiciro/red-to-right-v2`, compuesto por 70 episodios y 30.440 fotogramas a 30 FPS, con dos tareas: "Put the red block in the right box" y "Put the blue block in the left box". La configuración fue de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el uso de RLHF, DPO ni ninguna fase de refinamiento posterior; es aprendizaje supervisado puro a partir de demostraciones teleoperadas. Tampoco se especifica el número de tokens de entrenamiento (no aplica) ni la composición exacta del dataset más allá de los episodios y tareas indicados.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot `so_follower` a partir de estado articular e imagen frontal.
- Aprendizaje por imitación de tareas específicas: reproduce las dos tareas del dataset ("Put the red block in the right box" y "Put the blue block in the left box").
- Predicción de chunks de acciones: emite secuencias cortas de comandos en lugar de pasos individuales, lo que mejora la estabilidad del movimiento.
- Percepción visual monocámara: procesa imágenes RGB de 480x640 a 30 FPS desde una única cámara frontal.
- Integración con el ecosistema LeRobot: se ejecuta con `lerobot-rollout` y se entrena con `lerobot-train`.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico: no es un modelo de lenguaje.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión general, audio ni otras capacidades multimodales más allá de la imagen de entrada.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política ejecuta la tarea de colocar el bloque rojo en la caja derecha o el azul en la izquierda sobre un SO-100, útil para validar pipelines de imitación antes de escalar a tareas más complejas.
- Reproducción de experimentos de investigación: sirve como referencia reproducible del método ACT con un dataset pequeño (70 episodios) para comparar hiperparámetros, aumentos de datos o variantes de arquitectura.
- Base para fine-tuning con nuevos objetos: al estar entrenada con LeRobot 0.7.1, se puede reentrenar con `lerobot-train` sobre un dataset propio y comparar la curva de éxito frente a este checkpoint.
- Docencia y formación en robótica de bajo coste: permite a estudiantes montar un SO-100, grabar demostraciones y ejecutar una política preentrenada sin necesidad de GPUs de gama alta.
- Pruebas de robustez ante cambios de iluminación y posición: al no haber evaluación publicada, este checkpoint es un punto de partida para medir la degradación de la política ante distractores o cambios de escena.
- Integración en pipelines de evaluación automatizada: se puede lanzar con `lerobot-rollout --strategy.type=base --duration=60` para generar trayectorias y medir tasas de éxito de forma sistemática antes de desplegar en un robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", y la tabla de evaluación está vacía. No se dispone de tasas de éxito en robot real, ni de métricas de pérdida de entrenamiento, ni de comparaciones con otras políticas ACT del Hub.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, en torno a 1-2 GB en FP32 dado el tamaño de 51,7 M de parámetros y la imagen de entrada de 480x640; en FP16 puede bajar de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior permite inferencia en tiempo real a 30 FPS. Para entrenamiento, una RTX 3090/4090 o A100 acelera los 20.000 pasos, aunque el modelo es lo bastante pequeño para entrenar en GPUs de gama media.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM; también es viable en CPU para inferencia a baja frecuencia, aunque no se recomienda para control en tiempo real.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con backend PyTorch; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el dataset está grabado a 30 FPS y la política está pensada para ejecutarse a esa frecuencia, pero no se documenta la latencia real por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| namiciro/blue-only35-act-policy | 51,7 M | estado (6,) + imagen 3x480x640 | Manipulación SO-100, 2 tareas | no disponible | Hugging Face (LeRobot) |
| Políticas ACT de referencia en LeRobot | ~50 M (típico) | estado + imagen | Tareas de imitación diversas | normalmente Apache-2.0 en ejemplos de LeRobot | Hugging Face Hub |
| Políticas Diffusion Policy | variable (decenas de M) | estado + imagen | Manipulación por difusión | variable según autor | Hugging Face Hub |
| Políticas VLA (p. ej. OpenVLA) | miles de M | imagen + instrucción en lenguaje | Manipulación generalista | variable (a menudo restrictiva) | Hugging Face Hub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, tipo de entrada y licencia.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no se puede afirmar que la política funcione de forma fiable fuera del dataset de entrenamiento.
- Licencia no declarada: la model card indica "More Information Needed"; no se puede asumir uso comercial sin consultar al autor.
- Dataset muy pequeño: 70 episodios y 30.440 fotogramas limitan la generalización a posiciones, iluminaciones y objetos distintos de los vistos en entrenamiento.
- Tareas restringidas: solo se ha entrenado para dos instrucciones concretas ("Put the red block in the right box" y "Put the blue block in the left box"); no generaliza a otras instrucciones en lenguaje natural.
- Dependencia de hardware específico: diseñada para `so_follower` con una cámara frontal; requiere calibración y coincidencia de nombres de cámara con las claves de observación.
- Sin soporte multilingüe ni de texto: no es un modelo de lenguaje, por lo que no se puede usar para generación, razonamiento o atención al cliente.
- Riesgo de sobreajuste al entorno de grabación: al no haber distractores ni variaciones documentadas, es probable que la política falle ante cambios de fondo, iluminación o posición inicial del robot.
- Sin cuantizaciones publicadas: no hay versiones GGUF/ONNX, lo que limita el despliegue en entornos sin PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/namiciro/blue-only35-act-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/namiciro/red-to-right-v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=namiciro/red-to-right-v2
- Paper ACT (arXiv 2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
