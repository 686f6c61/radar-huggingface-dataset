# ivp5/DeepSeek-V4.1-Flash-1017-ds4m1

## Resumen

DeepSeek-V4.1-Flash-1017-ds4m1 es una cuantización del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por el usuario ivp5. No es un modelo nuevo entrenado desde cero, sino una redistribución de los pesos del modelo base pensada para ejecutarse íntegramente en un único Apple M1 Max con 64 GB de memoria unificada, algo que el modelo original no permite por su tamaño. El autor mantiene intactos los tensores no enrutados (atención, capas densas, router y cabeza) y comprime únicamente los expertos enrutados del MoE a 2 bits, además de las tablas Engram a IQ4_NL.

La relevancia de esta ficha reside en que demuestra una vía práctica para servir un modelo MoE de gran escala en hardware de consumo de gama alta (Apple Silicon), con un motor propio (`ds4-m1`) que combina Metal, Neural Engine y streaming de expertos desde SSD. El autor reporta 48,4 tok/s de decodificación y 342,6 tok/s de prefill, con una fidelidad medida frente al modelo oficial (KL 0,118 y top-1 del 90,5% sobre cuatro sesiones de agente).

La información disponible sobre el modelo base es escasa: solo se dispone de una descripción genérica de DeepSeek-V4.1-Flash-1017 como actualización menor de DeepSeek-V4.1-Flash con mejoras en razonamiento, código, tareas agénticas y visión. No se han publicado en la información proporcionada los parámetros totales, la longitud de contexto ni la composición del dataset de entrenamiento del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con tablas Engram; detalles completos del modelo base no disponibles |
| Parametros totales | no disponible (el autor no publica el recuento del modelo base; el artefacto cuantizado ocupa 287 GB en disco) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2 bits (gate/up y down); tablas Engram en IQ4_NL; copias densas GPTQ a 4 bits; cabeza GPTQ a 2 bits; tensores pequeños en I8 |
| Idiomas soportados | no disponible |
| Licencia | MIT (igual que el modelo base) |
| Formato de pesos | GGUF (tensores no enrutados) más tres ficheros binarios propietarios del motor: `experts_gate_up_bs64.bin`, `experts_down_g32.bin`, `engram_iq4nl.bin` |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con mezcla de expertos (MoE) que, según la model card, contiene 40 capas con 384 expertos enrutados por capa, además de dos tablas Engram (una innovación de DeepSeek cuya función exacta no se detalla en la información disponible). Esta cuantización no modifica la arquitectura: conserva la atención, las capas densas, el router y la cabeza de salida en los pesos oficiales, y solo recomprime los expertos enrutados y las tablas Engram. El artefacto se distribuye en cuatro ficheros: un GGUF de 23,2 GB con todos los tensores no enrutados, dos binarios con los expertos (99,1 GB para gate+up y 53,8 GB para down) y un binario de 110,6 GB con las tablas Engram en IQ4_NL.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF o DPO. La model card del cuantizador tampoco documenta el proceso de calibración de los expertos más allá de indicar la precisión (2 bits) y el esquema de agrupación (`bs64` para gate/up, `g32` para down). La innovación técnica destacable de esta publicación es el motor `ds4-m1`, un fork de `ds4` de antirez con parches para Metal, Neural Engine y streaming de expertos desde SSD, que incluye además un drafter especulativo entrenado y una caché de 38 GiB para los expertos enrutados. El motor mantiene en memoria todo lo que no son expertos y va trayendo los expertos desde el SSD según los solicita el router.

## Capacidades

