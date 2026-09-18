# Jeesup/svd-safety-l2_swift_jbbbencal2_remove40

## Resumen

`Jeesup/svd-safety-l2_swift_jbbbencal2_remove40` es un checkpoint de investigacion derivado de `meta-llama/Llama-2-7b-chat-hf`, comprimido con la tecnica SVD-LLM hasta eliminar el 40,00 % de los parametros densos (fraccion de parametros resultante declarada: 0,5998). Lo publica el usuario Jeesup como parte de un estudio sobre como la compresion basada en descomposicion en valores singulares (SVD) degrada el comportamiento de seguridad del modelo y que regla de seleccion de componentes lo repara mejor. Este checkpoint concreto corresponde a una celda del grid con regla de seleccion `unknown` y un presupuesto de restauracion del 0,000 % (cero componentes restaurados, cero componentes sustituidos), con semilla 42.

El interes del artefacto no es su utilidad como asistente, sino que actua como sujeto experimental medible: la model card publica cuatro metricas de seguridad y calidad (ASR en AdvBench, ASR en StrongREJECT, sobre-rechazo macro medido con WildGuard y perplejidad en WikiText-2), lo que permite cuantificar el coste en seguridad de comprimir un modelo alineado. Es relevante ahora porque conecta dos lineas activas: la compresion agresiva de LLM para reducir coste de inferencia y la evaluacion de seguridad post-entrenamiento, un area donde escasean artefactos con metricas de seguridad publicadas.

Se trata, en palabras del propio autor, de un artefacto de investigacion y no de un modelo conversacional de proposito general. El repositorio no tiene descargas ni likes, y varios brazos del grid estan deliberadamente degradados en seguridad respecto a Llama-2-7b-chat, por lo que no debe desplegarse sin evaluacion previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Llama-2, heredada del modelo base); transformada mediante SVD-LLM |
| Parametros totales | 6.738.415.616 segun los metadatos de safetensors (coincide con el recuento denso de Llama-2-7B); la model card declara una fraccion de parametros resultante de 0,5998 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no declarada en la model card de este checkpoint; 4096 tokens en el modelo base Llama-2-7b-chat |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el modelo base esta entrenado mayoritariamente en ingles) |
| Licencia | Llama 2 Community License (`license: llama2`); se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio |
| Formato de pesos | safetensors (repo de 13,5 GB) |
| Tamano del repositorio | 13,5 GB |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Metodo de compresion | SVD-LLM, 40,00 % de parametros eliminados |
| Regla de seleccion de componentes | `unknown` |
| Presupuesto de restauracion | 0,000 % de parametros densos (0 componentes restaurados, 0 sustituidos) |
| Semilla | 42 |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El checkpoint parte de `meta-llama/Llama-2-7b-chat-hf`, un transformer decoder-only con atencion causal. Sobre ese modelo se aplica SVD-LLM, un esquema de compresion que descompone matrices de pesos en sus valores singulares y trunca los componentes de menor rango, eliminando en este caso el 40,00 % de los parametros densos. Despues de la compresion, el pipeline del estudio permite restaurar un subconjunto de componentes SVD segun una regla de seleccion y un presupuesto de parametros; en esta celda la regla es `unknown` y el presupuesto es 0,000 %, es decir, no se restauro ningun componente.

No se dispone de informacion sobre el numero de tokens de reentrenamiento, la composicion del dataset utilizado durante la compresion ni si hubo una fase adicional de ajuste con RLHF o DPO especifica para este checkpoint. La alineacion del modelo procede, en la medida en que se conserve, del entrenamiento original de Llama-2-7b-chat (supervised fine-tuning mas RLHF), pero la model card no cuantifica cuanto de ese comportamiento sobrevive a la compresion. La innovacion tecnica del artefacto es metodologica: forma parte de un grid que barre reglas de seleccion de componentes y presupuestos de restauracion con el objetivo de medir y potencialmente reparar el dano en seguridad causado por el truncado SVD.

## Capacidades

- Generacion de texto conversacional: hereda la interfaz de chat de Llama-2-7b-chat, aunque con capacidad degradada por la compresion.
- Razonamiento y conocimiento general: no evaluados en la model card; no hay datos de MMLU, GSM8K ni HumanEval para este checkpoint.
- Seguridad alineada medible: es la capacidad central del artefacto, cuantificada mediante tasas de exito de ataque (ASR) en AdvBench y StrongREJECT.
- Tendencia al rechazo: la model card reporta una metrica de sobre-rechazo macro (0,3425) obtenida con WildGuard, lo que indica que el modelo rechaza peticiones benignas con cierta frecuencia.
- Tool calling / function calling: no disponible; la model card no lo menciona y no se ha validado en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Inferencia compatible con text-generation-inference segun las etiquetas del repositorio.

## Casos de uso

- Investigacion sobre compresion de LLM: usar este checkpoint como punto de medida del dano de seguridad inducido por truncado SVD al 60 % de parametros, comparando sus ASR con los del modelo denso y con otras celdas del grid.
- Auditoria de seguridad post-compresion: reproducir las metricas declaradas (AdvBench 0,0365, StrongREJECT 0,0607, sobre-rechazo 0,3425) con el mismo juez (HarmBench judge) para validar la metodologia del estudio.
- Evaluacion de reglas de seleccion de componentes SVD: al ser una celda con regla `unknown` y presupuesto 0,000 %, sirve como linea base frente a celdas con restauracion efectiva de componentes.
- Analisis de equilibrio seguridad-utilidad: la combinacion de ASR bajo y sobre-rechazo alto (0,3425) permite estudiar el compromiso entre resistir ataques y no rechazar peticiones legitimas.
- Estudios de interpretabilidad: los artefactos etiquetados como `interpretability` permiten inspeccionar que subespacios de pesos concentran el comportamiento de rechazo.
- Benchmarking de perplexity tras compresion: la perplejidad de 11,1585 en WikiText-2 sirve de referencia para medir la perdida de modelado de lenguaje frente al modelo denso.
- Docencia y metodologia reproducible: ejemplo de ficha de artefacto con procedencia, semilla y metricas explicitas para cursos de evaluacion de modelos.

## Benchmarks y rendimiento

| Metrica | Valor reportado | Herramienta de evaluacion |
|---|---|---|
| AdvBench ASR | 0,0365 | HarmBench judge |
| StrongREJECT ASR | 0,0607 | HarmBench judge |
| Sobre-rechazo macro | 0,3425 | WildGuard |
| Perplejidad WikiText-2 | 11,1585 | no especificada |

No se han publicado resultados de benchmarks de conocimiento, razonamiento ni codigo (MMLU, GSM8K, HumanEval u otros) en la informacion disponible. No se ofrecen cifras comparativas con el modelo denso dentro de la model card, por lo que la magnitud exacta del dano respecto a `meta-llama/Llama-2-7b-chat-hf` no puede determinarse solo con estos datos.

## Requisitos de hardware

- VRAM estimada en fp16: en torno a 13-14 GB para pesos, mas memoria para el contexto y el cache KV; el repositorio ocupa 13,5 GB, consistente con pesos en fp16.
- VRAM estimada en 8 bits: aproximadamente 7-8 GB. En 4 bits: aproximadamente 4-5 GB, siempre que se genere la cuantizacion, ya que el repositorio no incluye pesos cuantizados.
- GPU recomendadas: A100 40 GB, H100, L40S o A10G para servicio concurrente; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en fp16 de una sola instancia.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas en fp16, y en tarjetas de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (la etiqueta `endpoints_compatible` sugiere compatibilidad con Inference Endpoints) y vLLM por ser una arquitectura Llama estandar. llama.cpp y Ollama requeririan una conversion a GGUF que no se proporciona en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| svd-safety-l2_swift_jbbbencal2_remove40 (este) | 6,738.415.616 segun safetensors; fraccion declarada 0,5998 | no declarado (4096 en el base) | Llama 2 Community License | 0 descargas, 0 likes; solo safetensors | Artefacto de investigacion con metricas de seguridad publicadas |
| meta-llama/Llama-2-7b-chat-hf | 6,7 B aprox. | 4096 tokens | Llama 2 Community License | Ampliamente disponible | Modelo denso de referencia, alineado con SFT y RLHF |
| meta-llama/Llama-2-13b-chat-hf | 13 B aprox. | 4096 tokens | Llama 2 Community License | Ampliamente disponible | Alternativa de mayor tamano sin compresion |
| Otras celdas del grid SVD-LLM del mismo autor | no disponible | no disponible | Llama 2 Community License | no disponible | La model card describe el grid pero no enlaza los demas checkpoints |

Los valores de la comparativa para los modelos de Meta corresponden a caracteristicas publicas de dichos modelos base y no se han verificado en la informacion proporcionada. No se dispone de datos de rendimiento comparables en seguridad para los modelos alternativos dentro de la informacion disponible.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor indica explicitamente que no es un modelo conversacional de proposito general y que no debe tratarse como un asistente desplegable.
- Seguridad degradada de forma deliberada: la compresion por si sola eleva la tasa de exito de ataques; varios brazos del grid estan degradados intencionadamente respecto a Llama-2-7b-chat.
- Sobre-rechazo elevado: una metrica macro de 0,3425 implica que el modelo rechaza con frecuencia peticiones legitimas, lo que lo hace poco adecuado para atencion al cliente o tareas conversacionales reales.
- Riesgo de alucinacion: no evaluado en la model card; sin datos de fidelidad ni de tasas de alucinacion.
- Discrepancia de recuento de parametros: los metadatos de safetensors declaran 6.738.415.616 parametros, practicamente identico al recuento denso de Llama-2-7B, mientras que la model card afirma una fraccion resultante de 0,5998. Conviene verificar el empaquetado real de los pesos antes de asumir un ahorro de memoria.
- Contexto e idiomas limitados: sin declaracion explicita; hereda el sesgo hacia el ingles del modelo base.
- Restricciones de licencia: Llama 2 Community License con `LICENSE.txt` y `USE_POLICY.md` incluidos; el uso derivado queda sujeto a esas condiciones, incluida la clausula de licencia para usos comerciales a gran escala.
- Sin soporte declarado de tool calling ni de agentes, por lo que no es apto para pipelines de automatizacion que dependan de llamadas a funciones.
- Adopcion nula: 0 descargas y 0 likes, sin validacion externa de las metricas declaradas.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Jeesup/svd-safety-l2_swift_jbbbencal2_remove40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/ (los ficheros `LICENSE.txt` y `USE_POLICY.md` se incluyen en el repositorio)
- Metodologia SVD-LLM: citada por el autor como base del metodo de compresion, sin enlace en la model card ni en los resultados de busqueda disponibles
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las consultas devolvieron exclusivamente paginas de soporte tecnico de Acer sin relacion con el modelo
