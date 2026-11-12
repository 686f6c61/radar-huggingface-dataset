# mobilab-udesc/act-g1-box-into-box-sim-v2

## Resumen

ACT (Action Chunking Transformer) es una política de imitación para robótica desarrollada por el grupo MOBILAB de la Universidade do Estado de Santa Catarina (UDESC). Este checkpoint concreto, `act-g1-box-into-box-sim-v2`, está entrenado para que un robot humanoide Unitree G1 introduzca una caja envuelta en plástico de burbujas dentro de una caja de cartón, exclusivamente en simulación MuJoCo.

El modelo parte de la arquitectura ACT original (transformer con encoder de visión y decoder de acciones con chunking) y se entrena con el framework LeRobot 0.4.1 sobre un dataset sintético de 200 episodios scriptados (161.176 frames). Controla 15 articulaciones (14 de brazo más el yaw de cintura) a partir de tres cámaras: cabeza y ambas muñecas, a resolución 640x480.

Es relevante como ejemplo de pipeline real2sim completo y reproducible: el autor publica dataset, checkpoints intermedios, estado del optimizador y el runner de MuJoCo. No obstante, el propio autor advierte que el entrenamiento está en curso, que los checkpoints son intermedios y que el modelo no ha sido evaluado ni en simulador ni en el robot real. La versión 1 falló en el robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política de imitación |
| Parametros totales | 51.687.055 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no aplica: modelo robótico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `config.json` y procesadores LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación visomotora que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. En esta instancia, la entrada son tres flujos de cámara (`cam_head`, `cam_left_wrist`, `cam_right_wrist`) a 640x480 más el estado de 15 articulaciones (14 de brazo y yaw de cintura), y la salida son objetivos articulares (joint targets).

El entrenamiento se realizó con `lerobot-train --policy.type=act` sobre LeRobot 0.4.1, con batch de 16 y la configuración ACT por defecto, con un plan de 100.000 pasos. El dataset `mobilab-udesc/g1_box_into_box_sim_scripted_v2` contiene 200 episodios scriptados en MuJoCo (161.176 frames) generados de forma sintética, sin datos de teleoperación real. No se indica en la información disponible si hubo RLHF, DPO ni ninguna fase de refinamiento posterior; tampoco se detalla la composición exacta del dataset más allá del número de episodios y frames.

## Capacidades

- Control visomotor para una tarea concreta: introducir una caja envuelta en una caja de cartón.
- Predicción de chunks de acciones articulares (15 dimensiones: 14 de brazo más yaw de cintura).
- Fusión de tres vistas de cámara (cabeza y ambas muñecas) a 640x480.
- Ejecución en simulación MuJoCo mediante el runner `05_training/run_act.py` del repositorio MOBILAB-UDESC/g1-mujoco-real2sim.
- Reanudación de entrenamiento a partir del estado del optimizador incluido en `training_state/`.
- No dispone de tool calling, agentes, capacidades multilingües, visión general, audio ni modo de razonamiento: es una política robótica especializada.

## Casos de uso

- **Investigación en imitación visomotora**: usar el checkpoint como referencia reproducible de un pipeline ACT completo (dataset sintético, entrenamiento LeRobot, checkpoints intermedios y runner MuJoCo) para comparar configuraciones o estudiar el efecto del número de pasos.
- **Transferencia sim2real**: servir de base para experimentos de transferencia al Unitree G1 real, teniendo en cuenta que la versión 1 falló en hardware y que esta versión 2 aún no se ha validado.
- **Generación de datos sintéticos**: reutilizar el dataset scriptado de 200 episodios y 161.176 frames como punto de partida para aumentar la diversidad (posiciones iniciales, iluminación, texturas) antes de reentrenar.
- **Docencia y formación en robótica**: el repositorio y el runner permiten a estudiantes ejecutar una política entrenada en MuJoCo sin necesidad de hardware físico.
- **Benchmark interno de políticas ACT**: comparar este checkpoint con otros ACT del mismo autor (por ejemplo, `act-g1-box-into-box-sim`, versión 1) bajo el mismo protocolo de evaluación en simulador.
- **Depuración de pipelines LeRobot**: validar flujos de descarga por revisión (`--revision step-030000`), carga por nombre de repositorio y reanudación de entrenamiento con `training_state/`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo no ha sido evaluado, ni en el simulador ni en el robot real, y que los checkpoints publicados son intermedios.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 51,7 M de parámetros en safetensors, el peso de los pesos ocupa aproximadamente 0,2 GB en precisión de entrenamiento (FP32); en FP16/BF16 bajaría a unos 0,1 GB. A esto hay que sumar el coste de los tres encoders de visión y las activaciones, no cuantificado en la información disponible.
- **GPU recomendadas**: cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente para inferencia; para entrenamiento con batch 16 se recomienda una GPU de gama alta (RTX 3090/4090, A100 o H100), aunque el autor no especifica el hardware usado.
- **Consumer GPU**: sí, cabe holgadamente en GPUs de consumo; el cuello de botella es el renderizado de MuJoCo y el procesamiento de tres cámaras a 640x480, no el tamaño del modelo.
- **Opciones de despliegue**: LeRobot (carga por nombre de repositorio o ruta local) y el runner `run_act.py` del repositorio `MOBILAB-UDESC/g1-mujoco-real2sim` sobre MuJoCo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Estado |
|---|---|---|---|---|---|
| act-g1-box-into-box-sim-v2 (este) | 51.687.055 | no aplica | Introducir caja en caja (G1, 15 joints) | apache-2.0 | Entrenamiento en curso, sin evaluar |
| act-g1-box-into-box-sim (v1) | no disponible | no aplica | Misma tarea, dataset v1 | no disponible | Falló en el robot real según el autor |
| Otras políticas ACT de LeRobot | variable | no aplica | Tareas diversas de manipulación | variable | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- **Modelo no evaluado**: el autor declara que no se ha evaluado ni en simulador ni en el robot real; los checkpoints son intermedios y el entrenamiento sigue en curso.
- **Entrenamiento solo en simulación**: el dataset es 100% scriptado en MuJoCo; no hay datos de teleoperación real, lo que aumenta el riesgo de fallo en transferencia sim2real (la versión 1 ya falló en hardware).
- **Tarea única y estrecha**: la política solo sabe ejecutar "put the wrapped box inside the cardboard box" con la configuración de cámaras y articulaciones descrita; no generaliza a otras tareas ni objetos.
- **Sesgos**: no documentados; al ser un dataset sintético, los sesgos provienen de la distribución del script de generación (posiciones, iluminación, texturas), no de datos humanos.
- **Riesgo de alucinación**: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de acciones fuera de distribución o de colapso del chunking ante estados no vistos.
- **Licencia**: apache-2.0 permite uso comercial, pero la falta de validación hace desaconsejable su uso en producción sin evaluación previa.
- **Idiomas y contexto**: no aplica; no es un modelo de lenguaje.
- **Reproducibilidad**: requiere LeRobot 0.4.1 y el runner del repositorio del autor; cambios de versión pueden alterar el comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mobilab-udesc/act-g1-box-into-box-sim-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/mobilab-udesc/g1_box_into_box_sim_scripted_v2
- Versión 1 del modelo: https://huggingface.co/mobilab-udesc/act-g1-box-into-box-sim
- Repositorio simulador y runner (carpeta `05_training`): https://github.com/MOBILAB-UDESC/g1-mujoco-real2sim
- LeRobot (framework de entrenamiento): https://github.com/huggingface/lerobot
