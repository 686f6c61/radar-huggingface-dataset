# corpv/indobert-sentiment-govtech-lora

## Resumen

El modelo `corpv/indobert-sentiment-govtech-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `indobenchmark/indobert-base-p1` para realizar clasificación de sentimiento en textos en indonesio, específicamente en reseñas de aplicaciones de servicios públicos. Desarrollado por el usuario corpv, el adaptador añade un cabezal de clasificación de tres clases (positivo, neutral, negativo) y se ha ajustado con un conjunto de datos de 2.399 reseñas de Google Play procedentes de cuatro aplicaciones gubernamentales indonesias (JAKI, SatuSehat, BPJS Kesehatan y BPJSTKU).

La relevancia de este modelo radica en su enfoque eficiente: en lugar de ajustar todos los parámetros del modelo BERT, se emplea LoRA con rango 8 y alpha 16, lo que reduce drásticamente el número de parámetros entrenables y el coste computacional. El adaptador se distribuye como un repositorio de tamaño 0.0 GB (solo los pesos del adaptador en formato safetensors) y está pensado para ser cargado junto con el modelo base mediante la librería PEFT de Hugging Face.

Se trata de un modelo de nicho, orientado a un dominio concreto (apps de servicios públicos indonesias) y a un idioma específico (indonesio). Su rendimiento, aunque modesto (accuracy 0.617 en test), supera claramente a la línea base de mayoría (0.400), lo que lo convierte en una opción práctica para tareas de análisis de sentimiento en ese ámbito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre IndoBERT base (BERT encoder) |
| Parametros totales | no disponible (adaptador LoRA con r=8, alpha=16, dropout=0.1) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors del adaptador) |
| Idiomas soportados | indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT (encoder transformer) del checkpoint `indobenchmark/indobert-base-p1`. Sobre esta base se aplica la técnica de adaptación de bajo rango (LoRA) que congela los pesos originales e inserta matrices de baja dimensión en las capas de atención, concretamente en los módulos `query` y `value`, con rango r=8, alpha=16 y dropout de 0.1. Esta estrategia reduce significativamente el número de parámetros entrenables y el coste de cómputo, manteniendo un rendimiento competitivo.

El entrenamiento se realizó sobre un conjunto de 2.399 reseñas de Google Play de cuatro aplicaciones de servicios públicos indonesias. Las etiquetas se generaron automáticamente a partir del rating de estrellas: 1-2 estrellas se asignaron a la clase negativa, 3 a neutral y 4-5 a positiva. La distribución resultante fue de 960 muestras positivas, 959 negativas y 480 neutrales, con una partición 80/10/10 para entrenamiento, validación y prueba. No se menciona el uso de técnicas como RLHF o DPO; el ajuste es puramente supervisado.

## Capacidades

- Clasificación de sentimiento en tres clases (positivo, neutral, negativo) para textos en indonesio.
- Especializado en el dominio de reseñas de aplicaciones de servicios públicos indonesias (JAKI, SatuSehat, BPJS Kesehatan, BPJSTKU).
- Capacidad de integración sencilla con el ecosistema Hugging Face mediante `PeftModel` y `AutoModelForSequenceClassification`.
- Inferencia ligera gracias al adaptador LoRA, que añade pocos parámetros al modelo base.
- No soporta generación de texto, razonamiento, código, visión ni tool calling; es exclusivamente un clasificador de secuencias.

## Casos de uso

- Analisis de opiniones en tiendas de aplicaciones: el modelo puede clasificar automáticamente las reseñas de apps gubernamentales en positivas, neutrales o negativas, permitiendo a los equipos de producto identificar rápidamente problemas recurrentes y valorar la percepción pública.
- Monitorizacion de redes sociales y comentarios: se puede emplear para analizar menciones de servicios públicos en Twitter, Facebook o foros, ayudando a detectar crisis de reputación o tendencias de satisfacción.
- Priorizacion de quejas en atencion al cliente: al clasificar la polaridad de los mensajes entrantes, se pueden enrutar las quejas más negativas a agentes especializados, mejorando los tiempos de respuesta y la satisfacción del usuario.
- Medición de satisfaccion del usuario en tiempo real: integrado en un pipeline de análisis, permite calcular índices de sentimiento agregados por semana o mes, sirviendo como indicador de calidad del servicio.
- Filtrado de reseñas para soporte: el modelo puede filtrar automáticamente reseñas negativas para que el equipo de soporte las aborde, mientras que las positivas se ignoran o se utilizan para métricas internas.
- Estudio comparativo entre aplicaciones: al aplicar el modelo sobre reseñas de diferentes apps de servicios públicos, se pueden comparar niveles de satisfacción y detectar qué aspectos (funcionalidad, usabilidad, rendimiento) generan más frustración.

## Benchmarks y rendimiento

La model card del autor reporta los siguientes resultados sobre el conjunto de prueba (240 muestras), comparados con una línea base de mayoría (predecir siempre la clase más frecuente):

| Metrica | Baseline (mayoria) | Modelo LoRA |
|---|---|---|
| Accuracy | 0.400 | **0.617** |
| F1-macro | 0.190 | **0.469** |

No se han publicado resultados adicionales en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no está diseñado para esas tareas.

## Requisitos de hardware

- Al tratarse de un adaptador LoRA, la inferencia requiere cargar el modelo base `indobenchmark/indobert-base-p1` (aproximadamente 125M de parámetros, aunque no se especifica en la documentación del adaptador) más los pesos del adaptador.
- Con el modelo base en precisión FP16, se estima un consumo de VRAM inferior a 1 GB, por lo que es ejecutable en GPUs de consumo como NVIDIA GTX 1060, RTX 2060 o superiores, e incluso en CPU con memoria RAM suficiente.
- No se proporcionan datos de latencia o throughput, pero al ser un modelo BERT base, la inferencia es rápida (del orden de milisegundos por frase en GPU).
- Opciones de despliegue: se puede servir con Hugging Face Transformers, PEFT, y en frameworks como vLLM o TGI (aunque estos están más orientados a modelos generativos, es posible usarlos para clasificación). También es compatible con Ollama si se convierte a GGUF, aunque no se ha documentado ese proceso.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para análisis de sentimiento indonesio con LoRA. Existen otros adaptadores similares en Hugging Face (por ejemplo, `1337strike/indonesian-sentiment-analysis-lora`), pero no se han encontrado datos de rendimiento comparables en la información disponible. Se recomienda consultar el leaderboard de IndoNLU para modelos de clasificación de sentimiento en indonesio, aunque no se ha accedido a él en esta búsqueda.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento se generaron a partir del rating de estrellas, no mediante anotación humana, por lo que pueden contener ruido y errores (por ejemplo, una reseña con 4 estrellas pero texto crítico).
- El rendimiento en la clase neutral es notablemente bajo (recall reducido), debido a la menor cantidad de muestras y a la ambigüedad inherente de esa categoría.
- El modelo está entrenado exclusivamente con reseñas de aplicaciones de servicios públicos indonesias; su capacidad de generalización a otros dominios (comercio electrónico, medios, etc.) es limitada.
- Solo soporta el idioma indonesio; no es aplicable a otros idiomas sin reentrenamiento.
- La licencia del adaptador es Apache 2.0, pero el modelo base `indobenchmark/indobert-base-p1` tiene licencia MIT, por lo que el uso comercial es permitido en ambos casos, aunque se debe verificar el cumplimiento de las atribuciones correspondientes.
- Al ser un adaptador pequeño, no se han realizado pruebas de robustez frente a ataques adversariales o textos fuera de dominio.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/corpv/indobert-sentiment-govtech-lora
- Modelo base IndoBERT: https://huggingface.co/indobenchmark/indobert-base-p1
- Repositorio de IndoBERT (IndoLEM): https://github.com/indolem
- Página del proyecto IndoBERT: https://indolem.github.io/IndoBERT/
- Paper de IndoBERT (arXiv): https://arxiv.org/abs/2009.05387
