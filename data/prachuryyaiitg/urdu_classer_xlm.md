# prachuryyaIITG/Urdu_CLASSER_XLM

## Resumen

Urdu_CLASSER_XLM es un modelo de reconocimiento de entidades nombradas (NER) de grano fino, desarrollado por Prachuryya Kaushik y Ashish Anand del IIT Guwahati. Se trata de un fine-tuning de XLM-RoBERTa-large sobre el dataset CLASSER, un corpus en urdu generado mediante el framework de proyección de anotaciones multilingüe CLASSER (Cross-lingual Annotation Projection enhancement through Script Similarity). El modelo está diseñado para etiquetar entidades en urdu con una taxonomía detallada de 30 subcategorías agrupadas en 6 tipos principales: ubicaciones, obras creativas, grupos, personas, productos y entidades médicas.

La relevancia de este modelo radica en que aborda la escasez de recursos NER de grano fino para urdu, una lengua hablada por más de 230 millones de personas. Al partir de XLM-RoBERTa-large, hereda una representación multilingüe robusta, pero se especializa exclusivamente en urdu mediante el ajuste fino. Con 558,9 millones de parámetros y una ventana de contexto de 512 tokens, ofrece un equilibrio entre capacidad y eficiencia para tareas de extracción de entidades en producción. Forma parte del ecosistema AWED-PIPER, que incluye agentes y aplicaciones web para NER y protección de datos personales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) |
| Parametros totales | 558.909.507 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No documentado (pesos en safetensors, presumiblemente fp32) |
| Idiomas soportados | Urdu (ur) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en XLM-RoBERTa-large, un transformer encoder multilingüe preentrenado con 550 millones de parámetros sobre 2,5 TB de datos CommonCrawl filtrados en 100 idiomas. Para esta tarea, se realiza un fine-tuning completo sobre el dataset CLASSER en urdu, que contiene anotaciones NER de grano fino generadas mediante proyección de etiquetas desde otros idiomas, aprovechando similitudes de escritura entre scripts. El tagset utilizado es el de MultiCoNER2, con 30 subcategorías jerárquicas.

El entrenamiento se llevó a cabo durante 6 épocas con el optimizador AdamW, una tasa de aprendizaje de 5e-5, weight decay de 0,01 y tamaño de batch de 64. No se menciona el uso de técnicas de alineación como RLHF o DPO, ya que se trata de una tarea de clasificación de tokens supervisada. La innovación principal reside en el método de generación del dataset (CLASSER), no en la arquitectura del modelo, que es la estándar de XLM-RoBERTa.

## Capacidades

- Reconocimiento de entidades nombradas de grano fino en urdu, con 30 subcategorías (p. ej., Scientist, Artist, Politician, Disease, Medication, Vehicle, Food, etc.) agrupadas en 6 categorías principales (LOC, CW, GRP, PER, PROD, MED).
- Clasificación token a token (token-classification), adecuada para extraer entidades de textos largos.
- Soporte multilingüe heredado de XLM-RoBERTa, aunque el fine-tuning está orientado exclusivamente a urdu.
- No soporta tool calling, agentes, generación de texto libre ni razonamiento multi-paso: es un modelo discriminativo de codificación, no generativo.
- Capacidad de procesar textos con ruido y errores ortográficos, gracias al entrenamiento con datos proyectados que incluyen variaciones.

## Casos de uso

- Extracción de entidades en artículos periodísticos en urdu: permite identificar automáticamente personas, lugares, organizaciones y obras mencionadas en noticias, facilitando la indexación y búsqueda semántica.
- Análisis de redes sociales en urdu: detección de productos, enfermedades o figuras públicas en publicaciones de Twitter o Facebook, útil para monitorización de marca o salud pública.
- Construcción de bases de conocimiento en urdu: extracción de entidades de documentos históricos o literarios para poblar grafos de conocimiento, gracias a las subcategorías finas como WrittenWork o ArtWork.
- Sistemas de enmascaramiento de datos personales (PII): integrado en el ecosistema AWED-PIPER, el modelo puede identificar nombres, organizaciones y ubicaciones para anonimizar documentos antes de su publicación.
- Asistencia sanitaria en urdu: extracción de entidades médicas (enfermedades, síntomas, medicamentos) de informes clínicos o foros de pacientes, apoyando sistemas de triaje o vigilancia epidemiológica.
- Enriquecimiento de motores de búsqueda verticales: etiquetado de entidades en catálogos de productos, reseñas o guías locales en urdu, mejorando la precisión de búsquedas facetadas.

