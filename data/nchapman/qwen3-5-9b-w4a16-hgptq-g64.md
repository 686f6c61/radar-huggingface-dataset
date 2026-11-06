# nchapman/Qwen3.5-9B-W4A16-HGPTQ-g64

## Resumen

Qwen3.5-9B-W4A16-HGPTQ-g64 es una cuantización de 4 bits en pesos con activaciones en 16 bits (W4A16) del modelo multimodal Qwen/Qwen3.5-9B, publicada por el usuario nchapman. El artefacto aplica GPTQ con descomposición de Cholesky sobre 317 capas lineales (200 de texto, 7 de MTP nativo y 110 de visión), con rotación Hadamard por bloques aplicada en línea sobre las activaciones de entrada. El resultado ocupa 7,62 GiB en safetensors frente a los aproximadamente 18 GB que requeriría el modelo en BF16, con una degradación de perplejidad medida del +1,887 % respecto al original.

La relevancia de esta ficha radica en que documenta una técnica de cuantización poco habitual: la rotación Hadamard (estilo QuIP) combinada con GPTQ, que reduce la varianza de los valores atípicos antes de cuantizar y permite mantener la calidad en 4 bits. Además, incluye calibración específica para las capas de visión y para el módulo MTP (multi-token prediction) nativo, algo que la mayoría de cuantizaciones publicadas omiten.

El modelo base Qwen3.5-9B es un transformer multimodal de 9.409.813.744 parámetros con soporte de image-text-to-text. Esta versión cuantizada mantiene la licencia Apache 2.0 y está pensada para despliegue en vLLM V1, aunque las capas de visión requieren un parche de dos líneas en el código de vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión) con MTP nativo y capas `linear_attn`; cuantización GPTQ con rotación Hadamard |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), GPTQ con Cholesky, `group_size=64`, `actorder="static"`; BF16 para `linear_attn.in_proj_a/b`, `embed_tokens`/`lm_head`, `mtp.fc`, `visual.patch_embed.proj`, normas y sesgos |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), 7,6175 GiB (8.179.266.352 bytes) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Qwen con dos componentes destacados: capas de atención lineal (`linear_attn`) junto a atención estándar, y un módulo MTP (multi-token prediction) nativo que predice varios tokens por paso. La cuantización se aplica sobre 317 capas lineales: 200 en el tronco de texto, 7 en el módulo MTP y 110 en el codificador visual. Las capas `linear_attn.in_proj_a` e `in_proj_b`, los embeddings, la cabeza de salida, `mtp.fc`, `visual.patch_embed.proj`, las normas y los sesgos permanecen en BF16.

El proceso de cuantización combina GPTQ con descomposición de Cholesky y rotación Hadamard determinista por bloques ($b=64$ para las capas de texto y MTP, $b=16$ para `visual.blocks.*.mlp.linear_fc2`). Los pesos se rotan offline ($W' = W H_b / \sqrt{b}$) y en tiempo de inferencia se aplica la misma transformación normalizada sobre la última dimensión de las activaciones de entrada antes del GEMM. Al ser $H_b$ determinista (`randomize: false`), no se almacenan tensores de transformación, por lo que el coste de almacenamiento adicional es cero. La calibración de texto y MTP usó 999 muestras de 4.096 tokens de `nvidia/Nemotron-Cascade-2-SFT-Data`; la de visión, 64 imágenes de ChartQA y TextVQA disjuntas del conjunto de evaluación de 48 imágenes. La capa `visual.blocks.*.mlp.linear_fc2` ($K=4304$) usa GPTQ por canal con Cholesky y Hadamard de `head_dim=16`. No se documenta en la información disponible si hubo RLHF, DPO ni el volumen total de tokens de entrenamiento del modelo base.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno (pipeline `image-text-to-text`).
- Comprensión de imágenes: el modelo base es multimodal y esta versión conserva el codificador visual cuantizado (ViT con similitud coseno de 0,9813 frente a BF16).
- Respuesta a preguntas sobre gráficos y documentos visuales (la calibración de visión usa ChartQA y TextVQA).
- Predicción multi-token nativa (MTP) con acuerdo top-1 del 94,80 % en modo aislado y 86,81 % de extremo a extremo respecto a BF16.
- Plantilla de chat incluida (`chat_template.jinja`, versión froggeric v22.5) para uso conversacional directo.
- Parámetros de muestreo por defecto definidos en `generation_config.json`: `temperature 1.0`, `top_p 0.95`, `top_k 20`, `eos_token_id: [248046, 248044]`.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y con vLLM.
- No se documenta en la información disponible soporte explícito de tool calling, function calling, agentes ni audio.

## Casos de uso

- Despliegue de un asistente multimodal en una sola GPU de 24 GB: los 7,62 GiB de pesos en W4A16 permiten cargar el modelo completo, incluido el codificador visual, en tarjetas como la RTX 4090, algo inviable con el modelo en BF16.
- Análisis de gráficos y tablas en informes: el codificador visual cuantizado mantiene un 94,27 % de acuerdo top-1 en respuestas de extremo a extremo, suficiente para extraer valores de ChartQA o TextVQA en pipelines de documentación técnica.
- Generación de código y texto en entornos con VRAM limitada: el tronco de texto en 4 bits reduce el coste por token y permite servir varias instancias en un mismo nodo.
- Servicio de inferencia con vLLM V1: el modelo carga directamente las capas de texto y MTP; para visión se aplica el parche de dos líneas documentado, lo que permite integrarlo en un servidor OpenAI-compatible.
- Investigación en cuantización: el artefacto sirve como referencia reproducible de GPTQ con rotación Hadamard y métricas de fidelidad publicadas (KL ponderada de 0,072561 sobre 840.187 tokens), útil para comparar recetas de cuantización.
- Evaluación de decodificación especulativa con MTP: el módulo de predicción multi-token cuantizado, con 94,80 % de acuerdo top-1 aislado, permite experimentar con decodificación especulativa en producción sin el modelo completo en BF16.
- Prototipado de asistentes conversacionales con contexto visual en estaciones de trabajo con una única GPU consumer, usando la plantilla de chat incluida y los parámetros de muestreo por defecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica métricas de fidelidad de la cuantización frente al modelo BF16:

| Metrica | Valor medido |
|---|---:|
| `probe-v4` weighted KL (378 filas / 840.187 tokens) | 0,072561 |
| `probe-v4` KL media por token / p99,9 | 0,219906 / 18,9820 |
| `probe-v4` delta de perplejidad vs BF16 (3,5754 → 3,6428) | +1,887 % |
| `probe-guard` KL media por token / delta de perplejidad (76 filas) | 0,039547 / +1,388 % |
| MTP nativo aislado: KL / acuerdo top-1 (11.583 posiciones) | 0,012801 / 94,80 % |
| MTP nativo extremo a extremo: KL / acuerdo top-1 | 0,204901 / 86,81 % |
| Visión: Rel-RMSE de features del ViT / similitud coseno (48 imágenes) | 0,2114 / 0,9813 |
| Visión aislada: KL / acuerdo top-1 (157 tokens) | 0,007640 / 98,09 % (154/157) |
| Visión extremo a extremo: KL / acuerdo top-1 | 0,038995 / 94,27 % |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 7,62 GiB; con caché KV y overhead de runtime, el consumo se sitúa típicamente entre 10 y 14 GB según longitud de contexto y lote (estimación, no publicada por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S para producción con lotes grandes; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en una sola tarjeta.
- Cabe en GPU consumer: sí, en RTX 4090, RTX 3090 y tarjetas con 24 GB o más; en 16 GB el margen es ajustado y depende de la longitud de contexto.
- Opciones de despliegue: vLLM V1 (v0.31.0) con soporte nativo para texto y MTP; las capas de visión requieren el parche de dos líneas en `vllm/model_executor/layers/quantization/compressed_tensors/transform/linear.py`. Compatible con `transformers` y `compressed-tensors`. No se documenta soporte de llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-W4A16-HGPTQ-g64 (este) | 9,41 B | No disponible | W4A16 GPTQ + Hadamard, 7,62 GiB | Apache 2.0 | Incluye visión y MTP cuantizados con métricas de fidelidad |
| Qwen/Qwen3.5-9B (base) | 9,41 B | No disponible | BF16 (~18 GB) | Apache 2.0 | Referencia de calidad; requiere más VRAM |
| Otras cuantizaciones GPTQ/AWQ de Qwen3.5-9B | 9,41 B | No disponible | W4A16 estándar | Apache 2.0 | No disponibles en la información proporcionada; sin métricas de visión ni MTP publicadas |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Degradación medible frente a BF16: +1,887 % de perplejidad en `probe-v4` y KL media por token de 0,219906, con cola p99,9 de 18,9820; en tareas sensibles a tokens de baja probabilidad puede haber divergencias.
- El MTP extremo a extremo baja al 86,81 % de acuerdo top-1, frente al 94,80 % aislado; la decodificación especulativa puede acumular errores.
- Las capas de visión requieren un parche manual en vLLM V1 (v0.31.0); sin él, la carga de `model.visual.*` falla o produce resultados incorrectos.
- La calibración de visión usó solo 64 imágenes de ChartQA y TextVQA; el rendimiento en otros dominios visuales (fotografía natural, documentos manuscritos, vídeo) no está validado.
- No se documentan los idiomas soportados ni el comportamiento multilingüe de esta cuantización.
- No se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que la calidad en tareas concretas debe evaluarse empíricamente.
- Riesgo de alucinación inherente al modelo base; la cuantización puede amplificarlo en dominios fuera de la distribución de calibración (Nemotron-Cascade-2-SFT-Data para texto).
- Licencia Apache 2.0 permite uso comercial, pero el autor de la cuantización no ofrece garantías; verificar la licencia del modelo base Qwen3.5-9B para condiciones adicionales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente sin validación comunitaria extensa.

## Enlaces

- Hugging Face: https://huggingface.co/nchapman/Qwen3.5-9B-W4A16-HGPTQ-g64
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de receta y tooling: https://github.com/nchapman/warp-3090-model-lab
- Dataset de calibración: https://huggingface.co/datasets/nvidia/Nemotron-Cascade-2-SFT-Data
- Dataset de calibración congelado: https://huggingface.co/datasets/nchapman/warp-3090-quant-lab-frozen-data
- Plantillas de chat: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Commit del modelo base: `c202236235762e1c871ad0ccb60c8ee5ba337b9a`
