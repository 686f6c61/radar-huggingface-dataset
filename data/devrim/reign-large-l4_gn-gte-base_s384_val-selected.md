# devrim/reign-large-l4_gn-gte-base_s384_val-selected

## Resumen

REIGN (Refurbished Embeddings with Integrated Guidance Networks) es una arquitectura de codificacion de documentos largos que separa el procesamiento en dos etapas: una red guia congelada (en este caso, GTE-base de 110M parametros) genera embeddings por fragmentos de 512 tokens, y un encoder cross-chunk ligero de 4 capas (52,2M parametros) agrega la secuencia de embeddings de fragmentos para producir una representacion unica del documento. Este checkpoint concreto, `reign-large-l4_gn-gte-base_s384_val-selected`, fue entrenado por Devrim Cavusoglu y Emre Akbas sobre el dataset sintetico GoodWiki-Long-Synthetic-IR y seleccionado por mejor nDCG@10 en validacion.

El modelo resuelve el problema de escalar la longitud de contexto en sistemas de recuperacion de informacion sin aumentar el coste computacional de forma cuadratica: en lugar de procesar todos los tokens del documento, solo procesa los embeddings de fragmentos precalculados. Esto permite manejar documentos de miles de tokens con un coste de inferencia reducido. Su relevancia actual radica en que los sistemas RAG y de busqueda semantica necesitan representaciones de documentos extensos (articulos, informes, expedientes) que los bi-encoders convencionales no pueden procesar de forma eficiente.

La arquitectura es un transformer de 4 capas con dimension 1024, 16 cabezas de atencion y FFN de 4096, que opera sobre la secuencia de embeddings de fragmentos. El contexto efectivo esta limitado por el tamaño de fragmento de la red guia (512 tokens) y el stride de entrenamiento (384), aunque el numero de fragmentos que puede agregar no esta explicitamente limitado en la documentacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de 4 capas (cross-chunk), d=1024, 16 heads, FFN 4096 |
| Parametros totales | 52.223.488 (52,49M segun la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Fragmentos de 512 tokens (chunk size K), stride 384; numero de fragmentos no limitado explicitamente |
| Tipos de cuantizacion | No disponible (pesos en float32) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, float32) |

## Arquitectura y entrenamiento

REIGN introduce un esquema de dos componentes: una red guia (guidance network) congelada, en este caso `thenlper/gte-base` (110M parametros), que convierte cada fragmento de 512 tokens en un embedding; y un encoder cross-chunk (el checkpoint liberado) que recibe la secuencia de embeddings de fragmentos y produce un unico vector L2-normalizado para el documento completo. El encoder es un transformer de 4 capas con atencion de 16 cabezas y dimension 1024, disenado como funcion invariante a permutaciones (sin señal de posicion), con pooling por media sobre la secuencia de fragmentos.

El entrenamiento se realizo sobre el dataset sintetico `devrim/goodwiki_long_synthetic_ir`, que contiene pares de documentos largos con anotaciones de relevancia graduada. Se utilizo una funcion de perdida de embedding coseno de tres vias con objetivos s ∈ {1, 0, −1} (positivo, parcial, negativo) y peso parcial λ = 0,5. Cada paso de entrenamiento construia 18 anclas con 1 positivo, 2 parciales y 17 negativos intra-lote, totalizando 360 pares por paso. El optimizador fue AdamW con learning rate 1e-5, weight decay 1e-4 y programacion de coseno, durante 50 epocas con validacion cada 4. Se empleo precision mixta de 16 bits y semilla 42, en una unica GPU de 24 GB. Los embeddings de la red guia se precalcularon y cachearon en disco para acelerar el entrenamiento.

Una innovacion destacable es que el encoder cross-chunk no procesa tokens, sino embeddings de fragmentos ya generados, lo que reduce drasticamente el coste computacional en documentos largos. Ademas, al ser invariante a permutaciones, no depende de la posicion de los fragmentos, lo que simplifica el diseno y evita sesgos posicionales.

## Capacidades

- Recuperacion de documentos largos (document-to-document): genera embeddings de documentos completos a partir de fragmentos, permitiendo busqueda por similitud coseno.
- Agregacion de multiples fragmentos: procesa secuencias de embeddings de fragmentos de longitud variable, sin limite explicito en el numero de fragmentos.
- Embeddings L2-normalizados: la salida esta normalizada, por lo que la similitud coseno equivale al producto escalar.
- Inferencia eficiente sobre documentos extensos: al operar sobre embeddings de fragmentos precalculados, el coste de inferencia es proporcional al numero de fragmentos, no al numero de tokens.
- Compatibilidad con la red guia GTE-base: requiere cargar `thenlper/gte-base` como componente congelado, lo que permite reutilizar los embeddings de fragmentos generados por dicha red.
- No apto para inputs cortos: documentos con menos de 512 tokens colapsan a un unico fragmento, dejando al encoder cross-chunk sin trabajo que realizar; en ese regimen se recomienda usar solo la red guia.

## Casos de uso

- Busqueda semantica en corpus de articulos cientificos: el modelo puede indexar papers completos (tipicamente de 3000-8000 tokens) generando un embedding por articulo, y responder a consultas con similitud coseno. Su capacidad de agregar multiples fragmentos permite capturar informacion distribuida a lo largo del documento, algo que los bi-encoders convencionales pierden al truncar.

