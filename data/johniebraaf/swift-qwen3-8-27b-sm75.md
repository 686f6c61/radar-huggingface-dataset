# JohnieBraaf/Swift-Qwen3.8-27B-SM75

## Resumen

Swift-Qwen3.8-27B-SM75 es un checkpoint alojado en HuggingFace por el usuario JohnieBraaf, obtenido mediante la conversion del modelo ukisai/Swift-Qwen3.8-27b a un formato cuantizado en FP8. La unica documentacion incluida en el repositorio es la expresion Nix y el script de conversion empleados, no una model card convencional: no se declaran licencia, idiomas, pipeline, ni resultados de evaluacion. El repositorio acumula 0 descargas y 0 likes desde su creacion el 21 de septiembre de 2026, por lo que no existe validacion por parte de la comunidad.

El proceso de conversion documentado utiliza llm-compressor 0.13.0 junto con compressed-tensors 0.18.0, auto-round 0.14.2, accelerate 1.14.0 y PyTorch con CUDA 13.0. La cuantizacion es por bloques de 128 elementos con un limite de escala de 448.0 (el maximo representable en el formato FP8 E4M3), y excluye explicitamente los tensores no bidimensionales, las capas de embedding, la cabeza lm_head, la torre visual, los modulos de atencion lineal y los modulos de multi-token prediction.

El interes de este artefacto es limitado y muy especifico: sirve como referencia de un pipeline reproducible de cuantizacion FP8 sobre un modelo de aproximadamente 27 000 millones de parametros, y como objeto de estudio de la estructura interna del checkpoint original, que el script revela parcialmente. No debe tratarse como un modelo listo para produccion sin verificacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No documentada por el autor. El script de conversion contempla modulos de atencion lineal (`linear_attn`), una torre visual (`model.visual`) y modulos de multi-token prediction (`mtp`), compatibles con un transformer hibrido con atencion lineal y MTP, aunque no se confirma |
| Parametros totales | Aproximadamente 27 000 millones, segun el nombre del repositorio; no confirmado por el autor |
| Parametros activos | No disponible (no se indica si la arquitectura es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 con escalas por bloque de 128 elementos y recorte a 448,0; unica variante publicada en este repositorio |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el repositorio no declara ninguna) |
| Formato de pesos | safetensors fragmentados con `model.safetensors.index.json` |

## Arquitectura y entrenamiento

No hay informacion sobre el entrenamiento del modelo base ni sobre este checkpoint: se desconocen el numero de tokens, la composicion del dataset, la existencia de RLHF, DPO u otra fase de alineamiento, y cualquier innovacion tecnica declarada por el autor. Lo unico verificable es el procedimiento de conversion, descrito en un script Python embebido en la model card. Ese script recorre los fragmentos safetensors del modelo original, carga cada tensor, omite los tensores que no terminan en `.weight` y los que no son bidimensionales, y aplica un filtro por expresion regular que excluye de la cuantizacion los prefijos `model.visual.`, `lm_head`, `embed_tokens`, `linear_attn.(A_log|conv1d|dt_bias|in_proj_ba|in_proj_b|in_proj_a|norm)` y `mtp.(fc|norm|pre_fc_norm)`.

Para los tensores cuantizables, el script convierte a `float32`, comprueba que filas y columnas (y sus mitades) sean multiplos del tamano de bloque de 128, rellena con ceros si es necesario, reorganiza el tensor en bloques de 128x128 y aplica la cuantizacion con umbral maximo de 448,0. Los tensores que no cumplen la condicion de divisibilidad se conservan sin cuantizar. El resultado es un checkpoint de precision mixta: pesos de las capas lineales principales en FP8 y el resto (embeddings, cabeza de salida, torre visual, atencion lineal y modulos MTP) en su precision original.

El prefijo `linear_attn` con parametros `A_log`, `conv1d`, `dt_bias` e `in_proj_ba` es caracteristico de mecanismos de atencion lineal con decaimiento tipo Gated DeltaNet, mientras que la presencia de modulos `mtp` apunta a cabezas de prediccion multi-token usadas habitualmente para decodificacion especulativa. Ambas observaciones son inferencias a partir del script, no afirmaciones del autor.

## Capacidades

- No se declara ninguna capacidad en la informacion disponible.
- El checkpoint conserva los tensores de `model.visual`, lo que sugiere que el modelo base incorporaba una torre de vision; no se confirma que dicha funcionalidad siga operativa tras la conversion ni existe documentacion al respecto.
- Conserva los modulos `mtp`, lo que sugiere que el base disponia de prediccion multi-token; no se confirma su uso ni su compatibilidad con los runners habituales.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modos especiales (thinking mode, audio, vision): no disponible.

## Casos de uso

