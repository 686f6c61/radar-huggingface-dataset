# Quazim0t0/Qwenx86-4B-compact

## Resumen

Qwenx86-4B-compact es una variante experimental del modelo Qwen3.5-4B de Alibaba Qwen en la que se ha compilado un ordenador x86-64 de 64 bits dentro de los propios pesos del modelo. Lo desarrolla Quazim0t0 como evolución de su proyecto previo Qwenputer (basado en un núcleo RISC-V RV32), y se apoya en el trabajo de divagr1925 sobre el circuito RV32 original. El resultado es un checkpoint de aproximadamente 9 GB que cabe en una GPU de 16 GB y en el que el modelo invoca el ordenador mediante sus propias llamadas de herramienta (`<tool_call>`), ejecutando el hardware dentro de las capas adicionales del transformer.

La innovación central es que las 13 capas que se añaden por delante de las capas nativas de Qwen no contienen pesos aprendidos: todos sus pesos los calcula un compilador (chipformer). El circuito implementa un núcleo x86-64 con 64 KB de RAM, 256 KB de ROM de código y 128 KB de datos de solo lectura, todo alojado en el estado de Gated DeltaNet del modelo. Sobre ese hardware se han grabado como firmware seis herramientas (calculadora racional exacta, MicroPython, un compilador de C llamado qcc, un almacén de notas, un índice de constantes científicas y un índice de documentación de Python), de modo que las respuestas a esas herramientas las produce el ordenador en los pesos y no el host.

