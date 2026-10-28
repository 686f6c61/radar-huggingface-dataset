# nguigz/balle1_trained2

## Resumen

`nguigz/balle1_trained2` es una política de robótica entrenada con ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos de acciones (*action chunks*) en lugar de pasos individuales. No es un modelo de lenguaje: es un controlador visomotor que consume el estado articular de un brazo robótico de 6 grados de libertad y una imagen de cámara cenital de 480x640, y devuelve un vector de acción de 6 dimensiones. Lo publica el usuario `nguigz` en el Hub de Hugging Face usando LeRobot, la librería de Hugging Face para robótica de bajo coste.

El modelo resuelve una tarea única y concreta: llevar una pelota a una caja («mettre la balle dans le bac»), aprendida a partir de 15 episodios de teleoperación (6402 fotogramas a 30 FPS) sobre un robot `so_follower`. Con 51.668.614 parámetros y un peso en disco de aproximadamente 0,2 GB, es un checkpoint pequeño, pensado para ejecutarse en bucle cerrado a 30 Hz sobre hardware de consumo.

Su relevancia es la de un ejemplo reproducible de *imitation learning* de extremo a extremo: documenta la configuración exacta de entrenamiento (100.000 pasos, batch 8, AdamW, LR 1e-5, semilla 1000, LeRobot 0.6.2), lo que lo convierte en una referencia útil para quien quiera replicar el pipeline o usarlo como línea base. Conviene subrayar que no se han publicado resultados de evaluación en robot real, por lo que su tasa de éxito es desconocida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual, entrenado con LeRobot 0.6.2 |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es un modelo Mixture of Experts) |
| Longitud de contexto | no aplica; ventana de observación de un solo fotograma más estado (3, 480, 640) y vector de estado de 6 dimensiones |
| Tipos de cuantización | no se publican variantes cuantizadas; pesos en safetensors en precisión nativa. Admite conversión a fp16/bf16 o int8 con PyTorch |
| Idiomas soportados | no aplica como modelo generativo; la instrucción de tarea está fijada en francés: «mettre la balle dans le bac» |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Entradas | `observation.state` (6,), `observation.images.top` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tipo de robot | `so_follower` |
| Cámaras | 1 (`top`) |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 2026-10-28 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el artículo arXiv:2304.13705, que combina un codificador visual (típicamente una ResNet preentrenada) con un transformer codificador-decodificador que predice un *chunk* de acciones futuras. La predicción por bloques, en lugar de paso a paso, reduce el error de composición acumulado y suaviza la política, lo que se traduce en movimientos más estables en robots de bajo coste. El checkpoint tiene 51,7 millones de parámetros, coherente con una columna vertebral visual convolucional más un transformer compacto; LeRobot no documenta en esta ficha el tamaño del *chunk* ni la dimensionalidad del latente, por lo que esos hiperparámetros concretos no están disponibles.

El entrenamiento se realizó sobre el dataset `nguigz/balle1`: 15 episodios, 6402 fotogramas a 30 FPS, una sola cámara cenital y una única tarea. La configuración declarada es de 100.000 pasos con batch de 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. No se menciona uso de RLHF, DPO ni *reward models*: es aprendizaje supervisado puro sobre demostraciones teleoperadas. Tampoco se documenta aumentación de datos, composición del dataset más allá del recuento de episodios, ni innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control visomotor de un brazo `so_follower` de 6 grados de libertad a partir de una imagen RGB de 480x640 y el estado articular.
- Predicción de *action chunks*: genera secuencias cortas de acciones, lo que produce trayectorias más suaves que el control paso a paso.
- Ejecución de una tarea de manipulación concreta: coger una pelota y depositarla en una caja.
- Aprendizaje por imitación: reproduce la distribución de comportamientos presente en las 15 demostraciones teleoperadas.
- Inferencia en bucle cerrado en tiempo real, con el comando `lerobot-rollout` de LeRobot.
- Ejecución sin grabación de episodios (`--strategy.type=base`), útil para pruebas rápidas con duración limitada.
- No soporta *tool calling*, *function calling*, razonamiento multi-paso simbólico, generación de texto, código, matemáticas, visión general, audio ni modo *thinking*: no es un modelo de propósito general.

## Casos de uso

