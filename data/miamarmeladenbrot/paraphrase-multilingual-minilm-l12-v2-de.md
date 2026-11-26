# MiaMarmeladenbrot/paraphrase-multilingual-MiniLM-L12-v2-de

## Resumen

`paraphrase-multilingual-MiniLM-L12-v2-de` es una copia podada de vocabulario de `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, el conocido modelo de embeddings multilingue de Sentence Transformers. La desarrolla la usuaria de Hugging Face MiaMarmeladenbrot y su objetivo es concreto: reducir el peso de carga del modelo en el navegador para texto en aleman (y algo de ingles), manteniendo intactas las 12 capas del transformer original y todos los pesos que se conservan.

El modelo original dedica el 82 % de sus parametros a la matriz de embeddings: 250.002 tokens para mas de 50 idiomas. Esta version conserva 28.801 tokens (los del corpus de libros y episodios de 2seiten, los 50.000 palabras alemanas y 20.000 inglesas mas frecuentes, y todos los caracteres latinos, digitos y signos de puntuacion), elimina el resto de filas de la matriz de embeddings y renumera el tokenizador en consecuencia. El resultado es un ONNX int8 de 33,4 MB frente a los 112,8 MB del original, y un `tokenizer.json` de 1,3 MB frente a 16,3 MB.

Es relevante para quienes despliegan busqueda semantica o similitud de frases en el cliente (navegador, extensiones, apps web) con `transformers.js`, donde el tamano de descarga y el tiempo de arranque son criticos. La contrapartida es clara: solo debe usarse con texto aleman o ingles, y las frases con palabras fuera del vocabulario conservado pueden producir vectores ligeramente distintos al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (MiniLM-L12), encoder de 12 capas para sentence embeddings |
| Parametros totales | no disponible (el original ronda los 118 M; esta version reduce la matriz de embeddings a 28.801 filas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base MiniLM suele usar 128 tokens, sin confirmacion aqui) |
| Tipos de cuantizacion | ONNX int8 (`onnx/model_quantized.onnx`, dtype `q8` en transformers.js) |
| Idiomas soportados | aleman (principal) e ingles (parcial) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (int8), tokenizador JSON |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer tipo BERT con 12 capas (MiniLM-L12), entrenado originalmente por Sentence Transformers para producir embeddings de frase mediante pooling con normalizacion. Esta version no reentrena ni modifica ningun peso conservado: las 12 capas del transformer estan intactas y las filas de la matriz de embeddings que se mantienen son identicas bit a bit a las del original.

La unica intervencion es la poda de vocabulario. Se conservan los tokens del corpus de 2seiten (libros y episodios), los de las 50.000 palabras alemanas y 20.000 inglesas mas frecuentes, y todos los caracteres latinos, digitos y signos de puntuacion; se eliminan las demas filas de la matriz de embeddings y se renumera el tokenizador para que coincida. No se documenta en la informacion disponible ningun proceso adicional de entrenamiento, RLHF, DPO ni ajuste fino.

## Capacidades

- Extraccion de embeddings de frase (`feature-extraction`) para similitud semantica y busqueda vectorial.
- Generacion de vectores con pooling de media y normalizacion, segun el ejemplo de uso de la model card.
- Texto en aleman como idioma principal; soporte parcial de ingles.
- Ejecucion en navegador mediante `transformers.js` y ONNX Runtime Web.
- Salida identica bit a bit al original para cualquier texto cuyos tokens esten en el vocabulario conservado.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es exclusivamente un encoder de embeddings.

## Casos de uso

- Busqueda semantica en el navegador: indexar y consultar documentos alemanes en el cliente sin llamadas al servidor, gracias a los 33,4 MB del ONNX int8 y al tokenizador de 1,3 MB.
- Deteccion de duplicados y near-duplicates en corpus alemanes: calcular similitud coseno entre frases para agrupar parafrasis en pipelines de limpieza de datos.
- Clasificacion de texto por similitud a prototipos: comparar embeddings de consultas o tickets con vectores de referencia de categorias predefinidas.
- Recomendacion de contenido: generar embeddings de titulos y resumenes de articulos o episodios en aleman para un motor de recomendacion ligero.
- Extensiones de navegador y apps de escritorio: empaquetar el modelo dentro de la propia extension (repo de 0,1 GB) para funciones de busqueda o agrupacion sin dependencia de red.
- Filtrado previo en pipelines RAG: usar el modelo como primer recuperador de bajo coste en textos alemanes antes de un reranker mas pesado en servidor.
- Prototipado rapido de similitud de frases: validar una idea de producto con un modelo de 33 MB antes de invertir en infraestructura de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta una garantia de equivalencia: para texto cuyos tokens se conservan, los vectores de salida son identicos bit a bit a los del modelo original. No se ofrecen cifras de MTEB, precision de recuperacion ni latencia.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso principal; el modelo esta pensado para ejecucion en CPU en el navegador. El ONNX int8 ocupa 33,4 MB en disco y una huella de memoria del orden de decenas de MB en runtime.
- GPU: no requiere GPU dedicada; puede ejecutarse en cualquier CPU moderna. En servidor puede acelerarse con GPUs convencionales (RTX 4090, A100, H100) mediante ONNX Runtime, aunque el modelo es demasiado pequeno para aprovecharlas.
- GPU de consumo: cabe sobradamente en cualquier GPU de consumo e incluso en moviles y navegadores.
- Despliegue: `transformers.js` (via `@huggingface/transformers` con `dtype: 'q8'`), ONNX Runtime Web y ONNX Runtime en servidor. No se documenta soporte de vLLM, TGI o llama.cpp, orientados a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (podado) | no disponible (embeddings reducidos a 28.801 filas) | no disponible | de, en | Apache 2.0 | ONNX int8 |
| `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` | ~118 M | no disponible | mas de 50 | Apache 2.0 | safetensors, PyTorch |
| `Xenova/paraphrase-multilingual-MiniLM-L12-v2` | ~118 M | no disponible | mas de 50 | Apache 2.0 | ONNX int8 (112,8 MB) |

Frente al original de Sentence Transformers, esta version sacrifica cobertura linguistica (de mas de 50 idiomas a aleman e ingles) a cambio de un tercio del tamano en ONNX y una doceava parte del tokenizador. Frente a la exportacion de Xenova, mantiene la misma calidad para texto aleman con tokens conservados, pero descarta el resto de idiomas. Para aplicaciones multilingues reales conviene el original; para aleman en el navegador, esta version es la opcion mas ligera de las tres.

## Limitaciones y advertencias

- Solo debe usarse con texto aleman o ingles; con otros idiomas el vocabulario conservado es insuficiente y los embeddings pierden calidad.
- Las palabras fuera del vocabulario conservado se dividen en piezas mas pequenas, de modo que no fallan, pero el vector resultante puede diferir del original.
- No es un modelo generativo: no produce texto, no hace razonamiento, tool calling ni agentes.
- Posible sesgo heredado del corpus original de Sentence Transformers y del corpus de 2seiten usado para seleccionar el vocabulario; no se documenta analisis de sesgos.
- El riesgo de alucinacion no aplica a la tarea de embeddings, pero si la similitud coseno puede dar falsos positivos en textos cortos o ambiguos.
- La licencia Apache 2.0 permite uso comercial, igual que el modelo original; conviene conservar el aviso de licencia.
- El modelo se creo en noviembre de 2026 y tiene 236 descargas y 0 likes: validacion comunitaria practicamente nula, por lo que conviene evaluar su calidad en el dominio propio antes de produccion.
- No hay garantia de mantenimiento ni de actualizaciones por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MiaMarmeladenbrot/paraphrase-multilingual-MiniLM-L12-v2-de
- Modelo base (Sentence Transformers): https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Exportacion ONNX de referencia (Xenova): https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2
- Libreria transformers.js: https://huggingface.co/docs/transformers.js
