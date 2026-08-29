# jonasreyes/dra-nomic-embed

## Resumen

`dra-nomic-embed` es una conversión a formato ONNX del modelo de embeddings `nomic-ai/nomic-embed-text-v1.5`, optimizada para inferencia en CPU sin dependencias de PyTorch ni Transformers. Desarrollado por Jonás Reyes como motor de búsqueda semántica local para su agente autónomo DRA (DeepRoot Agent), este repositorio distribuye dos variantes: una en FP32 (522 MB) y otra en INT8 dinámico (131 MB), ambas con el mismo contexto máximo de 8.192 tokens y dimensiones vectoriales de 768 con soporte de downsampling Matryoshka.

La relevancia de este modelo radica en su enfoque de soberanía digital: permite ejecutar búsqueda semántica y generación de embeddings en entornos aislados, sin conexión a servicios externos y con un consumo de recursos muy reducido. El autor reporta un rendimiento de 7,8 textos por segundo en un procesador Intel Core i5-4308U de 2014 con la variante INT8, lo que lo hace viable para hardware modesto o embebido. La licencia Apache 2.0 del modelo base facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-like) |
| Parametros totales | no disponible |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | FP32, INT8 dinamico |
| Idiomas soportados | es, en (segun el autor; el modelo base esta entrenado principalmente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model.onnx, model_int8.onnx) |

## Arquitectura y entrenamiento

El modelo base `nomic-embed-text-v1.5` es un transformer encoder con 768 dimensiones de salida, entrenado con un objetivo de contraste y con soporte de downsampling Matryoshka, lo que permite reducir las dimensiones del embedding sin reentrenar. Su contexto de 8.192 tokens lo hace adecuado para documentos largos. El entrenamiento original utilizo datos en ingles y supero a OpenAI Ada-002 y text-embedding-3-small en los benchmarks MTEB y LoCo, segun el paper tecnico de Nomic.

La conversion a ONNX realizada en este repositorio no modifica la arquitectura ni los pesos, solo el formato de serializacion. El proceso de exportacion se llevo a cabo en un entorno aislado con `optimum[exporters]`, `torch` y `transformers`, y posteriormente se purgaron todas las dependencias pesadas para obtener un paquete autonomo. La cuantizacion INT8 es dinamica, optimizada para instrucciones vectoriales AVX2/FMA/VNNI, y conserva un 93,34% de similitud coseno respecto a la version FP32 segun las pruebas del autor.

## Capacidades

- Generacion de embeddings de texto para busqueda semantica y similitud entre frases o documentos.
- Soporte de downsampling Matryoshka: permite reducir las 768 dimensiones a valores menores (por ejemplo, 512, 256, 128) sin perdida significativa de calidad.
- Contexto largo de 8.192 tokens, adecuado para procesar documentos extensos o conversaciones multi-turno.
- Optimizado para CPU: no requiere GPU ni PyTorch en runtime, solo `onnxruntime` y `tokenizers`.
- Bilingue es/en segun la ficha del autor, aunque el modelo base fue entrenado principalmente con datos en ingles.
- Integrable en pipelines de RAG, clasificacion de textos, deduplicacion y sistemas de recomendacion.

## Casos de uso

- Busqueda semantica local en aplicaciones de escritorio o servidores sin GPU: el modelo puede indexar documentos y responder consultas en lenguaje natural con latencias inferiores a 5 ms en hardware moderno, gracias a su formato ONNX y cuantizacion INT8.
- Recuperacion aumentada por generacion (RAG) en entornos con restricciones de privacidad: al ejecutarse en local, los datos no salen del dispositivo, lo que lo hace idoneo para sectores como salud, legal o banca.
- Clasificacion de tickets de soporte: se pueden generar embeddings de los mensajes de los clientes y compararlos con categorias predefinidas para enrutar automaticamente las incidencias.
- Deduplicacion de documentos en grandes repositorios: al calcular la similitud coseno entre embeddings, se pueden identificar articulos duplicados o casi duplicados en bases de conocimiento.
- Analisis de codigo fuente: el autor menciona que el modelo fue probado con codigo, consultas SQL y documentacion tecnica, por lo que puede usarse para buscar funciones o fragmentos similares en un repositorio.
- Sistema de recomendacion de articulos o noticias: a partir del embedding de un texto leido, se pueden sugerir contenidos relacionados calculando la distancia coseno con el resto del corpus.

## Benchmarks y rendimiento

El autor proporciona una evaluacion comparativa en un Intel Core i5-4308U dual-core a 2,80 GHz (2014) procesando 1.200 textos tecnicos reales:

| Variante | Tamano en disco | Velocidad (textos/seg) | Retencion de fidelidad (similitud coseno) |
| :--- | :--- | :--- | :--- |
| INT8 (recomendado) | 131,49 MB | 7,8 | 93,34% |
| FP32 (original) | 522,25 MB | 5,7 | 100% |

No se han publicado resultados de benchmarks estandar (MTEB, LoCo) para esta conversion especifica. El modelo base `nomic-embed-text-v1.5` supera a OpenAI Ada-002 y text-embedding-3-small en los benchmarks MTEB y LoCo, segun el paper de Nomic, pero no se dispone de las cifras exactas en la informacion proporcionada.

## Requisitos de hardware

- CPU compatible con instrucciones AVX2/FMA/VNNI para aprovechar al maximo la cuantizacion INT8.
- RAM: aproximadamente 150 MB para la variante INT8 y 550 MB para la FP32, segun el tamano de los archivos.
- No requiere GPU; puede ejecutarse en procesadores de bajo consumo, Raspberry Pi o sistemas embebidos.
- Opciones de despliegue: ONNX Runtime (C++ o Python), integrable en aplicaciones nativas o servicios web ligeros.
- Latencia estimada: el autor proyecta latencias inferiores a 5 ms en hardware moderno (Intel Core Ultra, AMD Ryzen 7000/9000, Apple Silicon), aunque no se proporcionan mediciones concretas.

## Comparativa con modelos similares

No se dispone de una comparativa detallada con otros modelos de embeddings en la informacion proporcionada. Como referencia cualitativa, el modelo base `nomic-embed-text-v1.5` se posiciona en la categoria de embeddings de contexto largo (8K) con 768 dimensiones, similar a `bge-large-en` o `e5-large-v2`, pero con la ventaja de ser totalmente reproducible y de codigo abierto. La conversion ONNX de este repositorio anade la ventaja de no requerir PyTorch en runtime, lo que lo diferencia de la mayoria de alternativas que se distribuyen en formato PyTorch o safetensors.

## Limitaciones y advertencias

- El modelo base fue entrenado principalmente con datos en ingles; el soporte de español puede ser limitado en precision semantica, a pesar de que el autor lo etiqueta como bilingue.
- La cuantizacion INT8 introduce una perdida de fidelidad del 6,66% en similitud coseno, que puede afectar a tareas que requieran alta precision (por ejemplo, busqueda en dominios muy especializados).
- No se proporcionan datos sobre sesgos o alucinaciones especificos de esta conversion; al ser un modelo de embeddings, no genera texto, pero puede reflejar sesgos presentes en los datos de entrenamiento originales.
- El repositorio no incluye un tokenizador propio; se debe descargar el archivo `tokenizer.json` por separado, y el codigo de ejemplo asume un padding manual que puede requerir ajustes para lotes de tamano variable.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los terminos del modelo base original y de cualquier dependencia adicional.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jonasreyes/dra-nomic-embed
- Modelo base original: https://huggingface.co/nomic-ai/nomic-embed-text-v1.5
- Paper tecnico de Nomic Embed: https://arxiv.org/abs/2402.01613
- Proyecto DRA (DeepRoot Agent): https://gitlab.com/jonasreyes/dra
- Proyecto fundacional DeepRoot: https://gitlab.com/jonasreyes/deeproot
