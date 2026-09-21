# DoccyHealth/Solomon

## Resumen

Solomon es un adaptador LoRA, acompañado de cabezas de respuesta entrenadas, para el modelo base Qwen/Qwen3.8-27B. Lo desarrolla DoccyHealth y no genera texto: recibe un documento y un conjunto de preguntas estructuradas y devuelve una probabilidad por decisión, junto con punteros de recuperación (las tres frases que una cabeza experimental de relevancia puntúa más alto) que sirven como punto de partida de lectura, no como justificación de la respuesta. No hay chat, ni traza de razonamiento, ni muestreo: cada respuesta se lee de los logits de letra en una posición fija a través de cabezas lineales entrenadas, de modo que el mismo documento y la misma pregunta devuelven siempre los mismos números.

El modelo cubre cuatro tipos de respuesta: sí/no, elección única, elección ordenada y multietiqueta (una probabilidad por candidato). La versión v1.1 eliminó el tipo de respuesta de entidad: una petición antigua de entidad (`candidate_kind: "entity"` o un marcador `{candidate}`) se responde con un 400 que lo indica explícitamente. El repositorio ocupa 1,8 GB, la licencia es Apache-2.0 y el pipeline declarado es `text-classification`.

Su relevancia ahora es doble. Por un lado, ataca un nicho poco cubierto: convertir documentos en decisiones legibles por máquina con una probabilidad calibrada asociada, en lugar de texto generado que hay que parsear. Por otro, es un ejemplo inusualmente transparente de publicación con reservas: la propia model card advierte de que la mejora principal de v1.1 sobre v1.0 no está establecida estadísticamente (intervalo de confianza del 95 % que incluye el cero) y de que las etiquetas de evaluación son generadas por IA y no han sido revisadas por humanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 64, colocación en el lado de la pregunta, float32) sobre un transformer preentrenado; cabezas lineales entrenadas para la proyección de respuesta. No es MoE ni SSM |
| Parametros totales | Modelo base Qwen/Qwen3.8-27B (27 000 millones según su denominación); el repositorio publicado contiene el adaptador y las cabezas, no el modelo base. Recuento exacto de parámetros del adaptador: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (una vinculación de identidad de runtime por precisión) e int8 en el subconjunto de aceptación. El adaptador se entrena en float32. GGUF u otras cuantizaciones de pesos: no disponible |
| Idiomas soportados | No disponibles (la model card no declara idiomas y el campo `languages` está vacío) |
| Licencia | Apache-2.0 |
| Formato de pesos | Adaptador PEFT/LoRA (librería `peft`) más cabezas lineales entrenadas en `adapter/heads.npz` y un `MANIFEST.json` con hash. El modelo base no se redistribuye. Nombres exactos de los ficheros de pesos: no disponible |
| Modelo base | Qwen/Qwen3.8-27B, revisión fijada `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` |
| Tamano del repositorio | 1,8 GB |
| Pipeline declarado | `text-classification` |
| Descargas / likes | 0 descargas / 27 likes |
| Fechas | Creado el 21 de septiembre de 2026; actualizado el 21 de septiembre de 2026 |

## Arquitectura y entrenamiento

Solomon no es un modelo generativo. Sobre el transformer base se aplica un adaptador LoRA de rango 64 colocado únicamente en el lado de la pregunta: el adaptador está desactivado mientras se lee el documento y activo desde la pregunta en adelante. Aplicarlo a toda la secuencia daría un modelo distinto del medido, y la vinculación de identidad de runtime existe en parte para impedir que eso ocurra por accidente. La respuesta no se muestrea ni se parsea: el modelo se ve forzado a comprometerse en una posición fija y los logits de letra en esa posición se leen a través de cabezas lineales entrenadas (modo de lectura `four_collapsed`), no a través de la cabeza del modelo de lenguaje. Las unidades con forma de sí/no —una pregunta binaria y cada candidato individual dentro de una respuesta multietiqueta— se leen mediante una única cabeza sí/no fusionada y se colapsan a un log-odds binario, `p = sigmoid(z / T)` con `z = log P(yes)/P(no)`, antes de aplicar la temperatura. Las preguntas de elección aplican la temperatura al tramo listado: `softmax(logits[:n] / T)`.

El documento se precalcula una sola vez y se convierte en un estado reutilizable (`POST /states`); cada pregunta es entonces una rama aislada sobre ese prefijo. La model card afirma dos consecuencias verificadas en hardware real: formular las mismas preguntas en distinto orden devuelve las mismas respuestas, y responder desde el estado de documento cacheado coincide con una pasada forward completa en la misma decisión y con una diferencia inferior a 0,05 en probabilidad (en las ejecuciones de aceptación de v1.1: BF16 completo e int8 en un subconjunto, diferencia máxima de 0,0108 en BF16 y 0,0097 en una ejecución BF16 anterior; el límite es más laxo que el 1e-3 usado en fp32 porque las diferencias de alrededor de 0,01 son esperables en BF16, y la configuración fp32 no se volvió a someter a aceptación en v1.1).

