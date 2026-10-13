# regularpooria/HiCWE-MiniLM-L12

## Resumen

HiCWE-MiniLM-L12-v2 es un codificador de frases (sentence encoder) disenado para mapear la descripcion de una vulnerabilidad CVE a las entradas CWE mas probables de la vista CWE-699 *Software Development*. Lo desarrolla el usuario regularpooria y se construye como un fine-tuning de `sentence-transformers/all-MiniLM-L12-v2` mediante un objetivo contrastivo consciente de la jerarquia, de modo que una descripcion de CVE queda cerca tanto de su categoria CWE padre como de sus CWE hijos en un espacio de embeddings compartido de 384 dimensiones.

Resuelve un problema de recuperacion asimetrica muy concreto en seguridad del software: dado un texto de vulnerabilidad, clasificarlo contra una taxonomia jerarquica de debilidades (CWE). Es la variante grande de dos modelos publicados; comparte dimension de embedding de 384 con la variante ligera `HiCWE-MiniLM-L6-v2`, por lo que ambos son intercambiables sin cambiar el indice.

El modelo es relevante porque la clasificacion CWE alimenta analisis posteriores de explotabilidad y priorizacion de parches, y porque su enfoque de busqueda en dos etapas (categoria y luego hijos) reproduce la estructura del entrenamiento. Con 33,36 millones de parametros y una longitud de contexto de 512 tokens, es lo bastante pequeno para desplegarse como servicio de embeddings a bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (all-MiniLM-L12-v2), transformer encoder de 12 capas |
| Parametros totales | 33.360.000 |
| Longitud de contexto | 512 tokens |
| Dimension de embedding | 384 |
| Tipos de cuantizacion | no disponible (el repo publica pesos en safetensors) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pooling | mean pooling + normalizacion L2 (similitud coseno) |
| Modelo base | sentence-transformers/all-MiniLM-L12-v2 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo parte de `all-MiniLM-L12-v2`, un encoder transformer tipo BERT de 12 capas que produce embeddings de 384 dimensiones mediante mean pooling y normalizacion L2. El fine-tuning se realiza con LoRA (rank 64, alpha 128, dropout 0) sobre las proyecciones de atencion `query`, `key`, `value` y `dense`, que despues se fusionan en los pesos base, de forma que la inferencia es un unico forward pass de un SentenceTransformer estandar.

El entrenamiento usa MultipleNegativesRankingLoss con la receta "hierarchy-full" (Receta A), compuesta por tres tareas: `cve_to_cwe` (CVE a su propio CWE, con un CWE hermano y un CWE de aspecto similar de otra categoria como negativos duros), `cve_to_category` (CVE a su categoria padre, con la categoria mas cercana como negativo duro) y `cwe_geometry` (CWE a un CWE hermano, acercando hermanos y alejando los de aspecto similar de otras categorias). Los negativos duros se minan con el encoder sin ajustar, y el lado CWE de cada par se representa como el titulo del nodo, su resumen y los titulos de sus hijos inmediatos.

Los datos de entrenamiento combinan la vista CWE-699 *Software Development* extraida de `cwe.mitre.org` (padres e hijos) y descripciones de CVE de 1999 a 2021 derivadas del dataset `zefang-liu/cve-and-cwe-mapping-dataset`, enriquecidas con descripciones CWE y normalizadas para eliminar ruido. La particion se hace por identificador de CVE (estratificada por CWE primario), evitando que un CVE con multiples etiquetas se reparta entre conjuntos. El entrenamiento consta de 3 epocas, learning rate 1e-4, tamano de lote 64 y warmup lineal del 5%.

## Capacidades

- Generacion de embeddings de frases de 384 dimensiones para similitud y recuperacion por coseno.
- Mapeo asimetrico de descripciones de CVE a nodos CWE de la vista CWE-699 *Software Development*.
- Recuperacion en dos etapas: puntuacion de nodos categoria seguida de busqueda restringida entre los descendientes de las categorias mejor puntuadas.
- Clasificacion a nivel de categoria CWE (padre) y a nivel de CWE hijo.
- Uso como modelo de embeddings generico para recuperacion asimetrica CVE-a-CWE.
- Extraccion de caracteristicas (feature-extraction) e integracion en pipelines de sentence-similarity.
- No dispone de tool calling, razonamiento multi-paso, agentes, vision ni audio: es exclusivamente un encoder de texto en ingles.

