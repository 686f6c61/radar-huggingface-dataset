# DT4H/cardio-ner-en-disease-cardioberta-multiclass

## Resumen

Cardio-Ner-En-Disease-Cardioberta-Multiclass es un modelo de reconocimiento de entidades nombradas (NER) especializado en el dominio de la cardiología, desarrollado por el consorcio DataTools4Heart (DT4H) en el marco del proyecto europeo Horizon Europe (Grant Agreement No. 101057849). El modelo está diseñado específicamente para la identificación y clasificación de entidades relacionadas con enfermedades cardíacas en texto clínico en inglés, lo que lo convierte en una herramienta orientada a la extracción de información estructurada a partir de historiales médicos no estructurados, notas clínicas y literatura científica.

El modelo se basa en la arquitectura RoBERTa, con un total de 124.647.939 parámetros, y está entrenado para la tarea de token-classification (clasificación de tokens a nivel de secuencia). El repositorio incluye pesos en formato safetensors con un tamaño de 0.2 GB, y el modelo se integra fácilmente con el ecosistema de Hugging Face Transformers mediante las clases `AutoTokenizer` y `AutoModelForTokenClassification`. Su relevancia radica en que aborda un problema específico dentro del ámbito de la salud: la extracción automática de diagnósticos y enfermedades cardíacas a partir de texto clínico, un paso previo necesario para el análisis federado y la reutilización de datos sanitarios que persigue el proyecto DT4H.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) |
| Parametros totales | 124.647.939 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura RoBERTa, un transformer encoder basado en BERT que optimiza el preentrenamiento mediante la eliminación de la predicción de la siguiente frase (NSP) y el uso de máscaras dinámicas. Con 124.647.939 parámetros, se sitúa en el rango de los modelos RoBERTa-large, aunque no se especifica si se trata de una variante adaptada al dominio clínico (como BioBERT o PubMedBERT) o si el ajuste fino se realizó sobre el RoBERTa base. El modelo está especializado en la clasificación de tokens para NER, lo que implica una cabeza de clasificación sobre cada token de la secuencia de entrada.

No se dispone de información detallada sobre el proceso de entrenamiento: ni el número de tokens de entrenamiento, ni la composición del dataset, ni si se aplicaron técnicas de alineamiento como RLHF o DPO. Dado que se trata de un modelo de NER supervisado, es probable que se haya utilizado un corpus clínico etiquetado manualmente o semiautomáticamente, pero estos datos no están disponibles en la documentación proporcionada. El proyecto DataTools4Heart se centra en la reutilización de datos cardiovasculares y el aprendizaje federado, por lo que es plausible que el entrenamiento se haya realizado sobre datos clínicos europeos, aunque no se confirma.

## Capacidades

- Reconocimiento de entidades nombradas (NER) para enfermedades cardíacas en texto clínico en inglés.
- Clasificación de tokens a nivel de secuencia mediante `AutoModelForTokenClassification`.
- Integración nativa con el ecosistema Hugging Face Transformers.
- Diseñado específicamente para el dominio de la cardiología, lo que implica un vocabulario y contexto especializados.
- Capacidad de procesamiento de texto clínico no estructurado, como notas de alta, informes de consulta o resúmenes de historial médico.
- No se ha documentado soporte para tool calling, generación de texto libre, razonamiento multi-paso ni capacidades multimodales.

## Casos de uso

