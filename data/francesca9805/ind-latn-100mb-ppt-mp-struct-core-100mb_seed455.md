# francesca9805/ind-latn-100mb-ppt-mp-struct-core-100mb_seed455

## Resumen

El modelo `francesca9805/ind-latn-100mb-ppt-mp-struct-core-100mb_seed455` es un ajuste fino (SFT) del modelo base `goldfish-models/ind_latn_100mb`, publicado por el usuario francesca9805. Se trata de un modelo de generacion de texto de arquitectura GPT-2 con 124.770.816 parametros (aproximadamente 125 millones), un tamano propio de la categoria "small" que lo situa en el rango de modelos ejecutables en CPU o en cualquier GPU de consumo. El repositorio ocupa 0,3 GB y los pesos se distribuyen exclusivamente en formato safetensors.

El modelo se ha entrenado con la libreria TRL (version 0.23.0) mediante aprendizaje supervisado (SFT), segun indica su model card. El nombre del repositorio incluye fragmentos como `ppt-mp-struct-core-100mb` y `seed455`, y el proyecto de Weights & Biases asociado se denomina `new-tokenizers`, lo que apunta a experimentos academicos sobre tokenizacion y estructura de datos de entrenamiento, mas que a un modelo pensado para produccion. El propio autor no declara licencia, idiomas soportados ni resultados de evaluacion.

La relevancia de esta ficha es acotada y conviene ser honesto al respecto: se trata de un artefacto de investigacion sin descargas ni "likes" en el momento de su publicacion, con documentacion minima y sin benchmarks publicados. Su interes principal esta en el ecosistema de modelos pequenos multilingues (familia Goldfish) y en la reproducibilidad de experimentos de SFT sobre modelos de 100 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), segun el tag `gpt2` |
| Parametros totales | 124.770.816 (dato real de los safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; la configuracion estandar de GPT-2 es de 1.024 tokens |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos safetensors |
| Idiomas soportados | no disponible; el nombre del modelo base (`ind_latn`) sugiere indonesio en grafia latina |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin concretar) |
| Formato de pesos | safetensors |
| Modelo base | goldfish-models/ind_latn_100mb |
| Tamano del repositorio | 0,3 GB |
| Metodo de entrenamiento | SFT con TRL 0.23.0 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2, un transformer decoder-only con atencion causal completa. Con 124,77 millones de parametros, la configuracion tipica de este tamano es de 12 capas, 768 dimensiones de embedding y 12 cabezas de atencion, aunque la model card no detalla la configuracion exacta ni el contexto maximo utilizado durante el entrenamiento. Hereda la arquitectura y el vocabulario del modelo base `goldfish-models/ind_latn_100mb`, que pertenece a la familia Goldfish de modelos monolingues de aproximadamente 100 MB por idioma.

El entrenamiento se ha realizado mediante SFT (supervised fine-tuning) con TRL, sobre el framework Transformers 4.56.2, PyTorch 2.5.1+cu121 y Datasets 4.8.4. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, la semilla efectiva ni si hubo etapas posteriores de alineacion como RLHF o DPO. El autor enlaza una ejecucion de Weights & Biases (`f-padovani-university-of-groningen/new-tokenizers`) de la que no se extraen detalles adicionales en la informacion disponible. No se documenta ninguna innovacion tecnica (atencion lineal, decodificacion especulativa, MoE o arquitecturas hibridas).

## Capacidades

- Generacion de texto autoregresiva basica, en la linea de un GPT-2 de 125 millones de parametros.
- Ajuste con formato conversacional: el ejemplo de la model card usa `pipeline` con una lista de mensajes con rol `user`, lo que indica que el ajuste SFT empleo plantillas de chat.
- Integracion directa con `transformers` y compatibilidad declarada con `text-generation-inference` y `endpoints_compatible`.
- Capacidad multilingue: no documentada. El modelo base apunta al indonesio en grafia latina, pero el autor no confirma el alcance idiomatico del ajuste.
- Tool calling / function calling: no documentado.
- Razonamiento multi-paso y uso como agente: no documentado; por tamano y naturaleza del ajuste, no es un escenario esperable.
- Capacidades de vision o audio: no disponibles.
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso

- Investigacion sobre tokenizacion: el proyecto de W&B se llama `new-tokenizers` y el nombre del repositorio incluye variantes como `ppt-mp-struct-core`, lo que sugiere su uso como punto de comparacion en experimentos sobre vocabularios y segmentacion de texto.
- Reproducibilidad de experimentos de SFT: sirve como referencia para replicar un ajuste supervisado sobre un modelo de 100 MB con TRL, comparando semillas (el identificador `seed455` invita a ello).
- Generacion de texto en indonesio de bajo coste: si se confirma el idioma del modelo base, puede emplearse para prototipos de generacion de texto en ese idioma sin infraestructura GPU.
- Despliegue en dispositivos con recursos minimos: con menos de 300 MB en fp16, es viable en CPU, Raspberry Pi o moviles mediante conversion a GGUF, para tareas de autocompletado o generacion corta.
- Aumento de datos para entrenamiento: generar continuaciones sinteticas de texto como paso previo a curar un corpus mayor, siempre con revision humana por el riesgo de alucinacion.
- Docencia y experimentacion: entorno barato para que estudiantes observen el comportamiento de un transformer pequeno ajustado con SFT, incluidos sus fallos tipicos.
- Evaluacion de infraestructura: banco de pruebas para probar pipelines de `text-generation-inference`, vLLM o llama.cpp con un modelo diminuto antes de escalar a modelos grandes.
- Analisis de sesgos de modelos multilingues pequenos: util como caso de estudio en auditorias de sesgo en lenguas de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, perplexity ni evaluaciones de la familia Goldfish o FLORES, y el repositorio no enlaza ninguna evaluacion independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 alrededor de 500 MB; en fp16/bf16 alrededor de 250 MB; en int8 alrededor de 125 MB; en int4 alrededor de 70-90 MB mas el overhead del runtime (estimaciones derivadas del numero de parametros, no medidas publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo esta muy por debajo de la capacidad de cualquier acelerador moderno.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo de los ultimos diez anos, e incluso en graficos integrados.
- Ejecucion en CPU: viable; es uno de los escenarios naturales para un modelo de este tamano.
- Opciones de despliegue: `transformers` con `pipeline` (ruta documentada por el autor), `text-generation-inference` y endpoints compatibles (etiquetas declaradas). Para llama.cpp, Ollama o LM Studio seria necesario convertir primero los pesos safetensors a GGUF, ya que el repositorio no incluye cuantizaciones.
- vLLM: tecnicamente compatible por tratarse de un modelo GPT-2 estandar, aunque no esta verificado en la informacion proporcionada.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia en ninguna configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/ind-latn-100mb-ppt-mp-struct-core-100mb_seed455 | 124,77 M | no disponible (1.024 en GPT-2 estandar) | no disponible | HuggingFace, safetensors, 0 descargas | Ajuste SFT de un modelo Goldfish de 100 MB |
| goldfish-models/ind_latn_100mb | ~100 MB de datos de entrenamiento (parametros no indicados en la informacion disponible) | no disponible | no disponible en esta ficha | HuggingFace | Modelo base sin ajuste supervisado; familia monolingue multilingue |
| GPT-2 small (openai-community/gpt2) | 124 M | 1.024 tokens | MIT (segun su repositorio) | HuggingFace, safetensors y bin | Referencia canonica de la arquitectura; rendimiento multilingue limitado |
| SmolLM2-135M | 135 M | 2.048 tokens | Apache 2.0 (segun su repositorio) | HuggingFace | Alternativa moderna de tamano comparable, con datos de entrenamiento mucho mayores |

Los datos de rendimiento de los tres modelos comparados no se han facilitado en la informacion disponible, por lo que no se incluye ninguna comparacion numerica. Las cifras de licencia y contexto de GPT-2 small y SmolLM2-135M proceden de sus repositorios publicos y no de la informacion proporcionada en esta ficha.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna metrica publicada que permita estimar la calidad del ajuste frente al modelo base.
- Tamano muy reducido: con 125 millones de parametros, la capacidad de razonamiento, de seguir instrucciones complejas y de mantener coherencia en textos largos es limitada por construccion.
- Riesgo elevado de alucinacion: los modelos de esta escala generan texto plausible sin verificacion factual, especialmente fuera de los dominios vistos en el ajuste.
- Idiomas no declarados: el autor no especifica que lenguas cubre el modelo; inferir el indonesio a partir del nombre del modelo base es una hipotesis, no un dato confirmado. El soporte de castellano no esta documentado y es poco probable que sea solido.
- Contexto no confirmado: si se asume la ventana estandar de GPT-2 de 1.024 tokens, las conversaciones multi-turno largas se truncaran con rapidez.
- Licencia no disponible: al no concretarse la licencia, no hay autorizacion explicita para uso comercial. Conviene contactar con el autor y revisar tambien la licencia del modelo base antes de cualquier despliegue productivo.
- Procedencia academica: el nombre del repositorio y el proyecto de W&B indican un experimento de investigacion; no hay garantia de mantenimiento, correccion de errores ni soporte.
- Sesgos potenciales: al derivar de un corpus de 100 MB por idioma, es probable que reproduzca los sesgos y lagunas de ese corpus, sin que el autor documente ningun proceso de mitigacion.
- Datos de la model card minimos: no se indican tokens de entrenamiento, composicion del dataset, hiperparametros ni criterios de evaluacion, lo que dificulta auditar el modelo.
- Fecha de creacion inusual: el repositorio figura creado el 2026-10-09, dato cuando menos anómalo que conviene verificar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/ind-latn-100mb-ppt-mp-struct-core-100mb_seed455
- Modelo base: https://huggingface.co/goldfish-models/ind_latn_100mb
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/e1gn22fk
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper o blog del autor: no disponible
- Demo o Space asociado: no disponible
