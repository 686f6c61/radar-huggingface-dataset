# open-athena/Snowball-67B-A2B-Math-RL-Hero-v3i-Step8

## Resumen

Snowball-67B-A2B-Math-RL-Hero-v3i-Step8 es un checkpoint de investigacion publicado por open-athena dentro de la campana "Snowball" del proyecto Marin. Se trata de un modelo de mezcla de expertos (MoE, con etiqueta tecnica grug_moe) de 67.078.876.160 parametros totales (aproximadamente 67,1 B), entrenado con aprendizaje por refuerzo sobre tareas de matematicas con recompensa verificable (RLVR) y distribuido como artefacto de investigacion, no como version de produccion. El propio autor lo declara asi de forma explicita y advierte de que su utilidad esta limitada salvo que se preserve la integridad del router congelado.

El interes de esta publicacion es doble. Por un lado, documenta un punto concreto de una curva de aprendizaje por refuerzo (el paso 8 de la variante hero-v3i) con puntuaciones registradas sobre conjuntos reservados: AIME24 (17,00), MATH-500 (72,20) y OlympiadBench (17,67). Por otro, fija un estado de router congelado (frozen router bias) que, segun el autor, es imprescindible para que el modelo no colapse durante la inferencia; repositorios de nombre parecido como laion/rl-snowball-* pueden contener exportaciones con router mutable y no son equivalentes.

No se dispone de informacion sobre idiomas soportados, tipos de cuantizacion, longitud de contexto oficial ni composicion del dataset de entrenamiento. La nomenclatura "A2B" y el identificador ctx10k presente en la ruta del artefacto de origen sugieren, respectivamente, un subconjunto reducido de parametros activos y un contexto de entrenamiento de 10.000 tokens, pero ninguno de esos extremos esta confirmado en los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE); etiqueta tecnica grug_moe; familia Marin/Snowball |
| Parametros totales | 67.078.876.160 (aprox. 67,1 B), dato real de safetensors |
| Parametros activos | no disponible (la nomenclatura A2B sugiere un subconjunto reducido de parametros activos, sin confirmar) |
| Longitud de contexto | no disponible (el artefacto de origen incluye el identificador ctx10k, lo que sugiere entrenamiento a 10.000 tokens) |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | other (los terminos concretos no se detallan en la informacion disponible) |
| Formato de pesos | safetensors, particionados en shards segun model.safetensors.index.json; repositorio de 134,2 GB |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos (MoE) identificada en los metadatos como grug_moe, integrada en el ecosistema Marin. El numero de expertos, el mecanismo de enrutamiento, el tipo de atencion y la dimension oculta no se detallan en la model card ni en la informacion disponible. El tamano del repositorio (134,2 GB) es coherente con un almacenamiento de los 67,1 B de parametros en precision de 16 bits.

El entrenamiento corresponde a un proceso de aprendizaje por refuerzo con recompensas verificables (RLVR) sobre matematicas, ejecutado con la infraestructura SkyRL y exportado desde la ruta s3://marin-us-east-02a/.../exports/global_step_8/policy/. El checkpoint corresponde al paso 8 de la variante hero-v3i; el paso 16 regresiono y fue descartado. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases previas de SFT o DPO. El elemento tecnico mas relevante es el estado de router congelado: el autor insiste en que debe conservarse config.json, los ficheros del tokenizer y todos los shards referenciados por model.safetensors.index.json de forma conjunta para que el artefacto sea utilizable.

## Capacidades

- Generacion de texto y resolucion de problemas matematicos, con especial enfasis en razonamiento matematico de competicion (AIME, MATH-500, OlympiadBench).
- Razonamiento guiado por recompensas verificables: el modelo fue optimizado con RLVR, es decir, con senales de recompensa basadas en la verificabilidad de la respuesta final.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documentan capacidades de agente ni de razonamiento multi-paso mas alla del propio razonamiento matematico.
- Capacidades multilingues: no disponible; no se declara ningun idioma soportado.
- No se documentan capacidades de vision, audio, modo de pensamiento explicito (thinking mode) ni decodificacion especulativa.

## Casos de uso

- Reproduccion de experimentos de RL sobre matematicas: el checkpoint incluye la ruta exacta del artefacto de origen y el paso concreto (step 8), lo que permite reconstruir la curva de entrenamiento y comparar con el paso 16, que regresiono.
- Investigacion sobre enrutamiento en MoE: al tratarse de un modelo con router congelado, sirve como caso de estudio para analizar como la congelacion del sesgo de enrutamiento afecta a la estabilidad en inferencia frente a exportaciones con router mutable.
- Evaluacion comparativa de checkpoints intermedios: las puntuaciones sobre AIME24, MATH-500 y OlympiadBench permiten situar el paso 8 dentro de la campana Snowball y estudiar el efecto del RL a lo largo del entrenamiento.
- Banco de pruebas interno de evaluacion matematica: el modelo puede usarse como sujeto de prueba en pipelines de evaluacion propios para MATH-500, verificando la reproducibilidad de las puntuaciones reportadas.
- Estudio de colapso de routers: comparar este artefacto con las exportaciones laion/rl-snowball-* permite caracterizar empiricamente el fallo descrito por el autor cuando el router es mutable.
- Punto de partida para experimentos posteriores de ajuste: al ser un checkpoint de investigacion con licencia other, puede servir como base interna para experimentos de fine-tuning o de RL adicional, siempre que se respeten los terminos de licencia.
- Analisis metodologico de RLVR: el modelo es un ejemplo documentado de aplicacion de recompensas verificables a un modelo MoE de gran tamano, util para estudiar estabilidad y rendimiento en este tipo de pipelines.

## Benchmarks y rendimiento

| Benchmark | Resultado (conjunto reservado) | Notas |
|---|---|---|
| AIME24 | 17,00 | Puntuacion reportada por el autor para el paso 8 de hero-v3i |
| MATH-500 | 72,20 | Puntuacion reportada por el autor para el paso 8 de hero-v3i |
| OlympiadBench | 17,67 | Puntuacion reportada por el autor para el paso 8 de hero-v3i |

El autor indica que el paso 16 regresiono respecto al paso 8, que fue seleccionado como el mejor checkpoint de la variante v3i. No se publican en la informacion disponible los valores numericos del paso 16 ni comparaciones con otros modelos. Las puntuaciones y las salvedades de evaluacion estan recogidas en el fichero MATH_EVALS.md del archivo de evidencias.

## Requisitos de hardware

- VRAM estimada con pesos en precision de 16 bits: aproximadamente 134 GB solo para los pesos, mas el coste de cache KV y activaciones; requiere inferencia multi-GPU.
- VRAM estimada en cuantizacion de 8 bits: en torno a 67 GB, viable en una GPU de 80 GB (H100, A100 80 GB) con margen limitado.
- VRAM estimada en cuantizacion de 4 bits: en torno a 34 GB; requeriria dos RTX 4090/3090 (48 GB combinados), una A6000 de 48 GB o descarga parcial a CPU. No cabe en una unica GPU de 24 GB.
- GPU recomendadas: H100 80 GB o A100 80 GB en configuracion multi-GPU para precision completa; A100 40 GB x4 o H100 80 GB x2 como minimo ajustado.
- No cabe en GPU de consumo en precision completa; en 4 bits es posible con multiples GPU de consumo o con offload a RAM, con la penalizacion de latencia correspondiente.
- Opciones de despliegue: vLLM, SGLang y TGI para servir el modelo en precision reducida; llama.cpp u Ollama solo si se genera previamente una conversion a GGUF, que no esta publicada. OpenVINO no esta documentado.
- Latencia y throughput estimados: no disponible. Al ser una arquitectura MoE con un subconjunto reducido de parametros activos (segun la nomenclatura A2B), el throughput por token podria ser mas alto de lo habitual para un modelo de 67 B totales, siempre que la implementacion de serving soporte enrutamiento eficiente.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este modelo con alternativas externas de la misma categoria, ya que no se publican datos de modelos comparables en la informacion proporcionada.

| Modelo | Parametros totales | Contexto | Resultados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Snowball-67B-A2B-Math-RL-Hero-v3i-Step8 | 67,1 B | no disponible (ctx10k en el artefacto de origen) | AIME24 17,00; MATH-500 72,20; OlympiadBench 17,67 | other | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| Snowball-67B-A2B hero-v3i step 16 | mismo modelo base | no disponible | regresion respecto al paso 8 (sin cifras publicadas) | other | exportacion interna; no publicado como artefacto independiente |
| Modelos externos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Artefacto de investigacion, no de produccion: el propio autor indica que su utilidad es limitada salvo que se preserve la reparacion del sesgo del router o la integridad del router congelado.
- Dependencia critica del estado del router: usar exportaciones con router mutable (por ejemplo, repositorios laion/rl-snowball-* de nombre parecido) puede provocar el colapso del modelo en inferencia.
- Integridad de los ficheros: deben conservarse juntos config.json, los ficheros del tokenizer y todos los shards listados en model.safetensors.index.json; sustituir o mezclar shards invalida el artefacto.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad ni de tasas de alucinacion; las puntuaciones disponibles son exclusivamente matematicas.
- Rendimiento matematico moderado: el 17,00 en AIME24 y el 17,67 en OlympiadBench indican una capacidad limitada en problemas de competicion de alta dificultad.
- Idiomas: no se declara ningun idioma soportado, por lo que no hay garantias de comportamiento multilingue ni de calidad en castellano.
- Contexto: la longitud de contexto oficial no esta publicada; el identificador ctx10k del artefacto de origen sugiere 10.000 tokens durante el entrenamiento, lo que limitaria tareas de contexto largo.
- Licencia: clasificada como other sin terminos detallados en la informacion disponible; no puede asumirse uso comercial libre.
- Ausencia de validacion externa: el repositorio no registra descargas ni likes, y las puntuaciones proceden del propio autor, con salvedades recogidas en MATH_EVALS.md.
- Sesgos: no se documenta ningun analisis de sesgos en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-Math-RL-Hero-v3i-Step8
- Archivo de evidencias (dataset): https://huggingface.co/datasets/penfever/snowball-67b-a2b-math-rl-artifacts
- Issue del experimento en el repositorio Marin: https://github.com/marin-community/marin/issues/7786
- Artefacto de origen (S3): s3://marin-us-east-02a/marin/users/benjaminfeuer/skyrl/rl-snowball-hero-v3i-rno2a-rlvrmath-ctx10k-grug-67-20260818-115251/exports/global_step_8/policy/
- Fichero de evaluaciones: MATH_EVALS.md (dentro del archivo de evidencias)
