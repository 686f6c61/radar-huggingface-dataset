# huginnfork/Qwen3.8-27B-FP8

## Resumen

`huginnfork/Qwen3.8-27B-FP8` es un repositorio reservado en Hugging Face que planea alojar una cuantización FP8 del modelo base `Qwen/Qwen3.8-27B`, aún no publicado. El autor, `huginnfork`, ha creado este espacio para fijar públicamente el nombre y la receta de cuantización prevista antes de que existan los pesos reales. En el momento de redactar esta ficha, el repositorio no contiene ningún peso ni artefacto utilizable: es un marcador de posición.

La intención declarada es aplicar un esquema de cuantización FP8 dinámica (W8A8) sobre el tronco del transformador, manteniendo en bf16 la torre de visión, el bloque SSM `linear_attn`, el bloque `self_attn` completo y la cabeza de predicción multi-token (MTP). La herramienta prevista es `llm-compressor` del proyecto vLLM, con formato `compressed-tensors`. Dado que el modelo base no ha sido lanzado, todas las especificaciones técnicas, capacidades y rendimiento son desconocidos y no se pueden verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base no publicado; se espera similar a la familia Qwen3.6-27B) |
| Parametros totales | no disponible (el nombre sugiere 27B, sin confirmar) |
| Parametros activos | no disponible (podria ser MoE, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8_DYNAMIC (W8A8) planificado, atencion en bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (del repositorio; la licencia del modelo base se aplicara cuando exista) |
| Formato de pesos | compressed-tensors (planificado); actualmente sin pesos |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura real del modelo base `Qwen/Qwen3.8-27B` porque no ha sido publicado. El autor del repositorio indica que la receta de cuantizacion se ha heredado de builds previos de la familia Qwen3.6-27B, lo que sugiere una arquitectura similar: un transformador con atencion por tramos, posiblemente con un bloque SSM (`linear_attn`) y una cabeza de prediccion multi-token. Sin embargo, esto es especulativo y el propio autor advierte que la receta puede cambiar si el modelo base resulta ser MoE o tiene una disposicion de modulos diferente.

El repositorio no contiene informacion sobre el entrenamiento del modelo base, ni sobre datos de entrenamiento, ni sobre tecnicas de alineacion como RLHF o DPO. La cuantizacion planificada es una operacion puramente post-entrenamiento, sin fine-tuning ni abliteracion.

## Capacidades

No se puede confirmar ninguna capacidad real del modelo porque no existen pesos ni documentacion del modelo base. Las capacidades que se podrian esperar de un modelo de la familia Qwen (generacion de texto, razonamiento, codigo, soporte multimodal imagen-texto) son meras hipotesis basadas en el nombre y el pipeline tag `image-text-to-text`, pero no estan verificadas.

## Casos de uso

No se pueden enumerar casos de uso concretos para un modelo que no existe todavia. Cualquier aplicacion practica dependeria de las capacidades reales del modelo base `Qwen/Qwen3.8-27B` una vez publicado y cuantizado. Hasta entonces, este repositorio no es utilizable para ninguna tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no se reivindica ninguna cifra de calidad y que, cuando existan, se publicaran mediciones de divergencia KL por token contra el base bf16 y perplejidad en wikitext-2-raw. Hasta que el modelo base sea lanzado y la cuantizacion construida, no hay datos que presentar.

## Requisitos de hardware

No disponibles. Sin pesos reales, no se puede estimar VRAM, latencia ni throughput. Cuando el modelo base exista y la cuantizacion FP8 se materialice, se podra estimar un consumo de VRAM aproximado para 27B en FP8 (alrededor de 27 GB solo para pesos, mas overhead de activaciones y cache KV), pero esto es una extrapolacion no confirmada.

## Comparativa con modelos similares

No disponible. No existe un modelo comparable real porque el base no ha sido lanzado. La comparativa solo tendria sentido cuando existan pesos y benchmarks verificados.

## Limitaciones y advertencias

- Este repositorio es un placeholder: no contiene pesos ni artefactos. Intentar descargarlo o servirlo fallara.
- El modelo base `Qwen/Qwen3.8-27B` no ha sido publicado; toda la informacion sobre arquitectura, capacidades y rendimiento es especulativa.
- La receta de cuantizacion es una intencion declarada, no una realidad construida. Puede cambiar si el modelo base difiere de lo esperado.
- No se han publicado mediciones de calidad (KLD, perplejidad) ni benchmarks.
- La licencia apache-2.0 del repositorio no garantiza la licencia del modelo base, que se aplicara cuando exista.
- Para produccion, este repositorio es inutilizable en su estado actual.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huginnfork/Qwen3.8-27B-FP8
- Modelo base (no publicado): https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantizacion: https://github.com/vllm-project/llm-compressor
