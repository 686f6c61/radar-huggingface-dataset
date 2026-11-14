# Hooshaai/bert-linformer-attention-sst2

## Resumen

`Hooshaai/bert-linformer-attention-sst2` es un checkpoint de clasificación de sentimiento derivado de `bert-base-uncased` en el que los bloques de atención softmax cuadrática de las 12 capas del transformer han sido sustituidos por el mecanismo `linformer_attention` de la librería NeuralOps. El objetivo es demostrar que es posible reducir la complejidad operativa de la atención de O(N²) a O(N) o O(N log N) manteniendo una precisión razonable en una tarea concreta de GLUE (SST-2), mediante un protocolo de destilación de representaciones en caché.

El modelo no se distribuye como un transformer completo, sino como un conjunto modular de pesos de atención y cabeza de clasificación en FP16 (`attention_weights.safetensors`, aproximadamente 55 MB). Los pesos congelados del BERT base se reconstruyen en tiempo de carga desde `bert-base-uncased`, lo que reduce drásticamente el tamaño del repositorio (0,4 GB) y permite iterar sobre variantes de atención sin duplicar el backbone completo.

Es relevante como pieza de investigación dentro del "Attention Zoo" de NeuralOps: un banco de pruebas reproducible de mecanismos de atención subcuadrática sobre BERT, evaluado con métricas de destilación y telemetría de entrenamiento publicadas. No está pensado como modelo de producción generalista, sino como artefacto experimental de clasificación binaria de sentimiento en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) con atención `linformer_attention` subcuadrática en las 12 capas |
| Parámetros totales | 110 M (BERT-base); se distribuyen solo los pesos de atención y cabeza de clasificación (~55 MB en FP16) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la información proporcionada; el modelo base BERT-base admite 512 tokens) |
| Tipos de cuantización | FP16 (pesos de atención serializados); no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16) + código remoto (`modeling_neuralops_bert.py`) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 110 M de parámetros, encoder bidireccional) y reemplaza la atención multi-cabeza estándar por `linformer_attention`, que proyecta las claves y los valores a una dimensión reducida para lograr una complejidad efectiva O(N) u O(N log N) en lugar de O(N²). La serialización es modular: solo se publican los pesos de atención entrenados y la cabeza de clasificación de tarea, mientras que el backbone congelado se inicializa desde el modelo base original en tiempo de carga mediante código remoto (`trust_remote_code=True`).

El entrenamiento sigue el protocolo "NeuralOps Cached Representation Distillation", que consta de dos etapas: alineamiento de subespacio oculto (Stage 1) y destilación por KL sobre logits más entropía cruzada de la tarea (Stage 2). Se ejecutó en una NVIDIA GeForce RTX 3090 (24 GB) con 232 pasos de optimización, una duración de 52,9 s, un throughput efectivo de 35.901,1 tokens/s y un pico de VRAM de 7.652 MB. El protocolo evita asignar VRAM al profesor mediante caché offline de representaciones. El conjunto de evaluación es la partición de validación de SST-2 (872 muestras binarias).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, sobre la tarea SST-2 de GLUE.
- Inferencia estándar vía `AutoModelForSequenceClassification` de Transformers con `trust_remote_code=True`.
- Carga modular vía API de NeuralOps (`load_pretrained_bert` y `load_surgeried_model`), que reconstruye el backbone y aplica los pesos de atención destilados.
- Atención subcuadrática con coste operativo O(N) u O(N log N), orientada a secuencias largas en escenarios de investigación.
- No se documentan capacidades de generación de texto, tool calling, agentes, matemáticas, visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Investigación sobre eficiencia de atención: sirve como punto de comparación reproducible entre `linformer_attention` y atención softmax estándar sobre el mismo backbone y la misma tarea, con métricas de destilación publicadas.
- Análisis de sentimiento de reseñas en inglés a pequeña escala: clasificación binaria directa con un modelo de 110 M de parámetros y huella de descarga de ~55 MB más el backbone base.
- Benchmarking de protocolos de destilación: el par (profesor BERT-base, estudiante Linformer) permite evaluar técnicas de alineamiento de representaciones con coste de VRAM del profesor nulo.
- Prototipado de pipelines de clasificación con `transformers`: integración directa en scripts de inferencia existentes sin reentrenar el backbone.
- Estudio de la brecha profesor-estudiante en tareas GLUE: la diferencia de precisión (91,63 % frente a 84,29 %) cuantifica el coste de sustituir atención cuadrática por lineal bajo este protocolo.
- Docencia y experimentación con arquitecturas de atención alternativas: el formato modular de pesos facilita inspeccionar y sustituir solo los bloques de atención.

## Benchmarks y rendimiento

Evaluación sobre la partición de validación de GLUE SST-2 (872 muestras):

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`linformer_attention`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Exactitud SST-2 | 91,63 % | 50,92 % | 84,29 % | +33,37 % |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,4582 | — |

Telemetría de entrenamiento (RTX 3090, 24 GB):

| Métrica | Valor |
|---|---|
| Duración | 52,9 s |
| Pasos de optimización | 232 |
| Throughput efectivo | 35.901,1 tokens/s |
| Pico de VRAM | 7.652 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el pico documentado durante el entrenamiento es de 7.652 MB en una RTX 3090; la inferencia en FP16 de un BERT-base con pesos de atención modulares debería situarse por debajo de esa cifra, aunque no se publica un valor específico de inferencia.
- GPU recomendadas: NVIDIA RTX 3090 (usada en el entrenamiento); cualquier GPU Ampere o superior con al menos 8 GB de VRAM es un punto de partida razonable, aunque no está verificado en la documentación.
- Cabe en GPU de consumo: sí, según el pico de VRAM de entrenamiento (7,6 GB), lo que sugiere compatibilidad con tarjetas de 8 GB o más; no se confirma para modelos inferiores.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se publica throughput de entrenamiento (35.901,1 tokens/s); no hay datos de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (exactitud) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-linformer-attention-sst2` | 110 M (backbone) + atención modular | no disponible | 84,29 % | MIT | Hugging Face (repo de 0,4 GB) |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % (referencia del propio autor) | Apache 2.0 | Hugging Face |
| Otros modelos de atención subcuadrática sobre BERT | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas comparables dentro de la información proporcionada; la única comparación numérica publicada es contra el propio profesor BERT-base.

## Limitaciones y advertencias

- Pérdida de precisión significativa frente al profesor: 84,29 % frente a 91,63 % en SST-2, una brecha de 7,34 puntos porcentuales.
- El estudiante pre-destilación rinde al nivel del azar (50,92 %), lo que indica que la calidad depende enteramente del protocolo de destilación aplicado.
- Solo evaluado en una tarea (SST-2) y un idioma (inglés); no hay evidencia de generalización a otras tareas GLUE ni a otros dominios.
- Requiere `trust_remote_code=True` y ejecuta código remoto (`modeling_neuralops_bert.py`), lo que implica un riesgo de seguridad y de reproducibilidad si el repositorio cambia.
- Dependencia de la librería NeuralOps y de la reconstrucción dinámica del backbone desde `bert-base-uncased`; cualquier cambio en el modelo base o en la API puede romper la carga.
- No se documentan sesgos específicos, pero al derivar de BERT-base hereda los sesgos de su corpus de preentrenamiento (inglés, mayoritariamente web).
- Riesgo de alucinación no aplica en sentido generativo (es un clasificador), pero sí de calibración: la entropía cruzada del modelo destilado (0,4582) es casi el doble que la del profesor (0,2428), lo que sugiere confianza menos calibrada.
- Licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0 y el código remoto debe auditarse antes de desplegarlo en producción.
- Contexto máximo no documentado en la ficha del modelo; no asumir 512 tokens sin verificarlo en el código remoto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-linformer-attention-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Cita (BibTeX) incluida en la model card: `Majlesi, Taha (2026), NeuralOps: Pretrained BERT Subquadratic Attention Zoo on GLUE Benchmark`
