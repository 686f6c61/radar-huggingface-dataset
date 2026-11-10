# nchapman/Qwen3.8-27B-W2.6A16-HGPTQ-RCO

## Resumen

Qwen3.8-27B-W2.6A16-HGPTQ-RCO es una cuantización extrema de 2,60 bits del modelo multimodal denso Qwen/Qwen3.8-27B, publicada por el usuario nchapman en Hugging Face. El objetivo es comprimir un checkpoint BF16 de 51,75 GiB hasta 12,18 GiB (factor 4,25×) para que un modelo de ~20.590 millones de parámetros con visión y decodificación especulativa MTP nativa quepa en una única GPU de 16 GB, dejando aproximadamente 3,8 GiB para caché KV, torre visual, MTP y grafos CUDA.

La técnica empleada combina GPTQ con rotaciones de Hadamard, inicialización por Cholesky, descenso de coordenadas de Hessiana y un proceso de co-diseño riemanniano (Riemannian Co-design, RCO) que selecciona qué grupos lineales fusionados en vLLM se mantienen en W4 y cuáles bajan a W2. La arquitectura del modelo base combina atención completa con atención lineal GatedDeltaNet (GDN), lo que hace especialmente delicada la cuantización de las capas de atención lineal y justifica el esquema mixto W2/W4.

