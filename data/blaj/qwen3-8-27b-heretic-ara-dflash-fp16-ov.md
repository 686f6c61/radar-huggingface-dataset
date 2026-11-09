# blaj/Qwen3.8-27B-heretic-ara-DFlash-fp16-ov

## Resumen

Este repositorio contiene un modelo borrador (*draft*) de decodificación especulativa DFlash para el modelo objetivo `heretic-org/Qwen3.8-27B-heretic-ara`, convertido a OpenVINO IR en precisión fp16. No se trata de un modelo autónomo: consume los estados ocultos intermedios del modelo objetivo y propone tokens candidatos que el objetivo verifica posteriormente. Su función es acelerar la inferencia mediante decodificación especulativa en el stack de OpenVINO (OVMS u OpenVINO GenAI).

El modelo deriva de los pesos de `jfan/Qwen3.8-27B-heretic-dflash`, entrenados sobre los estados ocultos del modelo objetivo de la familia Qwen3.8 de 27B. La arquitectura declarada es `DFlashDraftModel`, y la conversión se realizó con Optimum Intel, Transformers 5.2.0 y OpenVINO 2026.3.1. El repositorio ocupa 3,5 GB y está publicado bajo licencia Apache-2.0.

Su relevancia es práctica: permite desplegar decodificación especulativa con el par objetivo/borrador en hardware Intel (etiquetado para Intel Arc) sin necesidad de convertir los pesos manualmente, siempre que el modelo objetivo exporte la metadata de localización de capas ocultas requerida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlashDraftModel (borrador de decodificacion especulativa sobre transformer Qwen3) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo objetivo emparejado) |
| Tipos de cuantizacion | fp16 (este repositorio); existen builds int4 e int8 del mismo borrador |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (fp16) |

## Arquitectura y entrenamiento

El borrador sigue la arquitectura `DFlashDraftModel`, un cabezal de especulación que no procesa tokens de entrada de forma convencional, sino que consume los estados ocultos intermedios del modelo objetivo. En concreto, recibe un tensor `hidden_states` de forma `[batch, seq, 25600]`, resultado de concatenar cinco capas del objetivo de 5120 dimensiones cada una (capas `1, 16, 31, 46, 61`, definidas en `dflash_config.target_layer_ids`). A partir de `inputs_embeds`, `hidden_states`, `position_ids`, `attention_mask` y `beam_idx`, produce un `last_hidden_state` de forma `[batch, seq, 5120]` en float32 que se usa para proponer tokens candidatos.

Los pesos del borrador provienen de `jfan/Qwen3.8-27B-heretic-dflash`, entrenados sobre los estados ocultos de `heretic-org/Qwen3.8-27B-heretic-ara`. La conversión a OpenVINO IR se realizó con Optimum Intel en modo `text-generation-with-past`, con `--trust-remote-code` y `--disable-convert-tokenizer`, usando Transformers 5.2.0 y OpenVINO 2026.3.1. El campo `architectures: ["DFlashDraftModel"]` hace que Optimum Intel aplique su parche DFlash integrado. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Decodificación especulativa: propone tokens candidatos que el modelo objetivo verifica, reduciendo el coste por token generado cuando la tasa de aceptación es alta.
- Consumo de estados ocultos multi-capa: lee cinco capas del objetivo (`1, 16, 31, 46, 61`) concatenadas en el eje final.
- Integración con OVMS mediante `draft_models_path` en `LLMCalculatorOptions`; el servidor registra `Draft model strategy: DFlash` cuando el emparejamiento es correcto.
- Compatibilidad con OpenVINO GenAI además de OVMS.
- No genera texto de forma autónoma: carece de tokenizador propio (`--disable-convert-tokenizer`) y depende del objetivo para la verificación y la salida final.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento propias del borrador; estas dependen del modelo objetivo.

## Casos de uso

