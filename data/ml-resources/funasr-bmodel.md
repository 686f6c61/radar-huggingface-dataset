# ml-resources/FunASR-bmodel

## Resumen

FunASR-bmodel es un paquete de reconocimiento automatico del habla (ASR) en chino distribuido en formato `bmodel`, el formato de modelo compilado para aceleradores TPU de Sophgo. El repositorio analizado es un espejo no oficial: el autor original es `wlc952` en ModelScope y el espejo en HuggingFace lo publica el usuario `ml-resources`, que declara explicitamente que no se trata de un lanzamiento oficial y que los derechos permanecen en los autores originales. El modelo se apoya en la cadena FunASR, aunque la model card no especifica ni la arquitectura concreta ni el modelo base del que deriva.

El caso de uso documentado no es la transcripcion generica, sino la monitorizacion de audio en tiempo real en entornos de vigilancia: el paquete incluye un script (`bmodel/monitor.py`) que consume un flujo RTSP, analiza ventanas de 10 segundos por defecto y detecta voz humana que no corresponde a la locucion del sistema, generando alertas en disco y enviandolas por HTTP a un endpoint de seguridad. Para ello usa un audio de referencia del sistema y una lista de frases del sistema (`system_phrases.txt`) que permiten filtrar los mensajes reproducidos por el propio sistema de megafonia y evitar falsos positivos.

Es relevante en el nicho de despliegue en el borde (edge) sobre hardware Sophgo: frente a soluciones ASR que requieren GPU, este paquete entrega los pesos en un formato ya compilado para TPU, con un proyecto Python gestionado con `uv`. Su difusion es practicamente nula (0 descargas y 0 likes en el momento del analisis), la licencia no esta declarada y no se publican metricas de rendimiento, por lo que debe evaluarse como un artefacto experimental de integracion vertical (modelo + script de monitorizacion) mas que como un modelo de proposito general listo para produccion.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. Solo se indica la pertenencia a la familia FunASR y el formato de despliegue `bmodel` para TPU de Sophgo |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible (modelo de audio, no aplica contexto de tokens). El script de ejemplo procesa ventanas de 10 s configurables con `--chunk-seconds` |
| Tipos de cuantización | No disponible. El formato `bmodel` es un artefacto compilado; la model card no indica si la cuantizacion es int8, bf16 u otra |
| Idiomas soportados | Chino (`zh`), segun los metadatos del repositorio |
| Licencia | `unknown`. No declarada en el origen; el espejo indica que todos los derechos quedan con los autores originales |
| Formato de pesos | `bmodel` (formato compilado para TPU Sophgo), acompanado de un proyecto Python gestionado con `uv` |
| Tarea declarada (`pipeline_tag`) | `automatic-speech-recognition` |
| Tamaño del repositorio | 0,8 GB |
| Entrada de audio en el flujo documentado | RTSP (`--rtsp`), audio de referencia del sistema (`--system-audio`) y lista de frases del sistema (`--system-phrases`) |
| Salida documentada | Alertas guardadas en `/data/alarms` (mapeado a `/static` via nginx) y notificaciones HTTP mediante `post_alert()` |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura del modelo. Los unicos datos tecnicos disponibles son las etiquetas del repositorio (`funasr`, `asr`, `speech-recognition`, `sophgo`, `bmodel`, `tpu`, `edge`) y la presencia de pesos en formato `bmodel`, lo que implica que el modelo ha pasado por un proceso de conversion y compilacion para el runtime de TPU de Sophgo en lugar de distribuirse en formatos de pesos genericos como safetensors o GGUF. No se especifica si el modelo subyacente es un encoder de tipo transformer, un esquema no autorregresivo ni un modelo hibrido; tampoco se detallan capas, dimensiones ocultas ni vocabulario.

Tampoco hay informacion sobre el entrenamiento: numero de tokens o miles de horas de audio, composicion del dataset, idioma o acentos cubiertos, uso de tecnicas de ajuste como RLHF o DPO, ni metodos de decodificacion (por ejemplo, decodificacion especulativa o atencion lineal). La model card se limita a instrucciones de instalacion y ejecucion. Cualquier afirmacion sobre el modelo base de FunASR empleado seria especulativa y no se incluye aqui.

