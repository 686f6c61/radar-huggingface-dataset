# flavianv/qwen3-4b-musical-instruments-combined-ranker-head-20260924-v1

## Resumen

`flavianv/qwen3-4b-musical-instruments-combined-ranker-head-20260924-v1` no es un modelo de lenguaje completo, sino una **cabeza de ranking** de 2 560 pesos que se acopla a un backbone Qwen3-4B congelado. Su única función es asignar una puntuación escalar a un par formado por una petición de usuario y el título de un producto del ámbito de los instrumentos musicales, y ordenar por esa puntuación los candidatos de una misma consulta. El repositorio contiene únicamente la cabeza (`score.pt`), no el backbone: la referencia exacta del backbone SFT sobre el que se entrenó se fija en `backbone.json`.

El checkpoint publicado corresponde al paso 990 (época 1,25) de un entrenamiento sobre 3 169 consultas y 12 659 pares generados con preferencias estilo Bradley-Terry. Según la model card, es el checkpoint con mayor tasa de selección y menor pérdida de los ocho evaluados, con un 90,146 % de selección top-1 en el conjunto de validación de 274 consultas, frente al 86,131 % de la cabeza original y el 88,686 % del estado final del entrenamiento. El autor advierte explícitamente de que estas cifras provienen de validación con exposición previa a la selección de modelo, no de un test independiente, y que no se reclama significación estadística.

Se trata de un artefacto muy específico, orientado a *reranking* dentro de un sistema de búsqueda o recomendación de instrumentos musicales. Su relevancia es acotada: no aporta capacidades generativas ni multilingües verificadas, no tiene descargas ni validación comunitaria, y no puede desplegarse como modelo autónomo sin el backbone Qwen3-4B y sin el script de inferencia que garantiza la serialización exacta de las entradas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de ranking escalar (2 560 pesos) sobre un backbone transformer denso Qwen3-4B congelado en BF16 |
| Parametros totales | No disponible (la cabeza tiene 2 560 pesos; el backbone no se incluye en el repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del backbone Qwen3-4B, no especificado en la model card) |
| Tipos de cuantizacion | No disponible. La model card indica que la cabeza debe convertirse a float32 y que el backbone se congeló en BF16; no se documentan cuantizaciones del conjunto |
| Idiomas soportados | No disponible (el modelo solo consume una petición y títulos de producto; el tag de repositorio es `region:us`) |
| Licencia | apache-2.0 |
| Formato de pesos | `score.pt` (PyTorch) para la cabeza; `backbone.json` fija el backbone; `step-990_eval.json` con las puntuaciones de selección. Repositorio de 0,0 GB |
| Tarea declarada | `text-classification` (en la práctica, ranking/puntuación de pares) |
| Entradas | Petición de usuario + título de producto (única fuente de información) |
| Autor | flavianv |
| Fecha de publicación | 2026-09-24 |
| Descargas / likes | 0 / 0 |
| Compatibilidad declarada | `transformers`, `endpoints_compatible` |

## Arquitectura y entrenamiento

El artefacto es una cabeza de 2 560 pesos que produce una puntuación escalar a partir de las representaciones del backbone Qwen3-4B, que permaneció congelado en BF16 durante todo el entrenamiento. El autor indica que la cabeza debe cargarse en `model.score` tras convertirla a float32, y que el backbone SFT correcto está fijado en `backbone.json`; el repositorio no incluye el backbone, por lo que la inferencia depende de reconstruir ese emparejamiento exacto con el script de inferencia proporcionado. El número de pesos es consistente con una proyección lineal desde la dimensión oculta del backbone, aunque la model card no describe la topología interna de la cabeza.

El entrenamiento partió de la cabeza original 822 sobre el backbone SFT 420 y se optimizó con AdamW a tasa 1e-4, batch 4 con acumulación 4, semilla 42, dos épocas y 1 584 actualizaciones, con evaluación cada 198 pasos. Los datos son 3 169 consultas y 12 659 pares Bradley-Terry, con negativos sintéticos de solapamiento parcial retenidos en el conjunto. El checkpoint 990 (época 1,25) fue seleccionado por ser el de mayor tasa de selección y menor pérdida entre ocho checkpoints; el autor conserva todos los checkpoints originales y verifica por SHA256 la transferencia de `score.pt`, así como la recarga exacta de la cabeza final. Se trata de un ajuste de preferencias pairwise, no de un RLHF ni de un DPO sobre el modelo completo.

## Capacidades

- Puntuación de relevancia: asigna un score escalar a cada par (petición, título de producto) para ordenar candidatos de una misma consulta.
- Selección top-1: el criterio reportado por el autor es la elección del mejor título por consulta (247 de 274 aciertos en validación en el checkpoint seleccionado).
- Aprendizaje pairwise: entrenada con pérdida Bradley-Terry sobre 12 659 pares; los negativos de consulta incorrecta contribuyen a la pérdida por pares, pero no a la selección top-1 de la misma consulta.
- Manejo de negativos sintéticos de solapamiento parcial, según la model card.
- No genera texto: es una cabeza de puntuación, no un modelo generativo autónomo.
- Sin soporte documentado de tool calling, function calling ni uso como agente.
- Sin razonamiento multi-paso, sin modo *thinking*, sin visión ni audio.
- Capacidades multilingües: no documentadas; la model card no especifica idiomas.
- Comportamiento ante empates: los empates se consideran fallo en la métrica de selección.

## Casos de uso

- **Reranking en catálogos de instrumentos musicales**: tras una recuperación inicial (léxica o vectorial) de decenas de títulos candidatos, la cabeza reordena los resultados con una señal aprendida de preferencia; es adecuada porque solo necesita la petición y el título, sin indexar descripciones largas.
- **Búsqueda interna en marketplaces de música**: integrar la cabeza como segunda etapa de un pipeline *retrieve-and-rerank*, donde el coste de la primera etapa se mantiene barato y solo los mejores candidatos pasan por el backbone Qwen3-4B.
- **Desambiguación de listados con alias de títulos**: la model card señala que los alias pueden volver ambiguas las etiquetas de identificador, de modo que el modelo resulta útil para separar variantes de un mismo producto (por ejemplo, distintas denominaciones de un mismo instrumento).
- **Minería de negativos duros para reentrenamiento**: los scores de la cabeza permiten seleccionar pares mal puntuados como candidatos a negativos duros en un ciclo de mejora del recuperador.
- **Evaluación de estrategias de recuperación**: comparar dos configuraciones de un buscador fijando la misma cabeza como juez de relevancia, ya que el modelo ofrece una puntuación comparable entre candidatos.
- **Enrutado de consultas a fichas de producto**: si cada título pertenece a una categoría del catálogo, el score puede emplearse para dirigir la consulta a la ficha o familia de producto más plausible.
- **Filtrado de resultados irrelevantes**: descartar candidatos cuyo score cae por debajo de un umbral antes de mostrarlos al usuario, con el umbral calibrado sobre el conjunto de validación.
- **Recomendación de accesorios y complementos**: puntuar títulos de accesorios contra la consulta del usuario para construir listas de "complementos habituales" con una señal aprendida.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son métricas de selección top-1 sobre el conjunto de validación de 274 consultas. No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) porque el artefacto no es un modelo generativo.

| Metrica | Checkpoint 990 (seleccionado) | Cabeza original 822 | Estado final del entrenamiento |
|---|---|---|---|
| Selección top-1 en validación (274 consultas) | 247/274 = 90,146 % | 236/274 = 86,131 % | 243/274 = 88,686 % |
| Pérdida | La más baja de los ocho checkpoints evaluados | No disponible | No disponible |

Advertencias del propio autor sobre estas cifras: la selección se hizo sobre validación, no sobre test; el cohorte de 274 consultas tiene exposición previa a la selección de modelo; el *holdout* de 507 del entorno de agente y el conjunto de test de 275 quedaron excluidos y no fueron evaluados; no se reclama significación estadística. La selección de 247/274 se corresponde con la ronda de validación reportada junto al checkpoint 990 y la de 243/274 con el estado final de la cabeza.

## Requisitos de hardware

- Cabeza: 2 560 parámetros en float32, aproximadamente 10 KB; su coste computacional y de memoria es despreciable.
- Coste real: recae en el backbone Qwen3-4B en BF16, no incluido en el repositorio, que debe obtenerse y fijarse mediante `backbone.json`.
- VRAM estimada: alrededor de 8-10 GB en BF16 para los pesos del backbone más la caché de claves y valores. Las secuencias son cortas (petición más títulos), por lo que la caché es pequeña en comparación con tareas generativas de contexto largo.
- GPU recomendadas: NVIDIA L4, A10G, A100 y H100 para despliegue en servidor. En consumo, una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB pueden alojar el backbone en BF16; una RTX 4090 de 24 GB lo hace con holgura.
- Opciones de despliegue: `transformers` con el script de inferencia del autor para reproducir la serialización exacta. El repositorio está marcado como `endpoints_compatible`, por lo que es desplegable en Hugging Face Inference Endpoints. TGI, vLLM, llama.cpp u Ollama no soportan esta cabeza sin escribir código de adaptación, ya que requiere cargar `score.pt` en `model.score` y convertirla a float32.
- Latencia y throughput: no disponibles. Dependen por completo del backbone elegido y del tamaño del lote de candidatos a reordenar.
- Nota de reproducibilidad: la conversión de la cabeza a float32 y la carga del backbone fijado son requisitos explícitos de la model card; no se documenta compatibilidad con cuantizaciones del backbone.

## Comparativa con modelos similares

No se han encontrado alternativas públicas directamente comparables en la información proporcionada. El único punto de referencia documentado es la propia cabeza original 822 del mismo autor, de la que este checkpoint deriva. La siguiente tabla recoge lo que sí está documentado, marcando como no disponible todo lo que no aparece en la información.

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (cabeza 990 sobre Qwen3-4B) | 2 560 pesos de cabeza + backbone externo | No disponible (hereda del backbone) | 90,146 % de selección top-1 en validación (274 consultas) | apache-2.0 | Repositorio público, 0 descargas |
| Cabeza original 822 (mismo autor) | No disponible | No disponible | 86,131 % de selección top-1 en validación | No disponible | Referenciada en la model card |
| Backbone Qwen3-4B | No disponible (~4 000 M según la nomenclatura del modelo) | No disponible en esta información | No disponible en esta información | No disponible en esta información | Público, referenciado en `backbone.json` |
| Otros rerankers o cabezas de ranking para catálogos de productos | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo autónomo: el repositorio contiene solo una cabeza de 2 560 pesos. Sin el backbone fijado en `backbone.json` y sin el script de inferencia, el artefacto no es utilizable.
- Las métricas publicadas son de validación, con exposición previa a la selección de modelo, no de test independiente. El autor no reclama significación estadística.
- El *holdout* de 507 del entorno de agente y el conjunto de test de 275 quedaron excluidos y no fueron evaluados, por lo que no hay estimación limpia de generalización.
- Dominio muy restringido: instrumentos musicales y títulos de producto. No hay evidencia de transferencia a otros dominios.
- Idiomas soportados no documentados. El repositorio está etiquetado como `region:us` y las entradas se limitan a petición y título, sin que se especifique la cobertura lingüística.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de puntuaciones mal calibradas fuera de la distribución de entrenamiento, especialmente ante títulos con alias, abreviaturas o sinónimos no vistos.
- Los alias de título pueden hacer ambiguas las etiquetas de identificador, según advierte la propia model card.
- Los empates se consideran fallo en la métrica de selección, lo que puede penalizar decisiones legítimamente equivalentes.
- Se retuvieron negativos sintéticos de solapamiento parcial; su presencia en el conjunto puede sesgar el comportamiento frente a candidatos parcialmente relevantes.
- Licencia apache-2.0 para la cabeza; conviene verificar los términos del backbone Qwen3-4B utilizados antes de un despliegue comercial.
- Sin descargas ni likes y publicada el 2026-09-24; no existe validación independiente por parte de la comunidad.
- Tamaño de repositorio de 0,0 GB: el artefacto es mínimo y no incorpora pesos del backbone ni utilidades de servicio completas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flavianv/qwen3-4b-musical-instruments-combined-ranker-head-20260924-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/flavianv/musical-instruments-ranker-combined-small-20260924-v1/tree/f151816f2938c07dbe2a71393f09c7cf0d861658
- Archivos referenciados en el repositorio del modelo: `backbone.json`, `score.pt` y `step-990_eval.json` (disponibles en la pestaña de archivos del propio repositorio de Hugging Face).
- Búsqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden a foros de un servidor de rol (GTAW France) sin relación con el modelo, por lo que no se incluyen.
