# Hooshaai/bert-orion-sst2

## Resumen

`Hooshaai/bert-orion-sst2` es un checkpoint de clasificación de texto derivado de `google-bert/bert-base-uncased` en el que se han sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `orion`, perteneciente a la librería NeuralOps (autor: Taha Majlesi). El modelo se ha destilado y evaluado sobre la tarea SST-2 del benchmark GLUE, con un objetivo declarado de reducir la complejidad operativa de la atención de O(N²) a O(N) u O(N log N).

El repositorio no redistribuye los pesos completos de BERT: contiene únicamente los pesos de atención y la cabeza de clasificación en FP16 (`attention_weights.safetensors`, ~55 MB), y un shim de código remoto (`modeling_neuralops_bert.py`) que reconstruye el modelo cargando la base congelada desde `bert-base-uncased`. El resultado declarado en la model card es una accuracy del 77,52 % en el split de validación de SST-2 (872 muestras), frente al 91,63 % del profesor BERT-base y el 51,15 % del estudiante antes de destilación.

Es relevante como pieza de investigación sobre mecanismos de atención subcuadrática aplicados a un transformer estándar, no como sustituto de producción de BERT-base: la brecha de 14,11 puntos porcentuales en SST-2 y el hecho de que solo se haya evaluado una tarea de GLUE limitan su uso fuera de experimentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con atención `orion` (subcuadrática) en las 12 capas |
| Parámetros totales | ~110 M (base BERT-base-uncased; el repo solo almacena pesos de atención y cabeza) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-base, 512 tokens, no confirmado en la información) |
| Tipos de cuantización | FP16 en los pesos de atención publicados; no se documentan otras |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, FP16, ~55 MB) + código remoto (`custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, ~110 M de parámetros) y reemplaza la atención multi-cabeza estándar por el mecanismo `orion` de NeuralOps, con complejidad efectiva declarada de O(N) u O(N log N) frente a O(N²). La serialización es modular: solo se publican los pesos de atención especializados y la cabeza de clasificación en FP16, mientras que el resto de pesos se inicializan congelados desde el checkpoint original de BERT en tiempo de carga.

El entrenamiento sigue el protocolo "NeuralOps Cached Representation Distillation": una primera etapa de alineamiento de subespacio oculto y una segunda etapa con KL sobre logits más entropía cruzada de la tarea. Se ejecutó en una NVIDIA GeForce RTX 3090 (24 GB), con 101 pasos de optimización, 56,3 s de duración, throughput de 14.685,8 tokens/s y un pico de VRAM de 10.282 MB. La destilación se realizó con caché offline de representaciones del profesor (sin asignar VRAM del profesor durante el entrenamiento). El dataset es SST-2 (GLUE), en inglés.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés.
- Inferencia sobre la arquitectura BERT-base completa gracias al shim de código remoto que reconstruye los pesos base.
- Carga mediante `AutoModelForSequenceClassification` con `trust_remote_code=True`.
- Carga mediante la API modular de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`).
- No se documentan capacidades de generación, tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Multilingüismo: no soportado (solo inglés).

## Casos de uso

- Análisis de sentimiento en reseñas de producto en inglés: clasificación binaria directa con la cabeza de SST-2, útil como línea base en experimentos de atención eficiente.
- Investigación sobre atención subcuadrática: comparar `orion` frente a MHA estándar en un transformer BERT-base con el mismo presupuesto de parámetros.
- Reproducción de experimentos de destilación: el protocolo de caché offline de representaciones y los telemetraje publicados (pasos, throughput, VRAM) permiten replicar el pipeline en una RTX 3090.
- Evaluación de eficiencia memoria/tiempo: medir el impacto real de sustituir atención cuadrática por `orion` en secuencias largas dentro del rango de 512 tokens de BERT.
- Docencia y prototipado: modelo ligero (~55 MB de pesos específicos) para demostrar serialización modular de atención en Hugging Face.
- Filtrado de comentarios en inglés en pipelines internos donde una accuracy del ~77,5 % sea suficiente y se prefiera una licencia MIT permisiva.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras binarias), según la model card:

| Métrica | Profesor (`bert-base-uncased`) | Estudiante `orion` pre-KD | Modelo destilado |
|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 51,15 % | 77,52 % |
| Cross-entropy de validación | 0,2428 | no calibrada | 0,5747 |

Delta de accuracy tras destilación: +26,38 puntos porcentuales. No se han publicado resultados de benchmarks en otras tareas de GLUE ni en MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~10,3 GB de pico durante el entrenamiento en FP16; la inferencia en FP16 de BERT-base ronda los 0,5-1 GB, aunque no se documenta una medición específica de inferencia.
- GPU utilizada en el desarrollo: NVIDIA GeForce RTX 3090 (24 GB, Ampere).
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y superiores; no confirmado por el autor.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; API de NeuralOps (`load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput declarado en entrenamiento: 14.685,8 tokens/s; no se publica latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-orion-sst2` | ~110 M (base) | no disponible | 77,52 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor) | ~110 M | 512 | 91,63 % (referencia de la card) | Apache 2.0 | Hugging Face, estándar |
| BERT-base fine-tuned en SST-2 (referencia típica GLUE) | ~110 M | 512 | ~92-93 % (valores habituales de la literatura, no verificados aquí) | Apache 2.0 | Hugging Face |

No se dispone de comparación con otros mecanismos subcuadráticos (por ejemplo, Linear Attention o Performer) en la información proporcionada.

## Limitaciones y advertencias

- Brecha de rendimiento significativa frente al profesor: 77,52 % frente a 91,63 % en SST-2 (14,11 puntos).
- Solo se ha evaluado en una tarea de GLUE (SST-2); no hay resultados en MNLI, QQP, CoLA ni otras tareas.
- El estudiante pre-destilación rinde al 51,15 %, cerca del azar, lo que sugiere que el mecanismo `orion` requiere destilación para ser funcional.
- Solo inglés; no hay soporte multilingüe documentado.
- Requiere `trust_remote_code=True` y ejecución de código remoto (`modeling_neuralops_bert.py`), lo que implica un riesgo de seguridad en entornos de producción.
- Depende de la disponibilidad de `bert-base-uncased` en el Hub para reconstruir los pesos base; si el checkpoint base cambia o se retira, la carga puede fallar.
- Licencia MIT: permite uso comercial, pero el código remoto y la dependencia de NeuralOps deben auditarse antes de desplegar.
- Riesgo de alucinación no aplicable en sentido estricto (es clasificación), pero sí de errores de calibración: la cross-entropy de validación (0,5747) es más del doble que la del profesor (0,2428).
- Sin métricas de latencia, throughput de inferencia ni comportamiento en secuencias largas más allá del rango de BERT.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-orion-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/glue
