# Baekpica/Sage-S2.1-Flash-VQ-GGUF

## Resumen

Sage-S2.1-Flash-VQ-GGUF es una conversión cuantizada del modelo multimodal internlm/Sage-S2.1-Flash, publicada por el usuario Baekpica. Se trata de una cuantización vectorial con método hVQ (Hessian-guided vector quantization) orientada a ejecutar el modelo en un único DGX Spark, empleando el runtime ds4-dfm-rs y su ruta GVQ1 para modelos GLM. El modelo base es un transformer con mezcla de expertos (MoE) de 45 bloques troncales, 288 expertos enrutados por bloque MoE, una torre de visión de 24 bloques, una cabeza de borrador MTP (multi-token prediction) de una capa y una ventana de contexto configurada de 1.048.576 tokens.

La relevancia de esta ficha radica en el enfoque de compresión: en lugar de aplicar una cuantización uniforme, el autor distribuye el presupuesto de bits de forma desigual entre capas, reservando índices de mayor precisión para los expertos de determinadas capas y aplicando Q4_K a 316 matrices seleccionadas. El objetivo declarado es reducir el error de salida manteniendo el mismo presupuesto de índices, usando activaciones enrutadas del propio checkpoint para calibrar los errores correlacionados de entrada.

Es importante señalar que, en el momento de los datos disponibles, la conversión está en curso: la model card indica explícitamente "Conversion in progress" y que los pesos aún no se han subido. Por tanto, no hay resultados de evaluación held-out ni validación de hardware publicados, y los datos de rendimiento y memoria son referencias de planificación, no mediciones efectivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con torre de visión y cabeza MTP; 45 bloques troncales, 288 expertos enrutados por bloque MoE, torre de visión de 24 bloques |
| Parametros totales | no disponible (la model card referencia el release GLM de 94,49 GB / 88,00 GiB) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (configurado) |
| Tipos de cuantizacion | GVQ1 (hVQ): índice base de 13 bits + índice residual de 8 bits por cada ocho pesos (2,625 bits/peso) en expertos enrutados de capas 3–17, 22, 27, 41 y 44; índice de 13 bits por cada ocho pesos (1,625 bits/peso) en las otras 23 capas enrutadas; Q4_K en 316 matrices seleccionadas del tronco y salida; tensores dedicados para embeddings de entrada, torre de visión, enrutamiento y estado |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de 45 bloques troncales, con 288 expertos enrutados por bloque MoE, una torre de visión de 24 bloques para entrada image-text-to-text y una cabeza de borrador MTP de una capa orientada a decodificación especulativa. La ventana de contexto configurada es de 1.048.576 tokens. El modelo incluye además nueve proyectores científicos ("scientific projectors") cuyo flujo de trabajo upstream proporciona embeddings de prompt precalculados; este camino de entrada se gestiona por separado de la torre de visión GLM.

Sobre el entrenamiento del modelo base no se dispone de información en los datos proporcionados (número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas). La innovación técnica documentada corresponde a la cuantización: hVQ utiliza activaciones enrutadas del propio checkpoint para estimar errores correlacionados de entrada y asigna vectores en orden de canal de entrada, de modo que el error de una elección previa influye en las siguientes. El objetivo es obtener menor error de salida con el mismo presupuesto de índices. La comparación se plantea contra una línea base weight-only del mismo modelo y con los mismos tokens held-out; el autor advierte que las puntuaciones públicas de GLM y DeepSeek pertenecen a checkpoints distintos y no son directamente comparables.

## Capacidades

- Generación de texto y razonamiento en un modelo de gran contexto (1.048.576 tokens configurados).
- Procesamiento image-text-to-text mediante torre de visión de 24 bloques (pipeline declarado en Hugging Face).
- Entrada multimodal científica mediante nueve proyectores que aceptan embeddings de prompt precalculados.
- Decodificación especulativa mediante cabeza MTP de una capa (borrador).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Procesamiento de documentos científicos multimodales: el modelo incorpora nueve proyectores científicos y una torre de visión, lo que permite alimentar figuras, tablas y texto junto con embeddings precalculados de prompts del dominio; adecuado para pipelines de extracción y resumen de literatura técnica en un único nodo DGX Spark.
- Análisis de contexto largo en un solo dispositivo: con 1.048.576 tokens configurados y un presupuesto de memoria planificado de unos 116,2 GiB, el modelo puede abordar corpus extensos (informes completos, bases de código, expedientes) sin fragmentación, siempre que la admisión en contexto nativo se valide en runtime.
- Inferencia local en hardware de estación de trabajo: la cuantización GVQ1 está diseñada para caber en un DGX Spark, lo que habilita despliegues on-premise de un MoE multimodal sin clúster multi-GPU.
- Investigación en cuantización: el checkpoint sirve como referencia reproducible para comparar hVQ frente a líneas base weight-only con los mismos tokens held-out y el mismo profesor, útil para estudiar el impacto del presupuesto de bits por capa.
- Evaluación de decodificación especulativa: la cabeza MTP de una capa permite experimentar con borradores y medir aceleración en el runtime ds4-dfm-rs, comparando con decodificación autoregresiva estándar.
- Prototipado de asistentes con entrada de imagen y texto: la pipeline image-text-to-text permite construir demos de pregunta-respuesta sobre imágenes con contexto conversacional largo, sujeto a la validación de entrada de medios en el runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los resultados held-out y la validación de hardware se añadirán junto con las partes convertidas, y que las cifras de memoria son referencias de planificación.

## Requisitos de hardware

- VRAM/RAM estimada: el autor referencia un presupuesto de contexto completo de aproximadamente 116,2 GiB para pesos, caché, dos borradores, scratch y reserva, sobre un release de 94,49 GB (88,00 GiB). Son cifras de planificación, no medidas para esta conversión.
- Hardware objetivo: un único DGX Spark, con el runtime ds4-dfm-rs y la ruta GVQ1 basada en directorios.
- GPU recomendadas: DGX Spark (objetivo declarado); no se documentan otras GPU en la información disponible.
- ¿Cabe en GPU de consumo? No disponible; el presupuesto de memoria indicado excede la VRAM típica de GPU de consumo.
- Opciones de despliegue: ds4-dfm-rs (loader GVQ1). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles. La admisión en contexto nativo, la entrada de medios y la decodificación con borrador requieren comprobaciones de runtime separadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sage-S2.1-Flash-VQ-GGUF (esta ficha) | no disponible (MoE, 45 bloques, 288 expertos/bloque) | 1.048.576 | sin benchmarks publicados | MIT | conversión en curso |
| internlm/Sage-S2.1-Flash (base) | no disponible | 1.048.576 | no disponible en esta información | MIT | publicado en Hugging Face |
| Baekpica/GLM-5.3-Flash-VQ-GGUF | no disponible (release de 94,49 GB / 88,00 GiB) | no disponible | no disponible | no disponible en esta información | publicado en Hugging Face |
| Baekpica/DeepSeek-V4.1-Flash-1017-hVQ-GGUF | no disponible | no disponible | no disponible | no disponible en esta información | publicado en Hugging Face |

No se dispone de datos de rendimiento comparables entre estos checkpoints; el autor advierte que las puntuaciones públicas de GLM y DeepSeek pertenecen a checkpoints distintos.

## Limitaciones y advertencias

- Conversión incompleta: la model card indica "Conversion in progress" y que los pesos se subirán más adelante; el repositorio puede no contener aún los tensores utilizables.
- Sin evaluación publicada: no hay resultados held-out ni validación de hardware; las cifras de memoria son estimaciones de planificación.
- Compatibilidad de runtime limitada: el formato GVQ1 requiere el loader específico de ds4-dfm-rs; no se documenta soporte en ecosistemas estándar como llama.cpp o vLLM.
- Riesgo de degradación por cuantización: el esquema asigna tan solo 1,625–2,625 bits/peso de índices en los expertos enrutados, con Q4_K en 316 matrices; el impacto real en calidad no está medido.
- Idiomas soportados no documentados: no es posible garantizar cobertura multilingüe ni evaluar sesgos lingüísticos.
- Sesgos y alucinación: no hay información sobre sesgos conocidos ni tasas de alucinación del modelo base en los datos proporcionados.
- Entrada de medios y contexto nativo pendientes de validación: la model card señala que la admisión en contexto nativo, la entrada de medios y la decodificación con borrador requieren comprobaciones de runtime separadas.
- Licencia: MIT para los pesos fuente según el autor, con atribuciones adicionales del código de cuantización vectorial derivado de YoungAi (aviso en LICENSE-YoungAi); conviene revisar dichas atribuciones antes de uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Baekpica/Sage-S2.1-Flash-VQ-GGUF
- Modelo base: https://huggingface.co/internlm/Sage-S2.1-Flash
- Revisión upstream referenciada: https://huggingface.co/internlm/Sage-S2.1-Flash/tree/76f4513db7464485605a002a06a6190de0460574
- Flujo de proyectores científicos: https://huggingface.co/internlm/Sage-S2.1-Flash#inference-with-scientific-projectors
- Licencia upstream: https://huggingface.co/internlm/Sage-S2.1-Flash#license
- Runtime ds4-dfm-rs: https://github.com/Baekpica/ds4-dfm-rs
- Método hVQ (referencia): https://huggingface.co/Baekpica/DeepSeek-V4.1-Flash-1017-hVQ-GGUF
- Asignación y estimación de memoria GLM: https://huggingface.co/Baekpica/GLM-5.3-Flash-VQ-GGUF#memory-on-dgx-spark
- Aviso YoungAi: LICENSE-YoungAi (en el repositorio del modelo)
