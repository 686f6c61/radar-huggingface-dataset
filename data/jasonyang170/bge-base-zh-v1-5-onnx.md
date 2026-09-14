# JasonYANG170/bge-base-zh-v1.5-ONNX

## Resumen

bge-base-zh-v1.5-ONNX es una conversión a formato ONNX del modelo de embeddings chino BAAI/bge-base-zh-v1.5 (revision `f03589ceff5aac7111bd60cfc7d497ca17ecac65`), publicada por el usuario JasonYANG170. No incluye ajuste fino adicional: se trata exclusivamente de un proceso de exportación y cuantización pensado para ejecutar el modelo con Transformers.js 4.0.1 en navegador (WebGPU o WASM) y en Node (CPU o WebGPU), sin depender de un backend Python.

El problema que resuelve es de despliegue: el modelo original solo distribuye pesos en formato PyTorch/Safetensors, lo que obliga a montar un servicio de inferencia. Esta versión ofrece artefactos ONNX listos para consumo en el cliente, con dos variantes verificadas (fp32 de 406,9 MB y fp16 de 203,6 MB) y una receta de conversión reproducible documentada (`build-manifest.json`, `export_models.py`, `quantize_q4.py`).

Es relevante ahora porque permite búsqueda semántica en chino directamente en el dispositivo, sin enviar texto del usuario a un servidor, con un coste de almacenamiento de 0,6 GB para el repositorio completo. El repositorio no tiene descargas ni valoraciones y no publica benchmarks de recuperación: la única validación numérica son pruebas de similitud coseno sobre seis entradas en chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder) del modelo base BAAI/bge-base-zh-v1.5; detalles de capas no disponibles en la ficha |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible en la ficha (el modelo base es de tipo BERT-base) |
| Tipos de cuantizacion | fp32, fp16; variantes Q4 de precision mixta generables con `quantize_q4.py`; INT8 descartado por no superar los chequeos numericos |
| Idiomas soportados | chino (`zh`) |
| Licencia | MIT (heredada del modelo original; la conversion no la modifica) |
| Formato de pesos | ONNX (`onnx/model.onnx`, con `onnx/model.onnx_data` asociado) |
| Tarea (pipeline) | feature-extraction (embeddings de token) |
| Dimension de embedding | no disponible en la ficha; los vectores de las variantes small, base y large no son intercambiables |
| Pooling recomendado | CLS pooling + normalizacion segun la receta original; el runtime de EasyEDA documentado usa mean pooling |
| Libreria de inferencia | transformers.js (`@huggingface/transformers`), ONNX Runtime |
| Variantes y tamano | fp32: 406,9 MB (coseno minimo 1,000000); fp16: 203,6 MB (coseno minimo 0,999999) |
| Dispositivos probados | WebGPU, WASM (`device: 'wasm'`), CPU de Node (`device: 'cpu'`) |
| Modelo base | BAAI/bge-base-zh-v1.5, revision `f03589ceff5aac7111bd60cfc7d497ca17ecac65` |
| Tamano del repositorio | 0,6 GB |
| Autor y fecha | JasonYANG170; creado el 2026-09-14, actualizado el 2026-09-14 |

## Arquitectura y entrenamiento

La arquitectura corresponde integramente al modelo base BAAI/bge-base-zh-v1.5, un encoder tipo BERT para representaciones densas de texto en chino. Esta publicacion no entrena ni ajusta el modelo: el autor indica explicitamente "no fine-tuning" y conserva la documentacion original en `UPSTREAM_README.md`. El trabajo realizado es de exportacion a ONNX y de cuantizacion, con scripts reproducibles (`export_models.py`, `quantize_q4.py`) y un manifiesto con revision de origen, versiones de paquetes y sumas de verificacion SHA-256 de cada fichero.

En cuanto a la validacion tecnica, las variantes fp32 y fp16 se compararon contra el FP32 original mediante similitud coseno sobre seis entradas chinas de distinta longitud, con umbrales de 0,999 para FP32/FP16 y 0,98 para las variantes cuantizadas. El propio autor advierte que esta prueba es un "smoke test" numerico y no un benchmark de precision o de recuperacion. La cuantizacion dinamica a INT8 probada no supero los chequeos numericos y se omite del repositorio. La inferencia fp16 en GPU se verifico con Transformers.js 4.0.1 y ONNX Runtime Node 1.24.3 sobre WebGPU nativo en una RTX 5080 Laptop.

## Capacidades

- Generacion de embeddings de token para texto en chino, con pooling CLS y normalizacion como receta prevista por el modelo original.
- Recuperacion semantica densa (dense retrieval) y busqueda por similitud sobre corpus en chino.
- Clustering, deduplicacion y agrupacion de documentos por similitud vectorial.
- Clasificacion por similitud con prototipos (zero-shot con ejemplos de referencia), filtrado y enrutado de consultas.
- Ejecucion en navegador mediante WebGPU o WASM y en Node mediante CPU o WebGPU, sin servidor Python.
- No es un modelo generativo: no produce texto, no soporta tool calling ni function calling, y no implementa razonamiento multi-paso ni modo "thinking".
- No dispone de capacidades de vision, audio ni multimodalidad.
- Soporte multilingue limitado al chino; no se documenta rendimiento en otros idiomas.
- El modelo base recomienda el uso de un prefijo de instruccion en las consultas de recuperacion, pero la ficha de esta conversion no documenta ni valida ese extremo.

## Casos de uso

- Busqueda semantica en aplicaciones web en chino ejecutada en el cliente: el navegador puede cargar la variante fp16 (203,6 MB) con WebGPU y calcular embeddings localmente, evitando enviar el texto del usuario a un servidor.
- RAG sobre documentacion tecnica en chino sin backend de inferencia: los vectores de los documentos se precalculan y se almacenan, y solo la consulta se embebe en tiempo de ejecucion con WASM o CPU.
- Deduplicacion de corpus chinos: agrupando por similitud coseno de embedding normalizado se pueden detectar documentos casi identicos en pipelines de limpieza de datos.
- Enrutado y clasificacion de tickets de soporte: comparando el embedding del ticket con prototipos por categoria se obtiene una asignacion sin entrenar un clasificador dedicado.
- Despliegue en entornos aislados o air-gapped: el autor indica que se puede descargar el repositorio completo para importacion offline, lo que permite operar sin acceso a HuggingFace.
- Integracion en herramientas de escritorio o IDE basadas en navegador (el caso documentado es EasyEDA), donde se selecciona explicitamente el `dtype` y se usa mean pooling en lugar de CLS.
- Recomendacion de articulos, FAQ o componentes similares en aplicaciones moviles o de escritorio con recursos limitados, gracias al reducido tamano del artefacto fp16.
- Filtrado semantico de contenido en chino comparando contra una lista de referencias vectorizadas, como paso previo a una revision manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion numerica del autor es una prueba de similitud coseno (no un benchmark de recuperacion ni de precision) sobre seis entradas chinas:

| Variante | Tamano (grafo + pesos) | Coseno minimo frente al FP32 original |
|---|---|---|
| fp32 | 406,9 MB | 1,000000 |
| fp16 | 203,6 MB | 0,999999 |

El autor indica que los umbrales de aceptacion fueron 0,999 para FP32/FP16 y 0,98 para variantes cuantizadas, que los informes incluyen error absoluto maximo y, en generacion, acuerdo de siguiente token, y que la similitud de salida no establece correccion factual.

## Requisitos de hardware

- VRAM/RAM para inferencia: no disponible como cifra medida; los pesos ocupan 406,9 MB (fp32) y 203,6 MB (fp16), por lo que el consumo total depende del runtime de ONNX Runtime y del tamano de lote.
- GPU probada: RTX 5080 Laptop GPU, con Transformers.js 4.0.1 y ONNX Runtime Node 1.24.3 sobre WebGPU nativo en fp16.
- Cabe en GPU de consumo: si, dado el reducido tamano de los pesos en fp32 y fp16; no se documentan pruebas en otras GPU concretas.
- CPU: soportada explicitamente mediante `device: 'wasm'` en navegador y `device: 'cpu'` en Node, en ambos casos con fp32.
- Opciones de despliegue documentadas: Transformers.js (navegador WebGPU/WASM y Node CPU/WebGPU). No se proporcionan artefactos GGUF ni integraciones con vLLM, TGI, Ollama o llama.cpp.
- Latencia y throughput: no disponibles; la ficha no publica medidas de tiempo por lote ni de tokens por segundo.
- Nota de despliegue: hay que descargar el repositorio completo para importacion offline y mantener `onnx/model.onnx_data` junto a `onnx/model.onnx`. Un cliente en linea que fije `q8` no podra cargar este repositorio, porque esa variante no existe.

## Comparativa con modelos similares

Datos de las alternativas no disponibles en la informacion proporcionada; solo se comparan los aspectos documentados en esta ficha.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JasonYANG170/bge-base-zh-v1.5-ONNX | no disponible | no disponible | ONNX (fp32, fp16) | MIT | HuggingFace; 0 descargas, 0 likes |
| BAAI/bge-base-zh-v1.5 (modelo base) | no disponible | no disponible | PyTorch/Safetensors (no indicado en la ficha) | MIT | HuggingFace |
| BAAI/bge-small-zh-v1.5 | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion |
| BAAI/bge-large-zh-v1.5 | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion |

Unico dato comparativo aportado por el autor: los vectores de las variantes small, base y large tienen dimensiones distintas y no deben mezclarse.

## Limitaciones y advertencias

- Ausencia total de benchmarks de recuperacion o de precision; la validacion se limita a un smoke test de coseno sobre seis entradas chinas, segun el propio autor.
- El autor advierte que la similitud de salida no establece correccion factual; los embeddings pueden producir similitudes altas entre textos no relacionados semanticamente.
- No existe variante INT8: la cuantizacion dinamica probada no supero los chequeos numericos. Las variantes Q4 de precision mixta se generan con un script, pero no aparecen con metricas en la tabla de variantes.
- Riesgo de inconsistencia por pooling: la receta original usa CLS pooling con normalizacion, mientras que el runtime de EasyEDA emplea mean pooling. Mezclar vectores generados con recetas distintas invalida las comparaciones.
- No se pueden mezclar vectores de las variantes small, base y large: tienen dimensiones diferentes. Ademas, hay que reconstruir los vectores de los documentos si se cambia el tamano del modelo, la precision o el pooling.
- Idioma unico (chino); no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Problema tecnico sin resolver: en WebGPU nativo con Node, el proceso termina con codigo de salida 1 durante el apagado sin diagnostico, aunque las comprobaciones de inferencia pasan. Es un caveat relevante para pipelines automatizados.
- Limitaciones de integracion: hay que fijar el `dtype` explicitamente; un cliente que asuma la existencia de `q8` fallara al cargar el repositorio.
- Licencia MIT del modelo original, que se mantiene en la conversion; hay que conservar la documentacion y la atribucion del upstream.
- Madurez nula de la publicacion: 0 descargas, 0 likes y fecha de creacion 2026-09-14, sin validacion independiente de la comunidad.
- El autor indica que el runtime de navegador de EasyEDA no se probo directamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JasonYANG170/bge-base-zh-v1.5-ONNX
- Modelo base: https://huggingface.co/BAAI/bge-base-zh-v1.5 (revision usada: `f03589ceff5aac7111bd60cfc7d497ca17ecac65`)
- Documentacion original conservada en el repositorio: `UPSTREAM_README.md`
- Manifiesto de compilacion con versiones y sumas SHA-256: `build-manifest.json`
- Scripts de conversion y cuantizacion incluidos: `export_models.py`, `quantize_q4.py`
- Busqueda web: no se han encontrado enlaces relevantes al modelo en los resultados obtenidos (los resultados devueltos corresponden a OSHA y no guardan relacion con este modelo).
