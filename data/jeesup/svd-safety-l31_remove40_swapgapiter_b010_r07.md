# Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r07

## Resumen

El modelo `Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r07` es un artefacto de investigacion derivado de `meta-llama/Llama-3.1-8B-Instruct`. Se trata de un checkpoint al que se le ha aplicado compresion SVD-LLM para eliminar el 40,02 % de los parametros de proyeccion, quedando en una fraccion de parametros densos de 0,5998, y sobre el que despues se ha ejecutado una edicion iterativa de pesos conocida como "swap neutro en parametros" (parameter-neutral swap) guiada por la regla de seleccion `gap_iter`. El objetivo del autor no es ofrecer un asistente desplegable, sino medir como la compresion por SVD degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion de componentes repara mejor ese dano.

El checkpoint corresponde a la ronda 7 de 10 de una ejecucion mas larga, con un presupuesto de restauracion de 1,000 % de los parametros densos repartido en fragmentos de 0,100 % por ronda. Se restauraron y se expulsaron 8.025 componentes, y se insertaron 48.828.416 parametros (0,70 % de los parametros de proyeccion densos), con semilla 42 y una politica de expulsión ordenada por valores singulares (sigma-ordered eviction). No hay entrenamiento adicional con gradientes: toda la modificación es cirugia de pesos post-hoc.

Su relevancia es metodologica. Forma parte de una malla experimental sobre reglas de seleccion y presupuestos, y el propio autor advierte que varias celdas de esa malla estan deliberadamente degradadas en seguridad respecto al modelo base. Los datos publicados muestran un ASR de 0,0150 en AdvBench y de 0,0550 en StrongREJECT (ambos con juez HarmBench), junto con una tasa de sobrerrechazo macro de 0,5121 medida con WildGuard, es decir, el modelo rechaza aproximadamente la mitad de las peticiones benignas de ese conjunto de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.1 8B-Instruct); pesos editados mediante SVD-LLM y swap de componentes |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Fraccion de parametros densos | 0,5998 tras eliminar el 40,02 % de los parametros de proyeccion |
| Longitud de contexto | No declarada en la model card; heredada de Llama 3.1 8B-Instruct (128.000 tokens segun la documentacion del modelo base) |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales en el repositorio; el artefacto es un checkpoint de investigacion con pesos comprimidos por SVD. Se pueden generar cuantizaciones (GGUF, GPTQ, AWQ, bitsandbytes) por conversión propia |
| Idiomas soportados | No declarados en la model card; el modelo base Llama 3.1 8B-Instruct soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | Llama 3.1 Community License (se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio; "Built with Llama") |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 16,1 GB |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000 % de los parametros densos (0,100 % por ronda) |
| Componentes restaurados / expulsados | 8.025 / 8.025 |
| Parametros insertados | 48.828.416 (0,70 % de los parametros de proyeccion densos) |
| Valor de swap | `insert` (solo valor de insercion; expulsion ordenada por sigma) |
| Semilla | 42 |
| Rondas aplicadas | 7 de 10 (checkpoint intermedio de una ejecucion mas larga) |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama 3.1 8B-Instruct: un transformer decoder-only con atencion por consultas agrupadas (GQA) y normalizacion RMSNorm. Sobre esa base no se realiza ningun entrenamiento con gradientes. El primer paso es una compresion SVD-LLM que descompone matrices de proyeccion en factores singulares y descarta componentes de baja contribucion hasta eliminar el 40,02 % de los parametros de proyeccion, dejando la fraccion densa resultante en 0,5998. El segundo paso es una edicion iterativa de "swap neutro en parametros": en cada ronda se expulsan componentes segun su valor singular y se insertan otros componentes alternativos, con un presupuesto fijo de 0,100 % de los parametros densos por ronda, hasta un maximo de 10 rondas y un presupuesto total del 1,000 %.

La regla `gap_iter` determina que componentes se intercambian en cada iteracion; el checkpoint publicado se detiene tras la ronda 7, con 8.025 componentes restaurados y 8.025 expulsados y 48.828.416 parametros insertados. No se especifican en la informacion disponible los datos de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO adicionales, algo coherente con el hecho de que no existe fase de entrenamiento: la intervención es exclusivamente de edicion de pesos sobre un modelo ya alineado. Un detalle tecnico a tener en cuenta es que el recuento de parametros de safetensors (8.030.261.248) coincide con el del modelo base, mientras que la model card declara una fraccion densa de 0,5998; la explicacion mas plausible es que los tensores conservan su forma original aunque se hayan anulado componentes singulares, pero la model card no lo aclara explicitamente.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada de Llama 3.1 8B-Instruct, con la calidad degradada propia de una compresion del 40 % de los parametros de proyeccion.
- Razonamiento general, codigo y matematicas basicas como capacidades heredadas del modelo base; no se han publicado evaluaciones especificas (MMLU, HumanEval, GSM8K) para este checkpoint.
- Soporte de tool calling / function calling: no verificado ni documentado para este checkpoint; el modelo base lo soporta, pero la edicion de pesos puede haber alterado este comportamiento.
- Soporte de agentes y razonamiento multi-paso: no documentado y no recomendado, dado que la model card lo describe como sujeto experimental y no como asistente desplegable.
- Capacidades multilingues: no evaluadas en este checkpoint; se heredan del modelo base segun los idiomas oficiales de Llama 3.1.
- Modo de pensamiento explicito (thinking mode): no disponible.
- Vision y audio: no disponibles.
- Comportamiento de seguridad medible: el checkpoint incluye metricas publicadas de ataque exitoso (AdvBench 0,0150; StrongREJECT 0,0550) y de sobrerrechazo (0,5121), lo que lo convierte en un objeto de estudio para evaluacion de seguridad mas que en un asistente de proposito general.
- Interpretabilidad: los pesos comprimidos y reeditados permiten analizar la relacion entre componentes singulares y comportamiento de rechazo.

## Casos de uso

- Estudio de compresion y seguridad: el checkpoint permite cuantificar cuanto dano introduce una compresion SVD del 40 % en el comportamiento de rechazo de un modelo alineado, comparando el ASR de AdvBench y StrongREJECT frente a la referencia sin comprimir.
- Evaluacion comparativa de reglas de seleccion: sirve como una celda concreta de una malla sobre reglas (`gap_iter` en este caso) y presupuestos, util para determinar que criterio de seleccion de componentes repara mejor la seguridad tras la compresion.
- Investigacion en edicion de pesos post-hoc: al no requerir entrenamiento con gradientes, es adecuado para experimentos de cirugia de pesos reproducibles con semilla fija (42) y presupuestos acotados.
- Analisis de sobrerrechazo: con una tasa macro de 0,5121 en WildGuard, es un caso de estudio sobre el equilibrio entre seguridad y utilidad y sobre como la compresion puede volver a un modelo excesivamente conservador.
- Red teaming y construccion de benchmarks: puede emplearse como sujeto experimental en pipelines de evaluacion automatica con jueces tipo HarmBench o WildGuard para validar metodologias de medida.
- Docencia e investigacion en interpretabilidad: los componentes singulares eliminados y restaurados documentados en la model card permiten disenar practicas sobre que partes de una matriz de proyeccion afectan a comportamientos especificos.
- Ablacion de checkpoints intermedios: al ser la ronda 7 de 10, permite estudiar la evolucion de las metricas de seguridad ronda a ronda si se dispone del resto de la ejecucion.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,0150 |
| StrongREJECT | ASR (juez HarmBench) | 0,0550 |
| WildGuard | Sobrerrechazo macro | 0,5121 |

