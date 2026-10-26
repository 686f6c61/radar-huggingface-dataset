# hmzprover/hpsearch-embed-xs-state

## Resumen

hpsearch-embed-xs-state es un modelo de embeddings de frases especializado en la recuperación de premisas para demostración automatizada de teoremas en Lean 4. Lo desarrolla hmzprover como pieza del modo `balanced` de su herramienta hpsearch, y su función es codificar únicamente el lado consulta: recibe un estado de prueba (proof state) de Lean y devuelve un vector unitario de 384 dimensiones que cae cerca de los vectores de las premisas que la siguiente táctica necesita. Los documentos no se re-codifican con este modelo, sino que conservan los vectores del modelo hermano `hmzprover/hpsearch-embed-xs-agent`, de modo que un índice existente no requiere vectores adicionales.

El modelo parte de `snowflake-arctic-embed-xs` (22 millones de parámetros) y se ha afinado para alinear estados de prueba con premisas de mathlib4. Se distribuye exclusivamente como grafo ONNX con cuantización int8 dinámica, pensado para ejecutarse en CPU con onnxruntime, lo que lo hace adecuado para integrarse en el bucle de un asistente de pruebas o en un servidor modesto. La licencia es Apache 2.0.

Su relevancia es acotada pero clara: la selección de premisas es el cuello de botella clásico de los hammers y de los modelos de táctica en Lean, y este modelo ofrece un recuperador específico de dominio, entrenado con supervisión densa (softmax completo sobre el corpus) y destilación desde un modelo profesor de mayor tamaño, con un protocolo de descontaminación explícito y verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (fine-tune de snowflake-arctic-embed-xs); no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 22 millones (heredados del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 con cuantizacion dinamica (ONNX) |
| Idiomas soportados | No disponibles en los metadatos; el corpus de entrenamiento es matematica formal en Lean 4 / mathlib4, con terminologia tecnica en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, int8); entradas `input_ids` y `attention_mask`, salida `batch x 384` |
| Dimension del embedding | 384 (vectores unitarios, normalizados) |
| Pipeline | sentence-similarity |
| Libreria | onnxruntime (CPU) |
| Modelo base | hmzprover/hpsearch-embed-xs-agent |
| Rol en el sistema | Solo lado consulta (query embedder); los documentos usan los vectores de xs-agent |
| Campo de emparejamiento | `pairs_with` apunta al id del modelo de documentos |
| Tamano del repo | 0.0 GB reportados en HuggingFace; en torno a 22-25 MB para 22 M de parametros en int8 (estimacion) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de 22 millones de parametros derivado de `snowflake-arctic-embed-xs`, con una cabeza de proyeccion a 384 dimensiones y salida normalizada (vectores unitarios). Sobre el checkpoint base se aplico un ajuste fino de similitud con un objetivo de softmax completo sobre el conjunto completo de vectores de premisas, que permanecen congelados durante el entrenamiento: 180.973 vectores. Para evitar que el modelo aprenda atajos entre premisas correctas co-ocurrentes, se enmascaran las demas premisas gold del mismo estado. A ese objetivo se suma una destilacion por divergencia KL desde las listas top-64 generadas por `hmzprover/hpsearch-embed-4b-state`, un profesor de mayor capacidad. El entrenamiento duro 3 epocas.

Los datos proceden del split publico de entrenamiento de LeanDojo Benchmark 4 v10 (Zenodo 12740403, sobre mathlib4 en el commit 29dcec07). Cada tactica trazada aporta su `state_before` emparejado con todas las premisas que su anotacion localiza en el corpus de premisas: 367.730 pares (estado, premisa) extraidos de 118.517 teoremas. Antes del entrenamiento se aplico una descontaminacion estricta: se descartaron los pares cuyo teorema aparece en los splits de validacion o test de cualquiera de los dos conjuntos de LeanDojo (random y novel_premises; 20.761 pares), los estados identicos a un estado de validacion/test de LeanDojo (100), los estados identicos a una consulta de cualquier otra evaluacion sobre la que se mide hpsearch (4.775), y las premisas cuyo nombre (161.550) o enunciado (307) es gold en otra evaluacion (MathlibQR/MPR, Lean Finder, LeanStateSearch, TheoremSearch, TBPS, hmzprover, MIRB premise y Mathlib). El conjunto final retenido es de 180.237 pares, 107.936 estados y 51.145 premisas distintas.

