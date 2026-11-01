# jonpark0/Qwen2.5-1.5B-Instruct-krafla

## Resumen

Qwen2.5-1.5B-Instruct-krafla es una conversión cuantizada del modelo Qwen2.5-1.5B-Instruct de Alibaba Qwen, publicada por el usuario jonpark0 para el runtime isa-lm. No se trata de un modelo nuevo ni de un ajuste fino: es el mismo modelo base empaquetado en formatos INT4 e INT8 propietarios (extensión `.mlb`) pensados para ejecutarse en CPU sin GPU mediante un runtime en C11 sin dependencias externas. El objetivo es permitir la inferencia de un transformer de 1.500 millones de parámetros en hardware de consumo o en servidores sin acelerador dedicado.

El modelo base Qwen2.5-1.5B-Instruct es un transformer decoder-only denso de la familia Qwen2.5, entrenado por Alibaba para instrucciones y conversación multilingüe. Esta conversión mantiene la licencia Apache 2.0 del original y ofrece tres variantes de pesos: Q4_0 completa (829 MiB), Q4_0 mixta con las matrices `v`, `o` y `down` en Q8_0 (1049 MiB) y Q8_0 completa (1565 MiB), con perplejidades de 14,66, 13,64 y 12,71 respectivamente sobre wikitext-2.

La relevancia de esta ficha es acotada: el repositorio tiene cero descargas y cero likes en el momento de la consulta, y su interés práctico depende por completo del runtime isa-lm. Resulta útil para quienes quieran desplegar Qwen2.5-1.5B-Instruct en entornos x86-64 (SSE2 a AVX-512 VNNI) o ARM (ARMv7 NEON a i8mm y SVE) sin instalar CUDA, PyTorch ni ninguna otra dependencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.500 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 posiciones (configurada en la conversion con `--max-seq 4096`) |
| Tipos de cuantizacion | Q4_0 (4,5 bits por peso), Q4_0 mixta con `v,o,down` en Q8_0, Q8_0 (8,5 bits por peso) |
| Idiomas soportados | no disponible en la informacion proporcionada (heredados del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlb` (formato propietario de isa-lm); tokenizer en `.mlt` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-1.5B-Instruct original: un transformer decoder-only denso con atención de múltiples cabezas, normalización RMSNorm y embeddings rotatorios (RoPE). No hay innovaciones arquitectónicas introducidas en esta conversión; el trabajo del autor se limita a la cuantización y al empaquetado de los pesos. Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, fases de RLHF o DPO) no se recogen en la información proporcionada y deben consultarse en la model card de Qwen/Qwen2.5-1.5B-Instruct.

La innovación técnica de esta publicación reside en el formato de cuantización y el runtime. Q4_0 y Q8_0 almacenan una escala en formato f16 por cada bloque de 32 pesos, lo que resulta en 4,5 y 8,5 bits efectivos por peso respectivamente. El runtime isa-lm es un binario en C11 sin dependencias que selecciona automáticamente la build más rápida soportada por la CPU: en x86-64 desde SSE2 hasta AVX-512 VNNI, y en ARM desde ARMv7 NEON hasta i8mm y SVE. La conversión se realizó con isa-lm 0.5.0 (commit `622b7f4`) el 1 de noviembre de 2026 a partir de los safetensors del modelo original.

## Capacidades

- Generación de texto y conversación multi-turno en formato chat mediante el flag `--chat qwen` de `ml_run`.
- Razonamiento básico, respuesta a preguntas y tareas de instrucción heredadas del ajuste del modelo base.
- Generación de código y matemáticas a nivel de un modelo de 1,5B, sin garantías de calidad en tareas complejas.
- Capacidades multilingües heredadas de Qwen2.5, aunque no se documentan idiomas concretos en esta ficha.
- Ejecución en CPU sin GPU, sin CUDA, sin PyTorch y sin dependencias externas.
- Soporte de cuantización seleccionable en tiempo de conversión (Q4_0, Q4_0 mixta, Q8_0) con compromiso explícito entre tamaño, perplejidad y velocidad.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información proporcionada.

## Casos de uso

- Despliegue en servidores sin GPU: el runtime isa-lm funciona en x86-64 y ARM sin acelerador, por lo que el modelo puede servirse en instancias CPU-only de cloud o en servidores ya existentes, con un peso en disco de entre 829 MiB y 1565 MiB según la variante.
- Prototipado y pruebas locales en portátiles: la variante Q4_0 (829 MiB) cabe en memoria RAM convencional y permite iterar sobre prompts y flujos de chat sin depender de hardware especializado.
- Entornos con restricciones de dependencias: al ser un binario C11 sin dependencias, encaja en sistemas embebidos o contenedores mínimos donde instalar PyTorch o CUDA no es viable.
- Procesamiento por lotes de texto en CPU: con 49,8 tok/s de decodificación y 197 tok/s de prefill en un AMD EPYC 9V45 con 4 hilos (build AVX2), es adecuado para tareas de resumen, clasificación o extracción sobre volúmenes moderados de texto.
- Evaluación comparativa de cuantizaciones: las tres variantes publicadas permiten medir el impacto de Q4_0 frente a Q8_0 en perplejidad (14,66 frente a 12,71) y velocidad dentro del mismo runtime.
- Educación y experimentación con runtimes de inferencia: sirve para estudiar cómo se comporta un transformer de 1,5B bajo distintas rutas SIMD (SSE2, AVX2, AVX-512 VNNI, NEON, SVE) sin la complejidad de una pila de software completa.
- Asistente conversacional de bajo coste en dispositivos ARM: la build para ARMv7 NEON y superiores permite ejecutar el modelo en placas y sistemas ARM sin GPU dedicada.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son métricas de perplejidad y velocidad del propio runtime, no benchmarks estándar de calidad (MMLU, HumanEval, GSM8K). Se reproducen a continuación tal como aparecen en la model card.

| Variante | Pesos | Tamano | Perplejidad (wikitext-2) | Prefill (tok/s) | Decode (tok/s) |
|---|---|---:|---:|---:|---:|
| Q4_0 | 4 bits en todas las matrices | 829 MiB | 14,66 | 197 | 49,8 |
| Q4_0 mixta | Q4_0 con `v,o,down` en Q8_0 | 1049 MiB | 13,64 | 164 | 39,7 |
| Q8_0 | 8 bits en todas las matrices | 1565 MiB | 12,71 | 127 | 26,8 |

Mediciones realizadas en un GitHub runner con AMD EPYC 9V45 de 96 núcleos, 4 hilos y build AVX2 de isa-lm. La perplejidad se calcula sobre el conjunto de test de wikitext-2 con 4 fragmentos de 512 tokens; la velocidad con `ml_bench -n 128`, 128 tokens de prompt y 128 tokens decodificados. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para ejecutarse en CPU. El requisito real es memoria RAM: aproximadamente 829 MiB (Q4_0), 1049 MiB (Q4_0 mixta) o 1565 MiB (Q8_0), más el espacio del tokenizer (3468 KiB) y el overhead del runtime.
- CPU x86-64: desde SSE2 hasta AVX-512 VNNI. Las builds AVX2 y AVX-512 ofrecen mayor throughput; las cifras publicadas corresponden a AVX2.
- CPU ARM: desde ARMv7 NEON hasta i8mm y SVE, con builds específicas para AArch64 y ARMv7.
- GPU: no se requiere ni se soporta en esta conversión; no hay backend CUDA documentado.
- Sistemas operativos: Linux x86-64, Linux AArch64, Linux ARMv7 y Windows x86-64, según los releases de isa-lm 0.5.0 o superior.
- Despliegue: exclusivamente mediante el runtime isa-lm (`ml_run`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.mlb` es propietario.
- Latencia y throughput: 197 tok/s de prefill y 49,8 tok/s de decodificación en Q4_0 sobre AMD EPYC 9V45 con 4 hilos y build AVX2; 127 y 26,8 tok/s respectivamente en Q8_0. No hay datos para otras CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct-krafla (esta ficha) | 1,5B | 4096 | `.mlb` / isa-lm (CPU) | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct (original) | 1,5B | 32.768 (según model card original) | safetensors / transformers, vLLM, TGI | Apache 2.0 | HuggingFace, ampliamente adoptado |
| Versiones GGUF de Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | GGUF / llama.cpp, Ollama | Apache 2.0 | HuggingFace, múltiples repositorios de la comunidad |

La comparación relevante es frente al modelo original y a sus conversiones GGUF: esta variante sacrifica compatibilidad de ecosistema (solo funciona con isa-lm) y reduce el contexto configurado a 4096 posiciones, a cambio de un runtime mínimo sin dependencias y builds optimizadas para un abanico amplio de extensiones SIMD. No se dispone de datos de benchmarks de calidad para establecer comparaciones de rendimiento frente a otras cuantizaciones.

## Limitaciones y advertencias

- El formato `.mlb` es propietario de isa-lm: no es cargable por transformers, llama.cpp, vLLM, Ollama ni TGI, lo que limita su integración en pilas existentes.
- El contexto está configurado a 4096 posiciones en la conversión, por debajo de la ventana nativa del modelo base; no se documenta si puede ampliarse sin reconvertir.
- La perplejidad de Q4_0 (14,66) es notablemente superior a la de Q8_0 (12,71), lo que indica una pérdida de calidad medible en la variante más comprimida.
- No se documentan idiomas soportados en esta ficha; las capacidades multilingües dependen del modelo base y no están verificadas aquí.
- Riesgo de alucinación inherente a un modelo de 1,5B: no debe usarse en producción para tareas que requieran alta fiabilidad factual sin verificación externa.
- No se documentan sesgos específicos ni evaluaciones de seguridad para esta conversión; deben asumirse los del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base y del runtime isa-lm por separado.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo día; no hay evidencia de uso en producción ni de mantenimiento continuado.
- El rendimiento medido corresponde a un AMD EPYC 9V45 con 4 hilos y build AVX2; en CPU de consumo o en ARM las cifras pueden ser sustancialmente inferiores.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jonpark0/Qwen2.5-1.5B-Instruct-krafla
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Runtime isa-lm: https://github.com/JonPark0/isa-lm
- Releases de isa-lm: https://github.com/JonPark0/isa-lm/releases
- Guía de usuario de isa-lm (formatos Q8, Q4 y mixto): https://github.com/JonPark0/isa-lm/blob/main/docs/user-guide.md#q8-q4-or-mixed
- Comparativa con llama.cpp: https://github.com/JonPark0/isa-lm/blob/main/docs/benchmarks.md
- Commit de conversión: https://github.com/JonPark0/isa-lm/commit/622b7f41f392f8a2ef64837b641e62ba09cf1e4d