- Replicación de investigación en aprendizaje por imitación: sirve como referencia ejecutable del pipeline ACT de LeRobot, con hiperparámetros publicados, para comparar variantes propias de *chunking*, aumentación o arquitectura visual.
- Demostración educativa de robótica de bajo coste: un brazo SO-100/SO-101 con una cámara cenital y una GPU modesta bastan para reproducir la tarea de recogida de pelota en talleres y cursos.
- Punto de partida para *fine-tuning*: al tener 51,7 M de parámetros y licencia Apache 2.0, se puede reentrenar con un dataset propio de otra tarea y reutilizar la inicialización visual.
- Validación de pipelines de captura de datos: permite comprobar de extremo a extremo el flujo de grabación, calibración, entrenamiento y despliegue antes de invertir en un dataset grande.
- Pruebas de integración en infraestructura de inferencia: útil para medir latencia y estabilidad del bucle de control a 30 Hz en distintas GPU o en un dispositivo embebido tipo Jetson.
- Laboratorio de evaluación de robustez: al carecer de métricas publicadas, es un caso idóneo para medir experimentalmente el efecto de cambios de iluminación, posición inicial del objeto o fondo sobre una política entrenada con pocos episodios.
- Base para experimentos de *data scaling*: comparar su comportamiento con el de políticas entrenadas con 50 o 200 episodios del mismo dataset permite cuantificar cuántos datos necesita ACT para una tarea simple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación con el texto «No evaluation results have been provided for this policy yet», por lo que no existe tasa de éxito medida en robot real, ni número de ensayos, ni condiciones de evaluación documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. Los pesos en fp32 ocupan unos 207 MB (51,7 M de parámetros) y en fp16/bf16 unos 103 MB; el grueso del consumo proviene de las activaciones de la ResNet sobre imágenes de 480x640, no de los pesos.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM es suficiente. Una RTX 3060, RTX 4060 o RTX 4090 cubren la inferencia con holgura; una A100 o H100 solo tendría sentido si se comparten con otros procesos.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU discreta de los últimos ocho años, e incluso en iGPU recientes con 8 GB de memoria unificada.
- Dispositivos embebidos: un Jetson Orin Nano o similar es un objetivo razonable para despliegue en el propio robot, aunque no se han publicado mediciones de latencia en esta plataforma.
- Opciones de despliegue: `lerobot-rollout` con PyTorch como backend principal, tal como documenta la model card. No aplica vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo generativo de texto, y no se distribuyen pesos GGUF.
- Latencia y throughput: no disponibles. El requisito operativo derivado del dataset es sostener 30 Hz (unos 33 ms por paso de control), pero no se ha publicado la latencia real medida de esta política.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nguigz/balle1_trained2` (este) | ACT, aprendizaje por imitación | 51,7 M | 1 imagen 480x640 + estado de 6 dim. | Apache 2.0 | Hub de Hugging Face, 0 descargas |
| ACT original (Zhao et al., 2023) | ACT, referencia académica | no disponible en esta ficha (el artículo describe la arquitectura, no un checkpoint único) | imágenes multi-cámara; tareas bimanuales | código publicado por los autores | Repositorio del artículo |
| Diffusion Policy | difusión para políticas visomotoras | variable según configuración; no disponible | imágenes + estado | MIT (implementación de referencia) | Repositorio público |
| Políticas VLA tipo SmolVLA | modelo visión-lenguaje-acción | cientos de millones (según datos publicados por sus autores) | instrucciones en lenguaje natural + imágenes | licencia abierta según versión | Hub de Hugging Face |

La comparación cuantitativa de rendimiento no es posible: este checkpoint no publica tasas de éxito y las alternativas reportan métricas sobre tareas y robots distintos, por lo que cualquier comparación numérica sería engañosa. La diferencia cualitativa relevante es que ACT es una política específica de tarea, sin condicionamiento por lenguaje, mientras que las aproximaciones VLA aceptan instrucciones en lenguaje natural a cambio de un coste computacional mucho mayor.

## Limitaciones y advertencias

- Generalización muy limitada: 15 episodios y 6402 fotogramas son un volumen reducido; es esperable un sobreajuste a posiciones, iluminación y fondo presentes en las demostraciones.
- Tarea única: la política solo ejecuta «mettre la balle dans le bac»; no acepta otras instrucciones ni composición de tareas.
- Sin evaluación publicada: se desconoce la tasa de éxito, el número de ensayos y las condiciones de prueba. Cualquier uso en producción exige una evaluación propia previa.
- Dependencia de la encarnación: entradas y salidas están fijadas a 6 dimensiones de estado y 6 de acción para un `so_follower`; no se puede trasladar a otro robot sin reentrenar.
- Sensibilidad a la cámara: se entrenó únicamente con una vista cenital (`top`) a 480x640; cambiar la cámara, la resolución o el encuadre degradará el comportamiento, y los nombres de las claves de observación deben coincidir exactamente.
- Riesgo de fallo silencioso: ante objetos o escenas fuera de distribución, la política puede generar acciones plausibles pero incorrectas sin señal de incertidumbre, ya que no expone estimaciones de confianza.
- Sesgos: no aplican sesgos lingüísticos o demográficos propios de un LLM, pero sí el sesgo de las demostraciones humanas (velocidad, trayectoria y estilo del teleoperador).
- Licencia Apache 2.0: permite uso comercial y modificación, con la obligación habitual de conservar el aviso de licencia; no hay garantía de ningún tipo por parte del autor.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin demo en vídeo ni resultados de robot real; debe tratarse como un artefacto experimental, no como un componente validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nguigz/balle1_trained2
- Dataset de entrenamiento: https://huggingface.co/datasets/nguigz/balle1
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nguigz/balle1
- Artículo de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y *rollout*: https://huggingface.co/docs/lerobot/main/en/inference
