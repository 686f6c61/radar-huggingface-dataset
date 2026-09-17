# Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r06

## Resumen

`svd-safety-l31_remove40_swapgapiter_b010_r06` es un checkpoint derivado de `meta-llama/Llama-3.1-8B-Instruct` publicado por el usuario Jeesup en HuggingFace. No es un modelo de proposito general, sino un artefacto de investigacion: se ha comprimido con SVD-LLM eliminando el 40,02 % de los parametros densos (fraccion resultante 0,5998) y despues se ha editado con 6 de las 10 rondas previstas de una tecnica de intercambio iterativo de parametros neutro respecto a la norma, guiada por la regla de seleccion `gap_iter`. Cada ronda toca hasta un 0,1 % de los parametros densos, con un presupuesto total de restauracion del 1,000 %.

El proposito declarado del autor es estudiar como la compresion por SVD degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion de componentes repara mejor ese dano. Este checkpoint concreto es una celda de una rejilla experimental sobre reglas y presupuestos, con semilla 42, 7.066 componentes restaurados y 7.066 desplazados, y 41.852.928 parametros insertados (0,60 % de los parametros de proyeccion densos). Las metricas publicadas confirman que la seguridad esta degradada respecto al modelo original: 0,37 de tasa de exito de ataque en AdvBench y 0,40 en StrongREJECT, con un 0,099 de sobrerrechazo macro segun WildGuard.

Su relevancia es metodologica mas que practica. Sirve para reproducir y auditar el compromiso entre seguridad y utilidad bajo compresion agresiva, y para comparar reglas de seleccion de componentes en estudios de interpretabilidad. El propio autor advierte que varias celdas de la rejilla estan deliberadamente degradadas en seguridad y que el checkpoint debe tratarse como sujeto experimental, no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (hereda la de Llama-3.1-8B-Instruct) |
| Parametros totales | 8.030.261.248 segun los safetensors del repositorio; el autor declara una fraccion de parametros densos de 0,5998 tras comprimir |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base declara 128.000 tokens, no confirmado para este checkpoint) |
| Tipos de cuantizacion | No disponible; no se publican pesos GGUF ni cuantizaciones precalculadas |
| Idiomas soportados | No disponible (el modelo base es multilingue; este checkpoint no lo especifica) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Compresion | SVD-LLM, 40,02 % de parametros eliminados |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000 % de parametros densos, en fragmentos de 0,100 % por ronda |
| Componentes restaurados / desplazados | 7.066 / 7.066 |
| Parametros insertados | 41.852.928 (0,60 % de los parametros de proyeccion densos) |
| Valor de intercambio | `insert` (solo valor de insercion; desalojo ordenado por sigma) |
| Rondas aplicadas | 6 de 10 (checkpoint intermedio) |
| Semilla | 42 |
| Tamano del repositorio | 16,1 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.1-8B-Instruct: un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU, RoPE y atencion por grupos (GQA). Sobre ese modelo no se ha realizado un entrenamiento adicional en el sentido habitual. El proceso aplicado es una compresion post-entrenamiento con SVD-LLM, que descompone en valores singulares las matrices de proyeccion y elimina componentes de bajo rango hasta alcanzar el 40,02 % de parametros eliminados, seguida de una edicion de parametros en la que se reinsertan componentes seleccionados por la regla `gap_iter`. El intercambio esta disenado para ser neutro respecto a la norma de los parametros, de modo que la reparacion no altere la escala de los pesos, y opera por rondas con un presupuesto del 0,1 % de los parametros densos por ronda.

No se documentan en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, fases de RLHF o DPO), mas alla de que procede de Llama-3.1-8B-Instruct, cuyo pipeline de alineacion es publico pero no se detalla en esta ficha. La innovacion tecnica del artefacto es precisamente el procedimiento de reparacion iterativa: el checkpoint publicado corresponde a la ronda 6 de 10, por lo que la ejecucion completa del estudio no esta reflejada en este repositorio.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada del modelo base.
- Razonamiento y respuesta a instrucciones de complejidad media, con la degradacion esperable por la perdida de componentes de proyeccion.
- Codigo y matematicas basicas: no se han publicado evaluaciones especificas para este checkpoint, por lo que el nivel real no esta cuantificado.
- Soporte de tool calling y function calling: heredado del formato de Llama-3.1-Instruct, no verificado para este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no verificadas.
- Capacidades multilingues: no declaradas para este checkpoint.
- Capacidad de investigacion destacada: permite medir tasa de exito de ataque (ASR) y sobrerrechazo bajo distintas reglas de seleccion de componentes, que es el eje del estudio.
- Modo de pensamiento explicito, vision o audio: no disponibles.

## Casos de uso

