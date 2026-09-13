# HyeonseokE/smolvla_close_box_ours_1000_10fps

## Resumen

smolvla_close_box_ours_1000_10fps es una política de imitación (vision-language-action) publicada en Hugging Face por el usuario HyeonseokE, obtenida mediante fine-tuning de `lerobot/smolvla_base` con la librería LeRobot 0.6.0. El modelo resuelve una única tarea de manipulación robótica: cerrar una caja colocando la tapa sobre el cuerpo, empleando un brazo SO-101 follower (`so101_follower`) y señales visuales de varias cámaras. Se trata de un artefacto de investigación muy acotado, no de un modelo de propósito general: no genera texto ni razona, sino que mapea observaciones (estado articular e imágenes) a comandos de acción de 6 dimensiones.

La arquitectura pertenece a la familia SmolVLA, descrita en el paper arXiv:2506.01844, que propone un modelo visión-lenguaje-acción compacto, con coste computacional reducido y desplegable en hardware de consumo. El checkpoint tiene 450.046.176 parámetros (aproximadamente 450 millones) y el repositorio ocupa 0,9 GB, por lo que es viable en GPUs de gama media y en estaciones de trabajo sin aceleradores de datacenter. La licencia es Apache 2.0.

El interés de esta ficha es doble: por un lado, ilustra el flujo de trabajo de fine-tuning de políticas VLA con LeRobot sobre datasets pequeños (100 episodios, 28.246 fotogramas a 10 FPS); por otro, sirve como ejemplo de los riesgos de publicar políticas sin evaluación real en robot, ya que el autor no ha reportado ninguna tasa de éxito. El modelo no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA) de la familia SmolVLA; el desglose interno (encoder visual, backbone de lenguaje, experto de acciones) no se detalla en la información proporcionada |
| Parámetros totales | 450.046.176 (≈450 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; los pesos se distribuyen en safetensors |
| Idiomas soportados | No disponible a nivel de modelo; las instrucciones de tarea del dataset están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 0,9 GB) |
| Tipo de robot | `so101_follower` |
| Cámaras declaradas | `top`, `left_wrist` |
| Dimensión de observación (estado) | `observation.state`: (6,) |
| Entradas visuales | 3 cámaras RGB de (3, 256, 256): `observation.images.camera1`, `camera2`, `camera3` |
| Dimensión de acción | `action`: (6,); `action.radian_urdf0`: (6,) |
| Librería / versión | LeRobot 0.6.0 |
| Modelo base | `lerobot/smolvla_base` |

## Arquitectura y entrenamiento

La model card identifica el modelo como una política SmolVLA, una familia de modelos visión-lenguaje-acción compactos que, según la documentación del autor, alcanza rendimiento competitivo con un coste computacional reducido y puede desplegarse en hardware de consumo. El checkpoint concreto es un fine-tuning de `lerobot/smolvla_base` y se ejecuta a través de LeRobot. La información proporcionada no incluye el detalle de capas, el mecanismo de atención ni el tipo de cabecera de acciones (por ejemplo, flow matching o regresión directa), por lo que esos extremos quedan como no disponibles; el paper referenciado (arXiv:2506.01844) es la fuente indicada para la descripción arquitectónica.

El entrenamiento es de imitación supervisada sobre el dataset `HyeonseokE/close_box_ours_10fps`: 100 episodios, 28.246 fotogramas capturados a 10 FPS y una única tarea, "Close the box by placing the lid on the box body". La configuración declarada es de 22.050 pasos, batch de 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. No se menciona el uso de RLHF, DPO ni ningún otro ajuste por preferencias, lo cual es coherente con una política de robótica basada en comportamiento clonado. Tampoco se documentan técnicas de aumento de datos, curriculum ni mezcla con datasets externos.

## Capacidades

- Control de manipulación robótica de 6 grados de libertad sobre un brazo SO-101 follower, emitiendo acciones articulares de dimensión 6 (`action` y `action.radian_urdf0`).
- Política condicionada por lenguaje: acepta una instrucción textual de tarea ("Close the box by placing the lid on the box body") que guía la ejecución.
- Fusión de percepción visual y estado proprioceptivo: consume tres flujos de imagen RGB de 256x256 píxeles junto con el vector de estado articular de 6 componentes.
- Ejecución de una tarea de manipulación específica: colocar la tapa sobre el cuerpo de la caja hasta cerrarla.
- Despliegue en hardware de consumo, según la descripción de la familia SmolVLA.
- Inferencia en bucle cerrado mediante `lerobot-rollout`, con control de duración de la ejecución.
- No dispone de generación de texto, razonamiento simbólico, tool calling, function calling ni capacidades de agente multi-paso: es una política de acción, no un modelo conversacional.
- No se documentan capacidades multilingües ni soporte de audio u otras modalidades distintas de RGB y estado.

## Casos de uso