En calibración, v1.1 sirve todos los tipos con T = 1.0 (booleano, multietiqueta, elección única y ordenada): las temperaturas por tipo se ajustaron sobre el panel de desarrollo real y no mejoraron la calibración en datos reservados, así que no se aplica ninguna. Las temperaturas forman parte de la vinculación de runtime y están cubiertas por su suma de comprobación; una rama cuyo `head_key` no figure en el mapa del artefacto de calibración se rechaza en lugar de servirse con un 1.0 supuesto. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se usaron RLHF o DPO.

## Capacidades

- Respuesta a preguntas sobre documentos en cuatro formatos estructurados: sí/no (¿el documento establece X?), elección única (¿cuál de estas afirma?), elección ordenada (¿qué umbral afirma?) y multietiqueta (una probabilidad por cada candidato).
- Salida de probabilidad por decisión, no texto libre: sin chat, sin traza de razonamiento y sin muestreo.
- Determinismo: la misma combinación de documento y pregunta devuelve siempre los mismos números.
- Punteros de recuperación ordenados: devuelve, bajo petición, las tres frases que una cabeza experimental de relevancia puntúa más alto, como punto de partida de lectura y no como causa de la respuesta.
- Reutilización del documento mediante estado cacheado (`POST /states`), con independencia del orden de las preguntas y coincidencia con la pasada completa dentro de 0,05 en probabilidad.
- Vinculación de identidad de runtime de 21 claves (BF16, una vinculación por precisión) que se niega a cargar si el motor no es el medido.
- Rechazo explícito de configuraciones no soportadas: un `head_key` desconocido no se sirve con un valor asumido, y las peticiones de tipo entidad devuelven un 400.
- No soporta, según la propia model card: conocimiento general, conversación, generación ni resumen. No se documentan tool calling, uso de agentes, capacidades multilingües declaradas, visión ni audio.

## Casos de uso

- Triaje de contratos y pólizas: enviar el documento una vez a `POST /states` y lanzar después decenas de preguntas binarias del tipo «¿el documento establece una cláusula de renovación automática?», obteniendo una probabilidad por cláusula en lugar de un texto que haya que interpretar.
- Cumplimiento normativo con umbrales: usar el tipo de elección ordenada para preguntar por el tramo declarado (por ejemplo, un límite de indemnización) y conservar la probabilidad como medida de confianza auditable.
- Clasificación de expedientes: emplear el tipo de elección única para asignar cada documento a una de las categorías listadas, con la ventaja de que la misma entrada produce siempre la misma salida, algo útil para reproducir decisiones pasadas.
- Extracción multietiqueta de condiciones: pedir la lista de condiciones aplicables y obtener una probabilidad independiente por candidato, lo que permite fijar umbrales distintos según el coste de un falso positivo.
- Enrutado hacia revisión humana: integrar la probabilidad como señal de escalado, enviando a revisión manual solo los casos con confianza baja, aprovechando que el modelo está diseñado para dar un número y no para decidir por sí solo.
- Preanotación en pipelines de etiquetado documental: generar decisiones estructuradas y punteros de evidencia para que un anotador humano empiece a leer por las tres frases mejor puntuadas, reduciendo el tiempo de localización de la cláusula relevante.
- Verificación de datos ya extraídos: comparar los campos de un sistema aguas arriba contra el documento fuente mediante preguntas binarias por campo, usando la probabilidad como control de calidad.
- Evaluación sintética de pipeline documental: la model card etiqueta el modelo con `synthetic-evaluation`, lo que sugiere su uso como componente en la construcción o validación de conjuntos de evaluación de sistemas de documentos.

En todos estos casos conviene respetar la advertencia del autor: no es apto para escenarios donde una respuesta errónea sea costosa y no pueda comprobarse.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son la comparación interna entre v1.1 y v1.0 sobre un panel reservado de 802 preguntas y 54 documentos reales, con etiquetas generadas por IA y no verificadas por humanos.

| Medicion | Solomon v1.1 | Solomon v1.0 |
|---|---|---|
| Preguntas completas correctas | 706 de 802 | 679 de 802 |
| Diferencia | +3,4 puntos porcentuales | referencia |
| Intervalo de confianza del 95 % (bootstrap por documento) | [-1,3, +7,4] | — |
| Estabilidad del estado cacheado frente a pasada completa | Diferencia máxima de 0,0108 en probabilidad (BF16, v1.1); 0,0097 en una ejecución BF16 anterior | — |
| Temperaturas de calibración | 1.0 en booleano, multietiqueta, elección única y ordenada | No disponible |

El intervalo de confianza de la mejora incluye el cero, por lo que el propio autor indica que la ganancia principal no está establecida estadísticamente. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K y similares) en la información disponible, y no procede extrapolarlos, dado que el modelo no genera texto.

## Requisitos de hardware

- La model card no publica requisitos de VRAM, GPU recomendadas, latencia ni throughput. Las cifras siguientes son estimaciones derivadas del tamaño del modelo base y de la precisión, no datos del autor.
- Estimación de pesos del modelo base en BF16: alrededor de 54 GB solo para los parámetros, más la caché KV del documento precargado (longitud de contexto no disponible). En int8, alrededor de 27 GB de pesos.
- Con esas cifras, un modelo base de 27 000 millones de parámetros en BF16 no cabe en GPU de consumo; en int8 tampoco cabe con holgura en una RTX 4090 de 24 GB.
- GPU recomendadas para la estimación anterior: A100 80 GB o H100 80 GB en BF16; A100 40 GB solo en precisiones reducidas y con contexto corto.
- El adaptador y las cabezas ocupan poco (repositorio de 1,8 GB), pero la inferencia exige cargar el modelo base completo, que no se redistribuye en el repositorio.
- Opciones de despliegue: la model card describe un runtime propio con endpoints HTTP (`POST /states`) y una vinculación de identidad de 21 claves que rechaza cargar si el motor no es el medido. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. Dado que la lectura se hace con cabezas lineales entrenadas en lugar de con la cabeza del modelo de lenguaje, cualquier servidor que se use debe soportar ese esquema de lectura.
- Latencia y throughput: no disponibles. El único dato cuantitativo de rendimiento publicado es la tolerancia numérica del estado cacheado (diferencia máxima de 0,0108 en BF16).

## Comparativa con modelos similares

No se han identificado en la información proporcionada alternativas externas de la misma categoría (adaptadores que devuelvan decisiones estructuradas calibradas en lugar de texto generado). La única comparación disponible es interna, entre versiones del propio modelo.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Solomon v1.1 | Adaptador LoRA r64 sobre Qwen/Qwen3.8-27B | No disponible | 706 de 802 preguntas correctas en panel reservado de 54 documentos | Apache-2.0 | HuggingFace, 0 descargas, 27 likes |
| Solomon v1.0 | Adaptador LoRA r64 sobre Qwen/Qwen3.8-27B | No disponible | 679 de 802 preguntas correctas en el mismo panel | Apache-2.0 | Versión anterior citada en la model card; repositorio propio no disponible |
| Alternativas externas equivalentes | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La mejora principal de v1.1 sobre v1.0 (+3,4 puntos) tiene un intervalo de confianza del 95 % de [-1,3, +7,4], que incluye el cero: el autor declara que la ganancia no está establecida estadísticamente.
- Las etiquetas de evaluación son generadas por IA y no han sido revisadas por humanos. Ninguna cifra de la model card es una tasa de error certificada.
- No es un modelo de conocimiento general, chat, generación ni resumen. Usarlo fuera de la respuesta a preguntas estructuradas sobre documentos no es su propósito declarado.
- No es apto para entornos donde un error sea costoso y no pueda comprobarse. La model card insiste en este punto.
- El modelo devuelve probabilidades, no garantías: una probabilidad alta no equivale a una respuesta correcta verificada.
- Los punteros de evidencia son el resultado de una cabeza experimental de relevancia y deben tratarse como un lugar por donde empezar a leer, no como la justificación de la respuesta.
- La vinculación de identidad de runtime y el rechazo de `head_key` desconocidos implican una dependencia fuerte del motor concreto con el que se midió; portarlo a otro runtime puede requerir revalidación.
- La colocación del adaptador en el lado de la pregunta es parte de la definición del modelo: aplicarlo a toda la secuencia da un modelo distinto del medido.
- El modelo base no se redistribuye en el repositorio, por lo que hay que obtenerlo por separado y respetar su propia licencia.
- El repositorio registra 0 descargas, lo que limita la evidencia de uso externo y de robustez en producción.
- No se declaran idiomas soportados. No hay información sobre sesgos, riesgo de alucinación medido, límites de longitud de contexto ni comportamiento fuera del dominio documental.
- Licencia Apache-2.0: permite uso comercial, pero la licencia cubre el adaptador publicado, no necesariamente los términos de uso del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DoccyHealth/Solomon
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B (revisión fijada `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`)
- Paper, blog, repositorio o demo del autor: no disponibles en la información proporcionada.
- La búsqueda web realizada no devolvió resultados relacionados con el modelo: los únicos enlaces recuperados corresponden a un medio de noticias regional alemán (blick.de) y no guardan relación con Solomon, por lo que se omiten.
