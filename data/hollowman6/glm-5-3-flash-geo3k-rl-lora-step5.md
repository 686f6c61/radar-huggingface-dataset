# HollowMan6/GLM-5.3-Flash-Geo3K-RL-LoRA-step5

## Resumen

GLM-5.3-Flash-Geo3K-RL-LoRA-step5 es un adaptador LoRA de tipo PEFT desarrollado por el usuario HollowMan6 sobre el modelo base zai-org/GLM-5.3-Flash, un modelo multimodal de tipo image-text-to-text. El adaptador se ha entrenado mediante aprendizaje por refuerzo con el algoritmo GRPO sobre el conjunto de datos Geometry3K, compuesto por problemas de geometría con soporte de imagen. El objetivo es mejorar la capacidad de razonamiento geométrico del modelo base en tareas que combinan texto e imagen.

Este repositorio corresponde al checkpoint del paso 5 de una ejecución de 30 pasos de entrenamiento RL, con guardados cada 5 pasos. Según la model card, en este punto el adaptador alcanza una precisión de 0,7088 en el conjunto de test de Geometry3K (601 filas), frente al 0,6622 del modelo base, lo que supone una mejora de +0,0466 puntos absolutos. El mejor checkpoint de la ejecución es el paso 20, con 0,8735 de precisión, por lo que este paso 5 no representa el máximo rendimiento de la serie.

La relevancia de esta ficha es doble: por un lado, documenta un adaptador de investigación para el ajuste fino con RL de modelos multimodales; por otro, sirve como referencia técnica de un pipeline completo (verl + Megatron-LM + vLLM) aplicado a un modelo de la familia GLM. El adaptador se distribuye con licencia MIT y un tamaño de repositorio de 7,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal GLM-5.3-Flash; rank 16, alpha 32, 22 modulos objetivo |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no declara cifra en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion del adaptador; en el ejemplo de despliegue se configura max_model_len=4096 |
| Tipos de cuantizacion | el modelo base se usa en FP8; el adaptador se entrena en BF16; no se detallan otros formatos |
| Idiomas soportados | los mismos que el modelo base (no especificados) |
| Licencia | MIT |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre GLM-5.3-Flash, un modelo multimodal image-text-to-text. Los 22 modulos objetivo del LoRA cubren componentes de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `q_a_proj`, `q_b_proj`, `kv_a_proj_with_mqa`, `kv_b_proj`, `wq_b`, `wk`), componentes de KDA o Kimi Delta Attention (`b_proj`, `f_a_proj`, `f_b_proj`, `g_a_proj`, `g_b_proj`), el indexador DSA (`weights_proj`), expertos MoE (`gate_proj`, `up_proj`, `down_proj`, `gate`) y otras proyecciones (`proj`, `qkv`). La presencia de módulos MoE y de KDA confirma que el modelo base combina mezcla de expertos con mecanismos de atención lineal/delta, aunque la model card no detalla la arquitectura completa del base.

El entrenamiento usa GRPO (Group Relative Policy Optimization) con el framework verl junto a Megatron-LM y Megatron-Bridge, sobre el dataset Geometry3K (2.101 filas de entrenamiento). Se emplearon 16 GPUs H20 en 2 nodos, con rollout en vLLM (TP=16, DP=1, EP=16, `enable_thinking=True`) y actor con TP=8, EP=16, CP=2. La precisión es BF16 y se aplican técnicas de consistencia train-rollout: `resync_base=True` para evitar deriva entre entrenamiento y rollout, y R3 router replay para consistencia del enrutador MoE. La evaluación usa `extract_boxed_content` y `grade_answer` de mathruler, coherente con la función de recompensa del RL.

## Capacidades

- Razonamiento geométrico multimodal: resuelve problemas de geometría que combinan enunciado textual e imagen.
- Generación de texto y razonamiento paso a paso, con modo thinking habilitado durante el entrenamiento (`enable_thinking=True`).
- Procesamiento de imagen y texto en una sola entrada (pipeline image-text-to-text).
- Respuesta en formato matemático con contenido extraíble mediante `extract_boxed_content`, alineado con la evaluación del RL.
- Ajuste fino eficiente mediante LoRA: solo se entrena un adaptador de rank 16 sobre el modelo base.
- Compatible con despliegue en vLLM con LoRA dinámico y con Transformers + PEFT.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, audio ni otros idiomas distintos de los del modelo base.

## Casos de uso

