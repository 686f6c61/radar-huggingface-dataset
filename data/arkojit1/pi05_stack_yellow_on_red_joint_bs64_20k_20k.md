# arkojit1/pi05_stack_yellow_on_red_joint_bs64_20k_20k

## Resumen

π₀.₅ (pi05) es una política robótica de tipo vision-language-action (VLA) desarrollada originalmente por Physical Intelligence y publicada como modelo base por el equipo de LeRobot en Hugging Face (`lerobot/pi05_base`). Este repositorio concreto es un ajuste fino (fine-tuning) de ese modelo base realizado por el usuario `arkojit1` sobre un conjunto de datos propio de manipulación robótica con un brazo Franka, recogido mediante teleoperación con un dispositivo Haply. El modelo resuelve una tarea única y específica: apilar un objeto amarillo sobre uno rojo en el espacio de articulaciones (joint space).

El ajuste se llevó a cabo con LeRobot 0.4.4 durante 20.000 pasos (26 épocas sobre 100 episodios de entrenamiento) con un batch global de 64, repartido en 8 GPUs AMD MI300X. Solo se entrenó el "action expert" del modelo, manteniendo congelados los codificadores visuales SigLIP y el backbone de lenguaje Gemma-2B. El checkpoint final presenta una pérdida de evaluación (flow-matching) de 0,1089 sobre 12 episodios retenidos.

