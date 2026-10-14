# endomorphosis/world_law_pipeline

## Resumen

`endomorphosis/world_law_pipeline` no es un modelo de aprendizaje automatico, sino un repositorio de codigo que implementa el pipeline de datos con el que se construyen los datasets `endomorphosis/world_municipal_law` y `endomorphosis/world_national_law`, ambos alojados en Hugging Face. Lo desarrolla el usuario endomorphosis y su funcion es recoger, normalizar, validar y publicar legislacion municipal y nacional de ambito mundial: los scrapers escriben en un arbol de staging, y el normalizador/uploader valida las filas, retiene aquellas cuya politica de origen prohibe su publicacion y escribe parquet shardeado con compresion ZSTD, junto con metadatos, un manifiesto y la tarjeta del dataset.

El repositorio ocupa 0,1 GB y esta implementado en Python 3.13 sobre `pyarrow`, `huggingface_hub` (solo para la subida) y `requests`, con `openpyxl` para las hojas xlsx del generador de codigos y `tesseract` para los recolectores con OCR. Cubre aproximadamente 230 jurisdicciones a traves de recolectores nacionales y subnacionales, ademas de scrapers especificos para la UE, Asia y Latinoamerica, y un fetcher de archivo web basado en Wayback y Common Crawl.

Su relevancia es practica y no algorritmica: resuelve el problema de ingenieria de construir un corpus legal global reproducible, con esquema versionado (v1.1.0, 34 columnas), politica de retencion documentada, enrutado por tipo de entidad y control de espacio en disco antes de cada ejecucion. No hay tarjeta de modelo con datos de arquitectura, contexto o cuantizacion porque no hay pesos ni inferencia: el artefacto entregable son los datasets generados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (no es un modelo neuronal; es un pipeline de datos en Python) |
| Parametros totales | no aplica |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (la model card no declara una lista de idiomas; cubre ~230 jurisdicciones) |
| Licencia | no disponible (campo no declarado en la model card ni en los metadatos del repositorio) |
| Formato de pesos | no aplica; los artefactos de salida son parquet shardeado con compresion ZSTD, mas metadatos, manifiestos y tarjeta de dataset |
| Tipo de artefacto | repositorio de codigo (data pipeline) |
| Autor | endomorphosis |
| Tamano del repositorio | 0,1 GB |
| Version de esquema | 1.1.0 (34 columnas, incluida procedencia opcional) |
| Datasets que construye | `endomorphosis/world_municipal_law`, `endomorphosis/world_national_law` |
| Entorno de ejecucion | Python 3.13, `pyarrow`, `huggingface_hub`, `requests`, `openpyxl`, `tesseract` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-11 |
| Ultima actualizacion | 2026-10-13 |

## Arquitectura y entrenamiento

No existe entrenamiento ni arquitectura de red. El repositorio implementa una arquitectura de procesamiento por etapas: los scrapers (`scrapers/eu/`, `scrapers/national/`, `scrapers/asia_latam/`, `scrapers/web/`) escriben en un arbol de staging; `run_loop.py` actua como normalizador y uploader, encargandose del descubrimiento, el orden por lotes, las retenciones, las anulaciones por documento y la escritura en streaming por shards; `normalize.py`, `schema.py` y `SCHEMA.md` fijan el contrato de staging y la politica de retencion (seccion 2.1). La salida son parquet shardeado con ZSTD, metadatos, un manifiesto y la tarjeta del dataset, generada por `card.py` para las variantes municipal y nacional, con tabla de procedencia y proporcion archivada.

El enrutado se reorganizo el 2026-10-11 con `tools/split_national.py`: las entidades cuyo `place_key` empieza por `iso_` (niveles admin_level de pais, adm1 y supranacional) van a `world_national_law` (`out_national/`), y el resto (municipios, condados, organismos de agua, etcetera) a `world_municipal_law` (`out/`). Cada repositorio se confirma por separado mediante ficheros de plan (`planned_commit.jsonl` y `planned_commit_national.jsonl`). El uploader usa un bloqueo `flock` en `state/run_loop.lock`, un libro mayor sha256 en `state/ledger.jsonl` que evita procesar dos veces el mismo fichero, movimiento a `processed/` solo tras el exito de todas las confirmaciones y reintentos con retroceso exponencial ante respuestas 429 o 5xx. `tools/prune_processed.py` realiza la poda verificada de fuentes en `processed/` y de `state/confirmed_batches/<bot>.jsonl` tras cada subida.

Entre las piezas destacables estan `archive_fetcher/` (Wayback y Common Crawl, con `core.py`, `ratelimit.py`, `staging.py` y `cli.py`, mas helpers de legal_scrapers incorporados), `codes/` para el crosswalk entre `place_id` y codigos nacionales (CBS, TERYT, RUIAN, KSH, GKZ, INE, ISTAT, INSEE, AGS, BFS, dantai/JIS, IBGE, INEGI, UBIGEO, CUT, BPS/Kemendagri, LAU, NUTS) y `world/`, un refactor del codigo del hub estadounidense `american_municipal_law` con la funcion CID byte a byte identica. La semantica del CID se documenta en `world/CID.md`.

## Capacidades

- Recoleccion automatizada de legislacion en aproximadamente 230 jurisdicciones mediante recolectores nacionales y subnacionales (`shared/collect_*.py`).
- Scraping especifico por dominio: CVDR neerlandes y e-dzienniki polacos en `scrapers/eu/`; ley municipal japonesa (gyosei, d1-law, joureikun, legalsquare), BOP espanol, Brasil, Peru, Mexico, Chile, Indonesia, Sudafrica y Australia en `scrapers/asia_latam/`; rastreador alemán de Ortsrecht con auditoria de `robots.txt` en `scrapers/web/`.
- Recuperacion de contenido historico o desaparecido mediante fetcher de Wayback Machine y Common Crawl, con limitacion de tasa y staging propio.
- Normalizacion a un esquema versionado v1.1.0 de 34 columnas, con contrato de staging explicito.
- Politica de retencion: las filas cuya politica de origen prohibe su publicacion no se publican.
- Cuarentena por documento mediante `state/doc_overrides.json` para documentos mal archivados o no juridicos.
- Validacion de filas, escritura en streaming y sharding en parquet con compresion ZSTD.
- Publicacion en el Hub con plan de confirmacion, deteccion de shards obsoletos para su borrado, libro mayor sha256 y reintentos con retroceso ante 429/5xx.
- Generacion automatica de tarjetas de dataset para las variantes municipal y nacional, enlazadas entre si.
- Construccion de crosswalks entre `place_id` y codigos administrativos nacionales.
- Control de espacio en disco antes de cada ejecucion, con umbral de aviso y umbral de parada.
- Tests de paridad CID estadounidense, politica de retencion, enrutado y poda en disco, con generador de datos sinteticos.
- OCR mediante `tesseract` en los recolectores que lo requieren (por ejemplo `collect_sr.py` y `collect_ht.py`).

## Casos de uso

- Construccion de un corpus legal municipal global para investigacion en derecho comparado: el pipeline normaliza fuentes heterogeneas de ~230 jurisdicciones a un unico esquema de 34 columnas, lo que permite consultas transversales entre paises sin trabajo de integracion manual.
- Dataset de partida para sistemas de recuperacion aumentada (RAG) sobre normativa local: los parquet shardeados con ZSTD y los manifiestos asociados facilitan indexar el corpus y trazar la procedencia de cada fragmento.
- Seguimiento de cambios normativos por jurisdiccion: el fetcher de Wayback y Common Crawl permite recuperar versiones archivadas de paginas que ya no estan disponibles, util para analizar la evolucion de una ordenanza a lo largo del tiempo.
- Auditoria de cumplimiento de `robots.txt` y de politicas de publicacion de la fuente: el repositorio incluye la politica de retencion y una auditoria de robots en el rastreador aleman, lo que sirve como caso de referencia para equipos que deban justificar la licitud de su recoleccion.
- Remapeo de entidades administrativas entre paises: `codes/build_place_codes.py` genera correspondencias entre `place_id` y codigos oficiales (INE, ISTAT, INSEE, IBGE, INEGI, entre otros), aplicable a la armonizacion de datos estadisticos y legales.
- Reutilizacion de la infraestructura de publicacion en el Hub para otros dominios: el patron de staging, esquema versionado, libro mayor sha256, plan de commit y pruner verificado es trasladable a cualquier corpus documental con requisitos de trazabilidad.
- Preprocesamiento OCR de boletines escaneados: los recolectores que usan `tesseract` con `TESSDATA_PREFIX` sirven de base para digitalizar publicaciones oficiales que solo existen en imagen.
- Base para evaluaciones de sesgo y cobertura legal: al separar entidades municipales de nacionales y registrar la proporcion archivada, permite medir que jurisdicciones estan infrarrepresentadas en el corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un pipeline de datos y no de un modelo, no aplican metricas como MMLU, HumanEval o GSM8K, y la model card no incluye ninguna tabla de rendimiento, cobertura efectiva ni tasa de exito de scraping.

## Requisitos de hardware

- No requiere GPU: toda la carga es de red, parseo y escritura de ficheros.
- CPU y RAM recomendadas: no disponible (la model card no especifica minimos).
- Almacenamiento: el repositorio ocupa 0,1 GB, pero el pipeline genera staging, salida y ficheros procesados de tamano muy superior. El propio codigo incorpora un control de disco sobre `/` con umbral de aviso `--disk-warn-gb` (15 GB, valor por defecto) y umbral de parada `--disk-stop-gb` (8 GB); por debajo de este ultimo no se construyen nuevas entidades.
- Entorno: Python 3.13 con `pyarrow`, `huggingface_hub`, `requests`, `openpyxl` y `tesseract` (OCR). Se excluyen deliberadamente entornos virtuales, `__pycache__`, caches, descargas en crudo y todos los datos de staging o salida.
- Dependencias externas no incluidas: el checkout de `ipfs_datasets_py` en `/workspace/ipfs_datasets_py[_latest]` (usado por algunos recolectores, `cvdr.py`, `es_sede.py` y `de_ortsrecht_crawler.py`), los fixtures de `/workspace/municipal_law/_verify_tmp` para el test CID estadounidense y las entradas cacheadas del generador de codigos.
- Despliegue: ejecucion directa con `python run_loop.py --once` (seguro para ejecucion horaria gracias al bloqueo `flock`). Se recomienda probar primero `--once --dry-run`. Los flags `--staging`, `--out`, `--state` y `--held` sobrescriben las rutas por defecto.
- Variables de entorno: `WORLD_LAW_ROOT` (por defecto `/workspace/world_law`), `GLOBAL_MUNICIPALITIES_ROOT` (por defecto `/workspace/global_municipalities`), `GLOBAL_MUNICIPALITIES_CSV` (por defecto `/workspace/global_municipalities/global_municipalities_candidate.csv`) y `TESSDATA_PREFIX` (por defecto `/home/box/tessdata`, establecida con `os.environ.setdefault`, de modo que un valor ya existente prevalece).
- Latencia y throughput: no disponible. No se publican tiempos por entidad, ancho de banda consumido ni volumen de filas por hora.

## Comparativa con modelos similares

No se han encontrado comparativas publicadas en la informacion disponible. El propio repositorio referencia dos proyectos relacionados, pero sin datos de rendimiento ni de cobertura que permitan una comparacion cuantitativa:

| Proyecto | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `endomorphosis/world_law_pipeline` | Pipeline objeto de esta ficha | no aplica | no aplica | no disponible | Publico en Hugging Face, 0 descargas, 0 likes |
| `american_municipal_law` (hub code, EE. UU.) | Codigo precedente del que `world/` es un refactor; la funcion CID es byte a byte identica | no aplica | no aplica | no disponible | no disponible |
| `ipfs_datasets_py` | Checkout upstream usado por varios recolectores y por `tests/test_us_cid.py` | no aplica | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo: no genera texto, no razona y no admite inferencia. Cualquier evaluacion debe centrarse en la calidad y cobertura de los datasets que produce.
- Licencia no declarada: sin licencia explicita no puede determinarse si el uso comercial del codigo o de los datasets derivados esta permitido. Conviene contactar con el autor antes de cualquier uso en produccion.
- Los datasets que genera agregam legislacion de multiples jurisdicciones: la reutilizacion de cada documento depende de la politica de la fuente original, y el pipeline no publica aquellas filas cuya fuente lo prohibe, por lo que la cobertura es intencionadamente incompleta.
- Riesgo de sesgo de cobertura: no se publican metricas de cuantas jurisdicciones de las ~230 objetivo quedan efectivamente cubiertas ni que proporcion del corpus es archivada frente a obtenida en vivo.
- Sin benchmarks ni validacion externa conocida, y con 0 descargas y 0 likes, el repositorio no cuenta con evidencia de uso ni de verificacion por terceros.
- Dependencias externas no incluidas en el repositorio (checkout de `ipfs_datasets_py`, fixtures de test, entradas cacheadas de `codes/`) impiden ejecutar el pipeline completo sin preparar el entorno manualmente.
- Rutas fijas documentadas pero no parametrizables: `/workspace/ipfs_datasets_py[_latest]`, `/workspace/municipal_law/_verify_tmp`, la pista de `sys.path` en la cadena de documentacion de `schema.py` y varias rutas con f-strings en scripts puntuales como `scrapers/national/archive/peek.py`.
- El codigo excluye deliberadamente los datos en crudo y los directorios de staging y salida, de modo que el repositorio por si solo no permite reproducir los datasets sin volver a ejecutar los scrapers.
- La recoleccion depende de scraping y de fuentes de archivo (Wayback, Common Crawl), por lo que esta sujeta a cambios de estructura, bloqueos y disponibilidad de terceros, con la consiguiente posible degradacion silenciosa de la cobertura.
- Las fechas de creacion y actualizacion declaradas (2026-10-11 y 2026-10-13) son posteriores a la fecha habitual de consulta; conviene verificar la coherencia temporal del repositorio antes de citarlo.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este repositorio; los resultados obtenidos eran contenido no relacionado y no se han utilizado como fuente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/endomorphosis/world_law_pipeline
- Dataset municipal: https://huggingface.co/datasets/endomorphosis/world_municipal_law
- Dataset nacional: https://huggingface.co/datasets/endomorphosis/world_national_law
- Papers, blogs, repositorios auxiliares o demos: no disponible (no se han encontrado enlaces relevantes en la busqueda web)
