# Jasonho610/mixjudge-checkpoints

## Resumen

MixJudge es un sistema de evaluacion automatica de mezclas vocales construido sobre un modelo de audio-lenguaje. El repositorio `Jasonho610/mixjudge-checkpoints` publica los checkpoints del articulo "MixJudge: Teaching Audio-Language Models to Judge Vocal Mixes", cuyo objetivo es puntuar problemas de mezcla vocal especificados en lenguaje natural a partir de tres entradas: la voz, el acompanamiento musical y su mezcla combinada. No es un modelo generativo de mezcla, sino un critico: recibe audio y una descripcion textual de un problema y devuelve una puntuacion de severidad.

El sistema parte de CLAP (Contrastive Language-Audio Pretraining) como backbone congelado y anade componentes de fusion relacional y embeddings de rol. El checkpoint recomendado adapta la etapa final de audio de CLAP y las dos ultimas capas del transformer de texto, mientras que la variante de comparacion del articulo mantiene ambas torres congeladas y solo entrena la fusion.

Es relevante ahora porque aborda una tarea poco cubierta: la evaluacion perceptual automatizada de mezclas musicales con instrucciones en lenguaje natural, un paso intermedio hacia asistentes de produccion musical. El repositorio es fundamentalmente un archivo inmutable de experimentos (22,8 GB), y la propia model card advierte que la mayoria de los ficheros no estan pensados como modelos de uso final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLAP (audio-lenguaje de dos torres) con fusion relacional y embeddings de rol; adaptacion parcial de la torre de audio y del transformer de texto |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en `.pt` de PyTorch; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | other (terminos no especificados en la model card) |
| Formato de pesos | PyTorch (`.pt`, `.joblib`) |

## Arquitectura y entrenamiento

MixJudge se construye sobre CLAP, un modelo de dos torres que alinea audio y texto en un espacio comun. Sobre esa base se anaden componentes de fusion relacional que combinan las representaciones de la voz, el acompanamiento y la mezcla, junto con embeddings de rol que identifican cada una de las tres entradas. El checkpoint recomendado (`b2_joint_stage3_text2`, semilla 42) entrena la fusion relacional y los embeddings de rol, y ademas adapta la etapa final de audio de CLAP y las dos ultimas capas del transformer de texto. La variante de comparacion (`siglip_rank_full`) mantiene ambas torres congeladas y entrena solo la fusion.

El entrenamiento se organiza en un curriculum de once problemas de mezcla vocal definidos por los autores. El repositorio incluye replicaciones de semilla (`*_s7`, `*_s13`), ablaciones de objetivo (`loss_*`, `sweep_*`), ablaciones de entrada y contexto (`context_*`, `ctx_*`), controles de batch estructurado (`sbc_*`), sustituciones de encoder externo (`fxencoder_*`, `afxrep_*`) y estudios de warm-start y entrenamiento conjunto. La seleccion del checkpoint final se hizo por perdida de validacion; la model card indica explicitamente que `last.pt` sobreajusta y no debe usarse. No se detalla en la informacion disponible el numero de tokens, la composicion del dataset ni si se empleo RLHF o DPO.

## Capacidades

- Puntuacion de problemas de mezcla vocal descritos en lenguaje natural, a partir de voz, acompanamiento y mezcla.
- Discriminacion entre problemas opuestos (distinguir un problema de su contrario).
- Ordenacion por severidad de los problemas detectados.
- Selectividad: capacidad de no marcar problemas cuando no los hay.
- Seleccion de menu: eleccion del problema aplicable dentro de un conjunto definido.
- Recuperacion texto-audio, reforzada en la variante B3 LoRA (`b3_lora_joint_r8`).
- Alcance limitado a los once problemas de mezcla vocal del curriculum; no soporta juicio abierto de calidad de mezcla.
- No se documentan capacidades de tool calling, agentes, vision ni audio generativo.

