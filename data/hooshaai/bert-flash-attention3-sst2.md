# Hooshaai/bert-flash-attention3-sst2

## Resumen

`Hooshaai/bert-flash-attention3-sst2` es un checkpoint de clasificación de sentimiento derivado de `google-bert/bert-base-uncased` en el que las 12 capas de atención softmax cuadrática originales han sido sustituidas por el mecanismo `flash_attention3`, implementado en la librería NeuralOps (autor original del proyecto: Taha Majlesi). El modelo se ha afinado y destilado sobre la tarea SST-2 del benchmark GLUE, con un protocolo de destilación por representaciones cacheadas que evita mantener el profesor en VRAM. El resultado es un clasificador binario de sentimiento en inglés con una precisión declarada del 91,86 % en el split de validación de SST-2.

La relevancia técnica del artefacto no está en la tarea en sí (SST-2 es un problema resuelto por BERT-base desde 2018), sino en el enfoque de serialización: el repositorio no contiene los pesos completos del modelo base, sino únicamente los pesos de atención especializados y la cabeza de clasificación en FP16 (`attention_weights.safetensors`, ~55 MB). El código remoto (`modeling_neuralops_bert.py`) reconstruye el modelo cargando los pesos congelados de `bert-base-uncased` desde el Hub y aplicando encima los parámetros de atención destilados. Esto convierte al modelo en una demostración de atención subcuadrática sobre un transformer estándar, más que en un modelo de propósito general.

El modelo se distribuye con licencia MIT, soporta únicamente inglés, requiere `trust_remote_code=True` y depende de la librería `neuralops` para su carga de alto nivel. Su tamaño efectivo es el de BERT-base (110 M parámetros), aunque el repositorio descargable ocupe 0,5 GB por la inclusión de los pesos base referenciados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atención `flash_attention3` (subcuadrática) en las 12 capas |
| Parametros totales | 110 M (BERT-base); pesos descargables: ~55 MB de atención + cabeza de clasificación en FP16 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (BERT-base estándar: 512 tokens) |
| Tipos de cuantizacion | No disponible (pesos publicados en FP16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16); código remoto Python (`custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura BERT-base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención, 110 M parámetros) y reemplaza el bloque de atención softmax cuadrática \(O(N^2)\) por el mecanismo `flash_attention3` de NeuralOps, que el autor describe como de complejidad efectiva \(O(N)\) u \(O(N \log N)\). El resto del encoder (embeddings, FFN, normalización) se mantiene congelado y se carga desde `bert-base-uncased` en tiempo de ejecución.

El entrenamiento se realizó mediante el protocolo NeuralOps Cached Representation Distillation, en dos etapas: primero una alineación de subespacio oculto (Stage 1) y después una combinación de KL sobre logits y entropía cruzada de tarea (Stage 2). Se ejecutó sobre una NVIDIA GeForce RTX 3090 (24 GB) durante 48,4 s, con 225 pasos de optimización, un throughput efectivo de 38.049,7 tokens/s y un pico de VRAM de 13.512 MB. El profesor (`bert-base-uncased` afinado) no ocupa VRAM durante la destilación porque sus representaciones se cachean offline.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, pipeline `text-classification`.
- Inferencia compatible con `AutoModelForSequenceClassification` de Hugging Face Transformers usando `trust_remote_code=True`.
- Carga modular vía API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`).
- Reconstrucción sobre pesos base congelados de `bert-base-uncased` (serialización attention-only).
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso: es exclusivamente un clasificador.
- Capacidades multilingües: no, solo inglés.

## Casos de uso

- Análisis de sentimiento en reseñas de producto en inglés: el modelo clasifica secuencias cortas en positivo/negativo con una precisión declarada del 91,86 % en SST-2, suficiente para monitorización de opiniones a escala.
- Moderación de comentarios y detección de toxicidad indirecta: puede usarse como primera etapa de filtrado de polaridad antes de modelos más caros.
- Enrutamiento de tickets de soporte: clasificar el tono del cliente (positivo/negativo) para priorizar colas de atención o escalar quejas.
- Investigación en eficiencia de atención: sirve como checkpoint de referencia para comparar `flash_attention3` frente a atención cuadrática en tareas GLUE, gracias a la serialización attention-only.
- Benchmarking de destilación: el par (profesor `bert-base-uncased`, estudiante destilado) permite reproducir el protocolo NeuralOps y medir deltas de precisión y cross-entropy.
- Prototipado rápido en entornos con poca VRAM: al descargar solo ~55 MB de pesos de atención y reutilizar el base congelado, el coste de almacenamiento y despliegue es bajo.
- Evaluación de pipelines de clasificación en CI: la API de una línea (`load_surgeried_model`) facilita tests de regresión de modelos en integración continua.

## Benchmarks y rendimiento

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`flash_attention3`) | Modelo destilado |
|---|---|---|---|
| GLUE SST-2 accuracy (validación, 872 muestras) | 91,63 % | 91,63 % | 91,86 % |
| Cross-entropy de validación | 0,2428 | No calibrado | 0,2736 |
| Delta de accuracy | — | — | +0,23 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los datos de entrenamiento reportados son: 48,4 s de duración, 225 pasos, 38.049,7 tokens/s y 13.512 MB de VRAM pico en RTX 3090.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,5-1 GB en FP16 para BERT-base completo (110 M parámetros); el repositorio descargable son ~55 MB de pesos de atención más los pesos base referenciados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor validó el entrenamiento en NVIDIA RTX 3090 (24 GB), pero la inferencia cabe holgadamente en GPUs consumer.
- Cabe en GPU consumer: sí, en GTX 1650/RTX 3050 en adelante; también en CPU para lotes pequeños.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`, API de NeuralOps; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de inferencia; solo el throughput de entrenamiento (38.049,7 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 acc | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-flash-attention3-sst2` | 110 M (atención ~55 MB) | No disponible (BERT-base: 512) | 91,86 % | MIT | Hugging Face, requiere `neuralops` |
| `google-bert/bert-base-uncased` (afinado SST-2) | 110 M | 512 | 91,63 % (profesor reportado) | Apache 2.0 | Hugging Face, transformers estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | No disponible en la información | Apache 2.0 | Hugging Face, transformers estándar |
| `roberta-base` (afinado SST-2) | 125 M | 512 | No disponible en la información | MIT | Hugging Face, transformers estándar |

La comparativa se limita a arquitecturas BERT-like de tamaño similar; no se dispone de datos de benchmarks de los alternativos en la información proporcionada, por lo que las cifras de accuracy de terceros no se incluyen para no inventar datos.

## Limitaciones y advertencias

- Solo clasificación binaria de sentimiento en inglés; no es un modelo generativo ni sirve para tareas fuera de `text-classification`.
- Requiere `trust_remote_code=True` y ejecuta código Python remoto (`modeling_neuralops_bert.py`); auditar el código antes de usarlo en producción.
- Dependencia de la librería `neuralops` y del repositorio base `bert-base-uncased` para reconstruir el modelo; si el base cambia o se retira, la carga puede romperse.
- La mejora reportada (+0,23 %) sobre el profesor es marginal y se midió en un único split de validación de 872 muestras; la significación estadística no se documenta.
- Cross-entropy del estudiante (0,2736) es peor que la del profesor (0,2428), lo que sugiere calibración de probabilidades degradada pese a la accuracy similar.
- Riesgo de sesgos heredados de BERT-base y de SST-2 (reseñas de películas): el dominio de entrenamiento es estrecho y puede no generalizar a otros registros.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en dominios fuera de distribución.
- El autor del repo en Hugging Face es `Hooshaai`, mientras que la model card y el código de ejemplo referencian `tahamajs`; verificar la ruta correcta antes de cargar el modelo.
- Licencia MIT permite uso comercial, pero la licencia del modelo base (`bert-base-uncased`, Apache 2.0) debe respetarse igualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-flash-attention3-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE / SST-2: https://huggingface.co/datasets/glue
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
