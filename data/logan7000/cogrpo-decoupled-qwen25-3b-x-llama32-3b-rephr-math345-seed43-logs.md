# logan7000/cogrpo-decoupled-qwen25-3b-x-llama32-3b-rephr-math345-seed43-logs

## Resumen

Este repositorio no contiene un modelo entrenado, sino los registros de entrenamiento (logs y metadatos de ejecución) de un experimento de co-GRPO (cooperative Group Relative Policy Optimization) con configuración "decoupled", correspondiente a la semilla 43. El autor es logan7000 y el artefacto principal es un conjunto de ficheros de trazabilidad: scripts de lanzamiento, logs por grupo, estados del entrenador, argumentos de entrenamiento decodificados y notas de entorno. El experimento combina dos modelos de 3B parámetros: Qwen2.5-3B (grupo A, preguntas originales) y Llama-3.2-3B-Instruct (grupo B, preguntas reformuladas), entrenados sobre problemas matemáticos de nivel 3 a 5 del dataset MATH.

El interés del artefacto es metodológico: documenta una ejecución completa de 136 pasos sobre un nodo con 4 GPU RTX PRO 6000 (Blackwell, Max-Q) usando DeepSpeed ZeRO-3 y vLLM en modo colocate, con los hiperparámetros del paper de referencia. Incluye además una evaluación post-hoc del grupo B en los checkpoints 130 y 136, y conserva un primer intento fallido que se detuvo en el paso 56 por un timeout del watchdog de NCCL.

No se trata, por tanto, de pesos listos para inferencia ni de una model card con especificaciones de arquitectura o benchmarks convencionales. Los pesos de los checkpoints se publican en repositorios separados (groupA-qwen-ckpts y groupB-llama-ckpts), mientras que este repositorio alberga únicamente los logs. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de logs; los modelos subyacentes son Qwen2.5-3B y Llama-3.2-3B-Instruct) |
| Parametros totales | no disponible (los modelos subyacentes tienen aproximadamente 3B cada uno) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no aplica a este repositorio (contiene logs, JSON y scripts); los checkpoints se publican en repositorios separados |

## Arquitectura y entrenamiento

El artefacto documenta un entrenamiento de co-GRPO en configuración "decoupled": el grupo A entrena Qwen2.5-3B sobre las preguntas originales del dataset MATH (niveles 3 a 5) y el grupo B entrena Llama-3.2-3B-Instruct sobre versiones reformuladas de esas mismas preguntas. La ejecución se realizó sobre un único nodo con 4 GPU RTX PRO 6000 (arquitectura Blackwell, variante Max-Q), con DeepSpeed ZeRO-3 para el reparto de estados y vLLM en modo colocate para la generación durante el entrenamiento. Se emplearon los hiperparámetros del paper, con la semilla 43.

La ejecución completada consta de 136 pasos. El historial conserva también un primer intento que se detuvo en el paso 56 por un timeout del watchdog de NCCL en el grupo A, mientras el grupo B ejecutaba un paso de 2598 segundos. Los resultados de evaluación en entrenamiento (eval_reward sobre un conjunto de validación fijo, pass@1) muestran para el grupo A un mejor valor de 0.652 en el paso 130 y para el grupo B un mejor valor de 0.550 en el paso 80, con 0.540 en la evaluación post-hoc del checkpoint 136. No se detalla en la información disponible la composición exacta del dataset, el número de tokens de entrenamiento ni si hubo etapas de RLHF o DPO más allá del propio bucle de GRPO.

## Capacidades

- Este repositorio no expone un modelo con capacidades de inferencia; contiene logs, estados del entrenador y metadatos de ejecución.
- Documenta una ejecución reproducible de co-GRPO con DeepSpeed ZeRO-3 y vLLM colocate sobre 4 GPU.
- Incluye scripts de lanzamiento, stdout y logs por grupo (group_A, group_B).
- Incluye `trainer_state.json` y `training_args.json` (este último como JSON decodificado en lugar de `training_args.bin`).
- Incluye `best_metric.json` y ficheros de texto de Weights & Biases (config, summary, output log, requirements).
- Incluye evaluación post-hoc del grupo B en los checkpoints 130 y 136 (`posteval_summary.json`).
- Conserva el historial del primer intento fallido (paso 56) para trazabilidad.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en este artefacto.

## Casos de uso

- Reproducción de experimentos de co-GRPO: los logs y los argumentos de entrenamiento permiten reconstruir la configuración exacta (semilla 43, hiperparámetros del paper, ZeRO-3, vLLM colocate) y repetir la ejecución en hardware equivalente.
- Depuración de fallos distribuidos: el historial del intento detenido en el paso 56 por timeout del watchdog de NCCL sirve para estudiar desequilibrios de duración entre grupos (paso de 2598 s en el grupo B) y ajustar timeouts o reparto de carga.
- Análisis de curvas de recompensa: los `trainer_state.json` de ambos grupos permiten comparar la evolución de eval_reward (0.652 en el grupo A, 0.550 en el grupo B) y estudiar el efecto del reformulado de preguntas.
- Auditoría de metodología: investigadores que evalúan la configuración "decoupled" pueden verificar los hiperparámetros efectivos y las decisiones de empaquetado sin necesidad de acceso al clúster original.
- Comparación entre variantes: el propio autor referencia el experimento espejo (`cogrpo-decoupled-qwen25-3b-rephr-x-llama32-3b-math345-seed43-logs`), de modo que estos logs permiten contrastar ambas configuraciones con la misma semilla.
- Trazabilidad para publicación: los ficheros de W&B y los resúmenes post-hoc facilitan adjuntar evidencia de ejecución a un artículo o informe técnico.
- Reutilización de infraestructura: el script de lanzamiento y las notas de entorno sirven como plantilla para montar entrenamientos GRPO multi-grupo con ZeRO-3 y vLLM colocate en nodos de 4 GPU.

