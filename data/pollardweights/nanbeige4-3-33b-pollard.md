# PollardWeights/Nanbeige4.3-33B-Pollard

## Resumen

Nanbeige4.3-33B-Pollard es una colección de cuantizaciones GGUF del modelo Nanbeige4.3-33B, un modelo conversacional de generación de texto de unos 33.100 millones de parámetros desarrollado por Nanbeige. La versión "Pollard" ha sido cuantizada por el usuario PollardWeights mediante la herramienta Pollard Weights, que aplica una estrategia de "measured allocation": los bits se distribuyen por capa según su sensibilidad, en lugar de aplicar una reducción uniforme de precisión. Esto permite reducir el modelo desde los 66,24 GB del f16 hasta apenas 8,52 GB en su peldaño más agresivo (IQ1_KT), un 87% menos, manteniendo métricas de fidelidad medidas (perplejidad, KLD y concordancia top-1 frente al f16).

El interés de esta ficha es doble. Por un lado, Nanbeige4.3-33B es un modelo denso de arquitectura `llama` con atención completa en sus 52 capas, lo que implica una caché KV que crece linealmente con el contexto y condiciona el hardware necesario en contextos largos. Por otro lado, la escalera de cuantizaciones Pollard ofrece un caso práctico bien documentado de cómo elegir un peldaño según el presupuesto de RAM/VRAM, con datos de retención de tool calling y verificación de integridad (`pollard-verify --gate`) para cada archivo. La licencia del modelo base es Apache 2.0, apta para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer denso, `llama` en GGUF) |
| Parametros totales | 33.118.977.024 (~33,1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la caché KV soporta hasta 512K según datos de memoria, pero el límite oficial no está publicado en la ficha) |
| Tipos de cuantizacion | IQ1_KT, IQ2_XXS, IQ3_S, IQ4_XS, Q6_K (GGUF, measured allocation, imatrix) |
| Idiomas soportados | Inglés (etiquetado en la ficha); otros idiomas no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (base en safetensors: 33.118.977.024 parámetros, 66,24 GB en f16) |

## Arquitectura y entrenamiento

El modelo base, Nanbeige4.3-33B, es un transformer denso de la familia `llama` con 52 capas y atención completa (full attention) en todas ellas. Utiliza 8 KV heads de 128 dimensiones, lo que resulta en una caché KV de 213 KB por token en f16. No es un modelo MoE: todos los parámetros están activos en cada pasada. La atención completa (frente a esquemas híbridos o lineales) implica que el coste de memoria en contexto largo está dominado por la caché KV y no por los pesos.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no se ha publicado información en la ficha disponible: no disponible. Lo que sí está documentado es el proceso de cuantización: Pollard Weights usa una matriz de importancia (imatrix, sí según la model card) para calibrar la asignación de bits por tensor según sensibilidad por capa. Cada peldaño ha sido verificado con `pollard-verify --gate` (carga completa, coherencia y checks de runtime) y medido con `llama-perplexity` y `pollard-toolcall`.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Soporte de tool calling: los peldaños IQ1_KT, IQ2_XXS, IQ3_S e IQ4_XS retienen un 90-97% de la capacidad de llamada a herramientas del f16 (medido con 60 sondas: llamada simple, elección entre 8 herramientas, no-llamada y argumentos anidados, vía OpenAI-style `tools` con `llama-server --jinja`). Q6_K degrada a un 62%.
- Entrada solo de texto; no hay soporte de visión ni audio (no disponible).
- Modo thinking: no disponible.
- Capacidades multilingües: etiquetado solo en inglés; otros idiomas no disponibles.

## Casos de uso

- Chatbots locales en estaciones de trabajo con 16-24 GB de VRAM: el peldaño IQ2_XXS (13,23 GB) es el recomendado por defecto y cabe en una RTX 4090 (24 GB) con margen para contexto moderado.
- Agentes con tool calling en hardware modesto: IQ2_XXS e IQ3_S conservan el 97% de la capacidad de llamada a herramientas del f16, adecuados para pipelines de agentes que invocan funciones vía API OpenAI-compatible.
- Inferencia en portátiles o máquinas de 16 GB de RAM: IQ1_KT (8,52 GB) permite ejecutar el modelo en CPU, aunque requiere ik_llama.cpp y asume cierta pérdida (KLD 0,382, top-1 81,87%).
- Servicios de texto con contexto largo: la caché KV cuantizada (q8_0 o q4_0) permite alcanzar 128K-256K tokens en servidores con 64-128 GB de RAM total, útil para resumen de documentos extensos.
- Integración en Ollama o LM Studio: los peldaños estándar (todos menos IQ1_KT) funcionan en llama.cpp de serie, Ollama y LM Studio sin configuración adicional.
- Selección de despliegue por presupuesto de memoria: la escalera permite elegir entre ~10,5 GB (IQ1_KT), ~15,2 GB (IQ2_XXS), ~19,3 GB (IQ3_S), ~22,5 GB (IQ4_XS) y ~29,2 GB (Q6_K) según la máquina destino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se han publicado métricas de fidelidad de cuantización frente al f16:

