# nchapman/Qwen3.6-35B-A3B-W4A16-HGPTQ-g64

## Resumen

Qwen3.6-35B-A3B-W4A16-HGPTQ-g64 es una cuantización de precisión mixta W4A16 del modelo multimodal Qwen/Qwen3.6-35B-A3B, publicada por el usuario nchapman bajo licencia Apache 2.0. El modelo base es un transformer de mezcla de expertos (MoE) de 35.951.822.704 parámetros totales con capacidad de entrada imagen-texto (pipeline image-text-to-text) y arquitectura híbrida que combina atención estándar (self_attn) con capas de atención lineal (linear_attn), además de un módulo nativo de predicción multi-token (MTP).

La aportación de esta ficha no es el modelo en sí, sino la receta de cuantización: GPTQ con Cholesky, group_size=64, actorder estático y rotación Hadamard en línea de la dimensión de entrada (estilo QuIP, head_dim=64) aplicada sobre 244 capas lineales no expertas (texto, MTP y visión), mientras que los 31.488 lineales de expertos enrutados del MoE se cuantizan sin rotación para ejecutarse directamente en el kernel fusionado MarlinMoE de vLLM V1. El resultado pesa 19,42 GiB en safetensors, un 6,1% menos que la variante GPTQ g128-h0 del mismo autor, con una perplejidad solo un 0,924% superior a la del modelo BF16.

Es relevante para desarrolladores que necesitan desplegar un MoE multimodal de ~36.000 millones de parámetros en hardware de una sola GPU de 24 GB o en nodos pequeños, manteniendo fidelidad cercana al original y compatibilidad con vLLM, a costa de requerir un parche de dos líneas para las capas de visión rotadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (self_attn + linear_attn) con módulo MTP nativo y torre de visión |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 GPTQ (Cholesky, group_size=64, actorder="static") con rotación Hadamard en línea (head_dim=64; head_dim=16 en `visual.blocks.*.mlp.linear_fc2`); pesos no expertos rotados offline; expertos MoE sin rotar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), 19,42 GiB; repo de 20,9 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer de mezcla de expertos con dos tipos de capas de atención (self_attn y linear_attn), lo que sugiere una arquitectura híbrida que alterna atención cuadrática con mecanismos lineales para reducir coste en contextos largos. Incluye un módulo MTP (multi-token prediction) nativo con 772 lineales cuantizados y una torre de visión con 110 lineales rotados. Esta ficha no documenta el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO); esa información corresponde a la model card de Qwen y no está disponible en la información proporcionada.

El trabajo de cuantización sí está detallado: calibración de texto y MTP con 999 muestras de 4096 tokens de nvidia/Nemotron-Cascade-2-SFT-Data (fijadas en el dataset warp-3090-quant-lab-frozen-data), y calibración de visión con 64 imágenes de ChartQA y TextVQA disjuntas del conjunto de evaluación de 48 imágenes. Los 244 lineales no expertos se pre-rotan offline con la matriz de Walsh-Hadamard de Sylvester determinista (b=64 para `v`, b=16 para `v_vision_fc2`) antes de la cuantización GPTQ, de modo que no se almacenan tensores de transformación (0 overhead). Los 31.488 lineales de expertos enrutados usan GPTQ g64 sin rotar y sin permutar antes del empaquetado, para ejecutarse en el kernel MarlinExperts/MarlinMoE de vLLM V1. Permanecen en BF16: `linear_attn.in_proj_a/b`, `mlp.gate`, `mlp.shared_expert.*`, `mlp.shared_expert_gate`, `embed_tokens`/`lm_head`, `mtp.fc`, `visual.patch_embed.proj`, normas y sesgos. La plantilla de chat incluida es la de froggeric Qwen-Fixed-Chat-Templates v22.5.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat incluida y parámetros de muestreo por defecto definidos (temperature 0.6, top_p 0.95, top_k 20).
- Razonamiento y generación de código: capacidades heredadas del modelo base Qwen3.6, no verificadas de forma independiente en esta ficha.
- Entrada imagen-texto: la torre de visión está cuantizada y evaluada (98,67% de acierto top-1 en ChartQA en modo aislado; 100,0% end-to-end), lo que respalda tareas de comprensión de gráficos y documentos.
- Predicción multi-token (MTP) nativa, útil para decodificación especulativa y aceleración de generación; fidelidad medida de 95,93% de acuerdo top-1 en modo aislado y 89,17% end-to-end.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un MoE multimodal de ~36.000 millones de parámetros en una sola GPU de 24 GB: con 19,42 GiB de pesos W4A16, el modelo cabe junto con la caché KV en tarjetas como la RTX 4090 o la RTX 3090, algo inviable en BF16.
- Comprensión de gráficos y documentos financieros: la torre de visión cuantizada conserva el 98,67% de acierto top-1 en ChartQA aislado y el 100% end-to-end, por lo que sirve para extraer tendencias y valores de capturas de paneles y tablas.
- Generación acelerada con decodificación especulativa: el módulo MTP cuantizado mantiene un 89,17% de acuerdo top-1 end-to-end, lo que permite usarlo como cabecera de borrador para reducir latencia en servidores vLLM.
- Servicio de chat conversacional en producción: la plantilla de chat v22.5 incluida y los parámetros de muestreo por defecto evitan configuraciones manuales y reducen el riesgo de respuestas degeneradas en despliegues multi-turno.
- Evaluación de técnicas de cuantización: el repositorio documenta métricas de KL, perplejidad y acuerdo top-1 frente a BF16 y frente a la variante g128-h0, lo que lo convierte en un punto de referencia para investigar rotación Hadamard en MoE.
- Prototipado en estaciones de trabajo con una sola GPU consumer: el tamaño de 19,42 GiB permite iterar sobre tareas de visión y texto sin clústeres multi-GPU, usando vLLM V1 con el parche indicado para visión.
- Pipelines de inferencia de bajo coste en cloud con GPU de 24 GB (L4, A10G, RTX 4090): el ahorro del 6,1% en payload frente a g128-h0 se traduce en menor presión de memoria y más espacio para caché KV.

