# GEHIRNS/magi-1.2-4B

## Resumen

magi-1.2-4B es una versión cuantizada en GGUF del modelo Qwen3.5-4B de Alibaba, publicada por GEHIRNS. Se trata de un finetune mediante LoRA sobre el modelo base que entrena al modelo para "terminar su razonamiento" (finish its thinking), es decir, para completar cadenas de razonamiento de forma más fiable. El resultado se distribuye como un GGUF de precisión mixta que ocupa 2,55 GiB con una ventana de contexto de 32K, frente a los 9,51 GiB del modelo BF16 equivalente.

La relevancia de esta ficha no está en el modelo base, sino en la metodología de cuantización. El autor ha construido una matriz de importancia a partir de 493 trazas de razonamiento correctas y completas del propio Qwen3.5-4B, y ha medido la sensibilidad de cada uno de los 153 grupos de tensores (FFN, proyecciones DeltaNet y atención por capa) moviendo cada grupo un paso de cuantización arriba y abajo, generando 306 builds evaluados por divergencia KL respecto al modelo BF16. Los bits se reasignan según esas mediciones, y 64 MiB de las capas menos sensibles se degradan un paso (69 grupos modificados).

El modelo declara una puntuación del 81,9% en un benchmark propio de 2.313 tareas, frente al 81,7% de magi-1.1-4B y con 64 MiB menos de memoria, a cambio de un 11% más de tokens de razonamiento (1.770 frente a 1.597 por tarea). Está pensado para despliegue local en llama.cpp y Ollama, con licencia Apache 2.0 y soporte exclusivo de inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (Gated DeltaNet + atención), según tags del modelo; detalles exactos no disponibles |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32K (según la model card) |
| Tipos de cuantización | GGUF de precisión mixta (mapa de cuantización por grupos de tensores); niveles concretos por tensor no disponibles |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (librería gguf, compatible con llama.cpp y Ollama) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura transformer con componentes Gated DeltaNet (atención lineal con estado recurrente) junto con proyecciones de atención convencionales, según los tags de la model card. Sobre ese base, GEHIRNS aplicó un finetune LoRA orientado a que el modelo complete sus cadenas de razonamiento ("teaches it to finish its thinking"). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación técnica principal es el proceso de cuantización. Se calcularon dos señales: (1) una matriz de importancia derivada de 493 trazas de razonamiento correctas y completas del propio Qwen3.5-4B sobre prompts del split de entrenamiento (frente a las 32 trazas de código usadas en magi-1.0, lo que redujo la divergencia del modelo cuantizado respecto al BF16 en un 4%), y (2) una sensibilidad por capa medida empíricamente mediante 306 builds (cada uno de los 153 grupos de tensores desplazado un paso arriba y otro abajo), puntuados por divergencia KL respecto al BF16 sobre texto de razonamiento y chat reservado. Con esas mediciones se reasignaron bits hacia las capas más sensibles y se degradaron 64 MiB de las menos sensibles. No se mencionan técnicas de decodificación especulativa ni atención lineal adicionales más allá de lo heredado del base.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento con modo "thinking" explícito: el finetune LoRA está orientado a que el modelo termine sus trazas de razonamiento de forma fiable.
- Generación de código, evaluada con HumanEval+ y MBPP+ mediante ejecución de tests (EvalPlus).
- Razonamiento sobre problemas de programación competitiva (LiveCodeBench, 150 problemas de concursos entre 2025-01-18 y 2025-04-06).
- Capacidad multilingüe: limitada al inglés según la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Despliegue local en equipos con GPU de consumo: con 2,55 GiB de pesos y un KV cache q4_0 a 32K, el modelo cabe en GPUs de 12 GB como la RTX 5070 usada en los benchmarks, lo que permite razonamiento y generación de código sin conexión a servicios en la nube.
- Asistentes de código en el IDE: el modelo se evalúa con ejecución real de tests en HumanEval+ y MBPP+, por lo que es adecuado para autocompletado y generación de funciones con verificación automática en pipelines de CI.
- Razonamiento con presupuesto de tokens controlado: el benchmark se ejecutó con thinking activado y un presupuesto de 4.096 tokens mediante budget forcing, lo que permite acotar el coste por consulta en aplicaciones donde la latencia importa.
- Prototipado de agentes de razonamiento en inglés: al ser un GGUF compatible con llama.cpp y Ollama, se puede integrar rápidamente en entornos de experimentación con una sola GPU.
- Evaluación de técnicas de cuantización: el modelo sirve como referencia reproducible para comparar mapas de precisión mixta, dado que el autor publica la metodología completa (matriz de importancia, 306 builds, divergencia KL).
- Servicio de chat conversacional de bajo coste: 2,55 GiB de memoria a 32K de contexto permiten ejecutar varias instancias o compartir GPU con otros servicios en un servidor modesto.
- Investigación sobre fidelidad de cuantización: la métrica de densidad de capacidad (ρ) y la comparación contra BF16 facilitan estudiar la degradación de modelos pequeños cuantizados en tareas de razonamiento.

## Benchmarks y rendimiento

Resultados publicados por el autor, ejecutados en una RTX 5070 (12 GB) con llama.cpp b11800 (llama-server), KV cache q4_0, flash attention, thinking activado con presupuesto de 4.096 tokens y decodificación greedy sobre 2.313 tareas. La columna BF16 corresponde a una ejecución anterior con Ollama del mismo conjunto de tareas.

| Benchmark | Qwen3.5-4B (BF16), 9,51 GiB | magi-1.1-4B, 2,61 GiB | magi-1.2-4B, 2,55 GiB |
|---|---|---|---|
| Puntuación agregada (2.313 tareas) | no disponible en la información proporcionada | 81,7% | 81,9% |
| Densidad de capacidad (ρ) | 0,278 | 0,939 | 0,968 |
| Tokens de razonamiento por tarea (media) | no disponible | 1.597 | 1.770 |
| Memoria a 32K (GiB) | 9,51 | 2,61 | 2,55 |

Comparación pareada magi-1.2-4B frente a magi-1.1-4B en las mismas 2.313 tareas: +0,18 puntos (error estándar 0,62; 103 tareas ganadas, 100 perdidas), con 64 MiB menos de memoria y un 11% más de tokens de razonamiento. El desglose por benchmark individual (HumanEval+, MBPP+, LiveCodeBench, etc.) no está disponible en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: 2,55 GiB para los pesos a 32K de contexto con KV cache q4_0, según la medición del autor con `llama-fit-params` (incluye pesos, KV cache, estado recurrente y buffers de cómputo, GPU y host, sin el contexto CUDA).
- GPU recomendadas: RTX 5070 (12 GB) validada por el autor; por tamaño, cualquier GPU con 4 GB o más de VRAM debería ser suficiente para 32K con KV cache q4_0, aunque no se han publicado mediciones en otras GPUs.
- Cabe en GPU de consumo: sí, con margen amplio en tarjetas de 8-12 GB (RTX 3060, 4060, 4070, 5070, etc.).
- Opciones de despliegue: llama.cpp (llama-server, versión b11800 usada en los benchmarks) y Ollama; el tag `endpoints_compatible` sugiere compatibilidad con APIs de endpoints, aunque los detalles no están disponibles.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria a 32K | Puntuación (2.313 tareas) | Licencia | Formato |
|---|---|---|---|---|---|---|
| magi-1.2-4B | 4,2B | 32K | 2,55 GiB | 81,9% | Apache 2.0 | GGUF |
| magi-1.1-4B | 4,2B (mismos pesos) | 32K | 2,61 GiB | 81,7% | Apache 2.0 | GGUF |
| Qwen3.5-4B (BF16) | 4,2B | 32K | 9,51 GiB | no disponible | Apache 2.0 | safetensors/BF16 |

La comparativa se limita a las tres variantes documentadas por el autor. No se dispone de datos de benchmarks frente a otros modelos de tamaño similar (por ejemplo, Llama 3.2 3B o Gemma 3 4B) en la información proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés; su uso en castellano no está validado y probablemente degrade la calidad.
- Sesgos: no se documentan análisis de sesgos en la información proporcionada; al heredar el comportamiento de Qwen3.5-4B, arrastra los sesgos del corpus de entrenamiento del base.
- Alucinación: no se han publicado evaluaciones específicas de tasa de alucinación; el modo thinking puede producir cadenas de razonamiento plausibles pero incorrectas.
- Coste de razonamiento: el modelo consume un 11% más de tokens de razonamiento que magi-1.1-4B (1.770 frente a 1.597 por tarea), lo que incrementa la latencia y el coste por consulta en producción.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.5-4B enlazada en la model card.
- Métricas del autor: los benchmarks son propios (2.313 tareas no descritas en detalle) y la comparación BF16 se ejecutó con otro runtime (Ollama), con una diferencia estimada de unos 0,15 puntos entre runtimes; la ventaja de +0,18 puntos sobre magi-1.1-4B tiene un error estándar de 0,62, por lo que no es estadísticamente significativa.
- Madurez: 30 descargas y 0 likes en el momento de la consulta; el modelo es muy reciente (publicado el 2026-11-08) y carece de validación independiente.
- Compatibilidad: al ser GGUF de precisión mixta, requiere versiones de llama.cpp que soporten el mapa de cuantización empleado; no se garantiza su funcionamiento en versiones antiguas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GEHIRNS/magi-1.2-4B
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Licencia del modelo: https://huggingface.co/GEHIRNS/magi-1.2-4B/blob/main/LICENSE
- Versión anterior magi-1.1-4B: https://huggingface.co/GEHIRNS/magi-1.1-4B
- Perfil del autor en Hugging Face: https://huggingface.co/GEHIRNS
- Sitio web del autor: https://gehirns.pages.dev/
