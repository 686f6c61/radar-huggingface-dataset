# SaiDurga435/sentiment-model

## Resumen

sentiment-model es un modelo de clasificación de texto publicado por el usuario SaiDurga435 en Hugging Face. Se trata de un ajuste fino (fine-tuning) de distilbert-base-uncased, un transformer encoder de tipo BERT destilado con 66.955.779 parámetros, orientado a la clasificación de secuencias mediante la librería Transformers. El nombre del repositorio sugiere una tarea de análisis de sentimiento, aunque la model card no declara explícitamente el dominio, la taxonomía de clases ni el conjunto de datos empleado.

El modelo se entrenó durante 3 épocas con un learning rate de 2e-05, batch size de 32 y el optimizador AdamW (variante fused), según los hiperparámetros registrados automáticamente por el Trainer. La evaluación declarada arroja una pérdida de 0,7470, una accuracy de 0,6598 y un F1 ponderado y macro de 0,6493, cifras modestas para una tarea de clasificación binaria o de pocas clases en inglés.

Su relevancia actual es limitada: acumula 0 descargas y 0 likes, la model card está generada automáticamente y contiene varios apartados sin completar ("More information needed"), y el índice de benchmarks está vacío. Resulta útil, en todo caso, como ejemplo de pipeline de fine-tuning reproducible o como punto de partida para un reentrenamiento sobre datos propios, no como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder de tipo BERT destilado (DistilBERT), con cabeza de clasificación de secuencias |
| Parámetros totales | 66.955.779 |
| Longitud de contexto | 512 tokens (heredada de distilbert-base-uncased; no declarada en la model card) |
| Tipos de cuantización | no disponible; el repositorio (0,3 GB) es compatible con pesos safetensors en FP32 |
| Idiomas soportados | no disponible en la model card; el modelo base es uncased y entrenado principalmente en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Tokenizador | no declarado; se hereda el de distilbert-base-uncased (WordPiece, uncased) |
| Número de etiquetas | no disponible |
| Datos de entrenamiento | no disponibles (la model card indica "on an unknown dataset") |

## Arquitectura y entrenamiento

La arquitectura corresponde a DistilBERT, una destilación de BERT-base: mantiene la estructura de encoder Transformer pero reduce el número de capas y el cómputo respecto al modelo original, lo que se traduce en 66.955.779 parámetros totales frente a los aproximadamente 110 millones de BERT-base. Sobre ese cuerpo se añade una cabeza de clasificación de secuencias (pooler + capa lineal), que es la que produce los logits por clase. El modelo no incorpora mecanismos de atención lineal, decodificación especulativa, mezcla de expertos ni componentes multimodales: es un encoder denso estándar.

El entrenamiento se realizó con 3 épocas, 58 pasos por época (174 pasos en total) y un batch size de 32, lo que implica aproximadamente 1.856 ejemplos por época, es decir, unos 5.568 ejemplos procesados en total. Se usó AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, learning rate 2e-05, scheduler lineal y semilla 42. No hay evidencia de RLHF, DPO ni de ningún otro ajuste por preferencias. La composición del dataset, su tamaño exacto y el número de clases son desconocidos.

Los registros de validación muestran un patrón de sobreajuste leve: la accuracy y el F1 alcanzan su máximo en la época 2 (0,6975 y 0,6881 respectivamente) y caen en la época 3 (0,6821 y 0,6736), mientras que la pérdida de entrenamiento sigue descendiendo hasta 0,6785. Además, existe una incoherencia entre las métricas de evaluación declaradas al principio de la card (loss 0,7470; accuracy 0,6598) y las de la última época de la tabla de entrenamiento (0,7117; 0,6821), lo que sugiere que el checkpoint publicado no corresponde al mejor punto de validación.

## Capacidades

- Clasificación de texto: el pipeline declarado es text-classification, de modo que devuelve una distribución de probabilidad (o etiquetas con score) sobre un conjunto cerrado de clases.
- Análisis de sentimiento: el nombre del modelo apunta a polaridad (positiva/negativa o similar), pero la model card no confirma la taxonomía ni el número de clases.
- Clasificación de textos de hasta 512 tokens; los documentos más largos deben truncarse o segmentarse.
- Inferencia económica: al tener 66,9 millones de parámetros, la evaluación por lotes es viable en CPU y en GPUs de gama baja.
- Ajuste fino adicional: puede reentrenarse sobre un dataset etiquetado propio partiendo del checkpoint publicado, con coste de cómputo reducido.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni flujos de agente: no es un modelo generativo.
- No tiene modo "thinking", ni capacidades de visión, audio o generación de imagen.
- No hay soporte multilingüe declarado; al derivar de un modelo uncased y presumiblemente entrenado en inglés, el rendimiento fuera de ese idioma no está garantizado.
- No se documenta streaming, ni salida estructurada (JSON schema), ni logprobs configurables más allá de los scores de la pipeline.

## Casos de uso

- Análisis de sentimiento sobre reseñas de producto: el modelo puede puntuar comentarios de hasta 512 tokens y agregar la polaridad por producto o por vendedor en un panel de analítica. Requiere validación previa, porque la accuracy declarada (0,6598) es insuficiente para decisiones automáticas sin revisión humana.
- Monitorización de menciones en redes sociales: al ser un modelo de 66,9 millones de parámetros, se pueden procesar lotes grandes en CPU o en una única GPU, lo que abarata el scoring masivo de publicaciones y la construcción de series temporales de opinión.
- Triaje de tickets de soporte: la etiqueta de polaridad puede usarse como señal auxiliar para priorizar incidencias negativas antes de que un agente humano las revise, combinada con reglas de negocio y umbrales de confianza.
- Señal secundaria en pipelines de moderación de contenido: el score de sentimiento puede alimentar un clasificador de segundo nivel o un sistema de reglas, nunca como decisión única.
- Clasificación de respuestas abiertas en encuestas (NPS, CSAT): permite convertir comentarios libres en categorías agregables para informes recurrentes, con muestreo manual periódico para controlar la deriva.
- Pre-etiquetado de datasets para anotación humana: el modelo puede generar etiquetas iniciales sobre un corpus no etiquetado y reducir el trabajo de revisión, dejando la corrección final al anotador.
- Punto de partida para transfer learning: reentrenar el checkpoint sobre un dominio concreto (por ejemplo, opiniones financieras o reseñas médicas) es barato en cómputo, y el modelo sirve como inicialización razonable frente a partir de distilbert-base-uncased sin ajustar.
- Clasificación por lotes en pipelines de datos: integrarlo como paso de un ETL sobre textos cortos (titulares, asuntos de correo, comentarios) donde se prioriza el coste por documento por encima de la precisión máxima.

## Benchmarks y rendimiento

El índice de benchmarks del modelo (`model-index`) está vacío: no se han publicado resultados comparativos en MMLU, GLUE, HumanEval ni en ningún otro conjunto estándar. Los únicos datos disponibles son las métricas de evaluación declaradas por el autor y la tabla de entrenamiento por época.

| Conjunto de evaluación | Loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|
| Evaluación declarada en la model card | 0,7470 | 0,6598 | 0,6493 | 0,6493 |

| Época | Paso | Training loss | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|---|
| 1 | 58 | 1,0498 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 2 | 116 | 0,8304 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 3 | 174 | 0,6785 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

