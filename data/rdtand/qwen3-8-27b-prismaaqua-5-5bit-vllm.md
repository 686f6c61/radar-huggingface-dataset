# rdtand/Qwen3.8-27B-PrismaAQUA-5.5bit-vllm

## Resumen

El modelo `rdtand/Qwen3.8-27B-PrismaAQUA-5.5bit-vllm` es una cuantización de precisión mixta del modelo Qwen/Qwen3.8-27B, desarrollada por rdtand mediante el método PrismaQuant AQUA-AURA. En lugar de aplicar un único formato de cuantización a toda la red, este método asigna individualmente a cada capa lineal el formato (NVFP4, FP8 o BF16) que mejor minimiza la divergencia KL end-to-end respecto al modelo original en BF16. El resultado es un checkpoint de 21,98 GiB en disco (5,5002 bits por parámetro sobre los 24,35 mil millones de parámetros cuantizables) que se sirve directamente con vLLM estándar, sin necesidad de kernels personalizados ni runtimes modificados.

El modelo conserva la arquitectura multimodal del base Qwen3.8-27B (image-text-to-text), incluyendo la torre visual, y mantiene en precisión completa elementos críticos como `lm_head`, `embed_tokens`, las cabezas de predicción multi-token y todos los norms y routers. La cuantización introduce un coste medido de +2,34% en perplexidad sobre WikiText-2 test (9,580 frente a 9,361 del BF16), con una divergencia KL media de 0,0338. La relevancia de este modelo radica en su enfoque de asignación de formatos por capa, que permite exprimir el presupuesto de bits donde más se necesita, y en su compatibilidad inmediata con el ecosistema vLLM, lo que facilita su adopción en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención completa y lineal (Qwen3.8-27B) |
| Parametros totales | 27B (modelo base); archivo safetensors reporta 19.073.004.272 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4, grupo 16), FP8 E4M3 (por canal), BF16 (passthrough) — mixta |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint Qwen/Qwen3.8-27B, no un entrenamiento desde cero. El método PrismaQuant AQUA-AURA evalúa la contribución de cada capa lineal a la divergencia KL end-to-end (usando el modelo BF16 como profesor) y asigna a cada una el formato que minimiza el impacto: NVFP4 (4 bits, W4A4, grupo 16), FP8 E4M3 (8 bits, por canal) o BF16 (sin cuantizar). De los 496 lineales del cuerpo del modelo, 247 reciben NVFP4 (mayoritariamente en las MLPs, donde se concentran los parámetros), 223 reciben FP8 (sobre todo en las proyecciones de salida de atención lineal y en las capas de atención completa) y 26 se mantienen en BF16 (las proyecciones `in_proj_a`/`in_proj_b` de las puertas de atención lineal). Un 29,1% de los bytes del archivo no entra en el proceso de asignación: `lm_head`, `embed_tokens`, la torre visual, las cabezas de predicción multi-token, los norms y los routers se conservan a precisión original. No se proporcionan datos sobre el entrenamiento del modelo base (tokens, dataset, RLHF, etc.).

## Capacidades

- Generación de texto, razonamiento y código, heredadas del modelo base Qwen3.8-27B (no detalladas en la model card).
- Entrada multimodal imagen-texto (pipeline `image-text-to-text`) gracias a la torre visual incluida.
- Conversación multi-turno (tag `conversational`).
- Compatible con vLLM en modo eager y con CUDA graphs, sin necesidad de kernels propietarios.
- No se mencionan capacidades de tool calling, function calling ni agentes en la información proporcionada.

## Casos de uso

- Despliegue de un asistente conversacional multimodal en producción: el modelo procesa imágenes y texto en un solo flujo, y su tamaño reducido (21,98 GiB) permite servirlo en GPUs de 24 GB con vLLM.
- Generación de descripciones de imágenes o análisis de documentos visuales en entornos con restricciones de memoria, donde un checkpoint BF16 de 27B no cabría.
- Sustitución de modelos cuantizados uniformes (p.ej. AWQ o GPTQ) cuando se requiere minimizar la pérdida de calidad en tareas sensibles a la divergencia de distribución, gracias a la asignación selectiva de bits.
- Integración en pipelines de inferencia ya basados en vLLM: el checkpoint es un `compressed-tensors` estándar, por lo que no requiere cambios en la infraestructura.
- Prototipado rápido de aplicaciones multimodales con un presupuesto de VRAM ajustado, manteniendo la fidelidad al modelo original en las capas críticas.
- Evaluación de metodologías de cuantización mixta: el repositorio incluye mapas de asignación de formatos y métricas detalladas (KL, PPL) que permiten comparar el impacto de distintas estrategias de compresión.

## Benchmarks y rendimiento

La model card reporta únicamente métricas de fidelidad de la cuantización, no benchmarks de tareas downstream. Los datos medidos son:

| Metrica | Valor |
|---|---|
| KL vs BF16 (todas las posiciones, n=8×512 → 4088 posiciones) | 0,0338 |
| KL vs BF16 (posiciones con top-1 del profesor > 0,5; 2067 posiciones) | 0,0187 |
| KL p99 / max | 0,2917 / 1,3292 |
| WikiText-2 test PPL (8176 tokens @ 512) — cuantizado | 9,580 |
| WikiText-2 test PPL — BF16 (mismo corpus) | 9,361 |
| Coste de cuantización | +2,34% PPL (+0,0231 nats/token) |
| Ship gate (PPL / p99 por-prompt NLL / coherencia) | PASS (4,030 / 1,947) |

No se han ejecutado suites de tareas downstream (MMLU, HumanEval, GSM8K, etc.), por lo que no hay datos de rendimiento en dichos benchmarks.

## Requisitos de hardware

- Tamaño del checkpoint: 21,98 GiB en disco (23,6 GB en el repositorio). Para inferencia se necesita VRAM suficiente para alojar los pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: RTX 3090/4090 (24 GB) pueden cargar el modelo en cuantización mixta; A100 40 GB o H100 ofrecen margen para lotes mayores.
- No se proporcionan datos de latencia ni throughput. Con vLLM en eager o CUDA graphs, el rendimiento dependerá del hardware y del tamaño de lote.
- Opciones de despliegue: vLLM (compatible directamente), Transformers (librería indicada), y cualquier runtime que soporte `compressed-tensors`.
- Dado que el modelo es multimodal, la torre visual añade requisitos adicionales de VRAM durante el procesamiento de imágenes.

## Comparativa con modelos similares

La información disponible no incluye comparaciones con otras cuantizaciones del mismo modelo. La única comparación directa es con el modelo base en BF16:

| Modelo | Tamano en disco | PPL WikiText-2 test | Coste de cuantizacion |
|---|---|---|---|
| Qwen3.8-27B (BF16) | ~54 GiB (estimado) | 9,361 | — |
| Qwen3.8-27B PrismaAQUA 5.5bit | 21,98 GiB | 9,580 | +2,34% |

No se dispone de datos para comparar con cuantizaciones uniformes (AWQ, GPTQ, FP8) del mismo modelo base.

## Limitaciones y advertencias

- No se han ejecutado benchmarks de tareas downstream; el impacto real en razonamiento, código o matemáticas es desconocido.
- La cola de la divergencia KL es pesada: el p99 es ~9 veces la media y el máximo ~39 veces, lo que indica que algunas posiciones pueden tener errores sustancialmente mayores.
- No se garantiza el comportamiento en las posiciones extremas de la distribución; la model card lo declara explícitamente.
- El coste de cuantización se mide solo en perplexidad y KL; no se ha evaluado la coherencia en tareas generativas largas ni en escenarios multimodales.
- Aunque la licencia es Apache 2.0, el modelo base Qwen3.8-27B puede tener sus propias restricciones de uso; se debe verificar la licencia del modelo original.
- Al ser una cuantización, existe una pérdida de calidad inherente respecto al BF16, especialmente en tareas que dependen de activaciones de baja probabilidad.
- No se reportan sesgos específicos del modelo cuantizado; los sesgos del modelo base Qwen3.8-27B se trasladan al checkpoint.

## Enlaces

- HuggingFace: https://huggingface.co/rdtand/Qwen3.8-27B-PrismaAQUA-5.5bit-vllm
- Sitio del método PrismaQuant: https://prismaquant.org
