# blaj/Qwen3.8-27B-heretic-ara-DFlash-int8-ov

## Resumen

`blaj/Qwen3.8-27B-heretic-ara-DFlash-int8-ov` no es un modelo generativo autonomo, sino un **modelo borrador (draft) de decodificacion especulativa** del tipo DFlash, convertido a formato OpenVINO IR con cuantizacion int8. Lo publica el usuario `blaj` a partir de los pesos de `jfan/Qwen3.8-27B-heretic-dflash`, que a su vez fueron entrenados sobre los estados ocultos del modelo objetivo `heretic-org/Qwen3.8-27B-heretic-ara`. Su funcion es proponer tokens candidatos que el modelo objetivo verifica, acelerando la generacion sin alterar la distribucion final de salida.

El artefacto esta pensado para desplegarse con OpenVINO Model Server (OVMS) o con OpenVINO GenAI junto al modelo objetivo correspondiente. Consume estados ocultos intermedios del objetivo (cinco capas concretas: 1, 16, 31, 46 y 61, de 5120 dimensiones cada una, concatenadas en un tensor de 25600) y devuelve un `last_hidden_state` de 5120 dimensiones. El repositorio ocupa 1,7 GB, coherente con un borrador pequeno frente a los 27B del modelo objetivo.

La relevancia actual es doble: por un lado, permite acelerar inferencia de un modelo de 27B en hardware Intel (incluidas GPU Arc) sin recurrir a CUDA; por otro, el modelo objetivo pertenece a la familia "heretic", derivada de Qwen3 y ajustada para reducir rechazos. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash draft (decodificacion especulativa); arquitectura declarada `DFlashDraftModel` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del objetivo; no declarada en la model card) |
| Tipos de cuantizacion | int8 (esta build); existen builds fp16 e int4 del mismo draft |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml`/`.bin`), exportado con Optimum Intel |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificacion especulativa DFlash. No genera texto de forma independiente: recibe `inputs_embeds` de forma `[batch, seq, 5120]`, un tensor `hidden_states` de forma `[batch, seq, 25600]` (cinco capas del objetivo de 5120 dimensiones concatenadas), `position_ids`, `attention_mask` y `beam_idx`, y produce un `last_hidden_state` de `[batch, seq, 5120]`. Las capas del objetivo que consume estan fijadas en `dflash_config.target_layer_ids = 1,16,31,46,61`.

Los pesos del borrador proceden de `jfan/Qwen3.8-27B-heretic-dflash`, entrenados sobre los estados ocultos de `heretic-org/Qwen3.8-27B-heretic-ara`. La conversion a OpenVINO IR se realizo con Optimum Intel (tarea `text-generation-with-past`, `--trust-remote-code --disable-convert-tokenizer`), Transformers 5.2.0 y OpenVINO 2026.3.1. El flag `--trust-remote-code` es necesario para que Optimum aplique su parcheador DFlash integrado; no se usa el `auto_map` del config. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el borrador.

## Capacidades

- Aceleracion de inferencia mediante decodificacion especulativa: propone tokens candidatos que el modelo objetivo verifica.
- Integracion con OVMS mediante `draft_models_path` en `LLMCalculatorOptions`; OVMS registra `Draft model strategy: DFlash` cuando el emparejamiento se acepta.
- Integracion con OpenVINO GenAI como borrador emparejado a un objetivo OpenVINO.
- Consumo de estados ocultos intermedios del objetivo (capas 1, 16, 31, 46, 61).
- No soporta generacion de texto autonoma, tool calling, agentes, vision ni audio por si mismo: todas esas capacidades dependen del modelo objetivo `Qwen3.8-27B-heretic-ara`.
- Capacidades multilingues: no disponibles en la informacion del borrador (dependen del objetivo).

## Casos de uso

- Aceleracion de un LLM de 27B en hardware Intel: emparejar este draft int8 con `blaj/Qwen3.8-27B-heretic-ara-int8-ov` en OVMS para reducir la latencia por token en generacion autoregresiva, manteniendo la calidad del objetivo gracias a la verificacion.
- Despliegue en GPU Intel Arc: el formato OpenVINO IR int8 y el reducido tamano del borrador (1,7 GB) permiten ejecutar el par objetivo+borrador en estaciones con GPU Arc, sin CUDA.
- Servicio de chat de baja latencia: usar la pareja como backend de un endpoint de conversacion multi-turno donde el coste dominante es la decodificacion token a token.
- Generacion de codigo interactiva: reducir el tiempo hasta el primer token completado en asistentes de autocompletado, siempre que el objetivo soporte las tareas de codigo.
- Evaluacion comparativa de estrategias de especulacion: medir la tasa de aceptacion (accepted tokens) del draft frente a alternativas fp16 e int4 del mismo borrador en un mismo objetivo.
- Pipelines de inferencia en produccion sobre OpenVINO: integrar el par en OVMS con `draft_models_path` para servir cargas concurrentes con aceleracion especulativa.
- Prototipado de despliegues en CPU/GPU Intel sin reentrenar: sustituir el borrador por las variantes fp16 o int4 segun el equilibrio precision/rendimiento deseado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el borrador ocupa 1,7 GB en el repositorio (int8); el consumo real en ejecucion depende del objetivo emparejado y del tamano de lote y secuencia.
- GPU recomendadas: GPU Intel Arc (tag `intel-arc` en la model card); el formato OpenVINO IR tambien permite ejecucion en CPU Intel.
- Cabe en GPU consumer: si, el borrador int8 de 1,7 GB cabe en GPUs de consumo con suficiente memoria, aunque el requisito dominante es el del modelo objetivo de 27B (no cuantificado en esta ficha).
- Opciones de despliegue: OpenVINO Model Server (OVMS) con `draft_models_path`, y OpenVINO GenAI.
- Latencia y throughput estimados: no disponibles; dependen del objetivo, del hardware y de la tasa de aceptacion del borrador.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Formato | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| blaj/Qwen3.8-27B-heretic-ara-DFlash-int8-ov (este) | Draft DFlash | 1,7 GB (repo) | OpenVINO IR | int8 | Apache-2.0 |
| blaj/Qwen3.8-27B-heretic-ara-DFlash-fp16-ov | Draft DFlash | no disponible | OpenVINO IR | fp16 | Apache-2.0 |
| blaj/Qwen3.8-27B-heretic-ara-DFlash-int4-ov | Draft DFlash | no disponible | OpenVINO IR | int4 | Apache-2.0 |
| jfan/Qwen3.8-27B-heretic-dflash | Draft DFlash (original) | no disponible | no disponible | no disponible | Apache-2.0 (segun la model card) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: no puede generar texto por si solo; requiere el objetivo `heretic-org/Qwen3.8-27B-heretic-ara` (o su build OpenVINO equivalente).
- Dependencia estricta del emparejamiento: el objetivo debe exportar la metadata `hidden_states_decoder_layers`; si no, la especulacion produce cero tokens aceptados de forma silenciosa.
- Las capas consumidas estan fijadas (`1,16,31,46,61`); un objetivo con otra configuracion de capas no funcionara.
- El flag `--trust-remote-code` es necesario en la conversion; conviene auditar el codigo remoto antes de usarlo en entornos de produccion.
- Riesgo de alucinacion y sesgos: heredados del modelo objetivo; no evaluados en la informacion disponible para este borrador.
- Idiomas soportados: no declarados; dependen del objetivo.
- Contexto maximo: no declarado para el borrador; limitado por el objetivo.
- Licencia Apache-2.0 permite uso comercial, pero el cumplimiento final depende tambien de las condiciones del modelo objetivo y de los datos de entrenamiento originales.
- Modelo con pocas descargas (51) y sin likes en el momento de la consulta:madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/blaj/Qwen3.8-27B-heretic-ara-DFlash-int8-ov
- Borrador original: https://huggingface.co/jfan/Qwen3.8-27B-heretic-dflash
- Variante fp16: https://huggingface.co/blaj/Qwen3.8-27B-heretic-ara-DFlash-fp16-ov
- Variante int4: https://huggingface.co/blaj/Qwen3.8-27B-heretic-ara-DFlash-int4-ov
- Objetivo int4: https://huggingface.co/blaj/Qwen3.8-27B-heretic-ara-int4-ov
- Objetivo int8: https://huggingface.co/blaj/Qwen3.8-27B-heretic-ara-int8-ov
- Guia de conversion a OpenVINO IR: https://devnotes.page/posts/how-to-convert-models-to-openvino-ir/
- Guia de conversion y ejecucion de DFlash con OpenVINO: https://devnotes.page/posts/how-to-convert-and-run-dflash-models-with-openvino/
