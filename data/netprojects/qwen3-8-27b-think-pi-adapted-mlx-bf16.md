# netprojects/Qwen3.8-27B-think-pi-adapted-MLX-bf16

## Resumen

Qwen3.8-27B-think-pi-adapted-MLX-bf16 es una conversión a formato MLX, en precisión bf16, del adaptador LoRA publicado por harness-hub sobre el modelo base Qwen/Qwen3.8-27B. El adaptador original fue entrenado mediante aprendizaje por refuerzo (AsyncGRPO en TRL) dentro del agente de programación pi, con el modo de razonamiento (thinking) activado y un esfuerzo de razonamiento «xhigh». Este repositorio, mantenido por netprojects, fusiona el adaptador con el modelo base y lo convierte a MLX con mlx-vlm, incluyendo el codificador de visión y la capa MTP (multi-token prediction) original de Qwen.

El modelo resuelve el problema de ejecutar un LLM de ~27.800 millones de parámetros con capacidades de agente de código y razonamiento largo directamente en Apple Silicon, sin necesidad de GPUs NVIDIA. La propuesta diferencial del adaptador es que mantiene la calidad del modelo base en tareas de ingeniería de software (SWE-bench Pro) y terminal (Terminal-Bench 2.1) generando aproximadamente un 42 % menos de tokens de salida en SWE-bench Pro (media) y un 35 % menos (mediana) en Terminal-Bench 2.1 respecto al adaptador con thinking de la misma familia.

