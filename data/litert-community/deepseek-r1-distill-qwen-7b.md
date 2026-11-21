# litert-community/DeepSeek-R1-Distill-Qwen-7B

## Resumen

DeepSeek-R1-Distill-Qwen-7B en formato LiteRT-LM es una conversión del modelo de razonamiento destilado de DeepSeek, empaquetada por la comunidad `litert-community` para inferencia on-device mediante el runtime LiteRT de Google (el antiguo TensorFlow Lite). El modelo base, desarrollado por DeepSeek, destila las capacidades de razonamiento de DeepSeek-R1 en una base Qwen2.5 de 7.000 millones de parámetros, lo que permite obtener cadenas de pensamiento explícitas en un tamaño manejable.

La aportación de esta ficha no es un modelo nuevo, sino un artefacto de despliegue: un bundle `.litertlm` de 4,53 GB con pesos cuantizados a int4 por bloques de 32 y clipping óptimo OCTAV, embeddings en INT8 y una caché KV de 4096 tokens. Está pensado para ejecutarse en GPU móviles, CPU de escritorio y navegador vía WebGPU, con métricas medidas en dispositivos reales (Galaxy S26, Mac Studio M4 Max y Raspberry Pi 5).

Su relevancia actual radica en que demuestra que un modelo de razonamiento de 7B puede correr a velocidad interactiva en hardware de consumo y en teléfonos de gama alta, algo poco habitual en modelos que emiten cadenas de pensamiento largas. La licencia MIT del artefacto y la Apache-2.0 de la base Qwen2.5 facilitan su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen2.5), destilado de DeepSeek-R1 |
| Parámetros totales | 7B (aproximado, según modelo base) |
| Longitud de contexto | 4096 tokens (caché KV del bundle) |
| Tipos de cuantización | Pesos int4 blockwise (bloque 32) + OCTAV optimal-clipping, simétrico; embeddings INT8 |
| Idiomas soportados | no disponible |
| Licencia | MIT (artefacto LiteRT-LM); base Qwen2.5 Apache-2.0 |
| Formato de pesos | `.litertlm` (bundle LiteRT-LM, ~4,53 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 7B construido sobre Qwen2.5 y destilado a partir de DeepSeek-R1, de modo que hereda el comportamiento de razonamiento explícito: el asistente abre un bloque `<think>`, razona paso a paso y emite la respuesta final, frecuentemente dentro de `\boxed{}`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO en la información proporcionada.

La conversión a LiteRT-LM se realizó con la herramienta oficial `litert-torch` (sin forks ni código personalizado). El bundle incorpora el tokenizador y la plantilla de prompt de DeepSeek (`<｜User｜>` / `<｜Assistant｜>`, token de parada `<｜end▁of▁sentence｜>`). En la revisión del 6 de octubre de 2026 se reescribió el grafo de prefill/decode: las dos escrituras dinámicas al KV cache por capa se fusionaron en un compuesto `odml.cache_update`, y los productos de atención BATCH_MATMUL pasaron a `odml.runtime_bmm`, la forma que exporta `litert-torch` con `--apply_gpu_composites`. Se añadió además una firma `prefill_16` que comparte buffers de pesos con `prefill_128`, lo que reduce el TTFT en GPU de 0,220 s a 0,046 s.

## Capacidades

- Generación de texto con razonamiento explícito en modo thinking (`<think> … </think>`).
- Razonamiento matemático paso a paso, con respuestas finales frecuentemente en `\boxed{}`.
- Generación de código y resolución de problemas algorítmicos (heredado de la destilación de R1).
- Inferencia on-device en Android, macOS, navegador (WebGPU) y Raspberry Pi 5.
- Ejecución con backend GPU (WebGPU sobre Metal) o CPU (XNNPACK).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Asistente de razonamiento en el móvil sin conexión: el bundle de 4,53 GB cabe en dispositivos Android con 12 GB o más de RAM y permite resolver problemas matemáticos o lógicos localmente, sin enviar datos a la nube, a 8,6 tok/s de decodificación en un Galaxy S26.
- Demo interactiva en navegador: la página oficial de LiteRT-LM carga el modelo vía WebGPU y permite probar el razonamiento en cualquier equipo con navegador compatible, útil para evaluación rápida o formación.
- Tutor de matemáticas con trazas verificables: al emitir la cadena `<think>` antes de la respuesta, el usuario puede auditar el razonamiento y detectar errores intermedios, algo valioso en entornos educativos.
- Prototipado de agentes de razonamiento en escritorio: en un Mac Studio M4 Max alcanza 79,1 tok/s de decodificación y 675 tok/s de prefill, suficiente para iterar sobre pipelines de razonamiento multi-paso sin coste de API.
- Procesamiento por lotes de problemas GSM8K o similares: con 28/30 aciertos en 30 preguntas de GSM8K (greedy, máx. 2048 tokens) y ejecución en CPU, sirve para evaluar técnicas de prompting o comparar variantes de cuantización.
- Despliegue en dispositivos de bajo consumo: en Raspberry Pi 5 se han medido prestaciones con la revisión anterior del bundle, lo que lo hace candidato para kioscos, robots o gateways industriales con razonamiento local.
- Integración en aplicaciones Android mediante la librería `com.google.ai.edge.litert:litert`, para asistentes de campo con conectividad intermitente.

## Benchmarks y rendimiento

Datos medidos por el autor en dispositivos reales (2026-10-05 y comparativa de la revisión del 2026-10-06):

| Medida | Galaxy S26 GPU | Galaxy S26 CPU | Mac Studio M4 Max GPU | Mac Studio M4 Max CPU |
|---|---|---|---|---|
| Decode | 8,6 tok/s | 8,4 tok/s | 79,1 tok/s | 18,2 tok/s |
| Prefill | 88 tok/s | 33 tok/s | 675 tok/s | — |
| TTFT | 11,75 s | 30,99 s | 393 ms (0,046 s con prefill_16) | 1,192 s (prefill_16) |

Comparativa de la reescritura del grafo (Mac Studio M4 Max, litert-lm 0.17.1):

| Medida | Fichero anterior | Fichero nuevo | Ratio |
|---|---:|---:|---:|
| GPU decode (256 prefill / 256 decode) | 65,0 tok/s | 79,1 tok/s | ×1,217 |
| GPU prefill (256 tokens) | 644 tok/s | 675 tok/s | ×1,049 |
| GPU TTFT (prefill 16) | 0,220 s | 0,046 s | ×0,210 |
| CPU decode | 18,1 tok/s | 18,2 tok/s | ×1,005 |
| CPU TTFT (prefill 16) | 2,893 s | 1,192 s | ×0,412 |

Calidad: 28/30 en GSM8K (greedy, máx. 2048 tokens) frente a 27/30 del fichero anterior; la diferencia de una pregunta tiene McNemar p = 1,0, es decir, no significativa. No se han publicado resultados de MMLU, HumanEval u otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/RAM: el bundle ocupa ~4,53 GB en disco; requiere al menos 12 GB de RAM en Android según el autor. No cabe en iPhone ni en teléfonos de 8 GB.
- GPU recomendadas: GPU integrada de Mac (Metal/WebGPU) y GPU de Android de gama alta (Galaxy S26 medido). Para escritorio con GPU dedicada no hay datos publicados.
- Consumer GPU: cabe en tarjetas con 8 GB o más de VRAM si se usa un runtime con soporte LiteRT; las métricas publicadas son de Mac Studio M4 Max y Galaxy S26.
- Despliegue: runtime LiteRT-LM (`litert_lm_main`), backend `--backend gpu` o CPU; demo web con WebGPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: ver tabla de benchmarks; en Mac Studio M4 Max GPU, 79,1 tok/s de decode y TTFT de 46 ms con `prefill_16`; en Galaxy S26 GPU, 8,6 tok/s y TTFT de 11,75 s.
- Advertencia operativa: en litert-lm 0.18.x y 0.19.0, una llamada bloqueante `send_message` que siga generando tras 10 minutos falla con `DEADLINE_EXCEEDED` (timeout fijo sin configuración) y puede provocar el crash del proceso; se recomienda reducir `max_output_tokens` en backends lentos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-7B (LiteRT-LM) | 7B | 4096 (KV) | `.litertlm` int4 | MIT | Hugging Face, demo web |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | 7B | no disponible | safetensors | MIT | Hugging Face |
| Qwen2.5-7B (base) | 7B | no disponible | safetensors | Apache-2.0 | Hugging Face |

La comparación con otras alternativas on-device de la misma categoría (por ejemplo, Gemma o Phi en formato LiteRT) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El contexto efectivo está limitado a 4096 tokens por la caché KV del bundle, muy por debajo de la ventana nativa del modelo base.
- El modo thinking genera respuestas largas; en backends lentos esto agrava el riesgo de `DEADLINE_EXCEEDED` en litert-lm 0.18.x/0.19.0.
- No cabe en iPhone ni en dispositivos con 8 GB de RAM; el autor lo indica explícitamente.
- La cuantización int4 puede degradar el razonamiento en problemas largos; con activaciones fp16 en GPU, solo 21 de 30 respuestas de GSM8K quedaron byte-idénticas respecto al fichero anterior.
- Riesgo de alucinación inherente a los modelos destilados de razonamiento; no se han publicado evaluaciones de sesgo ni de seguridad.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe uniforme.
- Licencia MIT para el artefacto, pero conviene verificar las condiciones de la base Qwen2.5 (Apache-2.0) y de DeepSeek-R1 en usos comerciales.
- El formato `.litertlm` limita la portabilidad: no es compatible con ecosistemas como llama.cpp, vLLM u Ollama sin conversión adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/DeepSeek-R1-Distill-Qwen-7B
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Demo web LiteRT-LM: https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/DeepSeek-R1-Distill-Qwen-7B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Ficha de mediciones edge-compat: https://github.com/john-rocky/edge-compat/blob/main/cards/deepseek-r1-distill-qwen-7b-q4-block32-ekv4096/CARD.md
- Benchmark Android multi-runtime: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
