# rafiazarin/bge-base-en-v1.5-onnx

## Resumen

rafiazarin/bge-base-en-v1.5-onnx es una exportacion a ONNX de 8 bits del modelo de embeddings BAAI/bge-base-en-v1.5, publicada por el usuario rafiazarin bajo licencia MIT. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos orientada al despliegue en el navegador mediante transformers.js: el repositorio ocupa 0,1 GB y esta etiquetado con el pipeline feature-extraction, es decir, su unica funcion es convertir texto en vectores densos.

La relevancia de esta ficha es practica, no cientifica. El autor declara que ha utilizado exactamente los mismos ajustes de exportacion y cuantizacion que en su otro repositorio, rafiazarin/bge-base-pubmed-finetuned, con el objetivo de poder comparar ambos modelos de forma justa dentro de una demo que se ejecuta en el navegador. La cuantizacion aplicada es QInt8 dinamica con la opcion per_channel_reduce_range, y la model card indica explicitamente que debe usarse pooling sobre el token CLS y normalizar los embeddings resultantes.

Al derivar de BAAI/bge-base-en-v1.5, hereda la arquitectura BERT-base (encoder bidireccional de 12 capas, 768 dimensiones ocultas y unos 109 millones de parametros) y una ventana maxima de 512 tokens. Es un modelo exclusivamente en ingles y sin capacidades generativas: no produce texto, solo representaciones vectoriales para busqueda semantica, recuperacion y tareas de similitud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional tipo BERT-base (12 capas, 768 de dimension oculta, 12 cabezas) |
| Parametros totales | 109 M (heredados del modelo base BAAI/bge-base-en-v1.5) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | QInt8 dinamica con per_channel_reduce_range (ONNX); no se declaran otros formatos en este repositorio |
| Idiomas soportados | no disponibles en los metadatos del Hub; el modelo base esta entrenado para ingles |
| Licencia | MIT |
| Formato de pesos | ONNX cuantizado a 8 bits (el modelo base original se distribuye en safetensors/PyTorch) |
| Dimension del embedding | 768 |
| Pooling | CLS pooling + normalizacion L2 (indicado en la model card) |
| Pipeline | feature-extraction |
| Libreria declarada | transformers.js |
| Autor | rafiazarin |
| Modelo base | BAAI/bge-base-en-v1.5 |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes en el Hub | 0 / 0 |
| Fecha de creacion en el Hub | 2026-09-28 (segun metadatos de HuggingFace) |

Nota: los valores de parametros, dimension de embedding y contexto corresponden a la documentacion publica de BAAI/bge-base-en-v1.5, no estan declarados en el repositorio ONNX.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un encoder transformer bidireccional estilo BERT-base, con 12 capas, 768 dimensiones ocultas, 12 cabezas de atencion y 512 posiciones maximas. Sobre esa base, BAAI entreno bge-base-en-v1.5 como modelo de representacion de frases dentro de la familia BGE (BAAI General Embedding), con preentrenamiento no supervisado y un ajuste posterior sobre pares de texto relacionados; la model card de este repositorio no aporta detalles adicionales sobre el dataset, el numero de tokens ni el uso de RLHF o DPO. Lo que si declara el autor es el procedimiento de conversion: exportacion a ONNX y cuantizacion dinamica QInt8 con per_channel_reduce_range, replicando los ajustes empleados en rafiazarin/bge-base-pubmed-finetuned para que ambos puedan compararse bajo las mismas condiciones.

La innovacion tecnica de este repositorio no esta en el entrenamiento sino en el empaquetado. La cuantizacion dinamica a 8 bits reduce el peso del modelo en aproximadamente un orden de magnitud respecto a los pesos en FP32, lo que permite ejecutarlo en el navegador con transformers.js (ONNX Runtime Web) sin GPU dedicada. La contrapartida es que no existe ninguna evaluacion publicada de la degradacion de calidad introducida por esta conversion concreta.

## Capacidades

