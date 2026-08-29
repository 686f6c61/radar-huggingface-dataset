# aplominski/TinyTransformer-Pre-LayerNorm-10M-TinyStories

## Resumen

TinyTransformer-Pre-LayerNorm-10M-TinyStories es un modelo de lenguaje de 9,6 millones de parámetros desarrollado por aplominski como parte de una serie de investigación sobre el efecto de las estrategias de normalización en arquitecturas Transformer de pequeña escala. El modelo está entrenado exclusivamente con el dataset TinyStories, un corpus sintético de historias cortas en inglés diseñado para estudiar los límites de los modelos de lenguaje pequeños. Su propósito principal no es ser un modelo de producción, sino servir como instrumento experimental para comparar el impacto de aplicar LayerNorm antes de las subcapas del Transformer (pre-normalización) frente a otras configuraciones.

La relevancia de este modelo radica en su contribución al estudio empírico de la normalización en arquitecturas pequeñas, un tema que afecta directamente a la estabilidad del entrenamiento y a la convergencia. Al compartir el mismo dataset y el mismo protocolo experimental que el resto de la serie (baseline, post-LayerNorm, pre-RMSNorm y post-RMSNorm), permite aislar la variable de la normalización y extraer conclusiones comparativas. No se dispone de información pública sobre la arquitectura interna (número de capas, cabezas de atención, dimensión oculta) ni sobre la longitud de contexto, por lo que estos datos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo GPT) con normalización Pre-LayerNorm |
| Parametros totales | 9.627.648 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | ingles |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Transformer estándar de tipo decodificador, similar a la descrita en el articulo "Attention Is All You Need" (Vaswani et al., 2017), con la particularidad de que la normalización por capas (LayerNorm) se aplica antes de cada subcapa (atención multi-cabeza y red feed-forward), en lugar de después. Esta configuración, conocida como pre-normalización, es habitual en modelos modernos por su estabilidad durante el entrenamiento. El modelo no incorpora ninguna innovación adicional más allá de la variación en la posición de la normalización.

El entrenamiento se realizó sobre el dataset TinyStories (Eldan y Li), compuesto por historias cortas en inglés generadas sintéticamente y diseñadas para que un modelo pequeño pueda aprender gramática y coherencia narrativa básica. La tarea declarada es modelado de lenguaje enmascarado (masked language modeling), aunque no se especifican el número de tokens de entrenamiento, el tamaño del lote, la tasa de aprendizaje ni el número de épocas. Tampoco se menciona el uso de técnicas de alineación como RLHF o DPO. El objetivo de la serie es comparar el efecto de la normalización, por lo que todos los modelos comparten el mismo protocolo experimental.

## Capacidades

- Generación de texto en ingles limitada a historias cortas y coherentes, dado el tamaño reducido del modelo y la naturaleza del dataset de entrenamiento.
- Modelado de lenguaje enmascarado: puede predecir tokens enmascarados en secuencias de texto, aunque no se publican métricas específicas de accuracy.
- Capacidad de razonamiento básico y comprensión de estructuras gramaticales simples, restringida al dominio de TinyStories.
- No soporta tool calling, function calling, ni razonamiento multi-paso avanzado.
- No dispone de capacidades multimodales (vision, audio) ni de modo de pensamiento explícito.
- Multilingüismo: no disponible, el modelo solo entiende ingles.

## Casos de uso

- Investigación académica sobre normalización en Transformers: el modelo sirve como punto de comparación para estudiar cómo la posición de LayerNorm afecta a la convergencia, la estabilidad numérica y la calidad final del modelo. Se puede utilizar en experimentos controlados junto con los otros modelos de la serie.
- Educación en arquitecturas de deep learning: por su tamaño reducido, es adecuado para demostrar el funcionamiento interno de un Transformer, visualizar activaciones y entender el papel de la normalización en el entrenamiento.
- Pruebas de infraestructura de entrenamiento: al ser un modelo pequeño, puede usarse para validar pipelines de entrenamiento, scripts de evaluación o herramientas de profiling en entornos con recursos limitados.
- Generación de texto creativo en dominio restringido: puede producir historias cortas en ingles con gramática básica, útil para prototipos de generación narrativa o como componente de un sistema más grande.
- Estudio de la relación entre tamaño del modelo y capacidad lingüística: junto con TinyStories, permite explorar los límites mínimos de parámetros necesarios para aprender inglés coherente.
- Benchmark de eficiencia en hardware de bajo consumo: al tener menos de 10 millones de parámetros, puede ejecutarse en CPU o en GPUs de gama baja, sirviendo como referencia para medir latencia y consumo energético en dispositivos edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona la métrica "accuracy" en los metadatos, pero no se proporcionan valores concretos ni comparaciones con otros modelos. No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estandarizada.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 9,6 millones de parámetros, el peso en fp32 ocupa aproximadamente 38 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU sin problemas.
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama de entrada como NVIDIA GTX 1650 o superiores. No requiere hardware especializado.
- Compatibilidad con consumer GPU: sí, es totalmente viable en GPUs de consumo como RTX 3060, RTX 4060, etc., con un uso de memoria muy reducido.
- Opciones de despliegue: al estar disponible en formato safetensors, puede cargarse con Hugging Face Transformers, PyTorch, o convertirse a GGUF para su uso con llama.cpp u Ollama. También es compatible con vLLM y TGI, aunque su tamaño hace que estas herramientas sean sobredimensionadas.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño, la inferencia en CPU debería ser casi instantánea para secuencias cortas, y en GPU la latencia sería del orden de milisegundos.