## Casos de uso

- Triaje automatico de vulnerabilidades: al ingerir una CVE recien publicada, el modelo recupera las categorias CWE candidatas y sus hijos, de modo que un analista parte de una clasificacion previa en lugar de texto sin procesar.
- Priorizacion de parches por debilidad: agrupando las CVE por CWE recuperada, los equipos pueden ordenar el trabajo segun el tipo de debilidad (por ejemplo, inyeccion SQL frente a XSS) en lugar de por identificador individual.
- Enriquecimiento de bases de datos de vulnerabilidades: se puede indexar todo el corpus CVE con embeddings de 384 dimensiones y anadir la categoria CWE predicha como metadato para busquedas facetadas.
- Construccion de sistemas de recomendacion de mitigaciones: dado un CWE recuperado, enlazar con guias de mitigacion de la propia taxonomia CWE para sugerir contramedidas.
- Analisis de explotabilidad y scoring: como el modelo predice CWE hijos con alta recuperacion en contexto jerarquico, sirve de entrada a modelos downstream que estiman severidad o explotabilidad.
- Auditoria de codigo asistida: combinado con un extractor de descripciones de hallazgos (SAST, revision manual), el modelo clasifica cada hallazgo contra la taxonomia CWE para consolidar informes.
- Servicio de embeddings a bajo coste: al tener 33,36 M de parametros y embeddings de 384 dimensiones, puede desplegarse como endpoint de similitud con latencia y coste bajos.

## Benchmarks y rendimiento

Recall@k sobre CVE divulgadas entre 2023 y 2025, no vistas durante el entrenamiento. El recall de categoria usa la busqueda en dos etapas; el recall de hijos se reporta restringido a las categorias predichas (*hier.*) y sobre toda la taxonomia (*flat*).

| Objetivo | Modelo | @1 | @3 | @5 |
|---|---|---|---|---|
| Categoria | Baseline (L12 sin ajustar) | 0,386 | 0,632 | 0,744 |
| Categoria | HiCWE-MiniLM-L12-v2 | 0,789 | 0,867 | 0,897 |
| Categoria | Clasificador SOTA (mulliken/cwe-predictor) | 0,802 | 0,862 | 0,869 |
| Hijo (hier.) | Baseline (L12 sin ajustar) | 0,236 | 0,306 | 0,344 |
| Hijo (hier.) | HiCWE-MiniLM-L12-v2 | 0,726 | 0,770 | 0,787 |
| Hijo (flat) | Baseline (L12 sin ajustar) | 0,346 | 0,446 | 0,496 |
| Hijo (flat) | HiCWE-MiniLM-L12-v2 | 0,754 | 0,824 | 0,850 |
| Hijo (flat) | Clasificador SOTA (mulliken/cwe-predictor) | 0,655 | 0,753 | 0,779 |

