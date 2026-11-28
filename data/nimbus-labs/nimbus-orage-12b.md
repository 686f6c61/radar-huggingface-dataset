# Nimbus-Labs/Nimbus-Orage-12B

## Resumen

Nimbus Orage 12B es un ajuste fino (finetune) del checkpoint Google Gemma 4 12B IT QAT, desarrollado por Nimbus-Labs y orientado a generación de código en local. El modelo se distribuye en formato GGUF y está pensado para ejecutarse con llama.cpp, lo que lo hace apto para entornos de desarrollo donde se requiere inferencia sin conexión y sin dependencia de servicios en la nube. Su pipeline declarado es image-text-to-text, e incorpora soporte multimodal de imagen y audio mediante un proyector separado.

El modelo cuenta con 11.907.350.576 parámetros totales (aproximadamente 11,9 mil millones) y un tamaño de repositorio de 8,7 GB. Deriva del checkpoint base de Google cuantizado con QAT (quantization-aware training) a Q4_0, sobre el que Nimbus-Labs aplica un ajuste fino orientado a tareas de programación. La licencia declarada es Apache 2.0, lo que facilita su uso comercial, aunque conviene revisar los avisos de terceros incluidos en el repositorio.

La relevancia actual del modelo radica en su combinación de tamaño contenido, licencia permisiva y soporte multimodal en un único artefacto GGUF ejecutable en hardware de consumo. No obstante, la información pública disponible es limitada: no se detallan los datos de entrenamiento del ajuste fino, los idiomas soportados ni la mayoría de benchmarks más allá de HumanEval y HumanEval+.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Google Gemma 4 12B IT QAT); detalles no disponibles |
| Parametros totales | 11.907.350.576 (aprox. 11,9 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q5_K_M (archivo publicado); base cuantizada Q4_0 mediante QAT |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo Q5_K_M de 8.547.267.520 bytes; proyector multimodal BF16 de 175.115.648 bytes) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Google Gemma 4 12B IT QAT, un transformer de aproximadamente 11,9 mil millones de parámetros. El checkpoint de partida es la variante QAT (quantization-aware training) cuantizada a Q4_0, lo que implica que el modelo base fue entrenado teniendo en cuenta la cuantización para preservar calidad tras la compresión. Sobre esta base, Nimbus-Labs aplica un ajuste fino orientado a código, aunque la model card no especifica el volumen de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La distribución se realiza como GGUF Q5_K_M, con un proyector multimodal separado en BF16 que habilita las entradas de imagen y audio. El soporte multimodal requiere una build de llama.cpp compatible con "Gemma 4 Unified". No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; la model card se limita a indicar que el modelo genera texto a partir de texto, imágenes o audio.

## Capacidades

- Generación de texto conversacional y de código, con ajuste fino específico para programación.
- Razonamiento y resolución de problemas de programación (evaluado en HumanEval y HumanEval+).
- Entrada multimodal de imágenes mediante el proyector BF16 (image-text-to-text).
- Entrada de audio mediante el mismo proyector, con transcripción básica verificada en pruebas cortas.
- Ejecución local con llama.cpp, incluyendo llama-server.
- Modo "thinking" desactivable (las evaluaciones se realizaron con thinking desactivado).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente de código en local: el modelo puede ejecutarse con llama.cpp en una estación de trabajo y generar funciones, tests o refactorizaciones sin enviar código a servicios externos, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Autocompletado y generación en IDE: con un GGUF Q5_K_M de 8,55 GB, es viable integrarlo en flujos de desarrollo locales mediante llama-server, aprovechando su ajuste específico para programación.
- Revisión de código y explicación de fragmentos: dado su rendimiento en HumanEval+ (90,9% pass@1), puede emplearse para analizar y describir código existente en pipelines de documentación técnica.
- Procesamiento de capturas de pantalla o diagramas: gracias al proyector multimodal, puede recibir imágenes y generar descripciones o código a partir de ellas, útil en tareas de documentación o extracción de información visual.
- Transcripción de audio corto: el soporte de audio verificado en pruebas breves permite usarlo para transcribir notas de voz o clips cortos en flujos locales.
- Prototipado de aplicaciones multimodales: al combinar texto, imagen y audio en un único artefacto GGUF, sirve para validar pipelines image-text-to-text sin infraestructura en la nube.
- Evaluación y experimentación académica: su licencia Apache 2.0 y formato GGUF facilitan su uso en investigación sobre modelos locales de código y multimodalidad.

## Benchmarks y rendimiento

| Benchmark | Resultado | Pass@1 |
|---|---|---|
| HumanEval | 154 / 164 | 93,9% |
| HumanEval+ | 149 / 164 | 90,9% |

Las evaluaciones se realizaron con el archivo Q5_K_M sobre llama.cpp b10007, con thinking desactivado, temperatura 0 y un límite de 16.384 tokens de generación. Se puntuó la misma respuesta única por tarea contra ambas suites. El checkpoint upstream no fue evaluado bajo esta configuración. No se han publicado resultados de otros benchmarks (MMLU, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q5_K_M ocupa 8,55 GB y el proyector 175 MB (8,72 GB en total); la memoria en tiempo de ejecución es adicional y depende de la longitud de contexto, por lo que se recomienda al menos 10-12 GB de VRAM para texto y algo más para multimodal.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría en GPUs de consumo con 12 GB o más (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4080) y en GPUs de数据中心 como A100 o H100 con holgura.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 12 GB o más de VRAM, aunque el autor no lo confirma.
- Opciones de despliegue: llama.cpp (llama-server), con build compatible con Gemma 4 Unified; no se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| Nimbus Orage 12B | ~11,9 B | No disponible | Apache 2.0 | GGUF | HumanEval 93,9% pass@1; HumanEval+ 90,9% |
| Google Gemma 4 12B IT QAT (base) | ~11,9 B | No disponible | No disponible en la información | Safetensors/GGUF (no confirmado) | No evaluado bajo la misma configuración |
| Alternativas de código de ~12 B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría; los datos de modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al derivar de un modelo base de Google, podría heredar sesgos de este.
- Riesgo de alucinación: presente como en cualquier modelo generativo; el autor recomienda revisar y probar el código generado antes de usarlo.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están especificados, lo que dificulta planificar su uso en producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben revisarse los avisos de terceros (THIRD_PARTY_NOTICES.md) del modelo base.
- Soporte multimodal limitado: las pruebas de imagen y audio solo confirman las rutas de entrada, no la calidad; el vídeo no fue probado.
- Dependencia de una build específica de llama.cpp (Gemma 4 Unified), lo que puede complicar el despliegue en entornos estandarizados.
- Ausencia de benchmarks adicionales y de datos de entrenamiento del ajuste fino, lo que limita la evaluación rigurosa de sus capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nimbus-Labs/Nimbus-Orage-12B
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized/tree/a89c069a80c767b0d378c4806b2953ae9d2c711d
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo fuera de Hugging Face (los resultados obtenidos corresponden a definiciones de "nimbus" y no guardan relación).
