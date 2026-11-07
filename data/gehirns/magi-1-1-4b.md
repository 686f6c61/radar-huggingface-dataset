# GEHIRNS/magi-1.1-4B

## Resumen

magi-1.1-4B es un modelo de generación de texto en formato GGUF desarrollado por GEHIRNS, derivado del modelo base Qwen/Qwen3.5-4B mediante un ajuste fino con LoRA y una receta de cuantización de precisión mixta. El modelo cuenta con 4.205.751.296 parámetros y se distribuye en un archivo de 2,61 GiB que permite ejecutar una ventana de contexto de 32K, frente a los 9,51 GiB que ocupa el modelo base en BF16.

El problema que aborda es doble: por un lado, reducir drásticamente el espacio en memoria necesario para servir un modelo de 4B sin perder capacidad de razonamiento; por otro, corregir un defecto observado en su predecesor magi-1.0-4B, que agotaba el presupuesto de razonamiento de 4.096 tokens en el 35% de las tareas. El ajuste fino se entrenó sobre 360 trazas de razonamiento cortas y correctas generadas por el propio modelo, de las cuales 40 corresponden a prompts en los que magi-1.0-4B entraba en bucle con decodificación greedy.

Según la model card, magi-1.1-4B obtiene un 81,7% en un benchmark interno de 2.313 tareas, frente al 84,0% del modelo BF16, con un 28% menos de tokens de razonamiento que magi-1.0-4B y una reducción de los topes de presupuesto de razonamiento del 35% al 18%. Es relevante para desarrolladores que necesitan desplegar razonamiento de calidad en hardware de consumo con un consumo de memoria muy contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-4B (tags: qwen3.5, gated-deltanet) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32K (32.768 tokens) |
| Tipos de cuantizacion | GGUF de precision mixta (13 reglas por clase de tensor, con importance matrix); tipos GGUF estandar |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (libreria gguf; compatible con llama.cpp y Ollama) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer de 4B parámetros, y aplica dos transformaciones. La primera es un ajuste fino con LoRA fusionado antes de la cuantización: el adaptador se entrenó sobre 360 trazas de razonamiento cortas y correctas generadas por el propio modelo, 40 de ellas destinadas a prompts donde el predecesor entraba en bucle bajo decodificación greedy. El objetivo del ajuste es que el modelo termine su razonamiento por sí mismo dentro del presupuesto de 4.096 tokens, en lugar de agotarlo. La segunda es la receta de cuantización de precisión mixta de magi-1.0-4B, sin cambios: las mismas 13 reglas por clase de tensor, el mismo cuantizador y la misma importance matrix, lo que da como resultado un archivo del mismo tamaño que el de magi-1.0-4B (2,61 GiB).

La model card menciona el tag "gated-deltanet" y "mixed-precision", aunque no detalla la composición del dataset de entrenamiento ni si hubo RLHF o DPO adicionales. El ajuste se limita a las trazas descritas. La innovación principal es la combinación de un ajuste fino específico para la finalización del razonamiento con una cuantización mixta que preserva la precisión donde la sensibilidad medida lo exige, usando únicamente tipos GGUF estándar para garantizar compatibilidad con llama.cpp y Ollama sin parches.

## Capacidades

- Generación de texto conversacional y razonamiento con modo "thinking" explícito, con presupuesto de razonamiento configurable (evaluado a 4.096 tokens).
- Finalización autónoma del razonamiento: reduce los topes de presupuesto del 35% al 18% de las tareas y disminuye los bucles de repetición.
- Razonamiento de múltiples pasos y decodificación greedy estable en tareas de benchmark.
- Generación de código, evaluada mediante ejecución de tests (HumanEval+, MBPP+, LiveCodeBench).
- Capacidades matemáticas y de resolución de problemas, integradas en el benchmark interno de 2.313 tareas.
- Compatibilidad con endpoints (tag "endpoints_compatible") y despliegue en llama.cpp y Ollama.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Visión y audio: no disponible.

## Casos de uso

- Razonamiento en hardware de consumo: con 2,61 GiB y 32K de contexto, el modelo cabe en GPUs de 8-12 GB y permite ejecutar tareas de razonamiento con presupuesto de tokens controlado en un portátil o estación de trabajo modesta.
- Asistentes conversacionales de contexto largo: la ventana de 32K permite mantener conversaciones multi-turno con historial extenso o documentos largos sin truncar, manteniendo el consumo de memoria bajo.
- Generación de código en pipelines locales: el modelo se evalúa con ejecución de tests (HumanEval+, MBPP+, LiveCodeBench), por lo que es adecuado para autocompletado y generación de funciones verificables en entornos de desarrollo sin conexión.
- Razonamiento con latencia controlada: al reducir un 28% los tokens de pensamiento y un 27% el tiempo por tarea frente a magi-1.0-4B, encaja en aplicaciones interactivas donde el tiempo de respuesta importa.
- Despliegue en entornos con memoria limitada: la cuantización mixta con tipos GGUF estándar permite servirlo en llama.cpp u Ollama sin modificaciones, útil en contenedores o dispositivos edge con RAM/VRAM ajustada.
- Prototipado e investigación de técnicas de cuantización: la receta de 13 reglas por clase de tensor y el uso de importance matrix lo convierten en una referencia práctica para estudiar el equilibrio entre precisión y tamaño.
- Evaluación comparativa de modelos pequeños: su benchmark interno de 2.313 tareas y su métrica de "capability density" facilitan comparaciones reproducibles frente a alternativas de 4B.

