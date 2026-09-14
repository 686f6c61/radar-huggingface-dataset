# Jeesup/svd-safety-l2_remove40_swapgapnet_a010_b010_r03

## Resumen

svd-safety-l2_remove40_swapgapnet_a010_b010_r03 es un checkpoint de investigacion publicado por el usuario Jeesup en Hugging Face. Se trata de un Llama-2-7b-chat comprimido con SVD-LLM hasta el 60,0% de sus parametros densos y despues editado mediante 3 de las 10 rondas de un procedimiento iterativo de intercambio de parametros neutro (parameter-neutral swap) guiado por la regla de seleccion `gap_iter`. No es un asistente conversacional de proposito general: es una celda concreta de una malla experimental que estudia como la compresion por SVD degrada el comportamiento de seguridad y que regla de seleccion de componentes lo repara mejor.

El checkpoint conserva la arquitectura transformer decoder-only de la familia Llama 2 y declara en safetensors 6.738.415.616 parametros, con una fraccion de parametros resultante de 0,5998. Se han restaurado 391 componentes y sustituido otros 391, con 4.440.320 parametros intercambiados (0,07% de los parametros de proyeccion densos), semilla 42 y un chunk del 0,100% de los parametros densos por ronda.

Su relevancia es metodologica: aporta mediciones cuantificadas del compromiso entre seguridad y utilidad bajo compresion (ASR de 0,3615 en AdvBench y 0,1821 en StrongREJECT, con 0,0941 de sobre-rechazo macro en WildGuard), un terreno poco documentado porque la mayoria de los modelos comprimidos publicados no reportan tasas de exito de ataque. La licencia aplicable es la Llama 2 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 2, con matrices de proyeccion comprimidas mediante SVD-LLM |
| Parametros totales | 6.738.415.616 (recuento de safetensors); fraccion de parametros resultante declarada: 0,5998 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens, heredada del modelo base meta-llama/Llama-2-7b-chat-hf; la model card no declara otro valor |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors sin cuantizar; no se han publicado variantes GGUF, INT8 ni de 4 bits) |
| Idiomas soportados | no disponible en la informacion proporcionada; el modelo base esta orientado principalmente al ingles |
| Licencia | Llama 2 Community License (se incluyen LICENSE.txt y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors, cargables con la libreria transformers |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Metodo de compresion | SVD-LLM, con un 40,02% de parametros eliminados |
| Regla de seleccion | gap_iter |
| Presupuesto de restauracion | 1,000% de los parametros densos (0,100% por ronda) |
| Componentes restaurados / sustituidos | 391 restaurados, 391 sustituidos |
| Valor del intercambio | net (valor de insercion mas valor de eliminacion del descarte ordenado por sigma) |
| Escala de insercion | 0,1 |
| Rondas aplicadas | 3 de 10 (checkpoint intermedio de una ejecucion mas larga) |
| Semilla | 42 |
| Tamano del repositorio | 13,5 GB |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama-2-7b-chat: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, atencion causal con RoPE y atencion por grupos (GQA) en las versiones mayores de la familia. Sobre esa base se aplica SVD-LLM, una descomposicion en valores singulares truncada que reduce el rango de las matrices de proyeccion; en esta celda la eliminacion alcanza el 40,02% de los parametros, dejando una fraccion de 0,5998 respecto del modelo denso. No se documenta ningun reentrenamiento, ajuste fino, RLHF ni DPO adicional en este repositorio: la intervencion es una edicion de pesos posterior al entrenamiento sobre un modelo que ya estaba alineado por Meta (el modelo base Llama-2-7b-chat se alineo con ajuste supervisado, rejection sampling y RLHF segun la documentacion del propio modelo base).

Sobre el checkpoint comprimido se ejecuta un procedimiento iterativo de intercambio de parametros neutro: en cada ronda se seleccionan componentes candidatos mediante la regla `gap_iter`, se sustituyen por componentes del modelo denso (391 restaurados y 391 retirados), y se hace con un valor de intercambio `net` que combina el valor de insercion con el valor de eliminacion del descarte ordenado por sigma, insertando los componentes a una escala de 0,1 de su fuerza original. Esta celda corresponde a 3 de las 10 rondas de una ejecucion con presupuesto total del 1,0% de los parametros densos (0,1% por ronda); los parametros efectivamente intercambiados son 4.440.320, un 0,07% de los parametros de proyeccion densos. La innovacion tecnica del trabajo no esta en la arquitectura, sino en la metodologia de reparacion: comparar reglas de seleccion de componentes y presupuestos para medir cuanto de la seguridad perdida por la compresion puede recuperarse con una intervencion de coste minimo.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Llama-2-7b-chat, con la degradacion introducida por la compresion SVD y la edicion posterior.
- Razonamiento basico, respuesta a instrucciones y generacion de codigo en la medida en que los conserva el modelo base; no se publican mediciones de estas capacidades en la informacion disponible.
- Respuesta a conversaciones multiturno dentro de la ventana de 4096 tokens del modelo base.
- Capacidad de rechazo de peticiones daninas parcialmente conservada: la model card reporta un 9,41% de sobre-rechazo macro medido con WildGuard, lo que indica que el modelo sigue rechazando peticiones benignas en la mayoria de los casos.
- No hay soporte documentado de tool calling ni de function calling.
- No hay soporte documentado de agentes ni de razonamiento multi-paso con uso de herramientas.
- No hay capacidades multimodales (vision, audio) ni modo de razonamiento explicito (thinking mode) documentadas.
- Multilingueismo: no disponible; el modelo base esta orientado principalmente al ingles y la model card no declara cobertura de idiomas.

## Casos de uso

- Investigacion sobre compresion y seguridad: la celda sirve como punto de medida para cuantificar cuanto sube la tasa de exito de ataque (ASR) al eliminar el 40,02% de los parametros densos de un modelo alineado, y cuanto la reduce la reparacion por intercambio de componentes.
- Comparacion de reglas de seleccion de componentes: al ser una celda de una malla sobre reglas y presupuestos, permite contrastar `gap_iter` frente a otras reglas manteniendo fijo el modelo base, la semilla (42) y la compresion (SVD-LLM, 40,02%).
- Evaluacion de robustez frente a jailbreaks: con un ASR de 0,3615 en AdvBench y 0,1821 en StrongREJECT medidos con el juez HarmBench, es util como sujeto experimental en pipelines de red-teaming defensivo y en la calibracion de clasificadores de seguridad.
- Estudio del sobre-rechazo: el 0,0941 de sobre-rechazo macro medido con WildGuard permite analizar el coste en utilidad que impone la reparacion de seguridad sobre peticiones benignas.
- Reproducibilidad de artefactos de investigacion: la model card documenta semilla, presupuesto, numero de componentes y escala de insercion, lo que facilita replicar la ronda 3 de un run de 10 y auditar la metodologia.
- Analisis de interpretabilidad de pesos: los 391 componentes restaurados y los 391 sustituidos identifican subconjuntos concretos de parametros de proyeccion cuyo efecto sobre el comportamiento de rechazo es medible, lo que permite estudiar la localizacion de comportamientos de seguridad.
- Linea base de ablacion: cualquier estudio de compresion (cuantizacion, poda, destilacion) puede usar este checkpoint como referencia de un modelo comprimido con reparacion parcial frente al modelo denso original.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son tres metricas de seguridad y utilidad. No hay resultados de MMLU, GSM8K, HumanEval ni de otras suites de capacidades generales, y no se proporcionan cifras equivalentes del modelo base denso para calcular la variacion exacta.

| Metrica | Valor | Nota |
|---|---|---|
| AdvBench ASR (juez HarmBench) | 0,3615 | Tasa de exito de ataque; menor es mejor |
| StrongREJECT ASR (juez HarmBench) | 0,1821 | Tasa de exito de ataque; menor es mejor |
| Macro over-refusal (WildGuard) | 0,0941 | Sobre-rechazo sobre peticiones benignas; menor es mejor |

La propia model card advierte de que la compresion por si sola eleva la tasa de exito de ataque respecto de Llama-2-7b-chat y que algunas celdas de la malla estan deliberadamente degradadas en seguridad. No se han publicado resultados de benchmarks de capacidades generales en la informacion disponible.

## Requisitos de hardware

- Pesos en FP16/BF16: aproximadamente 13,5 GB solo para los parametros, lo que situa la inferencia completa en el entorno de 15 a 16 GB de VRAM contando activaciones y cache.
- Cache KV para 4096 tokens en FP16: en torno a 2 GB adicionales, calculados sobre la configuracion de atencion de Llama-2-7b (32 capas, 32 cabezas, dimension de cabeza 128).
- Cuantizacion a 8 bits: en torno a 7 GB de pesos, viable en GPUs de 12 GB con contexto reducido.
- Cuantizacion a 4 bits: en torno a 3,5 a 4 GB de pesos; requeriria generar los ficheros cuantizados, ya que no se publican en el repositorio.
- GPU de centro de datos: A100 40/80 GB, H100 80 GB y L40S son suficientes y sobredimensionadas para este tamano; se pueden usar para servir muchas replicas por GPU.
- GPU de consumo: cabe en FP16 en RTX 3090, RTX 4090 y RTX 5090 (24 GB o mas). En tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) es ajustado en FP16 y holgado en 8 o 4 bits. En 12 GB (RTX 3060, RTX 4070) solo con cuantizacion.
- Opciones de despliegue: transformers de forma nativa; text-generation-inference es compatible segun los tags del repositorio (`text-generation-inference`, `endpoints_compatible`); vLLM requeriria verificar el soporte de las matrices truncadas por SVD-LLM. Para llama.cpp u Ollama habria que convertir los pesos a GGUF, algo que no se proporciona.
- Latencia y throughput: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, un modelo denso de 6,7B en FP16 sobre una GPU de 24 GB queda limitado por ancho de banda de memoria, pero no se publican medidas para este checkpoint.