## Capacidades

- Reconocimiento automatico del habla en chino (`zh`), orientado a audio de vigilancia capturado desde un flujo RTSP.
- Segmentacion en ventanas temporales configurables (por defecto, 10 segundos) para procesamiento continuo de audio.
- Discriminacion entre locucion del sistema y voz humana ajena al sistema: la lista de frases de `system_phrases.txt` se usa para filtrar las emisiones del propio sistema. El parametro `--system-audio` se describe como "audio de referencia del sistema" y asigna al hablante del sistema la etiqueta `spk=0`, lo que apunta a algun tipo de etiquetado o comparacion de hablante, aunque este punto no se detalla en la documentacion.
- Deteccion de actividad de voz con generacion de alertas: las alarmas se guardan localmente y se envian por HTTP a un endpoint de seguridad (`post_alert`).
- Ejecucion offline de prueba mediante `bmodel/offline.py`, util para validar el modelo sin flujo de red.
- Soporte de tool calling o function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible (no aplica a un modelo ASR).
- Vision, audio generativo u otras modalidades: no disponible.

## Casos de uso

- Monitorizacion de salas de control y recintos cerrados: el flujo documentado consume un stream RTSP, analiza fragmentos de 10 segundos y alerta cuando detecta voz humana distinta de la locucion del sistema. Es el escenario para el que se publica el script `monitor.py`.
- Filtrado de megafonia en estaciones, aeropuertos o grandes superficies: las frases pregrabadas del sistema se incorporan a `system_phrases.txt` para que no disparen alarmas. El parametro `--system-audio` permite ademas aportar una referencia de audio del sistema como prefijo.
- Vigilancia perimetral con camaras IP: se pasa la URL RTSP de la camara con credenciales (`rtsp://user:pass@ip:554/Streaming/Channels/101` segun el ejemplo de la model card) y las alarmas quedan en `/data/alarms`, expuestas por nginx en `/static` para su revision desde un panel web.
- Auditoria de presencia de personal en zonas restringidas fuera de horario: la deteccion de voz humana en un canal de audio de la instalacion permite registrar eventos y enviarlos al sistema de seguridad mediante `post_alert`.
- Transcripcion por lotes en el borde: `offline.py` permite procesar ficheros de audio ya capturados sobre hardware Sophgo, sin depender de una GPU ni de servicios en la nube, lo que resulta util en entornos con requisitos de soberania de datos.
- Integracion en NVR o grabadores con SoC Sophgo: al distribuirse como `bmodel`, el artefacto encaja en dispositivos con TPU de Sophgo donde no es viable desplegar un ASR basado en GPU.
- Verificacion de la cadena de conversion: el paquete sirve como referencia practica para equipos que necesiten compilar modelos FunASR a `bmodel`, comparando comportamiento entre `offline.py` y `monitor.py`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de error de palabras (WER/CER), comparaciones con otros sistemas ASR, ni mediciones de latencia o throughput. Tampoco hay datos de evaluacion en la busqueda web realizada.

## Requisitos de hardware

- El formato `bmodel` esta ligado a los aceleradores TPU de Sophgo; no se especifica el SoC concreto soportado. Se requiere el runtime de Sophgo correspondiente para cargar los pesos.
- VRAM para inferencia en GPU: no aplica. El artefacto no se distribuye en formatos ejecutables en CUDA (safetensors, GGUF, etc.).
- GPU recomendadas (A100, H100, RTX 4090): no disponible. No es la via de despliegue prevista por el formato.
- Compatibilidad con GPU de consumo: no disponible para este artefacto. Ejecutarlo en una GPU exigiria reconvertir el modelo original de FunASR, algo que no cubre este repositorio.
- Despliegue previsto: dispositivo con TPU Sophgo en el borde, mas un entorno Python creado con `uv` (`uv sync`, `source .venv/bin/activate`).
- Memoria en disco: el repositorio ocupa 0,8 GB; el espacio en el dispositivo debe cubrir tambien el entorno virtual y las alertas almacenadas en `/data/alarms`.
- Latencia: no se publica ninguna medicion. Como referencia de diseno, el script usa una ventana de deteccion de 10 segundos por defecto (`--chunk-seconds 10`), por lo que la deteccion de un evento no puede ser inferior a ese tamano de ventana salvo que se reduzca el parametro.
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. Las busquedas web realizadas no devolvieron resultados relacionados con el modelo, FunASR, Sophgo o modelos ASR alternativos, sino paginas sin relacion alguna (desambiguaciones de "ML", anuncios de vehiculos, conversiones de unidades y un videojuego movil). Tampoco la model card ofrece comparaciones.

