# Hooshaai/bert-phantom-sst2

## Resumen

`bert-phantom-sst2` es un checkpoint de clasificación de sentimiento derivado de `bert-base-uncased` en el que el autor (Hooshaai, con referencia interna a `tahamajs`) ha sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por un mecanismo denominado `phantom`, perteneciente a la librería NeuralOps. El objetivo declarado es demostrar que es posible reemplazar la atención estándar O(N²) por una variante subcuadrática (O(N) u O(N log N)) manteniendo un rendimiento aceptable en una tarea concreta de GLUE (SST-2, análisis de sentimiento binario) mediante destilación de conocimiento desde el modelo profesor original.

El modelo se distribuye de forma modular: no se re-suben los 110 M de parámetros de BERT-Base, sino únicamente los pesos de atención destilados y la cabeza de clasificación en FP16 (~55 MB), que se aplican sobre los pesos congelados de `bert-base-uncased` cargados en tiempo de ejecución. El entrenamiento se realizó en una única RTX 3090 (24 GB) en 51,8 segundos y 276 pasos, con un protocolo de destilación basado en caché offline de representaciones del profesor (sin asignar VRAM al profesor durante el entrenamiento).

La relevancia es fundamentalmente experimental: sirve como banco de pruebas reproducible para evaluar mecanismos de atención subcuadrática sobre un backbone estándar, no como un modelo listo para producción. La accuracy alcanzada en SST-2 (78,78 %) queda muy por debajo del profesor (91,63 %), lo que refleja el coste de la sustitución de atención y de un presupuesto de destilación muy reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-Base (12 capas) con atención `phantom` subcuadrática en todas las capas |
| Parametros totales | ~110 M (BERT-Base completo, base congelada); pesos destilados publicados ~55 MB en FP16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la de `bert-base-uncased`, típicamente 512 tokens; no confirmado en la información) |
| Tipos de cuantizacion | FP16 (pesos de atención y cabeza publicados en FP16); no se documentan otras |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, solo atención + cabeza de clasificación); requiere `trust_remote_code=True` |
| Librería | `neuralops` (con shim de código remoto `modeling_neuralops_bert.py`) |
| Modelo base | `google-bert/bert-base-uncased` |
| Tarea / pipeline | `text-classification` (SST-2, binario) |
| Dataset de evaluación | GLUE SST-2 (split de validación, 872 muestras) |
| Hardware de entrenamiento | NVIDIA GeForce RTX 3090 24 GB |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (transformer encoder de 12 capas, ~110 M de parámetros) y reemplaza en cada capa el bloque de multi-head attention softmax por el mecanismo `phantom` de NeuralOps, con complejidad efectiva O(N) u O(N log N) frente a O(N²). El resto del backbone (embeddings, FFN, layernorm) se mantiene congelado y se carga desde el checkpoint original de BERT en tiempo de ejecución; el repositorio solo contiene los pesos de atención destilados y la cabeza de clasificación, serializados en `attention_weights.safetensors` en FP16 (~55 MB).

El entrenamiento siguió el protocolo "NeuralOps Cached Representation Distillation": primero se cachean offline las representaciones del profesor (`bert-base-uncased` afinado en SST-2), de modo que durante el entrenamiento del estudiante no se asigna VRAM al profesor. El proceso tuvo dos etapas: alineamiento de subespacio oculto (Stage 1) y KL sobre logits + entropía cruzada de tarea (Stage 2). Se ejecutaron 276 pasos en 51,8 s sobre una RTX 3090, con un throughput efectivo de 43.677,2 tokens/s y un pico de VRAM de 6.870 MB. No se documentan detalles sobre el número de tokens de entrenamiento, composición del corpus más allá de SST-2, ni uso de RLHF/DPO (no aplica a esta tarea).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, entrenada y evaluada sobre GLUE SST-2.
- Inferencia sobre secuencias de texto cortas tipo reseña; el pipeline declarado es `text-classification`.
- Carga modular: los pesos de atención `phantom` se aplican sobre `bert-base-uncased` congelado mediante código remoto (`trust_remote_code=True`).
- Integración con la API de alto nivel de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking"; no se documentan capacidades generativas.
- Capacidad multilingüe: no; solo inglés.
- No se documenta soporte de `pipeline` estándar de Transformers sin el shim de código remoto.

## Casos de uso