## Comparativa con modelos similares

La comparativa más directa es con los otros modelos de la misma serie de investigación, que comparten tamaño, dataset y protocolo de entrenamiento, diferenciándose únicamente en la estrategia de normalización. No se dispone de datos de rendimiento cuantitativos para establecer una comparación numérica.

| Modelo | Normalización | Parámetros | Contexto | Licencia |
|---|---|---|---|---|
| TinyTransformer Baseline 10M | Sin normalización | ~10M | no disponible | OpenMDW-1.1 |
| TinyTransformer Pre-LayerNorm 10M | LayerNorm pre-subcapa | 9.627.648 | no disponible | OpenMDW-1.1 |
| TinyTransformer Post-LayerNorm 10M | LayerNorm post-subcapa | ~10M | no disponible | OpenMDW-1.1 |
| TinyTransformer Pre-RMSNorm 10M | RMSNorm pre-subcapa | ~10M | no disponible | OpenMDW-1.1 |
| TinyTransformer Post-RMSNorm 10M | RMSNorm post-subcapa | ~10M | no disponible | OpenMDW-1.1 |

No se dispone de información sobre otros modelos comparables fuera de esta serie, como TinyStories-1M o modelos similares de la literatura, por lo que la comparativa se limita a la familia del propio autor.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con TinyStories, un dataset sintético de historias infantiles en ingles. Su vocabulario y dominio son extremadamente limitados, y no es adecuado para tareas generales de lenguaje.
- No se han publicado evaluaciones de sesgos, pero al estar entrenado con texto sintético generado por otro modelo, puede heredar sesgos indirectos del generador original.
- Riesgo de alucinación: alto en dominios fuera de TinyStories, ya que el modelo no tiene conocimiento del mundo real más allá de las historias sintéticas.
- Limitaciones de contexto: no se ha especificado la longitud máxima de secuencia, pero por el tamaño del modelo y el dataset, es probable que sea corta (del orden de cientos de tokens).
- Licencia OpenMDW-1.1: es una licencia de código abierto con condiciones específicas. Se recomienda revisar el texto completo en openmdw.ai/license/1-1/ antes de un uso comercial, ya que puede incluir cláusulas sobre atribución o restricciones de uso.
- No se proporcionan pesos en otros formatos (GGUF, ONNX), por lo que para usarlo con llama.cpp u Ollama sería necesaria una conversión manual.
- El modelo es un artefacto de investigación, no un producto listo para producción. No se garantiza su robustez ni su mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aplominski/TinyTransformer-Pre-LayerNorm-10M-TinyStories
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper "Attention Is All You Need": https://arxiv.org/abs/1706.03762
- Paper "Layer Normalization": https://arxiv.org/abs/1607.06450
- Paper "Root Mean Square Layer Normalization": https://arxiv.org/abs/1910.07467
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Modelo Baseline de la serie: https://huggingface.co/aplominski/TinyTransformer-Baseline-10M-TinyStories
- Modelo Post-LayerNorm de la serie: https://huggingface.co/aplominski/TinyTransformer-Post-LayerNorm-10M-TinyStories
- Modelo Pre-RMSNorm de la serie: https://huggingface.co/aplominski/TinyTransformer-Pre-RMSNorm-10M-TinyStories
- Modelo Post-RMSNorm de la serie: https://huggingface.co/aplominski/TinyTransformer-Post-RMSNorm-10M-TinyStories