## Benchmarks y rendimiento

Los únicos datos numéricos publicados son las recompensas de evaluación en entrenamiento (pass@1 sobre un conjunto de validación fijo), no benchmarks estándar como MMLU, HumanEval o GSM8K.

| Grupo | Modelo | Mejor eval_reward | Paso del mejor | Valor final |
|---|---|---|---|---|
| A | Qwen2.5-3B | 0.652 | 130 | último eval en entrenamiento en el paso 130 |
| B | Llama-3.2-3B-Instruct | 0.550 | 80 | 0.540 (post-eval del checkpoint 136) |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- Entrenamiento documentado: un nodo con 4 GPU RTX PRO 6000 (Blackwell, Max-Q), DeepSpeed ZeRO-3 y vLLM en modo colocate.
- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas para reproducir el entrenamiento: las 4 RTX PRO 6000 del entorno original; no se documentan alternativas.
- Compatibilidad con GPU de consumo: no disponible; el propio entorno usa variantes Max-Q de gama profesional.
- Opciones de despliegue: no aplica a este repositorio de logs; los checkpoints publicados por separado podrían servirse con vLLM, pero no se detalla en la información disponible.
- Latencia y throughput: no disponibles; solo se menciona un paso de 2598 s en el grupo B durante el primer intento.

## Comparativa con modelos similares

| Artefacto | Contenido | Modelos implicados | Semilla | Estado | Licencia |
|---|---|---|---|---|---|
| Este repositorio (seed 43, decoupled) | Logs de la ejecución completada (136 pasos) + intento fallido | Qwen2.5-3B (A) y Llama-3.2-3B-Instruct (B) | 43 | Completo | apache-2.0 |
| `cogrpo-decoupled-qwen25-3b-rephr-x-llama32-3b-math345-seed43-logs` | Configuración espejo (Qwen sobre preguntas reformuladas) | Mismos modelos, roles invertidos | 43 | No disponible | no disponible |
| Repositorios de checkpoints `...-groupA-qwen-ckpts` y `...-groupB-llama-ckpts` | Pesos de cada checkpoint guardado | Qwen2.5-3B y Llama-3.2-3B-Instruct | 43 | Completo | no disponible |

No se dispone de información sobre otros artefactos de logs comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable para inferencia: contiene logs, JSON y scripts, no pesos.
- Los datos de rendimiento son recompensas internas de validación (pass@1), no benchmarks estándar; no son comparables con cifras de MMLU, GSM8K o HumanEval.
- El conjunto de validación es fijo y propio del experimento; no se documenta su composición ni su tamaño.
- El grupo B muestra un mejor valor en el paso 80 (0.550) y un valor inferior en el paso 136 (0.540), lo que sugiere posible sobreajuste o degradación tardía; conviene tenerlo en cuenta al reutilizar checkpoints.
- El primer intento se interrumpió por un timeout del watchdog de NCCL con un paso de 2598 s; la reproducibilidad en hardware distinto puede verse afectada por este tipo de desequilibrios.
- Rutas, nombres de host e IP fueron sustituidos por placeholders, por lo que los scripts no se ejecutan tal cual sin reconfiguración.
- `training_args.bin` se sustituye por `training_args.json`; herramientas que esperen el formato binario original pueden requerir conversión.
- No se documentan sesgos, cobertura idiomática ni riesgos de alucinación del modelo subyacente en este repositorio.
- La licencia Apache 2.0 se declara para el artefacto; las condiciones de los modelos base (Qwen2.5-3B y Llama-3.2-3B-Instruct) deben verificarse en sus respectivas model cards antes de uso comercial.

## Enlaces

- Repositorio de logs: https://huggingface.co/logan7000/cogrpo-decoupled-qwen25-3b-x-llama32-3b-rephr-math345-seed43-logs
- Checkpoints grupo A (Qwen): https://huggingface.co/logan7000/cogrpo-decoupled-qwen25-3b-x-llama32-3b-rephr-math345-seed43-groupA-qwen-ckpts
- Checkpoints grupo B (Llama): https://huggingface.co/logan7000/cogrpo-decoupled-qwen25-3b-x-llama32-3b-rephr-math345-seed43-groupB-llama-ckpts
- Checkpoints del primer intento, grupo A: https://huggingface.co/logan7000/cogrpo-decoupled-qwen25-3b-x-llama32-3b-rephr-math345-seed43-attempt1-groupA-qwen-ckpts
- Checkpoints del primer intento, grupo B: https://huggingface.co/logan7000/cogrpo-decoupled-qwen25-3b-x-llama32-3b-rephr-math345-seed43-attempt1-groupB-llama-ckpts
- Experimento espejo (Qwen sobre preguntas reformuladas): https://huggingface.co/logan7000/cogrpo-decoupled-qwen25-3b-rephr-x-llama32-3b-math345-seed43-logs
