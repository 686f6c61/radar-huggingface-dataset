# leolinflaship/python-proxy-guide-zh-tw

## Resumen

El repositorio `leolinflaship/python-proxy-guide-zh-tw` no contiene un modelo de inteligencia artificial, sino un articulo tecnico en chino tradicional sobre la configuracion de proxies HTTP y SOCKS en Python. Lo firma Leo Lin (林樂), product manager de FlashIP, un proveedor de servicios proxy con sede en Singapur, que declara explicitamente su conflicto de interes en la propia model card. El contenido compara el comportamiento de las tres librerias HTTP mas usadas del ecosistema Python (`requests`, `HTTPX` y `aiohttp`) frente a variables de entorno, autenticacion y transporte SOCKS.

El texto resulta relevante para desarrolladores que mantienen scrapers, clientes de API o pipelines de CI que deben salir a Internet a traves de un proxy corporativo, un escenario en el que los cambios de API de HTTPX (renombrado de `proxies` a `proxy` en la version 0.26 y eliminacion del parametro antiguo en la 0.28) y el comportamiento de `aiohttp`, que no lee variables de entorno salvo que se active `trust_env=True`, provocan fallos silenciosos frecuentes.

No existe arquitectura de red neuronal, pesos, tokenizador ni proceso de entrenamiento asociado: el repositorio es unicamente documentacion en Markdown con fragmentos de codigo. Cualquier ficha que lo trate como modelo de lenguaje seria incorrecta, por lo que las secciones tecnicas siguientes reflejan esa ausencia de datos de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es documentacion tecnica en Markdown) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino tradicional (contenido de la guia); no se declaran idiomas de modelo |
| Licencia | MIT |
| Formato de pesos | no disponible (no contiene pesos; solo texto y ejemplos de codigo Python/bash) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un transformer, MoE, SSM ni arquitectura hibrida alguna; tampoco hay dataset, tokens de entrenamiento, RLHF, DPO ni proceso de alineamiento. Se trata de un documento unico en Markdown que recopila, segun el autor, la informacion de las documentaciones oficiales de `requests`, `HTTPX` y `aiohttp`, centrada en tres areas: lectura de variables de entorno (`HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY`, `ALL_PROXY`), paso de credenciales y eleccion del esquema de transporte.

Como innovacion tecnica destacable dentro del propio contenido, la guia aclara que `HTTPS_PROXY` se declara habitualmente con esquema `http://` porque el cliente abre un tunel `CONNECT` contra el proxy y negocia TLS con el destino final, no con el proxy; solo se usa `https://` si el puerto de escucha del proxy soporta TLS. Tambien documenta la diferencia entre `socks5://` (resolucion DNS local) y `socks5h://` (resolucion DNS delegada al proxy), el uso de `mounts` en HTTPX para excluir dominios internos y la sustitucion en `aiohttp` 3.14 de `proxy_auth` por la cabecera `Proxy-Authorization` construida con `aiohttp.encode_basic_auth`.

## Capacidades

- Documentar el uso de proxies en `requests` mediante un diccionario con claves `http` y `https` que designan el esquema del destino, no el tipo de proxy.
- Explicar la migracion de HTTPX: parametro `proxy` en singular desde la version 0.26 y eliminacion de `proxies` en la 0.28, con `mounts` y `httpx.HTTPTransport` para reglas por dominio.
- Detallar el uso de `aiohttp` con proxy por peticion, proxy a nivel de `ClientSession` desde la version 3.11 y `trust_env=True` para leer variables de entorno y `~/.netrc`.
- Cubrir autenticacion basica con credenciales embebidas en la URL y codificacion de caracteres especiales mediante `urllib.parse.quote(password, safe="")`.
- Cubrir SOCKS5 mediante extras de instalacion (`requests[socks]`, `httpx[socks]`) y el paquete `aiohttp-socks` con `ProxyConnector.from_url`.
- Incluir una lista de comprobacion de diagnostico para proxies que no surten efecto: verificacion de IP de salida en `https://httpbin.org/ip`, errores `407 Proxy Authentication Required`, `TypeError` por parametros obsoletos y ausencia de timeout en `requests`.
- Recomendar buenas practicas de gestion de secretos (variables de entorno o gestores de claves) y de certificados corporativos (`REQUESTS_CA_BUNDLE` en lugar de `verify=False`).

## Casos de uso

- Migracion de codigo de `requests` a `aiohttp` en servicios con concurrencia: la guia identifica el fallo mas comun (el proxy deja de aplicarse porque `aiohttp` no lee variables de entorno por defecto) y muestra como activar `trust_env=True` o pasar `proxy=` por peticion.
- Actualizacion de clientes HTTPX tras cambios de version: permite corregir el `TypeError` que aparece al usar `proxies=` en versiones 0.28 o superiores, sustituyendolo por `proxy` o por `mounts`.
- Scrapers y clientes de API en redes corporativas: sirve como referencia para configurar `HTTP_PROXY`/`HTTPS_PROXY` y `NO_PROXY` de forma que el trafico interno a dominios como `.internal.example.com` no pase por el proxy.
- Depuracion de incidencias en CI/CD: la lista de comprobacion ordenada (IP de salida, `NO_PROXY`, `trust_env`, autenticacion, timeouts) reduce el tiempo de diagnostico cuando un job falla por timeout en un entorno sin salida directa a Internet.
- Integracion de proxies SOCKS5 en herramientas de scraping: documenta la eleccion entre `socks5` y `socks5h` segun se necesite resolucion DNS local o remota, relevante para dominios internos o resultados DNS dependientes de region.
- Configuracion de proxies con inspeccion TLS corporativa: propone usar `REQUESTS_CA_BUNDLE` con el certificado de la CA interna en lugar de desactivar la verificacion con `verify=False`.
- Formacion interna y documentacion de equipo: el documento puede servir como referencia unica para homogeneizar la configuracion de proxies entre las tres librerias mas usadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye mediciones de latencia, throughput ni comparativas cuantitativas; su contenido es exclusivamente cualitativo y de configuracion.

## Requisitos de hardware

- No aplica en el sentido de inferencia: no hay pesos ni necesidad de VRAM o GPU.
- Requisitos reales: un interprete de Python con `requests`, `httpx` y/o `aiohttp` instalados, y los extras `requests[socks]`, `httpx[socks]` o `aiohttp-socks` si se utiliza SOCKS.
- No requiere GPU; se ejecuta en cualquier maquina capaz de correr Python y alcanzar un proxy.
- Las versiones de las librerias condicionan el codigo: HTTPX 0.26 o superior para `proxy`, 0.28 o superior para la eliminacion de `proxies`; `aiohttp` 3.11 o superior para proxy a nivel de sesion y 3.14 o superior para el aviso de deprecacion de `proxy_auth`.
- No hay datos de latencia ni throughput publicados; el rendimiento dependera del proxy y de la red del usuario.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no es un modelo de IA. Como referencia documental, la guia cubre tres librerias cliente HTTP de Python, cuyas diferencias en el manejo de proxies resume el propio autor:

| Libreria | Lectura de variables de entorno | Parametro de proxy | Soporte SOCKS |
|---|---|---|---|
| requests | Si, por defecto | `proxies=` (diccionario) | Via `requests[socks]` |
| HTTPX | Si, con `trust_env=True` (por defecto) | `proxy=` o `mounts` | Via `httpx[socks]` |
| aiohttp | No por defecto; requiere `trust_env=True` | `proxy=` por peticion o por sesion (3.11+) | Via `aiohttp-socks` |

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no puede evaluarse con benchmarks de lenguaje; tratarlo como modelo en un catalogo seria un error categorico.
- Conflicto de interes declarado por el autor: trabaja en FlashIP, proveedor de proxies, y la guia incluye una mencion promocional a ese servicio.
- El contenido esta en chino tradicional, lo que limita su uso directo por lectores que solo manejan castellano o ingles.
- La exactitud tecnica depende de las versiones de las librerias en el momento de redaccion (fechas del repositorio: noviembre de 2026); futuras versiones de `requests`, `httpx` o `aiohttp` pueden invalidar fragmentos concretos.
- No se declaran idiomas del repositorio en los metadatos de Hugging Face, a pesar de que el contenido es claramente en chino tradicional.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- El uso comercial esta permitido por la licencia MIT, pero el contenido no incluye garantias ni soporte; los ejemplos usan credenciales ficticias (`proxy.example.com:3128`) que deben sustituirse.
- Riesgo de seguridad si se siguen malas practicas no advertidas con suficiente enfasis: credenciales en URL que pueden acabar en logs; la guia recomienda variables de entorno o gestores de secretos, pero no profundiza en rotacion ni en alcance minimo de permisos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/leolinflaship/python-proxy-guide-zh-tw
- Servicio del autor (mencionado en la guia): https://www.flaship.com
- Endpoint de verificacion de IP de salida citado en los ejemplos: https://httpbin.org/ip
- Documentacion de requests (referencia citada por el autor): no disponible en la informacion proporcionada
- Documentacion de HTTPX (referencia citada por el autor): no disponible en la informacion proporcionada
- Documentacion de aiohttp (referencia citada por el autor): no disponible en la informacion proporcionada
