# Pound1320/gemma-4-E4B-it-uncensored-heretic

## Resumen

El modelo `Pound1320/gemma-4-E4B-it-uncensored-heretic` es una variante "decensored" (abliterada) de `google/gemma-4-E4B-it`, desarrollada por el usuario Pound1320 mediante la herramienta Heretic v1.2.0 y el método Arbitrary-Rank Ablation (ARA). El objetivo es reducir drásticamente los rechazos del modelo original manteniendo una alta similitud en el comportamiento general. Según la model card, se consigue una tasa de rechazos de 7/100 frente a los 99/100 del modelo base, con una divergencia KL de 0,0043.

El modelo base pertenece a la familia Gemma 4 de Google DeepMind y es multimodal (image-text-to-text), con pipeline any-to-any según los tags de HuggingFace. Los pesos del repositorio suman 7.996.156.490 parámetros en formato safetensors, aunque el nombre comercial del modelo base es E4B y la documentación externa lo describe como un modelo de 4,4B parámetros optimizado para despliegue local. La licencia declarada es Apache 2.0. No se especifican la longitud de contexto, los idiomas soportados ni las cuantizaciones disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Gemma 4 E4B |
| Parametros totales | 7.996.156.490 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo es una adaptación de `google/gemma-4-E4B-it` mediante la técnica de abliteración, concretamente con la herramienta Heretic v1.2.0 y el método Arbitrary-Rank Ablation (ARA). Los parámetros de abliteración declarados son los siguientes: capas desde la 8 hasta la 36, peso de preservación de buen comportamiento 0,9827, peso de dirección de mal comportamiento 0,0001, peso de sobrecorrección relativa 0,9110 y vecinos considerados 15. El componente objetivo es la proyección de salida de atención (`attn.o_proj`).

No se indica que se haya realizado entrenamiento adicional, RLHF ni DPO. La modificación actúa sobre los pesos del modelo original para reducir la tendencia a rechazar peticiones, sin alterar el resto de capacidades. La métrica de divergencia KL de 0,0043 frente al modelo original sugiere una alteración mínima del comportamiento general. El modelo base de Google DeepMind es multimodal, aunque no se detalla en la información disponible la composición de sus datos de entrenamiento.

## Capacidades

- Generación de texto y razonamiento: los resultados en MMLU (68,97%) y PIQA (85,58%) indican capacidades de conocimiento general y razonamiento físico comparables al modelo original.
- Multimodalidad: el pipeline es any-to-any y el tag `image-text-to-text` sugiere que el modelo puede procesar entradas de imagen y texto.
- Tool calling y Thinking Mode: la documentación externa de Gemma 4 E4B indica que el modelo base soporta tool use y un modo de pensamiento (Thinking Mode); no se confirma de forma explícita en la información del repositorio para esta variante.
- Reducción de rechazos: la tasa de rechazos es de 7/100, frente a los 99/100 del modelo original, lo que implica una menor tendencia a rechazar, objetar o desviar peticiones.
- Compatibilidad con transformers: el modelo está publicado con la librería transformers y el tag `endpoints_compatible`, lo que facilita su integración en entornos de inferencia estándar.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar ficción, diálogos o guiones explorando temas controvertidos sin las barreras de seguridad típicas del modelo original. Su baja tasa de rechazo lo hace adecuado para entornos de creación literaria o de guion donde se requiere libertad temática.
- Roleplay y simulación de personajes: la reducción de rechazos permite mantener conversaciones largas con personajes sin que el modelo interrumpa con objeciones morales o desvíe el diálogo. Es útil para aplicaciones de entretenimiento y narrativa interactiva.
- Análisis de imágenes en entornos de investigación: al ser multimodal, puede procesar imágenes y texto para tareas de descripción o análisis en dominios donde el modelo original podría bloquear ciertos contenidos (por ejemplo, arte, fotografía histórica o memes). La capacidad de visión no está documentada en la ficha, por lo que requiere validación previa.
- Generación de código con herramientas: si el modelo base soporta tool calling, puede integrarse en pipelines de desarrollo donde el modelo necesita invocar funciones sin fricciones de seguridad. El tag `endpoints_compatible` facilita su despliegue en servicios de inferencia.
- Análisis académico de textos sensibles: en contextos de investigación en literatura, sociología o estudios de medios, el modelo puede procesar y analizar textos con lenguaje explícito o controvertido sin rechazos, lo que resulta útil para tareas de clasificación, resumen o extracción de información.
- Prototipado de asistentes personalizados: desarrolladores que buscan un asistente con menos restricciones pueden usar este modelo como base para aplicaciones privadas, evitando la necesidad de ajustar prompts de jailbreak o sistemas de moderación adicionales.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan este modelo con el original `google/gemma-4-E4B-it`:

