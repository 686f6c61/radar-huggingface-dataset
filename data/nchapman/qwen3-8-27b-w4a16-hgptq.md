# nchapman/Qwen3.8-27B-W4A16-HGPTQ

## Resumen

Qwen3.8-27B-W4A16-HGPTQ es una cuantización de precisión mixta del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario nchapman bajo licencia Apache 2.0. Se trata de una compilación W4A16 (pesos a 4 bits, activaciones en 16 bits) generada con GPTQ con descomposición de Cholesky, `group_size=64` y `actorder="static"`, sobre la que se aplica una rotación Hadamard por bloques en la dimensión de entrada (estilo QuIP) para reducir el error de cuantización. El resultado ocupa 17,33 GiB en safetensors, frente a los aproximadamente 55 GB del modelo base en BF16, lo que permite desplegarlo en GPUs de 24 GB con una ventana de contexto útil.

El modelo conserva la arquitectura del base (etiqueta `qwen3_5` en transformers), con atención linear, MTP nativo (multi-token prediction) y torre de visión, y cubre 517 capas lineales cuantizadas: 400 de texto, 7 de MTP y 110 de visión. La propuesta diferencial frente a otras cuantizaciones W4A16 es la combinación de GPTQ con rotación Hadamard determinista, que según las métricas del autor reduce la divergencia KL un 15,3 % y elimina la degradación de perplejidad respecto a BF16 en su conjunto de sondas.

Es relevante ahora porque demuestra que es posible cuantizar a 4 bits tanto la torre de texto como la de visión y el cabezal MTP de un modelo de 27B sin pérdida medible de fidelidad, manteniendo compatibilidad con vLLM V1 (con un parche de dos líneas para las capas de visión). Está pensado para desarrolladores que necesitan servir un modelo multimodal de 27B en hardware de consumo o en una sola GPU de 24 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta `qwen3_5`) con atención linear, torre de visión y MTP nativo |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | W4A16: pesos INT4 con `group_size=64`, `actorder="static"`, GPTQ con Cholesky; activaciones BF16; rotación Hadamard online por bloques (`head_dim=64` general, `head_dim=16` en `visual.blocks.*.mlp.linear_fc2`) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compressed-tensors), 17,33 GiB de payload; repositorio de 18,6 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal con atención linear en parte de sus capas, una torre de visión tipo ViT y un módulo MTP (multi-token prediction) nativo que permite decodificación especulativa interna. La cuantización cubre 517 capas lineales: 400 en el modelo de texto, 7 en el módulo MTP y 110 en la torre de visión. Permanecen en BF16 `linear_attn.in_proj_a`, `linear_attn.in_proj_b`, `embed_tokens`/`lm_head`, `mtp.fc`, `visual.patch_embed.proj`, las normas y los sesgos.

La innovación técnica principal es la rotación Hadamard determinista aplicada antes de la cuantización: cada peso se pre-rota offline como W' = W·H_b/√b, donde H_b es la matriz de Walsh-Hadamard de Sylvester de tamaño b (b=64 en general, b=16 en la capa fc2 de visión), y en tiempo de inferencia se aplica la misma transformación normalizada a las activaciones de entrada antes del GEMM. Al ser determinista (`randomize: false`), no se almacenan tensores de transformación, con coste de almacenamiento cero. La calibración de texto y MTP usó 999 muestras de 4096 tokens de nvidia/Nemotron-Cascade-2-SFT-Data; la de visión, 64 imágenes de ChartQA y TextVQA disjuntas del conjunto de evaluación de 48 imágenes. La capa `visual.blocks.*.mlp.linear_fc2` (K=4304) usa GPTQ por canal con Cholesky más Hadamard de `head_dim=16`. El repositorio incluye una plantilla de chat de froggeric (v22.5) y una configuración de generación por defecto con `temperature 1.0`, `top_p 0.95`, `top_k 20`.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat incluida.
- Razonamiento y matemáticas (capacidades heredadas del modelo base; no se detallan evaluaciones específicas en la información disponible).
- Generación de código: no se documentan métricas propias en la información proporcionada.
- Comprensión de imágenes y texto (pipeline `image-text-to-text`), con torre de visión cuantizada y fidelidad medida de 0,9940 de similitud coseno frente a BF16.
- Respuesta a preguntas sobre gráficos y documentos visuales (ChartQA, TextVQA en el conjunto de calibración/evaluación).
- Decodificación especulativa mediante el módulo MTP nativo, que conserva un 96,22 % de acuerdo top-1 en modo aislado y un 87,14 % en modo extremo a extremo.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada (depende del modelo base).
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue de un modelo multimodal de 27B en una sola GPU de 24 GB: la cuantización W4A16 reduce el payload a 17,33 GiB, dejando espacio para KV cache y contexto en tarjetas como la RTX 4090 o la L4, algo inviable con el base en BF16 (~55 GB).
- Análisis de documentos y gráficos: la torre de visión cuantizada mantiene una similitud coseno de 0,9940 y un 98,67 % de acierto en ChartQA en la evaluación del autor, lo que la hace apta para extracción de datos de informes, tablas e infografías.
- Asistente conversacional de atención al cliente: la plantilla de chat incluida y el modo conversacional permiten gestionar diálogos multi-turno; el contexto máximo debe consultarse en la ficha del modelo base, ya que no se especifica aquí.
- Servicio de inferencia de alto rendimiento con vLLM V1: el formato compressed-tensors y la rotación Hadamard online están integrados en el motor; las capas de texto y MTP cargan sin cambios y las de visión requieren un parche de dos líneas documentado en la model card.
- Aceleración de la generación mediante MTP: el módulo de predicción multi-token conserva un 87,14 % de acuerdo top-1 extremo a extremo, lo que permite decodificación especulativa con verificación y menor latencia por token en producción.
- Investigación en cuantización: el repositorio sirve como referencia reproducible de la receta GPTQ + Hadamard (herramientas en warp-3090-model-lab) para comparar fidelidad KL, perplejidad y acuerdo top-1 frente a cuantizaciones GPTQ convencionales como la variante `g128-h0`.
- Evaluación comparativa de fidelidad de cuantizaciones: los conjuntos de sondas `probe-v4` y `probe-guard` y las métricas publicadas permiten reproducir la comparación entre recetas de cuantización sobre el mismo modelo base.

## Benchmarks y rendimiento

| Metrica | W4A16-GPTQ (g128-h0) | W4A16-HGPTQ (este repo) | Variacion |
|---|---:|---:|---:|
| Payload safetensors | 18,117 GiB | 17,334 GiB | −801,4 MiB (−4,3 %) |
| `probe-v4` weighted KL (cascade90-ml10) ↓ | 0,1369 (legacy: 0,1264) | 0,115968 (legacy: 0,1047) | −15,3 % |
| `probe-v4` KL medio por token / p99,9 ↓ | 0,357 / 24,66 | 0,301646 / 24,2052 | −15,5 % en KL medio |
| `probe-v4` Δ% de perplejidad vs BF16 (8,5438) ↓ | +1,00 % | −0,292 % (8,5189) | Sin degradación de perplejidad |
| `probe-guard` KL medio / Δ% PPL (76 filas) ↓ | 0,0867 / −0,52 % | 0,063923 / −6,828 % | −26,3 % en KL medio |
| MTP aislado: KL / acuerdo top-1 (12.339 posiciones) ↑ | BF16 en el repo antiguo | 0,010930 / 96,22 % (11.873/12.339) | Ahorro de 521,4 MiB en el shard MTP |
| MTP extremo a extremo: KL / acuerdo top-1 ↑ | — | 0,213082 / 87,14 % | — |
| Visión: Rel-RMSE / similitud coseno de features ViT (48 imágenes) | BF16 en el repo antiguo | 0,1143 / 0,9940 | Ahorro de 605 MiB en visión |
| Visión: KL aislado de respuesta / acuerdo top-1 (157 tokens) ↑ | — | 0,015734 / 97,45 % (153/157) | 98,67 % en ChartQA |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; las métricas anteriores son de fidelidad de cuantización frente al modelo base en BF16, no de capacidad absoluta.

## Requisitos de hardware

- VRAM estimada para inferencia: ~17,33 GiB solo de pesos; con overhead de runtime y KV cache, el consumo arranca en torno a 18-20 GiB, por lo que encaja en GPUs de 24 GB con contexto moderado.
- GPU recomendadas: RTX 4090 (24 GB), L4 (24 GB), A10G (24 GB) para despliegue en una sola tarjeta; A100 40/80 GB y H100 para mayor contexto y concurrencia.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y en tarjetas de 24 GB o más; no cabe en GPUs de 16 GB sin descargar capas a CPU.
- Opciones de despliegue: vLLM V1 (v0.31.0) con soporte nativo de compressed-tensors y transformaciones Hadamard; las capas de texto y MTP cargan directamente, las de visión requieren el parche de dos líneas documentado. No se mencionan otros motores (llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| nchapman/Qwen3.8-27B-W4A16-HGPTQ (este) | 27,36 B | No disponible | W4A16 GPTQ + Hadamard, g64 | Apache 2.0 | 17,33 GiB; rotacion Hadamard online; parche de 2 lineas para vision en vLLM |
| nchapman/Qwen3.8-27B-W4A16-HGPTQ-g64 | 27,36 B | No disponible | W4A16 GPTQ + Hadamard, variante g64 | Apache 2.0 | Variante del mismo autor; sin metricas detalladas en la informacion disponible |
| GotoAI-Inc/Qwen3.8-27B-W4A16 | 27,36 B | No disponible | W4A16 INT4 weight-only, compressed-tensors | Apache 2.0 | 19,42 GB; sin rotacion Hadamard; pensado para vLLM y tarjetas de 24 GB |
| Qwen/Qwen3.8-27B (base) | 27,36 B | No disponible | BF16 | Apache 2.0 | ~55,56 GB; referencia de fidelidad |

## Limitaciones y advertencias

- Sesgos: no documentados en la información proporcionada; hereda los del modelo base Qwen3.8-27B, que no se detallan aquí.
- Riesgo de alucinación: no evaluado en la información disponible; la cuantización a 4 bits puede amplificar errores en dominios poco representados en la calibración.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se especifican en la información proporcionada; deben consultarse en la ficha del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; el modelo base conserva su propia licencia y condiciones.
- Compatibilidad de despliegue: las capas de visión no cargan en vLLM V1 sin aplicar el parche de dos líneas descrito en la model card; sin él, el pipeline `image-text-to-text` puede fallar en el motor.
- La rotación Hadamard es determinista y no almacena tensores, pero exige que el runtime aplique la transformación normalizada a las activaciones de entrada; un motor que no la implemente producirá salidas incorrectas.
- Calibración limitada: 999 muestras de texto/MTP y 64 imágenes de visión; dominios alejados de Nemotron-Cascade-2-SFT-Data o de ChartQA/TextVQA pueden presentar mayor degradación.
- Métricas de fidelidad reportadas por el propio autor de la cuantización, no auditadas de forma independiente; los valores "legacy" entre paréntesis indican revisiones previas de la receta.
- Repositorio con 2 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy reducido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/Qwen3.8-27B-W4A16-HGPTQ
- Variante g64: https://huggingface.co/nchapman/Qwen3.8-27B-W4A16-HGPTQ-g64
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizacion alternativa de GotoAI: https://huggingface.co/GotoAI-Inc/Qwen3.8-27B-W4A16
- Repositorio de herramientas y receta: https://github.com/nchapman/warp-3090-model-lab
- Dataset de calibracion: https://huggingface.co/datasets/nvidia/Nemotron-Cascade-2-SFT-Data
- Datos congelados de calibracion: https://huggingface.co/datasets/nchapman/warp-3090-quant-lab-frozen-data
- Plantillas de chat: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
