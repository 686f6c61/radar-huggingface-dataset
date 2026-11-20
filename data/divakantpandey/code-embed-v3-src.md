# divakantpandey/code-embed-v3-src

## Resumen

`divakantpandey/code-embed-v3-src` no es un modelo, sino un repositorio de artefactos de investigacion: resultados, configuraciones, logs y snapshots de codigo asociados al preprint *Does Execution-Verified Near-Miss Training Teach Code Embeddings to Prefer Working Code? A Negative Result*. Lo publica el investigador independiente divakantpandey junto a los modelos derivados del estudio, `code-embed-v3-150m-ft-behaviour` (piloto) y `code-embed-v3-150m-ft-control` (control de replay). El repositorio existe para que cualquier numero del paper pueda recalcularse a partir de los ficheros publicados.

El trabajo aborda una pregunta concreta en el ambito de los embeddings de codigo: si el entrenamiento con ejemplos casi-fallidos verificados por ejecucion (near-miss) ensena al modelo a preferir codigo que funciona frente a codigo que no compila o falla tests. El resultado es negativo, y el repositorio documenta ese resultado con evaluaciones de comportamiento, MTEB(Code, v1), comparaciones entre semillas, tests pareados (McNemar, intervalos de confianza por bootstrap) y una linea base UniXcoder-base.

El interes para desarrolladores e investigadores es metodologico: se trata de un paquete de reproducibilidad completo (R0-R16 en el log de investigacion) con advertencias explicitas sobre que ejecuciones no son evidencia valida, en concreto las anteriores al arreglo de pesos maestros en float16 (log R6, 2026-10-30). No aporta pesos desplegables ni pipeline de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de resultados; los modelos asociados son de 150M parametros, arquitectura no especificada) |
| Parametros totales | no disponible para este repositorio; los modelos asociados declaran 150M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CC BY 4.0 para resultados y logs; Apache-2.0 para los snapshots de codigo |
| Formato de pesos | no aplica; el repositorio contiene JSON, configuraciones, logs y archivos `.tar.gz` de codigo |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenable ni pesos. Contiene la evidencia experimental de un estudio sobre embeddings de codigo: evaluaciones de comportamiento por consulta en `results/behaviour/*.json`, puntuaciones MTEB por tarea en `results/mteb-*/`, comparaciones entre tres semillas a pequena escala (tabla 1 del paper), un puente de tamano de batch (tabla 2), rondas de ablacion previas identificadas por marcas de tiempo UTC, intentos de dry-run end-to-end, una linea base UniXcoder-base y una reevaluacion zero-shot del modelo anterior `code-embed-v2`.

El diseno experimental incluye tres brazos: el piloto con entrenamiento near-miss verificado por ejecucion, un control de solo replay y la base sin ajuste. Se anaden promedios de pesos piloto/base en proporciones 0,4, 0,5 y 0,7, con tests pareados (McNemar y bootstrap) para comparar. El log de investigacion R0-R16 documenta cada ejecucion y explica que las corridas anteriores al 2026-10-30 (fix de pesos maestros en float16) no son evidencia valida sobre datos o receta. Las evaluaciones se ejecutaron en GPU A40 segun la estructura del directorio `pilot/pilot-1/`.

## Capacidades

- No es un modelo desplegable: no genera texto, no calcula embeddings en inferencia y no expone pipeline.
- Proporciona resultados de evaluacion reproducibles de embeddings de codigo (MTEB Code v1 y evaluacion de comportamiento).
- Incluye tests estadisticos pareados (McNemar, intervalos de confianza por bootstrap) para comparar variantes.
- Documenta un resultado negativo sobre entrenamiento near-miss verificado por ejecucion.
- Incluye snapshots de codigo que se ejecutaron en las maquinas con GPU, para reproducir las corridas.
- Sirve como referencia metodologica para disenar experimentos de embeddings de codigo con controles y ablaciones.

## Casos de uso

- Reproduccion de un paper: recalcular cada numero del preprint a partir de los JSON y logs publicados, verificando tablas y tests estadisticos sin acceso a las GPUs originales.
- Auditoria metodologica: revisar el diseno de tres brazos (piloto, control de replay, base) y los tests pareados para evaluar la solidez de un resultado negativo antes de citarlo.
- Diseno de experimentos propios: reutilizar la estructura de ablaciones (semillas, tamano de batch, promedios de pesos) y el log R0-R16 como plantilla de trazabilidad para estudios de embeddings de codigo.
- Formacion y docencia: usar el caso como ejemplo real de resultado negativo publicado con artefactos completos, util en cursos de metodologia de machine learning.
- Seleccion de linea base: tomar UniXcoder-base y las puntuaciones MTEB(Code, v1) como referencia al evaluar nuevos modelos de embeddings de codigo.
- Revision de literatura: contrastar afirmaciones sobre near-miss training con la evidencia empirica disponible antes de invertir en esa receta de entrenamiento.

## Benchmarks y rendimiento

El repositorio contiene puntuaciones MTEB(Code, v1) y evaluaciones de comportamiento, pero la informacion proporcionada no incluye los valores numericos. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Este repositorio no requiere GPU: son ficheros de datos y logs (tamano del repo: 0,0 GB segun Hugging Face, aunque incluye archivos `.tar.gz`).
- Las evaluaciones originales se ejecutaron en GPU NVIDIA A40, segun la ruta `pilot/pilot-1/` de la model card.
- Los modelos asociados de 150M parametros caben con holgura en GPU de consumo, pero no se detallan requisitos de VRAM en la informacion disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica a este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Tipo | Contenido | Licencia |
|---|---|---|---|
| `divakantpandey/code-embed-v3-src` | Artefactos de investigacion | Resultados, logs, ablaciones, tests pareados | CC BY 4.0 (resultados) / Apache-2.0 (codigo) |
| `divakantpandey/code-embed-v3-150m-ft-behaviour` | Modelo (piloto) | Pesos del piloto near-miss, 150M | no disponible |
| `divakantpandey/code-embed-v3-150m-ft-control` | Modelo (control) | Pesos del control de solo replay, 150M | no disponible |
| UniXcoder-base | Modelo (linea base) | Pesos de referencia incluidos como baseline | no disponible |

No se dispone de datos de rendimiento comparativo entre estos elementos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo: no puede usarse para inferencia, generacion ni busqueda semantica directa.
- El resultado central es negativo: el entrenamiento near-miss verificado por ejecucion no demostro la mejora esperada; no debe citarse como tecnica validada.
- Las ejecuciones anteriores al fix de pesos maestros en float16 (log R6, 2026-10-30) no son evidencia valida sobre datos o receta; cualquier reutilizacion debe filtrar esas corridas.
- El preprint esta en Zenodo y el DOI se anadira en publicacion; la informacion disponible no confirma revision por pares.
- Sin descargas ni likes en Hugging Face: no hay validacion externa de la comunidad.
- Idiomas y contexto no disponibles; al tratarse de embeddings de codigo, la cobertura linguistica natural es limitada por diseno.
- La licencia CC BY 4.0 permite uso comercial de resultados y logs con atribucion; los snapshots de codigo quedan bajo Apache-2.0 y deben respetar esa licencia por separado.
- El estudio se limita a modelos de 150M parametros y a un unico autor; la generalizacion a modelos mayores no esta establecida.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/divakantpandey/code-embed-v3-src
- Modelo piloto: https://huggingface.co/divakantpandey/code-embed-v3-150m-ft-behaviour
- Modelo control: https://huggingface.co/divakantpandey/code-embed-v3-150m-ft-control
- Codigo y log de investigacion (R0-R16): https://github.com/divakantpandey/code-embed-v3
- Preprint en Zenodo: DOI pendiente de publicacion segun la model card (no disponible)
