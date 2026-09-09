# Richard-ZZZZZ/robotwin-bihub-joint-wam-v3-step9000

## Resumen

El checkpoint `robotwin-bihub-joint-wam-v3-step9000` es un modelo conjunto de robótica desarrollado por Richard-ZZZZZ, diseñado para entrenar de forma simultánea un world model y un action head dentro del ecosistema RoboTwin 2.0. Se trata de un checkpoint intermedio (paso 9000) de una ejecución de entrenamiento que fue detenida en el paso 9950. Su propósito principal es reanudar el entrenamiento del trainer conjunto de mira, no servir como modelo de inferencia directa.

La arquitectura se denomina `bihub-joint-world-v12-action-v13-online-v3-fast-multihistory` y fue entrenada en 3 nodos con 24 GPU H200. El trabajo se enmarca en RoboTwin, una plataforma que combina un agente de lenguaje multimodal para sintetizar programas de tareas de forma automática con configuraciones de brazos duales para recopilar datos de manera escalable. Las políticas entrenadas con datos de RoboTwin 2.0 muestran una mayor robustez y generalización a entornos no vistos.

Este checkpoint se distribuye como PyTorch Distributed Checkpoint (DCP) junto con el estado de entrenamiento de cada rank. No incluye el codec congelado ni el modelo de visión Qwen3-VL-2B, por lo que no es directamente cargable con `from_pretrained`. La licencia es "other" y no hay información pública sobre idiomas ni benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `bihub-joint-world-v12-action-v13-online-v3-fast-multihistory` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | PyTorch Distributed Checkpoint (DCP) + estado de entrenamiento por rank (`rank-XXXXX.pth`) |

## Arquitectura y entrenamiento

La arquitectura `bihub-joint-world-v12-action-v13-online-v3-fast-multihistory` combina un world model (v12) y un action head (v13) en un diseño de doble hub. No hay información pública sobre el número total de parámetros ni sobre la longitud de contexto. El entrenamiento se realizó sobre el conjunto de datos RoboTwin 2.0 (subconjunto aloha-agilex) con ficheros NVMe en formato zip. El hardware utilizado fue de 3 nodos con 8xH200 cada uno (24 GPUs H200 en total), con un batch por dispositivo de 8 y un tiempo de paso aproximado de 16,4 segundos. El entrenamiento partió de un checkpoint inicial V1 `joint-checkpoint-5071`.

Las métricas de pérdida en el paso 9000 son: loss_total 0,374; loss_world 0,372; loss_action 0,00208; y `world_recovered_clean_mse` 0,0192. No se dispone de información adicional sobre el proceso de optimización, los datos específicos de entrenamiento ni técnicas de alineación como RLHF o DPO.

## Capacidades

- Predicción conjunta de estados del mundo y acciones robóticas, combinando un world model y un action head en una sola arquitectura.
- Aprendizaje por imitación de tareas de manipulación con brazos duales a partir del dataset RoboTwin 2.0.
- Soporte de entrenamiento con historia múltiple (`multihistory`), lo que permite considerar varios pasos temporales anteriores para mejorar la predicción de acciones.
- Integración con el proyecto RoboTwin 2.0, que facilita la síntesis automática de programas de tareas mediante agentes de lenguaje multimodal.
- Este checkpoint está pensado para reanudar el entrenamiento del trainer conjunto de mira, no para inferencia directa.
- El módulo de visión (Qwen3-VL-2B) y el codec congelado no están incluidos y deben gestionarse por separado.

## Casos de uso

- Reanudación de entrenamiento distribuido: al ser un checkpoint DCP con estado por rank, permite retomar el entrenamiento del trainer conjunto de mira desde el paso 9000 sin perder el progreso de optimización.
- Aprendizaje por imitación de manipulación bimanual: las políticas entrenadas con datos RoboTwin 2.0 (aloha-agilex) pueden utilizarse para controlar brazos robóticos duales en tareas de ensamblaje y manipulación de objetos.
- Investigación en modelos de mundo para robótica: el checkpoint sirve para estudiar cómo el world model predice estados futuros y cómo interactúa con el action head en entornos simulados o reales.
- Desarrollo de agentes de programación de tareas: RoboTwin 2.0 utiliza un agente de lenguaje multimodal para crear programas de tareas; este checkpoint permite entrenar los componentes de percepción y acción que ejecutan dichos programas.
- Evaluación de estrategias de entrenamiento en clúster: la ejecución en 24 H200 con batch 8 por dispositivo y un step time de ~16,4 s es útil como referencia para investigar eficiencia en clústeres de GPUs.
- Fine-tuning adicional en entornos específicos: dado que es un checkpoint de entrenamiento, se puede reanudar para adaptar la política a nuevas tareas o entornos dentro de la plataforma RoboTwin.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas métricas reportadas son las pérdidas de entrenamiento del model card (loss_total 0,374; loss_world 0,372; loss_action 0,00208; world_recovered_clean_mse 0,0192), que no constituyen benchmarks estándar de comparación.

## Requisitos de hardware

- El entrenamiento original se ejecutó en 3 nodos con 8xH200 cada uno (24 GPU H200 en total).
- Tamaño del repositorio: 22,5 GB, que incluye el checkpoint distribuido y el estado de entrenamiento por rank.
- No hay datos sobre VRAM estimada para inferencia ni sobre GPU recomendadas, ya que el checkpoint no está diseñado para carga directa con `from_pretrained`.
- No se han publicado opciones de despliegue con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- El checkpoint no es compatible con `from_pretrained`; se trata de un estado de entrenamiento distribuido (DCP) destinado exclusivamente a reanudar el trainer conjunto de mira.
- No incluye el codec congelado ni el modelo de visión Qwen3-VL-2B. Ambos componentes son necesarios y deben proporcionarse por separado.
- La licencia "other" no especifica permisos concretos. Hay que revisar los términos asociados antes de cualquier uso, especialmente en entornos comerciales.
- No hay información pública sobre benchmarks, capacidad de razonamiento, idiomas soportados ni sesgos conocidos.
- El conjunto de datos de entrenamiento es específico de RoboTwin 2.0 (subconjunto aloha-agilex), lo que puede limitar la generalización fuera de ese dominio de manipulación.
- No existen evaluaciones publicadas sobre el comportamiento en entornos no vistos, por lo que se desconoce el nivel de robustez real fuera de las tareas de la plataforma.

## Enlaces

- HuggingFace: https://huggingface.co/Richard-ZZZZZ/robotwin-bihub-joint-wam-v3-step9000
- RoboTwin 2.0: https://robotwin-platform.github.io/
- Repo oficial de RoboTwin: https://github.com/robotwin-Platform/robotwin
