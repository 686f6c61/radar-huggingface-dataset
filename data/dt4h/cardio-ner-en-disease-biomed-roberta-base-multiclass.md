# DT4H/cardio-ner-en-disease-biomed-roberta-base-multiclass

## Resumen

El modelo `DT4H/cardio-ner-en-disease-biomed-roberta-base-multiclass` es un sistema de reconocimiento de entidades nombradas (NER) especializado en la detección de enfermedades en textos clínicos de cardiología en inglés. Ha sido desarrollado por el consorcio DT4H (DataTools4Heart), un proyecto financiado por el programa Horizon Europe de la Unión Europea (Grant Agreement No. 101057849). El modelo se basa en BioMed-RoBERTa-base, una arquitectura transformer encoder-only preentrenada por el Allen Institute for AI sobre literatura biomédica, y se ha ajustado (fine-tuning) para la tarea de clasificación de tokens (token-classification) con etiquetas multiclase para enfermedades.

Con aproximadamente 124,6 millones de parámetros, este modelo es compacto y adecuado para entornos con recursos limitados. Su relevancia radica en la necesidad de extraer información estructurada de historiales clínicos, informes de alta y literatura científica cardiológica, un paso clave para la investigación clínica, la codificación médica y los sistemas de apoyo a la decisión. Aunque el modelo está enfocado exclusivamente en el reconocimiento de enfermedades, forma parte de una familia más amplia de modelos NER del proyecto DT4H que cubren también medicamentos, procedimientos y síntomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-base (BioMed-RoBERTa) |
| Parametros totales | 124.647.939 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (típico de RoBERTa-base: 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de BioMed-RoBERTa-base, una variante de RoBERTa preentrenada exclusivamente sobre literatura biomédica (artículos de PubMed, abstracts, etc.). Esta arquitectura transformer encoder-only tiene 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, lo que le confiere una comprensión semántica profunda del lenguaje biomédico. Sobre esta base se ha realizado un ajuste fino supervisado para la tarea de NER multiclase, donde cada token se clasifica en una de las categorías relacionadas con enfermedades (por ejemplo, etiquetas BIO para inicio, interior y fuera de entidad). No se han publicado detalles sobre el dataset de entrenamiento específico, el número de épocas, la composición de las etiquetas ni si se emplearon técnicas como data augmentation o entrenamiento con múltiples folds. El framework utilizado es PyTorch, y el modelo se carga mediante la API estándar de Transformers.

## Capacidades

- Reconocimiento de entidades nombradas (NER) para enfermedades en textos cardiológicos en inglés.
- Clasificación de tokens a nivel de palabra o subpalabra, con etiquetas multiclase (probablemente formato BIO).
- Procesamiento de documentos clínicos como informes de alta, notas de progreso, resúmenes de historial y literatura científica.
- Inferencia eficiente gracias a su tamaño moderado (124,6M parámetros), apta para CPU y GPU de gama baja.
- Integración sencilla con el ecosistema Hugging Face mediante `AutoModelForTokenClassification`.
- No incluye capacidades de generación de texto, tool calling, agentes, visión ni audio.

## Casos de uso

- Extracción de diagnósticos de informes de alta hospitalaria: el modelo identifica menciones de enfermedades cardíacas (p. ej., "infarto de miocardio", "insuficiencia cardíaca") en texto libre, facilitando la codificación automática y la creación de resúmenes estructurados.
- Minería de literatura científica: análisis de abstracts y artículos de revistas de cardiología para extraer entidades de enfermedades, útil en revisiones sistemáticas y meta-análisis.
- Soporte a sistemas de codificación médica (CIE-10, SNOMED CT): al detectar enfermedades, el modelo puede alimentar pipelines que asignan códigos estandarizados, reduciendo el trabajo manual de codificadores clínicos.
- Investigación clínica: procesamiento de ensayos clínicos y registros de pacientes para identificar comorbilidades y eventos adversos relacionados con enfermedades cardíacas.
- Integración en historias clínicas electrónicas (HCE): como componente de un sistema de procesamiento de lenguaje natural que extrae información relevante para alertas, seguimiento de pacientes o estudios retrospectivos.
- Detección de enfermedades en notas de urgencias: ayuda a priorizar casos o a completar campos estructurados en sistemas de triaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como F1, precisión o recall sobre conjuntos de datos estándar (p. ej., i2b2, MIMIC, etc.) para este modelo concreto.

## Requisitos de hardware

- VRAM estimada: el modelo tiene ~125M parámetros. En FP32, el tamaño del checkpoint es de ~500 MB, por lo que la inferencia requiere menos de 1 GB de VRAM. Con cuantización a 8 bits o 4 bits, el consumo se reduce a ~250 MB o ~125 MB respectivamente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1060, RTX 2060, RTX 3050, o incluso GPUs integradas con soporte CUDA. También puede ejecutarse en CPU con razonable velocidad para lotes pequeños.
- Despliegue: compatible con la librería Transformers de Hugging Face, así como con ONNX Runtime, TorchScript y otras herramientas de serialización. No se han reportado configuraciones específicas para vLLM, llama.cpp u Ollama, dado que es un modelo encoder-only.
- Latencia y throughput: no se dispone de mediciones oficiales. En una GPU moderna (p. ej., RTX 3090), se espera una latencia de milisegundos por documento corto (menos de 512 tokens), y throughput de cientos de documentos por segundo en modo batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| DT4H/cardio-ner-en-disease-biomed-roberta-base-multiclass | 124,6M | no disponible | NER de enfermedades en cardiología | no disponible | Modelo objetivo |
| DT4H/cardio-ner-en-biomed-roberta-base-multiclass | 124,6M (estimado) | no disponible | NER de enfermedades, medicamentos, procedimientos y síntomas | no disponible | Modelo hermano con más categorías |
| BioMed-RoBERTa-base (sin fine-tune) | 124,6M | 512 | Modelo base preentrenado | Apache 2.0 (según AI2) | No realiza NER directamente, requiere ajuste |
| ClinicalBERT (BioClinicalBERT) | 110M | 512 | NER clínico general | MIT | Preentrenado en notas clínicas de MIMIC-III |

La comparativa se basa en características arquitectónicas y de propósito, ya que no se dispone de resultados de rendimiento para el modelo objetivo. El modelo hermano `cardio-ner-en-biomed-roberta-base-multiclass` cubre un espectro más amplio de entidades, mientras que el modelo aquí descrito se centra exclusivamente en enfermedades, lo que puede ofrecer mayor precisión en esa categoría específica.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés; no soporta otros idiomas.
- Su dominio se limita a la cardiología; puede tener un rendimiento deficiente en textos de otras especialidades médicas.
- No se ha especificado la licencia, por lo que el uso comercial es incierto y se recomienda contactar con los autores (DT4H) para aclarar los términos.
- Al ser un modelo de NER, puede presentar errores de etiquetado (falsos positivos o negativos), especialmente con enfermedades poco frecuentes o expresiones ambiguas.
- No debe utilizarse como herramienta de diagnóstico clínico sin supervisión humana; es un componente de apoyo a la decisión.
- No se han publicado detalles sobre el dataset de entrenamiento, lo que impide evaluar posibles sesgos demográficos o geográficos en los textos de origen.
- La longitud de contexto no está documentada; si se mantiene el límite de 512 tokens de RoBERTa-base, los documentos largos deberán segmentarse, lo que puede afectar a la coherencia de las entidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/cardio-ner-en-disease-biomed-roberta-base-multiclass
- Repositorio GitHub del proyecto DT4H Multilingual NER: https://github.com/nlp4bia-bsc/DT4H_Multilingual_NER
- Página de BioMed-RoBERTa en OpenPHR: https://openphr.org/models/biomed-roberta.html
- Artículo del taller SMM4H-HeaRD 2026 (PDF): https://aclanthology.org/2026.smm4h-1.14.pdf
