# Hooshaai/bert-eat-sst2

## Resumen

`Hooshaai/bert-eat-sst2` es un checkpoint de clasificación de sentimiento en inglés derivado de `google-bert/bert-base-uncased`, en el que las doce capas de atención softmax cuadrática del transformer original se han sustituido por el mecanismo `eat` de la librería NeuralOps, de complejidad subcuadrática (O(N) u O(N log N) según el autor). El modelo se ha ajustado y destilado sobre la tarea SST-2 del benchmark GLUE y se distribuye como un conjunto de pesos de atención en FP16 más la cabeza de clasificación, con un peso de descarga de unos 55 MB.

La relevancia del checkpoint es fundamentalmente metodológica: sirve como demostración empírica de que es posible reemplazar la atención cuadrática de BERT por una variante subcuadrática y recuperar prácticamente el rendimiento del profesor (91,40 % frente a 91,63 % de accuracy en SST-2, una pérdida de 0,23 puntos) mediante un protocolo de destilación con caché offline de representaciones que evita mantener el profesor en VRAM. El entrenamiento se ejecutó en una única RTX 3090 en 48 segundos y 208 pasos.

Se trata, por tanto, de un modelo pequeño y especializado (clasificación binaria de sentimiento, inglés, contexto de 512 tokens heredado de BERT), no de un modelo generativo de propósito general. Su interés está en la evaluación de mecanismos de atención eficientes y en la reproducibilidad del pipeline de destilación, no en el despliegue como asistente conversacional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atención subcuadrática `eat` (NeuralOps) en las 12 capas |
| Parametros totales | 110 M (base BERT-Base); pesos serializados: ~55 MB en FP16 (solo atención y cabeza de tarea) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; heredada de BERT-Base (512 tokens) |
| Tipos de cuantizacion | FP16 (formato de serialización de los pesos de atención); no se documentan otras |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16), serialización `attention_only_fp16`; requiere `trust_remote_code=True` |
| Modelo base | google-bert/bert-base-uncased |
| Tarea | Clasificación binaria de sentimiento (SST-2) |
| Librería | neuralops |
| Tamaño del repo | 0,5 GB |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura BERT-Base (12 capas, 110 M de parámetros, encoder bidireccional) y sustituye en todas las capas el bloque de multi-head attention softmax estándar por el mecanismo `eat` de NeuralOps, que el autor describe como de complejidad operativa efectiva O(N) u O(N log N) frente a la O(N²) de la atención cuadrática. Los pesos base de BERT permanecen congelados y se inicializan en tiempo de carga desde `bert-base-uncased`; el repositorio solo almacena los parámetros de atención ajustados y la cabeza de clasificación, lo que explica el reducido tamaño de descarga (~55 MB).

El ajuste se realizó sobre SST-2 (GLUE) mediante el protocolo "NeuralOps Cached Representation Distillation", con dos etapas: alineamiento de subespacio oculto y, después, KL sobre logits más entropía cruzada de la tarea. El punto diferencial es que las representaciones del profesor se cachean offline, de modo que el profesor no consume VRAM durante el entrenamiento. Según la model card, el entrenamiento se ejecutó en una NVIDIA GeForce RTX 3090 (24 GB) durante 48 segundos, en 208 pasos, con un throughput efectivo de 35.525,4 tokens/s y un pico de VRAM de 13.512 MB.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés sobre textos de una sola secuencia.
- Comprensión de lenguaje natural de tipo encoder bidireccional, heredada de BERT-Base.
- Inferencia con atención subcuadrática, lo que reduce el coste asintótico en secuencias largas respecto a la atención cuadrática.
- Carga modular: reconstrucción del modelo completo aplicando los pesos de atención destilados sobre el BERT base congelado.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No dispone de visión, audio ni modo de razonamiento explícito (thinking mode).
- Multilingüismo: limitado al inglés; no se documentan capacidades en otros idiomas.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica cada reseña en positiva o negativa con una precisión en validación SST-2 del 91,40 %, suficiente para agregación de opiniones a escala y con un coste de inferencia bajo (55 MB de pesos de atención más el BERT base).
- Monitorización de reputación en redes sociales: permite puntuar en tiempo real grandes volúmenes de mensajes en inglés gracias a la atención subcuadrática, que abarata el procesamiento de secuencias largas frente a la atención cuadrática.
- Filtrado previo en pipelines de moderación: como clasificador ligero, puede etiquetar comentarios por polaridad antes de pasarlos a un modelo mayor, reduciendo el coste total del sistema.
- Investigación en mecanismos de atención eficientes: sirve como punto de comparación reproducible (mismo base, mismos datos, misma GPU) para medir la pérdida de accuracy al sustituir la atención softmax por variantes subcuadráticas.
- Docencia y experimentación con destilación: el protocolo de caché offline de representaciones y el bajo coste de entrenamiento (48 s en una RTX 3090) lo hacen adecuado para reproducir experimentos de knowledge distillation en entornos con recursos limitados.
- Evaluación de robustez de clasificadores: al ser un checkpoint pequeño y de licencia MIT, se puede integrar en baterías de pruebas de sesgo y robustez de clasificadores de sentimiento sin restricciones de uso comercial.
- Prototipado rápido en local: cabe en GPUs de consumo y permite iterar sobre la tarea SST-2 sin infraestructura dedicada.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras de clasificación binaria), según la model card:

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`eat`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 91,63 % | 91,40 % | -0,23 % |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,3091 | convergido |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, el modelo completo equivale a un BERT-Base (110 M de parámetros), que en FP16 ocupa del orden de 220 MB de pesos; los pesos de atención serializados son ~55 MB en FP16.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el entrenamiento documentado se realizó en una NVIDIA GeForce RTX 3090 (24 GB) con un pico de 13.512 MB.
- Cabe en GPU de consumo: sí, dado el tamaño del modelo base; no se documentan requisitos mínimos exactos.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` y `trust_remote_code=True`, o la API de alto nivel `neuralops.hub.bert_zoo.load_pretrained_bert` / `neuralops.hub.load_surgeried_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en entrenamiento se reportan 35.525,4 tokens/s en una RTX 3090; no se publican cifras de latencia o throughput en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hooshaai/bert-eat-sst2 | 110 M (base) | no disponible (heredado de BERT, 512) | 91,40 % | MIT | Hugging Face |
| google-bert/bert-base-uncased (profesor) | 110 M | 512 | 91,63 % | Apache 2.0 | Hugging Face |
| Otros checkpoints BERT-Base ajustados a SST-2 | 110 M | 512 | no disponible | variable | Hugging Face |
| Alternativas de atención eficiente sobre BERT | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de otros modelos con atención subcuadrática sobre SST-2 en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación binaria de sentimiento en inglés; no es un modelo generativo ni un asistente.
- Riesgo de alucinación no aplicable en sentido estricto, pero sí de clasificaciones erróneas en dominios distintos de SST-2 (reseñas de películas); no se documenta evaluación fuera de dominio.
- Sesgos: no se documenta ningún análisis de sesgo; al heredar el corpus y los pesos de BERT-Base, es previsible que arrastre sesgos de género, raza y registro del corpus original, aunque no se cuantifican.
- Limitación de idioma: solo inglés.
- Limitación de contexto: no se documenta explícitamente, pero al derivar de BERT-Base el límite práctico es de 512 tokens.
- Restricciones de licencia: MIT, por lo que se permite uso comercial; conviene verificar igualmente las condiciones de los pesos base de BERT (Apache 2.0) y de la librería NeuralOps.
- Requiere `trust_remote_code=True` y ejecución de código remoto (`modeling_neuralops_bert.py`), lo que implica revisar el código antes de desplegarlo en producción.
- El repositorio no incluye los pesos completos del modelo: la reconstrucción depende de la descarga de `bert-base-uncased` y de la disponibilidad de la librería `neuralops`.
- Los resultados de benchmarks proceden de la propia model card del autor y no se han verificado de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-eat-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base BERT-Base: https://huggingface.co/bert-base-uncased
- Dataset GLUE / SST-2: https://huggingface.co/datasets/glue
