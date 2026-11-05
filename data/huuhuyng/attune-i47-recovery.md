# huuhuyng/attune-i47-recovery

## Resumen

`attune-i47-recovery` es un repositorio de datos (no un modelo de lenguaje) publicado por el usuario huuhuyng en HuggingFace. Contiene episodios de recuperación de tareas de manipulación robótica, generados a partir del modelo `langst-22vu/attune-vector-g11` (sha 267dd00f...), del que no se dispone de información pública adicional. El repositorio ocupa 1,8 GB y está etiquetado únicamente con `region:us`.

La propuesta metodológica es un esquema de *recovery targets*: cada episodio de recuperación combina el prefijo propio del modelo g11 (verbatim, cortado en el punto de estancamiento de la tarea) con una finalización `resume()` escrita por Claude Sonnet, conservada solo si supera `check_success`. El "experto" asociado es el `play_once` de la misma escena. Los pares de entrenamiento (D22) usan como *prompt* una demo experta estándar y como *target* estos episodios de recuperación.

El repositorio cubre cuatro tareas de manipulación: `beat_block_hammer`, `move_stapler_pad`, `place_dual_shoes` y `place_mouse_pad`, con recuentos de episodios de recuperación y experto indicados en la model card, además de un desglose por brazo (izquierdo/derecho/ambos). No se trata de un modelo con pesos publicados, sino de un *dataset* en formato `.npz` con frames compactados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de datos, no de pesos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.npz` (frames compactados con `data/compact.py`, q95) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado, sino un conjunto de datos de recuperación para el modelo `attune-vector-g11`. Cada episodio se construye concatenando el prefijo propio del modelo g11 (verbatim, truncado en el onset del estancamiento) con una finalización `resume()` redactada por Claude Sonnet, que se retiene únicamente si pasa `check_success`. El experto de referencia es el `play_once` de la misma escena.

Los pares de entrenamiento (denominados D22) emparejan como *prompt* una demo experta estándar y como *target* los episodios de recuperación descritos. Los frames se compactan con `data/compact.py` a q95, con frames de prompt en 0, 15, 30, etc. (sin pérdida). La clave `meta['i47']` de cada `.npz` identifica los frames de prefijo y de finalización. No se especifican número de tokens, composición del dataset ni uso de RLHF/DPO, por tratarse de un dataset de robótica y no de un LLM.

## Capacidades

- Generación de episodios de recuperación para tareas de manipulación robótica a partir de prefijos truncados en el punto de estancamiento.
- Finalizaciones `resume()` validadas mediante `check_success`.
- Cobertura de cuatro tareas: `beat_block_hammer`, `move_stapler_pad`, `place_dual_shoes` y `place_mouse_pad`.
- Desglose por brazo (izquierdo/derecho/ambos) en los episodios de recuperación.
- Pares prompt/target (D22) listos para entrenamiento supervisado.
- Compactación de frames con pérdida controlada (q95) y frames de prompt sin pérdida.
- Metadatos por episodio (`meta['i47']`) para trazabilidad de prefijo y finalización.

## Casos de uso

- Entrenamiento de políticas de recuperación: usar los pares D22 (demo experta como prompt, episodio de recuperación como target) para ajustar un modelo que sepa retomar tareas tras un estancamiento.
- Evaluación de robustez ante fallos: comparar el comportamiento del modelo g11 con y sin los *recovery targets* en las cuatro tareas cubiertas.
- Estudio de la corrección por brazo: analizar el desglose L/R/both (por ejemplo, `place_dual_shoes` con 12/0/12) para entender sesgos de lateralidad en la recuperación.
- Aumento de datos para manipulación bimanual: reutilizar los episodios de `place_dual_shoes` y `place_mouse_pad` como ejemplos de recuperación con ambos brazos.
- Investigación sobre destilación de finalizaciones: estudiar cómo finalizaciones generadas por un LLM (Claude Sonnet) y filtradas por `check_success` se comportan como targets de política.
- Reproducción de experimentos: cargar los `.npz` con `data/compact.py` y reconstruir los frames de prefijo/compleción mediante `meta['i47']`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye recuentos de episodios por tarea:

| Tarea | Recovery | Expert | Recovery por brazo (L/R/both) |
|---|---|---|---|
| beat_block_hammer | 22 | 20 | 2/20/0 |
| move_stapler_pad | 21 | 17 | 3/18/0 |
| place_dual_shoes | 12 | 15 | 0/0/12 |
| place_mouse_pad | 27 | 20 | 13/14/0 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay pesos de modelo en el repositorio).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; el repositorio es un dataset en `.npz` que se consume con `data/compact.py`.
- Latencia y throughput: no disponible.
- Almacenamiento: 1,8 GB para el repositorio completo.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos o datasets comparables de la misma categoría (recuperación de políticas robóticas con finalizaciones generadas por LLM y filtradas por éxito).

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo; no puede usarse para inferencia directa.
- La licencia no está declarada, por lo que el uso comercial queda sin marco legal explícito.
- Los idiomas no están declarados (irrelevante para un dataset de robótica, pero relevante para cualquier uso derivado).
- Las finalizaciones `resume()` provienen de Claude Sonnet y solo se retienen si pasan `check_success`; pueden existir sesgos del generador no documentados.
- Cobertura limitada a cuatro tareas y a un único modelo base (`attune-vector-g11`), lo que restringe la generalización.
- Los recuentos por brazo muestran desequilibrios fuertes (por ejemplo, `beat_block_hammer` con 2/20/0), lo que puede sesgar políticas entrenadas con estos datos.
- No hay información sobre sesgos, alucinación ni rendimiento en producción; cualquier uso requiere validación propia.
- El identificador del modelo base (`langst-22vu/attune-vector-g11`) no está verificado en la información disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/huuhuyng/attune-i47-recovery
- Modelo base referenciado: `langst-22vu/attune-vector-g11` (sha 267dd00f..., commit 81b58077717e0d0dffda34b560954caa7edc09ae)
- Script de compactación citado: `data/compact.py` (incluido en el repositorio)
