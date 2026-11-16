# erdem-erdem/dyn-spec-dflash-gendiag-generator-attn-r32-2ep-kl-pm256

## Resumen

`gendiag-generator-attn-r32-2ep-kl-pm256` es un checkpoint de entrenamiento de un drafter de decodificacion especulativa (speculative decoding) desarrollado por el usuario erdem-erdem. No se trata de un modelo de lenguaje autonomo, sino de un adaptador LoRA (rango 32) entrenado para actuar como cabecera de prediccion de tokens sobre el modelo `z-lab/Qwen3-8B-DFlash-b16`, que a su vez tiene como modelo objetivo `Qwen/Qwen3-8B`. El artefacto forma parte de una linea de trabajo denominada dyn-spec, orientada a la adaptacion de drafters DFlash mediante entrenamiento directo sobre tiendas de activaciones.

El repositorio contiene un checkpoint de entrenamiento con estado del optimizador, resultados de validacion, evaluaciones offline y trazabilidad completa del proceso (provenance). Segun la model card, no es un paquete listo para servir: la exportacion de servicio DFlash aun no esta portada. El entrenamiento consta de 2667 actualizaciones con semilla 42 sobre una tienda de activaciones de 24.000 muestras mixtas derivada de Qwen3-8B.

Su relevancia es acotada pero tecnica: documenta un experimento reproducible de adaptacion de drafters para acelerar la inferencia de Qwen3-8B mediante decodificacion especulativa, con metricas de aceptacion de tokens (full_acc y τ) antes y despues del entrenamiento. El tamano del repositorio (6,6 GB) corresponde principalmente al checkpoint con estado del optimizador, no a pesos de un modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32) sobre drafter DFlash `z-lab/Qwen3-8B-DFlash-b16`; modelo objetivo `Qwen/Qwen3-8B` |
| Parametros totales | no disponible (repo de 6,6 GB, incluye estado del optimizador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch), con `result.json`, `metrics.json`, `timing.json` y `MANIFEST.json` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 entrenado sobre el drafter DFlash `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`), cuyo modelo objetivo es `Qwen/Qwen3-8B`. La etapa corresponde al brazo `direct` y a la fase de `pretraining`, con 2667 actualizaciones, semilla 42 y SHA de git `f84eec7564fe740492fbbb6facebcd3dd6288523`. El entrenamiento consume una tienda de activaciones publicada como dataset (`erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k`), lo que permite reproducir el proceso sin reejecutar el modelo objetivo.

La model card no detalla la composicion exacta del dataset, el numero de tokens vistos ni si hubo tecnicas de alineacion adicionales (RLHF/DPO). El nombre del experimento sugiere el uso de una perdida KL (`kl`) con un parametro `pm256`, pero la documentacion disponible no especifica su formulacion. El checkpoint incluye estado del optimizador y trazabilidad de la tienda de activaciones (registro del extractor, procedencia del lanzamiento de vLLM y registros de llenado), lo que facilita la auditoria del experimento.

## Capacidades

- No es un modelo generativo autonomo: actua como drafter de decodificacion especulativa para acelerar la inferencia de `Qwen/Qwen3-8B`.
- Predice tokens candidatos que el modelo objetivo verifica, con el objetivo de aumentar la tasa de aceptacion.
- Entrenado sobre una mezcla de dominios (chat, code, math, stem) segun las metricas de validacion desglosadas.
- Soporte de tool calling: no disponible (depende del modelo objetivo, no del drafter).
- Soporte de agentes y razonamiento multi-paso: no disponible (depende del modelo objetivo).
- Capacidades multilingues: no disponibles (no se documentan).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Aceleracion de inferencia de Qwen3-8B en produccion: el drafter se combina con el modelo objetivo para reducir la latencia por token mediante decodificacion especulativa, siempre que se complete la exportacion de servicio DFlash (no incluida en este repositorio).
- Investigacion en decodificacion especulativa: el checkpoint y la tienda de activaciones permiten reproducir el experimento y comparar estrategias de adaptacion de drafters.
- Evaluacion de tecnicas de adaptacion LoRA para drafters: el repositorio incluye metricas de validacion antes y despues del entrenamiento (full_acc de 0,5265 a 0,5348; τ de 7,703 a 7,903), utiles para estudiar la ganancia marginal del ajuste.
- Auditoria de pipelines de entrenamiento: la trazabilidad completa (MANIFEST con SHA256, provenance de la tienda, comandos de entrenamiento) permite verificar la integridad del experimento en entornos de investigacion reproducibles.
- Analisis por dominio de la aceptacion de tokens: las metricas desglosadas por chat, code, math y stem permiten identificar en que dominios el drafter mejora y en cuales conviene reentrenar.
- Base para futuros experimentos dyn-spec: el checkpoint sirve como punto de partida para continuar el entrenamiento o comparar con otros brazos y etapas del mismo proyecto.

## Benchmarks y rendimiento

Validacion sobre 200 filas fijas, una fila por LoRA (metrica `full_acc`):

| Actualizacion | Score | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0,5265 | 7,703 | 0,3463 | 0,5956 | 0,6775 | 0,4866 |
| 2667 | 0,5348 | 7,903 | 0,3525 | 0,6070 | 0,6843 | 0,4952 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las evaluaciones offline adicionales se encuentran en `run/offline_eval/` (reproduccion, coeficientes M4, donantes M7, similitud D13, coste D14 y metricas por fila), pero sus valores no se detallan en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el drafter de forma aislada; el modelo objetivo `Qwen/Qwen3-8B` requiere aproximadamente 16 GB en FP16, cifra no confirmada en la documentacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el repositorio no es un paquete de servicio; la exportacion DFlash para servir aun no esta portada. El entrenamiento se realizo con vLLM segun la procedencia registrada, pero no se documentan opciones de despliegue para el drafter.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gendiag-generator-attn-r32-2ep-kl-pm256` | LoRA drafter (DFlash) | no disponible | no disponible | no disponible | Hugging Face (checkpoint de entrenamiento) |
| `z-lab/Qwen3-8B-DFlash-b16` | Drafter DFlash base | no disponible | no disponible | no disponible | Hugging Face |
| `Qwen/Qwen3-8B` | LLM objetivo | 8B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos artefactos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo listo para produccion: es un checkpoint de entrenamiento con estado del optimizador y sin exportacion de servicio DFlash.
- No se especifica licencia, lo que impide determinar si el uso comercial esta permitido.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinacion del drafter; estos dependen en ultima instancia del modelo objetivo `Qwen/Qwen3-8B`.
- Las metricas de validacion se calculan sobre 200 filas fijas y una sola semilla (42), por lo que la significancia estadistica de la mejora (full_acc de +0,0083) no esta establecida.
- El nombre del experimento sugiere una perdida KL con parametro `pm256`, pero su formulacion no esta documentada.
- El repositorio incluye estado del optimizador, lo que infla el tamano (6,6 GB) y no debe confundirse con el tamano de los pesos del drafter.
- No hay garantia de compatibilidad con versiones futuras del drafter base o del modelo objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-gendiag-generator-attn-r32-2ep-kl-pm256
- Tienda de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-mix24k
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
