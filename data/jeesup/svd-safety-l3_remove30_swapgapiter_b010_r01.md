# Jeesup/svd-safety-l3_remove30_swapgapiter_b010_r01

## Resumen

`Jeesup/svd-safety-l3_remove30_swapgapiter_b010_r01` es un checkpoint derivado de `meta-llama/Meta-Llama-3-8B-Instruct` al que se le ha aplicado una compresion por descomposicion en valores singulares (SVD-LLM) que elimina el 30,01% de los parametros densos, dejando una fraccion de parametros efectiva de 0,6999. Sobre ese modelo comprimido se ha ejecutado una edicion posterior de "swap parametro-neutral" iterativo, seleccionada por la regla `gap_iter`, que en este checkpoint corresponde unicamente a 1 de las 10 rondas previstas, con un presupuesto de restauracion de 0,100% de los parametros densos en esta ronda (1,000% para la ejecucion completa). Se trata, por tanto, de una celda intermedia de una rejilla experimental que cruza reglas de seleccion de componentes y presupuestos de restauracion.

El interes del artefacto no es su calidad como asistente, sino que cuantifica un fenomeno relevante para quien despliega modelos comprimidos: la compresion por SVD degrada el comportamiento de seguridad, y este estudio mide cuanto y prueba si la restauracion selectiva de componentes lo repara. El autor publica metricas de tasa de exito de ataque (ASR) frente a AdvBench y StrongREJECT, ademas de una tasa de sobrerrechazo macro medida con WildGuard, lo que permite comparar brazos de la rejilla.

El checkpoint fue creado el 17 de septiembre de 2026, tiene 0 descargas y 0 likes, pesa 16,1 GB en el repositorio y se distribuye con licencia Meta Llama 3 Community License. La model card advierte explicitamente de que varias celdas de la rejilla estan degradadas deliberadamente en seguridad respecto al modelo base y de que el modelo no debe tratarse como un asistente desplegable. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (los resultados obtenidos corresponden a paginas institucionales de la Region valona, sin relacion con el artefacto).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3) con pesos comprimidos mediante SVD-LLM; el autor no detalla la configuracion de capas en la informacion proporcionada |
| Parametros totales | 8.030.261.248 elementos en safetensors; fraccion de parametros efectiva declarada de 0,6999 (30,01% eliminado por SVD) |
| Longitud de contexto | 8.192 tokens segun las especificaciones del modelo base Llama-3-8B-Instruct; no confirmado por el autor en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Meta Llama 3 Community License (`llama3`) |
| Formato de pesos | safetensors |
| Modelo base | `meta-llama/Meta-Llama-3-8B-Instruct` |
| Regla de seleccion de componentes | `gap_iter` |
| Presupuesto de restauracion | 1,000% de parametros densos (0,100% por ronda) |
| Componentes restaurados / sustituidos | 1.304 / 1.304 |
| Parametros intercambiados | 6.971.392 (0,10% de los parametros de proyeccion densos) |
| Valor de swap | `insert` (solo valor de insercion; desalojo ordenado por sigma) |
| Semilla | 42 |
| Rondas iterativas aplicadas | 1 de 10 |
| Tamano del repositorio | 16,1 GB |
| Libreria / pipeline | transformers / text-generation |

Nota sobre el recuento de parametros: el numero de elementos declarado en safetensors (8.030.261.248) coincide con el del modelo base sin comprimir, mientras que la model card declara una fraccion de parametros efectiva de 0,6999. Esto es coherente con que los tensores conserven la forma original y la reduccion de rango de SVD actue sobre el rango efectivo de las matrices de proyeccion.

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: parte de `meta-llama/Meta-Llama-3-8B-Instruct` y se somete a dos transformaciones. La primera es SVD-LLM, una compresion basada en descomposicion en valores singulares que elimina el 30,01% de los parametros (fraccion resultante 0,6999). La segunda es un procedimiento de edicion por intercambio de componentes ("swap") parametro-neutral, aplicado de forma iterativa en rondas de 0,100% del total de parametros densos; en este checkpoint solo se ha aplicado la primera de diez rondas. La regla de seleccion empleada, `gap_iter`, determina que componentes se restauran y cuales se desalojan, con un criterio de desalojo ordenado por valor sigma y un valor de swap de tipo `insert`, es decir, usando unicamente el valor de insercion.

La innovacion tecnica que documenta el artefacto es metodologica, no arquitectonica: se trata de medir como la compresion SVD degrada el comportamiento de seguridad de un instruct model y de comparar reglas de seleccion de componentes (`gap_iter` frente a otras) en funcion del presupuesto de restauracion. La model card pertenece a una rejilla de experimentos en la que cada celda varia la regla de seleccion y el presupuesto. No se especifican en la informacion proporcionada los datos de entrenamiento o ajuste, el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO adicional; el autor indica que el checkpoint es un artefacto de investigacion y una ronda intermedia de una ejecucion mas larga, no un modelo final.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad del modelo base Llama-3-8B-Instruct, si bien el autor advierte que no debe tratarse como un asistente desplegable.
- Razonamiento y codigo: capacidades heredadas del modelo base, no reevaluadas ni documentadas por el autor en esta ficha.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada (el modelo base lo soporta, pero no hay confirmacion para este checkpoint comprimido y editado).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el autor no declara lista de idiomas.
- Capacidad principal y verificada: servir como sujeto experimental para medir el efecto de la compresion SVD y de la restauracion selectiva sobre el rechazo de peticiones daninas y sobre el sobrerrechazo, con metricas de ASR publicadas.
- No se declaran capacidades de vision, audio ni modo "thinking".

## Casos de uso

- Evaluacion de seguridad de modelos comprimidos: usar el checkpoint como brazo de control en un banco de pruebas propio, midiendo ASR con AdvBench o StrongREJECT y comparandolo con el modelo base sin comprimir y con otras celdas de la rejilla para aislar el efecto de la compresion SVD.
- Estudio de reglas de seleccion de componentes: comparar la regla `gap_iter` con las alternativas de la rejilla (mismo presupuesto, distinta regla) para determinar que criterio de restauracion recupera mejor el comportamiento de rechazo con el menor numero de parametros intercambiados (6.971.392 por ronda en este caso).
- Analisis del equilibrio seguridad-utilidad: emplear la metrica de sobrerrechazo macro (0,1780 con WildGuard) junto a las de ASR para construir curvas de compromiso y decidir si compensa restaurar mas componentes.
- Red teaming academico: generar un corpus de peticiones adversarias y medir como responde un modelo deliberadamente degradado en seguridad, siempre en entorno aislado y sin exposicion publica, dado que el propio autor senala que algunas celdas de la rejilla estan degradadas a proposito.
- Investigacion en interpretabilidad: estudiar que subconjuntos de parametros de proyeccion son responsables del comportamiento de rechazo, aprovechando que el artefacto documenta exactamente cuantos componentes se restauran y con que regla.
- Reproducibilidad de experimentos: partir de la semilla declarada (42) y de la ronda intermedia publicada para reproducir una ejecucion completa de diez rondas y verificar la trayectoria de las metricas ronda a ronda.
- Analisis de artefactos derivados de Llama 3: caso de estudio sobre como se propaga la licencia Meta Llama 3 Community License a checkpoints derivados de terceros y que obligaciones impone a quien los redistribuye.

No se recomienda su uso en produccion como asistente conversacional, atencion al cliente, generacion de codigo en CI/CD ni cualquier escenario con usuarios finales: el autor lo desaconseja explicitamente y carece de evaluaciones de utilidad publicadas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,1250 |
| StrongREJECT ASR (juez HarmBench) | 0,0950 |
| Sobrerrechazo macro (WildGuard) | 0,1780 |

La informacion proporcionada no incluye resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba de capacidad general, ni valores de referencia del modelo base sin comprimir para contextualizar estas cifras. Los tres valores anteriores son tasas: dos de exito de ataque (cuanto mas bajo, mejor) y una de sobrerrechazo (cuanto mas baja, mejor). No se han publicado resultados de benchmarks de capacidad en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en precision completa: con 8.030.261.248 parametros almacenados en 16,1 GB (aproximadamente 2 bytes por parametro), se necesitan alrededor de 16 GB solo para los pesos, mas la cache KV; en la practica, del orden de 18 a 22 GB para secuencias de contexto moderado.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas, como la RTX 4090 o la RTX 3090, siempre que se limite la longitud de secuencia y el tamano de lote.
- GPUs de centro de datos recomendadas: A100 40 GB, A100 80 GB, H100 80 GB y equivalentes; no se requieren multiples GPU para inferencia en precision completa.
- Opciones de despliegue: el repositorio esta etiquetado con `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con TGI y con los Inference Endpoints de Hugging Face; tambien es cargable con transformers (libreria declarada) y, en principio, con vLLM. No se publican versiones GGUF ni cuantizadas, de modo que el uso con llama.cpp u Ollama requeriria convertir y cuantizar los pesos por cuenta propia.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad, y al tratarse de un checkpoint comprimido por reduccion de rango no se puede asumir la misma latencia que el modelo base sin medirlo.
- Nota: la compresion por SVD reduce el rango efectivo de las matrices, pero el recuento de elementos en safetensors coincide con el del modelo base, por lo que la huella de memoria en disco y en VRAM no se reduce en la misma proporcion que la fraccion de parametros efectiva declarada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l3_remove30_swapgapiter_b010_r01 | 8.030.261.248 elementos; fraccion efectiva 0,6999 | 8.192 tokens (modelo base; no confirmado por el autor) | AdvBench ASR 0,1250; StrongREJECT ASR 0,0950; sobrerrechazo macro 0,1780 | Meta Llama 3 Community License | Publicado en Hugging Face, 0 descargas, 0 likes; ronda 1 de 10 |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030.261.248 | 8.192 tokens | No disponible en la informacion proporcionada | Meta Llama 3 Community License | Ampliamente disponible |
| Otras celdas de la rejilla del mismo autor | No disponible | No disponible | No disponible | Meta Llama 3 Community License (presumiblemente) | No se han identificado en la informacion proporcionada |

No se dispone de datos publicados para establecer una comparacion cuantitativa con alternativas de compresion de la misma categoria (por ejemplo, otros metodos de pruning o de reduccion de rango aplicados a Llama-3-8B). La unica comparacion posible con los datos disponibles es cualitativa: el autor afirma que la compresion por si sola eleva la tasa de exito de ataque respecto a Llama-3-8B-Instruct, pero no se incluye en la informacion proporcionada la cifra de ASR del modelo base sin comprimir, por lo que no se puede cuantificar la diferencia.

## Limitaciones y advertencias

- No es un modelo de proposito general: el autor lo describe como artefacto de investigacion y celda de una rejilla experimental, no como asistente desplegable.
- Degradacion deliberada de seguridad: la model card advierte de que varias celdas de la rejilla estan degradadas en seguridad respecto a Llama-3-8B-Instruct y que la compresion por si sola eleva la tasa de exito de ataque. Este checkpoint concreto presenta un AdvBench ASR de 0,1250 y un StrongREJECT ASR de 0,0950, es decir, entre el 9,5% y el 12,5% de las peticiones adversarias evaluadas tuvieron exito.
- Sesgos conocidos: no documentados especificamente para este checkpoint; los del modelo base Llama-3-8B-Instruct aplican de forma heredada, pero no se han medido tras la compresion y edicion.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; la compresion por SVD puede degradar la fidelidad de forma no caracterizada.
- Sobrerrechazo: la metrica macro de sobrerrechazo medida con WildGuard es 0,1780, lo que indica que el modelo rechaza peticiones legitimas en una proporcion apreciable.
- Estado incompleto: solo se ha aplicado 1 de las 10 rondas iterativas previstas, por lo que el checkpoint representa un estado intermedio de una ejecucion mas larga y no el resultado final del experimento.
- Restricciones de licencia: se distribuye bajo la Meta Llama 3 Community License, con `LICENSE` y `USE_POLICY.md` incluidos en el repositorio. Cualquier uso comercial queda sujeto a esas condiciones, incluidas las obligaciones de atribucion ("Built with Meta Llama 3") y las restricciones de uso aceptable.
- Ausencia de validacion externa: 0 descargas y 0 likes en el momento de la consulta; no hay evaluaciones independientes ni pruebas de capacidad general publicadas.
- Reproducibilidad limitada: el checkpoint es una ronda intermedia con semilla 42, pero se desconoce si se publican los scripts y el resto de celdas necesarios para reproducir la rejilla completa.
- Advertencia operativa: antes de extraer cualquier conclusion, el propio autor recomienda evaluar el modelo uno mismo; no deberia exponerse a usuarios finales ni integrarse en sistemas con acceso a herramientas externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_remove30_swapgapiter_b010_r01
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Archivos de licencia y politica de uso: incluidos en el repositorio del modelo (`LICENSE` y `USE_POLICY.md`)
- Paper de SVD-LLM: no disponible en la informacion proporcionada
- Repositorio de codigo, demo o blog del autor: no disponible en la informacion proporcionada
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; los resultados devueltos correspondian a paginas institucionales de la Region valona, sin relacion con el artefacto
