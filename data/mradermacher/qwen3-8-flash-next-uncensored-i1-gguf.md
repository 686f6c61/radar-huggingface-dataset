# mradermacher/Qwen3.8-Flash-Next-Uncensored-i1-GGUF

## Resumen

Qwen3.8-Flash-Next-Uncensored-i1-GGUF es una distribucion de cuantizaciones GGUF generadas por mradermacher a partir del modelo orcarouter/Qwen3.8-Flash-Next-Uncensored, una variante "abliterated" (sin las capas de rechazo del alineamiento original) de un modelo de la familia Qwen con arquitectura MoE y capacidades vision-language. El modelo base cuenta con 176.943.899.520 parametros totales, lo que lo situa en la categoria de modelos de gran escala, y esta etiquetado como compatible con function calling, razonamiento, MTP (multi-token prediction) y vision. La licencia declarada es Apache 2.0 y los idiomas soportados son ingles y chino.

El interes de esta publicacion reside en que mradermacher ofrece un conjunto amplio de cuantizaciones con imatrix (Q2_K hasta Q6_K, incluyendo variantes IQ), lo que permite ejecutar un modelo de casi 177.000 millones de parametros en hardware de consumo o en servidores con VRAM limitada, a costa de perdida de calidad en los niveles mas agresivos. El repositorio ocupa 1508,1 GB en total y las cuantizaciones de mayor tamano estan divididas en partes (part1of3, part2of3, part3of3) para facilitar la descarga.

Es relevante ahora porque combina tres tendencias: modelos MoE de gran escala con contexto y capacidades multimodales, la practica del "abliteration" para eliminar restricciones de contenido (orientada a red-teaming y evaluacion de seguridad), y el ecosistema GGUF que democratiza el despliegue local. No obstante, la informacion publicada sobre arquitectura interna, datos de entrenamiento y benchmarks es practicamente inexistente en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) segun tags; detalles de capas y expertos no disponibles |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_1, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, i1-IQ2_M, i1-IQ2_S, i1-IQ2_XS, i1-IQ2_XXS, i1-IQ1_M, i1-IQ1_S, i1-IQ3_XS, i1-IQ3_XXS, i1-IQ4_NL, i1-Q2_K_S, i1-Q3_K_S, i1-IQ3_XXS, i1-Q4_K_M, i1-Q5_K_M, i1-Q6_K (lista completa segun tags del repo) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix); el modelo base en safetensors/bf16 |

## Arquitectura y entrenamiento

Segun los tags del repositorio, el modelo base emplea una arquitectura MoE (mixture of experts) con capacidades vision-language, function calling, razonamiento y MTP (multi-token prediction). El tag "mtp" sugiere soporte de decodificacion multi-token, una tecnica de aceleracion de inferencia que predice varios tokens por paso. El tag "abliterated" indica que el modelo base fue sometido a un proceso de abliteration, que elimina direcciones de activacion asociadas al rechazo de contenido, produciendo una variante "uncensored" orientada a red-teaming y evaluacion de seguridad (tags ai-red-team, red-teaming).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o post-training especificas. Tampoco se detalla el numero de expertos, el tamano de cada experto ni la longitud de contexto nativa. El proceso de cuantizacion realizado por mradermacher utiliza ficheros imatrix (importancia matrix) para mejorar la calidad de las cuantizaciones de baja precision, y las cuantizaciones de mayor tamano se dividen en tres partes.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento multi-paso (tag "reasoning").
- Capacidades vision-language (procesamiento de imagenes junto a texto).
- Function calling / tool calling (tag "function-calling").
- Soporte de agentes y razonamiento multi-paso segun los tags del repositorio.
- MTP (multi-token prediction) como mecanismo de aceleracion de inferencia.
- Variante "uncensored"/abliterated: responde sin las capas de rechazo del modelo original, lo que la hace util para red-teaming y evaluacion de seguridad.
- Cuantizaciones disponibles desde ~80 GB (i1-Q2_K) hasta niveles superiores, con opcion de ejecucion en llama.cpp y compatibles.
- Endpoints compatibles (tag endpoints_compatible).

