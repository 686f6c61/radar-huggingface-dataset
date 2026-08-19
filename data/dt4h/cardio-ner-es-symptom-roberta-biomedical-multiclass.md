# DT4H/cardio-ner-es-symptom-roberta-biomedical-multiclass

## Resumen

El modelo `DT4H/cardio-ner-es-symptom-roberta-biomedical-multiclass` es un sistema de reconocimiento de entidades nombradas (NER) de tipo multiclase, especializado en la detección de síntomas en textos clínicos cardiológicos en español. Ha sido desarrollado por el consorcio DataTools4Heart (DT4H), un proyecto europeo financiado por Horizon Europe (Grant Agreement No. 101057849) cuyo objetivo es construir una plataforma federada y respetuosa con la privacidad para el análisis de datos de cardiología. El modelo se basa en un ajuste fino (fine-tuning) sobre el modelo `roberta-biomedical`, que a su vez deriva de la arquitectura RoBERTa, y está diseñado para la tarea de clasificación de tokens (token-classification).

Con 125 millones de parámetros, se trata de un modelo compacto y ligero, adecuado para entornos con recursos limitados. Su relevancia radica en que aborda un problema específico del dominio clínico en español: la extracción automática de síntomas a partir de informes médicos, historiales y notas de consulta, lo que puede facilitar tareas de codificación, investigación clínica y apoyo a la decisión médica. Aunque el modelo se publicó en agosto de 2026, no cuenta aún con descargas ni valoraciones en Hugging Face, y su ficha técnica es mínima, por lo que gran parte de los detalles de entrenamiento y rendimiento no están disponibles públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (fine-tuning sobre `roberta-biomedical`) |
| Parametros totales | 125.389.827 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | Español (es) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa, un transformer encoder preentrenado de forma autorregresiva, y ha sido ajustado específicamente para la tarea de NER multiclase sobre el modelo `roberta-biomedical`. Este último es una variante de RoBERTa entrenada con corpus biomédicos, lo que proporciona una base semántica adecuada para el dominio clínico. La capa de salida es una cabeza de clasificación de tokens que asigna a cada token una etiqueta correspondiente a una categoría de síntoma (multiclase). No se dispone de información pública sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. El framework utilizado es PyTorch, y el modelo se carga mediante la API estándar de Transformers (`AutoModelForTokenClassification`).

## Capacidades

- Reconocimiento de entidades nombradas (NER) para síntomas en textos clínicos cardiológicos en español.
- Clasificación multiclase de tokens, lo que permite distinguir entre diferentes tipos de síntomas dentro de un mismo texto.
- Especialización en el dominio cardiovascular, con vocabulario y contexto clínico específico.
- Integración sencilla con el ecosistema Hugging Face Transformers mediante `AutoTokenizer` y `AutoModelForTokenClassification`.
- No es un modelo generativo: no produce texto libre, sino etiquetas sobre tokens de entrada.
- No se han documentado capacidades adicionales como tool calling, agentes, visión o audio.

## Casos de uso

- Extracción de síntomas de informes de alta hospitalaria: el modelo puede procesar automáticamente informes de pacientes cardiológicos y extraer menciones de síntomas (p. ej., dolor torácico, disnea, palpitaciones) para alimentar bases de datos clínicas o sistemas de codificación.
- Análisis de historiales clínicos electrónicos: permite indexar y buscar síntomas en grandes volúmenes de historiales, facilitando estudios retrospectivos o auditorías médicas.
- Soporte a la investigación clínica: en ensayos o estudios observacionales, el modelo puede ayudar a identificar criterios de inclusión o exclusión basados en síntomas descritos en texto libre.
- Monitorización de síntomas en telemedicina: integrado en plataformas de consulta remota, puede extraer síntomas de las notas que el paciente o el profesional introducen en lenguaje natural.
- Normalización de terminología clínica: al etiquetar síntomas de forma estructurada, el modelo contribuye a mapear texto libre a vocabularios controlados (p. ej., SNOMED CT, ICD-10), aunque no se ha confirmado que incluya este mapeo.
- Preprocesamiento para sistemas de decisión clínica: las entidades extraídas pueden servir como entrada para otros modelos que predicen diagnósticos o recomendaciones terapéuticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como F1, precisión o recall sobre conjuntos de validación estándar (p. ej., MMLU, HumanEval, GSM8K) ni sobre corpus clínicos específicos. El modelo no ha sido evaluado en tareas de generación de texto ni de razonamiento, ya que su función es exclusivamente de clasificación de tokens.

## Requisitos de hardware

- Al tratarse de un modelo de 125 millones de parámetros, la inferencia es ligera y puede ejecutarse en CPU con un consumo de memoria moderado (aproximadamente 0,5 GB en fp32, 0,25 GB en fp16).
- En GPU, cabe en tarjetas de consumo como una NVIDIA GTX 1060 (6 GB) o superiores; una RTX 3060 o RTX 4090 ofrecería latencias muy bajas.
- Para despliegue en producción, se puede servir con vLLM, Hugging Face TGI o mediante la API de Transformers en modo `pipeline`. También es compatible con `llama.cpp` si se convierte a GGUF, aunque no se han publicado cuantizaciones oficiales.
- El tamaño del repositorio es de 0,3 GB, lo que facilita su descarga y despliegue en entornos con ancho de banda limitado.
- No se dispone de datos de latencia o throughput medidos por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `DT4H/cardio-ner-es-symptom-roberta-biomedical-multiclass` | 125M | Español | NER multiclase de síntomas cardiológicos | No disponible | Hugging Face |
| `DT4H/cardio-ner-multilingual-symptom-xlm-roberta-large-multiclass` | 0,6B (aprox.) | Multilingüe | NER multiclase de síntomas | No disponible | Hugging Face |
| `roberta-biomedical` (modelo base) | 125M | Inglés (principal) | Modelo de lenguaje biomédico | No disponible | Hugging Face |

El modelo multilingüe de la misma colección CardioNER es significativamente mayor (0,6B) y cubre varios idiomas, lo que puede ofrecer un mejor rendimiento en tareas multilingües, pero a costa de mayor consumo de recursos. El modelo base `roberta-biomedical` no está especializado en NER ni en español, por lo que este modelo ajustado aporta una ventaja clara en el dominio objetivo. No se dispone de comparativas cuantitativas entre ellos.

## Limitaciones y advertencias

- No se ha especificado la licencia de uso, lo que genera incertidumbre legal para su utilización en entornos comerciales o de producción. Se recomienda contactar con los autores antes de cualquier despliegue.
- El modelo está entrenado exclusivamente para el español y para el dominio cardiológico; su rendimiento fuera de este ámbito (otros idiomas, otras especialidades médicas) será previsiblemente deficiente.
- No se han publicado datos sobre sesgos, alucinaciones o errores típicos. Al ser un modelo de NER, no genera texto, pero puede producir etiquetas incorrectas o incompletas, especialmente con terminología poco frecuente o con variantes dialectales.
- La longitud de contexto no está documentada; los modelos RoBERTa suelen limitarse a 512 tokens, lo que puede ser insuficiente para documentos clínicos extensos si no se segmentan adecuadamente.
- No se ha informado sobre el proceso de anotación de los datos de entrenamiento ni sobre la posible presencia de información sensible en los corpus, un aspecto crítico en el ámbito sanitario.
- El modelo no ha sido evaluado en benchmarks públicos, por lo que su rendimiento real en tareas clínicas es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/cardio-ner-es-symptom-roberta-biomedical-multiclass
- Colección CardioNER en Hugging Face: https://huggingface.co/collections/DT4H/cardioner
- Repositorio GitHub del proyecto DT4H Multilingual NER: https://github.com/nlp4bia-bsc/DT4H_Multilingual_NER
- Organización DataTools4Heart en GitHub: https://github.com/DataTools4Heart/
- Paper relacionado (SMM4H-HeaRD 2026): https://aclanthology.org/2026.smm4h-1.14/
