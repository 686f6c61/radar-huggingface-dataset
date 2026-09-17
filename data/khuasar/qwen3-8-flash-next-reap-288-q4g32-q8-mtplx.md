# khuasar/Qwen3.8-Flash-Next-REAP-288-Q4g32-Q8-MTPLX

## Resumen

Qwen3.8-Flash-Next-REAP-288-Q4g32-Q8-MTPLX es una reconstruccion local del modelo Qwen3.8-Flash-Next, publicada por el usuario khuasar, orientada a ejecutar un mixture-of-experts de gran tamano en un unico MacBook Pro con Apple M5 Pro y 64 GB de memoria unificada. No se trata de un modelo entrenado desde cero ni de un fine-tuning: el autor ha convertido directamente los pesos BF16 originales aplicando tres tecnicas combinadas de compresion.

La primera es REAP-288, una seleccion de expertos que conserva 288 de los 512 expertos enrutados de cada una de las 48 capas principales del modelo, eliminando el 43,75% del banco de expertos enrutados (10.752 pares capa/experto). La segunda es una receta de cuantizacion mixta: los pesos de los expertos enrutados se almacenan en 4 bits con grupos de 32 (Q4g32), mientras que determinadas matrices sensibles se mantienen en 8 bits con grupos de 64. La tercera es una tabla de embeddings n-gram respaldada por SSD, que evita mantener residente en la GPU un payload de 29,802 GiB.

El resultado relevante tecnicamente es que el modelo conserva la prediccion multi-token (MTP) nativa y esta pensado para el runtime MTPLX sobre MLX, con una asignacion activa de 45,980 GiB tras cargar el modelo de texto y picos de hasta 53,450 GiB en diagnosticos sinteticos. El caveat principal es que la publicacion esta en estado de descripcion: los pesos no se han subido al repositorio, la evaluacion sigue en curso y el autor no reclama compatibilidad con una release sin modificar de MTPLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) transformer con prediccion multi-token (MTP) nativa; 48 capas principales con 512 expertos enrutados por capa antes del pruning |
| Parametros totales | no disponible |
| Parametros activos | no disponible en cifras; enrutamiento top-10 expertos enrutados por token mas experto compartido retenido |
| Longitud de contexto | no disponible (se ha validado un prefill sintetico de 65.536 tokens) |
| Tipos de cuantizacion | Q4 con grupos de 32 (Q4g32) en expertos enrutados; Q8 con grupos de 64 en matrices sensibles; pesos de origen BF16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (declarada como `other`, `license_name: qwen-community-1.0`) |
| Formato de pesos | MLX (libreria `mlx`); los pesos no han sido subidos al repositorio |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del checkpoint Qwen/Qwen3.8-Flash-Next: un transformer con mezcla de expertos distribuida en 48 capas principales, 512 expertos enrutados por capa y un experto compartido, mas una cabeza de prediccion multi-token nativa y un conjunto de pesos de vision. Sobre esa base, este artefacto aplica el pruning REAP-288 publicado por sh0wie: en cada capa se conservan los 288 expertos con mayor puntuacion de saliencia y se eliminan los 224 restantes junto con sus filas de router, preservando el orden de los expertos seleccionados de forma consistente entre el router y todas las proyecciones. La puntuacion empleada es una contribucion acumulada dividida por el numero de selecciones, es decir, la media del producto entre el peso del router y la magnitud de la salida del experto sobre los tokens en los que ese experto fue seleccionado.

No ha habido entrenamiento ni fine-tuning: la conversion parte de los pesos BF16 originales, no de una conversion Q4 previa expandida a mayor precision. La receta de cuantizacion es mixta e inspirada en MTPLX Optimized Speed. La tabla de embeddings n-gram se mantiene en SSD y se accede a ella bajo demanda, lo que explica que el payload en disco (aproximadamente 76,61 GiB) sea muy superior a la memoria residente. La calibracion de la seleccion de expertos proviene de un corpus privado de aproximadamente 686.000 tokens de trafico de codificacion agentica, reutilizado y auditado por el autor de esta reconstruccion, con un manifiesto de expertos retenidos fijado por SHA256 (`50dbb9cacc445724c64c9429940bc1b6d0ace48fac3a92734376740128b13dd6`). El modelo incluye la etiqueta `arxiv:2510.13999`, correspondiente al trabajo de REAP.

## Capacidades

- Generacion de texto autoregresiva con `pipeline_tag: text-generation`.
- Razonamiento multi-paso y flujos agenticos, dado que la seleccion de expertos se calibro sobre trafico de codificacion agentica.
- Generacion de codigo, con especial enfasis declarado en escenarios de agentic coding.
- Prediccion multi-token (MTP) nativa, conservada en esta reconstruccion y explotada por el runtime MTPLX.
- Acceso a una tabla de embeddings n-gram de gran tamano respaldada por SSD, en lugar de residente en GPU.
- Pesos de vision preservados en el artefacto (0,836 GiB), aunque el autor indica que la evaluacion realizada ha sido exclusivamente de texto y que el comportamiento multimodal no esta validado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de codificacion en local sobre Apple Silicon: el modelo esta disenado y probado en un MacBook Pro M5 Pro con 64 GB, con una asignacion MLX activa de 45,980 GiB, lo que permite mantener un asistente de codigo sin depender de APIs externas ni de GPUs dedicadas.
- Pipelines agenticos de edicion de codigo: la seleccion REAP-288 se calibro sobre aproximadamente 686.000 tokens de trafico de codificacion agentica, por lo que el perfil de expertos retenidos encaja con tareas de recorrido de repositorio, parcheo y verificacion en varios pasos.
- Prefill de contextos largos en una sola maquina: el artefacto ha sido validado con un prefill sintetico de 65.536 tokens con un pico de 49,399 GiB de asignacion MLX, adecuado para analisis de ficheros o documentos extensos en memoria unificada.
- Experimentacion en investigacion sobre pruning de MoE: sirve como artefacto de referencia para medir el efecto de retener 288 de 512 expertos por capa (43,75% del banco eliminado) manteniendo el enrutamiento top-10.
- Evaluacion de decodificacion especulativa local: la cabeza MTP nativa (payload de 1,583 GiB) permite experimentar con prediccion multi-token en el runtime MTPLX como tecnica de aceleracion de la decodificacion.
- Recuperacion aumentada sobre corpus propios: la tabla de embeddings n-gram de 29,802 GiB en SSD puede emplearse para asociaciones lexicas de gran cardinalidad sin consumir memoria unificada residente.
- Despliegue de referencia para comparativas de cuantizacion: la mezcla Q4g32 en expertos y Q8/group64 en matrices sensibles permite medir el compromiso entre precision y huella de memoria frente a recetas homogeneas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion esta en curso y unicamente reporta mediciones de memoria y almacenamiento del artefacto local:

| Metrica | Valor |
|---|---|
| Payload de pesos del modelo principal | 44,390 GiB |
| Payload de la cabeza MTP nativa | 1,583 GiB |
| Payload de pesos de vision | 0,836 GiB |
| Payload de la tabla n-gram en SSD | 29,802 GiB |
| Payload combinado en disco | Aproximadamente 76,61 GiB |
| Asignacion MLX activa tras cargar el modelo de texto | 45,980 GiB |
| Pico de asignacion MLX en prefill sintetico de 65.536 tokens | 49,399 GiB |
| Pico de asignacion MLX en la suite inicial de tareas MTP | 49,982 GiB |
| Pico en diagnosticos sinteticos de copia de cache | 53,450 GiB |

No hay datos de MMLU, HumanEval, GSM8K ni de latencia o throughput en la informacion proporcionada.

## Requisitos de hardware

