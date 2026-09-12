# mkd-hossain/Keural-Cortex-8B-64K-training-state

## Resumen

Keural-Cortex-8B-64K-training-state no es un modelo utilizable, sino el estado final de entrenamiento (step 795/795) de la fase 5 del proyecto Keural Cortex 8B de MKD Co., Ltd., publicado en formato PyTorch Distributed Checkpoint (DCP) con fines de archivo y reproducibilidad. El repositorio contiene los parametros sombreados por FSDP junto con los momentos del optimizador AdamW (`exp_avg`, `exp_avg_sq`), lo que explica sus ~46 GB frente a los ~16 GB del modelo exportado. El autor advierte explicitamente de que `from_pretrained()` no funciona sobre estos ficheros.

El modelo subyacente es un ajuste por continued pretraining (CPT) de Qwen/Qwen3-8B-Base, con unos 8.000 millones de parametros nominales y una ventana de contexto que se extendio de 32K a 64K tokens durante esta fase. El entrenamiento consumio 2.500.853.760 tokens (2,50B) en esta etapa y partio de `exports/full/step_0010000` de un CPT previo de 41B tokens, con un scheduler WSD que termino en un learning rate de 1,0e-06.

Su relevancia es acotada y de tipo ingenieril: sirve como registro auditable de un pipeline FSDP a 64K de secuencia y como punto de reanudacion exacto para quien disponga del corpus original y del mismo `world_size`. Para uso real en inferencia, el autor remite al modelo exportado `mkd-hossain/Keural-Cortex-8B-64K`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion disponible; derivada de Qwen/Qwen3-8B-Base. El repositorio almacena un estado de entrenamiento FSDP, no un grafo de modelo cargable |
| Parametros totales | ~8B nominales (por el nombre del repositorio y el modelo base). El checkpoint ocupa ~46 GB porque incluye parametros sombreados mas los momentos del optimizador AdamW |
| Parametros activos | No aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | 65.536 tokens (`seq_len: 65536` en la configuracion de reanudacion); el modelo exportado se distribuye como 64K |
| Tipos de cuantizacion | No aplica. Es un checkpoint DCP en la precision del entrenamiento; no hay GGUF, AWQ, GPTQ ni safetensors en el repositorio |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | PyTorch Distributed Checkpoint (DCP): 4 shards `__0_0.distcp` ... `__3_0.distcp` (~12,3 GB cada uno), `.metadata` (1,25 MB) y `meta.json` (~1 KB) |

Datos adicionales del repositorio: autor `mkd-hossain`, libreria `pytorch`, tamano del repo 49,2 GB, 0 descargas, 0 likes, creado y actualizado el 2026-09-12. Etiquetas: `training-state`, `not-a-model`, `fsdp`, `region:us`.

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo: el repositorio es un estado de entrenamiento, no una model card de arquitectura. Lo que si se documenta es el procedimiento: continued pretraining de `Qwen/Qwen3-8B-Base` (obra derivada de Alibaba Cloud) por parte de MKD Co., Ltd., con una fase 5 dedicada a la extension de contexto de 32K a 64K tokens. Esta fase arranco desde `exports/full/step_0010000` de un CPT anterior de 41B tokens y consumio 2.500.853.760 tokens adicionales hasta el step final 795/795, con un learning rate de 1,0e-06 al cierre de la decaida WSD (warmup-stable-decay).

La configuracion de reanudacion incrustada en `meta.json` es: `world_size: 4`, `micro_bsz: 1`, `grad_accum: 12` y `seq_len: 65536`, lo que da un lote global de 3.145.728 tokens por paso. El entrenamiento se ejecuto con FSDP sobre 4 rangos y exige `fused_linear_cross_entropy: true`: sin esa optimizacion, el run agota memoria al intentar una asignacion de logits en fp32 de 37,09 GiB con secuencia de 65.536 y `micro_bsz` ya fijado a 1. El estado del optimizador (aproximadamente 30 GB de los ~46 GB) es lo que hace posible reanudar sin reiniciar los estimadores de momento de Adam; descartarlo y partir de los pesos exportados los resetearia. El registro de auditoria completo esta en el repositorio de GitHub del proyecto, bajo `CPT_details/`.

## Capacidades

- Este repositorio no ofrece capacidades de inferencia: no es cargable con `from_pretrained()` ni con runners estandar.
- Lo que permite es reanudar entrenamiento de forma exacta, conservando parametros, momentos de AdamW, estado del LR scheduler y configuracion completa.
- Continuacion de continued pretraining sobre el mismo corpus y con el mismo `world_size` de 4 rangos.
- Auditoria de procedencia y trazabilidad de un modelo derivado de Qwen3-8B-Base.
- Analisis del estado del optimizador para estudiar el efecto de la extension de contexto 32K -> 64K.
- Generacion de texto, razonamiento, codigo, matematicas, tool calling, capacidades multilingues o modo de pensamiento: no disponibles para este artefacto; corresponden al modelo exportado `mkd-hossain/Keural-Cortex-8B-64K`, cuya model card no forma parte de la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible para este artefacto.

## Casos de uso

