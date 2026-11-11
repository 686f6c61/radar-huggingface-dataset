# ranjith3567/pick_yellow_cube_v5.1_chunk10

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot. Este repositorio concreto, `ranjith3567/pick_yellow_cube_v5.1_chunk10`, es un *fine-tuning* de SmolVLA entrenado mediante aprendizaje por imitación para una tarea robótica específica: recoger un bloque amarillo y depositarlo en una caja marrón. El modelo consume observaciones multimodales (estado articular de 6 dimensiones y hasta cuatro flujos de cámara) y produce comandos de acción de 6 dimensiones para un robot tipo `so_follower`.

Con aproximadamente 450 millones de parámetros (450.046.176 según los pesos en safetensors) y un tamaño de repositorio de 0,9 GB, el modelo está diseñado para ejecutarse en hardware de consumo, lo que lo hace accesible para laboratorios con presupuesto limitado. La arquitectura subyacente combina un codificador visual, un modelo de lenguaje compacto y un cabezal de acciones, siguiendo el diseño presentado en el paper SmolVLA (arXiv:2506.01844).

La relevancia de esta ficha radica en que ejemplifica el flujo típico de LeRobot: un investigador graba un dataset de demostraciones (100 episodios, 63.143 fotogramas a 30 FPS), entrena una política con `lerobot-train` y la publica en el Hub para su reproducción. No obstante, se trata de un modelo de nicho, sin métricas de evaluación publicadas y con licencia no especificada, por lo que su uso en producción requiere validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA; combina codificador visual, modelo de lenguaje y cabezal de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto general) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Cámaras de entrada | `Top`, `Side` (y hasta 4 flujos visuales en total) |
| Dimensión de estado | `(6,)` |
| Dimensión de acción | `(6,)` |
| Resolución de imagen | 256x256 (cámaras 1-3), 480x640 (cámara vacía) |
| Framework | LeRobot 0.6.2 |
| Tarea entrenada | "pick the yellow block and place it in brown box" |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que integra percepción visual y comprensión del lenguaje para generar acciones motoras directamente. La arquitectura, descrita en el paper arXiv:2506.01844, está pensada para ser compacta y eficiente, con el objetivo de reducir costes computacionales frente a VLA de mayor tamaño como OpenVLA o RT-2. El modelo procesa observaciones multimodales (imágenes de varias cámaras y estado proprioceptivo del robot) y emite un vector de acción de 6 dimensiones, típico de un brazo robótico de 6 grados de libertad.

El entrenamiento de esta instancia concreta se realizó mediante aprendizaje por imitación supervisado sobre el dataset `ranjith3567/pick_yellow_cube_v5_20261105_191046`, compuesto por 100 episodios y 63.143 fotogramas grabados a 30 FPS. La configuración de entrenamiento incluye 30.000 pasos, batch size de 8, optimizador AdamW con learning rate 1e-4 y semilla 1000, ejecutado con LeRobot 0.6.2. No se especifica si hubo RLHF, DPO ni técnicas de refinamiento posteriores; el pipeline es de imitación pura. Tampoco se detalla la composición exacta del dataset más allá de la tarea y el número de episodios.

## Capacidades

- Generación de acciones robóticas de 6 dimensiones para un robot `so_follower` a partir de observaciones visuales y de estado.
- Percepción visual multimodal: procesa hasta cuatro flujos de cámara simultáneos (tres a 256x256 y uno a 480x640).
- Ejecución de una tarea específica de manipulación: recoger un bloque amarillo y colocarlo en una caja marrón.
- Aprendizaje por imitación: la política se ha entrenado exclusivamente con demostraciones humanas, sin refuerzo explícito.
- Integración con el ecosistema LeRobot: compatible con `lerobot-rollout` y `lerobot-train` para despliegue y reentrenamiento.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües; es un modelo puramente motor.

## Casos de uso

