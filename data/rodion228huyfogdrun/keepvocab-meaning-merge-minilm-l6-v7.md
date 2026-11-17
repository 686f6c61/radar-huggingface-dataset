# Rodion228huyfogdrun/KeepVocab-meaning-merge-minilm-l6-v7

## Resumen

KeepVocab-meaning-merge-minilm-l6-v7 es un modelo de extraccion de caracteristicas (feature-extraction) publicado por el usuario Rodion228huyfogdrun como parte del proyecto KeepVocab. Se trata de un bi-encoder MiniLM-L6 afinado junto con un scorer logistico de cinco caracteristicas, disenado especificamente para comparar significados de definiciones de diccionario en ingles y decidir si dos definiciones deben fusionarse. No es un modelo generativo: su funcion es producir embeddings de frases y combinarlos con un clasificador logistico para emitir una decision de "fusion" o "no fusion".

El modelo parte de sentence-transformers/paraphrase-MiniLM-L6-v2, un transformer BERT de 6 capas y aproximadamente 22,7 millones de parametros, y se exporta en formato ONNX para su uso con transformers.js. La model card describe una referencia concreta (minilm-l6-v7-prefix-idf-bs16), entrenada con pares de definiciones extraidos exclusivamente de herramientas de diccionario, con pesos en FP16 y entradas/salidas en FP32.

Su relevancia es acotada y experimental: resuelve un problema muy especifico de deduplicacion semantica de definiciones en el contexto del proyecto KeepVocab. Los resultados declarados son exploratorios (PR-AUC de validacion 0,7197 y de test 0,7192) y las etiquetas fueron revisadas por agentes, no por humanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT bi-encoder (MiniLM-L6) + scorer logistico de 5 caracteristicas |
| Parametros totales | Aproximadamente 22,7 millones (heredados de paraphrase-MiniLM-L6-v2) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 96 tokens por texto (limite de codificacion indicado en la model card) |
| Tipos de cuantizacion | Pesos exportados en FP16; entradas/salidas en FP32 (no se documentan otras cuantizaciones) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (exportado para transformers.js) |

## Arquitectura y entrenamiento

La base es un transformer encoder tipo BERT con 6 capas (MiniLM-L6), del que se derivan los embeddings de frase mediante mean pooling con mascara de atencion y normalizacion L2. Sobre las representaciones se calculan cinco caracteristicas: coseno de los embeddings agrupados, mejor coincidencia media de tokens ponderada por IDF simetrica, mejor coincidencia minima simetrica, mejor coincidencia en el percentil 25 simetrica (interpolacion lineal) y ratio de recuento de tokens. Un scorer logistico con pesos y sesgo suministrados (scorer.json) convierte esas caracteristicas en la decision de fusion, sin estandarizacion de caracteristicas.

El entrenamiento se realizo con pares de definiciones procedentes exclusivamente de herramientas de diccionario (v7), con recibos de extraccion y familias de lemas disjuntas para evitar fuga de datos. La referencia es la semilla 42, epoca 4 restaurada, con batch size 16 y esquema prefix-idf. Los datos de entrenamiento y las fuentes no se incluyen en el repositorio. El umbral automatico de fusion (0,9874299168586731) se selecciono sobre validacion y produjo 0 fusiones falsas en validacion y 4 en test. No se realizo ajuste ni recalibracion durante la exportacion.

## Capacidades

- Generacion de embeddings de frases para textos cortos en ingles (hasta 96 tokens).
- Calculo de similitud semantica entre definiciones de diccionario.
- Decision binaria de fusion de significados mediante scorer logistico de cinco caracteristicas.
- Preprocesado especifico `meaningEmbeddingText` del proyecto KeepVocab.
- Coincidencia de tokens con exclusion de tokens especiales y del prefijo hasta el primer dos puntos.
- Ejecucion en navegador o Node.js mediante transformers.js y ONNX.
- No soporta generacion de texto, tool calling, agentes, vision ni audio.

## Casos de uso

- Deduplicacion de entradas en diccionarios: agrupar definiciones que expresan el mismo significado usando el umbral y el clustering de enlace completo (complete linkage) indicado por el autor.
- Consolidacion de ontologias y glosarios: comparar terminos definidos en distintas fuentes y proponer fusiones para revision manual.
- Control de calidad de bases de datos lexicas: detectar definiciones casi duplicadas antes de publicar un dataset.
- Investigacion en similitud semantica: usar el pipeline de cinco caracteristicas como referencia reproducible para experimentos de pares de definiciones.
- Normalizacion de vocabulario en buscadores internos: unificar sinonimos definidos formalmente en ingles.
- Sistemas de sugerencia de sinonimos en herramientas de escritura: usar la similitud de significados para proponer equivalencias.
- Filtrado previo en pipelines de anotacion: reducir el volumen de pares que requieren revision humana antes de la validacion final.

## Benchmarks y rendimiento

| Metrica | Validacion | Test |
|---|---|---|
| PR-AUC | 0,719699 | 0,719228 |
| Fusiones falsas con umbral 0,9874299168586731 | 0 | 4 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP16; el modelo completo ronda los 45 MB de pesos.
- GPU recomendadas: cualquier GPU moderna; no requiere A100 ni H100.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 1 GB de VRAM (GTX 1050, RTX 3050, RTX 4090, etc.), e incluso en CPU.
- Opciones de despliegue: transformers.js (via ONNX), ONNX Runtime; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Almacenamiento: el repositorio ocupa 0,0 GB segun Hugging Face.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Proposito |
|---|---|---|---|---|---|
| KeepVocab-meaning-merge-minilm-l6-v7 | ~22,7 M | 96 tokens | Apache 2.0 | ONNX | Fusion de definiciones + scorer |
| sentence-transformers/paraphrase-MiniLM-L6-v2 | ~22,7 M | 128 tokens | Apache 2.0 | safetensors, PyTorch | Embeddings de frases genericos |
| all-MiniLM-L6-v2 | ~22,7 M | 256 tokens | Apache 2.0 | safetensors, PyTorch, ONNX | Embeddings de frases genericos |
| BAAI/bge-small-en-v1.5 | ~33 M | 512 tokens | MIT | safetensors, ONNX | Embeddings de recuperacion |

La comparativa se basa en caracteristicas generales de los modelos citados; no se dispone de resultados de benchmarks comparativos en la informacion proporcionada para este modelo.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento y evaluacion fueron revisadas por agentes, no verificadas por humanos; los resultados son exploratorios.
- El conjunto de test se ha inspeccionado repetidamente, lo que puede inflar las metricas reportadas.
- El umbral de fusion no es una garantia: produjo 4 fusiones falsas en test.
- Solo admite ingles y textos de hasta 96 tokens.
- El uso correcto exige combinar tokenizer, encoder y scorer.json con el preprocesado exacto descrito; un uso incorrecto invalida los resultados.
- El clustering debe usar enlace completo para evitar fusiones transitivas incorrectas.
- Las sentencias de usuario tienen prioridad sobre las decisiones automaticas del modelo.
- Los datos de entrenamiento y las fuentes no se incluyen en el repositorio, lo que limita la reproducibilidad.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa conocida.

## Enlaces

- Hugging Face: https://huggingface.co/Rodion228huyfogdrun/KeepVocab-meaning-merge-minilm-l6-v7
- Repositorio del proyecto: https://github.com/RODIONOLIINYK/KeepVocab
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-MiniLM-L6-v2
