# netprojects/Qwen3.8-27B-opencode-MLX-bf16

## Resumen

Qwen3.8-27B-opencode-MLX-bf16 es una conversión a formato MLX, en precisión bf16, del modelo harness-hub/Qwen3.8-27B-opencode-adapted, un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.8-27B orientado a tareas de agente de programación. Lo publica el usuario netprojects y está pensado específicamente para ejecutarse en Apple Silicon mediante la librería MLX (mlx-lm y mlx-vlm), incluyendo el codificador de visión y la capa MTP (multi-token prediction) del modelo original de Qwen.

El interés del modelo reside en que el adaptador de harness-hub se entrenó con aprendizaje por refuerzo (AsyncGRPO en TRL) para actuar como motor del agente de programación OpenCode en tareas de ingeniería de software y de terminal. Según los resultados publicados por el autor del adaptador, con el modo de razonamiento desactivado mejora SWE-bench Pro (hard 51) del 35,3% al 51,0% y Terminal-Bench 2.1 del 46,4% al 52,4% respecto al modelo base, y con thinking desactivado iguala al modelo base con thinking en su esfuerzo máximo generando aproximadamente una sexta parte de los tokens.

Esta build concreta es la de referencia en fidelidad: 55,6 GB de pesos en bf16, sin pérdida de cuantización, pensada para Macs con 128 GB de memoria unificada o más. Para equipos con menos memoria el autor recomienda la build de 6 bits (23,1 GB, 98,7% de coincidencia en el siguiente token respecto a bf16), y ofrece alternativas de 8, 4 y 3 bits, además de una versión GGUF para llama.cpp y Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.8-27B, con codificador de visión y capa MTP; conversión MLX vía mlx-vlm |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (esta build); el autor publica además 8-bit, 6-bit, 4-bit, 3-bit en MLX y GGUF (IQ2_M, Q3_K_M, Q4_K_M, Q6_K, Q8_0) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx); existe variante GGUF y un adaptador LoRA MLX de 638 MB para mlx-lm |

## Arquitectura y entrenamiento

La build parte de Qwen/Qwen3.8-27B (revisión 3756181), un transformer multimodal de unos 27,8 mil millones de parámetros con codificador de visión y una capa de multi-token prediction (MTP), que el autor de esta conversión incluye explícitamente en el peso MLX. Sobre ese modelo base, harness-hub aplicó un LoRA entrenado con aprendizaje por refuerzo mediante AsyncGRPO en TRL, con el objetivo de convertirlo en el motor del agente de programación OpenCode en tareas de ingeniería de software y de terminal. La conversión a MLX se realizó con mlx-vlm y los pesos se mantienen en bf16, sin cuantización, por lo que esta build es la referencia de fidelidad frente a la que se miden las demás (6-bit con 98,7% de coincidencia en el siguiente token y KL 0,0014; 8-bit con 99,2% y KL 0,0004; 4-bit con 96,7% y KL 0,0203; 3-bit con 93,4% y KL 0,0812).

El tokenizador y la plantilla de chat son los archivos originales de harness-hub, sin modificar, de modo que el vocabulario y el formato de llamada a herramientas son idénticos a los de Qwen3.8-27B. Las llamadas a herramientas usan el formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm devuelve como `tool_calls` en formato OpenAI. El adaptador se entrenó y evaluó con el modo thinking desactivado, y el autor recomienda mantenerlo así en producción.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat compatible con OpenAI.
- Razonamiento y resolución de tareas de ingeniería de software: localización y corrección de bugs, edición de repositorios, ejecución de pruebas.
- Operación de terminal y tareas de línea de comandos (Terminal-Bench 2.1).
- Llamada a herramientas (tool calling / function calling) en formato XML de Qwen, expuesto como `tool_calls` de OpenAI por el servidor de mlx-lm.
- Uso como agente de programación multi-paso integrado en OpenCode mediante un endpoint compatible con OpenAI.
- Comprensión de imágenes (pipeline image-text-to-text): lectura de capturas de pantalla, salidas de terminal o diagramas vía mlx-vlm.
- Modo thinking configurable (desactivado por defecto y recomendado desactivado, según el autor).
- Decodificación acelerada mediante la capa MTP incluida en la conversión (el README menciona una sección de decodificación más rápida que queda truncada en la información disponible).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Corrección automática de bugs en repositorios: el modelo puede recibir el fallo de una suite de pruebas (por ejemplo, `tests/test_parser.py`) y localizar y parchear el código, que es exactamente el escenario para el que se entrenó con RL y el que documenta el ejemplo de OpenCode del README.
- Agente de terminal en local: ejecutar tareas de línea de comandos encadenando llamadas a herramientas, adecuado porque el adaptador mejora Terminal-Bench 2.1 del 46,4% al 52,4% frente al base.
- Asistente de programación integrado en el IDE o en OpenCode: servir el modelo con `mlx_lm.server` en el puerto 8000 y registrarlo como proveedor compatible con OpenAI en `opencode.json`, con lo que se obtiene un agente de código totalmente local en un Mac.
- Análisis de capturas de pantalla y salidas de terminal: usando mlx-vlm se puede preguntar al modelo qué error muestra una captura de terminal, útil para depuración asistida sin enviar datos a la nube.
- Automatización de tareas de refactorización y mantenimiento: al conservar el vocabulario y el formato de tool calls de Qwen3.8-27B, se puede reutilizar el mismo pipeline de herramientas y prompts que con el modelo base.
- Evaluación e investigación de ajuste fino con RL: al publicarse el adaptador LoRA por separado (638 MB) y las builds cuantizadas con métricas de KL y coincidencia de siguiente token, sirve para estudiar el impacto de la cuantización en un modelo entrenado con GRPO.
- Despliegue de referencia en estaciones de trabajo Apple de gran memoria: con 55,6 GB en bf16 encaja en Macs de 128 GB y permite reproducir los resultados del adaptador sin degradación por cuantización.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador, evaluados en OpenCode con thinking desactivado, frente al modelo base Qwen3.8-27B:

