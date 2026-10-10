# franckzhuang/distilbert-classifier

## Resumen

distilbert-classifier es un modelo de clasificación de texto obtenido mediante fine-tuning de distilbert/distilbert-base-uncased. Lo publica el usuario franckzhuang en HuggingFace y su propósito declarado es la clasificación de secuencias (pipeline `text-classification`). Se trata, por tanto, de un checkpoint derivado de un Transformer encoder destilado de BERT, con 66.955.010 parámetros totales y un tamaño de repositorio de 0,3 GB. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El interés práctico del modelo está en su coste de inferencia: al ser una variante destilada de BERT (6 capas frente a 12 del original), es adecuado para tareas de clasificación a gran escala en CPU o GPU de gama baja. Sin embargo, la información publicada es mínima y plantea dudas relevantes para producción: la model card indica que el ajuste se hizo sobre un dataset "unknown", no documenta las etiquetas de clasificación ni el dominio de aplicación, y no incluye resultados en el model-index (la lista de resultados está vacía).

El dato más llamativo es la métrica declarada por el autor: accuracy 1.0 y loss de evaluación 0.0008. Con solo 75 pasos de entrenamiento totales (5 pasos por época con batch de 16, es decir, del orden de 80 ejemplos por época), ese resultado apunta a un conjunto de evaluación muy reducido y posiblemente saturado, más que a una capacidad real de generalización. Cualquier uso en producción debería ir precedido de una evaluación propia sobre datos representativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT); 6 capas, hidden size 768 y 12 cabezas de atención según el modelo base distilbert-base-uncased |
| Parametros totales | 66.955.010 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredado del modelo base distilbert-base-uncased, que usa position embeddings de 512) |
| Tipos de cuantizacion | No se distribuyen versiones cuantizadas en el repositorio. Al ser un modelo de 67 M de parámetros, es viable aplicar cuantización dinámica int8 con herramientas estándar (PyTorch u ONNX Runtime), pero no hay artefactos oficiales publicados |
| Idiomas soportados | No disponible en la ficha. El modelo base distilbert-base-uncased está entrenado sobre texto en inglés (vocabulario uncased), por lo que el soporte multilingüe es previsiblemente nulo o muy limitado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (etiqueta del repositorio, library_name: transformers). No se confirma la presencia de GGUF, ONNX ni otros formatos |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un encoder Transformer con 6 capas, mecanismo de self-attention multi-cabeza, hidden size de 768 y aproximadamente 66 M de parámetros, resultado de destilar BERT-base (12 capas, 110 M de parámetros) reduciendo el número de capas a la mitad. Sobre esa base, el autor ha añadido una cabeza de clasificación de secuencias y ha ajustado el modelo completo, como indica la etiqueta `generated_from_trainer` y el campo `base_model: distilbert/distilbert-base-uncased`.

En cuanto al entrenamiento, la model card aporta los hiperparámetros pero no describe los datos. Se usó learning rate 0.001, batch de entrenamiento y evaluación de 16, 15 épocas, semilla 42, optimizador AdamW (variante fused, betas 0.9/0.999, epsilon 1e-08) y scheduler lineal. El histórico de entrenamiento registra 75 pasos en total, 5 por época, lo que implica un dataset de entrenamiento del orden de 80 ejemplos por época como máximo. No se documenta composición del dataset, número de tokens, etiquetas, ni si hubo etapas de RLHF o DPO (no aplicables realmente a un clasificador). Las versiones de framework declaradas son Transformers 5.19.0, PyTorch 2.14.1, Datasets 5.1.0 y Tokenizers 0.23.2.

## Capacidades

- Clasificación de texto: es la única tarea declarada en el pipeline (`text-classification`). Devuelve una etiqueta y una puntuación de confianza por secuencia de entrada.
- Codificación de representaciones: al ser un encoder, puede extraer embeddings contextuales de frases, aunque no está optimizado ni documentado como modelo de embeddings (la etiqueta `text-embeddings-inference` aparece en el repositorio).
- Inferencia en lotes: admite procesamiento por lotes de secuencias cortas, lo que permite clasificar grandes volúmenes de documentos en CPU.
- Fine-tuning posterior: su licencia Apache 2.0 y su tamaño permiten reentrenarlo o ajustarlo a nuevas taxonomías de etiquetas con recursos modestos.
- Generación de texto: no soportada. Es un modelo exclusivamente encoder.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no documentadas; el modelo base es monolingüe en inglés.
- Visión, audio o modo "thinking": no soportados.

## Casos de uso

- Clasificación de tickets de soporte: el modelo puede asignar categorías a entradas de texto cortas (asunto y cuerpo de un ticket). Su ventana de 512 tokens es suficiente para descripciones breves, y su tamaño permite ejecutarlo en CPU dentro del propio backend de atención al cliente.
- Moderación de comentarios: clasificación binaria o multietiqueta de contenido en inglés por debajo de 512 tokens. El coste por inferencia de un encoder de 67 M de parámetros es muy inferior al de un modelo generativo equivalente en tarea.
- Enrutado de documentos en pipelines de ingesta: etiquetar documentos por tipo antes de enviarlos a un proceso posterior, usando lotes grandes en GPU modesta o CPU.
- Análisis de sentimiento en reseñas: si el dataset de ajuste era de sentimiento (no documentado), el modelo podría emplearse para puntuar reseñas. Conviene verificar las etiquetas reales antes de asumirlo.
- Detección de spam o fraude textual: clasificador de bajo coste que puede ejecutarse en el camino crítico de un formulario sin añadir latencia apreciable.
- Preetiquetado para anotación humana: generar etiquetas automáticas sobre grandes volúmenes de texto para que los anotadores solo revisen los casos dudosos, reduciendo el coste de construcción de datasets.
- Filtrado previo a un LLM: descartar o enrutar consultas antes de llamar a un modelo generativo más caro, usando este clasificador como primera etapa de un pipeline en cascada.
- Clasificación en el dispositivo o en el edge: con menos de 300 MB en fp32, puede desplegarse en entornos con memoria limitada donde un modelo mayor no cabe.

