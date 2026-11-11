# JJinJJin2/omx_act_policy_v2

## Resumen

`omx_act_policy_v2` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada por el usuario JJinJJin2 en Hugging Face. No es un modelo de lenguaje: es un controlador neuronal que traduce observaciones (típicamente imágenes de cámara y estado de las articulaciones) en secuencias cortas de acciones motoras para un brazo robótico. ACT se entrena mediante aprendizaje por imitación a partir de demostraciones teleoperadas y predice "chunks" de acciones en lugar de pasos individuales, lo que reduce el error acumulado y estabiliza el control.

El modelo tiene 51.668.614 parámetros en formato safetensors y un tamaño de repositorio de 0,2 GB. Está empaquetado con la librería LeRobot de Hugging Face y se ha entrenado sobre el dataset `JJinJJin2/pick_and_place_v2`, lo que sugiere una tarea concreta de recogida y colocación de objetos. La licencia es Apache 2.0 y la pipeline declarada es `robotics`.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de LeRobot (entrenamiento, checkpoints y evaluación con `lerobot-record`) para una tarea de manipulación. No es un modelo generalista ni compite con modelos fundacionales de robótica; su valor está en la integración con el ecosistema LeRobot y en la posibilidad de reentrenarlo con datos propios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder de observaciones y decoder de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre ventanas de observación definidas en la configuración de LeRobot) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de control robótico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación en robótica que, en lugar de predecir una única acción por paso, genera un chunk de acciones futuras a partir de la observación actual. La arquitectura combina un encoder que procesa las observaciones (imágenes y estado propioceptivo) con un decoder que emite la secuencia de acciones; el paper original (arXiv:2304.13705) introduce además técnicas como el ensamblaje temporal (*temporal ensembling*) para suavizar la ejecución de los chunks solapados. El modelo aquí publicado sigue la implementación de LeRobot y se entrena con `lerobot-train --policy.type=act`.

Los datos de entrenamiento corresponden al dataset `JJinJJin2/pick_and_place_v2`, presumiblemente una colección de episodios teleoperados de una tarea de pick-and-place. No se dispone de información sobre el número de episodios, el número de tokens o pasos, la composición exacta del dataset, la resolución de las cámaras ni si se aplicaron aumentos de datos. Tampoco se documenta el uso de RLHF, DPO ni ningún ajuste posterior al entrenamiento supervisado por imitación. La única innovación técnica destacable es la propia formulación de ACT (predicción de chunks y ensamblaje temporal), no una aportación propia del autor.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones articulares a partir de observaciones visuales y de estado, orientado a tareas de manipulación.
- Predicción de chunks de acción: emite varios pasos de acción por inferencia, lo que reduce la frecuencia efectiva de decisión y mejora la estabilidad.
- Integración nativa con LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- Compatibilidad con robots del ecosistema LeRobot, como el `so100_follower` citado en la model card.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües, al no ser un modelo de lenguaje.
- No se documentan capacidades de visión general (VQA, OCR) ni de audio; la visión se usa únicamente como entrada de control.

## Casos de uso

- Recogida y colocación de objetos (pick-and-place): es el caso directo para el que se entrenó, sobre el dataset `pick_and_place_v2`; el modelo aprende a aproximarse, agarrar y depositar piezas en posiciones definidas por las demostraciones.
- Base para reentrenamiento con datos propios: sirve como punto de partida reproducible para equipos que quieran adaptar ACT a su propia celda robotizada usando `lerobot-train` y su propio dataset.
- Evaluación de pipelines de imitación: permite validar el flujo completo de LeRobot (entrenamiento, checkpoints, `lerobot-record` con `--episodes=10`) antes de invertir en datasets mayores.
- Prototipado en laboratorio con robots de bajo coste: el tamaño de 51,7 M de parámetros y 0,2 GB de pesos facilita su despliegue en estaciones de trabajo con una sola GPU, sin infraestructura de servidores.
- Docencia y formación en robótica de manipulación: útil para ilustrar el ciclo demostración-entrenamiento-evaluación con un modelo pequeño y una licencia permisiva.
- Benchmark interno de referencia: al ser Apache 2.0, puede usarse como línea base contra la que comparar políticas propias en la misma tarea de pick-and-place.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación; por el tamaño (51,7 M de parámetros, 0,2 GB de pesos), es previsible que quepa holgadamente en GPUs de consumo, pero no se confirma con cifras oficiales.
- GPU recomendadas: no disponible. El comando de entrenamiento de la model card usa `--policy.device=cuda`, sin especificar modelo de GPU.
- GPU de consumo: probablemente compatible con tarjetas tipo RTX 3060 o superiores, aunque no hay confirmación del autor; conviene validarlo empíricamente.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas ACT publicadas ni resultados que permitan una comparación cuantitativa con alternativas como Diffusion Policy o VQ-BeT.

## Limitaciones y advertencias

- Especialización estrecha: entrenado para una tarea concreta (`pick_and_place_v2`); no se espera generalización a otras tareas, objetos o entornos sin reentrenamiento.
- Sin datos de evaluación: no hay tasas de éxito publicadas, por lo que no puede afirmarse su fiabilidad en producción.
- Dependencia del dataset: la calidad y variedad de las demostraciones teleoperadas condicionan por completo el comportamiento; no se documenta su composición.
- Sesgos de dominio: al no haber información sobre condiciones de iluminación, posiciones de cámara o variabilidad de objetos, el modelo puede fallar ante cambios de entorno no representados en los datos.
- Riesgo de alucinación en sentido figurado: como política de imitación, puede generar acciones erráticas o inseguras ante observaciones fuera de distribución; requiere supervisión y paradas de emergencia en entornos físicos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se ofrece ninguna garantía; el autor no asume responsabilidad por daños en sistemas robóticos.
- Idiomas y contexto textual: no aplica; no debe evaluarse como modelo de lenguaje.
- Madurez: 31 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/JJinJJin2/omx_act_policy_v2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- arXiv de ACT: https://arxiv.org/abs/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/JJinJJin2/pick_and_place_v2