- Automatización de cierre de cajas en una célula de envasado: el modelo ejecuta la secuencia de colocar la tapa sobre el cuerpo de la caja a 10 FPS, siempre que el robot, las cámaras y la iluminación coincidan con los del dataset de entrenamiento.
- Reproducción de experimentos de imitación con LeRobot: sirve como checkpoint de referencia para replicar el pipeline de fine-tuning sobre `lerobot/smolvla_base` con 22.050 pasos, batch 64 y AdamW a 1e-4.
- Estudio del efecto de la frecuencia de captura: el dataset se grabó a 10 FPS, de modo que este checkpoint permite comparar el rendimiento frente a políticas entrenadas con datos a 30 FPS sobre la misma tarea.
- Punto de partida para fine-tuning con datos propios: el comando `lerobot-train` documentado permite reentrenar la política sobre nuevos datasets manteniendo el mismo formato de observaciones y acciones.
- Docencia y formación en robótica con SO-101: el modelo ilustra de forma completa el ciclo de vida de una política (grabación de datos, entrenamiento, rollout y publicación en el Hub) con un coste de cómputo bajo.
- Evaluación comparativa de checkpoints: al conocer la semilla (1000) y la configuración exacta de entrenamiento, es reproducible en estudios de robustez frente a cambios de posición de objetos, iluminación o presencia de distractores.
- Pruebas de integración de LeRobot en pipelines propios: sirve para validar el comando `lerobot-rollout`, la coincidencia de nombres de cámara con las claves de observación y la latencia del bucle de control en una máquina concreta.
- Prototipado de estaciones de robot de bajo coste: al ser una política de 450 M de parámetros, puede ejecutarse en una GPU de gama media o incluso en CPU para pruebas de integración no críticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la línea "No evaluation results have been provided for this policy yet", sin tabla de ensayos, éxitos ni tasa de éxito en robot real. Tampoco se reportan métricas de error de acción, latencia de inferencia ni comparaciones con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 M de parámetros, los pesos en bf16/fp16 ocupan aproximadamente 0,9 GB (coincide con el tamaño del repositorio); en fp32 serían unos 1,8 GB. Hay que sumar activaciones, búferes de las tres cámaras de 256x256 y el estado del bucle de control.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM, como RTX 3060, RTX 4060, RTX 4070 o RTX 4090. No requiere A100 ni H100.
- Compatibilidad con GPU de consumo: sí, es uno de los puntos declarados de la familia SmolVLA; cabe holgadamente en tarjetas de gama media.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=HyeonseokE/smolvla_close_box_ours_1000_10fps` y `--strategy.type=base`; entrenamiento con `lerobot-train` y `--policy.path=lerobot/smolvla_base`. Se requiere PyTorch con CUDA (`--policy.device=cuda`), aunque la model card no detalla si existe ruta de CPU.
- Frameworks no aplicables: vLLM, llama.cpp, Ollama o TGI están orientados a modelos de lenguaje y no se documentan para esta política.
- Hardware físico necesario: brazo SO-101 follower, sus cámaras USB (se ejecutan a 640x480 y 30 FPS en el ejemplo de la model card) y el puerto serie correspondiente.
- Latencia y throughput: no disponibles. No se publican medidas de tiempo por inferencia ni de frecuencia efectiva de control en el robot.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `HyeonseokE/smolvla_close_box_ours_1000_10fps` | 450.046.176 | No disponible | Sin evaluación publicada | Apache 2.0 | Hugging Face; 0 descargas, 0 likes |
| `lerobot/smolvla_base` (modelo base) | No disponible en la información proporcionada | No disponible | No disponible | No disponible en la información proporcionada | Hugging Face |
| Otras políticas VLA de código abierto (OpenVLA, π0, ACT, entre otras) | No disponible en la información proporcionada | No disponible | No disponible | No disponible en la información proporcionada | No disponible |

La información proporcionada no permite establecer comparaciones cuantitativas con alternativas de la misma categoría. Cualquier comparación de tasas de éxito exigiría ejecutar los modelos en el mismo robot, con la misma tarea y las mismas condiciones de iluminación y posicionamiento.

## Limitaciones y advertencias

- Especialización extrema: entrenada sobre una única tarea y 100 episodios; no se espera generalización a otras tareas, objetos ni disposiciones.
- Ausencia total de evaluación: no hay tasa de éxito, ni número de ensayos, ni análisis de fallos. No debe asumirse que la política funciona en producción.
- Sin validación por la comunidad: 0 descargas y 0 likes en el momento de redactar la ficha.
- Sensibilidad al entorno: cambios de iluminación, posición inicial de la caja, textura de la superficie, distractores o sustitución de cámaras pueden degradar el comportamiento de forma no cuantificada.
- Dependencia estricta del hardware: el robot debe ser `so101_follower` y los nombres de las cámaras deben coincidir con las claves de observación del entrenamiento. La model card menciona las cámaras `top` y `left_wrist`, mientras que la tabla de entradas lista `observation.images.camera1`, `camera2` y `camera3`; esta discrepancia debe resolverse antes del despliegue.
- Sin capacidades de lenguaje: el texto de tarea es una condición de la política, no una interfaz conversacional. No hay diálogo, razonamiento ni explicación de decisiones.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: al ser una política de imitación, puede generar trayectorias que parezcan correctas y fallen al cerrar la caja, sin señal de confianza asociada.
- Frecuencia de control limitada: los datos se capturaron a 10 FPS, lo que puede implicar una respuesta más lenta que políticas entrenadas a 30 FPS en tareas que requieran corrección rápida.
- Licencia Apache 2.0: permite uso comercial del checkpoint, pero no cubre los derechos sobre el dataset de entrenamiento ni sobre el hardware; conviene revisar las condiciones de `HyeonseokE/close_box_ours_10fps` y del modelo base.
- Uso en robot real: requiere parada de emergencia, límites de par y supervisión humana, dado que no existe evaluación de seguridad.
- Reproducibilidad: la semilla (1000) y la configuración están documentadas, pero no se especifican la versión exacta de PyTorch, CUDA ni el hardware de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_close_box_ours_1000_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/close_box_ours_10fps
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/close_box_ours_10fps
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre SmolVLA; los enlaces listados proceden de la model card y del repositorio de Hugging Face.