## Casos de uso

- Evaluacion automatizada en postproduccion musical: dado un stem vocal, su instrumental y la mezcla, el modelo puntua la severidad de problemas como desequilibrio de niveles o enmascaramiento, lo que permite priorizar revisiones manuales.
- Control de calidad en pipelines de mastering: integrado como etapa de critica antes de la publicacion, el modelo puede marcar mezclas con problemas detectables de forma consistente y trazable.
- Asistencia a productores noveles: el sistema traduce una descripcion textual del problema ("la voz suena apagada respecto al acompanamiento") en una puntuacion objetiva que orienta la correccion.
- Investigacion en percepcion musical: los checkpoints de ablacion y las replicaciones de semilla permiten reproducir y extender los experimentos del articulo sobre juicio perceptual de mezclas.
- Recuperacion texto-audio en catalogos musicales: la variante B3 LoRA esta orientada a retrieval texto-audio, util para buscar fragmentos por descripcion de su mezcla.
- Benchmarking de modelos de audio-lenguaje: el conjunto de checkpoints y los artefactos de evaluacion sirven como referencia para comparar arquitecturas de fusion en tareas de juicio perceptual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card remite al articulo y a los artefactos de evaluacion del repositorio de codigo para las comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el backbone CLAP base y los checkpoints en `.pt` requieren una GPU con memoria suficiente para cargar el modelo completo, y el repositorio completo ocupa 22,8 GB en disco.
- GPU recomendadas: no disponibles en la informacion proporcionada; por el tamano del backbone CLAP, es razonable esperar GPUs de gama alta (A100, H100) para entrenamiento o evaluacion por lotes, pero no se confirma.
- Compatibilidad con GPU de consumo: no confirmada en la documentacion.
- Opciones de despliegue: carga mediante PyTorch con la arquitectura e implementacion de entrada del repositorio de codigo de MixJudge; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de juicio de mezcla vocal ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- El modelo es un critico, no un sistema generativo de mezcla; requiere la arquitectura y la construccion de entradas del repositorio de codigo para funcionar.
- Alcance restringido a los once problemas de mezcla vocal del curriculum; no establece juicio abierto de vocabulario ni calidad perceptual general de mezcla.
- La mayoria de los ficheros del repositorio son artefactos experimentales (ablaciones, replicaciones, snapshots `last.pt`) y no deben usarse como modelos publicados.
- Los ficheros con prefijo `quarantine_` se conservan solo por trazabilidad forense y no deben usarse como modelos.
- La licencia es "other" y los terminos no estan detallados; el uso comercial queda sujeto a la licencia del repositorio y a los terminos de los modelos y datasets de origen.
- Los corpus de audio fuente no se redistribuyen; el release no concede derechos sobre ellos.
- No se dispone de informacion sobre sesgos, tasas de alucinacion, cobertura idiomatica ni limites de contexto.
- No se publican versiones cuantizadas ni formatos ligeros, lo que dificulta el despliegue en entornos con recursos limitados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Jasonho610/mixjudge-checkpoints
- Checkpoint recomendado: https://huggingface.co/Jasonho610/mixjudge-checkpoints/blob/main/checkpoints/e644dd4d6ce71d56__b2_joint_stage3_text2_best.pt
- Checkpoint de comparacion (fusion-only): https://huggingface.co/Jasonho610/mixjudge-checkpoints/blob/main/checkpoints/d53f2f4d916c0d87__sweep_c4_a6_full_best.pt
- Checkpoint B3 LoRA: https://huggingface.co/Jasonho610/mixjudge-checkpoints/blob/main/checkpoints/559bdeb2ee1d730b__b3_lora_joint_r8_best.pt
- Backbone CLAP congelado: https://huggingface.co/Jasonho610/mixjudge-checkpoints/blob/main/checkpoints/fae3e9c087f2909c__music_audioset_epoch_15_esc_90.14.pt
