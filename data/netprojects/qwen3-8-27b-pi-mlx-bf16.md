# netprojects/Qwen3.8-27B-pi-MLX-bf16

## Resumen

Qwen3.8-27B-pi-MLX-bf16 es una conversión a formato MLX, en precisión bf16, del modelo Qwen3.8-27B de Alibaba Qwen con el adaptador LoRA publicado por harness-hub bajo el nombre Qwen3.8-27B-pi-adapted ya fusionado en los pesos base. El adaptador se entrenó con aprendizaje por refuerzo (AsyncGRPO mediante TRL) para convertir el modelo en el motor del agente de programación pi, orientado a tareas de ingeniería de software y de terminal. El resultado es un modelo de 27.781.427.952 parámetros (unos 27,8 mil millones) que conserva la torre de visión y la cabeza de predicción multi-token (MTP) del modelo original.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de especialización por RL sobre un modelo base abierto con licencia Apache 2.0, con mejoras declaradas muy notables en benchmarks de agentes (Terminal-Bench 2.1 de 39,5% a 55,8% y SWE-bench Pro hard 51 de 29,4% a 62,7%). Por otro, muestra el ecosistema de despliegue en Apple Silicon: la build bf16 sirve como referencia de fidelidad frente a las variantes cuantizadas a 6, 8 y 4 bits del mismo autor, y se acompaña de decodificación especulativa mediante la capa MTP original de Qwen o mediante el drafter DSpine.

