# Hoon03/subnota-bge-m3-koen-int8-onnx

## Resumen

`Hoon03/subnota-bge-m3-koen-int8-onnx` es una conversion no oficial del modelo de embeddings BAAI/bge-m3 (revision `5617a9f61b028005a4858fdac845db406aefb181`), publicada por el usuario Hoon03. No es un modelo entrenado desde cero ni un lanzamiento de BAAI: parte de los pesos originales, recorta el vocabulario del tokenizador a coreano e ingles y exporta el grafo a ONNX con cuantizacion dinamica int8. El resultado es un encoder de frases de aproximadamente 0,4 GB pensado para inferencia ligera en entornos con CPU o GPU modestas.

El cambio principal respecto al original es el vocabulario: se eliminaron los tokens cuyo texto (sin el marcador de inicio de palabra `▁`) contiene caracteres fuera de hangul y ASCII, conservando simbolos, digitos, puntuacion y emojis. El vocabulario pasa de 250.002 a 91.471 tokens, con los ids 0-3 reservados para `<s>`, `<pad>`, `</s>` y `<unk>`. Las filas de embedding de los tokens conservados se copian sin modificar y no se realizo ningun entrenamiento adicional; unicamente se actualiza `vocab_size` en `config.json`.

Es relevante ahora porque reduce el coste de despliegue de un modelo de retrieval multilingue a un caso bilingue concreto (coreano-ingles) sin perdida medible de calidad en ese dominio: segun el autor, la similitud coseno frente al modelo original cuantizado de la misma forma es >= 0,99999 en 422 de 423 frases de prueba. El precio es que cualquier texto en otras escrituras (chino, japones, latin acentuado) se mapea a `<unk>`, por lo que no sustituye al modelo completo fuera de ese par de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia XLM-RoBERTa, segun la etiqueta `xlm-roberta` y el modelo base BAAI/bge-m3) |
| Parametros totales | No disponible en la informacion proporcionada; el modelo base BAAI/bge-m3 declara del orden de 568 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base BAAI/bge-m3 soporta 8.192 tokens |
| Tipos de cuantizacion | int8 dinamica (pesos de `MatMul` y `Gather` cuantizados a int8 con signo); se distribuye `onnx/model_quantized.onnx` |
| Idiomas soportados | Coreano e ingles (vocabulario recortado a hangul y ASCII); otras escrituras caen en `<unk>` |
| Licencia | MIT |
| Formato de pesos | ONNX, opset 17, salida `last_hidden_state`; fichero de 406.126.989 bytes con SHA-256 `1d2146b78742f6801528e971a2b4cd03f42d675d66d705c4e15fa34307f781c4` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de BGE-M3, un encoder transformer (columna vertebral XLM-RoBERTa) disenado para embeddings de texto con capacidad densa, dispersa (sparse/lexica) y multi-vector (estilo ColBERT). Esta conversion no introduce cambios en los pesos mas alla de la cuantizacion: no hubo entrenamiento, ni destilacion, ni ajuste fino. Lo unico que se modifica es el vocabulario del tokenizador Unigram, que se restringe a los tokens coreanos e ingleses y se renumera, actualizando en consecuencia `vocab_size` en la configuracion.

El proceso de conversion consta de tres pasos segun la model card: recorte del vocabulario (de 250.002 a 91.471 tokens, preservando ids 0-3 para tokens especiales), exportacion a ONNX (opset 17, salida `last_hidden_state`) y cuantizacion dinamica de los pesos de `MatMul` y `Gather`. Los ficheros de tokenizador y `config.json` provienen de Xenova/bge-m3 (revision `4de13258303883538bd53b696b452bf8099f0858`). El uso previsto es pooling CLS con normalizacion L2 y sin prefijo de consulta ni de pasaje.

## Capacidades

- Generacion de embeddings de frases y pasajes normalizados (pooling CLS + L2), listos para similitud coseno o producto escalar.
- Busqueda semantica y recuperacion de informacion (retrieval) sobre corpus en coreano e ingles.
- Indexacion vectorial para RAG: el modelo actua como componente de embedding, no como generador.
- Clustering y deduplicacion semantica de documentos.
- Clasificacion de texto y analisis de similitud mediante caracteristicas extraidas del encoder.
- No soporta tool calling ni function calling (no es un modelo generativo ni instruido).
- No soporta agentes ni razonamiento multi-paso por si mismo; puede usarse como retriever dentro de un pipeline agentico.
- Capacidades multilingues limitadas estrictamente a coreano e ingles; el resto de escrituras se resuelve como `<unk>`.
- No dispone de modo de pensamiento (thinking mode), vision, audio ni generacion autoregresiva.

## Casos de uso

