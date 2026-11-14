# Hooshaai/bert-adaptive-span-attention-sst2

## Resumen

`Hooshaai/bert-adaptive-span-attention-sst2` es un checkpoint de BERT-Base (110M parámetros) en el que se han sustituido los bloques de atención softmax cuadrática de sus 12 capas por el mecanismo `adaptive_span_attention` de la librería NeuralOps. El objetivo es demostrar que es posible mantener la precisión de un transformer estándar en una tarea de clasificación de secuencias (SST-2) con una complejidad operativa subcuadrática, O(N) u O(N log N), frente a la O(N²) de la multi-head attention clásica. Lo publica el autor Taha Majlesi bajo el paraguas del proyecto NeuralOps (repositorio `tahamajs/NeuralOps`), y el identificador de Hugging Face aparece bajo la organización `Hooshaai`.

El modelo se ha destilado sobre la partición de validación de GLUE SST-2 (872 muestras binarias) usando el protocolo *Cached Representation Distillation* de NeuralOps, con alineamiento offline de representaciones y sin asignar VRAM al profesor durante el entrenamiento. El resultado reportado es una exactitud del 91,06 % en SST-2, frente al 91,63 % del profesor `bert-base-uncased`, una caída de 0,69 puntos. Es relevante ahora porque ejemplifica una vía de eficiencia atencional aplicada a un backbone consolidado como BERT, con pesos modulares de solo ~55 MB.

La distribución no incluye los pesos completos de BERT: el repositorio almacena únicamente los pesos de atención y la cabeza de clasificación en FP16 (`attention_weights.safetensors`), y el código remoto (`modeling_neuralops_bert.py`) reconstruye el modelo base desde `bert-base-uncased` en tiempo de carga. El entrenamiento se ejecutó en una NVIDIA RTX 3090 (24 GB) en 35,4 segundos y 155 pasos de optimización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atención `adaptive_span_attention` en las 12 capas |
| Parametros totales | 110M (backbone BERT-Base); pesos publicados ~55 MB en FP16 (solo atención y cabeza) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la información proporcionada) |
| Tipos de cuantizacion | FP16 en los pesos publicados; no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, FP16) con código remoto Python |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder de 12 capas y 110M de parámetros, y reemplaza en cada capa el bloque de multi-head attention softmax cuadrática por `adaptive_span_attention`, un mecanismo de atención dispersa adaptativa que aprende spans de contexto de longitud variable. Según la model card, la complejidad efectiva pasa de O(N²) a O(N) u O(N log N). La serialización es modular: solo se publican los pesos de atención y la cabeza de clasificación, y el código remoto inicializa los pesos congelados del backbone desde el modelo base original y aplica encima los parámetros destilados.

El entrenamiento sigue el protocolo *Cached Representation Distillation* de NeuralOps, dividido en dos etapas: primero un alineamiento de subespacio oculto (Stage 1 Subspace Hidden Alignment) y después una combinación de divergencia KL sobre logits y entropía cruzada de la tarea (Stage 2 Logit KL + Task CE). El profesor es `bert-base-uncased` y las representaciones se cachean offline, de modo que no consume VRAM durante el entrenamiento. La ejecución se realizó en una RTX 3090 de 24 GB, con 155 pasos, 35,4 segundos de duración, throughput efectivo de 35 850 tokens/s y un pico de VRAM de 7 389 MB. El dataset de evaluación y ajuste es GLUE SST-2.

## Capacidades

- Clasificación de secuencias binaria (análisis de sentimiento positivo/negativo) sobre texto en inglés, con salida de logits vía `AutoModelForSequenceClassification`.
- Atención subcuadrática adaptativa: el mecanismo aprende spans de contexto variables, lo que en teoría reduce el coste computacional en secuencias largas.
- Carga modular mediante `trust_remote_code=True` o mediante la API `neuralops.hub.bert_zoo.load_pretrained_bert` y `neuralops.hub.load_surgeried_model`.
- Compatibilidad con el ecosistema Hugging Face Transformers para pipelines de `text-classification`.
- No soporta tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo thinking: es un clasificador de secuencias, no un modelo generativo.
- Capacidad multilingüe limitada al inglés, heredada de `bert-base-uncased`.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica texto en inglés en positivo o negativo con una exactitud reportada del 91,06 % en SST-2, adecuado para moderación y agregación de opiniones a escala.
- Filtrado de comentarios en foros y redes: al ser un clasificador ligero (backbone de 110M y pesos de atención de ~55 MB), se puede desplegar en CPU o GPU de gama baja para prefiltrar contenido antes de un modelo mayor.
- Enrutamiento de tickets de soporte: clasificación binaria de tono (cliente satisfecho o insatisfecho) para priorizar colas de atención al cliente.
- Investigación en eficiencia atencional: sirve como referencia reproducible para comparar `adaptive_span_attention` frente a atención softmax estándar en GLUE, dado que el protocolo de destilación y las métricas están documentados.
- Benchmark de destilación: útil para validar pipelines de *knowledge distillation* con caché offline de representaciones, ya que el coste de entrenamiento reportado es de 35,4 s en una RTX 3090.
- Prototipado de clasificadores con pesos modulares: el formato de solo atención permite experimentar con distintos backbones BERT sin duplicar los 450 MB de pesos base en cada variante.
- Evaluación de robustez de atención dispersa: permite medir la degradación de precisión al sustituir atención cuadrática por subcuadrática en tareas cortas de GLUE.

## Benchmarks y rendimiento

Evaluación sobre la partición de validación de GLUE SST-2 (872 muestras binarias), según la model card:

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado | Delta |
|---|---|---|---|---|
| Exactitud GLUE SST-2 | 91,63 % | 91,74 % | 91,06 % | -0,69 % |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,2964 | no disponible |

Telemetría de entrenamiento: RTX 3090 24 GB, 35,4 s, 155 pasos, 35 850 tokens/s, pico de VRAM 7 389 MB. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el backbone BERT-Base en FP32 ronda los 440 MB de pesos, y el pico de entrenamiento reportado fue de 7 389 MB en una RTX 3090.
- GPU recomendadas: NVIDIA RTX 3090 (la usada en el entrenamiento); cualquier GPU con al menos ~2 GB de VRAM debería bastar para inferencia en FP16, aunque no se documenta.
- Cabe en GPU de consumo: sí, el backbone de 110M y los pesos de atención de ~55 MB son manejables en GPUs de gama media y baja; también es viable en CPU.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`, API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: throughput de entrenamiento de 35 850 tokens/s en RTX 3090; no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-adaptive-span-attention-sst2` | 110M (backbone) + ~55 MB atención | no disponible | 91,06 % | MIT | Hugging Face, código remoto |
| `google-bert/bert-base-uncased` (profesor) | 110M | 512 tokens (estándar BERT) | 91,63 % | Apache 2.0 | Hugging Face |
| BERT-Base fine-tuned en SST-2 (referencia habitual) | 110M | 512 tokens | ~92-93 % en configuraciones estándar | Apache 2.0 | Hugging Face |

La comparación con otros mecanismos de atención subcuadrática (Longformer, BigBird, Linformer) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo realiza clasificación binaria de sentimiento en inglés; no genera texto ni soporta instrucciones.
- La exactitud reportada (91,06 %) procede de una única partición de validación de SST-2 con 872 muestras; no hay evaluación en otros conjuntos de GLUE ni en dominios fuera de reseñas.
- El identificador del repositorio en Hugging Face (`Hooshaai/...`) no coincide con el autor citado en la model card (`tahamajs`); conviene verificar la procedencia antes de usarlo en producción.
- Los ejemplos de código de la model card referencian `tahamajs/bert-adaptive-span-attention-sst2`, no el ID del repositorio actual, lo que puede provocar errores de carga.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código Python del autor; hay que auditar `modeling_neuralops_bert.py` antes de desplegarlo.
- Los pesos publicados son solo de atención y cabeza; el backbone se descarga desde `bert-base-uncased` en tiempo de carga, así que la reproducibilidad depende de la disponibilidad de ese modelo base.
- No se documentan sesgos específicos, pero hereda los de `bert-base-uncased` entrenado con corpus web en inglés.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas en textos ambiguos, sarcasmo o dominios distintos de SST-2.
- Licencia MIT permite uso comercial, pero la licencia del backbone subyacente (`bert-base-uncased`, Apache 2.0) debe respetarse igualmente.
- No se especifica la longitud máxima de contexto soportada por el mecanismo adaptativo, lo que limita su uso en documentos largos sin validación previa.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-adaptive-span-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE: https://huggingface.co/datasets/glue
- Dataset SST-2: https://huggingface.co/datasets/sst2
