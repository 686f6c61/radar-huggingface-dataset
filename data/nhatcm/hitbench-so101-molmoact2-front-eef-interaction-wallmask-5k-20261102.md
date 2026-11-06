# nhatcm/hitbench-so101-molmoact2-front-eef-interaction-wallmask-5k-20261102

## Resumen

HitBench SO-101 MolmoAct2 es un checkpoint de evaluación de robótica entrenado sobre la base de MolmoAct2 (AllenAI) y ajustado para el brazo robótico SO-101 con control de efector final (end-effector). Lo publica el usuario `nhatcm` en Hugging Face como parte del conjunto de experimentos HitBench, y corresponde al paso 5.000 de un entrenamiento de 20.000 pasos. No es un modelo de lenguaje general, sino una política visomotora (vision-language-action) que recibe una imagen RGB frontal de 256x256, el estado de las seis articulaciones del SO-101 y una instrucción en lenguaje natural, y devuelve un chunk de 50 acciones de efector final a 20 Hz.

El modelo tiene 5.601.988.144 parámetros (unos 5,6 mil millones) en formato safetensors, con un repositorio de 12,7 GB, y se distribuye con la librería `lerobot`. La innovación principal respecto a un MolmoAct2 genérico está en el contrato de acción `normalized-eef-delta-v2` y en el entrenamiento con prompts causales de interacción (sufijos `I have released the object` / `I have held the object` en tareas H2R-air y R2H) y con aumentación de paredes (wall replacement) al 85 % de probabilidad.

