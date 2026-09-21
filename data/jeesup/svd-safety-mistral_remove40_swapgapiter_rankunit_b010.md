# Jeesup/svd-safety-mistral_remove40_swapgapiter_rankunit_b010

## Resumen

svd-safety-mistral_remove40_swapgapiter_rankunit_b010 es un checkpoint derivado de mistralai/Mistral-7B-Instruct-v0.2, publicado por el usuario Jeesup, que combina dos intervenciones sobre el modelo original: una compresion mediante SVD-LLM que elimina el 40,02% de los parametros de proyeccion y una edicion posterior de parametros mediante 10 rondas iterativas de intercambio neutro ("parameter-neutral swap") seleccionadas con la regla `gap_iter`. El resultado declara una fraccion de parametros densos de 0,5998 respecto al modelo de partida y un presupuesto de restauracion del 1,000% de los parametros densos, con 5.026 componentes restaurados y 5.026 sustituidos.

El modelo no es un asistente de proposito general ni un chatbot desplegable: el propio autor lo describe como un artefacto de investigacion ("research artifact") cuyo objetivo es medir el deterioro del comportamiento de seguridad provocado por la compresion SVD y evaluar que regla de seleccion de componentes repara mejor ese dano. Forma parte de una rejilla experimental sobre reglas de seleccion y presupuestos, y varias de las celdas de esa rejilla estan deliberadamente degradadas en seguridad respecto al modelo base.

Su relevancia es por tanto metodologica: aporta cifras medibles de compromiso entre seguridad y utilidad bajo compresion (ASR de AdvBench, ASR de StrongREJECT, tasa de sobrerrechazo macro y perplejidad en WikiText-2), y sirve como sujeto experimental reproducible (semilla 42) para estudios de interpretabilidad, compresion y alineacion. La arquitectura subyacente es la del transformer decoder-only denso de Mistral-7B-Instruct-v0.2, heredada sin cambios estructurales mas alla de la compresion de rangos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de mistralai/Mistral-7B-Instruct-v0.2; no se detalla en la model card) |
| Parametros totales | 7.241.732.096 segun safetensors del repositorio; la model card declara una fraccion de parametros densos resultante de 0,5998 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no declarada en la model card ni en los tags) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (campo de idiomas vacio en el repositorio) |
| Licencia | Apache-2.0 (el repositorio del modelo base no incluye fichero de licencia para redistribuir; la licencia indicada gobierna este derivado) |
| Formato de pesos | safetensors (libreria transformers; tag text-generation-inference y endpoints_compatible) |
| Tamano del repositorio | 14,5 GB |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.2 |
| Pipeline | text-generation |
| Semilla | 42 |

## Arquitectura y entrenamiento

El checkpoint parte de Mistral-7B-Instruct-v0.2 y no se entrena desde cero: se le aplica compresion SVD-LLM que retira el 40,02% de los parametros de proyeccion, dejando una fraccion densa resultante de 0,5998. Sobre ese modelo comprimido se aplica una edicion de parametros en 10 rondas iterativas (10 de 10 aplicadas), cada una con un bloque del 0,100% de los parametros densos, hasta un presupuesto total del 1,000% de los parametros densos. En total se intercambian 5.026 componentes (restaurados y sustituidos en igual numero) y se insertan 69.729.280 parametros, equivalentes al 1,00% de los parametros de proyeccion densos.

La seleccion de que componentes se sustituyen en cada ronda la determina la regla `gap_iter`; el valor de intercambio es `insert` (solo valor de insercion) con desalojo ordenado por sigma. La model card no documenta la composicion del dataset de entrenamiento, el numero de tokens ni fases de RLHF o DPO, porque no hay entrenamiento nuevo: la innovacion tecnica del artefacto es precisamente el procedimiento de reparacion de seguridad posterior a la compresion, evaluado de forma sistematica sobre una rejilla de reglas de seleccion y presupuestos.

## Capacidades

- Generacion de texto conversacional como capacidad heredada del modelo base; no se documentan evaluaciones especificas de calidad de generacion mas alla de la perplejidad en WikiText-2 (10,7004).
- Razonamiento, codigo y matematicas: no se documentan mediciones en la informacion disponible; cualquier capacidad heredada debe verificarse empiricamente porque el checkpoint esta comprimido al 60% de parametros de proyeccion.
- Tool calling o function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Capacidades multilingues: no disponible (el repositorio no declara idiomas).
- Capacidad especial: el modelo esta disenado como sujeto experimental para medir el dano de seguridad por compresion y la recuperacion mediante edicion de parametros, con metricas de tasa de exito de ataque y de sobrerrechazo.

## Casos de uso

