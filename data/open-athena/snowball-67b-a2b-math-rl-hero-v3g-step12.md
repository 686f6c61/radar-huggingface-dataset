# open-athena/Snowball-67B-A2B-Math-RL-Hero-v3g-Step12

## Resumen

Snowball-67B-A2B-Math-RL-Hero-v3g-Step12 es un checkpoint de investigación publicado por el usuario open-athena en HuggingFace. Se trata del artefacto exacto empleado para reportar una fila de resultados dentro del experimento Snowball 67B-A2B de aprendizaje por refuerzo sobre matemáticas. El modelo tiene 67.078.876.160 parámetros totales (unos 67,08 mil millones) y el repo pesa 268,3 GB, lo que corresponde aproximadamente a un almacenamiento en precisión de 32 bits.

La nomenclatura A2B y la etiqueta `grug_moe` apuntan a una arquitectura de mezcla de expertos (MoE) con unos 2.000 millones de parámetros activos por token, aunque la model card no confirma explícitamente ni el número de expertos ni el enrutado. El modelo está etiquetado como `marin` y `snowball`, lo que lo vincula al ecosistema del proyecto Marin, y su pipeline declarado es `reinforcement-learning`.

Su relevancia es estrictamente como artefacto de investigación reproducible: la propia model card advierte de que la utilidad del checkpoint depende de preservar el estado de router congelado (`Frozen router bias`) y de que otros repositorios con nombres similares, como los `laion/rl-snowball-*`, pueden contener exportaciones con router mutable que colapsan en inferencia. No es una versión de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) segun la etiqueta `grug_moe`; numero de expertos y detalles de enrutado no disponibles |
| Parametros totales | 67.078.876.160 (~67,08 mil millones), dato real de safetensors |
| Parametros activos | No disponible. La nomenclatura A2B sugiere del orden de 2 mil millones, sin confirmacion en la model card |
| Longitud de contexto | No disponible. El nombre del artefacto de origen incluye `ctx10k`, lo que sugiere 10.000 tokens en la fase de RL, sin confirmar |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | `other` (terminos no especificados en la informacion disponible) |
| Formato de pesos | safetensors, con `model.safetensors.index.json` y ficheros de tokenizer asociados |
| Tamano del repositorio | 268,3 GB |
| Etapa del checkpoint | `global_step_12`, brazo `hero-v3g`, seleccionado como checkpoint final evaluado de v3g |
| Estado del router | Sesgo de router congelado (frozen router bias) |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un modelo de gran tamano con etiqueta `grug_moe`, es decir, una arquitectura de mezcla de expertos dentro del ecosistema Marin. No se detallan el numero de capas, la dimension oculta, el numero de expertos, la estrategia de enrutado ni la funcion de activacion. Tampoco se especifica el tokenizador ni el vocabulario.

En cuanto al entrenamiento, el modelo es el resultado de una campana de aprendizaje por refuerzo sobre matematicas. El artefacto de origen se identifica como `rl-snowball-hero-v3g-rno2a-rlvrmath-ctx10k-grug-67-20260817-235057`, dentro de la ruta de S3 `s3://marin-us-east-02a/marin/users/benjaminfeuer/skyrl/...`, y la etapa exportada es `global_step_12`. Los identificadores `rlvrmath` y `ctx10k` sugieren RLVR (reinforcement learning with verifiable rewards) sobre matematicas con contexto de 10.000 tokens, aunque la model card no lo desarrolla. Tampoco se indica el numero de tokens de preentrenamiento, la composicion del dataset, ni si hubo fases de SFT, DPO o RLHF previas. La innovacion tecnica destacada por el autor no es arquitectonica, sino de integridad del artefacto: conservar el sesgo de router congelado para evitar el colapso en inferencia que sufren exportaciones con router mutable.

## Capacidades

- Generacion de texto y resolucion de problemas matematicos: el checkpoint esta entrenado y evaluado especificamente en tareas de competicion matematica (AIME24, MATH-500, OlympiadBench).
- Razonamiento de multiples pasos orientado a problemas con respuesta verificable, dado el uso de RLVR en el pipeline.
- No hay informacion sobre soporte de tool calling ni function calling.
- No hay informacion sobre capacidades de agente ni ejecucion de planes de varios pasos en entornos externos.
- No hay informacion sobre capacidades multilingues ni sobre el idioma o idiomas de entrenamiento.
- No hay informacion sobre modo de razonamiento explicito (thinking mode), vision, audio ni otras modalidades.
- No hay informacion sobre generacion de codigo, mas alla de la que se derive indirectamente de las evaluaciones matematicas.

## Casos de uso

- Reproduccion de resultados de investigacion: el checkpoint es el artefacto exacto de una fila reportada del experimento Snowball 67B-A2B math-RL, por lo que sirve para replicar las puntuaciones de AIME24, MATH-500 y OlympiadBench registradas en el archivo de evidencias.
- Estudio de enrutado en MoE: al conservar el sesgo de router congelado, permite analizar el comportamiento del enrutado sin la deriva que introducen las exportaciones con router mutable.
- Evaluacion comparativa de tecnicas de RL sobre matematicas: sirve como punto de referencia (step 12, brazo hero-v3g) frente a otros brazos o pasos de la misma campana.
- Analisis de robustez de checkpoints intermedios: al ser una exportacion de un paso concreto (`global_step_12`), permite estudiar como evoluciona el rendimiento a lo largo de la campana de RL.
- Auditoria de integridad de artefactos: util para validar que `config.json`, los ficheros de tokenizer y todos los shards referenciados por `model.safetensors.index.json` se conservan juntos, tal como exige la model card.
- Banco de pruebas de infraestructura de inferencia: con 67,08 mil millones de parametros y 268,3 GB en disco, es un caso realista para validar pipelines de carga de shards, paralelismo tensorial y reparto de expertos en clústeres multi-GPU.
- Formacion y depuracion de metodologia de evaluacion: el archivo de evidencias incluye un `MATH_EVALS.md` con las puntuaciones y las salvedades de evaluacion, lo que lo convierte en material didactico sobre como reportar resultados de forma reproducible.

## Benchmarks y rendimiento

Resultados de evaluacion en held-out reportados en la model card:

| Benchmark | Resultado |
|---|---|
| AIME24 | 19,33 |
| MATH-500 | 64,80 |
| OlympiadBench | 18,67 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones directas con otros modelos. Las puntuaciones anteriores corresponden al paso 12 del brazo `hero-v3g`; las salvedades de evaluacion estan documentadas en `MATH_EVALS.md` dentro del archivo de evidencias.

## Requisitos de hardware

- VRAM estimada para inferencia, derivada del recuento de parametros (67,08 mil millones): en fp32, unos 268 GB; en bf16/fp16, unos 134 GB; en cuantizacion de 8 bits, unos 67 GB; en cuantizacion de 4 bits, unos 34 GB. Estas cifras son estimaciones teoricas a partir del numero de parametros, no datos publicados por el autor, y no incluyen la sobrecarga de cache KV ni de activaciones.
- El repositorio ocupa 268,3 GB en disco, coherente con pesos en 32 bits.
- GPU recomendadas: no disponible. Por tamano, un despliegue en bf16 requiere agregados de VRAM del orden de 140-160 GB, lo que apunta a configuraciones multi-GPU tipo 2x H100 80 GB, 4x A100 80 GB o superiores.
- Cabe en GPU de consumo: no en su formato completo. En una unica RTX 4090 (24 GB) solo seria planteable con cuantizaciones de 4 bits o inferiores y reparto de expertos en CPU/RAM, siempre que existieran pesos cuantizados, que no estan publicados.
- Opciones de despliegue: no disponible. La model card no menciona compatibilidad con vLLM, llama.cpp, Ollama, TGI ni frameworks similares, y la unica etiqueta de formato es `safetensors`.
- Latencia y throughput estimados: no disponible.
- Advertencia de integridad: la model card exige cargar conjuntamente `config.json`, el tokenizer y todos los shards listados en `model.safetensors.index.json`. Sustituir este artefacto por exportaciones de nombre similar puede provocar colapso en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Benchmarks publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Snowball-67B-A2B-Math-RL-Hero-v3g-Step12 | 67,08 mil millones | no disponible | AIME24 19,33; MATH-500 64,80; OlympiadBench 18,67 | other | HuggingFace, 0 descargas y 0 likes en el momento del registro |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada modelos comparables de la misma categoria con datos verificables. La model card unicamente menciona repositorios `laion/rl-snowball-*` como artefactos de nombre parecido que no deben sustituir a este checkpoint, sin aportar cifras comparativas.

## Limitaciones y advertencias

- Artefacto de investigacion, no version de produccion: la propia model card indica que la utilidad del modelo es limitada salvo que se preserve la reparacion del sesgo de router o la integridad del router congelado.
- Riesgo de colapso en inferencia si se sustituye por exportaciones con router mutable, como las que pueden aparecer en repositorios `laion/rl-snowball-*` de nombre similar.
- Sesgos conocidos: no disponibles. No se documenta la composicion del dataset ni los idiomas de entrenamiento.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Al ser un modelo entrenado con RL sobre matematicas con recompensas verificables, el comportamiento fuera de ese dominio no esta caracterizado.
- Limitaciones de contexto e idioma: no disponibles. El identificador `ctx10k` sugiere 10.000 tokens en la fase de RL, pero no hay confirmacion ni datos sobre extrapolacion.
- Restricciones de licencia: la licencia figura como `other` sin texto asociado en la informacion disponible, por lo que el uso comercial no puede darse por permitido ni por prohibido sin consultar los terminos originales.
- Trazabilidad obligatoria: hay que conservar `config.json`, los ficheros de tokenizer y todos los shards referenciados por `model.safetensors.index.json` como una unidad; separarlos invalida el artefacto.
- Adopcion practicamente nula en el momento del registro: 0 descargas y 0 likes, sin garantia de mantenimiento ni soporte.
- Resultados de evaluacion acompanados de salvedades metodologicas documentadas en `MATH_EVALS.md`; deben leerse antes de citar las cifras.
- Los resultados de busqueda web disponibles no contienen informacion relevante sobre este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-Math-RL-Hero-v3g-Step12
- Archivo de evidencias y artefactos de evaluacion: https://huggingface.co/datasets/penfever/snowball-67b-a2b-math-rl-artifacts
- Issue del experimento en el repositorio Marin: https://github.com/marin-community/marin/issues/7786
- Repositorio del proyecto Marin: https://github.com/marin-community/marin
