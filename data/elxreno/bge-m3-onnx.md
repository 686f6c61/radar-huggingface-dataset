# ElXreno/bge-m3-onnx

## Resumen

El modelo ElXreno/bge-m3-onnx es una exportación ONNX del codificador denso de BAAI/bge-m3, un modelo de embeddings multilingüe desarrollado por BAAI. Esta exportación resuelve un problema concreto: la exportación ONNX oficial del repositorio upstream, generada con PyTorch 2.1 y opset 11, descompone cada capa LayerNorm en operaciones atómicas (ReduceMean, Sub, Pow, Sqrt, Div), lo que provoca que el cálculo de la varianza se realice en bf16 cuando se activa la inferencia bf16 en el plugin OpenVINO de CPU, degradando la similitud coseno a valores entre 0.22 y 0.40 respecto a las embeddings fp32 originales.

Esta exportación utiliza la operación fusionada LayerNormalization (opset 17+), que mantiene las estadísticas en fp32 dentro del kernel, logrando una similitud coseno de 0.99998-0.99999 en bf16 respecto al modelo fp32 original. El modelo se exportó con torch.onnx.export(dynamo=True), PyTorch 2.14, opset 18 y pesos fp32, e incluye únicamente el codificador denso, sin las cabezas sparse (léxica) ni ColBERT (multi-vector) del modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder) |
| Parametros totales | 568M (modelo base bge-m3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | fp32 (pesos), bf16 (inferencia via OpenVINO) |
| Idiomas soportados | 100+ (multilingue) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 18, pesos externos .data) |

## Arquitectura y entrenamiento

El modelo base BAAI/bge-m3 es un transformer encoder basado en XLM-RoBERTa con 568 millones de parametros, entrenado por BAAI para generar embeddings multilingues de alta calidad. Soporta tres modos de recuperacion: denso, sparse (lexico) y multi-vector (ColBERT). Esta exportacion ONNX incluye unicamente el codificador denso, que produce embeddings de 1024 dimensiones mediante pooling CLS y normalizacion L2.

La innovacion tecnica principal de esta exportacion es el uso de la operacion fusionada LayerNormalization (opset 17+), que evita la degradacion numerica en bf16 que sufre la exportacion ONNX oficial del repositorio upstream. El grafo exportado usa atencion eager, pesos fp32 y ejes dinamicos para batch y secuencia, con entradas input_ids y attention_mask, y salida last_hidden_state de forma [batch, seq, 1024].

## Capacidades

- Generacion de embeddings densos de 1024 dimensiones para similitud semantica de frases y documentos.
- Pooling CLS con normalizacion L2 integrada en el flujo de uso.
- Soporte multilingue para mas de 100 idiomas.
- Inferencia bf16 correcta en CPU con OpenVINO (AVX-512 BF16 / AMX), duplicando el throughput respecto a fp32.
- Compatible con onnxruntime (CPUExecutionProvider y OpenVINOExecutionProvider).
- Integracion con el servidor de embeddings infinity (infinity_emb v2).
- No incluye las cabezas sparse ni ColBERT del modelo bge-m3 original.

## Casos de uso

- Busqueda semantica multilingue: el modelo genera embeddings densos que permiten indexar y recuperar documentos en mas de 100 idiomas, con una ventana de contexto de 8192 tokens para documentos extensos.
- Sistemas de recomendacion basados en similitud: se pueden calcular embeddings de items y usuarios para recomendar contenido relevante mediante distancia coseno.
- Clasificacion de texto y deteccion de duplicados: las embeddings de 1024 dimensiones permiten agrupar documentos similares o detectar contenido duplicado en grandes corpus.
- RAG (Retrieval-Augmented Generation): el modelo puede integrarse como componente de recuperacion en pipelines de generacion aumentada, indexando fragmentos de documentos para su posterior consulta.
- Despliegue en CPU con alto rendimiento: gracias a la inferencia bf16 correcta con OpenVINO, es viable ejecutar el modelo en servidores CPU con AVX-512 BF16 o AMX sin perdida significativa de calidad.
- Migracion de pipelines PyTorch a ONNX Runtime: organizaciones que necesitan estandarizar su infraestructura de inferencia en ONNX Runtime pueden sustituir el modelo PyTorch original por esta exportacion manteniendo embeddings identicas.

## Benchmarks y rendimiento

La model card proporciona mediciones de similitud coseno entre esta exportacion y la exportacion ONNX upstream en fp32, sobre 5 textos con pooling CLS y normalizacion L2:

| Runtime | Similitud coseno vs upstream fp32 |
|---|---|
| onnxruntime CPUExecutionProvider, fp32 | 1.00000 |
| onnxruntime OpenVINOExecutionProvider, fp32 | 1.00000 |
| onnxruntime OpenVINOExecutionProvider, bf16 | 0.99998-0.99999 |
| upstream onnx/model.onnx, OpenVINO bf16 | 0.22-0.40 |

No se han publicado resultados de benchmarks estandar (MTEB, MIRACL, etc.) en la informacion disponible para esta exportacion especifica.

## Requisitos de hardware

- VRAM estimada: los pesos fp32 ocupan 2.27 GB, por lo que caben en cualquier GPU con al menos 4 GB de VRAM, aunque el modelo esta pensado principalmente para CPU.
- GPU recomendadas: no es el objetivo principal; el modelo esta optimizado para CPU con AVX-512 BF16 o AMX.
- CPU: cualquier CPU moderna puede ejecutar el modelo en fp32; las CPU con AVX-512 BF16 o AMX (Intel Xeon de 4.ª generacion o superior) permiten duplicar el throughput con bf16.
- Opciones de despliegue: onnxruntime (CPUExecutionProvider, OpenVINOExecutionProvider), infinity_emb v2 con engine optimum, o integracion directa via API de onnxruntime en Python.
- Latencia y throughput: no se han publicado cifras concretas; la model card indica que bf16 en OpenVINO CPU duplica el throughput respecto a fp32 en hardware compatible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| ElXreno/bge-m3-onnx | XLM-RoBERTa (dense) | 568M | 8192 | ONNX opset 18 | MIT |
| BAAI/bge-m3 (original) | XLM-RoBERTa (dense+sparse+ColBERT) | 568M | 8192 | PyTorch | MIT |
| BAAI/bge-m3 onnx upstream | XLM-RoBERTa (dense) | 568M | 8192 | ONNX opset 11 | MIT |
| intfloat/multilingual-e5-large | XLM-RoBERTa | 560M | 512 | PyTorch | MIT |

La diferencia clave frente al ONNX upstream es la correccion numerica en bf16: mientras el upstream degrada a similitud coseno de 0.22-0.40, esta exportacion mantiene 0.99998-0.99999. Frente al modelo PyTorch original, esta exportacion solo incluye el codificador denso, sin las cabezas sparse ni ColBERT.

## Limitaciones y advertencias

- Solo incluye el codificador denso: las capacidades de recuperacion sparse (lexica) y multi-vector (ColBERT) del modelo bge-m3 original no estan disponibles en este grafo ONNX.
- La inferencia bf16 solo es correcta con el plugin OpenVINO de onnxruntime; con otros backends que no implementen la operacion fusionada LayerNormalization correctamente, los resultados pueden degradarse.
- El modelo hereda las limitaciones del modelo base bge-m3: posibles sesgos en los datos de entrenamiento y riesgo de embeddings suboptimas para dominios muy especializados.
- Los pesos externos (model.onnx.data) ocupan 2.27 GB, lo que requiere gestion de ficheros adicional en despliegues con almacenamiento limitado.
- No se han publicado benchmarks estandar (MTEB, MIRACL) para esta exportacion especifica; las metricas de calidad se infieren del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ElXreno/bge-m3-onnx
- Modelo base BAAI/bge-m3: https://huggingface.co/BAAI/bge-m3
- Proyecto infinity (servidor de embeddings): https://github.com/ElXreno/infinity
