# devrim/reign-base-l3_gn-bge-base_val-selected

## Resumen

REIGN (Refurbished Embeddings with Integrated Guidance Networks) es un bi-encoder de documentos largos desarrollado por Devrim Cavuşoğlu y Emre Akbaş, presentado en Findings of EMNLP 2026. Este checkpoint concreto, `reign-base-l3_gn-bge-base_val-selected`, contiene únicamente el encoder cross-chunk de 3 capas (22,45 millones de parámetros entrenables) que se apoya en una red guía congelada, BAAI/bge-base-en-v1.5 (110 millones de parámetros), para procesar documentos extensos sin necesidad de leer tokens directamente. En lugar de operar sobre secuencias de tokens, el modelo recibe una secuencia de embeddings de chunks previamente generados por la red guía, lo que permite escalar la longitud efectiva del contexto de forma eficiente.

El modelo está diseñado específicamente para recuperación documento-a-documento en corpus de textos largos, donde los embeddings de chunks individuales se agregan mediante un pooling medio. Se entrenó sobre el dataset sintético `devrim/goodwiki_long_synthetic_ir`, derivado de Wikipedia, con una pérdida coseno de tres vías que distingue pares positivos, parciales y negativos. Su relevancia actual radica en abordar el problema del coste computacional de los modelos de embeddings con ventanas de contexto largas, ofreciendo una alternativa ligera que descompone el documento en fragmentos y los agrega con un transformer pequeño.

