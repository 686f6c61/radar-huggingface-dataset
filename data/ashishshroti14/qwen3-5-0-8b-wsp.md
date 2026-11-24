# ashishshroti14/Qwen3.5-0.8B-WSP

## Resumen

Qwen3.5-0.8B-WSP es una reparación quirúrgica del modelo denso Qwen/Qwen3.5-0.8B realizada mediante Weight-Space Programming (WSP), una técnica de edición de pesos sin gradientes. El autor, ashishshroti14, modifica únicamente 131.072 de los 852.985.920 parámetros del modelo base (un 0,0154%) para corregir una patología de bucles de razonamiento y repetición que aparece en decodificación greedy. No hay fine-tuning, ni backpropagation, ni RL: solo se alteran columnas concretas de dos capas del `mlp.down_proj`.

El modelo base pertenece a la familia Qwen 3.5, con arquitectura híbrida Gated DeltaNet + Full Attention y capacidades multimodales (pipeline image-text-to-text). El resultado reportado por el autor es un salto notable en tareas de razonamiento matemático e instrucciones: GSM8K pasa del 12,36% al 53,68%, MATH-500 del 6,20% al 28,00% e IFEval del 12,20% al 42,14% (prompt-strict), además de reducir drásticamente las truncaciones por longitud.

Su relevancia actual es doble: por un lado, demuestra que patologías de decodificación pueden mitigarse con ediciones mínimas y deterministas del espacio de pesos; por otro, ofrece un caso de estudio reproducible de interpretabilidad mecanicista aplicada a modelos híbridos modernos. La licencia Apache 2.0 y el tamaño reducido (873 millones de parámetros) lo hacen accesible para experimentación en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Gated DeltaNet + Full Attention (familia Qwen 3.5); multimodal image-text-to-text |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers/vLLM/llama.cpp, sin detalle publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers); artefactos adicionales `wsp_patch.pt` y `wsp_patch_summary.json` |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B es un transformer denso con arquitectura híbrida que combina capas Gated DeltaNet (atención lineal con estado recurrente) y capas de Full Attention, según la descripción del autor. Sobre ese modelo no se ha entrenado nada nuevo: la intervención WSP aplica una edición dirigida en el espacio de pesos, sin optimización por gradiente.

La técnica `col_steer_signed` consiste en un diagnóstico contrastivo del residual stream dentro del bloque `<think>` (comparando trayectorias con y sin bucle) para identificar direcciones de exceso (`z_excess`), y después un steering condicional de columnas del `mlp.down_proj` en las capas 15 y 19. Se modifican 64 columnas por capa (128 en total), con hiperparámetros `alpha=0.6`, `think_weight=1.2` y `vec_source=resid_loop_dir`. El autor incluye artefactos de reproducibilidad (`wsp_patch.pt`, `wsp_patch_summary.json`, `eval_results.json`) y cita como inspiración el trabajo de Takehi et al. (MIT CSAIL, noviembre de 2026), *Sparks of Weight-Space Programming*. No se detalla la composición del dataset de entrenamiento del modelo base ni si hubo RLHF/DPO.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso, con modo de pensamiento explícito (`<think>`) heredado del modelo base.
- Razonamiento matemático: mejoras sustanciales en GSM8K y MATH-500 tras el parche.
- Seguimiento de instrucciones con formato estricto (IFEval prompt-strict e inst-strict).
- Procesamiento multimodal image-text-to-text (pipeline declarado en la model card).
- Mitigación de bucles de repetición en decodificación greedy (`temperature=0`, `presence_penalty=0`), sin necesidad de penalizaciones en inferencia.
- Compatibilidad declarada con vLLM, transformers, SGLang y llama.cpp como reemplazo directo del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning más allá del modo thinking: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento matemático en producción educativa: el modelo puede resolver problemas de aritmética y álgebra de varios pasos con una tasa de acierto del 53,68% en GSM8K, adecuado para tutores automáticos o generación de ejercicios resueltos donde el modelo base fallaba sistemáticamente.
- Generación de cadenas de razonamiento sin truncamiento: con una tasa de cierre de `</think>` del 92,40% en MATH-500 (frente al 0,60% del base), es viable en pipelines que consumen la respuesta completa y no pueden permitirse salidas cortadas por longitud.
- Evaluación de instrucciones con formato estricto: útil para validar agentes que deben respetar restricciones de formato (JSON, listas, longitudes), dado el 48,20% en IFEval inst-strict.
- Investigación en interpretabilidad mecanicista: los artefactos `wsp_patch.pt` y `wsp_patch_summary.json` permiten reproducir el diagnóstico y estudiar cómo direcciones del residual stream condicionan el comportamiento de decodificación en arquitecturas híbridas.
- Despliegue en hardware de consumo: con 873 millones de parámetros y licencia Apache 2.0, sirve para prototipos locales de asistentes conversacionales con razonamiento ligero en GPUs de gama media.
- Reemplazo directo en pipelines existentes de Qwen3.5-0.8B: al ser drop-in en vLLM/SGLang/transformers, se puede sustituir el checkpoint base sin cambiar el código de inferencia y obtener las mejoras de razonamiento y menor latencia por menos tokens generados (2.981,7 frente a 4.089,1 de media en GSM8K).
- Experimentación con decodificación greedy determinista: entornos que requieren reproducibilidad exacta (`temperature=0`) pueden usar el modelo sin penalizaciones de repetición ni heurísticas adicionales.