- Generación de texto y razonamiento: el modelo base se describe como una actualización con mejoras en razonamiento, aunque no se aportan cifras concretas en la información disponible.
- Generación de código: el cuantizador reporta 15/15 tareas de agente de programación resueltas (módulos Python con suites de pytest), con 822 tokens y 20,1 segundos por solución.
- Tareas agénticas multi-paso: el modelo base se describe con mejoras en tareas agénticas y el cuantizador lo evalúa sobre sesiones de agente reales.
- Modo thinking: la model card distingue explícitamente entre tokens de "thinking" y de "answer" al medir la fidelidad, lo que confirma que el modelo conserva el modo de razonamiento extendido.
- Tool calling / function calling: la model card menciona que el cuantizado conserva "thinking and tool calls".
- Visión: la descripción del modelo base en ModelScope y Fireworks indica mejoras en benchmarks visuales, por lo que se asume capacidad multimodal, aunque no se detalla en la información disponible.
- Capacidades multilingües: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Desarrollo de agentes de código en local sobre Apple Silicon: el modelo resuelve tareas de programación con suites de pruebas (15/15 en la suite del autor) a 48 tok/s, suficiente para iterar sobre módulos Python sin depender de APIs externas.
- Prototipado de asistentes con razonamiento extendido en un portátil o estación de trabajo M1 Max: el modo thinking permite tareas de análisis multi-paso manteniendo todo el cómputo en local.
- Evaluación de cuantizaciones y motores de inferencia: la model card publica métricas de fidelidad (KL, top-1, top-5) frente a referencias Q8_0 y frente a otras cuantizaciones (SAGE REXL3, Unsloth UD-IQ2_XXS), lo que lo convierte en un banco de pruebas útil para investigar compresión de MoE.
- Investigación sobre streaming de expertos desde SSD: el motor `ds4-m1` y los binarios de expertos separados permiten estudiar el impacto del ancho de banda de disco y de la caché en la latencia de decodificación.
- Automatización de tareas de refactorización y generación de tests en pipelines locales: el soporte de tool calls y el modo agéntico permiten encadenar edición de ficheros, ejecución de tests y corrección de errores.
- Despliegue de un asistente privado sin conexión: al ejecutarse íntegramente en local con licencia MIT, es adecuado para entornos con requisitos de confidencialidad donde no se permite enviar datos a servicios en la nube.
- Experimentación con decodificación especulativa: el drafter entrenado incluido en el GGUF permite medir la ganancia de la decodificación especulativa en hardware Apple.

## Benchmarks y rendimiento

Rendimiento del motor en un Apple M1 Max de 64 GB (datos del autor):

| Carga de trabajo | Decodificación | Prefill | Reloj de GPU |
|---|---:|---:|---:|
| 16 tareas de agente de código seguidas (~7 min) | 48,4 tok/s | 342,6 tok/s | 1.061 MHz |
| Las mismas, tareas 5-15 en una segunda ejecución | 48,6 tok/s | 342,2 tok/s | 1.073 MHz |

Fidelidad de los expertos enrutados frente a SAGE REXL3 1.55 bpw (modelo oficial FP8/FP4 como profesor, 11.263 posiciones de 8 sesiones de agente):

| Expertos enrutados | KL medio | KL p50 | KL p90 | Top-1 |
|---|---:|---:|---:|---:|
| ds4m1 (2 bits gate/up + 2 bits down) | 0,0467 | 0,00337 | 0,132 | 92,8% |
| SAGE REXL3 1.55 bpw | 0,0906 | 0,00333 | 0,271 | 89,9% |

Fidelidad del modelo completo frente a la referencia Q8_0 GGUF (cuatro sesiones de agente de código, con separación entre tokens de thinking y de respuesta):

| Sesión | Posiciones | KL medio | KL p50 | Top-1 | Top-5 | Thinking KL / top-1 | Answer KL / top-1 |
|---|---:|---:|---:|---:|---:|---|---|
| calc | 818 | 0,118 | 0,00088 | 89,9% | 69,8% | 0,212 / 81,8% | 0,039 / 96,6% |
| textutil | 536 | 0,053 | 0,00006 | 97,4% | 63,8% | 0,255 / 86,7% | 0,020 / 99,1% |
| roman (thinking largo) | 1.254 | 0,147 | 0,01430 | 88,4% | 72,2% | 0,181 / 85,3% | 0,082 / 94,6% |
| matrix (thinking largo) | 777 | 0,116 | 0,00083 | 89,6% | 70,1% | 0,198 / 82,2% | 0,046 / 95,9% |
| **agregado** | **3.385** | **0,118** | | **90,5%** | **69,8%** | | |

Tokens y tiempo por solución correcta:

| Conjunto de tareas | Resueltas | Tokens por solución | Segundos por solución |
|---|---:|---:|---:|
| 15 tareas de agente de código (módulos Python con pytest) | 15 / 15 | 822 | 20,1 |
| Suite difícil: MMLU-Pro 30, OlympiadBench 10, LiveBench 5, NIST Juliet 5 | en ejecución | | |

