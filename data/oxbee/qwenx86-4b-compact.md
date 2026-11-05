# OxBee/Qwenx86-4B-compact

## Resumen

Qwenx86-4B-compact es un modelo derivado de Qwen/Qwen3.5-4B en el que el autor (OxBee) ha compilado una máquina x86-64 completa dentro de los pesos del transformer. El modelo conserva el backbone original de Qwen3.5-4B y le antepone 13 capas adicionales ("chip layers") cuyos pesos no son aprendidos: se calculan mediante un compilador (chipformer) que traduce el circuito de la CPU a operaciones compatibles con las capas de Qwen3.5. El resultado es un modelo de lenguaje que, además de generar texto, dispone de una CPU funcional embebida en su estado interno, invocable mediante tool calls nativas (`<tool_call>`).

La propuesta es poco convencional y muy específica: no se trata de un modelo más grande ni de un fine-tune de instrucciones, sino de una demostración de "computer-in-weights". La CPU embebida ejecuta instrucciones x86-64 enteras (ALU de 8/16/32/64 bits, shifts, MUL/IMUL/DIV/IDIV, MOVZX/MOVSX, SETcc/CMOVcc, BT/BTS/BTR/BTC, BSF/BSR, string ops con REP, calls y returns) y dispone de firmware empaquetado en el checkpoint: calculadora racional exacta, MicroPython, un compilador de C llamado qcc, almacén de notas y bases de consulta de física/química y de documentación de Python. El autor reporta verificación lockstep contra Unicorn en 2.000/2.000 casos.

