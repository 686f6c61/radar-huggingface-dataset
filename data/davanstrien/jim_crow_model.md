# davanstrien/jim_crow_model

## Resumen

`davanstrien/jim_crow_model` es un ajuste fino (fine-tuning) supervisado del modelo `Qwen/Qwen2.5-1.5B` de Alibaba, publicado por el usuario davanstrien en Hugging Face. Se ha reconfigurado como clasificador de texto mediante la librería Transformers, conservando la arquitectura transformer decoder-only del modelo base pero sustituyendo la cabeza de generación por una cabeza de clasificación. El modelo tiene 1.543.717.376 parámetros y un tamaño de repositorio de 3,1 GB en formato safetensors.

El modelo resuelve una tarea de clasificación binaria o multiclase no especificada en la model card, y su relevancia radica en que demuestra cómo un modelo de lenguaje de 1,5B parámetros puede adaptarse a tareas de clasificación con un conjunto de datos muy pequeño: el entrenamiento se completó en solo 153 pasos (3 épocas con un batch efectivo de 32), lo que sugiere un dataset de evaluación de aproximadamente 1.600 ejemplos. A pesar de ello, alcanza una accuracy de 0,9944 y un F1 de 0,9888 en el conjunto de evaluación.

La licencia Apache 2.0 y la compatibilidad con `text-embeddings-inference` y endpoints de Hugging Face lo hacen desplegable en infraestructura estándar, aunque la ausencia de documentación sobre el dataset, la tarea concreta y los idiomas limita seriamente su uso en producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), adaptado a clasificación de texto |
| Parametros totales | 1.543.717.376 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-1.5B soporta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | Qwen/Qwen2.5-1.5B |
| Tamaño del repositorio | 3,1 GB |
| Librería | transformers 5.23.0 |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2, un transformer decoder-only con atención causal estándar, normalización RMSNorm y activación SwiGLU. El ajuste fino convierte la cabeza de lenguaje original en una cabeza de clasificación, de modo que el modelo emite logits por clase en lugar de tokens. No se ha publicado información sobre la composición del dataset de entrenamiento ni sobre el número de tokens utilizados; la model card indica explícitamente "unknown dataset" y "More information needed" en las secciones de descripción, usos previstos y datos.

El entrenamiento se realizó con el `Trainer` de Transformers durante 3 épocas, con un learning rate de 2e-5, batch de entrenamiento de 2 con 16 pasos de acumulación de gradiente (batch efectivo de 32), optimizador AdamW fused con betas (0,9; 0,999), scheduler coseno con 30 pasos de warmup y semilla 42. El conjunto de evaluación arroja una pérdida de validación de 0,0334 en la época 3 y métricas de accuracy 0,9944, F1 0,9888, precisión 0,9778 y recall 1,0. El número total de pasos (153) implica un dataset de entrenamiento de aproximadamente 1.600 ejemplos, lo que explica el sobreajuste potencial y la rapidez del entrenamiento. No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales.

## Capacidades

- Clasificación de texto: el modelo está configurado para emitir etiquetas de clase, no texto generativo, a pesar de derivar de un modelo de lenguaje.
- Razonamiento y generación de texto: capacidades latentes del modelo base Qwen2.5-1.5B, pero no accesibles directamente a través de la cabeza de clasificación.
- Soporte de tool calling / function calling: no disponible en esta configuración.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; el modelo base Qwen2.5 soporta varios idiomas, pero no se confirma para este ajuste.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Compatibilidad con `text-embeddings-inference` y endpoints de Hugging Face: sí, según los tags del repositorio.

## Casos de uso

- Clasificación de documentos en pipelines de ingestión: el modelo puede etiquetar documentos entrantes en categorías predefinidas antes de indexarlos en un sistema RAG, aprovechando su tamaño reducido para procesar lotes grandes con latencia baja.
- Moderación de contenido: como clasificador binario (tóxico/no tóxico) o multiclase, puede integrarse en un servicio de moderación previo a la publicación de comentarios, con la advertencia de que el dataset de entrenamiento no está documentado.
- Enrutamiento de tickets de soporte: clasificar consultas de clientes en categorías (facturación, técnico, comercial) para dirigirlas al equipo adecuado, usando la cabeza de clasificación sobre el texto del ticket.
- Detección de spam o phishing en correos: el modelo puede ajustarse adicionalmente o usarse tal cual si la tarea de clasificación original coincide con esta necesidad, con validación previa sobre un conjunto propio.
- Clasificación de sentimiento en reseñas: si el dataset original era de análisis de sentimiento, el modelo puede desplegarse en un endpoint de Hugging Face para puntuar reseñas de producto en tiempo real.
- Filtrado de datos para entrenamiento: usar el clasificador para descartar ejemplos de baja calidad o fuera de dominio antes de incluirlos en un corpus de preentrenamiento o fine-tuning.
- Etiquetado asistido en anotación humana: pre-etiquetar grandes volúmenes de texto para que los anotadores solo revisen y corrijan, reduciendo el coste de anotación.

