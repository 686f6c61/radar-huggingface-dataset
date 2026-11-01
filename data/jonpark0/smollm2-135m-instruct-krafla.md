# jonpark0/SmolLM2-135M-Instruct-krafla

## Resumen

SmolLM2-135M-Instruct-krafla es una conversión cuantizada del modelo SmolLM2-135M-Instruct de HuggingFaceTB, publicada por jonpark0 para el runtime isa-lm. No se trata de un modelo nuevo ni de un reentrenamiento: es el mismo modelo base empaquetado en formatos INT4 (Q4_0) e INT8 (Q8_0) propietarios de isa-lm, un runtime en C11 sin dependencias que ejecuta modelos de lenguaje en CPU sin GPU, con soporte para x86-64 desde SSE2 hasta AVX-512 VNNI y ARM desde ARMv7 NEON hasta i8mm y SVE.

El interés de esta ficha no está en las capacidades del modelo (heredadas íntegramente de SmolLM2-135M-Instruct, un transformer decoder de 135 millones de parámetros), sino en el empaquetado: ficheros `.mlb` de 72 MiB (Q4_0) y 136 MiB (Q8_0) más un tokenizador `.mlt` de 1138 KiB, pensados para despliegue en CPU en entornos sin acelerador. El contexto declarado es de 4096 posiciones y la licencia es Apache 2.0, heredada del modelo original.