| Metrica | Modelo heretic | Modelo original |
|---|---|---|
| Divergencia KL | 0,0043 | 0 (por definicion) |
| Rechazos (sobre 100 prompts) | 7/100 | 99/100 |
| PIQA (accuracy) | 85,58% | 86,02% |
| MMLU (accuracy) | 68,97% | 69,46% |

La degradación en PIQA es de 0,44 puntos porcentuales y en MMLU de 0,49 puntos porcentuales, mientras que la reducción de rechazos es del 92,9%. No se han publicado resultados de otros benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 16,0 GB en safetensors. Para cargar los pesos en FP16 con transformers se estima una VRAM mínima de 16 GB, más el overhead de activaciones, por lo que se recomienda una GPU con al menos 20-24 GB (por ejemplo, RTX 4090, A100 40GB).
- Según la documentación externa de Gemma 4 E4B, el modelo base está optimizado para ejecutarse en 8 GB de VRAM, probablemente mediante cuantización de 4 bits. No se publican cuantizaciones en este repositorio, por lo que habría que generarlas con herramientas como llama.cpp o bitsandbytes.
- Opciones de despliegue: el modelo es compatible con transformers y el tag `endpoints_compatible` sugiere que puede servirse a través de endpoints de Hugging Face. No se dispone de información específica sobre compatibilidad con vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | PIQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Pound1320/gemma-4-E4B-it-uncensored-heretic | 7.996.156.490 | No disponible | 68,97% | 85,58% | Apache 2.0 | HuggingFace |
| google/gemma-4-E4B-it (original) | 7.996.156.490 | No disponible | 69,46% | 86,02% | Apache 2.0 | HuggingFace |
| marcus230/gemma-4-E4B-it-ultra-uncensored-heretic | No disponible | No disponible | No disponible | No disponible | Apache 2.0 (segun tags) | HuggingFace |

El modelo original presenta un rendimiento ligeramente superior en MMLU y PIQA, pero una tasa de rechazos mucho mayor. La variante de marcus230 parece ser otro modelo abliterado del mismo base, pero no se dispone de datos de rendimiento ni de parámetros.

## Limitaciones y advertencias

- La abliteración reduce la alineación y los mecanismos de seguridad del modelo original. El modelo puede generar contenido inapropiado, dañino o ilegal sin las barreras presentes en `google/gemma-4-E4B-it`.
- No se han publicado datos sobre sesgos específicos. La técnica de abliteración puede alterar de forma impredecible el comportamiento en ciertos dominios, especialmente en aquellos donde el modelo original rechazaba peticiones.
- El riesgo de alucinación no se ha evaluado de forma específica. Al ser una modificación de un modelo base, se espera un comportamiento similar al original, pero no hay métricas adicionales.
- La longitud de contexto y los idiomas soportados no están disponibles. La documentación externa indica que Gemma 4 E4B es multimodal y soporta tool use, pero no se confirma en esta variante.
- El modelo no tiene descargas ni likes en HuggingFace en el momento de la consulta, lo que indica una adopción muy limitada. Se recomienda validar la autenticidad y el funcionamiento del modelo antes de usarlo en producción.
- La fecha de creación del repositorio (2026-09-07) es posterior a la fecha actual, lo que sugiere que los metadatos pueden ser sintéticos o de prueba. Verificar la integridad de los pesos y la documentación de forma independiente.
- La licencia Apache 2.0 permite uso comercial, pero cualquier redistribución debe cumplir los términos de la licencia de Gemma 4, enlazada en la model card.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Pound1320/gemma-4-E4B-it-uncensored-heretic
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Documentacion de la licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Web sobre Gemma 4 E4B: https://gemma4.dev/models/gemma-4-e4b
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- GitHub de Google Gemma: https://github.com/google-gemma
- Modelo similar de marcus230: https://huggingface.co/marcus230/gemma-4-E4B-it-ultra-uncensored-heretic
