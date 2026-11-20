# litert-community/Phi-4-mini-reasoning

## Resumen

Phi-4-mini-reasoning es un modelo denso de 3.800 millones de parámetros desarrollado por Microsoft, especializado en razonamiento matemático y resolución de problemas mediante cadenas de pensamiento explícitas. La versión aquí descrita, publicada por la comunidad `litert-community`, no es un modelo nuevo sino una conversión del original `microsoft/Phi-4-mini-reasoning` al formato LiteRT-LM (`.litertlm`), el runtime on-device de Google sucesor de TensorFlow Lite, pensado para inferencia en dispositivos de borde (móviles, SBC, portátiles).

El modelo implementa una arquitectura transformer densa de 32 capas bajo la clase `Phi3ForCausalLM` y genera una traza `<think>…</think>` antes de emitir la respuesta final encerrada en `\boxed{}`. Esta conversión aplica cuantización de pesos int4 con bloque 32, clipping óptimo OCTAV y embeddings en INT8 externalizados, reduciendo el artefacto a aproximadamente 2,6 GB (el fichero `model.litertlm` pesa 2.784.187.376 bytes) y permitiendo su ejecución en hardware sin aceleradores dedicados.

La relevancia actual radica en que demuestra que un modelo de razonamiento de casi 4B puede ejecutarse a velocidades interactivas en un smartphone de gama alta (13,1 tok/s de decodificación en Galaxy S26 con GPU) o en un Mac Studio M4 Max (114,9 tok/s), habilitando casos de uso de razonamiento matemático totalmente locales y sin conexión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, `Phi3ForCausalLM`, 32 capas |
| Parámetros totales | 3,8 mil millones |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (caché KV del artefacto LiteRT-LM) |
| Tipos de cuantización | int4 con bloque 32 (pesos simétricos) + OCTAV optimal-clipping; embeddings INT8 externalizados |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors |
| Cómputo | entero (integer) |
| Tamaño del artefacto | ~2,6 GB (`model.litertlm`), repo de 19,5 GB |
| Modelo base | `microsoft/Phi-4-mini-reasoning` |
| Runtime | LiteRT-LM (Google AI Edge) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de Microsoft con 3,8B parámetros organizado en 32 capas, identificado en la implementación como `Phi3ForCausalLM`. Está especializado en razonamiento matemático y produce cadenas de pensamiento largas antes de la respuesta, lo que exige presupuestos de generación amplios (el autor recomienda `max_tokens` ≥ 2048). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) en la documentación proporcionada.

La contribución técnica de esta versión es la conversión y optimización para LiteRT-LM. El grafo GPU fue reescrito el 2026-10-06: las dos escrituras `DYNAMIC_UPDATE_SLICE` de caché KV por capa se fusionaron en un único `STABLEHLO_COMPOSITE` `odml.cache_update`, y los productos de atención `BATCH_MATMUL(adjY)` pasaron a `odml.runtime_bmm`. Se añadió una entrada de firma `param_tensor` INT32[1,1,1,7] que el runtime rellena con start/end. La máscara de atención se aplica como ADD sobre una vista [bk, g, T, C] de los logits con máscara FLOAT32 difundida. El autor documenta que una variante con firma de prefill de 16 tokens perdía respuestas finales en GPU Mac con activaciones fp16 (7/8 en preguntas y 26/30 en GSM8K frente a 8/8 y 28/30), por lo que se descartó. Con activaciones fp32 en GPU Mac, las respuestas del nuevo fichero son idénticas byte a byte a las del anterior en 8 de 8 preguntas.

## Capacidades

- Generación de texto con razonamiento explícito: emite una traza `<think>…</think>` seguida de la respuesta final en `\boxed{}`.
- Razonamiento matemático y resolución de problemas de varios pasos, su especialidad principal.
- Razonamiento multi-step mediante cadena de pensamiento larga.
- Inferencia on-device en Android (delegado OpenCL y XNNPACK), macOS (WebGPU sobre Metal y XNNPACK) y navegador web vía WebGPU.
- Ejecución local sin conexión una vez descargado el artefacto.
- No se documenta soporte de tool calling, function calling, visión, audio ni capacidades de agente en la información disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Tutor matemático local en móvil: integrado en una app Android mediante el runtime LiteRT-LM, el modelo resuelve problemas paso a paso con la traza `<think>` visible, funcionando sin conexión y con una latencia de primera respuesta de 3,26 s en Galaxy S26 con GPU.
- Asistente de estudio en navegador: la demo web de LiteRT-LM carga el artefacto (2,78 GB) y ejecuta la inferencia con WebGPU, permitiendo probar el razonamiento matemático sin instalación local ni backend.
- Verificación de cálculos en pipelines de datos: dado su formato de respuesta `\boxed{}`, es parseable de forma determinista para extraer resultados numéricos en procesos automatizados de validación.
- Prototipado de razonamiento en estaciones de trabajo Apple Silicon: con 114,9 tok/s de decodificación en M4 Max por GPU, sirve para iterar sobre prompts de razonamiento matemático con retroalimentación casi interactiva.
- Despliegue en dispositivos de borde con recursos limitados: el artefacto int4 de ~2,6 GB cabe en dispositivos con 4-8 GB de RAM y se ejecuta en CPU (XNNPACK) a 7,0 tok/s en Galaxy S26, adecuado para asistentes embebidos.
- Evaluación comparativa de runtimes on-device: al estar disponible en LiteRT-LM con métricas publicadas por dispositivo y backend, sirve como referencia para medir prefill, decode y TTFT en hardware de borde.
- Educación matemática offline en entornos sin conectividad (aulas, zonas rurales): el modelo completo cabe en un móvil de gama alta y no requiere red.

## Benchmarks y rendimiento

Calidad (Mac Studio M4 Max, GPU, activaciones fp16):

| Prueba | Fichero anterior | Fichero nuevo |
|---|---:|---:|
| 8 preguntas, respuestas finales correctas | 8/8 | 8/8 |
| GSM8K, 30 preguntas (max tokens 2048, greedy) | 28/30 | 28/30 |

Rendimiento por dispositivo y backend (fichero nuevo):

| Dispositivo | Backend | Prefill (256) | Decode | TTFT | Init |
|---|---|---:|---:|---:|---:|
| Mac Studio M4 Max | GPU (WebGPU/Metal) | 1254 tok/s | 114,9 tok/s | 0,21 s | 3,2 s |
| Mac Studio M4 Max | CPU (XNNPACK) | 116 tok/s | 19,7 tok/s | 2,70 s | 2,4 s |
| Galaxy S26 | GPU (OpenCL) | 321 tok/s | 13,1 tok/s | 3,26 s | no disponible |
| Galaxy S26 | CPU (XNNPACK) | 52 tok/s | 7,0 tok/s | 20,82 s | no disponible |

TTFT con prefill de 16 tokens: 0,113 s en GPU Mac y 1,596 s en CPU Mac. En Galaxy S26 con GPU, las 1706 operaciones del grafo quedaron delegadas al acelerador. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el artefacto int4 ocupa ~2,6 GB en disco; se recomienda al menos 4 GB de memoria disponible para el runtime y la caché KV de 4096 tokens.
- GPU de escritorio: cualquier GPU con soporte WebGPU (Metal en Apple Silicon, DirectX 12/Vulkan en Windows/Linux) puede ejecutar el backend GPU; no se documentan requisitos para A100/H100 porque el modelo está orientado a borde.
- Consumer GPU y Apple Silicon: verificado en Mac Studio M4 Max con 114,9 tok/s de decodificación por GPU y 19,7 tok/s por CPU.
- Móvil: verificado en Samsung Galaxy S26 (Android 16) con delegado OpenCL (13,1 tok/s) y XNNPACK (7,0 tok/s); el autor menciona además mediciones en Raspberry Pi 5, Pixel 8a e iPhone 17 Pro sobre el fichero anterior, sin cifras en la información disponible.
- Navegador: ejecutable vía WebGPU con la demo oficial de LiteRT-LM.
- Despliegue: runtime LiteRT-LM (CLI `litert-lm` 0.17.1 y builds de main), con soporte de caché configurable (`--cache no`, `--disable_cache=true`).
- Throughput: prefill de 1254 tok/s y decodificación de 114,9 tok/s en M4 Max GPU; en Galaxy S26, 321 tok/s y 13,1 tok/s respectivamente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Orientación |
|---|---|---|---|---|---|
| Phi-4-mini-reasoning (LiteRT-LM, esta ficha) | 3,8B denso | 4096 (KV) | `.litertlm` int4 | MIT | On-device, razonamiento matemático |
| microsoft/Phi-4-mini-reasoning (original) | 3,8B denso | no disponible | safetensors | MIT | Servidor/escritorio, razonamiento matemático |
| Alternativas de ~3-4B para borde | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el modelo base original: misma arquitectura y pesos, pero el artefacto LiteRT-LM aplica cuantización int4 con bloque 32 y OCTAV, reduce el tamaño a ~2,6 GB y habilita backends móviles (OpenCL, XNNPACK, WebGPU) que el formato safetensors no soporta directamente. No se dispone de datos de benchmarks de terceros para establecer comparaciones cuantitativas con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Es un modelo de razonamiento: con `max_tokens` corto se trunca antes de emitir la respuesta; el autor exige ≥ 2048 tokens para uso fiable.
- Contexto limitado a 4096 tokens en la caché KV del artefacto, insuficiente para documentos largos o conversaciones multi-turno extensas.
- La cuantización int4 con bloque 32 y las activaciones fp16 pueden degradar la calidad frente al modelo original; el autor documenta pérdida de respuestas en una variante con firma de prefill de 16 tokens (7/8 y 26/30 en GSM8K), lo que evidencia sensibilidad a la configuración numérica.
- El autor recomienda activaciones fp32 en GPU Mac para obtener respuestas idénticas byte a byte al fichero anterior; con fp16 por defecto la equivalencia no está garantizada.
- Riesgo de alucinación inherente a los modelos de razonamiento: la traza `<think>` puede contener pasos plausibles pero incorrectos que conduzcan a una respuesta errónea.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; el modelo base está orientado principalmente a inglés y matemáticas.
- Licencia MIT: permite uso comercial y modificación, pero el artefacto deriva de un modelo de Microsoft y conviene conservar la atribución.
- El artefacto depende del runtime LiteRT-LM y de sus versiones concretas (0.17.1, builds de main); cambios de runtime pueden alterar el rendimiento o el comportamiento numérico.
- Las cifras de rendimiento en Raspberry Pi 5, Pixel 8a e iPhone 17 Pro corresponden al fichero anterior, no al actual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Phi-4-mini-reasoning
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-reasoning
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Demo web de chat: https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/Phi-4-mini-reasoning
- Ficha de mediciones edge-compat: https://github.com/john-rocky/edge-compat/blob/main/cards/phi4-mini-reasoning/CARD.md
- Benchmark de runtimes en Apple Silicon: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
- Issue de LiteRT-LM sobre el tiempo de inicialización: https://github.com/google-ai-edge/LiteRT-LM/issues/4057
