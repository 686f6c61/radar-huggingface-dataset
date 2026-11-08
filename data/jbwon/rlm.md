# jbwon/rlm

## Resumen

`jbwon/rlm` es un repositorio de Hugging Face publicado por el usuario `jbwon` que, por el contenido de su model card, no contiene un modelo de lenguaje entrenado al uso, sino un artefacto asociado a un proyecto de investigación sobre análisis de *refusal* (rechazo) en modelos de razonamiento. La model card describe un marco experimental para comparar tres técnicas (separabilidad de Fisher, *probes* sobre *hidden states* y clasificadores TF-IDF a nivel de token) sobre posiciones concretas de la secuencia de generación, usando `Qwen3-8B` como modelo base y datos derivados de `think_token`.

El repositorio ocupa 1,2 GB y no declara licencia, idiomas ni pipeline. La documentación está redactada en coreano y se centra en la reproducibilidad de experimentos: scripts de *baseline* (STAR-1, ThinkSafe, RAPO, RECAP, STAIR), extracción de representaciones, evaluación con validación cruzada de 5 folds y generación de informes. No se documentan parámetros, arquitectura propia ni resultados de rendimiento del modelo en sí.

Por tanto, esta ficha describe un artefacto de investigación reproducible más que un modelo desplegable. Su relevancia actual reside en el estudio de la deliberación y la seguridad en modelos de razonamiento (interpretabilidad de la negativa a responder), un área activa dentro de la IA open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no define una arquitectura propia; el modelo base referenciado es `Qwen3-8B`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la documentacion esta en coreano) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene scripts, configuracion y artefactos de analisis; 1,2 GB) |

## Arquitectura y entrenamiento

El repositorio no documenta el entrenamiento de un modelo propio. Lo que describe es una infraestructura experimental para analizar el comportamiento de rechazo en modelos de razonamiento. El modelo base por defecto es `Qwen3-8B`, con soporte declarado tambien para `Olmo-3-7B-Think`, `Phi-4-Reasoning` y `GPT-OSS-20B`. Los datos de partida se denominan `think_token` y el punto de entrada de resultados es `../rlm_result/REPORTS.md`.

El marco define cuatro ubicaciones de analisis sobre la secuencia: `t_post` (`prompt_end`, ultimo token de la entrada tras aplicar la plantilla de chat), `<think>` (`reasoning_start`, ultimo token del marcador de inicio de razonamiento), normalizacion del prompt (`prefill`, 20 posiciones muestreadas con `floor(linspace(start, end, N))`) y traza de razonamiento (`thinking`, 100 posiciones normalizadas). En total, 122 puntos de analisis por defecto, que no equivalen a 122 tokens distintos (hay solapamientos entre `prefill` y `t_post`, y entre marcadores y plantilla). Las representaciones se extraen de la ultima capa del transformer, tras la normalizacion final y antes de la cabeza LM. Para TF-IDF se usa unicamente el token decodificado en esa posicion, sin prefijo acumulado ni traza completa.

El repositorio incluye scripts de *baseline* de metodos de seguridad y deliberacion (STAR-1, ThinkSafe, RAPO, RECAP, STAIR) bajo `scripts/baseline/`, y utilidades de analisis bajo `scripts/analysis/` (probe de refusal, Fisher, TF-IDF, metricas, generacion de informes, analisis de longitud, *flip ratio* y *self-jailbreak*). La evaluacion se realiza con validacion cruzada de 5 folds, cohortes y folds comunes entre metodos, y *bootstrap* de 1000 remuestreos por defecto. El pipeline de generacion y etiquetado con cuatro *guards* usa vLLM.

## Capacidades

- No es un modelo generativo desplegable: el repositorio no expone pesos de un LLM propio ni un pipeline de inferencia estandar.
- Analisis de rechazo (*refusal*) mediante *probes* lineales sobre *hidden states* en 122 posiciones de la secuencia.
- Comparacion de tres enfoques de clasificacion: separabilidad de Fisher, *probe* sobre representaciones ocultas y TF-IDF a nivel de token.
- Evaluacion con validacion cruzada de 5 folds, cohortes y folds comunes, y estimacion por *bootstrap* (1000 iteraciones por defecto).
- Generacion y etiquetado con vLLM y cuatro *guards* para determinar el comportamiento de rechazo.
- Analisis de *continuation* y *flip* (K=32 generaciones en modo *thinking* y *no-thinking*) para medir inestabilidad de la negativa.
- Analisis de longitud: prediccion del numero medio de tokens del cuerpo de razonamiento a partir de la representacion del marcador (8 generaciones naturales).
- Clasificacion semantica de cadenas de pensamiento con Mixtral y generacion de PDF anotados (`self_jailbreak.sh`).
- Soporte de multiples modelos base: `Qwen3-8B`, `Olmo-3-7B-Think`, `Phi-4-Reasoning`, `GPT-OSS-20B`.

## Casos de uso

- Investigacion en interpretabilidad de la seguridad: usar `refusal_probe.sh` para entrenar *probes* por posicion y determinar en que punto de la secuencia se codifica la decision de rechazar, comparando prompt y traza de razonamiento.
- Auditoria de modelos de razonamiento en produccion: aplicar el marco de cuatro *guards* y el analisis de *flip ratio* con K=32 para cuantificar la consistencia de la negativa ante reformulaciones de una misma pregunta.
- Comparacion de metodos de alineacion: ejecutar los *baselines* STAR-1, ThinkSafe, RAPO, RECAP y STAIR con el mismo cohorte y folds para comparar su efecto sobre la separabilidad de Fisher y las metricas OOF del *probe*.
- Analisis de cadenas de pensamiento: usar `self_jailbreak.sh` para clasificar semanticamente cada frase de una CoT con Mixtral y revisar el resultado en PDF anotado por colores.
- Estudio de la relacion entre longitud de razonamiento y rechazo: `length_probe.sh` predice el numero medio de tokens del cuerpo a partir del marcador, util para detectar si la negativa correlaciona con trazas mas largas.
- Reproduccion de experimentos academicos: el diseno con `OUTPUT_ROOT`, `RUN_TAG`, `PROBE_TAG`, `SEED` y `SPLIT_SEED` permite replicar resultados y reanudar ejecuciones interrumpidas mediante *checkpoints* de TF-IDF.
- Integracion en pipelines de evaluacion de seguridad: los scripts `run.sh` y `report.sh` permiten regenerar tablas y graficos comparativos a partir de JSON almacenados sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `../rlm_result/REPORTS.md` como punto de partida de los resultados, pero ese contenido no forma parte de la informacion proporcionada ni se han incluido cifras en la busqueda web. El repositorio asociado `jbwon/rlm_results` no contiene model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el repositorio en si; depende del modelo base elegido. Como referencia, ejecutar `Qwen3-8B` en BF16 requiere aproximadamente 16 GB de VRAM solo para pesos, mas cache KV y overhead.
- GPU recomendadas: no especificadas. El pipeline de generacion y etiquetado usa vLLM, lo que en la practica exige GPU NVIDIA con soporte CUDA; una A100 o H100 es lo habitual para `Qwen3-8B` y modelos mayores como `GPT-OSS-20B`.
- Cabe en GPU de consumo: no confirmado. `Qwen3-8B` en cuantizacion de 8 bits o 4 bits podria caber en GPUs de 16-24 GB (RTX 4090, RTX 4080), pero el repositorio no documenta configuraciones ni cuantizaciones.
- Opciones de despliegue: vLLM para generacion y etiquetado (`requirements-vllm.txt`); Hugging Face Transformers para extraccion de representaciones (`requirements-models.txt`); scikit-learn para *probes* y TF-IDF (`requirements.txt`). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Variables de entorno relevantes: `PYTHON_BIN`, `VLLM_PYTHON_BIN`, `CUDA_VISIBLE_DEVICES`, `OUTPUT_ROOT`, `DATA_PATH`, `MODEL_PATH`, `THINKING_POSITIONS=100`, `BOOTSTRAP=1000`.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo de lenguaje comparable por parametros, contexto o rendimiento, sino un marco de analisis de rechazo. Sus alternativas naturales serian otros *frameworks* de interpretabilidad o evaluacion de seguridad, para los que no se proporciona informacion comparativa.

| Criterio | `jbwon/rlm` | Alternativas |
|---|---|---|
| Tipo de artefacto | Marco de analisis de refusal | no disponible |
| Parametros | no disponible | no disponible |
| Contexto | no disponible | no disponible |
| Licencia | no disponible | no disponible |

## Limitaciones y advertencias

- La model card esta redactada integramente en coreano; no hay documentacion en castellano ni en ingles.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido. Ante la ausencia de licencia explicita, debe asumirse ausencia de permisos claros.
- No se declaran idiomas soportados ni pipeline; el repositorio no es directamente consumible como modelo en Hugging Face.
- El analisis de la traza de razonamiento es retrospectivo (usa la longitud completa del cuerpo), por lo que no equivale a una deteccion en linea durante la generacion.
- Los 122 puntos de analisis no corresponden a 122 tokens distintos: hay solapamiento entre `prefill` y `t_post`, y entre marcadores y plantilla de chat, lo que puede inflar aparentemente la cobertura.
- En posiciones fijas como `t_post` o marcadores, el TF-IDF puede carecer practicamente de informacion predictiva, ya que solo usa el token decodificado en esa posicion.
- Los modelos guardados con scikit-learn deben leerse con la version usada durante el entrenamiento; cambios de version pueden romper la reproducibilidad.
- `run.sh` no inicia generacion, extraccion ni entrenamiento: falla si faltan modelos preparados, lo que exige ejecutar previamente los scripts de preparacion.
- No hay evidencia publica de validacion externa, benchmarks ni adopcion (0 descargas, 0 likes en el momento de la consulta).
- Riesgo de sobreinterpretacion: los resultados de *probes* lineales no demuestran causalidad sobre la decision de rechazo.

## Enlaces

- Repositorio principal: https://huggingface.co/jbwon/rlm
- Repositorio de resultados: https://huggingface.co/jbwon/rlm_results
