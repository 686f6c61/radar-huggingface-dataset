# Islamamro/yelp-sentiment-aurora-islamamro

## Resumen

El modelo `Islamamro/yelp-sentiment-aurora-islamamro` es un clasificador de texto de cinco clases (1 a 5 estrellas) entrenado sobre reseñas de Yelp. Se trata de un ajuste fino (_fine-tuning_) del modelo `distilbert-base-uncased` sobre el dataset `SetFit/yelp_review_full`. El autor, Islamamro, lo ha publicado como demostración del flujo de trabajo del **Aurora Research Portal**, una plataforma que permite construir, entrenar y publicar modelos de forma integrada. El entrenamiento se realizó en una NVIDIA RTX 3090.

El modelo tiene 66,9 millones de parámetros, lo que corresponde a la arquitectura DistilBERT (una versión destilada de BERT con 6 capas, 768 dimensiones ocultas y 12 cabezas de atención). Su licencia es Apache-2.0 y los pesos están en formato safetensors. Es importante señalar que, según la model card, fue entrenado únicamente con un subconjunto de 1.400 ejemplos, por lo que su rendimiento es limitado (accuracy de 0,48 en datos reservados) y no está pensado para uso en producción sin un reentrenamiento con el dataset completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, 6 capas, 768 hidden, 12 heads) |
| Parametros totales | 66.957.317 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de DistilBERT) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | inglés (modelo base entrenado en inglés; no se especifican otros) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, una versión destilada de BERT que conserva el 97% de su rendimiento con un 40% menos de parámetros. La arquitectura es un transformer encoder con 6 capas, 12 cabezas de atención y 768 dimensiones ocultas, con una longitud máxima de secuencia de 512 tokens. La capa de clasificación añade una salida lineal de 5 clases (estrellas 1 a 5).

El entrenamiento se realizó sobre el dataset `SetFit/yelp_review_full`, que contiene reseñas de Yelp con etiquetas de 1 a 5 estrellas. Sin embargo, la model card indica que solo se usó un subconjunto de 1.400 ejemplos, lo que explica la baja accuracy (0,48) en el conjunto de validación. No se menciona el uso de técnicas como RLHF o DPO; se trata de un ajuste fino supervisado estándar. El entrenamiento se ejecutó en una NVIDIA RTX 3090 a través del Aurora Research Portal, que automatiza el ciclo de construcción, entrenamiento y publicación.

## Capacidades

- Clasificación de sentimiento en escala de 1 a 5 estrellas a partir de texto de reseñas.
- Generación de una puntuación de confianza por clase (salida softmax).
- Procesamiento de texto en inglés (limitado por el modelo base).
- Integración sencilla con la API `pipeline` de Transformers.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- No dispone de modo de pensamiento (_thinking mode_) ni generación de texto libre; es exclusivamente un clasificador.

## Casos de uso

- Análisis de opiniones de clientes en plataformas de reseñas: el modelo puede asignar una puntuación de 1 a 5 a cada reseña, permitiendo agregar métricas de satisfacción por producto o establecimiento.
- Monitorización de reputación de marca: integrarlo en un pipeline que procese reseñas entrantes y detecte cambios en la distribución de estrellas a lo largo del tiempo.
- Filtrado de reseñas de baja calidad: identificar reseñas con puntuación baja para priorizar su revisión manual por parte del equipo de atención al cliente.
- Entrenamiento de modelos más grandes: servir como punto de partida o como modelo de referencia para comparar con clasificadores más complejos.
- Demostración de flujo MLOps: dado que fue creado para validar el pipeline Aurora, puede usarse como ejemplo didáctico de fine-tuning y despliegue.
- Prototipado rápido de clasificación de sentimiento: gracias a su pequeño tamaño, puede ejecutarse en CPU y en entornos con recursos limitados para pruebas de concepto.

## Benchmarks y rendimiento

La model card reporta una accuracy de 0,48 en un conjunto de validación reservado. No se proporcionan otros benchmarks (MMLU, HumanEval, etc.) porque el modelo es un clasificador de sentimiento, no un modelo de lenguaje general. No se dispone de comparaciones con otros modelos en la información publicada.

| Metrica | Valor |
|---|---|
| Accuracy (held-out) | 0,48 |

Este valor es bajo, coherente con el entrenamiento sobre solo 1.400 ejemplos. Para una comparativa justa con otros clasificadores de sentimiento (p. ej., fine-tunes de BERT o RoBERTa sobre Yelp), se necesitarían datos de evaluación adicionales que no están disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (el modelo pesa ~268 MB en safetensors). Con cuantización a int8, podría bajar a ~70 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluidas GTX 1050 Ti, RTX 2060, RTX 3090, etc. También funciona en CPU.
- Cabe en GPUs de consumo: sí, incluso en tarjetas integradas o en CPU con latencia aceptable (inferencia de una frase en ~10-50 ms en CPU moderna).
- Opciones de despliegue: Transformers (Python), ONNX Runtime, TensorFlow Lite, o servidores de inferencia como vLLM (aunque es un modelo pequeño, vLLM no es necesario; se puede usar FastAPI con Transformers).
- Latencia y throughput estimados: en una RTX 3090, se pueden procesar miles de inferencias por segundo; en CPU, cientos por segundo. No hay datos oficiales publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (Yelp) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Islamamro/yelp-sentiment-aurora-islamamro | 66,9 M | 512 | 0,48 (subconjunto) | Apache-2.0 | HuggingFace |
| DistilBERT base (sin fine-tune) | 66,9 M | 512 | no aplica | Apache-2.0 | HuggingFace |
| BERT base (fine-tune típico) | 110 M | 512 | ~0,60-0,65 (con dataset completo) | Apache-2.0 | HuggingFace |
| RoBERTa base (fine-tune típico) | 125 M | 512 | ~0,65-0,70 (con dataset completo) | MIT | HuggingFace |

Los valores de accuracy para BERT/RoBERTa son estimaciones típicas en tareas de clasificación de sentimiento de Yelp con entrenamiento completo; no se han verificado con este modelo concreto. La comparativa es orientativa.

## Limitaciones y advertencias

- Entrenado con solo 1.400 ejemplos, lo que provoca una accuracy baja (0,48) y un alto riesgo de sobreajuste o generalización deficiente.
- No apto para uso en producción sin reentrenar con el dataset completo (`SetFit/yelp_review_full` tiene 65.000 ejemplos de entrenamiento).
- Sesgos potenciales derivados del dataset de Yelp: las reseñas pueden contener lenguaje coloquial, sarcasmo o jerga local que el modelo puede no capturar correctamente.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede asignar etiquetas incorrectas con alta confianza en entradas fuera de distribución.
- Limitación de idioma: solo inglés (modelo base `uncased`).
- La licencia Apache-2.0 permite uso comercial, pero el autor advierte explícitamente que no es un modelo de producción.
- No se proporcionan detalles sobre el proceso de entrenamiento (épocas, tasa de aprendizaje, partición de datos) más allá de lo indicado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Islamamro/yelp-sentiment-aurora-islamamro
- Dataset de entrenamiento: https://huggingface.co/datasets/SetFit/yelp_review_full
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Aurora Research Portal: no se ha encontrado un enlace oficial en la información proporcionada.
