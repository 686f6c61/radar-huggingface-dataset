# Priyank1602/moodmax-emotion-distilbert

## Resumen

MoodMax es un modelo de clasificación de emociones multilingüe desarrollado por el usuario Priyank1602. Se trata de un fine-tuning de `distilbert-base-multilingual-cased` sobre el dataset GoEmotions de Google Research, cuyas 28 etiquetas originales se han colapsado en las 7 clases estándar del modelo de Ekman: joy, sadness, anger, fear, surprise, disgust y neutral. El modelo está publicado con licencia MIT y orientado a tareas de análisis de sentimiento y detección de emociones en texto.

Con 135.330.055 parámetros, es un modelo compacto pensado para inferencia eficiente en entornos con recursos limitados. Incorpora dos técnicas de post-procesado destacables: calibración de temperatura (T = 1.1724) y umbrales de decisión óptimos por clase, lo que mejora la fiabilidad de las probabilidades de salida frente a un fine-tuning convencional.

El modelo declara soporte para inglés, hindi, español y francés, además de una etiqueta genérica "multilingual" heredada del modelo base. Es relevante para proyectos que necesitan clasificación emocional ligera, desplegable en CPU o GPU de consumo, con una licencia permisiva y sin dependencias de APIs externas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT) |
| Parámetros totales | 135.330.055 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base admite 512 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización dinámica vía PyTorch/ONNX) |
| Idiomas soportados | multilingual, en, hi, es, fr |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-multilingual-cased`, un transformer encoder de tipo BERT destilado que reduce el número de capas respecto a BERT-base manteniendo la representación multilingüe. Sobre esta base se realizó un fine-tuning supervisado para clasificación multi-etiqueta de emociones, usando el dataset GoEmotions de Google Research, cuyas 28 categorías originales se colapsaron en 7 clases de Ekman (joy, sadness, anger, fear, surprise, disgust, neutral).

Como innovación técnica destacable, el autor aplica calibración de temperatura con T = 1.1724 sobre las salidas sigmoidales y ajusta umbrales de decisión óptimos por clase. Esto reduce el error de calibración (ECE del 4,54%) y permite umbrales específicos por emoción, algo relevante en clasificación multi-etiqueta donde las clases están desbalanceadas. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables habitualmente a este tipo de clasificador).

## Capacidades

- Clasificación de emociones multi-etiqueta en 7 clases (joy, sadness, anger, fear, surprise, disgust, neutral).
- Análisis de sentimiento derivado de las probabilidades emocionales.
- Soporte multilingüe declarado para inglés, hindi, español y francés, además de la cobertura multilingüe del modelo base.
- Salida con probabilidades calibradas por temperatura, útil para umbrales y decisiones automatizadas.
- Umbrales de decisión por clase preajustados, lo que facilita su uso directo sin post-procesado adicional.
- Integración directa con la pipeline `text-classification` de Hugging Face Transformers.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Moderación de comunidades y redes sociales: clasificar comentarios en tiempo real por emoción (ira, disgusto) para priorizar revisiones humanas o activar filtros automáticos, aprovechando la baja latencia de un modelo de 135M de parámetros.
- Análisis de opiniones de clientes multilingües: procesar reseñas en inglés, español, francés e hindi y agregar la distribución emocional por producto o región, usando las probabilidades calibradas para umbrales consistentes.
- Enrutamiento inteligente de tickets de soporte: detectar frustración o ira en el mensaje inicial y escalar automáticamente al equipo adecuado, con umbrales por clase ya ajustados.
- Monitorización de sentimiento en encuestas internas: clasificar respuestas abiertas de empleados y detectar tendencias de estrés o insatisfacción a lo largo del tiempo.
- Análisis de conversaciones de atención al cliente: etiquetar cada turno de un chat con su emoción dominante para generar informes de calidad y detectar puntos de fricción.
- Investigación en psicolingüística y ciencias sociales: anotación automática de corpus con las 7 emociones de Ekman, sirviendo como pre-etiquetado para revisión humana.
- Filtrado previo en pipelines de datos: descartar o marcar contenido con alta carga emocional negativa antes de pasarlo a modelos generativos o de resumen.

## Benchmarks y rendimiento

Evaluado sobre el split de test de GoEmotions (5.427 comentarios):

| Métrica | Valor |
|---|---|
| Macro-F1 | 60,25% |
| Micro-F1 | 67,29% |
| Macro-Precision | 57,52% |
| Sigmoid ECE (calibración) | 4,54% |

No se han publicado en la información disponible comparativas con otros modelos sobre el mismo split.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 540 MB de pesos (135M parámetros × 4 bytes), más overhead de activaciones; en la práctica, menos de 1 GB.
- VRAM estimada en FP16: aproximadamente 270 MB de pesos.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, GTX 1660, e incluso en CPU para lotes pequeños.
- Despliegue recomendado vía `transformers` pipeline, ONNX Runtime, o exportación a TorchScript para producción.
- También es viable servirlo con Text Embeddings Inference (TEI) o con un servidor FastAPI propio; no requiere vLLM ni llama.cpp al no ser un modelo generativo.
- Throughput estimado: cientos a miles de predicciones por segundo en GPU moderna con batching; decenas por segundo en CPU según hardware. No se dispone de cifras oficiales publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Tarea |
|---|---|---|---|---|---|
| MoodMax (este modelo) | 135M | no disponible (base: 512) | en, hi, es, fr, multilingual | MIT | Emoción (7 clases) |
| `bhadresh-savani/distilbert-base-uncased-emotion` | ~67M | 512 | en | Apache 2.0 | Emoción (6 clases) |
| `j-hartmann/emotion-english-distilroberta-base` | ~82M | 512 | en | MIT | Emoción (7 clases) |
| `cardiffnlp/twitter-roberta-base-sentiment-latest` | ~125M | 512 | en | MIT | Sentimiento (3 clases) |

La principal ventaja diferencial de MoodMax frente a las alternativas es su cobertura multilingüe (incluyendo hindi) y la calibración explícita de probabilidades. Frente a los modelos ingleses especializados, ofrece menor rendimiento potencial en inglés puro pero mayor aplicabilidad en entornos multilingües.

## Limitaciones y advertencias

- El modelo se entrena sobre GoEmotions, un corpus de comentarios de Reddit; puede presentar sesgos hacia el registro informal y el inglés estadounidense.
- El Macro-F1 del 60,25% indica margen de mejora, especialmente en clases minoritarias como fear o disgust, propensas a confundirse con neutral.
- La cobertura declarada de hindi, español y francés depende del multilingüismo del modelo base; no hay evaluación publicada por idioma, por lo que el rendimiento fuera del inglés no está verificado.
- Riesgo de alucinación no aplicable al ser un clasificador, pero sí de falsos positivos/negativos en la asignación de emociones, especialmente en textos irónicos o ambiguos.
- El modelo no modela emociones mixtas complejas más allá de las 7 clases de Ekman; emociones como orgullo, vergüenza o culpa quedan fuera.
- Licencia MIT permite uso comercial sin restricciones, pero conviene citar el modelo y verificar la licencia del dataset GoEmotions para usos derivados.
- El repositorio tiene muy pocas descargas (31) y un solo like; no hay validación comunitaria amplia ni auditorías independientes.
- No se documenta la longitud máxima de entrada efectiva ni el comportamiento con textos largos; se asume el límite de 512 tokens del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Priyank1602/moodmax-emotion-distilbert
- Dataset GoEmotions (Google Research): https://github.com/google-research/google-research/tree/master/goemotions
- Paper GoEmotions: https://arxiv.org/abs/2005.00547
- Modelo base DistilBERT multilingüe: https://huggingface.co/distilbert-base-multilingual-cased
- Documentación de pipelines de Transformers: https://huggingface.co/docs/transformers/main_classes/pipelines
