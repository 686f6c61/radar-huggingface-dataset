# AlexStamp/roberta-base-lora-yelp-ratings

## Resumen

`roberta-base-lora-yelp-ratings` es un adaptador de Low-Rank Adaptation (LoRA) entrenado sobre el modelo base `FacebookAI/roberta-base` para clasificar reseñas de Yelp en cinco categorías ordinales (de 1 a 5 estrellas). El adaptador fue desarrollado por AlexStamp como experimento para evaluar si el ajuste fino por parámetros eficientes (PEFT) puede igualar el rendimiento del ajuste fino completo de todos los parámetros del modelo, actualizando menos del 1% de la red. El objetivo principal es la clasificación de texto multi-clase para análisis de sentimiento de reseñas de clientes.

El modelo utiliza la arquitectura transformer encoder de RoBERTa-base, con 125 millones de parámetros en el modelo base y un adaptador LoRA de aproximadamente 887.813 parámetros entrenables (0,7% del total). La ventana de contexto es de 512 tokens, y el modelo está entrenado exclusivamente en inglés. Su relevancia radica en demostrar que las técnicas PEFT pueden alcanzar resultados comparables al fine-tuning completo con una fracción mínima de recursos computacionales y de almacenamiento, facilitando el despliegue en entornos con limitaciones de hardware.

El adaptador se publica bajo licencia MIT y se distribuye en formato safetensors dentro del framework PEFT, lo que permite su integración sencilla en pipelines de Hugging Face Transformers. Aunque el modelo no presenta resultados oficiales de benchmarks en su model-index, la model card del autor declara métricas de validación y test que se detallan en la sección correspondiente de esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) con adaptador LoRA |
| Parámetros totales | 125.000.000 (base) + 887.813 (adaptador) ≈ 125.887.813 |
| Parámetros activos | 887.813 (solo adaptador LoRA; el resto congelado) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | No disponible (pesos en safetensors; entrenamiento en FP16) |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo se basa en `FacebookAI/roberta-base`, un transformer encoder de 12 capas con 125 millones de parámetros. Sobre esta arquitectura se insertan matrices de bajo rango (LoRA) en las proyecciones de atención `query` y `value`, con rango `r=8`, alpha `α=16` y dropout `0.1`. La capa de clasificación se mantiene como módulo entrenable (`modules_to_save=["classifier"]`), mientras que el resto de los pesos del modelo base se congelan. El adaptador se entrena con el framework PEFT y la biblioteca Transformers de Hugging Face.

El entrenamiento se realizó sobre un subconjunto de 10.000 reseñas del dataset `yelp_review_full`, con división estratificada en 8.000 ejemplos para entrenamiento, 1.000 para validación y 1.000 para test. Se utilizó el optimizador AdamW con una tasa de aprendizaje de `3e-4`, mayor que la típica del fine-tuning completo (`2e-5`), para compensar el espacio de parámetros reducido. Se entrenó durante 3 épocas con batch size de 16, precisión FP16, weight decay de 0.01 y seed 42, en una GPU NVIDIA T4. La selección del modelo se basó en el mejor macro-F1 de validación.

## Capacidades

- Clasificación de reseñas de texto en 5 clases ordinales (1 a 5 estrellas), permitiendo análisis de sentimiento granular.
- Generación de predicciones de rating a partir de texto libre en inglés, con una precisión de off-by-1 de aproximadamente 0.98 en el conjunto de test.
- Integración con el ecosistema de Hugging Face Transformers, compatible con pipelines de `text-classification`.
- Soporte de inferencia eficiente gracias al adaptador LoRA, que reduce el almacenamiento a menos de 5 MB y permite cargar el modelo base de forma estándar.
- Capacidad de ajuste fino adicional en dominios específicos si se dispone de datos etiquetados (por ejemplo, reseñas de restaurantes, hoteles, etc.).
- Funciona como modelo de clasificación multi-clase, no como generador de texto; no soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- **Análisis de satisfacción de clientes**: el modelo puede clasificar reseñas de productos o servicios en una escala de 1 a 5 estrellas, permitiendo a empresas monitorizar la percepción de su marca a partir de comentarios de usuarios en plataformas como Yelp, Google Maps o redes sociales.
- **Automatización de sistemas de reputación**: integrado en un pipeline de procesamiento de lenguaje natural, puede etiquetar automáticamente miles de reseñas para generar informes agregados de satisfacción, sin intervención manual.
- **Filtrado y priorización de reseñas**: en plataformas de comercio electrónico o agregadores de opiniones, el modelo puede identificar reseñas extremadamente negativas (1-2 estrellas) para priorizar la atención al cliente o la moderación.
- **Entrenamiento de modelos de recomendación**: las predicciones de rating pueden usarse como características adicionales en sistemas de recomendación de restaurantes, hoteles o servicios, mejorando la personalización basada en sentimiento.
- **Evaluación de políticas de calidad**: en entornos de control de calidad, el modelo puede cuantificar el impacto de cambios en el servicio a partir del análisis de reseñas históricas, usando las predicciones como métrica de evolución.
- **Demostración de PEFT en producción**: sirve como ejemplo práctico de cómo desplegar un clasificador de sentimiento con bajo coste computacional, adecuado para entornos con GPU limitadas o inferencia en CPU.

## Benchmarks y rendimiento

