# devlucascfarias/ordo-3b

## Resumen

Ordo 3B es un ajuste fino mediante LoRA de `Qwen/Qwen2.5-Coder-3B-Instruct` desarrollado por BaruchLabs (autor `devlucascfarias`). No es un modelo de propósito general: está especializado como filtro de contexto condicionado por intención para agentes de programación. Se sitúa entre el agente (Claude Code, Codex, Cursor, OpenCode y similares) y la salida ruidosa que este leería completa, condensando logs de tests, builds y linters, ficheros fuente grandes y sesiones largas de depuración en un YAML causal corto.

El modelo recibe una pregunta del agente en la etiqueta `<intent>` y devuelve un resumen estructurado con estado, fichero y línea del fallo, símbolo, mensaje de error y el fragmento de código relevante. La versión 2 se ha reentrenado sobre logs de herramientas y ficheros fuente reales de proyectos open source, con comprobaciones deterministas de anclaje (grounding) sobre cada cita.

Con 3.085.938.688 parámetros (~3B), licencia MIT e idiomas inglés y portugués, su interés principal es práctico: reduce el consumo de tokens de agentes de código y permite ejecución local (1,9 GB en Q4_K_M), lo que evita que logs y código privado salgan de la máquina. Se distribuye como adaptador PEFT y también en formato GGUF para Ollama y llama.cpp.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-Coder-3B-Instruct) con adaptador LoRA/PEFT |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (1,9 GB, recomendada), Q8_0; GGUF para Ollama y llama.cpp |
| Idiomas soportados | en, pt |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), GGUF |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-Coder-3B-Instruct`, un transformer decoder-only de aproximadamente 3B parámetros, sobre el que se aplica un ajuste fino mediante LoRA (librería PEFT). El resultado se publica como adaptador, no como pesos fusionados, y se ofrece también en GGUF para inferencia local. No se detalla en la información disponible la composición exacta del dataset, el número de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO.

La innovación principal no está en la arquitectura sino en la tarea: el modelo está condicionado por una etiqueta `<intent>` y produce una salida YAML estricta con un esquema dependiente de `<gc_mode>` (por ejemplo, `TOOL_OUTPUT`). Las reglas del sistema exigen preservar el 100 % de rutas de fichero, números de línea, nombres de símbolos y mensajes de error ligados a la intención, y omitir `causal_trace` y `exact_snippets` cuando el estado es `PASS` sin errores. La versión 2 incorpora comprobaciones deterministas de anclaje sobre cada objetivo y se entrenó con logs reales de herramientas y ficheros de proyectos open source.

## Capacidades

- Condensación de salidas de tests (pytest, jest, go test, cargo test) en un YAML causal con fichero, línea y aserción fallida.
- Filtrado de salidas de builds y linters (tsc, eslint, mypy, maven, dotnet) para aislar el error real entre warnings.
- Compresión de logs de CI fallidos para obtener la causa en lugar del volcado completo.
- Extracción de símbolos con rangos de línea exactos a partir de ficheros fuente grandes (`ordo slice`).
- Búsqueda filtrada por intención sobre el código (`ordo search`).
- Memoria episódica por proyecto: notas y callejones sin salida persisten para que un agente que retoma trabajo no repita lo que ya falló.
- Salida estructurada en YAML sin fences de Markdown, saludos ni explicaciones, pensada para consumo directo por agentes.
- Soporte de tool calling y agentes a través del servidor MCP (`ordo mcp`) y de la CLI `ordo`.
- Capacidades multilingües limitadas a inglés y portugués.

## Casos de uso

- Depuración con salidas de test largas: en suites grandes donde un fallo queda enterrado entre cientos de tests correctos y warnings, el modelo devuelve el fichero, la línea y la aserción en unos cientos de tokens, reduciendo el contexto que el agente debe procesar.
- Builds y linters con muchos mensajes: se pasa la salida de tsc, eslint, mypy, maven o dotnet y el modelo aísla el error real frente al ruido de advertencias.
- Diagnóstico de CI: `ordo filter` sobre un log de CI fallido devuelve la causa en lugar de obligar a recorrer el log completo manualmente.
- Navegación de ficheros fuente grandes: `ordo slice` devuelve el símbolo solicitado con rangos de línea exactos en lugar del fichero entero, útil para agentes con ventanas de contexto ajustadas.
- Agentes locales o con presupuesto de tokens limitado: al reducir cada salida a unos cientos de tokens, permite que agentes sobre modelos locales mantengan sesiones más largas sin agotar el contexto.
- Código privado: al ejecutarse íntegramente en local vía Ollama o llama.cpp, logs y código no abandonan la máquina, lo que encaja en entornos con requisitos de confidencialidad.
- Continuidad de sesiones largas: la memoria episódica por proyecto evita que un agente que retoma trabajo reintente enfoques que ya fallaron.

## Benchmarks y rendimiento

| Metrica | Resultado (Q4_K_M, 1,9 GB) |
|---|---|
| Acierto de estado (status) | 96 % |
| Acierto de fichero fallido | 83 % |
| Citas encontradas en la entrada | 96 % |

Datos sobre un benchmark de 114 casos construido a partir de ejecuciones reales de herramientas. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,9 GB en Q4_K_M; mayor en Q8_0 (cercana a los ~3 GB de pesos sin cuantizar más overhead).
- Cabe en GPU de consumo: cualquier GPU con 4 GB o más de VRAM puede ejecutar la cuantización Q4_K_M.
- GPU recomendadas: no se especifican modelos concretos; el autor advierte que en una GPU modesta cada llamada condensada tarda varios segundos, y solo en CPU aún más.
- Despliegue: Ollama (`ollama pull hf.co/devlucascfarias/ordo-3b`), llama.cpp, LM Studio, y la CLI/MCP `ordo` (`pip install "ordo-harness[mcp]"`).
- Latencia y throughput: no disponibles como cifras; el autor solo indica latencia de varios segundos por llamada en GPU modesta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ordo 3B | ~3B (LoRA sobre Qwen2.5-Coder-3B-Instruct) | no disponible | Filtro de contexto para agentes de código | MIT | HF, GGUF, Ollama |
| Qwen2.5-Coder-3B-Instruct | ~3B | no disponible en esta ficha | Generación de código general | no disponible en esta ficha | HF |
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento de los modelos comparables para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Salidas cortas (menos de ~40 líneas) se devuelven sin cambios: no hay nada que comprimir.
- No sirve para escribir código desde cero; las tareas que ejecutan pocos comandos no generan material que filtrar.
- Los agentes que ya recortan la salida de comandos obtienen ganancias menores; en ese caso Ordo aporta sobre todo precisión (la causa, no solo la cola del log).
- En hardware modesto cada llamada condensada tarda varios segundos; solo en CPU, más.
- Riesgo de alucinación mitigado pero no eliminado: las reglas prohíben inventar soluciones y la CLI verifica cada cita contra la entrada, con retroceso a la salida original cuando es necesario.
- Idiomas limitados a inglés y portugués; el resto de idiomas no están cubiertos explícitamente.
- Licencia MIT, que permite uso comercial sin restricciones adicionales conocidas.
- No se detallan sesgos conocidos ni la composición del dataset de entrenamiento en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/devlucascfarias/ordo-3b
- Repositorio CLI y servidor MCP: https://github.com/devlucascfarias/ordo
- BaruchLabs: https://baruchlabs.com/
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
