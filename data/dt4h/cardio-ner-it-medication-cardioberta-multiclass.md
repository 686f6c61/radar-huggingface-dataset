# DT4H/cardio-ner-it-medication-cardioberta-multiclass

## Resumen

El modelo `cardio-ner-it-medication-cardioberta-multiclass` es un sistema de reconocimiento de entidades nombradas (NER) especializado en la detección de menciones de medicamentos en textos clínicos de cardiología en italiano. Ha sido desarrollado por el consorcio DataTools4Heart (DT4H), un proyecto europeo centrado en la reutilización de datos sanitarios mediante técnicas de aprendizaje federado y síntesis de datos. El modelo parte de `CardioBERTa.it`, un BERT monolingüe entrenado sobre corpus clínicos italianos, y se ha ajustado mediante clasificación de tramos (span classification) con etiquetado IOB para identificar exclusivamente la entidad `MEDICATION`.

Con 109 millones de parámetros, este modelo ofrece una solución ligera y eficiente para extraer información farmacológica de informes de cardiología, un paso clave para la estructuración de historias clínicas electrónicas y la investigación farmacoepidemiológica. Su relevancia actual radica en la creciente necesidad de procesar datos clínicos no estructurados en entornos hospitalarios y de investigación, donde la precisión en la identificación de medicamentos es crítica para la seguridad del paciente y el análisis de tratamientos. El modelo se distribuye bajo licencia MIT, lo que facilita su adopción tanto en entornos académicos como comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only transformer) |
| Parametros totales | 109.339.395 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (típico de BERT: 512 tokens, no confirmado) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantización específica) |
| Idiomas soportados | Italiano |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `CardioBERTa.it`, un transformer encoder monolingüe para italiano entrenado sobre dominios clínicos y biomédicos. La arquitectura es la de BERT original, con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, lo que explica sus 109 millones de parámetros. Sobre esta base se ha realizado un ajuste fino (fine-tuning) para la tarea de clasificación de tramos, añadiendo una capa de clasificación por token que asigna etiquetas IOB (B-MEDICATION, I-MEDICATION, O) a cada token de entrada.

El entrenamiento se llevó a cabo mediante validación cruzada de 10 pliegues sobre la parte italiana del corpus CardioCCC (DataTools4Heart Cardiology Clinical Case Corpus), concretamente los lotes 1 y 2, que contienen 508 documentos clínicos anotados. El checkpoint publicado corresponde a la media aritmética de los 10 modelos resultantes de cada pliegue, una técnica de promediado de pesos (weight-averaging) que suele mejorar la robustez y la generalización. No se menciona el uso de RLHF ni DPO; el ajuste es supervisado sobre anotaciones manuales.

## Capacidades

- Reconocimiento de entidades de medicamentos en texto clínico de cardiología en italiano, mediante clasificación de tramos con etiquetado IOB.
- Procesamiento de secuencias largas mediante ventanas deslizantes (stride) para textos que exceden la longitud máxima del modelo.
- Integración sencilla con la librería `transformers` de Hugging Face mediante el pipeline `token-classification`.
- Soporte para inferencia en lote y despliegue en entornos de producción con frameworks como vLLM o TGI (aunque al ser un modelo BERT, su uso principal es en pipelines de NLP clásicos).
- Capacidad multilingüe limitada: solo italiano, aunque el proyecto DT4H ofrece variantes para sueco y español con la misma arquitectura.

## Casos de uso

