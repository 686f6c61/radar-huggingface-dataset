# netprojects/Qwen3.8-27B-opencode-adapted-MLX-bf16

## Resumen

Qwen3.8-27B-opencode-adapted-MLX-bf16 es una conversión a formato MLX, en precisión bf16, del modelo harness-hub/Qwen3.8-27B-opencode-adapted, un ajuste mediante LoRA del modelo base Qwen/Qwen3.8-27B. El adaptador original fue entrenado por harness-hub con aprendizaje por refuerzo (AsyncGRPO sobre TRL) para convertir al modelo en el motor del agente de programación OpenCode en tareas de ingeniería de software y de terminal. Esta build, publicada por netprojects, fusiona el adaptador en los pesos base y los convierte a MLX con mlx-vlm, conservando el codificador de visión y la capa MTP (multi-token prediction) de Qwen.

El modelo tiene 27.781.427.952 parámetros (unos 27,8 mil millones) y un repositorio de 55,6 GB en bf16. Es un modelo multimodal image-text-to-text, con licencia Apache 2.0, pensado para ejecutarse en Apple Silicon. Su relevancia actual radica en que permite desplegar localmente en un Mac un agente de código con un rendimiento declarado notablemente superior al modelo base en SWE-bench Pro y Terminal-Bench, y con un modo de pensamiento desactivado que iguala al base con thinking al máximo esfuerzo generando aproximadamente una sexta parte de los tokens.

La build bf16 es la referencia de fidelidad de la familia: el resto de builds cuantizadas (6-bit, 8-bit, 4-bit) se miden contra ella en porcentaje de mismo siguiente token y divergencia KL. No obstante, para uso práctico el autor recomienda la build de 6 bits (23,1 GB) por su equilibrio entre tamaño y fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.8-27B) con capa MTP; conversión MLX vía mlx-vlm |
| Parametros totales | 27.781.427.952 (≈27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (esta build); la familia incluye 4-bit, 6-bit y 8-bit MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), incluido model-mtp.safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B (revisión 3756181), un transformer multimodal con codificador de visión y una capa de multi-token prediction (MTP). Sobre él, harness-hub entrenó un adaptador LoRA mediante aprendizaje por refuerzo con AsyncGRPO en TRL, orientado a tareas de ingeniería de software y de terminal dentro del agente OpenCode. El adaptador afecta a 256 módulos: q, k, v y o en las 16 capas de atención completa, y gate, up y down en las 64 capas. Esta build fusiona esos módulos como W + 2.0 · B @ A redondeado a bf16, verificado elemento a elemento contra un cálculo independiente en float64, y convierte el conjunto a MLX con mlx-vlm.

La capa MTP se conserva en model-mtp.safetensors y no fue modificada por el adaptador, por lo que es la cabeza MTP original de Qwen. Se puede usar como modelo borrador integrado para decodificación especulativa pasando el mismo repositorio como --draft-model con --draft-kind mtp. El tokenizador y la plantilla de chat son los de harness-hub sin cambios, con el mismo vocabulario y formato de tool calls que Qwen3.8-27B. El adaptador se entrenó y evaluó con thinking desactivado.

## Capacidades

- Generación de texto y razonamiento general, con modo de pensamiento (thinking) configurable, aunque el adaptador se entrenó con thinking off.
- Capacidades de agente de código: resolución de bugs, ejecución de tareas de terminal y flujos de ingeniería de software multi-paso.
- Tool calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Entrada de imágenes (image-text-to-text) mediante mlx-vlm: capturas de pantalla, terminales, diagramas.
- Decodificación especulativa con la capa MTP integrada o con el drafter DSpine.
- Integración directa con el agente OpenCode vía servidor compatible con OpenAI.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agente de código local en OpenCode: servir el modelo con `mlx_lm.server` y registrarlo como proveedor local permite lanzar tareas como localizar y corregir tests que fallan sin enviar código a servicios externos, aprovechando el ajuste específico para este agente.
- Corrección de bugs en producción sobre un Mac: el modelo está entrenado para tareas de SWE-bench Pro y Terminal-Bench, por lo que encaja en flujos de diagnóstico y parcheo de repositorios reales ejecutados en Apple Silicon.
- Automatización de terminal: interpretar salidas de comandos, errores de shell y trazas para proponer y ejecutar correcciones, con soporte de tool calls para invocar herramientas.
- Análisis de capturas de terminal o de pantalla: con mlx-vlm se puede pasar una imagen de un error y preguntar qué falla, útil para soporte técnico y depuración asistida.
- Asistente de programación en el IDE o en scripts de Python: cargar el modelo con mlx-lm y generar funciones o explicaciones con thinking desactivado para minimizar latencia y consumo de tokens.
- Evaluación e investigación de RL para agentes: al estar publicados el adaptador LoRA y los resultados de AsyncGRPO, sirve como referencia reproducible para estudiar el efecto del RL en tareas de código.
- Despliegue con decodificación especulativa: usar la capa MTP como draft model para acelerar la generación en Mac con GPU integrada, con incrementos medidos de hasta ×2,15 en la build de 8 bits.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador, bajo OpenCode y con thinking desactivado, frente al modelo base:

| Benchmark | Modelo base | Con adaptador |
|---|---|---|
| SWE-bench Pro (hard 51) | 35,3% | 51,0% |
| Terminal-Bench 2.1 | 46,4% | 52,4% |

Fidelidad de las builds cuantizadas respecto a esta build bf16:

| Build | Tamano | Mismo siguiente token que bf16 | KL vs bf16 |
|---|---|---|---|
| 6-bit (recomendada) | 23,1 GB | 98,7% | 0,0014 |
| 8-bit | 30,0 GB | 99,2% | 0,0004 |
| 4-bit | 16,3 GB | 96,7% | 0,0203 |
| bf16 | 55,6 GB | referencia | referencia |

Throughput medido por el autor en un MacBook Pro M5 Max (128 GB), greedy, thinking off, 5 prompts × 256 tokens, con otros servicios en ejecución (cifras indicativas):

| Build | Sin MTP | Con MTP (mlx-vlm 0.7.11) |
|---|---|---|
| 4-bit | 33 tok/s | 62 tok/s (×1,91) |
| 6-bit | 20 tok/s | 21 tok/s (×1,04) |
| 8-bit | 17 tok/s | 37 tok/s (×2,15) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K u otros benchmarks generales para esta build.

## Requisitos de hardware

- Esta build bf16 ocupa 55,6 GB de pesos; se necesita memoria unificada suficiente para pesos más caché KV y overhead del runtime. El autor la verificó en un MacBook Pro M5 Max con 128 GB.
- Para Macs con menos memoria, las builds de 6 bits (23,1 GB), 8 bits (30,0 GB) y 4 bits (16,3 GB) reducen el requisito; la de 6 bits es la recomendada por el autor.
- Plataforma: Apple Silicon exclusivamente (MLX). No está pensada para GPU NVIDIA ni CUDA.
- Despliegue: mlx-lm (>=0.32.2) para texto y servidor compatible con OpenAI; mlx-vlm (>=0.7.11) para imagen y para decodificación especulativa con MTP.
- Throughput de referencia en M5 Max de 128 GB: 17-33 tok/s sin MTP según cuantización, y hasta 37-62 tok/s con MTP en las builds de 8 y 4 bits.
- No hay datos de latencia ni throughput para otros chips Apple (M1, M2, M3, M4) en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-opencode-adapted-MLX-bf16 (este) | 27,8 B | no disponible | Agente de código, multimodal, MLX | Apache 2.0 | Hugging Face, builds 4/6/8-bit y adaptador LoRA |
| Qwen/Qwen3.8-27B (base) | 27,8 B | no disponible | Modelo general multimodal | no disponible en la información | Hugging Face |
| harness-hub/Qwen3.8-27B-opencode-adapted (adaptador original) | 27,8 B (LoRA) | no disponible | Agente de código vía LoRA | Apache 2.0 | Hugging Face |
| netprojects/Qwen3.8-27B-DSpine-b16-MLX (drafter) | no disponible | no disponible | Decodificación especulativa | no disponible | Hugging Face |

La comparación con modelos de otros fabricantes del mismo tamaño no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El adaptador se entrenó y evaluó con thinking desactivado; el autor recomienda mantenerlo así. Usarlo con thinking puede degradar el comportamiento esperado.
- Solo funciona en Apple Silicon con MLX; no es desplegable en CUDA, vLLM ni TGI.
- La build bf16 requiere mucha memoria unificada (55,6 GB de pesos); en Macs de gama baja hay que recurrir a cuantizaciones, con la consiguiente pérdida de fidelidad (hasta un 3,3% de divergencia en el siguiente token en 4 bits).
- La decodificación especulativa con MTP puede divergir ligeramente del texto de la decodificación normal en respuestas largas cuando hay empates cercanos en la verificación por lotes.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en la información disponible.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; no se garantiza un rendimiento multilingüe más allá de lo que herede del modelo base.
- Longitud de contexto: no disponible; conviene verificarla antes de usarlo en repositorios grandes.
- Las cifras de throughput son indicativas y se midieron con otros servicios en ejecución en el mismo equipo.
- Licencia Apache 2.0, que permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.8-27B y del adaptador original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-bf16
- Build 6 bits recomendada: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-6bit
- Build 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-8bit
- Build 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-4bit
- Adaptador LoRA MLX: https://huggingface.co/netprojects/Qwen3.8-27B-opencode-adapted-MLX-adapter
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- OpenCode: https://opencode.ai
- Drafter DSpine: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Repositorio dspine-hybrid-mlx: https://github.com/internet-projects/dspine-hybrid-mlx