## Casos de uso

- Red-teaming y evaluacion de seguridad: el modelo abliterated permite generar respuestas que el modelo original rechazaria, lo que sirve para construir conjuntos de pruebas adversarios y evaluar filtros de seguridad en pipelines de moderacion.
- Investigacion sobre alineamiento: comparar el comportamiento del modelo base frente a la variante abliterated para estudiar que direcciones de activacion codifican el rechazo y como afecta al rendimiento general.
- Despliegue local de un modelo de gran escala: las cuantizaciones i1-Q4_K_M (~119,3 GB) e i1-Q5_K_M (~134,2 GB) permiten ejecutar un modelo de ~177.000 millones de parametros en servidores con varias GPUs o en configuraciones con RAM abundante mediante llama.cpp.
- Procesamiento de documentos con imagenes: gracias a las capacidades vision-language, se puede usar para extraer informacion de capturas, diagramas o PDFs escaneados en flujos de ingestion de datos.
- Asistentes conversacionales multilingues en ingles y chino: util para productos dirigidos a esos dos mercados, con soporte de function calling para integracion con APIs externas.
- Generacion asistida en pipelines de CI/CD: el soporte de tool calling y razonamiento permite integrarlo en agentes que consultan repositorios, ejecutan tests o generan parches, siempre con supervision humana.
- Experimentacion con MTP: evaluar el impacto de la decodificacion multi-token en latencia y throughput sobre hardware concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: i1-Q2_K ~80,5 GB; i1-IQ3_S ~89,0 GB; i1-Q4_K_S ~111,9 GB; i1-Q4_K_M ~119,3 GB; i1-Q5_K_M ~134,2 GB. Los tamanos superiores requieren agregar overhead de contexto KV cache.
- No cabe en ninguna GPU de consumo individual (RTX 4090 con 24 GB, RTX 5090 con 32 GB). Requiere multiples GPUs o configuracion con RAM del sistema y offload parcial.
- GPUs recomendadas: configuraciones multi-GPU con A100 80 GB, H100 80 GB o L40S; para cuantizaciones bajas, 2x A100 80 GB o 4x RTX 4090 podrian ser viables con offload.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (si se importa el GGUF), y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este tamano sin conversion.
- Latencia y throughput: no disponibles. La presencia de MTP podria mejorar el throughput, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Uncensored-i1-GGUF (este) | 176,9 B | no disponible | Apache 2.0 | GGUF | Abliterated, MoE, vision, MTP |
| Qwen3.8-Flash-Next-Uncensored (base) | 176,9 B | no disponible | Apache 2.0 | safetensors/bf16 | Version sin cuantizar del mismo modelo |
| Qwen3.8-Flash-Next-Uncensored-GGUF (static quants) | 176,9 B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas del mismo modelo por mradermacher |
| Modelos Qwen de gran escala comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks para comparar |

## Limitaciones y advertencias

- La model card no documenta arquitectura interna, contexto, datos de entrenamiento ni benchmarks; la evaluacion tecnica queda muy limitada.
- El proceso de abliteration puede degradar capacidades generales y aumentar la probabilidad de contenido danino, sesgado o inexacto; no es apto para produccion sin moderacion externa.
- Riesgo elevado de alucinacion, agravado por la falta de datos de evaluacion publicados.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante uncensored conlleva riesgos legales y reputacionales; se recomienda revision legal y de cumplimiento.
- El repositorio ocupa 1508,1 GB y las descargas de cuantizaciones grandes requieren concatenar multiples partes; error frecuente en el proceso de union.
- Las cuantizaciones de 2 y 3 bits (i1-Q2_K, i1-IQ2_*, i1-IQ1_*) degradan notablemente la calidad; el autor recomienda IQ3_XXS o superiores.
- No hay informacion sobre latencia, throughput ni soporte en vLLM/TGI para este formato.
- El tag "qwen4" y "qwen3.8" no permiten confirmar la version exacta del modelo base; conviene verificar con el autor antes de usarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-Flash-Next-Uncensored-i1-GGUF
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.8-Flash-Next-Uncensored-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-Flash-Next-Uncensored-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