El repositorio ocupa 55,6 GB y se distribuye en safetensors para la librería MLX, con pipeline image-text-to-text. No se han publicado datos sobre idiomas soportados ni sobre la longitud de contexto en la información disponible, aunque el tokenizador y la plantilla de chat son los del Qwen3.8-27B original, sin modificaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con capas de atención completa y capas Gated DeltaNet (16 capas de atención completa con proyecciones q, k, v, o; 64 capas en total con gate, up, down), más torre de visión y cabeza MTP; conversión MLX |
| Parámetros totales | 27.781.427.952 (27,8 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (esta build); el autor publica además variantes MLX de 6 bits (23,1 GB), 8 bits (30,0 GB) y 4 bits (16,3 GB), y un adaptador LoRA de 638 MB |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `model-mtp.safetensors` para la capa MTP; repositorio de 55,6 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer con una combinación de capas de atención completa y capas Gated DeltaNet, según la descripción del proceso de fusión del adaptador. El adaptador LoRA afecta a 256 módulos: las proyecciones q, k, v y o de las 16 capas de atención completa, y las proyecciones gate, up y down de las 64 capas. No toca ni el codificador de visión ni las capas Gated DeltaNet. La fusión se verificó elemento a elemento contra un cálculo independiente en float64 con la fórmula W + 2.0 · B @ A redondeada a bf16, y el resto de tensores es idéntico byte a byte al modelo base.

El entrenamiento del adaptador lo realizó harness-hub con aprendizaje por refuerzo, concretamente AsyncGRPO en TRL, sobre tareas de ingeniería de software y de terminal, con el objetivo de servir de motor al agente pi. La evaluación se hizo con el modo de razonamiento (thinking) desactivado, y el autor recomienda mantenerlo así en producción. La build conserva la cabeza MTP original de Qwen en `model-mtp.safetensors`, que puede usarse como modelo borrador para decodificación especulativa; el adaptador no modifica esa capa.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Comprensión de imágenes: pipeline image-text-to-text con torre de visión incluida, útil para leer capturas de terminal o errores en pantalla.
- Ejecución de tareas de agente de programación: resolución de fallos en tests, edición de código y operaciones en terminal, el dominio para el que se entrenó el adaptador.
- Tool calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Compatibilidad con la API Chat Completions de OpenAI, que es la que se usó en el entrenamiento y la evaluación del adaptador.
- Modo thinking desactivable mediante la plantilla de chat (`enable_thinking: false`); el autor recomienda desactivarlo.
- Decodificación especulativa con la capa MTP propia o con el drafter DSpine.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agente de programación en local sobre Apple Silicon: servir el modelo con `mlx_lm.server` y conectarlo a pi mediante un proveedor local con `api: openai-completions`, de modo que el agente diagnostique y corrija fallos en repositorios reales sin enviar código a servicios externos.
- Resolución automática de tests fallidos: usar el modelo con una instrucción del tipo "encuentra por qué fallan los tests de tests/test_parser.py y corrige el bug", aprovechando el entrenamiento específico en tareas de terminal y su reducción declarada del 55-64% en llamadas a herramientas por tarea.
- Automatización de operaciones en terminal: el adaptador se evaluó en Terminal-Bench 2.1, por lo que encaja en flujos donde el agente debe inspeccionar el sistema, ejecutar comandos y verificar resultados de forma iterativa.
- Revisión de errores a partir de capturas: con mlx-vlm se puede pasar una imagen de la terminal y preguntar qué error muestra, combinando visión y conocimiento de herramientas de desarrollo.
- Integración en pipelines de CI/CD: desplegar el servidor OpenAI-compatible en un Mac de integración y lanzar el agente en modo no interactivo (`pi --print`) para tareas de reparación acotadas antes de fusionar cambios.
- Referencia de fidelidad para cuantización: al ser la build bf16, sirve para medir la degradación de las variantes de 4, 6 y 8 bits (por ejemplo, la de 6 bits conserva el 99,0% del siguiente token y un KL de 0,0015 frente a bf16) antes de elegir una build para producción.
- Prototipado de agentes con decodificación acelerada: usar MTP o DSpine para aumentar el throughput en bucles de agente con muchas llamadas cortas, aceptando que en decodificación voraz el texto puede divergir ligeramente en empates cercanos.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador, con thinking desactivado bajo pi:

| Benchmark | Modelo base | Con adaptador pi |
|---|---|---|
| Terminal-Bench 2.1 | 39,5% | 55,8% |
| SWE-bench Pro (hard 51) | 29,4% | 62,7% |

Fidelidad de las builds cuantizadas frente a esta build bf16:

| Build | Tamaño | Mismo siguiente token que bf16 | KL frente a bf16 |
|---|---|---|---|
| 6 bits (recomendada) | 23,1 GB | 99,0% | 0,0015 |
| 8 bits | 30,0 GB | 99,1% | 0,0004 |
| 4 bits | 16,3 GB | 95,6% | 0,0201 |
| bf16 | 55,6 GB | referencia | referencia |

Throughput medido por el autor en un MacBook Pro M5 Max de 128 GB (decodificación voraz, thinking off, 5 prompts de 256 tokens procedentes de GSM8K, MATH-500, HumanEval, MBPP y MT-Bench, con otros servicios en ejecución, por lo que son indicativos):

| Build | Sin aceleración | MTP (mlx-vlm 0.7.11) | DSpine v0.2.1 (drafter 4 bits, bloque 5) |
|---|---|---|---|
| 4 bits | 33 tok/s | 61 tok/s (×1,84) | 70 tok/s (×2,25) |
| 6 bits | 23 tok/s | 22 tok/s (×0,96) | 52 tok/s (×2,32) |
| 8 bits | 18 tok/s | 41 tok/s (×2,24) | 54 tok/s (×3,05) |

Para esta build bf16 el autor indica que MTP funciona y es aproximadamente 2,8 veces más rápido en un prompt corto de código, sin publicar la cifra absoluta de tok/s. No se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: al menos 55,6 GB solo para los pesos en bf16, más overhead de KV cache y del servidor; en la práctica requiere un Mac con 64 GB o más, y el autor verificó en un MacBook Pro M5 Max de 128 GB.
- GPU recomendadas: Apple Silicon con memoria unificada amplia (familias M Max y Ultra); no es una build pensada para GPU NVIDIA, ya que el formato es MLX.
- Cabe en GPU de consumo: no en tarjetas con 24 GB o menos en bf16; para equipos con menos memoria conviene usar las builds de 6 bits (23,1 GB), 8 bits (30,0 GB) o 4 bits (16,3 GB) del mismo autor.
- Opciones de despliegue: `mlx_lm.server` (servidor compatible con OpenAI, requiere mlx-lm >= 0.32.2), `mlx_vlm.generate` para entradas con imagen (mlx-vlm >= 0.7.11), y el adaptador LoRA de 638 MB con mlx-lm sobre cualquier build MLX de Qwen3.8-27B.
- Latencia y throughput: 18 tok/s en la build de 8 bits y 23 tok/s en la de 6 bits sin aceleración según las mediciones del autor; con DSpine se alcanzan 54 y 52 tok/s respectivamente. Para bf16 no se publica cifra absoluta, solo la mejora de ×2,8 con MTP en un prompt corto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-pi-MLX-bf16 | 27,8 mil millones | no disponible | Agente de código y terminal, MLX bf16 | Apache 2.0 | Hugging Face, MLX |
| harness-hub/Qwen3.8-27B-pi-adapted | no disponible (adaptador LoRA) | no disponible | Adaptador RL para pi | no disponible en la información | Hugging Face |
| Qwen/Qwen3.8-27B | 27,8 mil millones (según el modelo derivado) | no disponible | Modelo base multimodal | no disponible en la información | Hugging Face |
| netprojects/Qwen3.8-27B-pi-MLX-6bit | 27,8 mil millones | no disponible | Misma especialización, cuantizada a 6 bits | Apache 2.0 | Hugging Face, MLX |

La comparación con alternativas de otros fabricantes (por ejemplo, modelos de código de tamaño similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El adaptador se entrenó y evaluó con thinking desactivado; activar el modo de razonamiento puede degradar el comportamiento esperado en tareas de agente.
- Está pensado para la API Chat Completions, no para la API Responses; usar la interfaz incorrecta puede romper el formato de tool calls.
- El formato MLX limita el despliegue a Apple Silicon; no hay pesos GGUF ni compatibilidad directa con vLLM o TGI en esta build.
- El tamaño de 55,6 GB en bf16 exige equipos de gama alta; en memorias menores hay que recurrir a las builds cuantizadas, con la pérdida de fidelidad correspondiente (la de 4 bits conserva el 95,6% del siguiente token).
- Con decodificación especulativa y decodificación voraz, el texto puede divergir ligeramente del decoding normal en empates cercanos, porque la verificación por lotes puede redondear al otro lado.
- Las mediciones de throughput se tomaron con otros servicios en ejecución en el mismo equipo, por lo que deben tratarse como indicativas.
- No se dispone de información sobre sesgos, riesgo de alucinación específico del adaptador, idiomas soportados ni longitud de contexto; estos datos deben verificarse contra el modelo base antes de usarlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 18 de noviembre de 2026, por lo que carece de validación comunitaria independiente.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y del adaptador original, cuya licencia no se detalla en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-bf16
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-8bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-4bit
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-pi-MLX-adapter
- Drafter DSpine: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Repositorio del agente pi: https://github.com/earendil-works/pi
- Repositorio dspine-hybrid-mlx: https://github.com/internet-projects/dspine-hybrid-mlx
