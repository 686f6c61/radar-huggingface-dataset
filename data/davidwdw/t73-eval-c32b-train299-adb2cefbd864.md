# davidwdw/t73-eval-c32b-train299-adb2cefbd864

## Resumen

El repositorio `davidwdw/t73-eval-c32b-train299-adb2cefbd864` no es un modelo de lenguaje: es un archivo de evidencia de una ejecución de evaluación y entrenamiento (run) del proyecto Task73 sobre el benchmark de robótica BEHAVIOR-1K v3.9.2. Lo publica el usuario de HuggingFace `davidwdw` y su contenido son artefactos de trazabilidad: JSON oficial de resultados, vídeo de la política ejecutada, logs de evaluador, política y preflight, identidad del run, log del lanzador, archivo `source.tgz` congelado, `manifest.sha256` y registros de comprobación en CPU.

El run se identifica con el token `centre-run-c32b-20261010T183904Z` e inició el 2026-10-10T18:39:04Z sobre una única GPU RTX 4090. El resultado registrado es `instance=299 rollout=0 steps=21888 success=False q_score=0.6666666666666666`, correspondiente a la tarea `organizing_school_stuff_299_0` del benchmark. El repositorio ocupa 0,1 GB y se archivó automáticamente mediante el componente `resource_control Monitor`.

Su relevancia no es la de un modelo desplegable, sino la de un registro reproducible de evaluación: permite auditar una ejecución concreta contra una build congelada del runtime oficial BEHAVIOR-1K (`b1979916ec15`) y verificar la integridad de los ficheros mediante hashes SHA-256. No se publica información sobre arquitectura, pesos, tokenizador ni licencia de uso del sistema subyacente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene JSON, MP4, logs, `source.tgz` y ficheros `sha256`) |

Datos adicionales del artefacto:

| Parametro | Valor |
|---|---|
| Identificador del run | centre-run-c32b-20261010T183904Z |
| Inicio del run | 2026-10-10T18:39:04Z |
| Runtime | BEHAVIOR-1K v3.9.2 oficial, commit b1979916ec15 |
| SHA-256 del archivo fuente congelado | a48171226e16088ccf04bef02eead30f185fd4a76f580794a6e19eb87018c148 |
| SHA-256 del manifiesto | f8b1b05dbffc1ae3ce4a372cac2d8a49f7a2e0538d05050a48fd79d6f33ee89c |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-10T19:12:46Z |
| Fecha de actualizacion | 2026-10-10T19:13:11Z |

## Arquitectura y entrenamiento

La model card no describe ninguna arquitectura de red neuronal, ni el número de parámetros, ni la composición del dataset de entrenamiento, ni si se aplicaron técnicas de alineación como RLHF o DPO. Lo que documenta es un procedimiento experimental: una ejecución autorizada de entrenamiento del proyecto Task73 ejecutada con `--mode train` sobre el runtime oficial BEHAVIOR-1K v3.9.2, con dependencias congeladas en un archivo fuente cuyo SHA-256 se registra para garantizar reproducibilidad.

La innovación metodológica del repositorio es de tipo procedimental, no algorítmico: cada artefacto (JSON de resultados, vídeo de la política, logs de evaluador/política/preflight, identidad del run, log del lanzador) queda referenciado en `SHA256SUMS`, de modo que un tercero puede verificar que los datos no han sido alterados. La model card indica explícitamente que el `README.md` no está incluido en `SHA256SUMS`. El run reporta 21 888 pasos y finaliza con `success=False` y `q_score=0,6666666666666666` sobre la instancia `299`.

## Capacidades

- No es un modelo de inferencia: no genera texto, no ejecuta código ni responde a peticiones de usuario.
- Contiene el resultado estructurado de una evaluación de política robótica en el benchmark BEHAVIOR-1K (`organizing_school_stuff_299_0.json`).
- Incluye el vídeo de la rollout (`organizing_school_stuff_299_0.mp4`) para inspección cualitativa del comportamiento.
- Incluye logs de evaluador, de política y de preflight, útiles para diagnosticar fallos de ejecución.
- Incluye un archivo de identidad del run y un log del lanzador con la invocación exacta.
- Incluye `source.tgz` con el código fuente congelado y `manifest.sha256` para verificación de integridad.
- Incorpora logs de comprobación en CPU del manifiesto.
- No se declara soporte de tool calling, agentes, multilingüismo ni capacidades multimodales del sistema evaluado.

## Casos de uso

