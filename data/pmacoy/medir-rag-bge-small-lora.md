# Pmacoy/medir-rag-bge-small-lora

## Resumen

El repositorio `Pmacoy/medir-rag-bge-small-lora` contiene un adaptador LoRA entrenado sobre el modelo de embeddings `BAAI/bge-small-en-v1.5`, desarrollado por el usuario Pmacoy en el contexto del proyecto MedIR-RAG (Milestone 2). No se trata de un modelo generativo, sino de un ajuste fino de un encoder de frases orientado a recuperación de información (retrieval) en el dominio biomédico. El adaptador se entrena con la pérdida `MultipleNegativesRankingLoss` sobre 20.000 pares del conjunto PubMedQA (variante `pqa_artificial`).

La relevancia de este artefacto es acotada: se publica como adaptador PEFT (LoRA con r=16, alpha=32, aplicado a las proyecciones query y value) y no como modelo autónomo. Para usarlo es necesario cargar primero el modelo base `BAAI/bge-small-en-v1.5` y superponer el adaptador mediante `PeftModel.from_pretrained`. El pooling debe ser CLS y los embeddings resultantes deben normalizarse con L2; las consultas requieren el prefijo de búsqueda propio de la familia bge.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamaño de 0.0 GB y no declara licencia, idiomas ni pipeline en los metadatos de Hugging Face. La model card está redactada en portugués y describe únicamente el procedimiento de entrenamiento y uso, sin resultados de evaluación ni detalles sobre hiperparámetros adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (adaptador LoRA sobre `BAAI/bge-small-en-v1.5`) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base bge-small-en-v1.5 tiene 33 M de parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base bge-small-en-v1.5 admite 512 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base está orientado a inglés) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `BAAI/bge-small-en-v1.5`, un encoder transformer de tipo BERT pequeño (33 M de parámetros, 12 capas, dimensión oculta 384) especializado en embeddings de frases para recuperación. El ajuste LoRA utiliza r=16 y alpha=32 sobre las proyecciones `query` y `value` de la atención, lo que supone un número reducido de parámetros entrenables respecto al modelo base.

El entrenamiento se realizó con `MultipleNegativesRankingLoss`, una función de pérdida contrastiva que trata los ejemplos negativos del propio batch como negativos en memoria, adecuada para tareas de retrieval denso. El corpus de entrenamiento son 20.000 pares del subconjunto `pqa_artificial` de PubMedQA, orientado a preguntas y respuestas biomédicas. No se especifican en la información disponible el número de épocas, la tasa de aprendizaje, el tamaño de batch, la composición exacta de los pares (positivos/negativos) ni si hubo etapas adicionales de evaluación o selección de checkpoints.

## Capacidades

- Generación de embeddings de frases para recuperación densa (dense retrieval) en el dominio biomédico.
- Codificación de consultas y documentos para búsqueda semántica; las consultas deben llevar el prefijo de búsqueda de bge.
- Pooling CLS con normalización L2 de los vectores resultantes, según indica la model card.
- Uso como componente de un pipeline RAG (retrieval-augmented generation) sobre literatura biomédica.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües; el modelo base está orientado a inglés.
- No se documentan capacidades de visión, audio ni modo de razonamiento.

## Casos de uso

- Recuperación de evidencia biomédica en un pipeline RAG: el adaptador se cargaría sobre bge-small-en-v1.5 para indexar abstracts de PubMed y recuperar pasajes relevantes ante preguntas clínicas, aprovechando el ajuste contrastivo sobre PubMedQA.
- Búsqueda semántica de preguntas-respuestas médicas: dado un corpus de pares pregunta/respuesta de PubMedQA, el modelo permitiría localizar respuestas candidatas por similitud coseno de embeddings normalizados.
- Sistemas de question answering sobre literatura científica: como primer paso de recuperación antes de un modelo generativo que sintetice la respuesta a partir de los pasajes recuperados.
- Evaluación comparativa de adaptadores de dominio: útil como referencia para medir la ganancia de un ajuste LoRA sobre bge-small en tareas de retrieval biomédico frente al modelo base sin ajustar.
- Indexación de documentación clínica interna: para prototipos de búsqueda semántica sobre guías o protocolos en inglés, siempre que se valide la calidad del retrieval en el corpus concreto.
- Experimentación académica en MedIR-RAG: el repositorio forma parte del Milestone 2 del proyecto, por lo que sirve como artefacto reproducible para replicar el entrenamiento y comparar configuraciones de LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA es de tamaño despreciable (repo de 0.0 GB); el coste de inferencia lo determina el modelo base bge-small-en-v1.5 (33 M de parámetros).
- VRAM estimada para inferencia en FP32: en torno a 0,15 GB solo para pesos; en FP16 aproximadamente 0,07 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, A100, H100). También es viable en CPU para volúmenes moderados.
- Despliegue: `sentence-transformers` o `transformers` + `peft` para cargar el adaptador; para servir a escala, `Text Embeddings Inference (TEI)` o `vLLM` no aplican directamente al adaptador PEFT sin fusionarlo previamente con el modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pmacoy/medir-rag-bge-small-lora | Adaptador LoRA sobre 33 M | No disponible | Biomédico (PubMedQA) | No disponible | Hugging Face |
| BAAI/bge-small-en-v1.5 | 33 M | 512 tokens | General (inglés) | MIT | Hugging Face |
| BAAI/bge-base-en-v1.5 | 109 M | 512 tokens | General (inglés) | MIT | Hugging Face |
| PubMedBERT (embeddings) | ~110 M | 512 tokens | Biomédico | MIT | Hugging Face |

La comparativa se limita a características estructurales; no hay datos de rendimiento publicados para el adaptador que permitan una comparación cuantitativa con las alternativas.

## Limitaciones y advertencias

- No se declara licencia en los metadatos ni en la model card; el uso comercial queda sin garantías jurídicas hasta que el autor la especifique.
- El adaptador se entrena exclusivamente sobre 20.000 pares de PubMedQA (`pqa_artificial`), un corpus sintético y acotado; el riesgo de sobreajuste a ese dominio y de escasa generalización a otros corpus biomédicos es alto.
- No hay evaluación publicada: se desconoce si el ajuste mejora al modelo base en métricas de retrieval (Recall@k, MRR, nDCG).
- El modelo base está orientado a inglés; no se documenta soporte multilingüe, por lo que su uso en castellano no está validado.
- Como modelo de embeddings, puede heredar sesgos del corpus de entrenamiento (PubMedQA) y del modelo base; no se han documentado análisis de sesgo.
- No es un modelo generativo: no produce respuestas, solo representaciones vectoriales. Cualquier uso en un sistema RAG requiere un generador adicional.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo día; no hay señales de mantenimiento ni de validación por la comunidad.
- El prefijo de búsqueda de bge es obligatorio en las consultas; omitirlo degrada la calidad del retrieval.

## Enlaces

- Hugging Face: https://huggingface.co/Pmacoy/medir-rag-bge-small-lora
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Dataset PubMedQA: https://huggingface.co/datasets/qiaojin/PubMedQA
- PEFT (librería de adaptadores): https://github.com/huggingface/peft
- Sentence Transformers: https://www.sbert.net/
