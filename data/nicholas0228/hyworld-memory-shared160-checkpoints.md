# Nicholas0228/hyworld-memory-shared160-checkpoints

## Resumen

hyworld-memory-shared160-checkpoints es un repositorio de artefactos de entrenamiento (checkpoints) publicado por el usuario Nicholas0228 en Hugging Face. No se trata de un modelo listo para inferencia, sino de un conjunto de estados resumibles de un pipeline de entrenamiento denominado "HY memory-compression scale16". El repositorio conserva un checkpoint resumible verificado, hasta cuatro snapshots de evaluacion pendientes y los mejores pesos evaluados; el historico antiguo de checkpoints se elimina intencionadamente tras la publicacion.

El objetivo del artefacto es permitir la reanudacion de un entrenamiento a escala 16 (presumiblemente 16 GPUs, segun la advertencia de no reanudar una prueba de aceptacion de 4 GPUs como una ejecucion de produccion de 16 GPUs). El modelo base ("Base HY weights") se descarga por separado y no se incluye en este repositorio. La model card remite al repositorio GitHub `video-compress`, rama `impl/hyworld-scale16`, como punto de partida para el handoff.

La relevancia de este repositorio es acotada: es material de investigacion para reproducir o continuar un entrenamiento concreto, no un modelo publico con pesos finales listos para uso general. No se dispone de informacion sobre arquitectura, parametros, contexto ni capacidades del modelo subyacente en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (research-artifacts-follow-base-and-data-terms) |
| Formato de pesos | no disponible (checkpoints de entrenamiento resumibles; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo subyacente (transformer, MoE, SSM o hibrida) en la informacion proporcionada. El repositorio documenta unicamente el estado del pipeline de entrenamiento: un checkpoint resumible identificado por `LATEST.json`, que indica el step, la run y el world size del estado resumible, hasta cuatro snapshots de evaluacion pendientes y los mejores pesos evaluados.

El nombre "memory-compression scale16" sugiere un entrenamiento orientado a compresion de memoria a escala 16, pero no se detalla la composicion del dataset, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO. La model card advierte explicitamente que hay que descargar y verificar todos los ficheros antes de reanudar, y que nunca se debe reanudar una prueba de aceptacion de 4 GPUs como una ejecucion de produccion de 16 GPUs.

## Capacidades

- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas o vision en la informacion disponible.
- No se indica soporte de tool calling ni function calling.
- No se indica soporte de agentes ni de razonamiento multi-paso.
- No se indican capacidades multilingues ni idiomas soportados.
- No se documentan capacidades especiales (thinking mode, vision, audio).
- El repositorio contiene exclusivamente artefactos de entrenamiento (checkpoints resumibles y snapshots de evaluacion), no un modelo empaquetado para inferencia.

## Casos de uso

- Reanudacion de entrenamiento: descargar y verificar los ficheros del checkpoint resumible identificado por `LATEST.json` para continuar una ejecucion interrumpida en el world size correcto, evitando mezclar escalas de 4 y 16 GPUs.
- Reproduccion de experimentos: usar los snapshots de evaluacion pendientes y los mejores pesos evaluados para auditar el progreso del pipeline "memory-compression scale16".
- Handoff entre equipos: seguir la rama `impl/hyworld-scale16` del repositorio GitHub `video-compress` como punto de partida documentado para retomar el trabajo.
- Investigacion sobre compresion de memoria: emplear los artefactos como material de referencia para estudiar el comportamiento del entrenamiento a escala 16, sin disponer de pesos finales para inferencia.
- Control de versiones de checkpoints: aprovechar la politica de "squash" del historico antiguo tras la publicacion para mantener un conjunto reducido y verificado de estados resumibles.
- Integracion con el modelo base: combinar los artefactos con los "Base HY weights", que se descargan por separado, para reconstruir el estado completo del experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio no contiene pesos para inferencia).
- GPU recomendadas: no disponible para inferencia; el entrenamiento se describe a escala 16 (world size 16) y se advierte sobre pruebas de aceptacion de 4 GPUs.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicables segun la informacion disponible; se trata de checkpoints de entrenamiento, no de pesos de inferencia.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio ocupa 107.1 GB, lo que condiciona los requisitos de descarga y verificacion antes de reanudar.

## Comparativa con modelos similares

No disponible. No se identifican en la informacion proporcionada modelos comparables de la misma categoria (artefactos de checkpoints de entrenamiento con licencia de investigacion).

## Limitaciones y advertencias

- No es un modelo listo para inferencia: contiene checkpoints de entrenamiento y snapshots de evaluacion, no pesos finales empaquetados.
- Los pesos base ("Base HY weights") se descuentran por separado y no estan incluidos en este repositorio.
- Riesgo operativo documentado: no reanudar una prueba de aceptacion de 4 GPUs como una ejecucion de produccion de 16 GPUs; el world size debe coincidir con `LATEST.json`.
- Obligacion de descargar y verificar todos los ficheros antes de reanudar el entrenamiento.
- El historico antiguo de checkpoints se elimina intencionadamente tras la publicacion, por lo que no estara disponible para comparaciones retrospectivas.
- Licencia restrictiva: "other" con terminos `research-artifacts-follow-base-and-data-terms`; el uso comercial queda sujeto a los terminos del modelo base y de los datos, no detallados en la informacion disponible.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, limitaciones de contexto o idioma, al no documentarse el modelo subyacente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni idiomas especificados.

## Enlaces

- Hugging Face: https://huggingface.co/Nicholas0228/hyworld-memory-shared160-checkpoints
- Repositorio GitHub (rama de implementacion): https://github.com/Nicholas0228/video-compress/tree/impl/hyworld-scale16
