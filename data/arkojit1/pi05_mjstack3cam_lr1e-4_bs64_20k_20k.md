# arkojit1/pi05_mjstack3cam_lr1e-4_bs64_20k_20k

## Resumen

π₀.₅ (`pi05`) es una política robótica de tipo vision-language-action (VLA) desarrollada originalmente por Physical Intelligence. Este repositorio concreto es un ajuste fino del checkpoint base `lerobot/pi05_base` realizado por el usuario arkojit1 mediante LeRobot 0.7.0 sobre un conjunto de datos propio de manipulación robótica en simulación. El modelo resuelve una tarea muy concreta: apilar bloques de colores (rojo sobre amarillo y amarillo sobre rojo) con un brazo Franka Panda simulado en MuJoCo, a partir de instrucciones en lenguaje natural y tres cámaras.

El ajuste entrena únicamente el "action expert" (unos 4.140 millones de parámetros totales en el checkpoint), manteniendo congelados los codificadores visuales SigLIP y el backbone de lenguaje Gemma-2B. La política produce chunks de 50 acciones (1 segundo a 50 Hz) en un espacio de acción cartesiano de 4 dimensiones (dx, dy, dz, gripper), sin control de orientación.

Es relevante como ejemplo reproducible de fine-tuning de un VLA moderno sobre hardware AMD (8× MI300X) y como referencia de buenas prácticas de documentación de entrenamiento (learning rate, schedule, evaluación, versiones de librería). No obstante, su utilidad fuera del dataset de entrenamiento es prácticamente nula: es un artefacto de investigación de una tarea específica, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) π₀.₅: codificadores SigLIP + backbone Gemma-2B congelados + action expert entrenable (flow matching) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ventana de observación multimodal y chunk de 50 acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16/fp32) |
| Idiomas soportados | no disponibles (las instrucciones del dataset están en inglés; el modelo base es multilingüe pero no se documenta) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Version de LeRobot | 0.7.0 |
| Modelo base | lerobot/pi05_base (revision a538eb27) |
| Dataset de ajuste | arkojit1/mj_stack_red_yellow_3cam (revision a38bf81) |
| Espacio de accion | 4-D: [dx, dy, dz, gripper] (cartesian_pos) |
| Espacio de estado | 4-D: end-effector x, y, z + gripper |
| Entradas visuales | observation.image.front, observation.image.wrist, observation.image.side |
| Chunk de accion | 50 pasos (1.0 s a 50 Hz) |
| Tamano del repo | 9.4 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅ de Physical Intelligence: un VLA que combina percepción visual (codificadores SigLIP), comprensión de lenguaje (Gemma-2B) y un "action expert" que genera acciones mediante flow matching. En este ajuste, solo el action expert es entrenable (`train_expert_only=true`); SigLIP y Gemma-2B permanecen congelados. La política recibe tres imágenes (front, wrist, side) y una instrucción de lenguaje, y emite un chunk de 50 acciones de 4 dimensiones.

El entrenamiento se realizó sobre 200 episodios de apilamiento de bloques en MuJoCo con un Franka Panda a 50 Hz, con 8 tareas de lenguaje (cuatro formulaciones de "red on yellow" y cuatro de "yellow on red", 25 episodios por tarea). Se usaron 8 GPUs MI300X con batch global 64, AdamW con LR pico 1e-4, betas (0.9, 0.95), weight decay 0.01, grad clip 1.0, schedule coseno con warmup de 666 pasos y floor 2.5e-6, en bf16. Se aplicó normalización por cuantiles (q01–q99) a estado y acción, sin aumentación de datos. Se completaron 20.000 pasos (15.3 épocas). La pérdida de evaluación final fue 0.0157 (mínimo 0.0149 en el paso 13.500, no guardado; mejor checkpoint guardado 0.0151 en el paso 13.000), con pérdida de entrenamiento 0.006.

## Capacidades

- Generación de acciones robóticas de manipulación (apilamiento de bloques) condicionadas a instrucciones en lenguaje natural.
- Percepción multimodal con tres cámaras simultáneas (frontal, muñeca, lateral).
- Control cartesiano de efector final en 4 dimensiones (dx, dy, dz, apertura de pinza).
- Ejecución de chunks de 50 acciones (1 segundo) para control a 50 Hz.
- Comprensión de 8 formulaciones lingüísticas distintas de dos tareas de apilamiento.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene modo "thinking", visión general, audio ni capacidades multilingües documentadas.
- No comanda rotación: la orientación del efector no está en el espacio de acción.

## Casos de uso

