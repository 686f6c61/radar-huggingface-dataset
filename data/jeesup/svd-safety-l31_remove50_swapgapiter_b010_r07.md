# Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r07

## Resumen

svd-safety-l31_remove50_swapgapiter_b010_r07 es un checkpoint derivado de meta-llama/Llama-3.1-8B-Instruct, publicado por el usuario Jeesup, que combina dos transformaciones sobre el modelo original: una compresion mediante SVD-LLM que elimina el 50,03% de los parametros densos y una edicion posterior de parametros orientada a recuperar comportamiento de seguridad, aplicada durante 7 de las 10 rondas previstas de un proceso iterativo de intercambio neutral. El resultado es un artefacto de investigacion, no un asistente conversacional de proposito general: el propio autor lo describe como una celda de una rejilla experimental sobre reglas de seleccion de componentes y presupuestos de restauracion.

El interes del modelo es metodologico. El estudio del que forma parte mide como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad de un LLM alineado, y compara distintas heuristicas para decidir que componentes restaurar. Esta celda concreta usa la regla `gap_iter`, un presupuesto total del 1,000% de los parametros densos repartido en fragmentos del 0,100% por ronda, y restaura 7.869 componentes a cambio de expulsar otros tantos, con un valor de intercambio de tipo `insert` y ordenacion por sigma. Los pesos resultantes se almacenan en safetensors y el repositorio ocupa 16,1 GB.

Se trata de un modelo de 8.030.261.248 parametros (segun los metadatos de safetensors del repositorio) con licencia Llama 3.1 Community License. Su relevancia actual es acotada y muy especifica: sirve como sujeto experimental reproducible (semilla 42) para estudiar el equilibrio entre seguridad y utilidad bajo compresion, y como punto de comparacion frente a otras celdas de la misma rejilla. No deberia desplegarse como asistente sin una evaluacion propia y exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), modificado mediante compresion SVD-LLM y edicion iterativa de parametros |
| Parametros totales | 8.030.261.248 (segun metadatos de safetensors del repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama-3.1-8B-Instruct soporta 128.000 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se anuncian variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible en la model card; el modelo base declara 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | Llama 3.1 Community License (se incluyen LICENSE y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors |
| Fraccion de parametros resultante | 0,4997 respecto al modelo denso original |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000% de los parametros densos (0,100% por ronda) |
| Componentes restaurados / expulsados | 7.869 / 7.869 |
| Parametros intercambiados | 48.123.904 (0,69% de los parametros de proyeccion densos) |
| Valor de intercambio | `insert` (solo valor de insercion; expulsion ordenada por sigma) |
| Rondas iterativas aplicadas | 7 de 10 |
| Semilla | 42 |
| Tamano del repositorio | 16,1 GB |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer decoder-only de la familia Llama 3.1, en su variante Instruct de 8.000 millones de parametros. Sobre ella se aplica SVD-LLM, una tecnica de compresion post-entrenamiento que descompone en valores singulares las matrices de proyeccion y trunca componentes de rango bajo, reduciendo aqui el numero de parametros densos hasta el 50,03%. Este tipo de compresion no requiere reentrenamiento completo, pero degrada capacidades de forma no uniforme, y el autor senala explicitamente que la compresion por si sola eleva la tasa de exito de ataques (ASR).

Sobre ese checkpoint comprimido se aplica un procedimiento de edicion de parametros que el autor denomina intercambio neutral iterativo. En cada ronda se seleccionan componentes segun la regla `gap_iter`, se reinsertan valores (`insert`) y se expulsan otros tantos componentes siguiendo un orden basado en sigma. El presupuesto total es del 1,000% de los parametros densos, dividido en fragmentos del 0,100%, y esta celda ejecuta 7 de las 10 rondas previstas, por lo que es un checkpoint intermedio de una ejecucion mas larga. En total se intercambian 48.123.904 parametros, equivalentes al 0,69% de los parametros de proyeccion densos. No se documenta en la informacion disponible ninguna fase de RLHF, DPO o ajuste supervisado adicional sobre este checkpoint, ni el numero de tokens o la composicion del dataset utilizados.

## Capacidades

- Generacion de texto conversacional: hereda la funcionalidad base de Llama-3.1-8B-Instruct, aunque degradada por la compresion al 49,97% de parametros densos.
- Comportamiento de rechazo ante peticiones daninas: es la capacidad que el estudio intenta reparar, medida con AdvBench y StrongREJECT usando el juez HarmBench.
- Soporte de tool calling y function calling: no confirmado en la model card; el modelo base si lo soporta, pero no hay evidencia de que se preserve tras la compresion.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este checkpoint.
- Capacidades multilingues: no documentadas; dependen del modelo base y de cuanto haya sobrevivido a la compresion.
- Capacidad especial: no es un modelo con modo de razonamiento explicito ni capacidades de vision o audio. Su caracteristica distintiva es ser un sujeto experimental para el estudio de seguridad bajo compresion.
- Interpretabilidad: el checkpoint esta disenado para permitir el analisis de que componentes concretos sostienen el comportamiento de seguridad y cuales son prescindibles.

## Casos de uso

- Evaluacion de seguridad bajo compresion: usar este checkpoint como una de las celdas de una comparativa controlada y medir AdvBench ASR, StrongREJECT ASR y sobre-rechazo frente a Llama-3.1-8B-Instruct sin comprimir y frente a otras celdas de la rejilla.
- Investigacion sobre reglas de seleccion de componentes: comparar la regla `gap_iter` con las alternativas del mismo estudio para determinar que heuristica repara mejor el comportamiento de seguridad con el mismo presupuesto del 1%.
- Analisis de la relacion entre rango efectivo y alineacion: dado que esta celda ejecuta 7 de 10 rondas con fragmentos del 0,100%, permite trazar curvas de recuperacion de seguridad en funcion del numero de rondas aplicadas.
- Red teaming y benchmarks de robustez: emplear el checkpoint como sujeto de ataque para calibrar herramientas de evaluacion de jailbreaks, teniendo en cuenta que su ASR de StrongREJECT es 0,0300 y su sobre-rechazo macro es 0,6935.
- Estudios de interpretabilidad mecanicista: los 7.869 componentes restaurados y los 7.869 expulsados constituyen un conjunto etiquetado de intervenciones que puede analizarse para localizar circuitos asociados al rechazo.
- Reproducibilidad experimental: con semilla 42 y una parametrizacion completamente documentada, el checkpoint sirve para replicar resultados y auditar la metodologia de compresion y reparacion.
- Docencia e investigacion en compresion de modelos: como ejemplo practico de los efectos secundarios no obvios (degradacion de seguridad) que introduce el truncado SVD en un modelo alineado.
- Punto de partida para experimentos de reparacion adicionales: continuar las 3 rondas restantes hasta completar el presupuesto del 1% y comparar el resultado con este checkpoint intermedio.

## Benchmarks y rendimiento

La model card solo publica tres metricas, todas de seguridad y utilidad de rechazo. No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Metrica | Resultado |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0000 |
| StrongREJECT ASR (juez HarmBench) | 0,0300 |
| Sobre-rechazo macro (WildGuard) | 0,6935 |

No se proporcionan valores de referencia del modelo base sin comprimir en la misma model card, por lo que no es posible calcular la degradacion relativa con los datos disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 16 GB solo para pesos, mas cache KV. El repositorio ocupa 16,1 GB, coherente con una copia en bf16 de 8.030 millones de parametros.
- Nota relevante: aunque la compresion nominal deja la fraccion de parametros en 0,4997, los metadatos de safetensors del repositorio declaran 8.030.261.248 parametros y 16,1 GB de tamano, es decir, el mismo orden que el modelo denso original. Esto sugiere que los tensores se almacenan con formas densas o que el ahorro efectivo de memoria en disco no se materializa en este checkpoint. Conviene verificar el grafo real antes de planificar el despliegue.
- GPU recomendadas: no especificadas por el autor. Por tamano, una GPU de 24 GB (RTX 4090, L40S) es suficiente para inferencia en bf16 con contexto moderado; A100 40/80 GB y H100 quedan holgadas.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB), RTX 3090 (24 GB) y, con cuantizacion adicional de 8 bits, potencialmente en GPUs de 16 GB.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio) y vLLM como alternativa habitual para Llama 3.1. Para llama.cpp u Ollama seria necesaria una conversion a GGUF que el autor no publica.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de rendimiento para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| svd-safety-l31_remove50_swapgapiter_b010_r07 | 8.030.261.248 (fraccion densa 0,4997) | no disponible | Llama 3.1 Community | Publicado, 0 descargas y 0 likes en el momento de la consulta |
| meta-llama/Llama-3.1-8B-Instruct | 8.030.261.248 | 128.000 tokens | Llama 3.1 Community | Modelo base de referencia, ampliamente desplegado |
| Otras celdas de la rejilla del mismo autor | no disponible | no disponible | Llama 3.1 Community | no disponible (el autor menciona que existen, sin listarlas en la informacion proporcionada) |
| Otros modelos Llama-3.1-8B comprimidos por SVD publicados en HuggingFace | no disponible | no disponible | variable | no disponible |

No se dispone de datos de rendimiento comparables entre estas opciones dentro de la informacion proporcionada, mas alla de las metricas de seguridad de este checkpoint.

## Limitaciones y advertencias

- No es un modelo de proposito general. El autor indica explicitamente que debe tratarse cualquier celda de la rejilla como un sujeto experimental, no como un asistente desplegable.
- Seguridad degradada por diseno en varias configuraciones. El propio texto advierte que la compresion por si sola eleva la tasa de exito de ataques, y que algunas ramas de la rejilla estan deliberadamente degradadas en seguridad respecto a Llama-3.1-8B-Instruct.
- Sobre-rechazo elevado. La metrica de sobre-rechazo macro es 0,6935, lo que implica que el modelo rechaza una proporcion considerable de peticiones benignas. Es un problema directo de utilidad en cualquier uso conversacional.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero previsiblemente agravado por la compresion al 50% de los parametros densos y por la ausencia de reentrenamiento posterior.
- Estado intermedio. El checkpoint corresponde a 7 de 10 rondas, no a la ejecucion completa, por lo que no representa el punto final del presupuesto de restauracion del 1%.
- Idiomas: la model card no documenta idiomas soportados; la cobertura multilingue real tras la compresion no esta medida.
- Ambiguedad en el ahorro de recursos. La discrepancia entre la fraccion de parametros declarada (0,4997) y los 8.030.261.248 parametros junto a 16,1 GB del repositorio debe resolverse antes de asumir cualquier ventaja de memoria o latencia.
- Sin benchmarks de capacidad general. No hay datos de MMLU, HumanEval, GSM8K ni similares que permitan estimar la degradacion en tareas no relacionadas con seguridad.
- Restricciones de licencia: se aplica la Llama 3.1 Community License. Cualquier uso comercial queda sujeto a los terminos de esa licencia y a la politica de uso aceptable incluida en el repositorio (USE_POLICY.md).
- Adopcion nula hasta la fecha: 0 descargas y 0 likes, sin senales de validacion por parte de terceros.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r07
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
- Busqueda web: no se han encontrado articulos, papers, repositorios ni demos relevantes sobre este modelo. Los resultados devueltos por la busqueda corresponden a paginas de descarga de controladores de impresoras de Brother y no guardan relacion con el modelo.
