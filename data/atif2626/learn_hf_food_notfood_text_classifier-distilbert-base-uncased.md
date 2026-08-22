# Atif2626/learn_hf_food_notfood_text_classifier-distilbert-base-uncased

## Resumen

El modelo `learn_hf_food_notfood_text_classifier-distilbert-base-uncased` es un clasificador binario de texto desarrollado por Atif2626 que determina si un texto está relacionado con comida o no. Se basa en la arquitectura DistilBERT, una versión destilada de BERT con 66 millones de parámetros, que ofrece un equilibrio entre eficiencia y rendimiento para tareas de clasificación de texto. El modelo se distribuye con licencia Apache 2.0 y pesos en formato safetensors, lo que facilita su integración en entornos de producción con las librerías estándar de Hugging Face.

La relevancia de este modelo radica en su sencillez y tamaño reducido, lo que permite ejecutarlo en hardware modesto, incluso en CPU. Sin embargo, la información pública es limitada: la model card es auto-generada, no se especifica el dataset de entrenamiento ni se publican resultados de benchmarks estándar. El modelo reporta una precisión de 1.0 en el conjunto de evaluación durante el entrenamiento, un valor que sugiere un posible sobreajuste o un dataset muy pequeño. A pesar de ello, puede servir como punto de partida para tareas de clasificación de texto relacionadas con alimentación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT base (transformer encoder) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors fp32) |
| Idiomas soportados | no disponible (DistilBERT base es inglés, pero no se especifica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `distilbert/distilbert-base-uncased`, un encoder transformer de 6 capas, 12 cabezas de atención y 66 millones de parámetros. El entrenamiento se realizó con el Trainer de Hugging Face, con los siguientes hiperparámetros: learning rate de 0.0001, batch size de 32, 10 épocas y un total de 70 pasos de optimización. Esto sugiere un dataset de entrenamiento muy pequeño (probablemente unas 70 muestras por época, o menos, dado el número de pasos). No se especifica la composición del dataset ni si se aplicaron técnicas de ajuste adicionales (RLHF, DPO, etc.). La model card indica que el conjunto de evaluación alcanzó una pérdida de 0.0005 y una accuracy de 1.0, un resultado que, con un dataset tan limitado, debe interpretarse con cautela por riesgo de sobreajuste.

## Capacidades

- Clasificación binaria de texto: determina si un texto está relacionado con comida o no.
- Generación de texto: no soporta.
- Razonamiento: no aplica, es un clasificador puro.
- Tool calling / function calling: no soporta.
- Agentes y multi-step reasoning: no soporta.
- Capacidades multilingües: no disponible, pero al basarse en DistilBERT uncased, el modelo está entrenado principalmente en inglés.
- Otras capacidades: ninguna adicional; es un modelo de clasificación de secuencias de una sola etiqueta.

## Casos de uso

- Moderación de contenido en plataformas de redes sociales: el modelo puede filtrar publicaciones o comentarios que mencionen comida, útil para comunidades de nutrición o para detectar spam de restaurantes.
- Clasificación de reseñas de restaurantes: permite etiquetar automáticamente reseñas que hablan de comida para agruparlas o priorizarlas en un sistema de análisis de opiniones.
- Filtrado de noticias y artículos: en un agregador de noticias, se puede usar para separar artículos de gastronomía del resto del contenido.
- Etiquetado de mensajes en aplicaciones de delivery: clasificar mensajes de clientes que piden comida de otros tipos de consultas, mejorando el enrutamiento en atención al cliente.
- Preprocesamiento para sistemas de recomendación: identificar textos relacionados con comida para alimentar un sistema de recomendación de recetas o restaurantes.
- Análisis de sentimiento en contextos alimentarios: aunque es binario, puede servir como primer filtro en un pipeline de análisis de opiniones sobre productos alimenticios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo index no contiene resultados (results: []). El autor reporta en la model card una accuracy de 1.0 y una pérdida de 0.0005 en el conjunto de evaluación, pero estos valores provienen del propio entrenamiento y no de una evaluación independiente con métricas estándar como MMLU, HumanEval o GLUE. Por tanto, no se dispone de datos fiables para comparar con otros modelos.

## Requisitos de hardware

- VRAM estimada: alrededor de 270 MB en fp32 (66M parámetros × 4 bytes). Con cuantización int8, se reduce a ~170 MB, y con int4 a ~90 MB.
- GPU recomendada: cualquier GPU con al menos 1 GB de VRAM, por ejemplo una NVIDIA GTX 1050 o superior. También puede ejecutarse en CPU con memoria suficiente (>= 4 GB RAM).
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (RTX 2060, RTX 3060, etc.) con facilidad.
- Opciones de despliegue: se puede servir con Hugging Face Inference Endpoints, vLLM (aunque es un modelo pequeño), llama.cpp no es adecuado porque es un modelo de encoder, pero se puede usar con Transformers o con ONNX Runtime. También es compatible con text-embeddings-inference (según tags), aunque su pipeline es text-classification.
- Latencia y throughput: no se proporcionan datos, pero al ser un modelo pequeño, la inferencia en CPU suele ser de pocos milisegundos por muestra.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| learn_hf_food_notfood (este) | 66,96 M | no disponible (DistilBERT base usa 512) | Apache 2.0 | no disponible |
| DistilBERT base (distilbert-base-uncased) | 66 M | 512 | Apache 2.0 | GLUE ~77 (promedio) |
| BERT base (bert-base-uncased) | 110 M | 512 | Apache 2.0 | GLUE ~80 (promedio) |
| RoBERTa base (roberta-base) | 125 M | 512 | MIT | GLUE ~82 (promedio) |

Nota: los datos de parámetros y contexto son conocidos públicamente; los valores de GLUE son aproximados y se citan solo como referencia. Este modelo no publica benchmarks comparables.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card no especifica el origen ni la composición de los datos, lo que dificulta evaluar su generalización.
- Riesgo de sobreajuste: el valor de accuracy 1.0 en validación, junto con un número muy pequeño de pasos de entrenamiento (70), sugiere que el modelo puede estar memorizando el conjunto de entrenamiento y no generalizar bien a datos nuevos.
- Sesgos y alucinaciones: al ser un clasificador binario, no hay riesgo de alucinación textual, pero sí de clasificaciones erróneas si los textos no se ajustan al dominio de entrenamiento.
- Limitaciones de idioma: el modelo base es inglés (uncased), por lo que no se espera un buen rendimiento en español u otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Advertencia para producción: antes de desplegarlo, se recomienda evaluar con datos reales del dominio objetivo y considerar un ajuste fino con un dataset más representativo.

## Enlaces

- HuggingFace (original): https://huggingface.co/Atif2626/learn_hf_food_notfood_text_classifier-distilbert-base-uncased
- Modelo ONNX (comunidad): https://huggingface.co/onnx-community/learn_hf_food_not_food_text_classifier_distilbert_base_uncased-ONNX
- Réplica en otro perfil: https://huggingface.co/AlaqmarE/learn_hf_food_not_food_text_classifier-distilbert-base-uncased
- Ficha en AIBase: https://model.aibase.com/models/details/1915748764360531970
- Ficha en free2aitools: https://free2aitools.com/model/pdml/learn_hf_food_not_food_text_classifier-distilbert-base-uncased
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
