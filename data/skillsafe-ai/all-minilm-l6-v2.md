# skillsafe-ai/all-minilm-l6-v2

## Resumen

`skillsafe-ai/all-minilm-l6-v2` es un artefacto de exportación a ONNX del modelo de embeddings `sentence-transformers/all-MiniLM-L6-v2`, publicado por SkillSafe para su uso directo en navegador mediante `transformers.js` y `onnxruntime-web`. No es un modelo nuevo ni un reentrenamiento: la model card indica explícitamente que se importó "as published upstream (no conversion)", con cada fichero fijado por SHA-256 al commit `1110a243fdf4706b3f48f1d95db1a4f5529b4d41` del repositorio original. El problema que resuelve es de distribución: ofrece un binario ONNX verificable (opset 14, 86,22 MB) listo para ejecutarse en el cliente sin depender de un servicio de inferencia remoto.

El modelo subyacente es un transformer tipo BERT de 6 capas y 384 dimensiones de embedding, diseñado para extracción de características y similitud semántica, no para generación de texto. La relevancia actual del artefacto está en su enfoque de cadena de suministro: receta reproducible, hashes por fichero, verificación con `onnx.checker` y una ejecución de humo en CPU, algo poco habitual en exports ONNX de terceros. Como contrapartida, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación de la comunidad.

La ventana de contexto y el número de parámetros no se declaran en la model card de este repositorio; los valores que se indican más abajo proceden del modelo base upstream y se señalan como tales en cada caso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder, 6 capas, 12 cabezas de atencion, hidden 384) — dato del modelo base upstream, no declarado en esta model card |
| Parametros totales | Aproximadamente 22,7 millones — dato del modelo base upstream, no declarado en esta model card |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 posiciones (`max_position_embeddings` del modelo base); el entrenamiento upstream uso secuencias de 256 tokens. No declarado en esta model card. La firma ONNX acepta `sequence_length` dinamica |
| Tipos de cuantizacion | El unico artefacto del repositorio es ONNX en fp32 (86,22 MB). La etiqueta del repositorio incluye `base_model:quantized:sentence-transformers/all-MiniLM-L6-v2`, pero la model card afirma que la importacion se hizo tal cual desde el upstream y no documenta ningun esquema de cuantizacion |
| Idiomas soportados | No disponible en la model card; el modelo base upstream esta entrenado predominantemente con datos en ingles |
| Licencia | Apache-2.0 (pesos); la receta de conversion y la model card pertenecen al repositorio de SkillSafe y llevan su propia licencia |
| Formato de pesos | ONNX, opset 14 (`onnx/model.onnx`, 86,22 MB). No se distribuyen safetensors ni GGUF. Se incluyen `tokenizer.json` (0,44 MB), `tokenizer_config.json`, `special_tokens_map.json`, `config.json` y `1_Pooling/config.json` |
| Dimension de salida | 384 (`last_hidden_state` float32 de forma `[batch_size, sequence_length, 384]`) |
| Entradas ONNX | `input_ids` int64, `attention_mask` int64, `token_type_ids` int64, todas con forma `['batch_size', 'sequence_length']` |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un encoder transformer estilo BERT de 6 capas con 384 dimensiones ocultas, destilado por sentence-transformers a partir de modelos mayores para producir embeddings de frase de 384 dimensiones. Este repositorio no contiene un entrenamiento propio; es un export ONNX del modelo ya entrenado, generado con Python 3.12.13, torch 2.10.0, onnx 1.23.0 y onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64. La conversion esta fechada el 2026-09-22T19:25:20+00:00 y se rige por la receta `recipes/all-minilm-l6-v2.yaml` (sha256 `f9952782499e6e14804614c051efcfbc54d1b6c6f958669f613f0768f2203d44`).

