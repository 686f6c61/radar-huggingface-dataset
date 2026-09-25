# Ar4ikov/VibeVoice-ASR-Streaming-1.5B-DFlash2

## Resumen

VibeVoice-ASR-Streaming-1.5B-DFlash2 es un paquete de pesos publicado por el usuario Ar4ikov que contiene, sin modificar, el modelo de reconocimiento automatico del habla en streaming microsoft/VibeVoice-ASR-Streaming-1.5B (revision `4262d23d`, 5,65 GB) junto con un borrador (drafter) de decodificacion especulativa denominado DFlash 2, alojado en la subcarpeta `drafter/` (0,45 GB). El objetivo es que una sola descarga permita a vibevoice.c, la implementacion en C del runtime, proponer 8 tokens por pasada con el drafter y verificarlos en una sola pasada con el modelo grande, sin alterar la transcripcion resultante. Segun el autor, la verificacion es exacta: cada fila comprobada se calcula con la aritmetica del propio paso de decodificacion del modelo, por lo que la transcripcion es identica byte a byte a la obtenida sin drafter.

El modelo base pertenece a la familia VibeVoice de Microsoft, un marco de investigacion de voz de codigo abierto. VibeVoice-ASR-Streaming es un modelo unificado de ASR que transcribe quien (hablante) dijo que (contenido), con soporte de hotwords personalizados y 10 idiomas, y que emite texto a medida que llega el audio en lugar de esperar al final de la locucion. Esa caracteristica lo hace adecuado para asistentes y agentes de voz en tiempo real, que es precisamente el caso de uso que justifica el drafter: reducir la latencia del bucle de decodificacion.

La relevancia de esta publicacion es doble. Por un lado, ofrece una ruta concreta de aceleracion de inferencia (1,96x en archivos de 2 minutos y 1,92x en archivos de 32 minutos sobre una RTX 3090, segun los datos del autor) manteniendo la fidelidad de la transcripcion. Por otro, ilustra un patron de empaquetado en el que el modelo y su borrador viajan juntos en el mismo repositorio, de modo que el runtime lo detecta de forma automatica. El contrapunto es que se trata de una publicacion muy reciente, con 0 descargas y 0 likes en el momento de redactar esta ficha, y que exige una rama de desarrollo concreta de vibevoice.c todavia no incluida en una version estable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo unificado de ASR en streaming (hablante + contenido) con decodificacion especulativa mediante un drafter DFlash 2 de 5 capas estilo Qwen3; el detalle interno del backbone del modelo base no esta disponible en la informacion proporcionada |
| Parametros totales | 2.814.116.321 (recuento real de safetensors; el nombre comercial indica 1.5B, la informacion disponible no desglosa el reparto entre codificador, decodificador y drafter) |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible; el modelo opera por fragmentos de audio (streaming) y la informacion proporcionada no especifica una ventana de contexto en tokens |
| Tipos de cuantizacion | Pesos publicados en BF16; vibevoice.c ejecuta BF16 como FP16 denso y ofrece `--quant int4` en carga; el drafter se mantiene en INT4 por defecto y admite `--draft-quant f16` para FP16. No se publican pesos pre-cuantizados en este repositorio |
| Idiomas soportados | 10 idiomas segun la model card del modelo base; la lista concreta de idiomas no esta disponible en la informacion proporcionada |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) para el modelo y para el drafter; no se incluyen GGUF ni otros formatos |
| Modelo base | microsoft/VibeVoice-ASR-Streaming-1.5B, revision `4262d23d` |
| Drafter | Ar4ikov/VibeVoice-ASR-Streaming-1.5B-DFlash2-Drafter, revision `264812a6` |
| Libreria / runtime | vibevoice.c (rama `dflash2`, PR #48) |
| Pipeline declarado | automatic-speech-recognition |
| Tamano del repositorio | 6,1 GB (5,65 GB de modelo + 0,45 GB de drafter) |
| Fecha de creacion en HuggingFace | 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

El repositorio no introduce entrenamiento nuevo sobre el modelo grande: los pesos de microsoft/VibeVoice-ASR-Streaming-1.5B se incluyen tal cual, en BF16, en la revision indicada por el autor. Lo que se anade es el componente de decodificacion especulativa. El drafter DFlash 2 es una red de 5 capas con estilo Qwen3 que lee las capas 1, 7, 13, 19 y 25 del modelo grande, incorpora un selector de candidatos y trabaja sobre un vocabulario de borrador de 32.768 identificadores. Se guarda en BF16 y, por defecto, se mantiene en INT4 al cargar. El detalle de su arquitectura y de su entrenamiento se remite a la model card del drafter, no incluida en la informacion disponible.

El mecanismo de decodificacion funciona por bloques: el drafter propone 8 tokens en una sola pasada y el modelo los verifica en otra pasada, conservando unicamente aquellos con los que coincide. Segun el autor, con `--draft-check exact` cada fila verificada se calcula con la aritmetica del paso de decodificacion nativo del modelo, de forma que la transcripcion es identica byte a byte a la de la decodificacion sin drafter. Los experimentos reportados se hicieron con codificacion greedy, pesos BF16 ejecutados como FP16 denso y sesiones de streaming configuradas con fragmentos de 22 + 4 frames. El modelo base, segun la documentacion publica de Microsoft, transcribe mientras llega el audio y emite texto una vez por fragmento; la variante de 7B de la misma familia, segun su model card, escribe texto cada 2,93 s de audio con 0,53 s de lookahead, aunque ese dato corresponde al modelo de 7B y no se ha confirmado para la variante de 1.5B en la informacion disponible.

## Capacidades

- Reconocimiento automatico del habla en streaming: emite transcripcion de forma incremental mientras el audio sigue llegando, en lugar de esperar al cierre del flujo.
- Atribucion de hablante integrada: resuelve en un unico modelo quien dijo que, unificando ASR y diarizacion en lugar de encadenar dos sistemas.
- Hotwords personalizados para sesgar el reconocimiento hacia vocabulario concreto; la documentacion de Microsoft muestra el uso de `--context_info "Microsoft,VibeVoice"`.
- Cobertura multilingue declarada de 10 idiomas en la model card del modelo base (lista no disponible).
- Decodificacion especulativa con verificacion exacta: 8 tokens propuestos por pasada, con transcripcion identica a la decodificacion simple segun el autor.
- Modo servidor para sesiones concurrentes: `vv_cli serve --model ... --slots 4` con soporte de WebSocket y SSE.
- Ejecucion en C mediante vibevoice.c, con cuantizacion int4 en carga, incluido el drafter.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes multi-paso, vision, audio generativo ni modo de razonamiento explicito. El pipeline declarado es exclusivamente automatic-speech-recognition.

## Casos de uso

- Subtitulado en directo: el modelo emite texto por fragmento mientras el audio llega, de modo que se pueden mostrar subtitulos con un retardo acotado en retransmisiones, clases o eventos. La decodificacion especulativa reduce el coste por token decodificado en el bucle de baja latencia, que es donde mas importa.
- Transcripcion de reuniones con atribucion de hablante: al unificar diarizacion y ASR, se obtiene un acta con etiquetas de quien habla sin necesidad de ejecutar y alinear dos modelos distintos, lo que simplifica el pipeline y reduce el consumo de GPU.
- Asistentes y agentes de voz en tiempo real: el modo `serve` con varios slots y WebSocket o SSE permite mantener sesiones concurrentes con entrada de audio continua, adecuado para agentes telefonicos o interfaces de voz embebidas.
- Atencion al cliente en centros de contacto: la transcripcion por turnos con hablante identificado alimenta analitica de conversacion, deteccion de motivos de contacto y control de calidad, con hotwords para nombres de producto, campanas o terminologia interna.
- Dominios con jerga especializada (medico, legal, industrial): el sesgo mediante hotwords permite fijar farmacos, diagnosticos, referencias legales o codigos de pieza que un ASR generico tiende a sustituir por palabras frecuentes.
- Post-produccion y archivado de audio: transcripcion de podcasts, entrevistas o grabaciones largas con ficheros de decenas de minutos, donde la mejora de 1,92x en un archivo de 32 minutos se traduce directamente en tiempo de proceso.
- Accesibilidad: generacion de subtitulos en tiempo real para personas con discapacidad auditiva en aulas, salas de reunion o videollamadas, con salida incremental apta para consumo inmediato.
- Despliegue en GPU de consumo: con cuantizacion int4 en carga, el conjunto modelo mas drafter ocupa un espacio reducido en memoria, lo que permite prototipar y servir en tarjetas de gama media-alta sin infraestructura dedicada.
- Preprocesado de pipelines de datos de voz: transcripcion masiva de corpus de audio para construir datasets etiquetados con hablante, donde el throughput por GPU determina el coste total del trabajo.

## Benchmarks y rendimiento

El autor publica una tabla de velocidad de decodificacion medida con vibevoice.c `b72be15` (rama `dflash2`) sobre una RTX 3090, con decodificacion greedy, pesos BF16 ejecutados como FP16 denso y verificacion `--draft-check exact`. La columna "plain" corresponde al mismo modelo con `--draft none`.

| Escenario | Sin drafter | Con drafter | Aceleracion | Tokens por bloque | Misma transcripcion |
|---|---|---|---|---|---|
| Archivo de 2 minutos | 208 tok/s | 408 tok/s | 1,96x | 3,26 | Si |
| Archivo de 32 minutos | 186 tok/s | 358 tok/s | 1,92x | 3,10 | Si |

No se han publicado resultados de benchmarks de precision (WER, tasa de error de hablante, MMLU, HumanEval, GSM8K u otros) para este repositorio en la informacion disponible. La model card remite a la del modelo base para la evaluacion del modelo, pero esos datos no se han proporcionado.

## Requisitos de hardware

Los valores de memoria de esta seccion son estimaciones derivadas del tamano de los ficheros publicados (5,65 GB de modelo + 0,45 GB de drafter) y no cifras medidas por el autor; se indican como tales.

- Memoria en FP16 (escenario de referencia del autor): aproximadamente 5,6 GB solo de pesos del modelo mas 0,45 GB de drafter, es decir, en torno a 6-7 GB antes de cache de claves/valores y activaciones. El autor cita como referencia que vibevoice.c ejecuta un modelo de 7B con drafter incluido en unos 19 GB de VRAM, lo que confirma que el consumo real supera al de los pesos.
- Memoria con `--quant int4` en carga: del orden de 1,5-2,5 GB de pesos, con el drafter tambien cuantizado (el autor indica que el drafter funciona con esa cuantizacion). Margen amplio para GPU de gama media.
- GPU recomendadas por el autor: RTX 3090 es la plataforma sobre la que se midieron los resultados. Por capacidad de memoria, una RTX 4090, L40S, A100 o H100 ejecutarian el modelo sin dificultad, con la ventaja adicional de mayor ancho de banda.
- Viabilidad en GPU de consumo: si. En FP16 cabe con holgura en tarjetas de 12-16 GB o superiores; con int4 el margen es mucho mayor y abre tarjetas de 8-10 GB.
- Opciones de despliegue: vibevoice.c es el unico runtime soportado segun la informacion disponible, en su rama `dflash2` (PR #48), todavia no incluida en una version publicada. Se ofrece CLI (`vv_cli --model ... --audio ...`) y modo servidor (`vv_cli serve --model ... --slots 4`, con WebSocket y SSE). No hay evidencia de soporte en vLLM, TGI, llama.cpp, Ollama u otros motores en la informacion proporcionada.
- Throughput y latencia: 208 tok/s sin drafter y 408 tok/s con drafter en un archivo de 2 minutos sobre RTX 3090; 186 tok/s y 358 tok/s respectivamente en un archivo de 32 minutos. La aceleracion se mantiene casi constante entre ambos regimenes (1,92x-1,96x), lo que sugiere que no se degrada con secuencias largas.
- Para streaming concurrente, el numero de slots (`--slots`) determina el consumo simultaneo de memoria y de computo; la informacion disponible no detalla el coste por slot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / latencia | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ar4ikov/VibeVoice-ASR-Streaming-1.5B-DFlash2 (este) | 2.814.116.321 segun safetensors | No disponible; streaming por fragmentos, 22 + 4 frames por chunk en las pruebas | 408 tok/s con drafter y 208 tok/s sin el, RTX 3090, archivo de 2 min | MIT | HuggingFace, requiere rama `dflash2` de vibevoice.c |
| microsoft/VibeVoice-ASR-Streaming-1.5B (modelo base) | 1,5B segun denominacion (no verificado) | No disponible | No disponible sin drafter | MIT, segun lo indicado por el autor del paquete | HuggingFace y repositorio microsoft/VibeVoice |
| Ar4ikov/VibeVoice-ASR-Streaming-7B-AWQ-W4A16-ASYM | 7B segun denominacion | Escribe texto cada 2,93 s de audio con 0,53 s de lookahead | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace, cuantizacion AWQ W4A16 asimetrica sobre microsoft/VibeVoice-ASR-Streaming-7B |
| Ar4ikov/VibeVoice-ASR-Streaming-1.5B-DFlash2-Drafter | 0,45 GB de pesos; 5 capas | No aplica, es un componente | Constituye el drafter del modelo de esta ficha | No disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos de benchmarks de precision que permitan comparar estos modelos frente a alternativas de ASR de otros fabricantes, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo con 0 descargas y 0 likes en el momento de redactar la ficha: no hay validacion independiente de la comunidad ni reproduccion de los resultados por terceros.
- El paquete depende de una rama de desarrollo de vibevoice.c (`dflash2`, PR #48) que no esta incluida en una version estable. Usar el modelo en produccion implica seguir una rama movil mantenida por un unico autor.
- La garantia de transcripcion identica byte a byte se declara para `--draft-check exact` y para el escenario medido (greedy, BF16 ejecutado como FP16). Con otras configuraciones de verificacion, con muestreo no greedy o con cuantizacion int4 aplicada al modelo grande, esa equivalencia no esta garantizada por la informacion disponible.
- No hay benchmarks de precision publicados en este repositorio: no se conocen valores de WER ni de tasa de error de atribucion de hablante, ni comparacion con el modelo base sin drafter.
- Riesgo de alucinacion inherente a los modelos de ASR generativos: en tramos con silencio, ruido, solapamiento de voces o audio musical puede emitir texto plausible no pronunciado. No se documentan mecanismos de mitigacion ni umbrales de confianza en la informacion disponible.
- Idiomas: se declaran 10, pero la lista no esta disponible y no hay datos de rendimiento por idioma, por acento ni por variedad dialectal.
- No hay informacion sobre sesgos demograficos, de acento o de genero, ni sobre el tratamiento de hablantes no nativos.
- Licencia MIT declarada en el repositorio, pero el autor remite a la model card del modelo base para la licencia del modelo original. Conviene verificar los terminos vigentes de microsoft/VibeVoice-ASR-Streaming-1.5B antes de un uso comercial, especialmente si el marco de investigacion de VibeVoice incorpora condiciones adicionales.
- La fecha de creacion y la de actualizacion del repositorio estan separadas por dos minutos, lo que indica una publicacion unica sin historial de mantenimiento posterior.
- El recuento real de parametros (2.814.116.321) difiere notablemente de la cifra de 1,5B que aparece en el nombre, por lo que las estimaciones de memoria basadas en el nombre del modelo pueden quedarse cortas.
- Consumo de memoria: los pesos son solo una parte; la cache de claves/valores y las activaciones en sesiones de streaming concurrentes anaden un coste no cuantificado en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ar4ikov/VibeVoice-ASR-Streaming-1.5B-DFlash2
- Drafter DFlash 2: https://huggingface.co/Ar4ikov/VibeVoice-ASR-Streaming-1.5B-DFlash2-Drafter
- Modelo base: https://huggingface.co/microsoft/VibeVoice-ASR-Streaming-1.5B
- Modelo base (espejo de la organizacion vibevoice): https://huggingface.co/vibevoice/VibeVoice-ASR-Streaming-1.5B
- Repositorio de vibevoice.c: https://github.com/Ar4ikov/vibevoice.c
- Pull request con el soporte de DFlash 2: https://github.com/Ar4ikov/vibevoice.c/pull/48
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Repositorio de Microsoft VibeVoice: https://github.com/microsoft/VibeVoice
- Documentacion de ASR en streaming: https://github.com/microsoft/VibeVoice/blob/main/docs/vibevoice-asr-streaming.md
- Informe tecnico de VibeVoice-ASR-Streaming: https://arxiv.org/abs/2609.02812
- Variante de 7B cuantizada en AWQ W4A16: https://huggingface.co/Ar4ikov/VibeVoice-ASR-Streaming-7B-AWQ-W4A16-ASYM