- Extracción de diagnósticos en historiales clínicos electrónicos: el modelo puede procesar notas clínicas en inglés e identificar automáticamente menciones de enfermedades cardíacas (p. ej., insuficiencia cardíaca, miocardiopatía, fibrilación auricular), lo que permite estructurar la información para su posterior análisis y consulta.
- Construcción de bases de datos clínicas estructuradas: integrado en un pipeline de procesamiento de lenguaje natural, el modelo convierte texto libre en registros etiquetados, facilitando la creación de cohortes de pacientes para estudios observacionales o ensayos clínicos.
- Anonimización y desidentificación asistida: aunque no es su función principal, la identificación de entidades de enfermedad puede servir como paso previo para localizar y enmascarar información sensible en documentos clínicos antes de compartirlos en entornos federados.
- Soporte a la codificación médica automática: las entidades de enfermedad detectadas pueden mapearse a sistemas de codificación estandarizados (p. ej., CIE-10) mediante reglas o modelos auxiliares, reduciendo la carga administrativa del personal clínico.
- Análisis de literatura científica en cardiología: el modelo puede aplicarse a artículos y abstracts para extraer menciones de enfermedades, facilitando revisiones sistemáticas o minería de textos biomédicos.
- Preparación de datos para aprendizaje federado: dentro del ecosistema DataTools4Heart, el modelo permite homologar y estructurar datos de múltiples centros hospitalarios antes de aplicar técnicas de análisis federado o generación de datos sintéticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como precisión, recall, F1 sobre conjuntos de validación estándar (p. ej., i2b2, MIMIC-III, n2c2) ni comparaciones con otros modelos de NER clínico. Se recomienda evaluar el modelo en el dominio específico antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: con 124.647.939 parámetros en fp32, el modelo requiere aproximadamente 0.5 GB de VRAM solo para los pesos, más el overhead de activaciones y atención. Con cuantización a int8, el requisito baja a unos 0.25 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en lotes pequeños (p. ej., NVIDIA GTX 1650, RTX 2060, T4). Para entrenamiento o fine-tuning adicional, se recomienda una GPU con 8-16 GB de VRAM (RTX 3070, RTX 4080, A10).
- Sí cabe en GPUs de consumo: el modelo es ligero y puede ejecutarse en cualquier GPU moderna de consumo sin problemas.
- Opciones de despliegue: al ser un modelo estándar de Hugging Face, puede servirse con vLLM, TGI (Text Generation Inference), o integrarse en pipelines de Transformers. Para CPU, se puede exportar a ONNX o utilizar `torch.compile` para optimizar la inferencia.
- Latencia y throughput: no se han publicado datos oficiales. En una GPU T4, la inferencia para secuencias de 128-256 tokens debería completarse en decenas de milisegundos por muestra, pero estos valores son estimaciones orientativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| DT4H/cardio-ner-en-disease-cardioberta-multiclass | 124,6 M | no disponible | NER enfermedades cardíacas | no disponible |
| BioBERT (base, 110 M) | 110 M | 512 | NER clínico general | CC BY 4.0 (para BioBERT v1.0) |
| PubMedBERT (base, 110 M) | 110 M | 512 | NER biomédico | MIT (para PubMedBERT) |
| RoBERTa-large (original) | 355 M | 512 | NER general | MIT (para RoBERTa) |

La comparativa se limita a modelos de referencia en el dominio clínico, ya que no se dispone de información sobre modelos directamente comparables en el nicho específico de cardiología. La principal diferencia de este modelo es su especialización en enfermedades cardíacas, que podría ofrecer un mejor rendimiento en ese dominio concreto frente a modelos generalistas de NER clínico, aunque no hay datos que lo confirmen.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos conocidos, pero al ser un modelo entrenado probablemente con datos clínicos de origen europeo, puede presentar sesgos hacia poblaciones o sistemas sanitarios específicos.
- Riesgo de alucinación no aplicable directamente, al ser un modelo de clasificación de tokens y no generativo; sin embargo, puede producir etiquetas incorrectas o inconsistentes, por lo que requiere supervisión humana en contextos de alto riesgo.
- Limitaciones de contexto: no se documenta la longitud máxima de secuencia soportada, aunque RoBERTa suele soportar 512 tokens; las notas clínicas largas pueden requerir truncamiento o estrategias de ventanas deslizantes.
- Restricciones de licencia: la licencia no está especificada, lo que impide determinar si su uso comercial está permitido. Se recomienda contactar con el equipo de DataTools4Heart antes de utilizarlo en entornos productivos o comerciales.
- El modelo está limitado al inglés y al dominio de la cardiología; su rendimiento fuera de este ámbito o en otros idiomas será probablemente deficiente.
- No se proporcionan instrucciones de uso detalladas, ni ejemplos de inferencia más allá de la carga del modelo, ni se especifica el esquema de etiquetas utilizado (p. ej., BIO, IOB2), lo que puede dificultar su integración en pipelines existentes.
- Al ser un modelo de un proyecto de investigación europeo, puede estar sujeto a condiciones de uso específicas derivadas de la financiación pública (Horizon Europe).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/cardio-ner-en-disease-cardioberta-multiclass
- Repositorio relacionado (variante multiclase): https://huggingface.co/DT4H/cardio-ner-en-cardioberta-multiclass
- Repositorio relacionado (NER enfermedad): https://huggingface.co/DT4H/en-disease-cardioberta-multiclass-ner
- Organización GitHub de DataTools4Heart: https://github.com/DataTools4Heart/
- Sitio web del proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Ficha del proyecto en CORDIS (Comisión Europea): https://cordis.europa.eu/project/id/101057849
