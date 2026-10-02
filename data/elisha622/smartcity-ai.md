# Elisha622/smartcity-ai

## Resumen

`Elisha622/smartcity-ai` no es un modelo de lenguaje con pesos publicados, sino un repositorio de Hugging Face que contiene el codigo fuente y la documentacion de SmartCity AI, una plataforma de planificacion urbana y gestion de trafico orientada a las ciudades de Emiratos Arabes Unidos. El repositorio aparece con un tamano de 0,0 GB, cero descargas y cero likes, sin pipeline declarado, sin licencia y sin idiomas especificados en sus metadatos. No se han publicado pesos, ficheros safetensors ni GGUF.

Segun su model card, la plataforma consta de doce modulos que cubren analisis de trafico, servicios al ciudadano, respuesta de emergencia, mantenimiento viario, red de camaras CCTV y planificacion de infraestructuras a largo plazo. Funciona sobre la red viaria real de los EAU (unas 171.000 conexiones viales y cerca de 50.000 km ingestados desde OpenStreetMap y almacenados como geometria PostGIS `LINESTRING`), con enrutado A* sobre 136.000 nodos, geocodificacion difusa sobre 17.500 lugares con nombre y un cliente RTSP/ONVIF implementado a nivel de protocolo.

El interes del proyecto es, por tanto, de tipo arquitectonico y de ingenieria de datos, no de modelado. La propia model card distingue explicitamente entre componentes "reales" (enrutado, NLP basado en reglas, registro de infraestructuras, cliente de camaras) y componentes "modelados" (conteo de vehiculos por vision artificial, deteccion de dano viario y sintesis con LLM), que estan cableados detras de interfaces preparadas para sustituirse por un modelo entrenado. No hay informacion sobre ningun modelo entrenado propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se publican pesos; la model card describe una plataforma de software con enrutado A*, PostGIS, RTSP/ONVIF y NLP basado en reglas) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible en los metadatos; la model card menciona nombres de lugares en ingles como prioritarios y datos de los EAU |
| Licencia | no disponible |
| Formato de pesos | no aplica: el repositorio ocupa 0,0 GB y no contiene ficheros de pesos |

Otros datos del repositorio: autor `Elisha622`, creado el 25 de septiembre de 2026, actualizado el 1 de octubre de 2026, descargas 0, likes 0, tag `region:us`.

## Arquitectura y entrenamiento

No hay informacion sobre entrenamiento de ningun modelo: no se describen conjuntos de datos, numero de tokens, fases de RLHF o DPO, ni innovaciones de atencion. Lo que la model card describe es la arquitectura de una aplicacion: frontend y API servidos con `docker compose`, PostgreSQL con PostGIS en el puerto 5432, Redis en el 6379, MongoDB incluido en la arquitectura para tramas crudas de vision artificial y registros de LLM pero sin ninguna ruta de codigo que lo use todavia, y un perfil `full` opcional para levantarlo.

Los componentes tecnicos con implementacion real son: ingestacion de la red viaria de los EAU desde OpenStreetMap via Overpass; enrutado A* sobre 136.000 nodos con un 97 por ciento de conectividad y pesos de arista calculados por tiempo de viaje realimentados con congestion; geocodificacion difusa y busqueda inversa sobre unos 17.500 lugares con nombre (9.000 edificios, 4.200 servicios, 2.300 asentamientos, 1.950 hitos); cliente CCTV que habla RTSP (RFC 2326) sobre socket crudo con autenticacion Basic y Digest y parseo SDP, y ONVIF Profile S sobre SOAP con WS-Security `PasswordDigest`; clasificacion de quejas ciudadanas basada en reglas con analisis de sentimiento, extraccion de ubicacion y priorizacion; y analisis de corredores con deteccion de huecos y desvios sobre la red real. Los modulos de vision artificial (YOLO+ByteTrack para conteo de vehiculos, YOLO+SegFormer para dano viario) y la sintesis con LLM del planificador estan declarados como modelados, no medidos, y requieren GPU o una API de pago.