## Benchmarks y rendimiento

Los datos proceden de la model card. Todas las columnas se ejecutaron en una RTX 5070 (12 GB) con el mismo protocolo: 2.313 tareas, thinking activado con presupuesto de 4.096 tokens, decodificación greedy. magi-1.0-4B y magi-1.1-4B se sirvieron en llama.cpp b11800 con caché KV q4_0, flash attention y micro-batch 512; la columna BF16 se ejecutó en Ollama.

| Benchmark | Qwen3.5-4B (BF16, 9,51 GiB) | magi-1.0-4B (2,61 GiB) | magi-1.1-4B (2,61 GiB) |
|---|---|---|---|
| Benchmark interno (2.313 tareas) | 84,0% | 80,49% (llama.cpp) / 80,64% (Ollama) | 81,7% |
| Tokens de pensamiento | no disponible | referencia | -28% frente a magi-1.0-4B |
| Tareas que agotan el presupuesto de pensamiento | no disponible | 35% | 18% |
| Tiempo por tarea | no disponible | referencia | -27% frente a magi-1.0-4B |
| Capability density (ρ) | 0,278 | 0,903 | 0,939 |

Comparación pareada magi-1.1-4B frente a magi-1.0-4B en las mismas 2.313 tareas: +1,24 puntos de precisión (110 tareas ganadas, 89 perdidas, error estándar 0,61, es decir, 2,0 errores estándar). Los resultados por benchmark individual (HumanEval+, MBPP+, LiveCodeBench, etc.) no están completos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 2,61 GiB de pesos; con contexto de 32K, caché KV q4_0, estado recurrente y buffers de cómputo, el tamaño residente proyectado por `llama-fit-params` es de 2,61 GiB según la model card (medido con una secuencia y micro-batch 128, GPU más host, sin contexto CUDA).
- GPU recomendadas: RTX 5070 (12 GB) es la GPU usada en los benchmarks; cualquier GPU con al menos 4-6 GB libres debería poder servirlo a contexto completo.
- Cabe en GPU de consumo: sí, con margen amplio en tarjetas de 8 GB o más; probablemente también en GPUs integradas o de 4 GB con contexto reducido.
- Opciones de despliegue: llama.cpp (llama-server, b11800 probado), Ollama; al usar tipos GGUF estándar es compatible con el ecosistema llama.cpp sin parches.
- Latencia y throughput: no se publican tokens por segundo; la model card indica una reducción del 27% en tiempo por tarea frente a magi-1.0-4B en el benchmark interno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark interno | Memoria (32K) | Licencia | Formato |
|---|---|---|---|---|---|---|
| magi-1.1-4B | 4,2B | 32K | 81,7% | 2,61 GiB | Apache 2.0 | GGUF |
| magi-1.0-4B | 4B | 32K (no confirmado) | 80,49-80,64% | 2,61 GiB | Apache 2.0 (heredada) | GGUF |
| Qwen3.5-4B (BF16) | 4B | no disponible | 84,0% | 9,51 GiB | Apache 2.0 | safetensors/BF16 |

La comparativa se limita a los modelos presentes en la información proporcionada. No se dispone de datos de otras alternativas de 4B (por ejemplo, Llama o Gemma) para contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- El benchmark es interno (2.313 tareas) y no equivale a evaluaciones estándar de la comunidad; los resultados no son directamente comparables con MMLU, GSM8K u otros.
- La ganancia de precisión frente a magi-1.0-4B (+1,24 puntos) está en el límite de 2 errores estándar según el propio autor, por lo que debe interpretarse con cautela.
- El modelo BF16 base obtiene 84,0% frente al 81,7% del cuantizado: existe una pérdida de precisión de 2,3 puntos por la cuantización mixta.
- Riesgo de alucinación inherente a modelos de 4B; no se documentan evaluaciones de factualidad ni de sesgos.
- Riesgo de bucles de repetición: aunque reducido (del 35% al 18% de tareas que agotan presupuesto), persiste en una parte de las trazas.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base Qwen3.5-4B; conviene verificar los términos del modelo base.
- El modelo tiene 0 descargas y 1 like en el momento de la ficha: es un artefacto reciente y poco validado por la comunidad.
- No se documentan capacidades de tool calling, agentes, visión ni audio; no deben asumirse.

## Enlaces

- Hugging Face: https://huggingface.co/GEHIRNS/magi-1.1-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Licencia del modelo: https://huggingface.co/GEHIRNS/magi-1.1-4B/blob/main/LICENSE
- Predecesor: https://huggingface.co/GEHIRNS/magi-1.0-4B
- Perfil del autor: https://huggingface.co/GEHIRNS
- Colecciones del autor: https://huggingface.co/GEHIRNS/collections
- Sitio web del autor: https://gehirns.pages.dev/
