# davidheineman/rlve-opd-teacher-R1Distill-120-MaxNoConflictingBombs-20261025

## Resumen

`rlve-opd-teacher-R1Distill-120-MaxNoConflictingBombs-20261025` es un ajuste fino de un modelo pequeño (1.777 millones de parámetros) desarrollado por el investigador David Heineman dentro de sus experimentos de *data scaling* con RLVE (Reinforcement Learning from Value Equivalents). Parte de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, un destilado de razonamiento de DeepSeek sobre la arquitectura Qwen2, y se entrena con GRPO como "especialista" en un único entorno de la familia RLVE, con dificultad fija y balanceada (0/1).

Su interés no reside en el rendimiento generalista, sino en su papel dentro del pipeline: es un modelo *teacher* (profesor) pensado para generar rollouts de alta calidad con los que hacer destilación on-policy (OPD) sobre modelos estudiantes. El entrenamiento se limita a 4.000 rollouts, con parada temprana si la validación de identificación alcanza pass@1 ≥ 0,98 (32 prompts × 8 respuestas cada 50 actualizaciones). El checkpoint publicado corresponde a la actualización 499 (indexada desde cero).

Es, por tanto, un artefacto de investigación reproducible —incluye `training_run.json` y `training_config.yaml`, y enlaza la ejecución de W&B— más que un modelo listo para producto. No hay model card con benchmarks, licencia declarada ni idiomas soportados, y el repositorio no incluye estado del optimizador ni del dataloader.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2, derivado de DeepSeek-R1-Distill-Qwen-1.5B) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card de este repositorio; el modelo base pertenece a la familia Qwen2.5, cuyo contexto declarado es de 32.768 tokens (dato del modelo base, no confirmado para este checkpoint) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; conversión a GGUF/AWQ posible con herramientas externas, no documentada por el autor) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (repo de 3,6 GB; incluye tokenizer y ficheros de configuración) |

## Arquitectura y entrenamiento

La base es un transformer denso decoder-only de la familia Qwen2, heredado de `DeepSeek-R1-Distill-Qwen-1.5B`, que a su vez incorpora el comportamiento de razonamiento estilo R1 (cadenas de pensamiento antes de la respuesta) destilado sobre un modelo pequeño. El ajuste se realiza con GRPO (*Group Relative Policy Optimization*) en modo "especialista": todos los actores se inicializan de cero desde el modelo base y se entrenan contra un único entorno RLVE, con dificultad fija y balanceada 0/1.

La configuración de generación durante el entrenamiento usa 1.024 tokens iniciales más una continuación forzada de respuesta de 128 tokens, un diseño habitual para separar el razonamiento libre de la respuesta final evaluable. El presupuesto se fija en 4.000 rollouts, con parada anticipada si la validación (32 prompts, 8 respuestas por prompt, cada 50 actualizaciones; las muestras de validación no consumen presupuesto de entrenamiento) supera pass@1 ≥ 0,98 en la tarea de identificación. No se documentan en la información disponible el volumen de tokens, la composición del dataset, ni si hubo fases adicionales de RLHF o DPO más allá del propio GRPO.

## Capacidades

- Generación de texto conversacional con formato de chat (`text-generation`, pipeline de transformers).
- Razonamiento de tipo *chain-of-thought* heredado de DeepSeek-R1, con separación entre bloque de pensamiento y respuesta (1.024 + 128 tokens en el esquema de generación del entrenamiento).
- Especialización en un único entorno RLVE con dificultad balanceada 0/1: resuelve tareas de ese dominio concreto con alta fiabilidad (criterio de parada pass@1 ≥ 0,98 en validación de identificación).
- Generación de rollouts etiquetados para destilación on-policy: es su función principal como modelo *teacher*.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales: no se declaran visión, audio ni modo *thinking* explícito más allá del formato de razonamiento heredado.

## Casos de uso

