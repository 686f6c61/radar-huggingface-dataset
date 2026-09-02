# frankmorales2020/topo-2026-mistral-t2sql

## Resumen

TOPO-2026 Mistral T2SQL es un modelo de generación de texto a SQL desarrollado por Frank Morales (frankmorales2020) que aplica el framework TOPO-2026, un sistema de aprendizaje continuo determinista basado en anclajes de incrustación en índices primos. El modelo parte de Mistral-7B-Instruct-v0.1 cuantizado a 4 bits y se fine-tunea de forma secuencial sobre tres tareas de complejidad creciente (A, B y C) utilizando el dataset SQL-CREATE-CONTEXT, con el objetivo de demostrar que el olvido catastrófico puede mitigarse mediante anclajes matemáticos.

La relevancia de este modelo reside en su propuesta de resolver un problema clásico del fine-tuning secuencial: la degradación del rendimiento en tareas anteriores al aprender nuevas. El autor reporta un olvido combinado de 4 puntos porcentuales y una precisión del 100% en la tarea más compleja, aunque los datos presentan contradicciones internas que se detallan más adelante. El repositorio pesa 5,4 GB, coherente con un modelo de 7B parámetros en cuantización de 4 bits, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Mistral-7B-Instruct-v0.1) con LoRA rank 512 |
| Parametros totales | 7 mil millones (base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no especificada; el modelo base Mistral-7B-Instruct-v0.1 soporta 8192 tokens |
| Tipos de cuantizacion | 4-bit (nf4 con doble cuantizacion, segun el codigo de inferencia) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Mistral-7B-Instruct-v0.1, un transformer decoder con atención de ventana deslizante y 32 capas. El fine-tuning emplea LoRA con rango 512, entrenando cada tarea durante 2 épocas con 2000 muestras por tarea. Las tasas de aprendizaje son específicas por tarea (2e-4, 1.5e-4 y 1e-4) con scheduler de coseno y warmup.

La innovación principal es el framework TOPO-2026, que fija seis filas de incrustación en índices primos {2, 3, 5, 7, 11, 13} con una constante de seguridad Λ = 0.9785142874. Estas filas permanecen congeladas tras el entrenamiento inicial y actúan como invariantes topológicos que, según el autor, previenen el olvido catastrófico. El overhead de memoria declarado es de 48 KB con complejidad O(1). El entrenamiento se realiza de forma secuencial A → B → C, y la evaluación se basa en comparación semántica de SQL normalizado, no en coincidencia exacta de cadenas.

## Capacidades

- Generación de consultas SQL a partir de descripciones en lenguaje natural, especializado en los tres niveles de complejidad del dataset SQL-CREATE-CONTEXT.
- Aprendizaje continuo con mitigación del olvido catastrófico mediante anclajes primos, según las afirmaciones del autor.
- Inferencia determinista con semilla fija (seed=123) y detección de salidas inválidas (rechazo si no hay cláusula SELECT).
- Procesamiento por lotes con seguimiento de progreso, implementado en el motor de inferencia proporcionado.
- No se documentan capacidades de tool calling, visión, audio ni razonamiento multi-paso más allá de la generación de SQL.

## Casos de uso

- Asistente de consultas para analistas de datos: el modelo traduce preguntas en lenguaje natural a SQL, permitiendo a usuarios no técnicos extraer información de bases de datos relacionales sin escribir código.
- Automatización de reportes periódicos: integrado en pipelines de datos, puede generar consultas SQL parametrizadas para informes recurrentes, reduciendo el tiempo de desarrollo manual.
- Generación de SQL para pruebas automatizadas: en entornos de CI/CD, el modelo puede producir consultas de validación para esquemas de bases de datos, acelerando la creación de casos de prueba.
- Capa de abstracción para APIs de datos: como backend de un servicio que expone endpoints de consulta, convierte peticiones JSON en sentencias SQL ejecutables.
- Entrenamiento de modelos de lenguaje especializados en dominios verticales: sirve como punto de partida para fine-tuning adicional en sectores como finanzas o logística, donde las consultas SQL son frecuentes.
- Demostración de aprendizaje continuo en producción: útil para equipos que necesitan actualizar modelos con nuevas tareas sin reentrenar desde cero, aunque requiere validación externa antes de su adopción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor reporta los siguientes resultados de entrenamiento, basados en comparación semántica de SQL:

| Tarea | Complejidad | Precisión inicial | Precisión final | Olvido |
|-------|-------------|-------------------|-----------------|--------|
| A | Simple | 16,00% | 8,00% | 8,00 pp |
| B | Media | 100,00% | 100,00% | 0,00 pp |
| C | Compleja | — | 100,00% | — |
| Combinado | — | — | — | 4,00 pp |

El autor declara una certificación TOPO-2026 aprobada con umbrales de precisión ≥85% en la tarea C y olvido combinado ≤10 pp. Sin embargo, la afirmación de "olvido catastrófico ≤ 0,26%" en las propiedades clave contradice los 8 pp de degradación observados en la tarea A, lo que sugiere que el dato de 0,26% podría referirse a otra métrica o a un error de documentación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB en cuantización 4-bit, basado en el tamaño del repositorio (5,4 GB) y la arquitectura de 7B parámetros.
- GPU recomendadas: tarjetas consumer con 8 GB o más, como RTX 3060, RTX 4060, RTX 4070; también compatible con A100, H100 y otras GPUs de centro de datos.
- Cabe en GPUs consumer de gama media; no requiere hardware especializado.
- Opciones de despliegue: el código de ejemplo usa Hugging Face Transformers con BitsAndBytes para carga en 4-bit; también puede desplegarse con vLLM, llama.cpp u Ollama, aunque no se proporcionan configuraciones específicas para estos entornos.
- Latencia y throughput: no disponibles; dependen del hardware y del backend de inferencia elegido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|--------|------------|----------|----------|---------|
| topo-2026-mistral-t2sql (este) | 7B (4-bit) | no especificado | Apache 2.0 | Text-to-SQL con aprendizaje continuo |
| Mistral-7B-Instruct-v0.1 (base) | 7B | 8192 | Apache 2.0 | Chat e instrucciones generales |
| topo-2026-evo2-certified | 40B (Evo2) | no especificado | Apache 2.0 | Framework TOPO-2026 aplicado a genómica |

No se dispone de comparativas directas con otros modelos text-to-SQL como SQLCoder o CodeLlama en la informacion proporcionada. El modelo topo-2026-evo2-certified, del mismo autor, aplica el mismo framework TOPO-2026 sobre el modelo genómico Evo2 de 40B parámetros, lo que sugiere que el framework es independiente del dominio, pero no hay datos de rendimiento comparativo entre ambos.

## Limitaciones y advertencias

- Contradicción en los datos de olvido: la model card afirma "olvido catastrófico ≤ 0,26%" pero la tabla de resultados muestra 8 pp de degradación en la tarea A. Esta inconsistencia debe resolverse antes de considerar el modelo para producción.
- Dataset de entrenamiento limitado: solo 2000 muestras por tarea, lo que puede no representar la diversidad de esquemas y consultas SQL del mundo real.
- Sin validación externa: el modelo tiene 0 descargas y 0 likes en Hugging Face, por lo que no hay evidencia de uso o evaluación por parte de terceros.
- Idiomas no especificados: no se indica qué idiomas soporta la generación de SQL; el modelo base Mistral-7B-Instruct-v0.1 está principalmente entrenado en inglés, por lo que el rendimiento en otros idiomas es incierto.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar SQL sintácticamente válido pero semánticamente incorrecto; la detección de basura implementada solo rechaza consultas sin cláusula SELECT.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no proporciona garantías sobre la calidad o seguridad del modelo.
- El framework TOPO-2026 no está revisado por pares: los documentos en Zenodo y Medium son auto-publicados, sin validación académica independiente.

## Enlaces

- Hugging Face: https://huggingface.co/frankmorales2020/topo-2026-mistral-t2sql
- Repositorio de código (notebook): https://github.com/frank-morales2020/AST/blob/main/MISTRAL_T2SQL_TOPO_DEMO.ipynb
- Artículo en Medium: https://medium.com/ai-simplified-in-plain-english/the-architecture-of-permanence-topo-2026-mistral-and-the-solution-to-catastrophic-forgetting-in-b3a895d93fb2
- PDF tutorial en Zenodo: https://zenodo.org/records/21419690/files/TOPO-2026-Complete-Code-Tutorial.pdf?download=1
- PDF framework en Zenodo: https://zenodo.org/records/21370447/files/TOPO-2026-VM-LLM.pdf?download=1
- Modelo relacionado (topo-2026-evo2-certified): https://huggingface.co/frankmorales2020/topo-2026-evo2-certified
- Artículo en LinkedIn: https://www.linkedin.com/pulse/code-changed-everything-how-six-prime-numbers-solved-frank-pvewc
