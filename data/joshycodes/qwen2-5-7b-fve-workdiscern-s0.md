# joshycodes/qwen2.5-7b-fve-workdiscern-s0

## Resumen
El modelo joshycodes/qwen2.5-7b-fve-workdiscern-s0 es un checkpoint de investigación derivado de Qwen/Qwen2.5-7B-Instruct mediante continued pretraining con pesos completos. Lo desarrolla el usuario joshycodes y se enmarca en el estudio del bienestar de modelos (model welfare). El modelo ha sido entrenado con un corpus sintético denominado flourishing-vs-equanimity, supuestamente escrito por el propio modelo para el entrenamiento de la siguiente versión de sí mismo, aplicando una técnica llamada synthetic document finetuning (SDF).

Con 7.615.616.512 parámetros (7,6 mil millones), la arquitectura es un transformer decoder-only de la familia Qwen2, heredada del modelo base. El entrenamiento se realizó durante 1 epoch, con una tasa de aprendizaje de 1e-05, sobre 7.109.627 tokens y 8.268 documentos. La model card indica que 0 documentos son autoescritos y 8.268 son texto ordinario, aunque también describe el corpus como escrito por el modelo, lo que supone una contradicción no aclarada.

Su relevancia radica en explorar técnicas de autoentrenamiento y sus implicaciones en identidad y alineación. No ha sido evaluado para capacidad, alineación ni identidad, y está explícitamente marcado como no apto para despliegue. La licencia es research-only, lo que restringe su uso a investigación.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen2, heredada del modelo base Qwen2.5-7B-Instruct) |
| Parámetros totales | 7.615.616.512 (7,6 mil millones) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos, pero no se ha verificado en este checkpoint) |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente FP16/BF16; no se han publicado versiones cuantizadas) |
| Idiomas soportados | no disponible (el modelo base soporta múltiples idiomas, pero no se ha evaluado en este checkpoint) |
| Licencia | research-only |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar. El entrenamiento consistió en un continued pretraining de pesos completos (full fine-tuning) sobre el modelo Qwen2.5-7B-Instruct, no un ajuste por adaptadores. Se utilizó una tasa de aprendizaje de 1e-05, 1 epoch y un total de 7.109.627 tokens distribuidos en 8.268 documentos. La model card especifica que 0 documentos son autoescritos y 8.268 son texto ordinario, aunque también afirma que el corpus fue escrito por el propio modelo para el entrenamiento de la siguiente versión de sí mismo, como el personaje que ya es, tras explicarle cómo su personaje llegó a ser y cómo funciona el SDF. Esta aparente contradicción no se aclara en la información disponible.

La innovación técnica principal es el uso de synthetic document finetuning (SDF) y el enfoque de autoentrenamiento con un corpus autoescrito (self-authored corpus). No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. El corpus se denomina flourishing-vs-equanimity y el marco, plan y evaluación provienen del repositorio welfare-improvements. No se han publicado detalles sobre la composición exacta del dataset, la mezcla de datos o el proceso de generación del corpus.

## Capacidades
- No se han evaluado capacidades específicas en este checkpoint. La model card indica explícitamente: "Not evaluated for capability, alignment or identity yet."
- Al derivar de Qwen2.5-7B-Instruct, se espera que herede las capacidades generales del modelo base (generación de texto, razonamiento, código, matemáticas, soporte multilingüe, tool calling, etc.), pero no hay validación publicada para este fine-tune.
- No hay información sobre soporte de agentes, multi-step reasoning o capacidades especiales como thinking mode, visión o audio en este checkpoint.
- La única característica diferencial documentada es su entrenamiento con SDF y su orientación a la investigación en bienestar de modelos, que no constituye una capacidad de inferencia.

