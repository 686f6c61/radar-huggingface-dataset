# davidheineman/rlve-opd-teacher-R1Distill-100-CirculatingGrid-20261025

## Resumen

rlve-opd-teacher-R1Distill-100-CirculatingGrid-20261025 es un modelo de lenguaje de tipo «teacher» (profesor) para destilación on-policy (OPD), publicado por el investigador davidheineman como artefacto final de un experimento de escalado de datos con RLVE. No es un modelo de propósito general: es un especialista entrenado con GRPO sobre un único entorno, CirculatingGrid (etiquetado como «100-CirculatingGrid» en el nombre del repositorio), partiendo en cada ejecución desde DeepSeek-R1-Distill-Qwen-1.5B.

Conserva la arquitectura Qwen2 del modelo base y un total de 1.777.088.000 parámetros en safetensors, con un repositorio de 3,6 GB en la librería transformers. Su función declarada es generar trayectorias de alta calidad dentro de ese entorno concreto para que actúen como profesor en experimentos de destilación hacia modelos estudiantes; el autor documenta el régimen de entrenamiento (4.000 rollouts, checkpoint final en la actualización 499, criterio de parada por pass@1 ≥ 0,98 en validación ID) pero no publica benchmarks generales ni la composición del dataset.

Su interés actual es metodológico: ejemplifica la práctica de publicar los pesos finales de experimentos de RL y escalado de datos para que otros equipos puedan reproducir, auditar o reutilizar los profesores. Sin embargo, su naturaleza de artefacto de investigación —sin licencia declarada, sin idiomas declarados y especializado en una sola tarea— acota drásticamente su uso fuera de ese contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (heredada de deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B) |
| Parámetros totales | 1.777.088.000 (aproximadamente 1,78 mil millones) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponibles: el repositorio solo publica safetensors en precisión original; no se han publicado conversiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponibles: el repositorio no declara idiomas |
| Licencia | No disponible: el repositorio no declara licencia |
| Formato de pesos | Safetensors, junto con tokenizer y ficheros de configuración (tamaño del repo: 3,6 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base DeepSeek-R1-Distill-Qwen-1.5B, un transformer decoder-only de la familia Qwen2 con alrededor de 1,78 mil millones de parámetros en un único tensor de pesos denso. El autor indica que todos los actores se inicializaron de nuevo desde ese modelo base, de modo que el checkpoint publicado no parte de ningún ajuste previo del profesor. El repositorio contiene únicamente pesos, tokenizer y configuración; no incluye estado de optimizador ni de dataloader, por lo que no es reanudable tal cual.

El método de entrenamiento es GRPO especializado sobre un solo entorno (CirculatingGrid), con dificultad fija y equilibrada 0/1. La generación durante el entrenamiento emplea 1.024 tokens iniciales más una continuación forzada de respuesta de 128 tokens. El presupuesto se fijó en 4.000 rollouts y el checkpoint final corresponde a la actualización 499 (indexada desde cero), es decir, exactamente esos 4.000 rollouts. La parada se produce al alcanzar el tope de rollouts o cuando el pass@1 de validación ID es ≥ 0,98; la validación usa 32 prompts con 8 respuestas por prompt cada 50 actualizaciones y no computa contra el presupuesto de entrenamiento. La lista de entornos y los ajustes originales están en `training_run.json`, con la configuración exacta en `training_config.yaml`, y la ejecución está registrada en Weights & Biases.

## Capacidades

- Generación de texto autoregresiva dentro del entorno CirculatingGrid, con el formato de generación empleado en entrenamiento (1.024 tokens iniciales + 128 tokens de continuación forzada de respuesta).
- Razonamiento especializado en la tarea concreta del entorno, optimizado por GRPO hasta un criterio de parada de pass@1 ≥ 0,98 en validación ID.
- Función de profesor para destilación on-policy: genera trayectorias que se usan como señal para entrenar modelos estudiantes.
- Compatibilidad con text-generation-inference y con el tag `endpoints_compatible`, lo que permite servirlo mediante la API de inferencia estándar de HuggingFace.
- Etiquetado como `conversational`, aunque no se documenta ningún ajuste conversacional específico más allá del formato de prompt del entorno.
- Capacidades de tool calling / function calling: no documentadas.
- Capacidades de agente multi-paso: no documentadas fuera del bucle de rollouts del entorno.
- Capacidades multilingües: no documentadas; el repositorio no declara idiomas.
- Visión, audio o modalidades adicionales: no disponibles.

## Casos de uso

- Destilación on-policy: usar el modelo como profesor que genera trayectorias en CirculatingGrid para entrenar un estudiante de menor capacidad, aprovechando que el checkpoint está optimizado para esa distribución concreta.
- Reproducción de experimentos de escalado de datos: cargar los pesos finales para replicar las curvas de pass@1 y comparar contra otros profesores del mismo grupo de ejecución (`data-scaling-v1-n128-20261022-225839`).
- Estudio de la dinámica de GRPO: analizar el efecto de 4.000 rollouts y 499 actualizaciones sobre un modelo de 1,5B, comparando el checkpoint con el base sin entrenar.
- Generación de datos sintéticos para el entorno: producir pares pregunta-respuesta con el formato 1.024 + 128 tokens para aumentar el corpus de entrenamiento o de evaluación de otros modelos.
- Evaluación de pipelines de RL: emplear el modelo como referencia de «profesor convergido» y medir la brecha de rendimiento de estudiantes en curso dentro del mismo harness de validación (32 prompts × 8 respuestas).
- Investigación sobre especialización y olvido catastrófico: cuantificar cuánto se degrada el rendimiento en tareas generales tras el ajuste intensivo en un único entorno verificable.
- Baseline en experimentos de RLVE: servir como punto de comparación reproducible para nuevos profesores entrenados con distintos presupuestos de rollouts o distintas dificultades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Como referencia del régimen de entrenamiento (no son benchmarks de calidad), el autor documenta los siguientes parámetros:

| Métrica de entrenamiento | Valor |
|---|---|
| Algoritmo | GRPO (especialista) |
| Entornos de entrenamiento | 1 (CirculatingGrid, dificultad fija 0/1) |
| Rollouts totales | 4.000 |
| Actualización final del checkpoint | 499 (indexada desde cero) |
| Criterio de parada | 4.000 rollouts o pass@1 de validación ID ≥ 0,98 |
| Protocolo de validación | 32 prompts × 8 respuestas cada 50 actualizaciones (no computa en el presupuesto) |
| Longitud de generación | 1.024 tokens iniciales + 128 tokens de continuación forzada |

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 3,6 GB solo de pesos, más caché KV y overhead; presupuesto práctico de 5-6 GB.
- VRAM estimada en int8: aproximadamente 1,8-2 GB de pesos, con un total práctico de 2,5-3 GB.
- VRAM estimada en int4: aproximadamente 0,9-1,1 GB de pesos, con un total práctico de 1,5-2 GB (requiere conversión propia, no publicada).
- GPU profesionales: A100 40/80 GB, H100, L4 24 GB, A10G 24 GB; el modelo es sobradamente pequeño para cualquiera de ellas y el cuello de botella será el throughput, no la memoria.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti 12 GB y RTX 4090 24 GB en bf16; en tarjetas de 6-8 GB conviene cuantizar a int8 o int4.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (etiqueta del repo), vLLM (la familia Qwen2 está soportada), y llama.cpp/Ollama solo tras convertir manualmente a GGUF, ya que el repositorio no incluye artefactos GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rlve-opd-teacher-R1Distill-100-CirculatingGrid-20261025 | 1,78B | No disponible | Profesor GRPO para CirculatingGrid | No disponible | HuggingFace (0 descargas, 0 likes) |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B (base) | 1,78B | No disponible en esta ficha (consultar su model card) | Razonamiento general destilado de R1 | No verificada aquí; consultar el repositorio del base | HuggingFace, ampliamente distribuido |
| davidheineman/opd-teacher-Q2.5I-LinkBeads-step149 (modelo hermano) | No disponible | No disponible | Profesor GRPO para LinkBeads a dificultad 0, 150 actualizaciones, pensado para destilación en un setup de 32 entornos | No disponible | HuggingFace / Featherless |
| Qwen2.5-1.5B-Instruct (alternativa generalista de la misma familia) | ~1,5B | No verificado en esta ficha | Instrucciones y conversación general | No verificada aquí; consultar su model card | HuggingFace, ampliamente distribuido |

La comparación relevante no es de rendimiento bruto, sino de propósito: los dos profesores de davidheineman son artefactos de investigación de un solo entorno, mientras que el base y Qwen2.5-1.5B-Instruct son modelos generalistas. Cualquier comparación cuantitativa exigiría ejecutar el mismo harness de validación, que no se ha publicado con resultados.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse permiso de uso comercial. Debe verificarse la licencia del modelo base y contactar con el autor antes de cualquier despliegue productivo.
- Especialización extrema: entrenado con GRPO sobre un único entorno y con criterio de parada de pass@1 ≥ 0,98 en validación ID, lo que sugiere un ajuste muy agresivo a esa distribución y un riesgo alto de degradación fuera de ella.
- Sin evaluación fuera de distribución: no se reportan métricas OOD, de modo que se desconoce el olvido catastrófico sobre capacidades generales del base.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe ni de calidad en castellano.
- Riesgo de alucinación no caracterizado: al no publicarse evaluaciones de fidelidad, no puede acotarse.
- Formato de generación acoplado al entrenamiento (1.024 tokens iniciales + 128 de continuación forzada): usarlo con otros formatos de prompt puede degradar la calidad de forma impredecible.
- No reanudable: el repositorio omite el estado de optimizador y dataloader, por lo que no se puede continuar el entrenamiento desde este checkpoint.
- Sesgos no evaluados: no se documenta ningún análisis de sesgo, toxicidad o seguridad.
- Validación con muestra pequeña: 32 prompts × 8 respuestas cada 50 actualizaciones es un protocolo de investigación, no una evaluación robusta.
- Huella comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin reportes independientes de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-100-CirculatingGrid-20261025
- Repositorio RLVE (data primitives for RL): https://github.com/davidheineman/rlve
- Ejecución de Weights & Biases del entrenamiento: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/10fa7405
- Ejecución relacionada en W&B (rl-data-opd-teachers): https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/40eb51c9
- Modelo hermano en Featherless (opd-teacher-Q2.5I-LinkBeads-step149): https://featherless.ai/models/davidheineman/opd-teacher-Q2.5I-LinkBeads-step149
- Perfil del autor en GitHub: https://github.com/davidheineman
