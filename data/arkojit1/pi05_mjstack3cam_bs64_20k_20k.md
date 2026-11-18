# arkojit1/pi05_mjstack3cam_bs64_20k_20k

## Resumen

π₀.₅ fine-tuned es un checkpoint de política robótica (vision-language-action, VLA) derivado de `lerobot/pi05_base`, ajustado por el usuario arkojit1 sobre un conjunto de datos propio de manipulación con un brazo Franka Panda simulado en MuJoCo. No se trata de un modelo de lenguaje general, sino de un modelo de control que recibe observaciones visuales y de estado del robot y emite acciones de control a 50 Hz. El modelo resuelve una tarea concreta: apilar bloques ("red on yellow" y "yellow on red") a partir de instrucciones en lenguaje natural, con tres cámaras como entrada.

Arquitectónicamente hereda la estructura de π₀.₅: un backbone de visión-lenguaje (SigLIP para imagen y Gemma-2B para el componente lingüístico) congelado, más un "action expert" entrenable que genera secuencias de acciones mediante flow matching. Esta ficha es relevante para desarrolladores e investigadores que quieran evaluar el modelo como referencia de fine-tuning de VLA sobre hardware AMD (MI300X) y para entender el formato exacto de observaciones y acciones que espera en despliegue.

El checkpoint corresponde al paso 20.000 (15,3 épocas) de un entrenamiento de 20.000 pasos, con una pérdida de evaluación de 0,0170 sobre 24 episodios retenidos. Es un modelo de nicho, con cero descargas en el momento de la consulta, y debe cargarse con LeRobot 0.7.0 por un cambio en el formato del prompt de estado respecto a versiones anteriores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) π₀.₅: backbone SigLIP + Gemma-2B congelado + action expert entrenable con flow matching |
| Parámetros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (política de control; ventana de observación definida por el dataset, sin contexto textual extenso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles (las instrucciones del dataset están en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅, un VLA que combina un codificador visual SigLIP y un modelo de lenguaje Gemma-2B, ambos congelados durante el ajuste (`train_expert_only=true`), con un módulo "action expert" que se entrena para predecir secuencias de acciones mediante flow matching. La política emite chunks de 50 pasos de acción (1,0 s a 50 Hz), con `chunk_size=50` y `n_action_steps=50`. Las entradas visuales se asignan en el orden `observation.image.front` → `base_0_rgb`, `observation.image.wrist` → `left_wrist_0_rgb` y `observation.image.side` → `right_wrist_0_rgb`, con `empty_cameras=0`.

El ajuste se realizó con LeRobot 0.7.0 sobre el dataset `arkojit1/mj_stack_red_yellow_3cam` (revisión `a38bf81`): 200 episodios de apilamiento de bloques con Franka Panda en MuJoCo a 50 Hz, con 8 tareas de lenguaje (cuatro formulaciones de "red on yellow" y cuatro de "yellow on red", 25 episodios por tarea). El estado de observación es de 4 dimensiones (x, y, z del efector final más apertura de pinza) y la acción también de 4 dimensiones `[dx, dy, dz, gripper]` en el esquema `cartesian_pos`; no se usaron las columnas de orientación ni de delta articular, por lo que la política nunca comanda rotación. Se entrenó con 8 GPUs MI300X (8 por GPU, batch global 64), AdamW con LR pico 2,5e-5, betas (0,9; 0,95), weight decay 0,01, grad clip 1,0, schedule coseno con warmup de 666 pasos, suelo 2,5e-6, precisión bf16 y normalización por cuantiles q01–q99 para estado y acción. Sin aumento de datos. La división de evaluación retiene los últimos 3 episodios de cada una de las 8 tareas (24 de 200), entrenando con los 176 restantes.

## Capacidades

- Control robótico de manipulación: genera comandos cartesianos de traslación y apertura de pinza para un Franka Panda simulado.
- Seguimiento de instrucciones en lenguaje natural para tareas de apilamiento de bloques ("red on yellow", "yellow on red" con cuatro formulaciones cada una).
- Fusión multimodal de tres cámaras (frontal, muñeca y lateral) con observación de estado de 4 dimensiones.
- Predicción de chunks de acción de 50 pasos (1,0 s) mediante flow matching.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en el sentido de agentes de lenguaje; es una política de control de un solo paso de decisión por chunk.
- Capacidades multilingües: no disponibles; las instrucciones de entrenamiento están en inglés.
- No dispone de modo "thinking", visión general, audio ni otras capacidades fuera del control visomotor.

## Casos de uso

- Investigación en VLA sobre simulación: usar el checkpoint como referencia reproducible de fine-tuning de π₀.₅ sobre MuJoCo con Franka, comparando hiperparámetros y esquemas de acción.
- Apilamiento de bloques en entorno simulado: desplegar la política en el mismo entorno MuJoCo del dataset para evaluar el éxito de la tarea "red on yellow" y "yellow on red" con las tres cámaras.
- Transferencia sim-to-real exploratoria: servir como punto de partida para experimentos de adaptación de dominio, teniendo en cuenta que solo comanda traslación y pinza, sin rotación.
- Docencia y demostraciones de robótica: ilustrar un pipeline completo LeRobot (dataset, entrenamiento con action expert congelando el backbone, evaluación con pérdida de flow matching).
- Benchmarking de hardware AMD: referencia de entrenamiento con 8 × MI300X y batch global 64 para comparar throughput y estabilidad frente a configuraciones con GPUs NVIDIA.
- Estudio de esquemas de acción: analizar el efecto del esquema `cartesian_pos` de 4 dimensiones frente a esquemas con orientación o deltas articulares, dado que este modelo omite la rotación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta únicamente métricas del objetivo de entrenamiento:

| Métrica | Valor |
|---|---|
| Eval loss (flow matching, 24 episodios retenidos) | 0,0170 en el paso 20.000 |
| Train loss | 0,011 |
| Dispersión punto a punto (fase final) | ≈ ±0,001 |
| Épocas | 15,3 (1310,9 pasos por época) |
| Pasos totales | 20.000 |

El propio autor advierte que la eval loss es una métrica del objetivo de entrenamiento sobre 24 episodios retenidos y no una tasa de éxito de la tarea. No se proporcionan tasas de éxito ni comparaciones con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4,14 mil millones de parámetros y pesos en bf16 (repo de 9,4 GB) se requiere del orden de 8–10 GB solo para pesos, más overhead de activaciones y tres flujos de cámara; no confirmado por el autor.
- GPU recomendadas: el autor entrenó con 8 × AMD MI300X (8 muestras por GPU, batch global 64); para inferencia no se especifican GPU concretas.
- ¿Cabe en GPU de consumo? Probable en GPUs con ≥12–16 GB de VRAM en bf16, aunque no está verificado en la información disponible.
- Opciones de despliegue: LeRobot 0.7.0 con `PI05Policy.from_pretrained(...)`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de política).
- Latencia y throughput: no disponibles. El control opera a 50 Hz y emite chunks de 50 pasos (1,0 s), pero no se reportan tiempos de inferencia medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arkojit1/pi05_mjstack3cam_bs64_20k_20k | ≈4,14 mil millones | no disponible | eval loss 0,0170 (flow matching) | no disponible | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible en la información | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| Otras políticas VLA (p. ej. π₀, OpenVLA) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas de la misma categoría no está disponible en la información proporcionada; el único punto de referencia directo es el modelo base `lerobot/pi05_base` del que deriva.

## Limitaciones y advertencias

- La política solo comanda traslación (`dx, dy, dz`) y apertura de pinza; no comanda rotación, lo que limita tareas que requieran orientación del efector.
- Entrenada exclusivamente en simulación (MuJoCo, Franka Panda); el rendimiento en un robot real no está validado y probablemente requiera adaptación de dominio.
- La eval loss de 0,0170 no es una tasa de éxito; no hay evidencia publicada de éxito de la tarea.
- El autor indica que la eval loss seguía descendiendo lentamente al final del entrenamiento (≈0,018 entre los pasos 13.000 y 19.000), por lo que el modelo puede estar infraentrenado en el régimen de la tarea.
- Requiere LeRobot 0.7.0: el prompt de estado incluye solo las 4 dimensiones reales discretizadas, no rellenadas a 32 como en LeRobot 0.4.4; cargarlo con otra versión puede romper la inferencia.
- Las tres cámaras deben pasarse con los nombres exactos del dataset y en el orden indicado; un orden incorrecto altera la asignación de slots de imagen.
- Sesgos conocidos: no disponibles; el dataset es sintético y de una sola tarea, con 8 formulaciones lingüísticas en inglés.
- Riesgo de alucinación: no aplica en el sentido de texto generado, pero la política puede producir acciones no válidas fuera de la distribución del dataset.
- Licencia no disponible: no se puede confirmar el uso comercial; el modelo base `lerobot/pi05_base` tiene su propia licencia que debe verificarse.
- Sin descargas ni likes en el momento de la consulta; no hay validación comunitaria del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arkojit1/pi05_mjstack3cam_bs64_20k_20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de fine-tuning: https://huggingface.co/datasets/arkojit1/mj_stack_red_yellow_3cam
