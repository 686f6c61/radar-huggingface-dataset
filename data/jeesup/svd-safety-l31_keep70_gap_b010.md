# Jeesup/svd-safety-l31_keep70_gap_b010

## Resumen

`Jeesup/svd-safety-l31_keep70_gap_b010` es un checkpoint derivado de `meta-llama/Llama-3.1-8B-Instruct` al que se le ha aplicado compresion SVD-LLM. En concreto, se han eliminado el 29,03% de los parametros densos (fraccion de parametros resultante: 0,7097, es decir, el 71,0% del original) y despues se ha restaurado un presupuesto del 1,000% de parametros densos en componentes SVD, seleccionados mediante la regla denominada `gap`. En total se restauraron 7.236 componentes y no se sustituyo ninguno (0 componentes intercambiados), con semilla 42.

El modelo no es un asistente conversacional de proposito general: es un artefacto de investigacion. Forma parte de una rejilla experimental sobre reglas de seleccion de componentes y presupuestos de restauracion, cuyo objetivo es medir como la compresion SVD degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion repara mejor ese dano. El autor advierte explicitamente de que varias celdas de la rejilla estan degradadas en seguridad de forma deliberada respecto al modelo base.

Su relevancia actual es metodologica: proporciona un punto de medida reproducible sobre el eje seguridad/utilidad en modelos comprimidos, un area poco documentada. Con 8.030.261.248 parametros totales (dato real de los safetensors) y un repositorio de 16,1 GB, mantiene la arquitectura del modelo base, por lo que hereda su ventana de contexto y su tokenizador, pero no incorpora ningun entrenamiento adicional de alineamiento mas alla del que ya tenia Llama-3.1-8B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura de Llama-3.1-8B-Instruct) con pesos comprimidos mediante SVD-LLM |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128.000 tokens heredados del modelo base (no verificado en este repositorio) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos sin cuantizar; no se incluyen variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible en la informacion proporcionada (heredados del modelo base) |
| Licencia | Llama 3.1 Community License (incluye `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Fraccion de parametros resultante | 0,7097 (71,0% del denso original) |
| Parametros eliminados | 29,03% |
| Regla de seleccion de componentes | `gap` |
| Presupuesto de restauracion | 1,000% de los parametros densos |
| Componentes restaurados | 7.236 |
| Componentes sustituidos | 0 |
| Semilla | 42 |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama-3.1-8B-Instruct: un transformer decoder-only con normalizacion RMSNorm, activaciones SwiGLU, embeddings RoPE y atencion con query grouping (GQA). Sobre esa base no se ha reentrenado el modelo: la transformacion consiste en una compresion SVD-LLM que reduce el rango de las matrices de pesos hasta dejar el 70,97% de los parametros densos, seguida de una restauracion selectiva de componentes SVD de bajo rango que devuelve un 1,000% adicional del presupuesto de parametros. La seleccion de que componentes restaurar se hizo con la regla `gap`, una de las varias reglas comparadas dentro de la rejilla experimental.

No se documenta en la informacion disponible ningun proceso de RLHF, DPO o fine-tuning posterior a la compresion; el checkpoint es el resultado de una cirugia de pesos sobre el modelo ya alineado, no de un ciclo de entrenamiento nuevo. La innovacion tecnica destacable es precisamente el protocolo experimental: cuantificar como la compresion por descomposicion en valores singulares eleva la tasa de exito de ataques y evaluar si la restauracion guiada por una regla de seleccion concreta recupera parte del comportamiento de rechazo. El seed 42 y el desglose exacto de componentes (7.236 restaurados, 0 sustituidos) hacen la celda reproducible.

## Capacidades

- Generacion de texto conversacional e instrucciones en el formato de chat de Llama 3.1, heredado del modelo base.
- Razonamiento y respuesta a prompts de uso general con el nivel de calidad del modelo base menos la degradacion introducida por la compresion; no se publican mediciones de calidad general (MMLU, GSM8K, HumanEval) para esta celda.
- Comportamiento de rechazo ante peticiones daninas medible y documentado: ASR de 0,0115 en AdvBench y 0,0351 en StrongREJECT, ambos juzgados con HarmBench.
- Capacidad de analisis del trade-off seguridad/utilidad: la metrica de sobrerrechazo macro (WildGuard) es 0,4486, lo que permite estudiar el coste en utilidad de las politicas de rechazo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada; no se documenta plantilla de herramientas especifica en este repositorio.
- Soporte de agentes y razonamiento multi-paso: no disponible ni evaluado en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Evaluacion de seguridad en modelos comprimidos: usar este checkpoint como sujeto experimental para medir como varia la tasa de exito de ataques (ASR) cuando se elimina el 29,03% de los parametros y se restauran 7.236 componentes SVD, comparando contra el modelo base sin comprimir en el mismo arnes de evaluacion.
- Investigacion sobre reglas de seleccion de componentes: esta celda usa la regla `gap` con un presupuesto del 1,000%; sirve como punto de comparacion contra otras celdas de la misma rejilla que emplean reglas distintas o presupuestos distintos, manteniendo fija la semilla 42.
- Estudios de interpretabilidad de pesos: al conocer exactamente que componentes se restauraron y cuales se descartaron, el checkpoint permite analizar la contribucion de subespacios SVD concretos al comportamiento de rechazo.
- Calibracion de umbrales de rechazo: el par ASR bajo (0,0115 en AdvBench) junto con un sobrerrechazo macro alto (0,4486) es un caso de estudio util para ajustar clasificadores de rechazo y medir el coste en utilidad.
- Red-teaming comparativo: emplear el checkpoint como linea base degradada en ejercicios internos de red team, con la advertencia de que su comportamiento no representa el de un asistente desplegable.
- Docencia e investigacion en compresion de modelos: ilustra de forma reproducible (fraccion 0,7097, seed 42, 7.236 componentes) el flujo completo de compresion SVD-LLM y restauracion selectiva sobre un modelo de 8.000 millones de parametros.
- Validacion de pipelines de evaluacion: al ser un modelo pequeno y con licencia Llama 3.1, sirve para probar arneses de medida de ASR, sobrerrechazo y perplejidad (WikiText-2 = 15,5225) antes de escalarlos a modelos mayores.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0115 |
| StrongREJECT ASR (juez HarmBench) | 0,0351 |
| Sobrerrechazo macro (WildGuard) | 0,4486 |
| Perplejidad en WikiText-2 | 15,5225 |

No se han publicado en la informacion disponible los valores equivalentes para el modelo base `meta-llama/Llama-3.1-8B-Instruct` ni para otras celdas de la rejilla, por lo que no es posible cuantificar la degradacion relativa con los datos aportados. Tampoco hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba de capacidad general.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 16,1 GB solo de pesos, mas cache KV y activaciones; en la practica conviene reservar 18-20 GB.
- VRAM estimada en INT8: en torno a 8-9 GB de pesos.
- VRAM estimada en INT4: en torno a 4,5-5,5 GB de pesos.
- GPU profesionales: cabe con holgura en A100 40/80 GB, H100 y L40S; util para servir varias replicas o contextos largos.
- GPU de consumo: si en una RTX 4090 o RTX 3090 de 24 GB en FP16 con contexto moderado; en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) requiere cuantizacion a 8 bits o inferior.
- Tarjetas de 8-12 GB: solo con cuantizacion de 4 bits, con perdida de calidad adicional sobre la ya introducida por la compresion SVD.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (el repositorio esta etiquetado como `endpoints_compatible`) y, por compatibilidad de arquitectura con Llama 3.1, vLLM y llama.cpp/Ollama previa conversion a GGUF, que no se distribuye en este repositorio.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ASR AdvBench | Perplejidad WikiText-2 | Licencia |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l31_keep70_gap_b010` | 8.030.261.248 (71,0% denso) | 128.000 (heredado, no verificado) | 0,0115 | 15,5225 | Llama 3.1 Community |
| `meta-llama/Llama-3.1-8B-Instruct` (modelo base) | 8.030.000.000 aprox. | 128.000 | no disponible en esta informacion | no disponible en esta informacion | Llama 3.1 Community |
| Otras celdas de la rejilla del mismo autor | no disponible | no disponible | no disponible | no disponible | Llama 3.1 Community |
| Otros modelos comprimidos de ~8B (por ejemplo, destilaciones o podas de Llama 3.1) | no disponible | no disponible | no disponible | no disponible | variable |

La busqueda web realizada no devolvio resultados utiles (unicamente una pagina sin contenido relevante), por lo que no se dispone de datos de terceros para completar la comparativa con cifras verificadas.

## Limitaciones y advertencias

- No es un modelo desplegable: el propio autor lo describe como artefacto de investigacion y advierte de que varias celdas de la rejilla estan degradadas deliberadamente en seguridad respecto a Llama-3.1-8B-Instruct.
- La compresion por si sola eleva la tasa de exito de ataques; esta celda concreta presenta ASR bajo en las metricas publicadas, pero el comportamiento no debe extrapolarse a otras celdas ni asumirse estable fuera del arnes de evaluacion empleado.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o equidad en la informacion disponible. Al derivar del modelo base, hereda los sesgos de este, potencialmente amplificados o alterados por la compresion.
- Alucinacion: no hay mediciones de fidelidad factual ni de tasas de alucinacion. La perplejidad de 15,5225 en WikiText-2 no permite por si sola descartar degradacion en tareas de conocimiento.
- Sobrerrechazo elevado: el valor de 0,4486 en la metrica macro de WildGuard indica que el modelo rechaza una proporcion significativa de peticiones benignas, lo que lo hace poco adecuado como asistente de uso real.
- Contexto e idiomas: no verificados en este repositorio; los valores de 128.000 tokens y el soporte multilingue son herencia del modelo base y no estan validados tras la compresion.
- Restricciones de licencia: se aplica la Llama 3.1 Community License, con los terminos adicionales de `USE_POLICY.md` incluidos en el repositorio. Cualquier uso comercial de este derivado queda sujeto a ambas, incluida la clausula de atribucion "Built with Llama".
- Reproducibilidad limitada a la celda: los resultados solo son validos para la regla `gap`, el presupuesto del 1,000% y la semilla 42.
- Sin datos de despliegue: no hay informacion de latencia, throughput, consumo ni comportamiento bajo carga concurrente.
- Popularidad nula en el momento de la consulta (0 descargas, 0 likes), lo que implica ausencia de validacion independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_keep70_gap_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Ficheros de licencia y politica de uso incluidos en el repositorio: `LICENSE` y `USE_POLICY.md` en https://huggingface.co/Jeesup/svd-safety-l31_keep70_gap_b010/tree/main
- Paper, blog o repositorio del metodo SVD-LLM: no disponible en la informacion proporcionada.
- Demos: no disponibles.
- La busqueda web realizada no devolvio enlaces relevantes adicionales.
