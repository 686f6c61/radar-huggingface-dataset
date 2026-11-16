# keptn/gemma4-31b-heretic-ara-a4

## Resumen

Gemma 4 31B heretic-ara a4 es una cuantización de 4 bits del modelo `trohrbaugh/gemma-4-31b-it-heretic-ara`, que a su vez deriva de `google/gemma-4-31B-it-assistant`. El autor, keptn, empaqueta los pesos en un único archivo de 19,95 GiB en formato `.rad`, propietario del motor de inferencia radiance, optimizado para GPUs AMD RDNA4 (en concreto las Radeon AI PRO R9700). El modelo conserva la torre de visión y el cabezal asistente de Gemma 4 para decodificación especulativa, y mantiene la ventana de contexto de 262.144 tokens.

La particularidad del modelo es doble. Por un lado, la variante "heretic-ara" implica que un proceso previo (método ARA de Heretic) ha eliminado los mecanismos de rechazo del modelo original, de modo que se trata de un modelo "abliterated" o sin censura. Por otro, la cuantización es mixta: los pesos del tronco van en int4 con punto cero (GPTQ), las activaciones en int8 y el `lm_head` en int8, una combinación que busca reducir el impacto en calidad frente a cuantizaciones más agresivas.

Es relevante ahora porque demuestra que es posible ejecutar un modelo multimodal de 31B con contexto de 256k en hardware AMD de consumo profesional, con throughput medido y con una pérdida de calidad cuantificada (KL medio de 0,0248 frente al modelo bf16 de referencia). No obstante, la licencia Apache 2.0 declarada convive con una herencia de pesos de Gemma, lo que conviene verificar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), con torre de visión y cabezal asistente para decodificación especulativa |
| Parametros totales | 31B (según nombre del modelo base; no se detalla el desglose) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Pesos int4 con punto cero (GPTQ, escala f16 cada 128 pesos); activaciones int8 (escala por token y 128 valores); `lm_head` int8 con escala bf16 cada 128 pesos; torre de visión y resto del cabezal asistente en bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `.rad` (formato propietario del motor radiance; archivo único de 19,95 GiB) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 31B-it, un transformer multimodal que acepta texto, imagen y vídeo. Sobre él, trohrbaugh aplicó el método ARA de Heretic v1.2.0 (con personalizaciones) para eliminar los rechazos, dando lugar a `gemma-4-31b-it-heretic-ara`. keptn parte de esa revisión (`f961f79e`) y sustituye los ficheros de configuración, plantilla de chat, tokenizador, configuración de generación y del procesador por los de Google (`gemma-4-31B-it`, revisión `842da379`), manteniendo pesos y vocabulario intactos.

La cuantización se realizó con GPTQ sobre el conjunto de calibración `keptn/quant-calibration-v1` (revisión `3969b2f9`), con las mismas filas y tokens que `keptn/gemma4-31b-a4`. Cada capa lineal del tronco se cuantizó a int4 con punto cero u8 y una escala f16 por cada 128 pesos; q, k y v comparten una pasada GPTQ, y en las capas 0 a 3 la salida de atención y ambos pesos feed-forward recibieron dos rondas de descenso por coordenadas. Se añadió el cabezal asistente de Google en bf16 (salvo los `lm_head`, redondeados a int8) con 3 tokens de borrador para decodificación especulativa. El resultado se empaqueta con `rad-convert` usando el método de cuantización `compressed-tensors`.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con plantilla de chat de Google.
- Comprensión de imágenes y vídeo como entrada (pipeline `image-text-to-text`).
- Modo "thinking" opcional por petición mediante `chat_template_kwargs: {"enable_thinking": true}`.
- Decodificación especulativa con el cabezal asistente de Gemma 4 (3 tokens de borrador), que acelera la generación.
- Contexto largo de hasta 262.144 tokens (con `max-model-len: 262144` y `max-num-seqs: 2`).
- Modelo "abliterated": no aplica rechazos por defecto, lo que permite respuestas sobre temas que el modelo original evitaría.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente en la información proporcionada.
- Capacidades multilingües: no disponibles (los idiomas no se especifican).

## Casos de uso

- Análisis de documentos largos con imágenes intercaladas: el contexto de 262.144 tokens permite procesar manuales, informes o expedientes completos junto con sus figuras en una sola pasada, sin trocear el contenido.
- Transcripción y descripción de vídeo: la entrada de vídeo combinada con el contexto largo permite resumir grabaciones extensas o extraer eventos concretos de una secuencia.
- Asistente conversacional sin filtros para investigación: el proceso de abliteración lo hace adecuado para estudiar el comportamiento del modelo en temas sensibles, análisis de sesgos o generación de contenido que el modelo original rechazaría.
- Despliegue en estaciones de trabajo AMD: al ejecutarse en radiance sobre RDNA4 con 1, 2 o 4 tarjetas de 32 GB, encaja en entornos con GPUs Radeon AI PRO R9700 sin depender de CUDA.
- Servicio de inferencia con concurrencia moderada: con 4 tarjetas alcanza 477 tokens/s agregados en 4 streams y 4.328 tokens/s de prefill a 24k, suficiente para un endpoint interno con varias sesiones simultáneas.
- Evaluación de cuantización: sirve como referencia práctica para medir el impacto de int4/int8 frente a bf16 (KL medio 0,0248, 95,9% de coincidencia en el token superior) en tareas de generación abierta.
- Prototipado de pipelines multimodales en local: el archivo único de 19,95 GiB simplifica el despliegue con Docker y permite levantar el servidor con una configuración YAML mínima.

## Benchmarks y rendimiento

Calidad medida con `--kld-ref` de radiance 2.1.0 sobre las respuestas a las 80 preguntas de MT-Bench (ambos turnos, 42.283 tokens de respuesta), comparando con el modelo heretic en bf16:

| Modelo | KL medio | KL percentil 99 | Token superior coincidente | Ratio de perplejidad |
|---|---|---|---|---|
| Este archivo (a4) | 0,0248 | 0,337 | 95,9% | ×0,985 |
| keptn/gemma4-31b-heretic-ara-w4a8 | 0,0529 | 0,732 | 94,4% | ×1,048 |
| keptn/gemma4-31b-heretic-ara-i8g | 0,00249 | 0,0324 | 98,7% | ×1,006 |

Rendimiento en Radeon AI PRO R9700 a 300 W, radiance 2.1.0, KV en i8, 3 tokens de borrador, thinking desactivado, BetterBench 0.6.1 (temperatura 0,7, mediana de tokens/s):

| Métrica | 1 tarjeta | 2 tarjetas | 4 tarjetas |
|---|---|---|---|
| Decode, un stream | 82,5 | 128,8 | 183,2 |
| Prefill a 24k tokens | 1.705 | 2.770 | 4.328 |
| 4 streams, total | 138 | 356 | 477 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM: el archivo ocupa 19,95 GiB; se necesitan tarjetas de 32 GB (probado en Radeon AI PRO R9700). Con KV en i8 y contexto completo de 262.144 tokens conviene reservar margen adicional.
- GPUs soportadas: exclusivamente AMD RDNA4 según la model card (Radeon AI PRO R9700 probada con 1, 2 y 4 tarjetas). No se menciona soporte para NVIDIA ni para otras arquitecturas AMD.
- Configuraciones válidas: 1, 2 o 4 tarjetas. Tres tarjetas no funcionan porque Gemma tiene 32 cabezas de atención y no se dividen entre tres.
- Cabe en GPU de consumo: no se indica compatibilidad con GPUs de consumo; el requisito declarado es de 32 GB por tarjeta en RDNA4.
- Despliegue: motor radiance 2.0.0 o superior (probado con 2.1.0), mediante imagen Docker `stilldeadcode/radiance:2.1.0`. No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI, dado el formato `.rad` propietario.
- Latencia y throughput: ver tabla de la sección anterior; el prefill a 24k varía de 1.705 a 4.328 tokens/s según el número de tarjetas, y el decode de un stream de 82,5 a 183,2 tokens/s.
- Opciones de configuración: `tp` (1, 2 o 4), `p2p` activado con varias tarjetas, `kv-cache-dtype: i8`, `max-model-len` ajustable, `vision-tower-placement: ram` y `num-speculative-tokens: 3`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Calidad (KL medio) | Licencia | Hardware |
|---|---|---|---|---|---|---|
| keptn/gemma4-31b-heretic-ara-a4 | 31B | 262.144 | `.rad`, int4/int8 GPTQ | 0,0248 | apache-2.0 | AMD RDNA4, radiance |
| keptn/gemma4-31b-heretic-ara-w4a8 | 31B | no disponible | w4a8 | 0,0529 | no disponible | radiance |
| keptn/gemma4-31b-heretic-ara-i8g | 31B | no disponible | int8 | 0,00249 | no disponible | radiance |
| trohrbaugh/gemma-4-31b-it-heretic-ara | 31B | no disponible | bf16 | referencia | no disponible | transformers |

Frente a las otras cuantizaciones del mismo autor, el formato a4 ofrece mejor fidelidad que w4a8 (KL 0,0248 frente a 0,0529) a costa de mayor tamaño, mientras que i8g es notablemente más fiel (KL 0,00249) pero presumiblemente más pesado. No se dispone de datos para comparar con alternativas de otros desarrolladores en la misma categoría.

## Limitaciones y advertencias

- El proceso de abliteración elimina los rechazos del modelo: puede generar contenido sensible, dañino o inexacto sin filtros, lo que exige salvaguardas externas en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; la cuantización int4 añade una pequeña degradación adicional (KL medio 0,0248, percentil 99 de 0,337).
- La licencia declarada es Apache 2.0, pero los pesos derivan de Gemma de Google; conviene verificar los términos de la licencia original de Gemma antes de un uso comercial.
- Compatibilidad restringida: solo funciona con el motor radiance y GPUs AMD RDNA4; no hay soporte documentado para CUDA, vLLM, llama.cpp ni Ollama.
- Tres tarjetas no son una configuración válida por la división de las 32 cabezas de atención.
- El contexto completo de 262.144 tokens limita la concurrencia a `max-num-seqs: 2`, lo que reduce el throughput agregado.
- Los idiomas soportados no están documentados, por lo que no se puede garantizar un rendimiento uniforme fuera del inglés.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria adicional.
- El formato `.rad` es propietario y dependiente de la versión del motor (radiance 2.0.0 o superior).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keptn/gemma4-31b-heretic-ara-a4
- Modelo base heretic: https://huggingface.co/trohrbaugh/gemma-4-31b-it-heretic-ara
- Cuantización w4a8 del mismo autor: https://huggingface.co/keptn/gemma4-31b-heretic-ara-w4a8
- Cuantización i8g del mismo autor: https://huggingface.co/keptn/gemma4-31b-heretic-ara-i8g
- Cuantización a4 del modelo original: https://huggingface.co/keptn/gemma4-31b-a4
- Motor de inferencia radiance: https://codeberg.org/StillDeadcode/radiance
- Conjunto de calibración: https://huggingface.co/keptn/quant-calibration-v1
