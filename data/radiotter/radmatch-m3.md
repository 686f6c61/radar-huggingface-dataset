# RadiOtter/RadMatch-M3

## Resumen

RadMatch-M3 es un modelo de embeddings de texto especializado en radiología en inglés, desarrollado por RadiOtter. Su función concreta es ordenar candidatos de **impresión** (impression) para una sección de **hallazgos** (findings) de un informe radiológico. No genera informes ni impresiones: produce representaciones vectoriales densas para búsqueda semántica y recuperación de candidatos. Es un ajuste fino del modelo BAAI/bge-m3, un encoder basado en XLM-RoBERTa.

El modelo resuelve un problema acotado pero relevante en el procesamiento del lenguaje clínico: dado un conjunto de hallazgos radiológicos, encontrar la impresión diagnóstica más probable dentro de un corpus de impresiones emparejadas. La evaluación interna preliminar del autor reporta un Hit@1 del 77,3% sin filtrado de metadatos y del 91,7% con filtrado por subespecialidad, modalidad y procedimiento, frente a valores del 30-38% en modelos de embeddings generalistas como BGE-M3 original, Qwen3-Embedding-0.6B o EmbeddingGemma 2.

El checkpoint publicado (paso 5.954) corresponde al final de la segunda época de un entrenamiento planificado para tres. El modelo tiene 567.754.752 parámetros y una dimensión de embedding denso de 1.024. Está pensado para investigadores y desarrolladores que exploren recuperación de texto radiológico, y el propio autor advierte de que no ha sido validado clínicamente de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder XLM-RoBERTa (BGE-M3) |
| Parametros totales | 567.754.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la configuración de ajuste usa max_length 512 para queries y 256 para pasajes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible (la del modelo base BGE-M3 es MIT; la del checkpoint ajustado no está especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

RadMatch-M3 es un ajuste fino completo del encoder de BAAI/bge-m3, un transformer basado en XLM-RoBERTa. El ajuste se realizó sobre el encoder completo con la configuración de fine-tuning unificado y self-distillation de BGE-M3 habilitada, lo que activa las representaciones densa, dispersa (sparse) y ColBERT del modelo base. La dimensión del embedding denso es de 1.024. El checkpoint publicado corresponde al paso 5.954, al final de la segunda época de un entrenamiento planificado para tres.

La tarea de entrenamiento es el ranking de impresiones candidatas dada una sección de hallazgos. La evaluación interna cubre hallazgos e impresiones de radiología abdominal, mamaria, torácica, musculoesquelética, neurológica, medicina nuclear, obstetricia y ginecología, columna y vascular. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La comparación publicada evalúa únicamente recuperación densa; las representaciones sparse y ColBERT requieren evaluación separada según el autor.

## Capacidades

- Generación de embeddings densos de 1.024 dimensiones para texto radiológico en inglés.
- Ranking de impresiones candidatas para una sección de hallazgos dada.
- Búsqueda semántica y recuperación densa sobre corpus de informes radiológicos.
- Representaciones sparse y ColBERT habilitadas en el ajuste (sin evaluación publicada).
- Soporte de filtrado por metadatos (subespecialidad, modalidad, procedimiento) en el pipeline de recuperación.
- No genera texto: es un modelo de extracción de características, no un modelo generativo.
- No dispone de tool calling, capacidades de agente ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Recuperación de impresiones en sistemas de ayuda a la redacción de informes: dado un borrador de hallazgos, el modelo devuelve las impresiones más probables de un corpus histórico para que el radiólogo las revise y seleccione. Adecuado por su Hit@1 del 77,3% sin metadatos en la evaluación interna.
- Búsqueda semántica en archivos de informes radiológicos: indexar previamente los embeddings de las impresiones y codificar cada consulta de hallazgos con el mismo modelo para recuperar informes similares. La dimensión de 1.024 permite índices vectoriales estándar (FAISS, Qdrant, Milvus).
- Filtrado y normalización de datos clínicos: agrupar impresiones clínicamente equivalentes o detectar inconsistencias entre hallazgos e impresiones en grandes volúmenes de informes, usando el filtrado por subespecialidad y modalidad para reducir el espacio de candidatos.
- Sistemas de recuperación aumentada para investigación clínica: localizar informes con patrones de hallazgos similares para estudios retrospectivos, con la advertencia de que el modelo no está validado clínicamente.
- Asistencia a la codificación y estructuración de informes: emparejar hallazgos libres con impresiones estandarizadas de un catálogo institucional, aprovechando el filtrado por procedimiento para acotar candidatos (Hit@1 del 91,7% con los tres filtros en la evaluación interna).
- Evaluación comparativa de modelos de embeddings en dominios especializados: servir como referencia de ajuste fino en tareas de retrieval médico frente a embeddings generalistas, dado que el autor publica la comparación con cuatro alternativas.

## Benchmarks y rendimiento

Datos de la comparación interna preliminar del autor (no es validación clínica independiente). 3.004 consultas de hallazgos contra un corpus de 3.004 impresiones emparejadas. Hit@1 con coincidencia exacta normalizada:

| Modelo | Sin filtro de metadatos | Filtro subespecialidad | Subespecialidad + modalidad + procedimiento |
|---|---:|---:|---:|
| RadMatch-M3 | 77,3% | 78,5% | 91,7% |
| Qwen3-Embedding-0.6B | 38,1% | 40,3% | 70,1% |
| EmbeddingGemma 2 | 33,4% | 35,0% | 64,2% |
| BGE-M3 original | 30,5% | 32,6% | 63,8% |
| all-MiniLM-L6-v2 | 29,1% | 31,0% | 61,6% |

Con filtro de subespecialidad (conjunto medio de candidatos de aproximadamente 409 registros):

| Modelo | Hit@5 | Hit@10 | MRR@10 |
|---|---:|---:|---:|
| RadMatch-M3 | 90,7% | 94,9% | 0,838 |
| Qwen3-Embedding-0.6B | 58,1% | 66,4% | 0,480 |
| EmbeddingGemma 2 | 51,7% | 59,6% | 0,422 |
| BGE-M3 original | 46,5% | 54,1% | 0,388 |
| all-MiniLM-L6-v2 | 46,9% | 55,2% | 0,380 |

El autor advierte de que el split de evaluación tiene solapamiento textual conocido con el material de entrenamiento, por lo que los resultados no demuestran generalización a informes independientes. El corpus de candidatos es pequeño y las etiquetas de coincidencia exacta pueden penalizar alternativas clínicamente equivalentes. RadMatch-M3 se evaluó con FlagEmbedding y los demás modelos con ficheros GGUF mediante LM Studio, lo que puede afectar a la comparación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,1-1,2 GB solo para los pesos (567,7 M de parámetros); con activaciones y overhead de runtime, en torno a 2-3 GB.
- En fp32: aproximadamente 2,3 GB solo para pesos, coherente con el tamaño del repositorio (2,3 GB).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; A100, H100 o RTX 4090 son suficientes y sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores.
- Despliegue: FlagEmbedding (BGEM3FlagModel) según la model card; también es compatible con el ecosistema Transformers y con runtimes de embeddings estándar. No se documentan opciones específicas para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. La model card indica `use_fp16=False` por defecto y recomienda activarlo con GPU compatible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión embedding | Hit@1 sin filtro (evaluación del autor) | Licencia |
|---|---|---:|---:|---:|---|
| RadMatch-M3 | 567,7 M | no disponible | 1.024 | 77,3% | no disponible |
| BGE-M3 original | no disponible en la información | no disponible | 1.024 | 30,5% | MIT |
| Qwen3-Embedding-0.6B | aproximadamente 0,6 B | no disponible | no disponible | 38,1% | no disponible en la información |
| EmbeddingGemma 2 | no disponible | no disponible | no disponible | 33,4% | no disponible en la información |
| all-MiniLM-L6-v2 | no disponible | no disponible | no disponible | 29,1% | no disponible en la información |

La comparación se limita a la tarea de retrieval radiológico de la evaluación interna del autor; no implica superioridad en tareas generales de embeddings.

## Limitaciones y advertencias

- No validado clínicamente de forma independiente; no es una herramienta de diagnóstico.
- El split de evaluación tiene solapamiento textual con el entrenamiento, por lo que los resultados no demuestran generalización.
- El corpus de evaluación es pequeño (3.004 impresiones) y no representa una colección de producción a gran escala.
- Las etiquetas de coincidencia exacta pueden contar como error una impresión clínicamente equivalente.
- Solo inglés; no se documenta soporte multilingüe.
- Solo se ha evaluado la recuperación densa; sparse y ColBERT no tienen evaluación publicada.
- Riesgo de alucinación no aplica en sentido generativo (no genera texto), pero las impresiones recuperadas pueden ser incorrectas o incompletas.
- El rendimiento puede variar entre instituciones, modalidades, subespecialidades, estilos de informe y poblaciones de pacientes.
- La licencia del checkpoint ajustado no está especificada; la del modelo base es MIT, pero el uso comercial del ajuste requiere aclaración.
- El filtrado por metadatos asume que los metadatos están disponibles y son correctos en el momento de la recuperación.
- Checkpoint intermedio: segunda época de tres planificadas, por lo que puede no ser la versión final del autor.
- Requiere versiones concretas: FlagEmbedding 1.3.5 y transformers >=4.41,<5.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RadiOtter/RadMatch-M3
- Modelo base BGE-M3: https://huggingface.co/BAAI/bge-m3