- Reproduccion de evaluaciones de seguridad bajo compresion: el checkpoint permite replicar la medicion de ASR en AdvBench y StrongREJECT con el juez HarmBench y contrastar los valores declarados (0,37 y 0,40) en una infraestructura propia.
- Estudios de interpretabilidad sobre seleccion de componentes: comparar la regla `gap_iter` frente a otras reglas de la misma rejilla, usando los 7.066 componentes identificados como unidad de analisis.
- Calibracion de jueces automaticos: los pares de metricas ASR y sobrerrechazo (0,099 en WildGuard) sirven para comprobar la sensibilidad de los clasificadores de seguridad ante modelos degradados.
- Investigacion sobre sobre-rechazo: medir si la restauracion de componentes recupera utilidad sin incrementar el rechazo de peticiones benignas.
- Docencia y divulgacion tecnica: ilustrar de forma tangible el efecto de la compresion SVD sobre el comportamiento alineado de un modelo de 8.000 millones de parametros.
- Generacion de trazas de red teaming para entrenar clasificadores de seguridad: al presentar una tasa de ataque elevada, es util como generador de ejemplos adversarios en un entorno controlado.
- Linea base experimental en estudios de compresion: sirve como punto de comparacion frente a la ronda final (10 de 10) y frente al modelo denso sin comprimir.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son metricas de seguridad, no benchmarks academicos de conocimiento o razonamiento.

| Metrica | Valor | Juez / herramienta |
|---|---|---|
| AdvBench ASR | 0,3700 | HarmBench judge |
| StrongREJECT ASR | 0,4000 | HarmBench judge |
| Sobrerrechazo macro | 0,0990 | WildGuard |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks equivalentes en la informacion disponible, ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada en fp16: en torno a 16-18 GB, coherente con un repositorio de 16,1 GB y con el recuento de parametros de 8.030.261.248 en safetensors. Ojo: el recuento absoluto de parametros coincide con el del modelo denso, de modo que no esta confirmado que la compresion se traduzca en un ahorro real de memoria en la carga estandar.
- VRAM estimada en int8: aproximadamente 8-10 GB con bitsandbytes, sin confirmacion del autor.
- VRAM estimada en 4 bits: aproximadamente 5-6 GB, no verificado y sin pesos GGUF publicados.
- GPU recomendadas: A100 40 GB u 80 GB, H100, L40S o RTX 4090 para fp16; RTX 3090 o RTX 4090 permiten inferencia en fp16 ajustada.
- Consumer GPU: cabe en RTX 4090 y en RTX 3090 en fp16; en tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti Super 16 GB) requeriria cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta presente) y endpoints compatibles. El uso con vLLM o llama.cpp no esta confirmado, ya que la estructura de pesos comprimidos puede no ser compatible con los kernels optimizados estandar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l31_remove40_swapgapiter_b010_r06 | 8.030.261.248 declarados; fraccion densa 0,5998 | No disponible | AdvBench ASR 0,37; StrongREJECT ASR 0,40 | Llama 3.1 Community | HuggingFace, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8.030.261.248 | 128.000 tokens segun el modelo base | No disponible en esta informacion | Llama 3.1 Community | HuggingFace, ampliamente desplegado |
| Otras celdas de la rejilla del mismo autor | No disponible | No disponible | No disponible | Llama 3.1 Community | Referenciadas pero no enlazadas en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos ni de otros checkpoints de compresion con edicion de seguridad en la informacion proporcionada, por lo que la comparativa queda limitada al modelo base.

## Limitaciones y advertencias

- Seguridad degradada de forma deliberada: el autor indica que la compresion por si sola eleva la tasa de exito de ataque y que el objetivo del estudio es cuantificar ese dano. AdvBench ASR de 0,37 y StrongREJECT ASR de 0,40 son valores altos para un modelo alineado.
- No es un asistente desplegable: la model card lo describe explicitamente como sujeto experimental, no como modelo de proposito general.
- Desajuste de parametros sin aclarar: el recuento de safetensors (8.030.261.248) coincide con el modelo denso sin comprimir, mientras que el autor declara una fraccion de 0,5998. Conviene verificar la estructura real del state dict antes de asumir ahorros de memoria o de computo.
- Checkpoint intermedio: corresponde a 6 de 10 rondas, por lo que no representa el resultado final del procedimiento de reparacion.
- Sesgos: no se documentan evaluaciones de sesgo para este checkpoint; hereda los del modelo base, potencialmente amplificados por la perdida de componentes.
- Alucinacion: la eliminacion de componentes de bajo rango puede incrementar la perdida de factualidad, pero no se aportan mediciones.
- Idiomas y contexto: no declarados para este checkpoint; no se debe asumir el soporte multilingue ni la ventana de 128.000 tokens del modelo base sin verificacion.
- Restricciones de licencia: Llama 3.1 Community License, con los ficheros LICENSE y USE_POLICY.md incluidos en el repositorio. Cualquier uso comercial queda sujeto a esa licencia y a las obligaciones de atribucion ("Built with Llama").
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa publica.
- Uso responsable: al tratarse de un modelo con seguridad reducida, cualquier evaluacion debe hacerse en entorno aislado.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r06
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
- La busqueda web realizada no devolvio resultados relevantes: los unicos enlaces recuperados corresponden a directorios de pizzerias en Ciudad de Mexico y no guardan relacion con el modelo. No se dispone de enlaces a papers, blogs, repositorios de codigo ni demos asociados a este checkpoint.
