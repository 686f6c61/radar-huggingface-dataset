# somenetworktrouble/NVIDIA-Nemotron-Labs-Dory1.0-4B-heretic-GGUF

## Resumen

Dory1.0-4B es un modelo de lenguaje de 3.975 millones de parámetros (aproximadamente 4B) desarrollado por NVIDIA Labs dentro de la familia Nemotron. Su particularidad es que no es un transformer convencional, sino un modelo "looped" (recurrente en espacio latente) construido sobre una arquitectura normalized-GPT (nGPT) con capas de atención de ventana deslizante y atención completa intercaladas. En lugar de apilar más capas, aplica repetidamente un bloque compartido de 20 capas entre un bloque de entrada y otro de salida, de forma que un mismo checkpoint puede gastar más o menos cómputo por token según la necesidad de la tarea.

La ficha que nos ocupa, `somenetworktrouble/NVIDIA-Nemotron-Labs-Dory1.0-4B-heretic-GGUF`, es una republicación comunitaria en formato GGUF (Q5_K_M) del modelo original de NVIDIA. El sufijo "heretic" suele asociarse en el ecosistema a variantes con el alineamiento de seguridad modificado, pero el autor de esta republicación no documenta ninguna intervención, por lo que el alcance real de los cambios no está disponible. El modelo original se distribuye en BF16, MXFP8, NVFP4 y GGUF, con licencia OpenMDW 1.1 y soporte únicamente de inglés.

La relevancia de la arquitectura está en su "cómputo de inferencia elástico": variando el número de bucles (1, 2 o 4) en el mismo checkpoint se obtienen curvas de precisión distintas sin reentrenar ni cambiar de modelo, y con caché KV del último bucle el coste de memoria no crece con el número de loops. Con hasta 256K tokens de contexto y unas 4B de parámetros, es un candidato interesante para despliegues donde el presupuesto de VRAM es limitado pero se requiere razonamiento sobre contextos largos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Looped (latent-recurrent) normalized-GPT (nGPT) con capas intercaladas de sliding-window attention (SWA) y atención completa; bloques de entrada (8 capas), recurrente compartido (20 capas) y salida (8 capas) |
| Parámetros totales | 3.975.229.440 (≈4B) |
| Parámetros activos | No aplica (no es MoE); el cómputo activo varía según el número de bucles del bloque recurrente |
| Longitud de contexto | Hasta 256K tokens |
| Tipos de cuantización | Esta republicación: GGUF Q5_K_M. Original: BF16, MXFP8, NVFP4 y Q5_K_M |
| Idiomas soportados | Inglés |
| Licencia | OpenMDW License Agreement, versión 1.1 (el modelo original se declara apto para uso comercial y no comercial) |
| Formato de pesos | GGUF (este repositorio); safetensors en BF16 y formatos MXFP8/NVFP4 en el repositorio oficial |

## Arquitectura y entrenamiento

Dory1.0-4B abandona el apilamiento convencional de capas y divide su pila en tres grupos: un bloque de entrada de 8 capas, un bloque recurrente compartido de 20 capas y un bloque de salida de 8 capas. El bloque recurrente se aplica varias veces entre la entrada y la salida, y la entrada se reinyecta en cada iteración, de modo que el modelo puede "pensar" en espacio latente en lugar de alargar la salida. El backbone es un normalized-GPT (nGPT) con atención híbrida: capas de sliding-window attention intercaladas con capas de atención completa. Según NVIDIA, el modelo fue preentrenado de forma nativa en NVFP4 (el formato de coma flotante de 4 bits de la compañía) y posteriormente continuó el entrenamiento en BF16.

En cuanto a datos, la model card referencia los conjuntos `nvidia/nemotron-pre-training-datasets` y `nvidia/nemotron-post-training-v3`, con fecha de corte de septiembre de 2025 para el preentrenamiento y mayo de 2026 para el postentrenamiento. No se especifica el número de tokens, la composición del dataset ni los detalles del proceso de alineamiento (RLHF/DPO) en la información disponible. La innovación destacable es la caché KV del último bucle ("last-loop KV caching"): un looped LM estándar guarda una caché por cada bucle, mientras que Dory mantiene una sola caché por capa de atención recurrente, de forma que el consumo de memoria no crece con el número de loops y equivale al de un modelo no looped equivalente.

## Capacidades

- Generación de texto y razonamiento general en inglés, con presupuesto de cómputo ajustable por número de bucles (1, 2 o 4) en el mismo checkpoint.
- Razonamiento en espacio latente: mayor cómputo por token en lugar de salidas más largas, lo que reduce el número de tokens generados necesarios para resolver una tarea.
- Capacidades de código y trabajo agéntico: la model card reporta resultados en SciCode, SWE-bench Verified y Terminal-Bench 2.1.
- Uso en escenarios de agentes con herramientas y ejecución en terminal, a tenor de las evaluaciones publicadas (Terminal-Bench 2.1, τ³-bench).
- Contexto largo de hasta 256K tokens.
- Cómputo de inferencia elástico: permite degradar o escalar precisión cambiando el número de bucles sin cambiar de modelo.
- Capacidades multimodales: no disponibles. Soporte de audio o visión: no disponible.
- Modo "thinking" explícito: no disponible como funcionalidad documentada; el razonamiento ocurre en espacio latente mediante los bucles.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Razonamiento general en hardware de gama media: con Q5_K_M los pesos ocupan del orden de 2,8 GB, por lo que el modelo cabe en GPUs de 8-12 GB y permite desplegar un asistente de razonamiento en inglés en equipos de sobremesa o estaciones de trabajo sin GPU de datacenter.
- Automatización de tareas de ingeniería de software: con 4 bucles el modelo reporta 61,8 en SWE-bench Verified, lo que lo hace utilizable como agente de resolución de issues y generación de parches dentro de un pipeline de CI/CD, revisando el diff antes de proponer el commit.
- Agentes de terminal y operaciones: los 22,2 puntos en Terminal-Bench 2.1 con 4 bucles permiten usarlo en tareas de shell acotadas (inspección de logs, ejecución de comandos de diagnóstico) con validación humana de las acciones.
- Procesamiento de documentación extensa: la ventana de 256K tokens permite resumir o extraer información de contratos, informes o bases de código completas en una sola pasada, sin troceado ni recuperación previa.
- Extracción y clasificación por lotes en pipelines offline: al ser un modelo pequeño y cuantizado, se puede ejecutar en paralelo sobre muchos documentos en inglés (etiquetado, normalización de entidades, generación de metadatos) con un coste por token bajo.
- Despliegue en entornos air-gapped o con requisitos de soberanía del dato: al poder ejecutarse con llama.cpp u Ollama de forma local y con formato GGUF, encaja en instalaciones sin salida a internet.
- Investigación sobre modelos looped y cómputo elástico: sirve como banco de pruebas para medir la relación entre número de bucles, precisión y latencia, y para estudiar la caché KV del último bucle en comparación con arquitecturas no recurrentes.

## Benchmarks y rendimiento

Datos publicados por NVIDIA para el modelo original, no para esta republicación "heretic". La información recibida está truncada a partir de τ³-bench, por lo que las filas posteriores no están disponibles.

| Tarea | Dory1.0-4B (1 loop) | Dory1.0-4B (2 loops) | Dory1.0-4B (4 loops) | Qwen3.5-4B | Qwen3.5-9B | Gemma 4 26B A4B | Qwen3.6-35B-A3B |
|---|---|---|---|---|---|---|---|
| SciCode | 27,3 | 34,94 | 35,11 | 25,82 | 28,21 | 40,32 | 37,24 |
| SWE-bench Verified | 50,3 | 59,5 | 61,8 | 54,7 | 61,0 | 57,40 | 73,4† |
| Terminal-Bench 2.1 | 12,5 | 18,1 | 22,2 | 15 | 24 | 35 | 43 |
| τ³-bench (Banking) | 11,6 | 12,89 | 14,69 | 5,03 | 7,22 | no disponible | no disponible |

† Puntuación reportada por el tercero, no medida en la misma evaluación.

El resto de resultados (razonamiento general tipo MMLU, matemáticas tipo GSM8K, conocimiento multilingüe) no están disponibles en la información proporcionada.

## Requisitos de hardware

- Pesos en Q5_K_M: aproximadamente 2,8 GB (estimación a partir de 3.975 M de parámetros a ~5,5 bits por peso). El repositorio completo ocupa 10,8 GB, lo que sugiere que incluye más de un fichero GGUF o artefactos adicionales; el desglose no está disponible.
- Pesos en BF16: aproximadamente 8 GB. En NVFP4: aproximadamente 2 GB.
- VRAM total para inferencia: depende del tamaño de la caché KV, que no está disponible (depende del número de capas, cabezas y GQA, datos no publicados). Con 256K de contexto la caché puede ser el factor dominante; para uso con contextos de 8K-32K, una GPU de 8-12 GB debería ser suficiente con Q5_K_M.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 24 GB, así como GPUs integradas o Apple Silicon con memoria unificada suficiente para el fichero Q5_K_M.
- GPU de datacenter: A100, H100 y H200 para despliegues con contexto largo o muchas peticiones concurrentes; el modelo es lo bastante pequeño como para ejecutar varias instancias por GPU.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio para el GGUF; vLLM o TGI para el BF16 oficial, aunque el soporte de la arquitectura looped en estos motores no está confirmado en la información disponible.
- Latencia y throughput: no disponibles. Cualitativamente, el coste por token escala con el número de bucles (1, 2 o 4), por lo que el modo de 4 bucles debe presupuestarse como varias pasadas del bloque recurrente por token generado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Resultado destacado |
|---|---|---|---|---|
| Dory1.0-4B | ≈4B (20 capas recurrentes × N bucles) | 256K | OpenMDW 1.1 | SWE-bench Verified 61,8 (4 loops); SciCode 35,11 |
| Qwen3.5-4B | ≈4B | No disponible | No disponible | SWE-bench Verified 54,7; Terminal-Bench 15 |
| Qwen3.5-9B | ≈9B | No disponible | No disponible | SWE-bench Verified 61,0; Terminal-Bench 24 |
| Gemma 4 26B A4B | 26B totales / 4B activos (MoE) | No disponible | No disponible | SWE-bench Verified 57,40; SciCode 40,32 |
| Qwen3.6-35B-A3B | 35B totales / 3B activos (MoE) | No disponible | No disponible | SWE-bench Verified 73,4†; Terminal-Bench 43 |

La comparación relevante es que Dory1.0-4B en modo de 4 bucles iguala o supera a Qwen3.5-9B en SWE-bench Verified y SciCode con menos de la mitad de parámetros almacenados, a costa de más cómputo por token. Frente a los MoE de mayor tamaño (Gemma 4 26B A4B, Qwen3.6-35B-A3B) queda por debajo en tareas de terminal y en SciCode, pero con una huella de memoria mucho menor.

## Limitaciones y advertencias

- El sufijo "heretic" del repositorio sugiere una modificación del alineamiento o de las negativas de seguridad, pero no hay documentación del autor sobre qué se ha alterado, qué método se ha usado ni qué datos se han empleado. No debe asumirse paridad de comportamiento con el modelo original de NVIDIA.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha y está publicado por un tercero, no por NVIDIA: no hay validación comunitaria de la integridad de los pesos ni de la calidad de la cuantización.
- Los benchmarks publicados corresponden al modelo original de NVIDIA, no a esta variante "heretic"; no hay garantía de que se mantengan.
- Riesgo de alucinación: es un modelo de 4B parámetros; en tareas de recuperación factual y razonamiento de varios pasos la tasa de error será mayor que en modelos de mayor tamaño.
- Idiomas: solo inglés. El rendimiento en castellano no está evaluado y previsiblemente será deficiente.
- Contexto: aunque se anuncian 256K tokens, no se han publicado resultados de evaluaciones de contexto largo (tipo RULER o needle-in-a-haystack) en la información disponible.
- Licencia: la OpenMDW 1.1 permite uso comercial según la model card, pero las obligaciones concretas de atribución y las condiciones para modelos derivados deben revisarse en el texto de la licencia antes de su uso en producción.
- La cuantización Q5_K_M introduce una pérdida de precisión respecto a BF16 cuyo impacto real en tareas agénticas no está cuantificado.
- Al tratarse de una arquitectura looped, el soporte en motores de inferencia es limitado: conviene verificar que la implementación concreta respeta el número de bucles y la caché KV del último bucle antes de asumir los resultados de la model card.

## Enlaces

- Repositorio de esta variante en HuggingFace: https://huggingface.co/somenetworktrouble/NVIDIA-Nemotron-Labs-Dory1.0-4B-heretic-GGUF
- Modelo GGUF oficial de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-GGUF
- Árbol de ficheros del GGUF oficial: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-GGUF/tree/main
- Discusión del repositorio oficial: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-GGUF/discussions/1
- Modelo en BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Colección Nemotron Labs Dory: https://huggingface.co/collections/nvidia/nemotron-labs-dory
- Página para desarrolladores de Nemotron: https://developer.nvidia.com/nemotron
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia OpenMDW 1.1: https://raw.githubusercontent.com/OpenMDW/OpenMDW/refs/heads/main/1.1/LICENSE.OpenMDW-1.1
- Dataset de preentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
- Dataset de postentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
