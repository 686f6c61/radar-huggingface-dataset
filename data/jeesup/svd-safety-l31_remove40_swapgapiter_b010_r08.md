# Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r08

## Resumen

`Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r08` es un checkpoint de investigación derivado de `meta-llama/Llama-3.1-8B-Instruct`, comprimido con SVD-LLM hasta el 60,0 % de sus parámetros densos (se elimina el 40,02 % de los parámetros) y posteriormente editado mediante 8 de las 10 rondas de un procedimiento iterativo de intercambio de componentes. La regla de selección empleada es `gap_iter` y el presupuesto de restauración es del 1,000 % de los parámetros densos, aplicado en fragmentos de 0,100 % por ronda. Con 8.030.261.248 parámetros totales, no es un modelo de mezcla de expertos (MoE), sino un transformer denso con parte de su espacio de parámetros colapsado por descomposición en valores singulares.

El propósito declarado del autor no es ofrecer un asistente desplegable, sino medir el daño que la compresión SVD provoca sobre el comportamiento de seguridad del modelo original y evaluar qué regla de selección de componentes lo repara mejor. Cada checkpoint de la rejilla experimental es una celda de un estudio sobre reglas de selección y presupuestos; esta en concreto es una ronda intermedia de una ejecución más larga. La model card advierte explícitamente que varias ramas de la rejilla están degradadas de forma deliberada en seguridad y que cualquier celda debe tratarse como sujeto experimental, no como asistente listo para producción.

Su relevancia actual es metodológica: cuantifica el compromiso entre compresión, utilidad y alineación de seguridad en un modelo abierto de 8B, un problema central cuando se intenta reducir el coste de inferencia sin destruir las salvaguardas del modelo. El checkpoint se publica con licencia Llama 3.1 Community License y en formato safetensors, sin métricas de capacidades generales publicadas más allá de las tres tasas de seguridad recogidas en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), comprimido con SVD-LLM |
| Parametros totales | 8.030.261.248 (8,03 B); fracción de parámetros densos resultante: 0,5998 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; hereda la configuración del modelo base, no documentada aquí |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (el campo de idiomas del repositorio figura como no disponible) |
| Licencia | Llama 3.1 Community License (`LICENSE` y `USE_POLICY.md` incluidos en el repositorio) |
| Formato de pesos | safetensors (tamaño de repositorio: 16,1 GB) |

Metadatos adicionales del proceso de compresión y edición:

| Campo | Valor |
|---|---|
| Modelo base | `meta-llama/Llama-3.1-8B-Instruct` |
| Compresión | SVD-LLM, 40,02 % de parámetros eliminados |
| Regla de selección | `gap_iter` |
| Presupuesto de restauración | 1,000 % de los parámetros densos |
| Componentes restaurados | 9.007 |
| Componentes sustituidos | 9.007 |
| Rondas iterativas aplicadas | 8 de 10 |
| Fragmento por ronda | 0,100 % de los parámetros densos |
| Parámetros intercambiados (entrantes) | 55.803.904 (0,80 % de los parámetros de proyección densos) |
| Valor de intercambio | `insert` (solo valor de inserción; desalojo ordenado por sigma) |
| Semilla | 42 |
| Tipo de checkpoint | Ronda intermedia de una ejecución más larga |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama-3.1-8B-Instruct: un transformer decoder-only denso con normalización RMSNorm y atención multi-cabeza con RoPE, en su variante ajustada por instrucciones. Sobre ese punto de partida se aplica SVD-LLM, una técnica de compresión post-entrenamiento basada en descomposición en valores singulares que elimina el 40,02 % de los parámetros, dejando el checkpoint al 0,5998 de la fracción densa original. No se realiza un reentrenamiento completo posterior a la compresión: la recuperación se lleva a cabo mediante edición selectiva de componentes.

