# longertime/jmaxcool-ly-v3

## Resumen

El modelo `longertime/jmaxcool-ly-v3` es un candidato de "limpieza" (scrub) derivado de un modelo base denominado `BKN1890/albedo-qwen3.6-35b-20260901-1748`, que a su vez parece estar basado en la arquitectura Qwen3.5 MoE (según la etiqueta `qwen3_5_moe`). El autor, `longertime`, ha publicado este checkpoint con un perfil exclusivamente visual (`vision-only`), es decir, solo se conservan los tensores correspondientes a la parte de visión del modelo original. El proceso de limpieza ha eliminado 55 de los 1045 tensores totales, todos ellos pertenecientes al módulo visual, con el objetivo de reducir la huella del modelo o eliminar posibles sesgos en la rama de visión.

Con 35.951.822.704 parámetros (aproximadamente 35,95 mil millones) y un tamaño de repositorio de 71,9 GB, se trata de un modelo de gran tamaño, probablemente de tipo Mixture of Experts (MoE) dado el tag. Sin embargo, la información pública es extremadamente limitada: no se especifican la licencia, los idiomas soportados, la longitud de contexto ni los detalles de entrenamiento. El modelo no tiene descargas ni valoraciones, lo que sugiere que es un experimento reciente o un artefacto de investigación sin uso práctico documentado.

La relevancia de este modelo radica en su enfoque de "scrubbing" selectivo de tensores, una técnica que podría interesar a investigadores que estudian la interpretabilidad, la eliminación de sesgos o la compresión de modelos. No obstante, sin documentación adicional, su utilidad práctica es incierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (según tag `qwen3_5_moe`), perfil vision-only |
| Parametros totales | 35.951.822.704 (35,95B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es presumiblemente un modelo MoE de la familia Qwen3.5, dado el tag `qwen3_5_moe`. El checkpoint publicado es una variante "scrubbed" (limpiada) del modelo base `BKN1890/albedo-qwen3.6-35b-20260901-1748`, en la que se han eliminado 55 tensores correspondientes exclusivamente a la parte visual (`model.visual.*`). El proceso de limpieza se realizó con una semilla de 95201, un delta-scale de 1 y una similitud objetivo de 0.948, obteniendo una huella (fingerprint) de 0.947368 respecto al modelo base. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se indica si el modelo base fue entrenado desde cero o es un fine-tuning de un modelo existente.

## Capacidades

- Al ser un perfil `vision-only`, el modelo conserva únicamente los pesos de la rama visual, lo que sugiere que está diseñado para tareas de procesamiento de imágenes (por ejemplo, clasificación, detección o generación de características visuales).
- No se dispone de información sobre capacidades de generación de texto, razonamiento, código, matemáticas o tool calling.
- No se ha documentado soporte para agentes, multi-step reasoning ni capacidades multilingües.
- No se confirma si el modelo puede procesar texto además de imágenes, dado que se han eliminado todos los tensores no visuales.

## Casos de uso

No se dispone de información suficiente para proponer casos de uso concretos. El modelo parece ser un artefacto de investigación experimental, sin documentación de aplicaciones prácticas. Cualquier uso requeriría primero validar su comportamiento real, lo cual no es posible con los datos disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se puede evaluar el rendimiento del modelo en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Con 35,95 mil millones de parámetros, el modelo en precisión FP16 ocuparía aproximadamente 71,9 GB de VRAM (coincidiendo con el tamaño del repositorio). Esto excede la capacidad de cualquier GPU de consumo actual (por ejemplo, RTX 4090 con 24 GB).
- Para inferencia en FP16 se necesitarían GPUs de datacenter como A100 (80 GB) o H100 (80 GB), o múltiples GPUs en paralelo.
- Con cuantización a 8 bits (INT8) se podría reducir a unos 36 GB, y a 4 bits (INT4) a unos 18 GB, lo que permitiría ejecutarlo en una RTX 4090 o similar, pero no se han publicado pesos cuantizados.
- Opciones de despliegue: al no haber formatos GGUF ni documentación, no se puede recomendar vLLM, llama.cpp u Ollama sin verificar compatibilidad. El formato safetensors es compatible con frameworks como Transformers, pero se requiere conocer la arquitectura exacta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Dado que se trata de un checkpoint experimental sin documentación, no es posible establecer una comparativa fiable con alternativas de la misma categoría (por ejemplo, otros modelos MoE de ~35B o modelos de visión). Se recomienda consultar la documentación del modelo base `BKN1890/albedo-qwen3.6-35b` si estuviera disponible.

## Limitaciones y advertencias

- El modelo es un artefacto experimental sin documentación oficial: no se especifican licencia, términos de uso ni restricciones comerciales.
- Al ser un perfil `vision-only`, no se puede utilizar para tareas de texto o multimodalidad completa sin los pesos del resto del modelo.
- El proceso de "scrubbing" puede haber degradado el rendimiento en tareas visuales, ya que se eliminaron 55 tensores de la rama visual.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez. El riesgo de comportamiento inesperado es alto.
- La ausencia de descargas y valoraciones sugiere que el modelo no ha sido validado por la comunidad.
- No se garantiza la reproducibilidad del proceso de limpieza ni la integridad de los pesos restantes.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/longertime/jmaxcool-ly-v3)
- [Perfil del autor en HuggingFace](https://huggingface.co/longertime/models)
- [Perfil de JMaxCool (posible colaborador)](https://huggingface.co/JMaxCool/models)
