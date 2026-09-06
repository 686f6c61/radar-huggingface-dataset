# sandeep123/mathbf-dqo-a1-step800

## Resumen

`sandeep123/mathbf-dqo-a1-step800` es un checkpoint de investigación desarrollado por sandeep123 que aplica el objetivo DQO (Diversity-Quality Optimization) con GRPO sobre el modelo base `Qwen/Qwen2.5-Math-1.5B`. Se trata de un baseline entrenado en el conjunto de datos ScienceQA bajo el protocolo "boxfix", que exige un razonamiento numerado paso a paso seguido de una respuesta final en `\boxed{}`. El modelo tiene 1.777B de parámetros (1.777.088.000) y se publica en formato safetensors bajo licencia Apache 2.0. La longitud de contexto no se especifica en la documentación; el ejemplo de inferencia del autor usa `max_model_len=1536`.

El propósito de este checkpoint es servir como referencia para comparar métodos de RL en razonamiento científico. A diferencia de un fine-tuning convencional, aquí se entrena con GRPO y un término de diversidad DQO (alpha=1.0) que maximiza `alpha*logdet(L+I)` con un estimador leave-one-out. El autor lo publica como el mejor checkpoint por pass@6 en su brazo de experimentación (rank 2), con métricas de validación de 0.7871 en pass@1 y 0.9609 en pass@6.

La relevancia del modelo radica en que permite reproducir y evaluar el efecto del objetivo de diversidad en el rendimiento de razonamiento, sin la confusión de aplicar un chat template en inferencia. El autor advierte explícitamente que usar el template de chat de Qwen2.5-Math provoca un desajuste de ~19 puntos de pass@1 en una tarea hermana.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen/Qwen2.5-Math-1.5B) |
| Parámetros totales | 1.777.088.000 (1.777B) |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible; el ejemplo del autor usa max_model_len=1536 |
| Tipos de cuantización | No disponible (no se publican cuantizaciones; pesos en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-Math-1.5B`, un transformer decoder-only. Sobre esta base se aplica RL con GRPO en el dataset `ScienceQA` (variante `scienceqa_boxfix`). El entrenamiento se realiza con 25 epochs y 1250 pasos, batch de 128 prompts con K=6 rollouts por prompt, learning rate constante de 1e-6, KL in-reward de 0.01, y una recompensa de formato de 0.03 constante. El prompt máximo es 512 tokens y la respuesta máxima 1024 tokens, con semilla 42.

La innovación técnica principal es el uso del objetivo DQO propuesto por Chen et al. (ICLR 2026), que añade un término de diversidad `alpha*logdet(L+I)` con un estimador leave-one-out. En este checkpoint, alpha=1.0 y la embedding phi se obtiene de los estados ocultos de la política de referencia, en lugar del codificador de oraciones preentrenado del paper. Esto permite aislar el efecto del objetivo de diversidad comparándolo con otros brazos del mismo proyecto.

No se menciona RLHF ni DPO; el entrenamiento es puramente RL con GRPO.

## Capacidades

- Genera razonamiento paso a paso en formato "Step 1..n" y concluye con una respuesta en `\boxed{X}` para preguntas de opción múltiple de ScienceQA.
- Responde preguntas de opción múltiple con opciones A-E; la extracción de la respuesta se realiza desde el último `\boxed{}` o, en su defecto, el último token A-E.
- No soporta tool calling, function calling ni uso como agente autónomo, según la documentación disponible.
- No tiene capacidades de visión ni audio.
- El soporte multilingüe no está especificado; el modelo base es Qwen2.5-Math, pero no se confirma en la información.
- Es un baseline de RL, no un modelo de instrucción: debe usarse con texto sin formato, sin chat template.

## Casos de uso

- Evaluación de razonamiento científico: el modelo puede utilizarse como baseline en ScienceQA para comparar el efecto de distintos objetivos RL (GRPO, DQO, STRIDE) sobre la exactitud de respuesta.
- Investigación en diversidad de rollouts: gracias al término DQO, el checkpoint es útil para estudiar cómo la diversidad en los rollouts afecta al pass@6 y a la cobertura de respuestas.
- Comparación de checkpoints en pipelines de RL: puede integrarse en frameworks como verl para reproducir experimentos y analizar la selección de checkpoints por pass@1 vs pass@6.
- Generación de explicaciones educativas: puede generar explicaciones numeradas para preguntas de ciencias de opción múltiple, lo que permite crear materiales didácticos con razonamiento visible.
- Análisis de robustez de formato: sirve para investigar la sensibilidad del modelo a la extracción de respuestas y al formato `\boxed{}`, especialmente en sistemas de evaluación automática.
- Prototipado de sistemas sin chat template: es un caso de prueba para estudiar el impacto de no aplicar templates en modelos entrenados con RL, útil en investigación de alineación.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| pass@1 (ScienceQA) | 0.7871 |
| pass@6 (ScienceQA) | 0.9609 |
| Step | 800 |

Nota: validación con 256 prompts held-out, K=6, temperatura 1.0 y semilla 42. No se han publicado resultados de benchmarks externos en la información disponible; las métricas provienen de la validación del autor.

## Requisitos de hardware

- VRAM estimada: ~7.1 GB para pesos en float32; ~3.6 GB en bfloat16; ~1 GB en cuantización 4-bit (estimaciones basadas en el tamaño de los parámetros).
- GPU recomendadas: RTX 3060 12GB, RTX 4070, A10G, A100 o H100 para inferencia con vLLM.
- Cabe en GPUs de consumo con al menos 8 GB de VRAM.
- Opciones de despliegue: vLLM (usado en el ejemplo del autor). No se han verificado otros frameworks como llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| sandeep123/mathbf-dqo-a1-step800 | 1.777B | no disponible | Apache 2.0 | DQO en ScienceQA, pass@1 0.7871 |
| sandeep123/math-dqo-a1-step700 | 1.777B | no disponible | Apache 2.0 | DQO en MATH, sin métricas publicadas |
| sandeep123/dqo-math-K6a3kl-boxfix-step800 | ~2B | no disponible | Apache 2.0 | STRIDE-MATH counterpart, sin métricas publicadas |
| Qwen/Qwen2.5-Math-1.5B | 1.777B | no disponible | Apache 2.0 | Modelo base sin RL |

Nota: no se dispone de modelos comparables de otros autores en la información proporcionada; se compara con el modelo base y con checkpoints del mismo proyecto.

## Limitaciones y advertencias

- No aplicar chat template: el uso del template de Qwen2.5-Math en inferencia provoca un desajuste de entrenamiento/evaluación de ~19 puntos de pass@1 en una tarea hermana.
- El checkpoint se seleccionó por pass@6 (step 800); el mejor pass@1 se sitúa en steps 1000-1200, por lo que la exactitud puede no ser óptima.
- Entrenado exclusivamente en ScienceQA; no se ha evaluado la generalización a otros dominios.
- Idiomas no especificados; el modelo base es Qwen2.5-Math, con soporte limitado a inglés y chino, pero no se confirma.
- La extracción de respuestas depende del formato `\boxed{}`; las respuestas mal formateadas se puntúan como incorrectas.
- Riesgo de alucinación inherente a los modelos de razonamiento matemático.
- Sin soporte de tool calling ni agentes.
- Licencia Apache 2.0 permite uso comercial, pero es un baseline de investigación sin garantías de producción.

## Enlaces

- https://huggingface.co/sandeep123/mathbf-dqo-a1-step800
- https://huggingface.co/sandeep123/dqo-math-K6a3kl-boxfix-step800
- https://huggingface.co/sandeep123/math-dqo-a1-step700
