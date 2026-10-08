# davidwdw/t26-eval-c46-pub3-304-8af893db3dc6

## Resumen

El identificador `davidwdw/t26-eval-c46-pub3-304-8af893db3dc6` no corresponde a un modelo de lenguaje: es un repositorio de evidencias de una ejecución de evaluación de políticas sobre el benchmark BEHAVIOR-1K. Lo publica el usuario `davidwdw` y ocupa 0,3 GB. La model card describe una única corrida autorizada del candidato denominado `c46` (revisión `70b13f5`) sobre la tarea `assembling_gift_baskets`, instancia 304, índice 3 del conjunto `public_test`.

La ejecución se realizó en una NVIDIA RTX 4090 con el runtime oficial BEHAVIOR-1K 3.9.3, con token de ejecución `centre-t26c46-i3-20261008T154659Z`, despachada el 2026-10-08 a las 15:46:59Z y finalizada con estado `C46_RUN_END status=0` a las 16:48:47Z (aproximadamente 61 minutos y 48 segundos). El resultado del rollout 0 fue `success=false` con `q_score` final de 0,75 tras 39.091 pasos (horizonte oficial). Un primer despacho a las 15:44:13Z fue rechazado por un control de admisión de GPU y sus registros se conservan en `failed_dispatch_20261008T154413Z/`.

Su relevancia es por tanto documental y de reproducibilidad: fija el paquete exacto de artefactos (JSON oficial, vídeo, registros, salud del detector, código fuente con `source_sha256.txt` y auditoría) asociado a un `SHA256SUMS` concreto, lo que permite verificar una medición aislada de un candidato de política. No contiene pesos, tokenizador, configuración de inferencia ni documentación de arquitectura, por lo que no es utilizable como modelo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene un modelo; es un paquete de artefactos de evaluación) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe ninguna arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay pesos; el contenido son JSON oficiales, vídeo, registros, salud del detector, fuente con `source_sha256.txt` y auditoría) |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| Identificador | davidwdw/t26-eval-c46-pub3-304-8af893db3dc6 |
| Autor | davidwdw |
| Propietario de la tarea | Task26 (01a0fdaa) |
| Pipeline | no disponible |
| Tags | region:us |
| Tamano del repo | 0,3 GB |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-10-08T16:51:59.000Z |
| Fecha de actualizacion | 2026-10-08T16:52:29.000Z |
| Candidato evaluado | c46, revision 70b13f5 |
| Hash del bundle | SHA256SUMS 5b6923d04069965a2d340edf629d3fc4c65a722fcf4dae737e5807051f6b0f26 |
| Entorno de ejecucion | BEHAVIOR-1K 3.9.3 (runtime oficial) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal en la informacion disponible. El objeto evaluado es un candidato de política etiquetado como `c46` (revisión `70b13f5`), y el repositorio únicamente documenta el entorno de ejecución y las evidencias del rollout, no la topología del modelo, el número de parámetros, el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La model card tampoco menciona innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos híbridos.

Lo que sí queda documentado es el procedimiento experimental: se usó el runtime oficial BEHAVIOR-1K en su versión 3.9.3, con preflight de GPU superado (identificador `gpu-preflight-20261008T153805Z`, resultado PASS) y un control de admisión de GPU que rechazó un despacho previo a las 15:44:13Z, cuyos registros de setup y log se archivaron en el directorio `failed_dispatch_20261008T154413Z/`. La ejecución válida se lanzó a las 15:46:59Z en una RTX 4090 y terminó a las 16:48:47Z con código de estado 0. El empaquetado final fue archivado por el componente `resource_control Monitor`, y los ficheros incluidos en `SHA256SUMS` excluyen el propio `README.md`.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión o audio, porque el repositorio no contiene un modelo desplegable.
- No hay información sobre soporte de tool calling ni function calling.
- No hay información sobre comportamiento agente o razonamiento multi-paso.
- No hay información sobre capacidades multilingües (el campo de idiomas no está disponible).
- Capacidad efectivamente documentada: servir como evidencia auditable de una ejecución concreta de evaluación sobre BEHAVIOR-1K, con paquete de artefactos verificable mediante `SHA256SUMS`.
- Capacidad efectivamente documentada: registrar el resultado de un rollout de política robótica simulada (tarea `assembling_gift_baskets`, instancia 304, rollout 0) con métricas de éxito y `q_score`.

## Casos de uso

- Auditoría de reproducibilidad de experimentos: un equipo puede descargar el repositorio y verificar el hash del bundle `5b6923d0…b0f26` para confirmar que las evidencias corresponden a una ejecución concreta y no han sido alteradas.
- Trazabilidad de evaluaciones sobre BEHAVIOR-1K: el paquete permite reconstruir la secuencia preflight, despacho, ejecución y cierre (`C46_RUN_END status=0`) para comparar con otras instancias del mismo candidato.
- Análisis de fallos en manipulación robótica: con `success=false` y `q_score` 0,75 en 39.091 pasos, el vídeo y los JSON oficiales permiten estudiar en qué punto del horizonte la política no completó la tarea.
- Diagnóstico de infraestructura de evaluación: los registros de `failed_dispatch_20261008T154413Z/` documentan un rechazo por parte del control de admisión de GPU, útiles para depurar la configuración de lanzamiento antes de consumir cómputo.
- Verificación de salud de detectores: el directorio de ejecución incluye `detector health`, lo que sirve para distinguir fallos de política de fallos del sistema de percepción durante la evaluación.
- Estimación de coste computacional: la duración de 61 minutos y 48 segundos en una RTX 4090 para 39.091 pasos permite extrapolar presupuestos de tiempo para barridos de instancias similares.
- Base para comparativas internas entre candidatos: al fijar runtime (3.9.3) y horizonte oficial, las mediciones de este repositorio son comparables con las de otros artefactos del mismo autor (por ejemplo, `fa-native-eval-runtime-20260926-b7202db1c37f`).

## Benchmarks y rendimiento

