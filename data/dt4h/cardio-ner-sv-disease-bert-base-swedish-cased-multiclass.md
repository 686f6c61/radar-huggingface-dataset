# DT4H/cardio-ner-sv-disease-bert-base-swedish-cased-multiclass

## Resumen

El modelo `DT4H/cardio-ner-sv-disease-bert-base-swedish-cased-multiclass` es un sistema de reconocimiento de entidades nombradas (NER) especializado en la detección de enfermedades cardiológicas en textos clínicos en sueco. Ha sido desarrollado por el equipo DT4H (DataTools4Heart), un proyecto europeo financiado por Horizon Europe, con el objetivo de facilitar la reutilización de datos no estructurados en el ámbito cardiovascular. Se trata de un fine-tuning del modelo BERT base sueco `KBLab/bert-base-swedish-cased` para la tarea de clasificación de tokens (token-classification), con un total de 124.102.659 parámetros.

La relevancia de este modelo radica en su enfoque específico para un idioma de baja representación en el ámbito de la IA clínica (el sueco) y para un dominio concreto (cardiología). Permite extraer menciones de enfermedades cardíacas a partir de informes médicos, historiales clínicos o literatura científica, lo que facilita tareas de análisis y minería de datos en sistemas de salud nórdicos. Aunque no se proporcionan detalles sobre el conjunto de datos de entrenamiento ni métricas de rendimiento, su arquitectura basada en BERT y su especialización lo convierten en una herramienta potencialmente útil para proyectos de procesamiento de lenguaje natural clínico en Suecia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (encoder transformer, 12 capas, 768 dimensiones ocultas, 12 cabezas de atención) |
| Parametros totales | 124.102.659 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (típico de BERT: 512 tokens, pero no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | sueco (sv) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT (Bidirectional Encoder Representations from Transformers), un transformer encoder con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, entrenado originalmente por KBLab sobre corpus suecos. Para esta versión, se ha realizado un fine-tuning sobre el modelo base `KBLab/bert-base-swedish-cased` para la tarea de token-classification, específicamente para el reconocimiento de entidades de enfermedades cardiológicas. La capa de salida es una cabecera de clasificación de tokens que asigna una etiqueta a cada token (por ejemplo, enfermedad o no enfermedad). No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El framework utilizado es PyTorch, y el modelo se carga mediante `AutoModelForTokenClassification` de Transformers.

## Capacidades

- Reconocimiento de entidades nombradas (NER) para enfermedades cardiológicas en textos suecos.
- Clasificación de tokens a nivel de token (token-classification), identificando menciones de enfermedades en oraciones.
- Especialización en el dominio clínico cardiovascular, lo que mejora la precisión en terminología médica sueca.
- Integración sencilla con el ecosistema Hugging Face Transformers mediante `AutoTokenizer` y `AutoModelForTokenClassification`.
- No se han documentado capacidades adicionales como tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Extracción de diagnósticos de informes de alta hospitalaria: el modelo puede procesar textos clínicos en sueco y extraer automáticamente las enfermedades cardíacas mencionadas, facilitando la codificación y el análisis retrospectivo.
- Minería de historiales clínicos electrónicos: permite identificar pacientes con patologías cardiovasculares específicas a partir de notas de evolución, ayudando en estudios epidemiológicos.
- Análisis de literatura científica sueca: puede localizar menciones de enfermedades cardíacas en artículos de investigación, acelerando revisiones sistemáticas.
- Soporte a sistemas de ayuda al diagnóstico: al extraer entidades de enfermedades, puede alimentar sistemas de recomendación o alertas clínicas.
- Normalización de datos clínicos: las entidades extraídas pueden mapearse a ontologías o códigos estándar (p. ej., ICD-10) para integrar datos no estructurados en bases de datos estructuradas.
- Investigación en salud pública: análisis de tendencias de enfermedades cardiovasculares a partir de textos de registros médicos suecos, contribuyendo a políticas sanitarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval, GSM8K o evaluaciones específicas de NER (p. ej., F1, precisión, recall) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo BERT base (~124M parámetros), en FP32 ocupa aproximadamente 500 MB de memoria. Con cuantización a 8 bits o 4 bits, el uso de VRAM se reduce a unos 250-300 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1050 Ti, RTX 2060 o superiores. También puede ejecutarse en CPU con razonable velocidad para inferencia por lotes pequeños.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU moderna de consumo (serie RTX 30/40, incluso en integradas con suficiente RAM compartida).
- Opciones de despliegue: puede servirse mediante Hugging Face Transformers, ONNX Runtime, o frameworks como vLLM (aunque no es óptimo para modelos encoder pequeños). También es compatible con llama.cpp si se convierte a GGUF, aunque no se proporcionan cuantizaciones oficiales.
- Latencia y throughput: no se han publicado mediciones. En una GPU moderna (p. ej., RTX 3090), la inferencia para una frase de 128 tokens suele ser inferior a 10 ms; en CPU, puede rondar los 50-100 ms por frase.

## Comparativa con modelos similares

| Modelo | Idioma | Tarea | Parámetros | Contexto | Licencia |
|---|---|---|---|---|---|
| DT4H/cardio-ner-sv-disease-bert-base-swedish-cased-multiclass | sueco | NER de enfermedades cardiológicas | 124M | no disponible | no disponible |
| DT4H/cardio-ner-sv-bert-based-swedish-cased-multilabel | sueco | NER multilabel (enfermedad, medicación, procedimiento, síntoma) | no disponible | no disponible | no disponible |
| DT4H/en-disease-cardioberta-multiclass-ner | inglés | NER de enfermedades cardiológicas | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos. La principal diferencia es el alcance de las etiquetas (multiclass vs. multilabel) y el idioma. El modelo aquí descrito se centra exclusivamente en enfermedades, mientras que el multilabel cubre más categorías.

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado únicamente para el reconocimiento de enfermedades cardiológicas en sueco; no es adecuado para otros dominios médicos ni para otros idiomas sin reentrenamiento.
- Sin información sobre sesgos: no se han documentado posibles sesgos de género, edad o procedencia en los datos de entrenamiento, lo que podría afectar a la equidad en entornos clínicos reales.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar etiquetas incorrectas o inventar entidades si el texto de entrada es ambiguo o contiene terminología no vista durante el entrenamiento.
- Licencia no especificada: no se indica la licencia de uso, lo que puede limitar su adopción en entornos comerciales o de investigación sin consulta previa al autor.
- Sin métricas de rendimiento: la ausencia de benchmarks publicados impide evaluar su precisión real frente a alternativas, por lo que se recomienda validación interna antes de su uso en producción.
- Dependencia del modelo base: al ser un fine-tuning de `KBLab/bert-base-swedish-cased`, hereda las limitaciones de ese modelo, como una longitud de contexto máxima de 512 tokens (aunque no se confirma en la documentación).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/cardio-ner-sv-disease-bert-base-swedish-cased-multiclass
- Repositorio GitHub del proyecto DT4H Multilingual NER: https://github.com/nlp4bia-bsc/DT4H_Multilingual_NER
- Paper relacionado (SMM4H-HeaRD 2026): https://aclanthology.org/2026.smm4h-1.14.pdf
- Proyecto DataTools4Heart en CORDIS: https://cordis.europa.eu/project/id/101057849