No se dispone de comparación con modelos de referencia sobre el mismo conjunto de datos, ya que el dataset de evaluación no se especifica.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 268 MB solo de pesos; en FP16, unos 134 MB; en INT8, unos 67 MB. Con el runtime, el tokenizador y los tensores de activación, un presupuesto práctico de 1-2 GB es suficiente.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM. El modelo cabe con holgura en GTX 1650, RTX 3060, RTX 4090, T4, L4, A10, A100 y H100; en estas dos últimas el cuello de botella será el preprocesado, no la inferencia.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo modernas, y también en CPU con un rendimiento aceptable por lotes.
- Opciones de despliegue: Transformers con PyTorch, exportación a ONNX Runtime o TorchScript, TorchServe, Hugging Face Inference Endpoints (el modelo lleva la etiqueta `endpoints_compatible`) y Text Embeddings Inference (TEI) en modo clasificación. vLLM admite modelos de clasificación de tipo BERT, por lo que es una opción válida para servir con batching continuo. llama.cpp y Ollama no son la vía natural para este modelo, ya que su soporte para encoders BERT de clasificación es limitado.
- Latencia y throughput: no disponibles. No se ha publicado ninguna medición de latencia ni de documentos por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento declarado | Disponibilidad |
|---|---|---|---|---|---|
| SaiDurga435/sentiment-model | 66.955.779 | 512 tokens | apache-2.0 | Accuracy 0,6598; F1 macro 0,6493 (conjunto no especificado) | Hugging Face, 0 descargas |
| distilbert-base-uncased-finetuned-sst-2-english | ~66 M | 512 tokens | apache-2.0 | Accuracy en torno a 0,91 en SST-2, según su model card (no verificado en esta ficha) | Hugging Face, ampliamente descargado |
| distilbert-base-uncased | 66.955.779 | 512 tokens | apache-2.0 | Modelo base sin ajuste de clasificación; no aplica | Hugging Face, muy descargado |
| roberta-base | ~125 M | 514 tokens | mit | Modelo base; no aplica como clasificador directo | Hugging Face |
| bert-base-uncased | ~110 M | 512 tokens | apache-2.0 | Modelo base; no aplica como clasificador directo | Hugging Face |

La comparación directa de rendimiento no es posible: este modelo no evalúa sobre un conjunto público identificable, mientras que las alternativas o bien son modelos base sin cabeza de clasificación, o bien reportan resultados sobre SST-2. En igualdad de arquitectura, distilbert-base-uncased-finetuned-sst-2-english parte de la misma base y está entrenado sobre un dataset público y documentado, lo que lo convierte en una referencia más fiable para tareas de sentimiento en inglés.

## Limitaciones y advertencias

- Rendimiento bajo: con accuracy 0,6598 y F1 macro 0,6493, el modelo comete errores en aproximadamente uno de cada tres ejemplos. No es apto para decisiones automáticas sin supervisión.
- Dataset de entrenamiento desconocido: no se puede evaluar cobertura, sesgos ni dominios de aplicación, ni reproducir el entrenamiento.
- Taxonomía de clases no documentada: se desconoce el número de etiquetas, su significado y el orden de los logits, lo que dificulta la integración en producción.
- Incoherencia interna: las métricas finales de la card no coinciden con las de la última época de la tabla de entrenamiento, lo que sugiere que el checkpoint publicado no es el mejor punto de validación.
- Posible sobreajuste: la mejor validación se alcanza en la época 2 y empeora en la 3.
- Sesgos: no hay ninguna evaluación de sesgo. Los corpus de sentimiento en inglés suelen arrastrar sesgos de dominio (reseñas de cine o productos), de registro lingüístico y demográficos; al no conocerse el dataset, no se pueden acotar.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de sobreconfianza, es decir, scores altos en clasificaciones incorrectas, especialmente fuera de la distribución de entrenamiento.
- Limitación de contexto: 512 tokens; los textos largos requieren truncado o segmentación, y el truncado puede eliminar la información decisiva del documento.
- Limitación de idioma: el modelo base es uncased en inglés; no se declara soporte de castellano ni de otros idiomas, y el rendimiento fuera del inglés no está garantizado.
- Licencia: apache-2.0 permite uso comercial y modificación, pero no exime al usuario de validar el modelo ni de asumir los sesgos heredados del dataset de entrenamiento no declarado.
- Estado del repositorio: 0 descargas y 0 likes implican ausencia de validación comunitaria. La model card está autogenerada y sin revisar, con apartados de uso previsto, limitaciones y datos de entrenamiento sin completar.
- Sin garantías de mantenimiento: el autor no ha documentado soporte, versiones futuras ni correcciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SaiDurga435/sentiment-model
- Modelo base distilbert-base-uncased: https://huggingface.co/distilbert-base-uncased
- Artículo de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Artículo de BERT (Devlin et al., 2018), arquitectura de la que deriva el modelo base: https://arxiv.org/abs/1810.04805
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos específicos de este modelo.
