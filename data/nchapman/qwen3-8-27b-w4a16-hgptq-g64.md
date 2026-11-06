# nchapman/Qwen3.8-27B-W4A16-HGPTQ-g64

## Resumen

Qwen3.8-27B-W4A16-HGPTQ-g64 es una cuantización de precisión mixta del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario nchapman bajo licencia Apache 2.0. Se trata de un checkpoint de 27.356.728.560 parámetros totales que combina GPTQ con rotación Hadamard en línea (estilo QuIP) para comprimir a W4A16 (pesos de 4 bits, activaciones de 16 bits) las capas lineales del bloque de texto, del módulo MTP nativo y del codificador visual, manteniendo en BF16 las proyecciones críticas (`embed_tokens`, `lm_head`, `mtp.fc`, `patch_embed.proj`, `linear_attn.in_proj_a/b`, normas y sesgos).

El interés técnico de esta ficha es doble. Por un lado, demuestra que es posible cuantizar a 4 bits un modelo multimodal de ~27B con pérdida de perplejidad prácticamente nula (incluso una mejora del −0,292 % frente a BF16 en el conjunto de validación `probe-v4`) y con una reducción de payload de 18,117 GiB a 17,334 GiB respecto a la cuantización GPTQ convencional `g128-h0`. Por otro, documenta con detalle el proceso de calibración, el recetario de cuantización y los parches necesarios en vLLM V1 (v0.31.0) para servir correctamente las capas visuales rotadas.

Al estar construido sobre Qwen3.8-27B, hereda las capacidades del modelo base: comprensión de imagen y texto, generación de código, razonamiento multi-paso y un modo de decodificación especulativa nativo (MTP). La ficha se centra en lo que la información disponible permite afirmar; cualquier dato no publicado se marca explícitamente como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión) con MTP nativo; módulo de atención lineal (`linear_attn`) presente en el bloque de texto |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | W4A16 (GPTQ con `group_size=64`, `actorder="static"`, Cholesky GPTQ + rotación Hadamard en línea `head_dim=64` para texto/MTP y `head_dim=16` para `visual.blocks.*.mlp.linear_fc2`); capas no cuantizadas en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `compressed-tensors`, transformers y vLLM) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización post-entrenamiento del modelo base Qwen/Qwen3.8-27B (commit `8c0b3d30f3ae96f5c7f774de704bf0ada83e422a`). La arquitectura subyacente es un transformer multimodal con codificador visual tipo ViT, un bloque de texto que incluye capas de atención lineal (`linear_attn.in_proj_a/b`) y un módulo MTP (Multi-Token Prediction) nativo que actúa como cabecera de decodificación especulativa. La cuantización cubre 517 capas lineales: 400 en el modelo de texto, 7 en el módulo MTP y 110 en el codificador visual.

El proceso de cuantización combina tres técnicas. Primero, una rotación Hadamard en bloque aplicada offline sobre la dimensión de entrada de cada matriz (`W' = W H_b / √b`, con `H_b` la matriz de Walsh-Hadamard de Sylvester determinista), que reduce outliers antes de cuantizar. Segundo, GPTQ con `group_size=64`, `actorder="static"` y factorización de Cholesky, sin emitir `weight_g_idx` porque las matrices se despermutan antes del empaquetado. Tercero, una transformación Hadamard en línea en tiempo de inferencia sobre las activaciones de entrada, que no requiere tensores adicionales almacenados (`randomize: false`, cero overhead de almacenamiento). La calibración de texto y MTP usó 999 muestras × 4096 tokens de `nvidia/Nemotron-Cascade-2-SFT-Data`; la de visión, 64 imágenes de ChartQA y TextVQA estrictamente disjuntas del conjunto de evaluación de 48 imágenes. Las capas `visual.blocks.*.mlp.linear_fc2` (K=4304) reciben un tratamiento especial: GPTQ por canal (`vision_fc2_channel`) más Hadamard en línea con `head_dim=16`.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredadas del modelo base Qwen3.8-27B.
- Comprensión de imagen y texto (`image-text-to-text`), con codificador visual cuantizado a W4A16 y fidelidad medida de 0,9940 de similitud coseno frente a BF16 en features del ViT.
- Respuesta a preguntas sobre gráficos y documentos visuales (evaluado en ChartQA y TextVQA durante la calibración).
- Decodificación especulativa nativa mediante MTP, con 96,22 % de acuerdo Top-1 aislado y 87,14 % end-to-end frente al MTP en BF16.
- Generación de código y matemáticas: capacidad heredada del modelo base, no verificada de forma independiente en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un modelo multimodal de ~27B en una sola GPU de 24 GB: el payload de 17,33 GiB en W4A16 permite cargar pesos y dejar margen para KV cache y activaciones en tarjetas como RTX 4090 o L40S, algo inviable con el modelo en BF16 (~54 GB).
- Análisis de documentos con gráficos: el codificador visual cuantizado conserva una similitud coseno de 0,9940 frente a BF16 y un 98,67 % de acierto en ChartQA en la evaluación del autor, lo que lo hace apto para extracción de datos de tablas e informes.
- Servicio de inferencia de alto rendimiento con vLLM V1: el checkpoint está empaquetado en `compressed-tensors` y se carga directamente en vLLM (con dos parches menores para las capas visuales), lo que permite aprovechar PagedAttention y batching continuo.
- Decodificación especulativa en producción: el módulo MTP cuantizado mantiene un 87,14 % de acuerdo Top-1 end-to-end, habilitando generación acelerada sin reentrenar la cabecera.
- Investigación en cuantización: el recetario reproducible (Cholesky GPTQ + Hadamard en línea, calibración congelada en `warp-3090-quant-lab-frozen-data`) sirve como referencia para cuantizar otros modelos multimodales con pérdida mínima.
- Evaluación comparativa de fidelidad: los conjuntos `probe-v4` y `probe-guard` y las métricas de KL por token permiten medir el impacto de distintas recetas de cuantización sobre el mismo modelo base.
- Fine-tuning ligero sobre la base cuantizada: al mantener en BF16 las proyecciones críticas y las normas, es posible adaptar el modelo con LoRA sobre las capas cuantizadas usando PEFT, aunque la información disponible no documenta este flujo.

