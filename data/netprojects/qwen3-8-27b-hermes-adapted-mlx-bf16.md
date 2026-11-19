# netprojects/Qwen3.8-27B-hermes-adapted-MLX-bf16

## Resumen

Qwen3.8-27B-hermes-adapted-MLX-bf16 es una conversión a formato MLX, en precisión bf16, del modelo harness-hub/Qwen3.8-27B-hermes-adapted, que a su vez es un fine-tuning mediante LoRA del modelo base Qwen/Qwen3.8-27B. Lo publica el usuario netprojects y está pensado específicamente para su ejecución en Apple Silicon mediante la librería MLX. El modelo integra el encoder de visión y la capa MTP (multi-token prediction) originales de Qwen3.8-27B, por lo que conserva capacidades multimodales de imagen a texto además de generación de texto.

El interés del modelo radica en su especialización como motor de un agente de software: el adaptador LoRA se entrenó con aprendizaje por refuerzo (AsyncGRPO en TRL, rango 32, alpha 64) para operar detrás de Hermes Agent en tareas de ingeniería de software y terminal. Según los resultados publicados por el autor del adaptador, mejora SWE-bench Pro (hard 51) del 29,4% al 43,1% y Terminal-Bench 2.1 del 44,7% al 58,8% respecto al modelo base, con menos turnos y aproximadamente la mitad de tokens generados.

Con 27.781.427.952 parámetros y un repositorio de 55,6 GB, esta build en bf16 es la referencia de fidelidad de la familia de conversiones MLX publicadas por netprojects (4-bit, 6-bit, 8-bit y bf16), y requiere equipos Apple con 96 GB de memoria unificada o más. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.8-27B) con capas de atención completa y capas Gated DeltaNet, más encoder de visión y capa MTP; conversión MLX |
| Parámetros totales | 27.781.427.952 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card indica que Hermes Agent requiere al menos 64.000 tokens de contexto) |
| Tipos de cuantización | bf16 en esta build; la familia incluye builds 4-bit, 6-bit, 8-bit y adaptador LoRA |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con `model-mtp.safetensors` para la capa MTP |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B combina 64 capas, de las cuales 16 son de atención completa y el resto emplean Gated DeltaNet, según se deduce de la descripción del merge (módulos q, k, v, o en las 16 capas de atención completa; gate, up, down en las 64 capas). Incluye un encoder de visión y una capa de multi-token prediction (MTP) que puede usarse como modelo borrador para decodificación especulativa. La conversión a MLX se realizó con mlx-vlm e incorpora tanto el encoder de visión como la capa MTP de Qwen.

El adaptador se entrenó con aprendizaje por refuerzo mediante AsyncGRPO en TRL, con LoRA de rango 32 y alpha 64, a partir de un checkpoint en el paso 160 de 1000 planificados. El merge se verificó elemento a elemento: los 256 módulos adaptados equivalen a W + 2.0 · B @ A redondeado a bf16, y el resto de tensores son idénticos byte a byte a Qwen3.8-27B. El adaptador no modifica el encoder de visión ni las capas Gated DeltaNet. El tokenizador y la plantilla de chat son los originales de harness-hub, con el mismo vocabulario y formato de tool calls que Qwen3.8-27B. Las builds cuantizadas se verificaron como cuantización afín exacta (grupo 64) de la build bf16.

## Capacidades

- Generación de texto y razonamiento, con modo thinking desactivable mediante la plantilla de chat (`enable_thinking: false`).
- Procesamiento de imagen a texto (pipeline image-text-to-text): interpretación de capturas de pantalla, terminales y otros contenidos visuales mediante mlx-vlm.
- Tool calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Ejecución como agente de software: resolución de bugs, edición de código y operación de terminal, evaluado con Hermes Agent.
- Razonamiento multi-paso orientado a tareas de ingeniería, con menor número de turnos y de tokens generados que el modelo base en las tareas evaluadas.
- Decodificación especulativa mediante la capa MTP integrada, usada como modelo borrador.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agente de ingeniería de software autónomo: desplegado detrás de Hermes Agent con el servidor compatible con OpenAI de mlx-lm, el modelo puede recibir una tarea como "encuentra por qué fallan los tests de tests/test_parser.py y corrige el bug" y ejecutar el ciclo de inspección, edición y verificación. Es su caso de uso principal, para el que fue entrenado con RL.
- Automatización de terminal y operaciones: con Terminal-Bench 2.1 como referencia (58,8% frente a 44,7% del base), es adecuado para tareas de línea de comandos encadenadas, diagnóstico de errores y ejecución de scripts con verificación de resultados.
- Asistencia en pipelines de CI/CD: el soporte de tool calls en formato OpenAI permite integrarlo en orquestadores que invocan herramientas (ejecutar tests, leer logs, aplicar parches) y validar cada paso antes de continuar.
- Análisis de capturas de terminal o de interfaz: mediante mlx-vlm y el encoder de visión, puede responder preguntas sobre el error mostrado en una captura de pantalla, útil en herramientas de soporte técnico para desarrolladores.
- Desarrollo local en Mac de gama alta: al ejecutarse con MLX sobre Apple Silicon, permite mantener un agente de código en local sin enviar código propietario a servicios externos, con 96 GB o más de memoria unificada para esta build bf16.
- Generación de código con formato de herramienta: la plantilla de chat y el vocabulario originales de Qwen3.8-27B permiten reutilizar integraciones existentes basadas en el formato XML de Qwen sin cambios en el cliente.
- Prototipado e investigación de agentes: la disponibilidad de builds 4-bit, 6-bit y 8-bit de la misma familia, junto con el adaptador LoRA suelto, facilita experimentar con distintos compromisos de memoria y fidelidad sobre el mismo modelo.

## Benchmarks y rendimiento

Resultados publicados por el autor del adaptador (harness-hub) bajo Hermes Agent con thinking desactivado, comparando el modelo adaptado con el base:

| Benchmark | Modelo base | Modelo adaptado |
|---|---|---|
| SWE-bench Pro (hard 51) | 29,4% | 43,1% |
| Terminal-Bench 2.1 | 44,7% | 58,8% |

Según la model card, el modelo adaptado usa menos del 40% de los turnos del base en las tareas que ambos resuelven y aproximadamente la mitad de tokens generados; con thinking desactivado iguala al base con thinking en su esfuerzo máximo (xhigh) con 3,5–4,4 veces menos tokens.

Fidelidad de las builds MLX de la familia (verificadas en un MacBook Pro M5 Max de 128 GB, 19 de noviembre de 2026, con mlx 0.32.4, mlx-lm 0.32.2 y mlx-vlm 0.7.11):

| Build | Tamaño | Mismo siguiente token que bf16 | KL frente a bf16 | GSM8K (50 preguntas) | Memoria pico, prompt de 8K | Memoria de Mac sugerida |
|---|---|---|---|---|---|---|
| MLX-6bit (recomendada) | 23,1 GB | 98,5% | 0,0015 | 46/50 | 23,4 GB | 36 GB+ |
| MLX-8bit | 30,0 GB | 99,2% | 0,0004 | 45/50 | 29,7 GB | 48 GB+ |
| MLX-4bit | 16,3 GB | 96,1% | 0,0192 | 43/50 | 17,1 GB | 32 GB+ |
| MLX-bf16 (esta build) | 55,6 GB | referencia | referencia | 45/50 | 53,4 GB | 96 GB+ |
| MLX-adapter | 638 MB | solo LoRA, para mlx-lm | sobre cualquier build MLX de Qwen3.8-27B | — | — | — |

## Requisitos de hardware

- VRAM/memoria unificada: 53,4 GB de pico con un prompt de 8K tokens en esta build bf16; se recomienda un Mac con 96 GB o más de memoria unificada.
- Alternativas de menor huella dentro de la misma familia: 6-bit (23,4 GB de pico, 36 GB+ de Mac), 8-bit (29,7 GB de pico, 48 GB+ de Mac) y 4-bit (17,1 GB de pico, 32 GB+ de Mac).
- GPU: exclusivamente Apple Silicon mediante MLX; no está pensado para GPU NVIDIA (A100, H100, RTX 4090) en este formato.
- Cabe en equipos de consumo Apple de gama alta: la build 4-bit requiere 32 GB+ y la 6-bit 36 GB+, por lo que es viable en Mac con memoria unificada de 32 a 64 GB según la cuantización.
- Despliegue: mlx-lm (servidor compatible con OpenAI con `mlx_lm.server`) para texto; mlx-vlm para entrada de imágenes; integración con Hermes Agent mediante configuración de proveedor personalizado.
- Latencia y throughput: no se publican cifras de latencia ni de tokens por segundo en la información disponible; sí se documenta una reducción de aproximadamente 2 veces en tokens generados frente al modelo base en las tareas evaluadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-hermes-adapted-MLX-bf16 (esta ficha) | 27,78 B | no disponible (Hermes Agent exige 64K) | SWE-bench Pro 43,1%; Terminal-Bench 2.1 58,8% | Apache 2.0 | MLX, Apple Silicon |
| Qwen/Qwen3.8-27B (base) | 27,78 B (misma arquitectura) | no disponible | SWE-bench Pro 29,4%; Terminal-Bench 2.1 44,7% (con Hermes Agent) | Apache 2.0 (según el modelo base referenciado) | safetensors originales de Qwen |
| netprojects/Qwen3.8-27B-hermes-adapted-MLX-6bit | 27,78 B (cuantizado) | no disponible | 98,5% de coincidencia de siguiente token con bf16; GSM8K 46/50 | Apache 2.0 | MLX, 36 GB+ de Mac |
| netprojects/Qwen3.8-27B-hermes-adapted-MLX-4bit | 27,78 B (cuantizado) | no disponible | 96,1% de coincidencia; GSM8K 43/50 | Apache 2.0 | MLX, 32 GB+ de Mac |

No se dispone de datos de benchmarks frente a modelos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- El adaptador se entrenó y evaluó con thinking desactivado; la model card recomienda mantenerlo desactivado. Su uso con thinking activado no está validado.
- El checkpoint del adaptador corresponde al paso 160 de 1000 planificados, por lo que el entrenamiento no se completó.
- La decodificación especulativa con la capa MTP puede divergir ligeramente del decodificado simple en respuestas largas cuando hay empates cercanos en la verificación por lotes.
- El modelo está limitado a Apple Silicon y al ecosistema MLX; no es directamente desplegable en GPU NVIDIA ni en formatos GGUF.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la build se publicó el 19 de noviembre de 2026: no hay validación comunitaria independiente.
- No se dispone de información sobre sesgos, idiomas soportados ni tasas de alucinación; al ser un modelo orientado a agentes de código, los errores en tool calls pueden propagarse a acciones sobre el sistema de archivos o la terminal.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base Qwen/Qwen3.8-27B y del adaptador harness-hub, de los que este repositorio es una conversión.
- Requiere al menos 64.000 tokens de contexto para funcionar con Hermes Agent, lo que condiciona la memoria disponible en equipos de 96 GB.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-bf16
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Build 6-bit recomendada: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-6bit
- Build 8-bit: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-8bit
- Build 4-bit: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-4bit
- Adaptador LoRA para mlx-lm: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-adapter
- Hermes Agent (NousResearch): https://github.com/NousResearch/hermes-agent
