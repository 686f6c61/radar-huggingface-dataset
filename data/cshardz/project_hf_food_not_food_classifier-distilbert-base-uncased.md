# CshardZ/project_hf_food_not_food_classifier-distilbert-base-uncased

## Resumen

El modelo `project_hf_food_not_food_classifier-distilbert-base-uncased` es un ajuste fino (fine-tune) de `distilbert/distilbert-base-uncased` orientado a la clasificación binaria de texto, concretamente para distinguir entre textos relacionados con comida y textos que no lo están. Ha sido desarrollado por el usuario CshardZ y subido a Hugging Face como parte de un proyecto personal, sin documentación adicional sobre el dataset de entrenamiento ni los casos de uso previstos.

La arquitectura base es DistilBERT, una versión destilada de BERT con 66,9 millones de parámetros, que conserva el 97 % de las capacidades lingüísticas del modelo original con un 40 % menos de parámetros. La ventana de contexto máxima es de 512 tokens, lo que limita su uso a fragmentos de texto cortos. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones, aunque la falta de información sobre el dataset de entrenamiento y la ausencia de métricas comparativas hacen que su fiabilidad en producción sea cuestionable.

La relevancia actual de este modelo es limitada: se trata de un clasificador de texto sencillo, probablemente entrenado con un dataset pequeño (solo 21 pasos de entrenamiento) y con una precisión declarada del 100 % en evaluación, un valor que sugiere sobreajuste o un conjunto de datos trivial. No aporta innovación técnica ni capacidades avanzadas, pero puede servir como ejemplo de fine-tuning de DistilBERT para tareas de clasificación de dominio específico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (Transformer encoder, 6 capas, 12 cabezas de atención) |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (solo pesos completos en safetensors) |
| Idiomas soportados | No disponible (el modelo base DistilBERT está entrenado principalmente en inglés; no se especifican idiomas adicionales) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una arquitectura Transformer encoder con 6 capas, 12 cabezas de atención y una dimensión oculta de 768. DistilBERT se obtiene mediante destilación de conocimiento desde BERT-base, reduciendo el número de capas a la mitad pero manteniendo la misma dimensionalidad. El ajuste fino se realizó sobre un dataset desconocido, con los siguientes hiperparámetros: learning rate de 0.0001, batch size de 32, 3 épocas, optimizador AdamW (fused) y scheduler lineal. El entrenamiento duró solo 21 pasos, lo que indica un dataset muy reducido (probablemente menos de 700 ejemplos). No se menciona el uso de técnicas como RLHF o DPO.

La ausencia de información sobre la composición del dataset, el preprocesado y la división train/eval impide evaluar la calidad del entrenamiento. La precisión del 100 % en validación, junto con el número tan bajo de pasos, apunta a un posible sobreajuste severo o a un problema de clasificación demasiado sencillo (por ejemplo, textos claramente diferenciados). No se reporta ninguna innovación técnica adicional.

## Capacidades

- Clasificación binaria de texto: distingue entre textos relacionados con comida y textos que no lo están.
- Procesamiento de lenguaje natural general: al heredar las capacidades de DistilBERT, puede comprender estructuras sintácticas y semánticas básicas en inglés.
- Longitud de contexto limitada: acepta secuencias de hasta 512 tokens, adecuado para frases, párrafos cortos o campos de formulario.
- Sin soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües no confirmadas; el modelo base DistilBERT está entrenado principalmente en inglés, por lo que su rendimiento en otros idiomas será muy limitado.

## Casos de uso

- Moderación de contenido en foros o redes sociales: el modelo puede filtrar automáticamente publicaciones que mencionan comida, por ejemplo en comunidades donde ese tema está restringido. Se integraría como un clasificador previo en un pipeline de moderación.
- Clasificación de reseñas de restaurantes: dado un texto de opinión, el modelo puede determinar si el contenido trata sobre comida o sobre otros aspectos (servicio, ambiente, precio), ayudando a categorizar reseñas.
- Enrutamiento de tickets de soporte: en plataformas de entrega de comida, los mensajes de clientes que mencionan alimentos pueden dirigirse a un equipo específico. El modelo actuaría como un filtro rápido de entrada.
- Etiquetado de recetas o artículos culinarios: para organizar una base de datos de contenido, el modelo puede identificar si un artículo o fragmento trata sobre comida, facilitando la indexación automática.
- Análisis de redes sociales para marketing: identificar menciones de productos alimenticios en tweets o comentarios, permitiendo medir la presencia de una marca en conversaciones gastronómicas.
- Filtrado de datos para entrenamiento de otros modelos: antes de entrenar un modelo de lenguaje especializado en nutrición, se puede usar este clasificador para seleccionar solo los textos relevantes de un corpus grande.

## Benchmarks y rendimiento

El autor declara en la model card los siguientes resultados de evaluación, aunque no se incluyen en el `model-index` oficial:

| Metrica | Valor |
|---|---|
| Loss de evaluacion | 0.0001 |
| Accuracy de evaluacion | 1.0 |

Estos valores corresponden al conjunto de validación utilizado durante el entrenamiento, pero no se especifica el tamaño ni la composición de dicho conjunto. La precisión perfecta y la pérdida casi nula son indicativas de sobreajuste o de un dataset no representativo. No se han publicado resultados comparativos con otros modelos ni benchmarks estándar como GLUE, MMLU o SuperGLUE.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 67 millones de parámetros en precisión FP32, la inferencia requiere aproximadamente 268 MB de VRAM (67M × 4 bytes). Con cuantización a 8 bits, se reduciría a ~67 MB, aunque no se proporcionan versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, RTX 2060 o superiores pueden ejecutar la inferencia sin problemas. Incluso la CPU es viable para inferencia por lotes pequeños.
- Compatibilidad con GPU de consumo: sí, es un modelo muy ligero que cabe en cualquier GPU moderna e incluso en dispositivos con pocos recursos.
- Opciones de despliegue: compatible con Hugging Face Transformers, ONNX Runtime, TensorFlow Serving, y puede exportarse a formatos como TorchScript. También se puede servir con FastAPI o Flask en un contenedor Docker.
- Latencia y throughput: en una GPU moderna (por ejemplo, RTX 3090), la inferencia para un solo texto de menos de 512 tokens toma menos de 10 ms. En CPU, puede rondar los 50-100 ms por muestra. No se han publicado mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (en tarea similar) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (DistilBERT fine-tune) | 66,9 M | 512 | 1.0 (declarado, no verificado) | Apache 2.0 | Hugging Face |
| BERT-base-uncased fine-tune para clasificación | 110 M | 512 | Depende del dataset | Apache 2.0 | Hugging Face |
| RoBERTa-base fine-tune | 125 M | 512 | Depende del dataset | MIT | Hugging Face |
| DistilBERT-base-uncased (original) | 66,9 M | 512 | ~0.99 en GLUE (promedio) | Apache 2.0 | Hugging Face |

No se dispone de comparativas directas con otros clasificadores de comida/no comida, ya que no hay benchmarks públicos en la model card. La comparación con los modelos base es orientativa: este fine-tune podría tener un rendimiento similar o peor que el modelo base sin ajustar si el dataset de entrenamiento es deficiente.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: no se especifica el origen, tamaño ni composición de los datos, lo que impide evaluar la generalización.
- Posible sobreajuste: la precisión del 100 % en validación con solo 21 pasos sugiere que el modelo memorizó el conjunto de entrenamiento en lugar de aprender patrones generalizables.
- Sesgos no documentados: al ser un fine-tune de DistilBERT, hereda los sesgos del modelo base, que pueden incluir estereotipos de género, raza o cultura. Además, el dataset de entrenamiento podría introducir sesgos adicionales no detectados.
- Riesgo de alucinación: aunque es un clasificador, no genera texto, por lo que el riesgo de alucinación es bajo. Sin embargo, puede clasificar incorrectamente textos ambiguos o fuera de dominio.
- Limitaciones de idioma: el modelo base está entrenado principalmente en inglés; su rendimiento en español u otros idiomas será deficiente.
- Falta de robustez: sin datos de validación externa, no se recomienda su uso en producción sin una evaluación exhaustiva previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero no hay garantías de calidad ni soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CshardZ/project_hf_food_not_food_classifier-distilbert-base-uncased
- Modelo base DistilBERT: https://huggingface.co/distilbert/distilbert-base-uncased
- Documentación de Transformers: https://huggingface.co/docs/transformers/index
- Paper de DistilBERT: https://arxiv.org/abs/1910.01108
