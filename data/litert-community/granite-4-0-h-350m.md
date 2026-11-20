# litert-community/granite-4.0-h-350m

## Resumen

Granite-4.0-h-350m es un modelo de lenguaje de 350 millones de parámetros desarrollado originalmente por IBM, aquí distribuido por la comunidad `litert-community` en formato LiteRT-LM (`.litertlm`) para inferencia en dispositivo (*on-device*) mediante el runtime LiteRT-LM de Google. Se trata de una conversión cuantizada del modelo base `ibm-granite/granite-4.0-h-350m`, no de un modelo nuevo, y su relevancia radica en que demuestra que arquitecturas híbridas modernas pueden ejecutarse en hardware de consumo y teléfonos móviles.

La arquitectura es híbrida: 28 bloques Mamba2 (selective-scan) intercalados con 4 bloques de atención con consultas agrupadas (GQA). Los bloques Mamba2 mantienen estado recurrente conv + SSM por capa en lugar de una caché KV creciente, por lo que el consumo de memoria se mantiene prácticamente plano respecto a la longitud de contexto; solo las 4 capas de atención conservan KV cache. Esta característica es lo que hace viable el despliegue en hardware con recursos limitados.

El repositorio ofrece tres ficheros: fp16 (723 MB), int8 dinámico con pesos únicamente (436 MB) e int8 reexportado para GPU (481 MB). La verificación a nivel de logits contra la referencia en PyTorch es exacta en cada posición de decodificación (diferencia máxima por posición ≤ 3,9e-4, correlación 1,000000, top-1 idéntico). La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 28 bloques Mamba2 (selective-scan) + 4 bloques de atención GQA |
| Parametros totales | 350 millones (modelo base); parámetros activos no aplica (no es MoE) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | fp16 (convs/SSM en fp32); int8 dinámico weight-only; int8 reexportado con activaciones fp32 para GPU |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors |
| Tamano de ficheros | fp16: 723 MB; int8: 436 MB; int8_gpu: 481 MB |
| Tamano del repositorio | 5,8 GB |
| Runtime | LiteRT-LM 0.15.0, 0.16.1, 0.17.1, 0.18.0 y 0.19.2 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida en la que 28 bloques Mamba2 (selective-scan) se intercalan con 4 bloques de atención con consultas agrupadas (GQA). Los bloques Mamba2 portan estado recurrente conv + SSM por capa en lugar de una caché KV que crece con el contexto, de modo que la memoria permanece casi constante al aumentar la longitud de la secuencia; solo las 4 capas de atención mantienen KV cache. Los buffers de estado conv/SSM de Mamba2 se enlazan mediante el mecanismo de *state binding* generalizado de LiteRT-LM 0.15 (`ExecutorMetadata`); la versión 0.14 del runtime no puede enlazarlos.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base; estos datos corresponden a la model card original de IBM, no incluida en la información proporcionada. La conversión a LiteRT-LM sí está documentada en detalle: la exportación en coma flotante coincide exactamente con el modelo de Hugging Face en cada posición de decodificación (comparación con *teacher forcing* de 8 pasos, diferencia máxima de logit por posición ≤ 3,9e-4, correlación 1,000000, top-1 idéntico en todas las posiciones), tanto en la ruta de prefill por chunks como en la de decodificación paso a paso (ventana convolucional rotada y recurrencia de estado SSM). El fichero no antepone token BOS, en coherencia con la plantilla de chat oficial de Granite; a escala 350M esto importa, ya que anteponer `<|end_of_text|>` degrada mediblemente las respuestas greedy.

## Capacidades

- Generación de texto autoregresiva en formato de chat (pipeline `text-generation`).
- Razonamiento básico y respuesta a preguntas de cultura general a escala 350M.
- Conversación multi-turno mediante plantilla de chat oficial de Granite.
- Inferencia en dispositivo (*on-device*) en CPU y GPU de teléfonos y placas SBC.
- Ejecución con memoria casi plana respecto a la longitud de contexto gracias a los bloques Mamba2.
- Soporte de tool calling / function calling: la información disponible se interrumpe en ese punto y no permite confirmarlo.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo *thinking* explícito: no disponible.

## Casos de uso

- Asistentes de texto embebidos en aplicaciones Android: el fichero int8 (436 MB) se ejecuta en CPU de un Galaxy S26 a 11,5 tok/s de decodificación, suficiente para respuestas cortas en asistentes locales sin conexión.
- Procesamiento de lenguaje natural en placas SBC: en una Raspberry Pi 5 con CPU y 4 hilos, el modelo decodifica a 3,8 tok/s con prefill de 8 tok/s, adecuado para tareas por lotes de clasificación o resumen de textos breves.
- Prototipado de pipelines de IA generativa en el borde: al mantener memoria casi plana con la longitud de contexto, permite procesar documentos largos en dispositivos con RAM limitada sin crecimiento de la caché KV.
- Filtrado y etiquetado local de contenido: clasificación de mensajes, extracción de entidades o moderación en el propio dispositivo, evitando enviar datos a la nube.
- Aplicaciones de privacidad estricta: al ejecutarse íntegramente en el dispositivo, es apto para datos sanitarios o personales que no pueden salir del terminal.
- Evaluación comparativa de runtimes de inferencia: sirve como banco de pruebas reproducible (métricas TTFT, prefill y decode publicadas para Galaxy S26, Pixel 8a y Raspberry Pi 5) para comparar LiteRT-LM con otras alternativas.
- Docencia y experimentación con arquitecturas híbridas Mamba2 + atención: el modelo permite estudiar el comportamiento del estado recurrente frente a la caché KV en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Sí se han publicado mediciones de rendimiento en dispositivo:

| Dispositivo | Runtime | Backend | Decode (tok/s) | Prefill (tok/s) | TTFT |
|---|---|---|---|---|---|
| Galaxy S26 (fp16) | LiteRT-LM 0.16.0 | GPU | no ejecutó (`engine_create_failed`) | — | — |
| Galaxy S26 (fp16) | LiteRT-LM 0.16.0 | CPU | 9,5 | 9 | 25,05 s |
| Raspberry Pi 5 (fp16) | LiteRT-LM 0.16.1 | CPU, 4 hilos | 3,8 | 8 | 30,43 s |
| Galaxy S26 (int8) | LiteRT-LM 0.16.0 | GPU | no ejecutó (`engine_create_failed`) | — | — |
| Galaxy S26 (int8) | LiteRT-LM 0.16.0 | CPU | 11,5 | 11 | 21,39 s |
| Pixel 8a (int8) | LiteRT-LM 0.16.0 | CPU | 8,9 | 8 | 28,01 s |

Verificación de correctitud: 8/8 aciertos en una prueba de sanidad de 8 preguntas, coincidiendo con la referencia de Hugging Face; barrido de longitudes de prompt de 12 a 200 tokens sin errores.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| granite-4.0-h-350m (LiteRT-LM) | 350M | Híbrida Mamba2 + GQA | no disponible | `.litertlm` | Apache 2.0 |
| ibm-granite/granite-4.0-h-350m | 350M | Híbrida Mamba2 + GQA | no disponible | safetensors (base) | Apache 2.0 |
| litert-community/granite-4.0-h-1b | 1B | Híbrida Mamba2 + GQA | no disponible | `.litertlm` | no disponible en la información |

La comparación con alternativas de otros fabricantes (por ejemplo, modelos de 0,3-0,5B de otras familias) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Reutilización de estado del motor: si se reutiliza un mismo objeto `Engine` entre conversaciones cuyos prompts comparten un prefijo común creciente, la respuesta puede cortarse tras unos pocos tokens. En el fichero int8 aparece con longitudes de plantilla de chat de 33 a 37; en `_int8_gpu`, de 37 a 41. Un `Engine` nuevo por conversación funciona correctamente en todas las longitudes probadas. La causa es el runtime, no los pesos (issue LiteRT-LM#3165); existe un parche en `main` desde el 3 de noviembre de 2026 (commit e1f86b05) que aún no está en ninguna release (v0.19.1 no lo incluye).
- El fichero fp16 no funciona en el backend GPU de Mac de litert-lm 0.18.0: el delegado WebGPU rechaza DEQUANTIZE, EMBEDDING_LOOKUP y tensores de rango 5, y no se crea motor. En Android GPU con 0.16.0, el Galaxy S26 también rechazó el fichero fp16.
- En GPU debe usarse el fichero `_int8_gpu`; los ficheros fp16 e int8 originales son para CPU.
- En teléfonos se recomienda int8: el runtime de CPU desempaqueta los pesos fp16 a fp32 en RAM (~3,7 GB de pico en iPhone frente a ~2,1 GB con int8).
- El modelo no antepone BOS por diseño; añadirlo degrada las respuestas greedy a esta escala.
- No se dispone de información sobre sesgos, riesgo de alucinación específico, cobertura de idiomas ni restricciones adicionales de uso comercial más allá de la licencia Apache 2.0.
- A 350M de parámetros, la calidad de razonamiento y la fiabilidad factual son limitadas; no es adecuado para tareas que exijan precisión alta sin verificación externa.
- La información sobre soporte de tool calling está truncada en la fuente y no puede confirmarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/granite-4.0-h-350m
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-350m
- Modelo hermano de 1B: https://huggingface.co/litert-community/granite-4.0-h-1b
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Ficha de compatibilidad en dispositivo (fp16): https://github.com/john-rocky/edge-compat/blob/main/cards/granite-4.0-h-350m-fp16/CARD.md
- Ficha de compatibilidad en dispositivo (int8): https://github.com/john-rocky/edge-compat/blob/main/cards/granite-4.0-h-350m-int8/CARD.md
- Issue de reutilización de estado: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Commit con el parche: https://github.com/google-ai-edge/LiteRT-LM/commit/e1f86b05bf8a731331622a2622440e9f93d9a9f5
