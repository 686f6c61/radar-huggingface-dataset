# Hooshaai/bert-spectraformer-attention-sst2

## Resumen

`Hooshaai/bert-spectraformer-attention-sst2` es un checkpoint derivado de `bert-base-uncased` (110 M de parámetros) en el que se han sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `spectraformer_attention` de la librería NeuralOps, con complejidad efectiva subcuadrática (O(N) u O(N log N)). El modelo se ha afinado y destilado específicamente para la tarea SST-2 del benchmark GLUE (clasificación binaria de sentimiento en inglés), y se distribuye como un conjunto de pesos de atención en FP16 más la cabeza de clasificación, con un tamaño aproximado de 55 MB.

El interés del checkpoint es metodológico más que de producto: sirve como referencia reproducible de cómo sustituir atención cuadrática por alternativas subcuadráticas en un transformer preentrenado y recuperar parte del rendimiento mediante destilación por representaciones en caché (protocolo *Cached Representation Distillation* de NeuralOps). La model card reporta una precisión del 76,26 % en el split de validación de SST-2 tras la destilación, frente al 52,75 % del estudiante sin calibrar y el 91,63 % del profesor BERT-base original.

Es relevante ahora porque documenta con telemetría concreta (RTX 3090, 201 pasos, 49,8 s, 10 074 MB de VRAM pico) el coste real de adaptar arquitecturas de atención eficiente sobre modelos ya entrenados, un paso previo habitual antes de escalar a modelos mayores. La licencia es MIT y el repo pesa 0,1 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con atención `spectraformer_attention` subcuadrática (O(N) u O(N log N)) en las 12 capas |
| Parámetros totales | 110 M (heredados de `bert-base-uncased`; los pesos distribuidos son solo atención + cabeza, ~55 MB en FP16) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la de BERT-base, 512 tokens, no confirmado en la model card) |
| Tipos de cuantización | no disponible (pesos publicados en FP16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16) + código remoto (`modeling_neuralops_bert.py`) |
| Librería | `neuralops` (con soporte vía `trust_remote_code=True` en Transformers) |
| Tarea | `text-classification` (SST-2, binaria) |
| Modelo base | `google-bert/bert-base-uncased` |
| Dataset de evaluación | GLUE / SST-2 |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` congelado y reemplaza el mecanismo de atención multi-cabeza estándar por `spectraformer_attention`, un operador de atención subcuadrática que reduce la complejidad operativa de O(N²) a O(N) u O(N log N). Solo se entrenan y serializan los parámetros de atención y la cabeza de clasificación; el resto de pesos del BERT base se inicializan en tiempo de carga desde el checkpoint original de Hugging Face, lo que explica el reducido tamaño del repo (~55 MB frente a los ~450 MB del BERT-base completo).

El entrenamiento sigue el protocolo *Cached Representation Distillation* de NeuralOps, en dos etapas: primero una alineación de subespacio oculto (*Subspace Hidden Alignment*) y después una combinación de KL sobre logits del profesor más entropía cruzada sobre la tarea. El profesor se ejecuta en modo offline con representaciones cacheadas, de modo que no ocupa VRAM durante la destilación (0 MB de overhead de profesor). La ejecución física se realizó en una NVIDIA RTX 3090 de 24 GB: 201 pasos de optimización, 49,8 s de duración total, throughput efectivo de 33 096,7 tokens/s y pico de VRAM de 10 074 MB. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de GLUE/SST-2, ni si hubo RLHF/DPO.

## Capacidades

- Clasificación binaria de sentimiento en inglés (positivo/negativo) sobre textos de una sola secuencia.
- Inferencia con atención subcuadrática, lo que reduce el coste computacional teórico frente a BERT-base en secuencias largas.
- Carga modular: solo se descargan los pesos de atención y la cabeza; el backbone se reconstruye desde `bert-base-uncased`.
- Integración con la API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`) y con `AutoModelForSequenceClassification` de Transformers mediante `trust_remote_code=True`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*.
- Capacidad multilingüe: no (solo inglés).
- No es un modelo generativo: no produce texto libre, solo logits de clasificación.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: clasificación binaria de opiniones en inglés con un modelo de 110 M de parámetros que cabe en cualquier GPU consumer; útil como baseline ligero en pipelines de moderación o analítica de opiniones.
- Filtrado previo en pipelines de datos: usar el modelo como clasificador rápido de polaridad para enrutar o etiquetar grandes volúmenes de texto antes de pasarlos a un LLM más caro.
- Investigación en atención eficiente: referencia reproducible para comparar `spectraformer_attention` frente a atención softmax estándar en la misma tarea y con el mismo backbone, con métricas y telemetría publicadas.
- Docencia y prototipado de destilación: ejemplo completo de destilación por representaciones cacheadas con profesor offline, útil para reproducir el protocolo en otros pares profesor/estudiante.
- Benchmarking de latencia y memoria: al ser un modelo pequeño con atención subcuadrática, sirve para medir el impacto real de la complejidad asintótica en GPUs de gama media (RTX 3090 y similares).
- Pruebas de integración con `trust_remote_code`: caso de uso para validar pipelines que cargan modelos con código remoto y pesos parciales desde el Hub.
- Evaluación comparativa de checkpoints del Attention Zoo de NeuralOps: punto de partida para contrastar otras variantes de atención sobre BERT-base en GLUE.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el split de validación de GLUE SST-2 (872 muestras binarias):

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 52,75 % | 76,26 % | +23,51 pp |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,5254 | convergido |

