# hmzprover/hpsearch-embed-4b-state

## Resumen

hpsearch-embed-4b-state es un modelo de embeddings especializado en la recuperación de premisas para demostración automática de teoremas en Lean 4. Lo desarrolla el autor hmzprover como parte del proyecto hpsearch, una herramienta de búsqueda de premisas para asistentes de demostración. El modelo constituye únicamente la cara de consulta (query side) del embedder general hpsearch-embed-4b: recibe un estado de demostración (proof state) de Lean 4 y lo proyecta al mismo espacio vectorial que las premisas de Mathlib, de modo que la similitud coseno entre ambos permite seleccionar los lemas candidatos más útiles para el siguiente paso de la prueba.

Técnicamente se construye sobre hpsearch-embed-4b (una base de la familia Qwen3, según las etiquetas del repositorio) mediante un ajuste LoRA con rango 16 que se fusiona en los pesos finales. El modelo tiene 4.021.774.336 parámetros (aproximadamente 4 mil millones) y se distribuye en safetensors con un tamaño de repositorio de 8,1 GB. La licencia es Apache 2.0 y la librería de referencia es sentence-transformers.

Su relevancia es acotada pero específica: resuelve el problema de alinear representaciones de estados de prueba formales con representaciones de lemas matemáticos, una tarea donde los embedders de texto general rinden mal porque el vocabulario de Lean 4 y Mathlib es altamente técnico y estructural. El modelo está pensado para integrarse en el pipeline de hpsearch y no como embedder de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3, según etiquetas del repositorio); ajuste LoRA r=16 fusionado |
| Parámetros totales | 4.021.774.336 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (orientado a Lean 4 y Mathlib; el prompt de instrucción está en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de hmzprover/hpsearch-embed-4b y aplica un ajuste LoRA con rango 16 que posteriormente se fusiona en los pesos, dando lugar a un checkpoint denso de aproximadamente 4 mil millones de parámetros. La innovación principal no está en la arquitectura del transformer sino en el objetivo de entrenamiento: se entrena para que un estado de prueba (con el prompt `Instruct: Given a Lean 4 proof state, retrieve Mathlib lemmas that help prove its goal\nQuery: `) quede próximo, en el espacio de embeddings, a los vectores que hpsearch-embed-4b asigna a las premisas que la siguiente táctica utiliza. Los documentos conservan sus vectores originales de hpsearch-embed-4b, y la selección se hace con un softmax completo sobre todos los vectores de premisas del corpus.

Los datos de entrenamiento proceden del split público de entrenamiento de LeanDojo Benchmark 4 v10 (Zenodo 12740403, mathlib4 29dcec07): cada `state_before` de una táctica trazada se empareja con todas las premisas que su anotación localiza en el corpus, generando 367.730 pares (estado, premisa) a partir de 118.517 teoremas. El autor aplica una descontaminación estricta: elimina pares cuyos teoremas aparecen en los splits de validación o test de LeanDojo (random y novel_premises; 20.761 pares), estados idénticos a estados de validación/test de LeanDojo (100), estados que coinciden con consultas de otras evaluaciones de hpsearch (4.775), y premisas cuyo nombre (161.550) o enunciado (307) es un gold de otras evaluaciones (MathlibQR/MPR, Lean Finder, LeanStateSearch, TheoremSearch, TBPS, hmzprover, MIRB premise y Mathlib). El conjunto final retenido es de 180.237 pares, 107.936 estados y 51.145 premisas distintas.

## Capacidades

- Generación de embeddings de estados de prueba de Lean 4 para recuperación de premisas en Mathlib.
- Similitud semántica entre estados de prueba y lemas formales, con alineación explícita al espacio vectorial de hpsearch-embed-4b.
- Selección de premisas candidatas mediante softmax completo sobre el corpus de premisas.
- Integración con sentence-transformers y con text-embeddings-inference (etiqueta `text-embeddings-inference` y `endpoints_compatible` en el repositorio).
- Soporte de instrucción mediante prompt fijo en inglés para la consulta.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento explícito; es un modelo de embeddings, no un modelo generativo de uso general.
- Capacidades multilingües: no disponibles; el dominio es Lean 4 y Mathlib, con instrucción en inglés.

## Casos de uso

- Búsqueda de premisas en pipelines de demostración automática: el modelo convierte el estado actual de una prueba en un vector que se compara contra el índice de premisas de Mathlib para devolver los lemas más probables de ser útiles en la siguiente táctica. Es su caso de uso principal y para el que fue entrenado.
- Integración en hpsearch en modo GPU: al ser la cara de consulta del embedder hpsearch-embed-4b, se usa junto a él para que las consultas y los documentos compartan espacio vectorial sin reindexar el corpus.
- Asistentes de demostración interactivos: en un editor o IDE con Lean 4, el modelo puede sugerir lemas relevantes al usuario a partir del proof state actual, reduciendo el tiempo de búsqueda manual en Mathlib.
- Construcción de índices de recuperación para matemáticas formales: permite precomputar vectores de premisas con hpsearch-embed-4b y consultarlos con este modelo, manteniendo coherencia entre ambas caras.
- Evaluación de sistemas de premise selection: sirve como componente de referencia para comparar estrategias de recuperación sobre LeanDojo Benchmark 4 y otros conjuntos de evaluación de hpsearch.
- Filtrado previo en pipelines de prueba automatizada: dado un estado, recuperar un subconjunto reducido de premisas antes de pasarlas a un prover o a un modelo generativo, reduciendo el espacio de búsqueda.
- Experimentación en recuperación de código formal: aunque entrenado para Lean 4, el enfoque de alinear estados con documentos puede servir de base para estudiar transferencia a otros lenguajes formales, siempre con validación empírica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 8 GB solo para pesos (4,02 mil millones de parámetros), más overhead de activaciones y del índice de premisas; en la práctica, entre 10 y 12 GB para un lote pequeño.
- En cuantización de 8 bits: alrededor de 4-5 GB de pesos; en 4 bits, alrededor de 2-3 GB, aunque el autor no documenta cuantizaciones oficiales.
- GPU recomendadas: A100 o H100 para indexación a gran escala del corpus de Mathlib; RTX 4090 (24 GB) para inferencia cómoda en fp16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y tarjetas con 12 GB o más en fp16 con lotes pequeños; en 8 GB requiere cuantización.
- Opciones de despliegue: sentence-transformers, text-embeddings-inference (etiqueta oficial del repositorio), y servidores compatibles con endpoints de embeddings.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hpsearch-embed-4b-state | 4,02 B | no disponible | Lean 4 / Mathlib (solo consulta) | Apache 2.0 | Hugging Face |
| hpsearch-embed-4b | no disponible | no disponible | Lean 4 / Mathlib (documentos y consultas) | Apache 2.0 (según modelo base) | Hugging Face |
| Embedders de texto generales (p. ej. familia Qwen3 embedding) | variable | variable | texto general | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es únicamente la cara de consulta: no debe usarse para indexar documentos; los documentos deben vectorizarse con hpsearch-embed-4b para mantener la coherencia del espacio vectorial.
- El prompt de instrucción es fijo y está en inglés; desviarse de él puede degradar la calidad de los embeddings.
- Dominio muy restringido: Lean 4 y Mathlib. No es un embedder de propósito general y su rendimiento fuera de matemáticas formales es incierto.
- El autor aplicó descontaminación estricta, pero no se han publicado métricas de evaluación en la información disponible; el rendimiento real en producción no está cuantificado.
- Riesgo de sesgo heredado del corpus de Mathlib y de LeanDojo Benchmark 4, que no representa toda la matemática formal.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base hpsearch-embed-4b y de los datos de LeanDojo.
- Sin datos publicados sobre contexto máximo, cuantizaciones oficiales ni latencia; hay que validar el despliegue empíricamente.
- El repositorio tiene muy pocas descargas (26) y ningún like en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hmzprover/hpsearch-embed-4b-state
- Modelo base: https://huggingface.co/hmzprover/hpsearch-embed-4b
- Repositorio hpsearch: https://github.com/humanfia/hpsearch
- LeanDojo Benchmark 4 v10 (Zenodo 12740403): https://zenodo.org/records/12740403
