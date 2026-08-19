# Alex88Alex/learn_hf_food_not_food_text_calssifier_distilbert

## Resumen
El modelo `learn_hf_food_not_food_text_calssifier_distilbert` es un clasificador de texto binario desarrollado por Alex88Alex mediante fine-tuning de `distilbert/distilbert-base-uncased`. Está diseñado para distinguir entre textos relacionados con comida y textos que no lo son, como indica su nombre. Se trata de un proyecto educativo (el prefijo `learn_hf` sugiere un ejercicio de aprendizaje con Hugging Face), publicado bajo licencia Apache 2.0.

Con 66.955.010 parámetros, el modelo mantiene la arquitectura de DistilBERT, un transformer encoder compacto y eficiente. El fine-tuning se realizó sobre un dataset no especificado, alcanzando una precisión de 1.0 en el conjunto de evaluación, lo que sugiere un posible sobreajuste. Aunque el modelo base es monolingüe en inglés, no se han declarado oficialmente los idiomas soportados.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo se basa en DistilBERT, una versión destilada de BERT que conserva el 97% de su rendimiento con un 40% menos de parámetros. Es un transformer encoder con atención bidireccional, adecuado para tareas de clasificación de secuencias. El fine-tuning se realizó sobre `distilbert/distilbert-base-uncased` con un dataset no documentado.

El entrenamiento utilizó los siguientes hiperparámetros: learning rate de 0.0001, batch size de 32 (tanto para entrenamiento como evaluación), semilla 42, optimizador AdamW (fused) con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal y 10 épocas. Según los resultados reportados, la pérdida de validación descendió de 0.1089 en la primera época a 0.0006 en la décima, con una precisión de validación de 1.0 desde la cuarta época. No se menciona el uso de técnicas como RLHF o DPO.

## Capacidades
- Clasificación de texto binaria: distingue entre textos relacionados con comida y textos que no lo son.
- Generación de texto: no aplica, es exclusivamente un modelo de clasificación.
- Razonamiento: no aplica, no está diseñado para tareas generativas o de razonamiento.
- Código: no soporta generación de código.
- Tool calling: no soportado.
- Agentes y multi-step reasoning: no soportado.
- Capacidades multilingües: no declaradas; el modelo base es monolingüe en inglés.
- Capacidades especiales: ninguna adicional; es un clasificador de secuencias estándar.

## Casos de uso
- Moderación de contenido en foros gastronómicos: el modelo puede filtrar automáticamente comentarios que mencionen alimentos, permitiendo a los moderadores priorizar revisiones o detectar spam relacionado con comida.
- Clasificación de reseñas de restaurantes: en una plataforma de reseñas, puede etiquetar automáticamente si una reseña habla de comida o de otros aspectos (servicio, ambiente), facilitando el análisis de sentimiento por categoría.
- Filtrado de productos en marketplaces: al procesar descripciones de productos, puede separar los artículos alimenticios de los no alimenticios, mejorando la organización del catálogo.
- Análisis de redes sociales: para campañas de marketing, puede identificar menciones de comida en tweets o publicaciones, permitiendo segmentar audiencias interesadas en gastronomía.
- Automatización de tickets de soporte: en un sistema de atención al cliente, puede clasificar consultas relacionadas con pedidos de comida y enrutarlas al departamento adecuado.
- Preprocesamiento de datos para NLP: como paso previo en pipelines de análisis de texto, puede filtrar documentos relevantes para estudios sobre alimentación o nutrición.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la precisión de validación (1.0) y la pérdida (0.0006) durante el entrenamiento, pero no incluye comparaciones con otros modelos en conjuntos de datos estándar como MMLU, HumanEval o GLUE.

## Requisitos de hardware
- VRAM estimada: con 66.955.010 parámetros, en FP32 se requieren aproximadamente 268 MB de memoria (67M × 4 bytes). En FP16 serían unos 134 MB. Es viable en GPUs con 2 GB o menos.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, RTX 2060, o incluso integradas. También funciona en CPU para inferencia de baja latencia.
- Consumer GPU: sí, cabe en la mayoría de GPUs de consumo.
- Opciones de despliegue: compatible con la librería `transformers` mediante `pipeline` o `AutoModelForSequenceClassification`. También puede servirse con `text-embeddings-inference` (según tags) o exportarse a ONNX para entornos de producción. No se menciona compatibilidad con vLLM u Ollama, aunque al ser un modelo pequeño podría adaptarse.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, la inferencia de una secuencia corta debería completarse en menos de 10 ms, pero es una estimación no verificada.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la documentación proporcionada. Al ser un fine-tuning específico de DistilBERT para una tarea binaria, no hay datos de rendimiento frente a alternativas como BERT-base, RoBERTa o otros clasificadores de texto.

## Limitaciones y advertencias
- Sesgos conocidos: no se han documentado, pero al ser un modelo basado en DistilBERT preentrenado en inglés, puede heredar sesgos de género, raza o cultura presentes en los datos originales.
- Riesgo de alucinación: no aplica, al ser un clasificador no genera texto.
- Sobreajuste: la precisión de validación de 1.0 desde la época 4 y la pérdida extremadamente baja (0.0006) sugieren un posible sobreajuste al dataset de entrenamiento, lo que limita su generalización a datos no vistos.
- Limitaciones de contexto o idioma: el modelo base es monolingüe en inglés (uncased) y no se han declarado idiomas adicionales. La longitud de contexto no está especificada, pero DistilBERT base suele soportar 512 tokens; este dato no está confirmado en la documentación.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se incluya el aviso de copyright y se indiquen los cambios realizados.
- Caveat para producción: el dataset de entrenamiento es desconocido y la precisión perfecta en validación es una señal de alerta. Se recomienda evaluar el modelo en un conjunto de datos independiente antes de desplegarlo en entornos reales.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/Alex88Alex/learn_hf_food_not_food_text_calssifier_distilbert)
- [Modelo base: distilbert/distilbert-base-uncased](https://huggingface.co/distilbert/distilbert-base-uncased)
