# arkojit1/pi05_stack_yellow_on_red_bs128_7k_20k

## Resumen

π₀.₅ (pi05) es una política robótica de tipo vision-language-action (VLA) desarrollada originalmente por Physical Intelligence y publicada como modelo base por Hugging Face en el repositorio `lerobot/pi05_base`. Este repositorio concreto, `arkojit1/pi05_stack_yellow_on_red_bs128_7k_20k`, es un fine-tuning de ese modelo base realizado por el usuario arkojit1 mediante LeRobot 0.4.4 sobre un conjunto de 64 episodios de manipulación con un brazo Franka teleoperado con un dispositivo Haply. La tarea aprendida es única y muy concreta: apilar un bloque amarillo sobre un bloque rojo.

El modelo resuelve el problema de convertir observaciones visuales multimodales (tres cámaras: muñeca, escena 0 y escena 1) y un estado de 4 dimensiones en acciones de delta de efector final de 4 dimensiones, usando un esquema de flow matching. La arquitectura combina un codificador visual SigLIP congelado, un backbone de lenguaje Gemma-2B congelado y un "action expert" entrenable, sumando 3.616.757.520 parámetros totales según los pesos en safetensors (7,5 GB en el repositorio).

Es relevante como ejemplo de fine-tuning reproducible de un VLA de última generación sobre hardware de datación escasa (64 episodios) y como referencia de las decisiones de entrenamiento (batch 128, 20.000 pasos planificados, normalización por cuantiles, sin aumento de datos) documentadas por el autor. No obstante, se trata de un checkpoint intermedio (paso 7.000 de 20.000) con 0 descargas y sin métricas de éxito de tarea publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) con flow matching; codificador visual SigLIP + backbone Gemma-2B congelados + action expert entrenable |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (modelo de robótica; no se documentan capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅ de Physical Intelligence: un transformer multimodal en el que las imágenes se codifican con SigLIP y el texto/contexto con un backbone Gemma-2B, ambos congelados durante el fine-tuning (`train_expert_only=true`). Solo se entrena el "action expert", que genera secuencias de acciones mediante flow matching condicionado en las observaciones. Las tres entradas de imagen del modelo se rellenan en orden con las claves del dataset: `observation.images.wrist` ocupa el slot `base_0_rgb`, `observation.images.scene0` el slot `left_wrist_0_rgb` y `observation.images.scene1` el slot `right_wrist_0_rgb`.

El entrenamiento se realizó con LeRobot 0.4.4 sobre el dataset `Ameyapores/haply_stack_yellow_red` (revisión `cb14ebe`), compuesto por 64 episodios de Franka teleoperados con Haply, una única tarea ("Stack the yellow block on the red block."), estado de 4 dimensiones y acción de delta de efector final de 4 dimensiones. Se usaron 8 GPUs MI300X con 16 muestras por GPU (batch global 128), optimizador AdamW con LR pico 2,5e-5, betas (0,9, 0,95), weight decay 0,01, grad clip 1,0, schedule coseno con warmup de 666 pasos fijado a 20.000 pasos y suelo de 2,5e-6, precisión bf16, normalización por cuantiles (q01–q99) para estado y acción, sin aumento de datos, y `chunk_size`/`n_action_steps` de 50/50. El split de evaluación reserva los últimos 7 de los 64 episodios (57–63) y entrena con los episodios 0–56. Este checkpoint corresponde al paso 7.000 (29,4 épocas); el mejor eval del run fue 0,1568 en el paso 2.500 (10,5 épocas), y el paso 7.000 se eligió por petición, no por ser el óptimo.

## Capacidades

- Generación de acciones robóticas de efector final (delta de 4 dimensiones) condicionadas en observaciones visuales y estado proprioceptivo de 4 dimensiones.
- Percepción visual multimodal con tres cámaras simultáneas (muñeca, escena 0 y escena 1).
- Ejecución de una tarea de manipulación concreta: apilar un bloque amarillo sobre un bloque rojo.
- Predicción de secuencias de acciones en chunks de 50 pasos (`chunk_size=50`, `n_action_steps=50`).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso

- Investigación en aprendizaje por imitación con pocos datos: sirve como referencia reproducible de fine-tuning de π₀.₅ sobre 64 episodios, útil para estudiar el efecto del número de pasos y del batch en tareas de manipulación.
- Evaluación de políticas VLA en entornos Franka simulados o reales: el modelo puede desplegarse para medir tasas de éxito en la tarea de apilado y comparar con el modelo base sin fine-tuning.
- Reproducción de experimentos de teleoperación con Haply: el dataset y la configuración de entrenamiento documentados permiten replicar el pipeline completo en LeRobot 0.4.4.
- Estudio de la congelación selectiva de módulos: al entrenar solo el action expert con SigLIP y Gemma-2B congelados, es un caso práctico para analizar el coste/beneficio de esta estrategia en robótica.
- Base para fine-tuning adicional en tareas de apilado similares: al ser un checkpoint intermedio, puede servir como inicialización para otros datasets de bloques y colores.
- Docencia y divulgación sobre VLA: la model card detalla hiperparámetros, split de evaluación y claves de cámara, lo que facilita explicar el flujo completo de entrenamiento de una política visomotora.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor reporta únicamente métricas del objetivo de entrenamiento: eval loss de 0,1662 en el paso 7.000 sobre 7 episodios reservados, train loss de 0,085, y un mínimo de eval de 0,1568 en el paso 2.500. El propio autor advierte que la eval loss no es una tasa de éxito de tarea y que diferencias de unas milésimas están dentro del ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3.616.757.520 parámetros en bf16/fp16 se requieren aproximadamente 7,2 GB solo para pesos, más memoria para activaciones y las tres cámaras de entrada.
- GPU recomendadas: el entrenamiento se realizó en 8 × AMD MI300X; para inferencia no se documentan GPU concretas.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño de pesos podría caber en GPUs con 12–16 GB o más, pero no hay validación publicada.
- Opciones de despliegue: LeRobot 0.4.4 con el fork de `transformers` de Hugging Face para π₀ (rama `fix/lerobot_openpi`), cargando mediante `PI05Policy.from_pretrained`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arkojit1/pi05_stack_yellow_on_red_bs128_7k_20k | 3.616.757.520 | no disponible | Apilado de bloques (Franka) | no disponible | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible en la informacion | no disponible | VLA base multi-tarea | no disponible | Hugging Face (modelo base) |
| Otros fine-tunings de pi05 sobre el mismo dataset | no disponible | no disponible | Apilado de bloques | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 7.000 de 20.000 planificados y no es el de menor eval loss del run (0,1568 en el paso 2.500).
- Eval loss no equivale a tasa de éxito: el autor lo advierte explícitamente; no hay métricas de éxito de tarea publicadas.
- Dataset muy pequeño: 64 episodios, una sola tarea y un solo entorno; la generalización a otras tareas, objetos o configuraciones de cámara es muy limitada.
- Dependencia estricta de las claves de cámara: es obligatorio pasar `observation.images.wrist`, `observation.images.scene0` y `observation.images.scene1` en ese orden; un renombrado incorrecto rompe la correspondencia con los slots preentrenados.
- Requiere LeRobot 0.4.4 y el fork de `transformers` para π₀ (rama `fix/lerobot_openpi`); no funciona con instalaciones estándar sin ese fork.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Sin datos de sesgos, alucinación o limitaciones idiomáticas: al ser un modelo de robótica, estos riesgos se trasladan a fallos de política (acciones incorrectas) más que a generación de texto.
- Sin descargas ni validación comunitaria: 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arkojit1/pi05_stack_yellow_on_red_bs128_7k_20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de fine-tuning: https://huggingface.co/datasets/Ameyapores/haply_stack_yellow_red
- LeRobot (librería): https://github.com/huggingface/lerobot
