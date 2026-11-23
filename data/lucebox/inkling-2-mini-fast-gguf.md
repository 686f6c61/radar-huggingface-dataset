# Lucebox/Inkling-2-Mini-Fast-GGUF

## Resumen

Inkling 2 Mini Fast es una cuantización GGUF optimizada del modelo Inkling 2 Mini desarrollado por Thinking Machines Lab, un transformer con arquitectura MoE (mezcla de expertos) de tipo "looped" con 26.070.385.152 parámetros totales. La ficha corresponde al repositorio publicado por Lucebox, que distribuye los pesos cuantizados junto con un especulador oficial DSpark (`mtp.safetensors`) para habilitar decodificación especulativa.

El objetivo declarado del autor es ofrecer respuestas de extremo a extremo un 2,01x más rápidas con una precisión un 3,8% superior respecto al checkpoint GGUF de referencia, sin requerir cambios en el prompt, la plantilla ni el runtime. Los pesos están pensados para `luce_server` y `llama.cpp`, con soporte explícito de ROCm y despliegue en GPUs AMD Radeon AI PRO R9700 y Strix Halo.

La relevancia del modelo reside en su combinación de cuantización agresiva (hasta 14,0 GiB en IQ4_NL completo) con preservación de precisión y aceleración por decodificación especulativa, lo que permite ejecutar un MoE de 26B en GPUs de 16-32 GB. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE "looped" (inkling2_loop) |
| Parametros totales | 26.070.385.152 (26,07B) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 262.144 tokens (262K, según la model card) |
| Tipos de cuantizacion | UD-Q8_K_XL (Q8 dinámico), IQ4_NL con atención/coda/head en Q8_0, IQ4_NL completo |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (más `mtp.safetensors` para el especulador DSpark) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos y estructura "looped" (iterativa), identificado en los tags como `inkling2_loop`. Los detalles concretos sobre el número de expertos, la composición del dataset, el número de tokens de entrenamiento y las etapas de alineación (RLHF/DPO) no están disponibles en la información proporcionada; la model card del repositorio de Lucebox se centra en la cuantización y el rendimiento, no en el entrenamiento del modelo original.

La innovación técnica destacable de esta ficha es la integración del especulador oficial DSpark (`mtp.safetensors`, 607 MiB), que habilita decodificación especulativa automática en `luce_server`. Según los datos del autor, esta combinación reduce los tokens de razonamiento un 74% en HumanEval y eleva el throughput de 126,0 a 141,9 tok/s, manteniendo una divergencia KL de 0,023 nats y un 93,4% de acuerdo Top-1 en prosa genérica retenida. Las cuantizaciones emplean `imatrix` para preservar la distribución general.

## Capacidades

- Generación de texto conversacional y razonamiento conciso (tag `concise-reasoning`).
- Razonamiento matemático: MATH-500 con 33/40 (82,5%) en la build IQ4_NL.
- Generación de código: HumanEval con 38/40 (95,0%) en ejecución.
- Conocimiento general y razonamiento de opción múltiple: MMLU-Pro con 43/50 (86,0%).
- Decodificación especulativa integrada mediante el especulador DSpark.
- Compatibilidad con endpoints (`endpoints_compatible`) para despliegue como servicio.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Soporte de tool calling, agentes o visión: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento matemático asistido: el modelo resuelve problemas de nivel MATH-500 con un 82,5% de acierto y sin truncamientos en la build IQ4_NL, adecuado para tutores o validadores de ejercicios.
- Generación y revisión de código: con un 95,0% en HumanEval y ejecución verificada, puede integrarse en pipelines de CI/CD para generar tests o parchear funciones.
- Evaluación de conocimiento general: MMLU-Pro con 86,0% lo hace útil para clasificación y respuesta de opción múltiple en dominios técnicos.
- Asistente conversacional de baja latencia: la decodificación especulativa DSpark (141,9 tok/s en HumanEval) y el razonamiento conciso permiten respuestas rápidas en chat multi-turno.
- Despliegue en hardware de consumo: la build IQ4_NL-16GB (14,0 GiB) cabe en GPUs de 16 GB, habilitando inferencia local en estaciones de trabajo.
- Servicio con contexto largo: hasta 262K tokens de contexto permiten procesar documentos extensos o historiales largos en un único prompt.
- Inferencia en GPUs AMD: el soporte ROCm y la configuración dual-GPU (R9700 + Strix Halo) permiten desplegar el modelo en entornos sin NVIDIA.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos en una AMD Radeon AI PRO R9700 con `luce_server`, DSpark activado, `temp=0.0` y sin cambios de prompt, sobre 130 preguntas de test de Hugging Face:

| Benchmark | Baseline (IQ4_NL) | Inkling 2 Mini Fast (IQ4_NL) | Δ precisión | Δ tokens | Aceleración |
|---|---:|---:|---:|---:|---:|
| MATH-500 (40) | 31/40 (77,5%) · 210,1 s | 33/40 (82,5%) · 106,3 s | +5,0% | -50,0% | 1,98x |
| HumanEval (40, exec) | 38/40 (95,0%) · 186,5 s | 38/40 (95,0%) · 84,5 s | 0,0% | -49,0% | 2,21x |
| MMLU-Pro (50, 10-way) | 40/50 (80,0%) · 271,1 s | 43/50 (86,0%) · 141,9 s | +6,0% | -51,3% | 1,91x |
| Combinado (130) | 109/130 (83,8%) · 667,7 s | 114/130 (87,7%) · 332,8 s | +3,8% | -50,2% | 2,01x |

Datos adicionales: HumanEval DSpark pasó de 126,0 a 141,9 tok/s con una reducción del 74% en tokens de pensamiento; los truncamientos en MATH-500 bajaron de 5/40 a 0/40; la divergencia KL en prosa retenida es de 0,023 nats (93,4% de acuerdo Top-1).

## Requisitos de hardware

- VRAM estimada: 21,3 GiB (UD-Q8_K_XL), 16,4 GiB (IQ4_NL con atención/coda/head en Q8_0), 14,0 GiB (IQ4_NL completo).
- GPU recomendadas: AMD Radeon AI PRO R9700 (32 GB), AMD Strix Halo; configuración dual-GPU R9700 + Strix Halo.
- GPU de consumo: la build IQ4_NL-16GB cabe en GPUs de 16 GB; la UD-Q8_K_XL requiere 24-32 GB.
- Opciones de despliegue: `luce_server` (con soporte ROCm y decodificación especulativa DSpark) y `llama.cpp`.
- Contexto máximo: hasta 262K tokens en una R9700 según el autor; ejemplo de arranque con `--max-ctx 65536`.
- Throughput: 141,9 tok/s en HumanEval con DSpark (R9700, IQ4_NL); 126,0 tok/s sin DSpark.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión (combinado 130) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Inkling 2 Mini Fast (IQ4_NL) | 26,07B (MoE) | 262K | 87,7% | Apache 2.0 | GGUF en HF |
| Inkling 2 Mini baseline (IQ4_NL) | 26,07B (MoE) | 262K | 83,8% | Apache 2.0 | GGUF en HF |
| Otros modelos de 26B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks frente a modelos de otros autores en la información proporcionada; la única comparación publicada es contra el propio checkpoint baseline del mismo modelo base.

## Limitaciones y advertencias

- Idioma: solo inglés declarado; no hay soporte multilingüe verificado.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Alucinación: no hay evaluación específica de tasas de alucinación publicada.
- Rendimiento dependiente del hardware: los benchmarks se midieron exclusivamente en AMD Radeon AI PRO R9700 con `luce_server`; el rendimiento en otras GPUs o en `llama.cpp` sin DSpark puede diferir.
- La decodificación especulativa requiere colocar `mtp.safetensors` junto al GGUF y usar `luce_server`; en otros runtimes no se aplica la aceleración.
- Licencia Apache 2.0: permite uso comercial, pero se debe mantener la atribución a Thinking Machines Lab como modelo base.
- Repositorio con 0 descargas y 1 like en el momento de la ficha: ecosistema y validación comunitaria muy limitados.
- El contexto de 262K depende de la VRAM disponible; en configuraciones de 16 GB habrá que reducirlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Lucebox/Inkling-2-Mini-Fast-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio de `luce_server`: https://github.com/Luce-Org/lucebox
- Benchmark MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Benchmark HumanEval: https://huggingface.co/datasets/openai/openai_humaneval
- Benchmark MMLU-Pro: https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro
