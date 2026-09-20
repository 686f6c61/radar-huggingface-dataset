# open-athena/Snowball-67B-A2B-Math-RL-E18-Step8

## Resumen

Snowball-67B-A2B-Math-RL-E18-Step8 es un checkpoint de investigación publicado por el usuario open-athena dentro de la campana "Snowball", un experimento de aprendizaje por refuerzo (RL) sobre razonamiento matemático. No es un lanzamiento de produccion: la propia model card lo etiqueta como `research-artifact` y advierte de que su utilidad es limitada salvo que se preserve la integridad del router (sesgo congelado, sin deriva respecto al punto de partida de 5,7 T). Se trata del checkpoint exacto utilizado para una fila concreta del experimento, no de un modelo final pulido.

El nombre del repositorio indica 67B de parametros totales (confirmado por safetensors: 67.078.876.160) y el sufijo A2B apunta a un esquema de mezcla de expertos con aproximadamente 2B de parametros activos, coherente con el tag `grug_moe` incluido en el repositorio. Esta arquitectura dispersa es lo que hace viable servir un modelo de este tamano, ya que solo se activa una fraccion pequena de los pesos por token. El repositorio ocupa 134,2 GB y se distribuye exclusivamente en safetensors fragmentados.

Su relevancia actual es acotada pero concreta: sirve como punto de reproduccion para investigacion en RL con recompensas verificables sobre matematicas, y como referencia de integridad de router en modelos MoE entrenados con RL, un problema documentado en la propia model card al advertir de que otros repositorios con nombres parecidos (`laion/rl-snowball-*`) pueden contener exportaciones con router mutable que colapsan en inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE); inferida del tag `grug_moe` y del sufijo A2B, no confirmada explicitamente en la documentacion |
| Parametros totales | 67.078.876.160 (~67,1 B), dato real de los ficheros safetensors |
| Parametros activos | ~2 B, inferido de la nomenclatura A2B; no confirmado en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones declaradas) |
| Idiomas soportados | no disponible |
| Licencia | other (`license: other`); no se detallan terminos en la informacion proporcionada |
| Formato de pesos | safetensors, fragmentados e indexados por `model.safetensors.index.json` |
| Tamano del repositorio | 134,2 GB |
| Brazo y paso del experimento | Arm E18, Step 8 |
| Estado del router | Sesgo de router congelado, cero deriva respecto al inicio de 5,7 T |
| Etapa de entrenamiento | RL sobre matematicas (ruta de origen `...rlvrmath-frozen-sr-57t-agentic...`) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un transformer con mezcla de expertos, deducido de la nomenclatura 67B-A2B y del tag `grug_moe`. No se detallan el numero de expertos, el numero de expertos activados por token, la dimension oculta, el numero de capas ni el tipo de atencion. El elemento tecnico mas relevante y documentado es el estado del router: sesgo congelado y cero deriva frente al punto de partida de 5,7 T, lo que la model card presenta como garantia de integridad y como diferencia critica respecto a exportaciones de router mutable.

El entrenamiento es una fase de RL con recompensas verificables en matematicas (la ruta de origen contiene `rlvrmath`), partiendo de un checkpoint de 5,7 billones de tokens. La ruta tambien incluye el termino `agentic`, lo que sugiere un componente de generacion agentica durante el entrenamiento, aunque no se especifica el algoritmo (PPO, GRPO u otro), el numero de pasos totales ni la composicion del dataset. El checkpoint publicado corresponde al paso 8 del brazo E18 y fue seleccionado por ser el mejor de la campana en AIME24 y MATH-500 en valor absoluto.

## Capacidades

- Generacion de texto con enfasis en razonamiento matematico, derivado del objetivo de entrenamiento declarado (RL sobre matematicas) y de las evaluaciones publicadas en AIME24, MATH-500 y OlympiadBench.
- Resolucion de problemas matematicos de competicion a nivel de respuesta final, con resultados medidos en tres conjuntos de evaluacion externos.
- Razonamiento multi-paso, inferido del uso de RL con recompensas verificables sobre problemas matematicos y de la etiqueta `agentic` en la ruta del experimento.
- Tool calling / function calling: no disponible.
- Capacidades de agente en produccion: no disponible (la etiqueta `agentic` describe el proceso de entrenamiento, no una capacidad de integracion documentada).
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Modo de pensamiento explicito (thinking mode): no disponible.

## Casos de uso

- Reproduccion de experimentos de RL sobre matematicas: el checkpoint es el artefacto exacto de una fila concreta del experimento Snowball, por lo que sirve para verificar los resultados publicados de AIME24, MATH-500 y OlympiadBench bajo las mismas condiciones de evaluacion.
- Estudio de estabilidad del router en MoE entrenados con RL: al conservar el sesgo de router congelado con cero deriva respecto al inicio de 5,7 T, permite comparar el comportamiento de un router congelado frente a exportaciones de router mutable que colapsan en inferencia.
- Investigacion sobre recompensas verificables: util como punto de partida o de comparacion en estudios sobre RLVR aplicado a dominios con verificacion automatica, dado que el modelo procede de una campana con esa metodologia.
- Analisis de contaminacion y solapamiento de benchmarks: los tres conjuntos evaluados (AIME24, MATH-500, OlympiadBench) permiten estudiar la relacion entre seleccion de checkpoint por metrica absoluta y generalizacion, un aspecto que la propia model card remite a las advertencias de `MATH_EVALS.md`.
- Generacion de trazas de razonamiento para destilacion en investigacion: el modelo puede producir cadenas de razonamiento matematico que sirvan como datos de partida, siempre que el trabajo se limite a investigacion y se validen las trazas antes de reutilizarlas.
- Comparacion de arquitecturas dispersas: con ~2 B de parametros activos sobre 67,1 B totales, es un caso de estudio util para medir el coste real de servir un MoE grande en tareas de razonamiento especializado.
- Evaluacion de tecnicas de cuantizacion sobre MoE con router congelado: dado que no se publican cuantizaciones, es un candidato para experimentos academicos sobre hasta que punto se degrada el sesgo congelado del router al reducir precision.
- Auditoria de artefactos de investigacion: el repositorio y su archivo de evidencias asociado permiten practicar flujos de trazabilidad entre checkpoint, codigo de evaluacion y resultados declarados.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| AIME24 | 37,33 | Evaluacion con datos reservados (held-out) |
| MATH-500 | 83,00 | Evaluacion con datos reservados (held-out) |
| OlympiadBench | 13,33 | Evaluacion con datos reservados (held-out) |

Los tres valores proceden de la model card, que no explicita la unidad de medida; se presentan tal cual se publican. La seleccion del checkpoint se hizo por ser el mejor de la campana en AIME24 y MATH-500 en valor absoluto. La model card indica que los detalles y las advertencias de evaluacion estan recogidos en el fichero `MATH_EVALS.md` del archivo de evidencias; no se han proporcionado resultados de MMLU, HumanEval, GSM8K ni de comparativas contra otros modelos.

## Requisitos de hardware

- Pesos en precision de entrenamiento: el repositorio ocupa 134,2 GB, consistente con almacenamiento de 67,1 B de parametros en 16 bits. Se necesita ese espacio en disco o memoria agregada solo para cargar los pesos.
- VRAM estimada para inferencia sin cuantizar: del orden de 134 GB unicamente para pesos, mas cache KV y buffers de activaciones. En la practica exige agregacion de memoria en varias GPU.
- GPU recomendadas: configuraciones multi-GPU con 160-256 GB agregados, por ejemplo 2 x H100 80 GB, 2 x A100 80 GB o 4 x A6000 48 GB.
- Cabe en GPU de consumo: no en una sola unidad. Un 67 B en 16 bits no entra en 24 GB ni en 48 GB. Solo seria viable en GPUs de consumo mediante cuantizacion agresiva (4 bits teoricos, ~34 GB) repartida en varias tarjetas, y no hay cuantizaciones publicadas para este checkpoint.
- Opciones de despliegue: no confirmadas. La arquitectura `grug_moe` es personalizada y la model card no declara compatibilidad con vLLM, TGI, llama.cpp, Ollama ni ningun runtime concreto; debe asumirse que requiere el codigo de entrenamiento o inferencia del proyecto Marin. No hay ficheros GGUF publicados.
- Latencia y throughput: no disponibles como medicion publicada. Como referencia estructural, un MoE con ~2 B de parametros activos lee en torno a 4 GB por token en 16 bits, muy por debajo de los ~134 GB que leeria un modelo denso de 67 B, lo que en teoria permite tasas de decodificacion propias de un modelo mucho mas pequeno. Es una estimacion derivada, no un dato medido.
- Almacenamiento y red: el peso del repositorio (134,2 GB) y la fragmentacion en shards hacen que la carga inicial desde disco o red sea un coste relevante en cualquier despliegue.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados comparativos contra otros modelos de razonamiento matematico, ni se han encontrado referencias externas en la busqueda web realizada (los resultados devueltos correspondian a entidades sin relacion: portales corporativos, OpenOffice y un torneo de tenis).

Existe, no obstante, una advertencia interna del propio autor sobre artefactos con nombres similares:

| Artefacto | Relacion | Aviso del autor |
|---|---|---|
| `open-athena/Snowball-67B-A2B-Math-RL-E18-Step8` | Checkpoint de referencia | Sesgo de router congelado, cero deriva frente al inicio de 5,7 T |
| Repositorios `laion/rl-snowball-*` con nombres parecidos | Posible confusion | La model card indica que pueden contener exportaciones con router mutable que colapsan en inferencia; no deben sustituirse por este artefacto |

## Limitaciones y advertencias

- Es un artefacto de investigacion, no una version de produccion. La model card lo declara explicitamente y senala que su utilidad es limitada salvo que se preserve la reparacion del sesgo del router o la integridad del router congelado.
- Fragilidad del router: sustituir este checkpoint por exportaciones con router mutable, incluso con nombres casi identicos, puede provocar colapso en inferencia.
- Rendimiento desigual entre benchmarks: 83,00 en MATH-500 frente a 13,33 en OlympiadBench y 37,33 en AIME24. El rendimiento en problemas de nivel olimpiada es bajo y no debe extrapolarse el resultado de MATH-500 a matematicas de mayor dificultad.
- Seleccion de checkpoint por metrica: al haberse elegido por el mejor valor absoluto en AIME24 y MATH-500 dentro de la campana, existe riesgo de sobreajuste a esas dos metricas; la model card remite a las advertencias de evaluacion de `MATH_EVALS.md`.
- Licencia `other` sin terminos detallados en la informacion disponible: antes de cualquier uso comercial es obligatorio consultar las condiciones reales del repositorio. No puede asumirse uso comercial permitido.
- Idiomas soportados no declarados: se desconoce el comportamiento fuera del ingles tecnico de los benchmarks.
- Longitud de contexto no declarada: no puede planificarse un caso de uso con contexto largo sin verificacion previa.
- Sin cuantizaciones publicadas: no hay GGUF, AWQ, GPTQ ni equivalentes, lo que dificulta el despliegue en hardware asequible y bloquea el uso en herramientas como Ollama o llama.cpp.
- Riesgo de alucinacion: no evaluado en la informacion disponible. En tareas matematicas, un fallo de razonamiento puede producir una respuesta final incorrecta presentada con apariencia de solidez, por lo que se requiere verificacion automatica o humana.
- Sesgos: no se han publicado analisis de sesgo, toxicidad o comportamiento en dominios sensibles.
- Adopcion nula hasta la fecha: 0 descargas y 0 likes, sin senales de uso en la comunidad ni de mantenimiento posterior.
- Integridad del directorio de pesos: la model card exige conservar juntos `config.json`, los ficheros del tokenizer y todos los shards nombrados por `model.safetensors.index.json`; separarlos o renombrarlos puede invalidar el artefacto.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-Math-RL-E18-Step8
- Archivo de evidencias y evaluaciones: https://huggingface.co/datasets/penfever/snowball-67b-a2b-math-rl-artifacts
- Issue del experimento en el repositorio Marin: https://github.com/marin-community/marin/issues/7786
- Ruta de origen del artefacto: `s3://marin-us-east-02a/marin/users/benjaminfeuer/skyrl/rl-snowball-e18-rno2a-rlvrmath-frozen-sr-57t-agentic-20260826-102929/exports/global_step_8/policy/`
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su arquitectura o su campana de entrenamiento.
