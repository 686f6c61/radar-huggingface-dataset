# ModernVBERT/colmodernvbert-merged

## Resumen

ColModernVBERT es un modelo de recuperación visual de documentos (visual document retrieval) desarrollado por el equipo de ModernVBERT, presentado en el preprint arXiv 2510.01149. Se trata de la versión late-interaction (estilo ColPali) del encoder multimodal ModernVBERT, un modelo compacto de aproximadamente 252 millones de parámetros que alinea un encoder de lenguaje preentrenado con un encoder de visión mediante un objetivo de modelado de lenguaje enmascarado (MLM). La variante aquí descrita, `colmodernvbert-merged`, incorpora los adaptadores LoRA fusionados con el modelo base `vidore/colmodernvbert-base`.

El modelo está diseñado para construir embeddings multi-vector a partir de imágenes de documentos, permitiendo búsquedas semánticas sobre páginas completas, gráficos, tablas y texto incrustado. Su principal relevancia radica en que, con un tamaño de 250M de parámetros, alcanza un rendimiento comparable al de modelos hasta diez veces más grandes en benchmarks de recuperación visual, lo que lo convierte en una opción atractiva para despliegues con recursos limitados, incluso en CPU. Se distribuye bajo licencia MIT y está pensado para integrarse con librerías como Sentence Transformers y el motor ColPali.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Late-interaction (ColPali-style) sobre encoder multimodal ModernVBERT (visión + lenguaje) |
| Parametros totales | 252.100.736 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ColModernVBERT se basa en ModernVBERT, un encoder compacto de 250M de parámetros que combina un encoder de lenguaje preentrenado con un encoder de visión. El proceso de entrenamiento consta de dos fases: primero, una alineación de modalidades mediante un objetivo de modelado de lenguaje enmascarado (MLM) sobre pares texto-imagen; después, un fine-tuning específico para recuperación de documentos utilizando una función de pérdida contrastiva con interacción tardía (late interaction), siguiendo el enfoque ColPali. Esta arquitectura produce embeddings multi-vector: cada consulta y cada página de documento se representan como un conjunto de vectores de 128 dimensiones, y la similitud se calcula mediante la suma de los máximos productos escalares entre los vectores de la consulta y los del documento.

El modelo se libera con los adaptadores LoRA ya fusionados en los pesos del modelo base, lo que facilita su uso directo sin necesidad de cargar adaptadores por separado. El procesador de imágenes divide cada página en sub-parches más un parche global, lo que permite capturar tanto detalles locales como contexto global del documento. No se han publicado detalles sobre el volumen de datos de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Recuperación visual de documentos: dado un texto de consulta, encuentra las páginas más relevantes entre un corpus de imágenes de documentos (PDFs escaneados, capturas, etc.).
- Búsqueda multimodal: procesa imágenes completas (gráficos, tablas, diagramas) sin necesidad de OCR previo, gracias a que el encoder de visión extrae directamente características visuales.
- Embeddings multi-vector: genera representaciones densas de alta granularidad (vectores por token/patch) que permiten una comparación fina entre consulta y documento.
- Interacción tardía (late interaction): el cálculo de similitud se realiza sobre los embeddings ya generados, lo que permite indexar documentos de forma offline y realizar búsquedas rápidas.
- Compatibilidad con Sentence Transformers: se puede cargar como `MultiVectorEncoder` y usar la API estándar `encode_query` / `encode_document` / `similarity`.
- Integración con el motor ColPali: soporta su uso mediante la librería `colpali_engine` (rama `vbert`), con opción de Flash Attention 2 para mayor throughput.
- Inferencia eficiente en CPU: al ser un modelo compacto, ofrece velocidades de inferencia interesantes en CPU comparado con modelos de mayor tamaño.

## Casos de uso

- Búsqueda semántica en archivos PDF corporativos: indexar miles de documentos escaneados y permitir consultas en lenguaje natural como "¿cuál es el presupuesto de marketing para 2024?" sin necesidad de OCR previo.
- Recuperación de información en informes financieros: localizar páginas concretas de informes anuales, balances o gráficos de evolución de métricas a partir de descripciones textuales.
- Asistente de atención al cliente con base de conocimiento visual: dado un ticket de usuario, recuperar automáticamente las páginas de manuales o guías que contengan la respuesta, facilitando la generación de respuestas contextualizadas.
- Archivado y clasificación de documentos legales: buscar cláusulas o secciones específicas en contratos escaneados mediante consultas textuales, reduciendo el tiempo de revisión manual.
- Motor de búsqueda para bibliotecas digitales: permitir a investigadores encontrar páginas relevantes en libros o artículos digitalizados a partir de preguntas sobre figuras, tablas o resultados.
- Pipeline de RAG multimodal: integrar ColModernVBERT como retriever en un sistema de generación aumentada por recuperación (RAG) que combine imágenes de documentos con generación de texto, aprovechando su bajo coste computacional para escalar a grandes corpus.

## Benchmarks y rendimiento

No se han publicado resultados numéricos detallados de benchmarks en la información disponible. El paper arXiv 2510.01149 afirma que ColModernVBERT iguala el rendimiento de modelos casi diez veces más grandes en benchmarks de recuperación visual de documentos, y que ofrece una velocidad de inferencia notablemente superior en CPU frente a modelos de rendimiento similar. Sin embargo, no se proporcionan cifras concretas de métricas como MMLU, HumanEval o similares, ni comparativas tabuladas en la documentación accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación oficial. Dado el tamaño de 252M parámetros, en precisión fp32 ocuparía aproximadamente 1 GB, y en fp16 alrededor de 0,5 GB, pero estos valores son estimaciones orientativas y no datos publicados.
- GPU recomendadas: no se especifican modelos concretos. Por su tamaño, debería ser ejecutable en GPUs consumer como RTX 3060, RTX 4090 o similares, e incluso en CPU con tiempos razonables.
- Compatibilidad con consumer GPU: sí, al ser un modelo compacto, cabe en la mayoría de GPUs de consumo actuales.
- Opciones de despliegue: compatible con Sentence Transformers (`MultiVectorEncoder`), con el motor ColPali (rama `vbert` de su repositorio), y potencialmente con otras librerías que soporten modelos multi-vector.
- Latencia y throughput: no se proporcionan datos concretos. El paper menciona ventajas de velocidad en CPU frente a modelos de mayor tamaño, pero sin cifras exactas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| ColModernVBERT (este) | 252M | no disponible | MIT | Late-interaction, visión + lenguaje |
| ColPali (original) | ~2.5B | no disponible | MIT | Late-interaction, visión + lenguaje |
| BiModernVBERT | 252M | no disponible | MIT | Bi-encoder, visión + lenguaje |

ColModernVBERT se posiciona como una alternativa mucho más ligera que ColPali, con un rendimiento comparable según el paper, lo que lo hace adecuado para entornos con restricciones de cómputo. No se dispone de comparativas numéricas detalladas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al estar entrenado principalmente con datos en inglés, su rendimiento en otros idiomas puede ser limitado.
- Riesgo de alucinación: como modelo de recuperación, no genera texto directamente, pero la calidad de los resultados depende de la relevancia de los documentos indexados; puede devolver documentos irrelevantes si la consulta es ambigua.
- Limitaciones de idioma: solo se declara soporte para inglés; el uso con consultas en otros idiomas puede degradar la precisión.
- Limitaciones de contexto: la longitud de contexto no está especificada; el procesamiento de documentos muy extensos puede requerir dividirlos en páginas.
- Restricciones de licencia: licencia MIT, permisiva para uso comercial, pero se recomienda verificar los términos de las dependencias (por ejemplo, los modelos base).
- Advertencia para producción: el modelo requiere un pipeline de preprocesado de imágenes específico (división en sub-parches); la función `get_n_patches` de Sentence Transformers lanza `NotImplementedError` para este modelo, lo que puede afectar a herramientas de interpretabilidad.
- La integración con el motor ColPali oficial aún no está fusionada en la rama principal; es necesario usar una rama específica del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ModernVBERT/colmodernvbert-merged
- Paper arXiv: https://arxiv.org/abs/2510.01149
- Versión HTML del paper: https://arxiv.org/html/2510.01149
- Repositorio ColPali (rama `vbert`): https://github.com/illuin-tech/colpali (checkout en la rama `vbert`)
- Documentación de ColModernVBert en Transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/colmodernvbert.md
