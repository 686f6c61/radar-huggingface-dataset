# mradermacher/Air-nano-i1-GGUF

## Resumen

Air-nano-i1-GGUF es una cuantización imatrix en formato GGUF del modelo DollarCoderX/Air-nano, realizada por el usuario mradermacher. El modelo base tiene un total de 838.908 parámetros, lo que lo convierte en un modelo de tamaño extremadamente reducido. La información pública disponible es escasa: la model card no incluye arquitectura, datos de entrenamiento ni benchmarks. Se presenta como un modelo conversacional en inglés, con licencia Apache 2.0. Este repositorio se centra en proporcionar un archivo imatrix para que los usuarios puedan crear sus propias cuantizaciones; las cuantizaciones estáticas están disponibles en otro repositorio. Dado su tamaño, podría ser adecuado para entornos con recursos muy limitados, aunque no se dispone de datos que confirmen su calidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 838.908 |
| Parametros activos | no disponible (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se proporciona archivo imatrix; las cuantizaciones estáticas están en otro repositorio) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo imatrix) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura de DollarCoderX/Air-nano. El número de parámetros (838.908) sugiere un modelo muy pequeño, pero no se confirma si se trata de un transformer estándar o de otra arquitectura. Tampoco se dispone de datos sobre el conjunto de datos de entrenamiento, el número de tokens, ni sobre técnicas de alineación como RLHF o DPO. La única información técnica disponible es que mradermacher ha aplicado una cuantización imatrix para generar el archivo GGUF, siguiendo su proceso habitual.

## Capacidades

- No se ha documentado ninguna capacidad específica en la información disponible. Las etiquetas de Hugging Face indican que es un modelo conversacional en inglés.
- No se dispone de información sobre tool calling, function calling, agentes, razonamiento matemático, generación de código, visión o audio.
- La ausencia de benchmarks y descripciones impide verificar capacidades reales.

## Casos de uso

No se dispone de información suficiente para enumerar casos de uso concretos. La model card no documenta capacidades específicas, benchmarks ni aplicaciones previstas. Cualquier caso de uso sería una especulación no respaldada por datos. Por tanto, esta sección se deja como no disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 838.908 parámetros, se estima que cualquier GPU con al menos 1 GB de VRAM puede ejecutarlo, incluso una CPU moderna. No se dispone de datos oficiales de VRAM.
- GPU recomendadas: no disponible. No hay una recomendación oficial; por tamaño, cualquier GPU de consumo actual (por ejemplo, RTX 3060 o superior) sería suficiente.
- ¿Cabe en consumer GPU? Sí, con holgura, debido al tamaño extremadamente reducido del modelo.
- Opciones de despliegue: llama.cpp, Ollama y cualquier software compatible con GGUF.
- Latencia y throughput: no se han publicado datos.

## Comparativa con modelos similares

No disponible: no se han identificado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Información muy limitada sobre el modelo base y su entrenamiento.
- Tamaño extremadamente pequeño (838.908 parámetros), lo que limita la capacidad de razonamiento y generación.
- Al ser una cuantización, puede haber pérdida de calidad respecto al modelo original.
- No se han realizado evaluaciones de sesgos ni de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantías de soporte ni calidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Air-nano-i1-GGUF
- Modelo base: https://huggingface.co/DollarCoderX/Air-nano
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Air-nano-GGUF
- Perfil de mradermacher: https://huggingface.co/mradermacher
