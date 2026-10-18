# NorviTech/armiger-ultra

## Resumen

Armiger Ultra (`NorviTech/armiger-ultra`) es un clasificador neuronal multitarea orientado a la inteligencia de torrents: identifica el tipo de contenido y el idioma de un release a partir de su título y listado de ficheros, y lo combina con telemetría de enjambre (seeders/leechers de trackers y DHT) para estimar si una descarga es viable o si es una trampa. Lo desarrolla NorviTech y se distribuye como suite empaquetada para integrarse en Bitmagnet, Prowlarr, Sonarr y Radarr.

La arquitectura declarada es un transformer a nivel de byte (byte-level transformer) con aprendizaje multitarea y ocho cabezas de clasificación. El repositorio incluye dos variantes del clasificador: `armiger_ultra.fp32.onnx` y `armiger_ultra.pt` (32,2 MB cada uno, para GPU o CPU) y `armiger.int8.onnx` (8,3 MB, ruta rápida en CPU), además del adaptador de enjambre `swarm_adapter.pt` (130 KB), scripts de priors y calibración, y plugins para desambiguación de catálogo, guardia de idioma de audio, sincronización DHT y filtrado previo de CSAM. El autor no publica el recuento de parámetros ni la longitud de contexto.

Su relevancia práctica está en el coste: latencias de 0,50 ms por lote y 1,12 ms por elemento en GPU, y 0,42 ms por lote y 2,44 ms por elemento en CPU con INT8, sobre un modelo de decenas de megabytes. Eso permite ejecutarlo en el mismo host que el gestor de descargas o en workers de borde sin GPU. Todas las métricas son autodeclaradas en la model card; a fecha de la consulta el repositorio no tiene descargas ni likes y no se han localizado evaluaciones independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer a nivel de byte (byte-level transformer) multitarea con 8 cabezas de clasificacion |
| Parametros totales | no disponible (el autor no lo declara; el fichero FP32 de 32,2 MB equivale a ~8 M de parametros a 4 bytes por peso, estimacion propia, no confirmada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (`armiger_ultra.fp32.onnx`, `armiger_ultra.pt`) e INT8 (`armiger.int8.onnx`); no se publican pesos GGUF |
| Idiomas soportados | no disponible (el pipeline clasifica etiquetas de idioma de titulo y de audio, incluidos tags tipo `MULTi (FR EN)`, pero no se declara la lista de idiomas cubiertos) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (FP32 e INT8) y PyTorch `.pt` |
| Pipeline declarado | `text-classification` |
| Tamano del repositorio | 0,2 GB |
| Fecha de publicacion | 2026-10-18 (ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

El clasificador es un transformer que opera sobre bytes en lugar de tokens subword, lo que evita depender de un tokenizador concreto y le permite procesar cadenas arbitrarias de nombres de release (puntos, corchetes, tags de calidad, sufijos de idioma) sin normalización previa. Sobre esa representación compartida se entrenan ocho cabezas en régimen multitarea, entre ellas la clasificación de contenido en 11 clases, la discriminación película frente a serie, el idioma del título, el idioma del audio y la detección de contenido basura (*junk*). La model card menciona explícitamente aprendizaje multitarea y *modality dropout* obligatorio con `p=0.60` en el motor de priors, pero no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos no están disponibles.

El componente diferencial no es el clasificador de texto, sino la capa de fusión con telemetría de enjambre. `swarm_adapter.pt` (130 KB) actúa como adaptador residual que combina los embeddings internos de contenido con señales de trackers y DHT (seeders, leechers, comportamiento del release group) para producir dos salidas: predicción de vitalidad del enjambre y detección de *fake seeders* maliciosos. La suite se completa con un catálogo offline de 929.400 claves normalizadas de TMDB, TVDB, AniDB y Manami para desambiguar casos sin pistas textuales, un módulo de calibración post-hoc (temperature scaling por cabeza, ajustes de prior de Menon y umbrales conformales de Mondrian) y utilidades de sincronización DHT sobre BEP-44/BEP-46 con firmas Ed25519 y cifrado X25519 + ChaCha20-Poly1305.

## Capacidades

- Clasificación de contenido en 11 clases con 98,48 % de exactitud sobre el conjunto Gold Standard declarado y 98,93 % en casos límite duros.
- Discriminación película frente a serie con 99,46 % de exactitud, apoyada en el catálogo offline de 929.400 claves y en reglas estructurales para packs, ROM, visual novels y cursos.
- Clasificación de idioma de título y de audio, con resolución de casos conflictivos como preposiciones `.en.`, sufijos `<Foreign>.ENG.Sub`, doblajes regionales y tags `MULTi (FR EN)`; 98,72 % en Gold Standard y 99,88 % en casos límite de audio.
- Detección de *fake seeders* y honeypots de malware con 100,0 % de recall declarado sobre el conjunto de trampas evaluado.
- Predicción de viabilidad de descarga y vitalidad de enjambre con AUROC de 96,83 %, frente al 53,04 % de usar el recuento bruto de seeders.
- Detección de contenido basura con 99,95 % de exactitud balanceada mediante puertas conformales de Mondrian.
- Motor de priors empíricos bayesianos con cuatro vías de scraping de trackers y extracción de características de anomalía.
- Filtro de seguridad de passkeys en trackers públicos y bloqueo previo de CSAM y abuso antes de la ingesta en la sincronización DHT.
- Sincronización de base de datos DHT firmada, con purga por tombstones ciegos SHA-256, pruebas de Merkle binarias y quórum Sybil K-de-N por ASN distinto.
- No dispone de generación de texto libre, razonamiento conversacional, tool calling, agentes ni visión: es un clasificador, no un LLM generativo.

## Casos de uso

- **Organización automática de biblioteca en Sonarr/Radarr:** el clasificador recibe el nombre del release y el listado de ficheros y devuelve categoría e idioma, de modo que el gestor puede enrutar el contenido sin reglas regex mantenidas a mano. Con 0,50 ms por lote en GPU, un catálogo de decenas de miles de releases se reprocesa en segundos.
- **Indexación en Bitmagnet y Prowlarr:** integración en el pipeline de indexación para etiquetar cada torrent antes de almacenarlo, usando la ruta INT8 en CPU (0,42 ms por lote) cuando el indexador corre en el mismo host sin GPU.
- **Filtrado de honeypots y fake seeders en trackers públicos:** el adaptador de enjambre puntúa la probabilidad de que una descarga con seeders aparentemente sanos sea una trampa de malware, con el recall declarado del 100 % sobre el conjunto de prueba, lo que permite cuarentena o exclusión previa a la descarga.
- **Priorización de cola de descargas:** combinando vitalidad de enjambre (AUROC 96,83 %) con la categoría del contenido, un cliente puede ordenar la cola por probabilidad real de completarse en lugar de por número de seeders, reduciendo descargas que se quedan al 90 %.
- **Desambiguación de releases ambiguos:** para títulos sin año, sin IMDb ID o con nomenclatura atípica, el plugin de catálogo offline resuelve contra TMDB/TVDB/AniDB/Manami sin llamadas de red, útil en entornos aislados o con rate limits.
- **Guardia de idioma en bibliotecas de anime:** detecta si un episodio lleva audio japonés, doblaje inglés o un `MULTi` mal etiquetado, cruzando la cabeza de idioma de título con la de audio, para corregir automáticamente metadatos de doblaje.
- **Moderación previa en sincronización DHT:** el módulo `csam_guard.py` aplica un bloqueo multi-etapa antes de ingerir registros en la base de datos replicada, con lista de exclusión y purga firmada, lo que ayuda a cumplir requisitos de moderación en un servicio de catálogo distribuido.
- **Despliegue en hardware de borde:** con 8,3 MB en INT8, el modelo cabe en una Raspberry Pi o en un contenedor sidecar junto al cliente de descargas, sin depender de un servicio de inferencia centralizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible; el modelo no es generativo y esas pruebas no aplican. Las metricas de la tabla son las declaradas por el autor en su model card, sin verificacion independiente.

| Metrica | Valor declarado | Referencia de comparacion |
|---|---|---|
| Exactitud compuesta de 6 dimensiones | 98,74 % | no disponible |
| Exactitud 11 clases (Gold Standard) | 98,48 % | no disponible |
| Exactitud pelicula vs. serie | 99,46 % | no disponible |
| Exactitud casos limite duros (11 clases) | 98,93 % | no disponible |
| Exactitud de audio (Gold Standard) | 98,72 % | no disponible |
| Exactitud de audio en casos limite duros | 99,88 % | no disponible |
| Recall de honeypots con fake seeder | 100,0 % | no disponible |
| AUROC de vitalidad de enjambre | 96,83 % | 53,04 % con recuento bruto de seeders |
| Exactitud balanceada de deteccion de junk | 99,95 % | no disponible |
| Latencia GPU (FP32) | 0,50 ms por lote / 1,12 ms por elemento | no disponible |
| Latencia CPU (INT8) | 0,42 ms por lote / 2,44 ms por elemento | no disponible |
| Pruebas de regresion declaradas | 500 canarios, 36/36 y 27/27 tests | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 200 MB en FP32 y por debajo de 100 MB en INT8, incluyendo buffers de activaciones para lotes pequenos; el fichero de pesos FP32 ocupa 32,2 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre sirve; el autor reporta latencias medidas en GPU sin especificar el modelo concreto. Para produccion de alto volumen tiene sentido una T4, L4, A10 o RTX 4090, pero no son necesarias.
- Cabe en GPU de consumo y en CPU: si, en cualquier RTX, en iGPU modernas y en CPUs de servidor o de borde. La ruta INT8 esta pensada explicitamente para fallback en CPU y workers de borde.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio) o PyTorch para los `.pt`. vLLM, TGI y llama.cpp no aplican porque no es un modelo generativo autoregresivo.
- Latencia y throughput: 0,50 ms por lote y 1,12 ms por elemento en GPU FP32; 0,42 ms por lote y 2,44 ms por elemento en CPU INT8. El tamano de lote no se especifica, por lo que el throughput agregado no se puede calcular con los datos disponibles.
- Almacenamiento: el repositorio completo ocupa 0,2 GB, dominado por el catalogo offline de 36 MB y los pesos; el conjunto minimo de inferencia son 32,2 MB (FP32) u 8,3 MB (INT8).

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos publicos comparables en la tarea especifica (clasificacion de releases de torrents con fusion de telemetria de enjambre). La unica alternativa documentada por el mismo autor es la variante CPU del clasificador.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Notas |
|---|---|---|---|---|---|
| NorviTech/armiger-ultra | no disponible (~8 M estimados) | no disponible | Transformer byte-level multitarea + adaptador de enjambre | Apache-2.0 | Incluye los 6 plugins de la suite; 32,2 MB FP32 / 8,3 MB INT8 |
| NorviTech/armiger | no disponible | no disponible | Clasificador CPU | Apache-2.0 | 8,3 MB; pensado como ruta CPU pura, sin el resto de la suite |
| Clasificadores de texto genericos (BERT tiny, DistilBERT) | 10-70 M | 512 tokens | Transformer subword | Apache-2.0 / MIT | No cubren telemetria de enjambre ni catalogos TMDB/TVDB/AniDB; sin datos comparativos publicados frente a Armiger Ultra |

## Limitaciones y advertencias

- Todas las metricas proceden de la model card del autor y no se ha localizado ninguna evaluacion independiente; deben tratarse como cifras no auditadas.
- El repositorio no declara el numero de parametros, la longitud de contexto ni los idiomas soportados, lo que dificulta estimar el comportamiento fuera de la distribucion de nombres de release anglosajona.
- El recall del 100 % en deteccion de honeypots se refiere a un conjunto de trampas concreto; un recall perfecto en un benchmark cerrado no implica ausencia de falsos negativos en trackers reales.
- Riesgo de deriva: la nomenclatura de releases cambia con las convenciones de los grupos, los tags de calidad y los idiomas; el autor mitiga esto con priors bayesianos y un motor RSI con verdad de campo, pero no se publica frecuencia de reentrenamiento.
- El catalogo offline de 929.400 claves queda congelado en la fecha de publicacion; titulos nuevos no estaran cubiertos hasta que se regenere.
- La licencia Apache-2.0 permite uso comercial del codigo y los pesos, pero el catalogo incorpora datos derivados de TMDB, TVDB, AniDB y Manami, cuyas condiciones de uso son independientes y deben verificarse antes de redistribuir o explotar comercialmente el modelo.
- La funcionalidad de sincronizacion DHT (BEP-44/BEP-46) y de indexacion de torrents tiene implicaciones legales segun la jurisdiccion; la propia suite incluye bloqueo de CSAM, lo que indica que el caso de abuso es un riesgo asumido por el disenador.
- El filtro `csam_guard.py` es una salvaguarda adicional, no una garantia: cualquier despliegue que ingiera contenido generado por usuarios necesita moderacion humana y registros de auditoria propios.
- El quorum Sybil K-de-N por ASN distinto y el cifrado AEAD protegen la sincronizacion, pero introducen dependencia de gestion de claves (Ed25519/X25519); una mala gestion de claves anula las garantias.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta, con fecha de publicacion y actualizacion el mismo dia: madurez y soporte de la comunidad no verificables.
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo; los enlaces externos listados a continuacion son los que aparecen en la propia model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NorviTech/armiger-ultra
- Variante CPU: https://huggingface.co/NorviTech/armiger
- Plugin de supervivencia de enjambre y honeypots: https://huggingface.co/NorviTech/armiger-swarm-survival
- Plugin de priors de enjambre: https://huggingface.co/NorviTech/armiger-swarm-priors
- Plugin de catalogo zero-cue: https://huggingface.co/NorviTech/armiger-zero-cue-catalog
- Plugin de guardia de idioma de audio: https://huggingface.co/NorviTech/armiger-audio-guard
- Plugin de calibracion y DHT: https://huggingface.co/NorviTech/armiger-calibration-dht
- Plugin de sincronizacion DHT con proteccion CSAM: https://huggingface.co/NorviTech/armiger-dht-db-sync
- Organizacion NorviTech en HuggingFace: https://huggingface.co/NorviTech
- Sitio del autor: https://norvitech.com
