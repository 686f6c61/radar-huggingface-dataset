# Blugart/estragon-9b

## Resumen

Estragon-9B es un fine-tune del modelo Qwen/Qwen3.5-9B, desarrollado por Blugart como proyecto individual, especializado en la generación de código GDScript correcto e idiomático para el motor de juegos Godot 4.7. El modelo resuelve un problema concreto: los modelos de propósito general generan código GDScript con APIs obsoletas o inventadas, mientras que Estragon ha sido entrenado exclusivamente para producir scripts que compilan y pasan verificaciones de comportamiento en un Godot headless real. Su relevancia radica en que es un especialista de dominio, no un asistente generalista, y demuestra que un fine-tune dirigido con un juez automatizado puede superar a modelos mucho más grandes en una tarea específica.

La arquitectura es un transformer denso de 8.953.803.264 parámetros (9B), basado en Qwen3.5-9B, con pesos en bf16 y cuantizaciones GGUF disponibles. El entrenamiento combinó SFT (~20.000 pares validados) con GRPO, usando un binario headless de Godot 4.7 como función de recompensa. El modelo incluye un system prompt embebido que es parte integral del comportamiento; sin él, el rendimiento cae notablemente. La longitud de contexto no se especifica en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (original), GGUF Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16), GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso de 9B parámetros, y se somete a un pipeline de fine-tune en dos fases. Primero, un SFT con aproximadamente 20.000 pares de instrucción-respuesta validados, construidos a partir de documentación oficial de Godot, repositorios reales con licencias permisivas, datos sintéticos anclados en extractos de documentación y pares de migración mecánica Godot 3 a Godot 4. Cada ejemplo fue parse-validado por un binario headless de Godot 4.7 antes de entrar al conjunto de entrenamiento. La segunda fase aplica GRPO (Group Relative Policy Optimization) con el mismo juez headless como recompensa, evaluando pass/fail, penalizando ruido de estilo y detectando degeneración, sobre 254 tareas de entrenamiento verificadas en runtime, totalmente disjuntas del conjunto de evaluación (con decontaminación a nivel de shingle).

La innovación técnica principal es el uso de un juez automatizado real (Godot headless) como reward model, en lugar de un modelo de lenguaje para puntuar respuestas. Esto permite medir directamente si el código generado parsea y cumple checks de comportamiento en el motor. El system prompt está embebido en el modelo y es parte del objetivo de tuning; sin él, el rendimiento cae (efecto de inversión de prompt). El modelo es no-thinking: el modo de razonamiento de Qwen3.5 degrada el rendimiento en 15 tareas y debe desactivarse explícitamente.

## Capacidades

- Generación de código GDScript correcto e idiomático para Godot 4.7, con tipado estático, indentación con tabuladores y APIs actuales (@export, @onready, Callable, await, FileAccess, Time).
- Rechazo de APIs y sintaxis de Godot 3: el modelo puede rechazar código obsoleto por principio.
- Cumplimiento estricto de especificaciones: mantiene nombres y firmas solicitadas, sin añadir variables exportadas, métodos extra, bloques _ready, prints ni código demo no pedido.
- Respuesta en un único archivo GDScript completo dentro de un bloque de código cercado, con explicación solo si se solicita.
- Sin soporte de tool calling ni function calling documentado.
- Sin soporte de agentes ni multi-step reasoning: es un generador de código de un solo paso.
- Sin capacidades multimodales (ni visión ni audio).
- Capacidades multilingües no documentadas; el system prompt está en inglés y el dominio es código, no lenguaje natural.

## Casos de uso

- Desarrollo de juegos en Godot 4.7: el modelo genera scripts de gameplay (movimiento de personajes, plataformas, mecánicas de salto con coyote time) que parsean y pasan checks de comportamiento en el motor, reduciendo el ciclo de prueba-error del desarrollador.
- Migración de proyectos Godot 3 a Godot 4: entrenado con pares de migración mecánica, puede convertir scripts antiguos a la API actual de Godot 4.7, aunque puede rechazar código Godot 3 válido por principio.
- Prototipado rápido de mecánicas: un desarrollador puede pedir "un salto de plataformas 2D con coyote time" y obtener un CharacterBody2D completo y funcional, listo para integrar en una escena.
- Integración en pipelines de CI/CD: el modelo puede generar scripts que se validan automáticamente con un binario headless de Godot, permitiendo un bucle "generar 3, quedarse con el primero que parsea" que recupera gran parte del headroom de pass@8 (285/300, 95%).
- Asistencia en editores de código: desplegado vía Ollama o llama.cpp, funciona como autocompletado o generador de fragmentos dentro del flujo de trabajo del desarrollador, con el system prompt embebido en el Modelfile.
- Educación en GDScript: puede servir como referencia de APIs actuales de Godot 4.7, mostrando patrones idiomáticos correctos (Callable, await, FileAccess) frente a prácticas obsoletas.

## Benchmarks y rendimiento

Los resultados se midieron en GDScript-Eval v2 (gdeval_v2): 300 tareas held-out en 10 categorías, juzgadas por un binario headless de Godot 4.7. Una tarea pasa solo si el archivo generado parsea y sus checks de comportamiento pasan en el motor. Decodificación greedy (pass@1), con el system prompt de despliegue.

| Modelo | Parametros | gdeval_v2 | % |
|---|---|---|---|
| ibm-granite/granite-4.1-8b | 8B | 123/300 | 41,0% |
| microsoft/phi-4 | 14B | 146/300 | 48,7% |
| google/gemma-4-12B-it (Q8 GGUF) | 12B | 211/300 | 70,3% |
| Qwen3-8B (lineage anterior) | 8B | 115/300 | 38,3% |
| Qwen3.5-9B (base de este modelo) | 9B | 219/300 | 73,0% |
| **Estragon-9B (bf16)** | 9B | **248/300** | **82,7%** |
| Claude Opus 4.8 (techo de referencia) | — | 300/300 | 100% |

Rendimiento por cuantización, medido con el mismo protocolo:

| Archivo | Bits | Tamano | gdeval_v2 | vs bf16 (248) |
|---|---|---|---|---|
| estragon-9b-Q4_K_M.gguf | 4-bit | 5,6 GB | 229/300 (76,3%) | −19 |
| estragon-9b-Q5_K_M.gguf | 5-bit | 6,5 GB | 249/300 (83,0%) | +1 |
| estragon-9b-Q8_0.gguf | 8-bit | 9,5 GB | 248/300 (82,7%) | ±0 |

Headroom de muestreo: pass@8 = 285/300 (95%). Con 8 intentos, el modelo resuelve el 95% de la evaluación; un wrapper que genere 3 candidatos y se quede con el primero que parsea en Godot headless recupera gran parte de esta ventaja a bajo coste.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M (5,6 GB) cabe en GPUs de 8 GB; Q5_K_M (6,5 GB) requiere al menos 8 GB con margen; Q8_0 (9,5 GB) necesita 12 GB o más; bf16 (~18 GB) requiere 24 GB.
- GPU recomendadas: el modelo se construyó y probó en una RTX 3060 Ti (8 GB) con Q4_K_M totalmente descargado en GPU. Para Q5_K_M o Q8_0 se recomienda RTX 4070/4080, o GPUs de datacenter como A10G o L4 para despliegues concurrentes.
- Cabe en GPUs de consumo: sí, con cuantización Q4_K_M o Q5_K_M en tarjetas de 8-12 GB.
- Opciones de despliegue: Ollama (con Modelfile que embebe el system prompt y desactiva thinking), llama.cpp (llama-server con `--chat-template-kwargs '{"enable_thinking":false}'`), y cualquier runtime compatible con GGUF. vLLM y TGI no se mencionan explícitamente, pero son viables con los pesos safetensors.
- Latencia y throughput: no disponibles en la documentación. El modelo es de 9B, por lo que en una RTX 3060 Ti con Q4_K_M se espera una generación de decenas de tokens por segundo, aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | gdeval_v2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Estragon-9B | 9B | No disponible | 82,7% | Apache-2.0 | HuggingFace (bf16 + GGUF) |
| Qwen3.5-9B (base) | 9B | No disponible | 73,0% | Apache-2.0 | HuggingFace |
| google/gemma-4-12B-it | 12B | No disponible | 70,3% (Q8) | No disponible | HuggingFace |
| microsoft/phi-4 | 14B | No disponible | 48,7% | No disponible | HuggingFace |
| ibm-granite/granite-4.1-8b | 8B | No disponible | 41,0% | No disponible | HuggingFace |

Estragon-9B supera a su propia base (Qwen3.5-9B) en 9,7 puntos porcentuales y a modelos más grandes como phi-4 (14B) en 34 puntos, lo que confirma el valor del fine-tune especializado con juez automatizado. La comparación con gemma-4-12B-it es la más ajustada, pero Estragon sigue por delante con 12,4 puntos de ventaja.

## Limitaciones y advertencias

- Especialista de dominio, no asistente generalista: la calidad fuera del ámbito de GDScript/Godot 4.7 es la que sobreviva del modelo base, sin garantías.
- Solo Godot 4.7: no escribe Godot 3 y puede rechazar código Godot 3 válido por principio. No probado contra cambios futuros de API de 4.x.
- Fallos residuales: los 52/300 errores de evaluación se concentran en precisión de APIs raras (nombres de métodos alucinados ocasionalmente), cadenas largas de cumplimiento de especificaciones y semántica temporal (casos límite de timers y tweens).
- Sin soporte de C# ni shaders más allá de casos triviales.
- El modo thinking debe estar desactivado obligatoriamente: con `enable_thinking:true` o sin `--think=false`, el modelo produce respuestas vacías o degradadas (medido: −15 tareas) y bloques de razonamiento sin cerrar que consumen todo el presupuesto de tokens.
- El system prompt es parte del modelo: usarlo sin él degrada el rendimiento de forma significativa (efecto de inversión de prompt).
- Riesgo de alucinación en APIs poco comunes: aunque el juez headless filtra muchos errores, el modelo puede inventar nombres de métodos en APIs raras.
- Sesgos: no documentados; el entrenamiento se basa en documentación oficial y repositorios con licencias permisivas, lo que puede sesgar hacia patrones de código de esos repositorios.
- Licencia Apache-2.0: permite uso comercial sin restricciones, pero el modelo base Qwen3.5-9B también es Apache-2.0, por lo que no hay conflicto de licencias conocido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Blugart/estragon-9b
- Repositorio GGUF (cuantizaciones): https://huggingface.co/Blugart/estragon-9b-gguf
- Repositorio de código, harness, juez y conjuntos de evaluación: https://github.com/blugart-dev/estragon
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
