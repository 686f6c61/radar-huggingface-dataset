# DT4H/cardio-ner-es-symptom-cardioberta-multiclass

## Resumen

El modelo `DT4H/cardio-ner-es-symptom-cardioberta-multiclass` es un sistema de reconocimiento de entidades nombradas (NER) de tipo token-classification, especializado en la detección de síntomas en textos clínicos de cardiología en español. Ha sido desarrollado por el proyecto europeo DataTools4Heart (DT4H), que busca estandarizar el procesamiento de informes cardiológicos mediante técnicas de procesamiento de lenguaje natural (PLN). El modelo se basa en CardioBERTa, un modelo de lenguaje preentrenado específicamente en el dominio cardiológico, y se ha ajustado para la clasificación multiclase de síntomas.

Con 125,4 millones de parámetros, el modelo sigue la arquitectura RoBERTa-base y está disponible en formato safetensors. Su tamaño compacto lo hace adecuado para entornos con recursos limitados, y su enfoque en el español lo posiciona como una herramienta útil para el análisis de historiales clínicos y literatura médica en este idioma. Aunque no se especifica la licencia, el proyecto recibe financiación de la Unión Europea, lo que sugiere un posible uso en investigación y aplicaciones sanitarias.

La relevancia de este modelo radica en la creciente necesidad de extraer información estructurada de documentos clínicos no estructurados, especialmente en el ámbito cardiovascular, donde la detección temprana de síntomas es crítica. Su integración en pipelines de PLN puede facilitar tareas como la codificación automática de diagnósticos, la monitorización de pacientes o la investigación clínica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-base (fine-tuned sobre CardioBERTa) |
| Parametros totales | 125.389.827 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | Español (es) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa, un transformer encoder-only con atención bidireccional, que ha demostrado un buen rendimiento en tareas de comprensión del lenguaje. En concreto, se parte de CardioBERTa, un modelo preentrenado en corpus clínicos de cardiología en español, y se realiza un ajuste fino (fine-tuning) para la tarea de token-classification con etiquetas multiclase de síntomas. El número de parámetros (125,4 millones) coincide con el tamaño de RoBERTa-base, lo que sugiere una configuración de 12 capas, 12 cabezas de atención y una dimensión oculta de 768.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de épocas, la estrategia de optimización ni si se emplearon técnicas como data augmentation o validación cruzada. Tampoco se especifica si se utilizó algún método de alineamiento adicional (RLHF, DPO, etc.). El modelo se ha entrenado con PyTorch y se distribuye con código personalizado (`custom_code`), lo que puede implicar la necesidad de cargarlo con `trust_remote_code=True` en algunos entornos.

## Capacidades

- Reconocimiento de entidades nombradas (NER) para síntomas en textos de cardiología en español, con clasificación multiclase (probablemente varios tipos de síntomas, aunque no se detallan las etiquetas).
- Procesamiento de documentos clínicos como informes de alta, notas de evolución, resultados de pruebas o literatura médica.
- Integración sencilla con la librería `transformers` de Hugging Face mediante `AutoTokenizer` y `AutoModelForTokenClassification`.
- Funciona como un componente de extracción de información estructurada a partir de texto no estructurado.
- No se han documentado capacidades adicionales como tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Extracción de síntomas de informes de alta hospitalaria en cardiología: el modelo puede identificar y clasificar automáticamente los síntomas mencionados en cada informe, facilitando la codificación de diagnósticos y la creación de resúmenes estructurados.
- Monitorización de ensayos clínicos: en estudios sobre enfermedades cardiovasculares, el modelo puede procesar grandes volúmenes de notas clínicas para extraer síntomas relevantes y alimentar bases de datos de investigación.
- Anonimización de historiales clínicos: al detectar menciones de síntomas, el modelo puede ayudar a identificar secciones de texto que requieren revisión antes de compartir datos con fines de investigación.
- Soporte a la decisión clínica: integrado en un sistema de ayuda al diagnóstico, el modelo puede resaltar síntomas clave en la historia del paciente, ayudando al médico a identificar patrones de riesgo.
- Análisis de literatura médica en español: el modelo puede procesar artículos científicos y resúmenes de congresos para extraer síntomas asociados a procedimientos o tratamientos cardiológicos.
- Construcción de pipelines de PLN para sistemas de salud: al ser un modelo ligero, puede desplegarse en entornos con recursos limitados, como hospitales que no disponen de infraestructura GPU potente, para tareas de procesamiento por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como F1, precisión o recall sobre conjuntos de datos estándar (p. ej., CoNLL, MedMentions) ni comparaciones con otros modelos NER clínicos en español.

## Requisitos de hardware

- VRAM estimada para inferencia: con 125 millones de parámetros, el modelo en FP32 ocupa aproximadamente 500 MB, en FP16 unos 250 MB y en int8 unos 125 MB. Esto permite ejecutarlo en GPUs con 4 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060, o incluso CPUs con suficiente RAM (el modelo cabe en memoria RAM de 8 GB).
- Compatibilidad con GPU de consumo: sí, es perfectamente viable en tarjetas de gama media y baja.
- Opciones de despliegue: al ser un modelo de Hugging Face, se puede servir con `transformers` en modo batch, o mediante frameworks de inferencia como vLLM, TGI o llama.cpp (si se convierte a GGUF). También es posible usar `Ollama` si se exporta a formato compatible.
- Latencia y throughput: no se dispone de datos medidos, pero para un modelo de este tamaño, la inferencia en GPU suele ser del orden de milisegundos por secuencia corta (p. ej., 10-50 ms en una RTX 3060).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Tarea | Licencia |
|---|---|---|---|---|---|
| DT4H/cardio-ner-es-symptom-cardioberta-multiclass | 125,4 M | no disponible | Español | NER síntomas cardiología | no disponible |
| DT4H/en-symptom-cardioberta-multiclass-ner | no disponible | no disponible | Inglés | NER síntomas cardiología | no disponible |
| Otros modelos NER clínicos en español (p. ej., PlanTL-GOB-ES/roberta-base-bne) | 125 M | 512 | Español | NER general | Apache 2.0 (en algunos casos) |

La comparativa es limitada porque no se dispone de datos de rendimiento ni de licencia para el modelo en cuestión. El modelo en inglés de la misma familia (DT4H/en-symptom-cardioberta-multiclass-ner) es el equivalente más directo, pero no se han publicado métricas comparativas. Otros modelos NER clínicos en español, como los basados en RoBERTa-base entrenados por el BSC (Barcelona Supercomputing Center), podrían servir como referencia, pero no se han evaluado en el mismo corpus.

## Limitaciones y advertencias

- No se especifica la licencia, lo que genera incertidumbre sobre el uso comercial y la redistribución. Se recomienda contactar con los autores del proyecto DT4H antes de utilizarlo en producción.
- El modelo está especializado en el dominio de la cardiología y en el idioma español; su rendimiento en otros dominios médicos o en otros idiomas será previsiblemente bajo.
- No se han publicado métricas de evaluación, por lo que se desconoce su precisión, recall y F1 en tareas reales. Es necesario validarlo con datos propios antes de un despliegue clínico.
- Al ser un modelo de tamaño pequeño (125 M), puede tener limitaciones en la comprensión de contextos largos o en la captura de relaciones complejas entre entidades.
- El riesgo de alucinación (generar entidades inexistentes) es inherente a los modelos de NER, aunque en este caso la tarea es de etiquetado, no de generación libre. Aun así, puede haber errores de etiquetado en textos ambiguos.
- No se ha documentado el proceso de entrenamiento (datos, épocas, validación), lo que dificulta la reproducibilidad y la evaluación de sesgos.
- El modelo se distribuye con `custom_code`, lo que implica que al cargarlo se ejecuta código del autor; se debe revisar el código por seguridad en entornos corporativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DT4H/cardio-ner-es-symptom-cardioberta-multiclass
- Colección CardioNER en Hugging Face: https://huggingface.co/collections/DT4H/cardioner
- Proyecto DataTools4Heart (GitHub): https://github.com/DataTools4Heart/
- Web del proyecto DataTools4Heart: https://www.datatools4heart.eu/
- Modelo equivalente en inglés: https://huggingface.co/DT4H/en-symptom-cardioberta-multiclass-ner
- Repositorio de código para NER multilingüe del proyecto: https://github.com/nlp4bia-bsc/DT4H_Multilingual_NER
