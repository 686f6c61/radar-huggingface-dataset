# netprojects/Qwen3.8-27B-opencode-MLX-8bit

## Resumen

Qwen3.8-27B-opencode-MLX-8bit es una conversión a formato MLX de 8 bits del modelo Qwen3.8-27B con el adaptador LoRA de harness-hub orientado a tareas de agente de programación (OpenCode). El autor de la conversión es netprojects, que publica una familia completa de builds MLX (3, 4, 6, 8 bits, bf16 y solo adaptador) para Apple Silicon. El modelo resuelve el problema de desplegar un agente de código de 27.781 millones de parámetros en Macs con memoria unificada, manteniendo el encoder de visión y la capa de predicción multi-token (MTP) de Qwen.

La relevancia de esta build concreta es su fidelidad al modelo en bf16: conserva el 99,2 % del siguiente token respecto a bf16 con una divergencia KL de 0,0004, a cambio de un tamaño de 30,0 GB. El adaptador se entrenó con aprendizaje por refuerzo (AsyncGRPO en TRL) para operar como el modelo detrás del agente OpenCode, y sus resultados publicados mejoran de forma notable el modelo base en SWE-bench Pro (35,3 % → 51,0 %) y Terminal-Bench 2.1 (46,4 % → 52,4 %) con el modo thinking desactivado.

