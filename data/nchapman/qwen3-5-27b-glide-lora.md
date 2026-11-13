# nchapman/Qwen3.5-27B-GLiDE-LoRA

## Resumen

Qwen3.5-27B-GLiDE-LoRA es un adaptador PEFT de tipo LoRA, de rango 128, extraído por el usuario nchapman a partir del checkpoint completo `fastino/GLiDE-27B` y montado sobre el modelo base `Qwen/Qwen3.5-27B`. No se trata de un modelo autónomo, sino de un artefacto de destilación que combina pesos LoRA (`adapter_model.safetensors`, 1,6 GB) con una cabeza de decisión de 255 vías (`readout.safetensors`, `[255, 5120]` en `bfloat16`) y un fichero de metadatos de runtime (`decision_config.json`). Su propósito es reproducir el comportamiento de un "modelo de decisión" de sistema 1 (respuesta estructurada no causal sobre un conjunto cerrado de opciones) dentro de un backbone causal estándar.

La relevancia del artefacto reside en la compresión: reproduce el 100 % de la precisión del checkpoint completo `GLiDE-27B` (54 GB) en JevBench (`213/231 = 92,21 %`) con un adaptador de 1,6 GB, manteniendo además la capacidad de servir chat causal ordinario desde el mismo backbone cargado. Esto habilita el "dual serving" mediante el motor `warp-34`: peticiones de chat estándar con `lora_id = -1` y consultas de decisión estructurada no causal en `/v1/systemone` con `lora_id = "glide"`.

El modelo base, Qwen3.5-27B, aporta 27 000 millones de parámetros y una dimensión oculta de 5120 (deducible de la forma de la cabeza de lectura); el adaptador no modifica el tokenizador ni el vocabulario. La licencia declarada es Apache 2.0 tanto para el adaptador como, presumiblemente, para el base, aunque conviene verificar la del checkpoint original de Qwen por separado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer causal Qwen3.5-27B; incluye cabeza `CodeReadout` de 255 vías para decisión no causal |
| Parámetros totales | 27 000 millones (modelo base); adaptador LoRA de 1,6 GB en `bfloat16` (recuento exacto de parámetros del adaptador no disponible) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en `bfloat16`; el autor no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (PEFT LoRA + `readout.safetensors`), configuración en JSON |
| Rango LoRA | 128 (`lora_alpha = 128`; `rank_pattern` y `alpha_pattern` = 96 en `linear_attn.in_proj_{a,b}`) |
| Dimensión oculta | 5120 (inferida de la forma `[255, 5120]` de la cabeza de lectura) |
| Modo de atención | `noncausal_full_attention` para decisión; causal estándar para chat |
| Midloop | `blocks: [[24, 35], [36, 47]]`, `passes: 2` |
| Formato de prompt | `glide-v1` |
| Opciones de salida | 255 códigos (`A`..`GC`) |

## Arquitectura y entrenamiento

El adaptador se construye mediante destilación del profesor `fastino/GLiDE-27B` sobre el alumno `Qwen/Qwen3.5-27B`. La técnica central es **Teacher-ASVD** (activation-based singular value decomposition guiada por el profesor), aplicada sobre proyecciones fusionadas hermanas: `q_proj`/`k_proj`/`v_proj`, `gate_proj`/`up_proj`, `in_proj_qkv`/`in_proj_z` e `in_proj_b`/`in_proj_a`. Estas proyecciones comparten un mismo `lora_A.weight`, calculado con 128 prompts de calibración procedentes de `SargeDev/jev-distill-corpus-v3` y activaciones del profesor. La deduplicación de `lora_A` reduce entre 2 y 3 veces los FLOPs y la VRAM de las proyecciones fusionadas cuando el motor de inferencia la aprovecha.

El segundo componente técnico es el **plegado exacto de normalizaciones**: los desplazamientos de escala `(1 + g_glide) / (1 + g_base)` en `input_layernorm` y `post_attention_layernorm`, la ratio `g_glide / g_base` de `linear_attn.norm` repetida sobre 48 cabezas de valor hacia `linear_attn.out_proj`, y la normalización final `model.language_model.norm` (absorbida en `readout.safetensors`) se integran en los pesos del adaptador y de la cabeza de lectura, de modo que el runtime no paga coste adicional por ellas. El resultado es un adaptador que reproduce fielmente el comportamiento del profesor sin need de capas extra en inferencia.

