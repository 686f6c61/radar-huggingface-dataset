# pepijn223/act_openarm_screw_picking_v33a_real

## Resumen

ACT OpenArm screw picking (v33a-real) es una política de control robótico basada en la arquitectura ACT (Action Chunking with Transformers) publicada por el usuario pepijn223 en HuggingFace bajo la librería LeRobot. El modelo resuelve una tarea concreta de manipulación bimanual: recoger tornillos y pernos y depositarlos en un contenedor rojo, empleando un robot OpenArm con dos brazos y tres cámaras (cabeza y una por muñeca). No es un modelo de lenguaje: es una política visomotora que mapea observaciones (imágenes RGB y estado de movimiento) a secuencias de acciones articulares.

El checkpoint se entrenó con 152 episodios (61 reales teleoperados y 91 de simulación en Genesis) que suman 143.275 fotogramas, durante 20 épocas y 22.380 pasos con batch de 128 sobre una única GPU H100. El resultado es un modelo de 51,7 millones de parámetros que predice trozos de 32 acciones de 16 dimensiones a 25 Hz.

Es relevante ahora porque ejemplifica el flujo actual de entrenamiento híbrido sim-real en robótica de código abierto con LeRobot, aunque su estado es explícitamente experimental: en la evaluación en simulación colocó 0 de 4 tornillos (113 contactos) y no se ha probado en el robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política visomotora |
| Parametros totales | 51.734.160 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política robótica); historial de movimiento de 8 pasos × 16 dimensiones |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors), más config.json, action_stats.npz, train_meta.json |
| Entradas | observation.images.head (3×270×480), observation.images.gripper_a (3×270×480), observation.images.gripper_b (3×270×480), observation.state (128) |
| Salida | chunk de 32×16 acciones normalizadas (8 columnas por brazo: xyz, quaternion wxyz, apertura de pinza) |
| Frecuencia de ejecución | 25 Hz |
| Tamaño del repo | 0,2 GB |

## Arquitectura y entrenamiento

El modelo implementa `ACTPolicy` de LeRobot, una política de imitación basada en transformer que predice chunks de acciones (32 pasos en este caso) a partir de observaciones multimodales. Procesa tres flujos de imagen RGB de 270×480 con normalización ImageNet (cámara de cabeza y dos cámaras de muñeca) y un vector de estado de 128 dimensiones que codifica el historial de movimiento: las 8 acciones ejecutadas del último segmento de 8 pasos, aplanadas a 8×16, donde cada fila es la pose de cámara medida tras esa acción relativa al inicio del segmento y las ranuras de pinza (7 y 15) contienen las aperturas comandadas.

El entrenamiento combinó 61 episodios reales teleoperados con 91 episodios de simulación en Genesis en el layout de la escena de evaluación, totalizando 152 episodios y 143.275 fotogramas durante 20 épocas (22.380 pasos, batch 128) en una H100. No se documenta uso de RLHF ni DPO; es aprendizaje por imitación supervisado. Las acciones son relativas encadenadas por segmento de 8 pasos: para cada segmento se mide la pose de la cámara de muñeca al inicio y se compone la acción relativa sobre ella (`target = measured_segment_start ∘ action`). Un detalle técnico relevante es que los episodios de simulación de esta ejecución usan objetivos de pose medida siguiente, mientras que una corrección posterior pasó a objetivos de pose comandada, porque con reanclaje por segmento los objetivos medidos se quedan cortos en torno a 1 cm.

## Capacidades

- Control visomotor bimanual para una tarea de picking concreta: recoger tornillos y pernos y depositarlos en un contenedor rojo.
- Predicción de chunks de 32 acciones de 16 dimensiones (pose de cámara xyz, cuaternión wxyz y apertura de pinza por brazo) a 25 Hz.
- Fusión de tres vistas RGB (cabeza y ambas muñecas) con estado de historial de movimiento de 8 pasos.
- Ejecución con replanificación cada 16 a 32 acciones, el ajuste que mejor funcionó en simulación.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política robótica, no un modelo generativo de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control motor.

## Casos de uso

- Investigación en imitación bimanual: sirve como referencia reproducible de un pipeline LeRobot completo (entrenamiento híbrido sim-real, normalización, sesión de inferencia) para estudiar cómo se comporta ACT en tareas de precisión con dos brazos.
- Base para fine-tuning en tareas de picking: el checkpoint puede reinicializarse con datos reales adicionales del mismo rig OpenArm para corregir el fallo de colocación observado en simulación.
- Evaluación de brechas sim-real: al incluir episodios de Genesis y reales, permite medir sistemáticamente la discrepancia entre dominios y el efecto del reanclaje por segmento (objetivos medidos frente a comandados).
- Desarrollo de infraestructura de despliegue: los scripts `serve_act.py` y `act_common.py` documentan la normalización, el seguimiento de historial y la desnormalización, útiles para construir un servidor de inferencia propio.
- Estudio de composición de acciones relativas: el esquema de acciones encadenadas por segmento de 8 pasos con `wam_session.chained_targets` y su inversa `replay_core.relative_actions` es un caso práctico para investigar representaciones de acción relacionales.
- Docencia y prototipado en robótica: con 51,7 millones de parámetros y 0,2 GB, el modelo es ligero y cabe en un repo pequeño, adecuado para laboratorios que quieran montar un banco de pruebas de manipulación sin grandes recursos.

## Benchmarks y rendimiento

| Evaluación | Entorno | Resultado |
|---|---|---|
| Colocación de tornillos | Genesis sim, 60 s, escena de mesa larga fija | 0 de 4 tornillos colocados, 113 contactos |
| Robot real | No probado | no disponible |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 millones de parámetros en safetensors (aproximadamente 207 MB en fp32), la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: el entrenamiento se realizó en una H100; para inferencia basta una RTX 3060, RTX 4090 o similar, dado el reducido tamaño del modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: LeRobot (`ACTPolicy.from_pretrained`) con los scripts `serve_act.py` y `act_common.py` incluidos; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponible; la ejecución está pensada a 25 Hz con replanificación cada 16 a 32 acciones.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos comparables de la misma categoría (políticas ACT bimanuales para OpenArm) ni sus métricas.

## Limitaciones y advertencias

- Estado experimental declarado por el autor: en la evaluación en simulación colocó 0 de 4 tornillos con 113 contactos, y no se ha probado en el robot real.
- Los episodios de simulación de esta ejecución usan objetivos de pose medida siguiente, que bajo reanclaje por segmento se quedan cortos en torno a 1 cm; una corrección posterior cambió a objetivos comandados, por lo que este checkpoint no incorpora esa mejora.
- Las intrínsecas de cámara, los recortes y las extrínsecas cámara-TCP deben coincidir exactamente con el rig de entrenamiento; cualquier desviación invalida la política.
- Licencia no disponible: no puede asumirse uso comercial sin confirmación del autor.
- Riesgo de sobreajuste al layout de la escena de evaluación (mesa larga fija) y a la tarea concreta de tornillos.
- No hay información sobre sesgos, multilingüismo ni alucinación, al no ser un modelo de lenguaje.
- El historial de movimiento debe inicializarse con 8 filas identidad (traslación cero, cuaternión (1,0,0,0), aperturas iguales a `init_opening`) antes de la primera ejecución; hacerlo mal rompe la normalización con `hist_mean`/`hist_std`.

## Enlaces

- HuggingFace: https://huggingface.co/pepijn223/act_openarm_screw_picking_v33a_real
- LeRobot (librería): https://github.com/huggingface/lerobot
- Genesis (simulador): https://github.com/Genesis-Embodied-AI/Genesis
- Resultado de búsqueda web (sin relación con el modelo): https://console.cloud.google.com/launcher/?hl=es