No se han publicado resultados oficiales de benchmarks en el modelo-index. Sin embargo, la model card del autor declara los siguientes resultados de validación y comparación con fine-tuning completo:

| Estrategia de fine-tuning | Parámetros entrenables | Macro F1 (test) | Off-by-1 accuracy (test) |
|---|---|---|---|
| **Full Fine-Tuning** | 125.533.445 (100%) | 0.631 | 0.980 |
| **LoRA PEFT (este modelo)** | **887.813 (~0.7%)** | **0.633** | **0.982** |

Resultados de validación durante el entrenamiento (última época):

| Training Loss | Validation Loss | Accuracy | F1 Macro | Precision Macro | Recall Macro | MAE |
|---|---|---|---|---|---|---|
| 0.7616 | 0.7786 | 0.663 | 0.6279 | 0.6341 | 0.6311 | 0.368 |

Estos datos son declarados por el autor y no se han verificado de forma independiente. No se dispone de resultados adicionales como ROC-AUC o RMSE en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada**: el modelo base `roberta-base` en FP16 requiere aproximadamente 250 MB de VRAM. El adaptador LoRA añade menos de 5 MB, por lo que el total ronda los 300-400 MB en inferencia.
- **GPU recomendada**: una NVIDIA T4 (usada en el entrenamiento) es suficiente; también funciona en GPUs de consumo como GTX 1080, RTX 2060 o superiores. Para inferencia en CPU, el modelo puede ejecutarse en memoria RAM sin problema.
- **Compatibilidad con GPU de consumo**: sí, cabe en cualquier GPU con al menos 4 GB de VRAM, incluyendo tarjetas de gama media.
- **Opciones de despliegue**: se puede servir con `vLLM` (aunque es un modelo de encoder, no es óptimo para generación), `llama.cpp` no es aplicable directamente; la vía más común es usar la clase `AutoModelForSequenceClassification` de Transformers, o el pipeline de Hugging Face. También se puede exportar a ONNX para optimización.
- **Latencia y throughput**: no hay datos medidos por el autor, pero en una T4 se espera una inferencia de unos pocos milisegundos por ejemplo (típico de modelos de 125M). El adaptador LoRA no añade sobrecoste significativo.

## Comparativa con modelos similares

| Modelo | Parámetros entrenables | Contexto | Precisión (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **roberta-base-lora-yelp-ratings (este modelo)** | 887.813 (0.7%) | 512 tokens | Macro F1: 0.633, Off-by-1: 0.982 | MIT | Hugging Face |
| `AlexStamp/roberta-base-finetuned-yelp-ratings` (full fine-tuning) | 125.533.445 (100%) | 512 tokens | Macro F1: 0.631, Off-by-1: 0.980 | MIT | Hugging Face |
| `VictorSanh/roberta-base-finetuned-yelp-polarity` | 125M (full) | 512 tokens | 98.08% accuracy (binario) | MIT | Hugging Face |

La comparativa muestra que el adaptador LoRA iguala o supera ligeramente al fine-tuning completo en la misma tarea, con una reducción de 99% en el número de parámetros entrenables. El modelo de Victor Sanh se centra en clasificación binaria (positivo/negativo), por lo que no es directamente comparable en métricas de clasificación multi-clase.

## Limitaciones y advertencias

- **Conjunto de datos reducido**: el modelo se entrenó con solo 10.000 reseñas (frente a las ~230.000 disponibles), lo que limita su generalización a dominios fuera de Yelp o a variaciones de lenguaje no representadas en el subconjunto.
- **Idioma**: solo funciona en inglés; no se ha evaluado en otros idiomas, por lo que su uso en español u otros lenguajes no es recomendable sin un reentrenamiento.
- **Sesgos**: el dataset de Yelp puede contener sesgos de género, raza o ubicación geográfica, que el modelo podría amplificar en sus predicciones.
- **Riesgo de alucinación**: aunque es un clasificador y no genera texto, puede asignar etiquetas incorrectas a reseñas ambiguas, especialmente con frases sarcásticas o irónicas, que no se ven bien reflejadas en el entrenamiento.
- **Licencia**: aunque la licencia MIT permite uso comercial, el modelo base `roberta-base` está bajo licencia MIT también, por lo que no hay restricciones adicionales.
- **Caveat de producción**: el modelo no ha sido evaluado en un entorno de producción real, y no se han publicado métricas de robustez ante ataques adversariales o datos desbalanceados.

## Enlaces

- [HuggingFace - modelo de adaptador LoRA](https://huggingface.co/AlexStamp/roberta-base-lora-yelp-ratings)
- [HuggingFace - modelo base](https://huggingface.co/FacebookAI/roberta-base)
- [HuggingFace - modelo de fine-tuning completo (mismo autor)](https://huggingface.co/AlexStamp/roberta-base-finetuned-yelp-ratings)
- [HuggingFace - modelo de polaridad de Yelp (binario)](https://huggingface.co/VictorSanh/roberta-base-finetuned-yelp-polarity)
- [Dataset de Yelp de RecSys2013 en Kaggle](https://www.kaggle.com/competitions/yelp-recsys-2013/overview)

Nota: no se encontraron papers ni repositorios de código adicionales en la búsqueda web más allá de los enlaces de HuggingFace y la competición de Kaggle.
