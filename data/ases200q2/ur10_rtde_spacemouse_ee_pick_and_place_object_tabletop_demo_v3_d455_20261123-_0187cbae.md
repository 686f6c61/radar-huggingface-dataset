# ases200q2/UR10_RTDE_SpaceMouse_EE_pick_and_place_object_tabletop_demo_v3_d455_20261123-_0187cbae

## Resumen

`ases200q2/UR10_RTDE_SpaceMouse_EE_pick_and_place_object_tabletop_demo_v3_d455_20261123-_0187cbae` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada en Hugging Face a través del framework LeRobot. El modelo aprende una tarea concreta de manipulación —recoger y colocar un objeto sobre una mesa— a partir de datos de teleoperación de un brazo UR10 controlado mediante RTDE y un SpaceMouse, con acciones expresadas en el espacio del efector final (EE).

El modelo no es un LLM ni un modelo generativo de texto: es un policy de robótica que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. Cuenta con 51.626.631 parámetros (unos 51,6 M) y un repositorio de apenas 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras desplegables en hardware modesto.

Su relevancia es acotada pero práctica: sirve como referencia reproducible para quien quiera entrenar o evaluar políticas ACT con LeRobot sobre un UR10, y demuestra el flujo completo de entrenamiento, publicación en el Hub y evaluación con `lerobot-record`. No obstante, es un artefacto muy específico de una tarea y un montaje experimental concretos, sin benchmarks publicados ni capacidades generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.626.631 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice bloques cortos de acciones futuras en lugar de una única acción por paso. La arquitectura combina un codificador de observaciones (típicamente imágenes de cámara y estado del robot) con un transformer que genera el chunk de acciones, y se entrena con aprendizaje supervisado sobre demostraciones teleoperadas. El paper de referencia es arXiv:2304.13705.

En este caso concreto, el entrenamiento se realizó con LeRobot sobre el dataset `ases200q2/UR10_RTDE_SpaceMouse_EE_pick_and_place_object_tabletop_demo_v3_d455_20261123-111956_clean`, que contiene demostraciones de la tarea de pick-and-place sobre mesa con un UR10 teleoperado mediante RTDE y SpaceMouse, con acciones en el espacio del efector final. No se dispone de información sobre el número de tokens, la composición exacta del dataset, el número de episodios ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en este tipo de políticas). Tampoco se documentan innovaciones adicionales más allá del propio action chunking.

## Capacidades

- Predicción de chunks de acciones para control de un brazo robótico UR10 en tareas de pick-and-place sobre mesa.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (RTDE + SpaceMouse).
- Acciones expresadas en el espacio del efector final (EE).
- Integración con el ecosistema LeRobot para entrenamiento, publicación y evaluación.
- Ejecución de inferencia mediante `lerobot-record` con un robot `so100_follower` según el ejemplo de la model card.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política de robótica, no un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades cognitivas.

## Casos de uso

- Pick-and-place sobre mesa con UR10: el modelo predice chunks de acciones del efector final para recoger un objeto y colocarlo en una posición objetivo, aprovechando que fue entrenado exactamente para ese montaje.
- Reproducción de experimentos de imitación con LeRobot: sirve como checkpoint de referencia para validar pipelines de entrenamiento (`lerobot-train`) y evaluación (`lerobot-record`) sobre un UR10.
- Base para fine-tuning en tareas similares: al ser una política ACT ligera (51,6 M de parámetros), puede reentrenarse con nuevos datasets de teleoperación para variantes de la misma tarea.
- Docencia y prototipado en robótica de manipulación: su tamaño reducido y licencia Apache 2.0 facilitan su uso en laboratorios y cursos para ilustrar action chunking.
- Evaluación comparativa de políticas ACT: permite medir tasas de éxito frente a otras políticas entrenadas sobre el mismo dataset o montaje.
- Integración en flujos de teleoperación asistida: puede ejecutar la política aprendida mientras se recogen nuevas demostraciones para mejorar el dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros y pesos safetensors en un repo de 0,2 GB, la huella es muy reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM es suficiente (por ejemplo, RTX 3060 o superiores). Para entrenamiento se recomienda CUDA (`--policy.device=cuda`), según la model card.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPUs consumer actuales; no se dispone de cifras oficiales de VRAM mínima.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ACT, UR10 pick-and-place) | 51,6 M | no disponible | sin benchmarks publicados | apache-2.0 | Hugging Face (LeRobot) |
| Otras políticas ACT en LeRobot | variable | no disponible | dependiente del dataset | habitualmente apache-2.0 | Hugging Face |
| Políticas Diffusion Policy | variable | no disponible | dependiente del dataset | variable | Hugging Face / repos de investigación |

No se dispone de datos comparativos de rendimiento entre este modelo y alternativas concretas en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente específico: entrenado para una única tarea (pick-and-place sobre mesa) con un UR10 y un montaje de teleoperación concreto; no generaliza a otras tareas ni robots sin reentrenamiento.
- Sin benchmarks publicados: no hay métricas de tasa de éxito, precisión ni robustez que permitan evaluar su rendimiento de forma objetiva.
- Riesgo de fallo ante cambios de iluminación, posición de cámara, objetos o condiciones de la mesa no representadas en el dataset.
- Dependencia del dataset de entrenamiento: el comportamiento queda limitado a la distribución de demostraciones recogidas.
- Sin información sobre sesgos: no se documentan sesgos, pero al ser un policy de imitación puede reproducir sesgos presentes en las demostraciones humanas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el modelo en el entorno real antes de producción.
- Sin idiomas soportados ni capacidades lingüísticas: no debe emplearse como modelo de texto.
- Fecha de creación y actualización en 2026 y nombre con identificadores experimentales (`d455`, `v3`, `0187cbae`): sugiere un artefacto de experimento, no un modelo mantenido.

## Enlaces

- Hugging Face: https://huggingface.co/ases200q2/UR10_RTDE_SpaceMouse_EE_pick_and_place_object_tabletop_demo_v3_d455_20261123-_0187cbae
- Dataset: https://huggingface.co/datasets/ases200q2/UR10_RTDE_SpaceMouse_EE_pick_and_place_object_tabletop_demo_v3_d455_20261123-111956_clean
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
