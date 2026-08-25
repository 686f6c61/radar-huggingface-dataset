# DT4H/cardio-ner-en-symptom-biomed-roberta-base-multiclass

## Resumen

El modelo `DT4H/cardio-ner-en-symptom-biomed-roberta-base-multiclass` es un sistema de reconocimiento de entidades nombradas (NER) especializado en la detección de síntomas en textos clínicos de cardiología en inglés. Ha sido desarrollado por el consorcio DT4H (DataTools4Heart), un proyecto financiado por el programa Horizon Europe de la Unión Europea, y se enmarca dentro de una familia de modelos multilingües de NER clínico para el dominio cardiovascular.

El modelo se basa en la arquitectura BioMed-RoBERTa-base, un transformer preentrenado exclusivamente sobre literatura biomédica por el Allen Institute for AI (AI2), y se ha ajustado para la clasificación de tokens en la tarea de detección de síntomas. Con aproximadamente 124,6 millones de parámetros y un tamaño de repositorio de 0,2 GB, está diseñado para su integración en pipelines de procesamiento de lenguaje natural clínico, especialmente en entornos donde se requiere extraer información sintomática de historiales médicos o notas de pacientes.

Su relevancia actual radica en la creciente necesidad de herramientas de extracción de información estructurada a partir de texto clínico no estructurado, particularmente en el ámbito cardiovascular, donde la identificación precisa de síntomas es crítica para el diagnóstico asistido, la investigación clínica y los sistemas de apoyo a la decisión médica. El modelo se distribuye en formato safetensors y es compatible con el ecosistema Hugging Face Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BioMed-RoBERTa-base (transformer encoder) |
| Parametros totales | 124.647.939 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (se asume 512 tokens, propio de RoBERTa-base, pero no confirmado) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repositorio) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre BioMed-RoBERTa-base, una variante de RoBERTa preentrenada con 2,68 millones de articulos de PubMed y 2,47 millones de articulos de PubMed Central, lo que le proporciona una base solida en terminologia biomedica. La capa de clasificacion es una cabeza de clasificacion de tokens (token-classification) que asigna una etiqueta a cada token, probablemente siguiendo el esquema BIO (Begin, Inside, Outside) para la deteccion de sintomas.

No se dispone de informacion detallada sobre el proceso de ajuste fino: no se especifican el numero de epocas, el tamaño del dataset de entrenamiento, la composicion de los datos clinicos utilizados ni si se aplicaron tecnicas de aumentacion de datos o regularizacion adicional. Tampoco se documenta el uso de metodos como RLHF o DPO, que no son habituales en tareas de NER. El proyecto DT4H ha publicado otros modelos similares para diferentes idiomas (sueco, holandes) y con distintas etiquetas (enfermedad, medicacion, procedimiento, sintoma), lo que sugiere un enfoque sistematico de entrenamiento multilingue dentro del mismo marco.

## Capacidades

- Deteccion de entidades de sintomas en textos clinicos cardiologicos en ingles.
- Clasificacion de tokens a nivel de palabra o subpalabra, adecuada para extraer menciones de sintomas como "chest pain", "dyspnea" o "palpitations".
- Integracion sencilla con la API de Hugging Face Transformers mediante `AutoModelForTokenClassification`.
- Compatible con pipelines de NER existentes en el ecosistema Python.
- No se documentan capacidades de generacion de texto, razonamiento, tool calling, agentes o multimodalidad.

## Casos de uso

