# Mikeslasi/magnit-bot

## Resumen

`Mikeslasi/magnit-bot` no es un modelo de inteligencia artificial en sentido estricto, sino un repositorio alojado en Hugging Face que contiene el codigo fuente de un bot de Telegram para el seguimiento de ofertas en tiendas de la cadena minorista rusa «Magnit». El autor, identificado como Mikeslasi, publica el proyecto bajo el tag `region:us` y sin metadatos de pipeline, licencia o idiomas declarados. El repositorio no incluye pesos de modelo, tokenizador ni configuracion de arquitectura neuronal.

La funcionalidad descrita en la model card consiste en monitorizar promociones en hasta diez tiendas seleccionadas por usuario y enviar notificaciones con foto del producto, nombre, descuento y direccion del establecimiento. El sistema se apoya en una base de datos SQLite gestionada con `aiosqlite` y en un mecanismo de copia de seguridad periodica hacia un dataset privado de Hugging Face mediante la API del Hub.

Dado que no existe informacion sobre parametros, arquitectura, contexto o datos de entrenamiento, esta ficha documenta exclusivamente lo que la model card expone: un proyecto de automatizacion de bajo nivel computacional, desplegable en servicios gratuitos como Render, y sin relacion con cargas de trabajo de inferencia de modelos generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene codigo de aplicacion, no un modelo neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card esta redactada en ruso) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el contenido son ficheros Python, `requirements.txt` y configuracion) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal ni proceso de entrenamiento. El repositorio organiza el codigo en modulos Python: `bot/main.py` como punto de entrada con polling de Telegram y servidor HTTP de health check, `bot/handlers.py` para comandos y menus, `bot/monitor.py` para el sondeo en segundo plano de ofertas, `bot/magnit_api.py` como cliente de la API de promociones de magnit.ru, `bot/store_search.py` para geocodificacion y busqueda de tiendas mediante el endpoint `stores-facade`, `bot/database.py` para persistencia SQLite con `aiosqlite` y `bot/hf_storage.py` para copia de seguridad y restauracion de la base de datos en Hugging Face.

El unico mecanismo destacable es la estrategia de persistencia: la base de datos se respalda automaticamente en un dataset privado del Hub cada diez minutos, ante cambios y al detener el servicio, y se restaura al arrancar. No hay indicios de uso de modelos de lenguaje, embeddings, RLHF, DPO ni tecnicas de decodificacion.

## Capacidades

- Seguimiento de promociones en hasta diez tiendas «Magnit» por usuario.
- Envio de notificaciones por Telegram con foto del producto, nombre, porcentaje de descuento y direccion de la tienda.
- Busqueda de tiendas mediante geocodificacion y consulta al endpoint `stores-facade`.
- Persistencia de usuarios, tiendas suscritas y ofertas ya enviadas en SQLite.
- Copia de seguridad automatica y restauracion de la base de datos contra un dataset privado de Hugging Face.
- Servidor HTTP de health check para mantener activo el servicio en plataformas gratuitas.
- No soporta tool calling generico, razonamiento multi-paso, vision, audio ni capacidades multilingues propias de un modelo generativo.

## Casos de uso

- Monitorizacion personal de ofertas: un usuario suscribe hasta diez tiendas de su ciudad y recibe avisos con imagen y descuento cuando aparece una promocion, evitando revisar manualmente la web de magnit.ru.
- Despliegue de bajo coste en Render: el plan gratuito junto con un ping HTTP cada cinco minutos mediante UptimeRobot permite mantener el bot operativo de forma continua sin infraestructura propia.
- Automatizacion de alertas de precio para colectivos: comunidades de vecinos o grupos familiares pueden compartir un mismo bot configurado con las tiendas de su zona para recibir promociones relevantes.
- Respaldo duradero de suscripciones: el volcado periodico a un dataset privado de Hugging Face protege la lista de usuarios y tiendas frente a reinicios o perdidas del contenedor en plataformas efimeras.
- Base para integraciones con la API de magnit.ru: el modulo `magnit_api.py` puede reutilizarse como cliente para otros proyectos que necesiten consultar promociones del minorista.
- Prototipo educativo de bots de Telegram con persistencia externa: el codigo sirve como referencia para implementar polling, health checks y sincronizacion de SQLite con el Hub.
- Experimentacion con geocodificacion y busqueda de puntos de venta: el modulo `store_search.py` ilustra el flujo geocodificacion → consulta de tiendas → filtrado por proximidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el proyecto no ejecuta inferencia de modelos neuronales.
- GPU: no requiere GPU dedicada; funciona con CPU.
- Hardware de consumo: cualquier maquina capaz de ejecutar Python 3 y SQLite, incluidos planes gratuitos de Render.
- Despliegue: ejecucion directa con `python -m bot.main` tras `pip install -r requirements.txt`; tambien desplegable como Web Service en Render con `PORT` inyectado por la plataforma.
- Variables de entorno necesarias: `BOT_TOKEN` (token de @BotFather), `HF_TOKEN` (token de Hugging Face con rol Write) y `HF_DB_REPO` (por ejemplo, `username/magnit-bot-data`).
- Latencia y throughput: no disponibles; dependen de la frecuencia de sondeo de la API de magnit.ru y de los limites de la API de Telegram.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada proyectos comparables de la misma categoria (bots de monitorizacion de ofertas minoristas con respaldo en Hugging Face) ni modelos neuronales con los que establecer una comparacion tecnica.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no debe evaluarse como tal ni emplearse para tareas de generacion, razonamiento o vision.
- No se declara licencia, por lo que el uso comercial y la redistribucion del codigo quedan sin marco legal explicito.
- Depende de la API no oficial de magnit.ru (`magnit_api.py` y `stores-facade`); cambios en dichos endpoints pueden romper el bot sin previo aviso.
- El despliegue gratuito en Render se suspende por inactividad; se requiere un ping HTTP externo cada cinco minutos para mantenerlo despierto.
- El respaldo en Hugging Face exige un token con permisos de escritura sobre un dataset privado; una filtracion del token compromete la base de datos de usuarios y suscripciones.
- La model card esta redactada unicamente en ruso y no documenta sesgos, tasas de error ni limites de uso.
- No hay informacion sobre cumplimiento de proteccion de datos (RGPD u equivalente) pese a almacenar identificadores de usuarios de Telegram y ubicaciones de tiendas.
- El tag `region:us` no implica residencia de datos ni cumplimiento normativo estadounidense.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Mikeslasi/magnit-bot
- Registro en Render: https://dashboard.render.com/register
- API de promociones de Magnit (referenciada en el codigo): https://magnit.ru
