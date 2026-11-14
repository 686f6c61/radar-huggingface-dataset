# Hooshaai/bert-cosformer-sst2

## Resumen

`Hooshaai/bert-cosformer-sst2` es un checkpoint de clasificación de sentimiento binaria derivado de `google-bert/bert-base-uncased` (110 M de parámetros) en el que se han sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `cosformer`, una atención de complejidad subcuadrática (O(N) u O(N log N)) implementada en la librería NeuralOps. El modelo se ha afinado y destilado sobre la tarea SST-2 del benchmark GLUE (clasificación de sentimiento en inglés) y se publica como un conjunto de pesos de atención y cabeza de clasificación en FP16 (~55 MB), no como un modelo completo.

La relevancia práctica es doble: por un lado, demuestra que es posible reemplazar la atención cuadrática de BERT por una alternativa lineal manteniendo una precisión prácticamente idéntica (91,51 % frente al 91,63 % del profesor en la partición de validación de SST-2); por otro, introduce un protocolo de destilación con caché offline de representaciones que evita cargar el modelo profesor en VRAM durante el entrenamiento, reduciendo el coste a 144 pasos de optimización y 47,9 segundos en una única RTX 3090.

El modelo está pensado como pieza de evaluación arquitectónica y como ejemplo reproducible del zoo de atenciones de NeuralOps, más que como un clasificador listo para producción general. Su licencia MIT y su reducido tamaño lo hacen accesible para experimentación, aunque su naturaleza modular (pesos de atención únicamente, cargados sobre BERT base congelado mediante código remoto) impone dependencias específicas de la librería `neuralops`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con atención `cosformer` subcuadrática en las 12 capas |
| Parametros totales | 110 M (base BERT) + cabeza de clasificación; se publican solo pesos de atención y cabeza (~55 MB FP16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de `bert-base-uncased`, típicamente 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | Pesos publicados en FP16; no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, atención + cabeza de clasificación) |
| Libreria / runtime | `neuralops` (requiere `trust_remote_code=True`) |
| Modelo base | `google-bert/bert-base-uncased` |
| Dataset de evaluación | GLUE SST-2 (partición de validación, 872 muestras) |
| Tarea | Clasificación de texto binaria (sentimiento: 0 = negativo, 1 = positivo) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura BERT-base estándar (12 capas, 768 dimensiones ocultas, 12 cabezas de atención, 110 M de parámetros) y sustituye en cada capa el mecanismo de atención softmax cuadrática por `cosformer`. Este mecanismo reformula la atención como una suma ponderada con funciones de activación coseno y una codificación posicional relativa, logrando una complejidad efectiva O(N) u O(N log N) en lugar de O(N²), lo que en teoría permite manejar secuencias más largas con menor coste computacional.

El entrenamiento sigue el protocolo de destilación de representaciones con caché de NeuralOps, ejecutado en una NVIDIA GeForce RTX 3090 (24 GB). El proceso se divide en dos etapas: una primera de alineamiento de subespacios ocultos y una segunda de destilación de logits (KL) combinada con entropía cruzada de la tarea. El profesor (`bert-base-uncased` original) se ejecuta offline y sus representaciones se cachean, de modo que durante el entrenamiento del alumno no se asigna VRAM al profesor (pico de 13 512 MB). El entrenamiento completo consta de 144 pasos de optimización, dura 47,9 segundos y alcanza un throughput efectivo de 24 617,9 tokens por segundo. No se documenta en la información disponible el volumen de tokens de entrenamiento, la composición del dataset más allá de SST-2 ni si se aplicaron técnicas de RLHF o DPO (no procede en una tarea de clasificación).

## Capacidades

- Clasificación de sentimiento binaria en inglés (positivo/negativo) sobre texto de entrada.
- Atención subcuadrática `cosformer` en las 12 capas, con escalado teórico O(N) u O(N log N).
- Carga modular: los pesos de atención y la cabeza de clasificación se aplican sobre el BERT base congelado mediante código remoto (`modeling_neuralops_bert.py`).
- Integración con la API de alto nivel `neuralops.hub.bert_zoo.load_pretrained_bert` y con `neuralops.hub.load_surgeried_model`.
- Compatibilidad con `AutoModelForSequenceClassification` de Hugging Face Transformers usando `trust_remote_code=True`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un clasificador discriminativo, no un modelo generativo.
- Capacidad multilingüe: limitada al inglés.

## Casos de uso

