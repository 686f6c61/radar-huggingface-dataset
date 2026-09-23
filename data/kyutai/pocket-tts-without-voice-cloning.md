# kyutai/pocket-tts-without-voice-cloning

## Resumen

Pocket TTS es un sistema de sintesis de voz (text-to-speech, TTS) desarrollado por Kyutai Labs y disenado para ejecutarse de forma eficiente en CPU, sin necesidad de GPU ni de APIs externas. El modelo base ronda los 100 millones de parametros, lo que lo situa en la categoria de TTS ultraligero: segun el autor, genera audio a aproximadamente 6 veces la velocidad de tiempo real en un MacBook Air M4 utilizando solo 2 nucleos de CPU, con una latencia de unos 200 ms hasta el primer fragmento de audio. La distribucion se realiza como paquete Python (`pip install pocket-tts`), con API de Python y linea de comandos, y requiere PyTorch 2.5 o superior (version CPU, sin CUDA).

La variante concreta de esta ficha, `kyutai/pocket-tts-without-voice-cloning`, se publica sin la funcionalidad de clonacion de voz que si aparece en el modelo base `kyutai/pocket-tts`. El modelo soporta seis idiomas (ingles, frances, aleman, portugues, italiano y espanol) y es capaz de procesar entradas de texto de longitud practicamente ilimitada gracias a un modo de streaming que va emitiendo audio por fragmentos. Para los idiomas distintos del ingles se ofrecen variantes de 24 capas de mayor calidad, a costa de un coste computacional superior.

Su relevancia actual radica en que cubre un nicho poco atendido: TTS de calidad razonable ejecutable en entornos sin GPU (portatiles, CI, servidores modestos, navegador del cliente) y con licencia CC-BY-4.0, lo que facilita su integracion en productos. El repositorio ocupa 18,9 GB, un tamano muy superior al esperado para 100 millones de parametros, coherente con la presencia de multiples variantes de idioma, voces y pesos auxiliares. El modelo se apoya en el paper arXiv:2509.06926 y en un informe tecnico publicado por Kyutai en enero de 2026; en agosto de 2026 el equipo libero ademas el codigo de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; sistema TTS neuronal con variantes de modelo de lenguaje preentrenado por idioma (variantes de 24 capas para idiomas distintos del ingles) |
| Parametros totales | ~100 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el modelo admite entradas de texto de longitud ilimitada mediante generacion en streaming |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en), frances (fr), aleman (de), portugues (pt), italiano (it), espanol (es). El tag del repositorio incluye tambien `ar` (arabe), no confirmado en la model card |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Safetensors |
| Tamano del repositorio | 18,9 GB |
| Libreria | `pocket-tts` |
| Requisitos de entorno | Python 3.10-3.14, PyTorch 2.5+ (no requiere build con CUDA) |
| Idiomas de la ficha del autor | en, fr, de, pt, it, es |
| Fecha de creacion / ultima actualizacion | 2026-01-06 / 2026-09-23 |
| Descargas / likes | 6.753 / 32 |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna mas alla de que se trata de un sistema TTS neuronal con "modelos de lenguaje preentrenados" seleccionables mediante el parametro `--language` de la CLI, y de que existen variantes de 24 capas para los idiomas no ingleses descritas como de mayor calidad pero mas lentas. El modelo se distribuye en safetensors y se configura mediante ficheros YAML locales, URLs `https://` o rutas `hf://<repo_id>/<path>[@revision]`, lo que sugiere una separacion entre pesos, configuracion y catalogo de voces.

En cuanto a los datos de entrenamiento, la model card no especifica el numero de tokens de audio, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Si se indica que en agosto de 2026 se publico el codigo de entrenamiento en el directorio `training/` del repositorio de GitHub, lo que permite entrenar modelos propios y contribuir modelos de la comunidad. La innovacion tecnica principal que se destaca es la eficiencia en CPU: streaming de audio con latencia de aproximadamente 200 ms al primer fragmento, velocidad aproximada de 6x tiempo real en un M4 usando solo 2 nucleos, y capacidad de manejar texto de entrada de longitud ilimitada. Existen ademas implementaciones que permiten ejecutar el modelo en el propio navegador del cliente.

## Capacidades

- Sintesis de voz (TTS) multilingue en ingles, frances, aleman, portugues, italiano y espanol.
- Generacion de audio en streaming, con emision progresiva de fragmentos desde aproximadamente 200 ms tras iniciar la peticion.
- Procesamiento de entradas de texto de longitud ilimitada, adecuado para parrafos largos, articulos o documentos completos narrados de una sola vez.
- Seleccion de voces predefinidas mediante el parametro `--voice`, con un catalogo de voces publicadas en `kyutai/tts-voices` (alba, giovanni, lola, juergen, rafael, estelle, anna, azelma, bill_boerst, caro_davy, charles, cosette, eponine, eve, fantine, george, jane, entre otras).
- Seleccion de modelo de idioma mediante `--language`, incluyendo variantes de 24 capas de mayor calidad para idiomas distintos del ingles (por ejemplo `italian_24l`).
- Uso mediante API de Python y mediante interfaz de linea de comandos (`generate`, `export-voice`, `serve`).
- Ejecucion en navegador (implementaciones client-side) y despliegue como servicio mediante el comando `serve`.
- Exportacion de voces a partir de ficheros de audio de referencia (`export-voice`).
- No se documenta en la informacion disponible soporte de tool calling, function calling, agentes, vision, audio de entrada ni modo de razonamiento extendido, ya que se trata de un sistema TTS y no de un modelo de lenguaje de proposito general.

## Casos de uso

- Narracion de articulos y documentacion larga: el modelo acepta entradas de texto de longitud ilimitada y emite audio en streaming, por lo que puede convertir un articulo completo o un manual en audio sin trocear manualmente el texto ni esperar a que finalice la generacion completa.
- Accesibilidad en aplicaciones de escritorio y web: al ejecutarse en CPU con unos 200 ms de latencia al primer fragmento y solo 2 nucleos, puede integrarse en lectores de pantalla o funciones de "leer en voz alta" sin depender de servicios cloud ni de una GPU en el equipo del usuario.
- Asistentes de voz en local para domotica o kioscos: la generacion a 6x tiempo real en un MacBook Air M4 permite que un dispositivo de gama media con CPU sintetice respuestas habladas en el momento, manteniendo los datos en el dispositivo y evitando costes por peticion de APIs externas.
- Audioguías y contenido multilingue: con soporte de espanol, frances, aleman, portugues, italiano e ingles, un mismo flujo puede generar la version en varios idiomas de un guion, seleccionando la voz y el modelo de idioma correspondiente mediante `-language` y `--voice`.
- Generacion de audio en pipelines de CI/CD y pruebas automatizadas: al ser un paquete Python instalable con `pip` o ejecutable con `uvx`, se puede incorporar en tests que verifiquen la locucion de mensajes de aplicacion, con coste de infraestructura minimo al no requerir GPU.
- Prototipado e investigacion en TTS: el codigo de entrenamiento publicado en `training/` y la posibilidad de cargar pesos personalizados mediante `--config` permiten hacer fine-tuning sobre voces o dominios concretos y comparar variantes de capas y calidad.
- Preproduccion de locuciones y doblaje de baja fidelidad: util para generar bocetos de voz en fase de guion o para crear versiones provisionales de un video antes de contratar una locucion profesional.
- Accesibilidad en navegador sin backend: dado que existen implementaciones client-side, se pueden ofrecer funciones de lectura en voz alta en una web sin enviar el texto del usuario a ningun servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas de calidad de sintesis (por ejemplo MOS, WER, SIM) ni comparaciones numericas con otros sistemas TTS.

Los unicos datos de rendimiento facilitados por el autor son de caracter operativo:

| Metrica | Valor declarado por el autor |
|---|---|
| Latencia hasta el primer fragmento de audio | ~200 ms |
| Velocidad de generacion | ~6x tiempo real |
| Hardware de referencia | CPU de MacBook Air M4 |
| Nucleos de CPU utilizados | 2 |
| Parametros del modelo | ~100 M |

## Requisitos de hardware

- Uso principal en CPU: no requiere GPU y no necesita la build CUDA de PyTorch.
- Consumo de nucleos: aproximadamente 2 nucleos de CPU segun el autor.
- VRAM estimada: no disponible; al ejecutarse en CPU, la memoria relevante es la RAM del sistema. Con un modelo de unos 100 M de parametros en safetensors, el peso de los pesos es de unos cientos de MB por variante, aunque el repositorio completo ocupa 18,9 GB (incluye multiples variantes y material auxiliar). No se especifican cifras exactas de RAM por variante.
- GPU recomendadas: no se documentan; el diseno prioriza CPU. En principio cualquier GPU compatible con PyTorch 2.5+ podria utilizarse, pero no se aportan datos de rendimiento en GPU.
- Compatibilidad con GPU de consumo: no aplica como requisito, ya que el caso de uso objetivo es CPU.
- Opciones de despliegue: paquete Python `pocket-tts` (instalacion con `pip` o ejecucion con `uvx`), CLI (`generate`, `export-voice`, `serve`), API de Python, servidor de inferencia mediante `serve`, y ejecucion en el navegador del cliente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: ~200 ms al primer fragmento y ~6x tiempo real en CPU de MacBook Air M4. No hay datos de throughput en otros procesadores ni en GPU.
- Rendimiento por variante: las variantes de 24 capas para idiomas distintos del ingles ofrecen mayor calidad pero son mas lentas, sin cifras concretas publicadas.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. La model card no incluye una tabla de comparacion con otros sistemas TTS y no se han facilitado especificaciones verificables de alternativas.

| Modelo | Parametros | Contexto / longitud de entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kyutai/pocket-tts-without-voice-cloning | ~100 M | Entradas de texto ilimitadas (streaming) | en, fr, de, pt, it, es | CC-BY-4.0 | HuggingFace, pip, GitHub |
| Alternativas de la misma categoria (TTS ligero ejecutable en CPU) | No disponible | No disponible | No disponible | No disponible | No disponible |

Como referencia cualitativa, la categoria de TTS ultraligero orientado a CPU incluye sistemas como Piper, Kokoro o XTTS, pero en la informacion disponible no se aportan parametros, contextos, licencias ni resultados verificables de estos modelos, por lo que no se puede establecer una comparacion rigurosa.

## Limitaciones y advertencias

- La variante de esta ficha se publica explicitamente sin clonacion de voz, pese a que la model card del modelo base si la anuncia. Conviene verificar el alcance real de esta variante antes de integrarla si la clonacion es un requisito.
- El uso de clonacion de voz o de imitacion de personas sin consentimiento explicito y legal esta prohibido por los terminos del autor, junto con la generacion de desinformacion, llamadas fraudulentas, contenido difamatorio, de acoso, discriminatorio o que invada la privacidad.
- El acceso al modelo esta sujeto a un formulario (`extra_gated_fields`) que solicita empresa o universidad y el proposito de uso (trabajo, estudios u ocio).
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero no concede derechos de marca ni de imagen sobre las voces utilizadas; el propio autor remite a `kyutai/tts-voices` para consultar la licencia de cada voz concreta (algunas voces provienen de datasets como VCTK o Expresso con condiciones propias).
- Calidad y naturalidad: no se publican metricas objetivas de MOS, WER ni similitud de voz, por lo que la calidad real por idioma y por voz no esta cuantificada.
- Idiomas: el soporte se limita a los seis idiomas declarados; el rendimiento fuera de ellos no esta documentado. El tag `ar` del repositorio no queda confirmado en la model card.
- Riesgo de errores de pronunciacion en nombres propios, siglas, numeros, unidades o terminos tecnicos, habitual en sistemas TTS, no cuantificado en la informacion disponible.
- Discrepancia de fechas: la ficha indica creacion el 2026-01-06 y ultima actualizacion el 2026-09-23, con una nota de agosto de 2026 sobre la publicacion del codigo de entrenamiento; conviene comprobar la revision exacta de los pesos que se descargan.
- El repositorio ocupa 18,9 GB, muy por encima del tamano de un modelo de 100 M de parametros, por lo que el espacio en disco y el tiempo de descarga son un factor a tener en cuenta en entornos con recursos limitados.
- No se documentan mecanismos de filtrado de contenido generado, moderacion de texto de entrada ni marcas de agua en el audio resultante.

## Enlaces

- Modelo en HuggingFace (esta variante): https://huggingface.co/kyutai/pocket-tts-without-voice-cloning
- Modelo base con clonacion de voz: https://huggingface.co/kyutai/pocket-tts
- Repositorio GitHub: https://github.com/kyutai-labs/pocket-tts
- Codigo de entrenamiento: https://github.com/kyutai-labs/pocket-tts/blob/main/training/README.md
- Demo interactiva: https://kyutai.org/pocket-tts
- Informe tecnico (blog de Kyutai): https://kyutai.org/blog/2026-01-13-pocket-tts
- Paper: https://arxiv.org/abs/2509.06926
- Documentacion: https://kyutai-labs.github.io/pocket-tts/
- Catalogo de voces y sus licencias: https://huggingface.co/kyutai/tts-voices

Nota: los resultados de la busqueda web proporcionados corresponden a entidades bancarias y no guardan relacion con el modelo; no se han utilizado como fuente.