## Benchmarks y rendimiento

Los únicos datos disponibles son las métricas de evaluación declaradas por el autor en la model card, correspondientes al conjunto de evaluación del ajuste fino (no a benchmarks estándar como MMLU o HumanEval):

| Metrica | Epoca 1 | Epoca 2 | Epoca 3 |
|---|---|---|---|
| Validation loss | 0,0629 | 0,0419 | 0,0334 |
| Accuracy | 0,9888 | 0,9944 | 0,9944 |
| F1 | 0,9773 | 0,9888 | 0,9888 |
| Precision | 0,9773 | 0,9778 | 0,9778 |
| Recall | 0,9773 | 1,0 | 1,0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El model-index del repositorio está vacío (`results: []`).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para los pesos, más overhead de activaciones y KV cache; en la práctica, unos 4-6 GB para lotes pequeños.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,6 GB para pesos, con un total de 2,5-3,5 GB incluyendo overhead.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,8 GB para pesos, con un total de 1,5-2,5 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090, A10, L4). Para cuantización 4 bits, cabe en GPUs con 4 GB o incluso en CPU.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB y superiores.
- Opciones de despliegue: Transformers con `pipeline("text-classification")`, `text-embeddings-inference`, endpoints de Hugging Face. No se ha publicado GGUF, por lo que llama.cpp y Ollama requerirían conversión manual.
- Latencia y throughput estimados: no disponibles; dependerá del hardware y del tamaño de lote. Para un modelo de 1,5B en una RTX 4090, se espera un throughput de varios cientos de ejemplos por segundo en clasificación, pero no se ha medido oficialmente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| davanstrien/jim_crow_model | 1,54B | No disponible | Clasificación de texto | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B | 1,54B | 32.768 tokens | Generación de texto | Apache 2.0 | Hugging Face |
| distilbert-base-uncased | 66M | 512 tokens | Clasificación de texto | Apache 2.0 | Hugging Face |
| roberta-base | 125M | 512 tokens | Clasificación de texto | MIT | Hugging Face |

Frente a clasificadores encoder-only como DistilBERT o RoBERTa, este modelo es aproximadamente 12-23 veces más grande, lo que implica mayor coste de inferencia sin garantía de mejor rendimiento en tareas de clasificación simples. Su ventaja potencial es la mayor capacidad de representación del decoder y la posibilidad de aprovechar el conocimiento del modelo base, pero la falta de documentación sobre el dataset impide una comparación justa. Frente al modelo base Qwen2.5-1.5B, pierde la capacidad generativa a cambio de una cabeza de clasificación especializada.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica "unknown dataset" y "More information needed" en las secciones de descripción, usos previstos y datos. No es posible saber qué tarea concreta resuelve ni con qué clases.
- Riesgo de sobreajuste: con solo 153 pasos de entrenamiento y un dataset estimado de ~1.600 ejemplos, las métricas de evaluación (accuracy 0,9944) pueden no generalizar a datos reales.
- Sesgos desconocidos: al no documentarse la composición del dataset, no se pueden evaluar sesgos de género, raza, idioma o dominio.
- Riesgo de alucinación: aunque es un clasificador, puede asignar etiquetas con alta confianza a entradas fuera de distribución.
- Limitaciones de idioma: no se especifican los idiomas soportados; el modelo base Qwen2.5 es multilingüe, pero el ajuste fino puede haber reducido el rendimiento a un solo idioma.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la falta de documentación sobre el dataset de entrenamiento podría implicar riesgos legales si este contenía datos con licencias incompatibles.
- Sin benchmarks estándar: no hay resultados en MMLU, HumanEval, GSM8K ni comparaciones con alternativas, lo que impide evaluar su calidad relativa.
- Sin formato GGUF: no se ha publicado una versión cuantizada para llama.cpp u Ollama, lo que limita el despliegue en CPU o GPUs de gama baja sin conversión manual.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en la comunidad ni validación externa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/davanstrien/jim_crow_model)
- [Modelo base Qwen/Qwen2.5-1.5B](https://huggingface.co/Qwen/Qwen2.5-1.5B)
- [Perfil del autor davanstrien](https://huggingface.co/davanstrien)
