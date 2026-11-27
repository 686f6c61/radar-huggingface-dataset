# netprojects/Qwen3.8-27B-opencode-MLX-4bit

## Resumen

Qwen3.8-27B-opencode-MLX-4bit es una cuantización de 4 bits en formato MLX del modelo Qwen3.8-27B, adaptado mediante LoRA con aprendizaje por refuerzo (AsyncGRPO en TRL) para funcionar como motor del agente de programación OpenCode en tareas de ingeniería de software y terminal. Lo publica el usuario netprojects, mientras que el adaptador original procede de harness-hub y el modelo base de Qwen. El resultado es un modelo multimodal (image-text-to-text) de 27.781.427.952 parámetros empaquetado en 16,3 GB, pensado para ejecutarse en Apple Silicon.

El problema que resuelve es doble: por un lado, adapta un modelo generalista de 27B a tareas de agente de código con una mejora sustancial en benchmarks de ingeniería de software; por otro, ofrece una build cuantizada que cabe en Macs de 32 GB, algo imposible con los pesos en bf16 (55,6 GB). La cuantización es affine de 4 bits con grupo 64 sobre las capas lineales, e incluye el codificador de visión y la capa MTP (multi-token prediction) de Qwen convertidos con mlx-vlm.

Es relevante ahora porque permite desplegar localmente, sin conexión y en hardware de consumo Apple, un agente de código con capacidades de razonamiento, uso de herramientas y entrada de imágenes, manteniendo el 96,7 % de coincidencia en el siguiente token respecto a bf16 y una divergencia KL de 0,0203 frente a la referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) Qwen3.8 con capa MTP; cuantización MLX affine group 64 en capas lineales |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (esta build); el autor publica tambien 3-bit, 6-bit, 8-bit, bf16 y adaptador LoRA |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B (revisión `3756181`), un transformer multimodal con codificador de visión y una capa MTP (multi-token prediction) que se conserva en la conversión. Sobre él se aplicó el adaptador LoRA de harness-hub (revisión `b4171c0`), entrenado con aprendizaje por refuerzo mediante AsyncGRPO en TRL para optimizar el comportamiento como agente de OpenCode en tareas de ingeniería de software y terminal. La fusión del adaptador y la conversión a MLX se realizaron con mlx-vlm, incluyendo el codificador de visión.

La innovación destacable es la propia receta de adaptación: el adaptador fue entrenado y evaluado con el modo thinking desactivado, y según el autor iguala al modelo base con thinking a máxima intensidad generando aproximadamente una sexta parte de los tokens. La cuantización de esta build es affine de 4 bits con grupo 64, con una fidelidad medida de 96,7 % de coincidencia en el siguiente token y KL de 0,0203 frente a bf16.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Comprensión de imágenes (pipeline image-text-to-text): capturas de pantalla, terminales, diagramas.
- Agente de código: resolución de bugs, edición de ficheros, ejecución de comandos de terminal.
- Tool calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), expuesto por el servidor de mlx-lm como `tool_calls` compatible con OpenAI.
- Integración con el agente OpenCode mediante endpoint OpenAI-compatible.
- Modo thinking opcional (desactivado por defecto y recomendado desactivado para esta adaptación).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Depuración de tests en local: el modelo puede recibir el fallo de `tests/test_parser.py` vía OpenCode, inspeccionar el repositorio, ejecutar la suite y proponer el parche, aprovechando su entrenamiento específico en tareas de terminal.
- Agente de terminal autónomo: ejecución de comandos, lectura de salidas de error y corrección iterativa en máquinas macOS sin conexión a la nube, gracias a su despliegue local en MLX.
- Asistente de código en el editor: servir el modelo con `mlx_lm.server` y conectarlo a clientes compatibles con OpenAI para autocompletado, refactorización y explicación de código.
- Análisis de capturas de terminal o de errores visuales: usando mlx-vlm, el modelo interpreta una imagen de pantalla y responde qué error muestra, útil para soporte técnico interno.
- Automatización de tareas de ingeniería en CI local: integración en scripts que lanzan OpenCode contra un repositorio para triaje de issues y generación de parches preliminares.
- Prototipado de agentes multi-paso en investigación: al ser Apache 2.0 y ejecutable en un Mac de 32 GB, sirve como banco de pruebas para estudiar comportamiento de agentes con RL sin coste de API.
- Evaluación de cuantizaciones: comparar esta build de 4 bits con las de 6 y 8 bits del mismo autor para medir el impacto de la cuantización en tareas de código.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador, con thinking desactivado, bajo OpenCode:

| Benchmark | Modelo base | Adaptador opencode-adapted |
|---|---|---|
| SWE-bench Pro (hard 51) | 35,3 % | 51,0 % |
| Terminal-Bench 2.1 | 46,4 % | 52,4 % |

Fidelidad de la cuantización frente a bf16 (build de este repositorio):

| Build | Tamano | Coincidencia siguiente token vs bf16 | KL vs bf16 |
|---|---|---|---|
| 6-bit | 23,1 GB | 98,7 % | 0,0014 |
| 8-bit | 30,0 GB | 99,2 % | 0,0004 |
| 4-bit (esta) | 16,3 GB | 96,7 % | 0,0203 |
| 3-bit | 13,8 GB | 93,4 % | 0,0812 |
| bf16 | 55,6 GB | referencia | referencia |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta build cuantizada.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: 16,3 GB de pesos; el autor recomienda que la descarga no supere el 60 % de la memoria del equipo, por lo que encaja en Macs de 32 GB.
- Hardware objetivo: Apple Silicon (MLX). No aplica a GPU NVIDIA/AMD en esta build.
- Macs compatibles según el autor: 32 GB para esta build de 4 bits; 24 GB requiere la de 3 bits; 48 GB permite la de 6 bits (recomendada); 64 GB o más, la de 8 bits; 128 GB, bf16.
- En 16 GB solo es viable la versión GGUF IQ2_M (10,2 GB) mediante llama.cpp/Ollama, no esta build MLX.
- Despliegue: `mlx-lm>=0.32.2` (servidor OpenAI-compatible con `mlx_lm.server`), `mlx-vlm>=0.7.11` para imágenes, LM Studio con soporte MLX. Para GGUF, llama.cpp, Ollama o LM Studio.
- Ajuste opcional en Macs justos: `sudo sysctl iogpu.wired_limit_mb=12800` para ampliar el límite de memoria de GPU.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-opencode-MLX-4bit | 27,78 B | no disponible | Apache 2.0 | safetensors MLX 4-bit | Agente de código, multimodal, 16,3 GB |
| netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit | 27,78 B | no disponible | Apache 2.0 | safetensors MLX 6-bit | Recomendada por el autor, 23,1 GB, KL 0,0014 |
| netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit | 27,78 B | no disponible | Apache 2.0 | safetensors MLX 8-bit | Máxima fidelidad práctica, 30,0 GB |
| netprojects/Qwen3.8-27B-opencode-adapted-MLX-bf16 | 27,78 B | no disponible | Apache 2.0 | safetensors MLX bf16 | Referencia sin cuantizar, 55,6 GB |
| harness-hub/Qwen3.8-27B-opencode-adapted | 27,78 B | no disponible | no disponible | LoRA adaptador | Adaptador original entrenado con RL |
| Qwen/Qwen3.8-27B | 27,78 B | no disponible | no disponible | safetensors | Modelo base sin adaptar |

No se dispone de datos de benchmarks comparativos con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización de 4 bits introduce una divergencia medible frente a bf16 (KL 0,0203; 96,7 % de coincidencia en el siguiente token); para tareas sensibles puede degradar la precisión frente a las builds de 6 u 8 bits.
- El adaptador fue entrenado y evaluado con thinking desactivado; activarlo puede degradar el comportamiento esperado.
- Exclusivo de Apple Silicon en esta build; no es desplegable en GPU NVIDIA sin reconvertir.
- En Macs de 16 GB no cabe; solo la variante GGUF IQ2_M es viable en ese caso.
- No se documentan sesgos conocidos, idiomas soportados ni longitud de contexto en la información disponible.
- Riesgo de alucinación inherente a modelos generativos, agravado en tareas de código donde puede proponer parches plausibles pero incorrectos; requiere validación con tests.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.8-27B y del adaptador de harness-hub, no confirmadas en esta información.
- El modelo está especializado en tareas de agente de código; su rendimiento en dominios generales puede ser inferior al del modelo base.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/netprojects/Qwen3.8-27B-opencode-MLX-4bit
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build 6-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- Build 8-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit
- Build 3-bit: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-3bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-bf16
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-adapter
- Builds GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-GGUF
- OpenCode: https://opencode.ai
- Perfil del autor: https://huggingface.co/netprojects
