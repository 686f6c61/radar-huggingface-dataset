# sharonSD/Qwen3.8-Flash-Next

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje causal multimodal (texto e imagen) publicado en Hugging Face bajo el identificador sharonSD/Qwen3.8-Flash-Next. Segun la model card, se presenta como una "preview experimental" de la arquitectura que sustentara la futura familia Qwen4, con pesos abiertos y un total de 179.999.981.459 parametros (aproximadamente 180B), de los cuales unos 6B se activan por token. Su objetivo declarado es demostrar que se puede escalar en parametros y en longitud de contexto sin que el coste de inferencia se dispare, algo especialmente relevante para cargas de trabajo agenticas con contextos muy largos.

La arquitectura combina tres innovaciones principales: atencion hibrida con Qwen Sparse Attention (QSA) sobre bloques, Gated DeltaNet como capa de atencion lineal, y un esquema de Mixture of Experts con 512 expertos (10 enrutados + 1 compartido activados). A esto se suman un mecanismo de Gated Residual, un n-gram embedding de 20 millones de entradas para escalar parametros sin coste proporcional de computo, y una capa de Multi-Token Prediction (MTP).

El modelo declara una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.000.000, lo que lo situa en el segmento de contextos ultralargos. Es relevante ahora porque anticipa decisiones arquitectonicas (atencion dispersa por bloques, embeddings n-grama desacoplables de la GPU) que buscan reducir el coste por token en despliegues agenticos. Conviene senalar que el repositorio figura a nombre del usuario sharonSD, con cero descargas y cero likes en el momento de la consulta, y que la fecha de creacion declarada (2026-09-22) no permite verificar la procedencia oficial de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de vision; hibrido de Gated DeltaNet (atencion lineal) y Qwen Sparse Attention (QSA) por bloques, con Mixture of Experts y Gated Residual |
| Parametros totales | 179.999.981.459 (180B aproximadamente) |
| Parametros activos | 6B por token sobre un modelo de lenguaje de 125B; mas 51B de n-gram embedding y 4B de MTP |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (declarada como license: other, con archivo LICENSE en el repositorio) |
| Formato de pesos | safetensors (formato Hugging Face Transformers) |
| Dimension oculta | 2560 |
| Capas | 48, con layout 12 x (3 x (Gated DeltaNet -> MoE) -> 1 x (Qwen Sparse Attention -> MoE)) |
| Vocabulario | 248.320 tokens (padded), misma dimension en la salida del LM |
| N-gram embedding | 20.000.000 entradas (bigramas/trigramas en la capa 2) |
| Mixture of Experts | 512 expertos; 10 enrutados + 1 compartido activados; dimension intermedia de experto 640 |
| Cabezas de atencion | DeltaNet: 48 cabezas lineales para V y 16 para QK, dimension 128. QSA: 24 cabezas para Q y 2 para KV, dimension 256, RoPE de 64 |
| Indexer de QSA | MQA con 4 cabezas de consulta y 1 cabeza de clave compartida; dimension de cabeza 128; presupuesto de 512 bloques o 2048 tokens |
| Gated Residual | 4 ramas, rango de cuello de botella 320 |
| MTP | 1 capa, entrenada con multiples pasos |
| Tamano del repositorio | 360,0 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo es un transformer causal con encoder de vision, entrenado en dos etapas (pre-entrenamiento y post-entrenamiento). El bloque se repite 48 veces siguiendo un patron de 12 repeticiones de la secuencia "tres bloques Gated DeltaNet + MoE, un bloque Qwen Sparse Attention + MoE". Las capas DeltaNet son de atencion lineal con estado recurrente de tamano fijo, lo que evita que el coste de memoria crezca con la longitud de la secuencia; las capas QSA introducen atencion dispersa que, en lugar de seleccionar tokens individuales, opera a nivel de micro-bloque con un presupuesto de 512 bloques o 2048 tokens y un indexer MQA de 4 cabezas de consulta y una cabeza de clave compartida.

La innovacion mas singular es el n-gram embedding: 20 millones de entradas indexadas por bigramas y trigramas en la capa 2, que actuan como un eje de escalado de parametros mas barato en computo y mas facil de descargar a memoria de host que un MoE. Los pesos se organizan en 125B para el modelo de lenguaje (6B activados por token), 51B de n-gram embedding y 4B de MTP, lo que explica el total de 180B. El Gated Residual modula el flujo de informacion en las corrientes residuales mediante una puerta de lectura elemento a elemento dependiente de los datos y una puerta escalar de escritura por rama, con 4 ramas y rango de cuello de botella 320. Para el entrenamiento se combinan los optimizadores Muon y AdamW aplicados a categorias de pesos especificas, se elimina el calentamiento de tamano de lote y se arranca directamente en el tamano objetivo, lo que reduce el numero de pasos del optimizador. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO mas alla de la mencion generica a una etapa de post-entrenamiento.

## Capacidades

- Generacion de texto conversacional y multimodal: la pipeline declarada es image-text-to-text, por lo que acepta imagenes junto a texto como entrada.
- Razonamiento de contexto largo: 262.144 tokens nativos y extension hasta 1.000.000, orientado a cargas agenticas y documentos extensos.
- Mixture of Experts con 512 expertos, lo que permite capacidad total elevada con un coste de computo por token correspondiente a 6B parametros activos.
- Decodificacion con Multi-Token Prediction (MTP), util para acelerar la generacion en motores de inferencia compatibles.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible para esta version; la model card indica que la version oficial Qwen3.8-Flash incluye herramientas integradas y 1M de contexto por defecto.
- Soporte de agentes y razonamiento multi-paso: la propia model card justifica QSA por el crecimiento de las cargas de trabajo agenticas, aunque no se detallan capacidades concretas de planificacion.
- Capacidades multilingues: no disponible.
- Modo thinking explicito: no disponible.
- Vision: si, mediante encoder de vision integrado en la arquitectura.

## Casos de uso

- Analisis de documentacion tecnica extensa: con 262.144 tokens de contexto nativo se puede cargar un manual completo, un conjunto de especificaciones o un repositorio de normativa y hacer preguntas sobre el conjunto sin trocear el material en fragmentos.
- Agentes autonomos de larga duracion: el patron de atencion hibrida reduce la latencia en contextos largos, algo critico cuando un agente mantiene historiales de conversacion y resultados de herramientas durante cientos de miles de tokens.
- RAG con contexto masivo: en lugar de recuperar fragmentos pequenos, se pueden inyectar documentos completos y dejar que el modelo resuelva la relevancia internamente, con menor perdida de informacion por chunking.
- Asistente de codigo sobre repositorios completos: el modelo es compatible con vLLM, SGLang y TokenSpeed, por lo que puede desplegarse detras de un IDE o de un pipeline de revision para analizar ficheros interrelacionados y proponer cambios.
- Procesamiento de documentos con imagen: al ser image-text-to-text, permite extraer y razonar sobre informacion de capturas, diagramas, formularios escaneados o figuras tecnicas combinadas con texto.
- Despliegue en aceleradores con memoria limitada: el n-gram embedding de 51B parametros esta disenado para poder descargarse a memoria de host, lo que permite ejecutar el modelo en GPUs cuya VRAM no admitiria 180B parametros en BF16.
- Resumen y clasificacion de corpus regulatorios o legales: sesiones de contexto largo con necesidad de trazabilidad, aprovechando la ventana nativa sin necesidad de extension.
- Evaluacion interna de arquitecturas pre-Qwen4: como preview experimental, sirve a equipos de investigacion para medir el comportamiento de Gated DeltaNet + QSA + n-gram embedding antes de que la arquitectura se consolide.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion titulada "Benchmark Results" con estilos de tabla, pero el contenido numerico no aparece en el material proporcionado, por lo que no se pueden reproducir valores de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion. Tampoco se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

- Peso de los pesos en BF16: aproximadamente 360 GB, coherente con el tamano declarado del repositorio (360,0 GB). Es una estimacion derivada del recuento de parametros, no un dato publicado.
- Descarga del n-gram embedding: los 51B parametros del n-gram embedding estan disenados explicitamente para poder descargarse a memoria de host, lo que reduce la VRAM necesaria en unos 100 GB en BF16 a cambio de latencia de acceso.
- VRAM estimada para inferencia en BF16 con pesos completos en GPU: del orden de 260 GB solo en pesos, mas cache y activaciones. No cabe en ninguna GPU de consumo.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 180 GB. Requiere multiples aceleradores (por ejemplo, 3 x H100 80 GB o configuraciones equivalentes).
- VRAM estimada en cuantizacion de 4 bits: alrededor de 90 GB, lo que permitiria configuraciones de 1-2 GPUs de 80 GB. No se publican pesos cuantizados oficiales, por lo que la viabilidad depende de herramientas de cuantizacion de terceros.
- GPUs recomendadas: H100, H200, A100 80 GB o MI300X en configuraciones multi-GPU. En consumer, una RTX 4090 de 24 GB no es suficiente ni con cuantizacion agresiva, salvo que se combine con descarga del n-gram embedding y cuantizacion de 4 bits en un esquema fuera del soporte oficial.
- Cache KV de las capas QSA (estimacion a partir de la configuracion publicada): 12 capas con 2 cabezas KV de dimension 256 implican unos 24,6 KB por token en BF16, aproximadamente 6,5 GB a 262.144 tokens. Las capas Gated DeltaNet mantienen un estado de tamano fijo independiente de la longitud de secuencia.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed, segun la model card. No hay confirmacion de soporte en llama.cpp, Ollama ni TGI, ni se publican ficheros GGUF.
- Alternativa gestionada: la model card remite a Qwen Cloud para inferencia alojada sin mantenimiento de infraestructura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye resultados de benchmarks ni especificaciones de modelos alternativos, por lo que no es posible establecer una comparacion cuantitativa fiable. La unica comparacion documentada en la propia model card es interna a la familia:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next | 180B totales, 6B activos | 262.144 nativos, hasta 1.000.000 | qwen-community-1.0 | Pesos abiertos en Hugging Face (repositorio sharonSD) | no disponible |
| Qwen3.8-Flash (version oficial) | no disponible | 1.000.000 por defecto | no disponible | Servicio gestionado en Qwen Cloud | no disponible |
| Otros modelos abiertos de tipo MoE con atencion hibrida | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Procedencia del repositorio: los pesos estan alojados por el usuario sharonSD y no en una organizacion oficial, con 0 descargas y 0 likes. No hay verificacion de que correspondan a los pesos originales de Qwen, por lo que en produccion conviene validar hashes y procedencia antes de usarlos.
- Fecha de publicacion declarada (2026-09-22) posterior a la fecha habitual de consulta de estos catalogos, lo que impide contrastar la informacion con fuentes independientes.
- Seccion de benchmarks vacia en el material disponible: no hay evidencia publicada de rendimiento en tareas estandar.
- Idiomas soportados no documentados: se desconoce el comportamiento fuera del ingles y el chino, y no hay garantias de calidad en castellano.
- Riesgo de alucinacion: como cualquier modelo generativo sin datos de evaluacion publicados, no se puede acotar su tasa de error factual. En contextos de 262.144 tokens es habitual la degradacion del recuerdo en posiciones intermedias.
- Idiomas y tokenizador: el vocabulario es de 248.320 tokens (padded), pero no se detalla su cobertura por idioma.
- Licencia qwen-community-1.0: es una licencia "other" con terminos propios. Antes de un uso comercial hay que revisar el archivo LICENSE del repositorio; no se puede asumir una licencia permisiva tipo Apache 2.0.
- Coste de infraestructura: 180B parametros implican requisitos de VRAM muy altos y despliegue multi-GPU, con el consiguiente coste operativo.
- Naturaleza experimental: se declara explicitamente como preview de la arquitectura de Qwen4, lo que implica que la API, la configuracion y el comportamiento pueden cambiar sin aviso.
- Cuantizaciones no oficiales: no se publican versiones GGUF, AWQ o GPTQ, por lo que cualquier cuantizacion es responsabilidad del usuario y puede degradar el rendimiento de forma no medida.
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo; los enlaces listados proceden exclusivamente de la model card.

## Enlaces

- Hugging Face: https://huggingface.co/sharonSD/Qwen3.8-Flash-Next
- Blog oficial: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe tecnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Vision general de Qwen3.8-Flash en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-flash
- Servicio gestionado Qwen Cloud: https://www.qwencloud.com
- Archivo de licencia (relativo al repositorio): LICENSE
