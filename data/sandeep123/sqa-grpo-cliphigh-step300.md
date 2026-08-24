# sandeep123/sqa-grpo-cliphigh-step300

## Resumen

`sandeep123/sqa-grpo-cliphigh-step300` es un modelo de razonamiento matemático de 1.777 millones de parámetros, basado en `Qwen/Qwen2.5-Math-1.5B`, entrenado con el algoritmo GRPO (Group Relative Policy Optimization) sobre el dataset ScienceQA. El autor, sandeep123, lo presenta como un "baseline" para estudiar el efecto del componente Clip-Higher de DAPO (Decoupled PPO) en la optimización de modelos de razonamiento. Fue seleccionado como el mejor checkpoint según la métrica pass@6 en validación, alcanzando un valor de 0.9922.

El modelo está diseñado para responder preguntas de opción múltiple de ciencias (ScienceQA), extrayendo la respuesta final entre corchetes `\boxed{}`. Una característica crítica es que fue entrenado sin chat template, por lo que en inferencia debe usarse el texto plano directamente, no la interfaz de chat. Este detalle provoca una caída de aproximadamente 19 puntos de pass@1 si se aplica el template de Qwen2.5-Math.

La relevancia actual del modelo reside en su utilidad como referencia para investigaciones sobre métodos de optimización RL (GRPO, DAPO), especialmente en modelos pequeños. Su licencia Apache 2.0 permite uso comercial y modificación, y su tamaño moderado lo hace accesible para experimentos en hardware de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1536 tokens (según ejemplo de vLLM) |
| Tipos de cuantizacion | no disponible (solo safetensors en bfloat16) |
| Idiomas soportados | no disponible (dataset ScienceQA en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer decoder-only de Qwen2.5-Math-1.5B, que ya incorpora optimizaciones como atención GQA (Grouped Query Attention) y una ventana de contexto de 32K en la versión original, aunque este checkpoint se usa con una longitud máxima de 1536 tokens en los ejemplos de inferencia.

El entrenamiento se realizó con GRPO sobre el dataset ScienceQA (versión `scienceqa_boxfix`), con 25 épocas y 1250 pasos. Se usaron 128 prompts por batch con 6 rollouts cada uno (K=6), learning rate constante de 1e-6, KL penalizada dentro de la recompensa con coeficiente 0.01, y una recompensa de formato fija de 0.03. La intervención específica de este brazo es el ajuste del clip de PPO con límites inferior y superior de 0.2 y 0.28 respectivamente (denominado "Clip-Higher"), un componente de DAPO pero no la implementación completa. El coeficiente de entropía se fijó a 0.0 y la temperatura de rollout a 1.0.

No se aplicó chat template durante el entrenamiento, y el modelo debe usarse de la misma forma en inferencia para evitar un desajuste de distribución.

## Capacidades

- Razonamiento matemático y científico: el modelo responde preguntas de opción múltiple de ciencia (ScienceQA), produciendo respuestas en formato `\boxed{A-E}`.
- Extracción de respuestas: la salida esperada contiene la respuesta final en `\boxed{}`, lo que facilita la evaluación automática.
- Razonamiento multi-paso: al estar entrenado con GRPO, el modelo ha aprendido a generar cadenas de razonamiento antes de la respuesta final (aunque no se especifica si usa modo "thinking" explícito).
- No soporta tool calling, function calling ni agentes, ya que es un modelo de razonamiento puro sin capacidades adicionales.
- Multilingüismo: no documentado; el dataset ScienceQA está en inglés, por lo que se asume que el modelo solo funciona correctamente en inglés.

## Casos de uso

- Investigación en RLHF/GRPO: el modelo sirve como baseline para comparar intervenciones como Clip-Higher dentro de DAPO. Permite estudiar el efecto de los límites de clip en la estabilidad y calidad del entrenamiento.
- Evaluación de razonamiento en modelos pequeños: gracias a su tamaño (1.5B), puede usarse para medir el rendimiento de razonamiento en contextos de recursos limitados.
- Prototipos de respuesta a preguntas de ciencias: para sistemas de educación que necesiten responder preguntas de opción múltiple de nivel escolar, el modelo ofrece una solución ligera y de código abierto.
- Investigación en extracción de respuestas: su formato de respuesta con `\boxed{}` facilita el estudio de técnicas de extracción de respuestas en modelos de razonamiento.
- Generación de datos sintéticos: puede generar razonamientos y respuestas para ampliar datasets de ciencia, aunque hay que validar la calidad.
- Benchmark de robustez: útil para comprobar la sensibilidad de modelos RL a cambios en el prompt (por ejemplo, si se añade chat template, la métrica cae drásticamente).

## Benchmarks y rendimiento

Los únicos datos de rendimiento proporcionados son los de validación del propio autor, con 256 prompts held-out y K=6 rollouts a temperatura 1.0:

| Metric | Valor |
|---|---|
| pass@1 | 0.7331 |
| pass@6 | 0.9922 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con bfloat16: aproximadamente 3.5 GB para los pesos, más overhead de activaciones y KV cache. Con cuantización de 4 bits (por ejemplo, GPTQ o AWQ) se podría reducir a ~1 GB.
- GPU recomendadas: cualquier GPU con 4 GB de VRAM o más, como RTX 3050, RTX 3060, GTX 1660 Super, o GPU de servidor como A10, L4, A100 (sobras). Para entrenamiento con GRPO se necesitaría más memoria, pero para inferencia es accesible.
- Cabe en GPUs de consumo: sí, en la mayoría de tarjetas modernas de 6 GB o más.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Transformers. El autor recomienda vLLM con `dtype="bfloat16"` y `max_model_len=1536`.
- Latencia: para un modelo de 1.5B, la latencia es de milisegundos por token en GPU moderna (por ejemplo, ~10-20 ms/token en RTX 3090). No se proporcionan cifras exactas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos. Sin embargo, se puede comparar con su modelo base:

| Modelo | Parametros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| Qwen2.5-Math-1.5B (base) | 1.5B | 32K | Apache 2.0 | Modelo de matemáticas general sin RL |
| sqa-grpo-cliphigh-step300 (este) | 1.78B | 1536 (limitado) | Apache 2.0 | Entrenado con GRPO en ScienceQA |
| Qwen2.5-Math-3B | 3B | 32K | Apache 2.0 | Versión más grande, mayor capacidad |

El modelo es un ajuste fino del base con una sola tarea, por lo que su rendimiento en matemáticas generales probablemente sea inferior al del modelo base en otros dominios, pero mejor en ScienceQA.

## Limitaciones y advertencias

- Entrenado únicamente en ScienceQA, por lo que su rendimiento en otras tareas de razonamiento matemático o científico puede ser bajo.
- No debe aplicarse chat template en inferencia; hacerlo reduce el pass@1 en ~19 puntos.
- El dataset de entrenamiento (ScienceQA) es en inglés, no soporta otros idiomas de forma fiable.
- Puede sufrir alucinaciones en preguntas fuera de su dominio o con formatos no vistos.
- La extracción de respuesta depende del formato `\boxed{}`; si el modelo no lo produce, la respuesta se considera incorrecta.
- No se han reportado sesgos específicos, pero al ser un modelo pequeño y entrenado en un dataset limitado, puede heredar sesgos del dataset.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no ha sido evaluado en entornos de producción reales.

## Enlaces

- Hugging Face: https://huggingface.co/sandeep123/sqa-grpo-cliphigh-step300
- GitHub del autor: https://github.com/sandeep123-ai
- Referencia a DAPO (Clip-Higher) en la model card (sin enlace directo)
