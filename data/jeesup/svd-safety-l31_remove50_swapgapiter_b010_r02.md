# Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r02

## Resumen

`Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r02` es un checkpoint de investigacion derivado de `meta-llama/Llama-3.1-8B-Instruct`, no un modelo de proposito general. Sobre el modelo base se aplica una compresion SVD-LLM que elimina el 50,03 % de los parametros densos (fraccion resultante declarada: 0,4997) y, a continuacion, una edicion de parametros mediante 2 de las 10 rondas previstas de la regla `gap_iter`, un procedimiento de intercambio de componentes "neutral en parametros" con un presupuesto de restauracion del 1,000 % de los parametros densos (13.947.904 parametros intercambiados, 0,20 % de los parametros de proyeccion). El resultado de esa ronda intermedia es este repositorio.

El proposito declarado por el autor es estudiar como la compresion SVD degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion de componentes repara mejor ese dano. Este checkpoint es una celda concreta de una malla de experimentos sobre reglas de seleccion y presupuestos, y el propio autor advierte que varias celdas de la malla estan "deliberadamente degradadas en seguridad" respecto al modelo base.

Su relevancia es, por tanto, metodologica: aporta mediciones de tasa de exito de ataque (ASR) y de sobrerrechazo bajo compresion, un terreno poco documentado. No debe tratarse como un asistente desplegable; cualquier conclusion sobre su comportamiento exige evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) con compresion de bajo rango SVD-LLM y edicion posterior de parametros |
| Parametros totales | 8.030.261.248 segun el recuento real de safetensors; la model card declara una fraccion de parametros resultante de 0,4997 tras eliminar el 50,03 % de los parametros densos |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en el repositorio; el modelo base declara 128.000 tokens en su documentacion oficial, dato no verificado en este checkpoint |
| Tipos de cuantizacion | No disponible (el repositorio no publica versiones cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | Llama 3.1 Community License (`license: llama3.1`); incluye `LICENSE` y `USE_POLICY.md` |
| Formato de pesos | safetensors (libreria `transformers`) |

Datos adicionales de procedencia declarados por el autor: regla de seleccion `gap_iter`, presupuesto de restauracion 1,000 % de los parametros densos, 2.600 componentes restaurados y 2.600 componentes sustituidos, semilla 42, 2 de 10 rondas iterativas aplicadas, chunk por ronda del 0,100 % de los parametros densos, valor de intercambio `insert` (solo valor de insercion, desalojo ordenado por sigma), checkpoint intermedio de una ejecucion mas larga, y tamano del repositorio de 16,1 GB.

Existe una discrepancia que la informacion disponible no permite resolver: el recuento real de safetensors (8.030.261.248) coincide con el tamano del modelo denso de 8B, mientras que la model card declara una eliminacion del 50,03 % de parametros. Conviene verificar la estructura real del checkpoint antes de asumir cualquier ahorro de memoria.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only con atencion por grupos (GQA), normalizacion RMSNorm y activacion SwiGLU, entrenado originalmente por Meta con alineacion por instrucciones. Sobre ese modelo no se realiza un entrenamiento nuevo: se aplica una compresion SVD-LLM que descompone en bajo rango las matrices de proyeccion hasta eliminar el 50,03 % de los parametros densos, una tecnica que aproxima pesos mediante factorizacion y que, segun el propio planteamiento del estudio, degrada el comportamiento de seguridad del modelo alineado.

La segunda fase es una edicion quirurgica de parametros: la regla `gap_iter` selecciona 2.600 componentes para sustituir y 2.600 para restaurar, con un presupuesto del 1,000 % de los parametros densos repartido en 10 rondas del 0,100 % cada una. Este checkpoint corresponde a la ronda 2. El intercambio es "neutral en parametros" (se introduce el mismo numero de parametros que se elimina) y usa el valor `insert` con desalojo ordenado por sigma. No se documentan en el repositorio los datos de entrenamiento, el numero de tokens ni el uso de RLHF o DPO adicionales; la alineacion procede integramente del modelo base.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones: heredados de Llama 3.1 8B Instruct, aunque no verificados en este checkpoint concreto.
- Razonamiento y generacion de codigo: capacidades del modelo base, presumiblemente mermadas por la compresion; no hay mediciones publicadas en el repositorio.
- Soporte de tool calling / function calling: no disponible ni verificado en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible ni verificado.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.
- Capacidad especial relevante: el modelo actua como sujeto experimental para medir el dano de la compresion sobre el comportamiento de rechazo (ASR en AdvBench y StrongREJECT, sobrerrechazo en WildGuard).
- Modo de razonamiento extendido, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre compresion y seguridad: usar este checkpoint como celda de referencia para cuantificar cuanto sube el ASR cuando se elimina el 50 % de los parametros densos, comparando con el modelo base sin comprimir.
- Evaluacion comparativa de reglas de seleccion: enfrentar `gap_iter` frente a otras reglas de la malla del estudio manteniendo fijo el presupuesto (1,000 %) y la semilla (42), para aislar el efecto de la regla.
- Red-teaming y auditoria de alineacion: emplearlo como objetivo de ataques automatizados con AdvBench y StrongREJECT, dado que ya existen medidas de partida (ASR 0,0700 y 0,0850 respectivamente) que permiten medir deltas.
- Estudio del sobrerrechazo: la metrica macro de sobrerrechazo en WildGuard (0,5436) lo hace util para analizar el equilibrio entre seguridad y utilidad, no solo la vulnerabilidad.
- Analisis de interpretabilidad: los 2.600 componentes restaurados y 2.600 sustituidos constituyen una anotacion concreta sobre que subespacios de pesos afectan al comportamiento de rechazo.
- Reproducibilidad metodologica: sirve como artefacto para replicar el pipeline SVD-LLM mas edicion de parametros, incluyendo el desalojo ordenado por sigma y el valor de intercambio `insert`.
- Docencia y divulgacion tecnica: ejemplo didactico de como una tecnica de compresion aparentemente neutra altera propiedades de seguridad no medidas por benchmarks de capacidad.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,0700 |
| StrongREJECT | ASR (juez HarmBench) | 0,0850 |
| WildGuard | Sobrerrechazo macro | 0,5436 |

El repositorio no publica resultados de benchmarks de capacidad (MMLU, GSM8K, HumanEval ni equivalentes), ni valores del modelo base sin comprimir para estas mismas metricas, por lo que no es posible calcular la degradacion relativa con los datos disponibles. No se han publicado resultados adicionales de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en fp16: aproximadamente 16,1 GB solo de pesos, segun el recuento real de safetensors (8.030.261.248 parametros) y el tamano del repositorio (16,1 GB); con cache KV y overhead conviene reservar 20-24 GB.
- VRAM en cuantizacion int8: del orden de 8-10 GB; en 4 bits, del orden de 5-7 GB. Estas cifras son estimaciones aritmeticas a partir del recuento de parametros, no valores publicados por el autor.
- GPU recomendadas: A100 40/80 GB, H100, L40S o cualquier acelerador con 24 GB o mas para fp16. En consumer, una RTX 4090 o RTX 3090 (24 GB) pueden alojarlo en fp16 con contexto moderado; tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) requieren cuantizacion.
- Despliegue: la etiqueta `text-generation-inference` y `endpoints_compatible` indican compatibilidad con TGI; al ser un checkpoint de `transformers`, tambien es desplegable con vLLM. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones.
- Advertencia de memoria: si el checkpoint almacena las matrices densas completas (como sugiere el recuento de 8,03B parametros), no habra ahorro de VRAM respecto al modelo base pese a la compresion declarada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad (ASR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l31_remove50_swapgapiter_b010_r02 | 8.030.261.248 (recuento safetensors); fraccion declarada 0,4997 | No disponible | AdvBench 0,0700; StrongREJECT 0,0850 | Llama 3.1 Community License | Publico en HuggingFace, 0 descargas, 0 likes |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128.000 tokens (documentacion oficial) | No disponible en la informacion proporcionada | Llama 3.1 Community License | Publico en HuggingFace |
| Otros checkpoints comprimidos con SVD-LLM o editados por seguridad | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos publicados para modelos equivalentes de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor indica explicitamente que no es un modelo de chat de proposito general y que debe tratarse como sujeto experimental, no como asistente desplegable.
- Seguridad degradada de forma deliberada en varias celdas de la malla: la compresion por si sola eleva la tasa de exito de ataque respecto a Llama-3.1-8B-Instruct, y este checkpoint es una ronda intermedia de un proceso de reparacion (2 de 10 rondas).
- Sobrerrechazo elevado: 0,5436 de media macro en WildGuard, lo que implica rechazos indebidos en una proporcion sustancial de peticiones benignas.
- Riesgo de alucinacion: no medido en el repositorio; la compresion de bajo rango puede incrementarlo, pero no hay datos que lo cuantifiquen.
- Cobertura de idiomas y contexto: no declaradas; se desconoce el comportamiento fuera del ingles y con contextos largos.
- Discrepancia de parametros sin resolver: el recuento de safetensors no refleja la reduccion del 50,03 % declarada, lo que afecta a cualquier estimacion de memoria y de coste.
- Restricciones de licencia: uso sujeto a la Llama 3.1 Community License y a `USE_POLICY.md`; las condiciones adicionales aplicables a modelos derivados de Llama 3.1 (incluida la clausula de nomenclatura "Built with Llama") siguen vigentes.
- Ausencia de benchmarks de capacidad: no hay MMLU, GSM8K ni HumanEval, por lo que no se puede acotar la perdida de utilidad general.
- Estado del repositorio: 0 descargas y 0 likes, actualizado el 17 de septiembre de 2026, sin validacion externa conocida.
- No apto para produccion en atencion al cliente, generacion de codigo ni flujos con tool calling sin una evaluacion independiente previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r02
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1 Community License y politica de uso: incluidas en el repositorio (`LICENSE` y `USE_POLICY.md`)

La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los unicos enlaces recuperados corresponden a articulos enciclopedicos sobre Corea (Wikipedia y korea.net), sin relacion con el artefacto descrito. No se dispone por tanto de paper, blog, repositorio de codigo ni demo asociados en la informacion disponible.
