# fastino/gliner2.5-small-v1

## Resumen

GLiNER2.5 Small es un modelo compacto de extracción de información basado en esquemas (schema-based), desarrollado por Fastino. Con 73,9 millones de parámetros y un encoder DeBERTa-v3-xsmall, está diseñado para ejecutar tareas de extracción de entidades, clasificación de texto, extracción de relaciones y parsing de registros estructurados en una única arquitectura de fronteras (boundary architecture). Forma parte de la familia GLiNER2.5, que incluye también variantes base (194M) y multilingüe (287M) con la misma API pública.

El modelo resuelve el problema de unificar múltiples tareas de information extraction (NER, relation extraction, intent classification, sentiment analysis, topic classification) en un solo checkpoint, evitando el despliegue de varios modelos especializados. Su arquitectura de fronteras emplea emparejamiento disperso de tokens de inicio y fin en lugar de una rejilla fija de anchos de span, lo que permite extraer spans de cualquier longitud dentro de la ventana codificada.

Es relevante por su eficiencia: al ser un modelo de 74M de parámetros, está pensado para inferencia en CPU y despliegues en el borde (edge), manteniendo la misma API que los modelos mayores de la familia. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Boundary architecture sobre encoder DeBERTa-v3-xsmall |
| Parametros totales | 73.881.879 (74M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (via flag `quantize=True`); no se detallan otros formatos |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLiNER2.5 Small utiliza una arquitectura de fronteras (boundary architecture) en la que la extracción se realiza mediante emparejamiento disperso de tokens de inicio y fin, en lugar de una rejilla fija de anchos de span. Esto permite manejar spans de cualquier longitud que quepa en la ventana codificada. El encoder subyacente es DeBERTa-v3-xsmall. El checkpoint se carga mediante `AutoExtractor`, que selecciona automáticamente `BoundaryExtractor` según el campo `architecture` del checkpoint.

El modelo incorpora decodificación restringida (constrained decoding) mediante dos mecanismos: `Classifier` para restricciones de etiquetas entre tareas y `JointIE` para grafos tipados de entidad-relación. La model card no proporciona detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El paper asociado es arXiv:2507.18546.

## Capacidades

- Extracción de entidades nombradas (NER) con etiquetas personalizadas y descripciones opcionales para dominios específicos.
- Clasificación de texto: intent classification, sentiment analysis, topic classification.
- Extracción de relaciones (relation extraction) mediante grafos tipados entidad-relación con `JointIE`.
- Parsing de registros estructurados y extracción de JSON.
- Puntuación de atributos de span (span attributes).
- Extracción de información basada en esquemas unificados: entidades, clasificación, registros y relaciones en una sola pasada.
- Decodificación restringida entre tareas con `Classifier`.
- Inferencia local en CPU, CUDA o MPS sin API externa.
- Soporte de offsets de caracteres de medio intervalo abierto: `text[start:end] == entity["text"]`.
- Capacidades multilingües: no (solo inglés en este checkpoint; la variante `multi-v1` cubre multilingüe).

## Casos de uso

- Extracción de entidades en documentos médicos: el modelo permite definir etiquetas con descripciones ("medication", "dosage", "symptom", "time") y extraer spans con offsets exactos, adecuado para pipelines de digitalización de historiales clínicos.
- Clasificación de tickets de soporte: con `classify_text` se pueden asignar categorías de intent y sentimiento en una sola llamada, reduciendo el número de modelos desplegados en producción.
- Extracción de relaciones en textos financieros: mediante `JointIE` se pueden construir grafos tipados de entidad-relación (por ejemplo, empresa-adquisición-empresa) para alimentar bases de conocimiento.
- Parsing de registros estructurados desde texto libre: extracción de JSON a partir de correos o formularios, útil para integrar datos no estructurados en sistemas CRM o ERP.
- Procesamiento en el borde (edge): con 74M de parámetros y soporte de CPU/MPS, es adecuado para dispositivos con recursos limitados donde no es viable un modelo mayor.
- Análisis de opiniones y temas: combinación de sentiment analysis y topic classification sobre reseñas de productos o comentarios de usuarios en tiempo real.
- Enriquecimiento de datos en pipelines de CI/CD: integración en flujos de preprocesamiento para etiquetar y estructurar datos antes de su indexación o almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 74M de parámetros; en fp32 ocupa aproximadamente 0,3 GB y en fp16 aproximadamente 0,15 GB, más overhead de activaciones.
- GPU recomendadas: no se especifican en la información disponible; por su tamaño, cualquier GPU con al menos 2 GB de VRAM es suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: `gliner2[local]` con PyTorch; soporte de CPU, CUDA y MPS; flags `map_location`, `quantize` (fp16) y `compile` (torch.compile).
- Latencia y throughput estimados: no disponibles; la model card indica que es más rápido en CPU que los modelos mayores de la familia, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Encoder | Idioma | Licencia | Uso |
|---|---|---|---|---|---|
| fastino/gliner2.5-small-v1 | 74M | DeBERTa-v3-xsmall | Inglés | Apache 2.0 | Extracción rápida en CPU |
| fastino/gliner2.5-base-v1 | 194M | DeBERTa-v3-base | Inglés | Apache 2.0 | Checkpoint multi-tarea por defecto en inglés |
| fastino/gliner2.5-multi-v1 | 287M | mDeBERTa-v3-base | Multilingüe | Apache 2.0 | Checkpoint multi-tarea multilingüe por defecto |

Los tres modelos comparten la misma API pública. No se dispone de datos de benchmarks para comparar rendimiento entre ellos.

## Limitaciones y advertencias

- Solo soporta inglés; para otros idiomas es necesario usar la variante `multi-v1`.
- No se han publicado datos sobre sesgos conocidos ni sobre tasas de alucinación.
- La longitud de contexto no está especificada en la información disponible.
- El uso de `GLiNER2.from_pretrained(...)` (loader legacy de span) no funciona con este checkpoint; es obligatorio usar `AutoExtractor`.
- Requiere Python 3.10 o superior y la extra `gliner2[local]` para inferencia local.
- Aunque la licencia es Apache 2.0 (permite uso comercial), conviene verificar las condiciones de los datos de entrenamiento, no detalladas en la model card.
- Al ser un modelo de 74M, su capacidad de razonamiento y generalización es limitada en comparación con los checkpoints base y multi de la familia.

## Enlaces

- Hugging Face: https://huggingface.co/fastino/gliner2.5-small-v1
- Paper: https://arxiv.org/abs/2507.18546
- GitHub: https://github.com/fastino-ai/GLiNER2
- Fastino Agent (fine-tuning): https://agent.fastino.ai
- Reddit: https://www.reddit.com/r/GLiNER/
- X/Twitter: https://x.com/fastinoAI
- Modelo base de la familia: https://huggingface.co/fastino/gliner2.5-base-v1
- Modelo multilingüe de la familia: https://huggingface.co/fastino/gliner2.5-multi-v1
