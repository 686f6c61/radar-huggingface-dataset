# CollinMa/disaster-tweets-bert

## Resumen

`CollinMa/disaster-tweets-bert` es un modelo de clasificación de texto en inglés obtenido mediante ajuste fino completo (*full-parameter fine-tuning*) de `google-bert/bert-base-uncased`. Lo desarrolla el usuario CollinMa y resuelve una tarea binaria muy concreta: determinar si un tuit describe un desastre real (`DISASTER`, etiqueta 1) o no (`NOT_DISASTER`, etiqueta 0). El modelo no verifica la veracidad del evento, solo clasifica el texto.

Se trata de un BERT base estándar (arquitectura transformer encoder-only) con 109.483.778 parámetros y una longitud máxima de entrada de 128 tokens durante el entrenamiento y la inferencia documentada. No es un modelo generativo ni conversacional: su única salida es una distribución softmax sobre dos clases, con puntuaciones no calibradas.

Su relevancia es acotada y práctica: sirve como referencia reproducible de ajuste fino sobre el dataset de la competición Kaggle *NLP Getting Started with Disaster Tweets*, con una partición estratificada 80/10/10 tras eliminar duplicados y una evaluación honesta en 749 ejemplos de test. Incluye además una versión ONNX INT8 de 182,2 MB pensada para despliegue en navegador, lo que lo hace útil como ejemplo de extremo a extremo (entrenamiento, cuantización y despliegue).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT base) |
| Parametros totales | 109.483.778 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (truncado en entrenamiento e inferencia) |
| Tipos de cuantizacion | INT8 (ONNX cuantizado, `onnx/model_quantized.onnx`, 182,2 MB); pesos safetensors en precisión original |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (incluye variante cuantizada INT8) |

## Arquitectura y entrenamiento

La arquitectura es un BERT base *uncased* sin modificaciones estructurales: 12 capas de encoder, atención multi-cabeza bidireccional y tokenizador WordPiece en minúsculas. El ajuste fino es de todos los parámetros sobre la cabeza de clasificación de dos clases. La revisión del modelo base fijada es `86b5e0934494bd15c9632b12f734a8a67f723594`.

El entrenamiento usó 3 épocas, tasa de aprendizaje 2e-05, tamaño de lote 8 con acumulación de gradiente 2 (lote efectivo 16), longitud máxima 128, optimizador AdamW, *dynamic padding*, precisión bf16 y semilla 42. El dataset es `venetis/disaster_tweets` (revisión `896f918ab4d22b0ad24f8e2d01b84acf0742c050`), espejo de los datos originales de la competición Kaggle *nlp-getting-started*. Antes del split se eliminaron duplicados y se aplicó una partición estratificada 80/10/10 con semilla fija. El checkpoint final se seleccionó únicamente por F1 de validación. No se documenta uso de RLHF, DPO ni aumentación de datos.

## Capacidades

- Clasificación binaria de texto en inglés: `DISASTER` frente a `NOT_DISASTER`.
- Salida de probabilidad softmax por clase (no calibrada).
- Procesamiento de entradas de hasta 128 tokens; el exceso se trunca.
- Compatible con `transformers` pipeline `text-classification` y con *text-embeddings-inference*.
- Exportación ONNX disponible, incluida una variante INT8 para ejecución en navegador.
- No soporta *tool calling*, function calling, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*.
- No es un modelo generativo: no produce texto libre.

## Casos de uso

- Filtrado de tuits en tiempo real para alertas tempranas: clasificar un flujo de publicaciones y derivar las marcadas como `DISASTER` a un panel de revisión humana, aprovechando la baja latencia de un BERT base.
- Moderación y triaje de contenido en plataformas sociales: priorizar mensajes potencialmente críticos antes de la revisión manual, usando la probabilidad de la clase 1 como orden de prioridad.
- Enriquecimiento de datasets periodísticos: etiquetar corpus históricos de Twitter para estudios sobre cobertura de catástrofes, con la ventaja de que el modelo es reproducible (semilla y revisiones fijadas).
- Demostración educativa de ajuste fino: ejemplo completo de fine-tuning, evaluación con split estratificado, cuantización y despliegue, útil en cursos y tutoriales.
- Clasificación en el navegador: la variante ONNX INT8 de 182,2 MB permite inferencia local sin servidor, útil en aplicaciones web de bajo coste o con requisitos de privacidad.
- Baseline para sistemas de alerta más amplios: como primer filtro barato antes de un modelo mayor o de verificación con fuentes oficiales.
- Pruebas de regresión en pipelines de NLP: por su tamaño reducido y licencia permisiva, sirve como caso de prueba en CI para validar versiones de `transformers` u ONNX Runtime.

## Benchmarks y rendimiento

Evaluación en el conjunto de test reservado (749 ejemplos, batch=1 para la variante ONNX):

| Modelo | Accuracy | Precision | Recall | F1 |
|---|---:|---:|---:|---:|
| TF-IDF + Logistic Regression | 0.7864 | 0.8093 | 0.6520 | 0.7222 |
| BERT full fine-tuning (safetensors) | 0.8238 | 0.8258 | 0.7429 | 0.7822 |
| BERT ONNX INT8 (despliegue) | 0.8238 | 0.8327 | 0.7335 | 0.7800 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni una puntuación de la clasificación de Kaggle; el autor declara explícitamente que no reclama ninguna.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,44 GB solo para pesos, más activaciones; en la práctica cabe en cualquier GPU con 2 GB o más.
- VRAM estimada en INT8 (ONNX): alrededor de 0,18 GB para los pesos, ejecutable en CPU y en navegador.
- GPU recomendadas: no requiere GPU dedicada; funciona bien en CPU. Para lotes grandes, cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es más que suficiente. A100/H100 solo tendrían sentido para evaluaciones masivas por lotes.
- Cabe en cualquier GPU consumer e incluso en dispositivos de gama baja y en el navegador mediante ONNX Runtime Web.
- Opciones de despliegue: `transformers` pipeline, ONNX Runtime (incluido el runtime web), Text Embeddings Inference (el repo está marcado como compatible con *endpoints*), y servidores de inferencia estándar que acepten safetensors.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por ejemplo en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CollinMa/disaster-tweets-bert | 109,5 M | 128 tokens | Clasificación binaria de desastres | Apache-2.0 | HuggingFace, ONNX incluido |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Modelo base (MLM) | Apache-2.0 | HuggingFace |
| TF-IDF + Logistic Regression (baseline del autor) | No aplica | No aplica | Clasificación binaria de desastres | No disponible | Referencia en la model card |
| DistilBERT base | 66 M | 512 tokens | Modelo base (MLM) | Apache-2.0 | HuggingFace |

La comparación con el baseline TF-IDF es la única con métricas publicadas por el autor: el BERT ajustado mejora el F1 de 0,7222 a 0,7822 en el mismo test. Frente a `bert-base-uncased`, la diferencia clave es que este modelo está especializado en la tarea y limitado a 128 tokens, mientras que el base admite 512 pero no está ajustado para clasificación.

## Limitaciones y advertencias

- El modelo clasifica texto y no verifica eventos: una publicación que describa un desastre ficticio o metafórico puede clasificarse como `DISASTER`.
- Las puntuaciones softmax no están calibradas; no deben interpretarse como probabilidades fiables sin un paso de calibración.
- Solo admite inglés; el rendimiento en otros idiomas no está evaluado y probablemente sea deficiente.
- Entradas de más de 128 tokens se truncan, lo que puede eliminar información relevante en textos largos.
- El conjunto de evaluación es pequeño (749 ejemplos) y proviene de una única competición de Kaggle; la generalización a dominios o épocas distintas no está verificada.
- Posibles sesgos heredados de BERT base y del corpus de tuits de la competición (sesgo de dominio, de registro informal y de la distribución geográfica y temporal de los datos originales).
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos; el recall (0,7429) implica que se escapan aproximadamente una de cada cuatro instancias positivas.
- Licencia Apache-2.0 para el modelo, pero las condiciones de uso de los datos originales de Kaggle siguen aplicándose de forma independiente, según advierte el autor.
- No debe usarse como único sistema de alerta de emergencias en producción sin verificación humana y fuentes oficiales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CollinMa/disaster-tweets-bert
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset espejo: https://huggingface.co/datasets/venetis/disaster_tweets
- Fuente original de datos (Kaggle): https://www.kaggle.com/competitions/nlp-getting-started
- Resumen de entrenamiento: `training_summary.json` en el repositorio del modelo
- Modelo ONNX cuantizado: `onnx/model_quantized.onnx` en el repositorio del modelo
