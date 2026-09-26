# acharyadarwin/sentiment-model

## Resumen

acharyadarwin/sentiment-model es un modelo de clasificación de texto (pipeline `text-classification`) publicado en HuggingFace, resultado de un ajuste fino supervisado de distilbert-base-uncased. Cuenta con 66.955.779 parámetros, se distribuye en formato safetensors bajo licencia Apache 2.0 y su repositorio ocupa 0,3 GB. La model card indica que fue generado automáticamente por la librería Trainer, sin que el autor haya completado las secciones de descripción, usos previstos ni datos de entrenamiento: el dataset empleado figura explícitamente como "unknown dataset".

El rendimiento declarado es modesto: en el conjunto de evaluación el autor reporta una pérdida de 0,7470, una exactitud (accuracy) de 0,6598 y un F1 ponderado y macro idénticos de 0,6493. No se especifica el número de clases ni la taxonomía de etiquetas, por lo que no es posible determinar si la exactitud está muy por encima o cerca del azar. El modelo acumula 0 descargas y 0 "likes" en el momento de la consulta, por lo que carece de validación independiente por parte de la comunidad.

Su relevancia es limitada como modelo de producción, pero resulta un caso de estudio útil: ilustra el flujo estándar de fine-tuning con Trainer sobre DistilBERT y, al mismo tiempo, los problemas típicos de publicar un artefacto sin documentación de datos, sin intended uses y con métricas de evaluación que no coinciden con la última epoch registrada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only destilado (DistilBERT); modelo base: distilbert-base-uncased |
| Parámetros totales | 66.955.779 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (heredada del modelo base; no se especifica en la model card) |
| Tipos de cuantización | No disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | No disponible; el modelo base está entrenado principalmente en inglés y usa tokenizador uncased |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Tarea | Clasificación de texto (text-classification); conjunto de etiquetas no disponible |
| Tamaño del repositorio | 0,3 GB |
| Fecha de creación en HuggingFace | 2026-09-26 |
| Última actualización | 2026-09-26 |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un transformer encoder-only obtenido por destilación del conocimiento de BERT-base, con 6 capas, dimensión oculta 768, 12 cabezas de atención, vocabulario uncased de 30.522 tokens y un máximo de 512 posiciones de entrada. Sobre esa base se añade una cabeza de clasificación de secuencia. Los 66.955.779 parámetros declarados coinciden con el tamaño esperado de DistilBERT base, y el repositorio de 0,3 GB es consistente con un checkpoint almacenado en FP32 (66.955.779 × 4 bytes ≈ 268 MB) más el optimizador y los ficheros auxiliares. No hay innovaciones técnicas propias: no se documenta decodificación especulativa, atención lineal, MoE ni ningún otro mecanismo.

El procedimiento de entrenamiento sí está detallado en la model card: 3 epochs, tasa de aprendizaje 2e-5 con scheduler lineal, batch de 32 tanto en entrenamiento como en evaluación, semilla 42 y optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-8). Se registran 58 pasos por epoch (174 en total), lo que implica aproximadamente 1.856 ejemplos por epoch (58 × 32) y sugiere un conjunto de entrenamiento de en torno a 1.900 ejemplos, aunque el dato no se confirma en la ficha. No se menciona ninguna fase de RLHF, DPO ni ajuste por preferencias; se trata de aprendizaje supervisado clásico. Las versiones de framework empleadas fueron Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

Un detalle técnico relevante es la inconsistencia entre métricas: la cabecera de la model card declara una pérdida de evaluación de 0,7470 y una exactitud de 0,6598, mientras que la tabla de entrenamiento muestra en la epoch 3 una pérdida de validación de 0,7117 y una exactitud de 0,6821. No se aclara qué checkpoint corresponde a cada cifra. Además, los valores de F1 ponderado y F1 macro son idénticos en todas las filas, lo que apunta a un conjunto de evaluación con clases perfectamente balanceadas (o a un artefacto de cálculo).

## Capacidades

