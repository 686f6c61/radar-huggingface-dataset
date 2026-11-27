# netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit

## Resumen

Qwen3.8-27B-opencode-adapted-MLX-8bit es una cuantización en 8 bits para Apple Silicon (formato MLX) del adaptador LoRA `harness-hub/Qwen3.8-27B-opencode-adapted`, fusionado sobre el modelo base `Qwen/Qwen3.8-27B`. El resultado es un modelo multimodal (image-text-to-text) de 27.781.427.952 parámetros, convertido con mlx-vlm e incluyendo el codificador de visión y la capa MTP (multi-token prediction) de Qwen. Lo publica el usuario `netprojects` como parte de una familia de builds (3, 4, 6, 8 bits, bf16 y adaptador LoRA suelto) orientada a ejecución local en Macs.

El interés principal del modelo es su especialización: el adaptador se entrenó con aprendizaje por refuerzo (AsyncGRPO en TRL) para funcionar como el modelo detrás del agente de programación OpenCode en tareas de ingeniería de software y de terminal. Según los resultados publicados por el autor del adaptador, con el modo "thinking" desactivado mejora SWE-bench Pro (hard 51) del 35,3 % al 51,0 % y Terminal-Bench 2.1 del 46,4 % al 52,4 % respecto al modelo base, generando aproximadamente una sexta parte de los tokens.

Esta build concreta de 8 bits es la más fiel al bf16 de la familia (99,2 % de coincidencia en el siguiente token y KL de 0,0004 frente a bf16), con un tamaño de 30,0 GB. Está pensada para Macs de 64 GB o más; para 48 GB el autor recomienda la build de 6 bits (23,1 GB) y para 24 GB la de 3 bits (13,8 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con codificador de visión y capa MTP; cuantización MLX affine de 8 bits, group size 64 |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (esta build); la familia incluye 3, 4, 6, 8 bits, bf16 y adaptador LoRA |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); librería `mlx`; también existe familia GGUF del mismo autor |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer multimodal con codificador de visión y una capa MTP (multi-token prediction) que se conserva en la conversión a MLX. Sobre ese base se fusiona el adaptador LoRA de `harness-hub`, entrenado con aprendizaje por refuerzo mediante AsyncGRPO en TRL para optimizar el comportamiento como agente de programación en OpenCode, sobre tareas de ingeniería de software y de terminal. El tokenizador y la plantilla de chat son los de harness-hub sin modificar, con el mismo vocabulario y formato de tool calls que Qwen3.8-27B.

La conversión a MLX se realizó con mlx-vlm e incluye el codificador de visión. En esta build las capas lineales se cuantizan a 8 bits con cuantización affine y group size 64, lo que produce un repositorio de 30,0 GB. El autor publica métricas de fidelidad frente a bf16: 99,2 % de coincidencia en el siguiente token y divergencia KL de 0,0004. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el proceso de alineación del modelo base.

## Capacidades

- Generación de texto y razonamiento, con modo "thinking" configurable (el adaptador se entrenó y evaluó con thinking desactivado).
- Comprensión de imágenes (pipeline image-text-to-text): lectura de capturas de pantalla, terminales y diagramas mediante mlx-vlm.
- Agente de programación: resolución de tareas de ingeniería de software y de terminal en el entorno OpenCode.
- Tool calling / function calling en el formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como tool calls compatibles con OpenAI.
- Razonamiento multi-paso orientado a agentes, con generación de aproximadamente una sexta parte de los tokens del modelo base en modo thinking alto según el autor del adaptador.
- Ejecución local en Apple Silicon con MLX (mlx-lm, mlx-vlm, LM Studio en modo MLX).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de programación local en OpenCode: servir el modelo con `mlx_lm.server` en el puerto 8000 y registrarlo como proveedor OpenAI-compatible en `~/.config/opencode/opencode.json`; el adaptador está entrenado específicamente para este flujo con thinking desactivado.
- Depuración de tests en un repositorio: lanzar `opencode run --model local/... "Find out why the tests in tests/test_parser.py fail and fix the bug."`; el modelo está optimizado para tareas de terminal y de ingeniería de software medidas en SWE-bench Pro y Terminal-Bench.
- Automatización de tareas de terminal: interpretar salidas de comandos, errores de compilación y trazas para proponer correcciones, aprovechando la mejora publicada en Terminal-Bench 2.1 (46,4 % → 52,4 %).
- Análisis de capturas de pantalla técnicas: con mlx-vlm, pasar una imagen de una terminal o de un IDE y preguntar por el error mostrado; útil para soporte interno y triaje de incidencias.
- Asistente de código en Python vía API local: cargar el modelo con `mlx_lm.load` y generar funciones o parches con `enable_thinking=False`, integrándolo en scripts y herramientas internas.
- Prototipado de agentes con tool calling: usar el formato XML de Qwen y la conversión a tool calls de OpenAI del servidor de mlx-lm para construir pipelines multi-paso en local sin depender de la nube.
- Evaluación de fidelidad de cuantización: comparar esta build de 8 bits con las de 6, 4 y 3 bits del mismo autor usando las métricas publicadas (coincidencia del siguiente token y KL frente a bf16) para elegir el equilibrio tamaño/calidad en un Mac concreto.

## Benchmarks y rendimiento

Resultados publicados por el autor del adaptador (harness-hub), bajo OpenCode y con thinking desactivado:

| Benchmark | Modelo base | Con adaptador |
|---|---|---|
| SWE-bench Pro (hard 51) | 35,3 % | 51,0 % |
| Terminal-Bench 2.1 | 46,4 % | 52,4 % |

Fidelidad de la cuantización frente a bf16 (familia MLX del mismo autor):

| Build | Tamano | Coincidencia siguiente token vs bf16 | KL vs bf16 |
|---|---|---|---|
| 6 bits (recomendada) | 23,1 GB | 98,7 % | 0,0014 |
| 8 bits (esta build) | 30,0 GB | 99,2 % | 0,0004 |
| 4 bits | 16,3 GB | 96,7 % | 0,0203 |
| 3 bits | 13,8 GB | 93,4 % | 0,0812 |
| bf16 | 55,6 GB | referencia | referencia |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 30,0 GB de pesos; el autor recomienda Macs de 64 GB o más para esta build, dejando margen para macOS y prompts largos (la descarga es como máximo aproximadamente el 60 % de la memoria).
- GPU recomendadas: Apple Silicon con memoria unificada de 64 GB o superior (esta build); 48 GB para la de 6 bits; 32 GB para la de 4 bits; 24 GB para la de 3 bits; 16 GB solo como solución de compromiso con la build GGUF IQ2_M (10,2 GB).
- GPU NVIDIA: no disponible; el formato MLX está orientado a Apple Silicon. El mismo autor publica una familia GGUF para llama.cpp, Ollama y LM Studio.
- Despliegue: mlx-lm (servidor OpenAI-compatible con `mlx_lm.server`), mlx-vlm para entrada de imágenes, LM Studio en modo MLX; para GGUF, llama.cpp, Ollama y LM Studio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-opencode-adapted-MLX-8bit (esta build) | 27,78 B | no disponible | Agente de código OpenCode, multimodal, 8 bits MLX | Apache 2.0 | Hugging Face, MLX |
| Qwen3.8-27B-opencode-adapted-MLX-6bit | 27,78 B | no disponible | Igual, 6 bits MLX (recomendada por el autor) | Apache 2.0 | Hugging Face, MLX |
| Qwen3.8-27B-opencode-adapted-MLX-4bit | 27,78 B | no disponible | Igual, 4 bits MLX (Macs de 32 GB) | Apache 2.0 | Hugging Face, MLX |
| Qwen/Qwen3.8-27B (base) | 27,78 B | no disponible | Modelo general multimodal | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks de modelos de otros autores para una comparación cruzada.

## Limitaciones y advertencias

- El adaptador se entrenó y evaluó con thinking desactivado; el autor recomienda mantenerlo así. Su uso con thinking activado puede degradar el comportamiento esperado.
- Es una cuantización de 8 bits: no es idéntica al bf16 (99,2 % de coincidencia en el siguiente token, KL 0,0004); para máxima fidelidad existe la build bf16 de 55,6 GB.
- Formato MLX exclusivo para Apple Silicon; no es desplegable directamente en GPU NVIDIA sin recurrir a la familia GGUF del mismo autor.
- Longitud de contexto e idiomas soportados no documentados en la información disponible; conviene verificarlos antes de usarlo en producción con prompts largos o en idiomas distintos del inglés.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; como modelo generativo aplicado a código, debe validarse la salida (tests, revisión) antes de aplicarla.
- Licencia Apache 2.0, que permite uso comercial; aun así, deben respetarse las condiciones del modelo base Qwen3.8-27B y del adaptador original.
- El repositorio tiene 509 descargas y 1 like en el momento de la consulta; es una build de la comunidad, no oficial de Qwen ni de harness-hub.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de 6 bits (recomendada): https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-4bit
- Build de 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-3bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-bf16
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-adapter
- Familia GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-GGUF
- Perfil del autor de las builds: https://huggingface.co/netprojects
- OpenCode: https://opencode.ai
- Configuración de OpenCode: https://opencode.ai/config.json
