# phuong-tk-nguyen/vipubmed-deberta-xmall-en-vimedner-ner-vi

## Resumen

El modelo `phuong-tk-nguyen/vipubmed-deberta-xmall-en-vimedner-ner-vi` es un ajuste fino (fine-tuning) orientado al reconocimiento de entidades nombradas (NER) en textos biomédicos en vietnamita. El nombre sugiere que parte del modelo pre-entrenado ViPubmedDeBERTa, desarrollado por el grupo de manhtt-079 y presentado en PACLIC 2023, que fue entrenado sobre 20 millones de resúmenes biomédicos vietnamitas traducidos a gran escala. La tarea específica parece ser NER sobre el corpus ViMedNER, aunque no se dispone de documentación oficial en la model card que confirme estos detalles.

El modelo está alojado en HuggingFace con licencia Apache-2.0, pero no incluye descripción, pipeline declarado, ni métricas de rendimiento. Con cero descargas y cero likes, se trata de una publicación reciente (agosto de 2026) sin validación comunitaria. Su relevancia radica en la escasez de modelos NER biomédicos específicos para vietnamita, un área con poca cobertura en el ecosistema de PLN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa (probablemente, por el nombre y el modelo base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (inferido por el nombre y el corpus) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors o binarios de PyTorch) |

## Arquitectura y entrenamiento

No se ha publicado información específica sobre la arquitectura de este modelo concreto. Por el nombre y la referencia al modelo base ViPubmedDeBERTa, se puede inferir que utiliza una arquitectura DeBERTa (decoding-enhanced BERT with disentangled attention), que mejora el transformer original mediante atención separada por contenido y posición. El modelo base fue pre-entrenado sobre ViPubmed, un dataset de 20 millones de resúmenes biomédicos vietnamitas generados mediante traducción automática a gran escala. El ajuste fino para NER sobre ViMedNER no está documentado en la model card, por lo que se desconocen los hiperparámetros, el número de épocas o la estrategia de entrenamiento empleada.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en textos biomédicos vietnamitas, probablemente sobre el corpus ViMedNER (entidades como enfermedades, fármacos, síntomas, etc.).
- Comprensión de vocabulario biomédico vietnamita gracias al pre-entrenamiento en ViPubmed.
- No se dispone de información sobre otras capacidades como generación de texto, razonamiento, tool calling o soporte multilingüe más allá del vietnamita.

## Casos de uso

- Extracción de entidades clínicas de historiales médicos electrónicos en vietnamita: el modelo puede identificar automáticamente nombres de enfermedades, medicamentos y procedimientos en notas clínicas, facilitando la codificación y el análisis posterior.
- Minería de literatura biomédica: procesamiento de resúmenes de artículos científicos vietnamitas para extraer entidades relevantes y construir bases de conocimiento estructuradas.
- Sistemas de soporte a la decisión clínica: integración en pipelines que detectan menciones de fármacos o patologías en textos libres para alertar a profesionales sanitarios.
- Anonimización de datos de salud: identificación de entidades nombradas (nombres de pacientes, hospitales, etc.) para su posterior enmascaramiento en cumplimiento de normativas de privacidad.
- Búsqueda semántica en repositorios biomédicos: indexación de documentos vietnamitas mediante entidades extraídas para mejorar la recuperación de información.
- Traducción asistida de terminología médica: uso de las entidades detectadas para alinear términos vietnamitas con equivalentes en otros idiomas en sistemas de traducción especializada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como F1, precisión o recall sobre ViMedNER u otros conjuntos de evaluación.

## Requisitos de hardware

No se dispone de información sobre requisitos de hardware específicos para este modelo. Dado que se trata de un modelo basado en DeBERTa, probablemente de tamaño base (alrededor de 100-200 millones de parámetros), se puede estimar que:

- VRAM estimada para inferencia: entre 2 y 6 GB en función de la cuantización (FP16 o int8).
- GPU recomendadas: tarjetas de consumo como NVIDIA GTX 1080 Ti, RTX 2060 o superiores; también ejecutable en CPU para inferencia por lotes pequeños.
- Es probable que quepa en GPUs de consumo modernas (8 GB o más).
- Opciones de despliegue: HuggingFace Transformers, ONNX Runtime, o servidores de inferencia como vLLM o TGI (aunque estos últimos están más orientados a modelos generativos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base ViPubmedDeBERTa (manhtt-079/vipubmed-deberta-base) es el único referente claro, pero no se conocen otros modelos NER biomédicos vietnamitas con los que comparar directamente. Se recomienda consultar el paper de PACLIC 2023 para posibles comparaciones con PhoBERT u otros modelos multilingües.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card no incluye descripción, ejemplos de uso, ni métricas, lo que dificulta su evaluación y reproducción.
- Sin validación comunitaria: cero descargas y cero likes indican que el modelo no ha sido probado ni verificado por otros usuarios.
- Sesgos potenciales: al estar entrenado sobre resúmenes biomédicos traducidos automáticamente, puede heredar errores de traducción y sesgos del corpus original.
- Riesgo de alucinación en NER: como todo modelo de PLN, puede producir etiquetas incorrectas o inconsistentes, especialmente en dominios especializados.
- Limitación idiomática: está orientado exclusivamente al vietnamita, sin soporte multilingüe confirmado.
- Licencia Apache-2.0 permite uso comercial, pero al no haber documentación clara sobre el origen de los datos de entrenamiento, conviene verificar la procedencia del corpus ViMedNER antes de un uso productivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/phuong-tk-nguyen/vipubmed-deberta-xmall-en-vimedner-ner-vi
- Repositorio GitHub del modelo base: https://github.com/manhtt-079/vipubmed-deberta
- Modelo base en HuggingFace: https://huggingface.co/manhtt-079/vipubmed-deberta-base
- Paper (PACLIC 2023): https://aclanthology.org/2023.paclic-1.83.pdf
