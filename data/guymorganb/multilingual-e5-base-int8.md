# guymorganb/multilingual-e5-base-int8

## Resumen

`guymorganb/multilingual-e5-base-int8` es un espejo (mirror) del modelo de embeddings `intfloat/multilingual-e5-base`, publicado por el usuario guymorganb con el objetivo de servir una versión cuantizada a 8 bits en formato ONNX que pueda cargarse por defecto en Text Embeddings Inference (TEI). No se trata de un modelo entrenado desde cero ni de un ajuste fino: los pesos son exactamente los del repositorio original en la revisión `d128750597153bb5987e10b1c3493a34e5a4502a`, y el único cambio es que el archivo `onnx/model.onnx` corresponde al `onnx/model_qint8_avx512_vnni.onnx` del repositorio upstream, renombrado para que el backend ONNX de TEI lo cargue sin configuración adicional.

El modelo base, `intfloat/multilingual-e5-base`, es un encoder de la familia XLM-RoBERTa orientado a la generación de embeddings de frases multilingües, con 768 dimensiones de salida y una ventana de entrada de 512 tokens. Emplea los prefijos `query: ` y `passage: ` para distinguir consultas de documentos, una convención propia de la familia E5. Este espejo conserva esas mismas características y solo cambia el empaquetado y la precisión numérica.

La relevancia de esta publicación es práctica: el archivo de 32 bits ocupa 1,1 GB y no cabe en instancias de 1 GB, mientras que la versión int8 ocupa 279 MB y, según el autor, se mantiene en 684 MiB en reposo y 736 MiB bajo carga en una instancia de 1 GB. Para despliegues de recuperación semántica en infraestructura de bajo coste, esto permite usar TEI con un consumo de memoria contenido sin renunciar al modelo multilingüe original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa), modelo base `intfloat/multilingual-e5-base` |
| Parametros totales | no disponible (el modelo base E5-base ronda los 278M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens de entrada |
| Tipos de cuantizacion | int8 (archivo ONNX `model_qint8_avx512_vnni.onnx`, 279 MB) |
| Idiomas soportados | no disponible en la ficha del espejo; el modelo base es multilingue (heredado de XLM-RoBERTa) |
| Licencia | MIT |
| Formato de pesos | ONNX (`onnx/model.onnx`, int8); resto de archivos sin cambios respecto al upstream |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `intfloat/multilingual-e5-base`: un encoder transformer de tipo XLM-RoBERTa que produce embeddings de frase de 768 dimensiones. No hay entrenamiento adicional ni ajuste fino en este repositorio; el autor declara explícitamente que todos los archivos salvo `onnx/model.onnx` son los del upstream sin modificar. Por tanto, los detalles de entrenamiento (número de tokens, composición del corpus, uso de pares query-passage, posibles fases de contraste) corresponden al modelo original y no se detallan en la información proporcionada.

La única innovación técnica de este espejo es de empaquetado: se toma el archivo cuantizado a 8 bits del propio repositorio upstream (`model_qint8_avx512_vnni.onnx`, 279 MB) y se renombra a `model.onnx` para que el backend ONNX de Text Embeddings Inference lo cargue por defecto. La cuantización int8 con instrucciones AVX512-VNNI está pensada para acelerar la inferencia en CPU en hardware que soporte ese conjunto de instrucciones.

## Capacidades

- Generación de embeddings de frases y documentos para búsqueda semántica y similitud entre frases (`feature-extraction`, `sentence-similarity`).
- Recuperación densa (dense retrieval) con convención de prefijos `query: ` para consultas y `passage: ` para documentos.
- Capacidades multilingües heredadas del modelo base XLM-RoBERTa (el conjunto exacto de idiomas no se detalla en la información disponible).
- Entrada de hasta 512 tokens por texto.
- Salida de embeddings de 768 dimensiones.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es un encoder, no un modelo generativo.
- No dispone de modo de pensamiento, visión ni audio.

## Casos de uso

- Búsqueda semántica en producción con TEI: el modelo se carga directamente en Text Embeddings Inference como backend ONNX y sirve embeddings de consultas y pasajes para un motor de recuperación, con un consumo medido de 684 MiB en reposo y 736 MiB bajo carga.
- Despliegue en instancias de 1 GB: al ocupar 279 MB en disco y mantenerse por debajo de 1 GB en memoria, permite montar un servicio de embeddings en infraestructura de bajo coste donde el archivo de 32 bits (1,1 GB) no cabría.
- RAG (retrieval-augmented generation) multilingüe: se indexan fragmentos de documentación como pasajes con el prefijo `passage: ` y se embeben las preguntas de los usuarios con `query: ` para recuperar contexto que alimente a un LLM generativo.
- Deduplicación y agrupamiento de textos: los embeddings de 768 dimensiones permiten calcular similitud coseno entre documentos para detectar duplicados o agrupar contenido temáticamente en pipelines de datos.
- Clasificación y filtrado por similitud: comparar la similitud entre una consulta y un conjunto de etiquetas o prototipos textuales para enrutar tickets, correos o incidencias sin entrenar un clasificador dedicado.
- Búsqueda en catálogos y bases de conocimiento internas: indexar artículos, FAQs o fichas de producto y ofrecer búsqueda semántica en varios idiomas sobre CPU, aprovechando la cuantización int8 con AVX512-VNNI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/ memoria: el archivo int8 ocupa 279 MB en disco; el autor reporta 684 MiB en reposo y 736 MiB bajo carga en una instancia de 1 GB.
- El archivo de 32 bits del upstream ocupa 1,1 GB y no cabe en una instancia de 1 GB, motivo por el que se publica este espejo.
- Inferencia en CPU: la cuantización int8 está orientada a instrucciones AVX512-VNNI; el rendimiento en CPU sin ese conjunto de instrucciones no se detalla en la información disponible.
- GPU: no se proporcionan requisitos ni recomendaciones de GPU específicas.
- Cabe en hardware de consumo y en instancias cloud pequeñas de 1 GB de memoria.
- Despliegue: Text Embeddings Inference (TEI) con backend ONNX, que es el caso de uso para el que se creó el espejo. Otros runners ONNX no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimensiones | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| `guymorganb/multilingual-e5-base-int8` (este) | no disponible | 512 tokens | 768 | ONNX int8 | MIT | Espejo int8 para TEI, 279 MB |
| `intfloat/multilingual-e5-base` (upstream) | no disponible | 512 tokens | 768 | safetensors / ONNX (incl. int8) | MIT | Modelo original; el archivo de 32 bits ocupa 1,1 GB |
| Alternativas de embeddings multilingües de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos de otros modelos en la informacion disponible |

## Limitaciones y advertencias

- Es un espejo, no un modelo nuevo: cualquier limitación del modelo base `intfloat/multilingual-e5-base` se hereda sin cambios.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso; solo genera embeddings.
- Ventana de entrada limitada a 512 tokens; los textos más largos deben fragmentarse antes de embeberse.
- El uso correcto requiere respetar los prefijos `query: ` y `passage: `; omitirlos puede degradar la calidad de la recuperación.
- La cuantización int8 puede introducir una pérdida de calidad respecto a los pesos de 32 bits; no se proporcionan métricas que cuantifiquen esa diferencia.
- El rendimiento de la cuantización AVX512-VNNI depende del hardware; en CPU sin ese conjunto de instrucciones el comportamiento no está documentado en la información disponible.
- El conjunto exacto de idiomas soportados no se detalla en la ficha del espejo; debe consultarse la documentación del modelo base.
- Riesgo de sesgos y alucinaciones: no evaluado en la información disponible; al ser un encoder, el riesgo de alucinación se traslada al sistema que consuma los embeddings.
- Licencia MIT, que permite uso comercial, pero conviene verificar los términos del modelo base upstream.
- Repositorio con muy poca tracción (21 descargas, 0 likes) y publicado en una fecha posterior a la consulta; no hay evidencia de mantenimiento ni de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guymorganb/multilingual-e5-base-int8
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- Revisión del upstream referenciada: `d128750597153bb5987e10b1c3493a34e5a4502a`
