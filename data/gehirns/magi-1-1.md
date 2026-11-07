# GEHIRNS/magi-1.1

## Resumen

magi-1.1 es una versión cuantizada y ajustada con LoRA de Qwen3.5-4B, publicada por el usuario GEHIRNS en Hugging Face. El modelo parte de un trabajo previo, magi-1.0, que aplicaba una receta de cuantización de precisión mixta sobre Qwen3.5-4B para reducir el peso del modelo de 9,51 GiB (BF16) a 2,61 GiB manteniendo la mayor parte de su rendimiento. magi-1.1 añade un fine-tune LoRA fusionado antes de la cuantización, entrenado sobre 360 trazas de razonamiento cortas y correctas generadas por el propio modelo, con el objetivo de que este termine su razonamiento dentro del presupuesto de 4.096 tokens en lugar de agotarlo.

El problema que resuelve es doble: por un lado, la huella de memoria, ya que el modelo cabe en GPU de consumo con contexto de 32K; por otro, la tendencia de magi-1.0 a agotar el presupuesto de pensamiento (35% de las tareas) y a entrar en bucles de repetición. Según el autor, magi-1.1 alcanza el 81,7% en un benchmark propio de 2.313 tareas, frente al 84,0% del modelo BF16, con un 28% menos de tokens de pensamiento y un 27% menos de tiempo por tarea.

El modelo se distribuye únicamente en formato GGUF, con licencia Apache 2.0, y está pensado para ejecutarse en llama.cpp y Ollama. La información disponible sobre arquitectura interna, datos de entrenamiento del modelo base y benchmarks estándar (MMLU, HumanEval, GSM8K) es limitada: la model card se centra en la receta de cuantización y en el benchmark propio del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; el tag "gated-deltanet" aparece en la model card, sin detalle tecnico adicional) |
| Parametros totales | 4.205.751.296 (dato de safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32K (contexto de referencia usado en las mediciones del autor) |
| Tipos de cuantizacion | GGUF de precision mixta con 13 reglas por clase de tensor e importance matrix (imatrix); tamano de archivo 2,61 GiB |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp, Ollama) |

## Arquitectura y entrenamiento

magi-1.1 es un fine-tune de Qwen3.5-4B con un adaptador LoRA fusionado antes de la cuantización. El adaptador se entrenó sobre 360 trazas de razonamiento cortas y correctas generadas por el propio modelo, de las cuales 40 corresponden a prompts en los que magi-1.0 entra en bucle bajo decodificación greedy. El objetivo del entrenamiento es que el modelo cierre su razonamiento de forma autónoma antes de agotar el presupuesto de 4.096 tokens. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La parte de cuantización reutiliza sin cambios la receta de magi-1.0: 13 reglas de precisión por clase de tensor, el mismo cuantizador y la misma importance matrix, lo que produce un archivo del mismo tamaño (2,61 GiB). El resultado es un GGUF que funciona en llama.cpp y Ollama estándar, sin kernels personalizados. La model card menciona el tag "gated-deltanet" y "reasoning", pero no desarrolla la arquitectura interna ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional y razonamiento con modo de pensamiento (thinking) acotado a un presupuesto de 4.096 tokens.
- Razonamiento multi-paso con tendencia reducida a bucles de repetición respecto a magi-1.0.
- Generación de código, evaluada por el autor con HumanEval+, MBPP+ (EvalPlus) y LiveCodeBench.
- Ejecución en llama.cpp y Ollama con cuantización GGUF de precisión mixta.
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Asistente de razonamiento en local: el modelo cabe en 2,61 GiB y puede desplegarse en una GPU de consumo con contexto de 32K, adecuado para prototipos de agentes que necesitan razonamiento encadenado sin depender de la nube.
- Generación y revisión de código en entornos con recursos limitados: el autor evalúa HumanEval+, MBPP+ y LiveCodeBench, por lo que puede integrarse en flujos de autocompletado o revisión de parches donde no se dispone de GPU de datacenter.
- Automatización de tareas de razonamiento con presupuesto acotado: al reducir los topes de presupuesto de pensamiento del 35% al 18% de las tareas, es adecuado para pipelines por lotes donde el coste por tarea importa.
- Despliegue en estaciones de trabajo con una sola GPU: con 2,61 GiB de pesos y caché KV q4_0 a 32K, encaja en tarjetas de 12 GB como la RTX 5070 usada en las mediciones del autor.
- Evaluación comparativa de técnicas de cuantización: sirve como referencia para estudiar el impacto de la precisión mixta y del fine-tune LoRA sobre un modelo base de 4B.
- Chat conversacional en inglés con contexto largo: útil para resúmenes y conversaciones multi-turno de hasta 32K tokens en aplicaciones de escritorio con Ollama.

## Benchmarks y rendimiento

Los datos proceden del benchmark propio del autor (2.313 tareas, thinking activado con presupuesto de 4.096 tokens, decodificación greedy, llama.cpp b11800 con caché KV q4_0 y flash attention en una RTX 5070 de 12 GB). La columna BF16 se ejecutó con Ollama.

| Benchmark | Qwen3.5-4B (BF16, 9,51 GiB) | magi-1.0 (2,61 GiB) | magi-1.1 (2,61 GiB) |
|---|---|---|---|
| Benchmark propio del autor (2.313 tareas) | 84,0% | 80,49% (llama.cpp) / 80,64% (Ollama) | 81,7% |
| Densidad de capacidad (ρ) | 0,278 | 0,903 | 0,939 |
| Tareas que agotan el presupuesto de pensamiento | no disponible | 35% | 18% |
| Tokens de pensamiento | no disponible | referencia | −28% frente a magi-1.0 |
| Tiempo por tarea | no disponible | referencia | −27% frente a magi-1.0 |

Frente a magi-1.0 en las mismas 2.313 tareas (emparejadas): +1,24 puntos de precisión (110 tareas ganadas, 89 perdidas, error estándar 0,61). No se han publicado resultados de MMLU, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Pesos: 2,61 GiB en GGUF de precisión mixta.
- Memoria residente estimada por `llama-fit-params` para contexto de 32K, una secuencia y micro-lote 128 (pesos, caché KV, estado recurrente y buffers, GPU más host, sin contexto CUDA): no se detalla el valor numérico en la información disponible; las mediciones se hicieron en una RTX 5070 de 12 GB.
- GPU recomendadas: RTX 5070 (12 GB) es la tarjeta usada en las pruebas del autor; por tamaño, debería caber en GPU de consumo con 8 GB o más, aunque no se confirma en la información disponible.
- Cabe en GPU de consumo: sí, según las pruebas en RTX 5070.
- Opciones de despliegue: llama.cpp (`llama-server`, build b11800) y Ollama.
- Latencia y throughput: el autor reporta un 27% menos de tiempo por tarea frente a magi-1.0; no se publican tokens por segundo absolutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark propio (2.313 tareas) | Licencia | Formato |
|---|---|---|---|---|---|
| magi-1.1 | 4,2B | 32K | 81,7% | Apache 2.0 | GGUF |
| magi-1.0 | 4,2B | 32K | 80,49% (llama.cpp) | Apache 2.0 | GGUF |
| Qwen3.5-4B (BF16) | 4,2B | no disponible | 84,0% | Apache 2.0 | safetensors (BF16) |

No se dispone de comparación con otros modelos de 4B en la información proporcionada.

## Limitaciones y advertencias

- El benchmark es propio del autor (2.313 tareas) y no equivale a MMLU, GSM8K u otros estándares; la comparación con el BF16 se hizo con distinto runtime (Ollama frente a llama.cpp), lo que el autor estima en unas 0,15 puntos de diferencia.
- El modelo solo declara soporte de inglés; no se garantiza calidad en castellano u otros idiomas.
- Riesgo de alucinación y de bucles de repetición: el fine-tune reduce los bucles, pero no los elimina (el 18% de las tareas aún agota el presupuesto de pensamiento).
- La ganancia de precisión frente a magi-1.0 (+1,24 puntos) está en el límite de significación estadística según el propio autor (2,0 errores estándar).
- Licencia Apache 2.0, que permite uso comercial, pero hereda las condiciones del modelo base Qwen3.5-4B; conviene revisar la licencia del base model.
- Es un artefacto GGUF de cuantización: no se distribuyen pesos en safetensors ni se detalla la receta completa de entrenamiento, lo que limita la reproducibilidad.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta; es un modelo reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GEHIRNS/magi-1.1
- Modelo anterior magi-1.0: https://huggingface.co/GEHIRNS/magi-1.0
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Perfil del autor en Hugging Face: https://huggingface.co/GEHIRNS
- Sitio web del autor: https://gehirns.pages.dev/
- Licencia del modelo: https://huggingface.co/GEHIRNS/magi-1.1/blob/main/LICENSE