## Comparativa con modelos similares

Los datos de las alternativas no proceden de la informacion proporcionada y se incluyen unicamente como referencia de categoria. No se dispone de cifras de seguridad comparables para ellas en este contexto.

| Modelo | Parametros | Contexto | Licencia | Benchmark de seguridad publicado aqui | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_remove40_swapgapnet_a010_b010_r03 | 6.738.415.616 (fraccion 0,5998 declarada) | 4096 tokens | Llama 2 Community License | AdvBench ASR 0,3615; StrongREJECT ASR 0,1821; sobre-rechazo 0,0941 | Repositorio de investigacion, 0 descargas y 0 likes en el momento del analisis |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4096 tokens | Llama 2 Community License | no disponible en la informacion proporcionada | Modelo oficial de Meta, ampliamente desplegado |
| Llama-3.1-8B-Instruct | 8.000 millones aproximadamente | 128.000 tokens | Llama 3.1 Community License | no disponible en la informacion proporcionada | Modelo oficial de Meta |
| Mistral-7B-Instruct-v0.3 | 7.200 millones aproximadamente | 32.000 tokens | Apache 2.0 | no disponible en la informacion proporcionada | Modelo oficial de Mistral AI |

Frente al modelo base denso, esta celda intercambia licencia y disponibilidad identicas por una reduccion declarada de parametros y un comportamiento de seguridad degradado de forma medible. Frente a alternativas mas recientes, la ventaja en contexto y licencia (Apache 2.0 en el caso de Mistral) es clara; el interes de este checkpoint es exclusivamente experimental.

