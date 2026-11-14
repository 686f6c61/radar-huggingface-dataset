# Hooshaai/bert-lola-attention-sst2

## Resumen

`bert-lola-attention-sst2` es un checkpoint de clasificación de sentimiento en inglés publicado por Hooshaai (organización vinculada al autor Taha Majlesi y a la librería NeuralOps). Consiste en un `google-bert/bert-base-uncased` de 110 millones de parámetros en el que los bloques de atención softmax cuadrática de las 12 capas del transformer han sido sustituidos por el mecanismo `lola_attention`, con complejidad operativa subcuadrática (O(N) u O(N log N)) frente a la O(N²) de la multi-head attention estándar.

El modelo se ha entrenado mediante el protocolo NeuralOps Cached Representation Distillation (destilación de representaciones en dos etapas: alineamiento de subespacio oculto y KL sobre logits más entropía cruzada de tarea) sobre la tarea SST-2 del benchmark GLUE, partiendo de un estudiante sin calibrar que alcanzaba un 53,67 % de accuracy y llegando a un 82,68 % tras la destilación, frente al 91,63 % del profesor `bert-base-uncased` original.

Su relevancia práctica es doble: por un lado, demuestra empíricamente que es viable sustituir atención cuadrática por mecanismos subcuadráticos en BERT manteniendo una precisión razonable en clasificación; por otro, introduce un formato de serialización modular de solo atención (`attention_only_fp16`, ~55 MB) que evita redistribuir los 450 MB del modelo base congelado, lo que abarata el almacenamiento y la descarga. El repo completo ocupa 0,4 GB y el modelo se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), 12 capas, con atención `lola_attention` subcuadrática en lugar de softmax MHA |
| Parametros totales | 110 M (bert-base-uncased); pesos publicados: solo atención + cabeza de clasificación (~55 MB en FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT admite 512 tokens, pero la model card no lo especifica para esta variante) |
| Tipos de cuantizacion | no disponible (los pesos se publican en FP16; no se documentan GGUF, INT8 ni otras variantes) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, FP16), cargados mediante código remoto (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura es un encoder BERT-base de 12 capas y 110 M de parámetros en el que cada bloque de self-attention softmax cuadrática se reemplaza por `lola_attention`, un mecanismo de atención subcuadrática con complejidad efectiva O(N) u O(N log N). El resto de la topología (embeddings, feed-forward, normalización y cabeza de clasificación binaria) se mantiene. Los pesos del modelo base permanecen congelados y solo se entrenan y serializan los parámetros de atención y la cabeza de tarea, siguiendo la especificación de serialización modular de NeuralOps.

El entrenamiento emplea el Cached Representation Distillation Protocol en dos etapas: (1) alineamiento de subespacio oculto y (2) KL sobre logits combinada con entropía cruzada de la tarea. La destilación se ejecutó de forma offline, con caché de representaciones del profesor, eliminando la necesidad de mantener el profesor en VRAM. Los detalles de telemetría reportados son: 218 pasos de optimización, 51,9 s de duración total, throughput efectivo de 34.430,5 tokens/s y pico de VRAM de 8.360 MB sobre una NVIDIA GeForce RTX 3090 (24 GB) en el clúster HPC de Sharif. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset más allá de GLUE/SST-2, ni si se aplicó RLHF o DPO.

## Capacidades

- Clasificación binaria de sentimiento en inglés (positivo/negativo) sobre la tarea SST-2 de GLUE.
- Codificación de secuencias de texto con atención subcuadrática, lo que reduce el coste computacional en secuencias largas frente a BERT-base estándar.
- Carga modular: los pesos de atención se aplican sobre el BERT base congelado mediante código remoto, sin necesidad de descargar el checkpoint completo.
- Integración con Hugging Face Transformers vía `AutoModelForSequenceClassification` y con la API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`).
- No se documentan en la información disponible capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, function calling, agentes, multi-step reasoning ni modo thinking.
- Capacidades multilingües: solo inglés.

## Casos de uso

- Análisis de sentimiento de reseñas de producto: clasificar opiniones positivas o negativas en inglés con un modelo ligero (~55 MB de pesos descargables) que se puede desplegar en CPU o GPU de gama baja, adecuado para volúmenes moderados de reseñas.
- Moderación de comentarios en foros y redes: usar la cabeza de clasificación para detectar tono negativo en publicaciones, aprovechando la atención subcuadrática para procesar hilos largos con menor coste que BERT-base.
- Investigación sobre atención eficiente: servir como checkpoint de referencia para comparar `lola_attention` frente a softmax MHA en tareas de clasificación, replicando el protocolo de destilación documentado.
- Pipeline de etiquetado de datos a bajo coste: clasificar grandes lotes de textos no etiquetados para pre-anotar datasets de sentimiento antes de una revisión humana, dado el bajo footprint de memoria del checkpoint.
- Despliegue en entornos con VRAM limitada: al publicarse solo los pesos de atención en FP16 (~55 MB) y reconstruirse el base desde `bert-base-uncased`, el modelo encaja en GPUs consumer modestas y en instancias de inferencia pequeñas.
- Docencia y reproducción de experimentos de destilación: el repo documenta telemetría completa (pasos, throughput, VRAM pico) que permite reproducir el proceso de destilación en una única RTX 3090.
- Clasificación de sentimiento en tiempo casi real sobre streams de texto: la complejidad subcuadrática de la atención y el tamaño reducido del checkpoint favorecen latencias bajas en comparación con variantes cuadráticas.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras de clasificación binaria):

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`lola_attention`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy GLUE SST-2 | 91,63 % | 53,67 % | 82,68 % | +29,01 % |
| Entropía cruzada de validación | 0,2428 | sin calibrar | 0,3921 | convergido |

Telemetría de entrenamiento (clúster HPC de Sharif, RTX 3090 24 GB):

| Métrica | Valor |
|---|---|
| Duración del entrenamiento | 51,9 s |
| Pasos de optimización | 218 |
| Throughput efectivo | 34.430,5 tokens/s |
| VRAM pico | 8.360 MB |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint publicado ocupa ~55 MB en FP16 y requiere cargar además el BERT base congelado (~450 MB en FP32, ~220 MB en FP16).
- GPU recomendadas: cualquier GPU con al menos ~1-2 GB de VRAM libre para el modelo completo en FP16; la model card cita una RTX 3090 (24 GB) solo para el proceso de destilación, no para inferencia.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante) y probablemente en CPU para lotes pequeños.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`; API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documentan en la información disponible soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible para inferencia; solo se reporta el throughput de entrenamiento (34.430,5 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-lola-attention-sst2` (este) | 110 M (base) / ~55 MB pesos publicados | no disponible | 82,68 % | MIT | Hugging Face + NeuralOps |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % | Apache-2.0 | Hugging Face |
| BERT-base fine-tuned en SST-2 (referencia típica) | 110 M | 512 tokens | ~92-93 % (valores habituales en la literatura) | Apache-2.0 | Hugging Face |

El modelo se sitúa por debajo del profesor y de un BERT-base fine-tuned estándar en precisión absoluta, pero ofrece una atención subcuadrática y un checkpoint modular mucho más pequeño. No se dispone en la información proporcionada de comparativas con otras variantes de atención eficiente (por ejemplo, Longformer, BigBird o Performer) aplicadas a SST-2.

## Limitaciones y advertencias

- Precisión inferior al profesor: 82,68 % frente a 91,63 % en SST-2, una brecha de ~9 puntos porcentuales que puede ser crítica en producción.
- Estudiante pre-destilación prácticamente inútil (53,67 %), lo que indica que el mecanismo de atención subcuadrática por sí solo no aprende bien la tarea sin destilación; la calidad depende fuertemente del protocolo KD.
- Solo inglés y solo clasificación binaria de sentimiento; no es un modelo de propósito general.
- Requiere `trust_remote_code=True` y la librería NeuralOps, lo que introduce dependencia de código de terceros y reduce la portabilidad frente a un checkpoint estándar de Transformers.
- Los pesos publicados son solo de atención y cabeza de tarea; la reconstrucción depende de `bert-base-uncased`, por lo que cualquier cambio en ese repo base afecta a la reproducibilidad.
- Riesgo de alucinación y sesgos: no evaluado ni documentado en la información disponible; al ser un clasificador, el riesgo principal es la clasificación errónea de sentimiento en dominios distintos de SST-2 (reseñas de películas).
- No se documentan limitaciones específicas de longitud de contexto para esta variante; el base BERT admite 512 tokens, pero la atención subcuadrática podría en principio extenderse, algo que no está validado empíricamente.
- Licencia MIT: permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache-2.0, por lo que conviene revisar ambas licencias en despliegues comerciales.
- Modelo con muy poca tracción (56 descargas, 0 likes en el momento de la consulta) y publicado en 2026; no hay evidencia de uso en producción ni validación independiente de los resultados reportados.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-lola-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE / SST-2: https://huggingface.co/datasets/glue
- Cita del autor (BibTeX en la model card): Majlesi, T. (2026), *NeuralOps: Pretrained BERT Subquadratic Attention Zoo on GLUE Benchmark*
