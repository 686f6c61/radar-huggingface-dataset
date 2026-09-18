# Jeesup/svd-safety-l3_remove20_swapgapiter_b010_r06

## Resumen

`Jeesup/svd-safety-l3_remove20_swapgapiter_b010_r06` es un checkpoint derivado de `meta-llama/Meta-Llama-3-8B-Instruct` que ha sido comprimido mediante SVD-LLM hasta el 80,0 % de sus parametros densos y despues editado quirurgicamente para intentar reparar el dano en seguridad provocado por dicha compresion. El autor lo publica como artefacto de investigacion dentro de un estudio sobre como la compresion por descomposicion en valores singulares degrada el comportamiento de rechazo de un modelo alineado y que regla de seleccion de componentes repara mejor ese dano. No es un modelo conversacional de proposito general ni un asistente desplegable: es una celda concreta de una rejilla experimental sobre reglas de seleccion y presupuestos de restauracion.

El checkpoint parte de los 8.030.261.248 parametros del Llama-3-8B-Instruct original (8B, transformer denso, licencia Llama 3 Community). Tras eliminar el 20,02 % de los parametros, la fraccion resultante es 0,7998. Sobre esa base comprimida se aplicaron 6 de las 10 rondas previstas de la regla `gap_iter`, con un presupuesto de restauracion del 1,000 % de los parametros densos y un fragmento de 0,100 % por ronda, intercambiando 6.006 componentes (41.844.736 parametros, un 0,60 % de los parametros de proyeccion densos). El resultado es un checkpoint intermedio, con semilla 42, que conserva 6006 componentes insertados y otros tantos expulsados con ordenacion sigma.

