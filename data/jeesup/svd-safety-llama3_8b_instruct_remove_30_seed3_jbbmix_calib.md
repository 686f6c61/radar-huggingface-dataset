# Jeesup/svd-safety-llama3_8b_instruct_remove_30_seed3_jbbmix_calib

## Resumen

`Jeesup/svd-safety-llama3_8b_instruct_remove_30_seed3_jbbmix_calib` es un checkpoint derivado de `meta-llama/Meta-Llama-3-8B-Instruct` al que se le ha aplicado una compresión SVD-LLM eliminando el 30 % de los parámetros densos y sin restaurar ningún componente singular (presupuesto de restauración del 0,000 %, 0 componentes restaurados). El autor lo publica como artefacto de investigación dentro de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor. No es un modelo de chat de propósito general ni un asistente desplegable.

Se trata de una única celda de una rejilla de experimentos que cruza reglas de selección y presupuestos de restauración; en la model card la regla de selección figura como `unknown`. El interés actual del checkpoint es metodológico: cuantifica el coste en seguridad (ASR en AdvBench y StrongREJECT), el coste en utilidad (perplejidad en WikiText-2) y el exceso de rechazo sobre peticiones benignas (over-refusal medido con WildGuard) de una compresión agresiva, sirviendo como sujeto experimental y como línea base para técnicas de reparación de seguridad post-compresión.

La arquitectura subyacente es la de Llama 3 8B Instruct (transformer decoder-only), con licencia Meta Llama 3 Community. El repositorio ocupa 16,1 GB y contiene pesos en safetensors; no se publican variantes cuantizadas ni formatos GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido mediante SVD-LLM (descomposición en valores singulares con truncamiento) |
| Parametros totales | 8.030.261.248 segun metadatos de safetensors; la model card declara una fraccion de parametros resultante de 0,6999 (69,99 % del denso) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No especificada en la model card; heredada del modelo base Meta-Llama-3-8B-Instruct (8.192 tokens) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors; no se publican variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | No disponible en la model card; el modelo base esta entrenado mayoritariamente en ingles con soporte declarado para un conjunto limitado de idiomas |
| Licencia | llama3 (Meta Llama 3 Community License); incluye `LICENSE` y `USE_POLICY.md` en el repositorio |
| Formato de pesos | safetensors (libreria transformers, pipeline text-generation) |

## Arquitectura y entrenamiento

El punto de partida es Meta-Llama-3-8B-Instruct, un transformer decoder-only de 8.030 millones de parametros con normalizacion RMSNorm, activacion SwiGLU, RoPE y atencion por grupos (GQA). Sobre ese checkpoint no se realiza un reentrenamiento: se aplica SVD-LLM, una tecnica de compresion que descompone matrices de pesos en factores singulares y trunca los componentes de menor energia, eliminando en este caso el 30,00 % de los parametros. Adicionalmente, el experimento contempla la restauracion selectiva de componentes singulares ya truncados; en esta celda el presupuesto de restauracion es del 0,000 %, con 0 componentes restaurados y 0 componentes sustituidos.

No hay datos en la informacion disponible sobre el dataset de calibracion (el sufijo `jbbmix_calib` del nombre sugiere una mezcla de calibracion, pero la model card no la describe), ni sobre tokens de entrenamiento, RLHF o DPO posteriores. La unica innovacion tecnica documentada es el propio pipeline de compresion y reparacion por SVD y la metodologia de evaluacion de seguridad, no una mejora de arquitectura. Nota de rigor: la model card indica `seed = 42` en la tabla de procedencia, mientras que el nombre del repositorio contiene `seed3`; la discrepancia no se resuelve en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional: hereda las capacidades del Llama-3-8B-Instruct sin comprimir, aunque ninguna de ellas ha sido reevaluada ni certificada tras la compresion.
- Razonamiento y conocimiento general: presumiblemente conserva parte del rendimiento del modelo base en tareas de conocimiento, con degradacion medible en fluidez (perplejidad de 16,9001 en WikiText-2).
- Generacion de codigo y matematicas: capacidades del modelo base, no verificadas en este checkpoint.
- Tool calling / function calling: el modelo base admite un formato de invocacion de herramientas por prompt; no hay evidencia en la informacion disponible de que esta capacidad sobreviva a la compresion.
- Multilingue: no documentado para este checkpoint.
- Capacidades especiales: ninguna propia. `thinking mode`, vision y audio no estan soportados.
- Capacidad analitica destacada: servir como sujeto de medida del efecto de la compresion SVD sobre la alineacion de seguridad (ASR, over-refusal) y sobre la calidad del lenguaje (perplejidad).

## Casos de uso