Es relevante ahora porque demuestra un enfoque poco habitual: en lugar de emular una CPU mediante prompting o código externo, integra la máquina en la arquitectura del modelo y la expone a través del mecanismo estándar de tool calling. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card está redactada en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5-4B con 13 capas adicionales de circuito x86-64 compilado (sin pesos aprendidos) y estado Gated DeltaNet |
| Parametros totales | no disponible (modelo base de 4B más capas de circuito compilado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint compacto de ~9 GB pensado para GPU de 16 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (estados de arranque en `model/boot/*.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B y le antepone 13 capas de circuito. Estas capas no se entrenan: sus pesos se generan mediante un compilador (chipformer) que traduce el circuito del núcleo a operaciones compatibles con las capas de Qwen3.5. El núcleo es un fork del RV32 de Qwenputer al que se le añadieron micro-operaciones de flags x86 (FADD, FSUB, FAND, FOR, FXOR, FINC, FDEC) y saltos condicionales con la tabla de condiciones de x86 (JCC), además de un traductor de x86-64 a las operaciones de 32 bits del núcleo (valores de 64 bits como mitades de registro/RAM, flags reconstruidos por instrucción, puertos de puente y un despacho de retorno compartido). La memoria creció de 32 KB a 64 KB de RAM al pasar de 11 a 13 capas.

El conjunto de instrucciones cubierto incluye ALU de 8/16/32/64 bits (con ADC/SBB), desplazamientos, rotaciones, MUL/IMUL/DIV/IDIV, MOVZX/MOVSX, SETcc/CMOVcc, BT/BTS/BTR/BTC, BSF/BSR, operaciones de cadena con REP, llamadas y retornos. El autor declara una verificación lockstep contra Unicorn en 2.000 casos, comprobando todos los registros y flags tras cada instrucción. Además, el firmware x86vm (no incluido como herramienta en esta release) decodifica bytes x86-64 en tiempo de ejecución, emula SSE en software (bit a bit idéntico en 3.200 operaciones aleatorias) y gestiona interrupciones (IDT, INT n, IRETQ, STI/CLI, HLT, temporizador). El bucle de conversación ejecuta las capas del chip por token, con un cargador compacto para 16 GB y verificación por bloques de hasta 256 tokens de máquina por pasada.

## Capacidades

- Generación de texto y razonamiento heredados de Qwen3.5-4B.
- Invocación de herramientas mediante `<tool_call>`, resuelta por el ordenador compilado en los pesos.
- Calculadora racional exacta (`calc`) con suma, resta, multiplicación, división, paréntesis y decimales.
- Ejecución de expresiones y programas en MicroPython (`python`), con programas largos divididos en partes `#more`.
- Compilación y ejecución de C (`c`) mediante qcc: int, char, unsigned, long, punteros, arrays, funciones, recursión, if/while/for y printf, con programas largos en partes `//more`.
- Almacén de notas en RAM de la máquina (`notes_put`, `notes_search`, `notes_get`) sin enrutado en el host.
- Consulta de constantes científicas (`science`): 647 constantes CODATA, conversiones de unidades y tabla periódica (NIST / scipy.constants) con índice invertido en datos de solo lectura.
- Consulta de documentación de Python (`python_doc`): 1.003 firmas de API y docstrings comprimidas con gramática (204 KB a 110 KB).
- Soporte de tool calling y de agentes de varios pasos a través del bucle de conversación.
- Capacidades multilingües: no disponible.

## Casos de uso

- Cálculo numérico exacto en pipelines de agentes: usar `calc` para operaciones con racionales y decimales donde el redondeo en coma flotante es inaceptable, con la ventaja de que el cálculo se ejecuta en el circuito del modelo y no en el host.
- Ejecución de código Python en línea dentro de un agente: el firmware MicroPython permite evaluar expresiones y programas cortos sin salir del checkpoint, útil para prototipado y verificación rápida de resultados.
- Compilación y prueba de fragmentos de C: qcc permite compilar y ejecutar código C con punteros, arrays y recursión, lo que sirve para validar algoritmos o ejemplos docentes dentro de la propia conversación.
- Memoria persistente entre turnos: `notes_put`, `notes_search` y `notes_get` almacenan y recuperan información en la RAM de la máquina, adecuado para agentes que necesitan recordar estado sin infraestructura externa.
- Asistencia científica con recuperación exacta: el índice `science` con 647 constantes CODATA y la tabla periódica permite responder consultas de física y química con recuperación exacta (647/647) y retrieval@1 del 98,0 %.
- Ayuda a programación con documentación de referencia: `python_doc` ofrece 1.003 firmas de API con recall exacto (1.003/1.003), útil para responder dudas de API dentro de un asistente de código.
- Investigación en interpretabilidad y cómputo en pesos: sirve como banco de pruebas para estudiar cómo un circuito compilado interactúa con las capas aprendidas de un transformer y para reproducir la verificación lockstep del núcleo.
- Demostración educativa de arquitectura de computadores: el espacio Qwenx86 Debugger permite recorrer llamadas reales, registros y flags x86, código en el contador de programa, RAM y salida de máquina.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| GSM8K (primeras 28 preguntas de test), con `calc` | 26/28 |
| GSM8K (primeras 28 preguntas de test), Qwen sin herramienta | 23/28 |
| Verificación lockstep del núcleo x86 vs Unicorn | 2.000/2.000 casos |
| SSE en software vs unidad SSE real | 3.200 operaciones bit a bit idénticas |
| Recuperación exacta `science` | 647/647 |
| Retrieval@1 `science` | 98,0 % |
| Recuperación exacta `python_doc` | 1.003/1.003 |
| Ejecución de hello en x86vm | 1,44 M tokens, 0 errores |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9 GB para el checkpoint compacto, diseñado para caber en una GPU de 16 GB.
- GPU recomendadas: no disponibles de forma explícita; por el tamaño, encaja en tarjetas de 16 GB o más.
- Cabe en GPU de consumo: sí, según el autor, en GPUs de 16 GB (por ejemplo, la clase RTX 4080/4090 de 16-24 GB); no se detallan modelos concretos.
- Opciones de despliegue: el autor proporciona un cargador compacto para 16 GB y verificación por bloques de hasta 256 tokens de máquina por pasada; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Herramientas en pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwenx86-4B-compact | 4B base + 13 capas de circuito | no disponible | Sí (calc, python, c, notes, science, python_doc) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.5-4B (base) | 4B | no disponible | No | Apache 2.0 (según modelo base) | Hugging Face |
| Qwenputer (proyecto previo del autor) | no disponible | no disponible | Sí, sobre núcleo RISC-V RV32 | MIT (componentes compartidos) | Repositorio del autor |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Proyecto experimental con 0 descargas y 0 likes; no hay evidencia de uso en producción.
- El núcleo cubre el subconjunto de instrucciones enteras usado por C compilado con MSVC; no se documenta soporte completo de x86-64 ni de coma flotante hardware (SSE se emula en software y x86vm no se incluye como herramienta en esta release).
- El firmware x86vm no se distribuye como herramienta en esta versión.
- La emulación SSE y las interrupciones se describen en el árbol de desarrollo, no como parte del paquete entregado.
- No se documentan sesgos, riesgos de alucinación ni comportamiento multilingüe; al heredar Qwen3.5-4B, arrastra los sesgos y limitaciones del modelo base.
- Longitud de contexto no disponible; el rendimiento en conversaciones largas no está caracterizado.
- La licencia Apache 2.0 permite uso comercial, pero la naturaleza experimental y la falta de benchmarks estándar desaconsejan su uso en producción sin evaluación propia.
- El estado de la máquina vive en el estado Gated DeltaNet; no se documenta el comportamiento ante entradas adversarias que intenten corromper registros o memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Quazim0t0/Qwenx86-4B-compact
- Espacio de demostración Qwenx86 Debugger: https://huggingface.co/spaces/Quazim0t0/Qwenx86-Debugger
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Proyecto previo Qwenputer: no disponible (referenciado en la model card sin URL)
- Repositorio de divagr1925 (circuito RV32): no disponible (referenciado en la model card sin URL)
