# davidwdw/fa-eval-centre-pi05-turning-on-radio-20260826-837d012077d0

## Resumen

Este repositorio no es un modelo de lenguaje ni un conjunto de pesos: es un archivo de evaluacion versionado (fleet archive) publicado por el usuario davidwdw bajo el identificador `fa-eval-centre-pi05-turning-on-radio-20260826-837d012077d0`. Contiene los artefactos de una ejecucion de evaluacion del checkpoint upstream `pi05_b1k` para la tarea `turning_on_radio`, dentro del ecosistema openpi-b1k. La model card indica explicitamente que se trata de una instantanea (snapshot) y no de un espejo de directorio en vivo.

El paquete incluye `meta.json`, `summary.json`, JSON por episodio, logs y videos, segun la descripcion del autor. La receta canonica registrada es `historical centre vla_results 2026-08-26` y el tier se identifica como `pi05_turning_on_radio`. El autor recomienda usar la revision exacta registrada y verificar el fichero `SHA256SUMS`.

Su relevancia es de tipo metodologico y de trazabilidad: permite auditar y reproducir una evaluacion concreta de una politica vision-lenguaje-accion sobre una tarea de manipulacion, algo poco habitual en publicaciones de HuggingFace. El repositorio no incluye pesos (tamano declarado 0,0 GB), no declara licencia, idiomas ni pipeline, y acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete no contiene pesos; la model card lo vincula al checkpoint upstream pi05_b1k, un modelo vision-lenguaje-accion, segun la referencia a openpi-b1k) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que el checkpoint evaluado sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no aplica al contenido publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no aplica: el repositorio no incluye pesos (tamano declarado 0,0 GB) |
| Tipo de artefacto | Archivo de evaluacion versionado (fleet archive) |
| Tarea evaluada | `turning_on_radio` |
| Checkpoint evaluado | `pi05_b1k` `turning_on_radio` (upstream, openpi-b1k) |
| Receta canonica | historical centre `vla_results` 2026-08-26 |
| Tier | `pi05_turning_on_radio` |
| Contenido declarado | `meta.json`, `summary.json`, JSON por episodio, logs, videos |
| Verificacion de integridad | `SHA256SUMS` |
| Descargas | 0 |
| Likes | 0 |
| Tamano del repositorio | 0,0 GB |
| Fecha de creacion | 2026-10-01T13:32:42Z |
| Ultima actualizacion | 2026-10-01T13:32:57Z |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo evaluado: el repositorio es un contenedor de resultados de evaluacion, no una publicacion de pesos ni una ficha tecnica del checkpoint. La unica referencia arquitectonica es indirecta, a traves del nombre `pi05_b1k` y de la mencion a `openpi-b1k`. La busqueda web ha devuelto el repositorio `mli0603/openpi-comet`, que se presenta como el marco unificado de preentrenamiento, postentrenamiento, generacion de datos y evaluacion de modelos pi0.5 (Pi05) sobre BEHAVIOR-1K, lo que situa el checkpoint evaluado en la familia de modelos vision-lenguaje-accion aplicados a tareas de manipulacion en simulacion.

Tampoco hay datos sobre volumen de tokens, composicion del dataset, ni sobre si hubo RLHF, DPO u otras fases de alineamiento. Lo unico documentado sobre el proceso es la propia evaluacion: una ejecucion fechada el 2026-08-26 sobre el checkpoint `turning_on_radio`, cuyos resultados se serializan en `summary.json` y en ficheros JSON por episodio, acompanados de logs y videos. La model card insiste en dos cuestiones operativas: usar la revision exacta registrada y validar `SHA256SUMS`, lo que sugiere que el autor trata estos paquetes como evidencias reproducibles de una flota de evaluaciones.

## Capacidades

- Publicacion de resultados de evaluacion de una politica `pi05_b1k` sobre la tarea `turning_on_radio`, con resumen agregado (`summary.json`) y desglose por episodio.
- Trazabilidad de revisiones: la model card exige fijar la revision registrada y verificar `SHA256SUMS`, lo que habilita la comprobacion de integridad del paquete.
- Evidencia multimodal de la ejecucion: logs y videos asociados a los episodios evaluados.
- Comparacion entre checkpoints: el esquema de nombres y tiers (`pi05_turning_on_radio`) permite agrupar evaluaciones de la misma tarea en distintas fechas o revisiones.
- No ofrece inferencia: el repositorio no incluye pesos, tokenizador, configuracion de runtime ni pipeline declarado.
- No se documentan capacidades de generacion de texto, codigo, matematicas, tool calling, agentes, vision general, audio ni modo de razonamiento del modelo subyacente.

## Casos de uso

- Reproduccion de una evaluacion concreta: descargar el paquete, fijar la revision indicada por el autor y comprobar `SHA256SUMS` permite reconstruir el conjunto de resultados publicado para `turning_on_radio` sin depender de un directorio vivo.
- Deteccion de regresiones entre checkpoints: al existir paquetes hermanos con el mismo esquema de nombres, se pueden comparar `summary.json` de distintas fechas o revisiones para identificar caidas de rendimiento tras cambios en el entrenamiento o en el entorno.
- Analisis de modos de fallo: los JSON por episodio y los videos permiten localizar episodios fallidos y revisar el comportamiento de la politica en cada uno, util para diagnostico cualitativo.
- Material suplementario de publicacion o informe tecnico: el paquete sirve como evidencia citable de una evaluacion, con logs y videos que respaldan las cifras agregadas.
- Auditoria interna de un banco de evaluaciones: al estar versionado y con sumas de verificacion, encaja en flujos de compliance donde se exige demostrar que un resultado corresponde exactamente a una revision.
- Integracion en pipelines de CI para investigacion en robotica: automatizar la descarga y el parseo de `summary.json` para publicar metricas en un panel de seguimiento de la flota de checkpoints.
- Formacion de evaluadores: usar la estructura de `meta.json`, `summary.json` y JSON por episodio como plantilla de referencia para estandarizar futuras evaluaciones de politicas.
- Archivo a largo plazo: conservar instantaneas inmutables de evaluaciones evita perder resultados cuando los directorios de trabajo originales se reorganizan o se eliminan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paquete contiene un fichero `summary.json` y JSON por episodio que, segun la model card, recogen los resultados de la evaluacion, pero su contenido numerico no forma parte de la informacion proporcionada, por lo que no se reproducen cifras de exito, tasas de finalizacion ni metricas por episodio. Tampoco hay datos de MMLU, HumanEval, GSM8K ni de benchmarks de manipulacion comparables.

## Requisitos de hardware

- Consumo del paquete: el repositorio declara 0,0 GB de tamano, por lo que su descarga y parseo no requieren GPU ni VRAM dedicada; basta CPU y almacenamiento para los ficheros JSON y los videos.
- Reproduccion de la evaluacion: no disponible. La informacion proporcionada no especifica requisitos de GPU, simulador ni entorno de ejecucion para reevaluar el checkpoint `pi05_b1k`.
- Inferencia del modelo subyacente: no disponible. Al no publicarse pesos ni configuracion, no se puede estimar VRAM, GPU recomendada ni si cabe en tarjetas de consumo.
- Despliegue con vLLM, llama.cpp, Ollama o TGI: no aplica, ya que no hay pesos ni formato de pesos publicado en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion disponible no permite comparar con modelos comparables, porque este repositorio no es un modelo. La comparacion mas util es con otros paquetes de evaluacion del mismo autor detectados en la busqueda web.

| Repositorio | Tipo aparente | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| `davidwdw/fa-eval-centre-pi05-turning-on-radio-20260826-837d012077d0` | Archivo de evaluacion (`pi05_b1k`, tarea `turning_on_radio`) | no disponible | no disponible | no disponible | no disponible |
| `davidwdw/fa-pi05-tail-eval2000-5bd78c6bb45e-de624f99f5dc` | Archivo de evaluacion (`pi05`, aparente evaluacion "tail" de 2000 elementos) | no disponible | no disponible | no disponible | no disponible |
| `davidwdw/fa-code-task00-centre-pilot-v3-4126e10d4a91` | Archivo de evaluacion (tarea de codigo, piloto v3) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo utilizable: no contiene pesos, tokenizador ni configuracion de inferencia, por lo que no se puede desplegar ni invocar directamente.
- Licencia no declarada: al no indicarse licencia, no puede asumirse permiso de uso comercial, redistribucion ni derivacion del contenido.
- Cero validacion comunitaria: 0 descargas y 0 likes implican que no hay evidencia externa de que el paquete este completo o sea correcto.
- Tamano declarado de 0,0 GB: conviene comprobar que los ficheros declarados (`summary.json`, JSON por episodio, logs, videos) estan efectivamente presentes y no son solo punteros, antes de asumir que la evaluacion es auditable.
- Snapshot, no espejo en vivo: la model card avisa de que no es un directorio vivo, de modo que cualquier resultado posterior a la revision registrada no estara reflejado.
- Ambito muy estrecho: los resultados corresponden a una unica tarea (`turning_on_radio`) sobre un unico checkpoint, por lo que no son extrapolables a otras tareas, entornos o politicas.
- Dependencia de verificacion manual: la validez del paquete descansa en comprobar `SHA256SUMS` y usar la revision exacta; omitir ese paso invalida la trazabilidad.
- Falta de contexto del entorno: sin informacion sobre el simulador, la version del entorno ni la configuracion de evaluacion, la comparabilidad con otras ejecuciones queda sin garantizar.
- Fechas de creacion y actualizacion (2026-10-01) y de la receta canonica (2026-08-26) corresponden tal cual a los metadatos publicados; no se han podido contrastar con fuentes independientes.
- Ausencia de ficha tecnica del modelo evaluado: cualquier afirmacion sobre sesgos, alucinacion, cobertura idiomatica o limitaciones de contexto del checkpoint `pi05_b1k` queda fuera del alcance de la informacion disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/davidwdw/fa-eval-centre-pi05-turning-on-radio-20260826-837d012077d0
- Repositorio hermano del mismo autor, evaluacion `pi05` tail: https://huggingface.co/davidwdw/fa-pi05-tail-eval2000-5bd78c6bb45e-de624f99f5dc
- Repositorio hermano del mismo autor, piloto de tarea de codigo: https://huggingface.co/davidwdw/fa-code-task00-centre-pilot-v3-4126e10d4a91
- OpenPi Comet, marco de preentrenamiento y evaluacion de modelos pi0.5 sobre BEHAVIOR-1K (contexto del ecosistema openpi-b1k): https://github.com/mli0603/openpi-comet
- La busqueda web devolvio ademas resultados no relacionados con este repositorio (la pagina principal de Facebook y una guia de despliegue autoalojado de Odysseus AI), que no se incluyen por no aportar informacion sobre el modelo ni sobre el paquete evaluado.
