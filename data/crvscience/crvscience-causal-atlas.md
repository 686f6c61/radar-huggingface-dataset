# crvscience/crvscience-causal-atlas

## Resumen

Causal Atlas (`causal-atlas` v0.2.0) es una aplicacion de escritorio nativa escrita en Rust, desarrollada por Bryan P. White bajo el sello CRV Science, que funciona como banco de trabajo (workbench) para la inferencia de rutas biologicas causales, reguladores upstream, redes mecanicistas y firmas de perturbacion transcriptomica. No se trata de un modelo de lenguaje: es una herramienta de analisis bioinformatico con GUI nativa, interfaz de terminal y CLI, respaldada por un motor de cache SQLite 3 en modo WAL y por flujos de datos biomedicos de codigo abierto.

El proyecto se presenta como una implementacion independiente y "clean-room" construida a partir de publicaciones estadisticas y de teoria de grafos revisadas por pares (Kramer et al., 2014), sin dependencias de SDKs, APIs o bases de conocimiento comerciales. Integra datos de WikiPathways (mas de 866 diagramas GPML mapeados con coordenadas), Reactome (mas de 2.647 rutas humanas), OmniPath, CollecTRI, SIGNOR 3.0, STRING v12 y Open Targets v4.

Su relevancia radica en que ofrece un flujo completo de analisis de expresion diferencial (calibracion BH/Wald), puntuacion Z de reguladores upstream con signo, analisis de redes causales multi-salto y reversión de perturbaciones estilo CMap, todo ello sin dependencias de runtime externas (sin R, Python, Java ni OpenSSL) y con un binario autocontenido. La ficha se completa a continuacion con los datos disponibles, indicando explicitamente cuando un parametro no esta documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicacion nativa en Rust (GUI de escritorio, TUI y CLI); no es un modelo neuronal. Motor de cache SQLite 3 en modo WAL |
| Parametros totales | no disponible (no aplica: no es un modelo de parametros) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (la interfaz y documentacion estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no aplica; se distribuye como codigo fuente Rust y base de datos `causal_atlas.sqlite3`) |

## Arquitectura y entrenamiento

Causal Atlas no es un modelo entrenado, sino una aplicacion de analisis. Su arquitectura se organiza en crates Rust (`ca-core`, `ca-streams`, `ca-app`) con `#![forbid(unsafe_code)]` en los modulos de nucleo, flujos y UI/exportacion, salvo una excepcion acotada en `ca-app/src/main.rs` (`#![deny(unsafe_code)]`) para la vinculacion de consola padre en Win32. Empaqueta estaticamente SQLite 3 mediante `rusqlite` con la feature `bundled` en modo WAL, emplea TLS en Rust puro (`ureq` + `rustls`) y extraccion de archivos `.zip`/`.gz` tambien en Rust puro (`zip` + `flate2` con `miniz_oxide`).

El motor de datos mantiene un grafo de conocimiento persistente con tablas de entidades deduplicadas, aristas causales con signo (`E_t`, `E_a`, `E_p`), rutas canonicas (coordenadas 2D normalizadas de GPML y Reactome DiagramJS) y firmas de perturbacion. La sincronizacion HTTP es condicional, con seguimiento de `ETag`, `Last-Modified`, ventanas TTL de 7 dias y digests SHA-256 para omitir archivos sin cambios. Ademas, incorpora una cache de resultados de analisis sub-milisegundo que hashea `(dataset_measurements, kg_revision, |log2FC|_cutoff, fdr_cutoff, cna_max_depth)` con SHA-256 y almacena blobs comprimidos de `CoreAnalysisReport`, invalidandose automaticamente al fusionar nuevos flujos. No se documenta ningun proceso de entrenamiento, RLHF ni DPO, al no ser un modelo de aprendizaje.

## Capacidades

- Inferencia de rutas biologicas causales y redes mecanicistas a partir de datos de expresion diferencial (TSV de DESeq2 o edgeR).
- Puntuacion Z de reguladores upstream con signo segun el metodo de Kramer et al. (2014).
- Analisis de redes causales multi-salto (Causal Network Analysis).
- Reversion de perturbaciones transcriptomicas estilo CMap.
- Calibracion estadistica de expresion diferencial mediante ajuste BH (Benjamini-Hochberg) y Wald.
- Sincronizacion y cache de flujos de datos: WikiPathways GPML, Reactome GMT, OmniPath, CollecTRI, SIGNOR 3.0, STRING v12 y Open Targets v4.
- GUI de escritorio nativa con pestanas (incluye la pestana 8 de flujos de datos abiertos y cache SQLite) e interfaz de terminal y CLI basada en `clap`.
- Descarga por lotes sin interfaz grafica (`download-all`) con opcion de re-sincronizacion forzada.
- Gestion de cache: inspeccion de huella WAL, telemetria de aciertos/fallos y `VACUUM` de SQLite desde la propia aplicacion.
- Exportacion de informes a JSON y CSV (por ejemplo, `report.json`, `upstream_regulators_ranked.csv`).
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling de LLM ni agentes conversacionales.

## Casos de uso

- Analisis de expresion diferencial en laboratorio seco: a partir de un TSV de DESeq2 o edgeR, el comando `analyze` genera un `report.json` con rutas y reguladores upstream puntuados, adecuado para pipelines reproducibles sin depender de R o Python.
- Identificacion de reguladores upstream en estudios de transcriptomica: la puntuacion Z con signo permite priorizar factores de transcripcion candidatos que expliquen un perfil de expresion observado, usando las redes de OmniPath, CollecTRI y SIGNOR.
- Reversion de firmas de perturbacion (drug repurposing): el analisis estilo CMap permite buscar compuestos o perturbaciones que reviertan una firma transcriptomica, apoyandose en las firmas almacenadas en SQLite.
- Analisis de redes causales multi-salto: util para trazar mecanismos indirectos entre genes y fenotipos a traves de rutas de WikiPathways y Reactome con coordenadas mapeadas.
- Integracion en pipelines bioinformaticos automatizados: el CLI headless (`download-all`, `analyze`) y la cache con hash SHA-256 permiten ejecuciones por lotes en servidores sin GUI, con invalidacion controlada al actualizar el grafo.
- Visualizacion de rutas con coordenadas 2D: la obtencion bajo demanda de diagramas Reactome (`Fetch Reactome 2D Diagram`) y las coordenadas GPML permiten representar rutas sobre layouts canonicos en la GUI.
- Validacion y control de calidad: la suite `headless_validation` (`cargo test -p ca-core --test headless_validation`) comprueba la calibracion BH/Wald, la puntuacion Z de reguladores y la reversion CMap, util en entornos de integracion continua.
- Entornos con restricciones de dependencias: al no requerir R, Python, Java ni OpenSSL y empaquetar SQLite estaticamente, es adecuado para despliegues en maquinas aisladas o con politicas estrictas de dependencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona una suite de validacion headless (`headless_validation`) con salidas documentadas en `validation/README.md` (`causal_atlas_validation_summary.json` y `upstream_regulators_ranked.csv`), pero no se proporcionan cifras numericas de rendimiento, precision ni comparativas.

## Requisitos de hardware

- No es un modelo neuronal, por lo que no requiere VRAM de GPU para inferencia.
- Se ejecuta como aplicacion nativa en CPU; no se especifican requisitos minimos de CPU, RAM o disco en la informacion disponible.
- Almacenamiento: requiere espacio para la base de datos `causal_atlas.sqlite3`, que integra mas de 866 diagramas GPML de WikiPathways, mas de 2.647 rutas de Reactome y flujos regulatorios; el tamano concreto no esta disponible.
- GPU recomendadas: no aplica; no se documenta aceleracion por GPU.
- Cabe en cualquier equipo de sobremesa o portatil convencional, siempre que compile el workspace Rust; no se detallan requisitos especificos.
- Opciones de despliegue: binario nativo compilado con Cargo (`cargo run --release -p ca-app`), GUI de escritorio, TUI y CLI headless (`download-all`, `analyze`).
- Latencia y throughput: se menciona una cache de resultados de analisis "sub-milisegundo" y omision de descargas sin cambios "en milisegundos" gracias a ETag/SHA-256, pero no se aportan cifras medidas de latencia ni throughput.

## Comparativa con modelos similares

| Herramienta | Tipo | Datos integrados | Dependencias de runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Causal Atlas v0.2.0 | App Rust (GUI/TUI/CLI) | WikiPathways, Reactome, OmniPath, CollecTRI, SIGNOR, STRING, Open Targets | Ninguna externa (SQLite empaquetado) | no disponible | Hugging Face (crvscience/crvscience-causal-atlas) |
| Alternativas de inferencia de rutas (p. ej., herramientas R/Python del ecosistema Bioconductor) | Paquetes estadisticos | Variable segun paquete | R o Python | no disponible | no disponible |
| Alternativas de analisis CMap | Servicios o paquetes | Firmas de perturbacion | Variable | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con herramientas equivalentes; las filas de alternativas se indican como "no disponible".

## Limitaciones y advertencias

- La model card no declara licencia; no puede asumirse uso comercial sin consultar al autor.
- No es un modelo de lenguaje ni un sistema conversacional: no genera texto, codigo ni respuestas; cualquier expectativa en ese sentido es incorrecta.
- Depende de la calidad y actualizacion de los flujos externos (WikiPathways, Reactome, OmniPath, CollecTRI, SIGNOR, STRING, Open Targets); cambios en sus APIs o formatos pueden romper la sincronizacion.
- La inferencia causal estadistica (puntuacion Z de reguladores, redes causales) no implica causalidad biologica demostrada; los resultados requieren validacion experimental.
- La cache TTL de 7 dias y la invalidacion por hash pueden producir resultados obsoletos si no se fuerza la re-sincronizacion tras actualizaciones del grafo.
- El proyecto esta en version 0.2.0 con 0 descargas y 0 likes en Hugging Face; su madurez y soporte comunitario son limitados.
- Solo se documenta validacion headless interna; no hay benchmarks publicos ni evaluaciones independientes.
- La interfaz y la documentacion estan en ingles; no se declaran idiomas adicionales.
- El uso de `unsafe_code` esta restringido pero no eliminado por completo en `ca-app/src/main.rs` (vinculacion de consola Win32).
- Riesgo de sesgo derivado de las bases de conocimiento subyacentes (cobertura desigual entre genes, rutas y organismos), no documentado por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/crvscience/crvscience-causal-atlas
- CRV Science Apps Hub: https://crvscience.com/apps
- Preprint (APP-PREPRINT-04): https://crvscience.com/apps/preprints/causal-atlas-pathway-perturbation
- DOI conceptual (Zenodo): https://doi.org/10.5281/zenodo.24222376
- Referencia metodologica (Kramer et al., 2014): https://pmc.ncbi.nlm.nih.gov/articles/PMC3928520/
- WikiPathways GPML: https://data.wikipathways.org/current/gpml/
- Reactome ContentService: https://reactome.org/ContentService
- OmniPath webservice: https://pypath.omnipathdb.org/webservice.html
- CollecTRI: https://github.com/saezlab/collecTRI
- SIGNOR 3.0: https://academic.oup.com/nar/article/51/D1/D631/6761728
- STRING API: https://string-db.org/help/api/
- Open Targets GraphQL API: https://platform-docs.opentargets.org/data-access/graphql-api
