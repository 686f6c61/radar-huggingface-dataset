# ml-resources/Muse-Spark-Open-816B-A42B

## Resumen

Muse Spark Open es un modelo de lenguaje multimodal de pesos abiertos desarrollado por Meta Superintelligence Labs (Meta Platforms), publicado en octubre de 2026 bajo la Muse Model License. Se trata de un transformer de tipo Mixture-of-Experts (MoE) con 816.000 millones de parámetros totales y 42.000 millones activos por token, diseñado especificamente para tareas de programacion y flujos de trabajo agénticos. Su ventana de contexto alcanza 1.000.000 de tokens en inferencia, lo que lo situa en la gama alta de modelos abiertos para procesamiento de contextos extensos.

El modelo es nativamente multimodal: acepta texto, imagen, video y audio como entrada, y genera texto como salida, gracias a un Perception Encoder dedicado de 1.800 millones de parametros integrado en la arquitectura. Incorpora modos de "esfuerzo de razonamiento" (reasoning effort) configurables entre low, medium, high y xhigh, con xhigh como valor por defecto, lo que permite ajustar el presupuesto de computo en funcion de la complejidad de la tarea.

Su relevancia radica en dos factores: por un lado, es una de las pocas alternativas abiertas con capacidades multimodales completas (texto, imagen, video y audio) y contexto de un millon de tokens; por otro, Meta lo posiciona explicitamente para despliegues agénticos de largo horizonte con uso intensivo de herramientas. La model card advierte de que esta version de pesos abiertos ha recibido un post-entrenamiento de seguridad adicional y recomienda desplegarlo dentro de un sistema con guardrails propios. Requiere hardware muy por encima de la gama de consumo: 700 GB de VRAM en NVFP4 y 2 TB en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con Perception Encoder |
| Parametros totales | 816B |
| Parametros activos | 42B |
| Longitud de contexto | 1M tokens en inferencia |
| Tipos de cuantizacion | BF16 y NVFP4 oficiales; la model card enlaza a GGUFs dinamicos de Unsloth (Dynamic 3.0) |
| Idiomas soportados | Multilingue, entrenado con datos de mas de 100 idiomas; la etiqueta de HuggingFace indica unicamente "en" |
| Licencia | Muse Model License (license: other) |
| Formato de pesos | safetensors en BF16 y NVFP4 |
| Tamano de vocabulario | 202.048 tokens |
| Dimension oculta | 8192 |
| Numero de capas | 62 |
| Cabezas de atencion | 128 para Q, 16 para KV (grouped-query attention), dimension de cabeza 64 |
| Expertos | 256 expertos, 8 activados por token (top-k routing) |
| Modalidades | Entrada: texto, imagen, video y audio. Salida: texto |
| Parametros de inferencia recomendados | temperature = 1.0, top_p = 1.0, top_k desactivado |

## Arquitectura y entrenamiento

La arquitectura combina un transformer MoE con atencion con compuerta (gated attention) que aplica output gate y output norm sobre el bloque de atencion, ademas de QK-norm. Utiliza grouped-query attention con 128 cabezas de consulta y 16 de clave/valor, con dimension de cabeza de 64, y embeddings de entrada y salida no compartidos (untied) de aproximadamente 1.660 millones de parametros cada uno. La capa MoE cuenta con 256 expertos y enruta los 8 mejores por token (top-k routing). El modelo tiene 62 capas y dimension oculta de 8192.

El Perception Encoder es un componente separado de 1.800 millones de parametros, 50 capas, dimension oculta 1536, 16 cabezas y tamano de parche 14x14, con una dimension de salida de 4096. Emplea embeddings posicionales absolutos aprendidos combinados con RoPE 2D, LayerNorm y GELU en la red feed-forward, y atencion dispersa con factor 4 (cada cuarta capa y la ultima son de atencion completa). La model card no detalla el volumen de tokens de entrenamiento ni la composicion del dataset: la seccion "Training data" aparece vacia en la informacion proporcionada. Tampoco se especifica si se emplearon tecnicas de RLHF, DPO u otras variantes de alineacion, mas alla de mencionar un post-entrenamiento de seguridad adicional sobre esta version de pesos abiertos.

## Capacidades

- Razonamiento multi-paso: encadena razonamiento sobre horizontes largos y mantiene planes coherentes en flujos de trabajo extensos y complejos.
- Ejecucion agéntica de extremo a extremo: planificacion multi-paso, invocacion secuencial de herramientas, recuperacion ante fallos y ejecucion de tareas de largo horizonte dentro de scaffolds.
- Agentes de programacion: escritura, depuracion y resolucion de tareas reales de ingenieria de software.
- Uso de herramientas (tool calling): invocacion en flujos multi-turno extensos, diagnostico de errores y reintento ante fallos de llamadas a herramientas.
- Razonamiento multimodal: interpretacion de capturas de pantalla, graficos, documentos, imagenes, audio y grabaciones de video junto con la conversacion.
- Generacion de datos sinteticos: produccion de datos de entrenamiento de alta calidad para desarrollo de modelos posteriores.
- Evaluacion LLM-as-a-judge: uso como evaluador de las salidas de otros modelos.
- Multilingue: entrenamiento con datos de mas de 100 idiomas, aunque la ficha de HuggingFace solo etiqueta ingles.
- Control de esfuerzo de razonamiento: parametro reasoning_effort con valores low, medium, high y xhigh (por defecto xhigh). Valores distintos devuelven error.
- Modo de pensamiento: el esfuerzo de razonamiento controla cuanto "piensa" el modelo antes de responder.

## Casos de uso

- Agentes de ingenieria de software autonomos: el modelo puede recibir un issue, explorar el repositorio, escribir el parche, ejecutar los tests mediante tool calling y corregir los fallos detectados en varios ciclos, gracias a su contexto de 1M tokens que le permite mantener a la vista grandes porciones del codigo.
- Atencion al cliente automatizada multi-turno: gestiona conversaciones largas con historial extenso e integramultiple herramientas (consulta de pedidos, gestion de devoluciones) sin perder el hilo, apoyandose en el contexto de 1M tokens.
- Analisis de documentos y graficos en entornos financieros: al ser multimodal, puede ingerir informes en PDF, tablas e imagenes de dashboards y producir resumenes textuales o responder preguntas concretas sobre ellos.
- Procesamiento de reuniones con audio y video: interpreta grabaciones de audio y video junto con transcripciones para extraer decisiones, tareas pendientes y responsables, combinando la modalidad de audio con razonamiento textual.
- Generacion de datos sinteticos para entrenamiento: produce datasets etiquetados de alta calidad para ajustar modelos mas pequenos en dominios verticales, una capacidad que Meta destaca explicitamente en la model card.
- Evaluacion automatizada de modelos (LLM-as-a-judge): se emplea como juez para puntuar y comparar las salidas de otros modelos en pipelines de evaluacion continua, con el esfuerzo de razonamiento elevado a xhigh para maximizar la consistencia.
- Automatizacion de operaciones con diagnostico de errores: en flujos agénticos de DevOps, invoca herramientas de monitorizacion, interpreta el fallo, reintenta con una estrategia distinta y documenta la resolucion, aprovechando la recuperacion ante fallos integrada.
- Asistentes de investigacion sobre corpus extensos: con 1M tokens de contexto puede procesar libros tecnicos completos, colecciones de papers o bases de codigo enteras y responder preguntas que cruzan multiples documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card proporcionada no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo (los resultados obtenidos corresponden a siglas no relacionadas: "ML" como abreviatura generica, vehiculos Mercedes Clase M/ML y el juego Mobile Legends). El unico material de evaluacion enlazado en la model card son los benchmarks de cuantizacion de Unsloth Dynamic 3.0, que miden la perdida de calidad de las cuantizaciones, no el rendimiento del modelo frente a la competencia.

## Requisitos de hardware

- VRAM estimada en NVFP4: minimo 700 GB, segun la model card.
- VRAM estimada en BF16: 2 TB, segun la model card.
- No cabe en GPU de consumo. Ni siquiera una RTX 4090 (24 GB) o una RTX 5090 se acercan: el modelo exige un minimo de 700 GB, lo que implica configuraciones multi-GPU en servidor.
- Configuraciones de referencia estimadas a partir de los requisitos declarados: aproximadamente 4x B200 (192 GB cada una, 768 GB totales) o 5x H200 (141 GB, 705 GB totales) para NVFP4, y del orden de 25x H100 de 80 GB (2 TB) para BF16. Estas agrupaciones son calculos orientativos, no cifras publicadas por el autor.
- Alternativa sin GPU: la model card indica que esta optimizado para ejecutarse en dos Mac Studio con M5 Ultra mediante MLX.
- Frameworks de despliegue compatibles: SGLang, vLLM, Hugging Face Transformers, TensorRT-LLM, Unsloth y llama.cpp. Tambien MLX.
- Latencia y throughput estimados: no disponible. La model card no publica cifras de tokens por segundo ni de latencia por peticion.
- Acceso alternativo: el modelo esta disponible via API a traves de proveedores de inferencia de terceros, opcion recomendada si no se dispone de la infraestructura anterior.

## Comparativa con modelos similares

No se han publicado benchmarks de Muse Spark Open en la informacion disponible, por lo que no es posible una comparacion de rendimiento. La siguiente tabla recoge unicamente datos estructurales de alternativas abiertas de gama alta de tipo MoE o densa, procedentes de conocimiento general y no de la informacion proporcionada en esta busqueda, por lo que deben verificarse antes de citarlos en produccion.

| Modelo | Parametros totales / activos | Contexto | Licencia | Multimodalidad | Rendimiento |
|---|---|---|---|---|---|
| Muse Spark Open | 816B / 42B | 1M | Muse Model License | Texto, imagen, video y audio | no disponible |
| DeepSeek-V3 | 671B / 37B | 128K | MIT | Solo texto | no disponible para comparar |
| Qwen3-235B-A22B | 235B / 22B | 128K nativo | Apache 2.0 | Solo texto | no disponible para comparar |
| Llama 3.1 405B | 405B denso | 128K | Llama 3.1 Community License | Solo texto | no disponible para comparar |

Diferencias estructurales destacables frente a estas alternativas: Muse Spark Open ofrece una ventana de contexto ocho veces mayor (1M frente a 128K) y es el unico del grupo con entrada multimodal completa (imagen, video y audio). En contrapartida, su licencia no es de tipo permisivo (MIT o Apache 2.0) y su requisito de hardware (700 GB minimo en NVFP4) es sustancialmente mas alto que el de las alternativas de menor numero de parametros totales.

## Limitaciones y advertencias

- Riesgo de alucinacion: no se documenta ningun mecanismo especifico de mitigacion ni tasas de alucinacion medidas. Como en cualquier modelo generativo, las salidas factuales deben verificarse, especialmente en contextos de codigo y agenticos donde un error se propaga en cascada.
- Licencia restrictiva: la licencia es "other", concretamente Muse Model License, no una licencia permisiva. Es imprescindible revisar el archivo LICENSE.md antes de cualquier uso comercial, ya que puede incluir restricciones de escala, de atribucion o de uso aceptable no detalladas en la informacion disponible.
- Guardrails recomendados: la propia model card advierte de que esta version de pesos abiertos ha recibido post-entrenamiento de seguridad adicional pero que debe desplegarse dentro de un sistema mas amplio con guardrails adaptados al caso de uso. No esta pensada para uso autonomo sin protecciones.
- Sesgos: no se publica informacion sobre evaluaciones de sesgo, fairness o toxicidad. Los sesgos derivados de los datos de entrenamiento (mas de 100 idiomas, composicion no detallada) no estan cuantificados.
- Cobertura idiomatica incierta: aunque la model card afirma entrenamiento en mas de 100 idiomas, la ficha de HuggingFace solo declara ingles. No hay evaluaciones por idioma publicadas, por lo que el rendimiento real en castellano no esta documentado.
- Contexto largo sin evaluacion publica: la ventana de 1M tokens es una capacidad declarada, pero no se han publicado pruebas de recuperacion efectiva de informacion en contextos extensos (tipo needle-in-a-haystack) ni sobre la degradacion del rendimiento a medida que crece el contexto.
- Datos de entrenamiento no disponibles: la seccion "Training data" de la model card aparece vacia. Se desconoce el numero de tokens, la composicion del corpus, la fecha de corte y los detalles del post-entrenamiento.
- Dependencia de parametros de inferencia concretos: valores de reasoning_effort distintos de low, medium, high o xhigh devuelven error, lo que exige validar la configuracion en el cliente.
- Repositorio espejo: la ficha analizada es `ml-resources/Muse-Spark-Open-816B-A42B`, un repositorio con 0 descargas y 0 likes cuyo modelo base es `meta-models/Muse-Spark-Open-816B-A42B`. Conviene descargar los pesos desde el repositorio oficial de Meta para garantizar integridad y actualizaciones.
- Coste de despliegue muy elevado: 700 GB de VRAM como minimo en la cuantizacion mas agresiva disponible. El uso comercial en produccion probablemente pase por API de terceros o por infraestructura multi-GPU dedicada.

## Enlaces

- Modelo en HuggingFace (repositorio analizado): https://huggingface.co/ml-resources/Muse-Spark-Open-816B-A42B
- Repositorio base de Meta: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B
- Licencia Muse Model: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B/blob/main/LICENSE.md
- Guia de ejecucion de Unsloth para Muse Spark Open: https://unsloth.ai/docs/models/muse-spark-open
- Benchmarks de cuantizacion de Unsloth Dynamic 3.0: https://unsloth.ai/docs/basics/unsloth-dynamic-v3.0-gguf
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth/
- Documentacion para desarrolladores de Meta sobre despliegue: https://dev.meta.ai/resources/blog/build-with-muse-spark-open
- Servidor de Discord de Unsloth: https://discord.gg/unsloth