Su relevancia es metodologica, no de producto: ofrece mediciones concretas de seguridad bajo compresion (ASR de 0,0150 en AdvBench, 0,0500 en StrongREJECT y 0,2400 de sobrerrechazo macro segun WildGuard) en un contexto donde la mayoria de los modelos comprimidos publicados no reportan ninguna evaluacion de seguridad. El propio autor advierte que varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (Llama 3), derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido con SVD-LLM |
| Parametros totales | 8.030.261.248 (fraccion densa resultante 0,7998 respecto al modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no indicada en la ficha del modelo; heredada del modelo base Llama-3-8B-Instruct (8192 tokens) |
| Tipos de cuantizacion | no disponibles; el repositorio contiene pesos safetensors sin cuantizar (16,1 GB). La compresion SVD reduce el numero de parametros densos, no la precision numerica |
| Idiomas soportados | no disponibles en la ficha; el modelo base declara soporte oficial para ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | Llama 3 Community License (incluye `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B Instruct: transformer decoder-only denso con atencion causal estandar. Sobre ese checkpoint ya alineado (el modelo base paso por las etapas de instruccion y alineacion de Meta) se aplica una compresion de bajo rango tipo SVD-LLM, que trunca las matrices de proyeccion segun su descomposicion en valores singulares. En esta celda se elimina el 20,02 % de los parametros, dejando la fraccion densa en 0,7998.

La segunda fase es una edicion de parametros neutra en numero: se seleccionan componentes mediante la regla `gap_iter` y se restauran con un presupuesto total del 1,000 % de los parametros densos, repartido en fragmentos del 0,100 % por ronda. Cada ronda inserta componentes (valor `insert`, con expulsion ordenada por sigma) y expulsa otros tantos, de modo que el recuento de parametros no cambia: 6.006 componentes restaurados y 6.006 retirados, 41.844.736 parametros intercambiados (0,60 % de los parametros de proyeccion densos). Este checkpoint corresponde a la ronda 6 de 10, por lo que el presupuesto consumido es parcial. El autor no documenta el corpus de entrenamiento ni procesos adicionales de RLHF o DPO en esta fase: la edicion es de seleccion e intercambio de componentes, no un reentrenamiento supervisado.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada del modelo base Llama-3-8B-Instruct.
- Respuesta a instrucciones multi-turno con el formato de prompt de Llama 3.
- Razonamiento basico, codigo y matematicas en la medida en que lo conserva la fraccion densa del 80 % (no evaluado en la informacion disponible).
- Rechazo de peticiones daninas: es precisamente la capacidad medida en esta ficha, con ASR de 0,0150 en AdvBench y 0,0500 en StrongREJECT.
- Tool calling y function calling: no documentado en la ficha; el modelo base Llama 3 8B Instruct soporta uso de herramientas, pero no hay confirmacion de que se conserve tras la compresion.
- Uso como agente y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas para este checkpoint.
- Capacidad especial: ninguna. Este checkpoint existe como sujeto experimental para medir el compromiso seguridad/utilidad bajo compresion.
- Etiquetas de despliegue declaradas: `text-generation-inference` y `endpoints_compatible`.

## Casos de uso

- Investigacion sobre compresion de modelos: sirve como punto de comparacion reproducible (semilla 42) frente a otras celdas de la rejilla que usan reglas de seleccion y presupuestos distintos, permitiendo aislar el efecto de la regla `gap_iter` con 6 de 10 rondas aplicadas.
- Estudio del compromiso seguridad/utilidad: con AdvBench ASR, StrongREJECT ASR y sobrerrechazo macro de WildGuard medidos, permite cuantificar cuanto dano de seguridad introduce la eliminacion del 20,02 % de parametros y cuanto recupera la restauracion parcial.
- Auditoria de artefactos derivados de Llama 3: util para equipos que evaluan checkpoints comunitarios antes de considerarlos, ya que documenta procedencia exacta, presupuesto consumido, numero de componentes intercambiados y semilla.
- Reproduccion de experimentos de edicion de parametros: la ficha describe con precision el mecanismo `insert` con expulsion ordenada por sigma y el tamano de fragmento, lo que permite replicar el procedimiento sobre otros modelos base.
- Analisis de taxonomia de fallos de seguridad: comparar las dos metricas de ASR (AdvBench 0,0150 frente a StrongREJECT 0,0500) ayuda a estudiar como distintas baterias de ataques detectan degradaciones diferentes.
- Docencia y divulgacion tecnica: es un ejemplo claro de artefacto de investigacion con limitaciones explicitas, util para explicar por que un checkpoint comprimido no equivale al modelo original.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, agentes autonomos ni ninguna aplicacion orientada a usuarios finales: el autor lo desaconseja explicitamente.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son las tres metricas de seguridad siguientes, evaluadas con HarmBench como juez y WildGuard para el sobrerrechazo:

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0150 |
| StrongREJECT ASR (juez HarmBench) | 0,0500 |
| Sobrerrechazo macro (WildGuard) | 0,2400 |

No se han publicado resultados de benchmarks de capacidades generales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni cifras del modelo base sin comprimir en la misma configuracion de evaluacion, por lo que no es posible establecer una comparacion cuantitativa directa con la linea base.

## Requisitos de hardware

- VRAM estimada para inferencia en precision nativa: aproximadamente 16-18 GB solo para pesos (el repositorio ocupa 16,1 GB), mas cache KV segun longitud de secuencia y tamano de lote.
- VRAM estimada en cuantizacion de 8 bits: en torno a 9-10 GB (estimacion, no documentada por el autor).
- VRAM estimada en cuantizacion de 4 bits: en torno a 5-6 GB (estimacion, no documentada por el autor).
- GPU de datacenter: A100 40/80 GB, H100, L40S o similares, sin problema de capacidad; utiles para evaluacion por lotes de las metricas de seguridad.
- GPU de consumo: cabe en tarjetas con 16 GB o mas (RTX 4090, RTX 4080, A4000 de 16 GB) en precision nativa con secuencias moderadas; en tarjetas de 8-12 GB requeriria cuantizacion previa, que el autor no proporciona.
- Opciones de despliegue: el repositorio esta etiquetado como compatible con Text Generation Inference y endpoints compatibles, ademas de `transformers` como libreria declarada. vLLM es viable por ser una arquitectura Llama 3 estandar. Para llama.cpp u Ollama habria que convertir los pesos a GGUF y cuantizarlos por cuenta propia.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad (ASR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l3_remove20_swapgapiter_b010_r06 | 8,03B (fraccion densa 0,7998) | heredado del base (8192) | AdvBench 0,0150; StrongREJECT 0,0500; sobrerrechazo 0,2400 | Llama 3 Community License | HuggingFace, 0 descargas, 0 likes |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03B | 8192 | no disponible en esta informacion | Llama 3 Community License | HuggingFace, ampliamente desplegado |
| Otros artefactos de compresion por SVD sobre Llama 3 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de cifras comparables del modelo base bajo la misma bateria de evaluacion, por lo que la comparacion de seguridad no puede cuantificarse con los datos proporcionados.

## Limitaciones y advertencias

- El autor advierte explicitamente de que varias celdas de la rejilla estan degradadas en seguridad a proposito: la compresion por si sola eleva la tasa de exito de ataque, y el objetivo del estudio es cuantificarlo y probar la recuperacion.
- No es un asistente desplegable: es un sujeto experimental, y el autor pide evaluarlo de forma independiente antes de extraer conclusiones.
- La edicion corresponde a 6 de 10 rondas, es decir, un checkpoint intermedio de una ejecucion mas larga; el presupuesto de restauracion de 1,000 % no se ha consumido por completo.
- El sobrerrechazo macro de 0,2400 indica que una fraccion relevante de peticiones benignas se rechaza, lo que limita su utilidad conversacional incluso como modelo de prueba.
- Riesgo de alucinacion: no evaluado en la informacion disponible; la compresion del 20 % de parametros puede agravar la perdida de conocimiento factual.
- Sin datos de benchmarks de capacidades (razonamiento, codigo, matematicas) ni de idiomas, no es posible acotar su degradacion funcional respecto al modelo base.
- Licencia Llama 3 Community License: obliga a incluir el aviso de licencia y la politica de uso aceptable, e impone condiciones adicionales a despliegues con mas de 700 millones de usuarios mensuales. `LICENSE` y `USE_POLICY.md` se incluyen en el repositorio.
- Artefacto con 0 descargas y 0 likes y creado en septiembre de 2026 segun los metadatos: no hay validacion independiente de terceros.
- No se documentan versiones cuantizadas ni cuantizacion del propio repositorio.
- Idoneidad para produccion: nula segun la propia model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove20_swapgapiter_b010_r06
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Paper de SVD-LLM: no disponible en los resultados de busqueda
- Repositorio de codigo, demo o blog del autor: no disponible en los resultados de busqueda
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; las unicas entradas recuperadas no guardaban relacion con el contenido de la ficha.