El segundo estadio es un procedimiento iterativo de intercambio neutro en parámetros («parameter-neutral swap»), gobernado por la regla `gap_iter`. En cada una de las 10 rondas previstas se sustituye hasta un 0,100 % de los parámetros densos, con un presupuesto total del 1,000 %. En esta celda se han aplicado 8 rondas, restaurando y sustituyendo 9.007 componentes cada vez y reinsertando 55.803.904 parámetros (el 0,80 % de los parámetros de proyección densos). El valor de intercambio es `insert`, esto es, se emplea únicamente el valor de inserción con desalojo ordenado por sigma, bajo semilla 42. El checkpoint corresponde a una ronda intermedia de una ejecución mayor, por lo que el presupuesto completo del 1,0 % no está agotado. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases adicionales de RLHF o DPO.

## Capacidades

- Generación de texto conversacional: conserva la interfaz de `text-generation` y la plantilla conversacional del modelo base Llama-3.1-8B-Instruct, aunque con capacidades degradadas por la compresión.
- Razonamiento y conocimiento general: heredados del modelo base de 8B, sin métricas publicadas que confirmen su magnitud tras la compresión.
- Comportamiento de seguridad medible: es el eje del artefacto; el checkpoint está diseñado para ser evaluado con jueces de seguridad (HarmBench, WildGuard) y comparar tasas de éxito de ataque y de sobrerrechazo.
- Sujeto de experimentación en interpretabilidad: permite estudiar qué componentes concretos sostienen el comportamiento de rechazo y cómo se recuperan mediante intercambios selectivos.
- No hay evidencia documentada de soporte de tool calling, function calling, uso agéntico, capacidades multimodales (visión o audio), modo de razonamiento explícito ni cobertura multilingüe verificada en este checkpoint.
- Advertencia del autor: la model card indica explícitamente que el modelo «no es un modelo de chat de propósito general» y que debe tratarse como sujeto experimental.

## Casos de uso

- Estudio de compromiso seguridad-utilidad bajo compresión: emplear este checkpoint como celda de una rejilla experimental para cuantificar cuánto sube la tasa de éxito de ataque al eliminar el 40,02 % de los parámetros y cuánto la recupera el intercambio iterativo.
- Evaluación de reglas de selección de componentes: comparar la regla `gap_iter` frente a otras reglas de la misma rejilla, con el mismo presupuesto del 1,000 % y la misma semilla 42, para aislar el efecto de la heurística de selección.
- Investigación en interpretabilidad de mecanismos de rechazo: usar los 9.007 componentes restaurados como conjunto candidato para localizar las direcciones que sostienen el comportamiento de negativa a peticiones dañinas.
- Auditoría de pipelines de compresión: servir como caso de prueba de que una compresión aparentemente neutra en parámetros no lo es en alineación, útil para equipos que aplican SVD, poda o cuantización a modelos alineados.
- Reproducción académica de resultados de seguridad: replicar las métricas de AdvBench ASR, StrongREJECT ASR y sobrerrechazo macro con el mismo juez (HarmBench y WildGuard) y comprobar la reproducibilidad de la semilla.
- Análisis de degradación conversacional: medir de forma controlada la pérdida de calidad de respuesta multi-turno frente al modelo base sin comprimir, para acotar el coste real de la compresión al 60 %.
- No se recomienda su uso como asistente de atención al cliente, generación de código en producción ni ningún escenario de cara al público, dado que la propia model card lo desaconseja y no publica evaluaciones de utilidad general.

## Benchmarks y rendimiento

| Metrica | Valor | Juez |
|---|---|---|
| AdvBench ASR | 0,2700 | HarmBench judge |
| StrongREJECT ASR | 0,2750 | HarmBench judge |
| Sobrerrechazo macro | 0,1006 | WildGuard |