- Busqueda semantica bilingue coreano-ingles: indexar un corpus mixto y recuperar pasajes por similitud coseno con embeddings normalizados, aprovechando que el mismo espacio vectorial cubre ambos idiomas.
- RAG sobre documentacion tecnica en coreano: usar el modelo como retriever en un pipeline de generacion aumentada, reduciendo el tamano del indice porque el vocabulario recortado genera secuencias mas cortas en textos hangul.
- Deduplicacion de tickets de soporte: calcular embeddings de tickets historicos y agrupar por similitud para detectar incidencias repetidas antes de asignarlas a un agente.
- Clasificacion de resenas o comentarios: entrenar un clasificador ligero (regresion logistica, SVM) sobre los embeddings congelados para tareas de sentimiento o tematica en coreano e ingles.
- Despliegue en el navegador o en edge: al ser un ONNX int8 de 406 MB, puede ejecutarse con Transformers.js o ONNX Runtime en cliente, sin enviar el texto a un servidor.
- Filtrado previo de candidatos en un sistema de recomendacion de contenidos: embedding de titulos y descripciones para recuperar los articulos mas afines a un perfil de usuario.
- Moderacion de contenido asistida: representar mensajes como vectores y compararlos contra un conjunto de referencia etiquetado para priorizar revision humana.
- Servicio de embeddings de bajo coste en CPU: para volumenciones de inferencia internas donde no se justifica mantener el modelo completo multilingue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica medida de rendimiento reportada es una comparacion de equivalencia funcional frente al modelo base cuantizado de la misma manera: similitud coseno >= 0,99999 en 422 de 423 frases de prueba con Transformers.js, siendo la frase restante la unica que contenia un caracter chino. No hay datos de MIRACL, MKQA, MTEB ni de tareas de retrieval para esta conversion concreta.

## Requisitos de hardware

- El fichero ONNX cuantizado ocupa 406.126.989 bytes (aproximadamente 0,4 GB), por lo que la inferencia en CPU requiere del orden de 0,5 a 1 GB de RAM segun el backend y el lote.
- Cabe holgadamente en cualquier GPU de consumo: una RTX 3060, RTX 4060 o superior lo mantiene en VRAM con margen amplio (estimacion: menos de 1 GB con int8).
- GPU de centro de datos (A100, H100) no son necesarias; solo tendrian sentido para lotes muy grandes o para servir el modelo sin cuantizar.
- Despliegue mediante ONNX Runtime (Python, C++, C#), Transformers.js para entorno web, o cualquier runtime compatible con ONNX opset 17. No requiere vLLM ni TGI, que estan orientados a modelos generativos.
- No se han publicado cifras de latencia ni throughput en la informacion disponible.

## Comparativa con modelos similares

Los datos de parametros y contexto de las alternativas provienen de la documentacion publica de BAAI y no de la informacion de este repositorio.

| Modelo | Parametros | Contexto | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Hoon03/subnota-bge-m3-koen-int8-onnx | No confirmado; heredado del base (~568 M) | No confirmado; heredado del base (8.192) | Coreano e ingles | ONNX int8 | MIT | Conversion no oficial, vocabulario recortado |
| BAAI/bge-m3 (original) | ~568 M | 8.192 | Multilingue (mas de 100 idiomas) | safetensors / PyTorch | MIT | Modelo de referencia, soporta embedding denso, sparse y multi-vector |
| Xenova/bge-m3 | ~568 M | 8.192 | Multilingue | ONNX (sin cuantizar) | MIT | Conversion ONNX comunitaria de la que se reutilizan tokenizador y config |

## Limitaciones y advertencias

- Es una conversion no oficial: BAAI no ha respaldado este modelo ni la marca Subnota, y el autor lo indica explicitamente.
- El recorte de vocabulario rompe el soporte multilingue fuera de coreano e ingles. Texto en chino, japones, latin acentuado u otras escrituras se mapea a `<unk>` y degrada la calidad; en esos casos debe usarse BAAI/bge-m3 original.
- La cuantizacion dinamica int8 de `MatMul` y `Gather` puede introducir pequenas diferencias numericas respecto al modelo sin cuantizar, aunque el autor reporta equivalencia practicamente total en su conjunto de prueba.
- No se realizo ningun entrenamiento ni ajuste: no hay garantia de mejora en ninguna tarea respecto al modelo base.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si existe riesgo de recuperaciones irrelevantes cuando la consulta o el corpus contienen caracteres fuera del vocabulario conservado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un unico autor, sin validacion externa ni evaluacion en benchmarks publicos; conviene validar en el dominio de uso antes de llevarlo a produccion.
- La licencia MIT se hereda del modelo original y permite uso comercial, pero no se ofrece ninguna garantia por parte de BAAI ni de Hoon03.
- El uso correcto exige pooling CLS con normalizacion L2 y sin prefijos de consulta o pasaje; aplicar prefijos o pooling medio alteraria los resultados respecto al modelo base.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/Hoon03/subnota-bge-m3-koen-int8-onnx
- Modelo base BAAI/bge-m3: https://huggingface.co/BAAI/bge-m3
- Conversion ONNX de referencia Xenova/bge-m3: https://huggingface.co/Xenova/bge-m3
- Paper del modelo base BGE-M3 (arXiv:2402.03216): https://arxiv.org/abs/2402.03216