## Benchmarks y rendimiento

Resultados reportados por el autor con decodificación greedy (`temp=0`, `presence_penalty=0.0`, `max_tokens=4096`):

| Benchmark | Split | Qwen3.5-0.8B (base) | Qwen3.5-0.8B-WSP | Delta |
|---|---|---|---|---|
| GSM8K | Test completo (n=1319) | 12,36% | 53,68% | +41,32 pts |
| MATH-500 | Test completo (n=500) | 6,20% | 28,00% | +21,80 pts |
| IFEval (prompt-strict) | Completo (n=541, zero-shot OOD) | 12,20% | 42,14% | +29,94 pts |
| IFEval (inst-strict) | Completo (n=541, zero-shot OOD) | 23,26% | 48,20% | +24,94 pts |

| Métrica de eficiencia | Base | WSP |
|---|---|---|
| Truncación GSM8K (`finish_reason=length`) | 99,77% | 30,33% |
| Tokens de salida medios en GSM8K | 4.089,1 | 2.981,7 |
| Truncación MATH-500 | 99,40% | 67,40% |
| Tasa de cierre `</think>` en MATH-500 | 0,60% | 92,40% |
| Truncación IFEval | 99,45% | 32,90% |

El autor indica que IFEval no se usó durante el diagnóstico ni la selección del parche, por lo que las ganancias son generalización out-of-distribution. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: en bfloat16, aproximadamente 1,75 GB solo para pesos (873 M parámetros); con overhead de activaciones y caché KV, entre 2,5 y 4 GB según longitud de contexto. En cuantización de 8 bits, en torno a 1 GB de pesos; en 4 bits, unos 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 con contexto moderado; RTX 3060/4060, RTX 4090, A100 y H100 son válidas. Para batching alto o contextos largos, se recomienda A100/H100.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y GPUs integradas con suficiente memoria unificada.
- Opciones de despliegue: vLLM, transformers, SGLang y llama.cpp, según declara el autor; también es compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles de forma explícita. La reducción de tokens medios en GSM8K (de 4.089 a 2.982) implica una mejora indirecta de throughput y latencia de extremo a extremo en tareas de razonamiento, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B-WSP | 873 M | no disponible | 53,68% | 28,00% | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 852,99 M (según card) | no disponible | 12,36% | 6,20% | Apache 2.0 | Hugging Face |
| Alternativas de ~1B con razonamiento | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada; la única comparación fiable es contra su propio modelo base.

## Limitaciones y advertencias

- Modelo con 0 descargas y 0 likes en el momento de la ficha: no ha pasado por validación independiente de la comunidad; los resultados son autoinformados por el autor.
- La model card cita un paper de noviembre de 2026 (Takehi et al., MIT CSAIL); conviene verificar su existencia y reproducibilidad antes de basar decisiones de producción en él.
- Aunque las truncaciones bajan mucho, siguen siendo altas: 67,40% en MATH-500 y 32,90% en IFEval. En esos casos la respuesta puede quedar incompleta.
- El parche se aplica solo a las capas 15 y 19 del `mlp.down_proj`; su efecto sobre otras capacidades del modelo base (multimodalidad, tool calling, multilingüismo) no está evaluado.
- Riesgo de alucinación: no cuantificado en la información disponible; el modelo base de 0,8 B tiene capacidad limitada de conocimiento factual.
- Sesgos: no documentados. Al no haber fine-tuning adicional, hereda los sesgos del modelo base Qwen3.5-0.8B, no analizados aquí.
- Idiomas soportados: no disponibles; el rendimiento fuera del inglés no está medido.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el mantenimiento del repositorio es incierto.
- La técnica WSP es específica de esta patología y este checkpoint; no se garantiza que generalice a otras variantes de la familia Qwen 3.5.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ashishshroti14/Qwen3.5-0.8B-WSP
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper citado (referencia del autor, no verificada): Takehi et al., *Sparks of Weight-Space Programming*, MIT CSAIL, noviembre de 2026 (sin URL en la información disponible)
- Artefactos de reproducibilidad en el repo: `wsp_patch.pt`, `wsp_patch_summary.json`, `eval_results.json`