Es relevante como ejemplo práctico de cómo adaptar un VLA de propósito general a una tarea industrial o de laboratorio concreta con un presupuesto de cómputo moderado, y de cómo LeRobot estandariza el pipeline de entrenamiento y despliegue de políticas robóticas. No obstante, se trata de un modelo altamente especializado, sin datos de éxito de tarea publicados y sin licencia declarada, por lo que su valor es fundamentalmente experimental y de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) π₀.₅: codificador visual SigLIP + backbone de lenguaje Gemma-2B + action expert con flow matching |
| Parametros totales | 3.616.757.520 (~3,6 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible (el modelo base incluye Gemma-2B, pero la tarea es robótica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅, un VLA que combina un codificador de imágenes SigLIP, un backbone de lenguaje Gemma-2B y un "action expert" que genera secuencias de acciones mediante flow matching. En este ajuste fino, solo se entrenó el action expert (`train_expert_only=true`), mientras que SigLIP y Gemma-2B permanecieron congelados. La política recibe tres cámaras (`observation.images.wrist`, `observation.images.scene0`, `observation.images.scene1`) y un estado de 8 dimensiones (ángulos articulares absolutos `joint_0..6` más apertura del gripper), y produce un chunk de 50 acciones de 8 dimensiones: deltas articulares por paso más el objetivo absoluto del gripper.

El entrenamiento se realizó sobre el dataset `Ameyapores/haply_stack_yellow_red_joint_delta`, compuesto por 112 episodios de un brazo Franka teleoperado con Haply, de los cuales se usaron 100 para entrenamiento (episodios 0-99) y 12 para evaluación (100-111). Se empleó AdamW con LR pico de 2,5e-5, betas (0,9; 0,95), weight decay 0,01, recorte de gradiente 1,0, schedule coseno con warmup de 666 pasos y precisión bf16. La normalización fue por cuantiles (q01-q99) para estado y acción, sin aumento de datos. El chunk de acción es de 50 pasos con `n_action_steps=50`.

## Capacidades

- Generación de acciones robóticas de manipulación en espacio de articulaciones para un brazo Franka de 7 grados de libertad más gripper.
- Percepción visual multimodal a partir de tres cámaras simultáneas (muñeca y dos cámaras de escena).
- Ejecución de una tarea concreta: apilar un objeto amarillo sobre uno rojo.
- Predicción de chunks de 50 acciones consecutivas, lo que permite control a frecuencia relativamente baja sin replanificación por paso.
- Condicionamiento por estado articular absoluto (8-D) y producción de deltas articulares más objetivo absoluto de gripper.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo en la información disponible.
- No se documentan modos de "thinking", visión general, audio ni otras capacidades más allá de la política robótica.

## Casos de uso

- Automatización de una celda de apilado en laboratorio: el modelo puede controlar un Franka para apilar piezas amarillas sobre rojas en un entorno controlado, sirviendo como base para tareas de pick-and-place repetitivas.
- Prototipado de políticas VLA en investigación: útil para estudiar cómo se comporta π₀.₅ con fine-tuning mínimo (solo action expert) sobre un dataset pequeño de 112 episodios.
- Benchmark interno de pipelines LeRobot: sirve como referencia para validar la cadena de entrenamiento y despliegue de LeRobot 0.4.4 con el fork de transformers para π₀.
- Recolección de datos con teleoperación Haply: el modelo documenta un flujo completo desde teleoperación hasta política desplegable, útil para equipos que quieran replicar el proceso.
- Evaluación de generalización con múltiples cámaras: al usar tres vistas (muñeca, scene0, scene1), permite estudiar la contribución de cada cámara en tareas de manipulación fina.
- Base para ajustes posteriores en espacio de articulaciones: otros equipos pueden partir de este checkpoint para tareas de apilado similares con el mismo robot y configuración de cámaras.
- Docencia y demostraciones: ejemplo didáctico de fine-tuning de un VLA con presupuesto de cómputo acotado (8 GPUs MI300X, 20k pasos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de un modelo robótico y no de lenguaje. El autor reporta únicamente métricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Eval loss (flow matching, 12 episodios retenidos) | 0,1089 en el paso 20.000 |
| Mejor eval loss del run | 0,0984 en el paso 4.000 (5,2 épocas) |
| Train loss | 0,078 |
| Dispersión punto a punto del eval loss | ±0,01 |
| Épocas | 26,0 (768,8 pasos por época) |

El propio autor advierte que la eval loss es una métrica del objetivo de entrenamiento, no una tasa de éxito de tarea, y que no es comparable con los modelos de apilado en espacio de deltas del efector final (`pi05_stack_yellow_on_red_*`), cuya normalización y espacio de acciones difieren.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~3,6 mil millones de parámetros en bf16, el peso ronda los 7,2 GB, por lo que se necesitan al menos ~8-10 GB de VRAM solo para los pesos, más overhead de activaciones y cámaras.
- GPU recomendadas: el entrenamiento se realizó en 8 × AMD MI300X (8 por GPU, batch global 64). Para inferencia, una GPU con ≥16 GB de VRAM (RTX 4090, A100, H100) es un punto de partida razonable, aunque no se documenta oficialmente.
- ¿Cabe en GPU de consumo? Probablemente sí en tarjetas con ≥16 GB (RTX 4080/4090, RTX A5000), pero no está confirmado en la información disponible.
- Opciones de despliegue: LeRobot 0.4.4 con el fork de `transformers` de Hugging Face para π₀ (rama `fix/lerobot_openpi`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a LLMs, no a políticas VLA).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arkojit1/pi05_stack_yellow_on_red_joint_bs64_20k_20k | ~3,6 B | no disponible | Apilado amarillo sobre rojo, espacio de articulaciones, Franka | no disponible | Hugging Face (0 descargas, 0 likes) |
| lerobot/pi05_base | no disponible en la información | no disponible | VLA base de propósito general | no disponible | Hugging Face (modelo base) |
| pi05_stack_yellow_on_red_* (variantes en espacio de deltas del efector final) | no disponible | no disponible | Apilado en espacio de deltas del efector final | no disponible | Hugging Face (mencionados por el autor) |

No se dispone de datos de rendimiento comparables entre estas variantes; el propio autor indica que las eval loss no son comparables entre espacios de acción distintos.

## Limitaciones y advertencias

- Modelo altamente especializado: solo realiza la tarea de apilar amarillo sobre rojo con la configuración exacta de robot, cámaras y espacio de acciones del dataset.
- Sin tasa de éxito de tarea publicada: la eval loss (0,1089) no equivale a éxito en el mundo real; el mejor checkpoint del run fue el paso 4.000 (0,0984), y el paso 20.000 se eligió "por petición", no por ser el mejor.
- Dataset pequeño: 112 episodios, 1 tarea, un solo operador con dispositivo Haply; riesgo alto de sobreajuste y baja generalización a otras condiciones de iluminación, objetos o posiciones.
- Dependencia estricta del orden y nombres de las cámaras (`wrist`, `scene0`, `scene1`) y del espacio de acciones (deltas articulares más gripper absoluto); un uso incorrecto invalida las predicciones.
- Licencia no declarada: no se puede asumir uso comercial; hay que contactar con el autor o consultar el modelo base.
- Requiere LeRobot 0.4.4 y un fork específico de `transformers`; la compatibilidad con versiones futuras no está garantizada.
- Sin datos de sesgos, alucinación o multilingüismo relevantes para robótica, pero al heredar Gemma-2B podría arrastrar sesgos del backbone de lenguaje, aunque su uso aquí es principalmente como condicionamiento.
- Sin cuantizaciones publicadas ni soporte documentado para despliegue en herramientas estándar de LLM; el despliegue en producción requeriría validación adicional.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni reportes independientes de funcionamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arkojit1/pi05_stack_yellow_on_red_joint_bs64_20k_20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Ameyapores/haply_stack_yellow_red_joint_delta
- LeRobot (librería): https://github.com/huggingface/lerobot
- Fork de transformers para π₀ (rama `fix/lerobot_openpi`): no disponible como enlace directo en la información proporcionada
