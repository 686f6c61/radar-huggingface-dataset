# AJ-Gonzalez/coder-lfm3-1.7b-k3.1-pro-heretic

## Resumen

`coder-lfm3-1.7b-k3.1-pro-heretic` es una variante del modelo de código `AJ-Gonzalez/coder-lfm3-1.7b-k3.1-pro`, un destilado LoRA sobre el corpus coder de Kimi k3.1-pro que a su vez deriva de `LiquidAI/LFM3-1.7B`. La modificación consiste en la eliminación del comportamiento de rechazo (refusal) mediante Heretic 2.0.0 con ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA), un proceso que identifica y neutraliza direcciones en el espacio de activaciones asociadas a respuestas de negativa. El resultado es un checkpoint completo (no un adaptador) con la misma arquitectura, tokenizer y plantilla de chat que el modelo base; solo cambian los pesos.

El modelo tiene 1.728.801.536 parámetros (aproximadamente 1,7 mil millones) y se distribuye en dos formatos: pesos MLX de 4 bits (946 MB a 4.503 bits por peso, group size 64) y un checkpoint completo en bf16 para Transformers (3,48 GB). Está pensado para ejecución local en hardware Apple Silicon vía MLX y en GPUs convencionales vía Transformers con `trust_remote_code=True`, dado que requiere el código de modelado personalizado `modeling_lfm3.py`.

