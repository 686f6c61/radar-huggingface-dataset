# Jeesup/svd-safety-l3_remove20_swapgapiter_b010_r02

## Resumen

`Jeesup/svd-safety-l3_remove20_swapgapiter_b010_r02` es un artefacto de investigación publicado en HuggingFace por el usuario Jeesup. Se trata de un checkpoint de `meta-llama/Meta-Llama-3-8B-Instruct` comprimido mediante SVD-LLM hasta el 80,0 % de los parámetros densos de proyección y, después, editado parcialmente mediante un procedimiento de *swap* iterativo neutro en parámetros guiado por la regla de selección `gap_iter`. El checkpoint corresponde a la ronda 2 de un total de 10, con un presupuesto de restauración de 1,000 % de los parámetros densos y un 0,100 % aplicado por ronda.

El problema que aborda no es el de ofrecer un asistente conversacional, sino el de medir de forma controlada cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. La model card lo describe explícitamente como «una celda de una rejilla sobre reglas de selección y presupuestos» y advierte de que varias ramas de esa rejilla están deliberadamente degradadas en seguridad respecto al modelo original.

Por su naturaleza, es relevante para investigadores en compresión de modelos, interpretabilidad y alineación, no para despliegue en producción. El autor indica que debe tratarse como sujeto experimental y no como asistente desplegable. El repositorio no incluye información sobre idiomas soportados, recetas de cuantización ni resultados de benchmarks generales (MMLU, HumanEval, GSM8K); solo publica métricas de seguridad y sobre-rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Llama-3-8B-Instruct) con pesos de proyección comprimidos por SVD-LLM y edición posterior por *swap* iterativo |
| Parametros totales | 8.030.261.248 (dato de safetensors); la model card declara una fraccion resultante de 0,7998 sobre los parametros densos de proyeccion |
| Longitud de contexto | No especificada en la model card; heredada del modelo base Llama-3-8B-Instruct, 8.192 tokens (no confirmado en el repositorio) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors sin recetas de cuantizacion |
| Idiomas soportados | No disponible en la model card; el modelo base esta entrenado principalmente en ingles y soporta oficialmente 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | Llama 3 (Meta Llama 3 Community License); se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio |
| Formato de pesos | safetensors (libreria transformers) |
| Fraccion de parametros resultante | 0,7998 (80,0 %) |
| Parametros eliminados por compresion | 20,02 % de los parametros densos de proyeccion |
| Parametros intercambiados | 13.948.928 (0,20 % de los parametros densos de proyeccion) |
| Componentes restaurados / retirados | 2322 / 2322 |
| Regla de seleccion | `gap_iter` |
| Valor del *swap* | `insert` (solo valor de insercion; desalojo ordenado por sigma) |
| Rondas iterativas aplicadas | 2 de 10 |
| Chunk por ronda | 0,100 % de los parametros densos |
| Semilla | 42 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3-8B-Instruct: un transformer denso con atención causal, normalización RMSNorm, activación SwiGLU y codificación posicional RoPE, con 8.030.261.248 parámetros. Sobre ese checkpoint se aplica SVD-LLM, un método de compresión que descompone las matrices de peso y trunca sus valores singulares, eliminando el 20,02 % de los parámetros densos de proyección. El resultado es una fracción de parámetros de 0,7998.

Sobre el modelo comprimido se aplica después una edición iterativa denominada en la model card «parameter-neutral swap», con la regla de selección `gap_iter`. En cada ronda se seleccionan componentes y se restauran desde el checkpoint denso hasta un presupuesto del 0,100 % de los parámetros densos, con un presupuesto total de la ejecución completa del 1,000 %. Este checkpoint concreto aplica 2 de las 10 rondas previstas, restaurando 2322 componentes y retirando otros 2322, con 13.948.928 parámetros intercambiados (0,20 % de los parámetros densos de proyección). El valor de intercambio es `insert`, es decir, solo el valor de inserción, con desalojo ordenado por sigma. La semilla utilizada es 42.

No se documenta en el repositorio el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO adicionales. Tampoco se describen innovaciones de decodificación (decodificación especulativa, atención lineal u otras).

## Capacidades

- Generación de texto conversacional heredada de Llama-3-8B-Instruct, sujeta a la degradación inducida por la compresión al 80 % de los parámetros densos.
- Comportamiento de seguridad parcialmente reparado: el checkpoint es una ronda intermedia de un proceso de restauración, no el resultado final.
- Métricas de seguridad medibles y reproducibles: AdvBench ASR 0,0100, StrongREJECT ASR 0,0400 y sobre-rechazo macro 0,1950 con jueces HarmBench y WildGuard.
- Función como sujeto experimental para estudiar el compromiso entre seguridad y utilidad bajo compresión SVD.
- Capacidades del modelo base (tool calling, razonamiento multi-paso, código) potencialmente presentes pero no verificadas ni documentadas en este repositorio.
- No se documentan capacidades de visión, audio, ni modos de pensamiento explícito.
- No se documenta soporte multilingüe específico para este checkpoint.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como celda de control para medir cuánta capacidad y cuánta seguridad se pierde al truncar el 20 % de los parámetros densos de proyección mediante SVD-LLM, comparando contra el checkpoint denso original.
- Estudio de reparación de seguridad post-compresión: al ser la ronda 2 de 10, permite trazar la curva de recuperación de seguridad a lo largo de las rondas y determinar si el presupuesto del 1,000 % es suficiente.
- Comparación de reglas de selección de componentes: la regla `gap_iter` puede contrastarse con otras celdas de la rejilla del mismo autor para determinar qué criterio repara mejor el daño en seguridad.
- Red-teaming comparativo: con ASR de 0,0100 en AdvBench y 0,0400 en StrongREJECT medidos con juez HarmBench, resulta útil como punto de referencia cuantitativo frente a versiones comprimidas sin reparación.
- Análisis de sobre-rechazo: la métrica de sobre-rechazo macro de 0,1950 con WildGuard permite estudiar el coste en utilidad que impone la restauración de seguridad, un eje habitualmente ignorado.
- Interpretabilidad mecánica: los 2322 componentes restaurados y los 2322 retirados, con 13.948.928 parámetros intercambiados, ofrecen un conjunto acotado de direcciones sobre las que estudiar qué subespacios de pesos codifican el comportamiento de rechazo.
- Reproducibilidad metodológica: con semilla 42 y un presupuesto por ronda documentado, otros grupos pueden replicar el procedimiento y verificar la estabilidad de las métricas publicadas.
- Auditoría de artefactos derivados: útil para instituciones que necesiten evaluar cómo se comportan checkpoints derivados de Llama 3 bajo la cláusula de atribución «Built with Meta Llama 3».

## Benchmarks y rendimiento

| Metrica | Valor | Juez / herramienta |
|---|---|---|
| AdvBench ASR | 0,0100 | HarmBench judge |
| StrongREJECT ASR | 0,0400 | HarmBench judge |
| Sobre-rechazo macro | 0,1950 | WildGuard |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K, MT-Bench u otros) en la informacion disponible. La model card solo reporta métricas de seguridad y sobre-rechazo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 16 GB de pesos, más KV cache y activaciones; en la práctica se recomienda un mínimo de 20-24 GB de VRAM.
- VRAM estimada en int8: alrededor de 8-9 GB de pesos, más overhead.
- VRAM estimada en int4: alrededor de 4-6 GB de pesos, más overhead.
- GPU profesionales: A100 40 GB, H100 80 GB, L40S, A6000 o cualquier GPU con 24 GB o más permite ejecutar el modelo sin cuantizar.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) en fp16 ajustadamente y con comodidad en cuantizaciones de 8 y 4 bits; en tarjetas de 12-16 GB requeriría cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` presente), endpoints compatibles con HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`) y vLLM para servir pesos safetensors. No se publican pesos GGUF, por lo que llama.cpp y Ollama requerirían una conversión no verificada y potencialmente incompatible con la estructura de pesos comprimidos por SVD.
- Latencia y throughput estimados: no disponibles. El repositorio no publica mediciones de latencia, tokens por segundo ni resultados de optimización (batching, paged attention).
- Almacenamiento: el repositorio ocupa 16,1 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| svd-safety-l3_remove20_swapgapiter_b010_r02 | 8.030.261.248 (fraccion resultante 0,7998 declarada) | No especificado (base: 8.192 tokens) | Llama 3 Community License | HuggingFace, safetensors | Artefacto de investigacion; ASR 0,0100 en AdvBench y 0,0400 en StrongREJECT |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030.261.248 | 8.192 tokens | Llama 3 Community License | HuggingFace, safetensors | Modelo base sin comprimir; punto de referencia de seguridad y utilidad |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 8.030.000.000 (aproximado) | 128.000 tokens | Llama 3.1 Community License | HuggingFace, safetensors | Generacion posterior con contexto extendido; no comparable en el eje de compresion |
| Otros checkpoints de la rejilla del mismo autor | No disponible | No disponible | Llama 3 Community License | HuggingFace | No se han localizado en la informacion disponible |

Los resultados de busqueda web proporcionados no contienen informacion util sobre modelos comparables ni sobre el metodo SVD-LLM, por lo que no es posible ampliar esta comparativa con datos verificados.

## Limitaciones y advertencias

- No es un modelo de proposito general: la model card indica explicitamente que es un artefacto de investigacion y que no debe tratarse como un asistente desplegable.
- Seguridad degradada por diseno en varias configuraciones: la propia compresion eleva la tasa de exito de ataques, y el objetivo del estudio es cuantificarlo; este checkpoint es una ronda intermedia (2 de 10) y no representa el resultado final del procedimiento.
- Riesgo de alucinacion: no evaluado en el repositorio; la compresion por truncado de valores singulares puede alterar el comportamiento del modelo de forma no caracterizada fuera del eje de seguridad.
- Sesgos: no documentados. Al derivar de Llama-3-8B-Instruct, hereda los sesgos del modelo base, no auditados en este repositorio.
- Limitaciones de contexto e idioma: la model card no especifica la longitud de contexto efectiva tras la compresion ni los idiomas soportados; la informacion disponible solo permite inferir 8.192 tokens y el perfil multilingue del modelo base.
- Restricciones de licencia: se aplica la Meta Llama 3 Community License, con obligaciones de atribucion («Built with Meta Llama 3») y condiciones de uso recogidas en `LICENSE` y `USE_POLICY.md`. Cualquier uso comercial esta sujeto a dichos terminos, incluida la clausula de escala de usuarios activos mensuales de la licencia de Meta.
- Ausencia de cuantizaciones oficiales: no hay pesos GGUF, AWQ ni GPTQ publicados, lo que limita el despliegue en entornos de bajos recursos sin trabajo adicional de conversion.
- Sin datos de rendimiento general: no se puede estimar la perdida de calidad en tareas de razonamiento, codigo o matematicas a partir de la informacion disponible.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion independiente por parte de terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove20_swapgapiter_b010_r02
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia de Meta Llama 3: incluida como `LICENSE` y `USE_POLICY.md` en el repositorio del modelo
- Resultados de busqueda web: no se han encontrado papers, blogs, repositorios ni demos relevantes en la informacion proporcionada (los resultados devueltos corresponden a paginas genericas de Wikipedia y no guardan relacion con el modelo)
