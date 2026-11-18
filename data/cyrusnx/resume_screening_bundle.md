# cyrusnx/resume_screening_bundle

## Resumen

`cyrusnx/resume_screening_bundle` no es un modelo de lenguaje en sentido estricto, sino un paquete de referencia (reference bundle) publicado en Hugging Face para el cribado y ranking de curriculos. Contiene estructuras derivadas de un corpus de 2.481 curriculos procedentes de Kaggle: una matriz TF-IDF dispersa, un vocabulario de 39.935 terminos, un vector IDF del mismo tamano, 2.481 embeddings de 384 dimensiones y metadatos auxiliares (categorias, conjuntos de habilidades y alias). El autor lo distribuye como un fichero cargable con `numpy.load` y pensado para alimentar una funcion `machine_learning.score_uploaded` de su propio pipeline.

El sistema combina tres senales de recuperacion con pesos fijos: BM25 (0,1), similitud de embeddings (0,8) y coincidencia de habilidades (0,1). El modelo de embeddings utilizado es `sentence-transformers/all-MiniLM-L6-v2` en una revision concreta, por lo que el bundle depende de un modelo externo que no se incluye en el repositorio. El pipeline declarado es `sentence-similarity`, aunque la naturaleza real del artefacto es la de un indice precalculado mas una logica de scoring.

