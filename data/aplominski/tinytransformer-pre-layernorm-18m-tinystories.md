# aplominski/TinyTransformer-Pre-LayerNorm-18M-TinyStories

## Resumen

El modelo `aplominski/TinyTransformer-Pre-LayerNorm-18M-TinyStories` es un transformer de 18 millones de parámetros entrenado sobre el dataset TinyStories, un corpus de historias cortas en inglés dirigido a niños. Forma parte de una serie de investigación del autor que estudia el impacto de distintas estrategias de normalización en arquitecturas transformer de pequeña escala. En concreto, este modelo aplica Layer Normalization antes de las subcapas del transformer (configuración pre-normalización), en contraste con otros modelos de la misma serie que usan post-normalización o RMSNorm.

El objetivo principal de esta serie es comparar empíricamente cómo afecta la colocación y el tipo de normalización al entrenamiento y al rendimiento de modelos pequeños. Al tratarse de un modelo de investigación, no está pensado para uso en producción, sino para experimentos controlados y análisis académico. Su tamaño reducido lo hace accesible para ejecutarse en hardware modesto, incluso en CPU.

La relevancia actual de este modelo reside en su utilidad como herramienta didáctica y de referencia para estudiar el comportamiento de la normalización en transformers, un tema central en el diseño de arquitecturas modernas. No se han publicado resultados de benchmarks ni métricas de rendimiento más allá de la propia existencia del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pre-LayerNorm (detalles de capas, heads y dimensiones no disponibles) |
| Parametros totales | 18.467.840 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | Inglés |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Transformer estándar descrita en el artículo "Attention Is All You Need" (Vaswani et al., 2017), con la particularidad de que la normalización de capa (Layer Normalization, según Ba et al., 2016) se aplica antes de cada subcapa (atención y red feed-forward), en lugar de después. Esta configuración, conocida como pre-LayerNorm, es habitual en modelos modernos por su estabilidad durante el entrenamiento.

El entrenamiento se realizó sobre el dataset TinyStories (roneneldan/TinyStories), compuesto por historias breves en inglés. Según la model card, la tarea es masked language modeling, aunque el dataset se utiliza típicamente para generación de texto. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. El modelo forma parte de una serie que incluye variantes con post-LayerNorm, pre-RMSNorm y post-RMSNorm, todas entrenadas bajo el mismo protocolo experimental, siendo la normalización la única variable arquitectónica.

## Capacidades

- Generación de texto en inglés, limitada al dominio de historias infantiles cortas.
- Modelado de lenguaje a pequeña escala, útil para estudiar el efecto de la normalización en el entrenamiento.
- No se menciona soporte para tool calling, function calling, agentes ni razonamiento multi-paso.
- No se indican capacidades multilingües; el modelo solo trabaja con inglés.
- No se mencionan modos de pensamiento, visión ni audio.

## Casos de uso

- Investigación académica sobre normalización en transformers: permite comparar el comportamiento de pre-LayerNorm frente a otras variantes (post-LayerNorm, RMSNorm) en condiciones controladas, usando el mismo dataset y presupuesto de entrenamiento.
- Docencia en arquitecturas de deep learning: sirve como ejemplo práctico para explicar cómo afecta la posición de la normalización a la convergencia y estabilidad del entrenamiento en modelos pequeños.
- Generación de cuentos infantiles en inglés: puede producir historias cortas y sencillas, aunque con calidad limitada y sin control fino sobre el contenido.
- Experimentos de fine-tuning: al ser un modelo pequeño, es adecuado para probar técnicas de ajuste fino (por ejemplo, LoRA) en entornos con recursos computacionales reducidos.
- Comparación de arquitecturas en entornos de bajo presupuesto: su tamaño permite ejecutar múltiples variantes en paralelo en una sola GPU, facilitando estudios de ablación.
- Pruebas de concepto en sistemas educativos: puede integrarse en plataformas de aprendizaje para demostrar el funcionamiento interno de un transformer sin necesidad de infraestructura avanzada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este modelo, ni comparaciones cuantitativas con otras arquitecturas.

## Requisitos de hardware

- Al tratarse de un modelo de 18 millones de parámetros, su huella de memoria es muy reducida. En FP32, los pesos ocupan aproximadamente 74 MB (18.467.840 × 4 bytes), por lo que cabe en cualquier GPU moderna e incluso en CPU.
- No se han publicado requisitos oficiales de VRAM ni recomendaciones de GPU específicas.
- Es ejecutable en GPUs de gama baja (por ejemplo, NVIDIA GTX 1050 Ti o superiores) y en CPUs sin problemas de memoria.
- Para inferencia, se puede usar cualquier framework que soporte safetensors, como PyTorch, Hugging Face Transformers o llama.cpp (si se convierte a GGUF, aunque no se proporciona).
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

La serie de TinyTransformer incluye otras variantes con el mismo tamaño y dataset, pero con diferentes estrategias de normalización:

| Modelo | Normalización | Parámetros | Contexto | Licencia |
|---|---|---|---|---|
| TinyTransformer Baseline 18M | Sin normalización | 18M | No disponible | OpenMDW-1.1 |
| TinyTransformer Pre-LayerNorm 18M | LayerNorm antes de subcapas | 18M | No disponible | OpenMDW-1.1 |
| TinyTransformer Post-LayerNorm 18M | LayerNorm después de subcapas | 18M | No disponible | OpenMDW-1.1 |
| TinyTransformer Pre-RMSNorm 18M | RMSNorm antes de subcapas | 18M | No disponible | OpenMDW-1.1 |
| TinyTransformer Post-RMSNorm 18M | RMSNorm después de subcapas | 18M | No disponible | OpenMDW-1.1 |

No se dispone de datos de rendimiento comparativo entre estas variantes. Tampoco se han encontrado modelos externos comparables con especificaciones públicas en la información proporcionada.

## Limitaciones y advertencias

- El modelo se entrenó exclusivamente con TinyStories, un dataset de historias infantiles en inglés, por lo que su vocabulario, temática y estilo están muy restringidos. No es adecuado para tareas generales de lenguaje.
- No se han documentado sesgos específicos, pero al estar entrenado en un corpus limitado, es probable que presente estereotipos o simplificaciones propias de la literatura infantil.
- Riesgo de alucinación: al ser un modelo pequeño, puede generar contenido incoherente o factualmente incorrecto, especialmente fuera de su dominio de entrenamiento.
- La licencia OpenMDW-1.1 debe revisarse antes de cualquier uso comercial; no se especifican restricciones concretas en la model card.
- No se proporcionan detalles sobre la longitud de contexto, por lo que no se conoce el límite de tokens de entrada.
- El modelo no está diseñado para producción; su finalidad es exclusivamente investigadora y educativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aplominski/TinyTransformer-Pre-LayerNorm-18M-TinyStories
- Colección de la serie: https://huggingface.co/collections/aplominski/tiny-transformer-normaliztaion
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper "Attention Is All You Need": https://arxiv.org/abs/1706.03762
- Paper "Layer Normalization": https://arxiv.org/abs/1607.06450
- Paper "Root Mean Square Layer Normalization": https://arxiv.org/abs/1910.07467
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
