# Hooshaai/bert-naive-svd-sst2

## Resumen

`bert-naive-svd-sst2` es un checkpoint de BERT-Base (`bert-base-uncased`, 110 M de parámetros) en el que las 12 capas de atención softmax cuadrática han sido sustituidas por un mecanismo de atención subcuadrática denominado `naive_svd`, perteneciente a la librería NeuralOps (Attention Zoo). Lo publica el usuario Hooshaai (autor citado en la model card como Taha Majlesi) y está afinado para clasificación binaria de sentimiento en la tarea SST-2 del benchmark GLUE, en inglés.

El modelo no se distribuye como un transformer completo, sino como un conjunto de pesos modulares "attention-only" en FP16 (`attention_weights.safetensors`, unos 55 MB) que se aplican en tiempo de carga sobre los pesos congelados de `bert-base-uncased`. La model card reporta una precisión del 90,37 % en el split de validación de SST-2 (872 muestras), frente al 91,63 % del profesor BERT-Base original, tras un proceso de destilación de representaciones en dos etapas.

Su relevancia es fundamentalmente experimental: sirve como referencia reproducible para evaluar mecanismos de atención alternativos (subcuadráticos) sobre una arquitectura estándar y un benchmark conocido, con un coste de entrenamiento declarado de 50 segundos en una única RTX 3090. No es un modelo generativo ni un LLM: es un clasificador de secuencias de propósito específico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atención `naive_svd` (subcuadrática) en las 12 capas |
| Parámetros totales | 110 M (base BERT-Base) + cabeza de clasificación; los pesos distribuidos son solo de atención y tarea (~55 MB FP16) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la de `bert-base-uncased`, típicamente 512 tokens; no confirmado en la información) |
| Tipos de cuantización | no disponible (pesos publicados en FP16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (FP16, `attention_weights.safetensors`, serialización modular attention-only) |

## Arquitectura y entrenamiento

La arquitectura parte de BERT-Base (12 capas, encoder transformer bidireccional, 110 M de parámetros) y reemplaza el bloque de multi-head attention estándar por el mecanismo `naive_svd` de NeuralOps, que la model card describe como de complejidad efectiva O(N) u O(N log N) frente al O(N²) de la atención cuadrática. El resto de la red (embeddings, feed-forward, normalizaciones) se mantiene congelado y se reconstruye desde `bert-base-uncased` en el momento de la carga mediante un shim de código remoto (`modeling_neuralops_bert.py`).

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol": destilación en dos etapas (alineamiento de representaciones ocultas en subespacio y luego KL sobre logits más entropía cruzada de la tarea), con caché offline de representaciones del profesor para evitar reservar VRAM para el modelo docente. Se ejecutó en una NVIDIA GeForce RTX 3090 (24 GB), con 278 pasos de optimización, 50 segundos de duración, throughput de 45.511,8 tokens/s y un pico de VRAM de 23.021 MB. El dataset de evaluación y ajuste es SST-2 (GLUE).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, salida de 2 clases vía `AutoModelForSequenceClassification`.
- Codificación de secuencias de texto con atención subcuadrática, orientada a eficiencia en secuencias largas.
- No es un modelo generativo: no produce texto libre.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no (solo inglés).
- Capacidades especiales: carga modular de pesos de atención sobre BERT congelado; integración con la API `neuralops.hub` (`load_pretrained_bert`, `load_surgeried_model`).

## Casos de uso

- Clasificación de sentimiento en reseñas o comentarios en inglés: el modelo devuelve directamente una etiqueta binaria con una precisión reportada del 90,37 % en SST-2, suficiente para filtrado y moderación a gran escala.
- Análisis de opinión en pipelines de monitorización de marca: al ser un clasificador pequeño (55 MB de pesos descargables), se puede desplegar en múltiples instancias sin coste elevado de almacenamiento.
- Investigación en mecanismos de atención eficiente: sirve como checkpoint de referencia para comparar `naive_svd` con atención softmax estándar sobre el mismo benchmark y la misma base.
- Reproducción de experimentos de destilación: la model card documenta pasos, hardware y métricas, lo que permite replicar el protocolo de destilación con caché de representaciones.
- Pruebas de integración de la librería NeuralOps: útil para validar la carga modular de pesos attention-only y el shim de código remoto en entornos de CI.
- Prototipado educativo: ejemplo compacto de sustitución de bloques de atención en un transformer preentrenado sin reentrenar el modelo completo.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras binarias), según la model card:

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`naive_svd`) | Modelo destilado |
|---|---|---|---|
| Exactitud SST-2 | 91,63 % | 51,38 % | 90,37 % |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,2904 |
| Delta de exactitud | — | — | +38,99 puntos |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al reconstruirse sobre BERT-Base (110 M de parámetros), la inferencia en FP32 requiere del orden de 0,5-1 GB, y en FP16 menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para inferencia; el entrenamiento reportado se hizo en una RTX 3090 de 24 GB con un pico de 23.021 MB.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060 en adelante, e incluso inferiores).
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`; API de NeuralOps (`neuralops.hub`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: entrenamiento reportado a 45.511,8 tokens/s en RTX 3090; no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (validación) | Licencia | Formato |
|---|---|---|---|---|---|
| `bert-naive-svd-sst2` | 110 M (base) | no disponible | 90,37 % | MIT | safetensors (attention-only FP16) |
| `bert-base-uncased` (profesor, afinado SST-2) | 110 M | 512 | 91,63 % | Apache 2.0 | safetensors / PyTorch |
| Otros modelos del Attention Zoo de NeuralOps | no disponible | no disponible | no disponible | MIT | safetensors |

No se dispone de datos de benchmarks de alternativas subcuadráticas comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas.
- Tarea única: clasificación binaria de sentimiento; no es un modelo de propósito general ni generativo.
- Pérdida de exactitud respecto al profesor: 1,26 puntos en SST-2 (90,37 % frente a 91,63 %).
- Requiere `trust_remote_code=True` y ejecución de código remoto (`modeling_neuralops_bert.py`), lo que implica revisar el código antes de usarlo en producción.
- Dependencia de la librería NeuralOps y de la reconstrucción dinámica de los pesos base; posibles incompatibilidades con versiones futuras de Transformers.
- Riesgo de sesgos heredados de `bert-base-uncased` y de los datos de SST-2 (reseñas de películas), sin evaluación de sesgos publicada.
- Riesgo de alucinación no aplicable en sentido estricto (clasificador), pero sí de clasificaciones erróneas fuera de dominio.
- Licencia MIT permite uso comercial, pero la model card no documenta garantías ni evaluación en dominios distintos de SST-2.
- El repositorio tiene muy pocas descargas (81) y ningún "like": ecosistema y mantenimiento no contrastados.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-naive-svd-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue
