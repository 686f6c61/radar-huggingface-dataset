# arkojit1/pi05_stack_yellow_on_red_joint_bs64_10k_20k

## Resumen

El modelo `arkojit1/pi05_stack_yellow_on_red_joint_bs64_10k_20k` es un ajuste fino de `lerobot/pi05_base`, la política robótica π₀.₅ desarrollada por Physical Intelligence y publicada a través del ecosistema LeRobot de Hugging Face. Se trata de un modelo de visión-lenguaje-acción (VLA) especializado en una única tarea de manipulación robótica: apilar un objeto amarillo sobre uno rojo con un brazo Franka, operando en espacio de articulaciones (joint space). El autor del ajuste es el usuario `arkojit1` y el checkpoint corresponde al paso 10.000 de un entrenamiento planificado de 20.000 pasos.

La arquitectura subyacente combina un codificador visual SigLIP con un backbone de lenguaje Gemma-2B y un "action expert" entrenable que genera secuencias de acciones mediante flow matching. El ajuste congela SigLIP y Gemma-2B y entrena únicamente el experto de acción, con un total de 3.616.757.520 parámetros en los pesos publicados en safetensors. El modelo consume tres cámaras (muñeca, escena 0 y escena 1) y un estado de 8 dimensiones (7 ángulos articulares absolutos más apertura de pinza), y produce chunks de 50 acciones de deltas articulares.

Su relevancia es acotada: no es un modelo de propósito general, sino un artefacto de investigación reproducible que documenta con detalle el proceso de ajuste (hardware, hiperparámetros, splits, pérdidas) sobre un dataset concreto de 112 episodios de teleoperación con dispositivo Haply. Resulta útil como referencia metodológica para quien entrene políticas VLA con LeRobot y como ejemplo de checkpoint intermedio con evaluación explícita frente al mejor paso del run.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA): SigLIP + Gemma-2B + action expert con flow matching (π₀.₅) |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (modelo de robótica, no orientado a texto multilingüe) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base (revision a538eb27) |
| Dataset de ajuste | Ameyapores/haply_stack_yellow_red_joint_delta (revision dd50a45) |
| Entradas | observation.state (8-D), observation.images.wrist, observation.images.scene0, observation.images.scene1 |
| Salidas | chunk de 50 acciones de 8-D (deltas articulares + pinza) |
| Chunk size / n_action_steps | 50 / 50 |
| Libreria requerida | LeRobot 0.4.4 + fork de transformers (branch fix/lerobot_openpi) |
| Tamano del repo | 7,5 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura π₀.₅: un codificador visual SigLIP procesa tres imágenes (muñeca, escena 0 y escena 1, mapeadas a los slots `base_0_rgb`, `left_wrist_0_rgb` y `right_wrist_0_rgb` del modelo base), un backbone de lenguaje Gemma-2B aporta la representación semántica y un action expert genera las acciones mediante flow matching. En este ajuste se aplica `train_expert_only=true`, de modo que SigLIP y Gemma-2B permanecen congelados y solo se actualiza el experto de acción. La normalización es por cuantiles (q01–q99) tanto para el estado como para la acción, y el modelo produce chunks de 50 pasos aplicados en su totalidad (`n_action_steps=50`).

El entrenamiento se realizó con LeRobot 0.4.4 sobre 112 episodios de Franka recogidos con teleoperación Haply, con un único task y en espacio de articulaciones. Se usaron 8 GPUs MI300X con batch global de 64, optimizador AdamW (LR pico 2,5e-5, betas 0,9/0,95, weight decay 0,01, grad clip 1,0), schedule coseno con warmup de 666 pasos fijado a 20.000 pasos totales y precisión bf16. Sin aumentación de datos. El split de evaluación reserva los últimos 12 episodios (100–111) y entrena con los 100 primeros. El checkpoint publicado corresponde al paso 10.000 (13,0 épocas de las 26,0 planificadas); el mejor eval del run fue 0,0984 en el paso 4.000 (5,2 épocas). La pérdida de evaluación en este paso es 0,1065 (flow-matching sobre episodios retenidos) y la de entrenamiento 0,083.

## Capacidades

- Manipulación robótica de una sola tarea: apilar un objeto amarillo sobre uno rojo con un brazo Franka en espacio de articulaciones.
- Generación de secuencias de acción de 50 pasos a partir de observaciones multimodales (tres cámaras + estado de 8-D).
- Control en espacio de articulaciones con deltas articulares por paso y objetivo absoluto de pinza (0–1).
- Percepción visual multi-cámara: integra vista de muñeca y dos vistas de escena.
- Condicionamiento por instrucción de lenguaje (una única tarea en el dataset de ajuste).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de agentes de software.
- No es un modelo de texto general: no debe usarse para generación de lenguaje, código o matemáticas.
- Capacidades multilingües: no aplicables (no disponible).

## Casos de uso