## Benchmarks y rendimiento

Los datos publicados por el autor comparan esta cuantización con la variante `Qwen3.8-27B-W4A16-GPTQ` (`g128-h0`) y, en algunos casos, con el modelo en BF16. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Métrica | `g128-h0` | `HGPTQ-g64` (este repo) | Cambio |
|---|---:|---:|---:|
| Payload safetensors | 18,117 GiB | 17,334 GiB | −801,4 MiB (−4,3 %) |
| `probe-v4` weighted KL ↓ | 0,1369 | 0,115968 | −15,3 % |
| `probe-v4` KL medio por token / p99,9 ↓ | 0,357 / 24,66 | 0,301646 / 24,2052 | −15,5 % en media |
| `probe-v4` ΔPPL % vs BF16 (8,5438) ↓ | +1,00 % | −0,292 % (8,5189) | sin degradación de PPL |
| `probe-guard` KL medio / ΔPPL % (76 filas) ↓ | 0,0867 / −0,52 % | 0,063923 / −6,828 % | −26,3 % en KL medio |
| MTP aislado: KL / acuerdo Top-1 (12.339 pos) ↑ | BF16 en repo antiguo | 0,010930 / 96,22 % | shard MTP −521,4 MiB |
| MTP end-to-end: KL / acuerdo Top-1 ↑ | — | 0,213082 / 87,14 % | — |
| Visión: Rel-RMSE / similitud coseno (48 imágenes) | BF16 en repo antiguo | 0,1143 / 0,9940 | shard visión −605 MiB |
| Visión aislada: KL / acuerdo Top-1 (157 tokens) ↑ | — | 0,015734 / 97,45 % (153/157) | 98,67 % en ChartQA |

## Requisitos de hardware

- VRAM estimada para inferencia: el payload de pesos es de 17,33 GiB; con overhead de runtime, KV cache y activaciones, se recomienda un mínimo de 20-22 GB para contexto corto y 24 GB o más para contextos largos.
- GPU recomendadas: RTX 4090 (24 GB), L40S (48 GB), A100 40/80 GB, H100 80 GB. Para batching de gran tamaño o contextos muy largos, A100/H100 son la opción segura.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en GPUs de 24 GB similares; en tarjetas de 16 GB no cabe sin descarga parcial a CPU.
- Opciones de despliegue: vLLM V1 (v0.31.0) con soporte nativo de `compressed-tensors` para texto y MTP; las capas visuales requieren dos parches documentados en la model card. Transformers con `compressed-tensors` como alternativa. llama.cpp, Ollama y TGI no están documentados en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---:|---|---|---|
| **Qwen3.8-27B-W4A16-HGPTQ-g64** (este) | 27,36 B | no disponible | W4A16 + Hadamard | Apache 2.0 | Payload 17,33 GiB; PPL −0,292 % vs BF16 |
| Qwen3.8-27B-W4A16-GPTQ (`g128-h0`) | 27,36 B | no disponible | W4A16 GPTQ g128 | Apache 2.0 | Payload 18,12 GiB; PPL +1,00 % vs BF16 |
| Qwen/Qwen3.8-27B (BF16) | 27,36 B | no disponible | BF16 | Apache 2.0 | Referencia de fidelidad; ~54 GB de pesos |
| Otros modelos multimodales de ~27B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Modelo cuantizado a 4 bits: aunque la pérdida de perplejidad medida es nula o incluso negativa, la cuantización puede degradar tareas específicas no cubiertas por los conjuntos `probe-v4` y `probe-guard`.
- El módulo MTP end-to-end presenta un KL de 0,213 y un acuerdo Top-1 del 87,14 %, inferior al 96,22 % aislado; la decodificación especulativa puede introducir divergencias en generaciones largas.
- Las capas visuales requieren parches manuales en vLLM V1 (v0.31.0); sin ellos, la carga falla o produce resultados incorrectos en `model.visual.*`.
- La plantilla de chat incluida es la de `froggeric Qwen-Fixed-Chat-Templates (v22.5)`, no la oficial del modelo base; puede haber diferencias de comportamiento respecto a la plantilla original.
- No se han publicado evaluaciones de sesgo, toxicidad ni alucinación para esta cuantización concreta.
- Idiomas soportados y longitud de contexto no están documentados en la información disponible; deben consultarse en la model card del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la cuantización no ofrece garantías sobre la fidelidad en dominios no evaluados.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/nchapman/Qwen3.8-27B-W4A16-HGPTQ-g64
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de receta y tooling: https://github.com/nchapman/warp-3090-model-lab
- Dataset de calibración (congelado): https://huggingface.co/datasets/nchapman/warp-3090-quant-lab-frozen-data
- Dataset de calibración original: https://huggingface.co/datasets/nvidia/Nemotron-Cascade-2-SFT-Data
- Plantilla de chat: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
