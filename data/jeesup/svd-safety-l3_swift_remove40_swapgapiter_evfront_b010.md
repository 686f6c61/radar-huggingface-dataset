# Jeesup/svd-safety-l3_swift_remove40_swapgapiter_evfront_b010

## Resumen

svd-safety-l3_swift_remove40_swapgapiter_evfront_b010 es un checkpoint derivado de meta-llama/Meta-Llama-3-8B-Instruct, publicado por el usuario Jeesup, que combina dos transformaciones: una compresion mediante SVD-LLM que elimina el 39,97% de los parametros de proyeccion (dejando una fraccion resultante de 0,6003 respecto al denso) y una edicion posterior de parametros mediante 10 de 10 rondas de sustitucion iterativa seleccionadas con la regla `gap_iter`, con un presupuesto de restauracion del 1,000% de los parametros densos.

No es un modelo de proposito general. La propia model card lo describe explicitamente como un artefacto de investigacion sobre como la compresion SVD degrada el comportamiento de seguridad y que regla de seleccion de componentes lo repara mejor. Es una celda dentro de una rejilla (grid) de reglas de seleccion y presupuestos, y el autor advierte que varias ramas de esa rejilla estan deliberadamente degradadas en seguridad respecto al modelo base.

Su relevancia es metodologica: cuantifica el compromiso entre seguridad y utilidad bajo compresion, con metricas medidas de tasa de exito de ataque (AdvBench y StrongREJECT con juez HarmBench), sobrerrechazo macro (WildGuard) y perplejidad en WikiText-2. El checkpoint se distribuye en safetensors, ocupa 16,1 GB en el repositorio y declara 8.030.261.248 parametros totales segun los metadatos de safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), con matrices de proyeccion comprimidas por SVD-LLM y componentes sustituidos por la regla `gap_iter` |
| Parametros totales | 8.030.261.248 segun safetensors; la model card indica una fraccion resultante de 0,6003 tras eliminar el 39,97% de los parametros de proyeccion (los dos datos no coinciden entre si) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no especificada en la model card; heredada de meta-llama/Meta-Llama-3-8B-Instruct (8.192 tokens) |
| Tipos de cuantizacion | no disponible; el repositorio contiene pesos safetensors de 16,1 GB, consistente con fp16 |
| Idiomas soportados | no disponible en la model card; el modelo base declara soporte oficial para ingles y no oficial para otros idiomas |
| Licencia | Meta Llama 3 Community License (se incluyen LICENSE y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama-3-8B-Instruct, un transformer decoder-only denso. Sobre ella se aplica SVD-LLM, una tecnica de compresion basada en descomposicion en valores singulares que reduce el rango de las matrices de proyeccion; en esta celda concreta se elimina el 39,97% de los parametros de proyeccion. Despues, el checkpoint se edita con 10 rondas de sustitucion parametro-neutra (parameter-neutral swap) seleccionadas por la regla `gap_iter`, con un chunk del 0,100% de los parametros densos por ronda y un presupuesto total del 1,000%. Se restauran 10.915 componentes y se sustituyen 5.110, con 69.740.544 parametros insertados (1,00% de los parametros densos de proyeccion) y valor de sustitucion `insert` con desalojo ordenado por sigma. La semilla empleada es 42.

No hay un entrenamiento nuevo ni un ajuste con RLHF o DPO documentado: la intervencion es de edicion de parametros sobre un checkpoint ya instruido. Tampoco se documenta la composicion del dataset, porque no se entrena con datos. La innovacion tecnica es precisamente el procedimiento de reparacion post-compresion: medir la perdida de seguridad inducida por SVD y tratar de recuperarla insertando componentes seleccionados por una regla concreta, comparando celdas de una rejilla de reglas y presupuestos.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad de instruccion de Llama-3-8B-Instruct, aunque degradada por la compresion.
- Generacion de texto y continuacion de secuencias en ingles, con perplejidad medida de 35,9202 en WikiText-2.
- Modo conversacional: la model card la declara como tarea conversational y el pipeline es text-generation.
- Capacidades de seguridad evaluables: se han medido tasas de exito de ataque con AdvBench (0,0654) y StrongREJECT (0,1725) usando el juez HarmBench, y sobrerrechazo macro con WildGuard (0,0758).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; no debe asumirse.
- Capacidades multilingues: no documentadas; el modelo base solo declara soporte oficial para ingles.
- Vision, audio o modos de pensamiento explicito: no disponibles.
- Interpretabilidad y analisis de componentes: el checkpoint esta disenado para inspeccionar que componentes concretos (10.915 restaurados, 5.110 sustituidos) afectan al comportamiento de seguridad.

## Casos de uso

- Estudio de la degradacion de seguridad por compresion: comparar las tasas de exito de ataque de este checkpoint (0,0654 en AdvBench, 0,1725 en StrongREJECT) con las de Llama-3-8B-Instruct sin comprimir para cuantificar cuanto dano introduce SVD-LLM al eliminar el 39,97% de los parametros de proyeccion.
- Evaluacion de reglas de seleccion de componentes: usar esta celda como punto de la rejilla correspondiente a `gap_iter` con presupuesto del 1,000% y compararla con otras reglas del mismo estudio para determinar cual repara mejor la seguridad.
- Analisis de sobre-rechazo: emplear la metrica de sobrerrechazo macro de WildGuard (0,0758) para estudiar si la reparacion de seguridad reduce en exceso la utilidad conversacional.
- Investigacion de interpretabilidad de componentes: los identificadores de los 10.915 componentes restaurados y los 5.110 sustituidos permiten analizar que subconjuntos de pesos concentran el comportamiento de rechazo.
- Replicacion experimental: la semilla 42, el chunk por ronda del 0,100% y las 10 rondas quedan documentados, lo que permite reproducir el procedimiento en otras arquitecturas o tamanos.
- Medicion de calidad de lenguaje tras compresion: la perplejidad de 35,9202 en WikiText-2 sirve como referencia de cuanto se degrada el modelado del lenguaje antes y despues de la edicion de parametros.
- Docencia y divulgacion tecnica: como caso de estudio de por que un checkpoint comprimido y editado no debe desplegarse directamente, ilustrando el desacoplamiento entre metricas de utilidad y metricas de seguridad.

## Benchmarks y rendimiento

| Metrica | Valor | Metodo de evaluacion |
|---|---|---|
| AdvBench ASR | 0,0654 | Juez HarmBench |
| StrongREJECT ASR | 0,1725 | Juez HarmBench |
| Sobrerrechazo macro | 0,0758 | WildGuard |
| Perplejidad WikiText-2 | 35,9202 | WikiText-2 |

No se han publicado en la informacion disponible resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) para este checkpoint, ni los valores equivalentes del modelo base sin comprimir, por lo que no es posible calcular la delta de degradacion dentro de esta ficha.

## Requisitos de hardware

- VRAM para inferencia en fp16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda disponer de 20-24 GB.
- Cuantizacion a 8 bits: unos 8-9 GB de pesos; a 4 bits, unos 5-6 GB. No se documentan cuantizaciones publicadas para este checkpoint.
- GPU profesionales: A100 40/80 GB, H100, L40S sin problemas en fp16.
- GPU de consumo: RTX 4090 o RTX 3090 (24 GB) pueden alojarlo en fp16; RTX 4080/4070 Ti (16 GB) quedan al limite; RTX 3060 12 GB o RTX 4070 12 GB requeririan cuantizacion a 8 o 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference y endpoints_compatible segun las etiquetas del repositorio; vLLM es plausible pero no esta confirmado; llama.cpp y Ollama requeririan conversion a GGUF, no publicada.
- Advertencia de compatibilidad: al tratarse de un checkpoint con componentes eliminados y sustituidos, la carga en runtimes estandar no esta garantizada ni documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento de seguridad |
|---|---|---|---|---|---|
| svd-safety-l3_swift_remove40_swapgapiter_evfront_b010 | 8.030.261.248 declarados (fraccion densa 0,6003 de las proyecciones) | no especificado; 8.192 tokens heredados | Meta Llama 3 Community License | HuggingFace, 0 descargas, 0 likes | AdvBench ASR 0,0654; StrongREJECT ASR 0,1725; sobrerrechazo 0,0758 |
| meta-llama/Meta-Llama-3-8B-Instruct (modelo base) | ~8.030 millones | 8.192 tokens | Meta Llama 3 Community License | HuggingFace, ampliamente distribuido | no disponible en la informacion proporcionada |
| meta-llama/Meta-Llama-3.1-8B-Instruct | ~8.030 millones | 128.000 tokens | Meta Llama 3.1 Community License | HuggingFace | no disponible en la informacion proporcionada |
| Otras celdas de la misma rejilla del estudio (mismas reglas, distintos presupuestos) | variable | no especificado | Meta Llama 3 Community License | HuggingFace, repositorio del mismo autor | no disponible en la informacion proporcionada |

La comparacion cuantitativa con alternativas no puede completarse porque la informacion proporcionada no incluye resultados de benchmarks de los modelos de referencia.

## Limitaciones y advertencias

- No es un asistente desplegable: la model card lo califica como artefacto de investigacion y advierte que varias ramas del estudio estan deliberadamente degradadas en seguridad respecto a Llama-3-8B-Instruct.
- La compresion por si sola eleva la tasa de exito de ataque; el valor medido aqui (0,0654 en AdvBench, 0,1725 en StrongREJECT) debe interpretarse en el contexto del estudio, no como un nivel de seguridad aceptable para produccion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la perplejidad de 35,9202 en WikiText-2 es notablemente alta para un modelo de 8B y sugiere degradacion en el modelado del lenguaje.
- Inconsistencia documental: safetensors declara 8.030.261.248 parametros mientras la model card afirma una fraccion de 0,6003 tras eliminar el 39,97% de los parametros de proyeccion; conviene verificar la estructura real antes de asumir cualquier requisito de memoria.
- Idiomas: no hay idiomas declarados; el modelo base solo ofrece soporte oficial para ingles, por lo que el uso en castellano no esta respaldado.
- Sesgos: no evaluados ni documentados en la informacion disponible.
- Licencia: Meta Llama 3 Community License, con LICENSE y USE_POLICY.md incluidos en el repositorio; el uso comercial queda sujeto a dicha licencia y a la politica de uso aceptable de Meta.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion externa por parte de la comunidad.
- Compatibilidad de despliegue no garantizada por la naturaleza editada del checkpoint.
- Fecha de creacion y actualizacion declaradas como 2026-09-18, dato que conviene contrastar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_swift_remove40_swapgapiter_evfront_b010
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Metodo de compresion SVD-LLM: referenciado por nombre en la model card; no se proporciona URL del paper en la informacion disponible
- Paper, blog o repositorio del estudio de reparacion con la regla `gap_iter`: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible
- Resultados de la busqueda web: no contienen enlaces relevantes para este modelo (los resultados devueltos tratan sobre la aplicacion de correo de Telekom y no guardan relacion con el checkpoint)
