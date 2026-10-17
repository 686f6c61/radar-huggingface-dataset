# nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-MXFP8

# NVIDIA Nemotron Labs Dory1.0 4B MXFP8

## Resumen

NVIDIA-Nemotron-Labs-Dory1.0-4B-MXFP8 es un modelo de lenguaje de aproximadamente 4.000 millones de parámetros (3.975.229.440 según los pesos en safetensors) desarrollado por NVIDIA dentro de su línea Nemotron Labs. Su rasgo distintivo es la arquitectura *looped* o latente-recurrente: en lugar de apilar capas independientes, divide la red en un bloque de entrada, un bloque recurrente compartido y un bloque de salida, y aplica el bloque recurrente varias veces por token. Esto permite aumentar el cómputo de inferencia sin aumentar el número de parámetros, lo que NVIDIA denomina "elastic inference compute".

El modelo se publica con una ventana de contexto de hasta 256.000 tokens, soporte únicamente para inglés y licencia OpenMDW 1.1. Está entrenado de forma nativa en NVFP4 (formato de coma flotante de 4 bits de NVIDIA) y continúa el entrenamiento en BF16, lo que lo hace especialmente adecuado para despliegues con VRAM limitada. La variante de este repositorio está cuantizada en MXFP8, aunque existen versiones en BF16, NVFP4 y Q5_K_M.

Su relevancia actual radica en dos factores: por un lado, la eficiencia de memoria del bucle (con *last-loop KV caching* el consumo de caché no crece con el número de iteraciones); por otro, el rendimiento en tareas agénticas y de código, donde con 4 bucles alcanza 61,8 en SWE-bench Verified, por encima de modelos del mismo rango de tamaño. Se publicó el 16 de octubre de 2026.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT normalizado (nGPT) con bucle latente-recurrente y capas intercaladas de atención de ventana deslizante (SWA) y atención completa |
| Parámetros totales | 3.975.229.440 (aproximadamente 4B) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | Hasta 256K tokens |
| Tipos de cuantización | MXFP8 (esta variante); el modelo también se publica en BF16, NVFP4 y Q5_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | OpenMDW 1.1 (openmdw-1.1); uso comercial y no comercial permitido según la tarjeta del modelo |
| Formato de pesos | safetensors (con compressed-tensors) |
| Precisión de publicación | MXFP8 |
| Tipo de pipeline | text-generation |
| Librería | transformers |
| Tamaño del repositorio | 4,8 GB |
| Fecha de publicación | 16 de octubre de 2026 |
| Conjuntos de datos citados | nvidia/nemotron-pre-training-datasets, nvidia/nemotron-post-training-v3 |
| Idioma de la tarjeta | en |

## Arquitectura y entrenamiento

La arquitectura de Dory1.0-4B es un transformer tipo GPT con normalización (nGPT) reorganizado en tres grupos de capas: un bloque de entrada (Input, I) de 8 capas, un bloque recurrente compartido (Recurrent, R) de 20 capas y un bloque de salida (Output, O) de 8 capas. El bloque recurrente se aplica repetidamente entre la entrada y la salida, y la entrada se reinyecta en cada iteración del bucle. El número de aplicaciones del bloque recurrente es un hiperparámetro de inferencia: la tarjeta del modelo reporta resultados con 1, 2 y 4 bucles, de modo que un único checkpoint puede servir a distintos presupuestos de cómputo sin reentrenamiento ni cambio de pesos. Las capas alternan atención de ventana deslizante (SWA) con capas de atención completa, lo que reduce el coste de la atención en contextos largos.

