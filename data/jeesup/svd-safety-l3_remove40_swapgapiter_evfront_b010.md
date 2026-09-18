# Jeesup/svd-safety-l3_remove40_swapgapiter_evfront_b010

## Resumen

svd-safety-l3_remove40_swapgapiter_evfront_b010 es un punto de control derivado de meta-llama/Meta-Llama-3-8B-Instruct, publicado por el usuario Jeesup en HuggingFace. No es un modelo de proposito general: se trata de un artefacto de investigacion que forma parte de un estudio sobre como la compresion por descomposicion en valores singulares (SVD) degrada el comportamiento de seguridad de un modelo alineado y que reglas de seleccion de componentes permiten repararlo mejor. En concreto, el modelo base se comprimio con SVD-LLM eliminando el 40,02% de los parametros (fraccion densa resultante de 0,5998) y despues se edito mediante 10 rondas iterativas de intercambio de parametros neutro en parametros, seleccionadas con la regla `gap_iter` y un presupuesto total del 1,0% de los parametros densos.

El checkpoint conserva la arquitectura transformer decoder-only de Llama 3, con 8.030.261.248 parametros almacenados en safetensors y un repositorio de 16,1 GB. La edicion afecto a 69.744.640 parametros intercambiados (1,00% de los parametros de proyeccion densos), con 10.597 componentes restaurados y 5.153 componentes expulsados, usando la estrategia de valor de intercambio `insert` con desalojo ordenado por sigma y semilla 42.

Su relevancia actual es metodologica: proporciona un punto de medida reproducible para cuantificar el compromiso entre seguridad y utilidad bajo compresion agresiva, y para comparar reglas de seleccion de componentes dentro de una rejilla experimental. El propio autor advierte que varias celdas de la rejilla estan deliberadamente degradadas en seguridad y que ninguna debe desplegarse como asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), con compresion SVD-LLM en capas de proyeccion y edicion posterior por intercambio de parametros |
| Parametros totales | 8.030.261.248 (segun safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama-3-8B-Instruct emplea una ventana de 8.192 tokens) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el repositorio solo publica safetensors en precision completa |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Llama 3 (Meta Llama 3 Community License); se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio |
| Formato de pesos | safetensors (libreria transformers) |
| Fraccion densa resultante | 0,5998 (40,02% de parametros eliminados) |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000% de los parametros densos |
| Componentes restaurados / expulsados | 10.597 / 5.153 |
| Parametros intercambiados | 69.744.640 (1,00% de los parametros de proyeccion densos) |
| Rondas iterativas aplicadas | 10 de 10; 0,100% de parametros densos por ronda |
| Semilla | 42 |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Tamano del repositorio | 16,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 18 de septiembre de 2026 / 18 de septiembre de 2026 |
| Etiquetas de despliegue | text-generation-inference, endpoints_compatible, conversation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B Instruct: un transformer decoder-only con normalizacion RMSNorm, activaciones SwiGLU y atencion con RoPE. Sobre esa base no se realiza un entrenamiento adicional en el sentido habitual, sino una transformacion en dos etapas. Primero se aplica SVD-LLM, una tecnica de compresion post-entrenamiento que descompone las matrices de proyeccion y descarta componentes de bajo rango, eliminando en este caso el 40,02% de los parametros y dejando una fraccion densa de 0,5998. Despues, el checkpoint comprimido se somete a una reparacion mediante intercambio de parametros neutro en parametros: en cada una de las 10 rondas se seleccionan componentes candidatos con la regla `gap_iter`, se insertan valores (`insert`) y se desalojan componentes alternativos en orden sigma, con un presupuesto del 0,1% de parametros densos por ronda hasta completar el 1,0%.

No se documenta en la informacion proporcionada ningun uso de RLHF, DPO u otro ajuste por preferencias especifico para este checkpoint; la alineacion procede exclusivamente del modelo base de Meta. La innovacion tecnica que se explora es precisamente la combinacion de compresion SVD con edicion selectiva de componentes, y la comparacion sistematica de distintas reglas de seleccion y presupuestos dentro de una rejilla de experimentos. La model card no especifica el numero de tokens visto durante la construccion del checkpoint ni la composicion del dataset utilizado en la fase de edicion.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad base de Llama-3-8B-Instruct, condicionada por la perdida de calidad introducida por la compresion SVD.
- Razonamiento y conocimiento general: procedentes del modelo base, sin datos de evaluacion especificos publicados en la informacion disponible.
- Generacion de codigo y matematicas: capacidades heredadas del base; no se aportan cifras de HumanEval, MBPP o GSM8K para este checkpoint.
- Tool calling y function calling: no se documenta soporte explicito ni evaluacion en la model card.
- Uso en agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Vision o audio: no soportados (modelo exclusivamente de texto).
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidad instrumental destacada: servir como sujeto experimental medible para estudios de seguridad bajo compresion, con metricas de ASR y de sobrerrechazo ya registradas.
- Sujecion a reglas de edicion reproducibles: la semilla (42), el presupuesto por ronda y la regla `gap_iter` estan documentados, lo que permite reproducir o comparar la celda con otras de la rejilla.

## Casos de uso

- Investigacion sobre compresion y seguridad: el checkpoint permite medir como la eliminacion del 40,02% de parametros por SVD altera la tasa de exito de ataque (ASR) y el sobrerrechazo, comparando la celda con el modelo sin comprimir y con otras celdas de la rejilla.
- Evaluacion comparativa de reglas de seleccion: al fijar la regla `gap_iter` con un presupuesto del 1,0%, sirve como referencia para contrastar reglas alternativas sobre el mismo modelo base y la misma tasa de compresion.
- Auditoria de robustez frente a jailbreaks: con un ASR de 0,0019 en AdvBench y 0,0351 en StrongREJECT medidos con el juez HarmBench, es util como punto de calibracion de pipelines de red-teaming que necesiten sujetos con niveles de vulnerabilidad conocidos.
- Analisis de sobrerrechazo: el 29,16% de sobrerrechazo macro medido con WildGuard lo convierte en un caso de estudio para ajustar clasificadores de rechazo y estudiar el equilibrio entre seguridad y utilidad conversacional.
- Estudios de interpretabilidad mecanistica: la traza de 10.597 componentes restaurados y 5.153 expulsados permite analizar que subconjuntos de parametros sostienen el comportamiento de rechazo y cuales degradan la perplejidad.
- Reproducibilidad de experimentos: con semilla 42 y presupuesto por ronda documentado, se puede replicar la construccion del checkpoint para verificar la estabilidad de las metricas reportadas.
- Docencia y formacion en evaluacion de modelos: sirve como ejemplo practico de artefacto experimental con metricas de seguridad, utilidad y perplejidad declaradas, y con advertencias explicitas de no despliegue.
- Pruebas de herramientas de inferencia: al ser compatible con text-generation-inference y transformers, permite validar pipelines de servicio sobre un checkpoint de 8B con pesos safetensors.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor | Juez / metodo |
|---|---|---|---|
| AdvBench | Tasa de exito de ataque (ASR) | 0,0019 (0,19%) | Juez HarmBench |
| StrongREJECT | Tasa de exito de ataque (ASR) | 0,0351 (3,51%) | Juez HarmBench |
| WildGuard | Sobrerrechazo macro | 0,2916 (29,16%) | WildGuard |
| WikiText-2 | Perplejidad | 37,2542 | Evaluacion estandar de perplejidad |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de conocimiento o razonamiento para este checkpoint, ni tampoco las cifras correspondientes al modelo base sin comprimir, por lo que no es posible establecer una comparacion cuantitativa directa dentro de esta ficha.

## Requisitos de hardware

- VRAM estimada en precision completa (bf16/fp16): en torno a 16,1 GB solo para pesos, mas overhead de activaciones y cache KV; el repositorio ocupa 16,1 GB, coherente con este formato.
- VRAM estimada en int8: aproximadamente 8-9 GB de pesos, con overhead adicional segun longitud de contexto y tamano de lote.
- VRAM estimada en int4 (GPTQ/AWQ/GGUF Q4): aproximadamente 4,5-5,5 GB de pesos; requiere conversion propia, ya que el repositorio solo publica safetensors.
- GPU recomendadas para precision completa: A100 40/80 GB, H100, L40S o RTX 4090/3090 de 24 GB (ajustado, con contexto limitado).
- GPU de consumo: cabe con holgura en RTX 4090, RTX 3090, RTX 4080 y similares de 16-24 GB en bf16; en cuantizacion int4 cabe en tarjetas de 8-12 GB como RTX 3060 12 GB o RTX 4060 Ti 16 GB.
- Fine-tuning completo: requiere del orden de 80 GB o mas de VRAM por las copias de gradientes y estados del optimizador; alternativas como LoRA reducen el requisito a un rango de 16-24 GB.
- Opciones de despliegue: transformers como libreria nativa; text-generation-inference y endpoints compatibles segun las etiquetas del repositorio; vLLM es una opcion habitual para este tamano, aunque no esta documentada en la model card; llama.cpp u Ollama exigen generar un GGUF que no se distribuye.
- Latencia y throughput: no disponibles; la model card no publica mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento de seguridad | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l3_remove40_swapgapiter_evfront_b010 | 8.030.261.248 (fraccion densa 0,5998) | No disponible | Llama 3 | ASR AdvBench 0,0019; ASR StrongREJECT 0,0351; sobrerrechazo 0,2916; PPL WikiText-2 37,2542 | HuggingFace, 0 descargas, 0 likes |
| meta-llama/Meta-Llama-3-8B-Instruct (base sin comprimir) | 8.030.261.248 | No disponible en la informacion proporcionada | Llama 3 | No se aportan cifras en la informacion disponible | Ampliamente disponible en HuggingFace |
| Otros checkpoints de la rejilla de reglas de seleccion (`gap_iter`, `evfront`, etc.) | No disponible | No disponible | Llama 3 | No disponible | No disponibles en la informacion proporcionada |
| Otros modelos comprimidos con SVD-LLM | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

La comparacion relevante es contra el modelo base sin comprimir: la model card indica que la compresion por si sola eleva la tasa de exito de ataque, y el objetivo del estudio es cuantificar esa perdida y probar su recuperacion. Los valores concretos del base no se proporcionan en la informacion disponible.

## Limitaciones y advertencias

- Artefacto de investigacion, no un asistente desplegable: la propia model card indica que debe tratarse como sujeto experimental y evaluarse antes de extraer conclusiones.
- Degradacion deliberada de seguridad en varias celdas de la rejilla: la compresion incrementa la tasa de exito de ataque en el conjunto del estudio, y esta celda solo representa una configuracion concreta.
- Perplejidad elevada: 37,2542 en WikiText-2, lo que sugiere una degradacion notable de la calidad de modelado del lenguaje respecto a un checkpoint sin comprimir.
- Sobrerrechazo alto: 0,2916 macro con WildGuard, es decir, cerca del 29% de rechazos indebidos, lo que limita su utilidad conversacional.
- Riesgo de alucinacion: no se publican mediciones especificas de veracidad ni de tasa de alucinacion, pero la perdida de calidad asociada a la compresion SVD es un factor de riesgo adicional.
- Idiomas: la model card no declara idiomas soportados; el comportamiento multilingue no esta evaluado.
- Contexto: la longitud de contexto no se especifica para este checkpoint; una compresion agresiva puede afectar al comportamiento en ventanas largas incluso si la configuracion se hereda del modelo base.
- Licencia: Meta Llama 3 Community License, con las obligaciones habituales de inclusion del acuerdo, atribucion ("Built with Meta Llama 3") y las restricciones de uso del documento de politica de uso; el uso comercial esta condicionado por dicha licencia y por el limite de usuarios activos mensuales que esta establece.
- Sesgos: no se documenta ninguna evaluacion de sesgos demograficos, de genero o culturales para este checkpoint.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes, y no hay publicacion asociada enlazada; la reproducibilidad depende de la descripcion de la model card.
- Conversiones no incluidas: no se distribuyen pesos GGUF, GPTQ ni AWQ, por lo que cualquier despliegue cuantizado exige un proceso de conversion propio y su validacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove40_swapgapiter_evfront_b010
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia y politica de uso: los archivos `LICENSE` y `USE_POLICY.md` incluidos en el propio repositorio del modelo.
- Las busquedas web realizadas no devolvieron ningun resultado relevante para este modelo: unicamente aparecieron listados de un establecimiento de restauracion ajenos por completo al contenido tecnico, por lo que no se incluyen.
