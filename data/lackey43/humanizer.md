# lackey43/humanizer

## Resumen

humanizer es un modelo de lenguaje de aproximadamente 12.000 millones de parámetros (11.959.730.224 exactamente) publicado por el usuario de HuggingFace lackey43. Se trata de un fine-tune del modelo base google/gemma-4-12B especializado en una única tarea: reescribir borradores redactados por IA (correos, ensayos, informes, respuestas de foro) para que se lean como escritos por una persona. Su relevancia actual radica en que ataca un problema concreto de producción —el texto sintético detectable y con registro artificial— sin necesidad de servicios en la nube, ya que está pensado para ejecutarse localmente.

El modelo está entrenado con la restricción explícita de conservar cada número, unidad, fecha, nombre y cita, y de no añadir información nueva. Soporta inglés y chino (en, zh), se distribuye en safetensors y GGUF, y declara licencia apache-2.0. El repositorio ocupa 87,6 GB y, en el momento de la consulta, acumula 548 descargas y 1 like, lo que indica una validación comunitaria todavía muy limitada.

Junto al modelo, el autor mantiene una aplicación de escritorio (macOS Apple silicon y Windows x64) que funciona sin conexión y una interfaz de línea de comandos (`hz`) para documentos largos, además de un conjunto de archivos GGUF con cuantización adaptativa y entrenamiento consciente de cuantización. No se han publicado datos sobre longitud de contexto, composición del dataset de entrenamiento ni número de tokens utilizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de google/gemma-4-12B (tag `gemma4_unified` en HuggingFace); no se detalla la arquitectura interna en la model card |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en 2-bit, Q3 y Q4_K_M (construidos con asignacion adaptativa de bits por tensor, QAT y destilacion desde bf16) y Q6_K y Q8_0 (builds estandar de `llama-quantize`); pesos completos en bf16 |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | apache-2.0 (declarada por el autor; el modelo base esta sujeto a los terminos de Google) |
| Formato de pesos | safetensors (bf16) y GGUF |

## Arquitectura y entrenamiento

La model card describe un fine-tune sobre google/gemma-4-12B (`base_model_relation: finetune`) orientado a reescritura y transferencia de estilo. El autor no detalla la arquitectura interna ni el volumen de datos de entrenamiento; los tags de HuggingFace incluyen `image-text-to-text` y `gemma4_unified`, lo que sugiere que el modelo base es multimodal, aunque ninguna capacidad de vision se documenta para este fine-tune. Tampoco se especifica si se emplearon tecnicas de alineacion como RLHF o DPO. Un dato relevante y confirmado por el autor es que no se utilizo ningun detector de IA en ninguna fase del entrenamiento.

La innovacion tecnica mas documentada esta en el proceso de cuantizacion. Frente al paso unico de `llama-quantize` que redondea todos los pesos al mismo tipo, los archivos de 2 bits, Q3 y Q4_K_M se construyen en tres etapas: primero se mide el dano que provoca cada tensor al comprimirse y se asignan mas bits a los tensores sensibles y menos a los robustos; despues se aplica entrenamiento consciente de cuantizacion capa por capa para reproducir el modelo completo; y finalmente se destila desde el modelo bf16 usado como profesor, sobre datos de reescritura en ingles y chino. El resultado es un GGUF convencional compatible con cualquier version reciente de llama.cpp. El autor afirma que en el archivo de 2 bits (3,9 GB) la coincidencia de top-1 con bf16 pasa del 70 % de una build estandar al 81 %, 85 % y finalmente 87 % tras estas etapas. Los archivos Q6_K y Q8_0 son builds estandar, con el argumento de que a esos tamanos queda poco margen de recuperacion.

## Capacidades

- Reescritura y humanizacion de texto: convierte borradores con registro artificial en prosa con cadencia y eleccion lexica mas natural, en ingles y chino.
- Preservacion de hechos: esta entrenado para mantener intactos numeros, unidades, fechas, nombres y citas, y para no anadir contenido nuevo.
- Transferencia de estilo y parafrasis: los tags del repositorio incluyen `style-transfer`, `paraphrase` y `text-rewriting`.
- Procesamiento de documentos estructurados: la CLI `hz` conserva encabezados, bloques de codigo, tablas y enlaces, y reescribe la prosa fragmento a fragmento; acepta `.md`, `.txt` y `.docx`.
- Importacion de documentos: la aplicacion 0.3.2 puede importar archivos `.docx` y PDF.
- Marca de pasajes intocables: la funcion "Create fact" mantiene palabra por palabra cualquier pasaje que el usuario marque.
- Ejecucion local y sin conexion: la aplicacion descarga el archivo una sola vez y despues funciona offline.
- Tool calling o function calling: no disponible; la model card no documenta soporte nativo.
- Uso como agente multi-paso: no disponible como capacidad del modelo. El repositorio incluye un `AGENTS.md` para que un agente de programacion configure el servidor y el prompt, pero eso es integracion, no una capacidad del modelo.
- Capacidades de vision: no disponible; aunque el tag `image-text-to-text` aparece en HuggingFace, la model card no describe ninguna tarea de imagen.