- **Automatización de tareas de pick-and-place en laboratorio**: el modelo puede ejecutar la secuencia de recoger un objeto y depositarlo en un contenedor, adecuado para experimentos de manipulación repetitivos donde se requiera una política entrenada rápidamente con 100 demostraciones.
- **Prototipado rápido de políticas robóticas**: gracias a su tamaño compacto (450 M de parámetros, 0,9 GB) y a la integración con LeRobot, un investigador puede desplegar y evaluar la política en minutos usando `lerobot-rollout`, sin necesidad de infraestructura de GPU de datacenter.
- **Investigación en aprendizaje por imitación**: sirve como caso de estudio reproducible para analizar el efecto de hiperparámetros (30.000 pasos, batch 8, lr 1e-4) en el rendimiento de SmolVLA sobre una tarea concreta.
- **Docencia y formación en robótica**: el flujo completo (grabación de dataset, entrenamiento y despliegue) es un ejemplo didáctico de un pipeline de imitación con LeRobot, adecuado para cursos universitarios o talleres.
- **Base para fine-tuning en tareas similares**: el checkpoint puede reutilizarse como punto de partida para entrenar políticas en tareas de manipulación relacionadas, reduciendo el coste frente a entrenar desde cero.
- **Validación de hardware de bajo coste**: al caber en GPUs de consumo, permite comprobar si una configuración de robot `so_follower` con cámaras de bajo coste es viable para una aplicación industrial o educativa antes de invertir en hardware superior.
- **Generación de datos sintéticos o aumentados**: la política puede emplearse para generar trayectorias de referencia que luego se filtren y aumenten el dataset original, aunque esta aplicación requiere validación manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: *"No evaluation results have been provided for this policy yet."* No hay tabla de tasas de éxito, ni comparación con otras políticas, ni métricas de latencia o throughput.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial. Con 450 M de parámetros en safetensors (0,9 GB), una estimación conservadora en FP16 sería de ~1 GB de pesos más el overhead del codificador visual y los buffers de activaciones; en la práctica, se recomienda al menos 4-8 GB de VRAM para operar con comodidad.
- **GPU recomendadas**: el paper de SmolVLA indica que puede desplegarse en hardware de consumo; se espera compatibilidad con RTX 3060, RTX 4060, RTX 4090 y GPUs de datacenter como A100 o H100, aunque no se especifican modelos concretos en la información disponible.
- **¿Cabe en consumer GPU?**: sí, según la model card ("can be deployed on consumer-grade hardware"). El tamaño de 0,9 GB sugiere que cabe en GPUs con 8 GB o menos, aunque la latencia dependerá del modelo concreto.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout`), con soporte para `--policy.device=cuda`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de robótica de este tipo.
- **Latencia y throughput**: no disponibles. Al ser una política de control robótico, la latencia relevante es el tiempo por paso de control, que debe ser compatible con los 30 FPS del dataset de entrenamiento, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ranjith3567/pick_yellow_cube_v5.1_chunk10` | 450 M | no disponible | Pick-and-place de bloque amarillo | no disponible | Hugging Face (0 descargas, 0 likes) |
| SmolVLA (base, Hugging Face) | ~450 M (según paper) | no disponible | VLA generalista para robótica | no disponible en esta ficha | Hugging Face / LeRobot |
| OpenVLA | ~7 B | no disponible | VLA generalista | no disponible en esta ficha | Hugging Face |
| RT-2 (Google DeepMind) | no disponible | no disponible | VLA generalista | propietaria | no público |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros y disponibilidad; cualquier afirmación sobre calidad relativa sería especulativa.

## Limitaciones y advertencias

- **Sesgos conocidos**: no documentados. Al entrenarse con un dataset de 100 episodios de una única tarea, la política puede sobreajustarse a las condiciones específicas de iluminación, posiciones de objeto y configuración de cámara del dataset original.
- **Riesgo de alucinación**: en el contexto de un modelo de acciones, el equivalente es la generación de trayectorias inválidas o inseguras cuando el entorno difiere del de entrenamiento. No hay evaluación que cuantifique este riesgo.
- **Limitaciones de contexto e idioma**: no aplica en el sentido textual; el modelo no procesa lenguaje natural de forma general, solo la instrucción de tarea asociada. No se especifican idiomas soportados.
- **Restricciones de licencia**: la licencia no está disponible. Esto impide determinar si el uso comercial está permitido; se recomienda contactar con el autor antes de cualquier despliegue productivo.
- **Falta de evaluación**: no hay tasas de éxito publicadas, lo que impide estimar la fiabilidad real de la política en producción.
- **Especificidad de hardware**: el modelo está entrenado para un robot `so_follower` con una configuración concreta de cámaras (`Top`, `Side`, más flujos adicionales). Cambiar la disposición de las cámaras o el robot probablemente degrade el rendimiento.
- **Dataset pequeño**: 100 episodios y 63.143 fotogramas es un volumen reducido para generalización; la política puede fallar ante variaciones de posición, distractores o cambios de iluminación.
- **Mantenimiento**: el repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de mantenimiento posterior ni de una comunidad activa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ranjith3567/pick_yellow_cube_v5.1_chunk10
- Dataset de entrenamiento: https://huggingface.co/datasets/ranjith3567/pick_yellow_cube_v5_20261105_191046
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ranjith3567/pick_yellow_cube_v5_20261105_191046
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
