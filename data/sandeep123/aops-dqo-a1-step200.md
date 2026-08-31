# sandeep123/aops-dqo-a1-step200

## Resumen

El modelo `sandeep123/aops-dqo-a1-step200` es un ajuste fino del modelo base `Qwen/Qwen2.5-Math-1.5B` (1.777 millones de parámetros) realizado por el usuario sandeep123. Está entrenado con aprendizaje por refuerzo (RL) mediante el algoritmo GRPO (Group Relative Policy Optimization) sobre el conjunto de datos ScienceQA, incorporando además una variante del objetivo de diversidad DQO (Diversity-based Quality Optimization) con alpha=1.0. El modelo está diseñado como un baseline para evaluar el impacto de la diversidad en tareas de razonamiento científico, concretamente en preguntas de opción múltiple.

Este checkpoint concreto se seleccionó como el mejor en validación según la métrica pass@6 (0.4141) dentro de su rama experimental, en contraste con otros checkpoints que optimizan pass@1. La relevancia actual radica en que explora cómo la diversidad en el muestreo de rollouts afecta al rendimiento en tareas de razonamiento matemático, un tema activo en la investigación de RL para modelos de lenguaje. Su tamaño compacto (1.5B) lo hace accesible para experimentación en hardware de consumo. No se dispone de información sobre la longitud de contexto, los idiomas soportados ni las cuantizaciones disponibles; el modelo se distribuye únicamente en formato safetensors con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (en inferencia se usa max_model_len=1536) |
| Tipos de cuantizacion | no disponible (solo safetensors, se usa bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2.5-Math-1.5B, un transformer causal con atención estándar, entrenado previamente para razonamiento matemático. El ajuste fino se realizó con GRPO sobre ScienceQA, un dataset de preguntas de opción múltiple con contexto científico. El entrenamiento utilizó 128 prompts por lote con K=6 rollouts por prompt, una tasa de aprendizaje constante de 1e-6, un coeficiente KL de 0.01 y una recompensa de formato fija de 0.03. El proceso tomó 1250 pasos en total (25 épocas) con una longitud máxima de prompt de 512 tokens y de respuesta de 1024 tokens.

La innovación principal es la incorporación del objetivo DQO (alpha=1.0) que añade un término de diversidad basado en logdet(L+I) con un estimador leave-one-out. A diferencia del paper original, la representación phi se obtiene de los estados ocultos de la política de referencia en lugar de un codificador de oraciones preentrenado, lo que permite aislar el efecto del objetivo de diversidad. El modelo se entrenó sin plantilla de chat (raw prompt text) y no debe aplicarse una plantilla de chat en inferencia, ya que esto introduce una discrepancia de rendimiento de aproximadamente 19 puntos en pass@1 según los autores.

## Capacidades

- Razonamiento matemático y científico: diseñado para responder preguntas de opción múltiple en el dominio científico, extrayendo respuestas de un formato `\boxed{}` final.
- Generación de texto con muestreo múltiple: soporta generación de K rollouts (típicamente 6) con temperatura 1.0 para evaluar pass@k.
- Sin soporte de tool calling ni function calling: no se menciona ninguna capacidad de este tipo.
- Sin capacidades multimodales: solo texto.
- Sin modo de pensamiento explícito: el razonamiento se produce en la generación de texto estándar.
- Multilingüe: no hay información sobre idiomas; dado que el dataset es ScienceQA (principalmente inglés), se asume limitado a inglés.

## Casos de uso

- Evaluación de objetivos de diversidad en RL: el modelo sirve como baseline para comparar el efecto de la regularización DQO frente a otros objetivos en tareas de razonamiento, útil para investigadores que estudian el equilibrio entre calidad y diversidad en el entrenamiento de LLMs.
- Investigación en aprendizaje por refuerzo para modelos de lenguaje pequeños: al ser de 1.5B, permite ejecutar experimentos de RL con presupuesto computacional reducido, por ejemplo para validar hipótesis sobre la selección de checkpoints en función de métricas pass@k.
- Pruebas de extracción de respuestas estructuradas: el modelo está entrenado para emitir respuestas en formato `\boxed{}`, lo que lo hace adecuado para experimentos sobre parsing de salidas matemáticas.
- Generación de datos sintéticos para entrenamiento de modelos de razonamiento: dado que puede producir múltiples razonamientos distintos (pass@6), puede usarse para generar datos de entrenamiento con diversidad controlada.
- Análisis de robustez en tareas de opción múltiple: al ser un modelo pequeño, es útil para estudiar cómo la temperatura y el número de muestras afectan a la precisión en dominios científicos.
- Benchmarking de hardware y frameworks de inferencia: por su tamaño y formato safetensors, sirve como caso de prueba para medir latencia y throughput en vLLM, llama.cpp u otros motores.

## Benchmarks y rendimiento

Los resultados de validación reportados en la model card se obtuvieron con 256 prompts de validación, K=6, temperatura 1.0 y semilla 42. Los valores corresponden a la precisión de respuesta muestreada (pass@1) y pass@6.

| Metrica | Valor |
|---|---|
| pass@1 | 0.2096 |
| pass@6 | 0.4141 |
| Paso de entrenamiento | 200 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 1.777M parámetros en bfloat16, lo que requiere aproximadamente 3.5 GB de memoria para los pesos. Con overhead de activaciones y contexto (max_model_len=1536), se estima entre 4 y 6 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM, como NVIDIA RTX 2060, RTX 3060, RTX 4060, o GPUs de datacenter como A10G o T4. No requiere A100/H100.
- Se puede ejecutar en GPUs de consumo (gama media) con cuantización adicional (aunque no se proporcionan cuantizaciones oficiales, se podría convertir a GGUF).
- Opciones de despliegue: vLLM (usado en el ejemplo de inferencia), llama.cpp, Ollama (si se convierte a GGUF), o directamente con Transformers + bfloat16.
- Latencia y throughput: no se han publicado mediciones oficiales. En una RTX 3060 se espera una generación de ~50-100 tokens/s para este tamaño.

## Comparativa con modelos similares

No hay datos comparativos publicados con otros modelos de la misma categoría. En lugar de inventar comparaciones, se indican referencias estructurales:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-Math-1.5B (base) | 1.5B | 32K (según documentación de Qwen2.5) | Apache 2.0 | Modelo base sin RL, sin entrenamiento en ScienceQA |
| sandeep123/aops-dqo-a1-step200 | 1.5B | no disponible | Apache 2.0 | Fine-tuning con GRPO + DQO en ScienceQA |

Se recomienda comparar con otros fine-tunes de Qwen2.5-Math-1.5B entrenados con RL estándar (sin DQO) para evaluar el impacto de la diversidad, pero no se dispone de dichos resultados.

## Limitaciones y advertencias

- No se debe aplicar una plantilla de chat en inferencia; hacerlo reduce el rendimiento en ~19 puntos de pass@1 (según la model card). Esto limita su uso en aplicaciones de chatbot convencionales.
- El modelo está entrenado exclusivamente en ScienceQA, por lo que su rendimiento general en otros dominios de razonamiento matemático no está verificado.
- Riesgo de alucinación: como todo LLM, puede generar respuestas incorrectas con alta confianza, especialmente fuera de su distribución de entrenamiento.
- Sesgos: al ser un modelo pequeño y entrenado en un dataset específico, puede presentar sesgos derivados de la composición de ScienceQA (por ejemplo, sesgo geográfico o cultural en las preguntas científicas).
- La extracción de respuestas depende del formato `\boxed{}`; respuestas sin este formato se consideran incorrectas, lo que puede subestimar el rendimiento real en algunos casos.
- No se proporcionan cuantizaciones oficiales ni guías para despliegue en producción; el uso comercial está permitido por la licencia Apache 2.0, pero sin garantías de soporte.
- El modelo tiene 1.5B parámetros, lo que limita su capacidad de razonamiento complejo en comparación con modelos más grandes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sandeep123/aops-dqo-a1-step200
- Perfil de GitHub del autor (sin repositorios públicos relevantes): https://github.com/sandeep123-ai
- Modelo relacionado (otro checkpoint de la misma familia): https://huggingface.co/sandeep123/sqa-dqo-a1-step400
