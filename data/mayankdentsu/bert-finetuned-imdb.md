# MayankDentsu/bert-finetuned-imdb

## Resumen

bert-finetuned-imdb es un modelo de clasificación de texto desarrollado por MayankDentsu, resultado del ajuste fino (fine-tuning) de bert-base-uncased sobre un conjunto de datos no documentado. El nombre del repositorio sugiere que se trata del dataset IMDb, pero la ficha no lo confirma explícitamente. Con 109.483.778 parámetros y una arquitectura Transformer encoder-only, está diseñado para tareas de clasificación, como análisis de sentimiento o etiquetado de texto. La licencia Apache 2.0 permite su uso comercial y la integración en sistemas de producción. A pesar de ser un modelo pequeño, ofrece un rendimiento razonable para tareas de clasificación y puede ejecutarse en hardware modesto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT) |
| Parametros totales | 109.483.778 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens (inferido de bert-base-uncased) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT base uncased, una arquitectura Transformer encoder-only con 12 capas, 768 unidades ocultas y 12 cabezas de atención. El fine-tuning se realizó sobre una base no documentada, probablemente el dataset IMDb según el nombre del repositorio. Los hiperparámetros declarados incluyen una tasa de aprendizaje de 2e-5, tamaño de lote de 8, 2 épocas y el optimizador AdamW con programador lineal. No se menciona ningún proceso de RLHF, DPO ni otro método de alineación posterior al entrenamiento.

## Capacidades

- Clasificación de texto: asigna etiquetas a frases o documentos, con una salida de una o varias clases.
- Análisis de sentimiento: identifica la polaridad (positiva, negativa, neutra) de reseñas o comentarios.
- Etiquetado de texto: puede categorizar textos en clases predefinidas, como temas o categorías.
- No es un modelo generativo: no produce texto libre; solo emite logits de clasificación.
- No soporta tool calling ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el modelo base es inglés, pero no se confirma.

## Casos de uso

- Análisis de sentimiento en reseñas de películas: adecuado para clasificar críticas en positivas o negativas, útil para plataformas de contenido.
- Moderación automática de comentarios: detecta comentarios tóxicos o inapropiados en foros o redes sociales.
- Clasificación de tickets de soporte: categoriza solicitudes de usuarios por tipo (error, facturación, etc.) para enrutarlas al equipo adecuado.
- Análisis de feedback de productos: procesa opiniones de clientes para extraer valoraciones de productos en tiendas online.
- Detección de spam en correos: clasifica mensajes como spam o no spam, aprovechando la representación contextual de BERT.
- Análisis de encuestas abiertas: categoriza respuestas de encuestas en temas o sentimientos para obtener métricas agregadas.
- Clasificación de documentos legales: etiqueta párrafos o cláusulas según su naturaleza, con la limitación del contexto de 512 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara una pérdida de 0.3450 en el conjunto de evaluación, pero sin métricas adicionales como precisión, recall o F1.

## Requisitos de hardware

- VRAM estimada: en FP32, ~437 MB para los pesos, más activaciones; en FP16, ~218 MB. Para inferencia, se recomienda al menos 1 GB de VRAM para secuencias de 512 tokens.
- GPU recomendadas: NVIDIA T4, RTX 2080, A10, o cualquier GPU con 2 GB o más.
- Sí cabe en GPU de consumo: una RTX 3060 o similar puede ejecutarlo sin problemas.
- Opciones de despliegue: Transformers (Hugging Face), ONNX Runtime, vLLM (con soporte de clasificación), Hugging Face Inference Endpoints.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MayankDentsu/bert-finetuned-imdb | 109.483.778 | 512 (inferido) | Apache 2.0 | HuggingFace |
| mgbam/bert-imdb-finetuned | No disponible | No disponible | No disponible | HuggingFace |
| mahesh074/bert-finetuned-imdb | No disponible | No disponible | No disponible | HuggingFace |

No se dispone de métricas de rendimiento para comparar directamente estos modelos; todos son variantes de BERT fine-tuned sobre IMDb o datasets similares.

## Limitaciones y advertencias

- Conjunto de entrenamiento no documentado: no se especifica el dataset ni la composición, lo que dificulta la evaluación de sesgos.
- Sin métricas de evaluación: solo se reporta la pérdida, sin precisión, recall o F1, limitando la confianza en el rendimiento.
- Sesgos potenciales: el modelo base BERT hereda sesgos lingüísticos y culturales del texto en inglés, que pueden amplificarse según el dataset.
- Riesgo de clasificaciones incorrectas: en contextos ambiguos o fuera del dominio de entrenamiento, las predicciones pueden ser poco fiables.
- Limitación de contexto: la ventana de 512 tokens impide analizar documentos largos de una sola vez; requiere truncamiento o troceado.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el desconocimiento del dataset puede generar problemas legales si se usa en producción.

## Enlaces

- HuggingFace: https://huggingface.co/MayankDentsu/bert-finetuned-imdb
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- mgbam/bert-imdb-finetuned: https://huggingface.co/mgbam/bert-imdb-finetuned
- mahesh074/bert-finetuned-imdb: https://huggingface.co/mahesh074/bert-finetuned-imdb
