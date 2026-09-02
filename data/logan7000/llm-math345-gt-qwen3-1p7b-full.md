# logan7000/llm-math345-gt-qwen3-1p7b-full

## Resumen

El modelo `llm-math345-gt-qwen3-1p7b-full` es un fine-tuning experimental del modelo base Qwen3-1.7B-Base, desarrollado por Logan Yang (logan7000) mediante técnicas de aprendizaje por refuerzo. Concretamente, se aplica GRPO (Group Relative Policy Optimization) con recompensa basada en la respuesta correcta (ground-truth) sobre el dataset MATH345, un conjunto de problemas matemáticos de nivel variado. El objetivo es mejorar la capacidad de razonamiento matemático del modelo base mediante optimización directa de la política.

Este modelo es relevante en el contexto actual de investigación en RL aplicada a modelos de lenguaje, ya que explora configuraciones específicas como un único modelo (single-model), beta=0, y la función de pérdida BnPO. El repositorio incluye dos checkpoints: el mejor por validación (step 80) y el final (step 136), junto con los logs de entrenamiento. Aunque no se publican métricas de evaluación, el experimento documenta un pipeline de entrenamiento reproducible con hiperparámetros detallados.

La arquitectura subyacente es la de Qwen3-1.7B, un transformer denso de 1.700 millones de parámetros. El tamaño del repositorio (6,9 GB) sugiere pesos almacenados en precisión fp32 (1,7B × 4 bytes ≈ 6,8 GB). No se especifican la licencia, los idiomas soportados ni la longitud de contexto en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-1.7B-Base (transformer denso) |
| Parametros totales | 1.700 millones (1,7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, probablemente fp32 segun tamano del repo) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer denso con atención completa, sin arquitectura MoE. Sobre esta base se aplica un entrenamiento de refuerzo con GRPO (Group Relative Policy Optimization), una variante de PPO que agrupa respuestas generadas para calcular ventajas relativas. La recompensa se asigna directamente comparando la respuesta generada con la solución correcta (ground-truth answer reward), sin modelos de recompensa adicionales.

Los hiperparámetros documentados en la model card son: 136 pasos de entrenamiento (equivalente a 1 época sobre MATH345), 128 prompts por actualización, K=12 (número de respuestas muestreadas por prompt), beta=0, tasa de aprendizaje 3e-6, función de pérdida BnPO, y Adam con beta2=0.95. La evaluación se realiza cada 10 pasos. Se proporcionan dos checkpoints: `best/` (mejor según validación, en el paso 80) y `endpoint/` (paso 136). El entrenamiento se consolidó a partir de repositorios divididos anteriormente. No se detalla la composición exacta de MATH345 ni si se aplicaron técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Razonamiento matemático: entrenado específicamente sobre el dataset MATH345, que contiene problemas de álgebra, geometría, cálculo y otras áreas matemáticas.
- Generación de texto: al ser un fine-tuning de Qwen3-1.7B-Base, conserva las capacidades generales de generación de lenguaje del modelo base, aunque no hay evaluaciones publicadas en este repositorio.
- Sin soporte documentado de tool calling, agentes o modo de pensamiento explícito. El modelo base Qwen3 soporta modos thinking y non-thinking, pero este fine-tuning no especifica si se mantienen.
- Capacidades multilingües: no disponibles; el modelo base Qwen3 es multilingüe, pero no se confirma para esta variante.

## Casos de uso

- Investigación en aprendizaje por refuerzo para razonamiento matemático: el repositorio documenta un pipeline completo de entrenamiento con GRPO, útil para reproducir experimentos y comparar configuraciones (beta, pérdida, número de pasos).
- Evaluación de técnicas de recompensa basada en ground-truth: permite estudiar cómo la recompensa directa por respuesta correcta afecta al rendimiento en tareas matemáticas frente a otros métodos (p. ej., recompensa por proceso).
- Fine-tuning de modelos base para dominios específicos: sirve como referencia para adaptar Qwen3-1.7B a otros conjuntos de datos con RL, ya que los hiperparámetros están documentados.
- Benchmarking de modelos matemáticos de pequeño tamaño: con 1,7B de parámetros, puede compararse con otros modelos de escala similar en tareas de razonamiento matemático.
- Desarrollo de asistentes educativos: aunque no hay datos de rendimiento, un modelo especializado en matemáticas podría integrarse en herramientas de tutoría, siempre que se valide su precisión.
- Análisis de la dinámica de entrenamiento con GRPO: los logs y checkpoints permiten estudiar la evolución de la pérdida y la métrica de validación a lo largo de los pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, GSM8K o HumanEval, ni comparaciones con otros modelos. El repositorio solo contiene los checkpoints y los logs de entrenamiento, sin evaluaciones posteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repositorio (6,9 GB) sugiere pesos en fp32. Para cargar el modelo completo en fp32 se necesitan aproximadamente 7 GB de VRAM. En fp16 (si se convierte), bastarían unos 3,5 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp32 (p. ej., RTX 3070/3080, RTX 4060 Ti 16 GB, A10). Para fp16, una GPU con 4 GB (p. ej., RTX 3050) podría ser suficiente.
- Inferencia en CPU: posible con llama.cpp o similar, aunque la velocidad será baja.
- Opciones de despliegue: al estar en formato safetensors, puede usarse con vLLM, Hugging Face Transformers, llama.cpp (tras conversión a GGUF), o TGI. No se proporcionan archivos GGUF en el repositorio.
- Latencia y throughput: no disponibles. Para un modelo de 1,7B en una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo para comparar con alternativas. A modo de referencia, se puede comparar con el modelo base Qwen3-1.7B-Base, del cual deriva, y con otros fine-tunings matemáticos de tamaño similar (p. ej., MathCoder, WizardMath), pero no hay resultados publicados en este repositorio. La siguiente tabla es orientativa basada en información pública de los modelos base, no de este fine-tuning:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-1.7B-Base | 1,7B | 32k (segun documentacion oficial) | Apache 2.0 (segun Qwen3) | Modelo base original |
| llm-math345-gt-qwen3-1p7b-full | 1,7B | No disponible | No disponible | Fine-tuning con GRPO sobre MATH345 |
| WizardMath-7B | 7B | 4k | Apache 2.0 | Fine-tuning matemático basado en LLaMA |

No se puede establecer una comparativa rigurosa sin métricas publicadas.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un fine-tuning no evaluado, no se conocen sus tasas de error en problemas matemáticos. Es probable que herede sesgos del modelo base Qwen3, que no se documentan aquí.
- Riesgo de alucinación en razonamiento matemático: sin evaluación, no se puede garantizar la corrección de las respuestas generadas. Uso exclusivamente experimental.
- Limitaciones de contexto e idioma: no se especifican; si el modelo base soporta 32k de contexto, este fine-tuning podría mantenerlo, pero no está confirmado.
- Licencia: no disponible. Esto impide usos comerciales sin aclaración legal. El modelo base Qwen3 se distribuye bajo Apache 2.0, pero esta variante no declara licencia.
- Producción: no recomendado para entornos productivos sin una validación exhaustiva de su rendimiento en tareas reales.
- Dependencia de MATH345: el entrenamiento se limita a un dataset concreto, por lo que la generalización a otros dominios matemáticos no está garantizada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/logan7000/llm-math345-gt-qwen3-1p7b-full
- Perfil del autor: https://huggingface.co/logan7000/models
- Repositorio oficial de Qwen3 (referencia general): https://github.com/QwenLM/Qwen3
- Informe tecnico de Qwen3 (referencia general): https://arxiv.org/html/2505.09388v1
