# alfodaniello/Qwen3-Next-80B-A3B-Instruct-RedLite-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF de 2 bits de Qwen/Qwen3-Next-80B-A3B-Instruct, publicada por el usuario alfodaniello bajo el nombre Red Lite E3. No es un modelo entrenado desde cero: es una redistribución de precisión de un modelo existente, cuantizado a partir del Q8_0 de bartowski usando su importance matrix y llama.cpp, con un tipo de cuantización asignado tensor por tensor. El fichero único pesa 19,30 GB y mantiene exactamente el mismo tamano y los mismos tipos de tensor que el IQ2_XXS de bartowski, pero cambia la ubicación de las 11 capas de expertos que se conservan a mayor precisión.

La innovación concreta es la elección de esas 11 capas: en lugar de una regla fija, se seleccionan las capas 37 a 47, que son las que reciben más energía de entrada en la matriz de importancia (la energía de entrada de la proyección down crece de 1,3 en la capa 0 a 565 en la capa 47). Según las mediciones del autor, esto reduce la perplejidad de 16,370 a 16,216 (−0,94 %) sin aumentar el tamano ni cambiar la velocidad, ya que los tipos de tensor son los mismos.

El modelo está pensado para DwarfStar Red Lite, un runtime nativo en Metal para Apple Silicon, aunque al ser un GGUF estándar también carga en llama.cpp (requiere una compilación con soporte de Qwen3-Next). Su relevancia práctica es que permite ejecutar un modelo MoE de ~79,7 B de parámetros totales en Macs con 24 GiB o más de memoria unificada, a costa de una cuantización muy agresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con proyecciones DeltaNet y atención (arquitectura híbrida del modelo base); 48 capas indexadas de 0 a 47 |
| Parametros totales | 79.674.391.296 (~79,7 B) |
| Parametros activos | ~3 B (deducido de la nomenclatura A3B del modelo base; el dato exacto no figura en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla por tensor: IQ2_XS, IQ1_M, IQ2_XXS, Q2_K, Q4_K, Q5_K, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero único, 19,30 GB, SHA-256 b62067d6f28c52c07f8fca55196e8a63916264e40c6641f6a8d2e710768d291c) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-Next-80B-A3B-Instruct, un MoE del equipo Qwen con arquitectura híbrida: la model card de esta cuantización menciona explícitamente proyecciones DeltaNet y de atención, además de expertos enrutados y expertos compartidos, distribuidos en al menos 48 capas. Los detalles completos de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.

Lo que sí documenta esta ficha es el proceso de cuantización, que es el verdadero trabajo técnico del repositorio. El autor partió del Q8_0 de bartowski, su fichero imatrix.gguf y la misma versión de llama.cpp, y aplicó un tipo por tensor mediante un script (scripts/dev/quant_mix.py) que invoca llama-quantize. Todos los tensores no pertenecientes a expertos conservan el tipo que tienen en el fichero de bartowski: proyecciones de atención y DeltaNet en IQ2_XXS / Q4_K / Q6_K / Q8_0, expertos compartidos en Q6_K, embedding de tokens en Q2_K y cabeza de salida en Q5_K. En los expertos enrutados, la diferencia está en la ubicación de los 11 tensores en IQ2_XS (2,31 bits por peso): bartowski los situaba en las capas 0-5 y 43-47, mientras que este fichero los sitúa en las capas 37-47, dejando las otras 37 capas en IQ1_M (1,75 bits). Se probaron dos mezclas alternativas que resultaron peores (IQ2_XS en capas 0-2 y 40-47, con perplejidad 16,326 y t = −1,28; IQ2_XS en todas las proyecciones down con gate/up en IQ1_M, un 3 % más grande y perplejidad 16,423).

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como text-generation y conversational, y deriva de un modelo instruct del equipo Qwen.
- Ejecución local en Apple Silicon: soportado de forma nativa por el runtime DwarfStar Red Lite en Macs con 24 GiB o más de memoria unificada.
- Ejecución en llama.cpp: al ser un GGUF estándar, carga con llama-cli en compilaciones con soporte de Qwen3-Next.
- Comprobaciones de paridad de runtime: el autor verifica este fichero contra una versión fijada de llama.cpp en logits, tokens greedy y contexto largo, y supera la suite de regresión de Red Lite (52/52) en un M4 Max de 48 GiB con todos los expertos residentes.
- Capacidades específicas del modelo base (código, matemáticas, tool calling, agentes, multilingüismo, modo thinking, visión o audio): no disponibles en la información proporcionada. No se documentan en la model card de esta cuantización.

## Casos de uso

- Inferencia local en Mac Apple Silicon: con un único fichero de 19,30 GB, el modelo se coloca en el directorio models/ de Red Lite y se ejecuta con ./bin/redlite chat, lo que permite conversar con un MoE de ~79,7 B de parámetros en equipos de 24 GiB o más de memoria unificada.
- Despliegue sin conexión y con datos sensibles: al ejecutarse íntegramente en local sobre Metal o llama.cpp, no requiere enviar prompts a una API externa, lo que encaja en escenarios donde la política de privacidad impide usar servicios en la nube.
- Uso dentro de llama.cpp en pipelines existentes: mediante llama-cli -m Qwen3-Next-80B-A3B-Instruct-RedLite-E3.gguf -cnv, se puede integrar en herramientas que ya hablan GGUF sin adoptar el runtime Red Lite.
- Investigación sobre cuantización guiada por importancia: el repositorio documenta la metodología completa (imatrix, selección de capas por energía de entrada, script quant_mix.py), por lo que sirve como caso de estudio reproducible para diseñar mezclas de precisión por tensor.
- Evaluación comparativa de esquemas de cuantización: sus mediciones de perplejidad sobre un corpus fijo de 111 fragmentos a contexto 512 y su test pareado por fragmento (t = −3,91) proporcionan una línea base para comparar otras mezclas al mismo tamano.
- Pruebas de paridad y regresión de runtimes: el fichero se usa como referencia para validar logits, tokens greedy y comportamiento en contexto largo frente a una versión fijada de llama.cpp, con una suite de 52 pruebas.
- Ahorro de memoria frente a cuantizaciones mayores: para quien necesite el modelo base en un equipo con memoria limitada, este fichero ocupa 19,30 GB y mantiene los mismos tipos de tensor que la alternativa de bartowski, por lo que no penaliza en velocidad según el autor.

## Benchmarks y rendimiento

Los únicos datos publicados son de perplejidad y de coincidencia con la API de Qwen, medidos por el autor. No hay resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros).

| Metrica | Esquema de bartowski, reproducido | Este fichero (Red Lite E3) |
|---|---:|---:|
| Tamano | 19,30 GB | 19,30 GB |
| Perplejidad (corpus fijo de 111 fragmentos, contexto 512) | 16,370 | 16,216 (−0,94 %) |
| Test pareado por fragmento frente al esquema reproducido | — | t = −3,91; mejor en 72 de 111 fragmentos |
| Respuestas greedy idénticas a la API de Qwen (235 prompts) | 2 | 4 |
| Porcentaje medio de palabras coincidentes con la API desde el inicio | 12,6 % | 13,6 % |

Mezclas alternativas evaluadas por el autor, con peor resultado:

| Mezcla | Perplejidad | Test pareado |
|---|---:|---:|
| IQ2_XS en capas 0-2 y 40-47 | 16,326 | t = −1,28 |
| IQ2_XS en todas las proyecciones down, gate/up en IQ1_M | 16,423 | no disponible (un 3 % más grande) |

## Requisitos de hardware

