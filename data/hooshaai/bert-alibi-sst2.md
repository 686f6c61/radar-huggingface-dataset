# Hooshaai/bert-alibi-sst2

## Resumen

`Hooshaai/bert-alibi-sst2` es un checkpoint de BERT-Base afinado para clasificación binaria de sentimiento (GLUE SST-2) en el que los bloques de atención softmax cuadrática de las 12 capas del transformer se han sustituido por el mecanismo `alibi` (Attention with Linear Biases) de la librería NeuralOps. El modelo parte de `google-bert/bert-base-uncased` (110 M parámetros, encoder transformer de 12 capas) y se distribuye como pesos modulares de solo atención en FP16 (~55 MB) que se reconstruyen sobre los pesos congelados del BERT base descargados al vuelo.

La propuesta del autor es demostrar que es posible sustituir la atención cuadrática O(N²) por una variante subcuadrática O(N) u O(N log N) y recuperar la precisión del profesor original mediante destilación de representaciones en caché (NeuralOps Cached Representation Distillation Protocol), sin necesidad de mantener el profesor en VRAM. Según la model card, el estudiante pre-destilación cae al 83,03 % de accuracy en SST-2 y tras la destilación alcanza el 91,40 %, frente al 91,63 % del BERT-Base profesor.

Es relevante ahora como pieza de referencia dentro del "attention zoo" de NeuralOps: un banco de pruebas reproducible de mecanismos de atención eficientes aplicados a un backbone estándar, con métricas de destilación y telemetría de entrenamiento publicadas. No obstante, conviene tratarlo como artefacto de investigación y no como modelo listo para producción: el repo tiene 85 descargas, 0 likes y depende de código remoto (`trust_remote_code=True`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atención `alibi` (subcuadrática, O(N) u O(N log N)) en las 12 capas |
| Parametros totales | 110 M (BERT-Base); se distribuyen solo pesos de atención y cabeza de clasificación en FP16 (~55 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-Base, 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, FP16) + código remoto `modeling_neuralops_bert.py` |

## Arquitectura y entrenamiento

El modelo es un BERT-Base estándar (12 capas, 768 dimensiones ocultas, 12 cabezas de atención, ~110 M parámetros) en el que cada bloque de self-attention softmax se reemplaza por el mecanismo `alibi`, que introduce sesgos lineales dependientes de la distancia relativa entre posiciones en lugar de calcular la matriz completa de atención cuadrática. Según la model card, la complejidad operativa efectiva pasa de O(N²) a O(N) u O(N log N), lo que en principio permite secuencias más largas con menor coste de memoria y cómputo, aunque la longitud de contexto efectiva del checkpoint no se especifica.

El entrenamiento se realizó con el protocolo NeuralOps Cached Representation Distillation en dos etapas: primero alineamiento de subespacio oculto y después KL sobre logits más entropía cruzada de la tarea, con el profesor (`bert-base-uncased` afinado en SST-2) cacheado offline para no ocupar VRAM. La ejecución física se hizo en una NVIDIA GeForce RTX 3090 (24 GB) con 248 pasos de optimización, 47,2 segundos de entrenamiento, throughput de 43.002,5 tokens/s y pico de VRAM de 8.487 MB. El dataset es GLUE SST-2 (clasificación binaria de sentimiento), en inglés.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, con una única etiqueta de salida.
- Inferencia con `AutoModelForSequenceClassification` de Transformers usando `trust_remote_code=True`, o mediante la API `neuralops.hub.bert_zoo.load_pretrained_bert`.
- Carga modular: solo se descargan los pesos de atención y la cabeza de tarea; el backbone congelado se inicializa desde `bert-base-uncased`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: no; solo inglés.
- No es un modelo generativo: no produce texto libre, únicamente logits de clasificación.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: clasificar reseñas cortas en inglés en positivas o negativas con un modelo de 110 M parámetros y ~55 MB de pesos descargables, adecuado para entornos con poco almacenamiento.
- Moderación de comentarios en foros: filtrar automáticamente mensajes con tono negativo en pipelines de pre-moderación, aprovechando la baja huella de memoria del checkpoint modular.
- Investigación sobre atención eficiente: usar el checkpoint como referencia reproducible para comparar `alibi` frente a softmax cuadrática en una tarea GLUE con métricas publicadas (91,40 % frente a 91,63 % del profesor).
- Benchmark de destilación: servir como línea base para evaluar el protocolo NeuralOps Cached Representation Distillation en otras tareas GLUE o en otros mecanismos del attention zoo.
- Clasificación por lotes en CPU o GPU de gama baja: al ser un BERT-Base, cabe en GPUs consumer y se puede servir con ONNX Runtime o TorchServe para volúmenes moderados de texto en inglés.
- Docencia y experimentación: ejemplo práctico de sustitución de atención en un backbone conocido, con telemetría de entrenamiento publicada (pasos, VRAM, throughput) que facilita reproducir el experimento.

## Benchmarks y rendimiento

Evaluación publicada en la model card sobre el split de validación de GLUE SST-2 (872 muestras):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`alibi`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 83,03 % | 91,40 % | +8,37 % |
| Cross-entropy de validación | 0,2428 | sin calibrar | 0,2994 | convergido |

No se han publicado resultados de benchmarks en la informacion disponible para otras tareas (MMLU, HumanEval, GSM8K u otras) ni comparativas con otros mecanismos de atención eficiente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP16 para el modelo completo (110 M parámetros); el pico de VRAM durante el entrenamiento reportado fue de 8.487 MB en una RTX 3090.
- GPU recomendadas: cualquier GPU con al menos ~2 GB de VRAM; el autor entrenó en una NVIDIA GeForce RTX 3090 (24 GB).
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU para inferencia por lotes.
- Opciones de despliegue: Transformers con `trust_remote_code=True`, API `neuralops.hub`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible para inferencia; durante el entrenamiento se reportaron 43.002,5 tokens/s en RTX 3090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-alibi-sst2` | 110 M | no disponible | 91,40 % (validación) | MIT | Hugging Face, 85 descargas |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % (validación, según la model card) | Apache 2.0 | Hugging Face, ampliamente usado |
| BERT-Base con atención softmax estándar afinado en SST-2 | 110 M | 512 tokens | no disponible en la información proporcionada | Apache 2.0 | Hugging Face |
| Otros modelos del NeuralOps attention zoo | no disponible | no disponible | no disponible | MIT | Hugging Face |

## Limitaciones y advertencias

- Solo clasificación binaria de sentimiento en inglés; no es un modelo generativo ni multilingüe.
- Depende de código remoto (`trust_remote_code=True`) para reconstruir los pesos de atención sobre el backbone congelado; auditar `modeling_neuralops_bert.py` antes de usarlo en producción.
- La model card referencia la organización `tahamajs` en los ejemplos y en la cita, mientras que el repositorio pertenece a `Hooshaai`; verificar que los identificadores de carga funcionan antes de integrarlo.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en dominios distintos de SST-2 (reseñas de películas); no se documenta evaluación fuera de dominio.
- Sesgos: no se documentan análisis de sesgo; al heredar el backbone `bert-base-uncased` y el dataset SST-2, es probable que arrastre sesgos de dominio y de registro lingüístico del corpus original.
- Licencia MIT permite uso comercial, pero la licencia del backbone subyacente (`bert-base-uncased`, Apache 2.0) debe respetarse igualmente.
- Longitud de contexto efectiva no confirmada; aunque el mecanismo `alibi` es subcuadrático, no se publican experimentos con secuencias superiores a las de SST-2.
- Repositorio con muy poca tracción (85 descargas, 0 likes) y creado en noviembre de 2026; tratar como artefacto de investigación sin garantías de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-alibi-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/glue