## Casos de uso

- Humanizacion de correos profesionales: el modelo reescribe un correo redactado con asistente manteniendo cifras, plazos y nombres de destinatarios, y devuelve un texto que pasa revision humana. Es adecuado porque su entrenamiento penaliza explicitamente la alteracion de datos y porque la aplicacion de escritorio permite pegarlo y revisarlo sin salir del equipo.
- Preparacion de publicaciones en foros y plataformas de contenido: el autor incluye ejemplos de respuestas de foro y de Zhihu; el modelo adapta el registro a un tono conversacional sin anadir afirmaciones nuevas, algo critico cuando se responde en un hilo publico.
- Reescritura de documentacion tecnica en repositorios: mediante `hz paper.md -o paper.out.md`, el modelo reescribe la prosa de un README o una guia manteniendo intactos los bloques de codigo, las tablas y los enlaces, de modo que el diff resultante solo toca el texto explicativo.
- Adaptacion de articulos y ensayos para publicacion: para manuscritos largos en Markdown o `.docx`, la CLI trocea el documento y reescribe seccion a seccion, lo que permite pasar un texto completo por el modelo en una sola ejecucion.
- Flujo de trabajo bilingue ingles-chino: al ser los unicos dos idiomas soportados, encaja en equipos que redactan en ambos idiomas y necesitan un unico modelo local en lugar de dos pipelines distintos.
- Despliegue en equipos con recursos limitados: con el archivo de 2 bits de 3,9 GB y el minimo de 8 GB de maquina que indica la aplicacion, el modelo puede ejecutarse en portatiles sin GPU dedicada, util para entornos con requisitos de confidencialidad que prohiben enviar texto a la nube.
- Integracion en herramientas internas mediante llama-server: el repositorio documenta el uso con llama.cpp y un servidor local, de modo que un equipo puede exponer la reescritura como endpoint interno y encadenarlo a un editor o a un corrector ortografico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card si incluye una evaluacion propia orientada a la tarea del modelo:

| Metrica | Resultado | Condiciones |
|---|---|---|
| Reescrituras en ingles juzgadas como humanas por Originality.ai | 95 % (11 de 210 marcadas como IA) | Ajuste mas estricto del detector, pesos bf16, version anterior: 26 de 210 |
| Reescrituras en ingles sin problema factual segun juez LLM estricto | 376 de 420 | Medido sobre `humanizer-12b-Q8_0.gguf`; version anterior: 369 de 420 |
| Problemas detectados por el juez sobre el total de reescrituras en ingles | 135 problemas, 44 de 420 reescrituras afectadas | 125 de los 135 son una sola palabra o frase |
| Coincidencia top-1 con bf16 en el archivo de 2 bits (3,9 GB) | 87 % | Build estandar del mismo tamano: 70 %; etapas intermedias: 81 % y 85 % |

Los datos de la evaluacion corresponden a conjuntos reservados y a muestras generadas por el propio autor; no hay una evaluacion independiente de terceros disponible.

## Requisitos de hardware

- Tamano del archivo de 2 bits: 3,9 GB (dato confirmado en la model card). Es el unico tamano de archivo concreto que se publica; los tamanos de Q3, Q4_K_M, Q6_K y Q8_0 no se detallan.
- Minimo de maquina declarado por la aplicacion: 8 GB de memoria, con la aplicacion sugiriendo uno de cinco tamanos (Q8_0, Q6_K, Q4_K_M, Q3 o 2 bits) en funcion de la memoria disponible.
- Estimacion orientativa de VRAM para inferencia, derivada del numero de parametros y no confirmada por el autor: en torno a 4-5 GB para 2 bits, 6-8 GB para Q3, 7-9 GB para Q4_K_M, 10-12 GB para Q6_K y 13-15 GB para Q8_0, cantidades a las que hay que sumar el contexto.
- GPU consumer: el archivo de 2 bits y presumiblemente Q3 y Q4_K_M caben en tarjetas de 8-12 GB (RTX 3060, 4060, 4070); Q6_K y Q8_0 requieren 12-16 GB (RTX 4080, 4090, A4000) o reparto entre CPU y GPU.
- GPU de centro de datos: A100, H100 o L40S ejecutan cualquier archivo con holgura, aunque el modelo no esta pensado para despliegues de alta concurrencia.
- Opciones de despliegue: llama.cpp y `llama-server` (mencionados explicitamente), la aplicacion de escritorio del autor para macOS Apple silicon y Windows x64, y la CLI `hz` instalable con `pipx install git+https://github.com/sgaofen/humanizer-local-model`. El tag `transformers` sugiere compatibilidad adicional, y el repositorio incluye pesos safetensors.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por documento.

