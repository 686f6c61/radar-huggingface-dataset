# litert-community/LFM2.5-1.2B-Thinking

## Resumen

LFM2.5-1.2B-Thinking es la variante de razonamiento del modelo estrella de Liquid AI, una arquitectura híbrida conv-attention de 1.200 millones de parámetros. Antes de responder, el modelo elabora su cadena de pensamiento dentro de las etiquetas `<think>…</think>`, lo que permite separar el razonamiento interno de la respuesta final. Este repositorio concreto, publicado por `litert-community`, no contiene los pesos originales en PyTorch, sino la conversión al formato `.litertlm` para su ejecución en dispositivos con el runtime LiteRT-LM de Google (el antiguo TensorFlow Lite).

La relevancia de esta ficha radica en que empaqueta un modelo de razonamiento de 1,2 B en cuatro variantes cuantizadas (int8, int4, y sendas versiones reexportadas para GPU) con tamaños de entre 736 MB y 1,24 GB, pensadas para inferencia en móvil, Raspberry Pi y equipos de sobremesa. El bundle declara el canal de pensamiento en sus metadatos, de modo que LiteRT-LM 0.14 o superior transmite el razonamiento por un canal `thought` independiente, que la aplicación puede mostrar u ocultar, y elimina automáticamente los pensamientos previos del contexto multiturno.

El modelo base es `LiquidAI/LFM2.5-1.2B-Thinking`, distribuido bajo la LFM Open License v1.0. La versión aquí descrita mantiene los pesos y el grafo idénticos al original, con la única adición de la sección `ExecutorMetadata` que exige LiteRT-LM 0.15 o superior para enlazar los buffers de estado híbridos conv/attention.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido conv-attention (LFM2.5 de Liquid AI) |
| Parametros totales | 1.200 millones (1,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (cache KV máximo) |
| Tipos de cuantizacion | int8 dinámica (lineales y embedding; convoluciones en float), int4 blockwise-32 con lineales OCTAV (embedding int8, convoluciones float); variantes reexportadas para GPU de ambas |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license-v1.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); pesos base en el repositorio de LiquidAI |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura LFM2.5 de Liquid AI, descrita por el autor como híbrida conv-attention: combina capas convolucionales con capas de atención en un mismo transformer, lo que reduce el coste de inferencia en secuencias largas frente a un transformer denso convencional. Sobre esa base, la variante Thinking se ha afinado para producir razonamiento explícito antes de la respuesta, siguiendo el patrón de modelos con modo de pensamiento.

La conversión a LiteRT-LM se realizó con `litert-torch` (el antiguo `ai-edge-torch`), el conversor de PyTorch de Google. Según la model card, un modelo convertido sin modificar con `litert_torch.convert` coincidió con el original hasta 4e-7 en un Galaxy S26 con LiteRT 2.2.0 y Android 16. Las recetas de cuantización son: int8 dinámica para lineales y embedding manteniendo las convoluciones en float, e int4 blockwise de tamaño 32 con lineales OCTAV, embedding int8 y convoluciones float. El 4 de agosto de 2026 los ficheros se actualizaron in situ para añadir `ExecutorMetadata`, requisito de LiteRT-LM 0.15 para enlazar los buffers de estado; los pesos y el grafo permanecen idénticos byte a byte. El 21 de septiembre de 2026 se actualizó la plantilla de chat para aceptar el formato de partes de contenido de la versión 0.18, sin cambios en pesos, tokenizador ni metadatos del ejecutor.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto con razonamiento explícito: elabora la cadena de pensamiento dentro de `<think>…</think>` y emite la respuesta final tras `</think>`.
- Razonamiento matemático verificable: obtiene un 77 % en GSM8K (n=100, greedy, 0-shot CoT) en la variante int8 y un 72 % en int4, frente al 81 % de la referencia bf16.
- Canal de pensamiento separado: LiteRT-LM 0.14 o superior transmite el razonamiento por un canal `thought` independiente, ocultable por la aplicación y eliminado automáticamente del contexto multiturno.
- Ejecución en dispositivo: inferencia local sin red en CPU y, en dos de los ficheros, en GPU (OpenCL en Android y macOS, Metal en iOS para `_int4_gpu`).
- Soporte de plantilla de chat completa incluida en el bundle, con compatibilidad con el formato de partes de contenido de LiteRT-LM 0.18.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni cobertura multilingüe específica.

## Casos de uso

- Asistente de razonamiento offline en móvil: con la variante int8 en CPU de un Galaxy S26 se obtienen 35,5 tok/s de decodificación, 357 tok/s de prefill y 600 ms hasta el primer token, suficiente para un asistente conversacional local sin conexión.
- Tutor de matemáticas en el dispositivo: el modelo resuelve problemas paso a paso en el canal `thought` y la aplicación puede mostrar u ocultar el desarrollo; el 77 % en GSM8K lo hace viable para ejercicios de aritmética de primaria y secundaria.
- Despliegue en hardware de bajo coste: en una Raspberry Pi 5 con CPU de 4 hilos, la variante int8 decodifica a 7,1 tok/s con TTFT de 3,56 s, adecuado para kioscos, domótica o dispositivos educativos.
- Procesamiento por lotes en portátil o sobremesa: en un Apple M4 Max la variante GPU alcanza 3.734 tok/s de prefill y 317,9 tok/s de decodificación, lo que permite clasificar o resumir lotes de textos cortos localmente.
- Aplicaciones de privacidad estricta: al ejecutarse íntegramente en el dispositivo, los datos del usuario no salen del terminal, lo que encaja en entornos sanitarios o financieros con requisitos de confidencialidad.
- Integración en apps Android mediante AI Edge Gallery: el bundle es compatible con LiteRT-LM 0.15 o superior y con una versión reciente de AI Edge Gallery, lo que simplifica la prueba y distribución del modelo en el ecosistema Android.
- Prototipado de agentes con presupuesto de tokens amplio: dado que un modelo de razonamiento truncado a mitad de pensamiento no produce respuesta final, conviene fijar un presupuesto de al menos 2.048 tokens, útil en pipelines de razonamiento de varios pasos ejecutados en local.

## Benchmarks y rendimiento

Precisión en GSM8K (greedy, 0-shot CoT, max-tokens 2.048, n=100, mismo arnés para todas las filas):

| Variante | GSM8K |
|---|---|
| PyTorch bf16 (referencia) | 81 % |
| LiteRT int8 | 77 % (−4 puntos) |
| LiteRT int4 | 72 % (−9 puntos) |

Rendimiento en dispositivo, Pixel 8a (Tensor G3), `litert_lm_main` de litert-lm v0.16.0, prompt de 263 tokens, generación limitada a 256, 3 ejecuciones por backend:

| Backend | Prefill (263 tok) | Decode | TTFT |
|---|---|---|---|
| GPU (OpenCL) | 189–192 tok/s | 21,8–22,4 tok/s | 1,41–1,44 s |
| CPU | 31,3–31,7 tok/s | 16,3–16,7 tok/s | 8,4–8,5 s |

Rendimiento en Apple M4 Max (litert-lm 0.16.0, `-p 256 -d 256 --runs 3`):

| Backend | Prefill (256) | Decode | TTFT |
|---|---|---|---|
| GPU | 3.734 tok/s | 317,9 tok/s | no disponible en la información proporcionada |
| CPU | no disponible | no disponible | no disponible |

Rendimiento en Raspberry Pi 5 (LiteRT-LM 0.16.1, CPU, 4 hilos):

| Variante | Decode | Prefill | TTFT |
|---|---|---|---|
| int8 | 7,1 tok/s | 75 tok/s | 3,56 s |
| int4 | 9,2 tok/s | 55 tok/s | 4,78 s |

En Galaxy S26 con LiteRT-LM 0.16.0 y backend GPU, ambos ficheros fallaron al crear el motor (`engine_create_failed`) el 24 de agosto de 2026. En la misma máquina con CPU, la variante int8 alcanzó 35,5 tok/s de decodificación, 357 tok/s de prefill y 600 ms de TTFT el 5 de septiembre de 2026.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Thinking (LiteRT int8) | 1,2 B | 4.096 | 77 % | lfm-open-license-v1.0 | `.litertlm` |
| LFM2.5-1.2B-Thinking (PyTorch bf16) | 1,2 B | no disponible | 81 % | lfm-open-license-v1.0 | safetensors (repositorio LiquidAI) |
| LFM2.5-1.2B-Instruct (LiteRT) | 1,2 B | no disponible | no disponible | lfm-open-license-v1.0 | `.litertlm` |

No se dispone en la información proporcionada de datos de benchmarks de modelos de terceros que permitan una comparación cuantitativa adicional.

## Requisitos de hardware

- VRAM y memoria: los ficheros ocupan 736 MB (int4) y 1,24 GB (int8); el repositorio completo pesa 18,6 GB. La inferencia en CPU no requiere VRAM dedicada.
- GPU recomendadas: no se especifican modelos de GPU de escritorio; las pruebas documentadas cubren GPU móvil (Tensor G3 en Pixel 8a con OpenCL), Apple M4 Max (GPU y CPU) y Raspberry Pi 5 (CPU).
- Compatibilidad con GPU de consumo: no hay datos publicados sobre RTX 4090, A100 o H100 en la información disponible.
- Backends: CPU para todos los ficheros; GPU con litert-lm 0.16.0 o superior para `_int4_gpu` (Android OpenCL, macOS y iOS Metal) y `_int8_gpu` (Android OpenCL y macOS, sin probar en iOS).
- Nota para iOS: con `_int4_gpu` es necesario fijar `maxNumTokens` a 1.024; un valor distinto rompe la creación del motor.
- Despliegue: runtime LiteRT-LM (versión 0.15 o superior; 0.14 funcionó hasta el reempaquetado del 13 de octubre de 2026, cuyo tipo de modelo `lfm2` exige 0.15), comando `litert-lm run` y AI Edge Gallery reciente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver la tabla de benchmarks; en telefonía la GPU mejora sobre todo el prefill y el TTFT (3–6 veces), mientras que la decodificación está limitada por ancho de banda y queda prácticamente igual.

## Limitaciones y advertencias

- Presupuesto de tokens: un modelo de razonamiento truncado a mitad de pensamiento no genera respuesta final; hay que reservar al menos 2.048 tokens.
- Pérdida de precisión por cuantización: el int8 cae 4 puntos en GSM8K y el int4, 9 puntos respecto a bf16; en tareas sensibles a la precisión conviene validar la variante elegida.
- Contexto limitado a 4.096 tokens de caché KV, insuficiente para documentos largos o conversaciones muy extensas.
- En iOS, un `maxNumTokens` distinto de 1.024 con `_int4_gpu` impide crear el motor.
- El backend GPU falló al crear el motor en Galaxy S26 con LiteRT-LM 0.16.0 (24 de agosto de 2026); conviene verificar la combinación de dispositivo y versión antes de producción.
- El rendimiento en CPU de telefonía varía por throttling térmico a lo largo de una serie de ejecuciones.
- No se documentan sesgos conocidos, tasas de alucinación ni cobertura de idiomas; la licencia LFM Open License v1.0 debe revisarse antes de un uso comercial, ya que no es una licencia OSI estándar.
- El repositorio contiene únicamente artefactos LiteRT-LM; para otros runtimes hay que acudir al modelo base de LiquidAI.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/LFM2.5-1.2B-Thinking
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- Variante Instruct hermana: https://huggingface.co/litert-community/LFM2.5-1.2B-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Ficha de compatibilidad int4: https://github.com/john-rocky/edge-compat/blob/main/cards/lfm2.5-1.2b-thinking-int4/CARD.md
- Ficha de compatibilidad int8: https://github.com/john-rocky/edge-compat/blob/main/cards/lfm2.5-1.2b-thinking-int8/CARD.md
- Benchmark de runtimes en Android: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
