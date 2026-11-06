# Rebine/Etsu-Embedding-0.8B-Memory

## Resumen

Etsu-Embedding-0.8B-Memory es un modelo de embeddings de texto desarrollado por Rebine, obtenido por ajuste fino del modelo base Qwen/Qwen3.5-0.8B-Base. Su propósito es la recuperación semántica de memoria de agentes y dominios afines: bases de conocimiento personales, archivos de conversaciones y documentación técnica, en chino e inglés. Con 752.393.024 parámetros, se posiciona como un especialista de dominio dentro de la familia Etsu, coexistente con la versión generalista Rebine/Etsu-Embedding-0.8B, de la que comparte arquitectura y protocolo de codificación pero difiere en datos y receta de entrenamiento.

El modelo emplea la arquitectura híbrida de texto de Qwen3.5, con 24 capas (18 de atención lineal y 6 de atención completa), tamaño oculto de 1024, tamaño intermedio de 3584 y un vocabulario de 248.320 tokens. Produce embeddings de 1024 dimensiones mediante last-token pooling y normalización L2, con soporte de truncamiento Matryoshka a 128, 256, 512 y 768 dimensiones. Su longitud de contexto es de 2048 tokens.

Su relevancia actual radica en que está entrenado específicamente sobre un conjunto de datos de recuperación de memoria reconstruido, lo que le permite superar a alternativas generalistas en su dominio objetivo: alcanza un Recall@6 del 83,46 % en el conjunto de validación sintético y del 78,00 % en consultas reales, frente al 70,43 % y 69,00 % de Qwen3-Embedding-0.6B. La contrapartida es un rendimiento inferior fuera de dominio, por lo que su uso debe restringirse a escenarios de recuperación de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 hybrid text model (18 capas de atención lineal + 6 de atención completa) |
| Parametros totales | 752.393.024 (752M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (entrenado y publicado en BF16; safetensors) |
| Idiomas soportados | chino, ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Dimension de embedding | 1024 (MRL: 128, 256, 512, 768, 1024) |
| Pooling | last-token pooling (última posición no-pad de attention_mask) |
| Normalizacion | L2 (tras truncamiento Matryoshka) |
| Similitud | coseno o producto escalar normalizado |
| Precisión de entrenamiento | BF16 |
| Modelo base | Qwen/Qwen3.5-0.8B-Base |
| Tamaño del repositorio | 1,5 GB |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B-Base, un transformer híbrido de texto que combina 18 capas de atención lineal con 6 capas de atención completa. Esta mezcla reduce el coste computacional de la atención en secuencias largas manteniendo la capacidad de modelado global de las capas de atención completa. El tamaño oculto es de 1024 y el intermedio de 3584, con un vocabulario de 248.320 tokens. La salida de embedding se obtiene mediante last-token pooling sobre la última posición no-pad y posterior normalización L2, con truncamiento Matryoshka opcional antes de la normalización.

El ajuste fino se realizó sobre un conjunto de datos de recuperación de memoria reconstruido, orientado a pares consulta-pasaje de memoria de agentes. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El protocolo de codificación es asimétrico: las consultas llevan el prefijo de instrucción `Instruct: Given a query, retrieve relevant passages that answer the query\nQuery: {query}`, mientras que los pasajes y memorias se codifican sin prefijo. Se requiere padding a la derecha para que la última posición no-pad corresponda al final real del texto.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación de información.
- Recuperación de memoria de agentes: diseñado específicamente para consultas contra memorias y pasajes almacenados.
- Soporte de consultas cortas por palabra clave y preguntas en lenguaje natural.
- Bilingüe chino-inglés.
- Truncamiento Matryoshka a 128, 256, 512 y 768 dimensiones para reducir coste de almacenamiento y búsqueda.
- Compatible con endpoints (tag `endpoints_compatible`) y con la librería transformers.
- No incluye tool calling, function calling, capacidades de agente multi-paso, visión ni audio: es exclusivamente un modelo de embeddings.

## Casos de uso

- Memoria de agentes conversacionales: el modelo indexa y recupera recuerdos de interacciones previas de un agente, con consultas en formato de instrucción y pasajes sin prefijo, aprovechando su entrenamiento específico en recuperación de memoria para mantener coherencia entre sesiones.
- Bases de conocimiento personales: permite búsqueda semántica sobre notas, documentos y archivos personales en chino o inglés, con recuperación de pasajes relevantes ante preguntas naturales o palabras clave sueltas.
- Archivo y búsqueda de conversaciones: indexación de historiales de chat para localizar mensajes o hilos relevantes mediante similitud coseno sobre embeddings de 1024 dimensiones.
- Documentación técnica: recuperación de fragmentos de documentación para asistentes de soporte o sistemas RAG internos, con la posibilidad de truncar a 512 o 768 dimensiones para reducir el almacenamiento del índice vectorial.
- Sistemas RAG en producción: integración como codificador de consultas y pasajes en pipelines de recuperación densa, con padding a la derecha y normalización L2 para usar producto escalar normalizado en bases vectoriales.
- Filtrado y deduplicación semántica: agrupación de memorias o documentos similares mediante umbrales de similitud coseno, útil para consolidar recuerdos redundantes en agentes de larga duración.
- Búsqueda multilingüe chino-inglés: recuperación cruzada entre consultas y pasajes en ambos idiomas dentro de un mismo espacio vectorial compartido.

## Benchmarks y rendimiento

Recuperación sobre corpus completo con coseno denso; los valores son Recall@6 salvo indicación contraria. Todas las filas usan el mismo protocolo de tokenizador, instrucción de consulta, pooling, normalización, corpus y conjunto de consultas.

Comparativa frente a Qwen/Qwen3-Embedding-0.6B:

| Conjunto | Dominio | Casos | Etsu-Memory R@6 | Qwen3-Embedding-0.6B R@6 |
|---|---|---:|---:|---:|
| valid | en dominio (consultas sintéticas) | 913 | 83,46 % | 70,43 % |
| golden | en dominio (consultas reales) | 100 | 78,00 % | 69,00 % |
| locomo | fuera de dominio, inglés | 1.977 | 67,53 % | 74,41 % |
| locomo_zh | fuera de dominio, chino | 1.977 | 62,32 % | 72,18 % |

Comparativa frente a Rebine/Etsu-Embedding-0.8B (receta anterior):

| Conjunto | Etsu-Memory R@6 | Etsu-0.8B R@6 |
|---|---:|---:|
| valid | 83,46 % | 80,28 % |
| golden (consultas reales) | 78,00 % | 74,00 % |
| locomo | 67,53 % | 75,77 % |
| locomo_zh | 62,32 % | 72,53 % |

Dimensiones Matryoshka (Recall@6):

| Dim | valid | golden |
|---:|---:|---:|
| 128 | 66,16 % | 65,00 % |
| 256 | 75,03 % | 70,00 % |
| 512 | 80,94 % | 71,00 % |
| 768 | 83,35 % | 77,00 % |
| 1024 | 83,46 % | 78,00 % |

Métricas principales a 1024 dimensiones:

| Conjunto | R@1 | R@3 | R@6 | R@10 | MRR@6 |
|---|---:|---:|---:|---:|---:|
| valid | 58,49 % | 75,36 % | 83,46 % | 86,86 % | 67,59 % |
| golden | 49,00 % | 69,00 % | 78,00 % | 82,00 % | 59,80 % |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en BF16 (752M parámetros), más el overhead de activaciones y del tokenizador; en la práctica, menos de 3 GB para lotes pequeños con contexto de 2048 tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes. Para codificación por lotes a gran escala conviene una GPU de datacenter (A100/H100) por throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más de VRAM.
- Opciones de despliegue: transformers (referencia oficial con el código de pooling incluido en la model card), endpoints compatibles, y servidores de embeddings basados en transformers. No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | R@6 en dominio (valid) | R@6 fuera de dominio (locomo) |
|---|---:|---:|---:|---|---:|---:|
| Etsu-Embedding-0.8B-Memory | 752M | 2048 | 1024 (MRL) | Apache-2.0 | 83,46 % | 67,53 % |
| Rebine/Etsu-Embedding-0.8B | 752M (misma base) | 2048 | 1024 (MRL) | Apache-2.0 | 80,28 % | 75,77 % |
| Qwen/Qwen3-Embedding-0.6B | 600M aprox. | no disponible | no disponible | no disponible | 70,43 % | 74,41 % |

Etsu-Memory es la mejor opción para recuperación de memoria en dominio, mientras que tanto la versión generalista Etsu-0.8B como Qwen3-Embedding-0.6B generalizan mejor fuera de dominio (LoCoMo en inglés y chino). La elección depende de si el corpus objetivo es memoria de agentes o recuperación general.

## Limitaciones y advertencias

- Especialista de dominio: en benchmarks fuera de dominio (LoCoMo en inglés y chino) queda por debajo tanto de la versión anterior Etsu-Embedding-0.8B como del baseline generalista Qwen3-Embedding-0.6B. Para recuperación general o entre dominios debe usarse Rebine/Etsu-Embedding-0.8B.
- Sin comportamiento de rechazo: las consultas sin respuesta en el corpus devuelven resultados igualmente; la gestión de "sin respuesta" debe implementarse con un umbral de puntuación aguas arriba.
- La calidad de recuperación está acoplada al chunking; la información disponible sobre este punto está truncada.
- Contexto limitado a 2048 tokens, insuficiente para pasajes o documentos largos sin troceado previo.
- Solo chino e inglés; no se declaran otros idiomas.
- Requiere implementar manualmente el pooling de last-token y el prefijo de instrucción de consulta; no es un paquete sentence-transformers con wrapper de pooling incorporado.
- Es obligatorio el padding a la derecha: con padding a la izquierda, la última posición no-pad no corresponde al final real del texto y los embeddings resultan incorrectos.
- Riesgo de sesgos y alucinación: no documentado en la información disponible; al ser un modelo de embeddings, el riesgo se traslada a la recuperación de pasajes irrelevantes, no a la generación de texto.
- Licencia Apache-2.0: permite uso comercial, con las obligaciones de atribución habituales de la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rebine/Etsu-Embedding-0.8B-Memory
- Versión generalista hermana: https://huggingface.co/Rebine/Etsu-Embedding-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base/blob/main/LICENSE
