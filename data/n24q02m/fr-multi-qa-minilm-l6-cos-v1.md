# n24q02m/fr-multi-qa-MiniLM-L6-cos-v1

## Resumen

`n24q02m/fr-multi-qa-MiniLM-L6-cos-v1` es una build en formato ONNX cuantizado del modelo de embeddings `sentence-transformers/multi-qa-MiniLM-L6-cos-v1`. No es un modelo nuevo entrenado desde cero, sino una conversión de artefacto orientada a inferencia eficiente: el autor (n24q02m) ha empaquetado los pesos en ONNX opset 21 y ha generado dos variantes cuantizadas de muy bajo peso (22 MB en INT8 y 28 MB en Q4F16). El modelo resuelve la tarea de *feature extraction*, es decir, producir representaciones vectoriales densas para búsqueda semántica, recuperación de información y *question answering* multi-documento.

La arquitectura subyacente es BERT (familia MiniLM-L6), con pooling de tipo MEAN y normalización de embeddings activada, lo que permite usar similitud coseno directamente sobre las salidas. El prefijo `fr-` en el ID sugiere un uso orientado a francés, pero la model card no documenta ningún ajuste específico de idioma ni un dataset francés: se trata de la misma arquitectura base servida con un nombre que alude a ese ámbito. Es relevante ahora para despliegues en entornos con recursos limitados (edge, contenedores pequeños, CPU) donde el tamaño y la latencia importan más que la precisión máxima.

El modelo no incluye pesos en formato safetensors ni GGUF; el repositorio contiene únicamente variantes ONNX cuantizadas. La licencia no está declarada en la ficha y el autor remite a la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (MiniLM-L6), transformer encoder |
| Parametros totales | no disponible (el modelo base MiniLM-L6 ronda los 22,7 M, no confirmado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (QInt8) y Q4F16 (MatMulNBits, block_size 128, simetrica) |
| Idiomas soportados | no disponible (el prefijo `fr-` sugiere frances, no documentado) |
| Licencia | no disponible (hereda la del modelo base; consultar antes de usar) |
| Formato de pesos | ONNX (opset 21): `onnx/model_quantized.onnx` y `onnx/model_q4f16.onnx` |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder BERT de la familia MiniLM-L6, con pooling MEAN y normalizacion de la salida. El modelo base `sentence-transformers/multi-qa-MiniLM-L6-cos-v1` esta entrenado para recuperacion de informacion y *question answering* multi-documento, y produce embeddings comparables mediante similitud coseno. La build aqui descrita no aporta entrenamiento nuevo: es una conversion a ONNX opset 21 con dos esquemas de cuantizacion.

La cuantizacion INT8 se realiza con `onnxruntime.quantization.quantize_dynamic` (QInt8), mientras que la variante Q4F16 aplica `MatMulNBitsQuantizer` con block_size 128 y cuantizacion simetrica, seguida de un cast a float16. No se documentan datos de entrenamiento, numero de tokens, composicion del corpus ni fases de RLHF/DPO adicionales; toda esa informacion corresponde al modelo base y no se reproduce en esta ficha.

## Capacidades

- Generacion de embeddings de texto para *feature extraction* (tarea declarada en el pipeline).
- Busqueda semantica y recuperacion densa mediante similitud coseno (normalizacion activada).
- *Question answering* multi-documento heredado del modelo base (multi-qa).
- Pooling MEAN sobre la secuencia de tokens.
- Inferencia en CPU y entornos de bajos recursos gracias a las variantes ONNX cuantizadas.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni modo *thinking*.

## Casos de uso

- Busqueda semantica en produccion con presupuesto de memoria minimo: con 22 MB en INT8, el modelo cabe en contenedores pequeños y permite indexar y consultar colecciones de documentos usando similitud coseno sobre embeddings normalizados.
- *Retrieval* en pipelines RAG ligeros: al ser una build ONNX, se integra con ONNX Runtime para generar embeddings de chunks y consultas en entornos serverless o de borde donde no hay GPU.
- Deduplicacion y agrupamiento de documentos: los embeddings MEAN normalizados permiten calcular distancias entre textos y agrupar contenido similar en tareas de curaduria de datos.
- Clasificacion por similitud con prototipos: usar los vectores como entrada a un clasificador ligero (kNN o regresion logistica) para enrutado de tickets o etiquetado tematico sin entrenar un modelo grande.
- Filtrado previo en sistemas de recomendacion de contenido: recuperar candidatos por similitud semantica antes de un *reranker* mas costoso.
- Despliegue en dispositivos con CPU limitada: la variante Q4F16 (28 MB) reduce el ancho de banda de memoria y puede ejecutarse en navegador o en hardware embebido mediante ONNX Runtime Web o similar.
- Evaluacion rapida de calidad de recuperacion en frances: usar el prefijo `fr-` como hipotesis de trabajo, validando empiricamente el rendimiento antes de comprometerse en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula en GPU; el modelo esta pensado para CPU. En GPU, el peso es inferior a 30 MB.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna (RTX 4090, A100, H100) puede ejecutarlo, pero es sobredimensionada para esta carga.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; tambien en memoria de dispositivos embebidos.
- Opciones de despliegue: ONNX Runtime (nativo), `fastretrieval` (libreria del autor), ONNX Runtime Web; compatible con servidores de embeddings que acepten ONNX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| n24q02m/fr-multi-qa-MiniLM-L6-cos-v1 | no disponible (base MiniLM-L6) | no disponible | ONNX INT8 / Q4F16 | no disponible | Build cuantizada, 22-28 MB |
| sentence-transformers/multi-qa-MiniLM-L6-cos-v1 | ~22,7 M (no confirmado) | no disponible | safetensors / PyTorch | Apache-2.0 (segun modelo base, verificar) | Modelo original, sin cuantizar |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M (no confirmado) | no disponible | safetensors / PyTorch | Apache-2.0 (verificar) | Embeddings generales, no especifico de QA |

La comparativa se limita a la familia MiniLM-L6; no se dispone de datos de rendimiento para establecer diferencias cuantitativas entre estas variantes.

## Limitaciones y advertencias

- La licencia no esta declarada en la ficha; el autor remite a la del modelo base. Verificar antes de cualquier uso comercial.
- El prefijo `fr-` no esta respaldado por documentacion de entrenamiento o evaluacion en frances; el rendimiento en ese idioma es una hipotesis, no un hecho verificado.
- Al ser una cuantizacion, puede haber una perdida de precision en los embeddings respecto al modelo original; no se publican metricas de degradacion.
- Riesgo de alucinacion no aplica directamente (no genera texto), pero la recuperacion puede devolver documentos irrelevantes si el corpus no esta bien segmentado.
- No soporta tool calling, agentes, vision ni audio.
- La longitud de contexto no esta documentada; asumir el limite del modelo base BERT (habitualmente 512 tokens) sin confirmacion.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria ni evidencia de uso en produccion.
- Dependencia de la libreria `fastretrieval` del mismo autor para el ejemplo de uso; verificar su mantenimiento antes de adoptarla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/n24q02m/fr-multi-qa-MiniLM-L6-cos-v1
- Modelo base: https://huggingface.co/sentence-transformers/multi-qa-MiniLM-L6-cos-v1
- Repositorio de la herramienta de conversion: https://github.com/n24q02m/fastretrieval
