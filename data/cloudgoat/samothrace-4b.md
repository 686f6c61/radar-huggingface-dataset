# CloudGoat/Samothrace-4B

## Resumen

Samothrace-4B es un modelo de investigación publicado por CloudGoat que parte de Qwen3.5-4B y le aplica una arquitectura de transformer con bucle (looped transformer) sobre las capas intermedias. En concreto, las capas 8 a 19 (tres bloques compuestos por 3 Gated DeltaNet más 1 atención completa) se ejecutan dos veces (K=2), mientras que las capas 0-7 y 20-31 se ejecutan una sola vez. La segunda pasada utiliza su propio adaptador LoRA (r=16) y una compuerta aprendida por canal inicializada a cero, de modo que con la compuerta a cero el modelo es bit-idéntico a Qwen3.5-4B y el bucle solo aprende cuánto de la segunda pasada mezclar.

El repositorio contiene únicamente la parte entrenable: 11,4 millones de parámetros en fp32 (adaptador LoRA y compuerta). Los pesos base se descargan desde Qwen/Qwen3.5-4B en tiempo de carga. El modelo se ha ajustado con SFT sobre 10 millones de tokens repartidos entre matemáticas, código y uso de agentes, con destilación de rechazo de Qwen3-235B-Thinking para matemáticas.

Su relevancia es doble: por un lado, explora el paradigma de profundidad recurrente como alternativa barata a aumentar parámetros; por otro, publica resultados preliminares que muestran mejoras sustanciales en MATH-500 (de 23,6% a 42,4%) con menos tokens generados y un coste de decodificación de solo 1,4 veces el del modelo base. Es una publicación de investigación, sin tuning de seguridad adicional y con benchmarks sobre subconjuntos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucle (looped transformer, recurrent-depth) sobre Qwen3.5-4B; capas 8-19 ejecutadas K=2 con LoRA por paso y compuerta por canal |
| Parametros totales | 4B base (Qwen3.5-4B) + 11,4M entrenables (LoRA r=16 + compuerta) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3.5-4B; no especificada en la model card) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en fp32; los pesos base, en el formato de Qwen3.5-4B) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`samothrace_k2_adapter.safetensors`) + `samothrace_config.json`; requiere descarga de Qwen/Qwen3.5-4B |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido con atención completa y Gated DeltaNet (atención lineal) intercaladas, heredada de Qwen3.5-4B. Sobre esa base, Samothrace introduce profundidad recurrente: las capas 8-19, que constituyen tres bloques de 3 Gated DeltaNet más 1 atención completa cada uno, se ejecutan dos veces. La segunda pasada aplica su propio LoRA (r=16) y una compuerta aprendida por canal de dimensión 2560, con la actualización `h ← h + a ⊙ (Core(h; W + ΔW₂) − h)` y `a` inicializada a cero. Esto garantiza que el modelo arranca exactamente desde el modelo preentrenado y aprende solo la mezcla de la segunda pasada. La decodificación cuesta aproximadamente 1,4 veces un forward plano de Qwen3.5-4B (equivalente a 44 de 32 capas de cómputo) y añade slots propios de KV y estado recurrente para la segunda pasada.

El entrenamiento es SFT sobre 10,0 millones de tokens (3.418 muestras, hasta 6.144 tokens cada una): 3,0M de matemáticas (destilación de rechazo de DAPO-Math con Qwen3-235B-A22B-Thinking-2507), 3,5M de código (Qwen3.5-27B-DeepCoder-SFT y hardtests Qwen3.5-27B) y 3,5M de agentes (Nemotron-SFT-Agentic-v2, con tool calling multi-paso e interacción). El valor de K se muestrea por muestra (K=2 en el 35% y K=3 en el 65%), con una KL de consistencia de atajo `KL(p_K3 ‖ p_K2)` sobre el 20% de las muestras con K=3. Se usó AdamW con lr 2e-4 para el LoRA y 3e-3 para la compuerta, schedule coseno, fp16 con loss scaling, y se entrenó en 7,5 horas sobre 2× T4 de Kaggle con DDP, atención por chunks de query y checkpointing de activaciones por capa, sin ningún OOM. La media final de |a| fue 0,092. Las pérdidas held-out de la distribución SFT (K=1 / K=2 / K=3) fueron: matemáticas 0,297 / 0,248 / 0,246; código DeepCoder 0,390 / 0,299 / 0,292; código hardtests 0,883 / 0,676 / 0,657; tool calling de agente 0,704 / 0,581 / 0,574; agente interactivo 0,671 / 0,469 / 0,460.

