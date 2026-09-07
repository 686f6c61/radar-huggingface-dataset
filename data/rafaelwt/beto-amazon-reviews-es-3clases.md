# rafaelwt/beto-amazon-reviews-es-3clases

## Resumen

Este modelo es un fine-tuning de BETO (`dccuchile/bert-base-spanish-wwm-cased`) para clasificar el sentimiento de reseñas de Amazon en español en tres clases: negativo, neutro y positivo. Ha sido desarrollado por rafaelwt como parte de un ejercicio académico (Laboratorio 4, Módulo 10 de Procesamiento de Lenguaje Natural, Grupo 5). El modelo resuelve un problema práctico de análisis de sentimiento en textos cortos de clientes, y resulta relevante para aplicaciones de comercio electrónico que necesiten etiquetar comentarios de forma automática en castellano.

Arquitectónicamente se trata de un transformer encoder BERT base, con 109.853.187 parámetros y una longitud de contexto estándar de 512 tokens. No es un modelo generativo ni multimodal; su tarea es exclusivamente la clasificación de texto. El entrenamiento se realizó sobre la partición completa de entrenamiento del dataset `SetFit/amazon_reviews_multi_es`, compuesto por 200.000 reseñas, con una configuración de fine-tuning estándar para BERT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base) |
| Parámetros totales | 109.853.187 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (estándar de BERT base) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Español |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de `dccuchile/bert-base-spanish-wwm-cased`, un BERT base entrenado por la Universidad de Chile con un vocabulario WordPiece en español. La arquitectura es la de un encoder transformer estándar: 12 capas, 12 cabezas de atención y 768 dimensiones ocultas, con un clasificador lineal en la salida. No incorpora mecanismos de decodificación especulativa ni atención lineal; es un transformer denso clásico.

El entrenamiento se realizó sobre el dataset `SetFit/amazon_reviews_multi_es`, concretamente sobre la partición de entrenamiento completa (200.000 reseñas), con 5.000 muestras de validación y 5.000 de test. Se usaron 3 épocas con evaluación por época, seleccionando el checkpoint de la época 2 por mejor macro F1. Los hiperparámetros son: longitud máxima de 128 tokens WordPiece, tamaño de lote 32, tasa de aprendizaje 2e-5, weight decay 0.01, 10% de warmup y fp16. El entrenamiento se ejecutó en una NVIDIA GeForce RTX 4060 de 8 GB durante 38,6 minutos. No se aplicaron técnicas de RLHF ni DPO; es un fine-tuning supervisado de clasificación de secuencias.

## Capacidades

- Clasificación de sentimiento en español para reseñas de Amazon: asigna una etiqueta entre negativo, neutro y positivo.
- Análisis de textos cortos de clientes: funciona con fragmentos de hasta 128 tokens, adecuado para reseñas y comentarios breves.
- Detección de opiniones extremas: presenta un F1 alto en las clases negativo (0,850) y positivo (0,876), por lo que es fiable para identificar quejas y elogios claros.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni uso de agentes: es un modelo discriminativo de clasificación.
- No es multilingüe ni multimodal: solo procesa texto en español y no acepta imágenes ni audio.

## Casos de uso

- Análisis de reseñas en comercio electrónico: integrar el modelo en un pipeline que etiquete automáticamente las reseñas de productos en una tienda online en español, permitiendo filtrar o destacar comentarios negativos y positivos.
- Monitorización de reputación de marca: clasificar menciones de una marca en foros y redes sociales en español para detectar quejas o elogios de forma rápida.
- Priorización de atención al cliente: usar la clase negativo para identificar tickets o comentarios que requieren respuesta inmediata, reduciendo el tiempo de reacción en soporte.
- Análisis de encuestas de satisfacción: procesar respuestas abiertas de encuestas NPS o CSAT en español, agrupando la opinión en las tres clases para generar métricas.
- Automatización de moderación de contenido: en plataformas de reseñas, clasificar comentarios como positivos o negativos para ayudar a moderar o reportar contenido.
- Etiquetado de feedback para análisis de producto: alimentar un dashboard de analítica de producto con el sentimiento de las reseñas, aprovechando la buena precisión en clases extremas para detectar tendencias.

## Benchmarks y rendimiento

El autor publicó resultados en el conjunto de test de 5.000 reseñas. La siguiente tabla compara el modelo con una línea base de TF-IDF más regresión logística.

| Modelo | Accuracy | Macro F1 | F1 negativo | F1 neutro | F1 positivo |
|---|---|---|---|---|---|
| TF-IDF + Logistic Regression (baseline) | 0,737 | 0,705 | 0,798 | 0,492 | 0,823 |
| BETO fine-tuned (este modelo) | 0,793 | 0,738 | 0,850 | 0,487 | 0,876 |

Los resultados muestran una mejora de 5,6 puntos en accuracy y 3,3 puntos en macro F1 frente a la baseline, con un mejor rendimiento en las clases negativo y positivo. La clase neutro sigue siendo la más débil, con un F1 de 0,487, y el autor indica que los textos sarcásticos tienden a clasificarse como positivos. No se han publicado benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 109,85 millones de parámetros. En fp16 los pesos ocupan aproximadamente 220 MB, y en fp32 unos 440 MB. Con el overhead del runtime, la inferencia en GPU requiere menos de 1 GB de VRAM en fp16 y alrededor de 1-2 GB en fp32.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. El entrenamiento se realizó en una NVIDIA GeForce RTX 4060 de 8 GB, por lo que tarjetas similares o superiores (RTX 3060, RTX 4070, A100, H100) funcionan sin problemas.
- CPU: el modelo puede ejecutarse en CPU sin necesidad de GPU, con una latencia mayor pero aceptable para clasificación de textos cortos.
- Opciones de despliegue: se puede servir con la librería Transformers de HuggingFace (pipeline de text-classification), ONNX Runtime, o cuantizar con herramientas como Optimum para acelerar. No hay soporte nativo para llama.cpp ni GGUF al ser un modelo encoder, no generativo.
- Latencia: no se han publicado mediciones oficiales de latencia o throughput.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos de la misma categoría en la información proporcionada. La única referencia de rendimiento es la baseline TF-IDF más regresión logística incluida en la model card. No se han encontrado modelos equivalentes (BETO fine-tuned para sentimiento en español) con datos de benchmark comparables.

## Limitaciones y advertencias

- La clase neutro tiene un rendimiento bajo (F1 0,487), por lo que el modelo confunde con frecuencia opiniones neutras con positivas o negativas. Esto puede suponer un problema en aplicaciones que necesiten detectar neutralidad.
- El autor indica que los textos sarcásticos tienden a clasificarse como positivo, lo que puede llevar a interpretaciones erróneas en reseñas con ironía.
- El modelo se entrenó con una longitud máxima de 128 tokens, por lo que no procesa reseñas largas ni documentos extensos. Los textos se truncarán a 128 tokens.
- Solo funciona en español; no soporta otros idiomas.
- No es un modelo generativo: no puede producir texto, responder preguntas ni generar razonamientos. Su única salida es una etiqueta de clasificación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige mantener el aviso de licencia y mencionar los cambios realizados.
- No se han documentado sesgos específicos de género o raza en la información disponible, pero al ser un modelo entrenado con reseñas de Amazon puede heredar sesgos presentes en ese tipo de datos (por ejemplo, sobrevaloración de productos populares).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rafaelwt/beto-amazon-reviews-es-3clases
- Modelo base: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- Dataset de entrenamiento: https://huggingface.co/datasets/SetFit/amazon_reviews_multi_es
