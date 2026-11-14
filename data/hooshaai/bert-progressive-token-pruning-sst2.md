# Hooshaai/bert-progressive-token-pruning-sst2

## Resumen

`bert-progressive-token-pruning-sst2` es un checkpoint derivado de `google-bert/bert-base-uncased` en el que las 12 capas de atención softmax cuadrática estándar se han sustituido por el mecanismo `progressive_token_pruning` de la librería NeuralOps. El autor es Hooshaai (Taha Majlesi), y el modelo se distribuye como pesos de atención y cabeza de clasificación destilados, no como un BERT completo. El objetivo es demostrar que un mecanismo de atención subcuadrática (complejidad efectiva O(N) u O(N log N) frente a O(N²)) puede igualar el rendimiento del transformer original en una tarea de clasificación de sentimiento.

El modelo está entrenado y evaluado sobre la tarea SST-2 del benchmark GLUE mediante el protocolo de destilación de representaciones en caché de NeuralOps, con alineación de subespacio oculto en una primera etapa y KL sobre logits más entropía cruzada de tarea en una segunda. Todo el proceso se ejecutó en una única RTX 3090 de 24 GB, con 176 pasos de optimización y una duración de 59,6 segundos, lo que lo convierte en una pieza interesante para investigar atención eficiente sin grandes presupuestos de cómputo.

Su relevancia actual es acotada pero concreta: sirve como referencia reproducible de cómo sustituir atención cuadrática por mecanismos de poda progresiva de tokens manteniendo una exactitud del 91,51 % en SST-2 (frente al 91,63 % del profesor), y como ejemplo de serialización modular que solo publica los pesos de atención en FP16 (~55 MB) en lugar del modelo base completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-Base con atención `progressive_token_pruning` (subcuadrática) en las 12 capas |
| Parametros totales | 110 M (modelo base BERT-Base); los pesos publicados son solo atención + cabeza de clasificación (~55 MB en FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la configuración de `bert-base-uncased`, típicamente 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16; no se documentan otras cuantizaciones) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16) con código remoto (`modeling_neuralops_bert.py`) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 110 M de parámetros) y reemplaza en cada capa el bloque de multi-head attention softmax por el mecanismo `progressive_token_pruning` de NeuralOps, que reduce progresivamente el conjunto de tokens sobre los que se calcula la atención y consigue una complejidad operativa efectiva O(N) u O(N log N) en lugar de O(N²). El resto de la arquitectura (embeddings, feed-forward, normalizaciones) se mantiene congelado y se inicializa desde el modelo base original en tiempo de carga, de modo que el repositorio solo contiene los parámetros de atención especializados y la cabeza de clasificación.

El entrenamiento sigue el protocolo de destilación de representaciones en caché de NeuralOps: una primera etapa de alineación del subespacio oculto y una segunda etapa que combina KL sobre los logits del profesor con entropía cruzada de la tarea. Se ejecutó sobre la partición de entrenamiento de SST-2 en una RTX 3090 de 24 GB, con 176 pasos de optimización, 59,6 segundos de duración y un throughput efectivo de 24 172,8 tokens/s, alcanzando un pico de 7934 MB de VRAM (sin asignación de VRAM para el profesor gracias a la caché offline de representaciones). No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de SST-2, ni si hubo RLHF o DPO.

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) sobre texto en inglés, con una cabeza de secuencia entrenada específicamente para SST-2.
- Clasificación de secuencias de texto en general, siempre que se ajuste la cabeza de tarea correspondiente.
- Inferencia con atención subcuadrática, lo que reduce el coste computacional frente a atención cuadrática en secuencias largas.
- Carga modular: los pesos de atención pueden aplicarse sobre el BERT base congelado mediante `trust_remote_code=True` o mediante la API `load_pretrained_bert` / `load_surgeried_model` de NeuralOps.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un modelo de clasificación, no un modelo generativo.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Análisis de sentimiento en reseñas de producto o comentarios de usuarios en inglés: el modelo ofrece una exactitud del 91,51 % en la validación de SST-2, adecuada para filtrado automático y moderación a gran escala.
- Clasificación de tickets de soporte por polaridad (queja vs. satisfacción): al ser un modelo de 110 M de parámetros con atención subcuadrática, puede desplegarse en CPU o GPU de gama baja con latencia baja.
- Investigación en atención eficiente: sirve como punto de partida reproducible para comparar `progressive_token_pruning` frente a atención softmax estándar en tareas GLUE.
- Destilación de modelos BERT: el protocolo de destilación en caché documentado (176 pasos, 59,6 s en RTX 3090) es reutilizable para adaptar otros mecanismos de atención a tareas específicas.
- Prototipado de pipelines de NLP en entornos con recursos limitados: los ~55 MB de pesos de atención permiten iterar rápidamente sin descargar el modelo base completo.
- Evaluación comparativa de arquitecturas subcuadráticas: el checkpoint permite medir la degradación de exactitud al sustituir atención cuadrática por poda progresiva de tokens en una tarea concreta.

