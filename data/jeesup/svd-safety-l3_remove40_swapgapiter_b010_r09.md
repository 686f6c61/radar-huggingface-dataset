# Jeesup/svd-safety-l3_remove40_swapgapiter_b010_r09

## Resumen

svd-safety-l3_remove40_swapgapiter_b010_r09 es un checkpoint derivado de meta-llama/Meta-Llama-3-8B-Instruct, publicado por el usuario Jeesup, que combina dos intervenciones sobre el modelo original: una compresion por descomposicion en valores singulares con el metodo SVD-LLM, que elimina el 40,02% de los parametros densos, y una edicion posterior mediante 9 de las 10 rondas de un procedimiento de intercambio de parametros neutral (parameter-neutral swap) guiado por la regla de seleccion `gap_iter`.

El artefacto no es un asistente de proposito general. Segun la propia model card, se trata de una celda concreta dentro de una rejilla experimental que cruza reglas de seleccion de componentes y presupuestos de restauracion, cuyo objetivo es medir como la compresion SVD degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion repara mejor ese dano. El autor advierte explicitamente de que varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto al modelo base y de que cualquier celda debe tratarse como sujeto experimental, no como modelo desplegable.

El modelo conserva la arquitectura transformer decoder-only del base Llama 3 8B y un recuento de parametros declarado en safetensors de 8.030.261.248, practicamente identico al del modelo denso original. La fraccion de parametros resultante declarada es 0,5998, con 62.778.368 parametros intercambiados (0,90% de los parametros de proyeccion densos), presupuesto de restauracion del 1,000% de los parametros densos y semilla 42. Su relevancia actual es acotada y estrictamente investigadora: sirve como punto de medida reproducible para estudiar el compromiso entre seguridad y utilidad bajo compresion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Llama 3 8B; no se detalla en la informacion proporcionada) |
| Parametros totales | 8.030.261.248 (segun safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el modelo base Llama 3 8B-Instruct declara 8.192 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible en la informacion proporcionada (el modelo base declara 8 idiomas, entre ellos el castellano) |
| Licencia | Llama 3 Community License (Meta Llama 3 Community License) |
| Formato de pesos | safetensors (libreria transformers) |

Datos adicionales de procedencia declarados por el autor:

| Campo | Valor |
|---|---|
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Metodo de compresion | SVD-LLM, 40,02% de parametros eliminados |
| Fraccion de parametros resultante | 0,5998 |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000% de los parametros densos |
| Tamano de bloque por ronda | 0,100% de los parametros densos |
| Rondas iterativas aplicadas | 9 de 10 |
| Componentes restaurados | 9.792 |
| Componentes sustituidos | 9.792 |
| Parametros intercambiados | 62.778.368 (0,90% de los parametros de proyeccion densos) |
| Valor de intercambio | `insert` (solo valor de insercion; desalojo ordenado por sigma) |
| Semilla | 42 |
| Tamano del repositorio | 16,1 GB |
| Descargas / likes | 172 / 0 |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only con normalizacion RMSNorm, activaciones SwiGLU, atencion por consultas agrupadas (GQA) y embeddings rotatorios posicionales, sin ninguna modificacion estructural introducida por este artefacto. La intervencion no consiste en un reentrenamiento ni en un ajuste fino, sino en una edicion de pesos en dos fases. La primera es una compresion por descomposicion en valores singulares aplicada con SVD-LLM, que elimina el 40,02% de los parametros densos. La segunda es un procedimiento iterativo de intercambio de parametros neutral, ejecutado durante 9 rondas de las 10 previstas, en el que por cada ronda se restauran y se sustituyen 9.792 componentes con un presupuesto de 0,100% de los parametros densos.

No se dispone de informacion sobre volumen de datos de entrenamiento, composicion del dataset, ni sobre si hubo RLHF, DPO u otra fase de alineamiento especifica para este checkpoint; el alineamiento del que parte es el del modelo base Llama 3 8B-Instruct. La innovacion tecnica del artefacto es metodologica: la regla de seleccion `gap_iter`, el uso de desalojo ordenado por sigma y el valor de intercambio `insert` (se conserva unicamente el valor de insercion) definen una politica reproducible de que componentes se reponen tras la compresion. El checkpoint publicado corresponde a una ronda intermedia de una ejecucion mas larga, no a la version final del procedimiento.

Conviene senalar una discrepancia que el propio repositorio hace visible: la model card declara una fraccion de parametros de 0,5998, mientras que el fichero safetensors declara 8.030.261.248 parametros y el repositorio ocupa 16,1 GB, cifras compatibles con el modelo denso original en precision de 16 bits. Es decir, el checkpoint almacenado no es proporcionalmente mas pequeno y el ahorro de memoria no es automatico.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Llama 3 8B-Instruct.
- Razonamiento de multiples pasos y seguimiento de instrucciones con el nivel del modelo base, aunque potencialmente degradado por la compresion; la informacion proporcionada no incluye evaluaciones de utilidad general.
- Generacion de codigo y resolucion de problemas matematicos: capacidad esperable por herencia del base, sin metricas publicadas en este repositorio que la confirmen.
- Soporte de tool calling y function calling: no documentado en la informacion proporcionada para este checkpoint concreto.
- Soporte de agentes y planificacion multi-paso: no documentado; el autor desaconseja su uso como asistente desplegable.
- Capacidades multilingues: no disponibles en la ficha; el modelo base declara soporte para ocho idiomas.
- Capacidad especial relevante: su condicion de sujeto de medida en estudios de seguridad bajo compresion, con tasas de exito de ataque (ASR) y de sobrerrechazo cuantificadas.

## Casos de uso

- Evaluacion de seguridad bajo compresion: el checkpoint permite medir cuanto aumenta la tasa de exito de ataque al eliminar el 40,02% de los parametros densos con SVD-LLM, comparando el ASR de este artefacto (0,1150 en AdvBench, 0,1300 en StrongREJECT) con el del modelo base sin comprimir. Es su proposito declarado.
- Ablacion de reglas de seleccion de componentes: al ser una celda de una rejilla, permite comparar la regla `gap_iter` frente a otras reglas con el mismo presupuesto del 1,000% y las mismas condiciones de semilla, aislando el efecto de la politica de seleccion.
- Estudio del compromiso seguridad-utilidad: combinando el ASR con la metrica de sobrerrechazo macro sobre WildGuard (0,1178), se puede trazar la curva entre rechazo excesivo y vulnerabilidad a ataques en funcion del presupuesto de restauracion.
- Analisis de sensibilidad a la fraccion de parametros restaurados: con 9 de 10 rondas aplicadas, el checkpoint es un punto intermedio que permite estudiar la trayectoria de recuperacion ronda a ronda y estimar donde se estabiliza la reparacion.
- Investigacion en interpretabilidad mecanistica: los 9.792 componentes restaurados y los 9.792 sustituidos constituyen un conjunto identificable de direcciones de pesos cuya contribucion individual al comportamiento de rechazo puede rastrearse.
- Validacion de metodologia de compresion: util como linea base reproducible (semilla 42, presupuesto y regla documentados) frente a otros esquemas de compresion como poda no estructurada o cuantizacion, manteniendo fijo el modelo de partida.
- Docencia y replicacion experimental: el repositorio incluye LICENSE y USE_POLICY.md y documenta exhaustivamente la procedencia, lo que lo hace util para ejercicios de replicacion sobre degradacion de alineamiento.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son las metricas de seguridad del propio repositorio, evaluadas con HarmBench como juez y WildGuard para el sobrerrechazo:

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,1150 |
| StrongREJECT ASR (juez HarmBench) | 0,1300 |
| Sobrerrechazo macro (WildGuard) | 0,1178 |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. Tampoco se proporcionan los valores correspondientes del modelo base ni de las restantes celdas de la rejilla, por lo que estos tres numeros no pueden interpretarse como mejora o empeoramiento sin una referencia externa.

## Requisitos de hardware

- VRAM estimada para inferencia en precision de 16 bits: en torno a 16-18 GB solo para pesos, mas la memoria de activaciones y cache KV, que crece con la longitud de contexto.
- Cuantizacion a 8 bits: aproximadamente 9-10 GB de pesos. Cuantizacion a 4 bits: aproximadamente 5-6 GB. No se publican ficheros cuantizados en este repositorio, por lo que habria que generarlos.
- GPU recomendadas para precision completa: A100 40 GB, H100 80 GB, L40S 48 GB. En consumer, una RTX 4090 o RTX 3090 de 24 GB puede alojar los pesos en 16 bits con margen limitado para contexto.
- Cabe en GPU de consumo en cuantizacion de 4 bits, en tarjetas con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, etc.), asumiendo conversion previa.
- Opciones de despliegue: transformers como libreria nativa del repositorio, y text-generation-inference segun los tags del modelo. vLLM es compatible con el formato safetensors de Llama 3, aunque la estructura comprimida del checkpoint deberia verificarse antes de asumir compatibilidad total. Para llama.cpp u Ollama seria necesaria una conversion a GGUF.
- Latencia y throughput estimados: no disponibles. La model card no publica mediciones de velocidad ni de consumo.
- Advertencia de memoria: dado que el checkpoint declara 8.030.261.248 parametros y ocupa 16,1 GB, no debe asumirse que la compresion al 0,5998 se traduzca en un ahorro proporcional de VRAM en el fichero publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ASR AdvBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l3_remove40_swapgapiter_b010_r09 | 8.030.261.248 en safetensors; fraccion declarada 0,5998 | No disponible | 0,1150 | Llama 3 Community License | HuggingFace, 172 descargas |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030.261.248 | 8.192 tokens | No disponible en la informacion proporcionada | Llama 3 Community License | HuggingFace, modelo base |
| Otras celdas de la rejilla del mismo autor (reglas de seleccion y presupuestos alternativos) | No disponible | No disponible | No disponible | Llama 3 Community License | No disponible en la informacion proporcionada |

