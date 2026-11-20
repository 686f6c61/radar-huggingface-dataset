# abr00kx/eac-ledger

## Resumen

eac-ledger no es un modelo de inteligencia artificial, sino una herramienta de OSINT (inteligencia de fuentes abiertas) publicada en Hugging Face bajo la forma de un binario Go con una base de datos SQLite. Su objetivo es indexar y hacer consultable el registro completo de certificados y declaraciones de conformidad de la Unión Económica Euroasiática (EAEU: Rusia, Bielorrusia, Kazajistán, Kirguistán y Armenia), que constituye un registro estatal oficial de importaciones paralelas de bienes occidentales en Rusia.

El proyecto resuelve un problema concreto de investigación: el registro ruso equivalente (pub.fsa.gov.ru) está geobloqueado fuera de Rusia desde 2022 y dejó de actualizar sus datos abiertos, mientras que el registro de la EAEU se publica abiertamente sin clave ni geobloqueo e incluye documentos emitidos en Kirguistán, Armenia y Kazajistán, que es donde se concentra el loophole. La herramienta carga 8,9 millones de documentos desde 2010, aplica los ficheros de cambios diarios, detecta desapariciones de registros y cruza los códigos HS con listas de control de exportaciones.

Es relevante ahora porque documenta un fenómeno en expansión: los certificados emitidos en Kirguistán se multiplicaron por seis entre 2020 y 2024, y en 2026 Rosakkreditatsiya dejó de reconocer documentos de organismos de certificación de Kirguistán, Armenia y Kazajistán, afectando a marcas como Apple, ASUS, Dell, HP, Bosch o Nike. La herramienta es un aid de investigación, no una determinación legal, y sus detecciones de marcas y personas son heurísticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Herramienta OSINT en Go con base de datos SQLite embebida; CLI y API JSON |
| Parametros totales | no disponible (no es un modelo neuronal) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los datos fuente son multilingües: ruso y otros idiomas de la EAEU) |
| Licencia | MIT |
| Formato de pesos | no disponible; binario Go estático y fichero SQLite |

## Arquitectura y entrenamiento

No aplica: eac-ledger no es un modelo entrenado. Es un pipeline de ingestión y consulta construido en Go que descarga el archivo completo del registro EAEU (unos 10 GB comprimidos, 64 GB de JSON en streaming), lo carga en SQLite (base de datos resultante de unos 40 GB) y aplica los ficheros delta diarios conservados por el publicador (aproximadamente seis días). El ingest completo tarda entre 45 y 60 minutos en 8 núcleos.

Las innovaciones técnicas destacables son: detección de desapariciones (documentos que caen de una instantánea completa posterior se registran como eventos en lugar de perderse), normalización de solicitantes con asignación al sujeto federal ruso y marcado de territorio ucraniano ocupado, vinculación de empresas nominalmente separadas mediante números de teléfono, correos y webs compartidos almacenados solo como hashes con clave, y cruce de códigos HS con la Common High Priority List UE/EEUU/Reino Unido/Japón de bienes de uso militar (50 códigos, niveles 1–4B) junto con la detección de 236 titulares de marcas de países con restricciones a Rusia.

## Capacidades

- Ingestión del registro completo de la EAEU: 8,9 millones de documentos desde 2010 hasta la actualidad, de los cinco estados miembros.
- Aplicación de ficheros de cambios diarios y registro de cada cambio de estado (suspendido, terminado, reanudado) como evento.
- Detección de documentos desaparecidos entre instantáneas completas sucesivas.
- Marcado de documentos cuyos códigos HS figuran en la Common High Priority List de bienes de uso militar.
- Detección de fabricantes de la coalición (UE, EEUU, Reino Unido, Japón, Corea, Suiza, Taiwán y otros estados con restricciones) y emparejamiento con 236 titulares de marcas en semiconductores, máquinas herramienta, equipos de prueba, rodamientos, óptica, armas de fuego y bienes de consumo.
- Normalización de solicitantes con asignación geográfica y marcado de territorio ucraniano ocupado.
- Vinculación de empresas por contactos compartidos (teléfono, correo, web) mediante hashes con clave.
- CLI con comandos fetch, ingest, sync, stats y serve; API JSON con endpoints de estadísticas, búsqueda de documentos, detalle por documento, solicitantes, marcas y eventos.
- Autocontenido: sin claves de API ni cuentas; despliegue self-hosted.

## Casos de uso

- Periodismo de investigación sobre importaciones paralelas: cargar el registro completo y cruzar fabricantes occidentales con solicitantes rusos para trazar cadenas de certificación de bienes como munición, semiconductores o equipos de prueba, como hicieron The Insider y NZZ con documentos individuales.
- Monitorización diaria de cambios regulatorios: ejecutar `eacl sync` desde cron para capturar los deltas que el publicador conserva solo unos seis días y mantener un histórico de estados que de otro modo se perdería.
- Detección de certificados retirados tras investigaciones: usar la detección de desapariciones para identificar documentos que se eliminan de instantáneas posteriores, preservando la evidencia de que existieron.
- Cumplimiento y control de exportaciones: filtrar por códigos HS de la Common High Priority List y por fabricantes de la coalición para generar listas de certificaciones potencialmente problemáticas que alimenten procesos de due diligence.
- Análisis de redes de importadores: consultar el endpoint de solicitantes para ver documentos por año, marcas, países de fabricante y, sobre todo, otros solicitantes que comparten contactos, revelando estructuras empresariales vinculadas.
- Investigación sobre el loophole de certificación en Asia Central: cuantificar el crecimiento de certificados emitidos en Kirguistán, Armenia y Kazajistán y identificar los organismos y laboratorios implicados antes y después de que Rosakkreditatsiya dejara de reconocerlos.
- Docencia y visualización de datos: servir la API JSON en local para construir dashboards o análisis reproducibles sobre flujos de certificación EAEU sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: aproximadamente 10 GB para el archivo completo comprimido y unos 40 GB para la base de datos SQLite resultante; espacio adicional para instantáneas y deltas.
- CPU: el ingest inicial de 64 GB de JSON tarda 45–60 minutos en 8 núcleos; más núcleos reducen el tiempo de descarga paralela por range requests.
- Memoria: no disponible en la información proporcionada; depende del volumen de la base SQLite y de las consultas.
- GPU: innecesaria; la herramienta no realiza inferencia neuronal.
- Cabe en cualquier máquina de consumo con suficiente disco (por ejemplo, un portátil con SSD de 100 GB libres), aunque el ingest completo es intensivo en E/S.
- Despliegue: binario Go estático único más fichero SQLite; CLI (`fetch`, `ingest`, `sync`, `stats`, `serve`) y API JSON en `http://127.0.0.1:8088/api/stats` por defecto; variables de entorno `EACL_DB`, `EACL_DATA`, `EACL_ADDR`, `EACL_HASH_KEY`.
- Latencia y throughput: no disponible; solo se documenta el tiempo de ingest inicial.

## Comparativa con modelos similares

| Herramienta | Fuente de datos | Cobertura | Acceso | Licencia |
|---|---|---|---|---|
| eac-ledger | Registro EAEU (opendata.eaeunion.org) | 8,9 M documentos, 2010–hoy, cinco estados | Abierto, sin clave ni geobloqueo | MIT |
| Registro nacional ruso (pub.fsa.gov.ru) | Registro ruso | Solo parte rusa | Geobloqueado fuera de Rusia desde 2022; datos abiertos congelados en 2021–22 | No aplica (servicio estatal) |
| Consulta manual de documentos sueltos (uso periodístico) | Documentos individuales | Caso a caso | Manual | No aplica |

No se conocen otras herramientas publicadas que indexen el registro EAEU completo, rastreen sus cambios y lo crucen con listas de control de exportaciones; en la información disponible no hay alternativas comparables adicionales.

## Limitaciones y advertencias

- No es una determinación legal: un documento de conformidad muestra que alguien declaró un producto conforme para el mercado EAEU, pero no prueba que se realizara un envío, que el titular de la marca estuviera implicado ni que se infringiera ninguna ley.
- Las detecciones de marcas y personas son heurísticas; cualquier dato relevante debe verificarse contra el registro original (el número de documento figura en cada fila).
- La vinculación por contactos compartidos usa hashes con clave; un contacto compartido no implica necesariamente una relación societaria.
- Dependencia de la retención del publicador: solo se conservan unos seis días de ficheros delta, por lo que el histórico no capturado se pierde; `eacl sync` debe ejecutarse a diario.
- El ingest completo es costoso en disco (unos 40 GB de base de datos) y en tiempo (45–60 minutos en 8 núcleos).
- Cobertura limitada a los cinco estados de la EAEU y al periodo 2010–hoy; no cubre otros regímenes de certificación.
- Riesgo de sesgo de fuente: los datos reflejan lo que el registro oficial publica, incluidos posibles errores, omisiones o retiradas por parte de las autoridades.
- Licencia MIT: permite uso comercial y modificación con atribución; no impone restricciones adicionales conocidas, pero la responsabilidad sobre el uso de los datos recae en el usuario.

## Enlaces

- Hugging Face: https://huggingface.co/abr00kx/eac-ledger
- Registro EAEU (fuente de datos): https://tech.eaeunion.org/tech/registers/35-1/ru/registry-card
- CNews, sobre el fin del reconocimiento de certificados de Kirguistán, Armenia y Kazajistán: https://www.cnews.ru/news/top/2026-02-18_v_rossii_zamedlitsya_parallelnyj
- Izvestia, sobre causas penales por 15.000 certificados: https://iz.ru/en/node/2181370
