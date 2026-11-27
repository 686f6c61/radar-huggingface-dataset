# instilux/luni-base-ner_v1

## Resumen

Luni-base-ner_v1 es un modelo de reconocimiento de entidades nombradas (NER) publicado por el usuario instilux en Hugging Face. Se trata de un ajuste fino de la familia ModernBERT, una arquitectura de encoder transformer presentada a finales de 2024 como sucesora de BERT con mejoras en eficiencia y longitud de contexto. El modelo cuenta con 149.613.323 parámetros en formato safetensors y un tamaño de repositorio de 0,6 GB, lo que corresponde a pesos en precisión de 32 bits.

La información pública disponible es muy limitada: la model card únicamente declara la licencia CC-BY-4.0, sin descripción de la tarea, el dataset de entrenamiento, los idiomas soportados ni los resultados de evaluación. El nombre del repositorio sugiere un uso para extracción de entidades, pero no hay confirmación documental de las etiquetas concretas (por ejemplo, PER, LOC, ORG, MISC) ni del esquema de anotación empleado.

Por su tamaño y arquitectura, es un modelo adecuado para tareas de etiquetado de secuencias con requisitos moderados de hardware, aunque la ausencia de documentación y de métricas publicadas obliga a validarlo empíricamente antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 149.613.323 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ModernBERT soporta hasta 8192 tokens; no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32) |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, un encoder transformer que incorpora atención con rotatory positional embeddings (RoPE), alternancia entre atención global y local, y capas de normalización y activaciones optimizadas para hardware moderno. Esta arquitectura permite manejar secuencias más largas que BERT clásico con menor coste computacional. El número de parámetros (≈150 M) es coherente con la variante "base" de la familia.

No se dispone de información sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si hubo ajuste supervisado sobre un corpus anotado con etiquetas NER, ni detalles sobre técnicas de regularización o inicialización. Tampoco se documenta si el ajuste parte de un checkpoint oficial de ModernBERT o de una variante previa del autor.

## Capacidades

- Etiquetado de secuencias orientado a reconocimiento de entidades nombradas, según indica el nombre del repositorio; el esquema exacto de etiquetas no está documentado.
- Codificación de texto con representaciones contextuales propias de un encoder bidireccional.
- No se ha confirmado soporte de tool calling, function calling ni comportamiento agéntico.
- No se ha confirmado capacidad multilingüe; los idiomas no están declarados en la model card.
- No se ha confirmado modo de razonamiento explícito ni capacidades de visión o audio.
- No se ha confirmado generación de texto libre; al ser un encoder, su uso esperado es discriminativo (clasificación por token).

## Casos de uso

- Extracción de entidades en pipelines de procesamiento documental: el modelo puede aplicarse sobre texto tokenizado para etiquetar menciones de personas, organizaciones o lugares, siempre que se valide previamente el esquema de etiquetas con datos propios.
- Anonimización de datos personales antes de almacenamiento o compartición: un NER permite localizar menciones para su enmascaramiento en flujos de cumplimiento normativo (RGPD), condicionado a una evaluación de recall sobre el dominio objetivo.
- Enriquecimiento de bases de conocimiento: extracción de entidades de artículos o informes para poblar grafos de conocimiento o índices de búsqueda semántica.
- Preprocesado para sistemas RAG: identificación de entidades en consultas y documentos para mejorar el filtrado y la recuperación.
- Análisis de opiniones y reseñas: detección de marcas, productos y ubicaciones mencionadas en texto de cliente para su explotación analítica.
- Etiquetado asistido en anotación humana: uso del modelo como pre-anotador en herramientas de labeling para reducir el esfuerzo manual, con revisión posterior.
- Clasificación de tickets de soporte: extracción de entidades (productos, cuentas, localizaciones) para el enrutado automático, sujeto a validación de precisión en el dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,6 GB solo para pesos, más memoria para activaciones y batch; con batch pequeño cabe en GPUs de 4-8 GB.
- En fp16 el peso se reduce a aproximadamente 0,3 GB, con requisitos totales por debajo de 2 GB para batches moderados.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también A10, L4, A100 o H100 para despliegues de alto throughput.
- Es viable su ejecución en CPU para cargas de baja concurrencia, dado el tamaño reducido del modelo.
- Opciones de despliegue: Hugging Face Transformers, Text Embeddings Inference (TEI) para encoders, ONNX Runtime, o conversión a GGUF para llama.cpp aunque el soporte de ModernBERT en dichos runtimes debe verificarse.
- Latencia y throughput estimados: no disponibles; dependerán del hardware, la longitud de secuencia y el tamaño de batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| instilux/luni-base-ner_v1 | 149,6 M | no disponible | NER (presunto) | CC-BY-4.0 | Hugging Face |
| dslim/bert-base-NER | ≈110 M | 512 | NER (PER, LOC, ORG, MISC) | MIT | Hugging Face |
| Jean-Baptiste/roberta-large-ner-english | ≈355 M | 512 | NER en inglés | MIT | Hugging Face |
| answerdotai/ModernBERT-base | ≈149 M | 8192 | Base sin ajuste | Apache-2.0 | Hugging Face |

La comparación con dslim/bert-base-NER y roberta-large-ner-english es pertinente por tarea, aunque no se dispone de métricas de luni-base-ner_v1 para contrastar calidad. Frente a ModernBERT-base, comparte arquitectura y tamaño, pero añade un ajuste específico cuya naturaleza exacta no está documentada.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, el esquema de etiquetas y los idiomas, lo que impide evaluar su idoneidad sin pruebas propias.
- No hay métricas publicadas de precisión, recall o F1; el rendimiento real es desconocido.
- Riesgo de sesgos y de degradación fuera del dominio de entrenamiento, imposible de cuantificar sin información adicional.
- Riesgo de alucinación de entidades o de etiquetado inconsistente en textos con formato atípico, jerga o dominios especializados.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero no se especifican restricciones adicionales ni condiciones de uso aceptable.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.
- Antes de usarlo en producción, es imprescindible construir un conjunto de evaluación representativo del dominio objetivo y comparar contra alternativas consolidadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/instilux/luni-base-ner_v1
- Repositorio de ModernBERT (referencia arquitectónica): https://huggingface.co/answerdotai/ModernBERT-base
- Paper de ModernBERT: https://arxiv.org/abs/2412.13663