## Comparativa con modelos similares

No se ha identificado en la informacion proporcionada ningun modelo de humanizacion directamente comparable. La unica referencia contrastable es el modelo base del que deriva:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lackey43/humanizer | 11,96B | no disponible | 95 % de reescrituras en ingles juzgadas humanas por Originality.ai; 376/420 sin problema factual | apache-2.0 (declarada) sobre base Gemma | Pesos safetensors y GGUF, 548 descargas, 1 like |
| google/gemma-4-12B (base) | ~12B | no disponible | no disponible en la informacion proporcionada | terminos de uso de Gemma | Modelo oficial de Google |
| Alternativas especificas de humanizacion | no disponible | no disponible | no disponible | no disponible | no disponible |

Conviene senalar que la comparacion con el modelo base no es significativa en terminos de rendimiento: las metricas publicadas miden la calidad de la reescritura, una tarea para la que el base no esta ajustado.

## Limitaciones y advertencias

- Riesgo factual medido y no nulo: el propio autor reporta que 44 de 420 reescrituras en ingles fueron marcadas por el juez, con 135 problemas, de los cuales 125 son una sola palabra o frase. La recomendacion explicita es revisar el resultado antes de enviarlo, especialmente numeros, fechas y nombres.
- Los ejemplos de la model card son selecciones: para cada borrador se generaron 8 muestras y se eligio la mejor de las que pasaron el juez de hechos. No representan la salida media del modelo.
- Cobertura linguistica limitada: solo ingles y chino. No hay soporte declarado de castellano ni de otros idiomas.
- Longitud de contexto desconocida: no se publica la ventana de contexto, lo que dificulta planificar el troceado de documentos largos mas alla de lo que hace la CLI por si misma.
- Ambiguedad de licencia: el repositorio declara apache-2.0, pero el modelo base es Gemma y esta sujeto a sus propios terminos de uso. Antes de un uso comercial conviene verificar que la licencia declarada por el autor prevalece sobre las condiciones del modelo base.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o comportamiento diferencial por idioma o registro. Al ser un fine-tune de un modelo base, hereda sus sesgos sin que existan datos publicados al respecto.
- Validacion comunitaria escasa: 548 descargas y 1 like en el momento de la consulta, con un unico autor y sin evaluacion independiente de terceros.
- Uso de detectores de IA: la model card no documenta la fecha de los pesos ni garantiza que el resultado siga siendo indetectable frente a versiones futuras de los detectores; la metrica del 95 % procede de un unico detector (Originality.ai) en su ajuste mas estricto.
- Dependencia de la tarea: el modelo esta especializado en reescritura. No debe esperarse de el razonamiento general, generacion de codigo, matematicas ni dialogos multi-turno de proposito general.
- Aplicacion de escritorio limitada a macOS Apple silicon y Windows x64. No se menciona soporte de Linux en la aplicacion, aunque la CLI si es multiplataforma.
- Peso del repositorio: 87,6 GB en total, lo que complica su descarga y almacenamiento si se quieren conservar todas las cuantizaciones y los pesos safetensors.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lackey43/humanizer
- Repositorio de archivos GGUF: https://huggingface.co/jialinyyzz/humanizer-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Repositorio en GitHub: https://github.com/sgaofen/humanizer-local-model
- Guia de instalacion: https://github.com/sgaofen/humanizer-local-model/blob/main/docs/INSTALL.md
- Documentacion de cuantizacion: https://github.com/sgaofen/humanizer-local-model/blob/main/docs/QUANTIZATION.md
- Guia de uso sin la aplicacion: https://github.com/sgaofen/humanizer-local-model/blob/main/USAGE.md
- Guia de uso en chino: https://github.com/sgaofen/humanizer-local-model/blob/main/USAGE.zh.md
- README en chino: https://github.com/sgaofen/humanizer-local-model/blob/main/README.zh.md
- Instrucciones para agentes de programacion: https://github.com/sgaofen/humanizer-local-model/blob/main/AGENTS.md
- Salidas completas de la evaluacion (420 reescrituras, 8 muestras por borrador): https://github.com/sgaofen/humanizer-local-model/blob/main/eval/outputs/examples-12b-Q8_0_x8.json
- Releases de la aplicacion (0.3.2): https://github.com/sgaofen/humanizer-local-model/releases/tag/app-v0.3.2
- Descarga macOS Apple silicon: https://github.com/sgaofen/humanizer-local-model/releases/download/app-v0.3.2/Humanizer-0.3.2-macos-arm64.dmg
- Descarga Windows x64: https://github.com/sgaofen/humanizer-local-model/releases/download/app-v0.3.2/Humanizer-0.3.2-windows-x64-setup.exe

Nota: la busqueda web realizada para esta ficha no devolvio resultados relevantes sobre el modelo. Los enlaces listados proceden integramente de la informacion de HuggingFace y de la model card del autor.
