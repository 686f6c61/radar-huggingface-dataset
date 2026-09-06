# crl16/bert-finetuned-ner

## Resumen

Este modelo es una versión fine-tuned de `bert-base-cased` para la tarea de reconocimiento de entidades nombradas (NER). Lo desarrolla el usuario `crl16` y está publicado en HuggingFace. Se trata de un modelo de token-classification basado en la arquitectura BERT, con 107.726.601 parámetros, entrenado durante 3 épocas con un learning rate de 2e-05. No se dispone de información sobre el dataset de entrenamiento ni sobre el idioma de los datos, por lo que su uso previsto es genérico para NER. Es relevante porque ofrece un punto de partida ligero para la extracción de entidades en textos, con una licencia Apache 2.0 que permite uso comercial. El modelo tiene 0 descargas y 0 likes, lo que indica que no ha tenido difusión en la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (bert-base-cased) |
| Parámetros totales | 107.726.601 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `bert-base-cased`, un transformer encoder-only de la familia BERT. La arquitectura original tiene 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, pero no se dispone de la confirmación de que el fine-tuning haya modificado la arquitectura. El entrenamiento se realizó con el framework Transformers y el Trainer de HuggingFace, con hiperparámetros: learning rate 2e-05, batch size 8 para train y eval, semilla 42, optimizador AdamW y scheduler lineal, durante 3 épocas. El dataset de entrenamiento no está especificado, por lo que se desconocen el número de tokens, la composición y si se aplicaron técnicas de alineación como RLHF o DPO. La única innovación técnica destacable es el ajuste fino (fine-tuning) del modelo base para token-classification, sin modificaciones estructurales.

## Capacidades

- Reconocimiento de entidades nombradas (NER) como tarea de token-classification, basado en el pipeline `token-classification` de Transformers.
- Generación de etiquetas para cada token de una secuencia de entrada, típicamente para identificar entidades en texto.
- No se ha confirmado soporte de tool calling, function calling, agentes, razonamiento multi-step, visión o audio.
- Capacidades multilingües no disponibles.
- Sin capacidades especiales conocidas, como thinking mode.

## Casos de uso

- Extracción de entidades en documentos legales: el modelo puede identificar nombres de personas, organizaciones o fechas en contratos y expedientes, siempre que el dataset de entrenamiento incluya esas categorías. Al ser un BERT de 110M, es ligero y puede ejecutarse en CPU para procesamiento por lotes.
- Análisis de textos clínicos: etiquetado de enfermedades, fármacos o síntomas en informes médicos, si el dataset de entrenamiento contiene esas entidades.
- Gestión de tickets de soporte: extracción automática de entidades como número de pedido, cliente o producto en tickets de atención al cliente.
- Procesamiento de currículums: identificación de nombres, habilidades o empresas en CVs.
- Análisis de redes sociales: detección de menciones, hashtags o nombres de usuarios en publicaciones.
- Enriquecimiento de bases de datos: extracción de entidades desde artículos de noticias para alimentar un sistema de conocimiento.

Nota: los casos de uso dependen de las categorías de entidades presentes en el dataset de entrenamiento, que no se ha especificado.

## Benchmarks y rendimiento

El model-index declarado está vacío. Sin embargo, el README incluye métricas de evaluación sobre un conjunto de evaluación desconocido:

| Métrica | Valor |
|---|---|
| Loss | 0.0624 |
| Precision | 0.9349 |
| Recall | 0.9519 |
| F1 | 0.9433 |
| Accuracy | 0.9863 |

También se registran los resultados de entrenamiento por épocas:

| Training Loss | Epoch | Step | Validation Loss | Precision | Recall | F1 | Accuracy |
|:-------------:|:-----:|:----:|:---------------:|:---------:|:------:|:------:|:--------:|
| 0.0773 | 1.0 | 1756 | 0.0651 | 0.9057 | 0.9342 | 0.9197 | 0.9821 |
| 0.0349 | 2.0 | 3512 | 0.0700 | 0.9320 | 0.9463 | 0.9391 | 0.9848 |
| 0.0229 | 3.0 | 5268 | 0.0624 | 0.9349 | 0.9519 | 0.9433 | 0.9863 |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

No se ha publicado información sobre requisitos de hardware en la documentación. Con 107.726.601 parámetros, el modelo es pequeño, pero no se dispone de datos oficiales de VRAM, GPU recomendadas, opciones de despliegue ni latencia. Por tanto, estos datos no están disponibles.

## Comparativa con modelos similares

En la búsqueda web se han encontrado otros modelos con nombres similares, como `nt-ai/bert-finetuned-ner` y `processpl/DarkBERT-finetuned-ner`, pero no se dispone de especificaciones detalladas de esos modelos. La comparativa con `bert-base-cased` (el modelo base) es posible en cuanto a parámetros y disponibilidad:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| crl16/bert-finetuned-ner | 107.726.601 | no disponible | Apache 2.0 | HuggingFace |
| google-bert/bert-base-cased | no disponible | no disponible | Apache 2.0 | HuggingFace |
| nt-ai/bert-finetuned-ner | no disponible | no disponible | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- El dataset de entrenamiento es desconocido, por lo que no se puede evaluar la presencia de sesgos ni la cobertura de entidades.
- El modelo se ha entrenado sobre un conjunto de evaluación no especificado; las métricas de evaluación (F1 0.9433, Accuracy 0.9863) pueden no generalizar a otros dominios o idiomas.
- No se ha confirmado el idioma de los datos de entrenamiento, por lo que su rendimiento en otros idiomas no está garantizado.
- El modelo es un fine-tuning de BERT base, por lo que su longitud de contexto está limitada por la arquitectura, aunque el valor exacto no se ha indicado en la información disponible.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.
- Al no disponer de información sobre el dataset, el riesgo de alucinación en tareas de NER se limita a etiquetados incorrectos, pero no se puede cuantificar.

## Enlaces

- https://huggingface.co/crl16/bert-finetuned-ner
