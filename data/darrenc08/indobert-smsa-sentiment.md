# DarrenC08/indobert-smsa-sentiment

## Resumen

`DarrenC08/indobert-smsa-sentiment` es un modelo de clasificación de sentimiento en indonesio obtenido mediante fine-tuning de `indobenchmark/indobert-base-p1`, un BERT base preentrenado específicamente para ese idioma. El ajuste se ha realizado sobre el corpus SmSA (Sentiment Analysis) del benchmark IndoNLU, con tres clases de salida: negativo, neutro y positivo. El modelo resuelve la tarea de analizar opiniones y reseñas en bahasa indonesio, un nicho con pocos recursos abiertos de calidad en comparación con el inglés.

Se trata de un encoder transformer de 124,4 millones de parámetros (aproximadamente 0,5 GB en safetensors), con una ventana de contexto heredada del BERT base original. Su relevancia radica en que ofrece un punto de partida funcional y con licencia MIT para proyectos de análisis de opiniones en indonesio, un mercado digital de más de 200 millones de hablantes, y en que reporta métricas competitivas frente a una línea base clásica de TF-IDF más regresión logística.

El modelo es de publicación reciente (noviembre de 2026), con cero descargas y cero likes en el momento de la ficha, lo que implica que no ha sido validado por la comunidad. No obstante, la model card documenta el proceso de entrenamiento y los resultados en el split de test de SmSA, lo que permite una evaluación inicial razonable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (IndoBERT base p1) |
| Parametros totales | 124.443.651 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (max_length de entrenamiento); contexto nativo del BERT base: 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion dinamica via PyTorch/ONNX, no documentada por el autor) |
| Idiomas soportados | indonesio (id) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `indobenchmark/indobert-base-p1`, un BERT base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención) preentrenado sobre corpus indonesios. La cabeza de clasificación se ha ajustado para tres clases de sentimiento. El entrenamiento se realizó sobre el split de entrenamiento de SmSA (11.000 ejemplos), seleccionando el mejor checkpoint según macro-F1 en un split de validación de 1.260 ejemplos. Los hiperparámetros documentados son: 5 épocas, learning rate 2e-5, batch size 16, longitud máxima 128 tokens, semilla 42, optimizador AdamW con schedule lineal y warmup del 10%, y precisión mixta fp16.

No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales, algo esperable en un modelo de clasificación. Tampoco se detalla la composición exacta del corpus de preentrenamiento de IndoBERT (más allá de lo publicado por IndoBenchmark) ni si hubo aumento de datos o balanceo de clases, lo que resulta relevante porque la clase neutra obtiene un recall notablemente inferior.

## Capacidades

- Clasificación de sentimiento en tres clases (negativo, neutro, positivo) para texto en indonesio.
- Procesamiento de reseñas y opiniones de dominio general (productos, servicios, redes sociales), según el dominio cubierto por SmSA.
- Inferencia por lotes mediante `transformers.pipeline` y compatibilidad con Text Embeddings Inference y endpoints compatibles.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo "thinking", visión, audio ni generación de texto libre.
- Capacidad multilingüe limitada al indonesio; no se ha entrenado ni evaluado en otros idiomas.

## Casos de uso

- Análisis de reseñas de comercio electrónico: clasificar automáticamente opiniones de productos en indonesio para agregar puntuaciones de satisfacción por vendedor o categoría. El modelo está entrenado precisamente sobre SmSA, un corpus de reseñas, por lo que el dominio se alinea bien.
- Monitorización de reputación en redes sociales: procesar menciones y comentarios en indonesio y etiquetarlos como positivos, neutros o negativos para paneles de alerta temprana. La ventana de 128 tokens cubre la mayoría de publicaciones cortas.
- Enrutamiento de tickets de soporte: usar la etiqueta de sentimiento para priorizar quejas negativas en un sistema de atención al cliente en indonesio, combinándolo con un clasificador de intención posterior.
- Análisis de encuestas NPS y formularios abiertos: agregar respuestas de texto libre en indonesio y calcular la distribución de sentimiento por segmento de cliente.
- Filtrado de contenido y moderación asistida: detectar opiniones negativas persistentes o campañas de quejas coordinadas en foros y marketplaces indonesios.
- Investigación en PLN de bajos recursos: servir como línea base reproducible (licencia MIT, pesos abiertos, hiperparámetros documentados) para comparar nuevas técnicas de clasificación de sentimiento en indonesio.
- Enriquecimiento de datasets: etiquetar grandes volúmenes de texto indonesio no anotado para preentrenar o ajustar otros modelos, dado el bajo coste de inferencia de un encoder de 124 M de parámetros.