## Limitaciones y advertencias

- No es un modelo de proposito general. La propia model card lo describe como un sujeto experimental y pide evaluarlo antes de extraer conclusiones.
- Partes de la malla experimental estan deliberadamente degradadas en seguridad respecto de Llama-2-7b-chat; la compresion por si sola eleva la tasa de exito de ataque. Un ASR de 0,3615 en AdvBench implica que aproximadamente una de cada tres peticiones daninas del conjunto de evaluacion tuvo exito segun el juez HarmBench.
- Este checkpoint concreto corresponde a la ronda 3 de 10, es decir, a una reparacion parcial: no representa el resultado final del presupuesto de restauracion del 1,0%.
- Riesgo de alucinacion: la eliminacion del 40,02% de los parametros densos puede reducir la fidelidad factual, y no se publican mediciones de veracidad ni de capacidades generales que permitan acotar ese riesgo.
- Discrepancia de datos: el recuento de parametros de safetensors (6.738.415.616) coincide con el del Llama-2-7b-chat denso, mientras que la model card declara una fraccion de parametros resultante de 0,5998. La informacion disponible no explica esta diferencia, por lo que conviene verificar las dimensiones reales del checkpoint antes de planificar el despliegue.
- Idiomas: no se declara cobertura multilingue; el modelo base esta orientado al ingles y el comportamiento en castellano no esta medido.
- Ventana de contexto limitada a 4096 tokens, insuficiente para casos de uso con documentos largos o conversaciones extensas.
- Restricciones de licencia: Llama 2 Community License, no Apache 2.0 ni MIT. El uso comercial esta sujeto a las condiciones de la licencia (incluida la clausula de escala de usuarios activos mensuales), el despliegue debe conservar LICENSE.txt y USE_POLICY.md, y las obras derivadas deben atribuirse indicando que estan construidas con Llama 2.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento del analisis, sin garantias de mantenimiento, soporte ni actualizaciones.
- No se proporcionan pesos cuantizados ni ficheros GGUF, lo que anade trabajo de conversion si se quiere desplegar en entornos de consumo o en llama.cpp.
- La model card no documenta sesgos especificos ni evaluaciones de sesgo; al heredar el modelo base, arrastra los sesgos conocidos de Llama-2-7b-chat.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapgapnet_a010_b010_r03
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- No se han encontrado enlaces adicionales relevantes en la busqueda web realizada. Los resultados devueltos corresponden a consultas sobre el programa de dibujo Clip Studio Paint (CSP) y no guardan ninguna relacion con este modelo.
- Referencias tecnicas mencionadas en la model card sin enlace proporcionado: SVD-LLM (metodo de compresion), HarmBench (juez de evaluacion), StrongREJECT y WildGuard (conjuntos e instrumentos de medida). No se incluyen URL porque no aparecen en la informacion disponible.
