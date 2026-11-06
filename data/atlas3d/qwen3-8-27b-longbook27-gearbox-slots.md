# Atlas3D/Qwen3.8-27B-Longbook27-gearbox-slots

## Resumen

Atlas3D/Qwen3.8-27B-Longbook27-gearbox-slots es un conjunto de pesos auxiliares, no un modelo autónomo. Contiene 16 mezcladores de tokens Gated DeltaNet reentrenados, uno por cada capa de atención completa (capas 3, 7, 11, ..., 63) del modelo base Qwen/Qwen3.8-27B. Estos mezcladores se cargan junto a la atención original del modelo base en un mecanismo de "caja de cambios" (gearbox) en tiempo de ejecución que decide, por capa, si se usa la atención estándar de Qwen (estado A) o el mezclador DeltaNet (estado D).

El interés técnico reside en la conmutación dinámica entre dos mecanismos de mezcla de tokens entrenados de forma independiente, manteniendo el estado recurrente caliente. El engranaje 0 (todas las capas en atención Qwen) es bit-idéntico al Qwen3.8-27B original, mientras que el engranaje 16 (todas las capas en DeltaNet) más un LoRA de etapa B aproxima el modelo Longbook publicado por summerAIO. La propuesta es permitir degradar selectivamente la atención completa a atención lineal para reducir coste de prefill y memoria KV, conservando calidad en engranajes bajos.

El modelo deriva del trabajo Longbook de summerAIO, que sustituye la atención completa por Gated DeltaNet en 16 capas, y del Qwen3.8-27B de Qwen como base. La contribución de Atlas3D es el reentrenamiento de los mezcladores (etapas v2 y v3) y el mecanismo de conmutación en tiempo de ejecución. El repositorio ocupa 7,4 GB y se distribuye bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: transformer Qwen3.8-27B con Gated DeltaNet inyectado en 16 capas de atención completa (3, 7, 11, ..., 63); los pesos distribuidos son solo los mezcladores DeltaNet |
| Parámetros totales | no disponible (el repo contiene 16 mezcladores; el modelo base Qwen3.8-27B no se incluye) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 8k tokens en entrenamiento de los mezcladores; el modelo base soporta contexto mayor, valor exacto no disponible |
| Tipos de cuantización | los pesos se publican en bf16; el autor menciona que su base de trabajo es NVFP4/FP8 dequantizado, pero no se distribuyen cuantizaciones GGUF/AWQ/GPTQ |
| Idiomas soportados | en, ja (según la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16), 9 tensores por capa × 16 capas |

## Arquitectura y entrenamiento

Los pesos distribuidos son 16 módulos Gated DeltaNet que siguen el esquema de nombres del módulo `Qwen3_5GatedDeltaNet` del modelo base: `layers.N.linear_attn.{A_log, dt_bias, conv1d.weight, in_proj_qkv.weight, in_proj_z.weight, in_proj_a.weight, in_proj_b.weight, norm.weight, out_proj.weight}`. Cada mezclador sustituye la atención completa de su capa cuando el gearbox lo selecciona. El mecanismo de conmutación mantiene ambos mixers cargados por capa y elige uno en tiempo de ejecución; el descenso de engranaje (A a D) es instantáneo porque el estado recurrente de DeltaNet se mantiene caliente en cada token, mientras que el ascenso (D a A) requiere modo suave (la atención sigue escribiendo K/V) o duro (descartar el KV de la capa y re-prefill).

El entrenamiento es una destilación por capa: cada mezclador D se ajusta hacia la salida de atención del modelo base sin modificar sobre la misma entrada normalizada, con pérdida `nmse + 0.1·cos` (la pérdida de etapa A de Longbook) y secuencias de 8k tokens. La etapa v2 parte de los mezcladores originales de Longbook y entrena 1000 pasos; v3 añade 2000 pasos desde v2 con un schedule coseno nuevo a la mitad del pico de learning rate de v2 (lr 1e-4, warmup 30, semilla 1102, 8k constante). El corpus son 26M tokens públicos: UltraChat-200k, OASST2, OpenR1-Math-220k, NVIDIA OpenCodeReasoning y Wikipedia en/ja (excluyendo artículos de evaluación). No se entrenó ningún LoRA; el LoRA de etapa B rank-32 de Longbook es obra de summerAIO y no se incluye.

