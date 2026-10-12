# seelanrohan/blackRectHandoff_pi05_4

## Resumen

pi05 (Pi0.5) es una política de vision-language-action (VLA) para control robótico entrenada sobre el framework LeRobot de HuggingFace. El modelo aquí publicado, seelanrohan/blackRectHandoff_pi05_4, es un fine-tuning concreto del checkpoint base lerobot/pi05_base orientado a una tarea de manipulación bimanual: la transferencia de un objeto rectangular negro entre dos brazos robóticos (handoff). No se trata de un modelo de lenguaje general, sino de un modelo de acción que consume observaciones visuales y estado del robot y produce secuencias de acciones motoras.

La arquitectura combina un backbone de visión-lenguaje PaliGemma con variante Gemma 2B (campo `paligemma_variant: gemma_2b`) y un "action expert" basado en Gemma de 300M de parámetros (campo `action_expert_variant: gemma_300m`). El entrenamiento se realizó durante 65k pasos con batch_size 16, optimizador AdamW (lr=2.5e-5) y un scheduler cosine decay con warmup de 1000 pasos. El dataset combina seis conjuntos de demostraciones de teleoperación y datos de intervención humana (HIL) segmentados a resolución 384.

El modelo es relevante en el contexto de la robótica open source porque reutiliza el pipeline LeRobot y el checkpoint base pi05, lo que permite reproducir el entrenamiento de políticas VLA con recursos relativamente modestos. Con 0 descargas y 0 likes en el momento de la consulta, es un artefacto experimental de un autor individual más que un modelo de referencia ampliamente adoptado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); backbone PaliGemma (Gemma 2B) + action expert Gemma 300M |
| Parametros totales | Aproximadamente 2,3 mil millones (2B backbone + 300M action expert, segun configuracion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tokenizer_max_length=200 en la configuracion de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (dtype bfloat16) |

## Arquitectura y entrenamiento

pi05 es una política de acción de tipo flow matching construida sobre un backbone de visión-lenguaje PaliGemma con variante Gemma 2B. A este backbone se le añade un "action expert" de 300M de parámetros que genera las acciones motoras. Los parámetros clave de inferencia son: `num_inference_steps=10` (diez pasos de integración del flujo), `chunk_size=50`, `n_action_steps=50`, `n_obs_steps=1`, `max_action_dim=32` y `max_state_dim=32`. La imagen de entrada se procesa a resolución 224x224 y existe un mecanismo `max_period`/`min_period` (4.0 y 0.004) y un muestreo temporal con parámetros beta (alpha=1.5, beta=1.0, offset=0.001, scale=0.999). El entrenamiento usa `gradient_checkpointing=True` y dtype bfloat16, con `compile_mode: max-autotune` aunque `compile_model=False`.

El entrenamiento se hizo partiendo del checkpoint `lerobot/pi05_base` durante 65k pasos, con batch_size 16, AdamW (lr=2.5e-5, betas 0.9/0.95, weight_decay 0.01, grad_clip_norm 1.0) y un scheduler cosine decay con 1000 pasos de warmup que decae hasta 2.5e-6 en 56000 pasos. Los datos provienen de seis repositorios: `black_rectangular_object_two_arm_handoff_1_384`, `_2_384`, `_3_384`, `dagger_2_hil_segmented_384`, `dagger_4_hil_segmented_384` y `dagger_5_hil_segmented_384`. Los tres primeros son demostraciones de la tarea de handoff bimanual y los tres últimos son datos DAgger con intervención humana (HIL) segmentados, lo que indica un ciclo de aprendizaje por corrección. El pipeline de datos aplica aumentos de imagen (RandomAffine ±5 grados y ±0.05 de traslación, ColorJitter de brillo, contraste, tono y saturación, y SharpnessJitter) con hasta tres transformaciones aleatorias. La normalización de ACTION y STATE usa cuantiles y la VISUAL es identidad.

## Capacidades

- Generación de secuencias de acciones motoras para control robótico (chunks de hasta 50 acciones).
- Control bimanual, incluyendo tareas de transferencia (handoff) de objetos entre dos brazos.
- Condicionamiento por instrucciones en lenguaje natural a través del backbone de visión-lenguaje (longitud máxima de tokenización 200).
- Percepción visual a 224x224 con soporte de múltiples cámaras (`empty_cameras=0`, número de cámaras no especificado).
- Soporte de estado del robot hasta 32 dimensiones (`max_state_dim=32`) y acciones hasta 32 dimensiones (`max_action_dim=32`).
- Inferencia por flow matching con 10 pasos de integración.
- Soporte de entrenamiento con intervención humana (DAgger) reflejado en el dataset, aunque no es una capacidad de inferencia.
- Tool calling / function calling: no aplica (no es un modelo de lenguaje conversacional).
- Soporte de agentes y multi-step reasoning: no aplica.
- Capacidades multilingües: no disponible.

## Casos de uso

- Automatización de manipulación bimanual en laboratorio: el modelo ejecuta políticas de handoff de objetos rectangulares entre dos brazos, útil como base reutilizable para tareas de ensamblaje o clasificación donde intervengan dos efectores.
- Investigación en aprendizaje por imitación: sirve como punto de partida para experimentar con el pipeline LeRobot y comparar estrategias de fine-tuning sobre pi05 base.
- Aprendizaje por corrección (DAgger): los datos HIL segmentados del entrenamiento hacen que el modelo sea un caso de estudio para políticas entrenadas con intervenciones humanas correctivas.
- Prototipado de políticas VLA en robótica de investigación: el tamaño (~2,3B) y el uso de bfloat16 permiten desplegar el modelo en hardware asequible para pruebas de concepto.
- Benchmark interno de tareas de transferencia: puede usarse como referencia para medir tasas de éxito en tareas de handoff bimanual en entornos controlados.
- Generación de datos sintéticos de acciones iniciales: las secuencias de 50 acciones pueden servir para inicializar controladores o como warm-start en otros entrenamientos.
- Evaluación de robustez ante aumentos de imagen: dado que el entrenamiento usó jitter fotométrico y geométrico agresivo, es apropiado para estudiar robustez ante variaciones de iluminación y posición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de tasa de éxito, retorno medio ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB en bfloat16 para el modelo base (~2,3B parámetros); el repositorio ocupa 122,5 GB porque incluye checkpoints intermedios (guardados cada 14k pasos) con estados del optimizador.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB) es suficiente para inferencia; para reentrenamiento se recomienda A100 40/80 GB o H100.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8-12 GB de VRAM para inferencia en bfloat16 o con cuantización.
- Opciones de despliegue: el modelo está integrado en el ecosistema LeRobot de HuggingFace; el formato safetensors permite cargarlo con las utilidades de LeRobot o con PyTorch. No se documentan despliegues en vLLM, llama.cpp, Ollama o TGI (orientados a LLM de texto, no a políticas VLA).
- Latencia y throughput estimados: no disponible. La inferencia usa 10 pasos de flow matching y n_action_steps=50.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / accion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| seelanrohan/blackRectHandoff_pi05_4 | VLA (pi05) fine-tune | ~2,3B | chunk de 50 acciones, img 224x224 | no disponible | HuggingFace (0 descargas) |
| lerobot/pi05_base | VLA (pi05) base | ~2,3B | no disponible | no disponible | HuggingFace |
| pi0 / pi05 de Physical Intelligence | VLA | ~3B (pi0 original) | no disponible | no disponible | publicaciones de Physical Intelligence |

No se dispone de datos cuantitativos (tasas de éxito, retorno) para establecer una comparación objetiva con alternativas. La model card no ofrece métricas comparativas y la búsqueda web no devolvió información relevante sobre este modelo.

## Limitaciones y advertencias

- La licencia no está especificada (`license: None` en la configuración y campo vacío en HuggingFace), por lo que no se puede confirmar que sea apto para uso comercial.
- Es un modelo específico de tarea: entrenado únicamente para el handoff bimanual de un objeto rectangular negro. No generaliza a otras tareas fuera de esa distribución.
- El autor no ha publicado métricas de evaluación (evaluación desactivada, `eval_freq=0`), por lo que se desconoce su tasa de éxito real.
- Riesgo elevado de fallo ante variaciones del entorno no vistas: posiciones, iluminación, geometría del objeto o número de cámaras distintos de los del dataset.
- No hay información sobre sesgos, composición demográfica del dataset ni idiomas soportados más allá de las instrucciones de tarea.
- Puede presentar alucinación de acciones o comportamiento errático fuera de distribución, especialmente con observaciones visuales degradadas.
- No es un modelo de lenguaje: no debe usarse para generación de texto, razonamiento, código o diálogo.
- El repositorio de 122,5 GB puede dificultar la descarga y el almacenamiento; conviene seleccionar únicamente el checkpoint final si no se necesita el historial.
- La fecha de creación indicada (2026-10-11) es posterior a la fecha actual, lo que sugiere un error de metadatos que conviene verificar.

## Enlaces

- HuggingFace: https://huggingface.co/seelanrohan/blackRectHandoff_pi05_4
- Checkpoint base: lerobot/pi05_base
- Framework LeRobot: https://github.com/huggingface/lerobot
- Datasets de entrenamiento: black_rectangular_object_two_arm_handoff_1_384, black_rectangular_object_two_arm_handoff_2_384, black_rectangular_object_two_arm_handoff_3_384, dagger_2_hil_segmented_384, dagger_4_hil_segmented_384, dagger_5_hil_segmented_384
- Búsqueda web: los resultados devueltos (elvebredd.com, adoptmetradingvalues.com, amvgg.com) no guardan relación con el modelo y se descartan como fuentes.
