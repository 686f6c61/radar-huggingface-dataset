# Jeesup/svd-safety-l31_remove20_swapgapiter_b010_r09

## Resumen

svd-safety-l31_remove20_swapgapiter_b010_r09 es un checkpoint derivado de meta-llama/Llama-3.1-8B-Instruct, publicado por el usuario Jeesup, que combina dos transformaciones sobre los pesos: una compresion por descomposicion en valores singulares con el metodo SVD-LLM, que elimina el 20,02 % de los parametros densos, y una reparacion posterior mediante 9 de las 10 rondas previstas de intercambio iterativo de componentes guiado por la regla `gap_iter`, con un presupuesto del 1,000 % de los parametros densos (8.676 componentes restaurados y 8.676 sustituidos, 62.779.392 parametros insertados, semilla 42).

El modelo no es un asistente conversacional de proposito general, sino un artefacto de investigacion sobre como la compresion SVD degrada el comportamiento de seguridad y que regla de seleccion de componentes lo repara mejor. Es una celda concreta dentro de una malla experimental que cruza reglas de seleccion y presupuestos de restauracion, y su propia model card advierte que varias celdas de esa malla estan deliberadamente degradadas en seguridad respecto al modelo base.

Los datos publicados se limitan a tres metricas de seguridad medidas con juez HarmBench y WildGuard: ASR de 0,0000 en AdvBench, ASR de 0,0250 en StrongREJECT y sobre-rechazo macro de 0,4239. No hay resultados de benchmarks de capacidad general, y el repositorio acumula 0 descargas y 0 likes, por lo que carece de validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) con matrices de proyeccion comprimidas por SVD de bajo rango |
| Parametros totales | 8.030.261.248 segun safetensors; la model card declara una fraccion de parametros resultante de 0,7998 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No declarada en la model card; el modelo base Llama-3.1-8B-Instruct soporta 128.000 tokens |
| Tipos de cuantizacion | No disponible; el repositorio solo distribuye safetensors (16,1 GB, formato compatible con bf16/fp16) |
| Idiomas soportados | No disponible en la model card; el modelo base declara 8 idiomas |
| Licencia | Llama 3.1 Community License (incluye LICENSE y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Compresion aplicada | SVD-LLM, 20,02 % de parametros eliminados |
| Regla de seleccion | `gap_iter`, valor de swap `insert`, expulsion ordenada por sigma |
| Presupuesto de restauracion | 1,000 % de los parametros densos (0,100 % por ronda) |
| Repositorio | Jeesup/svd-safety-l31_remove20_swapgapiter_b010_r09 |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Llama 3.1 con 8.030 millones de parametros en su version densa, sobre el que se aplica SVD-LLM: una descomposicion en valores singulares consciente del truncamiento que recorta el rango de las matrices de proyeccion y elimina el 20,02 % de los parametros. Sobre ese checkpoint comprimido se ejecuta un procedimiento de edicion de pesos, no de entrenamiento con datos: 9 rondas de intercambio parametro-neutral en las que se restauran 8.676 componentes y se sustituyen otros tantos, insertando 62.779.392 parametros (el 0,90 % de los parametros de proyeccion densos) con expulsion ordenada por valor singular y semilla fija 42.

El checkpoint publicado corresponde a una ronda intermedia de una ejecucion mas larga (9 de 10 rondas, con un presupuesto total previsto del 1,0 %). No hay informacion en la model card sobre tokens de entrenamiento adicionales, composicion de dataset, RLHF, DPO ni ninguna fase de ajuste fino posterior a la compresion y el swap; la intervencion es puramente sobre los pesos. Tampoco se documenta el paper, el repositorio de codigo ni la configuracion exacta del algoritmo de seleccion `gap_iter` mas alla de su nombre y de su presupuesto por ronda.

## Capacidades

- Generacion de texto y conversacion multi-turno: heredadas de Llama-3.1-8B-Instruct, pero no verificadas tras la compresion ni el swap.
- Razonamiento, codigo y matematicas: capacidades del modelo base que la model card no certifica en este checkpoint.
- Tool calling y function calling: no documentado para este checkpoint; el modelo base los soporta, pero no hay evaluacion posterior a la compresion.
- Uso en agentes y razonamiento multi-paso: no documentado y desaconsejado por el propio autor, que lo describe como sujeto experimental.
- Multilingue: sin declaracion propia; el modelo base cubre 8 idiomas.
- Capacidades especiales: ninguna. No hay vision, audio, modo de razonamiento explicito ni decodificacion especulativa documentada.
- Comportamiento de seguridad medido: ASR 0,0000 en AdvBench y 0,0250 en StrongREJECT con juez HarmBench, y sobre-rechazo macro de 0,4239 con WildGuard.

## Casos de uso

- Estudio de la degradacion de seguridad por compresion: comparar este checkpoint con Llama-3.1-8B-Instruct y con las demas celdas de la malla para cuantificar cuanto eleva la compresion SVD la tasa de exito de ataque y cuanto la reduce el swap.
- Celda de ablacion en la malla de reglas de seleccion: aislar el efecto de `gap_iter` frente a otras reglas manteniendo constante el presupuesto de 1,000 %, gracias a que la semilla (42) y el reparto por rondas estan fijados.
- Evaluacion de sobre-rechazo: usar el valor de 0,4239 en WildGuard como punto de partida para medir el coste en utilidad de las intervenciones de seguridad sobre un modelo comprimido.
- Red-teaming y generacion de datos adversarios: emplear el checkpoint como sujeto de pruebas controlado en pipelines de jailbreak, dado que su ASR ya esta caracterizado en AdvBench y StrongREJECT.
- Experimentos de recuperacion de capacidad: servir como estado inicial para tecnicas de destilacion, ajuste fino ligero o reparacion de bajo rango, y medir la recuperacion frente al modelo denso.
- Reproducibilidad metodologica: replicar el protocolo de compresion y swap en otros modelos y presupuestos partiendo de un artefacto con hiperparametros publicados.
- Benchmark de infraestructura de inferencia: medir memoria, latencia y throughput de un 8B editado en entornos transformers, TGI o vLLM antes de escalar a modelos mayores.
- Docencia sobre compresion de LLM: ilustrar en un caso real la diferencia entre eliminar parametros y reparar componentes seleccionados.

## Benchmarks y rendimiento

Unicos resultados publicados en la informacion disponible:

| Metrica | Valor | Instrumento de medida |
|---|---|---|
| AdvBench ASR | 0,0000 | Juez HarmBench |
| StrongREJECT ASR | 0,0250 | Juez HarmBench |
| Sobre-rechazo macro | 0,4239 | WildGuard |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K, MT-Bench u otros) en la informacion disponible. Tampoco hay datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 16,1 GB solo para los pesos, mas la cache KV; con 128.000 tokens de contexto la cache KV del modelo base de 8B ronda los 16 GB adicionales en fp16, por lo que el contexto largo no es viable en GPU de consumo.
- Cuantizacion: el repositorio no incluye versiones cuantizadas. Una conversion a 8 bits requeriria del orden de 9 GB y una conversion a 4 bits del orden de 5-6 GB, siempre que la estructura comprimida sea compatible con las herramientas de cuantizacion.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para inferencia en precision completa con contexto amplio; RTX 4090 (24 GB) para precision completa con contexto reducido.
- GPU de consumo: cabe en tarjetas de 16-24 GB en bf16 con contexto corto, y en tarjetas de 8-12 GB solo tras cuantizacion a 4 bits.
- Opciones de despliegue: transformers de forma nativa; el repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con TGI y con los endpoints gestionados de Hugging Face, ademas de vLLM. No hay archivos GGUF publicados, por lo que llama.cpp y Ollama requeririan una conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de las filas de modelos alternativos provienen de la documentacion publica de cada modelo y no de la informacion proporcionada para esta ficha; se incluyen solo como referencia de categoria.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| svd-safety-l31_remove20_swapgapiter_b010_r09 | 8.030.261.248 segun safetensors (fraccion densa declarada 0,7998) | No declarado (base: 128.000) | Llama 3.1 Community License | Artefacto de investigacion, 0 descargas, 0 likes |
| meta-llama/Llama-3.1-8B-Instruct | 8.030 millones | 128.000 tokens | Llama 3.1 Community License | Modelo denso de referencia, ampliamente desplegado |
| Mistral-7B-Instruct-v0.3 | 7.250 millones | 32.768 tokens | Apache 2.0 | Alternativa densa de tamano similar |
| Qwen2.5-7B-Instruct | 7.610 millones | 131.072 tokens | Apache 2.0 | Alternativa densa de tamano similar |

No hay comparacion posible de rendimiento con estas alternativas: el unico dato publicado para este checkpoint son las tres metricas de seguridad, y los modelos de la tabla no publican esas mismas metricas en la informacion disponible. Otras celdas de la malla de compresion SVD del mismo autor no estan documentadas aqui.

## Limitaciones y advertencias

- No es un modelo de proposito general: la model card lo define explicitamente como sujeto experimental y desaconseja su despliegue como asistente.
- Varias celdas de la malla de la que forma parte estan deliberadamente degradadas en seguridad; la compresion por si sola eleva la tasa de exito de ataque, y este checkpoint solo ha recibido 9 de las 10 rondas previstas de reparacion.
- El sobre-rechazo macro de 0,4239 implica que el modelo rechaza una proporcion elevada de peticiones benignas, lo que limita su utilidad conversacional.
- Riesgo de alucinacion: heredado del modelo base y potencialmente agravado por la eliminacion de componentes de bajo rango, sin evaluacion publicada al respecto.
- Sin idiomas declarados en la ficha del repositorio y sin evaluacion multilingue posterior a la compresion.
- Licencia Llama 3.1 Community License: el uso comercial queda sujeto a sus terminos, incluidos los requisitos de atribucion y de nomenclatura y las restricciones de uso recogidas en USE_POLICY.md.
- Discrepancia de datos: el recuento de parametros de safetensors (8.030.261.248) coincide con el del modelo denso base, mientras que la model card declara una fraccion resultante de 0,7998; la model card no explica esta diferencia.
- Anomalia de metadatos: el repositorio figura como creado el 17 de septiembre de 2026, fecha posterior a la de publicacion del modelo base.
- Sin conversion a GGUF ni cuantizaciones publicadas, lo que dificulta el despliegue en entornos de consumo.
- Sin validacion de la comunidad: 0 descargas y 0 likes, y ningun paper o repositorio de codigo enlazado en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove20_swapgapiter_b010_r09
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia y politica de uso: los archivos LICENSE y USE_POLICY.md estan incluidos en el repositorio del modelo.
- Paper de SVD-LLM: no disponible en la informacion proporcionada.
- Repositorio de codigo del metodo o del estudio: no disponible en la informacion proporcionada.
- La busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo, su metodologia o sus autores; los resultados obtenidos corresponden a paginas de ayuda de YouTube y no guardan relacion con la ficha.
