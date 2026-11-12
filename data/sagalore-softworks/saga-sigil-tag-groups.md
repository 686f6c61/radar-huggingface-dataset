# sagalore-softworks/saga-sigil-tag-groups

## Resumen

SagaSigil Tag-Group Seed es un artefacto de datos, no un modelo de lenguaje. Lo publica el usuario sagalore-softworks bajo el identificador `saga-sigil-tag-groups` y contiene un mapeo compilado de etiquetas a grupos semanticos (taxonomia de tags) que consume el sistema de agrupacion de etiquetas de la aplicacion SagaSigil. El artefacto se distribuye como un fichero JSON comprimido con gzip (`tag-group-seed.v<N>.json.gz`) acompanado de un `manifest.json` con la version de esquema, el sha256 y el tamano, mas los ficheros de atribucion y licencia de las fuentes upstream.

El origen de los datos es doble: la estructura de grupos proviene del proyecto PBandDev `danbooru-tag-groups-scraper` (licencia MIT) y las categorias de etiquetas proceden de los datos publicos de danbooru.donmai.us y del export nocturno de la base de datos de e621. El repositorio pesa 0,3 GB y no declara pipeline, idiomas ni parametros, lo que confirma que no es un modelo entrenado sino un conjunto de datos derivado.

Su relevancia es operativa: la aplicacion SagaSigil ya incluye esta misma capa completa (`min_post_count = 1`) de forma offline en cada instalacion, de modo que este espejo sirve unicamente para recibir revisiones de la taxonomia entre versiones de la app. El cliente solo ofrece la actualizacion cuando el `schema_version` del repositorio es superior al aplicado, y elimina la copia descargada cuando la build instalada alcanza esa version, evitando artefactos obsoletos en disco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de datos, no modelo neuronal) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | JSON comprimido con gzip (`tag-group-seed.v<N>.json.gz`) mas `manifest.json` |

## Arquitectura y entrenamiento

No hay arquitectura neuronal ni proceso de entrenamiento. El artefacto es un mapeo generado de forma automatica (la model card indica explicitamente que "is generated, not hand-edited") que estructura las etiquetas de danbooru y e621 en dominios, grupos y reglas de resolucion. El contenido se empaqueta en un unico fichero JSON con compresion gzip y se versiona mediante un entero de esquema (`schema_version`) declarado en `manifest.json`.

El control de integridad se basa en el sha256 calculado sobre los bytes comprimidos tal como se publican, y el cliente verifica ese hash tras la descarga. Solo se recupera el artefacto nombrado por `manifest.json`; cuando se publica una version nueva, las anteriores se eliminan. Las fuentes upstream son el scraper de grupos de etiquetas de PBandDev (MIT) para la estructura y los datos publicos de danbooru y el `db_export` nocturno de e621 para las categorias.

## Capacidades

- Distribucion de una taxonomia de etiquetas compilada en dominios, grupos y reglas de resolucion.
- Versionado mediante `schema_version` para decidir si hay actualizacion disponible.
- Verificacion de integridad por sha256 sobre los bytes comprimidos publicados.
- Actualizacion incremental para el cliente SagaSigil (Settings → Tag Groups → Updates).
- Limpieza automatica de copias descargadas obsoletas cuando la build instalada alcanza la version.
- Cobertura completa de la taxonomia con `min_post_count = 1`.
- Consumo automatizado por la aplicacion; no esta pensado para uso directo por personas.
- No incluye generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente.

## Casos de uso

- Actualizacion temprana de la taxonomia de etiquetas: un usuario de SagaSigil puede descargar desde Settings → Tag Groups → Updates la revision publicada antes de que llegue la siguiente version de la app, obteniendo los nuevos mapeos de grupos sin esperar al ciclo de release.
- Sincronizacion de instalaciones en flotas: un administrador puede comprobar el `schema_version` de este repositorio para decidir si conviene forzar la actualizacion de la taxonomia en los equipos antes de desplegar una nueva build.
- Verificacion de integridad en pipelines de distribucion: el `manifest.json` permite validar el sha256 del artefacto comprimido antes de aplicarlo, lo que encaja en un paso de CI que compruebe que la copia descargada coincide con la publicada.
- Reutilizacion de la taxonomia danbooru/e621 en otras herramientas: al derivar de fuentes publicas y del scraper MIT de PBandDev, el mapeo puede servir de referencia para construir agrupaciones de etiquetas propias, respetando la atribucion indicada en `ATTRIBUTION.md`.
- Audiencia de cambios de taxonomia: comparar dos versiones del JSON comprimido permite identificar que grupos o reglas de resolucion han cambiado entre revisiones y evaluar el impacto en busquedas o filtros.
- Empaquetado offline en distribuciones derivadas: dado que la app ya incluye la capa completa, un tercero puede usar este espejo como fuente de la taxonomia vigente para empaquetarla en su propia build.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU ni aceleracion hardware: es un artefacto de datos de 0,3 GB en el repositorio.
- Almacenamiento: el fichero comprimido se descomprime en memoria o en disco por el cliente; el espacio necesario depende del contenido del JSON y no se detalla en la informacion disponible.
- Memoria RAM: no disponible; depende del tamano descomprimido del artefacto, que no se especifica.
- Despliegue: consumo mediante el cliente SagaSigil (Settings → Tag Groups → Updates); no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la operacion se limita a la descarga y verificacion del sha256 del fichero comprimido.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada artefactos comparables de taxonomia de etiquetas para danbooru o e621 con los que establecer una comparacion de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni admite inferencia; cualquier uso como modelo seria un error de categoria.
- Pensado para consumo automatizado por SagaSigil; la model card advierte que no esta destinado a uso directo.
- La licencia MIT cubre el artefacto, pero las fuentes upstream (danbooru, e621, scraper de PBandDev) tienen sus propias condiciones; es obligatorio respetar `ATTRIBUTION.md` y `LICENSE-PBandDev.txt`.
- El sha256 se calcula sobre los bytes comprimidos publicados; verificar el hash sobre el contenido descomprimido dara un resultado distinto.
- Solo se debe recuperar el artefacto nombrado por `manifest.json`; las versiones anteriores se eliminan al publicar una nueva.
- La actualizacion solo se ofrece si el `schema_version` del repositorio es superior al ya aplicado; un esquema igual o inferior no se aplica.
- No se declaran idiomas soportados, por lo que no hay garantia documentada sobre la cobertura linguistica de las etiquetas.
- El repositorio no declara pipeline ni datos de rendimiento; no hay evidencia publicada de calidad o cobertura de la taxonomia mas alla de `min_post_count = 1`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sagalore-softworks/saga-sigil-tag-groups
- Scraper upstream de grupos de etiquetas (PBandDev, MIT): https://github.com/PBandDev/danbooru-tag-groups-scraper
- Datos publicos de etiquetas de Danbooru: https://danbooru.donmai.us
- Export de base de datos de e621: https://e621.net/db_export