- Destilación on-policy (OPD): el modelo actúa como profesor generando trayectorias de alta recompensa en un entorno RLVE concreto; esas trayectorias se filtran y se usan para ajustar modelos estudiantes más pequeños o del mismo tamaño.
- Estudio de *data scaling* en RL: sirve para medir cuántos rollouts de profesor hacen falta antes de saturar la utilidad de los datos, gracias a su presupuesto acotado (4.000 rollouts) y a la curva de validación cada 50 actualizaciones.
- Reproducción de experimentos: con `training_run.json`, `training_config.yaml` y el enlace a W&B, permite reconstruir la receta y verificar resultados frente a otros profesores de la misma colección.
- Generación de datos sintéticos con verificación automática: al estar entrenado contra un entorno con evaluador determinista, las respuestas se pueden validar programáticamente antes de incorporarlas a un dataset.
- Línea base para comparar estrategias de RL: sirve como referencia de "profesor especialista" frente a profesores generalistas al medir pass@1 del estudiante destilado.
- Experimentación académica en entornos con presupuesto de cómputo reducido: 1,78 B parámetros permite entrenar y evaluar ciclos completos de RL en una sola GPU de gama alta de consumo.
- Fine-tuning posterior del propio profesor: al ser un checkpoint con pesos limpios (sin estado de optimizador), se puede continuar el entrenamiento o reajustar a otro entorno partiendo de aquí.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta el criterio interno de parada (pass@1 ≥ 0,98 sobre 32 prompts × 8 respuestas en la validación de identificación del entorno RLVE) y el número de actualizaciones (499, equivalente a 4.000 rollouts), sin cifras de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,6-4 GB en bf16/fp16 (los pesos ocupan 3,6 GB en el repositorio); ~2 GB en cuantización de 8 bits y ~1,1-1,5 GB en 4 bits.
- GPU recomendadas: cualquier GPU con ≥ 8 GB de VRAM para bf16 con contexto moderado (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); A100/H100 no son necesarias y estarían infrautilizadas. Para servir en paralelo con lotes grandes conviene ≥ 24 GB (RTX 4090, L4, L40S, A10G).
- Cabe en GPU de consumo: sí, holgadamente, en RTX 3060 12 GB, RTX 4060/4060 Ti, RTX 4070 y superiores; también en iGPU con suficiente memoria unificada si se usa cuantización de 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (etiqueta `text-generation-inference` presente), vLLM para serving con *continuous batching*, y llama.cpp/Ollama previa conversión a GGUF (no publicada por el autor).
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud, un modelo denso de 1,78 B en bf16 sobre una RTX 4090 suele superar el centenar de tokens por segundo con lotes pequeños, pero no hay medición publicada para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`rlve-opd-teacher-...-MaxNoConflictingBombs-20261025`) | 1,78 B | No disponible (base Qwen2.5: 32.768) | GRPO especialista en 1 entorno RLVE, 4.000 rollouts | No disponible | HuggingFace, repo de 3,6 GB |
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` (modelo base) | 1,5 B nominales (~1,78 B reales) | 32.768 en la familia Qwen2.5 | Destilación de razonamiento desde DeepSeek-R1 | MIT (según el modelo base; no confirmado en este repo) | HuggingFace, ampliamente desplegado |
| `davidheineman/opd-teacher-Q2.5I-Cornfield-step149` | 1,5 B | 32.768 | Qwen2.5-1.5B-Instruct + RLVE/GRPO, 150 pasos, 1 entorno | No disponible | HuggingFace / Featherless |
| `davidheineman/opd-teacher-Q2.5I-Differentiate-step149` | 1,5 B | 32.768 | Qwen2.5-1.5B-Instruct + RLVE/GRPO, 150 pasos, entorno Differentiate (dificultad 0) | No disponible | HuggingFace / Featherless |

La diferencia relevante frente a los otros profesores de la misma colección es doble: aquí el punto de partida es un destilado de razonamiento (R1-Distill-Qwen-1.5B) en lugar de Qwen2.5-1.5B-Instruct, y el presupuesto de entrenamiento es mucho mayor (4.000 rollouts frente a 150 pasos), con un criterio de parada por pass@1 en lugar de un número fijo de actualizaciones.

## Limitaciones y advertencias

- Especialización extrema: entrenado en un único entorno RLVE con dificultad fija 0/1, por lo que su rendimiento fuera de ese dominio no está caracterizado y previsiblemente degrada frente al modelo base.
- No es un asistente de propósito general: no hay evidencia de calidad conversacional, matemáticas, código o multilingüismo en la información disponible.
- Riesgo de alucinación: no evaluado; no se publican métricas de fidelidad ni de calibración.
- Sesgos conocidos: no documentados. Al no declararse idiomas ni composición del dataset, no es posible evaluar sesgo lingüístico o cultural.
- Licencia no declarada: la ausencia de licencia explícita impide asumir permisos de uso comercial. Conviene verificar la licencia del modelo base (`DeepSeek-R1-Distill-Qwen-1.5B`) antes de cualquier despliegue en producción.
- Idiomas no declarados: no se puede garantizar soporte de castellano ni de otras lenguas.
- Checkpoint de investigación sin mantenimiento: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (25/10/2026), sin historial de uso.
- No incluye estado de optimizador ni de dataloader, por lo que la reanudación exacta del entrenamiento no es posible solo con este repositorio.
- El nombre del repositorio incluye una fecha (20261025) y etiquetas internas del experimento (`120`, `MaxNoConflictingBombs`) cuyo significado no se explica en la model card; no deben interpretarse como características del modelo.
- Al ser un modelo *teacher* de destilación, su uso previsto implica generar grandes volúmenes de datos: conviene aplicar filtrado y verificación automática antes de reutilizar sus salidas como datos de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-120-MaxNoConflictingBombs-20261025
- Colección "RLVE OPD Teachers": https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Ejecución de W&B del entrenamiento: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/2977459c (grupo `data-scaling-v1-n128-20261022-225839`)
- Repositorio de código RLVE: https://github.com/davidheineman/rlve
- Paper de entornos referenciado en la colección: https://arxiv.org/abs/2511.07317
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Profesor hermano (Cornfield, step 149): https://featherless.ai/models/davidheineman/opd-teacher-Q2.5I-Cornfield-step149
- Profesor hermano (Differentiate, step 149): https://featherless.ai/models/davidheineman/opd-teacher-Q2.5I-Differentiate-step149