- Servicio de inferencia en produccion con vLLM sobre GPUs Hopper o Ada: al reducir los pesos de aproximadamente 27 000 millones de parametros a un byte por peso, el checkpoint permite servir el modelo en una unica GPU de 48-80 GB dejando margen para la cache KV, algo que la version en BF16 no permite con comodidad.
- Evaluacion de la degradacion por cuantizacion: comparar este checkpoint FP8 con el modelo base ukisai/Swift-Qwen3.8-27b en tareas de razonamiento y generacion permite medir de forma controlada el coste de la cuantizacion por bloques de 128, siempre que se disponga de un conjunto de evaluacion propio.
- Estudio de arquitecturas hibridas: al conservar visibles los modulos `linear_attn` y `mtp` sin cuantizar, el checkpoint permite inspeccionar y analizar los parametros de atencion lineal y de prediccion multi-token de un modelo de gran tamano.
- Generacion masiva de datos sinteticos: el ahorro de memoria frente a BF16 posibilita ejecutar el modelo en paralelo con otros procesos o aumentar el tamano de lote en tareas de destilacion y anotacion automatica.
- Investigacion de tecnicas de cuantizacion con llm-compressor: el script incluido sirve como plantilla reproducible para aplicar recetas FP8 por bloques a modelos con modulos que deben excluirse (torres visuales, atencion lineal, cabezas MTP).
- Inferencia distribuida con tensor parallelism: el checkpoint puede repartirse entre varias GPUs cuando el presupuesto de memoria por dispositivo es inferior a los aproximadamente 27 GB de pesos.
- Procesamiento de documentos con componente visual: si la torre de vision conservada resulta operativa, podria emplearse en tareas de extraccion de informacion de PDF e imagenes, aunque esta capacidad no esta verificada.
- Evaluacion previa a una decision de adopcion: dado que el repositorio no declara licencia, el caso de uso realista inmediato es la evaluacion tecnica en entornos de investigacion, no el despliegue comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM de pesos en FP8: aproximadamente 27 GB, estimados a partir de 27 000 millones de parametros a un byte por peso. Hay que anadir los tensores no cuantizados (embeddings, lm_head, torre visual, modulos de atencion lineal y MTP) en su precision original y los metadatos de escalas por bloque.
- Referencia en BF16: aproximadamente 54 GB solo en pesos, el doble que la version FP8.
- Cache KV: no disponible, depende del numero de capas, cabezas y de la longitud de contexto, datos que no se han publicado.
- GPUs con soporte nativo de FP8: familias Hopper (H100, H200) y Ada (L40S, L4). Las GPUs Ampere (A100, A10) no ejecutan FP8 en hardware, por lo que requeririan descompresion a BF16 en el momento de la carga, con el consiguiente incremento de memoria.
- GPUs de consumo: 27 GB de pesos no caben en una RTX 4090 ni en una RTX 3090 (24 GB) sin recurrir a offload a CPU o a memoria unificada, lo que degrada fuertemente la latencia. Una RTX 5090 de 32 GB podria albergarlos en teoria, aunque no hay confirmacion de compatibilidad del runtime.
- Opciones de despliegue: vLLM con soporte de compressed-tensors, y HuggingFace transformers junto con accelerate y compressed-tensors. llama.cpp y Ollama no consumen el formato compressed-tensors, por lo que requeririan una conversion a GGUF no documentada en el repositorio, con riesgo de perder la estructura de modulos MTP y vision.
- Latencia y throughput: no disponible.
- Nota sobre el sufijo del nombre: el identificador incluye "SM75", que podria aludir a la compute capability 7.5 (Turing), pero el autor no lo documenta y Turing no dispone de soporte nativo de FP8, por lo que esta interpretacion no puede confirmarse.

## Comparativa con modelos similares

No se dispone de datos verificables sobre alternativas en la informacion proporcionada. La unica comparacion posible es entre este checkpoint y su modelo de origen.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JohnieBraaf/Swift-Qwen3.8-27B-SM75 | ~27 000 millones (no confirmado) | No disponible | FP8, bloques de 128, recorte 448,0 | No disponible | 0 descargas, 0 likes |
| ukisai/Swift-Qwen3.8-27b (base) | ~27 000 millones (segun nombre) | No disponible | Presumiblemente BF16 | No disponible | Repositorio de origen |
| Alternativas de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El repositorio no declara licencia. No puede asumirse ningun derecho de uso comercial ni de redistribucion sobre este checkpoint ni sobre el modelo base.
- No existe model card: se desconocen idiomas, contexto, plantilla de chat y tokenizer, lo que impide configurar correctamente un servicio de inferencia sin trabajo adicional de ingenieria inversa.
- No se ha publicado ninguna evaluacion de la degradacion introducida por la cuantizacion FP8, ni perplejidad ni resultados en tareas de razonamiento.
- Riesgo de alucinacion: no evaluado.
- Sesgos: no evaluados ni documentados.
- El checkpoint es de precision mixta: los modulos excluidos permanecen en su precision original, lo que puede romper la compatibilidad con kernels optimizados que asumen un unico tipo de dato y complica el calculo del footprint real.
- Los tensores cuyas dimensiones no son multiplos de 128 (o de 64) se dejan sin cuantizar, de modo que la proporcion real de pesos en FP8 es desconocida.
- El sufijo "SM75" no esta documentado y no se corresponde con el soporte nativo de FP8, lo que genera ambiguedad sobre el hardware objetivo.
- El historial de adopcion es nulo (0 descargas, 0 likes), por lo que no existe evidencia externa de que el checkpoint cargue o funcione correctamente.
- Las fechas del repositorio (creacion y actualizacion el mismo dia, con seis minutos de diferencia) indican que no ha habido mantenimiento posterior ni correccion de errores.

## Enlaces

- Repositorio del modelo: https://huggingface.co/JohnieBraaf/Swift-Qwen3.8-27B-SM75
- Modelo base citado en la model card: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- llm-compressor (herramienta de cuantizacion referenciada, version 0.13.0): https://github.com/vllm-project/llm-compressor
- compressed-tensors (formato de pesos cuantizados, version 0.18.0): https://github.com/neuralmagic/compressed-tensors
- vLLM (runtime compatible con compressed-tensors): https://github.com/vllm-project/vllm
- auto-round (dependencia de cuantizacion, version 0.14.2): https://github.com/intel/auto-round
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: unicamente enlaces de inicio de sesion de Facebook, sin relacion con el artefacto.
