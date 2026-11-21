# litert-community/LFM2-2.6B

## Resumen

LFM2-2.6B en formato LiteRT-LM es una conversión del modelo LiquidAI/LFM2-2.6B realizada por la comunidad litert-community, empaquetada en ficheros `.litertlm` para ejecutarse con el runtime LiteRT-LM de Google en dispositivos de borde (móviles Android, Mac con GPU, etc.). El modelo original, desarrollado por Liquid AI, es un transformer híbrido de 2.569.272.320 parámetros distribuidos en 30 capas (22 de convolución y 8 de atención), pensado para tareas agénticas, extracción de datos, RAG y conversación multi-turno en entornos con recursos limitados.

La relevancia de esta conversión radica en que permite ejecutar un modelo de 2,6B parámetros en hardware de consumo: el fichero int4 ocupa 1,53 GB y alcanza 31,1 tokens por segundo en la GPU de un Galaxy S26 con LiteRT-LM 0.19.1, frente a los 26,8 tok/s del fichero int4 estándar. Liquid AI indica un contexto nativo de 32.768 tokens, aunque los ficheros de esta conversión limitan el contexto a 4096 tokens.

El modelo soporta ocho idiomas (inglés, árabe, chino, francés, alemán, japonés, coreano y español) y es el único de la familia LFM2 que emplea razonamiento híbrido dinámico, generando una traza entre `<think>` y `</think>` para prompts complejos o multilingües. La licencia es LFM1.0, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 30 capas (22 de convolución + 8 de atención) |
| Parametros totales | 2.569.272.320 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens según Liquid AI; 4096 tokens en estos ficheros |
| Tipos de cuantizacion | int8 (dynamic en lineales + int8 embedding, convs en float), int4 (blockwise-32 + OCTAV en lineales, int8 lm_head + embedding) |
| Idiomas soportados | Inglés, árabe, chino, francés, alemán, japonés, coreano y español |
| Licencia | LFM1.0 (license_name: lfm1.0) |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido que combina 22 capas de convolución con 8 capas de atención, una elección que reduce el coste computacional frente a un transformer puramente atencional y facilita la inferencia en dispositivos de borde. La conversión a LiteRT-LM aplica recetas de cuantización específicas: el fichero int8 usa cuantización dinámica int8 en las capas lineales con embedding int8 y convoluciones en float; el fichero int4 emplea cuantización blockwise de tamaño 32 más OCTAV en las lineales, con lm_head y embedding en int8.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La model card de la conversión tampoco documenta innovaciones de decodificación especulativa ni atención lineal más allá de la arquitectura híbrida conv/attention. Sí se documenta el uso de razonamiento híbrido dinámico: el modelo genera una traza de pensamiento entre `<think>` y `</think>` cuando detecta prompts complejos o multilingües.

La conversión se realizó con litert-torch y se validó en LiteRT-LM 0.19.0 a 0.19.2, además de versiones nightly 0.20.0.dev. Los pesos, la plantilla de chat y el tokenizador son idénticos entre las versiones actuales de los ficheros int4 e int8.

## Capacidades

- Generación de texto y conversación multi-turno, con soporte de contexto de hasta 4096 tokens en estos ficheros.
- Razonamiento híbrido dinámico: traza de pensamiento entre `<think>` y `</think>` para prompts complejos o multilingües.
- Capacidades multilingües en inglés, árabe, chino, francés, alemán, japonés, coreano y español.
- Tareas agénticas y flujos de varios pasos, según las recomendaciones de Liquid AI.
- Extracción de datos estructurados y RAG (retrieval-augmented generation).
- Escritura creativa y generación de contenido.
- No está recomendado por Liquid AI para tareas intensivas en conocimiento ni para programación.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de visión ni audio en la información disponible.
- Inferencia en dispositivo: GPU y CPU en Android (Galaxy S26, Pixel 8a) y GPU en Mac M4 Max.

## Casos de uso

- Asistente conversacional en móvil: el modelo puede gestionar conversaciones multi-turno con hasta 4096 tokens de contexto y ejecutarse en la GPU de un Galaxy S26 a 31,1 tok/s, lo que permite respuestas fluidas sin conexión a servidores externos.
- Extracción de datos en el dispositivo: Liquid AI recomienda LFM2 para data extraction; con 1,53 GB en int4, el modelo cabe en la memoria de un teléfono de gama alta y puede procesar formularios o documentos localmente sin enviar datos a la nube.
- RAG local en aplicaciones de borde: con 4096 tokens de contexto, el modelo puede recibir fragmentos recuperados de un índice local y generar respuestas fundamentadas, útil en asistentes de documentación offline.
- Generación de contenido creativo en aplicaciones móviles: escritura de borradores, resúmenes y textos multilingües (ocho idiomas) directamente en el dispositivo, con la traza de razonamiento para prompts complejos.
- Prototipado rápido en Mac: el fichero int8 en CPU tarda 9,10 segundos en un prefill de 1024 tokens más 256 tokens decodificados en un M4 Max, lo que permite iterar en desarrollo sin infraestructura GPU dedicada.
- Despliegue en dispositivos Android de gama media: el Pixel 8a ejecuta el fichero int4 en GPU en 22,11 segundos para la misma carga (prefill 1024 + 256 decodificados), viable para aplicaciones de productividad personal.
- Filtrado y clasificación de texto en el borde: el modelo puede clasificar y resumir textos localmente en aplicaciones de correo o mensajería, reduciendo la latencia y preservando la privacidad.

## Benchmarks y rendimiento

La model card reporta resultados en GSM8K (n=100) e IFEval-lite (n=120): los ficheros int8 e int4 quedan dentro de dos ítems del modelo bf16, aunque no se proporcionan los valores absolutos. En la comprobación de 8 preguntas, el fichero `_v0190` obtuvo 7/8 en GPU y CPU en un Mac M4 Max (falló la pregunta de rima), mientras que el int4 estándar obtuvo 7/8 en GPU y 8/8 en CPU; en la GPU del Galaxy S26, el `_v0190` obtuvo 7/8 con las mismas respuestas que el int4 estándar.

Tiempos para un prefill de 1024 tokens más 256 tokens decodificados con contexto 2048 (segundos):

| Configuración | Mac M4 Max | Galaxy S26 | Pixel 8a |
|---|---|---|---|
| int4 GPU | 1,98 | 10,70 | 22,11 |
| int8 GPU | 2,45 | 13,47 | 25,07 |
| int8 CPU | 9,10 | 18,17 | 50,17 |
| int4 CPU | 10,75 | 23,54 | 68,48 |

Throughput de decodificación en Galaxy S26 GPU con LiteRT-LM 0.19.1: 31,1 tok/s para `LFM2-2.6B_int4_gpu_composite_v0190.litertlm` frente a 26,8 tok/s para `LFM2-2.6B_int4.litertlm`. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/memoria: el fichero int4 ocupa 1,53 GB y el int8 2,72 GB. La sección de pesos del int8 es de 2.569.011.200 bytes (2,39 GiB).
- GPU recomendadas: GPU de Galaxy S26 (31,1 tok/s en decodificación), GPU de Mac M4 Max (1,98 s para prefill 1024 + 256 decodificados en int4), GPU de Pixel 8a (22,11 s en int4).
- Cabe en GPU de consumo: sí, en móviles de gama alta y en Mac con chip M4 Max. No se ha medido en iOS; la model card de LFM2.5-2.6B indica que un fichero int8 de 2,87 GB solo funciona en iPhone 17 Pro con entitlements de direccionamiento virtual extendido y memoria incrementada.
- Opciones de despliegue: runtime LiteRT-LM (versiones 0.19.0 a 0.19.2 para GPU; builds con LiteRT #11565 y litert-lm-nightly 0.20.0.dev20261112 para CPU y GPU), binario Android precompilado, litert-lm desde PyPI en Mac.
- Latencia y throughput: ver tabla de benchmarks. El int4 es más rápido en todas las GPU probadas y el int8 en todas las CPU.
- En LiteRT-LM 0.17.1 el fichero int8 respondió a "What is the capital of France?" como si no se hubiera hecho la pregunta (una ejecución en CPU); el int4 no se probó en esa versión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| LFM2-2.6B (LiteRT-LM) | 2.569.272.320 | 32.768 (4096 en estos ficheros) | LFM1.0 | `.litertlm` | Hugging Face, litert-community |
| LiquidAI/LFM2-2.6B | 2.569.272.320 | 32.768 | LFM1.0 | safetensors (no confirmado en la información) | Hugging Face, LiquidAI |
| LFM2.5-2.6B (LiteRT-LM) | no disponible | no disponible | no disponible | `.litertlm` | Hugging Face, litert-community |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Liquid AI no recomienda el modelo para tareas intensivas en conocimiento ni para programación; está orientado a tareas agénticas, extracción de datos, RAG, escritura creativa y conversación multi-turno.
- El contexto en estos ficheros está limitado a 4096 tokens, frente a los 32.768 del modelo original, lo que reduce su utilidad en documentos largos.
- Riesgo de alucinación inherente a modelos de 2,6B parámetros; no se han publicado evaluaciones de factualidad.
- No se documentan sesgos conocidos en la información disponible.
- La licencia LFM1.0 condiciona el uso comercial; es necesario revisar los términos en el enlace de licencia antes de desplegar en producción.
- El fichero `_v0190` falla la pregunta de rima en Mac M4 Max (7/8) y es rechazado en GPU por builds con LiteRT #11565.
- En LiteRT-LM 0.17.1 el fichero int8 mostró un fallo de respuesta en la pregunta sobre la capital de Francia.
- No se ha medido en iOS ni en teléfonos distintos del Galaxy S26 y el Pixel 8a.
- La compatibilidad está atada a versiones concretas del runtime LiteRT-LM (0.19.0 a 0.19.2 para el fichero `_v0190` en GPU).

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/LFM2-2.6B
- Modelo base: https://huggingface.co/LiquidAI/LFM2-2.6B
- Licencia: https://huggingface.co/LiquidAI/LFM2-2.6B/blob/main/LICENSE
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Conversión LFM2.5-2.6B: https://huggingface.co/litert-community/LFM2.5-2.6B
