# johangdarkdev/Ember-8B-GGUF

## Resumen

Ember 8B es un ajuste fino de Qwen3-8B orientado a un agente integrado en RusticEngine, un motor de juego basado en Godot 4.7 en el que los juegos se escriben en Rust mediante godot-rust (gdext) 0.5. El modelo actúa como asistente de desarrollo dentro del motor: pregunta por la idea del creador, explica lo que construye y guía en el uso del Studio del motor en lugar de generar el juego completo de una sola vez. Lo publica el usuario johangdarkdev en Hugging Face bajo licencia Apache-2.0.

Técnicamente es un transformer denso de 8.190.735.360 parámetros (heredero directo de Qwen3-8B), afinado con QLoRA de rango 16 sobre varios cientos de trazas de agente reales de RusticEngine: llamadas a herramientas para leer y editar código, compilaciones con `cargo` y realimentación del compilador, playtests headless y consultas a la API de Godot, además de conversaciones de colaboración (preguntas de arranque, modo aprendizaje, arte conceptual y guía del Studio).

La distribución disponible es un único archivo GGUF de cuantización mixta 4/5 bits de unos 5,5 GB, pensado para ejecutarse en local con llama.cpp u Ollama y para que RusticEngine lo descargue automáticamente la primera vez que se abre la guía de IA. Su relevancia actual radica en ser un ejemplo de modelo pequeño especializado en un dominio muy concreto (godot-rust) con soporte nativo de tool calling y modo no-thinking.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF mixto 4/5 bits: attention y ffn_down en Q5_0, ffn_gate/up y embeddings en Q4_0, output en Q8_0 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`ember.gguf`, SHA-256 `5b0017088220f714af249405a5ba5db5a93bb5880bb29072e727b127cc9fa02c`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso de 8,19 mil millones de parámetros, y se ajusta mediante QLoRA con rango 16. El conjunto de entrenamiento lo componen varios cientos de trazas de agente recogidas en RusticEngine: llamadas reales a herramientas (lectura y edición de código, compilaciones con `cargo` con realimentación del compilador, playtests headless y consultas a la API de Godot) y conversaciones de colaboración (preguntas de kickoff, modo aprendizaje, arte conceptual y guía del Studio). No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron fases de RLHF o DPO.

El formato de chat es Qwen3 ChatML con llamadas a herramientas mediante `<tool_call>` y modo no-thinking: cada respuesta va precedida de un bloque `<think></think>` vacío, tal como se entrenó. Las herramientas con las que se entrenó el modelo provienen del agente de RusticEngine (`rustic-agent --print-tools`), y el motor puede actuar como servidor MCP (`rustic-agent --mcp`) para que otros agentes usen las mismas herramientas.

## Capacidades

- Generación de código en Rust para godot-rust (gdext) 0.5 dentro del contexto de RusticEngine.
- Tool calling mediante `<tool_call>` en formato ChatML: lectura y edición de código, compilaciones con `cargo`, playtests headless y consultas a la API de Godot.
- Comportamiento de agente multi-paso: encadena llamadas a herramientas y aprovecha la realimentación del compilador para corregir errores.
- Conversación colaborativa: preguntas de arranque sobre la idea e inspiraciones del creador, modo aprendizaje con explicaciones de lo construido y guía paso a paso sobre el Studio y las mecánicas del motor.
- Generación de mecánicas de juego nuevas (dash, puertas, checkpoints, enemigos con patrulla) partiendo de variantes de mecánicas ya probadas en RusticEngine.
- Modo no-thinking por defecto (bloque `<think>` vacío), con posibilidad de activar razonamiento extendido siguiendo el comportamiento de Qwen3.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Asistencia de programación dentro de RusticEngine: el modelo se integra en la guía de IA del motor y responde con código godot-rust que se compila y ejecuta mediante el harness del agente, que devuelve los errores del compilador para iterar.
- Generación de mecánicas de juego: a partir de una descripción del creador, propone implementaciones de dash, puertas, checkpoints o enemigos con patrulla construidas sobre variantes ya probadas del motor.
- Modo aprendizaje: explica el código que genera y guía al creador para que aprenda a escribir su propio código en Rust en lugar de sustituirlo.
- Onboarding de nuevos usuarios del motor: responde preguntas de kickoff sobre la idea e inspiraciones del proyecto y conduce la conversación hacia decisiones de diseño.
- Consulta de la API de Godot: realiza búsquedas de API antes de escribir código para reducir el uso de métodos inexistentes, apoyándose en las herramientas del agente.
- Automatización de playtests: lanza y evalúa partidas headless como parte de un bucle de agente que compila, ejecuta y corrige.
- Integración con otros agentes vía MCP: al exponer RusticEngine como servidor MCP, otros agentes pueden invocar las mismas herramientas que usa Ember para leer, editar y compilar proyectos.
- Despliegue local en estaciones de trabajo: el GGUF de 5,5 GB permite ejecutar el asistente en un equipo de desarrollo sin depender de servicios en la nube.

