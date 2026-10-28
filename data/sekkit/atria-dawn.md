# sekkit/Atria-Dawn

## Resumen

Atria Dawn es un modelo agéntico de la familia Instruct desarrollado por el Shanghai Artificial Intelligence Laboratory (Shanghai AI Lab) y construido sobre el modelo fundacional **GLM-5.2**, un MoE de 744.000 millones de parámetros. Su objetivo declarado no es la conversación genérica, sino llevar problemas abiertos de investigación e ingeniería hasta resultados «ejecutables, verificables y reproducibles»: análisis del problema, diseño de solución, uso de herramientas, implementación de código, ejecución de experimentos, análisis de resultados y recuperación de fallos. El repositorio analizado aquí (`sekkit/Atria-Dawn`) es un espejo no oficial del publicado por el laboratorio en `internlm/Atria-Dawn`; los pesos en safetensors suman 753.329.940.480 parámetros y el repo ocupa 1.506,7 GB, lo que cuadra con un checkpoint en BF16.

La model card organiza las capacidades en cuatro dimensiones: *Discovery* (investigación profunda y conversión de preguntas de investigación en planes experimentales), *Creation* (software, aplicaciones interactivas, juegos, visualizaciones y sistemas de ML), *Delivery* (documentos, datos y requisitos transformados en informes y presentaciones) y *Cybersecurity* (análisis de vulnerabilidades, parcheo y revalidación en entornos autorizados). La versión completa declara 512K tokens de contexto; existe una variante *Preview* de 256K y sendas versiones cuantizadas en FP8.

El momento del lanzamiento es relevante por su carácter de despliegue rápido: según la cobertura de prensa recogida, los pesos y una API compatible con OpenAI aparecieron en GitHub tres días antes del informe en arXiv, y una integración en un gateway de LLM se publicó en menos de 24 horas. No hay, sin embargo, resultados numéricos de benchmarks disponibles en el texto proporcionado (la tabla de evaluación existe solo como imagen) ni evaluación independiente publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (tag de HuggingFace `glm_moe_dsa`); derivada del modelo fundacional GLM-5.2 |
| Parametros totales | 753.329.940.480 (recuento de safetensors); la model card cita 744B para el modelo base |
| Parametros activos | no disponible (es MoE, pero la informacion no indica el numero de parametros activos por token) |
| Longitud de contexto | 512K tokens (version completa); 256K tokens (version Preview) |
| Tipos de cuantizacion | FP8 (variante oficial publicada); no se documentan GGUF, AWQ ni GPTQ en la informacion disponible |
| Idiomas soportados | no disponible (la model card se publica en ingles y chino, pero no se declara cobertura linguistica oficial) |
| Licencia | MIT segun la insignia de la model card; el campo de licencia del repositorio de HuggingFace figura como no disponible |
| Formato de pesos | safetensors (BF16, ~1.506 GB); variante FP8 en repositorio separado |

## Arquitectura y entrenamiento

La informacion disponible describe Atria Dawn como un modelo construido sobre **GLM-5.2**, un Mixture-of-Experts de 744.000 millones de parametros. El tag `glm_moe_dsa` del repositorio apunta a una arquitectura MoE con atencion dispersa (DSA), aunque la informacion proporcionada no detalla el numero de expertos, la estrategia de enrutamiento, el ratio de activacion ni las dimensiones de las capas. El recuento real de safetensors (753,3B) es ligeramente superior a los 744B que cita la model card para el modelo base, diferencia que la informacion no explica (posiblemente parametros adicionales de cabecera, embeddings o del post-entrenamiento).

No se han facilitado datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineacion, ni innovaciones de inferencia como decodificacion especulativa. El enfasis del modelo es funcional, no arquitectonico: el diseno declarado busca el bucle cerrado entre objetivo de tarea y retroalimentacion del entorno, incluyendo ejecucion de codigo, analisis de resultados y recuperacion de fallos. Existe un informe tecnico en arXiv (2609.15818) que no se ha podido consultar en esta busqueda, por lo que los detalles de entrenamiento deben verificarse alli.

## Capacidades

- Generacion de texto y razonamiento de multiples pasos orientado a tareas de investigacion e ingenieria.
- Uso de herramientas (tool calling / function calling) como capacidad central del modelo, no accesoria.
- Comportamiento agente con bucle cerrado: planificacion, ejecucion, observacion del entorno, correccion y reintento.
- Investigacion profunda (deep research): recuperacion, organizacion de evidencia y sintesis a partir de corpus extensos, favorecida por la ventana de 512K tokens.
- Generacion de codigo y construccion de software completo: aplicaciones interactivas, juegos, visualizaciones de datos y sistemas de machine learning.
- Generacion de entregables estructurados: informes, presentaciones y documentos a partir de material de entrada heterogeneo.
- Ciberseguridad defensiva/ofensiva en entornos autorizados: analisis de problemas de seguridad, validacion de vulnerabilidades, aplicacion de parches y revalidacion.
- Capacidad demostrada de transformar narrativa textual en artefactos visuales (demo de la batalla de Guandu: lectura de *Romance de los Tres Reinos* y generacion de un mapa animado de la campana).
- Modalidad: solo texto. No se documentan capacidades de vision, audio ni generacion de imagen nativa.
- No se documenta modo *thinking* explicito, soporte multimodal ni capacidades multilingues declaradas.

## Casos de uso

- **Investigacion cientifica automatizada**: el modelo puede recibir un corpus de articulos, extraer evidencia, formular un plan experimental ejecutable y orquestar la ejecucion de experimentos mediante tool calling, analizando despues los resultados y reintentando en caso de fallo. La ventana de 512K permite mantener en contexto varios papers completos junto con el estado del experimento.
- **Deep research con trazabilidad**: para equipos de analisis que necesitan convertir una pregunta abierta en un informe con fuentes organizadas; la orientacion del modelo a resultados «verificables y reproducibles» encaja con flujos donde cada afirmacion debe apoyarse en evidencia recuperada.
- **Desarrollo de software end-to-end**: generacion de aplicaciones, interfaces y visualizaciones a partir de requisitos en lenguaje natural, con iteracion sobre errores de ejecucion. Su uso de herramientas permite integrarlo en pipelines de CI/CD o en entornos de ejecucion con tests automatizados.
- **Generacion de entregables de oficina**: transformacion de documentos, hojas de datos y requisitos de diseno en informes y presentaciones estructuradas, reduciendo el trabajo manual de sintesis y formateo en consultoria, analisis financiero o documentacion tecnica.
- **Auditoria de seguridad en laboratorio autorizado**: analisis de una base de codigo en busca de vulnerabilidades, construccion de una prueba de concepto en un entorno aislado, aplicacion del parche y revalidacion del comportamiento, con el modelo actuando como agente que itera hasta cerrar el ciclo.
- **Analisis de corpus documentales largos**: revision de expedientes, contratos o normativa que superan ampliamente el contexto tipico de 128K, aprovechando la ventana de 512K para responder preguntas transversales sin trocear el material.
- **Prototipado de sistemas de ML**: generacion de codigo de entrenamiento, scripts de evaluacion y herramientas de analisis de resultados dentro de un flujo agente que prueba y corrige sobre la marcha.

## Benchmarks y rendimiento

La model card afirma haber evaluado Atria Dawn y Atria Dawn Preview en benchmarks de busqueda, codigo, uso de herramientas, productividad y seguridad, y remite a la web oficial y a una imagen (`assets/evaluation.jpg`) para la tabla completa. **Los valores numericos no estan disponibles en el texto proporcionado**, por lo que no se reproduce ninguna cifra.

No se han publicado resultados de benchmarks en la informacion disponible en formato textual. No se dispone tampoco de evaluaciones independientes (LMArena, Artificial Analysis u otros) en las fuentes consultadas.

## Requisitos de hardware

- **VRAM en BF16**: 753,3B parametros x 2 bytes = ~1.506 GB solo de pesos; con cache KV y activaciones para contexto largo, el margen practico se situa por encima de 1,7 TB. El tamano del repo (1.506,7 GB) confirma el checkpoint en BF16.
- **VRAM en FP8**: ~753 GB de pesos en la variante oficial FP8; con overhead, un nodo de 8x H200 (141 GB, 1,13 TB) deja margen comodo, mientras que 8x H100 80 GB (640 GB) resulta insuficiente.
- **GPU recomendadas**: H200 (141 GB) para FP8 y BF16; H100 80 GB en tensor parallelism de 20 a 24 GPUs para BF16; A100 80 GB queda penalizada porque no dispone de kernels FP8 nativos en la generacion actual de stacks.
- **Cabe en GPU de consumo?** No. Ni siquiera una cuantizacion hipotetica a 4 bits (~377 GB) cabria en 8x RTX 4090 (192 GB). El modelo requiere despliegue multi-GPU en centro de datos o inferencia remota via API.
- **Cuantizacion a 4 bits**: no hay checkpoint de este tipo publicado; en caso de generarse, estimacion de ~377 GB de pesos mas cache KV, lo que exigiria al menos 6-8 GPUs de 80 GB.
- **Opciones de despliegue**: vLLM y SGLang son las opciones naturales para safetensors BF16/FP8 con tensor parallelism y paged attention; TGI es viable si el stack soporta la arquitectura. llama.cpp y Ollama no son aplicables sin un GGUF publicado, que la informacion no documenta.
- **Contexto largo**: servir 512K tokens multiplica el coste de cache KV y obliga a cuantizacion de cache (FP8 KV) y a planificar el numero de secuencias concurrentes; la informacion no aporta el numero de capas ni de cabezas para calcularlo con precision.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atria Dawn | 753,3B (safetensors); 744B declarados | no disponible | 512K | MIT (segun insignia) | Pesos en HF y ModelScope; version FP8 y Preview de 256K |
| Atria Dawn Preview | no disponible | no disponible | 256K | MIT (segun insignia) | Pesos en HF y ModelScope; version FP8 |
| GLM-5.2 (modelo base) | 744B | no disponible | no disponible | no disponible | Referenciado como base; ficha no consultada |
| DeepSeek-V3 (referencia externa) | 671B | 37B | 128K | MIT | Pesos abiertos |

Las filas de DeepSeek-V3 y GLM-5.2 se incluyen solo como referencia de categoria (MoE de escala 600-750B con pesos abiertos); sus datos no han sido verificados en la informacion proporcionada para esta ficha. No se dispone de comparaciones de rendimiento porque los resultados de Atria Dawn no estan publicados en formato numerico en las fuentes consultadas.

## Limitaciones y advertencias

- **Ausencia de benchmarks verificables**: no hay cifras publicadas en texto ni evaluaciones independientes; cualquier afirmacion de rendimiento basada en la model card debe tratarse como no verificada.
- **Repositorio espejo no oficial**: `sekkit/Atria-Dawn` no es el repositorio del laboratorio (`internlm/Atria-Dawn`). Tiene 0 descargas y 0 likes, y fue creado y actualizado en el mismo instante (2026-10-27T21:55:33/34Z). No hay garantia de integridad de los pesos; para produccion debe usarse el repo oficial y verificar hashes.
- **Licencia ambigua en metadatos**: la insignia de la model card indica MIT, pero el campo de licencia del repositorio figura como no disponible. Antes de un uso comercial conviene confirmar la licencia en el repositorio oficial y en el fichero LICENSE referenciado.
- **Riesgo de alucinacion**: es un modelo generativo sin mecanismo declarado de verificacion factual; en tareas de investigacion y ciberseguridad la salida debe validarse con ejecucion real y revision humana.
- **Sesgos**: no se documenta ninguna evaluacion de sesgo, toxicidad o robustez, ni la composicion del corpus de entrenamiento.
- **Idiomas**: no se declara cobertura oficial; el rendimiento fuera de ingles y chino es desconocido.
- **Solo texto**: no admite imagenes, audio ni video como entrada, lo que descarta casos de uso multimodal.
- **Coste de despliegue**: ~1,5 TB de pesos en BF16 y ~753 GB en FP8 implican infraestructura multi-GPU dedicada; no es desplegable en hardware de consumo ni en estaciones de trabajo convencionales.
- **Contexto largo no equivale a atencion efectiva**: declarar 512K no garantiza recuperacion fiable en todo el rango; no se han publicado evaluaciones tipo needle-in-a-haystack.
- **Uso dual en ciberseguridad**: las capacidades de validacion de vulnerabilidades y prueba de concepto requieren autorizacion explicita y entornos aislados; el mal uso tiene implicaciones legales.
- **Madurez del ecosistema**: al ser un lanzamiento reciente, el soporte en frameworks (vLLM, SGLang, TGI) y la disponibilidad de cuantizaciones comunitarias pueden ser incompletos.

## Enlaces

- Repositorio analizado (espejo): https://huggingface.co/sekkit/Atria-Dawn
- Repositorio oficial en HuggingFace: https://huggingface.co/internlm/Atria-Dawn
- Version FP8: https://huggingface.co/internlm/Atria-Dawn-FP8
- Version Preview (256K): https://huggingface.co/internlm/Atria-Dawn-Preview
- Version Preview FP8: https://huggingface.co/internlm/Atria-Dawn-Preview-FP8
- ModelScope: https://www.modelscope.cn/models/Shanghai_AI_Laboratory/Atria-Dawn
- Web oficial: https://atria-asi.ai/
- GitHub (repositorio principal): https://github.com/atria-asi/Atria-Dawn
- GitHub (Preview): https://github.com/atria-asi/Atria-Dawn-Preview
- Informe tecnico en arXiv: https://arxiv.org/abs/2609.15818
- Perfil en X: https://x.com/AtriaASI
- Discord: https://discord.gg/jT8SDt8up
- Ficha de referencia en llmboard.ai: https://www.llmboard.ai/models/atria-dawn
- Cobertura de prensa (aiweekly): https://aiweekly.co/alerts/shanghai-ai-lab-ships-atria-dawn-preview-a-744b-agentic-moe
