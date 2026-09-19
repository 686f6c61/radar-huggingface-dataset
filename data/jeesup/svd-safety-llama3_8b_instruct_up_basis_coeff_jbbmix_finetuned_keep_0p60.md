# Jeesup/svd-safety-llama3_8b_instruct_up_basis_coeff_jbbmix_finetuned_keep_0p60

## Resumen

Este modelo es una variante comprimida de `meta-llama/Meta-Llama-3-8B-Instruct` obtenida mediante la tecnica Basis Sharing del grupo TUDa-HWAI, seguida de una recuperacion de calidad con LoRA entrenada unicamente sobre los coeficientes de la descomposicion. El autor, Jeesup, publica el checkpoint como artefacto de investigacion sobre compresion y seguridad, no como modelo listo para produccion: retiene el 60 % de los parametros (fraccion realizada 0,599853515625) y mantiene 8.030.261.248 parametros reales en formato denso.

La particularidad del experimento es que el conjunto de calibracion mezcla 256 secuencias de WikiText-2 de 2048 tokens con dos secuencias empaquetadas de comportamientos daninos de JailbreakBench (`jbb_harmful:2`, un 0,78 % de los tokens de calibracion). El objetivo declarado es medir si introducir datos de seguridad en esa fase preserva la capacidad de rechazo tras la compresion. El resultado es que no: el propio autor advierte que la compresion a este ratio degrada el comportamiento de rechazo, y que las metricas de seguridad de un modelo degenerado no son evidencia sobre alineacion.

El modelo no ahorra espacio en disco: los factores se pliegan de vuelta a formas densas de Llama, de modo que el repositorio ocupa 16,1 GB y se carga con `transformers` estandar sin codigo de modelado personalizado. Es, por tanto, un modelo de rango deficiente, no un modelo mas pequeno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama 3 (el checkpoint se pliega a formas densas de Llama); compresion Basis Sharing con bases compartidas entre capas adyacentes |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; hereda la configuracion del modelo base |
| Tipos de cuantizacion | No se publican GGUF ni variantes cuantizadas; el repositorio contiene pesos safetensors densos |
| Idiomas soportados | No disponibles |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Ratio de compresion | 40 % de parametros eliminados; fraccion retenida realizada 0,599853515625 |
| Tamano del repositorio | 16,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El pipeline de compresion parte de los pesos del modelo base y aplica una SVD blanqueada sobre cada grupo de pesos: dos capas adyacentes comparten una unica base por tipo de peso. Los tipos compartidos son `v`, `k`, `q`, `up` y `gate`; los tipos `down` y `o` permanecen privados por capa. Despues se entrena una LoRA sobre los coeficientes con las bases congeladas, se fusiona (`C' = C + (alpha/r)BA`) y finalmente se pliega `W = C' @ B` a denso. Al congelar las bases, cada peso conserva rango <= k, cada grupo sigue compartiendo una base y el presupuesto de parametros se mantiene exactamente tras la recuperacion.

La recuperacion usa LoRA con r=8, alpha=16, 2 epocas, learning rate 0,0001 y batch 64 sobre `yahma/alpaca-cleaned`. Solo se entrenan los coeficientes; las bases compartidas y por capa son identicas bit a bit a las del modelo comprimido. Este no es el LoRA propio de Basis Sharing (wikitext, batch 1, solo q/v): se emplea la receta alpaca del proyecto para que los datos de recuperacion sean constantes entre metodos. La calibracion usa 256 secuencias de WikiText-2 de 2048 tokens con semilla 42 (el codigo upstream fija la semilla 2023; este proyecto calibra todos los metodos con una unica semilla) mas 2 secuencias empaquetadas de los 100 comportamientos daninos de JailbreakBench, con prompt y cabecera de asistente pero sin respuesta. El codigo de referencia del metodo esta en el repositorio TUDa-HWAI/Basis_Sharing, commit `1c021b6ce1d3`.

Un detalle tecnico relevante: como la LoRA entrena el modelo factorizado `ShareLlama`, la codificacion posicional importa. Se usan las tablas rotatorias propias de `transformers` construidas a partir de la config del modelo, verificadas como identicas a Llama estandar en float64 para los ajustes publicados (RoPE base 1e4 / 5e5 / 1e6, escalado de llama3, atencion de consultas agrupada y sesgos en q/k/v), segun el test `tests/check_share_llama_exact.py`.

## Capacidades

- Generacion de texto conversacional en formato chat, con la plantilla de chat del modelo base y decodificacion greedy en las evaluaciones.
- Razonamiento de sentido comun y respuesta a preguntas de opcion multiple: los resultados en HellaSwag, WinoGrande, PIQA, ARC, OpenBookQA y MathQA indican que conserva parte de estas capacidades tras la compresion.
- Conocimiento factual y de lenguaje general, medido indirectamente mediante perplejidad en WikiText-2 (17,7181).
- Comportamiento de rechazo residual ante peticiones daninas: ASR de 0,1481 en AdvBench/HarmBench y 0,2077 en StrongREJECT/HarmBench, con tasas de sobrerrechazo de 0,1224 (XSTest-safe) y 0,1594 (OR-Bench-Hard-1K).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada; el autor no lo documenta ni lo evalua.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se han publicado evaluaciones de este tipo.
- Capacidades multilingues: no disponibles; el modelo base es mayoritariamente ingles y no se documentan idiomas adicionales.
- Capacidades especiales (vision, audio, thinking mode): no disponibles. Es un modelo exclusivamente de texto.

## Casos de uso

- Investigacion sobre compresion de modelos: el checkpoint sirve como punto de comparacion reproducible dentro del proyecto Basis Sharing, ya que la receta de recuperacion (alpaca, LoRA r=8) es identica a la de los demas compresores evaluados.
- Estudio del efecto de datos de seguridad en la calibracion: esta variante concreta existe para aislar la contribucion de mezclar JailbreakBench en el conjunto de calibracion frente a la celda equivalente sin esa mezcla, a igual ratio de compresion.
- Auditoria de alineacion y sobrerrechazo: las salidas por prompt y las metricas crudas en `utility/` y `safety/` permiten analizar la relacion entre ASR y tasa de rechazo excesivo en un modelo degradado.
- Reproduccion de experimentos de rango deficiente: al cargarse con `transformers` estandar y sin codigo personalizado, facilita verificar como afecta la deficiencia de rango al comportamiento del modelo sin necesidad de infraestructura especial.
- Analisis de robustez de evaluadores automaticos: las evaluaciones usan `cais/HarmBench-Llama-2-13b-cls` y `allenai/wildguard` como jueces, de modo que el modelo sirve para estudiar el comportamiento de estos clasificadores ante generaciones degeneradas.
- Docencia y divulgacion tecnica: ilustra de forma tangible la diferencia entre compresion estructural (bases compartidas y bajo rango) y reduccion real de huella en disco, ya que el checkpoint pliega a denso y ocupa 16,1 GB.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni despliegue orientado a usuarios finales: no hay evidencia publicada que lo respalde y el autor advierte de la degradacion del rechazo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Fraccion de parametros retenida | 0,5999 |
| WikiText-2 (perplejidad) | 17,7181 |
| ARC-Easy (acc_norm) | 0,5762 |
| ARC-Challenge (acc_norm) | 0,3549 |
| HellaSwag (acc_norm) | 0,5773 |
| WinoGrande (acc) | 0,6409 |
| OpenBookQA (acc_norm) | 0,3880 |
| PIQA (acc_norm) | 0,7106 |
| MathQA (acc_norm) | 0,2764 |
| AdvBench HarmBench ASR | 0,1481 |
| StrongREJECT HarmBench ASR | 0,2077 |
| Sobrerrechazo (XSTest-safe) | 0,1224 |
| Sobrerrechazo (OR-Bench-Hard-1K) | 0,1594 |
| Sobrerrechazo macro | 0,1409 |

No se proporcionan resultados de benchmarks para el modelo base ni para otras alternativas, por lo que no es posible construir una comparacion numerica directa con los datos disponibles. El juicio de sobrerrechazo se marca como fiable en esta celda (fraccion puntuada de 0,98 en XSTest-safe y 0,99 en OR-Bench-Hard-1K). Los resultados por prompt y los ficheros crudos estan en `utility/` y `safety/`.

## Requisitos de hardware

- VRAM para inferencia en FP16/BF16: aproximadamente 16 GB solo para pesos, mas activaciones y cache KV (estimacion derivada de los 8.030.261.248 parametros y del tamano de repositorio de 16,1 GB).
- VRAM en cuantizacion de 8 bits: del orden de 8-9 GB; en 4 bits, del orden de 4-5 GB. Estas cifras son estimaciones aritmeticas: no se publican pesos cuantizados en el repositorio.
- GPU profesionales: A100 40/80 GB, H100, L40S o A6000 permiten servir el modelo en FP16 con margen para lotes y contextos largos.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 de 24 GB en FP16 con contexto moderado; en GPUs de 12-16 GB requeriria cuantizacion, que no esta publicada.
- Opciones de despliegue: `transformers` estandar es la via soportada, ya que los factores se pliegan a formas densas de Llama. vLLM o TGI serian viables tratandolo como un Llama 3 8B denso. Para llama.cpp u Ollama haria falta convertir a GGUF, conversion que el autor no proporciona.
- Latencia y throughput: no disponibles. No se publican mediciones de velocidad, y la deficiencia de rango puede alterar el rendimiento real respecto a un Llama 3 8B denso convencional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-llama3_8b_instruct_up_basis_coeff_jbbmix_finetuned_keep_0p60 | 8.030.261.248 (fraccion retenida 0,5999) | No disponible | Ver tabla de benchmarks de esta ficha | llama3 | safetensors, 0 descargas |
| meta-llama/Meta-Llama-3-8B-Instruct (modelo base) | 8.030.261.248 | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | llama3 | safetensors, ampliamente desplegado |
| Otras celdas del proyecto Basis Sharing (mismo ratio, distinta calibracion) | ~8,03 mil millones de parametros densos | No disponible | No disponible en la informacion proporcionada | llama3 (derivada) | Referenciadas por el autor, no listadas aqui |
| Modelos comprimidos de la misma familia (poda, cuantizacion) | Variable | No disponible | No disponible | Variable | No disponible |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y formato de publicacion.

## Limitaciones y advertencias

- Degradacion del rechazo: el propio autor indica que la compresion a este ratio degrada el comportamiento de rechazo. Las metricas de seguridad de esta celda no deben interpretarse como evidencia sobre alineacion.
- Modelo degenerado por diseno experimental: la celda existe para medir el efecto de los datos de seguridad en la calibracion, no para ofrecer un modelo utilizable.
- Sesgos: no se documenta ningun analisis de sesgos. Al derivar del modelo base, hereda los sesgos de Meta Llama 3 8B Instruct, pero no hay evaluacion especifica disponible.
- Alucinacion: no hay evaluaciones de veracidad ni de tasa de alucinacion en la informacion proporcionada.
- Cobertura de idiomas: no disponible. No se documentan idiomas soportados ni evaluaciones fuera del ingles.
- Deficiencia de rango: los pesos conservan rango <= k por construccion. Aunque el modelo se pliega a formas densas, esto puede afectar a la calidad de forma no uniforme entre capas y tipos de peso.
- Sin ahorro de memoria en disco ni en VRAM: el checkpoint ocupa 16,1 GB y no reduce la huella respecto al modelo base.
- Licencia: Llama 3 Community License. Cualquier uso comercial queda sujeto a sus terminos, incluidos requisitos de atribucion y condiciones para despliegues a gran escala. No es una licencia de codigo abierto permisiva.
- Sin adopcion ni validacion externa: 0 descargas y 0 likes en el momento de los datos; no hay pipeline declarado ni evaluaciones de terceros.
- Ausencia de artefactos de despliegue: no se publican pesos GGUF ni cuantizados, ni scripts de servidor.
- Fechas del repositorio: los metadatos indican creacion y actualizacion en septiembre de 2026, valores que conviene verificar antes de citarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-llama3_8b_instruct_up_basis_coeff_jbbmix_finetuned_keep_0p60
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Codigo de Basis Sharing: https://github.com/TUDa-HWAI/Basis_Sharing (commit `1c021b6ce1d3`)
- Dataset de recuperacion: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset de calibracion: WikiText-2 (https://huggingface.co/datasets/Salesforce/wikitext)
- Dataset de seguridad usado en la calibracion: JailbreakBench (https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors)
- Juez de seguridad de generacion: https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
- Juez de sobrerrechazo: https://huggingface.co/allenai/wildguard
- Benchmarks de seguridad citados: AdvBench, StrongREJECT, XSTest, OR-Bench (enlaces concretos no proporcionados en la informacion disponible)
- Enlaces relevantes hallados en la busqueda web: no disponible. Los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo (contenido sobre cortes de agua en Odesa).
