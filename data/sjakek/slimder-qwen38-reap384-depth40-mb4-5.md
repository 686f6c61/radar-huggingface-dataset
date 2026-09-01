# sjakek/slimder-qwen38-reap384-depth40-mb4-5

## Resumen

SLIMDER Qwen3.8 REAP384 depth-40 es un checkpoint experimental derivado del modelo base `sjakek/slimder-qwen38-reap384-s0`, desarrollado por el autor sjakek. Se trata de un modelo de texto de tipo mixture-of-experts (MoE) con 131.026 millones de parámetros totales, que materializa un candidato estructural de poda de profundidad: elimina los macrobloques 4 y 5, reduciendo la pila de transformadores de 48 a 40 capas. El objetivo es evaluar el impacto de la poda estructural en la calidad del modelo, manteniendo un rendimiento aceptable con menor coste computacional.

Este checkpoint es un paso intermedio en un proceso de selección de arquitecturas podadas, no un modelo final de producción. Según la model card, el candidato ocupó el primer puesto en una criba de 66 candidatos y en una validación holdout de 5 candidatos, con una métrica de daño compuesto de 0,4367 y una probabilidad de que el token top-1 de la línea base permaneciera en el top-32 del candidato de 0,9983. Su relevancia radica en explorar técnicas de poda estructural en modelos MoE de gran escala, un área activa en la optimización de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) con poda de profundidad |
| Parametros totales | 131.026.159.680 (131B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.8 (etiquetada como `qwen4_exp` en los tags), que emplea un diseño transformer con mezcla de expertos (MoE). La innovacion principal de este checkpoint es la poda de profundidad: se eliminan los macrobloques 4 y 5, que corresponden a ocho capas transformer completas, reduciendo la pila de 48 a 40 capas. Esta poda se realiza sobre un checkpoint base fijado (`slimder-qwen38-reap384-s0`), y el resultado es un candidato estructural evaluado mediante metricas de dano compuesto y retencion de tokens top-1.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, ni si se aplicaron tecnicas de RLHF o DPO. El checkpoint se presenta como un materializacion experimental de un candidato de poda, con manifiestos (`PROMOTION.json` y `depth_materialization_manifest.json`) que documentan las revisiones exactas, indices de capa, tamanos de archivo y hashes SHA-256.

## Capacidades

- Generacion de texto: el modelo es capaz de generar texto continuo, dado que es un modelo de lenguaje de tipo text-generation.
- Razonamiento: al estar basado en Qwen3.8, se espera que herede capacidades de razonamiento, aunque no hay benchmarks publicados que lo confirmen.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible (los idiomas no estan especificados).
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Investigacion en poda estructural de modelos MoE: este checkpoint sirve como material de estudio para analizar como la eliminacion de capas afecta a la calidad del modelo, comparando con el checkpoint base y otros candidatos de poda.
- Evaluacion de metricas de dano post-poda: los manifiestos incluidos permiten reproducir el proceso de seleccion de candidatos y validar las metricas de retencion de tokens.
- Desarrollo de tecnicas de compresion de modelos: los resultados de este experimento pueden informar futuras estrategias de poda en modelos de gran escala.
- Benchmarking de eficiencia: al reducir el numero de capas, el modelo podria usarse para medir el trade-off entre latencia y calidad en entornos de inferencia.
- Fine-tuning posterior a la poda: el checkpoint podria servir como punto de partida para un ajuste fino que recupere parte de la calidad perdida por la poda.
- Comparacion con modelos sin podar: util para documentar el impacto de la poda en tareas de generacion de texto, aunque no hay datos publicos de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona metricas internas de validacion del proceso de poda (dano compuesto de 0,4367 y probabilidad de retencion de token top-1 de 0,9983), pero no resultados en MMLU, HumanEval, GSM8K u otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 131B parametros en precision fp16, se necesitarian aproximadamente 262 GB de VRAM solo para los pesos, mas el overhead de activaciones y cache KV. Con cuantizacion a 4 bits, la estimacion seria de unos 65-70 GB, pero no se ha publicado ninguna cuantizacion para este checkpoint.
- GPU recomendadas: no disponible. Dado el tamano, se requeririan multiples GPUs de alta gama (por ejemplo, 4x A100 80GB o 8x H100 80GB) para inferencia en fp16, o GPUs con 80GB+ para cuantizacion agresiva.
- Si cabe en consumer GPU: no, un modelo de 131B parametros no cabe en GPUs de consumo (RTX 4090 con 24GB, etc.) incluso con cuantizacion extrema.
- Opciones de despliegue: no se mencionan compatibilidades con vLLM, llama.cpp, Ollama o TGI. Dado que es un checkpoint experimental en safetensors, se podria intentar cargar con transformers, pero no hay garantias de soporte.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El modelo es un checkpoint experimental de poda sobre Qwen3.8, y no hay datos publicos de rendimiento frente a otros modelos de tamano similar (como Qwen3.8-Max, que segun OpenLM.ai alcanza 2,4 billones de parametros, o modelos MoE de 130B como Mixtral 8x22B). Se recomienda consultar la documentacion de Qwen3.8 para obtener referencias de la familia base.

## Limitaciones y advertencias

- Checkpoint experimental: no es un modelo final de produccion; la propia model card advierte que no constituye una afirmacion de calidad definitiva.
- Sesgos conocidos: no disponibles, pero al derivar de Qwen3.8 podria heredar sesgos del modelo base.
- Riesgo de alucinacion: no evaluado; no hay benchmarks que permitan estimar la fiabilidad factual.
- Limitaciones de contexto e idioma: no especificadas; se desconoce la longitud de contexto soportada y los idiomas cubiertos.
- Restricciones de licencia: licencia Apache-2.0, que permite uso comercial, pero el modelo es experimental y podria no estar optimizado para entornos productivos.
- Tamanos de archivo: el repositorio ocupa 262,1 GB, lo que implica requisitos de almacenamiento y transferencia considerables.
- Falta de documentacion: no hay informacion sobre el proceso de entrenamiento, datos utilizados ni configuracion de inferencia recomendada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sjakek/slimder-qwen38-reap384-depth40-mb4-5
- Modelo base: https://huggingface.co/sjakek/slimder-qwen38-reap384-s0
- Coleccion Qwen3.8 (referencia de la familia): https://huggingface.co/collections/Qwen/qwen38
- Informacion sobre Qwen3.8-Max (contexto de la familia): https://openlm.ai/qwen3.8/
