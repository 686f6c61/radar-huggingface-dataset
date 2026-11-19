# finvector/Test_bge_raw_finmodern_tri_merged

## Resumen

`finvector/Test_bge_raw_finmodern_tri_merged` es un modelo de embeddings de frases (sentence-transformers) derivado de `BAAI/bge-m3` mediante fine-tuning supervisado con una pérdida `CachedMultipleNegativesRankingLoss` sobre un conjunto de datos de tripletas de tamaño muy reducido (70 ejemplos). Lo desarrolla el usuario finvector y está pensado para tareas de similitud semántica y extracción de características en el dominio financiero, a juzgar por los ejemplos de la model card (fragmentos de informes 10-K, goodwill, titulizaciones, acuerdos de compra de cuentas por cobrar).

El modelo conserva la arquitectura subyacente de bge-m3, un transformer XLM-RoBERTa con 567.754.752 parámetros, y se distribuye en formato safetensors con un tamaño de repositorio de 1,2 GB. Su relevancia es limitada y experimental: se trata de un test de fine-tuning con pocos datos, cero descargas y cero likes en el momento de la ficha, por lo que debe considerarse un artefacto de investigación más que un modelo listo para producción.

La licencia es Apache 2.0 y el pipeline declarado es `sentence-similarity`. El autor declara un único resultado de evaluación sobre un conjunto de tripletas propio, con una precisión coseno de 0,8667, no verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa, base de BAAI/bge-m3) |
| Parametros totales | 567.754.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de bge-m3; no declarada en la model card) |
| Tipos de cuantizacion | no disponible (repo solo con safetensors; no se publican GGUF ni ONNX) |
| Idiomas soportados | en (declarado); el modelo base bge-m3 es multilingue, pero el fine-tuning se ha hecho sobre datos en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | no disponible |
| Funcion de perdida de entrenamiento | CachedMultipleNegativesRankingLoss |
| Tamano del dataset de entrenamiento | 70 ejemplos |
| Tamano del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

El modelo parte de `BAAI/bge-m3`, un encoder transformer basado en XLM-RoBERTa que produce embeddings densos de frases. El fine-tuning se realizó con la librería `sentence-transformers` y la pérdida `CachedMultipleNegativesRankingLoss`, una variante de contrastive learning con negativos en batch que cachea los embeddings para permitir batches efectivos grandes con memoria limitada. El conjunto de entrenamiento es extremadamente pequeño: 70 ejemplos en formato de tripletas (ancla, positivo, negativo), según la etiqueta `dataset_size:70` de la model card.

No se documentan en la información disponible ni el número de tokens de entrenamiento, ni la composición del corpus, ni si hubo etapas de RLHF/DPO (no aplicables a un modelo de embeddings). Tampoco se especifican innovaciones técnicas propias más allá del uso de la pérdida cacheada. El nombre del repositorio incluye el sufijo `_merged`, lo que sugiere una fusión de adaptadores o checkpoints, pero no se detalla el procedimiento en la model card.

## Capacidades

