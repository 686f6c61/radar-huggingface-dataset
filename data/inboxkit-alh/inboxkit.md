# inboxkit-alh/inboxkit

## Resumen

inboxkit no es un modelo de inteligencia artificial. Es un servicio HTTP escrito en Python que genera buzones de correo desechables en lote para probar flujos propios de registro, verificacion y onboarding. El repositorio de HuggingFace con ID `inboxkit-alh/inboxkit` contiene la model card de esta herramienta, no pesos ni artefactos de un modelo entrenado: no hay arquitectura neuronal, parametros, tokenizador ni dataset asociado.

El servicio ofrece dos backends bajo la misma API. El backend `local` (por defecto) no requiere credenciales ni servicios de terceros: genera N direcciones unicas sobre un dominio que el propio usuario controla, ya sea mediante catch-all (`checkout-a1b2c3d4@yourdomain.com`) o mediante plus-addressing (`you+checkout-a1b2c3d4@gmail.com`), y el correo acaba en un buzon que el usuario ya posee. El backend `mailslurp` crea buzones reales y legibles a traves de la API de MailSlurp, lo que permite que la aplicacion cliente recupere el codigo de verificacion o el enlace de activacion; este modo exige la variable de entorno `MAILSLURP_API_KEY`.

La relevancia es de tipo operativo, no de investigacion: automatiza la parte mas fragil de las pruebas end-to-end de registro (obtener direcciones unicas, esperar la llegada del codigo y extraerlo) y la expone como endpoints consumibles desde `pytest`, CI o cualquier cliente HTTP. La ficha que sigue refleja esta naturaleza: los apartados propios de un modelo de lenguaje se marcan como no disponibles o no aplicables, sin inventar cifras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica: no es un modelo de IA; es una aplicacion HTTP (API REST) construida con FastAPI y servida con uvicorn |
| Parametros totales | no aplica |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (la model card y la interfaz estan en ingles; no se declara soporte multilingue) |
| Licencia | no disponible (no declarada en la informacion proporcionada) |
| Formato de pesos | no aplica: no hay pesos; el repositorio contiene codigo Python y un `requirements.txt` |
| Lenguaje de implementacion | Python (instalacion mediante `pip install -r requirements.txt`) |
| Backends soportados | `local` (por defecto) y `mailslurp` |
| Variables de entorno | `INBOXKIT_PROVIDER`, `INBOXKIT_DOMAIN`, `INBOXKIT_MODE`, `INBOXKIT_BASE`, `MAILSLURP_API_KEY`, `INBOXKIT_MAX_BULK` |
| Limite de creacion masiva | 200 direcciones por llamada (`INBOXKIT_MAX_BULK`, valor por defecto) |
| Interfaz web | UI en `http://127.0.0.1:8000` y documentacion OpenAPI en `/docs` |
| Pruebas | `pytest -q` |
| Descargas en HuggingFace | 0 |
| Likes en HuggingFace | 0 |
| Fecha de creacion del repositorio | 2026-09-18T00:52:42.000Z |
| Fecha de ultima actualizacion | 2026-09-18T00:52:48.000Z |

## Arquitectura y entrenamiento

No existe entrenamiento. inboxkit es una aplicacion de servidor sin fase de preentrenamiento, ajuste fino, RLHF ni DPO, y por tanto no hay datos de entrenamiento, numero de tokens, composicion de dataset ni innovaciones de atencion que describir. Su "arquitectura" es la de un servicio web: una API REST expuesta por FastAPI y arrancada con `uvicorn app.main:app`, con una capa de persistencia del listado de buzones creados, una capa de generacion de direcciones y una capa de abstraccion de proveedor de correo con dos implementaciones intercambiables (`local` y `mailslurp`).

La unica decision de diseno reseñable es la doble estrategia de direccionamiento del backend local. El modo catch-all genera direcciones sinteticas sobre un dominio controlado por el usuario, de modo que cualquier cadena con el formato `etiqueta-identificador@midominio.com` es aceptada; el modo plus genera variantes `usuario+etiqueta-identificador@proveedor.com` sobre una cuenta de correo existente. En ambos casos el mensaje llega a una bandeja real del usuario, sin dependencia de terceros. El backend `mailslurp` delega en la API documentada de MailSlurp cuando se necesita leer el contenido del mensaje de forma programatica desde el propio servicio. La API incluye extraccion de codigos y enlaces a partir del mensaje recibido, y un endpoint de sondeo (`/inboxes/{id}/code?timeout=60`) que espera hasta que el codigo aparece.

## Capacidades

- Creacion masiva de direcciones de correo unicas: `POST /inboxes/bulk` con `{"count": 50, "tag": "checkout"}` devuelve 50 direcciones etiquetadas.
- Listado y exportacion: `GET /inboxes` y `GET /inboxes.csv` para volcar los buzones creados a fixtures de pruebas en formato CSV.
- Lectura de mensajes con extraccion semantica: `GET /inboxes/{id}/messages` devuelve los mensajes con un campo `code` ya parseado y una lista de `links`.
- Sondeo con espera activa: `GET /inboxes/{id}/code?timeout=60` bloquea hasta que llega el codigo de verificacion o se agota el tiempo.
- Limpieza: `DELETE /inboxes/{id}` y `DELETE /inboxes` para eliminar un buzon o todos.
- Dos modos de generacion local de direcciones: catch-all sobre dominio propio y plus-addressing sobre una cuenta existente.
- Integracion con MailSlurp cuando se requieren buzones reales y legibles mediante API.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling de modelos ni capacidades de agente. La unica "herramienta" que expone es su propia API HTTP.

## Casos de uso

- Pruebas end-to-end de registro: el flujo de ejemplo de la propia model card crea un buzon, hace `POST` al endpoint `/signup` de la aplicacion bajo prueba, sondea `/inboxes/{id}/code` y envia el codigo a `/verify`; despues elimina el buzon. Es el caso de uso central de la herramienta.
- Automatizacion en CI/CD: al ser una API HTTP local sin credenciales en modo `local`, puede levantarse como servicio auxiliar en un pipeline y consumirse desde `pytest` para validar cada ejecucion con direcciones distintas y evitar colisiones entre tests.
- Verificacion de onboarding con multiples usuarios: `POST /inboxes/bulk` permite generar en una sola llamada hasta 200 direcciones etiquetadas (por ejemplo `tag: "checkout"`), util para probar flujos que dependen de varios usuarios concurrentes.
- Pruebas de recuperacion de contrasena y activacion de cuenta: el parseo de `code` y `links` en `/inboxes/{id}/messages` sirve tanto para codigos numericos como para enlaces de activacion enviados por correo.
- Desarrollo local sin dependencias externas: con `INBOXKIT_PROVIDER=local` y un dominio propio con catch-all, el equipo evita cuotas, costes y claves de terceros durante el desarrollo diario.
- Pruebas de deliverability y plantillas de correo transaccional: al recibir los mensajes en un buzon controlado se puede comprobar el contenido renderizado y extraer enlaces para validar aserciones sobre el correo enviado.
- Regresion de flujos de invitacion o referidos: generar direcciones con etiquetas distintas permite modelar invitador e invitado en el mismo test y limpiar despues con `DELETE /inboxes`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No aplica en cualquier caso: inboxkit no es un modelo evaluable con MMLU, HumanEval, GSM8K ni metricas equivalentes, y la model card no incluye ningun dato de latencia, throughput o rendimiento.

## Requisitos de hardware

- VRAM: no aplica. Es un servicio Python sin inferencia, por lo que no requiere GPU.
- GPU recomendadas: ninguna. No se necesita acelerador para ejecutarlo.
- GPU de consumo: irrelevante; el servicio puede correr en CPU.
- Requisitos reales: un interprete de Python con las dependencias de `requirements.txt`, conectividad de red hacia el proveedor de correo (solo en modo `mailslurp`) y, en modo `local`, un dominio o cuenta de correo configurados para catch-all o plus-addressing.
- Opciones de despliegue: `uvicorn app.main:app --reload` en desarrollo; cualquier contenedor o servicio capaz de ejecutar una aplicacion ASGI en produccion. La informacion proporcionada no detalla configuracion de workers, contenedores ni orquestacion.
- Latencia y throughput: no disponibles. El unico tiempo documentado es el parametro `timeout=60` del endpoint de sondeo de codigos, que es un limite de espera, no una medida de rendimiento.

## Comparativa con modelos similares

No es un modelo, por lo que no procede compararlo con modelos de lenguaje. En su categoria real (utilidades de buzon desechable para pruebas), la unica alternativa mencionada en la propia model card es MailSlurp, que de hecho se integra como backend opcional. No hay datos en la informacion proporcionada sobre otras herramientas comparables.

| Alternativa | Relacion con inboxkit | Datos disponibles |
|---|---|---|
| MailSlurp | Proveedor externo de buzones reales; se usa como backend opcional mediante `MAILSLURP_API_KEY` | Solo se indica que expone una API documentada y que requiere clave; cuotas, precios y limites: no disponibles |
| Backend `local` de inboxkit | Genera direcciones catch-all o plus sobre infraestructura propia | Sin credenciales ni servicios de terceros; limite de 200 direcciones por llamada bulk |
| Otras herramientas de correo desechable | No se han encontrado en la informacion proporcionada | no disponible |

## Limitaciones y advertencias

- No es un modelo de IA: cualquier evaluacion como modelo de lenguaje carece de sentido, y los apartados de parametros, contexto, cuantizacion e idiomas no son aplicables.
- El repositorio presenta 0 descargas y 0 likes, sin licencia declarada y sin pipeline ni idiomas definidos; se desconoce si el proyecto se mantiene.
- La ausencia de licencia explicita impide determinar las condiciones de uso comercial. Debe aclararse con el autor antes de integrarlo en un producto.
- Uso previsto restrictivo: la propia model card indica que la herramienta esta pensada para ejercitar servicios propios o para los que se tenga permiso, no para crear cuentas en servicios de terceros. Usarla contra sistemas ajenos puede vulnerar sus terminos de servicio y la normativa aplicable.
- El modo `local` con catch-all requiere control real del dominio configurado en `INBOXKIT_DOMAIN`; mal configurado, no recibira ningun mensaje y los sondeos agotaran el tiempo de espera.
- El modo plus-addressing depende de que el proveedor de correo del usuario soporte y preserve el sufijo `+etiqueta`; no todos lo hacen.
- El modo `mailslurp` introduce una dependencia externa, coste potencial y manejo de una clave secreta (`MAILSLURP_API_KEY`) que debe protegerse.
- El endpoint de sondeo de codigos puede bloquear hasta el `timeout` indicado (60 segundos en el ejemplo), lo que exige gestionar tiempos de espera en los tests para no colgar el pipeline.
- No se documentan medidas de autenticacion ni de control de acceso sobre la propia API de inboxkit; exponerla fuera de `127.0.0.1` permitiria a terceros crear y leer buzones. Este punto es una advertencia de despliegue y no una afirmacion sobre el codigo, que no se ha inspeccionado.
- Los resultados de la busqueda web asociados a esta consulta tratan sobre viajes a Pattaya (Tailandia) y no guardan ninguna relacion con el repositorio; no se han podido extraer enlaces tecnicos utiles de ellos.
- El campo `pipeline` de HuggingFace figura como no disponible y las etiquetas se reducen a `region:us`, lo que confirma que no hay artefactos de modelo publicados.
- Las fechas del repositorio (creacion y actualizacion el 2026-09-18, con seis segundos de diferencia) son las reportadas por HuggingFace; no se dispone de historial de cambios ni de versionado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/inboxkit-alh/inboxkit
- Referencia a la API de MailSlurp: mencionada en la model card como proveedor del backend `mailslurp`, sin URL concreta en la informacion proporcionada.
- Documentacion de la propia API: disponible en tiempo de ejecucion en `http://127.0.0.1:8000/docs` una vez arrancado el servicio.
- Interfaz web: disponible en tiempo de ejecucion en `http://127.0.0.1:8000`.
- Resultados de busqueda web: no relevantes (contenido turistico sobre Pattaya, Tailandia); no se han encontrado papers, blogs, repositorios ni demos asociados al proyecto.
