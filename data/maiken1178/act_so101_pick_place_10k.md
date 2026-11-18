# Maiken1178/act_so101_pick_place_10k

## Resumen

`act_so101_pick_place_10k` es una política de imitación entrenada con el método Action Chunking with Transformers (ACT) sobre el robot SO-101 (`so_follower`) con una única cámara de muñeca. El modelo, publicado por el usuario Maiken1178 en Hugging Face bajo la librería LeRobot, resuelve una tarea concreta de manipulación: coger un bloque y depositarlo en un cuenco. No es un modelo de lenguaje ni un modelo fundacional generalista: es un controlador visuomotor que mapea el estado articular del robot y una imagen RGB de 480x640 a un vector de acción de 6 dimensiones.

La relevancia de esta ficha es doble. Por un lado, ejemplifica el flujo completo de LeRobot para entrenar políticas de imitación de extremo a extremo con hardware de bajo coste (SO-101). Por otro, permite evaluar con rigor qué supone un modelo de este tipo: 51.668.614 parámetros, un dataset de tan solo 30 episodios y 10.269 fotogramas a 30 FPS, y 10.000 pasos de entrenamiento con batch size 8. El resultado es una política especializada, frágil fuera de su distribución de entrenamiento y sin evaluación publicada.

Arquitectónicamente sigue el diseño ACT del paper de Zhao et al. (2023): un transformer que predice *chunks* de acciones (secuencias cortas de comandos) en lugar de pasos individuales, lo que reduce el error de acumulación y estabiliza el control. El modelo está pensado para ejecutarse en tiempo real sobre el robot físico, no para servir inferencia en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación definida por el chunk de acciones, no por contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantización para esta política) |
| Idiomas soportados | no aplica (modelo robótico; la instrucción de tarea es una cadena de texto fija: "Pick up the block and place it in the bowl") |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone visual (codificador de imágenes) con un transformer encoder-decoder que predice un *chunk* de acciones futuras en cada paso de inferencia. La entrada del modelo son dos features: `observation.state`, un vector de 6 dimensiones con el estado articular del SO-101, y `observation.images.wrist`, una imagen RGB de forma `(3, 480, 640)` procedente de la cámara de muñeca. La salida es `action`, un vector de 6 dimensiones. La predicción por chunks mitiga el problema de *compounding error* típico de las políticas que predicen acción a acción.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `Maiken1178/so101_pick_place_20261025_200126`: 30 episodios, 10.269 fotogramas a 30 FPS, una única tarea ("Pick up the block and place it in the bowl"). La configuración fue de 10.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta composición del dataset más allá del número de episodios, ni augmentaciones, ni fases de RLHF/DPO (no aplicables en imitación supervisada). Tampoco se especifica el backbone visual concreto ni la dimensión del chunk de acciones.

## Capacidades

- Control visuomotor de manipulación: mapea imagen de muñeca y estado articular a comandos de 6 grados de libertad para el SO-101.
- Ejecución de una tarea concreta de pick-and-place: coger un bloque y colocarlo en un cuenco.
- Predicción de chunks de acción, lo que aporta suavidad y reduce la acumulación de error en comparación con políticas paso a paso.
- Operación en tiempo real a 30 FPS, coherente con la frecuencia de captura del dataset de entrenamiento.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni capacidades multilingües: es una política de control, no un modelo generativo de texto.
- No dispone de modo *thinking*, visión general, audio ni otras capacidades fundacionales.

## Casos de uso

- Automatización de pick-and-place en laboratorio: ejecutar de forma repetible la secuencia de coger un bloque y soltarlo en un cuenco sobre una mesa de trabajo, usando `lerobot-rollout` con `--duration` para acotar la sesión.
- Base para *fine-tuning* en tareas similares: partir de estos pesos y reentrenar con un dataset propio de otra variante de pick-and-place, aprovechando que ACT converge con pocos episodios (30 en este caso).
- Docencia y formación en robótica de imitación: usar el modelo como ejemplo reproducible del pipeline completo de LeRobot, desde la teleoperación hasta el despliegue.
- Benchmark interno de hardware SO-101: medir latencia de inferencia y estabilidad del control en una configuración concreta de cámara de muñeca.
- Prototipado rápido de demos: al ser un repo de 0,2 GB, se puede clonar y desplegar en un equipo con GPU modesta para validar el flujo antes de invertir en datasets mayores.
- Estudio de robustez y distribución: emplear la política para analizar cómo degrada su éxito ante cambios de iluminación, posición de objetos o distracciones, dado que no hay evaluación publicada.
- Referencia para comparar variantes de ACT: servir de baseline frente a políticas entrenadas con más episodios o con cámaras adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota literal: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de métricas de error de acción, ni de comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51,7 M de parámetros y pesa 0,2 GB en safetensors; en fp32 ocupa aproximadamente 0,21 GB de pesos, por lo que la VRAM dominante será la del backbone visual y los buffers de activación. En la práctica, menos de 2 GB de VRAM deberían ser suficientes, aunque no se documenta una cifra oficial.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es válida; una RTX 3060, RTX 4060 o superior ofrece margen sobrado. Para entrenamiento con batch size 8, una RTX 4090 o A100 acelera los 10.000 pasos, pero no son necesarias.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo con al menos 4 GB de VRAM; también es plausible su ejecución en CPU para demos, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es la vía documentada. No se indica soporte oficial de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La política está entrenada sobre datos a 30 FPS, lo que sugiere que el bucle de control debe sostener esa frecuencia, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / chunk | Licencia | Evaluacion publicada |
|---|---|---|---|---|---|
| `Maiken1178/act_so101_pick_place_10k` | 51,7 M | ACT sobre SO-101 | chunk de acciones (no especificado) | no disponible | no |
| Políticas ACT de referencia en LeRobot | variable | ACT | chunk configurable | según repo | en algunos casos |
| Políticas Diffusion Policy | variable | difusión de acciones | horizonte configurable | según repo | en algunos casos |
| Políticas VQ-BeT | variable | transformer discretizado | variable | según repo | en algunos casos |

No se dispone de datos numéricos para comparar rendimiento entre estas alternativas en la información proporcionada. La comparación se limita a categoría (aprendizaje por imitación para manipulación) y a parámetros cuando están disponibles.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito publicadas, por lo que no se puede afirmar que la política funcione de forma fiable ni siquiera en su tarea de entrenamiento.
- Dataset muy reducido: 30 episodios y 10.269 fotogramas son insuficientes para generalizar; es esperable un sobreajuste a posiciones, iluminación y objetos concretos.
- Dependencia de una única cámara de muñeca: sin vista global, la política puede fallar ante oclusiones o cambios en la escena no representados en los datos.
- Licencia no especificada: no se puede garantizar el uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Tarea única y cadena de instrucción fija: el modelo no es reutilizable como política general; cualquier cambio de tarea requiere reentrenamiento.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: al ser una política de imitación, puede ejecutar movimientos que parecen razonables pero que no completan la tarea, sin señal de error explícita.
- Sin información sobre sesgos: no se documentan sesgos de dataset, pero al proceder de teleoperación humana pueden heredarse sesgos de estilo de manipulación del operador.
- Sin datos de latencia ni de throughput: no se puede garantizar el cumplimiento de los 30 FPS en hardware concreto sin medirlo.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni issues reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maiken1178/act_so101_pick_place_10k
- Dataset de entrenamiento: https://huggingface.co/datasets/Maiken1178/so101_pick_place_20261025_200126
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Maiken1178/so101_pick_place_20261025_200126
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
