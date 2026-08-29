# BoldingBuilds/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-ShimQuant-GGUF

## Resumen

NVIDIA Nemotron 3.5 Lightning 30B A3B es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por NVIDIA, diseñado para ejecución de baja latencia y alto volumen en agentes de IA de larga duración. Con 30.000 millones de parámetros totales y solo 3.000 millones activos por token, ofrece un equilibrio entre capacidad y eficiencia computacional. El modelo incorpora decodificación especulativa con predicción multi-token integrada durante el preentrenamiento, así como modelos draft DSpark y DFlash para optimizar la inferencia en distintos escenarios de despliegue.

Esta ficha se centra en la variante cuantizada por BoldingBuilds mediante la técnica ShimQuant, que consigue una densidad de 3,07 bits por peso y un tamaño de 11,77 GiB, permitiendo ejecutar el modelo en tarjetas gráficas de consumo con 16 GB de VRAM. La cuantización ShimQuant resuelve un problema específico de este modelo: sus dimensiones internas no son divisibles por 256, lo que impide que los cuantizadores estándar de llama.cpp apliquen tipos de baja precisión a la mayoría de sus parámetros. El resultado es una reducción de 6,2 GiB frente a la mejor cuantización stock disponible, con una divergencia KL frente a Q8_0 de 0,123 nats, inferior a la mitad de la del IQ2_M estándar.

La relevancia actual de este modelo radica en su capacidad para ejecutar tareas de razonamiento y generación de código en hardware de consumo, manteniendo un rendimiento competitivo (91,5% pass@1 en HumanEval) y una velocidad de inferencia de aproximadamente 200 tokens por segundo en una RTX 5080. Sin embargo, requiere un parche específico de llama.cpp (ShimQuant) y no funciona con la versión estándar del software.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atencion Nemotron-H |
| Parametros totales | 35.184.768.576 (35,18 B) |
| Parametros activos | 3 B (segun NVIDIA) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ShimQuant 3,07 bpw (Q6_K + IQ2_XXS + IQ2_S) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 es un transformer MoE con 30.000 millones de parámetros totales y 3.000 millones activos por token. NVIDIA lo describe como el modelo MoE 30B A3B más rápido con precisión líder en tareas especializadas para agentes. Incorpora decodificación especulativa con predicción multi-token integrada durante el preentrenamiento, lo que reduce la latencia de generación. Además, se proporcionan modelos draft DSpark y DFlash para optimizar la inferencia en diferentes escenarios de despliegue. La fecha de corte de los datos de post-entrenamiento es mayo de 2026.

La cuantización ShimQuant, desarrollada por Josh Bolding, aborda un problema específico de este modelo: las dimensiones de los tensores (n_embd = 2688, anchos de experto de 1856 y 3712) no son divisibles por 256, por lo que los k-quants e i-quants estándar de llama.cpp no pueden aplicarse legalmente a aproximadamente el 99% de los parámetros. `llama-quantize` sustituye silenciosamente un tipo de bloque de 32, lo que hace que todas las cuantizaciones de baja precisión publicadas para este modelo terminen en ~4,70 bits por peso, independientemente de su nombre. ShimQuant zero-pad cada fila de tensor afectada al siguiente múltiplo de 256 en el momento de la cuantización y recorta las activaciones en la inferencia, permitiendo que los tipos de baja precisión se apliquen realmente. En este caso, los bancos de expertos pasan de 1856 a 2048, con un overhead de solo el 9,4%.

## Capacidades

- Generacion de texto y razonamiento: el modelo tiene un modo de razonamiento activado por defecto que genera cadenas de pensamiento internas antes de emitir la respuesta final.
- Generacion de codigo: alto rendimiento en tareas de programacion, con 91,5% pass@1 en HumanEval (164 problemas, ejecucion de tests, limite de 6000 tokens).
- Soporte para agentes: disenado para tareas especializadas de agentes de larga duracion, con baja latencia y alto volumen de ejecucion.
- Decodificacion especulativa: prediccion multi-token integrada durante el preentrenamiento, con modelos draft DSpark y DFlash para optimizar la inferencia.
- Capacidades multilingues: no evaluadas en la informacion disponible; el modelo base de NVIDIA no especifica idiomas soportados.
- Tool calling y function calling: no se menciona explicitamente en la informacion proporcionada, aunque el enfoque en agentes sugiere compatibilidad con estas funciones.

## Casos de uso

