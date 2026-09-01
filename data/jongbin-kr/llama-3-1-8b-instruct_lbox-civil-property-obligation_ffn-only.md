# Jongbin-kr/llama-3.1-8b-instruct_lbox-civil-property-obligation_ffn-only

## Resumen

Este modelo es un fine-tune del modelo `meta-llama/Llama-3.1-8B-Instruct` realizado por el usuario Jongbin-kr, orientado aparentemente al dominio del derecho civil, concretamente a las áreas de propiedad y obligaciones (según el nombre del repositorio: `lbox-civil-property-obligation`). El entrenamiento se ha llevado a cabo mediante fine-tuning supervisado (SFT) utilizando la librería TRL de Hugging Face, y el nombre sugiere que solo se han actualizado las capas feed-forward (FFN) del modelo base, una técnica habitual para reducir el coste de entrenamiento y el riesgo de olvido catastrófico.

El modelo base, Llama 3.1 8B Instruct, es un transformer decoder con 8 mil millones de parámetros, optimizado para seguir instrucciones y con una ventana de contexto de 128K tokens. Este fine-tune hereda la arquitectura y las capacidades generales del base, pero se ha especializado en terminología y razonamiento jurídico civil. Sin embargo, la información pública es muy limitada: no se especifica el dataset de entrenamiento, el número de tokens, ni se han publicado métricas de evaluación. El repositorio tiene un tamaño de 0,6 GB, lo que sugiere que el fine-tune podría haberse realizado con técnicas de eficiencia como LoRA o congelando la mayoría de los parámetros, aunque no se confirma en la documentación.

La relevancia de este modelo radica en la creciente demanda de modelos de lenguaje especializados en dominios concretos, como el legal, donde la precisión terminológica y el razonamiento sobre normativas son críticos. No obstante, su utilidad práctica queda limitada por la falta de documentación y de validación pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3.1) |
| Parametros totales | 8.000 millones (heredados del base, no confirmado si se congelaron algunos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base tiene 128K, pero no se confirma si se mantiene) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el base soporta multiples idiomas, pero no se especifica para este fine-tune) |
| Licencia | no disponible (el modelo base tiene licencia de Meta, pero este fine-tune no declara una) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1, un transformer decoder con atención multi-cabeza, normalización RMSNorm y capas feed-forward con activación SwiGLU. El fine-tune se ha realizado mediante SFT (supervised fine-tuning) utilizando la librería TRL, como se indica en la model card. El nombre del repositorio incluye el sufijo `ffn-only`, lo que sugiere que durante el entrenamiento solo se actualizaron los pesos de las capas feed-forward, dejando congeladas las capas de atención y las embeddings. Esta estrategia es común para adaptar un modelo a un dominio específico reduciendo el coste computacional y el riesgo de degradar las capacidades generales.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje ni el número de épocas. El enlace a Weights & Biases incluido en la model card podría contener estos datos, pero no se ha accedido a él. Tampoco se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es exclusivamente SFT.

## Capacidades

- Generación de texto y seguimiento de instrucciones: hereda las capacidades del modelo base Llama 3.1 8B Instruct, que incluyen generación de texto coherente, respuesta a preguntas y diálogo multi-turno.
- Razonamiento y conocimiento general: el modelo base tiene un buen rendimiento en tareas de razonamiento, matemáticas y conocimiento enciclopédico, aunque no se han evaluado específicamente en este fine-tune.
- Especialización en derecho civil: por el nombre del repositorio, se espera que el modelo haya sido entrenado con textos legales sobre propiedad y obligaciones, lo que podría mejorar su precisión en terminología jurídica y en la interpretación de cláusulas contractuales. Sin embargo, no hay evidencia pública de esta capacidad.
- Soporte de tool calling y agentes: no se ha documentado ninguna capacidad específica de tool calling o razonamiento multi-paso más allá de lo que ofrece el modelo base.
- Multilingüismo: el modelo base soporta varios idiomas, pero no se ha confirmado si el fine-tune mantiene esta capacidad o si se ha limitado a un idioma concreto (probablemente coreano, dado el autor, aunque no se especifica).

## Casos de uso

