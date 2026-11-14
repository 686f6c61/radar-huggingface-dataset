# p400/yvyhendy-focos-paraguay

## Resumen

Yvyhendy (también referido como FIREIA) es un proyecto de monitorización de focos de calor y quemas para Paraguay, construido sobre datos públicos de la NASA procedentes de los sensores MODIS y VIIRS distribuidos por FIRMS. El repositorio `p400/yvyhendy-focos-paraguay` en Hugging Face no contiene un modelo de lenguaje entrenado, sino el código, el pipeline de datos, la infraestructura y la documentación asociados al sistema. Fue desarrollado para el desafío 1.9 de NASA Space Apps 2026, titulado *Harmonization of MODIS and VIIRS Hot Spots*, y se mantiene en producción en el visor web `yvyhendy.vercel.app`.

El componente de inteligencia artificial del sistema es un asistente conversacional llamado Hendy, que no se entrena en este repositorio sino que se sirve a través de la API NVIDIA NIM empleando el modelo `nemotron-3.5-lightning-30b-a3b`, con contexto inyectado sobre las cifras diarias de focos de calor. Por tanto, la relevancia técnica del repositorio reside en la armonización de sensores, el pipeline reproducible de ingesta y el visor geoespacial, no en pesos de modelo.

La ficha se limita, por tanto, a describir el artefacto tal y como está publicado, indicando explícitamente los parámetros que no aplican o no están disponibles al tratarse de un repositorio de proyecto y no de un modelo con pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica: repositorio de proyecto (pipeline de datos, visor web y documentación); el asistente IA delega en un modelo externo vía NVIDIA NIM |
| Parámetros totales | No disponible (no se publican pesos en este repositorio) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible para el repositorio; el asistente usa `nemotron-3.5-lightning-30b-a3b` vía API, sin contexto declarado en la información disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (la documentación y la interfaz están en castellano; no se declara soporte multilingüe del asistente) |
| Licencia | No disponible |
| Formato de pesos | No aplica: el repositorio contiene código Python, scripts SQL, una aplicación Next.js y artefactos Parquet/JSON, no pesos de modelo |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. Su arquitectura es la de un sistema de datos en varias capas. La capa de ingesta (`pipeline/`) es un paquete Python llamado `hotspots` con CLI (`validate`, `ingest`, `status`, `manifest`) que valida CSV de FIRMS, los almacena en una zona RAW inmutable con manifiestos SHA-256 y los convierte a GeoParquet consultable con DuckDB. La capa de operación (`operaciones/`) incluye `adquisicion_firms.py`, que consulta el área de Paraguay en la API de FIRMS para los productos MODIS_NRT, VIIRS_NOAA20_NRT y VIIRS_NOAA21_NRT, normaliza y deduplica por `obs_id` y aplica punto-en-polígono contra geoBoundaries ADM0/ADM1, reescribiendo solo las particiones afectadas de forma idempotente.

La innovación técnica central es `armonizacion_v2.py`, que construye una serie mensual por celda de 0,1° ajustando por número de satélites activos, corrigiendo los meses sin Aqua y aplicando tres conversores VIIRS→MODIS (razón global, razón departamento×mes y GBM Poisson) seleccionados mediante validación leave-one-year-out, con fusión por varianza cuasi-Poisson e intervalo del 90 %. La justificación científica es que MODIS y VIIRS tienen resoluciones de píxel distintas (1 km frente a 375 m) y sensibilidades distintas a fuegos pequeños, por lo que sumarlos directamente introduciría un salto artificial de actividad desde 2018, cuando aumentó el número de satélites en observación.

El asistente Hendy se sirve mediante una ruta serverless `/api/chat` que invoca NVIDIA NIM con el modelo `nemotron-3.5-lightning-30b-a3b` e inyecta como contexto las cifras del día. No hay información sobre ajuste fino, RLHF o DPO en este repositorio.

## Capacidades

- Ingesta y validación de CSV de focos de calor de FIRMS para MODIS y VIIRS (productos NRT de NOAA-20 y NOAA-21).
- Deduplicación por identificador `obs_id` con hash SHA-256 y filtrado geográfico punto-en-polígono contra límites administrativos ADM0 y ADM1.
- Almacenamiento reproducible en zona RAW inmutable con manifiestos de integridad y conversión a GeoParquet consultable con DuckDB.
- Armonización estadística entre sensores MODIS y VIIRS con tres conversores y fusión por varianza cuasi-Poisson.
- Exportación de artefactos JSON (`celdas.json`, `meta.json`, `focos_recientes.json`) para consumo por el visor.
- Publicación versionada en Hugging Face con escaneo de secretos previo a la subida.
- Telemetría operativa en PostgreSQL (Supabase) con esquema de ejecuciones de adquisición, publicaciones y salud del sistema, consultable vía `/api/status`.
- Visor geoespacial en Next.js 16, React 19, MapLibre GL y ECharts con catorce secciones, mapa en vivo de los últimos 92 días, reproducción temporal, calendario histórico, anomalías, predicción, validación y descargas.
- Asistente conversacional Hendy con contexto de cifras diarias, servido mediante NVIDIA NIM.
- Proxy `/api/fires` con caché hacia la API de FIRMS.

## Casos de uso

- Monitorización de quemas en Paraguay: el pipeline ingiere a diario los productos NRT de FIRMS para el área de Paraguay y actualiza las particiones Parquet afectadas, permitiendo un visor con datos de los últimos 92 días sin reconstruir todo el histórico.
- Armonización de series históricas multi-sensor: `armonizacion_v2.py` genera una serie mensual por celda de 0,1° corregida por número de satélites activos y por la ausencia de Aqua, lo que permite comparar actividad de fuego entre años sin el salto artificial que introduciría la suma directa de MODIS y VIIRS.
- Validación de modelos de conversión entre sensores: los tres conversores VIIRS→MODIS se seleccionan mediante validación leave-one-year-out, un escenario útil para investigadores que necesiten reproducir o auditar la metodología de armonización.
- Cuadro de mando operativo para gestión de emergencias: el visor ofrece mapa en vivo, calendario histórico, anomalías y predicción, adecuado para que equipos de protección civil consulten la evolución de focos por departamento.
- Asistente conversacional sobre datos de fuego: la ruta `/api/chat` inyecta las cifras del día en un modelo servido por NVIDIA NIM, de modo que un usuario puede preguntar por la situación actual sin conocer el esquema de datos.
- Publicación reproducible de datos científicos: `hf_publicar.py` versiona los artefactos en Hugging Face con escaneo de secretos, lo que facilita citar y descargar la serie armonizada desde cuadernos de investigación.
- Integración en pipelines de análisis con DuckDB: al convertir la ingesta a GeoParquet, cualquier analista puede consultar el histórico con SQL sin depender de la base transaccional, que queda reservada a telemetría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio documenta validación leave-one-year-out de los conversores de armonización, pero no se proporcionan métricas numéricas en la información accesible.

## Requisitos de hardware

- No aplica VRAM para inferencia de un modelo propio: el repositorio no publica pesos.
- El asistente Hendy requiere conectividad con la API NVIDIA NIM y una clave de API; el coste de cómputo recae en el proveedor.
- El pipeline Python (`hotspots`) y los scripts de operación pueden ejecutarse en una máquina convencional; DuckDB y el procesamiento de Parquet no requieren GPU.
- El visor Next.js se despliega en Vercel (funciones serverless), sin requisitos de GPU.
- Para desarrollo local del visor se requieren Node.js y `npm`; para el pipeline, Python con el extra `[dev]` instalado mediante `pip install -e ".[dev]"`.
- No se dispone de datos de latencia o throughput del sistema en la información proporcionada.

## Comparativa con modelos similares

No disponible. El artefacto es un repositorio de proyecto de monitorización de focos de calor y no un modelo con pesos, por lo que no existe una categoría de modelos comparables directa. Como referencias funcionales del dominio podrían citarse plataformas de monitorización de incendios basadas en FIRMS, pero no se dispone de datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado ni pesos; cualquier expectativa de uso como modelo de lenguaje es incorrecta.
- La licencia no está declarada en la información disponible, lo que impide confirmar condiciones de uso comercial o redistribución.
- El asistente Hendy depende de un servicio externo (NVIDIA NIM) y de una clave de API; no es autónomo ni reproducible sin ese proveedor.
- La armonización MODIS/VIIRS incorpora supuestos estadísticos (conversores, fusión cuasi-Poisson, intervalo del 90 %) cuya validez está acotada al periodo y la región cubiertos por los datos de Paraguay.
- La distinción entre "sin detecciones" y "fallo de adquisición" se abordó en una auditoría correctiva del QC, pero persiste el riesgo de lagunas en la serie si FIRMS no publica datos para una fecha.
- Los datos científicos se sirven como artefactos estáticos versionados, no en tiempo real estricto; la frescura depende de la cadencia de `adquisicion_firms.py` y de la publicación en Hugging Face.
- No se declaran idiomas soportados por el asistente ni evaluaciones de sesgo o alucinación; su fiabilidad conversacional no está documentada.
- El repositorio incluye un panel anterior archivado (`fireia-web/`) que no debe confundirse con el visor en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/p400/yvyhendy-focos-paraguay
- Visor en producción: https://yvyhendy.vercel.app
- NASA FIRMS (fuente de datos): https://firms.modaps.eosdis.nasa.gov
- NASA Space Apps Challenge: https://www.spaceappschallenge.org
- geoBoundaries (límites administrativos): https://www.geoboundaries.org
- NVIDIA NIM: https://www.nvidia.com/en-us/ai/