Es relevante ahora por su nicho concreto: inferencia de un LLM pequeño en hardware de CPU heterogéneo (servidores x86 sin GPU, dispositivos ARM, entornos embebidos) con un binario único y sin cadena de dependencias de Python. Con 0 descargas y 0 likes en el momento de la consulta, es un artefacto de nicho orientado a usuarios del runtime isa-lm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (heredada de SmolLM2-135M-Instruct); empaquetado para runtime isa-lm en C11 |
| Parametros totales | 135 millones (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 posiciones |
| Tipos de cuantizacion | Q4_0 (4 bits por matriz, escala f16 por bloque de 32 pesos, ~4.5 bits/peso) y Q8_0 (8 bits, escala f16 por bloque de 32 pesos, ~8.5 bits/peso) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlb` (formato propietario de isa-lm), tokenizador `.mlt` |
| Tamano de ficheros | Q4_0: 72 MiB; Q8_0: 136 MiB; tokenizador: 1138 KiB |
| Repo total | 0.2 GB |
| Plataformas del runtime | Linux x86-64, AArch64 y ARMv7; Windows x86-64 |
| Versión mínima del runtime | isa-lm 0.5.0 o superior |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de SmolLM2-135M-Instruct, un transformer decoder de 135 millones de parámetros desarrollado por HuggingFaceTB. Esta ficha no aporta detalles adicionales sobre el entrenamiento del modelo base (número de tokens, composición del dataset, fases de RLHF/DPO): esa información corresponde a la model card original de HuggingFaceTB/SmolLM2-135M-Instruct y no se incluye en la información proporcionada.

La contribución técnica de este repositorio es el proceso de conversión y cuantización. Los ficheros se generaron con isa-lm 0.5.0 (commit 622b7f4) el 2026-11-01 a partir de los safetensors del modelo original, mediante `tools/convert.py` con `--wtype q4` y `--wtype q8` y `--max-seq 4096`, más `tools/convert_tokenizer.py` para el tokenizador. Los formatos Q4_0 y Q8_0 mantienen una escala en f16 por cada bloque de 32 pesos, lo que resulta en 4.5 y 8.5 bits efectivos por peso respectivamente. El runtime isa-lm selecciona en tiempo de ejecución la build más rápida que soporte la CPU (SSE2, AVX2, AVX-512 VNNI en x86; NEON, i8mm, SVE en ARM).

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiqueta `--chat smollm` en el runtime).
- Razonamiento básico y respuesta a preguntas simples, limitado por el tamaño de 135M parámetros.
- Ejecución en CPU sin GPU, con kernels SIMD específicos por arquitectura (SSE2, AVX2, AVX-512 VNNI, ARM NEON, i8mm, SVE).
- Prefill y decode medidos y publicados: 2112 tok/s de prefill y 415.2 tok/s de decode en Q4_0; 1448 tok/s y 246.9 tok/s en Q8_0.
- Soporte de contexto de 4096 posiciones.
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling, function calling, agentes, visión o audio: no disponibles en la información proporcionada; el modelo base es un LLM de texto de 135M y no se documentan estas capacidades en el repositorio.

## Casos de uso

- Inferencia en servidores sin GPU: desplegar un chatbot básico o un generador de texto en máquinas x86-64 sin acelerador, usando el binario `ml_run` y el fichero Q4_0 de 72 MiB, con la build AVX2 o AVX-512 seleccionada automáticamente por el runtime.
- Dispositivos ARM y entornos embebidos: el soporte de ARMv7 NEON, AArch64, i8mm y SVE permite ejecutar el modelo en placas ARM y dispositivos de borde donde no cabe un runtime de Python ni una GPU.
- Pruebas de integración continua: el tamaño reducido (72 MiB en Q4_0) y la ausencia de dependencias facilitan incluirlo en pipelines de CI para validar flujos de generación de texto sin aprovisionar hardware especializado.
- Prototipado rápido de aplicaciones de chat: con `--chat smollm` y 4096 posiciones de contexto se pueden validar conversaciones multi-turno antes de migrar a un modelo mayor.
- Benchmarking de hardware de CPU: los comandos `ml_bench -n 128` y `tools/perplexity.py --ctx 512 --chunks 4` permiten medir throughput y perplejidad en wikitext-2 para comparar CPUs o builds SIMD.
- Docencia y experimentación con cuantización: los ficheros Q4_0 y Q8_0 con escalas f16 por bloque de 32 pesos sirven para estudiar el compromiso entre tamaño, perplejidad (31.63 frente a 23.54) y velocidad.
- Generación de texto de baja latencia en local: con 415 tok/s de decode en Q4_0 sobre un EPYC de 4 hilos, es viable para tareas de autocompletado o respuestas cortas en aplicaciones de escritorio.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Medidos en un GitHub runner con AMD EPYC 9V45 de 96 núcleos, 4 hilos, build `avx2` de isa-lm. Perplejidad sobre el test de wikitext-2, 4 fragmentos de 512 tokens (`tools/perplexity.py --ctx 512 --chunks 4`); velocidad con `ml_bench -n 128` (128 tokens de prompt y 128 decodificados).

| Fichero | Cuantizacion | Tamano | Perplejidad (menor es mejor) | Prefill (tok/s) | Decode (tok/s) |
|---|---|---|---|---|---|
| `SmolLM2-135M-Instruct-Q4_0.mlb` | Q4_0, todas las matrices a 4 bits | 72 MiB | 31.63 | 2112 | 415.2 |
| `SmolLM2-135M-Instruct-Q8_0.mlb` | Q8_0, todas las matrices a 8 bits | 136 MiB | 23.54 | 1448 | 246.9 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor advierte que la perplejidad solo es comparable entre ficheros del mismo modelo.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU. Memoria RAM necesaria en el orden del tamaño del fichero más el estado del runtime: aproximadamente 72 MiB para Q4_0 y 136 MiB para Q8_0, más overhead del tokenizador y del contexto de 4096 posiciones.
- GPU: no se requiere ni se soporta en este empaquetado; el runtime isa-lm está orientado a CPU.
- CPU x86-64: desde SSE2 hasta AVX-512 VNNI. Las cifras publicadas corresponden a una build AVX2.
- CPU ARM: ARMv7 NEON, AArch64, i8mm y SVE.
- Sistemas operativos: Linux x86-64, AArch64 y ARMv7; Windows x86-64.
- Despliegue: binario `ml_run` de las releases de isa-lm (versión 0.5.0 o superior) junto con el fichero `.mlb` y `tokenizer.mlt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Throughput de referencia: 2112 tok/s de prefill y 415.2 tok/s de decode en Q4_0 sobre AMD EPYC 9V45 con 4 hilos; 1448 y 246.9 tok/s respectivamente en Q8_0. La latencia en hardware consumer no está publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM2-135M-Instruct-krafla (este) | 135M | 4096 | `.mlb` para isa-lm (CPU, C11) | Apache 2.0 | HuggingFace, 0 descargas |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | 4096 (según modelo base) | safetensors, transformers | Apache 2.0 | HuggingFace, modelo de referencia |
| SmolLM2-135M-Instruct en GGUF (llama.cpp) | 135M | 4096 (según modelo base) | GGUF, llama.cpp | Apache 2.0 | Disponible vía conversión comunitaria; no se detalla en la información proporcionada |

La comparación relevante es de empaquetado y runtime, no de capacidades: el modelo base es idéntico. isa-lm se posiciona frente a llama.cpp con un binario sin dependencias y kernels SIMD amplios; el autor enlaza una comparativa propia en `docs/benchmarks.md` de isa-lm, cuyos resultados no se incluyen en la información proporcionada.

## Limitaciones y advertencias

- Capacidad limitada por tamaño: 135M parámetros implican razonamiento débil, alta tasa de error en tareas complejas y riesgo elevado de alucinación en preguntas factuales fuera de dominios comunes.
- Idiomas soportados no documentados en este repositorio; el comportamiento multilingüe depende del modelo base y no está verificado aquí.
- Perplejidad Q4_0 de 31.63 frente a 23.54 en Q8_0: la cuantización a 4 bits degrada la calidad de forma medible; para tareas sensibles conviene Q8_0.
- El formato `.mlb` y el tokenizador `.mlt` son propietarios de isa-lm: no son compatibles con transformers, llama.cpp, vLLM ni otras herramientas estándar. La portabilidad queda atada al runtime de JonPark0.
- Dependencia de la versión del runtime: se requiere isa-lm 0.5.0 o superior; versiones anteriores no cargarán estos ficheros.
- Las cifras de rendimiento se midieron en un EPYC 9V45 de 96 núcleos con 4 hilos y build AVX2; el rendimiento en CPUs consumer o ARM puede diferir sustancialmente y no está publicado.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las limitaciones y sesgos del modelo base SmolLM2-135M-Instruct, no evaluados en esta información.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni informes independientes de calidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jonpark0/SmolLM2-135M-Instruct-krafla
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Runtime isa-lm (GitHub): https://github.com/JonPark0/isa-lm
- Releases de isa-lm: https://github.com/JonPark0/isa-lm/releases
- Commit de conversión 622b7f4: https://github.com/JonPark0/isa-lm/commit/622b7f41f392f8a2ef64837b641e62ba09cf1e4d
- Guía de usuario de isa-lm (formatos Q8/Q4): https://github.com/JonPark0/isa-lm/blob/main/docs/user-guide.md#q8-q4-or-mixed
- Comparativa con llama.cpp: https://github.com/JonPark0/isa-lm/blob/main/docs/benchmarks.md
