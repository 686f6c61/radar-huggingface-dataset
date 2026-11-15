# greg1506/qwen3-1p7b-coffee-router-v5-GGUF

## Resumen

`qwen3-1p7b-coffee-router-v5-GGUF` es un modelo derivado por ajuste fino supervisado (SFT) a partir de Qwen/Qwen3-1.7B, publicado por el usuario greg1506 en Hugging Face. No es un modelo de propósito general: es un enrutador especializado para un asistente de café offline. Su función es leer una pregunta sobre café y emitir un único objeto JSON que identifique una calculadora o una consulta a tabla, solicite un argumento faltante o derive la pregunta al camino de respuesta en prosa. El modelo no realiza aritmética ni redacta ensayos: esa responsabilidad recae en el wrapper que lo acompaña.

El repositorio incluye el conjunto completo de despliegue: dos cuantizaciones GGUF (Q5_K_M y Q4_K_M), una gramática GBNF para decodificación restringida en llama.cpp, un wrapper de referencia (`toolcall_dispatch.py`) que valida argumentos y ejecuta las ocho herramientas, y un script de autodiagnóstico (`verify.py`). La arquitectura subyacente es un transformer denso de 1.720.574.976 parámetros, con licencia Apache 2.0 y formato de pesos GGUF para llama.cpp.

La relevancia de esta ficha radica en que ilustra un patrón de diseño muy concreto: separar el enrutamiento (modelo pequeño con gramática) del cálculo (wrapper determinista) para obtener un sistema con alta fiabilidad en tareas acotadas. El autor reporta un "system EM" de 0.935 en Q5_K_M y 0.940 en Q4_K_M sobre un banco sintético de 336 ítems (CoffeeBench), con aritmética resuelta íntegramente por el wrapper (249/249).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `-c 2048`) |
| Tipos de cuantizacion | Q5_K_M (1.26 GB), Q4_K_M (1.11 GB); referencia bf16 en HF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en HF se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer denso de 1.7B parámetros, y se ajusta mediante SFT para una tarea de enrutamiento con contrato JSON fijo. El entrenamiento se apoya en una gramática GBNF que restringe la decodificación del turno de enrutamiento, de modo que la salida siempre es un JSON válido conforme al esquema de herramientas. El autor indica que v5 añade 601 filas de "answer-path" (FAQ del producto reformuladas y QA destilado de tier abierto) a la misma receta de enrutamiento de v3, manteniendo base, semilla, learning rate y rango. No se especifican el número total de tokens de entrenamiento ni la composición completa del dataset más allá de estas indicaciones.

La innovación técnica destacable no está en la arquitectura, sino en el diseño del sistema: el modelo emite argumentos, no respuestas; la aritmética la ejecuta el wrapper (`toolcall_dispatch.py`), que valida los argumentos antes de invocar las ocho herramientas. La gramática se adjunta por petición (no con `--grammar-file`, que afectaría también al turno de prosa). El autor reporta que 249 de los 336 ítems del bench son aritméticos y el modelo los enruta todos (`pre_routed = 0`), mientras que los 87 restantes se responden por el camino de prosa, que acierta 66/87. No se menciona RLHF ni DPO.

## Capacidades

- Enrutamiento a herramientas: emite un objeto JSON que nombra una calculadora o una consulta a tabla entre ocho herramientas disponibles.
- Solicitud de argumentos faltantes: cuando falta un dato, emite una petición de argumento en lugar de inventarlo (con un fallo conocido en el caso `tc-10`).
- Derivación a respuesta en prosa: las preguntas de conocimiento se responden por el camino de prosa del mismo modelo.
- Decodificación restringida por gramática GBNF: garantiza JSON válido en el turno de enrutamiento (valid JSON 1.000 en el eval de 30 casos).
- Tool calling / function calling: soportado mediante el contrato JSON y el wrapper de validación.
- Uso offline: todo el conjunto (GGUF, gramática, wrapper y verificación) funciona con llama.cpp y solo biblioteca estándar de Python.
- No realiza aritmética: por diseño, el cálculo lo hace el wrapper.
- No soporta visión, audio ni modo thinking (se usa `enable_thinking=False`).

## Casos de uso

- Asistente de café offline en dispositivos locales: el modelo enruta preguntas del usuario a calculadoras (por ejemplo, ratios de extracción) o a tablas de métodos de preparación, con la gramática garantizando JSON válido y el wrapper ejecutando los cálculos. Adecuado por su tamaño (1.1–1.3 GB en GGUF) y su funcionamiento sin red.
- Despliegue en CPU sin GPU: el autor reporta un turno de enrutamiento de 0.34 s en su referencia de CPU con `cache_prompt: true`, lo que permite integrarlo en un servicio ligero de bajo coste.
- Enrutamiento determinista en pipelines de agentes: el contrato JSON y la validación de argumentos permiten encadenar el router con herramientas externas sin parseo frágil; útil cuando se necesita fiabilidad sobre creatividad.
- Sustitución de v3 sin cambios de integración: el autor indica que el wrapper y la gramática son idénticos a v3, por lo que basta con cambiar el GGUF en instalaciones existentes.
- Autodiagnóstico de instalaciones: `verify.py` ejecuta cinco casos con PASS/FAIL usando solo la biblioteca estándar, útil para validar despliegues antes de producción.
- Prototipado de asistentes de dominio acotado: sirve como plantilla para adaptar el patrón (router + gramática + wrapper) a otros dominios verticales con hechos authored y cálculos deterministas.
- Evaluación de cuantizaciones en tareas de enrutamiento: el repo ofrece dos cuants con hashes SHA-256 y métricas comparables, útil para estudiar el impacto de la cuantización en routing y prosa.

## Benchmarks y rendimiento

Datos reportados por el autor sobre CoffeeBench (336 ítems sintéticos: aritmética, definiciones, mapas de método de preparación y de tueste/procesado). "System EM" significa que la pregunta pasa por router → argumentos validados → herramienta/tabla.

| Build | System EM (336) | Aritmética | Eval de routing 30 casos (cold / cached) |
|---|---|---|---|
| HF bf16 (referencia) | 0.938 | 249/249 | 0.967 / — |
| Q5_K_M | 0.935 | 249/249 | 0.967 / 0.967 |
| Q4_K_M | 0.940 | 249/249 | — / 0.967 |

En el eval de 30 casos de routing en lenguaje natural: JSON válido 1.000, acción 1.000, herramienta 1.000, argumentos 1.000 en todas las builds. El único fallo es `tc-10` ("How much dissolved solids is in my cup?"), donde el modelo pide `tds_pct` pero no `beverage_g`; el autor lo describe como 29/30 con un parcial conocido. Los 21 fallos restantes son ítems de conocimiento del camino de prosa (method-map 6, processing-map 4, species-origin 3, milk-drinks 3, definition 3, más calculation/legacy-core 2). Comparación v3 vs v5: system EM 0.890 bf16 → 0.938 bf16; answer path 50/87 → 66/87; product slice 42/68 → 51/68.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q5_K_M ocupa 1.26 GB y Q4_K_M 1.11 GB en disco; la VRAM necesaria para cargar los pesos es del mismo orden, más la KV cache (contexto de ejemplo de 2048 tokens).
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer con al menos ~2–3 GB libres debería poder cargar los pesos con `-ngl 99`.
- Cabe en GPU consumer: sí, por el tamaño de los cuants (1.1–1.3 GB), aunque el autor no publica una lista de GPUs validadas.
- Opciones de despliegue: llama.cpp (`llama-server`), con gramática adjunta por petición; el repo está etiquetado como `endpoints_compatible`. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: turno de enrutamiento de 0.34 s en la referencia de CPU del autor con `cache_prompt: true`; sin reutilización de KV, 5.4 s en local y ~10 s estimados en el texto truncado de la model card. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-1p7b-coffee-router-v5-GGUF | 1.72B | no disponible | Router especializado + gramática + wrapper | Apache 2.0 | GGUF en HF, llama.cpp |
| Qwen/Qwen3-1.7B (base) | 1.72B | no disponible | LLM generalista | Apache 2.0 | safetensors en HF |
| qwen3-1p7b-coffee-router-v3-GGUF (predecesor) | 1.72B | no disponible | Router especializado (sin knowledge replay) | Apache 2.0 | GGUF en HF |

No se dispone de datos de benchmarks de Qwen3-1.7B base ni de v3 en la información proporcionada para una comparación numérica directa más allá de las cifras v3 vs v5 ya citadas.

## Limitaciones y advertencias

- Dominio muy acotado: el modelo está entrenado para café y su contrato de herramientas; no es un LLM generalista.
- Aritmética deliberadamente mala: el autor lo declara explícitamente; sin el wrapper, los cálculos no son fiables.
- Fallo conocido de enrutamiento: `tc-10` pide `tds_pct` pero no `beverage_g`; debe tratarse como 29/30 con un parcial, no como 1.000.
- Retención vs generalización: el autor advierte que las mejoras de v5 son retención y transferencia de fraseo sobre la misma base de hechos authored, no generalización a hechos no vistos.
- Riesgo de alucinación en el camino de prosa: 21 fallos de conocimiento en CoffeeBench; el modelo puede responder de forma incorrecta en preguntas fuera de la base enseñada.
- Uso incorrecto de la gramática: pasar `--grammar-file` a `llama-server` forzaría JSON también en el turno de prosa; el autor insiste en adjuntarla por petición.
- Idiomas soportados no disponibles: la model card no especifica cobertura lingüística.
- Contexto no especificado: el ejemplo usa 2048 tokens; no se documenta el máximo soportado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento fuera del banco sintético reportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/greg1506/qwen3-1p7b-coffee-router-v5-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Predecesor v3: https://huggingface.co/greg1506/qwen3-1p7b-coffee-router-v3-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Repositorio del autor: no disponible
