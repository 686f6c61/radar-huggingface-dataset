# litert-community/granite-4.0-h-350m

## Resumen

Granite-4.0-H-350M es un modelo de lenguaje instructivo de 350 millones de parámetros desarrollado originalmente por IBM, aquí distribuido en formato LiteRT-LM (`.litertlm`) por la comunidad `litert-community` para inferencia en dispositivo (on-device) con el runtime LiteRT-LM de Google. El modelo base emplea una arquitectura híbrida: 28 bloques Mamba2 (selective-scan) intercalados con 4 bloques de atención con grouped-query attention (GQA). Esta combinación mantiene la memoria casi plana respecto a la longitud de contexto, ya que solo las 4 capas de atención conservan KV cache y el resto lleva estado recurrente conv/SSM por capa.

La conversión a LiteRT-LM resuelve el problema de ejecutar un modelo con estado recurrente Mamba2 fuera de un framework de entrenamiento: requiere litert-lm ≥ 0.15 porque los buffers de estado conv/SSM se enlazan mediante el mecanismo de *state binding* generalizado (`ExecutorMetadata`) introducido en esa versión. Se ofrecen tres variantes (fp16, int8 e int8 optimizada para GPU) con pesos ya cuantizados y verificados a nivel de logits contra la referencia en PyTorch.

Es relevante ahora porque permite desplegar generación de texto con tool calling en móviles y placas de bajo consumo (se reportan 9,5–11,5 tok/s de decodificación en CPU de Galaxy S26 y 3,8 tok/s en Raspberry Pi 5), con licencia Apache 2.0 y sin dependencia de servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 28 bloques Mamba2 (selective-scan) + 4 bloques de atención con GQA |
| Parámetros totales | 350 M (modelo base `ibm-granite/granite-4.0-h-350m`) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp16; int8 dinámica weight-only (linears + embedding; convs/SSM en flotante); int8 reexportada para GPU con activaciones fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); requiere litert-lm ≥ 0.15 |

Tamaños de los artefactos publicados:

| Fichero | Receta | Tamaño |
|---|---|---|
| `granite-4.0-h-350m_fp16.litertlm` | fp16 en linears y embedding; convs/SSM en fp32 | 723 MB |
| `granite-4.0-h-350m_int8.litertlm` | int8 dinámica weight-only en linears y embedding; convs/SSM en flotante | 436 MB |
| `granite-4.0-h-350m_int8_gpu.litertlm` | mismos pesos int8, reexportados con selective scan de rango ≤4 y `prefer_activation_type = "fp32"` | 481 MB |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido en el que la mayor parte de las capas son Mamba2, un modelo de espacio de estados con selective scan. Cada bloque Mamba2 mantiene estado recurrente (ventana convolucional y estado SSM) en lugar de una KV cache que crece con el contexto; solo las 4 capas de atención agregan claves y valores. El resultado práctico es un consumo de memoria casi constante respecto a la longitud de la secuencia, lo que abarata el despliegue en dispositivos con RAM limitada.

El modelo instructivo original fue afinado por IBM a partir de `Granite-4.0-H-350M-Base` usando una combinación de datasets de instrucciones de código abierto con licencia permisiva y datasets sintéticos generados internamente. La model card del autor de la conversión no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron RLHF o DPO; esos datos deben consultarse en la ficha del modelo base de IBM. La innovación técnica de esta distribución es la exportación del grafo con estado recurrente: la variante `_int8_gpu` reescribe el selective scan como matmuls batched de rango ≤4 y declara activaciones fp32, lo que permite que el grafo se ejecute en GPU (el fichero es 45 MB mayor porque rellena cada firma corta de prefill hasta un chunk completo de 256 tokens con una constante almacenada en lugar de una operación `PAD`).

La conversión está verificada a nivel de logits: una exportación en flotante coincide exactamente con el modelo de Hugging Face en cada posición de decodificación (comparación teacher-forced de 8 pasos, max|diff| ≤ 3,9e-4, correlación 1,000000, top-1 idéntico en todas las posiciones), tanto en la ruta de prefill por chunks como en la de decodificación paso a paso. Ambos ficheros superan una batería de 8 preguntas con 8/8 aciertos, igualando la referencia. El bundle no antepone token BOS, en línea con la plantilla de chat oficial de Granite; a esta escala, anteponer `<|end_of_text|>` degrada mediblemente las respuestas greedy.

## Capacidades

- Generación de texto instructiva y conversacional multirretorno, heredada del ajuste instructivo de IBM.
- Tool calling / function calling: la model card menciona soporte de llamadas a herramientas en litert-lm 0.18.0 tras el reempaquetado del 14 de octubre de 2026 (cambio solo de metadatos).
- Ejecución en dispositivo sin red: inferencia local en Android, iOS/macOS y Linux ARM mediante LiteRT-LM.
- Memoria casi plana con la longitud de contexto gracias a las capas Mamba2, con KV cache limitada a las 4 capas de atención.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes de texto embebidos en aplicaciones Android: el fichero int8 (436 MB) se ejecuta en CPU de un Galaxy S26 a 11,5 tok/s de decodificación con un TTFT de 21,39 s, suficiente para respuestas cortas generadas localmente sin enviar datos del usuario a un servidor.
- Autocompletado y resumen de notas en el propio dispositivo: con memoria casi constante respecto al contexto por la arquitectura Mamba2, se puede procesar un documento largo sin que el consumo de RAM crezca de forma proporcional.
- Automatización doméstica sobre Raspberry Pi 5: el int8 corre en CPU con 4 hilos a 3,8 tok/s de decodificación y 8 tok/s de prefill, válido para clasificación de intenciones y respuestas de una frase en un asistente de voz local.
- Enrutado de herramientas en agentes ligeros: el soporte de tool calling permite decidir qué función invocar (por ejemplo, consultar una API o encender un dispositivo) sin depender de un modelo remoto.
- Filtrado y etiquetado de texto en el borde: clasificación de mensajes, detección de spam o extracción de entidades en un pipeline local con latencia aceptable para lotes pequeños.
- Prototipado de aplicaciones LiteRT-LM: sirve como modelo de referencia para validar el runtime, la gestión de estado recurrente y el rendimiento antes de migrar a `granite-4.0-h-1b` o modelos mayores de la misma familia.
- Generación de texto en macOS con backend CPU: el fichero fp16 es la variante de referencia fiel para escritorio; el int8 GPU es la opción cuando se necesita aceleración gráfica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos medidos son de rendimiento en dispositivo, recogidos por `edge-compat`:

| Dispositivo | Fichero | Runtime / backend | Decode (tok/s) | Prefill (tok/s) | TTFT |
|---|---|---|---|---|---|
| Galaxy S26 | fp16 | LiteRT-LM 0.16.0 · GPU | no ejecuta (`engine_create_failed`) | — | — |
| Galaxy S26 | fp16 | LiteRT-LM 0.16.0 · CPU | 9,5 | 9 | 25,05 s |
| Raspberry Pi 5 (4 hilos) | fp16 | LiteRT-LM 0.16.1 · CPU | 3,8 | 8 | 30,43 s |
| Galaxy S26 | int8 | LiteRT-LM 0.16.0 · GPU | no ejecuta (`engine_create_failed`) | — | — |
| Galaxy S26 | int8 | LiteRT-LM 0.16.0 · CPU | 11,5 | 11 | 21,39 s |
| Pixel 8a | int8 | LiteRT-LM 0.16.0 · CPU | 8,9 | 8 | 28,01 s |

## Requisitos de hardware

- RAM: en CPU, el runtime desempaqueta los pesos fp16 a fp32, con un pico de ~3,7 GB en iPhone frente a ~2,1 GB con int8; por eso se recomienda int8 en móviles.
- Almacenamiento: 436 MB (int8), 481 MB (int8 GPU) y 723 MB (fp16).
- GPU de escritorio: no se reportan requisitos de VRAM para A100, H100 o RTX 4090; el modelo está pensado para edge y no se distribuye en formatos para servidor.
- GPU integradas y móviles: el fichero `_int8_gpu` es el único apto para GPU; el fp16 falla en el backend GPU de macOS con litert-lm 0.18.0 porque el delegado WebGPU rechaza DEQUANTIZE, EMBEDDING_LOOKUP (`Empty quantization params`) y tensores de rango 5, y en Android con 0.16.0 el GPU del Galaxy S26 también lo rechaza.
- Despliegue: exclusivamente mediante LiteRT-LM (≥ 0.15). No se proporcionan pesos en safetensors ni GGUF en este repositorio, por lo que vLLM, llama.cpp, Ollama y TGI no son aplicables a estos artefactos.
- Latencia: TTFT de 21–30 s en CPU móvil y ARM, según la tabla anterior; el throughput de decodificación se sitúa entre 3,8 y 11,5 tok/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| `litert-community/granite-4.0-h-350m` | 350 M | Híbrida Mamba2 + GQA | no disponible | `.litertlm` | Apache 2.0 |
| `litert-community/granite-4.0-h-1b` | 1 B (aprox., según denominación) | Híbrida Mamba2 + GQA (familia Granite 4.0-h) | no disponible | `.litertlm` | no disponible en la información proporcionada |
| `ibm-granite/granite-4.0-h-350m` | 350 M | Híbrida Mamba2 + GQA | no disponible | safetensors (Hugging Face) | Apache 2.0 |

La comparación de rendimiento frente a alternativas no está disponible: no hay benchmarks publicados en la información proporcionada.

## Limitaciones y advertencias

- Reutilización de estado del motor: si se reutiliza un mismo objeto `Engine` entre conversaciones cuyos prompts comparten un prefijo común creciente, la respuesta puede cortarse a los pocos tokens. Ocurre en el fichero int8 con prompts con plantilla de chat de longitud 33–37 y en `_int8_gpu` en 37–41; un `Engine` nuevo está limpio en todas las longitudes probadas. La causa es el runtime, que arrastra estado recurrente entre conversaciones (LiteRT-LM#3165), no los pesos. Hay un arreglo en LiteRT-LM main desde el 3 de noviembre de 2026 (commit `e1f86b05`), pero ninguna release lo incluye todavía (v0.19.1 no lo lleva).
- El fichero fp16 no funciona en el backend GPU de macOS con litert-lm 0.18.0 y tampoco en el GPU del Galaxy S26 con 0.16.0; para GPU debe usarse `_int8_gpu`.
- El bundle no antepone BOS, a diferencia del `generate()` por defecto de Hugging Face; anteponer `<|end_of_text|>` degrada las respuestas greedy a esta escala.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; a 350 M de parámetros es esperable una fiabilidad limitada en razonamiento complejo y conocimiento factual, aunque no se aportan evaluaciones al respecto.
- Idiomas soportados y cobertura multilingüe: no disponibles.
- Longitud de contexto máxima: no disponible.
- Licencia Apache 2.0, permisiva para uso comercial; conviene verificar igualmente las condiciones del modelo base de IBM.
- Para producción en servidor no hay pesos en safetensors ni GGUF en este repositorio; el uso previsto es edge con LiteRT-LM.

## Enlaces

- Repositorio LiteRT-LM del modelo: https://huggingface.co/litert-community/granite-4.0-h-350m
- Modelo base de IBM: https://huggingface.co/ibm-granite/granite-4.0-h-350m
- Organización LiteRT Community: https://huggingface.co/litert-community
- Modelo hermano de 1B: https://huggingface.co/litert-community/granite-4.0-h-1b
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Ficha de rendimiento fp16 en edge-compat: https://github.com/john-rocky/edge-compat/blob/main/cards/granite-4.0-h-350m-fp16/CARD.md
- Ficha de rendimiento int8 en edge-compat: https://github.com/john-rocky/edge-compat/blob/main/cards/granite-4.0-h-350m-int8/CARD.md
- Issue de reutilización de estado: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Pull request relacionado: https://github.com/google-ai-edge/LiteRT-LM/pull/3945
- Commit con el arreglo: https://github.com/google-ai-edge/LiteRT-LM/commit/e1f86b05bf8a731331622a2622440e9f93d9a9f5
