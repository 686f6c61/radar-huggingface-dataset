# JCY2515/act_bimanual_so101_towel

## Resumen

act_bimanual_so101_towel es una política de imitación basada en Action Chunking with Transformers (ACT), entrenada por el usuario JCY2515 y publicada en HuggingFace Hub mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado articular de un robot bimanual SO-101 (12 dimensiones) junto con dos cámaras de muñeca (480x640 RGB cada una) y emite directamente una acción de 12 dimensiones. Su única tarea entrenada es "fold the towel" (doblar una toalla).

El modelo tiene 51.680.908 parámetros (unos 51,7 millones) almacenados en formato safetensors, con un repositorio de 1,2 GB. Resuelve el problema clásico de la manipulación fina bimanual con hardware de bajo coste: en lugar de predecir una acción por paso, ACT predice chunks de acciones, lo que reduce el error de composición y mejora la estabilidad temporal en tareas de contacto prolongado como doblar tela.

Su relevancia actual es doble: por un lado sirve como referencia reproducible de ACT sobre la plataforma SO-101 de LeRobot; por otro, es un ejemplo de política entrenada con datos teleoperados escasos (30 episodios, 19.099 frames a 30 FPS). La model card no reporta ninguna evaluación en robot real, por lo que su rendimiento efectivo no está verificado públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer encoder-decoder con encoder variacional (CVAE) y backbones visuales ResNet |
| Parametros totales | 51.680.908 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa una observación por inferencia y predice un chunk de acciones) |
| Tipos de cuantizacion | no disponible (se publican pesos safetensors sin versiones cuantizadas) |
| Idiomas soportados | no disponible (la entrada textual se limita a la cadena de tarea, por ejemplo "fold the towel") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, con configuración de LeRobot (JSON de política, normalización y dataset) |
| Tipo de robot | bi_so_follower (SO-101 bimanual) |
| Camaras | left_left_wrist, right_right_wrist |
| Entradas | observation.state (12,), observation.images.left_left_wrist (3, 480, 640), observation.images.right_right_wrist (3, 480, 640) |
| Salidas | action (12,) |
| Tamano del repositorio | 1,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705 (Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware). Su diseño combina tres piezas: un encoder variacional de estilo CVAE que comprime la secuencia de observaciones en un espacio latente, un transformer encoder que fusiona las características visuales (extraídas por redes convolucionales tipo ResNet-18) con el estado propioceptivo, y un transformer decoder que genera el chunk completo de acciones de una sola pasada. El chunking reduce el horizonte efectivo de decisión y mitiga la acumulación de errores típica de las políticas paso a paso; en el paper original se complementa con ensamblado temporal (temporal ensembling) para suavizar las transiciones entre chunks.

El entrenamiento se realizó con LeRobot 0.6.1 durante 10.000 pasos, con batch size 32, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. El dataset es JCY2515/bimanual_so101_towel_clean, compuesto por 30 episodios teleoperados, 19.099 frames a 30 FPS, todos etiquetados con la tarea "fold the towel". No se documenta en la model card el número de tokens o frames vistos, la composición exacta del dataset (variaciones de posición, iluminación o distractores) ni si se aplicó algún tipo de refinamiento posterior al entrenamiento supervisado. El tamaño del chunk de acciones tampoco se especifica.

## Capacidades

- Control visomotor bimanual: genera comandos de 12 grados de libertad a partir del estado articular y de dos vistas de muñeca.
- Ejecución de la tarea "fold the towel" en el robot bi_so_follower, tal y como se define en el dataset de entrenamiento.
- Generación de chunks de acciones, lo que permite inferencia a frecuencia menor que la de control sin degradar necesariamente la suavidad del movimiento.
- Integración con el ecosistema LeRobot: se ejecuta mediante `lerobot-rollout`, admite `--duration` y estrategias de grabación de episodios.
- Reentrenamiento y fine-tuning: la model card documenta el flujo `lerobot-train` para reentrenar con otro dataset.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de capacidades de razonamiento simbólico, generación de texto, código ni matemáticas.
- No dispone de visión general: las dos cámaras se usan exclusivamente como entrada de control.
- No dispone de capacidades multilingües más allá de la etiqueta de tarea.

## Casos de uso

