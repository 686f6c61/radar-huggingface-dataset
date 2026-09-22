# sakamakismile/MiMo-V2.6-Distill-Qwen-9B-GGUF

## Resumen

MiMo-V2.6-Distill-Qwen-9B-GGUF es una cuantización de terceros del modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, publicado por Xiaomi, convertida al formato GGUF por el usuario sakamakismile (cuantizado por Lna-Lab / Tonoken3). El objetivo es hacer ejecutable en hardware de consumo un modelo de 8.953.803.264 parámetros (8,95 B) que en safetensors ocupa unos 18 GB, reduciéndolo a un único fichero de 5,4 GB en cuantización Q4_K_M que requiere alrededor de 6 GB de memoria para funcionar. El repositorio incluye además un proyector multimodal opcional de 918 MB que habilita la entrada de imágenes.

El modelo conserva la etiqueta de pipeline image-text-to-text y está orientado a un público principiante: la propia model card está redactada en japonés para estudiantes de secundaria que quieren ejecutar IA en local por primera vez. Soporta japonés e inglés, funciona sin conexión a internet y se apoya en llama.cpp, con versiones de septiembre de 2026 o posteriores, ya que la arquitectura base se identifica como Qwen3.5 y las compilaciones antiguas no pueden cargar el fichero.

Su relevancia actual es doble: por un lado, demuestra que un modelo multimodal de casi 9 B puede caber en una GPU de 6-8 GB de VRAM con velocidades de generación de 38 a 42 tokens por segundo; por otro, es un repositorio muy reciente y con validación comunitaria mínima (0 descargas y 2 likes en el momento de la consulta), por lo que debe tratarse como una conversión experimental y no como un artefacto de producción consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; el autor etiqueta el modelo como basado en Qwen3.5 y exige una version de llama.cpp posterior a septiembre de 2026 para cargarlo |
| Parametros totales | 8.953.803.264 (8,95 B) segun los pesos originales en safetensors |
| Parametros activos | no aplica (no se documenta que sea un modelo MoE) |
| Longitud de contexto | no disponible como maximo oficial; el autor documenta pruebas con --ctx-size 32768 y cache KV en q8_0, y limita a 2048 en ejecucion solo con CPU |
| Tipos de cuantizacion | Q4_K_M para los pesos del modelo; F16 para el proyector multimodal (mmproj) |
| Idiomas soportados | japones (ja) e ingles (en) |
| Licencia | other / see-original-model, heredada del modelo base; requiere revisar los terminos de XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano de los ficheros | 5,4 GB (MiMo-V2.6-Distill-Qwen-9B-Q4_K_M.gguf) y 918 MB (mmproj-MiMo-V2.6-Distill-Qwen-9B-F16.gguf) |
| Tamano del repositorio | 6,5 GB |
| Modelo base | XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (relacion: quantized) |
| Tipo de pipeline | image-text-to-text (conversacional, tag endpoints_compatible) |
| Fecha de creacion y ultima actualizacion | 22 de septiembre de 2026 en ambos casos |
| Descargas y likes | 0 descargas, 2 likes |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni sobre si el modelo base paso por fases de RLHF o DPO. Lo unico documentado es que el modelo original fue publicado por Xiaomi, que su nombre indica una destilacion sobre una base de la familia Qwen y que el autor de la cuantizacion lo etiqueta con la etiqueta qwen3.5, lo que implica una arquitectura lo bastante reciente como para requerir soporte especifico en llama.cpp. El repositorio es una conversion de pesos, no un reentrenamiento: no hay informacion sobre modificaciones de arquitectura, decodificacion especulativa ni tecnicas de atencion alternativa.

La innovacion tecnica relevante en este repositorio es la propia cuantizacion. El autor reduce los pesos a 4 bits con el esquema Q4_K_M, que en la practica deja el cuerpo del modelo en 4.812 MiB de VRAM, y mantiene el proyector multimodal en F16 como fichero separado. Segun las mediciones publicadas, con cache KV en f16 el modelo y 8.192 tokens de contexto ocupan aproximadamente 5,2 GB en total, mientras que las sesiones largas se plantean con cache KV cuantizada a q8_0. El autor tambien documenta que el modelo tiende a entrar en bucles de repeticion y que este comportamiento se corrige parcialmente con penalizacion de repeticion 1.1 sobre las ultimas 256 posiciones, lo que sugiere un ajuste fino orientado a generacion larga y sensible a la decodificacion.

## Capacidades