La innovacion practica no esta en el bloque transformer sino en el diseno del sistema: separar el espacio de documentos (fijo, servido por xs-agent) del espacio de consultas (este modelo), de forma que el indice de premisas no hay que reconstruirlo, y en la combinacion de objetivo softmax completo con destilacion desde un profesor grande para compensar la capacidad limitada del estudiante.

## Capacidades

- Generacion de embeddings de similitud para estados de prueba de Lean 4, con salida de 384 dimensiones normalizada.
- Recuperacion de premisas (premise selection) sobre un corpus de mathlib4 indexado con los vectores de `hpsearch-embed-xs-agent`.
- Alineacion cross-encoder implicita: el estado de prueba y la premisa correcta quedan proximos en el mismo espacio vectorial, aunque se codifiquen con modelos distintos del par.
- Inferencia en CPU mediante onnxruntime, sin requisito de GPU.
- Compatibilidad con indices preexistentes de xs-agent: no requiere reindexar el corpus de premisas.
- Uso como componente de un pipeline mayor (hpsearch en modo `balanced`), no como modelo autonomo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un codificador de consultas.
- No tiene modo thinking, vision ni audio.
- Capacidades multilingues: no acreditadas; el dominio es terminologia matematica formal en Lean.

## Casos de uso

- Seleccion de premisas en demostracion interactiva: dado el `state_before` de la tactica que el usuario esta escribiendo en Emacs o VS Code, el modelo genera el vector de consulta y recupera del indice los lemas candidatos de mathlib4 para el autocompletado o el panel de sugerencias.
- Hammers y automatizacion de pruebas: integrado en un pipeline tipo LeanDojo, alimenta al buscador de teoremas con un conjunto reducido de premisas relevantes, reduciendo el espacio de busqueda frente a pasar todo mathlib al prover.
- Reutilizacion de indices existentes: si ya se dispone de un indice de premisas construido con `hpsearch-embed-xs-agent`, este modelo se conecta sin reindexar; solo hay que sustituir el codificador de consultas, lo que abarata mucho la adopcion.
- Despliegue en entornos sin GPU: al ser un ONNX int8 de ~22 M de parametros, puede correr en el mismo portatil del investigador o en un contenedor pequeno junto al servidor LSP de Lean, con un coste de memoria minimo.
- Servicio de embeddings en un microservicio: exposicion via onnxruntime o a traves de Text Embeddings Inference/Optimum para servir consultas de estado desde multiples clientes con latencia baja.
- Evaluacion y construccion de datasets: generar pares (estado, premisa) y medir recuperacion en experimentos de investigacion, comparando el recuperador pequeno con el profesor de 4B para estudiar el compromiso calidad/coste.
- Filtrado previo en un pipeline de dos etapas: usar este modelo para recuperar un top-k amplio y reordenar despues con un cross-encoder o con el modelo de 4B, reservando el modelo grande para la fase de reranking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el protocolo de entrenamiento y de descontaminacion, pero no reporta metricas de recuperacion (Recall@k, MRR, nDCG) sobre LeanDojo, MathlibQR/MPR, Lean Finder, LeanStateSearch, TheoremSearch ni TBPS.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario previsto (CPU); en GPU, el grafo int8 ocupa del orden de decenas de MB, por lo que cualquier GPU con 1 GB libre es suficiente (estimacion a partir de los 22 M de parametros).
- GPU recomendadas: no son necesarias. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) sirve si se quiere acelerar el lote; el modelo esta disenado para onnxruntime en CPU.
- Cabe en GPU consumer: si, en todas, incluidas graficas integradas, y tambien en CPU sin aceleracion.
- Opciones de despliegue: onnxruntime (via directa, la prevista por el autor), Optimum/ONNX Runtime de HuggingFace, Text Embeddings Inference con backend ONNX, o un microservicio propio en Python. vLLM y llama.cpp no aplican: no es un modelo generativo y no se distribuye en GGUF.
- Latencia y throughput: no publicados. Por el tamano (22 M de parametros, int8) se espera del orden de milisegundos por lote pequeno en una CPU moderna, pero es una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rol | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| hmzprover/hpsearch-embed-xs-state | 22 M | No disponible | Solo consultas (estados de prueba Lean) | ONNX int8 | Apache 2.0 | Objeto de esta ficha; destilado de 4b-state |
| hmzprover/hpsearch-embed-xs-agent | 22 M | No disponible | Documentos y consultas (modelo hermano) | No disponible | No disponible en la informacion | Genera los vectores del indice; `pairs_with` lo referencia |
| hmzprover/hpsearch-embed-4b-state | No disponible (profesor "4B" segun el nombre) | No disponible | Consultas, mayor capacidad | No disponible | No disponible en la informacion | Profesor de la destilacion KL top-64 |
| snowflake-arctic-embed-xs | 22 M | No disponible | Embeddings de proposito general | No disponible | No disponible en la informacion | Checkpoint de partida antes del ajuste fino |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada; la comparacion es, por tanto, estructural y no de calidad de recuperacion.

