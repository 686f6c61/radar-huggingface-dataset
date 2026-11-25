# Casaviejas/beto-sarcasmo-bs64

## Resumen

beto-sarcasmo-bs64 es un modelo de clasificación de texto en castellano obtenido mediante fine-tuning de dccuchile/bert-base-spanish-wwm-cased, el conocido como BETO, desarrollado originalmente por el grupo DCC de la Universidad de Chile. El modelo lo publica el usuario Casaviejas en Hugging Face y su propósito declarado, a partir del identificador, es la detección de sarcasmo en textos en español, aunque la model card no documenta explícitamente la tarea ni el conjunto de datos empleado.

Arquitectónicamente es un transformer encoder de tipo BERT base, con 109.852.418 parámetros totales (aproximadamente 110 millones) y pesos en formato safetensors. El entrenamiento se realizó con la librería Transformers sobre el checkpoint BETO, que emplea tokenización WordPiece con whole word masking y vocabulario en minúsculas y mayúsculas (cased), lo que lo hace sensible a la capitalización y adecuado para textos informales de redes sociales.

Su relevancia es acotada pero concreta: ofrece un clasificador ligero y desplegable en CPU para una tarea lingüística difícil en español, con métricas de evaluación declaradas de 0,9188 de accuracy y 0,9146 de F1 macro sobre un conjunto de validación. No obstante, la ausencia de documentación sobre el dataset, la licencia y los idiomas limita seriamente su uso en producción sin una validación adicional por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT base (BERT-base español con whole word masking) |
| Parametros totales | 109.852.418 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BETO admite hasta 512 tokens, pero la model card no lo declara) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original; admite cuantización dinámica a int8 vía PyTorch, no documentada por el autor) |
| Idiomas soportados | no disponible (el modelo base es de español; la model card no lo declara) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de dccuchile/bert-base-spanish-wwm-cased, un BERT base con 12 capas, atención multi-cabeza estándar y tokenizador WordPiece con enmascaramiento de palabras completas. No incorpora innovaciones arquitectónicas propias: se trata de un clasificador de secuencias con cabeza de clasificación sobre el token [CLS], entrenado para una tarea de clasificación binaria o multiclase que la model card no especifica.

Los hiperparámetros documentados son: learning rate 2e-05, tamaño de batch de entrenamiento y evaluación de 64, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 239 pasos de warmup, 10 épocas y precisión mixta nativa (AMP). El entrenamiento se ejecutó con Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo técnicas de alineación como RLHF o DPO (poco habituales en clasificación).

El historial de validación muestra sobreajuste progresivo: la pérdida de validación alcanza su mínimo en la época 2 (0,2382) y asciende hasta 0,5808 en la época 8, mientras que la accuracy se estanca en torno al 0,92 desde la época 3. El checkpoint final corresponde a la época 8, no al mejor punto de validación, lo que sugiere que un early stopping habría producido un modelo con menor pérdida aunque métricas de clasificación similares.

## Capacidades

- Clasificación de texto en español: el pipeline declarado es text-classification, orientado a la detección de sarcasmo según el identificador del modelo.
- Salida de etiquetas con probabilidad asociada, apta para umbralización y calibración posterior.
- Procesamiento de secuencias de hasta 512 tokens (límite del modelo base BETO), suficiente para tuits, comentarios y párrafos cortos.
- Sensibilidad a mayúsculas y minúsculas gracias al tokenizador cased, relevante en textos informales donde la capitalización aporta señal.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento: es un encoder de clasificación, no un modelo generativo.
- No dispone de capacidades de visión, audio ni generación de texto.
- Capacidades multilingües: no disponibles; el modelo base está entrenado en español y la model card no declara otros idiomas.

## Casos de uso

- Moderación de comentarios en foros y redes sociales: el modelo puede etiquetar mensajes con sarcasmo o ironía para enrutarlos a revisión humana o ajustar la respuesta automática, aprovechando su tamaño reducido para procesar lotes grandes en CPU.
- Análisis de sentimiento con matiz irónico: en pipelines de escucha social, una capa de detección de sarcasmo previa al análisis de polaridad evita clasificar como positivos comentarios irónicos negativos.
- Enriquecimiento de datasets de opinión: etiquetado automático de grandes volúmenes de reseñas o tuits en español para construir corpus anotados de ironía, con revisión manual de los casos de baja confianza.
- Filtrado previo en sistemas de atención al cliente: detección de mensajes sarcásticos o frustrados para priorizar la intervención de un agente humano en lugar de un bot.
- Investigación en lingüística computacional del español: como baseline reproducible para experimentos de detección de sarcasmo, con métricas de validación declaradas para comparación.
- Clasificación por lotes en entornos con recursos limitados: al ser un BERT base de 110 millones de parámetros, cabe en CPU y en GPUs de gama baja, lo que permite desplegarlo en servicios serverless o dispositivos edge sin infraestructura dedicada.
- Preetiquetado en anotación activa: generar etiquetas iniciales que los anotadores corrigen, reduciendo el coste de creación de corpus de sarcasmo en español.

