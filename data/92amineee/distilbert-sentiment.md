# 92amineee/distilbert-sentiment

## Resumen

`92amineee/distilbert-sentiment` es un modelo de clasificación de texto basado en `distilbert-base-uncased`, ajustado (fine-tuning) para análisis de sentimiento binario sobre el corpus `cornell-movie-review-data/rotten_tomatoes`, que contiene críticas de películas de Rotten Tomatoes etiquetadas como positivas o negativas. El desarrollador es el usuario `92amineee` y lo publicó en Hugging Face en septiembre de 2026.

El modelo tiene 66.955.010 parámetros totales, lo que lo sitúa en un rango muy ligero dentro de los transformers, y se distribuye en formato `safetensors` con un peso de 0.3 GB. Resuelve la tarea de determinar la polaridad de una reseña (POSITIVE o NEGATIVE), obteniendo una precisión de 0.8433 en el conjunto de evaluación del propio dataset. Su relevancia radica en que ofrece un punto de partida educativo y eficiente para tareas de análisis de sentimiento en entornos con recursos limitados, aunque su dominio de aplicación es estrecho: críticas de cine.

La arquitectura es la de un encoder Transformer destilado de BERT, con seis capas y dimensiones reducidas, lo que lo hace rápido en inferencia. No se indica la longitud exacta de contexto en la información proporcionada, aunque al ser una familia DistilBERT hereda el límite de 512 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT-base-uncased) |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el dataset de entrenamiento esta en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

| Dato adicional | Valor |
|---|---|
| Clases | NEGATIVE, POSITIVE |
| Dataset de entrenamiento | cornell-movie-review-data/rotten_tomatoes |
| Precisión (accuracy) | 0.8433395872420263 |
| Pérdida de evaluación | 0.42508700489997864 |
| Pipeline | text-classification |

## Arquitectura y entrenamiento

El modelo se basa en `distilbert-base-uncased`, un encoder Transformer destilado que conserva el 97 % de las capacidades de BERT con un 40 % menos de parámetros y un 60 % más de velocidad de inferencia. El proceso de entrenamiento consistió en un ajuste fino (fine-tuning) sobre el dataset `cornell-movie-review-data/rotten_tomatoes`, compuesto por reseñas de cine de Rotten Tomatoes, para clasificar cada texto en una de dos clases: POSITIVE o NEGATIVE.

Según la model card, el flujo de trabajo fue el siguiente: dataset → tokenización → fine-tuning → evaluación → publicación en el Hugging Face Hub → model card → Space. No se reporta el número total de tokens de entrenamiento, la composición exacta del dataset ni si se realizó alguna técnica de alineación como RLHF o DPO. La evaluación se hizo directamente sobre el conjunto de validación del dataset, obteniendo una precisión de 0.8433 y una pérdida de 0.425.

## Capacidades

- Clasificación de sentimiento binario: el modelo asigna una probabilidad a las clases POSITIVE y NEGATIVE para cadenas de texto.
- Funciona sobre textos cortos, como reseñas de películas, tweets o comentarios de productos, siempre que el vocabulario sea similar al del corpus de críticas de cine.
- No genera texto, ni responde a instrucciones; es un clasificador de secuencias.
- No dispone de soporte para `tool calling`, agentes ni razonamiento de varios pasos.
- No tiene capacidades multilingües documentadas; aunque el tokenizer es inglés, no se ha evaluado en otros idiomas.
- No incluye soporte para visión ni audio.
- Al ser un encoder de tipo BERT, la salida puede utilizarse como embedding de representación semántica mediante pooling, pero su pipeline principal es la clasificación.

## Casos de uso