## Benchmarks y rendimiento

Los datos disponibles son métricas de fidelidad de la cuantización frente al modelo BF16 y frente a la variante GPTQ g128-h0, no benchmarks de tarea estándar (MMLU, HumanEval, GSM8K).

| Metrica | GPTQ g128-h0 | HGPTQ-g64 (este repo) | Cambio |
|---|---:|---:|---:|
| Payload safetensors | 20,678 GiB | 19,419 GiB | −1.289,5 MiB (−6,1%) |
| probe-v4 weightedKL (↓) | 0,130688 | 0,088640 | −32,2% |
| probe-v4 KL medio por token / p99.9 (↓) | 0,310602 / 19,6500 | 0,230016 / 17,2924 | −25,9% KL medio |
| probe-v4 PPL Δ% vs BF16 (4,0230) (↓) | +3,600% | +0,924% (4,0601) | −2,68 pp |
| probe-guard KL medio / weightedKL (76 filas) (↓) | 0,087586 / — | 0,051031 / 0,061633 | −41,7% KL medio |
| MTP aislado KL / acuerdo top-1 (11.583 pos) | BF16 en repo antiguo | 0,011587 / 95,93% | — |
| MTP end-to-end KL / acuerdo top-1 | 0,0956 / — | 0,122539 / 89,17% | — |
| Visión ViT Rel-RMSE / coseno (48 imágenes) | BF16 en repo antiguo | 0,2157 / 0,9802 | — |
| Visión respuesta aislada KL / top-1 (157 tokens) | — | 0,021799 / 97,45% | 98,67% ChartQA |
| Visión respuesta end-to-end KL / top-1 | — | 0,052438 / 96,82% | 100,0% ChartQA |

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~19,42 GiB solo de pesos; con caché KV y overhead de vLLM, el consumo realista parte de ~21-23 GiB según longitud de contexto y lote.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), L4 (24 GB), A10G (24 GB); A100/H100 para lotes grandes o contextos largos.
- Cabe en GPU consumer: sí, en tarjetas de 24 GB; en 16 GB no cabe sin cuantización adicional o offload.
- Opciones de despliegue: vLLM V1 (v0.31.0) con compressed-tensors; requiere un parche de dos líneas en `vllm/model_executor/layers/quantization/compressed_tensors/transform/linear.py` para las capas de visión rotadas. Texto y MTP cargan sin cambios. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-W4A16-HGPTQ-g64 (este) | 35.951.822.704 | no disponible | W4A16 GPTQ g64 + Hadamard | Apache 2.0 | 19,42 GiB, PPL Δ +0,924% vs BF16 |
| nchapman/Qwen3.6-35B-A3B-W4A16-GPTQ | 35.951.822.704 (base) | no disponible | W4A16 GPTQ g128, sin Hadamard | Apache 2.0 | 20,678 GiB, PPL Δ +3,600% vs BF16 |
| Qwen/Qwen3.6-35B-A3B (BF16) | 35.951.822.704 | no disponible | BF16 | Apache 2.0 | Referencia de fidelidad; ~72 GB de pesos |

No se dispone de datos de benchmarks de tarea para comparar el rendimiento frente a modelos de otras familias.

## Limitaciones y advertencias

- La cuantización introduce degradación medible: PPL +0,924% frente a BF16 y KL medio por token de 0,230016 en probe-v4; en tareas sensibles conviene validar contra el modelo BF16.
- El módulo MTP pierde fidelidad end-to-end (89,17% de acuerdo top-1 frente a 95,93% aislado), lo que puede reducir la eficacia de la decodificación especulativa.
- La torre de visión presenta un Rel-RMSE de 0,2157 en características del ViT; aunque el acuerdo top-1 en respuestas es alto, tareas visuales finas pueden degradarse.
- vLLM V1 v0.31.0 requiere un parche manual para las capas de visión rotadas; sin él, la carga de `model.visual.*` falla. Texto y MTP no necesitan cambios.
- La calibración usa un dataset concreto (Nemotron-Cascade-2-SFT-Data) y 64 imágenes de ChartQA/TextVQA; dominios muy distintos pueden sufrir mayor degradación.
- No hay información sobre sesgos, idiomas soportados ni riesgo de alucinación específicos de esta cuantización; deben evaluarse sobre el modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el autor de la cuantización no ofrece garantías; el repo tiene 0 descargas y 0 likes, sin validación comunitaria.
- El modelo base Qwen3.6-35B-A3B no está documentado en esta ficha (contexto, datos de entrenamiento, RLHF); consúltese su model card antes de producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nchapman/Qwen3.6-35B-A3B-W4A16-HGPTQ-g64
- Variante GPTQ g128-h0 del mismo autor: https://huggingface.co/nchapman/Qwen3.6-35B-A3B-W4A16-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Dataset de calibración: https://huggingface.co/datasets/nvidia/Nemotron-Cascade-2-SFT-Data
- Dataset de calibración fijado: https://huggingface.co/datasets/nchapman/warp-3090-quant-lab-frozen-data
- Plantillas de chat: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Herramientas y receta: https://github.com/nchapman/warp-3090-model-lab
