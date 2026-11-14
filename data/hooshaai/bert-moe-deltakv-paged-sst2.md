# Hooshaai/bert-moe-deltakv-paged-sst2

## Resumen

Hooshaai/bert-moe-deltakv-paged-sst2 es un checkpoint de clasificación de sentimiento derivado de `google-bert/bert-base-uncased`, en el que los bloques de atención softmax cuadrática de las 12 capas del transformer se han sustituido por el mecanismo `moe_deltakv_paged` de la librería NeuralOps. El modelo se ha destilado sobre la tarea SST-2 del benchmark GLUE y se distribuye como pesos de atención y cabeza de clasificación en FP16 (aproximadamente 55 MB), reconstruyendo el resto de pesos congelados desde el modelo base original.

El interés técnico reside en la sustitución del mecanismo de atención: `moe_deltakv_paged` propone una complejidad operativa subcuadrática (O(N) u O(N log N)) frente a la O(N²) de la multi-head attention estándar, combinando mezcla de expertos con un esquema de caché de claves/valores paginada. La destilación se realizó con el protocolo Cached Representation Distillation de NeuralOps, que evita asignar VRAM al modelo profesor mediante alineamiento offline de representaciones.

El modelo es relevante como artefacto de investigación para evaluar mecanismos de atención alternativos en tareas de clasificación de texto, no como modelo generativo de propósito general. Su alcance está limitado a clasificación binaria de sentimiento en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con atención `moe_deltakv_paged` (subcuadrática) en las 12 capas |
| Parametros totales | ~110 M (base BERT-base); pesos distribuidos en el repo: ~55 MB en FP16 (solo atención y cabeza de clasificación) |
| Parametros activos | no disponible (el tag `moe` sugiere mezcla de expertos, pero no se detalla el número de expertos ni los parámetros activos) |
| Longitud de contexto | no disponible (el modelo base BERT-base soporta 512 tokens, pero la model card no lo confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (los pesos se publican en FP16; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, FP16); requiere `trust_remote_code=True` y el shim `modeling_neuralops_bert.py` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 110 M de parámetros) y reemplaza en todas las capas el bloque de atención multi-cabeza estándar por el mecanismo `moe_deltakv_paged`, que según la model card ofrece complejidad efectiva O(N) u O(N log N). La serialización es modular: el repositorio contiene únicamente los pesos de atención entrenados y la cabeza de clasificación de tarea en FP16 (~55 MB); el resto de pesos congelados se inicializan en tiempo de carga desde `bert-base-uncased`.

El entrenamiento se realizó con el protocolo Cached Representation Distillation de NeuralOps, en dos etapas: alineamiento de subespacio oculto (Stage 1) y combinación de KL sobre logits con entropía cruzada de tarea (Stage 2). La destilación se ejecutó en una NVIDIA RTX 3090 (24 GB) durante 55,5 s, con 107 pasos de optimización, throughput de 15.801,5 tokens/s y un pico de VRAM de 23.021 MB. No se documentan el número de tokens de entrenamiento, la composición del dataset más allá de GLUE SST-2, ni si hubo RLHF o DPO.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, sobre la tarea SST-2 de GLUE.
- Clasificación de secuencias cortas de texto con una cabeza de clasificación específica de tarea.
- Atención subcuadrática: el mecanismo `moe_deltakv_paged` está diseñado para escalar mejor que la atención cuadrática en secuencias largas, aunque no se aportan mediciones de latencia o memoria a distintas longitudes.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio.
- Capacidad multilingüe: no disponible (solo inglés).
- No se documenta modo thinking ni capacidades especiales adicionales.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica reseñas cortas en inglés en positivas o negativas con una precisión reportada del 90,14 % en el split de validación de SST-2, adecuado para pipelines de moderación o analítica de opiniones.
- Filtrado de comentarios en foros y redes: clasificación binaria rápida de mensajes para enrutar contenido negativo a revisión humana, con un footprint de pesos de ~55 MB que reduce el coste de almacenamiento frente al modelo completo.
- Investigación en mecanismos de atención: sirve como punto de partida reproducible para comparar atención subcuadrática frente a softmax estándar en tareas de clasificación, gracias a la serialización modular que permite intercambiar solo los pesos de atención.
- Benchmarking de destilación: el checkpoint documenta métricas pre- y post-destilación (85,67 % → 90,14 %), lo que lo hace útil como referencia en experimentos de knowledge distillation con profesores offline.
- Prototipado en hardware de consumo: al requerir solo ~55 MB de pesos descargables más el base BERT congelado, se puede desplegar en una GPU de consumo para experimentos de clasificación de texto.
- Evaluación de la librería NeuralOps: permite validar la API `load_pretrained_bert` y el flujo de carga modular con `trust_remote_code=True` en entornos de investigación.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras de clasificación binaria):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`moe_deltakv_paged`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Exactitud SST-2 | 91,63 % | 85,67 % | 90,14 % | +4,47 % |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,3309 | — |

