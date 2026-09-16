# islamsidratul/Qwen3.8-27B-ByteShape-IQ4_XS-ASCII-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF del modelo Qwen3.8-27B (26.101.646.336 parámetros) publicada por el usuario islamsidratul. Se trata de una derivación en dos pasos: primero ByteShape aplicó su cuantización ShapeLearn por tensor en formato IQ4_XS a 3,84 bits por peso, y después se podó el vocabulario original de 248.320 tokens hasta 129.272 tokens, conservando únicamente caracteres ASCII más el conjunto de símbolos matemáticos y tipográficos definido por la política P1M de la herramienta ASCII-Condensed-prune-tools. El resultado es un único archivo de 12,25 GB (frente a los 13,08 GB de la fuente).

La relevancia de esta ficha es acotada pero clara: demuestra que es posible reducir el vocabulario de un modelo de 27B en casi un 48 % y recortar el archivo en unos 830 MB sin degradar de forma apreciable la perplejidad sobre texto ASCII. La contrapartida es que el modelo deja de funcionar con cualquier escritura no latina o con Latin acentuado, porque los fragmentos UTF-8 fuera del conjunto conservado caen al fallback de un token por byte. Está pensado, por tanto, para flujos de trabajo exclusivamente en inglés y código.

La arquitectura subyacente es la del modelo base Qwen3.8-27B, identificada en los metadatos GGUF como `qwen35` (híbrido de Gated DeltaNet con atención), con 65 bloques y la cabeza MTP conservada. La licencia es Apache-2.0 y el repo no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen35` (híbrido Gated DeltaNet + atención), 65 bloques, cabeza MTP conservada |
| Parámetros totales | 26.101.646.336 (26,1B) |
| Longitud de contexto | No disponible en la información proporcionada; el autor valida configuraciones de 96k, 128k y 160k tokens |
| Tipos de cuantización | IQ4_XS-3.84bpw (ShapeLearn por tensor); `token_embd.weight` en IQ4_XS; `output.weight` en Q6_K; caché KV probada en q4_0 y f16 |
| Idiomas soportados | Inglés (`en` según la model card); el autor indica "English and code only" |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `Qwen3.8-27B-ByteShape-IQ4_XS-3.84bpw-ASCII-P1M.gguf`, 12,25 GB) |
| Vocabulario | 129.272 tokens (fuente: 248.320) |
| sha256 | `d533c568ba028fb7bc24d646d9f0259341a388fb2535e559fd0bc62275a55a4d` |
| Modelos base | `byteshape/Qwen3.8-27B-GGUF`, `Qwen/Qwen3.8-27B` |

## Arquitectura y entrenamiento

El modelo no introduce ningún entrenamiento nuevo: es una cuantización con poda de vocabulario sobre Qwen3.8-27B. La arquitectura es la del base, etiquetada como `qwen35` en los metadatos, descrita como híbrida de Gated DeltaNet y atención sobre 65 bloques, con la cabeza de predicción multi-token (MTP) intacta en el archivo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La innovación técnica de esta ficha está en el proceso de poda, no en el entrenamiento. Solo se modificaron dos tensores: `token_embd.weight` (que pasó de 0,675 GB a 0,352 GB) y `output.weight` (de 1,043 GB a 0,543 GB). Las filas se recolectan en espacio cuantizado, sin descomprimir ni recomprimir, de modo que cada fila conservada es idéntica bit a bit a la de la fuente. Los arrays del tokenizador y los merges se reescribieron y los identificadores de tokens especiales se remapearon. Se conservan los 256 tokens de fallback por byte, todos los especiales y todos los fragmentos UTF-8 parciales, de forma que cualquier texto sigue siendo tokenizable aunque el modelo no sepa interpretarlo. La verificación con `verify_prune.py --policy P1M` confirmó que los 864 tensores no pertenecientes al vocabulario son idénticos a los de la fuente, que las filas muestreadas coinciden con sus originales y que los metadatos se preservaron.

## Capacidades

- Generación de texto conversacional en inglés.
- Generación y razonamiento sobre código: la evaluación agéntica de 10 tareas ejecutables obtuvo 8/10 con modo thinking activado.
- Razonamiento multi-paso con modo thinking (la evaluación se ejecutó con `temp 1.0`, `top_p 0.95`, `top_k 20`).
- Tool calling y function calling, con una plantilla de chat parcheada.
- Mensajes de sistema en medio de la conversación, también tras parchear la plantilla (la plantilla estándar de Qwen3.8 lanza `System message must be at the beginning.`).
- Decodificación especulativa mediante la cabeza MTP conservada (`--spec-type draft-mtp --spec-draft-n-max 2`).
- Tokenización de cualquier texto, incluido no ASCII, mediante los tokens de fallback por byte (aunque la comprensión de esos textos es deficiente).
- Capacidades multilingües: no, el vocabulario podado elimina los caracteres no ASCII, por lo que el modelo queda restringido a inglés y código en la práctica.

## Casos de uso

- Asistente de código en local: con 12,25 GB de archivo y unos 14,4 GB de VRAM a 128k de contexto, se puede ejecutar en una GPU de consumo de 16 GB sin enviar código a la nube, lo que encaja en entornos con requisitos de confidencialidad.
- Generación de código en producción: el soporte de tool calling con plantilla parcheada permite integrarlo en pipelines que invocan herramientas externas (ejecutar tests, consultar un repositorio, lanzar un linter) desde el propio modelo.
- Agentes de codificación tipo Claude Code: el autor documenta explícitamente el parche necesario para aceptar mensajes de sistema a mitad de conversación, que es el patrón que usan estos agentes; la evaluación agéntica de 10 tareas dio 8/10.
- Análisis de documentos técnicos largos en inglés: con 128k de contexto y 14.391 MiB de VRAM cabe un corpus extenso de documentación, código o especificaciones en un solo prompt.
- Procesamiento de logs y texto plano: al estar el vocabulario limitado a ASCII, los ficheros de log, trazas y salidas de consola se tokenizan de forma eficiente y sin pérdida apreciable de perplejidad (1,6488 frente a 1,6490 del modelo fuente en líneas solo ASCII).
- Extracción de datos estructurados en inglés: combinando tool calling y modo thinking se pueden definir esquemas de salida y validar la respuesta con una herramienta externa.
- Atención al cliente automatizada en inglés: conversaciones multi-turno con contexto largo, siempre que el tráfico esté íntegramente en inglés; no es apto para clientes que escriban en otros alfabetos o con acentos.
- Despliegue en estaciones de trabajo individuales: al ser un único archivo GGUF servido con llama.cpp, un desarrollador puede levantar el endpoint en su propia máquina sin infraestructura adicional.

## Benchmarks y rendimiento

Perplejidad medida por el autor con contexto 4096, 30 chunks y caché KV en f16, en una RTX 5060 Ti de 16 GB con llama.cpp v0.4.1. Valores más bajos son mejores y son deterministas, por lo que son comparables entre filas.

| Modelo | Código (proyecto mixto TS/JS) | Código, solo líneas ASCII | wikitext-2 |
|---|---|---|---|
| ByteShape IQ4_XS-3.84bpw (fuente) | 1,6671 | 1,6490 | 5,9480 |
| Este archivo | 1,7156 | 1,6488 | 5,9612 |
| Unsloth UD-IQ4_XS (referencia) | 1,6583 | — | 5,8322 |

El autor atribuye el incremento del 2,9 % en el corpus mixto de código al 1,27 % de caracteres no ASCII que contiene, mayoritariamente literales de cadena en bengalí. Sobre texto exclusivamente ASCII la poda no supone coste medible.

Evaluación agéntica de código: 10 tareas ejecutables, modo thinking activado, `temp 1.0` / `top_p 0.95` / `top_k 20`, resultado 8/10 con 18.381 tokens en total. El autor señala que uno de los dos fallos es un artefacto de la evaluación, porque la respuesta terminaba con un bloque de código de ejemplo que el evaluador tomó por la solución.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM medida con todo el modelo en GPU, caché KV en q4_0, `-ub 512` y MTP desactivado, sobre RTX 5060 Ti de 16 GB: 13.952 MiB a 96k de contexto, 14.391 MiB a 128k y 14.873 MiB a 160k.
- Tamaño del archivo: 12,25 GB, lo que deja margen escaso en tarjetas de 16 GB; el autor indica que 128k de contexto cabe con un escritorio ligero y que 160k exige un escritorio prácticamente inactivo.
- Cabe en GPU de consumo: sí, verificado en RTX 5060 Ti de 16 GB. No hay datos publicados para otras GPU.
- GPU recomendadas: la única verificada en la información disponible es la RTX 5060 Ti de 16 GB. Para configuraciones más holgadas no hay mediciones publicadas.
- Despliegue: llama.cpp, invocado como `llama-server` en el ejemplo del autor. No hay datos sobre compatibilidad verificada con Ollama, LM Studio, vLLM o TGI.
- Throughput medido (RTX 5060 Ti 16 GB, llama.cpp v0.4.1): prefill de 939 t/s a 96k y 128k, 895 t/s a 160k; decode de 28,7 t/s a 96k, 28,8 t/s a 128k y 27,7 t/s a 160k.
- Comando de referencia del autor: `llama-server -m Qwen3.8-27B-ByteShape-IQ4_XS-3.84bpw-ASCII-P1M.gguf -c 131072 -ngl 99 -fa on --cache-type-k q4_0 --cache-type-v q4_0 --jinja --temp 1.0 --top-p 0.95 --top-k 20 --min-p 0.0`.

## Comparativa con modelos similares

| Modelo | Cuantización | Tamaño | Vocabulario | PPL código mixto | PPL wikitext-2 | Licencia |
|---|---|---|---|---|---|---|
| Este archivo | IQ4_XS-3.84bpw + poda ASCII P1M | 12,25 GB | 129.272 | 1,7156 | 5,9612 | Apache-2.0 |
| ByteShape Qwen3.8-27B-GGUF | IQ4_XS-3.84bpw (ShapeLearn) | 13,08 GB | 248.320 | 1,6671 | 5,9480 | Apache-2.0 |
| Unsloth UD-IQ4_XS | IQ4_XS (dynamic) | No disponible | No disponible | 1,6583 | 5,8322 | No disponible en la información proporcionada |

Frente a la fuente de ByteShape, este archivo ahorra 0,83 GB y sacrifica 0,0485 puntos de perplejidad en código mixto y 0,0132 en wikitext-2, con impacto nulo en texto solo ASCII. La referencia de Unsloth obtiene mejor perplejidad en ambas columnas publicadas, aunque se desconoce su tamaño de archivo y su vocabulario en la información disponible.

## Limitaciones y advertencias

- El texto no latino se rompe: las escrituras fuera de ASCII y del conjunto de símbolos P1M (bengalí, CJK, árabe, cirílico, etc.) caen a un token por byte UTF-8 y el modelo las interpreta como texto corrupto. El autor documenta que una petición en bengalí recibió una respuesta romanizada indicando que la entrada parecía ilegible, mientras que el modelo con vocabulario completo la responde correctamente.
- El Latin acentuado (é, ü, ñ) tampoco está en P1M, por lo que también degrada. Esto incluye el castellano y buena parte de las lenguas europeas.
- Para uso multilingüe el autor recomienda explícitamente tomar el archivo fuente de ByteShape en lugar de esta variante.
- La plantilla de chat estándar de Qwen3.8 falla con mensajes de sistema a mitad de conversación; es necesario parchearla para usar agentes tipo Claude Code. Hasta que se aplique el parche, esos flujos quedan bloqueados.
- Los agentes que dependan de la plantilla sin parchear lanzarán el error `System message must be at the beginning.`.
- Todas las mediciones proceden de una única máquina (RTX 5060 Ti 16 GB con llama.cpp v0.4.1); el propio autor lo advierte. No hay validación independiente.
- No hay resultados publicados de benchmarks estándar de razonamiento, matemáticas o código más allá de la perplejidad y la evaluación agéntica descrita.
- El repositorio no está afiliado a ByteShape ni al equipo de Qwen.
- La licencia declarada es Apache-2.0, heredada del modelo base, por lo que en principio permite uso comercial; conviene verificar las condiciones del modelo original `Qwen/Qwen3.8-27B` antes de desplegarlo en producción.
- El repo registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/islamsidratul/Qwen3.8-27B-ByteShape-IQ4_XS-ASCII-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización fuente de ByteShape: https://huggingface.co/byteshape/Qwen3.8-27B-GGUF
- Herramienta de poda de vocabulario: https://github.com/bsaleh03/ASCII-Condensed-prune-tools
