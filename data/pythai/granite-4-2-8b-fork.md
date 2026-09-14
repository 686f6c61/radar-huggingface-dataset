# PYTHAI/granite-4.2-8b-fork

## Resumen

Granite-4.2-8B es un modelo de lenguaje de 8.000 millones de parametros desarrollado por el Granite Team de IBM, publicado originalmente el 25 de agosto de 2026 como parte de la familia Granite 4.2. Se trata de un transformer denso decoder-only con atencion de consultas agrupadas (GQA), entrenado especificamente para razonamiento explicito mediante cadenas de pensamiento nativas delimitadas por las etiquetas `<think>...</think>`. Su ventana de contexto es de 128.000 tokens de forma nativa, con una extension declarada hasta 512.000 tokens, y esta liberado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

El repositorio que nos ocupa, `PYTHAI/granite-4.2-8b-fork`, no contiene pesos del modelo. Es un fork de tipo puntero (pointer fork) que preserva la licencia, la configuracion, el tokenizer y el codigo del commit `f8de16cdcdbc6c779ca517604e050d82cc119e44` del repositorio oficial `ibm-granite/granite-4.2-8b`, con los digests SHA-256 registrados en `FORK.json`. Los cuatro ficheros de pesos (17,6 GB en total) permanecen en el repositorio de origen y deben cargarse desde alli fijando la revision.

La relevancia de esta ficha reside en dos aspectos: por un lado, documenta el modelo subyacente, que destaca por combinar modos de pensamiento conmutables (completo, bajo esfuerzo y sin pensamiento) con tool calling aumentado por razonamiento, algo poco habitual en la franja de 8B; por otro, advierte de que cualquier uso en produccion debe apuntar al repositorio upstream, no a este fork, que solo sirve como anclaje de trazabilidad de licencia y configuracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (`GraniteForCausalLM`) con GQA y RoPE |
| Parametros totales | 8B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens nativos; extension declarada a 512K |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el modelo se distribuye en bfloat16) |
| Idiomas soportados | Ingles, aleman, espanol, frances, japones, portugues, arabe, checo, italiano, coreano, neerlandes y chino (otros idiomas pueden funcionar sin validacion completa) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (4 ficheros de pesos, 17,6 GB, alojados en el repositorio upstream, no en este fork) |
| Precision | bfloat16 |
| Cabezas de atencion / cabezas KV | 32 / 8 |
| Capas | 40 |
| Dimension de embedding | 4096 |
| Tamano de cabeza de atencion | 128 |
| MLP | SwiGLU con hidden size 12800 |
| Normalizacion | RMSNorm (epsilon = 1e-5) |
| Embeddings | Entrada y salida separados (no atados) |
| RoPE theta | 10.000.000 |
| Fecha de publicacion (upstream) | 25 de agosto de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso decoder-only con las siguientes decisiones de diseno: atencion de consultas agrupadas (GQA) con 32 cabezas de atencion y 8 cabezas de clave-valor, lo que reduce de forma notable el tamano de la cache KV respecto a atencion multi-cabeza completa; embeddings posicionales rotatorios (RoPE) con theta de 10.000.000, valor elevado que sostiene la extension de contexto largo; capas feed-forward con activacion SwiGLU y dimension oculta de 12.800; normalizacion RMSNorm con epsilon de 1e-5; y embeddings de entrada y salida no atados, lo que anade parametros pero aporta flexibilidad al vocabulario de salida. El cuerpo del modelo tiene 40 capas y una dimension de embedding de 4096.

El modelo parte del checkpoint base `ibm-granite/granite-4.1-8b-base` y se somete a un proceso de post-entrenamiento orientado a razonamiento que le dota de cadenas de pensamiento nativas entre `<think>` y `</think>`. La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF, DPO o RLVR; tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal. Lo que si se explicita es la existencia de tres modos de pensamiento conmutables (completo por defecto, bajo esfuerzo y sin pensamiento) integrados en un unico conjunto de pesos, y un mecanismo de tool calling en el que el propio modelo razona sobre que herramienta invocar y por que antes de emitir la llamada.

## Capacidades

- Generacion de texto conversacional en doce idiomas declarados, con calidad validada por IBM en ingles, aleman, espanol, frances, japones, portugues, arabe, checo, italiano, coreano, neerlandes y chino.
- Razonamiento explicito mediante cadena de pensamiento nativa dentro de las etiquetas `<think>...</think>`, con mejora declarada en matematicas, generacion de codigo y logica de multiples pasos.
- Modos de pensamiento conmutables: pensamiento completo (por defecto), modo de bajo esfuerzo y modo sin pensamiento, lo que permite ajustar profundidad frente a latencia por consulta.
- Tool calling aumentado por razonamiento: el modelo delibera sobre la eleccion de herramientas y los argumentos antes de emitir la llamada a funcion.
- Flujos agenticos y razonamiento multi-paso, apoyados en la ventana de contexto larga.
- Procesamiento de documentos largos y conversaciones multi-turno extensas gracias a los 128K tokens nativos (512K con extension).
- Capacidades de generacion de codigo, entrenado y evaluado por el fabricante dentro del bloque de tareas recomendadas.
- No se declaran capacidades de vision, audio ni otras modalidades distintas del texto.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede sostener conversaciones multi-turno con historial extenso gracias a los 128K tokens de contexto nativo, y el modo sin pensamiento permite respuestas de baja latencia cuando no se requiere razonamiento complejo.
- Generacion de codigo en produccion: con soporte de tool calling y razonamiento previo a la llamada, puede integrarse en pipelines de CI/CD para generar parches, proponer tests o invocar linters y compiladores como herramientas externas dentro de un bucle agentico.
- Agentes autonomos multi-paso: la combinacion de razonamiento explicito y tool calling permite construir agentes que planifican, invocan APIs y verifican resultados intermedios, con trazas `<think>` auditables para depuracion.
- Analisis de documentacion tecnica extensa: contratos, expedientes o manuales de cientos de paginas caben en la ventana de 128K tokens o en la extension de 512K, evitando estrategias de troceado agresivo que degradan la coherencia.
- Asistencia a investigacion y sintesis bibliografica: el modelo puede resumir y cruzar fuentes largas en varios de los doce idiomas soportados, util en equipos con documentacion multilingue.
- Razonamiento matematico asistido por herramientas: el modo de pensamiento completo combinado con llamadas a una calculadora o a un motor de algebra permite resolver problemas que requieren precision numerica verificable.
- Generacion de codigo y documentacion en equipos multilingues: la cobertura de espanol, aleman, frances, japones, coreano y chino facilita documentar y comentar codigo en el idioma nativo del equipo sin perder coherencia tecnica.
- Despliegue en entornos con requisitos de licencia permisiva: al estar bajo Apache 2.0, puede incorporarse a productos comerciales cerrados sin obligacion de liberar derivados, siempre que se cargue desde el repositorio upstream y no desde este fork.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo upstream no incluye tablas con MMLU, HumanEval, GSM8K ni ninguna otra metrica numerica, y los resultados de la busqueda web no aportan datos de evaluacion del modelo.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 16 GB en bfloat16 (8.000 millones de parametros a 2 bytes por parametro), 8 GB en cuantizacion de 8 bits y en torno a 4,5-5 GB en cuantizacion de 4 bits. Estas cifras son estimaciones derivadas del tamano del modelo, no datos publicados por el fabricante.
- Cache KV estimada: con 8 cabezas KV, 40 capas y dimension de cabeza 128, cada token consume aproximadamente 160 KB en bfloat16 (unos 4 KB por capa). A 128K tokens de contexto esto supone del orden de 20 GB adicionales de VRAM, por lo que el contexto completo exige hardware de gama alta o tecnicas de atencion eficiente y cuantizacion de la cache.
- GPU recomendadas: para bfloat16 con contexto largo, GPU de centro de datos tipo A100 80 GB, H100 80 GB o superiores. Para contexto corto o moderado en bfloat16, una RTX 4090 de 24 GB o una L40S de 48 GB pueden ser suficientes para los pesos, pero el margen para cache KV es limitado.
- Compatibilidad con GPU de consumo: los pesos en 4 bits caben en GPU de consumo con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores), con contexto recortado. En 8 bits encajan en tarjetas de 12-16 GB. En bfloat16 sin cuantizar no caben en tarjetas de 16 GB.
- Opciones de despliegue: al ser un modelo de la familia Granite con pesos en safetensors, es compatible con el ecosistema `transformers`. La model card no confirma soporte explicito de vLLM, llama.cpp, Ollama o TGI, ni la existencia de pesos GGUF; estos extremos figuran como no disponibles en la informacion proporcionada.
- Latencia y throughput: no disponible.
- Nota critica de despliegue: este repositorio no aloja pesos. Para inferencia hay que cargar `ibm-granite/granite-4.2-8b` fijando la revision `f8de16cdcdbc6c779ca517604e050d82cc119e44`, segun indica el propio fork.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar el modelo con el checkpoint base del que deriva y con los otros dos tamanos densos de la misma familia, y unicamente en los parametros arquitectonicos que la model card detalla. Los datos de rendimiento, contexto y licencia de las alternativas no se incluyen.

| Modelo | Parametros | Capas | Embedding | Cabeza de atencion | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|---|---|---|
| Granite-4.2-8B | 8B | 40 | 4096 | 128 | 128K (512K extendido) | Apache 2.0 | No disponible |
| Granite-4.2-3B dense | No disponible | 40 | 2560 | 64 | No disponible | No disponible | No disponible |
| Granite-4.2-30B dense | No disponible | 64 | 4096 | 128 | No disponible | No disponible | No disponible |
| Granite-4.1-8B-Base | 8B (modelo base) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos que permitan comparar este modelo con alternativas de otros fabricantes de la misma franja (por ejemplo, modelos densos de 7-9B con razonamiento explicito). Cualquier comparacion de ese tipo requeriria ejecutar evaluaciones propias.

## Limitaciones y advertencias

- El repositorio `PYTHAI/granite-4.2-8b-fork` no contiene pesos. Intentar cargarlo directamente como fuente de pesos fallara o requerira resolucion externa; hay que usar el repositorio upstream con la revision fijada. Tiene 0 descargas y 0 likes, y no es un artefacto validado por la comunidad.
- El fork declara ser un anclaje de licencia y configuracion, no una redistribucion funcional. Su valor es de trazabilidad (digests SHA-256 en `FORK.json`), no de despliegue.
- Riesgo de alucinacion: no se documenta en la informacion disponible ningun estudio de tasas de alucinacion ni mecanismos de mitigacion especificos. Como en cualquier modelo generativo de 8B, la verificacion de hechos en dominios especializados es obligatoria.
- Sesgos: la model card no incluye una seccion de sesgos, evaluaciones de equidad ni limitaciones eticas. No hay datos publicados al respecto en la informacion disponible.
- Idiomas: solo doce idiomas estan validados explicitamente. El propio fabricante advierte que otros idiomas pueden funcionar sin haber sido probados por completo, por lo que el comportamiento fuera de esa lista es impredecible.
- Ventana de contexto: los 512K tokens son una extension, no una capacidad nativa. El rendimiento en contextos muy largos dependera de la tecnica de extension aplicada y del hardware, y la informacion disponible no documenta como se realiza esa extension.
- Coste de inferencia: con 40 capas y contexto largo, la cache KV crece de forma significativa (del orden de 20 GB a 128K tokens en bfloat16), lo que puede hacer inviable el contexto maximo en hardware de gama media.
- Licencia: Apache 2.0 permite uso comercial y modificacion sin obligacion de reciprocidad, pero la nota del fork especifica que todos los derechos y obligaciones son los de la LICENCIA del commit upstream citado, por lo que conviene verificar el texto exacto de esa revision antes de un despliegue en produccion.
- Modo de razonamiento: las trazas `<think>` incrementan el consumo de tokens de salida. En aplicaciones con presupuesto de latencia estricto hay que forzar el modo sin pensamiento o de bajo esfuerzo, y la informacion disponible no cuantifica la diferencia de latencia entre modos.
- La fecha de creacion del fork (13 de septiembre de 2026) y la fecha de publicacion del modelo upstream (25 de agosto de 2026) son coherentes, pero el fork refleja un unico commit y no recogera correcciones posteriores del repositorio original.

## Enlaces

- Repositorio del fork: https://huggingface.co/PYTHAI/granite-4.2-8b-fork
- Modelo upstream (fuente de los pesos): https://huggingface.co/ibm-granite/granite-4.2-8b
- Modelo base del entrenamiento: https://huggingface.co/ibm-granite/granite-4.1-8b-base
- Coleccion Granite 4.2 Language Models: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Blog tecnico de Granite 4.2: https://huggingface.co/blog/ibm-granite/granite-4-2
- Repositorio en GitHub: https://github.com/ibm-granite/granite-4.2-language-models
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Revision fijada para carga de pesos: `f8de16cdcdbc6c779ca517604e050d82cc119e44`

Nota sobre la busqueda web: los resultados recuperados no guardan relacion con el modelo (consultas sobre WhatsApp y grabacion de llamadas en telefonos Xiaomi) y no aportan informacion tecnica utilizable. No se han encontrado papers, demos ni articulos adicionales sobre Granite-4.2-8B en la busqueda realizada.
