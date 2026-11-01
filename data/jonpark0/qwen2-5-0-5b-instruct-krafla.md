# jonpark0/Qwen2.5-0.5B-Instruct-krafla

## Resumen

Qwen2.5-0.5B-Instruct-krafla es una conversión cuantizada del modelo Qwen2.5-0.5B-Instruct de Alibaba Qwen, publicada por el usuario jonpark0 para el runtime isa-lm. No se trata de un modelo nuevo entrenado desde cero, sino de una redistribución de los pesos originales en formatos INT4 (Q4_0) e INT8 (Q8_0) empaquetados en ficheros `.mlb`, junto con un tokenizador en formato `.mlt`, pensados para ejecutarse en CPU sin GPU mediante el runtime C11 sin dependencias isa-lm.

El interés de esta ficha reside en el motor de inferencia más que en los pesos: isa-lm permite ejecutar el modelo en x86-64 desde SSE2 hasta AVX-512 VNNI y en ARM desde ARMv7 NEON hasta i8mm y SVE, lo que habilita despliegues en hardware muy modesto (servidores sin acelerador, Raspberry Pi, portátiles antiguos). El modelo base Qwen2.5-0.5B-Instruct es un transformer decoder-only de 0,5 mil millones de parámetros con 4096 posiciones de contexto, ajustado por instrucciones, y esta conversión conserva esa ventana de contexto.

La relevancia actual es acotada: el modelo base es pequeño y de 2024, y la conversión tiene cero descargas y cero likes en el momento de redactar esta ficha. Su valor es práctico para entornos de inferencia en CPU con requisitos mínimos de memoria (desde 265 MiB en Q4_0) y para evaluar el rendimiento del runtime isa-lm frente a llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros totales | 0,5 mil millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 posiciones |
| Tipos de cuantizacion | Q4_0 (4 bits por matriz), Q4_0 mixta (emb, v, o, down en Q8_0), Q8_0 (8 bits por matriz) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlb` (formato propio de isa-lm), tokenizador `.mlt` |

Detalle de los ficheros publicados:

| Fichero | Pesos | Tamano | Perplejidad (wikitext-2) | Prefill | Decode |
|---|---|---:|---:|---:|---:|
| `Qwen2.5-0.5B-Instruct-Q4_0.mlb` | Q4_0 en todas las matrices | 265 MiB | 21,73 | 709 tok/s | 153,9 tok/s |
| `Qwen2.5-0.5B-Instruct-Q4_0-mixed.mlb` | Q4_0 con `emb,v,o,down` en Q8_0 | 391 MiB | 20,00 | 601 tok/s | 107,0 tok/s |
| `Qwen2.5-0.5B-Instruct-Q8_0.mlb` | Q8_0 en todas las matrices | 501 MiB | 19,04 | 496 tok/s | 81,5 tok/s |
| `tokenizer.mlt` | tokenizador | 3468 KiB | no aplica | no aplica | no aplica |

## Arquitectura y entrenamiento

La arquitectura corresponde integramente al modelo base Qwen2.5-0.5B-Instruct: un transformer decoder-only con atención causal estándar (no se documenta atención lineal ni SSM en la información disponible), 0,5 mil millones de parámetros y ventana de contexto de 4096 posiciones, tal como fija la conversión con `--max-seq 4096`. El ajuste por instrucciones y los datos de entrenamiento originales (número de tokens, composición del dataset, uso de RLHF/DPO) no se detallan en la información proporcionada; corresponden a la model card de Qwen2.5-0.5B-Instruct, no a esta conversión.

La innovación técnica de esta publicación es el formato de cuantización y el runtime. Q4_0 y Q8_0 almacenan una escala en f16 por cada bloque de 32 pesos, lo que resulta en 4,5 y 8,5 bits efectivos por peso respectivamente. La conversión se realizó con isa-lm 0.5.0 (commit `622b7f4`) el 2026-11-01 a partir de los safetensors originales, mediante las herramientas `convert_tokenizer.py` y `convert.py`. El runtime isa-lm es un binario C11 sin dependencias que selecciona en tiempo de ejecución la build más rápida soportada por la CPU (SSE2, AVX2, AVX-512 VNNI en x86-64; NEON, i8mm, SVE en ARM). La variante mixta mantiene en Q8_0 las matrices de embedding, proyección de valor, proyección de salida y down-projection, lo que reduce la perplejidad de 21,73 a 20,00 a costa de un 47 % más de tamaño.

## Capacidades

- Generación de texto conversacional de un solo turno y multi-turno, con plantilla de chat Qwen (`--chat qwen`).
- Respuesta a instrucciones y preguntas factuales simples; el ejemplo de la model card devuelve "The capital of France is Paris." de forma codiciosa.
- Razonamiento básico y matemáticas elementales, limitado por el tamaño de 0,5B del modelo base.
- Generación de código y texto estructurado, con calidad propia de un modelo de 0,5B.
- Ejecución en CPU pura sin GPU, en x86-64 (SSE2 a AVX-512 VNNI) y ARM (ARMv7 NEON a i8mm y SVE).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia en servidores sin GPU: el fichero Q4_0 ocupa 265 MiB y se ejecuta con `ml_run` en cualquier x86-64 con SSE2, lo que permite desplegar un chatbot básico en máquinas virtuales de gama baja o contenedores sin acelerador.
- Dispositivos embebidos y SBC: la build ARM cubre desde ARMv7 NEON hasta SVE, de modo que el modelo Q4_0 puede correr en placas tipo Raspberry Pi para asistentes locales de texto sin conexión.
- Clasificación y extracción de texto por lotes: con 153,9 tok/s de decodificación en AVX2 y 4 hilos, es viable procesar grandes volúmenes de documentos cortos (resúmenes de una frase, etiquetado, extracción de entidades simples) en pipelines batch por CPU.
- Prototipado y pruebas de integración de isa-lm: sirve como modelo de referencia para validar el runtime, comparar builds (SSE2 frente a AVX-512) y medir perplejidad y throughput antes de pasar a modelos mayores en el mismo formato.
- Asistente de línea de comandos o utilidades de terminal: al ser un binario C11 sin dependencias, se integra en scripts y herramientas CLI para generar texto breve (mensajes de commit, descripciones, respuestas a preguntas frecuentes) sin levantar un servidor Python.
- Evaluación comparativa de cuantización: los tres ficheros (Q4_0, Q4_0 mixta y Q8_0) permiten medir el compromiso entre tamaño, perplejidad y velocidad (21,73 / 20,00 / 19,04 de perplejidad frente a 265 / 391 / 501 MiB) en el mismo hardware.
- Filtrado y moderación ligera en el borde: con contexto de 4096 tokens y huella de memoria inferior a 300 MiB, puede ejecutarse junto a otros servicios en el mismo nodo para tareas de cribado de texto.

## Benchmarks y rendimiento

Los únicos datos publicados son de perplejidad y velocidad del runtime, medidos en un GitHub runner (AMD EPYC 9V45 de 96 núcleos, 4 hilos) con la build `avx2` de isa-lm. La perplejidad se calcula sobre el conjunto de test de wikitext-2 con 4 fragmentos de 512 tokens (`tools/perplexity.py --ctx 512 --chunks 4`); la velocidad con `ml_bench -n 128`, 128 tokens de prompt y 128 tokens decodificados.

| Fichero | Perplejidad (menor es mejor) | Prefill (tok/s) | Decode (tok/s) |
|---|---:|---:|---:|
| Q4_0 | 21,73 | 709 | 153,9 |
| Q4_0 mixta | 20,00 | 601 | 107,0 |
| Q8_0 | 19,04 | 496 | 81,5 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones numéricas con llama.cpp más allá de la referencia al documento de benchmarks del repositorio.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para CPU. Memoria RAM necesaria aproximada: 265 MiB (Q4_0), 391 MiB (Q4_0 mixta) y 501 MiB (Q8_0), más el overhead del runtime y del contexto.
- GPU: no se requiere ni se documenta soporte de GPU en la información proporcionada.
- CPU x86-64: desde SSE2 hasta AVX-512 VNNI; las builds más rápidas se seleccionan automáticamente con `ml_run`.
- CPU ARM: desde ARMv7 NEON hasta i8mm y SVE.
- Cabe en cualquier equipo de consumo actual, incluidos portátiles modestos y SBC ARM, dado el tamaño de los ficheros.
- Despliegue: runtime isa-lm 0.5.0 o superior (Linux x86-64, AArch64, ARMv7 y Windows x86-64), invocando `./ml_run <modelo>.mlb -z tokenizer.mlt --chat qwen -t 4`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 153,9 tok/s de decodificación y 709 tok/s de prefill en Q4_0 sobre AMD EPYC 9V45 con 4 hilos y build AVX2; el rendimiento variará según la CPU y el número de hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| Qwen2.5-0.5B-Instruct-krafla (esta ficha) | 0,5B | 4096 | Q4_0, Q4_0 mixta, Q8_0 en `.mlb` (isa-lm) | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 0,5B | 4096 (32K en la versión original de Qwen2.5) | safetensors en bf16/fp16 | Apache 2.0 | HuggingFace, ampliamente utilizado |
| Conversiones GGUF de Qwen2.5-0.5B-Instruct para llama.cpp | 0,5B | 4096 | Q4_0, Q4_K_M, Q8_0, etc. en `.gguf` | Apache 2.0 | HuggingFace (múltiples repos de terceros) |

La comparación cuantitativa de rendimiento entre esta conversión y las alternativas GGUF no está disponible en la información proporcionada; el repositorio de isa-lm remite a su propio documento de benchmarks frente a llama.cpp sin que se incluyan aquí las cifras.

## Limitaciones y advertencias

- Modelo base de 0,5B parámetros: capacidad de razonamiento, matemáticas y código muy limitada; propenso a errores en tareas de varios pasos.
- Riesgo de alucinación alto en preguntas factuales, inherente al tamaño del modelo.
- Ventana de contexto fijada en 4096 posiciones por la conversión (`--max-seq 4096`); no se aprovecha el contexto mayor del Qwen2.5 original.
- Idiomas soportados no documentados en esta conversión; el comportamiento multilingüe dependerá del modelo base y no está verificado aquí.
- Licencia Apache 2.0 heredada del modelo original, que permite uso comercial; no obstante, debe conservarse el aviso de licencia y verificarse las condiciones del modelo base.
- Dependencia de un runtime propietario en formato: los ficheros `.mlb` solo se ejecutan con isa-lm; no son compatibles con llama.cpp, vLLM, Ollama ni TGI.
- Repositorio con cero descargas y cero likes: sin validación comunitaria ni garantías de mantenimiento.
- La perplejidad de 21,73 en Q4_0 es notablemente superior a la de Q8_0 (19,04); para tareas sensibles a la calidad conviene usar Q8_0 o la variante mixta.
- No se documentan mitigaciones de sesgo, filtros de seguridad ni evaluaciones de robustez en la información proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jonpark0/Qwen2.5-0.5B-Instruct-krafla
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio del runtime isa-lm: https://github.com/JonPark0/isa-lm
- Releases de isa-lm: https://github.com/JonPark0/isa-lm/releases
- Commit de conversión: https://github.com/JonPark0/isa-lm/commit/622b7f41f392f8a2ef64837b641e62ba09cf1e4d
- Guía de usuario (formatos Q8/Q4/mixto): https://github.com/JonPark0/isa-lm/blob/main/docs/user-guide.md#q8-q4-or-mixed
- Comparativa con llama.cpp: https://github.com/JonPark0/isa-lm/blob/main/docs/benchmarks.md
