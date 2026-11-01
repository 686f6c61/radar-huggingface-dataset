# jonpark0/SmolLM2-135M-Instruct-isa-lm

## Resumen

SmolLM2-135M-Instruct-isa-lm es una conversión cuantizada del modelo SmolLM2-135M-Instruct de HuggingFaceTB, publicada por jonpark0 para el runtime isa-lm. No se trata de un modelo nuevo ni de un reentrenamiento: son los mismos pesos del modelo base convertidos a formatos INT4 (Q4_0) e INT8 (Q8_0) propietarios del runtime isa-lm, un motor de inferencia en C11 sin dependencias que ejecuta modelos de lenguaje en CPU sin GPU. El objetivo es permitir la ejecución de un modelo de 135 millones de parámetros en hardware x86-64 (desde SSE2 hasta AVX-512 VNNI) y ARM (desde ARMv7 NEON hasta i8mm y SVE).

El modelo base, SmolLM2-135M-Instruct, es un transformer decoder-only de 135 millones de parámetros con 4096 posiciones de contexto, orientado a generación de texto y conversación ligera. Esta conversión mantiene esa ventana de contexto y añade dos artefactos: un fichero de pesos `.mlb` (72 MiB en Q4_0, 136 MiB en Q8_0) y un tokenizador `.mlt` de 1138 KiB. La relevancia actual reside en la posibilidad de desplegar un chatbot funcional en entornos sin acelerador, con huella de disco mínima y latencias de decodificación de cientos de tokens por segundo en CPU de servidor.

La licencia Apache 2.0 del modelo original se mantiene, lo que facilita el uso comercial. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 1 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base SmolLM2-135M-Instruct) |
| Parametros totales | 135 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 posiciones |
| Tipos de cuantizacion | Q4_0 (4,5 bits/peso con escalas f16 por bloque de 32) y Q8_0 (8,5 bits/peso con escalas f16 por bloque de 32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlb` (formato propietario de isa-lm); tokenizador en `.mlt` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base SmolLM2-135M-Instruct: un transformer decoder-only de 135 millones de parámetros. Esta publicación no aporta información sobre el entrenamiento original (número de tokens, composición del dataset, si hubo RLHF o DPO); esos datos corresponden a la model card de HuggingFaceTB y no se incluyen en la información proporcionada. La conversión no modifica los pesos más allá de la cuantización por bloques.

La innovación técnica de esta ficha es el formato de cuantización y el runtime de destino. isa-lm es un motor en C11 sin dependencias que compila rutas SIMD específicas por ISA: en x86-64 cubre SSE2, AVX2 y AVX-512 VNNI; en ARM cubre ARMv7 NEON, i8mm y SVE. Los formatos Q4_0 y Q8_0 almacenan una escala en f16 por cada bloque de 32 pesos, lo que resulta en 4,5 y 8,5 bits por peso respectivamente. La conversión se realizó con isa-lm 0.5.0 (commit 622b7f4) el 1 de noviembre de 2026, partiendo de los safetensors del modelo base, con `--max-seq 4096`.

## Capacidades

- Generación de texto conversacional de un solo turno y multiturno, con plantilla de chat `smollm`.
- Razonamiento básico y respuesta a preguntas factuales sencillas (el ejemplo de la model card responde correctamente a la capital de Francia).
- Generación de código y texto corto dentro de los límites de un modelo de 135M de parámetros.
- Ejecución en CPU sin GPU, con selección automática de la ruta SIMD más rápida disponible (`ml_run` elige el build óptimo).
- Soporte de contexto de hasta 4096 posiciones.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional embebido en dispositivos sin GPU: el modelo Q4_0 ocupa 72 MiB y puede ejecutarse en CPU ARMv7 o x86-64 antigua, lo que permite integrar un chatbot básico en routers, Raspberry Pi o equipos industriales.
- Clasificación y etiquetado de texto en pipelines de bajo coste: con 4096 tokens de contexto y una huella de 72 MiB, se puede procesar lotes de documentos cortos en un servidor sin acelerador.
- Generación de respuestas de FAQ y atención al cliente de primer nivel: la ventana de 4096 tokens permite conversaciones multiturno con historial moderado, y la latencia de decodificación de 415 tok/s en Q4_0 sobre AVX2 facilita respuestas interactivas.
- Prototipado y pruebas de integración de isa-lm: sirve como modelo de referencia para validar el runtime, el tokenizador `.mlt` y el pipeline de conversión antes de desplegar modelos mayores.
- Entornos con restricciones de licencia estrictas: al mantener Apache 2.0, se puede usar en productos comerciales sin obligaciones de atribución más allá de las habituales.
- Educación y demostraciones de inferencia en CPU: el par Q4_0/Q8_0 permite comparar el impacto de la cuantización en perplejidad (31,63 frente a 23,54) y velocidad (415,2 frente a 246,9 tok/s de decodificación) con un coste de disco mínimo.
- Filtrado y moderación de contenido en el borde: un modelo de 135M puede ejecutarse localmente para prefiltrar texto antes de enviarlo a un modelo mayor en la nube, reduciendo coste y latencia.

## Benchmarks y rendimiento

Los datos publicados en la model card son mediciones del propio autor sobre un runner de GitHub (AMD EPYC 9V45 de 96 núcleos, 4 hilos) con el build `avx2` de isa-lm. La perplejidad se midió en wikitext-2 test con 4 fragmentos de 512 tokens; la velocidad con `ml_bench -n 128` (128 tokens de prompt y 128 decodificados).

| Metrica | Q4_0 | Q8_0 |
|---|---|---|
| Tamano de pesos | 72 MiB | 136 MiB |
| Perplejidad (wikitext-2, menor es mejor) | 31,63 | 23,54 |
| Prefill (tok/s) | 2112 | 1448 |
| Decode (tok/s) | 415,2 | 246,9 |
| Contexto | 4096 | 4096 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para ejecutarse en CPU sin GPU.
- RAM/disco: 72 MiB de pesos en Q4_0 y 136 MiB en Q8_0, más 1138 KiB del tokenizador.
- CPU x86-64: desde SSE2 hasta AVX-512 VNNI; el build `avx2` es el usado en las mediciones.
- CPU ARM: desde ARMv7 NEON hasta i8mm y SVE.
- Sistemas operativos con releases de isa-lm 0.5.0 o superior: Linux x86-64, AArch64 y ARMv7, y Windows x86-64.
- GPU: no necesaria; no se documenta soporte de aceleración por GPU en isa-lm.
- Despliegue: binario `ml_run` de isa-lm; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 2112 tok/s de prefill y 415,2 tok/s de decodificación en Q4_0 sobre AMD EPYC 9V45 con 4 hilos y build AVX2; 1448 y 246,9 tok/s respectivamente en Q8_0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| SmolLM2-135M-Instruct-isa-lm (Q4_0/Q8_0) | 135M | 4096 | `.mlb` (isa-lm) | Apache 2.0 | Optimizado para CPU sin GPU; perplejidad 31,63 (Q4_0) y 23,54 (Q8_0) en wikitext-2 |
| SmolLM2-135M-Instruct (original) | 135M | 4096 | safetensors | Apache 2.0 | Pesos completos en fp16/bf16; requiere framework de inferencia estándar |
| SmolLM2-360M-Instruct | 360M | 4096 | safetensors, GGUF | Apache 2.0 | Mayor capacidad a costa de más cómputo y memoria; datos de benchmarks no disponibles en esta información |
| Qwen2.5-0.5B-Instruct | 500M | 32768 | safetensors, GGUF | Apache 2.0 | Contexto mayor y más parámetros; no ejecutable en el mismo rango de hardware de gama baja |

## Limitaciones y advertencias

- Modelo de 135M de parámetros: capacidad limitada de razonamiento, matemáticas y conocimiento factual; riesgo alto de alucinación en preguntas abiertas.
- La perplejidad en Q4_0 (31,63) es notablemente superior a la de Q8_0 (23,54), lo que indica una pérdida de calidad apreciable con la cuantización de 4 bits.
- No se documentan sesgos específicos, pero al derivar de un modelo entrenado con datos web, es probable que herede sesgos sociales y culturales del corpus original.
- Idiomas soportados no disponibles en la información proporcionada; no se garantiza un rendimiento multilingüe equilibrado.
- El formato `.mlb` es propietario de isa-lm: no es compatible con llama.cpp, vLLM, TGI ni Ollama, lo que limita la portabilidad del despliegue.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni validación independiente de las mediciones.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribuir al modelo base.
- Las mediciones de rendimiento provienen de un único entorno (AMD EPYC 9V45, 4 hilos, build AVX2); el rendimiento en otras CPU puede diferir sustancialmente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jonpark0/SmolLM2-135M-Instruct-isa-lm
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Repositorio de isa-lm: https://github.com/JonPark0/isa-lm
- Releases de isa-lm: https://github.com/JonPark0/isa-lm/releases
- Guía de usuario de isa-lm: https://github.com/JonPark0/isa-lm/blob/main/docs/user-guide.md
- Comparativa con llama.cpp: https://github.com/JonPark0/isa-lm/blob/main/docs/benchmarks.md
- Commit de conversión: https://github.com/JonPark0/isa-lm/commit/622b7f41f392f8a2ef64837b641e62ba09cf1e4d
