# Hooshaai/bert-primal-attention-sst2

## Resumen

`bert-primal-attention-sst2` es un checkpoint de BERT-Base (110 M de parámetros) publicado por el usuario Hooshaai (citado en la model card como Taha Majlesi, autor de la librería NeuralOps) en el que se han sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `primal_attention`, una atención subcuadrática de complejidad efectiva O(N) u O(N log N). El modelo se ha afinado y destilado para la tarea SST-2 del benchmark GLUE (clasificación binaria de sentimiento en inglés) y se distribuye a través de la librería `neuralops` con código remoto personalizado.

La relevancia del checkpoint es fundamentalmente metodológica: demuestra que es posible reemplazar la atención cuadrática de un transformer preentrenado por una alternativa subcuadrática y recuperar prácticamente el rendimiento del profesor original (91,86 % frente a 91,63 % de exactitud en SST-2, una caída de 0,23 puntos) mediante un protocolo de destilación de representaciones en caché que no requiere mantener el modelo profesor en VRAM. El proceso de destilación se ejecutó en una única RTX 3090 de 24 GB en 283 segundos y 4 pasos de optimización.

El repositorio es deliberadamente modular: no redistribuye los pesos completos de BERT (unos 450 MB), sino únicamente los pesos de atención destilados y la cabeza de clasificación en FP16 (`attention_weights.safetensors`, ~55 MB). El código remoto reconstruye el modelo base congelado desde `bert-base-uncased` y aplica los parámetros de atención en tiempo de carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-Base con atención `primal_attention` subcuadrática (O(N) u O(N log N)) en las 12 capas |
| Parametros totales | 110 M (BERT-Base); pesos destilados distribuidos: ~55 MB en FP16 (solo atención y cabeza de clasificación) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-Base, típicamente 512 tokens; no confirmado en la información) |
| Tipos de cuantizacion | no disponible (los pesos se publican en FP16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16) + código remoto `modeling_neuralops_bert.py` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 110 M de parámetros) y reemplaza en todas las capas el mecanismo de multi-head attention con softmax cuadrática por `primal_attention`, un operador de atención subcuadrática de la Attention Zoo de NeuralOps. La serialización es "attention-only": el repositorio contiene solo los pesos de atención entrenados y la cabeza de clasificación, mientras que el resto de los pesos de BERT se inicializan congelados desde el checkpoint original en tiempo de carga.

El entrenamiento sigue el NeuralOps Cached Representation Distillation Protocol, un esquema de dos etapas (alineamiento de subespacio oculto y luego KL sobre logits más entropía cruzada de la tarea) en el que las representaciones del profesor se cachean offline, de modo que no ocupa VRAM durante el ajuste. Se ejecutó sobre la partición de validación de SST-2 (872 muestras binarias) en una RTX 3090 de 24 GB, con 4 pasos de optimización, 283 s de duración, throughput efectivo de 115,8 tokens/s y un pico de VRAM de 8107 MB. No se detalla el número de tokens de entrenamiento ni la composición completa del dataset más allá de GLUE/SST-2.

## Capacidades

