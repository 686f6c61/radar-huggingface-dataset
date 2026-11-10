# erdem-erdem/dyn-spec-dflash-d2-static-lora-attn-r32-4k-1500-layer4

## Resumen

Este repositorio contiene un checkpoint de entrenamiento del denominado "DFlash drafter", un modelo auxiliar (drafter) disenado para decodificacion especulativa sobre el modelo objetivo Qwen/Qwen3-8B. Lo desarrolla el usuario erdem-erdem dentro del ecosistema dyn-spec y del proyecto DFlash, y se corresponde con el brazo `fresh_lora` de una ejecucion de adaptacion mediante LoRA sobre un drafter preentrenado (`z-lab/Qwen3-8B-DFlash-b16`). No es un modelo generativo autonomo, sino un artefacto de entrenamiento pensado para acelerar la inferencia del modelo objetivo prediciendo varios tokens a la vez.

El entrenamiento se realizo sobre un almacen de activaciones (`dyn-spec-dflash-store-qwen3-8b-4k`) con 1500 actualizaciones, semilla 42 y LoRA de rango 32 sobre capas de atencion, con una ventana de contexto de 4k. El checkpoint incluye estado del optimizador, metricas, evaluaciones offline y procedencia completa (identidad del store, registros de extraccion y trazabilidad del lanzamiento de vLLM).

Es relevante porque documenta de forma exhaustiva un experimento de decodificacion especulativa con trazabilidad completa, pero debe subrayarse que se trata de un checkpoint de investigacion y no de un paquete listo para servir: la exportacion de servicio de DFlash aun no esta portada. El repositorio ocupa 0.0 GB, no registra descargas ni likes y no declara licencia, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer drafter para decodificacion especulativa (DFlash), adaptado con LoRA de rango 32 sobre capas de atencion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4k (indicado en el nombre del checkpoint: `4k`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `checkpoint.pt` (PyTorch, con estado del optimizador); no es un bundle de servicio |

## Arquitectura y entrenamiento

El artefacto es un drafter de decodificacion especulativa construido sobre el modelo `z-lab/Qwen3-8B-DFlash-b16` (commit `9b41424b7109f9c5413454f481b09a82b85333f4`), cuyo objetivo es Qwen/Qwen3-8B. La adaptacion se realiza mediante LoRA de rango 32 aplicada a las capas de atencion, en el brazo `fresh_lora` y la etapa `pretraining`, durante 1500 actualizaciones con semilla 42. El entrenamiento consume activaciones preextraidas del store `erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k`, lo que evita recalcular las pasadas del modelo objetivo durante el ajuste.

La innovacion principal no reside en la arquitectura del drafter en si, sino en el pipeline de experimentacion: el repositorio incluye el comando de entrenamiento, un parche `speculators.patch`, metricas de tiempo, procedencia del store y del lanzamiento de vLLM, y evaluaciones offline con coeficientes M4, donantes M7, similitud D13 y coste D14. No se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Prediccion especulativa de tokens para acelerar la decodificacion del modelo objetivo Qwen/Qwen3-8B.
- Generacion de borradores (drafts) de varios tokens por paso, validados posteriormente por el modelo objetivo.
- Adaptacion mediante LoRA sobre capas de atencion con rango 32.
- Trazabilidad completa del entrenamiento: checkpoints, metricas, procedencia y evaluaciones offline.
- No es un modelo de chat, codigo, matematicas ni vision por si mismo; su funcion es auxiliar la inferencia del modelo objetivo.
- No se documenta soporte de tool calling, agentes, multilingueismo ni modos especiales de razonamiento.

## Casos de uso

- Aceleracion de inferencia de Qwen3-8B en produccion: el drafter predice varios tokens por paso y el modelo objetivo los verifica, reduciendo el numero de pasadas del modelo grande; encaja en despliegues con vLLM.
- Investigacion en decodificacion especulativa: el repositorio permite reproducir el experimento gracias al comando de entrenamiento, el parche y la procedencia registrada.
- Ajuste fino de drafters sobre activaciones preextraidas: el uso del store `dyn-spec-dflash-store-qwen3-8b-4k` permite iterar sobre el drafter sin recalcular las activaciones del modelo objetivo.
- Evaluacion comparativa de estrategias de drafter: las metricas de validacion (full_acc, τ eal, chat, code, math, stem) permiten comparar brazos y etapas del mismo pipeline.
- Auditoria de experimentos: el `MANIFEST.json` con tamano y SHA256 de cada fichero, junto con el SHA del checkpoint, facilita la verificacion de integridad en entornos de investigacion.
- Base para portar la exportacion de servicio de DFlash: el checkpoint sirve como punto de partida para completar el bundle de servicio aun no portado.

## Benchmarks y rendimiento

Validacion sobre 200 filas fijas, una fila por LoRA, metrica `full_acc`:

| Update | Score | τ (eal) | chat | code | math | stem |
|---|---|---|---|---|---|---|
| 0 | 0.5246 | 7.108 | 0.3383 | 0.5699 | 0.6796 | 0.5105 |
| 1500 | 0.5258 | 7.157 | 0.3396 | 0.5713 | 0.6805 | 0.5119 |

La mejora entre la actualizacion 0 y la 1500 es marginal (0.0012 en score, 0.049 en τ), lo que sugiere una meseta temprana en el entrenamiento. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el checkpoint incluye estado del optimizador y no es un bundle de servicio.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el pipeline de referencia usa vLLM (se registra procedencia de su lanzamiento), pero la exportacion de servicio de DFlash no esta portada.
- Latencia y throughput: no disponibles; las metricas de tiempo del entrenamiento estan en `timing.json`, pero no se reportan cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dyn-spec-dflash-d2-static-lora-attn-r32-4k-1500-layer4 | no disponible | 4k | Drafter especulativo sobre Qwen3-8B | no disponible | Checkpoint de investigacion, no servible |
| z-lab/Qwen3-8B-DFlash-b16 | no disponible | no disponible | Drafter DFlash base | no disponible | Repositorio publico en Hugging Face |
| Qwen/Qwen3-8B | 8B | no disponible | Modelo objetivo generativo | no disponible | Repositorio publico en Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: solo funciona como drafter auxiliar de Qwen/Qwen3-8B; no debe usarse para generacion directa.
- No es un bundle de servicio: la exportacion de servicio de DFlash aun no esta portada, por lo que no puede desplegarse tal cual.
- El checkpoint incluye estado del optimizador, lo que incrementa el tamano y no es adecuado para inferencia directa sin conversion.
- Licencia no declarada: no hay autorizacion explicita para uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas y pipeline no declarados: no hay garantia documentada de cobertura multilingue.
- La mejora medida entre la actualizacion 0 y la 1500 es marginal, lo que cuestiona la utilidad practica del ajuste en este brazo.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validacion por parte de la comunidad.
- Riesgo de sesgos y alucinaciones: no evaluado en la informacion disponible; al ser un drafter, los sesgos del modelo objetivo se heredarian en la verificacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/erdem-erdem/dyn-spec-dflash-d2-static-lora-attn-r32-4k-1500-layer4
- Store de activaciones: https://huggingface.co/datasets/erdem-erdem/dyn-spec-dflash-store-qwen3-8b-4k
- Drafter base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3-8B
