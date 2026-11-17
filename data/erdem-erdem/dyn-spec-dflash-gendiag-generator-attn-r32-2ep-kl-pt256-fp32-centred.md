# erdem-erdem/dyn-spec-dflash-gendiag-generator-attn-r32-2ep-kl-pt256-fp32-centred

## Resumen

Este repositorio contiene un checkpoint de entrenamiento de un *drafter* de decodificacion especulativa para el modelo objetivo Qwen/Qwen3-8B. No es un modelo generativo autonomo, sino un adaptador LoRA (rango 32) que se acopla a un drafter DFlash preexistente (`z-lab/Qwen3-8B-DFlash-b16`) para acelerar la inferencia del modelo base mediante decodificacion especulativa. Lo publica el usuario erdem-erdem dentro del ecosistema de herramientas `speculators`, y forma parte de una ejecucion de adaptacion denominada `dyn-spec` en su brazo `direct`, etapa de pretraining.

El entrenamiento se realizo sobre un almacen de activaciones (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k`) y consta de 2667 actualizaciones con semilla 42. La validacion sobre 200 filas fijas muestra una mejora marginal del score `full_acc` de 0.5265 a 0.5342, con un incremento del factor de aceptacion tau (eal) de 7.703 a 7.904. Estos numeros indican que el adaptador aporta una mejora modesta pero medible en la tasa de aceptacion del drafter.

Es relevante ahora porque documenta de forma reproducible (SHA de git, SHA256 de checkpoint, provenance del almacen de activaciones y comandos de entrenamiento) un experimento de optimizacion de decodificacion especulativa sobre Qwen3-8B. No obstante, el autor advierte explicitamente de que se trata de un checkpoint de entrenamiento con estado del optimizador, no de un paquete listo para servir: el export de serving de DFlash aun no esta portado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32) sobre drafter DFlash de decodificacion especulativa |
| Parametros totales | no disponible (adaptador LoRA r32; el drafter base es `z-lab/Qwen3-8B-DFlash-b16`) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch, con estado del optimizador) |
| Modelo objetivo | Qwen/Qwen3-8B |
| Drafter base | `z-lab/Qwen3-8B-DFlash-b16@9b41424b7109f9c5413454f481b09a82b85333f4` |
| Brazo / etapa | `direct` / `pretraining` |
| Actualizaciones | 2667 |
| Semilla | 42 |
| Tamano del repo | 2.8 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 entrenado sobre un drafter DFlash, que a su vez es un modelo auxiliar de decodificacion especulativa disenado para proponer tokens que el modelo objetivo Qwen3-8B verifica en paralelo. La arquitectura subyacente del drafter es de tipo transformer (DFlash), pero la ficha no detalla su configuracion interna (capas, dimensiones, cabezas). El entrenamiento se realizo en la etapa de pretraining del brazo `direct` del port `dyn-spec`, durante 2667 actualizaciones, con semilla 42 y un identificador de git concreto (`6ab4431998b80488f7faf2e959d1155fb7620177`).

Los datos de entrenamiento provienen del almacen de activaciones `erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k`, cuya identidad y registros de extraccion, lanzamiento de vLLM y relleno quedan documentados en `provenance/store/`. El nombre del artefacto sugiere el uso de una funcion de perdida KL (`kl`), una temperatura o presupuesto de tokens de 256 (`pt256`) y calculo en fp32 con centrado (`fp32-centred`), aunque la model card no desarrolla estos hiperparametros. El checkpoint incluye estado del optimizador, lo que explica el tamano de 2.8 GB. No se documentan tecnicas como RLHF o DPO; el objetivo es la adaptacion del drafter, no el alineamiento del modelo generativo.

## Capacidades

- Aceleracion de inferencia de Qwen3-8B mediante decodificacion especulativa: el adaptador mejora la tasa de aceptacion del drafter DFlash.
- Generacion de borradores de tokens (drafting) para verificacion paralela por el modelo objetivo.
- Entrenamiento reproducible: incluye `train_command.txt`, `speculators.patch`, `result.json`, `metrics.json` y `timing.json`.
- Evaluacion offline documentada en `run/offline_eval/` con metricas por fila (reproduccion, coeficientes M4, donantes M7, similitud D13, coste D14).
- No es un modelo de chat, razonamiento, codigo ni vision por si mismo; hereda las capacidades del modelo objetivo solo como acelerador.
- No soporta tool calling, agentes ni capacidades multilingues de forma autonoma.
- No dispone de modo thinking ni de entrada multimodal.

## Casos de uso

- Aceleracion de serving de Qwen3-8B: integrar el drafter adaptado en un pipeline de decodificacion especulativa para reducir la latencia por token en produccion, siempre que se complete el export de serving pendiente.
- Investigacion en decodificacion especulativa: reproducir el experimento `dyn-spec` con la semilla 42 y el SHA de git documentados para validar los resultados de aceptacion reportados.
- Ajuste fino de drafters sobre almacenes de activaciones: reutilizar el almacen `mix24k` y la receta LoRA r32 como base para nuevos experimentos de adaptacion.
- Benchmarking de tasas de aceptacion: emplear las 200 filas fijas de validacion para comparar variantes de drafter con metricas `full_acc` y tau (eal).
- Auditoria de provenance: usar `MANIFEST.json` y `provenance/store/` para verificar integridad y trazabilidad de un checkpoint en entornos de investigacion regulada.
- Estudio de sensibilidad a hiperparametros: el nombre del artefacto codifica variantes (r32, 2ep, kl, pt256, fp32-centred) utiles para analisis comparativos entre configuraciones.

## Benchmarks y rendimiento

| Actualizacion | full_acc | tau (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5265 | 7.703 | 0.3463 | 0.5956 | 0.6775 | 0.4866 |
| 2667 | 0.5342 | 7.904 | 0.3523 | 0.6063 | 0.6842 | 0.4940 |

Validacion sobre 200 filas fijas, una fila por LoRA. No se han publicado resultados comparativos con otros drafters en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del drafter base y del modelo objetivo Qwen3-8B, no del adaptador LoRA.
- GPU recomendadas: no disponible en la model card; el entrenamiento uso vLLM (provenance de lanzamiento documentada), lo que sugiere GPUs de datacenter.
- Compatibilidad con GPU de consumo: no confirmada; el checkpoint es de entrenamiento (2.8 GB con estado del optimizador), no un bundle de serving.
- Opciones de despliegue: el export de serving DFlash no esta portado; vLLM aparece en la provenance del entrenamiento, pero no se garantiza su uso para inferencia del adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Este artefacto (dyn-spec DFlash LoRA r32) | Adaptador LoRA para drafter especulativo | no disponible (r32) | no disponible | no disponible | Checkpoint de entrenamiento |
| `z-lab/Qwen3-8B-DFlash-b16` | Drafter DFlash base | no disponible | no disponible | no disponible | Modelo publicado |
| Qwen/Qwen3-8B | Modelo objetivo | 8B | no disponible | no disponible | Modelo publicado |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo listo para produccion: es un checkpoint de entrenamiento con estado del optimizador y el export de serving DFlash no esta portado.
- La mejora medida es marginal: `full_acc` pasa de 0.5265 a 0.5342 y tau de 7.703 a 7.904, por lo que el beneficio practico puede ser limitado.
- Licencia no especificada: no se puede confirmar el uso comercial ni las restricciones de redistribucion.
- Idiomas no declarados: no hay garantia de cobertura multilingue.
- Sin datos de sesgos, alucinacion o robustez; al ser un acelerador, hereda los riesgos del modelo objetivo Qwen3-8B.
- Dependencia estricta de versiones: el drafter base esta fijado a un commit concreto y el entrenamiento a un SHA de git especifico; desviarse puede invalidar la reproducibilidad.
- Cero descargas y cero likes en el momento de la consulta: ausencia de validacion externa por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-gendiag-generator-attn-r32-2ep-kl-pt256-fp32-centred
- Almacen de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k
- Drafter base: `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`)
- Modelo objetivo: Qwen/Qwen3-8B
- Paper, blog, repositorio o demo: no disponibles en la informacion proporcionada.
