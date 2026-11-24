# nchapman/Qwen3.6-35B-A3B-W4A16-HGPTQ-g64

## Resumen

Qwen3.6-35B-A3B-W4A16-HGPTQ-g64 es una cuantización de 4 bits del modelo multimodal Qwen/Qwen3.6-35B-A3B, publicada por el usuario nchapman. Se trata de un checkpoint derivado, no de un modelo original: aplica una receta de cuantización GPTQ con rotación Hadamard (W4A16, group size 64) sobre todos los expertos enrutados del MoE, los expertos compartidos, las capas de atención y GDN, el codificador visual y el borrador especulativo MTP nativo. El resultado comprime el checkpoint BF16 de 66,97 GiB hasta 18,78 GiB, una reducción de 3,57 veces, lo que permite ejecutar el modelo completo en una única GPU de 24 GB.

El modelo base es un transformer híbrido con arquitectura MoE (mezcla de expertos) de 36.468.770.672 parámetros totales, con 40 capas, 256 expertos enrutados por capa y atención con componentes lineales (GDN). Incorpora capacidades de visión (image-text-to-text) y un cabezal MTP (multi-token prediction) que actúa como decodificador especulativo. La licencia es Apache 2.0.

La relevancia de esta ficha radica en que demuestra que es posible servir un modelo MoE multimodal de 35B con decodificación especulativa en hardware de consumo de gama alta, manteniendo una fidelidad medible frente al BF16 original (KL ponderada de 0,0847 en el conjunto de prueba principal y perplejidad incluso ligeramente inferior). Es una opción práctica para despliegues con presupuesto de VRAM limitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con MoE (256 expertos enrutados por capa), atención con capas lineales (GDN), visión ViT y cabezal MTP nativo; tipo `qwen3_5_moe` |
| Parametros totales | 36.468.770.672 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 con group size 64 (GPTQ + rotación Hadamard); `lm_head` y `mtp.fc` en W8_g64; capas concretas en BF16 |
| Idiomas soportados | no disponible (el conjunto de evaluación incluye prompts multilingües, pero no se detalla la lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `compressed-tensors`), requiere `trust-remote-code` en vLLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura transformer con mezcla de expertos: 40 capas, cada una con 256 expertos enrutados y expertos compartidos, más proyecciones de atención estándar (`self_attn`) y lineales (`linear_attn`, asociadas a GDN). El checkpoint incorpora además un codificador visual de 27 bloques ViT con dos proyecciones de fusión espacial (merger) y un módulo MTP nativo que actúa como borrador especulativo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

Esta versión cuantizada no reentrena el modelo, sino que aplica una receta de compresión sobre 31.857 capas lineales: rotación Walsh-Hadamard de 64×64 en la entrada, GPTQ con inicialización Cholesky y búsqueda de escala por MSE, descenso coordinado de Hessiana en dos pasadas (H-CD) y ajuste KL de extremo a extremo con maestro en FP32 para `RMSNorm` y GDN. Los 30.970 lineales de texto, 775 del MTP y 110 de visión se cuantizan a W4A16; `lm_head` y `mtp.fc` se mantienen en 8 bits. Permanecen en BF16 `embed_tokens`, `linear_attn.in_proj_a/b`, `mlp.gate`, `mlp.shared_expert_gate`, `visual.patch_embed.proj`, normas y sesgos. La innovación técnica destacable es la rotación Hadamard online en tiempo de ejecución sobre las activaciones de entrada de `gate_proj`/`up_proj` (K=2048) y sobre las activaciones intermedias post-SwiGLU antes de `down_proj` (K=512), lo que reduce el error de cuantización en los expertos MoE. Se incluye además un perfil estático de expertos calientes (`static_hot_cache_rankings.json`) con tasas de acierto del 42,62% para top-64 y del 69,14% para top-128.

## Capacidades

- Generación de texto conversacional con parámetros de muestreo por defecto definidos en `generation_config.json` (temperature 0,6, top_p 0,95, top_k 20).
- Razonamiento y matemáticas: el conjunto de evaluación de perplejidad incluye prompts de matemáticas, ciencia y coding.
- Generación de código: evaluado dentro del conjunto de prompts de coding y uso de herramientas.
- Uso de herramientas (tool calling / function calling): mencionado explícitamente en la composición del conjunto de evaluación de texto.
- Capacidades multimodales de imagen a texto: VQA, gráficos, documentos y OCR, con un codificador ViT de 27 bloques cuantizado y una fidelidad medida del 99,34% de top-1 aislado y 97,68% de extremo a extremo.
- Comprensión de interfaces y OCR matemático: evaluado en el conjunto ScreenSpot, con 98,52% de top-1 aislado y 97,04% de extremo a extremo.
- Decodificación especulativa nativa mediante el módulo MTP, con una tasa de acuerdo top-1 del 95,80% aislado y 89,61% de extremo a extremo frente al BF16.
- Capacidades multilingües: el conjunto de evaluación de texto incluye prompts multilingües, aunque no se detalla la cobertura por idioma.
- No se dispone de información sobre modo de pensamiento explícito (thinking mode), audio u otras capacidades especiales del modelo base.

## Casos de uso

- Despliegue en una única GPU de 24 GB: el checkpoint ocupa 18,78 GiB, dejando unos 5,2 GiB para caché KV y decodificación especulativa; es adecuado para servir el modelo completo en estaciones de trabajo con RTX 4090 o similares.
- Asistente conversacional multi-turno: los parámetros de muestreo por defecto y el formato conversacional permiten integrarlo directamente en aplicaciones de chat con `transformers` o vLLM.
- Procesamiento de documentos y OCR: el codificador visual cuantizado mantiene un 97,68% de acuerdo top-1 de extremo a extremo en VQA, gráficos, documentos y OCR, lo que lo hace viable para extracción de información de facturas, formularios e informes.
- Automatización de interfaces (UI agents): la evaluación en ScreenSpot con 97,04% de top-1 de extremo a extremo respalda su uso en tareas de localización de elementos en pantallas y automatización de flujos.
- Generación de código asistida en pipelines: el soporte de tool calling y la evaluación en prompts de coding permiten integrarlo en asistentes de desarrollo y revisión automatizada.
- Razonamiento matemático y científico: los prompts de matemáticas y ciencia del conjunto de evaluación indican capacidad para resolver problemas técnicos, aunque la fidelidad debe validarse en el dominio concreto.
- Aceleración mediante decodificación especulativa: el módulo MTP nativo con un 89,61% de acuerdo top-1 de extremo a extremo permite reducir la latencia en cargas de generación larga.
- Investigación sobre cuantización MoE: la receta documentada (Hadamard + GPTQ + H-CD + ajuste KL) y los rankings de expertos calientes sirven como referencia reproducible para estudiar el impacto de la compresión en modelos MoE multimodales.

## Benchmarks y rendimiento

Los datos disponibles son evaluaciones de fidelidad frente al modelo BF16 base, no benchmarks estándar de tareas (MMLU, HumanEval, GSM8K). Se presentan a continuación tal como los publica el autor.

| Evaluacion | BF16 base | W4A16-HGPTQ | Notas |
|---|---:|---:|---|
| Tamano safetensors | 66,97 GiB | 18,78 GiB | Compresión 3,57× (−48,19 GiB) |
| Perplejidad de texto (378 prompts, 840k tokens) ↓ | 4,0208 | 3,7522 (−6,68%) | Chat, matemáticas, ciencia, coding, tool use, multilingüe |
| Divergencia KL ponderada / media por token ↓ | 0,0000 | 0,0847 / 0,2103 | KL FP32 sobre vocabulario completo |
| Perplejidad holdout general y multilingüe (76 prompts, 20k tokens) ↓ | 25,7581 | 24,5254 (−4,79%) | KL media por token 0,0462 (ponderada 0,0509) |
| MTP nativo (11.583 posiciones) | 100,0% top-1 (NLL 2,0268) | 95,80% top-1 (NLL 2,0363) | KL aislada 0,0105; top-1 E2E 89,61%, KL 0,1037 |
| Visión VQA, gráficos, documentos y OCR (96 imágenes, 302 tokens) | 1,0000 cos sim · 100,0% top-1 | 0,9860 cos sim · 99,34% top-1 | KL ViT aislada 0,0071; top-1 E2E 97,68%, KL 0,0201 |
| Visión UI / ScreenSpot y OCR matemático (48 imágenes, 135 tokens) | 1,0000 cos sim · 100,0% top-1 | 0,9899 cos sim · 98,52% top-1 | KL ViT aislada 0,0049; top-1 E2E 97,04%, KL 0,0307 |

No se han publicado resultados de benchmarks estándar de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada: 18,78 GiB para los pesos cuantizados; se recomienda reservar al menos 24 GB para dejar espacio a la caché KV y a la decodificación especulativa (el autor indica unos 5,2 GiB libres en una tarjeta de 24 GB).
- GPU recomendadas: RTX 4090 (24 GB) o A100/H100 para mayor margen de contexto y concurrencia. Para GPUs de 16 GB existe una variante W2.6A16 del mismo autor que ocupa 13,15 GiB.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y en GPUs profesionales de 24 GB o más. No cabe en GPUs de 16 GB en esta variante W4A16.
- Opciones de despliegue: vLLM con `--trust-remote-code` (el autor incluye el helper `vllm_warp_quant.py`); también es compatible con `transformers` y `compressed-tensors`. No se menciona soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La decodificación especulativa con MTP nativo (89,61% de acuerdo top-1 de extremo a extremo) está pensada para reducir la latencia, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nchapman/Qwen3.6-35B-A3B-W4A16-HGPTQ-g64 | 36.468.770.672 | no disponible | W4A16 g64 + W8_g64 | Apache 2.0 | Hugging Face, 386 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 36.468.770.672 | no disponible | BF16 | Apache 2.0 | Hugging Face |
| nchapman/Qwen3.6-35B-A3B-W2.6A16-HGPTQ-RCO | no disponible | no disponible | W2.6A16 | Apache 2.0 | Hugging Face, 13,15 GiB |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada. La comparación con el modelo base se limita al tamaño y a las métricas de fidelidad de la sección de benchmarks; no hay datos de rendimiento en tareas estándar para ninguno de los dos.

## Limitaciones y advertencias

- Es un checkpoint derivado cuantizado, no un modelo original: el autor es nchapman, no el equipo de Qwen, y no se detalla el proceso de validación independiente.
- La cuantización introduce divergencia respecto al BF16: KL ponderada de 0,0847 y media por token de 0,2103 en el conjunto principal, y una caída de top-1 del MTP al 89,61% de extremo a extremo. En tareas sensibles a la precisión puede requerir validación adicional.
- La perplejidad reportada es inferior a la del BF16 (−6,68% y −4,79%), lo que puede reflejar un efecto de la receta de ajuste KL y no debe interpretarse automáticamente como una mejora de calidad en tareas.
- No se dispone de datos sobre sesgos conocidos, tasas de alucinación ni cobertura idiomática detallada.
- No se especifica la longitud de contexto soportada; el margen de VRAM para caché KV en 24 GB es de unos 5,2 GiB, lo que limita contextos largos o alta concurrencia.
- Requiere `--trust-remote-code` en vLLM y el helper `vllm_warp_quant.py` incluido; no se documenta compatibilidad con llama.cpp, Ollama ni TGI, lo que restringe las opciones de despliegue.
- La rotación Hadamard online en tiempo de ejecución debe aplicarse exactamente según `quantization_config.transform_config.config_groups.v`; una implementación incorrecta degradaría la calidad de forma silenciosa.
- Licencia Apache 2.0: permite uso comercial, pero al ser un derivado conviene conservar los avisos de atribución del modelo base y del autor de la cuantización.
- El repositorio ocupa 100,8 GB, muy por encima de los 18,78 GiB de pesos efectivos, lo que implica un coste de almacenamiento y descarga considerable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/Qwen3.6-35B-A3B-W4A16-HGPTQ-g64
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Variante de 16 GB (W2.6A16): https://huggingface.co/nchapman/Qwen3.6-35B-A3B-W2.6A16-HGPTQ-RCO