- Generación de embeddings de frases para similitud semántica y búsqueda densa (pipeline `sentence-similarity`).
- Extracción de características (`feature-extraction`) para usar como encoder en pipelines posteriores.
- Recuperación de pasajes financieros: los ejemplos de la model card muestran pares ancla-positivo-negativo extraídos de informes anuales (10-K), notas sobre goodwill, titulizaciones y acuerdos de compra de cuentas por cobrar.
- Compatibilidad declarada con Text Embeddings Inference (`text-embeddings-inference`) y con endpoints de Hugging Face (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades multilingües: no declaradas para este checkpoint; solo `en` en la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Búsqueda semántica en corpus financieros: indexar fragmentos de informes 10-K y recuperar pasajes relevantes para una consulta en lenguaje natural, aprovechando el fine-tuning sobre vocabulario contable y de titulizaciones.
- Deduplicación de documentos regulatorios: comparar embeddings de secciones de informes anuales para detectar pasajes repetidos o versiones casi idénticas entre ejercicios fiscales.
- Clasificación zero-shot de fragmentos: usar la similitud coseno entre el embedding de un pasaje y descripciones de categorías (por ejemplo, "riesgo de crédito", "goodwill", "acuerdos de compra") para etiquetar documentos sin entrenamiento adicional.
- Clustering de notas al pie y anexos: agrupar exhibiciones y referencias cruzadas de formularios SEC por temática para facilitar la revisión manual.
- RAG sobre documentación financiera interna: servir como retriever en un pipeline de recuperación aumentada, siempre que se valide su calidad frente al bge-m3 original antes de desplegarlo.
- Evaluación comparativa de retrievers: usar el checkpoint como baseline experimental en pruebas de fine-tuning con pocos datos, dado su reducido conjunto de entrenamiento (70 ejemplos).
- Filtrado de candidatos en pipelines de extracción de entidades: pre-seleccionar pasajes candidatos antes de pasarlos a un modelo generativo de mayor coste.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Triplet | triplet eval | Cosine Accuracy | 0,8667 |

No se han publicado en la información disponible resultados en MMLU, HumanEval, GSM8K, MTEB ni otros benchmarks estándar de embeddings. No se dispone de comparación numérica con el modelo base `BAAI/bge-m3` en el mismo conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB solo para pesos (567,7 M de parámetros × 4 bytes), más activaciones y overhead del runtime.
- VRAM estimada en fp16/bf16: aproximadamente 1,1 GB para pesos; en int8, unos 0,6 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 en batches pequeños; A100, H100 o L4 para despliegues con alto throughput.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4090 y superiores, incluso en fp32.
- Opciones de despliegue: `sentence-transformers` (Python), Text Embeddings Inference (declarado compatible), Hugging Face Inference Endpoints (declarado compatible). No se publican pesos GGUF, por lo que llama.cpp u Ollama no son opciones directas sin conversión previa.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| finvector/Test_bge_raw_finmodern_tri_merged | 567,7 M | no disponible | en | Apache 2.0 | Fine-tuning con 70 tripletas; 0 descargas; sin benchmarks estándar |
| BAAI/bge-m3 | no disponible en esta ficha | no disponible en esta ficha | multilingue | MIT (según el modelo original; no confirmado en esta ficha) | Modelo base; soporta denso, disperso y multi-vector; ampliamente evaluado en MTEB |
| BAAI/bge-large-en-v1.5 | no disponible en esta ficha | no disponible en esta ficha | en | MIT (según el modelo original; no confirmado en esta ficha) | Alternativa monolingüe en inglés con amplia adopción |
| intfloat/e5-large-v2 | no disponible en esta ficha | no disponible en esta ficha | en | MIT (según el modelo original; no confirmado en esta ficha) | Retrieval denso con instrucciones de prefijo |

Los datos del modelo base y de las alternativas no están incluidos en la información proporcionada; se indican como no disponibles para no inventar cifras. La comparación relevante es contra `BAAI/bge-m3`, del que este checkpoint es un fine-tuning: cualquier mejora en dominio financiero debería validarse empíricamente antes de preferirlo al original.

## Limitaciones y advertencias

- Conjunto de entrenamiento de solo 70 ejemplos: riesgo alto de sobreajuste y de degradación fuera del dominio financiero concreto de las tripletas.
- Resultado de evaluación único (0,8667 de precisión coseno) sobre un conjunto de tripletas propio y no verificado; no es comparable con MTEB ni con benchmarks estándar.
- Cero descargas y cero likes en el momento de la ficha: sin evidencia de uso en producción ni validación por terceros.
- Idiomas: la model card declara únicamente `en`; no se garantiza buen rendimiento en castellano ni en otros idiomas aunque el modelo base sea multilingüe.
- Longitud de contexto no declarada en la ficha; debe consultarse la del modelo base antes de usarlo con documentos largos.
- Riesgo de sesgos heredados del corpus de entrenamiento del modelo base y del subconjunto financiero utilizado; no se documenta ninguna mitigación.
- Riesgo de alucinación: no aplica directamente (no es generativo), pero la similitud coseno puede producir falsos positivos en recuperación; requiere umbrales calibrados.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado de bge-m3 conviene revisar también las condiciones del modelo base.
- No se publican pesos en GGUF ni ONNX; el despliegue en entornos sin PyTorch o sin TEI requiere conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/finvector/Test_bge_raw_finmodern_tri_merged
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de Multiple Negatives Ranking (arXiv:2101.06983): https://arxiv.org/abs/2101.06983
- Librería sentence-transformers: https://www.sbert.net/
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