## Benchmarks y rendimiento

Evaluación propia de RusticEngine (32 tareas de código godot-rust no vistas, puntuadas según si el código compila y el juego se ejecuta), con el harness de agente del motor:

| Evaluación | Resultado de Ember | Referencia |
|---|---|---|
| Tareas de código que compilan (32 tareas) | ~17 de 32 por pasada | Qwen3-8B base: ~7 de 16 en una versión anterior y más pequeña de la misma evaluación |
| Tareas cuyo juego se ejecuta (32 tareas) | ~16 de 32 por pasada | No disponible para la base en esta métrica |
| Preguntas retenidas sobre el Studio | 34 de 34 | No disponible |
| Preguntas retenidas sobre mecánicas | 9 de 9 | No disponible |
| Mecánicas nuevas que compilan y hacen lo pedido | 6 de 8 en la última ejecución completa (antes 0 de 5) | No disponible |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF ocupa unos 5,5 GB, por lo que se necesita algo más de esa cifra para el modelo y el contexto; una GPU con 8 GB de VRAM es el mínimo práctico razonable para esta cuantización.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cualquier GPU consumer con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070) debería poder cargar el GGUF; para mayor throughput, GPUs de 16-24 GB (RTX 4080, RTX 4090) o de datacenter (A100, H100).
- Cabe en GPU consumer: sí, con la cuantización mixta 4/5 bits publicada.
- Opciones de despliegue: llama.cpp (`llama-server -m ember.gguf --jinja`), Ollama (creando un modelo a partir del GGUF con la plantilla de Qwen3 y `think: false`) y el propio RusticEngine, que lo descarga automáticamente.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota de configuración: para desactivar el modo thinking hay que terminar los prompts con un bloque `<think>\n\n</think>\n\n` vacío, tal como se hizo en el entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ember 8B (este modelo) | 8,19 B | No disponible | Agente de desarrollo para godot-rust/RusticEngine, GGUF 4/5 bits | Apache-2.0 | GGUF en Hugging Face |
| Qwen3-8B (base) | 8,19 B | No disponible en la información proporcionada | Modelo generalista con modo thinking | Apache-2.0 | Pesos completos y cuantizaciones en Hugging Face |
| Alternativas de 8B para código | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa con la base solo está documentada en la evaluación propia de RusticEngine: Ember construye ~17 de 32 tareas frente a ~7 de 16 de Qwen3-8B en una versión anterior y más pequeña de la misma prueba, una comparación no equivalente en tamaño de conjunto. No se dispone de datos de benchmarks estándar para establecer comparaciones con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Es un modelo de 8B: inventa métodos de Godot en ocasiones. El harness de RusticEngine lo compensa devolviendo errores del compilador, corrigiendo imports automáticamente y ofreciendo búsquedas de API antes de escribir código; sin ese harness el rendimiento en código será inferior.
- El entrenamiento está muy especializado en RusticEngine y godot-rust; fuera de ese dominio no hay evidencia de calidad y el comportamiento esperado es el de un Qwen3-8B con un ajuste fino estrecho.
- Idioma: la model card declara únicamente inglés; no hay datos sobre calidad en castellano u otros idiomas.
- Longitud de contexto: no disponible en la información proporcionada; conviene verificar la configuración antes de usarlo con proyectos grandes.
- Riesgo de alucinación en APIs, nombres de métodos y detalles del motor, especialmente en mecánicas no vistas durante el entrenamiento.
- Sesgos: no se documentan sesgos específicos en la información disponible.
- Licencia Apache-2.0 para el modelo, igual que la base Qwen3; RusticEngine, el motor con el que se integra, es GPL-3.0, lo que conviene tener en cuenta si se redistribuye conjuntamente.
- El repositorio no registra descargas ni likes y el pipeline no está declarado; verificar la integridad del GGUF con el SHA-256 publicado antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/johangdarkdev/Ember-8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- godot-rust (gdext): https://github.com/godot-rust/gdext
- Godot Engine: https://godotengine.org
