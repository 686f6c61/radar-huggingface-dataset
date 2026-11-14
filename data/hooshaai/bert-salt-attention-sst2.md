# Hooshaai/bert-salt-attention-sst2

## Resumen

`Hooshaai/bert-salt-attention-sst2` es un checkpoint de clasificación de sentimiento derivado de `google-bert/bert-base-uncased` en el que se han sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `salt_attention` de la librería NeuralOps, con complejidad efectiva subcuadrática (O(N) u O(N log N)). Lo publica el autor Taha Majlesi bajo la organización Hooshaai como parte de su "Attention Zoo" de BERT preentrenados y destilados sobre GLUE.

El modelo se ha destilado desde el propio `bert-base-uncased` como profesor mediante el protocolo NeuralOps Cached Representation Distillation, que cachea offline las representaciones del profesor para no reservar VRAM adicional durante el entrenamiento. La evaluación se realiza sobre la tarea SST-2 de GLUE (clasificación binaria de sentimiento en inglés) y alcanza un 80,73 % de accuracy en el split de validación, partiendo de un 53,67 % antes de la destilación.

Su interés es fundamentalmente de investigación: demuestra que un mecanismo de atención subcuadrático puede recuperar buena parte del rendimiento de un BERT-base estándar (91,63 %) con un coste de entrenamiento muy bajo (58 segundos en una RTX 3090) y un artefacto de solo ~55 MB. No es un modelo de propósito general ni multilingüe: es un clasificador de sentimiento en inglés con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con atención `salt_attention` subcuadrática en las 12 capas |
| Parametros totales | 110M (base BERT-base; el checkpoint distribuido solo contiene pesos de atención y cabeza de clasificación) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-base, típicamente 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | FP16 en los pesos de atención; no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, ~55 MB), serialización `attention_only_fp16` |
| Libreria | neuralops (requiere `trust_remote_code=True` en Transformers) |
| Modelo base | google-bert/bert-base-uncased |
| Tarea | Clasificación de secuencias (SST-2, binaria) |
| Dataset de evaluación | GLUE / SST-2 |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (110M parámetros, encoder transformer de 12 capas) y reemplaza en todas las capas el mecanismo de multi-head attention softmax estándar, de complejidad O(N²), por `salt_attention`, que según el autor ofrece complejidad operativa efectiva O(N) u O(N log N). El repositorio no redistribuye los pesos completos del BERT base: solo publica en FP16 los pesos de atención entrenados y la cabeza de clasificación (~55 MB), y el código remoto (`modeling_neuralops_bert.py`) reconstruye el modelo inicializando los pesos congelados del base desde `bert-base-uncased` y aplicando encima los parámetros destilados.

El entrenamiento usa el protocolo NeuralOps Cached Representation Distillation en dos etapas: primero una alineación de subespacio oculto (Stage 1 Subspace Hidden Alignment) y después una combinación de KL sobre logits y entropía cruzada de la tarea (Stage 2 Logit KL + Task CE). El profesor es el propio `bert-base-uncased`, cuyas representaciones se cachean offline para no consumir VRAM adicional. La ejecución se realizó en una NVIDIA GeForce RTX 3090 (24 GB, Ampere) durante 58 segundos, con 248 pasos de optimización, throughput efectivo de 35 047,4 tokens/s y un pico de VRAM de 7361 MB. No se documentan detalles sobre el corpus de preentrenamiento del mecanismo de atención ni sobre el uso de RLHF/DPO (no aplicable a esta tarea).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés sobre textos tipo SST-2.
- Inferencia con arquitectura de atención subcuadrática, lo que en teoría reduce el coste computacional en secuencias largas frente a la atención cuadrática.
- Integración con `transformers` mediante `AutoModelForSequenceClassification` con `trust_remote_code=True`.
- Carga modular mediante la API `neuralops.hub.bert_zoo.load_pretrained_bert` y `neuralops.hub.load_surgeried_model`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta generación de texto, código, matemáticas, visión ni audio.
- No es multilingüe: solo inglés.
- No dispone de modo "thinking" ni capacidades especiales más allá de la clasificación.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: clasificar reseñas cortas en inglés como positivas o negativas usando la cabeza de clasificación SST-2; adecuado por su entrenamiento específico en esa tarea, aunque con la precisión limitada del 80,73 %.
- Moderación de comentarios en foros en inglés: filtro preliminar de toxicidad/negatividad combinado con un clasificador adicional; útil por su bajo coste de despliegue (~55 MB de pesos de atención más el base BERT).
- Investigación en mecanismos de atención eficientes: servir como checkpoint de referencia para comparar `salt_attention` frente a atención softmax estándar en tareas GLUE, gracias a que el artefacto es pequeño y reproducible en una sola GPU consumer.
- Benchmarking de destilación: usar el par profesor (BERT-base) y estudiante (este modelo) para evaluar protocolos de knowledge distillation con cacheo offline de representaciones.
- Experimentos de eficiencia en secuencias largas: probar el modelo en entradas de hasta 512 tokens para medir empíricamente la ganancia teórica de la atención subcuadrática en latencia y memoria.
- Pipeline de etiquetado débil en inglés: preetiquetar grandes volúmenes de texto con este clasificador y revisar manualmente solo los casos de baja confianza, aprovechando su reducido footprint.
- Docencia y demos: ejemplo didáctico de sustitución modular de bloques de atención en BERT y de carga de pesos parciales con `trust_remote_code`.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras de clasificación binaria):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`salt_attention`) | Modelo destilado |
|---|---|---|---|
| Accuracy GLUE SST-2 | 91,63 % | 53,67 % | 80,73 % |
| Cross-entropy de validación | 0,2428 | no calibrado | 0,4645 |
| Delta de accuracy | — | — | +27,06 pp |

Telemetría de entrenamiento (clúster HPC Sharif, RTX 3090 24 GB):

| Metrica | Valor |
|---|---|
| Duración del entrenamiento | 58,0 s |
| Pasos de optimización | 248 |
| Throughput efectivo | 35 047,4 tokens/s |
| Pico de VRAM | 7361 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint de atención ocupa ~55 MB en FP16; sumando los pesos congelados de `bert-base-uncased` (~440 MB en FP32, ~220 MB en FP16) el modelo completo ronda los 0,5 GB en FP32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó en una RTX 3090 (24 GB, Ampere) con un pico de 7361 MB durante la destilación.
- Cabe en GPU consumer: sí, en cualquier GPU moderna (GTX 1650, RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, API de NeuralOps (`neuralops.hub`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (el formato es safetensors parcial, no GGUF).
- Latencia y throughput: no se publican cifras de inferencia; el throughput de 35 047,4 tokens/s corresponde al entrenamiento, no a la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-salt-attention-sst2` | 110M (base) | no disponible | 80,73 % | MIT | Hugging Face (`neuralops`) |
| `google-bert/bert-base-uncased` (profesor) | 110M | 512 | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face (`transformers`) |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66M | 512 | no disponible en esta ficha | Apache 2.0 | Hugging Face (`transformers`) |
| `textattack/bert-base-uncased-SST-2` | 110M | 512 | no disponible en esta ficha | Apache 2.0 | Hugging Face (`transformers`) |

La comparación con DistilBERT y con el BERT afinado de TextAttack se ofrece como referencia de categoría (clasificadores SST-2 en inglés); no se dispone de sus métricas exactas en la información proporcionada, por lo que no se comparan numéricamente.

## Limitaciones y advertencias

- El accuracy (80,73 %) está muy por debajo del profesor BERT-base (91,63 %): una diferencia de ~11 puntos porcentuales que limita su uso en producción donde se requiera alta precisión.
- El estudiante pre-destilación tenía solo 53,67 % de accuracy; el modelo final depende críticamente del protocolo de destilación y puede degradarse fuera del dominio SST-2.
- Solo inglés: no soporta otros idiomas.
- Solo clasificación binaria de sentimiento: no es un modelo generativo ni de propósito general.
- Requiere `trust_remote_code=True` y la librería `neuralops`, lo que añade dependencias y superficie de ejecución de código remoto.
- La carga modular asume que `bert-base-uncased` está disponible; si se modifica o elimina ese checkpoint base, el modelo deja de ser reproducible.
- Riesgo de alucinación no aplicable (no genera texto), pero sí de clasificaciones erróneas en textos ambiguos, irónicos o fuera de distribución.
- No se documentan sesgos específicos, pero al heredar el preentrenamiento de `bert-base-uncased` arrastra los sesgos de su corpus (mayoritariamente inglés y de fuentes web).
- La licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0 y la librería `neuralops` debe verificarse por separado.
- El repositorio tiene 57 descargas y 0 likes en el momento de la consulta: ecosistema muy pequeño, poca validación externa.
- El autor del repositorio en Hugging Face es `Hooshaai`, pero los ejemplos de código de la model card referencian `tahamajs/bert-salt-attention-sst2`; conviene verificar la ruta correcta antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-salt-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE: https://huggingface.co/datasets/glue
- Dataset SST-2: https://huggingface.co/datasets/glue/viewer/sst2