La versión "compact" está pensada para caber en una GPU de 16 GB (aproximadamente 9 GB de memoria GPU). El repo ocupa 9,0 GB. Es un modelo de nicho, con 0 descargas y 0 likes en el momento de la consulta, orientado a investigación y demostración más que a producción generalista. La licencia es Apache 2.0, lo que permite uso comercial bajo los términos de dicha licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5-4B + 13 capas "chip" compiladas (CPU x86-64 en pesos, estado en Gated DeltaNet) |
| Parametros totales | no disponible (repo de 9,0 GB; base Qwen3.5-4B más capas de CPU) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint compacto pensado para ~9 GB en GPU de 16 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye estados de arranque en `model/boot/*.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y le añade 13 capas transformer adicionales situadas por delante de las capas originales de Qwen. Estas capas no contienen pesos aprendidos: todos sus pesos son calculados por un compilador (chipformer) que convierte el circuito de una CPU x86-64 en operaciones ejecutables dentro del flujo del modelo. La CPU es un fork del núcleo RV32 de Qwenputer (proyecto previo del mismo autor), al que se han añadido micro-operaciones de flags x86 (FADD, FSUB, FAND, FOR, FXOR, FINC, FDEC), saltos condicionales con la tabla de condiciones x86 (JCC) y un traductor de x86-64 a las operaciones de 32 bits del núcleo, con valores de 64 bits representados como mitades en registros/RAM y flags reconstruidos por instrucción.

La memoria del sistema embebido es de 64 KB de RAM (el circuito pasó de 11 a 13 capas para acomodarla), 256 KB de ROM de código y 128 KB de datos de solo lectura, todo ello implementado en el estado de Gated DeltaNet del modelo. El firmware (calculadora, qcc, notas, science, python_doc y una máquina x86 que decodifica bytes x86 en crudo con SSE e interrupciones) se empaqueta en el checkpoint como seis estados de arranque (`model/boot/*.safetensors`), de modo que cada tool call carga la máquina completa (código, datos, registros, PC) desde el propio checkpoint sin carga de programas en el host. No se dispone de información sobre el volumen de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO; el grueso del trabajo descrito es de compilación e integración, no de entrenamiento adicional.

## Capacidades

- Generación de texto y razonamiento heredados de Qwen3.5-4B (capacidades del backbone original, no cuantificadas en la información disponible).
- Tool calling nativo mediante `<tool_call>`: el modelo invoca herramientas y la CPU embebida las ejecuta.
- Herramienta `calc`: calculadora racional exacta en C con suma, resta, multiplicación, división, paréntesis y decimales.
- Herramienta `python`: MicroPython (build RISC-V precompilada de Qwenputer, parcheada para leer la tool call); expresiones de una línea imprimen su valor y programas largos se dividen en partes `#more`.
- Herramienta `c`: qcc, un compilador y ejecutor de C para este núcleo, con int, char, unsigned, long, punteros, arrays, funciones, recursión, if/while/for y printf; programas largos en partes `//more`.
- Herramientas de notas: `notes_put`, `notes_search`, `notes_get`.
- Consulta de física/química (`science`) y de documentación de Python (`python_doc`).
- Ejecución de código x86-64 entero compilado con MSVC, traducido a las operaciones del núcleo.
- Verificación por bloques (block verification) de hasta 256 tokens de máquina por pasada.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Demostración de "computer-in-weights" para investigación: ejecutar programas x86-64 reales dentro de los pesos de un LLM y auditar cada tool call con el Qwenx86 Debugger Space, que muestra conversación, registros, flags, código en el PC, RAM y salida de máquina en una línea temporal.
- Evaluación de razonamiento aritmético con calculadora exacta: el autor reporta 26/28 en las primeras 28 preguntas de test de GSM8K usando `calc` frente a 23/28 con Qwen sin la herramienta; útil para estudiar cómo el acceso a una calculadora exacta reduce errores aritméticos.
- Ejecución de código C en el propio modelo: usar `qcc` para compilar y ejecutar fragmentos de C (bucles, recursión, punteros, printf) sin salir del checkpoint, útil en entornos de demostración o docencia.
- Ejecución de expresiones y programas Python vía MicroPython embebido: prototipado rápido de cálculos dentro de una conversación con el modelo, con soporte de programas largos por partes.
- Cuaderno de notas persistente en el modelo: usar `notes_put`/`notes_search`/`notes_get` para almacenar y recuperar información entre turnos, útil para experimentos de memoria externa sin infraestructura adicional.
- Consulta de referencias técnicas: usar `science` y `python_doc` como bases de conocimiento empaquetadas para responder dudas de física, química o API de Python sin depender de recuperación externa.
- Verificación de emulación: emplear el modo de block verification (hasta 256 tokens de máquina por pasada) para comparar el estado de la CPU embebida con emuladores de referencia como Unicorn en pipelines de test.

## Benchmarks y rendimiento

| Benchmark | Qwenx86-4B-compact | Qwen3.5-4B (sin herramienta) |
|---|---|---|
| GSM8K (primeras 28 preguntas de test, con `calc`) | 26/28 | 23/28 |
| Verificación lockstep x86 vs Unicorn | 2.000/2.000 casos | no aplica |
| SSE en software vs SSE real | bit-idéntico en 3.200 operaciones aleatorias | no aplica |
| Ejecución "hello" por el circuito compilado | 1,44 M tokens, 0 errores | no aplica |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni otros benchmarks estándar del backbone.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9 GB para el checkpoint compacto, según el autor; pensado para caber en una GPU de 16 GB.
- GPU recomendadas: cualquier GPU con 16 GB o más de VRAM (el autor menciona explícitamente el objetivo de 16 GB); no se detallan modelos concretos como A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB (por ejemplo, gama RTX xx80/xx90 con 16 GB o más), según la afirmación del autor.
- Opciones de despliegue: el autor menciona un "compact 16 GB loader" propio; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La verificación por bloques procesa hasta 256 tokens de máquina por pasada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwenx86-4B-compact | base 4B + 13 capas CPU | no disponible | LLM + CPU x86-64 compilada en pesos | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen3.5-4B | 4B | no disponible | LLM generalista | no disponible en la información | HuggingFace (modelo base) |
| Qwenputer (mismo autor) | no disponible | no disponible | LLM + CPU RV32 compilada en pesos | no disponible | proyecto previo del autor |

No se dispone de datos de rendimiento comparables entre estos modelos más allá del resultado de GSM8K citado (26/28 con `calc` frente a 23/28 sin herramienta).

## Limitaciones y advertencias

- Modelo de nicho con 0 descargas y 0 likes en el momento de la consulta: ecosistema, documentación y soporte muy limitados.
- No se documentan sesgos, riesgos de alucinación ni evaluaciones de seguridad del backbone Qwen3.5-4B en esta ficha; hereda los del modelo base, no cuantificados aquí.
- Longitud de contexto e idiomas soportados no disponibles: no se puede garantizar comportamiento multilingüe ni ventanas largas.
- La CPU embebida ejecuta código x86-64 entero compilado con MSVC; no cubre punto flotante nativo (SSE se emula en software) ni todas las instrucciones posibles.
- La máquina x86 (x86vm) que decodifica bytes x86 en crudo con SSE e interrupciones está en el árbol de desarrollo y no se distribuye como herramienta en esta release.
- El firmware se carga desde estados de arranque del checkpoint; no hay carga de programas en el host, lo que limita la flexibilidad frente a un intérprete convencional.
- Licencia Apache 2.0: permite uso comercial bajo sus términos, pero conviene revisar las obligaciones de atribución y las licencias de las dependencias (Qwenputer reutilizado bajo MIT, MicroPython, Qwen3.5-4B).
- El tamaño del repo (9,0 GB) y el requisito de ~9 GB de VRAM condicionan el despliegue; no se documentan opciones de cuantización.
- No hay benchmarks estándar publicados (MMLU, HumanEval) en la información disponible, por lo que la comparación con alternativas generalistas es limitada.

## Enlaces

- HuggingFace: https://huggingface.co/OxBee/Qwenx86-4B-compact
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Demo (Qwenx86 Debugger Space): https://huggingface.co/spaces/Quazim0t0/Qwenx86-Debugger
- Visor de arquitectura: https://hfviewer.com/Quazim0t0/Qwenx86-4B-compact
- Proyecto previo Qwenputer (referenciado en la model card): no disponible como enlace directo en la información proporcionada.
