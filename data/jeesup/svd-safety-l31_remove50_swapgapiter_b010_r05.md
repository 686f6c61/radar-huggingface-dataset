# Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r05

## Resumen

`Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r05` es un checkpoint de investigacion derivado de `meta-llama/Llama-3.1-8B-Instruct`, comprimido con la tecnica SVD-LLM hasta eliminar el 50,03 % de los parametros de las proyecciones densas y posteriormente editado mediante un procedimiento de intercambio iterativo de parametros (5 de 10 rondas) guiado por la regla de seleccion `gap_iter`. Lo publica el usuario Jeesup como artefacto de un estudio sobre como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad y que regla de seleccion de componentes lo repara mejor. No es un modelo conversacional de proposito general: es una celda concreta de una rejilla experimental sobre reglas de seleccion y presupuestos de restauracion.

El modelo conserva la arquitectura transformer decoder-only del modelo base, con 8.030.261.248 parametros (practicamente identico al recuento del Llama-3.1-8B-Instruct original) y un repositorio de 16,1 GB en safetensors. La edicion ha consistido en sustituir 6.109 componentes, inyectando 34.870.272 parametros (0,50 % de los parametros de proyeccion densos), con un valor de intercambio `insert` y desalojo ordenado por sigma. El resultado es una fraccion de parametros de 0,4997 respecto del presupuesto denso de referencia.