Telemetría de entrenamiento (RTX 3090, 24 GB):

| Metrica | Valor |
|---|---|
| Duracion del entrenamiento | 55,5 s |
| Pasos de optimizacion | 107 |
| Throughput efectivo | 15.801,5 tokens/s |
| Pico de VRAM | 23.021 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base BERT-base en FP16 ocupa aproximadamente 220 MB, y los pesos de atención añaden ~55 MB. Una estimación conservadora sitúa la inferencia por debajo de 1 GB de VRAM, pero no está confirmada en la documentación.
- GPU recomendadas: el entrenamiento se ejecutó en una RTX 3090 (24 GB); para inferencia debería ser suficiente cualquier GPU con al menos 2 GB de VRAM, aunque no se documenta.
- GPU de consumo: sí, cabe en GPUs de consumo modernas (RTX 3060, RTX 4060, RTX 4090) por el reducido tamaño de los pesos; no hay mediciones oficiales.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` y `trust_remote_code=True`; API `neuralops.hub.bert_zoo.load_pretrained_bert`; API universal `neuralops.hub.load_surgeried_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se reporta throughput de entrenamiento (15.801,5 tokens/s); no hay datos de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (exactitud) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hooshaai/bert-moe-deltakv-paged-sst2 | ~110 M (base) + atención modular | no disponible | 90,14 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face, `transformers` estándar |
| BERT-base fine-tuned en SST-2 (referencia GLUE) | 110 M | 512 tokens | ~92-93 % (valores publicados en GLUE) | Apache 2.0 | Hugging Face, amplia disponibilidad |

No se dispone de comparaciones con otros mecanismos de atención subcuadrática (por ejemplo, Linear Attention, Performer, Longformer) en la información proporcionada.

## Limitaciones y advertencias

- Solo clasificación binaria de sentimiento en inglés; no es un modelo generativo ni multilingüe.
- Precisión ligeramente inferior al profesor (90,14 % frente a 91,63 %), con una brecha de 1,49 puntos porcentuales.
- La entropía cruzada de validación del modelo destilado (0,3309) es superior a la del profesor (0,2428), lo que sugiere menor calibración de las probabilidades.
- Requiere `trust_remote_code=True` y ejecuta código remoto (`modeling_neuralops_bert.py`), lo que implica un riesgo de seguridad en entornos de producción y auditoría de código obligatoria.
- Dependencia de la librería NeuralOps, que no es estándar en el ecosistema `transformers`; la carga con `AutoModelForSequenceClassification` puede fallar sin la versión compatible.
- Los pesos publicados son solo de atención y cabeza de clasificación; la reconstrucción depende del modelo base `bert-base-uncased`, por lo que no es un artefacto autocontenido.
- No se documentan sesgos específicos, pero al derivar de BERT-base hereda los sesgos del corpus original (BookCorpus y Wikipedia en inglés).
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas en dominios alejados de SST-2 (reseñas de películas).
- Licencia MIT permite uso comercial, pero la ausencia de benchmarks fuera de SST-2 limita la confianza en producción.
- No se documenta el número de expertos del componente MoE ni los parámetros activos, lo que dificulta estimar el coste real de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-moe-deltakv-paged-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/glue
- Cita del autor: Majlesi, T. (2026), *NeuralOps: Pretrained BERT Subquadratic Attention Zoo on GLUE Benchmark*
