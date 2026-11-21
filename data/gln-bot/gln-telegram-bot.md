# gln-bot/gln-telegram-bot

## Resumen

`gln-bot/gln-telegram-bot` no es un modelo de inteligencia artificial: es un bot de Telegram escrito en Python que simula un juego de minería de puntos para la comunidad de una criptomoneda llamada GLN. El repositorio alojado en Hugging Face contiene el código fuente de la aplicación (Python + aiogram 3 + SQLite/Postgres), no pesos de un modelo de lenguaje, y su model card describe funcionalidades de juego, instalación y despliegue en servicios gratuitos (Render y Neon).

El bot permite a los usuarios "minar" puntos con temporizadores, invitar a amigos mediante códigos de referido y gastar esos puntos en mejoras de velocidad de minado o reducción de tiempos de espera. Según el autor, los puntos se convertirán en tokens GLN en un evento TGE (Token Generation Event) futuro; en esta fase no existe integración on-chain. La interfaz de usuario está en árabe según la model card (`app/texts.py`).

Es relevante únicamente como ejemplo de proyecto de automatización de Telegram con fines de gamificación y captación de usuarios, no como artefacto de IA. No contiene arquitectura de red neuronal, parámetros, ventana de contexto ni datos de entrenamiento, por lo que las secciones habituales de una ficha de modelo se completan indicando "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; aplicación Python con aiogram 3) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | árabe (textos del bot en `app/texts.py`, según model card); no disponible para otros idiomas |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de código fuente Python, sin pesos) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni pesos. La model card describe una aplicación de servidor construida con Python, la librería aiogram 3 para la API de Telegram y almacenamiento en SQLite en desarrollo o Postgres (Neon) en producción. El bot funciona por long-polling, sin webhook ni URL pública, y expone un endpoint de salud mínimo para mantener el servicio activo en Render.

No hay datos de entrenamiento, dataset, RLHF, DPO ni innovaciones de inferencia. La lógica de negocio (cooldown de minado de 4 horas por defecto, ventana de reclamación de 8 horas, bonus de referidos de 250 y 500 puntos, mejoras de +25 % por nivel y reducción de 15 minutos por nivel con suelo de 1 hora) reside en `app/game.py`.

## Capacidades

- Registro de usuarios mediante `/start`, con bonus de bienvenida y código de referido personal.
- Simulación de minado por temporizador: inicio de sesión, maduración tras un cooldown y reclamación dentro de una ventana de gracia.
- Sistema de referidos con enlaces `t.me` y recompensas escalonadas al primer reclamo del invitado.
- Tienda de mejoras que modifican la tasa de minado y el cooldown.
- Clasificación (leaderboard) de los 10 usuarios con más puntos acumulados.
- Medidas antiabuso: una cuenta por `user_id` de Telegram, una sesión activa por usuario, limitación a 1 acción por segundo y reclamación solo dentro de la ventana válida.
- Comandos de administración: `/stats` (usuarios, sesiones, reclamaciones, puntos emitidos) y `/broadcast <texto>`.
- No soporta tool calling, agentes, razonamiento, visión, audio ni generación de texto libre más allá de mensajes predefinidos.

## Casos de uso

- Gamificación de comunidad en Telegram: el bot mantiene la retención de usuarios mediante un bucle de minado con cooldown de 4 horas y recompensas por referidos, adecuado para proyectos que buscan crecimiento orgánico antes de un lanzamiento de token.
- Campañas de captación con seguimiento de referidos: cada usuario obtiene un enlace `t.me` único y el sistema contabiliza 250 puntos al alta y 500 al primer reclamo del invitado, lo que permite medir la eficacia de embajadores.
- Prueba de concepto de airdrop: la columna `users.total_earned` acumula los puntos vitalicios de cada usuario y puede exportarse con `sqlite3 gln_bot.db "SELECT id, total_earned FROM users"` como insumo para una futura asignación.
- Despliegue de bajo coste: la combinación Render Web Service gratuito más Neon Postgres (1 GB, escalado a cero) permite operar el bot sin tarjeta de crédito, con un pinger externo cada 10 minutos para evitar el apagado por inactividad de 15 minutos.
- Comunicación masiva a la base de usuarios: el comando `/broadcast <texto>` permite al administrador enviar anuncios a todos los usuarios registrados, útil para avisos de TGE o mantenimiento.
- Panel de métricas operativas: `/stats` ofrece recuentos de usuarios, sesiones, reclamaciones y puntos emitidos, suficiente para monitorizar la salud del juego sin infraestructura de analítica adicional.
- Base para prototipos de bots de Telegram con aiogram 3: el código y los tests (`python tests/test_logic.py`, sin necesidad de Telegram) sirven como plantilla para otros juegos o sistemas de puntos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene un modelo evaluable; no existen métricas de MMLU, HumanEval, GSM8K ni equivalentes.

## Requisitos de hardware

- VRAM: no aplica; el bot no ejecuta inferencia de modelos.
- CPU y memoria: un servicio web ligero de Python con aiogram 3 y SQLite o Postgres; cabe en el plan gratuito de Render (instancia compartida de baja capacidad).
- GPU: no requiere GPU.
- Almacenamiento: SQLite local en desarrollo; en producción, Neon Postgres gratuito de 1 GB con escalado a cero entre mensajes.
- Opciones de despliegue: Render Web Service (plan Free) con `render.yaml` incluido, o cualquier host que ejecute `python bot.py`; requiere las variables `GLN_BOT_TOKEN`, `ADMIN_IDS` y `DATABASE_URL`.
- Latencia y throughput: no disponibles; limitado por el long-polling de Telegram y por el throttle interno de 1 acción por segundo por usuario. Los servicios gratuitos de Render se suspenden tras 15 minutos de inactividad, por lo que se recomienda un pinger externo cada 10 minutos (750 horas de instancia gratuitas al mes cubren el uso continuo).

## Comparativa con modelos similares

No procede una comparativa con modelos de IA. Como referencia de proyectos del mismo tipo (bots de Telegram con gamificación), no se dispone de datos verificables en la información proporcionada para comparar parámetros, contexto o rendimiento. Indíquese "no disponible".

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto libre, no razona y no procesa lenguaje natural más allá de comandos fijos.
- Idiomas: los textos del bot están en árabe según la model card; no se documenta soporte multilingüe.
- Licencia no especificada: la ausencia de licencia impide determinar si el uso comercial o la redistribución están permitidos; debe consultarse al autor antes de reutilizar el código.
- Riesgo financiero: el propio autor indica que no hay integración on-chain y que la conversión de puntos a tokens GLN depende de un TGE futuro no garantizado; los puntos no tienen valor demostrable.
- Seguridad operativa: el token del bot debe mantenerse secreto y rotarse en @BotFather si se filtra; los `ADMIN_IDS` controlan el acceso a `/broadcast` y `/stats`.
- Dependencia de servicios gratuitos: Render suspende instancias tras 15 minutos de inactividad y el Postgres gratuito de Render caduca a los 30 días, de ahí el uso de Neon; sin pinger externo, las respuestas pueden retrasarse hasta que Telegram reenvíe los mensajes (cola de aproximadamente 24 horas).
- Sin datos de uso: 0 descargas y 0 likes en Hugging Face, sin pipeline definido, lo que sugiere un proyecto incipiente sin validación externa.
- Posible ambigüedad de fechas: la model card y los metadatos del repositorio indican fechas de creación y actualización en noviembre de 2026, posteriores a la fecha habitual de consulta; conviene verificar la vigencia del proyecto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/gln-bot/gln-telegram-bot
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este proyecto.