El autor indica explícitamente que no ha reejecutado las suites de benchmarks de DeepSeek (HLE, Terminal-Bench, SWE, etc.) porque cada una tarda días a 48 tok/s. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: el motor reserva unos 53 GiB en un M1 Max de 64 GB; el autor recomienda cerrar otras aplicaciones grandes. La caché de expertos ocupa 38 GiB y el resto de tensores permanece en memoria.
- Almacenamiento: 287 GB de descarga en cuatro ficheros; el primer arranque descomprime 13 GB de tensores pequeños en `~/Library/Caches/ds4m1/` (configurable con `DS4M1_CACHE`).
- GPU recomendadas: Apple M1 Max con 64 GB como plataforma de referencia. No se documenta soporte para GPU NVIDIA, AMD ni para otros tamaños de memoria unificada en la información disponible.
- GPU de consumo: no cabe en GPUs de consumo convencionales (RTX 4090, 24 GB) por el tamaño del artefacto; la viabilidad depende del streaming desde SSD y de la memoria unificada de Apple Silicon.
- Opciones de despliegue: exclusivamente el motor `ds4-m1` (fork de `ds4` de antirez con parches de Metal, Neural Engine y streaming de SSD), invocado como `./ds4-agent -m ds4m1/DeepSeek-V4.1-Flash-1017-ds4m1.gguf`. No se documenta compatibilidad con llama.cpp, vLLM, Ollama ni TGI.
- Latencia y throughput: 48,4 tok/s de decodificación y 342,6 tok/s de prefill en M1 Max de 64 GB; 20,1 segundos por solución en la suite de 15 tareas de código.
- Muestreo recomendado por el autor: temperature 1,0, top-p 1,0, min-p 0,2. Los resultados varían entre ejecuciones porque el router prefiere expertos ya presentes en la caché.

## Comparativa con modelos similares

| Modelo | Plataforma | Descarga | Decodificación | Prefill | Fidelidad (KL / top-1) | Licencia |
|---|---|---|---:|---:|---|---|
| ds4m1 (esta ficha) | M1 Max 64 GB | 287 GB | 48,4 tok/s | 342,6 tok/s | 0,047 / 92,8% (expertos, mismo test) | MIT |
| vcruz305 SAGE 1.55 bpw (EXL3/REXL3) | GPU clase 128 GB (108,5 GiB residentes) | 320 GB | no indicado | no indicado | REXL3: 0,091 / 89,9% (expertos, mismo test); EXL3: 0,088 wiki1100, 0,098 e2e_eval; REXL3: 0,051 e2e_eval | no disponible |
| Unsloth UD-IQ2_XXS (GGUF) | llama.cpp | 300,5 GB | no indicado | no indicado | 0,203 wiki1100, 0,142 long17k; top-1 90,5% wiki1100, 91,2% long17k | no disponible |

La comparación de la fila "mismo test" sustituye únicamente los expertos enrutados, manteniendo atención, capas densas, router y cabeza en los pesos oficiales, por lo que mide directamente la calidad del codec de expertos. No se dispone de comparativas frente a otros modelos de la misma categoría (por ejemplo, otros MoE de gran escala servidos en hardware de consumo) en la información proporcionada.

## Limitaciones y advertencias

- El artefacto no es un modelo autónomo estándar: requiere el motor `ds4-m1` y tres ficheros binarios propietarios además del GGUF; no funciona con llama.cpp, vLLM, Ollama ni TGI.
- El tamaño de descarga (287 GB) y la caché en disco (38 GiB de expertos más 13 GB de tensores pequeños) imponen requisitos de almacenamiento considerables.
- La fidelidad es menor que la del modelo oficial: KL agregado de 0,118 y top-1 del 90,5% frente a Q8_0 en cuatro sesiones de agente, con degradación mayor en tokens de thinking (KL de hasta 0,255) que en tokens de respuesta.
- Los resultados varían entre ejecuciones porque el router prioriza expertos ya cacheados; el autor lo advierte explícitamente y recomienda no interpretar una única ejecución como representativa.
- No se han reejecutado las suites de benchmarks oficiales de DeepSeek (HLE, Terminal-Bench, SWE); la suite difícil (MMLU-Pro, OlympiadBench, LiveBench, NIST Juliet) figura como "en ejecución" en la model card.
- El autor no documenta sesgos conocidos, riesgos de alucinación específicos ni limitaciones de idioma del modelo base en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de las cifras reportadas.
- La licencia MIT se hereda del modelo base, pero el autor pide citar a DeepSeek; conviene verificar los términos del modelo original antes de un uso comercial.
- El modelo base se describe como una actualización menor de DeepSeek-V4.1-Flash, sin que se detallen en la información disponible los cambios concretos ni las métricas de las mejoras anunciadas.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/ivp5/DeepSeek-V4.1-Flash-1017-ds4m1
- Modelo base en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Modelo base en ModelScope: https://modelscope.ai/models/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Ficha del modelo base en Fireworks AI: https://fireworks.ai/models/deepseek-ai/deepseek-v4p1-flash-1017
- Motor ds4-m1: https://github.com/ivp5/ds4-m1
- Motor ds4 original de antirez: https://github.com/antirez/ds4
