# Jendersen/t5-small-finetuned-bible-only-breton-plus-cy-kw

## Resumen

El modelo `Jendersen/t5-small-finetuned-bible-only-breton-plus-cy-kw` es un ajuste fino (fine-tuning) de la arquitectura T5-small, desarrollado por el usuario Jendersen, sobre un conjunto de datos bíblicos. El nombre sugiere que el entrenamiento se realizó con textos de la Biblia en bretón (br) y galés (cy), aunque la model card no especifica el idioma ni la composición del dataset. Se trata de un modelo de generación de texto (texto a texto) orientado a tareas de traducción o paráfrasis de contenido religioso, con un tamaño reducido de 60,5 millones de parámetros.

La relevancia de este modelo es limitada: es un experimento de fine-tuning sobre un corpus específico, con métricas de evaluación muy bajas (Rouge1 de 18,32 y Bleu de 0,0058), lo que indica una calidad de generación deficiente. No obstante, puede servir como referencia para estudiar el comportamiento de T5 en lenguas minoritarias o como punto de partida para mejoras. Su licencia Apache 2.0 permite uso comercial y modificación, pero su rendimiento actual lo hace inadecuado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5-small (Transformer encoder-decoder) |
| Parametros totales | 60.506.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (modelo base T5-small) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere bretón y galés, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en T5-small, una arquitectura transformer encoder-decoder con 6 capas en cada componente, 8 cabezas de atención y una dimensión oculta de 512. T5-small fue preentrenado con el objetivo de texto a texto (text-to-text), donde todas las tareas se formulan como generación de secuencias. El fine-tuning se realizó sobre un dataset bíblico (no especificado en la model card) durante 10 épocas, con un learning rate de 2e-5, batch size de 16, optimizador AdamW y precisión mixta nativa. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado estándar.

La innovación técnica se limita al propio fine-tuning; no hay cambios arquitectónicos respecto al modelo base. El dataset de entrenamiento no está documentado, pero por el nombre se infiere que contiene textos bíblicos en bretón y galés, probablemente con el objetivo de traducción o generación de contenido religioso.

## Capacidades

- Generación de texto a partir de texto (text2text-generation), principalmente orientada a tareas de traducción o paráfrasis de contenido bíblico.
- Capacidad limitada de razonamiento y comprensión, dado el tamaño reducido del modelo y las métricas de evaluación bajas.
- No se ha documentado soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- Capacidades multilingües no confirmadas; el nombre sugiere bretón y galés, pero no hay evidencia en la model card.
- No incluye capacidades especiales como modo de pensamiento, visión o audio.

## Casos de uso

- Traducción de textos bíblicos entre bretón y galés: el modelo podría emplearse para traducir pasajes bíblicos entre estas lenguas, aunque su bajo Bleu (0,0058) indica que la calidad sería muy deficiente y requeriría revisión humana exhaustiva.
- Generación de paráfrasis de versículos bíblicos: podría intentar reformular pasajes, pero la baja Rouge1 (18,32) sugiere que las salidas serían poco fieles al contenido original.
- Investigación académica sobre fine-tuning de T5 en lenguas minoritarias: sirve como caso de estudio para analizar el comportamiento de modelos pequeños en corpus específicos y la influencia de los hiperparámetros.
- Prototipado de aplicaciones de procesamiento de texto religioso: para experimentos iniciales donde la calidad no sea crítica y se priorice la simplicidad del modelo.
- Benchmarking de métricas de evaluación (Rouge, Bleu, Chrf++) en tareas de traducción bíblica: permite comparar el rendimiento de diferentes configuraciones de entrenamiento.
- Educación y demostración de fine-tuning con Hugging Face Trainer: útil para aprender a ajustar modelos T5 con datasets personalizados, aunque los resultados no sean óptimos.

## Benchmarks y rendimiento

Los resultados de evaluación declarados por el autor en la model card son los siguientes (última época):

| Metrica | Valor |
|---|---|
| Loss | 2,2640 |
| Rouge1 | 18,3215 |
| Rouge2 | 4,7938 |
| Rougel | 16,2067 |
| Rougelsum | 16,5172 |
| Bleu | 0,0058 |
| Chrf++ | 8,0062 |
| F1 | 25,2123 |
| Gen Len | 18,9756 |

La tabla de entrenamiento muestra una mejora progresiva desde la época 1 hasta la 10, pero los valores finales siguen siendo muy bajos, especialmente Bleu (0,0058), lo que indica una calidad de traducción casi nula. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 60,5 millones de parámetros, lo que equivale a aproximadamente 242 MB en precisión fp32 (4 bytes por parámetro). Con cuantización a int8, podría reducirse a unos 60 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo tarjetas consumer como GTX 1050 Ti, RTX 2060 o superiores. También es viable en CPU.
- Cabe en GPUs consumer de gama baja y en sistemas sin GPU, gracias a su pequeño tamaño.
- Opciones de despliegue: compatible con Hugging Face Transformers, puede servirse con vLLM, TGI, o ejecutarse localmente con llama.cpp (aunque T5 no es el formato óptimo para llama.cpp). También se puede usar con Ollama si se convierte a GGUF, aunque no es habitual.
- Latencia y throughput: al ser un modelo pequeño, la inferencia es rápida; en una GPU moderna (RTX 3090) puede procesar cientos de secuencias por segundo, aunque no se han publicado mediciones específicas.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos en la información proporcionada. Como referencia cualitativa, se puede comparar con el modelo base T5-small (sin fine-tuning) y con T5-base (220M parámetros). T5-base tendría mayor capacidad de generación, pero también mayor coste computacional. No hay modelos comparables específicos para bretón o galés documentados en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| t5-small (base) | 60M | 512 | Apache 2.0 | Modelo original sin fine-tuning |
| t5-base | 220M | 512 | Apache 2.0 | Mayor capacidad, más recursos |
| Este modelo | 60M | 512 | Apache 2.0 | Fine-tuning bíblico, bajo rendimiento |

## Limitaciones y advertencias

- Rendimiento muy bajo: las métricas (Bleu 0,0058, Rouge1 18,32) indican que el modelo no es útil para tareas de traducción o generación de calidad aceptable.
- Sesgos religiosos: al estar entrenado exclusivamente con textos bíblicos, el modelo solo conoce vocabulario y estructuras de ese dominio, lo que limita su uso general.
- Riesgo de alucinación: al ser un modelo pequeño y con datos limitados, es probable que genere contenido inventado o incoherente, especialmente fuera del contexto bíblico.
- Idiomas no confirmados: aunque el nombre sugiere bretón y galés, no hay documentación que verifique los idiomas soportados ni la calidad en cada uno.
- Contexto limitado: 512 tokens, insuficiente para documentos largos.
- Sin soporte para tool calling ni agentes: no es adecuado para integraciones complejas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está listo para producción debido a su baja calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jendersen/t5-small-finetuned-bible-only-breton-plus-cy-kw
- Modelo base T5-small: https://huggingface.co/t5-small
- Documentación de T5 en Transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/t5.md
- Trackio (visualización): https://huggingface.co/spaces/Jendersen/huggingface-static-9cff83
