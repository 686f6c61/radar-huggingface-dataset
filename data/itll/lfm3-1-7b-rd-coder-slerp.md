# ITLL/LFM3-1.7B-RD-Coder-SLERP

## Resumen

LFM3-1.7B-RD-Coder-SLERP es un modelo de lenguaje de 1.958.450.760 parametros (~1,96 mil millones) publicado por el usuario ITLL en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una fusion (merge) de dos modelos preentrenados realizada con la herramienta mergekit mediante el metodo SLERP (interpolacion esferica) con un parametro `t: 0.5`, es decir, una mezcla ponderada al 50 % entre ambos progenitores. Los modelos fusionados son cybertruck32489/LFM3-1.7B-RD-v2 y Schnuckade/LFM-3-Coder-Claude-Distill.

El modelo hereda la arquitectura LFM3 de Liquid AI, segun indican las etiquetas `liquid`, `lfm3`, `recurrent-depth` y `adaptive-computation`, lo que sugiere un transformer con mecanismos de profundidad recurrente y computo adaptativo. La rama Coder-Claude-Distill aporta un ajuste orientado a generacion de codigo y razonamiento, destilado a partir de trazas de modelos Claude (Opus, Sonnet) y otros conjuntos de razonamiento matematico y de codigo.

Es relevante por su tamano reducido (apto para GPU de consumo) y por combinar en un unico checkpoint capacidades de codigo, razonamiento y tool calling. Sin embargo, se trata de un merge experimental con cero descargas y cero likes en el momento de la consulta, sin model card tecnica detallada ni benchmarks publicados, por lo que su calidad real no esta validada de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LFM3 (Liquid AI) con profundidad recurrente y computo adaptativo, segun etiquetas del autor; detalles exactos no disponibles |
| Parametros totales | 1.958.450.760 (~1,96 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; el repo contiene pesos en bfloat16, y la etiqueta `unsloth` sugiere compatibilidad con cuantizacion, pero no se confirma |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, con `custom_code` para la arquitectura lfm3_rd) |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge SLERP entre cybertruck32489/LFM3-1.7B-RD-v2 y Schnuckade/LFM-3-Coder-Claude-Distill, usando el primero como `base_model` y un factor `t: 0.5`. El merge se realizo en `bfloat16` tanto en entrada como en salida. La arquitectura subyacente es la LFM3 de Liquid AI, identificada en las etiquetas como `lfm3_rd` (recurrent-depth), con soporte de `custom_code` en transformers, lo que implica que requiere cargar codigo personalizado del repositorio para instanciar el modelo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO en los modelos originales.

Los datasets listados en la model card corresponden a los conjuntos usados en el ajuste del modelo Coder-Claude-Distill, no necesariamente al merge en si: incluyen datos de razonamiento estilo Claude (Opus 4.6/4.7, Sonnet 4.5/4.6), destilaciones de DeepSeek, GSM8K, OpenMathReasoning, OpenCodeReasoning, hermes_reasoning_tool_use, trazas de Cursor y Fable. Esto sugiere que la rama de codigo fue afinada con datos sinteticos de razonamiento y tool use, aunque no hay confirmacion de como se combinan esas capacidades tras el SLERP.

## Capacidades

- Generacion de texto y razonamiento multi-paso, segun las etiquetas `reasoning` y los datasets de destilacion de trazas de Claude.
- Generacion de codigo, heredada de la rama Coder-Claude-Distill.
- Razonamiento matematico, con datos de GSM8K y OpenMathReasoning en el linaje de entrenamiento.
- Tool calling / function calling, inferido de la etiqueta y el dataset `hermes_reasoning_tool_use`; no confirmado en la model card.
- Computo adaptativo y profundidad recurrente (etiquetas `adaptive-computation` y `recurrent-depth`), lo que en teoria permite ajustar el esfuerzo de computo en inferencia; sin documentacion de como activarlo.
- Capacidades multilingues: no disponibles.
- Modo thinking explicito: no disponible.
- Vision y audio: no disponibles (no se mencionan).

## Casos de uso

