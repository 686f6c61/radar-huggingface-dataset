# Hooshaai/bert-rala-attention-sst2

## Resumen

Hooshaai/bert-rala-attention-sst2 es un checkpoint de clasificación de sentimiento derivado de google-bert/bert-base-uncased en el que se han sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `rala_attention` de la librería NeuralOps. El modelo lo publica el usuario Hooshaai (el model card cita como autor a Taha Majlesi y el repositorio github.com/tahamajs/NeuralOps) y está afinado sobre la tarea SST-2 del benchmark GLUE para clasificación binaria de sentimiento en inglés.

La relevancia del checkpoint es experimental antes que práctica: sirve como evidencia empírica de que es posible destilar un BERT-Base completo hacia un mecanismo de atención subcuadrática (complejidad efectiva O(N) u O(N log N) frente a O(N²) de la atención multi-cabeza estándar) manteniendo una precisión razonable en una tarea concreta. El proceso de destilación se ejecutó en una única NVIDIA RTX 3090 de 24 GB en 49,3 segundos y 211 pasos de optimización.

El resultado medido es una accuracy del 77,52 % en el split de validación de SST-2 (872 muestras), frente al 91,63 % del profesor BERT-Base original y al 72,59 % del estudiante antes de la destilación. El repositorio es deliberadamente modular: solo distribuye los pesos de atención y la cabeza de clasificación en FP16 (~55 MB), no el modelo completo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-Base con atención `rala_attention` (subcuadrática) en las 12 capas |
| Parametros totales | 110M (base BERT-Base); el repo solo publica los pesos de atención y la cabeza de clasificación |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el model card no especifica la ventana máxima; BERT-Base original soporta 512 tokens) |
| Tipos de cuantizacion | FP16 para los pesos de atención publicados; el resto de cuantizaciones no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, FP16, ~55 MB); requiere `trust_remote_code=True` y descarga los pesos base de `bert-base-uncased` |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura BERT-Base (transformer encoder de 12 capas, 110M de parámetros) e intercambia el bloque de self-attention softmax cuadrática por `rala_attention`, un mecanismo de la Attention Zoo de NeuralOps con complejidad operativa efectiva O(N) u O(N log N). La serialización es modular: el repositorio solo contiene los parámetros de atención especializados y la cabeza de clasificación de la tarea en FP16 (~55 MB), mientras que el código remoto (`modeling_neuralops_bert.py`) inicializa los pesos congelados del BERT base desde `bert-base-uncased` y aplica los pesos destilados en tiempo de carga.

El entrenamiento sigue el NeuralOps Cached Representation Distillation Protocol, estructurado en dos etapas: primero una alineación de subespacio oculto y después una combinación de KL sobre logits más entropía cruzada de la tarea. La destilación se ejecutó sin asignar VRAM al profesor gracias al cacheado offline de representaciones, con un pico de 8714 MB en una RTX 3090, 211 pasos de optimización, 49,3 segundos de duración y un throughput efectivo de 35.035,4 tokens/s. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset más allá de GLUE/SST-2.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, tarea SST-2 de GLUE.
- Clasificación de secuencias de texto mediante `AutoModelForSequenceClassification` con `trust_remote_code=True`.
- Carga modular a través de la API `neuralops.hub.bert_zoo.load_pretrained_bert` y de `neuralops.hub.load_surgeried_model`.
- Inferencia con atención subcuadrática, lo que en teoría reduce el coste computacional en secuencias largas frente a la atención cuadrática.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni modo thinking.
- No se documenta soporte multilingüe más allá del inglés.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica reseñas en inglés en positivas o negativas; su tamaño de 110M y su atención subcuadrática lo hacen apto para procesar lotes grandes en CPU o GPU modesta.
- Moderación de comentarios en foros y redes: filtrado previo de toxicidad o polaridad negativa en textos cortos en inglés, aprovechando la baja huella de memoria (~55 MB de pesos de atención más el BERT base congelado).
- Investigación sobre atención eficiente: banco de pruebas para comparar `rala_attention` frente a atención softmax estándar en una tarea GLUE concreta, con métricas reproducibles publicadas (77,52 % de accuracy).
- Destilación y experimentación académica: ejemplo reproducible de un pipeline de destilación con profesor cacheado offline, útil para estudiar técnicas de knowledge distillation sin necesidad de grandes clústeres.
- Clasificación de tickets de soporte: etiquetado automático de urgencia o sentimiento en mensajes de clientes en inglés dentro de un pipeline de atención al cliente.
- Prototipado rápido en entornos con poca VRAM: al requerir solo una RTX 3090 (o menos) para entrenamiento y ser ligero en inferencia, sirve para validar ideas de arquitecturas de atención antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados publicados en el model card sobre el split de validación de GLUE SST-2 (872 muestras binarias):

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`rala_attention`) | Modelo destilado post-KD | Delta |
|---|---|---|---|---|
| Accuracy GLUE SST-2 | 91,63 % | 72,59 % | 77,52 % | +4,93 % |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,5185 | convergido |

Telemetría de entrenamiento: RTX 3090 24 GB, 49,3 s, 211 pasos, 35.035,4 tokens/s, pico de VRAM de 8714 MB.

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del BERT-Base subyacente (110M de parámetros) y los ~55 MB de pesos de atención en FP16, cabe holgadamente en GPUs de consumo.
- GPU recomendadas: el model card documenta entrenamiento en una NVIDIA GeForce RTX 3090 (24 GB); para inferencia basta con GPUs consumer de gama media o incluso CPU.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del modelo.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`; API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de inferencia; solo se reporta throughput de entrenamiento (35.035,4 tokens/s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hooshaai/bert-rala-attention-sst2 | 110M (base) | no disponible | 77,52 % | MIT | Hugging Face (repo modular) |
| google-bert/bert-base-uncased (profesor) | 110M | 512 tokens | 91,63 % (referencia del card) | Apache 2.0 | Hugging Face |
| Modelos de atención eficiente tipo Longformer/BigBird | variable | 4096+ tokens | no disponible en esta información | variable | Hugging Face |

La comparación directa con alternativas de atención subcuadrática (Longformer, BigBird, Performer) no está disponible en la información proporcionada; el propio model card solo compara contra el profesor BERT-Base y el estudiante pre-destilación.

## Limitaciones y advertencias

- Pérdida de accuracy notable frente al profesor: 77,52 % frente a 91,63 % en SST-2, una caída de más de 14 puntos porcentuales.
- Entropía cruzada de validación elevada (0,5185), lo que sugiere una calibración de probabilidades deficiente.
- Modelo monolingüe (inglés) y especializado exclusivamente en clasificación binaria de sentimiento; no es un modelo de propósito general.
- Requiere `trust_remote_code=True` y ejecuta código remoto del autor, lo que implica un riesgo de seguridad que debe evaluarse antes de usarlo en producción.
- Dependencia de la librería NeuralOps y de la descarga de los pesos base de `bert-base-uncased` en tiempo de carga; no es un checkpoint autocontenido.
- Riesgo de alucinación y sesgos: no se documentan análisis de sesgo ni evaluaciones de robustez; al derivar de BERT-Base hereda los sesgos de su corpus de preentrenamiento.
- Licencia MIT permite uso comercial, pero el model card no ofrece garantías ni soporte; la reproducibilidad depende de la versión de NeuralOps y de Transformers.
- El número de descargas (61) y de likes (0) indica una adopción muy baja; no hay validación independiente de los resultados publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-rala-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE: https://huggingface.co/datasets/glue
- Dataset SST-2: https://huggingface.co/datasets/sst2
