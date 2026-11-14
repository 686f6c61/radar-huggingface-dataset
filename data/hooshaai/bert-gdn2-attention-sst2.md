# Hooshaai/bert-gdn2-attention-sst2

## Resumen

`bert-gdn2-attention-sst2` es un checkpoint experimental publicado por el usuario Hooshaai (la model card atribuye el trabajo a Taha Majlesi y a la librería NeuralOps) que parte de `google-bert/bert-base-uncased` y sustituye los bloques de atención softmax cuadrática de sus 12 capas por el mecanismo `gdn2_attention`, una atención subcuadrática de complejidad efectiva O(N) u O(N log N). El modelo se ha ajustado y evaluado sobre la tarea SST-2 del benchmark GLUE mediante un protocolo de destilación de representaciones en caché (Cached Representation Distillation) ejecutado en una única RTX 3090.

El interés del artefacto no es su calidad predictiva, sino su función como sonda arquitectónica: demuestra que es posible serializar únicamente los pesos de atención y la cabeza de clasificación en FP16 (unos 55 MB) y reconstruir el modelo completo cargando en tiempo de ejecución los pesos congelados de BERT-Base desde el Hub. La arquitectura subyacente es un transformer encoder de 110 millones de parámetros con vocabulario en inglés y contexto nominal de 512 tokens.

Los resultados publicados son muy limitados: la precisión en la partición de validación de SST-2 es del 49,08 %, frente al 91,63 % del profesor BERT-Base, lo que sitúa al modelo prácticamente en el nivel de azar para una clasificación binaria. Se trata, por tanto, de una prueba de concepto de investigación, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atención `gdn2_attention` subcuadrática en las 12 capas |
| Parametros totales | 110 M (heredados de `bert-base-uncased`); pesos propios serializados: ~55 MB en FP16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de BERT-Base; no se especifica otra en la model card) |
| Tipos de cuantizacion | FP16 en los pesos de atención publicados; no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, solo atención y cabeza de clasificación); requiere código remoto (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo reutiliza la pila de 12 capas de `bert-base-uncased` pero reemplaza la atención multi-cabeza estándar por `gdn2_attention`, un mecanismo de la librería NeuralOps que promete escalado subcuadrático (O(N) u O(N log N)) frente al O(N²) de la atención softmax convencional. Los pesos base de BERT permanecen congelados y se inicializan desde el repositorio original; el repositorio solo almacena los parámetros de atención ajustados y la cabeza de clasificación, lo que explica su reducido tamaño de descarga.

El entrenamiento siguió el protocolo Cached Representation Distillation de NeuralOps, con alineación offline de representaciones ocultas (etapa 1) y destilación de logits con entropía cruzada de tarea (etapa 2). Según la model card, el proceso se ejecutó en una RTX 3090 de 24 GB, con una duración total de 65,3 segundos, 8 pasos de optimización, un throughput efectivo de 1004,2 tokens/s y un pico de VRAM de 23 021 MB. No se detalla el volumen de tokens de entrenamiento ni la composición exacta del dataset más allá de la tarea SST-2 de GLUE.

## Capacidades

- Clasificación de secuencias binaria (análisis de sentimiento positivo/negativo) sobre textos en inglés.
- Inferencia mediante `AutoModelForSequenceClassification` de Transformers con `trust_remote_code=True`.
- Carga modular a través de la API `neuralops.hub.bert_zoo.load_pretrained_bert` y `load_surgeried_model`.
- Reconstrucción bajo demanda: el código remoto inicializa los pesos congelados de BERT-Base y aplica encima los parámetros de atención destilados.
- No se documentan capacidades de generación de texto, tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Multilingüismo: no disponible; el modelo está entrenado y evaluado únicamente en inglés.

## Casos de uso

- Investigación sobre atención subcuadrática: sirve como referencia reproducible para comparar `gdn2_attention` con la atención softmax estándar en una tarea controlada de GLUE, gracias a que el checkpoint y el protocolo de destilación están documentados.
- Prototipado de serialización modular de pesos: útil para equipos que quieran evaluar el esquema de pesos "attention-only" de NeuralOps y su reconstrucción en tiempo de carga con `trust_remote_code`.
- Pruebas de integración de la librería NeuralOps: el modelo permite validar el flujo `load_surgeried_model` y el pipeline de código remoto antes de adoptar la librería en proyectos mayores.
- Docencia y experimentación académica: ejemplo compacto (55 MB) de sustitución de mecanismos de atención en un transformer preentrenado, adecuado para laboratorios con recursos limitados.
- Benchmarking de herramientas de despliegue: puede emplearse para medir la sobrecarga de `trust_remote_code` y de la carga de pesos remotos en frameworks como Transformers o TGI.
- No se recomienda su uso en atención al cliente, moderación de contenido, análisis de sentimiento en producción ni ninguna tarea donde se requiera precisión superior al azar, dado el 49,08 % de accuracy reportado.

## Benchmarks y rendimiento

Evaluación sobre la partición de validación de GLUE SST-2 (872 muestras binarias), según la model card:

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado |
|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 50,92 % | 49,08 % |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,6984 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo ronda los 110 M de parámetros; en FP32 requiere aproximadamente 0,44 GB y en FP16 unos 0,22 GB, más overhead de activaciones y del código remoto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; la model card documenta el entrenamiento en una NVIDIA GeForce RTX 3090 de 24 GB.
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; la integración con vLLM, llama.cpp, Ollama o TGI no está documentada y requeriría adaptar el código remoto, ya que el checkpoint no incluye los pesos base completos.
- Latencia y throughput: la model card reporta 1004,2 tokens/s durante el entrenamiento en una RTX 3090; no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-gdn2-attention-sst2` | 110 M (55 MB de pesos propios) | 512 | 49,08 % | MIT | Hugging Face, requiere código remoto |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 | 91,63 % (referencia de la model card) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | no disponible en la información proporcionada | Apache 2.0 | Hugging Face |

La comparación con alternativas de atención subcuadrática (por ejemplo, variantes lineales de BERT) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento próximo al azar: 49,08 % de accuracy en una tarea binaria implica que el modelo no es fiable para clasificación real.
- El propio autor etiqueta el resultado como "Subquadratic Probe", señalando que se trata de una sonda experimental y no de un modelo afinado para producción.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código Python arbitrario del repositorio; conviene auditar `modeling_neuralops_bert.py` antes de usarlo.
- Dependencia de la descarga de `bert-base-uncased` en tiempo de carga: sin conexión al Hub o sin los pesos base, el modelo no se puede reconstruir.
- Solo inglés; no hay evidencia de comportamiento multilingüe.
- Contexto limitado a 512 tokens, insuficiente para documentos largos.
- Riesgo de alucinación no aplicable directamente (es un clasificador), pero sí de predicciones erróneas sistemáticas por el bajo rendimiento.
- Sesgos: no se documenta ningún análisis de sesgos; al heredar el corpus de BERT-Base y SST-2, es previsible que arrastre sesgos de dominio y de anotación de reseñas de cine.
- Licencia MIT permisiva para uso comercial, pero el uso comercial no está recomendado por la falta de calidad predictiva.
- Repositorio con 84 descargas y 0 likes en el momento de la consulta; ecosistema muy pequeño y sin validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-gdn2-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue
