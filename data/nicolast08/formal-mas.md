# NicolasT08/formal-mas

## Resumen

formal-mas es un sistema multiagente de IA generativa orientado a la resolución de problemas de matemáticas de estilo olimpiada mediante cadenas de razonamiento, generación aumentada por recuperación (RAG) sobre Mathlib y verificación formal en Lean 4. No es un modelo de pesos abiertos al uso, sino un pipeline orquestado que combina varios componentes LLM con un verificador determinista basado en el kernel de Lean. Lo desarrollan Andrés Felipe Mongui Torres y Nicolás Samuel Tinjacá Topia como proyecto final del curso de Inteligencia Artificial de la UPTC Sogamoso, y se publica bajo licencia MIT en el repositorio NicolasT08/formal-mas.

El sistema aborda un problema clásico en la automatización del razonamiento matemático: cómo garantizar que una prueba generada por un LLM sea correcta sin depender de la confianza en el modelo. La respuesta es delegar la validación en el kernel de Lean 4, de modo que solo se acepta una prueba si compila, no contiene `sorry` y sus axiomas se limitan a `propext`, `Classical.choice` y `Quot.sound`. El bucle PRE-PASS → PLAN → RETRIEVE → GENERATE → FORMALIZE → VERIFY → ASSEMBLE, con un agente Critic que clasifica fallos y aplica una política determinista bajo un presupuesto de 40 llamadas LLM por problema, estructura toda la operación.

La relevancia actual radica en su enfoque híbrido: separa la generación creativa (LLM) de la verificación formal (kernel), incorpora recuperación léxica y densa sobre 212 879 teoremas de Mathlib, y expone ablaciones reproducibles (C1–C5) para medir la contribución de cada componente. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card advierte que la copia publicada sustituye el texto informal de cinco problemas de PutnamBench por una referencia, por lo que requiere reconstruir el conjunto de evaluación antes de reproducir resultados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema multiagente sobre LLM (pipeline orquestado con verificador Lean 4); no es un modelo único con pesos publicados |
| Parametros totales | no disponible (depende de los LLM subyacentes, no especificados en la información) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio es código y configuración; no se publican pesos) |

## Arquitectura y entrenamiento

El sistema no entrena un modelo propio: orquesta llamadas a LLM dentro de un grafo compilado con estados bien definidos. El flujo comienza con un pre-paso que prueba una lista fija de tácticas estándar sin invocar al LLM. Después, el Planner propone hasta `n_max` = 3 subobjetivos en forma de proposiciones Lean de una línea, un bloque de táctica de cierre y una justificación breve; el código, nunca el LLM, construye cada enunciado y esqueleto Lean, lo que impide que un modelo debilite el teorema que debe demostrar. El Retriever devuelve los `k` = 16 lemas de Mathlib más útiles por subobjetivo, y el Generator escribe `N` = 3 esbozos de prueba por subobjetivo y vota la estrategia (autoconsistencia). El Autoformalizer convierte el esbozo ganador en tácticas Lean y el Verifier, determinista, decide si la prueba es válida.

La recuperación combina BM25 (Okapi) sobre nombre, firma y docstring con embeddings densos de `intfloat/e5-base-v2` indexados con FAISS (`IndexFlatIP` sobre vectores normalizados en ℓ2), fusionados mediante reciprocal rank fusion con constante 60. Se aplica reescritura de consulta (`goal_to_query`), una segunda consulta genérica que sustituye portadores concretos (ℝ, ℚ, ℤ, ℂ) por una variable de tipo `R`, y una función `suggest_names` para reparar errores de identificador desconocido. El corpus se extrae del entorno Lean elaborado tras `import Mathlib`: 212 879 teoremas públicos no obsoletos, incluidas variantes `@[to_additive]` y `@[to_dual]`. El Critic clasifica cada fallo con reglas fijas y aplica una política determinista bajo un presupuesto duro de `b_max` = 40 llamadas LLM por problema; ante un fallo `missing_lemma` solicita `k_retry` = 32.

## Capacidades

- Resolución de problemas de matemáticas de olimpiada expresados como teoremas de Lean 4, con texto informal asociado.
- Razonamiento multi-paso mediante planificación de subobjetivos y esbozos de prueba con autoconsistencia.
- Recuperación aumentada sobre Mathlib: búsqueda léxica BM25, densa con e5-base-v2 y fusión RRF.
- Formalización automática de esbozos en tácticas Lean 4.
- Verificación formal determinista: compilación en el kernel, ausencia de `sorry` y comprobación de axiomas con `#print axioms`.
- Clasificación y recuperación de fallos mediante un agente Critic con reglas y política fijas.
- Reparación de errores de identificador desconocido mediante `suggest_names`.
- Degradación controlada del Retriever: sin torch, FAISS o índice denso cae a BM25; sin índice léxico devuelve lista vacía, registrando cada degradación como evento JSON `retriever_warning`.
- No se documentan capacidades de visión, audio, tool calling genérico ni despliegue multilingüe más allá del dominio formal.

## Casos de uso

- Demostración automática de teoremas de olimpiada: dado un problema formalizado en Lean 4 con su enunciado informal, el sistema ejecuta el bucle completo y solo acepta la prueba si el kernel la valida, lo que permite integrarlo en flujos de evaluación de razonamiento matemático sin revisión humana de cada paso.
- Investigación en autoformalización: el par Generator/Autoformalizer permite estudiar cómo se traducen esbozos en lenguaje natural a tácticas Lean, con el verificador como señal objetiva de éxito.
- Evaluación de recuperación sobre Mathlib: el conjunto de referencia de 200 teoremas con partición 134 dev / 66 test y las métricas Recall@k y MRR permiten comparar métodos de recuperación (BM25, e5-base, BGE-base, BGE-M3) de forma reproducible.
- Ablaciones de sistemas multiagente: las cinco configuraciones C1–C5 (dos baselines, sin RAG, sin Critic y sistema completo) comparten un grafo compilado y difieren solo por flags en `config/ablations/`, lo que facilita medir la contribución de cada componente.
- Docencia de Lean 4 y verificación formal: el proyecto incluye documentación (`docs/how_it_works.md`, `docs/results_explained.md`) pensada para lectores con experiencia en programación pero sin conocimientos de Lean.
- Reproducción de experimentos: los scripts `scripts/fetch_eval_sources.sh` y `scripts/build_eval_set.py` reconstruyen el conjunto de evaluación completo a partir de PutnamBench, lo que permite replicar las ejecuciones descritas en la model card.
- Integración en pipelines de investigación matemática asistida: el presupuesto acotado de 40 llamadas LLM por problema y la verificación determinista hacen el coste y la corrección predecibles.

## Benchmarks y rendimiento

La model card publica resultados de recuperación sobre un conjunto de referencia de 200 teoremas de Mathlib (álgebra, teoría de números, combinatoria), con partición 134 dev / 66 test. El método y el valor de `k` se eligieron solo en dev; test se evaluó una vez.

| Método (test, n = 66) | R@4 | R@8 | R@16 | R@32 | MRR |
|---|---|---|---|---|---|
| BM25 | 0.394 | 0.561 | 0.621 | 0.697 | 0.346 |
| e5-base (con instrucción) | 0.333 | 0.409 | 0.530 | 0.606 | 0.279 |
| RRF(BM25, e5-base) | 0.409 | 0.530 | 0.621 | 0.667 | 0.333 |
| RRF(BM25, e5-base) + consulta genérica (seleccionado) | 0.409 | 0.530 | 0.621 | 0.667 | 0.322 |

No se han publicado en la información disponible resultados de benchmarks de resolución de problemas (por ejemplo, tasas de éxito en PutnamBench o en el conjunto de test) ni comparaciones con otros sistemas de demostración automática.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU en la información disponible; el consumo depende de los LLM subyacentes que orqueste el sistema, que no se detallan.
- El Retriever puede funcionar solo con BM25 sin torch ni FAISS, lo que reduce requisitos, aunque degrada la recuperación.
- El índice denso emplea `intfloat/e5-base-v2` con FAISS `IndexFlatIP`, lo que requiere cargar el modelo de embeddings y mantener el índice en memoria.
- La verificación exige un entorno Lean 4 con Mathlib compilado; el corpus se extrae del entorno elaborado tras `import Mathlib`.
- Opciones de despliegue: ejecución local según el README (sección 5.7); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros sistemas de demostración formal (por ejemplo, basados en LeanDojo, COPRA u otros pipelines con LLM y Lean), ni datos de parámetros, contexto o rendimiento de alternativas.

## Limitaciones y advertencias

- La copia publicada sustituye el texto informal de los 5 problemas de PutnamBench en `data/eval.jsonl` por una referencia por permisos de la MAA; para reproducir ejecuciones hay que restaurarlo desde PutnamBench `informal/putnam.json` (commit a635813f) y reconstruir el fichero con los scripts indicados.
- El sistema depende de LLM externos cuyos pesos, versiones y licencias no se especifican en la información, lo que afecta a la reproducibilidad y al coste.
- Presupuesto duro de 40 llamadas LLM por problema: problemas que requieran más iteraciones fallarán por diseño.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-09), lo que sugiere una publicación reciente sin validación externa.
- No se documentan sesgos, tasas de alucinación ni comportamiento multilingüe; el dominio está restringido a matemáticas formales en Lean 4.
- La licencia MIT permite uso comercial del código, pero no cubre los términos de los LLM subyacentes ni de Mathlib, que deben verificarse por separado.
- El Retriever nunca lanza excepciones, pero puede degradar silenciosamente a BM25 o devolver lista vacía; conviene monitorizar los eventos `retriever_warning` en producción.
- No se publican pesos del modelo: el artefacto es código y configuración, no un checkpoint desplegable de forma independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/NicolasT08/formal-mas
- Conjunto de evaluación y resultados: https://huggingface.co/datasets/NicolasT08/formal-mas-eval
- Documentación interna citada: `docs/how_it_works.md`, `docs/results_explained.md`, `docs/architecture.md`
- Scripts de reproducción citados: `scripts/fetch_eval_sources.sh`, `scripts/build_eval_set.py`, `scripts/extract_corpus.lean`
- Fuente de los enunciados informales: PutnamBench `informal/putnam.json` (commit a635813f)
- Modelo de embeddings empleado: `intfloat/e5-base-v2`