- Memoria unificada: el artefacto fue disenado y probado en un MacBook Pro con Apple M5 Pro y 64 GB de memoria unificada.
- VRAM / asignacion activa estimada: 45,980 GiB de asignacion MLX tras cargar el modelo de texto; picos medidos de 49,399 GiB (prefill de 65.536 tokens), 49,982 GiB (suite MTP) y 53,450 GiB (diagnosticos de copia de cache).
- Almacenamiento: aproximadamente 76,61 GiB en disco, de los cuales 29,802 GiB corresponden a la tabla n-gram en SSD.
- GPU recomendadas: no disponible; la unica plataforma validada es Apple Silicon (serie M) mediante MLX. No hay datos para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no hay datos para GPU de consumo discretas. En Apple Silicon cabe en una maquina de 64 GB de memoria unificada, con margen limitado (el autor advierte que el swap ya estaba asignado y crecio durante la carga, por lo que no hay garantia de zero-swap).
- Opciones de despliegue: runtime MTPLX sobre MLX. El autor advierte que la implementacion emplea un checkout experimental de MTPLX con cambios locales y que la pagina no reclama compatibilidad con una release sin modificar. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| khuasar/Qwen3.8-Flash-Next-REAP-288-Q4g32-Q8-MTPLX | no disponible (288 de 512 expertos enrutados en 48 capas) | no disponible | sin benchmarks publicados | qwen-community-1.0 | pesos no subidos al repositorio |
| sh0wie/Qwen3.8-Flash-Next-REAP-288-MLX-4bit | no disponible (misma seleccion REAP-288) | no disponible | no disponible | no disponible | pesos publicados; es la fuente de la seleccion de expertos reutilizada |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible (512 expertos enrutados por capa) | no disponible | no disponible | qwen-community-1.0 | checkpoint original en BF16 |

La comparativa con alternativas de otros fabricantes no esta disponible en la informacion proporcionada. La diferencia principal entre las tres entradas de la tabla es la huella de memoria: la version base conserva el banco completo de expertos, la version de sh0wie aplica REAP-288 con cuantizacion 4 bits homogenea, y esta reconstruccion anade la mezcla Q4g32 + Q8/group64, la tabla n-gram en SSD y un objetivo de runtime MTPLX.

## Limitaciones y advertencias

- Los pesos no han sido subidos al repositorio. La model card lo declara como estado de release: descripcion publicada, artefacto local validado en carga, generacion y comprobaciones de contexto/cache, evaluacion en curso. El repositorio registra 0 descargas y 0 likes.
- La seleccion REAP-288 se calibro con aproximadamente 686.000 tokens de trafico de codificacion agentica. El propio autor advierte que es un punto de partida orientado a codigo y no un optimo demostrado para escritura, analisis o conversacion general.
- No existe un mapa verificado que asigne identificadores de experto a dominios concretos; los IDs son locales a cada capa.
- Los expertos eliminados no se pueden recuperar: solo la tabla n-gram esta respaldada en SSD, no los expertos podados. Subir la precision no restaura los expertos ausentes.
- La implementacion depende de un checkout experimental de MTPLX con cambios locales; no se reclama compatibilidad con una release sin modificar de la aplicacion.
- Los pesos de vision estan presentes pero no han sido validados: la evaluacion ha sido exclusivamente de texto.
- Las mediciones de memoria no constituyen una garantia de zero-swap: el swap ya estaba asignado y aumento durante la carga, y el contexto, el prefill, otras aplicaciones y la configuracion del runtime afectan al margen disponible.
- Riesgo de alucinacion, sesgos conocidos y comportamiento en idiomas distintos del ingles: no disponibles en la informacion proporcionada.
- La licencia es `qwen-community-1.0`, declarada como `other`. Las condiciones exactas de uso comercial no estan detalladas en la informacion proporcionada y deben consultarse en el enlace de licencia del modelo base.
- La model card disponible esta truncada, por lo que podrian existir secciones adicionales de limitaciones no recogidas aqui.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/khuasar/Qwen3.8-Flash-Next-REAP-288-Q4g32-Q8-MTPLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Fuente de la seleccion REAP-288: https://huggingface.co/sh0wie/Qwen3.8-Flash-Next-REAP-288-MLX-4bit
- Manifiesto de expertos retenidos: https://huggingface.co/sh0wie/Qwen3.8-Flash-Next-REAP-288-MLX-4bit/blob/668f31bcc56bf9400e64c9463445eee47597c2d9/reap_kept_experts.json
- Paper de REAP (etiqueta `arxiv:2510.13999`): https://arxiv.org/abs/2510.13999
