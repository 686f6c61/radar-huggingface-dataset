# logo-lab/trl-bench-ckpts

## Resumen

`logo-lab/trl-bench-ckpts` no es un modelo generativo al uso, sino un repositorio de checkpoints preentrenados para la evaluacion de codificadores de tablas (tabular encoders) dentro del benchmark TRL-Bench, publicado por el grupo LOGO de la CUHK-Shenzhen en NeurIPS 2026 (Track on Evaluations and Datasets). El repositorio agrupa pesos de cuatro arquitecturas de representacion tabular: TUTA, TURL, TaBERT y TabSketchFM, con un total de 3,4 GB de artefactos binarios.

El proposito del repositorio es triple: servir como espejo fiable de releases upstream que de otro modo dependen de servicios de comparticion de ficheros (Google Drive, SharePoint) sujetos a rate-limiting y caducidad de enlaces; proporcionar un punto de descarga programatico y verificable por SHA256; y publicar el unico checkpoint existente de TabSketchFM, que IBM nunca libero. Los checkpoints de TUTA, TURL y TaBERT son copias byte a byte de los releases originales, mientras que el de TabSketchFM fue entrenado desde cero por los autores de TRL-Bench.

Es relevante ahora porque estandariza la evaluacion a nivel de representacion entre paradigmas tabulares (transformers de fila/columna, modelos de recuperacion, etc.), un area donde la reproducibilidad se ve historicamente lastrada por la fragmentacion de artefactos y licencias. La ficha describe el repositorio como conjunto de artefactos, no como un modelo unico con parametros y contexto homogeneos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cuatro arquitecturas tabulares independientes: TUTA (transformer de tabla jerarquico), TURL (transformer relacional con preentrenamiento por recuperacion), TaBERT (transformer de contenido sobre filas), TabSketchFM (modelo de sketch de tabla) |
| Parametros totales | No disponible (no se documentan recuentos por checkpoint; tamanos de fichero: 511 MB, 1,2 GB, 266 MB y 1,3 GB respectivamente) |
| Parametros activos | No disponible (no son modelos MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en binarios nativos (`.bin`, `.ckpt`), sin GGUF ni variantes cuantizadas |
| Idiomas soportados | No disponible (los modelos operan sobre contenido tabular, no sobre lenguaje natural como tarea principal) |
| Licencia | Mixta por subdirectorio: TUTA MIT, TURL Apache-2.0, TaBERT CC BY-NC 4.0, TabSketchFM CC BY-NC-ND 4.0 (cubre el codigo); el repositorio declara `license: other` |
| Formato de pesos | `tuta.bin`, `pytorch_model.bin` + `config.json`, `model.bin` + `tb_config.json`, `epoch=10-step=27786.ckpt` |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia: redistribuye checkpoints de terceros y uno entrenado por los autores. TUTA (Wang et al., KDD 2021) es un transformer jerarquico que modela estructura de tabla a nivel de celda, fila y columna. TURL (Deng et al., PVLDB 14(3), 2020) aplica preentrenamiento con objetivo de recuperacion (retrieval) sobre conocimiento estructurado, combinando enmascaramiento de entidades con tareas de recuperacion visada. TaBERT (Yin et al., ACL 2020) construye representaciones de contenido alineando utterances de lenguaje natural con filas de tabla mediante un transformer sobre filas serializadas. TabSketchFM (Khatiwada et al., ICDE 2025) parte del codigo de preentrenamiento de IBM y produce representaciones de sketches de tabla.

El unico checkpoint entrenado dentro del repositorio es el de TabSketchFM: IBM libero el codigo `pretrain.py` pero no los pesos ni el corpus de preentrenamiento, de modo que los autores de TRL-Bench lo entrenaron desde cero con el script upstream hasta el paso 27786 (epoca 10), generando un fichero de 1,3 GB. Los mirrors de TUTA, TURL y TaBERT no han sido modificados y son identicos byte a byte a los releases originales. No se documentan volumen de tokens, composicion del dataset ni etapas de RLHF/DPO, ya que no son modelos de lenguaje generativo.

## Capacidades

- Generacion de representaciones vectoriales de tablas para tareas downstream (clasificacion de columnas, deteccion de tipos, union de tablas, recuperacion de tablas).
- Aprendizaje de representacion a nivel de tabla (table-representation-learning), no generacion de texto libre.
- Soporte de evaluacion estandarizada cross-paradigm dentro del harness de TRL-Bench.
- Verificacion de integridad de artefactos mediante SHA256 y ficheros NOTICE por subdirectorio.
- Descarga programatica reproducible via `huggingface_hub.snapshot_download` con patrones de fichero.
- No se documenta tool calling, function calling, capacidades de agente, razonamiento multi-paso ni modalidades de vision o audio.

## Casos de uso

- Reproduccion de experimentos de TRL-Bench: descargar los cuatro checkpoints con `snapshot_download` y ejecutar los wrappers de `src/trl_bench/models/{tuta,turl,tabert,tabsketchfm}/` para replicar las cifras del paper NeurIPS 2026.
- Evaluacion comparativa de codificadores tabulares: usar los mirrors byte-identicos de TUTA, TURL y TaBERT como linea base frente a nuevos encoders propios, garantizando que las diferencias medidas no provienen de variaciones en los pesos.
- Investigacion sobre TabSketchFM: al ser el unico checkpoint publico de esta arquitectura, permite estudiar su comportamiento sin reentrenar desde cero; util para analisis de ablacion sobre sketches de tabla.
- Integracion en pipelines de CI/CD de investigacion: el script `scripts/download_checkpoints.sh` verifica SHA256 contra `scripts/checksums.sha256`, lo que permite cachear artefactos en runners sin depender de enlaces de terceros.
- Auditoria de licencias en proyectos academicos o industriales: los ficheros `LICENSE` y `NOTICE` por subdirectorio permiten discriminar que checkpoints son aptos para uso comercial (TUTA MIT, TURL Apache-2.0) y cuales quedan restringidos a no comercial (TaBERT, TabSketchFM).
- Docencia y laboratorios: montar practicas sobre representacion tabular con artefactos descargables de forma fiable, evitando los problemas de caducidad de Google Drive o SharePoint que afectan a los releases originales.
- Base para fine-tuning downstream: partir de los pesos de TUTA o TURL (licencias permisivas) para tareas como deteccion de tipos de columna o recuperacion de tablas en dominios propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper arXiv:2606.09323 y al repositorio `LOGO-CUHKSZ/TRL-Bench` para las cifras experimentales, pero no reproduce tablas de resultados en el README.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma agregada; por checkpoint, los tamanos de fichero son 511 MB (TUTA), 1,2 GB (TURL), 266 MB (TaBERT) y 1,3 GB (TabSketchFM), lo que sugiere huellas de memoria en el rango de unidades de GB, pero no se documentan requisitos oficiales.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU consumer: no confirmada; por tamano de pesos, los cuatro checkpoints caben previsiblemente en GPUs consumer con 8-16 GB de VRAM, pero es una inferencia a partir del tamano de fichero, no un dato del autor.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el consumo previsto es via los wrappers Python de TRL-Bench (`src/trl_bench/models/...`) y PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TUTA (mirror en este repo) | no disponible (511 MB) | no disponible | no disponible | MIT | Espejo en este repo |
| TURL (mirror en este repo) | no disponible (1,2 GB) | no disponible | no disponible | Apache-2.0 | Espejo en este repo |
| TaBERT (mirror en este repo) | no disponible (266 MB) | no disponible | no disponible | CC BY-NC 4.0 (solo no comercial) | Espejo en este repo |
| TabSketchFM (entrenado por TRL-Bench) | no disponible (1,3 GB) | no disponible | no disponible | CC BY-NC-ND 4.0 (codigo IBM) | Solo en este repo |
| Starmie | no disponible | no disponible | no disponible | no disponible | No distribuido aqui; obtener del upstream |
| TABBIE | no disponible | no disponible | no disponible | no disponible | No distribuido aqui; obtener del upstream |

No se dispone de datos de parametros, contexto ni rendimiento comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Licencias heterogeneas y restrictivas en parte del contenido: TaBERT es CC BY-NC 4.0 y TabSketchFM queda bajo CC BY-NC-ND 4.0, por lo que ambos estan limitados a uso no comercial; cualquier aplicacion comercial debe entrenar modelos propios o negociar licencia con los autores originales.
- TabSketchFM no es un release de IBM: los pesos fueron entrenados por los autores de TRL-Bench y no deben atribuirse a IBM en cuanto a comportamiento, calidad o resultados; IBM no los reviso ni los respaldo.
- No se redistribuye codigo de TabSketchFM; debe obtenerse de `IBM/tabsketchfm` bajo la licencia upstream.
- Starmie y TABBIE no estan incluidos en este repositorio; deben obtenerse de sus upstreams, lo que reintroduce dependencias externas.
- Los mirrors de TUTA, TURL y TaBERT son copias de terceros: los derechos de autor corresponden a Microsoft, sunlab-osu y Facebook AI Research respectivamente, no al grupo LOGO.
- No hay informacion sobre sesgos, tasas de alucinacion ni comportamiento en produccion; al no ser modelos generativos, el riesgo de alucinacion en el sentido habitual no aplica, pero si el de representaciones erroneas en tareas downstream.
- No se documentan longitudes de contexto, idiomas ni cuantizaciones, lo que limita la planificacion de despliegue.
- El repositorio declara `license: other` a nivel global, lo que obliga a consultar los ficheros `LICENSE` y `NOTICE` de cada subdirectorio como fuente autoritativa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/logo-lab/trl-bench-ckpts
- Paper TRL-Bench (NeurIPS 2026): https://arxiv.org/abs/2606.09323
- Codigo TRL-Bench: https://github.com/LOGO-CUHKSZ/TRL-Bench
- Codigo upstream de TabSketchFM (IBM): https://github.com/IBM/tabsketchfm
- Referencia TUTA (Wang et al., KDD 2021): no disponible enlace directo en la informacion proporcionada
- Referencia TURL (Deng et al., PVLDB 14(3), 2020): no disponible enlace directo en la informacion proporcionada
- Referencia TaBERT (Yin et al., ACL 2020): no disponible enlace directo en la informacion proporcionada
- Referencia TabSketchFM (Khatiwada et al., ICDE 2025): no disponible enlace directo en la informacion proporcionada
