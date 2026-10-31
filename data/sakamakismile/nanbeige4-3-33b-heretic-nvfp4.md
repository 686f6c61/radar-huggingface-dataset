# sakamakismile/Nanbeige4.3-33B-Heretic-NVFP4

## Resumen

Nanbeige4.3-33B-Heretic-NVFP4 es una cuantización comunitaria del modelo Nanbeige4.3-33B, publicado por el usuario sakamakismile en Hugging Face. Se trata de una derivación directa del modelo original de Nanbeige, procesada localmente con dos modificaciones principales: una cuantización NVFP4 (W4A4) mediante AutoRound y llmcompressor, y un proceso de "desalineación de rechazos" con la herramienta Heretic, que reduce drásticamente la tasa de negativas del modelo ante peticiones sensibles.

El resultado es un modelo de 33.118.977.024 parámetros (arquitectura LLaMA) en formato safetensors comprimido a 4 bits, con un tamaño de repositorio de 22,1 GB, licencia Apache 2.0 y orientado a generación de texto conversacional. Su relevancia reside en combinar una cuantización de precisión muy baja (NVFP4, pensada para GPUs Blackwell de NVIDIA) con una ablación de circuitos de rechazo, lo que permite ejecutar el modelo en hardware de gama alta de consumo o estaciones de trabajo con un consumo de memoria muy inferior al BF16 original.

Es importante subrayar que esta ficha describe un artefacto comunitario: el procesamiento Heretic elimina comportamientos de seguridad del modelo base, por lo que su uso conlleva riesgos significativos que se detallan en las secciones correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA (transformer decoder) |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (embeddings, normalización y lm_head en BF16); existe variante local BF16 del mismo procesamiento |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es Nanbeige4.3-33B, un transformer decoder con arquitectura LLaMA. No se han publicado datos sobre el número de tokens de preentrenamiento, composición del dataset, ni procesos de post-entrenamiento (RLHF/DPO) del modelo original en la información disponible. Este artefacto no modifica los pesos mediante entrenamiento, sino mediante dos procesos de post-procesado.

El primero es la cuantización NVFP4 (formato de 4 bits con punto flotante de NVIDIA) realizada con AutoRound 0.10.2 a través de llmcompressor 0.11.0, en modo W4A4 (pesos y activaciones a 4 bits), con 200 iteraciones por bloque de decodificador y un tamaño de lote efectivo de 8. La calibración usó el dataset `neuralmagic/calibration` (split LLM train), con 512 secuencias de 2048 tokens reales (1.048.576 tokens en total, sin padding), empaquetadas desde 2.713 conversaciones barajadas. Embeddings, capas de normalización y lm_head se mantienen en BF16.

El segundo proceso es Heretic con Ablación de Rango Arbitrario (ARA) de rango 50, 5 pasos externos de L-BFGS y preservación de magnitud por fila, aplicado a las capas 12 a 36. Se usaron 400 prompts de comportamiento ordinario y 400 de comportamiento dañino (datasets `mlabonne/harmless_alpaca` y `mlabonne/harmful_behaviors`) para modificar los circuitos internos que producen rechazos. El candidato seleccionado pasó de 99/100 rechazos detectados por palabras clave en el modelo original a 12/100, con una divergencia KL de primer token de 0,006947 respecto al modelo fuente.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento con modo "thinking": las pruebas de sanidad incluyeron tareas con thinking habilitado y techo de generación de 16.384 tokens.
- Generacion de codigo: se reporta un ejemplo de carga de trabajo de codificacion en ingles con 63,82 a 120,20 tok/s end-to-end.
- Compatibilidad con vLLM (incluyendo tensor parallelism TP8, FP8 KV cache y prefix caching) y formato compressed-tensors para text-generation-inference.
- Sin informacion disponible sobre: tool calling, agentes, capacidades multilingues explicitas, vision o audio.

## Casos de uso

- Inferencia local en estaciones de trabajo con GPUs Blackwell: la cuantizacion NVFP4 reduce el footprint de memoria del modelo BF16 original, permitiendo servir 33B parametros en configuraciones multi-GPU de gama alta con vLLM y TP8.
- Experimentacion de throughput con precision 4 bits: el repositorio incluye recipe.yaml y recipe.json con la configuracion completa de cuantizacion, util para investigadores que replican o comparan recetas NVFP4 con AutoRound/llmcompressor.
- Investigacion sobre ablacion de rechazos: al documentar el proceso Heretic completo (datasets, revisiones, hiperparametros, KL), sirve como caso de estudio reproducible sobre como se modifican los circuitos de refusal en LLMs.
- Red teaming y auditoria de seguridad: el modelo sin mecanismos de rechazo permite estudiar comportamientos del modelo base sin la capa de alineacion, util en entornos controlados de investigacion.
- Servicios de generacion de texto de alto throughput: las mediciones reportadas (hasta 85,71 tok/s agregados con concurrencia 8 en BF16 local) indican viabilidad para despliegues de servicio con multiples peticiones simultaneas.
- Prototipado conversacional offline: al ser Apache 2.0 y ejecutable localmente, permite integrar el modelo en aplicaciones sin dependencia de APIs externas ni restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) para este artefacto. El autor indica que AIME no se repitio para esta version local y que las comprobaciones de sanidad (6/6 tareas simples correctas tanto en el modelo fuente como en el BF16 local) no constituyen un benchmark de razonamiento estandarizado.