ASR = attack success rate (tasa de éxito de ataque); cuanto menor, mejor comportamiento de seguridad. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba de capacidades generales, ni cifras del modelo base sin comprimir que permitan calcular la degradación relativa dentro de esta misma ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: alrededor de 16 GB solo para pesos (el repositorio ocupa 16,1 GB), más caché KV y activaciones; en la práctica, entre 18 y 22 GB según longitud de contexto y tamaño de lote.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB de pesos. En 4 bits: en torno a 4,5-5,5 GB. Estas cuantizaciones no están publicadas por el autor y habría que generarlas.
- GPU profesionales: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB; cualquiera de ellas ejecuta el checkpoint en bf16 con holgura para lotes grandes.
- GPU de consumo: cabe en bf16 en RTX 3090, RTX 4090, RTX 5090 y demás tarjetas con 24 GB o más, con margen limitado. En tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) sería necesario cuantizar a 8 bits o 4 bits.
- Opciones de despliegue: transformers (librería declarada), Text Generation Inference (el repositorio está marcado como compatible con endpoints y con TGI), vLLM. llama.cpp y Ollama requerirían una conversión propia a GGUF, ya que no se publican pesos GGUF.
- Latencia y throughput: no disponibles. No se documentan mediciones de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r08` | 8,03 B (0,5998 de la fracción densa) | No disponible | AdvBench ASR 0,2700; StrongREJECT ASR 0,2750; sobrerrechazo 0,1006 | Llama 3.1 Community License | HuggingFace, safetensors |
| `meta-llama/Llama-3.1-8B-Instruct` (modelo base) | 8,03 B | No disponible en esta ficha | No disponible en la información proporcionada | Llama 3.1 Community License | HuggingFace, safetensors |
| Otras celdas de la rejilla del mismo autor | No disponible | No disponible | No disponible | Llama 3.1 Community License | No verificado en la información disponible |

No se dispone de datos de benchmarks comparables de terceros (por ejemplo, otros checkpoints comprimidos con SVD-LLM o modelos densos de 7-9B) dentro de la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento más allá de la del modelo base.

## Limitaciones y advertencias

- Artefacto de investigación, no desplegable: la model card indica de forma explícita que este checkpoint no es un modelo de chat de propósito general y que debe tratarse como sujeto experimental.
- Seguridad degradada por diseño en varias ramas: la compresión por sí sola eleva la tasa de éxito de ataque y el estudio existe precisamente para cuantificarlo; una celda concreta puede ser menos segura que el modelo base.
- Tasa de éxito de ataque elevada: AdvBench ASR de 0,2700 y StrongREJECT ASR de 0,2750 implican que aproximadamente una de cada cuatro peticiones dañinas de esos conjuntos logra respuesta conforme.
- Sobrerrechazo no despreciable: 0,1006 de sobrerrechazo macro según WildGuard, es decir, rechazos indebidos en peticiones benignas.
- Riesgo de alucinación: no cuantificado en la información disponible; cabe esperar un incremento respecto al modelo base al haber eliminado el 40,02 % de los parámetros, pero no hay medición publicada.
- Idiomas: no disponibles; no se documenta cobertura multilingüe ni calidad por idioma en este checkpoint.
- Contexto: no disponible; la model card no confirma la ventana de contexto efectiva tras la compresión, aunque la configuración se herede del modelo base.
- Licencia: Llama 3.1 Community License, con `LICENSE` y `USE_POLICY.md` vinculantes e incluidos en el repositorio. Cualquier uso comercial queda sujeto a esa licencia y a la política de uso aceptable de Meta.
- Advertencia de validación: el autor recomienda evaluar el checkpoint por cuenta propia antes de extraer conclusiones, dado que cada celda de la rejilla puede comportarse de forma distinta.
- Datos incompletos: no se publican tokens de entrenamiento, composición del dataset, ni fases de RLHF/DPO adicionales para este derivado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove40_swapgapiter_b010_r08
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1 Community License y política de uso: incluidas como `LICENSE` y `USE_POLICY.md` en el repositorio del modelo.
- Paper, blog, repositorio o demo del método SVD-LLM o del estudio de intercambio iterativo: no disponible en la información proporcionada.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos corresponden a un hotel en Seattle y no guardan relación con el artefacto).
