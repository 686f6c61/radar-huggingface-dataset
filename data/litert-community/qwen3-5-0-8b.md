# litert-community/Qwen3.5-0.8B

## Resumen

Qwen3.5-0.8B en formato LiteRT-LM es la conversión del checkpoint text-only de Qwen/Qwen3.5-0.8B de Alibaba al formato `.litertlm`, empaquetada por la comunidad litert-community para inferencia on-device con el runtime LiteRT-LM de Google (el nuevo nombre de TensorFlow Lite). El modelo base emplea una arquitectura híbrida propietaria de Qwen3.5: bloques GatedDeltaNet (atención lineal con regla delta con compuerta) intercalados con un número reducido de bloques de atención completa con compuerta. En esta variante de 0,8B hay 18 capas de atención lineal y 6 de atención completa, lo que reduce drásticamente el crecimiento de memoria con la longitud de contexto.

La relevancia de este paquete es doble: es la primera conversión conocida de un Qwen3.5 a LiteRT y el primer híbrido gated-delta-net servido por el runtime LiteRT-LM publicado, además de ser el primero en ejecutar su scan de regla delta en una GPU móvil (desde la actualización del 13 de agosto de 2026). Está pensado para despliegue en dispositivos edge (smartphones, portátiles Apple Silicon) con latencias interactivas: 35,1 tok/s de decodificación en un Galaxy S26 y 126,2 tok/s en un Mac Studio M4 Max, según mediciones del autor.

El paquete distribuye varios ficheros cuantizados en int8 con distintos backends (CPU, GPU, y una variante VL que conserva la torre de visión), con tamaños entre 791 MB y 1,30 GB. El modelo base es multimodal, pero esta conversión conserva únicamente el decodificador de texto en las variantes no-VL.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: GatedDeltaNet (atención lineal con regla delta con compuerta) + atención completa con compuerta; 18 capas lineales + 6 de atención |
| Parámetros totales | 0,8B (según denominación del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens de presupuesto KV en las 6 capas de atención (las capas lineales usan estado recurrente de tamaño constante) |
| Tipos de cuantización | int8 dinámico en pesos (linears + embedding); proyecciones de decaimiento/compuerta en float en algunas variantes; variante `dynamic_wi8_afp32` (pesos int8, activaciones fp32); ViT en fp16 + adaptador int8 en la variante VL |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); pesos externos en la variante `dynamic_wi8_afp32` |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B es un transformer híbrido que combina bloques GatedDeltaNet con bloques de atención completa con compuerta. Los bloques lineales mantienen un estado convolucional y recurrente de tamaño constante por capa en lugar de una caché KV creciente, de modo que el uso de memoria permanece prácticamente plano respecto a la longitud de contexto; solo las 6 capas de atención conservan KV, con un presupuesto de 4096 tokens. El checkpoint original es multimodal y esta conversión descarta la torre de visión y las cabezas MTP, siguiendo el contrato de carga text-only `Qwen3_5ForCausalLM` del upstream.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la información proporcionada. La innovación técnica destacable del paquete es la reexpresión del kernel chunk de la regla delta con compuerta en una forma de rango ≤4 y sin padding que el delegado GPU de LiteRT ejecuta correctamente, lo que permite delegación completa del grafo a la GPU (verificado end-to-end en macOS e iPhone 17 Pro con Metal, con decodificación GPU ~2,8× la CPU). La ejecución en GPU requiere activaciones fp32, declaradas en el bundle.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat oficial de Qwen3.5.
- Razonamiento en modo thinking: la variante `dynamic_wi8_afp32` incluye la plantilla oficial `qwen3_5` con thinking y tool calling.
- Tool calling / function calling según la plantilla oficial de Qwen3.5 (disponible en la variante `dynamic_wi8_afp32`).
- Procesamiento de imagen en la variante `Qwen3.5-0.8B-VL_int8.litertlm`, que incorpora la torre ViT del checkpoint (fp16, entrada estática 512×512, seis firmas de prefill).
- Inferencia on-device con estado recurrente de tamaño constante, adecuada para contextos largos con memoria acotada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Ejecución en CPU y GPU (Metal en Apple, GPU delegada en Android con LiteRT-LM ≥ 0.19.0 para los ficheros int8).

## Casos de uso

- Asistentes conversacionales embebidos en aplicaciones Android: el paquete `.litertlm` se integra con el runtime LiteRT-LM (`com.google.ai.edge.litert:litert`) y permite conversaciones multi-turno en dispositivo con 35,1 tok/s de decodificación en un Galaxy S26, sin conexión a red.
- Autocompletado y generación de texto en editores móviles: la decodificación a 45,7 tok/s en iPhone 17 Pro y un TTFT de 1,68 s hacen viable la sugerencia interactiva en aplicaciones iOS nativas con Metal.
- Procesamiento de documentos con imagen en el dispositivo: la variante VL (1,30 GB, ViT a 512×512) permite extracción y descripción de contenido visual sin enviar datos a la nube, útil en sectores con requisitos de privacidad.
- Prototipado rápido de agentes con tool calling en portátiles Apple Silicon: la variante `dynamic_wi8_afp32` incluye la plantilla oficial de thinking y tool calling y se ejecuta en CPU y GPU con LiteRT-LM ≥ 0.20.0, con 126,2 tok/s de decodificación en un M4 Max.
- Clasificación y resumen de texto en pipelines de borde: el estado recurrente de tamaño constante evita el crecimiento de memoria con contextos largos, lo que simplifica el despliegue en dispositivos con RAM limitada.
- Evaluación comparativa de runtimes on-device: el paquete sirve como referencia para medir latencia, throughput y corrección entre backends CPU y GPU en Android, iOS y macOS, con métricas publicadas y reproducibles en el repositorio edge-compat.
- Filtrado y moderación de contenido local en aplicaciones de mensajería: la inferencia completamente local elimina la latencia de red y mantiene los datos del usuario en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Sí se han publicado mediciones de rendimiento en dispositivo del autor:

| Plataforma | Runtime / backend | Decodificación | Prefill | TTFT |
|---|---|---|---|---|
| Galaxy S26 | LiteRT-LM 0.16.0, GPU | 35,1 tok/s | 551 tok/s | 400 ms |
| iPhone 17 Pro | LiteRT-LM 0.16.0, GPU | 45,7 tok/s | 588 tok/s | 1,68 s |
| Mac Studio M4 Max | LiteRT-LM 0.16.0, GPU | 126,2 tok/s | 1891 tok/s | 154 ms |

Mediciones realizadas sobre el fichero VL antes de su recuantización del 12 de octubre de 2026 (sha256 `e3360b65…`), con las 25 703 operaciones delegadas en el caso del Galaxy S26. En iPhone 17 Pro con Metal, la decodificación en GPU rinde aproximadamente 2,8× la CPU.

## Requisitos de hardware

- VRAM/RAM estimada: entre 791 MB y 1,30 GB según el fichero; la variante `dynamic_wi8_afp32` usa pesos externos de 791 MB, la int8 de CPU 965 MB, la int8 de GPU 888 MB y la VL 1,30 GB.
- GPU recomendadas: GPU integradas de smartphones (Galaxy S26, iPhone 17 Pro con Metal), Apple Silicon (M4 Max verificado); no se especifican requisitos para A100, H100 o RTX 4090, ya que el objetivo es edge.
- Cabe en GPU de consumo: sí, en el sentido de que cabe en dispositivos móviles y en Apple Silicon; no se proporcionan datos para GPUs de escritorio dedicadas.
- Opciones de despliegue: runtime LiteRT-LM (CLI `litert-lm run` y bindings Android `com.google.ai.edge.litert:litert`); requiere litert-lm ≥ 0.15, con ficheros específicos para 0.19.x, 0.20.0 o posterior. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; TTFT entre 154 ms (M4 Max) y 1,68 s (iPhone 17 Pro).
- Nota de memoria: la ejecución en GPU requiere activaciones fp32, con el coste de memoria asociado que declara el bundle.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia, el propio paquete se compara con su modelo base:

| Modelo | Parámetros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| litert-community/Qwen3.5-0.8B | 0,8B | 4096 tokens KV (6 capas de atención) | `.litertlm` | Apache 2.0 | LiteRT-LM on-device |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | safetensors (presumible, no confirmado) | Apache 2.0 | Frameworks PyTorch |

No se dispone de datos de benchmarks que permitan comparar calidad con alternativas de la misma categoría.

## Limitaciones y advertencias

- Esta conversión es solo el decodificador de texto en las variantes no-VL; la torre de visión y las cabezas MTP del checkpoint original se descartan.
- El presupuesto de KV es de 4096 tokens en las 6 capas de atención; contextos más largos dependen del estado recurrente de las capas lineales y no se documenta su comportamiento más allá de ese límite.
- La ejecución en GPU requiere activaciones fp32, con coste de memoria adicional declarado por el autor.
- Dependencia estricta de versión del runtime: cada fichero está ligado a versiones concretas de LiteRT-LM (0.19.x, 0.20.0 o main); usar la combinación incorrecta produce errores.
- En Android, la ruta GPU requiere LiteRT-LM ≥ 0.19.0 para los ficheros int8; las builds que incorporan LiteRT #11565 rechazan el fichero `int8_gpu_composite_v0190` en GPU.
- Se reportó un fallo en el delegado GPU de LiteRT (issue #9272) que el kernel reescrito evita; puede afectar a otras conversiones con esa forma de operación.
- El marcador `` no estaba declarado como stop token hasta la corrección del 7 de agosto de 2026; versiones anteriores pueden filtrar el texto del marcador en la salida.
- No se dispone de información sobre sesgos, tasas de alucinación ni cobertura idiomática del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo base Qwen3.5.
- El repositorio ocupa 14,6 GB, muy por encima del tamaño de los ficheros individuales, por lo que conviene descargar solo el fichero necesario.
- No se han publicado evaluaciones de calidad (benchmarks académicos) para esta conversión; las métricas disponibles son exclusivamente de rendimiento en dispositivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Qwen3.5-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Issue LiteRT #9272: https://github.com/google-ai-edge/LiteRT/issues/9272
- Ficha de medición edge-compat: https://github.com/john-rocky/edge-compat/blob/main/cards/qwen35-0.8b-vl-int8/CARD.md
- Resultados de benchmark Android (tres runtimes): https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