- Auditoría de resultados de benchmark: un revisor descarga el JSON y el vídeo, recalcula los hashes de `SHA256SUMS` y confirma que la puntuación reportada para la instancia 299 corresponde a la ejecución archivada.
- Reproducción de experimentos: `source.tgz` más los hashes del manifiesto permiten reconstruir el entorno exacto (runtime BEHAVIOR-1K v3.9.2, commit `b1979916ec15`) y repetir el run bajo las mismas condiciones.
- Depuración de fallos de política: con `success=False` pero `q_score=0,667`, los logs de evaluador y política permiten reconstruir en qué fase de la tarea `organizing_school_stuff` se produjo la desviación.
- Trazabilidad para publicación científica: el conjunto de hashes y el token de run constituyen un registro citable del experimento dentro del proyecto Task73.
- Control de regresiones entre checkpoints: al mantener runs numerados (aquí `train299`), es posible comparar el `q_score` de esta instancia con el de otras ejecuciones sobre la misma tarea.
- Análisis de consumo de recursos: el repo documenta que la ejecución se realizó en una única RTX 4090, dato reutilizable para planificar presupuesto de cómputo en evaluaciones similares.
- Formación de pipelines de evaluación continua: el formato de artefactos (JSON + vídeo + logs + manifiesto) es directamente integrable en un harness que valide integridad y extraiga métricas automáticamente.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son los de esta ejecución concreta sobre BEHAVIOR-1K v3.9.2. No se aportan métricas comparativas de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de modelos de lenguaje, ya que el artefacto no corresponde a un modelo de ese tipo.

| Metrica | Valor |
|---|---|
| Benchmark | BEHAVIOR-1K v3.9.2 (tarea `organizing_school_stuff`) |
| Instancia | 299 |
| Rollout | 0 |
| Pasos ejecutados | 21 888 |
| Exito (`success`) | False |
| Puntuacion (`q_score`) | 0,6666666666666666 |
| Artefactos de resultado | `organizing_school_stuff_299_0.json`, `organizing_school_stuff_299_0.mp4` |
| Hardware de ejecucion | 1 x NVIDIA RTX 4090 |

No se han publicado resultados comparativos con otros modelos o políticas en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 0,1 GB, por lo que su descarga y almacenamiento son triviales en cualquier equipo.
- La ejecución registrada se llevó a cabo en una única GPU NVIDIA RTX 4090, según la model card.
- No se especifica VRAM consumida durante el run, ni memoria del sistema, ni duración total de la ejecución.
- No aplica estimación de VRAM para inferencia de un modelo de lenguaje: el repositorio no contiene pesos.
- No se declaran opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) porque no hay artefacto de modelo que servir.
- No se publican datos de latencia ni de throughput.
- Para consumir los artefactos basta con herramientas estándar: visor JSON, reproductor MP4 y `sha256sum` para verificar `SHA256SUMS`.

## Comparativa con modelos similares

No existen modelos comparables en sentido estricto, porque este repositorio es evidencia de evaluación y no un modelo. Como referencia, la búsqueda web devuelve otros repositorios del mismo autor con el mismo patrón de artefactos de evaluación, pero sin especificaciones técnicas publicadas en la información disponible.

| Repositorio | Tipo | Parametros | Contexto | Licencia | Datos publicados |
|---|---|---|---|---|---|
| `davidwdw/t73-eval-c32b-train299-adb2cefbd864` | Evidencia de run (Task73 / BEHAVIOR-1K) | no disponible | no disponible | no disponible | JSON, MP4, logs, `source.tgz`, hashes |
| `davidwdw/fa-native-eval-runtime-20260926-b7202db1c37f` | Evidencia de evaluación | no disponible | no disponible | no disponible | no disponible en la información consultada |
| `davidwdw/fa-eval-all-h13-79999-31a430f925de` | Evidencia de evaluación | no disponible | no disponible | no disponible | no disponible en la información consultada |

## Limitaciones y advertencias

- No es un modelo utilizable: no contiene pesos, tokenizador ni código de inferencia, por lo que no puede emplearse para generar texto ni para servir peticiones.
- El resultado registrado es un fallo de tarea (`success=False`), con una puntuación parcial de 0,667; no debe interpretarse como validación de la política evaluada.
- La model card no indica licencia, por lo que no puede asumirse permiso de uso comercial ni de redistribución de los artefactos.
- No se declaran idiomas soportados ni sesgos conocidos del sistema evaluado.
- El `README.md` queda fuera de `SHA256SUMS`, de modo que la propia descripción no está cubierta por la verificación de integridad.
- Se trata de una única instancia y un único rollout (`instance=299`, `rollout=0`), sin repetibilidad estadística publicada.
- No se documentan semillas aleatorias, hiperparámetros de entrenamiento ni configuración completa del entorno más allá del commit del runtime y los hashes del archivo fuente.
- Las fechas de creación y actualización del repositorio (octubre de 2026) y el token de run son los únicos anclajes temporales disponibles; no hay histórico de versiones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/davidwdw/t73-eval-c32b-train299-adb2cefbd864
- Repositorio relacionado del mismo autor: https://huggingface.co/davidwdw/fa-native-eval-runtime-20260926-b7202db1c37f
- Repositorio relacionado del mismo autor: https://huggingface.co/davidwdw/fa-eval-all-h13-79999-31a430f925de
- Portafolio de evaluación del autor en GitHub: https://github.com/David899b/ai-eval-portfolio
- Berkeley Function Calling Leaderboard (BFCL) V4: https://gorilla.cs.berkeley.edu/leaderboard.html
