# DanielNRU/S7-relevance-rubert-20260823

## Resumen

El modelo `DanielNRU/S7-relevance-rubert-20260823` es un clasificador binario de relevancia desarrollado por DanielNRU para el dominio de la aerolínea rusa S7. Su función es determinar si un texto en ruso es relevante o no para dicho dominio, lo que resulta útil para filtrar consultas, comentarios o documentos relacionados con S7. Está construido sobre el modelo base `ai-forever/ruRoBERTa-large`, una variante de RoBERTa adaptada al ruso, y añade una cabeza de clasificación con una capa oculta de 512 unidades.

Con 355,9 millones de parámetros y una longitud máxima de secuencia de 512 tokens, el modelo ofrece un rendimiento sólido en su tarea específica, alcanzando un F1 de 0,971 en el conjunto de test. Su relevancia radica en que proporciona una solución especializada y ajustada para un caso de uso concreto, evitando la necesidad de entrenar un modelo desde cero. La licencia no está especificada, lo que debe tenerse en cuenta antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RuBERTBinaryClassifier (cabeza de clasificación sobre ruRoBERTa-large) |
| Parametros totales | 355.885.057 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso (ru) |
| Licencia | no disponible |
| Formato de pesos | safetensors (también se menciona pytorch_model.bin en el código de uso) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de `ruRoBERTa-large`, un modelo preentrenado en ruso con 355 millones de parámetros. Sobre esta base, se añade una capa de clasificación binaria (RuBERTBinaryClassifier) con una capa oculta de 512 unidades y una salida de una neurona con activación sigmoide. El entrenamiento se realizó para la tarea de clasificación de relevancia, con una proporción de clases relevante:irrelevante de 3:1 en el conjunto de entrenamiento. No se proporcionan detalles sobre el volumen de datos, el número de épocas ni el uso de técnicas como RLHF o DPO. El umbral de decisión se fijó en 0,5.

## Capacidades

- Clasificación binaria de textos en ruso como relevantes o irrelevantes para el dominio S7.
- Manejo de secuencias de hasta 512 tokens, suficiente para párrafos o mensajes de longitud media.
- Optimizado para textos del ámbito de S7 (aerolínea), incluyendo consultas de clientes, comentarios, tickets de soporte, etc.
- No incluye generación de texto, tool calling, capacidades multimodales ni soporte para agentes.
- No se ha reportado soporte para otros idiomas distintos del ruso.

## Casos de uso

- Filtrado de consultas de clientes: el modelo puede clasificar automáticamente los mensajes entrantes de clientes de S7 (por ejemplo, a través de formularios web o correo) para identificar cuáles son relevantes para el servicio y cuáles no, reduciendo el trabajo manual de triaje.
- Clasificación de tickets de soporte: en un sistema de helpdesk, el modelo puede etiquetar los tickets como relevantes o irrelevantes para el dominio S7, priorizando los que requieren atención del equipo de soporte.
- Análisis de comentarios en redes sociales: permite filtrar menciones de S7 en Twitter, VK u otras plataformas para quedarse solo con las que realmente hablan de la aerolínea, facilitando el monitoreo de marca.
- Moderación de contenido en foros o comunidades: si una empresa gestiona un foro sobre S7, el modelo puede decidir si un nuevo mensaje es pertinente al tema o debe ser descartado.
- Automatización de respuestas: integrado en un chatbot, el modelo puede determinar si la consulta del usuario es relevante para S7 y, en caso afirmativo, activar un flujo de respuesta específico.
- Segmentación de documentos internos: en una empresa del sector aéreo, el modelo puede clasificar documentos o correos internos según su relevancia para el dominio S7, ayudando a organizar la información.

## Benchmarks y rendimiento

El autor reporta las siguientes métricas en el conjunto de test:

| Metrica | Valor |
|---|---|
| F1 | 0,971429 |
| Precision | 0,951049 |
| Recall | 0,992701 |

También se indica un F1 de validación de 0,978417. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo tiene 355,9 millones de parámetros. En precisión fp32, los pesos ocupan aproximadamente 1,4 GB; en fp16, unos 0,7 GB. El repositorio ocupa 2,8 GB, lo que sugiere que puede incluir pesos en fp32 o múltiples formatos.
- Para inferencia en fp16, se estima un consumo de VRAM de 2-3 GB, por lo que cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- En fp32, la VRAM necesaria sería de unos 4-5 GB, aún accesible en GPUs con 8 GB o más.
- Opciones de despliegue: se puede usar con la librería `transformers` de Hugging Face, cargando los pesos con `torch.load`. También es posible exportar a ONNX o TensorRT para optimizar la inferencia.
- No se dispone de datos de latencia o throughput medidos por el autor.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. El autor ha publicado otros modelos similares en su perfil, como `DanielNRU/S7-relevance-rubert-20260810` (basado en ruBERT-base-cased) y `DanielNRU/S7-tags-ruroberta-20260810` (clasificación multi-etiqueta), pero no se reportan métricas de estos en la información disponible. Por tanto, no es posible realizar una comparativa cuantitativa.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para el dominio S7. Si se aplica a otros dominios o a una distribución de datos diferente, su rendimiento puede degradarse significativamente.
- La model card advierte que, ante cambios en la distribución de datos, se debe revalidar el umbral de decisión (actualmente 0,5) y las métricas.
- Solo soporta textos en ruso; no se ha evaluado su comportamiento en otros idiomas.
- La licencia no está especificada, lo que puede limitar su uso comercial o su redistribución. Se recomienda contactar con el autor para aclarar los términos.
- Al ser un clasificador binario, no genera texto ni ofrece explicaciones de sus decisiones; solo proporciona una probabilidad de relevancia.
- No se han documentado sesgos específicos, pero al estar entrenado con datos de un dominio concreto, puede reflejar sesgos presentes en esos datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DanielNRU/S7-relevance-rubert-20260823
- Modelo base: https://huggingface.co/ai-forever/ruRoBERTa-large
- Otros modelos del autor: https://huggingface.co/DanielNRU/S7-relevance-rubert-20260810 y https://huggingface.co/DanielNRU/S7-tags-ruroberta-20260810
