# jonpark0/Qwen3-0.6B-isa-lm

## Resumen

Qwen3-0.6B-isa-lm es una conversión cuantizada del modelo Qwen3-0.6B de Alibaba Qwen, publicada por jonpark0 para el runtime isa-lm, una implementación en C11 sin dependencias que ejecuta modelos de lenguaje en CPU sin necesidad de GPU. El paquete incluye tres variantes de pesos en formato propietario `.mlb` (Q4_0, Q4_0 mixta con capas sensibles en Q8_0 y Q8_0 completa) más un tokenizador en formato `.mlt`, todo derivado de los safetensors originales mediante las herramientas de conversión de isa-lm 0.5.0.

El modelo base es un transformer denso de 0,6 mil millones de parámetros con 4096 posiciones de contexto, pensado para generación de texto y razonamiento ligero. La propuesta de esta conversión no es mejorar el modelo, sino hacerlo desplegable en entornos sin acelerador: el binario Q4_0 ocupa 320 MiB y alcanza 343 tok/s en prefill y 80,6 tok/s en decodificación sobre un Xeon Platinum 8573C con 4 hilos y build AVX2, según las mediciones del autor.

Es relevante para quienes necesitan inferencia local en CPU con huella mínima de memoria, soporte multiarquitectura (x86-64 desde SSE2 hasta AVX-512 VNNI, ARM desde ARMv7 NEON hasta i8mm y SVE) y sin cadena de dependencias de Python ni CUDA. La licencia Apache 2.0 del modelo original se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-0.6B); runtime isa-lm en C11 |
| Parametros totales | 0,6 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 posiciones |
| Tipos de cuantizacion | Q4_0 (4,5 bits/peso), Q4_0 mixta con `emb,v,o,down` en Q8_0, Q8_0 (8,5 bits/peso); escalas f16 por bloque de 32 pesos |
| Idiomas soportados | no disponible (heredados del modelo base Qwen3-0.6B) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlb` (formato propietario de isa-lm); tokenizador `.mlt` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-0.6B, un transformer denso decoder-only de la familia Qwen3. Esta publicación no entrena ni afina el modelo: únicamente convierte los safetensors originales a los formatos de isa-lm mediante `tools/convert.py`, fijando `--max-seq 4096`. No se aporta información sobre el corpus de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO; esos datos corresponden a la model card original de Qwen, no incluida aquí.

La innovación técnica está en el runtime y en el esquema de cuantización. isa-lm implementa kernels de decodificación para un espectro amplio de extensiones SIMD (SSE2, AVX2, AVX-512 VNNI en x86-64; NEON, i8mm y SVE en ARM), selecciona automáticamente el build más rápido que soporte la CPU y no requiere GPU. Q4_0 y Q8_0 usan una escala f16 por cada bloque de 32 pesos, lo que da 4,5 y 8,5 bits efectivos por peso respectivamente. La variante mixta mantiene en Q8_0 las matrices de embedding, proyección de valor, proyección de salida y down-projection de las MLP, que son las más sensibles a la cuantización agresiva.

## Capacidades

- Generación de texto autoregresiva con modo de razonamiento (`<think>`) y directiva `/no_think` para desactivarlo, tal como se muestra en el ejemplo de la model card.
- Razonamiento de un solo turno y conversación multi-turno mediante la plantilla ChatML (`--chat chatml`).
- Generación de código y matemáticas básicas, heredadas de las capacidades del modelo base Qwen3-0.6B (no verificadas con benchmarks en esta publicación).
- Inferencia puramente en CPU sin dependencias externas, con binarios para Linux x86-64, AArch64, ARMv7 y Windows x86-64.
- Selección automática de build SIMD en tiempo de ejecución según las extensiones disponibles en el procesador.
- Soporte de cuantización mixta configurable por nombre de tensor (embeddings, atenciones, MLP).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni multimodalidad en esta model card.

## Casos de uso

- Despliegue en servidores sin GPU: el binario Q4_0 de 320 MiB permite servir Qwen3-0.6B en máquinas virtuales o contenedores sin acelerador, con 80,6 tok/s de decodificación en un Xeon de 4 hilos.
- Aplicaciones de escritorio y CLI: el runtime es un ejecutable único (`ml_run`) sin Python ni CUDA, adecuado para integrar un asistente de texto en herramientas de línea de comandos o aplicaciones nativas.
- Entornos embebidos y ARM: los builds para ARMv7 NEON, AArch64, i8mm y SVE permiten ejecutar el modelo en placas SBC y dispositivos ARM modernos donde no hay GPU disponible.
- Clasificación y extracción de texto por lotes: con 4096 tokens de contexto y prefill de 343 tok/s, es viable procesar documentos cortos en pipelines offline de etiquetado, resumen o extracción de entidades.
- Prototipado y evaluación de cuantizaciones: las tres variantes (Q4_0, mixta, Q8_0) con perplejidad publicada sobre wikitext-2 permiten medir el compromiso entre tamaño y calidad antes de fijar una configuración en producción.
- Pruebas de humo en CI: el reducido tamaño del repo (1,5 GB) y del binario Q4_0 (320 MiB) facilitan incluirlo en tests de integración que validen pipelines de inferencia sin depender de hardware especializado.
- Chat de bajo consumo en el borde: con `/no_think` se evita el coste de tokens de razonamiento, útil en asistentes con latencia estricta sobre CPU.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos en un GitHub runner con Intel Xeon Platinum 8573C a 4 hilos y build AVX2 de isa-lm:

| Fichero | Pesos | Tamano | Perplejidad (wikitext-2) | Prefill (tok/s) | Decode (tok/s) |
|---|---|---|---|---|---|
| `Qwen3-0.6B-Q4_0.mlb` | Q4_0 en todas las matrices | 320 MiB | 31,70 | 343 | 80,6 |
| `Qwen3-0.6B-Q4_0-mixed.mlb` | Q4_0 con `emb,v,o,down` en Q8_0 | 478 MiB | 28,81 | 286 | 53,9 |
| `Qwen3-0.6B-Q8_0.mlb` | Q8_0 en todas las matrices | 604 MiB | 27,89 | 228 | 42,9 |

Metodología: perplejidad sobre el test set de wikitext-2 con 4 chunks de 512 tokens (`tools/perplexity.py --ctx 512 --chunks 4`); velocidad con `ml_bench -n 128`, 128 tokens de prompt y 128 tokens decodificados. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica, el modelo se ejecuta en CPU y RAM del sistema. Huella aproximada de pesos: 320 MiB (Q4_0), 478 MiB (Q4_0 mixta) y 604 MiB (Q8_0), más overhead de runtime y caché KV para 4096 posiciones.
- GPU: no requiere GPU; no se documenta backend CUDA, ROCm ni Metal.
- CPU x86-64: desde SSE2 hasta AVX-512 VNNI; las mediciones publicadas usan AVX2 con 4 hilos.
- CPU ARM: desde ARMv7 NEON hasta AArch64 con i8mm y SVE.
- Cabe en cualquier equipo de consumo con al menos ~1 GB de RAM libre para la variante Q4_0; no se especifican mínimos oficiales.
- Despliegue: exclusivamente mediante el runtime isa-lm (versión 0.5.0 o posterior), con binarios `ml_run` para Linux x86-64, AArch64, ARMv7 y Windows x86-64. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.mlb` es propietario.
- Latencia y throughput: 343 tok/s de prefill y 80,6 tok/s de decode para Q4_0 en el hardware de referencia; 286/53,9 para la mixta y 228/42,9 para Q8_0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-0.6B-isa-lm (esta ficha) | 0,6 B | 4096 | `.mlb` / isa-lm (CPU) | Apache 2.0 | Cuantización Q4_0/Q8_0, perplejidad publicada en wikitext-2 |
| Qwen/Qwen3-0.6B (original) | 0,6 B | no disponible en esta ficha | safetensors / transformers, vLLM, etc. | Apache 2.0 | Pesos sin cuantizar, requiere framework Python o GPU |
| Conversiones GGUF de Qwen3-0.6B (p. ej. para llama.cpp) | 0,6 B | no disponible en esta ficha | GGUF / llama.cpp, Ollama | Apache 2.0 | Ecosistema más amplio y soporte de GPU; no comparable en métricas con los datos disponibles |

No se dispone de datos de benchmarks comunes que permitan una comparación cuantitativa de calidad frente a otras cuantizaciones del mismo modelo base.

## Limitaciones y advertencias

- Modelo de 0,6 B parámetros: capacidad de razonamiento y conocimiento factual limitada; alta probabilidad de alucinación en preguntas abiertas o especializadas.
- La perplejidad en wikitext-2 empeora de 27,89 (Q8_0) a 31,70 (Q4_0), una degradación medible que conviene evaluar por tarea antes de elegir la variante más agresiva.
- Solo se documentan 4096 posiciones de contexto; no se ha validado el comportamiento más allá de esa longitud.
- No hay información sobre idiomas soportados en esta publicación; las capacidades multilingües dependen del modelo base y no están verificadas aquí.
- El formato `.mlb` es propietario de isa-lm: no se puede cargar en llama.cpp, vLLM, Ollama, TGI ni en el ecosistema transformers sin reconvertir desde los safetensors originales.
- El runtime está en versión 0.5.0 (commit `793026f`) y el proyecto tiene un solo mantenedor; la madurez y el soporte a largo plazo no están garantizados.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente de las métricas publicadas.
- Aunque la licencia es Apache 2.0 y permite uso comercial, se recomienda revisar los términos del modelo base Qwen3-0.6B y las obligaciones de atribución.
- En producción conviene fijar el build SIMD y el número de hilos, ya que el rendimiento depende fuertemente de las extensiones de la CPU anfitriona.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jonpark0/Qwen3-0.6B-isa-lm
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio isa-lm: https://github.com/JonPark0/isa-lm
- Releases de isa-lm: https://github.com/JonPark0/isa-lm/releases
- Guía de usuario (formatos Q8/Q4/mixto): https://github.com/JonPark0/isa-lm/blob/main/docs/user-guide.md#q8-q4-or-mixed
- Comparativa con llama.cpp: https://github.com/JonPark0/isa-lm/blob/main/docs/benchmarks.md
- Commit de conversión: https://github.com/JonPark0/isa-lm/commit/793026fc45e780f03413f261193c715bfb6466eb