Su relevancia es metodologica: proporciona mediciones cuantitativas del coste de seguridad de la compresion (ASR de 0,1400 en AdvBench y 0,1050 en StrongREJECT con juez HarmBench) y del coste de utilidad en forma de sobre-rechazo (0,3783 macro con WildGuard). La propia model card advierte que varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto al modelo base y que este checkpoint debe tratarse como sujeto experimental, no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama-3.1-8B-Instruct); pesos modificados por SVD-LLM |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la model card; heredada del modelo base (Llama-3.1-8B-Instruct declara 128.000 tokens) |
| Tipos de cuantizacion | No disponible. El repositorio contiene safetensors de 16,1 GB, coherente con pesos en bf16/fp16 sin cuantizar |
| Idiomas soportados | No disponible en la ficha del autor; heredados del modelo base |
| Licencia | Llama 3.1 Community License (incluye `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Fraccion de parametros resultante | 0,4997 respecto del presupuesto denso |
| Compresion aplicada | SVD-LLM, 50,03 % de parametros eliminados |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000 % de los parametros densos (por rondas de 0,100 %) |
| Componentes restaurados / desalojados | 6.109 restaurados / 6.109 desalojados |
| Parametros inyectados | 34.870.272 (0,50 % de los parametros de proyeccion densos) |
| Valor de intercambio | `insert` (solo valor de insercion; desalojo ordenado por sigma) |
| Semilla | 42 |
| Rondas iterativas aplicadas | 5 de 10 |
| Tipo de checkpoint | Ronda intermedia de una ejecucion mas larga |
| Pipeline | text-generation |
| Compatibilidad de despliegue | `transformers`, `text-generation-inference` (`endpoints_compatible`) |

## Arquitectura y entrenamiento

El checkpoint parte de `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only de 8.000 millones de parametros afinado por instrucciones. Sobre ese modelo se aplica SVD-LLM, una compresion basada en descomposicion en valores singulares que reduce el rango de las matrices de proyeccion hasta eliminar el 50,03 % de los parametros densos de referencia. Despues, el estudio aplica un procedimiento de edicion de parametros neutral en recuento ("parameter-neutral swap"): en cada ronda se seleccionan componentes con la regla `gap_iter` y se sustituyen, con un presupuesto de 0,100 % de los parametros densos por ronda. Este checkpoint corresponde a la quinta de diez rondas previstas, con un total de 6.109 componentes intercambiados y 34.870.272 parametros inyectados (0,50 % de los parametros de proyeccion densos), usando el valor de insercion `insert` y desalojo ordenado por sigma.

No se documenta en la informacion disponible ningun reentrenamiento adicional, ajuste con RLHF/DPO ni ampliacion de datos sobre este checkpoint: la intervencion es exclusivamente de compresion y edicion de parametros. Tampoco se detalla la composicion del dataset usado para medir los comportamientos de seguridad mas alla de los conjuntos de evaluacion citados (AdvBench, StrongREJECT y WildGuard), ni el numero de tokens empleado en cualquier fase. La semilla declarada es 42, lo que permite reproducir la celda concreta dentro de la rejilla del estudio. La innovacion tecnica destacable es precisamente el eje experimental: comparar reglas de seleccion de componentes (`gap_iter` frente a otras) y presupuestos de restauracion para medir cuanto de la seguridad perdida por la compresion es recuperable mediante edicion selectiva de parametros.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Llama-3.1-8B-Instruct, aunque degradada por la compresion y la edicion.
- Razonamiento y respuesta a instrucciones en formato chat, con la plantilla del modelo base.
- Capacidad multilingue: no declarada en la ficha; se asume la del modelo base, sin verificacion publicada para este checkpoint.
- Medicion de comportamiento de seguridad: el checkpoint esta instrumentado conceptualmente para evaluar tasa de exito de ataque (ASR) y rechazo, con valores medidos publicados.
- Edicion e intervencion de parametros: sirve para estudiar que componentes concretos afectan a la seguridad tras comprimir.
- No se documenta soporte de tool calling, function calling, uso agentico ni razonamiento multi-paso especifico para este checkpoint.
- No se documentan capacidades de vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Estudio del dano de seguridad inducido por compresion: comparar el ASR de este checkpoint (0,1400 en AdvBench, 0,1050 en StrongREJECT) con el del Llama-3.1-8B-Instruct sin comprimir y con otras celdas de la rejilla permite cuantificar cuanto degrada la seguridad la eliminacion del 50,03 % de parametros.
- Evaluacion de reglas de seleccion de componentes: la regla `gap_iter` puede compararse con otras reglas de la misma rejilla manteniendo fijo el presupuesto de restauracion del 1,000 %.
- Analisis del compromiso seguridad/utilidad: el macro de sobre-rechazo de 0,3783 medido con WildGuard cuantifica el coste en utilidad que implica restaurar seguridad, un dato relevante para decidir presupuestos de restauracion.
- Interpretabilidad de mecanismos de seguridad: al conocer exactamente los 6.109 componentes restaurados y los 34.870.272 parametros inyectados, se puede correlacionar posiciones y subespacios con cambios de comportamiento.
- Reproducibilidad experimental: la semilla 42, el presupuesto por ronda (0,100 %) y el numero de rondas (5 de 10) permiten replicar exactamente la celda y verificar resultados.
- Auditoria y red-teaming comparativo: usar el checkpoint como sujeto de pruebas con jueces automatizados (HarmBench para ASR, WildGuard para rechazo) dentro de una bateria de evaluacion de seguridad.
- Referencia negativa en pipelines de validacion: incorporarlo como caso conocido de modelo degradado en pruebas de regresion de sistemas de moderacion o de filtros de salida.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / conjunto | Modelo base sin comprimir |
|---|---|---|---|
| AdvBench ASR | 0,1400 | HarmBench judge | No disponible |
| StrongREJECT ASR | 0,1050 | HarmBench judge | No disponible |
| Macro sobre-rechazo (over-refusal) | 0,3783 | WildGuard | No disponible |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba de capacidad general para este checkpoint, ni cifras del modelo base con las que comparar directamente los valores de ASR y sobre-rechazo. Los tres valores de la tabla proceden de la seccion "Measured" de la model card del autor.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 16-17 GB solo para pesos, mas la cache KV. El repositorio pesa 16,1 GB.
- El recuento de parametros publicado (8.030.261.248) coincide practicamente con el del Llama-3.1-8B-Instruct sin comprimir y el repositorio no es mas pequeno que el de un 8B en bf16, por lo que la compresion SVD-LLM de este checkpoint no se traduce necesariamente en un ahorro de memoria en disco o VRAM si los factores se han materializado de nuevo como matrices densas.
- GPU consumer: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) en bf16 sin cuantizar; en GPUs de 16 GB requeriria cuantizacion a 8 bits (aproximadamente 8-9 GB de pesos) o a 4 bits (aproximadamente 5-6 GB).
- GPU de centro de datos: A100 40/80 GB, H100, L40S. Para un unico 8B en bf16 basta una A100 40 GB con margen amplio para lotes y contexto largo.
- Opciones de despliegue: `transformers` (libreria declarada) y `text-generation-inference`, ya que el repositorio esta marcado como `endpoints_compatible`. Para `llama.cpp`, Ollama o vLLM seria necesario convertir los safetensors al formato correspondiente (GGUF en el caso de llama.cpp y Ollama), conversion no documentada en la ficha.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r05` | 8.030.261.248 | No especificado (base: 128.000) | safetensors | Llama 3.1 Community | Checkpoint de investigacion, ronda 5 de 10, seguridad degradada segun el autor |
| `meta-llama/Llama-3.1-8B-Instruct` (modelo base) | 8.030.261.248 | 128.000 | safetensors | Llama 3.1 Community | Modelo afinado por instrucciones, uso general; ASR y sobre-rechazo de referencia no publicados en la informacion disponible |
| Otras celdas de la rejilla del mismo autor (otras reglas de seleccion y presupuestos) | No disponible | No disponible | safetensors | Llama 3.1 Community | Referenciadas en la model card como parte del mismo estudio, pero sin metricas ni identificadores proporcionados en esta busqueda |

No se dispone de datos publicados para comparar con alternativas de compresion equivalentes (por ejemplo, otros metodos de poda o cuantizacion sobre Llama-3.1-8B) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- No es un asistente de proposito general. La model card lo describe explicitamente como artefacto de investigacion y sujeto experimental.
- Varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto a Llama-3.1-8B-Instruct. La compresion por si sola eleva la tasa de exito de ataque, y este checkpoint corresponde a una ronda intermedia de restauracion (5 de 10), por lo que la reparacion puede estar incompleta.
- Valores de seguridad medidos: ASR de 0,1400 en AdvBench y 0,1050 en StrongREJECT. Son tasas de exito de ataque superiores a las deseables para un modelo en produccion.
- Sobre-rechazo elevado: 0,3783 macro con WildGuard, lo que implica que una fraccion relevante de peticiones benignas puede recibir rechazo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la compresion agresiva de proyecciones puede degradar la coherencia factual, pero no se aportan mediciones.
- Idiomas: no declarados. No hay verificacion de rendimiento multilingue para este checkpoint.
- Contexto: no especificado para el checkpoint; solo se puede asumir el del modelo base.
- Uso comercial: la licencia Llama 3.1 Community impone sus propias condiciones y obligaciones (incluida la politica de uso aceptable en `USE_POLICY.md`). Cualquier uso de este derivado esta sujeto a ellas y a la atribucion "Built with Llama".
- Reproducibilidad: el checkpoint es una ronda intermedia de una ejecucion mas larga de 10 rondas, por lo que no representa el punto final del presupuesto de restauracion del 1,000 %.
- Trazabilidad limitada: el repositorio no incluye paper, blog ni demostracion; cero descargas y cero likes en el momento de la consulta, sin validacion externa conocida.
- Antes de extraer cualquier conclusion, el autor recomienda evaluar el checkpoint de forma independiente.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r05
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- No se han encontrado en la busqueda web enlaces relevantes (paper, repositorio, blog o demo) asociados a este checkpoint ni al estudio del que forma parte.