## Capacidades

- Conmutación por capa entre atención completa y atención lineal DeltaNet en tiempo de ejecución, con 17 engranajes posibles (k = 0 a 16 capas en D).
- Engranaje 0 bit-idéntico al Qwen3.8-27B original, verificado con smoke test en CPU (`test_gearbox.py`).
- Destilación de atención: los mezcladores v3 alcanzan coseno 0.82 frente a la atención del modelo base en chat retenido no visto durante el entrenamiento.
- Retención de agujas (needles) en contexto largo: 18/18 passkeys exactos hasta 64k con los engranajes k1 y k2, con y sin LoRA.
- Capacidades heredadas del modelo base Qwen3.8-27B (generación de texto, razonamiento, código, matemáticas) cuando el gearbox opera en engranajes bajos; no se documentan capacidades específicas adicionales en la model card.
- Soporte de tool calling, agentes y razonamiento multi-paso: no documentado en la información disponible (depende del modelo base, no verificado aquí).
- Capacidades multilingües limitadas a en y ja según la model card.

## Casos de uso

- Investigación sobre atención lineal frente a atención completa: el gearbox permite medir el impacto de sustituir k capas de atención por DeltaNet sobre la misma base, con una escalera de engranajes predefinida y métricas de KL y needles ya publicadas.
- Reducción de coste de prefill en contextos largos: con k=1 o k=2 se mantiene 18/18 needles hasta 64k, lo que permite recortar el coste de las capas sustituidas sin degradar la recuperación de información en ese rango.
- Despliegue con presupuesto de memoria KV ajustado: las capas en D no mantienen caché KV de atención completa, de modo que engranajes bajos reducen la memoria de estado en inferencia larga.
- Evaluación de destilación de mecanismos de atención: los ficheros `val.jsonl` ofrecen NMSE y coseno por paso, fuente y capa, útiles para reproducir o comparar recetas de destilación de mixers.
- Reconstrucción y estudio del modelo Longbook: el engranaje 16 más el LoRA de etapa B de summerAIO aproxima Longbook tal como se publicó, lo que permite analizar su comportamiento con y sin LoRA.
- Experimentación con conmutación en caliente: el descenso A→D instantáneo y el ascenso D→A suave o duro permiten probar políticas de enrutamiento por capa en producción sin recargar el modelo.

## Benchmarks y rendimiento

Mediciones de la escalera E-LB1 (prefill a engranaje fijo). KL promediada sobre 3 conversaciones de chat de 32k tokens. Needles: 18 passkeys exactos a 4k, 16k y 64k.

| Capas en D (k) | 0 | 1 | 2 | 4 | 8 | 12 | 16 |
|---|---|---|---|---|---|---|---|
| KL a engranaje 0, LoRA off | 0 | 0,114 | 0,183 | 0,398 | 1,057 | 1,225 | 1,501 |
| KL a engranaje 0, LoRA on | 0,161 | 0,196 | 0,266 | 0,379 | 0,808 | 1,101 | 1,607 |
| Needles /18, LoRA off | 18 | 18 | 18 | 17 | 0 | 0 | 0 |
| Needles /18, LoRA on | 18 | 18 | 18 | 18 | 0 | 0 | 0 |

Resultados adicionales reportados por el autor:

| Métrica | Longbook original | v2 (1000 pasos) | v3 (2000 pasos adicionales) |
|---|---|---|---|
| Coseno por capa a atención (chat retenido) | 0,42 | 0,79 | 0,82 (última fila de validación, paso 2000) |

- La escalera parcial de v2 reduce la KL al engranaje 0 un 32 % en chat, un 24 % en código y un 39 % en Wikipedia. El engranaje 4 de esa escalera usa las capas más baratas (L55, L59, L39, L51); el engranaje 6 no se ejecutó.
- El engranaje 16 con LoRA (reconstrucción de Longbook) da KL 1,61 y 0/18 needles en chat, fallando ya a 4k; el informe de Longbook da KL 0,207 medido sobre Wikipedia.
- Advertencia del autor: la base es NVFP4/FP8 dequantizada y el LoRA es una reconstrucción por SVD truncada rank-32 de la etapa B, con 98,4-99,9 % de energía por tensor; no es una réplica bit-exacta del checkpoint bf16.

## Requisitos de hardware

- VRAM para los pesos distribuidos: los dos ficheros `slots.safetensors` suman 3,71 GB cada uno en bf16; cargar ambos (v2 y v3) requiere unos 7,4 GB adicionales sobre el modelo base.
- El modelo base Qwen3.8-27B no se incluye en el repo; su VRAM de inferencia depende de la cuantización elegida y no está documentada en la información disponible.
- GPU recomendadas: no disponible en la información proporcionada. El smoke test del engranaje 0 se ejecutó en CPU.
- ¿Cabe en GPU de consumo? No disponible; depende del modelo base y de la cuantización.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El autor referencia scripts de carga y entrenamiento con hashes en `recipe_hashes.json` y un test `test_gearbox.py`, pero no se especifica el runtime.
- Latencia y throughput: no disponible. El descenso A→D es instantáneo por mantener el estado recurrente caliente; el ascenso D→A duro exige re-prefill de la capa.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas3D/Qwen3.8-27B-Longbook27-gearbox-slots | Mezcladores DeltaNet auxiliares sobre Qwen3.8-27B | 16 mixers (3,71 GB por fichero) | 8k en entrenamiento de mixers | Apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| summerAIO/Qwen3.8-27B-Longbook27-v2 | Modelo Longbook completo con DeltaNet en 16 capas | no disponible | no disponible | Apache-2.0 | Hugging Face (repo de summerAIO) |
| Qwen/Qwen3.8-27B | Transformer con atención completa | 27B (según nombre) | no disponible | Apache-2.0 | Hugging Face |

La comparación de rendimiento entre estas tres variantes está parcialmente cubierta por las métricas de la sección anterior: coseno a atención de 0,42 (Longbook) frente a 0,79 (v2) y 0,82 (v3); KL a engranaje 0 de 0 a 1,501 según k; y needles de 18/18 a 0/18 según k. No se dispone de comparativas con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el Qwen3.8-27B base y, para aproximar Longbook, el LoRA de etapa B de summerAIO, que no se incluye.
- El engranaje 16 (todas las capas en D) falla en chat: KL 1,61 y 0/18 needles, con fallo ya a 4k. El engranaje 8 pierde todos los needles.
- El engranaje 4 es el límite práctico: 17/18 needles sin LoRA y 18/18 con LoRA, pero la KL sube a 0,398-0,379.
- La base de trabajo del autor es NVFP4/FP8 dequantizada y el LoRA es una reconstrucción SVD truncada rank-32, no una réplica bit-exacta del checkpoint bf16 de Longbook.
- v3 no tenía marcador DONE en el momento de redactar la model card; la verificación de exportación estaba pendiente.
- Idiomas limitados a en y ja; no se documenta soporte de castellano ni de otros idiomas.
- Contexto de entrenamiento de los mixers limitado a 8k tokens; el comportamiento más allá de 64k no está medido.
- Riesgo de alucinación y sesgos: no documentados específicamente; heredados del modelo base y de los corpus de destilación (UltraChat, OASST2, OpenR1-Math, OpenCodeReasoning, Wikipedia).
- Licencia Apache-2.0 permite uso comercial, pero al ser pesos derivados de Longbook y Qwen3.8-27B conviene verificar la atribución y las condiciones de los repositorios de origen.
- Sin descargas ni likes en el momento de la consulta; sin validación externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Atlas3D/Qwen3.8-27B-Longbook27-gearbox-slots
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Longbook de summerAIO: https://huggingface.co/summerAIO/Qwen3.8-27B-Longbook27-v2
- Ficheros de receta y validación citados en el repo: `recipe_hashes.json`, `train_v2/val.jsonl`, `train_v3/val.jsonl`, `SHA256SUMS`, `LONGBOOK-SHARE.md`, `LIT-REVIEW.md`, `test_gearbox.py` (dentro del repositorio de Hugging Face)
- Papers, blogs, repos o demos adicionales: no disponible en la información proporcionada.
