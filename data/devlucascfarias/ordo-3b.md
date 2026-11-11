# devlucascfarias/ordo-3b

## Resumen

Ordo 3B es un ajuste fino mediante LoRA (PEFT) sobre `Qwen/Qwen2.5-Coder-3B-Instruct`, desarrollado por el usuario `devlucascfarias`. No es un modelo de propósito general, sino un componente especializado que actúa como "recolector de basura de contexto neuronal" (neural context garbage collector) para agentes de programación. Su función es comprimir salidas ruidosas de terminal, logs de compilación, trazas de tests y archivos fuente monolíticos en YAML causal estructurado, preservando rutas de archivo, números de línea y cadenas de error exactas.

El modelo se sitúa entre agentes de codificación de frontera (Claude Code, Cursor, Windsurf, Codex, entre otros) y los flujos de salida del entorno, reduciendo el consumo de tokens de contexto entre un 75 % y un 99 % según el autor, sin perder información crítica para la depuración. La arquitectura subyacente es la del transformer decoder-only de Qwen2.5-Coder-3B, con 3.085.938.688 parámetros totales y una ventana de contexto de entrenamiento de 3072 tokens para la tarea de compresión.

Su relevancia actual reside en la economía de contexto de los agentes autónomos: al filtrar y estructurar la salida del entorno antes de que llegue al modelo principal, reduce coste, latencia y riesgo de desbordamiento de ventana. La licencia MIT y la disponibilidad en formato GGUF para Ollama facilitan su integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-3B-Instruct) con adaptador LoRA |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 3072 tokens en la tarea de compresion (contexto nativo del modelo base no indicado en la informacion) |
| Tipos de cuantizacion | GGUF (incluido en el repo); cuantizaciones especificas no disponibles |
| Idiomas soportados | en, pt |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA), GGUF |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-Coder-3B-Instruct`, un transformer decoder-only de 3.085.938.688 parámetros, y se ajusta mediante LoRA (PEFT) sobre un conjunto de datos contrastivo curado por un modelo profesor, con verificación determinista de fundamentación (grounding) al 100 %. El entrenamiento se orienta a una única tarea: transformar entradas ruidosas en YAML causal conforme a un esquema estricto, condicionado por un campo `<intent>` y un `<gc_mode>` (por ejemplo, `TOOL_OUTPUT`).

La información disponible menciona tres iteraciones de contexto (1280, 2048 y 3072 tokens) y una suite de evaluación estratificada multilingüe (Python, TypeScript, Rust, Go, C++, Kotlin, C#, Terraform, Kubernetes) más un conjunto OOD no visto (PHP/Laravel, Ruby/Rails, Elixir/Phoenix, Swift/Xcode). No se detallan en la información proporcionada el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Compresión de contexto: convierte logs de tests, trazas de compilación y salidas de terminal en YAML causal estructurado.
- Filtrado por intención: condiciona la salida al campo `<intent>` del prompt, preservando solo lo relevante.
- Preservación de trazas exactas: mantiene rutas de archivo, números de línea, nombres de símbolos y mensajes de error ligados a la intención.
- Clasificación de estado: distingue PASS/FAIL y omite `causal_trace` y `exact_snippets` cuando no hay errores.
- Inspección de archivos fuente: modo `slice` para localizar definiciones en archivos de más de 5k líneas con precisión de línea 1-based.
- Búsqueda en repositorio filtrada por intención.
- Memoria episódica: registro de callejones sin salida (`dead-end`) y compactación de memoria de sesión.
- Salida YAML pura sin fences de Markdown ni explicaciones (100 % en la evaluación final reportada).
- Multilingüe en la práctica de código: evaluación en Python, TypeScript, Rust, Go, C++, Kotlin, C#, Terraform, Kubernetes y OOD en PHP, Ruby, Elixir y Swift.
- Idiomas declarados: inglés y portugués.
- No se documenta soporte de tool calling, function calling, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Reducción de contexto en agentes de codificación: interponer Ordo 3B entre el agente (Cursor, Windsurf, Claude Code) y la salida del terminal para que el agente reciba un YAML compacto en lugar de miles de líneas de log, reduciendo el coste por turno y evitando el desbordamiento de ventana.
- Depuración de suites de tests: ejecutar `ordo run -i "..." pytest -v` para obtener la cadena causal del fallo (archivo, línea, excepción) en lugar de la salida completa de pytest, lo que acelera la localización del error en pipelines de CI.
- Inspección de archivos monolíticos: usar `ordo slice` para localizar la definición de una función en un archivo de más de 5k líneas con precisión de línea, evitando cargar el archivo entero en el contexto del agente.
- Búsqueda en repositorio con filtro semántico: `ordo search` para encontrar llamadores de una función concreta y devolver solo los resultados relevantes a la intención, útil en refactorizaciones.
- Memoria episódica de sesiones de depuración: registrar callejones sin salida con `ordo dead-end` para que el agente no repita intentos fallidos en sesiones largas, y compactar la memoria activa con `ordo compact`.
- Preprocesado en pipelines de agentes propios: integrar el adaptador vía Transformers/PEFT en un orquestador interno para normalizar salidas de herramientas heterogéneas (build, linters, tests) antes de pasarlas al modelo principal.
- Despliegue local en estaciones de desarrollo: ejecutar la versión GGUF con Ollama (`ollama run hf.co/devlucascfarias/ordo-3b`) para filtrar contexto sin enviar logs a la nube.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (no verificados de forma independiente):

| Metrica | Base Qwen2.5-Coder-3B (zero-shot) | Ordo v0.1 (1280 ctx) | Ordo v1.0 (2048 ctx) | Ordo Final (3072 ctx) | OOD no visto (PHP, Ruby, Elixir, Swift) |
|---|---|---|---|---|---|
| Tasa de YAML puro (sin Markdown) | 0,0 % | 86,7 % | 80,0 % | 100,0 % (30/30) | 100,0 % (con auto-reparacion) |
| Adherencia estricta al esquema | 0,0 % | 63,3 % | 80,0 % | 100,0 % (30/30) | 100,0 % (con auto-reparacion) |
| Precision de clasificacion de estado | 26,7 % | 90,0 % | 80,0 % | 100,0 % (30/30) | 100,0 % |
| Recall exacto de rutas de archivo | 35,0 % | 83,3 % | 100,0 % | 98,3 % | 80,0 % |
| Recall exacto de numeros de linea | 31,7 % | 70,0 % | 100,0 % | 98,3 % | 80,0 % |
| Tasa de fundamentacion sin alucinacion | 50,0 % | no disponible (dato truncado en la informacion) | no disponible | no disponible | no disponible |

No se han publicado en la informacion disponible resultados de benchmarks estandar de propósito general (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada: el modelo base en bfloat16 ocupa aproximadamente 6,2 GB de pesos; con overhead de activaciones y KV cache, se recomienda al menos 8 GB de VRAM en fp16/bf16.
- Cuantizacion GGUF: la versión cuantizada incluida en el repo (tamaño total del repo 6,3 GB, que incluye adaptador y GGUF) permite ejecución en GPU de consumo con 4-6 GB de VRAM según el nivel de cuantización.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para mayor throughput; A100/H100 para despliegues por lotes.
- Cabe en GPU de consumo: sí, en RTX 3060/4060/4090 con cuantización GGUF o en bf16 con 8 GB o más.
- Opciones de despliegue: Ollama (soporte nativo vía `hf.co/devlucascfarias/ordo-3b` y `Modelfile`), Transformers + PEFT, llama.cpp mediante GGUF. No se documenta soporte explícito para vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ordo 3B | 3.085.938.688 | 3072 (tarea de compresion) | Filtrado y compresion de contexto para agentes | MIT | Hugging Face (safetensors + GGUF), Ollama |
| Qwen2.5-Coder-3B-Instruct (base) | 3.085.938.688 | Contexto nativo de Qwen2.5 (no indicado en la informacion) | Generacion de codigo e instrucciones generales | Apache 2.0 (segun modelo base; no confirmado en la informacion) | Hugging Face |
| Modelos especializados en compresion de contexto para agentes | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de comparativas con alternativas equivalentes de compresion de contexto; la comparacion mas directa es con su modelo base, sobre el que Ordo 3B mejora en adherencia a esquema y recall de rutas y lineas a costa de especializarse en una unica tarea.

## Limitaciones y advertencias

- Modelo de tarea única: no es adecuado para generación de código general, razonamiento abierto ni conversación; su uso previsto es la compresión de contexto condicionada por intención.
- Riesgo de alucinación: aunque el autor reporta fundamentación determinista en entrenamiento, cualquier traza no presente en la entrada puede inducir errores; el propio prompt del sistema exige no inventar soluciones.
- Dependencia del formato: requiere respetar el esquema de prompt (`<gc_mode>`, `<intent>`, `<raw_input>`) y el esquema YAML de salida; desviaciones degradan el rendimiento.
- Cobertura idiomática limitada: solo inglés y portugués declarados; el resto de idiomas no está garantizado.
- Contexto de entrenamiento corto (3072 tokens): entradas más largas deben trocearse.
- Datos de benchmark no verificados de forma independiente y con la fila de fundamentación truncada en la información disponible.
- Licencia MIT: permite uso comercial, pero el modelo base Qwen2.5-Coder-3B-Instruct tiene su propia licencia que debe revisarse por separado.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/devlucascfarias/ordo-3b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Repositorio CLI: https://github.com/devlucascfarias/ordo
- Ollama: `ollama run hf.co/devlucascfarias/ordo-3b`
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
