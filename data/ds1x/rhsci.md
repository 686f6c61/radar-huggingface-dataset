# ds1x/RHSCI

## Resumen

RHSCI es un repositorio de Hugging Face publicado por el usuario `ds1x` que no contiene un modelo de lenguaje en el sentido convencional, sino un archivo de checkpoints de entrenamiento de modelos de robotica y vision-lenguaje-accion (VLA). El contenido documentado en la model card corresponde a instantaneas completas de entrenamiento de dos familias de modelos: π0.5 (pi05) y GR00T, ambas orientadas a politicas de control robotico a partir de instrucciones en lenguaje natural e imagenes RGB. El repositorio ocupa 507,4 GB y esta compuesto por archivos `.tar.zst` de entre 9 y 18 GB cada uno, que incluyen pesos del modelo, estado del optimizador Adam, scheduler, estados RNG de multiples rangos y material de reproduccion.

La relevancia de este repositorio es fundamentalmente de trazabilidad y reproducibilidad de experimentos, no de inferencia directa. Cada entrada esta identificada por una variante (STATE, NO-STATE, VGQ-AE), una tarea concreta (oven, handover, faucet, between, hug) y un numero de paso (20000 o 40000), con hashes SHA256 publicados para verificar integridad. El autor indica explicitamente que los originales se conservan y que no se han realizado evaluaciones en GPU de estos checkpoints.

No se dispone de informacion sobre arquitectura, numero de parametros, contexto, licencia ni idiomas en la informacion proporcionada. La model card no describe el modelo en si, sino el inventario de checkpoints, por lo que los datos tecnicos convencionales de una ficha de LLM no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere familia VLA π0.5 y GR00T, sin detalle) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (tag del repo) y archivos `.tar.zst` con checkpoints completos |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna de los modelos. Los checkpoints pertenecen a dos familias: π0.5 (referenciada como `pi05`) y GR00T, ambas asociadas a tareas de robotica manipulativa con instrucciones en lenguaje natural. Los archivos incluyen el modelo, el estado de Adam, el scheduler y los estados RNG de ocho rangos (en el caso de π0.5) o de cuatro GPUs (en el caso de GR00T), lo que indica entrenamiento distribuido en 8 y 4 dispositivos respectivamente.

Las tareas documentadas son `oven`, `handover`, `faucet`, `between` y `hug`, con variantes de configuracion `STATE`, `NO-STATE` y `VGQ-AE`. Los pasos de entrenamiento registrados son 20000 (GR00T) y 40000 (π0.5). No se especifican numero de tokens, composicion del dataset, ni si hubo RLHF, DPO o fine-tuning por preferencias. El autor indica que no se han ejecutado evaluaciones en GPU sobre estos checkpoints.

## Capacidades

- No se documentan capacidades funcionales del modelo en la informacion disponible.
- Por la naturaleza de los checkpoints (π0.5 y GR00T, tareas oven/handover/faucet/between/hug), se trata presumiblemente de politicas de control robotico condicionadas por instrucciones e imagenes, pero no se detalla en la model card.
- No se especifica soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se especifica capacidad multilingue.
- No se especifica vision, audio ni modo thinking.

## Casos de uso

- Reproduccion de experimentos de robotica: los checkpoints incluyen optimizador, scheduler y estados RNG, lo que permite reanudar o replicar exactamente un entrenamiento en el mismo numero de GPUs documentado.
- Auditoria de integridad: los hashes SHA256 publicados permiten verificar que los archivos descargados no han sido alterados.
- Fine-tuning posterior sobre tareas especificas: partir de un checkpoint de 20k o 40k pasos en lugar de entrenar desde cero.
- Comparacion de variantes de configuracion: STATE frente a NO-STATE frente a VGQ-AE sobre la misma tarea para aislar el efecto de cada decision de diseno.
- Investigacion en VLA: usar los pesos como linea base en estudios sobre politicas de manipulacion.
- Archivado a largo plazo: el repositorio actua como copia de seguridad de experimentos con trazabilidad de version y fecha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se han realizado evaluaciones en GPU de los checkpoints.

## Requisitos de hardware

- No se dispone de datos de VRAM, latencia ni throughput.
- Los tamanos de checkpoint (entre 9,4 y 17,9 GB por archivo) incluyen estado del optimizador y RNG, por lo que el peso del modelo es inferior a esas cifras, pero no se puede desglosar con la informacion disponible.
- El entrenamiento documentado se realizo en 8 GPUs (π0.5) y 4 GPUs (GR00T), segun los estados RNG incluidos.
- Opciones de despliegue: no disponibles.
- No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

No disponible. No se dispone de datos de parametros, contexto ni rendimiento de este repositorio, ni de una descripcion suficiente para identificar alternativas comparables con rigor.

## Limitaciones y advertencias

- La model card no describe el modelo, solo el inventario de checkpoints; no debe tratarse como ficha de un LLM.
- No se han ejecutado evaluaciones en GPU, por lo que no hay garantia de que los checkpoints carguen o funcionen correctamente.
- Licencia no especificada: no se puede asumir uso comercial permitido.
- El repositorio ocupa 507,4 GB, lo que implica coste de almacenamiento y ancho de banda considerables.
- Los archivos son `.tar.zst` que requieren descompresion previa; no son cargables directamente por bibliotecas de inferencia.
- Riesgo de alucinacion, sesgos y limitaciones de contexto o idioma: no evaluables con la informacion disponible.
- Las fechas de creacion y actualizacion (2026-10-27 y 2026-11-02) son posteriores a la fecha actual de referencia, lo que conviene verificar antes de usar el repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ds1x/RHSCI
- Lista de verificacion GR00T: https://huggingface.co/ds1x/RHSCI/blob/main/checkpoint/_handoff/20261029-gr00t-eight/VERIFIED.json
- Lista de verificacion π0.5 STATE/oven 40k: https://huggingface.co/ds1x/RHSCI/blob/main/checkpoint/_handoff/20261029-pi05-three-tasks/PI05-STATE-oven-40k.json
- Lista de verificacion π0.5 VGQ-AE/oven 40k: https://huggingface.co/ds1x/RHSCI/blob/main/checkpoint/_handoff/20261029-pi05-three-tasks/PI05-VGQ-AE-oven-fast-40k.json
- Lista de verificacion π0.5 STATE/handover 40k: https://huggingface.co/ds1x/RHSCI/blob/main/checkpoint/_handoff/20261029-pi05-three-tasks/PI05-STATE-handover-fast-40k.json
- Lista de verificacion π0.5 VGQ-AE/handover 40k: https://huggingface.co/ds1x/RHSCI/blob/main/checkpoint/_handoff/20261029-pi05-three-tasks/PI05-VGQ-AE-handover-fast-40k.json
- Lista de verificacion π0.5 STATE/faucet 40k: https://huggingface.co/ds1x/RHSCI/blob/main/checkpoint/_handoff/20261029-pi05-three-tasks/PI05-STATE-faucet-fast-40k.json
- Lista de verificacion π0.5 VGQ-AE/faucet 40k: https://huggingface.co/ds1x/RHSCI/blob/main/checkpoint/_handoff/20261029-pi05-three-tasks/PI05-VGQ-AE-faucet-fast-40k.json
