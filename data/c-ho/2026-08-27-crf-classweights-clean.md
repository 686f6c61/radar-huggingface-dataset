# c-ho/2026-08-27-crf-classweights-clean

## Resumen

El modelo `c-ho/2026-08-27-crf-classweights-clean` es un ajuste fino (fine-tune) del modelo `Davlan/bert-base-multilingual-cased-ner-hrl`, orientado a tareas de clasificación de tokens (token-classification). Desarrollado por Clara Wan Ching Ho (usuario `c-ho`), este modelo está especializado en la anotación de conceptos y fenómenos lingüísticos, como se deduce de las etiquetas de evaluación (Academicdiscipline, Discoursephenomenon, Morphologicalphenomenon, etc.). La arquitectura subyacente es un transformer basado en XLM-RoBERTa (según el tag `xlm-roberta`), con una capa CRF (Conditional Random Field) y pesos de clase para manejar el desbalance de etiquetas, como sugiere el nombre del modelo. Con 559.925.445 parámetros, se trata de un modelo de gran tamaño, probablemente equivalente a XLM-RoBERTa large. Su relevancia radica en ofrecer una solución especializada para el etiquetado de términos lingüísticos en contextos multilingües, aunque el dataset de entrenamiento no se ha especificado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (XLM-RoBERTa) con cabeza de clasificación de tokens y capa CRF |
| Parametros totales | 559.925.445 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base XLM-RoBERTa soporta 512 tokens, pero no se confirma) |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero no se especifica) |
| Licencia | AFL-3.0 (Academic Free License 3.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `Davlan/bert-base-multilingual-cased-ner-hrl`, un modelo BERT multilingüe diseñado para reconocimiento de entidades nombradas (NER). Sin embargo, el tag `xlm-roberta` y el número de parámetros (559M) sugieren que la arquitectura base real es XLM-RoBERTa large, aunque el nombre del repo base indique lo contrario. La cabeza de clasificación se complementa con una capa CRF y pesos de clase, lo que mejora la coherencia de las secuencias etiquetadas y compensa el desequilibrio entre categorías. El entrenamiento se realizó con los siguientes hiperparámetros: learning rate 5e-05, batch size 8 (con acumulación de gradientes 4, total efectivo 32), optimizador AdamW, scheduler lineal con warmup del 10%, 15 épocas y precisión mixta (AMP). El dataset de entrenamiento no se ha divulgado ("unknown dataset"), y la model card no proporciona detalles sobre la composición de los datos ni sobre técnicas como RLHF o DPO.

## Capacidades

- Clasificación de tokens para conceptos lingüísticos, incluyendo etiquetas como Academicdiscipline, Ambiguouslydefinedconcept, Discoursephenomenon, Graphemicphenomenon, Languagerelatedterm, Languageresourceinformation, Lexicalphenomenon, Morphologicalphenomenon, Morphosyntacticphenomenon, Otherlinguisticterm, Phonologicalphenomenon, Semanticphenomenon, Syntacticphenomenon, Topnode Dummy y Unclassifiedlinguisticconcept.
- Herencia multilingüe del modelo base, aunque no se especifican los idiomas concretos.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No incluye capacidades de visión ni audio.
- No se ha documentado un modo de pensamiento (thinking mode) explícito.

## Casos de uso

- Anotación de corpus lingüísticos: el modelo puede etiquetar automáticamente fenómenos lingüísticos en textos académicos, facilitando la creación de datasets anotados para investigación en lingüística computacional.
- Extracción de terminología especializada: permite identificar términos relacionados con disciplinas académicas, conceptos ambiguos o fenómenos discursivos en documentos técnicos o científicos.
- Análisis de textos educativos: clasificación de elementos gramaticales y morfosintácticos en materiales didácticos para el desarrollo de herramientas de aprendizaje de idiomas.
- Procesamiento de recursos lingüísticos: detección de referencias a recursos de información lingüística (diccionarios, gramáticas) en textos, útil para la construcción de ontologías.
- Estudio de fenómenos fonológicos y semánticos: el modelo puede ayudar a identificar patrones fonológicos y semánticos en corpus orales o escritos, apoyando investigaciones en fonética y semántica.
- Enriquecimiento de metadatos en bibliotecas digitales: clasificación de conceptos lingüísticos en artículos o libros para mejorar la indexación y búsqueda temática.

## Benchmarks y rendimiento

La model card no incluye resultados en el `model-index` (lista vacía), pero sí reporta métricas de evaluación en la sección de resultados de entrenamiento. A continuación se presentan los valores finales de evaluación (según el autor):

| Metrica | Valor |
|---|---|
| Loss | 17.0729 |
| Precision | 0.7639 |
| Recall | 0.8119 |
| F1 | 0.7871 |
| Accuracy | 0.9680 |

F1 por etiqueta:

| Etiqueta | F1 |
|---|---|
| Academicdiscipline | 0.4211 |
| Ambiguouslydefinedconcept | 0.8020 |
| Discoursephenomenon | 0.7237 |
| Graphemicphenomenon | 0.0 |
| Languagerelatedterm | 0.8369 |
| Languageresourceinformation | 0.7687 |
| Lexicalphenomenon | 0.7380 |
| Morphologicalphenomenon | 0.8038 |
| Morphosyntacticphenomenon | 0.8304 |
| New Tag | 0.8137 |
| Otherlinguisticterm | 0.7115 |
| Phonologicalphenomenon | 0.8562 |
| Semanticphenomenon | 0.6594 |
| Syntacticphenomenon | 0.7823 |
| Topnode Dummy | 0.6847 |
| Unclassifiedlinguisticconcept | 0.8867 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 559M parámetros en fp32, los pesos ocupan aproximadamente 2,2 GB. Considerando activaciones y overhead, se recomienda al menos 6 GB de VRAM para secuencias de hasta 512 tokens. En cuantización int8, el uso de VRAM se reduce a ~1,5 GB, permitiendo ejecución en GPUs con 4 GB.
- GPU recomendadas: RTX 2060 (6 GB) o superior para fp32; RTX 3060 (12 GB) o superior para mayor margen. Para despliegue en producción, se sugiere A100 o H100 si se requiere alto throughput.
- Compatibilidad con GPUs de consumo: sí, siempre que se use cuantización o se limite la longitud de secuencia.
- Opciones de despliegue: transformers (PyTorch), vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (con conversión previa).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El modelo base `Davlan/bert-base-multilingual-cased-ner-hrl` tiene 110M parámetros y está orientado a NER estándar, mientras que este fine-tune es más grande (559M) y se centra en conceptos lingüísticos. No se han encontrado modelos equivalentes con métricas comparables.

## Limitaciones y advertencias

- El dataset de entrenamiento es desconocido, lo que dificulta evaluar la generalización y posibles sesgos.
- La etiqueta `Graphemicphenomenon` presenta un F1 de 0.0, lo que indica que el modelo no logra clasificar correctamente esta categoría en el conjunto de evaluación.
- La pérdida de validación es alta (17.07), lo que sugiere un posible sobreajuste o una dificultad inherente en la tarea.
- No se han documentado sesgos específicos, pero al ser un modelo multilingüe entrenado en un dataset no revelado, puede presentar desequilibrios entre idiomas o dominios.
- Riesgo de alucinación en la asignación de etiquetas, especialmente en categorías con bajo rendimiento.
- La licencia AFL-3.0 permite uso comercial con atribución, pero se recomienda revisar los términos exactos.
- No se garantiza soporte para tool calling ni integración con agentes.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/c-ho/2026-08-27-crf-classweights-clean)
- [Perfil del autor en Hugging Face](https://huggingface.co/c-ho)
- [Modelo base: Davlan/bert-base-multilingual-cased-ner-hrl](https://huggingface.co/Davlan/bert-base-multilingual-cased-ner-hrl)
