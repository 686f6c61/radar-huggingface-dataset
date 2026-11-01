# jonpark0/Qwen2.5-0.5B-Instruct-isa-lm

## Resumen

Qwen2.5-0.5B-Instruct-isa-lm es una conversión cuantizada del modelo Qwen2.5-0.5B-Instruct de Alibaba Qwen, publicada por el desarrollador jonpark0 para el runtime isa-lm. No se trata de un modelo nuevo entrenado desde cero, sino de una redistribución de los pesos originales en formatos propietarios (`.mlb`) optimizados para ejecución en CPU sin GPU. El modelo base es un transformer decoder-only de 0,5 mil millones de parámetros con 4096 posiciones de contexto, afinado para instrucciones y conversación.

La relevancia de esta ficha reside en el runtime que acompaña a los pesos: isa-lm es un motor en C11 sin dependencias externas que aprovecha las extensiones SIMD del procesador, desde SSE2 en x86-64 hasta AVX-512 VNNI, y desde ARMv7 NEON hasta i8mm y SVE en ARM. Esto permite desplegar un modelo de chat funcional en hardware muy modesto, incluyendo servidores sin acelerador, placas ARM y equipos de escritorio convencionales.

El repositorio ocupa 1,2 GB e incluye tres variantes de cuantización (Q4_0 completa, Q4_0 mixta con capas críticas en Q8_0 y Q8_0 completa) junto con el tokenizador en formato `.mlt`. La licencia Apache 2.0 del modelo original se mantiene, lo que facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros totales | 0,5 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 posiciones |
| Tipos de cuantizacion | Q4_0 (4,5 bits/peso), Q4_0 mixta con `emb,v,o,down` en Q8_0, Q8_0 (8,5 bits/peso) |
| Idiomas soportados | no disponible (la model card no detalla idiomas; hereda los del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlb` (formato propietario de isa-lm); tokenizador en `.mlt` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-0.5B-Instruct, un transformer decoder-only con atención multi-cabeza estándar, entrenado por Alibaba Qwen y posteriormente afinado con instrucciones. La model card de esta conversión no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación (RLHF, DPO) empleadas en el modelo original; esa información debe consultarse en la ficha oficial de Qwen.

La aportación técnica de esta publicación es el proceso de conversión y el runtime de inferencia. Los pesos se cuantizan a Q4_0 o Q8_0 manteniendo una escala en formato f16 por cada bloque de 32 pesos, lo que resulta en 4,5 y 8,5 bits efectivos por peso respectivamente. La variante mixta aplica Q8_0 a las matrices de embedding, proyección de valor (`v`), proyección de salida (`o`) y proyección descendente del FFN (`down`), dejando el resto en Q4_0; esta combinación reduce la perplejidad de 21,73 a 20,00 a costa de aumentar el tamaño de 265 MiB a 391 MiB. La conversión se realizó con isa-lm 0.5.0 (commit `622b7f4`) el 1 de noviembre de 2026 a partir de los safetensors originales.

## Capacidades

- Generación de texto conversacional y respuesta a instrucciones en formato chat (el runtime incluye una plantilla `--chat qwen`).
- Razonamiento básico y respuesta a preguntas factuales simples; la model card muestra el ejemplo "The capital of France is Paris." ante una pregunta directa.
- Soporte multilingüe heredado del modelo base Qwen2.5, aunque la model card de esta conversión no enumera idiomas concretos.
- Ejecución en CPU pura mediante isa-lm, con selección automática del build SIMD más rápido disponible (SSE2, AVX2, AVX-512 VNNI, ARM NEON, i8mm, SVE).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en esta conversión.

## Casos de uso

- Asistente conversacional en servidores sin GPU: con 265 MiB en Q4_0 y 153,9 tok/s de decodificación en un EPYC de 4 hilos, el modelo puede atender chat de baja concurrencia en infraestructura CPU-only sin coste de acelerador.
- Despliegue en dispositivos ARM y sistemas embebidos: los builds para ARMv7 NEON, AArch64, i8mm y SVE permiten ejecutar el modelo en placas de desarrollo, routers de gama alta o mini-PC ARM con memoria limitada.
- Clasificación y extracción de información en pipelines por lotes: el throughput de prefill (709 tok/s en Q4_0) hace viable procesar grandes volúmenes de texto corto para etiquetado, resumen o extracción de entidades en entornos de CI.
- Prototipado rápido y pruebas de integración: al ser un binario C11 sin dependencias, encaja en imágenes de contenedor mínimas y en entornos con restricciones de instalación de Python o CUDA.
- Aplicaciones de escritorio y herramientas locales: el tamaño reducido (265-501 MiB) permite empaquetar el modelo dentro de una aplicación de escritorio Windows x86-64 o Linux sin requerir descarga en tiempo de ejecución.
- Evaluación comparativa de cuantizaciones: las tres variantes publicadas (Q4_0, Q4_0 mixta, Q8_0) con perplejidad y velocidad medidas permiten estudiar el compromiso precisión/rendimiento en CPU para un mismo modelo base.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a mediciones del propio autor en un GitHub runner (AMD EPYC 9V45, 96 núcleos, 4 hilos, build `avx2`), con perplejidad sobre wikitext-2 (4 fragmentos de 512 tokens) y velocidad con `ml_bench -n 128` (128 tokens de prompt y 128 decodificados).

| Variante | Tamano | Perplejidad | Prefill (tok/s) | Decode (tok/s) |
|---|---|---|---|---|
| Q4_0 | 265 MiB | 21,73 | 709 | 153,9 |
| Q4_0 mixta (`emb,v,o,down` en Q8_0) | 391 MiB | 20,00 | 601 | 107,0 |
| Q8_0 | 501 MiB | 19,04 | 496 | 81,5 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU. La memoria RAM necesaria es aproximadamente el tamaño del fichero más el overhead del runtime: unos 265 MiB para Q4_0, 391 MiB para Q4_0 mixta y 501 MiB para Q8_0.
- GPU recomendadas: no se requiere GPU; isa-lm no utiliza aceleradores gráficos.
- Cabe en cualquier CPU de consumo moderna: x86-64 con SSE2 como mínimo, con mejor rendimiento en AVX2 o AVX-512 VNNI; ARM desde ARMv7 NEON hasta i8mm y SVE.
- Opciones de despliegue: binarios oficiales de isa-lm 0.5.0 o superior para Linux x86-64, AArch64, ARMv7 y Windows x86-64, invocados mediante `ml_run` con los ficheros `.mlb` y `tokenizer.mlt`. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: según las mediciones del autor, 153,9 tok/s de decodificación y 709 tok/s de prefill con Q4_0 en un EPYC de 4 hilos; el rendimiento escalará con el número de hilos y el conjunto de instrucciones disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct-isa-lm | 0,5 B | 4096 | `.mlb` (isa-lm) | Apache 2.0 | Cuantizado Q4_0/Q8_0, CPU-only, runtime C11 |
| Qwen2.5-0.5B-Instruct (original) | 0,5 B | 32 768 (según ficha oficial de Qwen) | safetensors | Apache 2.0 | Pesos completos en bf16/fp16, requiere framework Python |
| Modelos GGUF de 0,5 B para llama.cpp | 0,5 B | depende del modelo base | GGUF | según modelo base | Alternativa de ejecución en CPU con ecosistema más amplio |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo base tiene solo 0,5 mil millones de parámetros; su capacidad de razonamiento, conocimiento factual y seguimiento de instrucciones complejas es limitada en comparación con modelos de mayor tamaño.
- Riesgo de alucinación elevado en preguntas factuales, fechas, cifras y referencias, inherente a un modelo de este tamaño.
- La model card no documenta sesgos conocidos ni evaluación de seguridad; deben asumirse los sesgos del corpus de entrenamiento de Qwen2.5.
- El contexto está limitado a 4096 posiciones en esta conversión (frente a los 32 768 del modelo base original), lo que restringe tareas de contexto largo.
- No se enumeran idiomas soportados en la ficha de esta conversión; el rendimiento multilingüe debe validarse empíricamente antes de usarlo en producción.
- El formato `.mlb` es propietario de isa-lm y no es compatible con frameworks estándar (transformers, llama.cpp, vLLM); la integración queda atada al runtime del autor.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base Qwen2.5-0.5B-Instruct en su ficha oficial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de los resultados publicados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jonpark0/Qwen2.5-0.5B-Instruct-isa-lm
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Runtime isa-lm: https://github.com/JonPark0/isa-lm
- Releases de isa-lm: https://github.com/JonPark0/isa-lm/releases
- Guía de usuario (formatos Q8/Q4/mixto): https://github.com/JonPark0/isa-lm/blob/main/docs/user-guide.md#q8-q4-or-mixed
- Comparativa con llama.cpp: https://github.com/JonPark0/isa-lm/blob/main/docs/benchmarks.md
- Commit de conversión: https://github.com/JonPark0/isa-lm/commit/622b7f41f392f8a2ef64837b641e62ba09cf1e4d
