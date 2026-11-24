# netprojects/Qwen3.8-27B-opencode-MLX-4bit

## Resumen

Qwen3.8-27B-opencode-MLX-4bit es una cuantización de 4 bits en formato MLX del modelo harness-hub/Qwen3.8-27B-opencode-adapted, un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.8-27B orientado a tareas de ingeniería de software y uso de terminal como motor del agente de programación OpenCode. Lo publica el usuario netprojects y está pensado específicamente para ejecutarse en Apple Silicon mediante las librerías mlx-lm y mlx-vlm. El modelo conserva el codificador de visión y la capa de multi-token prediction (MTP) del modelo original, lo que permite tanto entrada de imagen y texto como decodificación especulativa integrada.

El interés de esta build radica en que empaqueta un modelo de 27.781.427.952 parámetros (unos 27,8 mil millones) en 16,3 GB, un tamaño manejable en Macs con memoria unificada de gama alta, manteniendo el 96,7 % de coincidencia con el siguiente token respecto a bf16 y una divergencia KL de 0,0203 frente a la referencia. El ajuste LoRA original se entrenó con aprendizaje por refuerzo (AsyncGRPO en TRL) para mejorar el rendimiento en tareas de software y terminal, con resultados publicados de 35,3 % a 51,0 % en SWE-bench Pro (hard 51) y de 46,4 % a 52,4 % en Terminal-Bench 2.1.

La relevancia actual es doble: por un lado, demuestra que un modelo de casi 28B puede servir como agente de código local en hardware de consumo Apple; por otro, la integración de MTP y del drafter DSpine permite acelerar la decodificación entre 1,9× y 2,3× según la build, acercando la latencia a la de servicios en la nube para flujos de trabajo interactivos de programación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capa MTP; conversión MLX de Qwen3.8-27B con LoRA fusionado |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine, group size 64 (esta build); existen builds 3-bit, 6-bit, 8-bit y bf16 del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), con archivo `model-mtp.safetensors` para la capa MTP |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B (revisión `3756181`), sobre el que harness-hub aplicó un LoRA entrenado con aprendizaje por refuerzo (AsyncGRPO en TRL) para convertirlo en el motor del agente OpenCode en tareas de ingeniería de software y terminal. Esta build concreta fusiona el adaptador (revisión `b4171c0`) en el modelo base y convierte el resultado a MLX con mlx-vlm, incluyendo el codificador de visión y la capa de multi-token prediction (MTP) original de Qwen. Las capas lineales se cuantizan a 4 bits en modo affine con grupo de 64, lo que reduce el peso a 16,3 GB.

La innovación técnica destacable es la conservación de la capa MTP de Qwen en `model-mtp.safetensors`, cuantizada de forma coherente con el resto del modelo, que mlx-vlm puede usar como modelo borrador integrado pasando el mismo repositorio como `--draft-model` con `--draft-kind mtp`. El adaptador no modifica esa capa, por lo que se trata de la cabeza MTP original de Qwen. Adicionalmente, el drafter DSpine (netprojects/Qwen3.8-27B-DSpine-b16-MLX) con dspine-hybrid-mlx es compatible con estas builds. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni detalles adicionales del proceso de RLHF/DPO más allá de lo indicado.

## Capacidades

- Generación de texto y razonamiento general, heredados de Qwen3.8-27B.
- Generación y edición de código orientada a tareas de ingeniería de software: el adaptador se entrenó específicamente para el agente OpenCode.
- Ejecución de tareas de terminal y depuración de fallos en tests, con mejoras medidas en SWE-bench Pro y Terminal-Bench 2.1.
- Entrada de imagen y texto (pipeline image-text-to-text): puede analizar capturas de pantalla o imágenes de terminal, por ejemplo para interpretar errores mostrados en una captura.
- Tool calling / function calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm devuelve como `tool_calls` compatibles con OpenAI.
- Modo thinking configurable, aunque el adaptador se entrenó y evaluó con thinking desactivado y se recomienda mantenerlo apagado.
- Decodificación especulativa integrada mediante MTP y compatible con el drafter DSpine.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agente de programación local en Mac: servir el modelo con `mlx_lm.server` y conectarlo a OpenCode mediante un proveedor OpenAI-compatible, de modo que el desarrollador pueda lanzar tareas como localizar y corregir tests fallidos sin enviar código a la nube.
- Depuración de tests en producción: el modelo puede recibir el contenido de `tests/test_parser.py` y el error, razonar sobre la causa y proponer un parche, aprovechando el entrenamiento específico en tareas de software.
- Automatización de terminal: ejecutar comandos, interpretar su salida y encadenar pasos multi-turno como agente, gracias a la mejora medida en Terminal-Bench 2.1.
- Análisis de capturas de pantalla: usar mlx-vlm para pasar una imagen de terminal o de un IDE y preguntar qué error muestra, útil en soporte técnico o triaje de incidencias.
- Asistente de código en el editor: integración vía API OpenAI-compatible local para autocompletado, generación de funciones y explicación de fragmentos, con la ventaja de que los datos no salen del equipo.
- Generación de código con latencia interactiva: activar MTP o DSpine para alcanzar entre 62 y 73 tok/s en la build de 4 bits, adecuado para flujos de pair programming donde la respuesta rápida importa.
- Prototipado de agentes multi-step: usar el soporte de tool calling en formato Qwen para construir pipelines que consulten herramientas externas y razonen sobre los resultados.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador, bajo OpenCode y con thinking desactivado, frente al modelo base:

| Benchmark | Modelo base | Adaptador |
|---|---|---|
| SWE-bench Pro (hard 51) | 35,3 % | 51,0 % |
| Terminal-Bench 2.1 | 46,4 % | 52,4 % |

Fidelidad de la cuantización respecto a bf16 (builds del mismo autor):

| Build | Tamano | Mismo siguiente token que bf16 | KL vs bf16 |
|---|---|---|---|
| 6-bit (recomendada) | 23,1 GB | 98,7 % | 0,0014 |
| 8-bit | 30,0 GB | 99,2 % | 0,0004 |
| 4-bit (esta) | 16,3 GB | 96,7 % | 0,0203 |
| 3-bit | 13,8 GB | 93,4 % | 0,0812 |
| bf16 | 55,6 GB | referencia | referencia |

Rendimiento de decodificación medido por el autor (greedy, thinking off, 5 prompts × 256 tokens de GSM8K, MATH-500, HumanEval, MBPP y MT-Bench, con otros servicios ejecutándose en el Mac; valores indicativos):

| Build | Sin aceleración | MTP (mlx-vlm 0.7.11) | DSpine v0.2.1 (drafter 4-bit, bloque 5) |
|---|---|---|---|
| 4-bit | 33 tok/s | 62 tok/s (×1,91) | 73 tok/s (×2,29) |
| 6-bit | 20 tok/s | 21 tok/s (×1,04) | 60 tok/s (×2,72) |
| 8-bit | 17 tok/s | 37 tok/s (×2,15) | 54 tok/s (×3,03) |

## Requisitos de hardware

- Memoria: la build de 4 bits ocupa 16,3 GB en disco; se necesita memoria unificada suficiente para cargar el modelo más el contexto y el codificador de visión. Para Macs de 24 GB se recomienda la build de 3-bit (13,8 GB); la de 4-bit encaja con holgura en equipos de 32 GB o más.
- GPU: diseñado para Apple Silicon (MLX); no está pensado para GPU NVIDIA. No se dispone de datos de rendimiento en A100, H100 o RTX 4090.
- Despliegue: mlx-lm (servidor OpenAI-compatible con `mlx_lm.server`, versión >= 0.32.2) para texto; mlx-vlm (>= 0.7.11) para imagen y texto y para decodificación especulativa con MTP o DSpine.
- Aceleración: MTP integrado sin descarga adicional (unas 1,9× en 4 bits) o drafter DSpine (hasta 2,29× en 4 bits), ambos verificando cada token con el modelo completo.
- Throughput indicativo: 33 tok/s en plano, 62 tok/s con MTP y 73 tok/s con DSpine en la build de 4 bits, según mediciones del autor en un Mac con otros servicios en ejecución.
- Alternativas de mayor fidelidad: builds de 6 bits (23,1 GB, recomendada por el autor) y 8 bits (30,0 GB) para equipos con más memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / plataforma | Notas |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-opencode-MLX-4bit | 27,8B | no disponible | apache-2.0 | MLX safetensors, Apple Silicon | Esta build; 96,7 % de coincidencia con bf16, 33 tok/s plano |
| netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit | 27,8B | no disponible | apache-2.0 | MLX safetensors, Apple Silicon | Recomendada por el autor; 23,1 GB, 98,7 % de coincidencia, 20 tok/s plano |
| netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit | 27,8B | no disponible | apache-2.0 | MLX safetensors, Apple Silicon | La más cercana a bf16; 30,0 GB, 99,2 % de coincidencia |
| harness-hub/Qwen3.8-27B-opencode-adapted | 27,8B | no disponible | apache-2.0 | Adaptador LoRA sobre Qwen3.8-27B | Modelo original sin cuantizar; requiere el base y el adaptador |

No se dispone de información sobre otros modelos comparables de la misma categoría (agentes de código de ~28B) en la documentación proporcionada.

## Limitaciones y advertencias

- Cuantización agresiva: la build de 4 bits solo reproduce el siguiente token de bf16 en el 96,7 % de los casos y presenta una KL de 0,0203, notablemente peor que las builds de 6 y 8 bits; para tareas sensibles a la fidelidad se recomienda la de 6 bits.
- Modo thinking: el adaptador se entrenó y evaluó con thinking desactivado; activarlo puede degradar el comportamiento esperado. Debe configurarse `enable_thinking: false` en la plantilla de chat.
- Divergencia en decodificación especulativa: con MTP o DSpine y decodificación greedy, el texto coincide con la decodificación plana hasta un empate cercano, donde la verificación por lotes puede redondear al otro lado; respuestas largas pueden diferir ligeramente.
- Plataforma: requiere Apple Silicon y las librerías MLX; no es directamente utilizable en CUDA, vLLM, TGI ni llama.cpp.
- Idiomas: no se especifican los idiomas soportados, por lo que no puede garantizarse un rendimiento multilingüe concreto.
- Contexto: no se indica la longitud de contexto soportada; debe consultarse la documentación de Qwen3.8-27B antes de asumir ventanas largas.
- Sesgos y alucinación: no se documentan sesgos conocidos ni tasas de alucinación; como modelo de código, existe riesgo de generar parches plausibles pero incorrectos, por lo que conviene validar con tests.
- Licencia: apache-2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base Qwen3.8-27B y del adaptador original.
- Mediciones de rendimiento: los tok/s publicados se obtuvieron con otros servicios ejecutándose en el mismo Mac y deben tratarse como indicativos, no como cifras de referencia reproducibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-4bit
- Modelo base adaptado: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Build 6-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- Build 8-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit
- Build 3-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-3bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-bf16
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-adapter
- Drafter DSpine: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Repositorio dspine-hybrid-mlx: https://github.com/internet-projects/dspine-hybrid-mlx
- OpenCode: https://opencode.ai
