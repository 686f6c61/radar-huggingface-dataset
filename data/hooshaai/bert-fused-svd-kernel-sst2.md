# Hooshaai/bert-fused-svd-kernel-sst2

## Resumen

`Hooshaai/bert-fused-svd-kernel-sst2` es un checkpoint derivado de `google-bert/bert-base-uncased` en el que se han sustituido los bloques de atencion softmax cuadratica de las 12 capas del transformer por el mecanismo `fused_svd_kernel`, perteneciente a la libreria NeuralOps (attention zoo). El autor del modelo es Hooshaai y el codigo asociado se atribuye a Taha Majlesi en el repositorio NeuralOps. El objetivo es demostrar que un mecanismo de atencion subcuadratica puede igualar practicamente el rendimiento de BERT-Base en una tarea de clasificacion de sentimiento tras un proceso de destilacion de conocimiento.

El modelo se ha entrenado y evaluado sobre la tarea SST-2 del benchmark GLUE (clasificacion binaria de sentimiento en ingles), alcanzando un 90,71 % de accuracy en el split de validacion, frente al 91,63 % del profesor original `bert-base-uncased`. La propuesta de valor es la eficiencia: el checkpoint distribuido contiene unicamente los pesos de atencion y la cabeza de clasificacion en FP16 (~55 MB), y la atencion opera con complejidad efectiva O(N) u O(N log N) en lugar de O(N^2).

Es relevante ahora como pieza de investigacion reproducible sobre atencion subcuadratica aplicada a modelos tipo BERT, con un protocolo de destilacion que evita cargar el profesor en VRAM (cached representation distillation) y que se ejecuto en una unica RTX 3090 en 50,3 segundos. No obstante, se trata de un artefacto muy especializado: una sola tarea, un solo idioma y una integracion que depende de codigo remoto y de la libreria NeuralOps.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atencion `fused_svd_kernel` (subcuadratica) en las 12 capas |
| Parametros totales | 110 M (base BERT-Base); el repo distribuye solo pesos de atencion y cabeza (~55 MB en FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-Base soporta 512 tokens; la model card no especifica el contexto del kernel) |
| Tipos de cuantizacion | FP16 en los pesos de atencion distribuidos; no se documentan otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, FP16, attention-only) |

## Arquitectura y entrenamiento

Se parte de `bert-base-uncased` (12 capas, 110 M de parametros, encoder bidireccional). En cada capa se reemplaza la atencion multi-cabeza estandar por `fused_svd_kernel`, un mecanismo de la familia de atencion subcuadratica que, segun la model card, reduce la complejidad operativa efectiva de O(N^2) a O(N) u O(N log N). El resto de la arquitectura (embeddings, feed-forward, normalizaciones) permanece congelado y se inicializa desde el modelo base original, de modo que el repositorio solo almacena los pesos de atencion entrenados y la cabeza de clasificacion, serializados en FP16 (~55 MB).

