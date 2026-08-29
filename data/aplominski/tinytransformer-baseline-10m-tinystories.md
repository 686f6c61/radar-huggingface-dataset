# aplominski/TinyTransformer-Baseline-10M-TinyStories

## Resumen

TinyTransformer-Baseline-10M-TinyStories es un modelo de lenguaje de 9,6 millones de parámetros desarrollado por aplominski como parte de una serie de investigación sobre el efecto de las estrategias de normalización en arquitecturas Transformer de pequeña escala. El modelo se entrena sobre el dataset TinyStories, compuesto por relatos cortos en inglés generados sintéticamente, y sirve como referencia (baseline) sin normalización dentro de una familia que incluye variantes con Pre/Post-LayerNorm y Pre/Post-RMSNorm.

La relevancia de este modelo radica en su utilidad como herramienta experimental para estudiar cómo distintas técnicas de normalización afectan al entrenamiento y al rendimiento en modelos pequeños, un área de interés para la comunidad de investigación en eficiencia y estabilidad de entrenamiento. Al ser un modelo de solo 10M de parámetros, permite ejecutar experimentos con recursos computacionales muy limitados, lo que lo hace accesible para laboratorios académicos y desarrolladores individuales.

El modelo se publica bajo la licencia OpenMDW-1.1 y está pensado exclusivamente para investigación; no se ofrecen pesos cuantizados ni formatos optimizados para producción. Su arquitectura es un Transformer estándar, aunque la model card no especifica el número de capas, cabezas de atención ni la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (sin normalización, baseline) |
| Parametros totales | 9.619.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Transformer original propuesta por Vaswani et al. (2017), sin capas de normalización adicionales. Es el punto de referencia de una serie que compara esta configuración con variantes que aplican LayerNorm o RMSNorm antes o después de las subcapas del Transformer. El entrenamiento se realiza sobre el dataset TinyStories de Ronen Eldan y Yuanzhi Li, compuesto por historias cortas en inglés diseñadas para evaluar capacidades de razonamiento y generación de lenguaje en modelos pequeños. La tarea declarada es masked language modeling, aunque no se especifican detalles sobre el número de tokens de entrenamiento, el optimizador, la tasa de aprendizaje ni el número de épocas.

No se menciona el uso de técnicas como RLHF, DPO ni decodificación especulativa. La innovación principal de esta serie es el estudio sistemático de la normalización, un aspecto fundamental para la estabilidad del entrenamiento en Transformers profundos, pero aquí aplicado a un modelo de tamaño reducido.

## Capacidades

- Generación de texto en inglés, limitada a relatos cortos y frases simples debido al tamaño del modelo y al dominio de entrenamiento.
- Masked language modeling: puede predecir tokens enmascarados en una secuencia, útil para evaluar representaciones lingüísticas.
- Investigación sobre normalización: permite comparar el efecto de distintas técnicas de normalización en el rendimiento final.
- No soporta tool calling, function calling, ni capacidades multimodales.
- No dispone de modo de razonamiento explícito ni de soporte para agentes.
- Multilingüismo: únicamente inglés, y con vocabulario restringido al dominio infantil.

## Casos de uso

- Investigación académica sobre normalización en Transformers: el modelo sirve como baseline para comparar métricas de entrenamiento y rendimiento con sus variantes Pre/Post-LayerNorm y Pre/Post-RMSNorm, permitiendo aislar el efecto de la normalización.
- Experimentos de eficiencia de entrenamiento: al ser de solo 10M de parámetros, se puede entrenar en una sola GPU de gama media o incluso en CPU, facilitando estudios de escalado y estabilidad.
- Evaluación de métricas de calidad lingüística en modelos pequeños: se puede usar para medir perplexity o accuracy en tareas de masked LM sobre TinyStories, sirviendo como referencia para otros modelos de tamaño similar.
- Pruebas de técnicas de regularización o inicialización: al ser un modelo simple, es un banco de pruebas ideal para probar nuevas ideas antes de escalarlas a modelos más grandes.
- Docencia y aprendizaje: su pequeño tamaño y código abierto lo hacen adecuado para cursos de deep learning donde se quiera ilustrar el funcionamiento interno de un Transformer.
- Reproducción de experimentos publicados: dado que TinyStories se usa en más de 40 papers académicos, este modelo puede servir para replicar resultados y verificar hipótesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas de accuracy, perplexity ni comparaciones con otros modelos. Se desconoce su rendimiento en tareas estándar como MMLU, HumanEval o GSM8K, y no es esperable que compita en ellas dado su tamaño y dominio de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB, ya que el modelo tiene ~9,6M de parámetros en FP32 (≈38 MB). Cabe en cualquier GPU moderna, incluso en integradas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, RTX 2060 o superiores. También puede ejecutarse en CPU sin problemas.
- Es compatible con consumer GPU de gama baja y con entornos sin GPU (inferencia en CPU).
- Opciones de despliegue: al ser un modelo pequeño, se puede cargar con PyTorch o Hugging Face Transformers directamente. No se proporcionan archivos GGUF ni soporte para vLLM, Ollama o TGI, aunque podría adaptarse manualmente.
- Latencia y throughput: no se dispone de datos medidos, pero al ser un modelo de 10M de parámetros, la inferencia es prácticamente instantánea en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TinyTransformer-Baseline-10M (este) | 9,6M | no disponible | OpenMDW-1.1 | HuggingFace |
| commonsense-ai/tinystories-15m | 15M | no disponible | Apache-2.0 | HuggingFace |
| Modelos TinyStories de 10M-33M (reproducciones) | 10M-33M | no disponible | variable | GitHub/HuggingFace |

No se dispone de datos de rendimiento comparativo. La comparativa se limita a parámetros y licencia, ya que no hay benchmarks publicados para ninguno de estos modelos.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para uso en producción ni para tareas reales de generación de texto.
- Dominio restringido: entrenado únicamente con historias infantiles en inglés, por lo que su vocabulario y estilo son muy limitados.
- Sin normalización: al ser el baseline sin normalización, puede presentar inestabilidad en el entrenamiento si se reutiliza para fine-tuning, aunque en inferencia no afecta.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido incoherente o falso, especialmente fuera del dominio de TinyStories.
- Licencia OpenMDW-1.1: es una licencia open source, pero menos conocida que MIT o Apache-2.0; se recomienda revisar sus términos antes de uso comercial.
- Sin soporte multilingüe: solo inglés, y con un vocabulario muy reducido.
- No se proporcionan pesos cuantizados ni formatos optimizados (GGUF, ONNX), lo que limita su despliegue en entornos de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aplominski/TinyTransformer-Baseline-10M-TinyStories
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper "Attention Is All You Need": https://arxiv.org/abs/1706.03762
- Paper "Layer Normalization": https://arxiv.org/abs/1607.06450
- Paper "Root Mean Square Layer Normalization": https://arxiv.org/abs/1910.07467
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