- Reproduccion de estudios de compresion: dado que la ficha fija semilla (42), presupuesto (1,000%), rondas (10) y regla de seleccion (`gap_iter`), el checkpoint permite replicar la celda exacta de la rejilla y compararla con otras reglas bajo las mismas condiciones.
- Evaluacion de seguridad bajo compresion: sirve para medir como varia la tasa de exito de ataque (AdvBench 0,0596 y StrongREJECT 0,2173 con juez HarmBench) al retirar el 40,02% de parametros de proyeccion, y para cuantificar cuanto recupera la edicion posterior.
- Analisis del equilibrio seguridad/utilidad: la pareja de metricas ASR y sobrerrechazo macro (0,1417 medido con WildGuard) permite estudiar si la reparacion de seguridad se paga con un aumento del rechazo de peticiones benignas.
- Investigacion de interpretabilidad de componentes: los 5.026 componentes restaurados y 5.026 sustituidos, junto con el desalojo ordenado por sigma, permiten analizar que subconjuntos de pesos concentran el comportamiento de seguridad.
- Evaluacion de perplejidad como control de calidad de la compresion: el valor de 10,7004 en WikiText-2 se puede usar como referencia para descartar que una mejora de seguridad provenga de un colapso general del modelo.
- Pruebas de pipelines de servicio: al ser compatible con text-generation-inference y endpoints, se puede desplegar como carga sintetica en pruebas de infraestructura de inferencia sin usarlo como asistente real.
- Red teaming y generacion de conjuntos de prueba: sus fallos de seguridad conocidos lo hacen util para calibrar jueces automaticos (HarmBench, WildGuard) y para construir casos adversarios controlados.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / metodo |
|---|---|---|
| AdvBench ASR | 0,0596 | HarmBench judge |
| StrongREJECT ASR | 0,2173 | HarmBench judge |
| Sobrerrechazo macro | 0,1417 | WildGuard |
| Perplejidad WikiText-2 | 10,7004 | no especificado en la ficha |

No se proporcionan en la informacion disponible los valores equivalentes del modelo base Mistral-7B-Instruct-v0.2 ni de otras celdas de la rejilla, por lo que no es posible presentar una comparacion numerica fiable dentro de esta ficha. La model card advierte explicitamente de que la compresion por si sola eleva la tasa de exito de ataque y de que algunas celdas de la rejilla estan degradadas a proposito.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 14,5 GB solo para pesos (7.241.732.096 parametros a 2 bytes), mas cache KV; en la practica se recomienda reservar 16-18 GB.
- VRAM estimada en INT8: aproximadamente 7,3 GB de pesos, con margen de 9-10 GB contando cache.
- VRAM estimada en INT4: aproximadamente 3,7-4,0 GB de pesos, con margen de 5-6 GB contando cache. Estas cifras son estimaciones derivadas del recuento de parametros; no hay cuantizaciones publicadas por el autor.
- GPU profesionales: A100 40/80 GB, H100 80 GB y L40S 48 GB ejecutan el modelo en FP16 sin problema y con margen para lotes grandes.
- GPU de consumo: RTX 4090 o RTX 3090 (24 GB) permiten FP16 con contexto moderado; RTX 4080/4070 Ti (16 GB) quedan al limite en FP16 y son mas seguras en INT8 o INT4; RTX 4060 Ti 16 GB y RTX 3060 12 GB requieren cuantizacion.
- Opciones de despliegue: transformers (libreria declarada en el repositorio) y text-generation-inference (tags `text-generation-inference` y `endpoints_compatible`). vLLM y Ollama no estan confirmados por el autor; llama.cpp exigiria una conversion a GGUF que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de seguridad |
|---|---|---|---|---|---|
| svd-safety-mistral_remove40_swapgapiter_rankunit_b010 (este checkpoint) | 7.241.732.096 en safetensors; fraccion densa declarada 0,5998 | no disponible | Apache-2.0 | HuggingFace, 0 descargas y 0 likes | AdvBench ASR 0,0596; StrongREJECT ASR 0,2173; sobrerrechazo 0,1417; PPL WikiText-2 10,7004 |
| mistralai/Mistral-7B-Instruct-v0.2 (modelo base) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada (el autor indica que su repositorio no incluye fichero de licencia para redistribuir) | HuggingFace | no disponible en la informacion proporcionada |
| Otras celdas de la rejilla del mismo autor | no disponible | no disponible | no disponible | no identificadas en la informacion proporcionada | no disponible |
| Otros modelos comprimidos de 7B | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye resultados de benchmarks del modelo base ni de alternativas comparables, por lo que no se puede establecer una comparacion cuantitativa. Cualquier comparacion deberia hacerse midiendo el modelo base y las demas celdas con el mismo arnes de evaluacion.

## Limitaciones y advertencias

- Artefacto de investigacion, no un asistente desplegable: la model card pide tratarlo como sujeto experimental y evaluarlo antes de extraer conclusiones.
- Seguridad degradada de forma medible: tasa de exito de ataque de 0,0596 en AdvBench y 0,2173 en StrongREJECT; el autor senala que la compresion por si sola aumenta la tasa de exito de ataque.
- Riesgo de sobrerrechazo: 0,1417 de sobrerrechazo macro medido con WildGuard, lo que implica rechazo de peticiones legitimas.
- Riesgo de alucinacion: no documentado especificamente, pero la perplejidad de 10,7004 en WikiText-2 es notablemente superior a la de un modelo sin comprimir, lo que sugiere degradacion de la modelizacion del lenguaje.
- Idiomas: no declarados, por lo que no hay garantia de comportamiento multilingue ni de cobertura fuera del ingles.
- Contexto: no declarado en la ficha; no se puede asumir ninguna ventana concreta sin verificarla.
- Sin versiones cuantizadas publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de gama media.
- Licencia: el derivado se publica bajo Apache-2.0, pero el autor advierte de que el repositorio del modelo base no incluye fichero de licencia para redistribuir; conviene revisar la situacion antes de un uso comercial.
- Adopcion nula: 0 descargas y 0 likes, sin validacion externa de las metricas declaradas.
- No hay datos de entrenamiento, tokens, RLHF ni DPO que auditar, ya que no existe entrenamiento nuevo en este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mistral_remove40_swapgapiter_rankunit_b010
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Paper, blog, repositorio o demo adicionales: no disponibles. La busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos corresponden a paginas corporativas de una entidad bancaria sin relacion con el modelo).