- Generacion de embeddings de texto de 768 dimensiones para frases, parrafos cortos y documentos de hasta 512 tokens.
- Busqueda semantica y recuperacion densa (dense retrieval) en ingles, con similitud coseno sobre embeddings normalizados.
- Calculo de similitud entre pares de textos: deteccion de duplicados, parafrasis y near-duplicates.
- Agrupamiento y clasificacion no supervisada mediante tecnicas de prototipos o k-NN sobre los vectores.
- Inferencia en el navegador o en Node.js a traves de transformers.js y ONNX Runtime Web (WASM y, opcionalmente, WebGPU).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo instructivo ni generativo.
- No dispone de capacidades de vision, audio, modo thinking ni salida de texto.
- Capacidad multilingue: no disponible; el modelo base es mono-idioma (ingles).

## Casos de uso

- Busqueda semantica en el navegador: el modelo se ejecuta en el propio cliente mediante transformers.js, de modo que la consulta y el indice de documentos nunca salen del dispositivo. Es adecuado para herramientas de documentacion interna o bases de conocimiento privadas donde no se quiere depender de un backend.
- RAG ligero en aplicaciones web: indexar un corpus pequeno o mediano en el navegador y recuperar los pasajes mas relevantes antes de enviarlos a un modelo generativo alojado en servidor. Al ser una exportacion de 0,1 GB en int8, el coste de descarga inicial es asumible.
- Demo comparativa de modelos: el autor ha preparado esta exportacion con los mismos ajustes que rafiazarin/bge-base-pubmed-finetuned, por lo que sirve para medir en igualdad de condiciones si un dominio especializado (biomedicina) aporta ventaja frente al modelo generalista.
- Deduplicacion de contenido: calcular embeddings de titulares, tickets o descripciones de producto y agrupar por umbral de similitud coseno para eliminar duplicados en pipelines de datos.
- Enrutado semantico de consultas: usar los embeddings como clasificador ligero para dirigir cada peticion a la herramienta, el indice o el prompt adecuados dentro de un sistema mayor, sin necesidad de un modelo adicional.
- Sistemas de recomendacion basados en contenido: representar articulos, noticias o fichas de producto y recomendar elementos cercanos en el espacio vectorial respecto al historial del usuario.
- Extensiones y complementos de escritorio: al funcionar sobre ONNX Runtime en CPU, puede integrarse en aplicaciones Electron o extensiones de navegador que requieran funcionar sin conexion.
- Clasificacion zero-shot por similitud: comparar el embedding de un texto con los de una lista de etiquetas descriptivas para obtener una clasificacion rapida cuando no hay datos etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a describir el procedimiento de exportacion y cuantizacion, y a recomendar el uso de CLS pooling con normalizacion de embeddings; no incluye metricas de MTEB, recuperacion, similitud ni comparaciones cuantitativas con el modelo base en FP32.

## Requisitos de hardware

- VRAM en GPU: no aplica para el caso de uso previsto; el modelo esta pensado para ejecucion en CPU o WebGPU dentro del navegador.
- Peso en disco y en memoria: el repositorio completo ocupa 0,1 GB, coherente con unos 110 MB de pesos int8 mas los ficheros de configuracion y tokenizador. Los pesos equivalentes en FP32 rondarian los 440 MB.
- Memoria RAM estimada en inferencia: unos pocos cientos de megabytes, incluyendo el runtime de ONNX y la sesion del modelo; el consumo exacto no esta publicado.
- GPU recomendadas: no se especifican. Cualquier GPU de consumo compatible con WebGPU (por ejemplo, una RTX 3060 o superior) puede acelerar la ejecucion en navegador, pero no es un requisito.
- Compatibilidad con GPU de consumo: si, el modelo cabe holgadamente en cualquier GPU consumer e incluso prescinde de ella.
- Opciones de despliegue: transformers.js (navegador y Node.js), ONNX Runtime Web con backend WASM o WebGPU, y ONNX Runtime nativo en Python o C++ cargando directamente los ficheros ONNX.
- Opciones no recomendadas para este modelo: vLLM y TGI, orientados a modelos generativos; llama.cpp u Ollama, fuera del flujo de exportacion declarado por el autor y sin garantia de compatibilidad con este grafo ONNX concreto.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de milisegundos por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension del embedding | Licencia | Formato y despliegue | Idiomas |
|---|---|---|---|---|---|---|
| rafiazarin/bge-base-en-v1.5-onnx (este modelo) | 109 M | 512 tokens | 768 | MIT | ONNX int8, transformers.js / ONNX Runtime | No declarados; base en ingles |
| BAAI/bge-base-en-v1.5 (modelo base) | 109 M | 512 tokens | 768 | MIT | safetensors/PyTorch, requiere conversion para navegador | Ingles |
| intfloat/e5-base-v2 | 109 M | 512 tokens | 768 | MIT | safetensors/PyTorch, requiere conversion | Ingles |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 tokens | 384 | Apache-2.0 | safetensors/PyTorch, con variantes ONNX de terceros | Ingles |

