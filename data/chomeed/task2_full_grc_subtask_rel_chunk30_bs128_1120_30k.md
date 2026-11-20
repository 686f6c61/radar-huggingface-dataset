# chomeed/task2_full_grc_subtask_rel_chunk30_bs128_1120_30k

## Resumen

`task2_full_grc_subtask_rel_chunk30_bs128_1120_30k` es un checkpoint de política robótica basado en pi0.5 (pi05), desarrollado por el usuario `chomeed` y publicado bajo el framework LeRobot. Se trata de un fine-tuning del modelo base `lerobot/pi05_base` orientado a una tarea concreta de manipulación bimanual: la inserción de un cable en un módulo de control (tarea GRC) sobre el robot Hyundai Duet. El modelo incorpora predicción explícita de subtareas de alto nivel: el componente VLM genera la subtarea actual y el experto de acción condiciona su salida sobre ella.

El modelo resuelve el problema de control visuomotor de extremo a extremo para una tarea de ensamblaje con múltiples fases (empujar el módulo, volver a la pose de reposo, agarrar el cable, girar la cabeza e insertar ambos extremos del cable). Emite acciones de 18 dimensiones en chunks de 30 pasos, con brazos en coordenadas relativas al estado actual y articulaciones de los dedos índices en absoluto. Es relevante porque ejemplifica el patrón actual de adaptar modelos fundacionales de robótica (pi0.5) a tareas industriales concretas mediante fine-tuning supervisado con datos de demostración.

El checkpoint corresponde al paso 30.000 de un entrenamiento de 40.000 actualizaciones, con un tamaño de 4.143.404.816 parámetros y un repositorio de 16,6 GB. La información pública disponible es limitada: no hay licencia declarada, ni idiomas, ni benchmarks publicados más allá de la pérdida de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (pi05): VLM con experto de acción (flow matching) y predicción de subtarea; framework LeRobot 0.6.2 con plugin `pi05_subtask` |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrada: prompt de tarea + estado de 18 dimensiones + 3 imágenes de cámara) |
| Tipos de cuantizacion | no disponible (entrenado en bf16 con pesos maestros fp32; no se documentan cuantizaciones para inferencia) |
| Idiomas soportados | no disponible (prompts en inglés en los ejemplos de la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura pi0.5, que combina un modelo de lenguaje y visión (VLM) con un experto de acción entrenado mediante flow matching. La innovación central de este fine-tuning es la predicción de subtareas: el VLM escribe la subtarea actual tras el prompt y el experto de acción condiciona sobre ella. El formato de prompt es `Task: insert the cable into the control module, State: {7 or 18 numbers};\nSubtask: {subtask};\nAction:`. La función de pérdida combina el término de flow con 0,1 veces la entropía cruzada de la subtarea.

El entrenamiento parte de `lerobot/pi05_base` (con los pesos pi05 y los pasos de prompt intercambiados mediante `build_init.py`) y se ejecuta sobre el dataset `HDR-AI-tmp/hyundai_duet_task2`, compuesto por demostraciones de las tres subtareas de la tarea de inserción de cable: 40 demostraciones para la subtarea 1 (empujar el módulo, solo brazo derecho), 50 para la subtarea 2 (primer cable, bimanual) y 54 para la subtarea 3 (segundo extremo del cable, bimanual). Se realizaron 40.000 actualizaciones con AdamW (lr pico 2,5e-05, warmup 1000, decaimiento coseno hasta 2,5e-06), batch de 128 por actualización (64 por GPU en 2 B200 con DDP), autocast bf16 con pesos maestros fp32 y gradient checkpointing. El muestreo es uniforme sobre todos los frames, sin SIRIUS, sin reparto por grupos y sin DemoSpeedup. La pérdida de entrenamiento en el paso 30.000 es 0,003.

## Capacidades

- Control visuomotor bimanual de extremo a extremo para una tarea de inserción de cable, con 18 dimensiones de estado y de acción (7 articulaciones por brazo más 4 articulaciones de los dedos índices).
- Predicción explícita de subtareas de alto nivel (push, return, grasp, turn head, insert) que condiciona la generación de acciones.
- Procesamiento de tres cámaras simultáneas (d405_left, d405_right, zed_mini) sin recorte.
- Generación de chunks de acción de 30 pasos (`n_action_steps 30`).
- Acciones de brazo en coordenadas relativas al estado actual; articulaciones de los dedos índices en absoluto.
- Soporte de enmascaramiento por subtarea mediante `state_dim_is_pad` / `action_dim_is_pad` (bool, 18), que permite desactivar dimensiones no relevantes (por ejemplo, el brazo izquierdo en la subtarea 1).
- No se documentan capacidades de tool calling, agentes, matemáticas, visión general o audio: es un modelo específico de robótica.

## Casos de uso

- Automatización de ensamblaje de cables en línea de producción: el modelo ejecuta la secuencia completa de inserción de cable en el módulo de control sobre el robot Hyundai Duet, gestionando las tres subtareas con una única política entrenada con demostraciones.
- Manipulación bimanual coordinada: las subtareas 2 y 3 requieren el uso coordinado de ambos brazos, y el modelo genera acciones de 18 dimensiones para los dos brazos y los dedos índices en cada chunk de 30 pasos.
- Control condicionado por subtarea en entornos con fases diferenciadas: la predicción de subtarea permite que el experto de acción adapte su comportamiento a la fase actual (empujar, reposicionar, agarrar, insertar) sin cambiar de política.
- Investigación en modelos fundacionales de robótica: sirve como punto de partida para estudiar fine-tuning de pi0.5 con supervisión de subtareas y enmascaramiento de dimensiones de estado/acción.
- Prototipado de pipelines LeRobot: el ejemplo de carga con `PI05SubtaskPolicy.from_pretrained` y `make_pre_post_processors` permite reproducir la normalización exacta (stats q01/q99 almacenados en los safetensors del repo).
- Evaluación de robustez visuomotora con múltiples cámaras: el uso de tres cámaras (dos d405 y una zed_mini) permite probar configuraciones de percepción redundante en tareas de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la pérdida de entrenamiento en el paso 30.000 (0,003), que combina el término de flow y la entropía cruzada de subtarea ponderada por 0,1.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4.143.404.816 parámetros, en bf16 los pesos ocupan aproximadamente 8,3 GB; en fp32, unos 16,6 GB. A ello hay que sumar el coste de las tres cámaras y del VLM, por lo que se recomienda al menos 24 GB de VRAM para bf16.
- GPU recomendadas: el entrenamiento se realizó en 2× NVIDIA B200 con DDP (64 de batch por GPU). Para inferencia no se documentan GPU concretas.
- Cabe en GPU de consumo: previsiblemente en tarjetas con 24 GB o más (por ejemplo, RTX 4090) en bf16, aunque no está confirmado oficialmente.
- Opciones de despliegue: LeRobot 0.6.2 con el plugin `lerobot_policy_pi05_subtask` (instalable desde `git+https://github.com/HDR-SRL/lerobot_policy_pi05_subtask@9b0f897`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| task2_full_grc_subtask_rel_chunk30_bs128_1120_30k | 4.143.404.816 | no disponible | Inserción de cable bimanual (Hyundai Duet) | no disponible | Hugging Face (0 descargas) |
| lerobot/pi05_base | no disponible | no disponible | Política fundacional de robótica (base) | no disponible | Hugging Face |
| Otros fine-tunings de pi0.5 | no disponible | no disponible | Varía según tarea | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Modelo altamente específico: entrenado únicamente para la tarea GRC de inserción de cable sobre el robot Hyundai Duet; no es un modelo de propósito general.
- Checkpoint intermedio: corresponde al paso 30.000 de 40.000, no al modelo final del entrenamiento.
- Licencia no declarada: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Dependencia del plugin: requiere LeRobot 0.6.2 y el plugin `lerobot_policy_pi05_subtask` en una revisión concreta (`9b0f897`), lo que limita la portabilidad.
- Requisitos de integración en el robot: es necesario enviar `state_dim_is_pad` (bool, 18) con la observación, con True en las dimensiones 7-17 durante las subtareas de empuje y retorno, y ejecutar solo las dimensiones no enmascaradas. Antes de la primera llamada de 18 dimensiones hay que mover las manos a las posiciones 0,6922 / 0,2584.
- Normalización dependiente del repositorio: las estadísticas q01/q99 usadas están almacenadas en los safetensors `policy_preprocessor_*` / `policy_postprocessor_*`; cargar el modelo sin sus procesadores no reproduce el comportamiento.
- Riesgo de alucinación y sesgos: no documentados; al ser un modelo de control motor, el riesgo principal es la ejecución incorrecta de acciones en el robot real, no la generación de texto.
- Idiomas: no se declaran; los prompts de ejemplo están en inglés.
- Sin métricas de éxito en robot real publicadas: solo se reporta la pérdida de entrenamiento, que no garantiza el rendimiento en despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chomeed/task2_full_grc_subtask_rel_chunk30_bs128_1120_30k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HDR-AI-tmp/hyundai_duet_task2
- Plugin LeRobot: https://github.com/HDR-SRL/lerobot_policy_pi05_subtask
- Run de entrenamiento en Weights & Biases: https://wandb.ai/meeroro56/hyundai_duet/runs/k3gw0d3s