- Recuperacion de informacion en bases de conocimiento empresarial: para manuales, informes anuales o expedientes legales de decenas de paginas, REIGN produce representaciones estables sin necesidad de dividir manualmente el texto en pasajes. Un sistema RAG puede usar estos embeddings para preseleccionar documentos relevantes antes de pasarlos a un LLM generativo.

- Deduplicacion de documentos en grandes repositorios: al generar embeddings de documentos completos, se pueden detectar duplicados o versiones casi identicas mediante umbrales de similitud coseno, incluso cuando las diferencias estan dispersas en distintas secciones.

- Clustering tematico de documentos largos: el embedding unico por documento permite aplicar algoritmos de agrupamiento (k-means, HDBSCAN) sobre colecciones de informes o patentes, agrupando por contenido semantico global en lugar de por pasajes aislados.

- Sistemas de recomendacion de contenidos: para plataformas con articulos extensos (enciclopedias, blogs tecnicos), el modelo puede calcular similitud entre documentos completos y sugerir lecturas relacionadas basadas en la estructura global del contenido.

- Clasificacion de documentos por similitud a un conjunto de referencia: dado un conjunto de documentos etiquetados, se pueden generar embeddings y entrenar un clasificador ligero (regresion logistica, SVM) sobre ellos, aprovechando que el embedding ya condensa la informacion de todo el documento.

## Benchmarks y rendimiento

La model card reporta un unico resultado para este checkpoint exacto, sin comparaciones con otros modelos:

| Benchmark | Metrica | Stride de evaluacion | Valor |
|---|---|---|---|
| GoodWiki-Long test | nDCG@10 | s384 | 64,65 |

No se han publicado resultados de benchmarks en la informacion disponible que comparen este modelo con alternativas como GTE, BGE o E5. El dato de nDCG@10 proviene de la Tabla 7 del paper, y corresponde al checkpoint seleccionado por mejor validacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el encoder cross-chunk tiene 52,2M parametros en float32 (~209 MB). La red guia GTE-base anade 110M parametros (~440 MB). En total, menos de 1 GB de VRAM para inferencia en lotes pequenos, sin cuantizacion.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) es suficiente para inferencia. El entrenamiento se realizo en una unica GPU de 24 GB (RTX 3090 o similar).
- Compatibilidad con consumer GPU: si, ampliamente. El modelo es ligero y no requiere hardware especializado.
- Opciones de despliegue: el repositorio oficial proporciona la clase `ReignBaselineEncoder` para Python. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo generativo sino un encoder. Se puede exportar a ONNX o TensorRT si se desea optimizar, aunque no esta documentado.
- Latencia y throughput: no disponible en la informacion proporcionada. Dependera del numero de fragmentos por documento y del hardware.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. Este modelo pertenece a la categoria de bi-encoders para retrieval, donde alternativas comunes son:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| REIGN large-l4 (este) | 52,2M + 110M (guia) | Multi-fragmento (512 tokens por fragmento) | Apache 2.0 | Especializado en documentos largos |
| GTE-base (thenlper) | 110M | 512 tokens | Apache 2.0 | Bi-encoder clasico, base de este modelo |
| GTE-large (thenlper) | 435M | 512 tokens | Apache 2.0 | Mayor capacidad, mismo limite de contexto |

La ventaja de REIGN frente a GTE-base o GTE-large es su capacidad de procesar documentos completos sin truncamiento, a costa de requerir la red guia congelada. No se dispone de comparaciones cuantitativas en los datos disponibles.

## Limitaciones y advertencias

- Solo soporta ingles: el modelo fue entrenado exclusivamente con datos en ingles (GoodWiki, basado en Wikipedia). Su uso en otros idiomas producira embeddings de baja calidad.
- No apto para inputs cortos: documentos con menos de 512 tokens no aprovechan el encoder cross-chunk; en ese regimen se recomienda usar la red guia directamente.
- Dependencia de la red guia: el checkpoint solo contiene el encoder cross-chunk. Es obligatorio cargar `thenlper/gte-base` por separado, lo que anade complejidad de despliegue y requiere mantener ambos modelos.
- Entrenado con datos sinteticos: el dataset GoodWiki-Long-Synthetic-IR es generado artificialmente a partir de Wikipedia. El rendimiento en dominios muy diferentes (legales, medicos, financieros) puede degradarse.
- Sin garantias de escalabilidad: aunque el diseno permite multiples fragmentos, no se documenta el rendimiento con mas de unos pocos cientos de fragmentos. La atencion entre fragmentos es cuadratica en el numero de fragmentos, por lo que documentos extremadamente largos podrian saturar la memoria.
- Resultados limitados: solo se reporta una metrica (nDCG@10 en GoodWiki-Long test). No hay evaluaciones en benchmarks estandar como BEIR o MTEB.
- Reproducibilidad: el entrenamiento con precision mixta no es bit-reproducible, por lo que un reentrenamiento con la misma semilla no producira pesos identicos.
- Licencia del dataset: aunque el modelo es Apache 2.0, el dataset de entrenamiento se distribuye bajo CC BY-SA 4.0, lo que puede tener implicaciones para usos comerciales que redistribuyan datos derivados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devrim/reign-large-l4_gn-gte-base_s384_val-selected
- Codigo fuente: https://github.com/devrimcavusoglu/reign
- Pagina del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset de entrenamiento: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of ACL: EMNLP 2026 (en prensa)
