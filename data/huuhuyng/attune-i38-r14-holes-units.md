# huuhuyng/attune-i38-r14-holes-units

## Resumen

`huuhuyng/attune-i38-r14-holes-units` no es un modelo de lenguaje con pesos publicados, sino un repositorio de artefactos de evaluación (rollouts de simulación) del proyecto attune lab. El repositorio contiene resultados de un "duelo" comparativo entre dos variantes de un sistema denominado vector-orchestrator sobre tareas de manipulación robótica (beat_block_hammer, place_dual_shoes, place_mouse_pad) ejecutadas en RoboTwin-Vector. El tamaño del repositorio es de 0,0 GB y no incluye ficheros de pesos, tokenizador ni configuración de inferencia.

El interés del artefacto es metodológico: documenta un experimento pareado por unidad con 30 unidades por tarea y por lado, con hashes de bloques y de prompts para reproducibilidad, y reporta resultados agrupados con error estándar por unidad. No hay información sobre arquitectura, parámetros, contexto ni licencia del supuesto modelo subyacente, por lo que no es evaluable como modelo desplegable.

Dado que la model card describe únicamente el harness y los resultados del duelo, esta ficha documenta lo que el repositorio declara y marca explícitamente como "no disponible" todo aquello que no consta en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no contiene pesos; solo resultados JSON, clips de evaluación y logs) |

## Arquitectura y entrenamiento

No se proporciona información sobre la arquitectura del modelo subyacente. La model card describe el entorno de evaluación: harness `vector-orchestrator` en el commit `55ab67c` (spec v3, nivel 3), simulador `RoboTwin-Vector` en el commit `e87619a`, una GPU NVIDIA A100 80GB PCIe y 8 workers de simulación ejecutando ambos lados ("king" y "challenger") en la misma máquina y sobre los mismos bytes de demostración.

Los dos sistemas comparados son `Attila115/attune-vector-r14` (commit `1bb6ffcd5689454ab6069fc1c939da1c253953d5`, sha256 `d11b9dec342c2e396c2407b076b98c1af687ee80c920cd867dd6c63dc420c15a`) como "king" y `huuhuyng/attune-i38-P-6000-ema` (sha256 `ba2325aa3d31c72b89a426510091704f22072a40a992a8ee469ff4357216306f`) como "challenger". No consta información sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO).

## Capacidades

- Evaluación de políticas de manipulación robótica en simulación sobre tres tareas: `beat_block_hammer`, `place_dual_shoes` y `place_mouse_pad`.
- Ejecución de duelos pareados por unidad con materialización de demostraciones y prompts versionados mediante sha256.
- Registro estructurado por unidad y lado en `units.jsonl` con campos de tarea, unit_id, éxito, pasos, void, error, hashes de prompt y clip, wall time y tiempos de materialización.
- Generación de clips de evaluación y logs por unidad.
- No consta soporte de tool calling, agentes, multilingüismo, visión, audio ni modo de razonamiento, al no tratarse de un modelo de lenguaje documentado.

## Casos de uso

- Reproducción de experimentos de evaluación robótica: el repositorio permite reconstruir el duelo con los commits y hashes indicados, verificando la integridad de bloques (`0xa390499a...` para s3 y `0xc41dadc3...` para s3b) y de los prompts.
- Auditoría de resultados pareados: `units.jsonl` facilita recalcular medias y errores estándar por tarea y por lado con los datos crudos.
- Análisis de fallos por unidad: los clips y logs permiten inspeccionar por qué una unidad concreta falló o quedó void.
- Comparación de variantes de política: sirve como plantilla para enfrentar dos checkpoints sobre el mismo conjunto de demostraciones y workers.
- Estudio de robustez del harness: documenta un caso de 15 unidades void por agotamiento del presupuesto de 2400 s bajo contención de CPU con 8 workers, útil para dimensionar infraestructura.
- Referencia metodológica para publicaciones: el esquema de hashes y el formato de resultados puede adoptarse como estándar interno de trazabilidad en experimentos de simulación.

## Benchmarks y rendimiento

Resultados declarados en la model card (diferencia P − r14, error estándar por unidad):

| Tarea | Diferencia (P − r14) | n |
|---|---|---|
| beat_block_hammer | −1,7 ± 5,0 | 60 |
| place_dual_shoes | −2,2 ± 8,7 | 45 |
| place_mouse_pad | +0,0 ± 4,1 | 60 |
| Media de las 3 tareas | −1,3 ± 3,6 | — |

Notas: 30 unidades por tarea y lado; 15 unidades de `place_dual_shoes` quedaron void en ambos lados por superar el presupuesto de 2400 s de materialización de demos bajo contención de CPU con 8 workers. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay pesos publicados).
- GPU empleada en la evaluación declarada: 1x NVIDIA A100 80GB PCIe.
- Viabilidad en GPU de consumo: no disponible.
- Despliegue: el entorno declarado es `vector-orchestrator` (commit `55ab67c`) con `RoboTwin-Vector` (commit `e87619a`) y 8 workers de simulación; no consta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card solo menciona un presupuesto de 2400 s por bloque de materialización bajo contención de CPU.

## Comparativa con modelos similares

| Sistema | Rol en el duelo | Commit / sha256 | Licencia | Pesos |
|---|---|---|---|---|
| Attila115/attune-vector-r14 | king | `1bb6ffcd...` / `d11b9dec...` | no disponible | no incluidos en este repo |
| huuhuyng/attune-i38-P-6000-ema | challenger | — / `ba2325aa...` | no disponible | no incluidos en este repo |
| huuhuyng/attune-i38-r14-holes-units | repositorio de resultados | — | no disponible | no incluidos |

No se dispone de información sobre otros modelos comparables de la misma categoría fuera de los dos participantes del duelo.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni código de inferencia; no es un modelo desplegable.
- Ausencia total de datos de arquitectura, parámetros, contexto, idiomas y licencia: no es posible evaluar uso comercial ni condiciones de redistribución.
- Los resultados proceden de un único entorno (una A100, 8 workers, un harness concreto) y de tres tareas de simulación; no son extrapolables a otros dominios.
- 15 unidades de `place_dual_shoes` quedaron void por agotamiento del presupuesto de tiempo, lo que reduce la muestra efectiva a 45 en esa tarea y puede introducir sesgo de selección.
- Los intervalos de error estándar son amplios (hasta ±8,7 en `place_dual_shoes`), por lo que las diferencias reportadas no permiten conclusiones firmes sobre superioridad entre variantes.
- Riesgo de alucinación y sesgos: no aplicable al no ser un modelo generativo documentado; no obstante, cualquier uso de los resultados debe citar los hashes y commits exactos para evitar atribuciones erróneas.
- El nombre del repositorio sugiere un subconjunto de unidades ("holes units") del experimento i38 r14; no consta que sea el conjunto completo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huuhuyng/attune-i38-r14-holes-units
- Modelo "king" referenciado: https://huggingface.co/Attila115/attune-vector-r14
- Modelo "challenger" referenciado: https://huggingface.co/huuhuyng/attune-i38-P-6000-ema
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código ni demos adicionales.
