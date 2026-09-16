# Jeesup/svd-safety-mis7_swift_remove30

## Resumen

svd-safety-mis7_swift_remove30 es un checkpoint derivado de mistralai/Mistral-7B-Instruct-v0.2, publicado por el usuario Jeesup en HuggingFace, que ha sido comprimido mediante la tecnica SVD-LLM hasta conservar el 70,03 % de los parametros densos originales. Concretamente se elimino un 30,00 % de los parametros y no se restauro ningun componente SVD adicional (presupuesto de restauracion del 0,000 %, cero componentes restaurados). El resultado es un modelo denso de 7.241.732.096 parametros con pesos en safetensors.

No se trata de un asistente conversacional de proposito general, sino de un artefacto de investigacion. Su objetivo es medir como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad de un modelo alineado y que reglas de seleccion de componentes consiguen repararlo. Este checkpoint es una celda concreta de una malla experimental que cruza reglas de seleccion y presupuestos de restauracion; la model card advierte explicitamente de que varias celdas de esa malla estan deliberadamente degradadas en seguridad.

Su relevancia actual es metodologica: cuantifica el compromiso entre utilidad y seguridad en tecnicas de compresion agresivas, un aspecto poco estudiado frente a las metricas habituales de perplejidad. Los datos publicados muestran un attack success rate del 59,81 % en AdvBench y del 44,73 % en StrongREJECT, muy por encima de lo aceptable en produccion, ademas de una perplejidad de 8,4383 en WikiText-2. Esto lo convierte en un sujeto de estudio util para equipos de seguridad e interpretabilidad, no en un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral 7B: RoPE, GQA, SwiGLU, RMSNorm) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada de la configuracion de Mistral-7B-Instruct-v0.2; no se especifica en la model card de este derivado) |
| Tipos de cuantizacion | No disponible. El repositorio solo publica safetensors sin cuantizar; no se ofrecen versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible en la model card. El modelo base declara soporte para ingles, frances, italiano, espanol y aleman |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); el tamano del repositorio, 14,5 GB, es coherente con pesos en fp16/bf16 |
| Compresion | SVD-LLM, 30,00 % de parametros eliminados; fraccion resultante 0,7003 |
| Regla de seleccion | `unknown` (no documentada en la model card) |
| Presupuesto de restauracion | 0,000 % de parametros densos; 0 componentes restaurados |
| Semilla | 42 |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B-Instruct-v0.2, un transformer decoder-only con Grouped Query Attention, RoPE, normalizacion RMSNorm y activacion SwiGLU. Mistral-7B-Instruct-v0.2 es, a su vez, un ajuste de Mistral-7B-v0.1 alineado mediante DPO y optimizado para seguir instrucciones. Sobre esa base, este checkpoint aplica SVD-LLM, una tecnica de compresion que descompone las matrices de pesos y trunca los valores singulares de menor magnitud para reducir el numero de parametros efectivos.

En este caso concreto el proceso elimino el 30,00 % de los parametros, dejando una fraccion densa de 0,7003. No se restauro ningun componente SVD: el presupuesto de restauracion es del 0,000 %, con cero componentes restaurados y cero componentes sustituidos. La regla de seleccion de componentes aparece como `unknown`, por lo que no es posible reproducir exactamente el criterio aplicado a partir de la informacion publicada. La semilla utilizada fue 42.

No hay informacion sobre volumen de tokens de entrenamiento adicional, composicion del dataset ni fases de RLHF o DPO especificas para este derivado: el ajuste se limita a la compresion del checkpoint base. La innovacion tecnica del artefacto no esta en la arquitectura, sino en el protocolo experimental: medir el dano en seguridad provocado por la compresion y evaluar si la restauracion selectiva de componentes singulares permite recuperar el comportamiento seguro sin recuperar los parametros originales.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada del modelo base.
- Razonamiento basico y respuesta a instrucciones de complejidad media.
- Generacion de codigo y resolucion de tareas sencillas de matematicas, en la medida en que lo permite un modelo de 7B comprimido.
- Soporte multilingue limitado al del modelo base (ingles, frances, italiano, espanol y aleman segun la documentacion de Mistral); no confirmado para este derivado.
- Capacidad degradada de rechazo de peticiones daninas: el ASR de 0,5981 en AdvBench indica que acepta instrucciones perjudiciales en aproximadamente seis de cada diez intentos.
- Funcionamiento como sujeto experimental en evaluaciones de seguridad (AdvBench, StrongREJECT, WildGuard).
- No se documenta soporte de tool calling ni function calling en la model card.
- No se documenta modo de razonamiento explicito (thinking mode), vision ni audio.
- No se documenta comportamiento agentico ni razonamiento multi-paso planificado.

## Casos de uso

- Investigacion sobre compresion y alineacion: usar este checkpoint como celda de control para medir cuanto degrada la compresion SVD el comportamiento seguro de Mistral-7B-Instruct-v0.2. Es adecuado porque la model card proporciona metricas comparables (AdvBench, StrongREJECT, WildGuard, perplejidad) y parametros de reproducibilidad como la semilla 42.
- Red-teaming y evaluacion de arneses de seguridad: emplearlo como objetivo de pruebas para validar que un harness de evaluacion (por ejemplo, combinaciones de AdvBench con un juez HarmBench) detecta correctamente un modelo con ASR cercano al 60 %. Sirve como caso positivo conocido en la calibracion del harness.
- Ablacion de reglas de seleccion de componentes: comparar esta celda (regla `unknown`, presupuesto 0 %) con otras celdas de la malla para determinar que criterio de restauracion maximiza la recuperacion de seguridad por parametro restaurado.
- Estudio de over-refusal y calibracion de moderacion: la metrica de macro over-refusal de 0,0686 (WildGuard) permite analizar el equilibrio entre rechazar de mas y rechazar de menos en modelos comprimidos, y entrenar clasificadores de moderacion con ejemplos etiquetados de ambos extremos.
- Analisis de degradacion linguistica: con una perplejidad de 8,4383 en WikiText-2, el modelo sirve para estudiar como la eliminacion de componentes singulares afecta a la fluidez y a la coherencia a lo largo de secuencias largas.
- Interpretabilidad de subespacios de pesos: al conocer que se truncaron valores singulares concretos, el checkpoint permite correlacionar direcciones del espacio de pesos con comportamientos especificos (seguridad, estilo, conocimiento factual).
- Reproducibilidad de experimentos de compresion: la combinacion de semilla fija, fraccion de parametros resultante documentada y metricas publicadas permite replicar el experimento en otros modelos de 7B para verificar si el efecto se generaliza.
- Docencia y formacion en seguridad de IA: utilizar el checkpoint como ejemplo practico de como una optimizacion aparentemente neutra en coste (menos parametros) puede tener consecuencias severas en el perfil de seguridad de un modelo.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| AdvBench ASR (juez HarmBench) | 0,5981 | Tasa de exito de ataque; mas alto es peor |
| StrongREJECT ASR (juez HarmBench) | 0,4473 | Tasa de exito de ataque; mas alto es peor |
| Macro over-refusal (WildGuard) | 0,0686 | Rechazo excesivo de peticiones benignas |
| WikiText-2 perplexity | 8,4383 | Calidad del modelado de lenguaje |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de capacidad general, ni tampoco los valores equivalentes del modelo base sin comprimir que permitan calcular la delta exacta de degradacion.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 14,5 GB solo para los pesos, dado que el repositorio ocupa 14,5 GB y el modelo tiene 7.241.732.096 parametros.
- Cache KV: la configuracion de Mistral 7B (32 capas, 8 cabezas KV, dimension de cabeza 128) implica del orden de 128 KB por token en fp16, esto es, unos 4 GB adicionales para agotar los 32.768 tokens de contexto. Con contextos cortos el consumo extra es marginal.
- VRAM total recomendada: 18-20 GB para fp16 con contexto moderado; 24 GB o mas para contextos largos.
- GPU consumer: cabe en una RTX 4090 (24 GB) y en una RTX 3090 (24 GB) en fp16 con contexto moderado. En GPUs de 16 GB solo entraria con cuantizacion, que no esta publicada en el repositorio y habria que generar localmente.
- GPU de datacenter: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB, sin problemas de espacio.
- Opciones de despliegue: transformers de forma nativa; text-generation-inference (el modelo lleva la etiqueta `text-generation-inference` y es compatible con endpoints); vLLM para servir con PagedAttention y mayor throughput. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, ya que no se distribuyen.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| svd-safety-mis7_swift_remove30 | 7.241.732.096 | 32.768 (heredado) | Apache 2.0 | safetensors | Artefacto de investigacion, 0 descargas, 0 likes |
| mistralai/Mistral-7B-Instruct-v0.2 | 7.241.732.096 | 32.768 | Apache 2.0 | safetensors | Modelo base sin comprimir y alineado con DPO |
| Otras celdas de la malla del mismo autor | No disponible | No disponible | Apache 2.0 | safetensors | Variantes con distintas reglas de seleccion y presupuestos |
| Mistral-7B-v0.1 | 7.241.732.096 | 32.768 | Apache 2.0 | safetensors | Modelo preentrenado previo a la alineacion |

En rendimiento no es posible establecer la comparativa cuantitativa: la informacion disponible incluye las metricas de seguridad y perplejidad de este checkpoint, pero no las del modelo base sin comprimir, por lo que no se puede calcular la degradacion exacta atribuible al truncado SVD. Cualitativamente, la model card afirma que la compresion por si sola eleva la tasa de exito de ataque respecto a Mistral-7B-Instruct-v0.2. Los resultados de busqueda web no aportaron modelos comparables adicionales.

## Limitaciones y advertencias

- No es un modelo desplegable. La propia model card lo describe como sujeto experimental y recomienda evaluarlo antes de extraer conclusiones.
- Degradacion de seguridad severa y deliberada: un ASR de 0,5981 en AdvBench significa que aproximadamente el 60 % de los ataques del conjunto tienen exito. Es un riesgo inaceptable en cualquier producto orientado al usuario final sin capas adicionales de moderacion externa.
- Riesgo de alucinacion incrementado por la compresion, coherente con la perplejidad de 8,4383 en WikiText-2, superior a la esperable en el modelo sin comprimir.
- La regla de seleccion de componentes figura como `unknown`, lo que impide reproducir exactamente el criterio de compresion a partir de la model card.
- No se distribuyen pesos cuantizados, lo que limita el despliegue en hardware de gama media y obliga a un proceso de conversion propio.
- Idiomas soportados no confirmados: la model card no declara idiomas y la herencia del modelo base solo permite una expectativa razonable, no una garantia.
- Sin datos de benchmarks de capacidad general (MMLU, HumanEval, GSM8K), por lo que no se puede acotar la perdida de utilidad mas alla de la perplejidad.
- Licencia Apache 2.0 para este derivado, con una advertencia explicita de la model card: el repositorio del modelo base no incluye fichero de licencia para redistribuir, y es la licencia indicada la que gobierna esta obra derivada.
- Uso comercial tecnicamente permitido por la licencia, pero desaconsejado en la practica por el perfil de seguridad del checkpoint.
- Ausencia total de adopcion (0 descargas, 0 likes) y de documentacion externa, lo que implica que no existe soporte de la comunidad ni validacion independiente de las metricas publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mis7_swift_remove30
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Los resultados de busqueda web proporcionados no contenian ningun enlace relevante para este modelo: consistian en hilos de foros sobre bloqueos de cuentas de Facebook y paginas de descarga de aplicaciones de video, sin relacion alguna con el checkpoint, SVD-LLM, Mistral o evaluaciones de seguridad. No se han encontrado por tanto papers, blogs, repositorios ni demos adicionales que enlazar.
