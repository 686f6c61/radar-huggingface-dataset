# Jeesup/svd-safety-l3_remove50_swapgapiter_rankunit_b010

## Resumen

`Jeesup/svd-safety-l3_remove50_swapgapiter_rankunit_b010` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido mediante SVD-LLM hasta eliminar el 50,03% de los parámetros densos de proyección y posteriormente editado con 10 rondas iterativas de sustitución de parámetros neutra en parámetros, seleccionadas por la regla `gap_iter`. El autor lo publica como un artefacto de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes repara mejor ese daño. No es un modelo conversacional de propósito general ni un asistente desplegable: es una celda concreta de una rejilla experimental sobre reglas de selección y presupuestos de restauración.

El modelo conserva la arquitectura transformer decoder-only del base (Llama 3, 8B, 32 capas, GQA) y la licencia Llama 3 Community License, pero su comportamiento está medido únicamente en cuatro ejes: tasa de éxito de ataque (ASR) en AdvBench y StrongREJECT con juez HarmBench, sobrerrechazo macro medido con WildGuard y perplejidad en WikiText-2. Los valores publicados (ASR de 0,0519 en AdvBench, 0,1597 en StrongREJECT, sobrerrechazo de 0,2216 y perplejidad de 98,3650) dibujan un modelo con capacidad de lenguaje muy deteriorada respecto al base y con un perfil de seguridad que debe interpretarse como objeto de estudio, no como garantía.

Su relevancia es metodológica más que práctica: ofrece un punto de comparación reproducible (semilla 42, presupuesto de restauración del 1,000% de los parámetros densos, 5.358 componentes restaurados y 5.358 sustituidos) para quien investigue compresión de modelos, interpretabilidad mecanicista o evaluación de seguridad bajo degradación controlada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), con compresion SVD-LLM aplicada a las matrices de proyeccion |
| Parametros totales | 8.030.261.248 segun el recuento de safetensors del repositorio; la model card indica una fraccion resultante de 0,4997 sobre los parametros densos de proyeccion (50,03% eliminado). La informacion proporcionada no explica la discrepancia entre ambas cifras |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; heredada del base Meta-Llama-3-8B-Instruct (8.192 tokens), sujeta a verificacion |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors (16,1 GB) |
| Idiomas soportados | No disponible en la model card |
| Licencia | Llama 3 Community License (se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000% de los parametros densos (0,100% por ronda, 10 de 10 rondas) |
| Componentes restaurados / sustituidos | 5.358 / 5.358 |
| Parametros sustituidos | 69.744.640 (1,00% de los parametros densos de proyeccion) |
| Valor de sustitucion | `insert` (solo valor de insercion; desalojo ordenado por sigma) |
| Semilla | 42 |
| Fecha de publicacion en HuggingFace | 2026-09-20 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

Se parte de `meta-llama/Meta-Llama-3-8B-Instruct`, un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU y atencion con agrupacion de consultas (GQA). Sobre ese checkpoint se aplica SVD-LLM, que descompone en valores singulares las matrices de proyeccion y trunca rangos para reducir el numero de parametros efectivos; en esta variante se elimina el 50,03% de los parametros de proyeccion, dejando una fraccion resultante de 0,4997. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset de ajuste ni si hubo etapas de RLHF o DPO, mas alla del ajuste por instrucciones ya presente en el modelo base.

La innovacion del artefacto no esta en la arquitectura sino en la fase de reparacion posterior a la compresion: 10 rondas de sustitucion de parametros neutral respecto a parametros, con un presupuesto de 0,100% de los parametros densos por ronda (1,000% acumulado). En cada ronda se restauran y se sustituyen 5.358 componentes, con un total de 69.744.640 parametros sustituidos (1,00% de los parametros densos de proyeccion), empleando unicamente el valor de insercion y un desalojo ordenado por sigma. La regla de seleccion de componentes evaluada en esta celda es `gap_iter`, frente a otras reglas y presupuestos de la rejilla experimental del autor.

## Capacidades

- Generacion de texto en formato conversacional, heredada de Llama-3-8B-Instruct, aunque con calidad de lenguaje severamente degradada (perplejidad de 98,3650 en WikiText-2).
- Respuesta a instrucciones y mantenimiento de turnos de conversacion, en la medida en que la compresion no haya destruido esa capacidad, cosa que la model card no cuantifica.
- Razonamiento, codigo y matematicas: no se aportan metricas especificas en la informacion disponible.
- Tool calling / function calling: no disponible; no se documenta soporte explicito ni se ha verificado tras la compresion.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; la model card no declara idiomas.
- Vision o audio: no soportados (modelo exclusivamente de texto).
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidad especial objeto del artefacto: servir como sujeto experimental para medir el impacto de la compresion SVD sobre la seguridad y el sobrerrechazo, y la eficacia de la regla de seleccion `gap_iter` en la reparacion.

## Casos de uso

- Investigacion sobre compresion de modelos: usar este checkpoint como celda de referencia de la regla `gap_iter` con presupuesto del 1,000% y comparar sus cuatro metricas publicadas con las de otras celdas de la rejilla para aislar el efecto de la regla de seleccion.
- Evaluacion de seguridad bajo degradacion: medir ASR en AdvBench y StrongREJECT con juez HarmBench sobre modelos comprimidos para cuantificar cuanto empeora la alineacion de seguridad cuando se elimina el 50% de los parametros de proyeccion.
- Analisis de sobrerrechazo: emplear la metrica de sobrerrechazo macro con WildGuard (0,2216 en esta celda) para estudiar el equilibrio entre rechazo de peticiones daninas y rechazo de peticiones legitimas tras la compresion.
- Interpretabilidad mecanicista: aprovechar la estructura conocida de las 5.358 componentes restauradas y 5.358 sustituidas por ronda para estudiar la atribucion funcional de subespacios concretos de las matrices de proyeccion.
- Reproducibilidad metodologica: replicar el experimento con semilla 42, presupuesto de 1,000% y 10 rondas como linea base verificable de un pipeline de compresion mas reparacion.
- Estudio de viabilidad de despliegue en el borde: emplear la reduccion de parametros de proyeccion como caso de estudio del ahorro real de memoria y su coste en calidad (perplejidad de 98,3650 frente al base), antes de plantear cualquier despliegue de produccion.
- Docencia y divulgacion tecnica: ilustrar con un caso real los compromisos entre tamano, utilidad y seguridad en modelos comprimidos, siempre etiquetando el artefacto como experimental.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto / juez |
|---|---|---|
| ASR (tasa de exito de ataque) | 0,0519 | AdvBench, juez HarmBench |
| ASR (tasa de exito de ataque) | 0,1597 | StrongREJECT, juez HarmBench |
| Sobrerrechazo macro | 0,2216 | WildGuard |
| Perplejidad | 98,3650 | WikiText-2 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras evaluaciones de capacidad, ni cifras comparativas directas con el modelo base sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 16 GB solo para pesos, mas 1-3 GB de cache KV y activaciones segun longitud de contexto y tamano de lote.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 5-6 GB de pesos.
- GPU recomendadas para precision completa o bf16: NVIDIA A100 40/80 GB, H100 80 GB, L40S 48 GB, RTX 4090 24 GB o RTX A6000 48 GB; una RTX 4090 con 24 GB es suficiente para inferencia en bf16 con lotes pequenos y contexto moderado.
- GPU de consumo: si, cabe en RTX 4090, RTX 4080/4070 Ti Super (16 GB, justo en bf16), y en tarjetas de 8-12 GB si se cuantiza a 4 u 8 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (el repositorio esta etiquetado como `endpoints_compatible` y `text-generation-inference`) y vLLM. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion que no se proporciona en el repositorio.
- Latencia y throughput estimados: no disponibles; la informacion proporcionada no incluye mediciones de velocidad, TTFT ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| Jeesup/svd-safety-l3_remove50_swapgapiter_rankunit_b010 | 8.030.261.248 segun safetensors; fraccion resultante declarada de 0,4997 | No disponible (base: 8.192 tokens) | Llama 3 Community License | HuggingFace, pesos safetensors, 16,1 GB | Perplejidad WikiText-2 de 98,3650; AdvBench ASR 0,0519; StrongREJECT ASR 0,1597; sobrerrechazo macro 0,2216 |
| meta-llama/Meta-Llama-3-8B-Instruct (modelo base) | 8.030.261.248 | 8.192 tokens | Llama 3 Community License | HuggingFace, pesos safetensors | No se incluyen en la informacion disponible las metricas del base medidas con los mismos jueces, por lo que no puede calcularse la diferencia exacta |
| Meta-Llama-3.1-8B-Instruct | 8.030.000.000 aproximados | 128.000 tokens | Llama 3.1 Community License | HuggingFace, pesos safetensors y variantes GGUF de terceros | No disponible en la informacion proporcionada |
| Otras celdas de la rejilla del mismo autor (otras reglas de seleccion y presupuestos) | Variable segun la celda | No disponible | Llama 3 Community License | HuggingFace | No disponible; la model card no enumera los resultados de las demas celdas |

## Limitaciones y advertencias

- Artefacto de investigacion, no asistente desplegable: la propia model card indica que debe tratarse como sujeto experimental, no como modelo de proposito general.
- Degradacion severa de la calidad del lenguaje: perplejidad de 98,3650 en WikiText-2, muy superior a la de un modelo de 8B sin comprimir, lo que sugiere texto incoherente o poco fluido en generacion libre.
- Seguridad deliberadamente degradada en varias celdas de la rejilla: la compresion por si sola eleva la tasa de exito de ataque y el objetivo del estudio es cuantificarlo, por lo que no debe asumirse que este checkpoint es seguro.
- Las metricas de seguridad publicadas (AdvBench ASR 0,0519 y StrongREJECT ASR 0,1597) provienen de un unico juez (HarmBench) y de dos conjuntos concretos; no cubren otros vectores de ataque ni jailbreaks nuevos.
- Sobrerrechazo elevado: 0,2216 en WildGuard implica que una fraccion relevante de peticiones legitimas sera rechazada.
- Riesgo de alucinacion: previsiblemente alto dado el deterioro de la model card, aunque no se aporta una medicion especifica de veracidad.
- Idiomas soportados y longitud de contexto no declarados: no hay garantia documentada de comportamiento multilingue ni de que el contexto nativo del base se mantenga tras la compresion.
- Restricciones de licencia: Llama 3 Community License, con obligaciones adicionales para uso comercial y la clausula de atribucion "Built with Meta Llama 3"; debe revisarse `USE_POLICY.md` antes de cualquier uso.
- Discrepancia sin explicar entre los 8.030.261.248 parametros del recuento de safetensors y la fraccion resultante de 0,4997 declarada en la model card; conviene auditar los tensores del repositorio antes de reutilizarlo.
- Ausencia de cuantizaciones publicadas (GGUF, AWQ, GPTQ) y de conversiones listas para llama.cpp u Ollama.
- Sin descargas ni valoraciones en el momento de la consulta: no existe validacion externa de la comunidad.
- Metadatos de publicacion con fecha de 2026-09-20, posterior a la fecha habitual de publicacion de Llama 3; conviene verificar la procedencia del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove50_swapgapiter_rankunit_b010
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Ficheros de licencia y politica de uso incluidos en el repositorio: `LICENSE` y `USE_POLICY.md`
- Paper, blog o repositorio de SVD-LLM: no enlazado en la informacion proporcionada
- Demos: no disponibles
- No se han encontrado en la busqueda web enlaces relevantes a este modelo ni a su metodologia.
