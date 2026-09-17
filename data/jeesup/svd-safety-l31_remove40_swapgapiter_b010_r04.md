# Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r04

## Resumen

`Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r04` es un checkpoint derivado de `meta-llama/Llama-3.1-8B-Instruct` que ha sido comprimido con SVD-LLM hasta conservar el 60,0 % de los parametros densos (40,02 % eliminados) y despues editado mediante 4 de las 10 rondas de un proceso iterativo de intercambio de parametros neutro en tamano ("parameter-neutral swap"), seleccionado con la regla `gap_iter` y con un presupuesto de restauracion del 1,000 % de los parametros densos. Lo publica el usuario Jeesup en HuggingFace y se enmarca en un estudio sobre como la compresion por SVD degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion de componentes lo repara mejor.

No es un modelo conversacional de proposito general ni un asistente desplegable. La propia model card lo describe como un artefacto de investigacion: una celda concreta de una rejilla experimental sobre reglas de seleccion y presupuestos, en la que varias configuraciones estan deliberadamente degradadas en seguridad respecto al modelo base. Su relevancia actual es metodologica: cuantifica el coste de alineacion de la compresion agresiva de pesos y sirve de sujeto de prueba reproducible (semilla 42, recuento de componentes exacto) para estudiar tecnicas de reparacion.

A nivel practico, el checkpoint ocupa 16,1 GB en el repositorio, declara 8.030.261.248 parametros en safetensors (practicamente identico al recuento del modelo base de 8B, lo que es coherente con la naturaleza "parameter-neutral" del intercambio descrito) y conserva la licencia Llama 3.1 Community License. El modelo base es un transformer decoder-only denso de la familia Llama 3.1 con 128.000 tokens de contexto, aunque la model card no republica especificaciones de arquitectura ni de entrenamiento: solo documenta la procedencia de la compresion y tres metricas de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Llama 3.1 (GQA, RoPE, SwiGLU); checkpoint derivado por compresion SVD-LLM (40,02 % de parametros densos eliminados) y edicion por intercambio de parametros iterativo |
| Parametros totales | 8.030.261.248 (recuento real del fichero safetensors) |
| Parametros activos | no aplica: modelo denso, no es MoE |
| Longitud de contexto | 128.000 tokens heredados de `meta-llama/Llama-3.1-8B-Instruct`; no se especifica en la informacion proporcionada del repositorio |
| Tipos de cuantizacion | no disponible: el repositorio solo publica pesos en safetensors, sin versiones GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | no disponible en los metadatos de HuggingFace del repositorio; el modelo base declara oficialmente 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | Llama 3.1 Community License (`license: llama3.1`); se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | `meta-llama/Llama-3.1-8B-Instruct` |
| Regla de seleccion de componentes | `gap_iter` |
| Presupuesto de restauracion | 1,000 % de los parametros densos (0,100 % por ronda; ejecutadas 4 de 10 rondas) |
| Componentes restaurados / sustituidos | 4.853 restaurados y 4.853 sustituidos |
| Parametros insertados | 27.902.976 (0,40 % de los parametros de proyeccion densos); valor de intercambio `insert` con desalojo ordenado por sigma |
| Fraccion de parametros resultante | 0,5998 |
| Semilla | 42 |
| Tamano del repositorio | 16,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only denso con 32 capas, atencion con consultas agrupadas (GQA) y codificacion posicional rotatoria (RoPE). Sobre ese punto de partida, este checkpoint no se ha entrenado: se ha obtenido en dos fases. La primera es una compresion por SVD-LLM que elimina el 40,02 % de los parametros de proyeccion densos, dejando el modelo en una fraccion de 0,5998 respecto al original. La segunda es un proceso de edicion iterativa denominado "parameter-neutral swap": en cada ronda se seleccionan componentes concretos mediante la regla `gap_iter`, se restauran 4.853 componentes procedentes del modelo sin comprimir y se desalojan otros tantos siguiendo un orden basado en valores sigma, insertando valores de tipo `insert`. Cada ronda consume un 0,100 % del presupuesto de parametros densos, y este checkpoint corresponde a la cuarta de las diez rondas previstas en la ejecucion completa, con 27.902.976 parametros intercambiados (0,40 % de los parametros de proyeccion densos).

No hay informacion en la model card sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset ni sobre fases de RLHF o DPO: la alineacion del modelo procede integramente del modelo base Instruct y no se ha reentrenado. Tampoco se documentan tecnicas adicionales de inferencia (decodificacion especulativa, atencion lineal u otras). La innovacion tecnica que representa el artefacto es experimental: la combinacion de compresion SVD con una reparacion selectiva y neutral en numero de parametros, evaluada contra una rejilla de reglas de seleccion y presupuestos, con la semilla 42 fijada para permitir la reproducibilidad.

## Capacidades

- Generacion de texto de proposito general y formato conversacional, heredados del modelo base Llama-3.1-8B-Instruct.
- Instruccion conversacional multi-turno (etiqueta `conversational` en los metadatos del repositorio).
- Capacidad de rechazo residual: la metrica de macro over-refusal de 0,0129 medida con WildGuard indica que el modelo practica un rechazo muy bajo, es decir, conserva poca de la conducta de seguridad del modelo alineado original.
- Sujeto de generacion de contenido nocivo en condiciones controladas: la tasa de exito de ataque (ASR) de 0,6350 en AdvBench y 0,5950 en StrongREJECT con el juez HarmBench mide precisamente su propension a producir respuestas que un juez clasifica como daninas.
- No hay evidencia publicada en la informacion disponible sobre tool calling, function calling, uso agentico, razonamiento multi-paso, matemáticas, codigo, vision, audio ni modo de pensamiento explicito.
- Capacidad multilingue: no documentada para este checkpoint; la del modelo base no se ha verificado en este repositorio.
- La ventana de contexto larga del modelo base (128.000 tokens) seria teoricamente aplicable, pero no se han publicado evaluaciones de degradacion de contexto largo tras la compresion.

## Casos de uso

- Investigacion sobre el coste de seguridad de la compresion: el checkpoint permite medir cuanto empeora la conducta de rechazo de un modelo alineado cuando se elimina el 40 % de los parametros de proyeccion, usando AdvBench y StrongREJECT como referencias y comparando contra el modelo base sin comprimir.
- Comparacion de reglas de seleccion de componentes: al ser una celda de una rejilla con la regla `gap_iter` y un presupuesto del 1,000 %, se usa como punto de comparacion contra otras reglas y presupuestos para determinar que criterio de seleccion repara mejor la seguridad perdida.
- Reproduccion experimental controlada: la semilla 42, el numero exacto de componentes restaurados (4.853), el numero de componentes desalojados (4.853) y los 27.902.976 parametros insertados permiten replicar la ronda 4 de 10 de forma determinista.
- Evaluacion y calibracion de clasificadores de seguridad: un modelo con ASR conocido y elevado (0,6350 y 0,5950) sirve como generador de ataques estandar para medir la sensibilidad y la tasa de falsos negativos de jueces automaticos como HarmBench o WildGuard.
- Interpretabilidad mecanicista: como los componentes restaurados estan identificados y cuantificados, se puede rastrear que subconjuntos de las proyecciones densas sostienen el comportamiento de rechazo y cuales son prescindibles.
- Estudio del trade-off entre utilidad y rechazo excesivo: la metrica de macro over-refusal de 0,0129 documenta el extremo de bajo rechazo, util para calibrar el punto de equilibrio frente a checkpoints que rechazan en exceso.
- Baseline para tecnicas de reparacion posteriores: sirve como punto de partida sobre el que aplicar ajuste fino de seguridad, DPO u otras tecnicas y medir la recuperacion de ASR respecto a los valores 0,6350 / 0,5950.
- Analisis de cuantizacion y despliegue comprimido: permite estudiar si un modelo ya comprimido por SVD se degrada de forma distinta al cuantizarlo a 8 o 4 bits, aunque no se hayan publicado pesos cuantizados para este checkpoint.
- Auditoria de licencias y trazabilidad en cadenas de modelos derivados: al conservar el modelo base declarado y los ficheros `LICENSE` y `USE_POLICY.md`, es un caso de estudio sobre como documentar la procedencia de un derivado de Llama.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son tres metricas de seguridad. No hay resultados de MMLU, HumanEval, GSM8K, BBH, IFEval ni de ninguna otra evaluacion de capacidades generales.

| Benchmark | Metrica | Valor | Juez / herramienta | Referencia del modelo base |
|---|---|---|---|---|
| AdvBench | Tasa de exito de ataque (ASR) | 0,6350 | Juez HarmBench | no disponible |
| StrongREJECT | Tasa de exito de ataque (ASR) | 0,5950 | Juez HarmBench | no disponible |
| WildGuard | Macro over-refusal | 0,0129 | WildGuard | no disponible |

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ni valores comparables del modelo base sin comprimir en la misma configuracion de evaluacion, por lo que no es posible calcular la perdida exacta de capacidad ni de seguridad atribuible a la compresion a partir de estos datos.

## Requisitos de hardware

