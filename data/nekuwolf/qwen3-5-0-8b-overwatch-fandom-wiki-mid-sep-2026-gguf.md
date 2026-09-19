# nekuwolf/Qwen3.5-0.8B-overwatch-fandom-wiki-mid-sep-2026-GGUF

## Resumen

Qwen3.5-0.8B-overwatch-fandom-wiki-mid-sep-2026-GGUF es un ajuste fino (fine-tuning) de un modelo de ~0,77 mil millones de parametros, publicado por el usuario nekuwolf y distribuido exclusivamente en formato GGUF para su uso con llama.cpp. Segun la model card, el ajuste y la conversion a GGUF se realizaron con Unsloth. El nombre del repositorio indica que el entrenamiento se hizo sobre contenido de la wiki de fans de Overwatch en una instantanea ("snapshot") de mediados de septiembre de 2026, y las etiquetas del repositorio lo clasifican como modelo de vision-lenguaje (vision-language-model), con un fichero `BF16-mmproj.gguf` que actua como proyector multimodal.

El modelo esta pensado para inferencia local en hardware muy modesto: sus algo menos de 800 millones de parametros permiten ejecutarlo en CPU o en practicamente cualquier GPU de consumo, incluso integradas. El repositorio incluye tres ficheros: dos cuantizaciones del modelo de lenguaje (`Q8_0` y `Q4_0`) y el proyector multimodal en BF16, con un tamano total de repositorio de 1,6 GB. Segun la model card, se puede usar con `llama-cli` para texto y con `llama-mtmd-cli` para entrada multimodal.

La relevancia de esta ficha es limitada pero concreta: es un ejemplo tipico de "fandom fine-tune", es decir, un modelo pequeno especializado en un dominio cerrado (el universo de Overwatch) que puede desplegarse en local sin coste de API. Conviene advertir desde el principio de que el repositorio no declara licencia, no incluye model card detallada sobre el dataset ni el procedimiento de entrenamiento, no aporta resultados de benchmarks y acumulaba 0 descargas y 0 "likes" en el momento de la consulta, por lo que su calidad real no esta validada por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (las etiquetas del repositorio indican `qwen3_5` y `vision-language-model`; se trata de un transformer multimodal segun esas etiquetas, sin confirmacion documental en la model card) |
| Parametros totales | 772.845.888 (dato real de los pesos en safetensors, ~0,77 B) |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 y Q4_0 (ficheros GGUF); proyector multimodal en BF16 (`BF16-mmproj.gguf`) |
| Idiomas soportados | no disponible (el corpus de ajuste procede, segun el nombre, de una wiki de fans de Overwatch, mayoritariamente en ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 1,6 GB |
| Fecha de creacion | 2026-09-18 |
| Ultima actualizacion | 2026-09-18 |
| Descargas / likes | 0 / 0 |
| Etiquetas declaradas | gguf, qwen3_5, llama.cpp, unsloth, vision-language-model, endpoints_compatible, region:us, conversational |

## Arquitectura y entrenamiento

No hay informacion detallada sobre la arquitectura en la model card mas alla de las etiquetas del repositorio (`qwen3_5`, `vision-language-model`, `llama.cpp`, `unsloth`). Por el nombre del modelo, cabe inferir que se parte de una base de la familia Qwen3.5 en su variante de 0,8 B, pero la existencia de dicha familia y la identidad exacta del modelo base no se confirman en la informacion disponible, por lo que este dato debe tratarse como inferencia a partir del nombre y no como hecho verificado. La presencia de un fichero `mmproj` (proyector multimodal) y la instruccion de usar `llama-mtmd-cli` para modelos multimodales indican que el modelo acepta entrada de imagen ademas de texto, presumiblemente mediante un codificador visual conectado a traves de ese proyector.

Respecto al entrenamiento, la model card solo afirma que el modelo fue ajustado y convertido a GGUF con Unsloth, sin especificar el numero de tokens, la composicion exacta del dataset, la mezcla de datos, ni si hubo etapas de RLHF, DPO u otra alineacion posterior. El identificador del repositorio sugiere que el ajuste se hizo sobre una instantanea de la wiki de fans de Overwatch de mediados de septiembre de 2026, lo que implicaria un ajuste supervisado de dominio sobre texto enciclopedico de esa comunidad. No se documenta si el proyector multimodal fue reentrenado o si se reutilizo tal cual del modelo base, ni si se congelaron capas durante el ajuste. Tampoco se indica el numero de epocas, la tasa de aprendizaje ni la infraestructura empleada.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como `conversational` y la model card muestra su uso con `llama-cli` en modo chat con plantilla Jinja (`--jinja`).
- Conocimiento de dominio sobre Overwatch: al estar ajustado sobre una wiki de fans, cabe esperar respuestas sobre lore, personajes, mapas, habilidades y terminos del juego, aunque el alcance real depende del corpus y no esta documentado.
- Entrada multimodal (imagen + texto): el repositorio incluye un proyector `mmproj` y la model card indica el uso de `llama-mtmd-cli` para modelos multimodales. No se especifica que tipo de tareas visuales cubre.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el modelo puede servirse a traves de la infraestructura de endpoints de HuggingFace, presumiblemente mediante un contenedor compatible con llama.cpp.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; sin benchmarks ni documentacion no puede afirmarse.
- Capacidades multilingues: no disponibles; el corpus de ajuste parece monolingue en ingles.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Asistente de consulta sobre el universo de Overwatch: desplegado en local con `llama-cli` u Ollama, el modelo puede responder preguntas sobre personajes, mapas, eventos y terminologia del juego apoyandose en el corpus de la wiki con el que fue ajustado, sin coste de API ni envio de datos a terceros.
- Bot de comunidad para Discord o foros: al caber en cualquier GPU de consumo y poder ejecutarse tambien en CPU, es viable mantener un bot conversacional siempre activo para resolver dudas de jugadores noveles dentro de una comunidad de fans, con el modelo servido detras de un endpoint compatible.
- Analisis de capturas de pantalla del juego: gracias al proyector multimodal y a `llama-mtmd-cli`, puede emplearse para extraer informacion de imagenes (por ejemplo, describir una composicion de equipo o identificar elementos visibles), una tarea util para herramientas de estadisticas o de contenido para creadores.
- Generacion y reescritura de contenido para wikis: el modelo puede redactar resumenes de articulos, normalizar secciones o generar borradores de entradas siguiendo el estilo enciclopedico del corpus de entrenamiento, con revision humana posterior.
- Base para pipelines RAG sobre documentacion del juego: por su tamano reducido y su bajo coste de inferencia, encaja como generador en un sistema de recuperacion aumentada donde los fragmentos relevantes se recuperan de una base vectorial y el modelo se limita a sintetizar la respuesta.
- Prototipado de fine-tuning con Unsloth en hardware de consumo: sirve como caso de estudio reproducible para probar el flujo completo de ajuste y conversion a GGUF (Q8_0, Q4_0 y mmproj) en una sola GPU de gama media, util en docencia o en validacion de pipelines propios.
- Clasificacion y etiquetado de contenido de fans: puede usarse para categorizar articulos o mensajes por personaje, mapa o tipo de contenido, aprovechando el vocabulario especifico aprendido durante el ajuste.
- Demostracion de inferencia local multimodal: como ejemplo didactico de despliegue de un VLM pequeno con llama.cpp en un portatil, sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de ningun tipo (ni MMLU, ni HumanEval, ni GSM8K, ni evaluaciones de dominio sobre Overwatch), y la busqueda web realizada no devolvio ningun resultado relacionado con el modelo: los unicos resultados obtenidos fueron definiciones de diccionario de la palabra inglesa "private", sin ninguna relacion con este repositorio. Tampoco se dispone de comparaciones publicadas frente a otros ajustes de la misma base.

## Requisitos de hardware

- VRAM estimada para inferencia: partiendo de los 772.845.888 parametros, la cuantizacion Q4_0 ocupa aproximadamente 0,4 GB de pesos y la Q8_0 alrededor de 0,8 GB. Sumando el proyector multimodal en BF16 y la cache KV, un despliegue practico requiere del orden de 1 a 1,5 GB de memoria. Son estimaciones calculadas a partir del numero de parametros y del tamano del repositorio, no mediciones publicadas.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente en la practica (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060, etc.). En el extremo alto, una A100 o una H100 no aportan ventaja alguna para este tamano de modelo salvo por el throughput agregado en despliegues con muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas de los ultimos ocho anos, y tambien en graficos integrados con memoria unificada (iGPU de Intel o AMD) e incluso en CPU sola mediante llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli` para texto, `llama-mtmd-cli` para multimodal), Ollama, LM Studio y cualquier servidor compatible con GGUF. vLLM y TGI no son opciones directas para este repositorio tal como esta publicado, ya que solo contiene pesos GGUF y no safetensors.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia, ni en GPU ni en CPU.
- Almacenamiento: el repositorio completo ocupa 1,6 GB, aunque en la practica basta con descargar uno de los dos ficheros GGUF (Q4_0 o Q8_0) y, si se quiere uso multimodal, el proyector `BF16-mmproj.gguf`.

## Comparativa con modelos similares

Los datos de la columna de este modelo son los declarados en el repositorio; los de los modelos alternativos proceden de sus fichas publicas habituales y se incluyen como referencia de categoria, no como medicion directa contra este ajuste. No existen evaluaciones comparativas publicadas para el modelo analizado.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-overwatch-fandom-wiki-mid-sep-2026-GGUF | 772.845.888 | no disponible | no disponible | Ajuste de dominio sobre wiki de Overwatch, multimodal, solo GGUF | HuggingFace, 0 descargas |
| Qwen2.5-0.5B / 1.5B (Instruct) | 0,49 B / 1,54 B | 32.768 tokens | Apache 2.0 | Modelo generalista de proposito multiple | Ampliamente disponible, con versiones GGUF de la comunidad |
| Llama 3.2 1B (Instruct) | 1,24 B | 128.000 tokens | Licencia comunitaria Llama 3.2 | Modelo generalista, con variantes multimodales en la familia | Muy disponible, ecosistema GGUF amplio |
| SmolLM2 1.7B (Instruct) | 1,7 B | 8.192 tokens | Apache 2.0 | Modelo generalista pequeno, enfocado a eficiencia | Disponible en safetensors y GGUF |

La diferencia fundamental no esta en los parametros, sino en el proposito: los tres modelos de referencia son generalistas y estan documentados con licencia y benchmarks publicos, mientras que el modelo analizado es un ajuste especializado de dominio, sin licencia declarada, sin evaluaciones y sin garantias de mantenimiento. Para una tarea de dominio cerrado, el ajuste puede ser mas preciso; para cualquier uso general, la ausencia de informacion hace preferibles las alternativas documentadas.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica ninguna licencia. En ausencia de terminos explicitos, no puede asumirse permiso para uso comercial ni para redistribucion, y el riesgo legal recae sobre quien lo despliegue. Conviene contactar con el autor antes de cualquier uso en produccion.
- Model card minima: no se documentan el dataset exacto, el numero de tokens, la receta de entrenamiento, el modelo base ni el tratamiento del proyector multimodal. Esto impide auditar el modelo y hace imposible reproducir el ajuste.
- Sin validacion por terceros: 0 descargas y 0 "likes" en el momento de la consulta. No hay evidencia externa de calidad, y los errores no han sido reportados ni corregidos.
- Riesgo de alucinacion elevado en detalles de dominio: con menos de 800 millones de parametros, el modelo puede inventar nombres de personajes secundarios, fechas de eventos, cifras de dano o detalles de mapas. Para un asistente de lore, esto es especialmente problematico porque las respuestas incorrectas son plausibles y dificiles de detectar sin verificar contra la fuente.
- Sobreajuste al corpus de la wiki: al tratarse de un ajuste de dominio, es probable que el modelo pierda parte de la capacidad general del modelo base y que rinda mal en tareas genericas de razonamiento, matematicas o codigo.
- Corte temporal del corpus: la instantanea de datos corresponde a mediados de septiembre de 2026 segun el nombre del repositorio, de modo que no cubre contenido posterior de la wiki ni actualizaciones del juego.
- Incertidumbre sobre el modelo base: la existencia de una familia "Qwen3.5" y la procedencia exacta de la base de 0,8 B no se confirman en la informacion disponible; el nombre del repositorio es la unica fuente y es una inferencia, no un dato verificado.
- Alcance multimodal sin especificar: aunque el repositorio incluye un proyector multimodal, no se detalla que tareas visuales soporta ni si el proyector fue ajustado o heredado del modelo base. No debe asumirse un rendimiento de OCR o de descripcion de imagenes sin pruebas previas.
- Idiomas no declarados: si el corpus de ajuste es mayoritariamente en ingles, el rendimiento en castellano puede degradarse notablemente, especialmente en terminologia especifica del juego.
- Perdida por cuantizacion: las dos unicas cuantizaciones publicadas son Q8_0 y Q4_0. La Q4_0, al ser una cuantizacion heredada y no una variante K-quant o I-quant mas moderna, suele degradar mas la calidad que alternativas como Q4_K_M; si se necesita maxima fidelidad, hay que usar Q8_0.
- Dependencia de llama.cpp: al publicarse unicamente en GGUF, el modelo no es directamente utilizable con vLLM, TGI o frameworks de entrenamiento que esperan safetensors. Esto limita su integracion en infraestructuras de servido de alto throughput.
- Fechas de publicacion: el repositorio fue creado y actualizado el 2026-09-18, con apenas un minuto de diferencia entre ambos eventos, lo que sugiere una publicacion sin iteraciones ni revisiones posteriores.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nekuwolf/Qwen3.5-0.8B-overwatch-fandom-wiki-mid-sep-2026-GGUF
- Unsloth (herramienta declarada para el ajuste y la conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime necesario para los ficheros GGUF y para `llama-mtmd-cli`): https://github.com/ggml-org/llama.cpp
- Wiki de fans de Overwatch (fuente probable del corpus de ajuste, inferida a partir del nombre del repositorio, no confirmada por el autor): https://overwatch.fandom.com
- Nota sobre la busqueda web: no se han encontrado articulos, papers, blogs ni demos relacionados con este modelo. Los resultados devueltos por la busqueda fueron definiciones de diccionario de la palabra inglesa "private" y no guardan ninguna relacion con el repositorio.
