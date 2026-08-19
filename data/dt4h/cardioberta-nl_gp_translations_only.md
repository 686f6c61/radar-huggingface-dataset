# DT4H/CardioBERTa.nl_GP_translations_only

## Resumen

CardioBERTa.nl_GP_translations_only es un codificador de terminología biomédica en neerlandés desarrollado por el consorcio DataTools4Heart (DT4H), especializado en normalización de conceptos clínicos y entity linking. El modelo se inicializa desde UMCU/CardioBERTa.nl y se ajusta mediante tripletas supervisadas por Concept Unique Identifiers (CUIs) de UMLS, empleando metric learning con Multi-Similarity Loss. Su objetivo es representar términos clínicos en un espacio vectorial donde sinónimos y conceptos relacionados queden próximos, facilitando la recuperación de candidatos y la normalización de entidades en textos cardiovasculares.

La arquitectura base es RoBERTa con 125,98 millones de parámetros, adaptada al dominio cardiológico mediante continued pretraining con Masked Language Modeling sobre corpus biomédicos monolingües en neerlandés. El entrenamiento de especialización utilizó 4.753.324 tripletas que cubren 476.971 CUIs y 534.613 términos normalizados únicos, enriqueciendo las relaciones de sinonimia con relaciones ontológicas de nivel "grandparent" (abuelo) de la jerarquía UMLS. La ventana de contexto es de 512 tokens, aunque el entrenamiento de especialización usó una longitud máxima de 25 tokens por término.

Su relevancia radica en cubrir una necesidad específica en el ecosistema de procesamiento de lenguaje clínico en neerlandés: la normalización de conceptos cardiológicos con un modelo compacto y eficiente, entrenado explícitamente para entity linking, y que no distribuye los datos de entrenamiento por restricciones de licencia de UMLS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (Transformer encoder) |
| Parametros totales | 125.978.112 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (entrenamiento de especializacion con max_length=25) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, compatible con cuantizacion estandar de Transformers) |
| Idiomas soportados | Neerlandes (nl) |
| Licencia | no disponible (los datos de entrenamiento estan sujetos a licencia UMLS; la licencia del modelo no se especifica en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RoBERTa estándar: un transformer encoder con atención bidireccional, 12 capas ocultas, 768 dimensiones de embedding y 12 cabezas de atención, lo que resulta en 125,98 millones de parámetros. El backbone proviene de la familia CardioBERTa, que se adaptó al dominio cardiológico mediante continued pretraining con Masked Language Modeling sobre corpus monolingües biomédicos y cardiológicos. La familia CardioLM cubre siete idiomas: checo, neerlandés, inglés, italiano, rumano, español y sueco.

La especialización para entity linking se realizó con tripletas CUI-supervisadas extraídas de terminología UMLS. La estrategia "grandparents" enriquece las relaciones de sinonimia con relaciones ontológicas de nivel abuelo, generando 4.753.324 tripletas. El entrenamiento usó Multi-Similarity Loss con minería de todas las tripletas (margin 0.2), pooling sobre el token CLS, una época, batch size de 256 y learning rate de 2e-5. La longitud máxima de secuencia se limitó a 25 tokens por término. Los datos de entrenamiento no se distribuyen por restricciones de licencia UMLS; solo se publican estadísticas agregadas.

## Capacidades

- Normalización de conceptos clínicos: mapea términos biomédicos en neerlandés a conceptos UMLS (CUIs) mediante embeddings de similitud coseno.
- Entity linking: dado un término o mención clínica, recupera el concepto canónico más cercano en el espacio vectorial.
- Recuperación de candidatos biomédicos: genera representaciones densas para búsqueda de términos relacionados en pipelines de NLP clínico.
- Codificación de terminología cardiológica: especializado en vocabulario cardiovascular, aunque cubre terminología biomédica general.
- Embeddings de términos: produce vectores normalizados L2 de 768 dimensiones, listos para indexación y búsqueda de similitud.
- Multilingüe indirecto: aunque el modelo es monolingüe neerlandés, pertenece a una familia multilingüe (CardioBERTa) que permite proyección cruzada entre idiomas si se usan los modelos hermanos.

## Casos de uso

- Normalización de diagnósticos en historiales clínicos electrónicos neerlandeses: el modelo puede mapear menciones libres de enfermedades cardiovasculares a códigos UMLS estandarizados, facilitando la interoperabilidad entre sistemas hospitalarios.
- Construcción de cohortes de pacientes para investigación: al normalizar términos clínicos a CUIs, los investigadores pueden consultar repositorios federados (como la plataforma DT4H) con criterios estandarizados y reproducibles.
- Enriquecimiento de ontologías biomédicas: el encoder permite detectar términos duplicados o relacionados en vocabularios clínicos neerlandeses, ayudando a mantener la coherencia de recursos terminológicos.
- Anotación automática de textos cardiológicos: integrado en pipelines de NLP, puede sugerir conceptos UMLS para cada mención detectada por un sistema de reconocimiento de entidades nombradas (NER).
- Búsqueda semántica en literatura clínica: permite recuperar artículos o fragmentos de texto que mencionan conceptos relacionados, aunque el término de búsqueda no coincida literalmente con el texto indexado.
- Desambiguación de términos ambiguos: al usar pooling CLS y entrenamiento con tripletas, el modelo puede distinguir usos contextuales de términos polisémicos en el dominio cardiológico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación como precisión en entity linking, recall@k o comparativas con otros codificadores biomédicos neerlandeses.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 125,98 millones de parámetros. En FP32, los pesos ocupan aproximadamente 504 MB; en FP16, unos 252 MB. La inferencia con batch pequeño cabe en GPUs con 4 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (NVIDIA GTX 1660, RTX 2060, RTX 3060, etc.) es suficiente para inferencia. Para entrenamiento o fine-tuning adicional, se recomienda 8 GB o más.
- Compatibilidad con consumer GPU: sí, es un modelo compacto que se ejecuta sin problemas en GPUs de consumo.
- Opciones de despliegue: compatible con Hugging Face Transformers, Text Embeddings Inference (TEI), endpoints de Hugging Face, y cualquier framework que soporte modelos BERT-like (ONNX Runtime, TensorRT, etc.).
- Latencia estimada: para un término de 25 tokens, la inferencia en GPU típicamente toma entre 5 y 20 ms, dependiendo del hardware. En CPU, puede tomar entre 50 y 200 ms por término.

## Comparativa con modelos similares

| Modelo | Idioma | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|---|
| CardioBERTa.nl_GP_translations_only (este modelo) | Neerlandés | 125,98 M | 512 | Cardiología + entity linking UMLS | no disponible |
| UMCU/CardioBERTa.nl (modelo base) | Neerlandés | 125,98 M | 512 | Cardiología (MLM) | no disponible |
| MedRoBERTa.nl | Neerlandés | 125 M aprox. | 512 | Dominio médico general | no disponible |
| XLM-RoBERTa-base | Multilingüe (incluye nl) | 278 M | 512 | General multilingüe | MIT |

El modelo se distingue de su base (CardioBERTa.nl) por el entrenamiento específico en entity linking con tripletas UMLS. Comparado con MedRoBERTa.nl, este modelo añade la capa de normalización de conceptos, que MedRoBERTa no ofrece. Frente a XLM-RoBERTa, es monolingüe y especializado, lo que suele dar mejor rendimiento en tareas biomédicas neerlandesas a costa de perder cobertura multilingüe.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con terminología UMLS, puede heredar sesgos presentes en los recursos terminológicos originales, como subrepresentación de ciertas poblaciones o variantes lingüísticas regionales del neerlandés.
- Riesgo de alucinación: como encoder de términos, no genera texto libre, por lo que el riesgo de alucinación es bajo. Sin embargo, puede producir embeddings que sugieran relaciones conceptuales incorrectas si el término de entrada está fuera del dominio de entrenamiento.
- Limitaciones de contexto: la ventana de 512 tokens es adecuada para términos y frases cortas, pero no para documentos completos. El entrenamiento con max_length=25 optimiza el modelo para términos, no para contextos extensos.
- Restricciones de licencia: la licencia del modelo no está especificada. Los datos de entrenamiento están sujetos a la licencia de UMLS, que restringe su redistribución. El uso comercial puede requerir verificación adicional.
- Idioma: exclusivamente neerlandés. No soporta otros idiomas directamente, aunque los modelos hermanos de la familia CardioBERTa cubren otros seis idiomas europeos.
- No apto para decisión clínica: la model card indica explícitamente que no está destinado a la toma de decisiones clínicas directas.
- Sin benchmarks publicados: no hay métricas de rendimiento disponibles, lo que dificulta evaluar su calidad relativa frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/CardioBERTa.nl_GP_translations_only
- Modelo base (UMCU/CardioBERTa.nl): https://huggingface.co/UMCU/CardioBERTa.nl
- Colección CardioNER de DT4H: https://huggingface.co/collections/DT4H/cardioner
- Organización DataTools4Heart en GitHub: https://github.com/DataTools4Heart/
- Referencia: Danu et al., *CardioLM - a multilingual suite of small language models for the cardiology domain* (proyecto DataTools4Heart, Grant Agreement 101057849)
