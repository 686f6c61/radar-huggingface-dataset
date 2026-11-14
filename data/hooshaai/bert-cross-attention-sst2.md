# Hooshaai/bert-cross-attention-sst2

## Resumen

`Hooshaai/bert-cross-attention-sst2` es un checkpoint de clasificación de sentimiento derivado de `bert-base-uncased` en el que el autor ha sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por un mecanismo denominado `cross_attention`, perteneciente a la librería NeuralOps. El modelo se ha destilado sobre la tarea SST-2 del benchmark GLUE y se distribuye únicamente con los pesos de atención y la cabeza de clasificación en FP16 (unos 55 MB), reconstruyendo el resto de los pesos base desde `bert-base-uncased` mediante código remoto.

La propuesta encaja en la línea de investigación de atención subcuadrática (complejidad efectiva O(N) u O(N log N) frente a O(N²)), aplicada aquí a un transformer encoder clásico de 110 millones de parámetros y contexto de 512 tokens. El interés práctico es doble: por un lado, permite evaluar el impacto de mecanismos de atención alternativos sobre una arquitectura estándar sin reentrenar desde cero; por otro, el formato de serialización modular reduce el peso de descarga a una fracción del modelo completo.

El modelo es relevante ahora por su enfoque de destilación con caché offline de representaciones (sin asignar VRAM al profesor durante el entrenamiento) y por publicar métricas concretas de SST-2. No obstante, se trata de un artefacto de investigación con muy poca adopción (83 descargas, 0 likes en el momento de la consulta), lo que limita su validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atención `cross_attention` (subcuadrática) en las 12 capas |
| Parametros totales | 110 M (base `bert-base-uncased`); los pesos distribuidos son solo atención + cabeza (~55 MB en FP16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de BERT-base; no se especifica otra en la model card) |
| Tipos de cuantizacion | Pesos publicados en FP16; no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, serialización attention-only) con código remoto `modeling_neuralops_bert.py` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder de 12 capas y 110 M de parámetros, y reemplaza en todas las capas el mecanismo de multi-head attention estándar por `cross_attention` de NeuralOps, con complejidad efectiva O(N) u O(N log N) según la model card. La serialización es modular: el repositorio contiene únicamente los pesos de atención destilados y la cabeza de clasificación en FP16 (`attention_weights.safetensors`, ~55 MB), mientras que los pesos base congelados se inicializan en tiempo de carga desde `bert-base-uncased`.

El entrenamiento sigue el protocolo NeuralOps Cached Representation Distillation, en dos etapas: alineamiento de subespacio oculto (Stage 1) y destilación por KL sobre logits más entropía cruzada de la tarea (Stage 2). Se ejecutó en una NVIDIA GeForce RTX 3090 de 24 GB, con 265 pasos de optimización, 47,2 s de duración, throughput efectivo de 45.991,4 tokens/s y pico de VRAM de 13.512 MB. El autor destaca que el caché offline de representaciones elimina la necesidad de mantener al profesor en VRAM durante la destilación.

## Capacidades

- Clasificación de sentimiento binaria (positivo/negativo) sobre texto en inglés, entrenada y evaluada en SST-2.
- Clasificación de secuencias cortas con contexto de hasta 512 tokens.
- Inferencia estándar vía `AutoModelForSequenceClassification` de Transformers con `trust_remote_code=True`.
- Carga modular mediante la API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes.
- No se documentan capacidades multilingües: solo inglés.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica opiniones positivas o negativas en inglés con una precisión reportada del 91,86 % en SST-2, adecuado para pipelines de moderación o analítica de opiniones.
- Monitorización de reputación en redes sociales: clasificación por lotes de comentarios y menciones en inglés para agregar tendencias de sentimiento a lo largo del tiempo.
- Enrutamiento de tickets de soporte: uso del sentimiento como señal auxiliar para priorizar quejas negativas dentro de un sistema de ticketing, dado el bajo coste de inferencia de un encoder de 110 M.
- Filtrado previo en pipelines de datos: etiquetado rápido de grandes corpus en inglés para construir conjuntos de entrenamiento de sentimiento o para descartar contenido según polaridad.
- Evaluación comparativa de mecanismos de atención: referencia para investigadores que quieran medir el impacto de `cross_attention` frente a atención softmax estándar en una tarea GLUE concreta.
- Prototipado en hardware de consumo: al ser un encoder pequeño con pesos de 55 MB, puede ejecutarse en GPUs de gama baja o incluso en CPU para pruebas de concepto.
- Docencia y experimentación con destilación: ejemplo reproducible de destilación con caché offline de representaciones y serialización modular de pesos.

## Benchmarks y rendimiento

Evaluación reportada por el autor sobre el split de validación de GLUE SST-2 (872 muestras de clasificación binaria):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`cross_attention`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Exactitud SST-2 | 91,63 % | 91,63 % | 91,86 % | +0,23 % |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,2626 | convergido |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) ni comparaciones con modelos de atención subcuadrática de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP16 para el modelo completo (110 M de parámetros), ya que los pesos distribuidos son ~55 MB y el resto se reconstruye desde `bert-base-uncased`.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó en una RTX 3090 de 24 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: sí, en GTX 1650, RTX 3050, RTX 4060 y superiores; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y la API de NeuralOps (`neuralops.hub`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de inferencia; el único dato de rendimiento es el throughput de entrenamiento (45.991,4 tokens/s en una RTX 3090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-cross-attention-sst2` | 110 M (atención + cabeza ~55 MB) | 512 | 91,86 % (reportado) | MIT | Hugging Face, código remoto |
| `google-bert/bert-base-uncased` (fine-tuned SST-2) | 110 M | 512 | ~91,6 % (referencia del autor) | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 110 M | 512 | no disponible en la información | Apache 2.0 | Hugging Face |
| Modelos de atención subcuadrática comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas de atención subcuadrática no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha validado su comportamiento en otros idiomas.
- Entrenado exclusivamente en SST-2 (reseñas de cine); puede generalizar mal a otros dominios o registros.
- Contexto limitado a 512 tokens, insuficiente para documentos largos.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en textos ambiguos, irónicos o fuera de dominio.
- No se documentan análisis de sesgos; al derivar de `bert-base-uncased` y SST-2, puede heredar sesgos de esos datos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar `modeling_neuralops_bert.py` antes de usarlo en producción.
- La licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0 y debe respetarse esa licencia en la reconstrucción.
- Adopción muy baja (83 descargas, 0 likes) y ausencia de validación independiente; las métricas provienen únicamente del autor.
- El identificador del repositorio en la model card (`tahamajs/...`) no coincide con el ID de Hugging Face (`Hooshaai/...`), lo que puede provocar errores en la carga remota.
- No hay soporte documentado para motores de inferencia habituales en producción (vLLM, TGI, llama.cpp).

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-cross-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
