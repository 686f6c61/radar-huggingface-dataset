# jonpark0/Qwen3.5-4B-krafla

## Resumen

Qwen3.5-4B-krafla es un conjunto de conversiones cuantizadas del modelo Qwen/Qwen3.5-4B, publicadas por el desarrollador jonpark0 para su uso con Krafla, un runtime de inferencia en C11 sin dependencias externas diseñado para ejecución exclusiva en CPU sobre x86-64 (SSE2 hasta AVX-512 VNNI) y ARM (ARMv7 NEON hasta i8mm y SVE). El repositorio no contiene pesos en formato estándar (safetensors o GGUF), sino ficheros propietarios con extensión `.mlb` que empaquetan los pesos cuantizados en INT4 e INT8 junto con un tokenizador en formato `.mlt`.

El modelo base, Qwen3.5-4B, es un transformer denso de 4 mil millones de parámetros desarrollado por el equipo Qwen (Alibaba) con una ventana de contexto declarada de 262 144 posiciones. Esta conversión resuelve el problema de desplegar dicho modelo en entornos sin GPU, ofreciendo tres variantes con distintos compromisos entre tamaño, perplejidad y velocidad: Q4_0 puro (2261 MiB), Q4_0 mixto con las matrices `v`, `o` y `down` en Q8_0 (2911 MiB) y Q8_0 completo (4264 MiB).

