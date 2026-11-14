# Hooshaai/bert-svd-compressed-sst2

## Resumen

`Hooshaai/bert-svd-compressed-sst2` es un checkpoint derivado de `google-bert/bert-base-uncased` en el que se han sustituido los bloques de atencion softmax cuadratica de las 12 capas del transformer por un mecanismo denominado `svd_compressed`, perteneciente a la libreria NeuralOps (desarrollada por Taha Majlesi). El modelo se ha afinado y destilado especificamente para la tarea SST-2 del benchmark GLUE (clasificacion binaria de sentimiento en ingles) y se distribuye como un conjunto de pesos de atencion y cabeza de clasificacion en FP16 de aproximadamente 55 MB, no como el modelo completo.

La propuesta tecnica es la de una atencion subcuadratica con complejidad efectiva O(N) u O(N log N) frente a la O(N^2) de la multi-head attention estandar, orientada a reducir el coste computacional en secuencias largas manteniendo la calidad predictiva mediante destilacion de representaciones desde el profesor BERT-base original. El proceso de destilacion se realizo con el protocolo "Cached Representation Distillation" de NeuralOps, que evita mantener el profesor en VRAM durante el entrenamiento, y se ejecuto fisicamente en una unica NVIDIA RTX 3090 de 24 GB en 51,6 segundos y 263 pasos de optimizacion.

El modelo es relevante como referencia practica de atencion subcuadratica aplicada a una tarea estandar de NLP, con una accuracy reportada del 90,25 % en el split de validacion de SST-2 (frente al 91,63 % del profesor) y una mejora de +17,78 puntos respecto al estudiante sin destilar (72,48 %). Es un artefacto de investigacion pequeno, con licencia MIT y pensado para integrarse via `trust_remote_code` o via la API del hub de NeuralOps.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con atencion `svd_compressed` (subcuadratica) en las 12 capas |
| Parametros totales | 110 M (base BERT-base); los pesos distribuidos en el repo son solo atencion + cabeza de clasificacion (~55 MB en FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-base soporta 512 tokens, pero la model card no lo declara explicitamente para esta variante) |
| Tipos de cuantizacion | no disponible (los pesos se publican en FP16; no se documentan otras cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, solo atencion y cabeza de tarea); requiere `trust_remote_code=True` con `modeling_neuralops_bert.py` |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura BERT-base (12 capas, 110 M de parametros, encoder bidireccional) y reemplaza en cada capa el bloque de multi-head attention softmax cuadratica por el mecanismo `svd_compressed` de NeuralOps, que segun la model card ofrece una complejidad operativa efectiva de O(N) u O(N log N). Los pesos base de BERT quedan congelados y se cargan dinamicamente desde `bert-base-uncased`; el repositorio solo almacena los parametros de atencion entrenados y la cabeza de clasificacion, serializados en `attention_weights.safetensors` en FP16 (~55 MB).

El entrenamiento combina destilacion de conocimiento con ajuste fino supervisado sobre SST-2. Se emplea el "NeuralOps Cached Representation Distillation Protocol", que cachea offline las representaciones del profesor para no mantenerlo en VRAM, y se ejecuta en dos etapas: una primera de alineamiento de subespacio oculto y una segunda de KL sobre logits mas entropia cruzada de la tarea. El proceso completo se realizo en una RTX 3090 de 24 GB, con 263 pasos de optimizacion, 51,6 s de duracion y un throughput efectivo de 41.791,5 tokens/s, con un pico de VRAM de 7.376 MB. No se documentan en la model card el numero de tokens de entrenamiento, la composicion del corpus mas alla de GLUE/SST-2 ni el uso de RLHF o DPO.

## Capacidades

