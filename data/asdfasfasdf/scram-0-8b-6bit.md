# asdfasfasdf/Scram-0.8B-6bit

## Resumen

Scram-0.8B-6bit es un modelo de lenguaje de 164,9 millones de parámetros (0,6 GB en pesos cuantizados a 6 bits) desarrollado por el usuario asdfasfasdf bajo la designación interna corium-v5.4. Está basado en Qwen3.5-0.8B-Base y se ha afinado mediante supervisión sobre trazas de razonamiento destiladas de Qwen3.5-4B y Qwen3.5-9B, con el objetivo específico de producir llamadas a herramientas bien formadas tras un razonamiento procedural multi-paso. El modelo incorpora una disciplina de rechazo: declina peticiones fuera de alcance y solicita parámetros faltantes en lugar de inventarlos. Se distribuye en formato MLX, pensado para ejecución en dispositivos Apple Silicon (MacBook M4, 64 GB), y pesa 603 MB, lo que lo hace apto para despliegues on-device con recursos limitados.

La relevancia actual del modelo reside en que demuestra que un modelo de 0,8B puede superar a su propio maestro en tareas de llamada a herramienta cuando se entrena con trazas de razonamiento verificadas y se aplica una cuantización agresiva. No es un asistente conversacional ni una base de conocimiento: su conocimiento del mundo es deliberadamente nulo (closed-book ≈ 0,20, ≈ 0,92 con notas recuperadas). Se centra exclusivamente en razonamiento procedural que termina en una llamada a herramienta válida, con rechazo disciplinado de casos ambiguos o fuera de alcance.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-0.8B-Base) |
| Parámetros totales | 164.975.424 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 6-bit (MLX) |
| Idiomas soportados | inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B-Base, un transformer de la familia Qwen3.5. Sobre esa base se ha aplicado una supervisión fina con trazas sintéticas destiladas de Qwen3.5-4B y Qwen3.5-9B, donde se registraron únicamente los pasos de razonamiento verificados que conducen a una llamada de herramienta correcta. El entrenamiento se realizó en una MacBook M4 de 64 GB, sin CUDA, y se cuantizaron los pesos a 6 bits con la librería MLX. La model card indica que se utilizó el templado con `enable_thinking=False`, lo que significa que el modelo no genera una cadena de pensamiento explícita, sino que delibera internamente antes de emitir la llamada.

Un aspecto técnico destacable es que el entrenamiento incluyó deliberadamente el conjunto de datos GSM8K, por lo que cualquier resultado en ese benchmark medirá capacidad entrenada, no transferencia. Además, el autor reporta un experimento con un paso de extracción explícito ("Extraction:" parse) que no produjo ninguna ganancia de capacidad (0.607 vs 0.610 en GSM8K), lo que sugiere que hacer explícito un paso latente no crea la habilidad subyacente.

## Capacidades

- **Llamada a herramientas con disciplina de decisión**: el modelo es capaz de decidir cuándo no llamar a una herramienta, rechazando peticiones fuera de alcance y solicitando parámetros faltantes. En pruebas propias, logró 30/30 en detección de parámetros faltantes y 30/30 en rechazo de peticiones fuera de alcance.
- **Razonamiento procedural multi-paso**: el modelo genera pasos intermedios de razonamiento (aunque no los muestra explícitamente) y culmina en una llamada de herramienta bien formada.
- **Manejo de llamadas paralelas**: soporta llamadas a herramientas en paralelo, aunque con rendimiento limitado (23–28% en BFCL para par-mult).
- **Irrelevancia y detección de no-relevancia**: en el harness oficial de BFCL, obtiene 96.67 y 94.17 en irrelevance, y 92.42 y 94.46 en live_irrelevance, lo que indica una alta capacidad para identificar consultas que no requieren herramienta.
- **Inglés únicamente**: no se reportan capacidades multilingües.
- **No es un chat assistant**: no tiene conocimiento general del mundo ni capacidad de conversación libre; está diseñado exclusivamente para tareas de tool-calling.

## Casos de uso

- **Agentes de automatización en dispositivos móviles**: el modelo puede gestionar tareas que requieren decidir si llamar a una API o no, por ejemplo, controlar un asistente que debe consultar el tiempo o enviar un mensaje. Su tamaño de 0.6 GB permite ejecutarlo localmente en un smartphone con Apple Silicon.
- **Filtrado de peticiones en sistemas de atención al cliente**: el modelo puede rechazar preguntas fuera del dominio de un sistema automatizado y solicitar los datos necesarios (como número de pedido o correo) antes de activar una llamada a una herramienta de consulta.
- **Orquestación de microservicios en entornos con recursos limitados**: en un sistema de borde, el modelo puede decidir si una petición es resoluble directamente o requiere llamar a un servicio externo, reduciendo llamadas innecesarias y ahorrando latencia.
- **Validación de parámetros en APIs**: el modelo puede recibir una petición del usuario y generar la llamada a una función con los parámetros correctos, solicitando explícitamente aquellos que falten. Útil para sistemas de registro o reservas.
- **Prototipos de agentes para investigación**: gracias a su licencia Apache-2.0 y su tamaño, es adecuado para experimentar con arquitecturas de tool-calling en entornos de desarrollo sin acceso a GPUs potentes.
- **Control de dispositivos IoT**: en un dispositivo con chip Apple Silicon, el modelo puede interpretar comandos de voz o texto y decidir si llamar a una función de control (encender luz, ajustar temperatura) o rechazar peticiones ambiguas.

## Benchmarks y rendimiento

### BFCL (harness oficial, v4, prompting mode)

| Categoría | Run-1 | Run-2 |
|---|---|---|
| Irrelevance (n=240) | 96.67 | 94.17 |
| Live_irrelevance (n=884) | 92.42 | 94.46 |
| Live_relevance (n=16) | 18.75 | 31.25 |
| Simple AST (n=400) | 37.75 | 45.75 |
| Multiple AST | 44.5 | 39.0 |
| Parallel | 25.0 | 28.0 |
| Par-mult | 23.0 | 24.0 |

El autor señala que la irrelevancia (94–97) es alta para su clase de tamaño, pero que la AST (selección de función) es el punto débil, con 46 en run-2 frente a 66 de Hammer2.1-0.5b. La causa diagnosticada es la arbitración delegate-vs-solve: el modelo responde preguntas computables directamente en lugar de llamar a una herramienta, porque el currículo de entrenamiento no demostró el caso "solvable, but call anyway".

### Reason-to-act gauntlet (n=300 + 60 trampas)

| Modelo | derive→valid-call | missing-param | out-of-scope |
|---|---|---|---|
| **corium-v5.4 (603 MB)** | **0.687** | **30/30** | **30/30** |
| Qwen3.5-4B (maestro) | 0.510 (p=7e-6) | 1/30 | 11/30 |
| Qwen3.5-0.8B-instruct | 0.410 | 8/30 | 7/30 |
| Qwen3.5-2B-instruct | 0.200 | 11/30 | 18/30 |
| Hammer2.1-0.5b | 0.047 | 1/30 | 0/30 |

Trampas: 60/60 en esta ejecución, 120/120 acumuladas en dos ejecuciones independientes.

**Advertencia**: el autor indica que el gauntlet es un instrumento propio, por lo que los tamaños de efecto no son comparables con otros benchmarks. Además, el modelo fue entrenado con GSM8K, por lo que cualquier número de GSM8K no es un benchmark válido para este modelo.

## Requisitos de hardware

