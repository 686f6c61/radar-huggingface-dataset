# sandeep123/aops-grpo-temp12-step400

## Resumen

`sandeep123/aops-grpo-temp12-step400` es un modelo de razonamiento matemático y científico obtenido por fine-tuning del modelo base `Qwen/Qwen2.5-Math-1.5B` mediante aprendizaje por refuerzo con el algoritmo GRPO (Group Relative Policy Optimization). Lo desarrolla el usuario sandeep123 y forma parte de una serie de experimentos que exploran el efecto de diferentes temperaturas de rollout y configuraciones de clipping en el entrenamiento con GRPO sobre el dataset ScienceQA. El checkpoint corresponde al paso 400 de un entrenamiento de 1250 pasos, seleccionado como el mejor en validación según la métrica pass@1 dentro de su rama experimental (temperatura 1.2).

El modelo está pensado como una baseline de investigación para estudiar cómo la temperatura de muestreo durante el entrenamiento afecta a la calidad y diversidad de las respuestas generadas. Tiene aproximadamente 1.78 mil millones de parámetros y se distribuye bajo licencia Apache 2.0. Una particularidad importante es que no se debe aplicar el chat template de Qwen2.5-Math en inferencia, ya que el entrenamiento se realizó sobre texto plano sin plantilla de conversación; aplicarla provocaría una pérdida de aproximadamente 19 puntos en pass@1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen2), denso |
| Parametros totales | 1.777.088.000 (1.78B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el ejemplo de inferencia usa max_model_len=1536) |
| Tipos de cuantizacion | no disponible (solo safetensors en bfloat16) |
| Idiomas soportados | no disponible (presumiblemente ingles, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen2.5-Math-1.5B, un transformer causal denso de 1.5B parametros (el checkpoint resultante tiene 1.78B debido al fine-tuning). No se trata de un modelo MoE ni híbrido. El entrenamiento se realizó con GRPO, un algoritmo de optimización de política proximal (PPO) sin critic, implementado sobre el framework verl. Se utilizó el dataset ScienceQA (con la variante `scienceqa_boxfix`), con 128 prompts por batch y K=6 rollouts por prompt. El entrenamiento duró 25 épocas (1250 pasos en total), con una tasa de aprendizaje constante de 1e-6, un coeficiente KL de 0.01 (incluido en la recompensa) y una recompensa de formato de 0.03 constante. La temperatura de rollout durante el entrenamiento fue 1.2, mientras que la validación se realizó a temperatura 1.0 con semilla 42. No se aplicó RLHF ni DPO, sino exclusivamente RL con GRPO. La exploración se basó en la distribución de muestreo sobre el corpus AoPS (como referencia para el diseño de la recompensa), pero el entrenamiento se hizo sobre ScienceQA.

## Capacidades

- Razonamiento matemático y científico: responde preguntas de opción múltiple del estilo ScienceQA, proporcionando la opción correcta entre A-E.
- Generación de respuestas con formato `\boxed{}`: el modelo aprende a encerrar la respuesta final en una caja, lo que facilita la extracción automática.
- Evaluación de calidad: alcanza un pass@1 de 0.2363 y pass@6 de 0.4023 en el conjunto de validación (256 prompts, K=6).
- No soporta tool calling, ni function calling, ni razonamiento multi-paso explícito más allá de la cadena de pensamiento interna.
- No tiene capacidades multimodales (solo texto).
- No está entrenado para conversación multi-turno; no debe usarse con chat template.

## Casos de uso

- Investigación en aprendizaje por refuerzo: sirve como baseline para comparar el efecto de la temperatura de rollout en GRPO; puede usarse para reproducir experimentos o como punto de partida para estudios de estabilidad del entrenamiento.
- Evaluación de algoritmos de RL: al ser un checkpoint intermedio (paso 400), permite estudiar la dinámica de entrenamiento y la evolución de la métrica pass@1 frente a otros pasos.
- Generación de respuestas razonadas en dominios científicos: el modelo puede producir explicaciones paso a paso y respuestas finales en formato `\boxed{}`, útil para tareas de QA educativa.
- Benchmark de modelos pequeños de razonamiento: con 1.78B parámetros, es un candidato para probar técnicas de cuantización o despliegue en entornos con recursos limitados.
- Análisis de sesgo de formato: dado que el entrenamiento usa texto plano sin chat template, puede usarse para estudiar cómo la plantilla de conversación afecta al rendimiento en modelos de razonamiento.
- Comparación de checkpoints por diversidad: el autor publica también otros checkpoints (por ejemplo, el de mayor pass@6) para comparar cómo la selección de checkpoint influye en las métricas de diversidad frente a precisión.

## Benchmarks y rendimiento

El autor reporta las siguientes métricas de validación para este checkpoint (paso 400), obtenidas sobre 256 prompts held-out con K=6, temperatura 1.0 y semilla 42:

| Metrica | Valor |
|---|---|
| pass@1 | 0.2363 |
| pass@6 | 0.4023 |
| step | 400 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. La extracción de la respuesta se realiza tomando el contenido del último `\boxed{}`, o en su defecto el último token A-E; las respuestas sin respuesta extraíble se consideran incorrectas.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: ~3.6 GB (1.78B parámetros × 2 bytes) más overhead de activaciones y KV cache; en la práctica se recomienda al menos 6-8 GB de VRAM para una inferencia cómoda.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 Ti 16GB, o superiores; también puede ejecutarse en GPU de datacenter como A10G o T4.
- En cuantización de 8 bits (int8) cabría en ~2 GB de VRAM, y en 4 bits en ~1 GB, aunque no se proporcionan pesos cuantizados oficiales; habría que convertir el safetensors.
- Opciones de despliegue: vLLM (como se muestra en el ejemplo de la model card), llama.cpp, Ollama (si se convierte a GGUF), o Transformers con carga en bfloat16.
- Latencia estimada: en una GPU consumer moderna, una generación de 1024 tokens con bfloat16 debería completarse en unos pocos segundos; el throughput exacto no está disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros modelos en el mismo benchmark para comparar directamente. Sin embargo, se puede comparar estructuralmente con:

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Math-1.5B (base) | 1.5B | 32k (no confirmado) | Pre-entrenamiento | Apache 2.0 | HuggingFace |
| sandeep123/aops-grpo-temp12-step400 | 1.78B | no disponible (max 1536 en ejemplo) | GRPO sobre ScienceQA | Apache 2.0 | HuggingFace |
| sandeep123/sqa-grpo-cliphigh-step400 | similar | no disponible | GRPO con clip alto | Apache 2.0 | HuggingFace |

No se han publicado comparativas de rendimiento entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- No aplicar chat template: el modelo fue entrenado con texto plano; usar `llm.chat()` o el template de Qwen2.5-Math degrada el rendimiento en ~19 puntos de pass@1.
- Dataset limitado: el entrenamiento se realizó únicamente sobre ScienceQA, por lo que el modelo no generaliza bien a otras tareas de razonamiento fuera de ese dominio.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar respuestas plausibles pero incorrectas, especialmente en preguntas abiertas.
- Formato de respuesta rígido: depende de la extracción de `\boxed{}`; si no aparece, la respuesta se considera incorrecta.
- Solo opción múltiple: el modelo está diseñado para responder con una letra A-E, no para generar texto libre.
- Sin soporte multilingüe confirmado: probablemente solo inglés, aunque no se especifica.
- No hay cuantizaciones oficiales: solo safetensors en bfloat16; para despliegue ligero hay que convertir los pesos.
- Checkpoint intermedio: no es el mejor paso en términos de pass@1 (el autor indica que el óptimo está cerca del paso 1000-1200), por lo que su uso como modelo final puede no ser óptimo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandeep123/aops-grpo-temp12-step400
- Perfil del autor en HuggingFace (inferido): https://huggingface.co/sandeep123
- Perfil del autor en GitHub: https://github.com/sandeep123-ai
- Modelo hermano (clip alto): https://huggingface.co/sandeep123/sqa-grpo-cliphigh-step400
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