Datos de rendimiento medidos por el autor (8x RTX PRO 2000 Blackwell, vLLM 0.32.0, TP8, FP8 KV cache, entrada media 2081,375 tokens, salida 128 tokens, BF16 local):

| Concurrencia | Decode (tokens/s) | Throughput agregado (tokens/s) |
|---:|---:|---:|
| 1 | 27,05 | 22,82 |
| 2 | 23,71 | 37,92 |
| 4 | 22,63 | 60,63 |
| 8 | 16,78 | 85,71 |

Para la variante NVFP4 en tres prompts de prosa en ingles: 64,78 tok/s agregados end-to-end con NVFP4 plano y 53,66 tok/s con DFlash2 opcional (0,83x), con una sola peticion concurrente y thinking desactivado. En un ejemplo de codificacion de 512 tokens: 63,82 a 120,20 tok/s (1,88x) con DFlash2.

## Requisitos de hardware

- VRAM estimada: unos 22,1 GB de pesos para la variante NVFP4; el entorno de cuantizacion del autor usaba aproximadamente 15,5 GiB de memoria visible por GPU en una configuracion de 8 GPUs. No hay una cifra oficial de VRAM minima para inferencia; no disponible para la variante BF16 (los pesos BF16 de un modelo de 33B rondarian ~66 GB, pero no se publica dato).
- GPU recomendadas: RTX PRO 2000 Blackwell (hardware usado en las mediciones del autor); en general, GPUs con soporte nativo de formatos FP4 (arquitectura Blackwell de NVIDIA). Compatibilidad con arquitecturas anteriores no esta documentada.
- Consumer GPU: no hay evidencia de que funcione en una sola GPU de consumo; el autor lo sirve con 8 GPUs en TP8. En GPUs sin soporte NVFP4 probablemente requiera decuantizacion o otra receta.
- Despliegue: vLLM 0.32.0 (verificado por el autor, con TP8, FP8 KV cache y prefix caching); el formato compressed-tensors es compatible con el ecosistema text-generation-inference. No se menciona soporte verificado en llama.cpp u Ollama.
- Latencia y throughput: decode de 27,05 tok/s con concurrencia 1 (BF16 local) y 64,78 tok/s agregados (NVFP4, prosa en ingles, 1 peticion); prefill end-to-end de 2369,07 tokens/s de entrada con concurrencia 8.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B (base) | 33,1B | BF16 (14 shards) | no disponible | Apache 2.0 | Modelo fuente, 99/100 rechazos detectados |
| Nanbeige4.3-33B-Heretic-NVFP4 (esta ficha) | 33,1B | NVFP4 W4A4 | no disponible | Apache 2.0 | 12/100 rechazos, 22,1 GB en disco |
| Cuantizaciones NVFP4 comunitarias de modelos ~30B (p. ej. variantes Qwen o Llama) | ~30B | NVFP4 | variable | variable | no disponible: no hay datos comparativos publicados en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Eliminacion deliberada de salvaguardas: el proceso Heretic reduce los rechazos de seguridad de 99/100 a 12/100. El modelo respondera a peticiones daninas sin las protecciones del modelo original. Su uso en produccion orientado a usuarios finales es muy arriesgado y potencialmente ilegal segun jurisdiccion y aplicacion.
- Riesgo de alucinacion: no evaluado; el autor advierte explicitamente que las tasas de palabras clave y la KL de primer token no establecen calidad de razonamiento ni correccion general.
- Sin benchmarks estandarizados: no hay MMLU, HumanEval, GSM8K ni AIME para este artefacto; la degradacion por cuantizacion NVFP4 W4A4 respecto a BF16 no esta cuantificada.
- Contexto: la longitud de contexto del modelo no esta documentada en la informacion disponible.
- Idiomas: no especificados; las mediciones de rendimiento se hicieron con prompts en ingles y las comprobaciones de sanidad con prompts en japones, lo que sugiere soporte multilingue pero sin confirmacion oficial.
- Compatibilidad de hardware: NVFP4 esta orientado a GPUs Blackwell; en hardware sin soporte FP4 el modelo puede no ser utilizable directamente con vLLM.
- Mediciones poco robustas: cada condicion de velocidad se midio una sola vez, con una peticion de calentamiento, y DFlash2 resulto mas lento que NVFP4 plano en los casos de prosa probados.
- Licencia: Apache 2.0 permite uso comercial, pero la ausencia de salvaguardas puede entrar en conflicto con las politicas de uso del modelo base y con la normativa aplicable (AI Act europeo, por ejemplo).

## Enlaces

- Modelo cuantizado: https://huggingface.co/sakamakismile/Nanbeige4.3-33B-Heretic-NVFP4
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Heretic (herramienta de ablacion): https://github.com/p-e-w/heretic
- Dataset de calibracion: https://huggingface.co/neuralmagic/calibration
- Dataset harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Dataset harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
