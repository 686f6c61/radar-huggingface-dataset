# Hooshaai/bert-compressed-attention-sst2

## Resumen

`Hooshaai/bert-compressed-attention-sst2` es un checkpoint de BERT-Base (110M parámetros) en el que se han sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por un mecanismo denominado `compressed_attention`, perteneciente a la librería NeuralOps. El modelo se ha destilado sobre la tarea SST-2 del benchmark GLUE (clasificación binaria de sentimiento en inglés) partiendo de `google-bert/bert-base-uncased` como profesor. Lo publica el usuario Hooshaai, con autoría citada de Taha Majlesi y el repositorio NeuralOps.

La propuesta es fundamentalmente metodológica: demuestra que es posible reemplazar la atención cuadrática O(N²) por una variante subcuadrática (O(N) u O(N log N) según la model card) y recuperar buena parte del rendimiento del profesor mediante destilación de representaciones en caché. El resultado reportado es una exactitud del 89,91 % en el split de validación de SST-2, frente al 91,63 % del profesor BERT-Base y al 67,32 % del estudiante antes de la destilación.

Es relevante ahora por dos motivos: por un lado, explora alternativas de atención eficiente sobre una arquitectura consolidada como BERT, lo que facilita la comparación directa; por otro, introduce un formato de serialización modular que almacena únicamente los pesos de atención y la cabeza de clasificación (~55 MB en FP16), reconstruyendo el resto del modelo base en tiempo de carga. El repositorio ocupa 0,4 GB y se distribuye con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atención sustituida por `compressed_attention` (subcuadrática) |
| Parametros totales | 110M (base BERT-Base); el checkpoint publicado contiene solo pesos de atención y cabeza de clasificación (~55 MB FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-Base, típicamente 512 tokens, no confirmado en la información) |
| Tipos de cuantizacion | FP16 en los pesos publicados; no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`), serialización `attention_only_fp16` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder de 12 capas y 110M parámetros. En las 12 capas se reemplaza la atención multi-cabeza estándar por `compressed_attention`, un mecanismo de la NeuralOps Attention Zoo que reduce la complejidad operativa efectiva de O(N²) a O(N) u O(N log N). El resto de la arquitectura (embeddings, feed-forward, normalizaciones) se mantiene congelado y se inicializa desde el modelo base original en tiempo de carga mediante un shim de código remoto (`modeling_neuralops_bert.py`).

El entrenamiento sigue el NeuralOps Cached Representation Distillation Protocol, con dos etapas: primero una alineación de subespacio oculto y después una combinación de KL sobre logits y entropía cruzada de la tarea. El profesor no ocupa VRAM durante el proceso porque sus representaciones se cachean offline. La ejecución se realizó en una NVIDIA RTX 3090 de 24 GB, con 160 pasos de optimización, 49,9 segundos de duración, un throughput efectivo de 26.275 tokens/s y un pico de VRAM de 8.487 MB. El conjunto de evaluación es el split de validación de SST-2 (872 muestras binarias).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés sobre textos tipo SST-2.
- Inferencia con atención subcuadrática, lo que en teoría permite secuencias largas con menor coste que la atención cuadrática, aunque el contexto efectivo no se documenta.
- Carga mediante `AutoModelForSequenceClassification` de Transformers con `trust_remote_code=True`.
- Carga mediante la API modular de NeuralOps (`load_pretrained_bert` o `load_surgeried_model`).
- Serialización modular: solo se descargan los pesos de atención y la cabeza de tarea, no el modelo completo.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso; es un modelo exclusivamente de clasificación.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica polaridad positiva o negativa en inglés con una exactitud reportada del 89,91 % en SST-2, suficiente para filtrado y agregación de opiniones a escala.
- Moderación de comentarios: clasificación rápida de tono en foros y redes, aprovechando el bajo coste de inferencia de un encoder de 110M.
- Enrutamiento de tickets de soporte: uso de la salida de sentimiento como señal auxiliar para priorizar quejas negativas en un pipeline de atención al cliente.
- Investigación en atención eficiente: banco de pruebas para comparar `compressed_attention` frente a atención softmax estándar sobre una base BERT idéntica y una tarea controlada.
- Destilación y experimentación con NeuralOps: ejemplo reproducible de sustitución modular de bloques de atención y carga quirúrgica de pesos.
- Evaluación comparativa en GLUE: referencia para estudiar la pérdida de exactitud (1,72 puntos frente al profesor) al cambiar el mecanismo de atención.
- Prototipado educativo: ejemplo de cómo entrenar y publicar checkpoints con solo los parámetros modificados, reduciendo el tamaño de descarga de 450 MB a ~55 MB.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado | Delta |
|---|---|---|---|---|
| Exactitud SST-2 | 91,63 % | 67,32 % | 89,91 % | +22,59 % |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,2658 | convergido |

Telemetría de entrenamiento (RTX 3090, 24 GB):

| Metrica | Valor |
|---|---|
| Duracion del entrenamiento | 49,9 s |
| Pasos de optimizacion | 160 |
| Throughput efectivo | 26.275 tokens/s |
| Pico de VRAM | 8.487 MB |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base BERT-Base en FP32 ocupa aproximadamente 440 MB de pesos; en FP16, unos 220 MB. Con activaciones y overhead de framework, el consumo típico se sitúa por debajo de 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor validó el entrenamiento en una RTX 3090 de 24 GB, pero la inferencia es mucho más ligera.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU para lotes pequeños.
- Opciones de despliegue: Transformers con `trust_remote_code=True`, API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de inferencia; solo se reporta throughput de entrenamiento (26.275 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-compressed-attention-sst2` | 110M (atención + cabeza ~55 MB) | no disponible | 89,91 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor, fine-tune SST-2) | 110M | 512 | 91,63 % (reportado como profesor) | Apache 2.0 | Hugging Face |
| BERT-Base estándar sin destilar | 110M | 512 | referencia habitual ~92-93 % en SST-2 | Apache 2.0 | Hugging Face |
| DistilBERT-base fine-tune SST-2 | 66M | 512 | ~91 % (referencia pública) | Apache 2.0 | Hugging Face |

La comparativa se limita a la tarea SST-2; no se dispone de datos de otros modelos con atención subcuadrática equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Solo clasificación binaria de sentimiento en inglés; no genera texto ni soporta otras tareas sin reentrenamiento.
- Pérdida de 1,72 puntos de exactitud frente al profesor BERT-Base en SST-2 (89,91 % frente a 91,63 %).
- El checkpoint no incluye los pesos completos: requiere descargar `bert-base-uncased` y ejecutar código remoto (`trust_remote_code=True`), lo que implica riesgo de seguridad y dependencia de la librería NeuralOps.
- La model card contiene inconsistencias: el ejemplo de código usa el identificador `tahamajs/bert-compressed-attention-sst2`, mientras que el repositorio es `Hooshaai/bert-compressed-attention-sst2`; conviene verificar la ruta antes de usarlo en producción.
- No se documentan sesgos específicos, pero al entrenarse sobre SST-2 hereda los sesgos de ese corpus (reseñas de cine en inglés).
- Riesgo de alucinación no aplicable en sentido estricto por ser clasificador, pero sí de clasificaciones erróneas en dominios distintos al de entrenamiento.
- El contexto máximo no se especifica; se asume el de BERT-Base (512 tokens), pero no está confirmado.
- Licencia MIT permite uso comercial, pero la dependencia de código remoto y de la librería NeuralOps debe auditarse antes de desplegar.
- Modelo con muy poca tracción (83 descargas, 0 likes) y sin validación externa; tratar los resultados como preliminares.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-compressed-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue
