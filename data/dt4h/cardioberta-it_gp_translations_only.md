# DT4H/CardioBERTa.it_GP_translations_only

## Resumen

CardioBERTa.it_GP_translations_only es un codificador de terminología biomédica en italiano, especializado en normalización de conceptos clínicos y entity linking. Desarrollado por el proyecto europeo DataTools4Heart (DT4H), el modelo se inicializa desde CardioBERTa.it, un encoder de la familia CardioBERTa adaptado al dominio de la cardiología mediante preentrenamiento continuado con modelado de lenguaje enmascarado (MLM) sobre corpus biomédicos y cardiológicos en italiano.

El modelo se entrena con aprendizaje métrico supervisado por conceptos UMLS (Unified Medical Language System), utilizando 4,7 millones de tripletas que cubren 476.970 CUIs y 529.487 términos normalizados únicos. La estrategia de entrenamiento "grandparents" enriquece los pares de sinónimos con relaciones ontológicas de nivel abuelo, lo que permite al modelo capturar relaciones semánticas más amplias entre conceptos clínicos. Con 109,9 millones de parámetros y una arquitectura BERT, está diseñado para tareas de recuperación de candidatos y vinculación de entidades en pipelines de procesamiento de lenguaje natural clínico.

Su relevancia actual radica en que aborda un problema crítico en informática biomédica: la heterogeneidad terminológica en los registros clínicos. Al ofrecer un encoder específico para italiano cardiológico, facilita la estandarización de informes clínicos y la interoperabilidad semántica entre sistemas de salud europeos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parámetros totales | 109.927.680 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 25 tokens (máximo de entrenamiento) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Italiano (it) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura BERT estándar, heredada de su modelo base CardioBERTa.it. La familia CardioBERTa, descrita en el artículo "CardioLM - a multilingual suite of small language models for the cardiology domain" de Danu et al., comprende encoders adaptados al dominio cardiológico mediante preentrenamiento continuado con MLM en siete idiomas: checo, neerlandés, inglés, italiano, rumano, español y sueco.

El entrenamiento específico de este modelo emplea aprendizaje métrico con Multi-Similarity Loss sobre tripletas CUI-supervisadas. La estrategia "grandparents" genera tripletas que incluyen relaciones ontológicas de nivel abuelo, ampliando significativamente la cobertura semántica respecto a estrategias más simples como solo sinónimos o padres. Los hiperparámetros incluyen margen de 0,2, pooling CLS, una época, tamaño de lote 256, tasa de aprendizaje 2e-5 y longitud máxima de 25 tokens. La terminología de entrenamiento no se distribuye con el repositorio debido a condiciones de licencia de UMLS.

## Capacidades

- Normalización de conceptos clínicos: asigna términos clínicos en italiano a conceptos UMLS estandarizados mediante embeddings de terminología.
- Entity linking: vincula menciones de entidades en texto clínico a conceptos normalizados en ontologías biomédicas.
- Recuperación de candidatos: genera representaciones vectoriales normalizadas (normalización L2) que permiten búsqueda por similitud coseno en bases de datos de conceptos.
- Embeddings de terminología biomédica: produce vectores densos de alta calidad para términos cardiológicos y clínicos en italiano.
- Aprendizaje métrico: optimizado específicamente para espacios de embedding donde la proximidad refleja similitud semántica clínica.
- Integración en pipelines de NLP clínico: compatible con bibliotecas de transformers y con Text Embeddings Inference para despliegue en producción.

## Casos de uso

- Normalización de informes de ecocardiografía: el modelo puede mapear hallazgos descritos en lenguaje natural italiano a conceptos UMLS estandarizados, facilitando la agregación de datos clínicos para investigación.
- Enriquecimiento de registros electrónicos de salud (EHR): permite estandarizar terminología variada de diferentes hospitales italianos, mejorando la interoperabilidad entre sistemas.
- Recuperación de pacientes para ensayos clínicos: al normalizar criterios de inclusión y exclusión descritos en texto libre, facilita la identificación de candidatos elegibles en cardiología.
- Análisis retrospectivo de cohortes: posibilita la búsqueda de pacientes con condiciones específicas mediante consultas conceptuales en lugar de búsquedas por palabras clave.
- Soporte a codificación ICD: puede asistir en la asignación de códigos de clasificación de enfermedades a partir de descripciones clínicas en italiano.
- Construcción de grafos de conocimiento clínico: los embeddings generados permiten conectar términos de diferentes fuentes documentales a un mismo concepto UMLS, creando redes semánticas para sistemas de apoyo a decisión.
- Desambiguación de abreviaturas médicas: al contextualizar términos en su representación vectorial, ayuda a resolver ambigüedades entre siglas con múltiples significados clínicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card no incluye evaluaciones cuantitativas como precisión en entity linking, recall@k o métricas de similitud semántica comparadas con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en precisión FP32 (110M parámetros), reducible a unos 0,2 GB con cuantización INT8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas consumer como NVIDIA GTX 1650, RTX 2060 o superiores funcionan sin problema.
- Compatibilidad con consumer GPU: sí, el modelo es ligero y cabe en cualquier GPU moderna, incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: compatible con Hugging Face Transformers, Text Embeddings Inference (TEI), y puede exportarse a ONNX para optimización. No se ha confirmado compatibilidad con vLLM o llama.cpp al ser un encoder, no un modelo generativo.
- Latencia estimada: en GPU consumer, la codificación de un término de 25 tokens debería completarse en menos de 10 ms; en CPU, entre 20-50 ms por término.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Especialidad | Licencia |
|---|---|---|---|---|---|
| CardioBERTa.it_GP_translations_only | 110M | 25 tokens | Italiano | Cardiología + UMLS | no disponible |
| BioBERT | 110M | 512 tokens | Inglés | Biomédico general | MIT |
| ClinicalBERT | 110M | 512 tokens | Inglés | Texto clínico | MIT |
| SapBERT | 110M | 512 tokens | Multilingüe (6 idiomas) | Normalización de conceptos UMLS | MIT |

La comparativa con SapBERT es especialmente relevante, ya que ambos modelos abordan la normalización de conceptos UMLS. Sin embargo, CardioBERTa.it_GP_translations_only se diferencia por estar especializado en italiano y en el dominio cardiológico, mientras que SapBERT cubre más idiomas pero con un enfoque generalista. BioBERT y ClinicalBERT son modelos de propósito general en inglés sin optimización específica para entity linking.

## Limitaciones y advertencias

- El modelo está limitado al idioma italiano; no soporta otros idiomas de la familia CardioBERTa en esta versión específica.
- La longitud de contexto máxima es de 25 tokens, lo que impide procesar descripciones clínicas largas de una sola vez; se requiere truncamiento o estrategias de ventana deslizante.
- La licencia no está especificada en la model card, lo que genera incertidumbre sobre restricciones de uso comercial.
- La terminología de entrenamiento contiene recursos sujetos a condiciones de licencia de UMLS, lo que puede limitar la redistribución del modelo o su uso en ciertos contextos.
- No está diseñado para toma de decisiones clínicas directas; su uso previsto es como componente de pipelines de investigación o sistemas de apoyo.
- No se han publicado evaluaciones independientes de rendimiento, por lo que su eficacia real en entornos productivos no está validada externamente.
- El entrenamiento se realizó con una sola época, lo que podría limitar la convergencia completa del aprendizaje métrico.
- Riesgo de alucinación: al ser un encoder, no genera texto, por lo que el riesgo de alucinación es bajo; el riesgo principal está en la asignación incorrecta de conceptos a términos ambiguos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DT4H/CardioBERTa.it_GP_translations_only
- Modelo base CardioBERTa.it: https://huggingface.co/DT4H/CardioBERTa.it
- Organización DT4H en HuggingFace: https://huggingface.co/DT4H/
- Colección CardioNER: https://huggingface.co/collections/DT4H/cardioner
- GitHub de DataTools4Heart: https://github.com/DataTools4Heart/
- Web del proyecto DataTools4Heart: https://www.datatools4heart.eu/
