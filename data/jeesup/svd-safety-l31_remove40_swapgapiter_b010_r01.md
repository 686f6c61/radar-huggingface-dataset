# Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r01

## Resumen

`Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r01` es un checkpoint derivado de `meta-llama/Llama-3.1-8B-Instruct` que ha sido comprimido con SVD-LLM, una tecnica de truncamiento por descomposicion en valores singulares que elimina el 40,02% de los parametros densos y deja el modelo en una fraccion de 0,5998 respecto del original. Sobre ese checkpoint comprimido se aplica despues una edicion a nivel de parametros: un intercambio iterativo descrito como "neutro en parametros" que retira 1.321 componentes y reinserta otros 1.321, en total 6.975.488 parametros (el 0,10% de los parametros de proyeccion densos), siguiendo la regla de seleccion denominada `gap_iter`.

No se trata de un asistente conversacional desplegable, sino de un artefacto de investigacion integrado en una rejilla experimental sobre reglas de seleccion de componentes y presupuestos de restauracion. El objetivo del estudio es medir como la compresion por SVD degrada el comportamiento de seguridad del modelo y que criterio de seleccion repara mejor ese dano. Este checkpoint concreto corresponde a 1 de las 10 rondas iterativas previstas; el presupuesto total del experimento es del 1,000% de los parametros densos y cada ronda consume un 0,100%.

Su relevancia actual es doble. Por un lado, cuantifica el coste en seguridad que introducen las tecnicas de compresion, un aspecto poco documentado en la literatura habitual de cuantizacion y poda. Por otro, el propio autor advierte de que varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto al modelo base y de que la compresion por si sola eleva la tasa de exito de ataque, por lo que cualquier uso debe partir de una evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3.1, con compresion de bajo rango SVD-LLM y edicion posterior de parametros |
| Parametros totales | 8.030.261.248 segun los metadatos de safetensors; la model card declara una fraccion resultante de 0,5998 respecto del denso (vease la discrepancia en limitaciones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base declara 128.000 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no se ofrecen GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | no disponible (la model card no enumera idiomas) |
| Licencia | Llama 3.1 Community License (etiqueta `llama3.1`); el repositorio incluye `LICENSE` y `USE_POLICY.md` |
| Formato de pesos | safetensors, cargables con la libreria `transformers` |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Tamano del repositorio | 16,1 GB |
| Tipo de compresion | SVD-LLM, 40,02% de parametros eliminados |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000% de los parametros densos (0,100% por ronda, 10 rondas previstas) |
| Semilla | 42 |

## Arquitectura y entrenamiento

El punto de partida es un transformer decoder-only denso de la familia Llama 3.1. La primera transformacion es la compresion SVD-LLM, que aproxima las matrices de pesos mediante una descomposicion en valores singulares truncada: se conservan los componentes dominantes y se descartan los restantes, reduciendo el rango de las proyecciones. Segun la model card, este paso elimina el 40,02% de los parametros y deja una fraccion resultante de 0,5998. La segunda transformacion es una edicion de parametros post-hoc, no un reentrenamiento: en cada ronda se retiran 1.321 componentes y se insertan otros 1.321, con valor de intercambio `insert` (solo el valor de insercion) y desalojo ordenado por sigma. El resultado declarado es un numero de parametros equivalente al de partida, pero con una identidad distinta de componentes activos. La model card no describe la formulacion interna de la regla `gap_iter` ni como prioriza unos componentes frente a otros, por lo que no es posible detallar su criterio de seleccion con la informacion disponible.

No hay datos de entrenamiento que reportar: no se ha realizado ningun fine-tuning, ajuste por RLHF ni DPO sobre este checkpoint. Todo el proceso es una intervencion sobre los pesos del modelo ya entrenado, ejecutada con semilla 42. El checkpoint publicado es intermedio: corresponde a 1 de las 10 rondas iterativas del presupuesto total del 1,000%, de modo que no representa el resultado final de la intervencion. La unica innovacion tecnica destacable es la combinacion de dos etapas (compresion de bajo rango y restauracion selectiva de componentes) dentro de un diseno experimental que compara reglas de seleccion y presupuestos.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad del modelo base instruct, aunque la compresion del 40% y la edicion posterior pueden degradarla; la model card no cuantifica esa degradacion.
- Razonamiento y matematicas: no hay ninguna evaluacion publicada en la informacion disponible; se desconoce el impacto de la compresion.
- Generacion de codigo: no evaluada en este checkpoint.
- Tool calling / function calling: no documentado para este checkpoint. El modelo base lo soporta, pero no se ha medido si la compresion lo preserva.
- Uso como agente y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingues: no documentadas; la model card no enumera idiomas.
- Capacidad especifica del artefacto: servir como sujeto experimental para medir tasas de exito de ataque (ASR) y de sobrerrechazo bajo compresion, con resultados instrumentados mediante HarmBench y WildGuard.
- No dispone de modo de razonamiento explicito (thinking mode) ni de capacidades de vision o audio.

## Casos de uso

- Estudio de degradacion de seguridad por compresion: la celda sirve para medir cuanto sube la ASR cuando se elimina el 40% de los parametros, comparando su 0,2950 en AdvBench con el modelo denso de referencia.
- Comparacion de reglas de seleccion de componentes: al ser una celda de una rejilla, permite aislar el efecto de `gap_iter` frente a otras reglas con el mismo presupuesto y la misma semilla.
- Reproducibilidad del pipeline SVD-LLM: el desglose de provenance (1321 componentes retirados, 1321 insertados, semilla 42) permite replicar la ronda 1 y verificar el procedimiento de edicion.
- Auditoria de checkpoints derivados: util como caso de prueba para pipelines de red teaming que deban detectar modelos con seguridad degradada antes de su publicacion o despliegue.
- Medicion del equilibrio seguridad-utilidad: el par de metricas ASR / sobrerrechazo (0,1873 en macro over-refusal con WildGuard) permite estudiar si la restauracion de seguridad se paga con rechazos excesivos en peticiones benignas.
- Validacion de arneses de evaluacion: los tres jueces empleados (HarmBench para AdvBench y StrongREJECT, WildGuard para rechazo) lo convierten en un objetivo util para probar la estabilidad de dichos instrumentos.
- Investigacion en interpretabilidad de pesos: el par de conjuntos retirado e insertado permite analizar que componentes concretos concentran el comportamiento de seguridad.
- Docencia e investigacion academica: como ejemplo reproducible de como una tecnica de compresion agresiva puede alterar propiedades funcionales sin cambiar el numero de parametros.

## Benchmarks y rendimiento

| Metrica | Valor | Instrumento de evaluacion |
|---|---|---|
| AdvBench ASR | 0,2950 | juez HarmBench |
| StrongREJECT ASR | 0,1850 | juez HarmBench |
| Macro over-refusal | 0,1873 | WildGuard |

Los tres valores proceden exclusivamente de la model card del autor. No se publican resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba de capacidades generales, y tampoco se ofrecen los valores del modelo base denso ni de las restantes celdas de la rejilla, por lo que no es posible calcular deltas ni interpretar si estas cifras representan una mejora o un empeoramiento respecto al punto de partida. La model card afirma cualitativamente que la compresion por si sola eleva la tasa de exito de ataque, pero no cuantifica ese incremento en la informacion disponible.

## Requisitos de hardware

- Inferencia en bf16/fp16: los metadatos de safetensors declaran 8.030.261.248 parametros, lo que equivale a unos 16,06 GB solo en pesos, coherente con el tamano del repositorio (16,1 GB). Se recomiendan 24 GB de VRAM para operar con margen.
- Inferencia en 8 bits (previa conversion propia): en torno a 8-9 GB de pesos.
- Inferencia en 4 bits (previa conversion propia): en torno a 4,5-5,5 GB de pesos.
- Cache KV: con la configuracion de atencion con consultas agrupadas del modelo base (32 capas, 8 cabezas KV, dimension de cabeza 128), el cache en fp16 ronda los 128 KiB por token, aproximadamente 16 GiB a 128.000 tokens. La memoria total necesaria crece de forma notable con el contexto.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para contexto largo y lotes grandes; RTX 4090, RTX 3090 o RTX A5000 (24 GB) para bf16 con contexto moderado.
- GPU de consumo: si cabe. En 4 bits funciona en tarjetas de 8-12 GB como la RTX 3060 12 GB o la RTX 4060 Ti 16 GB; en bf16 requiere 24 GB.
- Opciones de despliegue: `transformers` de forma nativa; TGI (el repositorio incluye la etiqueta `text-generation-inference`); HF Inference Endpoints (etiqueta `endpoints_compatible`); vLLM. Para llama.cpp u Ollama seria necesario convertir y cuantizar los pesos por cuenta propia, ya que no se publican ficheros GGUF.
- Latencia y throughput: no disponibles. Dependeran del backend, del grado de cuantizacion y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Estado |
|---|---|---|---|---|---|
| svd-safety-l31_remove40_swapgapiter_b010_r01 | 8,03 B declarados (fraccion 0,5998 en la ficha) | no especificado (128.000 en el base) | Llama 3.1 Community License | Artefacto de investigacion sobre compresion y seguridad | Repositorio publico, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | Asistente instructivo de proposito general | Publico y ampliamente desplegado |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.000 tokens | Apache 2.0 | Asistente instructivo de proposito general | Publico y ampliamente desplegado |
| Qwen2.5-7B-Instruct | 7,61 B | 128.000 tokens (ampliable con YaRN) | Apache 2.0 | Asistente instructivo de proposito general, fuerte en codigo y matematicas | Publico y ampliamente desplegado |

La comparacion relevante para interpretar este checkpoint es contra su propio modelo base, y en ese eje la informacion disponible no permite establecer conclusiones de rendimiento: se desconocen las cifras de ASR y de sobrerrechazo del modelo denso, asi como cualquier metrica de capacidades generales. Frente a las alternativas de 7-8 B con licencia permisiva, la diferencia principal no es de rendimiento sino de naturaleza: este checkpoint es un sujeto experimental y no un modelo de uso general. Los datos de Mistral y Qwen proceden de su documentacion publica y no forman parte de los resultados de busqueda de esta ficha; conviene verificarlos antes de tomar decisiones con ellos.

## Limitaciones y advertencias

- No es un modelo desplegable. La propia model card indica que debe tratarse cada celda como un sujeto experimental y no como un asistente listo para usar.
- Seguridad degradada: las tasas de exito de ataque reportadas (0,2950 en AdvBench y 0,1850 en StrongREJECT) son altas en terminos absolutos. El autor advierte ademas de que varias celdas de la rejilla estan deliberadamente degradadas respecto al modelo base.
- Riesgo de alucinacion: no medido. Es razonable esperar un comportamiento igual o peor que el del modelo denso tras eliminar el 40% de los parametros, pero no hay datos que lo cuantifiquen.
- Perdida de capacidades generales: no evaluada. No hay ninguna prueba de razonamiento, codigo o matematicas sobre este checkpoint.
- Idiomas: no documentados. Se desconoce si la compresion y la edicion afectan de forma desigual a idiomas distintos del ingles.
- Contexto: la model card no especifica la ventana efectiva; asumir los 128.000 tokens del base sin verificarlo puede provocar fallos en produccion.
- Discrepancia en el recuento de parametros: safetensors declara 8.030.261.248 parametros y el repositorio ocupa 16,1 GB (compatible con unos 8.000 millones de parametros en bf16), mientras que la ficha declara una fraccion resultante de 0,5998. La informacion disponible no aclara si el recuento incluye los factores de la descomposicion o si procede del config del modelo original. Conviene inspeccionar el repositorio antes de asumir una reduccion real de memoria.
- Checkpoint intermedio: corresponde a la ronda 1 de 10. No es el resultado final de la intervencion ni el mejor candidato de la rejilla.
- Falta de validacion externa: 0 descargas y 0 interacciones en el momento de redactar esta ficha.
- Licencia: Llama 3.1 Community License. Permite uso comercial con condiciones, incluida la clausula de 700 millones de usuarios activos mensuales y los requisitos de atribucion ("Built with Llama"). El repositorio incluye `LICENSE` y `USE_POLICY.md`, cuyo cumplimiento es obligatorio para cualquier uso derivado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r01
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Perfil del autor: https://huggingface.co/Jeesup
- Licencia y politica de uso: los ficheros `LICENSE` y `USE_POLICY.md` se incluyen en el propio repositorio del modelo
- Tecnica de compresion: SVD-LLM, citada en la model card; no se ha encontrado un enlace al articulo o al repositorio en la busqueda realizada
- Nota sobre la busqueda web: los resultados obtenidos no guardan ninguna relacion con el modelo (paginas sobre Patreon y sobre numeracion romana), por lo que no hay papers, blogs, demos ni repositorios adicionales que enlazar.
