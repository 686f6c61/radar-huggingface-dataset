# shimonkolodny/lashon-hara-detect

## Resumen
Lashon hara detect es una familia de seis modelos de clasificacion de texto publicada por el usuario shimonkolodny en HuggingFace. Su tarea es identificar lashon hara (habla difamatoria dentro del marco de la halaja) en texto que aparece en pantalla, devolviendo una de dos etiquetas: `lashon_hara` o `not_lashon_hara`. La familia se organiza en seis carpetas con pesos independientes: `pc`, `flash`, `mobile-lite`, `mobile-legacy`, `server` y `server-small`, cada una orientada a un perfil de hardware distinto, desde moviles de baja potencia hasta servidores de alto volumen.

El modelo trabaja en ingles y hebreo y esta pensado para textos que van desde mensajes cortos de chat hasta correos electronicos largos. Ademas de la clasificacion binaria, la model card destaca la capacidad de distinguir lashon hara real de casos que se le parecen pero estan permitidos: criticas constructivas directas, advertencias para proteger a alguien de un daño (to'eles), referencias honestas y discusion de las propias normas.

Es relevante ahora porque plantea un despliegue por capas de un mismo criterio de decision con costes de computo muy distintos, lo que permite integrar el filtro tanto en un escritorio como en un servicio de moderacion por lotes. El repositorio ocupa 3,1 GB en total y los pesos se publican en formato safetensors. La model card insiste en que es una ayuda de cribado y no un dictamen halajico: las preguntas reales debe resolverlas un rav.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica si es un transformer codificador, un clasificador sobre embeddings o un modelo derivado de un LLM) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible; no se indica que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se documentan pesos en safetensors; no hay variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ingles y hebreo, segun la model card |
| Licencia | other, con esquema per-folder: Apache 2.0 para `pc`, `mobile-legacy`, `server` y `server-small`; LFM Open License v1.0 para `flash` y `mobile-lite` |
| Formato de pesos | safetensors |
| Pipeline declarado | text-classification |
| Etiquetas de salida | `lashon_hara`, `not_lashon_hara` |
| Variantes incluidas | pc, flash, mobile-lite, mobile-legacy, server, server-small |
| Tamaño del repositorio | 3,1 GB (las seis carpetas en conjunto) |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creación | 2026-10-16 |
| Última actualización | 2026-10-16 |

## Arquitectura y entrenamiento
La model card no describe la arquitectura interna de ninguna de las seis variantes: no se indica si son transformers codificadores, clasificadores sobre representaciones vectoriales con una cabeza lineal o modelos derivados de un LLM. Tampoco se publican el numero de parametros, la longitud de contexto, el volumen de tokens de entrenamiento ni la composicion del dataset. No hay informacion sobre si se aplico ajuste por instrucciones, RLHF, DPO u otra tecnica de alineamiento; en un clasificador de dos clases el procedimiento habitual seria un ajuste supervisado sobre datos etiquetados, pero no se confirma.

Lo unico documentado es la organizacion en seis variantes y su objetivo de hardware. El orden de capacidad que sugiere la propia documentacion va de `mobile-lite` (la mas rapida, sin necesidad de GPU) a `server` (la mas grande), con `flash` y `server-small` como puntos intermedios segun el equilibrio deseado entre velocidad y calidad de juicio. La documentacion no menciona innovaciones tecnicas como decodificacion especulativa, atencion lineal o arquitecturas hibridas, y el repositorio solo declara el tag safetensors como formato de pesos. Toda la informacion sobre el pipeline de entrenamiento esta, por tanto, no disponible.

## Capacidades
- Clasificacion binaria de texto con dos etiquetas: `lashon_hara` y `not_lashon_hara`.
- Deteccion de lashon hara en texto mostrado en pantalla, con cobertura declarada desde mensajes cortos de chat hasta correos electronicos largos.
- Distincion de casos limite permitidos: critica constructiva directa, advertencias destinadas a proteger a alguien de un daño (to'eles), referencias honestas y discusion de las propias normas.
- Cobertura de dos idiomas: ingles y hebreo.
- Seis variantes con el mismo contrato de salida, lo que permite intercambiarlas sin modificar el codigo de integracion.
- No se documenta soporte de tool calling ni function calling, uso agentico, razonamiento multi-paso, vision, audio ni modo de pensamiento explicito.

## Casos de uso
- Moderacion de comentarios y chats en comunidades: ejecutar la variante `server-small` o `server` sobre el flujo de mensajes entrantes y marcar automaticamente las publicaciones candidatas a revision humana, aprovechando que la model card situa `server-small` como opcion por defecto para servicios con trafico estable.
- Filtrado en cliente antes de enviar: la variante `mobile-lite` permite cribar texto sin GPU en hardware antiguo, lo que habilita un aviso previo al usuario en un cliente de mensajeria de escritorio o en equipos de bajos recursos.
- Revision de correos largos: `pc` esta descrito como fuerte en casos sutiles y correos largos, de modo que encaja en un asistente que analiza el cuerpo completo de un email antes de reenviarlo o publicarlo.
- Cribado interactivo en portatiles: `flash` esta pensado para uso interactivo en una GPU modesta o un portatil reciente, adecuado para un complemento de navegador que evalúe texto mientras se redacta.
- Procesamiento por lotes de archivos historicos: `server` esta orientado a servidores y pipelines de alto volumen, escenario tipico de clasificacion masiva de documentos ya almacenados.
- Priorizacion de colas de revision editorial: el modelo puede pre-etiquetar el contenido y ordenar la cola por probabilidad, dejando la decision final al moderador humano.
- Control de calidad en materiales de formacion: detectar lashon hara en foros de estudio o apuntes antes de su publicacion, aprovechando la distincion entre critica constructiva y difamacion.
- Continuidad de integraciones existentes: `mobile-legacy` se mantiene por compatibilidad, lo que permite conservar una integracion ya desplegada sin cambios de codigo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, F1 ni comparaciones numericas con otros sistemas, y las descripciones de cada variante son cualitativas (por ejemplo, "fuerte en casos sutiles" o "cercano en juicio al modelo mayor") sin cifras asociadas.

## Requisitos de hardware
- El repositorio completo ocupa 3,1 GB, pero no se publica el tamaño individual de cada carpeta, por lo que no es posible estimar la VRAM por variante a partir de la informacion disponible.
- `pc`: descrito por el autor para una estacion de trabajo o una GPU moderna individual.
- `flash`: GPU modesta o portatil reciente, orientado a uso interactivo.
- `mobile-lite`: la variante mas rapida, para hardware antiguo y de baja potencia, con cribado casi en tiempo real sin GPU.
- `mobile-legacy`: modelo compacto anterior, mantenido por compatibilidad.
- `server`: la variante mas grande, para servidores, cribado por lotes y pipelines de alto volumen.
- `server-small`: variante de servidor mas ligera, cercana en juicio a la mayor, descrita como buena opcion por defecto para servicios con trafico estable.
- No se publican cifras de latencia ni de throughput para ninguna de las variantes.
- Opciones de despliegue: al tratarse de un pipeline text-classification con pesos safetensors, la via natural es la pipeline de transformers; tambien son razonables ONNX Runtime o un servicio de inferencia que soporte clasificacion de texto. No se documentan integraciones con llama.cpp, Ollama, vLLM ni TGI en la informacion disponible.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no identifica modelos comparables de deteccion de lashon hara ni ofrece metricas frente a alternativas de clasificacion de contenido.

## Limitaciones y advertencias
- Herramienta de cribado, no un dictamen halajico: la propia model card indica que un rav debe decidir las cuestiones reales.
- Licencia no uniforme: `pc`, `mobile-legacy`, `server` y `server-small` son Apache 2.0, pero `flash` y `mobile-lite` estan bajo la LFM Open License v1.0, cuyos terminos deben revisarse antes de cualquier uso comercial.
- Idiomas limitados a ingles y hebreo; no se documenta cobertura de otras lenguas.
- Ausencia de benchmarks publicos: no se pueden cuantificar las tasas de falsos positivos y falsos negativos.
- Riesgo de error en casos limite: las categorias permitidas (critica constructiva, to'eles, referencias honestas, discusion de las normas) dependen del contexto, y un clasificador de texto puede fallar cuando ese contexto no esta presente en el fragmento analizado.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en documentos muy largos mas alla de la afirmacion cualitativa sobre correos largos.
- Sin traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa independiente.
- No se documenta el tratamiento de datos personales, la composicion del dataset de entrenamiento ni posibles sesgos.
- El tag `region:us` y la fecha de creacion de 2026-10-16 aparecen tal cual en los metadatos del repositorio; no se aporta informacion adicional sobre procedencia de los datos.

## Enlaces
- Repositorio principal: https://huggingface.co/shimonkolodny/lashon-hara-detect
- Seccion de licencias: https://huggingface.co/shimonkolodny/lashon-hara-detect#licenses
- Carpeta de la variante alta precision: https://huggingface.co/shimonkolodny/lashon-hara-detect/tree/main/pc
- Carpeta de la variante rapida: https://huggingface.co/shimonkolodny/lashon-hara-detect/tree/main/flash
- Carpeta de la variante movil ligera: https://huggingface.co/shimonkolodny/lashon-hara-detect/tree/main/mobile-lite
- Carpeta de la variante movil heredada: https://huggingface.co/shimonkolodny/lashon-hara-detect/tree/main/mobile-legacy
- Carpeta de la variante de servidor: https://huggingface.co/shimonkolodny/lashon-hara-detect/tree/main/server
- Carpeta de la variante de servidor ligera: https://huggingface.co/shimonkolodny/lashon-hara-detect/tree/main/server-small