Su relevancia es limitada pero concreta: sirve como referencia reproducible para evaluar sistemas de ranking de curriculos, ya que publica metricas de recuperacion (P@10, MRR, NDCG@10) con intervalos de confianza bootstrap. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano declarado es de 0,0 GB, lo que sugiere que el fichero de pesos no esta realmente alojado o es de tamano despreciable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal; bundle de datos con pipeline hibrido BM25 + embeddings + skills |
| Parametros totales | No disponible (no es un modelo parametrizado) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (el componente de embeddings, all-MiniLM-L6-v2, tiene un maximo de 256 tokens, dato no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (no aplica a un bundle numpy) |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | Fichero numpy (`.npz`/`.npy`) cargado con `numpy.load(..., allow_pickle=False)` |

Estructuras incluidas en el bundle:

| Clave | Forma |
|---|---|
| `tf_data` | (804340,) |
| `tf_indices` | (804340,) |
| `tf_indptr` | (2482,) |
| `tf_shape` | (2,) |
| `vocabulary` | (39935,) |
| `idf` | (39935,) |
| `doc_len` | (2481,) |
| `ref_embeddings` | (2481, 384) |
| `ref_ids` | (2481,) |
| `ref_categories` | (2481,) |
| `ref_skill_sets_json` | escalar |
| `skill_aliases_json` | escalar |
| `config_json` | escalar |

## Arquitectura y entrenamiento

El artefacto no entrena una red neuronal propia. La matriz TF-IDF dispersa se construye sobre un vocabulario de 39.935 terminos extraidos de 2.481 curriculos, con 804.340 entradas no nulas en `tf_data`/`tf_indices` y 2.482 punteros en `tf_indptr`, lo que corresponde a una matriz CSR de 2.481 documentos por 39.935 columnas. Los embeddings de referencia son 2.481 vectores de 384 dimensiones generados con `sentence-transformers/all-MiniLM-L6-v2` (revision `1110a243fdf4706b3f48f1d95db1a4f5529b4d41`).

La puntuacion final es una combinacion lineal con pesos fijos `{"bm25": 0.1, "embedding": 0.8, "skills": 0.1}`. No se documenta entrenamiento supervisado, ajuste fino ni proceso de RLHF/DPO; los pesos parecen elegidos por busqueda sobre consultas de tuning, segun indica la model card ("Best embedding variant chosen on tuning queries"). El bundle incluye un diccionario de alias de habilidades (`skill_aliases_json`) para normalizar terminos, aunque su contenido no se detalla.

## Capacidades

- Ranking de curriculos frente a una consulta o descripcion de puesto, mediante puntuacion hibrida de tres senales.
- Recuperacion lexica con BM25 y TF-IDF sobre un vocabulario de 39.935 terminos.
- Similitud semantica densa mediante embeddings de 384 dimensiones (all-MiniLM-L6-v2).
- Coincidencia de habilidades con normalizacion por alias.
- Asignacion de categoria por curriculo de referencia (`ref_categories`), con la categoria ADVOCATE excluida.
- Carga sin ejecucion de codigo arbitrario gracias a `allow_pickle=False`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto. No es un modelo generativo.

## Casos de uso

- Evaluacion reproducible de sistemas de ranking de curriculos: el bundle actua como referencia fija contra la que comparar nuevas tecnicas, ya que publica P@10, MRR y NDCG@10 con intervalos bootstrap del 95 %.
- Prototipado de un motor de cribado en una API FastAPI: la model card fija versiones concretas (fastapi 0.163.2, uvicorn 0.54.0, pydantic 2.14.3, pypdf 7.1.0) que permiten reproducir el entorno de servicio.
- Extraccion y puntuacion de PDF de curriculos: con `pypdf` como extractor y `sentence_transformers` para embeber, el bundle proporciona el indice contra el que comparar cada nuevo documento.
- Analisis de sensibilidad de pesos: al estar los pesos hibridos en `config_json` y publicarse resultados por metodo (TF-IDF, BM25, minilm full/chunked, bge_small full/chunked, skills only), permite medir el efecto de reajustar la mezcla.
- Benchmark interno de embeddings alternativos: la tabla comparativa incluida (minilm frente a bge_small, en variante full y chunked) sirve como linea base para decidir que encoder usar en un pipeline propio.
- Normalizacion de habilidades en taxonomias de RRHH: el diccionario `skill_aliases_json` puede reutilizarse como referencia de alias en sistemas de extraccion de competencias, aunque su contenido no se documenta.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test retenido:

| Metodo | P@10 | MRR | NDCG@10 | NDCG@10 graded |
|---|---|---|---|---|
| TF-IDF | 0,457 | 0,575 | 0,452 | 0,535 |
| BM25 | 0,466 | 0,609 | 0,465 | 0,531 |
| minilm full | 0,476 | 0,617 | 0,473 | 0,562 |
| minilm chunked | 0,454 | 0,584 | 0,445 | 0,530 |
| bge_small full | 0,503 | 0,627 | 0,494 | 0,557 |
| bge_small chunked | 0,451 | 0,627 | 0,451 | 0,529 |
| Skills only | 0,182 | 0,173 | 0,160 | 0,243 |
| Hybrid | 0,486 | 0,596 | 0,480 | 0,561 |

Intervalos de confianza bootstrap al 95 % para NDCG@10 graded:

| Metodo | NDCG@10 graded | CI bajo | CI alto |
|---|---|---|---|
| TF-IDF | 0,535 | 0,459 | 0,613 |
| BM25 | 0,531 | 0,460 | 0,602 |
| Best embedding (minilm full) | 0,562 | 0,481 | 0,637 |
| Hybrid | 0,561 | 0,479 | 0,637 |

Diferencias del hibrido frente a las lineas base: frente a TF-IDF, +0,026 (IC 95 % de -0,015 a 0,068); frente a BM25, +0,031 (IC 95 % de -0,019 a 0,079). Ambas diferencias incluyen el cero, por lo que no son estadisticamente significativas con los datos publicados. El mejor metodo por P@10 y NDCG@10 es bge_small full (0,503 y 0,494), superior al hibrido configurado con minilm.

## Requisitos de hardware

- No requiere GPU para la carga del bundle: es un fichero numpy con estructuras dispersas y 2.481 embeddings de 384 dimensiones (aproximadamente 3,8 MB en float32 para `ref_embeddings`).
- La generacion de embeddings de nuevos curriculos si requiere ejecutar `sentence-transformers/all-MiniLM-L6-v2`, que cabe en CPU y en cualquier GPU consumer con pocos GB de VRAM.
- GPU recomendadas: no se especifican en la informacion proporcionada; para el encoder de 384 dimensiones basta una GPU de gama media o incluso CPU.
- Despliegue: la model card menciona FastAPI y Uvicorn con versiones fijadas; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cyrusnx/resume_screening_bundle` | No aplica (bundle de datos) | No disponible | NDCG@10 graded 0,561 (hibrido) | other | Hugging Face, 0 descargas |
| `sentence-transformers/all-MiniLM-L6-v2` | No disponible en la informacion | No disponible | NDCG@10 graded 0,562 (full) en este test | No disponible en la informacion | Hugging Face (referenciado como dependencia) |
| `BAAI/bge-small` (referido como bge_small) | No disponible en la informacion | No disponible | P@10 0,503, NDCG@10 0,494 en este test | No disponible en la informacion | Hugging Face (evaluado, no incluido en el bundle) |

No se dispone de informacion sobre otros bundles de cribado de curriculos comparables.

## Limitaciones y advertencias

- Las etiquetas de categoria son un proxy, no una verdad de referencia; la categoria ADVOCATE fue excluida del corpus.
- Las descripciones de puesto usadas para evaluar son sinteticas, lo que puede inflar o desviar las metricas respecto a consultas reales.
- Las puntuaciones son relativas al pool de referencia de 2.481 curriculos; no son calibradas en terminos absolutos y no se trasladan directamente a otros corpus.
- El autor declara que no verifico las licencias del dataset de origen (Kaggle), lo que introduce riesgo legal para uso comercial.
- La licencia es "other" sin texto adicional en la informacion proporcionada; no se puede confirmar si permite uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y el tamano declarado es 0,0 GB, lo que sugiere que el fichero puede no estar disponible o ser incompleto.
- El bundle depende de un modelo externo (`all-MiniLM-L6-v2`) en una revision concreta; cambios en ese modelo alteran las puntuaciones.
- No se documentan sesgos demograficos, pero un cribado de curriculos es un dominio de alto riesgo: cualquier uso en seleccion real exige auditoria de equidad y supervision humana.
- Las diferencias del hibrido frente a TF-IDF y BM25 no son estadisticamente significativas segun los intervalos publicados.
- No hay informacion sobre idiomas soportados ni sobre el contenido de `skill_aliases_json` y `ref_skill_sets_json`.

## Enlaces

- Hugging Face: https://huggingface.co/cyrusnx/resume_screening_bundle
- Modelo de embeddings referenciado: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Revision del modelo de embeddings: `1110a243fdf4706b3f48f1d95db1a4f5529b4d41`
