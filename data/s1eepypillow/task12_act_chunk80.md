# s1eepypillow/task12_act_chunk80

## Resumen

`task12_act_chunk80` es una política de aprendizaje por imitación para robótica basada en el método Action Chunking with Transformers (ACT), publicada por el usuario s1eepypillow en Hugging Face mediante la librería LeRobot de Hugging Face. En lugar de predecir una única acción por paso de control, el modelo predice secuencias cortas de acciones (chunks), lo que reduce el error de composición y suele elevar la tasa de éxito en tareas de manipulación aprendidas a partir de demostraciones teleoperadas. El repositorio tiene 51.649.670 parámetros (0,2 GB) y se distribuye en formato safetensors bajo licencia Apache 2.0.

La política está entrenada específicamente para un robot de tipo `so_follower` (familia de brazos abiertos compatibles con LeRobot) equipado con dos cámaras: `top` y `wrist`. Consume como observaciones el estado articular de 6 dimensiones, dos imágenes RGB de 3x480x640 píxeles y un estado de entorno de 1 dimensión, y produce un vector de acción de 6 dimensiones. El entrenamiento se realizó sobre el dataset `s1eepypillow/grad_block_merged_task12_v2`, con 600 episodios, 684.130 fotogramas a 30 FPS y dos tareas etiquetadas como "task1" y "task2", durante 100.000 pasos con AdamW y tasa de aprendizaje 1e-5.

