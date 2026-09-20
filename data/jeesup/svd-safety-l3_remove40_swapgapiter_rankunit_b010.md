# Jeesup/svd-safety-l3_remove40_swapgapiter_rankunit_b010

## Resumen

svd-safety-l3_remove40_swapgapiter_rankunit_b010 es un checkpoint derivado de meta-llama/Meta-Llama-3-8B-Instruct comprimido mediante SVD-LLM hasta el 60,0% de los parametros densos (se elimina el 40,02%) y despues editado con 10 de 10 rondas de sustituciones iterativas de parametros ("parameter-neutral swap") seleccionadas por la regla gap_iter. Lo publica el usuario Jeesup como artefacto de investigacion dentro de un estudio sobre como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad y que regla de seleccion de componentes lo repara mejor.

No es un modelo conversacional de proposito general ni un asistente desplegable. Se trata de una celda concreta de una rejilla experimental que cruza reglas de seleccion (gap_iter entre otras) y presupuestos de restauracion (aqui el 1,000% de los parametros densos, en trozos del 0,100% por ronda). La model card advierte explicitamente de que varias ramas de la rejilla estan degradadas en seguridad de forma deliberada y de que este checkpoint debe tratarse como sujeto experimental.

El interes actual del artefacto es metodologico: cuantifica el coste en seguridad de comprimir un modelo alineado y mide si una reparacion selectiva de componentes recupera la robustez frente a ataques. Los datos publicados incluyen tasas de exito de ataque (AdvBench 0,0038; StrongREJECT 0,0447 con juez HarmBench), una tasa macro de sobrerrechazo del 0,3530 (WildGuard) y una perplejidad de 32,2882 en WikiText-2, muy por encima de la de un Llama-3-8B-Instruct sin comprimir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), con matrices de proyeccion comprimidas por SVD |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Llama-3-8B-Instruct declara 8.192 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors; no se listan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | Meta Llama 3 Community License (incluye LICENSE y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (libreria transformers; tamano de repositorio 16,1 GB) |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama-3-8B-Instruct: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE), en precision de 8.030 millones de parametros. Sobre ese checkpoint se aplica SVD-LLM, un esquema de compresion que trunca descomposiciones en valores singulares de las matrices de proyeccion de forma consciente del error de truncamiento, eliminando el 40,02% de los parametros y dejando una fraccion resultante de 0,5998.

Sobre el modelo comprimido se aplica una edicion posterior que no es un fine-tuning convencional: 10 rondas de sustitucion de parametros con presupuesto de 1,000% de los parametros densos, en trozos de 0,100% por ronda, con la regla de seleccion gap_iter. En total se restauran 5.108 componentes y se sustituyen 5.108 (69.749.760 parametros, el 1,00% de los parametros densos de proyeccion), con valor de sustitucion "insert" y desalojo ordenado por sigma. La semilla es 42. No se documenta en la model card ninguna fase adicional de RLHF, DPO o SFT mas alla del alineamiento ya presente en el modelo base.

## Capacidades

- Generacion de texto autoregresiva y conversacion multirround, heredadas del checkpoint base Llama-3-8B-Instruct, aunque degradadas por la compresion (perplejidad de 32,2882 en WikiText-2).
- Respuesta a instrucciones en formato chat: el repositorio se etiqueta como conversational y text-generation, con plantilla de Llama 3.
- Comportamiento de rechazo ante peticiones daninas, cuantificado en la propia model card (AdvBench ASR 0,0038; StrongREJECT ASR 0,0447), aunque con un coste elevado en falsos rechazos.
- Soporte de tool calling o function calling: no verificado ni declarado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no evaluadas en la informacion disponible.
- Capacidades multilingues: no declaradas; los idiomas soportados figuran como no disponibles.
- Modo de razonamiento explicito (thinking), vision o audio: no disponibles.
- Uso principal real: servir como sujeto experimental para medir el equilibrio seguridad/utilidad bajo compresion.

## Casos de uso

- Investigacion sobre compresion de modelos: sirve como punto de comparacion frente al checkpoint sin comprimir y frente a otras celdas de la rejilla (otras reglas de seleccion y otros presupuestos de restauracion) para aislar el efecto de gap_iter.
- Auditoria de seguridad bajo compresion: con AdvBench y StrongREJECT evaluados con juez HarmBench, permite medir si la poda por SVD incrementa la tasa de exito de ataque y en que magnitud.
- Estudio del sobrerrechazo: la metrica macro de WildGuard (0,3530) permite analizar el coste en utilidad de las defensas inducidas por la reparacion de componentes.
- Interpretabilidad mecanistica: los 5.108 componentes restaurados y 5.108 sustituidos constituyen un conjunto identificable de direcciones sobre el que estudiar que subespacios sostienen el comportamiento de rechazo.
- Reproducibilidad experimental: la semilla (42), el numero de rondas (10), el tamano de trozo (0,100%) y el presupuesto total (1,000%) estan documentados, lo que permite replicar la celda exacta.
- Analisis de escalado de la reparacion: comparar esta celda con brazos de mayor presupuesto para estimar la curva de recuperacion de seguridad en funcion del porcentaje de parametros restaurados.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, RAG ni ninguna aplicacion de cara al usuario, dado que la propia model card lo desaconseja como asistente desplegable.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0038 |
| StrongREJECT ASR (juez HarmBench) | 0,0447 |
| Sobrerrechazo macro (WildGuard) | 0,3530 |
| Perplejidad WikiText-2 | 32,2882 |

No se han publicado en la informacion disponible resultados de benchmarks de conocimiento o razonamiento (MMLU, GSM8K, HumanEval, etc.), ni los valores equivalentes del modelo base sin comprimir, por lo que no es posible calcular aqui el delta exacto atribuible a la compresion.

## Requisitos de hardware

- VRAM estimada en bf16/fp16 para los 8.030 millones de parametros: en torno a 16 GB solo para pesos, mas cache KV y activaciones (unos 18-20 GB en practica segun longitud de contexto y tamano de lote).
- VRAM estimada en cuantizacion int8: aproximadamente 8-9 GB; en int4: aproximadamente 4,5-5,5 GB. No obstante, el repositorio no publica pesos cuantizados, por lo que habria que generarlos.
- GPU recomendadas para precision completa: A100 40/80 GB, H100 80 GB, L40S 48 GB, RTX 4090 24 GB, RTX 3090 24 GB.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, 4090) en bf16 con contexto moderado, y en tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) recurriendo a cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (el repositorio lleva la etiqueta text-generation-inference) y endpoints compatibles. Para llama.cpp u Ollama habria que convertir los pesos a GGUF, conversion que el autor no publica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| svd-safety-l3_remove40_swapgapiter_rankunit_b010 | 8.030 millones (60,0% de la densidad original) | No disponible en la ficha (8.192 en el modelo base) | Meta Llama 3 Community | Artefacto de investigacion sobre compresion y seguridad |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030 millones | 8.192 tokens | Meta Llama 3 Community | Asistente conversacional de proposito general |
| Otros checkpoints SVD-LLM de Llama-3-8B | Depende de la tasa de compresion | No disponible | Meta Llama 3 Community | Compresion de modelos de lenguaje |
| Mistral-7B-Instruct | 7.240 millones | 32.768 tokens (segun su model card) | Apache 2.0 | Asistente conversacional de proposito general |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la informacion proporcionada, salvo la perplejidad de WikiText-2 de este checkpoint.

## Limitaciones y advertencias

- No es un modelo de produccion: la model card lo describe como artefacto de investigacion y advierte de que varias ramas de la rejilla estan degradadas en seguridad de forma deliberada.
- Degradacion de fluidez: la perplejidad de 32,2882 en WikiText-2 es muy superior a la de un Llama-3-8B-Instruct sin comprimir, lo que indica perdida de calidad en la modelizacion del lenguaje.
- Sobrerrechazo elevado: la tasa macro de WildGuard de 0,3530 implica que aproximadamente un tercio de las peticiones benignas pueden recibir una respuesta evasiva o un rechazo, lo que limita su utilidad conversacional.
- Seguridad medida pero no garantizada: aunque las tasas de exito de ataque reportadas son bajas (0,0038 en AdvBench, 0,0447 en StrongREJECT), se han medido con un unico juez (HarmBench) y sobre dos conjuntos concretos; no cubren jailbreaks nuevos ni ataques multi-turno.
- Sesgos: no se han publicado evaluaciones de sesgo, toxicidad ni equidad para este checkpoint.
- Idiomas: no se declara cobertura idiomatica; se desconoce el comportamiento fuera del ingles y de los idiomas presentes en los datos del modelo base.
- Restricciones de licencia: se aplica la Meta Llama 3 Community License, con las obligaciones habituales de atribucion ("Built with Meta Llama 3"), politica de uso aceptable vinculante y condiciones especificas para despliegues a gran escala.
- Riesgo de alucinacion: no cuantificado, pero previsiblemente agravado por la compresion y por la perdida de fidelidad reflejada en la perplejidad.
- Caveat de trazabilidad: al ser una celda de una rejilla, cualquier conclusion extraida de este checkpoint debe contrastarse con los demas brazos del estudio antes de generalizarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove40_swapgapiter_rankunit_b010
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia y politica de uso: los archivos LICENSE y USE_POLICY.md se incluyen en el propio repositorio del modelo.
- Paper de SVD-LLM, blog del autor, repositorio de codigo y demos: no disponibles en la informacion proporcionada.
- Nota sobre la busqueda web: los resultados recuperados (sitios comerciales de papel de acuarela Arches) no guardan relacion con el modelo y no se han utilizado como fuente.