Los datos de las tres alternativas proceden de su documentacion publica y no de este repositorio; conviene verificarlos antes de tomar decisiones de produccion. La ventaja diferencial de este modelo frente al base es exclusivamente el formato: mismo comportamiento esperado, con un tamano aproximadamente cuatro veces menor y listo para ejecutarse en el navegador. Frente a all-MiniLM-L6-v2, ofrece 256 tokens mas de contexto y el doble de dimension de embedding a cambio de un tamano cinco veces mayor.

## Limitaciones y advertencias

- Repositorio sin traccion en el Hub: 0 descargas y 0 likes en el momento de redactar esta ficha, sin validacion independiente por parte de la comunidad.
- La fecha de creacion registrada en los metadatos (28 de septiembre de 2026) es posterior a la fecha de consulta habitual, lo que sugiere un error de marca temporal o un repositorio reciente y no revisado; conviene contrastar la integridad de los ficheros antes de usarlos.
- No existe evaluacion publicada del impacto de la cuantizacion QInt8 dinamica sobre la calidad de los embeddings. Es esperable una perdida pequena pero no medida respecto a FP32, especialmente en tareas de recuperacion fina.
- Modelo mono-idioma en la practica: el base esta entrenado para ingles, por lo que el rendimiento en castellano sera sensiblemente inferior. No hay datos declarados de cobertura multilingue.
- Contexto limitado a 512 tokens: los documentos largos deben trocearse antes de generar embeddings, con el riesgo de perder contexto entre fragmentos.
- Al ser un modelo de representacion y no generativo, no alucina texto, pero si puede producir similitudes espurias entre textos sin relacion semantica real; no debe utilizarse como clasificador calibrado sin una capa supervisada adicional.
- Licencia MIT, que permite uso comercial y modificacion, siempre que se conserve el aviso de copyright. Al derivar de BAAI/bge-base-en-v1.5, tambien bajo MIT, no se anaden restricciones conocidas.
- El requisito de normalizar los embeddings y de usar pooling CLS es obligatorio: omitirlo degrada la similitud coseno y puede invalidar comparaciones con otros modelos.
- No disponible: informacion sobre sesgos del dataset de entrenamiento, composicion del corpus, idiomas adicionales y evaluaciones de robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rafiazarin/bge-base-en-v1.5-onnx
- Modelo base: https://huggingface.co/BAAI/bge-base-en-v1.5
- Repositorio hermano del mismo autor con ajustes identicos: https://huggingface.co/rafiazarin/bge-base-pubmed-finetuned
- Repositorio oficial de la familia BGE (FlagEmbedding): https://github.com/FlagOpen/FlagEmbedding
- Paper de la familia BGE (C-Pack): https://arxiv.org/abs/2309.07597
- Benchmark MTEB: https://huggingface.co/spaces/mteb/leaderboard
- Transformers.js: https://github.com/huggingface/transformers.js
- Documentacion de ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
