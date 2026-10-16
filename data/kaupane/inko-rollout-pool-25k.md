# kaupane/inko-rollout-pool-25k

## Resumen

inko-rollout-pool-25k es un dataset privado de prompts de rollout y rubricas de evaluacion, publicado en HuggingFace por el usuario kaupane. No es un modelo de lenguaje ni un modelo generativo: es un conjunto de datos estructurado destinado al post-entrenamiento de Inko, concretamente al entrenamiento de recompensa en el marco DiffusionART/NFT. Contiene 24.579 filas en un unico split `train`.

Cada fila combina un prompt autocontenido (ya reescrito por un proceso de prompt engineering) con una rubrica estructurada de cinco categorias de puntuacion, lo que lo convierte en material para entrenar o calibrar jueces de recompensa sobre generacion de imagenes. El dataset distingue dos tipos de semilla (`image` y `caption`) y dos niveles de longitud de prompt (`mid`, entre 31 y 512 tokens, y `short`, de 30 tokens o menos).

La relevancia del recurso es acotada: al tratarse de un dataset privado, sin pipeline declarado, sin licencia explicita y sin metricas publicadas, su interes practico depende de que el autor conceda acceso. La model card documenta exclusivamente el esquema de datos, no el procedimiento de entrenamiento ni los resultados obtenidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplicable (es un dataset, no un modelo) |
| Parametros totales | no aplicable (es un dataset, no un modelo) |
| Parametros activos | no aplicable |
| Longitud de contexto | no aplicable |
| Tipos de cuantizacion | no aplicable |
| Idiomas soportados | no disponible (los nombres de las categorias de rubrica aparecen en chino; el idioma de los prompts no se especifica) |
| Licencia | no disponible (la model card indica "Private dataset") |
| Formato de pesos | no aplicable; los datos se distribuyen presumiblemente en formato de dataset de HuggingFace `datasets` (no confirmado) |
| Tamano del dataset | 24.579 filas, un unico split `train` |
| Columnas | `row_id`, `prompt`, `rubric`, `ref_image`, `seed_kind`, `tier` |
| Categorias de rubrica | `content_alignment`, `form_structure`, `aesthetics`, `style_medium`, `artifacts` |
| Pesos por item de rubrica | `high`, `mid`, `low` (los de peso `low` son ~4% del total) |
| Segmentacion por longitud | `mid` (31-512 tokens), `short` (<=30 tokens) |
| Tipos de semilla | `image` (con `ref_image`), `caption` (`ref_image` nulo) |
| Fecha de creacion | 2026-10-15 |
| Fecha de actualizacion | 2026-10-15 |

## Arquitectura y entrenamiento

Este recurso no tiene arquitectura de red ni proceso de entrenamiento propio: es el material de entrada para el post-entrenamiento de otro sistema, Inko. Segun la model card, los prompts fueron generados por `deepseek-v4.1-flash` a partir de semillas de imagen y de caption, mientras que las rubricas se produjeron con `Qwen3.8-27B` autodesplegado, aplicando plantillas de cinco categorias. Las categorias cubren alineacion de contenido (texto citado o renderizado y elementos especificados en el prompt), estructura de forma (estructura y plausibilidad de objeto o escena), estetica y composicion (composicion, color, iluminacion), estilo y medio (anclado a `ref_image` en las filas con semilla de imagen) y artefactos (marcas de agua, deformaciones, texto ilegible).

El dataset fue decontaminado frente a DrawBench, PickScore, GenEval y HPS mediante tecnicas de n-gram y de embeddings. Ademas, los prompts de monitorizacion reservados para evaluacion no forman parte de este pool: segun la model card, residen en los ficheros de evaluacion del repositorio (`configs/prompts/`). El pipeline de generacion y las puertas de aceptacion se describen en las notas del proyecto (`notes/posttrain_data.md`), no incluidas en la informacion disponible.

## Capacidades

- Proporcionar prompts de rollout autocontenidos y ya reescritos, listos para alimentar un pipeline de muestreo.
- Aportar rubricas estructuradas de cinco categorias con pesos por item, utilizables para entrenar o guiar un juez de recompensa.
- Anclar filas con semilla de imagen a una imagen de referencia (`ref_image`) para tareas de transferencia o condicionamiento de estilo.
- Separar filas con semilla de imagen (`row_id` con prefijo `i*`) de filas con semilla de caption (prefijo `c*`) mediante el campo `row_id`.
- Estratificar por longitud de prompt (`mid` y `short`), lo que permite controlar la dificultad o el coste de computo del muestreo.
- Servir como base para entrenamiento de recompensa en el marco DiffusionART/NFT.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, vision, tool calling, agentes ni multilingues, porque no es un modelo.

## Casos de uso

- Entrenamiento de recompensa para generacion de imagenes: el dataset aporta pares prompt-rubrica con cinco ejes de evaluacion, de modo que un modelo de recompensa puede aprender a agregar puntuaciones ponderadas por item.
- Calibracion de un juez automatico: las categorias `content_alignment`, `form_structure`, `aesthetics`, `style_medium` y `artifacts` permiten descomponer la evaluacion en subtareas y medir la concordancia del juez por eje.
- Transferencia de estilo condicionada por referencia: las filas con `seed_kind = image` incluyen `ref_image`, lo que habilita experimentos de estilo a partir de una imagen de referencia con rubricas especificas de estilo y medio.
- Estudio de prompts cortos frente a prompts largos: la estratificacion en `mid` (31-512 tokens) y `short` (<=30 tokens) permite analizar como varia la calidad de la generacion segun la longitud y densidad de la instruccion.
- Deteccion y penalizacion de artefactos: la categoria `artifacts`, orientada a marcas de agua, deformaciones y texto corrupto, sirve para construir o afinar clasificadores de defectos visuales.
- Investigacion sobre ponderacion de criterios: dado que los items de peso `low` representan aproximadamente el 4% del total, el pool permite estudiar como afecta la agregacion ponderada al comportamiento del juez.
- Evaluacion interna con prompts reservados: combinando este pool con los prompts de monitorizacion del repositorio (fuera del pool), se puede montar un esquema de validacion con separacion entre entrenamiento y monitorizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de ningun tipo, ni sobre el dataset (por ejemplo, tasas de aceptacion) ni sobre los modelos que lo generaron o que lo consumen.

## Requisitos de hardware

- Almacenamiento: no disponible; el dataset tiene 24.579 filas de texto mas un campo de imagen opcional, por lo que el peso depende de cuantas imagenes de referencia se incluyan, dato que no se especifica.
- VRAM para inferencia del dataset: no aplicable; se trata de datos, no de un modelo ejecutable.
- GPU recomendadas: no disponible para el consumo del dataset. El entrenamiento de recompensa que lo utiliza (DiffusionART/NFT) si requeriria GPU, pero no se especifica ninguna recomendacion en la informacion proporcionada.
- Encaje en GPU de consumo: la lectura y el procesado de los datos de texto no requiere GPU. No hay datos para estimar el entrenamiento de recompensa asociado.
- Opciones de despliegue: al ser un dataset, el consumo habitual seria mediante la libreria `datasets` de HuggingFace. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que corresponden a modelos y no a datos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica datasets comparables, ni publicos ni privados, con los que contrastar tamano, esquema de rubricas, procedencia de los prompts o regimen de acceso. La unica referencia indirecta son los conjuntos usados para la decontaminacion (DrawBench, PickScore, GenEval, HPS), que son benchmarks de evaluacion de generacion de imagenes y no pools de prompts con rubricas equivalentes.

## Limitaciones y advertencias

- No es un modelo: no genera texto ni imagenes, por lo que no puede evaluarse con las metricas habituales de un LLM o un modelo de difusion.
- Acceso restringido: la model card se declara como "Private dataset" y la licencia no esta indicada, de modo que no hay base explicita para uso comercial ni para redistribucion.
- Ausencia de licencia: sin terminos publicados, cualquier uso en produccion queda en un limbo legal.
- Trazabilidad de la generacion: los prompts y las rubricas provienen de modelos concretos (`deepseek-v4.1-flash` y `Qwen3.8-27B`) sin que se detallen versiones exactas, hiperparametros ni puertas de aceptacion, que solo se referencian en notas internas no incluidas.
- Riesgo de sesgo heredado: al sintetizarse con modelos generativos a partir de semillas de imagen y caption, el pool puede arrastrar los sesgos de esas semillas y de los modelos generadores; no se documenta ninguna auditoria de sesgo.
- Idiomas: no se especifica el idioma de los prompts, mientras que las etiquetas de las categorias de rubrica estan en chino, lo que puede introducir desajustes si se usa con pipelines en otros idiomas.
- Decontaminacion limitada a cuatro referencias: la limpieza se realizo frente a DrawBench, PickScore, GenEval y HPS, pero no se declara frente a otros conjuntos.
- Sin garantia de calidad por fila: no se publican tasas de aceptacion ni verificacion humana del pool.
- Metadatos inconsistentes: las fechas de creacion y actualizacion (2026-10-15) son posteriores a la fecha habitual de consulta y con una diferencia de dos segundos entre ambas, lo que sugiere valor limitado como indicador de mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/kaupane/inko-rollout-pool-25k
- Notas del proyecto citadas en la model card: `notes/posttrain_data.md` (no enlazadas ni accesibles en la informacion proporcionada)
- Prompts de evaluacion citados en la model card: `configs/prompts/` (ruta interna del repositorio, no enlazada)
- La busqueda web realizada no devolvio ningun resultado relevante sobre este dataset: los unicos enlaces recuperados tratan sobre la biografia de Steve Jobs y no guardan relacion con el recurso.