- Investigación sobre atención subcuadrática: banco de pruebas reproducible para comparar el mecanismo `phantom` frente a atención softmax estándar en una tarea controlada (SST-2) con un backbone fijo (BERT-Base), midiendo el coste en accuracy de la sustitución.
- Estudio de destilación con caché offline de representaciones: el protocolo permite entrenar estudiantes sin asignar VRAM al profesor (pico de 6.870 MB), útil en entornos con una sola GPU consumer para experimentos de knowledge distillation.
- Prototipado de clasificadores de sentimiento de bajo coste: con ~55 MB de pesos descargables y ejecución sobre una GPU de 24 GB, sirve para validar pipelines de clasificación binaria en inglés antes de invertir en modelos mayores.
- Evaluación de serialización modular de pesos: ejemplo práctico de publicación de solo los parámetros modificados (atención + cabeza) sobre un backbone congelado, útil para estudiar eficiencia de almacenamiento y distribución de checkpoints.
- Docencia y reproducción de experimentos: el entrenamiento completo (276 pasos, 51,8 s) es reproducible en una única RTX 3090, lo que facilita demostraciones de destilación y benchmarking en cursos o laboratorios.
- Baseline negativo controlado: al rendir 78,78 % frente al 91,63 % del profesor, sirve como referencia de lo que se pierde al sustituir atención cuadrática por subcuadrática con un presupuesto de destilación mínimo, útil para justificar o descartar variantes en investigación.

## Benchmarks y rendimiento

Evaluación sobre GLUE SST-2, split de validación (872 muestras binarias):

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`phantom`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 50,92 % | 78,78 % | +27,87 % |
| Cross-entropy de validación | 0,2428 | no calibrado | 0,4713 | — |

Telemetría de entrenamiento (RTX 3090 24 GB):

| Métrica | Valor |
|---|---|
| Duración del entrenamiento | 51,8 s |
| Pasos de optimización | 276 |
| Throughput efectivo | 43.677,2 tokens/s |
| Pico de VRAM | 6.870 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo completo en FP32 ronda los ~440 MB de pesos de BERT-Base más ~55 MB de atención destilada, por lo que cabe holgadamente en GPUs consumer de 4-8 GB.
- GPU recomendadas: cualquier GPU con ≥4 GB de VRAM; el autor entrenó en una RTX 3090 (24 GB) con un pico de 6.870 MB, pero la inferencia no requiere ese margen.
- Cabe en GPU consumer: sí, en RTX 3060/4060, RTX 2070 o superiores; también en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, o la API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de inferencia; solo se reporta throughput de entrenamiento (43.677,2 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (acc.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-phantom-sst2` (este) | ~110 M (base congelada) + ~55 MB destilados | no disponible | 78,78 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor, afinado SST-2) | ~110 M | 512 tokens (típico) | 91,63 % | Apache 2.0 | Hugging Face, `transformers` estándar |
| Alternativas subcuadráticas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos del "Attention Zoo" de NeuralOps ni de comparativas publicadas con variantes como Performer, Linformer o Longformer en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento muy inferior al profesor: 78,78 % frente a 91,63 % en SST-2, una caída de 12,85 puntos absolutos; no es apto para producción sin un reentrenamiento o destilación mucho más intensivos.
- Entrenamiento muy corto (276 pasos, 51,8 s) sobre una única tarea y un único dataset; no hay evidencia de generalización a otras tareas de GLUE ni a dominios distintos de SST-2.
- Solo inglés; no se documenta soporte multilingüe.
- Requiere `trust_remote_code=True` y la librería `neuralops`, lo que implica ejecutar código remoto del autor y añade una dependencia no estándar frente a `transformers` puro.
- Pesos publicados de forma modular (solo atención + cabeza); la reconstrucción depende de cargar `bert-base-uncased` en tiempo de ejecución, lo que introduce un punto de fallo adicional (versión del backbone, disponibilidad del hub).
- Riesgo de alucinación no aplica en sentido generativo (es un clasificador), pero sí hay riesgo de calibración deficiente: la cross-entropy de validación (0,4713) es casi el doble que la del profesor (0,2428), lo que sugiere probabilidades poco fiables.
- No se documentan sesgos específicos; al entrenar solo en SST-2 (reseñas de cine en inglés), el modelo puede comportarse de forma errática fuera de ese dominio.
- Licencia MIT permite uso comercial, pero el estado experimental y la baja accuracy desaconsejan cualquier despliegue en producción sin validación adicional.
- No se documenta longitud de contexto efectiva del mecanismo `phantom`; la ventana de 512 tokens es una herencia supuesta de BERT-Base, no confirmada.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-phantom-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Cita (BibTeX en la model card): `Majlesi, Taha (2026), NeuralOps: Pretrained BERT Subquadratic Attention Zoo on GLUE Benchmark`
