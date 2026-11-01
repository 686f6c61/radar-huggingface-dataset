# hossain0909/Keural-Cortex-8B-64K-training-state

## Resumen

Keural-Cortex-8B-64K-training-state no es un modelo ejecutable, sino el estado final de entrenamiento (step 795/795) de la fase 5 de extension de contexto de 32K a 64K sobre Qwen3-8B-Base. Lo publica hossain0909 (MKD Co., Ltd.) en formato PyTorch Distributed Checkpoint (DCP) con el objetivo declarado de archivo y reproducibilidad, no de inferencia. El repositorio ocupa 49,2 GB porque incluye los momentos del optimizador AdamW, que no forman parte del modelo exportado.

El modelo subyacente parte de Qwen3-8B-Base de Alibaba Cloud y se somete a un continued pretraining (CPT) en cinco fases; esta fase 5 consume 2.500.853.760 tokens (2,50B) con una longitud de secuencia de 65.536 tokens y un batch global de 3.145.728 tokens por paso. La tasa de aprendizaje final es 1,0e-06, al término de una decodificacion WSD.

La relevancia de esta ficha es acotada: el artefacto no sirve para `from_pretrained()` ni para desplegar inferencia. Su interes es documental, para estudiar configuraciones de entrenamiento FSDP a contexto largo y los requisitos de reanudacion. El modelo utilizable se distribuye por separado en `mkd-hossain/Keural-Cortex-8B-64K`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B-Base); el artefacto es un checkpoint DCP de entrenamiento FSDP |
| Parametros totales | 8B (modelo base Qwen3-8B-Base); el checkpoint incluye parametros + momentos AdamW |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens (64K) en esta fase |
| Tipos de cuantizacion | no disponible (el artefacto no es un modelo inferible; no se publican pesos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | PyTorch Distributed Checkpoint (DCP): 4 shards `.distcp` de ~12,3 GB, `.metadata` (1,25 MB) y `meta.json` (~1 KB) |

## Arquitectura y entrenamiento

El artefacto contiene el estado de un entrenamiento distribuido con Fully Sharded Data Parallel (FSDP) sobre 4 rangos. Cada shard `.distcp` almacena los parametros del modelo y los momentos del optimizador AdamW (`exp_avg`, `exp_avg_sq`) correspondientes a un rango. El fichero `.metadata` actua como indice tensor-a-shard y `meta.json` guarda el paso, el recuento de tokens, el estado del planificador de LR y la configuracion completa de entrenamiento.

La configuracion de reanudacion es estricta: `world_size: 4`, `micro_bsz: 1`, `grad_accum: 12`, `seq_len: 65536` y `fused_linear_cross_entropy: true`. Esta ultima opcion no es opcional: sin ella el entrenamiento agota la memoria por una asignacion de logits en fp32 de 37,09 GiB a secuencia 65.536. Reanudar con un `world_size` distinto exige un reshard DCP, y ademas se requiere el corpus original referenciado en `meta.json`, que no forma parte del repositorio. El entrenamiento parte de `exports/full/step_0010000` del CPT de 41B y aplica una decodificacion WSD hasta 1,0e-06.

## Capacidades

- El artefacto no es un modelo cargable: `from_pretrained()` no funciona y no admite inferencia.
- No se documentan capacidades de generacion, razonamiento, codigo, matematicas, vision, tool calling ni agentes para este repositorio.
- Las capacidades efectivas corresponderian al modelo exportado `mkd-hossain/Keural-Cortex-8B-64K` y a su base Qwen3-8B-Base, no a este checkpoint.
- Uso previsto: reanudacion de entrenamiento y auditoria de la configuracion FSDP.

## Casos de uso

- Reproducibilidad de entrenamiento: permite reanudar exactamente el paso 795 con la configuracion original, conservando los momentos de AdamW que se perderian al reiniciar desde pesos exportados.
- Auditoria de configuracion: `meta.json` documenta paso, tokens, estado del planificador y configuracion completa, util para revisar decisiones de entrenamiento a contexto largo.
- Estudio de FSDP a secuencia 65.536: el checkpoint sirve como caso de referencia sobre sharding, memoria de logits y necesidad de `fused_linear_cross_entropy`.
- Investigacion de extension de contexto: permite analizar la fase 5 (32K a 64K) y su coste en tokens (2,50B) frente a fases previas.
- Archivado de linaje: junto al registro de auditoria en GitHub, documenta la procedencia del modelo derivado de Qwen3-8B-Base.
- Formacion y docencia: ejemplo real de checkpoint DCP con 4 rangos y ~30 GB de estado de optimizador, util para explicar por que un checkpoint de entrenamiento pesa mas que el modelo exportado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: 49,2 GB de repositorio; ~46 GB de estado de entrenamiento frente a los ~16 GB del modelo exportado.
- Inferencia: no aplicable, el artefacto no es cargable.
- Reanudacion: requiere 4 rangos FSDP (`world_size: 4`); un `world_size` distinto exige reshard DCP.
- Memoria: a `seq_len` 65.536 y `micro_bsz` 1, sin `fused_linear_cross_entropy` se produce una asignacion de logits fp32 de 37,09 GiB que provoca OOM; con la opcion activada se reduce ese pico.
- GPU recomendadas: no disponible en la informacion proporcionada; el requisito documentado es de 4 rangos y memoria suficiente para la configuracion indicada.
- Despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI; el formato DCP solo es utilizable con el stack de entrenamiento PyTorch/FSDP.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso |
|---|---|---|---|---|---|
| Keural-Cortex-8B-64K-training-state | 8B (+ estado AdamW) | 65.536 | DCP (4 shards) | Apache 2.0 | Solo reanudacion/archivo |
| mkd-hossain/Keural-Cortex-8B-64K | 8B | 64K | no disponible | Apache 2.0 | Inferencia (modelo exportado) |
| Qwen/Qwen3-8B-Base | 8B | no disponible en la informacion | safetensors (presumible, no confirmado) | Apache 2.0 | Inferencia y fine-tuning |

La comparativa se limita a los tres artefactos citados en la informacion; no se dispone de datos de rendimiento para contrastar.

## Limitaciones y advertencias

- No es un modelo: `from_pretrained()` falla y no puede usarse para inferencia ni para despliegue en produccion.
- Dependencia de shard count: escrito por 4 rangos FSDP y espera 4; otro `world_size` requiere reshard DCP.
- Dependencia de datos: reanudar exige el corpus original referenciado en `meta.json`, que no esta en el repositorio.
- Dependencia de configuracion: `fused_linear_cross_entropy: true` es obligatorio a 65.536 tokens; sin el se produce OOM.
- Sin datos de sesgos, alucinacion o cobertura idiomatica para este artefacto; habria que consultarlos en el modelo exportado o en Qwen3-8B-Base.
- Licencia Apache 2.0 heredada del base, sujeta a los terminos del modelo original de Alibaba Cloud.
- Descargas y likes a cero en el momento de la consulta; sin validacion de la comunidad.

## Enlaces

- HuggingFace del artefacto: https://huggingface.co/hossain0909/Keural-Cortex-8B-64K-training-state
- Modelo exportado para inferencia: https://huggingface.co/mkd-hossain/Keural-Cortex-8B-64K
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Registro de auditoria y detalles de CPT: https://github.com/MKD-CORP/Keural-Cortex-8B
