# Bigwaverobotics/lerobot_ship_big_box

## Resumen

`lerobot_ship_big_box` es una política de imitación para robótica industrial entrenada con el framework LeRobot de Hugging Face. Implementa la arquitectura ACT (Action Chunking with Transformers), un modelo de aprendizaje por imitación que predice secuencias de acciones motoras a partir de observaciones visuales. El checkpoint está especializado en la tarea de manipulación y empaquetado de cajas grandes en un escenario industrial, dentro de una serie de políticas encadenadas (pick, place, pack, lift, ship) que cubren el flujo completo de una línea de empaquetado.

El modelo lo publica la organización Bigwaverobotics y tiene 51,6 millones de parámetros, con un backbone visual ResNet-18 y un decoder transformer que genera chunks de 50 acciones. Está pensado para controlar un brazo robótico de forma autónoma en tareas repetitivas de logística, sustituyendo la programación explícita de trayectorias por una política aprendida a partir de demostraciones humanas.

Su relevancia radica en que ejemplifica el patrón actual de robótica open source: políticas ligeras (menos de 200 MB en safetensors) entrenadas con datasets de teleoperación y publicadas con licencia Apache-2.0, lo que permite desplegarlas en hardware de consumo y adaptarlas a nuevas tareas con relativamente pocas demostraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone visual ResNet-18 |
| Parametros totales | 51.637.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (n_obs_steps = 1; chunk de 50 acciones) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors de precisión completa) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, ~197 MiB) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un modelo de aprendizaje por imitación supervisado que combina un codificador visual (ResNet-18 en este caso) con un transformer encoder-decoder que predice un chunk de 50 acciones futuras de golpe, en lugar de una acción por paso. Esta estrategia de *action chunking* reduce el error de acumulación y mejora la estabilidad del control en tareas de manipulación. La configuración registrada indica `n_obs_steps: 1` (una sola observación de entrada), `chunk_size: 50` y `policy_n_action_steps: 50`, es decir, el modelo ejecuta el chunk completo antes de volver a inferir.

El entrenamiento se realizó sobre el dataset `itdevhumanoid/lerobot_ship_big_box_dataset` (y una referencia interna `bwr/dataset_21406` en la configuración de entrenamiento), compuesto por demostraciones de teleoperación de la tarea de empaquetado de cajas. No se especifican en la información disponible el número de episodios, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos o regularización adicionales. El checkpoint se publica con los procesadores de normalización y desnormalización de observaciones y acciones incluidos en el repo.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones de 50 pasos a partir de una única observación visual.
- Percepción visual: utiliza un backbone ResNet-18 para procesar imágenes del entorno de trabajo.
- Manipulación industrial: especializado en la tarea de recogida y empaquetado de cajas grandes en un contexto de línea de producción.
- Ejecución autónoma de políticas: integrable en bucles de control con LeRobot para operar un brazo robótico sin programación explícita de trayectorias.
- Capacidades de lenguaje, tool calling, agentes, razonamiento multi-step, visión general o audio: no disponibles (no son el propósito del modelo).

## Casos de uso

- Empaquetado automatizado en línea de producción: la política ejecuta la secuencia completa de recogida y colocación de cajas grandes, con chunks de 50 acciones que reducen la latencia de inferencia y el jitter del control.
- Prototipado rápido de celdas robóticas: al ser un checkpoint ligero (197 MiB) con licencia Apache-2.0, permite validar una tarea de manipulación en un banco de pruebas antes de invertir en programación tradicional.
- Base para fine-tuning en variantes de la tarea: el modelo puede reentrenarse con el dataset propio de una planta para adaptar la política a tamaños de caja, posiciones o utillajes distintos.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible de una política ACT entrenada con LeRobot para comparar hiperparámetros, chunk sizes o backbones visuales.
- Integración en pipelines de robótica con LeRobot: carga mediante `ACTPolicy.from_pretrained` y se despliega en el mismo stack que el resto de políticas de la serie (pick, place, pack, lift, ship) para orquestar un flujo completo.
- Formación y demos: al ser un modelo pequeño y de código abierto, es adecuado para laboratorios y cursos que quieran mostrar el ciclo completo de teleoperación, entrenamiento y despliegue de una política robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (51,6 M de parámetros más el backbone ResNet-18); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes, aunque para esta carga las consumer son más que adecuadas.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: LeRobot (`ACTPolicy.from_pretrained`), PyTorch nativo; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de política).
- Latencia y throughput estimados: no disponibles en la información proporcionada; el chunk de 50 acciones amortigua la frecuencia de inferencia, pero no se publican cifras de latencia por chunk.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|
| lerobot_ship_big_box (ACT) | 51,6 M | chunk de 50 acciones, 1 obs step | Apache-2.0 | Hugging Face |
| Otras políticas ACT de LeRobot (p. ej. ALOHA/ACT originales) | del orden de decenas de millones | chunk configurable | MIT / Apache-2.0 según checkpoint | Hugging Face / GitHub |
| Políticas basadas en Diffusion Policy (LeRobot) | variable, típicamente mayor | horizonte de acciones configurable | MIT / Apache-2.0 según checkpoint | Hugging Face / GitHub |
| Políticas VLA (p. ej. OpenVLA) | miles de millones | contexto multimodal amplio | según modelo | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada para una única tarea (empaquetado de cajas grandes) y un entorno concreto; no generaliza a otras tareas sin reentrenamiento o fine-tuning.
- Dependencia del dataset de entrenamiento: el rendimiento fuera de la distribución de demostraciones (iluminación, posiciones, tipos de caja) puede degradarse de forma significativa.
- Sin datos de evaluación publicados: no hay métricas de éxito, robustez ni comparativas que permitan estimar su fiabilidad en producción.
- Sin capacidades de lenguaje ni razonamiento: no es un modelo conversacional ni un agente; cualquier expectativa de tool calling o multi-step reasoning es inaplicable.
- Riesgo de sobreajuste a la configuración de hardware: cambios en la cámara, la cinemática del robot o la calibración pueden invalidar la política.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación en entornos industriales recae en el integrador.
- Advertencia de seguridad: en robótica industrial, una política de imitación puede generar acciones no seguras ante entradas anómalas; se recomienda supervisión humana y límites de seguridad físicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bigwaverobotics/lerobot_ship_big_box
- Dataset de entrenamiento: https://huggingface.co/datasets/itdevhumanoid/lerobot_ship_big_box_dataset
- Framework LeRobot: https://github.com/huggingface/lerobot
- Paper de ACT (Action Chunking with Transformers): no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada
