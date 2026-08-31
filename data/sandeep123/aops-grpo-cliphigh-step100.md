# sandeep123/aops-grpo-cliphigh-step100

## Resumen

El modelo `sandeep123/aops-grpo-cliphigh-step100` es un fine-tuning del modelo base `Qwen/Qwen2.5-Math-1.5B` (1.777 millones de parámetros) entrenado con el algoritmo de optimización GRPO (Group Relative Policy Optimization) sobre el dataset ScienceQA. El autor, `sandeep123`, lo presenta como un "baseline" dentro de un estudio sobre técnicas de RL para razonamiento, aplicando una variante de recorte de probabilidad llamada "Clip-Higher" (inspirada en DAPO, pero solo con una de sus cuatro componentes). El objetivo es mejorar la capacidad de razonamiento matemático y de respuesta a preguntas de opción múltiple.

El checkpoint seleccionado corresponde al paso 100 de entrenamiento, elegido por su mejor rendimiento en validación según la métrica `pass@6` (0.4219), aunque el `pass@1` es de 0.2135. El autor advierte explícitamente que no se debe aplicar un chat template durante la inferencia, ya que el modelo fue entrenado con texto plano sin formato de chat, y hacerlo provoca una caída de aproximadamente 19 puntos en `pass@1` en tareas hermanas. Este detalle es crítico para cualquier uso práctico.

El modelo se publica bajo licencia Apache-2.0 y está pensado como referencia para investigaciones en RL, no como un producto final para producción. Su relevancia radica en documentar el efecto de una técnica concreta de recorte de probabilidad dentro de un pipeline de entrenamiento reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card; el ejemplo de inferencia usa `max_model_len=1536`. El modelo base Qwen2.5-Math-1.5B soporta 4096 tokens, pero no se confirma si este fine-tuning mantiene ese límite. |
| Tipos de cuantizacion | No especificados; el repositorio contiene pesos en `safetensors` (bfloat16 presumiblemente, según el ejemplo de vLLM). |
| Idiomas soportados | No disponibles (el dataset ScienceQA es en inglés, pero no se declara oficialmente). |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen2.5-Math-1.5B, un transformer decoder-only con atención causal estándar, diseñado específicamente para razonamiento matemático. El entrenamiento se realizó con el framework verl (Volcano Engine Reinforcement Learning) usando GRPO, que genera múltiples rollouts (K=6) por cada prompt y actualiza la política comparando las recompensas relativas del grupo. La técnica "Clip-Higher" modifica los límites del clip de la razón de importancia: el límite inferior se fija en 1-0.2 y el superior en 1+0.28, en lugar de los valores simétricos habituales. Esto permite que la política pueda aumentar la probabilidad de acciones con mayor libertad que disminuirla, un ajuste que según DAPO puede mejorar la exploración.

El dataset ScienceQA se utiliza con una versión "boxfix" que fuerza la respuesta en formato `\boxed{}`. Los hiperparámetros incluyen 25 épocas (1250 pasos), batch de 128 prompts con 6 rollouts cada uno, learning rate constante de 1e-6, coeficiente KL de 0.01 en la recompensa, y una recompensa de formato de 0.03 constante. La longitud máxima de prompt y respuesta es de 512 y 1024 tokens respectivamente. El entrenamiento se realizó con temperatura de rollout 1.0 y semilla 42. No se aplicó chat template en el dataset de entrenamiento, lo que explica la advertencia del autor.

## Capacidades

- Generación de texto con razonamiento matemático y respuesta a preguntas de opción múltiple (ScienceQA).
- Produce respuestas en formato `\boxed{}` para extraer la respuesta final.
- Soporta inferencia con muestreo múltiple (pass@k) usando temperatura 1.0.
- No se reportan capacidades de tool calling, agentes, visión o audio.
- Multilingüismo no confirmado; el dataset es en inglés, pero el modelo base tiene cierta capacidad multilingüe (Qwen2.5-Math soporta varios idiomas, aunque no se especifica en este fine-tuning).
- El modelo está diseñado para ser usado sin chat template, es decir, como un generador de texto plano.

## Casos de uso

- Investigación en RL: sirve como baseline para comparar técnicas de optimización de políticas (GRPO, DAPO, clip-higher) en tareas de razonamiento. Los investigadores pueden reproducir los experimentos y analizar el efecto del recorte asimétrico.
- Evaluación de métricas de extracción de respuestas: el pipeline de extracción (contenido de `\boxed{}` o último token A-E) puede reutilizarse para medir la calidad de modelos de razonamiento en tareas de opción múltiple.
- Generación de razonamiento matemático educativo: se puede usar para generar explicaciones paso a paso de problemas de ciencia, aunque su rendimiento es modesto (pass@1 de 0.21) y no está pensado para producción.
- Estudio de la influencia del chat template: el autor documenta una caída de 19 puntos en pass@1 al aplicar el template, lo que lo convierte en un caso de estudio sobre la importancia de la consistencia entre entrenamiento e inferencia.
- Test de infraestructura de inferencia: al ser un modelo pequeño (1.5B), es útil para validar servidores vLLM o pipelines de RLHF/GRPO sin grandes requisitos de hardware.
- Reproducibilidad de experimentos: con los hiperparámetros publicados y el código (presumiblemente en el repositorio del autor), se puede replicar el entrenamiento y verificar los resultados.

## Benchmarks y rendimiento

La model card reporta métricas de validación sobre 256 prompts retenidos de ScienceQA, con K=6 y temperatura 1.0:

| Metrica | Valor |
|---|---|
| pass@1 | 0.2135 |
| pass@6 | 0.4219 |
| paso de entrenamiento | 100 |

No se proporcionan comparaciones con otros modelos en la información disponible. El autor menciona que el checkpoint con mejor pass@1 se encuentra en pasos 1000-1200, pero no publica esos valores en esta ficha. No se han publicado resultados en benchmarks estándar como MMLU, GSM8K o HumanEval.

## Requisitos de hardware

- VRAM estimada: con pesos en bfloat16 (2 bytes por parámetro), el modelo ocupa aproximadamente 3.6 GB. Con overhead de inferencia, se recomienda al menos 5-6 GB de VRAM. Con cuantización a 4 bits (no proporcionada oficialmente, pero posible con herramientas como llama.cpp), cabría en ~1.5 GB.
- GPUs recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 3070, A10, etc.) puede ejecutar el modelo en bfloat16. En consumer, una RTX 3060 de 12 GB es suficiente.
- Despliegue: el ejemplo de la model card usa vLLM con `dtype="bfloat16"` y `max_model_len=1536`. También es compatible con llama.cpp (convirtiendo a GGUF) y Ollama, aunque no se proporcionan instrucciones oficiales.
- Latencia y throughput: no se especifican. Para un modelo de 1.5B en una GPU moderna, se espera una latencia de decodificación de decenas de tokens por segundo en vLLM, pero no hay datos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-Math-1.5B (base) | 1.5B | 4096 | Apache-2.0 | Modelo base sin RL; no hay benchmarks públicos comparables en ScienceQA. |
| sandeep123/aops-grpo-cliphigh-step100 | 1.5B | No especificado (1536 en ejemplo) | Apache-2.0 | Este modelo; pass@1 0.2135 en ScienceQA. |
| Otros fine-tunes GRPO de Qwen2.5-Math | No disponibles | No disponible | No disponible | No se han encontrado modelos comparables publicados con los mismos datos. |

No se dispone de información suficiente para una comparativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No aplicar chat template: el modelo fue entrenado con texto plano. Usar el template de Qwen2.5-Math degrada el rendimiento en ~19 puntos de pass@1.
- Rendimiento moderado: pass@1 de 0.21 en ScienceQA indica que no es adecuado para producción sin un filtrado adicional.
- Extracción de respuestas: si una respuesta no contiene `\boxed{}` ni un token A-E final, se puntúa como incorrecta, lo que puede penalizar respuestas válidas pero mal formateadas.
- Sesgos y alucinaciones: al ser un modelo pequeño, puede generar razonamientos plausibles pero incorrectos. No hay estudios de sesgo específicos.
- Contexto limitado: aunque el base soporta 4096 tokens, el ejemplo usa 1536, y no se garantiza que el fine-tuning haya preservado la capacidad de contexto largo.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo es un checkpoint de investigación sin garantías de calidad.
- Reproducibilidad: el autor no proporciona el código de entrenamiento en la model card; solo se menciona el uso de verl y GRPO. Los detalles exactos pueden no estar disponibles públicamente.

## Enlaces

- HuggingFace: https://huggingface.co/sandeep123/aops-grpo-cliphigh-step100
- Perfil del autor en GitHub: https://github.com/sandeep123-ai (sin repositorios específicos encontrados)
- Modelo hermano (otro checkpoint): https://huggingface.co/sandeep123/sqa-grpo-cliphigh-step1100 (mencionado en la búsqueda, no detallado en esta ficha)
- No se han encontrado papers, blogs o demos adicionales en la información proporcionada.