- Análisis de contratos civiles: el modelo podría utilizarse para extraer cláusulas relevantes, identificar obligaciones de las partes y detectar posibles inconsistencias en contratos de compraventa, arrendamiento o préstamo. Su especialización en propiedad y obligaciones lo haría adecuado para esta tarea, aunque se requiere validación previa.
- Asistencia legal para redacción de documentos: podría ayudar a redactar borradores de escrituras, contratos o notificaciones legales, siempre que el usuario supervise el resultado. La capacidad de seguir instrucciones del modelo base facilita la generación de texto estructurado.
- Consulta de normativa civil: el modelo podría responder preguntas sobre artículos del código civil relativos a propiedad y obligaciones, aunque su fiabilidad dependería de la calidad del dataset de entrenamiento, que no se ha documentado.
- Clasificación de casos legales: dado el nombre `lbox` (posiblemente "legal box"), podría emplearse para categorizar documentos judiciales o administrativos según el tipo de materia (propiedad, obligaciones, etc.).
- Generación de resúmenes de sentencias: el modelo podría resumir sentencias o dictámenes legales, extrayendo los puntos clave y las decisiones. La ventana de contexto del base (128K) permitiría procesar documentos largos, aunque no se confirma si el fine-tune la mantiene.
- Formación y educación legal: podría utilizarse como herramienta de apoyo en la enseñanza del derecho civil, generando ejemplos, explicaciones o casos prácticos para estudiantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este fine-tune, ni comparaciones con otros modelos legales. La ausencia de evaluación pública impide valorar su rendimiento real en tareas jurídicas.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8B parámetros, en precisión FP16 requiere aproximadamente 16 GB de VRAM. Con cuantización a 8 bits (INT8) se reduce a unos 8-9 GB, y a 4 bits (INT4) a unos 5-6 GB. Sin embargo, no se han publicado cuantizaciones específicas para este fine-tune.
- GPU recomendadas: para inferencia en FP16, una GPU con 16 GB o más, como la RTX 4090, A100 (40 GB) o H100. Para cuantización 4 bits, una RTX 3060 (12 GB) o RTX 4070 (12 GB) podría ser suficiente.
- Compatibilidad con GPUs de consumo: sí, con cuantización es posible ejecutarlo en GPUs de consumo como la RTX 3090 o RTX 4090.
- Opciones de despliegue: al ser un modelo de la familia transformers, puede desplegarse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se han proporcionado configuraciones específicas.
- Latencia y throughput: no se han publicado datos. Como referencia, un modelo de 8B en una A100 puede generar alrededor de 50-100 tokens por segundo en FP16, pero esto depende de la implementación y la carga.

## Comparativa con modelos similares

No se dispone de información sobre otros fine-tunes legales del mismo autor o de la misma categoría. La comparativa más directa es con el modelo base `meta-llama/Llama-3.1-8B-Instruct`, del cual deriva. A continuación se muestra una comparación orientativa:

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Llama 3.1 8B Instruct (base) | 8B | 128K | Licencia de Meta (uso comercial permitido con condiciones) | General |
| Este fine-tune | 8B (heredados) | no disponible | no disponible | Derecho civil (propiedad y obligaciones) |

No se han encontrado otros modelos comparables en la búsqueda web, como LegalBERT o modelos jurídicos específicos, pero no son directamente comparables por su tamaño y arquitectura.

## Limitaciones y advertencias

- Falta de documentación: no se especifica el dataset de entrenamiento, el proceso de filtrado ni los criterios de calidad. Esto impide evaluar la fiabilidad del modelo en contextos legales reales.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventar citas legales. En el ámbito jurídico, esto es especialmente peligroso y requiere supervisión humana obligatoria.
- Sesgos potenciales: el dataset de entrenamiento, si proviene de fuentes legales específicas, puede contener sesgos jurisdiccionales o culturales. No se ha declarado ninguna medida de mitigación.
- Licencia incierta: la model card indica `licence: license` sin especificar. El modelo base tiene una licencia de Meta que impone ciertas restricciones (por ejemplo, no usarlo para mejorar otros modelos grandes). El fine-tune podría heredar estas restricciones, pero no se ha aclarado.
- Contexto no confirmado: aunque el base soporta 128K tokens, no se sabe si el fine-tune mantiene esta capacidad. Si se redujo el contexto durante el entrenamiento, podría haber limitaciones en el procesamiento de documentos largos.
- Sin validación pública: no hay benchmarks ni evaluaciones independientes, por lo que su rendimiento real es desconocido. No se recomienda su uso en producción sin una validación exhaustiva.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Jongbin-kr/llama-3.1-8b-instruct_lbox-civil-property-obligation_ffn-only
- Enlace al run de Weights & Biases (entrenamiento): https://wandb.ai/jongbin-kr-skiml_moe/sft_dense_lbox_ffn_only/runs/3wzgkh42
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Librería TRL: https://github.com/huggingface/trl