El entrenamiento sigue el protocolo NeuralOps Cached Representation Distillation, en dos etapas: primero una alineacion de representaciones ocultas en subespacio y despues una combinacion de KL sobre logits del profesor y entropia cruzada de la tarea. El profesor no se mantiene en VRAM durante el entrenamiento porque las representaciones se cachean offline. La ejecucion se realizo en una NVIDIA GeForce RTX 3090 (24 GB), con 276 pasos de optimizacion, 50,3 segundos de duracion, throughput efectivo de 44.992,8 tokens/s y un pico de VRAM de 13.512 MB. El resultado: el estudiante pasa de un 69,84 % de accuracy antes de la destilacion a un 90,71 % despues, con una entropia cruzada de validacion de 0,3001.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en ingles, tarea SST-2 de GLUE.
- Clasificacion de secuencias de texto en general mediante la cabeza `AutoModelForSequenceClassification` (entrenada especificamente para SST-2).
- Inferencia con atencion subcuadratica, lo que en teoria permite manejar secuencias largas con menor coste asintotico que la atencion cuadratica estandar.
- Integracion con `transformers` mediante `trust_remote_code=True` y con la API de carga de la libreria NeuralOps (`load_pretrained_bert`, `load_surgeried_model`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision ni audio.
- Capacidad multilingue: no disponible; el modelo esta entrenado y evaluado solo en ingles.

## Casos de uso

- Analisis de sentimiento en resenas de producto o comentarios de usuarios en ingles: el modelo clasifica directamente polaridad positiva o negativa con una accuracy de validacion del 90,71 % en SST-2, suficiente para tareas de moderacion o priorizacion de quejas.
- Clasificacion de tickets de soporte: se puede usar como primera etapa de un pipeline para separar feedback positivo de negativo y enrutar automaticamente a los equipos correspondientes.
- Investigacion sobre atencion subcuadratica: sirve como checkpoint de referencia reproducible para comparar `fused_svd_kernel` con atencion softmax estandar en tareas de comprension de lenguaje.
- Destilacion de conocimiento: el protocolo y los pesos permiten reproducir el experimento de destilacion con cache offline de representaciones en una sola GPU de 24 GB.
- Experimentos de eficiencia en produccion: al distribuir solo ~55 MB de pesos de atencion, es util para probar el reemplazo de atencion en un BERT congelado sin reentrenar el modelo completo.
- Benchmarking de kernels de atencion: sirve para medir latencia y throughput de `fused_svd_kernel` frente a MHA en hardware consumer como la RTX 3090.
- Filtrado de datos en pipelines de NLP: clasificacion rapida de grandes volumenes de texto en ingles para etiquetado de sentimiento previo a etapas mas costosas.

## Benchmarks y rendimiento

Evaluacion sobre el split de validacion de GLUE SST-2 (872 muestras de clasificacion binaria):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-destilacion (`fused_svd_kernel`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 69,84 % | 90,71 % | +20,87 pp |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,3001 | no disponible |

Telemetria de entrenamiento (RTX 3090 24 GB):

| Metrica | Valor |
|---|---|
| Duracion del entrenamiento | 50,3 s |
| Pasos de optimizacion | 276 |
| Throughput efectivo | 44.992,8 tokens/s |
| Pico de VRAM | 13.512 MB |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: el modelo base BERT-Base en FP32 ocupa aproximadamente 440 MB de pesos; con los pesos de atencion en FP16 (~55 MB) el pico de memoria para inferencia es inferior a 1 GB para secuencias cortas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para inferencia en FP16; el entrenamiento documentado se hizo en una RTX 3090 (24 GB) con pico de 13.512 MB.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; API de la libreria NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de latencia de inferencia; solo el throughput de entrenamiento (44.992,8 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-fused-svd-kernel-sst2` | 110 M (base) | no disponible | 90,71 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % (en esta evaluacion) | Apache 2.0 | Hugging Face, `transformers` estandar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, `transformers` estandar |
| `roberta-base` fine-tuned en SST-2 | 125 M | 512 tokens | no disponible en la informacion proporcionada | MIT | Hugging Face |

La comparativa se limita a los datos publicados en la model card; no se dispone de resultados homogeneos de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en ingles y en una sola tarea (SST-2); no es un modelo de proposito general.
- Riesgo de alucinacion no aplica directamente al ser un clasificador, pero la calibracion es limitada: la entropia cruzada del estudiante (0,3001) es superior a la del profesor (0,2428).
- El estudiante pre-destilacion cae al 69,84 % de accuracy, lo que indica que el kernel por si solo no reproduce el comportamiento de la atencion softmax sin destilacion.
- Dependencia de codigo remoto (`trust_remote_code=True`) y de la libreria NeuralOps; la integracion con el ecosistema `transformers` estandar no es directa.
- Los pesos distribuidos son solo de atencion y cabeza de clasificacion; requieren descargar `bert-base-uncased` como base congelada.
- Licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` esta bajo Apache 2.0, cuyas condiciones deben respetarse.
- No se documentan sesgos especificos ni evaluaciones de robustez o seguridad; al derivar de BERT-Base, hereda los sesgos de su corpus de entrenamiento.
- No hay soporte documentado para generacion, tool calling, agentes ni otras modalidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-fused-svd-kernel-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE / SST-2: https://huggingface.co/datasets/glue
