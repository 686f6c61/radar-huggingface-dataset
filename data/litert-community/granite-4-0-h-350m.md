# litert-community/granite-4.0-h-350m

## Resumen

Granite-4.0-h-350m es la variante más pequeña de la familia Granite 4.0 de IBM, un modelo de lenguaje de 350 millones de parámetros construido sobre una arquitectura híbrida que combina bloques Mamba2 (selective-scan) con bloques de atención con consultas agrupadas (GQA). Esta ficha concreta corresponde a la conversión del modelo original al formato LiteRT-LM (`.litertlm`), publicada por la comunidad `litert-community` para inferencia en dispositivo (*on-device*) mediante el runtime LiteRT-LM de Google.

El interés de esta versión no reside en el modelo base, sino en el empaquetado: ofrece tres ficheros optimizados para *edge* (fp16, int8 e int8 para GPU) que permiten ejecutar un LLM en teléfonos Android y en placas como Raspberry Pi 5 sin acceso a red. La arquitectura híbrida es clave aquí, porque los 28 bloques Mamba2 mantienen estado recurrente (conv + SSM) en lugar de una caché KV creciente, de modo que el consumo de memoria permanece prácticamente plano al aumentar el contexto; solo las 4 capas de atención conservan KV.

La relevancia actual es doble: por un lado, valida que un modelo de 350M con licencia Apache 2.0 puede desplegarse en hardware de consumo con latencias medibles; por otro, documenta con transparencia los problemas de integración del runtime (reutilización de estado entre conversaciones, limitaciones del delegado GPU), lo que resulta útil para quien evalúe LiteRT-LM en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 28 bloques Mamba2 (selective-scan) + 4 bloques de atención GQA |
| Parametros totales | 350M (modelo base); tamaño de repo 5,8 GB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | fp16 (float-casting en lineales y embedding, convs/SSM en fp32); int8 dinámico weight-only (lineales y embedding, convs/SSM en float); int8 GPU con activaciones fp32 declaradas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM): `granite-4.0-h-350m_fp16.litertlm` (723 MB), `granite-4.0-h-350m_int8.litertlm` (436 MB), `granite-4.0-h-350m_int8_gpu.litertlm` (481 MB) |

## Arquitectura y entrenamiento

El modelo base es Granite 4.0-h de IBM, con una arquitectura híbrida en la que 28 bloques Mamba2 se intercalan con 4 bloques de atención con consultas agrupadas. Los bloques Mamba2 transportan estado recurrente por capa (convolución y estado SSM) en vez de una caché KV que crece con el contexto; solo las cuatro capas de atención mantienen KV. El resultado es un consumo de memoria casi constante respecto a la longitud de secuencia, lo que explica su idoneidad para dispositivos con RAM limitada.

La conversión a LiteRT-LM enlaza los buffers de estado conv/SSM de Mamba2 mediante el *state binding* generalizado introducido en LiteRT-LM 0.15 (`ExecutorMetadata`); la versión 0.14 no puede enlazarlos. El fichero `_int8_gpu` reexporta los mismos pesos int8 con el *selective scan* reescrito como matmuls batched de rango ≤ 4 y con `prefer_activation_type = "fp32"` declarado, lo que permite ejecutar el grafo en GPU; es 45 MB mayor porque cada firma corta de prefill se rellena hasta un bloque completo de 256 tokens con una constante almacenada en lugar de una operación `PAD`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la documentación proporcionada. La verificación de la conversión sí está documentada: una exportación en coma flotante coincide con el modelo de referencia de Hugging Face en cada posición de decodificación (comparación teacher-forced de 8 pasos, max|logit diff| ≤ 3,9e-4 por posición, correlación 1,000000, top-1 idéntico en todas las posiciones), tanto en la ruta de prefill por bloques como en la de decodificación paso a paso. Ambos ficheros superan una prueba de cordura de 8 preguntas con 8/8 aciertos frente a la referencia.

## Capacidades

- Generación de texto en formato de chat, con plantilla oficial de Granite; el fichero no antepone token BOS, en línea con la plantilla oficial (anteponer `<|end_of_text|>` degrada mediblemente las respuestas greedy a esta escala).
- Razonamiento y respuesta a preguntas de propósito general, heredados del modelo base Granite 4.0-h.
- Inferencia *on-device* sin conexión de red, sobre CPU y GPU según el fichero elegido.
- Ejecución en Android (LiteRT-LM 0.16.0) y en Linux/ARM (Raspberry Pi 5), además de CPU de Mac.
- Compatibilidad verificada con LiteRT-LM 0.15.0, 0.16.1, 0.17.1, 0.18.0 y 0.19.2 en CPU de Mac para los tres ficheros; `_int8_gpu` también funciona en GPU de Mac con 0.19.2.
- Soporte de *tool calling*: la model card se interrumpe en la sección "Tool calls", por lo que no se puede confirmar el alcance ni el formato exacto en esta conversión.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan modos de *thinking*, visión ni audio para esta variante.

## Casos de uso

- Asistentes de texto sin conexión en aplicaciones Android: con el fichero int8 (436 MB) y un consumo de RAM de aproximadamente 2,1 GB en iPhone, el modelo puede gestionar conversaciones de chat locales sin enviar datos a la nube; encaja en apps de notas, correo o productividad que requieran privacidad por diseño.
- Clasificación y extracción de información en el dispositivo: resumen de mensajes, etiquetado de correos o extracción de campos de texto libre en un teléfono, aprovechando que el estado recurrente de Mamba2 mantiene la memoria plana y evita picos al procesar documentos largos.
- Automatización en Raspberry Pi 5: con 3,8 tok/s de decodificación y 8 tok/s de prefill en CPU a 4 hilos, es viable para tareas por lotes no interactivas, como generar descripciones de sensores, registrar eventos en lenguaje natural o responder consultas de una base de conocimiento local.
- Prototipado de pipelines de agentes en el borde: al ser un modelo pequeño con plantilla de chat, sirve como planificador ligero o enrutador de intenciones antes de delegar en un modelo mayor, reduciendo coste y latencia en la primera etapa.
- Evaluación de runtimes *edge*: útil como banco de pruebas para medir TTFT, prefill y decodificación de LiteRT-LM en distintos dispositivos (Galaxy S26, Pixel 8a, Raspberry Pi 5) antes de comprometerse con un modelo mayor de la misma familia, como `granite-4.0-h-1b`.
- Docencia y experimentación con arquitecturas híbridas: permite estudiar en hardware asequible el comportamiento de Mamba2 con estado recurrente frente a atención clásica, incluida la verificación de que la memoria no crece con el contexto.
- Generación de texto en dispositivos con GPU Mali/Adreno: usando `_int8_gpu` (481 MB) en lugar de fp16, que el delegado WebGPU rechaza por operaciones `DEQUANTIZE` y `EMBEDDING_LOOKUP` y tensores de rango 5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Sí se han publicado mediciones de rendimiento en dispositivo, recogidas en el proyecto edge-compat:

| Dispositivo | Fichero | Runtime | Backend | Decode | Prefill | TTFT |
|---|---|---|---|---|---|---|
| Galaxy S26 | fp16 | LiteRT-LM 0.16.0 | GPU | No ejecutado (`engine_create_failed`) | — | — |
| Galaxy S26 | fp16 | LiteRT-LM 0.16.0 | CPU | 9,5 tok/s | 9 tok/s | 25,05 s |
| Raspberry Pi 5 (4 hilos) | fp16 | LiteRT-LM 0.16.1 | CPU | 3,8 tok/s | 8 tok/s | 30,43 s |
| Galaxy S26 | int8 | LiteRT-LM 0.16.0 | GPU | No ejecutado (`engine_create_failed`) | — | — |
| Galaxy S26 | int8 | LiteRT-LM 0.16.0 | CPU | 11,5 tok/s | 11 tok/s | 21,39 s |
| Pixel 8a | int8 | LiteRT-LM 0.16.0 | CPU | 8,9 tok/s | 8 tok/s | 28,01 s |

## Requisitos de hardware

- VRAM/RAM estimada: el fichero int8 ocupa 436 MB y el runtime alcanza un pico de aproximadamente 2,1 GB en iPhone; el fp16 ocupa 723 MB y el runtime lo descomprime a fp32 en RAM, con un pico de aproximadamente 3,7 GB en iPhone. El `_int8_gpu` ocupa 481 MB.
- GPU recomendadas: en Mac, el fichero `_int8_gpu` funciona con LiteRT-LM 0.19.2; el fp16 es solo CPU en el backend GPU de Mac con 0.18.0. En Android, el delegado GPU rechazó el fichero fp16 en Galaxy S26 con LiteRT-LM 0.16.0.
- ¿Cabe en GPU de consumo? No hay datos de ejecución en GPU dedicada (RTX 4090, etc.). En el ámbito *edge*, sí cabe en teléfonos de gama alta y en Raspberry Pi 5; en Mac funciona en CPU.
- Opciones de despliegue: exclusivamente el runtime LiteRT-LM (versiones 0.15.0, 0.16.1, 0.17.1, 0.18.0 y 0.19.2 verificadas en CPU de Mac). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario `.litertlm`.
- Latencia y throughput: ver tabla de benchmarks. El TTFT es alto para uso interactivo (21-30 s en los dispositivos medidos), mientras que la decodificación se mantiene entre 3,8 y 11,5 tok/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| litert-community/granite-4.0-h-350m | 350M | No disponible | `.litertlm` (fp16, int8, int8 GPU) | Apache 2.0 | Hugging Face, 1189 descargas |
| litert-community/granite-4.0-h-1b | 1B (no confirmado en la información) | No disponible | `.litertlm` | Apache 2.0 (presumible, no confirmado) | Hugging Face |
| ibm-granite/granite-4.0-h-350m | 350M | No disponible | Pesos originales (PyTorch/safetensors, no confirmado) | Apache 2.0 | Hugging Face |

La comparativa se limita a las variantes de la misma familia documentadas en la información disponible; no se dispone de datos de benchmarks que permitan comparar calidad frente a alternativas de otros fabricantes.

## Limitaciones y advertencias

- Reutilización de estado del motor: si se reutiliza un objeto `Engine` entre conversaciones cuyos prompts comparten un prefijo común creciente, una respuesta puede cortarse a los pocos tokens. En el fichero int8 ocurre con longitudes de plantilla de chat de 33 a 37; en `_int8_gpu`, de 37 a 41. La causa es que el runtime arrastra estado recurrente entre conversaciones (LiteRT-LM#3165), no los pesos. Un `Engine` nuevo por conversación funciona correctamente en todas las longitudes probadas. Hay un arreglo en la rama principal de LiteRT-LM desde el 3 de noviembre de 2026 (commit e1f86b05), pero ninguna versión publicada lo incluye todavía (v0.19.1 no lo lleva).
- GPU en Android: el fichero fp16 y el int8 original fallaron al crear el motor en Galaxy S26 con LiteRT-LM 0.16.0. Para GPU debe usarse `_int8_gpu`.
- GPU en Mac: el fichero fp16 no es compatible con el backend GPU de litert-lm 0.18.0, porque el delegado WebGPU rechaza `DEQUANTIZE`, `EMBEDDING_LOOKUP` y tensores de rango 5.
- Token BOS: el fichero no antepone BOS, a diferencia del `generate()` de Hugging Face. Anteponer `<|end_of_text|>` degrada las respuestas greedy a esta escala.
- Idiomas soportados: no documentados; no se puede garantizar calidad fuera del inglés.
- Sesgos y alucinaciones: no se documentan evaluaciones específicas para esta conversión; a 350M de parámetros, la tasa de alucinación y la fidelidad factual son limitadas por capacidad, no solo por cuantización.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base y del runtime LiteRT-LM por separado.
- Contexto máximo: no disponible; el diseño híbrido reduce el coste de memoria, pero no se especifica la ventana soportada.
- Tool calling: la model card se interrumpe en esa sección, por lo que no se puede confirmar su funcionamiento en esta conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/granite-4.0-h-350m
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-350m
- Variante de 1B de la misma familia: https://huggingface.co/litert-community/granite-4.0-h-1b
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Issue de reutilización de estado: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Commit con el arreglo (rama principal): https://github.com/google-ai-edge/LiteRT-LM/commit/e1f86b05bf8a731331622a2622440e9f93d9a9f5
- Ficha de rendimiento fp16 en edge-compat: https://github.com/john-rocky/edge-compat/blob/main/cards/granite-4.0-h-350m-fp16/CARD.md
- Ficha de rendimiento int8 en edge-compat: https://github.com/john-rocky/edge-compat/blob/main/cards/granite-4.0-h-350m-int8/CARD.md
