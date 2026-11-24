# netprojects/Qwen3.8-27B-opencode-adapted-MLX-4bit

## Resumen

Qwen3.8-27B-opencode-adapted-MLX-4bit es una cuantización de 4 bits en formato MLX del modelo harness-hub/Qwen3.8-27B-opencode-adapted, un ajuste fino mediante LoRA con aprendizaje por refuerzo (AsyncGRPO en TRL) sobre Qwen/Qwen3.8-27B. El objetivo del adaptador es convertir el modelo base en el motor detrás del agente de programación OpenCode, especializado en tareas de ingeniería de software y operaciones de terminal. Esta build concreta, publicada por el usuario netprojects, empaqueta el adaptador ya fusionado con el modelo base y lo convierte a MLX para su ejecución en Apple Silicon, incluyendo el codificador de visión y la capa de predicción multi-token (MTP) de Qwen.

El modelo cuenta con 27.781.427.952 parámetros totales y un repositorio de 16,3 GB, resultado de cuantizar las capas lineales a 4 bits con cuantización afín y grupo de 64. La fidelidad respecto al modelo en bf16 es del 96,7 % en coincidencia del siguiente token, con una divergencia KL de 0,0203, lo que lo sitúa como la opción de menor huella de memoria de la familia, pensada para Macs con recursos limitados.

Su relevancia actual radica en que permite ejecutar localmente en hardware Apple un agente de código con capacidades de visión y tool calling, con un rendimiento declarado por el autor del adaptador de 51,0 % en SWE-bench Pro (hard 51) y 52,4 % en Terminal-Bench 2.1 con el modo thinking desactivado, además de una aceleración de decodificación de aproximadamente 1,9× gracias a la capa MTP integrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capa MTP, basado en Qwen3.8-27B |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín, grupo 64 (lineales); existen builds 3, 6, 8 bits y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer multimodal que procesa texto e imágenes (pipeline image-text-to-text) e incorpora una capa de predicción multi-token (MTP) propia de Qwen, conservada en el fichero `model-mtp.safetensors` y cuantizada al mismo nivel que el resto de la build. Sobre ese base, harness-hub entrenó un adaptador LoRA mediante aprendizaje por refuerzo con AsyncGRPO en TRL, orientado a tareas de ingeniería de software y terminal dentro del agente OpenCode. El adaptador se fusionó con el modelo base (revisión `b4171c0` sobre `3756181`) y el conjunto se convirtió a MLX con mlx-vlm, incluyendo el codificador de visión.

La innovación técnica destacable es la conservación de la capa MTP de Qwen como modelo borrador integrado para decodificación especulativa: al pasar el mismo repositorio como `--draft-model` con `--draft-kind mtp`, mlx-vlm la utiliza para acelerar la decodificación aproximadamente 1,9× sin descarga adicional. También es compatible con el drafter DSpine (netprojects/Qwen3.8-27B-DSpine-b16-MLX) a través de dspine-hybrid-mlx. El tokenizador y la plantilla de chat son los originales de harness-hub, sin cambios, por lo que mantienen el vocabulario y el formato de tool calls de Qwen3.8-27B. No se dispone de datos sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto y razonamiento general, heredados de Qwen3.8-27B.
- Generación y comprensión de código, con especialización en tareas de ingeniería de software y operaciones de terminal mediante el ajuste con RL.
- Procesamiento de imágenes (image-text-to-text): análisis de capturas de pantalla, terminales y contenido visual, ejecutable con mlx-vlm.
- Tool calling / function calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Soporte de agentes y razonamiento multi-paso, entrenado específicamente como motor del agente OpenCode.
- Modo thinking configurable (`enable_thinking`), aunque el adaptador fue entrenado y evaluado con thinking desactivado.
- Decodificación especulativa mediante capa MTP integrada o drafter DSpine.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agente de programación local en macOS: servir el modelo con `mlx_lm.server` y conectarlo a OpenCode mediante un proveedor compatible con OpenAI, permitiendo tareas como localizar y corregir tests fallidos sin enviar código a servicios externos.
- Resolución de incidencias en terminal: el ajuste con RL sobre tareas de terminal permite al agente interpretar salidas de comandos, diagnosticar errores y aplicar correcciones en un flujo multi-paso.
- Análisis de capturas de pantalla de errores: gracias al codificador de visión, se puede pasar una imagen de una terminal o IDE y preguntar por el error mostrado, útil para soporte técnico interno.
- Automatización de refactorizaciones y corrección de bugs en pipelines de desarrollo: integrado vía API compatible con OpenAI, puede invocarse desde scripts o herramientas de CI para tareas de análisis y parcheo acotadas.
- Asistente de código en el editor para desarrolladores con Mac: al ocupar 16,3 GB, cabe en equipos con memoria unificada moderada, ofreciendo un asistente privado sin dependencia de la nube.
- Evaluación e investigación de agentes de código: sirve como banco de pruebas local para estudiar el comportamiento de un modelo ajustado con GRPO en tareas SWE-bench y Terminal-Bench, con la opción de comparar contra las builds de 6 y 8 bits.
- Prototipado de flujos con decodificación especulativa: la capa MTP y el drafter DSpine permiten medir el impacto de la aceleración en latencia sobre hardware Apple en cargas de generación de código.

## Benchmarks y rendimiento

Resultados publicados por el autor del adaptador (harness-hub), bajo OpenCode y con thinking desactivado, comparando el adaptador frente al modelo base:

| Benchmark | Modelo base | Adaptador OpenCode |
|---|---|---|
| SWE-bench Pro (hard 51) | 35,3 % | 51,0 % |
| Terminal-Bench 2.1 | 46,4 % | 52,4 % |

Fidelidad de las cuantizaciones respecto a bf16 (builds de netprojects):

| Build | Tamano | Mismo siguiente token que bf16 | KL vs bf16 |
|---|---|---|---|
| 6 bits (recomendada) | 23,1 GB | 98,7 % | 0,0014 |
| 8 bits | 30,0 GB | 99,2 % | 0,0004 |
| 4 bits | 16,3 GB | 96,7 % | 0,0203 |
| 3 bits | 13,8 GB | 93,4 % | 0,0812 |
| bf16 | 55,6 GB | referencia | referencia |

Rendimiento de decodificación medido por el autor (greedy, thinking off, 5 prompts × 256 tokens, con otros servicios en la Mac, valores indicativos):

| Build | Plano | MTP (mlx-vlm 0.7.11) | DSpine v0.2.1 (drafter 4 bits, bloque 5) |
|---|---|---|---|
| 4 bits | 33 tok/s | 62 tok/s (×1,91) | 73 tok/s (×2,29) |
| 6 bits | 20 tok/s | 21 tok/s (×1,04) | 60 tok/s (×2,72) |
| 8 bits | 17 tok/s | 37 tok/s (×2,15) | 54 tok/s (×3,03) |

No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 16,3 GB de pesos en 4 bits; se recomienda margen adicional para el contexto y el codificador de visión, por lo que un Mac con 24 GB o más es el objetivo práctico.
- Hardware: exclusivamente Apple Silicon (formato MLX); no es ejecutable en GPU NVIDIA o AMD sin reconversión.
- Cabe en Macs consumer con memoria unificada de 24 GB o superior; la build de 3 bits (13,8 GB) está pensada para Macs de 24 GB justos.
- Despliegue: mlx-lm (servidor compatible con OpenAI, `mlx_lm.server`) para texto y mlx-vlm para imagen; requiere mlx-lm >= 0.32.2 y mlx-vlm >= 0.7.11.
- Aceleración: capa MTP integrada (~1,9× en 4 bits) o drafter DSpine (~2,29× en 4 bits).
- Throughput medido: 33 tok/s en decodificación plana y hasta 73 tok/s con DSpine en la build de 4 bits, en condiciones indicativas con carga concurrente en la máquina.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-opencode-adapted-MLX-4bit | 27,78 B | no disponible | 4 bits MLX | Apache 2.0 | Hugging Face |
| netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit | 27,78 B | no disponible | 6 bits MLX | Apache 2.0 | Hugging Face |
| netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit | 27,78 B | no disponible | 8 bits MLX | Apache 2.0 | Hugging Face |
| harness-hub/Qwen3.8-27B-opencode-adapted | 27,78 B (estimado) | no disponible | bf16 | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de modelos alternativos de otros autores en la información proporcionada para establecer una comparación cruzada de rendimiento.

## Limitaciones y advertencias

- La cuantización a 4 bits introduce divergencia respecto a bf16 (96,7 % de coincidencia del siguiente token, KL 0,0203), superior a las builds de 6 y 8 bits; para tareas sensibles a la fidelidad se recomienda la build de 6 bits.
- El adaptador fue entrenado y evaluado con thinking desactivado; activar el modo thinking puede degradar el comportamiento esperado.
- Con decodificación especulativa y greedy, el texto coincide con la decodificación plana hasta un empate cercano, donde la comprobación por lotes puede redondear al otro lado; respuestas largas pueden divergir ligeramente.
- Las mediciones de rendimiento fueron tomadas con otros servicios ejecutándose en la Mac y deben tratarse como indicativas, no como cifras de producción.
- Exclusivo de Apple Silicon: no hay soporte para CUDA ni ROCm en este repositorio.
- No se dispone de información sobre sesgos, idiomas soportados ni evaluación de alucinación específica para este ajuste.
- Licencia Apache 2.0, que permite uso comercial con las obligaciones habituales de atribución y aviso; conviene verificar las condiciones del modelo base Qwen3.8-27B y del adaptador original.
- El ajuste está orientado a tareas de código y terminal; su comportamiento en dominios generales puede diferir del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-4bit
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit
- Build de 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-3bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-bf16
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-adapter
- Drafter DSpine: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Repositorio dspine-hybrid-mlx: https://github.com/internet-projects/dspine-hybrid-mlx
- OpenCode: https://opencode.ai
