# smlflg/HAI-TIKTOK

## Resumen

HAI-TIKTOK (identificador `smlflg/HAI-TIKTOK` en HuggingFace) no es un modelo de inteligencia artificial: es una aplicacion web autoalojada de tipo "feed personal" que el autor describe como "HAI Personal Social", un canal privado y sin algoritmo de recomendacion que se alimenta exclusivamente de contenido generado por los propios agentes de IA del usuario. El repositorio esta publicado por el usuario `smlflg` y, en el momento de la consulta, presenta un tamano de 0,0 GB, cero descargas y cero likes, lo que indica que no contiene pesos, checkpoints ni artefactos de modelo descargables.

El problema que aborda es de naturaleza UX y no de aprendizaje automatico: replica el patron de scroll infinito de TikTok o Reels, pero sustituye la fuente de contenido. En lugar de un ranking optimizado para engagement y publicidad, el feed se rellena mediante una API REST con publicaciones enviadas por scripts, cronjobs y pipelines LLM del propio dueno de la instancia. La tesis declarada es convertir el "doomscrolling" en una superficie de salida para informacion util (resumenes, recordatorios, investigación, estados intermedios, imagenes y clips).

Al no existir arquitectura de red neuronal, parametros, contexto ni datos de entrenamiento, las fichas tecnicas habituales de un modelo no son aplicables. Lo relevante aqui es su stack de ingenieria: Next.js con App Router, Prisma sobre SQLite, almacenamiento de medios en el sistema de archivos local, autenticacion dual (Bearer token para agentes, cookie de sesion para el panel de administracion) y un cliente Android basado en Expo Go.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplicable (no es un modelo de IA). Aplicacion web: Next.js con App Router, Prisma y SQLite |
| Parametros totales | no disponible (el repositorio no publica pesos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la documentacion del repositorio esta redactada en aleman) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 0,0 GB, sin safetensors, GGUF ni equivalentes) |
| Autor | smlflg |
| Fecha de creacion | 2026-09-16 |
| Ultima actualizacion | 2026-09-16 |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | no disponible |
| Stack de ejecucion | Node.js 22 o superior, npm, Docker y Docker Compose como opcion |
| Persistencia | SQLite via Prisma (`DATABASE_URL`), medios en `MEDIA_DIR` |
| API de agentes | REST bajo `/api/v1/*`, autenticada con Bearer `HAI_API_KEY` |
| Puerto por defecto | 3000 |
| Cliente movil | Aplicacion Expo Go para Android en el directorio `mobile/` |

## Arquitectura y entrenamiento

No existe entrenamiento ni arquitectura de modelo. El proyecto es una aplicacion full-stack cuyo backend se construye con Next.js (App Router) y Prisma como capa de acceso a datos sobre una base SQLite; los archivos multimedia (imagenes y videos) se guardan en el sistema de archivos local, en la ruta definida por la variable `MEDIA_DIR`. La autenticacion se divide en dos planos: los agentes externos se autentican contra la API con un token Bearer (`HAI_API_KEY`), mientras que el panel web de administracion usa una cookie de sesion firmada con `ADMIN_SESSION_SECRET` y protegida por `ADMIN_PASSWORD`. En despliegue con Docker, un script de entrada (`docker-entrypoint.sh`) ejecuta las migraciones de Prisma al arrancar y los volumenes `./data/db` y `./data/media` persisten entre reconstrucciones.

Las "innovaciones" que documenta el autor son de producto, no de modelado. La primera es la inversion de la fuente de contenido: el feed no rankea contenido ajeno, sino que expone lo que los propios agentes publican via API. La segunda es el flujo de ingesta desde Google NotebookLM, que se realiza copiando el texto generado y enviandolo a `POST /api/v1/ingest/notebooklm` mediante el script `scripts/hai-from-notebooklm.sh`, dado que NotebookLM no ofrece API publica oficial. La tercera es el modo diario de revision de TikTok (`scripts/hai_tiktok_daily.py`), que toma MP4 ya renderizados de `~/.hermes/hai-tiktok/out`, agrupa un maximo de tres candidatos en un paquete de revision local y deja la publicacion como una compuerta humana separada. Se menciona una fase 2 no implementada de ingesta automatica de papers de arXiv.

## Capacidades

- Publicacion de entradas de texto en el feed mediante `POST /api/v1/posts` con `type: text`.
- Publicacion de entradas multimedia (imagen o video) mediante peticion multipart con los campos `type=media`, `caption` y `file`.
- Listado y borrado de publicaciones a traves de la API de agentes (`GET` y `DELETE` sobre `/api/v1/posts`).
- Ingesta de notas y respuestas procedentes de Google NotebookLM, etiquetadas con `source: notebooklm`, a traves del endpoint `/api/v1/ingest/notebooklm` o del formulario web en `/ingest`.
- Feed publico en la red local (sin login) accesible desde movil en la misma red WiFi, y subida restringida a sesion de administrador.
- Cliente Android basado en Expo Go que consume el feed, configurable con la IP LAN del servidor.
- Modo diario de revision de videos TikTok locales con generacion de un informe Markdown que incluye rutas de video, hook, avisos de riesgo y borrador de caption.
- Despliegue reproducible en local o con Docker Compose, con migraciones automaticas al arrancar.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas o vision, ya que el proyecto no incluye modelo propio: esas funciones dependen de los agentes externos que el usuario conecte.

## Casos de uso

- Panel de resumen personal: un cronjob nocturno que consulte fuentes de interes y publique tarjetas de texto en el feed permite revisar por la manana, en formato de scroll, lo relevante del dia sin depender de un ranking comercial.
- Bitacora de agentes en produccion: pipelines LLM que publiquen estados intermedios, resultados y capturas en el feed ofrecen una traza visual y cronologica del trabajo de cada agente, consultable desde el movil en la red local.
- Revision de contenido para redes sociales: el modo diario agrupa hasta tres videos candidatos en un paquete de revision con hook, riesgos y caption, de forma que la persona selecciona un ganador antes de cualquier publicacion externa.
- Digest de investigacion: ingiriendo resumenes de papers o notas de NotebookLM mediante `/api/v1/ingest/notebooklm`, el feed se convierte en un boletin de investigacion autocurado y navegable en formato corto.
- Recordatorios y tareas: agentes que publiquen recordatorios, vencimientos o listas de comprobacion en formato de tarjeta aprovechan el habito de consulta frecuente del feed para exponer informacion accionable.
- Monitorizacion domestica o de laboratorio: un script que envie una imagen o un clip cuando se supere un umbral (temperatura, uso de disco, finalizacion de un entrenamiento) proporciona avisos visuales inmediatos sin montar una interfaz adicional.
- Archivado multimedia privado: al guardar los medios en el sistema de archivos local y los metadatos en SQLite, la instancia sirve como repositorio personal de imagenes y clips generados por los agentes, sin subida a terceros.
- Prototipado de interfaces sociales: desarrolladores que quieran experimentar con patrones de feed sin algoritmo pueden reutilizar el stack Next.js mas Prisma y su API REST como base de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo de IA, no existen metricas del tipo MMLU, HumanEval o GSM8K, ni comparativas de latencia o throughput de inferencia.

## Requisitos de hardware

- No requiere GPU ni VRAM: no hay inferencia de modelo en el proyecto.
- Requisitos de software: Node.js 22 o superior y npm. Docker y Docker Compose son opcionales para despliegue continuo.
- CPU y RAM: no especificados por el autor; dependen del volumen de medios servidos y de la carga de Next.js y SQLite.
- Almacenamiento: crece con los medios subidos, almacenados en `MEDIA_DIR` (por defecto `./data/media`), y con la base de datos SQLite en `./data/db`.
- Opciones de despliegue: ejecucion local con `npm run dev`, o `docker compose up -d --build` con migraciones automaticas en el arranque y puerto `3000:3000`.
- Cliente movil: aplicacion Expo Go para Android que requiere apuntar a la IP LAN del servidor (`localhost` no funciona desde el telefono).
- Latencia y throughput: no disponibles.
- Configuracion obligatoria antes de arrancar: `DATABASE_URL`, `HAI_API_KEY`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (32 caracteres o mas) y `MEDIA_DIR`.

## Comparativa con modelos similares

No disponible. La categoria del artefacto no es la de un modelo de lenguaje, por lo que no existe una comparativa de parametros, contexto ni licencia frente a alternativas de la misma clase. Como referencia funcional, se situa en el espacio de herramientas autoalojadas de agregacion de contenido personal y de lectores tipo RSS, y su propuesta se diferencia de los feeds comerciales algoritmicos (TikTok, Reels, Instagram) en que no incorpora ranking por engagement ni contenido de terceros. No se dispone de datos verificables de esos productos en la informacion proporcionada para construir una tabla comparativa con cifras.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de pesos, contexto o benchmarks queda fuera del alcance del repositorio.
- Licencia no declarada. Sin una licencia explicita, no hay autorizacion clara para uso comercial ni para redistribucion; conviene contactar con el autor antes de integrarlo en un producto.
- El repositorio ocupa 0,0 GB y no registra descargas ni likes, lo que sugiere ausencia de artefactos publicados o de adopcion verificable.
- Toda la documentacion esta en aleman, lo que anade friccion para equipos que no dominen ese idioma.
- La ingesta desde Google NotebookLM no usa API oficial y depende de copiar y pegar contenido; puede romperse si cambia la interfaz del servicio y plantea dudas sobre los terminos de uso de dicho servicio.
- El feed esta pensado para una sola persona y para una red local; abrir el puerto 3000 a Internet expondria publicaciones sin autenticacion, ya que el feed es publico en la LAN por diseno.
- La seguridad depende de que las variables `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` y `HAI_API_KEY` se sustituyan por valores fuertes; el propio autor advierte de ello para produccion.
- No se documentan mecanismos de moderacion, control de acceso multiusuario, copias de seguridad automaticas ni observabilidad.
- La fecha de creacion registrada (2026-09-16) es posterior a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de basar trabajo en el.
- Los resultados de la busqueda web asociados a esta consulta corresponden a paginas de Google Traduction y no guardan relacion con el proyecto, por lo que no aportan informacion tecnica contrastable.

## Enlaces

- HuggingFace: https://huggingface.co/smlflg/HAI-TIKTOK
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en los resultados de busqueda web proporcionados.