- Generacion de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD para generar o completar fragmentos de codigo, gracias a su alto rendimiento en HumanEval (91,5% pass@1) y su velocidad de inferencia de ~200 tok/s en hardware de consumo.
- Agentes de IA de larga duracion: su diseno para baja latencia y alto volumen lo hace adecuado para agentes que requieren multiples pasos de razonamiento y ejecucion prolongada, como asistentes de automatizacion de tareas.
- Razonamiento y analisis de texto: el modo de razonamiento activado por defecto permite descomponer problemas complejos en pasos intermedios, util para tareas de analisis, resumen y respuesta a preguntas.
- Desarrollo de asistentes de codigo locales: con 11,77 GiB en disco y ~10,4 GiB residentes, puede ejecutarse en una GPU de 16 GB (por ejemplo, RTX 5080), permitiendo asistentes de codigo privados y sin conexion.
- Prototipado rapido de aplicaciones LLM: su tamano reducido y compatibilidad con llama.cpp (con parche) facilitan la experimentacion en entornos de desarrollo con recursos limitados.
- Evaluacion de cuantizaciones extremas: el modelo sirve como caso de estudio para tecnicas de cuantizacion de baja precision en arquitecturas MoE con dimensiones no estandar, util para investigadores interesados en optimizacion de modelos.

## Benchmarks y rendimiento

La model card proporciona mediciones de divergencia KL frente a Q8_0 y resultados de HumanEval. No se dispone de otros benchmarks (MMLU, GSM8K, etc.) en la informacion disponible.

| Build | bpw | Tamano | KLD vs Q8_0 |
|---|---|---|---|
| Stock IQ2_M (mejor low-bit disponible) | 4,70 | 18,00 GiB | 0,272 |
| Stock IQ3_XXS | 4,70 | 18,01 GiB | 0,040 |
| **Este archivo (ShimQuant)** | **3,07** | **11,77 GiB** | **0,123** |

Resultados de HumanEval (ejecucion de tests, greedy, limite de 6000 tokens):

| | pass@1 | Hit token cap | Precision cuando se emitio codigo |
|---|---|---|---|
| 164 problemas completos (RTX 3090) | 91,5% | 5,5% | 97,4% |
| Primeros 50 problemas (RTX 5080, 16 GB) | 94,0% | 2% | 96% |

## Requisitos de hardware

- VRAM estimada: ~10,4 GiB residentes (omitiendo el bloque MTP `blk.52`), dejando espacio para contexto en una GPU de 16 GB.
- GPU recomendadas: RTX 5080 (16 GB) y RTX 3090 (24 GB) probadas; cualquier GPU con 16 GB o mas de VRAM deberia ser suficiente.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas de 16 GB como la RTX 5080.
- Opciones de despliegue: llama.cpp con el parche ShimQuant (version e70802a01f03f0ed31a26338a5664796f3824371). No compatible con llama.cpp estandar ni con vLLM, Ollama o TGI sin modificaciones.
- Latencia y throughput: aproximadamente 200 tok/s en RTX 5080 con contexto de 6144 tokens.
- Requisitos de software: es necesario compilar llama.cpp desde el commit indicado y aplicar el parche `shimquant.patch` desde el repositorio de Josh Bolding.

## Comparativa con modelos similares

Comparacion con las cuantizaciones stock del mismo modelo base:

| Modelo | bpw | Tamano | KLD vs Q8_0 | HumanEval pass@1 |
|---|---|---|---|---|
| Stock IQ2_M | 4,70 | 18,00 GiB | 0,272 | no disponible |
| Stock IQ3_XXS | 4,70 | 18,01 GiB | 0,040 | no disponible |
| ShimQuant (este archivo) | 3,07 | 11,77 GiB | 0,123 | 91,5% |

No se dispone de datos comparativos con otros modelos MoE de tamano similar (por ejemplo, Qwen3-30B-A3B o DeepSeek-V3-Lite) en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere un parche especifico de llama.cpp (ShimQuant); no carga en la version estandar del software. Este es el principal coste de uso.
- El razonamiento esta activado por defecto y `--reasoning-budget 0` no lo desactiva en esta arquitectura. Aproximadamente el 5% de los problemas de HumanEval agotan el presupuesto de tokens dentro del bloque de pensamiento sin emitir respuesta; se recomienda aumentar `max_tokens` si se observan respuestas vacias.
- La evaluacion se ha realizado solo en tareas de codificacion y texto general. No hay datos sobre rendimiento en tareas multilingues, de contexto largo o agenticas.
- La tecnica ShimQuant no es universalmente beneficiosa; en otros modelos (por ejemplo, Qwen3.8-Flash-Next) produjo resultados peores que las cuantizaciones publicadas existentes.
- La licencia OpenMDW-1.1 rige el uso del modelo y sus derivados; se debe revisar sus terminos para uso comercial.
- No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, etc.) en la informacion disponible.

## Enlaces

- Modelo cuantizado: https://huggingface.co/BoldingBuilds/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-ShimQuant-GGUF
- Modelo base (BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Repositorio ShimQuant: https://github.com/JoshBolding/shimquant
- Herramienta de auditoria GGUF: https://github.com/JoshBolding/ggufaudit
- Model card de NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Blog de NVIDIA sobre Nemotron 3.5 Lightning: https://developer.nvidia.com/blog/nvidia-nemotron-3-5-lightning-delivers-fast-accurate-specialized-task-execution-for-long-running-agents/
- PR #3747 de llama.cpp (fallback de dimensiones): https://github.com/ggml-org/llama.cpp/pull/3747