- Investigacion en compresion de modelos: usar este checkpoint como celda de control en estudios que comparen reglas de seleccion de componentes SVD o presupuestos de restauracion, midiendo el delta de perplejidad frente a otras configuraciones del grid.
- Evaluacion de seguridad post-compresion: reproducir las metricas de ASR con AdvBench y StrongREJECT y un juez HarmBench para cuantificar cuanto degrada la compresion la resistencia a jailbreaks respecto al modelo denso.
- Auditoria de over-refusal: emplear el 0,1676 de macro over-refusal sobre WildGuard como referencia para estudiar el equilibrio entre seguridad y utilidad en modelos comprimidos.
- Red-teaming metodologico: usar el checkpoint como objetivo deliberadamente degradado para validar pipelines de evaluacion adversarial y clasificadores de contenido antes de aplicarlos a modelos en produccion.
- Experimentos de interpretabilidad: analizar que componentes singulares eliminados correlacionan con la perdida de comportamiento de rechazo, aprovechando que la rejilla incluye variantes con distintos presupuestos de restauracion.
- Baseline de perplejidad: servir como referencia de WikiText-2 (16,9001) en comparaciones con otras tecnicas de compresion (cuantizacion, poda estructurada) aplicadas al mismo modelo base.
- Docencia y divulgacion tecnica: ilustrar con un caso real el compromiso seguridad-utilidad en modelos comprimidos, siempre etiquetando el checkpoint como no desplegable.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,0615 |
| StrongREJECT | ASR (juez HarmBench) | 0,0895 |
| WildGuard | Macro over-refusal | 0,1676 |
| WikiText-2 | Perplejidad | 16,9001 |

No se han publicado en la informacion disponible los valores equivalentes del modelo base sin comprimir ni de otras celdas del grid, por lo que no es posible calcular el delta exacto de degradacion. La model card afirma cualitativamente que la compresion por si sola eleva la tasa de exito de ataques respecto a Llama-3-8B-Instruct.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 16 GB solo para pesos, mas activaciones y cache KV; se recomienda un minimo de 20-24 GB para contexto moderado.
- VRAM estimada en int8: alrededor de 8-9 GB de pesos.
- VRAM estimada en int4: alrededor de 4,5-5,5 GB de pesos, aunque no se publican pesos ya cuantizados.
- GPU de centro de datos: A100 40/80 GB, H100, L40S y similares, holgadas en fp16.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y RTX 4080 de 24 GB en fp16; en tarjetas de 16 GB requeriria cuantizacion a 8 bits o inferior.
- Opciones de despliegue: transformers y TGI (los tags incluyen `text-generation-inference` y `endpoints_compatible`); vLLM seria compatible al usar la arquitectura estandar de Llama 3. No hay pesos GGUF, por lo que llama.cpp u Ollama exigirian conversion manual.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este checkpoint (`svd-safety-llama3_8b_instruct_remove_30_seed3_jbbmix_calib`) | 8,03 B en metadatos; fraccion densa declarada 0,6999 | No especificado (heredado 8.192) | Llama 3 Community | safetensors | Artefacto de investigacion, seguridad degradada de forma deliberada en varias celdas del grid |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 | Llama 3 Community | safetensors | Modelo base, sin comprimir, apto para uso general |
| Otras celdas del grid del mismo autor (distintas reglas de seleccion y presupuestos de restauracion) | No disponible | No disponible | Llama 3 Community | safetensors | No se aporta el listado completo ni sus metricas |

No se dispone de resultados de benchmarks comparativos entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Artefacto de investigacion, no un asistente desplegable: la propia model card desaconseja tratarlo como modelo de produccion.
- Seguridad degradada de forma intencionada en varias celdas de la rejilla; la compresion incrementa la tasa de exito de ataques respecto al modelo sin comprimir.
- Over-refusal medido de 0,1676, lo que implica rechazos sobre peticiones benignas ademas de la perdida de robustez frente a ataques.
- Perplejidad de 16,9001 en WikiText-2, indicativa de una degradacion notable de la fluidez respecto al modelo denso.
- Riesgo de alucinacion: inherente al modelo base y presumiblemente agravado por la compresion; no hay evaluacion especifica de factualidad en este checkpoint.
- Discrepancia de procedencia no resuelta: el nombre indica `seed3` mientras la tabla de procedencia declara `seed = 42`.
- Regla de seleccion de componentes documentada como `unknown`, lo que dificulta la reproducibilidad exacta del checkpoint.
- Restricciones de licencia: Meta Llama 3 Community License, con obligaciones de atribucion ("Built with Meta Llama 3"), requisito de licencia separada para despliegues por encima de 700 millones de usuarios mensuales y clausulas de uso aceptable recogidas en `USE_POLICY.md`.
- Ausencia de pesos cuantizados y de variantes GGUF, lo que limita el despliegue en hardware de gama baja sin conversion previa.
- Cualquier conclusion extraida de este checkpoint debe validarse contra el modelo base y contra otras celdas del grid antes de generalizarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-llama3_8b_instruct_remove_30_seed3_jbbmix_calib
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Meta Llama 3: https://llama.meta.com/llama3/license
- Politica de uso aceptable de Meta Llama 3: https://llama.meta.com/llama3/use-policy
- Repositorio de Llama 3 en GitHub: https://github.com/meta-llama/llama3
- Paper de SVD-LLM (tecnica de compresion referenciada por el nombre del checkpoint): no se proporciona enlace en la informacion disponible; la busqueda web no devolvio resultados relevantes.
