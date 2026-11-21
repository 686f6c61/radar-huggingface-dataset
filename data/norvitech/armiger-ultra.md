# NorviTech/armiger-ultra

## Resumen

Armiger Ultra es un clasificador de metadatos de BitTorrent desarrollado por NorviTech. Se trata de un transformer a nivel de byte con codificacion posicional RoPE (rotary position embeddings) de aproximadamente 8 millones de parametros, distribuido en formato ONNX. Su funcion es tomar los metadatos de un torrent —nombre, lista de ficheros y contadores suministrados— y predecir la categoria del contenido, estimar la disponibilidad del enjambre (swarm) y aplicar reglas de idioma y calibracion. Combina esas predicciones neuronales con un emparejamiento opcional contra catalogos de titulos.

La relevancia del modelo reside en su enfoque: no es un modelo generativo de proposito general, sino un clasificador especializado y muy ligero que se ejecuta en CPU sin necesidad de GPU ni de API de inferencia de pago. Los ficheros ONNX ocupan 33,3 MB en FP32 y 17,6 MB en INT8, lo que permite integrarlo en servicios de indexacion como Bitmagnet o Rats Search con un coste de recursos minimo. El autor documenta una observacion de despliegue de un servicio CPU completo con el SDK R13.13 que se mantuvo cerca de 2,1 GiB de memoria de contenedor durante una carga de trabajo de 628,8 segundos bajo un limite configurado de 4 GiB.

La model card es inusualmente cauta con sus propias cifras: retira un dato anterior de latencia en GPU (0,21 ms/item) por falta de evidencia reproducible, y advierte que las graficas comparativas publicadas estan bajo revision de procedencia, sin que establezcan el rendimiento verificado de la version actual. El modelo esta publicado bajo licencia Apache-2.0 y declara soporte para nueve idiomas en sus etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer a nivel de byte con RoPE (byte-level RoPE transformer) |
| Parametros totales | Aproximadamente 8 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP32 (33,3 MB) e INT8 (17,6 MB) en ONNX |
| Idiomas soportados | en, ja, fr, de, es, it, ru, ko, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es un transformer que opera directamente sobre bytes en lugar de tokens subword, con codificacion posicional rotatoria (RoPE). Con unos 8 millones de parametros, esta muy por debajo de los modelos de lenguaje convencionales; su diseno responde a una tarea de clasificacion acotada sobre cadenas de metadatos, no a generacion de texto libre. La entrada consiste en nombres de torrents, listas de ficheros y contadores suministrados por el sistema anfitrion.

La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Lo que si describe es el pipeline de inferencia: las predicciones neuronales se combinan con emparejamiento opcional contra catalogos de titulos, reglas de idioma sobre los metadatos, calibracion y estimaciones de disponibilidad del enjambre. El autor distingue explicitamente entre la interfaz ONNX independiente (standalone), el paquete Ultra de GitHub y la instantanea completa del SDK con activos adicionales de autoridad y politica, y advierte que no deben mezclarse ficheros sueltos de revisiones distintas, ya que la paridad de pesos no garantiza paridad de politica ni de salida.

## Capacidades

- Clasificacion de metadatos de BitTorrent en categorias de contenido (prediccion neuronal, no inspeccion del payload).
- Prediccion de metadatos complementarios: indicadores de audio/subtitulo, junk, contenido adulto y honeypot, tratados como predicciones o banderas de politica.
- Estimacion de disponibilidad del enjambre (swarm-availability).
- Reglas de idioma sobre los metadatos suministrados, con cobertura declarada de nueve idiomas.
- Emparejamiento opcional contra catalogos de titulos para reforzar la clasificacion.
- Calibracion de las salidas del clasificador.
- Ejecucion en CPU sin GPU ni API de pago.
- Integracion con Bitmagnet y Rats Search mediante guias de configuracion dedicadas.
- Interfaz Python a traves de `ArmigerUltraPipeline`, con opciones de modo RSI y comparticion opt-in.
- No soporta tool calling, agentes, vision, audio ni generacion de texto: es exclusivamente un clasificador.

## Casos de uso

- Indexacion de torrents en Bitmagnet: el modelo clasifica cada entrada importada por categoria y estima su disponibilidad, de modo que el indexador puede ordenar y filtrar resultados sin coste de GPU.
- Busqueda de medios en Rats Search: la clasificacion de nombres y listas de ficheros permite agrupar resultados por tipo de contenido y descartar entradas marcadas como junk o honeypot.
- Moderacion de catalogos: las banderas de contenido adulto y honeypot permiten aplicar politicas de filtrado antes de exponer resultados a los usuarios.
- Enrutado por idioma: las reglas de idioma sobre metadatos permiten dirigir cada entrada a la vista o al indice linguistico correspondiente entre los nueve idiomas declarados.
- Estimacion de salud del enjambre: la prediccion de disponibilidad sirve para priorizar en la interfaz los torrents con mayor probabilidad de estar activos.
- Despliegue en contenedor de bajos recursos: con 17,6 MB en INT8 y una observacion de ~2,1 GiB de memoria de contenedor para el SDK completo, encaja en un servicio CPU modesto o en un entorno edge.
- Normalizacion de catalogos heredados: el emparejamiento opcional contra catalogos de titulos ayuda a reconciliar nombres de fichero ruidosos con entradas canonicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks verificados en la informacion disponible. La model card incluye graficas comparativas (frente a modelos docentes en la nube y frente a clasificadores y parsers de torrents de codigo abierto), pero el propio autor advierte que estan bajo revision de procedencia, que combinan cohortes y paneles con recuentos de muestra distintos, y que no establecen el rendimiento de la version actual ni la precision de la ruta neuronal independiente. El dato anterior de 0,21 ms/item en GPU ha sido retirado por falta de evidencia reproducible sobre hardware, lote, identidad del modelo y alcance de la medicion.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta pensado para ejecucion en CPU.
- Tamano en disco: 33,3 MB (ONNX FP32) o 17,6 MB (ONNX INT8).
- Memoria: el autor observa cerca de 2,1 GiB de memoria de contenedor para un servicio CPU con el SDK R13.13 completo bajo un limite de 4 GiB; se trata de una observacion de despliegue, no de un minimo exigido.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente para la ruta standalone.
- Cabe en cualquier equipo consumer: si, incluidos equipos sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime, contenedor Docker (`ghcr.io/spencernorton/armiger-ultra:3.12.3`) y paquete Python (`armiger[ultra]`).
- Latencia y throughput: no se garantiza ninguna cifra end-to-end para la version actual, ni en CPU ni en GPU.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye especificaciones de clasificadores de metadatos de torrents alternativos con los que establecer una comparacion fiable de parametros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- El modelo clasifica unicamente los metadatos suministrados: no escucha audio, no inspecciona el contenido de los medios, no analiza ejecutables, no certifica la legalidad del contenido ni garantiza que una descarga sea segura o este disponible.
- Las salidas de audio/subtitulo, junk, contenido adulto y honeypot son predicciones o banderas de politica, no verificaciones.
- Las cifras comparativas publicadas estan bajo revision de procedencia y no acreditan el rendimiento de la version actual; los resultados historicos del modo hibrido no validan la precision de la ruta neuronal independiente.
- No se garantiza latencia ni throughput end-to-end para la version actual; el dato previo de 0,21 ms/item en GPU fue retirado.
- Riesgo de alucinacion en el sentido de clasificaciones erroneas sobre nombres ambiguos o mal formados; el autor no publica tasas de error por categoria.
- No deben mezclarse ficheros de configuracion o helpers de revisiones distintas del repositorio: la coincidencia de pesos no implica paridad completa de politica y salida.
- La licencia Apache-2.0 permite uso comercial, pero el usuario asume la responsabilidad sobre las politicas de contenido que aplique con las banderas del modelo.
- La longitud de contexto no esta documentada, lo que limita la planificacion de entradas con listas de ficheros muy extensas.
- Los sesgos especificos del modelo no estan documentados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NorviTech/armiger-ultra
- Modelo standalone (INT8): https://huggingface.co/NorviTech/armiger
- Repositorio de software y configuracion: https://github.com/spencernorton/armiger
- Release v3.12.0: https://github.com/spencernorton/armiger/releases/tag/v3.12.0
- Guias de configuracion (Bitmagnet, Rats Search): https://github.com/spencernorton/armiger#choose-your-setup
- Documentacion de referencia e instalacion en Python: https://github.com/spencernorton/armiger/blob/main/docs/reference.md#python-installation
- Estado de evaluacion: https://github.com/spencernorton/armiger/blob/main/docs/evaluation.md
- Recursos y alcance de las mediciones: https://github.com/spencernorton/armiger/blob/main/docs/resources.md
- Vision general de modelos de NorviTech: https://norvitech.com/ai-models/#armiger
