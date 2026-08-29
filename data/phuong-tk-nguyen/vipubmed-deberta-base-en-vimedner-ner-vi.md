# phuong-tk-nguyen/vipubmed-deberta-base-en-vimedner-ner-vi

## Resumen

El modelo `phuong-tk-nguyen/vipubmed-deberta-base-en-vimedner-ner-vi` es un ajuste fino (fine-tune) del modelo preentrenado ViPubmedDeBERTa, desarrollado originalmente por el equipo de manhtt-079. ViPubmedDeBERTa es un modelo de tipo DeBERTa preentrenado sobre ViPubmed, un corpus de 20 millones de resúmenes biomédicos en vietnamita generados mediante traducción a gran escala. Este ajuste fino se ha especializado en el reconocimiento de entidades nombradas (NER) para el dominio biomédico en vietnamita, utilizando presumiblemente el dataset ViMedNER.

El modelo resuelve el problema de extracción de entidades biomédicas (enfermedades, fármacos, síntomas, etc.) en textos clínicos y científicos vietnamitas, un área con escasez de recursos lingüísticos. Su relevancia radica en que combina un modelo preentrenado específico para el dominio biomédico vietnamita con una tarea downstream de NER, lo que permite aplicaciones prácticas en procesamiento de historiales clínicos, literatura médica y sistemas de apoyo a la decisión clínica. La arquitectura subyacente es DeBERTa (variante base, probablemente v2), con un tamaño de modelo base y una ventana de contexto estándar para este tipo de arquitectura, aunque los detalles exactos no se especifican en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa (variante base, probablemente v2) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (enfocado en textos biomedicos) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo base ViPubmedDeBERTa se construye sobre la arquitectura DeBERTa, que introduce mecanismos de atención con decodificación mejorada y separación de contenido y posición. El preentrenamiento se realizó sobre ViPubmed, un corpus de 20 millones de resúmenes biomédicos vietnamitas obtenidos por traducción automática a gran escala. El ajuste fino para NER se ha realizado sobre el dataset ViMedNER, aunque no se especifican los hiperparámetros, el número de épocas ni la estrategia de entrenamiento en la información disponible. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; se trata de un fine-tune supervisado estándar para etiquetado de secuencias.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en textos biomédicos vietnamitas, incluyendo probablemente entidades como enfermedades, fármacos, síntomas y procedimientos.
- Procesamiento de texto biomédico en vietnamita, aprovechando el preentrenamiento en el dominio específico.
- No se han documentado capacidades de generación de texto, tool calling, agentes, razonamiento multi-paso, visión o audio.
- El modelo está limitado a la tarea de NER; no es un modelo generativo ni conversacional.

## Casos de uso

- Extracción de entidades de historiales clínicos electrónicos: el modelo puede identificar automáticamente diagnósticos, medicamentos y síntomas en notas clínicas vietnamitas, facilitando la estructuración de datos no estructurados para su análisis posterior.
- Análisis de literatura biomédica: permite procesar artículos científicos y resúmenes en vietnamita para extraer entidades relevantes, apoyando revisiones sistemáticas y minería de textos.
- Sistemas de apoyo a la decisión clínica: al extraer entidades de informes médicos, puede alimentar sistemas que sugieran tratamientos o alerten sobre interacciones farmacológicas.
- Construcción de bases de conocimiento biomédicas: el NER es un paso previo para poblar grafos de conocimiento o ontologías médicas en vietnamita.
- Traducción y localización de contenido médico: aunque no es su función principal, puede ayudar a identificar términos médicos en textos vietnamitas para su posterior traducción o normalización.
- Investigación en NLP biomédico para lenguas de bajos recursos: sirve como punto de partida para desarrollar sistemas más complejos (extracción de relaciones, preguntas y respuestas) en el dominio médico vietnamita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como F1, precisión o recall sobre ViMedNER u otros conjuntos de evaluación.

## Requisitos de hardware

- Al ser un modelo de tipo DeBERTa base (aproximadamente 86 millones de parámetros, aunque no confirmado), la inferencia es ligera.
- VRAM estimada: en FP16, el modelo ocupa alrededor de 170 MB; en int8, unos 85 MB. Esto permite ejecutarlo en GPUs con 4 GB o menos, incluyendo tarjetas consumer como GTX 1650, RTX 3060 o incluso CPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; para lotes grandes o despliegue concurrente, se recomienda una RTX 3090 o A10.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI, o mediante la librería `transformers` con pipelines de NER. También es posible exportarlo a ONNX o TensorRT para optimización.
- Latencia y throughput: no se han publicado mediciones específicas; en una GPU moderna, la inferencia por secuencia de 128 tokens debería estar en el rango de milisegundos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa directa con otros modelos NER biomédicos vietnamitas. Se puede mencionar que el modelo base ViPubmedDeBERTa compite con otros modelos preentrenados vietnamitas como PhoBERT, pero no hay datos de rendimiento comparativo en la información disponible.

## Limitaciones y advertencias

- El modelo está especializado en el dominio biomédico vietnamita; su rendimiento en otros dominios o idiomas será muy limitado.
- Al ser un fine-tune sobre un corpus traducido automáticamente, puede heredar errores de traducción y sesgos del proceso de generación del corpus ViPubmed.
- No se han documentado evaluaciones de sesgos ni de robustez ante textos ruidosos o fuera de distribución.
- La licencia apache-2.0 permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento originales (ViPubmed) para posibles restricciones adicionales.
- No se dispone de información sobre la calidad del etiquetado de ViMedNER ni sobre la estrategia de validación del fine-tune.
- El modelo no es generativo; no puede producir texto libre ni mantener conversaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/phuong-tk-nguyen/vipubmed-deberta-base-en-vimedner-ner-vi
- Repositorio GitHub del modelo base: https://github.com/manhtt-079/vipubmed-deberta
- Modelo base en HuggingFace: https://huggingface.co/manhtt-079/vipubmed-deberta-base
- Paper de ViPubmedDeBERTa (PACLIC 2023): https://aclanthology.org/2023.paclic-1.83.pdf