La relevancia de esta ficha es doble: por un lado documenta una receta de cuantización agresiva con evaluación teacher-forced frente al BF16 original; por otro, sirve como referencia práctica de hasta dónde se puede comprimir un VLM denso sin destruir la calidad en tareas de texto, visión y decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso con atención completa + GatedDeltaNet (atención lineal), torre ViT y MTP nativo |
| Parametros totales | 20.590.818.032 (~20,59 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | W2A16 (2 bits, grupo 64), W4A16 (4 bits, grupo 64), W8 (cabeza lm_head y mtp.fc, grupo 64), visión W4 con canal por canal en fc2; BF16 para embeddings, proyecciones in_proj_a/b, patch_embed y normas |
| Idiomas soportados | no disponible (la model card menciona evaluación multilingüe con Belebele en 9 idiomas, sin listado explícito) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (18 shards, formato pack-quantized int32 compatible con compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal con dos tipos de capas de atención: 32 grupos de atención completa y 96 grupos de atención lineal GatedDeltaNet, además de 128 grupos MLP. Incluye una torre visual de 27 bloques ViT con dos proyecciones de merger espacial, y una cabeza MTP (Multi-Token Prediction) nativa que actúa como drafter especulativo. La cuantización cubre 519 capas lineales en total: 400 del backbone de lenguaje, 7 del MTP, 110 de visión y 2 de la cabeza de salida fusionada.

El proceso de cuantización parte de GPTQ con rotaciones de Hadamard y inicialización por Cholesky, seguido de descenso de coordenadas de Hessiana en 2-3 pasadas. El componente RCO selecciona mediante Gumbel-Softmax no miope qué grupos fusionados de vLLM suben de W2 a W4: 21 de 32 grupos de atención completa (65,6 %), 38 de 96 de GDN (39,6 %) y 39 de 128 MLP (30,5 %), resultando 136 lineales en W4 y 264 en W2. La calibración usa el dataset `calib-cascade-v1.jsonl` y se completa con destilación KL sobre `log_scale` continuos y RMSNorm/GDN gates con maestro en FP32. No se especifican en la información disponible los datos de preentrenamiento, el número de tokens ni si el modelo base usó RLHF o DPO.

## Capacidades

- Generación de texto conversacional y razonamiento general, con divergencia KL frente a BF16 de 0,2717 (weighted) en el probe de texto.
- Comprensión de imágenes y respuesta image-text-to-text mediante torre ViT de 27 bloques, con top-1 end-to-end del 88,74 % en `vision-probe-v2`.
- Decodificación especulativa nativa mediante MTP, con top-1 aislado del 96,64 % frente al 100 % del BF16.
- Razonamiento matemático y científico (subconjuntos `math` y `science` del probe con KL 0,1795 y 0,1803 respectivamente).
- Capacidades multilingües evaluadas en 9 idiomas vía Belebele (KL macro 0,4070), sin listado explícito de idiomas.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Compatibilidad con vLLM sin parches y con `compressed-tensors`, incluyendo transformada de Hadamard en línea sobre la entrada.

## Casos de uso

- Despliegue de un VLM de ~20,6 B en una GPU de consumo de 16 GB: gracias a los 12,18 GiB del checkpoint completo (VLM + MTP), cabe en RTX 4060 Ti 16GB, 4070 Ti Super, 4080, 5060 Ti 16GB o 5070 Ti con ~3,8 GiB para caché KV y grafos CUDA, lo que permite prototipado local de asistentes multimodales.
- Servicio de image-text-to-text en entornos con VRAM limitada: la torre visual cuantizada a W4 conserva un top-1 end-to-end del 88,74 %, suficiente para tareas de descripción de imágenes, VQA y extracción de información visual en producción de baja criticidad.
- Generación de texto con decodificación especulativa: el MTP nativo cuantizado mantiene un top-1 aislado del 96,64 %, lo que permite acelerar la generación en vLLM sin un drafter separado, útil en chat interactivo y autocompletado.
- Evaluación comparativa de recetas de cuantización: sirve como referencia reproducible para investigadores que quieran medir el impacto de esquemas W2/W4 mixtos frente a BF16 usando los probes publicados (KL ponderada, holdout multilingüe, visión y MTP).
- Razonamiento matemático y científico en local: los KL de 0,1795 (math) y 0,1803 (science) indican degradación moderada, adecuada para asistentes de estudio o generación de borradores técnicos donde se revise la salida.
- Investigación en cuantización extrema: la combinación de Hadamard, Cholesky GPTQ, H-CD y RCO sobre una arquitectura híbrida atención completa/GDN constituye un caso de estudio para quienes trabajan en compresión de modelos híbridos.
- Despliegue en pipelines de CI con vLLM stock: al no requerir parches y usar grupos `pack-quantized` estándar, se puede integrar en infraestructura existente de vLLM y Hugging Face `compressed-tensors` sin cambios en el runtime.

## Benchmarks y rendimiento

Evaluación teacher-forced frente al modelo base BF16 (datos de la model card):

| Evaluación | BF16 base | W2.6A16-HGPTQ-RCO | Notas |
|---|---:|---:|---|
| Tamaño safetensors | 51,75 GiB | 12,18 GiB | Compresión 4,25× (−39,57 GiB) |
| Divergencia de texto (`probe-v4`), KL ponderada / media por token | 0,0000 | 0,2717 / 0,4265 | 378 prompts, 840k tokens; math 0,1795, chat 0,1744, if 0,1764, science 0,1803 |
| Holdout general y multilingüe (`probe-guard`), KL media / ponderada | 0,0000 | 0,3272 / 0,4159 | 76 prompts, 23k tokens; Belebele 9 idiomas KL macro 0,4070 |
| MTP nativo (12.339 posiciones) | 100,0 % top-1 (NLL 2,9579) | 96,64 % top-1 aislado (NLL 2,9813) | KL MTP aislado 0,0090; top-1 end-to-end 74,47 %, KL 0,6399 |
| Visión (`vision-probe-v2`, 48 imágenes, 151 tokens de respuesta) | 100,0 % top-1 | 97,68 % top-1 aislado · 88,74 % top-1 end-to-end | KL ViT aislado 0,0056; KL E2E 0,4969; `vision-guard-v2` E2E top-1 88,15 %, KL 0,5311 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 12,18 GiB para el checkpoint completo (VLM + MTP); 11,71 GiB en variante solo texto. Con ~3,8 GiB adicionales para caché KV, visión, MTP y grafos CUDA en una GPU de 16 GB.
- GPU recomendadas para esta variante: RTX 4060 Ti 16GB, RTX 4070 Ti Super, RTX 4080, RTX 5060 Ti 16GB, RTX 5070 Ti (16 GB). Para la variante W4A16 (17,33 GiB) se recomienda 24 GB: RTX 3090, 4090 o 5090.
- Cabe en GPU de consumo: sí, en modelos de 16 GB; la variante W2.2A16 (11,04 GiB) apunta a 12 GB solo texto o 16 GB con contexto ultralargo.
- Opciones de despliegue: vLLM stock (sin parches) con `compressed-tensors`; transformers con `library_name: transformers`; no se mencionan llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | Bits medios | Contexto | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|---|
| Qwen3.8-27B-W2.2A16-HGPTQ-RCO | ~20,59 B | 11,04 GiB (VLM+MTP) / 10,58 GiB texto | 2,20 (10 % W4) | no disponible | Apache 2.0 | Hugging Face (nchapman) |
| Qwen3.8-27B-W2.6A16-HGPTQ-RCO (este) | ~20,59 B | 12,18 GiB / 11,71 GiB | 2,60 (30 % W4) | no disponible | Apache 2.0 | Hugging Face (nchapman) |
| Qwen3.8-27B-W4A16-HGPTQ | ~20,59 B | 17,33 GiB / 16,86 GiB | 4,00 (100 % W4) | no disponible | Apache 2.0 | Hugging Face (nchapman) |
| Qwen/Qwen3.8-27B (BF16) | ~20,59 B | 51,75 GiB | 16,00 | no disponible | Apache 2.0 | Hugging Face (Qwen) |

No se dispone de comparación con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce divergencia medible frente a BF16: KL ponderada de 0,2717 en texto y 0,3272 en holdout; no es un reemplazo neutro del modelo original en tareas sensibles a la precisión.
- El top-1 end-to-end del MTP cae al 74,47 % (frente al 100 % del BF16), lo que reduce la tasa de aceptación de la decodificación especulativa y, por tanto, la ganancia de velocidad real.
- La visión sufre mayor degradación en cadena: 97,68 % top-1 aislado pero 88,74 % end-to-end, con KL E2E de 0,4969; conviene validar en el dominio concreto antes de producción.
- Riesgo de alucinación: no cuantificado en la información disponible; la model card no reporta evaluaciones de factualidad.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas: no se publica listado explícito; solo se reporta evaluación Belebele en 9 idiomas con KL macro 0,4070, superior a la de texto general.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Qwen/Qwen3.8-27B y de los datasets de calibración.
- Requiere runtime compatible con `compressed-tensors` y grupos `pack-quantized`; fuera de vLLM y transformers la portabilidad no está garantizada.
- El checkpoint se publicó el 2026-11-10 con 0 descargas y 0 likes, sin validación comunitaria independiente.
- La transformada de Hadamard en línea sobre la entrada añade sobrecarga en runtime que no se cuantifica en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/Qwen3.8-27B-W2.6A16-HGPTQ-RCO
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante W2.2A16: https://huggingface.co/nchapman/Qwen3.8-27B-W2.2A16-HGPTQ-RCO
- Variante W4A16: https://huggingface.co/nchapman/Qwen3.8-27B-W4A16-HGPTQ
- Repositorio de vLLM: no disponible en la información proporcionada
- Repositorio de compressed-tensors: no disponible en la información proporcionada
- Paper o blog técnico de la receta HGPTQ-RCO: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible en la información proporcionada
