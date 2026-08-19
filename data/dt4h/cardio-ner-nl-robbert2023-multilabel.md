# DT4H/cardio-ner-nl-robbert2023-multilabel

## Resumen

El modelo `DT4H/cardio-ner-nl-robbert2023-multilabel` es un sistema de reconocimiento de entidades nombradas (NER) especializado en cardiología para el idioma neerlandés. Desarrollado por el proyecto DataTools4Heart (DT4H), financiado por la Unión Europea, este modelo identifica cuatro tipos de entidades clínicas: enfermedades, medicamentos, procedimientos y síntomas. Se trata de la versión SLERP (interpolación esférica) de los diez pliegues utilizados en el artículo científico del grupo, lo que proporciona un modelo único más robusto que cualquiera de los pliegues individuales.

El modelo se basa en RobBERT2023, un encoder transformer tipo RoBERTa preentrenado específicamente para neerlandés, y se ha ajustado (fine-tuning) para la tarea de clasificación de tokens. Con aproximadamente 123,8 millones de parámetros, es un modelo de tamaño medio que puede ejecutarse en hardware de consumo. Su relevancia radica en que aborda la extracción de información estructurada de textos clínicos cardiovasculares, un paso clave para la reutilización de datos de salud en investigación y práctica clínica, siempre dentro de un marco federado y respetuoso con la privacidad.

El modelo está disponible en HuggingFace bajo licencia GPL-3.0, con pesos en formato safetensors y una ventana de contexto estándar para RoBERTa (512 tokens). Aunque aún no tiene descargas ni valoraciones, forma parte de la colección CardioNER de DT4H, que incluye también versiones multilingües basadas en XLM-RoBERTa-large.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (RobBERT2023, encoder transformer) |
| Parametros totales | 123.858.441 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (estándar RoBERTa) |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32) |
| Idiomas soportados | Neerlandes (nl) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer tipo RoBERTa, concretamente la variante RobBERT2023, un encoder preentrenado en un amplio corpus neerlandés. Sobre esta base se añade una cabeza de clasificación de tokens (token-classification) que asigna a cada token una etiqueta de entidad o la etiqueta "fuera de entidad" (O). El ajuste fino se realizó con un conjunto de datos clínicos de cardiología en neerlandés, anotado con cuatro tipos de entidades: enfermedades, medicamentos, procedimientos y síntomas.

El entrenamiento se llevó a cabo mediante validación cruzada de 10 pliegues, y los pesos de los diez modelos resultantes se combinaron mediante SLERP (Spherical Linear Interpolation), una técnica que interpola los parámetros en el espacio de pesos para obtener un modelo único más estable y generalizable. En el artículo asociado (SMM4H-HeaRD 2026) se menciona que se utilizó una cabeza DNN de 3 capas sobre los encoders, aunque no se especifica si esta estructura se mantiene en el modelo publicado. No se dispone de información sobre el número exacto de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO, ya que se trata de un ajuste supervisado clásico.

## Capacidades

- Reconocimiento de entidades nombradas en textos clínicos de cardiología en neerlandés, con cuatro categorías: enfermedades, medicamentos, procedimientos y síntomas.
- Clasificación a nivel de token (token-classification), adecuada para extraer menciones de entidades en informes médicos, historiales y notas clínicas.
- Modelo monolingüe optimizado para el dominio cardiológico, con mejor precisión que modelos genéricos de NER neerlandeses en este ámbito específico.
- No soporta tool calling, generación de texto libre, razonamiento multi-paso ni capacidades multimodales; su función es exclusivamente la extracción de entidades.
- Al ser un encoder, no genera texto; produce secuencias de etiquetas BIO (Begin, Inside, Outside) para cada token.

## Casos de uso

