# brouthen/act_so101_pick_rb_mixed_from_all_30k

## Resumen

`brouthen/act_so101_pick_rb_mixed_from_all_30k` es una política de control robótico basada en ACT (Action Chunking with Transformers) entrenada con LeRobot 0.7.0 para el robot SO-101. El modelo resuelve una tarea de manipulación concreta: recoger una pelota rayada de un cuenco lleno de pelotas rojas y azules. Lo publica el usuario brouthen como parte de una serie de experimentos de fine-tuning sobre políticas ACT preentrenadas en tareas de picking con el mismo brazo.

El modelo se ha fine-tuneado desde `brouthen/act_so101_pick_striped_all_pretrain_50k` (paso 50.000) usando el dataset `molnrb/so101_pick_rb_mixed`, compuesto por 80 episodios grabados con dos cámaras (`top` y `wrist`) a 640x480 y 30 fps. El entrenamiento se ejecutó durante 30.000 pasos con hiperparámetros por defecto de LeRobot ACT (batch 8, learning rate 1e-5, chunk_size 100, n_action_steps 100, fp32, sin aumentación de datos).

Es relevante como ejemplo de flujo de trabajo de imitation learning reproducible con LeRobot: publicación de checkpoints intermedios cada 2.000 pasos, evaluación con pérdida sobre episodios reservados y un pipeline de despliegue directo mediante `lerobot-rollout`. No es un modelo de lenguaje ni un modelo fundacional generalista: es una política visuomotora específica de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control; ventana de observación definida por el pipeline LeRobot, no por un contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, entrenamiento en fp32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (directorio `pretrained_model` de LeRobot por checkpoint) |

## Arquitectura y entrenamiento

ACT es una arquitectura transformer diseñada para imitation learning en robótica: predice secuencias de acciones (chunks) a partir de observaciones visuales y del estado del robot, lo que reduce el error de acumulación típico de las políticas que predicen una acción por paso. En esta ficha, el modelo emplea dos cámaras (`top` y `wrist`) a 640x480 y 30 fps, chunk_size de 100 y n_action_steps de 100, con precisión fp32 y sin aumentación de datos.

El entrenamiento parte de un checkpoint preentrenado en las cuatro tareas de picking del autor (`brouthen/so101_pick_striped_all`, paso 50.000) y se fine-tunea durante 30.000 pasos sobre 80 episodios del dataset `molnrb/so101_pick_rb_mixed`, con la tarea reetiquetada como "pelota rayada verde y amarilla". El 10% final de los episodios (12 episodios, semilla 1000) se reserva para validación y también se excluyó durante el preentrenamiento. Al no reanudarse el entrenamiento, la normalización se calcula con este dataset. No se documenta uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en una política de control.

## Capacidades

- Control visuomotor del brazo SO-101 para la tarea de recoger una pelota rayada de un cuenco con pelotas rojas y azules.
- Predicción de chunks de acción de 100 pasos a partir de observaciones de dos cámaras (`top` y `wrist`).
- Ejecución autónoma de la política mediante `lerobot-rollout` con el mismo robot, nombres de cámara y resolución usados en la grabación.
- Evaluación reproducible mediante pérdida sobre episodios reservados (held-out loss) por checkpoint.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües: es una política robótica específica.
- No incluye modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Replicación de experimentos de imitation learning: usar los checkpoints publicados (`002000` a `012000`) para comparar curvas de pérdida held-out y estudiar la estabilidad del fine-tuning de ACT con pocos episodios.
- Despliegue en laboratorio con SO-101: ejecutar `lerobot-rollout --policy.path=pick_rb/010000` sobre el mismo montaje físico para validar la política en la tarea de picking de pelota rayada.
- Base para fine-tuning en tareas relacionadas: al partir de un preentrenamiento en cuatro tareas de picking, sirve como inicialización para nuevas variantes (otros objetos, otros cuencos) con pocos episodios adicionales.
- Docencia y formación en robótica: ejemplo completo y reproducible del ciclo grabación con LeRobot, entrenamiento ACT, evaluación con held-out y despliegue.
- Benchmark interno de hardware: medir latencia y tasa de éxito del pipeline LeRobot 0.7.0 con dos cámaras a 640x480 y 30 fps en distintas GPUs.
- Estudio de normalización y preentrenamiento: comparar el efecto de no reanudar el entrenamiento (normalización recalculada sobre el dataset nuevo) frente a reanudar desde el checkpoint preentrenado.
- Investigación sobre sobreajuste con datasets pequeños: los 80 episodios (12 reservados) permiten analizar la varianza de la pérdida held-out entre checkpoints, que el autor advierte que puede ser ruido de pocos puntos porcentuales.