El checkpoint se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors (float32), y está pensado para ser usado junto con la red guía, que debe cargarse por separado. No es un modelo generativo ni de propósito general: su única función es producir vectores densos L2-normalizados para similitud coseno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer cross-chunk encoder (3 capas, d=768, 12 cabezas, FFN 3072) sobre red guia BGE-base congelada |
| Parametros totales | 22.446.336 (encoder REIGN) + 110M (red guia congelada) = 132M combinados |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (procesa secuencias de embeddings de chunks; cada chunk de 512 tokens, sin limite fijo documentado) |
| Tipos de cuantizacion | No disponible (pesos float32 en safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

REIGN es un bi-encoder de dos etapas. La primera etapa es una red guia (guidance network) congelada, BAAI/bge-base-en-v1.5, que divide el documento en chunks de 512 tokens con un stride de 384 y genera un embedding para cada chunk. La segunda etapa es el encoder REIGN propiamente dicho, un transformer de 3 capas con 12 cabezas de atencion y FFN de 3072 dimensiones, que recibe la secuencia de embeddings de chunks y produce un unico vector de documento mediante pooling medio. El encoder es equivariante a permutaciones, es decir, no utiliza senales de posicion, lo que lo hace invariante al orden de los chunks.

El entrenamiento se realizo sobre el dataset `devrim/goodwiki_long_synthetic_ir`, con una perdida coseno de tres vias que asigna grados de relevancia s ∈ {1, 0, −1} a pares de documentos (positivo, parcial, negativo), con peso parcial λ = 0.5. Se usaron 18 anclas por lote, cada una con 1 positivo, 2 parciales y 17 negativos in-batch, totalizando 360 pares por paso. El optimizador fue AdamW con learning rate 1e-5, weight decay 1e-4 y annealing coseno, durante 50 epocas con validacion cada 4. La seleccion del checkpoint se hizo por mejor nDCG@10 en la particion de validacion. Se empleo precision mixta de 16 bits y una GPU de 24 GB. Las embeddings de la red guia se precalcularon y cachearon para acelerar el entrenamiento.

## Capacidades

- Generacion de embeddings densos L2-normalizados para documentos completos, listos para similitud coseno.
- Procesamiento de documentos de longitud arbitraria mediante chunking con solapamiento (chunk size 512, stride 384).
- Agregacion de embeddings de chunks mediante pooling medio, sin necesidad de atencion sobre tokens individuales.
- Recuperacion documento-a-documento en corpus de textos largos (articulos cientificos, informes, libros).
- Funcion equivariante a permutaciones: el orden de los chunks no afecta al resultado.
- No soporta generacion de texto, razonamiento, codigo, vision, tool calling ni funciones de agente. Es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica en corpus de documentos extensos: el modelo permite indexar articulos cientificos o informes legales completos y recuperar los mas relevantes por similitud coseno, sin truncar el contenido.
- Deduplicacion de documentos: al generar un unico vector por documento, se pueden comparar pares de documentos para detectar duplicados o versiones casi identicas en grandes repositorios.
- Clustering de documentos por tematica: los embeddings de documentos largos sirven como entrada para algoritmos de clustering (k-means, HDBSCAN) y permiten agrupar corpus extensos por contenido.
- Sistemas RAG con documentos extensos: en lugar de recuperar pasajes cortos, se pueden recuperar documentos completos y luego pasar los chunks relevantes al generador, aprovechando la capacidad de manejar documentos largos.
- Clasificacion de documentos por similitud a prototipos: se pueden construir prototipos por categoria y clasificar nuevos documentos por su distancia coseno a dichos prototipos, util en taxonomias de documentos legales o tecnicos.
- Deteccion de plagio o similitud entre documentos: comparar vectores de documentos completos permite identificar copias o reutilizaciones parciales en entornos academicos o editoriales.
- Recomendacion de documentos relacionados: a partir de un documento de consulta, se pueden sugerir otros documentos del corpus con alta similitud coseno, aplicable en bibliotecas digitales o repositorios de investigacion.
- Indexacion de manuales y libros tecnicos: el modelo puede indexar manuales extensos (por ejemplo, documentacion de software) y permitir busquedas por similitud semantica entre secciones completas.

## Benchmarks y rendimiento

El unico resultado reportado para este checkpoint exacto es el siguiente:

| Benchmark | Metrica | Eval stride | Valor | Fuente |
|---|---|---|---|---|
| GoodWiki-Long test | nDCG@10 | s384 | 65.17 | Paper, Tabla 2 |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. No hay comparaciones con otros modelos de embeddings de documentos largos en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el stack combinado (encoder REIGN + red guia) tiene 132M parametros. En float32, el peso total es de aproximadamente 528 MB, mas overhead de activaciones. Cabe en cualquier GPU con al menos 2 GB de VRAM, y tambien en CPU.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1080, RTX 2060 o superior) es suficiente. El entrenamiento se realizo en una GPU de 24 GB, pero la inferencia es mucho menos exigente.
- Compatibilidad con consumer GPU: si, el modelo es ligero y puede ejecutarse en GPUs de gama media e incluso en CPU para lotes pequenos.
- Opciones de despliegue: el paquete `reign` (disponible en GitHub) proporciona la clase `ReignBaselineEncoder` para cargar el checkpoint y la red guia. No se documenta integracion con vLLM, Ollama, TGI ni otros servidores de inferencia; el despliegue se realiza mediante el codigo del repositorio.
- Latencia y throughput: no se proporcionan datos de latencia o throughput en la informacion disponible. Dado el tamano reducido del encoder, se espera una latencia baja, pero depende del numero de chunks y del hardware.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados entre REIGN y otros modelos de embeddings de documentos largos (como BGE-M3, GTE, o modelos con ventanas de contexto ampliadas). La informacion disponible solo reporta el resultado en GoodWiki-Long test sin comparaciones. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo solo soporta ingles; no hay soporte multilingue.
- No es adecuado para inputs cortos (menores que el chunk size de 512 tokens): en ese regimen, la red guia por si sola es suficiente y el encoder REIGN no aporta valor.
- Depende de la red guia congelada BAAI/bge-base-en-v1.5, que debe cargarse por separado en el momento de la construccion. Si la red guia no esta disponible, el checkpoint no funciona.
- El entrenamiento se realizo sobre datos sinteticos derivados de Wikipedia (GoodWiki), por lo que el rendimiento en dominios especializados (medicina, derecho, finanzas) puede degradarse.
- El dataset de entrenamiento se distribuye bajo CC BY-SA 4.0, lo que implica que los modelos entrenados con el podrian estar sujetos a obligaciones de share-alike, aunque la licencia del modelo es Apache 2.0. Conviene revisar las implicaciones legales antes de un uso comercial.
- No se garantiza reproducibilidad bit a bit del entrenamiento debido al uso de precision mixta de 16 bits; los pesos retrenados pueden diferir ligeramente.
- El modelo no genera texto ni realiza razonamiento; es exclusivamente un extractor de caracteristicas para retrieval.

## Enlaces

- HuggingFace: https://huggingface.co/devrim/reign-base-l3_gn-bge-base_val-selected
- Repositorio de codigo: https://github.com/devrimcavusoglu/reign
- Pagina del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset de entrenamiento: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Red guia (BGE-base-en-v1.5): https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of EMNLP 2026 (to appear).
