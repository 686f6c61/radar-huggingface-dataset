# DT4H/cardio-ner-en-medication-biomed-roberta-base-multiclass

## Resumen

El modelo `DT4H/cardio-ner-en-medication-biomed-roberta-base-multiclass` es un sistema de reconocimiento de entidades nombradas (NER) diseñado específicamente para identificar menciones de medicamentos en textos clínicos de cardiología en inglés. Ha sido desarrollado por el consorcio DataTools4Heart (DT4H), un proyecto europeo financiado por el programa Horizon Europe (Grant Agreement No. 101057849) que busca crear una plataforma federada y respetuosa con la privacidad para el análisis de datos cardiovasculares. El modelo se enmarca dentro de un conjunto de herramientas de procesamiento de lenguaje natural clínico orientadas a extraer información estructurada de historiales médicos, informes de alta y literatura científica.

Desde el punto de vista técnico, se trata de un fine-tuning de `BioMed-RoBERTa-base`, un transformer encoder-only preentrenado en corpus biomédicos, adaptado a la tarea de token-classification (etiquetado de secuencias). El modelo cuenta con 124.647.939 parámetros, lo que lo sitúa en la gama de los modelos base (~125M), y su tamaño de repositorio es de 0,2 GB. Aunque no se especifica la longitud de contexto, la arquitectura subyacente de RoBERTa-base admite típicamente 512 tokens, pero este dato no está confirmado en la documentación oficial. Su relevancia radica en la creciente necesidad de automatizar la extracción de información farmacológica en el ámbito cardiovascular, donde la precisión en la identificación de medicamentos es crítica para estudios farmacoepidemiológicos, ensayos clínicos y sistemas de apoyo a la decisión clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (RoBERTa) basado en BioMed-RoBERTa-base |
| Parametros totales | 124.647.939 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (típico de RoBERTa-base: 512, no confirmado) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `BioMed-RoBERTa-base`, un transformer encoder-only preentrenado con la metodología RoBERTa sobre textos biomédicos (PubMed, PMC, etc.). Sobre esta base se ha realizado un fine-tuning supervisado para la tarea de token-classification, es decir, asignar a cada token una etiqueta de entidad (en este caso, medicamentos). La capa de salida es una cabecera de clasificación de tokens que produce etiquetas por token, típicamente en formato BIO (Begin, Inside, Outside) o similar, aunque el etiquetado exacto no se detalla en la documentación.

No se proporcionan datos sobre el corpus de entrenamiento específico, el número de tokens utilizados ni el proceso de ajuste (por ejemplo, si se empleó alguna técnica de regularización o aumento de datos). El proyecto DataTools4Heart se centra en datos de salud cardiovascular de múltiples fuentes europeas, por lo que es plausible que el entrenamiento haya utilizado anotaciones clínicas reales o sintéticas, pero esta información no está disponible públicamente. Tampoco se menciona el uso de RLHF o DPO, que no son habituales en tareas de NER.

## Capacidades

- Reconocimiento de entidades de medicación en textos clínicos de cardiología en inglés (nombres de fármacos, posiblemente dosis y vías de administración, aunque no se especifica la taxonomía exacta).
- Procesamiento de secuencias de hasta 512 tokens (límite típico de RoBERTa-base, no confirmado en la documentación).
- Integración sencilla con el ecosistema Hugging Face mediante `AutoModelForTokenClassification` y `AutoTokenizer`.
- No dispone de capacidades de generación de texto, tool calling, agentes, visión ni audio. Es un modelo exclusivamente discriminativo para etiquetado de secuencias.

## Casos de uso

- Extracción de medicación de informes de alta hospitalaria: el modelo puede procesar automáticamente secciones de tratamiento y listar los fármacos mencionados, facilitando la codificación y el análisis retrospectivo.
- Análisis de historiales clínicos electrónicos para estudios farmacoepidemiológicos: permite identificar patrones de prescripción y asociaciones entre medicamentos y eventos cardiovasculares a gran escala.
- Soporte a sistemas de codificación automática: las entidades extraídas pueden mapearse a vocabularios estandarizados como ATC o SNOMED CT, reduciendo el trabajo manual de codificadores clínicos.
- Revisión de literatura médica: ayuda a investigadores a extraer tratamientos cardiovasculares mencionados en artículos científicos, acelerando revisiones sistemáticas y meta-análisis.
- Integración en pipelines de procesamiento de lenguaje natural clínico: puede combinarse con otros modelos NER (enfermedades, procedimientos) para construir representaciones estructuradas de documentos clínicos.
- Validación de ensayos clínicos: permite verificar que los criterios de inclusión/exclusión relacionados con medicación se cumplen en los registros de pacientes, mejorando la selección de candidatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como F1, precisión o recall sobre conjuntos de prueba estándar (p.ej. i2b2, n2c2) ni comparaciones con otros modelos NER clínicos.

## Requisitos de hardware

- Inferencia en CPU: viable para procesamiento por lotes pequeños; el modelo tiene ~125M de parámetros, lo que requiere aproximadamente 500 MB de RAM en FP32.
- Inferencia en GPU: cualquier GPU con al menos 2 GB de VRAM es suficiente (p.ej. NVIDIA T4, GTX 1650, RTX 2060). En FP32, el modelo ocupa ~500 MB, y en cuantización FP16 o int8, menos de 250 MB.
- Despliegue: compatible con la librería `transformers` de Hugging Face, así como con ONNX Runtime y TensorRT para optimización. No es adecuado para vLLM (diseñado para modelos generativos), pero puede servirse mediante Hugging Face Inference Endpoints o contenedores Docker con FastAPI.
- Latencia: en una GPU moderna (p.ej. T4), la inferencia sobre un texto de 512 tokens tarda del orden de 10-30 ms; en CPU, puede ser de 100-300 ms. El throughput depende del hardware y del tamaño de lote.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo con otros modelos. Sin embargo, dentro del mismo proyecto DT4H existen variantes para otros idiomas y entidades, como `cardio-ner-sv-bert-based-swedish-cased-multilabel` (sueco, multilabel) o `cardio-ner-sv-cardioberta-multilabel` (sueco, basado en CardioBERTa). Estos modelos comparten la misma tarea de NER clínico pero difieren en idioma y taxonomía de entidades. No hay métricas públicas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No se especifica la licencia, por lo que el uso comercial requiere contactar con el autor (DT4H) para obtener autorización explícita.
- El modelo está entrenado exclusivamente en inglés y en el dominio de cardiología; su rendimiento en otros idiomas o especialidades médicas será probablemente deficiente.
- No se han documentado sesgos específicos, pero al entrenarse con textos clínicos puede heredar sesgos de género, edad o grupo étnico presentes en los datos originales.
- Riesgo de errores de etiquetado en entidades ambiguas (p.ej. nombres de fármacos que coinciden con nombres comunes) o en contextos con negación (p.ej. "el paciente no toma aspirina").
- La longitud de contexto no está confirmada; si se superan los 512 tokens, será necesario truncar o dividir el texto, lo que puede perder información relevante.
- No se proporcionan métricas de rendimiento, por lo que se recomienda validar el modelo en el corpus objetivo antes de su uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/DT4H/cardio-ner-en-medication-biomed-roberta-base-multiclass
- Proyecto DataTools4Heart (GitHub): https://github.com/DataTools4Heart/
- Repositorio de código NER multilingüe (nlp4bia-bsc): https://github.com/nlp4bia-bsc/DT4H_Multilingual_NER
- Paper SMM4H-HeaRD 2026 (PDF): https://aclanthology.org/2026.smm4h-1.14.pdf