- Investigación en RL para modelos multimodales: el adaptador sirve como referencia de un pipeline GRPO completo con verl y Megatron-LM, útil para reproducir experimentos de ajuste fino con recompensa verificable.
- Estudios de ablación de checkpoints: al guardarse cada 5 pasos, permite analizar la evolución de la precisión (0,6622 en base, 0,7088 en paso 5, 0,8735 en paso 20) y estudiar el sobreajuste o la degradación posterior.
- Resolución asistida de problemas de geometría: integrado en una aplicación educativa que reciba una foto del enunciado y devuelva la solución con el resultado en formato boxed.
- Evaluación comparativa de adaptadores LoRA: útil para medir el impacto de un adaptador de bajo rango sobre un modelo base multimodal en una tarea acotada.
- Prototipado de tutores matemáticos con visión: con un despliegue vLLM con `limit_mm_per_prompt={"image": 4}` se pueden procesar hasta cuatro imágenes por prompt en una sesión de resolución guiada.
- Referencia para ajuste fino de la familia GLM: documenta los módulos objetivo y las técnicas de consistencia (resync_base, R3 router replay) que otros equipos pueden replicar al adaptar GLM-5.3-Flash.
- Despliegue ligero en producción experimental: al ser un adaptador PEFT de 7,5 GB, se puede cargar junto al base en vLLM sin duplicar los pesos completos del modelo.

## Benchmarks y rendimiento

Resultados de la model card sobre el conjunto de test de Geometry3K (601 filas), decodificación greedy y max_new_tokens=2048. La puntuación combina 0,9 × accuracy + 0,1 × formato.

| Checkpoint | Accuracy | Score |
|---|---|---|
| Base model | 0,6622 | 0,5960 |
| Step 5 (este adaptador) | 0,7088 | 0,6379 |
| Step 10 | 0,7787 | 0,7008 |
| Step 15 | 0,8203 | 0,7383 |
| Step 20 | 0,8735 | 0,7862 |
| Step 25 | 0,8719 | 0,7847 |
| Step 30 | 0,8403 | 0,7562 |

Este checkpoint (step 5) mejora al base en +0,0466 de accuracy y +0,0419 de score, pero queda por debajo del pico de la ejecución en el paso 20. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 7,5 GB en el repositorio; requiere cargar además el modelo base GLM-5.3-Flash en FP8, cuyo peso no se detalla en la información disponible.
- Entrenamiento documentado: 2 nodos × 8 GPUs H20 (16 GPUs en total), con rollout vLLM TP=16/DP=1/EP=16 y actor TP=8/EP=16/CP=2.
- Despliegue de inferencia documentado en vLLM con `tensor_parallel_size=8`, `max_model_len=4096` y `enforce_eager=True`; implica un despliegue multi-GPU de clase servidor.
- No se especifica VRAM mínima para inferencia ni si el conjunto base + adaptador cabe en GPUs de consumo (RTX 4090 u otras); no disponible.
- Opciones de despliegue soportadas según la model card: vLLM 0.33.0rc1 con LoRA dinámico, y Transformers + PEFT.
- No se publican datos de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia interna de la misma ejecución, el adaptador se puede comparar con sus propios checkpoints:

| Versión | Accuracy Geometry3K | Score | Licencia |
|---|---|---|---|
| Base GLM-5.3-Flash | 0,6622 | 0,5960 | MIT |
| Step 5 (este) | 0,7088 | 0,6379 | MIT |
| Step 20 (mejor) | 0,8735 | 0,7862 | MIT |
| Step 30 (final) | 0,8403 | 0,7562 | MIT |

Comparativa con otros adaptadores o modelos de geometría multimodal: no disponible.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 5 de 30) y no el mejor de la ejecución; para uso práctico conviene evaluar el paso 20, que alcanza 0,8735 de accuracy.
- El adaptador está especializado en Geometry3K; su rendimiento fuera de ese dominio no está documentado y podría degradarse respecto al modelo base.
- El modelo base se usa en FP8 y el adaptador en BF16; posibles diferencias de precisión entre entrenamiento e inferencia no se cuantifican en la información disponible.
- No se documentan sesgos conocidos, tasas de alucinación ni comportamiento multilingüe específico del adaptador.
- La licencia MIT se hereda del modelo base según la model card; conviene verificar las condiciones del modelo base zai-org/GLM-5.3-Flash antes de un uso comercial.
- El despliegue documentado exige 8 GPUs en tensor paralelo y `enforce_eager=True`, lo que limita el rendimiento y encarece la puesta en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.
- La información de la búsqueda web no contiene resultados relevantes sobre este modelo; los enlaces externos adicionales no están disponibles.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/HollowMan6/GLM-5.3-Flash-Geo3K-RL-LoRA-step5
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Dataset Geometry3K: https://huggingface.co/datasets/hiyouga/geometry3k
- Framework verl: https://github.com/volcengine/verl
- MathRuler: https://github.com/hiyouga/MathRuler
- Perfil del autor: https://huggingface.co/HollowMan6
