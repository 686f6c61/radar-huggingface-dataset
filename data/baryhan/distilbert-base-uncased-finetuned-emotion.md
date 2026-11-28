# baryhan/distilbert-base-uncased-finetuned-emotion

## Resumen

`baryhan/distilbert-base-uncased-finetuned-emotion` es un modelo de clasificación de texto obtenido mediante fine-tuning supervisado de `distilbert-base-uncased` sobre un conjunto de datos de emoción no especificado por el autor. Lo desarrolla el usuario de Hugging Face baryhan y se publica bajo licencia Apache 2.0 con pesos en formato safetensors. El modelo resuelve una tarea acotada: asignar una etiqueta de emoción a un fragmento de texto en inglés, sin generación libre ni razonamiento multi-paso.

La relevancia práctica es la de un clasificador ligero y desplegable en CPU: con 66.958.086 parámetros y un repositorio de 0,3 GB, encaja en entornos con recursos limitados, pipelines de moderación o análisis de sentimiento a gran escala. DistilBERT es una destilación de BERT-base que conserva aproximadamente el 97 % del rendimiento de su profesor con un 40 % menos de parámetros según la literatura original del modelo, aunque esa cifra no se verifica en esta ficha.

La información publicada es escasa: la model card está generada automáticamente por el Trainer, el dataset de entrenamiento figura como "unknown" y el model-index no declara resultados. Los únicos datos de rendimiento disponibles son los de validación reportados por el autor: accuracy 0,928 y F1 0,9276. No hay información sobre el esquema de etiquetas ni sobre el número de clases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilación de BERT-base con 6 capas) |
| Parametros totales | 66.958.086 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el tokenizador base DistilBERT admite hasta 512 tokens; el autor no declara el máximo usado en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantización dinámica de PyTorch y ONNX, no documentada por el autor) |
| Idiomas soportados | no disponible (el modelo base es `uncased` en inglés; el autor no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo DistilBERT: 6 capas, atención multi-cabeza estándar y tokenizador WordPiece `uncased`. Sobre esta base, el autor aplica un fine-tuning de clasificación de secuencias con una cabeza de clasificación cuyo número de etiquetas no se declara en la información disponible. El modelo se generó con `Trainer` de Transformers, lo que se refleja en la etiqueta `generated_from_trainer`.

Los hiperparámetros documentados son: learning rate 5e-05, batch size de entrenamiento y evaluación de 64, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno y 5 épocas. El historial de entrenamiento reporta dos entradas: época 1 con pérdida de validación 0,3053, accuracy 0,9145 y F1 0,9138; época 2 con pérdida 0,2116, accuracy 0,928 y F1 0,9276. No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo aumentación de datos o búsqueda de hiperparámetros. Tampoco consta RLHF ni DPO, algo esperable en un clasificador de este tamaño.

## Capacidades

- Clasificación de texto en una sola pasada: asigna una etiqueta de emoción a una secuencia de entrada, con salida de logits por clase.
- Análisis de sentimiento y emoción a nivel de fragmento, adecuado para textos cortos o medianos.
- Inferencia por lotes con `pipeline("text-classification")` de Transformers.
- Compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints compatibles (tag `endpoints_compatible`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No tiene modo thinking, visión, audio ni generación de texto libre.
- Capacidad multilingüe: no declarada; el modelo base es en inglés y el autor no especifica idiomas.

## Casos de uso

- Moderación de comentarios en foros: clasificar mensajes de usuario por emoción para priorizar revisiones humanas o activar respuestas automáticas ante contenido hostil, aprovechando el bajo coste de inferencia en CPU.
- Análisis de sentimiento en encuestas de satisfacción: procesar respuestas abiertas en lotes de 64 con `pipeline`, agregando la distribución de etiquetas por segmento de cliente.
- Enrutado de tickets de soporte: usar la etiqueta de emoción como señal adicional para dirigir tickets a colas de atención prioritaria o a agentes especializados.
- Monitorización de reputación en redes sociales: clasificar menciones de marca en flujos de streaming, con un modelo de 0,3 GB desplegable junto al servicio de ingesta.
- Etiquetado asistido para curación de datasets: pre-anotar grandes volúmenes de texto y reservar la revisión humana para los casos de baja confianza (logits próximos entre clases).
- Filtrado previo en pipelines de datos de entrenamiento: descartar o separar documentos con carga emocional alta antes de alimentar modelos generativos de mayor tamaño.
- Clasificación en el edge o en dispositivos sin GPU: al ser un DistilBERT de 66,9 M de parámetros, puede ejecutarse con cuantización dinámica en CPUs modestas, aunque el autor no publica latencias medidas.

## Benchmarks y rendimiento

El model-index oficial no declara resultados (`results: []`). Los únicos datos disponibles son los de validación reportados en la model card:

| Metrica | Valor | Conjunto |
|---|---|---|
| Loss | 0,2116 | Validación (época 2) |
| Accuracy | 0,928 | Validación (época 2) |
| F1 | 0,9276 | Validación (época 2) |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,27 GB solo para pesos (66,9 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 1 GB.
- VRAM estimada en fp16: aproximadamente 0,13 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o CPU.
- GPU recomendadas para alto throughput: A100, H100 o L4 para servir lotes grandes; para uso individual, cualquier GPU con al menos 2 GB libres es suficiente.
- Despliegue: `transformers` con `pipeline`, Text Embeddings Inference, ONNX Runtime, o cuantización dinámica de PyTorch. No se documenta soporte explícito de vLLM, llama.cpp ni Ollama (este último no aplica a un encoder de clasificación).
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| baryhan/distilbert-base-uncased-finetuned-emotion | 66,9 M | no disponible | Clasificación de emoción | Apache 2.0 | Hugging Face |
| distilbert-base-uncased-finetuned-sst-2-english (referencia de la comunidad) | 66,9 M | 512 tokens | Clasificación de sentimiento binaria | Apache 2.0 | Hugging Face |
| bhadresh-savani/distilbert-base-uncased-emotion | 66,9 M | 512 tokens | Clasificación de emoción (6 clases) | Apache 2.0 | Hugging Face |
| roberta-base (fine-tune equivalente) | 125 M | 512 tokens | Clasificación de texto | MIT | Hugging Face |

La comparación con alternativas se basa en la arquitectura y el tamaño, no en resultados medidos: no hay benchmarks publicados que permitan comparar el rendimiento de este modelo frente a los anteriores. El modelo de bhadresh-savani es el equivalente más directo por tarea declarada (emoción), pero el esquema de etiquetas de este modelo no está documentado, por lo que no se puede confirmar equivalencia.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica "unknown dataset", por lo que se desconoce la distribución, el idioma y el esquema de etiquetas.
- Número de clases de emoción no declarado: no se puede saber a priori qué etiquetas devuelve el modelo sin inspeccionar `config.json`.
- Riesgo de sesgo: al no documentarse la composición del dataset, no es posible evaluar sesgos demográficos, culturales o de dominio.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas fuera de la distribución de entrenamiento.
- Idiomas: el modelo base es en inglés `uncased`; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Contexto: el límite efectivo de tokens por muestra no está declarado; truncar a 512 tokens es la cota del tokenizador base, pero el autor podría haber entrenado con longitudes menores.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre el dataset impide verificar la procedencia de los datos de entrenamiento.
- Sin métricas de calibración ni matriz de confusión: la accuracy de 0,928 en validación puede ocultar desequilibrio de clases.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/baryhan/distilbert-base-uncased-finetuned-emotion
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Documentación de DistilBERT en Transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