El modelo es multimodal (pipeline image-text-to-text) y se sirve con mlx-lm o mlx-vlm, exponiendo una API compatible con OpenAI que permite integrarlo en OpenCode o en cualquier cliente que use tool calling en formato XML de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.8-27B) con encoder de visión y capa MTP; adaptador LoRA fusionado |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín con grupo 64 (esta build); la familia incluye 3, 4, 6, 8 bits, bf16 y solo adaptador |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (repo de 30,0 GB; incluye `model-mtp.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B (revisión `3756181`), un transformer multimodal con encoder de visión y una capa de predicción multi-token (MTP) propia. Sobre esa base se fusiona el adaptador LoRA de harness-hub/Qwen3.8-27B-opencode-adapted (revisión `b4171c0`), entrenado con aprendizaje por refuerzo mediante AsyncGRPO en TRL sobre tareas de ingeniería de software y de terminal, con el objetivo de ser el modelo que opera el agente OpenCode. La conversión a MLX se realizó con mlx-vlm, cuantizando las capas lineales a 8 bits (afín, grupo 64) e incluyendo tanto el encoder de visión como la capa MTP de Qwen, cuantizada con los mismos parámetros.

La innovación técnica destacable es la conservación de la cabeza MTP original de Qwen, que actúa como modelo borrador integrado para decodificación especulativa: pasando el mismo repositorio como `--draft-model` con `--draft-kind mtp`, el rendimiento de decodificación se multiplica por 2,15 en esta build (17 → 37 tok/s) sin descarga adicional. También es compatible con el drafter DSpine b16 de netprojects, que alcanza 54 tok/s (×3,03). Ambos métodos verifican cada token propuesto con el modelo completo, por lo que en decodificación greedy el texto coincide con la decodificación plana salvo en empates cercanos. El tokenizador y la plantilla de chat son los de harness-hub, sin modificar, con el mismo vocabulario y formato de tool calling que Qwen3.8-27B.

## Capacidades

- Generación de texto y razonamiento en el contexto de tareas de ingeniería de software.
- Agente de programación: resolución de bugs, ejecución de comandos de terminal y navegación de repositorios, entrenado específicamente para OpenCode.
- Tool calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Razonamiento multi-paso dentro de flujos de agente (lectura de tests, diagnóstico y parcheo).
- Capacidades multimodales de entrada de imagen y texto (pipeline image-text-to-text): interpretación de capturas de pantalla, salidas de terminal renderizadas e imágenes de errores, servidas con mlx-vlm.
- Modo thinking desactivable mediante `enable_thinking`; el adaptador fue entrenado y evaluado con thinking desactivado, y en ese modo iguala al modelo base con thinking a máximo esfuerzo generando aproximadamente un sexto de los tokens.
- Decodificación especulativa integrada mediante la capa MTP o el drafter DSpine.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agente de código en local sobre macOS: servir el modelo con `mlx_lm.server` y conectarlo a OpenCode mediante el proveedor OpenAI-compatible; el adaptador fue entrenado exactamente para ese agente, por lo que el formato de tool calls y el flujo de terminal encajan sin ajustes.
- Resolución automática de tests fallidos: el modelo puede recibir el contenido de un repositorio, ejecutar comandos de terminal vía tool calling, localizar la causa de un fallo en un test y proponer el parche, que es el escenario evaluado en SWE-bench Pro.
- Automatización de tareas de terminal: uso como agente que interpreta salidas de shell, encadena comandos y corrige errores, alineado con la mejora medida en Terminal-Bench 2.1.
- Depuración asistida por capturas: con mlx-vlm, analizar una imagen de un terminal o de una pantalla de error y responder qué fallo muestra, útil en soporte técnico interno y en triaje de incidencias.
- Generación de código en pipelines de CI/CD: desplegar el servidor local y consumir la API OpenAI-compatible desde scripts de integración para generar parches o revisiones de código antes de fusionar, con la ventaja de que los datos no salen de la máquina.
- Asistente de programación en el editor: al exponer una API compatible con OpenAI, se puede configurar como backend local de herramientas de edición que usen function calling, con thinking desactivado para reducir latencia y consumo de tokens.
- Evaluación de adaptadores de RL: la familia de builds (3, 4, 6, 8 bits, bf16 y solo adaptador) permite medir el impacto de la cuantización en tareas de agente comparando la misma política con distinta fidelidad.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador, bajo OpenCode con thinking desactivado, frente al modelo base:

| Benchmark | Modelo base | Con adaptador opencode |
|---|---|---|
| SWE-bench Pro (hard 51) | 35,3 % | 51,0 % |
| Terminal-Bench 2.1 | 46,4 % | 52,4 % |

Fidelidad de la cuantización respecto a bf16 (builds MLX de netprojects):

| Build | Tamano | Mismo siguiente token que bf16 | KL vs bf16 |
|---|---|---|---|
| 6 bits (recomendada) | 23,1 GB | 98,7 % | 0,0014 |
| 8 bits (esta build) | 30,0 GB | 99,2 % | 0,0004 |
| 4 bits | 16,3 GB | 96,7 % | 0,0203 |
| 3 bits | 13,8 GB | 93,4 % | 0,0812 |

Rendimiento de decodificación medido por el autor (greedy, thinking off, 5 prompts × 256 tokens de GSM8K, MATH-500, HumanEval, MBPP y MT-Bench, con otros servicios en la Mac; valores indicativos):

| Build | Plano | MTP (mlx-vlm 0.7.11) | DSpine v0.2.1 (drafter 4 bits, bloque 5) |
|---|---|---|---|
| 4 bits | 33 tok/s | 62 tok/s (×1,91) | 73 tok/s (×2,29) |
| 6 bits | 20 tok/s | 21 tok/s (×1,04) | 60 tok/s (×2,72) |
| 8 bits | 17 tok/s | 37 tok/s (×2,15) | 54 tok/s (×3,03) |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K para esta build concreta.

## Requisitos de hardware

- Memoria: el repositorio ocupa 30,0 GB, por lo que se necesita un Mac con memoria unificada holgada por encima de esa cifra (se recomienda 48 GB o más para dejar margen al contexto y al encoder de visión).
- GPU: exclusivamente Apple Silicon; el formato MLX no es ejecutable en GPU NVIDIA ni AMD.
- Cabe en consumer GPU: no aplica en el sentido habitual; requiere Macs con memoria unificada. Las builds de 3 y 4 bits (13,8 y 16,3 GB) están pensadas para Macs de 24 GB y 32 GB respectivamente.
- Despliegue: `mlx-lm>=0.32.2` para texto y servidor OpenAI-compatible (`mlx_lm.server`); `mlx-vlm>=0.7.11` para entradas de imagen y para usar la capa MTP como drafter. El adaptador suelto (638 MB) se usa con mlx-lm sobre cualquier build MLX de Qwen3.8-27B.
- Throughput medido en esta build: 17 tok/s en decodificación plana, 37 tok/s con MTP y 54 tok/s con DSpine (condiciones indicadas en la tabla anterior).
- No compatible con vLLM, llama.cpp, Ollama ni TGI, que no consumen pesos MLX.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-opencode-MLX-8bit | 27,78 B | no disponible | MLX safetensors, 8 bits | Apache 2.0 | 99,2 % de fidelidad vs bf16; 17 tok/s planos, 37 con MTP |
| netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit | 27,78 B | no disponible | MLX safetensors, 6 bits | Apache 2.0 | Recomendada por el autor; 23,1 GB, 98,7 % de fidelidad, 20 tok/s planos |
| netprojects/Qwen3.8-27B-opencode-adapted-MLX-4bit | 27,78 B | no disponible | MLX safetensors, 4 bits | Apache 2.0 | 16,3 GB, 96,7 % de fidelidad, 33 tok/s planos; para Macs de 32 GB |
| harness-hub/Qwen3.8-27B-opencode-adapted | 27,78 B | no disponible | adaptador LoRA | Apache 2.0 | Adaptador original sin fusionar; requiere un build base de Qwen3.8-27B |

No se dispone en la información proporcionada de comparaciones con modelos de otros fabricantes de tamaño equivalente.

## Limitaciones y advertencias

- El adaptador fue entrenado y evaluado con thinking desactivado; activarlo puede degradar el comportamiento esperado en tareas de agente.
- La cuantización a 8 bits introduce una divergencia mínima pero no nula: el 0,8 % de los siguientes tokens difieren de bf16 (KL 0,0004).
- La decodificación especulativa con MTP o DSpine puede divergir ligeramente del texto plano en respuestas largas cuando hay empates cercanos, ya que la verificación por lotes puede redondear al otro lado.
- El modelo está especializado en tareas de agente de programación y terminal; su rendimiento fuera de ese dominio no está caracterizado en la información disponible.
- Idiomas soportados no disponibles: no se puede garantizar calidad en castellano ni en otros idiomas distintos del inglés sin evaluación propia.
- Longitud de contexto no disponible: no se puede planificar el tamaño de las ventanas de contexto sin consultar la ficha del modelo base.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en la generación de parches de código y en la interpretación de salidas de terminal; conviene validar los cambios en un entorno aislado.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Qwen3.8-27B y del adaptador original, así como el cumplimiento de sus condiciones.
- Solo ejecutable en Apple Silicon; no hay ruta de despliegue en GPU NVIDIA con estos pesos.
- Los valores de rendimiento fueron medidos con otros servicios en ejecución en la misma máquina y deben tratarse como indicativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-8bit
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Build MLX de 6 bits (recomendada): https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- Build MLX de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit
- Build MLX de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-4bit
- Build MLX de 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-3bit
- Build MLX bf16: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-bf16
- Adaptador MLX (solo LoRA): https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-adapter
- Drafter DSpine b16 MLX: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Repositorio dspine-hybrid-mlx: https://github.com/internet-projects/dspine-hybrid-mlx
- OpenCode: https://opencode.ai
