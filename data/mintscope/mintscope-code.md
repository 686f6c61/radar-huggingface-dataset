# mintscope/mintscope-code

## Resumen

`mintscope/mintscope-code` es un repositorio alojado en Hugging Face cuyo contenido no se corresponde con un modelo de inteligencia artificial, sino con el codigo fuente de una aplicacion web llamada Outlaws. Se trata de un servicio orientado a comunidades de NFT que permite verificar la elegibilidad de carteras en listas blancas (allowlists) antes de que se abra una fase de mint, enviar alertas por Telegram cuando una fase se activa y gestionar suscripciones de pago en criptomonedas. El repositorio se publico el 21 de noviembre de 2026 y, en el momento de la consulta, registra 0 descargas y 0 likes.

La aplicacion esta construida sobre Node.js (con `npm install`, `npm start` y un servidor en el puerto 3000) y se despliega como un Docker Space en Hugging Face. Utiliza la API de OpenSea para consultar la elegibilidad mediante una firma SIWE (Sign-In With Ethereum) por cartera, sin que el servidor llegue a recibir claves privadas ni frases semilla. Incluye un plan gratuito (una cartera) y un plan Pro de pago (hasta 25 carteras, alertas y acceso beta a una funcion de auto-join).

Es relevante unicamente como ejemplo de publicacion atipica en Hugging Face: un producto SaaS empaquetado como repositorio, sin pesos, sin tokenizador y sin model card en el sentido habitual. No existe informacion tecnica sobre arquitectura de red neuronal, parametros, contexto ni entrenamiento, por lo que la ficha se limita a documentar lo que el autor declara y a marcar como no disponible todo lo demas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una aplicacion web Node.js) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene codigo fuente, no pesos) |

## Arquitectura y entrenamiento

No se trata de un modelo de aprendizaje automatico. El repositorio contiene una aplicacion de servidor escrita en JavaScript/Node.js que expone una API HTTP con endpoints para autenticacion por firma de cartera (`/api/auth/nonce`, `/api/auth/verify`), gestion de carteras (`/api/wallets/add`), consulta de elegibilidad (`/api/eligibility/:slug`), descubrimiento de drops (`/api/drops`), listas de seguimiento (`/api/watch`), facturacion (`/api/billing/submit`) y administracion (`/api/admin/pending`, `/api/admin/activate`). La persistencia por defecto es un almacen de ficheros JSON, con soporte opcional de PostgreSQL mediante `DATABASE_URL`.

El componente de "inteligencia" es externo: la aplicacion delega en la API de OpenSea la respuesta sobre allowlists, previa firma SIWE que debe incluir la declaracion de Terminos de Servicio de OpenSea para obtener el scope `read:eligibility`. El mensaje firmado se intercambia por un token ligado a la cartera. El despliegue se realiza mediante Docker (puerto 7860 en Spaces) y las migraciones se ejecutan al arrancar. No hay datos de entrenamiento, ajuste fino, RLHF ni innovaciones de inferencia porque no existe modelo.

## Capacidades

- Verificacion de elegibilidad en allowlists por fase y por cartera antes de la apertura del mint.
- Descubrimiento de drops: feed de proximos, recien acunados y destacados, filtrable por cadena.
- Gestion de multiples carteras: 1 en el plan gratuito, hasta 25 en Pro.
- Alertas por Telegram cuando una fase abre (aviso aproximado 30 minutos antes y aviso en el momento de apertura), solo en Pro.
- Validacion de sesiones propias de Alphabot y Tessera para la funcion beta de auto-join (en v0.1 solo valida y muestra la cuenta; el motor de entrada automatica esta en el roadmap).
- Facturacion en criptomonedas: el usuario envia ETH (Ethereum o Base por defecto) a `PAYMENT_ADDRESS` y pega el hash de la transaccion; la activacion es automatica si hay RPC configurado y confirmaciones suficientes, o manual desde `/admin`.
- Panel de administracion protegido por `ADMIN_TOKEN` para activar pagos no verificables.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling de LLM ni agentes basados en lenguaje natural.

## Casos de uso