La innovacion destacable no es algorítmica sino de verificabilidad: cada fichero esta fijado por SHA-256 a su origen, todos los ONNX pasaron `onnx.checker` y una prueba de humo en CPU con entradas rellenas de ceros a las formas declaradas, con un tiempo de 2,7 ms para `input_ids[1,8]`, `attention_mask[1,8]`, `token_type_ids[1,8]` y salida `last_hidden_state[1,8,384]`. El repositorio clasifica sus ficheros en tres clases: `registry` (parametros servidos desde `models.skillsafe.ai` una vez vetados), `bundle` (se envian dentro de una aplicacion) y `registry-shared` (libreria de runtime reutilizada por modelos de la misma arquitectura). No se documenta el corpus de entrenamiento, el numero de tokens ni el uso de RLHF o DPO, porque corresponden al upstream y no se reproducen aqui.

## Capacidades

- Extraccion de caracteristicas: genera representaciones vectoriales de 384 dimensiones para texto de entrada. Es la unica tarea declarada (`pipeline: feature-extraction`).
- Similitud semantica: al ser un modelo de sentence embeddings, permite calcular similitud coseno entre frases y documentos.
- Busqueda semantica: recuperacion densa sobre corpus indexados previamente con el mismo modelo.
- Clustering y deduplicacion: agrupamiento de textos por proximidad en el espacio de embeddings.
- Clasificacion con cabecera externa: los embeddings sirven como entrada a un clasificador ligero entrenado aparte (regresion logistica, SVM lineal).
- Ejecucion en navegador: el contrato ONNX y las instrucciones de la model card estan pensados para `onnxruntime-web` con `executionProviders: ["webgpu", "wasm"]`.
- Generacion de texto: no soportada. No es un modelo causal ni seq2seq.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no declaradas; el modelo base upstream esta orientado a ingles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Busqueda semantica en el navegador: el ONNX puede ejecutarse con WebGPU o WASM sobre el texto que el usuario teclea, sin enviar consultas a un servidor. Adecuado por el tamano del binario (86,22 MB) y porque no requiere backend.
- Recuperacion aumentada (RAG) con privacidad de datos: indexar documentos locales y recuperar fragmentos relevantes con embeddings calculados en el propio dispositivo, evitando exponer el corpus a un servicio externo.
- Deduplicacion de datasets: calcular embeddings de un corpus de entrenamiento y eliminar near-duplicates por umbral de similitud coseno antes de pasarlo a otro pipeline.
- Clasificacion de tickets y correo entrante: usar los embeddings como caracteristicas de un clasificador ligero para enrutar soporte, spam o categorias tematicas.
- Moderacion y filtrado de contenido en el cliente: integrar el modelo como capa `bundle` en una aplicacion para puntuar similitud contra una lista de patrones o ejemplos etiquetados, sin coste de red.
- Recomendacion de contenido: representar articulos, productos o publicaciones como vectores y ordenar por similitud respecto al historial o la consulta del usuario.
- Agrupamiento exploratorio de textos: clustering de encuestas, resenas o incidencias para descubrir temas recurrentes sin etiquetas previas.
- Deteccion de similitud en pipelines de CI: comparar descripciones de cambios, documentacion o mensajes de commit para detectar duplicados semanticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio solo documenta una prueba de humo de correctitud y latencia (2,7 ms para un lote de 1 con 8 tokens en CPU arm64), no resultados de calidad sobre MTEB, SentEval ni tareas downstream. El modelo base `sentence-transformers/all-MiniLM-L6-v2` si dispone de evaluaciones publicadas por su autor, pero no se reproducen aqui y no deben atribuirse a este artefacto sin verificacion independiente.

## Requisitos de hardware

- VRAM estimada: inferior a 500 MB en fp32 para el encoder de 6 capas. El fichero ONNX ocupa 86,22 MB en disco; el consumo en memoria depende del runtime y del tamano de lote y secuencia.
- Cabe en cualquier GPU consumer: cualquier RTX, GTX o iGPU con soporte de WebGPU puede ejecutarlo. Una RTX 4090 o una A100 estan enormemente sobredimensionadas para este modelo.
- CPU: la propia model card reporta la prueba de humo en CPU (Darwin arm64) en 2,7 ms, por lo que la inferencia en CPU es viable para cargas interactivas.
- Movil y edge: viable por tamano; requiere un runtime ONNX compatible.
- Opciones de despliegue: `onnxruntime-web` (WebGPU/WASM) en navegador; ONNX Runtime en Python, C++, C#, Java o Rust; `transformers.js`; servidores de embeddings como Hugging Face Text Embeddings Inference; vLLM con tarea de embeddings. No se ha publicado compatibilidad con llama.cpp u Ollama, ya que no se distribuye GGUF.
- Latencia y throughput: solo se conoce el dato de 2,7 ms por lote de 1 con 8 tokens en CPU arm64 durante la verificacion. No hay datos de throughput para lotes grandes ni para GPU.

## Comparativa con modelos similares

Los datos de las alternativas proceden de documentacion publica de sus repositorios y no se han verificado en esta ficha.

| Modelo | Parametros | Dim. embedding | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|---|
| `skillsafe-ai/all-minilm-l6-v2` | Aprox. 22,7 M (upstream) | 384 | 512 (entrenado a 256) | Apache-2.0 | ONNX opset 14 | Export browser-ready con hashes SHA-256 por fichero y receta reproducible; 0 descargas, poca validacion comunitaria |
| `sentence-transformers/all-MiniLM-L6-v2` | Aprox. 22,7 M | 384 | 512 (entrenado a 256) | Apache-2.0 | PyTorch, safetensors, ONNX | Fuente upstream; incluye pipeline de sentence-transformers con pooling integrado y evaluaciones publicadas |
| `Xenova/all-MiniLM-L6-v2` | Aprox. 22,7 M | 384 | 512 | Apache-2.0 | ONNX, transformers.js | Alternativa browser-ready muy extendida; segun la informacion publica de su repositorio incluye variantes cuantizadas |
| `BAAI/bge-small-en-v1.5` | Aprox. 33 M | 384 | 512 | MIT | PyTorch, ONNX | Modelo de recuperacion en ingles con contexto mas largo que MiniLM-L6; su autor reporta mejor rendimiento en MTEB, no verificado aqui |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso. Cualquier expectativa en ese sentido es un error de uso.
- El ONNX no incluye cabecera de pooling: la salida es `last_hidden_state`, no un embedding de frase. Para obtener vectores de 384 dimensiones hay que aplicar mean pooling (los parametros estan en `1_Pooling/config.json`) y, para similitud coseno, normalizar L2.
- La salida es float32 sin normalizar por defecto, lo que puede producir puntuaciones de similitud fuera del rango [0, 1] si no se normaliza.
- Idioma: no se declaran idiomas soportados. El modelo base upstream esta orientado a ingles; el rendimiento en castellano u otras lenguas no esta garantizado ni documentado.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o equidad para este artefacto. Hereda los sesgos de los datos de entrenamiento del upstream, que no se describen en la model card.
- Alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos en tareas de similitud, deduplicacion o filtrado por umbrales mal calibrados.
- Licencia: Apache-2.0 permite uso comercial de los pesos, con obligacion de conservar el aviso de licencia y la atribucion a sentence-transformers. La receta de conversion y la model card pertenecen al repositorio de SkillSafe y se rigen por su propia licencia.
- Cadena de suministro: los ficheros de clase `registry` se sirven desde `models.skillsafe.ai` una vez vetados, lo que introduce una dependencia de infraestructura externa al margen de Hugging Face.
- Discrepancia sin resolver: la etiqueta `base_model:quantized:...` sugiere una cuantizacion que la model card no documenta y que el tamano del fichero (86,22 MB) no respalda como int8.
- Madurez: 0 descargas y 0 likes en la fecha de consulta. No hay evidencia de uso en produccion ni de mantenimiento continuado.
- Fecha de publicacion inusual (2026-09-22): conviene verificar la vigencia y el estado del repositorio antes de integrarlo en un pipeline critico.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/skillsafe-ai/all-minilm-l6-v2
- Modelo base upstream: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Commit exacto del upstream: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/tree/1110a243fdf4706b3f48f1d95db1a4f5529b4d41
- Repositorio de recetas y conversores de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Servicio de artefactos de SkillSafe: https://models.skillsafe.ai
- Aviso de licencia del upstream: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/blob/1110a243fdf4706b3f48f1d95db1a4f5529b4d41/README.md
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: todos los resultados disponibles trataban sobre el Dia Mundial de las Abejas y no guardan relacion con el artefacto. No hay papers, blogs, demos ni hilos de discusion adicionales que enlazar.
