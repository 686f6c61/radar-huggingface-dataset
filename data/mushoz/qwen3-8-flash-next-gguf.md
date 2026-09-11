# Mushoz/Qwen3.8-Flash-Next-GGUF

## Resumen

Mushoz/Qwen3.8-Flash-Next-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo Qwen/Qwen3.8-Flash-Next, publicado por el usuario Mushoz y generado con las herramientas de Unsloth (Unsloth Dynamic 3.0). No se trata de un modelo entrenado desde cero, sino de una conversión de pesos del modelo base de Qwen al formato que consumen llama.cpp y sus derivados, con el objetivo de permitir la inferencia local y en servidor de un modelo que en precisión completa resulta inviable fuera de clústeres de GPUs.

El modelo base es un transformer causal híbrido con codificador de visión, presentado por Qwen como la vista previa experimental de la arquitectura que sustentará Qwen4. Combina atención lineal (Gated DeltaNet) con Qwen Sparse Attention (QSA) a nivel de microbloque, una capa de Mixture of Experts con 512 expertos, Gated Residual en el flujo residual y un n-gram embedding de 20 millones de entradas. El recuento real de parámetros del repositorio safetensors es de 176 943 899 520 (unos 177 000 millones); el model card desglosa 125 000 millones en el modelo de lenguaje con 6000 millones activados, más 51 000 millones de n-gram embedding y 4000 millones de la cabeza MTP.

Su relevancia actual es doble: por un lado, es una de las primeras releases abiertas de una arquitectura pensada para cargas agénticas con contexto muy largo (262 144 tokens nativos, extensibles a 1 000 000); por otro, la disponibilidad de GGUF con decodificación multi-token (MTP) permite acelerar la inferencia entre 1,3 y 1,7 veces según Unsloth. El repositorio es muy reciente (creado el 11 de septiembre de 2026) y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con vision encoder: Gated DeltaNet (atencion lineal) + Qwen Sparse Attention (QSA), MoE y Gated Residual |
| Parametros totales | 176 943 899 520 (~177 000 M) segun el repositorio safetensors; el model card desglosa 125 000 M de LM + 51 000 M de n-gram embedding + 4000 M de MTP |
| Parametros activos | 6000 M (10 expertos enrutados + 1 compartido, sobre un total de 512 expertos) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 000 000 tokens |
| Tipos de cuantizacion | GGUF mediante Unsloth Dynamic 3.0; niveles concretos (Q2, Q4_K_M, Q8_0, etc.) no disponibles en la informacion proporcionada |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (declarada como "other" y con enlace al fichero LICENSE del repositorio) |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer causal de 48 capas con codificador de visión y un layout oculto de 12 repeticiones de la secuencia 3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE). La Gated DeltaNet usa 48 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; QSA emplea 24 cabezas de consulta y 2 de clave-valor con dimensión 256, RoPE de dimensión 64 y un indexador en configuración MQA (4 cabezas de consulta y 1 cabeza de clave compartida, dimensión 128) que selecciona a nivel de microbloque con un presupuesto de 512 bloques o 2048 tokens. La capa MoE alberga 512 expertos de dimensión intermedia 640, de los que se activan 10 enrutados más 1 compartido. La dimensión oculta es 2560 y el embedding de tokens tiene 248 320 entradas con padding. El Gated Residual introduce 4 ramas con rango de cuello de botella 320, modulando la informacion del flujo residual con una puerta de lectura elemento a elemento y una puerta escalar de escritura por rama.

Las innovaciones declaradas por el autor del modelo base son cuatro: la sustitucion del emparejamiento Gated DeltaNet + Gated Attention por Gated DeltaNet + QSA, que reduce la latencia en contexto largo al operar sobre microbloques en lugar de tokens individuales; el Gated Residual, que aporta expresividad por capa manteniendo la estabilidad de entrenamiento; el n-gram embedding (bigramas y trigramas indexados en la capa 2, con 20 000 000 de entradas), que escala parametros con menor coste computacional y es mas facil de descargar a CPU o disco que un MoE; y una receta de entrenamiento que aplica Muon y AdamW a categorias de pesos especificas, elimina los warmups de tamano de lote y arranca directamente en el lote objetivo. El modelo se entrena en dos fases (pre-entrenamiento y post-entrenamiento) e incorpora una capa MTP entrenada con multiples pasos. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en formato chat (la etiqueta del repositorio incluye "conversational").
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text), gracias al codificador de visión del modelo base.
- Modo de razonamiento con controles de "thinking", segun la guia de Unsloth Desktop enlazada en la model card.
- Contexto largo: 262 144 tokens nativos con extension hasta 1 000 000, orientado a cargas agénticas y documentos extensos.
- Decodificacion multi-token (MTP) con una capa dedicada, que Unsloth cifra en una aceleracion de 1,3 a 1,7 veces en inferencia.
- Compatibilidad con endpoints de inferencia (etiqueta "endpoints_compatible") y con el ecosistema llama.cpp.
- Soporte de tool calling, function calling y razonamiento multi-paso en agentes: no disponible en la informacion proporcionada.
- Cobertura multilingue concreta: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentacion tecnica extensa: con 262 144 tokens nativos se puede cargar un manual completo, un conjunto de especificaciones o un repositorio de normativa en una sola ventana y formular preguntas cruzadas sin troceado ni recuperacion externa.
- Agentes de navegacion y automatizacion multi-paso: la combinacion de atencion dispersa y atencion lineal reduce la latencia cuando el historial crece, algo critico en bucles agénticos donde cada paso reinyecta el contexto acumulado.
- Asistencia sobre capturas e interfaz de usuario: al ser un modelo image-text-to-text, permite interpretar pantallazos, diagramas o imagenes de producto y responder en lenguaje natural, util para soporte tecnico de aplicaciones.
- Procesamiento de expedientes y contratos: lectura de documentos largos con necesidad de mantener coherencia entre secciones distantes, aprovechando la ventana de contexto y la extension hasta 1 000 000 de tokens.
- Despliegue local con cuantizacion: las variantes GGUF permiten ejecutar el modelo en estaciones de trabajo con varias GPUs o con offload a CPU y RAM, algo imposible con los pesos en precision completa.
- Servicio conversacional de alto volumen con razonamiento controlado: el modo thinking desactivable permite alternar entre respuestas rapidas y respuestas razonadas segun el coste por peticion.
- Generacion aumentada sobre corpus internos: indexacion de n-gramas del propio modelo mas contexto largo reduce la necesidad de pipelines RAG complejos en dominios con vocabulario estable.
- Evaluacion e investigacion de arquitecturas hibridas: al ser la vista previa de la arquitectura de Qwen4, sirve para medir en local el comportamiento de Gated DeltaNet + QSA frente a transformers densos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluida en los datos proporcionados contiene una seccion "Benchmark Results" con una tabla, pero el contenido de dicha tabla aparece truncado y no se pueden extraer valores. Tampoco se han encontrado resultados en la busqueda web realizada (los resultados devueltos correspondian a listados de automocion sin relacion con el modelo).

El unico dato de rendimiento disponible es la aceleracion por decodificacion multi-token (MTP) que Unsloth declara para sus builds: entre 1,3 y 1,7 veces mas rapida que sin MTP.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del recuento de parametros (177 000 M) y de los bits por peso habituales de cada nivel GGUF; no proceden de mediciones publicadas del autor.

- VRAM estimada solo para pesos: unos 65 GB a Q2_K, 86 GB a Q3_K_M, 107 GB a Q4_K_M, 125 GB a Q5_K_M, 145 GB a Q6_K y 188 GB a Q8_0.
- Cache KV: con 48 capas, 2 cabezas KV y dimension de cabeza 256 en QSA, el estado por token ronda los 48 KiB en FP16, lo que supone del orden de 12-13 GiB a 262 144 tokens. La parte de atencion lineal (Gated DeltaNet) mantiene estado recurrente de tamano fijo en lugar de cache creciente. Estas cifras son estimaciones de calculo, no medidas del fabricante.
- GPU recomendadas: para Q4_K_M o superiores hacen falta 2 × A100 80 GB, 2 × H100 80 GB o 4 × RTX 4090/A6000 de 24 GB con offload parcial. Para Q2_K o Q3_K_M es viable con 2 × RTX 4090 de 24 GB o una unica GPU de 80-96 GB.
- GPU de consumo: no cabe en una sola GPU de consumo. En una RTX 4090 de 24 GB solo es ejecutable con offload masivo a RAM del sistema.
- RAM del sistema: el repositorio completo ocupa 1389,5 GB, de modo que conviene descargar unicamente la variante necesaria; con offload a CPU se recomienda al menos tanta RAM como el tamano del fichero GGUF elegido mas margen.
- Opciones de despliegue: llama.cpp (recomendado explicitamente en la model card), Unsloth Desktop, aplicaciones basadas en llama.cpp como LM Studio u Ollama, y los pesos originales en safetensors mediante vLLM o TGI si se dispone de hardware suficiente.
- Latencia y throughput: no disponibles mas alla del multiplicador de MTP de 1,3 a 1,7 veces declarado por Unsloth.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables de otros modelos en la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento fiable. La unica comparacion documentada es entre este repositorio cuantizado y los pesos originales del modelo base.

| Aspecto | Mushoz/Qwen3.8-Flash-Next-GGUF | Qwen/Qwen3.8-Flash-Next |
|---|---|---|
| Formato de pesos | GGUF (Unsloth Dynamic 3.0) | safetensors |
| Parametros | Los mismos, con perdida por cuantizacion | 176 943 899 520 (~177 000 M) |
| Contexto | 262 144 nativos, hasta 1 000 000 | 262 144 nativos, hasta 1 000 000 |
| Licencia | qwen-community-1.0 | qwen-community-1.0 |
| Ejecucion | llama.cpp, Unsloth Desktop, Ollama, LM Studio | vLLM, TGI, transformers |
| Aceleracion MTP | Si, 1,3-1,7x segun Unsloth | Depende del stack de inferencia |
| Huella en disco | 1389,5 GB el repositorio completo (varias variantes) | No disponible |

## Limitaciones y advertencias

- Ausencia total de validacion de la comunidad: 0 descargas y 0 valoraciones en el momento de redactar la ficha. Es un artefacto recien publicado y sin verificacion independiente de calidad de las cuantizaciones.
- Sin benchmarks publicados en la informacion disponible, ni del modelo base ni de estas cuantizaciones, por lo que no se puede cuantificar la degradacion introducida por cada nivel de cuantizacion.
- Arquitectura declarada como vista previa experimental: el propio autor indica que es una preview de la arquitectura que sustentara Qwen4, lo que implica posible inestabilidad, cambios de API y soporte limitado en herramientas de terceros.
- Idiomas soportados no documentados: no se puede asumir un rendimiento correcto en castellano ni en otras lenguas sin evaluacion previa.
- Soporte de tool calling y de agentes no confirmado en la informacion disponible, pese a que la arquitectura se orienta a cargas agénticas.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; agravado por la ausencia de evaluaciones publicadas de fidelidad.
- Sesgos: no hay informacion disponible sobre la composicion del dataset de entrenamiento ni sobre analisis de sesgo.
- Licencia qwen-community-1.0: es una licencia propia de Qwen, no una licencia open source estandar. Antes de un uso comercial es obligatorio revisar el fichero LICENSE del repositorio y las condiciones de atribucion y de umbral de usuarios que aplique.
- Tamano del repositorio: 1389,5 GB en total. El almacenamiento y el ancho de banda necesarios para clonarlo completo son prohibitivos para la mayoria de entornos; conviene descargar un unico fichero GGUF.
- Requisitos de hardware elevados: no es ejecutable en una GPU de consumo sin offload a RAM, lo que degrada fuertemente la latencia.
- Calidad de la cuantizacion no verificada: Unsloth Dynamic 3.0 afirma superar a otras tecnicas de cuantizacion, pero esa afirmacion proviene del propio proveedor y no se ha comprobado de forma independiente para este modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Mushoz/Qwen3.8-Flash-Next-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Guia de ejecucion de Qwen3.8-Flash-Next en Unsloth: https://unsloth.ai/docs/models/qwen3.8-next
- Guia de MTP (inferencia 1,3-1,7x mas rapida): https://unsloth.ai/docs/models/qwen3.8-next#mtp-guide
- Documentacion de Unsloth Dynamic 3.0 GGUF: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
- Aplicacion Unsloth Desktop: https://unsloth.ai/docs/desktop
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth/
- Servidor de Discord de Unsloth: https://discord.gg/unsloth
- Blog de Qwen sobre Qwen3.8-Flash-Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe tecnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio de Qwen3.8-Flash-Next en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Diagrama de arquitectura publicado por Qwen: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.8-Flash-Next/architecture.png

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los enlaces anteriores proceden de la model card y de los metadatos del repositorio.
