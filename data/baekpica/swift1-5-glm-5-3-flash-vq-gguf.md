# Baekpica/Swift1.5-GLM-5.3-Flash-VQ-GGUF

## Resumen

Swift1.5-GLM-5.3-Flash-VQ-GGUF es una conversión cuantizada del checkpoint ukisai/Swift1.5-GLM-5.3-Flash, un modelo multimodal de tipo image-text-to-text construido sobre la arquitectura GLM-5.3-Flash. El autor de la conversión es Baekpica, que aplica su propio esquema de cuantización vectorial basada en hessianas (hVQ) con el formato GVQ1 sobre el checkpoint BF16 original. El objetivo declarado es reducir el coste de memoria del modelo para poder ejecutarlo en un único nodo NVIDIA DGX Spark, manteniendo el contexto nativo configurado de 1.048.576 tokens.

El modelo base combina un tronco de lenguaje de tipo mixture-of-experts con 45 bloques, 288 expertos enrutados por bloque MoE, una torre de visión de 24 bloques y una cabeza de borrador MTP (multi-token prediction) de una capa para decodificación especulativa. La conversión distribuye la precisión de forma selectiva: los expertos de determinadas capas reciben un índice base de 13 bits más un índice residual de 8 bits por cada ocho pesos, mientras que otras matrices del tronco y de salida se cuantizan en Q4_K.

Es relevante ahora porque documenta una estrategia de cuantización orientada a despliegue en hardware de borde con memoria unificada, un escenario poco cubierto por los formatos GGUF convencionales. No obstante, la model card indica explícitamente que la conversión está en curso: los pesos aún no se han subido, no hay resultados de evaluación publicados y las comprobaciones de hardware están pendientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con torre de visión y cabeza MTP de una capa (GLM-5.3-Flash) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (288 expertos enrutados por bloque MoE) |
| Longitud de contexto | 1.048.576 tokens (contexto configurado) |
| Tipos de cuantizacion | GVQ1 hVQ: índices de 13 bits + residual de 8 bits por cada 8 pesos, Q4_K en 316 matrices del tronco y salida, E4M3 con escalas F32 en el borrador |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (modelo base GLM bajo MIT) |
| Formato de pesos | GGUF (GVQ1) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture-of-experts con 45 bloques de tronco y 288 expertos enrutados por bloque MoE. Incorpora una torre de visión de 24 bloques para el procesamiento de imágenes y una cabeza de borrador MTP de una capa (bloque 45, incluidos sus expertos) destinada a decodificación especulativa. El contexto configurado alcanza 1.048.576 tokens, lo que sitúa al modelo en la categoría de ventanas muy largas.

La conversión parte directamente del checkpoint BF16 de UkisAI, que contiene los pesos de lenguaje afinados, la torre de visión y la cabeza de borrador del modelo base. El esquema hVQ utiliza activaciones enrutadas de este mismo checkpoint para estimar errores correlacionados de entrada y asigna vectores en orden de canal de entrada, de modo que las decisiones previas influyen en las posteriores con el objetivo de reducir el error de salida con el mismo presupuesto de índices. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento sobre ventanas de contexto muy largas (hasta 1.048.576 tokens configurados).
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text) mediante la torre de visión de 24 bloques.
- Decodificación especulativa mediante la cabeza MTP de una capa incluida en la conversión.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos con imágenes: el contexto de 1.048.576 tokens permite procesar manuales, informes o expedientes completos junto con sus figuras en una sola pasada, sin fragmentación ni recuperación externa.
- Extracción de información de facturas y formularios escaneados: la combinación de torre de visión y tronco de lenguaje permite transcribir y estructurar campos a partir de imágenes, con la ventaja de poder incluir instrucciones largas de formato en el mismo contexto.
- Asistentes de documentación técnica: el modelo puede responder preguntas sobre bases de código o documentación extensas manteniendo el contexto completo, lo que reduce la pérdida de referencias cruzadas entre secciones.
- Procesamiento por lotes en un único nodo DGX Spark: el presupuesto de memoria planificado (unos 116,2 GiB para pesos, caché, dos borradores, scratch y reserva) está pensado para despliegues en hardware de memoria unificada sin clúster multi-GPU.
- Decodificación especulativa en producción: la cabeza MTP incluida a plena precisión permite acelerar la generación en el runtime ds4-dfm-rs, útil en servicios de chat con latencia sensible.
- Investigación en cuantización: el esquema hVQ con asignación en orden de canal de entrada sirve como banco de pruebas para estudiar el compromiso entre bits por peso y error de salida en modelos MoE multimodales.
- Evaluación comparativa de cuantizaciones: al conservar el mismo profesor y los mismos tokens reservados que la línea base weight-only, el artefacto facilita experimentos reproducibles de compresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los resultados sobre tokens reservados y la validación de hardware se añadirán junto con las partes convertidas, y advierte de que las puntuaciones públicas de GLM y DeepSeek pertenecen a checkpoints distintos y no son comparables directamente.

## Requisitos de hardware

- VRAM estimada: el presupuesto de planificación publicado para el release GLM de 94,49 GB (88,00 GiB) es de aproximadamente 116,2 GiB, incluyendo pesos, caché, dos borradores, scratch y reserva. La cifra para esta conversión concreta está pendiente de verificación.
- GPU recomendadas: el objetivo declarado es un único nodo NVIDIA DGX Spark con memoria unificada; no se especifican otras GPU.
- GPU de consumo: no disponible; el tamaño del modelo y el contexto nativo hacen improbable su ajuste en GPU de consumo convencionales, pero no hay datos confirmados.
- Opciones de despliegue: el cargador objetivo es la ruta GVQ1 basada en directorios del runtime ds4-dfm-rs. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La admisión a contexto nativo, la entrada de medios y la decodificación con borrador requieren comprobaciones de runtime independientes según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Swift1.5-GLM-5.3-Flash-VQ-GGUF (esta ficha) | no disponible (MoE, 288 expertos/bloque) | 1.048.576 | GGUF GVQ1 | swift-open-license-1.0 | Conversión en curso, sin pesos subidos |
| ukisai/Swift1.5-GLM-5.3-Flash (modelo base) | no disponible | 1.048.576 | BF16 (safetensors presumiblemente) | swift-open-license-1.0 | Publicado, checkpoint de referencia |
| Baekpica/GLM-5.3-Flash-VQ-GGUF | no disponible (release de 94,49 GB) | no disponible | GGUF GVQ1 | MIT (GLM) | Publicado según referencias de la model card |
| Baekpica/DeepSeek-V4.1-Flash-1017-hVQ-GGUF | no disponible | no disponible | GGUF hVQ | no disponible | Referencia metodológica de hVQ |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La conversión está en curso: los pesos no se han subido y no hay resultados de evaluación ni validación de hardware publicados.
- El esquema hVQ introduce error de cuantización acumulativo por el orden de asignación de vectores; su impacto real en calidad está pendiente de medir contra la línea base weight-only.
- La licencia swift-open-license-1.0 es distinta de la MIT del modelo base GLM; es necesario revisar los términos de uso comercial del componente Swift antes de desplegar en producción.
- El repositorio incluye avisos upstream y de cambio de conversión; la redistribución debe conservarlos.
- El contexto nativo de 1.048.576 tokens requiere comprobaciones de admisión específicas del runtime y puede no ser alcanzable en la práctica con el presupuesto de memoria planificado.
- No hay información sobre sesgos, riesgo de alucinación, cobertura idiomática ni comportamiento de seguridad del modelo base.
- La compatibilidad se limita al cargador GVQ1 de ds4-dfm-rs; no se documenta soporte en otros motores de inferencia.
- El modelo es multimodal y el procesamiento de imágenes exige validación separada en el runtime objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Baekpica/Swift1.5-GLM-5.3-Flash-VQ-GGUF
- Modelo base: https://huggingface.co/ukisai/Swift1.5-GLM-5.3-Flash
- Revisión fijada del checkpoint fuente: https://huggingface.co/ukisai/Swift1.5-GLM-5.3-Flash/tree/1a9bcb4d808f51e7eb043d6c471e8b616fd84bb5
- Presupuesto de memoria en DGX Spark: https://huggingface.co/Baekpica/GLM-5.3-Flash-VQ-GGUF#memory-on-dgx-spark
- Método hVQ: https://huggingface.co/Baekpica/DeepSeek-V4.1-Flash-1017-hVQ-GGUF
- Runtime ds4-dfm-rs: https://github.com/Baekpica/ds4-dfm-rs
- Licencia Swift: https://huggingface.co/Baekpica/Swift1.5-GLM-5.3-Flash-VQ-GGUF/blob/main/LICENSE
- Licencia GLM: https://huggingface.co/Baekpica/Swift1.5-GLM-5.3-Flash-VQ-GGUF/blob/main/LICENSE-GLM
- Avisos: https://huggingface.co/Baekpica/Swift1.5-GLM-5.3-Flash-VQ-GGUF/blob/main/NOTICE
