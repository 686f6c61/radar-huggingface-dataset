# amyjia1212/b1k-2026-eval-code

## Resumen

`amyjia1212/b1k-2026-eval-code` es un repositorio publicado en HuggingFace que no contiene pesos de un modelo de lenguaje, sino el codigo y la configuracion de evaluacion empleados con los checkpoints de robotica `amyjia1212/b1k-2026-*`, junto con las respuestas documentadas a tres preguntas tecnicas sobre dicha evaluacion. El material esta fechado a 2026-10-14 y su relevancia principal es metodologica: en el se documenta un error grave en la tabla de etapas por tarea (`task_stage_embeddings`) que invalido todos los resultados de evaluacion previos a esa fecha.

Los checkpoints evaluados corresponden a politicas de manipulacion sobre el benchmark BEHAVIOR-1K, ejecutadas mediante un servidor de politica construido sobre el repositorio `IliaLarchenko/behavior-1k-solution` (Apache-2.0) y su submodulo `openpi` (Physical Intelligence), con inferencia en JAX/XLA. La model card detalla el preprocesado visual (tres camaras RGB reescaladas de 720x720 y 480x480 a 280x280), la dimension de la tabla de etapas (1087 filas x 1024) y la configuracion exacta del servidor de inferencia y del arnes de evaluacion.

El repositorio tiene un tamano de 0.0 GB (solo contiene codigo, diffs y ficheros comprimidos, no pesos), 0 descargas y 0 likes en el momento de la consulta, y esta etiquetado con `behavior-1k`, `robotics` y licencia Apache-2.0. La informacion disponible no describe la arquitectura interna del checkpoint mas alla de los artefactos citados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los artefactos indican una politica vision-language-action con codificador visual SigLIP y servidor de inferencia JAX/XLA sobre `openpi`; no se especifica explicitamente en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible (horizonte de accion de 30 acciones por prediccion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las tareas son de manipulacion robotica; no se declaran idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible para este repositorio (contiene `.tar.gz` y `.diff`); los checkpoints se descargan aparte desde `amyjia1212/<model>` como directorios de `step_NNNNNN` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del checkpoint ni el proceso de entrenamiento. Los unicos datos estructurales verificables son de inferencia: el codificador visual usa embeddings posicionales de SigLIP con 400 parches (20x20), lo que explica la resolucion de entrada de 280x280; y existe una tabla `task_stage_embeddings` de 1087 filas x 1024 columnas, es decir, un embedding de 1024 dimensiones por cada combinacion de tarea y etapa. La politica se ejecuta con JAX/XLA, con variables de entorno `XLA_PYTHON_CLIENT_MEM_FRACTION` y `XLA_PYTHON_CLIENT_ALLOCATOR=platform`, sobre el submodulo `openpi` fijado en el commit `01177e0242a1c7e8fad2547caa0e987def614cda`.

El grueso de la informacion tecnica del repositorio se refiere al pipeline de evaluacion, no al entrenamiento. El simulador renderiza imagenes a resolucion oficial (camara de cabeza ZED a 720x720 RGB y camaras de muneca RealSense a 480x480 RGB, sin profundidad) y el servidor de politica las reduce con `resize_with_pad(img, 280, 280)` de `openpi_client.image_tools`, que aplica interpolacion bilineal de PIL. En el lado de control, la inferencia replanifica cada 10 pasos de entorno y ejecuta 13 de las 30 acciones predichas (el ajuste de velocidad 1.3x de 2025) con inpainting; existe ademas una recuperacion de pinza que fuerza la apertura durante 15 pasos tras 90 pasos bloqueados. No se documentan tokens de entrenamiento, composicion del dataset ni tecnicas de alineacion (RLHF/DPO).

El hallazgo metodologico central es que, hasta 2026-10-14, el codigo de evaluacion usaba recuentos de etapas por tarea reconstruidos a partir de la longitud media de las demos (`round(mean episode length / 900)`, recortado a 5-15). Esa tabla tambien sumaba 1087 filas, por lo que los checkpoints cargaban sin error, pero leia mal las etapas de todas las tareas a partir de la 4 (por ejemplo, la tarea 52 usaba las filas 601-611 con 11 etapas en lugar de las filas 616-625 con 10). El repositorio publica la tabla corregida en `src/b1k/models/pi_behavior_config.py` y anuncia que todas las evaluaciones afectadas se estan repitiendo con la etiqueta `-stagefix`.

## Capacidades

- Ejecucion de politicas de manipulacion robotica condicionadas por tarea y etapa, con una tabla de embeddings de 1087 entradas (tareas 0-99).
- Prediccion de secuencias de 30 acciones por inferencia, de las que se ejecutan 13 antes de replanificar cada 10 pasos de entorno.
- Procesamiento multimodal de tres camaras RGB simultaneas (cabeza, muneca izquierda, muneca derecha) a 280x280.
- Servicio de politica cliente-servidor sobre HTTP, con un servidor por GPU.
- Cambio de checkpoint en caliente: el servidor mantiene varios `step_NNNNNN` en memoria de host y conmuta mediante `GET /switch?ckpt=<name>`.
- Recuperacion de pinza configurable (forzar apertura 15 pasos tras 90 pasos bloqueados) para desatascar manipulaciones.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni audio.

## Casos de uso

- Reproduccion de resultados en BEHAVIOR-1K: el tarball `b1k-eval-code-20261014.tar.gz` incluye el codigo de politica completo con el submodulo `openpi` y los cambios locales, lo que permite replicar exactamente una evaluacion concreta en lugar de reconstruirla a partir de la documentacion.
- Evaluacion comparativa de checkpoints de una misma tarea: el servidor admite varios `--checkpoints` y `GET /switch?ckpt=<name>`, de modo que un unico proceso puede alternar entre `step_009999` y otros pasos sin reiniciar, util para curvas de aprendizaje por paso de entrenamiento.
- Auditoria de resultados publicados: el repositorio documenta que los resultados anteriores al 2026-10-14 son invalidos y estan etiquetados `-stagefix`, lo que permite filtrar de forma fiable experimentos previos en tareas a partir de la 4.
- Servicio por GPU en paralelo: la configuracion recomendada es un servidor por GPU con `XLA_PYTHON_CLIENT_MEM_FRACTION=0.35`, lo que facilita ejecutar varias politicas en un nodo multi-GPU con aislamiento por dispositivo (`CUDA_VISIBLE_DEVICES`).
- Investigacion sobre condicionamiento por etapas: disponer de la tabla corregida de 1087 filas y de los rangos exactos por tarea (por ejemplo, tarea 90 con 5 etapas en las filas 996-1000, tarea 91 con 11 etapas en 1001-1011) permite experimentos de ablacion sobre el condicionamiento de etapa.
- Benchmarking de robustez de pinza: las opciones `--gripper-recovery-steps` y `--gripper-recovery-hold-steps` permiten comparar sistematicamente politicas con y sin recuperacion activa de pinza.
- Integracion en infraestructura de evaluacion continua: el cliente `eval_multi_ckpt.py` envuelve `BatchedEvaluator` de `omnigibson.eval` con las instancias publicas de test (indices 0-9, ids 301-310) y un timeout de 1.5x la duracion humana, y `run_all.py` construye la linea de comandos exacta para orquestar oleadas de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion anteriores al 2026-10-14 son invalidos debido al error en la tabla de etapas y que se estan repitiendo con la etiqueta `-stagefix`; no se incluye ninguna cifra de exito por tarea ni metrica agregada en el material proporcionado.

## Requisitos de hardware

- Configuracion recomendada: un servidor de politica por GPU, lanzado con `CUDA_VISIBLE_DEVICES=<GPU UUID>`.
- Memoria: la configuracion de ejemplo usa `XLA_PYTHON_CLIENT_MEM_FRACTION=0.35`, es decir, el cliente XLA reserva el 35 por ciento de la memoria de la GPU.
- Modelo concreto de GPU: no disponible; la model card no especifica ni VRAM total, ni arquitectura de GPU (A100, H100, RTX 4090 u otras).
- Encaje en GPU de consumo: no disponible.
- CPU: el ejemplo fija 8 nucleos con `taskset -c 24-31` por servidor.
- Almacenamiento: los checkpoints se copian a un directorio de staging, con `/dev/shm/ckpt_gpu2` en el ejemplo, es decir, RAM de host; los checkpoints multiples se mantienen en memoria de host para permitir el cambio en caliente.
- Despliegue: servidor propio `scripts/serve_b1k_2026.py` sobre JAX/XLA dentro del repositorio de politica; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de politica.
- Latencia y throughput: no disponibles de forma explicita; los unicos parametros temporales documentados son replanificacion cada 10 pasos de entorno y ejecucion de 13 de cada 30 acciones predichas.
- Red: comunicacion cliente-servidor por puerto HTTP (el ejemplo usa el puerto 8102).

## Comparativa con modelos similares

No es posible realizar una comparativa cuantitativa con la informacion disponible: no se publican benchmarks de los checkpoints `b1k-2026-*` ni parametros, contexto o licencia de los mismos. La unica comparacion defendible es a nivel de infraestructura y licencia del codigo asociado.

| Elemento | Este repositorio | `IliaLarchenko/behavior-1k-solution` | `StanfordVL/BEHAVIOR-1K` | Submodulo `openpi` |
|---|---|---|---|---|
| Funcion | Codigo y respuestas de evaluacion | Codigo de politica base | Simulador y evaluador | Libreria de politicas |
| Version o commit | 2026-10-14 | `ca556f74a455cef7987a2be4537b5ac85cc56dd7` | tag `v3.9.3-post1` | `01177e0242a1c7e8fad2547caa0e987def614cda` |
| Licencia | Apache-2.0 | Apache-2.0 | no disponible | no disponible |
| Benchmarks publicados | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos de politica comparables (por ejemplo, alternativas de la misma categoria VLA) en la informacion proporcionada, por lo que sus parametros, contexto, rendimiento y licencia se marcan como no disponibles.

## Limitaciones y advertencias

- Los resultados de evaluacion anteriores al 2026-10-14 son invalidos por el error en la tabla de etapas; cualquier cifra publicada antes de esa fecha debe descartarse o verificarse contra la etiqueta `-stagefix`.
- El repositorio contiene unicamente codigo, diffs y ficheros comprimidos; no incluye los pesos, que deben descargarse por separado desde `amyjia1212/<model>`.
- La model card no documenta sesgos, tasas de alucinacion ni comportamiento fuera de distribucion del checkpoint, por lo que no puede evaluarse su fiabilidad en escenarios no cubiertos por BEHAVIOR-1K.
- No se declaran idiomas soportados; las instrucciones y condiciones de tarea no estan caracterizadas linguisticamente en el material disponible.
- La evaluacion esta acotada al conjunto de test publico del simulador (indices 0-9, ids 301-310) y a un timeout de 1.5x la duracion humana, por lo que la generalizacion a instancias privadas o a entornos reales no esta respaldada por los datos aportados.
- Dependencia estricta de versiones: simulador `v3.9.3-post1`, commits concretos del repositorio de politica y de `openpi`; cualquier desviacion puede alterar los resultados.
- El uso comercial esta permitido por la licencia Apache-2.0 del repositorio, pero la licencia del simulador y del submodulo `openpi` no se especifica en la informacion disponible y debe verificarse por separado antes de un despliegue en produccion.
- El despliegue consume recursos de host notables: un servidor por GPU, 8 nucleos de CPU fijados y staging de checkpoints en `/dev/shm`.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/amyjia1212/b1k-2026-eval-code
- Repositorio de la politica base: https://github.com/IliaLarchenko/behavior-1k-solution
- Simulador y evaluador BEHAVIOR-1K: https://github.com/StanfordVL/BEHAVIOR-1K
- Submodulo `openpi` (Physical Intelligence), commit `01177e0242a1c7e8fad2547caa0e987def614cda`: no se proporciona URL directa en la informacion disponible
- En la busqueda web realizada no se han encontrado enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a un evento no relacionado.
