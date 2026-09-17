# Jeesup/svd-safety-l31_remove30_swapgapiter_b010_r01

## Resumen

svd-safety-l31_remove30_swapgapiter_b010_r01 es un checkpoint derivado de meta-llama/Llama-3.1-8B-Instruct, publicado por el usuario Jeesup, que combina dos transformaciones: una compresion mediante SVD-LLM que elimina el 30,01 por ciento de los parametros y una edicion posterior de bajo presupuesto que reintroduce componentes seleccionados por la regla `gap_iter`. El resultado declarado es una fraccion de parametros densos de 0,6999, es decir, en torno al 70 por ciento del modelo original, con 1.288 componentes restaurados y 1.288 desplazados, aplicando solo la primera de diez rondas iterativas previstas.

No se trata de un modelo conversacional listo para produccion, sino de un artefacto de investigacion. Su proposito es medir como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad de un modelo alineado y que criterio de seleccion de componentes repara mejor ese dano. El autor advierte explicitamente que varias celdas de la rejilla experimental estan degradadas en seguridad de forma deliberada y que este checkpoint concreto es un sujeto de estudio, no un asistente desplegable.

La relevancia actual del artefacto es metodologica: cuantifica el trade-off entre seguridad y utilidad en modelos comprimidos, un area poco documentada, y lo hace con metricas de ataque y de sobre-rechazo medidas con jueces estandarizados (HarmBench y WildGuard). Al estar construido sobre Llama 3.1, hereda su arquitectura transformer decoder-only y su tokenizador, lo que facilita reproducir los experimentos con el ecosistema habitual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama-3.1-8B-Instruct) |
| Parametros totales | 8.030.261.248 segun los tensores safetensors del repositorio (forma densa) |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos |
| Fraccion de parametros efectivos | 0,6999 (30,01 por ciento de parametros eliminados por SVD-LLM) |
| Longitud de contexto | 128.000 tokens segun el modelo base; no confirmada en el repositorio de este checkpoint |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos safetensors |
| Idiomas soportados | No disponible en el repositorio; el modelo base declara ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | Llama 3.1 Community License (se incluyen `LICENSE` y `USE_POLICY.md`) |
| Formato de pesos | Safetensors (tamano del repositorio: 16,1 GB) |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000 por ciento de los parametros densos en el run completo; 0,100 por ciento por ronda |
| Parametros reintroducidos | 6.971.392 en esta ronda |
| Semilla | 42 |
| Rondas aplicadas | 1 de 10 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only con atencion por causalidad, normalizacion RMSNorm y activaciones SwiGLU, sobre el que se aplica una compresion por descomposicion en valores singulares (SVD-LLM) que elimina el 30,01 por ciento de los parametros. La compresion se materializa como eliminacion de componentes de rango en las proyecciones, de modo que el checkpoint conserva una forma densa de 8.030.261.248 parametros almacenados mientras la fraccion de parametros efectivos declarada por el autor es 0,6999. Este checkpoint no ha sido reentrenado: no hay datos de entrenamiento nuevos, ni RLHF, ni DPO especificos de esta publicacion.

Sobre el modelo comprimido se aplica un procedimiento de edicion por intercambio de parametros, descrito como neutral en numero de parametros, que reinserta componentes seleccionados por la regla `gap_iter`. En esta celda se restauran 1.288 componentes y se expulsan otros 1.288, con un valor de intercambio `insert` (solo valor de insercion, con expulsion ordenada por sigma). El presupuesto por ronda es del 0,100 por ciento de los parametros densos, equivalente a 6.971.392 parametros, dentro de un presupuesto total de run del 1,0 por ciento repartido en diez rondas; este checkpoint corresponde a la ronda 1. La innovacion tecnica que se estudia es, por tanto, el criterio de seleccion de componentes para reparar comportamiento de seguridad tras una compresion agresiva, no una mejora de arquitectura o de eficiencia de decodificacion.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad base de Llama-3.1-8B-Instruct para mantener dialogos multi-turno.
- Seguimiento de instrucciones: el checkpoint parte de una version Instruct, aunque la compresion y la edicion pueden alterar la fidelidad del seguimiento.
- Razonamiento y conocimiento general: capacidades propias de un modelo de 8.000 millones de parametros, no reevaluadas en la informacion disponible.
- Generacion de codigo y matematicas: capacidades heredadas del modelo base; no se han publicado metricas especificas para este checkpoint.
- Multilingue: limitado a lo que ofrece el modelo base; no hay evaluacion propia.
- Comportamiento de rechazo ante peticiones daninas: es precisamente la dimension medida, con una tasa de exito de ataque (ASR) de 0,0850 en AdvBench y 0,1700 en StrongREJECT.
- Tool calling y function calling: no disponible; no se documenta plantilla de herramientas especifica ni evaluacion al respecto.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Modo thinking, vision o audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Investigacion sobre seguridad en modelos comprimidos: este checkpoint sirve como celda experimental para medir cuanto aumenta la tasa de exito de ataque cuando se elimina el 30 por ciento de los parametros mediante SVD-LLM, comparando con el modelo base sin comprimir.
- Evaluacion de reglas de seleccion de componentes: al estar etiquetado con la regla `gap_iter`, permite comparar este criterio frente a otras reglas de la misma rejilla experimental y determinar cual repara mejor el comportamiento de rechazo con el mismo presupuesto.
- Analisis del trade-off seguridad/utilidad: con una tasa de sobre-rechazo macro de 0,1778 medida con WildGuard, el checkpoint permite estudiar si la reparacion de seguridad penaliza en exceso la utilidad conversacional.
- Reproducibilidad de experimentos: los metadatos publicados (semilla 42, presupuesto por ronda, numero de componentes intercambiados) permiten replicar exactamente esta celda y auditar la metodologia.
- Interpretabilidad de mecanismos de seguridad: los 1.288 componentes restaurados constituyen un conjunto concreto sobre el que analizar que partes de la red sostienen el comportamiento de rechazo.
- Punto de partida para completar el run: al ser la ronda 1 de 10, sirve como estado intermedio desde el que continuar el proceso iterativo de intercambio hasta agotar el presupuesto del 1,0 por ciento.
- Docencia sobre compresion de modelos: util como ejemplo practico de los efectos secundarios de la compresion SVD en un modelo alineado, con metricas antes y despues.
- Evaluacion comparativa de pipelines de moderacion: las salidas del checkpoint pueden alimentar jueces automaticos (HarmBench, WildGuard) para validar la sensibilidad de dichos pipelines ante modelos degradados.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0850 |
| StrongREJECT ASR (juez HarmBench) | 0,1700 |
| Sobre-rechazo macro (WildGuard) | 0,1778 |

No se han publicado resultados de benchmarks de conocimiento, razonamiento o codigo (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni valores equivalentes para el modelo base con los que establecer una comparacion cuantitativa directa.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 16 GB solo para pesos, mas cache KV; en la practica se recomiendan 24 GB o mas para contextos largos.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB de pesos; cuantizacion de 4 bits: en torno a 4,5-5,5 GB.
- GPU recomendadas para servicio: A100 40 GB u 80 GB, H100, L40S; para experimentacion en una sola GPU, RTX 4090, RTX 3090 o RTX A6000 (24-48 GB).
- Compatibilidad con GPU de consumo: si, cabe en tarjetas de 24 GB en bf16 con contexto moderado y en tarjetas de 8-12 GB si se cuantiza a 4 bits, siempre que se genere el artefacto de cuantizacion, que no se publica.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM por compatibilidad de arquitectura Llama. Para llama.cpp u Ollama seria necesaria una conversion a GGUF no incluida en el repositorio.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.
- Nota: la compresion por eliminacion de componentes de rango no reduce necesariamente el coste de inferencia frente al modelo denso, ya que el checkpoint almacena y ejecuta tensores de forma densa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-l31_remove30_swapgapiter_b010_r01 | 8,03 B almacenados; fraccion efectiva 0,6999 | 128.000 tokens (heredado del base) | ASR AdvBench 0,0850; StrongREJECT 0,1700; sobre-rechazo 0,1778 | Llama 3.1 Community | Safetensors en HuggingFace, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | No disponible en la informacion proporcionada | Llama 3.1 Community | Safetensors en HuggingFace, acceso sujeto a aceptacion de terminos |
| Otras celdas de la rejilla del mismo estudio | No disponible | No disponible | No disponible | Llama 3.1 Community | No identificadas en la informacion disponible |
| Otros modelos comprimidos comparables (SliceGPT, Wanda u similares) | No disponible | No disponible | No disponible | No disponible | No se han encontrado referencias en la busqueda web realizada |

## Limitaciones y advertencias

- No es un modelo de proposito general: el propio autor indica que debe tratarse como sujeto experimental y no como asistente desplegable.
- Degradacion deliberada de seguridad: la compresion por si sola eleva la tasa de exito de ataque, y varias celdas del estudio estan degradadas a proposito; este checkpoint concreto muestra un ASR de 0,0850 en AdvBench y 0,1700 en StrongREJECT.
- Sobre-rechazo elevado: la tasa macro de 0,1778 medida con WildGuard implica que el modelo rechaza peticiones legitimas con frecuencia apreciable.
- Riesgo de alucinacion: no evaluado en la informacion disponible; la compresion puede agravar la perdida de fidelidad factica.
- Idiomas: no se documenta evaluacion multilingue para este checkpoint; el comportamiento fuera del ingles no esta caracterizado.
- Contexto: la ventana de 128.000 tokens se hereda del modelo base, pero no se verifica si la compresion degrada la atencion en contextos largos.
- Licencia: Llama 3.1 Community License, con las restricciones de uso comercial, atribucion y politicas de uso aceptable que impone; se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio.
- Estado intermedio: corresponde a 1 de 10 rondas, con solo el 0,100 por ciento del presupuesto aplicado; no representa el resultado final de la metodologia.
- Ausencia de cuantizaciones publicadas: no hay GGUF, AWQ ni GPTQ, lo que complica el despliegue en hardware limitado.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de los resultados.
- Metadatos anomalos: la fecha de creacion registrada (2026-09-17) resulta inconsistente y conviene verificarla antes de citar el artefacto.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre su estudio asociado; los enlaces obtenidos correspondian a productos comerciales sin relacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove30_swapgapiter_b010_r01
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de SVD-LLM: no disponible en la informacion proporcionada
- Repositorio de codigo del estudio: no disponible en la informacion proporcionada
- Demos o espacios asociados: no disponibles en la informacion proporcionada