| Benchmark | Modelo base | Adaptador opencode | Mejora |
|---|---|---|---|
| SWE-bench Pro (hard 51) | 35,3% | 51,0% | +15,7 puntos |
| Terminal-Bench 2.1 | 46,4% | 52,4% | +6,0 puntos |

Fidelidad de las builds MLX respecto a bf16 (según el autor):

| Build | Tamano | Coincidencia siguiente token vs bf16 | KL vs bf16 |
|---|---|---|---|
| 8-bit | 30,0 GB | 99,2% | 0,0004 |
| 6-bit (recomendada) | 23,1 GB | 98,7% | 0,0014 |
| 4-bit | 16,3 GB | 96,7% | 0,0203 |
| 3-bit | 13,8 GB | 93,4% | 0,0812 |
| bf16 (esta build) | 55,6 GB | referencia | referencia |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de conocimiento general para este modelo.

## Requisitos de hardware

- Esta build bf16 ocupa 55,6 GB en disco y requiere un Mac con 128 GB de memoria unificada o más según la tabla del autor; el propio README la etiqueta como "reference" para 128 GB.
- VRAM/memoria estimada para inferencia según la tabla del autor: 3-bit 13,8 GB (Mac de 24 GB), 4-bit 16,3 GB (32 GB), 6-bit 23,1 GB (48 GB, recomendada), 8-bit 30,0 GB (64 GB o más), bf16 55,6 GB (128 GB).
- En GGUF: IQ2_M 10,2 GB (16 GB en modo "stretch"), Q3_K_M 13,5 GB (24 GB), Q4_K_M 16,8 GB (32 GB), Q6_K 22,4 GB (48 GB), Q8_0 29,0 GB (64 GB o más).
- No está pensado para GPU NVIDIA: la librería es MLX y el destino es Apple Silicon. Para CUDA habría que usar otras builds del adaptador no listadas en la información disponible.
- Opciones de despliegue: `mlx_lm.server` (servidor compatible con OpenAI, requiere mlx-lm >= 0.32.2), mlx-lm desde Python para texto, mlx-vlm >= 0.7.11 para imagen, LM Studio en modo MLX, y llama.cpp/Ollama/LM Studio con las builds GGUF.
- El autor recomienda que la descarga no supere aproximadamente el 60% de la memoria del equipo para dejar sitio a macOS y a prompts largos; en equipos de 16 GB sugiere `sudo sysctl iogpu.wired_limit_mb=12800` como ajuste temporal.
- Latencia y throughput: no disponibles en la información proporcionada; el README menciona una sección de decodificación más rápida mediante MTP que aparece truncada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-opencode-MLX-bf16 (esta ficha) | 27,78 mil millones | no disponible | Agente de código, MLX bf16 | Apache 2.0 | Hugging Face, 196 descargas |
| harness-hub/Qwen3.8-27B-opencode-adapted | no disponible (base 27,8 mil millones) | no disponible | Adaptador LoRA original con RL | Apache 2.0 (según esta ficha) | Hugging Face |
| Qwen/Qwen3.8-27B | 27,8 mil millones (aprox.) | no disponible | Modelo base multimodal | no disponible en la información | Hugging Face |
| Builds MLX cuantizadas del mismo adaptador (3/4/6/8-bit) | 27,78 mil millones | no disponible | Misma tarea, menor huella de memoria | Apache 2.0 | Hugging Face |

No se dispone en la información proporcionada de datos de benchmarks de modelos alternativos de otros fabricantes para una comparación cuantitativa; la comparación disponible se limita a las variantes del propio adaptador y al modelo base.

## Limitaciones y advertencias

- El adaptador se entrenó y evaluó con thinking desactivado; el autor recomienda mantenerlo así. Usarlo con thinking activado puede degradar el comportamiento esperado.
- Es una conversión de pesos, no un modelo nuevo: hereda los sesgos, el riesgo de alucinación y las limitaciones del modelo base Qwen3.8-27B y del ajuste con RL sobre tareas de código y terminal.
- El ajuste está especializado en ingeniería de software y terminal; su rendimiento en dominios generales no se documenta en la información disponible.
- Idiomas soportados y longitud de contexto no se especifican; no se debe asumir un contexto largo sin verificarlo contra el modelo base.
- Exclusivo de Apple Silicon (MLX); no se puede ejecutar con CUDA ni con GPUs NVIDIA en este formato.
- La build bf16 necesita 128 GB de memoria unificada según el autor; en equipos menores hay que usar las builds cuantizadas, con la pérdida de fidelidad indicada (la 3-bit baja al 93,4% de coincidencia en el siguiente token y KL 0,0812).
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y del adaptador original antes de producción.
- El repositorio tiene muy poca tracción (196 descargas y 1 like en el momento de la consulta) y fue creado en noviembre de 2026; no hay garantía de mantenimiento.
- El README contiene una sección truncada sobre decodificación acelerada con MTP, por lo que el beneficio real de esa función no está documentado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-bf16
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build MLX 6-bit (recomendada): https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- Build MLX 8-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit
- Build MLX 4-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-4bit
- Build MLX 3-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-3bit
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-adapter
- Builds GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-GGUF
- OpenCode: https://opencode.ai
- Perfil del autor en Hugging Face: https://huggingface.co/netprojects
