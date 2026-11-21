# erdem-erdem/dyn-spec-dflash-newmix100k-amb-attn-r64-3ep-kl-pt256

## Resumen

`dyn-spec-dflash-newmix100k-amb-attn-r64-3ep-kl-pt256` es un checkpoint de entrenamiento de un drafter de decodificacion especulativa (speculative decoding), publicado por el usuario erdem-erdem en Hugging Face. No se trata de un modelo de lenguaje autonomo, sino de un adaptador LoRA-generator que se acopla a un modelo objetivo (target) para proponer tokens candidatos que este ultimo valida, acelerando asi la generacion. El target declarado es Qwen/Qwen3-8B y el drafter base es `z-lab/Qwen3-8B-DFlash-b16`.

El artefacto pertenece a una campana de experimentacion denominada dyn-spec, en su variante DFlash y brazo `direct` durante la etapa de pretraining. El repositorio contiene el estado del optimizador, los resultados de validacion, evaluaciones offline y la procedencia completa del run, pero no constituye un bundle de servicio: segun la propia model card, el export de serving de DFlash no esta portado todavia.

Su relevancia es acotada y experimental: sirve como evidencia reproducible de un pipeline de entrenamiento de drafters para aceleracion de inferencia sobre Qwen3-8B, con metricas de aceptacion por dominio. No es un modelo para uso directo en produccion ni para tareas generativas por si mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA-generator sobre drafter DFlash (decodificacion especulativa); arquitectura del transformer subyacente no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch, con estado del optimizador); no es safetensors ni GGUF |
| Modelo objetivo | Qwen/Qwen3-8B |
| Drafter base | z-lab/Qwen3-8B-DFlash-b16 (commit 9b41424b7109f9c5413454f481b09a82b85333f4) |
| Rango LoRA | r64 (segun el nombre del run) |
| Epocas / updates | 3 epocas, 17000 updates |
| Semilla | 42 |
| Tamano del repo | 0.3 GB |
| SHA256 del checkpoint | de088655b5faf39c521b5c9e239a0e43818fa516674b0e83502d6620c3076226 |

## Arquitectura y entrenamiento

El objeto entrenado es un drafter de decodificacion especulativa basado en DFlash, adaptado mediante un generador LoRA de rango 64. El entrenamiento se realizo en el brazo `direct` y en la etapa de pretraining, con 17000 updates y semilla 42, sobre un dataset de activaciones denominado `newmix100k` (100 000 filas, segun la nomenclatura del run). El pipeline incluye un almacen de activaciones (`provenance/store/`) con la identidad del extractor, la procedencia del lanzamiento de vLLM y los registros de relleno (fill records), lo que permite auditar como se generaron las muestras de entrenamiento.

La innovacion tecnica principal no esta en el modelo en si, sino en la infraestructura de experimentacion: el run registra `speculators.patch`, `train_command.txt`, `timing.json` y `metrics.json`, ademas de evaluaciones offline con coeficientes M4, donantes M7, similitud D13 y coste D14, con metricas por fila. La validacion se hace sobre 200 filas fijas, una por LoRA, midiendo `full_acc` y la longitud media de aceptacion (τ, eal) desglosada por dominio (chat, code, formal, math, roleplay, science). No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Aceleracion de inferencia mediante decodificacion especulativa sobre Qwen3-8B: propone tokens candidatos que el modelo objetivo verifica.
- Generacion de borradores (drafting) condicionada a activaciones, no generacion de texto autonomo.
- Mejora medible de la tasa de aceptacion por dominio: `full_acc` global pasa de 0.4447 (update 0) a 0.4611 (update 17000) y τ de 5.987 a 6.324.
- Rendimiento por dominio en el checkpoint final: chat 0.2833, code 0.5757, formal 0.5338, math 0.6871, roleplay 0.2234, science 0.4633.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de proposito general).
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en decodificacion especulativa: reproducir el run completo a partir de `train_command.txt`, `speculators.patch` y los registros de procedencia para validar la metodologia dyn-spec sobre Qwen3-8B.
- Servicio de inferencia de baja latencia para Qwen3-8B: una vez portado el export de serving de DFlash, el drafter permitiria reducir el coste por token generado en cargas de codigo y matematicas, donde la tasa de aceptacion es mas alta (0.5757 y 0.6871).
- Ajuste fino de drafters por dominio: usar la desagregacion por dominio de la validacion para decidir en que tareas conviene desplegar el drafter y en cuales (roleplay, 0.2234) el beneficio es marginal.
- Auditoria de pipelines de entrenamiento: el repositorio documenta identidad del almacen de activaciones, extractor y lanzamiento de vLLM, util para equipos que necesitan trazabilidad completa de un experimento.
- Base para experimentos comparativos: el checkpoint con estado del optimizador permite reanudar el entrenamiento y contrastar variantes (por ejemplo, otros rangos LoRA o brazos distintos de dyn-spec).
- Evaluacion de tecnicas de compresion de contexto en drafting: los coeficientes M4 y las metricas D13/D14 del directorio `offline_eval/` sirven para estudiar el coste y la similitud de las propuestas del drafter.

## Benchmarks y rendimiento

Los unicos datos publicados son la validacion interna del run sobre 200 filas fijas (una por LoRA, metrica `full_acc`), no benchmarks estandar como MMLU, HumanEval o GSM8K.

| Update | full_acc | τ (eal) | chat | code | formal | math | roleplay | science |
|---|---|---|---|---|---|---|---|---|
| 0 | 0.4447 | 5.987 | 0.2764 | 0.5573 | 0.4909 | 0.6774 | 0.2107 | 0.4554 |
| 17000 | 0.4611 | 6.324 | 0.2833 | 0.5757 | 0.5338 | 0.6871 | 0.2234 | 0.4633 |

No se han publicado resultados de benchmarks estandar en la informacion disponible. No se dispone de comparaciones con otros drafters ni con el modelo objetivo sin aceleracion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio (0.3 GB) contiene un checkpoint de entrenamiento con estado del optimizador, no pesos listos para servir.
- El drafter debe ejecutarse junto al modelo objetivo Qwen3-8B; los requisitos de VRAM del conjunto dependen del target y de su cuantizacion, dato no especificado en la informacion disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el export de serving de DFlash no esta portado segun la model card; vLLM aparece mencionado en la procedencia del run (lanzamiento para extraccion de activaciones), no como opcion de servicio del drafter.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros drafters de decodificacion especulativa comparables ni datos de rendimiento de alternativas sobre Qwen3-8B.

## Limitaciones y advertencias

- No es un modelo de lenguaje utilizable de forma autonoma: es un drafter que requiere el target Qwen/Qwen3-8B y un runtime de decodificacion especulativa compatible.
- No es un bundle de servicio: el export de serving de DFlash no esta portado, por lo que no puede desplegarse directamente con las herramientas habituales.
- El checkpoint incluye estado del optimizador y esta en formato `checkpoint.pt`, no en safetensors ni GGUF; no es compatible con llama.cpp, Ollama u otros runners estandar sin conversion.
- Licencia no declarada: no hay autorizacion explicita para uso comercial; debe consultarse al autor antes de cualquier uso en produccion.
- Idiomas soportados no declarados: el comportamiento multilingue heredado de Qwen3-8B no esta verificado para este drafter.
- Las metricas publicadas corresponden a una validacion interna de 200 filas, no a benchmarks estandar; no deben extrapolarse a cargas reales sin evaluacion propia.
- El rendimiento en roleplay es bajo (0.2234 de `full_acc`), lo que sugiere poca utilidad del drafter en ese dominio.
- Riesgo de sesgos y alucinacion: no evaluado en la informacion disponible; el drafter hereda las distribuciones del target y del dataset de activaciones `newmix100k`, cuya composicion no se detalla.
- Repositorio sin descargas ni likes y creado en 2026-11-21: se trata de un artefacto de investigacion sin validacion externa por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-newmix100k-amb-attn-r64-3ep-kl-pt256
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Commit del drafter base: 9b41424b7109f9c5413454f481b09a82b85333f4
- Paper, blog o repositorio de dyn-spec: no disponible en la informacion proporcionada
- Demo: no disponible