- Reproducción de la tarea de doblado de toallas: desplegar la política con `lerobot-rollout` sobre un SO-101 bimanual equipado con las dos cámaras de muñeca para replicar la tarea exacta con la que fue entrenada.
- Punto de partida para fine-tuning en manipulación de tela: usar los 51,7 M de parámetros como inicialización y reentrenar con un dataset propio de tareas similares (doblar camisetas, colocar servilletas) aprovechando que ya ha aprendido dinámicas bimanuales de contacto.
- Investigación en aprendizaje por imitación: servir como baseline ACT reproducible para comparar contra Diffusion Policy u otras políticas de LeRobot con el mismo dataset y la misma configuración de hardware.
- Validación de hardware SO-101: comprobar la calibración de brazos y cámaras verificando si la política reproduce movimientos coherentes; una ejecución errática suele indicar descalibración o nombres de cámara mal mapeados.
- Docencia y divulgación en robótica: ejemplo completo y de bajo coste del ciclo teleoperación, grabación de dataset, entrenamiento y despliegue, con 30 episodios y 19.099 frames como escala manejable.
- Recolección de datos aumentada: ejecutar la política para generar episodios adicionales que luego se corrigen manualmente, ampliando el dataset con estados poco representados.
- Pruebas de pipeline de despliegue: validar la integración de LeRobot con el hardware y el sistema operativo antes de escalar a políticas más grandes como SmolVLA.
- Benchmark interno de latencia: medir el coste de inferencia de una política de 51,7 M de parámetros con dos flujos de imagen a 480x640 antes de decidir si se necesita una GPU dedicada en el robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La sección de evaluación de la model card indica explícitamente que todavía no se han proporcionado resultados en robot real (ni tasa de éxito, ni número de ensayos, ni condiciones de prueba). No se dispone tampoco de métricas de pérdida de entrenamiento ni de curvas de aprendizaje.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 210 MB para los pesos en FP32 (51,68 M de parámetros), más el coste de activaciones de dos imágenes a 480x640 y los backbones convolucionales; en la práctica cabría en menos de 2 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente. No se requiere A100 ni H100; una RTX 3060, RTX 4090 o incluso una GPU integrada moderna cubrirían la inferencia.
- Ejecución en CPU: viable, ya que el modelo no usa decodificación autorregresiva; el cuello de botella es el preprocesado de imagen y la frecuencia de control, no el número de parámetros.
- Apple Silicon: LeRobot admite el backend MPS, por lo que un Mac con chip M-series puede ejecutar la política.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`) sobre PyTorch. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que la salida es un vector de acciones continuas y no texto.
- Latencia y throughput: no disponible. La model card no publica tiempos de inferencia ni el tamaño del chunk, aunque la frecuencia de los datos de entrenamiento es de 30 FPS.
- Almacenamiento: el repositorio ocupa 1,2 GB, muy por encima de lo que ocupan los pesos, lo que sugiere que incluye checkpoints adicionales o artefactos de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_bimanual_so101_towel (este) | 51,68 M | ACT (transformer + CVAE) | chunk de acciones, tamano no especificado | apache-2.0 | HuggingFace, 0 descargas |
| Diffusion Policy (referencia LeRobot) | no disponible | política generativa por difusión | horizonte de predicción configurable | no disponible | implementación en LeRobot |
| SmolVLA | no disponible en la informacion proporcionada | VLA (vision-language-action) | no disponible | no disponible | implementación en LeRobot |
| ACT de referencia (paper 2304.13705) | no disponible | ACT | chunking con temporal ensembling | no disponible | paper y código público |

La comparación cuantitativa no es posible con la información disponible: no hay resultados de éxito publicados para esta política ni datos de rendimiento de las alternativas en el mismo dataset. La diferencia principal es de escala y propósito: ACT es una política ligera y específica de tarea, mientras que SmolVLA y otros modelos VLA incorporan instrucciones en lenguaje natural y generalización a múltiples tareas a cambio de un mayor coste computacional.

## Limitaciones y advertencias

- Cero evaluaciones publicadas: la model card no reporta tasa de éxito, número de ensayos ni condiciones de prueba en robot real. No hay evidencia de que la política funcione fuera del entorno de grabación.
- Dataset muy reducido: 30 episodios y 19.099 frames para una única tarea. La generalización a posiciones, iluminación o texturas distintas es probablemente muy limitada.
- Sobreajuste al entorno de captura: cualquier cambio en la disposición de las cámaras, la calibración del robot o el fondo puede degradar drásticamente el comportamiento.
- Ausencia de ensamblado temporal documentado: el paper original usa temporal ensembling, pero la model card no confirma que la inferencia de esta política lo aplique.
- Riesgo de alucinación trasladado al dominio físico: en robótica, una predicción incorrecta se traduce en movimientos inseguros. Es imprescindible un botón de parada de emergencia y límites de par en las articulaciones.
- Dependencia de nombres de cámara exactos: la política espera las claves `left_left_wrist` y `right_right_wrist`; un mapeo distinto provoca fallos silenciosos o movimientos sin sentido.
- Sesgos: no documentados. Al ser un modelo entrenado con teleoperación de un único operador, heredará sus sesgos de estilo de movimiento y sus tiempos de reacción.
- Licencia apache-2.0: permite uso comercial, modificación y redistribución, con obligación de conservar el aviso de licencia y el archivo de cambios. El autor no ofrece garantías.
- Idiomas: sin capacidades lingüísticas; el campo de idiomas no está disponible porque no aplica.
- Escasa tracción: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones públicas que permitan validar el artefacto.
- Fecha de publicación inusual en los metadatos del repositorio (2026-10-12), lo que conviene verificar antes de citarlo como referencia temporal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JCY2515/act_bimanual_so101_towel
- Dataset de entrenamiento: https://huggingface.co/datasets/JCY2515/bimanual_so101_towel_clean
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=JCY2515/bimanual_so101_towel_clean
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
