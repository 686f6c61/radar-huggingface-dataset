# RoboCrafty/act_real_parol6_pull_container_pick_place_yellow_and_blue_cube

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación robótica. Este repositorio concreto contiene una política ACT entrenada con LeRobot sobre el robot `my_parol6` para una tarea específica de pick-and-place: arrastrar un contenedor al centro, colocar un cubo amarillo y otro azul dentro y cerrar la tapa.

El modelo consume el estado articular (7 dimensiones) y tres cámaras (`gripper_cam`, `topdown_cam`, `isometric_cam`) y produce un vector de acción de 7 dimensiones. Con 51,67 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto pensado para inferencia en tiempo real a 30 FPS sobre hardware modesto, no para despliegue en la nube a gran escala.

Su relevancia radica en que ejemplifica el flujo actual de robótica open source con LeRobot: datasets teleoperados pequeños (44 episodios, 57.467 frames), entrenamiento reproducible con hiperparámetros documentados y una licencia Apache 2.0 que permite uso comercial sin fricción. Es una política de nicho, no un modelo fundacional generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; no gestiona contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La política sigue la formulación ACT del paper 2304.13705: un transformer que, a partir de observaciones multimodales (estado articular de 7 dimensiones y tres flujos de imagen RGB de 480x640, 360x640 y 480x640), predice un chunk de acciones futuras en lugar de una acción única. Este enfoque de *action chunking* mitiga el problema de compounding error típico de las políticas paso a paso y permite movimientos más suaves y coherentes temporalmente.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `RoboCrafty/parol6_pull_container_pick_place_yellow_and_blue_cube`, compuesto por 44 episodios y 57.467 frames grabados a 30 FPS mediante teleoperación. La configuración documentada incluye 10.000 pasos de entrenamiento, batch size de 128, optimizador AdamW con learning rate 1e-5 y semilla 1000. No se especifica en la información disponible si hubo aumento de datos, regularización adicional ni fases de RLHF/DPO (no aplicables en este paradigma de imitación).

## Capacidades

- Generación de acciones de control robótico de 7 dimensiones (típicamente 6 articulaciones más gripper) a partir de observaciones visuales y propioceptivas.
- Predicción de chunks de acción que permiten ejecución fluida a 30 FPS.
- Fusión multimodal de tres cámaras con perspectivas complementarias (gripper, cenital e isométrica).
- Ejecución de una tarea compuesta de manipulación: arrastre de contenedor, colocación de dos cubos y cierre de tapa.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico ni capacidades multilingües.
- No dispone de modo *thinking*, visión general, audio ni generación de texto.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: la política puede ejecutar la secuencia completa de arrastrar contenedor, insertar dos cubos y cerrar tapa sobre un robot Parol6, reduciendo la programación manual de trayectorias.
- Base para *fine-tuning* en tareas similares: al estar entrenada con LeRobot y licencia Apache 2.0, sirve como punto de partida para reentrenar con nuevos datasets de manipulación sobre el mismo robot.
- Investigación en aprendizaje por imitación: permite reproducir el pipeline completo (dataset, hiperparámetros, rollout) y comparar variantes de ACT con cambios controlados.
- Prototipado rápido de células robóticas: con 51,67 M de parámetros y 0,2 GB de pesos, se puede desplegar en un PC con GPU de gama media junto al robot para validar viabilidad antes de invertir en soluciones industriales.
- Docencia y formación en robótica: el repositorio incluye comandos `lerobot-rollout` y `lerobot-train` que facilitan demostraciones reproducibles en laboratorio.
- Benchmark interno de políticas: útil como referencia de éxito/fracaso en tareas de manipulación bimanual con objetos pequeños y contenedores, siempre que se documenten las condiciones de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (*"No evaluation results have been provided for this policy yet"*), por lo que no existen tasas de éxito, métricas de precisión ni comparaciones cuantitativas verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en fp32 para los 51,67 M de parámetros, más el coste de procesar tres imágenes; en la práctica, menos de 4 GB con overhead de framework.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas, aunque para esta carga las consumer son suficientes.
- Cabe holgadamente en GPU de consumo: GTX 1660, RTX 3050 en adelante.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con backend PyTorch; no se documentan exportaciones a ONNX, TensorRT ni llama.cpp (no aplicable).
- Latencia y throughput: no disponibles de forma oficial; el dataset está grabado a 30 FPS, lo que sugiere que la política está pensada para operar a esa frecuencia, pero no se confirma latencia real medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboCrafty/act_real_parol6_pull_container_pick_place_yellow_and_blue_cube | 51,67 M | no aplica | Pick-and-place específico en Parol6 | Apache 2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot (p. ej. `lerobot/act_aloha_*`) | del orden de decenas de millones | no aplica | Manipulación bimanual Aloha | Apache 2.0 | Hugging Face |
| Políticas Diffusion Policy (p. ej. `lerobot/diffusion_*`) | variable, típicamente mayor | no aplica | Manipulación visual | Apache 2.0 | Hugging Face |

No se dispone de datos cuantitativos de rendimiento para establecer una comparación rigurosa; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único robot (`my_parol6`); no generaliza a otras tareas, objetos o morfologías sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su robustez ante variaciones de iluminación, posiciones de objetos o distracciones.
- Dataset pequeño: 44 episodios y 57.467 frames son insuficientes para cubrir la variabilidad del mundo real; se espera sobreajuste a las condiciones de grabación.
- Dependencia de la configuración de cámaras: los nombres y resoluciones de las cámaras (`gripper_cam`, `topdown_cam`, `isometric_cam`) deben coincidir exactamente con los del entrenamiento; cualquier cambio invalida la política.
- Sin capacidades lingüísticas ni de razonamiento: no debe emplearse como modelo de lenguaje ni en pipelines que requieran comprensión semántica.
- Riesgo de alucinación en el sentido de acciones incoherentes fuera de distribución; no hay mecanismos de seguridad documentados.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el comportamiento del robot en producción recae enteramente en el integrador.
- Fecha de creación del repositorio (2026-10-31) posterior a la fecha actual de referencia; conviene verificar la integridad y procedencia de los artefactos antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RoboCrafty/act_real_parol6_pull_container_pick_place_yellow_and_blue_cube
- Dataset de entrenamiento: https://huggingface.co/datasets/RoboCrafty/parol6_pull_container_pick_place_yellow_and_blue_cube
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=RoboCrafty/parol6_pull_container_pick_place_yellow_and_blue_cube
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