## Benchmarks y rendimiento

Resultados reportados por el autor en el split de test de SmSA (500 ejemplos):

| Modelo | Accuracy | Macro-F1 |
|---|---|---|
| TF-IDF + regresión logística (línea base) | 80,4% | 75,9% |
| **Este modelo** | **91,4%** | **88,6%** |

Desglose por clase de este modelo:

| Clase | Precision | Recall | F1 |
|---|---|---|---|
| negative | 0,910 | 0,985 | 0,946 |
| neutral | 0,897 | 0,693 | 0,782 |
| positive | 0,924 | 0,938 | 0,931 |

No se han publicado resultados comparativos con otros modelos transformer en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos más activaciones; en la práctica, menos de 1 GB para lotes pequeños.
- VRAM estimada en fp16: alrededor de 0,25 GB de pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, T4, L4). Para alto throughput, A10G, L4 o A100.
- Cabe en GPU consumer: sí, en todas las GPU modernas, incluidas las integradas con suficiente memoria compartida para lotes pequeños.
- CPU: viable para inferencia en tiempo real con lotes pequeños; el modelo es lo bastante pequeño para despliegues sin GPU.
- Opciones de despliegue: `transformers` (PyTorch), Text Embeddings Inference (TEI), ONNX Runtime, y servidores compatibles con la API de `transformers`. No se documenta soporte explícito de vLLM, llama.cpp u Ollama (son herramientas orientadas a modelos generativos; llama.cpp podría convertirlo a GGUF, pero no está documentado por el autor).
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia orientativa de la clase de modelo (BERT base, 124 M de parámetros), en una GPU moderna se esperan latencias de milisegundos por secuencia y throughput de miles de secuencias por segundo con lotes grandes, pero no hay medición publicada para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Este modelo** | 124,4 M | 128 (entrenamiento) / 512 (nativo) | Clasificación de sentimiento (3 clases) en indonesio | MIT | Hugging Face, 0 descargas |
| `indobenchmark/indobert-base-p1` | ~124 M | 512 | Modelo base (MLM), sin cabeza de clasificación | MIT (según IndoBenchmark) | Hugging Face, ampliamente usado |
| `indobenchmark/indobert-lite-base-p1` | ~124 M (lite) | 512 | Modelo base indonesio | MIT | Hugging Face |
| `mdhugol/indonesia-bert-sentiment-classification` | ~124 M | 512 | Clasificación de sentimiento en indonesio | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Clase neutra con recall bajo (0,693): el modelo tiende a clasificar ejemplos neutros como positivos o negativos, lo que afecta a la macro-F1 (88,6% frente a 91,4% de accuracy). En producción conviene calibrar umbrales o revisar manualmente la clase neutra.
- Ventana de entrenamiento de 128 tokens: los textos más largos se truncan, lo que puede perder información relevante en reseñas extensas.
- Dominio limitado a reseñas: aunque SmSA cubre reseñas de productos, el rendimiento en otros géneros (noticias, literatura, jerga de redes sociales) no está evaluado y puede degradarse.
- Sesgos desconocidos: no se documenta ningún análisis de sesgos demográficos, geográficos o de dominio. El corpus de preentrenamiento de IndoBERT puede introducir sesgos propios del corpus indonesio utilizado.
- Riesgo de alucinación: no aplica en el sentido generativo (es un clasificador), pero sí existe riesgo de etiquetas erróneas confiadas, especialmente en textos ambiguos o irónicos.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el modelo base `indobenchmark/indobert-base-p1` debe verificarse igualmente en su propia licencia antes de un despliegue comercial.
- Sin validación comunitaria: cero descargas y cero likes en el momento de la ficha; no hay evidencia independiente de reproducibilidad de los resultados reportados.
- Model card con placeholder `USERNAME` en el ejemplo de código: el identificador real del repositorio es `DarrenC08/indobert-smsa-sentiment`, no el que aparece en el snippet.
- Fecha de creación en 2026: verificar que el checkpoint y los datos de entrenamiento están disponibles y son los que se describen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DarrenC08/indobert-smsa-sentiment
- Modelo base: https://huggingface.co/indobenchmark/indobert-base-p1
- Dataset IndoNLU (incluye SmSA): https://huggingface.co/datasets/indonlp/indonlu
- Repositorio IndoNLU: https://github.com/indobenchmark/indonlu
- Paper IndoNLU (arXiv): https://arxiv.org/abs/2009.05332
- Paper IndoBERT (arXiv): https://arxiv.org/abs/2009.05332 (misma publicación que IndoNLU)
