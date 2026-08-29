# BonTori/phobert-eda-retrain-hsd

## Resumen

El modelo BonTori/phobert-eda-retrain-hsd es un clasificador de texto (text-classification) obtenido mediante fine-tuning del modelo preentrenado vinai/phobert-base, desarrollado por el usuario BonTori. PhoBERT es una variante de RoBERTa adaptada al vietnamita, con arquitectura transformer encoder-only y aproximadamente 135 millones de parámetros. El nombre del repositorio sugiere que se aplicaron técnicas de aumento de datos (EDA, Easy Data Augmentation) y un reentrenamiento sobre un conjunto de datos no especificado, posiblemente orientado a la detección de discurso de odio (HSD, Hate Speech Detection), aunque esta tarea no se confirma en la documentación.

La relevancia de este modelo radica en demostrar un flujo de fine-tuning de PhoBERT para tareas de clasificación de texto, con métricas de evaluación reportadas (accuracy del 81,92 % y F1 del 61,81 %). Sin embargo, la ficha del modelo es muy escueta: no se detalla el dataset de entrenamiento, la longitud de contexto máxima, ni se proporcionan resultados de benchmarks externos. Aun así, el modelo es utilizable para experimentos de clasificación en vietnamita, siempre que se tenga en cuenta sus limitaciones documentales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa) |
| Parametros totales | 135.000.579 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base PhoBERT tiene un límite de 256 tokens, pero no se especifica en esta ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es vietnamita, pero la ficha no lo indica) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en PhoBERT-base, que a su vez es una adaptación de RoBERTa para el vietnamita. PhoBERT emplea la misma arquitectura de transformer encoder (12 capas, 768 dimensiones ocultas, 12 cabezas de atención) y fue preentrenado con un vocabulario de 64.000 subpalabras. El fine-tuning se realizó con el framework Transformers de Hugging Face, utilizando un optimizador AdamW con tasa de aprendizaje de 2e-5, tamaño de lote de 16, programador lineal y 3 épocas. Los datos de entrenamiento no se especifican en la model card (aparece "None"), por lo que se desconoce la composición del dataset y si se aplicaron técnicas de aumento de datos EDA, aunque el nombre del repositorio sugiere su uso. No se menciona ningún paso de RLHF o DPO.

## Capacidades

- Clasificación de texto: el modelo está diseñado para tareas de clasificación (pipeline text-classification), probablemente binaria o multiclase.
- Fine-tuning sobre PhoBERT: aprovecha las representaciones contextuales del vietnamita aprendidas por PhoBERT.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no aplicable (modelo encoder-only, no generativo).
- Capacidades multilingües: no disponible, aunque al estar basado en PhoBERT, está especializado en vietnamita.
- Otras capacidades: no se reportan capacidades especiales (visión, audio, etc.).

## Casos de uso

- Análisis de sentimiento en vietnamita: dado que PhoBERT está optimizado para vietnamita, el modelo puede utilizarse para clasificar opiniones en redes sociales o reseñas de productos, aunque la precisión real dependerá del dataset de entrenamiento no documentado.
- Detección de discurso de odio (HSD): el nombre "hsd" sugiere esta tarea. El modelo podría emplearse para moderar comentarios en foros o plataformas sociales vietnamitas, si el fine-tuning se realizó sobre un corpus etiquetado para tal fin.
- Clasificación de temas o categorías de documentos: útil para organizar automáticamente artículos, noticias o mensajes en categorías predefinidas.
- Filtrado de contenido inapropiado: en aplicaciones de chat o comentarios, el modelo puede actuar como un clasificador previo para bloquear contenido no deseado.
- Investigación académica: sirve como punto de partida para comparar técnicas de aumento de datos (EDA) en fine-tuning de PhoBERT, dado que el repositorio incluye variantes con y sin EDA (phobert-baseline-retrain-hsd, phobert_eda_results).
- Prototipado rápido: al ser un modelo pequeño (~135M parámetros), es fácil de desplegar en entornos con recursos limitados para pruebas de concepto de clasificación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card incluye métricas de evaluación obtenidas durante el entrenamiento (accuracy 0,8192, F1 0,6181, precisión 0,6102, recall 0,6411), pero no corresponden a un benchmark estándar como MMLU o GLUE. Estas métricas se detallan en la tabla de entrenamiento:

| Métrica | Valor (época 3) |
|---|---|
| Loss | 0,5795 |
| Accuracy | 0,8192 |
| F1 | 0,6181 |
| Precision | 0,6102 |
| Recall | 0,6411 |

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 135 millones de parámetros, la inferencia en FP32 requiere aproximadamente 540 MB de VRAM, en FP16 unos 270 MB y en int8 unos 135 MB. Con el overhead de activaciones y el tokenizador, cabe en GPUs con 2 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, etc.) es suficiente. Incluso puede ejecutarse en CPU para inferencia puntual.
- Si cabe en consumer GPU: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: se puede servir con Hugging Face Inference Endpoints, o mediante frameworks como vLLM, TGI, o llama.cpp (si se convierte a GGUF). Dado su tamaño, también es viable en entornos serverless.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de este tamaño, la latencia típica en GPU es del orden de milisegundos por muestra (por ejemplo, <10 ms en una RTX 3060).

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría. El modelo es un fine-tuning de PhoBERT-base, y no se reportan resultados de benchmarks que permitan compararlo con alternativas como BERT multilingual, XLM-R o el propio PhoBERT-base sin fine-tuning. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica "None", lo que impide conocer la distribución de clases, el tamaño del corpus o los posibles sesgos introducidos.
- Métricas moderadas: el F1 de 0,6181 sugiere un rendimiento limitado, posiblemente debido a un desequilibrio de clases o a un dataset pequeño.
- Longitud de contexto limitada: PhoBERT base tiene una ventana de 256 tokens, lo que restringe el uso en textos largos (aunque este dato no se confirma en la ficha).
- Sesgos potenciales: al estar entrenado sobre un corpus no especificado, puede heredar sesgos del texto vietnamita (género, etnia, etc.).
- Riesgo de alucinación: al ser un modelo encoder-only de clasificación, no genera texto libre, por lo que el riesgo de alucinación es bajo, pero la clasificación errónea es posible.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación sin restricciones, siempre que se incluya el aviso de copyright.
- Adecuación para producción: sin una validación externa y con una documentación tan escasa, no se recomienda su uso en entornos críticos sin una evaluación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BonTori/phobert-eda-retrain-hsd
- Modelo base (PhoBERT): https://huggingface.co/vinai/phobert-base
- Repositorio GitHub de PhoBERT: https://github.com/VinAIResearch/PhoBERT
- Paper de PhoBERT (arXiv): https://arxiv.org/abs/1910.09700
- Variante sin EDA (phobert-baseline-retrain-hsd): https://huggingface.co/BonTori/phobert-baseline-retrain-hsd
- Variante con resultados EDA (phobert_eda_results): https://huggingface.co/BonTori/phobert_eda_results
