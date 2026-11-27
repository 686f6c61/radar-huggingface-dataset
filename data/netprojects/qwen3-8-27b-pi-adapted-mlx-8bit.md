# netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit

## Resumen

Qwen3.8-27B-pi-adapted-MLX-8bit es una cuantización de 8 bits en formato MLX del modelo harness-hub/Qwen3.8-27B-pi-adapted, que a su vez es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.8-27B. El adaptador original fue entrenado por harness-hub con aprendizaje por refuerzo (AsyncGRPO en TRL) para convertir al modelo en el motor del agente de programación pi, especializado en tareas de ingeniería de software y operación de terminal. Esta build concreta, publicada por netprojects, fusiona el adaptador en el modelo base y lo convierte a MLX con mlx-vlm, incluyendo el codificador de visión y la capa MTP de Qwen.

El modelo resuelve el problema de ejecutar un agente de código capaz de resolver tareas reales de terminal y repositorio en hardware Apple Silicon, sin depender de GPUs NVIDIA ni de servicios en la nube. Con 27.781.427.952 parámetros totales y un peso de repositorio de 30,0 GB, está pensado para Macs de 64 GB o más, donde es la build de mayor fidelidad respecto a bf16 dentro de la familia de cuantizaciones publicada.

Su relevancia actual radica en la combinación de tres factores: un ajuste por RL específicamente orientado a tareas de agente (no solo a generación de código aislada), una cuantización de 8 bits que conserva el 99,1 % de coincidencia en el siguiente token respecto a bf16 con una divergencia KL de solo 0,0004, y un pipeline image-text-to-text que añade capacidades de visión. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con codificador de visión y capa MTP, según tags qwen3_5 |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín, group size 64 (esta build); la familia incluye 2.5, 3, 4, 6 y 8 bits, bf16 y adaptador LoRA |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B (revisión 3756181), un transformer multimodal de 27,8 mil millones de parámetros con codificador de visión y una capa MTP (multi-token prediction) que se conserva en esta conversión. Sobre esa base, harness-hub aplicó un ajuste LoRA entrenado con aprendizaje por refuerzo mediante AsyncGRPO en TRL, con el objetivo de optimizar el comportamiento del modelo como agente de programación pi en tareas de ingeniería de software y terminal. El adaptador se fusionó en los pesos base (revisión e786f84) y el conjunto se convirtió a MLX con mlx-vlm.

La innovación principal no está en la arquitectura sino en el proceso de alineamiento: el entrenamiento por RL con recompensas basadas en resolución efectiva de tareas produjo mejoras sustanciales en benchmarks de agente y, según el autor, una reducción del 55-64 % en el número de llamadas a herramientas por tarea. Esta build de 8 bits aplica cuantización afín con group size 64 únicamente a las capas lineales, manteniendo el codificador de visión y la capa MTP. El tokenizador y la plantilla de chat son los archivos originales de harness-hub, sin modificar, por lo que conserva el vocabulario y el formato de tool calls XML de Qwen3.8-27B.

## Capacidades

- Generación de texto y razonamiento general sobre el modelo base Qwen3.8-27B.
- Comprensión de imágenes (pipeline image-text-to-text): capturas de pantalla, diagramas y, según los ejemplos del autor, salidas de terminal renderizadas.
- Agente de programación: resolución de tareas de software-engineering y operación de terminal, con integración nativa en el agente pi.
- Tool calling / function calling en formato XML de Qwen (`<tool_call><function=...`), compatible con la API Chat Completions de OpenAI.
- Razonamiento multi-paso orientado a agentes, con reducción del número de llamadas a herramientas observada en la evaluación del adaptador.
- Modo thinking disponible pero desaconsejado: el adaptador fue entrenado y evaluado con thinking desactivado.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de terminal local en Mac: ejecutar pi contra el servidor OpenAI-compatible de mlx-lm para diagnosticar y corregir fallos en repositorios, aprovechando la mejora reportada en Terminal-Bench 2.1 (39,5 % → 55,8 %) y la reducción de llamadas a herramientas.
- Resolución de issues de software-engineering: usar el modelo como backend de un agente que lee el repositorio, planifica cambios y aplica parches, con el rendimiento reportado en SWE-bench Pro hard 51 (29,4 % → 62,7 %).
- Análisis de errores a partir de capturas: enviar una imagen de una terminal o un IDE con un stack trace y pedir al modelo que identifique la causa, gracias al pipeline image-text-to-text y al codificador de visión incluido.
- Asistencia de programación en el editor: servir el modelo con mlx_lm.server y conectarlo a clientes compatibles con la API Chat Completions de OpenAI para autocompletado, explicación de código y generación de tests.
- Automatización de tareas de CI/CD asistida: integrar el modelo como paso de revisión que interpreta logs de build y propone correcciones, manteniendo thinking desactivado para reducir latencia y coste por tarea.
- Desarrollo y evaluación de agentes de código en local: usar esta build de 8 bits como referencia cercana a bf16 (99,1 % de coincidencia en el siguiente token, KL 0,0004) para reproducir resultados del adaptador sin necesidad de una GPU dedicada.
- Prototipado multimodal en Apple Silicon: emplear mlx-vlm para tareas que combinan imagen y texto (descripción de diagramas, lectura de interfaces) en un Mac de 64 GB o más.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador, bajo el agente pi y con thinking desactivado, frente al modelo base:

| Benchmark | Modelo base | Adaptador pi | Mejora |
|---|---|---|---|
| Terminal-Bench 2.1 | 39,5 % | 55,8 % | +16,3 puntos |
| SWE-bench Pro (hard 51) | 29,4 % | 62,7 % | +33,3 puntos |
| Llamadas a herramientas por tarea | referencia | 55-64 % menos | reducción |

Fidelidad de las cuantizaciones MLX respecto a bf16:

| Build | Tamano | Coincidencia siguiente token vs bf16 | KL vs bf16 |
|---|---|---|---|
| 6 bits (recomendada) | 23,1 GB | 99,0 % | 0,0015 |
| 8 bits (esta build) | 30,0 GB | 99,1 % | 0,0004 |
| 4 bits | 16,3 GB | 95,6 % | 0,0201 |
| 3 bits | 13,8 GB | 91,4 % | 0,0884 |
| 2,5 bits | 11,8 GB | 85,5 % | 0,2363 |
| bf16 | 55,6 GB | referencia | referencia |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta build ni para el modelo base.

## Requisitos de hardware

- VRAM/memoria unificada: 30,0 GB de pesos; el autor recomienda esta build para Macs de 64 GB o más, dejando margen para macOS y prompts largos (la descarga es como máximo el 60 % de la memoria del sistema).
- GPU recomendadas: Apple Silicon con memoria unificada de 64 GB o superior. No está pensada para GPUs NVIDIA; para ese hardware habría que usar otras builds o el modelo base.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en Macs de 64 GB o más. Para Macs de 48 GB existe la build de 6 bits (23,1 GB, recomendada por el autor); para 32 GB, la de 4 bits (16,3 GB); para 24 GB, la de 3 bits (13,8 GB); para 16 GB, la de 2,5 bits (11,8 GB) o el GGUF IQ2_M (10,2 GB).
- Opciones de despliegue: mlx-lm (servidor OpenAI-compatible con `mlx_lm.server`), mlx-vlm (inferencia multimodal), LM Studio en modo MLX. Para llama.cpp, Ollama o LM Studio con GGUF, el autor publica una familia GGUF separada (Q3_K_M, Q4_K_M, Q6_K, Q8_0, IQ2_M).
- Ajuste de memoria: el autor sugiere `sudo sysctl iogpu.wired_limit_mb=12800` en Macs de 16 GB como medida de emergencia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted-MLX-8bit (esta ficha) | 27,78 B | no disponible | Agente de código y terminal, multimodal | Apache 2.0 | MLX, Apple Silicon |
| Qwen3.8-27B-pi-adapted-MLX-6bit | 27,78 B | no disponible | Igual, cuantización 6 bits | Apache 2.0 | MLX, Apple Silicon |
| Qwen3.8-27B-pi-adapted-MLX-4bit | 27,78 B | no disponible | Igual, cuantización 4 bits | Apache 2.0 | MLX, Apple Silicon |
| Qwen3.8-27B-pi-adapted (adaptador original) | 27,78 B | no disponible | Agente de código y terminal | Apache 2.0 | Pesos del adaptador LoRA |
| Qwen/Qwen3.8-27B (base) | 27,78 B | no disponible | Modelo multimodal general | no disponible | Pesos originales |

La comparación más directa es con las otras builds de la misma familia: la de 6 bits es la recomendada por el autor por su equilibrio tamaño/fidelidad, mientras que esta de 8 bits es la más cercana a bf16 dentro de las cuantizaciones. Frente al modelo base, la diferencia está en el ajuste por RL para tareas de agente, no en el tamaño ni en la arquitectura.

## Limitaciones y advertencias

- El adaptador fue entrenado y evaluado con thinking desactivado; activarlo puede degradar el comportamiento esperado. El autor recomienda mantenerlo apagado y usar `enable_thinking: false` en la plantilla de chat.
- El adaptador se entrenó con la API Chat Completions, no con la Responses API; usar la API incorrecta puede romper el formato de tool calls.
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de Qwen3.8-27B, hereda los sesgos del modelo base, que no se documentan aquí.
- Riesgo de alucinación: no cuantificado en la información disponible; como agente de código, las alucinaciones pueden traducirse en parches incorrectos o comandos de terminal peligrosos, por lo que conviene ejecutar en entornos aislados.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles; no se debe asumir cobertura multilingüe sin verificación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.8-27B y del adaptador original, cuyas licencias no se detallan en la información proporcionada.
- La cuantización de 8 bits introduce una divergencia mínima pero no nula respecto a bf16 (KL 0,0004, 99,1 % de coincidencia); para resultados de referencia exactos, usar la build bf16 (55,6 GB).
- El tamaño de 30,0 GB limita su uso a Macs de 64 GB o más; en equipos menores hay que recurrir a builds más agresivas con pérdida de fidelidad notable (por ejemplo, 2,5 bits con 85,5 % de coincidencia).
- El modelo está empaquetado para MLX; no es directamente utilizable en GPUs NVIDIA sin reconversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de 6 bits (recomendada): https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit
- Build de 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-3bit
- Build de 2,5 bits: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-2.5bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-bf16
- Adaptador LoRA para mlx-lm: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-adapter
- Familia GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-GGUF
- Repositorio del agente pi: https://github.com/earendil-works/pi
- Perfil del autor de las cuantizaciones: https://huggingface.co/netprojects
