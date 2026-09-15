# mradermacher/Swift-Qwen3.8-27B-Uncensored-MTP-i1-GGUF

## Resumen

El repositorio `mradermacher/Swift-Qwen3.8-27B-Uncensored-MTP-i1-GGUF` contiene un conjunto de cuantizaciones en formato GGUF generadas por mradermacher a partir del modelo `ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP`. No se trata, por tanto, de un modelo entrenado desde cero, sino de una distribucion derivada: el trabajo del autor consiste en aplicar cuantizacion con pesos ponderados (imatrix) sobre los pesos originales, con el objetivo de reducir el espacio en disco y los requisitos de memoria para inferencia local.

El modelo base cuenta con 27.320.697.856 parametros (aproximadamente 27,3 mil millones), un tamano que lo situa en la franja alta de los modelos que pueden ejecutarse en hardware de consumo si se emplean cuantizaciones agresivas de 2 a 4 bits. El sufijo del nombre sugiere una base de la familia Qwen3 de 27B, junto con un ajuste orientado a reducir rechazos ("uncensored") y soporte de prediccion multi-token ("MTP"), aunque la model card del repositorio no documenta ni confirma formalmente ninguno de estos extremos.

La relevancia de esta publicacion es practica y no cientifica: ofrece hasta 24 variantes de cuantizacion distintas, desde IQ1_S hasta Q6_K, lo que permite desplegar un modelo de 27B en equipos con VRAM limitada. Conviene senalar que el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, carece de licencia declarada y no incluye resultados de evaluacion, por lo que debe tratarse como un artefacto sin validacion publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del modelo base sugiere la familia Qwen3, sin confirmar en la model card) |
| Parametros totales | 27.320.697.856 (dato de safetensors del modelo de referencia) |
| Parametros activos | no disponible (no se documenta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones derivadas de pesos safetensors del modelo base) |
| Tecnica de cuantizacion | imatrix / pesos ponderados (`output_tensor_quantised: 1`, `quantize_version: 2`) |
| Tamano del repositorio | 39,5 GB (conjunto completo de cuantizaciones) |
| Contexto de herramientas | etiquetas `gguf`, `endpoints_compatible`, `imatrix`, `conversational` |
| Fecha de publicacion | 2026-09-15 (creacion y ultima actualizacion el mismo dia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. El nombre `Qwen3.8-27B` sugiere una correspondencia con la familia Qwen3 de Alibaba en su variante de 27.000 millones de parametros, y el sufijo `MTP` es habitual para designar mecanismos de prediccion multi-token (multi-token prediction), una tecnica de decodificacion especulativa que permite proponer varios tokens por paso y validarlos en paralelo. Ninguna de estas dos atribuciones aparece confirmada en la model card, por lo que deben considerarse hipotesis basadas en la nomenclatura.

Respecto al entrenamiento, el repositorio no aporta ningun dato: no se indica el numero de tokens empleados, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares. El termino "Uncensored" en el nombre indica que el ajuste tiene como objetivo reducir las negativas del modelo a generar determinado tipo de contenido, pero tampoco se detalla la metodologia (abliteracion, fine-tuning sobre datasets filtrados, etc.).

La unica innovacion tecnica documentada de este repositorio concreto es el proceso de cuantizacion: se han generado cuantizaciones ponderadas mediante imatrix, lo que en la practica mejora la fidelidad de las capas mas sensibles a la cuantizacion respecto a una cuantizacion uniforme del mismo numero de bits. Los metadatos internos (`quantize_version: 2`, `output_tensor_quantised: 1`, `vocab_type` vacio) confirman el uso de la herramienta de conversion en dos pasos: primero de safetensors a un formato intermedio HF y despues a GGUF.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Inferencia local mediante llama.cpp y derivados, al distribuirse exclusivamente en formato GGUF.
- Compatibilidad con endpoints tipo OpenAI, indicada por la etiqueta `endpoints_compatible` (tipicamente a traves de servidores compatibles como llama.cpp server, Ollama u otros).
- Generacion de contenido con filtros de rechazo reducidos respecto al modelo base, por el ajuste "Uncensored".
- Presunta prediccion multi-token, si el sufijo MTP del nombre refleja un cabezal adicional de prediccion, lo que podria acelerar la decodificacion.
- Capacidades de razonamiento, codigo o matematicas: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades multimodales (vision, audio): no disponibles; no se menciona ningun proyector multimodal en el repositorio.

## Casos de uso

- Inferencia local en equipos de gama alta: la version Q4_K_M ocupa aproximadamente 16-17 GB, de modo que puede cargarse en una unica GPU de 24 GB (RTX 3090, RTX 4090) dejando margen para la cache KV y contexto moderado.
- Despliegue en hardware muy limitado: las variantes IQ1_S, IQ1_M, IQ2_XXS y Q2_K comprimen el modelo por debajo de los 9 GB, lo que permite ejecutarlo en GPUs de 8-12 GB o incluso en CPU con 16 GB de RAM, a costa de una perdida de calidad notable.
- Generacion de datos sinteticos y aumento de datasets: al tratarse de un ajuste "Uncensored", puede emplearse para producir corpus de texto en dominios donde los modelos alineados de forma estricta rechazan la generacion, siempre que se respete el marco legal aplicable.
- Pruebas de seguridad y red-teaming: sirve como modelo de referencia para evaluar filtros de moderacion o clasificadores de contenido, ya que produce respuestas que otros modelos bloquean.
- Asistentes conversacionales autoalojados: la etiqueta `endpoints_compatible` permite exponerlo mediante un servidor compatible con la API de OpenAI y sustituir llamadas a servicios externos en aplicaciones internas.
- Escritura creativa y narrativa larga: un modelo de 27B con cuantizacion Q5_K_M o Q6_K ofrece una fidelidad cercana al original, adecuada para generacion de ficcion o guiones sin censura tematica.
- Experimentacion con decodificacion especulativa: si la arquitectura incorpora realmente prediccion multi-token, es un banco de pruebas para medir ganancias de throughput en inferencia local.
- Servicio de chat en produccion con multiples usuarios: mediante vLLM o llama.cpp server en una GPU A100 o H100, aprovechando el mayor ancho de banda de memoria frente a GPUs de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni tampoco comparaciones con el modelo base sin cuantizar. Tampoco se han encontrado datos de evaluacion en los resultados de busqueda web, que no devolvieron ningun resultado relevante sobre el modelo.

## Requisitos de hardware

Los datos que siguen combinan el recuento de parametros aportado (27,32 mil millones) con los tamanos tipicos de cada tipo de cuantizacion GGUF. Deben considerarse estimaciones de ingenieria, no cifras publicadas por el autor, ya que el repositorio no detalla el tamano de cada fichero individual dentro de los 39,5 GB totales.

| Cuantizacion | Bits por peso (aprox.) | Peso estimado | VRAM minima estimada |
|---|---|---|---|
| IQ1_S | ~1,56 | ~5,4 GB | ~7 GB |
| IQ1_M | ~1,75 | ~6,0 GB | ~8 GB |
| IQ2_XXS | ~2,06 | ~7,1 GB | ~9 GB |
| IQ2_XS / IQ2_S | ~2,3-2,4 | ~8,0-8,3 GB | ~10 GB |
| Q2_K / Q2_K_S | ~2,5-2,6 | ~8,7-9,0 GB | ~11 GB |
| IQ3_XXS / IQ3_XS | ~3,0-3,3 | ~10,4-11,4 GB | ~13 GB |
| Q3_K_S / IQ3_S / Q3_K_M | ~3,5-3,9 | ~12,1-13,5 GB | ~15 GB |
| Q3_K_L | ~4,3 | ~14,8 GB | ~17 GB |
| IQ4_XS | ~4,25 | ~14,6 GB | ~17 GB |
| Q4_0 / Q4_1 | ~4,5-5,0 | ~15,5-17,2 GB | ~18-20 GB |
| Q4_K_S / Q4_K_M | ~4,6-4,85 | ~15,8-16,7 GB | ~19 GB |
| Q5_K_S / Q5_K_M | ~5,5-5,7 | ~18,9-19,6 GB | ~22 GB |
| Q6_K | ~6,6 | ~22,7 GB | ~25 GB |

- GPUs de consumo con 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 3080 10 GB): viables solo con IQ1, IQ2 y Q2_K, con degradacion de calidad significativa.
- GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4080): IQ4_XS y Q4_K_S con contexto corto.
- GPUs de 24 GB (RTX 3090, RTX 4090, RTX 5090): Q4_K_M, Q5_K_S y Q5_K_M con comodidad; Q6_K requiere reducir contexto o usar offload parcial.
- Multiples GPUs (2x RTX 3090/4090, 48 GB): Q6_K con contexto amplio, o incluso precision superior si se generase.
- GPUs de centro de datos (A100 40/80 GB, H100 80 GB): cuantizaciones altas con contextos muy largos y procesamiento por lotes; tambien permiten servir el modelo sin cuantizar si se dispone del checkpoint safetensors original.
- CPU y RAM del sistema: para Q4_K_M se recomienda un minimo de 24 GB de RAM libre; para Q6_K, 32 GB. La inferencia en CPU con llama.cpp es funcional pero notablemente mas lenta que en GPU.
- Cache KV: no cuantificable con los datos disponibles, ya que se desconoce la longitud de contexto del modelo y el numero de capas y cabezas KV. En un modelo de 27B, la cache KV a 8.000-32.000 tokens de contexto puede anadir entre 1 y 8 GB adicionales, por lo que la VRAM total debe presupuestarse por encima del peso de los ficheros.
- Opciones de despliegue: llama.cpp (referencia para GGUF), Ollama, LM Studio, llama.cpp server con API compatible con OpenAI, y vLLM o TGI solo si se dispone de los pesos safetensors originales, ya que vLLM y TGI no consumen GGUF de forma nativa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento. La unica comparacion documentable es entre esta distribucion cuantizada y su modelo base.

| Aspecto | Este repositorio (GGUF cuantizado) | Modelo base `ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP` |
|---|---|---|
| Parametros | 27.320.697.856 | 27.320.697.856 |
| Formato de pesos | GGUF (24 variantes) | safetensors (segun el recuento de parametros) |
| Tamano en disco | 39,5 GB el conjunto completo | no disponible |
| Precision | 1,56 a 6,6 bits por peso | habitualmente 16 bits (bf16/fp16), no confirmado |
| Licencia | no disponible | no disponible |
| Contexto | no disponible | no disponible |
| Rendimiento en benchmarks | no disponible | no disponible |
| Uso previsto | inferencia local en hardware limitado | entrenamiento, ajuste fino y conversion |

Frente a alternativas de la misma franja de tamano (por ejemplo, Llama 3.1 8B, Qwen2.5 32B, Mistral Small 24B o Gemma 2 27B), no hay datos de benchmarks ni de licencia en la informacion disponible que permitan una comparacion fundamentada.

## Limitaciones y advertencias

- Ausencia total de validacion publica: 0 descargas y 0 "likes" en el momento de la consulta, sin benchmarks ni evaluaciones de terceros.
- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso para uso comercial. Es imprescindible consultar la licencia del modelo base `ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP` y de la familia original subyacente antes de cualquier despliegue en produccion.
- Riesgo elevado de contenido inapropiado: el ajuste "Uncensored" implica, por definicion, una reduccion de los mecanismos de rechazo. No es adecuado para aplicaciones de cara al publico sin una capa adicional de moderacion.
- Alucinacion: no se han publicado mediciones de fidelidad factual. Un modelo de 27B sin datos de entrenamiento documentados no ofrece garantias de precision en tareas de recuperacion de hechos.
- Sesgos: al desconocerse la composicion del dataset de ajuste, no es posible evaluar los sesgos de genero, raza, religion o ideologia que pueda arrastrar.
- Degradacion por cuantizacion: las variantes por debajo de 4 bits (IQ1, IQ2, Q2_K) introducen perdidas de calidad significativas, especialmente en razonamiento aritmetico y codigo. El efecto es acumulativo en contextos largos.
- Contexto desconocido: al no documentarse la longitud de contexto, no puede garantizarse el comportamiento en conversaciones multi-turno largas ni en tareas de recuperacion sobre documentos extensos. Tampoco se confirma la existencia de atencion lineal ni de ninguna extension de contexto.
- Idiomas no documentados: no hay garantia de un rendimiento solido en castellano, ya que la composicion linguistica del entrenamiento es desconocida.
- Fecha de publicacion inusual: el repositorio figura como creado y actualizado el 2026-09-15, una fecha posterior a la habitual en los registros de HuggingFace. Conviene verificar la vigencia y autenticidad del artefacto antes de integrarlo.
- Sin proyector multimodal: no se incluye fichero `mmproj`, por lo que no hay soporte de vision.
- Cadena de custodia: es una cuantizacion de terceros de un modelo ya de terceros, sin verificacion publicada del proceso de imatrix empleado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Swift-Qwen3.8-27B-Uncensored-MTP-i1-GGUF
- Modelo base del que derivan las cuantizaciones: https://huggingface.co/ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Paper, blog o repositorio adicional: no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los unicos resultados obtenidos fueron paginas del servicio Google Translate, sin relacion con el artefacto.