- **VRAM estimada**: los pesos en 6-bit ocupan ~0.6 GB, por lo que caben en cualquier GPU con al menos 1 GB de VRAM, aunque el modelo está pensado para ejecución en CPU de Apple Silicon.
- **GPU recomendadas**: no se requiere GPU; el modelo fue entrenado y evaluado en un MacBook M4 de 64 GB. En Apple Silicon, se ejecuta con la librería `mlx_lm` sin necesidad de GPU dedicada.
- **Compatibilidad**: el formato MLX está diseñado para Apple Silicon (M1, M2, M4, etc.). No se reporta compatibilidad con CUDA o ROCm; para otros hardware sería necesario convertir los pesos a GGUF o safetensors estándar, pero no se proporciona soporte oficial.
- **Opciones de despliegue**: la documentación indica usar `mlx_lm` (Python) con `load` y `generate`. No hay soporte para vLLM, Ollama o TGI en la información disponible.
- **Latencia y throughput**: no se reportan datos cuantitativos. El autor menciona que el modelo fue entrenado para deliberar antes de emitir, y que con límites de tokens ajustados (p.ej. 32) se trunca y falla. Se recomienda un presupuesto de tokens generoso (por ejemplo, 256).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | derive→valid-call | missing-param | out-of-scope | Licencia |
|---|---|---|---|---|---|---|
| Scram-0.8B-6bit | 164.9M | no disponible | 0.687 | 30/30 | 30/30 | Apache-2.0 |
| Qwen3.5-0.8B-instruct | ~0.8B | no disponible | 0.410 | 8/30 | 7/30 | Apache-2.0 |
| Qwen3.5-2B-instruct | ~2B | no disponible | 0.200 | 11/30 | 18/30 | Apache-2.0 |
| Hammer2.1-0.5b | ~0.5B | no disponible | 0.047 | 1/30 | 0/30 | no disponible |

El modelo supera claramente a sus alternativas de tamaño similar en el gauntlet propio del autor, especialmente en la detección de parámetros faltantes y en el rechazo de peticiones fuera de alcance. La diferencia con su maestro (Qwen3.5-4B) es estadísticamente significativa (p=7e-6). En el BFCL, la irrelevancia es comparable a modelos mucho mayores, pero la selección de función (AST) es inferior a Hammer2.1-0.5b. No se dispone de comparativa con otros modelos de la categoría en benchmarks estándar (MMLU, HumanEval) porque el autor no los reporta.

## Limitaciones y advertencias

- **Sin conocimiento del mundo**: el modelo no es una base de conocimiento; sus pesos no contienen información factual (closed-book ≈ 0.20). No debe usarse para tareas que requieran datos generales.
- **Solo inglés**: no hay soporte multilingüe.
- **Entrenado en GSM8K**: cualquier resultado en GSM8K refleja capacidad entrenada, no transferencia. No se debe citar como benchmark válido.
- **Alucinación en la selección de herramienta**: en BFCL, la tasa de error de selección de función es 29/2311 (≈1.3%), pero la AST es débil (46 vs 66 de Hammer2.1). El modelo puede resolver directamente preguntas que deberían delegar en una herramienta.
- **Refusals no transferibles**: las clases de rechazo (tool equivocada, parámetro faltante, fuera de alcance) deben entrenarse explícitamente por separado; añadir una no mejora las otras.
- **Sin soporte multi-turno**: el modelo está diseñado para una sola interacción (single-turn). No es adecuado para conversaciones largas.
- **Cuantización fija**: solo se distribuye en 6-bit MLX; no hay variantes en otros formatos o cuantizaciones.
- **No es un asistente de chat**: no tiene capacidades de conversación libre, ni conocimiento del mundo, ni soporte de vision o audio.

## Enlaces

- [HuggingFace: asdfasfasdf/Scram-0.8B-6bit](https://huggingface.co/asdfasfasdf/Scram-0.8B-6bit)
- [Ho et al., ACL 2023 - Distillation de CoT](https://arxiv.org/abs/2212.10071)
- [Ross et al., 2025 - When2Call](https://arxiv.org/abs/2504.18851)
- [Qwen/Qwen3.5-0.8B-Base (modelo base)](https://huggingface.co/Qwen/Qwen3.5-0.8B-Base)