- Extraccion de sintomas de historiales clinicos electronicos: el modelo puede procesar notas de pacientes y extraer menciones de sintomas cardiologicos, facilitando la creacion de bases de datos estructuradas para estudios epidemiologicos o ensayos clinicos.
- Soporte a la codificacion clinica: ayuda a identificar sintomas que deben codificarse segun clasificaciones estandar (p. ej., CIE-10), reduciendo el trabajo manual de los codificadores.
- Sistemas de alerta temprana en urgencias: al analizar textos de triaje o informes de admision, puede detectar sintomas de alto riesgo como dolor toracico o disnea, contribuyendo a priorizar atencion.
- Investigacion en cardiologia: permite analizar grandes volumenes de literatura cientifica o registros de pacientes para correlacionar sintomas con desenlaces o tratamientos.
- Enriquecimiento de grafos de conocimiento clinico: las entidades extraidas pueden integrarse en grafos semanticos para representar relaciones entre sintomas, enfermedades y medicamentos.
- Desarrollo de chatbots de salud cardiovascular: aunque el modelo no genera texto, puede servir como componente de extraccion de entidades en un sistema conversacional que pregunte al usuario por sus sintomas y los interprete.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como F1, precision o recall sobre conjuntos de validacion estandar (p. ej., i2b2, n2c2) ni comparaciones con otros modelos de NER clinico.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 124 millones de parametros, la inferencia en CPU es viable con latencias de decenas de milisegundos por secuencia corta. En GPU, se puede ejecutar con menos de 1 GB de VRAM en precision FP32, y menos aun en FP16 o con cuantizacion (aunque no se ofrecen archivos cuantizados).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo NVIDIA GTX 1050 Ti, RTX 2060 o superiores. Tambien funciona en CPU sin problemas para cargas moderadas.
- Si cabe en consumer GPU: si, en practicamente cualquier GPU comercial moderna.
- Opciones de despliegue: se puede servir con Hugging Face Transformers, TorchServe, ONNX Runtime, o mediante frameworks de inferencia como vLLM (aunque vLLM esta optimizado para generacion, no para NER clasico). Tambien es posible exportar a ONNX para entornos de produccion.
- Latencia y throughput estimados: no se dispone de mediciones oficiales. En una GPU RTX 3090, se espera un throughput de miles de secuencias por segundo para secuencias de 128 tokens, pero estos valores son estimaciones orientativas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con alternativas de la misma categoria. El proyecto DT4H ha publicado otros modelos de NER cardiologico para distintos idiomas (p. ej., `DT4H/cardio-ner-sv-bert-based-swedish-cased-multilabel` o `DT4H/cardio-ner-sv-cardioberta-multilabel`), pero no se han encontrado modelos equivalentes en ingles con la misma especializacion en sintomas y basados en BioMed-RoBERTa. Modelos genericos de NER clinico como `d4data/biomedical-ner-all` o `dslim/bert-base-NER` podrian servir como referencia, pero no se dispone de datos comparativos publicados.

## Limitaciones y advertencias

- Sesgos conocidos: al estar preentrenado sobre literatura biomedica, puede reflejar sesgos presentes en dicha literatura, como infrarrepresentacion de ciertos grupos poblacionales o variaciones dialectales del ingles.
- Riesgo de alucinacion: en tareas de NER, el riesgo de alucinacion se manifiesta como etiquetado incorrecto de tokens que no son sintomas, o la omision de sintomas reales. No se han publicado evaluaciones de este riesgo.
- Limitaciones de contexto: la arquitectura RoBERTa-base tiene una longitud maxima de contexto de 512 tokens, lo que limita el procesamiento de documentos clinicos largos sin segmentacion previa.
- Limitaciones de idioma: el modelo solo soporta ingles, y no se ha evaluado su rendimiento en otros idiomas ni en variantes regionales del ingles.
- Restricciones de licencia: la licencia no esta especificada en la model card, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar con los autores del proyecto DT4H antes de utilizarlo en entornos de produccion.
- Caveat de produccion: no se proporcionan garantias de exactitud clinica. El modelo debe ser validado por profesionales sanitarios antes de cualquier uso diagnostico o terapeutico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/cardio-ner-en-symptom-biomed-roberta-base-multiclass
- Repositorio de codigo del proyecto DT4H Multilingual NER: https://github.com/nlp4bia-bsc/DT4H_Multilingual_NER
- Paper del taller SMM4H-HeaRD 2026 (menciona el proyecto DT4H): https://aclanthology.org/2026.smm4h-1.14/
- Pagina de BioMed-RoBERTa en OpenPHR: https://openphr.org/models/biomed-roberta.html
