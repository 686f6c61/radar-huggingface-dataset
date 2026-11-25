# RadixArk/Qwen3-8B-5layer-Dense-FFN98304-jw-4ep-trainstate-step32880

## Resumen

Este repositorio no contiene un modelo listo para inferencia, sino el estado completo de entrenamiento (*training state*) de un modelo borrador de decodificación especulativa construido sobre Qwen3-8B. Lo publica el usuario RadixArk bajo el marco interno "specforge/dspark" y corresponde al paso global 32880 de la ejecución `qwen3-8b-5layer-dense98304-jw144-4ep`. El artefacto está pensado para reanudar entrenamiento de forma exacta, no para servir como modelo generativo autónomo.

El componente entrenado es un *draft model* de 5 capas con FFN densa de 98304 unidades, que predice tokens en bloques de 16 apoyándose en anclas extraídas de las capas 1, 9, 17, 25 y 33 del modelo objetivo Qwen3-8B. La innovación práctica es el mecanismo de *hand-off*: se publican pesos en bf16, shards FSDP con estado de AdamW fusionado, parámetros maestros en fp32, estado del scheduler coseno, RNG y los identificadores exactos de muestras consumidas por cada rango.

Su relevancia es acotada pero clara para equipos que investigan decodificación especulativa: permite reproducir bit a bit una fase intermedia de entrenamiento sin recalcular 32880 pasos. No es un modelo para producción ni para uso directo con vLLM o llama.cpp; es material de investigación y continuidad de *training runs*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador de 5 capas con FFN densa de 98304 unidades; entrenamiento tipo dspark con anclas sobre Qwen3-8B |
| Parametros totales | no disponible (el repositorio contiene pesos bf16 del draft y shards FSDP del estado completo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se publican pesos bf16 y parámetros maestros fp32; no hay GGUF ni cuantizaciones listas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `training_state.pt` (bf16) y `training_state_rank{0..15}.pt` (shards FSDP SHARD_GRAD_OP con AdamW fusionado, fp32 master params, scheduler y RNG) |

## Arquitectura y entrenamiento

El draft es un transformer de 5 capas ocultas que opera como modelo especulativo sobre Qwen3-8B. La configuración `dspark` define anclas en las capas 1, 9, 17, 25 y 33 del modelo objetivo, tamaño de bloque 16, 512 anclas, backend de atención `flex_attention` y token de máscara 151669. La función de pérdida combina CE con alpha 0.1 y L1 con alpha 0.9, decaimiento gamma 7.0 y cabeza de confianza desactivada (alpha 0.0).

El entrenamiento usó 16 rangos (world_size 16), batch size 3 con 3 pasos de acumulación, una época y 39456 pasos efectivos totales. El scheduler es coseno con warmup de 1578 épocas, LR base 6e-4, LR actual 4.3526e-05, `max_grad_norm` 1.0 y AdamW fusionado con weight decay desacoplado y `weight_decay` 0.0. Se publican los índices de datos exactos consumidos por rango (295920 muestras por rango, step × 9) y el commit de código `f268321d` para reproducibilidad.

## Capacidades

- No es un modelo de inferencia: no genera texto, código, matemáticas ni visión de forma autónoma.
- Función prevista: servir como modelo borrador para decodificación especulativa sobre Qwen3-8B.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- Capacidad especial: reanudación exacta de entrenamiento (optimizador, scheduler, RNG y muestras consumidas).
- Capacidad especial: predicción en bloques de 16 tokens con 512 anclas y máscara dedicada.

## Casos de uso

- Reanudación exacta de entrenamiento: cargar `training_state.pt` y los 16 shards FSDP para continuar desde el paso 32880 sin recalcular el estado del optimizador ni el scheduler.
- Investigación en decodificación especulativa: analizar cómo un draft de 5 capas con FFN de 98304 se comporta frente a Qwen3-8B con anclas en capas intermedias concretas.
- Reproducibilidad de experimentos: los ficheros `data-index/rank{0..15}.txt` y `SHA256SUMS` permiten verificar que cada rango consumió exactamente las mismas muestras.
- Auditoría de *training runs*: el `meta/` con receta, configuración del draft y commit de código facilita revisiones internas de hiperparámetros.
- Estudio de estabilidad numérica: los parámetros maestros fp32 y el estado AdamW fusionado permiten inspeccionar la evolución de momentos y la norma de gradiente.
- Base para ablaciones: modificar el número de capas del draft o el tamaño de bloque y comparar contra este punto de control como referencia congelada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 96.1 GB, por lo que el almacenamiento necesario para descargarlo completo es de al menos 100 GB.
- El entrenamiento se realizó con world_size 16 y FSDP SHARD_GRAD_OP, lo que implica un clúster multi-GPU; no se especifica el modelo de GPU.
- VRAM para inferencia del draft: no disponible (no se documenta el número de parámetros del borrador).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinada; el artefacto no está pensado para despliegue.
- Opciones de despliegue: no aplica (no hay pesos en GGUF, safetensors de inferencia ni plantilla de chat); requiere el código del commit `f268321d` para cargar el estado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|---|
| RadixArk/Qwen3-8B-5layer-Dense-FFN98304-jw-4ep-trainstate-step32880 | Estado de entrenamiento de draft especulativo | no disponible | no disponible | apache-2.0 | Reanudar entrenamiento |
| yushengsu/Qwen3-8B-5layer-Dense-FFN98304-jw-4ep-trainstate-step29592 | Estado de entrenamiento de draft especulativo (mismo layout) | no disponible | no disponible | no disponible | Reanudar entrenamiento |
| Qwen/Qwen3-8B | Modelo base generativo | 8B | no disponible en esta ficha | apache-2.0 | Inferencia general |

## Limitaciones y advertencias

- No es un modelo utilizable directamente para inferencia: faltan pesos consolidados en formato estándar y plantilla de chat.
- El estado está ligado al commit `f268321d` y a la configuración `dspark`; cargarlo con otro código puede fallar.
- Requiere reproducir el entorno FSDP con world_size 16 para interpretar correctamente los shards.
- Los sesgos heredados de Qwen3-8B y de su dataset de entrenamiento no se documentan en esta ficha.
- Riesgo de alucinación: no evaluable, al no existir benchmarks de generación para este artefacto.
- Licencia apache-2.0 permite uso comercial del artefacto, pero su naturaleza de estado de entrenamiento limita el uso práctico.
- No hay garantías de soporte, mantenimiento ni actualizaciones por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/RadixArk/Qwen3-8B-5layer-Dense-FFN98304-jw-4ep-trainstate-step32880
- Modelo de referencia de layout: https://huggingface.co/yushengsu/Qwen3-8B-5layer-Dense-FFN98304-jw-4ep-trainstate-step29592
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
