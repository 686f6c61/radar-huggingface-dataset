# DT4H/cardio-ner-es-procedure-roberta-biomedical-multiclass

## Resumen

El modelo `DT4H/cardio-ner-es-procedure-roberta-biomedical-multiclass` es un sistema de reconocimiento de entidades nombradas (NER) multiclase en español, especializado en la detección de procedimientos en textos clínicos de cardiología. Ha sido desarrollado por el proyecto europeo DataTools4Heart (DT4H), financiado por Horizon Europe, con el objetivo de facilitar la extracción estructurada de información de historiales médicos y documentos cardiológicos. Se trata de un fine-tuning de un modelo RoBERTa biomédico (probablemente `roberta-biomedical` de PlanTL-GOB-ES) para la tarea de clasificación de tokens a nivel de etiqueta.

El modelo cuenta con 125.389.827 parámetros, lo que corresponde a una arquitectura de tipo encoder transformer del tamaño de RoBERTa-base. Está diseñado para su uso con la librería Transformers de Hugging Face y se distribuye en formato safetensors. Aunque no se especifica la longitud de contexto, los modelos RoBERTa-base suelen trabajar con secuencias de hasta 512 tokens. Su relevancia radica en la necesidad de automatizar la codificación de procedimientos cardiológicos en entornos clínicos, un paso previo para la investigación, la gestión de datos de salud y la interoperabilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) fine-tune para token classification |
| Parametros totales | 125.389.827 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (típico de RoBERTa-base: 512 tokens) |
| Tipos de cuantizacion | no disponible (solo safetensors en FP32/FP16) |
| Idiomas soportados | Español (es) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa, un transformer encoder preentrenado con enmascaramiento de lenguaje. Sobre esta base se ha realizado un fine-tuning supervisado para la tarea de token classification, es decir, cada token de la secuencia de entrada se etiqueta como parte de una entidad de procedimiento cardiológico o como no-entidad. La capa de salida es una cabecera de clasificación lineal sobre las representaciones contextuales de cada token.

No se dispone de información detallada sobre el conjunto de datos de entrenamiento, el número de épocas, la estrategia de aumento de datos ni el uso de técnicas como RLHF o DPO. El proyecto DataTools4Heart se centra en el desarrollo de herramientas federadas y preservación de la privacidad, por lo que es probable que el entrenamiento se haya realizado sobre corpus clínicos anonimizados en español, aunque este extremo no está documentado en la ficha pública.

## Capacidades

- Reconocimiento de entidades nombradas (NER) para procedimientos cardiológicos en español.
- Clasificación multiclase de tokens, lo que permite distinguir entre distintos tipos de procedimientos (p. ej., angioplastia, cateterismo, bypass, etc.) si las etiquetas de entrenamiento así lo definen.
- Integración sencilla con el ecosistema Hugging Face mediante `AutoModelForTokenClassification`.
- Funciona como componente de extracción de información en pipelines de procesamiento de lenguaje natural clínico.
- No se han documentado capacidades adicionales como generación de texto, tool calling, agentes o soporte multimodal.

## Casos de uso

- Extracción de procedimientos de informes de alta hospitalaria: el modelo puede procesar automáticamente informes de pacientes cardiológicos y extraer los procedimientos mencionados, facilitando la codificación y el análisis retrospectivo.
- Construcción de bases de datos clínicas estructuradas: al integrarse en un pipeline de NLP, convierte texto libre en registros estructurados con etiquetas de procedimientos, útil para investigación epidemiológica.
- Soporte a la codificación médica (p. ej., CIE-10): los procedimientos detectados pueden mapearse a códigos estandarizados, reduciendo el trabajo manual de los codificadores.
- Análisis de cohortes en ensayos clínicos: permite filtrar pacientes según los procedimientos cardiológicos que se les han realizado, a partir de sus historiales.
- Monitorización de calidad asistencial: al extraer procedimientos de grandes volúmenes de documentos, se pueden auditar prácticas clínicas y comparar entre centros.
- Preparación de datos para modelos federados: dentro del ecosistema DataTools4Heart, el NER puede servir para anonimizar o estructurar datos antes de su uso en aprendizaje federado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como F1, precisión o recall sobre conjuntos de validación estándar (p. ej., MLEE, BC5CDR o corpus clínicos propios). Tampoco se han comparado los resultados con otros modelos de NER clínico en español.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware.
- Como orientación, un modelo de 125M de parámetros en FP32 ocupa aproximadamente 500 MB de VRAM; en FP16, unos 250 MB; en int8, unos 125 MB. Por tanto, es ejecutable en GPUs de consumo con 2 GB o más de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 2060, etc.).
- Para inferencia en CPU, es viable con memoria RAM suficiente (al menos 4 GB para el modelo en FP32).
- Opciones de despliegue: se puede servir con la librería Transformers de Hugging Face, o mediante servidores de inferencia como vLLM, TGI o llama.cpp (si se convierte a GGUF), aunque no se han probado oficialmente.
- La latencia dependerá del hardware; en una GPU moderna, la inferencia sobre secuencias de hasta 512 tokens debería completarse en decenas de milisegundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DT4H/cardio-ner-es-procedure-roberta-biomedical-multiclass | 125M | Español | NER procedimientos cardiológicos | no disponible | Hugging Face |
| DT4H/es-procedure-cardioberta-multiclass-ner | no disponible | Español | NER procedimientos cardiológicos | no disponible | Hugging Face |
| DT4H/cardio-ner-cs-procedure-robeczech-base-multiclass | no disponible | Checo | NER procedimientos cardiológicos | no disponible | Hugging Face |

No se dispone de información suficiente sobre los modelos comparables para establecer diferencias de rendimiento o arquitectura. Los tres pertenecen al mismo proyecto DataTools4Heart y siguen un enfoque similar (fine-tuning de un modelo de lenguaje biomédico para NER de procedimientos cardiológicos), pero en distintos idiomas.

## Limitaciones y advertencias

- No se ha especificado la licencia del modelo, lo que genera incertidumbre sobre su uso comercial y su redistribución. Se recomienda contactar con los autores antes de utilizarlo en producción.
- El modelo está entrenado específicamente para el dominio de la cardiología y para el reconocimiento de procedimientos. Su rendimiento fuera de este ámbito (p. ej., otras especialidades médicas o tipos de entidades) será previsiblemente bajo.
- No se han documentado sesgos específicos, pero al tratarse de un modelo entrenado sobre datos clínicos, puede reflejar sesgos presentes en los corpus de origen (p. ej., infrarrepresentación de ciertos grupos demográficos).
- Existe riesgo de alucinación o de etiquetado incorrecto en textos ambiguos o con terminología no estándar, especialmente en documentos con errores tipográficos o abreviaturas poco comunes.
- La longitud de contexto no está confirmada; si se hereda de RoBERTa-base, estará limitada a 512 tokens, lo que puede ser insuficiente para documentos clínicos largos sin segmentación previa.
- No se han publicado métricas de evaluación, por lo que no se puede cuantificar su precisión ni compararla con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/cardio-ner-es-procedure-roberta-biomedical-multiclass
- Modelo similar en español: https://huggingface.co/DT4H/es-procedure-cardioberta-multiclass-ner
- Modelo similar en checo: https://huggingface.co/DT4H/cardio-ner-cs-procedure-robeczech-base-multiclass
- Proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Organización GitHub de DataTools4Heart: https://github.com/DataTools4Heart/
- Publicación relacionada (SMM4H-HeaRD 2026): https://www.datatools4heart.eu/publications/