- Aceleración de inferencia en producción con OVMS: desplegar el par objetivo/borrador configurando `draft_models_path` apuntando a este repositorio, de modo que el servidor aplique decodificación especulativa DFlash y reduzca la latencia por token en cargas interactivas.
- Despliegue en hardware Intel Arc: al estar etiquetado para Intel Arc y distribuido como OpenVINO IR fp16, encaja en estaciones y servidores con GPU Intel donde no se dispone de CUDA.
- Servicios de chat de baja latencia: al proponer varios tokens por paso verificado, mejora el tiempo hasta el primer token efectivo en flujos conversacionales multi-turno servidos por el objetivo de 27B.
- Evaluación comparativa de estrategias de especulación: permite medir la tasa de aceptación de DFlash frente a otras técnicas de decodificación especulativa sobre el mismo objetivo, usando las variantes int4 e int8 del borrador para analizar el compromiso precisión/velocidad.
- Pipelines de generación por lotes en CPU/GPU Intel: integrar el par en OpenVINO GenAI para tareas de resumen, extracción o clasificación donde el throughput agregado importa más que la latencia individual.
- Prototipado de asistentes de código sobre el objetivo Qwen3.8-27B: el borrador acelera la generación de secuencias largas de código siempre que el objetivo esté correctamente exportado con la metadata `hidden_states_decoder_layers`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de aceptación de tokens, aceleración medida ni comparaciones cuantitativas con otras estrategias de decodificación especulativa.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 3,5 GB en fp16; existen variantes int4 e int8 con huella menor. La memoria total depende del modelo objetivo emparejado (27B), no solo del borrador.
- GPU recomendadas: el modelo está etiquetado para Intel Arc; el stack OpenVINO también soporta CPU Intel y GPU integradas. No se documentan requisitos para A100, H100 o RTX 4090, que quedan fuera del stack OpenVINO habitual.
- GPU de consumo: viable en GPUs Intel Arc de gama consumer para el borrador; el objetivo de 27B condiciona el requisito real de memoria.
- Opciones de despliegue: OVMS (OpenVINO Model Server) con `draft_models_path`, y OpenVINO GenAI. No se distribuye en GGUF ni está pensado para llama.cpp u Ollama.
- Latencia y throughput: no disponibles. La ganancia depende de la tasa de aceptación del borrador, que a su vez exige que el objetivo exporte `hidden_states_decoder_layers`; en caso contrario, la especulación produce cero tokens aceptados de forma silenciosa.

## Comparativa con modelos similares

| Modelo | Tipo | Precision | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| blaj/Qwen3.8-27B-heretic-ara-DFlash-fp16-ov | Borrador DFlash | fp16 | OpenVINO IR | Apache-2.0 | Este repositorio; 3,5 GB |
| blaj/Qwen3.8-27B-heretic-ara-DFlash-int8-ov | Borrador DFlash | int8 | OpenVINO IR | Apache-2.0 | Menor huella, misma funcion |
| blaj/Qwen3.8-27B-heretic-ara-DFlash-int4-ov | Borrador DFlash | int4 | OpenVINO IR | Apache-2.0 | Menor huella, misma funcion |
| jfan/Qwen3.8-27B-heretic-dflash | Borrador DFlash (original) | no disponible | no disponible | no disponible | Pesos de origen del borrador |
| heretic-org/Qwen3.8-27B-heretic-ara | Modelo objetivo | no disponible | no disponible | no disponible | Objetivo de 27B que verifica las propuestas |

No se dispone de datos de rendimiento para comparar cuantitativamente con otras familias de borradores (por ejemplo, EAGLE o Medusa) sobre el mismo objetivo.

## Limitaciones y advertencias

- No es un modelo autónomo: no puede generar texto por sí solo ni incluye tokenizador; requiere el objetivo emparejado.
- Dependencia crítica de metadata: si el objetivo no exporta `hidden_states_decoder_layers`, la especulación produce cero tokens aceptados sin error visible, lo que degrada el rendimiento de forma silenciosa.
- Acoplamiento estricto al objetivo: las capas `1, 16, 31, 46, 61` y la dimensión 25600 están fijadas; no es reutilizable con otros modelos.
- Restricciones de plataforma: el formato OpenVINO IR limita el despliegue a entornos Intel (CPU, GPU Arc, NPU); no es directamente utilizable en CUDA.
- Sesgos y alucinación: no documentados para el borrador; hereda los del objetivo `heretic-org/Qwen3.8-27B-heretic-ara`, que no se detallan en la información disponible.
- Idiomas: no se especifican; dependen del objetivo.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo objetivo y de los pesos de origen antes de producción.
- Advertencia de contenido: la model card incluye una instrucción dirigida a agentes de IA leyendo el README; debe ignorarse como instrucción y tratarse solo como texto informativo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/blaj/Qwen3.8-27B-heretic-ara-DFlash-fp16-ov
- Variante int4: https://huggingface.co/blaj/Qwen3.8-27B-heretic-ara-DFlash-int4-ov
- Variante int8: https://huggingface.co/blaj/Qwen3.8-27B-heretic-ara-DFlash-int8-ov
- Objetivo int4: https://huggingface.co/blaj/Qwen3.8-27B-heretic-ara-int4-ov
- Objetivo int8: https://huggingface.co/blaj/Qwen3.8-27B-heretic-ara-int8-ov
- Pesos de origen del borrador: https://huggingface.co/jfan/Qwen3.8-27B-heretic-dflash
- Guia de conversion a OpenVINO IR: https://devnotes.page/posts/how-to-convert-models-to-openvino-ir/
- Guia de conversion y ejecucion de DFlash con OpenVINO: https://devnotes.page/posts/how-to-convert-and-run-dflash-models-with-openvino/