- **Extracción de medicamentos de informes de alta hospitalaria**: el modelo puede procesar automáticamente los textos de los informes de cardiología para identificar los fármacos prescritos, facilitando la creación de resúmenes estructurados y la integración en sistemas de historia clínica electrónica.
- **Farmacovigilancia y detección de reacciones adversas**: al extraer menciones de medicamentos de notas clínicas, se pueden correlacionar con eventos adversos registrados, ayudando a identificar señales de seguridad de forma temprana.
- **Investigación farmacoepidemiológica**: los datos extraídos permiten construir cohortes de pacientes según los tratamientos recibidos, posibilitando estudios observacionales sobre efectividad y riesgos de fármacos cardiovasculares.
- **Anonimización de historias clínicas**: aunque el modelo solo detecta medicamentos, puede integrarse en pipelines de desidentificación para localizar y enmascarar información farmacológica sensible antes de compartir datos.
- **Asistencia a la codificación clínica**: la identificación de medicamentos puede complementar sistemas de codificación automática (p. ej., ATC) al proporcionar las menciones textuales exactas que luego se mapean a códigos estandarizados.
- **Análisis de adherencia terapéutica**: en estudios longitudinales, el modelo puede extraer menciones de medicamentos de notas de seguimiento para evaluar cambios en la medicación y posibles abandonos de tratamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como precisión, recall o F1 sobre el corpus de validación. Se recomienda consultar el repositorio GitHub de CardioNER para posibles evaluaciones adicionales.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 109 millones de parámetros, en FP32 el modelo ocupa aproximadamente 437 MB, y en FP16 unos 219 MB. La inferencia en CPU es viable, aunque más lenta; en GPU se puede ejecutar con menos de 2 GB de VRAM.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1650, RTX 3060, o incluso GPUs integradas con soporte CUDA. Para despliegues en producción, una T4 o A10 es más que adecuada.
- **Compatibilidad con GPU de consumo**: sí, cabe en cualquier GPU moderna de consumo, incluso en modelos de gama baja.
- **Opciones de despliegue**: al ser un modelo BERT, se puede servir con `transformers` (pipeline), `ONNX Runtime`, `TensorRT`, o mediante frameworks de inferencia como `vLLM` (aunque no es óptimo para encoders). También se puede exportar a formato ONNX para entornos sin dependencias de Python.
- **Latencia y throughput**: no se dispone de datos medidos. En una GPU T4, se espera una latencia de unos pocos milisegundos por documento corto (menos de 512 tokens), con un throughput de cientos de documentos por segundo en procesamiento por lotes.

## Comparativa con modelos similares

| Modelo | Idioma | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cardio-ner-it-medication-cardioberta-multiclass` | Italiano | 109 M | NER de medicamentos en cardiología | MIT | Hugging Face |
| `cardio-ner-es-medication-cardioberta-multiclass` | Español | 109 M (estimado) | NER de medicamentos en cardiología | MIT | Hugging Face |
| `cardio-ner-sv-medication-cardioberta-multiclass` | Sueco | 109 M (estimado) | NER de medicamentos en cardiología | MIT | Hugging Face |

Los tres modelos comparten la misma arquitectura y metodología de entrenamiento, diferenciándose únicamente en el idioma. No se dispone de comparaciones con otros modelos NER biomédicos (p. ej., BioBERT, PubMedBERT) en la información proporcionada.

## Limitaciones y advertencias

- **Idioma restringido**: el modelo solo funciona con texto en italiano; no es aplicable a otros idiomas sin reentrenamiento.
- **Entidad única**: solo detecta la entidad `MEDICATION`; no reconoce dosis, vías de administración ni otros conceptos farmacológicos.
- **Dominio específico**: entrenado exclusivamente sobre textos de cardiología, por lo que su rendimiento puede degradarse en otros dominios clínicos (p. ej., oncología, pediatría).
- **Riesgo de alucinación**: aunque es un modelo NER y no generativo, puede producir etiquetas incorrectas en textos con terminología ambigua o poco frecuente.
- **Sesgos de anotación**: los datos provienen de un corpus específico (CardioCCC) con anotaciones humanas; pueden existir sesgos en la definición de "medicamento" (p. ej., inclusión de placebos o suplementos).
- **Licencia MIT**: permite uso comercial sin restricciones, pero el usuario es responsable del cumplimiento de normativas de protección de datos (p. ej., GDPR) al procesar información clínica real.
- **Sin garantía de precisión clínica**: el modelo no ha sido validado para uso diagnóstico o terapéutico; cualquier aplicación clínica requiere supervisión humana.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/DT4H/cardio-ner-it-medication-cardioberta-multiclass)
- [Repositorio CardioNER en GitHub](https://github.com/DataTools4Heart/CardioNER)
- [Proyecto DataTools4Heart](https://www.datatools4heart.eu/)
- [Publicaciones del proyecto](https://www.datatools4heart.eu/publications/)
- [Modelo base CardioBERTa.it](https://huggingface.co/DT4H/CardioBERTa.it)