Telemetría de entrenamiento (RTX 3090 24 GB):

| Métrica | Valor |
|---|---|
| Duración total | 49,8 s |
| Pasos de optimización | 201 |
| Throughput efectivo | 33 096,7 tokens/s |
| VRAM pico | 10 074 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del backbone (110 M parámetros) y el pico de entrenamiento de ~10 GB, la inferencia en FP16 debería situarse muy por debajo de esa cifra, pero no se confirma en la documentación.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM para FP16; el entrenamiento se validó en una RTX 3090 de 24 GB.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060/4060 y superiores, aunque el dato exacto no está publicado.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (el modelo no es generativo y usa código remoto propio).
- Latencia y throughput: solo se publica throughput de entrenamiento (33 096,7 tokens/s); no hay datos de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-spectraformer-attention-sst2` | 110 M (backbone) + atención propia | no disponible | 76,26 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % (referencia en la card) | Apache 2.0 | Hugging Face, estándar |
| BERT-base afinado en SST-2 (checkpoints públicos) | 110 M | 512 tokens | no disponible en esta ficha | variable | Hugging Face |
| Otras variantes del NeuralOps Attention Zoo | 110 M (backbone) | no disponible | no disponible | MIT | Hugging Face |

La comparación directa con alternativas de atención eficiente (Longformer, BigBird, Performer) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento muy inferior al profesor: 76,26 % frente a 91,63 % en SST-2, una caída de 15,37 puntos porcentuales pese a la destilación.
- Solo clasificación binaria de sentimiento en inglés; no es un modelo generativo ni multilingüe.
- Requiere `trust_remote_code=True` y la librería `neuralops`, lo que añade superficie de ataque y dependencia de código de terceros en producción.
- Los pesos distribuidos son parciales (solo atención y cabeza); la carga depende de que `bert-base-uncased` esté disponible y de que el shim remoto reconstruya correctamente el modelo.
- Riesgo de alucinación no aplicable en sentido estricto (no genera texto), pero sí de clasificaciones erróneas y sobreconfianza en dominios distintos de SST-2.
- Sesgos: no documentados en la información disponible; al heredar el backbone de `bert-base-uncased` y entrenarse solo en SST-2, es esperable que arrastre sesgos del corpus original, pero no se cuantifican.
- Sin datos publicados de calibración fuera del split de validación de SST-2 ni de robustez ante dominios externos.
- Licencia MIT permite uso comercial, pero la licencia del backbone subyacente (`bert-base-uncased`, Apache 2.0) debe respetarse igualmente.
- Modelo con 58 descargas y 0 likes en el momento de la consulta: ecosistema pequeño, poca validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-spectraformer-attention-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE / SST-2: no disponible enlace directo en la información proporcionada
- Paper o blog técnico: no disponible
- Demo: no disponible
