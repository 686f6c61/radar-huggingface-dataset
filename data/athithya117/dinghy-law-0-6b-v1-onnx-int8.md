# Athithya117/dinghy-law-0.6b-v1-onnx-int8

## Resumen

`dinghy-law-0.6b-v1-onnx-int8` es una cuantización INT8 weight-only del modelo de embeddings legales `Hanno-Labs/dinghy-law-0.6b-v1`, publicado por el usuario Athithya117 en HuggingFace. El modelo base parte de Qwen3-Embedding-0.6B y produce embeddings de 1024 dimensiones con una ventana de contexto de 8192 tokens, orientado a tareas de recuperación (retrieval) en el dominio jurídico.

La cuantización emplea el esquema RTN (Round-To-Nearest) weight-only con `MatMulNBits`, 8 bits, block size 32 y simetría, aplicado únicamente a los pesos de 196 nodos `MatMul`; los 57 nodos `MatMul` restantes y todas las activaciones permanecen en FP32. El resultado es un artefacto ONNX de 1066,5 MB frente a los 2273,9 MB del export FP32, una reducción del 53%, manteniendo el pipeline de Sentence-Transformers (`Transformer → last-token Pooling → Dense → L2 Normalize`).

Su relevancia práctica es acotada pero concreta: permite desplegar un modelo de embeddings legales de 0,6B en entornos con memoria restringida y, en CPUs con soporte VNNI (Intel Ice Lake+ y AMD Zen 4+), obtener una mejora de velocidad real sobre FP32. En hardware solo AVX2 el cuantizado resulta aproximadamente un 8% más lento, por lo que la elección depende del hardware objetivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (base Qwen3-Embedding-0.6B), exportado a ONNX con cuantización weight-only INT8 |
| Parámetros totales | 0,6B (modelo base) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (`max_seq_length=8192`) |
| Tipos de cuantización | INT8 weight-only, RTN, `MatMulNBits`, block size 32, simétrico; activaciones FP32 |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model_weightonly_int8_b32_a1.onnx` + `.onnx.data` externo), safetensors en el repo, pipeline Sentence-Transformers |
| Dimensión de embedding | 1024 |
| Tamaño del artefacto | 1066,5 MB (INT8) frente a 2273,9 MB (FP32 ONNX) |
| Nodos cuantizados | 196 `MatMulNBits`; 57 `MatMul` en FP32 |

## Arquitectura y entrenamiento

El modelo base es un encoder transformer derivado de Qwen3-Embedding-0.6B, adaptado al dominio legal por Hanno Labs. El pipeline de Sentence-Transformers aplica pooling sobre el último token, una capa `Dense` y normalización L2, generando vectores de 1024 dimensiones. La ruta de consulta (`encode_query`) aplica un prefijo de instrucción distinto al de documentos (`encode_document`), y ambas rutas no son intercambiables.

Sobre el proceso de entrenamiento del modelo base no se proporciona información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF/DPO o técnicas de contraste). La intervención de este repositorio es exclusivamente de cuantización: se aplica RTN weight-only sobre los pesos `MatMul` con block size 32, manteniendo el grafo ONNX con batch y longitud de secuencia dinámicos. El `weightonly_int8_manifest.json` documenta la procedencia, incluyendo el SHA-256 del artefacto fuente (`0fd83ebb...`).

## Capacidades

- Generación de embeddings densos de 1024 dimensiones para texto en inglés.
- Recuperación semántica (retrieval) query-documento mediante rutas separadas `encode_query` y `encode_document`.
- Procesamiento de pasajes largos: hasta 8192 tokens por entrada.
- Soporte de batch dinámico y longitud de secuencia dinámica en el grafo ONNX.
- Pipeline Sentence-Transformers completo (pooling, dense, normalización L2) preservado respecto al modelo FP32.
- No es un modelo generativo: no soporta tool calling, agentes, razonamiento multi-paso ni visión/audio.
- Multilingüismo: la model card declara únicamente inglés; no se documentan otras lenguas.

## Casos de uso

- Búsqueda semántica en bases documentales jurídicas: indexar sentencias, contratos y doctrina como embeddings de 1024 dimensiones y recuperar pasajes relevantes ante consultas en lenguaje natural, aprovechando la ventana de 8192 tokens para fragmentos largos.
- Sistemas RAG sobre corpus legales en producción con memoria limitada: el artefacto de 1,07 GB permite mantener el índice y el modelo residentes en servidores con poca RAM, a costa de verificar el soporte VNNI del hardware.
- Asistencia a revisión de contratos: calcular similitud entre cláusulas de un contrato candidato y una base de cláusulas previamente etiquetadas para señalar desviaciones.
- Deduplicación y clustering de documentos legales: agrupar sentencias o expedientes por similitud coseno de sus embeddings para organizar archivos históricos.
- Enrutamiento de consultas a departamentos jurídicos: clasificar tickets o consultas entrantes comparándolos contra embeddings de referencia de cada área (laboral, fiscal, civil, etc.).
- Distribución de artefactos en entornos edge o contenedores: el tamaño reducido y el formato ONNX facilitan empaquetar el modelo en imágenes Docker o dispositivos con recursos acotados, siempre que el objetivo prioritario sea el ahorro de memoria y no la latencia.
- Evaluación de recuperación en pipelines de CI: usar el modelo como componente de un sistema de evaluación de calidad de búsqueda legal, con paridad de ranking respecto a FP32 verificada en el fixture del autor.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, MTEB, etc.). Sí incluye una validación de paridad frente al export FP32 sobre un fixture de 4 consultas y 14 pasajes:

| Comprobación | Resultado |
|---|---|
| Similitud coseno vs FP32 — consultas | mín. 0,99961; media 0,99965 |
| Similitud coseno vs FP32 — documentos | mín. 0,99920; media 0,99956 |
| Recall@1 y Recall@5 | idénticos a FP32 |
| Caída de MRR | 0,0 |
| Solapamiento Jaccard@5 | 1,0 |
| Acuerdo en Top-1 | 1,0 |

Rendimiento de inferencia según hardware:

| CPU | Comportamiento |
|---|---|
| Con VNNI (Intel Ice Lake+, AMD Zen 4+) | Aceleración significativa frente a FP32 |
| Solo AVX2 (AMD Zen 1–3, Intel Haswell–Coffee Lake) | Igual o más lento que FP32 |

Medición concreta en AMD Ryzen 7 5700U (Zen 2, AVX2, sin VNNI): throughput INT8 de 0,923× el de FP32, aproximadamente un 8% más lento, por el coste de desquantización superior al ahorro de ancho de banda de memoria.

## Requisitos de hardware

- Memoria: el artefacto INT8 ocupa 1066,5 MB en disco; en RAM debe residir junto con el grafo ONNX y el tokenizer. El FP32 equivalente requiere 2273,9 MB.
- CPU: recomendable VNNI (Intel Ice Lake o posterior, AMD Zen 4 o posterior) para obtener ventaja de velocidad. En AVX2-only usar la variante FP32 si la latencia es el criterio.
- GPU: no se documenta soporte ni requisitos de GPU; el artefacto está orientado a inferencia en CPU mediante ONNX Runtime.
- Despliegue: `sentence-transformers` con backend ONNX Runtime; el grafo admite batch y longitud de secuencia dinámicos.
- Throughput y latencia: no se publican cifras absolutas; solo la comparación relativa INT8/FP32 (0,923× en Ryzen 7 5700U).
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de embeddings y no generativo, esas herramientas no son el destino natural.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| dinghy-law-0.6b-v1-onnx-int8 (este) | 0,6B | 8192 | 1024 | Apache-2.0 | ONNX INT8 weight-only | Dominio legal, inglés, cuantización RTN b32 |
| Hanno-Labs/dinghy-law-0.6b-v1 (FP32) | 0,6B | 8192 | 1024 | Apache-2.0 | safetensors / ONNX FP32 | Referencia de calidad; 2273,9 MB en ONNX FP32 |
| Qwen3-Embedding-0.6B (base) | 0,6B | 8192 | 1024 | Apache-2.0 | safetensors | Modelo generalista multilingüe del que deriva el anterior |
| Alternativas de embeddings legales de 0,6B | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- La model card declara únicamente inglés; el rendimiento en castellano u otras lenguas no está documentado y no debería asumirse.
- En CPUs sin VNNI el cuantizado es más lento que FP32 (0,923× medido en Zen 2); la elección por tamaño puede penalizar la latencia.
- La validación de paridad se realizó sobre un fixture muy reducido (4 consultas, 14 pasajes); no constituye una garantía exhaustiva de equivalencia en corpus grandes.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de recuperaciones irrelevantes: es un modelo de embeddings, no responde preguntas ni cita fuentes.
- Las rutas `encode_query` y `encode_document` no son intercambiables; usar la incorrecta degrada la calidad de recuperación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no es el desarrollador original del modelo base; conviene auditar el artefacto antes de usarlo en producción.
- El SHA-256 de procedencia está documentado, pero no se publica una comparación de calidad sobre benchmarks de retrieval legales estándar.
- Licencia Apache-2.0 heredada del modelo base: permite uso comercial, pero debe conservarse la atribución y revisarse las condiciones del modelo original.
- El nombre del repositorio en la URL (`...-onnx-int8`) difiere del usado en el ejemplo de código de la model card (`...-onnx-int8-weightonly-b32`); verificar la ruta exacta al cargar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Athithya117/dinghy-law-0.6b-v1-onnx-int8
- Modelo base: https://huggingface.co/Hanno-Labs/dinghy-law-0.6b-v1
- Modelo Qwen3-Embedding-0.6B (origen arquitectónico): https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Documentación de Sentence-Transformers: https://www.sbert.net/
- ONNX Runtime: https://onnxruntime.ai/
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
