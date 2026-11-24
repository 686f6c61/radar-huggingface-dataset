# ashishshroti14/Qwen3.5-9B-WSP

## Resumen

Qwen3.5-9B-WSP es un ajuste quirúrgico del modelo denso Qwen/Qwen3.5-9B publicado por el usuario ashishshroti14, que aplica una técnica denominada Weight-Space Programming (WSP). El objetivo declarado es corregir la patología de bucles de razonamiento y repetición que el modelo base presenta en decodificación greedy, modificando únicamente 524.288 de los 9.409.813.744 parámetros del modelo (un 0,0056 % del total). No se emplea retropropagación, ni fine-tuning, ni aprendizaje por refuerzo: la edición se realiza directamente sobre los pesos.

El modelo conserva la arquitectura del base, un transformer híbrido de la familia Qwen 3.5 que combina capas Gated DeltaNet con capas de atención completa, y mantiene el pipeline image-text-to-text, por lo que hereda capacidades multimodales de entrada. El número real de parámetros reportado en los safetensors es de 9.653.104.368, y el repositorio ocupa 19,3 GB en formato safetensors.

La relevancia de esta ficha es doble: por un lado, demuestra una intervención de interpretabilidad mecanicista de coste mínimo que produce mejoras notables en benchmarks de razonamiento (hasta +30 puntos en AIME 2024+2025 con el muestreo oficial de Qwen); por otro, ilustra un enfoque reproducible de reparación de modelos sin reentrenamiento, con artefactos de parche exportados y evaluación completa publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido denso (Gated DeltaNet + atención completa), familia Qwen 3.5 |
| Parametros totales | 9.653.104.368 (9,65 B); el autor reporta 9.409.813.744 en la comparación de edición |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el autor menciona compatibilidad con llama.cpp) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer denso con una arquitectura híbrida que intercala capas Gated DeltaNet (atención lineal con estado recurrente) y capas de atención completa. Sobre esa arquitectura, el autor aplica un método llamado `col_steer_think`, descrito como un diagnóstico contrastivo del residual stream dentro del bloque `<think>` sin gradientes, seguido de un steering condicional por columnas en la matriz `mlp.down_proj` de las capas 23 y 27. Se modifican 64 columnas por capa, seleccionadas mediante una puntuación `z_diff`, con hiperparámetros `alpha=2.0`, `think_weight=1.0` y `vec_source=resid_loop_dir`.

No hay entrenamiento ni ajuste supervisado: la intervención se limita a 524.288 parámetros (0,0056 % del total) y se inspira en el trabajo de Takehi et al. (MIT CSAIL, noviembre de 2026), «Sparks of Weight-Space Programming», extendido a la familia densa Qwen 3.5. El autor incluye artefactos de reproducibilidad: `wsp_patch.pt` con las direcciones extraídas y las puntuaciones por columna, `wsp_patch_summary.json` y `eval_results.json` con las métricas en bruto. No se especifican datos de entrenamiento adicionales, composición del dataset ni fases de RLHF o DPO, porque no las hay: el proceso es exclusivamente de edición de pesos.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo thinking (`<think>...</think>`) y modo no-thinking (`enable_thinking=False`).
- Razonamiento matemático: mejoras sustanciales en GSM8K, MATH-500 y AIME frente al base.
- Razonamiento científico de nivel doctorado (GPQA Diamond) y multidisciplinar (MMLU-Pro, 14 dominios).
- Seguimiento de instrucciones estrictas (IFEval prompt-strict e instruction-strict).
- Generación de código en Python (HumanEval pass@1), aunque con una ligera pérdida frente al base.
- Entrada multimodal image-text-to-text, heredada del pipeline del modelo base.
- Compatibilidad con tool calling y function calling: no documentada explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modo thinking y la mitigación de bucles favorecen cadenas largas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Mitigación de bucles: reduce la tasa de truncamiento por longitud y aumenta la tasa de cierre de `</think>`.

## Casos de uso

- Razonamiento matemático en producción: el modelo resuelve problemas de competición y de nivel escolar con una tasa de truncamiento del 4,40 % en GSM8K frente al 41,24 % del base, lo que lo hace adecuado para pipelines que necesitan respuestas completas sin reintentos por longitud.
- Tutoría y evaluación automática de matemáticas: con un 89,76 % en GSM8K y un 64,00 % en MATH-500 en decodificación greedy, puede emplearse para generar soluciones paso a paso y verificar respuestas de estudiantes con menor coste de tokens (1.313 tokens de media frente a 2.567 del base).
- Razonamiento científico asistido: un 49,49 % en GPQA Diamond en modo greedy lo sitúa como candidato para responder preguntas de nivel posgrado en dominios STEM, con la advertencia de que sigue siendo un modelo de 9 B y no sustituye a un experto.
- Agentes con cadenas de razonamiento largas: la reducción del 58,41 % al 27,91 % en truncamiento de IFEval y la mejora del cierre de `</think>` (del 32,40 % al 86,20 % en MATH-500) lo hacen más fiable en flujos multi-paso donde el modelo debe terminar su razonamiento y emitir una respuesta final.
- Seguimiento estricto de instrucciones en aplicaciones de atención al cliente o generación de informes: las ganancias de +20 puntos en IFEval (prompt-strict e instruction-strict) en evaluación zero-shot fuera de distribución indican mejor adherencia a formatos y restricciones explícitas.
- Despliegue como reemplazo directo del base: al ser compatible con vLLM, transformers, SGLang y llama.cpp, puede sustituir a Qwen3.5-9B en infraestructuras existentes sin cambios de código, obteniendo menores tiempos de generación (hasta 1,75x más rápido en MATH-500 con muestreo oficial).
- Investigación en interpretabilidad mecanicista: los artefactos `wsp_patch.pt` y `wsp_patch_summary.json` permiten reproducir y auditar la edición de pesos, útil para estudiar cómo pequeñas intervenciones en `mlp.down_proj` alteran el comportamiento de razonamiento.

## Benchmarks y rendimiento

Evaluación completa con decodificación greedy (`temp=0`, `presence_penalty=0.0`, `max_tokens=4096`):

| Benchmark | Split | Base Qwen3.5-9B | Qwen3.5-9B-WSP | Delta |
|---|---|---|---|---|
| GSM8K | Test completo (n=1319) | 69,75 % | 89,76 % | +20,01 pts |
| MATH-500 | Test completo (n=500) | 41,20 % | 64,00 % | +22,80 pts |
| IFEval prompt-strict | Completo (n=541, zero-shot OOD) | 49,54 % | 69,69 % | +20,15 pts |
| IFEval instruction-strict | Completo (n=541, zero-shot OOD) | 54,20 % | 74,34 % | +20,14 pts |

Impacto en eficiencia y mitigación de bucles:

| Métrica | Base | WSP |
|---|---|---|
| Truncamiento GSM8K (`finish_reason=length`) | 41,24 % | 4,40 % |
| Tokens de salida medios en GSM8K | 2.567,0 | 1.313,1 |
| Truncamiento MATH-500 | 71,60 % | 32,40 % |
| Tasa de cierre de `</think>` en MATH-500 | 32,40 % | 86,20 % |
| Truncamiento IFEval | 58,41 % | 27,91 % |

Fase 2, pruebas de estrés con muestreo oficial de Qwen (`temperature=0.6, top_p=0.95, top_k=20, presence_penalty=1.5`) y modo no-thinking:

| Benchmark | Decodificación / modo | Base | WSP | Delta | Tokens medios (base -> WSP) |
|---|---|---|---|---|---|
| MATH-500 (n=500) | Muestreo oficial Qwen (8k) | 67,20 % | 81,60 % | +14,40 pts | 5.144 -> 2.936 (1,75x más rápido) |
| AIME 2024+2025 (n=60) | Muestreo oficial Qwen (8k) | 8,33 % (5/60) | 38,33 % (23/60) | +30,00 pts (4,6x) | 8.089 -> 6.393 (100 % cerrado) |
| AIME 2024+2025 (n=60) | Greedy (8k) | 8,33 % (5/60) | 31,67 % (19/60) | +23,34 pts (3,8x) | 8.061 -> 7.068 |
| GPQA Diamond (n=198) | Greedy (8k, 100 % OOD) | 45,45 % | 49,49 % | +4,04 pts | 7.990 -> 6.025 |
| MMLU-Pro (n=420) | Thinking, greedy (4k, 100 % OOD) | 62,14 % | 67,62 % | +5,48 pts | 3.702 -> 2.423 (1,53x más rápido) |
| MMLU-Pro (n=420) | Non-thinking | 32,38 % | 33,81 % | +1,43 pts | 477 -> 476 |
| HumanEval (n=164, pass@1) | Greedy (4k, 100 % OOD) | 90,85 % | 87,20 % | -3,65 pts | 949 -> 939 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,65 B de parámetros, en bfloat16 se requieren aproximadamente 19,3 GB solo para los pesos, más overhead de caché KV y activaciones; en cuantización de 8 bits, alrededor de 10-11 GB; en 4 bits, alrededor de 6-7 GB. Estas cifras son estimaciones por tamaño y no están publicadas en la información disponible.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16; GPUs consumer de 12-16 GB para cuantizaciones de 4-8 bits.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) con bfloat16 ajustado o cuantización, y en RTX 3090/4080 con cuantización de 4-8 bits.
- Opciones de despliegue: vLLM, transformers, SGLang y llama.cpp, según el autor; también es compatible con endpoints.
- Latencia y throughput: no se publican valores absolutos de latencia o tokens por segundo; sí se reportan reducciones relativas de tokens generados (25 %-49 % menos) y aceleraciones de hasta 1,75x en MATH-500 con muestreo oficial.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-9B-WSP | 9,65 B | No disponible | 89,76 % (greedy) | 64,00 % (greedy) / 81,60 % (muestreo oficial) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | 9,65 B | No disponible | 69,75 % (greedy) | 41,20 % (greedy) / 67,20 % (muestreo oficial) | Apache 2.0 | Hugging Face |
| Alternativas de ~9 B | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita al modelo base porque la información proporcionada no incluye datos de otros modelos de tamaño similar (por ejemplo, Llama, Gemma o Mistral en la franja de 8-10 B). No se han publicado resultados de benchmarks de esos modelos en la información disponible.

## Limitaciones y advertencias

- Regresión en código: en HumanEval se observa una pérdida de 3,65 puntos (del 90,85 % al 87,20 %) con `alpha=2.0`, atribuida por el autor a que el base ya cierra `</think>` en el 97 % de los prompts cortos de código; conviene evaluar el modelo en la tarea concreta antes de sustituir el base en pipelines de generación de código.
- Sesgos conocidos: no documentados en la información disponible; al heredar los pesos del base, es razonable esperar los sesgos del modelo original, pero no hay evaluación publicada al respecto.
- Riesgo de alucinación: no evaluado en la información disponible; las mejoras en benchmarks de razonamiento no implican una reducción de alucinaciones en conocimiento factual.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Qwen3.5-9B y de los datos con los que fue entrenado.
- Madurez del artefacto: el repositorio tiene 0 descargas y 1 like en el momento de la consulta, y fue creado y actualizado el mismo día (24 de noviembre de 2026); se trata de una publicación muy reciente y sin validación comunitaria independiente.
- Dependencia de hiperparámetros: los resultados reportados corresponden a `alpha=2.0`, `think_weight=1.0` y capas [23, 27]; no se documenta la sensibilidad a otros valores ni la robustez frente a prompts fuera de las distribuciones evaluadas.
- Modo no-thinking: las ganancias son mínimas (+1,43 pts en MMLU-Pro) y los 64 neuronas editadas permanecen latentes, según el autor; no se debe esperar mejora en ese modo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ashishshroti14/Qwen3.5-9B-WSP
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper de referencia citado por el autor: Takehi et al., «Sparks of Weight-Space Programming», MIT CSAIL, noviembre de 2026 (no se proporciona URL en la información disponible)
- Artefactos de reproducibilidad incluidos en el repositorio: `wsp_patch.pt`, `wsp_patch_summary.json`, `eval_results.json`, `eval_harder_results.json`
- Repositorios, demos o blogs adicionales: no disponibles en la información proporcionada