- Asistente de codigo en local: con ~1,96 B de parametros, el modelo cabe en GPU de consumo y puede usarse como autocompletado o generacion de funciones en entornos sin conexion, aprovechando la rama Coder-Claude-Distill.
- Razonamiento matematico asistido: util para resolver problemas de nivel GSM8K en pipelines educativos o de validacion, dado el linaje de datos matematicos.
- Prototipado de agentes con tool calling: la etiqueta y el dataset de hermes_reasoning_tool_use sugieren soporte para llamadas a herramientas, adecuado para experimentar con agentes multi-paso en entornos de bajo coste.
- Generacion de trazas de razonamiento para destilacion: puede emplearse como generador de datos sinteticos de razonamiento en proyectos de distillation, aunque su calidad no esta validada.
- Despliegue en edge o entornos con VRAM limitada: al ser un modelo de menos de 2 B, es candidato para inferencia en GPUs de 8-12 GB con cuantizacion, aunque no se confirman los formatos GGUF.
- Experimentacion en investigacion de merges: sirve como caso de estudio de fusion SLERP entre un modelo de razonamiento y uno de codigo, para analizar sinergias y degradaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los pesos ocupan aproximadamente 3,9 GB, por lo que se necesitan al menos 6-8 GB de VRAM contando cache de activaciones y KV; con cuantizacion a 8 bits o 4 bits (si esta disponible via unsloth o llama.cpp) podria reducirse a 2-3 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; en datacenter, A100 o H100 no son necesarias pero funcionarian.
- Cabe en GPU de consumo: si, en la mayoria de GPUs con 8 GB o mas en bfloat16, y en GPUs de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (requiere `custom_code` y `trust_remote_code=True`), text-generation-inference (etiqueta presente), y potencialmente vLLM o llama.cpp si se generan pesos compatibles; la etiqueta `unsloth` sugiere soporte de fine-tuning y cuantizacion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ITLL/LFM3-1.7B-RD-Coder-SLERP | ~1,96 B | no disponible | apache-2.0 | Merge SLERP experimental, sin benchmarks |
| cybertruck32489/LFM3-1.7B-RD-v2 | ~1,7 B (estimado) | no disponible | no disponible | Progenitor, arquitectura LFM3-RD |
| Schnuckade/LFM-3-Coder-Claude-Distill | ~1,7 B (estimado) | no disponible | no disponible | Progenitor, ajuste de codigo y razonamiento |
| Qwen2.5-Coder-1.5B | 1,5 B | 32 K | apache-2.0 | Alternativa consolidada de codigo en tamano similar |

La comparativa con modelos de referencia como Qwen2.5-Coder-1.5B es orientativa: no hay datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo experimental con cero descargas y cero likes: no hay validacion comunitaria ni reportes de calidad.
- No se han publicado benchmarks, por lo que se desconoce su rendimiento real en codigo, matematicas o razonamiento.
- Al ser un merge SLERP, puede sufrir degradacion de capacidades respecto a los progenitores (interferencia de pesos).
- Requiere `trust_remote_code=True` por la arquitectura `lfm3_rd` con `custom_code`, lo que implica ejecutar codigo del repositorio.
- Riesgo de alucinacion no evaluado; los datos de entrenamiento incluyen trazas sinteticas de modelos Claude, lo que puede introducir sesgos y errores de estilo.
- Idiomas soportados no documentados; el soporte multilingue no esta garantizado.
- Licencia apache-2.0 permite uso comercial, pero al derivar de modelos cuyo linaje no esta completamente documentado, conviene verificar las licencias de los progenitores antes de produccion.
- Longitud de contexto desconocida: no apto para tareas que requieran ventanas largas sin verificacion previa.
- Sin garantias de soporte ni mantenimiento por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ITLL/LFM3-1.7B-RD-Coder-SLERP
- Modelo base 1: https://huggingface.co/cybertruck32489/LFM3-1.7B-RD-v2
- Modelo base 2: https://huggingface.co/Schnuckade/LFM-3-Coder-Claude-Distill
- mergekit: https://github.com/cg123/mergekit
- Referencia SLERP: https://en.wikipedia.org/wiki/Slerp
