# litert-community/LFM2.5-1.2B-JP

## Resumen

LFM2.5-1.2B-JP es un modelo de lenguaje de 1.200 millones de parámetros desarrollado por Liquid AI y optimizado específicamente para conversación en japonés. Se trata de la variante japonesa de su arquitectura insignia híbrida conv-attention, publicada en Hugging Face bajo la licencia LFM Open License v1.0. El modelo que documenta esta ficha es la conversión realizada por la comunidad litert-community al formato `.litertlm` para su ejecución en dispositivo mediante LiteRT-LM, el runtime on-device de Google (anteriormente TensorFlow Lite).

La relevancia de esta ficha reside en el formato: no es el checkpoint original de PyTorch, sino una cuantización empaquetada para inferencia local en CPU y GPU de dispositivos móviles y placas embebidas, con cuatro variantes (int8, int4, int8_gpu e int4_gpu) y métricas medidas en hardware real (Galaxy S26, Raspberry Pi 5, Mac). El contexto máximo del KV cache en este empaquetado es de 4.096 tokens, y el repositorio ocupa 13,9 GB en total aunque cada fichero individual pesa entre 736 MB y 1,24 GB.

El modelo resuelve el caso de uso de asistentes conversacionales en japonés sin conexión de red, con latencias de primer token de 450 ms en un smartphone de gama alta (int8, CPU) y velocidades de decodificación de 41,3 tok/s en el mismo dispositivo. Es, por tanto, una pieza para despliegues edge, no para servidores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrida conv-attention (LFM2.5, "hybrid conv/attention", familia Liquid) |
| Parámetros totales | 1,2 mil millones (1.2B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens máximo de KV cache en este empaquetado LiteRT-LM |
| Tipos de cuantización | int8 dinámico (linears + embedding, convs en float); int4 blockwise-32 + OCTAV en linears, embedding int8, convs en float; variantes `_gpu` con las mismas recetas reexportadas para GPU |
| Idiomas soportados | japonés (ja), inglés (en) |
| Licencia | LFM Open License v1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en formato original de LiquidAI no especificado en la información disponible |
| Tamaño de ficheros | int8: 1,24 GB; int4: 736 MB (cada uno con su variante `_gpu`) |
| Runtime requerido | litert-lm ≥ 0.15 (el tipo de modelo `lfm2` del reempaquetado de 2026-10-13 requiere 0.15) |
| Backend | CPU para todos los ficheros; GPU con litert-lm ≥ 0.16.0 para `_int4_gpu` (OpenCL en Android, Metal en iOS, macOS) y `_int8_gpu` (OpenCL en Android, macOS) |
| Plantilla de chat | incluida en el paquete, con soporte de tool calling |

## Arquitectura y entrenamiento

La información disponible confirma que el modelo base es LiquidAI/LFM2.5-1.2B-JP, descrito como la variante de chat optimizada para japonés del modelo insignia de arquitectura híbrida conv-attention de Liquid AI. La arquitectura combina capas convolucionales y de atención, lo que explica que las recetas de cuantización traten de forma diferenciada las convoluciones (mantenidas en float) y las capas lineales (cuantizadas). No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

Sobre el proceso de conversión sí hay datos concretos: la conversión se realizó con `litert_torch.convert` (el antiguo `ai-edge-torch`), y una conversión de un modelo PyTorch sin modificar coincidió con el original hasta 4e-7 en un Galaxy S26 con LiteRT 2.2.0 sobre Android 16 (medición del 2026-09-05). El 2026-08-04 los ficheros `.litertlm` se actualizaron in situ para añadir la sección `ExecutorMetadata`, necesaria en litert-lm ≥ 0.15 para enlazar los buffers de estado híbridos conv/attention; sin ella, la versión 0.15 falla en inferencia con `missing some output TensorBuffers`. Los pesos y el grafo son idénticos byte a byte al lanzamiento original. El 2026-09-21 se actualizó la plantilla de chat para aceptar la forma de content-parts de la versión 0.18, sin cambios en pesos, tokenizador ni metadatos.

Una decisión técnica destacable es que la cuantización int8 afecta solo a las capas lineales: cuantizar las convoluciones de este tune japonés cuesta unos 9 puntos porcentuales, a diferencia del modelo hermano Instruct, donde la cuantización int8 de las convoluciones sale gratis.

## Capacidades

- Generación de texto conversacional en japonés e inglés, con ajuste específico para conversación natural en japonés.
- Razonamiento aritmético básico: la model card reporta GSM8K en inglés (0-shot CoT, greedy) como métrica de fidelidad de cuantización.
- Tool calling / function calling: la plantilla de chat incluida soporta llamadas a herramientas.
- Ejecución totalmente on-device, sin conexión de red, en CPU de smartphone, Raspberry Pi 5 y portátiles (el autor afirma ~100 tok/s en CPU de portátil, sin especificar hardware exacto).
- Ejecución en GPU móvil y de escritorio en las variantes `_gpu`: OpenCL en Android, Metal en iOS y macOS.
- Integración con AI Edge Gallery de Google mediante importación directa del fichero `.litertlm`.
- No se mencionan capacidades de visión, audio, thinking mode ni agentes multi-paso en la información disponible.

## Casos de uso

- Asistente conversacional japonés sin conexión en Android: se importa el fichero `LFM2.5-1.2B-JP_int8.litertlm` (1,24 GB) en AI Edge Gallery y se ejecuta en CPU con 41,3 tok/s de decodificación y 450 ms hasta el primer token en un Galaxy S26, suficiente para chat interactivo sin red.
- Chat en dispositivos iOS con Metal: la variante `_int4_gpu` (736 MB) corre en iOS con Metal, con la precaución de fijar `maxNumTokens` a 1024, ya que un valor distinto rompe la creación del engine.
- Asistente embebido en Raspberry Pi 5: el fichero int8 ofrece 7,0 tok/s de decodificación y 75 tok/s de prefill con 4 hilos de CPU, y el int4 baja a 9,2 tok/s de decodificación con 54 tok/s de prefill; útil para kioscos, domótica local o terminales de atención sin conectividad.
- Atención al cliente en japonés con contexto multi-turno: la ventana de 4.096 tokens del KV cache permite conversaciones de varios turnos con historial, siempre creando un Engine nuevo por conversación (véase limitaciones).
- Automatización con herramientas en local: la plantilla de chat con soporte de tool calling permite construir asistentes que invoquen funciones locales (calendario, ficheros, APIs internas) en un dispositivo sin enviar datos a la nube, relevante por privacidad.
- Evaluación y prototipado de cuantización en edge: los cuatro ficheros con sus recetas documentadas (int8 dinámico, int4 blockwise-32 con OCTAV) permiten medir el impacto de cada esquema sobre calidad y latencia antes de fijar una configuración de producción.
- Despliegue en portátiles como asistente de escritura en japonés: la ejecución en CPU a ~100 tok/s (cifra del autor, hardware no especificado) habilita correctores o generadores de texto locales.

## Benchmarks y rendimiento

GSM8K en inglés, greedy, 0-shot CoT, max-tokens 1024, n=100, mismo harness para todas las filas:

| Fichero | Receta | Tamaño | GSM8K (n=100) |
|---|---|---|---|
| PyTorch bf16 (referencia) | bf16 | no disponible | 63% |
| `LFM2.5-1.2B-JP_int8.litertlm` | int8 dinámico (linears + embedding; convs float) | 1,24 GB | 65% |
| `LFM2.5-1.2B-JP_int4.litertlm` | int4 blockwise-32 + OCTAV linears, embedding int8, convs float | 736 MB | 55% |
| `LFM2.5-1.2B-JP_int4_gpu.litertlm` | misma receta int4 reexportada para GPU | 736 MB | igual que int4 |
| `LFM2.5-1.2B-JP_int8_gpu.litertlm` | misma receta y pesos int8 reexportados para GPU | 1,24 GB | 65% (medido cara a cara) |

Mediciones en dispositivo:

| Dispositivo | Runtime | Backend | Fichero | Decode | Prefill | TTFT |
|---|---|---|---|---|---|---|
| Galaxy S26 | LiteRT-LM 0.16.0 | GPU | int4 | no ejecutó: `engine_create_failed` (2026-08-24) | — | — |
| Galaxy S26 | LiteRT-LM 0.16.0 | CPU | int8 | 41,3 tok/s | 485 tok/s | 450 ms (2026-09-05) |
| Raspberry Pi 5 (4 hilos) | LiteRT-LM 0.16.1 | CPU | int4 | 9,2 tok/s | 54 tok/s | 4,83 s (2026-09-01) |
| Raspberry Pi 5 (4 hilos) | LiteRT-LM 0.16.1 | CPU | int8 | 7,0 tok/s | 75 tok/s | 3,56 s (2026-09-01) |

El autor advierte que GSM8K en inglés subestima un ajuste optimizado para japonés y que la métrica se reporta por transparencia de fidelidad de cuantización, no como cifra principal del modelo. Ambos ficheros pasan una verificación de cordura de 8 preguntas (7/8, cero degenerados) y la calidad de conversación en japonés se verificó por inspección.

## Requisitos de hardware

- VRAM/RAM: no aplica VRAM en el sentido de GPU de servidor; el modelo está pensado para memoria unificada o RAM de dispositivo. Los ficheros ocupan 736 MB (int4) y 1,24 GB (int8) en disco, más el estado del KV cache hasta 4.096 tokens.
- GPU recomendadas: no se listan A100, H100 ni RTX 4090 en la información disponible; el backend GPU soportado es OpenCL (Android, macOS) y Metal (iOS), no CUDA.
- ¿Cabe en GPU de consumo? El modelo está diseñado para móviles y placas embebidas; en el hardware medido (Galaxy S26, Raspberry Pi 5) funciona en CPU. No hay datos de ejecución en GPUs de escritorio NVIDIA.
- Opciones de despliegue: LiteRT-LM (runtime oficial, requiere ≥ 0.15; GPU desde ≥ 0.16.0), AI Edge Gallery de Google para importar el `.litertlm`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible; el formato `.litertlm` no es GGUF.
- Latencia y throughput medidos: ver tabla de benchmarks. En Galaxy S26 con CPU e int8: TTFT 450 ms, prefill 485 tok/s, decode 41,3 tok/s. En Raspberry Pi 5 con 4 hilos: int8 con TTFT 3,56 s y decode 7,0 tok/s; int4 con TTFT 4,83 s y decode 9,2 tok/s.
- En iOS, fijar `maxNumTokens` a 1024; un valor distinto rompe la creación del engine.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|---|
| litert-community/LFM2.5-1.2B-JP (esta ficha) | 1,2B | 4.096 (KV cache) | ja, en | LFM Open License v1.0 | `.litertlm`, LiteRT-LM | GSM8K int8 65%, int4 55% |
| LiquidAI/LFM2.5-1.2B-JP | 1,2B | no disponible | ja, en | LFM Open License v1.0 | pesos originales (formato no especificado) | Modelo base del anterior |
| litert-community/LFM2.5-1.2B-Instruct | 1,2B | no disponible | no disponible | no disponible | `.litertlm`, LiteRT-LM | Modelo hermano (Instruct); en él la cuantización int8 de convoluciones no degrada |
| litert-community/Qwen3-4B | 4B | no disponible | no disponible | no disponible | `.litertlm`, LiteRT-LM | Alternativa de mayor tamaño en el mismo ecosistema LiteRT; sin datos comparativos de rendimiento en la información disponible |

No se dispone de resultados de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, formato, licencia e idiomas.

## Limitaciones y advertencias

- Contexto limitado a 4.096 tokens de KV cache en este empaquetado, muy por debajo de los modelos de servidor; insuficiente para documentos largos o conversaciones extensas.
- Un Engine por conversación: en litert-lm 0.18.0, el runtime inicia una nueva Conversation sobre un Engine que ya ejecutó otra reutilizando los tokens de prompt compartidos sin reiniciar el estado de convolución corta (informe abierto del autor, issue #3165). En una prueba de tres preguntas cortas las respuestas coincidieron, pero el autor advierte que eso no dice nada sobre conversaciones largas. El primer diálogo de un Engine no se ve afectado. Existe un fix en LiteRT-LM main desde el 2026-11-03 (commit e1f86b05, continuación del PR #3945).
- La cuantización int4 degrada GSM8K de 63% (bf16) a 55%, 10 puntos por debajo del int8 (65%). Para tareas de razonamiento, preferir int8 si el espacio lo permite.
- Cuantizar las convoluciones de este tune cuesta ~9 puntos, por lo que las recetas mantienen las convs en float; no se debe reempaquetar a la ligera.
- En Galaxy S26 con GPU y LiteRT-LM 0.16.0, el fichero int4 no ejecutó (`engine_create_failed`, 2026-08-24); la variante `_int8_gpu` no se probó en iOS.
- En iOS es obligatorio fijar `maxNumTokens` a 1024; otro valor rompe la creación del engine.
- Licencia LFM Open License v1.0 (etiquetada `other`): es necesario revisar el texto de la licencia antes de uso comercial; la información disponible no detalla sus restricciones.
- Riesgo de alucinación y sesgos: no hay datos publicados en la información disponible sobre evaluación de sesgos, toxicidad o tasas de alucinación.
- Idiomas limitados a japonés e inglés; el rendimiento en castellano no está documentado y no debería asumirse.
- El modelo está pensado para edge: no hay soporte CUDA ni datos de despliegue en vLLM, TGI, llama.cpp u Ollama, lo que limita su uso en infraestructura de servidor convencional.
- La model card advierte que GSM8K en inglés no es la métrica principal de un modelo optimizado para japonés; la calidad en japonés se verificó por inspección, no con un benchmark publicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/LFM2.5-1.2B-JP
- README del modelo: https://huggingface.co/litert-community/LFM2.5-1.2B-JP/blob/main/README.md
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-JP
- Modelo hermano Instruct: https://huggingface.co/litert-community/LFM2.5-1.2B-Instruct
- Organización litert-community: https://huggingface.co/litert-community
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Informe del issue de reutilización de estado: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Fix en LiteRT-LM main: https://github.com/google-ai-edge/LiteRT-LM/commit/e1f86b05bf8a731331622a2622440e9f93d9a9f5
- PR relacionado: https://github.com/google-ai-edge/LiteRT-LM/pull/3945
- Ficha edge-compat int4: https://github.com/john-rocky/edge-compat/blob/main/cards/lfm2.5-1.2b-jp-int4/CARD.md
- Ficha edge-compat int8: https://github.com/john-rocky/edge-compat/blob/main/cards/lfm2.5-1.2b-jp-int8/CARD.md
- Benchmark de precisión de conversión LiteRT: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