El fine-tuning mejora todos los objetivos respecto al encoder sin ajustar. En el objetivo de categoria iguala al clasificador SOTA en k=3 y lo supera a partir de k=5. En hijo plano supera al clasificador SOTA en todos los valores de k reportados. Segun la model card, la variante L12 sin ajustar es mas fuerte que la L6 sin ajustar, pero tras el fine-tuning la diferencia se reduce (categoria e hijo jerarquico difieren como maximo en ~4 puntos; hijo plano es practicamente identico), lo que sugiere que el limite es el dato de entrenamiento y no la capacidad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 130 MB en FP32 y 65 MB en FP16 para los pesos, mas memoria para activaciones y lote. Al ser un modelo de 33,36 M de parametros, cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; se puede ejecutar en CPU sin problema. En GPU, modelos como RTX 3060, RTX 4090, A100 o H100 quedan sobredimensionados para este modelo, que es adecuado para despliegue masivo en hardware modesto.
- Compatibilidad consumer: si, cabe en practicamente cualquier GPU consumer e incluso en CPU y en dispositivos de borde.
- Opciones de despliegue: la libreria `sentence-transformers` de forma nativa; el repo esta marcado como compatible con Text Embeddings Inference (TEI) y con endpoints, por lo que puede servirse detras de una API de embeddings. El formato de pesos es safetensors.
- Latencia y throughput: no se han publicado cifras concretas de latencia o throughput en la informacion disponible. Con un modelo de este tamano se espera un coste por embedding muy bajo, pero no se dispone de medidas oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Embedding | Rendimiento (categoria @1) | Licencia |
|---|---|---|---|---|---|
| HiCWE-MiniLM-L12-v2 | 33,36 M | 512 | 384 | 0,789 | apache-2.0 |
| HiCWE-MiniLM-L6-v2 | no disponible | 512 | 384 | no disponible | apache-2.0 |
| all-MiniLM-L12-v2 (base sin ajustar) | 33,36 M | 512 | 384 | 0,386 | apache-2.0 |
| mulliken/cwe-predictor (clasificador SOTA) | no disponible | no disponible | no aplica (clasificador) | 0,802 | no disponible |

La comparacion con la variante L6 se apoya en lo indicado en la model card: tras el fine-tuning con la jerarquia, la diferencia entre L12 y L6 es de como maximo ~4 puntos en categoria e hijo jerarquico, y practicamente nula en hijo plano. Frente al clasificador `mulliken/cwe-predictor`, HiCWE-MiniLM-L12-v2 es competitivo en categoria y claramente superior en hijo plano, ademas de ofrecer embeddings reutilizables en lugar de una clasificacion cerrada. No se dispone de datos de parametros, contexto ni licencia del clasificador SOTA en la informacion proporcionada.

## Limitaciones y advertencias

- La taxonomia esta fijada a la vista CWE-699 *Software Development*; no cubre otras vistas de CWE ni taxonomias alternativas.
- El modelo solo soporta ingles; las descripciones de CVE en otros idiomas no estan contempladas por el entrenamiento ni por los datos.
- Es un modelo de recuperacion/clasificacion, no generativo: no produce explicaciones ni texto, unicamente puntuaciones de similitud. Puede devolver un CWE incorrecto con alta confianza si la descripcion de entrada es ambigua o muy corta.
- Riesgo de alucinacion entendido como falsa recuperacion: el ranking por coseno siempre devuelve una lista, aunque ninguna categoria sea realmente adecuada, por lo que conviene aplicar umbrales y revision humana.
- El entrenamiento se apoya en datos de CVE hasta 2021 para el ajuste; las evaluaciones con CVE de 2023-2025 son de test, por lo que su comportamiento en tipos de vulnerabilidad emergentes o CWE nuevos no esta garantizado.
- La seccion de limitaciones de la model card original esta truncada en la informacion disponible, de modo que pueden existir otros caveats documentados por el autor que no se recogen aqui.
- Licencia apache-2.0, que permite uso comercial, pero se recomienda verificar el cumplimiento de las licencias de los datos de entrenamiento de origen (`cwe.mitre.org` y `zefang-liu/cve-and-cwe-mapping-dataset`) para despliegues en produccion.
- Al ser un modelo con 0 descargas y 0 likes en el momento de la ficha, carece de validacion por parte de la comunidad; conviene tratarlo como un modelo reciente y poco contrastado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/regularpooria/HiCWE-MiniLM-L12
- Variante ligera L6: https://huggingface.co/regularpooria/HiCWE-MiniLM-L6-v2
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L12-v2
- Clasificador SOTA de referencia: https://huggingface.co/mulliken/cwe-predictor
- Dataset de CVE y mapeo CWE: https://huggingface.co/datasets/zefang-liu/cve-and-cwe-mapping-dataset
- Taxonomia CWE (MITRE): https://cwe.mitre.org
