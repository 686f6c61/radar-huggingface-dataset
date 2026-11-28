# mlboydaisuke/gemma-3-270m-it-NPU-LiteRT

## Resumen

`mlboydaisuke/gemma-3-270m-it-NPU-LiteRT` es una conversión del modelo instructivo `google/gemma-3-270m-it` al formato `.litertlm` de LiteRT-LM, empaquetado en cuantización de rango estático (SRQ) y orientado a la ejecución sobre la NPU Hexagon (HTP) de SoCs Qualcomm en dispositivos Android. No es un modelo nuevo: es una redistribución del Gemma 3 de 270 millones de parámetros de Google, adaptada para que el compilador de Qualcomm genere el grafo QNN en el propio dispositivo en tiempo de carga (JIT), de modo que un único fichero sirve para cualquier SoC soportado sin incluir contextos QNN precompilados.

La relevancia de esta ficha es práctica: demuestra que un transformer de 270 M puede ejecutarse íntegramente en la NPU de un móvil con velocidades de decodificación cercanas a 191 tok/s en un Snapdragon SM8850 (Galaxy S26), con un prefill de aproximadamente 19.000 tok/s. El precio a pagar es un tiempo de compilación en el arranque de cada proceso de 17,5 a 18,4 segundos, y una ventana de caché KV limitada a 896 tokens por una limitación del backend HTP documentada por el autor.

El repositorio tiene 0,9 GB, 181 descargas y ninguna valoración en el momento de la consulta. La licencia es la Gemma License de Google, heredada del modelo base, lo que condiciona el uso comercial. La verificación se ha realizado únicamente en Snapdragon SM8850 con QAIRT 2.47 y LiteRT-LM 0.19.1; otros SoC y versiones de runtime están sin probar según la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), exportado a LiteRT-LM con particionado NPU (HTP) y grafos auxiliares en CPU |
| Parametros totales | 270 millones (modelo base `google/gemma-3-270m-it`) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 896 tokens de caché KV por diseño en esta exportación (el modelo base soporta más; la limitación es del backend HTP) |
| Tipos de cuantizacion | SRQ (static range quantization) con escalas int16 en los grafos RoPE; fichero `.litertlm` de 456.853.286 bytes |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Gemma License (Google) |
| Formato de pesos | `.litertlm` (LiteRT-LM); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 3 de 270 M en versión instructiva, un transformer decoder-only denso de Google. Esta ficha no aporta detalles sobre el dataset de entrenamiento, el número de tokens vistos ni las etapas de alineación (RLHF/DPO) del modelo original; esa información corresponde a la model card de `google/gemma-3-270m-it` y no se incluye en la información disponible.

La innovación técnica de esta conversión es el pipeline de exportación: `litert-torch` con `npu_export` genera un bundle SRQ que el plugin compilador de Qualcomm convierte a un contexto QNN en el dispositivo al crear el motor. El transformer se particiona completamente a la NPU (888/888 operaciones en prefill y 869/869 en decode), mientras que los grafos auxiliares (RoPE, máscara, actualización de caché y embedder) se ejecutan en CPU porque el plugin no los acepta. La caché KV se fija en 896 posiciones —no 1024— porque en SM8850 la concatenación de la máscara de prefill al cruzar 1 MiB provoca que el HTP aplique la máscara a filas incorrectas y la calidad se degrada (incidencia reportada en litert-torch #1184). Los grafos RoPE cuantizan la posición del token a int16; en el fichero recomendado el rango se eleva a 1.023,97 (escala exacta de 1/32) para que todas las posiciones de la caché tengan su propia rotación, con ángulos redondeados a pasos de 1/32 rad.

## Capacidades

- Generación de texto conversacional en modo instructivo, heredada de Gemma 3 270M IT.
- Razonamiento básico de un solo turno y aritmética sencilla; el autor evalúa con preguntas GSM8K de 388–475 tokens de prompt.
- Generación de código y texto corto dentro de la ventana de 896 tokens.
- Plantilla de chat incluida en los metadatos del fichero `.litertlm`.
- Ejecución íntegra del transformer en NPU Hexagon con decodificación greedy verificada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; la ventana de 896 tokens limita cadenas largas.
- Capacidades multimodales (visión, audio): no disponibles en esta exportación, que es solo de texto.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes de texto embebidos en aplicaciones Android: el modelo cabe en un APK junto con las diez librerías de runtime de Qualcomm/LiteRT y se ejecuta en la NPU sin conexión, con 191 tok/s de decodificación en SM8850, adecuado para respuestas cortas en local.
- Autocompletado y reescritura de frases en teclados o editores móviles: la latencia de decodificación permite sugerencias de menos de 64 tokens con sensación interactiva, siempre que se asuma el coste de compilación de 17,5–18,4 s al arrancar el proceso.
- Clasificación y extracción de información sobre textos breves: con prompts de hasta 896 tokens se pueden etiquetar correos, notas o mensajes, ejecutando todo el cálculo en el dispositivo y evitando enviar datos a la nube.
- Respuestas a preguntas frecuentes en aplicaciones de soporte: el modelo gestiona plantillas de chat y respuestas de un turno; para conversaciones multi-turno hay que tener en cuenta que a partir del token 361 de decode todas las posiciones reciben la rotación de la última posición en el fichero anterior (corregido en el fichero `rope1024`).
- Filtrado y moderación de contenido generado en el propio terminal: un modelo de 270 M permite una primera pasada de cribado a bajo coste energético antes de recurrir a un modelo mayor en servidor.
- Prototipado e investigación de despliegue en NPU: sirve como banco de pruebas reproducible para medir prefill, decode y tiempo de creación de motor en hardware Qualcomm, y para validar pipelines de exportación con `litert-torch`.
- Demos offline en ferias o entornos sin conectividad: el bundle es un único fichero de 456 MB que se compila en el dispositivo, sin dependencia de contextos QNN precompilados por fabricante.

## Benchmarks y rendimiento

Rendimiento medido por el autor en Galaxy S26 (Snapdragon SM8850, Hexagon v81), QAIRT 2.47, LiteRT-LM v0.19.1, backend NPU, con `--benchmark_prefill_tokens=512 --benchmark_decode_tokens=256 --num_iterations=3`, tres procesos por fichero alternados y mediana de las ejecuciones 2–3:

| Fichero | Prefill (tok/s) | Decode (tok/s) | Creación de motor |
|---|---:|---:|---|
| `gemma-3-270m-it_npu-srq_c896_rope1024.litertlm` | 19.067 | 191,4 | 17,5–18,0 s |
| `gemma-3-270m-it_npu-srq_c896.litertlm` (anterior) | 18.985 | 191,3 | 17,5–18,4 s |

Números anteriores con una build de la línea LiteRT-LM 0.16 (2026-08), prompt de 21 tokens y 9 tokens decodificados, no comparables de forma controlada:

| Build | Prefill (tok/s) | Decode (tok/s) | Carga |
|---|---:|---:|---|
| JIT, variante caché 1024 | 1.899 | 219,7 | ≈16 s (compila) |
| AOT (compilado offline), caché 896 | 1.747 | 199,8 | ≈1 s |

Calidad: en una comprobación de 45 prompts en dispositivo (SM8850, greedy, límite de salida de 64 tokens; 48 para la referencia fp32), el fichero nuevo obtiene 27/45. En 40 preguntas GSM8K con prompts de 388–475 tokens, la respuesta del fichero nuevo sigue más lejos que la del modelo fp32 en 24 casos y menos en 4 (12 iguales; test de signos p = 0,00018), y no produce respuestas vacías donde el fichero anterior da 5. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/dispositivo: no aplica VRAM de GPU de escritorio; el destino es la NPU Hexagon de un SoC Qualcomm con al menos 0,9 GB de almacenamiento para el bundle y memoria del sistema para el contexto QNN compilado en carga.
- SoC verificado: Snapdragon SM8850 (Hexagon v81). Otros SoC y versiones de runtime están sin probar según la model card.
- GPU de escritorio (A100, H100, RTX 4090): no soportadas por este formato; el fichero `.litertlm` con backend NPU no es un artefacto para vLLM, TGI ni llama.cpp.
- Despliegue: LiteRT-LM con backend NPU (build `litert_lm_advanced_main` de la etiqueta v0.19.1), QAIRT 2.47 y las diez librerías de runtime de Qualcomm/LiteRT dentro del APK, más dos opciones de `Environment`. La receta completa está en el repositorio `john-rocky/hf-to-litertlm`.
- Latencia: creación de motor de 17,5–18,4 s por arranque de proceso (compilación JIT en dispositivo); decodificación de 191,4 tok/s y prefill de 19.067 tok/s en SM8850.
- Advertencia de despliegue: una configuración incorrecta puede caer silenciosamente a CPU y parecer exitosa; la receta documenta esta trampa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / destino | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mlboydaisuke/gemma-3-270m-it-NPU-LiteRT` (esta ficha) | 270 M | 896 tokens (caché KV de la exportación) | `.litertlm`, NPU Hexagon Android | Gemma License | Hugging Face, 181 descargas |
| `google/gemma-3-270m-it` | 270 M | el del modelo base (no disponible aquí) | safetensors / ecosistema estándar | Gemma License | Hugging Face |
| Modelos de ~270 M en GGUF para llama.cpp | ~270 M | según implementación | GGUF, CPU/GPU de escritorio | variable | ecosistema llama.cpp |
| Modelos de ~270 M en LiteRT-LM AOT | ~270 M | según exportación | `.litertlm` precompilado por SoC | variable | requiere contexto QNN por SoC |

La diferencia principal frente al modelo base es el formato y el destino: esta exportación gana en velocidad en NPU móvil y pierde en portabilidad y en longitud de contexto efectiva. Frente a una exportación AOT, el bundle JIT evita distribuir un contexto QNN por SoC a cambio de 16–18 s de compilación en cada arranque de proceso. No se dispone de datos de benchmarks estándar para establecer una comparación de calidad con alternativas.

## Limitaciones y advertencias

- Ventana de contexto efectiva de 896 tokens por una limitación del backend HTP en SM8850; no es una decisión de diseño del modelo base.
- En el fichero anterior (`c896`), a partir del token 361 de decode y del 385 de prefill todas las posiciones reciben la rotación de la última; el fichero recomendado `rope1024` corrige el rango, pero los ángulos quedan redondeados a pasos de 1/32 rad.
- Compilación JIT en cada arranque de proceso: 17,5–18,4 s de latencia inicial no amortizable entre procesos.
- Verificación limitada a Snapdragon SM8850, QAIRT 2.47 y LiteRT-LM 0.19.1; otros SoC y versiones no están probados.
- Riesgo de caída silenciosa a CPU con configuración incorrecta, que puede enmascarar un fallo de despliegue.
- Riesgo de alucinación y errores aritméticos propios de un modelo de 270 M; la comprobación GSM8K del autor muestra desviaciones respecto a la referencia fp32.
- Sesgos conocidos del modelo base: no documentados en la información proporcionada.
- Idiomas soportados: no disponibles en la información proporcionada.
- Licencia Gemma: el uso comercial está sujeto a los términos de Google, no a una licencia permisiva tipo Apache 2.0; hay que revisar las restricciones antes de distribuir en producción.
- El repositorio no incluye safetensors ni GGUF; no es reutilizable directamente en vLLM, TGI, Ollama o llama.cpp.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/gemma-3-270m-it-NPU-LiteRT
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Receta de exportación NPU para Android: https://github.com/john-rocky/hf-to-litertlm/blob/main/docs/android-npu.md
- Incidencia del backend HTP sobre la máscara de prefill: https://github.com/google-ai-edge/litert-torch/issues/1184
- LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- litert-torch: https://github.com/google-ai-edge/litert-torch
