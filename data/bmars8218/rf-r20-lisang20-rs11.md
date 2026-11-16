# bmars8218/rf-r20-lisang20-rs11

## Resumen

rf-r20-lisang20-rs11 es un modelo de lenguaje de 0,9 mil millones de parámetros con arquitectura Llama, publicado por el usuario bmars8218 bajo el marco de trabajo que el autor denomina SN38 ChronoLLM. Se trata de la ronda 20 de una serie de experimentos centrados en el entrenamiento sobre texto datado y agrupado por años, es decir, corpus segmentados temporalmente (year-bucketed) en lugar de un único corpus masivo sin estructura temporal. El modelo corresponde al "año 2009" según la nomenclatura del autor.

Técnicamente es un modelo pequeño (917.338.240 parámetros según los pesos safetensors, 26 capas y un vocabulario de 36.000 tokens) que se distribuye como un "soup" (promediado de pesos con ponderación 1:1) de dos checkpoints del mismo equipo: Lisang19 con weight decay 0,16, entrenado con documentos hasta 2010 inclusive, y Lisang20 S4, entrenado con documentos hasta 2009 inclusive. La norma final se ha escalado por un factor de 1,4.

Su relevancia es fundamentalmente experimental: no es un modelo de propósito general competitivo, sino una pieza de investigación sobre cómo el corte temporal del corpus afecta al comportamiento del modelo. El autor declara explícitamente una fuga temporal: al incluir un componente con corte en 2010, el modelo ha visto datos escritos en 2010, lo que invalida una evaluación estricta de conocimiento "hasta 2009". La licencia es MIT y el repo ocupa 1,8 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (26 capas, vocabulario de 36k) |
| Parámetros totales | 917.338.240 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; cuantización a GGUF no confirmada) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamaño del repo | 1,8 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de tipo Llama con 26 capas y un vocabulario de 36.000 tokens. El modelo no introduce innovaciones a nivel de atención ni de decodificación: es un transformer estándar entrenado desde cero (o ajustado, no se especifica) por el equipo formado por Ruffian (UID 169) y Seed (CoolCat777). El detalle técnico más relevante es el proceso de construcción de los pesos finales: un model soup con ponderación 1:1 de dos checkpoints, Lisang19 (weight decay 0,16, corte temporal en 2010) y Lisang20 S4 (corte temporal en 2009), seguido de un escalado de la norma final por 1,4.

El entrenamiento se realizó sobre texto datado y agrupado por años ("dated, year-bucketed text"), que es la premisa del marco ChronoLLM: organizar el corpus por fecha de producción de los documentos y entrenar checkpoints con cortes temporales controlados. No se especifica el número total de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documenta la longitud de contexto usada durante el entrenamiento. El autor sí declara explícitamente la contaminación temporal: como un componente del soup tiene corte en 2010, el modelo ha visto datos escritos en 2010, de modo que no puede usarse como un modelo "puro" de 2009.

## Capacidades

- Generación de texto autoregresiva en el estilo de un modelo Llama de 0,9B; la model card no documenta capacidades específicas más allá de la generación.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declara un modo "thinking" ni capacidades de visión o audio.
- Capacidades multilingües: no disponibles; la model card no especifica idiomas de entrenamiento.
- Interés principal: modelado de estilo y conocimiento asociado a una ventana temporal concreta (documentos hasta 2009/2010), útil para experimentos de cronología y sesgo temporal.
- No se documenta ningún ajuste por instrucciones, por lo que no debe asumirse comportamiento de chat alineado.

## Casos de uso

- Investigación sobre sesgo temporal: usar el modelo para medir cómo un corte de corpus en 2009/2010 afecta a las respuestas sobre eventos, entidades y vocabulario de la época, comparándolo con las otras rondas de la serie ChronoLLM.
- Generación de texto con estilo retro: redactar documentos sintéticos con registro y referencias propias de finales de la década de 2000, aprovechando el entrenamiento year-bucketed.
- Detección de contaminación de datos en pipelines de evaluación: el propio modelo sirve como caso de estudio de fuga temporal (corte declarado en 2009 pero con datos de 2010), útil para diseñar validaciones de corte en datasets de evaluación cronológica.
- Baseline de bajo coste en experimentos de model soup: al ser un 0,9B con pesos safetensors de 1,8 GB, permite reproducir el promediado de checkpoints y el escalado de norma final en una sola GPU consumer.
- Generación aumentada con control de fecha: en un sistema de preguntas y respuestas sobre corpus históricos, puede usarse para producir respuestas "con la voz" de 2009 y contrastarlas con recuperación documental real.
- Prototipado y docencia: experimentos de fine-tuning y de cuantización sobre una arquitectura Llama pequeña con licencia MIT, sin restricciones de uso comercial.
- Análisis lingüístico diacrónico: estudiar diferencias de vocabulario y sintaxis frente a checkpoints de años posteriores de la misma serie.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,8 GB solo para los pesos, más memoria para el contexto y el runtime (estimación típica de 2 a 3 GB en total).
- VRAM estimada en cuantización de 8 bits: en torno a 1 GB para los pesos; en 4 bits, en torno a 0,5 GB. Son estimaciones a partir del recuento de parámetros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM debería alojar el modelo en fp16; una RTX 3060, RTX 4060 o superior es suficiente. Para despliegues en servidor, A100 o H100 no son necesarias y resultarían sobredimensionadas.
- Cabe en GPU consumer: sí, con holgura, incluidas GPUs de gama media y algunas integradas con memoria unificada suficiente.
- Opciones de despliegue: la arquitectura Llama es compatible con llama.cpp, Ollama, vLLM y TGI, pero no se confirma que existan pesos GGUF publicados; habría que convertirlos a partir de los safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rf-r20-lisang20-rs11 | 917M | No disponible | MIT | Hugging Face (0 descargas) | Model soup de dos checkpoints con cortes 2009/2010 |
| Llama 3.2 1B | 1,24B | 128k (según documentación de Meta) | Llama 3.2 Community License | Amplia | Modelo alineado para instrucciones, con tool calling |
| Qwen2.5 0.5B | 0,49B | 32k (según documentación de Alibaba) | Apache 2.0 | Amplia | Multilingüe y ajustado por instrucciones |
| SmolLM2 1.7B | 1,7B | 8k (según documentación de Hugging Face) | Apache 2.0 | Amplia | Entrenado sobre corpus web curado |

La comparación con modelos de la misma escala es desfavorable en usos generales: los alternativas citadas están alineadas por instrucciones, documentan contexto e idiomas y cuentan con ecosistema de cuantizaciones. El valor diferencial de rf-r20-lisang20-rs11 es exclusivamente experimental (control temporal del corpus), no de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre texto datado hasta 2009/2010, hereda los sesgos sociales, culturales y lingüísticos de los documentos de esa época; no se documenta ninguna mitigación.
- Riesgo de alucinación: alto en usos de conocimiento factual, dado que es un modelo de 0,9B sin ajuste por instrucciones documentado ni fases de RLHF/DPO declaradas.
- Limitación de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados, por lo que no deben asumirse capacidades multilingües ni ventanas largas.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación con atribución; no obstante, el autor no ofrece garantías sobre el contenido de los datos de entrenamiento.
- Caveat de producción: el modelo declara una fuga temporal (incluye datos de 2010 pese a su etiqueta de 2009), lo que invalida evaluaciones estrictas de conocimiento hasta 2009.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado; no hay evidencia de validación externa.
- Ausencia de benchmarks: no hay métricas publicadas que permitan estimar su calidad frente a alternativas.
- Fecha de creación anómala en el repositorio (2026-11-16), que conviene verificar antes de citarlo.

## Enlaces

- Hugging Face: https://huggingface.co/bmars8218/rf-r20-lisang20-rs11