- Clasificacion binaria de sentimiento en ingles (positivo/negativo) sobre secuencias de texto, tarea para la que fue afinado y destilado.
- Razonamiento semantico a nivel de frase heredado de BERT-base, util para tareas de comprension del lenguaje en ingles.
- Inferencia con atencion subcuadratica (`svd_compressed`), lo que en principio reduce el coste en secuencias largas frente a la atencion cuadratica estandar.
- Carga modular: los pesos de atencion se aplican sobre `bert-base-uncased` congelado mediante el shim remoto `modeling_neuralops_bert.py`.
- Integracion con la API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`) para reconstruir el modelo de una linea.
- Compatibilidad con `AutoModelForSequenceClassification` de Hugging Face Transformers usando `trust_remote_code=True`.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling, agentes ni modo thinking.

## Casos de uso

- Analisis de sentimiento en resenas de producto o resenas de aplicaciones en ingles: el modelo clasifica secuencias como positivas o negativas con una accuracy reportada del 90,25 % en SST-2, suficiente para triage automatico a gran escala con un coste de inferencia bajo (55 MB de pesos de atencion).
- Moderacion de comentarios y filtrado de opiniones negativas en comunidades online: la cabeza de clasificacion binaria permite etiquetar grandes volumenes de texto en ingles y derivar a revision humana solo los casos de baja confianza.
- Investigacion en atencion subcuadratica: sirve como checkpoint de referencia para comparar `svd_compressed` frente a atencion softmax estandar en una tarea GLUE reproducible, con metricas y telemetria de entrenamiento publicadas.
- Benchmarking de destilacion de conocimiento: el par profesor (91,63 %) / estudiante destilado (90,25 %) permite evaluar protocolos de KD con asignacion cero de VRAM al profesor y medir la recuperacion de accuracy tras la compresion.
- Prototipado rapido en entornos con GPU consumer: al necesitar solo ~7,4 GB de VRAM en entrenamiento y una fraccion de eso en inferencia, es viable en una RTX 3090, RTX 4090 o incluso GPUs de gama media para pruebas.
- Educacion y demos de arquitecturas eficientes: el modelo y su codigo asociado permiten ilustrar en clases o talleres como se sustituye la atencion cuadratica por un mecanismo subcuadratico sin reentrenar el encoder completo.
- Integracion en pipelines de NLP en produccion en ingles donde el coste de memoria y el tamano del artefacto importan: 55 MB de pesos descargables frente a los ~450 MB del BERT-base completo.

## Benchmarks y rendimiento

Evaluacion reportada por el autor en el split de validacion de GLUE SST-2 (872 muestras de clasificacion binaria):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`svd_compressed`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy GLUE SST-2 | 91,63 % | 72,48 % | 90,25 % | +17,78 % |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,2956 | convergido |

Telemetria de entrenamiento (RTX 3090 24 GB):

| Metrica | Valor |
|---|---|
| Duracion del entrenamiento | 51,6 s |
| Pasos de optimizacion | 263 |
| Throughput efectivo | 41.791,5 tokens/s |
| Pico de VRAM | 7.376 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base BERT-base en FP16 ocupa aproximadamente 220 MB de pesos, mas los ~55 MB de atencion y cabeza, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- VRAM de entrenamiento documentada: 7.376 MB de pico en una RTX 3090 de 24 GB con el protocolo de destilacion cacheada.
- GPU recomendadas: RTX 3090 (usada por el autor), RTX 4090, A100 o H100 para entrenamiento o destilacion a mayor escala; cualquier GPU consumer moderna es suficiente para inferencia.
- Cabe en GPU consumer: si, en GTX 1660, RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`; API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de inferencia; solo se reporta throughput de entrenamiento (41.791,5 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-svd-compressed-sst2` | 110 M (base) + atencion `svd_compressed` | no disponible | 90,25 % | MIT | Hugging Face (repo de 0,0 GB, pesos de atencion ~55 MB) |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % (segun el autor) | Apache 2.0 | Hugging Face |
| BERT-base afinado estandar en SST-2 | 110 M | 512 tokens | ~92-93 % (referencia habitual en la literatura; no verificado en esta ficha) | Apache 2.0 | Multiples checkpoints en Hugging Face |
| DistilBERT-base-uncased | 66 M | 512 tokens | ~91 % en SST-2 (referencia habitual; no verificado en esta ficha) | Apache 2.0 | Hugging Face |

La comparativa se limita a los datos publicados por el autor y a referencias generales de la literatura; no se dispone de evaluaciones independientes del checkpoint `svd_compressed`.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha entrenado ni evaluado en otros idiomas.
- Es un modelo de clasificacion binaria de sentimiento, no un modelo generativo: no puede usarse para generacion de texto, codigo, resumen ni dialogos.
- La accuracy reportada (90,25 %) es inferior a la del profesor (91,63 %) y se ha medido unicamente en el split de validacion de SST-2 (872 muestras); no hay evaluacion en otros conjuntos ni en dominios fuera de resenas.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de clasificaciones erroneas en textos ambiguos, sarcasticos o fuera de dominio.
- Sesgos heredados de BERT-base y de SST-2 (resenas de peliculas en ingles), con posible degradacion en otros generos textuales o registros.
- Requiere `trust_remote_code=True` y ejecucion de codigo remoto (`modeling_neuralops_bert.py`), lo que implica un riesgo de seguridad en entornos de produccion y obliga a auditar el shim antes de desplegarlo.
- Los pesos distribuidos son solo de atencion y cabeza de clasificacion; el modelo debe reconstruirse descargando `bert-base-uncased` en tiempo de carga, lo que anade dependencia de red y de la version del modelo base.
- El autor del repo en Hugging Face (`Hooshaai`) y el autor citado en la model card (`tahamajs`) no coinciden en los ejemplos de codigo, lo que puede provocar errores al copiar los snippets; conviene verificar los identificadores antes de usarlos.
- No hay datos publicados sobre latencia, throughput de inferencia ni comportamiento con secuencias largas, pese a que la motivacion principal de `svd_compressed` es la eficiencia en contextos largos.
- Licencia MIT permite uso comercial, pero al derivar de BERT-base (Apache 2.0) conviene revisar las condiciones de ambos.
- Modelo con muy poca traccion (70 descargas, 2 likes en el momento de la consulta) y sin validacion independiente; no se recomienda como dependencia critica en produccion sin evaluacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-svd-compressed-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Referencia del autor en la model card: https://huggingface.co/tahamajs/bert-svd-compressed-sst2 (identificador usado en los snippets de codigo; verificar disponibilidad)
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue
