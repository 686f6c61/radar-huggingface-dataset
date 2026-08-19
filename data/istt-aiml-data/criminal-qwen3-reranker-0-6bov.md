# istt-aiml-data/Criminal-Qwen3-Reranker-0.6Bov

## Resumen

Criminal-Qwen3-Reranker-0.6Bov es un modelo de reranking (cross-encoder) desarrollado por el usuario istt-aiml-data, especializado en la comprensión de jerga vietnamita, particularmente en contextos relacionados con sustancias ilegales. Se basa en el modelo Qwen/Qwen3-Reranker-0.6B, al que se le ha aplicado un ajuste fino (fine-tuning) con un conjunto de datos muy reducido de 374 muestras etiquetadas con puntuaciones de relevancia. El modelo está diseñado para puntuar pares de textos (consulta, pasaje) y ordenar documentos según su relevancia semántica.

La relevancia de este modelo radica en su capacidad para interpretar expresiones coloquiales y argot vietnamita en dominios sensibles, como la mención de drogas, lo que puede ser útil para tareas de moderación de contenido, búsqueda semántica especializada o análisis forense. Con 595,7 millones de parámetros y una ventana de contexto de 40 960 tokens, ofrece una capacidad de procesamiento de textos largos superior a la media de los rerankers de su tamaño. La licencia Apache 2.0 permite su uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en Qwen3ForCausalLM con módulo LogitScore |
| Parametros totales | 595 776 512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 40 960 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en safetensors) |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder construido sobre Qwen3-Reranker-0.6B, que a su vez emplea una arquitectura transformer de tipo Qwen3ForCausalLM. La capa final es un módulo `LogitScore` que asigna una puntuación a cada par de textos comparando los logits de dos tokens especiales (verdadero/falso). Esta arquitectura es típica de los modelos de reranking basados en causal language modeling, donde la puntuación se deriva de la probabilidad de que el pasaje sea relevante para la consulta.

El entrenamiento se realizó con un conjunto de datos propio de 374 muestras, cada una con tres columnas: `query`, `passage` y `label` (puntuación flotante). Se utilizó la función de pérdida `BinaryCrossEntropyLoss` y la librería `sentence-transformers`. No se han publicado detalles sobre el número de épocas, la tasa de aprendizaje, ni la composición exacta del dataset más allá de las estadísticas parciales mostradas en la model card. Tampoco se menciona el uso de técnicas como RLHF o DPO; el ajuste parece ser exclusivamente supervisado sobre pares etiquetados.

## Capacidades

- Reranking de documentos: asigna una puntuación de relevancia a pares (consulta, pasaje), permitiendo ordenar resultados de búsqueda.
- Búsqueda semántica: puede utilizarse como componente de un sistema de retrieval para mejorar la precisión de los resultados.
- Comprensión de jerga vietnamita: entrenado específicamente para interpretar expresiones coloquiales y argot, especialmente en contextos relacionados con sustancias ilegales (ej. "coca" como cocaína).
- Manejo de contexto largo: soporta hasta 40 960 tokens, lo que permite procesar documentos extensos o conversaciones largas.
- Integración con sentence-transformers: compatible con la API estándar de `CrossEncoder`, facilitando su uso en pipelines existentes.
- Salida de puntuaciones continuas: produce valores flotantes que pueden umbralizarse para clasificación binaria o usarse para ranking.

## Casos de uso

- Moderación de contenido en redes sociales: el modelo puede puntuar si un texto contiene referencias a drogas ilegales usando jerga local, permitiendo a plataformas detectar y filtrar publicaciones sospechosas en vietnamita.
- Búsqueda semántica en corpus jurídicos o policiales: para recuperar documentos relevantes en investigaciones donde se usan términos coloquiales para referirse a sustancias, mejorando la precisión frente a búsquedas por palabras clave.
- Análisis de conversaciones en foros o chats: puede ordenar mensajes según su relevancia para un tema dado (por ejemplo, "compra de cocaína"), facilitando el trabajo de analistas de inteligencia.
- Mejora de sistemas RAG (Retrieval-Augmented Generation): como reranker en un pipeline de generación aumentada por recuperación, para seleccionar los fragmentos más relevantes antes de pasarlos a un LLM generativo.
- Filtrado de respuestas en asistentes virtuales: cuando un usuario hace una pregunta ambigua, el modelo puede ayudar a seleccionar la respuesta más adecuada de un conjunto de candidatas pregeneradas.
- Investigación académica en procesamiento de lenguaje social: para estudiar la evolución de la jerga relacionada con drogas en vietnamita, el modelo permite etiquetar automáticamente grandes volúmenes de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o similares, y el autor no proporciona comparaciones con otros modelos. Dado el tamaño reducido del dataset de entrenamiento (374 muestras), es probable que el rendimiento fuera de su dominio específico sea limitado, pero no hay datos objetivos que lo confirmen.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 595 millones de parámetros en precisión fp32, necesitaría aproximadamente 2,4 GB de VRAM (los pesos ocupan 2,4 GB en safetensors). Con cuantización a 8 bits, se podría reducir a ~1,2 GB, y a 4 bits a ~0,6 GB, aunque no se ofrecen versiones cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp32 (por ejemplo, NVIDIA GTX 1650, RTX 3050, o superiores). Para procesamiento por lotes o contextos largos, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080, A10, etc.).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo modernas (RTX 30/40 series) incluso en fp32, y con cuantización sería viable en tarjetas con 4 GB.
- Opciones de despliegue: al usar la librería `sentence-transformers`, puede ejecutarse con CPU o GPU mediante PyTorch. También es posible servirlo con herramientas como FastAPI o Triton, aunque no se menciona soporte nativo para vLLM o TGI. Para despliegue ligero, se podría convertir a ONNX o usar `llama.cpp` si se exportan pesos en GGUF, pero no hay archivos de ese tipo en el repositorio.
- Latencia y throughput: no se han publicado mediciones. Como referencia, un cross-encoder de 600M parámetros en una GPU moderna (RTX 3090) procesa típicamente entre 50 y 200 pares por segundo, dependiendo de la longitud de los textos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Uso principal |
|---|---|---|---|---|---|
| Criminal-Qwen3-Reranker-0.6Bov | 595,7M | 40 960 tokens | Vietnamita (jerga) | Apache 2.0 | Reranking específico de jerga de drogas |
| Qwen3-Reranker-0.6B (base) | 595,7M | 40 960 tokens | Multilingüe (incluye vietnamita) | Apache 2.0 | Reranking general multilingüe |
| BGE-Reranker-v2-m3 | 568M | 8 192 tokens | Multilingüe (100+ idiomas) | MIT | Reranking multilingüe general |

La comparativa se basa en datos públicos de los modelos mencionados. Criminal-Qwen3-Reranker-0.6Bov se diferencia por su especialización en jerga vietnamita, pero carece de la cobertura multilingüe de sus alternativas. El contexto de 40 960 tokens es una ventaja frente a BGE-Reranker-v2-m3, que solo soporta 8 192 tokens.

## Limitaciones y advertencias

- Conjunto de entrenamiento extremadamente reducido (374 muestras), lo que limita la generalización a otros dominios o variaciones de jerga.
- Especialización muy estrecha: el modelo solo ha sido entrenado para entender referencias a drogas en vietnamita; su rendimiento en otros temas será previsiblemente pobre.
- Riesgo de sesgo: al estar entrenado con ejemplos centrados en sustancias ilegales, puede sobreinterpretar términos inocentes como "coca" (que también puede referirse a la bebida) en contextos no relacionados.
- Alucinación y falsos positivos: al ser un cross-encoder, no genera texto, pero puede asignar puntuaciones altas a pasajes irrelevantes si la consulta contiene palabras ambiguas.
- Sin benchmarks publicados: no hay evidencia objetiva de su calidad frente a otros rerankers.
- Limitación de idioma: solo soporta vietnamita; no es útil para otros idiomas.
- Sin soporte de cuantización oficial: el repositorio solo contiene pesos en fp32, lo que puede aumentar los requisitos de memoria en despliegues a gran escala.
- Dependencia del modelo base: cualquier limitación de Qwen3-Reranker-0.6B (por ejemplo, sesgos en el preentrenamiento) se hereda en este modelo.
- No se proporcionan instrucciones de uso fuera del dominio de drogas; su uso en producción requiere validación previa en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/istt-aiml-data/Criminal-Qwen3-Reranker-0.6Bov
- Modelo base (Qwen3-Reranker-0.6B): https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Documentación de Cross Encoder (sentence-transformers): https://www.sbert.net/docs/cross_encoder/usage/usage.html
- Repositorio de sentence-transformers: https://github.com/huggingface/sentence-transformers
- Paper de referencia (Cross-Encoders): https://arxiv.org/abs/1908.10084
