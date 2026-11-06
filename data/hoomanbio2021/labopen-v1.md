# HoomanBio2021/LabOpen-v1

## Resumen

LabOpen-v1 es un ajuste fino por dominios cientificos del modelo Qwen3.8-27B-FP8, desarrollado por el usuario HoomanBio2021. El modelo parte de la base Qwen3.8-27B en su version cuantizada en FP8 (licencia Apache 2.0) y anade seis dominios de capacidad verificable: fisica de fluidos, leyes de mezclas de materiales, genetica clasica, consultas de acciones en operaciones, estilo de prosa y codificacion agentica. Se distribuye tanto como pesos completos fusionados en FP8 (sustitucion directa del modelo base) como en forma de adaptador LoRA de 112 MB.

La relevancia del proyecto reside en su metodologia de entrenamiento: 15 ventanas de refuerzo (G69-G84) con LoRA de rango 4 y aprendizaje por refuerzo de grupo relativo (estilo RLOO, k=8 muestras) usando recompensas verificables mecanicamente. El resultado mas destacado es la mejora en codificacion agentica, que pasa del 32% al 72% (+40 puntos porcentuales) en una bateria determinista de 78 pruebas, acercandose a modelos frontera como GLM 5.3 (73%) o Qwen3.8-max (69%) con solo 27.781 millones de parametros.

El modelo esta orientado a universidades, institutos de investigacion y centros de I+D corporativos que necesiten despliegue local o privado en GPUs NVIDIA con capacidad de computo igual o superior a 8.9 (H100, L40S, B200, DGX GB10). Su tamano de repositorio es de 31,0 GB en FP8 y conserva las capacidades nativas del modelo base: generacion de codigo, function calling, comprension de intenciones y renderizado de formulas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B), ajuste fino con LoRA r=4 |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (blockwise-FP8 re-cuantizado en los pesos fusionados); adaptador LoRA en PEFT |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (7 shards + indice), adaptador PEFT (992 tensores, 112 MB) |

## Arquitectura y entrenamiento

LabOpen-v1 se construye sobre Qwen3.8-27B-FP8, un transformer de 27.781 millones de parametros. El ajuste se realiza mediante LoRA de rango 4 (992 tensores, 112 MB) entrenado con aprendizaje por refuerzo de grupo relativo estilo RLOO, con k=8 muestras por prompt y recompensas verificables mecanicamente. El entrenamiento comprende 15 ventanas de refuerzo (G69-G84) sobre seis dominios: fisica de fluidos (CFM), leyes de mezclas de materiales, genetica clasica, consultas de acciones en operaciones, estilo de prosa y codificacion agentica.

Los pesos distribuidos como modelo principal son los pesos completos fusionados (base + LoRA) re-cuantizados en FP8 por bloques, con el mismo layout de tensores y formato de cuantizacion que el modelo base, lo que permite su uso como sustituto directo. El repositorio incluye un informe de fusion (MERGE_REPORT.md) con digests, SHA-256 de cada shard, estadisticas de error de re-cuantizacion y pruebas de equivalencia de salida, ademas de EVALUATION.md y USAGE.md con la matriz de capacidades y guias de carga.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y chino.
- Codificacion agentica: resolucion de tareas de codigo con ciclos de correccion de 3 rondas (72% en bateria determinista de 78 pruebas).
- Function calling y comprension de intenciones (8/10 en sonda de intencion profunda de 10 escenarios).
- Renderizado de formulas en LaTeX con integridad verificada (5/5 problemas).
- Fisica de fluidos: resolucion de problemas de mecanica de fluidos computacional (CFM).
- Leyes de mezclas de materiales: calculo de propiedades de mezclas segun leyes de mezcla.
- Genetica clasica: resolucion de problemas de herencia genetica (79% en conjunto retenido de 20 items).
- Consultas de acciones en operaciones: interpretacion de acciones en entornos operativos (4/8 a T=0.3, 5/8 a T=0.8).
- Estilo de prosa: generacion de texto con estilo controlado (75% any-correct en 20 prompts abiertos).
- Capacidades nativas del modelo base preservadas: generacion de codigo, comprension de intenciones y function calling.

## Casos de uso

- Codificacion agentica en produccion: el modelo puede integrarse en pipelines de CI/CD para resolver tareas de codigo con ciclos de correccion automatica, aprovechando su 72% de exito en la bateria determinista de 78 pruebas y su soporte de function calling para invocar herramientas externas.
- Asistencia en investigacion en fisica de fluidos: resolucion de problemas de mecanica de fluidos computacional (CFM) con recompensas verificables, adecuado para laboratorios que necesiten validacion automatica de resultados numericos.
- Calculo de propiedades de materiales: aplicacion de leyes de mezclas para estimar propiedades de materiales compuestos, con un 32% de aciertos en el conjunto retenido de 40 items en protocolo sin etiquetas y 17/40 en protocolo estricto.
- Analisis genetico clasico: resolucion de problemas de herencia y cruces geneticos, con un 79% de aciertos en el conjunto retenido de 20 items, util para docencia e investigacion en genetica.
- Automatizacion de operaciones: interpretacion de consultas de acciones en entornos operativos, con capacidad de distinguir acciones nulas y validas (4/8 en protocolo estricto), adecuado para sistemas de gestion de incidencias.
- Generacion de documentacion cientifica con estilo controlado: produccion de prosa tecnica con estilo consistente (75% any-correct en 20 prompts abiertos), util para redaccion de informes y articulos.
- Despliegue local en entornos de investigacion: al caber en ~31 GB en FP8 y requerir GPUs con capacidad de computo >= 8.9, permite ejecucion privada en H100, L40S, B200 o DGX GB10 sin depender de APIs externas.