## Limitaciones y advertencias

- Modelo de un solo lado: solo codifica consultas. Si el indice de documentos no esta construido con `hpsearch-embed-xs-agent`, los vectores no son comparables y la recuperacion se degrada sin aviso.
- Dominio muy restringido: Lean 4 y mathlib4. No es utilizable como modelo de embeddings generalista para texto, codigo de proposito general ni otro asistente de pruebas (Coq, Isabelle, Agda).
- La cuantizacion int8 dinamica introduce perdida de precision respecto al modelo en coma flotante; no se documenta la degradacion medida.
- Dependencia de una version concreta del corpus: mathlib4 en el commit 29dcec07 y LeanDojo Benchmark 4 v10. Premisas nuevas o renombradas fuera de ese corte no estan cubiertas por el entrenamiento.
- La descontaminacion es estricta y documentada, pero siempre puede quedar filtración residual por reformulaciones o duplicados semanticos no detectados por nombre ni enunciado.
- Ausencia total de validacion externa: 0 descargas y 0 likes en el momento de la ficha, sin resultados de benchmarks publicados; no hay evidencia independiente de su calidad frente a recuperadores alternativos.
- Riesgo de recuperacion irrelevante: al no generar texto, el fallo tipico no es una alucinacion linguistica sino la seleccion de premisas plausibles pero inaplicables, que puede desviar al prover.
- Idioma: no hay soporte multilingue declarado; los estados de prueba en Lean son mayoritariamente terminologia matematica en ingles.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y aviso de cambios; no se especifican restricciones adicionales, pero conviene verificar la licencia del modelo base snowflake-arctic-embed-xs antes de un despliegue comercial.
- Al ser un componente de hpsearch, su comportamiento en produccion depende del resto del pipeline (indice, top-k, reranking) y no solo de este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hmzprover/hpsearch-embed-xs-state
- Modelo de documentos (xs-agent): https://huggingface.co/hmzprover/hpsearch-embed-xs-agent
- Modelo profesor (4b-state): https://huggingface.co/hmzprover/hpsearch-embed-4b-state
- Repositorio hpsearch: https://github.com/humanfia/hpsearch
- LeanDojo Benchmark 4 v10 (Zenodo): https://zenodo.org/records/12740403
- No se han encontrado en la busqueda web enlaces relevantes a este modelo; los resultados devueltos no guardan relacion con el contenido de la ficha.
