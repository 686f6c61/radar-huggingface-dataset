# johangdarkdev/Ember-8B-GGUF

## Resumen

Ember 8B es un ajuste fino del modelo Qwen3-8B de Alibaba, desarrollado por johangdarkdev como el asistente de IA integrado en RusticEngine, un motor de videojuegos basado en Godot 4.7 en el que los juegos se escriben en Rust mediante godot-rust 0.5. El modelo está especializado en tareas de desarrollo de videojuegos: lectura y edición de código, compilaciones con `cargo`, playtests sin interfaz gráfica, consultas a la API de Godot y conversaciones de colaboración creativa con el desarrollador.

Se distribuye únicamente en formato GGUF con cuantización mixta de 4 y 5 bits, ocupando aproximadamente 5,5 GB, lo que lo hace ejecutable en hardware de consumo. La arquitectura subyacente es la de Qwen3-8B (transformer denso de 8.190.735.360 parámetros), con una ventana de contexto heredada del modelo base y licencia Apache-2.0.

Su relevancia radica en que ejemplifica el patrón de modelos pequeños especializados mediante QLoRA para dominios concretos, en este caso un agente de desarrollo de videojuegos con tool calling real, en lugar de un modelo generalista. El autor reporta mejoras sustanciales frente al Qwen3-8B base en su evaluación interna de tareas de código godot-rust.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF mixta 4/5 bits: Q5_0 (attention y ffn_down), Q4_0 (ffn_gate/up y embeddings), Q8_0 (output) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`ember.gguf`, ~5,5 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso de 8.190 millones de parámetros, y se ajusta mediante QLoRA con rango 16 sobre varios cientos de trazas de agente de RusticEngine. Estas trazas incluyen llamadas reales a herramientas (lectura y edición de código, compilaciones con `cargo` con retroalimentación del compilador, playtests sin interfaz, consultas a la API de Godot) y conversaciones de colaboración (preguntas iniciales, modo aprendizaje, arte conceptual y guía del Studio del motor).

El formato de chat es Qwen3 ChatML con llamadas a herramientas mediante `<tool_call>`, en modo no-thinking: se inserta un bloque `` vacío antes de cada respuesta, tal como se entrenó. La cuantización mixta asigna mayor precisión (Q5_0) a las capas de atención y a `ffn_down`, y menor (Q4_0) a las proyecciones gate/up y a los embeddings. El autor no detalla el número de tokens de entrenamiento ni la composición exacta del dataset más allá de las trazas mencionadas.

## Capacidades

- Generación de código Rust para godot-rust 0.5, incluyendo lectura y edición de ficheros del proyecto.
- Ejecución de compilaciones con `cargo` y uso de la retroalimentación del compilador para corregir errores.
- Playtests sin interfaz gráfica dentro del flujo del agente.
- Consultas a la API de Godot y a la biblioteca de Blender integrada en RusticEngine.
- Llamadas a herramientas (tool calling) mediante `<tool_call>` en formato ChatML.
- Razonamiento multi-paso dentro del harness de agente de RusticEngine.
- Conversaciones de colaboración: preguntas de kickoff, modo aprendizaje, arte conceptual y guía del Studio.
- Enseñanza de Blender (modelado y atajos de teclado) a partir de la biblioteca y guías internas del motor, no de reentrenamiento.
- Modo no-thinking exclusivamente; no se documenta un modo thinking activo.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Asistencia integrada en RusticEngine: el modelo se descarga automáticamente al abrir la guía de IA del motor y responde dentro del flujo de creación de juegos, usando las herramientas del agente (`rustic-agent --print-tools`).
- Generación y corrección de código godot-rust: el agente escribe código Rust, lo compila con `cargo` y reinyecta los errores del compilador al modelo para iterar, lo que compensa parcialmente su tendencia a inventar métodos de Godot.
- Playtesting automatizado: el modelo lanza y evalúa playtests sin interfaz gráfica dentro del harness, útil para validar que un juego compila y arranca.
- Enseñanza guiada de Blender: responde preguntas sobre modelado y atajos desde dentro de Blender, apoyándose en la biblioteca de RusticEngine 2.0.
- Aprendizaje del desarrollador: el modo aprendizaje explica lo que construye en lugar de entregar código opaco, adecuado para creadores que quieren entender RusticEngine.
- Servidor MCP para otros agentes: RusticEngine puede actuar como servidor MCP (`rustic-agent --mcp`), de modo que otros agentes reutilicen las mismas herramientas con este modelo.
- Exploración de mecánicas nuevas: el modelo parte de variantes de mecánicas probadas del motor (dash, puertas, checkpoints, enemigos con patrulla) para proponer implementaciones que compilan.

## Benchmarks y rendimiento

Evaluación interna de RusticEngine (32 tareas de código godot-rust no vistas, puntuadas por si el código compila y el juego se ejecuta):

| Metrica | Ember 8B | Qwen3-8B base |
|---|---|---|
| Tareas construidas (de 32) | ~17 | no disponible (7 de 16 en una versión anterior y menor de la evaluación) |
| Tareas ejecutadas (de 32) | ~16 | no disponible |
| Preguntas de Studio (held-out) | 34/34 | no disponible |
| Preguntas de mecánicas (held-out) | 9/9 | no disponible |
| Mecánicas nuevas que compilan y cumplen lo pedido | 6 de 8 | 0 de 5 en la ejecución anterior |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5 GB de pesos en GGUF mixta 4/5 bits, más overhead de contexto; en la práctica, unos 6-8 GB según la longitud de contexto.
- GPU recomendadas: tarjetas consumer con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090); en profesional, A100 o H100 para despliegues concurrentes.
- Cabe en GPU de consumo: sí, con 8 GB de VRAM o superior en la cuantización publicada.
- Opciones de despliegue: llama.cpp (`llama-server -m ember.gguf --jinja`), Ollama (creando el modelo desde el GGUF con la plantilla de Qwen3 y `think: false`), y el propio RusticEngine, que lo integra de serie.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ember 8B | 8,19 B | no disponible | Desarrollo de juegos godot-rust, agente | Apache-2.0 | GGUF en Hugging Face |
| Qwen3-8B (base) | 8,19 B | no disponible | Generalista, multilingüe | Apache-2.0 | Pesos completos y GGUF |
| Modelos de código generalistas de ~7-8 B | ~7-8 B | no disponible | Generación de código genérica | varía | varía |

Frente a Qwen3-8B, Ember gana en tareas específicas de godot-rust según la evaluación del autor, pero pierde capacidades generales y multilingües al estar ajustado solo en inglés y sobre trazas de un dominio concreto. No se dispone de datos para comparar con alternativas especializadas en desarrollo de videojuegos.

## Limitaciones y advertencias

- Modelo de 8B: el propio autor advierte que sigue inventando métodos de Godot en ocasiones; el harness de RusticEngine compensa con retroalimentación del compilador, arreglo automático de imports y consultas a la API antes de escribir código.
- Solo soporta inglés; no se documentan capacidades en castellano ni en otros idiomas.
- Entrenado exclusivamente en el ecosistema RusticEngine/godot-rust; su utilidad fuera de ese dominio es limitada.
- Modo no-thinking únicamente; requiere insertar un bloque `` vacío para replicar el formato de entrenamiento.
- La evaluación reportada es interna del autor, con conjuntos pequeños (32 tareas, 8 mecánicas) y sin comparación con benchmarks estándar; los resultados deben tomarse con cautela.
- Riesgo de alucinación en APIs y métodos de Godot fuera de las variantes probadas del motor.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-8B impone sus propios términos; RusticEngine es GPL-3.0, lo que afecta a la integración, no al modelo.
- El repositorio tiene muy poca tracción (297 descargas, 0 likes) y una única versión publicada; no hay garantía de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/johangdarkdev/Ember-8B-GGUF
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- godot-rust (gdext): https://github.com/godot-rust/gdext
- Godot Engine: https://godotengine.org
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
