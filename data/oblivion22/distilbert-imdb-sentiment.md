# Oblivion22/distilbert-imdb-sentiment

## Resumen

Oblivion22/distilbert-imdb-sentiment es un modelo de clasificación de texto publicado en HuggingFace por el usuario Oblivion22. Por su nombre y su arquitectura, se trata de un DistilBERT (destilación de BERT) ajustado para análisis de sentimiento, presumiblemente sobre el corpus IMDB de reseñas de cine. El repositorio contiene 66.955.010 parámetros en formato safetensors, lo que coincide con la configuración estándar de DistilBERT más una cabeza de clasificación. La model card está generada automáticamente y no aporta información sobre datos de entrenamiento, hiperparámetros ni evaluación.

DistilBERT es una versión destilada de BERT-base que reduce el número de capas de 12 a 6 y el tamaño de 110M a 66M parámetros, manteniendo aproximadamente el 97 % del rendimiento de BERT en tareas de comprensión del lenguaje según su artículo original. Es un modelo encoder-only con 768 dimensiones ocultas, 12 cabezas de atención y una longitud máxima de secuencia de 512 tokens. Su tamaño reducido lo hace apto para inferencia en CPU y para escenarios de alto throughput en GPU.

La relevancia de esta ficha es limitada: se trata de un modelo con 0 descargas y 1 like en el momento de la consulta, sin licencia declarada ni documentación técnica. Es útil sobre todo como ejemplo de fine-tuning ligero para clasificación binaria de sentimiento, pero cualquier uso en producción exigiría validar primero los datos de entrenamiento y la licencia, que no están disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder-only, 6 capas, 768 de dimensión oculta, 12 cabezas de atención) |
| Parámetros totales | 66.955.010 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (máximo estándar de DistilBERT, no confirmado en la model card) |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible (por el nombre del modelo y su base, previsiblemente inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Librería | transformers |
| Tamaño del repositorio | 0,3 GB |
| Descargas | 0 |
| Likes | 1 |

## Arquitectura y entrenamiento

La arquitectura corresponde a DistilBERT, un transformer encoder-only obtenido mediante destilación del conocimiento de BERT-base (Sanh et al., 2019). DistilBERT elimina la mitad de las capas del modelo profesor y conserva 768 dimensiones ocultas y 12 cabezas de atención, reduciendo el cómputo en aproximadamente un 60 % y el tamaño en un 40 % respecto a BERT-base. El modelo se preentrena con una combinación de destilación de logits, destilación de representaciones ocultas y el objetivo de masked language modeling. Sobre esta base, el autor ha añadido una cabeza de clasificación para producir logits de sentimiento (positivo/negativo).

No hay información disponible sobre el procedimiento de fine-tuning: la model card no documenta el número de épocas, la tasa de aprendizaje, el optimizador, el tamaño del batch ni si se aplicaron técnicas como congelación de capas, búsqueda de hiperparámetros o early stopping. Tampoco se especifica si hubo RLHF, DPO u otro ajuste por preferencias, algo poco habitual en un clasificador de este tipo. Por el nombre del modelo, se infiere que los datos de entrenamiento son el dataset IMDB de reseñas de películas (50.000 reseñas etiquetadas como positivas o negativas, normalmente divididas en 25.000 para entrenamiento y 25.000 para test), pero esto no está confirmado en la documentación. No se declara ninguna innovación técnica adicional.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés.
- Procesamiento de secuencias de hasta 512 tokens.
- Inferencia de baja latencia por su tamaño reducido (67M de parámetros).
- Compatible con la librería transformers y con Text Embeddings Inference (según las etiquetas del repositorio).
- Compatible con endpoints de HuggingFace (etiqueta endpoints_compatible).
- No dispone de soporte de tool calling ni function calling: es un clasificador, no un modelo generativo.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni generación de texto libre.
- Capacidades multilingües: no disponible; probablemente limitado a inglés al derivar de una base entrenada principalmente en inglés.

## Casos de uso

- Análisis de sentimiento de reseñas de productos: el modelo clasificaría reseñas de e-commerce como positivas o negativas para alimentar paneles de reputación y sistemas de alerta temprana. Su tamaño permite procesar lotes grandes en CPU o en una GPU modesta.
- Triaje de tickets de soporte: asignar automáticamente una polaridad emocional a las incidencias entrantes para priorizar las negativas y enrutarlas al equipo adecuado antes de la lectura humana.
- Monitorización de reputación de marca: ingestión continua de menciones en redes sociales o foros y etiquetado de sentimiento por lotes con ventanas de 512 tokens.
- Moderación de comentarios: detección de comentarios negativos o potencialmente conflictivos en comunidades online como primera etapa de un pipeline de moderación, reservando la revisión humana para los casos dudosos.
- Análisis de encuestas y feedback abierto: clasificación de respuestas de texto libre en encuestas NPS o formularios de producto para agregar métricas cuantitativas de satisfacción.
- Curación de datos para entrenamiento: filtrado de grandes corpus de texto en inglés para conservar únicamente fragmentos con polaridad clara, útil para construir datasets de ajuste fino.
- Clasificación por lotes en pipelines de datos: al ser un modelo de 67M de parámetros, encaja bien en trabajos batch tipo Spark o Airflow donde el coste por inferencia es crítico.
- Detección de negatividad en chats de atención al cliente: señal auxiliar para activar protocolos de escalado cuando el sentimiento de la conversación cae por debajo de un umbral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (accuracy, F1, precisión por clase), no se especifica el conjunto de test utilizado y no hay comparaciones con otros modelos. Tampoco se documentan latencia ni throughput. Cualquier cifra de rendimiento debería obtenerse replicando el pipeline de evaluación sobre el dataset IMDB, pero eso requeriría confirmar primero los datos y el procedimiento de entrenamiento, que no están documentados.

## Requisitos de hardware

- VRAM estimada para inferencia de los pesos en FP32: aproximadamente 268 MB.
- VRAM estimada en FP16: aproximadamente 134 MB.
- VRAM estimada en INT8: aproximadamente 67 MB.
- VRAM estimada en INT4: aproximadamente 34 MB.
- A estas cifras hay que sumar el espacio de activaciones y el batch, que en secuencias de 512 tokens y lotes pequeños es de decenas de megabytes.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, GTX 1650 e incluso iGPU modernas.
- Funciona en CPU sin GPU dedicada con latencias aceptables para uso por lotes.
- GPU de datacenter (A100, H100) no son necesarias; solo tendrían sentido para servir decenas de miles de peticiones por segundo agregando varias instancias.
- Opciones de despliegue: pipeline de transformers, HuggingFace Inference Endpoints (etiqueta endpoints_compatible), Text Embeddings Inference (etiqueta text-embeddings-inference) y exportación a ONNX. No se publican pesos GGUF, por lo que llama.cpp u Ollama no son aplicables sin conversión previa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Oblivion22/distilbert-imdb-sentiment | 66,96M | 512 | no disponible | safetensors | HuggingFace |
| distilbert-base-uncased-finetuned-sst-2-english | 66,96M | 512 | Apache 2.0 | safetensors, PyTorch | HuggingFace |
| bert-base-uncased | 110M | 512 | Apache 2.0 | safetensors, PyTorch | HuggingFace |
| roberta-base | 125M | 514 | MIT | safetensors, PyTorch | HuggingFace |

La comparación con alternativas equivalentes es limitada porque no hay métricas publicadas para este modelo. Los tres modelos de referencia tienen licencias permisivas (Apache 2.0 o MIT) y documentación completa, mientras que este repositorio no declara licencia y su model card es una plantilla sin rellenar. DistilBERT base y su versión ajustada en SST-2 ofrecen el mismo tamaño y una trazabilidad clara, por lo que serían opciones preferibles si se necesita un clasificador de sentimiento listo para producción. RoBERTa-base sacrifica velocidad a cambio de mayor capacidad, con 125M de parámetros y contexto de 514 tokens.

## Limitaciones y advertencias

- La licencia no está declarada, por lo que no se puede confirmar el uso comercial ni las condiciones de redistribución. Es un riesgo legal directo para cualquier despliegue en producción.
- No hay información sobre el dataset de entrenamiento ni sobre el proceso de fine-tuning, lo que impide evaluar la calidad, el sesgo o la robustez del modelo.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de errores de clasificación: un clasificador entrenado solo con reseñas de cine puede degradarse notablemente con textos de otros dominios (finanzas, atención médica, jerga técnica).
- Sesgo de dominio probable: el corpus IMDB contiene opiniones largas y elaboradas, no mensajes cortos o informales de redes sociales, con la consiguiente pérdida de precisión fuera de ese registro.
- Idioma: probablemente solo inglés; cualquier texto en castellano u otros idiomas no será clasificado de forma fiable.
- Límite de 512 tokens: los documentos largos deben truncarse o dividirse, lo que puede alterar la polaridad global.
- Modelo de clasificación binaria: no genera texto, no soporta tool calling ni agentes, y no debe utilizarse como modelo de chat.
- Con 0 descargas y 1 like, no existe comunidad que haya validado el modelo; el número de parámetros y el nombre son los únicos indicios de que realmente es un DistilBERT ajustado en IMDB.
- La fecha de creación del repositorio aparece como 2026-09-12, un dato que conviene verificar antes de citar el modelo.
- Antes de cualquier uso serio: auditar el checkpoint, comprobar la correspondencia entre tokenizer y pesos, y evaluar sobre un conjunto de test propio representativo del caso de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Oblivion22/distilbert-imdb-sentiment
- Artículo de DistilBERT (arquitectura de referencia): https://arxiv.org/abs/1910.01108
- Documentación de DistilBERT en HuggingFace: https://huggingface.co/docs/transformers/model_doc/distilbert
- Artículo de la etiqueta arxiv:1910.09700 (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Dataset IMDB (presunto origen de los datos): https://huggingface.co/datasets/imdb
- Modelo de referencia alternativo (SST-2): https://huggingface.co/distilbert/distilbert-base-uncased-finetuned-sst-2-english
