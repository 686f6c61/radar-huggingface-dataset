# JoramMillenaar/paraphrase-multilingual-MiniLM-L12-v2-webgpu-safe

## Resumen

`JoramMillenaar/paraphrase-multilingual-MiniLM-L12-v2-webgpu-safe` es una reexportacion a ONNX del modelo de embeddings de frases `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, preparada para su uso con Transformers.js. Se trata de un encoder Transformer bidireccional de la familia MiniLM/XLM-RoBERTa orientado a extraccion de caracteristicas (feature-extraction), es decir, a producir vectores de frases para similitud semantica, busqueda o clustering. El repositorio ocupa 1,3 GB e incluye varias variantes en precision mixta. La licencia declarada es Apache-2.0.

El problema concreto que aborda es un fallo silencioso de ONNX Runtime Web: la build estandar `q8` de este modelo utiliza los operadores `MatMulInteger` y `DynamicQuantizeLinear`, mal implementados en el execution provider de WebGPU en la version 1.24. El resultado no lanza error ni produce NaN, simplemente devuelve vectores incorrectos; el autor documenta similitudes coseno de 0,94 entre dos frases no relacionadas. La solucion que propone es cuantizar unicamente la tabla de embeddings (el 82 % de los parametros del modelo) y dejar el encoder en fp32 o fp16, de modo que el grafo ONNX nunca invoque los operadores afectados.

La relevancia del artefacto es de nicho pero clara: permite ejecutar embeddings multilingues en el navegador con WebGPU sin obtener resultados corruptos, un escenario util para busqueda semantica o clasificacion en cliente sin enviar texto a un servidor. Su adopcion es todavia muy baja (6 descargas, 0 likes en el momento de la consulta) y no publica evaluaciones de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Transformer bidireccional tipo BERT/XLM-RoBERTa (MiniLM-L12, 12 capas), tarea de feature-extraction |
| Parametros totales | No disponible. El autor indica que la tabla de embeddings representa el 82 % de los parametros; el artefacto fp32 de 470 MB es coherente con un orden de ~118 M, pero no se confirma en la informacion |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp32; fp16; int8 por fila en la tabla de embeddings con encoder fp32 o fp16; int4 por fila en `tables_q4.bin` |
| Idiomas soportados | No disponible en los metadatos del repositorio. El modelo base es multilingue (arquitectura XLM-RoBERTa), pero no se enumera una lista de idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`model_fp32.onnx`, `model_fp16.onnx`, `model_vocab8_fp32.onnx`, `model_vocab8_fp16.onnx`, `model_encoder_fp32.onnx`, `model_encoder_fp16.onnx`) mas tablas binarias crudas (`tables.bin`, `tables_q4.bin`) y metadatos `split.json`. No hay safetensors ni GGUF |
| Dimension del embedding | No disponible |
| Tamano del repositorio | 1,3 GB |
| Libreria de referencia | transformers.js (ONNX Runtime Web, backends WASM y WebGPU) |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer bidireccional derivado de XLM-RoBERTa y destilado en la configuracion MiniLM-L12 que emplea el modelo base de sentence-transformers. Su salida son embeddings de frase, no texto generado: el flujo de uso tipico es tokenizacion, lookup de embeddings, paso por el encoder, mean pooling y normalizacion L2 (el ejemplo del autor usa `pooling: 'mean'` y `normalize: true`). Al no ser un modelo generativo, no hay RLHF, DPO ni fases de alineacion implicadas. El repositorio no documenta el dataset ni el numero de tokens de entrenamiento, que corresponden al modelo base original.

La innovacion tecnica de esta ficha es de empaquetado y cuantizacion, no de arquitectura. En lugar de aplicar cuantizacion dinamica completa, el autor cuantiza solo las operaciones `Gather` (la matriz de vocabulario) con `onnxruntime.quantization` y conserva el encoder en fp32 o fp16. Ademas, ofrece una variante "split" en la que las tablas de embeddings (word, position y token-type) se exportan a binario crudo y el encoder se entrega como un grafo independiente cuyo primer input es el tensor ya sumado de los tres embeddings, identificado en `split.json` como `"cut"`. Como el tensor int8 nunca entra en el grafo ONNX, no se invoca el operador defectuoso en WebGPU. Un detalle critico de implementacion es que XLM-RoBERTa numera los position ids empezando en 2, no en 0; `split.json` expone `position_offset` para compensarlo. El script `build-variants.py` reproduce todo el pipeline y verifica que cada artefacto carga y produce salidas finitas antes de escribirlo.

## Capacidades

- Generacion de embeddings de frases y parrafos para similitud semantica y recuperacion de informacion.
- Similitud coseno entre textos, con pooling medio y normalizacion L2.
- Soporte multilingue heredado del modelo base (sin lista explicita de idiomas en este repositorio).
- Ejecucion en navegador mediante Transformers.js en backend WASM (CPU) y, con la variante split, tambien en WebGPU.
- Ejecucion en ONNX Runtime nativo (Python, C++) usando los ficheros `.onnx`.
- No genera texto: carece de capacidades de razonamiento, codigo, matematicas o conversacion.
- No soporta tool calling, function calling ni flujos de agentes.
- No tiene capacidades de vision, audio ni modo "thinking".
- No realiza clasificacion token a token (NER, POS) sin anadir cabezas adicionales.

## Casos de uso

- Busqueda semantica en el navegador: indexar documentos o notas del usuario y recuperar fragmentos por similitud coseno sin enviar el texto a un servidor, aprovechando que los pesos fp16 o vocab8 ocupan entre 181 y 235 MB.
- Deduplicacion de contenido en aplicaciones web: calcular embeddings de titulos o descripciones en cliente y agrupar duplicados por umbral de similitud, evitando coste de servidor.
- Cache semantico de respuestas de un LLM: almacenar embeddings de consultas previas y reutilizar respuestas cuando la similitud supera un umbral, reduciendo llamadas al modelo generativo.
- Clasificacion por prototipos y moderacion ligera: comparar el embedding de un texto contra embeddings de referencia (por ejemplo, categorias o ejemplos de contenido no deseado) para etiquetar sin entrenar un clasificador.
- Agrupacion de preguntas frecuentes en soporte: clusterizar tickets o consultas entrantes por similitud y enrutarlos a la respuesta o articulo adecuado.
- Recomendacion de contenido: construir un indice vectorial pequeno en el cliente y sugerir articulos, productos o notas relacionados a partir de la similitud entre embeddings.
- Extensiones de navegador y aplicaciones Electron: resaltar pasajes relacionados con la pagina activa o con una consulta del usuario usando Transformers.js sin backend.
- Investigacion sobre cuantizacion selectiva: el repositorio incluye `vocab-quant-compare.html`, util como banco de pruebas de correccion, velocidad y memoria entre variantes fp32, fp16, int8 e int4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, ni evaluaciones tipo MTEB). El autor si publica una tabla de verificacion de correccion en una ejecucion real con WebGPU en Chrome, comparando la similitud coseno de un par de frases no relacionadas contra la referencia fp32 en CPU:

| Variante | Tamano | Similitud coseno A-B (par no relacionado) | Veredicto |
|---|---|---|---|
| `model_fp32.onnx` | 470 MB | -0,07 | correcto |
| `model_fp16.onnx` | 235 MB | -0,07 | correcto |
| `model_vocab8_fp32.onnx` (WASM) | 182 MB | -0,07 | correcto |
| `model_vocab8_fp32.onnx` (WebGPU) | 182 MB | 0,94 | incorrecto, no usar |
| Modelo split: tablas int8 en JS + `model_encoder_fp32.onnx` | 181 MB | -0,07 | correcto en ambos backends |

La referencia fp32 en un par no relacionado es -0,07; valores cercanos a 0 o negativos indican funcionamiento correcto, mientras que valores proximos a 1 indican colapso del embedding. No hay datos de latencia ni de throughput en la informacion proporcionada.

## Requisitos de hardware

- Huella de los pesos: 470 MB en fp32, 235 MB en fp16, 182 MB en `vocab8` (encoder fp32 o fp16) y 181 MB en la variante split.
- Memoria total estimada para inferencia: por debajo de 1 GB en cualquier variante, incluyendo activaciones y tokenizador, lo que permite ejecucion en navegador y en moviles modernos.
- Cabe en GPU de consumo: si, no requiere A100, H100 ni similares. La ruta WASM funciona en CPU sin GPU dedicada; la ruta WebGPU aprovecha cualquier GPU soportada por el navegador.
- Opciones de despliegue: Transformers.js con el pipeline `feature-extraction` (`device: 'wasm'` para las variantes `vocab8`), ONNX Runtime Web para el modelo split, y ONNX Runtime nativo para los ficheros `.onnx`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y llama.cpp no aplica porque no hay pesos GGUF.
- Latencia y throughput: no disponibles. El repositorio incluye `vocab-quant-compare.html` para medir velocidad y memoria de cada variante con las entradas del usuario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Cuantizacion | Navegador | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Este repositorio (variantes mixtas) | No confirmado (~118 M segun el tamano fp32) | No disponible | ONNX + tablas binarias | fp32, fp16, int8 e int4 en las tablas | Si, WASM siempre; WebGPU solo con el modelo split | apache-2.0 | 6 descargas, 0 likes |
| `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (modelo base) | No disponible en la informacion | No disponible | PyTorch/safetensors | No | No, requiere runtime Python | No disponible en la informacion | Modelo base de referencia |
| Build estandar `q8` en ONNX (referenciada en la model card) | No disponible | No disponible | ONNX | int8 dinamico completo | Si, pero devuelve embeddings incorrectos en WebGPU | No disponible | Repositorio no especificado en la model card |

## Limitaciones y advertencias

- Los ficheros `model_vocab8_fp32.onnx` y `model_vocab8_fp16.onnx` producen embeddings incorrectos en WebGPU por el bug de `MatMulInteger` y `DynamicQuantizeLinear` en ONNX Runtime Web 1.24. El fallo es silencioso, sin excepcion ni NaN, y llega a dar similitudes de 0,94 entre frases no relacionadas. Solo deben usarse en backend WASM.
- El PR de correccion en ONNX Runtime esta pendiente (microsoft/onnxruntime#32579); hasta que se integre, el comportamiento defectuoso puede persistir en versiones nuevas.
- El modelo no es generativo: no sirve para chat, razonamiento, generacion de codigo ni tareas de tool calling.
- Los sesgos del modelo base (derivados de XLM-RoBERTa y de su corpus de entrenamiento) no se evaluan ni se mitigan en este repositorio.
- La model card esta truncada en la seccion "Known limitation" ("This does not fix ..."), por lo que existe al menos una limitacion conocida que no queda documentada por completo.
- No hay evaluacion de calidad de los embeddings (MTEB u otras) ni comparacion con la referencia fp32 mas alla del test de similitud de un unico par de frases.
- El impacto del modo int4 (`tables_q4.bin`) sobre la calidad de los embeddings no esta cuantificado en la informacion disponible.
- La licencia del artefacto es apache-2.0, pero conviene verificar los terminos del modelo base y de los datos de entrenamiento originales antes de un uso comercial.
- Adopcion muy baja (6 descargas, 0 likes) y sin validacion de terceros: el soporte y el mantenimiento dependen de un unico autor.
- Al ser un modelo de embeddings, el riesgo principal no es la alucinacion de texto, sino la recuperacion de resultados irrelevantes por umbrales de similitud mal calibrados o por el bug de cuantizacion descrito.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/JoramMillenaar/paraphrase-multilingual-MiniLM-L12-v2-webgpu-safe
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- PR pendiente de correccion en ONNX Runtime: https://github.com/microsoft/onnxruntime/pull/32579
- Script de construccion de variantes: https://huggingface.co/JoramMillenaar/paraphrase-multilingual-MiniLM-L12-v2-webgpu-safe/blob/main/build-variants.py
- Banco de pruebas de cuantizacion de vocabulario: https://huggingface.co/JoramMillenaar/paraphrase-multilingual-MiniLM-L12-v2-webgpu-safe/blob/main/vocab-quant-compare.html