- Clasificación binaria de sentimiento en inglés (positivo/negativo) sobre texto corto y medio, formato SST-2.
- Inferencia con atención subcuadrática, lo que reduce el coste computacional asintótico frente a la atención cuadrática clásica en secuencias largas.
- Carga modular mediante la API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`) y mediante `transformers` con `trust_remote_code=True`.
- Integración con `AutoModelForSequenceClassification` y `AutoTokenizer`.
- No se documentan capacidades de generación de texto, tool calling, agentes, matemáticas, visión ni audio: el modelo es exclusivamente un clasificador de secuencias.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Análisis de sentimiento en reseñas de producto o comentarios de usuarios en inglés: el modelo está afinado específicamente en SST-2 y ofrece una exactitud de 91,86 %, suficiente para triage automático de opiniones a escala con bajo coste de inferencia.
- Moderación de contenido basada en polaridad: clasificación rápida de mensajes positivos/negativos como señal auxiliar en pipelines de moderación, aprovechando el reducido tamaño (110 M) y el bajo footprint de pesos (~55 MB).
- Investigación en atención eficiente: servir como referencia reproducible para comparar `primal_attention` frente a atención softmax estándar en una tarea GLUE concreta, con métricas publicadas de exactitud y entropía cruzada.
- Destilación y experimentación académica: el protocolo de destilación con representaciones cacheadas permite reproducir el ajuste en una sola GPU consumer (RTX 3090) en menos de 5 minutos, útil para laboratorios con recursos limitados.
- Despliegue en entornos con restricciones de memoria: al distribuir solo ~55 MB de pesos de atención más el BERT base congelado, encaja en instancias pequeñas o en CPU para inferencia por lotes de baja latencia.
- Clasificación por lotes en pipelines de datos: integrable como etapa de etiquetado automático en procesos ETL de texto en inglés, con throughput moderado y sin dependencia de GPUs de gama alta.
- Evaluación comparativa de mecanismos de atención: base para benchmarks internos de coste/calidad entre atención cuadrática y subcuadrática en tareas de clasificación.

## Benchmarks y rendimiento

Evaluación publicada en la model card sobre la partición de validación de GLUE SST-2 (872 muestras):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`primal_attention`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Exactitud SST-2 | 91,63 % | 92,09 % | 91,86 % | -0,23 % |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,2649 | convergido |

Telemetría de entrenamiento (clúster Sharif HPC, RTX 3090 24 GB): 283,0 s de duración, 4 pasos de optimización, 115,8 tokens/s efectivos, pico de VRAM de 8107 MB. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el pico durante el entrenamiento fue de 8107 MB en una RTX 3090, por lo que la inferencia en FP16 debería caber holgadamente en GPUs consumer de 8 GB o más.
- GPU recomendadas: cualquier GPU con soporte FP16; el propio autor usó una NVIDIA GeForce RTX 3090 (24 GB, Ampere). Para lotes pequeños basta con GPUs de gama media (RTX 3060/4060 en adelante) o incluso CPU.
- Cabe en GPU consumer: sí, dado el tamaño de BERT-Base (110 M) y el footprint de pesos de ~55 MB más el base congelado.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, la API de NeuralOps (`load_surgeried_model`, `load_pretrained_bert`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: throughput de entrenamiento de 115,8 tokens/s en RTX 3090; no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (exactitud) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-primal-attention-sst2` | 110 M (BERT-Base) | no disponible | 91,86 % | MIT | Hugging Face, librería `neuralops` |
| `bert-base-uncased` (profesor) | 110 M | 512 tokens (estándar BERT) | 91,63 % (según la model card) | Apache 2.0 | Hugging Face, `transformers` |
| Alternativas de atención eficiente tipo Longformer/BigBird | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de comparaciones con otros checkpoints de la Attention Zoo de NeuralOps ni con modelos subcuadráticos equivalentes; los datos de las filas alternativas no están confirmados en la model card.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación binaria de sentimiento en inglés; no sirve para generación, razonamiento ni otras tareas sin reentrenamiento de la cabeza.
- La evaluación se limita a 872 muestras de validación de SST-2; no hay validación en otros dominios ni en otros idiomas, por lo que la generalización fuera de reseñas de cine es incierta.
- Riesgo de alucinación no aplicable en sentido estricto (no genera texto), pero sí de clasificaciones erróneas en dominios alejados del corpus SST-2.
- Sesgos heredados de `bert-base-uncased` y de los datos de GLUE/SST-2, no auditados en la model card.
- Requiere `trust_remote_code=True` y la librería `neuralops` para la carga modular; el código remoto no ha sido auditado de forma independiente según la información disponible.
- La licencia MIT se aplica al checkpoint, pero el modelo base `bert-base-uncased` tiene su propia licencia (Apache 2.0) que conviene verificar para uso comercial.
- Los resultados del estudiante pre-KD (92,09 %) superan al profesor en la tabla publicada, lo que sugiere variabilidad estadística con solo 872 muestras; conviene tratar el delta de -0,23 % con cautela.
- No se documentan límites de longitud de contexto específicos para `primal_attention`; asumir el estándar de BERT (512 tokens) hasta confirmación.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-primal-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE: https://huggingface.co/datasets/glue
- Dataset SST-2: https://huggingface.co/datasets/sst2
