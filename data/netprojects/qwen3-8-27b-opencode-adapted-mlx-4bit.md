# netprojects/Qwen3.8-27B-opencode-adapted-MLX-4bit

## Resumen
Qwen3.8-27B-opencode-adapted-MLX-4bit es una compilación cuantizada a 4 bits en formato MLX del modelo Qwen3.8-27B de Alibaba Qwen, sobre el que se ha fusionado el adaptador LoRA publicado por harness-hub para especializarlo como modelo de agente de programación (coding agent) orientado a OpenCode. El resultado es un modelo multimodal image-text-to-text de aproximadamente 27.800 millones de parámetros que corre de forma nativa en Apple Silicon mediante la librería MLX, con un tamaño de repositorio de 16,3 GB.

El modelo base Qwen3.8-27B es un transformer denso con 64 capas, de las cuales 16 son de atención completa, y dispone de una capa propia de predicción multi-token (MTP) que aquí se conserva cuantizada y se puede usar como modelo borrador para decodificación especulativa. El adaptador de harness-hub se entrenó con aprendizaje por refuerzo (AsyncGRPO en TRL) sobre tareas de ingeniería de software y terminal, y sus resultados publicados muestran mejoras sustanciales en SWE-bench Pro (hard 51) y Terminal-Bench 2.1 frente al modelo base cuando se desactiva el modo thinking.

La relevancia de esta ficha concreta es que ofrece la variante más ligera de la familia de builds MLX (4 bits, 16,3 GB), pensada para equipos con memoria unificada limitada, a costa de una fidelidad menor respecto a bf16 (96,7% de coincidencia en el siguiente token y KL de 0,0203). El autor recomienda la build de 6 bits como equilibrio entre tamaño y fidelidad, pero la de 4 bits es la única que deja margen amplio en configuraciones de 32-64 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con 64 capas (16 de atención completa) y capa MTP propia de Qwen3.8-27B |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín (affine), group size 64, sobre capas lineales; MTP cuantizado al mismo nivel; existen builds 6-bit, 8-bit, bf16 y adaptador LoRA |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (repo de 16,3 GB), con `model-mtp.safetensors` para decodificación especulativa |

## Arquitectura y entrenamiento
El modelo parte de Qwen3.8-27B, un transformer denso de 27,8 B de parámetros con 64 capas, de las que 16 usan atención completa y el resto presumiblemente mecanismos más eficientes (el detalle no se especifica en la información disponible). Incluye una capa de predicción multi-token (MTP) propia de Qwen que se conserva en el fichero `model-mtp.safetensors`, cuantizada al mismo nivel que el resto del modelo, y que el adaptador no modifica: es la cabeza MTP original de Qwen. El pipeline declarado es image-text-to-text, por lo que el modelo incorpora un codificador de visión que también se ha convertido a MLX con mlx-vlm.

Sobre el modelo base se fusionó el adaptador LoRA de harness-hub (revisión `b4171c0`), entrenado con aprendizaje por refuerzo mediante AsyncGRPO en TRL para actuar como el modelo detrás del agente de programación OpenCode en tareas de ingeniería de software y terminal. La fusión se verificó elemento a elemento: los 256 módulos adaptados (q, k, v, o en las 16 capas de atención completa; gate, up, down en las 64 capas) equivalen a `W + 2.0 · B @ A` redondeado a bf16. La conversión a MLX se realizó con mlx-vlm. El tokenizador y la plantilla de chat son los de harness-hub sin cambios, por lo que mantienen el mismo vocabulario y el mismo formato de tool calls que Qwen3.8-27B (XML con `<tool_call><function=...><parameter=...>`).

## Capacidades
- Generación de texto y razonamiento, con modo thinking desactivable (el adaptador se entrenó y evaluó con thinking off).
- Programación y tareas de terminal: resolución de bugs, ejecución de tests, edición de ficheros y uso de shell, según el entrenamiento RL del adaptador.
- Comprensión de imágenes (pipeline image-text-to-text): capturas de pantalla, salidas de terminal y diagramas, mediante mlx-vlm.
- Tool calling / function calling en formato XML de Qwen, que el servidor de mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Uso como agente multi-paso dentro de OpenCode y otros clientes compatibles con la API OpenAI.
- Decodificación especulativa con la capa MTP integrada (hasta ~1,9× de aceleración en la build de 4 bits) o con el drafter DSpine externo.
- Capacidades multilingües: no disponible (los idiomas no se detallan en la información proporcionada).

## Casos de uso
- Agente de programación local en OpenCode: servir el modelo con `mlx_lm.server` y conectarlo a OpenCode vía API OpenAI-compatible permite resolver tareas como "encuentra por qué fallan los tests de `tests/test_parser.py` y corrige el bug" sin enviar código a la nube, algo crítico en entornos con propiedad intelectual sensible.
- Depuración asistida de terminal: gracias a la capacidad image-text-to-text, se puede pasar una captura de pantalla de la terminal y preguntar qué error muestra, útil en soporte interno o en documentación de incidencias.
- Automatización de tareas de ingeniería en pipelines: el modelo puede integrarse en scripts que ejecuten tests, lean la salida y propongan parches, aprovechando el entrenamiento específico en Terminal-Bench y SWE-bench Pro.
- Asistente de código en el IDE para equipos con Mac: al ocupar 16,3 GB en 4 bits, cabe en un MacBook Pro con 32-64 GB de memoria unificada y ofrece una alternativa local a APIs de pago.
- Generación y revisión de código en Python y otros lenguajes dentro de flujos de CI: el soporte de tool calling permite que el modelo invoque herramientas (ejecutar tests, consultar ficheros) en lugar de limitarse a generar texto.
- Prototipado de agentes con razonamiento multi-paso: la capa MTP y el drafter DSpine permiten iterar rápido en local con decodificación acelerada, útil para investigadores que evalúan políticas de agente.
- Análisis de capturas y documentación técnica: interpretar diagramas de arquitectura o salidas de herramientas gráficas y convertirlas en explicaciones o pasos de acción.

## Benchmarks y rendimiento
Resultados publicados por harness-hub para el adaptador (OpenCode, thinking off) frente al modelo base:

| Benchmark | Modelo base | Con adaptador |
|---|---|---|
| SWE-bench Pro (hard 51) | 35,3% | 51,0% |
| Terminal-Bench 2.1 | 46,4% | 52,4% |

Fidelidad de las builds MLX respecto a bf16 (medida por el autor de la conversión):

| Build | Tamano | Mismo siguiente token que bf16 | KL vs bf16 |
|---|---|---|---|
| 6-bit (recomendada) | 23,1 GB | 98,7% | 0,0014 |
| 8-bit | 30,0 GB | 99,2% | 0,0004 |
| 4-bit (esta ficha) | 16,3 GB | 96,7% | 0,0203 |
| bf16 | 55,6 GB | referencia | referencia |

Rendimiento de decodificación medido en un MacBook Pro M5 Max (128 GB), greedy, thinking off, 5 prompts × 256 tokens (GSM8K, MATH-500, HumanEval, MBPP, MT-Bench), con otros servicios en ejecución (cifras indicativas):

| Build | Sin MTP | Con MTP (mlx-vlm 0.7.11) |
|---|---|---|
| 4-bit | 33 tok/s | 62 tok/s (×1,91) |
| 6-bit | 20 tok/s | 21 tok/s (×1,04) |
| 8-bit | 17 tok/s | 37 tok/s (×2,15) |

No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K para esta build concreta.

## Requisitos de hardware
- VRAM/memoria unificada estimada: 16,3 GB de pesos; en la práctica se recomienda al menos 24-32 GB de memoria unificada para dejar margen al contexto y al codificador de visión. El autor verificó el modelo en un MacBook Pro M5 Max de 128 GB.
- GPU recomendadas: Apple Silicon exclusivamente (MLX). Verificado en M5 Max; chips M-series con memoria unificada suficiente (M1/M2/M3/M4 Pro, Max o Ultra) son el objetivo natural. No aplica a GPU NVIDIA o AMD con CUDA/ROCm en este formato.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí: en Macs con 32 GB o más de memoria unificada. En GPUs de consumo tipo RTX 4090 (24 GB) no es directamente usable por el formato MLX, aunque el modelo base en otras cuantizaciones podría caber.
- Despliegue: `mlx-lm>=0.32.2` para texto y servidor OpenAI-compatible (`mlx_lm.server`); `mlx-vlm>=0.7.11` para visión y decodificación especulativa con MTP o con el drafter DSpine (`dspine-hybrid-mlx`). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI en este repositorio.
- Latencia y throughput: ~33 tok/s sin MTP y ~62 tok/s con MTP en M5 Max para la build de 4 bits (mediciones indicativas del autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-opencode-adapted-MLX-4bit | ~27,8 B | no disponible | MLX safetensors 4-bit | Apache 2.0 | Esta ficha; 16,3 GB, 96,7% fidelidad vs bf16 |
| netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit | ~27,8 B | no disponible | MLX safetensors 6-bit | Apache 2.0 | Recomendada por el autor; 23,1 GB, 98,7% fidelidad |
| netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit | ~27,8 B | no disponible | MLX safetensors 8-bit | Apache 2.0 | 30,0 GB, 99,2% fidelidad, mayor throughput con MTP |
| harness-hub/Qwen3.8-27B-opencode-adapted | ~27,8 B | no disponible | safetensors (LoRA fusionable) | Apache 2.0 | Adaptador original, sin cuantizar a MLX |
| Qwen/Qwen3.8-27B | ~27,8 B | no disponible | safetensors | Apache 2.0 | Modelo base sin especialización en agentes de código |

## Limitaciones y advertencias
- La cuantización a 4 bits reduce la fidelidad respecto a bf16: 96,7% de coincidencia en el siguiente token y KL de 0,0203, el peor valor de la familia de builds. El autor recomienda la de 6 bits para uso general.
- El adaptador se entrenó y evaluó con thinking desactivado; activar el modo thinking puede degradar el comportamiento esperado. Hay que pasar `enable_thinking: false` en la plantilla de chat.
- Formato MLX exclusivo para Apple Silicon: no es portable a CUDA, ROCm ni a la mayoría de plataformas de servidor.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas de sesgo ni de tasas de alucinación en la información disponible.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe uniforme.
- La decodificación especulativa con MTP puede divergir ligeramente del texto de la decodificación simple en respuestas largas por redondeos en la comprobación por lotes.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y del adaptador harness-hub antes de desplegar en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de esta build.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-4bit
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.8-27B
- Build 6-bit recomendada: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- Build 8-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-bf16
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-adapter
- Drafter DSpine: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Repositorio dspine-hybrid-mlx: https://github.com/internet-projects/dspine-hybrid-mlx
- OpenCode: https://opencode.ai