- Generacion de texto conversacional multi-turno en japones e ingles, con plantilla de chat procesada mediante la opcion --jinja de llama.cpp, que el autor marca como obligatoria.
- Comprension de imagenes cuando se descarga el proyector mmproj de 918 MB y se usa el binario llama-mtmd-cli; sin ese fichero, el modelo funciona solo con texto.
- Ejecucion local completamente sin conexion: una vez descargados los ficheros, no se envia ningun dato a servicios externos.
- Servicio como API local: llama-server expone un endpoint HTTP en 127.0.0.1:8080, y el repositorio lleva la etiqueta endpoints_compatible, lo que permite integrarlo en aplicaciones existentes como si fuera un endpoint remoto.
- Soporte de contexto relativamente largo en GPU: el autor valida configuraciones de hasta 32.768 tokens con cache KV en q8_0.
- Ajuste de muestreo documentado: temperatura 0.6, top-p 0.95 y top-k 20 como valores de referencia del autor.
- No hay informacion disponible sobre tool calling o function calling.
- No hay informacion disponible sobre uso en agentes ni razonamiento multi-paso.
- No hay informacion disponible sobre modo de razonamiento explicito (thinking mode).
- No hay informacion disponible sobre capacidades especificas de codigo o matematicas.
- El soporte multilingue se limita a los idiomas declarados (ja, en); no hay datos sobre otros idiomas.

## Casos de uso

- Asistente conversacional local con datos sensibles: al ejecutarse integramente en el equipo del usuario, permite mantener conversaciones con informacion confidencial sin que el texto salga de la maquina, algo relevante en entornos con requisitos de proteccion de datos.
- Atencion al cliente en japones con historiales largos: la configuracion validada de 32.768 tokens de contexto permite arrastrar conversaciones multi-turno extensas y documentacion de referencia sin truncar el historial.
- Descripcion y clasificacion de imagenes en local: con el proyector mmproj, el modelo puede recibir capturas de pantalla, fotografias o documentos escaneados y responder preguntas sobre su contenido, util para catalogacion de archivos graficos o extraccion de informacion de imagenes.
- Traduccion asistida japones-ingles como borrador: al declarar ambos idiomas, puede generar primeras versiones de traduccion que despues se revisan, aunque no hay benchmarks publicados que permitan estimar la calidad frente a modelos especializados.
- Despliegue edge en un Mac Mini o portatil M1/M2/M3/M4 con 16 GB de memoria unificada: el modelo completo cabe en memoria y se sirve mediante llama-server para aplicaciones internas de oficina.
- Prototipado rapido y docencia: la model card esta escrita para estudiantes sin experiencia, de modo que el repositorio sirve como material practico para explicar cuantizacion, formatos GGUF y ejecucion local de modelos.
- Preprocesado de corpus en japones: generacion de resumenes, etiquetas o datos sinteticos en lotes pequenos usando llama-cli sobre un servidor con una GPU de gama media.
- Sustitucion de un endpoint en la nube en entornos aislados: gracias a la etiqueta endpoints_compatible y a llama-server, puede colocarse detras de una aplicacion existente que espera una API HTTP sin necesidad de reescribir el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, ni comparaciones con modelos de referencia. El autor unicamente publica mediciones de velocidad realizadas en su propio equipo, que se recogen en la seccion de requisitos de hardware.

## Requisitos de hardware

- VRAM minima recomendada: 6 GB. El cuerpo del modelo en Q4_K_M ocupa 4.812 MiB de VRAM segun la medicion del autor.
- Memoria adicional para cache KV: aproximadamente 256 MiB con contexto de 8.192 tokens y cache en f16, hasta unos 5,2 GB totales en esa configuracion; las sesiones de 32.768 tokens requieren cache KV en q8_0 para mantenerse dentro de 8 GB.
- Requisitos minimos sin GPU: 8 GB de almacenamiento libre y 8 GB de RAM (16 GB recomendados), con Windows, macOS o Linux.
- GPUs de consumo compatibles: GeForce RTX 3060 y RTX 4060 con 6 GB o mas de VRAM; el autor midio sobre una RTX 4060 Laptop de 8 GB.
- Equipos Apple: Mac con chip M1, M2, M3 o M4 y 16 GB o mas de memoria unificada.
- Rendimiento medido (RTX 4060 Laptop de 8 GB, 20 nucleos de CPU, 61 GB de RAM, Ubuntu, llama.cpp b10685, contexto 8.192 en la prueba de velocidad): lectura de 171 a 493 tokens por segundo y generacion de 38 a 42 tokens por segundo con todos los estratos en GPU.
- Rendimiento solo con CPU (20 nucleos): 19,7 tokens por segundo en lectura y 5,8 tokens por segundo en generacion.
- Opciones de despliegue: llama.cpp mediante llama-cli, llama-server y llama-mtmd-cli (esta ultima para vision). LM Studio y Ollama son utilizables solo si su version interna de llama.cpp soporta la arquitectura Qwen3.5, es decir, versiones posteriores a septiembre de 2026. No hay informacion sobre soporte en vLLM o TGI.
- Parametros de ejecucion recomendados por el autor: --jinja obligatorio, --temp 0.6, --top-p 0.95, --top-k 20, --flash-attn on y, en caso de bucles de repeticion, --repeat-penalty 1.1 junto con --repeat-last-n 256.

