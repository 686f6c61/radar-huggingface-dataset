# devrim/reign-tiny-l1_gn-bge-large_val-selected

## Resumen

REIGN `tiny-l1` es un cross-chunk encoder desarrollado por Devrim Cavusoglu y Emre Akbas, presentado en el articulo *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling* (Findings of EMNLP 2026, en prensa). El modelo aborda el problema de la recuperacion de documentos largos: en lugar de procesar tokens directamente, lee una secuencia de embeddings de fragmentos (chunks) previamente generados por una red guia congelada, en este caso `BAAI/bge-large-en-v1.5`. Esto permite escalar el contexto sin aumentar el coste computacional del encoder principal.

El checkpoint liberado contiene solo los pesos del encoder REIGN (0,68 millones de parametros), mientras que la red guia (335 millones) se carga por separado y permanece congelada. Esta configuracion concreta corresponde a la variante `tiny-l1` (1 capa, dimension 192, 3 cabezas) entrenada sobre el dataset sintetico `devrim/goodwiki_long_synthetic_ir`. El modelo esta pensado para retrieval documento-a-documento con entradas multi-chunk, no para consultas cortas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-chunk encoder (REIGN) sobre red guia congelada BGE-large-en-v1.5 |
| Parametros totales | 680.768 (encoder REIGN) + 335M (red guia, congelada) |
| Parametros activos | 680.768 (solo encoder; la red guia no se entrena) |
| Longitud de contexto | Ventana de chunk de 512 tokens (red guia); el encoder procesa secuencias de embeddings de chunks, sin limite fijo documentado |
| Tipos de cuantizacion | No disponible (pesos en float32) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo sigue el esquema REIGN: una red guia (BGE-large-en-v1.5, un encoder BERT de 335M) genera embeddings por fragmentos de 512 tokens con un stride de 384. Estos embeddings se concatenan en una secuencia y se pasan al encoder REIGN `tiny-l1`, que es un transformer de 1 capa con dimension 192, 3 cabezas y FFN de 768. El encoder es una funcion simetrica de permutacion (no usa senales de posicion) y agrega mediante mean pooling sobre la secuencia de chunks. La salida es un vector L2-normalizado.

El entrenamiento utilizo una perdida de coseno de tres vias con objetivos graduados (positivo, parcial, negativo) con peso parcial λ = 0.5. Se empleo AdamW (lr 1e-5, weight decay 1e-4), 50 epocas con validacion cada 4, seleccion por mejor nDCG@10 en validacion, precision mixta de 16 bits y un lote de 360 pares por paso. Las embeddings de la red guia se precalcularon y cachearon. El entrenamiento se realizo en una GPU de consumo de 24 GB.

## Capacidades

- Generacion de embeddings de documentos largos para retrieval documento-a-documento.
- Agregacion de multiples chunks mediante mean pooling, sin necesidad de atencion sobre tokens.
- Compatible con cualquier red guia que genere embeddings por chunks (aunque este checkpoint esta entrenado con BGE-large-en-v1.5).
- Salida L2-normalizada, lista para similitud coseno.
- No soporta tool calling, agentes, vision ni audio; es un modelo puramente de representacion de texto.
- Multilingue limitado: solo ingles (el dataset de entrenamiento es en ingles).

## Casos de uso

- Recuperacion de pasajes en corpus cientificos: dado un documento largo (por ejemplo, un articulo de investigacion), el modelo genera un embedding unico que permite buscar documentos similares en una base de datos, superando la limitacion de ventana de 512 tokens de la red guia.
- Sistemas de respuesta a preguntas sobre documentos extensos: se pueden indexar manuales, informes o libros completos y recuperar los documentos mas relevantes para una consulta, sin truncar el contenido.
- Deduplicacion de documentos legales o normativos: al comparar embeddings de documentos completos, se pueden identificar versiones similares o duplicados en repositorios grandes.
- Clustering de articulos de Wikipedia o noticias: el modelo permite agrupar documentos por tematica usando representaciones de documento completo, en lugar de resumenes o primeros parrafos.
- Motores de busqueda interna en empresas: indexar documentacion tecnica extensa (wikis corporativas, guias de producto) y ofrecer busqueda semantica por similitud de documentos.
- Pipeline de RAG (Retrieval-Augmented Generation): como etapa de recuperacion previa, se pueden obtener documentos completos relevantes para alimentar a un LLM generativo, reduciendo el ruido frente a fragmentos sueltos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el paper no reporta una fila para este checkpoint exacto; los numeros de otros checkpoints de la configuracion se encuentran en el repositorio del proyecto y en el articulo.

## Requisitos de hardware

- VRAM estimada: el encoder REIGN es minusculo (0,68M parametros, ~2,7 MB en float32), pero la red guia BGE-large-en-v1.5 (335M parametros) requiere aproximadamente 1,3 GB en float32. En total, menos de 2 GB para inferencia en lotes pequenos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3060, etc.). Una GPU de consumo de 24 GB (como RTX 3090 o 4090) es mas que suficiente, incluso para lotes grandes.
- Cabe en GPUs de consumo: si, sin problema.
- Opciones de despliegue: el codigo oficial se instala via `pip install git+https://github.com/devrimcavusoglu/reign.git`. No se mencionan integraciones con vLLM, llama.cpp u Ollama; es un modelo de embeddings, no un LLM generativo.
- Latencia y throughput: no disponibles. Dado el tamano, se espera una latencia muy baja, dominada por la red guia.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de retrieval de documentos largos en la informacion proporcionada. Como referencia, se puede comparar con el propio guidance network:

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| REIGN tiny-l1 + BGE-large-en-v1.5 | 0,68M + 335M | Multi-chunk (sin limite fijo) | Apache-2.0 | Retrieval de documentos largos |
| BAAI/bge-large-en-v1.5 (solo) | 335M | 512 tokens | MIT (segun su model card) | Embeddings de frases/pasajes cortos |

No se han encontrado datos de otros modelos comparables (como GTE, E5, etc.) en la informacion disponible.

## Limitaciones y advertencias

- No debe usarse para inputs de un solo chunk (menos de 512 tokens): en ese regimen, el encoder REIGN no tiene nada que agregar y el rendimiento lo determina la red guia sola.
- El modelo esta entrenado solo en ingles; su uso en otros idiomas no esta validado.
- La red guia esta congelada y debe cargarse por separado; si se usa otra red guia, los resultados pueden degradarse.
- No se han publicado benchmarks para este checkpoint concreto; su rendimiento relativo a otros modelos no esta verificado.
- El dataset de entrenamiento (`goodwiki_long_synthetic_ir`) se distribuye bajo CC BY-SA 4.0, lo que puede implicar restricciones de atribucion si se usa el modelo en productos derivados.
- El entrenamiento con precision mixta no es bit-reproducible; no se garantiza que un reentrenamiento produzca pesos identicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devrim/reign-tiny-l1_gn-bge-large_val-selected
- Codigo: https://github.com/devrimcavusoglu/reign
- Pagina del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling* (Findings of EMNLP 2026, en prensa)
- Red guia: https://huggingface.co/BAAI/bge-large-en-v1.5
