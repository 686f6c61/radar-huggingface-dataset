# DavidGomez49/xlmr-ingredient-detection-udea

## Resumen

xlmr-ingredient-detection-udea es un modelo de clasificación de tokens (token classification) obtenido mediante fine-tuning de FacebookAI/xlm-roberta-base, publicado por el usuario DavidGomez49. Su propósito declarado es la detección de ingredientes en texto, una tarea típica de extracción de entidades nombradas (NER) aplicada al dominio alimentario, aunque la model card no documenta el conjunto de datos de entrenamiento ni el esquema de etiquetas utilizado.

El modelo conserva la arquitectura XLM-RoBERTa base, un transformer encoder multilingüe de 277.455.363 parámetros (aproximadamente 278 M), con pesos en formato safetensors y un tamaño de repositorio de 3,4 GB. Se distribuye bajo licencia MIT y es compatible con la librería transformers y con endpoints de Hugging Face, lo que facilita su despliegue mediante pipelines estándar de token-classification.

Su relevancia es acotada: se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicados en la model-index y con una model card generada automáticamente por el Trainer que deja sin documentar secciones clave como los datos de entrenamiento, los usos previstos y las limitaciones. Resulta útil como punto de partida para tareas de extracción de ingredientes, pero requiere validación adicional antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) |
| Parámetros totales | 277.455.363 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa base soporta hasta 512 tokens, no confirmado en la model card) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el modelo base XLM-RoBERTa es multilingüe, pero la model card no lo declara) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de FacebookAI/xlm-roberta-base, un transformer encoder de tipo RoBERTa entrenado de forma multilingüe, y se ha ajustado para la tarea de token classification, lo que implica una cabeza de clasificación sobre las representaciones contextuales del encoder para asignar una etiqueta a cada token. El número de etiquetas y el esquema BIO o similar no se especifican en la información disponible.

El entrenamiento se realizó durante 3 épocas con un learning rate de 5e-05, batch size de 16 (tanto en entrenamiento como en evaluación), semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y precisión mixta nativa (AMP). Se registraron 855 pasos totales (285 por época) y la pérdida de validación descendió de 0,0868 en la primera época a 0,0801 en la tercera. No se documenta el volumen de datos, la composición del dataset, ni si hubo técnicas de alineación como RLHF o DPO, algo esperable en un modelo de este tipo.

## Capacidades

- Clasificación de tokens para detección de ingredientes en texto, presumiblemente mediante etiquetado a nivel de token.
- Extracción de entidades nombradas en el dominio alimentario, aunque el esquema exacto de etiquetas no está documentado.
- Procesamiento de texto multilingüe heredado potencialmente del modelo base XLM-RoBERTa, si bien no se confirma en la model card.
- Integración con el pipeline `token-classification` de transformers.
- Compatibilidad con endpoints de Hugging Face.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Extracción de ingredientes en recetas: el modelo puede etiquetar los tokens correspondientes a ingredientes en textos culinarios, facilitando la construcción de bases de datos estructuradas de recetas a partir de corpus no estructurados.
- Etiquetado de listas de ingredientes en productos alimentarios: útil para procesar descripciones de productos y separar ingredientes de cantidades u otras anotaciones, siempre que el esquema de etiquetas coincida con el usado en el entrenamiento.
- Normalización de catálogos de ingredientes: en un pipeline de datos, el modelo puede servir como primer paso para identificar menciones de ingredientes antes de aplicar reglas de normalización o resolución de entidades.
- Análisis de reseñas gastronómicas: permite detectar qué ingredientes se mencionan en opiniones de usuarios, habilitando análisis de tendencias o estudios de preferencias.
- Preprocesado para sistemas de recomendación culinaria: la extracción de ingredientes puede alimentar motores de recomendación basados en contenido.
- Investigación en NLP aplicado a alimentación: como modelo de referencia para experimentos de NER en dominio alimentario, dado su bajo coste computacional y su licencia permisiva.
- Prototipado rápido en entornos con recursos limitados: al tratarse de un modelo de ~278 M de parámetros, puede ejecutarse en CPU o en GPUs de gama media para pruebas de concepto.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card (conjunto de evaluación no especificado) son los siguientes:

| Métrica | Valor |
|---|---|
| Loss | 0,0801 |
| Precision | 0,7421 |
| Recall | 0,8390 |
| F1 | 0,7876 |
| Accuracy | 0,9827 |

Evolución por época según la model card:

| Época | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|
| 1 | 0,0868 | 0,7009 | 0,8175 | 0,7547 | 0,9789 |
| 2 | 0,0832 | 0,7409 | 0,8336 | 0,7845 | 0,9808 |
| 3 | 0,0801 | 0,7421 | 0,8390 | 0,7876 | 0,9827 |

No se han publicado resultados de benchmarks en la información disponible más allá de estas métricas de validación. La model-index no contiene resultados (`results: []`), por lo que no hay comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,1 GB solo para pesos (277 M × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, alrededor de 1,5-2 GB.
- VRAM estimada en FP16/BF16: aproximadamente 0,55 GB para pesos, con un total práctico de 1-1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque las de gama alta están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más; también puede ejecutarse en CPU con latencias aceptables para lotes pequeños.
- Opciones de despliegue: pipeline de transformers, Text Generation Inference no aplica (es encoder), vLLM no es la opción natural para token classification, llama.cpp/Ollama no soportan directamente este formato; las opciones realistas son transformers, ONNX Runtime o TorchScript.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xlmr-ingredient-detection-udea | 277 M | no disponible | Token classification (ingredientes) | MIT | Hugging Face |
| FacebookAI/xlm-roberta-base | 278 M | 512 tokens | Modelo base multilingüe | MIT | Hugging Face |
| Davlan/xlm-roberta-base-ner-hrl | ~278 M | 512 tokens | NER multilingüe | MIT | Hugging Face |
| dslim/bert-base-NER | ~110 M | 512 tokens | NER en inglés | MIT | Hugging Face |

La comparación se limita a modelos de la misma familia y tarea, ya que no se dispone de benchmarks del modelo evaluado frente a alternativas. xlm-roberta-base es el punto de partida y no está especializado; los modelos NER genéricos cubren entidades generales (persona, organización, lugar) pero no ingredientes. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- La model card indica explícitamente "More information needed" en las secciones de descripción, usos previstos, limitaciones y datos de entrenamiento, por lo que se desconoce el dominio exacto, el esquema de etiquetas y la distribución de los datos.
- El conjunto de evaluación no está identificado, de modo que las métricas reportadas (F1 0,7876, accuracy 0,9827) no son reproducibles ni comparables de forma fiable.
- La accuracy de 0,9827 puede ser engañosa en tareas de token classification con desbalanceo de clases (la clase mayoritaria suele ser "O", fuera de entidad); conviene fijarse en el F1 y en el recall por clase.
- El recall (0,8390) es superior a la precisión (0,7421), lo que sugiere una tendencia a sobre-detectar entidades; en producción puede generar falsos positivos.
- No se documentan sesgos conocidos, pero al derivar de XLM-RoBERTa base hereda los sesgos de sus datos de preentrenamiento, no auditados en esta ficha.
- Riesgo de alucinación no aplicable en el sentido generativo (es un encoder de clasificación), pero sí riesgo de etiquetados incorrectos en dominios distintos al de entrenamiento.
- Los idiomas soportados no están declarados; aunque el modelo base es multilingüe, el fine-tuning puede haber reducido el rendimiento a un único idioma no especificado.
- La licencia MIT permite uso comercial, pero al no documentarse los datos de entrenamiento no puede garantizarse la ausencia de restricciones derivadas de los mismos.
- El modelo tiene cero descargas y cero likes, sin validación comunitaria; no se recomienda su uso en producción sin una evaluación propia sobre datos representativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidGomez49/xlmr-ingredient-detection-udea
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper de XLM-RoBERTa (Unsupervised Cross-lingual Representation Learning at Scale): https://arxiv.org/abs/1911.02116
- Documentación de token classification en transformers: https://huggingface.co/docs/transformers/tasks/token_classification