- Extracción de información de informes de alta hospitalaria: el modelo puede procesar automáticamente informes de pacientes cardiológicos para identificar diagnósticos (enfermedades), tratamientos (medicamentos), intervenciones (procedimientos) y síntomas, facilitando la creación de bases de datos estructuradas para investigación clínica.
- Análisis de historiales clínicos electrónicos: permite indexar grandes volúmenes de historiales en neerlandés, extrayendo entidades relevantes para estudios epidemiológicos o de resultados en salud cardiovascular.
- Soporte a sistemas de decisión clínica: las entidades extraídas pueden alimentar sistemas de alerta temprana o recomendación, por ejemplo, detectando pacientes con ciertas combinaciones de medicamentos y enfermedades.
- Preparación de datos para ensayos clínicos: ayuda a cribar candidatos mediante la identificación de criterios de inclusión/exclusión expresados en texto libre, como presencia de determinados síntomas o procedimientos previos.
- Anonimización asistida: aunque no es su función principal, la detección de entidades clínicas puede complementar herramientas de desidentificación al localizar términos que deben ser tratados con cuidado.
- Construcción de grafos de conocimiento cardiovasculares: las entidades extraídas pueden relacionarse entre sí para construir grafos que representen comorbilidades, interacciones medicamentosas o rutas de tratamiento, útiles para análisis de redes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo en la información disponible. El artículo de SMM4H-HeaRD 2026 describe el sistema general del grupo DT4H, pero no desglosa las puntuaciones por modelo individual. Por tanto, no es posible presentar una tabla comparativa con valores numéricos verificados.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~124M parámetros, la inferencia en precisión fp32 requiere aproximadamente 500 MB de VRAM (sin contar el overhead del framework). En fp16, se reduce a ~250 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060 o superiores. También puede ejecutarse en CPU con razonable velocidad.
- Cabe en GPUs de consumo comunes: sí, incluso en tarjetas integradas o de gama baja.
- Opciones de despliegue: al ser un modelo de HuggingFace Transformers, puede servirse con vLLM, TGI o directamente con la librería `transformers` de Python. Para entornos ligeros, se puede convertir a ONNX o usar `optimum` para aceleración.
- Latencia y throughput estimados: no hay datos oficiales, pero para un modelo de este tamaño, la inferencia por secuencia de 512 tokens en una GPU moderna (RTX 3090) suele estar en el orden de 10-20 ms, lo que permite procesar cientos de documentos por minuto.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Dominio | Licencia | Contexto |
|---|---|---|---|---|---|
| DT4H/cardio-ner-nl-robbert2023-multilabel (este) | 123,8M | Neerlandés | Cardiología | GPL-3.0 | 512 |
| DT4H/cardio-ner-multilingual-xlm-roberta-large-multilabel | ~560M | Multilingüe (incluye neerlandés) | Cardiología | GPL-3.0 | 512 |
| MedRoBERTa.nl (si existe como modelo NER) | ~124M (estimado) | Neerlandés | Clínico general | no disponible | 512 |
| CardioDeBERTa.nl (mencionado en paper) | no disponible | Neerlandés | Cardiología | no disponible | no disponible |

La comparativa se basa en características declaradas; no hay datos de rendimiento disponibles para este modelo ni para los alternativos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para neerlandés y para el dominio cardiológico; su uso en otros idiomas o especialidades médicas producirá resultados degradados.
- No se han publicado estudios de sesgos específicos, pero como cualquier modelo entrenado con datos clínicos, puede reflejar sesgos presentes en los corpus originales (p. ej., infrarrepresentación de ciertos grupos demográficos).
- Riesgo de alucinación: al ser un modelo de NER, no genera texto, pero puede etiquetar incorrectamente tokens ambiguos o fuera de contexto, especialmente en textos con jerga local o abreviaturas no estándar.
- La ventana de contexto de 512 tokens limita el procesamiento de documentos largos; será necesario segmentar los textos, lo que puede perder información entre fragmentos.
- Licencia GPL-3.0: es una licencia copyleft, lo que implica que cualquier obra derivada o integración en software distribuido debe publicarse bajo la misma licencia. Esto puede ser incompatible con soluciones propietarias o de código cerrado.
- El modelo está en una fase temprana (0 descargas, 0 likes) y no hay evidencia pública de validación clínica externa; se recomienda evaluar su rendimiento en el corpus de destino antes de usar en producción.
- No se proporciona información sobre la composición exacta del dataset de entrenamiento ni sobre el proceso de anotación, lo que dificulta evaluar su calidad y posibles sesgos.

## Enlaces

- HuggingFace: https://huggingface.co/DT4H/cardio-ner-nl-robbert2023-multilabel
- Colección CardioNER en HuggingFace: https://huggingface.co/collections/DT4H/cardioner
- Artículo SMM4H-HeaRD 2026 (aclanthology): https://aclanthology.org/2026.smm4h-1.14/
- PDF del artículo: https://aclanthology.org/2026.smm4h-1.14.pdf
- Organización GitHub de DataTools4Heart: https://github.com/DataTools4Heart/
