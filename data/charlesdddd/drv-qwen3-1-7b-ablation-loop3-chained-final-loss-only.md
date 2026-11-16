# CharlesDDDD/DRV-Qwen3-1.7B-ablation-loop3-chained-final-loss-only

## Resumen

DRV-Qwen3-1.7B-ablation-loop3-chained-final-loss-only es un modelo de lenguaje derivado de Qwen/Qwen3-1.7B-Base mediante *continued pretraining* con una arquitectura de transformer con recurrencia en profundidad (*looped transformer*). Lo desarrolla el usuario CharlesDDDD dentro de la colección Depth Recurrent Vector, y forma parte de una serie de ablaciones que exploran distintas formas de conectar las pasadas repetidas de un bloque de capas. El modelo tiene 1.720.577.024 parámetros y un repositorio de 3,4 GB en safetensors.

La innovación central es que las capas 8-19 (12 de las 28 capas, contando desde 0) forman un bloque que se ejecuta varias veces seguidas con los mismos pesos, de modo que el modelo obtiene más cómputo por token sin aumentar el número de parámetros. Las capas 0-7 se ejecutan una vez antes del bloque y las 20-27 una vez después. En esta variante concreta ("ablation-loop3-chained-final-loss-only") la pérdida se calcula únicamente en la pasada final, a diferencia de la variante de referencia que también entrena con una pérdida pequeña en las pasadas intermedias.

Es relevante ahora porque la recurrencia en profundidad es una línea activa de investigación para escalar el cómputo en inferencia sin escalar los parámetros, y este modelo publica datos concretos de pérdida en función del número de pasadas, lo que permite evaluar empíricamente el compromiso entre cómputo y calidad. Es un modelo base, sin ajuste por instrucciones, y su arquitectura no está soportada todavía por vLLM ni por otros motores de serving estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con recurrencia en profundidad (looped transformer); bloque de capas 8-19 repetido, capas 0-7 y 20-27 de una sola pasada |
| Parametros totales | 1.720.577.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 16K tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base (28 capas) y aplica *continued pretraining* durante aproximadamente 20B tokens, una sola pasada sobre una mezcla de web, PDF, código y trayectorias de agente, con secuencias de 16K tokens, optimizador AdamW y LR pico de 3e-4 con decaimiento coseno. La modificación arquitectónica consiste en convertir las capas 8-19 en un bloque recurrente que se ejecuta varias veces con los mismos pesos; el número de pasadas entrenado es 3. Las capas 0-7 se ejecutan una vez antes del bloque y las 20-27 una vez después.

La conexión entre pasadas se realiza mediante una compuerta aprendida por canal oculto (`model.loop_gate`, un escalar `g` por canal): la primera pasada lee la salida `e` de la capa 7, y cada pasada posterior lee `e + g * (salida de la pasada anterior - e)`. Con `g = 0` el modelo equivale exactamente al Qwen3 original. En esta ablación concreta la pérdida se aplica solo en la pasada final (de ahí "final-loss-only"), a diferencia de la variante estándar que añade una pérdida de peso 0,0555 en cada pasada intermedia. El modelo requiere `trust_remote_code=True` y se ha probado con transformers 5.14; la implementación de HF coincide con el código de entrenamiento con una diferencia de 0,003 nats de pérdida en cada número de pasadas.

## Capacidades

- Generación de texto autoregresiva sobre modelos base, sin ajuste por instrucciones (no es un modelo conversacional entrenado con RLHF/DPO).
- Razonamiento y generación de código heredados del corpus de entrenamiento (mezcla de web, PDF, código y trayectorias de agente).
- Cómputo adaptativo en inferencia: el número de pasadas del bloque recurrente se puede variar en generación mediante el parámetro `num_loops` (por defecto, el número entrenado, 3).
- Salida utilizable con parada temprana: aunque esta ablación no entrena pérdida en pasadas intermedias, la tabla de pérdidas muestra que con 1 pasada el modelo ya produce texto coherente (loss 2,0628 frente a 1,1198 con 3 pasadas).
- Soporte de tool calling / function calling: no disponible (modelo base sin ajuste de instrucciones).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad entrenada explícita; el corpus incluye trayectorias de agente, pero no hay ajuste específico.
- Capacidades multilingües: no disponibles (idiomas no documentados).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre recurrencia en profundidad: el modelo sirve como punto de comparación controlado frente a `DRV-Qwen3-1.7B-midtrain-noloop` y frente a las demás ablaciones de la colección, para medir el efecto de la pérdida solo en la pasada final sobre la calidad con 1, 2 y 3 pasadas.
- Estudio del compromiso cómputo-calidad en inferencia: con la tabla de pérdidas por número de pasadas (de 2,0628 con 1 pasada a 1,1198 con 3 y 1,4390 con 8) se puede ajustar dinámicamente el número de pasadas según el presupuesto de latencia, algo que un transformer estándar no permite.
- *Continued pretraining* y experimentos de ajuste fino: al ser un modelo base de 1,7B con licencia Apache 2.0, es adecuado como punto de partida para fine-tuning supervisado o DPO en dominios concretos, comparando el comportamiento con y sin bucle.
- Generación de texto en dominios técnicos: con contexto de entrenamiento de 16K tokens y mezcla de código y PDF, puede emplearse para completar documentación técnica o código en pipelines de investigación, siempre con validación humana.
- Reproducción de experimentos de arquitectura: el repositorio incluye el código personalizado necesario (`trust_remote_code=True`) y la implementación de HF está validada contra el código de entrenamiento con 0,003 nats de diferencia, lo que facilita replicar resultados.
- Evaluación de la compuerta `loop_gate`: al permitir fijar `g = 0` y recuperar exactamente el Qwen3 original, el modelo sirve para aislar el efecto de la recurrencia en experimentos de ablación sobre calidad y estabilidad del entrenamiento.
- Prototipado en una sola GPU consumer: con 1,7B parámetros y pesos en bfloat16 (unos 3,4 GB), cabe en GPUs de 8-16 GB para experimentación local, aunque sin soporte de vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor únicamente publica la pérdida en el conjunto de test reservado de la mezcla de entrenamiento, en función del número de pasadas:

| Pasadas | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| Pérdida (test) | 2,0628 | 1,3059 | 1,1198 | 1,1475 | 1,2038 | 1,2737 | 1,3528 | 1,4390 |

El control sin bucle obtiene 1,1460 en el mismo conjunto. El mínimo se alcanza con 3 pasadas (el número entrenado) y el rendimiento se degrada a partir de 4.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,4 GB solo para pesos, más caché KV. El autor indica que cada pasada mantiene su propia caché KV, de modo que con 3 pasadas la caché es unas 1,9 veces la de un Qwen3-1.7B estándar.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 en contexto corto; A100 o H100 para contextos largos (16K tokens) o para experimentar con más pasadas.
- Cabe en GPU consumer: sí, en tarjetas de 8-16 GB (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090) para inferencia en bfloat16 con contexto moderado.
- Opciones de despliegue: transformers con `trust_remote_code=True` (probado con transformers 5.14). vLLM y otros motores de serving no soportan esta arquitectura todavía; no se documentan opciones GGUF/llama.cpp/Ollama.
- Latencia y throughput: no disponibles. Cualitativamente, el coste por token crece con el número de pasadas, ya que cada pasada ejecuta el bloque de 12 capas con su propia caché KV.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pérdida de test | Licencia | Serving |
|---|---|---|---|---|---|
| DRV-Qwen3-1.7B-ablation-loop3-chained-final-loss-only | 1,72B | no disponible (entrenado a 16K) | 1,1198 con 3 pasadas; 2,0628 con 1 | Apache 2.0 | solo transformers con código remoto |
| DRV-Qwen3-1.7B-midtrain-noloop (control sin bucle) | no disponible | no disponible | 1,1460 | Apache 2.0 | transformers |
| Qwen/Qwen3-1.7B-Base (modelo de partida) | 1,7B | no disponible | no disponible | Apache 2.0 | transformers, vLLM y otros motores estándar |

No se dispone de datos de benchmarks estándar para comparar el rendimiento en tareas (MMLU, HumanEval, GSM8K) con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no está diseñado para seguir instrucciones ni para conversación directa sin fine-tuning posterior.
- La ablación "final-loss-only" no entrena pérdida en las pasadas intermedias, por lo que la calidad con parada temprana (1 o 2 pasadas) puede ser inferior a la de la variante estándar de la colección; el autor no publica comparación directa entre ambas.
- La pérdida se degrada con más de 3 pasadas (1,1475 con 4, 1,4390 con 8), por lo que aumentar `num_loops` en producción no mejora la calidad de forma monótona.
- La caché KV crece con el número de pasadas (unas 1,9 veces la de Qwen3-1.7B con 3 pasadas), lo que limita el contexto efectivo y el throughput en hardware modesto.
- No hay soporte en vLLM ni en otros motores de serving, lo que dificulta el despliegue en producción a escala.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto y depende de la mezcla de entrenamiento no publicada en detalle.
- Riesgo de alucinación y sesgos: no evaluados ni documentados por el autor; al derivar de Qwen3-1.7B-Base, hereda los sesgos del corpus original más los de la mezcla de *continued pretraining* (web, PDF, código, trayectorias de agente).
- Licencia Apache 2.0: permite uso comercial, pero el modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el código antes de usarlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-ablation-loop3-chained-final-loss-only
- Colección Depth Recurrent Vector: https://huggingface.co/collections/CharlesDDDD/depth-recurrent-vector-6afb5dd4d36338a8677f35fa
- Modelo de referencia sin bucle: https://huggingface.co/CharlesDDDD/DRV-Qwen3-1.7B-midtrain-noloop
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
