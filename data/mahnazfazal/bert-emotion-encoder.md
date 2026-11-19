# Mahnazfazal/bert-emotion-encoder

## Resumen

BERT Emotion Encoder es un modelo de clasificación de texto basado en `google-bert/bert-base-uncased`, ajustado por Mahnazfazal para la detección de emociones en seis clases (sadness, joy, love, anger, fear, surprise) sobre el dataset `dair-ai/emotion`. Se publica bajo licencia Apache 2.0 y está pensado exclusivamente para inglés.

El modelo es un encoder transformer de 109.486.854 parámetros (aproximadamente 109,5 M), con la arquitectura estándar de BERT-base: 12 capas, 768 dimensiones ocultas y 12 cabezas de atención. La longitud máxima de contexto no se especifica en la información disponible, aunque por herencia de BERT-base suele ser de 512 tokens; este dato no está confirmado en la model card.

Su relevancia es limitada: se trata de un ajuste fino estándar sin innovaciones técnicas destacables, con cero descargas y cero likes en el momento de la consulta, y sin documentación sobre el proceso de entrenamiento más allá de dos épocas y una tasa de aprendizaje de 2e-5. Es útil como referencia de un clasificador de emociones ligero y desplegable en CPU, pero no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT-base) |
| Parametros totales | 109.486.854 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-base, sin confirmar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder-only con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, preentrenado con objetivos de masked language modeling y next sentence prediction. Sobre esa base se añade una cabeza de clasificación de secuencias con seis etiquetas de salida.

El ajuste fino se realizó sobre el dataset `dair-ai/emotion` durante 2 épocas con una tasa de aprendizaje de 2e-5. La model card no detalla el tamaño del batch, el optimizador, la composición exacta del dataset ni si se aplicaron técnicas de regularización o balanceo de clases. Tampoco se documenta ningún proceso de RLHF, DPO ni innovación arquitectónica adicional (atención lineal, decodificación especulativa, etc.). La model card incluye métricas de un modelo DistilGPT2 comparativo, lo que sugiere una evaluación cruzada, pero no se explica el rol de ese modelo en el pipeline.

## Capacidades

- Clasificación de texto en seis emociones: sadness, joy, love, anger, fear y surprise.
- Generación de etiquetas de emoción a partir de texto en inglés mediante `AutoModelForSequenceClassification`.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.
- No dispone de modo de razonamiento (thinking mode), visión ni audio.

## Casos de uso

- Análisis de sentimiento emocional en redes sociales: el modelo clasifica publicaciones en inglés en una de las seis emociones, útil para monitorización de opinión pública a pequeña escala.
- Moderación de comunidades: detección de mensajes con carga emocional negativa (anger, fear, sadness) para priorizar revisión humana.
- Investigación en psicología computacional: etiquetado automático de corpus en inglés para estudios de emociones, dado su bajo coste computacional.
- Enriquecimiento de datasets: preetiquetado de grandes volúmenes de texto en inglés antes de una revisión manual, aprovechando su inferencia rápida en CPU.
- Atención al cliente: clasificación de tickets o reseñas por emoción para enrutar casos críticos a agentes especializados.
- Filtrado de contenido en pipelines de datos: descarte o marcado de textos con emociones extremas antes de alimentar modelos generativos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| BERT accuracy | 0.927 |
| BERT weighted F1 | 0.9276 |
| DistilGPT2 generated label accuracy | 0.918 |
| DistilGPT2 test loss | 1.4691 |
| DistilGPT2 test perplexity | 4.3452 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las métricas de DistilGPT2 corresponden a un modelo comparativo y no al modelo principal.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,44 GB (109,5 M parámetros × 4 bytes).
- VRAM estimada en FP16: aproximadamente 0,22 GB.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; una T4 o superior es suficiente para lotes grandes.
- Opciones de despliegue: `transformers` con PyTorch, ONNX Runtime, o exportación a GGUF para llama.cpp (aunque no se documenta soporte oficial).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| BERT Emotion Encoder | 109,5 M | no disponible | apache-2.0 | Hugging Face |
| `bhadresh-savani/bert-base-uncased-emotion` | ~110 M | 512 | apache-2.0 | Hugging Face |
| `j-hartmann/emotion-english-distilroberta-base` | ~82 M | 512 | apache-2.0 | Hugging Face |
| `cardiffnlp/twitter-roberta-base-emotion` | ~125 M | 512 | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo verificables en la información proporcionada para estos modelos alternativos.

## Limitaciones y advertencias

- Solo soporta inglés; el rendimiento en otros idiomas no está evaluado.
- Entrenado únicamente con `dair-ai/emotion`, un dataset de dominio acotado; puede generalizar mal a otros dominios (texto formal, técnico, literario).
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en textos ambiguos o con emociones mixtas.
- No se documentan sesgos demográficos ni de dominio; el dataset de origen puede introducir sesgos no analizados.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantías de calidad ni soporte.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- No se especifica la longitud máxima de contexto ni el proceso de tokenización más allá de `AutoTokenizer`.
- No hay información sobre cuantización ni formatos alternativos de pesos.

## Enlaces

- [Hugging Face: Mahnazfazal/bert-emotion-encoder](https://huggingface.co/Mahnazfazal/bert-emotion-encoder)
- [Modelo base: google-bert/bert-base-uncased](https://huggingface.co/google-bert/bert-base-uncased)
- [Dataset: dair-ai/emotion](https://huggingface.co/datasets/dair-ai/emotion)