Es relevante ahora porque ejemplifica el patrón actual de políticas VLA de código abierto para brazos de bajo coste (SO-101), con contratos de acción y de muestreo versionados de forma explícita, lo que facilita la reproducibilidad y la portabilidad entre checkpoints. No obstante, se trata de un checkpoint privado de evaluación, sin licencia declarada ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (MolmoAct2 como base VLM, con experto de acción) |
| Parametros totales | 5.601.988.144 (5,6 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (entrada: una imagen 256x256, estado de 6 articulaciones e instrucción de tarea) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 durante el entrenamiento) |
| Idiomas soportados | no disponible (instrucciones en inglés en los prompts de la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una política visomotora basada en MolmoAct2 (`allenai/MolmoAct2`) con dos componentes diferenciados: un VLM congelado con adaptadores LoRA de rango 64 (LR 1e-5) y un experto de acción entrenado con LR 5e-5, todo en bfloat16. El entrenamiento usó un batch global efectivo de 16 (8 GPUs x 1 por GPU x acumulación de gradiente 2) sobre el dataset `nhatcm/hitbench-so101-tasks0-9-front-eef-causal-interaction-prompts-477-20261102`, compuesto por 477 trayectorias y 349.611 fotogramas de las tareas 0 a 9, solo vista frontal.

El muestreo combina un 80 % de anclas aleatorias uniformes por trayectoria y un 20 % de anclas balanceadas en los límites de autoridad H2R-air/R2H (transiciones entre humano y robot). La aumentación visual es agresiva: brillo, contraste, saturación, tono, nitidez, ruido gaussiano de sensor y reemplazo de pared etiquetado por 10 fondos curados o procedurales con probabilidad 0,85. El contrato de acción `normalized-eef-delta-v2` define traslación como `0.004 m * delta`, rotación en eje-ángulo con `0.5 rad * delta` y pinza como objetivo absoluto (`-1` = abierta al 100, `+1` = cerrada al 0), decodificando cada acción contra el último estado propioceptivo medido. Los ficheros `action_contract.json`, `sampling_contract.json`, `wall_augmentation_contract.json`, `training_home_coordinate.json` y `train_config.json` preservan los ajustes exactos.

## Capacidades

- Control visomotor de un brazo SO-101 a partir de una única imagen RGB frontal de 256x256 y el estado de seis articulaciones (`shoulder_pan, shoulder_lift, elbow_flex, wrist_flex, wrist_roll, gripper`).
- Generación de chunks de 50 acciones de 7 dimensiones `[dx, dy, dz, dRx, dRy, dRz, gripper]` a 20 Hz.
- Comprensión de instrucciones de tarea en lenguaje natural para las tareas 0 a 9 del benchmark HitBench.
- Manejo de prompts causales de interacción: sufijos `I have released the object` tras una liberación confirmada y `I have held the object` tras un agarre confirmado, aplicables solo a H2R-air y R2H.
- Robustez visual entrenada frente a variaciones de iluminación, color, nitidez, ruido de sensor y fondos de pared sustituidos.
- Control de efector final en espacio de deltas normalizados, con pinza como objetivo absoluto.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Manipulación pick-and-place con SO-101: el modelo recibe la imagen frontal y el estado articular y emite 50 acciones de efector final por inferencia, suficiente para ejecutar aproximaciones y agarres a 20 Hz en un bucle de control.
- Tareas de interacción humano-robot (H2R-air, R2H): los prompts causales permiten al modelo distinguir entre la fase previa al agarre o liberación y la fase posterior, lo que facilita la sincronización con un operador humano.
- Evaluación comparativa en HitBench: al ser un checkpoint en el paso 5.000 de 20.000, sirve como referencia intermedia para medir la curva de aprendizaje de la política en las tareas 0 a 9.
- Investigación en aumentación visual: el contrato de reemplazo de paredes (10 fondos, probabilidad 0,85) permite reproducir experimentos de robustez al fondo y analizar su efecto en la tasa de éxito.
- Reentrenamiento y ajuste fino: al partir de `allenai/MolmoAct2` con LoRA rango 64, se puede adaptar a otras tareas o brazos manteniendo el experto de acción y el contrato de acción versionado.
- Despliegue en laboratorio con `lerobot`: la integración con la librería `lerobot` y los ficheros de contrato (`action_contract.json`, `sampling_contract.json`) permiten montar un pipeline de inferencia reproducible sobre hardware SO-101.
- Estudio de portabilidad de checkpoints: la nota de portabilidad (reconciliación de metadatos del procesador a `env_action_dim=7` y modo de control `normalized 7D end-effector delta`) es un caso práctico para validar la consistencia entre checkpoint local y copia en el Hub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 5,6 B parámetros en bfloat16, los pesos ocupan aproximadamente 11,2 GB; en FP16/bf16 se necesita holgura adicional para activaciones y el procesador visual, por lo que se recomienda al menos 16-24 GB de VRAM.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar A100, H100, L40S o RTX 4090/A6000 con 24 GB o más; no se confirma compatibilidad con GPUs de 8-12 GB.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) en bf16, pero no está verificado en la información disponible. En GPUs de 8-12 GB requeriría cuantización, y no se documentan tipos de cuantización.
- Opciones de despliegue: la librería indicada es `lerobot`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (habitualmente orientadas a LLMs, no a políticas VLA).
- Latencia y throughput: no disponibles. El control opera a 20 Hz con chunks de 50 acciones, lo que implica una inferencia cada 2,5 s como máximo si se ejecuta el chunk completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HitBench SO-101 MolmoAct2 (este) | 5,6 B | Imagen 256x256 + estado 6 articulaciones + instrucción | Control EEF SO-101 | no disponible | Hugging Face (`nhatcm/...`) |
| allenai/MolmoAct2 (base) | no disponible en la información | no disponible | VLA general | no disponible en la información | Hugging Face (`allenai/MolmoAct2`) |
| Otras políticas SO-101 en LeRobot | no disponible | no disponible | Control SO-101 | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Es un checkpoint privado de evaluación en el paso 5.000 de 20.000; no es un modelo final y su rendimiento puede ser inferior al de un checkpoint completado.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Idiomas no disponibles: los prompts documentados están en inglés; no se garantiza el comportamiento con instrucciones en castellano u otros idiomas.
- Entrenado solo con vista frontal y tareas 0 a 9; no se documenta generalización a otras cámaras, brazos u objetos fuera del dataset.
- Los prompts causales solo aplican a H2R-air y R2H; usarlos en otras tareas puede degradar el comportamiento.
- Riesgo de alucinación y de acciones erróneas en robótica real: las acciones se decodifican contra el último estado propioceptivo medido, por lo que un estado desactualizado o mal calibrado produce comandos incorrectos.
- La aumentación de paredes al 85 % puede introducir sesgos hacia los 10 fondos usados; el rendimiento en entornos con fondos distintos no está evaluado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de tasa de éxito ni de robustez.
- Requiere respetar el contrato `normalized-eef-delta-v2` y los ficheros de contrato; desviarse de ellos invalida la interpretación de las acciones.
- La nota de portabilidad indica que los metadatos del procesador se reconciliaron en la copia del Hub; conviene verificar `action_contract.json` antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/nhatcm/hitbench-so101-molmoact2-front-eef-interaction-wallmask-5k-20261102
- Checkpoint base: https://huggingface.co/allenai/MolmoAct2
- Dataset de entrenamiento: https://huggingface.co/datasets/nhatcm/hitbench-so101-tasks0-9-front-eef-causal-interaction-prompts-477-20261102
- Librería LeRobot: no disponible en la información proporcionada (no se incluye URL)
- Paper o blog de MolmoAct2: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