- Análisis de sentimiento en reseñas de producto o comentarios de usuarios en inglés: el modelo devuelve una etiqueta binaria por secuencia y puede integrarse en un pipeline de `transformers` con una sola llamada a `from_pretrained`, sustituyendo a un BERT-base estándar con un coste de atención menor en secuencias largas.
- Evaluación comparativa de mecanismos de atención: sirve como referencia reproducible para medir la pérdida de precisión al cambiar softmax por `cosformer` en una tarea GLUE concreta (delta de -0,11 % frente al profesor), útil en investigación sobre eficiencia de transformers.
- Docencia y reproducción de destilación con caché offline: el protocolo documentado (144 pasos, 47,9 s, 13,5 GB de VRAM pico en RTX 3090) permite reproducir el experimento en hardware de consumo y estudiar la técnica de alineamiento de representaciones sin cargar el profesor en memoria.
- Moderación de comentarios a escala en inglés: al ser un clasificador ligero (~55 MB de pesos de atención más el BERT base congelado), puede desplegarse en CPU o GPU pequeña para filtrar toxicidad o polaridad en flujos de texto, siempre que se valide su calibración (entropía cruzada de validación 0,3044, superior a la del profesor).
- Base para fine-tuning en dominios específicos: al estar bajo licencia MIT y publicar solo los pesos de atención, es posible reutilizar el mecanismo `cosformer` afinado y adaptarlo a otras tareas de clasificación con datasets propios, partiendo de un checkpoint ya alineado con BERT base.
- Prototipado de arquitecturas eficientes en entornos con VRAM limitada: el tamaño reducido del repositorio (0,5 GB) y la carga modular permiten experimentar con atención subcuadrática en GPUs de consumo (RTX 3090, e incluso inferiores) sin necesidad de infraestructura de datacenter.

## Benchmarks y rendimiento

Evaluación sobre la partición de validación de GLUE SST-2 (872 muestras binarias), según la model card:

| Metrica | Profesor (`bert-base-uncased`) | Alumno pre-KD (`cosformer`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Exactitud SST-2 | 91,63 % | 91,63 % | 91,51 % | -0,11 % |
| Entropía cruzada de validación | 0,2428 | No calibrada | 0,3044 | Convergida |

Telemetría de entrenamiento (clúster HPC Sharif, RTX 3090 24 GB):

| Metrica | Valor |
|---|---|
| Duración del entrenamiento | 47,9 s |
| Pasos de optimización | 144 |
| Throughput efectivo | 24 617,9 tokens/s |
| VRAM pico | 13 512 MB |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es esperable al tratarse de un clasificador y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint publicado ocupa ~55 MB en FP16, pero la inferencia requiere además cargar el BERT base congelado (~440 MB en FP32, ~220 MB en FP16), por lo que el consumo total ronda 1-2 GB en FP32 incluyendo activaciones para secuencias cortas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; el autor valida el entrenamiento en una RTX 3090 (24 GB), pero la inferencia cabe holgadamente en GTX 1660, RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer modernas; también es viable en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, API `neuralops.hub.bert_zoo` y `neuralops.hub.load_surgeried_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo estas opciones no aplican de forma directa.
- Latencia y throughput: el autor reporta 24 617,9 tokens/s durante el entrenamiento en RTX 3090; no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-cosformer-sst2` | 110 M (BERT base) + atención `cosformer` | No disponible (heredado de BERT base) | 91,51 % | MIT | Hugging Face, requiere `neuralops` |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face, `transformers` estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | No disponible en esta ficha | Apache 2.0 | Hugging Face, `transformers` estándar |
| `roberta-base` afinado en SST-2 | 125 M | 512 tokens | No disponible en esta ficha | MIT | Hugging Face, `transformers` estándar |

La comparación directa con DistilBERT y RoBERTa afinados en SST-2 no puede cerrarse con cifras porque la información proporcionada no incluye sus resultados; se listan como alternativas de la misma categoría (clasificadores ligeros en inglés) sin datos numéricos verificados en esta ficha.

## Limitaciones y advertencias

- Solo clasificación binaria de sentimiento en inglés; no es un modelo generativo ni soporta instrucciones, tool calling ni agentes.
- La precisión reportada (91,51 %) procede de una única partición de validación de SST-2 (872 muestras); no hay evaluación en otros dominios ni en otros idiomas.
- La entropía cruzada de validación del alumno (0,3044) es superior a la del profesor (0,2428), lo que sugiere peor calibración de las probabilidades; conviene recalibrar antes de usar los logits como scores de confianza en producción.
- Dependencia de código remoto (`trust_remote_code=True`) y de la librería `neuralops`: el checkpoint no es autocontenido y requiere descargar el BERT base congelado por separado, lo que añade complejidad de despliegue y superficie de riesgo al ejecutar código de terceros.
- No se documentan sesgos específicos, pero al heredar el corpus de `bert-base-uncased` y SST-2 arrastra los sesgos de dichos datos (predominantemente reseñas de películas en inglés).
- Riesgo de alucinación no aplica en sentido estricto por ser un clasificador, pero sí existe riesgo de clasificaciones erróneas en textos fuera de dominio o con sarcasmo, ironía o negaciones complejas.
- Licencia MIT: permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0, por lo que deben respetarse ambas licencias al redistribuir.
- No se documenta la longitud máxima de contexto efectiva tras el cambio a `cosformer`; no asumir que soporta secuencias más largas que BERT base sin validación empírica.
- El repositorio tiene pocas descargas (86) y cero likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-cosformer-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue
