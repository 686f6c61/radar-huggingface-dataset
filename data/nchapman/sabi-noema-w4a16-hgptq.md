# nchapman/sabi-noema-W4A16-HGPTQ

## Resumen

sabi-noema-W4A16-HGPTQ es una cuantizacion de 4 bits del modelo multimodal sabicap/sabi-noema, un VLM de 29.105 millones de parametros (aproximadamente 27B en el backbone de lenguaje) construido sobre una arquitectura hibrida tipo Qwen3.5 que combina atencion completa con capas GatedDeltaNet. El checkpoint lo publica nchapman, no el autor original del modelo base, y aplica una combinacion de rotacion Hadamard H64, GPTQ con inicializacion Cholesky y destilacion KL con maestro FP32 para comprimir el modelo de 54,71 GB en BF16 a 16,14 GiB en W4A16.

La innovacion principal es la recuperacion del decodificador especulativo Native Multi-Token Prediction (MTP) que el modelo base no incluia: el autor injerta los pesos `mtp.*` desde Qwen/Qwen3.8-27B, los calibra sobre los estados ocultos de la capa 63 de sabi-noema y consigue un 90,48% de acuerdo Top-1 end-to-end contra el `lm_head` principal. Esto permite que un VLM completo de 27B con drafter especulativo quepa en una sola GPU de 24 GB (RTX 3090, 4090 o 5090).

El resultado es relevante para despliegues en hardware consumer y estaciones de trabajo con una sola GPU, manteniendo una divergencia KL ponderada de 0,1105 frente al BF16 en el conjunto de prueba `probe-v4` y una perplejidad ligeramente inferior (-2,13%). La licencia Apache 2.0 y la compatibilidad con vLLM stock y compressed-tensors facilitan su integracion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido multimodal (64 capas: 16 de atencion completa y 48 GatedDeltaNet) con ViT de 27 bloques y MTP especulativo |
| Parametros totales | 29.105.255.152 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 GPTQ (group size 64) con rotacion Hadamard H64; W8_g64 para `lm_head` y `mtp.fc`; BF16 para embeddings, normas, biases y `visual.patch_embed.proj` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (12 shards), formato compressed-tensors pack-quantized int32, compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base sabicap/sabi-noema es un VLM de 29.105 millones de parametros con un backbone de lenguaje de 64 capas que alterna 16 capas de atencion completa con 48 capas GatedDeltaNet (atencion lineal con estado recurrente), mas un codificador visual ViT de 27 bloques con proyecciones merger espaciales. Esta version cuantizada no reentrena el modelo: aplica GPTQ con inicializacion MSE-Cholesky, dos pasadas de descenso coordinado tipo Gauss-Seidel sobre la Hessiana y una fase final de destilacion KL con maestro FP32 sobre las RMSNorm, usando el conjunto `data/calib-cascade-v1.jsonl`. Se cuantizan 519 capas lineales en total: 400 del backbone de lenguaje, 110 de vision y 7 del modulo MTP injertado.

La innovacion tecnica destacable es el injerto del MTP desde Qwen/Qwen3.8-27B. El autor justifica la compatibilidad porque sabi-noema permanece en el subespacio de representacion de Qwen3.8-27B (diferencia relativa de Frobenius del 0,0857% en `embed_tokens`, 0,0946% en `lm_head` y 0,0001% en `norm`). Los pesos `mtp.*` se calibran directamente sobre los estados ocultos de la capa 63 de sabi-noema, y se activa `mtp_num_hidden_layers: 1`. El `lm_head` y `mtp.fc` se mantienen en 8 bits sin rotacion para evitar sobrecoste online de Hadamard. El resultado son 90,48% de acuerdo Top-1 E2E y KL de 0,0912 frente al `lm_head` principal, con NLL 2,8937 → 2,8951.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat propia (`chat_template.jinja`).
- Razonamiento en matematicas y ciencia, con divergencia KL controlada frente al BF16 en esos dominios (0,0830 en math, 0,0691 en science).
- Generacion y comprension de codigo, incluyendo uso de herramientas.
- Capacidades multimodales image-text-to-text: entrada de imagenes y texto con 27 bloques ViT y merger espacial.
- Decodificacion especulativa nativa mediante MTP injertado (1 capa), con 90,48% de acuerdo Top-1 E2E.
- Soporte multilingue declarado en el conjunto de evaluacion `probe-v4`, aunque los idiomas concretos no estan disponibles.
- Compatibilidad con tool calling y function calling segun los tag y el conjunto de evaluacion del modelo base (no se detalla el formato exacto).
- Inferencia compatible con vLLM stock y compressed-tensors sin parches.
- Sampling por defecto: temperature 1.0, top_p 0.95, top_k 20; `eos_token_id` [248046, 248044].

## Casos de uso

