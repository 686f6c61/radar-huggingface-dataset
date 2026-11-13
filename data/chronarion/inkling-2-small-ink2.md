# chronarion/Inkling-2-Small-ink2

## Resumen

Inkling-2-Small-ink2 no es un modelo de pesos nuevos, sino un repositorio de artefactos de despliegue para Inkling 2 Small, el modelo de arquitectura mixture-of-experts (MoE) desarrollado por Thinking Machines. Lo publica chronarion como parte de ink2, un servidor de inferencia diseñado para ejecutar el checkpoint oficial NVFP4 de Inkling 2 Small en una única DGX Station GB300. El repositorio contiene únicamente las colocaciones de expertos y los recuentos de enrutamiento generados a partir de 267.000 tokens de un corpus general, y no incluye pesos del modelo.

El problema que resuelve es de capacidad de memoria: el checkpoint publicado ocupa aproximadamente 390 GB, mientras que la GB300 dispone de 252 GB de memoria. ink2 mantiene en la GPU los expertos más utilizados (167 GiB en la colocación por defecto) y deja el resto en la memoria de la CPU Grace, desde donde la GPU los lee en su sitio. Durante el servicio, el conjunto residente en GPU se reajusta siguiendo el texto que se está generando.

Es relevante ahora porque demuestra una vía práctica para servir un MoE de gran tamaño en hardware de estación de trabajo con memoria unificada, sin modificar el checkpoint oficial. Sobre el benchmark lil-bench standard/1 reporta unos 120 tokens por segundo con una petición, entre 365 y 390 con 8 peticiones y unos 490 con 16, con lectura de prompts de aproximadamente 6.700 tokens por segundo. El autor advierte que es una versión inicial y probablemente con errores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE); el repositorio contiene colocaciones de expertos, no pesos |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (checkpoint oficial, sin modificar) |
| Idiomas soportados | no disponible |
| Licencia | MIT (repositorio); modelo base Apache 2.0 segun creditos de la model card |
| Formato de pesos | no contiene pesos; artefactos JSON de colocacion y recuentos de enrutamiento |

## Arquitectura y entrenamiento

El modelo subyacente, Inkling 2 Small de Thinking Machines, emplea una arquitectura transformer con capas MoE. Segun los artefactos publicados, cada capa MoE contiene 384 expertos, y el checkpoint oficial se distribuye en formato NVFP4 con un tamano aproximado de 390 GB. El repositorio no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; tampoco documenta innovaciones de atencion o decodificacion del modelo base.

La contribucion tecnica de este repositorio es el sistema de colocacion y cacheo de expertos de ink2. A partir de los recuentos de enrutamiento de 267.000 tokens generados sobre un corpus general, se ordenan los 384 expertos de cada capa por frecuencia de uso y se decide cuantos permanecen en memoria de GPU (167 GiB en la colocacion por defecto, `gen-count167-s64.json`). Existe una colocacion menor, `gen-count159-s64.json`, pensada para ejecutar junto al modelo borrador DSpark. El enfoque se apoya en Fiddler (arXiv:2402.07033), MoE-Infinity (arXiv:2401.14361) y Eliseev & Mazur (arXiv:2312.17238).

## Capacidades

- Generacion de texto mediante el checkpoint oficial de Inkling 2 Small; las capacidades concretas del modelo base no se detallan en la informacion disponible.
- Servicio de inferencia con vLLM, cuyo soporte para Inkling 2 se cita como dependencia.
- Gestion dinamica de expertos en memoria: el conjunto residente en GPU se reajusta durante la generacion segun el texto que se esta escribiendo.
- Ejecucion en una unica DGX Station GB300 con memoria unificada GPU-CPU (252 GB).
- Compatibilidad con el modelo borrador DSpark para decodificacion especulativa mediante una colocacion de expertos reducida.
- Soporte de tool calling, agentes, vision, audio o modo de razonamiento: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de un MoE de gran tamano en hardware de estacion de trabajo: ink2 permite ejecutar el checkpoint NVFP4 de 390 GB en una GB300 de 252 GB manteniendo en GPU los expertos mas usados y leyendo el resto desde la CPU Grace, lo que evita recurrir a un cluster multi-GPU.
- Evaluacion y prototipado de Inkling 2 Small en local: investigadores que necesiten probar el modelo oficial sin infraestructura de centro de datos pueden desplegarlo con estas colocaciones y medir comportamiento real sobre su propio trafico.
- Generacion de texto interactiva con una sola peticion: el benchmark reporta unos 120 tokens por segundo, suficiente para chat o asistencia en tiempo real con latencia aceptable.
- Servicio por lotes de baja concurrencia: con 8 peticiones simultaneas el rendimiento agregado se situa entre 365 y 390 tokens por segundo, adecuado para pipelines de generacion no interactivos.
- Procesamiento de prompts largos: la lectura de prompts a unos 6.700 tokens por segundo permite ingerir documentos extensos antes de generar, util en resumen y extraccion de informacion.
- Decodificacion especulativa con DSpark: la colocacion reducida `gen-count159-s64.json` permite combinar el modelo con un borrador para acelerar la generacion en escenarios donde la memoria de GPU es el factor limitante.
- Reproduccion de investigacion sobre cacheo de expertos: los recuentos de enrutamiento publicados permiten validar y comparar estrategias de colocacion tipo Fiddler o MoE-Infinity sobre trafico real.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre lil-bench standard/1 en una DGX Station GB300:

| Metrica | Valor |
|---|---|
| Generacion, 1 peticion | ~120 tokens/s |
| Generacion, 8 peticiones | ~365-390 tokens/s |
| Generacion, 16 peticiones | ~490 tokens/s |
| Lectura de prompts | ~6.700 tokens/s |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Memoria: el checkpoint oficial ocupa aproximadamente 390 GB; la GPU de la GB300 dispone de 252 GB, por lo que se requiere memoria unificada con la CPU Grace para alojar el resto de expertos.
- Hardware de referencia: una unica NVIDIA DGX Station GB300.
- Colocacion por defecto: 167 GiB de expertos en memoria de GPU (`gen-count167-s64.json`).
- Colocacion reducida para decodificacion especulativa con DSpark: `gen-count159-s64.json`.
- GPU de consumo: no disponible; el diseno asume memoria unificada GPU-CPU de clase estacion de trabajo, no una RTX convencional.
- Despliegue: servidor ink2 sobre vLLM con soporte de Inkling 2; no se documentan opciones con llama.cpp, Ollama ni TGI.
- Rendimiento: ~120 tokens/s con una peticion, ~365-390 con 8 y ~490 con 16; ~6.700 tokens/s de lectura de prompts.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling-2-Small-ink2 (artefactos de despliegue) | no disponible (384 expertos por capa MoE) | no disponible | MIT (repo); base Apache 2.0 | Hugging Face y GitHub |
| thinkingmachines/Inkling-2-Small (modelo base) | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos alternativos en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es un conjunto de artefactos de colocacion y recuentos; requiere descargar por separado el checkpoint oficial de Inkling 2 Small.
- Version inicial declarada por el autor como probablemente con errores; se solicita reportar problemas en GitHub.
- Las colocaciones se calcularon sobre 267.000 tokens de un corpus general; un trafico con distribucion de expertos distinta puede degradar el acierto de la cache y el rendimiento.
- El rendimiento reportado corresponde a lil-bench standard/1 en una DGX Station GB300; no es extrapolable a otro hardware.
- Dependencia de una unica plataforma (GB300 con memoria unificada) y del soporte de Inkling 2 en vLLM.
- Licencia del repositorio MIT, pero el modelo base se cita como Apache 2.0; conviene verificar las condiciones del checkpoint oficial para uso comercial.
- No hay informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni limitaciones de contexto del modelo base.
- No se documentan garantias de produccion, monitorizacion ni soporte.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/chronarion/Inkling-2-Small-ink2
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Servidor ink2: https://github.com/chronarion/ink2
- Fiddler: https://arxiv.org/abs/2402.07033
- MoE-Infinity: https://arxiv.org/abs/2401.14361
- Eliseev & Mazur: https://arxiv.org/abs/2312.17238
