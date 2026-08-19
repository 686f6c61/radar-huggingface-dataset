# DT4H/cardio-ner-es-cardioberta-multilabel

## Resumen

El modelo `DT4H/cardio-ner-es-cardioberta-multilabel` es un sistema de reconocimiento de entidades nombradas (NER) multilabel en español, especializado en el dominio de la cardiología. Desarrollado por el equipo del proyecto europeo DataTools4Heart (DT4H), este modelo está ajustado (fine-tuned) sobre `cardioberta`, una variante de RoBERTa entrenada con textos clínicos cardiológicos en español. Su función principal es identificar y clasificar de forma simultánea entidades relacionadas con enfermedades, medicamentos, procedimientos y síntomas dentro de documentos clínicos.

Con 125,4 millones de parámetros, se trata de un modelo de tamaño medio, comparable a un RoBERTa-base, que puede ejecutarse en hardware de consumo. Su relevancia radica en que aborda una necesidad concreta en el procesamiento del lenguaje natural clínico en español: la extracción estructurada de información cardiológica a partir de informes médicos no estructurados, lo que facilita tareas de codificación, investigación y análisis de datos de salud. El modelo se distribuye en formato safetensors y está pensado para su uso con la librería Transformers de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (variante clínica `cardioberta`) |
| Parametros totales | 125.394.441 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (español) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de tipo RoBERTa, concretamente en una variante denominada `cardioberta`, que ha sido preentrenada con corpus clínicos en español. Sobre esta base se ha realizado un ajuste fino para la tarea de token classification con etiquetado multilabel, lo que permite que una misma entidad pueda recibir varias etiquetas simultáneamente (por ejemplo, un término que sea a la vez síntoma y procedimiento). No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El entrenamiento se enmarca en el proyecto DataTools4Heart, financiado por el programa Horizon Europe de la Unión Europea (Grant Agreement No. 101057849), cuyo objetivo es desarrollar herramientas federadas y respetuosas con la privacidad para el análisis de datos cardiológicos.

## Capacidades

- Reconocimiento de entidades nombradas en textos clínicos en español, específicamente en el dominio de la cardiología.
- Clasificación multilabel de entidades en cuatro categorías: enfermedades, medicamentos, procedimientos y síntomas.
- Procesamiento de texto clínico no estructurado, como informes de alta, notas de evolución o resúmenes de historias clínicas.
- Integración sencilla con el ecosistema Hugging Face mediante `AutoModelForTokenClassification` y `AutoTokenizer`.
- No se han documentado capacidades adicionales como tool calling, agentes, razonamiento multi-paso o soporte multimodal.

## Casos de uso

- Extracción de entidades de informes de alta hospitalaria: el modelo puede procesar automáticamente informes de pacientes cardiológicos y extraer diagnósticos, fármacos prescritos, procedimientos realizados y síntomas reportados, facilitando la creación de resúmenes estructurados.
- Codificación clínica asistida: ayuda a los codificadores médicos a identificar términos relevantes para asignar códigos CIE-10 o similares, reduciendo el tiempo de revisión manual.
- Investigación retrospectiva en cardiología: permite construir cohortes de pacientes a partir de grandes volúmenes de historias clínicas electrónicas, identificando casos con determinadas enfermedades o tratamientos.
- Monitorización de ensayos clínicos: puede utilizarse para verificar que los criterios de inclusión y exclusión se cumplen en los documentos de los participantes, detectando menciones de enfermedades o medicamentos.
- Análisis de reacciones adversas a medicamentos: al identificar fármacos y síntomas en notas clínicas, el modelo puede apoyar la detección de posibles efectos secundarios en el ámbito cardiológico.
- Normalización de terminología clínica: las entidades extraídas pueden mapearse a vocabularios estándar como SNOMED CT o UMLS, mejorando la interoperabilidad de los datos de salud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como F1, precisión o recall sobre conjuntos de datos de referencia (p. ej., SMM4H, MedMentions o similares) para este modelo concreto.

## Requisitos de hardware

- Al tratarse de un modelo de 125 millones de parámetros, la inferencia puede ejecutarse en CPU con un consumo de memoria moderado (aproximadamente 500 MB en precisión fp32, 250 MB en fp16).
- En GPU, cabe en tarjetas de consumo como NVIDIA GTX 1060 (6 GB), RTX 2060, RTX 3060 o superiores, con VRAM suficiente para el modelo y el tokenizador.
- Para despliegue en producción, se recomienda el uso de servidores de inferencia como vLLM, TGI o Hugging Face Inference Endpoints, aunque también es posible ejecutarlo con `transformers` en modo batch.
- No se dispone de datos oficiales sobre latencia o throughput. En una GPU moderna, se espera un procesamiento de cientos de frases por segundo, pero estos valores dependen del hardware y del tamaño del lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DT4H/cardio-ner-es-cardioberta-multilabel | 125 M | no disponible | NER multilabel cardiología (es) | no disponible | Hugging Face |
| DT4H/es-disease-cardioberta-multiclass-ner | no disponible | no disponible | NER multiclase enfermedades (es) | no disponible | Hugging Face |
| DT4H/cardio-ner-sv-cardioberta-multilabel | no disponible | no disponible | NER multilabel cardiología (sv) | no disponible | Hugging Face |

No se dispone de información suficiente para comparar rendimiento con otros modelos NER clínicos en español, como BETO o modelos basados en RoBERTa genéricos. La comparativa se limita a modelos del mismo proyecto DT4H, de los que tampoco se conocen métricas.

## Limitaciones y advertencias

- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial y la redistribución del modelo.
- El modelo está especializado exclusivamente en el dominio cardiológico y en español; su rendimiento fuera de este ámbito o en otros idiomas será previsiblemente deficiente.
- No se han publicado detalles sobre los datos de entrenamiento, por lo que se desconocen posibles sesgos demográficos, geográficos o de estilo clínico.
- Al ser un modelo de NER, puede presentar errores de etiquetado en entidades poco frecuentes o ambiguas, y no está diseñado para generar texto ni responder preguntas.
- La longitud de contexto no se ha especificado; si sigue el estándar de RoBERTa-base, probablemente esté limitada a 512 tokens, lo que puede ser insuficiente para documentos clínicos extensos.
- No se han realizado evaluaciones independientes que validen su utilidad en entornos clínicos reales; se recomienda una validación exhaustiva antes de su uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/cardio-ner-es-cardioberta-multilabel
- Repositorio GitHub del proyecto NER multilingüe: https://github.com/nlp4bia-bsc/DT4H_Multilingual_NER
- Organización DataTools4Heart en GitHub: https://github.com/DataTools4Heart/
- Paper relacionado (SMM4H-HeaRD 2026): https://aclanthology.org/2026.smm4h-1.14/