- Reproducción de experimentos de apilamiento en Franka: sirve como checkpoint de referencia para comparar el efecto del número de pasos de entrenamiento (10.000 frente al mejor eval en 4.000) sobre la pérdida de flow matching en episodios retenidos.
- Investigación en ajuste de políticas VLA: permite estudiar el régimen `train_expert_only` con backbone congelado y su impacto en la convergencia frente a ajustes completos.
- Evaluación de espacio de acción: útil para comparar políticas en espacio de articulaciones (este modelo) frente a las variantes en deltas de efector final (`pi05_stack_yellow_on_red_*`), siempre teniendo en cuenta que las pérdidas no son directamente comparables.
- Docencia y divulgación: ejemplo reproducible de pipeline LeRobot 0.4.4 con dataset público, hiperparámetros documentados y split de evaluación explícito.
- Base para nuevos ajustes: punto de partida para fine-tuning sobre tareas de apilamiento similares con el mismo esquema de observación y acción.
- Validación de infraestructura: útil para probar despliegues de inferencia de π₀.₅ en hardware AMD MI300X o GPUs equivalentes con el fork de transformers requerido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta métricas de entrenamiento y evaluación interna:

| Metrica | Valor |
|---|---|
| Eval loss (flow matching, 12 episodios retenidos, paso 10.000) | 0,1065 |
| Train loss (paso 10.000) | 0,083 |
| Mejor eval loss del run | 0,0984 (paso 4.000, 5,2 epocas) |
| Dispersion punto a punto del eval | ±0,01 aprox. |
| Tasa de exito de tarea | no disponible |

El propio autor advierte que la eval loss es un número del objetivo de entrenamiento sobre 12 episodios retenidos y no una tasa de éxito, y que no es comparable con los modelos de apilamiento en deltas de efector final por diferencias de espacio de acción y normalización.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 3,62 mil millones de parámetros, en bf16 los pesos ocupan aproximadamente 7,2 GB, por lo que se necesita margen adicional para activaciones y las tres imágenes de entrada.
- GPU recomendadas: el autor entrenó con 8 × AMD MI300X (8 por GPU, batch global 64). Para inferencia no documenta GPU específicas.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 12–16 GB o más en bf16, aunque el autor no lo confirma ni publica cifras de latencia.
- Opciones de despliegue: LeRobot 0.4.4 con el fork de `transformers` de Hugging Face (branch `fix/lerobot_openpi`), cargando `PI05Policy.from_pretrained`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Espacio de accion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arkojit1/pi05_stack_yellow_on_red_joint_bs64_10k_20k | 3.616.757.520 | no disponible | Articulaciones (deltas + pinza) | no disponible | Hugging Face (0 descargas) |
| lerobot/pi05_base | no disponible en la informacion | no disponible | Base π₀.₅ (multitarea) | no disponible | Hugging Face (modelo base) |
| pi05_stack_yellow_on_red_* (variantes del autor en deltas de efector final) | no disponible | no disponible | Deltas de efector final | no disponible | Hugging Face (mencionadas en la model card) |

No se dispone de datos de benchmarks ni de parámetros de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Modelo de una sola tarea: entrenado exclusivamente para apilar amarillo sobre rojo; no generaliza a otras tareas ni objetos.
- Eval loss no equivale a tasa de éxito: el 0,1065 es pérdida de flow matching sobre 12 episodios retenidos, con dispersión de ±0,01, y no mide éxito de la tarea.
- Checkpoint intermedio: corresponde al paso 10.000 de 20.000; el mejor eval del run fue en el paso 4.000, por lo que este checkpoint no es necesariamente el de mejor rendimiento.
- Incompatibilidad de comparación: no es comparable con las variantes en deltas de efector final por diferencias de espacio de acción y normalización.
- Dependencia estricta de versiones: requiere LeRobot 0.4.4 y el fork de `transformers` en la branch `fix/lerobot_openpi`; otras versiones pueden fallar al cargar.
- Mapeo de cámaras crítico: las tres cámaras deben pasarse con sus nombres de dataset (`observation.images.wrist`, `scene0`, `scene1`) en el orden que espera π₀.₅; un mapeo incorrecto invalida la política.
- Deltas articulares: las acciones son deltas tal como se almacenaron en el dataset y deben aplicarse de la misma forma en despliegue; un escalado distinto rompe el control.
- Licencia no disponible: no se puede confirmar el uso comercial; el modelo base y el dataset tienen sus propias condiciones que deben verificarse.
- Sin datos de sesgos, alucinación o cobertura lingüística: no aplicables o no disponibles para un modelo de robótica de tarea única.
- Advertencia de producción: sin tasa de éxito publicada ni validación en hardware real documentada, no se recomienda su uso en entornos de producción sin evaluación propia.
- Dataset pequeño: 112 episodios de una sola tarea limitan la robustez ante variaciones de iluminación, posiciones iniciales u objetos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arkojit1/pi05_stack_yellow_on_red_joint_bs64_10k_20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de ajuste: https://huggingface.co/datasets/Ameyapores/haply_stack_yellow_red_joint_delta
- LeRobot (libreria): https://github.com/huggingface/lerobot
- Fork de transformers para π₀ (branch `fix/lerobot_openpi`): no disponible como enlace directo en la informacion proporcionada