- Reproducibilidad de experimentos: reanudar el entrenamiento exactamente en el step 795/795 cargando los 4 shards DCP con FSDP y la configuracion de `meta.json`, util para verificar resultados publicados.
- Investigacion sobre extension de contexto: analizar los momentos de AdamW y el estado final para estudiar que cambios de pesos produce el paso de 32K a 64K tokens en un transformer de ~8B.
- Ablaciones controladas: partir de este estado y aplicar variaciones de learning rate o de composicion de datos manteniendo identicas las estimaciones de momento, algo imposible si se parte de pesos exportados.
- Estudio del scheduler WSD: inspeccionar el estado del LR scheduler en el punto final de decaida (1,0e-06) para calibrar curvas de decaida en fases posteriores.
- Desarrollo de tooling de conversion: usar el checkpoint DCP de 4 rangos como caso de prueba realista para escribir o validar utilidades de resharding y de conversion DCP -> safetensors.
- Forense y verificacion de procedencia: contrastar los pesos archivados con los del modelo exportado para auditar que la publicacion deriva efectivamente del CPT declarado.
- Docencia e ingenieria de plataforma: ejemplo documentado de un estado FSDP con `fused_linear_cross_entropy` obligatorio, lote global de 3,1M tokens y restriccion de `world_size`, para formar equipos en entrenamiento distribuido a secuencias largas.
- Reanudacion de un CPT con otro corpus: tecnicamente posible, pero requiere un reshard DCP y el manifiesto de datos original, que no esta incluido en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para el estado de entrenamiento ni para el modelo exportado derivado.

## Requisitos de hardware

- VRAM para inferencia: no aplica; este repositorio no ejecuta inferencia.
- VRAM para reanudar entrenamiento: el autor no publica cifras. Como referencia derivada de los datos disponibles, cada shard pesa ~12,3 GB y el estado del optimizador ronda los 30 GB del total de ~46 GB, distribuidos entre 4 rangos FSDP.
- GPU recomendadas: no indicadas por el autor. Por el volumen de estado por rango y la asignacion de logits en fp32 de 37,09 GiB descrita a `seq_len` 65.536, el escenario realista es de 4 aceleradores de gama alta con memoria abundante (clase 80 GB); se trata de una estimacion, no de un requisito publicado ni verificado.
- GPU de consumo: no es viable reanudar el entrenamiento en GPUs de consumo; el repositorio completo ocupa 49,2 GB y el estado no esta pensado para cargarse en una sola GPU. Para inferencia en hardware de consumo habria que acudir al modelo exportado y a una cuantizacion, fuera del alcance de este repositorio.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI no son aplicables a este artefacto. El consumo requiere el stack de PyTorch con FSDP y el cargador de Distributed Checkpoint.
- Latencia y throughput: no disponibles. La model card solo documenta el coste de entrenamiento (lote global de 3.145.728 tokens por paso).

## Comparativa con modelos similares

No se dispone de informacion sobre otros repositorios de estado de entrenamiento comparables. La comparacion mas util es contra el modelo base y el modelo exportado del mismo proyecto.

| Modelo | Parametros | Contexto | Formato | Licencia | Uso previsto |
|---|---|---|---|---|---|
| Keural-Cortex-8B-64K-training-state | ~8B nominales + estado AdamW (~46 GB) | 65.536 tokens (entrenamiento) | DCP (4 shards) | Apache 2.0 | Reanudar entrenamiento y auditoria; no cargable para inferencia |
| mkd-hossain/Keural-Cortex-8B-64K (exportado) | ~8B nominales | 64K | No disponible en la informacion proporcionada | Apache 2.0 | Inferencia; es el artefacto que el autor recomienda |
| Qwen/Qwen3-8B-Base | ~8B (por el nombre) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Apache 2.0 (segun la model card del derivado) | Modelo base de partida del CPT |

## Limitaciones y advertencias

- El artefacto no es un modelo: `from_pretrained()` no funciona y ningun runner de inferencia estandar puede cargarlo.
- Dependencia estricta del numero de shards: fue escrito por 4 rangos FSDP y espera 4 rangos. Reanudar con otro `world_size` exige un reshard DCP previo.
- Dependencia del corpus: `meta.json` incrusta la ruta del manifiesto de datos, pero ese corpus no forma parte del repositorio, por lo que la reanudacion no es autocontenida.
- `fused_linear_cross_entropy` no es opcional a esta longitud de secuencia: sin el, el entrenamiento agota memoria por la asignacion de logits en fp32 de 37,09 GiB con `micro_bsz: 1`.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, razonamiento o codigo en la informacion disponible.
- Idiomas soportados no declarados: se desconoce la cobertura linguistica real del CPT.
- Sesgos y riesgo de alucinacion: no documentados en la informacion disponible; al ser un CPT sobre Qwen3-8B-Base, heredaria los del modelo base, pero no hay evaluacion publicada en este repositorio.
- Licencia Apache 2.0 heredada del modelo base, con la salvedad de que la obra es derivada de Qwen3-8B-Base de Alibaba Cloud; conviene revisar los terminos del modelo original antes de un uso comercial.
- Metricas de adopcion nulas en el momento de la consulta (0 descargas, 0 likes) y fechas de creacion y actualizacion de 2026-09-12, con apenas 19 minutos entre ambas: no hay validacion externa de la comunidad.
- El repositorio ocupa 49,2 GB, lo que encarece almacenamiento, copia y transferencia frente a los ~16 GB del modelo exportado.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/mkd-hossain/Keural-Cortex-8B-64K-training-state
- Modelo exportado recomendado por el autor: https://huggingface.co/mkd-hossain/Keural-Cortex-8B-64K
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Registro de auditoria del proyecto (incluye `CPT_details/`): https://github.com/MKD-CORP/Keural-Cortex-8B
- La busqueda web realizada no devolvio enlaces relevantes para este repositorio; los resultados obtenidos correspondian a contenido no relacionado con el modelo.
