# disinfozone/wekwos-2-mini-GGUF

## Resumen

Wekwos-2-Mini es un modelo de generacion de texto de 26.070 millones de parametros especializado en protoindoeuropeo (PIE) reconstruido, desarrollado por disinfozone. Resuelve un problema muy concreto: la generacion y traduccion fiable de una lengua historica reconstruida, con morfologia y diacriticos Unicode que los modelos generalistas suelen degradar. Esta ficha cubre la distribucion GGUF del modelo, cuantizada a partir de la version BF16 y pensada para `llama.cpp`, LM Studio, Ollama y koboldcpp.

La relevancia de esta publicacion es doble. Por un lado, ofrece un conjunto de cuantizaciones autocontenidas (Q4_K_M a Q8_0) que preservan la morfologia PIE, con la omision deliberada de Q2_K y Q3_K porque los bits bajos degradan los diacriticos y las terminaciones flexivas. Por otro, incluye artefactos auxiliares poco habituales: un proyector de vision F16 (`mmproj-F16.gguf`) y un modelo borrador de decodificacion especulativa DSpark (`wekwos-2-mini-dspark-BF16.gguf`).

El modelo declara un rendimiento de 88,2 (estricto) y 90,5 (laxo) en PIE Benchmark v2, segun la model card del autor. La licencia es Apache 2.0 y los idiomas declarados son `ine` (protoindoeuropeo) e `en` (ingles). El repositorio GGUF ocupa 90,1 GB en total, aunque cada archivo individual es mucho mas pequeno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con soporte de bucle `inkling2_loop` (segun tags del autor); detalles completos no disponibles |
| Parametros totales | 26.070.385.152 (26,07 mil millones) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 16.384 tokens (valor usado en el ejemplo de `llama-server` de la model card) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0; F16 (proyector de vision); BF16 (borrador especulativo) |
| Idiomas soportados | `ine` (protoindoeuropeo reconstruido), `en` (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (single-file); BF16 en el modelo base; MLX en la variante para Apple Silicon |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del autor: se menciona `inkling2_loop`, que sugiere un mecanismo de bucle o iteracion interna, y se indica que las consultas y controladores del bucle se mantienen en FP32 de forma automatica durante la cuantizacion. No se especifica si es un transformer denso clasico, hibrido o con atencion lineal. El modelo base es `disinfozone/wekwos-2-mini-bf16`, y existe una variante LoRA (`disinfozone/wekwos-2-mini-lora`) con scripts de fusion, lo que indica un proceso de ajuste fino sobre una base previa.

En cuanto al entrenamiento, la etiqueta `grpo` (Group Relative Policy Optimization) confirma el uso de aprendizaje por refuerzo, probablemente para alinear la generacion morfologica PIE. El corpus de entrenamiento esta publicado como `disinfozone/wekwos-corpus`. No se dispone del numero de tokens, la composicion exacta del dataset ni detalles sobre fases de RLHF/DPO adicionales. El modelo emplea por defecto trazas de razonamiento morfologico (`thinking_effort=0.7`), lo que sugiere un modo de razonamiento configurable orientado a la precision gramatical.

## Capacidades

- Generacion de texto y traduccion entre ingles y protoindoeuropeo reconstruido.
- Glosado palabra por palabra (word-by-word glossing) del PIE.
- Razonamiento morfologico mediante trazas de pensamiento configurables (`thinking_effort`, `--reasoning-budget`).
- Produccion de ortografia PIE con diacriticos Unicode preservados en cuantizaciones medias y altas.
- Capacidad de vision a traves del proyector opcional `mmproj-F16.gguf`.
- Decodificacion especulativa mediante el modelo borrador DSpark (`wekwos-2-mini-dspark-BF16.gguf`).
- Modo conversacional (etiqueta `conversational`).
- Soporte de system prompts entrenados para el rol de hablante de PIE.
- No se declara soporte explicito de tool calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Traduccion y glosado de textos al protoindoeuropeo: el modelo traduce del ingles al PIE y produce un glosado morfema a morfema, util para docencia y publicaciones de linguistica historica.
- Investigacion en linguistica historica: generacion de formas reconstruidas y comprobacion de paradigmas flexivos con morfologia exacta, apoyandose en las cuantizaciones Q5_K_M o Q6_K que preservan terminaciones y diacriticos.
- Creacion de material didactico de PIE: produccion de ejemplos, paradigmas y ejercicios con ortografia Unicode correcta para cursos universitarios.
- Experimentos de linguistica computacional: banco de pruebas para evaluar la fidelidad morfologica de LLM en lenguas de bajos recursos, usando el benchmark publico `wekwos-bench`.
- Despliegue local en estaciones de trabajo: con Q4_K_M (17,5 GB) el modelo corre a unos 38 tok/s en Apple Silicon, adecuado para prototipado interactivo en `llama.cpp` o LM Studio.
- Procesamiento de documentos escaneados con texto linguistico: el proyector de vision F16 permite alimentar imagenes junto al modelo para tareas multimodales sobre material historico.
- Optimizacion de latencia en produccion: el borrador DSpark permite decodificacion especulativa para acelerar la generacion en entornos con GPU.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| PIE Benchmark v2 (estricto) | 88,2 | Segun la model card del autor |
| PIE Benchmark v2 (laxo) | 90,5 | Segun la model card del autor |
| Throughput Q4_K_M en Apple Silicon | ~38 tok/s | Dato del autor |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q4_K_M 17,5 GB; Q5_K_M 19,9 GB; Q6_K 23,5 GB; Q8_0 27,8 GB; BF16 completo 53,4 GB.
- Sistemas de 24-32 GB de memoria: recomendada Q5_K_M como equilibrio calidad/tamano.
- Sistemas de 36 GB o mas: Q8_0 como referencia de 8 bits.
- GPU consumer: las cuantizaciones Q4_K_M y Q5_K_M pueden caber en GPUs de 24 GB (por ejemplo, RTX 4090) con margen limitado; Q6_K y Q8_0 requieren 24-32 GB o mas.
- GPU de datacenter: A100 y H100 pueden ejecutar el BF16 completo (53,4 GB) o varias instancias en paralelo.
- Despliegue: `llama.cpp` (requiere build reciente con soporte `inkling2_loop`), LM Studio, Ollama, koboldcpp; variante MLX para Apple Silicon.
- Artefactos auxiliares: proyector de vision de 640 MB y borrador especulativo de 750 MB, ambos ligeros.
- Latencia y throughput: aproximadamente 38 tok/s con Q4_K_M en Apple Silicon; no se dispone de datos para otras plataformas.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la informacion proporcionada: Wekwos-2-Mini es un modelo especializado en PIE reconstruido y no existen alternativas publicas equivalentes documentadas en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Wekwos-2-Mini | 26,07 mil millones | 16.384 | Apache 2.0 | PIE reconstruido |
| Alternativas generalistas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta disenado para PIE e ingles; su utilidad fuera de ese dominio no esta documentada y probablemente sea limitada.
- Riesgo de alucinacion en formas reconstruidas: al tratarse de una lengua reconstruida, no existe una verdad de referencia absoluta; las salidas deben validarse con fuentes academicas.
- Degradacion en cuantizaciones bajas: los propios autores omiten Q2_K y Q3_K porque destruyen diacriticos Unicode y terminaciones flexivas; no se recomienda bajar de Q4_K_M.
- Requiere build especifico de `llama.cpp` con soporte `inkling2_loop`; las versiones estandar pueden no cargar el modelo.
- Contexto limitado a 16.384 tokens en el ejemplo documentado; no se confirma una ventana mayor.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero no hay garantias del autor sobre exactitud linguistica en produccion.
- El modo de razonamiento morfologico por defecto aumenta la latencia; desactivarlo (`--reasoning-budget 0`) puede reducir la precision.
- No se documentan sesgos especificos ni evaluaciones de seguridad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/disinfozone/wekwos-2-mini-GGUF
- Modelo principal (MLX): https://huggingface.co/disinfozone/wekwos-2-mini
- Modelo base BF16: https://huggingface.co/disinfozone/wekwos-2-mini-bf16
- LoRA y scripts de fusion: https://huggingface.co/disinfozone/wekwos-2-mini-lora
- Corpus de entrenamiento: https://huggingface.co/datasets/disinfozone/wekwos-corpus
- Benchmark retenido: https://github.com/davidtorcivia/wekwos-bench
- Sitio del proyecto: https://wekwos.com/model
