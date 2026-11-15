# Rebine/Etsu-Embedding-0.8B-Memory-GGUF

## Resumen

Etsu-Embedding-0.8B-Memory-GGUF es la versión cuantizada en formato GGUF del modelo de embeddings `Rebine/Etsu-Embedding-0.8B-Memory`, desarrollado por el usuario Rebine y publicado bajo licencia Apache-2.0. Se trata de un modelo de representación de texto (feature-extraction) derivado del modelo base Qwen3.5-0.8B de Alibaba, con 752 millones de parámetros y una dimensión de embedding de 1024, orientado a tareas de similitud semántica, recuperación de información y recuperación de memoria en conversaciones.

El modelo está específicamente afinado para recuperación de memoria (memory-retrieval), un caso de uso creciente en sistemas de agentes conversacionales que necesitan recordar información de interacciones previas. Soporta únicamente chino e inglés, con una longitud de contexto de 2048 tokens y pooling por último token con normalización L2. Incorpora dimensiones MRL (Matryoshka Representation Learning), lo que permite truncar el embedding a 128, 256, 512 o 768 dimensiones con una degradación controlada.

La relevancia de esta publicación GGUF radica en su orientación a despliegues en hardware modesto: el autor documenta con detalle el rendimiento en una Raspberry Pi 5, incluyendo métricas de memoria residente no reclamable y comparativas entre builds de llama.cpp. El repositorio ocupa 5,8 GB e incluye tres cuantizaciones (F16, Q8_0 y Q4_K_M), con una variante Q4_K_M personalizada que reduce el tamaño del archivo a 442 MiB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 hybrid text model (18 capas de atención lineal + 6 de atención completa) |
| Parámetros totales | 752.393.024 (752M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | F16, Q8_0, Q4_K_M (t4, variante propia con `token_embd` en Q4_0) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

Datos adicionales: dimensión de embedding de 1024 con MRL a 128, 256, 512, 768 y 1024; hidden size de 1024; vocabulario de 248.320 tokens; pooling de último token con normalización L2; precisión de entrenamiento BF16.

## Arquitectura y entrenamiento

El modelo se construye sobre `Qwen/Qwen3.5-0.8B-Base`, una arquitectura híbrida de 24 capas en la que 18 son de atención lineal y solo 6 de atención completa, con un hidden size de 1024 y un vocabulario de 248.320 entradas. Esta combinación reduce el coste computacional del procesamiento de secuencias largas en comparación con un transformer de atención completa pura, algo relevante para un modelo de embeddings que debe procesar documentos completos.

La model card no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si hubo fases de RLHF o DPO; esta información no está disponible. Sí se especifica la configuración de inferencia: pooling por último token, normalización L2 de la salida y similitud coseno como métrica de comparación. La innovación destacable es el soporte de Matryoshka Representation Learning, que permite truncar el vector de 1024 dimensiones a 128, 256, 512 o 768 sin reentrenar, facilitando el equilibrio entre precisión y coste de almacenamiento en índices vectoriales.

## Capacidades

- Generación de embeddings de texto para similitud semántica (sentence-similarity) con similitud coseno o producto escalar normalizado.
- Recuperación de información (information-retrieval) sobre corpus documentales.
- Recuperación de memoria (memory-retrieval) en sistemas conversacionales y agentes.
- Embeddings truncables mediante MRL a 128, 256, 512, 768 o 1024 dimensiones.
- Soporte bilingüe chino-inglés.
- Integración con el endpoint de embeddings de llama.cpp (`--embedding --pooling last`).
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- No dispone de tool calling, agentes, visión ni audio: es un modelo exclusivamente de representación.

## Casos de uso

- Recuperación de memoria en agentes conversacionales: el modelo está afinado para memory-retrieval, de modo que puede indexar turnos previos de una conversación y recuperar los fragmentos relevantes cuando el usuario retoma un tema, gracias a su ventana de 2048 tokens por fragmento.
- Búsqueda semántica en documentación técnica bilingüe: permite construir índices vectoriales sobre documentación en chino e inglés y resolver consultas por significado en lugar de por coincidencia léxica.
- Deduplicación y agrupación de contenidos: al generar embeddings normalizados de 1024 dimensiones, se pueden calcular similitudes por pares para detectar duplicados o agrupar artículos temáticamente.
- Clasificación de textos por similitud con prototipos: se calculan embeddings de frases de referencia por categoría y se asigna la clase más cercana por similitud coseno, sin necesidad de reentrenar un clasificador.
- Despliegue en dispositivos de borde: con la cuantización Q4_K_M (442 MiB), el modelo cabe y funciona en una Raspberry Pi 5 con 4 GB, lo que permite búsqueda semántica local sin dependencia de la nube.
- Sistemas de preguntas y respuestas sobre base documental (RAG): actúa como recuperador en la primera fase del pipeline, seleccionando los pasajes más relevantes antes de pasarlos a un modelo generativo.
- Filtrado de candidatos en pipelines de moderación o recomendación: los embeddings truncados a 128 o 256 dimensiones permiten cribados rápidos con menor coste de memoria y después refinar con la dimensión completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, MTEB, etc.) en la información disponible. El autor sí documenta métricas de rendimiento de inferencia en Raspberry Pi 5 (Cortex-A76, 4 núcleos a 2,4 GHz) con llama-server:

| Archivo | Build llama.cpp | tok/s | Memoria dura | RSS pico |
|---|---|---:|---:|---:|
| F16 | b11312 | 41,6 | 1123 MB | no disponible |
| Q8_0 | b11312 | 55,1 | no disponible | no disponible |
| Q4_K_M stock (no publicado) | b11312 | 60,9 | 1614 MB | no disponible |
| Q4_K_M (t4) | b11312 | 80,4 | 1552 MB | no disponible |
| Q8_0 | v1.0.0 (b12359) | 146,3 | 917 MB | 1752 MB |
| Q4_K_M stock (no publicado) | v1.0.0 (b12359) | 118,0 | 648 MB | 1213 MB |
| Q4_K_M (t4) | v1.0.0 (b12359) | 118,2 | 585 MB | 1088 MB |

En b11312, la variante t4 es 1,93x más rápida que F16 y 1,32x más rápida que el Q4_K_M estándar; en v1.0.0 ambos Q4_K_M igualan rendimiento (1,00x) mientras Q8_0 pasa a ser el más rápido. En calidad, el autor indica que la variante t4 difiere del Q4_K_M estándar en +0,06 pp de media sobre 4.967 casos (valid, golden, locomo, locomo_zh), con todas las dimensiones MRL dentro de 0,5 pp.

## Requisitos de hardware

- VRAM/memoria para F16: archivo de 1.516.744.256 bytes (unos 1,4 GiB); en Raspberry Pi 5 el autor mide 1123 MB de memoria dura gracias a que los pesos quedan en páginas mmap respaldadas por archivo, reclamables por el kernel.
- Q8_0: archivo de 812.396.096 bytes (unos 775 MiB); memoria dura de 917 MB y RSS pico de 1752 MB en Pi 5, porque llama.cpp lo reempaqueta en una copia anónima adicional de unos 780 MB.
- Q4_K_M (t4): archivo de 463.740.480 bytes (442 MiB); memoria dura de 585 MB y RSS pico de 1088 MB en Pi 5.
- Cabe en GPUs de consumo: con 442 MiB a 1,4 GiB de pesos, cualquier GPU con 2 GB o más de VRAM puede alojarlo.
- GPU recomendadas: no se especifican en la documentación; por tamaño, cualquier GPU moderna de consumo (RTX 3060 o superior) o profesional (A100, H100) es sobredimensionada para este modelo y permitiría lotes grandes.
- Opciones de despliegue: llama.cpp (`llama-server --embedding --pooling last`), cualquier runtime compatible con GGUF. El autor no menciona vLLM, TGI ni Ollama.
- Rendimiento medido: 118,2 tok/s (Q4_K_M t4) y 146,3 tok/s (Q8_0) en Raspberry Pi 5 con llama.cpp v1.0.0, `-ub 1024`, 4 hilos; latencia mediana por documento de 6,04 s y por consulta de 297 ms con t4 en b11312.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparación de calidad con alternativas. A continuación se comparan características estructurales con modelos de embedding de tamaño comparable, usando solo datos conocidos:

| Modelo | Parámetros | Contexto | Idiomas | Dimensión | Licencia |
|---|---|---:|---|---:|---|
| Etsu-Embedding-0.8B-Memory-GGUF | 752M | 2048 | zh, en | 1024 (MRL) | Apache-2.0 |
| Qwen3.5-0.8B-Base (modelo base) | 752M | no disponible | no disponible | no aplica (generativo) | Apache-2.0 |
| Alternativas de embedding de ~0.5-1B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks en la información disponible que permitan comparar el rendimiento de este modelo con alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo soporta chino e inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Contexto limitado a 2048 tokens: los documentos más largos deben trocearse antes de generar embeddings.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso; su única salida es un vector de representación.
- Riesgo de alucinación no aplicable en sentido estricto, pero sí de recuperaciones irrelevantes si el dominio de los documentos difiere del corpus de entrenamiento, cuya composición no se detalla.
- La variante Q4_K_M (t4) se desvía de la receta estándar de llama.cpp (tabla de embeddings en Q4_0 en lugar de Q6_K); el autor reporta una diferencia de calidad inferior a un error estándar, pero conviene validar en el dominio propio.
- El rendimiento depende fuertemente de la build de llama.cpp: las cifras de b11312 y v1.0.0 no son comparables entre sí, y el orden de velocidad entre Q8_0 y Q4_K_M se invierte según la versión.
- La memoria dura de Q8_0 puede superar a la de F16 por el reempaquetado interno de llama.cpp; en dispositivos con poca RAM conviene medir en lugar de asumir que un archivo menor requiere menos memoria.
- Licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base Qwen3.5-0.8B-Base; conviene revisar la licencia original enlazada por el autor.
- El repositorio tiene muy poca tracción (146 descargas, 0 likes) y documentación de calidad limitada a la model card, sin evaluación independiente.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/Rebine/Etsu-Embedding-0.8B-Memory-GGUF
- Modelo base (no cuantizado): https://huggingface.co/Rebine/Etsu-Embedding-0.8B-Memory
- Modelo fundacional Qwen3.5-0.8B-Base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base/blob/main/LICENSE
