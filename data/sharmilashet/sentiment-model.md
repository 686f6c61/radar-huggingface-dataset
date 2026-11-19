# SharmilaShet/sentiment-model

## Resumen

sentiment-model es un modelo de clasificación de texto obtenido mediante fine-tuning de distilbert-base-uncased, publicado por el usuario SharmilaShet en Hugging Face. Está pensado para tareas de análisis de sentimiento y clasificación de secuencias cortas, y se distribuye con la librería transformers en formato safetensors bajo licencia Apache 2.0.

Se trata de un modelo pequeño (66.955.779 parámetros, aproximadamente 0,3 GB en el repositorio) derivado de la arquitectura DistilBERT, una versión destilada de BERT con 6 capas y atención bidireccional. Su relevancia es limitada: la model card está generada automáticamente por el Trainer y no documenta el dataset de entrenamiento, los idiomas soportados ni los usos previstos, y el modelo acumula cero descargas y cero likes en el momento de la consulta.

Los resultados declarados en la evaluación son modestos (accuracy 0,6598 y F1 ponderado 0,6493 sobre un conjunto de validación no especificado), lo que sugiere que debe tratarse como un experimento de fine-tuning más que como un modelo listo para producción. Es útil como referencia para entender el flujo generated_from_trainer y como punto de partida para reentrenamientos, pero no como componente crítico de un sistema desplegado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, atención bidireccional) |
| Parametros totales | 66.955.779 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT base admite hasta 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers, no documentada) |
| Idiomas soportados | no disponible (el modelo base es uncased en inglés, pero la model card no lo declara) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de distilbert-base-uncased, un transformer encoder de 6 capas y 66 millones de parámetros obtenido por destilación de BERT-base. La cabeza de clasificación se entrena sobre la representación del token [CLS] para producir logits de sentimiento. La model card no especifica el número de clases ni la taxonomía de etiquetas.

El entrenamiento se realizó con el Trainer de transformers (versión 5.22.1) durante 3 épocas, con learning rate 2e-5, batch size 32, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, y scheduler lineal. El dataset de entrenamiento no se documenta ("unknown dataset" según la propia model card). No se menciona RLHF, DPO ni ninguna innovación técnica adicional; el pipeline es un fine-tuning supervisado estándar.

## Capacidades

- Clasificación de texto: produce etiquetas de sentimiento (el número y nombres de clases no están documentados).
- Análisis de secuencias cortas: adecuado para frases, reseñas o tuits, dado el tamaño del modelo base.
- Inferencia rápida en CPU: 66 millones de parámetros permiten ejecución en hardware modesto.
- Integración con el pipeline text-classification de transformers.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no documentadas; el modelo base es uncased en inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Clasificación de reseñas de producto en inglés: el modelo puede etiquetar polaridad en textos cortos, aunque su accuracy de 0,66 limita su uso a entornos de baja criticidad o como baseline.
- Filtrado de comentarios en foros o redes: útil para triaje preliminar antes de revisión humana, dado su bajo coste computacional.
- Prototipado de pipelines de NLP: sirve como ejemplo funcional de fine-tuning con Trainer y como plantilla para reentrenar con un dataset propio.
- Análisis de encuestas abiertas: clasificación rápida de respuestas cortas en lotes grandes gracias a su reducido tamaño.
- Detección de toxicidad o sentimiento negativo en moderación de contenido, siempre con umbral de confianza ajustado y supervisión humana.
- Benchmark de referencia en experimentos académicos: punto de comparación para modelos de clasificación más grandes o más recientes.
- Despliegue en dispositivos con recursos limitados: cabe en CPU y en GPUs de gama baja, lo que permite inferencia en edge.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluación no especificado):

| Metrica | Valor |
|---|---|
| Loss (evaluación final) | 0,7470 |
| Accuracy | 0,6598 |
| F1 weighted | 0,6493 |
| F1 macro | 0,6493 |

Evolución durante el entrenamiento:

| Epoca | Training loss | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|
| 1 | 1,0498 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 2 | 0,8304 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 3 | 0,6785 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (66 M de parámetros); en fp16 aproximadamente 0,15 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier RTX, GTX o incluso en iGPU modernas.
- Ejecución en CPU: viable con latencias de milisegundos por muestra en lotes pequeños.
- Opciones de despliegue: transformers pipeline, vLLM (soporte limitado para clasificación), TGI, ONNX Runtime y llama.cpp no aplica (no es un modelo generativo GGUF).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| SharmilaShet/sentiment-model | 66,9 M | no disponible | Apache 2.0 | Accuracy 0,6598 (eval propia) | Hugging Face, 0 descargas |
| distilbert-base-uncased-finetuned-sst-2-english | 67 M | 512 tokens | Apache 2.0 | Ampliamente validado en SST-2 | Hugging Face, muy usado |
| roberta-base | 125 M | 512 tokens | MIT | Superior en GLUE/SST-2 | Hugging Face |
| bert-base-uncased | 110 M | 512 tokens | Apache 2.0 | Referencia estándar en clasificación | Hugging Face |

La comparativa con alternativas consolidadas es desfavorable: el modelo no documenta su dataset ni sus clases, y sus métricas son inferiores a las de los fine-tunes públicos de referencia sobre SST-2.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica explícitamente "unknown dataset", lo que impide evaluar sesgos y generalización.
- Métricas modestas: accuracy 0,6598 y F1 macro 0,6493 sugieren un rendimiento limitado, probablemente por debajo de alternativas establecidas.
- Número y semántica de clases no documentados: no se puede saber qué etiquetas produce el modelo sin inspeccionar la configuración.
- Idiomas no declarados: el modelo base es uncased en inglés; el uso en castellano no está validado.
- Riesgo de alucinación no aplica (no es generativo), pero sí de clasificaciones erróneas con alta confianza.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación hace desaconsejable su uso en producción sin validación previa.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa.
- Model card autogenerada sin revisar: secciones "Intended uses", "Limitations" y "Training data" marcadas como "More information needed".
- Fecha de creación futura (2026-11-19) en los metadatos: posible inconsistencia en el registro, a verificar.

## Enlaces

- Hugging Face: https://huggingface.co/SharmilaShet/sentiment-model
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Documentación de DistilBERT (paper): https://arxiv.org/abs/1910.01108
- Documentación de transformers: https://huggingface.co/docs/transformers
