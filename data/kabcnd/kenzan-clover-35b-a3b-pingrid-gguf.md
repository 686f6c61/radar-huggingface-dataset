# kabcnd/Kenzan-Clover-35B-A3B-PinGrid-GGUF

## Resumen

Kenzan-Clover-35B-A3B-PinGrid-GGUF es una cuantización GGUF del modelo Diffuspace/Clover-35B-A3B-Preview, un transformer híbrido de tipo Mixture-of-Experts (MoE) con 34.660 millones de parámetros totales y aproximadamente 3.000 millones activos por token. Combina capas de atención lineal recurrente GatedDeltaNet (30 capas) con atención completa cada cuarta capa (10 capas), e incorpora 256 expertos enrutados con top-8 más un experto compartido por capa. El autor de la cuantización es el usuario kabcnd, que la publica bajo licencia Apache 2.0.

La aportación principal de esta release no es el modelo base, sino el trabajo de cuantización: una receta denominada Pin-Grid que asigna precisión de forma no uniforme (desde IQ2_XXS hasta Q8_0) según la sensibilidad medida de cada tensor, con el objetivo de que un modelo de ~35B quepa en los 16 GB de memoria unificada de un Mac mini M6. El resultado es un fichero de 10,99 GiB a 2,72 bits por peso, con correcciones críticas sobre el export original (inversión de signo en los tensores `ssm_a` y eliminación de 120 tensores muertos) para que cargue directamente en `llama.cpp` PR #31306.

Es relevante ahora porque demuestra que un MoE de 35B con atención híbrida puede ejecutarse a velocidades interactivas (~60 t/s de generación) en hardware de consumo Apple Silicon de gama baja, algo que hasta hace poco requería GPUs de datacenter. No obstante, depende de un runtime específico (`llama-clover` / PR #31306) y de un formato de pesos concreto, lo que limita su portabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE: GatedDeltaNet (atención lineal recurrente) en 30 capas + Full Attention cada 4ª capa (blk.3, 7, 11, 15, 19, 23, 27, 31, 35, 39); 40 capas totales |
| Parametros totales | 34.660.610.688 (34,66B) |
| Parametros activos | ~3B (256 expertos enrutados, top-8, + 1 experto compartido por capa) |
| Longitud de contexto | No disponible en la información proporcionada (los benchmarks usan `-c 2048` y `-c 4096`, pero no se especifica el máximo nativo) |
| Tipos de cuantizacion | Mezcla Pin-Grid: IQ2_XXS (expertos enrutados base), IQ3_XXS (cola MoE blk.32–38), Q4_0, Q5_K, Q6_K, Q8_0 según tensor; 2,72 bpw efectivos |
| Idiomas soportados | Inglés (en), ruso (ru), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero único `Kenzan-Clover-35B-A3B-PinGrid-IQ2_XXS-M6-16G.gguf`, 10,99 GiB) |

## Arquitectura y entrenamiento

El modelo base Clover-35B-A3B-Preview es un transformer híbrido que alterna capas de GatedDeltaNet (atención lineal recurrente con estado, del tipo SSM/linear attention) con capas de atención completa cada cuatro bloques. Cada capa incorpora un bloque MoE con 256 expertos enrutados (top-8) y un experto compartido, lo que da lugar a un ratio de activación muy bajo (~3B de 34,66B). La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; tampoco se especifican innovaciones como decodificación especulativa. El vocabulario es de 248.320 entradas.

El trabajo de esta release se centra en la cuantización. El autor analizó una importance matrix de 1,25M tokens (`Clover-VAL-1.25M-I-Matrix.gguf`) y detectó un salto de sensibilidad L2 de 4.400× en `ffn_down_exps` entre la capa 0 (7,01e6) y la capa 39 (3,10e10), con picos en las fronteras de atención completa. La receta Pin-Grid asigna Q8_0 a las puertas `ssm_alpha`/`ssm_beta`, Q6_K a `attn_k`/`attn_v` y a la salida, Q5_K a embeddings y a la capa 39 de `ffn_down_exps`, IQ3_XXS a la cola MoE (blk.32–38) e IQ2_XXS al resto de expertos. Además, se corrigen dos defectos del export upstream: los 30 tensores `blk.*.ssm_a` se convierten de `A_log` crudo a `-exp(A_log)` (el export original contenía valores positivos hasta +4,65 que provocaban desbordamiento `exp(gate)` y colapso `NaN`/`@@@@`), y se eliminan 120 tensores no usados (`ssm_bd_history.*`, `ssm_bd_logit_scale.*`, `ssm_conv1d.weight_right`), pasando de 853 a 733 tensores. Se añade `clover_moe.expert_shared_count = 1` en la cabecera GGUF para que cargue sin `--override-kv`.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, ruso y chino.
- Razonamiento y generación de código (se reporta throughput de chat en pruebas con Python).
- Soporte de arquitectura MoE con enrutamiento top-8 sobre 256 expertos, lo que permite alta capacidad paramétrica con bajo coste de cómputo por token.
- Capacidad de contexto extendido gracias a las capas GatedDeltaNet, aunque el máximo nativo no se documenta.
- Compatibilidad con `llama-server` y endpoints compatibles (tag `endpoints_compatible`), lo que habilita su uso tras una API HTTP.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.
- No se documenta modo "thinking" ni capacidades multimodales.

## Casos de uso

- Asistente conversacional local en Mac: desplegado con `llama-server -c 4096 -fa on -ctk q4_0 -ctv q4_0`, el modelo sostiene conversaciones multi-turno a ~60 t/s en un Mac mini M6 de 16 GB, adecuado para prototipos de asistentes privados sin conexión.
- Generación de código en estación de trabajo: con throughput medido en pruebas con Python, sirve para autocompletado y generación de scripts en un entorno de desarrollo local sin GPU dedicada.
- Procesamiento de documentación multilingüe: al cubrir en/ru/zh, puede emplearse para resumir o traducir documentación técnica entre esos tres idiomas en pipelines por lotes.
- Experimentación con arquitecturas híbridas SSM/atención: investigadores pueden estudiar el comportamiento de GatedDeltaNet frente a atención completa en un modelo de 35B con recursos de consumo.
- Evaluación de técnicas de cuantización extrema: la receta Pin-Grid y la importance matrix de 1,25M tokens sirven como referencia para estudiar cómo afecta la asignación no uniforme de bits a la perplejidad (10,70 en el holdout).
- Chatbot de soporte en entornos con restricciones de hardware: al caber en 16 GB de memoria unificada, permite desplegar un asistente en equipos Apple Silicon de gama baja sin infraestructura cloud.
- Reproducción de benchmarks de inferencia: útil para validar builds de `llama.cpp` con soporte `clover_moe` y medir `pp512`/`tg128` en distintos equipos.

## Benchmarks y rendimiento

Resultados verificados por el autor en Apple Mac mini M6 (16 GB memoria unificada) con `llama.cpp` PR #31306 (`commit ed26f2f`, Metal 4):

| Métrica | Configuración | Resultado |
|---|---|---|
| Tamaño de fichero | `Kenzan-Clover-35B-A3B-PinGrid-IQ2_XXS-M6-16G.gguf` | 10,99 GiB (11.254,74 MiB, 2,72 BPW) |
| Prompt processing (`pp512`) | `llama-bench -p 512 -fa 1 -ctk q4_0 -ctv q4_0 -ngl 99` | 1220,98 ± 5,89 t/s |
| Generación (`tg128`) | `llama-bench -n 128 -fa 1 -ctk q4_0 -ctv q4_0 -ngl 99` | 59,82 ± 0,57 t/s |
| Perplejidad (`wt2_holdout_128k`) | `llama-perplexity --chunks 14 -c 2048 -fa on -ctk q4_0 -ctv q4_0` | 10,6969 ± 0,24881 |
| Throughput de chat (ru y Python) | `llama-server -c 4096 -fa on -ctk q4_0 -ctv q4_0` | 60,62–60,68 t/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 10,99 GiB para el fichero GGUF; con caché KV en q4_0 y contexto de 4096, el working set de Metal debe quedar por debajo del límite de 15.032,39 MB del M6 de 16 GB (el autor confirma que cabe).
- GPU recomendadas: Apple Silicon con Metal 4 (M6 de 16 GB verificado); no se documentan pruebas en NVIDIA/AMD.
- Cabe en GPU de consumo: sí, en Mac mini M6 de 16 GB de memoria unificada; en GPUs discretas no hay datos publicados.
- Opciones de despliegue: `llama.cpp` PR #31306 (`ed26f2f` o superior) compilado con `-DGGML_METAL=ON`; `llama-server` para API HTTP. No se documenta compatibilidad con vLLM, TGI, Ollama ni llama.cpp mainline sin el PR.
- Latencia y throughput: 1220,98 t/s de prompt processing y 59,82 t/s de generación en M6; 60,62–60,68 t/s en chat real.
- Requiere runtime específico `llama-clover` (Metal 4); sin él el modelo no carga correctamente.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kenzan-Clover-35B-A3B-PinGrid (este) | 34,66B / ~3B | No disponible | Apache 2.0 | GGUF (2,72 bpw) | Híbrido GatedDeltaNet + atención; runtime PR #31306; 60 t/s en M6 16 GB |
| Diffuspace/Clover-35B-A3B-Preview (base) | 34,66B / ~3B | No disponible | Apache 2.0 | Safetensors (precisión completa) | Modelo original sin cuantizar; requiere mucho más que 16 GB |
| Alternativas de ~30-35B MoE | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información sobre otros modelos de la misma categoría con datos verificables en la documentación aportada.

## Limitaciones y advertencias

- Dependencia de un runtime no mainline: requiere `llama.cpp` PR #31306 (`ed26f2f` o superior) con soporte `clover_moe`; no funciona con builds estándar ni con otros motores (vLLM, TGI, Ollama).
- Cuantización extrema: 2,72 bpw con IQ2_XXS en la mayoría de expertos implica pérdida de calidad respecto al modelo base; la perplejidad de 10,70 en el holdout debe interpretarse en ese contexto.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad factual; al ser un modelo base "Preview", es esperable un comportamiento variable.
- Idiomas limitados a en/ru/zh; no se documenta soporte de castellano, lo que limita su uso en producción en español.
- Sesgos: no se documentan análisis de sesgo ni composición del dataset de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base es un "Preview" y el autor no ofrece garantías; conviene validar el comportamiento antes de producción.
- El modelo depende de correcciones manuales (signo de `ssm_a`, eliminación de tensores); cualquier reexportación desde el base sin esas correcciones reproducirá el colapso `NaN`/`@@@@`.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad.
- El autor solicita donaciones para adquirir hardware de pruebas; el soporte y mantenimiento del repo no están garantizados.

## Enlaces

- Hugging Face: https://huggingface.co/kabcnd/Kenzan-Clover-35B-A3B-PinGrid-GGUF
- Modelo base: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- PR de llama.cpp con soporte `clover_moe`: https://github.com/ggml-org/llama.cpp/pull/31306
- Ko-fi del autor: https://ko-fi.com/kabcpc