La relevancia actual reside en tres factores: es una build de referencia en bf16 (55,6 GB) que sirve para validar la fidelidad de las versiones cuantizadas del mismo autor (6-bit, 8-bit, 4-bit), conserva la torre de visión y el pipeline image-text-to-text, y expone la capa MTP como modelo borrador para decodificación especulativa integrada en mlx-vlm. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8) con capa MTP y codificador de visión; conversión MLX |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bf16 en este repo; el autor publica variantes MLX de 4-bit, 6-bit y 8-bit, además de un adaptador LoRA suelto |
| Idiomas soportados | no disponible en la informacion proporcionada (heredados del modelo base Qwen3.8-27B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (incluye `model-mtp.safetensors` en bf16) |
| Tamano del repositorio | 55,6 GB |
| Modelo base | harness-hub/Qwen3.8-27B-think-pi-adapted (revision `c85fad6`) sobre Qwen/Qwen3.8-27B (revision `3756181`) |
| Libreria | mlx, mlx-vlm |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Qwen3.8 con 27,8 mil millones de parámetros, al que se añaden dos componentes relevantes: un codificador de visión que habilita la modalidad image-text-to-text y una capa de predicción multi-token (MTP) que Qwen incluye de serie y que aquí se conserva en bf16 sin modificar. La conversión a MLX se realizó con mlx-vlm e incluye tanto el codificador de visión como la capa MTP. El adaptador LoRA original fue entrenado por harness-hub con aprendizaje por refuerzo, concretamente AsyncGRPO implementado en TRL, dentro del agente de programación pi, con thinking activado, esfuerzo de razonamiento xhigh y un límite de salida de 32.768 tokens. Se publicó el checkpoint del paso 90, elegido entre los pasos 70, 90, 120 y 150.

El adaptador no modifica la capa MTP, por lo que esta sigue siendo la cabeza original de Qwen3.8-27B. En mlx-vlm se puede emplear como modelo borrador pasando el mismo repositorio con `--draft-model` y `--draft-kind mtp`, de modo que cada token propuesto se verifica con el modelo completo (decodificación especulativa). El tokenizador y la plantilla de chat son los archivos de harness-hub sin cambios, con el mismo vocabulario y el mismo formato de tool calls XML de Qwen3.8-27B. El autor no detalla en la información disponible la composición del dataset de RL ni el número de tokens de entrenamiento del modelo base.

## Capacidades

- Generación de texto y razonamiento explícito con modo thinking, entrenado y evaluado con thinking activado y esfuerzo xhigh.
- Programación y resolución de bugs en repositorios reales, con edición de código y ejecución de comandos en terminal (orientado al agente pi).
- Razonamiento multi-paso y uso de agentes: el adaptador está entrenado dentro de un bucle de agente de código.
- Tool calling / function calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm devuelve como `tool_calls` compatibles con OpenAI.
- Capacidades de visión: pipeline image-text-to-text, útil para interpretar capturas de terminal, diagramas o interfaces.
- Comprensión de imágenes mediante mlx-vlm (`mlx_vlm.generate --image ... --enable-thinking`).
- Decodificación especulativa mediante la capa MTP integrada como modelo borrador.
- Multilingüismo: no se especifican idiomas en la información disponible; se heredan del modelo base Qwen3.8-27B.

## Casos de uso

- Reparación automática de tests en un repositorio: el modelo puede recibir el fallo de `tests/test_parser.py`, inspeccionar el código, razonar sobre la causa y aplicar el parche, que es exactamente el escenario del ejemplo de la model card con `pi --print`.
- Agente de terminal para tareas de DevOps: con Terminal-Bench 2.1 como referencia (57,5 % en 87 tareas) y tool calling XML, encaja en flujos donde el agente debe ejecutar comandos, leer salidas y corregir errores de forma iterativa.
- Asistente de código local en un Mac: al ejecutarse con mlx-lm sobre Apple Silicon, permite mantener el código y los prompts en la máquina, sin enviar repositorios a servicios externos.
- Revisión de capturas de terminal o de errores en pantalla: gracias al pipeline image-text-to-text, se puede pasar una imagen de la terminal y preguntar qué error muestra, como ilustra el ejemplo con `screenshot.png`.
- Servidor OpenAI-compatible para integrar en herramientas existentes: `mlx_lm.server` expone `/v1` con `openai-completions`, de modo que editores, scripts o frameworks que hablan Chat Completions pueden apuntar a `http://localhost:8000/v1`.
- Prototipado y validación de cuantizaciones: al ser la build bf16 de referencia, sirve para medir la fidelidad de las variantes 4/6/8-bit del mismo autor antes de desplegarlas en máquinas con menos memoria.
- Aceleración de inferencia con MTP: usar la capa MTP como draft model en mlx-vlm para reducir latencia en generación greedy con verificación del modelo completo.
- Tareas de razonamiento largo con salida extensa: el límite de 32.768 tokens de salida empleado en entrenamiento permite cadenas de pensamiento largas sin truncamientos si se configura `maxTokens` en consecuencia.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador, bajo pi, con thinking activado y un intento por tarea:

| Benchmark | Qwen3.8-27B, thinking | pi-adapted, thinking | think-pi (este adaptador) |
|---|---|---|---|
| SWE-bench Pro (hard 51) | 74,5 % | 74,5 % | 76,5 % |
| Terminal-Bench 2.1 (87 tareas) | 60,9 % | 59,8 % | 57,5 % |

El autor del adaptador indica que las diferencias de puntuación no son significativas y que los tres se consideran al mismo nivel. La ventaja medida es de eficiencia: aproximadamente un 42 % menos de tokens de salida (media) en SWE-bench Pro y un 35 % menos (mediana) en Terminal-Bench 2.1 frente a pi-adapted con thinking.

Métricas de fidelidad de las builds MLX del mismo autor, con GSM8K sobre 50 preguntas y memoria pico con prompt de 8K tokens:

| Build | Tamano | Mismo siguiente token que bf16 | KL vs bf16 | GSM8K (50) | Memoria pico (8K) | RAM de Mac sugerida |
|---|---|---|---|---|---|---|
| MLX-6bit (recomendada) | 23,1 GB | 98,8 % | 0,0014 | 46/50 | 23,4 GB | 36 GB+ |
| MLX-8bit | 30,0 GB | 99,1 % | 0,0004 | 44/50 | 29,7 GB | 48 GB+ |
| MLX-4bit | 16,3 GB | 96,0 % | 0,0187 | 46/50 | 17,1 GB | 32 GB+ |
| MLX-bf16 (este repo) | 55,6 GB | referencia | referencia | 45/50 | 53,4 GB | 96 GB+ |

## Requisitos de hardware

- Este repositorio en bf16 ocupa 55,6 GB y requiere un Mac con 96 GB de memoria unificada o más; la memoria pico medida con un prompt de 8K tokens es de 53,4 GB.
- Para equipos con menos memoria, el autor recomienda la build de 6-bit (23,1 GB, 36 GB+ de RAM), la de 8-bit (30,0 GB, 48 GB+) o la de 4-bit (16,3 GB, 32 GB+).
- No aplica a GPUs NVIDIA/AMD: la build es específica de MLX y Apple Silicon; no se proporcionan requisitos de VRAM para A100, H100 o RTX 4090.
- Despliegue: `mlx_lm.server` (servidor compatible con OpenAI Chat Completions) para texto; `mlx-vlm` para entrada de imágenes; requiere `mlx-lm>=0.32.2` y `mlx-vlm>=0.7.11`.
- Integración con el agente pi mediante `~/.pi/agent/models.json`, con `"api": "openai-completions"` y `maxTokens` de 32768; pi requiere Node.js 22.19 o superior.
- Decodificación especulativa: pasar el mismo repositorio como `--draft-model` con `--draft-kind mtp` en mlx-vlm.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-think-pi-adapted-MLX-bf16 (este) | 27,8 B | no disponible | Agente de código con thinking, MLX bf16, visión y MTP | Apache 2.0 | Hugging Face, 0 descargas |
| harness-hub/Qwen3.8-27B-think-pi-adapted | 27,8 B | no disponible | Adaptador LoRA original entrenado con RL en pi | Apache 2.0 (según repo derivado) | Hugging Face |
| harness-hub/Qwen3.8-27B-pi-adapted | 27,8 B | no disponible | Hermano con thinking desactivado | no disponible en la informacion | Hugging Face |
| Qwen/Qwen3.8-27B | 27,8 B | no disponible | Modelo base sin adaptación | no disponible en la informacion | Hugging Face |
| netprojects/...-MLX-6bit / 8bit / 4bit | 27,8 B | no disponible | Mismas capacidades, cuantizadas para menos memoria | Apache 2.0 | Hugging Face |

La comparación relevante es interna a la familia: el adaptador think-pi iguala en puntuación a pi-adapted y al modelo base en los benchmarks publicados, con menor consumo de tokens de salida. No se dispone de comparaciones con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- El adaptador fue entrenado y evaluado con thinking activado; usarlo con thinking desactivado puede degradar el comportamiento esperado.
- El límite de salida usado en entrenamiento es de 32.768 tokens; configurar `maxTokens` por debajo puede truncar cadenas de razonamiento largas.
- El adaptador se entrenó y evaluó a través de la API Chat Completions, no de la API Responses; usar la primera para reproducir el comportamiento.
- Es una build exclusiva de MLX/Apple Silicon: no es desplegable en GPUs NVIDIA con vLLM, TGI o llama.cpp.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni validación externa.
- No se especifican idiomas soportados ni sesgos conocidos en la información disponible; se heredan los del modelo base Qwen3.8-27B.
- Riesgo de alucinación inherente a los LLM, especialmente en tareas de código donde el modelo puede proponer parches plausibles pero incorrectos; conviene validar con tests.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base Qwen/Qwen3.8-27B y del adaptador original, no detalladas aquí.
- Las diferencias de puntuación en Terminal-Bench 2.1 (57,5 % frente a 60,9 % del base) no se consideran significativas según el autor, pero implican que no hay mejora demostrada en esa tarea.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-bf16
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-think-pi-adapted
- Variante sin thinking: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build MLX 6-bit: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-6bit
- Build MLX 8-bit: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-8bit
- Build MLX 4-bit: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-4bit
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-adapter
- Agente pi: https://github.com/earendil-works/pi