Se trata de un modelo de nicho, con 0 descargas y 0 likes en el momento de la consulta, sin resultados de evaluación publicados. Su relevancia es acotada: sirve como ejemplo reproducible de entrenamiento ACT con LeRobot 0.6.1 y como punto de partida para hacer fine-tuning sobre brazos de bajo coste, más que como política lista para producción. El sufijo `chunk80` del nombre sugiere un tamaño de chunk de 80 acciones, aunque la model card no confirma explícitamente ese valor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con Action Chunking (ACT); codificadores para estado, dos cámaras y estado de entorno, y decodificador de acciones. Detalle de capas no disponible |
| Parámetros totales | 51.649.670 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje. Consume una observación por paso (estado `(6,)`, dos imágenes `(3, 480, 640)`, entorno `(1,)`) y emite acciones `(6,)` |
| Tipos de cuantización | No disponible (pesos safetensors; no se publican cuantizaciones) |
| Idiomas soportados | No disponible (modelo robótico; no procesa lenguaje natural, solo identificadores de tarea como "task1"/"task2") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` |
| Cámaras | `top`, `wrist` (480x640, 30 FPS) |
| Entradas | `observation.state` (6,), `observation.images.top` (3, 480, 640), `observation.images.wrist` (3, 480, 640), `observation.environment_state` (1,) |
| Salidas | `action` (6,) |
| Tamaño del repositorio | 0,2 GB |
| Dataset de entrenamiento | `s1eepypillow/grad_block_merged_task12_v2` (600 episodios, 684.130 fotogramas, 30 FPS) |

## Arquitectura y entrenamiento

El modelo implementa ACT, un método de aprendizaje por imitación presentado en el artículo arXiv:2304.13705. La arquitectura es un transformer que codifica de forma conjunta el estado propioceptivo y las observaciones visuales, y que decodifica un chunk de acciones futuras en lugar de un único paso. Este diseño mitiga el problema de la varianza en la predicción paso a paso y permite ejecutar movimientos más suaves y coherentes con la demostración. La model card indica que el modelo se entrenó y publicó con LeRobot, pero no detalla el número de capas, cabezas de atención ni el tipo de codificador visual empleado, por lo que esos datos figuran como no disponibles.

El entrenamiento se realizó sobre 600 episodios teleoperados (684.130 fotogramas a 30 FPS) que cubren las tareas "task1" y "task2" del dataset `grad_block_merged_task12_v2`. La configuración reportada es de 100.000 pasos, batch de 64, optimizador AdamW, tasa de aprendizaje 1e-5, semilla 1000 y LeRobot 0.6.1. No se indica en la información disponible si hubo fases de RLHF, DPO, aumento de datos o decodificación especulativa; tampoco se documenta la composición exacta del dataset más allá del número de episodios y fotogramas.

## Capacidades

- Generación de secuencias de acciones de 6 grados de libertad para un brazo `so_follower`, con predicción por chunks.
- Control guiado por visión: utiliza dos cámaras simultáneas (`top` y `wrist`) a 480x640 y 30 FPS.
- Fusión de estado propioceptivo (posición/estado articular de 6 dimensiones) con señal visual y una variable adicional de entorno.
- Ejecución de al menos dos tareas diferenciadas, invocables mediante las etiquetas "task1" y "task2".
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin recompensa explícita.
- Despliegue directo en bucle cerrado sobre hardware real mediante `lerobot-rollout`.
- Capacidad de servir como base para fine-tuning con `lerobot-train` sobre datasets propios.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, procesamiento de lenguaje natural ni capacidades de audio o vídeo generativo.

## Casos de uso

- Manipulación de bloques sobre superficie plana: el modelo está entrenado con tareas de tipo "grad_block" y puede recoger y colocar piezas con un brazo `so_follower`, usando la cámara `wrist` para el ajuste fino y la `top` para la localización global.
- Automatización de pick-and-place en laboratorio o línea de montaje ligera: con 30 FPS y chunking de acciones, la política mantiene trayectorias continuas en tareas repetitivas de corta duración.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible de un entrenamiento ACT completo (100.000 pasos, batch 64, AdamW) con LeRobot 0.6.1 para comparar variantes de hiperparámetros.
- Base para fine-tuning con datos propios: al ser un checkpoint pequeño (51,6 M de parámetros, 0,2 GB) se puede reentrenar sobre un dataset nuevo con `lerobot-train` en una sola GPU, incluso de gama media.
- Evaluación comparativa de políticas: útil para contrastar ACT frente a políticas de difusión u otras alternativas sobre un mismo banco de tareas y hardware.
- Despliegue en flotas de brazos de bajo coste: al caber en GPUs consumer e incluso en CPU, permite replicar la política en varios puestos de trabajo sin infraestructura de servidor dedicada.
- Demostraciones y docencia en robótica: el flujo `lerobot-rollout` con `--strategy.type=base` permite ejecutar la política en vivo durante sesiones de formación, sin grabación de episodios.
- Recogida de datos asistida: combinado con el pipeline de LeRobot, sirve de punto de partida para ampliar el dataset con nuevas tareas y reentrenar el mismo esquema ACT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía, con la indicación explícita de que todavía no se han proporcionado resultados en robot real (ni número de ensayos, ni éxitos, ni tasa de éxito). Tampoco hay métricas de pérdida de validación, éxito por tarea ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en fp32 para los pesos (51,6 M de parámetros); el consumo real será algo mayor por los búferes de las dos cámaras a 480x640x3 y las activaciones intermedias.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM es suficiente, incluidas RTX 3060, RTX 4070, RTX 4090, A100 o H100; no se requiere acelerador de gama alta.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en GPUs integradas con suficiente memoria compartida.
- Ejecución en CPU: viable en términos de memoria, aunque el rendimiento en tiempo real a 30 FPS depende del equipo y no está documentado.
- Opciones de despliegue: `lerobot-rollout` (inferencia en robot real) y `lerobot-train` (entrenamiento y fine-tuning), ambos de la librería LeRobot; el modelo no está pensado para vLLM, TGI, llama.cpp ni Ollama, que son servidores de modelos de lenguaje.
- Hardware robótico asociado: robot `so_follower` con dos cámaras configuradas como `top` y `wrist` a 640x480 y 30 FPS.
- Latencia y throughput: no disponibles. No se publican tiempos de inferencia, frecuencia efectiva de control ni número de acciones ejecutadas por segundo en hardware concreto.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `s1eepypillow/task12_act_chunk80` (este modelo) | ACT (imitación, chunking de acciones) | 51.649.670 | No aplica | Apache 2.0 | Hugging Face, librería LeRobot |
| ACT original (arXiv:2304.13705) | ACT (imitación, chunking de acciones) | No disponible | No aplica | No disponible | Paper y repositorio de referencia; el método, no un checkpoint concreto |
| Diffusion Policy | Política de imitación basada en modelos de difusión | No disponible | No aplica | No disponible | No disponible |
| SmolVLA | Política visión-lenguaje-acción | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos cuantitativos de rendimiento de este checkpoint que permitan una comparación numérica fiable con las alternativas. La comparación anterior es únicamente de categoría: ACT, Diffusion Policy y SmolVLA son enfoques de política robótica entrenables con LeRobot, pero no se han proporcionado parámetros, contextos ni licencias de esas alternativas en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse con demostraciones teleoperadas de un operador concreto, la política puede heredar sesgos de trayectoria, de posicionamiento de objetos y de iluminación propios de la recogida de datos.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de generalización incorrecta fuera de la distribución del dataset, con acciones incoherentes o inseguras ante objetos, posiciones o iluminación no vistas.
- Limitaciones de contexto: no es un modelo de lenguaje; no procesa texto libre ni instrucciones en lenguaje natural. Las tareas se limitan a las etiquetas "task1" y "task2" definidas durante el entrenamiento.
- Limitaciones de idioma: no disponibles, porque el modelo no tiene capacidades multilingües.
- Dependencia del hardware: la política espera exactamente las claves de observación `observation.state`, `observation.images.top`, `observation.images.wrist` y `observation.environment_state`; si los nombres, resoluciones o cámaras no coinciden, la inferencia fallará o degradará.
- Ausencia de evaluación: no hay resultados en robot real, por lo que no se puede afirmar ninguna tasa de éxito ni garantizar un comportamiento seguro.
- Datos incompletos: se desconoce el número de capas, el codificador visual, el tamaño real del chunk y la composición detallada del dataset.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero al tratarse de una política robótica entrenada con datos propios del autor, conviene revisar la licencia del dataset asociado antes de reutilizarlo en producción.
- Advertencia de seguridad: cualquier despliegue sobre hardware físico debe hacerse con límites de par, paradas de emergencia y supervisión humana, dado que no existe documentación de seguridad ni de comportamiento ante fallos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/s1eepypillow/task12_act_chunk80
- Dataset de entrenamiento: https://huggingface.co/datasets/s1eepypillow/grad_block_merged_task12_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=s1eepypillow/grad_block_merged_task12_v2
- Artículo de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de imitación (grabar datos y entrenar): https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: los resultados de la búsqueda web proporcionados no guardan relación con este modelo (tratan sobre palabras del castellano con las cinco vocales), por lo que no se ha incorporado ningún enlace de esas fuentes.