No se han publicado en la informacion disponible resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K, MT-Bench u otros), ni metricas de latencia o throughput. Tampoco se proporcionan los valores del modelo base sin comprimir, por lo que no es posible calcular la degradacion relativa a partir de estos datos.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 16 GB solo para los pesos (el repositorio ocupa 16,1 GB), mas la cache KV. Con 128.000 tokens de contexto la cache KV de Llama 3.1 8B, que usa GQA con 8 cabezas KV, crece de forma considerable (del orden de decenas de GB en fp16 a contexto maximo), por lo que conviene limitar la ventana o usar cache cuantizada.
- VRAM estimada en int8: aproximadamente 8-9 GB para los pesos.
- VRAM estimada en 4 bits (NF4, GPTQ, AWQ): aproximadamente 5-6 GB para los pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para fp16; RTX 3090, RTX 4090 o A10G para int8; RTX 3060 12 GB, RTX 4070 o equipos Apple Silicon con 16 GB de memoria unificada para 4 bits.
- Cabe en GPU de consumo: si, en configuraciones cuantizadas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) y en fp16 en tarjetas con 24 GB o mas, siempre que se restrinja el contexto.
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI, SGLang. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, ya que no se publica ninguna cuantizacion oficial.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

Todas las cifras de VRAM son estimaciones derivadas del tamano del checkpoint y del modelo base, no mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Metricas de seguridad | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r07 | 8.030.261.248 almacenados; fraccion densa 0,5998 | No declarado (heredado de Llama 3.1 8B) | Llama 3.1 Community License | AdvBench ASR 0,0150; StrongREJECT ASR 0,0550; sobrerrechazo 0,5121 | HuggingFace, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8.030.261.248 | 128.000 tokens | Llama 3.1 Community License | No disponible en esta informacion | HuggingFace |
| Otros brazos de la malla experimental del mismo autor (otras reglas de seleccion y presupuestos) | No disponible | No disponible | Llama 3.1 Community License | No disponible | No disponible |

No se dispone de datos de rendimiento del modelo base sin comprimir ni del resto de celdas de la malla, por lo que no es posible establecer una comparacion cuantitativa de la degradacion o de la recuperacion de seguridad.

## Limitaciones y advertencias

- No es un modelo de proposito general: el autor lo describe explicitamente como un artefacto de investigacion y una celda de una malla experimental, no como un asistente desplegable.
- Seguridad degradada por diseno en varias celdas: la propia model card advierte que la compresion por si sola eleva la tasa de exito de ataques y que algunos brazos de la malla estan deliberadamente degradados en seguridad respecto a Llama-3.1-8B-Instruct.
- Sobrerrechazo elevado: la metrica macro de WildGuard es 0,5121, lo que implica rechazar aproximadamente la mitad de las peticiones benignas de ese conjunto, con el consiguiente impacto en utilidad.
- Riesgo de alucinacion: no medido ni documentado para este checkpoint; al tratarse de un modelo comprimido y reeditado, es esperable un aumento respecto al modelo base, pero no hay datos que lo cuantifiquen.
- Sesgos: no evaluados en la informacion disponible. Se heredan los sesgos del modelo base y los derivados de la edicion de pesos, no caracterizados por el autor.
- Limitaciones de contexto e idioma: no se documentan evaluaciones multilingues ni de contexto largo para este checkpoint concreto.
- Restricciones de licencia: se aplica la Llama 3.1 Community License, con obligacion de incluir aviso de atribucion ("Built with Llama") y las restricciones de uso recogidas en `USE_POLICY.md`; existen condiciones adicionales para despliegues a gran escala segun los terminos de Meta.
- Reproducibilidad: la semilla es 42 y la ronda aplicada es la 7 de 10, por lo que los resultados corresponden a un punto intermedio y no al resultado final de la ejecucion.
- Sin cuantizaciones oficiales ni canalizaciones de despliegue verificadas: cualquier uso en produccion requeriria conversion, validacion y evaluacion de seguridad propias.
- Adopcion nula hasta la fecha: 0 descargas y 0 "likes", sin evidencia de uso o validacion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r07
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/ (referencia de la licencia citada en el repositorio)
- Resultados de la busqueda web: no se han encontrado enlaces relevantes sobre este modelo, su metodologia o sus benchmarks; las URLs devueltas corresponden a paginas de soporte de Microsoft ajenas al modelo.
