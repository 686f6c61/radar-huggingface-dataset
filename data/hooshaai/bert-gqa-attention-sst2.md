# Hooshaai/bert-gqa-attention-sst2

## Resumen

`bert-gqa-attention-sst2` es un checkpoint derivado de `bert-base-uncased` en el que las 12 capas del transformer original, con atencion softmax cuadratica, han sido sustituidas por el mecanismo `gqa_attention` (Grouped-Query Attention) de la libreria NeuralOps. Lo desarrolla Hooshaai (Taha Majlesi) como parte de su "Subquadratic Attention Zoo", un conjunto de variantes de BERT con mecanismos de atencion subcuadraticos evaluados sobre GLUE. El modelo resuelve una tarea concreta: clasificacion binaria de sentimiento sobre SST-2, manteniendo una precision de 91,40 % frente al 91,63 % del profesor original, con una perdida de solo 0,23 puntos.

La relevancia tecnica esta en el enfoque de destilacion y serializacion: en lugar de publicar los ~450 MB del BERT base completo, el repositorio contiene unicamente los pesos de atencion y la cabeza de clasificacion en FP16 (~55 MB), que se aplican sobre los pesos congelados de `bert-base-uncased` cargados en tiempo de ejecucion mediante un shim de codigo remoto (`modeling_neuralops_bert.py`). El entrenamiento se realizo con el protocolo "Cached Representation Distillation" de NeuralOps, que evita mantener el profesor en VRAM cacheando representaciones offline.

Es un modelo de nicho, orientado a investigacion sobre eficiencia de atencion y a la validacion empirica de mecanismos subcuadraticos, no a produccion generalista. Su licencia MIT y su reducido tamano lo hacen facil de reproducir y auditar, aunque su unico idioma soportado es el ingles (heredado de `bert-base-uncased`) y su ambito funcional se limita a la clasificacion de sentimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base) con atencion `gqa_attention` (Grouped-Query Attention) en las 12 capas; complejidad efectiva O(N) u O(N log N) frente a O(N^2) de MHA |
| Parametros totales | ~110 M (base BERT) + cabeza de clasificacion; los pesos publicados en el repo son solo atencion + cabeza (~55 MB en FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de `bert-base-uncased`, tipicamente 512 tokens, no especificado en la model card) |
| Tipos de cuantizacion | no disponible; pesos publicados en FP16 (`attention_only_fp16`) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`), serializacion modular "attention-only" |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, ~110 M parametros, encoder bidireccional) y sustituye en todas las capas el bloque de atencion multi-cabeza estandar por `gqa_attention`, un mecanismo de Grouped-Query Attention que comparte claves y valores entre grupos de cabezas de consulta, reduciendo el coste computacional y de memoria de la atencion. Segun la model card, la complejidad operacional efectiva pasa de O(N^2) a O(N) u O(N log N). Los pesos del BERT base se mantienen congelados; solo se entrenan y serializan los parametros de atencion y la cabeza de clasificacion.

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol", una destilacion en dos etapas: primero alineacion de subespacio oculto (Stage 1 Subspace Hidden Alignment) y despues KL sobre logits combinada con entropia cruzada de la tarea (Stage 2 Logit KL + Task CE). El profesor no ocupa VRAM durante el proceso porque sus representaciones se cachean offline. La ejecucion fisica se realizo en una NVIDIA GeForce RTX 3090 (24 GB), con 206 pasos de optimizacion, 48,2 s de duracion total, throughput efectivo de 35.013,4 tokens/s y un pico de VRAM de 23.021 MB. El dataset de evaluacion es la particion de validacion de SST-2 (872 muestras binarias).

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) sobre texto en ingles.
- Inferencia sobre secuencias de entrada estilo BERT (tokenizer de `bert-base-uncased`).
- Carga modular mediante la API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`) o mediante `AutoModelForSequenceClassification` con `trust_remote_code=True`.
- Atencion subcuadratica que reduce el coste computacional en secuencias largas respecto al BERT original (segun la model card).
- No soporta generacion de texto, tool calling, agentes, vision, audio ni modo "thinking"; es un modelo exclusivamente discriminativo.
- Multilingue: no; solo ingles.

## Casos de uso

