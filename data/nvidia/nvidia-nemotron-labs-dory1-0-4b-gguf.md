# nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-GGUF

## Resumen

NVIDIA-Nemotron-Labs-Dory1.0-4B es un modelo de lenguaje de ~4.000 millones de parámetros (3.975.229.440 según los pesos en safetensors) desarrollado por NVIDIA dentro de su línea Nemotron Labs. Su rasgo diferencial es la arquitectura: un GPT normalizado (nGPT) con bucle latente-recurrente, en el que un bloque compartido de 20 capas se aplica varias veces entre un bloque de entrada de 8 capas y uno de salida de 8 capas, intercalando atención de ventana deslizante (SWA) con capas de atención completa. El modelo está publicado en varios formatos (BF16, MXFP8, NVFP4 y Q5_K_M) y este repositorio concreto contiene la versión cuantizada en GGUF Q5_K_M, con un tamano de repositorio de 3,7 GB.

El problema que resuelve es el de ajustar el coste de inferencia al presupuesto disponible sin cambiar de checkpoint: al variar el número de veces que se aplica el bloque recurrente (1, 2 o 4 bucles) se intercambia cómputo por precisión, con soporte de caché KV del último bucle para que la memoria no crezca con cada iteración. La ventana de contexto declarada llega hasta 256K tokens y el modelo está orientado a razonamiento general, código y flujos agénticos en inglés.

Es relevante ahora porque combina un pie de parámetros pequeño con resultados competitivos en tareas de código y agentes frente a modelos de 4B, 9B e incluso mezclas MoE mucho mayores, y porque fue preentrenado de forma nativa en NVFP4, el formato de coma flotante de 4 bits de NVIDIA, antes de continuar en BF16. La fecha de publicación indicada es el 16 de octubre de 2026 y la licencia es OpenMDW 1.1, que permite uso comercial y no comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT normalizado (nGPT) con bucle latente-recurrente; atención de ventana deslizante (SWA) intercalada con capas de atención completa |
| Parámetros totales | 3.975.229.440 (~4B) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | hasta 256K tokens |
| Tipos de cuantización | Q5_K_M en este repositorio; el modelo también se distribuye en BF16, MXFP8 y NVFP4 |
| Idiomas soportados | inglés (en) |
| Licencia | OpenMDW License Agreement, versión 1.1 (openmdw-1.1) |
| Formato de pesos | GGUF en este repositorio; BF16, MXFP8 y NVFP4 en repositorios separados (formato de empaquetado no confirmado) |
| Descomposición de capas | 8 capas de entrada (I) + 20 capas recurrentes compartidas (R) + 8 capas de salida (O) |
| Caché KV | caché del último bucle (last-loop KV caching): una sola caché por capa de atención recurrente |
| Precisión de referencia | Q5_K_M en este repositorio |
| Fecha de publicación | 16 de octubre de 2026 |
| Corte de datos de preentrenamiento | septiembre de 2025 |
| Corte de datos de postentrenamiento | mayo de 2026 |
| Idiomas | en |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

Dory1.0-4B se basa en una columna nGPT dividida en tres grupos: un bloque de entrada de 8 capas, un bloque recurrente de 20 capas que se comparte y se aplica repetidamente, y un bloque de salida de 8 capas. La entrada se reinyecta en cada bucle, de modo que el modelo puede dedicar más cómputo por token sin aumentar el número de parámetros; según la model card, ese cómputo extra se emplea en "pensar" en espacio latente en lugar de generar más tokens. La atención combina capas de ventana deslizante con capas de atención completa de forma intercalada, lo que sostiene la ventana declarada de hasta 256K tokens.

El preentrenamiento se realizó de forma nativa en NVFP4, el formato de 4 bits de NVIDIA, y continuó después en BF16. Los conjuntos de datos citados son nvidia/nemotron-pre-training-datasets (preentrenamiento) y nvidia/nemotron-post-training-v3 (postentrenamiento); la model card no especifica el número de tokens, la composición del dataset ni las técnicas concretas de alineación (RLHF, DPO u otras). Las fechas de trabajo del modelo abarcan de julio a septiembre de 2026, con cortes de datos de septiembre de 2025 para preentrenamiento y mayo de 2026 para postentrenamiento. La innovación operativa más destacable es la caché KV del último bucle: en una arquitectura con bucles estándar cada iteración mantendría su propia caché y la memoria crecería con el número de bucles, mientras que aquí se mantiene una única caché por capa de atención recurrente, sin sobrecoste de memoria respecto a un modelo equivalente sin bucles.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de conversación (tag `conversational`).
- Razonamiento de propósito general en un pie de parámetros pequeño, según la propia model card ("general-purpose reasoning on a small footprint").
- Código científico: evaluado en SciCode, con mejora al aumentar el número de bucles (27,3 con 1 bucle; 35,11 con 4).
- Ingeniería de software y resolución de incidencias en repositorios: evaluado en SWE-bench Verified (50,3 con 1 bucle; 61,8 con 4).
- Uso de terminal y entornos de línea de comandos: evaluado en Terminal-Bench 2.1 (12,5 con 1 bucle; 22,2 con 4).
- Tareas agénticas con herramientas y transacciones: evaluado en τ³-bench (Banking), con 11,6 / 12,89 / 14,69 según bucles. El soporte formal de tool calling o function calling no se detalla en la información disponible.
- Cómputo de inferencia elástico: un mismo checkpoint admite distintos presupuestos de cómputo cambiando el número de bucles, sin reentrenar ni cambiar de modelo.
- Eficiencia de tokens: el modelo tiende a necesitar menos tokens generados para resolver una tarea, porque el cómputo adicional se destina al bucle latente.
- Capacidades multimodales (visión, audio) no documentadas: no disponibles.
- Capacidades multilingües: limitadas al inglés; no se declaran otros idiomas.

## Casos de uso

- Agentes de resolución de incidencias en repositorios: con 4 bucles alcanza 61,8 en SWE-bench Verified con solo 4B de parámetros, por lo que puede ejecutarse como agente de parcheo en un pipeline de CI/CD sin depender de un modelo de decenas de miles de millones de parámetros.
- Asistentes de terminal y automatización de shell: sus resultados en Terminal-Bench 2.1 (22,2 con 4 bucles) lo hacen utilizable para tareas de operación de sistemas, interpretación de salidas de comandos y corrección iterativa de errores.
- Agentes de banca y back office transaccional: la evaluación en τ³-bench (Banking) apunta a flujos multi-turno con herramientas y validación de operaciones, un escenario típico de atención al cliente con reglas de negocio.
- Generación y revisión de código científico: en SciCode pasa de 27,3 a 35,11 al subir de 1 a 4 bucles, por lo que es adecuado para prototipado numérico, scripts de análisis y traducción de fórmulas a código.
- Procesado de documentos largos en inglés: la ventana de 256K tokens permite resumir, extraer y consultar contratos, informes o documentación técnica extensa sin troceado agresivo, siempre que el contenido esté en inglés.
- Despliegue en hardware de gama de consumo: el repositorio GGUF Q5_K_M (3,7 GB) cabe en GPUs con 8-12 GB de VRAM, lo que permite asistentes locales de razonamiento sin conexión y sin coste por token.
- Servicio con latencia ajustable por presupuesto: en producción se puede fijar 1 bucle para peticiones de baja latencia y 4 bucles para tareas por lotes donde prima la precisión, usando el mismo checkpoint.
- Investigación sobre arquitecturas recurrentes y cuantización de 4 bits: al publicarse en NVFP4, MXFP8 y BF16, sirve como banco de pruebas para estudiar el compromiso entre bucles, precisión y memoria.

## Benchmarks y rendimiento

Resultados publicados en la model card. Las celdas marcadas con "†" corresponden a puntuaciones reportadas por terceros; los guiones indican resultados no disponibles. La tabla original de la model card aparece truncada en la información disponible, por lo que solo se reproducen las filas completas.

| Tarea | Dory1.0-4B (1 bucle) | Dory1.0-4B (2 bucles) | Dory1.0-4B (4 bucles) | Qwen3.5-4B | Qwen3.5-9B | Gemma 4 26B A4B | Qwen3.6-35B-A3B |
|---|---|---|---|---|---|---|---|
| SciCode | 27,3 | 34,94 | 35,11 | 25,82 | 28,21 | 40,32 | 37,24 |
| SWE-bench Verified | 50,3 | 59,5 | 61,8 | 54,7 | 61,0 | 57,40 | 73,4† |
| Terminal-Bench 2.1 | 12,5 | 18,1 | 22,2 | 15 | 24 | 35 | 43 |
| τ³-bench (Banking) | 11,6 | 12,89 | 14,69 | 5,03 | 7,22 | no disponible | no disponible |

Observaciones derivadas de los datos anteriores: el rendimiento crece de forma monótona con el número de bucles en las cuatro tareas; con 4 bucles supera a Qwen3.5-4B en SciCode, SWE-bench Verified y τ³-bench (Banking), y queda por detrás de Qwen3.5-9B y de los modelos MoE de mayor tamaño en Terminal-Bench 2.1. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras evaluaciones de conocimiento general.

## Requisitos de hardware

- VRAM estimada para los pesos en Q5_K_M: aproximadamente 2,7-3,0 GB de pesos (5,5 bits por parámetro sobre 3,975.229.440 parámetros) y 3,7 GB de repositorio; con overhead de runtime, en torno a 4-5 GB con contexto moderado. Estimación propia, no publicada por el autor.
- VRAM estimada en BF16: unos 8 GB solo de pesos, más caché KV; en torno a 10-12 GB en la práctica.
- VRAM estimada en NVFP4: unos 2 GB de pesos, alrededor de 3-4 GB con overhead. Estimación propia.
- Caché KV: no se especifica su tamaño por token en la información disponible. La ventana de 256K tokens implica un consumo elevado a longitudes máximas, aunque la caché del último bucle evita que la memoria crezca con el número de bucles.
- GPU de consumo: el formato Q5_K_M debería caber en tarjetas de 8 GB o más (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090). En 8 GB el contexto útil quedará limitado por la caché KV. Estimación propia.
- GPU profesionales: A100, H100 o L40S para servir la variante BF16/NVFP4 con contextos largos o alto paralelismo.
- Opciones de despliegue: el archivo GGUF es compatible con llama.cpp, Ollama y LM Studio. Para BF16 y NVFP4 se requiere un runtime que soporte la arquitectura de bucle latente; el soporte en vLLM, TGI o TensorRT-LLM no está confirmado en la información disponible.
- Latencia y throughput: no disponibles. Cualitativamente, el cómputo por token crece con el número de bucles, de modo que 4 bucles implican más trabajo por token que 1 bucle sobre el mismo checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | SWE-bench Verified | Terminal-Bench 2.1 |
|---|---|---|---|---|---|---|
| Dory1.0-4B (4 bucles) | ~4B denso | 256K | OpenMDW 1.1 | GGUF Q5_K_M, BF16, MXFP8, NVFP4 | 61,8 | 22,2 |
| Dory1.0-4B (1 bucle) | ~4B denso | 256K | OpenMDW 1.1 | misma | 50,3 | 12,5 |
| Qwen3.5-4B | 4B (no confirmado si denso o MoE) | no disponible | no disponible | no disponible | 54,7 | 15 |
| Qwen3.5-9B | 9B (no confirmado) | no disponible | no disponible | no disponible | 61,0 | 24 |
| Gemma 4 26B A4B | 26B con ~4B activos (MoE) | no disponible | no disponible | no disponible | 57,40 | 35 |
| Qwen3.6-35B-A3B | 35B con ~3B activos (MoE) | no disponible | no disponible | no disponible | 73,4† | 43 |

La comparación se limita a los datos publicados en la model card de Dory1.0-4B: de los modelos de referencia no se dispone de contexto, licencia ni formato de pesos en la información proporcionada. La ventaja principal de Dory1.0-4B en esta tabla es la relación entre tamaño (4B densos) y resultados, especialmente con 4 bucles, frente a MoE de 26B y 35B con muchos más parámetros totales.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés. Cualquier uso en castellano u otros idiomas no está validado y previsiblemente degradará la calidad.
- Sensibilidad al número de bucles: los resultados varían de forma notable entre 1, 2 y 4 bucles (por ejemplo, 50,3 frente a 61,8 en SWE-bench Verified). Cualquier cifra de rendimiento debe ir acompañada de la configuración de bucles empleada.
- Datos de benchmarks incompletos: la tabla de la model card está truncada en la información disponible y faltan tareas habituales (MMLU, HumanEval, GSM8K, evaluaciones multilingües), por lo que no puede hacerse una evaluación global del modelo.
- Riesgo de alucinación: no se documentan en la información disponible medidas específicas de mitigación, tasas de alucinación ni evaluaciones de veracidad. Como en cualquier LLM, el riesgo existe y debe gestionarse con verificación externa, especialmente en dominios regulados como el bancario (τ³-bench).
- Sesgos: no se publica ninguna evaluación de sesgos, toxicidad o equidad en la información disponible.
- Soporte de tool calling: aunque se evalúa en un banco agéntico, la model card no detalla el formato de llamada a herramientas ni las garantías de esquema, lo que exige validación propia antes de usarlo en producción.
- Contexto largo: se declara hasta 256K tokens, pero no hay resultados publicados de recuperación efectiva ("needle in a haystack") a longitudes máximas.
- Licencia: OpenMDW 1.1 permite uso comercial y no comercial según la model card, pero conviene revisar el texto completo de la licencia antes de integrarlo en productos, ya que es una licencia "other" y no una licencia OSI estándar.
- Madurez del ecosistema: el repositorio registra 0 descargas y 3 "me gusta" en el momento de la consulta, y la arquitectura de bucle latente puede no estar soportada por todos los runtimes de inferencia (vLLM, TGI, TensorRT-LLM) más allá de llama.cpp y derivados.
- Cuantización: este repositorio solo ofrece Q5_K_M; no se documentan evaluaciones de la pérdida de calidad de esa cuantización frente a BF16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-GGUF
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia OpenMDW 1.1: https://raw.githubusercontent.com/OpenMDW/OpenMDW/refs/heads/main/1.1/LICENSE.OpenMDW-1.1
- Página de desarrollador de NVIDIA Nemotron: https://developer.nvidia.com/nemotron
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Dataset de postentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
- Datasets de preentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada.
