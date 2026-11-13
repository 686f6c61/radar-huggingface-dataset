# forkjoin-ai/g1l-knot-archive

## Resumen

`forkjoin-ai/g1l-knot-archive` es un repositorio de archivo, no un modelo entrenado. Pertenece a la organizacion Forkjoin.ai y contiene lo que el autor denomina "knots": artefactos empaquetados de modelos de terceros (Qwen2.5, Mistral 7B, Falcon Mamba 7B, entre otros) junto con shards derivados de un conjunto propio llamado "glimmer". El repositorio se declara explicitamente como no productivo y sin superficie de servicio.

El contenido del repositorio no es un checkpoint unico ni un modelo con pesos originales: es un inventario de ficheros binarios con extension `.knot`, cada uno con un tamano en bytes documentado, que corresponden a variantes y fragmentos de modelos existentes. El autor indica que los artefactos de produccion (la "escalera G1L": `rwkv7-g1l-1.5b`, `2.9b`, `7.2b` y `13.3b`) residen en su propio almacenamiento R2 y se referencian mediante recibos de admision, no en Hugging Face.

Su relevancia es limitada para evaluacion de modelos: no hay model card tecnica con arquitectura, contexto, licencia o benchmarks del modelo subyacente, y el propio autor advierte que nada del repositorio es un artefacto de serving. El interes practico es documental: permite inspeccionar el esquema de empaquetado y sharding de Forkjoin.ai, pero no sirve como base para desplegar inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de archivo con artefactos de varios modelos) |
| Parametros totales | no disponible (el inventario incluye artefactos de ~0,5B a ~30B, pero no son pesos de un modelo unico) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona una variante `q4_k_m` para Qwen2.5 7B y `q4km` para Qwen2.5 1.5B) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.knot` (formato propietario de Forkjoin.ai); no se documenta su estructura interna |

Tamano total del repositorio: 75,9 GB. Fecha de creacion: 2026-11-13; ultima actualizacion: 2026-11-13. Descargas: 0. Likes: 0.

Inventario declarado por el autor:

| Artefacto | Bytes | Notas |
|---|---:|---|
| `muse-glimmer-30b.knot` | 16.743.627.833 | experimental, fuera de produccion |
| `shards-glimmer-3/shard-0-entry.knot` | 7.129.089.937 | conjunto glimmer shardizado por capas (derivado) |
| `shards-glimmer-3/shard-1-mid.knot` | 4.258.208.853 | idem |
| `shards-glimmer-3/shard-2-exit.knot` | 5.356.329.205 | idem |
| `shards-glimmer/shard-0-entry.knot` | 9.684.015.101 | shard de entrada glimmer (derivado) |
| `gemma4-31b-it-heretic-ara.knot` | 2.207.596.544 | experimental, fuera de produccion |
| `falcon-mamba-7b-instruct.knot` | 8.157.731.597 | experimental, fuera de produccion |
| `mistral-7b.knot` | 7.701.832.989 | experimental, fuera de produccion |
| `qwen2.5-7b-instruct-7b.knot` | 4.677.153.133 | variante de Qwen2.5 7B |
| `qwen2.5-7b-instruct-q4_k_m.knot` | 4.677.153.145 | variante Q4_K_M de Qwen2.5 7B |
| `idol-turbo.knot` | 3.638.843.041 | knot de evaluacion |
| `qwen2.5-0.5b.knot` | 669.793.401 | checkpoint de modelo pequeno |
| `qwen2.5-1.5b-q4km.knot` | 980.129.997 | modelo pequeno en Q4_K_M |

## Arquitectura y entrenamiento

No se documenta arquitectura ni proceso de entrenamiento. El repositorio no contiene una model card con descripcion de transformer, MoE, SSM o hibrido, ni datos sobre tokens de entrenamiento, composicion del dataset o fases de RLHF/DPO. Los nombres de los artefactos sugieren el empaquetado de modelos de terceros conocidos (Qwen2.5, Mistral 7B, Falcon Mamba 7B, un supuesto Gemma 4 31B) y de un conjunto propio denominado "glimmer" del que no se ofrece ficha tecnica.

La unica innovacion tecnica descrita es de infraestructura, no de modelado: el esquema "knot" con verificacion SHA-256 previa al transporte y comprobacion de longitud en bytes contra el arbol de Hugging Face tras la subida, y un reparto de artefactos entre R2 (superficie de serving) y Hugging Face (archivo). Se menciona una "puerta de admision" de Paris con la secuencia `[6699,51128,4706,44312,4600] -> 37138` que debe pasar antes de enrutar un knot, pero no se explica su semantica.

## Capacidades

- No se documentan capacidades del modelo. El repositorio es un archivo de artefactos binarios, no un modelo servible.
- No hay informacion sobre generacion de texto, razonamiento, codigo, matematicas o vision.
- No hay informacion sobre tool calling ni function calling.
- No hay informacion sobre soporte de agentes o razonamiento multi-paso.
- No hay informacion sobre capacidades multilingues.
- No hay informacion sobre modos especiales (thinking mode, vision, audio).
- Los artefactos incluidos remiten, por nombre, a modelos de terceros cuyas capacidades habria que consultar en sus repositorios originales.

## Casos de uso

- Auditoria de empaquetado: inspeccionar el esquema `.knot` y el sharding por capas (`entry`/`mid`/`exit`) para entender como Forkjoin.ai fragmenta artefactos de gran tamano antes de transportarlos.
- Verificacion de integridad: reproducir el flujo descrito por el autor (hash SHA-256 antes del transporte y comprobacion de longitud en bytes tras la subida) sobre los ficheros del inventario.
- Archivo y trazabilidad: conservar variantes retiradas o experimentales de modelos (Mistral 7B, Falcon Mamba 7B) fuera del bucket de serving para mantener este pequeno y auditable.
- Estudio de estrategias de cuantizacion: comparar los pares `qwen2.5-7b-instruct-7b.knot` frente a `qwen2.5-7b-instruct-q4_k_m.knot` (4.677.153.133 frente a 4.677.153.145 bytes) para analizar como se representa la cuantizacion en el formato knot.
- Referencia para pipelines de distribucion: usar el inventario como ejemplo de separacion entre superficie de serving (R2) y archivo (Hugging Face) en un sistema de inferencia distribuida.
- Documentacion de linaje: enlazar los knots archivados con las model cards de produccion (`forkjoin-ai/rwkv7-g1l-{1.5b,2.9b,7.2b,13.3b}`), que el autor declara como autoridad de procedencia y politica de cuantizacion.
- No es adecuado para: servir inferencia, evaluar calidad de modelo, ni desplegar en produccion, segun la propia advertencia del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no es un artefacto de serving y el formato `.knot` no documenta su estructura, por lo que no puede estimarse el consumo de memoria de forma fiable.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible. El autor indica que los knots se sirven detras de la superficie `apps/edgework-app` a traves de la puerta de admision, nunca directamente desde este archivo; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Almacenamiento: 75,9 GB para el conjunto del repositorio; el artefacto individual mas grande es `muse-glimmer-30b.knot` con 16.743.627.833 bytes (~15,6 GiB).

## Comparativa con modelos similares

No procede una comparativa de modelos: este repositorio no es un modelo con pesos y arquitectura propios, sino un archivo de artefactos. Como referencia de los modelos de terceros empaquetados, habria que acudir a sus repositorios originales (Qwen2.5, Mistral 7B, Falcon Mamba 7B), para los que no se aporta informacion en esta ficha.

| Aspecto | g1l-knot-archive | Modelo servible tipico |
|---|---|---|
| Naturaleza | Archivo de artefactos `.knot` | Checkpoint con pesos y model card |
| Parametros | No aplica (inventario heterogeneo) | Definidos por el modelo |
| Contexto | No disponible | Documentado en model card |
| Licencia | No disponible | Declarada |
| Serving | Excluido por el autor | Soportado via vLLM/llama.cpp/etc. |

## Limitaciones y advertencias

- El autor declara explicitamente que el repositorio es no productivo y que "nada aqui es un artefacto de serving"; no debe enrutarse para inferencia.
- Ausencia total de model card tecnica: sin arquitectura, contexto, licencia, idiomas ni benchmarks.
- Licencia no disponible: no puede confirmarse el uso comercial de los artefactos ni de los modelos subyacentes empaquetados.
- El formato `.knot` es propietario y no esta documentado; no hay garantia de interoperabilidad con herramientas estandar.
- El inventario mezcla modelos de terceros de origenes y licencias distintos (Qwen2.5, Mistral, Falcon Mamba, un supuesto Gemma 4), lo que complica cualquier evaluacion de sesgos o alucinacion por separado.
- La "puerta de admision" y la secuencia `[6699,51128,4706,44312,4600] -> 37138` no se explican; no puede verificarse su funcionamiento.
- Las fechas del repositorio (creacion 2026-11-13) y la denominacion "gemma4-31b" deben tratarse con cautela: no hay confirmacion independiente de su procedencia.
- Cero descargas y cero likes: sin validacion por parte de la comunidad.
- No apto para produccion, evaluacion de calidad ni despliegue en GPU.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/forkjoin-ai/g1l-knot-archive
- Aplicacion Edgework (superficie de serving, segun el autor): https://github.com/forkjoin-ai/forkjoin.ai/tree/main/apps/edgework-app
- Model cards de produccion citadas (no verificadas en la informacion disponible): `forkjoin-ai/rwkv7-g1l-1.5b`, `forkjoin-ai/rwkv7-g1l-2.9b`, `forkjoin-ai/rwkv7-g1l-7.2b`, `forkjoin-ai/rwkv7-g1l-13.3b`
- Repositorio de la superficie Edgework citado: `forkjoin-ai/edgework-app`
