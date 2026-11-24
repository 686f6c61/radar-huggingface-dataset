# krummholz-ai/atlantic-27b-v8.2-GGUF

## Resumen

Atlantic 27B v8.2 es un modelo de lenguaje multimodal de propósito general desarrollado por Krummholz AI, publicado como versión beta de su línea insignia. Se trata de un ajuste fino (finetune) del modelo Qwen3.8-27B, con 26.895.998.464 parámetros en su tronco de texto, entrenado específicamente para leer registros de campo estructurados, extraer el valor asociado a una etiqueta solicitada y abstenerse de responder cuando el registro no establece una respuesta. La distribución se realiza en formato GGUF cuantizado para su uso en estaciones de trabajo y servidores.

La innovación metodológica del modelo reside en su proceso de post-entrenamiento: Krummholz reconstruyó un padre nativo de Atlantic v8 a partir de un adaptador acumulativo y una instantánea fijada de Qwen3.8-27B, y ejecutó 32 generaciones de estrategias de evolución (evolution strategies) sobre los 26.895.998.464 parámetros de texto en coma flotante, excluyendo los tensores visuales. El conjunto de entrenamiento se compone de 256 registros procedentes de Wikidata, inventarios del Servicio Forestal de EE. UU. para Maine y desembarques comerciales de NOAA Fisheries, con 8.192 respuestas de entrenamiento (8.172 finalizaciones públicas utilizables).

La relevancia del modelo radica en su enfoque hacia la fiabilidad factual y la abstención justificada en tareas de extracción de datos, un problema habitual en despliegues de producción. No obstante, la propia model card reconoce que la mejora respecto a la versión estable v8 es de una única respuesta en una comparación ciega de 64 preguntas, estadísticamente no concluyente, y que persisten nueve afirmaciones no respaldadas por la evidencia en ambos casos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tronco de texto Qwen3.8-27B con proyector visual), ajuste fino mediante evolution strategies |
| Parámetros totales | 26.895.998.464 (tronco de texto) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | Q4_K_M (~16,7 GB), Q5_K_M (~19,3 GB), proyector visual F16 (~0,93 GB) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (pesos fusionados); proyector visual GGUF F16 |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3.8-27B, un transformer de 26.895.998.464 parámetros con capacidad multimodal gracias a un proyector visual separado que se carga junto al GGUF de texto en un host multimodal compatible. Los pesos distribuidos son pesos fusionados resultantes del post-entrenamiento, no adaptadores. El entrenamiento consistió en 32 generaciones de estrategias de evolución: en cada generación se puntuaron 16 perturbaciones sobre ocho registros emparejados y se actualizó el maestro con sus recompensas estandarizadas. Las 32 generaciones produjeron actualización, y el experimento perturbó la totalidad de los parámetros de texto en coma flotante, excluyendo los tensores visuales.

El corpus de entrenamiento consta de 256 registros construidos a partir de Wikidata, inventarios del USDA Forest Service para Maine y desembarques comerciales de NOAA Fisheries, con variantes de campo faltante y etiquetas casi coincidentes generadas por Krummholz. Se generaron 8.192 respuestas de entrenamiento, de las cuales 8.172 fueron finalizaciones públicas utilizables. Un conjunto de validación separado de 24 pares monitorizó el entrenamiento, y un desafío de 32 registros y 64 preguntas se mantuvo aparte del desarrollo de recompensas. Adicionalmente se probaron 24 preguntas utilitarias pequeñas y ocho prompts de estudios de temporización anteriores. El modelo emplea pensamiento nativo (native thinking) durante la inferencia; las interfaces desplegadas deben mantener el razonamiento privado fuera de la conversación pública.

## Capacidades

- Generación de texto conversacional en inglés con modo de pensamiento nativo.
- Extracción de valores de registros de campo estructurados según una etiqueta y unidad solicitadas.
- Abstención justificada cuando el registro no establece una respuesta (capacidad entrenada explícitamente).
- Procesamiento de imágenes mediante el proyector visual F16 en hosts multimodales compatibles.
- Razonamiento multimodal de propósito general (según la etiqueta `multimodal` del repositorio).
- Integración con llama.cpp mediante soporte para la arquitectura `qwen35`.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso agéntico en la información disponible.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Extracción de datos de registros de campo: el modelo lee un registro estructurado, localiza el valor bajo la etiqueta y unidad solicitadas y devuelve la respuesta o una abstención justificada; es el escenario para el que fue entrenado y evaluado explícitamente.
- Verificación documental con abstención: en pipelines de auditoría donde es preferible no responder a inventar, el modelo reporta cuándo el registro no establece un valor, reduciendo afirmaciones no respaldadas.
- Procesamiento de inventarios forestales: dado su entrenamiento con registros del USDA Forest Service para Maine, puede emplearse en la normalización y consulta de inventarios de recursos naturales.
- Análisis de desembarques pesqueros: los datos de NOAA Fisheries en el corpus lo hacen adecuado para consultas sobre registros de capturas comerciales.
- Enriquecimiento de datos de Wikidata: consulta y extracción de valores de entidades estructuradas con control de campos faltantes.
- Asistencia multimodal en estación de trabajo: con el proyector F16 cargado en un host compatible, puede procesar imágenes junto a texto para tareas de descripción o extracción.
- Despliegue local en servidor con llama.cpp: los GGUF Q4_K_M (~16,7 GB) y Q5_K_M (~19,3 GB) permiten servir el modelo en estaciones de trabajo y servidores con memoria suficiente, usando el harness de seguridad incluido para filtrar peticiones y respuestas públicas.