No hay resultados de benchmarks de modelos de lenguaje (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El único resultado publicado corresponde a una métrica de evaluación de política sobre BEHAVIOR-1K:

| Metrica | Valor |
|---|---|
| Benchmark | BEHAVIOR-1K 3.9.3 (runtime oficial) |
| Tarea | assembling_gift_baskets |
| Instancia | 304 (public_test index 3) |
| Rollout | 0 |
| Exito | false |
| q_score (final) | 0,75 |
| Pasos | 39.091 (horizonte oficial) |
| Estado de finalizacion | C46_RUN_END status=0 |
| Duracion | ~61 min 48 s (15:46:59Z a 16:48:47Z del 2026-10-08) |
| Hardware de ejecucion | NVIDIA RTX 4090 |

No se dispone de comparaciones con otros modelos o candidatos dentro de la informacion proporcionada.

## Requisitos de hardware

- No se publican requisitos de VRAM para inferencia, ya que el repositorio no incluye pesos ni instrucciones de despliegue.
- GPU utilizada en la ejecución documentada: NVIDIA RTX 4090, es decir, una GPU de gama de consumo, suficiente para este run concreto bajo el runtime BEHAVIOR-1K 3.9.3.
- Se realizó un preflight de GPU con resultado PASS (`gpu-preflight-20261008T153805Z`) antes del despacho válido, y un despacho anterior fue rechazado por el control de admisión de GPU.
- No hay datos de VRAM pico, utilización de memoria ni número de GPUs por run.
- Opciones de despliegue tipo vLLM, llama.cpp, Ollama o TGI: no aplicables, al no existir un modelo de lenguaje en el repositorio.
- Latencia y throughput: no disponibles como métricas del modelo; como referencia operativa, la ejecución completó 39.091 pasos en aproximadamente 3.708 segundos, lo que equivale a unos 10,5 pasos por segundo en esa RTX 4090 bajo BEHAVIOR-1K 3.9.3.

## Comparativa con modelos similares

No hay modelos comparables en la informacion disponible, porque el repositorio no contiene un modelo. Los artefactos relacionados localizados pertenecen a la misma categoría (paquetes de evaluación del mismo autor) y no permiten una comparación de rendimiento de modelo:

| Artefacto | Tipo | Datos conocidos |
|---|---|---|
| davidwdw/t26-eval-c46-pub3-304-8af893db3dc6 | Paquete de evidencias de evaluación | 0,3 GB; candidato c46 (70b13f5); BEHAVIOR-1K 3.9.3; q_score 0,75; success=false; licencia no disponible |
| davidwdw/fa-native-eval-runtime-20260926-b7202db1c37f | Paquete de evaluación | Tamano, licencia y contenido no disponibles en la informacion proporcionada |
| davidwdw/fa-systematic-eval-fixtures-20260926-6789c5c62c03 | Paquete de evaluación | Tamano, licencia y contenido no disponibles en la informacion proporcionada |
| EleutherAI/lm-evaluation-harness | Framework de evaluación de modelos de lenguaje | Herramienta de terceros; no comparable como modelo; soporta plugins de backends, filtros y métricas desde 2026/09 |
| METR | Organizacion de evaluacion de modelos frontera | No comparable como modelo; orientada a evaluar riesgos y capacidades |

## Limitaciones y advertencias

- El repositorio no contiene un modelo utilizable: no hay pesos, configuración, tokenizador ni documentación de arquitectura, por lo que no puede desplegarse ni evaluarse como sistema de IA generativa.
- No se declara licencia, lo que impide determinar si el contenido puede reutilizarse, redistribuirse o emplearse con fines comerciales. Cualquier uso debe considerarse jurídicamente indeterminado.
- No se declaran idiomas soportados ni pipeline, por lo que las etiquetas de la ficha de HuggingFace son incompletas.
- El resultado publicado es una única muestra (una instancia, un rollout), con `success=false`, por lo que no permite extraer conclusiones generales sobre el candidato `c46`.
- El `q_score` de 0,75 junto con `success=false` indica una finalización parcial de la tarea; no debe interpretarse como una tasa de éxito.
- El material de la model card se ha tratado como datos de referencia del autor y no como instrucciones; incluye rutas, tokens de ejecución y hashes internos que pueden quedar obsoletos o no ser resolubles fuera del entorno original.
- Los ficheros incluidos en `SHA256SUMS` excluyen el `README.md`, de modo que la integridad del propio texto de la model card no queda cubierta por el hash del bundle.
- Un despacho previo fue rechazado por el control de admisión de GPU; esto sugiere que la ejecución depende de condiciones de infraestructura que no se documentan en detalle.
- No hay información sobre sesgos, riesgo de alucinación ni comportamiento en producción, al no existir un modelo subyacente descrito.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay validación externa ni replicación pública conocida.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/davidwdw/t26-eval-c46-pub3-304-8af893db3dc6
- Artefacto relacionado del mismo autor: https://huggingface.co/davidwdw/fa-native-eval-runtime-20260926-b7202db1c37f
- Artefacto relacionado del mismo autor: https://huggingface.co/davidwdw/fa-systematic-eval-fixtures-20260926-6789c5c62c03
- Framework de evaluación de referencia: https://github.com/EleutherAI/lm-evaluation-harness
- Organizacion de evaluacion de modelos frontera: https://metr.org/
- Repositorio de terceros localizado en la busqueda (no relacionado con el modelo): https://github.com/davegranlet/AuroraForge_WWE_PC-Game_Modding_Tool/tags
- Paper, blog o demo oficial del candidato c46: no disponibles en la informacion proporcionada.