## Benchmarks y rendimiento

Evaluación sobre la partición de validación de GLUE SST-2 (872 muestras de clasificación binaria):

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`progressive_token_pruning`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Exactitud GLUE SST-2 | 91,63 % | 91,63 % | 91,51 % | -0,11 % |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,2997 | convergido |

Telemetría de entrenamiento (clúster HPC Sharif, RTX 3090 24 GB):

| Métrica | Valor |
|---|---|
| Duración del entrenamiento | 59,6 s |
| Pasos de optimización | 176 |
| Throughput efectivo | 24 172,8 tokens/s |
| Pico de VRAM | 7934 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base BERT-Base en FP16 requiere aproximadamente 220 MB de pesos; el checkpoint adicional de atención ocupa ~55 MB. En FP32 el modelo base ronda los 440 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor validó el entrenamiento en una RTX 3090 de 24 GB, pero la inferencia cabe holgadamente en GTX 1650, RTX 3050, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con más de 2 GB de VRAM, e incluso en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, API `neuralops.hub.load_pretrained_bert` o `load_surgeried_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el modelo requiere código remoto específico de NeuralOps.
- Latencia y throughput: no se publican cifras de latencia de inferencia; solo se documenta el throughput de entrenamiento (24 172,8 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Exactitud SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-progressive-token-pruning-sst2` | 110 M (base) + atención destilada | no disponible | 91,51 % | MIT | Hugging Face (código remoto) |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased` | 66 M | 512 tokens | no disponible en la información | Apache 2.0 | Hugging Face |
| `roberta-base` | 125 M | 512 tokens | no disponible en la información | MIT | Hugging Face |

La comparativa se limita a arquitecturas BERT-like de tamaño similar; no se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que las cifras de exactitud de `distilbert-base-uncased` y `roberta-base` se indican como no disponibles.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha validado su comportamiento en otros idiomas.
- Es un modelo de clasificación de sentimiento binaria, no un modelo generativo: no puede usarse para generación de texto, código, matemáticas ni razonamiento.
- La exactitud reportada (91,51 %) procede de una única tarea (SST-2) y una única partición de validación (872 muestras); no hay evidencia de generalización a otros dominios o tareas GLUE.
- Requiere `trust_remote_code=True` y la librería NeuralOps para cargarse; no es compatible con pipelines estándar de `transformers` sin el código remoto, lo que añade riesgo de seguridad y de mantenimiento.
- Los pesos publicados son solo de atención y cabeza de clasificación; el modelo base se descarga por separado desde `bert-base-uncased`, lo que puede introducir desalineaciones si el modelo base cambia.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas en textos ambiguos, sarcásticos o fuera de dominio.
- Sesgos: no se documentan análisis de sesgo; al derivar de BERT-Base, puede heredar sesgos de género, raza y dominio presentes en los datos de preentrenamiento originales.
- Licencia MIT permite uso comercial, pero el código remoto de NeuralOps y el modelo base `bert-base-uncased` (Apache 2.0) deben cumplirse por separado.
- No se documentan límites de longitud de contexto específicos para el mecanismo de poda progresiva; conviene validar el comportamiento en secuencias cercanas al máximo de BERT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-progressive-token-pruning-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue
