# AnirbanSaha/gemma2-9b-tlink-full-autoregressive

## Resumen

El modelo `AnirbanSaha/gemma2-9b-tlink-full-autoregressive` es un ajuste fino de parámetros completos (full fine-tuning, no LoRA) sobre `google/gemma-2-9b-it`, publicado por el usuario AnirbanSaha en HuggingFace. Su propósito es muy específico: la clasificación de relaciones temporales TLINK (temporal link) entre eventos, una tarea clásica de extracción de información dentro del dominio del procesamiento de lenguaje natural clínico y de anotación temporal de textos. El modelo genera de forma autorregresiva una de cuatro etiquetas posibles: BEFORE, AFTER, OTHER y NONE.

El modelo conserva la arquitectura original de Gemma 2 9B (transformer decoder-only denso, con aproximadamente 9.240 millones de parámetros), de modo que hereda la ventana de contexto, el tokenizador y las capacidades conversacionales del modelo base instruction-tuned. El cambio respecto al base se limita al ajuste sobre el dataset `fahmidiqbal/tlink-classification`, con una supervisión de tipo autoregresivo: la etiqueta se emite como texto generado en lugar de como logits de una cabeza de clasificación.

La relevancia de esta ficha es doble. Por un lado, ilustra el patrón de reutilizar un LLM instruction-tuned de tamaño medio como clasificador generativo para tareas estructuradas de extracción de relaciones. Por otro, conviene ser prudente: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, no hay validación por terceros y las métricas publicadas proceden de un único conjunto de test de 192 ejemplos generado por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Gemma 2; atención alternando ventana deslizante local y atención global, RMSNorm y soft-capping de logits). Ajuste fino completo sobre `google/gemma-2-9b-it` |
| Parametros totales | 9.241.705.984 (9,24 mil millones), segun los pesos en safetensors |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base `google/gemma-2-9b-it` trabaja con 8192 tokens |
| Tipos de cuantizacion | No disponibles. El repositorio solo publica pesos en safetensors (18,5 GB); no se incluyen versiones GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | No disponible. La model card no lo declara; el ajuste se ha realizado sobre un dataset de clasificación de relaciones temporales, presumiblemente en ingles |
| Licencia | gemma (Gemma Terms of Use de Google) |
| Formato de pesos | safetensors, cargables con la libreria transformers |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 2 9B, un transformer decoder-only denso de 9,24 mil millones de parámetros, con normalización RMSNorm, activación GeGLU y un esquema de atención que intercala capas con ventana deslizante local y capas con atención global. El modelo base `google/gemma-2-9b-it` ya ha pasado por un proceso de instrucción y alineación, por lo que el ajuste aquí descrito parte de un modelo conversacional, no de un modelo base crudo.

El entrenamiento consiste en un ajuste fino de todos los parámetros (full-parameter fine-tuning) sobre el dataset `fahmidiqbal/tlink-classification`, con un enfoque autorregresivo: el modelo aprende a emitir la etiqueta (BEFORE, AFTER, OTHER o NONE) como continuación de texto a partir del par de eventos y su contexto. La model card no documenta el número de tokens de entrenamiento, la composición exacta del dataset, la presencia de RLHF/DPO adicional, hiperparámetros de entrenamiento ni el régimen de precisión utilizado. Tampoco se documenta ninguna innovación técnica propia más allá del propio esquema de clasificación generativa.

## Capacidades

- Clasificación de relaciones temporales TLINK con cuatro etiquetas cerradas: BEFORE, AFTER, OTHER y NONE.
- Generación de texto autorregresiva y conversación multi-turno, heredadas del modelo base instruction-tuned.
- Salida en formato de texto estructurado (la etiqueta se genera como cadena), lo que facilita el parseo en pipelines.
- Tasa de salidas inválidas de 0/192 en el conjunto de test reportado, es decir, el modelo no produjo etiquetas fuera del conjunto permitido en esa evaluación.
- Capacidades de razonamiento, código o matemáticas: no documentadas específicamente para este ajuste; se presume que el ajuste sobre una tarea estrecha puede degradar el rendimiento general del base.
- Soporte de tool calling / function calling: no disponible (no documentado en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no declaradas).
- Capacidades especiales (modo thinking, visión, audio): no aplica; el modelo es exclusivamente de texto.

## Casos de uso

- Anotación automática de relaciones temporales en corpus clínicos: el modelo puede etiquetar pares de eventos como BEFORE, AFTER, OTHER o NONE, acelerando la construcción de timelines de historia clínica que tradicionalmente requieren anotadores expertos.
- Preanotación para revisión humana en proyectos de anotación: dado que la tarea es de cuatro clases cerradas, el modelo puede generar una primera pasada sobre grandes volúmenes de texto y dejar al anotador solo la corrección de discrepancias.
- Extracción de líneas de tiempo en textos noticiosos: ordenar cronológicamente eventos narrados en un artículo mediante la clasificación de los pares de eventos relevantes.
- Componente de un pipeline de question answering temporal: la etiqueta TLINK puede alimentar un módulo posterior que resuelva preguntas del tipo "¿qué ocurrió antes de X?".
- Análisis de narrativas históricas o legales: reconstrucción de secuencias de hechos en documentación jurídica o informes, donde el orden temporal es crítico para la interpretación.
- Investigación en extracción de eventos y relaciones: servir como línea base generativa frente a clasificadores discriminativos tipo encoder (BERT/RoBERTa) sobre el mismo dataset.
- Prototipado rápido de clasificadores cerrados con LLM: el patrón de fine-tuning completo para emitir una etiqueta de un conjunto cerrado es reutilizable en otras taxonomías de clasificación (por ejemplo, relaciones causales o de correferencia).

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son los del autor sobre su propio conjunto de test (192 ejemplos):

| Metrica | Valor |
|---|---:|
| Accuracy | 0,7917 |
| Macro-F1 | 0,7914 |
| Weighted-F1 | 0,7926 |
| Salidas invalidas | 0/192 |

No se han publicado comparaciones con el modelo base `google/gemma-2-9b-it` ni con clasificadores alternativos sobre el mismo conjunto de evaluación. Tampoco hay resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16/FP16 los pesos ocupan aproximadamente 18,5 GB, más el caché KV y las activaciones; en int8 en torno a 10 GB; en int4 en torno a 5-6 GB (estimaciones a partir del número de parámetros, no verificadas por el autor).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para FP16 con contexto largo; en consumer, una RTX 4090 de 24 GB puede alojar el modelo en FP16 solo con margen muy ajustado y contextos cortos, por lo que en la práctica conviene cuantizar.
- Cabe en GPU de consumo: sí, en tarjetas con 12-16 GB o más si se cuantiza a 8 o 4 bits; con 24 GB es viable en FP16 con contexto reducido.
- Opciones de despliegue: transformers (formato nativo del repositorio), text-generation-inference (el repo está marcado como endpoints_compatible) y vLLM para servicio con batching. Para llama.cpp u Ollama sería necesario convertir previamente los pesos a GGUF, ya que el repositorio no los incluye.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Resultados en TLINK |
|---|---|---|---|---|---|
| AnirbanSaha/gemma2-9b-tlink-full-autoregressive | 9,24 mil millones | No especificado (base: 8192) | gemma | safetensors | Accuracy 0,7917; Macro-F1 0,7914 |
| google/gemma-2-9b-it (modelo base) | 9,24 mil millones | 8192 tokens | gemma | safetensors | No disponible |
| Clasificadores encoder especificos (BERT/RoBERTa ajustados) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han identificado en la información disponible otros ajustes publicados que reporten métricas sobre `fahmidiqbal/tlink-classification`, por lo que no es posible establecer una comparación cuantitativa fiable frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- El ajuste es de parámetros completos sobre una tarea muy estrecha, por lo que es probable que las capacidades generales de conversación y razonamiento del modelo base se hayan degradado. No se han publicado evaluaciones que lo confirmen o lo descarten.
- Riesgo de alucinación: el modelo genera la etiqueta como texto libre, de modo que fuera de la distribución del dataset puede producir cadenas que no correspondan exactamente a las cuatro clases permitidas, a pesar del 0/192 reportado en test.
- Sesgos conocidos: no documentados en la model card. Al derivar de Gemma 2, hereda los sesgos del modelo base de Google, que tampoco se detallan aquí.
- Limitaciones de contexto e idioma: la model card no declara idiomas soportados ni la longitud de contexto efectiva tras el ajuste; la evaluación se ha hecho sobre un conjunto reducido de 192 ejemplos, lo que da intervalos de confianza amplios en torno a las métricas reportadas.
- Restricciones de licencia: el modelo se distribuye bajo la licencia Gemma de Google, que impone condiciones de uso (incluida una política de usos prohibidos) y obligaciones de atribución; conviene revisar los términos antes de un uso comercial.
- Caveat de producción: el repositorio tiene 0 descargas y 0 likes y no ha sido validado por terceros. Las métricas proceden del propio autor sobre su propio conjunto de test, sin una partición de validación independiente documentada.
- No se publican pesos cuantizados ni artefactos de despliegue listos para producción (GGUF, AWQ, GPTQ), lo que añade trabajo de conversión y validación si se quiere servir con llama.cpp u Ollama.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnirbanSaha/gemma2-9b-tlink-full-autoregressive
- Modelo base: https://huggingface.co/google/gemma-2-9b-it
- Dataset de ajuste: https://huggingface.co/datasets/fahmidiqbal/tlink-classification
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
- Politica de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
