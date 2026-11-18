# netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit

## Resumen

Qwen3.8-27B-pi-adapted-MLX-6bit es una cuantización en 6 bits para Apple Silicon (formato MLX) del modelo Qwen/Qwen3.8-27B, sobre el que se ha fusionado el adaptador LoRA `harness-hub/Qwen3.8-27B-pi-adapted`. El adaptador fue entrenado con aprendizaje por refuerzo (AsyncGRPO en TRL) para convertir al modelo en el motor del agente de programación [pi](https://github.com/earendil-works/pi), especializado en tareas de ingeniería de software y uso de terminal. El resultado es un modelo de 27.781.427.952 parámetros (unos 27,8 mil millones) que conserva el codificador visual y la capa de predicción multi-token (MTP) del modelo original.

La relevancia de esta build concreta es doble. Por un lado, empaqueta una mejora sustancial de rendimiento agéntico medida por el autor del adaptador: Terminal-Bench 2.1 pasa de 39,5 % a 55,8 % y SWE-bench Pro (hard 51) de 29,4 % a 62,7 % frente al modelo base, con entre un 55 % y un 64 % menos de llamadas a herramientas por tarea. Por otro, la cuantización a 6 bits (afín, grupo 64) reduce el peso a 23,1 GB manteniendo un 99,0 % de coincidencia en el siguiente token respecto a bf16 y una divergencia KL de solo 0,0015, lo que la convierte en la opción recomendada por el autor frente a las variantes de 4 y 8 bits.

El modelo está pensado para ejecutarse localmente en equipos con chip de Apple (probado en un MacBook Pro M5 Max de 128 GB) mediante mlx-lm y mlx-vlm, con soporte de entrada image-text-to-text, tool calling en formato XML de Qwen y decodificación especulativa mediante DSpine. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8) con 16 capas de atención completa y 64 capas totales; incluye capa MTP y codificador visual |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits afín, grupo 64 (lineales); existen builds MLX de 4 bits, 8 bits y bf16, además de un adaptador LoRA suelto |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); incluye `model-mtp.safetensors` |
| Tamano del repositorio | 23,1 GB |
| Biblioteca | mlx (mlx-lm >= 0.32.2, mlx-vlm >= 0.7.11) |
| Modelo base | harness-hub/Qwen3.8-27B-pi-adapted (revision `e786f84`) sobre Qwen/Qwen3.8-27B (revision `3756181`) |
| Modalidad | image-text-to-text (texto e imagen) |

## Arquitectura y entrenamiento

La build parte de Qwen/Qwen3.8-27B, un transformer con 16 capas de atención completa dentro de un total de 64 capas, al que se le ha fusionado el LoRA de `harness-hub`. Según la model card, los 256 módulos adaptados (q, k, v, o en las 16 capas de atención completa; gate, up, down en las 64 capas) se fusionaron mediante `W + 2.0 · B @ A` con redondeo, y se verificó que todos coinciden con el resultado esperado. La conversión a MLX se hizo con mlx-vlm e incluye tanto el codificador visual como la capa de predicción multi-token (MTP) original de Qwen, cuantizada de forma coherente con el resto del modelo. El adaptador no modifica la capa MTP, por lo que esta sigue siendo la cabeza original de Qwen.

El entrenamiento del adaptador se realizó con aprendizaje por refuerzo, concretamente AsyncGRPO dentro de TRL, sobre tareas de ingeniería de software y terminal, con el objetivo de servir como modelo del agente pi. El adaptador se entrenó y evaluó con el modo "thinking" desactivado, y el autor recomienda mantenerlo así. El tokenizador y la plantilla de chat son los ficheros de harness-hub sin cambios, con el mismo vocabulario y formato de tool calling que Qwen3.8-27B. La cuantización a 6 bits se validó midiendo la coincidencia del siguiente token frente a bf16 (99,0 %) y la divergencia KL (0,0015).

## Capacidades

- Generación de texto y razonamiento general, heredados de Qwen3.8-27B.
- Generación y corrección de código, con especial énfasis en tareas de ingeniería de software reales (resolución de bugs, parches, tests).
- Uso de terminal y ejecución de comandos como agente, capacidad reforzada por el entrenamiento con RL del adaptador.
- Tool calling / function calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Razonamiento multi-paso y comportamiento agéntico orientado a completar tareas de principio a fin con menos llamadas a herramientas.
- Entrada de imágenes (image-text-to-text): lectura de capturas de pantalla, terminales y otro contenido visual mediante mlx-vlm.
- Modo thinking disponible pero desaconsejado: el adaptador se entrenó y evaluó con thinking desactivado.
- Decodificación especulativa mediante la capa MTP de Qwen o mediante el drafter DSpine.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agente de programación local con pi: servir el modelo con `mlx_lm.server` en modo OpenAI-completions y conectarlo como proveedor local en `~/.pi/agent/models.json`, de forma que pi pueda resolver tareas como "encuentra por qué fallan los tests y corrige el bug" sin salir del equipo. El adaptador fue entrenado precisamente para este flujo y reduce las llamadas a herramientas por tarea entre un 55 % y un 64 %.
- Corrección de bugs en repositorios reales: el modelo puede inspeccionar el código, ejecutar tests en terminal, interpretar los fallos y aplicar parches, apoyándose en los resultados de SWE-bench Pro (62,7 % en hard 51) como referencia de su capacidad en este tipo de tareas.
- Automatización de tareas de terminal: ejecución encadenada de comandos, lectura de salidas y corrección de errores en un bucle agéntico, adecuado para scripts de mantenimiento, despliegue o diagnóstico en máquinas de desarrollo.
- Análisis de capturas de pantalla y salidas visuales: gracias a la entrada image-text-to-text, se puede preguntar al modelo qué error muestra una terminal o un IDE a partir de una imagen (`mlx_vlm.generate --image screenshot.png`).
- Asistencia de código en local con privacidad: al ejecutarse íntegramente en Apple Silicon con MLX, el código y los datos no salen del equipo, lo que encaja en entornos con requisitos de confidencialidad.
- Evaluación e investigación de agentes: la combinación de un adaptador RL publicado, métricas de fidelidad de cuantización (coincidencia del siguiente token y KL) y comparativas de velocidad con MTP y DSpine lo hace útil para estudiar el impacto de la cuantización y la decodificación especulativa en el rendimiento agéntico.
- Prototipado rápido en portátiles Apple: con 23,1 GB y 23 tok/s en decodificación simple (52 tok/s con DSpine en la build de 6 bits), permite iterar sobre prompts y flujos de agente sin depender de GPU en la nube.

## Benchmarks y rendimiento

Resultados publicados por el autor del adaptador (harness-hub), bajo pi y con thinking desactivado, frente al modelo base:

| Benchmark | Modelo base | Con adaptador pi |
|---|---|---|
| Terminal-Bench 2.1 | 39,5 % | 55,8 % |
| SWE-bench Pro (hard 51) | 29,4 % | 62,7 % |

Fidelidad de la cuantización frente a bf16:

| Build | Tamano | Coincidencia siguiente token | KL vs bf16 |
|---|---|---|---|
| MLX 6 bits (esta) | 23,1 GB | 99,0 % | 0,0015 |
| MLX 8 bits | 30,0 GB | 99,1 % | 0,0004 |
| MLX 4 bits | 16,3 GB | 95,6 % | 0,0201 |
| MLX bf16 | 55,6 GB | referencia | referencia |

Velocidad de decodificación medida por el autor (greedy, thinking off, 5 prompts × 256 tokens de GSM8K, MATH-500, HumanEval, MBPP y MT-Bench, con otros servicios en ejecución en el Mac, por lo que son indicativas):

| Build | Simple | MTP (mlx-vlm 0.7.11) | DSpine v0.2.1 (drafter 4 bits, bloque 5) |
|---|---|---|---|
| 4 bits | 33 tok/s | 61 tok/s (×1,84) | 70 tok/s (×2,25) |
| 6 bits | 23 tok/s | 22 tok/s (×0,96) | 52 tok/s (×2,32) |
| 8 bits | 18 tok/s | 41 tok/s (×2,24) | 54 tok/s (×3,05) |

No se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 23,1 GB solo para los pesos en 6 bits; hay que añadir la memoria para KV cache, contexto y el codificador visual, por lo que se recomienda un equipo con al menos 32 GB de memoria unificada y, preferiblemente, 64 GB o más para contextos largos.
- Hardware validado: MacBook Pro M5 Max con 128 GB (mlx 0.32.4, mlx-lm 0.32.2, mlx-vlm 0.7.11, 18 de noviembre de 2026).
- GPU: no aplica a CUDA; el formato MLX está orientado a Apple Silicon. No se proporcionan requisitos para A100, H100 o RTX 4090.
- Cabe en GPU de consumo de Apple: sí, en chips Apple con memoria unificada suficiente; las builds de 4 bits (16,3 GB) reducen el requisito, mientras que la de 8 bits (30,0 GB) y la bf16 (55,6 GB) exigen más memoria.
- Despliegue: `mlx_lm.server` (servidor compatible con OpenAI), mlx-lm para texto, mlx-vlm para imagen, y decodificación especulativa con MTP o con DSpine (`dspine-hybrid-mlx`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Rendimiento: 23 tok/s en decodificación simple en la build de 6 bits, 52 tok/s con DSpine (×2,32) y 22 tok/s con MTP (×0,96, sin mejora en esta build). La build de 8 bits alcanza 18 tok/s en simple y 54 tok/s con DSpine (×3,05).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit | 27,8 B | no disponible | MLX, Apple Silicon | Apache 2.0 | 23,1 GB, 99,0 % de coincidencia con bf16, 23 tok/s simple |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit | 27,8 B | no disponible | MLX, Apple Silicon | Apache 2.0 | 30,0 GB, 99,1 % de coincidencia, 18 tok/s simple, 54 tok/s con DSpine |
| netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit | 27,8 B | no disponible | MLX, Apple Silicon | Apache 2.0 | 16,3 GB, 95,6 % de coincidencia, 33 tok/s simple, 70 tok/s con DSpine |
| Qwen/Qwen3.8-27B (base) | 27,8 B aprox. | no disponible | múltiples (incluye MLX vía builds derivadas) | Apache 2.0 | Sin el adaptador pi; referencia de Terminal-Bench 2.1 39,5 % y SWE-bench Pro 29,4 % |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El adaptador se entrenó y evaluó con thinking desactivado; activarlo puede degradar el comportamiento esperado. El autor recomienda mantenerlo apagado.
- El adaptador se entrenó y evaluó con la API Chat Completions, no con la Responses API; configurar `"api": "openai-completions"` es importante para el funcionamiento correcto con pi.
- La cuantización a 6 bits introduce una pequeña divergencia respecto a bf16 (KL 0,0015, 99,0 % de coincidencia del siguiente token); en decodificación greedy con decodificación especulativa, el texto puede divergir ligeramente en respuestas largas por redondeos en empates cercanos.
- MTP no aporta aceleración en esta build de 6 bits con mlx-vlm 0.7.11; para velocidad hay que usar DSpine.
- Las mediciones de velocidad se tomaron con otros servicios en ejecución en el Mac y son indicativas, no reproducibles de forma estricta.
- Riesgo de alucinación: no evaluado en la información disponible; es un riesgo inherente a los modelos generativos, especialmente en tareas de código y terminal donde una acción incorrecta puede tener efectos reales.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingüe homogéneo.
- Longitud de contexto: no disponible; planificar los flujos agénticos con margen y validar empíricamente.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen/Qwen3.8-27B y del adaptador harness-hub, así como las dependencias (mlx-lm, mlx-vlm, DSpine).
- El modelo está orientado a Apple Silicon; no es directamente desplegable en CUDA sin conversión adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-bf16
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-adapter
- Modelo base con adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.8-27B
- Agente pi: https://github.com/earendil-works/pi
- Drafter DSpine: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Repositorio dspine-hybrid-mlx: https://github.com/internet-projects/dspine-hybrid-mlx
