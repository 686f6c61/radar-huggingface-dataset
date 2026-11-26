# Rebine/Etsu-Embedding-0.8B-Memory-GGUF

## Resumen

Etsu-Embedding-0.8B-Memory-GGUF es la versión cuantizada en formato GGUF del modelo de embeddings de texto `Rebine/Etsu-Embedding-0.8B-Memory`, desarrollado por el usuario Rebine. Se trata de un modelo de representación densa (feature-extraction) orientado a similitud semántica, recuperación de información y, de forma destacada, recuperación de memoria (memory-retrieval). Está construido sobre el modelo base `Qwen/Qwen3.5-0.8B-Base` y expone 752.393.024 parámetros con una dimensión de embedding de 1024, con soporte de dimensiones Matryoshka (MRL) de 128, 256, 512, 768 y 1024.

El modelo se distribuye exclusivamente en GGUF, con tres cuantizaciones (F16, Q8_0 y Q4_K_M), lo que lo hace apto para despliegue en entornos con recursos limitados, incluido hardware de placa única como una Raspberry Pi 5. Su ventana de contexto es de 2048 tokens y soporta únicamente chino e inglés. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en la combinación de un tamaño reducido (menos de 800 M de parámetros), cuantizaciones muy compactas (el Q4_K_M ocupa 442 MiB) y un rendimiento medido en hardware de bajo consumo, con velocidades de hasta 146,3 tok/s en Raspberry Pi 5 con la build v1.0.0 de llama.cpp. Esto lo posiciona como candidato para sistemas de recuperación de memoria en asistentes locales y pipelines de RAG con presupuesto de memoria ajustado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 hybrid text model (24 capas: 18 de atención lineal + 6 de atención completa) |
| Parametros totales | 752.393.024 (752 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M (t4) |
| Idiomas soportados | Chino (zh), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (también existe el modelo base en safetensors) |

Datos adicionales relevantes: dimensión oculta 1024, vocabulario de 248.320 tokens, pooling de último token (LAST), normalización L2, similitud por coseno o producto escalar normalizado, precisión de entrenamiento BF16 y dimensiones MRL de 128, 256, 512, 768 y 1024.

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5 hybrid text model, una variante híbrida que combina 18 capas de atención lineal con 6 capas de atención completa sobre un total de 24 capas. Esta mezcla reduce el coste computacional y de memoria del mecanismo de atención en secuencias largas, manteniendo capacidad expresiva en las capas de atención completa. El tamaño oculto es de 1024 y el vocabulario de 248.320 tokens, coherente con la familia Qwen. La salida de embedding se obtiene mediante pooling de último token y se normaliza con L2, generando vectores de 1024 dimensiones compatibles con similitud por coseno.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El modelo base emplea precisión BF16 durante el entrenamiento. La innovación técnica más destacable documentada es el soporte de dimensiones Matryoshka (MRL) en cinco tamaños, que permite truncar los embeddings a 128, 256, 512 o 768 dimensiones con pérdida controlada de calidad, facilitando indexación vectorial de bajo coste. Las cuantizaciones GGUF incluyen una desviación deliberada respecto a la regla estándar de llama.cpp: en el Q4_K_M (t4) la tabla de embeddings ligada (`token_embd`, ~44% del archivo) se almacena como Q4_0 en lugar de Q6_K, reduciendo el tamaño en 62 MiB con una diferencia de calidad inferior a un error estándar (media +0,06 pp) en 4.967 casos de evaluación.

## Capacidades

- Generación de embeddings de texto densos de 1024 dimensiones para similitud semántica y recuperación de información.
- Soporte de dimensiones Matryoshka (128, 256, 512, 768, 1024) para truncado controlado de vectores.
- Recuperación de memoria (memory-retrieval), capacidad destacada en el nombre y las etiquetas del modelo.
- Similitud por coseno o producto escalar normalizado tras normalización L2.
- Pooling de último token (LAST), declarado en los metadatos de todos los archivos GGUF.
- Capacidades multilingües limitadas a chino e inglés.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue en infraestructura de Hugging Face.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Recuperación de memoria en asistentes conversacionales locales: el modelo está etiquetado explícitamente para memory-retrieval y puede indexar turnos previos de conversación como vectores de 1024 dimensiones, recuperando recuerdos relevantes en cada nueva consulta. Su contexto de 2048 tokens es suficiente para fragmentos de memoria individuales.
- RAG con presupuesto de memoria ajustado: el archivo Q4_K_M (442 MiB) permite desplegar un motor de embeddings completo en dispositivos con 1-2 GB de RAM libre, incluida una Raspberry Pi 5, manteniendo velocidades de 118,2 tok/s en la build v1.0.0 de llama.cpp.
- Búsqueda semántica bilingüe chino-inglés: adecuado para bases documentales que mezclan ambos idiomas, con similitud por coseno sobre vectores normalizados L2.
- Indexación vectorial de bajo coste con MRL: al truncar los embeddings a 128 o 256 dimensiones se reduce el almacenamiento y el coste de búsqueda en bases vectoriales grandes, con una penalización de calidad controlada (todas las dimensiones MRL se mantienen dentro de 0,5 pp en la evaluación del Q4_K_M t4).
- Deduplicación y clustering de documentos: la similitud por coseno sobre embeddings de 1024 dimensiones permite agrupar documentos near-duplicate en pipelines de limpieza de datos.
- Clasificación zero-shot por similitud: comparar la consulta con descripciones de categorías embebidas para asignar etiquetas sin entrenamiento adicional, útil en moderación de contenido o enrutamiento de tickets.
- Despliegue en edge o entornos air-gapped: el formato GGUF con llama.cpp permite ejecución offline en CPU sin dependencias de GPU, con huella de memoria dura de 585 MB (t4) o 917 MB (Q8_0) en la build v1.0.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, MTEB, etc.) en la información disponible. Los únicos datos de rendimiento proporcionados son mediciones de velocidad y memoria en Raspberry Pi 5 (Cortex-A76, 4 núcleos a 2,4 GHz) con llama.cpp:

| Build de llama.cpp | Archivo | tok/s (media) | Memoria dura (MB) | RSS pico (MB) |
|---|---|---:|---:|---:|
| v1.0.0 / b12359 | Q8_0 | 146,3 | 917 | 1752 |
| v1.0.0 / b12359 | Q4_K_M stock (no distribuido) | 118,0 | 648 | 1213 |
| v1.0.0 / b12359 | Q4_K_M (t4) | 118,2 | 585 | 1088 |
| b11312 | F16 | 41,6 | 1123 | no disponible |
| b11312 | Q8_0 | 55,1 | no disponible | no disponible |
| b11312 | Q4_K_M stock (no distribuido) | 60,9 | 1614 | no disponible |
| b11312 | Q4_K_M (t4) | 80,4 | 1552 | no disponible |

En la build b11312, el Q4_K_M (t4) fue 1,93x más rápido que F16 y 1,32x más rápido que el Q4_K_M stock; en v1.0.0 la ventaja frente al stock desaparece (1,00x) y Q8_0 pasa a ser el más rápido. La memoria dura se midió como `Anonymous + Swap` de `/proc/<pid>/smaps_rollup`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de información sobre modelos comparables en la información proporcionada. La comparación se limita a los propios archivos del repositorio:

| Modelo | Parámetros | Contexto | Dim. embedding | Licencia | Formato |
|---|---:|---:|---:|---|---|
| Etsu-Embedding-0.8B-Memory (Q4_K_M t4) | 752 M | 2048 | 1024 (MRL 128-1024) | Apache-2.0 | GGUF |
| Etsu-Embedding-0.8B-Memory (Q8_0) | 752 M | 2048 | 1024 (MRL 128-1024) | Apache-2.0 | GGUF |
| Etsu-Embedding-0.8B-Memory (F16) | 752 M | 2048 | 1024 (MRL 128-1024) | Apache-2.0 | GGUF |

Modelos alternativos de la misma categoría: no disponible.

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; el rendimiento en castellano u otros idiomas no está documentado y previsiblemente será deficiente.
- Contexto de solo 2048 tokens, insuficiente para documentos largos o conversaciones extensas sin fragmentación previa.
- No se han publicado resultados de benchmarks de calidad (MTEB u otros), por lo que la calidad de recuperación frente a alternativas no puede evaluarse con datos.
- Riesgo de alucinación no aplicable directamente al ser un modelo de embeddings, pero la similitud semántica puede producir falsos positivos en recuperación si los vectores se truncan agresivamente sin validación.
- La cuantización Q4_K_M (t4) modifica la tabla de embeddings a Q4_0 respecto al estándar; aunque la diferencia medida es inferior a un error estándar, introduce una desviación no estándar que conviene validar en el caso de uso concreto.
- El rendimiento depende fuertemente de la build de llama.cpp: las ventajas de velocidad del t4 desaparecen en v1.0.0, y los tok/s absolutos de builds distintas no son comparables.
- La memoria dura no siempre correlaciona con el tamaño del archivo: F16 tiene menor huella dura que Q8_0 porque sus pesos son páginas mmap respaldadas por fichero, y Q8_0 se repaqueta en una copia anónima (~780 MB) al cargar.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar la licencia del modelo base Qwen3.5-0.8B-Base enlazada en la model card.
- Solo 276 descargas y 0 likes en el momento de la consulta, lo que indica adopción y validación comunitaria muy limitadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rebine/Etsu-Embedding-0.8B-Memory-GGUF
- Modelo base (safetensors): https://huggingface.co/Rebine/Etsu-Embedding-0.8B-Memory
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base/blob/main/LICENSE
