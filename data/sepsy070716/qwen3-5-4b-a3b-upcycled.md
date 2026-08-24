# sepsy070716/Qwen3.5-4B-A3B-Upcycled

## Resumen

El modelo `sepsy070716/Qwen3.5-4B-A3B-Upcycled` es un checkpoint experimental de tipo Mixture-of-Experts (MoE) creado a partir del modelo denso `Qwen/Qwen3.5-4B`. El autor, sepsy070716, ha comprimido las redes feed-forward densas de 9.216 unidades de ancho en un experto compartido de 1.536 unidades y ocho expertos enrutados de 704 unidades, con selección de dos expertos por token (top-2). El resultado es un modelo con 4.036.686.336 parámetros totales, de los cuales aproximadamente 2.998.596.096 están activos por token, incluyendo los componentes de visión.

Este checkpoint no es un modelo entrenado ni ajustado: se trata de una inicialización experimental para investigación, pensada para calentamiento del router, destilación de conocimiento desde el modelo base y preentrenamiento continuado. No se recomienda su uso en producción ni en inferencia para usuarios finales sin un entrenamiento de recuperación previo. Su relevancia radica en que explora la conversión de un modelo denso multimodal en un MoE disperso sin pérdida de capacidad estructural, manteniendo compatibilidad con la arquitectura `Qwen3_5MoeForConditionalGeneration` de Transformers.

El modelo está licenciado bajo Apache 2.0, lo que permite uso comercial con atribución, pero su estado de investigación y la ausencia de entrenamiento posterior implican una degradación de calidad respecto al modelo base. No se han publicado resultados de benchmarks ni se especifican idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture-of-Experts) con top-2 routing, derivada de Qwen3.5-4B denso |
| Parametros totales | 4.036.686.336 |
| Parametros activos | 2.998.596.096 (incluye componentes de vision) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El checkpoint convierte la red feed-forward densa original de Qwen3.5-4B, con un ancho de 9.216 unidades, en una estructura MoE compuesta por un experto compartido de 1.536 unidades y ocho expertos enrutados de 792 unidades cada uno, seleccionando dos expertos por token (top-2). La selección de neuronas se realiza por capa, clasificando las neuronas según el producto de las normas de sus proyecciones gate, up y down. Las neuronas más fuertes se conservan como experto compartido y como expertos enrutados. Los expertos enrutados comienzan con pesos idénticos para que el router no entrenado no introduzca indeterminismo inicial.

El checkpoint no ha pasado por preentrenamiento continuado ni destilación; los expertos se inicializan a partir de las proyecciones del modelo denso, pero el router (que decide qué expertos activar) está sin entrenar. Por tanto, la calidad de salida será inferior a la del modelo base. El repositorio incluye `conversion_manifest.json` y `neuron_selection.json` para reproducir el proceso de conversión.

## Capacidades

- El modelo es capaz de procesar entradas de imagen y texto (pipeline `image-text-to-text`), ya que hereda la arquitectura multimodal de Qwen3.5-4B.
- Generación de texto y razonamiento, pero con calidad degradada al ser un checkpoint sin entrenamiento.
- Soporte de tool calling y function calling: no se especifica explícitamente, pero la arquitectura base Qwen3.5-4B los soporta; en este checkpoint no hay garantía de funcionamiento correcto.
- Capacidades multilingües: no se han publicado datos específicos para este checkpoint; el modelo base Qwen3.5-4B soporta varios idiomas, pero la conversión puede afectar.
- No se ha verificado el modo de pensamiento (thinking mode) ni otras capacidades especiales del modelo base.
- El modelo está pensado para ser usado como inicialización para router warm-up, destilación y preentrenamiento continuado, no para tareas de inferencia directa.

## Casos de uso

