# appcle/distilbert-base-uncased-cfpd

## Resumen
`appcle/distilbert-base-uncased-cfpd` es un modelo de clasificación de texto (text-classification) creado mediante fine-tuning del modelo base DistilBERT, concretamente la versión `distilbert-base-uncased`. El autor, `appcle`, ha entrenado este modelo sobre un conjunto de datos no especificado, lo que limita la interpretabilidad de sus capacidades. Aunque el nombre del repositorio incluye la sigla "CFPD", no se proporciona información adicional sobre el dataset ni la tarea concreta (análisis de sentimiento, detección de spam, clasificación temática, etc.).

El modelo conserva la arquitectura original de DistilBERT, un transformer destilado de BERT base con aproximadamente 66,96 millones de parámetros y una longitud de contexto de 512 tokens. Está publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y los pesos están disponibles en formato `safetensors`. Al ser un modelo de tamaño compacto, es adecuado para entornos con recursos limitados, aunque su utilidad real depende del dataset de entrenamiento, que no se ha documentado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder) |
| Parámetros totales | 66.958.855 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (base del modelo) |
| Tipos de cuantización | No disponible (solo pesos en `safetensors` sin cuantización publicada) |
| Idiomas soportados | No disponible (el modelo base es inglés, pero no se especifica el idioma del fine-tuning) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` |

## Arquitectura y entrenamiento
El modelo es un fine-tuning de DistilBERT, un transformer encoder destilado de BERT mediante destilación de conocimiento. DistilBERT utiliza una arquitectura de 6 capas, 768 dimensiones de entrada y 12 cabezas de atención, y fue preentrenado con tres objetivos: pérdida de destilación para replicar las probabilidades del maestro, masked language modeling (MLM) y pérdida de coseno para alinear las representaciones ocultas con las del modelo base.

En este caso, el fine-tuning se realizó sobre un dataset no identificado. Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 5e-05, tamaño de lote de 16 (entrenamiento) y 8 (evaluación), optimizador AdamW con parámetros beta (0.9, 0.999) y epsilon 1e-08, scheduler lineal y 4 épocas. El proceso se ejecutó con el `Trainer` de Hugging Face, utilizando PyTorch 2.11.0 y Transformers 5.15.0. No se mencionan técnicas adicionales como RLHF, DPO ni decodificación especulativa.

## Capacidades
- Clasificación de texto de secuencias cortas (hasta 512 tokens), típica de tareas como análisis de sentimiento, categorización de documentos o detección de contenido.
- Inferencia rápida gracias a la arquitectura destilada, adecuada para entornos con restricciones de latencia.
- Compatibilidad con el ecosistema Hugging Face: se puede cargar con `AutoModelForSequenceClassification` y usar en pipelines de clasificación.
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso, visión o audio. Es un modelo puramente de clasificación textual.
- El idioma de entrenamiento no está especificado; se asume inglés por el modelo base, pero no hay garantía para otros idiomas.

## Casos de uso
- **Clasificación de textos en producción**: al ser un modelo compacto (66,9 M parámetros) y con licencia Apache 2.0, es adecuado para integrarse en APIs de clasificación de contenido (por ejemplo, moderación de comentarios, categorización de artículos) con baja latencia y coste de infraestructura.
- **Análisis de sentimiento en redes sociales**: si el dataset de fine-tuning incluye textos de opinión, el modelo puede usarse para clasificar tuits, reseñas o comentarios en categorías de sentimiento (positivo/negativo/neutro), aunque esta capacidad no está confirmada.
- **Clasificación de tickets de soporte**: se puede adaptar para categorizar correos o mensajes en departamentos o prioridades, aprovechando su capacidad de manejar secuencias de hasta 512 tokens.
- **Detección de spam o contenido no deseado**: en escenarios de filtrado de mensajes, el modelo podría clasificar textos como spam o legítimo, aunque la falta de documentación del dataset hace necesario validar previamente el rendimiento.
- **Integración en pipelines de procesamiento de texto**: al ser un clasificador ligero, puede ejecutarse en CPU o en GPUs de gama baja, permitiendo su uso en entornos Edge o en servicios serverless.
- **Modelo de referencia para experimentación**: dado que el autor no ha publicado el dataset, el modelo puede servir como punto de partida para evaluar técnicas de fine-tuning sobre DistilBERT o como baseline en tareas de clasificación.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks externos (MMLU, HumanEval, etc.) en la información disponible. Sin embargo, el autor declaró en la model card las métricas de evaluación obtenidas durante el entrenamiento:

| Métrica | Valor |
|---|---|
| Pérdida (loss) | 0.6341 |
| Exactitud (accuracy) | 0.8268 |
| Precisión (precision) | 0.8077 |
| Recall | 0.8055 |
| F1 | 0.8065 |
| F1 ponderada (weighted F1) | 0.8269 |

Estos valores corresponden al conjunto de evaluación usado por el Trainer y no deben compararse directamente con benchmarks estándar. La evolución por época muestra que el mejor resultado en exactitud se obtuvo en la época 2 (0.8327), con una ligera degradación posterior.

## Requisitos de hardware
- **VRAM estimada**: con 66,9 M parámetros, en FP32 el modelo ocupa aproximadamente 268 MB; en FP16 se reduce a ~134 MB. Con cuantización int8 (no publicada, pero posible) podría bajar a ~67 MB.
- **GPUs recomendadas**: cualquier GPU consumer con al menos 1 GB de VRAM es suficiente. Modelos como RTX 2060, RTX 3060 o inferiores pueden ejecutarlo sin problemas. También puede correr en CPU.
- **Despliegue**: compatible con `transformers` (pipeline `text-classification`), así como con servidores de inferencia como vLLM, TGI o `text-embeddings-inference` (indicado en los tags de Hugging Face). No se ha publicado compatibilidad con GGUF/llama.cpp.
- **Latencia**: al ser un modelo destilado, la latencia es baja (típicamente <10 ms por secuencia en GPU moderna), aunque depende del hardware y de la longitud de entrada.

## Comparativa con modelos similares
La siguiente comparación se basa en información pública de los modelos base, no del fine-tuning específico:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `appcle/distilbert-base-uncased-cfpd` | 66,96 M | 512 | Apache 2.0 | safetensors | Fine-tuning desconocido |
| `distilbert/distilbert-base-uncased` | 66,96 M | 512 | Apache 2.0 | safetensors | Modelo base destilado de BERT |
| `bert-base-uncased` | 109,5 M | 512 | Apache 2.0 | safetensors | Modelo original de BERT, más grande y lento |

No se dispone de métricas comparativas en el mismo dataset, por lo que no se puede valorar el rendimiento relativo. La ventaja del fine-tuning es que está adaptado a una tarea específica, pero al desconocer el dataset no se puede afirmar superioridad sobre el base.

## Limitaciones y advertencias
- El dataset de entrenamiento no está documentado, lo que impide conocer el dominio de aplicación, los idiomas soportados o los sesgos potenciales. No se puede garantizar el rendimiento en textos fuera del dominio de entrenamiento.
- No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.), por lo que la evaluación queda limitada a las métricas internas del Trainer.
- Riesgo de alucinación: como modelo de clasificación, no genera texto libre, pero puede producir clasificaciones erróneas con alta confianza si la entrada está fuera de distribución.
- Sesgos: al estar basado en DistilBERT, hereda los sesgos del corpus de preentrenamiento (principalmente inglés generalista). No se ha realizado ninguna mitigación adicional documentada.
- No hay información sobre el tipo de etiquetas (binario, multiclase) ni el número de clases, lo que limita su integración directa en sistemas existentes.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda validar el rendimiento en tu caso de uso concreto antes de desplegarlo en producción.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/appcle/distilbert-base-uncased-cfpd)
- [Modelo base: distilbert-base-uncased](https://huggingface.co/distilbert/distilbert-base-uncased)
- [Documentación de DistilBERT en Transformers](https://huggingface.co/docs/transformers/model_doc/distilbert)
- [Artículo original de DistilBERT (paper)](https://arxiv.org/abs/1910.01108)
- [Catálogo de modelos de Microsoft Foundry](https://ai.azure.com/catalog/models/distilbert-base-uncased)
