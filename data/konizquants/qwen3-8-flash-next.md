# konizquants/Qwen3.8-Flash-Next

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje causal con encoder de vision publicado en HuggingFace bajo el identificador `konizquants/Qwen3.8-Flash-Next`. Segun la model card, se trata de una vista previa experimental de la arquitectura que sustentara la futura familia Qwen4, y su primer release con pesos abiertos. El modelo combina atencion hibrida (Gated DeltaNet mas Qwen Sparse Attention), una capa de n-gram embeddings de 20 millones de entradas y un esquema MoE de 512 expertos, con un total de 179.999.981.459 parametros almacenados en safetensors (~180B) de los cuales solo 6B se activan por token en el modelo de lenguaje. El repositorio ocupa 360 GB.

El objetivo declarado es resolver el cuello de botella de eficiencia en contextos largos y cargas de trabajo agenticas: QSA opera a nivel de micro-bloque en lugar de seleccionar tokens individuales, lo que reduce la latencia en contextos extensos, mientras que el n-gram embedding anade capacidad de parametros con menor coste de computo y permite offloading a memoria secundaria. El contexto nativo es de 262.144 tokens, extensible hasta 1.000.000.

La relevancia inmediata es doble: por un lado introduce tecnicas de arquitectura poco habituales en pesos abiertos (Gated Residual, Muon mas AdamW por categorias de pesos); por otro, la model card indica que la version de produccion, Qwen3.8-Flash, se sirve a traves de la API oficial de Qwen Cloud con 1M de contexto por defecto y herramientas integradas. Es importante senalar que el repositorio analizado no es un canal oficial de Qwen y presenta 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de vision; atencion hibrida (Gated DeltaNet + Qwen Sparse Attention), Mixture-of-Experts y Gated Residual |
| Parametros totales | 179.999.981.459 (~180B): 125B del modelo de lenguaje, 51B de n-gram embedding y 4B de MTP |
| Parametros activos | 6B por token en el modelo de lenguaje (mas la lectura del n-gram embedding y 1 capa MTP) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (campo `license: other` en el repositorio) |
| Formato de pesos | safetensors (formato Hugging Face Transformers) |
| Dimension oculta | 2560 |
| Numero de capas | 48, con layout 12 × (3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE)) |
| Vocabulario | 248.320 tokens (padded), entrada y salida |
| Expertos MoE | 512 expertos; 10 enrutados + 1 compartido activados por token; dimension intermedia de experto 640 |
| N-gram embedding | 20.000.000 de entradas (bigramas/trigramas) en la capa 2 |
| Gated Residual | 4 ramas, rango de bottleneck 320 |
| Vision encoder | presente (pipeline `image-text-to-text`), sin especificaciones detalladas en la informacion disponible |
| Tamano del repositorio | 360 GB |

## Arquitectura y entrenamiento

El modelo es un transformer causal con encoder de vision, disenado en dos etapas declaradas: pre-entrenamiento y post-entrenamiento. El bloque se repite 12 veces con la estructura 3 × (Gated DeltaNet → MoE) seguida de 1 × (Qwen Sparse Attention → MoE), lo que da 48 capas en total: 36 capas de atencion lineal recurrente y 12 capas de atencion dispersa. Gated DeltaNet usa 48 cabezas de atencion lineal para V y 16 para QK, con dimension de cabeza 128. Qwen Sparse Attention emplea 24 cabezas de consulta y 2 de clave-valor con dimension 256, RoPE de dimension 64, y un indexador con estructura MQA de 4 cabezas de consulta y 1 cabeza de clave compartida de dimension 128; el presupuesto de atencion es de 512 bloques, equivalentes a 2048 tokens. La innovacion principal de QSA es que la seleccion se hace a nivel de micro-bloque y no token a token, lo que reduce la latencia en contextos largos. El MoE tiene 512 expertos con 10 enrutados y 1 compartido activados por token y dimension intermedia 640, y el Gated Residual modula el flujo de informacion en flujos residuales ensanchados mediante una puerta de lectura elemento a elemento dependiente de los datos y una puerta escalar de escritura por rama, con 4 ramas y rango de bottleneck 320.

En el apartado de escalado de parametros, el modelo anade una tabla de n-gram embedding de 20.000.000 de entradas indexada por bigramas y trigramas en la capa 2. Con 2560 dimensiones ocultas, esa tabla supone aproximadamente 51B parametros, lo que explica la diferencia entre los 125B del modelo de lenguaje y los ~180B totales; la model card justifica este eje de escalado por requerir menos computo y ser mas facil de descargar a memoria secundaria que un MoE en aceleradores con memoria limitada. Se incluye ademas una capa MTP (multi-token prediction) de 4B entrenada con multiples pasos, orientada a decodificacion especulativa. La receta de entrenamiento combina los optimizadores Muon y AdamW aplicados a categorias de pesos especificas, elimina los warmups de tamano de batch y arranca directamente con el batch objetivo, guiada por leyes de escalado reajustadas. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO mas alla de la mencion generica a una etapa de post-entrenamiento.

## Capacidades

- Generacion de texto y razonamiento conversacional de largo alcance, con contexto nativo de 262.144 tokens y extension hasta 1.000.000.
- Procesamiento conjunto de imagen y texto (`image-text-to-text`), gracias al encoder de vision incluido.
- Carga de trabajo agentica: la mejora de latencia en contexto largo con QSA esta explicitamente justificada en la model card por el peso creciente de las cargas agenticas.
- Decodificacion especulativa mediante la capa MTP entrenada con multiples pasos.
- Eficiencia de inferencia por activacion dispersa: 6B parametros activos sobre 180B totales.
- Compatibilidad declarada con Hugging Face Transformers, vLLM, SGLang y TokenSpeed.
- La version de produccion Qwen3.8-Flash incorpora herramientas integradas oficiales y 1M de contexto por defecto, segun la model card de este repositorio.
- Soporte de tool calling / function calling: no confirmado explicitamente para estos pesos en la informacion disponible (si se menciona para la version servida en Qwen Cloud).
- Capacidades multilingues: no disponible; el vocabulario de 248.320 entradas es compatible con un tokenizador multilingue amplio, pero la lista de idiomas no se especifica.
- Modo de razonamiento explicito (thinking mode), audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Agentes autonomos de larga duracion: el contexto nativo de 262.144 tokens y la atencion dispersa por micro-bloques permiten mantener historiales de herramientas, observaciones y resultados intermedios sin truncar, con menor penalizacion de latencia que una atencion densa equivalente.
- Analisis de documentacion tecnica extensa: contratos, patentes o informes de cientos de paginas pueden procesarse en una sola pasada, incluyendo figuras y tablas si se aportan como imagen gracias al encoder de vision.
- Atencion al cliente automatizada multi-turno: conversaciones con historial largo y adjuntos graficos (capturas, facturas escaneadas) pueden gestionarse en el mismo modelo, con activacion de solo 6B parametros por token para sostener throughput elevado.
- Generacion y revision de codigo en pipelines de CI/CD: la ventana de contexto permite pasar repositorios o diffs grandes completos, y el despliegue en vLLM o SGLang facilita la integracion como servicio interno.
- RAG sobre corpus muy grandes: la ventana de 1M tokens extensible permite reducir el numero de fragmentos recuperados o incluso prescindir del recuperador en dominios acotados, aunque el coste de memoria debe planificarse.
- Inspeccion de documentos escaneados y extraccion estructurada: combinando vision y texto se pueden digitalizar formularios, albaranes o informes medicos y devolver JSON estructurado en una unica llamada.
- Asistentes internos sobre bases de conocimiento corporativas: el modelo puede desplegarse on-premise con licencia qwen-community-1.0 para entornos con requisitos de soberania de datos, siempre que se cumplan las condiciones de la licencia.
- Investigacion en arquitecturas: al ser una vista previa experimental de la base de Qwen4 con 48 capas y componentes novedosos (Gated Residual, QSA, n-gram embedding), sirve como material de estudio para reproducir o ablationar dichas tecnicas.

## Benchmarks y rendimiento

La model card incluye un encabezado "Benchmark Results", pero el contenido extraido del repositorio solo contiene hojas de estilo CSS y no incluye ningun valor numerico. No se han publicado resultados de benchmarks en la informacion disponible. No se dispone por tanto de cifras de MMLU, HumanEval, GSM8K ni de comparaciones con otros modelos en este repositorio.

## Requisitos de hardware

- Peso en precision de entrenamiento: el repositorio ocupa 360 GB, consistente con ~180B parametros en bf16 (2 bytes por parametro). Se necesitan al menos 5 GPU de 80 GB solo para alojar los pesos, sin margen para cache de atencion ni activaciones.
- Configuracion recomendada en bf16: 8 × H100 80 GB (640 GB) o 8 × A100 80 GB, con tensor parallelism y espacio para cache KV y buffers.
- Cuantizacion a 8 bits (estimacion derivada del numero de parametros, no confirmada por el autor): ~180 GB de pesos, aproximadamente 3 × H100 80 GB.
- Cuantizacion a 4 bits (estimacion derivada): ~90 GB, aproximadamente 2 × A100 80 GB o una H200 de 141 GB. El autor no publica tipos de cuantizacion compatibles, por lo que estos valores son estimaciones de planificacion.
- GPU consumer: no cabe. Una RTX 4090 o RTX 3090 con 24 GB no puede alojar el modelo ni siquiera en 4 bits, y el autor no ofrece variantes GGUF.
- Mitigacion por offloading: la propia model card indica que el eje de n-gram embedding (51B parametros en una tabla de 20M entradas × 2560 dimensiones) esta pensado para requerir menos computo y ser mas apto para offloading que un MoE en aceleradores con memoria limitada, lo que puede reducir la VRAM necesaria a costa de ancho de banda de memoria.
- Cache KV estimada: las 12 capas de QSA usan 2 cabezas KV de dimension 256, lo que supone unos 24 KiB por token en bf16, es decir, alrededor de 6,4 GB a 262.144 tokens. Las 36 capas de Gated DeltaNet mantienen un estado recurrente de tamano constante que no crece con la longitud de contexto, por lo que el coste de memoria de atencion es muy inferior al de un transformer denso equivalente.
- Opciones de despliegue declaradas: Hugging Face Transformers, vLLM, SGLang y TokenSpeed. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La activacion de solo 6B parametros por token y la decodificacion especulativa via MTP apuntan a un throughput alto en relacion al tamano total, pero no se publican cifras.
- Alternativa gestionada: la model card remite a Qwen Cloud para inferencia sin mantenimiento de infraestructura.

## Comparativa con modelos similares

La informacion disponible solo permite comparar este repositorio con la variante oficial servida desde la nube. No se aportan datos de terceros modelos de la misma categoria.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| konizquants/Qwen3.8-Flash-Next (este repositorio) | 180B totales, 6B activos | 262.144 nativo, hasta 1.000.000 | no disponible | qwen-community-1.0 | Pesos abiertos en Hugging Face, 0 descargas |
| Qwen3.8-Flash (version oficial) | Derivada de Qwen3.8-Flash-Next | 1.000.000 por defecto | no disponible | no disponible | API gestionada en Qwen Cloud, con herramientas integradas |
| Otros modelos comparables (mismo tamano o tarea) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Repositorio no oficial: el autor declarado es `konizquants`, no Qwen, y el repositorio presenta 0 descargas y 0 likes. La model card, los enlaces a blog y a informe tecnico apuntan a recursos oficiales de Qwen, pero conviene verificar la procedencia de los pesos antes de usarlos en produccion.
- Estado experimental: la propia model card describe el modelo como "experimental preview" de la arquitectura que sustentara Qwen4, con las implicaciones de estabilidad y soporte que ello conlleva.
- Ausencia de datos de benchmarks: no hay cifras verificables de rendimiento en el repositorio, por lo que cualquier decision de adopcion debe basarse en evaluacion propia.
- Idiomas soportados no especificados: no es posible confirmar la cobertura multilingue ni la calidad en castellano.
- Tipos de cuantizacion no publicados: no hay variantes GGUF, AWQ ni GPTQ confirmadas, lo que limita el despliegue en hardware modesto.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan tasas de alucinacion ni evaluaciones de fidelidad.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o seguridad en la informacion disponible.
- Licencia qwen-community-1.0: es una licencia de tipo comunitario con terminos especificos; debe revisarse el texto completo del archivo LICENSE antes de cualquier uso comercial, ya que el campo `license: other` no permite asumir permisos equivalentes a Apache 2.0 o MIT.
- Coste de infraestructura elevado: 360 GB de pesos implican un cluster multi-GPU, y no hay ruta de despliegue en GPU consumer confirmada por el autor.
- Procedencia de datos de entrenamiento no detallada: no se especifica composicion del dataset, numero de tokens ni fecha de corte, lo que dificulta evaluar riesgos de contaminacion o de conocimiento desactualizado.
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo (unicamente paginas de soporte de Microsoft sin relacion), por lo que toda la informacion tecnica procede de la model card del propio repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/konizquants/Qwen3.8-Flash-Next
- Blog oficial de Qwen sobre Qwen3.8-Flash-Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe tecnico (PDF en GitHub): https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio GitHub de referencia: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Pagina de Qwen Cloud: https://www.qwencloud.com
- Descripcion de Qwen3.8-Flash (version de API): https://www.qwencloud.com/models/qwen3.8-flash
- Diagrama de arquitectura: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.8-Flash-Next/architecture.png