- Análisis de sentimiento de reseñas de cine: el modelo clasifica críticas de películas como positivas o negativas, lo que permite automatizar la valoración de comentarios en plataformas de streaming o de recomendación.
- Monitorización de opiniones en redes sociales sobre estrenos de cine: se puede aplicar a tweets o comentarios cortos que hablen de películas, siempre que el estilo se acerque al de las críticas formales.
- Minería de feedback en encuestas de satisfacción: para textos cortos en inglés, el modelo puede etiquetar si el cliente está satisfecho o no.
- Filtrado de comentarios negativos en plataformas de opinión: permite detectar críticas desfavorables para priorizar su revisión o moderación.
- Herramienta educativa de fine-tuning: sirve como ejemplo práctico y completo de cómo ajustar un transformer de ligero para clasificación binaria, dado su pequeño tamaño y el flujo de MLOps documentado.
- Punto de partida para prototipos de clasificación de sentimiento: al ser muy ligero, puede desplegarse en CPUs o servidores con poca memoria, facilitando pruebas de concepto antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible, salvo los datos de evaluación sobre el propio dataset:

| Métrica | Valor |
|---|---|
| Accuracy | 0.8433 |
| Evaluation loss | 0.4251 |

No se incluyen comparaciones con otros modelos en el repositorio del autor.

## Requisitos de hardware

- El modelo tiene ~67M parámetros, por lo que en precisión FP32 ocupa aproximadamente 268 MB. En FP16 u 8 bits el tamaño se reduce a ~134 MB y ~67 MB respectivamente, aunque no se indican cuantizaciones oficiales.
- Cabe sobradamente en cualquier GPU moderna de consumo, como una RTX 3060, o incluso en aceleradores de gama baja (T4, GTX 16xx con más de 4 GB de VRAM).
- También puede ejecutarse en CPU, ya que es un modelo pequeño; la latencia será mayor que en GPU pero aceptable para uso educativo o de baja demanda.
- Opciones de despliegue: se puede cargar directamente con la librería `transformers` mediante `pipeline("text-classification")`, exportar a ONNX para CPU o integrarse en servicios como Hugging Face Inference Endpoints, vLLM o TGI. El tag `endpoints_compatible` sugiere compatibilidad con la API de Hugging Face.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| 92amineee/distilbert-sentiment | 66.955.010 | no disponible | no disponible | Hugging Face |
| distilbert-base-uncased | ~66.9M | 512 (estándar de la arquitectura) | Apache 2.0 | Hugging Face |
| DT12the/distilbert-sentiment-analysis | no disponible | no disponible | no disponible | Hugging Face |

La comparación directa es limitada porque no se dispone de los datos de rendimiento de las alternativas. `distilbert-base-uncased` es el modelo preentrenado sin ajuste, y `DT12the/distilbert-sentiment-analysis` es otro fine-tuning sobre la misma base, pero sin métricas publicadas en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo fue entrenado exclusivamente con reseñas de películas de Rotten Tomatoes, por lo que su vocabulario y juicios están sesgados hacia ese dominio. Puede fallar en tweets, reseñas de productos o textos con jerga técnica o informal.
- Riesgo de alucinación: al ser un clasificador binario no genera texto, pero puede producir clasificaciones erróneas en textos ambiguos, con sarcasmo o con negaciones complejas.
- Limitaciones de idioma: aunque los idiomas no se especifican en la model card, el dataset es inglés, por lo que el rendimiento en otros idiomas no está garantizado y probablemente sea bajo.
- Restricciones de licencia: la licencia aparece como "no disponible" en Hugging Face, lo que implica que no hay una autorización explícita para uso comercial. Cualquier uso productivo requiere verificar los términos con el autor.
- Es un modelo educativo, como advierte el propio autor; no se recomienda para producción sin una evaluación adicional en el dominio objetivo.
- La longitud de contexto no se ha publicado, y aunque la arquitectura DistilBERT suele limitarse a 512 tokens, este modelo no lo especifica formalmente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/92amineee/distilbert-sentiment
- Modelo base distilbert-base-uncased: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT: https://arxiv.org/abs/1910.01108
- Artículo en IEEE Xplore sobre análisis de sentimiento con DistilBERT: https://ieeexplore.ieee.org/document/10420272