## Capacidades

- Generación de texto con modo de razonamiento (thinking mode) heredado de Qwen3.5-4B.
- Razonamiento matemático: entrenado con destilación de rechazo de un modelo de 235B en modo thinking.
- Generación de código: ajustado sobre SFT de DeepCoder y hardtests de Qwen3.5-27B.
- Tool calling y function calling multi-paso: entrenado con Nemotron-SFT-Agentic-v2.
- Agentes interactivos: soporte de razonamiento multi-paso e interacción con herramientas.
- Capacidades multilingües: no disponibles en la información proporcionada (no se documentan idiomas).
- Visión y audio: no disponibles (el pipeline es text-generation y la model card no menciona multimodalidad).
- Profundidad de cómputo configurable: el modelo soporta K=1, K=2 y K=3, aunque solo se libera el ajuste K=2.

## Casos de uso

- Razonamiento matemático asistido: el modelo puede resolver problemas de competición (MATH-500) con un presupuesto de thinking de 2.048 tokens y forzado de presupuesto; su mejora de 23,6% a 42,4% en el subconjunto evaluado lo hace útil para prototipos de tutores o verificadores matemáticos, aunque con cautela por el tamaño reducido de la muestra.
- Generación de código en pipelines de CI/CD: con 87,2% de pass@1 en HumanEval y tool calling entrenado, puede integrarse en tareas de autocompletado, generación de tests o reparación de código dentro de flujos automatizados.
- Agentes con herramientas: el SFT sobre Nemotron-SFT-Agentic-v2 le permite gestionar llamadas a funciones encadenadas y razonamiento multi-paso, adecuado para asistentes que consultan APIs o bases de datos.
- Investigación sobre profundidad recurrente: sirve como banco de pruebas para estudiar el efecto del bucle en transformers, ya que con la compuerta a cero reproduce exactamente Qwen3.5-4B y permite aislar la contribución del bucle.
- Despliegue en hardware modesto: al ser un modelo de 4B con solo 11,4M de parámetros entrenables adicionales, puede ejecutarse en GPUs de consumo y en entornos con recursos limitados (el entrenamiento se hizo en 2× T4).
- Evaluación comparativa de técnicas de eficiencia: su coste de 1,4× por token frente al base y la reducción de tokens generados (de 2.347 a 1.980 en MATH-500 y de 1.166 a 518 en HumanEval) lo hacen útil para estudiar trade-offs entre cómputo y calidad.
- Fine-tuning ligero sobre tareas específicas: al distribuirse como adaptador LoRA más compuerta sobre un base conocido, es sencillo adaptarlo a dominios concretos sin reentrenar el modelo completo.

## Benchmarks y rendimiento

| Benchmark | K=1 (base Qwen3.5-4B) | K=2 (Samothrace-4B) | K=3 |
|---|---|---|---|
| MATH-500 (n=144) | 23,6% | 42,4% | 39,6% |
| HumanEval (n=164, pass@1) | 85,4% | 87,2% | 86,0% |
| Tokens generados medios, MATH-500 | 2.347 | 1.980 | 2.011 |
| Tokens generados medios, HumanEval | 1.166 | 518 | 553 |

Condiciones: decodificación greedy, thinking mode, presupuesto de 2.048 tokens de thinking con forzado de presupuesto y hasta 384 tokens de respuesta. MATH-500 es un subconjunto aleatorio de 144 problemas; HumanEval está completo. El autor advierte que la comparación K=1→K=2 mezcla el efecto del SFT (thinking más corto y menos truncado) con el del bucle, y que no se ha ejecutado un control LoRA sin bucle con el mismo presupuesto. El tope de 2.048 tokens trunca la mayoría de soluciones de MATH-500, por lo que los números absolutos quedan por debajo de los de Qwen3.5-4B con presupuesto completo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al ser un modelo de 4B más 11,4M de parámetros en fp32, la huella es similar a la de Qwen3.5-4B más los slots adicionales de KV y estado recurrente de la segunda pasada.
- GPU recomendadas: no especificadas; el entrenamiento se realizó en 2× T4 (16 GB cada una) con DDP, lo que sugiere que la inferencia cabe en GPUs de 16 GB.
- GPU de consumo: probablemente cabe en RTX 4090 (24 GB) y en GPUs de 16 GB, aunque el dato no se confirma en la información disponible.
- Opciones de despliegue: se proporciona `samothrace_inference.py` con un loader y decodificación simple; requiere `transformers` con soporte de Qwen3.5 y se recomienda `flash-linear-attention` en GPU. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la decodificación cuesta aproximadamente 1,4× un forward plano de Qwen3.5-4B por token (44 de 32 capas de cómputo), más los slots adicionales de caché de la segunda pasada. No se publican cifras de latencia absoluta ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Samothrace-4B (K=2) | 4B + 11,4M | No disponible | 42,4% (n=144) | 87,2% | Apache 2.0 | Hugging Face |
| Qwen3.5-4B (K=1) | 4B | No disponible | 23,6% (n=144) | 85,4% | No disponible en la información | Hugging Face |
| Qwen3.5-4B (K=3) | 4B + 11,4M | No disponible | 39,6% (n=144) | 86,0% | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de otras alternativas comparables en la información proporcionada, por lo que la comparativa se limita a las variantes K del propio modelo y a su base.

## Limitaciones y advertencias

- Publicación de investigación: no incluye tuning de seguridad más allá del modelo base, por lo que puede generar contenido inapropiado o inseguro.
- Sesgos conocidos: no documentados en la model card; hereda los del base Qwen3.5-4B.
- Riesgo de alucinación: no evaluado; el modelo está entrenado para razonar en modo thinking, pero no se han publicado métricas de fidelidad factual.
- Benchmarks sobre subconjuntos pequeños: MATH-500 con solo 144 problemas y sin números en AIME, LiveCodeBench ni BFCL; los resultados deben interpretarse con cautela.
- Presupuesto de thinking truncado: el tope de 2.048 tokens trunca la mayoría de soluciones de MATH-500, lo que deprime los números absolutos.
- Confusión en la comparación K=1→K=2: el autor reconoce que la mejora mezcla el efecto del SFT con el del bucle y que falta un control LoRA sin bucle.
- Etapa de RL (GRPO) no aplicada: el modelo es solo SFT, sin refinamiento por refuerzo.
- Idiomas no documentados: no se especifica qué lenguas soporta más allá de lo que herede del base.
- Contexto no especificado: no se indica la longitud máxima de contexto efectiva.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B debe verificarse por separado (su licencia no se detalla en la información disponible).
- Coste de decodificación: 1,4× por token frente al base, con slots adicionales de caché, lo que puede afectar al throughput en producción.

## Enlaces

- Hugging Face: https://huggingface.co/CloudGoat/Samothrace-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de matemáticas: https://huggingface.co/datasets/Yang-Zhou/DAPO-Math-17k-Qwen3-235B-A22B-Thinking-2507-rejection-distill
- Dataset de código DeepCoder: https://huggingface.co/datasets/zake7749/Qwen3.5-27B-DeepCoder-SFT
- Dataset de hardtests: https://huggingface.co/datasets/ZhuofengLi/hardtests-sft-qwen3.5-27b
- Dataset de agentes: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Agentic-v2
- Imagen de benchmarks: https://huggingface.co/CloudGoat/Samothrace-4B/blob/main/samothrace_benchmarks.png