- Clasificación de sentimiento o de categorías textuales sobre secuencias cortas en inglés, con un conjunto de etiquetas no documentado.
- Inferencia sobre entradas de hasta 512 tokens; las secuencias más largas requieren truncamiento o segmentación previa.
- Ejecución muy ligera: al tener 66,9 M de parámetros, la inferencia es viable en CPU sin GPU dedicada.
- Salida de logits y de representaciones ocultas a través de la API estándar de Transformers, aunque la model card no documenta ningún uso de embeddings.
- Capacidades multilingües: no documentadas; el tokenizador uncased y el corpus original del modelo base apuntan a un rendimiento limitado fuera del inglés.
- No soporta generación de texto, razonamiento multi-paso, tool calling ni function calling.
- No dispone de modo "thinking", ni capacidades de visión, audio o multimodalidad.
- No hay soporte documentado para uso como agente ni para cadenas de razonamiento.

## Casos de uso

- Prototipado rápido de análisis de opinión en inglés: dado su tamaño (0,3 GB) y su naturaleza encoder-only, se puede cargar con `transformers.pipeline("text-classification")` en un portátil y obtener etiquetas en segundos, lo que sirve para validar un flujo antes de invertir en un modelo mayor.
- Pre-etiquetado (weak labelling) de corpus para anotación humana: con una exactitud de 0,6598, el modelo es demasiado impreciso como clasificador final, pero puede usarse para proponer etiquetas iniciales que un anotador revise, reduciendo el coste de construir un dataset de mayor calidad.
- Análisis por lotes de reseñas de producto en inglés: procesando ficheros CSV con millones de comentarios en CPU, el coste por inferencia es mínimo; ahora bien, los resultados deberían agregarse por segmentos y no emplearse para decisiones individuales mientras la exactitud no se valide en el dominio objetivo.
- Monitorización de menciones de marca en redes sociales: el modelo puede clasificar la polaridad de publicaciones cortas, siempre que se reentrene o evalúe específicamente sobre el registro lingüístico de la plataforma, ya que no hay evidencia de que el dataset de ajuste lo cubra.
- Clasificación de tickets de soporte por tono o urgencia percibida: viable como capa auxiliar de enrutamiento con revisión humana posterior, no como sistema automático de decisión dado el nivel de acierto reportado.
- Análisis de respuestas abiertas en encuestas (NPS, satisfacción): útil para obtener una primera distribución de sentimiento en comentarios breves en inglés, complementada con una muestra revisada manualmente para estimar el error real.
- Material docente para prácticas de fine-tuning: el repositorio documenta hiperparámetros, versiones de framework y curva de entrenamiento, lo que lo convierte en un ejemplo didáctico de pipeline Trainer de principio a fin.
- Integración en endpoints compatibles con la Inference API de HuggingFace, ya que el modelo está etiquetado como `endpoints_compatible`.

## Benchmarks y rendimiento

Los resultados publicados por el autor proceden de la model card; el bloque `model-index` está vacío, por lo que no hay métricas adicionales verificadas. No se han publicado comparaciones con otros modelos en la información disponible.

Resultados declarados en el conjunto de evaluación:

| Métrica | Valor |
|---|---|
| Loss | 0,7470 |
| Accuracy | 0,6598 |
| F1 weighted | 0,6493 |
| F1 macro | 0,6493 |

Evolución durante el entrenamiento:

| Training loss | Epoch | Step | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|---|
| 1,0498 | 1.0 | 58 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 0,8304 | 2.0 | 116 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 0,6785 | 3.0 | 174 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

No se dispone de resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar, ya que no son aplicables a un clasificador de texto de este tipo y el autor no los reporta.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (el checkpoint ocupa unos 268 MB); en la práctica cualquier GPU con 2 GB o más es suficiente, y también es viable la inferencia en CPU.
- GPU recomendadas: no se requiere ninguna GPU dedicada. Cualquier tarjeta consumer sirve, desde una GTX 1050/1650 hasta una RTX 4090; en entornos de servidor, una T4 o una L4 son más que suficientes.
- Cabe en GPU consumer: sí, en todas las gamas actuales y en la mayoría de integradas modestas.
- Opciones de despliegue: `transformers` (pipeline de clasificación de texto), exportación a ONNX/INT8 mediante Optimum, Text Generation Inference (TGI) para servir el modelo vía API, y endpoints compatibles con la Inference API de HuggingFace. vLLM es compatible a nivel de arquitectura, pero resulta sobredimensionado para un clasificador de 66,9 M de parámetros. llama.cpp y Ollama no aplican, ya que no se publican pesos en GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni de tokens por segundo en la información proporcionada.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de documentación pública y deben verificarse en sus respectivas fichas; no se han validado en esta consulta.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| acharyadarwin/sentiment-model | 66,9 M | 512 | Clasificación de texto, etiquetas no documentadas | Apache 2.0 | Accuracy 0,6598; F1 macro 0,6493 (evaluación propia) |
| distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | 512 | Análisis de sentimiento binario (SST-2) | Apache 2.0 | En torno al 91 % de exactitud en SST-2 dev, según valores de referencia públicos |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 512 | Sentimiento en 3 clases, dominio Twitter | Consultar la ficha del modelo | No disponible en esta consulta |
| bert-base-uncased | 110 M | 512 | Modelo base sin ajuste para sentimiento | Apache 2.0 | No aplica (no es un clasificador afinado) |

La diferencia principal frente a las alternativas no está en el tamaño ni en la arquitectura, sino en la documentación: los modelos comparables publican taxonomía de etiquetas, corpus de entrenamiento e intended uses, mientras que este repositorio deja esas secciones sin completar y no ofrece ninguna referencia de rendimiento fuera de su propio conjunto de evaluación.

## Limitaciones y advertencias

- Rendimiento bajo y sin contexto: una exactitud de 0,6598 y un F1 macro de 0,6493 son insuficientes para producción en la mayoría de escenarios de clasificación de sentimiento, especialmente si la tarea es binaria (donde el azar se sitúa en 0,50) o ternaria (0,33).
- Dataset de entrenamiento desconocido: la model card indica literalmente "unknown dataset", por lo que no se puede conocer la distribución de clases, el dominio, el idioma real de los datos ni el significado de las etiquetas de salida.
- Conjunto de etiquetas no documentado: sin saber cuántas clases existen ni qué representan, la salida del modelo no es interpretable sin inspección manual del `config.json`.
- Discrepancia en las métricas reportadas: la cabecera de la ficha (accuracy 0,6598, loss 0,7470) no coincide con la última epoch de la tabla de entrenamiento (accuracy 0,6821, loss 0,7117); no queda claro qué checkpoint se evalúa.
- Sesgos desconocidos: al no documentarse el corpus de ajuste, no es posible evaluar sesgos demográficos, culturales o de dominio. El modelo base DistilBERT se entrenó con corpus mayoritariamente ingleses de fuentes web, con los sesgos asociados.
- Riesgo de alucinación: no aplica en sentido generativo (el modelo no genera texto), pero sí existe riesgo de clasificación errónea confiada, ya que las puntuaciones softmax pueden ser altas incluso en entradas fuera de distribución.
- Limitación de idioma: el tokenizador es uncased (convierte todo a minúsculas) y el modelo base es mayoritariamente anglófono; el rendimiento en castellano u otros idiomas no está documentado y previsiblemente será pobre.
- Límite de contexto: 512 tokens; los documentos más largos se truncarán y perderán información relevante, lo que degrada la clasificación de textos extensos.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright y la atribución correspondiente.
- Falta de validación externa: 0 descargas y 0 "likes" implican que el modelo no ha sido probado por terceros; no existe evidencia independiente de su comportamiento en producción.
- Model card autogenerada sin revisar: secciones como "Intended uses & limitations" o "Training and evaluation data" contienen únicamente "More information needed".

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/acharyadarwin/sentiment-model
- Modelo base: https://huggingface.co/distilbert-base-uncased
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada. Como referencia del modelo base, la destilación de DistilBERT se describe en el artículo de Sanh et al., 2019 (arXiv:1910.01108), si bien dicho enlace no aparece citado en la model card.