El preentrenamiento se realizó de forma nativa en NVFP4, el formato de coma flotante de 4 bits de NVIDIA, y después continuó en BF16. La tarjeta indica que los datos de preentrenamiento tienen fecha de corte en septiembre de 2025 y los de postentrenamiento en mayo de 2026; se citan los conjuntos nvidia/nemotron-pre-training-datasets y nvidia/nemotron-post-training-v3. No se detalla en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas concretas de alineación como RLHF o DPO, más allá de la existencia de una fase de postentrenamiento. La innovación más destacable en el plano de la memoria es el *last-loop KV caching*: se mantiene una única caché por capa de atención recurrente, de modo que, activado, el modelo no añade sobrecoste de caché KV respecto a un modelo equivalente sin bucle, independientemente del número de iteraciones.

## Capacidades

- Generación de texto y razonamiento de propósito general en inglés, con un tamaño reducido de 4B parámetros.
- Razonamiento en espacio latente: el bucle adicional incrementa el cómputo por token en lugar de alargar la salida, lo que la tarjeta presenta como mayor eficiencia de tokens generados.
- Código y tareas agénticas: la tarjeta reporta resultados en SciCode, SWE-bench Verified, Terminal-Bench 2.1 y τ³-bench (Banking), lo que indica capacidad para resolución de problemas de software y flujos de trabajo con múltiples pasos.
- Cómputo de inferencia elástico: la misma instantánea de pesos puede ejecutarse con 1, 2 o 4 bucles para intercambiar cómputo por precisión según la tarea.
- Contexto largo de hasta 256K tokens, útil para repositorios completos, documentación extensa o historiales de conversación prolongados.
- Modelo exclusivamente textual y monolingüe (inglés). No se declaran capacidades de visión, audio ni otros idiomas.
- No se especifica en la información disponible el soporte explícito de *tool calling* ni el formato de plantilla de conversación, aunque la evaluación en Terminal-Bench y τ³-bench apunta a uso agéntico con llamadas a herramientas.

## Casos de uso

- Agentes de código en integración continua: con 61,8 en SWE-bench Verified usando 4 bucles, puede emplearse como agente que lee un repositorio, localiza el fallo de un test y propone un parche dentro de un pipeline de CI/CD. Su tamaño permite ejecutarlo en una única GPU y paralelizar varias instancias.
- Automatización de terminal y operaciones sobre sistemas: los resultados en Terminal-Bench 2.1 (22,2 con 4 bucles) indican que puede encadenar comandos de shell y verificar resultados, útil para tareas de administración repetitivas sobre entornos acotados.
- Asistente de documentación con contexto largo: los 256K tokens de ventana permiten cargar manuales técnicos o bases de conocimiento completas en una sola pasada, reduciendo la necesidad de troceado y de recuperación externa.
- Revisión y análisis estático de código en precommit: al integrarse en un *hook* de precommit o en un *bot* de revisión, puede analizar el diff junto con el contexto del repositorio y señalar patrones problemáticos antes de la fusión.
- Clasificación y enrutamiento en arquitecturas multiagente: por su bajo coste de ejecución, es un candidato natural para actuar como enrutador que decide qué modelo mayor debe atender una consulta, o como generador de resúmenes intermedios.
- Despliegue en el borde o en estaciones de trabajo sin GPU de centro de datos: las variantes NVFP4 y Q5_K_M permiten ejecución local con requisitos de VRAM muy contenidos, útil para prototipos, entornos con datos sensibles que no pueden salir de la máquina o aplicaciones de escritorio.
- Asistencia de programación de baja latencia en el IDE: con 1 bucle y cuantización de 8 o 4 bits, se reduce el cómputo por token, lo que favorece completados rápidos en el editor a cambio de precisión en tareas complejas.
- Extracción de información estructurada sobre documentos financieros o contractuales: la evaluación en τ³-bench (Banking) sugiere familiaridad con dominios financieros y con flujos de decisión guiados por reglas.

## Benchmarks y rendimiento

Resultados publicados en la tarjeta del modelo. Dory1.0-4B se evalúa con 1, 2 y 4 bucles; el resto de columnas son modelos de comparación. El símbolo † marca puntuaciones reportadas por terceros.

| Tarea | Dory 1 loop | Dory 2 loops | Dory 4 loops | Qwen3.5-4B | Qwen3.5-9B | Gemma 4 26B A4B | Qwen3.6-35B-A3B |
|---|---|---|---|---|---|---|---|
| SciCode | 27,3 | 34,94 | 35,11 | 25,82 | 28,21 | 40,32 | 37,24 |
| SWE-bench Verified | 50,3 | 59,5 | 61,8 | 54,7 | 61,0 | 57,40 | 73,4† |
| Terminal-Bench 2.1 | 12,5 | 18,1 | 22,2 | 15 | 24 | 35 | 43 |
| τ³-bench (Banking) | 11,6 | 12,89 | 14,69 | 5,03 | 7,22 (dato truncado en la información disponible) | no disponible | no disponible |

La información proporcionada se interrumpe durante la fila de τ³-bench, por lo que el resto de tareas y de valores del conjunto de benchmarks no está disponible. No se han publicado en la información disponible resultados de MMLU, GSM8K, HumanEval ni otras evaluaciones de conocimiento general.

## Requisitos de hardware

Las cifras de VRAM para pesos son estimaciones calculadas a partir del número de parámetros (3.975.229.440) y del tamaño por parámetro de cada formato; no proceden de mediciones publicadas en la información disponible.

- Peso de los pesos en VRAM, según cuantización: aproximadamente 8 GB en BF16; unos 4 GB en MXFP8 (esta variante); en torno a 2-2,5 GB en NVFP4 incluyendo escalas; y aproximadamente 2,8-3 GB en GGUF Q5_K_M.
- A esas cifras hay que sumar la caché KV, las activaciones y el búfer del runtime. El consumo exacto de caché KV no está cuantificado en la información disponible (no se detallan número de cabezas KV ni dimensiones), y con 256K de contexto puede ser el factor dominante. Para contextos muy largos conviene reservar VRAM adicional o recurrir a técnicas de cuantización de caché.
- GPU de consumo: la variante NVFP4 o Q5_K_M cabe con holgura en tarjetas de 8-12 GB como la RTX 4060 Ti, RTX 3060 de 12 GB o RTX 4070, siempre que se limiten los contextos. La variante MXFP8 requiere del orden de 16 GB para trabajar con comodidad, por lo que encaja en RTX 4080, RTX 4090, RTX 5080 o RTX 5090.
- GPU de centro de datos: A100 (40 y 80 GB), H100 y L40S son adecuadas para servir la variante MXFP8 o BF16 con contextos largos y varios lotes concurrentes. En este rango, el modelo deja VRAM libre para caché KV extensa.
- Opciones de despliegue: la etiqueta compressed-tensors del repositorio apunta a compatibilidad con motores que consumen pesos comprimidos, como vLLM. Para NVFP4 y MXFP8 el camino nativo de NVIDIA es TensorRT-LLM. Para la variante GGUF Q5_K_M, llama.cpp y Ollama son las opciones directas. TGI y transformers son compatibles con el formato safetensors.
- Latencia y throughput: no disponible. La tarjeta no publica cifras de latencia ni de tokens por segundo, y estas dependerán fuertemente del número de bucles configurado, del contexto y del backend.

## Comparativa con modelos similares

Comparación con los modelos de referencia que emplea la propia tarjeta del modelo. Los datos de parámetros y contexto de los competidores no se detallan en la información disponible más allá de lo que indica su nombre.

| Modelo | Parámetros | Contexto | SWE-bench Verified | SciCode | Licencia |
|---|---|---|---|---|---|
| Dory1.0-4B (4 bucles) | 4B densos | 256K | 61,8 | 35,11 | OpenMDW 1.1 |
| Dory1.0-4B (1 bucle) | 4B densos | 256K | 50,3 | 27,3 | OpenMDW 1.1 |
| Qwen3.5-4B | 4B (según nombre) | no disponible | 54,7 | 25,82 | no disponible |
| Qwen3.5-9B | 9B (según nombre) | no disponible | 61,0 | 28,21 | no disponible |
| Gemma 4 26B A4B | 26B totales (A4B según nomenclatura del nombre) | no disponible | 57,40 | 40,32 | no disponible |
| Qwen3.6-35B-A3B | 35B totales (A3B según nomenclatura del nombre) | no disponible | 73,4† | 37,24 | no disponible |

El patrón que muestran los datos es que Dory1.0-4B con 4 bucles iguala o supera a Qwen3.5-9B en SWE-bench Verified (61,8 frente a 61,0) con menos de la mitad de parámetros, y queda por debajo de modelos MoE mucho mayores como Gemma 4 26B A4B en SciCode y Terminal-Bench. Los detalles de licencia y contexto de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte para inglés. No hay evidencia de calidad en castellano ni en otros idiomas, por lo que no es recomendable para producción multilingüe sin evaluación previa.
- Riesgo de alucinación: no se publican en la información disponible datos de calibración, tasas de alucinación ni evaluaciones de veracidad. Como cualquier LLM de 4B, debe usarse con verificación externa en dominios factuales.
- Sesgos: no se documentan en la información disponible análisis de sesgos, composición demográfica del dataset ni medidas de mitigación.
- Ambigüedad en el cómputo: la elasticidad por número de bucles significa que el rendimiento depende de una decisión de despliegue. Fijar 1 bucle reduce el coste pero degrada de forma notable los resultados (por ejemplo, 50,3 frente a 61,8 en SWE-bench Verified). Hay que documentar qué configuración se usa en cada entorno.
- Rendimiento agéntico limitado frente a modelos mayores: en Terminal-Bench 2.1 obtiene 22,2, por debajo de 35 de Gemma 4 26B A4B y de 43 de Qwen3.6-35B-A3B. No es adecuado para cadenas de acciones largas sin supervisión.
- Datos de benchmarks incompletos: la información disponible se trunca durante la tabla de resultados, de modo que no se pueden verificar todas las tareas evaluadas ni los valores completos.
- Licencia: OpenMDW 1.1 permite uso comercial según la tarjeta, pero conviene revisar el texto completo de la licencia (enlazado más abajo) para conocer obligaciones de atribución y condiciones de redistribución antes de integrarlo en un producto.
- Contexto largo: aunque se anuncian 256K tokens, no se publican resultados de evaluación en esa longitud (por ejemplo, tipo RULER o needle-in-a-haystack), por lo que la degradación efectiva con contextos muy largos es desconocida.
- Fecha de corte: los datos de preentrenamiento tienen corte en septiembre de 2025 y los de postentrenamiento en mayo de 2026. Cualquier evento posterior no estará reflejado.
- Métricas de hardware ausentes: no hay cifras publicadas de latencia, throughput ni consumo de memoria medidos, lo que obliga a hacer pruebas propias antes de dimensionar un despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-MXFP8
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Texto completo de la licencia OpenMDW 1.1 en GitHub: https://raw.githubusercontent.com/OpenMDW/OpenMDW/refs/heads/main/1.1/LICENSE.OpenMDW-1.1
- Página de desarrollador de NVIDIA Nemotron: https://developer.nvidia.com/nemotron
- Servidor de Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Conjunto de datos de postentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
- Conjunto de datos de preentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
- Sitio oficial de NVIDIA: https://www.nvidia.com/
- Entrada de NVIDIA en Wikipedia: https://en.wikipedia.org/wiki/Nvidia

Nota: la búsqueda web realizada no devolvió páginas específicas del modelo (paper técnico, blog de anuncio o repositorio de código); los resultados fueron páginas corporativas genéricas de NVIDIA. No se dispone, por tanto, de enlace a artículo técnico ni a demo.
