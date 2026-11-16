# jinxxx123/financial_sentiment_analysis

## Resumen

financial_sentiment_analysis es un modelo de clasificación de texto obtenido mediante fine-tuning supervisado de roberta-base sobre un corpus de análisis de sentimiento financiero. Lo publica el usuario jinxxx123 en Hugging Face bajo licencia MIT, con un total de 124.647.939 parámetros y un tamaño de repositorio de 0,5 GB. El modelo resuelve una tarea acotada: asignar una etiqueta de sentimiento a fragmentos de texto del dominio financiero, no generar texto libre.

El modelo parte de la arquitectura RoBERTa base, un transformer encoder de 12 capas y 768 dimensiones ocultas. El autor declara una precisión de 0,8178 y una pérdida de validación de 0,3934 sobre el conjunto de evaluación, tras dos épocas de entrenamiento con learning rate 2e-05 y AdamW fused. La model card no documenta la composición del dataset de entrenamiento ni las etiquetas exactas del clasificador, lo que limita la reproducibilidad y obliga a validar el modelo contra datos propios antes de usarlo en producción.

Su relevancia práctica es la de un baseline ligero y desplegable en CPU para tareas de extracción de señal en noticias, informes y comunicados financieros, con la ventaja de un coste de inferencia muy bajo frente a modelos generativos de gran tamaño. No obstante, la ausencia de benchmarks publicados, de documentación sobre el dataset y de una evaluación por clases hace que deba tratarse como un punto de partida experimental más que como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa base, 12 capas, 768 dimensiones ocultas) |
| Parámetros totales | 124.647.939 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (roberta-base admite hasta 512 tokens posicionales) |
| Tipos de cuantización | no disponible (compatible con cuantización dinámica de PyTorch y con text-embeddings-inference) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de FacebookAI/roberta-base para clasificación de secuencias (pipeline text-classification). RoBERTa es un transformer encoder bidireccional derivado de BERT, entrenado originalmente con enmascaramiento dinámico y sin la tarea de predicción de siguiente frase; el checkpoint base se ha reentrenado aquí con una cabeza de clasificación sobre un dataset no especificado (la model card indica literalmente "None dataset").

Los hiperparámetros documentados son: learning rate 2e-05, batch de entrenamiento y evaluación de 16, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y 2 épocas completas (586 pasos totales, 293 por época). Se registran dos puntos de evaluación: en la época 1, pérdida de validación 0,3844 y precisión 0,8169; en la época 2, pérdida 0,3934 y precisión 0,8178. El entrenamiento se realizó con Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. No se documenta el número de tokens de entrenamiento, la composición del corpus, el número de clases ni si hubo aumento de datos o validación cruzada.

## Capacidades

- Clasificación de texto: asigna una etiqueta de sentimiento a una secuencia de entrada mediante la cabeza de clasificación fine-tuned.
- Análisis de sentimiento en dominio financiero: el nombre y el propósito declarado apuntan a textos de noticias, informes o comunicados económicos, aunque el dataset no está documentado.
- Procesamiento de secuencias de hasta 512 tokens, límite posicional de roberta-base.
- Inferencia por lotes con la API de transformers (pipeline text-classification) y compatibilidad con text-embeddings-inference y endpoints compatibles.
- No dispone de generación de texto, tool calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.
- El soporte multilingüe no está declarado; roberta-base se entrenó principalmente en inglés.

## Casos de uso

- Monitorización de titulares financieros: clasificar en tiempo real titulares de prensa económica y agregar la señal de sentimiento por sector o por valor, aprovechando el bajo coste de inferencia del modelo en CPU.
- Filtrado previo en pipelines de análisis: usar el clasificador como primera etapa para descartar o priorizar documentos antes de pasarlos a un modelo generativo de mayor tamaño, reduciendo coste por documento.
- Análisis de comunicados de resultados: procesar párrafos de notas de prensa corporativas y etiquetar su tono para alimentar paneles de seguimiento de emisores.
- Enriquecimiento de datasets de investigación: etiquetar grandes volúmenes de texto financiero no anotado para construir corpus de entrenamiento o de evaluación de modelos mayores.
- Alertas de riesgo reputacional: detectar fragmentos con sentimiento negativo en noticias sobre una compañía y disparar revisiones manuales o avisos automatizados.
- Prototipado rápido en entornos con recursos limitados: desplegar el modelo en una instancia CPU o en una GPU de gama baja para validar una idea de producto de análisis de sentimiento antes de invertir en modelos mayores.
- Clasificación por lotes en investigación académica: obtener etiquetas de referencia sobre corpus financieros históricos con un modelo de 124 millones de parámetros y licencia permisiva.

## Benchmarks y rendimiento

La model card declara los siguientes resultados sobre el conjunto de evaluación del autor. No se han publicado resultados en el model-index ni comparaciones con otros modelos.

| Métrica | Época 1 (paso 293) | Época 2 (paso 586) |
|---|---|---|
| Pérdida de validación | 0,3844 | 0,3934 |
| Precisión (accuracy) | 0,8169 | 0,8178 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, GLUE, Financial PhraseBank) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos; en fp16, unos 0,25 GB. Con overhead de activaciones y batch pequeño, menos de 2 GB en la mayoría de configuraciones.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con suficiente memoria compartida.
- Funciona en CPU con latencias de milisegundos por secuencia corta, lo que lo hace apto para despliegues sin GPU.
- Opciones de despliegue: transformers (pipeline), text-embeddings-inference, endpoints compatibles, y exportación a ONNX para optimización en CPU.
- Throughput y latencia concretos: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| financial_sentiment_analysis | 124,6 M | 512 tokens (límite de roberta-base) | Clasificación de sentimiento financiero | MIT | Hugging Face |
| roberta-base (base) | 124,6 M | 512 tokens | Modelo base, sin cabeza de clasificación | MIT | Hugging Face |
| FinBERT | no disponible en la información | no disponible | Clasificación de sentimiento financiero | no disponible | Hugging Face |
| Modelos generativos de gran tamaño (p. ej. Mistral Large 2, 123B) | 123 000 M | no disponible | Generación y análisis financiero general | no disponible | no disponible |

La comparación con FinBERT y con modelos generativos se ofrece solo como referencia de categoría; no se dispone de datos de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta el dataset de entrenamiento, las etiquetas ni el proceso de anotación; la reproducibilidad es nula.
- No se especifican sesgos conocidos, pero al entrenarse sobre un corpus no documentado puede heredar sesgos de dominio, de fuente o de periodo temporal.
- Riesgo de alucinación no aplicable en sentido estricto (no genera texto), pero sí riesgo de clasificaciones erróneas en textos ambiguos, irónicos o fuera de dominio.
- El límite de 512 tokens impide procesar documentos largos sin truncado o segmentación previa.
- El soporte de idiomas no está declarado; es probable que el rendimiento en castellano sea inferior al de inglés, dado el origen de roberta-base.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el modelo con datos propios y por clase antes de integrarlo en producción.
- No hay métricas por clase (precisión, recall, F1) ni matriz de confusión, por lo que se desconoce el comportamiento en clases minoritarias.
- El modelo fue creado y actualizado en noviembre de 2026 según los metadatos; verificar la vigencia de los artefactos antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jinxxx123/financial_sentiment_analysis
- Modelo base: https://huggingface.co/roberta-base
- Referencia de evaluación de LLM en informes financieros (arXiv): https://arxiv.org/html/2411.06852v1
