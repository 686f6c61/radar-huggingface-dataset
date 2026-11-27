# litert-community/granite-4.0-h-350m

## Resumen

Granite-4.0-h-350m en formato LiteRT-LM es la conversión del modelo base `ibm-granite/granite-4.0-h-350m` de IBM al formato `.litertlm`, optimizado para inferencia en dispositivo (on-device) mediante el runtime LiteRT-LM de Google. Lo publica la comunidad `litert-community`, que mantiene conversiones de modelos abiertos a este formato para despliegue en edge. El modelo resuelve el problema de ejecutar un LLM de 350 millones de parámetros en hardware de gama móvil (smartphones, Raspberry Pi) sin depender de la nube, manteniendo una huella de memoria casi constante respecto a la longitud de contexto.

La arquitectura subyacente es híbrida: combina 28 bloques Mamba2 (selective-scan) intercalados con 4 bloques de atención con grouped-query attention. Los bloques Mamba2 mantienen estado recurrente por capa (conv + SSM) en lugar de una caché KV creciente, de modo que solo las 4 capas de atención acumulan KV cache. Esto hace al modelo especialmente adecuado para contextos largos en dispositivos con RAM limitada.

La relevancia actual radica en que ofrece tres variantes de cuantización (fp16, int8 e int8_gpu) verificadas a nivel de logits contra la referencia en PyTorch, con métricas de rendimiento medidas en dispositivos reales (Galaxy S26, Pixel 8a, Raspberry Pi 5). Es un modelo pequeño, con licencia Apache 2.0, pensado para prototipado y despliegue de asistentes locales, clasificación de texto y tareas de generación de baja latencia en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 28 bloques Mamba2 (selective-scan) + 4 bloques de atención grouped-query |
| Parametros totales | 350 millones (según nombre del modelo; no se detalla desglose en la información disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | fp16 (linears + embedding en fp16, convs/SSM en fp32); int8 dynamic weight-only (linears + embedding int8, convs/SSM en float); int8_gpu (mismos pesos int8, activaciones fp32 declaradas, selective scan reescrito como matmuls de rango ≤4) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); tres ficheros: `granite-4.0-h-350m_fp16.litertlm` (723 MB), `granite-4.0-h-350m_int8.litertlm` (436 MB), `granite-4.0-h-350m_int8_gpu.litertlm` (481 MB) |

## Arquitectura y entrenamiento

El modelo base es Granite 4.0-h de IBM, con una arquitectura híbrida que intercala 28 bloques Mamba2 con 4 bloques de atención grouped-query. Los bloques Mamba2 emplean un mecanismo de selective-scan con estado recurrente por capa (buffers de convolución y SSM), lo que sustituye la caché KV creciente por un estado de tamaño fijo. Como consecuencia, el consumo de memoria permanece prácticamente plano con la longitud de contexto, y solo las 4 capas de atención mantienen KV cache. Esta conversión concreta no entrena el modelo, sino que exporta los pesos del modelo base de IBM al formato LiteRT-LM.

La conversión se ha verificado a nivel de logits contra la referencia en PyTorch: una exportación en float coincide exactamente en cada posición de decodificación (comparación teacher-forced de 8 pasos, diferencia máxima por posición |logit diff| ≤ 3,9e-4, correlación 1,000000, top-1 idéntico en todas las posiciones). Tanto la ruta de prefill por chunks como la de decodificación paso a paso (ventana de convolución rotada y recurrencia de estado SSM) reproducen la matemática de referencia. Los tres ficheros pasan una comprobación de cordura de 8 preguntas con 8/8 aciertos, coincidiendo con la referencia HF. Una innovación destacable es el fichero `_int8_gpu`, que reescribe el selective scan de Mamba2 como matmuls batched de rango ≤4 y declara `prefer_activation_type = "fp32"`, lo que permite ejecutar el grafo en GPU; el coste es un fichero 45 MB mayor porque cada firma corta de prefill se rellena hasta un chunk completo de 256 tokens con una constante almacenada en lugar de una operación `PAD`. Los buffers de estado conv/SSM de Mamba2 se enlazan mediante el state binding generalizado de LiteRT-LM 0.15 (`ExecutorMetadata`); LiteRT-LM 0.14 no puede enlazarlos.

## Capacidades

- Generación de texto autoregresiva en dispositivo, con pipeline `text-generation`.
- Razonamiento y generación de texto general, heredado del modelo base Granite 4.0-h de IBM.
- Ejecución en CPU y GPU de dispositivos móviles y SBC (Raspberry Pi 5) mediante el runtime LiteRT-LM.
- Memoria casi constante con la longitud de contexto gracias a los bloques Mamba2, lo que favorece conversaciones multi-turno y prompts largos en hardware limitado.
- Compatibilidad con el chat template oficial de Granite (sin prepend de BOS, según la model card).
- Soporte de tool calling, function calling, agentes, modo thinking, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistentes locales en smartphone: el modelo puede ejecutarse en CPU de un Galaxy S26 o Pixel 8a con el fichero int8 (436 MB), gestionando conversaciones de texto sin conexión y sin enviar datos a la nube. Es adecuado por su tamaño reducido y su huella de memoria plana con el contexto.
- Prototipado de aplicaciones edge en Raspberry Pi 5: con LiteRT-LM 0.16.1 en CPU a 4 hilos, el modelo decodifica a 3,8 tok/s, suficiente para demos de generación de texto, clasificación o resumen en dispositivos de bajo coste.
- Clasificación y etiquetado de texto en el borde: al ser un modelo de 350M con licencia Apache 2.0, puede integrarse en pipelines de preprocesado local (por ejemplo, categorización de tickets o extracción de entidades simples) sin coste de API.
- Generación de respuestas en aplicaciones de atención al cliente offline: la arquitectura híbrida mantiene el estado recurrente de Mamba2 en lugar de una caché KV creciente, lo que permite sostener conversaciones multi-turno en dispositivos con RAM limitada (el runtime int8 alcanza ~2,1 GB de pico en iPhone frente a ~3,7 GB de fp16).
- Evaluación comparativa de runtimes on-device: sirve como banco de pruebas para medir decode, prefill y TTFT en distintos dispositivos y versiones de LiteRT-LM, con métricas públicas en el repositorio edge-compat.
- Despliegue en escritorio con calidad de referencia: el fichero fp16 (723 MB) reproduce token a token las salidas greedy del modelo PyTorch en los prompts de prueba, por lo que es adecuado para validación de calidad y comparación con la referencia HF.
- Integración en aplicaciones macOS: los tres ficheros se ejecutan en CPU de Mac con LiteRT-LM 0.15.0, 0.16.1, 0.17.1, 0.18.0 y 0.19.2, y `_int8_gpu` también en GPU de Mac con 0.19.2, lo que permite prototipar localmente antes de desplegar en móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se incluyen métricas de rendimiento en dispositivo medidas por edge-compat:

| Dispositivo | Fichero | Runtime | Backend | Decode (tok/s) | Prefill (tok/s) | TTFT |
|---|---|---|---|---|---|---|
| Galaxy S26 | fp16 | LiteRT-LM 0.16.0 | GPU | No ejecutado: `engine_create_failed` (2026-08-24) | — | — |
| Galaxy S26 | fp16 | LiteRT-LM 0.16.0 | CPU | 9,5 | 9 | 25,05 s |
| Raspberry Pi 5 (4 hilos) | fp16 | LiteRT-LM 0.16.1 | CPU | 3,8 | 8 | 30,43 s |
| Galaxy S26 | int8 | LiteRT-LM 0.16.0 | GPU | No ejecutado: `engine_create_failed` (2026-08-24) | — | — |
| Galaxy S26 | int8 | LiteRT-LM 0.16.0 | CPU | 11,5 | 11 | 21,39 s |
| Pixel 8a | int8 | LiteRT-LM 0.16.0 | CPU | 8,9 | 8 | 28,01 s |

Comprobación de corrección: coincidencia exacta a nivel de logits con la referencia PyTorch (8 pasos teacher-forced, max|logit diff| ≤ 3,9e-4, correlación 1,000000, top-1 idéntico); 8/8 en la comprobación de cordura de 8 preguntas; barrido de longitud de prompt de 12 a 200 tokens generando correctamente.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el fichero int8 ocupa 436 MB en disco y el runtime alcanza ~2,1 GB de pico en iPhone; el fp16 ocupa 723 MB y el runtime alcanza ~3,7 GB de pico en iPhone (el runtime CPU desempaqueta pesos fp16 a fp32 en RAM). El `_int8_gpu` ocupa 481 MB.
- GPU recomendadas: no se especifican GPU de escritorio en la información disponible. En móvil, el fichero `_int8_gpu` es el indicado para la ruta GPU; el fp16 no crea engine en el backend GPU de Mac de litert-lm 0.18.0 (el delegado WebGPU rechaza DEQUANTIZE, EMBEDDING_LOOKUP y tensores de rango 5).
- ¿Cabe en GPU de consumo? No disponible para GPU de escritorio. Cabe en smartphones (Galaxy S26, Pixel 8a) y en Raspberry Pi 5 con CPU.
- Opciones de despliegue: runtime LiteRT-LM (versiones verificadas 0.15.0, 0.16.1, 0.17.1, 0.18.0 y 0.19.2 en CPU de Mac; 0.16.0 y 0.16.1 en dispositivos móviles y Raspberry Pi). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput medidos: decode de 3,8 a 11,5 tok/s, prefill de 8 a 11 tok/s y TTFT de 21,39 a 30,43 s según dispositivo y fichero (ver tabla de benchmarks).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| litert-community/granite-4.0-h-350m | 350M | No disponible | Apache 2.0 | `.litertlm` | Hugging Face, 1190 descargas |
| litert-community/granite-4.0-h-1b | No disponible en la información proporcionada | No disponible | No disponible | `.litertlm` | Hugging Face (compañero del mismo autor) |
| ibm-granite/granite-4.0-h-350m | 350M | No disponible | No disponible | Pesos HF (safetensors, presumiblemente; no confirmado) | Hugging Face (modelo base) |

La información disponible solo permite comparar con la variante de 1B del mismo autor y con el modelo base de IBM. No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Reutilización de estado del engine: si se reutiliza un objeto `Engine` entre conversaciones cuyos prompts comparten un prefijo común creciente, una respuesta puede detenerse tras unos pocos tokens. En el fichero int8 aparece en longitudes con chat template de 33 a 37, y en `_int8_gpu` de 37 a 41; un `Engine` nuevo está limpio en todas las longitudes probadas. La causa es el runtime que arrastra estado recurrente entre conversaciones (LiteRT-LM#3165), no los pesos. El fichero fp16 lo tolera; el int8 no. Hay un fix en LiteRT-LM main desde el 2026-11-03 (commit e1f86b05) incluido en la release v0.20.0, aunque este modelo no se probó con Engine compartido en v0.20.0.
- El fichero fp16 no funciona en el backend GPU de Mac de litert-lm 0.18.0 (el delegado WebGPU rechaza DEQUANTIZE y EMBEDDING_LOOKUP con `Empty quantization params`, y tensores de rango 5); no se crea engine. Para GPU debe usarse `_int8_gpu`.
- En Galaxy S26 con LiteRT-LM 0.16.0, tanto fp16 como int8 fallaron en la ruta GPU con `engine_create_failed` (2026-08-24).
- El fichero no antepone token BOS, a diferencia del `generate()` por defecto de HF; esto coincide con el chat template oficial de Granite y, a escala 350M, un `<|end_of_text|>` antepuesto degrada mediblemente las respuestas greedy.
- LiteRT-LM 0.14 no puede enlazar los buffers de estado conv/SSM de Mamba2; se requiere 0.15 o superior.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; es esperable en un modelo de 350M, pero no se aportan datos.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no están disponibles en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones de la licencia del modelo base de IBM.
- Para producción: crear un `Engine` nuevo por conversación si se barajan prompts programáticamente; en móvil se recomienda int8 por su menor pico de RAM; el fp16 debe tratarse como variante de escritorio/calidad.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/granite-4.0-h-350m
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-350m
- Modelo compañero de 1B: https://huggingface.co/litert-community/granite-4.0-h-1b
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Release v0.20.0 de LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM/releases/tag/v0.20.0
- Issue LiteRT-LM#3165: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Commit del fix (e1f86b05): https://github.com/google-ai-edge/LiteRT-LM/commit/e1f86b05bf8a731331622a2622440e9f93d9a9f5
- Ficha edge-compat fp16: https://github.com/john-rocky/edge-compat/blob/main/cards/granite-4.0-h-350m-fp16/CARD.md
- Ficha edge-compat int8: https://github.com/john-rocky/edge-compat/blob/main/cards/granite-4.0-h-350m-int8/CARD.md
