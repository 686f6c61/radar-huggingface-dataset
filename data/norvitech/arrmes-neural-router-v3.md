# NorviTech/arrmes-neural-router-v3

## Resumen

ArrmesNeuralRouterV3 es un clasificador de intenciones y resolutor de entidades tipadas de muy pequeño tamaño (7,52 MiB, 7.883.511 bytes) desarrollado por NorviTech para Arrmes v1.4.0, un asistente local orientado a la operación de un stack de medios autoalojado (Sonarr, Radarr, Lidarr, Bazarr, qBittorrent, Tautulli, Seerr y Bitmagnet). No es un modelo generativo: su función es mapear una consulta en lenguaje natural a una de las acciones de un contrato de herramientas versionado (`arrmes.tools.v2` con 20 tools y `arrmes.tools.v3` con 23) y extraer los argumentos tipados correspondientes.

Técnicamente es una red MLP de dos capas (16.416 → 128 → 28) sobre una representación de features basada en hashing Blake2b con signo de n-gramas de palabra, carácter y cláusula, más 32 indicadores estructurales. Se distribuye como un artefacto `.npz` que se ejecuta con NumPy (con fallback en stdlib puro) y sin GPU, con latencias warm p50 de 0,674 ms en Apple M4 Pro y 0,944 ms en AMD Ryzen 9 7950X3D.

Su relevancia está en el nicho: routers de intención deterministas y auditables para agentes con operaciones de escritura sobre servicios reales, donde el coste de una acción no autorizada es alto. La model card reporta 0 escrituras no autorizadas sobre 1.200 casos de seguridad y un 100% de exactitud en el contrato v2 sobre el suite bloqueado `arrmes-bench-v5`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de 2 capas ReLU (16.416 → 128 → 28) sobre features hasheadas; no es un transformer |
| Parametros totales | no disponible (pesos en `router_weights.npz` de 7.883.511 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa una consulta por invocación; sin ventana declarada) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante dentro de `.npz`; no se documentan variantes) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `.npz` (NumPy); lector stdlib puro incluido como fallback |

## Arquitectura y entrenamiento

La entrada es un vector de 16.416 dimensiones compuesto por una proyección de 16.384 dimensiones de n-gramas de palabra, carácter y cláusula con hashing Blake2b con signo, que incluye etiquetado explícito de alcance de negación en cláusulas subordinadas contrastivas (`rather than`, `instead of`, `without`, `do not`) y normalización de superficie con entidades sustituidas (`<QUOTED_0>`, `<QUOTED_1>`). A esto se concatenan 32 indicadores estructurales: número de spans entrecomillados, marcadores de rol artista/álbum, IDs candidatos de 24 hex, marcadores de temporada/episodio, trampas de servicios con nombre similar, marcadores de inyección/shell/SQLi y conjunciones multi-acción.

La cabeza clasificadora es un MLP de 2 capas ReLU (16.416 → 128 → 28 clases de acción/slot/razón) entrenado con AdamW y label smoothing (`seed=20261102`, 28 épocas, 9,364 s en Apple M4 Pro), con pérdida de entropía cruzada que baja de 0,699036 a 0,000058 sobre `TrainPool-v7` (5.827 ejemplos con entidades disjuntas respecto al conjunto de evaluación). El clasificador se acompaña de `resolve_arguments_for_class` en `src/arrmes/neural_router.py` para la extracción exacta de argumentos y entidades tipadas. No se documenta entrenamiento con RLHF ni DPO; el pipeline es supervisado sobre datos sintéticos y curados.

## Capacidades

- Clasificación de intención sobre un contrato cerrado de 20 herramientas (`arrmes.tools.v2`) y 23 (`arrmes.tools.v3`), con hashes de esquema publicados.
- Resolución de entidades y argumentos tipados: título, tipo de medio, referencia, ámbito, temporada, episodio, año, idioma, `forced` y `hearing_impaired`.
- Enrutado nativo de 31 pares servicio/operación de lectura sobre 8 APIs (Sonarr, Radarr, Lidarr, Bazarr, qBittorrent, Tautulli, Seerr, Bitmagnet) mediante `service_query`.
- Detección de negación y de cláusulas contrastivas para evitar ejecutar la acción contraria a la solicitada.
- Clasificación de consultas como `clarify` (pide aclaración) o `unsupported` (peligrosa, compleja o fuera de ámbito).
- Marcadores de seguridad para inyección de prompts, comandos shell y SQLi en la propia consulta.
- Ejecución en CPU sin GPU, con latencia sub-milisegundo y huella de memoria de ~80 MiB de RSS.
- No soporta generación de texto, razonamiento libre, código, matemáticas, visión ni audio.

## Casos de uso

- Enrutado de intenciones en un asistente de medios autoalojado: cada consulta del usuario se clasifica en una de las 23 acciones del contrato v3 y se resuelven los argumentos antes de llamar a la API correspondiente, con latencias de 0,674 ms p50 en M4 Pro que permiten integración síncrona en el bucle de conversación.
- Puerta de seguridad previa a operaciones de escritura: el router clasifica la consulta y el verificador `verify_proposal` bloquea cualquier propuesta de escritura no confirmada; la model card reporta 0 escrituras no autorizadas sobre 1.200 casos de seguridad y 2.170 oportunidades sin escritura.
- Desambiguación de peticiones ambiguas: consultas como «quita esa descarga» se enrutan a `clarify` con el slot correspondiente (`title`, `media_type`, `reference`, `scope`) en lugar de ejecutar una acción destructiva.
- Filtrado de consultas fuera de ámbito o peligrosas: los marcadores de inyección, shell y SQLi en la feature de 32 indicadores permiten clasificar como `unsupported` antes de tocar ninguna API del stack.
- Automatización de subtítulos: `bazarr_subtitle_search` y `bazarr_subtitle_download` con argumentos tipados (idioma, temporada, episodio, `forced`, `hearing_impaired`) permiten pipelines de búsqueda y descarga de subtítulos disparados por lenguaje natural.
- Despliegue en entornos con recursos mínimos: al ser un `.npz` de 7,52 MiB ejecutable con NumPy o stdlib puro, cabe en contenedores ligeros, dispositivos de borde o junto al propio servidor de medios sin GPU dedicada.
- Auditoría y reproducibilidad de agentes: el contrato versionado con SHA-256 de esquema (`e34f94ec…` para v2, `908eb9c5…` para v3) y el hash de pesos (`e640ead7…`) permiten fijar exactamente qué router y qué tools se usaron en cada ejecución.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el suite bloqueado `NorviTech/arrmes-bench-v5` (`seed=7007`, sin solapamiento de consultas ni entidades con entrenamiento):

| Suite | Casos | Clusters | Track A (exactitud) | Track B | Escrituras no autorizadas |
|---|---|---|---|---|---|
| Positivos v2 | 1.060 | 212 | 1.060/1.060 (100,00%) | 1.060/1.060 (100,00%) | 0 |
| Positivos v3 | 1.260 | 252 | 1.257/1.260 (99,76%) | 1.257/1.260 (99,76%) | 0 |
| Hard-negative / ambigüedad / seguridad | 1.200 | 240 (35 familias) | 1.200/1.200 (100,00%) | 1.200/1.200 (100,00%) | 0 |
| acceptance-v4 congelado | 1.000 | no disponible | 1.000/1.000 (100,00%) | 1.000/1.000 (100,00%) | 0 |
| Track C workflows controlados | 52 | no disponible | 52/52 (100,00%) | — | 0 |

Cotas inferiores de confianza reportadas: Wilson 95% LCB 99,64% (v2 Track A), 99,30% (v3 Track A) y 99,68% (seguridad Track A); cluster-bootstrap 95% LCB 100,00%, 99,44% y 100,00% respectivamente. Cota superior Clopper-Pearson 95% unilateral de 0,25% sobre el suite negativo y 0,14% sobre las 2.170 oportunidades sin escritura.

Latencia y memoria (según model card):

| Plataforma | Carga en frío | Warm modelo solo (p50/p95) | Warm routing + verify (p50/p95) | HTTP `/v1/query` loopback (p50/p95) | RSS pico |
|---|---|---|---|---|---|
| Apple M4 Pro (macOS 26.3 ARM64) | 16,71 ms | 0,484 / 0,684 ms | 0,674 / 0,882 ms | 1,113 / 1,264 ms | 80,70 MiB |
| AMD Ryzen 9 7950X3D (CPU) | no disponible | no disponible | 0,944 ms (p50) | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es generativo y no aplica.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU. El artefacto de pesos ocupa 7,52 MiB y el proceso completo pico ~80,70 MiB de RSS en M4 Pro.
- GPU: no necesaria ni soportada de forma nativa (ejecución NumPy o stdlib puro).
- CPU: cualquier x86-64 o ARM64 moderno; medido en Apple M4 Pro y AMD Ryzen 9 7950X3D.
- Cabe en cualquier consumer, incluidos dispositivos de borde y contenedores de pocos cientos de MiB.
- Despliegue: importación directa del `.npz` desde Python con NumPy, o mediante el lector stdlib incluido; se integra en el servicio HTTP de Arrmes (`/v1/query`).
- Throughput/latencia: warm p50 de 0,674 ms (routing + verificación) en M4 Pro y 0,944 ms en Ryzen 9 7950X3D; HTTP loopback p50 1,113 ms en M4 Pro.
- No se documentan opciones de servido tipo vLLM, llama.cpp, Ollama o TGI, al no ser un modelo generativo.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| ArrmesNeuralRouterV3 | MLP clasificador de intención + resolver de entidades | 7,52 MiB (`.npz`) | no disponible | MIT | Contrato cerrado de 23 tools; 0 escrituras no autorizadas en 1.200 casos de seguridad |
| Modelos generativos pequeños con function calling (p. ej. familias de 1-7B) | LLM decoder-only | miles de millones de parámetros | miles de tokens | variable | Requieren GPU o CPU con alto consumo; latencia de decenas a cientos de ms; mayor flexibilidad pero no deterministas |
| Routers basados en reglas / expresiones regulares | heurístico | 0 | no aplica | variable | Deterministas y baratos, pero frágiles ante negación, ambigüedad y paráfrasis |
| Clasificadores de texto tipo encoder pequeño (p. ej. destilados) | Transformer encoder | decenas de millones | cientos de tokens | variable | Mayor coste de inferencia y de despliegue; no incluyen resolución tipada de argumentos |

No se dispone de comparaciones publicadas por el autor frente a alternativas concretas; la tabla anterior es contextual y no incluye cifras de rendimiento comparadas.

## Limitaciones y advertencias

- Ámbito cerrado: solo cubre las 20/23 herramientas del contrato Arrmes y los 8 servicios del stack; cualquier otra intención se clasifica como `unsupported`.
- Idioma: únicamente inglés (`en`); no se documenta soporte multilingüe.
- No es un modelo generativo: no produce texto, razonamiento libre, código ni respuestas conversacionales.
- Dependencia de un contrato versionado: cambios en el esquema de tools requieren reentrenamiento; los hashes SHA-256 publicados fijan las versiones v2 y v3.
- Los benchmarks son autoinformados por el autor sobre suites propias (`arrmes-bench-v5`, `acceptance-v4`); no hay evaluación independiente publicada.
- Riesgo de falsos negativos en la clasificación de seguridad: la cota superior Clopper-Pearson 95% unilateral es 0,25% sobre el suite negativo, es decir, no se descarta por completo una escritura no autorizada en producción.
- La model card está truncada en la información disponible; no se detallan sesgos, composición completa del dataset ni política de mantenimiento.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantía; conviene conservar el aviso de copyright.
- El repositorio de HuggingFace muestra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere adopción temprana y escasa validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NorviTech/arrmes-neural-router-v3
- Dataset de evaluación: https://huggingface.co/datasets/NorviTech/arrmes-bench-v5
- Release de Arrmes v1.4.0: https://github.com/spencernorton/arrmes/releases/tag/v1.4.0
- Código del router (`neural_router.py`): https://github.com/spencernorton/arrmes/blob/v1.4.0/src/arrmes/neural_router.py