## Benchmarks y rendimiento

El autor reporta las siguientes métricas en el conjunto de evaluación del dataset CLASSER:

| Metrica | Valor |
|---|---|
| Precision | 73,48 |
| Recall | 74,92 |
| F1 | 73,93 |

No se han publicado comparaciones con otros modelos NER en urdu dentro de la información disponible. El resultado es específico para el tagset MultiCoNER2 y el dominio del dataset CLASSER.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 558,9 millones de parámetros. En fp32 ocupa aproximadamente 2,2 GB, en fp16 ~1,1 GB y en int8 ~560 MB. La inferencia puede ejecutarse en GPUs con al menos 4 GB de VRAM si se usa fp16, aunque se recomiendan 8 GB para mayor comodidad.
- GPUs compatibles: cualquier GPU consumer moderna con al menos 6 GB de VRAM, como RTX 3060, RTX 4060, GTX 1660 Super, o GPUs de datacenter como T4, V100 o A10.
- Despliegue: compatible con la librería Transformers de HuggingFace (pipeline de token-classification), así como con ONNX Runtime o TorchServe para producción. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo generativo.
- Latencia: para un texto de 512 tokens, la inferencia en una GPU T4 tarda aproximadamente 50-100 ms, dependiendo del batch. En CPU, puede ser varios segundos; se recomienda GPU para uso interactivo.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos NER de grano fino en urdu dentro de la documentación proporcionada. Como referencia, el modelo base XLM-RoBERTa-large es un estándar multilingüe, pero no existen datos públicos de otros fine-tunes específicos para urdu con el mismo tagset. Modelos alternativos genéricos como mBERT o XLM-RoBERTa-base tienen menos parámetros y probablemente menor rendimiento en esta tarea, pero no se pueden confirmar sin benchmarks.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en urdu; su uso en otros idiomas producirá resultados poco fiables.
- La ventana de contexto está limitada a 512 tokens, por lo que documentos largos deben segmentarse, lo que puede afectar a la coherencia de las entidades que cruzan fragmentos.
- El dataset CLASSER se genera mediante proyección automática de anotaciones, lo que puede introducir errores de etiquetado y sesgos hacia los idiomas fuente utilizados en la proyección.
- Riesgo de alucinación en NER: puede etiquetar como entidades palabras que no lo son, especialmente en dominios no representados en el entrenamiento.
- No se han evaluado sesgos demográficos o de género; el modelo puede reflejar los sesgos presentes en los textos de entrenamiento.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario es responsable del cumplimiento de las normativas de protección de datos al usar el modelo con datos personales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prachuryyaIITG/Urdu_CLASSER_XLM
- Dataset CLASSER: https://huggingface.co/datasets/prachuryyaIITG/CLASSER
- Paper CLASSER (IJCNLP 2025): https://aclanthology.org/2025.ijcnlp-long.94/
- Paper AWED-PIPER (arXiv 2601.10161): https://arxiv.org/abs/2601.10161
- Repositorio AWED-PIPER: https://github.com/PrachuryyaKaushik/AWED-PIPER
- Agente para NER fino: https://github.com/PrachuryyaKaushik/AWED-FiNER
- Aplicación web NER fino: https://huggingface.co/spaces/prachuryyaIITG/AWED-FiNER
- Agente para protección de PII: https://github.com/PrachuryyaKaushik/AWED-PIPER
- Aplicación web protección de PII: https://huggingface.co/spaces/prachuryyaIITG/AWED_PII_Protector
- Paper SampurNER (AAAI 2026): https://ojs.aaai.org/index.php/AAAI/article/view/40405
- Dataset MultiCoNER2: https://huggingface.co/datasets/MultiCoNER/multiconer_v2
