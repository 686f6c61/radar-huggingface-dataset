# DT4H/cardio-ner-es-roberta-biomedical-multilabel

## Resumen

El modelo `DT4H/cardio-ner-es-roberta-biomedical-multilabel` es un sistema de reconocimiento de entidades nombradas (NER) multilabel para textos clínicos en español, especializado en el dominio de la cardiología. Desarrollado por el consorcio DataTools4Heart (DT4H), un proyecto financiado por el programa Horizon Europe de la Unión Europea, este modelo identifica cuatro tipos de entidades clínicas: enfermedades, medicamentos, procedimientos y síntomas. Se trata de un fine-tuning sobre un modelo base RoBERTa biomédico, con 125,4 millones de parámetros, lo que lo sitúa en la categoría de modelos pequeños y eficientes para tareas de etiquetado de secuencias.

La relevancia de este modelo radica en su aplicación directa a la extracción de información estructurada a partir de textos clínicos en español, un área con escasez de recursos lingüísticos especializados. Al estar orientado específicamente a cardiología, permite abordar tareas como la minería de historiales clínicos electrónicos, la codificación automática de diagnósticos o el análisis de literatura médica, con un coste computacional reducido. Su publicación como parte del ecosistema DataTools4Heart refuerza su alineación con los objetivos de reutilización de datos sanitarios y privacidad diferencial del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder) |
| Parametros totales | 125.394.441 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (típicamente 512 tokens en RoBERTa base) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Español (es) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa, un transformer encoder preentrenado con enmascaramiento de lenguaje robusto. El checkpoint base es `roberta-biomedical`, un modelo preentrenado en textos biomédicos, aunque no se especifica si se trata de una versión multilingüe o específica para español. El fine-tuning se realizó para la tarea de token classification con etiquetas multilabel, lo que permite asignar múltiples categorías a un mismo token o secuencia de tokens. No se han publicado detalles sobre el dataset de entrenamiento, el número de épocas, la estrategia de aumento de datos ni el uso de técnicas como RLHF o DPO. El framework utilizado es PyTorch, y el modelo se carga mediante la API estándar de Transformers.

## Capacidades

- Reconocimiento de entidades nombradas (NER) multilabel en español para el dominio cardiológico.
- Identificación de cuatro tipos de entidades: enfermedades, medicamentos, procedimientos y síntomas.
- Etiquetado a nivel de token (token classification), adecuado para extraer entidades de longitud variable.
- Inferencia directa con `AutoModelForTokenClassification` de Hugging Face Transformers.
- No se documentan capacidades adicionales como tool calling, agentes, razonamiento multi-paso o soporte de visión/audio.

## Casos de uso

- Extracción de información de historiales clínicos electrónicos: el modelo puede procesar notas médicas en español y extraer automáticamente diagnósticos, fármacos prescritos, procedimientos realizados y síntomas reportados, facilitando la estructuración de datos no estructurados.
- Minería de literatura científica cardiológica: permite analizar abstracts y artículos de revistas médicas para identificar entidades relevantes, apoyando revisiones sistemáticas y meta-análisis.
- Codificación clínica automática: al reconocer enfermedades y procedimientos, puede asistir en la asignación de códigos CIE-10 u otros sistemas de clasificación, reduciendo el trabajo manual de codificadores.
- Soporte a sistemas de vigilancia epidemiológica: la detección de síntomas y enfermedades en textos clínicos puede alimentar bases de datos de salud pública para monitorizar tendencias cardiovasculares.
- Investigación en ensayos clínicos: extracción de criterios de elegibilidad y eventos adversos a partir de protocolos y reportes, acelerando el análisis de seguridad y eficacia.
- Integración en pipelines de procesamiento de lenguaje natural clínico: el modelo puede combinarse con otros componentes (p. ej., normalización de entidades, resolución de coreferencias) para construir sistemas completos de análisis de texto médico en español.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre métricas como F1, precisión o recall en conjuntos de validación estándar (p. ej., CoNLL, MedMentions) ni comparaciones con otros modelos de NER clínico en español.

## Requisitos de hardware

- El modelo tiene 125,4 millones de parámetros, lo que lo hace adecuado para GPU de consumo. Con pesos en FP32, el tamaño en memoria es de aproximadamente 500 MB; en FP16 se reduce a unos 250 MB.
- Una GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050) es suficiente para inferencia en lotes pequeños. Para procesamiento de grandes volúmenes, se recomienda una RTX 3060 o superior.
- El despliegue puede realizarse con la librería Transformers de Hugging Face, o mediante servidores de inferencia como vLLM o TGI, aunque al ser un modelo de encoder, la latencia es baja y no requiere optimizaciones específicas.
- No se dispone de datos de throughput o latencia medidos por el autor.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos de NER clínico en español. La organización DataTools4Heart ha publicado un modelo equivalente en inglés (`DT4H/cardio-ner-en-biomed-roberta-base-multilabel`), que comparte la misma arquitectura y tarea, pero no se han publicado métricas comparativas. Otros modelos de NER biomédico en español (p. ej., `PlanTL-GOB-ES/roberta-base-biomedical-clinical-es`) existen, pero no se dispone de datos de rendimiento en este contexto.

## Limitaciones y advertencias

- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial y la redistribución. Se recomienda contactar con los autores antes de utilizarlo en producción.
- El modelo está especializado en cardiología y puede no generalizar bien a otros dominios médicos o a textos no clínicos.
- No se han documentado los datos de entrenamiento, por lo que no es posible evaluar sesgos potenciales (p. ej., sobrerrepresentación de ciertas poblaciones o terminologías).
- Al ser un modelo de NER, puede producir falsos positivos o negativos en entidades poco frecuentes o con variaciones ortográficas.
- La longitud de contexto no está confirmada; si se limita a 512 tokens, no es adecuado para documentos largos sin segmentación previa.
- No se han publicado evaluaciones de robustez frente a errores de OCR, jerga clínica o dialectos del español.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/cardio-ner-es-roberta-biomedical-multilabel
- Modelo equivalente en inglés: https://huggingface.co/DT4H/cardio-ner-en-biomed-roberta-base-multilabel
- Proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Repositorio GitHub de DataTools4Heart: https://github.com/DataTools4Heart/
- Publicaciones del proyecto: https://www.datatools4heart.eu/publications/ (incluye referencia a SMM4H-HeaRD 2026 sobre NER clínico multilingüe)