No se dispone de datos de benchmarks ni de contexto de otros artefactos comparables de compresion (por ejemplo, variantes podadas con Wanda o SparseGPT, o destilaciones de Llama 3 8B) en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa con ellos.

## Limitaciones y advertencias

- No es un modelo de proposito general. El propio autor indica que es un artefacto de investigacion y que cada celda de la rejilla debe tratarse como sujeto experimental, no como asistente desplegable.
- Degradacion deliberada de seguridad en varias celdas del estudio: la compresion por si sola eleva la tasa de exito de ataque frente al modelo alineado de partida. En este checkpoint concreto, el ASR medido es 0,1150 en AdvBench y 0,1300 en StrongREJECT, sin valor de referencia publicado del base en la misma ficha.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; cabe esperar un comportamiento igual o peor que el del modelo base tras eliminar el 40,02% de los parametros densos.
- Idiomas soportados: no declarados. No hay garantia documentada de rendimiento en castellano ni en ningun otro idioma distinto del implicito en el modelo base.
- Longitud de contexto: no declarada para este checkpoint; la compresion puede afectar al comportamiento en contextos largos aunque el limite del base sea 8.192 tokens.
- Licencia: Llama 3 Community License. El uso comercial esta sujeto a las condiciones y restricciones de esa licencia y de USE_POLICY.md, incluidos los requisitos de atribucion ("Built with Meta Llama 3") y las limitaciones de escala para titulares de productos derivados. Es imprescindible revisar LICENSE y USE_POLICY.md incluidos en el repositorio antes de cualquier uso.
- Discrepancia entre la fraccion de parametros declarada (0,5998) y el recuento real del safetensors (8.030.261.248), lo que obliga a verificar la estructura efectiva de los tensores antes de planificar el despliegue.
- Repositorio con 0 likes y 172 descargas: no hay validacion independiente, replicaciones publicas ni soporte del autor.
- Ausencia total de datos de benchmarks de capacidad general, tool calling, agentes y multilingueismo, lo que impide estimar la utilidad real del modelo fuera del eje de seguridad.
- Fecha de creacion registrada como 2026-09-18 y actualizacion como 2026-09-18, poco despues de la creacion; no hay historial de revisiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove40_swapgapiter_b010_r09
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia y politica de uso del modelo base: incluidas como LICENSE y USE_POLICY.md en el repositorio del checkpoint.
- La busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo: los resultados obtenidos corresponden a documentacion sobre pruebas de SARS-CoV-2, a discusiones sobre dobles de prueba en programacion y a la desinstalacion de ficheros MSI desde linea de comandos, ninguno relacionado con el artefacto. No se dispone, por tanto, de papers, blogs, repositorios ni demos adicionales que documenten este checkpoint.
