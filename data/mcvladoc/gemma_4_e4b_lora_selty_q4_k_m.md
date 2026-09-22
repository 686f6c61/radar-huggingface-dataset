# mcvladoc/gemma_4_e4b_lora_selty_Q4_K_M

## Resumen

`mcvladoc/gemma_4_e4b_lora_selty_Q4_K_M` es un repositorio de pesos en formato GGUF publicado por el usuario mcvladoc en HuggingFace. Según su model card, el modelo fue convertido a GGUF mediante Unsloth, y el nombre del repositorio indica que se trata de un modelo de la familia Gemma 4 (variante "e4b") al que se le ha aplicado un adaptador LoRA denominado "selty", posteriormente cuantizado a Q4_K_M. Esta lectura procede del identificador y de las etiquetas del repositorio, no de una descripción tecnica explicita del autor, por lo que debe tratarse como una inferencia y no como un dato confirmado.

El repositorio incluye dos ficheros: `gemma-4-e4b-it.BF16-mmproj.gguf` y `gemma-4-e4b-it.Q4_K_M.gguf`. La presencia del fichero `mmproj` (proyector multimodal) y la etiqueta `vision-language-model` indican soporte de entrada de imagenes ademas de texto, mientras que la etiqueta `conversational` y el sufijo `-it` apuntan a un modelo ajustado para dialogo. El recuento real de parametros reportado en safetensors es de 7.518.069.290, es decir, aproximadamente 7,5 mil millones.

La relevancia de esta ficha es limitada en terminos de adopcion: el repositorio registra 0 descargas y 0 likes, no declara licencia ni idiomas soportados, y no incluye documentacion sobre datos de entrenamiento, contexto o evaluaciones. Se trata por tanto de una publicacion de tipo comunitario, util para quien quiera probar el modelo con llama.cpp, pero sin las garantias de trazabilidad que ofrecen las publicaciones oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el identificador y las etiquetas apuntan a la familia Gemma 4 con adaptador LoRA; sin confirmar por el autor) |
| Parametros totales | 7.518.069.290 (aproximadamente 7,5 mil millones) |
| Parametros activos | no disponible (el sufijo "e4b" del identificador sugiere un modelo de tipo "effective 4B", pero no hay confirmacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (fichero `gemma-4-e4b-it.Q4_K_M.gguf`) y BF16 para el proyector multimodal (`gemma-4-e4b-it.BF16-mmproj.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`gguf`, `llama.cpp`, `llama-cpp`) |
| Tamano del repositorio | 6,3 GB |
| Modalidad | texto e imagen (etiqueta `vision-language-model` y fichero `mmproj`) |
| Herramienta de conversion | Unsloth |
| Fecha de creacion | 2026-09-22 |
| Fecha de actualizacion | 2026-09-22 |

## Arquitectura y entrenamiento

No hay informacion publicada por el autor sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF, DPO u otros). Lo unico verificable es que el repositorio contiene pesos en formato GGUF derivados de un modelo base identificado como "gemma-4-e4b-it" y de un adaptador LoRA llamado "selty", y que la conversion fue realizada con las herramientas de Unsloth.

El fichero `BF16-mmproj.gguf` corresponde al proyector multimodal que se usa junto con el modelo de lenguaje para procesar imagenes en llama.cpp; su presencia, junto con la etiqueta `vision-language-model`, es la evidencia de que el modelo acepta entradas visuales. La cuantizacion aplicada al modelo de lenguaje es Q4_K_M, un esquema de cuantizacion de 4 bits con mezcla de precisiones por bloque habitual en llama.cpp. Cualquier afirmacion adicional sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, atencion con ventana deslizante, etc.) seria especulativa y no se incluye.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta `conversational` y el sufijo `-it` del modelo base.
- Procesamiento de imagenes: el repositorio incluye el proyector multimodal `mmproj`, lo que habilita tareas de vision-lenguaje (descripcion de imagenes, preguntas y respuestas sobre imagenes, OCR aproximado) mediante `llama-mtmd-cli`.
- Inferencia local en CPU y GPU a traves de llama.cpp y sus derivados.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que facilita su exposicion como servicio HTTP.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de audio o video: no disponible.
- Matematicas y generacion de codigo: no disponible (no verificado en la informacion proporcionada).

## Casos de uso

- Prototipado local de asistentes conversacionales: el modelo puede ejecutarse en una estacion de trabajo con `llama-cli -hf mcvladoc/gemma_4_e4b_lora_selty_Q4_K_M --jinja`, lo que permite iterar sobre prompts y plantillas de chat sin depender de APIs externas.
- Descripcion automatica de imagenes en lotes pequenos: usando `llama-mtmd-cli` con el fichero `mmproj`, se pueden generar leyendas o resumenes de imagenes para catalogos internos, archivos fotograficos o documentacion tecnica.
- Extraccion de informacion de capturas y documentos escaneados: el componente de vision permite formular preguntas sobre una imagen (por ejemplo, extraer campos de una factura) sin necesidad de un pipeline OCR separado, aunque la precision no esta documentada.
- Asistente de soporte interno con conocimiento especifico: puesto que el nombre del repositorio indica un ajuste LoRA sobre un modelo instruccional, es plausible usarlo para dominios verticales; conviene validar el comportamiento real antes de desplegarlo.
- Evaluacion comparativa de cuantizaciones: sirve para medir la perdida de calidad entre la version BF16 del proyector y el modelo cuantizado a Q4_K_M en tareas de vision-lenguaje.
- Integracion en aplicaciones de escritorio o edge: con un peso cercano a los 4,6 GB en Q4_K_M, el modelo puede empaquetarse dentro de una aplicacion local que requiera procesamiento de texto e imagen sin conexion.
- Base para experimentos de ajuste adicional: al ser un derivado LoRA, puede servir como punto de partida para estudiar tecnicas de fusion de adaptadores y cuantizacion con Unsloth.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, y la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo (los resultados obtenidos no guardan ninguna relacion con el mismo y se descartan por completo).

## Requisitos de hardware

- VRAM estimada para la cuantizacion Q4_K_M: en torno a 5-6 GB, considerando aproximadamente 4,6 GB de pesos (7.518.069.290 parametros a ~4,5 bits por parametro) mas el coste de la cache KV y del proyector multimodal. Estimacion aritmetica, no confirmada por el autor.
- VRAM estimada en BF16: aproximadamente 15 GB solo para los pesos (7.518.069.290 x 2 bytes), mas el `mmproj` y la cache KV. Estimacion aritmetica.
- GPU recomendadas: para Q4_K_M, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 o superiores son suficientes. Para BF16, se requieren tarjetas de 24 GB o mas (RTX 3090, RTX 4090, A100, H100).
- Compatibilidad con GPU de consumo: si, la version Q4_K_M cabe en practicamente cualquier GPU con 8 GB o mas de VRAM, y tambien puede ejecutarse total o parcialmente en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`, `llama-server`), Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no son la via natural para este artefacto, ya que esta publicado unicamente en GGUF.
- Latencia y throughput: no disponible. Dependera por completo del hardware, del numero de capas descargadas a CPU y de la longitud de contexto efectiva, que tampoco se declara.

## Comparativa con modelos similares

La comparativa se plantea a nivel de categoria, ya que los datos del modelo analizado son en su mayoria no disponibles. Los valores de las alternativas son caracteristicas generales conocidas y pueden haber cambiado.

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mcvladoc/gemma_4_e4b_lora_selty_Q4_K_M | 7,52 B (total) | no disponible | texto e imagen | no disponible | GGUF en HuggingFace, 0 descargas |
| Gemma 3 4B IT | ~4 B | 128 K (segun documentacion oficial de la familia) | texto e imagen en las variantes multimodales | licencia Gemma | pesos oficiales y multiples GGUF comunitarios |
| Qwen2.5-VL 7B | ~8 B | 128 K en las variantes largas | texto e imagen | Apache 2.0 en la mayoria de variantes | pesos oficiales y GGUF comunitarios |
| Llama 3.1 8B Instruct | 8 B | 128 K | solo texto | licencia comunitaria de Llama 3.1 | pesos oficiales y amplio ecosistema GGUF |

No se dispone de datos de rendimiento del modelo analizado, por lo que no es posible establecer una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card tecnica, ni descripcion del dataset, ni informacion sobre el proceso de ajuste. Esto impide auditar el modelo.
- Licencia no declarada: sin licencia explicita no se puede asumir permiso de uso comercial. Ademas, al derivar presumiblemente de un modelo de la familia Gemma, heredaria las condiciones de la licencia Gemma, que incluye clausulas de uso aceptable y obligaciones de atribucion.
- Riesgo de alucinacion: no evaluado. Al no existir benchmarks ni evaluaciones publicadas, se desconoce la tasa de error factual.
- Idiomas: no declarados. No se puede garantizar un comportamiento correcto en castellano ni en ningun otro idioma concreto.
- Contexto: no declarado. Planificar aplicaciones que dependan de ventanas largas es arriesgado sin conocer el limite real.
- Trazabilidad del ajuste LoRA: se desconoce que datos se usaron para el adaptador "selty", lo que impide descartar sesgos introducidos en el ajuste o comportamientos no deseados.
- Adopcion nula: 0 descargas y 0 likes. No hay retroalimentacion de la comunidad ni casos de uso verificados.
- Fechas incoherentes: las marcas de creacion y actualizacion (2026-09-22) son posteriores a la fecha habitual de consulta; conviene verificar la fuente antes de citar el repositorio.
- Idoneidad para produccion: baja sin una evaluacion previa. Se recomienda tratar este repositorio como material experimental.
- Uso de `--jinja`: la propia model card indica el flag `--jinja` para el modo conversacional; omitirlo puede degradar la calidad de las respuestas por un formateo incorrecto de la plantilla de chat.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mcvladoc/gemma_4_e4b_lora_selty_Q4_K_M
- Unsloth (herramienta de conversion citada en la model card): https://github.com/unslothai/unsloth
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo y se han descartado.