- Reproducción de experimentos de VLA en simulación: sirve como checkpoint de referencia para validar pipelines de LeRobot 0.7.0 con π₀.₅ sobre MuJoCo y Franka, comparando pérdidas de evaluación y curvas de entrenamiento.
- Benchmark de fine-tuning sobre hardware AMD: útil para estudiar el rendimiento de 8× MI300X en el ajuste de un VLA con backbone congelado y action expert entrenable.
- Estudio de esquemas de acción cartesianos: permite analizar cómo se comporta π₀.₅ cuando se restringe el espacio de acción a translación + pinza, sin orientación ni deltas articulares.
- Docencia e investigación en robótica de manipulación: ejemplo didáctico de dataset multi-cámara, normalización por cuantiles y evaluación con split holdout por tarea.
- Base para fine-tuning adicional: al ser un checkpoint de una tarea simple, puede servir como inicialización para variantes del mismo entorno (otros colores, posiciones o formulaciones lingüísticas).
- Análisis de estabilidad de entrenamiento: la meseta de evaluación (~0.015–0.016 desde el paso 12.500) permite estudiar cuándo un VLA deja de mejorar con los datos disponibles.
- No es adecuado para despliegue en robots reales ni para tareas fuera del dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento son métricas de entrenamiento y evaluación del propio ajuste:

| Metrica | Valor |
|---|---|
| Eval loss (paso 20.000, checkpoint final) | 0.0157 |
| Eval loss minima (paso 13.500, no guardado) | 0.0149 |
| Mejor checkpoint guardado (paso 13.000) | 0.0151 |
| Train loss | 0.006 |
| Epocas completadas | 15.3 |
| Pasos totales | 20.000 |
| Split de evaluacion | 24 de 200 episodios (3 por tarea) |

El autor advierte explícitamente que la eval loss es una métrica del objetivo de entrenamiento (flow matching) sobre episodios retenidos, no una tasa de éxito de la tarea. El scatter punto a punto es de aproximadamente ±0.001 al final del entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4.140 millones de parámetros, en bf16 serían ~8.3 GB de pesos; en fp32, ~16.6 GB. A ello hay que sumar los codificadores SigLIP y Gemma-2B, ya incluidos en el recuento total, y las activaciones de las tres cámaras.
- GPU recomendadas: el entrenamiento se realizó en 8× AMD MI300X (8 por GPU, batch global 64). Para inferencia se espera que quepa en GPUs con al menos 16–24 GB de VRAM, aunque no se documenta oficialmente.
- GPU de consumo: probablemente cabe en RTX 4090 (24 GB) y posiblemente en RTX 3090 (24 GB) o 4080 (16 GB) con cuantización, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: LeRobot 0.7.0 con `PI05Policy.from_pretrained(...)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un VLA de robótica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arkojit1/pi05_mjstack3cam_lr1e-4_bs64_20k_20k | 4.14 B | chunk 50 acciones | Apilamiento MuJoCo Franka | no disponible | Hugging Face (0 descargas) |
| lerobot/pi05_base | no disponible | no disponible | VLA generalista base | no disponible | Hugging Face |
| Otros VLA comparables (OpenVLA, RT-2, etc.) | no disponible en la informacion proporcionada | no disponible | Manipulación generalista | no disponible | no disponible |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con alternativas en la información proporcionada. La comparación más directa es con su modelo base `lerobot/pi05_base`, del que este checkpoint es un ajuste fino sobre una tarea concreta.

## Limitaciones y advertencias

- Sesgos conocidos: el dataset contiene solo dos tareas de apilamiento con dos colores y posiciones limitadas; el modelo no generalizará a otros objetos, colores o configuraciones.
- Riesgo de alucinación: en el contexto de un VLA, se traduce en acciones incorrectas o inseguras fuera de la distribución de entrenamiento; no hay validación en robot real.
- Limitaciones de contexto o idioma: solo se entrenó con 8 formulaciones en inglés de dos instrucciones; no se documenta soporte multilingüe.
- Restricciones de licencia: la licencia no está disponible, lo que impide determinar si se permite uso comercial. El modelo base `lerobot/pi05_base` tiene su propia licencia que debe consultarse.
- Sin control de orientación: el espacio de acción excluye rotación y deltas articulares, lo que limita la tarea a translación + pinza.
- Dependencia estricta de LeRobot 0.7.0: la prompt de π₀.₅ incluye el estado como 4 dimensiones reales (no padded a 32 como en LeRobot 0.4.4); cargarlo con otra versión puede romper la inferencia.
- Orden de cámaras fijo: front → base_0_rgb, wrist → left_wrist_0_rgb, side → right_wrist_0_rgb; alterar el orden invalida la política.
- Eval loss no equivale a tasa de éxito: el autor lo advierte explícitamente; no hay métricas de éxito de tarea publicadas.
- Checkpoint final no es el mejor: el mínimo de eval loss (0.0149) no se guardó; el mejor checkpoint guardado es el paso 13.000.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.
- Entrenado en simulación (MuJoCo): no hay garantía de transferencia a un Franka real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arkojit1/pi05_mjstack3cam_lr1e-4_bs64_20k_20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de ajuste: https://huggingface.co/datasets/arkojit1/mj_stack_red_yellow_3cam
- LeRobot (librería): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot
- Paper de π₀.₅ (Physical Intelligence): no disponible en la informacion proporcionada
