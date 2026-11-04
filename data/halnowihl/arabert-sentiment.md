# halnowihl/arabert-sentiment

## Resumen

`halnowihl/arabert-sentiment` es un modelo de clasificación de texto en árabe obtenido mediante fine-tuning supervisado de `UBC-NLP/MARBERTv2`, un encoder BERT de tipo transformer entrenado específicamente para árabe por el grupo UBC-NLP. El autor del ajuste es el usuario de HuggingFace `halnowihl`, y el modelo se publicó el 4 de noviembre de 2026. Su propósito declarado es el análisis de sentimiento, aunque la model card no especifica el conjunto de datos utilizado ni el esquema exacto de etiquetas.

Arquitectónicamente es un BERT base con 162.843.651 parámetros totales (aproximadamente 163 M), almacenado en formato safetensors con un tamaño de repositorio de 0,7 GB. No incorpora cabecera de generación ni capacidades multimodales: es un clasificador de secuencias puro, pensado para inferencia de bajo coste y despliegue sencillo mediante `transformers` o Text Embeddings Inference.

La relevancia del modelo es limitada pero concreta: proporciona un punto de partida funcional para tareas de sentimiento en árabe sobre una base robusta como MARBERTv2, con métricas de validación reportadas (accuracy 0,7716, F1 0,7733) y un coste computacional muy bajo. No obstante, la ausencia de documentación sobre datos, etiquetas e idiomas, junto con la falta de licencia declarada, lo sitúan como un artefacto experimental más que como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), fine-tuning de `UBC-NLP/MARBERTv2` |
| Parámetros totales | 162.843.651 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de MARBERTv2; no declarada en la model card) |
| Tipos de cuantización | no disponible (compatible con cuantización estándar de `transformers`: int8, fp16, bf16) |
| Idiomas soportados | no disponible (el modelo base es específico para árabe) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Tamaño del repositorio | 0,7 GB |
| Librería | transformers |
| Fecha de creación | 2026-11-04 |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo BERT, inicializado desde `UBC-NLP/MARBERTv2` y ajustado con la clase `Trainer` de `transformers` para clasificación de secuencias. MARBERTv2 es un modelo preentrenado por UBC-NLP sobre grandes volúmenes de texto árabe (dialectal y estándar moderno), por lo que el backbone aporta representaciones específicas del dominio árabe que un BERT multilingüe genérico no captura con la misma precisión.

El entrenamiento se realizó durante 3 épocas con AdamW fused (betas 0,9/0,999, epsilon 1e-8), learning rate 2e-5, scheduler lineal, batch de entrenamiento de 16 y batch de evaluación de 32, con semilla 42. El conjunto de datos no se especifica ("unknown dataset" según la model card). La pérdida de validación aumentó de 0,7029 en la época 1 a 0,8135 en la época 3, mientras que la accuracy subió de 0,7253 a 0,7716, lo que sugiere cierto sobreajuste a partir de la segunda época. No se documenta RLHF, DPO ni ninguna innovación técnica adicional; es un fine-tuning supervisado convencional. Las versiones de framework declaradas son Transformers 5.22.0, PyTorch 2.11.0+cpu, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de texto: asigna una etiqueta a una secuencia de entrada, orientada a análisis de sentimiento.
- Procesamiento de árabe: el backbone MARBERTv2 está especializado en texto árabe, incluyendo variantes dialectales.
- Inferencia de bajo coste: 163 M de parámetros permiten ejecución en CPU y GPU de gama baja.
- Compatibilidad con el pipeline `text-classification` de `transformers` y con Text Embeddings Inference (endpoints compatibles).
- Extracción de representaciones: al ser un encoder BERT, puede utilizarse como extractor de embeddings contextuales descongelando o usando las capas ocultas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto libre, visión ni audio.
- No dispone de modo de razonamiento (thinking mode) ni de decodificación especulativa.

## Casos de uso

- Análisis de sentimiento en redes sociales árabes: el modelo puede clasificar publicaciones y comentarios en árabe dialectal gracias a la base MARBERTv2, que fue preentrenada con texto dialectal; útil para monitorización de marca.
- Moderación de comentarios: clasificación automática de reseñas o comentarios de usuarios en plataformas árabes para priorizar revisiones humanas según polaridad.
- Enriquecimiento de datasets: etiquetado de grandes volúmenes de texto árabe no anotado para construir corpus de sentimiento, dado el bajo coste por inferencia del modelo.
- Análisis de opinión en atención al cliente: procesamiento por lotes de transcripciones o tickets en árabe para detectar insatisfacción y enrutar casos críticos.
- Investigación en NLP árabe: punto de comparación o baseline en experimentos de clasificación de sentimiento sobre MARBERTv2, con métricas de validación reproducibles.
- Despliegue en entornos con recursos limitados: servicio de clasificación en CPU o en GPUs consumer para aplicaciones internas con requisitos de latencia moderados.
- Filtrado de reseñas de producto: clasificación de reseñas en comercio electrónico en árabe para agregar valoraciones y detectar spam o toxicidad.

## Benchmarks y rendimiento

La model card declara métricas de validación, pero el `model-index` no contiene resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.). Los únicos datos disponibles son los de validación interna:

| Métrica | Valor en validación |
|---|---|
| Loss | 0,8135 |
| Accuracy | 0,7716 |
| Precision | 0,7759 |
| Recall | 0,7716 |
| F1 | 0,7733 |

Evolución por época:

| Época | Training loss | Validation loss | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|---|---|
| 1 | 0,3882 | 0,7029 | 0,7253 | 0,7279 | 0,7253 | 0,7125 |
| 2 | 0,2303 | 0,7537 | 0,7500 | 0,7473 | 0,7500 | 0,7480 |
| 3 | 0,1015 | 0,8135 | 0,7716 | 0,7759 | 0,7716 | 0,7733 |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,65 GB en fp32 (163 M de parámetros), unos 0,33 GB en fp16/bf16 y alrededor de 0,17 GB en int8. El repositorio ocupa 0,7 GB en disco.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona sin problema en RTX 3060, RTX 4060, RTX 4090, A100 y H100. El modelo es lo bastante pequeño como para no necesitar GPUs de datacenter.
- Cabe holgadamente en GPUs consumer e incluso en CPU: la model card indica entrenamiento con PyTorch 2.11.0+cpu, lo que confirma viabilidad en CPU.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), Text Embeddings Inference (el tag `text-embeddings-inference` y `endpoints_compatible` lo indican), y servidores compatibles con la API de inferencia. Para cuantización se puede usar `bitsandbytes` o exportación a ONNX.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño, se espera throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `halnowihl/arabert-sentiment` | 162,8 M | no disponible | Clasificación de sentimiento (árabe) | no disponible | HuggingFace |
| `UBC-NLP/MARBERTv2` | ~163 M (BERT base) | no disponible | Modelo base preentrenado en árabe | no disponible en la información | HuggingFace |
| `aubmindlab/bert-base-arabertv02` | ~136 M | no disponible | Modelo base preentrenado en árabe | no disponible en la información | HuggingFace |

La comparación se limita a modelos base de la misma familia (BERT para árabe), ya que no se dispone de datos de otros clasificadores de sentimiento árabes ajustados con métricas comparables en la información proporcionada. No se dispone de benchmarks comunes para establecer una comparación de rendimiento objetiva.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica explícitamente "unknown dataset", por lo que no se puede verificar la calidad, el dominio ni el equilibrio de las etiquetas.
- Esquema de etiquetas no documentado: no se especifica si es binario (positivo/negativo) o multiclase, ni el orden de las etiquetas, lo que impide un uso fiable sin inspección previa de `config.json`.
- Licencia no disponible: no se declara licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de usarlo en producción.
- Idiomas no declarados: aunque el modelo base es árabe, la model card no confirma los idiomas soportados ni el rendimiento fuera del árabe.
- Sobreajuste probable: la pérdida de validación aumenta en la época 3 mientras la accuracy sube, lo que sugiere que el modelo puede no generalizar bien fuera del conjunto de validación.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede producir etiquetas erróneas con alta confianza en dominios distintos al de entrenamiento.
- Sesgos: no documentados; al entrenarse sobre un dataset desconocido, pueden existir sesgos de dominio, dialecto o desbalance de clases no cuantificados.
- Sin métricas de benchmarks estándar: no hay resultados en MMLU, HumanEval ni similares, y el `model-index` está vacío.
- Modelo con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validación externa.
- Longitud de contexto no declarada: debe consultarse la configuración de MARBERTv2 para conocer el máximo de tokens; no se garantiza en la ficha.

## Enlaces

- HuggingFace: https://huggingface.co/halnowihl/arabert-sentiment
- Modelo base: https://huggingface.co/UBC-NLP/MARBERTv2
- Repositorio MARBERTv2 de UBC-NLP: no disponible en la información proporcionada
- Paper de MARBERT: no disponible en la información proporcionada
- Demos o espacios: no disponibles en la información proporcionada
