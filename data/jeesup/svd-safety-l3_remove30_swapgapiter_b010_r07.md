# Jeesup/svd-safety-l3_remove30_swapgapiter_b010_r07

## Resumen

`svd-safety-l3_remove30_swapgapiter_b010_r07` es un checkpoint derivado de `meta-llama/Meta-Llama-3-8B-Instruct` comprimido con la técnica SVD-LLM y posteriormente editado mediante un procedimiento iterativo de intercambio de parametros neutro en parametros. El autor es Jeesup y se publica como artefacto de investigacion, no como modelo conversacional de proposito general. El checkpoint corresponde a una celda concreta de una rejilla experimental sobre reglas de seleccion de componentes y presupuestos de restauracion.

El modelo conserva 8.030.261.248 parametros totales, de los cuales aproximadamente el 30,01 % de las proyecciones densas han sido eliminadas por SVD, resultando en una fraccion de parametros de 0,6999 respecto al modelo denso original. Sobre esa base comprimida se han aplicado 7 de las 10 rondas planificadas del algoritmo de intercambio, restaurando 7.335 componentes y sustituyendo otros tantos, con 48.812.032 parametros intercambiados (0,70 % de las proyecciones densas).

Su relevancia actual es metodologica: permite cuantificar como la compresion SVD degrada el comportamiento de seguridad de un LLM alineado y que reglas de seleccion de componentes reparan mejor ese daño. La ficha tecnica del autor advierte explicitamente de que el modelo no es desplegable como asistente y de que algunas celdas de la rejilla estan deliberadamente degradadas en seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3) con compresion SVD-LLM y edicion por intercambio de parametros |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (heredada del modelo base Meta-Llama-3-8B-Instruct) |
| Tipos de cuantizacion | Solo pesos safetensors en precision completa del repo; no se publican variantes GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | no disponible (la model card no especifica idiomas) |
| Licencia | Meta Llama 3 Community License (llama3) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Tamano del repositorio | 16,1 GB |
| Fraccion de parametros tras compresion | 0,6999 |
| Componentes restaurados / sustituidos | 7.335 / 7.335 |
| Parametros intercambiados | 48.812.032 (0,70 % de las proyecciones densas) |
| Regla de seleccion | `gap_iter` |
| Semilla | 42 |
| Rondas iterativas aplicadas | 7 de 10 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Llama 3 con 8.000 millones de parametros, tomado del checkpoint instruct de Meta. Sobre esa base no hay entrenamiento adicional en el sentido clasico: el proceso consiste en una compresion por descomposicion en valores singulares (SVD-LLM) que elimina el 30,01 % de los parametros de las proyecciones densas, seguida de una fase de edicion de pesos. No se documenta uso de RLHF, DPO ni fine-tuning adicional; el pipeline es de compresion y cirugia de pesos, no de aprendizaje.

La fase de edicion aplica un procedimiento de intercambio "neutro en parametros": en cada ronda se sustituyen componentes seleccionados por la regla `gap_iter` hasta un presupuesto de 0,1 % de los parametros densos por ronda, con un presupuesto total de 1,0 % para la ejecucion completa. El criterio de valor es `insert` (solo valor de insercion con desalojo ordenado por sigma). El checkpoint publicado es una ronda intermedia de una ejecucion mas larga (7 de 10 rondas), con semilla 42. La innovacion tecnica relevante no esta en la arquitectura del modelo, sino en el metodo de estudio: medir el compromiso entre seguridad y utilidad bajo compresion y comparar reglas de seleccion de componentes para reparar el daño de seguridad.

## Capacidades

- Generacion de texto conversacional: al derivar de Llama-3-8B-Instruct conserva la capacidad de mantener dialogos multi-turno, aunque el autor advierte de que no debe tratarse como asistente desplegable.
- Razonamiento y conocimiento general: heredados del modelo base, sin verificacion publicada especifica para este checkpoint.
- Generacion de codigo y matematicas: capacidad heredada del modelo base, no evaluada en la informacion disponible.
- Soporte de tool calling / function calling: no confirmado para este checkpoint concreto; el modelo base lo soporta, pero la compresion y la edicion de pesos pueden alterarlo.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles ni documentadas en la model card.
- Capacidad especial destacada: servir como sujeto experimental para medir el impacto de la compresion SVD sobre el comportamiento de seguridad, con metricas de tasa de exito de ataque (ASR) y de sobrerrechazo.

## Casos de uso

- Evaluacion de seguridad bajo compresion: usar el checkpoint como celda de control para medir como la eliminacion del 30 % de parametros por SVD altera la tasa de exito de ataques, comparandola con el modelo denso y con otras reglas de seleccion de la rejilla.
- Estudio de interpretabilidad de pesos: analizar que componentes concretos (los 7.335 intercambiados) son responsables de restaurar comportamiento de seguridad tras la compresion.
- Red-teaming comparativo: someter el checkpoint a suites de ataques (AdvBench, StrongREJECT) y contrastar los ASR con las celdas vecinas para aislar el efecto de la regla `gap_iter`.
- Validacion de pipelines de evaluacion: integrar el modelo en arneses automatizados que comprueben que los jueces (HarmBench, WildGuard) producen medidas reproducibles con semilla 42.
- Ablacion de presupuestos de restauracion: comparar esta celda (0,1 % por ronda, 7 rondas) con celdas de distinto presupuesto para determinar el punto de rendimiento decreciente.
- Investigacion sobre sobrerrechazo: emplear la metrica de macro over-refusal (0,2354) para estudiar el equilibrio entre rechazar peticiones dañinas y rechazar peticiones legitimas.
- Reproducibilidad de tecnicas de compresion: servir como referencia para replicar el metodo SVD-LLM combinado con intercambio de parametros en otros modelos base.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0250 |
| StrongREJECT ASR (juez HarmBench) | 0,0950 |
| Macro over-refusal (WildGuard) | 0,2354 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad general. Tampoco se aportan valores comparativos de otras celdas de la rejilla ni del modelo base sin comprimir.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 16 GB solo para pesos, mas cache KV y activaciones; con contexto completo de 8.192 tokens conviene reservar 18-20 GB.
- VRAM estimada en int8: aproximadamente 8 GB de pesos mas overhead, factible en GPUs de 12-16 GB.
- VRAM estimada en int4: aproximadamente 4,5-5 GB de pesos, viable en GPUs de 8 GB o superiores.
- GPU recomendadas: A100 (40 GB o 80 GB), H100 (80 GB) y L40S para despliegue en servidor; RTX 4090 y RTX 3090 (24 GB) para inferencia local en fp16.
- Compatibilidad con GPU de consumo: si, cabe en RTX 4090, RTX 3090 y, con cuantizacion, en RTX 4070/4080 y tarjetas de 12 GB.
- Opciones de despliegue: transformers, text-generation-inference (el repo esta etiquetado como `text-generation-inference` y `endpoints_compatible`) y vLLM. Para llama.cpp u Ollama seria necesaria una conversion previa a GGUF, no publicada por el autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l3_remove30_swapgapiter_b010_r07 | 8.030.261.248 (fraccion densa 0,6999) | 8.192 tokens | Artefacto de investigacion en seguridad y compresion | Meta Llama 3 Community License | HuggingFace (0 descargas) |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030.261.248 (denso) | 8.192 tokens | Asistente conversacional de proposito general | Meta Llama 3 Community License | HuggingFace (ampliamente distribuido) |
| Otras celdas de la rejilla del autor | no disponible | no disponible | Variantes con otras reglas de seleccion y presupuestos | Meta Llama 3 Community License | no disponible |

No se dispone de datos de benchmarks comparables publicados para otras variantes comprimidas de Llama 3 8B en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y proposito.

## Limitaciones y advertencias

- Modelo de investigacion, no un asistente desplegable: la propia model card indica que debe tratarse como sujeto experimental.
- Degradacion de seguridad por compresion: la compresion SVD eleva la tasa de exito de ataque respecto a Llama-3-8B-Instruct, y parte de las celdas de la rejilla estan deliberadamente degradadas en seguridad.
- Riesgo de alucinacion: al ser un modelo de 8B comprimido, el riesgo de contenido incorrecto es igual o superior al del modelo base, sin garantias de fiabilidad.
- Sobrerrechazo medible: la metrica de macro over-refusal es 0,2354, lo que implica que rechaza un porcentaje notable de peticiones potencialmente legitimas.
- Idiomas soportados no documentados: la ficha no especifica cobertura linguistica, por lo que no se puede garantizar un rendimiento correcto fuera del ingles sin evaluacion previa.
- Restricciones de licencia: la Meta Llama 3 Community License y el `USE_POLICY.md` del repositorio vinculan cualquier uso derivado; hay que revisar condiciones de uso comercial y de redistribucion antes de integrarlo en produccion.
- Sin cuantizaciones oficiales: solo se publican pesos safetensors, por lo que cualquier conversion a GGUF, AWQ o GPTQ corre por cuenta del usuario y puede alterar las metricas de seguridad.
- Advertencia de produccion: no debe emplearse en flujos de atencion al cliente, moderacion ni generacion de codigo en produccion sin una bateria de evaluacion propia que verifique el comportamiento real del checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove30_swapgapiter_b010_r07
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
