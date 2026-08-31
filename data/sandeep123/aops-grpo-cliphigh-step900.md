# sandeep123/aops-grpo-cliphigh-step900

## Resumen

El modelo `sandeep123/aops-grpo-cliphigh-step900` es un checkpoint intermedio de un experimento de fine-tuning con aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen2.5-Math-1.5B`. Ha sido desarrollado por el usuario sandeep123 y forma parte de un estudio comparativo de variantes de la familia DAPO (Decoupled PPO) aplicadas al dataset ScienceQA para tareas de razonamiento científico con respuesta de opción múltiple. El checkpoint se seleccionó como el de mejor `pass@1` en validación para su brazo experimental (rank 1), con un valor de 0.2324.

El modelo se entrena mediante GRPO (Group Relative Policy Optimization) con límites de clip asimétricos (inferior 0.8, superior 1.28), una de las cuatro componentes del método DAPO, sin aplicar la totalidad del mismo. Está pensado como un baseline de referencia para comparar estrategias de RL en razonamiento matemático-científico. Aunque el modelo base es de 1.5B de parámetros, este checkpoint concreto contiene 1.777.088.000 parámetros (diferencia debida al vocabulario y embeddings del tokenizador de Qwen2.5). El repositorio pesa 7.1 GB, lo que sugiere que los pesos están en formato safetensors con precisión bfloat16.

La relevancia de este modelo radica en que documenta de forma explícita un problema crítico de inferencia: el modelo fue entrenado sin plantilla de chat (raw prompt text), y aplicar la plantilla de chat de Qwen2.5-Math en inferencia produce una caída de aproximadamente 19 puntos de `pass@1`. Este aviso es esencial para cualquier usuario que quiera reproducir los resultados reportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta hasta 32.768 tokens, pero no se especifica para este checkpoint) |
| Tipos de cuantizacion | no disponible (repo con safetensors en bfloat16) |
| Idiomas soportados | no disponible (el dataset ScienceQA es en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-Math-1.5B`, un transformer decoder-only con atención causal estándar, diseñado específicamente para razonamiento matemático. Sobre este base se aplica un entrenamiento de RL con GRPO, una variante de PPO que agrupa respuestas por prompt para calcular ventajas relativas. La configuración usa 128 prompts por lote con K=6 rollouts por prompt, learning rate constante de 1e-6, coeficiente KL de 0.01 y recompensa de formato fija de 0.03. El entrenamiento se ejecutó durante 25 épocas sobre el dataset ScienceQA (versión `scienceqa_boxfix`), con un máximo de 512 tokens de prompt y 1024 de respuesta. El checkpoint corresponde al paso 900 de un total de 1250.

La innovación técnica principal es el uso de límites de clip asimétricos (inferior 1-0.2, superior 1+0.28), una de las cuatro componentes del método DAPO. Esto permite una actualización más agresiva en la dirección positiva de la política, manteniendo restricciones en la negativa. No se aplica entropía (entropy_coeff=0.0) y la temperatura de rollout es 1.0. El entrenamiento se realizó con el framework verl y el dataset se procesó con `RLHFDataset` con `apply_chat_template=False`, por lo que el modelo aprende a partir de texto plano sin marcadores de chat.

## Capacidades

- Generación de texto autoregresiva estándar.
- Razonamiento matemático y científico de nivel escolar (ScienceQA).
- Respuesta a preguntas de opción múltiple con extracción de respuesta final en `\boxed{}` o token A-E.
- No soporta tool calling ni function calling.
- No soporta agentes ni multi-step reasoning más allá de la cadena de razonamiento generada en texto libre.
- Capacidades multilingües: no declaradas; el entrenamiento se realizó sobre un dataset en inglés.
- No incluye modo de pensamiento explícito, aunque el modelo genera cadenas de razonamiento antes de la respuesta final.
- No tiene capacidades de visión ni audio.

## Casos de uso

- Evaluación de razonamiento científico en entornos educativos: el modelo puede responder preguntas de opción múltiple de ciencia, útil para generar bancos de preguntas o evaluar automáticamente respuestas de estudiantes si se integra en una plataforma educativa.
- Investigación en métodos de RL para LLMs: sirve como baseline reproducible para comparar variantes de clip bounds, estrategias de recompensa o selección de checkpoints en experimentos académicos.
- Análisis de sensibilidad a la plantilla de chat: el aviso explícito sobre el mismatch de 19 puntos permite estudiar el impacto de la tokenización y el formato en modelos entrenados con RL.
- Generación de explicaciones paso a paso en dominios científicos: al haber sido entrenado con razonamiento, puede producir justificaciones detalladas para problemas de ciencia, aunque sin garantías de corrección completa.
- Benchmarking de pipelines de inferencia con vLLM: el ejemplo de código en la model card muestra cómo cargar el modelo con vLLM y sampling parameters específicos (n=6, temperature=1.0), útil para probar configuraciones de decodificación.
- Reproducción de experimentos de RL: investigadores pueden clonar el entrenamiento con verl y comparar este checkpoint con otros de la misma familia (por ejemplo, el de mejor pass@6).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K) en la informacion disponible. La única métrica reportada corresponde a la validación interna del propio experimento:

| Metrica | Valor |
|---|---|
| pass@1 (ScienceQA, validación) | 0.2324 |
| pass@6 (ScienceQA, validación) | 0.4219 |
| Paso de entrenamiento | 900 |

Estos valores se obtuvieron con 256 prompts held-out, K=6 rollouts, temperatura 1.0 y seed 42. La extracción de respuesta se realiza mediante el contenido del último `\boxed{}` o el último token A-E independiente; respuestas sin extracción se puntúan como incorrectas.

## Requisitos de hardware

- El modelo tiene 1.777 millones de parámetros; en bfloat16 ocupa aproximadamente 3.5 GB en memoria de GPU (pesos + overhead).
- VRAM estimada para inferencia: mínimo 4 GB con cuantización de 8 bits; 6-8 GB recomendado para bfloat16 sin cuantizar.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (RTX 2060, RTX 3060, RTX 4060, etc.) puede ejecutarlo. Para mayor velocidad, GPUs con tensor cores (RTX 30/40 series) o A100/H100 en entornos profesionales.
- Se puede desplegar con vLLM (como se muestra en la model card), así como con llama.cpp, Ollama o TGI usando conversión a GGUF (no incluida en el repo).
- Latencia y throughput: no se proporcionan datos concretos. En una GPU consumer moderna, se espera una generación de 1024 tokens en unos pocos segundos, pero esto depende del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este checkpoint con otros modelos de la misma categoría. El modelo base `Qwen/Qwen2.5-Math-1.5B` es el punto de partida, pero no se han publicado benchmarks de este checkpoint en comparación con otros modelos de razonamiento de tamaño similar. La información disponible solo incluye métricas internas del propio experimento.

## Limitaciones y advertencias

- **No aplicar plantilla de chat**: el modelo fue entrenado con texto crudo. Usar el chat template de Qwen2.5-Math en inferencia reduce el rendimiento en ~19 puntos de pass@1. Es imprescindible usar `llm.generate()` con el prompt en texto plano.
- **Alcance limitado**: entrenado exclusivamente en ScienceQA; no ha sido evaluado en otros dominios o tareas generales de razonamiento.
- **Riesgo de alucinación**: como todo LLM, puede generar respuestas plausibles pero incorrectas, especialmente en problemas no vistos.
- **Sesgos**: el dataset ScienceQA puede contener sesgos culturales o de representación; no se ha realizado una auditoría de sesgos.
- **Checkpoint intermedio**: es un paso 900 de un entrenamiento de 1250; no es el modelo final óptimo en todas las métricas (el mejor pass@1 se encuentra cerca del paso 1000-1200, y el mejor pass@6 cerca del paso 200-500).
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-Math-1.5B tiene su propia licencia (Qwen Research License) que puede imponer restricciones adicionales; verificar antes de uso comercial.
- **Sin soporte de tool calling ni agentes**: no es adecuado para aplicaciones que requieran interacción con herramientas externas.
- **Métricas de validación específicas**: los valores reportados dependen del protocolo de extracción de respuestas; cambios en ese protocolo alteran los resultados.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/sandeep123/aops-grpo-cliphigh-step900)
- [Modelo base Qwen2.5-Math-1.5B](https://huggingface.co/Qwen/Qwen2.5-Math-1.5B)
- [Framework verl (utilizado para el entrenamiento)](https://github.com/volcengine/verl) (enlace inferido, no confirmado en la información proporcionada)
