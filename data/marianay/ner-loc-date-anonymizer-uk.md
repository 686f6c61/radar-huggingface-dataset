# marianaY/ner-loc-date-anonymizer-uk

## Resumen

El modelo `marianaY/ner-loc-date-anonymizer-uk` es un sistema de reconocimiento de entidades nombradas (NER) diseñado específicamente para la anonimización de localizaciones (LOC) y fechas (DATE) en textos en ucraniano. Desarrollado por Mariana Yuvchenko (marianaY) y publicado en Hugging Face, este modelo se basa en la arquitectura XLM-RoBERTa y se presenta como una herramienta de token classification orientada a la detección de información sensible para su posterior enmascaramiento o eliminación, en línea con los requisitos de privacidad como el GDPR.

Con aproximadamente 277 millones de parámetros, el modelo es un fine-tuning de XLM-RoBERTa base, lo que le permite aprovechar el conocimiento multilingüe del modelo original mientras se especializa en la tarea de detección de entidades geográficas y temporales. Su relevancia actual radica en la creciente necesidad de proteger datos personales en textos no estructurados, especialmente en el contexto de la integración de LLMs en flujos de procesamiento de documentos. Aunque la model card oficial está prácticamente vacía, el nombre del modelo y los tags sugieren un uso directo en pipelines de anonimización para el idioma ucraniano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer) con cabeza de token classification |
| Parametros totales | 277.456.901 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa base soporta 512 tokens) |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32) |
| Idiomas soportados | ucraniano (inferido por el nombre y el contexto, no confirmado en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder basado en XLM-RoBERTa, una arquitectura multilingüe preentrenada con masked language modeling sobre 100 idiomas. Sobre esta base se añade una capa de clasificación por token para la tarea de NER, que asigna a cada token una etiqueta de entidad (probablemente LOC, DATE y posiblemente otras). El número total de parámetros coincide con el tamaño de XLM-RoBERTa base (278M), lo que indica que no se ha ampliado la arquitectura original.

No se dispone de información sobre el proceso de entrenamiento específico: ni el dataset utilizado, ni el número de tokens de entrenamiento, ni si se aplicaron técnicas como RLHF o DPO (en este caso, al ser un modelo discriminativo, no aplican). El paper "Introducing NER-UK 2.0" (2024) describe un corpus ucraniano con anotaciones para entidades como ORG, PERS, LOC y MISC, que podría ser una fuente plausible de datos, pero no hay confirmación de que este modelo lo haya utilizado. La model card solo indica que es un fine-tune de un modelo base no especificado, aunque el tag `xlm-roberta` y la referencia al paper `arxiv:1910.09700` (el artículo original de XLM-R) apuntan claramente a esa arquitectura.

## Capacidades

- Reconocimiento de entidades nombradas de tipo localización (LOC) y fecha (DATE) en texto ucraniano.
- Clasificación a nivel de token, lo que permite identificar los límites exactos de cada entidad dentro de una frase.
- Salida compatible con pipelines de transformers para token-classification, facilitando la integración en sistemas de anonimización.
- Capacidad multilingüe heredada de XLM-RoBERTa, aunque el fine-tuning parece estar orientado exclusivamente al ucraniano.
- No soporta tool calling, generación de texto ni razonamiento multi-paso; es un modelo puramente discriminativo.

## Casos de uso

- Anonimización de documentos legales: el modelo puede detectar fechas y ubicaciones en contratos o escritos judiciales ucranianos para enmascararlas antes de su publicación o intercambio, cumpliendo con normativas de protección de datos.
- Preprocesamiento de datos para entrenamiento de LLMs: antes de alimentar un corpus de texto ucraniano a un modelo generativo, se puede aplicar este NER para eliminar referencias geográficas y temporales que podrían identificar a individuos.
- Sanitización de historiales clínicos: en el ámbito sanitario ucraniano, los registros de pacientes a menudo contienen fechas de nacimiento o visitas y nombres de hospitales (LOC). El modelo puede identificar estas entidades para su anonimización automática.
- Cumplimiento del GDPR en empresas tecnológicas: compañías que procesan datos de usuarios ucranianos pueden usar este modelo para detectar y eliminar información de localización y tiempo en logs o tickets de soporte.
- Investigación en PII detection: como componente de un sistema más amplio de detección de información personal identificable (PII), combinado con otros modelos para nombres, emails o números de teléfono.
- Archivado y difusión de noticias: medios que publican artículos antiguos con referencias a lugares y fechas sensibles pueden anonimizarlos automáticamente antes de ponerlos en acceso abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay métricas de precisión, recall o F1 para este modelo en la model card ni en la búsqueda web. Se recomienda evaluar el modelo en un conjunto de validación propio antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: con 277 millones de parámetros en fp32, el modelo ocupa aproximadamente 1,1 GB en memoria (coincide con el tamaño del repo). En fp16 ocuparía unos 550 MB. Es ejecutable en CPU sin problemas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una RTX 3060 o superior permitiría inferencia en lote con baja latencia.
- En consumer GPU: sí, cabe en tarjetas de gama media como RTX 3060, RTX 4060 o incluso en iGPUs con suficiente RAM compartida.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con vLLM (aunque está pensado para generación, también soporta heads de clasificación), Hugging Face Inference Endpoints, o mediante scripts de Python con la librería `transformers`. También se puede exportar a ONNX para optimización en CPU.
- Latencia y throughput estimados: no disponibles, pero para un modelo de este tamaño en una GPU moderna se espera una latencia de milisegundos por frase corta y un throughput de cientos de frases por segundo en batch.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para NER en ucraniano. Como referencia general, se puede comparar con el propio XLM-RoBERTa base (sin fine-tuning) que no está especializado en NER, o con modelos como `Davlan/xlm-roberta-base-ner-hrl` (entrenado en múltiples idiomas de bajos recursos), aunque ninguno está optimizado para ucraniano ni para la tarea concreta de anonimización de fechas y localizaciones. La falta de benchmarks y de detalles de entrenamiento impide una comparativa cuantitativa rigurosa.

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| marianaY/ner-loc-date-anonymizer-uk | 277M | 512 | NER (LOC, DATE) en ucraniano | no disponible |
| XLM-RoBERTa base | 278M | 512 | MLM multilingüe | MIT |
| Davlan/xlm-roberta-base-ner-hrl | 278M | 512 | NER multilingüe (varios idiomas) | MIT |

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, datos de entrenamiento ni evaluación. No se puede garantizar la robustez del modelo en dominios específicos (legal, médico, etc.) sin pruebas adicionales.
- Al ser un modelo de NER, no genera texto y no es propenso a alucinaciones en el sentido generativo, pero puede cometer errores de clasificación (falsos positivos y negativos) que afecten a la anonimización.
- La longitud de contexto está limitada a 512 tokens (propia de XLM-RoBERTa base), por lo que documentos largos deben dividirse en fragmentos, lo que puede romper entidades que abarcan varios segmentos.
- No se especifica la licencia, lo que impide conocer si su uso comercial está permitido. Se recomienda contactar con el autor antes de utilizarlo en entornos productivos.
- El modelo parece estar especializado en ucraniano, pero no se confirma oficialmente. Su rendimiento en otros idiomas es probablemente deficiente.
- No hay información sobre el conjunto de etiquetas exacto (solo se infiere LOC y DATE por el nombre). Podría haber más categorías no documentadas.

## Enlaces

- [Modelo en Hugging Face: marianaY/ner-loc-date-anonymizer-uk](https://huggingface.co/marianaY/ner-loc-date-anonymizer-uk)
- [Modelo similar sin sufijo -uk: marianaY/ner-loc-date-anonymizer](https://huggingface.co/marianaY/ner-loc-date-anonymizer)
- [Perfil de la autora: marianaY](https://huggingface.co/marianaY)
- [Paper: Introducing NER-UK 2.0: A Rich Corpus of Named Entities for Ukrainian (2024)](https://aclanthology.org/2024.unlp-1.4/)
- [PDF del paper NER-UK 2.0](https://aclanthology.org/anthology-files/anthology-files/pdf/unlp/2024.unlp-1.4.pdf)
- [Repositorio de referencia sobre anonimización para LLMs](https://github.com/malteos/awesome-anonymization-for-llms)
