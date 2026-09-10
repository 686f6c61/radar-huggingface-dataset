# Jeesup/svd-safety-l2_remove40_swapdisc_b005

## Resumen

svd-safety-l2_remove40_swapdisc_b005 es un checkpoint de investigacion derivado de meta-llama/Llama-2-7b-chat-hf, publicado por el usuario Jeesup. No es un modelo entrenado desde cero ni un ajuste fino: es el resultado de aplicar compresion SVD-LLM al modelo base, eliminando el 40,02 % de los parametros densos, y de restaurar despues un presupuesto del 0,5 % de parametros mediante componentes SVD seleccionados con la regla `swapdisc`. La fraccion de parametros resultante declarada por el autor es 0,5998, con 3029 componentes restaurados y 3029 sustituidos, bajo semilla 42.

El proposito del artefacto es estudiar como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion de componentes repara mejor ese dano. Se trata de una celda de una rejilla experimental sobre reglas de seleccion y presupuestos, no de un asistente conversacional desplegable. La propia model card advierte que varias configuraciones de la rejilla estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat y que cualquier celda debe tratarse como sujeto experimental.

Es relevante ahora porque cuantifica con metricas concretas el compromiso entre seguridad y utilidad bajo compresion: 0,0038 de ASR en AdvBench, 0,0224 en StrongREJECT, 0,4447 de sobre-rechazo macro (WildGuard) y 11,4949 de perplejidad en WikiText-2. El repositorio ocupa 13,5 GB y contiene pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Llama 2), con matrices comprimidas por truncamiento SVD (SVD-LLM) y restauracion parcial de componentes |
| Parametros totales | 6.738.415.616 segun metadatos de safetensors; la model card declara una fraccion de parametros resultante de 0,5998 (ver limitaciones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama-2-7b-chat usa 4096 tokens |
| Tipos de cuantizacion | no disponible; el tamano del repo (13,5 GB) es consistente con pesos en FP16/BF16 sin cuantizar |
| Idiomas soportados | no disponible en la model card; hereda el reparto de idiomas del modelo base |
| Licencia | Llama 2 Community License (se incluyen LICENSE.txt y USE_POLICY.md) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder con normalizacion RMSNorm previa, activacion SwiGLU en el bloque feed-forward, atencion por cabezas con RoPE y sin sesgos en las proyecciones. Sobre esa base no hay entrenamiento adicional. La intervencion consiste en compresion SVD-LLM que elimina el 40,02 % de los parametros densos, seguida de la restauracion de un 0,5 % del presupuesto de parametros densos mediante la reincorporacion de 3029 componentes SVD y la sustitucion (swap) de otros 3029, seleccionados con la regla `swapdisc`. La semilla del experimento es 42.

No se documentan en la informacion disponible el volumen de tokens, la composicion del dataset ni el uso de RLHF o DPO especificos de este checkpoint; el alineamiento procede integramente del modelo base. La innovacion tecnica relevante es metodologica: la comparacion sistematica de reglas de seleccion de componentes SVD (entre ellas `swapdisc`) y de presupuestos de restauracion para medir la recuperacion de comportamiento seguro tras comprimir. El checkpoint es una celda de esa rejilla, y las metricas publicadas (ASR en AdvBench y StrongREJECT con juez HarmBench, sobre-rechazo macro con WildGuard, perplejidad en WikiText-2) sirven como referencia para comparar celdas entre si.

## Capacidades

- Generacion de texto conversacional en el formato de Llama-2-7b-chat, con la degradacion esperable tras eliminar el 40,02 % de los parametros densos.
- Respuesta a instrucciones y mantenimiento de dialogos multi-turno propios del modelo base, sujeto a la perdida de calidad inducida por la compresion.
- Capacidad de rechazo de peticiones daninas parcialmente preservada: ASR de 0,0038 en AdvBench y 0,0224 en StrongREJECT medidos con juez HarmBench.
- Utilidad de modelado de lenguaje medida en 11,4949 de perplejidad sobre WikiText-2.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (el modelo base no lo soporta de forma nativa).
- Soporte de agentes y razonamiento multi-paso: no disponible ni documentado; no es un objetivo del artefacto.
- Capacidades multilingues: no disponibles en la model card.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; el checkpoint es exclusivamente de generacion de texto.

## Casos de uso

- Investigacion sobre seguridad y compresion: usar el checkpoint como celda experimental para medir cuanto degrada la compresion SVD el comportamiento de rechazo de Llama-2-7b-chat, comparando las cuatro metricas publicadas entre configuraciones de la rejilla.
- Red-teaming academico: someter el modelo a conjuntos de ataques como AdvBench o StrongREJECT para reproducir el ASR declarado con semilla 42 y verificar la robustez de la medicion con jueces automaticos tipo HarmBench.
- Estudio de reglas de seleccion de componentes: comparar `swapdisc` frente a otras reglas de la rejilla con el mismo presupuesto de restauracion (0,5 %) para aislar el efecto de la regla sobre seguridad y perplejidad.
- Analisis de sobre-rechazo: emplear el 0,4447 de sobre-rechazo macro (WildGuard) como evidencia de falso rechazo y estudiar si la restauracion de componentes SVD agrava o mitiga ese comportamiento.
- Linea base en estudios de compresion de LLM: usar el checkpoint como referencia de un punto concreto (40 % de parametros eliminados, 0,5 % restaurado) frente a metodos alternativos de compresion o destilacion.
- Analisis de interpretabilidad: inspeccionar que componentes SVD restaurados afectan a comportamientos concretos de seguridad, dado que el experimento registra explicitamente que 3029 componentes se restauran y 3029 se sustituyen.
- Validacion de pipelines de evaluacion: integrar el modelo en arneses de evaluacion propios para comprobar que las metricas declaradas son reproducibles antes de extrapolar conclusiones a otras celdas de la rejilla.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0038 |
| StrongREJECT ASR (juez HarmBench) | 0,0224 |
| Sobre-rechazo macro (WildGuard) | 0,4447 |
| Perplejidad WikiText-2 | 11,4949 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros checkpoints comprimidos o con el modelo base sin comprimir. Los unicos datos cuantitativos son los de la tabla anterior, extraidos de la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica entre 16 y 20 GB para contextos moderados.
- VRAM estimada con cuantizacion INT8: en torno a 7-8 GB. Con cuantizacion INT4: en torno a 4-5 GB. La model card no publica recetas de cuantizacion, por lo que estas cifras son estimaciones derivadas del numero de parametros.
- GPU recomendadas: A100 40 GB, H100, L40S o A10G 24 GB para FP16 sin cuantizar. Cabe en GPU de consumo como la RTX 4090 (24 GB) en FP16 y en tarjetas de 8-12 GB si se cuantiza a 8 o 4 bits.
- Despliegue: compatible con transformers (libreria declarada) y con text-generation-inference, segun las etiquetas del repositorio. vLLM y TGI son opciones razonables para servicio en FP16; llama.cpp u Ollama requeririan convertir los pesos a GGUF, conversion no documentada por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada. No hay datos de tokens por segundo ni de latencia por peticion publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| svd-safety-l2_remove40_swapdisc_b005 | 6.738.415.616 en safetensors; fraccion declarada 0,5998 | no disponible (base: 4096) | Llama 2 Community License | AdvBench ASR 0,0038; StrongREJECT ASR 0,0224; sobre-rechazo 0,4447; PPL WikiText-2 11,4949 |
| meta-llama/Llama-2-7b-chat-hf (modelo base) | 6.738.415.616 | 4096 | Llama 2 Community License | no disponible en la informacion proporcionada para esta comparativa |
| Otras celdas de la rejilla SVD-LLM (otras reglas y presupuestos) | no disponible | no disponible | Llama 2 Community License | no disponible |
| Otros modelos comprimidos de 7B de la misma categoria | no disponible | no disponible | no disponible | no disponible |

La comparacion cuantitativa con alternativas no puede completarse: la informacion disponible solo incluye las metricas de este checkpoint y no ofrece cifras equivalentes del modelo base sin comprimir ni de otros metodos de compresion.

## Limitaciones y advertencias

- No es un modelo de proposito general. El propio autor lo describe como artefacto de investigacion y pide evaluarlo antes de extraer conclusiones; no deberia desplegarse como asistente.
- Seguridad degradada de forma deliberada en varias celdas de la rejilla. La compresion por si sola eleva la tasa de exito de ataque, y este checkpoint es una de las celdas de ese estudio.
- Sobre-rechazo elevado: 0,4447 macro segun WildGuard, lo que implica una proporcion relevante de peticiones benignas rechazadas.
- Perplejidad degradada: 11,4949 en WikiText-2, coherente con la eliminacion del 40,02 % de los parametros densos.
- Riesgo de alucinacion: no se publican mediciones especificas de veracidad o factualidad; dado el nivel de compresion, la perdida de fidelidad factual es esperable y no esta cuantificada.
- Discrepancia de recuento de parametros: los metadatos de safetensors indican 6.738.415.616 parametros, identico al recuento del modelo base, mientras la model card declara una fraccion de parametros resultante de 0,5998. Esta inconsistencia debe resolverse antes de usar la cifra de parametros en cualquier calculo de despliegue.
- Idioma: la model card no declara idiomas soportados; el comportamiento fuera del ingles no esta caracterizado.
- Longitud de contexto: no declarada para este checkpoint; solo puede asumirse la del modelo base, sin garantia de que la compresion no haya afectado al comportamiento en contextos largos.
- Restricciones de licencia: se aplica la Llama 2 Community License, con LICENSE.txt y USE_POLICY.md incluidos en el repositorio. Cualquier uso, incluido el comercial, queda sujeto a ambas y a las obligaciones de atribucion ("Built with Llama 2").
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks independientes ni validacion externa publicada.
- Los resultados de busqueda web asociados a esta consulta no contienen informacion sobre el modelo (corresponden a la utilidad Rufus y no guardan relacion).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapdisc_b005
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper de SVD-LLM (metodo de compresion citado en la model card): no disponible en la informacion proporcionada
- Repositorio de codigo del autor: no disponible en la informacion proporcionada
- Demos o espacios asociados: no disponibles en la informacion proporcionada