La relevancia de esta ficha reside en que documenta con transparencia el coste de la abliteración: el autor publica métricas de rechazos, HumanEval+ y NLL que permiten evaluar el compromiso entre supresión de negativas y degradación de capacidad. El checkpoint subido corresponde al punto "mild" del frente de Pareto, con una tasa de rechazos de 15/100 y un pass@1 en HumanEval+ estadísticamente indistinguible del base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (transformer con capas de convolución; requiere `modeling_lfm3.py` personalizado) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit (group size 64, 4.503 bits/peso); bf16 completo |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (uso comercial permitido solo por debajo de 10 M USD de ingresos anuales) |
| Formato de pesos | safetensors (MLX 4-bit en raíz; bf16 en subcarpeta `bf16/`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es LFM3, el modelo de LiquidAI, que combina capas de atención con capas de convolución (el checkpoint modificado incluye matrices `conv.out_proj` entre las 48 matrices ablacionadas, lo que confirma la presencia de módulos convolucionales). El modelo base `coder-lfm3-1.7b-k3.1-pro` es un destilado LoRA sobre el corpus coder de Kimi k3.1-pro, y este a su vez parte de `LiquidAI/LFM3-1.7B`. Es un modelo destilado en razonamiento: escribe su cadena de pensamiento antes de la respuesta, comportamiento que puede desactivarse con `enable_thinking=false` en la plantilla de chat.

La modificación heretic se realizó con Heretic 2.0.0 mediante una búsqueda Optuna de 12 trials sobre una única Tesla T4 en fp16 con batch 16, usando `mlabonne/harmful_behaviors` como conjunto de prompts negativos y `mlabonne/harmless_alpaca` como positivos, con el scorer de palabras clave de rechazo y el scorer de divergencia KL por defecto. El checkpoint publicado corresponde al índice 1 del frente de Pareto (trial 10), con ablación entre las capas 8 y 15, `preserve_good_behavior_weight` 0.6514, `steer_bad_behavior_weight` 0.01234, `overcorrect_relative_weight` 0.6625, `neighbor_count` 1 y rango LoRA 50 sobre 48 matrices (`attn.o_proj`, `conv.out_proj`, `mlp.down_proj` en 24 capas). La ablación se fusionó en los pesos bf16, por lo que el repositorio contiene un modelo completo.

## Capacidades

- Generación de código: el modelo está especializado en tareas de programación mediante destilación sobre un corpus coder; el autor reporta pass@1 de 0.396 en HumanEval+ (164 tareas, greedy, `enable_thinking=false`).
- Razonamiento con cadena de pensamiento: modelo destilado en razonamiento que genera un scratchpad antes de la respuesta; se puede desactivar con `enable_thinking=false`.
- Modo de respuesta directa: la plantilla de chat soporta `enable_thinking=false` para obtener únicamente la respuesta final.
- Eliminación de rechazos: la abliteración reduce las negativas de 90/100 a 15/100 según el scorer de palabras clave del autor sobre 100 prompts de `harmful_behaviors`.
- Compatibilidad con MLX: pesos 4-bit listos para `mlx_lm` usando el repo id directamente.
- Compatibilidad con Transformers: checkpoint bf16 cargable con `trust_remote_code=True` y el código `modeling_lfm3.py`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Generación de código en local sobre Apple Silicon: el checkpoint MLX 4-bit de 946 MB permite ejecutar el modelo en un Mac con `mlx_lm.generate` sin GPU dedicada, adecuado para autocompletado y generación de funciones en el flujo de trabajo diario del desarrollador.
- Evaluación de robustez frente a abliteración: investigadores que estudien el compromiso entre supresión de rechazos y capacidad pueden usar este checkpoint junto con el base y el punto agresivo (front idx 0) para reproducir las métricas de HumanEval+ y NLL publicadas por el autor.
- Destilación y fine-tuning posterior: al ser un checkpoint completo en bf16 con código de modelado incluido, sirve como punto de partida para ajustes específicos de dominio sin partir del modelo original de LiquidAI.
- Prototipado de asistentes de código sin restricciones de rechazo: en entornos controlados donde el modelo base declina peticiones legítimas (por ejemplo, análisis de código malicioso con fines defensivos), la variante heretic reduce las negativas manteniendo el pass@1 del base dentro del ruido estadístico.
- Investigación sobre alineación y seguridad: el repositorio documenta explícitamente el coste en NLL (+7,0 % respecto al base) y la tasa de rechazos, lo que lo convierte en un artefacto útil para estudiar los efectos secundarios de la ablación de direcciones de rechazo.
- Despliegue en pipelines de CI/CD para generación de tests: con 1,7 mil millones de parámetros y cuantización 4-bit, el modelo cabe en GPUs de consumo y puede integrarse en tareas de generación de código repetitivas, aunque el autor no documenta soporte de tool calling.
- Comparación de harnesses de evaluación: el autor señala que el mismo modelo base puntúa 0.402 en un harness (T4, fp16, evalplus) y 0.488 en otro (MLX 4-bit en M1), lo que hace de este checkpoint un caso práctico para estudiar la variabilidad de la evaluación de código.

## Benchmarks y rendimiento

| Modelo | Rechazos (100 prompts) | HumanEval+ base | HumanEval+ plus | NLL (20 SWE-bench q) |
|---|---:|---:|---:|---:|
| Base coder distill | 90/100 | 0.402 | 0.384 | 2.6646 |
| Este modelo (front idx 1) | 15/100 | 0.396 | 0.384 | 2.8517 (+7,0 %) |
| Front idx 0 (0/100, KL 0.95) | 0/100 | 0.232 | 0.207 | 3.2637 (+22,5 %) |

Notas del autor sobre la medición: HumanEval+ se evaluó con 164 tareas, greedy, una muestra, en T4 con torch fp16 y evalplus; el error estándar con n=164 es ±0,04, por lo que 0.396 frente a 0.402 es ruido estadístico. Un harness distinto (MLX 4-bit en M1) puntúa el base sin modificar en 0.488/0.476, y el autor advierte de que las comparaciones deben hacerse dentro del mismo harness. El recuento de rechazos es una coincidencia de palabras clave, no una evaluación de seguridad. La NLL se midió a 4.503 bits por peso sobre 20 enunciados de SWE-bench Verified.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 946 MB para los pesos MLX 4-bit; aproximadamente 3,48 GB para el checkpoint bf16 (sin contar overhead de activaciones y KV cache).
- GPU recomendadas: el autor realizó la ablación en una Tesla T4 (fp16, batch 16); el checkpoint bf16 puede cargarse en GPUs con al menos ~4 GB de VRAM libre mediante `device_map="auto"`.
- GPU de consumo: sí cabe en GPUs de consumo con 8 GB o más de VRAM en bf16; en 4 bits MLX está pensado para Apple Silicon.
- Opciones de despliegue: `mlx_lm` (formato MLX 4-bit, uso directo con el repo id); Transformers con `trust_remote_code=True` y `modeling_lfm3.py` (formato bf16).
- Latencia y throughput: no disponible en la información proporcionada.
- vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada; el repo no documenta soporte para estos motores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval+ pass@1 | Licencia | Formato |
|---|---:|---|---:|---|---|
| Este modelo (heretic, front idx 1) | 1,73 B | no disponible | 0.396 (T4 fp16) | LFM Open License v1.0 (<10 M USD ingresos) | MLX 4-bit, bf16 |
| `AJ-Gonzalez/coder-lfm3-1.7b-k3.1-pro` (base) | 1,73 B | no disponible | 0.402 (T4 fp16) | LFM Open License v1.0 | no disponible en esta ficha |
| Front idx 0 (misma búsqueda Heretic) | 1,73 B | no disponible | 0.232 (T4 fp16) | LFM Open License v1.0 | no disponible en esta ficha |
| `LiquidAI/LFM3-1.7B` (upstream) | 1,7 B | no disponible | no disponible | LFM Open License v1.0 | no disponible en esta ficha |

No se dispone de datos de benchmarks de modelos comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina el comportamiento de rechazo: el modelo cumplirá peticiones que el base declinaba. El autor indica explícitamente que no es un mecanismo de seguridad y que se usa bajo responsabilidad del usuario.
- El coste en capacidad es dependiente del checkpoint: el punto agresivo (front idx 0) pierde 25,6 puntos de pass@1 en HumanEval+ (0.232 frente a 0.402), por lo que no debe asumirse que una abliteración más fuerte sea igualmente utilizable.
- El coste medido en NLL es de +7,0 % respecto al base (2.8517 frente a 2.6646), equivalente a podar el 20 % de los grupos FFN del modelo según el autor.
- El recuento de rechazos (15/100) es una coincidencia de palabras clave, no una evaluación de seguridad formal.
- La comparación de pass@1 entre harnesses distintos no es válida: el mismo base puntúa 0.402 en T4/fp16 y 0.488 en MLX 4-bit/M1.
- Licencia LFM Open License v1.0: el uso comercial solo se permite por debajo de 10 M USD de ingresos anuales; la redistribución debe conservar la licencia, marcar los archivos modificados (ambos `model.safetensors`) y mantener los avisos upstream.
- Los datos de entrenamiento del modelo padre arrastran términos de terceros (prompts MiMo vía TeichAI, respuestas de Kimi k3.1-pro vía OpenRouter) según la model card del padre.
- Requiere `trust_remote_code=True` y el código `modeling_lfm3.py` para cargar en Transformers; no es un checkpoint estándar de la librería.
- No se dispone de información sobre sesgos, idiomas soportados, longitud de contexto ni riesgo de alucinación específico en la documentación proporcionada.
- El modelo escribe razonamiento antes de la respuesta por defecto; en producción debe pasarse `enable_thinking=false` si se quiere comportamiento de solo respuesta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AJ-Gonzalez/coder-lfm3-1.7b-k3.1-pro-heretic
- Modelo base (destilado coder): https://huggingface.co/AJ-Gonzalez/coder-lfm3-1.7b-k3.1-pro
- Modelo upstream de LiquidAI: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
