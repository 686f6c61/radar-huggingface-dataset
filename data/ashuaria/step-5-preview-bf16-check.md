# ashuaria/Step-5-Preview-BF16-check

## Resumen

Step-5-Preview es el modelo fundacional insignia de StepFun, disenado especificamente para tareas agenticas en entornos profesionales como programacion asistida, ingenieria de software, analisis financiero y trabajo de conocimiento. Se trata de un transformer disperso de tipo Mixture-of-Experts (MoE) con 604.339.504.832 parametros totales (unos 604B) y aproximadamente 27B parametros activos por token, lo que supone una dispersion de en torno al 4,5%. Incorpora una ventana de contexto de 1.000.000 de tokens y acepta entradas multimodales de texto, imagen y video.

El modelo apuesta por lo que StepFun denomina "Pareto Frontier": mantener un rendimiento cercano a la frontera con un coste de computo muy inferior al de modelos densos de tamano comparable. Para ello combina un diseno de 92 capas "estrecho pero profundo" con Sparse Grouped-Query Attention (GQA) y fusion de tokens por bloques, mecanismo que reduce el coste del indexador y de la seleccion top-k a aproximadamente un octavo respecto a una base mas densa.

Es relevante ahora porque cubre el hueco de modelos abiertos de gran escala orientados a agentes con contexto de un millon de tokens, soporte nativo de tool calling en paralelo, salida estricta conforme a JSON Schema y despliegue local mediante vLLM o SGLang. StepFun ha saltado directamente de Step-3.7-Flash a Step 5, sin publicar la linea 4.x.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 92 capas ("narrow but deep") con Mixture-of-Experts disperso y Sparse GQA con fusion de tokens por bloques |
| Parametros totales | 604.339.504.832 (~604B) segun safetensors |
| Parametros activos | ~27B por token (dispersion aproximada del 4,5%) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica checkpoint BF16) |
| Idiomas soportados | ingles (en), chino (zh), multilingue |
| Licencia | stepfun-community-license (license: other) |
| Formato de pesos | safetensors (BF16), libreria transformers, requiere custom_code |
| Pipeline declarado | image-text-to-text |
| Entradas multimodales | Texto, imagen y video (MP4, QuickTime, Matroska; <=128 MB; <=5 min recomendados) |
| Esfuerzo de razonamiento | Configurable: low, medium, high / xhigh |

## Arquitectura y entrenamiento

La arquitectura se apoya en un transformer de 92 capas con configuracion "narrow but deep". StepFun justifica esta eleccion por la necesidad de rutas de propagacion de informacion mas largas, que favorecen el razonamiento implicito multi-paso durante prefills extensos. El componente de atencion es una Sparse GQA con fusion de tokens por bloques: mediante indexacion dispersa se selecciona unicamente la informacion historica relevante para la tarea en curso, reduciendo el numero de tokens que entran efectivamente en el calculo de atencion. Segun el autor, esto rebaja el coste del indexador y de la seleccion top-k a cerca de un octavo de una linea base mas densa.

La capa MoE es dispersa, con una proporcion de parametros activos de aproximadamente el 4,5% sobre el total. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion, ya que la model card consultada aparece truncada en las secciones de datos de entrenamiento y resultados.

## Capacidades

- Generacion de texto y razonamiento de horizonte largo, con niveles de esfuerzo configurables (low, medium, high, xhigh).
- Programacion y ingenieria de software: el modelo esta etiquetado explicitamente para coding y software-engineering.
- Tool calling y function calling, con soporte nativo de llamadas a herramientas en paralelo (parallel tool calling).
- Salida estricta conforme a JSON Schema, pensada para integracion fiable en sistemas estructurados y pipelines automatizados.
- Capacidades agenticas: ejecucion autonoma, razonamiento multi-paso y flujos de trabajo de horizonte largo.
- Entrada multimodal de imagen y video, ademas de texto.
- Contexto largo de hasta 1.000.000 de tokens (equivalentes, segun el autor, a unas 1.500 paginas A4).
- Capacidades multilingues declaradas: ingles, chino y multilingue.
- Analisis financiero e investigacion profunda (deep research) como dominios objetivo declarados.
- API compatible con OpenAI, accesible tanto mediante la Step API como a traves de pasarelas de terceros.

## Casos de uso

- Atencion al cliente automatizada de nivel empresarial: con 1M tokens de contexto, el modelo puede mantener conversaciones multi-turno con historial completo, documentacion de producto y bases de conocimiento extensas en la misma ventana, sin necesidad de resumir ni trocear el contexto.
- Generacion de codigo en produccion: su soporte de tool calling y salida estricta segun JSON Schema permite integrarlo en pipelines de CI/CD para generar parches, escribir tests o revisar pull requests con salidas parseables de forma determinista.
- Agentes autonomos de resolucion de incidencias: la combinacion de razonamiento multi-paso, llamadas a herramientas en paralelo y contexto largo permite mantener un bucle de diagnostico sobre logs extensos, consultar sistemas externos y proponer o aplicar correcciones.
- Analisis financiero y reporting: el modelo esta orientado explicitamente a analisis financiero, por lo que puede procesar informes anuales, transcripciones de resultados y series de datos para generar resumenes estructurados en JSON.
- Investigacion profunda (deep research): con 1M tokens de contexto, es viable cargar decenas de documentos fuente en una sola llamada y producir sintesis trazables sin perder referencias cruzadas entre ellos.
- Extraccion de datos a partir de documentos escaneados o grabaciones: gracias a la entrada multimodal de imagen y video, puede procesar capturas, PDF renderizados como imagen y clips de video de hasta 5 minutos para extraer informacion estructurada.
- Automatizacion de back-office con integracion de sistemas: la salida JSON Schema estricta permite conectar el modelo a ERPs o CRMs sin capas intermedias de validacion fragiles.
- Asistentes de soporte tecnico con acceso a repositorios completos: la ventana de 1M tokens admite cargar arboles de codigo y documentacion para responder consultas de arquitectura o localizar la causa de un fallo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card consultada incluye una seccion de "Benchmark Results" en su indice, pero el contenido no aparece en el extracto disponible, por lo que no es posible reproducir cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion. El autor afirma de forma cualitativa que el modelo obtiene puntuaciones competitivas frente a modelos con entre 3 y 5 veces mas parametros, pero no se aportan numeros verificables en este material.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 1,2 TB solo para pesos (el repositorio completo ocupa 1214,9 GB), lo que exige un clúster multi-GPU. Las siguientes cifras son estimaciones de calculo, no datos publicados por el autor.
- VRAM estimada en FP8: aproximadamente 600 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 300 GB de pesos, si bien no se ha confirmado la disponibilidad de checkpoints cuantizados.
- GPU recomendadas: despliegue en nodos multiples con H100 80 GB, H200 o A100 80 GB. No es viable en una unica GPU profesional de 80 GB ni en GPUs de consumo.
- GPU de consumo: no cabe en ninguna GPU de consumo (RTX 4090, 5090, etc.) en BF16 ni en cuantizaciones habituales, dado el tamano de pesos.
- Opciones de despliegue: vLLM y SGLang, citados explicitamente en la model card. Tambien esta disponible a traves de la Step API y de pasarelas compatibles con OpenAI. No se confirma soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El autor menciona un coste reducido del indexador y de la seleccion top-k (aproximadamente un octavo de una base mas densa) y una ventana de 1M tokens "sin incrementos de coste proporcionales", pero sin cifras concretas.

## Comparativa con modelos similares

Los valores de la columna de modelos alternativos proceden de documentacion publica de sus respectivos autores y deben verificarse antes de usarlos en una decision de produccion, ya que pueden haber cambiado.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Step-5-Preview | ~604B | ~27B | 1.000.000 tokens | stepfun-community-license | Pesos BF16 abiertos (repositorio oficial y espejo de terceros) |
| DeepSeek-V3 | 671B | 37B | 128.000 tokens | Licencia propia de DeepSeek | Pesos abiertos |
| Qwen3-235B-A22B | 235B | 22B | 128.000 tokens (extensible) | Apache 2.0 | Pesos abiertos |

La ventaja diferencial de Step-5-Preview en esta comparativa es la ventana de contexto de 1M tokens frente a los 128.000 de las alternativas, junto con la entrada nativa de video. En sentido contrario, su licencia no es una licencia open source estandar (figura como "other"), lo que puede limitar el uso comercial respecto a alternativas con Apache 2.0.

## Limitaciones y advertencias

- El repositorio analizado (ashuaria/Step-5-Preview-BF16-check) no es el repositorio oficial de StepFun, sino una copia o verificacion de terceros con 0 descargas y 0 likes. La model card apunta a TypeSafeAI/Step-5-Preview-BF16 como origen. Conviene descargar los pesos desde la fuente oficial para evitar modificaciones no verificadas.
- Licencia stepfun-community-license, clasificada como "other": no es una licencia open source reconocida. Antes de cualquier uso comercial es imprescindible revisar el texto completo de la licencia, ya que puede incluir restricciones de uso, limites de escala o clausulas especificas.
- No se han publicado resultados de benchmarks verificables en la informacion disponible, por lo que no es posible validar de forma independiente las afirmaciones cualitativas de rendimiento del autor.
- Riesgo de alucinacion: no se documentan en el material disponible medidas especificas de mitigacion, tasas de error ni evaluaciones de fidelidad factual.
- Sesgos conocidos: no disponibles. El modelo esta entrenado principalmente en ingles y chino, por lo que el rendimiento en otras lenguas, incluido el castellano, es incierto y no aparece respaldado por datos.
- Limitaciones de idioma: los idiomas declarados son ingles, chino y "multilingue" de forma generica, sin desglose de cobertura por lengua.
- Limitaciones multimodales: el video esta limitado a formatos MP4, QuickTime y Matroska, con un maximo de 128 MB y una duracion recomendada de 5 minutos. Los archivos que superen estos limites requeriran preprocesado.
- Requisitos de infraestructura muy elevados: aproximadamente 1,2 TB de pesos en BF16, lo que descarta cualquier despliegue en hardware de consumo o en una unica GPU de 80 GB.
- La model card consultada esta truncada, por lo que faltan las secciones de datos de entrenamiento, evaluacion, consideraciones eticas y metricas de rendimiento. La informacion sobre alineacion (RLHF, DPO) es no disponible.
- Requiere custom_code en transformers, lo que implica cargar codigo remoto y anade superficie de riesgo en entornos de produccion.
- Al ser un modelo "Preview", es razonable esperar cambios en versiones posteriores; no se documenta ninguna garantia de estabilidad de la API ni del formato de pesos.

## Enlaces

- Repositorio HuggingFace analizado: https://huggingface.co/ashuaria/Step-5-Preview-BF16-check
- Repositorio oficial de pesos BF16 citado en la model card: https://huggingface.co/TypeSafeAI/Step-5-Preview-BF16
- Organizacion del autor en HuggingFace: https://huggingface.co/TypeSafeAI
- Licencia: https://huggingface.co/TypeSafeAI/Step-5-Preview-BF16/blob/main/LICENSE
- Repositorio GitHub de StepFun: https://github.com/stepfun-ai
- Servidor de Discord de StepFun: https://discord.gg/stepfun
