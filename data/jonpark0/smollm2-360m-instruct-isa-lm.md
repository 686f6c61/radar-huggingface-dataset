# jonpark0/SmolLM2-360M-Instruct-isa-lm

## Resumen

Esta ficha describe una conversión cuantizada del modelo SmolLM2-360M-Instruct de HuggingFaceTB, publicada por el usuario jonpark0 bajo el identificador `jonpark0/SmolLM2-360M-Instruct-isa-lm`. No se trata de un modelo entrenado desde cero, sino de una redistribución de los pesos originales en formatos propietarios (`.mlb`) y un tokenizador (`.mlt`) específicos para isa-lm, un runtime en C11 sin dependencias que ejecuta modelos de lenguaje en CPU, sin GPU, desde SSE2 en x86-64 hasta AVX-512 VNNI, y desde ARMv7 NEON hasta i8mm y SVE en ARM.

El modelo base, SmolLM2-360M-Instruct, es un transformer decoder-only de 360 millones de parámetros con 4096 posiciones de contexto, orientado a generación de texto e instrucciones. Esta conversión ofrece dos variantes: Q4_0 (todos los pesos a 4 bits, con escalas f16 por bloque de 32 pesos, 4,5 bits efectivos por peso) y Q8_0 (8 bits, 8,5 bits efectivos por peso). El objetivo es permitir la inferencia en hardware de consumo y servidores sin acelerador gráfico, con un consumo de disco de 194 MiB y 367 MiB respectivamente.

La relevancia de esta publicación es fundamentalmente práctica: demuestra la viabilidad de ejecutar un modelo de instrucciones de 360M en CPU con velocidades de decodificación de 130,8 tok/s en Q4_0 y 82,2 tok/s en Q8_0, medidas en un AMD EPYC 7763 con 4 hilos y build AVX2. El repositorio es de tamaño reducido (0,6 GB) y no registra descargas ni likes en el momento de la consulta, lo que indica que es una publicación reciente y de nicho.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base SmolLM2-360M-Instruct) |
| Parámetros totales | 360 millones (modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 posiciones |
| Tipos de cuantización | Q4_0 (4 bits, 4,5 bits/peso efectivos) y Q8_0 (8 bits, 8,5 bits/peso efectivos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlb` (formato propietario de isa-lm); tokenizador en `.mlt` |
| Tamaño de los pesos | 194 MiB (Q4_0), 367 MiB (Q8_0) |
| Tokenizador | 1138 KiB (`tokenizer.mlt`) |
| Runtime requerido | isa-lm 0.5.0 o superior |
| Plataformas | Linux x86-64, AArch64, ARMv7; Windows x86-64 |
| ISA soportadas | SSE2, AVX2, AVX-512 VNNI (x86-64); ARMv7 NEON, i8mm, SVE (ARM) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde íntegramente al modelo base SmolLM2-360M-Instruct: un transformer decoder-only de 360 millones de parámetros con 4096 posiciones de contexto, entrenado por HuggingFaceTB. Esta publicación no aporta información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas de alineación), por lo que dichos datos deben consultarse en la model card original.

La innovación técnica de esta publicación no reside en el modelo, sino en el proceso de conversión y en el runtime de destino. isa-lm es un runtime en C11 sin dependencias que implementa la inferencia en CPU con kernels específicos por conjunto de instrucciones. La cuantización Q4_0 y Q8_0 emplea una escala en f16 por cada bloque de 32 pesos, lo que resulta en 4,5 y 8,5 bits efectivos por peso respectivamente. La conversión se realizó con isa-lm 0.5.0 (commit 622b7f4) el 1 de noviembre de 2026, partiendo de los safetensors del modelo original y fijando `--max-seq 4096`. El runtime selecciona automáticamente la build más rápida que soporte la CPU anfitriona.

## Capacidades

- Generación de texto e instrucciones en inglés, heredadas del modelo base SmolLM2-360M-Instruct.
- Conversación de un solo turno mediante el modo `--chat smollm` del runtime (ejemplo verificado: respuesta correcta a "What is the capital of France?").
- Inferencia en CPU sin GPU, con soporte para x86-64 (SSE2 a AVX-512 VNNI) y ARM (ARMv7 NEON a i8mm y SVE).
- Ejecución en Windows x86-64, Linux x86-64, AArch64 y ARMv7.
- Control de hilos de ejecución mediante el flag `-t` (ejemplo con 4 hilos).
- Capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio o modo thinking: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; el modelo base está orientado principalmente al inglés.

## Casos de uso

- Asistente conversacional ligero en dispositivos sin GPU: con 194 MiB en Q4_0 y 130,8 tok/s de decodificación en un EPYC de 4 hilos, el modelo puede ejecutarse en portátiles, mini-PC y placas ARM para responder consultas simples de un turno con baja latencia.
- Clasificación y etiquetado de texto en pipelines de CPU: al no requerir acelerador, puede integrarse en servidores existentes para tareas de extracción de entidades, categorización o resumen corto, aprovechando las 4096 posiciones de contexto.
- Prototipado rápido de aplicaciones LLM: el formato `.mlb` y el binario `ml_run` permiten desplegar un chatbot funcional con dos ficheros y un comando, sin instalar CUDA, PyTorch ni dependencias Python.
- Despliegue en entornos con restricciones de hardware: sistemas embebidos ARMv7, Raspberry Pi o servidores sin GPU dedicada donde el consumo de disco y memoria es crítico (194 MiB de pesos).
- Generación de texto asistida en herramientas de línea de comandos: el runtime `ml_run` acepta prompts y flags por CLI, lo que facilita su integración en scripts de shell para autocompletado, redacción de borradores o respuestas a preguntas frecuentes.
- Evaluación comparativa de runtimes de inferencia en CPU: los datos de perplejidad (21,73 en Q4_0, 17,45 en Q8_0 sobre wikitext-2 con 4 chunks de 512 tokens) y de velocidad permiten comparar isa-lm con llama.cpp u otras alternativas en el mismo hardware.
- Educación y experimentación: el tamaño reducido y la ausencia de dependencias hacen del modelo un candidato para enseñar cuantización, kernels SIMD y despliegue de LLM en CPU.

## Benchmarks y rendimiento

Los datos publicados por el autor son mediciones de perplejidad y velocidad, no benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Se reproducen a continuación tal como aparecen en la model card.

| Métrica | Q4_0 | Q8_0 |
|---|---|---|
| Perplejidad (wikitext-2, 4 chunks de 512 tokens) | 21,73 | 17,45 |
| Prefill (tok/s) | 480 | 319 |
| Decode (tok/s) | 130,8 | 82,2 |
| Tamaño de pesos | 194 MiB | 367 MiB |
| Bits efectivos por peso | 4,5 | 8,5 |

Las mediciones se realizaron en un GitHub runner con AMD EPYC 7763 de 64 núcleos, 4 hilos y build AVX2 de isa-lm, con `ml_bench -n 128` (128 tokens de prompt y 128 tokens decodificados). No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para ejecutarse en CPU sin GPU.
- Memoria RAM estimada: aproximadamente 194 MiB (Q4_0) o 367 MiB (Q8_0) para los pesos, más overhead del runtime y del contexto de 4096 posiciones.
- GPU recomendadas: no aplica; el runtime isa-lm no utiliza GPU.
- CPU compatibles: x86-64 con SSE2, AVX2 o AVX-512 VNNI; ARMv7 con NEON; AArch64 con NEON, i8mm o SVE.
- Cabe en cualquier CPU de consumo moderna, incluidas placas ARM de bajo consumo y mini-PC; también en Raspberry Pi y similares (ARMv7/AArch64).
- Opciones de despliegue: isa-lm 0.5.0 o superior (binarios `ml_run` para Linux x86-64, AArch64, ARMv7 y Windows x86-64). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el formato `.mlb` es propietario.
- Latencia y throughput: 480 tok/s de prefill y 130,8 tok/s de decode en Q4_0; 319 tok/s de prefill y 82,2 tok/s de decode en Q8_0, medidos en AMD EPYC 7763 con 4 hilos y AVX2. El rendimiento en otras CPU variará según el conjunto de instrucciones disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jonpark0/SmolLM2-360M-Instruct-isa-lm (Q4_0/Q8_0) | 360M | 4096 | `.mlb` / isa-lm | Apache 2.0 | HuggingFace, 0 descargas |
| HuggingFaceTB/SmolLM2-360M-Instruct (original) | 360M | 4096 | safetensors / transformers, llama.cpp, etc. | Apache 2.0 | HuggingFace, ampliamente usado |
| SmolLM2-135M-Instruct | 135M | 4096 (modelo base) | safetensors / múltiples runtimes | Apache 2.0 | HuggingFace |
| SmolLM2-1.7B-Instruct | 1,7B | 4096 (modelo base) | safetensors / múltiples runtimes | Apache 2.0 | HuggingFace |

La comparación relevante es con el modelo original y con las otras tallas de la familia SmolLM2. La ventaja de esta conversión es el tamaño reducido y la ejecución en CPU sin dependencias; la desventaja es el formato propietario `.mlb`, que limita la portabilidad frente a GGUF o safetensors. No se dispone de datos de benchmarks de tareas para comparar el rendimiento cualitativo con las alternativas.

## Limitaciones y advertencias

- Es una conversión cuantizada, no un modelo nuevo: hereda todas las limitaciones del modelo base SmolLM2-360M-Instruct, incluida una capacidad limitada de razonamiento y conocimiento factual propio de un modelo de 360M.
- La cuantización Q4_0 degrada la perplejidad de forma apreciable (21,73 frente a 17,45 en Q8_0 sobre wikitext-2); para tareas sensibles a la calidad, Q8_0 es preferible a costa del doble de tamaño.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de fidelidad factual en esta conversión; el modelo base es propenso a errores en preguntas abiertas.
- Idiomas soportados: no disponible en la información; el modelo base está orientado al inglés y su rendimiento en castellano no está documentado.
- Formato propietario: los pesos `.mlb` solo son utilizables con isa-lm 0.5.0 o superior; no son compatibles con llama.cpp, transformers, vLLM ni Ollama.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial con las obligaciones habituales de atribución y aviso de licencia.
- Publicación de nicho: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad ni de mantenimiento continuado.
- Sin datos de benchmarks de tareas (MMLU, HumanEval, GSM8K) ni de evaluación de sesgos; no se recomienda su uso en producción para decisiones sensibles sin una evaluación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jonpark0/SmolLM2-360M-Instruct-isa-lm
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Repositorio de isa-lm: https://github.com/JonPark0/isa-lm
- Releases de isa-lm: https://github.com/JonPark0/isa-lm/releases
- Guía de usuario de isa-lm (formatos Q8/Q4): https://github.com/JonPark0/isa-lm/blob/main/docs/user-guide.md#q8-q4-or-mixed
- Comparativa con llama.cpp: https://github.com/JonPark0/isa-lm/blob/main/docs/benchmarks.md
- Commit de conversión: https://github.com/JonPark0/isa-lm/commit/622b7f41f392f8a2ef64837b641e62ba09cf1e4d
