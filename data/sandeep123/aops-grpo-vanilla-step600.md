# sandeep123/aops-grpo-vanilla-step600

## Resumen

`sandeep123/aops-grpo-vanilla-step600` es un modelo de razonamiento matemático de 1.777 millones de parámetros (1,78B) obtenido mediante fine-tuning con GRPO (Group Relative Policy Optimization) sobre el modelo base `Qwen/Qwen2.5-Math-1.5B`. El entrenamiento se realizó sobre un subconjunto de problemas de olimpiadas matemáticas del dataset NuminaMath-1.5 (subset AoPS), y la validación se llevó a cabo sobre el benchmark ScienceQA, donde se reportan métricas de pass@1 y pass@6. El modelo está pensado como un baseline "vanilla" de GRPO para investigación en RL, sin técnicas adicionales como KL adaptativo, entropía controlada o clipping asimétrico.

Este checkpoint concreto corresponde al paso 600 de un entrenamiento planificado de 1250 pasos, y fue seleccionado como el mejor en validación pass@1 dentro de su brazo experimental (rank 2). El autor publica también un checkpoint hermano (`sqa-grpo-vanilla-step600`) para comparar la selección por pass@6. La relevancia actual del modelo reside en su utilidad como referencia reproducible para experimentos de RL con GRPO, especialmente para estudiar el efecto de la temperatura de rollout, el coeficiente de entropía y el clipping simétrico en modelos pequeños de razonamiento matemático.

Una característica crítica documentada por el autor es que el modelo fue entrenado con texto prompt crudo, sin aplicar el chat template de Qwen2.5-Math. Aplicar dicho template en inferencia produce una degradación de aproximadamente 19 puntos de pass@1 en una tarea hermana. Por tanto, el uso correcto requiere pasar directamente el texto sin formato a la API de generación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-Math-1.5B (transformer decoder-only, herencia de Qwen2.5) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1536 tokens (512 prompt + 1024 respuesta, configuracion de entrenamiento) |
| Tipos de cuantizacion | no disponible (repo en safetensors BF16, cuantificable con GPTQ/AWQ/GGUF) |
| Idiomas soportados | no disponible (herencia de Qwen2.5-Math, no especificado por el autor) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `Qwen2.5-Math-1.5B`, un transformer decoder-only con atención causal, embeddings rotatorios (RoPE), y mecanismos de atención estándar. No incorpora ninguna modificación arquitectónica propia; el interés del modelo reside en el método de entrenamiento. Se aplicó GRPO (Group Relative Policy Optimization) con una política de rollout de temperatura 1.0, coeficiente de entropía 0.0, clip PPO simétrico 0.2/0.2 y un coeficiente KL in-reward de 0.01. El dataset de entrenamiento fue el subconjunto AoPS de NuminaMath-1.5 (problemas de olimpiadas), mientras que la validación se realizó sobre ScienceQA (`scienceqa_boxfix`). El entrenamiento se ejecutó con 128 prompts por batch, K=6 rollouts por prompt, learning rate constante de 1e-6, y un total de 1250 pasos (25 épocas). Se aplicó una reward de formato de 0.03 constante para respuestas con formato `\boxed{}`. El checkpoint publicado corresponde al paso 600.

El autor enfatiza que no se aplicó chat template durante el entrenamiento (`apply_chat_template=False` en verl), por lo que la inferencia debe hacerse con texto plano. La extracción de respuestas se define como el contenido del último `\boxed{}`, o en su defecto el último token A-E; respuestas sin formato extraíble se consideran incorrectas.

## Capacidades

- Razonamiento matemático de nivel olimpiada: genera soluciones paso a paso y respuestas finales en formato `\boxed{}`.
- Respuestas de opción múltiple: produce tokens A-E coherentes con el formato de ScienceQA.
- Razonamiento multi-step: el entrenamiento con GRPO fomenta cadenas de razonamiento más largas y autoconsistentes.
- Generación autoregresiva estándar: soporta decodificación con temperatura, top-p y top-k (recomendado temperatura 1.0).
- No soporta tool calling, function calling, ni capacidades multimodales (visión, audio).
- No incluye modo "thinking" explícito más allá del razonamiento generado en la respuesta.

## Casos de uso

- Investigación en RLHF/RL: sirve como baseline reproducible para comparar variantes de GRPO (temperatura, KL, clipping) en modelos pequeños de razonamiento. Su configuración está completamente documentada en la model card.
- Evaluación de razonamiento matemático: útil para medir la capacidad de resolver problemas de opción múltiple estilo ScienceQA, con métricas pre-registradas de pass@1 y pass@6.
- Generación de soluciones explicadas: puede producir respuestas razonadas paso a paso para problemas de olimpiadas, útil en entornos educativos o de tutoría automática.
- Análisis de sensibilidad a la temperatura: al estar entrenado con rollout a temperatura 1.0, permite estudiar cómo varía la calidad de las respuestas al cambiar la temperatura de decodificación.
- Comparación de checkpoints intermedios: el modelo publica pasos 200-500, 600 y 1000-1200 (según el autor), lo que permite estudiar la dinámica de entrenamiento y la selección de checkpoints por pass@1 vs pass@6.
- Pruebas de extracción de respuestas: su formato `\boxed{}` y la regla de extracción pre-registrada lo convierten en un caso de estudio para pipelines de parsing de respuestas matemáticas.

## Benchmarks y rendimiento

El autor reporta métricas de validación en ScienceQA con 256 prompts held-out, K=6 rollouts, temperatura 1.0 y seed 42:

| Metrica | Valor |
|---|---|
| pass@1 | 0.2344 |
| pass@6 | 0.4102 |
| paso de entrenamiento | 600 |

No se han publicado resultados en otros benchmarks (MMLU, GSM8K, HumanEval) en la informacion disponible. El autor menciona que aplicar el chat template degrada el pass@1 en aproximadamente 19 puntos en una tarea hermana, lo que indica sensibilidad al formato de entrada.

## Requisitos de hardware

- VRAM estimada: ~3,5 GB en BF16 (pesos) + overhead de activaciones y KV cache, lo que permite inferencia en GPUs consumer con 8 GB o más.
- GPUs recomendadas: RTX 3060 (12 GB), RTX 4070, A10, A100 (para despliegue con mayor batch).
- Cabe en consumer GPU de gama media; con cuantización 4-bit (GPTQ/AWQ) puede ejecutarse en 6 GB de VRAM.
- Opciones de despliegue: vLLM (recomendado por el autor en el ejemplo de código), llama.cpp, Ollama, TGI, o directamente con transformers.
- Latencia estimada: no disponible, pero al ser un modelo de 1,78B, se espera throughput alto en GPUs modernas (decenas de tokens/segundo en consumer).
- Importante: no usar `llm.chat()` en vLLM; usar `llm.generate()` con texto plano.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | pass@1 (ScienceQA) | Licencia |
|---|---|---|---|---|---|
| `aops-grpo-vanilla-step600` (este) | 1,78B | 1536 | GRPO vanilla sobre Qwen2.5-Math | 0.2344 | Apache-2.0 |
| `sandeep123/sqa-grpo-vanilla-step600` | 1,78B | 1536 | GRPO vanilla, mismo config pero dataset ScienceQA | no disponible (checkpoint hermano) | Apache-2.0 |
| `Qwen/Qwen2.5-Math-1.5B` (base) | 1,78B | 4096 (nativo) | Preentrenamiento + SFT | no disponible (sin RL) | Apache-2.0 |

La comparación directa con el modelo base no es posible con los datos publicados, ya que el autor no reporta el rendimiento del base sin RL. El checkpoint hermano permite estudiar la influencia del dataset de entrenamiento (AoPS vs ScienceQA) bajo configuraciones idénticas.

## Limitaciones y advertencias

- No aplicar chat template: usar el modelo con `llm.generate()` y texto crudo; aplicar el template de Qwen2.5-Math degrada el rendimiento en ~19 puntos de pass@1.
- Solo respuestas de opción múltiple (A-E) con formato `\boxed{}`: respuestas sin formato extraíble se puntúan como incorrectas, lo que puede penalizar soluciones válidas pero mal formateadas.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar razonamientos plausibles pero incorrectos, especialmente en problemas fuera de su distribución de entrenamiento.
- Sesgo del dataset: entrenado exclusivamente en problemas de olimpiadas (NuminaMath) y validado en ScienceQA, puede tener bajo rendimiento en otros dominios matemáticos (cálculo, estadística aplicada, etc.).
- Contexto limitado: la ventana de entrenamiento es de 1536 tokens, por lo que problemas que requieran contextos más largos pueden no resolverse adecuadamente.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-Math también es Apache-2.0, sin restricciones adicionales conocidas.
- No hay garantías de soporte: el autor no indica mantenimiento ni actualizaciones futuras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandeep123/aops-grpo-vanilla-step600
- Modelo hermano (SQA): https://huggingface.co/sandeep123/sqa-grpo-vanilla-step600
- Perfil del autor: https://huggingface.co/sandeep123
- Repositorio de referencia (Vanilla_GRPO): https://github.com/CinderellaQAQ/Vanilla_GRPO
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
