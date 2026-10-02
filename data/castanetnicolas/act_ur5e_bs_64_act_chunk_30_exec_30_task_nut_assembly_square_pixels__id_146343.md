# castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_30_Exec_30_TASK_nut_assembly_square_PIXELS__ID_146343

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones ("chunks") en lugar de un único paso de control. Este repositorio concreto, publicado por el usuario castanetnicolas, es una política entrenada con LeRobot sobre el conjunto de datos robomimic en su variante `square` (imágenes de 84x84 píxeles) y empaquetada con la librería `lerobot`. La tarea aprendida es recoger una tuerca cuadrada y colocarla sobre una clavija cuadrada.

La política no es un modelo de lenguaje: es un modelo de visión-lenguaje-acción reducido, con 51.601.031 parámetros (unos 51,6 millones), que consume el estado del robot (vector de 9 dimensiones) y dos flujos de imagen de 3x84x84 píxeles (vista de agente y vista de pinza), y produce un vector de acción de 7 dimensiones. Todo el repositorio ocupa 0,2 GB y los pesos están en formato safetensors bajo licencia Apache 2.0.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un entrenamiento ACT completo con LeRobot 0.6.1 (120.000 pasos, batch 64, AdamW, learning rate 1e-5), útil para quien quiera replicar el pipeline, comparar hiperparámetros o reutilizar la receta con sus propios datos de teleoperación. No incluye resultados de evaluación en robot real, por lo que su tasa de éxito es desconocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificadores visuales; paper arXiv:2304.13705 |
| Parametros totales | 51.601.031 (dato real de los safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; horizonte de acción en chunks, aparentemente 30 pasos de acción por chunk según el nombre del repositorio, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible; la tarea se especifica mediante un prompt de texto en inglés en el CLI |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Entradas | `observation.state` (9,), `observation.images.agentview` (3, 84, 84), `observation.images.robot0_eye_in_hand` (3, 84, 84) |
| Salida | `action` (7,) |
| Camaras | `agentview`, `robot0_eye_in_hand` |
| Tamano del repositorio | 0,2 GB |
| Libreria | lerobot (version 0.6.1 en el entrenamiento) |
| Pipeline | robotics |

## Arquitectura y entrenamiento

ACT es un transformer que aprende de datos teleoperados. En lugar de predecir una sola acción por paso, genera un chunk de acciones futuras, lo que reduce el error de acumulación y permite movimientos más suaves y estables. El diseño habitual combina un codificador visual (típicamente una ResNet) para cada cámara y un codificador de estado propio, cuyas representaciones se concatenan y se pasan a un transformer encoder-decoder con decodificación autorregresiva sobre las acciones (más una componente de estilo latente en la formulación original, no confirmada en este repositorio). No se trata de un MoE ni de un modelo híbrido SSM: es un transformer denso de tamaño reducido.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `castanetnicolas/robomimic_square_ph_image84`: 200 episodios, 30.154 fotogramas y 20 FPS, con la tarea "Pick up the square nut and place it on the square peg". La configuración declarada es de 120.000 pasos, batch de 64, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta el número de tokens ni de muestras procesadas, ni si hubo etapas de RLHF o DPO (no aplican en aprendizaje por imitación). Tampoco se detalla la composición exacta del dataset más allá de episodios y fotogramas.

Nota de coherencia: el nombre del repositorio menciona `UR5e`, mientras que la model card declara `Robot type: panda`. El dataset de origen es robomimic `square`, una tarea simulada con brazo Franka Panda. Conviene verificar el robot objetivo antes de reutilizar la política.

## Capacidades

- Control robótico por imitación: genera vectores de acción de 7 grados de libertad (posición y pinza) a partir de observaciones visuales y de estado.
- Manipulación visual guiada: usa dos vistas simultáneas (cámara externa y cámara en la pinza) para localizar y ensamblar objetos.
- Predicción en chunks de acciones: produce secuencias cortas de acciones en lugar de pasos aislados, lo que mejora la suavidad del movimiento.
- Ejecución en bucle cerrado a 20 FPS: el modelo fue entrenado con datos a esa frecuencia, que marca el presupuesto temporal por inferencia.
- Especialización en una única tarea: "Pick up the square nut and place it on the square peg".
- No soporta tool calling ni function calling.
- No soporta razonamiento agéntico multi-paso ni planificación simbólica.
- Sin capacidades multilingües ni de generación de texto: no es un modelo de lenguaje.
- Sin capacidades de visión general (VQA, OCR, detección abierta): el codificador visual está especializado en la tarea.
- No se documenta modo "thinking", audio ni ninguna capacidad adicional.

## Casos de uso

- Replicación de la receta ACT: entrenar una política equivalente desde cero con `lerobot-train` usando este repositorio como referencia de hiperparámetros (120.000 pasos no suele ser suficiente para una convergencia completa en ACT, así que sirve como punto de partida para comparar curvas de pérdida).
- Ensamblaje de precisión en simulación: ejecutar la política en el entorno robomimic `square` para estudiar el comportamiento de los chunks de acción en tareas de inserción con tolerancias estrechas.
- Base para fine-tuning en robot real: sustituir el dataset por grabaciones propias de teleoperación con un UR5e o un Panda y reentrenar, manteniendo la arquitectura y el pipeline de LeRobot.
- Estudio de robustez visual: evaluar cómo se degrada la política ante cambios de iluminación, posición de la tuerca o distractores, dado que la entrada es de solo 84x84 píxeles por cámara.
- Docencia y prototipado en robótica: política pequeña (51,6 M de parámetros) que cabe en una GPU de consumo o incluso en CPU para demostraciones de aprendizaje por imitación.
- Referencia para comparativas de hiperparámetros: por ejemplo, medir el efecto del tamaño del chunk de acción frente a configuraciones con chunk más corto, partiendo de los valores indicados en el nombre del repositorio (30/30, no confirmados).
- Integración en pipelines de evaluación automatizada: lanzar rollouts con `lerobot-rollout` y `--strategy.type=base` para medir tasas de éxito en simulación sin grabar episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica: "No evaluation results have been provided for this policy yet", sin tabla de ensayos, éxitos ni tasa de éxito.

## Requisitos de hardware

- VRAM estimada: en float32, unos 206 MB de pesos; en float16/bfloat16, unos 103 MB. Con activaciones, buffers de imagen y overhead del runtime, cabe holgadamente por debajo de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluida una GTX 1650 o superior. Una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para el modelo, pero pueden ser necesarias si se entrena desde cero con batch 64.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo, e incluso en CPU para inferencia (con latencia mayor).
- Opciones de despliegue: CLI de LeRobot (`lerobot-rollout` con `--policy.path`), PyTorch con CUDA. vLLM, llama.cpp, Ollama y TGI no aplican: no es un modelo de lenguaje y no hay pesos GGUF publicados. La exportación a ONNX o TorchScript es posible pero no está documentada en el repositorio.
- Latencia y throughput: no disponibles. Como referencia, el dataset está a 20 FPS, lo que implica un presupuesto de 50 ms por paso de control para mantener el ritmo original; no se publica ninguna medición de latencia.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este repositorio) | Transformer con chunks de acción | 51,6 M | no aplica | Apache 2.0 | Pesos en HuggingFace, safetensors, via LeRobot |
| Diffusion Policy | Política generativa por difusión de acciones | no disponible en la informacion proporcionada | no aplica | no disponible en la informacion proporcionada | Implementaciones publicas en frameworks de investigación |
| VQ-BeT | Transformer discretizado con codebook de acciones | no disponible en la informacion proporcionada | no aplica | no disponible en la informacion proporcionada | Implementaciones publicas de investigación |
| SmolVLA | VLM + cabeza de acción (vision-language-action) | aprox. 450 M (dato de referencia general, no verificado en esta ficha) | limitado por el backbone VLM | Apache 2.0 | Pesos y pipeline en HuggingFace via LeRobot |

La comparación con Diffusion Policy, VQ-BeT y SmolVLA es cualitativa: son alternativas del mismo ámbito (aprendizaje por imitación para manipulación), pero no se dispone de cifras verificadas de parámetros, contexto o resultados para esta ficha. La ventaja concreta de este ACT es su tamaño reducido y su integración directa con el ecosistema LeRobot; su desventaja es la falta total de métricas publicadas de éxito.

## Limitaciones y advertencias

- Sin resultados de evaluación: no hay tasa de éxito publicada en robot real ni en simulación, por lo que no se puede afirmar que la política funcione de forma fiable.
- Tarea única: solo se ha entrenado para "Pick up the square nut and place it on the square peg". No generaliza a otros objetos, tareas ni entornos.
- Resolución de entrada muy baja: 84x84 píxeles por cámara. Detalles finos, cambios de iluminación o distractores pueden degradar gravemente el comportamiento.
- Ambigüedad de robot: el nombre del repositorio cita `UR5e` y la model card declara `panda`. Verificar la cinemática y los índices de articulaciones antes de desplegar en hardware.
- Sesgos del dataset: los sesgos heredados de las demostraciones de teleoperación (posiciones iniciales, texturas, condiciones de iluminación, sesgo del operador) se reproducen en la política. Es un riesgo conocido en aprendizaje por imitación.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero existe riesgo de acciones fuera de distribución que pueden provocar colisiones o movimientos inseguros en hardware real.
- Sin limitaciones idiomáticas aplicables, salvo que el prompt de tarea está en inglés.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar avisos de licencia y atribución. No se documentan restricciones adicionales del autor.
- Caveat de producción: 120.000 pasos con learning rate 1e-5 puede ser insuficiente para una convergencia completa en ACT; conviene validar el modelo con rollouts propios antes de cualquier uso real.
- Despliegue: el repositorio no documenta exportación a formatos optimizados ni latencias medidas, lo que complica la integración en sistemas de control con requisitos de tiempo real estricto.

## Enlaces

- HuggingFace: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_30_Exec_30_TASK_nut_assembly_square_PIXELS__ID_146343
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_square_ph_image84
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento (imitacion): https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout e inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_square_ph_image84
- Nota sobre la busqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo (los resultados obtenidos trataban de normas ASME, aeronaves Su-34, tallaje de pantalones y derecho urbanistico aleman), por lo que no se han incorporado fuentes externas adicionales.