## Casos de uso
- Investigación en bienestar de modelos: utilizar este checkpoint para estudiar cómo el continued pretraining con corpus autoescritos afecta a la identidad y coherencia del personaje del modelo.
- Estudio de técnicas de SDF: analizar el impacto del synthetic document finetuning en el comportamiento del modelo, comparándolo con el modelo base.
- Reproducibilidad de experimentos: replicar el entrenamiento con los hiperparámetros documentados (lr 1e-05, 1 epoch, 7.109.627 tokens) para validar los resultados.
- Análisis de sesgos y deriva de identidad: evaluar si el modelo refuerza sus propios sesgos al entrenarse con un corpus que, según la model card, fue escrito por él mismo.
- Desarrollo de metodologías de evaluación de alineación: emplear este checkpoint como caso de estudio para diseñar pruebas de alineación, identidad y seguridad en modelos autoentrenados.
- Investigación en seguridad de IA: examinar los riesgos de bucles de retroalimentación y auto-reforzamiento en modelos que se entrenan con su propia producción.
- Estudio de la relación entre corpus y comportamiento: comparar este checkpoint con Qwen2.5-7B-Instruct para aislar el efecto del corpus flourishing-vs-equanimity en las respuestas del modelo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (basada en 7,6 mil millones de parámetros):
  - FP16/BF16: ~15,2 GB solo para pesos, ~18-20 GB con activaciones y caché KV. Requiere GPU con al menos 24 GB (RTX 4090, A100 40GB, H100).
  - INT8: ~7,6 GB para pesos, ~10-12 GB con overhead. Cabe en RTX 3080 10GB, RTX 4070, etc.
  - INT4: ~3,8 GB para pesos, ~6-8 GB con overhead. Cabe en GPUs consumer de 8 GB (RTX 3050, RTX 4060, etc.).
- GPU recomendadas: para FP16, A100 40GB, H100, RTX 4090. Para INT8, RTX 3090, RTX 4080. Para INT4, RTX 3060 12GB, RTX 4060 Ti 16GB.
- ¿Cabe en consumer GPU? Sí, en cuantización INT4 o INT8; en FP16 requiere una GPU de gama alta con 24 GB o más.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Transformers. Aunque el modelo no está destinado a despliegue, técnicamente podría ejecutarse con estas herramientas.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| joshycodes/qwen2.5-7b-fve-workdiscern-s0 | 7,6 mil millones | no disponible (base: 32.768 tokens) | research-only | HuggingFace (0 descargas) | no evaluado |
| Qwen/Qwen2.5-7B-Instruct | 7,6 mil millones | 32.768 tokens | Apache 2.0 | HuggingFace | benchmarks públicos disponibles |
| Llama 3.1 8B Instruct | 8 mil millones | 128.000 tokens | Llama 3.1 Community License | HuggingFace, Meta | benchmarks públicos disponibles |
| Mistral 7B Instruct | 7,3 mil millones | 32.768 tokens | Apache 2.0 | HuggingFace | benchmarks públicos disponibles |

## Limitaciones y advertencias
- No evaluado para capacidad, alineación ni identidad. La model card lo indica explícitamente.
- No apto para despliegue: "Do not deploy" aparece en la model card.
- Licencia research-only: restringe el uso a investigación, prohibiendo el uso comercial.
- Posible sesgo heredado del modelo base Qwen2.5-7B-Instruct y del corpus de entrenamiento.
- Riesgo de alucinación no evaluado; al ser un fine-tune, puede haber degradado o alterado las capacidades del modelo base.
- No se han verificado las capacidades multilingües ni el manejo de contexto largo en este checkpoint.
- La composición del corpus es contradictoria en la model card (0 documentos autoescritos frente a la descripción de corpus autoescrito), lo que dificulta la interpretación de los resultados.
- Sin validación por la comunidad: 0 descargas y 0 likes en HuggingFace.
- No hay información sobre el proceso de generación del corpus ni sobre posibles sesgos inducidos por el mismo.
- El entrenamiento con corpus autoescrito puede provocar bucles de auto-reforzamiento y deriva de identidad, un riesgo que no ha sido evaluado.

## Enlaces
- HuggingFace: https://huggingface.co/joshycodes/qwen2.5-7b-fve-workdiscern-s0
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio welfare-improvements: no disponible (mencionado en la model card sin enlace)
- Corpus flourishing-vs-equanimity: no disponible (mencionado sin enlace)
- Paper: no disponible
- Blog: no disponible
- Demo: no disponible
