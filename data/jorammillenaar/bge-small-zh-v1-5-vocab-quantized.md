# JoramMillenaar/bge-small-zh-v1.5-vocab-quantized

## Resumen

`JoramMillenaar/bge-small-zh-v1.5-vocab-quantized` es una exportación a ONNX del modelo de embeddings `BAAI/bge-small-zh-v1.5` (familia BGE, desarrollada por BAAI) preparada para ejecutarse con Transformers.js sobre el proveedor de ejecución WebGPU. Deriva de la conversión previa `Xenova/bge-small-zh-v1.5` y su rasgo diferencial es que cuantiza únicamente la tabla de embeddings del vocabulario, manteniendo el resto de la red (atención, FFN, LayerNorm y embeddings de posición y tipo de token) en fp32 o fp16.

El problema que resuelve es doble. Por un lado reduce el peso del modelo, con variantes de entre 24 y 62,8 MB. Por otro, conserva intacta la estructura de operadores para que todos los nodos de cómputo se coloquen en WebGPU; las cuantizaciones dinámicas int8 tradicionales introducen operadores (`DynamicQuantizeLinear`, `MatMulInteger`) que acaban ejecutándose en CPU y rompen el pipeline de aceleración. Con esta conversión es posible calcular embeddings y similitud semántica de frases directamente en el navegador con aceleración por GPU, sin enviar texto a un servidor.

Es relevante para desarrolladores que construyen aplicaciones web con búsqueda semántica o RAG en el cliente, donde la privacidad y la latencia de red importan, y para quienes necesitan un modelo de embeddings compacto con licencia MIT. El repositorio tiene un tamaño de 0,2 GB y un volumen de descargas y likes muy bajo (13 y 0 respectivamente), por lo que debe considerarse una conversión reciente y poco validada por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder) según los tags del modelo; base `BAAI/bge-small-zh-v1.5` |
| Parametros totales | no disponible |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Tabla de vocabulario en uint8 block-quantized (bloque 128 para 8 bits, bloque 32 para 4 bits, asimétrica con zero points sobre el eje oculto); variante CPU con int8 dinámico en todo el grafo |
| Idiomas soportados | no disponible oficialmente; el modelo base está orientado al chino y la validación de fidelidad de la cuantización se hizo con frases en inglés, alemán, francés, español, chino, japonés y ruso |
| Licencia | MIT |
| Formato de pesos | ONNX (5 variantes: 4 con cuantización de vocabulario + 1 fallback CPU); el base model se distribuye aparte en safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo BERT, heredada del modelo base `BAAI/bge-small-zh-v1.5` de BAAI, un modelo de embeddings de frases orientado al chino. Esta ficha no documenta el proceso de entrenamiento original (tokens, composición del dataset, técnicas de contraste); esa información corresponde a la model card del modelo base y no se reproduce aquí.

La innovación técnica de esta conversión es la cuantización selectiva del vocabulario mediante el operador `com.microsoft::GatherBlockQuantized`. Solo la tabla de embeddings de palabras se almacena en uint8 cuantizado por bloques, mientras que el resto del grafo permanece en fp32 o fp16. Las entradas son `int64` y la salida `last_hidden_state` es `float32` en todas las variantes. Los grafos `model_vocab*` no contienen nodos `QuantizeLinear`, `DynamicQuantizeLinear`, `QLinearMatMul` ni `MatMulInteger`, de modo que, comprobado con onnxruntime-web 1.31 (la versión que incluye Transformers.js 4.3), todos los nodos de cómputo se asignan a WebGpuExecutionProvider. Los únicos nodos en CPU son 7 nodos pequeños de shape en `int64` (máscara de atención `Unsqueeze`/`Cast`, position-id `Shape`/`Gather`/`Slice`), que ONNX Runtime coloca en CPU de forma intencionada, igual que hace el export fp32 original.

## Capacidades

- Generación de embeddings de frases y fragmentos de texto (pipeline `feature-extraction`).
- Similitud semántica entre frases (`sentence-similarity`) mediante pooling CLS y normalización.
- Recuperación y búsqueda semántica sobre vectores normalizados (uso típico de BGE).
- Funcionamiento multilingüe limitado al respaldo del modelo base; la ficha no declara una lista oficial de idiomas.
- Ejecución en navegador con aceleración WebGPU, o en CPU mediante WebAssembly.
- No soporta generación de texto, tool calling, function calling ni razonamiento multi-paso: es un modelo de embeddings, no un modelo generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Búsqueda semántica en el navegador: indexar y consultar documentos en el cliente, calculando los embeddings con este modelo sobre WebGPU, de forma que el contenido del usuario nunca sale del dispositivo.
- RAG en el lado del cliente: recuperar fragmentos relevantes de un corpus local (notas, documentación, historial) antes de enviar solo el contexto seleccionado a un LLM remoto.
- Deduplicación de textos: comparar la similitud coseno entre pares de frases o registros para detectar duplicados o casi duplicados en una base de datos.
- Clasificación zero-shot mediante similitud a prototipos: comparar cada texto con frases etiquetadas y asignar la categoría más cercana, útil para enrutado o moderación ligera.
- Recomendación de contenido: representar ítems y preferencias como vectores y ordenar por cercanía semántica en una aplicación web.
- Procesamiento privado en el dispositivo: análisis de mensajes o documentos sensibles sin exponerlos a servidores externos, apoyándose en la ejecución WebGPU local.
- Funciones de autocompletado y sugerencias: recuperar respuestas o plantillas similares a la consulta del usuario a partir de un pequeño índice embebido.

## Benchmarks y rendimiento

La única métrica publicada es la fidelidad de cada variante frente al modelo fp32 original, medida como la similitud coseno mínima del embedding de frase agrupado y normalizado sobre 12 frases de prueba en inglés, alemán, francés, español, chino, japonés y ruso.

| Variante | Tabla de vocabulario | Resto del grafo | Tamano | Similitud coseno min. vs fp32 |
|---|---|---|---|---|
| `onnx/model_vocab8.onnx` | 8 bits (bloque 128) | fp32 | 62,8 MB | 0,99998 |
| `onnx/model_vocab8_fp16.onnx` | 8 bits (bloque 128) | fp16 | 36,9 MB | 0,99998 |
| `onnx/model_vocab4.onnx` | 4 bits (bloque 32) | fp32 | 58,5 MB | 0,99744 |
| `onnx/model_vocab4_fp16.onnx` | 4 bits (bloque 32) | fp16 | 32,1 MB | 0,99744 |
| `onnx/model_quantized.onnx` | int8 dinámico | int8 dinámico | 24,0 MB | 0,98559 |

No se han publicado resultados de benchmarks estándar (MMLU, MTEB, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima. El modelo ocupa entre 24,0 y 62,8 MB en disco, por lo que la huella en memoria es inferior a 0,1 GB en la práctica. No hay cifra oficial de VRAM.
- GPU recomendadas: cualquier GPU con soporte WebGPU, incluidas integradas y dedicadas de gama baja. No requiere A100, H100 ni RTX 4090; son irrelevantes para este caso.
- Cabe en GPU consumer: sí, en cualquiera compatible con WebGPU.
- Requisito específico: `dtype: 'fp16'` necesita una GPU con la característica WebGPU `shader-f16`; si el dispositivo no la tiene, Transformers.js lanza un error y hay que usar `dtype: 'fp32'`.
- Opciones de despliegue: Transformers.js ≥ 4 en navegador (`device: 'webgpu'` o `device: 'wasm'`), con onnxruntime-web 1.31+. En servidor, el modelo base puede desplegarse con ONNX Runtime o sentence-transformers.
- Compatibilidad: `onnx/model_quantized.onnx` usa operadores de cuantización dinámica y no debe usarse con `device: 'webgpu'`; está pensado como fallback CPU/WASM (`dtype: 'q8'` por defecto).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `JoramMillenaar/bge-small-zh-v1.5-vocab-quantized` | no disponible | no disponible | ONNX (vocab quantized + CPU int8) | MIT | Optimizado para WebGPU en Transformers.js; solo cuantiza el vocabulario |
| `BAAI/bge-small-zh-v1.5` (base) | no disponible | no disponible | safetensors | MIT | Modelo original de embeddings en chino de BAAI |
| `Xenova/bge-small-zh-v1.5` | no disponible | no disponible | ONNX (int8 dinámico) | MIT | Conversión previa para Transformers.js; su int8 es la base del fallback CPU de este repo y no se ejecuta íntegramente en WebGPU |
| `bge-small-en-v1.5` | no disponible | no disponible | safetensors / ONNX | MIT | Alternativa de la misma familia orientada al inglés en lugar del chino |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no redacta texto, no razona de forma multi-paso y no soporta tool calling.
- Riesgo de alucinación bajo en sentido estricto (no produce texto libre), pero puede generar similitudes semánticas erróneas o poco fiables en dominios alejados de los datos del modelo base.
- Deriva entre variantes: el int8 dinámico (`model_quantized.onnx`) se aleja más del fp32 (0,98559) que las variantes `model_vocab*` (0,99744 o superior). Si se almacenan vectores en un mismo índice, todos deben generarse con el mismo archivo, ya que mezclar variantes degrada la recuperación.
- `onnx/model_quantized.onnx` no debe usarse con `device: 'webgpu'` por sus operadores de cuantización dinámica.
- `dtype: 'fp16'` falla si la GPU no expone `shader-f16`; en ese caso hay que recurrir a `dtype: 'fp32'`.
- Idiomas oficiales no declarados en esta ficha; el modelo base está orientado al chino, por lo que el rendimiento en otros idiomas puede ser inferior.
- Longitud de contexto y sesgos del modelo base no documentados aquí; conviene consultar la model card de `BAAI/bge-small-zh-v1.5`.
- Licencia MIT: permite uso comercial, pero se hereda cualquier condición del modelo base, también MIT.
- Adopción muy baja (13 descargas, 0 likes) y conversión reciente, por lo que se recomienda validar la calidad de los embeddings en el dominio propio antes de producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/JoramMillenaar/bge-small-zh-v1.5-vocab-quantized
- Modelo base: https://huggingface.co/BAAI/bge-small-zh-v1.5
- Conversión previa de la que deriva: https://huggingface.co/Xenova/bge-small-zh-v1.5
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