- Verificacion previa a un mint para coleccionistas: el usuario firma una vez por cartera y consulta si esa cartera esta incluida en la allowlist de cada fase antes de que la fase se abra, evitando perder carreras FCFS por desconocimiento.
- Gestion de carteras multiples para traders de NFT: el plan Pro permite vigilar hasta 25 carteras, de modo que un operador puede comprobar de una sola vez la elegibilidad de todo su conjunto de direcciones.
- Alertas operativas para comunidades: un administrador de comunidad puede configurar el bot de Telegram para que los miembros reciban avisos cuando una fase esta a punto de abrir o acaba de abrir, reduciendo la dependencia de anuncios manuales en Discord.
- Despliegue de un servicio white-label para comunidades NFT: el codigo se puede publicar como Docker Space en Hugging Face en unos 10 minutos y revenderse a comunidades, tal como el autor declara en la model card.
- Cobro de suscripciones en cripto: el flujo de pago por transferencia ETH con verificacion de hash y confirmaciones sirve como pasarela sencilla para productos dirigidos a usuarios nativos de cripto.
- Entorno de pruebas para integraciones con OpenSea: los endpoints documentados (`/api/auth/nonce`, `/api/eligibility/:slug`, `/api/drops`) permiten construir prototipos sobre la API de OpenSea sin implementar la firma SIWE desde cero.
- Validacion de sesiones de Alphabot y Tessera: la version beta permite comprobar que una sesion de estas herramientas es valida y mostrar la cuenta asociada, como paso previo al futuro motor de entrada automatica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica VRAM ni GPU: la aplicacion no ejecuta inferencia de modelos.
- Requisitos de ejecucion: Node.js con `npm install` y `npm start`; servidor HTTP en el puerto 3000 en local y 7860 en Hugging Face Spaces.
- Almacenamiento: fichero JSON por defecto; se recomienda PostgreSQL gestionado (`DATABASE_URL`) antes de tener clientes reales, porque el almacen JSON se reinicia en cada reconstruccion del Space.
- Despliegue: Docker Space en Hugging Face, o cualquier host que ejecute el Dockerfile. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI porque no hay modelo que servir.
- Latencia y throughput: no disponibles; dependen de la API de OpenSea y del intervalo de monitorizacion (`MONITOR_INTERVAL_MINUTES`).
- Limitaciones operativas conocidas: las claves gratuitas de la API de OpenSea caducan a los 7 dias y provocan errores 401 en el endpoint de elegibilidad, por lo que el autor recomienda rotacion semanal con `npx @opensea/cli@latest auth request-key` (maximo 3 claves por hora e IP).

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no contiene un modelo de IA. Como referencia de categoria, se podria comparar con otras aplicaciones de seguimiento de allowlists para NFT, pero no se dispone de datos verificables sobre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, tokenizador, configuracion de arquitectura ni datos de entrenamiento. Cualquier uso que espere inferencia de lenguaje fallara.
- La licencia no esta declarada, lo que impide determinar si el uso comercial o la redistribucion estan permitidos.
- La model card advierte explicitamente de que la funcion de auto-join en v0.1 solo valida sesiones de Alphabot/Tessera y no ejecuta la entrada automatica; el autor pide no prometer a los compradores entrada con un clic hasta que se publique el motor.
- Dependencia critica de la API de OpenSea: sin `OPENSEA_API_KEY` valida la aplicacion no funciona; las claves gratuitas caducan cada 7 dias y hay limites de tasa.
- El almacen JSON por defecto se reinicia en cada reconstruccion del Space, con perdida de cuentas si no se configura PostgreSQL.
- Riesgo de seguridad si se modifican los flujos: la model card insiste en no solicitar frases semilla ni claves privadas y en mantener el diseno de una firma de solo lectura por cartera.
- `SESSION_SECRET` y `ADMIN_TOKEN` son secretos criticos; si se filtran, comprometen sesiones y el panel de administracion.
- La verificacion automatica de pagos depende de que haya un `RPC_*` configurado y de `PAYMENT_CONFIRMATIONS`; en caso contrario la activacion es manual y puede demorarse.
- No hay informacion sobre sesgos, alucinacion ni limitaciones de idioma porque no es un modelo generativo; estos apartados no aplican.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mintscope/mintscope-code
- Documentacion de claves de API de OpenSea: https://docs.opensea.io/reference/api-keys