## Benchmarks y rendimiento

Matriz de capacidades medida en conjuntos retenidos (segun EVALUATION.md del autor):

| Dominio | Metrica | Puntuacion | vs Base |
|---|---|---|---|
| Codificacion agentica | 78 pruebas deterministas, 3 rondas de correccion | 72% (56/78) | +40 pp (base: 32%) |
| Comprension de intenciones | Sonda de intencion profunda de 10 escenarios | 8/10 | preservado |
| Renderizado de formulas | Integridad LaTeX, 5 problemas | 5/5 | preservado |
| Fisica de fluidos (CFM) | Pool-B retenido, T=0.3 k=8, etiquetado | 44% de muestras | nuevo (base ≈ 0) |
| Materiales (leyes de mezclas) | Retenido 40 items, T=0.3, sin etiquetas | 32% de muestras | nuevo (base ≈ 0) |
| Genetica clasica | Retenido 20 items, etiquetado | 79% de muestras | nuevo (base: 47% natural) |
| Operaciones (consultas de acciones) | 8 items, doble temperatura | 4/8 (T=0.3) – 5/8 (T=0.8) | nuevo |
| Estilo de prosa | 20 prompts abiertos, T=0.3 k=8 | 75% any-correct | nuevo |

Comparativa externa en la misma bateria (2026-10):

| Modelo | Intencion | Pruebas agenticas | Ranking |
|---|---|---|---|
| GLM 5.3 | 8/10 | 57/78 (73%) | #1 |
| LabOpen v1 | 8/10 | 56/78 (72%) | #2 |
| Qwen3.8-max | 8/10 | 54/78 (69%) | #3 |
| DeepSeek v4.1 flash | 6/10 | 48/78 (62%) | #4 |
| Qwen3.8-27B (base) | 8/10 | 25/78 (32%) | #5 |

Comparativa de dominios con modelos frontera (zero-shot, k=8, T=0.3, any-correct):

| Dominio (items) | GLM 5.3 | Qwen3.8-max | DeepSeek flash | LabOpen v1 | Base |
|---|---|---|---|---|---|
| Fisica de fluidos (36) | 36/36 | 36/36 | 35/36 | 25/36 | ≈0 |
| Materiales estricto (40) | 1/40 | 0/40 | 0/40 | 17/40 | ≈0 |
| Materiales justo 1% (40) | 20/40 | 15/40 | 22/40 | 18/40 | — |
| Genetica clasica (20) | 9/20 | 12/20 | 7/20 | 20/20 | 47% |
| Operaciones estricto (8) | 0/8 | 0/8 | 0/8 | 4/8 (T=0.3) | 0/8 |
| Operaciones accion nula equivalente (8) | 4/8 | 0/8 | 3/8 | 4/8 | — |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 31 GB en FP8 para los pesos completos fusionados.
- GPUs recomendadas: NVIDIA con capacidad de computo >= 8.9, es decir, H100, L40S, B200 o DGX GB10.
- Cabe en GPU de consumo: no disponible segun la informacion proporcionada; el requisito de capacidad de computo >= 8.9 excluye generaciones anteriores a Ada Lovelace/Hopper.
- Opciones de despliegue: vLLM y SGLang para los pesos fusionados; el adaptador LoRA (112 MB) puede servirse sobre el modelo base con PEFT cuando se requiera la numerica exacta de entrenamiento.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Codificacion agentica (78 pruebas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LabOpen v1 | 27,78 B | no disponible | 56/78 (72%) | Apache 2.0 | Hugging Face (620 descargas) |
| Qwen3.8-27B (base) | 27,78 B | no disponible | 25/78 (32%) | Apache 2.0 | Hugging Face |
| GLM 5.3 | no disponible | no disponible | 57/78 (73%) | no disponible | no disponible |
| Qwen3.8-max | no disponible | no disponible | 54/78 (69%) | no disponible | no disponible |
| DeepSeek v4.1 flash | no disponible | no disponible | 48/78 (62%) | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo declara soporte para ingles y chino; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; las recompensas verificables del entrenamiento no eliminan errores en dominios fuera de los seis entrenados.
- En fisica de fluidos, el modelo obtiene 25/36 frente a 36/36 de GLM 5.3 y Qwen3.8-max, lo que indica una brecha significativa en ese dominio frente a modelos frontera.
- En operaciones, el protocolo estricto revela un fallo genuino: los modelos frontera sustituyen la accion nula por vocabulario privado del dominio; el modelo no alcanza el 100% ni siquiera en el protocolo de accion nula equivalente (4/8).
- La tasa de exito en primera pasada de codificacion agentica es inferior a la tasa final con 3 rondas de correccion; el dato del 72% incluye ciclos de correccion.
- El conocimiento general del modelo es inferior al de modelos de 100B+ parametros, segun reconoce el propio autor en EVALUATION.md.
- Requiere GPUs con capacidad de computo >= 8.9; no es desplegable en GPUs consumer de generaciones anteriores.
- El adaptador LoRA tiene rango 4 (992 tensores), lo que limita la magnitud de los cambios aprendidos respecto al modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se posiciona como modelo de investigacion; no hay garantias de soporte ni mantenimiento.
- El repositorio tiene solo 620 descargas y 1 like, lo que indica una validacion externa limitada por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HoomanBio2021/LabOpen-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
