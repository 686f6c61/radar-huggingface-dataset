# jstarks/Qwen3.5-4B-Weight-Space-Programming

## Resumen

Qwen3.5-4B-Weight-Space-Programming es un conjunto de adaptadores LoRA en espacio de pesos (weight-space programming, WSP v2.5) publicado por el usuario jstarks sobre el modelo base Qwen/Qwen3.5-4B. No se trata de un modelo entrenado de forma convencional: los adaptadores se sintetizan de forma cerrada (closed-form), sin descenso de gradiente ni fine-tuning, en aproximadamente 21,71 segundos, mediante receptores SwiGLU y una regresión ridge contrastiva en el espacio de pesos. El objetivo declarado es mejorar el comportamiento del modelo base en tareas de razonamiento, código, enrutado de herramientas y síntesis de JSON en un entorno de despliegue con solo 6 GB de VRAM (RTX 2060 Mobile) usando llama-server.

El modelo base Qwen3.5-4B tiene 32 capas (24 Gated DeltaNet y 8 de atención completa), hidden_size de 2560, intermediate_size de 9216, normalización RMSNorm con factor (1+w) y embeddings atados. El repositorio contiene tanto los adaptadores GGUF (para llama.cpp) como los parches en safetensors, organizados en seis subespacios con roles diferenciados: cierre de modo thinking, contención de herramientas, enrutado multi-herramienta, síntesis de código en capas intermedias, síntesis de JSON en segundo turno y transferencia entre agentes.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de interpretabilidad mecanicista aplicada (weight-space programming) que permite modificar el comportamiento del modelo sin reentrenar; por otro, ofrece datos de evaluación concretos sobre 41 tareas de retención que muestran mejoras medibles (de 29/41 a 34/41) con un consumo de VRAM inferior a 4 GB. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas Gated DeltaNet + 8 capas de atención completa (modelo base Qwen3.5-4B) |
| Parametros totales | 4.659.865.088 (modelo base); los adaptadores LoRA son de rango 16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens en la configuración de evaluación (`-c 16384`); contexto máximo del modelo base no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M para el modelo base; adaptadores LoRA en GGUF (rango 16, f32) y safetensors (r16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (parches), GGUF (adaptadores LoRA y modelo base cuantizado) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida con 24 capas Gated DeltaNet (atención lineal con estado recurrente) y 8 capas de atención completa, con hidden_size de 2560, intermediate_size de 9216 y embeddings atados. Sobre esta base, los adaptadores WSP v2.5 se sintetizan sin entrenamiento: se usan receptores SwiGLU con forward-hooks en BF16 y una regresión ridge contrastiva de doble espacio (Woodbury) para calcular los deltas de pesos. El proceso retiene el 100 % de la energía SVD y limita la fuga cruzada entre subespacios a un 0,330 % máximo (por debajo del 0,5 % objetivo).

Los seis subespacios tienen rangos 16 y se aplican a capas específicas: los subespacios S1 (think), S2 (restraint) y S3 (router) actúan sobre las capas 23, 27, 29, 30 y 31; el subespacio S4 (mid_code) actúa sobre las capas 7, 11, 15 y 19; y los subespacios S5 y S6 completan el conjunto (la información proporcionada se corta en la descripción del subespacio S4). La innovación principal es el enrutado dinámico por turno y esquema: en lugar de aplicar todos los adaptadores a escala fija (variante estática), el router selecciona qué subespacio activar según la tarea (por ejemplo, `s1_think=1.95` para razonamiento general y matemáticas, `s4=0.65` para síntesis de código, `s3=0.95` para enrutado de herramientas, `s5=1.0` para JSON de segundo turno). La latencia de conmutación entre adaptadores vía `/lora-adapters` es de 7,374 ms de media (24,81 ms máximo) para la variante ganadora.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno.
- Modo thinking con cierre controlado de la etiqueta `</think>` y supresión de duplicación posterior a la etiqueta (subespacio S1).
- Contención de herramientas y anti-sicofancia: el modelo puede rechazar peticiones inapropiadas o abstenerse de invocar herramientas cuando no procede (subespacio S2).
- Enrutado multi-herramienta entre `exec`, `web_search`, `read_file` y `write_file` (subespacio S3).
- Síntesis de código en capas intermedias de atención completa (subespacio S4, ganador con `ffn_down`).
- Síntesis de JSON en segundo turno con compresión de salida de 3,82x (subespacio S5).
- Transferencia entre agentes (handoff) en flujos multi-agente (subespacio S6).
- Soporte de tool calling y function calling a través de la plantilla Jinja y el formato de razonamiento deepseek en llama-server.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en GPU de consumo con 6 GB de VRAM: el modelo base cuantizado a Q4_K_M más los adaptadores GGUF cabe en una RTX 2060 Mobile con un pico de 3.816 MiB, lo que permite ejecutar un agente local sin servicios en la nube.
- Agente de codificación con enrutado de herramientas: el subespacio S3 selecciona entre ejecutar comandos, buscar en web o leer/escribir ficheros, y el subespacio S4 mejora la síntesis de código en capas intermedias; útil en pipelines de CI/CD o asistentes de terminal.
- Automatización de atención al cliente con salida JSON estructurada: el subespacio S5 comprime las respuestas de segundo turno a una media de 33,3 tokens (frente a 127,3 del base) manteniendo el esquema, lo que reduce coste y latencia en integraciones con APIs.
- Razonamiento matemático en entornos educativos o de análisis: el subespacio S1 con escala 1,95 duplica el rendimiento en GSM8K (de 2/5 a 4/5) y mejora el cierre de modo thinking, adecuado para tutores automáticos.
- Flujos multi-agente con handoff: el subespacio S6 mantiene el 4/4 en tareas de transferencia entre agentes, útil en orquestadores que delegan subtareas entre modelos especializados.
- Moderación y contención de herramientas: el subespacio S2 mantiene 4/4 en tareas de restricción y anti-sicofancia, aplicable a asistentes que deben rechazar peticiones fuera de política sin invocar herramientas innecesarias.
- Investigación en interpretabilidad mecanicista: los parches safetensors r16 con fuga cruzada inferior al 0,5 % permiten estudiar cómo afectan deltas de pesos localizados a comportamientos concretos sin reentrenar.

## Benchmarks y rendimiento

Evaluación sobre 41 tareas de retención con llama-server, Qwen3.5-4B-Q4_K_M.gguf, `temperature=0.0`, `seed=42`:

| Suite (tareas) | Base (todo 0.0) | Estático todo activo (0.65) | Dinámico S4=ffn_down (ganador) | Dinámico S4=ffn_down+o_proj |
|---|---|---|---|---|
| S1_think (3) | 0/3 (960,0 tok med.) | 0/3 (960,0 tok med.) | 2/3 (802,3 tok med.) | 2/3 (802,3 tok med.) |
| S2_restraint (4) | 4/4 | 4/4 | 4/4 | 4/4 |
| S3_router (5) | 5/5 | 5/5 | 5/5 | 5/5 |
| S4_mid_code (2) | 1/2 | 2/2 | 2/2 (502, 640 tok) | 0/2 |
| S5_turn2_json (3) | 3/3 (127,3 tok med.) | 2/3 (fuga de herramienta en s5_h3) | 3/3 (33,3 tok med.: 40, 32, 28) | 2/3 (fallo en s5_h3) |
| S6_handoff (4) | 4/4 | 4/4 | 4/4 | 4/4 |
| GSM8K (5 retención) | 2/5 | 1/5 | 4/5 (2x base) | 4/5 |
| HumanEval (5 retención) | 3/5 | 4/5 | 3/5 | 3/5 |
| BFCL v3 Irrelevance (5) | 4/5 | 4/5 | 4/5 | 4/5 |
| InterCode-NL2Bash (5) | 3/5 | 2/5 | 3/5 | 3/5 |
| Subtotal establecido (20) | 12/20 | 11/20 | 14/20 | 14/20 |
| TOTAL (41 tareas) | 29/41 (70,7 %) | 28/41 (68,3 %) (-2,4 pp) | 34/41 (82,9 %) (+12,2 pp) | 31/41 (75,6 %) (+4,9 pp) |
| Latencia de conmutación | 0,819 ms | 16,266 ms | 7,374 ms med. (24,81 ms máx.) | 5,103 ms med. (25,397 ms máx.) |

Datos adicionales de la evaluación: la conmutación de caché KV entre turnos no produjo fuga de herramienta (`turn2_nocache_tool_leak = false`, 1365,52 ms; `turn2_cached_tool_leak = false`, 1260,22 ms). El consumo de VRAM del sistema se mantuvo en 3.748 MiB en reposo y 3.816 MiB en pico tras la evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,73 GiB en pico con el modelo base Q4_K_M y los adaptadores GGUF cargados en llama-server (objetivo declarado: menos de 5,0 GiB para GPUs de 6 GB).
- GPU recomendadas: RTX 2060 Mobile (6 GB) es el entorno de referencia validado; cualquier GPU con 6 GB o más de VRAM debería ser suficiente. Para mayor throughput, se pueden usar GPUs de gama alta (RTX 4090, A100, H100), aunque no hay datos de rendimiento publicados en esas configuraciones.
- Cabe en GPU de consumo: sí, validado en RTX 2060 Mobile con 6 GB.
- Opciones de despliegue: llama.cpp / llama-server con soporte de `/lora-adapters` y `--jinja --reasoning-format deepseek`; los parches safetensors permiten su uso con transformers. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: latencia de conmutación de adaptadores de 7,374 ms de media (24,81 ms máximo) en la variante ganadora; latencias de inferencia por tarea no disponibles de forma agregada (solo se reportan tiempos puntuales de conmutación de caché KV: 1365,52 ms y 1260,22 ms).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en retención | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Weight-Space-Programming (variante dinámica S4=ffn_down) | 4.659.865.088 (base) + LoRA r16 | 16.384 tokens en evaluación | 34/41 (82,9 %) | Apache 2.0 | Hugging Face (jstarks) |
| Qwen3.5-4B (base, sin adaptadores) | 4.659.865.088 | 16.384 tokens en evaluación | 29/41 (70,7 %) | Apache 2.0 (según modelo base) | Hugging Face (Qwen) |
| Qwen3.5-4B con LoRA estático todo activo (0.65) | 4.659.865.088 + LoRA r16 | 16.384 tokens en evaluación | 28/41 (68,3 %) | Apache 2.0 | Hugging Face (jstarks) |
| Qwen3.5-4B con LoRA dinámico S4=ffn_down+o_proj | 4.659.865.088 + LoRA r16 | 16.384 tokens en evaluación | 31/41 (75,6 %) | Apache 2.0 | Hugging Face (jstarks) |

No se dispone de datos de benchmarks de otros modelos de 4B comparables (por ejemplo, Llama 3.2 3B o Gemma 3 4B) en la información proporcionada, por lo que la comparativa se limita a las variantes del propio repositorio y al modelo base.

## Limitaciones y advertencias

- Los adaptadores se sintetizan de forma cerrada sin descenso de gradiente; su comportamiento depende fuertemente de las escalas de enrutado elegidas (por ejemplo, `s1_think=1.95`, `s4=0.65`), que pueden no generalizar fuera de las 41 tareas de retención evaluadas.
- La evaluación se realizó con `temperature=0.0` y `seed=42` sobre 5 tareas por suite; los tamaños muéstrales son pequeños y los intervalos de confianza no se reportan, por lo que las mejoras de pocos puntos porcentuales deben interpretarse con cautela.
- La variante estática todo activo degrada el rendimiento por debajo del base (28/41 frente a 29/41), lo que indica que un uso incorrecto de los adaptadores puede empeorar el modelo.
- El subespacio S1 no cierra el modo thinking en 1 de cada 3 tareas incluso en la variante ganadora (2/3), lo que puede provocar respuestas excesivamente largas o truncadas en producción.
- El modelo base tiene 24 capas Gated DeltaNet y 8 de atención completa; el comportamiento de los adaptadores en contextos superiores a 16.384 tokens no está documentado.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento multilingüe fuera del inglés sin evaluación adicional.
- Riesgo de alucinación y sesgos del modelo base no cuantificado en la información proporcionada; los adaptadores no abordan explícitamente estos problemas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B tiene sus propias condiciones que deben verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado el 13 de noviembre de 2026; se trata de una publicación muy reciente y sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jstarks/Qwen3.5-4B-Weight-Space-Programming
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