## Benchmarks y rendimiento

El autor publica únicamente la pérdida sobre los episodios reservados (12 episodios, semilla 1000) para cada checkpoint disponible:

| Checkpoint | Held-out loss |
|---|---|
| `002000/` | 0.4253 |
| `004000/` | 0.4359 |
| `006000/` | 0.4469 |
| `008000/` | 0.4366 |
| `010000/` | 0.4261 |
| `012000/` | 0.4289 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni métricas de éxito en robot) en la información disponible. El autor advierte que, con tan pocos episodios, diferencias de pocos puntos porcentuales son ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 1,2 GB, lo que da una cota superior aproximada del conjunto de checkpoints; el tamaño de un checkpoint individual no se detalla.
- GPU recomendadas: no disponible. El nombre del run (`act_finetune_rb_from_all_h100_30k`) sugiere entrenamiento en H100, pero no se confirma en la información.
- Compatibilidad con GPU de consumo: no disponible. Dado el tamaño reducido del repositorio (1,2 GB en total), es plausible que un checkpoint individual quepa en GPUs de consumo, pero no hay confirmación.
- Opciones de despliegue: LeRobot 0.7.0 mediante `lerobot-rollout` con `--policy.path` apuntando al directorio del checkpoint. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `brouthen/act_so101_pick_rb_mixed_from_all_30k` | ACT | Pick pelota rayada en cuenco rojo/azul, SO-101 | `molnrb/so101_pick_rb_mixed` (80 episodios) | no disponible | Hugging Face |
| `brouthen/act_so101_pick_striped_all_pretrain_50k` | ACT | Preentrenamiento en 4 tareas de picking, SO-101 | `brouthen/so101_pick_striped_all` | no disponible | Hugging Face (checkpoint base) |
| Políticas ACT genéricas de LeRobot | ACT | Tareas de manipulación diversas | variables | según repositorio | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de tarea: solo se ha entrenado para recoger una pelota rayada de un cuenco con pelotas rojas y azules; no generaliza a otras tareas sin fine-tuning.
- Requiere el mismo montaje físico: mismo robot SO-101, mismos nombres de cámara (`top`, `wrist`) y misma resolución (640x480) que en la grabación.
- Dataset muy pequeño: 80 episodios, de los cuales 12 se reservan para validación; el autor advierte que las diferencias de pérdida entre checkpoints pueden ser ruido.
- Riesgo de sobreajuste y de fallo fuera de la distribución de colores, iluminación o posiciones vistas en el dataset.
- Normalización calculada sobre este dataset al no reanudar el entrenamiento; cambios en el dataset o en el preentrenamiento alteran el comportamiento.
- Entrenamiento en curso según la model card: se añaden checkpoints nuevos, por lo que el estado del repositorio puede cambiar.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Sesgos conocidos: no documentados; en robótica, los sesgos provienen de la distribución de demostraciones (colores, posiciones, condiciones de iluminación).
- No apto para producción sin validación previa en el montaje real y sin evaluación de tasa de éxito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brouthen/act_so101_pick_rb_mixed_from_all_30k
- Dataset de entrenamiento: https://huggingface.co/datasets/molnrb/so101_pick_rb_mixed
- Checkpoint preentrenado base: https://huggingface.co/brouthen/act_so101_pick_striped_all_pretrain_50k
- Dataset de preentrenamiento: https://huggingface.co/brouthen/so101_pick_striped_all
- LeRobot (librería): https://github.com/huggingface/lerobot