## Benchmarks y rendimiento

La model card declara métricas sobre un conjunto de evaluación no especificado, sin publicar resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros). El model-index oficial no contiene resultados. Los datos disponibles son los siguientes:

| Metrica | Valor declarado |
|---|---|
| Loss (evaluacion) | 0,5808 |
| Accuracy | 0,9188 |
| Precision | 0,9187 |
| Recall | 0,9188 |
| F1 | 0,9187 |
| F1 Macro | 0,9146 |

Evolución durante el entrenamiento (extracto de la model card):

| Epoca | Paso | Validation loss | Accuracy | F1 | F1 macro |
|---|---|---|---|---|---|
| 1 | 239 | 0,2948 | 0,8856 | 0,8855 | 0,8799 |
| 2 | 478 | 0,2382 | 0,9094 | 0,9096 | 0,9054 |
| 3 | 717 | 0,2534 | 0,9170 | 0,9171 | 0,9132 |
| 4 | 956 | 0,3294 | 0,9212 | 0,9212 | 0,9173 |
| 6 | 1434 | 0,4527 | 0,9220 | 0,9219 | 0,9181 |
| 8 | 1912 | 0,5808 | 0,9188 | 0,9187 | 0,9146 |

No se han publicado resultados de benchmarks estandarizados en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB para los pesos (110 M de parámetros × 4 bytes), más overhead de activaciones y del runtime de PyTorch; en la práctica, entre 1 y 2 GB en GPU.
- VRAM estimada en fp16: aproximadamente 0,22 GB para los pesos; el modelo puede ejecutarse en GPUs con 4 GB o menos.
- Cabe en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, GTX 1650 o incluso iGPU con suficiente memoria compartida.
- Ejecución en CPU viable: con 110 M de parámetros, el throughput en CPU moderna es del orden de cientos a miles de secuencias cortas por segundo, suficiente para servicios de clasificación por lotes.
- Opciones de despliegue: transformers con pipeline de text-classification, Text Embeddings Inference (el modelo está etiquetado como compatible con endpoints de TEI), ONNX Runtime, TorchScript, y exportación a GGUF para llama.cpp aunque no está documentada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware, la longitud de secuencia y el tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Casaviejas/beto-sarcasmo-bs64 | 109,9 M | no disponible (base: 512 tokens) | Clasificacion de sarcasmo (presunta) | no disponible | Hugging Face, 0 descargas |
| dccuchile/bert-base-spanish-wwm-cased (BETO) | ~110 M | 512 tokens | Modelo base enmascarado, fine-tuneable | no disponible en esta ficha | Hugging Face, ampliamente usado |
| Modelos BETO fine-tuneados para análisis de sentimiento en español (varios autores) | ~110 M | 512 tokens | Clasificación de sentimiento | variable según autor | Hugging Face |
| Modelos RoBERTa-base en español (p. ej. BSC-TeMU/roberta-base-bne) | ~125 M | 512 tokens | Modelo base enmascarado | Apache 2.0 (según modelo base) | Hugging Face |

La comparación directa con alternativas específicas de detección de sarcasmo en español no está disponible en la información proporcionada. Frente a BETO sin fine-tuning, este modelo aporta un clasificador entrenado, pero carece de la documentación, la licencia explícita y la comunidad de uso de las alternativas consolidadas.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: se desconoce la procedencia, el tamaño, el dominio y el equilibrio de clases del corpus, lo que impide evaluar la generalización a otros dominios.
- Licencia no disponible: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o verificar la licencia del modelo base antes de cualquier despliegue productivo.
- Sobreajuste: la pérdida de validación se degrada desde la época 2 hasta la 8, y el checkpoint publicado corresponde a la época 8, no al mejor punto de validación.
- Métricas sobre un conjunto de evaluación no especificado: los valores de accuracy, precision, recall y F1 no son comparables con resultados de benchmarks públicos ni verificables de forma independiente.
- Sesgos desconocidos: al no documentarse el corpus, no es posible evaluar sesgos demográficos, dialectales o de registro; el sarcasmo varía fuertemente entre variedades del español (peninsular, rioplatense, mexicano, etc.).
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación, especialmente en textos irónicos sin marcadores léxicos evidentes.
- Idiomas no declarados: aunque el modelo base es de español, la model card no confirma el alcance lingüístico; el rendimiento en catalán, gallego o portugués es impredecible.
- Contexto limitado a 512 tokens: textos más largos deben truncarse o dividirse, con pérdida de señal contextual.
- Popularidad nula: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad ni issues reportados.
- Repositorio de 0,4 GB y creado en 2026-11-25: metadatos recientes y sin historial de mantenimiento; no hay garantía de soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Casaviejas/beto-sarcasmo-bs64
- Modelo base BETO: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- Repositorio de BETO en GitHub (DCC UChile): https://github.com/dccuchile/beto
- Paper de BETO (Cañete et al., 2020): https://arxiv.org/abs/2004.11409
- Documentación de Transformers para text-classification: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