No se documentan en la información disponible el número total de tokens de entrenamiento, la composición completa del corpus ni si hubo etapas de RLHF o DPO. El entrenamiento parece ser exclusivamente de destilación supervisada sobre el corpus de calibración citado.

## Capacidades

- Decisión estructurada no causal: selecciona una entre 255 opciones (`A`..`GC`) mediante la cabeza `CodeReadout`, orientada a tareas de juicio o clasificación de sistema 1.
- Chat causal estándar: el backbone Qwen3.5-27B sigue sirviendo completaciones de chat normales con `lora_id = -1`.
- Doble modo de servicio desde un único backbone cargado (`warp-34` + PEFT), con enrutado por `lora_id`.
- Razonamiento iterativo "midloop": dos pasadas sobre los bloques 24-35 y 36-47, que mejoran la precisión frente al modo de una sola pasada.
- Destilación de comportamiento: imita las salidas del profesor `GLiDE-27B` en el dominio de JevBench.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso general: no disponible; el "midloop" es un mecanismo interno de dos pasadas, no un bucle de agente.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Capacidades especiales: modo de atención no causal (`noncausal_full_attention`), plantilla `glide-v1`, plegado de normalizaciones sin coste en runtime.

## Casos de uso

- **Sistemas de decisión con opciones cerradas**: clasificación de casos en dominios acotados (por ejemplo, evaluación de reclamaciones o triaje) donde la salida debe ser una de 255 categorías predefinidas; la cabeza `CodeReadout` evita la generación libre y reduce la ambigüedad.
- **Doble servicio chat + decisión en una sola GPU**: despliegue de un asistente conversacional y, en paralelo, un endpoint `/v1/systemone` de decisión estructurada sobre el mismo backbone Qwen3.5-27B, con `lora_id` como discriminador. Ahorra VRAM frente a cargar dos modelos.
- **Evaluación de modelos de juicio (JevBench)**: reproducción local del benchmark JevBench público para comparar variantes de destilación o de calibración sin necesidad de descargar el checkpoint completo de 54 GB.
- **Investigación en destilación LoRA**: el artefacto sirve como referencia reproducible de Teacher-ASVD con deduplicación de `lora_A` y plegado de normalizaciones, útil para estudiar el impacto del rango y del número de pasadas en la fidelidad al profesor.
- **Prototipado de "system-one" en pipelines de producción**: integración de una etapa de decisión rápida (una o dos pasadas) antes de un modelo generativo mayor, reduciendo coste en casos donde la respuesta es una etiqueta.
- **Despliegue con motores compatibles con PEFT**: carga del adaptador en `warp-34` o en cualquier runtime que soporte LoRA multi-tenant, con `decision_config.json` como contrato de metadatos para el modo no causal.

## Benchmarks y rendimiento

Evaluación sobre `kshitijthakkar/nirnaya-jevbench-public-eval-v1` (231 casos: 48 fáciles, 72 originales, 111 difíciles), plantilla `glide-v1` y atención no causal completa:

| Modelo | Precisión global | Fácil (48) | Original (72) | Difícil (111) | NLL ↓ | Brier ↓ |
|---|---|---|---|---|---|---|
| Base Qwen3.5-27B (`passes=1`) | 204/231 (88,31 %) | 48/48 (100 %) | 69/72 (95,83 %) | 87/111 (78,38 %) | 0,3236 | 0,1738 |
| Base Qwen3.5-27B (`passes=2`) | 204/231 (88,31 %) | 48/48 (100 %) | 70/72 (97,22 %) | 86/111 (77,48 %) | 0,2947 | 0,1525 |
| + GLiDE-LoRA (Joint-SVD, `passes=1`) | 206/231 (89,18 %) | 48/48 (100 %) | 70/72 (97,22 %) | 88/111 (79,28 %) | 0,2754 | 0,1522 |
| + GLiDE-LoRA (Joint-SVD, `passes=2`) | 208/231 (90,04 %) | 48/48 (100 %) | 71/72 (98,61 %) | 89/111 (80,18 %) | 0,2275 | 0,1233 |
| **+ GLiDE-LoRA (Teacher-ASVD, `passes=1`)** | **211/231 (91,34 %)** | **48/48 (100 %)** | **71/72 (98,61 %)** | **92/111 (82,88 %)** | **0,2147** | **0,1141** |
| **+ GLiDE-LoRA (Teacher-ASVD, `passes=2`)** | **213/231 (92,21 %)** | **48/48 (100 %)** | **71/72 (98,61 %)** | **94/111 (84,68 %)** | **0,1988** | **0,1053** |
| Full `fastino/GLiDE-27B` (`passes=2`) | 213/231 (92,21 %) | 48/48 (100 %) | 72/72 (100 %) | 93/111 (83,78 %) | 0,1972 | 0,1033 |
| Full `fastino/GLiDE-27B` (`passes=1`) | 214/231 (92,64 %) | 48/48 (100 %) | 72/72 (100 %) | 94/111 (84,68 %) | 0,1933 | 0,1022 |