## Capacidades

- Analisis de trafico con interfaz preparada para YOLO+ByteTrack, actualmente con inferencia simulada.
- Deteccion de dano en calzada con interfaz preparada para YOLO+SegFormer, actualmente simulada.
- Analisis de quejas ciudadanas en produccion: clasificacion por reglas, sentimiento, extraccion de ubicacion, prioridad y enrutado, sin GPU.
- Prediccion de trafico con linea base estacional real y espacio para un modelo TFT o LSTM.
- Planificador urbano con recuperacion aumentada (RAG) real y sintesis LLM como punto de sustitucion.
- Cuadro de mando de gemelo digital y analitica gubernamental con KPI.
- Enrutado de emergencia y despacho mediante A* sobre la red viaria de los EAU.
- Cliente de red de camaras CCTV con RTSP y ONVIF Profile S reales, incluyendo descubrimiento de dispositivos y lectura de fabricante, modelo, firmware y URI de stream.
- Ingesta y consulta de la red viaria de los EAU y de los pasos fronterizos con Oman y Arabia Saudi.
- Registro de infraestructuras y puentes con URL de fuente publicada para cada cifra.
- Diseno de nuevas rutas con analisis de corredores, desvios y deteccion de huecos.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multimodales de audio ni modo de razonamiento explicito.

## Casos de uso

- Gestion de incidencias ciudadanas: el modulo de quejas clasifica texto libre, extrae la ubicacion y el sentimiento, asigna prioridad y enruta la queja al departamento correspondiente, sin necesidad de GPU y con volumen suficiente para una ciudad pequena o mediana.
- Enrutado de emergencias: los servicios de despacho pueden calcular la ruta mas rapida entre dos puntos reales de la red viaria emirati usando A* con pesos de tiempo de viaje, e informar de la distancia a la que ha quedado cada extremo respecto a la direccion solicitada.
- Planificacion de nuevas infraestructuras: el modulo de diseno de rutas permite evaluar corredores alternativos, medir desvios y detectar tramos sin cobertura, contrastando los resultados con proyectos ya financiados del registro de infraestructuras.
- Integracion de camaras de trafico: un operador con acuerdo de intercambio de datos puede conectar camaras ONVIF reales, obtener fabricante, modelo, firmware y URI de stream, y ejecutar analitica sobre el substream para no saturar el decodificador.
- Consulta de datos publicos de Dubai: cuando no existe acuerdo de acceso a camaras, la plataforma puede alimentarse de datos de trafico del gobierno de Dubai a traves de Dubai Pulse configurando las claves de API correspondientes.
- Geocodificacion y analisis de proximidad: busqueda difusa sobre nombres de calles y lugares, busqueda inversa desde coordenadas y consultas del tipo "que hay en un radio de 5 km", utiles para estudios de accesibilidad y cobertura de servicios.
- Prediccion estacional de trafico: con la linea base estacional real se pueden estimar patrones de demanda por epoca del ano y sustituir despues el componente por un TFT o LSTM cuando se disponga de GPU.
- Analitica gubernamental: el cuadro de mando agrega KPI operativos sobre la red, las quejas y el registro de infraestructuras para informes de seguimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye pesos de modelo ni evaluaciones de MMLU, HumanEval, GSM8K u otras. Las unicas cifras tecnicas declaradas en la model card son de ingenieria de datos y de red: aproximadamente 171.000 conexiones viales y 50.000 km de red, 136.000 nodos con un 97 por ciento de conectividad, unos 17.500 lugares con nombre y una advertencia de aviso cuando una direccion queda a mas de 1,5 km del punto ajustado.

## Requisitos de hardware

- La plataforma esta disenada para ejecutarse en un portatil, sin GPU y sin claves de API de pago, segun la model card.
- El despliegue base se levanta con `docker compose up -d --build`, con frontend en el puerto 3001 y documentacion de API en el 8001, PostgreSQL/PostGIS en el 5432 y Redis en el 6379.
- MongoDB queda fuera de la pila por defecto y se activa con `docker compose --profile full up -d`.
- La ingestacion inicial de la red viaria tarda entre 1 y 5 minutos y descarga datos de OpenStreetMap; el resto de funciones geograficas depende de ella.
- Los modulos de vision artificial y la sintesis con LLM requieren GPU o una API de pago; estan declarados como modelados y preparados para una sustitucion de un solo metodo.
- No se publican cifras de VRAM, latencia ni throughput. No disponible.
- No se especifican opciones de despliegue tipo vLLM, llama.cpp, Ollama o TGI, porque no hay pesos de modelo que servir.

## Comparativa con modelos similares

No disponible. Este repositorio no publica pesos ni un modelo al uso, por lo que no es comparable en parametros, contexto o rendimiento con modelos de lenguaje de la misma categoria. Como referencia de categoria funcional, la model card cita en su arquitectura interfaces para YOLO+ByteTrack, YOLO+SegFormer y TFT/LSTM, pero se trata de puntos de sustitucion declarados, no de componentes entrenados ni evaluados en este repositorio. Cualquier comparacion numerica con alternativas requeriria datos que no se han publicado.

## Limitaciones y advertencias

- No hay licencia declarada en los metadatos: se desconoce si el uso comercial esta permitido. Es un bloqueo serio para cualquier despliegue en produccion.
- El repositorio ocupa 0,0 GB y no contiene pesos; no es un modelo descargable ni ejecutable como tal, sino codigo y documentacion de una plataforma.
- Parte de las capacidades mas visibles estan explicitamente simuladas: conteo de vehiculos por vision artificial, deteccion de dano viario y sintesis con LLM en el planificador. Solo funcionaran de verdad tras integrar un modelo propio o una API externa.
- MongoDB figura en la arquitectura para tramas crudas y registros de LLM, pero ninguna ruta de codigo lo utiliza todavia.
- El analisis de quejas ciudadanas es basado en reglas, con las limitaciones de cobertura linguistica y de robustez propias de ese enfoque; no se declaran idiomas soportados.
- El cliente de camaras exige autorizacion explicita: la plataforma rechaza contactar con una camara cuyo registro no este marcado como `authorized`. En Dubai el CCTV de trafico lo opera la RTA y en Abu Dhabi el DMT / Integrated Transport Centre, y el acceso a alimentacion en directo requiere un acuerdo de intercambio de datos. Las camaras privadas requieren permiso escrito del propietario.
- Las contrasenas no se almacenan en base de datos: `credential_ref` referencia una variable de entorno o entrada de almacen de secretos resuelta en tiempo de llamada.
- La analitica debe ejecutarse sobre el substream; decodificar el stream principal de 4 MP por camara a escala de ciudad no es viable.
- La precision geografica esta acotada: cada ruta informa de la distancia a la que ha quedado ajustado cada extremo y avisa si supera 1,5 km respecto a la direccion.
- La cobertura se limita a los siete emiratos de los EAU, incluyendo Al Ain, Hatta y el oasis de Liwa; no se declara soporte para otras geografias.
- No se han publicado evaluaciones de sesgo, alucinacion ni robustez, al no existir un modelo entrenado que evaluar.
- Los resultados de la busqueda web asociados a esta consulta no guardan ninguna relacion con el repositorio y no se han utilizado como fuente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Elisha622/smartcity-ai
- Demo alojada en Hugging Face Spaces: https://elisha622-smartcity-ai.static.hf.space
- Dubai Pulse (datos de trafico del gobierno de Dubai citados en la model card): https://www.dubaipulse.gov.ae
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la busqueda web proporcionada. No disponible.
