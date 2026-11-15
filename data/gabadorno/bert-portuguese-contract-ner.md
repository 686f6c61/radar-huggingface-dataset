# gabadorno/bert-portuguese-contract-ner

## Resumen

El modelo `gabadorno/bert-portuguese-contract-ner` es un extractor de entidades nombradas (NER) especializado en contratos redactados en portugués brasileño. Lo publica el usuario gabadorno en Hugging Face y se construye mediante fine-tuning supervisado sobre BERTimbau (`neuralmind/bert-base-portuguese-cased`), el BERT base entrenado específicamente para portugués por Neuralmind. Su función es identificar y etiquetar cuatro tipos de entidades críticas en el texto contractual: contratante, contratado, valor monetario y fecha.

Se trata de un modelo encoder-only de tipo BERT con 108.339.465 parámetros, orientado a token classification con esquema BIO. No es un modelo generativo: no produce texto, sino etiquetas por token, lo que lo hace adecuado para pipelines de extracción estructurada en document AI. El repositorio ocupa 0,4 GB y los pesos se distribuyen en formato safetensors.

Su relevancia radica en la especialización vertical: frente a modelos NER genéricos en portugués, este se ha ajustado sobre muestras de contratos comerciales sintetizados y balanceados, lo que reduce el ruido en dominios legales y administrativos. La licencia MIT facilita su integración en productos comerciales sin restricciones adicionales, algo poco habitual en modelos de dominio legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT base) |
| Parametros totales | 108.339.465 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (arquitectura BERT base, típicamente 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; admite cuantización estándar vía herramientas externas) |
| Idiomas soportados | portugués (pt), orientado a portugués brasileño |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `neuralmind/bert-base-portuguese-cased` (BERTimbau), un transformer encoder-only con 12 capas, atención bidireccional y vocabulario en portugués con distinción de mayúsculas. Sobre esa base se aplica una cabeza de clasificación de tokens (`AutoModelForTokenClassification`) que etiqueta cada token según el esquema BIO para las cuatro entidades definidas: `CONTRATANTE`, `CONTRATADO`, `VALOR` y `DATA`.

El fine-tuning se realizó con el optimizador AdamW, 3 épocas y una tasa de aprendizaje de 2e-5, sobre un dataset de muestras de contratos comerciales sintetizados y balanceados en portugués brasileño. La model card no especifica el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como DPO o RLHF (no procede en un encoder-only de clasificación). Tampoco se documentan innovaciones arquitectónicas más allá del ajuste supervisado estándar.

## Capacidades

- Reconocimiento de entidades nombradas en textos contractuales en portugués brasileño.
- Extracción de cuatro entidades: contratante, contratado, valor monetario y fecha.
- Etiquetado por token con esquema BIO, integrable en pipelines de `transformers`.
- Agregación de entidades a nivel de palabra o frase mediante `aggregation_strategy="simple"` en el pipeline NER.
- Procesamiento de documentos legales y administrativos con estructura contractual.
- No soporta generación de texto, tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multimodales (visión, audio) ni de modo thinking.
- Capacidad multilingüe limitada al portugués; no se declaran otros idiomas.

## Casos de uso

- Extracción automática de partes contratantes en plataformas de gestión contractual: el modelo etiqueta `CONTRATANTE` y `CONTRATADO` en el texto, permitiendo poblar bases de datos de contratos sin revisión manual inicial.
- Digitalización de contratos en bufetes y departamentos legales: tras un OCR, el texto se pasa por el pipeline NER para recuperar valores y fechas de vigencia, reduciendo el tiempo de triaje documental.
- Automatización de cuentas por pagar: identificación de `VALOR` y `DATA` en contratos de proveedores para conciliar importes y vencimientos con el ERP.
- Enriquecimiento de repositorios documentales (DMS/ECM): indexación de contratos por entidad y fecha para búsqueda facetada y recuperación posterior.
- Validación de plantillas contractuales: comparación de entidades extraídas entre borrador y contrato firmado para detectar discrepancias en importes o fechas.
- Preprocesado para modelos generativos: usar el NER como paso determinista de extracción y reservar un LLM solo para tareas de resumen o razonamiento sobre los campos ya estructurados, reduciendo coste y alucinación.
- Cumplimiento y auditoría: extracción masiva de fechas de firma y contrapartes para informes de auditoría interna o regulatoria en carteras de contratos en portugués.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara métricas (`accuracy`, `f1`) en los metadatos, pero no incluye valores numéricos ni conjuntos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,4-0,5 GB para pesos, más overhead de activaciones y tokenizer; cómodo por debajo de 2 GB en la práctica.
- Cabe holgadamente en GPUs consumer: GTX 1660, RTX 3060, RTX 4090, así como en CPU para volúmenes moderados.
- GPUs de datacenter (A100, H100) innecesarias para inferencia; útiles solo para reentrenamiento o fine-tuning adicional.
- Despliegue posible con `transformers` (pipeline NER), TorchServe, ONNX Runtime, TGI o soluciones de serving de encoders; llama.cpp y Ollama no son la vía natural para un encoder de clasificación.
- Latencia y throughput no disponibles en la información proporcionada; al ser un BERT base, el coste por documento es bajo y escalable por batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gabadorno/bert-portuguese-contract-ner | 108.339.465 | no disponible (BERT base) | NER contractual en pt | MIT | Hugging Face |
| neuralmind/bert-base-portuguese-cased | 108.339.465 aprox. | no disponible (BERT base) | Modelo base en pt (MLM) | no disponible en la información | Hugging Face |
| Modelos NER genéricos en portugués (p. ej. ajustes sobre BERTimbau) | variable | variable | NER general | variable | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible: no se han publicado métricas de este modelo ni de alternativas en la información proporcionada. La diferencia principal frente a BERTimbau base es la especialización en cuatro entidades contractuales; frente a NER genéricos en portugués, la ventaja es el dominio legal y la desventaja es la cobertura limitada a cuatro etiquetas.

## Limitaciones y advertencias

- Entrenado sobre contratos sintetizados: puede generalizar peor a contratos reales con formatos, jerga o variantes dialectales no representadas.
- Solo cuatro entidades: no cubre cláusulas, plazos, penalizaciones, jurisdicción ni otras entidades habituales en contratos.
- Riesgo de falsos positivos y negativos en valores monetarios con formatos atípicos (divisas, importes en letra, separadores distintos).
- Dependencia del OCR en pipelines documentales: errores de digitalización degradan la extracción.
- Sesgos no documentados: la model card no describe análisis de sesgo ni evaluación por subgrupos.
- Contexto limitado por la arquitectura BERT base (típicamente 512 tokens); contratos largos requieren segmentación previa, con riesgo de perder entidades en los cortes.
- Licencia MIT permite uso comercial sin restricciones adicionales, pero no hay garantías de idoneidad legal; conviene validar con muestras propias antes de producción.
- Sin métricas publicadas: la idoneidad en producción debe verificarse con un conjunto de evaluación propio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gabadorno/bert-portuguese-contract-ner
- Modelo base BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Documentación de `AutoModelForTokenClassification` en transformers: https://huggingface.co/docs/transformers/model_doc/bert
- Documentación del pipeline NER: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TokenClassificationPipeline
