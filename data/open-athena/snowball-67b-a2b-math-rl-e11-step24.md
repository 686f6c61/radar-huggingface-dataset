# open-athena/Snowball-67B-A2B-Math-RL-E11-Step24

## Resumen

Snowball-67B-A2B-Math-RL-E11-Step24 es un checkpoint de investigación publicado por la organización open-athena dentro de la campaña Snowball del proyecto Marin. Según los metadatos de HuggingFace contiene 67.078.876.160 parámetros reales (unos 67,08 mil millones) y ocupa 268,3 GB en el repositorio. La etiqueta de arquitectura es grug_moe, lo que apunta a una mezcla de expertos (MoE), y la nomenclatura "A2B" del nombre sugiere del orden de 2.000 millones de parámetros activos por token, aunque este dato no está confirmado en la documentación.

No es un modelo de propósito general ni un producto listo para producción: es el artefacto exacto empleado para reproducir una fila concreta de un experimento de aprendizaje por refuerzo sobre matemáticas, correspondiente al brazo E11, paso 24. La model card insiste en que el router está congelado con sesgo fijo (frozen router bias) y advierte de que repositorios de nombre parecido, como los `laion/rl-snowball-*`, pueden contener exportaciones con router mutable que colapsan durante la inferencia.

Su relevancia es metodológica: documenta un punto de control con resultados medidos en AIME24, MATH-500 y OlympiadBench (20,00 / 72,80 / 19,33 sobre el conjunto reservado) dentro de un archivo de evidencias público. No hay información disponible sobre longitud de contexto, idiomas soportados ni condiciones concretas de licencia más allá de la etiqueta "other".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), etiqueta de arquitectura grug_moe; número de capas y expertos no disponible |
| Parámetros totales | 67.078.876.160 (67,08 mil millones) |
| Parámetros activos | No confirmado en la documentación; la nomenclatura "A2B" del nombre sugiere aproximadamente 2.000 millones activos por token |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo publica pesos en safetensors; no hay versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | No disponible |
| Licencia | other (etiqueta `license:other`; no se detallan términos ni permisos de uso comercial) |
| Formato de pesos | safetensors, con `model.safetensors.index.json` y shards distribuidos |
| Tamaño del repositorio | 268,3 GB |
| Estado del router | Sesgo de router congelado (frozen router bias); la card exige preservar la integridad del router original |
| Framework de origen | Marin (campaña Snowball), con rutas de artefacto del stack SkyRL |
| Fecha de publicación | 2026-09-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible describe una arquitectura de mezcla de expertos (tags `grug_moe` junto a `marin` y `snowball`), sin detallar el número de capas, el número de expertos, la dimensionalidad oculta ni el tipo de atención. Se trata de un modelo de 67.078.876.160 parámetros totales alojado en un repositorio de 268,3 GB, lo que equivale a unos 4 bytes por parámetro y sugiere que el repositorio podría incluir pesos en mayor precisión o artefactos adicionales; este extremo no está confirmado en la documentación.

El entrenamiento se enmarca en un pipeline de aprendizaje por refuerzo (pipeline declarado: `reinforcement-learning`) sobre problemas matemáticos. La ruta del artefacto de origen incluida en la card, `rl-snowball-e11-rno2a-deepscaler-dapo-ct-20260818-200437-f5273b/exports/global_step_24/policy/`, menciona DeepScaleR y DAPO, lo que sugiere que esos conjuntos o recetas formaron parte de la mezcla de RL, aunque la composición exacta del dataset, el número de tokens y las etapas previas de preentrenamiento no están disponibles. Tampoco se documentan fases de RLHF o DPO fuera del bucle de RL con recompensa verificable.

La innovación técnica destacable, y a la vez su principal caveat, es el tratamiento del router: el checkpoint se exportó con el sesgo del router congelado, y la model card subraya que la utilidad del artefacto depende de que se preserve esa integridad. Exportaciones con router mutable del mismo campaña pueden colapsar en inferencia, de modo que cualquier conversión o reempaquetado debe mantener `config.json`, los ficheros del tokenizer y todos los shards referenciados por `model.safetensors.index.json` de forma conjunta.

## Capacidades

- Razonamiento matemático: es la capacidad central del checkpoint, evaluada en AIME24, MATH-500 y OlympiadBench.
- Generación de texto orientada a la resolución de problemas, derivada de un entrenamiento con refuerzo sobre matemáticas; no se documenta formato de prompt ni plantilla de chat.
- Razonamiento multi-paso en el dominio matemático, implícito en los conjuntos de evaluación utilizados (AIME y OlympiadBench requieren cadenas de deducción largas).
- Soporte de tool calling o function calling: no disponible en la documentación.
- Soporte de agentes y planificación multi-paso fuera del dominio matemático: no disponible en la documentación.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Modo de pensamiento explícito (thinking mode), visión o audio: no disponible en la documentación.
- Estado de router congelado: característica técnica relevante para reproducibilidad, no una capacidad funcional de cara al usuario.

## Casos de uso

- Reproducción de experimentos de RL para matemáticas: el checkpoint reproduce una fila concreta del informe de la campaña Snowball, con resultados registrados en AIME24, MATH-500 y OlympiadBench, lo que permite verificar el pipeline completo partiendo del mismo artefacto.
- Investigación sobre routers en MoE: al ser una exportación con sesgo de router congelado, sirve como referencia para estudiar por qué las exportaciones con router mutable colapsan en inferencia y qué condiciones de integridad son necesarias.
- Generación de datos matemáticos sintéticos: puede producir soluciones y demostraciones que después se filtran con un verificador simbólico o un comprobador de respuestas, dado que el modelo está especializado en este dominio pero sigue siendo propenso a errores de cálculo y de razonamiento.
- Destilación hacia modelos pequeños: al ser un MoE con unos 67.000 millones de parámetros totales y, presumiblemente, una fracción pequeña activa por token, es un candidato razonable para generar trazas de razonamiento destinadas al entrenamiento de modelos desplegables.
- Punto de partida para RL adicional: el paso 24 de la campaña puede usarse como política inicial de un nuevo bucle de RL, siempre que se mantenga el estado del router y se respete el formato de entrenamiento original.
- Evaluación comparativa de suites matemáticas: sirve como referencia fija de un punto de entrenamiento concreto al comparar cambios en el algoritmo de RL, en la mezcla de datos o en el verificador de recompensas.
- Estudio de robustez y evaluación: permite analizar la brecha entre resultados en AIME24 (20,00), MATH-500 (72,80) y OlympiadBench (19,33), útil para investigar contaminación de benchmarks y sensibilidad al formato de prompt.
- Apoyo educativo con verificación humana: generación de borradores de soluciones de nivel de competición que un docente revisa; el aviso de artefacto de investigación impide usarlo de forma autónoma frente a estudiantes.

## Benchmarks y rendimiento

Resultados publicados en la model card para el conjunto reservado (held-out):

| Benchmark | Resultado |
|---|---|
| AIME24 | 20,00 |
| MATH-500 | 72,80 |
| OlympiadBench | 19,33 |

Estos valores corresponden al mejor checkpoint del brazo E11 según tres suites, con paso 24, tal y como se declara en la model card. Las advertencias y matices de evaluación están recogidos en `MATH_EVALS.md`, dentro del archivo de evidencias enlazado más abajo. No se han publicado en la información disponible resultados de otros benchmarks como MMLU, HumanEval o GSM8K, ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 134 GB solo para pesos, más caché KV (no cuantificable sin conocer la longitud de contexto y el número de capas). Requiere al menos 2 GPU de 80 GB o 4 GPU de 40 GB.
- VRAM estimada si se parte del tamaño completo del repositorio (268,3 GB, unas 4 veces el número de parámetros en bytes): haría falta un nodo de 8 GPU de 80 GB para cargarlo tal cual. No está confirmado si ese tamaño se debe a pesos en mayor precisión o a artefactos adicionales.
- Cuantización a 8 bits: alrededor de 67 GB de pesos; viable en 1 GPU de 80 GB (H100, A100 80 GB) o en 2 GPU de 40 GB.
- Cuantización a 4 bits: alrededor de 34 GB de pesos; viable en una GPU de 48 GB (RTX 6000 Ada, L40S) o repartido entre 2 GPU de 24 GB. La arquitectura MoE personalizada (grug_moe) puede no ser soportada por las herramientas de cuantización habituales.
- GPU consumer: una RTX 4090 de 24 GB no es suficiente ni a 4 bits para el modelo completo; sería necesario repartir entre dos tarjetas o usar el modelo como referencia remota. No se dispone de datos de cuantizaciones probadas en consumer.
- Opciones de despliegue: vLLM, SGLang y TGI soportan arquitecturas MoE estándar, pero grug_moe es una arquitectura propia del ecosistema Marin y no hay confirmación de soporte en esos frameworks. La opción documentada es cargar el checkpoint con el stack de Marin/SkyRL preservando `config.json`, el tokenizer y los shards del índice.
- Latencia y throughput: no disponible. No se publican medidas de tokens por segundo ni de tiempo hasta el primer token.
- Almacenamiento: 268,3 GB para el repositorio completo, más espacio adicional para caché de compilación y estados de entrenamiento si se continúa el RL.

## Comparativa con modelos similares

No se dispone de datos comparativos de benchmarks para este modelo, y sus características de arquitectura (grug_moe) y su naturaleza de artefacto de investigación dificultan una comparación directa. La tabla siguiente compara únicamente órdenes de magnitud de parámetros, arquitectura y licencia con otros modelos MoE abiertos de uso común. Los datos de los modelos alternativos provienen de conocimiento general y no de la información proporcionada para esta ficha, por lo que deben verificarse en sus fichas oficiales antes de citarlos.

| Modelo | Parámetros totales (aprox.) | Parámetros activos (aprox.) | Arquitectura | Licencia | Contexto |
|---|---|---|---|---|---|
| Snowball-67B-A2B-Math-RL-E11-Step24 | 67.080 millones (dato real) | No confirmado (~2.000 millones según el nombre) | MoE propia (grug_moe) | other (sin detalle) | No disponible |
| Qwen3-30B-A3B | 30.500 millones | 3.300 millones | MoE transformer | Apache 2.0 | Consultar ficha oficial |
| Mixtral 8x7B | 46.700 millones | 12.900 millones | MoE transformer | Apache 2.0 | Consultar ficha oficial |

Diferencias relevantes: los dos modelos alternativos tienen licencias permisivas y soporte amplio en frameworks de inferencia, mientras que este checkpoint se distribuye con licencia "other" y con requisitos de integridad del router que limitan su portabilidad. Como contrapartida, este artefacto documenta de forma explícita su procedencia (brazo E11, paso 24, ruta S3 de origen) y sus resultados en tres suites matemáticas, algo poco habitual en checkpoints de investigación.

## Limitaciones y advertencias

- Artefacto de investigación, no un producto: la propia model card indica que la utilidad del checkpoint es limitada salvo que se preserve la reparación del sesgo del router o su integridad congelada.
- Fragilidad del router: otras exportaciones de nombre parecido con router mutable pueden colapsar en inferencia; no deben sustituirse entre sí.
- Licencia restrictiva o indeterminada: la licencia es "other" y no se detallan condiciones, por lo que el uso comercial no está garantizado y requiere consulta previa.
- Sesgos conocidos: no disponible; no se documenta ninguna evaluación de sesgos, toxicidad o seguridad.
- Riesgo de alucinación: alto en tareas de demostración matemática larga; los propios resultados de OlympiadBench (19,33) y AIME24 (20,00) muestran una tasa de fallo elevada en problemas de competición.
- Posible contaminación de benchmarks: no se documenta el proceso de deduplicación frente a AIME24, MATH-500 u OlympiadBench, por lo que los resultados deben interpretarse con cautela.
- Limitaciones de contexto e idioma: se desconoce la ventana de contexto y los idiomas soportados; no se debe asumir un rendimiento multilingüe.
- Sin formato de prompt documentado: no se publica plantilla de chat ni formato de instrucción, lo que complica la integración directa en aplicaciones.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de redactar esta ficha, sin issues ni discusiones públicas asociadas.
- Coste de almacenamiento y despliegue elevado: 268,3 GB de repositorio y un modelo de 67.000 millones de parámetros que no cabe en una GPU consumer.
- Compatibilidad de herramientas: al usar una arquitectura MoE propia, es probable que las herramientas estándar de cuantización y de inferencia (llama.cpp, Ollama, GPTQ, AWQ) no funcionen sin trabajo de adaptación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-Math-RL-E11-Step24
- Issue del experimento en el repositorio de Marin: https://github.com/marin-community/marin/issues/7786
- Archivo de evidencias (dataset con `MATH_EVALS.md` y artefactos): https://huggingface.co/datasets/penfever/snowball-67b-a2b-math-rl-artifacts
- Artefacto de origen citado en la card (ruta S3, no accesible públicamente por HTTP): `s3://marin-us-east-02a/marin/users/benjaminfeuer/skyrl/rl-snowball-e11-rno2a-deepscaler-dapo-ct-20260818-200437-f5273b/exports/global_step_24/policy/`
- Nota sobre la búsqueda web: los resultados recuperados no guardan relación con este modelo (corresponden a portales corporativos y a resultados deportivos), por lo que no se incluye ningún enlace adicional procedente de esa búsqueda.