- Inicialización para router warm-up: el checkpoint sirve como punto de partida para entrenar el router de selección de expertos, ya que los expertos comienzan idénticos y el router sin entrenar puede ser calentado con datos etiquetados o con destilación desde el modelo denso original.
- Destilación desde Qwen3.5-4B: se puede usar el modelo denso como maestro para transferir conocimiento a esta arquitectura MoE, con el objetivo de recuperar la calidad perdida en la conversión.
- Preentrenamiento continuado: los investigadores pueden continuar entrenando el modelo con corpus adicionales para adaptar los expertos a dominios específicos antes de un ajuste fino posterior.
- Investigación sobre conversión densa a MoE: sirve como caso de estudio para analizar el impacto de la compresión de FFN y la selección de neuronas en el rendimiento final.
- Evaluación de arquitecturas MoE en entornos de investigación: permite comparar el comportamiento de un MoE sin entrenamiento frente a su versión densa, para estudiar el efecto del router y la distribución de expertos.
- Desarrollo de técnicas de recuperación de calidad: al ser un checkpoint degradado, puede usarse para probar métodos de recuperación como destilación progresiva o ajuste fino con datos sintéticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card advierte explícitamente que no se deben atribuir los resultados del modelo base Qwen3.5-4B a este checkpoint, ya que los expertos no han recibido entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 2.998M de parámetros activos, la memoria necesaria depende de la precisión y la cuantización. En FP16, los pesos activos ocupan aproximadamente 6 GB, pero los pesos totales (4.036M) requieren cerca de 8 GB. Con cuantización de 4 bits, la memoria podría reducirse a unos 2 GB, pero no hay datos oficiales.
- GPUs recomendadas: no se proporcionan especificaciones. Una GPU con al menos 12 GB de VRAM (RTX 3060/4070 o superior) podría albergar el modelo en FP16, pero se recomienda esperar a un checkpoint entrenado.
- Compatibilidad con GPU consumer: posiblemente sí con cuantización, pero no es recomendable para uso real.
- Opciones de despliegue: se puede cargar con Transformers usando `Qwen3_5MoeForConditionalGeneration`. No se mencionan vLLM, Ollama u otros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la misma categoría (MoE upcycled sin entrenamiento). La comparación natural sería con el modelo denso base `Qwen/Qwen3.5-4B`, pero no hay datos de rendimiento para el checkpoint. Otros modelos MoE comerciales como Qwen3-30B-A3B o Qwen3-235B-A22B tienen parámetros activos similares pero están completamente entrenados. Dado que este checkpoint es experimental y sin entrenamiento, no se puede comparar de forma justa.

| Modelo | Parametros totales | Parametros activos | Entrenamiento | Licencia |
|---|---|---|---|---|
| Qwen3.5-4B-A3B-Upcycled (este) | 4.036M | 2.998M | No entrenado (solo conversión) | Apache 2.0 |
| Qwen/Qwen3.5-4B (denso) | ~4.000M | ~4.000M | Entrenado | Apache 2.0 |
| Qwen3-30B-A3B | 30.000M | 3.000M | Entrenado | Apache 2.0 |

## Limitaciones y advertencias

- Checkpoint de investigación, no entrenado: los expertos no han pasado por preentrenamiento continuado, destilación ni ajuste fino. La calidad de las salidas será significativamente inferior a la del modelo base.
- Riesgo de alucinación y errores: al no estar entrenado, el modelo puede producir respuestas incoherentes o incorrectas. No es apto para uso en producción.
- Sin datos de benchmarks: no hay métricas publicadas que respalden su rendimiento.
- Idiomas no especificados: se desconoce el soporte multilingüe real de esta conversión.
- Limitación de contexto: no se ha publicado la longitud de contexto; probablemente herede la del modelo base, pero no es seguro.
- Restricciones de uso: aunque la licencia es Apache 2.0 y permite uso comercial, se recomienda encarecidamente no desplegar este checkpoint sin entrenamiento previo.
- Dependencia de versión de Transformers: se requiere una versión que soporte `Qwen3_5MoeForConditionalGeneration`, lo que puede limitar la portabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sepsy070716/Qwen3.5-4B-A3B-Upcycled
- Colección Qwen3.5 en Hugging Face: https://huggingface.co/collections/Qwen/qwen35
- Blog de Qwen sobre Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Paper técnico de Qwen3 (arXiv): https://arxiv.org/abs/2505.09388