## Benchmarks y rendimiento

El model-index del repositorio no contiene resultados: la lista `results` está vacía. Por tanto, no existen benchmarks independientes publicados (MMLU, GLUE, etc.) en la información disponible. Los únicos datos son las métricas declaradas por el autor durante el entrenamiento y la evaluación:

| Epoca | Paso | Perdida de entrenamiento | Perdida de validacion | Accuracy |
|---|---|---|---|---|
| 1.0 | 5 | 0.5588 | 0.2994 | 0.95 |
| 2.0 | 10 | 0.1739 | 0.0510 | 1.0 |
| 3.0 | 15 | 0.0380 | 0.0137 | 1.0 |
| 5.0 | 25 | 0.0045 | 0.0032 | 1.0 |
| 10.0 | 50 | 0.0014 | 0.0009 | 1.0 |
| 15.0 | 75 | 0.0004 | 0.0008 | 1.0 |

Resultado final declarado en la model card: loss de evaluación 0.0008 y accuracy 1.0. Estos valores proceden exclusivamente del autor y no están respaldados por un conjunto de evaluación documentado ni por una comparación con modelos equivalentes.

## Requisitos de hardware

- VRAM en fp32: aproximadamente 268 MB solo para pesos (66.955.010 parámetros × 4 bytes), más activaciones y memoria del runtime.
- VRAM en fp16/bf16: aproximadamente 134 MB para pesos.
- VRAM en int8 (cuantización dinámica, no publicada oficialmente): aproximadamente 67 MB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Ejemplos válidos: NVIDIA T4, GTX 1650, RTX 3060, RTX 4090, A100 o H100, aunque en estas dos últimas el modelo estaría muy infrautilizado.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual e incluso en GPUs integradas con memoria compartida. También es viable en CPU exclusivamente.
- Opciones de despliegue: Transformers (PyTorch) de forma nativa; Text Embeddings Inference, dado que el repositorio incluye la etiqueta `text-embeddings-inference` y `endpoints_compatible`; exportación a ONNX Runtime para inferencia en CPU; TorchScript. No se distribuyen artefactos GGUF, por lo que llama.cpp u Ollama requerirían una conversión manual previa.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Capas | Longitud de contexto | Licencia | Rendimiento en la tarea |
|---|---|---|---|---|---|
| franckzhuang/distilbert-classifier | 66,9 M | 6 | 512 tokens | Apache 2.0 | Accuracy 1.0 declarada por el autor sobre un dataset no documentado |
| distilbert/distilbert-base-uncased | 66,4 M | 6 | 512 tokens | Apache 2.0 | No disponible (modelo base sin cabeza de clasificación ajustada) |
| google-bert/bert-base-uncased | 110 M | 12 | 512 tokens | Apache 2.0 | No disponible (referencia de arquitectura, no ajustado a esta tarea) |
| microsoft/deberta-v3-xsmall | 70,8 M | 12 | 512 tokens | MIT | No disponible (no comparado con este checkpoint) |

La comparación se limita a parámetros, profundidad, contexto y licencia, porque no existen métricas comparables publicadas: este checkpoint solo aporta el resultado de su propio autor y el resto de modelos citados son bases sin ajustar o alternativas cuya evaluación en esta tarea concreta no se ha hecho.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica explícitamente "on an unknown dataset" y deja sin rellenar las secciones de descripción, usos previstos y datos de evaluación. No se sabe qué clases predice el modelo.
- Accuracy de 1.0 no verificable: con 75 pasos de entrenamiento y lotes de 16, el conjunto de evaluación era muy reducido. Un resultado perfecto en esas condiciones es un indicio de sobreajuste o de una tarea trivial, no una garantía de generalización.
- Riesgo alto de alucinación de etiquetas fuera de distribución: al no conocerse la taxonomía ni el dominio, cualquier entrada distinta del dataset original puede recibir una etiqueta con confianza alta y ser incorrecta.
- Sesgos: no documentados. Al derivar de distilbert-base-uncased, hereda los sesgos presentes en los corpus de texto en inglés usados para preentrenar ese modelo.
- Idioma: el modelo base es monolingüe en inglés y aplica *uncased* (pierde distinción entre mayúsculas y minúsculas). No hay evidencia de soporte para castellano ni para otros idiomas.
- Longitud de contexto: 512 tokens como máximo. Textos más largos requieren truncado o segmentación, lo que puede degradar la clasificación.
- Licencia: Apache 2.0, sin restricciones para uso comercial. Es el único punto sin ambigüedad del modelo. Aun así, la procedencia del dataset de ajuste es desconocida, por lo que la responsabilidad sobre los datos de entrenamiento recae en quien despliegue el modelo.
- Repositorio con 0 descargas y 0 "likes" en el momento de la consulta, y con fechas de creación y actualización muy próximas entre sí: no hay evidencia de uso en producción ni de validación por terceros.
- No apto para generación, razonamiento, agentes ni tool calling. Confundir su rol con el de un LLM generativo llevaría a un diseño de sistema incorrecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/franckzhuang/distilbert-classifier
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Documentación de DistilBERT (paper original, referencia del modelo base): https://arxiv.org/abs/1910.01108
- Documentación de Transformers sobre clasificación de secuencias: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- No se han encontrado papers, blogs, repositorios adicionales ni demos específicos de este checkpoint en la información disponible.