## Comparativa con modelos similares

La comparacion se plantea a nivel de especificaciones, ya que este modelo no tiene benchmarks publicados que permitan contrastar rendimiento. Los datos de las alternativas proceden de la documentacion publica de cada modelo.

| Modelo | Parametros | Contexto | Licencia | Formatos habituales | Notas |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-GGUF (Q4_K_M) | 8,95 B | no disponible como maximo oficial; validado a 32.768 tokens | other / see-original-model | GGUF | Vision opcional via mmproj; requiere llama.cpp reciente |
| Qwen2.5-7B-Instruct | 7,61 B | 32.768 tokens nativos, ampliable a 131.072 con YaRN | Apache 2.0 | safetensors, GGUF (cuantizaciones de la comunidad) | Licencia permisiva y ecosistema de cuantizaciones muy amplio |
| Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF | Ventana de contexto notablemente mayor y amplio soporte en herramientas |
| Gemma-2-9B-it | 9,24 B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Contexto corto y terminos de uso especificos de Google |

Frente a estas alternativas, la ventaja diferencial de este repositorio es la combinacion de entrada de imagen y un tamano de fichero de 5,4 GB con licencia heredada del modelo base, mientras que sus desventajas son la ausencia total de benchmarks, un contexto maximo no documentado y una licencia no estandar que exige revision juridica antes de un uso comercial.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks: no hay evidencia cuantitativa de calidad en razonamiento, codigo, matematicas o comprension lectora frente a otros modelos de tamano similar.
- La cuantizacion Q4_K_M introduce perdida de calidad respecto al modelo original en safetensors de 18 GB; el propio autor lo describe como un intercambio de precision por tamano y velocidad.
- El autor documenta tendencia a bucles de repeticion en la generacion, mitigada con penalizacion de repeticion 1.1 y ventana de 256 tokens; es un comportamiento que debe monitorizarse en produccion.
- Idiomas soportados unicamente japones e ingles. No hay datos sobre el rendimiento en castellano ni en otras lenguas, por lo que no es recomendable asumir calidad multilingue.
- La licencia es "other" con la etiqueta see-original-model: los terminos aplicables son los del modelo base de Xiaomi, y deben revisarse expresamente antes de cualquier uso comercial o redistribucion.
- Es una cuantizacion no oficial realizada por terceros (Lna-Lab / Tonoken3), con 0 descargas y 2 likes en el momento de la consulta: no ha sido validada por la comunidad ni por el autor original.
- Dependencia estricta de version: requiere llama.cpp de septiembre de 2026 o posterior. Versiones antiguas, asi como instalaciones de LM Studio u Ollama con llama.cpp desactualizado, fallaran al cargar el modelo.
- La funcionalidad de vision requiere descargar y referenciar el fichero mmproj de 918 MB por separado; sin el, el modelo solo procesa texto.
- El contexto maximo oficial no esta documentado. Las pruebas del autor llegan a 32.768 tokens con cache KV en q8_0; en ejecucion solo con CPU el ejemplo publicado se limita a 2.048 tokens.
- No hay informacion sobre sesgos, tasas de alucinacion, soporte de tool calling, uso en agentes ni modo de razonamiento explicito.
- Al ser un modelo destilado y cuantizado de 9 B, es previsible que cometa errores factuales en tareas de conocimiento especializado; no se dispone de datos para cuantificar esa tasa.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/sakamakismile/MiMo-V2.6-Distill-Qwen-9B-GGUF
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Enlace de licencia indicado por el autor: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Descargas de llama.cpp (requeridas para ejecutar el modelo): https://github.com/ggml-org/llama.cpp/releases
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo (papers, blogs, repositorios o demos). No se dispone de otros enlaces.