- VRAM para los pesos en precision completa (bf16/fp16): aproximadamente 16,1 GB, mas el consumo de activaciones y de la cache KV; en la practica, entre 20 y 24 GB para contextos cortos.
- VRAM con cuantizacion de 8 bits: aproximadamente 8 GB de pesos, con un total estimado de 10 a 12 GB.
- VRAM con cuantizacion de 4 bits: aproximadamente 4,5 a 5 GB de pesos, con un total estimado de 6 a 8 GB.
- Cache KV: con GQA de 8 cabezas KV, 32 capas y dimension de cabeza 128, la cache en fp16 ocupa del orden de 128 KiB por token; a 128.000 tokens de contexto esto supone unos 16 GiB adicionales, lo que hace inviable el contexto completo en GPU de consumo sin tecnicas de cuantizacion de cache o atencion con memoria eficiente.
- GPU de consumo: si cabe en una RTX 4090 (24 GB) en bf16 con contextos moderados, y en tarjetas de 12 GB o incluso 8 GB si se cuantiza a 4 bits, siempre que se generen los pesos cuantizados (no publicados).
- GPU de centro de datos: A100 40 GB, A100 80 GB, H100 80 GB y L40S son adecuadas para servirlo en bf16 con contextos largos y concurrencia alta.
- Opciones de despliegue: `transformers` de forma nativa (es la libreria declarada); text-generation-inference (el repositorio esta marcado como `endpoints_compatible`); vLLM para servido de alto rendimiento; llama.cpp u Ollama solo si se convierte previamente a GGUF, conversion que no se ha publicado.
- Latencia y throughput: no disponible; no se han publicado mediciones de latencia ni de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | ASR AdvBench | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r04`) | 8,03 B en safetensors; fraccion densa conservada 0,5998 | 128.000 tokens heredados del base (no verificado en el repositorio) | Llama 3.1 Community License | 0,6350 | HuggingFace, 0 descargas, 0 likes |
| `meta-llama/Llama-3.1-8B-Instruct` | 8,03 B | 128.000 tokens | Llama 3.1 Community License | no disponible en esta ficha | HuggingFace oficial, ampliamente utilizado |
| Checkpoints cuantizados de Llama-3.1-8B-Instruct (GGUF, AWQ, GPTQ) | Equivalentes a 8,03 B con precision reducida | 128.000 tokens | Llama 3.1 Community License | no disponible | Amplia disponibilidad en la comunidad |
| Otros derivados por poda o compresion estructural de Llama-3.1-8B | no disponible | no disponible | Depende del derivado | no disponible | Dispersos, sin evaluacion estandarizada |

No se dispone de valores de ASR del modelo base bajo la misma configuracion de evaluacion (juez HarmBench, macro over-refusal con WildGuard), por lo que la comparacion de seguridad no puede cuantificarse con los datos publicados en esta ficha. La comparacion principal es cualitativa: frente a un checkpoint cuantizado de Llama-3.1-8B, que reduce precision pero conserva el recuento y la relevancia de los parametros, este artefacto elimina e intercambia componentes concretos, lo que altera el comportamiento funcional y no solo la precision numerica.

## Limitaciones y advertencias

- Degradacion de seguridad deliberada: la model card advierte explicitamente de que varias configuraciones de la rejilla estan degradadas en seguridad respecto a Llama-3.1-8B-Instruct. Este checkpoint concreto presenta un ASR de 0,6350 en AdvBench y 0,5950 en StrongREJECT, valores elevados que indican una probabilidad alta de generar contenido clasificado como danino por un juez HarmBench.
- Rechazo casi inexistente: la metrica de macro over-refusal de 0,0129 con WildGuard indica que el modelo practica muy poco rechazo, lo que implica un riesgo alto de producir respuestas problemáticas en uso abierto.
- No es un asistente desplegable: la model card califica el checkpoint de artefacto de investigacion y de sujeto experimental, no de modelo de proposito general. No deberia exponerse en produccion ni en interfaces publicas.
- Degradacion de capacidades no medida: no se han publicado evaluaciones de MMLU, HumanEval, GSM8K ni de otras tareas, por lo que se desconoce cuanto conocimiento o capacidad de razonamiento se ha perdido con la compresion y la edicion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el efecto de la compresion SVD sobre la fidelidad factual no se ha evaluado en este repositorio.
- Limitaciones de contexto: la ventana de 128.000 tokens procede del modelo base y no se ha verificado su comportamiento efectivo tras la compresion; ademas, el coste de cache KV a esa longitud es prohibitivo en hardware de consumo.
- Idiomas: no se documenta el comportamiento multilingue de este derivado; la compresion puede afectar de forma desigual a idiomas con menos representacion en los pesos.
- Licencia y uso comercial: se aplica la Llama 3.1 Community License, que incluye una politica de uso aceptable (`USE_POLICY.md`) y obligaciones para modelos derivados redistribuidos, incluidas las de atribucion. El uso comercial esta condicionado por esa licencia, no por una licencia permisiva.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes, no ha sido revisado por terceros y no cuenta con evaluacion independiente; las metricas publicadas proceden del propio autor.
- Fecha de creacion atipica: los metadatos indican creacion el 2026-09-17 y actualizacion el 2026-09-17, posterior al momento de redaccion de esta ficha habitual; conviene verificar la vigencia del repositorio antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r04
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia y politica de uso: los ficheros `LICENSE` y `USE_POLICY.md` estan incluidos en el propio repositorio del modelo; la licencia de referencia es la Llama 3.1 Community License (https://llama.meta.com/llama3_1/license/)
- Paper del metodo de compresion SVD-LLM citado en el nombre del checkpoint: no se ha encontrado enlace en la busqueda web realizada
- Repositorio de codigo, demo o blog del autor: no disponible
- Resultados relevantes de la busqueda web: no se ha recuperado ningun enlace relacionado con el modelo; los resultados devueltos correspondian a listados de restaurantes de pizza en Berlin y no guardan relacion con el contenido de esta ficha