## Benchmarks y rendimiento

| Revisión ciega de registros de campo | Atlantic v8 | Atlantic v8.2 |
|---|---:|---:|
| BF16 nativo, respuestas correctas | 51/64 | 53/64 |
| Q4_K_M, valores suministrados correctos | 30/32 | 30/32 |
| Q4_K_M, abstenciones justificadas | 23/32 | 24/32 |
| Q4_K_M, respuestas públicas correctas | 53/64 | 54/64 |
| Q4_K_M, afirmaciones no respaldadas | 9/64 | 9/64 |
| Q4_K_M, respuestas correctas tras el guard de release | 50/64 | 51/64 |
| Q4_K_M, peticiones benignas rechazadas por el guard | 4/64 | 4/64 |

Las pruebas Q4 emplearon entradas renderizadas idénticas, límites de 512 tokens, pensamiento nativo, decodificación greedy y el mismo runtime de release; se ejecutaron en una única GPU H200. El revisor ciego basado en modelo evaluó las respuestas públicas únicas contra sus registros: dos casos mejoraron, uno empeoró y 61 se mantuvieron sin cambios. La diferencia global es de una respuesta y el propio autor la califica de estadísticamente no concluyente. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~16,7 GB para el GGUF Q4_K_M y ~19,3 GB para Q5_K_M, solo para los pesos; hay que sumar contexto, caché KV, tamaño de lote, runtime y procesamiento de imagen.
- GPU recomendadas: los tests emparejados Q4 se ejecutaron en una NVIDIA H200. Para Q4_K_M y Q5_K_M se requieren GPU con al menos 24 GB de VRAM (RTX 4090, A100 40 GB, H100) dejando margen para contexto y caché.
- GPU de consumo: Q4_K_M (~16,7 GB) puede caber en GPU consumer de 24 GB como la RTX 4090; Q5_K_M (~19,3 GB) también, con menos margen para contexto. No hay benchmark para móviles en v8.2.
- Despliegue: llama.cpp con soporte para `qwen35` (probado con el commit `e574a17b062be51b98e239ccd3d3743e3d902333`, release b12407). El harness de seguridad incluye servidor de embeddings en loopback, binario opcional de puerta para Windows x64 y gateway de texto local. No se documenta soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Atlantic 27B v8.2 | 26.895.998.464 | No disponible | Apache 2.0 | GGUF | Beta; especializado en extracción de registros y abstención |
| Atlantic 27B v8 (estable) | 26.895.998.464 | No disponible | Apache 2.0 | GGUF | 53/64 respuestas correctas Q4_K_M frente a 54/64 de v8.2 |
| Qwen3.8-27B (base) | ~27B | No disponible | No disponible en la información | Safetensors (modelo base) | Modelo base del que deriva Atlantic; sin las capas de ajuste ni el harness |

No se dispone de datos de benchmarks estándar ni de especificaciones de contexto para establecer una comparación de rendimiento más amplia con alternativas de la misma categoría.

## Limitaciones y advertencias

- La mejora frente a Atlantic v8 es de una sola respuesta en 64 preguntas y el autor la declara estadísticamente no concluyente; no debe interpretarse como una ganancia fiable.
- Persisten 9/64 afirmaciones no respaldadas por la evidencia tanto en v8 como en v8.2; las afirmaciones factuales que excedan la evidencia suministrada requieren verificación de fuentes.
- El guard de release rechazó 4/64 peticiones benignas, lo que introduce falsos positivos en producción.
- Solo soporta inglés; no se documentan capacidades multilingües.
- Es una versión beta, no la versión estable; la model card remite a Atlantic v8 como estable.
- El modelo está entrenado sobre dominios muy específicos (inventarios forestales, pesca, Wikidata); su generalización fuera de esos registros no está evaluada.
- El razonamiento nativo debe mantenerse fuera de la conversación pública en interfaces desplegadas; el harness de seguridad es una capa externa que un host de texto que cargue solo el GGUF no aplica.
- No se documentan sesgos conocidos ni longitud de contexto en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el estado beta y la ausencia de benchmarks estándar desaconsejan su uso en producción sin evaluación propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/krummholz-ai/atlantic-27b-v8.2-GGUF
- Notas de campo: https://krummholz.ai/field-notes/atlantic-v8-2/
- Informe completo de entrenamiento y release: https://huggingface.co/krummholz-ai/atlantic-27b-v8.2-GGUF/blob/main/RELEASE.md
- Atlantic v8 estable: https://huggingface.co/krummholz-ai/atlantic-27b-v8-GGUF
- Instrucciones de runtime y configuración: https://huggingface.co/krummholz-ai/atlantic-27b-v8.2-GGUF/blob/main/HARNESS.md
- Release de llama.cpp probada: https://github.com/ggml-org/llama.cpp/releases/tag/b12407
- Avisos de datos y terceros: https://huggingface.co/krummholz-ai/atlantic-27b-v8.2-GGUF/blob/main/NOTICE.md
- Página del modelo: https://krummholz.ai/llms/model-cards/atlantic-v8-2/
