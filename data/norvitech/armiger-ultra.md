# NorviTech/armiger-ultra

## Resumen

Armiger Ultra es un clasificador de metadatos de BitTorrent desarrollado por NorviTech (bajo la firma del autor spencernorton). No es un modelo generativo: recibe metadatos de torrents (nombres de ficheros, estructura del conjunto, etiquetas) y devuelve predicciones de categoria, deteccion de contenido no deseado, clasificacion de audio por idioma y estimaciones de disponibilidad del swarm. Resuelve un problema concreto de los indexadores de BitTorrent: enrutar y filtrar automaticamente decenas de miles de entradas sin inspeccionar el contenido real.

La version documentada es la 3.17.0 (bundle `v3.17.0-rc3`), una arquitectura hibrida de cuatro planos disenada desde cero que combina un escaner de seguridad de entrada completa, un tri-encoder de 7,14 M de parametros (SentencePiece Unigram de 32K subpalabras, Byte ConvNeXt, File-Set PMA, encoder de audio aislado y cabeza CRF BIO+Pointer para spans UTF-8), una capa de autoridad externa binaria con proyecciones lexicas FP16 y un meta-stacker GBDT en ONNX puro con puerta de admision selectiva en dos regimenes.

Su relevancia practica esta en el coste: se ejecuta integramente en CPU, sin GPU ni API de inferencia de pago, con dos artefactos ONNX de 27,3 MiB (FP32) y 7,0 MiB (INT8), y un runtime 100 % libre de `torch`. La model card reporta una latencia de inferencia en produccion de 8,05 ms y una reduccion del RSS del contenedor de 1.212,0 MiB a 283,1 MiB tras el corte en vivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida de 4 planos: escaner de seguridad + tri-encoder (SentencePiece Unigram 32K, Byte ConvNeXt, File-Set PMA, encoder de audio aislado, CRF BIO+Pointer) + autoridad externa binaria con proyecciones lexicas FP16 + meta-stacker GBDT en ONNX |
| Parametros totales | 7,14 M en el tri-encoder (Plane 1); el resto de planos son componentes no neuronales o compactos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (`armiger_ultra.fp32.onnx`, 27,3 MiB) e INT8 (`armiger.int8.onnx`, 7,0 MiB) |
| Idiomas soportados | en, ja, fr, de, es, it, ru, ko, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura `v3.17.0` (`root_sha = 181b4712311ba49f59e0aa0f0d97a4ea574568adeb0b7fedc2f237b6090fb1fd`) se organiza en cuatro planos. El Plane 0 es un escaner de seguridad sobre la entrada completa. El Plane 1 es un tri-encoder de 7,14 M de parametros que combina tokenizacion SentencePiece Unigram de 32K subpalabras, un Byte ConvNeXt para la representacion a nivel de bytes, un File-Set PMA (Pooling by Multihead Attention) para agregar el conjunto de ficheros del torrent, un encoder de audio `P(x)` aislado para clasificacion audio-idioma y una cabeza CRF BIO+Pointer que extrae spans UTF-8. El Plane 2 contiene una autoridad externa binaria compacta (`authority_v317.aidx`, `validated_zero_cue_catalog.zcb3`) y proyecciones lexicas FP16 resueltas con un unico matmul. El Plane 3 es un meta-stacker GBDT en ONNX puro con una puerta de admision selectiva de dos regimenes.

El diseno es deliberadamente de "clean-sheet" y sin dependencias de `torch`: `0` ficheros `.pkl` y `100 %` de runtime libre de PyTorch. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO; esos datos no estan disponibles. La validacion reportada se apoya en conjuntos sellados (`R26-live`, `N = 2.520`; `R27-live`, `N = 44.672` filas prospectivas), siete suites de regresion completas (`N = 10.851`) y 180 canarios de red-team de seguridad, inyeccion y droppers.

## Capacidades

- Clasificacion de metadatos de BitTorrent en 11 categorias con una exactitud reportada del 90,36 % en `R26-live`.
- Deteccion de contenido para adultos (`xxx`) con recall del 95,21 % y deteccion de categoria `unknown` con recall del 69,03 %.
- Clasificacion de audio por idioma mediante el encoder `P(x)` aislado, con recall no-ingles reportado del 87,77 %.
- Filtrado de basura y malware (junk/malware screening, Policy-2) con recall del 97,31 % y especificidad limpia del 99,04 %.
- Estimacion de disponibilidad del swarm (swarm-availability) a partir de metadatos.
- Extraccion de spans UTF-8 mediante cabeza CRF BIO+Pointer, con validacion reportada del 100 % en los canarios.
- Coincidencia contra autoridad externa compacta (catalogos binarios) para validacion de entradas.
- Capacidades multilingues en en, ja, fr, de, es, it, ru, ko y zh.
- No soporta generacion de texto, tool calling, razonamiento multi-paso ni agentes: es un clasificador, no un LLM.

## Casos de uso

- Indexacion de BitTorrent en Bitmagnet: el modelo se conecta como clasificador para etiquetar automaticamente cada entrada del indexador, aprovechando su ejecucion en CPU y su latencia de 8,05 ms para procesar colas de decenas de miles de torrents sin coste de GPU.
- Despliegue en Rats Search: integracion mediante los conectores oficiales para enrutar resultados por categoria y descartar entradas no deseadas antes de mostrarlas al usuario.
- Moderacion y filtrado de contenido para adultos: la deteccion de `xxx` con recall del 95,21 % permite marcar o excluir entradas en portales con politicas de contenido, sin inspeccionar el payload real.
- Deteccion de malware y droppers disfrazados: el screening Policy-2, con precision reportada del 100 % (144/144) en la auditoria de exencion de software/juegos, sirve para bloquear ejecutables maliciosos camuflados en indexadores publicos.
- Clasificacion audio-idioma para catalogacion: el encoder `P(x)` identifica el idioma de pistas de audio a partir de metadatos, util para organizar bibliotecas multimedia multilingues.
- Estimacion de disponibilidad del swarm: las predicciones de swarm-availability permiten priorizar o despriorizar entradas en un motor de busqueda segun su probabilidad de estar bien sembradas.
- Enriquecimiento de pipelines de datos: como paso previo en un ETL que normaliza y etiqueta catalogos de torrents antes de almacenarlos, con despliegue en contenedor Docker (`ghcr.io/spencernorton/armiger-ultra:3.17.0`).
- Auditoria de seguridad de entradas: el Plane 0 y los 180 canarios de red-team (inyeccion SQL, XSS, path traversal, prompt injection) permiten usar el modelo como capa de saneamiento de metadatos no confiables.

## Benchmarks y rendimiento

| Conjunto | Metrica | Resultado |
|---|---|---|
| `R26-live` (N = 2.520) | Exactitud 11 clases | 90,36 % (+14,13 pp vs v3.16.1) |
| `R26-live` | Exactitud 10 clases sin `unknown` | 91,37 % |
| `R26-live` | Recall `xxx` | 95,21 % (+12,77 pp) |
| `R26-live` | Recall `unknown` | 69,03 % (+67,26 pp) |
| `R26-live` | Recall audio `P(x)` no-ingles | 87,77 % |
| `R26-live` | Recall junk | 97,31 % (especificidad limpia 99,04 %) |
| `R26-live` | Corrupcion de media admitida | 0,00 % (0/822) |
| `heldout_20261026` (N = 2.670) | Exactitud | 98,05 % (+18,39 pp) |
| `R22-live` (N = 2.795) | Exactitud | 94,67 % (+20,54 pp) |
| Suite 1 Multilingual (N = 1.000) | Exactitud | 98,60 % |
| Suite 2 Game (N = 755) | Exactitud | 99,60 % |
| Suite 3 Structural (N = 735) | Exactitud | 98,64 % |
| Suite 4 Adversarial (N = 896) | Exactitud | 98,21 % |
| Suite 5 Multilingual Stress (N = 2.000) | Exactitud | 99,00 % |
| Auditoria de desacuerdo R27 (253 filas) | Ratio de victorias v3.17.0 | 6,23x (McNemar p = 1,98e-28) |
| Auditoria Policy-2 (144 filas) | Precision de exencion | 100,00 % |
| Canarios red-team (180) | Superados | 100,00 % |

## Requisitos de hardware

- Inferencia exclusivamente en CPU; no requiere GPU ni API de pago.
- VRAM: no aplica (modelo ONNX de 7,0 MiB en INT8 y 27,3 MiB en FP32).
- Memoria del contenedor en produccion: RSS de 283,1 MiB tras el corte (frente a 1.212,0 MiB de la version anterior, -76,6 %).
- Crecimiento de RSS en soak de 4.096 filas: +0,88 MiB (359,04 MiB de RSS del worker, 460,37 MiB de pico del cgroup).
- Cabe en cualquier GPU de consumo, pero no la necesita; tambien en CPU de un solo nucleo o en entornos edge.
- Opciones de despliegue: contenedor Docker (`ghcr.io/spencernorton/armiger-ultra:3.17.0`), runtime ONNX, integracion con Bitmagnet y Rats Search mediante conectores oficiales.
- Latencia de inferencia en produccion: 8,05 ms (frente a 38,62 ms de la version anterior, 4,80x mas rapido).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Armiger Ultra 3.17.0 | 7,14 M (tri-encoder) | no disponible | Clasificacion de metadatos BitTorrent | Apache-2.0 | ONNX en HF, Docker |
| Armiger (Standalone) | no disponible | no disponible | Clasificacion INT8 enfocada | Apache-2.0 | ONNX en HF |
| Armiger v3.16.1 | no disponible | no disponible | Clasificacion de metadatos BitTorrent | Apache-2.0 | Version anterior |

No se dispone de datos de benchmarks de modelos de terceros comparables en la informacion proporcionada; la comparativa se limita a las variantes del propio autor.

## Limitaciones y advertencias

- El modelo clasifica unicamente metadatos suministrados; no inspecciona el payload real de los medios ni certifica la legalidad del contenido.
- Las salidas de audio/subtitulo, junk, contenido para adultos y honeypot son predicciones o flags de politica, no verdades absolutas.
- El recall de la categoria `unknown` es del 69,03 %, de modo que aproximadamente un tercio de las entradas desconocidas pueden clasificarse erroneamente.
- No es un modelo generativo: no admite tool calling, razonamiento multi-paso ni agentes.
- La model card no documenta sesgos conocidos, composicion del dataset de entrenamiento ni volumen de tokens; no disponible.
- El autor no detalla la longitud de contexto soportada; no disponible.
- Aunque la licencia es Apache-2.0 y permite uso comercial, conviene revisar las condiciones del bundle y de los catalogos de autoridad externa incluidos.
- En produccion se recomienda fijar el canal de actualizacion (`ARMIGER_UPDATE_CHANNEL=off`) para evitar cambios de modelo no controlados.
- La model card esta redactada en tono promocional y contiene afirmaciones de rendimiento no verificables de forma independiente; conviene tratarlas como datos del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NorviTech/armiger-ultra
- Modelo Armiger Standalone: https://huggingface.co/NorviTech/armiger
- Repositorio GitHub y guias de instalacion: https://github.com/spencernorton/armiger
- Release v3.17.0: https://github.com/spencernorton/armiger/releases/tag/v3.17.0
- Conectores de indexadores: https://github.com/spencernorton/Armiger-Connectors
- DH-Waypoint: https://github.com/spencernorton/DH-Waypoint
- Documentacion de evaluacion: https://github.com/spencernorton/armiger/blob/main/docs/evaluation.md
- Guias de configuracion: https://github.com/spencernorton/armiger#choose-your-setup
- Vision general de modelos NorviTech: https://norvitech.com/ai-models/#armiger
- Imagen Docker: ghcr.io/spencernorton/armiger-ultra:3.17.0
