# CloudGoat/Samothrace-4B-Preview

## Resumen

Samothrace-4B-Preview es un modelo de investigación publicado por CloudGoat que parte de Qwen/Qwen3.5-4B y le aplica una modificación arquitectónica de tipo looped transformer con profundidad recurrente: las capas 8 a 19 (tres bloques de 3× Gated DeltaNet más 1× atención completa) se ejecutan dos veces (K=2), mientras que las capas 0-7 y 20-31 se ejecutan una sola vez. El modelo no redistribuye pesos: el repositorio contiene únicamente la parte entrenable (11,4 M de parámetros en fp32), consistente en un adaptador LoRA de rango 16 para la segunda pasada y una compuerta aprendida por canal de 2560 dimensiones inicializada a cero, de modo que con la compuerta a cero el modelo es bit a bit idéntico al Qwen3.5-4B original.

El problema que aborda es el de aumentar la capacidad de razonamiento de un modelo pequeño sin incrementar el número de parámetros almacenados, reutilizando cómputo en las capas intermedias. El entrenamiento es un SFT de 10,0 M de tokens sobre mezclas de matemáticas, código y uso de agentes con tool calling, con un presupuesto de pensamiento corto (2048 tokens) y budget forcing. Los resultados publicados muestran una mejora notable en MATH-500 (23,6% en K=1 frente a 42,4% en K=2) y una reducción del número medio de tokens generados en HumanEval (1166 frente a 518), aunque el propio autor advierte que la comparación K=1 frente a K=2 mezcla el efecto del SFT con el del bucle y que no existe todavía un control LoRA sin bucle.

Es relevante ahora porque explora una vía poco frecuente en modelos abiertos de 4B: la recurrencia en profundidad como alternativa al escalado de parámetros, combinada con capas híbridas Gated DeltaNet y atención completa. La licencia Apache 2.0 y el formato de adaptador ligero facilitan su reproducción, aunque se trata de un lanzamiento de investigación sin afinado de seguridad ni etapa de RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer con profundidad recurrente sobre Qwen3.5-4B; capas 8-19 (3 bloques de 3× Gated DeltaNet + 1× atención completa) ejecutadas K=2 veces; capas 0-7 y 20-31 una vez |
| Parametros totales | 4B (pesos base de Qwen/Qwen3.5-4B) + 11,4M entrenables (LoRA r=16 y compuerta por canal de 2560 dimensiones) |
| Parametros activos | No aplica (no es MoE); el bucle añade cómputo equivalente a 44 de 32 capas por token |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen3.5-4B) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el adaptador se publica en fp32 |
| Idiomas soportados | No disponible en la informacion proporcionada (heredados del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`samothrace_k2_adapter.safetensors`) más pesos base descargados de Qwen/Qwen3.5-4B; requiere `modeling_samothrace.py`, `samothrace_inference.py` y `samothrace_config.json` |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido con capas de atención lineal Gated DeltaNet intercaladas con atención completa, sobre el que se aplica un esquema de bucle en profundidad. Las capas 8 a 19 se ejecutan dos veces; la segunda pasada utiliza su propio LoRA (r=16) y una compuerta aprendida por canal `a ∈ R^2560` inicializada a cero, con la actualización `h ← h + a ⊙ (Core(h; W + ΔW₂) − h)`. Esta inicialización garantiza que el modelo arranca exactamente desde el modelo preentrenado y solo aprende cuánto de la segunda pasada mezclar; la media final de |a| tras el entrenamiento es 0,092. El bucle requiere ranuras propias de caché KV y de estado recurrente para la segunda pasada, y el coste de decodificación es aproximadamente 1,4× el de un forward plano de Qwen3.5-4B.

El entrenamiento es un SFT de 10,0 M de tokens sobre 3418 muestras de hasta 6144 tokens: 3,0 M de matemáticas (destilación por rechazo de DAPO-Math con Qwen3-235B-A22B-Thinking), 3,5 M de código (Qwen3.5-27B DeepCoder SFT y hardtests Qwen3.5-27B) y 3,5 M de agentes (Nemotron-SFT-Agentic-v2, con tool calling multi-paso y agente interactivo). El valor de K se muestrea por muestra (K=2 en el 35%, K=3 en el 65%) y en el 20% de las muestras con K=3 se aplica una KL de consistencia de atajo `KL(p_K3 ‖ p_K2)`. Se usó AdamW con lr 2e-4 para el LoRA y 3e-3 para la compuerta, schedule coseno, fp16 con loss scaling, atención con chunking de queries y checkpointing de activaciones por capa; 7,5 horas en 2× T4 de Kaggle con DDP y cero saltos por OOM. Las pérdidas de validación en la distribución SFT (K=1 / K=2 / K=3) fueron: matemáticas 0,297 / 0,248 / 0,246; código DeepCoder 0,390 / 0,299 / 0,292; código hardtests 0,883 / 0,676 / 0,657; agentes tool-calling 0,704 / 0,581 / 0,574; agente interactivo 0,671 / 0,469 / 0,460.

## Capacidades

- Generación de texto y razonamiento matemático en modo thinking, con budget forcing sobre un presupuesto de 2048 tokens de pensamiento y hasta 384 tokens de respuesta.
- Generación de código, evaluada en HumanEval con pass@1.
- Tool calling y function calling multi-paso, entrenado con Nemotron-SFT-Agentic-v2.
- Comportamiento de agente interactivo (interactive agent) según la mezcla de datos de entrenamiento.
- Capacidad de razonamiento con profundidad recurrente ajustable en inferencia mediante el parámetro K (K=1 equivale al base, K=2 es la configuración publicada, K=3 fue entrenada pero no supera a K=2).
- Capacidades multilingües: no disponible en la informacion proporcionada (dependen del modelo base Qwen3.5-4B).
- No se documentan capacidades de visión ni de audio.

## Casos de uso

- Razonamiento matemático con presupuesto acotado: el modelo puede resolver problemas tipo MATH-500 con un límite de 2048 tokens de pensamiento y budget forcing, lo que lo hace adecuado para entornos donde el coste por consulta está restringido y no se puede permitir una cadena de pensamiento larga.
- Generación de código en pipelines de evaluación: con 87,2% de pass@1 en HumanEval y una media de 518 tokens generados por problema, encaja en flujos de autocompletado o generación de funciones donde la latencia y el número de tokens importan.
- Agentes con tool calling multi-paso: el SFT sobre Nemotron-SFT-Agentic-v2 le permite encadenar llamadas a herramientas en tareas interactivas, útil para asistentes que consultan APIs o ejecutan acciones sobre sistemas.
- Investigación sobre recurrencia en profundidad: sirve como banco de pruebas reproducible (Apache 2.0, adaptador de 11,4 M) para estudiar el efecto del bucle K frente a controles LoRA sin bucle en el mismo presupuesto de cómputo.
- Destilación y ajuste fino sobre un modelo de 4B: al mantener los pesos base de Qwen3.5-4B y publicar solo el adaptador, se puede reutilizar la infraestructura existente del base y sustituir el adaptador para experimentar con otras mezclas de datos.
- Despliegue en hardware modesto para prototipos: el entrenamiento se completó en 2× T4, lo que indica que el modelo es viable en GPUs de gama media para inferencia de prototipos, con el coste adicional de 1,4× por el bucle.
- Evaluación comparativa de estrategias de pensamiento: la posibilidad de alternar K=1, K=2 y K=3 en el mismo checkpoint permite medir el compromiso entre precisión y tokens generados sin cambiar de modelo.

## Benchmarks y rendimiento

| Benchmark | K=1 (= Qwen3.5-4B base) | K=2 (Samothrace-4B-Preview) | K=3 |
|---|---|---|---|
| MATH-500 (n=144) | 23,6% | 42,4% | 39,6% |
| HumanEval (n=164, pass@1) | 85,4% | 87,2% | 86,0% |
| Tokens medios generados, MATH-500 | 2347 | 1980 | 2011 |
| Tokens medios generados, HumanEval | 1166 | 518 | 553 |

Condiciones: decodificación greedy, modo thinking, presupuesto de 2048 tokens de pensamiento con budget forcing y hasta 384 tokens de respuesta, los mismos problemas para cada K. MATH-500 es un subconjunto aleatorio de 144 problemas; HumanEval está completo. El autor advierte que la comparación K=1 frente a K=2 mezcla el efecto del SFT (pensamiento más corto y menos truncado) con el del bucle, que no se ha ejecutado un control LoRA sin bucle con el mismo presupuesto, y que el límite de 2048 tokens trunca la mayoría de soluciones de MATH-500, por lo que los valores absolutos quedan por debajo de los de Qwen3.5-4B con presupuesto completo. No hay resultados de AIME, LiveCodeBench ni BFCL.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, los pesos base son de 4B parámetros y el adaptador añade 11,4 M en fp32; el bucle requiere ranuras adicionales de caché KV y de estado recurrente para la segunda pasada.
- GPU recomendadas: no disponible en la informacion proporcionada. El entrenamiento se realizó en 2× T4 (16 GB cada una) con DDP, fp16, chunking de queries y checkpointing de activaciones, lo que sugiere que la inferencia es viable en GPUs de gama media.
- ¿Cabe en GPU consumer? No confirmado explícitamente; el uso de T4 en entrenamiento apunta a que sí en configuraciones con suficiente VRAM, pero no se publican cifras de inferencia.
- Opciones de despliegue: el modelo requiere `transformers` con soporte de Qwen3.5 y los ficheros `modeling_samothrace.py` y `samothrace_inference.py`; se recomienda `flash-linear-attention` en GPU. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la decodificación cuesta aproximadamente 1,4× un forward plano de Qwen3.5-4B por token (equivalente a 44 de 32 capas de cómputo). No se publican cifras de latencia absoluta ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MATH-500 | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Samothrace-4B-Preview (K=2) | 4B + 11,4M adaptador | No disponible | 42,4% (n=144, 2048 tokens de pensamiento) | 87,2% pass@1 | Apache 2.0 | Hugging Face, adaptador + base |
| Qwen/Qwen3.5-4B (K=1) | 4B | No disponible | 23,6% (mismas condiciones) | 85,4% pass@1 | No disponible en la informacion proporcionada | Hugging Face |
| Qwen3.5-27B DeepCoder SFT (fuente de datos) | 27B | No disponible | No disponible | No disponible | No disponible | Usado solo como dataset de destilación |
| Qwen3-235B-A22B-Thinking (fuente de datos) | 235B totales, 22B activos (MoE) | No disponible | No disponible | No disponible | No disponible | Usado solo como dataset de destilación |

La comparativa directa con alternativas de la misma categoría (modelos de 4B con razonamiento) no está disponible en la información proporcionada; los dos modelos de Qwen listados aparecen únicamente como fuente de datos de entrenamiento o como base, no como resultados medidos en las mismas condiciones.

## Limitaciones y advertencias

- Lanzamiento de investigación: no tiene afinado de seguridad más allá del modelo base.
- Evaluado en subconjuntos pequeños y con un presupuesto de pensamiento corto (2048 tokens); no hay resultados de AIME, LiveCodeBench ni BFCL.
- La etapa de RL (GRPO) no se ha aplicado.
- La comparación K=1 frente a K=2 no aísla el efecto del bucle del efecto del SFT; falta un control LoRA sin bucle con el mismo presupuesto.
- El límite de 2048 tokens trunca la mayoría de soluciones de MATH-500, por lo que los números absolutos no son comparables con evaluaciones de presupuesto completo.
- K=3 se entrenó pero no superó a K=2; la configuración publicada es K=2.
- Riesgo de alucinación: no cuantificado en la información proporcionada; al ser un modelo de 4B con SFT sobre datos destilados, es esperable un riesgo no despreciable en dominios fuera de la distribución de entrenamiento.
- Sesgos conocidos: no documentados en la información proporcionada; hereda los del modelo base Qwen3.5-4B.
- Limitaciones de contexto e idioma: no documentadas; dependen del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.5-4B debe verificarse por separado, ya que sus términos no se detallan en la información proporcionada.
- Caveat de producción: el modelo requiere código de modelado personalizado (`modeling_samothrace.py`) y no se documenta compatibilidad con servidores de inferencia estándar, lo que complica el despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, coherente con que solo contiene el adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/CloudGoat/Samothrace-4B-Preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de matemáticas: https://huggingface.co/datasets/Yang-Zhou/DAPO-Math-17k-Qwen3-235B-A22B-Thinking-2507-rejection-distill
- Dataset de código: https://huggingface.co/datasets/zake7749/Qwen3.5-27B-DeepCoder-SFT
- Dataset de código (hardtests): https://huggingface.co/datasets/ZhuofengLi/hardtests-sft-qwen3.5-27b
- Dataset de agentes: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Agentic-v2
- Imagen de benchmarks: samothrace_benchmarks.png (incluida en el repositorio de Hugging Face)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
