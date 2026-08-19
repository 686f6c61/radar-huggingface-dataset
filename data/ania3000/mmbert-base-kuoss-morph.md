# ania3000/mmbert-base-kuoss-morph

## Resumen

El modelo `ania3000/mmbert-base-kuoss-morph` es un ajuste fino (fine-tuning) del modelo base `jhu-clsp/mmBERT-base`, orientado a tareas de clasificación de tokens (token-classification). El autor, ania3000, lo ha entrenado sobre un conjunto de datos no especificado en la model card, y el nombre sugiere una especialización en análisis morfológico (kuoss-morph). El modelo está basado en la arquitectura ModernBERT, según las etiquetas del repositorio, y cuenta con 308 millones de parámetros, lo que lo sitúa en un rango superior a los típicos BERT-base (110M) y cercano a modelos de tamaño medio-grande. Su licencia MIT permite uso comercial sin restricciones, aunque la falta de documentación detallada limita su aplicabilidad inmediata en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (basado en mmBERT-base) |
| Parametros totales | 308.090.841 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `jhu-clsp/mmBERT-base`, que a su vez se basa en la arquitectura ModernBERT (etiqueta `modernbert` en el repositorio). No se proporcionan detalles sobre el número de capas, dimensión oculta o mecanismos de atención específicos. El entrenamiento se realizó con el framework Transformers (versión 4.57.3) y PyTorch 2.11.0, utilizando el optimizador AdamW con learning rate 5e-05, batch size 8, scheduler lineal y 25 épocas. El conjunto de datos de entrenamiento no está documentado, y tampoco se menciona el uso de técnicas como RLHF o DPO. No se reportan innovaciones técnicas adicionales más allá del ajuste fino estándar.

## Capacidades

- Clasificación de tokens: el modelo está diseñado para tareas de token-classification, como reconocimiento de entidades nombradas (NER), etiquetado de partes del discurso (POS) o análisis morfológico.
- Pipeline específico: la etiqueta `token-classification` indica que es adecuado para tareas donde cada token recibe una etiqueta.
- No se documentan capacidades adicionales como generación de texto, razonamiento, tool calling o soporte multimodal.

## Casos de uso

- Análisis morfológico de textos: dado el nombre "kuoss-morph", el modelo podría utilizarse para etiquetar morfemas en lenguas con morfología rica, aunque no se especifica el idioma objetivo.
- Reconocimiento de entidades nombradas (NER): al ser un modelo de clasificación de tokens, puede aplicarse a la extracción de entidades en documentos, siempre que se ajuste a los datos de entrenamiento.
- Etiquetado de partes del discurso (POS): útil en pipelines de procesamiento de lenguaje natural para anotar categorías gramaticales.
- Preprocesamiento para sistemas de búsqueda: las etiquetas generadas pueden alimentar índices semánticos o filtros en motores de búsqueda.
- Análisis de textos biomédicos o legales: si el dataset de entrenamiento pertenece a un dominio específico, podría emplearse para anotar términos técnicos, aunque no hay evidencia de ello.
- Prototipos de investigación: al ser un modelo pequeño (308M parámetros) y con licencia MIT, es adecuado para experimentos académicos o pruebas de concepto en clasificación de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GLUE) en la información disponible. La model card reporta métricas de evaluación del propio entrenamiento, que se resumen a continuación:

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0.8549 |
| Accuracy | 92.5064 |
| Sentence accuracy | 47.9134 |

Estos valores corresponden a la evaluación final tras 16 épocas (el entrenamiento se detuvo en la época 16 de 25 según la tabla de resultados). No se dispone de comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 308M parámetros en FP32, el modelo ocupa aproximadamente 1.2 GB; en FP16 (half precision) ~0.6 GB; en int8 ~0.3 GB. Esto permite inferencia en GPUs con al menos 2 GB de VRAM.
- GPUs recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050) puede ejecutar el modelo sin problemas. Para entrenamiento o fine-tuning adicional, se recomienda una GPU con 8 GB o más (RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: al ser un modelo de Transformers, se puede servir con vLLM, TGI, o mediante la librería `transformers` directamente. También es compatible con `endpoints_compatible` según las etiquetas.
- Latencia y throughput: no se proporcionan datos. Como estimación orientativa, en una GPU RTX 3090 la inferencia de un lote pequeño (tamaño 1) debería completarse en decenas de milisegundos, pero no hay cifras confirmadas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos de la misma categoría (clasificación de tokens basados en ModernBERT o BERT). No se conocen modelos comparables con los mismos parámetros y licencia en el momento de redactar esta ficha.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica "More information needed" para los datos de entrenamiento, lo que impide evaluar la generalización y posibles sesgos.
- Idiomas no especificados: no se indica qué idiomas soporta el modelo; su uso en idiomas distintos al de entrenamiento podría producir resultados erróneos.
- Riesgo de alucinación en etiquetas: como todo modelo de clasificación, puede asignar etiquetas incorrectas a tokens ambiguos o fuera de distribución.
- Sin benchmarks estándar: no hay evidencia de rendimiento en tareas reconocidas, por lo que su calidad relativa es incierta.
- Documentación escasa: la model card es automática y no incluye instrucciones de uso, limitaciones específicas ni ejemplos de aplicación.
- Compatibilidad: aunque es compatible con `transformers`, no se garantiza su funcionamiento con otras librerías sin conversión previa.

## Enlaces

- [HuggingFace: ania3000/mmbert-base-kuoss-morph](https://huggingface.co/ania3000/mmbert-base-kuoss-morph)
- [Modelo base: jhu-clsp/mmBERT-base](https://huggingface.co/jhu-clsp/mmBERT-base)
