# freakyskittle/CYBER-FROST-3.8-GGUF

## Resumen

CYBER-FROST-3.8 es un modelo multimodal de tipo imagen-texto-a-texto publicado por el usuario Blackfrost-AI y quantizado en formato GGUF por freakyskittle. Se construye sobre la arquitectura `qwen4exp` (`Qwen4ExpForConditionalGeneration`), derivada de `Qwen/Qwen3.8-Flash-Next`, y combina un tronco transformer con mezcla de expertos (MoE) de aproximadamente 180.000 millones de parametros totales y unos 6.000 millones activos por token, junto con una torre de vision basada en el ViT de Qwen3-VL.

El modelo resuelve el problema de desplegar un MoE multimodal de gran tamano en hardware modesto: los ficheros GGUF permiten mantener los expertos y la tabla n-gram en CPU (mapeados desde disco) mientras el resto de capas se descarga en GPU, con lo que un equipo con grafica integrada puede ejecutarlo a costa de un throughput muy bajo. La ventana de contexto configurada es de 262.144 tokens, aunque el autor solo ha validado 512 tokens en pruebas de humo.

Su relevancia actual radica en dos elementos: la inclusión de un bloque MTP (multi-token prediction) nativo incrustado como capa 48 en la cuantizacion Q2_K_S para decodificacion especulativa, y el soporte de vision mediante un proyector `mmproj` independiente compatible con todos los troncos. La licencia es la Qwen Community License 1.0, con las restricciones que ello implica para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4exp` (`Qwen4ExpForConditionalGeneration`), derivada de Qwen3.8-Flash-Next; MoE con atencion y capas SSM |
| Parametros totales | 176.943.899.520 (~180B) |
| Parametros activos | ~6B por token |
| Longitud de contexto | 262.144 tokens configurados; validado solo a 512 tokens |
| Tipos de cuantizacion | Q4_K_M, UD-Q4_K_XL, UD-IQ4_XS, MXFP4_MOE, Q3_K_M, Q3_K_S, Q2_K, Q2_K_S; torre de vision en F16; cabezal MTP en Q8_0, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`qwen-community-license-1.0`) |
| Formato de pesos | GGUF (llama.cpp); checkpoint original en BF16 |

## Arquitectura y entrenamiento

El tronco es un transformer MoE de 48 capas con 512 expertos, 10 expertos activados por token y un experto compartido. La model card menciona tensores de atencion y tensores SSM (`ssm_conv1d.weight`, `ple_conv1d.weight`), lo que indica una arquitectura hibrida que combina mecanismos de atencion con capas de espacio de estados. Incluye ademas una tabla n-gram por capa (`per_layer_token_embd`) que se trata como tensor separado y se mantiene en CPU durante la inferencia. El router y las capas de normalizacion permanecen en float32.

El checkpoint incorpora un bloque MTP nativo entrenado antes de la pasada final de comportamiento del tronco. Ese bloque se injerta como capa 48 en cuantizacion Q8_0 dentro de `CYBER-FROST-3.8-Q2_K_S.gguf`, lo que habilita decodificacion especulativa con `--spec-type draft-mtp`. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La torre de vision es el ViT estandar de Qwen3-VL (`qwen3vl_merger`): 27 bloques, patch de 16, merge espacial 2, sin deepstack, y proyeccion a 2560 dimensiones, compatible con todos los troncos. Las cuantizaciones dinamicas del autor no usan importance matrix: son mezclas de tipos por capa, no Unsloth Dynamic 3.0.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational` y el uso de plantillas Jinja (`--jinja`).
- Razonamiento y generacion de codigo: no hay benchmarks publicados que lo confirmen, pero la arquitectura deriva de la familia Qwen.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), con entrada de imagenes a traves del proyector `mmproj`.
- Decodificacion especulativa mediante cabezal MTP nativo en la variante Q2_K_S, con `--spec-draft-n-max` configurable.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion de arquitecturas MoE hibridas con capas SSM: el modelo permite estudiar el comportamiento de 512 expertos con 10 activos por token en un entorno llama.cpp, manteniendo los expertos en CPU y el resto en GPU.
- Experimentacion con decodificacion especulativa MTP: la variante Q2_K_S con cabezal incrustado sirve para medir la ganancia de aceptacion de tokens draft en un MoE grande sin necesidad de un modelo draft separado.
- Procesamiento de imagenes en local: con el `mmproj` F16 y `--no-mmproj-offload`, se puede ejecutar el codificador visual en CPU y el tronco en GPU para tareas de descripcion de imagenes o respuesta a preguntas visuales.
- Pruebas de cuantizacion extrema: las variantes Q2_K, Q3_K_S y MXFP4_MOE permiten evaluar la degradacion de calidad de un MoE de 180B comprimido entre 80 y 96 GB, util para calibrar metodologias de quantizacion sin imatrix.
- Despliegue en hardware de gama baja con Vulkan: el ejemplo del autor (Radeon 680M, GTT ~45 MB, expertos en disco) demuestra la viabilidad de servir el modelo en equipos sin VRAM dedicada, aunque a 1 tok/s de generacion.
- Validacion de compatibilidad de llama.cpp con arquitecturas nuevas: el modelo ha servido para detectar fallos concretos del runtime, como el `GGML_ASSERT` en `ssm_conv1d`/`ple_conv1d` en F16 o el fallo del descriptor set del encoder visual en Vulkan.
- Analisis de conversaciones con contexto muy largo en teoria (262.144 tokens), siempre que se valide empiricamente el comportamiento mas alla de los 512 tokens probados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento son las pruebas de humo del autor en llama.cpp `b1-4da6337` sobre una Radeon 680M con Vulkan, contexto de 512 tokens, KV cache en f16 y expertos en CPU:

| Metrica | Valor medido |
|---|---|
| Velocidad de prompt | ~0,5 a 0,7 tok/s |
| Velocidad de generacion | ~1,0 a 1,1 tok/s |
| GTT ocupada | ~45 MB |
| Contexto probado | 512 tokens |

## Requisitos de hardware

- VRAM/RAM estimada: los ficheros GGUF ocupan entre 80,08 GB (Q2_K y Q2_K_S) y 123,10 GB (UD-Q4_K_XL). El checkpoint BF16 original ronda los 354 GB (176.943.899.520 parametros a 2 bytes), coherente con un repositorio de 1.673,9 GB que incluye todas las variantes.
- Estrategia de despliegue recomendada por el autor: mantener expertos y tabla n-gram en CPU (`-ot "per_layer_token_embd=CPU,exps=CPU"`), usar `-cmoe`, `-ngl 99`, `-lm mmap` y `-fit off` para que el loader no intente llenar la GPU con el pool de expertos.
- GPU: no se especifican modelos recomendados. El unico hardware documentado es una Radeon 680M (grafica integrada) con backend Vulkan. Para un rendimiento util haria falta un equipo con suficiente VRAM para el tronco no-experto mas RAM rapida para los expertos.
- Consumer GPU: no cabe completo en ninguna GPU de consumo actual; la unica via es el offload parcial a CPU con mmap desde disco, como en el ejemplo del autor.
- Opciones de despliegue: llama.cpp (unico runtime documentado). No hay informacion sobre soporte en vLLM, TGI, Ollama u otros.
- Notas de ejecucion: KV cache debe ser f16 (la cuantizada provoca fallo en esta arquitectura); en Vulkan hay que pasar `--no-mmproj-offload` para el encoder visual; `GGML_VK_DISABLE_ASYNC=1` fue necesario en las pruebas del autor.
- Latencia y throughput: ~1 tok/s de generacion y ~0,6 tok/s de prompt en Radeon 680M. No hay datos para GPUs dedicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificables de modelos comparables en la informacion proporcionada. Como referencia estructural, el modelo deriva de `Qwen/Qwen3.8-Flash-Next` y su tronco BF16 esta en `Blackfrost-AI/CYBER-FROST-3.8-BF16`, pero no se han facilitado parametros, contexto ni resultados de esas variantes para establecer una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| CYBER-FROST-3.8 (este) | ~180B totales, ~6B activos | 262.144 configurados | Qwen Community License 1.0 | GGUF |
| Blackfrost-AI/CYBER-FROST-3.8-BF16 | ~180B totales, ~6B activos | no disponible | no disponible | safetensors/BF16 |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Contexto largo no validado: la ventana configurada es de 262.144 tokens, pero todas las pruebas se hicieron con 512 tokens. El comportamiento mas alla de ese limite es desconocido.
- Rendimiento muy bajo en el hardware documentado: ~1 tok/s de generacion en Radeon 680M hace inviable cualquier uso interactivo en ese equipo.
- Cuantizaciones sin importance matrix: las variantes dinamicas no son Unsloth Dynamic 3.0 y no estan calibradas, por lo que la perdida de calidad respecto al BF16 no esta medida.
- Fallos conocidos del runtime: la KV cache cuantizada provoca crash en esta arquitectura; el encoder visual falla en Vulkan sin `--no-mmproj-offload`; los ficheros `mtp-` independientes no cargan por falta de `output_hc_norm.weight`.
- Correccion reciente de tensores: los ficheros subidos antes del 2026-10-08 almacenaban `ssm_conv1d.weight` y `ple_conv1d.weight` en F16, lo que causaba un `GGML_ASSERT` en llama.cpp al ejecutar capas en CPU. Solo esos 37 tensores pequenos cambiaron; conviene descargar la version actualizada.
- Licencia: Qwen Community License 1.0 impone condiciones adicionales para uso comercial que deben revisarse antes de desplegar en produccion.
- Idiomas soportados no documentados: no hay informacion sobre cobertura multilingue ni calidad por idioma.
- Riesgo de alucinacion y sesgos: no hay evaluaciones publicadas en la informacion disponible.
- Madurez: el modelo se publico el 2026-09-27 y se actualizo el 2026-10-09; la model card describe pruebas de humo, no una validacion exhaustiva.

## Enlaces

- Repositorio GGUF: https://huggingface.co/freakyskittle/CYBER-FROST-3.8-GGUF
- Checkpoint base BF16: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-BF16
- Modelo de origen de la arquitectura: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- llama.cpp: https://github.com/ggml-org/llama.cpp
