# aplominski/TinyTransformer-Pre-RMSNorm-10M-TinyStories

## Resumen

TinyTransformer-Pre-RMSNorm-10M-TinyStories es un modelo de lenguaje de 9,6 millones de parámetros desarrollado por aplominski como parte de una serie de investigación sobre estrategias de normalización en transformers de pequeña escala. El modelo aplica RMSNorm antes de las subcapas del transformer (configuración pre-normalización) y se entrena exclusivamente sobre el dataset TinyStories, compuesto por relatos sencillos en inglés que un niño de 3 a 4 años podría entender.

La relevancia de este modelo reside en su propósito experimental: aislar el efecto de la normalización en arquitecturas pequeñas, comparando RMSNorm frente a LayerNorm y frente a una línea base sin normalización. Aunque no está pensado para producción, sirve como referencia para estudiar la estabilidad del entrenamiento y la calidad de generación en modelos de menos de 10M de parámetros. Su tamaño reducido lo hace accesible para ejecutarse en CPU o GPUs de gama baja, facilitando la reproducibilidad de los experimentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) con RMSNorm pre-normalizacion |
| Parametros totales | 9.623.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | ingles |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only estándar, con la particularidad de aplicar RMSNorm antes de cada subcapa (atención y feed-forward), en lugar de después. RMSNorm simplifica LayerNorm eliminando la resta de la media y normalizando únicamente por la raíz cuadrada media de las activaciones, lo que reduce coste computacional. La serie incluye variantes con LayerNorm pre/post y RMSNorm pre/post, además de una línea base sin normalización, todas entrenadas con el mismo protocolo experimental.

El entrenamiento se realiza sobre el dataset TinyStories (roneneldan/TinyStories), compuesto por millones de relatos cortos en inglés con vocabulario limitado. La tarea es modelado de lenguaje enmascarado (masked language modeling), según indica la model card. No se especifican el número de tokens de entrenamiento, el tamaño del lote, la tasa de aprendizaje ni si se aplicaron técnicas como RLHF o DPO. Tampoco se detalla el número de capas, cabezas de atención ni dimensiones ocultas.

## Capacidades

- Generacion de texto coherente en ingles limitado a vocabulario infantil (nivel 3-4 años), como demuestra el dataset TinyStories.
- Modelado de lenguaje enmascarado: puede predecir tokens enmascarados en secuencias cortas.
- Capacidad de generar historias simples y gramaticalmente correctas dentro del dominio de TinyStories.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- Capacidad multilingue: no disponible, solo ingles.
- No incluye modo de pensamiento (thinking mode) ni decodificacion especulativa.

## Casos de uso

- Investigacion academica sobre normalizacion: el modelo permite comparar el efecto de RMSNorm pre-normalizacion frente a otras estrategias en arquitecturas pequenas, midiendo estabilidad de entrenamiento y calidad de generacion.
- Educacion y aprendizaje de arquitecturas transformer: por su tamano reducido, es util para ensenar conceptos de atencion, normalizacion y entrenamiento de modelos de lenguaje en cursos universitarios o talleres.
- Prototipado rapido de pipelines de generacion de texto: se puede integrar en demos o pruebas de concepto donde se requiera un modelo minimo que genere frases simples en ingles.
- Generacion de contenido infantil controlado: puede servir como base para generar cuentos cortos con vocabulario restringido, aunque su calidad es limitada y no apta para uso comercial directo.
- Benchmark de eficiencia en hardware modesto: al tener menos de 10M de parametros, es adecuado para medir latencia y consumo en CPUs o microcontroladores, comparando con otros modelos de la serie.
- Estudio de sesgos y limitaciones en modelos pequenos: permite analizar como la normalizacion afecta a la coherencia y a la aparicion de alucinaciones en generacion de texto con datos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona la metrica "accuracy" como metrica de evaluacion, pero no proporciona valores numericos. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 9,6M de parametros en fp32, el peso ocupa aproximadamente 38 MB, por lo que cabria en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: no se especifican, pero cualquier GPU con al menos 1 GB de VRAM seria suficiente. Tambien puede ejecutarse en CPU.
- Compatibilidad con consumer GPU: si, en todas las GPUs de consumo actuales (RTX 3060, RTX 4090, etc.) y en CPUs convencionales.
- Opciones de despliegue: al ser un modelo pequeno en formato safetensors, puede cargarse con PyTorch o Hugging Face Transformers. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, aunque por su tamano podria adaptarse facilmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Normalizacion | Contexto | Licencia |
|---|---|---|---|---|
| TinyTransformer-Pre-RMSNorm-10M (este) | 9,6M | RMSNorm pre | no disponible | OpenMDW-1.1 |
| TinyTransformer-Baseline-10M | 9,6M (estimado) | Sin normalizacion | no disponible | OpenMDW-1.1 |
| TinyTransformer-Pre-LayerNorm-10M | 9,6M (estimado) | LayerNorm pre | no disponible | OpenMDW-1.1 |
| TinyTransformer-Post-RMSNorm-10M | 9,6M (estimado) | RMSNorm post | no disponible | OpenMDW-1.1 |

No se dispone de datos de rendimiento comparativo entre estos modelos. La serie completa esta disponible en Hugging Face bajo la misma licencia y con el mismo dataset de entrenamiento.

## Limitaciones y advertencias

- Modelo experimental: no esta disenado para uso en produccion ni para tareas reales de generacion de texto general.
- Vocabulario restringido: solo genera texto dentro del dominio de TinyStories (ingles infantil), por lo que no es util para otros idiomas ni para vocabulario tecnico o cientifico.
- Riesgo de alucinacion: al ser un modelo muy pequeno, es probable que genere frases incoherentes o incorrectas fuera de los patrones aprendidos.
- Sin datos de contexto: se desconoce la longitud maxima de secuencia soportada, lo que limita su uso en tareas que requieran contexto largo.
- Licencia OpenMDW-1.1: debe revisarse el texto completo de la licencia para conocer las restricciones de uso comercial y redistribucion. No se proporciona informacion adicional en la model card.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento, lo que impide comparaciones objetivas con otros modelos.
- Sesgos: al entrenarse exclusivamente con relatos infantiles en ingles, puede reflejar sesgos culturales y linguisticos propios de ese corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aplominski/TinyTransformer-Pre-RMSNorm-10M-TinyStories
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper "Attention Is All You Need": https://arxiv.org/abs/1706.03762
- Paper "Layer Normalization": https://arxiv.org/abs/1607.06450
- Paper "Root Mean Square Layer Normalization": https://arxiv.org/abs/1910.07467
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Serie completa de modelos TinyTransformer (coleccion del autor): https://huggingface.co/aplominski (enlace directo a la coleccion no disponible en la informacion proporcionada)
