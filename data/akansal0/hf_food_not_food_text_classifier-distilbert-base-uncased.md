# akansal0/hf_food_not_food_text_classifier-distilbert-base-uncased

## Resumen

`akansal0/hf_food_not_food_text_classifier-distilbert-base-uncased` es un modelo de clasificación de texto binaria obtenido mediante fine-tuning de DistilBERT base uncased. Lo desarrolla el usuario akansal0 y su propósito declarado, a partir del nombre del repositorio, es distinguir textos relacionados con comida de los que no lo están. Se publica bajo licencia Apache 2.0 y con un tamaño de repositorio de 0,3 GB, lo que lo convierte en un artefacto ligero y fácil de desplegar.

Técnicamente es un transformer encoder de 6 capas con 66.955.010 parámetros, derivado de `distilbert/distilbert-base-uncased` y entrenado con la librería Transformers mediante `Trainer`. La model card es la plantilla autogenerada por la herramienta y no documenta el conjunto de datos, los usos previstos ni las limitaciones, por lo que la información disponible es muy escasa más allá de los hiperparámetros de entrenamiento y de las métricas de validación.

Su relevancia es limitada y de nicho: sirve como ejemplo de fine-tuning de un clasificador binario de bajo coste, pero no debe considerarse un modelo listo para producción sin una evaluación independiente, dado que la accuracy reportada de 1,0 procede de un conjunto de validación no descrito y de un entrenamiento de solo 70 pasos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas) |
| Parámetros totales | 66.955.010 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT base admite hasta 512 tokens de entrada) |
| Tipos de cuantización | no disponible (pesos en safetensors; admite cuantización dinámica estándar de PyTorch/ONNX) |
| Idiomas soportados | no disponible (el modelo base es uncased en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT, una versión destilada de BERT con 6 capas de atención, 12 cabezas y dimensión oculta de 768, sobre la que se añade una cabeza de clasificación para la tarea `text-classification`. El modelo base es `distilbert-base-uncased`, entrenado originalmente con destilación de BERT y vocabulario WordPiece en minúsculas. No hay innovaciones técnicas adicionales: no se emplean atención lineal, decodificación especulativa ni mecanismos híbridos.

El fine-tuning se realizó con `Trainer` de Transformers durante 10 épocas, con learning rate 1e-4, batch size de 32 en entrenamiento y evaluación, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, y scheduler lineal. El conjunto de datos no se especifica ("unknown dataset" según la model card). El número total de pasos de entrenamiento fue de 70, lo que indica un dataset muy pequeño (del orden de 200 a 250 ejemplos si el batch size efectivo es 32). No se documenta RLHF, DPO ni ningún proceso de alineación. Las versiones de framework declaradas son Transformers 5.22.1, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de texto binaria: asigna una etiqueta de comida / no comida a una secuencia de texto de entrada.
- Inferencia rápida y de bajo coste computacional gracias a su tamaño reducido (67 M de parámetros).
- Compatible con `text-embeddings-inference` y `endpoints_compatible`, según las etiquetas del repositorio.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión, audio ni generación de texto libre.
- Capacidades multilingües: no documentadas; el modelo base está entrenado predominantemente en inglés.

## Casos de uso

- Filtrado de reseñas gastronómicas: clasificar reseñas de restaurantes o productos alimentarios frente a reseñas de otro tipo en un pipeline de ingesta de datos, usando la salida binaria del clasificador para enrutar el contenido.
- Moderación de contenido en foros de cocina: detectar si una publicación pertenece a la temática culinaria antes de publicarla en una sección específica, con latencia mínima por su tamaño.
- Etiquetado previo de datasets: como primer paso de anotación automática en la construcción de corpus de dominio alimentario, revisando después manualmente las predicciones.
- Enrutamiento en asistentes conversacionales: decidir si una consulta de usuario debe derivarse a un módulo especializado en recetas o a un agente general, siempre que se valide previamente la calidad del clasificador.
- Análisis de sentimiento en dominios de restauración: combinado con un modelo de sentimiento, usar la etiqueta de comida como filtro para segmentar opiniones de productos alimentarios.
- Prototipado y docencia: ejemplo didáctico de fine-tuning de DistilBERT con `Trainer`, útil para demostrar el flujo completo de entrenamiento y evaluación en un caso binario sencillo.

## Benchmarks y rendimiento

La model card declara los siguientes resultados en el conjunto de evaluación (sin especificar su composición ni tamaño):

| Métrica | Valor |
|---|---|
| Loss (evaluación) | 0,0004 |
| Accuracy (evaluación) | 1,0 |

Evolución del entrenamiento (extracto de la model card):

| Época | Paso | Training loss | Validation loss | Accuracy |
|---|---|---|---|---|
| 1 | 7 | 0,3648 | 0,0433 | 1,0 |
| 5 | 35 | 0,0010 | 0,0007 | 1,0 |
| 10 | 70 | 0,0005 | 0,0004 | 1,0 |

El model-index no contiene resultados adicionales (lista `results` vacía). No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 270 MB de pesos, más el overhead del runtime (del orden de 0,5 a 1 GB en total con PyTorch).
- En fp16 o cuantización dinámica int8, la huella se reduce a unos 70-140 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona sin problema en RTX 3060, RTX 4090, T4, A10, A100 y H100.
- Cabe holgadamente en GPU de consumo e incluso puede ejecutarse en CPU con latencias de milisegundos por muestra.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (etiqueta `text-embeddings-inference`), exportación a ONNX Runtime, y servidores de inferencia compatibles con endpoints.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño del modelo se espera un throughput alto en GPU y decenas de milisegundos por lote en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| akansal0/hf_food_not_food_text_classifier-distilbert-base-uncased | 66,9 M | no disponible (base: 512) | Clasificación binaria comida/no comida | Apache 2.0 | Hugging Face |
| distilbert/distilbert-base-uncased | 66,9 M | 512 | Modelo base (MLM), requiere fine-tuning | Apache 2.0 | Hugging Face |
| google-bert/bert-base-uncased | 110 M | 512 | Modelo base (MLM), requiere fine-tuning | Apache 2.0 | Hugging Face |
| ProsusAI/finbert | 110 M | 512 | Clasificación de sentimiento financiero | Desconocida | Hugging Face |

La comparación directa de rendimiento con alternativas no está disponible: no existen métricas publicadas del modelo frente a otros clasificadores en el mismo conjunto de datos, y el dataset de evaluación no se documenta.

## Limitaciones y advertencias

- La accuracy de 1,0 procede de un conjunto de validación no descrito y de un entrenamiento de solo 70 pasos; es altamente probable que refleje sobreajuste o un conjunto de evaluación trivial, no un rendimiento real generalizable.
- El dataset de entrenamiento es desconocido ("unknown dataset"), por lo que no puede evaluarse su cobertura, sesgos ni distribución.
- El modelo base es uncased y predominantemente inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Riesgo de alucinación no aplica en sentido estricto (no genera texto), pero sí de falsos positivos y negativos en la clasificación.
- No hay información sobre sesgos demográficos, culturales o de dominio alimentario.
- La model card es la plantilla autogenerada y no documenta usos previstos, limitaciones ni consideraciones éticas.
- Aunque la licencia Apache 2.0 permite uso comercial, la falta de evaluación independiente desaconseja su uso en producción sin validación propia.
- El repositorio tiene 0 descargas y 1 like, lo que sugiere que no ha sido revisado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akansal0/hf_food_not_food_text_classifier-distilbert-base-uncased
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Documentación de DistilBERT en Transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