Como contexto cualitativo, este artefacto pertenece a la categoria de ASR para chino desplegado en el borde sin GPU, donde los puntos de comparacion habituales serian otros paquetes derivados de FunASR o modelos ASR multilingues. Sin embargo, no se aportan parametros, contextos, licencias ni cifras de rendimiento de este modelo ni de esas alternativas, por lo que cualquier tabla seria especulativa.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FunASR-bmodel (este modelo) | No disponible | No aplica (ventana de 10 s en el script) | No disponible | `unknown` | Espejo en HuggingFace, origen en ModelScope |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia `unknown`: no se declara licencia en el origen. No puede asumirse permiso de uso comercial, modificacion ni redistribucion. El espejo indica que todos los derechos permanecen en los autores originales.
- Es un espejo no oficial: el propio repositorio advierte de que no es un lanzamiento de los autores y que el credito corresponde a `wlc952` en ModelScope. La trazabilidad y el mantenimiento no estan garantizados.
- Sin validacion publica: 0 descargas, 0 likes y ninguna metrica de WER, latencia o robustez. Cualquier uso en produccion exige una evaluacion propia con el audio real del emplazamiento.
- Cobertura linguistica limitada al chino (`zh`) segun los metadatos; el comportamiento con acentos, dialectos, ruido industrial, musica o habla solapada no esta documentado.
- Riesgo de falsos positivos y falsos negativos: el propio manual indica que, si el sonido del sistema se reporta por error, hay que anadir el texto reconocido a `system_phrases.txt`. Esto implica un ajuste manual continuo y un riesgo real de alarmas espurias.
- Dependencia de hardware: el formato `bmodel` ata el despliegue a TPU de Sophgo. No hay ruta directa a GPU de consumo ni a plataformas de servido habituales como vLLM, TGI, Ollama o llama.cpp.
- Configuracion propensa a errores: la model card pide modificar el codigo fuente para ajustar la IP (`get_local_ip_fallback()`) y el endpoint de alertas (`post_alert`). Un error aqui puede dirigir alertas a un destino incorrecto.
- Seguridad del despliegue: el flujo de ejemplo maneja credenciales RTSP embebidas en la URL y las alertas quedan expuestas mediante nginx en `/static`. Conviene revisar control de acceso, retencion y proteccion de datos personales (audio de personas identificables).
- Latencia minima acotada por la ventana de deteccion: con el valor por defecto de 10 segundos, la reaccion no puede ser inmediata.
- Alucinacion: en un sistema ASR este riesgo se manifiesta como transcripciones incorrectas del audio, no como texto inventado de forma autonoma; no hay datos de tasa de error para cuantificarlo.
- Sesgos: no hay informacion sobre la composicion del conjunto de entrenamiento, por lo que no puede evaluarse el sesgo por acento, genero, edad o condicion acustica.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ml-resources/FunASR-bmodel
- Origen en ModelScope (autor original `wlc952`): https://www.modelscope.cn/models/wlc952/FunASR-bmodel
- Clon del proyecto de origen indicado en la model card: https://www.modelscope.cn/wlc952/FunASR-bmodel.git
- Proyecto FunASR: no se proporciona enlace en la informacion disponible.
- Documentacion del runtime o toolchain de Sophgo para `bmodel`: no se proporciona enlace en la informacion disponible.
- Paper o blog tecnico del modelo: no disponible.
