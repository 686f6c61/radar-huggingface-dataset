# OpenMed/GLiNER2.5-ClinicalNER-Disease-Spanish-v1

## Resumen

GLiNER2.5-ClinicalNER-Disease-Spanish-v1 es un modelo de reconocimiento de entidades nombradas (NER) especializado en la extracción de menciones de enfermedades en texto clínico en castellano. Lo desarrolla OpenMed, un proyecto que publica modelos abiertos para procesamiento de lenguaje clínico y biomédico orientados a ejecución local. El modelo parte del checkpoint multilingüe fastino/gliner2.5-multi-v1 y se ha ajustado de forma supervisada sobre el corpus DisTEMIST, un conjunto de informes de casos clínicos en español anotados con entidades de enfermedad, incluidas las anidadas.

La tarea que resuelve es concreta: dado un texto clínico, devuelve cada mención de enfermedad con sus desplazamientos de caracteres exactos (`start`, `end`) y una puntuación de confianza. No genera texto libre ni razona; es un extractor de spans basado en la formulación GLiNER, en la que las etiquetas se pasan como prompt en lenguaje natural (en este caso, la etiqueta `enfermedad o trastorno`). Con 287 millones de parámetros y licencia Apache-2.0, está pensado para integrarse en pipelines de historia clínica electrónica que requieren procesamiento local por motivos de privacidad.

Su relevancia actual radica en dos factores. Primero, el ajuste fino aporta una mejora sustancial frente al modelo base: 73,26 F1 frente a 39,07 F1 en el mismo conjunto de evaluación, es decir, +34,2 puntos. Segundo, el modelo cabe en CPU y se distribuye en formato safetensors, lo que facilita su despliegue en entornos hospitalarios sin GPU dedicada. El repositorio ocupa 1,2 GB y el modelo se publicó a finales de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2 (extractor de entidades zero-shot basado en encoder transformer; detalles internos de la arquitectura base no disponibles) |
| Parametros totales | 287.355.159 (287M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el SDK permite ejecucion en CPU y GPU) |
| Idiomas soportados | español (es) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre fastino/gliner2.5-multi-v1, un checkpoint de la familia GLiNER2. La formulación GLiNER trata el NER como una tarea de emparejamiento entre representaciones de tokens del texto y representaciones de las etiquetas proporcionadas como prompt, lo que permite extraer entidades de categorías definidas en tiempo de inferencia sin una cabeza de clasificación fija. En este caso, la etiqueta utilizada durante el entrenamiento es `enfermedad o trastorno`, en español, y el modelo devuelve spans exactos con puntuación de confianza. No se dispone de información detallada sobre el número de capas, dimensión oculta o mecanismo de atención del encoder base.

El ajuste se realizó sobre el corpus bigbio/distemist. Según la model card, el conjunto se dividió en 452 documentos para entrenamiento, 148 para selección de hiperparámetros y 150 documentos reservados para la evaluación final, con 1.723 menciones de enfermedad anotadas manualmente, incluidas las anidadas. La evaluación se hizo una sola vez sobre esos 150 documentos, con criterio de coincidencia exacta del span de caracteres. El umbral por defecto es 0,4. No se indica en la información disponible si se aplicaron técnicas de RLHF, DPO u otras fases de alineación, algo esperable en un modelo discriminativo de este tipo.

## Capacidades

- Extracción de menciones de enfermedad en texto clínico en español, con desplazamientos de caracteres exactos (`text[start:end]`) y puntuación de confianza por entidad.
- Manejo de entidades anidadas: el conjunto de evaluación incluye menciones solapadas y anidadas, y el modelo se entrena y evalúa con ese criterio.
- Procesamiento de notas clínicas completas: el SDK `analyze_text` segmenta el texto en frases (`sentence_language="es"`) y devuelve los offsets referidos al texto original.
- Reconocimiento de abreviaturas clínicas frecuentes en español, como HTA, DM2, EPOC e IC, según los ejemplos de la model card.
- Ejecución en CPU y en GPU (mediante `OpenMedConfig(device="cuda")`), con carga única del modelo y caché para procesar lotes de notas en bucle.
- No dispone de generación de texto, razonamiento libre, tool calling, capacidades de agente, visión ni audio. Es exclusivamente un token-classification / span extraction.

## Casos de uso

- Codificación de diagnósticos en historia clínica electrónica: el modelo recorre notas de alta o informes de consulta y devuelve cada mención de enfermedad con su span exacto, que después puede mapearse a códigos CIE-10 o SNOMED CT mediante un diccionario o un normalizador posterior. La coincidencia exacta de offsets facilita ese mapeo sin reensamblar cadenas.
- Construcción de cohortes retrospectivas: sobre un archivo de informes, se ejecuta `analyze_text` en bucle (el modelo queda cacheado) y se filtran los documentos que contienen menciones de una enfermedad concreta con confianza superior a 0,4, lo que permite seleccionar pacientes para estudios observacionales.
- Desidentificación y enriquecimiento combinados: en un pipeline del SDK OpenMed, la extracción de enfermedades se ejecuta junto con módulos de de-identificación, de modo que la nota se anonimiza y se etiqueta clínicamente en la misma pasada local, sin enviar datos a servicios externos.
- Extracción de comorbilidades para modelos de riesgo: a partir de los spans detectados en el apartado de antecedentes, se construye un vector de comorbilidades por paciente que alimenta modelos predictivos de reingreso o mortalidad.
- Indexación semántica de corpus clínicos: las menciones extraídas se usan como términos de índice para un motor de búsqueda documental interno, lo que permite recuperar informes por enfermedad sin depender de coincidencia literal de cadenas.
- Preanotación para revisión humana: el modelo genera anotaciones automáticas con confianza que un codificador clínico revisa y corrige, lo que reduce el coste de anotación en la creación de nuevos corpus etiquetados en español.
- Investigación en NLP clínico en español: al ser Apache-2.0 y ejecutable en CPU, sirve como línea base reproducible para comparar arquitecturas de NER clínico sobre DisTEMIST.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y la model card. La evaluación se realizó sobre 150 documentos reservados de DisTEMIST (1.723 menciones anotadas, incluidas anidadas), con criterio de coincidencia exacta del span. No se utilizó el conjunto de test oficial de DisTEMIST, por lo que los resultados no son comparables con la tabla del shared task.

| Modelo | Umbral | Precision | Recall | F1 |
|---|---:|---:|---:|---:|
| OpenMed GLiNER2.5 ClinicalNER Disease Spanish v1 (este modelo) | 0,4 | 74,53 | 72,03 | **73,26** |
| fastino/gliner2.5-multi-v1 (antes del ajuste) | 0,7 | 38,14 | 40,05 | 39,07 |
| OpenMed mmBERT ClinicalNER Disease Spanish Base v1 | por defecto | 67,11 | 73,07 | 69,96 |

La mejora del ajuste fino es de +34,2 puntos F1 (intervalo de confianza del 95 %: +31,1 a +37,1, bootstrap emparejado sobre 142 grupos de documentos de la misma publicación). A umbral idéntico de 0,5, las puntuaciones son 73,08 para este modelo y 36,01 para el modelo base sin ajustar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 287M parámetros en safetensors, los pesos en fp32 ocupan aproximadamente 1,15 GB; en fp16, unos 0,57 GB. El repositorio completo ocupa 1,2 GB.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cualquier GPU con al menos 2 GB de VRAM libre es suficiente; una RTX 4090, A100 o H100 queda muy por encima de lo necesario y solo aporta ventaja en throughput por lotes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante, en términos de memoria). El modelo está diseñado para ejecutarse en CPU, según la model card.
- Opciones de despliegue: SDK OpenMed (`pip install -U "openmed[gliner2]"`, versión 3.2 o posterior) con `analyze_text`; configuración de dispositivo mediante `OpenMedConfig(device="cuda")`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, coherentes con un modelo discriminativo de este tamaño.
- Latencia y throughput: no disponibles en la información proporcionada. La model card solo indica que el modelo se carga una vez y queda en caché para llamadas repetidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 (DisTEMIST, 150 docs) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| OpenMed GLiNER2.5 ClinicalNER Disease Spanish v1 | 287M | no disponible | 73,26 | Apache-2.0 | Hugging Face (OpenMed) |
| fastino/gliner2.5-multi-v1 (modelo base) | no disponible | no disponible | 39,07 | no disponible en la información | Hugging Face (fastino) |
| OpenMed mmBERT ClinicalNER Disease Spanish Base v1 | 308M | no disponible | 69,96 | no disponible en la información | Hugging Face (OpenMed) |

La comparación se limita a los tres modelos evaluados por OpenMed sobre el mismo conjunto reservado. No se dispone de datos de otros extractores de NER clínico en español (por ejemplo, modelos basados en RoBERTa-BNE o MarIA) evaluados sobre esta misma partición, por lo que no se incluyen.

## Limitaciones y advertencias

- El modelo extrae únicamente la categoría `enfermedad o trastorno`. No detecta fármacos, procedimientos, síntomas ni otras entidades clínicas, y no realiza normalización a códigos terminológicos.
- La evaluación se hizo sobre una partición reservada de DisTEMIST y no sobre el test oficial del shared task, por lo que los 73,26 F1 no son directamente comparables con resultados publicados en la tabla oficial.
- El criterio de evaluación es coincidencia exacta del span; variantes de anotación (por ejemplo, inclusión o exclusión de modificadores) pueden penalizar el rendimiento en uso real.
- El umbral por defecto de 0,4 está calibrado sobre esta partición; en dominios distintos (informes quirúrgicos, notas de urgencias, textos de atención primaria) puede requerir recalibración.
- Riesgo de falsos positivos en abreviaturas ambiguas: la model card muestra IC detectada con confianza 0,58, por debajo de otras abreviaturas, lo que sugiere menor fiabilidad en siglas cortas o polisémicas.
- Solo soporta español. No hay evidencia de rendimiento en textos multilingües ni en variantes dialectales distintas del español peninsular.
- No se han publicado análisis de sesgos demográficos ni de equidad en la información disponible.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo procesa datos de salud; su uso en producción exige cumplimiento normativo (RGPD, normativa de dispositivos médicos) que la licencia no cubre.
- El modelo tiene 4 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es todavía muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenMed/GLiNER2.5-ClinicalNER-Disease-Spanish-v1
- Organización OpenMed en Hugging Face: https://huggingface.co/OpenMed
- SDK OpenMed en GitHub: https://github.com/maziyarpanahi/openmed
- Paquete OpenMed en PyPI: https://pypi.org/project/openmed/
- Modelo base fastino/gliner2.5-multi-v1: https://huggingface.co/fastino/gliner2.5-multi-v1
- Dataset DisTEMIST (bigbio): https://huggingface.co/datasets/bigbio/distemist
- Paper de referencia citado en los tags (arXiv:2508.01630): https://arxiv.org/abs/2508.01630
- Paper de referencia citado en los tags (arXiv:2507.18546): https://arxiv.org/abs/2507.18546
- OpenMed en X: https://x.com/OpenMed_AI