- Tamano de pesos: 19,30 GB en un único fichero GGUF, más el espacio necesario para caché KV y overhead del runtime.
- Apple Silicon: DwarfStar Red Lite está pensado para Macs con 24 GiB de memoria unificada o más; el autor ha validado el fichero en un M4 Max de 48 GiB con todos los expertos residentes.
- GPU consumer (NVIDIA/AMD) y VRAM concreta: no disponible. El modelo puede cargarse en llama.cpp si la compilación soporta Qwen3-Next, pero la información proporcionada no especifica requisitos de VRAM ni GPUs compatibles.
- GPU de datacenter (A100, H100): no disponible.
- Opciones de despliegue: DwarfStar Red Lite (./bin/redlite chat) y llama.cpp (llama-cli -m ... -cnv, compilación con soporte Qwen3-Next).
- vLLM, TGI, Ollama: no disponible.
- Latencia y throughput: no disponibles como cifras. El autor afirma que el fichero tiene "el mismo tamano y la misma velocidad" que el esquema de bartowski, porque los tipos de tensor son idénticos y solo cambia su ubicación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad (misma medicion) | Licencia | Formato |
|---|---|---|---|---|---|
| Este fichero (Red Lite E3, alfodaniello) | 79,7 B totales / ~3 B activos | no disponible | 16,216 | Apache 2.0 | GGUF, 19,30 GB |
| Qwen_Qwen3-Next-80B-A3B-Instruct-GGUF, esquema IQ2_XXS reproducido (bartowski) | 79,7 B totales / ~3 B activos | no disponible | 16,370 | Apache 2.0 | GGUF, 19,30 GB |
| Mezcla alternativa con IQ2_XS en capas 0-2 y 40-47 (mismo autor) | 79,7 B totales / ~3 B activos | no disponible | 16,326 | Apache 2.0 | GGUF, mismo tamano |
| Mezcla alternativa con IQ2_XS en todas las proyecciones down (mismo autor) | 79,7 B totales / ~3 B activos | no disponible | 16,423 | Apache 2.0 | GGUF, un 3 % más grande |

No se dispone de comparaciones con otras familias de modelos de tamano similar en la información proporcionada.

## Limitaciones y advertencias

- Cuantización de clase 2 bits: los expertos enrutados están en IQ2_XS (2,31 bits por peso) o IQ1_M (1,75 bits), lo que implica una pérdida de calidad sustancial respecto al modelo original.
- Coincidencia baja con el modelo sin cuantizar: solo 4 de 235 respuestas greedy son idénticas a la API de Qwen, y la coincidencia media de palabras desde el inicio es del 13,6 %. El modelo no reproduce fielmente el comportamiento del original.
- Medición limitada: la calidad se evaluó por perplejidad sobre un único corpus y por acuerdo con la API, no con benchmarks de tareas. Solo se compararon cuatro mezclas de capas y a un único tamano, tal como reconoce el propio autor.
- Trazabilidad de la fecha: el repositorio figura creado y actualizado el 3 de octubre de 2026, dato que conviene verificar antes de citarlo.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.
- Requisito de runtime: en llama.cpp es necesaria una compilación con soporte de Qwen3-Next; versiones antiguas no cargarán el fichero.
- Soporte de idiomas, contexto máximo real y capacidades específicas del modelo base: no disponibles en la información proporcionada, por lo que no se pueden garantizar en producción.
- Riesgo de alucinación: inherente a un modelo instruct de este tamano y agravado por la cuantización agresiva; no hay evaluaciones de fidelidad factual en la documentación.
- Licencia: Apache 2.0, heredada del modelo base de Qwen, por lo que el uso comercial está permitido; los créditos corresponden al equipo Qwen (modelo), a bartowski (Q8_0, importance matrix y diseño de referencia IQ2_XXS) y a llama.cpp (cuantizador).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/alfodaniello/Qwen3-Next-80B-A3B-Instruct-RedLite-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct
- Cuantizaciones de referencia de bartowski: https://huggingface.co/bartowski/Qwen_Qwen3-Next-80B-A3B-Instruct-GGUF
- Runtime DwarfStar Red Lite: https://github.com/alfofire2/dwarfstar-red-lite
- Documentación de la mezcla de cuantización: https://github.com/alfofire2/dwarfstar-red-lite/blob/main/docs/REDLITE_DEV54_QUANT_MIX.md
- llama.cpp: https://github.com/ggml-org/llama.cpp
