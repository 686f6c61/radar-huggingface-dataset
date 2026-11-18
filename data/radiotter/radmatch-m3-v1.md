# RadiOtter/Radmatch-M3-V1

## Resumen

Radmatch-M3-V1 es un modelo de embeddings de texto especializado en radiología en inglés, desarrollado por RadiOtter. Su función concreta es ordenar por relevancia impresiones diagnósticas candidatas para una sección de hallazgos radiológicos dada. Se trata de un ajuste fino completo del encoder BGE-M3 de BAAI, orientado a recuperación semántica densa mediante similitud coseno entre embeddings normalizados.

El modelo no genera informes ni impresiones: solo produce representaciones vectoriales para búsqueda semántica. La release publicada corresponde al checkpoint 5954, guardado al final de la segunda época de un entrenamiento planificado para tres, por lo que no es un modelo final. La arquitectura subyacente es un encoder basado en XLM-RoBERTa con dimensión de embedding denso de 1.024 y 567.754.752 parámetros totales.

Su relevancia actual radica en que aborda una tarea muy específica del dominio médico (emparejamiento hallazgos-impresiones en radiología) donde los modelos de embeddings generalistas rinden muy por debajo, según la comparación interna publicada por el autor. No obstante, esa evaluación es preliminar, con solapamiento textual conocido entre entrenamiento y test, y no constituye validación clínica independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder basado en XLM-RoBERTa (BGE-M3) |
| Parámetros totales | 567.754.752 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como especificación formal; el ejemplo de uso emplea max_length de 512 para hallazgos y 256 para impresiones, con posible truncado en entradas más largas |
| Tipos de cuantización | no disponible (el repo contiene safetensors; el ejemplo usa fp16 opcional) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible para este checkpoint (el modelo base BGE-M3 es MIT) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de BAAI/bge-m3, un encoder basado en XLM-RoBERTa que produce embeddings densos de 1.024 dimensiones y que además soporta representaciones sparse y ColBERT multi-vector. El ajuste fino de Radmatch-M3-V1 afecta al encoder completo (full encoder fine-tuning) y activa las tres representaciones de BGE-M3 (densa, sparse y ColBERT) junto con fine-tuning unificado y self-distillation. La comparación publicada evalúa únicamente recuperación densa; sparse y ColBERT quedan pendientes de evaluación separada.

El entrenamiento se planificó para tres épocas, pero la release corresponde al checkpoint 5954, guardado al final de la segunda época. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables de forma típica a un modelo de embeddings). La cobertura declarada de la evaluación interna abarca hallazgos e impresiones de radiología abdominal, mamaria, torácica, musculoesquelética, neurología, medicina nuclear, obstetricia-ginecología, columna y vascular.

## Capacidades

- Generación de embeddings de texto para recuperación semántica densa (feature-extraction).
- Ranking de impresiones radiológicas candidatas dada una sección de hallazgos.
- Similitud coseno sobre vectores normalizados de 1.024 dimensiones.
- Soporte de las representaciones densa, sparse y ColBERT heredadas de BGE-M3 (solo la densa ha sido evaluada).
- Procesamiento de texto en inglés exclusivamente.
- No genera texto, informes ni impresiones: es un modelo de representación, no generativo.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso (no aplicable a su naturaleza).
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Búsqueda semántica de impresiones en un archivo radiológico: se precomputan los embeddings de todas las impresiones del corpus y se indexan; cada nueva sección de hallazgos se codifica con el mismo modelo y se recuperan las impresiones más similares por producto escalar de vectores normalizados.
- Asistencia a la redacción de informes: dado un borrador de hallazgos, el sistema sugiere impresiones históricas similares para que el radiólogo las revise y adapte, sin que el modelo redacte directamente.
- Filtrado y agrupación de informes por similitud semántica: agrupar estudios con hallazgos parecidos para auditoría de calidad o control de variabilidad entre radiólogos.
- Construcción de sistemas de recuperación aumentada (RAG) sobre bases de informes radiológicos: usar los embeddings como recuperador para alimentar un LLM generador que redacte borradores revisables.
- Deduplicación y normalización de impresiones: identificar impresiones clínicamente equivalentes expresadas con distinta redacción dentro de un mismo servicio.
- Investigación en procesamiento de lenguaje clínico: experimentación con recuperación densa en subespecialidades concretas (torácica, abdominal, musculoesquelética, etc.) usando los filtros de metadatos de subespecialidad, modalidad y procedimiento.
- Etiquetado asistido de pares hallazgos-impresión: pre-seleccionar candidatos para anotación humana en la construcción de datasets clínicos.

## Benchmarks y rendimiento

Comparación interna y preliminar publicada por el autor, no validada clínicamente. 3.004 consultas de hallazgos contra un corpus de 3.004 impresiones emparejadas; coincidencia por igualdad exacta de texto normalizado. Hit@1:

| Modelo | Sin filtro de metadatos | Filtro de subespecialidad | Subespecialidad + modalidad + procedimiento |
|---|---:|---:|---:|
| Radmatch-M3-V1 | 77,3% | 78,5% | 91,7% |
| Qwen3-Embedding-0.6B | 38,1% | 40,3% | 70,1% |
| EmbeddingGemma 2 | 33,4% | 35,0% | 64,2% |
| BGE-M3 original | 30,5% | 32,6% | 63,8% |
| all-MiniLM-L6-v2 | 29,1% | 31,0% | 61,6% |

Con filtro de subespecialidad, el conjunto medio de candidatos fue de aproximadamente 409 registros; con el filtro de tres campos, de aproximadamente 44. Hit@5, Hit@10 y MRR@10 con filtro de subespecialidad:

| Modelo | Hit@5 | Hit@10 | MRR@10 |
|---|---:|---:|---:|
| Radmatch-M3-V1 | 90,7% | 94,9% | 0,838 |
| Qwen3-Embedding-0.6B | 58,1% | 66,4% | 0,480 |
| EmbeddingGemma 2 | 51,7% | 59,6% | 0,422 |
| BGE-M3 original | 46,5% | 54,1% | 0,388 |
| all-MiniLM-L6-v2 | 46,9% | 55,2% | 0,380 |

Advertencias del propio autor: el split de evaluación presenta solapamiento textual conocido con el material de entrenamiento; el corpus de candidatos es pequeño; las etiquetas de coincidencia exacta pueden penalizar alternativas clínicamente equivalentes; Radmatch-M3-V1 se ejecutó con FlagEmbedding mientras que los demás usaron GGUF a través de LM Studio, lo que puede afectar a la comparación por diferencias de runtime, precisión y tratamiento de entrada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB solo de pesos (567,7 M de parámetros), más overhead de activaciones y tokenizador.
- En fp16: aproximadamente 1,1-1,2 GB de pesos, más overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 en lotes pequeños; A100, H100 o RTX 4090 no son necesarias para este tamaño, pero aceleran el procesamiento por lotes de corpus grandes.
- Cabe en GPU de consumo: sí, en tarjetas con 4-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) usando fp16.
- Opciones de despliegue: FlagEmbedding (BGEM3FlagModel, usado en el ejemplo oficial) con Transformers >= 4.41 y < 5; también es compatible con el ecosistema de BGE-M3 en la medida en que el checkpoint mantenga la estructura del base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Hit@1 (subesp.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Radmatch-M3-V1 | 567,7 M | no disponible formalmente | 78,5% | no disponible (base MIT) | Hugging Face, 0 descargas |
| BGE-M3 (BAAI) | no disponible en la información | no disponible | 32,6% | MIT | Hugging Face, ampliamente usado |
| Qwen3-Embedding-0.6B | ~0,6 B | no disponible | 40,3% | no disponible en la información | Hugging Face |
| EmbeddingGemma 2 | no disponible | no disponible | 35,0% | no disponible en la información | Hugging Face |
| all-MiniLM-L6-v2 | no disponible | no disponible | 31,0% | no disponible en la información | Hugging Face |

La comparación de rendimiento procede de la evaluación interna del autor y no de un benchmark independiente; los datos de parámetros, contexto y licencia de los modelos alternativos no se detallan en la información disponible.

## Limitaciones y advertencias

- Modelo no validado clínicamente: no es una herramienta de diagnóstico y requiere revisión por un profesional cualificado antes de cualquier uso en flujo clínico.
- Evaluación preliminar e interna: el split de test tiene solapamiento textual con el entrenamiento, por lo que los resultados no demuestran generalización a informes independientes.
- Corpus de evaluación pequeño (3.004 pares) y con filtros de metadatos que asumen disponibilidad y corrección de dichos metadatos en tiempo de recuperación.
- Solo inglés: no hay soporte documentado de otros idiomas.
- Solo se ha evaluado la recuperación densa; sparse y ColBERT requieren evaluación separada.
- Checkpoint intermedio: corresponde a la época 2 de 3 planificadas, no al modelo final.
- Riesgo de recuperar impresiones incorrectas o incompletas; el rendimiento puede degradarse en otras instituciones, modalidades, subespecialidades, estilos de informe y poblaciones de pacientes.
- Licencia del checkpoint no especificada, lo que impide confirmar condiciones de uso comercial; el modelo base es MIT.
- Sin descargas ni likes en el momento de la consulta, lo que limita la evidencia de uso en la comunidad.
- Posible truncado de entradas largas según la longitud máxima configurada (512 para hallazgos y 256 para impresiones en el ejemplo).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RadiOtter/Radmatch-M3-V1
- Modelo base BGE-M3: https://huggingface.co/BAAI/bge-m3
- Repositorio FlagEmbedding (usado en el ejemplo): no disponible en la información proporcionada
- Paper de BGE-M3: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