La relevancia actual radica en que permite ejecutar un modelo de 4B con contexto largo en hardware de consumo o servidores sin acelerador, con velocidades medidas de 17,8 tok/s en decodificación para la variante Q4_0 sobre un AMD EPYC 9V45 con 4 hilos. La licencia Apache 2.0 del modelo original se mantiene, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen/Qwen3.5-4B); runtime Krafla en C11 |
| Parametros totales | 4B (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262 144 posiciones registradas en los ficheros; `ml_run` y `ml_server` usan 4096 por defecto, configurable con `--ctx N` |
| Tipos de cuantizacion | Q4_0 (4,5 bits/peso), Q4_0 mixto (v, o, down en Q8_0), Q8_0 (8,5 bits/peso); escalas f16 por bloque de 32 pesos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlb` (formato propietario de Krafla); tokenizador en `.mlt` |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B es un transformer denso de 4 mil millones de parámetros. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación posteriores al preentrenamiento. Tampoco se especifican innovaciones arquitectónicas internas del modelo base más allá de su naturaleza transformer y su ventana de contexto de 262 144 posiciones.

La contribución técnica de este repositorio es la conversión de los pesos safetensors originales a los formatos de cuantización de Krafla mediante las herramientas `tools/convert.py` y `tools/convert_tokenizer.py`, ejecutadas con Krafla 0.9.0 (commit `a4f30b5`) el 3 de noviembre de 2026. La cuantización Q4_0 y Q8_0 emplea una escala f16 por cada bloque de 32 pesos, lo que resulta en 4,5 y 8,5 bits efectivos por peso respectivamente. La variante mixta mantiene en Q8_0 las matrices de proyección `v`, `o` y `down`, que son las más sensibles a la cuantización agresiva, reduciendo la perplejidad de 13,30 a 12,64 a costa de aumentar el tamaño de 2261 a 2911 MiB. El runtime Krafla selecciona automáticamente el build más capaz que soporte la CPU (SSE2, AVX2, AVX-512 VNNI, ARM NEON, i8mm, SVE) y ofrece un servidor compatible con la API de OpenAI.

## Capacidades

- Generación de texto autoregresiva con decodificación greedy y modos de chat predefinidos (`qwen3.5-nothink` en los ejemplos de la model card).
- Razonamiento y respuesta a preguntas en un solo turno, según el ejemplo incluido ("What is the capital of France?" → "The capital of France is Paris.").
- Contexto largo: los ficheros registran 262 144 posiciones, aunque el runtime limita por defecto a 4096 y permite ampliar mediante `--ctx N`, que dimensiona la KV cache.
- Servido mediante API compatible con OpenAI en `http://127.0.0.1:8080/v1` a través de `ml_server`.
- Ejecución exclusiva en CPU sobre x86-64 (SSE2 a AVX-512 VNNI) y ARM (ARMv7 NEON a i8mm y SVE), en Linux x86-64, AArch64, ARMv7 y Windows x86-64.
- Capacidades de tool calling, function calling, agentes, visión, audio o modo thinking extendido: no disponibles en la información proporcionada.
- Capacidades multilingües específicas: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en servidores sin GPU: la variante Q4_0 ocupa 2261 MiB y alcanza 17,8 tok/s de decodificación en un EPYC 9V45 con 4 hilos, lo que permite servir un modelo de 4B en máquinas virtuales o contenedores sin acelerador dedicado.
- Inferencia en el borde o en estaciones de trabajo ARM: el soporte de ARMv7 NEON, i8mm y SVE permite ejecutar el modelo en dispositivos ARM de 64 y 32 bits, útil para prototipos en placas SBC o portátiles ARM.
- Sustitución local de la API de OpenAI: `ml_server` expone un endpoint compatible en `/v1`, de modo que aplicaciones ya integradas con el SDK de OpenAI pueden apuntar a la instancia local sin cambios de código.
- Procesamiento de documentos largos con contexto extendido: al poder elevar `--ctx` hasta el límite registrado de 262 144 posiciones (sujeto a memoria disponible para la KV cache), el modelo puede abordar resúmenes o extracción de información sobre documentos extensos.
- Entornos con requisitos estrictos de dependencias: Krafla es un runtime C11 sin dependencias, lo que simplifica el empaquetado en imágenes mínimas, sistemas embebidos o despliegues auditables donde no se desea arrastrar stacks de Python o CUDA.
- Evaluación comparativa de cuantizaciones: las tres variantes publicadas (Q4_0, Q4_0 mixto y Q8_0) con perplejidad medida sobre wikitext-2 permiten seleccionar el equilibrio tamaño/calidad adecuado para un presupuesto de memoria concreto.
- Chat de un solo turno de baja latencia en CPU: con 4096 posiciones por defecto y decodificación a 17,8 tok/s en Q4_0, es viable para asistentes locales con respuestas cortas.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son la perplejidad sobre wikitext-2 (4 chunks de 512 tokens) y las velocidades de prefill y decode medidas con `ml_bench -n 128` en un GitHub runner (AMD EPYC 9V45, 4 hilos, build `avx2`).

| Fichero | Pesos | Tamano | Perplejidad (wikitext-2) | Prefill (tok/s) | Decode (tok/s) |
|---|---|---|---|---|---|
| `Qwen3.5-4B-Q4_0.mlb` | Q4_0, todas las matrices 4-bit | 2261 MiB | 13,30 | 67 | 17,8 |
| `Qwen3.5-4B-Q4_0-mixed.mlb` | Q4_0 con `v`, `o`, `down` en Q8_0 | 2911 MiB | 12,64 | 56 | 13,9 |
| `Qwen3.5-4B-Q8_0.mlb` | Q8_0, todas las matrices 8-bit | 4264 MiB | 12,16 | 45 | 9,5 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La perplejidad solo es comparable entre ficheros del mismo modelo, según advierte la propia model card.

## Requisitos de hardware

- VRAM: no aplica, el runtime es exclusivamente CPU. La memoria RAM necesaria equivale aproximadamente al tamaño del fichero más la KV cache: 2261 MiB (Q4_0), 2911 MiB (Q4_0 mixto) o 4264 MiB (Q8_0), más el espacio para el contexto configurado con `--ctx`.
- GPU recomendadas: no aplica; Krafla no usa GPU. El rendimiento depende de la CPU y del conjunto de instrucciones disponible.
- CPU compatible: x86-64 con SSE2, AVX2 o AVX-512 VNNI; ARM con ARMv7 NEON, i8mm o SVE. El binario selecciona automáticamente el build más capaz.
- Cabe en hardware de consumo: sí, cualquier equipo con al menos ~3 GB de RAM libre para Q4_0 y ~5 GB para Q8_0, siempre que la CPU soporte alguno de los conjuntos de instrucciones indicados.
- Opciones de despliegue: Krafla 0.9.0 o superior (`ml_run` para CLI, `ml_server` para API compatible con OpenAI). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI; el formato `.mlb` es específico de Krafla.
- Latencia y throughput: medidos en un EPYC 9V45 de 96 núcleos con 4 hilos y build `avx2`: prefill de 67 tok/s y decode de 17,8 tok/s para Q4_0; 56/13,9 para Q4_0 mixto; 45/9,5 para Q8_0. El rendimiento en otras CPU no está documentado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base Qwen3.5-4B ni de conversiones equivalentes en la información proporcionada, por lo que la comparación se limita a las tres variantes publicadas en este mismo repositorio y a características estructurales.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-krafla Q4_0 | 4B | 262 144 (4096 por defecto en runtime) | `.mlb` (Krafla) | Apache 2.0 | 2261 MiB, perplejidad 13,30, 17,8 tok/s decode |
| Qwen3.5-4B-krafla Q4_0 mixto | 4B | 262 144 (4096 por defecto) | `.mlb` (Krafla) | Apache 2.0 | 2911 MiB, perplejidad 12,64, 13,9 tok/s decode |
| Qwen3.5-4B-krafla Q8_0 | 4B | 262 144 (4096 por defecto) | `.mlb` (Krafla) | Apache 2.0 | 4264 MiB, perplejidad 12,16, 9,5 tok/s decode |
| Qwen/Qwen3.5-4B (original) | 4B | 262 144 | safetensors | Apache 2.0 | Pesos sin cuantizar; requiere runtime compatible con safetensors |

Comparación con alternativas de otros ecosistemas (llama.cpp GGUF, vLLM, etc.): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Formato propietario: los ficheros `.mlb` y `.mlt` solo son utilizables con Krafla 0.9.0 o superior; no son compatibles con llama.cpp, vLLM, Ollama, TGI ni con la librería `transformers` de Hugging Face.
- Sin GPU: el runtime es exclusivamente CPU; no se aprovechan aceleradores, lo que limita el throughput frente a despliegues con GPU.
- Contexto efectivo por defecto de 4096 posiciones: aunque los ficheros registran 262 144, es necesario pasar `--ctx N` y disponer de RAM suficiente para la KV cache; no se documenta el consumo de memoria de la KV cache a contextos largos.
- Perplejidad medible solo de forma interna: los valores 13,30 / 12,64 / 12,16 son comparables únicamente entre los ficheros de este modelo, no con otros modelos ni cuantizaciones de otros ecosistemas.
- Idiomas soportados no documentados: la model card no especifica la cobertura lingüística del modelo base.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo, toxicidad o fidelidad factual en la información proporcionada; debe asumirse el comportamiento típico de un modelo de 4B sin datos específicos.
- Capacidades avanzadas no verificadas: no hay evidencia en la información disponible sobre tool calling, function calling, agentes, visión, audio o modo thinking extendido en esta conversión.
- Licencia: Apache 2.0 permite uso comercial, pero se hereda del modelo base; conviene verificar los términos del repositorio original Qwen/Qwen3.5-4B.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (3 de noviembre de 2026); no hay validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jonpark0/Qwen3.5-4B-krafla
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Runtime Krafla (GitHub): https://github.com/JonPark0/krafla
- Releases de Krafla: https://github.com/JonPark0/krafla/releases
- Commit de conversión: https://github.com/JonPark0/krafla/commit/a4f30b59b1fdf8c86e118d4584b57247ce3f1c51
- Guía de usuario (formatos Q8/Q4/mixto): https://github.com/JonPark0/krafla/blob/main/docs/user-guide.md#q8-q4-or-mixed
- Comparativa con llama.cpp: https://github.com/JonPark0/krafla/blob/main/docs/benchmarks.md
