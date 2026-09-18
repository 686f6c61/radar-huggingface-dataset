# Jeesup/svd-safety-l3_remove50_swapgapiter_b010_r01

## Resumen

svd-safety-l3_remove50_swapgapiter_b010_r01 es un checkpoint derivado de meta-llama/Meta-Llama-3-8B-Instruct, publicado por el usuario Jeesup en HuggingFace. No es un modelo de propósito general: se trata de un artefacto de investigación creado para estudiar cómo la compresión por descomposición en valores singulares (SVD) degrada el comportamiento de seguridad de un modelo alineado, y qué reglas de selección de componentes reparan mejor ese daño. El modelo parte de una compresión SVD-LLM que elimina el 50,03% de los parámetros densos y después aplica una ronda de edición sobre parámetros seleccionados mediante la regla `gap_iter`.

La edición consiste en un intercambio de parámetros neutro en términos de recuento (se restauran 1328 componentes y se sustituyen otros 1328), con un presupuesto de restauración del 1,000% de los parámetros densos repartido en hasta 10 rondas; este checkpoint corresponde únicamente a la primera ronda, con un fragmento de 0,100% (6.974.464 parámetros intercambiados). El resultado es un modelo con una fracción de parámetros densos de 0,4997 respecto al original.

Su relevancia es metodológica más que práctica: proporciona métricas de tasa de éxito de ataque (ASR) y de sobrerrechazo medidas con jueces automáticos, lo que permite comparar celdas de una rejilla experimental sobre reglas de selección y presupuestos. El propio autor advierte que varias celdas del estudio están deliberadamente degradadas en seguridad y que ningún checkpoint debe tratarse como un asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama 3 8B Instruct, con proyecciones comprimidas por SVD-LLM); no se detalla la configuracion interna en la informacion disponible |
| Parametros totales | 8.030.261.248 (recuento del repo en safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors sin versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Meta Llama 3 Community License |
| Formato de pesos | safetensors (libreria transformers) |

Nota: el recuento de parametros del safetensors (8.030 millones) es practicamente identico al del modelo base, pese a que la model card declara una fraccion de parametros densos resultante de 0,4997. La informacion proporcionada no explica esta discrepancia (posible reindexado del checkpoint o recuento sobre la configuracion original); conviene verificar la estructura real de las matrices antes de asumir cualquier reduccion de memoria.

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama 3 8B Instruct: un transformer decoder-only con atencion causal. Sobre ese checkpoint se aplica una compresion SVD-LLM que reduce el rango de las matrices de proyeccion, eliminando el 50,03% de los parametros densos. El checkpoint publicado no ha sido reentrenado ni ajustado con RLHF o DPO adicional; la intervencion posterior es una edicion quirurgica de pesos, no un proceso de entrenamiento.

La innovacion metodologica es el procedimiento de intercambio neutro en parametros: en cada ronda se restauran 1328 componentes del modelo original y se expulsan otros 1328, manteniendo constante el recuento total, con ordenacion por sigma para la expulsion y un valor de insercion de tipo `insert`. La regla de seleccion de componentes evaluada en esta celda es `gap_iter`, con semilla 42. El presupuesto total del estudio es del 1,0% de los parametros densos, dividido en 10 rondas de 0,1%; este repositorio contiene unicamente la ronda 1. No se especifican en la informacion disponible el volumen de datos de entrenamiento original, la composicion del dataset de Llama 3 ni detalles adicionales del pipeline de compresion.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad base de Llama 3 8B Instruct, aunque degradada por la compresion al 50% y por la edicion de pesos.
- Razonamiento e instrucciones: el modelo conserva el formato de chat instruct, pero no hay evaluaciones de utilidad publicadas en la informacion disponible.
- Sujeto de estudio de seguridad: es su funcion principal; permite medir ASR frente a conjuntos de ataques (AdvBench, StrongREJECT) y sobrerrechazo (WildGuard).
- Interpretabilidad y analisis de compresion: sirve para estudiar que componentes de la red sostienen el comportamiento de rechazo.
- Tool calling / function calling: no disponible (no se documenta soporte).
- Capacidades de agente o razonamiento multi-paso: no disponible (no se documentan).
- Multilingue: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Cuantizacion y despliegue en produccion: no recomendado por el propio autor; el artefacto no esta pensado para uso como asistente.

## Casos de uso

- Investigacion sobre seguridad y compresion: usar el checkpoint como celda de control en un estudio que compare reglas de seleccion de componentes (`gap_iter` frente a otras) y presupuestos de restauracion, midiendo ASR con el mismo juez (HarmBench) para aislar el efecto de cada regla.
- Analisis de degradacion inducida por SVD: comparar las activaciones y los pesos comprimidos frente al modelo original para localizar que proyecciones concentran la perdida de comportamiento de rechazo.
- Calibracion de jueces automaticos: las metricas de ASR y sobrerrechazo publicadas permiten contrastar la sensibilidad de distintos jueces (HarmBench, WildGuard) sobre un mismo modelo degradado.
- Auditoria de artefactos derivados: evaluar si un checkpoint derivado de un modelo con licencia Llama 3 mantiene las salvaguardas esperadas antes de permitir su circulacion en un repositorio interno.
- Estudio de sobrerrechazo: el valor de 0,2959 en Macro over-refusal (WildGuard) sirve para analizar el equilibrio entre seguridad y utilidad tras una compresion agresiva.
- Reproducibilidad de experimentos: al fijar semilla 42, regla `gap_iter` y presupuesto 0,1%, la celda permite replicar el resultado y validar la metodologia de intercambio neutro de parametros.
- Docencia y divulgacion tecnica: ilustrar en un curso de interpretabilidad como una intervencion sobre un 0,1% de los parametros puede modificar metricas de seguridad medibles.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,2900 |
| StrongREJECT ASR (juez HarmBench) | 0,2550 |
| Macro over-refusal (WildGuard) | 0,2959 |

No se han publicado en la informacion disponible resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros), ni comparaciones directas con el modelo base sin comprimir bajo los mismos jueces. Las tres metricas anteriores son tasas de ataque exitoso y de sobrerrechazo: valores de ASR mas altos indican peor comportamiento de seguridad, y un over-refusal alto indica rechazos indebidos en peticiones benignas. Sin la linea base del modelo sin comprimir no es posible cuantificar cuanto de ese ASR proviene de la compresion y cuanto de la edicion.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 16 GB solo para pesos, mas cache KV y overhead; el repositorio ocupa 16,1 GB.
- VRAM estimada con cuantizacion int8: aproximadamente 8-9 GB; con int4, aproximadamente 5-6 GB. Son estimaciones por tamano de parametros, ya que no hay versiones cuantizadas publicadas ni mediciones en la informacion disponible.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para servicio concurrente; RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 para inferencia en fp16 de una sola peticion.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB en fp16 y en tarjetas de 12 GB con cuantizacion, siempre que se genere una version GGUF o AWQ propia (no incluidas en el repositorio).
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference`), y de forma habitual vLLM o SGLang para servir el checkpoint; llama.cpp u Ollama requeririan conversion manual a GGUF, que el autor no proporciona.
- Latencia y throughput: no disponible (no se publican mediciones).
- Advertencia: el autor no recomienda desplegar este checkpoint como asistente, por lo que los requisitos anteriores son orientativos para experimentacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| svd-safety-l3_remove50_swapgapiter_b010_r01 | 8.030.261.248 segun safetensors; fraccion densa declarada 0,4997 | no disponible | Meta Llama 3 Community License | Artefacto de investigacion, ronda 1 de 10 |
| meta-llama/Meta-Llama-3-8B-Instruct (modelo base) | 8B | no disponible en la informacion proporcionada | Meta Llama 3 Community License | Modelo instruct de proposito general, alineado |
| Otras celdas de la rejilla del mismo estudio | no disponible | no disponible | Meta Llama 3 Community License | No publicadas en la informacion disponible |
| Alternativas de la misma categoria (modelos comprimidos por SVD de Llama 3 8B) | no disponible | no disponible | no disponible | No se han identificado en la informacion disponible |

La unica comparacion significativa disponible es con el modelo base: misma familia y licencia, pero con el comportamiento de seguridad potencialmente degradado por la compresion. No hay datos publicados en la informacion proporcionada que permitan comparar capacidades frente a otros modelos de 8B.

## Limitaciones y advertencias

- Seguridad degradada de forma intencionada: la model card indica que varias celdas de la rejilla estan deliberadamente degradadas y que la compresion por si sola eleva la tasa de exito de ataques. Un ASR de 0,2900 en AdvBench implica que cerca del 29% de las peticiones maliciosas del conjunto logran una respuesta no rechazada.
- No es un modelo desplegable: el autor lo describe explicitamente como sujeto experimental, no como asistente.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de utilidad; la compresion al 50% puede afectar a la coherencia y al seguimiento de instrucciones.
- Sobrerrechazo elevado: 0,2959 en Macro over-refusal (WildGuard) sugiere que el modelo rechaza una proporcion relevante de peticiones benignas.
- Idiomas y contexto: no se documenta la cobertura linguistica ni la longitud de contexto efectiva del checkpoint comprimido.
- Sesgos: no disponible (no se publican evaluaciones de sesgo).
- Restricciones de licencia: uso sujeto a la Meta Llama 3 Community License y a la politica de uso aceptable incluida en el repositorio (`LICENSE` y `USE_POLICY.md`). Cualquier uso comercial debe cumplir esas condiciones.
- Ambiguedad en el recuento de parametros: el safetensors declara 8.030 millones de parametros pese a la reduccion declarada, lo que invalida asumir de entrada un ahorro de memoria o de computo.
- Fecha de creacion inusual: el repositorio figura como creado el 2026-09-18, dato que conviene verificar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove50_swapgapiter_b010_r01
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Paper de SVD-LLM (no enlazado en la informacion proporcionada; referencia al metodo de compresion citado en la model card)
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en los resultados de busqueda web disponibles; los resultados devueltos no guardan relacion con el modelo.