- Despliegue de un VLM de 27B en una sola GPU de 24 GB: el checkpoint ocupa 16,14 GiB, dejando unos 7,8 GiB para cache KV de contexto largo, tokens de vision y grafos CUDA, lo que permite servir el modelo completo en RTX 3090, 4090 o 5090 sin offloading.
- Atencion al cliente multimodal: conversaciones multi-turno con imagenes adjuntas (capturas, documentos escaneados) usando la plantilla de chat incluida y el decodificador especulativo para reducir latencia.
- Analisis de documentos y capturas: extraccion de informacion de imagenes con el ViT de 27 bloques, manteniendo un 92,05% de acuerdo Top-1 E2E en `vision-probe-v2` frente al BF16.
- Asistente de codigo en pipelines de CI/CD: generacion de codigo y razonamiento con tool calling, aprovechando la baja divergencia KL en dominios de codigo y la compatibilidad con vLLM para servir peticiones concurrentes.
- Razonamiento matematico y cientifico asistido: el modelo mantiene un KL de 0,0830 en math y 0,0691 en science frente al BF16, adecuado para tutoria o resolucion de problemas paso a paso.
- Investigacion en cuantizacion y decodificacion especulativa: el checkpoint sirve como referencia reproducible de injerto MTP entre modelos de la misma familia, con metricas detalladas de acuerdo Top-1 y KL.
- Prototipado en estaciones de trabajo con una sola GPU: al no requerir parches en vLLM, se puede desplegar con el stack estandar de compressed-tensors y Hugging Face transformers.

## Benchmarks y rendimiento

| Evaluacion | BF16 base (sabicap/sabi-noema) | sabi-noema-W4A16-HGPTQ | Notas |
|---|---:|---:|---|
| Tamano safetensors | 50,96 GiB (54.713.474.016 B, sin MTP) | 16,14 GiB (17.329.742.096 B, con MTP) | Compresion 3,16x (-34,82 GiB) |
| Perplejidad texto (`probe-v4`, 378 prompts, 851.151 tokens) | 9,6074 | 9,4030 (-2,13%) | Chat, math, science, coding, tool use, multilingue |
| Divergencia texto vs BF16 (`probe-v4`, KL ponderada / media por token) | 0,0000 | 0,1105 / 0,2710 | Chat 0,0236; science 0,0691; math 0,0830; instruction following 0,0963 |
| Holdout general y multilingue (`probe-guard`, 76 prompts, 22.406 tokens) | 329,8565 | 288,8898 (-12,42%) | KL ponderada 0,0675 (media por token 0,1023) |
| MTP recuperado (donante Qwen3.8-27B, 12.267 posiciones) | 100,0% Top-1 (NLL 2,8937) | 96,63% Top-1 aislado, 90,48% Top-1 E2E | KL aislada 0,0087; KL E2E 0,0912 (NLL 2,8951) |
| Vision (`vision-probe-v2`, 96 imagenes, 302 tokens de respuesta) | 100,0% Top-1 | 99,01% Top-1 aislado, 92,05% Top-1 E2E | KL ViT aislada 0,0079; KL E2E 0,1609; en `vision-guard-v2`: 99,26% / 94,07% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 16,14 GiB para el modelo completo con MTP (15,70 GiB en modo solo texto), mas cache KV, tokens de vision y grafos CUDA.
- GPU recomendadas: RTX 3090, RTX 4090 o RTX 5090 de 24 GB para el modelo completo; A100 y H100 para mayor contexto y concurrencia.
- Cabe en GPU consumer de 24 GB, dejando aproximadamente 7,8 GiB libres para cache KV de contexto largo y decodificacion especulativa.
- Opciones de despliegue: vLLM stock con compressed-tensors (sin parches), transformers con `trust_remote_code` por el codigo personalizado del modelo base.
- Latencia y throughput: no disponibles; el MTP injertado con 90,48% de acuerdo Top-1 E2E esta disenado para acelerar la decodificacion especulativa, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sabi-noema-W4A16-HGPTQ | 29.105.255.152 | no disponible | W4A16 GPTQ + W8 head | Apache 2.0 | Hugging Face |
| sabicap/sabi-noema (BF16) | 29.105.255.152 | no disponible | BF16 (54,71 GB) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (donante MTP) | no disponible | no disponible | BF16 | no disponible | Hugging Face |

La comparativa con alternativas de la misma categoria (mismo tamano o misma tarea) no esta disponible en la informacion proporcionada mas alla del modelo base y del donante del MTP.

## Limitaciones y advertencias

- La cuantizacion introduce divergencia respecto al BF16: KL ponderada de 0,1105 en `probe-v4` y 0,0675 en `probe-guard`; no es una replica exacta del modelo original.
- El MTP injertado procede de otro modelo (Qwen3.8-27B) y alcanza un 90,48% de acuerdo Top-1 E2E, no el 100%; puede degradar la calidad en generaciones largas o dominios alejados de la calibracion.
- Los pesos `mtp.*` no existen en el modelo base original; el injerto depende de la cercania en el subespacio de representacion y podria no transferirse a otras variantes o fine-tunes de sabi-noema.
- No se detallan los idiomas soportados ni la longitud de contexto, lo que dificulta planificar despliegues multilingues o de contexto largo.
- No hay benchmarks estandar publicados (MMLU, HumanEval, GSM8K), solo evaluaciones de fidelidad frente al BF16.
- Riesgo de alucinacion inherente al modelo base, no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el donante del MTP deben verificarse por separado; el autor de esta cuantizacion no es el autor original del modelo.
- El modelo requiere `custom_code` y `trust_remote_code` en transformers, lo que implica ejecutar codigo del repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/nchapman/sabi-noema-W4A16-HGPTQ
- Modelo base: https://huggingface.co/sabicap/sabi-noema
- Donante del MTP: https://huggingface.co/Qwen/Qwen3.8-27B
- Commit del modelo base: 2908c2d59081522a6cbfdb60ef0f848508295667
- Commit del donante: 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
