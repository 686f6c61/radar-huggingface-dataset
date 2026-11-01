# liodon-ai/sqlcoder-7b-2-ONNX

## Resumen

`liodon-ai/sqlcoder-7b-2-ONNX` es una exportación a formato ONNX del modelo `defog/sqlcoder-7b-2`, un modelo de lenguaje especializado en la generación de consultas SQL a partir de lenguaje natural y de esquemas de bases de datos. La exportación la publica Liodon AI, un tercero independiente de Defog (el desarrollador original del modelo), y está pensada para su ejecución mediante ONNX Runtime en lugar de las librerías habituales de PyTorch/Transformers.

El modelo subyacente es un transformer decoder-only de aproximadamente 7.000 millones de parámetros, derivado de una base tipo Llama y afinado específicamente para la tarea de text-to-SQL. Esta exportación concreta no altera los pesos del modelo original: se limita a convertirlos al grafo ONNX con soporte de caché KV (`text-generation-with-past`), de modo que pueda desplegarse en entornos donde ONNX Runtime resulte preferible por portabilidad, control de ejecución o integración con otros runtimes.

La relevancia de esta ficha radica en que ofrece una vía de despliegue alternativa para un modelo de nicho (text-to-SQL) fuera del ecosistema PyTorch, con dos variantes de precisión (FP32 y FP16) y un tamaño de repositorio de 41,5 GB. No obstante, la información publicada por el autor de la exportación es muy limitada: no se detallan idiomas, benchmarks ni parámetros de cuantización más allá de las dos variantes de pesos indicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base tipo Llama), exportado a grafo ONNX con soporte de caché KV (`text-generation-with-past`) |
| Parametros totales | Aproximadamente 7.000 millones (según el nombre del modelo base `sqlcoder-7b-2`; no confirmado en la model card de la exportación) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | FP32 (`model.onnx`, 26,96 GB) y FP16 (`model_fp16.onnx`, 14,55 GB). La model card menciona un `model_quantized.onnx` en el ejemplo de código, pero no figura en la tabla de ficheros publicada |
| Idiomas soportados | No disponible |
| Licencia | `other` (heredada del modelo base `defog/sqlcoder-7b-2`; consultar los términos del modelo original) |
| Formato de pesos | ONNX (`.onnx`), exportado con `optimum` |

## Arquitectura y entrenamiento

La arquitectura del modelo subyacente es un transformer decoder-only de tipo Llama con aproximadamente 7.000 millones de parámetros, afinado por Defog para la tarea de generación de SQL. La exportación a ONNX realizada por Liodon AI emplea `optimum.exporters.onnx.main_export` con la tarea `text-generation-with-past`, lo que significa que el grafo expone entradas y salidas de past-key-value para permitir decodificación autorregresiva con caché KV. Esta decisión es importante en producción porque evita recalcular el prefijo en cada paso de generación y reduce la latencia en secuencias largas.

No se dispone de información en la model card sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo original empleó RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones técnicas adicionales más allá de la mencionada caché KV en el grafo ONNX. Cualquier afirmación sobre el proceso de entrenamiento del modelo base requeriría consultar la model card original de `defog/sqlcoder-7b-2`, que no forma parte de la información proporcionada.

## Capacidades

- Generación de consultas SQL a partir de lenguaje natural y de esquemas de bases de datos (tarea principal del modelo base).
- Generación de texto autoregresiva con caché KV, adecuada para decodificación eficiente en ONNX Runtime.
- Ejecución en CPU (`CPUExecutionProvider`) y en GPU mediante proveedores de ejecución de ONNX Runtime (la variante FP16 está pensada para GPU).
- Integración con `optimum.onnxruntime.ORTModelForCausalLM`, que gestiona automáticamente la contabilidad del caché KV.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Generación de SQL en asistentes de BI: el modelo puede transformar preguntas en lenguaje natural en consultas SQL ejecutables contra un esquema dado, integrándose en herramientas de analítica self-service. El despliegue ONNX permite empaquetar el modelo en entornos donde no se desea arrastrar la pila completa de PyTorch.
- Automatización de pipelines ETL: generación de consultas de transformación y agregación a partir de descripciones de negocio, con validación posterior contra el esquema de la base de datos.
- Herramientas de desarrollo integradas en IDE: autocompletado y generación de consultas SQL dentro del editor, sirviendo el modelo mediante ONNX Runtime en el backend del plugin.
- Despliegue en entornos con requisitos estrictos de portabilidad: al ser un grafo ONNX, el modelo puede ejecutarse en runtimes alternativos y en plataformas donde la instalación de PyTorch no es viable.
- Servicio de consultas para soporte técnico: conversión de tickets o descripciones de incidencias en consultas SQL para equipos de operaciones que necesitan localizar registros concretos.
- Inferencia en infraestructura heterogénea: la variante FP16 permite ejecución en GPU con menor huella de memoria, mientras que la FP32 puede usarse en CPU cuando la latencia no es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la variante FP16 ocupa 14,55 GB en disco, por lo que requiere al menos ese orden de memoria para cargar los pesos; la variante FP32 (26,96 GB) exige aproximadamente el doble. No se dispone de estimaciones de memoria de activaciones ni de caché KV.
- GPU recomendadas: no especificadas por el autor. Por tamaño de pesos, una GPU con 16 GB o más podría alojar la variante FP16, y una con 32 GB o más la variante FP32; estas cifras son estimaciones basadas en el tamaño de los ficheros, no datos publicados.
- Compatibilidad con GPU de consumo: la variante FP16 podría caber en GPUs de consumo con 16 GB o más de VRAM, aunque no se confirma en la documentación.
- Opciones de despliegue: ONNX Runtime (con `CPUExecutionProvider` o proveedores de ejecución GPU) y `optimum.onnxruntime.ORTModelForCausalLM` como wrapper de alto nivel.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `liodon-ai/sqlcoder-7b-2-ONNX` | ~7B | No disponible | ONNX (FP32/FP16) | `other` | HuggingFace |
| `defog/sqlcoder-7b-2` | ~7B | No disponible | Safetensors/PyTorch (según modelo original) | `other` | HuggingFace |
| Alternativas text-to-SQL de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- La exportación la realiza un tercero (Liodon AI), no el desarrollador original (Defog); no hay garantía de equivalencia funcional exacta con el modelo base más allá de lo que declara la model card.
- La licencia es `other` y se hereda del modelo base; es imprescindible revisar los términos de `defog/sqlcoder-7b-2` antes de cualquier uso comercial.
- La model card menciona un `model_quantized.onnx` en el ejemplo de código, pero la tabla de ficheros solo lista `model.onnx` y `model_fp16.onnx`; conviene verificar la existencia real de ese fichero antes de usarlo.
- No se documentan idiomas soportados, lo que impide garantizar un comportamiento adecuado en castellano u otros idiomas distintos del inglés.
- No se publican benchmarks, por lo que no hay evidencia cuantitativa del rendimiento de esta exportación frente al modelo original.
- Riesgo de alucinación inherente a los modelos generativos: las consultas SQL generadas deben validarse contra el esquema y ejecutarse con permisos restringidos.
- El tamaño del repositorio (41,5 GB) y de los ficheros individuales exige planificación de almacenamiento y de ancho de banda para su descarga y despliegue.
- El modelo está especializado en text-to-SQL; su uso como modelo generalista de conversación no está respaldado por la documentación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liodon-ai/sqlcoder-7b-2-ONNX
- Modelo base: https://huggingface.co/defog/sqlcoder-7b-2
- Autor de la exportación: https://huggingface.co/liodon-ai
- Optimum (herramienta de exportación): https://github.com/huggingface/optimum