| Archivo | Perplejidad (PPL) | Tamaño | KLD medio | Concordancia top-1 | Retención tool calls |
|---|---:|---:|---:|---:|---:|
| IQ1_KT | 3,1454 | 8,52 GB | 0,382 | 81,87% | 90% |
| IQ2_XXS | 2,7847 | 13,23 GB | 0,186 | 89,27% | 97% |
| IQ3_S | 2,8114 | 17,30 GB | 0,0456 | 94,62% | 97% |
| IQ4_XS | 2,8415 | 20,50 GB | 0,0222 | 96,21% | 97% |
| Q6_K | 2,8196 | 27,17 GB | 0,0083 | 97,75% | 62% |

Estas cifras miden la distancia respecto al f16 del propio modelo en la suite del autor, no son comparables con retenciones publicadas en otras suites.

## Requisitos de hardware

- VRAM/RAM para los pesos (sin contexto):
  - IQ1_KT: 8,52 GB (requiere ik_llama.cpp).
  - IQ2_XXS: 13,23 GB (recomendado por defecto).
  - IQ3_S: 17,30 GB.
  - IQ4_XS: 20,50 GB.
  - Q6_K: 27,17 GB.
- Cachés KV (atención completa, 213 KB/token en f16): a 32K tokens, 7,0 GB en f16, 3,7 GB en q8_0, 2,0 GB en q4_0; a 128K, 27,9 / 14,8 / 7,9 GB respectivamente. En contexto largo, la KV cache y no los pesos es el factor limitante.
- Pesos + KV (f16), total RAM+VRAM (añadir 1-2 GB de buffers de cómputo): IQ2_XXS necesita 20,2 GB a 32K y 41,2 GB a 128K; IQ3_S, 24,3 GB a 32K y 45,2 GB a 128K.
- Consumer GPUs: IQ2_XXS cabe en una RTX 4090 (24 GB) o RTX 3090 con contexto moderado; IQ4_XS y Q6_K requieren 24 GB con KV cuantizada o descarga parcial a CPU. GPUs de datacenter (A100 40/80 GB, H100) acomodan cualquier peldaño con contexto largo.
- Despliegue: llama.cpp e ik_llama.cpp (IQ1_KT solo en ik_llama.cpp), Ollama, LM Studio; los peldaños estándar son compatibles con cualquier backend GGUF. Servir con `llama-server --jinja` para tool calling.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion minima | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-Pollard | 33,1B | 8,52 GB (IQ1_KT) | no disponible | Apache 2.0 | Escalera con métricas medidas de PPL/KLD y retención de tool calling |
| Qwen2.5-32B | 32,5B | ~9-10 GB (IQ1/IQ2) | 128K | Apache 2.0 (salvo variantes) | Competidor denso de tamaño similar, ecosistema GGUF amplio |
| Gemma 2 27B | 27,2B | ~8-9 GB (IQ1/IQ2) | 8K | Gemma license | Menor contexto y licencia restrictiva para algunos usos |
| Qwen2.5-32B-Instruct-GGUF (terceros) | 32,5B | variable | 128K | Apache 2.0 | Sin datos de retención de tool calling por peldaño publicados de forma sistemática |

Nota: los datos de las alternativas son aproximados y de conocimiento general; para la ficha de Nanbeige4.3-33B-Pollard no se han publicado benchmarks cruzados con estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se ha publicado información sobre sesgos del modelo base.
- Riesgo de alucinación: inherente a cualquier LLM; la cuantización extrema (IQ1_KT, KLD 0,382 y top-1 81,87% frente al f16) puede agravar errores de razonamiento y generación.
- Idioma: etiquetado solo en inglés; el rendimiento en castellano no está documentado (no disponible).
- Contexto: la atención completa hace que la caché KV crezca linealmente (213 KB/token en f16); en contextos largos el consumo de memoria supera con rapidez el de los pesos. El límite máximo de contexto del modelo base no está publicado en la ficha.
- Tool calling: el peldaño Q6_K retiene solo un 62% de la capacidad de llamada a herramientas del f16; para agentes, usar IQ2_XXS, IQ3_S o IQ4_XS (97%).
- IQ1_KT no funciona en llama.cpp de stock: requiere ik_llama.cpp, ya que su asignación de bits usa átomos exclusivos de ese fork.
- Licencia: Apache 2.0 permite uso comercial; sin restricciones conocidas documentadas en la ficha.
- Producción: las métricas de retención provienen de la suite propia del cuantizador y no son comparables con otros benchmarks; validar el comportamiento en el caso de uso concreto antes de desplegar.

## Enlaces

- Modelo cuantizado (Pollard): https://huggingface.co/PollardWeights/Nanbeige4.3-33B-Pollard
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Herramienta Pollard Weights: https://github.com/WestWaters/pollard-weights
- ik_llama.cpp (necesario para IQ1_KT): https://github.com/ikawrakow/ik_llama.cpp
- Paper, blog oficial y demo del modelo base: no disponible
