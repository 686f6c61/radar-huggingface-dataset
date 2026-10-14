# ericthewiz/humanizer

## Resumen

humanizer es un ajuste fino del modelo google/gemma-4-12B (11.959.730.224 parámetros, ~12B) especializado en una única tarea: reescribir borradores redactados por IA (correos, ensayos, informes, publicaciones de foro) para que se lean como escritos por una persona. Lo publica el usuario ericthewiz en HuggingFace bajo licencia apache-2.0, con pesos en safetensors (bf16) y cuantizaciones GGUF, y está pensado para ejecutarse en local, sin conexión y sin servicios en la nube. Los idiomas documentados son inglés y chino.

El problema que aborda es concreto y medible: los textos generados por modelos suelen delatarse ante detectores de IA y ante lectores humanos por su estilo uniforme, y las reescrituras automáticas tienden a alterar cifras, unidades, fechas, nombres y citas. El modelo se entrena explícitamente para conservar esos elementos y no añadir información nueva. Según la model card, el 95% de 210 reescrituras en inglés fueron clasificadas como humanas por Originality.ai en su ajuste más estricto, y 376 de 420 reescrituras en inglés no presentaron ningún problema factual detectado por un juez LLM.

Es relevante ahora porque combina tres piezas poco habituales en modelos de reescritura: despliegue local con una app de escritorio y una CLI para documentos largos, cuantizaciones de 2 a 3 bits optimizadas con mezcla de precisión por tensor, entrenamiento consciente de cuantización y destilación desde el modelo bf16, y datos de evaluación publicados junto a los ficheros que el usuario descarga. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y fue creado y actualizado el mismo día (2026-10-14), por lo que no existe validación independiente de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ajuste fino de google/gemma-4-12B; etiquetado como gemma4_unified decodificador transformer (no se detalla en la model card); tags incluyen image-text-to-text |
| Parametros totales | 11.959.730.224 (~12B), segun metadatos de safetensors |
| Parametros activos | No aplica (no se indica que sea MoE; se trata como modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en 2 bits, Q3, Q4_K_M, Q6_K y Q8_0; pesos completos en bf16 (safetensors). Los ficheros de 2 bits, Q3 y Q4_K_M usan mezcla de precision por tensor, entrenamiento consciente de cuantizacion y destilacion desde el modelo bf16 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | apache-2.0 (declarada en la model card y en los metadatos del repositorio) |
| Formato de pesos | safetensors (bf16) y GGUF (llama.cpp) |
| Tamano del repositorio | 87,6 GB |
| Libreria declarada | gguf |
| Pipeline | text-generation |
| Modelo base | google/gemma-4-12B (relacion: finetune) |
| Fecha de publicacion | 2026-10-14 (creado y actualizado el mismo dia) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base mas alla de identificarlo como google/gemma-4-12B y etiquetarlo con gemma4_unified y con la pipeline image-text-to-text en los tags. Los parametros totales reales, medidos sobre los safetensors, son 11.959.730.224. No se indica que sea una arquitectura MoE, por lo que se trata como un transformer denso de ~12B. El ajuste es especifico de tarea: reescritura y transferencia de estilo con preservacion de hechos, en ingles y chino, y el autor afirma que no se uso ningun detector de IA en ninguna fase del entrenamiento. No se publican el numero de tokens de entrenamiento ni la composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento.

La innovacion tecnica documentada esta en el proceso de cuantizacion. En lugar de una unica pasada estandar de llama-quantize, los ficheros de 2 bits, Q3 y Q4_K_M se construyen en tres etapas: primero se mide la sensibilidad de cada tensor de pesos a la compresion y se asignan mas bits a los tensores sensibles y menos a los robustos; despues se aplica entrenamiento consciente de cuantizacion capa por capa para reproducir el modelo completo; y por ultimo se destila desde el modelo bf16 usado como profesor, sobre datos de reescritura en ingles y chino. El resultado del proceso, medido como acuerdo top-1 con bf16, pasa del 70% de una compilacion estandar de 2 bits al 81% (mezcla de bits), 85% (entrenamiento consciente de cuantizacion) y 87% (destilacion), en un fichero de 3,9 GB. Los ficheros Q6_K y Q8_0 son compilaciones estandar de llama.cpp, porque segun el autor no queda margen de recuperacion apreciable en esos tamanos. Todos los GGUF son compatibles con versiones recientes de llama.cpp.

## Capacidades

- Reescritura de textos generados por IA para reducir las marcas estilisticas tipicas de los modelos, en generos como correos de trabajo, ensayos, informes y publicaciones de foro.
- Transferencia de estilo y parafraseo controlado, con instruccion explicita de conservar cada numero, unidad, fecha, nombre y cita y de no anadir contenido nuevo.
- Procesamiento de documentos largos mediante la CLI `hz`: conserva titulares, bloques de codigo, tablas y enlaces, y reescribe solo la prosa, pieza a pieza.
- Entrada de ficheros `.txt`, `.md` y `.docx` desde la linea de comandos, y `.docx` y PDF desde la aplicacion de escritorio (version 0.3.2).
- Marca de fragmentos como "Create fact" en la aplicacion, que se mantienen palabra por palabra sin reescribir.
- Soporte bilingue documentado: ingles y chino.
- Ejecucion 100% local y sin conexion una vez descargado el modelo, con seleccion automatica del tamano de cuantizacion segun la memoria disponible.
- Capacidad multimodal: los tags del repositorio incluyen image-text-to-text y gemma4_unified, pero la model card no documenta ninguna tarea de vision para este ajuste; conviene tratarlo como no confirmado.
- Tool calling o function calling: no disponible en la informacion proporcionada.
- Uso desde agentes de codigo: el repositorio incluye un AGENTS.md con ficheros exactos, comando de servidor, prompt literal y una autoprueba.

## Casos de uso

- Correos de trabajo: el modelo reescribe un borrador generado por IA manteniendo fechas, cifras y nombres de destinatarios, y lo hace en local, de modo que el contenido confidencial del correo nunca sale del equipo. Es adecuado porque su objetivo de entrenamiento es precisamente no alterar datos ni anadir nada.
- Informes y memorandos internos: se puede integrar en un flujo de revision previa al envio para dar un tono menos uniforme a documentos densos, conservando tablas y listas si se usa la CLI sobre Markdown.
- Documentacion tecnica y publicaciones de blog: el modo documento de la CLI preserva titulares, bloques de codigo, tablas y enlaces, y reescribe solo la prosa, lo que permite humanizar un README o un articulo sin romper su estructura.
- Publicaciones en foros y comunidades (por ejemplo respuestas en Zhihu, citadas en el README): utiles cuando se quiere que una respuesta generada con asistencia de IA no destaque por su estilo, manteniendo el contenido tecnico.
- Comunicacion externa y atencion al cliente: para redactar respuestas y avisos con un registro mas natural en ingles o chino, siempre con revision humana, dado que el modelo no esta documentado para conversaciones multi-turno de agente ni para tool calling.
- Post-procesado dentro de una plataforma de generacion de contenido: encadenar un modelo generador con humanizer como etapa final de estilo, usando llama-server o la CLI, antes de la publicacion.
- Textos academicos o divulgativos que citan fuentes: la instruccion de conservar citas y la marca "Create fact" de la aplicacion permiten fijar los pasajes que no deben tocarse y reescribir el resto.
- Adaptacion de material entre ingles y chino: reescritura en el idioma de destino para equipos que publican el mismo contenido en ambos mercados, con la limitacion de que solo estos dos idiomas estan soportados.

## Benchmarks y rendimiento

Datos publicados por el autor. No hay resultados de MMLU, HumanEval, GSM8K ni de otras suites estandar en la informacion disponible.

| Evaluacion | Conjunto y condiciones | Resultado |
|---|---|---|
| Detector Originality.ai, ajuste mas estricto | 210 borradores en ingles, pesos bf16, 2026-10-02 | 95% de las reescrituras juzgadas como humanas; 11 de 210 marcadas como IA, frente a 26 en la version anterior |
| Juez LLM estricto de hechos | 420 reescrituras en ingles, fichero humanizer-12b-Q8_0.gguf | 376 sin ningun problema factual; 44 con alguna marca, 135 problemas en total y 125 de ellos una sola palabra o frase |
| Acuerdo top-1 con bf16, cuantizacion 2 bits | Compilacion estandar de llama.cpp | 70% |
| Acuerdo top-1 con bf16, 2 bits con mezcla de precision por tensor | Optimizacion propia, paso 1 | 81% |
| Acuerdo top-1 con bf16, 2 bits tras entrenamiento consciente de cuantizacion | Paso 2 | 85% |
| Acuerdo top-1 con bf16, 2 bits tras destilacion del profesor bf16 | Paso 3, fichero de 3,9 GB | 87% |

El autor advierte que los ejemplos de antes y despues de la model card son selecciones: de cada borrador se generaron 8 muestras y se eligio la mejor de las que pasaron el juez de hechos. Los resultados en chino, el detalle por genero y la metodologia completa no estan incluidos en la informacion proporcionada.

## Requisitos de hardware

- La aplicacion de escritorio propone uno de cinco tamanos (Q8_0, Q6_K, Q4_K_M, Q3 o 2 bits) segun la memoria del equipo y funciona en maquinas desde 8 GB, segun la model card. Es la unica cifra de memoria minima publicada por el autor.
- El fichero de 2 bits ocupa 3,9 GB, dato confirmado en la grafica de cuantizacion.
- Estimaciones derivadas del tamano de un modelo denso de ~12B (no publicadas por el autor): el fichero Q4_K_M ronda los 7-8 GB en disco, Q6_K los 10 GB y Q8_0 los 12-13 GB, a los que hay que sumar el overhead de contexto en memoria. Un 2 bits cabe con holgura en GPU de 8 GB o en Apple Silicon de 8-16 GB unificados; Q4_K_M encaja en GPUs de 12-16 GB (RTX 4070 Ti, 4080, 4090) y Q8_0 requiere 16-24 GB (RTX 4090, A5000, L40S).
- GPU de datacenter (A100, H100) no son necesarias para este modelo; su uso previsto es local en equipos de consumo.
- Opciones de despliegue documentadas: la aplicacion oficial para macOS arm64 (`.dmg`) y Windows x64 (instalador), y llama.cpp o llama-server a traves de la CLI `hz`, instalable con `pipx install git+https://github.com/sgaofen/humanizer-local-model`. Los GGUF funcionan con cualquier llama.cpp reciente.
- vLLM, TGI, Ollama y otros servidores no se mencionan en la informacion disponible.
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

No se han encontrado en la informacion proporcionada otros modelos de humanizacion o reescritura comparables con datos verificables, por lo que la comparacion de rendimiento queda no disponible. La unica referencia directa es el modelo base del que deriva.

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ericthewiz/humanizer | ~12B | no disponible | Reescritura y humanizacion de borradores en ingles y chino, con preservacion de hechos | apache-2.0 | HuggingFace (safetensors y GGUF); repositorio con 0 descargas y 0 likes |
| google/gemma-4-12B | ~12B | no disponible | Modelo base multimodal de proposito general | no disponible en esta informacion | Modelo base referenciado en la model card |
| jialinyyzz/humanizer-GGUF | ~12B | no disponible | Mismos ficheros GGUF que este modelo, alojados en un repositorio aparte | no disponible | HuggingFace |
| Otras alternativas de humanizacion | no disponible | no disponible | no disponible | no disponible | No se han identificado en la informacion proporcionada |

## Limitaciones y advertencias

- Riesgo factual medido y no nulo: 44 de cada 420 reescrituras en ingles recibieron alguna marca de un juez LLM estricto, con 135 problemas contabilizados, de los que 125 eran una sola palabra o frase. El propio autor recomienda leer el resultado antes de enviarlo, sobre todo numeros, fechas y nombres.
- Los ejemplos de la model card son selecciones de 8 muestras por borrador, no resultados medios; no deben tomarse como rendimiento esperado en un caso concreto.
- El 95% de reescrituras juzgadas como humanas corresponde a un unico detector (Originality.ai) en su ajuste mas estricto sobre 210 borradores en ingles. No hay garantia de pasar otros detectores ni de que ese porcentaje se mantenga en otros dominios o idiomas.
- Idiomas: solo ingles y chino estan documentados. El castellano no aparece como idioma soportado, por lo que su uso en espanol no esta validado.
- Longitud de contexto no publicada. La CLI procesa los documentos "pieza a pieza", lo que implica que la coherencia global de un documento largo depende de la segmentacion y no de una ventana de contexto amplia verificada.
- Es un modelo de tarea especifica: no hay evidencia de soporte de tool calling, razonamiento multi-paso, generacion de codigo ni agentes conversacionales. Su uso como sustituto de un modelo general no esta respaldado por datos.
- La model card declara licencia apache-2.0, pero se trata de un ajuste fino de un modelo base de la familia Gemma. Conviene verificar los terminos aplicables del modelo base antes de un uso comercial, ya que la informacion proporcionada no detalla esa compatibilidad.
- Discrepancia de procedencia: el repositorio de HuggingFace esta publicado por el usuario ericthewiz, mientras que todos los enlaces de la model card apuntan a la organizacion sgaofen (GitHub) y a jialinyyzz (GGUF). No hay explicacion de esta relacion en la informacion disponible.
- Sin validacion de la comunidad: 0 descargas, 0 likes y fecha de creacion identica a la de actualizacion.
- Capacidad multimodal no confirmada: los tags incluyen image-text-to-text, pero la model card no documenta ninguna funcionalidad de vision en este ajuste.
- No se publican sesgos conocidos, composicion del dataset de entrenamiento ni proceso de alineamiento, lo que limita cualquier evaluacion de riesgos.
- Los resultados oficiales solo cubren el ingles; los datos en chino se mencionan pero no se incluyen en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ericthewiz/humanizer
- Ficheros GGUF en HuggingFace: https://huggingface.co/jialinyyzz/humanizer-GGUF
- Repositorio en GitHub: https://github.com/sgaofen/humanizer-local-model
- Aplicacion macOS (Apple silicon), version 0.3.2: https://github.com/sgaofen/humanizer-local-model/releases/download/app-v0.3.2/Humanizer-0.3.2-macos-arm64.dmg
- Aplicacion Windows x64, version 0.3.2: https://github.com/sgaofen/humanizer-local-model/releases/download/app-v0.3.2/Humanizer-0.3.2-windows-x64-setup.exe
- Ultima release: https://github.com/sgaofen/humanizer-local-model/releases/latest
- Uso sin la aplicacion (ingles): https://github.com/sgaofen/humanizer-local-model/blob/main/USAGE.md
- Uso sin la aplicacion (chino): https://github.com/sgaofen/humanizer-local-model/blob/main/USAGE.zh.md
- Guia para agentes de codigo: https://github.com/sgaofen/humanizer-local-model/blob/main/AGENTS.md
- Guia de instalacion: https://github.com/sgaofen/humanizer-local-model/blob/main/docs/INSTALL.md
- Documentacion de cuantizacion: https://github.com/sgaofen/humanizer-local-model/blob/main/docs/QUANTIZATION.md
- README en chino: https://github.com/sgaofen/humanizer-local-model/blob/main/README.zh.md
- Salidas de evaluacion, 8 muestras por borrador en Q8_0: https://github.com/sgaofen/humanizer-local-model/blob/main/eval/outputs/examples-12b-Q8_0_x8.json
- Modelo base: google/gemma-4-12B