El adaptador Teacher-ASVD con `passes=2` iguala en precisión global al checkpoint completo con `passes=2` (213/231), con un NLL ligeramente superior (0,1988 frente a 0,1972) y un Brier prácticamente idéntico (0,1053 frente a 0,1033). En modo de una sola pasada, el adaptador (211/231) queda a 3 casos del profesor completo con una sola pasada (214/231). No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el backbone Qwen3.5-27B en `bfloat16` requiere del orden de 54 GB de pesos, más el adaptador (1,6 GB) y la cabeza de lectura. En cuantización de 8 bits o 4 bits no se documentan requisitos.
- GPU recomendadas: no especificadas por el autor. Por tamaño del backbone, un despliegue en `bfloat16` exige GPUs de 80 GB (A100/H100) o reparto multi-GPU; una RTX 4090 (24 GB) no puede alojar el modelo completo en `bfloat16`.
- ¿Cabe en GPU de consumo? No en `bfloat16` con el backbone de 27B completo. No se documentan variantes cuantizadas que permitan su uso en GPUs de 24 GB.
- Opciones de despliegue: `warp-34` (motor citado por el autor, con soporte de `lora_id` y endpoint `/v1/systemone`); cualquier runtime compatible con PEFT y con atención no causal completa. No se documenta soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El autor menciona reducción de FLOPs y VRAM de 2 a 3 veces en proyecciones fusionadas al deduplicar `lora_A`, pero no publica cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevBench (global) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-27B-GLiDE-LoRA (este) | 27B (base) + LoRA 1,6 GB | no disponible | 92,21 % (`passes=2`) | Apache 2.0 | Hugging Face |
| fastino/GLiDE-27B (profesor) | 27B | no disponible | 92,21 % (`passes=2`) / 92,64 % (`passes=1`) | no disponible | Hugging Face (54 GB) |
| Qwen/Qwen3.5-27B (base) | 27B | no disponible | 88,31 % (`passes=1` y `passes=2`) | no disponible | Hugging Face |

La comparativa se limita al profesor y al modelo base, que son los únicos referenciados en la información disponible. No se dispone de datos de otros adaptadores LoRA o modelos de decisión equivalentes para ampliar la tabla.

## Limitaciones y advertencias

- **Ámbito restringido**: el adaptador está especializado en el dominio de JevBench y en la plantilla `glide-v1` con atención no causal; fuera de ese formato su comportamiento no está validado.
- **Dependencia del motor**: el doble servicio (`lora_id = -1` para chat, `lora_id = "glide"` para decisión) requiere un runtime que soporte PEFT multi-tenant y atención no causal completa; no se documenta compatibilidad con motores de uso común como vLLM u Ollama.
- **Riesgo de alucinación**: no evaluado en la información disponible; el modo de decisión cerrada reduce la generación libre, pero el modo chat causal conserva los riesgos habituales del backbone.
- **Sesgos**: no documentados por el autor. Al ser una destilación del profesor `GLiDE-27B`, hereda los sesgos de este y del corpus de calibración `SargeDev/jev-distill-corpus-v3`.
- **Idiomas**: no declarados; no se puede garantizar soporte multilingüe más allá del comportamiento del base Qwen3.5-27B.
- **Licencia**: Apache 2.0 en el adaptador; conviene verificar por separado la licencia del checkpoint base Qwen3.5-27B y del profesor antes de uso comercial.
- **Madurez**: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-11-12; sin validación comunitaria independiente.
- **Cuantización**: no se publican variantes GGUF, AWQ ni GPTQ, lo que limita el despliegue en hardware de consumo.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/nchapman/Qwen3.5-27B-GLiDE-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Profesor: https://huggingface.co/fastino/GLiDE-27B
- Corpus de destilación: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Benchmark JevBench público: https://huggingface.co/datasets/kshitijthakkar/nirnaya-jevbench-public-eval-v1
