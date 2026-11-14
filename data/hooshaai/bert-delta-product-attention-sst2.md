# Hooshaai/bert-delta-product-attention-sst2

## Resumen

`bert-delta-product-attention-sst2` es una variante del modelo `google-bert/bert-base-uncased` en la que el autor (Hooshaai, con referencias en la model card a `tahamajs`) ha sustituido los 12 bloques de atención multi-cabeza estándar por un mecanismo denominado `delta_product_attention`, perteneciente a la librería NeuralOps. El modelo está ajustado para clasificación de sentimiento binaria (positiva/negativa) sobre el conjunto de datos GLUE SST-2 y se distribuye con licencia MIT.

El interés del modelo no reside en su rendimiento —que según la propia model card es prácticamente nulo tras la destilación, con una precisión del 49,08 % idéntica a la del estudiante previo al proceso de knowledge distillation—, sino en su valor como artefacto de investigación sobre atención subcuadrática y protocolos de destilación con caché offline de representaciones. La arquitectura base es un transformer encoder de 12 capas con aproximadamente 110 millones de parámetros, aunque el número exacto de parámetros del estudiante no se detalla en la información disponible.

Se trata, por tanto, de un modelo experimental de nicho, útil para quienes investigan mecanismos de atención alternativos y quieren reproducir o comparar el protocolo de destilación en dos etapas de NeuralOps, no para despliegues en producción de análisis de sentimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atención `delta_product_attention` (subcuadrática) en las 12 capas |
| Parámetros totales | no disponible (base BERT-base-uncased: ~110 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (base BERT-base-uncased: 512 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,5 GB; probablemente safetensors/PyTorch, no confirmado) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` y reemplaza los 12 bloques de self-attention estándar por el mecanismo `delta_product_attention`, una variante de atención subcuadrática incluida en la librería NeuralOps (citada como "BERT-131 Subquadratic Attention Zoo"). El tokenizador y el resto de la arquitectura BERT (embeddings, feed-forward, capas de clasificación) se mantienen presumiblemente intactos, aunque la información disponible no detalla si se modificaron otras partes de la red.

El entrenamiento consistió en un proceso de destilación de conocimiento sobre GLUE SST-2 usando el "NeuralOps 2-Stage Cached Representation Distillation Protocol", con caché offline de representaciones del profesor y cero VRAM dedicada al profesor. La etapa 1 alinea representaciones ocultas mediante coseno y MSE de subespacio; la etapa 2 aplica KL sobre logits de secuencia y entropía cruzada de tarea. El proceso se ejecutó en una NVIDIA RTX 3090 de 24 GB (clúster HPC Sharif), con una duración de 69,5 segundos, 10 pasos de destilación, throughput de 1178,4 tokens/s y un pico de VRAM de 13 512 MB. El resultado es un modelo que no supera el rendimiento aleatorio en la tarea, lo que sugiere que el protocolo de destilación no convergió o que el estudiante no aprendió la tarea en solo 10 pasos.

## Capacidades

- Clasificación de sentimiento binaria (positiva/negativa) sobre texto en inglés, según la pipeline declarada `text-classification`.
- Inferencia sobre texto tokenizado con el tokenizador estándar de BERT.
- Carga mediante `transformers` con `trust_remote_code=True` y mediante la API de alto nivel de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, function calling ni razonamiento multi-paso.
- No se documenta soporte multilingüe más allá del inglés.
- No se documenta un modo de razonamiento (thinking mode) ni capacidades de agente.

## Casos de uso

- Investigación sobre atención subcuadrática: el modelo sirve como artefacto reproducible para estudiar cómo se comporta `delta_product_attention` frente a la atención estándar de BERT en una tarea concreta, comparando la precisión del 49,08 % con la del profesor (91,63 %).
- Reproducción del protocolo de destilación NeuralOps: útil para validar la implementación del "2-Stage Cached Representation Distillation Protocol" con caché offline de representaciones y cero VRAM de profesor, dado que la model card documenta telemetría completa (duración, pasos, throughput, VRAM pico).
- Pruebas de integración de la librería NeuralOps: sirve para verificar la carga mediante `load_pretrained_bert` y `load_surgeried_model` en entornos de desarrollo antes de usar otros modelos del zoo.
- Docencia y experimentación con knowledge distillation: ejemplo didáctico de un caso en el que la destilación no mejora al estudiante, útil para discutir condiciones de convergencia y número de pasos.
- Benchmarking de infraestructura: la telemetría publicada (1178,4 tokens/s, 13 512 MB de VRAM pico en RTX 3090) permite comparar el rendimiento de hardware y entornos de ejecución en tareas de destilación de BERT.
- No es adecuado para análisis de sentimiento en producción: con una precisión del 49,08 % sobre SST-2, su utilidad práctica en esa tarea es nula.

## Benchmarks y rendimiento

Evaluación sobre la partición de validación de GLUE SST-2 (872 muestras), según la model card:

| Métrica | Profesor (baseline) | Estudiante pre-KD | Modelo destilado (post-KD) | Delta vs pre-KD |
|---|---|---|---|---|
| Precisión SST-2 | 91,63 % | 49,08 % | 49,08 % | +0,00 % |
| Pérdida de validación | 0,2428 | no disponible | 0,7012 | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el pico de VRAM documentado corresponde al entrenamiento (13 512 MB en una RTX 3090), no a inferencia.
- GPU recomendadas: la model card solo documenta el uso de una NVIDIA RTX 3090 de 24 GB para la destilación; no se especifican GPU recomendadas para inferencia.
- Cabe en GPU de consumo: por el tamaño del repo (0,5 GB) y el tamaño típico de BERT-base (~110 M de parámetros), es previsible que quepa en GPU de consumo, pero no se confirma en la información disponible.
- Opciones de despliegue: carga vía `transformers` con `trust_remote_code=True` y vía la API de NeuralOps (`neuralops.hub`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se documenta throughput de destilación (1178,4 tokens/s); no se documenta latencia ni throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-delta-product-attention-sst2` | ~110 M (no confirmado) | no disponible | 49,08 % (validación) | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor del experimento) | ~110 M | 512 tokens | 91,63 % (validación, según la model card) | Apache 2.0 | Hugging Face |
| Alternativas de atención subcuadrática en BERT | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables de la misma categoría (BERT con atención subcuadrática destilado en SST-2) en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento aleatorio en la tarea objetivo: 49,08 % de precisión en SST-2, idéntico al estudiante previo a la destilación, lo que indica que el proceso no aportó mejora alguna.
- Solo 10 pasos de destilación y 69,5 segundos de entrenamiento, lo que sugiere una convergencia insuficiente; no debe interpretarse como una evaluación definitiva del mecanismo `delta_product_attention`.
- Sesgos conocidos: no documentados en la información disponible; al heredar de BERT-base-uncased, es previsible que arrastre sesgos del corpus original, pero no se confirma.
- Riesgo de alucinación: no aplica en sentido estricto al ser un clasificador, pero la salida es esencialmente no fiable dado el rendimiento aleatorio.
- Limitaciones de idioma: solo inglés.
- Restricciones de licencia: MIT, permite uso comercial, pero el rendimiento del modelo hace inviable su uso en producción para análisis de sentimiento.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de usarlo en entornos sensibles.
- La model card contiene referencias a identificadores distintos (`tahamajs/bert-delta-product-attention-sst2` en los ejemplos de código frente a `Hooshaai/bert-delta-product-attention-sst2` en el ID del repo), lo que puede provocar errores de carga si no se ajusta la ruta.
- El formato de pesos no está confirmado; la carga mediante `transformers` y NeuralOps está documentada, pero no se garantiza compatibilidad con otros runtimes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-delta-product-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/glue
- No se han encontrado en la información disponible papers, blogs ni demos adicionales.