- Analisis de sentimiento en resenas de producto o resenas de peliculas en ingles: el modelo esta entrenado y evaluado especificamente sobre SST-2, por lo que es directamente aplicable a clasificacion binaria de opinion con una precision de referencia del 91,40 %.
- Filtrado de comentarios en foros o redes: clasificacion rapida de tono positivo/negativo para moderacion o priorizacion, con un coste de inferencia reducido gracias a la atencion GQA.
- Investigacion sobre eficiencia de atencion: sirve como punto de comparacion controlado frente a `bert-base-uncased` para medir el impacto de GQA en precision y throughput en una tarea GLUE estandar.
- Destilacion y experimentos de KD: el protocolo Cached Representation Distillation y los scripts de NeuralOps permiten reproducir el pipeline en una unica RTX 3090, util para laboratorios con hardware limitado.
- Pipeline de etiquetado a gran escala: el checkpoint de ~55 MB se descarga e integra rapidamente en servicios de clasificacion por lotes, sin necesidad de alojar los 450 MB del BERT completo.
- Benchmark de referencia en articulos academicos: al ser un checkpoint publico con metricas reproducibles (accuracy, cross-entropy, telemetria de entrenamiento), sirve como baseline citable en trabajos sobre atencion subcuadratica.
- Educacion y prototipado: ejemplo minimo de sustitucion modular de mecanismos de atencion en BERT, util para cursos o talleres sobre arquitecturas eficientes.

## Benchmarks y rendimiento

Evaluacion sobre la particion de validacion de GLUE SST-2 (872 muestras binarias), segun la model card:

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`gqa_attention`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 91,63 % | 91,40 % | -0,23 % |
| Cross-entropy de validacion | 0,2428 | no calibrado | 0,2868 | convergido |

Telemetria de entrenamiento (RTX 3090, 24 GB):

| Metrica | Valor |
|---|---|
| Duracion del entrenamiento | 48,2 s |
| Pasos de optimizacion | 206 |
| Throughput efectivo | 35.013,4 tokens/s |
| Pico de VRAM | 23.021 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano (~110 M parametros) cabe holgadamente en GPUs consumer de 8 GB o menos, e incluso en CPU para lotes pequenos.
- GPU recomendadas: cualquier GPU moderna con al menos 8 GB; el entrenamiento se valido en una RTX 3090 (24 GB) con pico de 23.021 MB por el protocolo de destilacion, no por la inferencia.
- Cabe en GPU consumer: si; RTX 3060, RTX 4060, RTX 4090 y equivalentes.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles para inferencia; el unico dato publicado es el throughput de entrenamiento (35.013,4 tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-gqa-attention-sst2` | ~110 M (atencion + cabeza publicadas) | no disponible (heredado de BERT-base) | 91,40 % | MIT | Hugging Face |
| `bert-base-uncased` (profesor) | ~110 M | 512 tokens (tipico) | 91,63 % | Apache 2.0 | Hugging Face |
| Otros modelos del Attention Zoo de NeuralOps | no disponible | no disponible | no disponible | MIT (segun repo) | Hugging Face / GitHub |

No se dispone de datos de benchmarks de otras alternativas subcuadraticas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Ambito funcional muy restringido: solo clasificacion binaria de sentimiento en ingles; no genera texto ni soporta tareas generativas.
- Riesgo de alucinacion no aplicable en sentido estricto (modelo discriminativo), pero puede producir clasificaciones erroneas en dominios alejados de SST-2 (resenas de pelicula).
- Solo idioma ingles; no se garantiza comportamiento en castellano ni en otros idiomas.
- Requiere `trust_remote_code=True` y ejecucion de codigo remoto (`modeling_neuralops_bert.py`), lo que implica un riesgo de seguridad y de reproducibilidad a auditar antes de usar en produccion.
- Dependencia de la version de la libreria NeuralOps y del shim remoto; cambios en el repositorio o en `bert-base-uncased` pueden romper la carga.
- Pesos publicados de forma modular (solo atencion + cabeza, ~55 MB): es imprescindible descargar `bert-base-uncased` para reconstruir el modelo completo.
- Licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` tiene su propia licencia (Apache 2.0) que debe respetarse.
- Precision ligeramente inferior al profesor (-0,23 puntos) y cross-entropy mas alta (0,2868 frente a 0,2428), lo que indica menor calibracion de las probabilidades.
- Sin datos publicados sobre sesgos, robustez adversarial ni comportamiento fuera de la distribucion de SST-2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-gqa-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE / SST-2: https://gluebenchmark.com/
