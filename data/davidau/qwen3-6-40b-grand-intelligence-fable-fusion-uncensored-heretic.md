# DavidAU/Qwen3.6-40B-Grand-Intelligence-Fable-Fusion-Uncensored-Heretic

## Resumen

Qwen3.6-40B-Grand-Intelligence-Fable-Fusion-Uncensored-Heretic es un modelo de lenguaje de 39.958 millones de parámetros desarrollado por DavidAU, creado mediante una expansión (upscaling) del modelo Qwen3.6-27B-Fable-Fusion-711, que alcanzó una puntuación ARC-C de 0.711 en cuantización de 8 bits, un hito que anteriormente solo lograban modelos propietarios de OpenAI, Claude y Gemini. El modelo se presenta como un fine-tune multi-etapa, con técnicas de abliteration para eliminar rechazos (uncensored) y soporte de Multi-Token Prediction (MTP) para acelerar la generación.

La arquitectura se basa en Qwen3.6, con 96 capas y 1290 tensores, un 50 % más grande que el modelo de 27B del que deriva. Está orientado a tareas de razonamiento, codificación, escritura creativa, ficción y roleplaying, con un modo de pensamiento (thinking) integrado. El modelo se distribuye bajo licencia Apache 2.0, con soporte para inglés y chino, y el pipeline declarado es image-text-to-text, aunque no se detallan capacidades de visión en la documentación.

El autor lo describe como un trabajo en progreso, con múltiples versiones en fase de prueba y ajuste. Se ha construido sobre hardware de consumo mediante la librería Unsloth, y está disponible en formato safetensors (bfloat16) y GGUF (en un repositorio separado). Aunque los benchmarks finales no superan al modelo 27B base, se sitúan en un rango cercano, y las pruebas humanas indican mejoras en áreas no capturadas por las evaluaciones estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.6 (transformer, con Multi-Token Prediction) |
| Parametros totales | 39.958.026.224 (39,96B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (safetensors); GGUF con imatrix NEO disponible en repositorio separado |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF (en repo aparte) |

## Arquitectura y entrenamiento

El modelo es una expansión del Qwen3.6-27B-Fable-Fusion-711, un fine-tune de Qwen3.6-27B que logró una puntuación ARC-C de 0.711 en 8 bits. La expansión a 40B añade capas y parámetros (96 capas, 1290 tensores), manteniendo la arquitectura transformer base de Qwen3.6. El entrenamiento combina múltiples modelos "711" y "717" (una versión no publicada del laboratorio de DavidAU) mediante un proceso de fusión multi-etapa, seguido de ajuste posterior a la expansión para restaurar el rendimiento. Se aplica abliteration para eliminar los mecanismos de rechazo del modelo original, resultando en una salida sin censura. El entrenamiento se realizó con Unsloth en hardware de consumo, y se incorpora Multi-Token Prediction (MTP) para mejorar la velocidad de decodificación. No se especifican los datos de entrenamiento ni el número de tokens utilizados.

## Capacidades

- Generacion de texto y razonamiento complejo, con modo de pensamiento (thinking) integrado.
- Codificacion: soporte para tareas de programacion y generacion de codigo.
- Escritura creativa, ficcion y roleplaying, con estilo narrativo mejorado segun pruebas humanas.
- Conversacion multi-turno y asistencia general.
- Multilingue: ingles y chino.
- Sin censura: gracias a la abliteration, no rechaza peticiones sobre temas sensibles.
- MTP (Multi-Token Prediction): decodificacion mas rapida al predecir multiples tokens por paso.
- El pipeline_tag indica image-text-to-text, pero no se documentan capacidades de vision especificas.

## Casos de uso

- Roleplaying y ficcion interactiva: el modelo puede mantener personajes y tramas complejas con coherencia narrativa, gracias a su entrenamiento en escritura creativa y su modo de pensamiento que planifica respuestas.
- Asistente de codificacion: puede generar, revisar y depurar codigo en multiples lenguajes, integrable en entornos de desarrollo mediante APIs compatibles con transformers.
- Escritura creativa asistida: util para autores que necesitan generar borradores, dialogos o descripciones, con un estilo literario refinado.
- Razonamiento y analisis: adecuado para tareas de logica, matematicas y planificacion, aprovechando su modo de pensamiento para desglosar problemas.
- Chat conversacional sin restricciones: para aplicaciones de compania o soporte donde se requiere respuestas abiertas sobre cualquier tema, sin filtros de contenido.
- Experimentacion en investigacion: al ser Apache 2.0 y estar disponible en bfloat16 y GGUF, permite probar tecnicas de upscaling, abliteration y MTP en entornos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este modelo en la informacion disponible. La model card menciona que los benchmarks finales "no son tan fuertes como el 27B FF711, pero estan en el mismo rango", y que superan a Qwen 3.6 27B y a modelos 40B anteriores del autor, pero no se ofrecen cifras concretas. El modelo base 27B (Qwen3.6-27B-Fable-Fusion-711) alcanzo un ARC-C de 0.711 en 8 bits y 0.701 en 4 bits, segun una publicacion de HackerNoon, pero estos datos no son directamente aplicables a la version 40B.

## Requisitos de hardware

- VRAM estimada: en bfloat16, ~80 GB (40B x 2 bytes); con cuantizacion de 4 bits, ~20 GB; con 8 bits, ~40 GB.
- GPU recomendadas: A100 80GB, H100, o multiples GPUs para bfloat16; RTX 4090 (24GB) o similar puede ejecutar la version cuantizada a 4 bits.
- Compatible con hardware de consumo: si, mediante cuantizacion GGUF (disponible en el repositorio NEO-MAX-MTP-GGUF) y herramientas como llama.cpp u Ollama.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, transformers (con soporte para safetensors).
- Latencia y throughput: no disponible; el uso de MTP puede reducir el tiempo de generacion, pero no se proporcionan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.6-40B-Grand-Intelligence-Fable-Fusion (este) | 39,96B | no disponible | Apache 2.0 | Upscale de 27B, sin censura, MTP |
| Qwen3.6-27B-Fable-Fusion-711 | 27B | no disponible | Apache 2.0 | Modelo base, ARC-C 0.711 en 8 bits |
| Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor | 40B | no disponible | Apache 2.0 | Version hermana con "DNA" de Deckard, enfocada en reducir tokens de pensamiento |

No se dispone de datos de rendimiento comparativo con otros modelos de tamano similar (p. ej., Llama-3.1-70B o Qwen3-32B) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo en desarrollo: el autor lo describe como "work in progress", con posibles cambios de nombre y mejoras pendientes; puede presentar inestabilidad en algunas tareas.
- Sin censura: al estar abliterated, puede generar contenido inapropiado, ofensivo o peligroso; no es adecuado para aplicaciones con requisitos de moderacion.
- Idiomas limitados: solo ingles y chino; el rendimiento en otros idiomas no esta garantizado.
- Sesgos: no se documentan sesgos especificos, pero al ser un fine-tune de Qwen3.6, puede heredar sesgos del modelo base.
- Alucinaciones: no se proporcionan datos sobre la tasa de alucinacion; se recomienda validar las salidas en contextos criticos.
- Requisitos de hardware: la version bfloat16 requiere ~80GB de VRAM, lo que limita su uso en entornos sin GPUs de alta gama.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo puede incluir componentes de terceros con restricciones adicionales; se debe revisar la documentacion completa.

## Enlaces

- Repositorio HuggingFace (safetensors): https://huggingface.co/DavidAU/Qwen3.6-40B-Grand-Intelligence-Fable-Fusion-Uncensored-Heretic
- Repositorio GGUF (NEO Imatrix, reg y MTP): https://huggingface.co/DavidAU/Qwen3.6-40B-Grand-Intelligence-Fable-Fusion-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Modelo base 27B (GGUF): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Version hermana "Deckard": https://huggingface.co/DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored
- Articulo HackerNoon sobre el modelo 27B: https://hackernoon.com/the-fine-tuned-variant-of-qwen36-27b-that-achieved-an-arc-c-score-of-0711-in-8-bit-quantization
