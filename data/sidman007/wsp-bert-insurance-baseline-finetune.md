# sidman007/wsp-bert-insurance-baseline-finetune

## Resumen

`wsp-bert-insurance-baseline-finetune` es un modelo de clasificación de texto en inglés publicado por el usuario `sidman007` en Hugging Face. Se trata de un `BertForSequenceClassification` construido sobre `google-bert/bert-base-uncased` y adaptado a la clasificación de oraciones del dominio de seguros con ocho etiquetas: `coverage_grant`, `exclusion`, `premium_payment`, `deductible_limits`, `claims_procedure`, `definitions`, `term_cancellation_renewal` y `conditions_duties`.

Lo relevante del modelo no es su rendimiento, sino su método de construcción: según la model card, no se ha entrenado con descenso de gradiente ni con optimizadores, sino mediante *weight-space programming*. Un LLM editor habría leído y reescrito directamente los pesos de BERT aplicando matemática en forma cerrada sobre los pesos y las activaciones obtenidas de un número presupuestado de pasadas forward. La model card indica que se modificaron 201 tensores y que el 100,000 % de los parámetros cambiaron, es decir, la práctica totalidad del modelo.

El modelo tiene 109.488.392 parámetros, un repositorio de 0,4 GB y licencia Apache 2.0. Es un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, orientado a validar un protocolo experimental de edición de pesos, no a un despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (`BertForSequenceClassification` sobre `bert-base-uncased`) |
| Parametros totales | 109.488.392 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT base admite típicamente 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de BERT base: un transformer encoder con 12 capas, atención multi-cabeza y embeddings de palabra, posición y tipo de token. Sobre esta base se añade una cabeza de clasificación de secuencias (`BertForSequenceClassification`) configurada para ocho etiquetas del dominio asegurador. La model card detalla los tensores editados capa por capa, incluyendo los embeddings (`word_embeddings.weight` con 23.440.877 entradas modificadas, `position_embeddings.weight` con 393.215, `token_type_embeddings.weight` con 1.536), las LayerNorm de embeddings y de cada capa, y los módulos de atención (`query`, `key`, `value`, `attention.output.dense`) e intermedios/salida (`intermediate.dense`, `output.dense`) de las 12 capas del encoder.

El método de construcción declarado es *weight-space programming*: un LLM editor lee y escribe directamente los pesos del modelo base aplicando cálculos en forma cerrada sobre los pesos y sobre activaciones recogidas en un número limitado de pasadas forward. No se emplean retropropagación, optimizadores ni, por tanto, un dataset de entrenamiento convencional con épocas y batches. La model card remite a un README del proyecto para el protocolo y los resultados, pero ese documento no está incluido en la información disponible. No se especifican tokens de entrenamiento, composición del dataset, ni fases de RLHF o DPO.

## Capacidades

- Clasificación de oraciones en inglés en ocho categorías del dominio de seguros: concesión de cobertura, exclusión, pago de prima, límites y franquicias, procedimiento de siniestros, definiciones, cancelación o renovación de término y condiciones y deberes.
- Salida de logits por etiqueta mediante la cabeza `BertForSequenceClassification`, apta para *single-label* o *multi-label* según la configuración de la función de pérdida empleada en inferencia.
- Procesamiento de texto en inglés; no se declara soporte multilingüe.
- No se declara soporte de *tool calling* ni de *function calling*.
- No se declara capacidad de agente ni de razonamiento multi-paso.
- No dispone de modo *thinking*, visión, audio ni generación de texto libre: es un modelo discriminativo de clasificación.

## Casos de uso

- Triaje de pólizas y cláusulas: clasificar fragmentos de contratos de seguro en las ocho categorías definidas para enrutar cada cláusula al equipo legal o actuarial correspondiente. El modelo está específicamente ajustado a este vocabulario.
- Extracción de obligaciones y exclusiones: detectar automáticamente `exclusion` y `conditions_duties` en documentación de pólizas para alimentar sistemas de cumplimiento y revisión contractual.
- Automatización de atención al cliente: etiquetar consultas entrantes de asegurados (`claims_procedure`, `premium_payment`, `coverage_grant`) para dirigirlas al flujo de soporte adecuado antes de la intervención humana.
- Enriquecimiento de bases documentales: anotar corpus históricos de seguros con etiquetas semánticas para búsqueda facetada y recuperación de información.
- Validación de plantillas y textos comerciales: comprobar que las comunicaciones al cliente cubren las categorías regulatorias requeridas (`definitions`, `deductible_limits`, `term_cancellation_renewal`).
- Línea base experimental: servir como referencia en estudios de *weight-space programming* frente a fine-tuning clásico con descenso de gradiente, dado que la model card documenta exhaustivamente los tensores editados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB solo de pesos (109,5 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en fp16: aproximadamente 0,22 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, T4, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en cualquier GPU moderna e incluso en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, `TextClassificationPipeline`, ONNX Runtime, TorchScript o `optimum`; también es posible exportarlo a GGUF para `llama.cpp`, aunque no se documenta en la model card.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sidman007/wsp-bert-insurance-baseline-finetune` | 109,5 M | no disponible | Clasificación de 8 etiquetas de seguros | apache-2.0 | Hugging Face, 0 descargas |
| `google-bert/bert-base-uncased` | 110 M | 512 tokens (típico) | Modelo base de propósito general | apache-2.0 | Hugging Face, ampliamente usado |
| `ProsusAI/finbert` | ~110 M | 512 tokens (típico) | Clasificación de sentimiento financiero | no disponible en esta consulta | Hugging Face |

La comparación con `finbert` se ofrece como referencia de categoría (BERT base adaptado a un dominio regulado), pero no se dispone de datos de rendimiento de ninguno de los tres modelos en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y cero likes: no hay evidencia de uso en producción ni validación externa.
- El método de construcción (*weight-space programming* sin descenso de gradiente) es experimental; la model card no reporta métricas de precisión, recall ni F1 sobre ningún conjunto de evaluación.
- No se documenta el dataset utilizado para derivar las activaciones ni el proceso de selección de las ocho etiquetas, lo que impide evaluar sesgos de dominio.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí riesgo de clasificaciones erróneas sin calibración conocida.
- Soporte exclusivo de inglés; inadecuado para textos en castellano u otros idiomas sin un ajuste adicional.
- La model card está truncada en la información disponible (la lista de tensores editados se corta en la capa 2), por lo que no se puede verificar el inventario completo de modificaciones.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación de rendimiento desaconseja su uso en producción sin una validación propia sobre datos del dominio.
- No se especifican limitaciones de contexto más allá de las inherentes a BERT base; conviene confirmar la longitud máxima configurada antes de procesar documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sidman007/wsp-bert-insurance-baseline-finetune
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- README del proyecto con protocolo y resultados: no disponible en la información proporcionada
- Paper, blog o repositorio del método *weight-space programming*: no disponible en la información proporcionada
