# majinwakeup30/smolvla_so101_stack_cube_v3_2_cameras

## Resumen

smolvla_so101_stack_cube_v3_2_cameras es un ajuste fino (fine-tune) del modelo base lerobot/smolvla_base, publicado por el usuario majinwakeup30 en HuggingFace. Se trata de una política de visión-lenguaje-acción (VLA) orientada a robótica de manipulación, concretamente a la tarea de apilar cubos (stack cube) con un brazo SO-101 y dos cámaras de entrada. El modelo pertenece a la familia SmolVLA, descrita en el paper arXiv:2506.01844, que propone un VLA compacto capaz de ejecutarse en hardware de consumo.

El checkpoint tiene 450.046.176 parámetros (unos 450 millones, dato extraído de los pesos en safetensors) y ocupa 0,9 GB en el repositorio. Se distribuye en formato safetensors, con licencia Apache 2.0 y la librería LeRobot como herramienta de entrenamiento e inferencia. El pipeline declarado en el Hub es "robotics", no "text-generation", por lo que el modelo no está pensado para generar texto sino para emitir secuencias de acciones de control.

Su relevancia es doble: por un lado demuestra el flujo de trabajo de ajuste de SmolVLA sobre un dataset propio de demostraciones, y por otro sirve como ejemplo reproducible de cómo adaptar un VLA pequeño a una tarea concreta de manipulación con hardware asequible. El repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha, y no incluye resultados de evaluación publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) de tipo SmolVLA, según el paper arXiv:2506.01844; detalles internos de capas no disponibles |
| Parámetros totales | 450.046.176 (dato real de los pesos en safetensors) |
| Parámetros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | no disponible; el modelo está orientado a control robótico y no se documenta soporte multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base (fine-tune) |
| Librería | lerobot |
| Pipeline declarado | robotics |
| Tarea / embodiment | apilar cubos (stack cube) con brazo SO-101 y 2 cámaras |
| Dataset de entrenamiento | addisonkey/stack_cube_merged_v3 |
| Tamaño del repositorio | 0,9 GB |
| Fecha de creación en el Hub | 2026-09-16 (según metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

SmolVLA es una familia de modelos visión-lenguaje-acción compactos que combinan un codificador visual y un componente de lenguaje con un módulo generador de acciones, de forma que la política recibe observaciones visuales y estado del robot y produce comandos motores. El paper de referencia (arXiv:2506.01844) presenta esta arquitectura y su orientación a "affordable and efficient robotics". Esta ficha corresponde a un fine-tune del checkpoint base lerobot/smolvla_base, no al modelo original publicado por los autores del paper.

El entrenamiento se ha realizado con LeRobot sobre el dataset addisonkey/stack_cube_merged_v3, que agrupa demostraciones de la tarea de apilar cubos. Según la model card, el flujo estándar es `lerobot-train` para entrenar y `lerobot-record` para evaluar o ejecutar inferencia sobre un robot so100_follower. No se especifican en la información disponible el número de tokens o de episodios, la composición exacta del dataset, ni si se aplicaron etapas de RLHF, DPO u optimización posterior. La configuración atañe a 2 cámaras de entrada, un dato declarado en el propio identificador del modelo.

## Capacidades

- Generación de acciones motoras para una tarea de manipulación concreta: apilar cubos, integrada en el bucle de control de un brazo SO-101 gestionado por LeRobot.
- Procesamiento de entrada visual multimodal: el identificador del modelo indica el uso de 2 cámaras simultáneas, presumiblemente con vistas complementarias de la escena.
- Política condicionada por observación y estado del robot: recibe imágenes y estado proprioceptivo y emite comandos de acción, conforme al esquema de un VLA.
- Ajuste fino sobre un dominio específico: el modelo está especializado en el dataset addisonkey/stack_cube_merged_v3, por lo que su comportamiento está alineado con esa distribución de escenas.
- Ejecución y evaluación mediante LeRobot: compatible con los comandos `lerobot-record` y `--policy.path` descritos en la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se documenta procesamiento de lenguaje natural en la ficha.
- Modo "thinking", visión para descripción de imágenes o audio: no disponible.

## Casos de uso

- Investigación en aprendizaje por imitación: el checkpoint sirve como punto de partida reproducible para estudiar cómo se comporta un VLA de 450 M de parámetros ajustado a una tarea de manipulación concreta, permitiendo replicar el entrenamiento con `lerobot-train` sobre el dataset declarado.
- Reentrenamiento sobre dominios nuevos: partiendo de este fine-tune y del modelo base lerobot/smolvla_base, un equipo puede continuar el ajuste con sus propias demostraciones para tareas como recoger y colocar piezas, aprovechando que el coste de entrenamiento de un VLA de este tamaño es bajo.
- Docencia y prototipado en robótica de bajo coste: el SO-101 es una plataforma de brazo económico, y un modelo de 0,9 GB puede ejecutarse en un equipo con GPU de gama media, lo que lo hace adecuado para prácticas de laboratorio y asignaturas de robótica.
- Recolección de datos y evaluación comparativa: usando `lerobot-record` con `--policy.path` apuntando a este checkpoint se pueden grabar episodios `eval_` y comparar políticas con las mismas condiciones de escena.
- Referencia para pipelines de aprendizaje por imitación en producción ligera: en una celda de fabricación con una tarea de apilado muy repetitiva y controlada, la política se podría desplegar como componente de control, siempre con supervisión y paradas de seguridad.
- Base para estudios de robustez visual: al depender de 2 cámaras, es un caso útil para medir cómo afectan oclusiones, cambios de iluminación o recolocación de cámaras al rendimiento de un VLA pequeño.
- Integración en entornos de simulación: el mismo checkpoint puede ejecutarse sobre réplicas simuladas del SO-101 para validar la tarea de apilado antes de pasar al robot físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito de la tarea, curvas de entrenamiento, comparaciones con otras políticas ni métricas de simulación o de robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,9 GB solo para los pesos en bf16 y 1,8 GB en fp32; con activaciones y buffers de inferencia, un presupuesto práctico de 2 a 4 GB es razonable (estimación a partir del tamaño del repositorio, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; por ejemplo RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100 o H100. Las GPU de datacenter son sobredimensionadas para 450 M de parámetros y solo se justifican si se entrena o se sirven muchas instancias.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4 GB o más; también es plausible su ejecución en CPU, aunque con mayor latencia (no documentada).
- Hardware embebido: no hay datos publicados sobre Jetson Orin, Raspberry Pi 5 u otras plataformas embebidas para este checkpoint concreto.
- Opciones de despliegue: LeRobot es la vía documentada (`lerobot-record` con `--policy.path`); el pipeline declarado es `robotics`, no `text-generation`, por lo que vLLM, TGI, llama.cpp u Ollama no aplican directamente.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de control, tiempo por paso de inferencia ni tasa de éxito.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| smolvla_so101_stack_cube_v3_2_cameras | 450.046.176 | 2 cámaras + estado del robot; contexto no disponible | Apache 2.0 | HuggingFace, librería lerobot, 0 descargas |
| lerobot/smolvla_base | no disponible | no disponible | no disponible | HuggingFace, modelo base del anterior |
| ACT (Action Chunking Transformer) | no disponible (configurable) | cámaras + estado; sin componente de lenguaje | no disponible | Implementación disponible en LeRobot |
| Diffusion Policy | no disponible (configurable) | cámaras + estado; generación difusiva de acciones | no disponible | Implementación disponible en LeRobot |
| pi0 / familias VLA de mayor tamaño | no disponible en la información proporcionada | multimodal | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas dentro de la información proporcionada. La comparación debe entenderse como orientativa en cuanto a categoría (políticas de imitación en LeRobot frente a VLA), no como una comparación medida.

## Limitaciones y advertencias

- Especialización extrema: el modelo está ajustado al dataset addisonkey/stack_cube_merged_v3, por lo que su comportamiento fuera de esa distribución (objetos distintos, otra mesa, otra iluminación, otra disposición de cámaras) no está caracterizado y previsiblemente degradará.
- Sin evaluación publicada: no hay tasas de éxito ni métricas de robustez; el repositorio registra 0 descargas y 0 likes, lo que implica ausencia de validación externa.
- Ausencia de mecanismos de seguridad: un VLA de control motor puede producir trayectorias erráticas o colisiones. Cualquier despliegue físico requiere parada de emergencia, límites de par y supervisión humana.
- Riesgo de fallo silencioso: no se documentan mecanismos de detección de fallo, confianza o abstención; el modelo emitirá acciones aunque la escena no sea la esperada.
- Sesgos de los datos de demostración: el comportamiento hereda los sesgos del operador que teleoperó las demostraciones (velocidad, punto de agarre, secuencia de movimientos) y las condiciones materiales del montaje original.
- Idiomas y capacidades de lenguaje: no disponibles. No debe asumirse que este checkpoint conserve o exponga capacidades de generación de texto del modelo base.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero la licencia del dataset de entrenamiento y las condiciones del modelo base no se detallan en la información proporcionada; conviene verificarlas antes de un uso comercial.
- Metadatos incompletos: no se documentan longitud de contexto, cuantizaciones soportadas, idiomas ni requisitos de hardware, lo que complica planificar un despliegue en producción.
- Fecha de creación declarada en el Hub (2026-09-16) posterior a la fecha de actualización disponible; conviene contrastar los metadatos antes de citarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/majinwakeup30/smolvla_so101_stack_cube_v3_2_cameras
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Dataset de entrenamiento: https://huggingface.co/datasets/addisonkey/stack_cube_merged_v3
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Nota: los resultados de búsqueda web facilitados no contienen enlaces relacionados con este modelo ni con SmolVLA, por lo que no se incluyen.
