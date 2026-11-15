# keptn/gemma4-12b-heretic-ara-a4

## Resumen

Gemma 4 12B heretic-ara a4 es una cuantización de 4 bits en formato propietario `.rad` del modelo `llmfan46/gemma-4-12B-it-uncensored-heretic`, a su vez un fine-tune del `google/gemma-4-12B-it` al que se le han eliminado los rechazos mediante el método ARA de Heretic. El autor de la ficha es el usuario de Hugging Face `keptn`, que publica el archivo empaquetado para el motor de inferencia radiance 2.0.0 sobre GPUs AMD RDNA4.

El modelo conserva las capacidades multimodales del Gemma 4 original (texto, imagen y audio), una ventana de contexto de 262.144 tokens y el cabezal asistente de Gemma 4 para decodificación especulativa con 3 tokens de borrador. La cuantización aplica GPTQ en las capas lineales del tronco (pesos int4 con punto cero y una escala f16 por cada 128 pesos), activaciones int8 con una escala por token y 128 valores, y `lm_head` en int8.

Su relevancia es doble: por un lado, es una de las pocas distribuciones de Gemma 4 en 4 bits optimizadas para ROCm y RDNA4 (no para CUDA), y por otro, es una variante "abliterated" que responde a peticiones que el modelo original rechaza. Todo el archivo pesa 8,79 GiB y cabe en una única Radeon AI PRO R9700 de 32 GB, con soporte de tensor parallelism a 1, 2 o 4 tarjetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, imagen y audio) con cabezal asistente para decodificacion especulativa (MTP) |
| Parametros totales | 12B (heredados del modelo base Gemma 4 12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Pesos int4 con punto cero (GPTQ) en capas lineales del tronco; activaciones int8; lm_head int8; cabezal asistente en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (formato propietario del motor radiance 2.0.0), archivo unico de 8,79 GiB |
| Tamano del repo | 9,4 GB |
| Version del motor requerida | radiance 2.0.0 o superior |
| Hardware objetivo | AMD RDNA4 (ROCm); probado en 1 y 2 Radeon AI PRO R9700 |
| Modalidades de entrada | texto, imagen, audio |
| Modelo base | `llmfan46/gemma-4-12B-it-uncensored-heretic` y `google/gemma-4-12B-it-assistant` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 12B instruct, un transformer multimodal que acepta texto, imagen y audio, y que incorpora un cabezal asistente (assistant head) entrenado por Google para decodificación especulativa. En esta distribución, el tronco se cuantiza a int4 con GPTQ (una escala f16 por cada 128 pesos) y las activaciones a int8 (una escala por token y 128 valores); el `lm_head` del modelo principal y el del cabezal asistente se mantienen en int8. El cabezal asistente permanece en bf16 y propone 3 tokens de borrador por paso.

El proceso de construcción documentado por el autor parte del checkpoint de `llmfan46/gemma-4-12B-it-uncensored-heretic`, generado con Heretic v1.2.0 y el método ARA para eliminar los rechazos. Sobre ese checkpoint se sustituyeron `config.json`, la plantilla de chat, los ficheros del tokenizer y la configuración de generación por los de Google, porque el `config.json` original carecía de cuatro tamaños de visión y audio que radiance necesita, y su plantilla de chat era una versión antigua. Los pesos y el vocabulario no se modificaron. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el fine-tune de desbloqueo.

## Capacidades

- Generación de texto y razonamiento en conversaciones multi-turno con hasta 262.144 tokens de contexto.
- Comprensión de imágenes (pipeline `image-text-to-text`), incluyendo preguntas y respuestas sobre el contenido visual.
- Comprensión de audio como modalidad de entrada.
- Modo "thinking" opcional activable por petición mediante `chat_template_kwargs: {"enable_thinking": true}`; desactivado por defecto en la configuración recomendada.
- Decodificación especulativa mediante el cabezal asistente de Gemma 4, con 3 tokens de borrador configurables (o desactivable con `num-speculative-tokens: 0`).
- Respuestas a peticiones que el modelo original rechaza: en la evaluación del autor con 100 prompts de `mlabonne/harmful_behaviors`, el modelo en bf16 registra 7/100 rechazos por coincidencia de palabras clave y 3/100 según el clasificador, frente a 99/100 y 97/100 del original de Google.
- No se documenta soporte explícito de tool calling ni de function calling en la información disponible.

## Casos de uso

- Asistente conversacional de contexto largo: con 262.144 tokens de ventana y caché KV int8 que permite 8 sesiones a longitud completa en una sola tarjeta, es adecuado para asistentes que mantienen documentos extensos o historiales largos en memoria.
- Análisis de documentos con imágenes: al aceptar imagen y texto, puede extraer información de capturas, diagramas o documentos escaneados y responder preguntas sobre ellos en el mismo hilo.
- Transcripción y análisis de audio: la entrada de audio permite construir pipelines de resumen de reuniones o análisis de grabaciones combinados con razonamiento textual.
- Investigación sobre alineación y seguridad: al ser una variante con rechazos eliminados y con métricas publicadas de KL frente al original, sirve para estudiar el efecto de la abliteración en la distribución de salidas.
- Evaluación de cuantización en hardware AMD: el autor publica métricas de KL, perplejidad y velocidad frente a las variantes i8 y al modelo de Google, lo que lo convierte en un banco de pruebas para medir el coste de int4 en RDNA4.
- Despliegue en estaciones de trabajo con GPUs AMD: al caber en una Radeon AI PRO R9700 de 32 GB y soportar tensor parallelism a 2 o 4 tarjetas, permite servir un modelo multimodal de 12B sin hardware NVIDIA.
- Generación de contenido sin restricciones de rechazo: para aplicaciones creativas o de investigación donde los rechazos del modelo alineado resultan un obstáculo, siempre bajo responsabilidad del operador.

## Benchmarks y rendimiento

Calidad medida por el autor con `--kld-ref` de radiance 2.0.0 sobre las respuestas a las 80 preguntas de MT-Bench (ambos turnos, 42.283 tokens), comparando con el Gemma 4 bf16 de Google en transformers con aritmética fp32:

| Modelo | KL media | KL percentil 99 | Token top coincidente | Ratio de perplejidad |
|---|---|---|---|---|
| Este archivo (a4) | 0,140 | 1,91 | 89,7% | ×1,013 |
| keptn/gemma4-12b-heretic-ara-i8g | 0,0867 | 1,26 | 92,2% | ×1,021 |
| keptn/gemma4-12b-a4 (modelo de Google) | 0,0518 | 0,647 | 93,9% | ×0,988 |

Velocidad en una tarjeta, radiance 2.0.0, KV int8, 3 tokens de borrador, greedy, dos prompts: 120,3 y 164,2 tokens por segundo para este archivo, frente a 119,2 y 176,0 para `keptn/gemma4-12b-a4`.

Rechazos medidos en el checkpoint bf16 con 100 prompts de `mlabonne/harmful_behaviors`:

| Metrica | Este modelo (bf16) | Original de Google (bf16) |
|---|---|---|
| Rechazos por palabras clave | 7/100 | 99/100 |
| Rechazos por clasificador | 3/100 | 97/100 |

Divergencia KL de Heretic frente al original en el primer token de 100 prompts de `mlabonne/harmless_alpaca`: 0,1215.

## Requisitos de hardware

- VRAM: el archivo de pesos ocupa 8,79 GiB. La caché KV con `max-model-len: 262144` y 8 secuencias en int8 consume 17,68 GiB por tarjeta con 1 tarjeta y 16,87 GiB por tarjeta con 2 tarjetas, según el informe de arranque de radiance 2.0.0.
- GPU recomendadas: AMD Radeon AI PRO R9700 de 32 GB (probado con una y dos unidades); el autor indica compatibilidad con 1, 2 o 4 tarjetas de 32 GB.
- No hay soporte documentado para GPUs NVIDIA ni para GPUs de consumo de gama doméstica; el motor radiance está orientado a ROCm y RDNA4.
- Despliegue: exclusivamente mediante el motor radiance 2.0.0 o superior (imagen Docker `stilldeadcode/radiance:2.0.0`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput medido: 120,3 y 164,2 tokens por segundo en una tarjeta con decodificación especulativa de 3 tokens y KV int8.
- El despliegue con 2 tarjetas requiere `tp: 2` y `p2p: on`; con 1 tarjeta, `tp: 1` y sin `p2p`; con 4 tarjetas, `tp: 4`.
- La torre de visión puede ubicarse en RAM del sistema con `vision-tower-placement: ram`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware | Notas |
|---|---|---|---|---|---|---|
| keptn/gemma4-12b-heretic-ara-a4 | 12B | 262.144 | `.rad` int4/int8 | Apache 2.0 | AMD RDNA4 | Variante sin rechazos, KL 0,140 |
| keptn/gemma4-12b-heretic-ara-i8g | 12B | 262.144 | `.rad` int8 | Apache 2.0 | AMD RDNA4 | Variante sin rechazos, KL 0,0867, mayor fidelidad |
| keptn/gemma4-12b-a4 | 12B | 262.144 | `.rad` int4/int8 | Apache 2.0 | AMD RDNA4 | Gemma 4 de Google cuantizado, KL 0,0518, con rechazos |
| llmfan46/gemma-4-12B-it-uncensored-heretic | 12B | no disponible | bf16 (HF) | no disponible | GPU con suficiente VRAM | Checkpoint bf16 de origen del que deriva este archivo |

## Limitaciones y advertencias

- El modelo ha sido sometido a abliteración: responde a peticiones que el modelo original rechaza. El autor declara explícitamente que la responsabilidad de uso recae en el operador.
- La evaluación de rechazos se realizó sobre el checkpoint bf16, no sobre el archivo cuantizado `.rad`, por lo que las cifras no garantizan el mismo comportamiento exacto tras la cuantización.
- La cuantización int4 introduce degradación medible: KL media de 0,140 frente a 0,0518 del modelo de Google en el mismo formato, y el token top coincide solo en el 89,7% de los casos.
- El formato `.rad` es propietario y solo lo lee el motor radiance; no es portable a vLLM, llama.cpp, transformers ni otros runtimes sin reconversión (no documentada).
- Dependencia estricta de radiance 2.0.0 o superior y de hardware AMD RDNA4 con ROCm; no hay soporte documentado para otras plataformas.
- No se dispone de información sobre idiomas soportados ni sobre sesgos específicos del fine-tune de desbloqueo.
- Riesgo de alucinación inherente a los modelos de 12B, no cuantificado en la información disponible.
- La licencia Apache 2.0 se hereda del modelo base, pero el uso comercial de una variante sin rechazos puede tener implicaciones legales o de política de uso que el autor no detalla.
- No se documenta soporte de tool calling ni de function calling, lo que limita su uso en pipelines de agentes que dependan de esas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keptn/gemma4-12b-heretic-ara-a4
- Modelo base sin censura: https://huggingface.co/llmfan46/gemma-4-12B-it-uncensored-heretic
- Variante int8 del mismo autor: https://huggingface.co/keptn/gemma4-12b-heretic-ara-i8g
- Variante cuantizada del modelo de Google: https://huggingface.co/keptn/gemma4-12b-a4
- Motor de inferencia radiance: https://codeberg.org/StillDeadcode/radiance
- Imagen Docker del motor: `stilldeadcode/radiance:2.0.0`
