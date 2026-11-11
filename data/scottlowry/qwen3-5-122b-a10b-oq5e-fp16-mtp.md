# scottlowry/Qwen3.5-122B-A10B-oQ5e-fp16-mtp

## Resumen

Qwen3.5-122B-A10B-oQ5e-fp16-mtp es una cuantizacion mixta del modelo Qwen/Qwen3.5-122B-A10B, publicada por el usuario scottlowry en Hugging Face. Se trata de un checkpoint en formato MLX (safetensors), pensado para inferencia en hardware Apple Silicon, generado con la herramienta oQ de oMLX v0.7.4.dev1. El modelo base es un Mixture of Experts (MoE) de la familia Qwen3.5, con 122.112B parametros logicos en el modelo de lenguaje y un total de 125.086B contando vision y la cabeza MTP.

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE de gran tamano en equipos con memoria unificada de gama alta, gracias a una cuantizacion mixta que combina 5 bits afines (grupo 64) para la mayor parte de los pesos con capas selectivas en 8 bits, FP16 y FP32. El promedio efectivo es de 5,748 bits por peso, con un almacenamiento total de 83,706 GiB. La model card no documenta el tamano de contexto, los idiomas ni la licencia del modelo base, por lo que esos datos se marcan como no disponibles.

Esta es una publicacion de cuantizacion, no un modelo original: cualquier evaluacion de capacidades, sesgos o rendimiento debe remitirse al modelo base Qwen/Qwen3.5-122B-A10B. La model card fue actualizada el 2026-11-11 con una recuantizacion, y el autor recomienda volver a descargar si se tenia una copia anterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) transformer, tag `qwen3_5_moe`; incluye torre de vision y cabeza MTP |
| Parametros totales | 125.086.497.008 (125.086B) |
| Parametros activos | no disponible (el nombre del modelo base sugiere ~10B activos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 5-bit grupo 64 (94,639% de los pesos), affine 8-bit grupo 128 (0,370%), affine 8-bit grupo 64 (4,583%), FP16 (0,048%), FP32 (0,361%); promedio efectivo 5,748 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts (tag `qwen3_5_moe`), que segun la model card se descompone en tres componentes: modelo de lenguaje (122,112B parametros logicos), torre de vision (0,451B) y cabeza MTP (Multi-Token Prediction, 2,524B). La presencia de vision y MTP indica capacidades multimodales y de decodificacion especulativa en el modelo original, aunque la ficha de cuantizacion no detalla su funcionamiento interno.

El proceso de cuantizacion lo realiza oQ (oMLX v0.7.4.dev1) con precision mixta: la mayor parte de los pesos (118,380B) se almacena en affine 5-bit con grupo 64, mientras que 5,733B pesos se mantienen en 8-bit grupo 64, 0,462B en 8-bit grupo 128, 0,060B en FP16 y 0,451B en FP32. No se dispone de informacion sobre los datos de entrenamiento del modelo base, el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO, ya que la model card solo documenta el proceso de cuantizacion.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-122B-A10B, sin detalle especifico en la model card de la cuantizacion.
- Vision: el checkpoint incluye una torre de vision de 0,451B parametros, lo que sugiere soporte de entrada de imagenes en el modelo base.
- Decodificacion especulativa mediante cabeza MTP (Multi-Token Prediction) de 2,524B parametros.
- Capacidades de codigo, matematicas, tool calling y agentes: no documentadas en la informacion proporcionada; deben consultarse en la model card del modelo base.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking u otras capacidades especiales: no disponibles en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon de gama alta: el checkpoint en MLX con 83,706 GiB de almacenamiento esta pensado para ejecutarse en equipos con memoria unificada amplia (por ejemplo, Mac Studio con 128 GB o superiores), permitiendo usar un MoE de 125B sin GPU dedicada.
- Prototipado de aplicaciones multimodales: la inclusion de la torre de vision permite experimentar con tareas de imagen y texto en local, siempre que el modelo base confirme dicha capacidad.
- Investigacion sobre cuantizacion: el desglose detallado de bits por componente lo convierte en un caso de estudio util para analizar el impacto de la precision mixta en modelos MoE grandes.
- Evaluacion comparativa de decodificacion especulativa: la cabeza MTP permite medir la aceleracion de generacion frente a la decodificacion autoregresiva estandar en MLX.
- Despliegue de asistentes de codigo en local: si el modelo base mantiene sus capacidades de programacion, el checkpoint puede servir para autocompletado y revision de codigo en entornos sin conexion.
- Experimentacion academica con modelos de gran escala: util para investigadores que necesiten un checkpoint MoE de 125B ejecutable en un solo equipo, sin infraestructura de cluster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: 83,706 GiB de pesos en el checkpoint (89,879 GB); el repositorio completo ocupa 178,6 GB, por lo que se recomienda espacio en disco de al menos 180 GB para la descarga.
- Memoria unificada: al ser un formato MLX, requiere Apple Silicon con memoria unificada suficiente para cargar los pesos mas el estado de inferencia; con 83,706 GiB de pesos, se necesita un equipo de 96 GB o superior, y 128 GB para margen operativo.
- GPU dedicadas: el formato MLX no esta pensado para CUDA; no se documenta soporte para A100, H100 ni RTX 4090 en la informacion proporcionada.
- Cabe en consumer GPU: no disponible; el formato esta orientado a Apple Silicon, no a GPUs de consumo convencionales.
- Opciones de despliegue: libreria MLX y herramienta oMLX (oQ); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| scottlowry/Qwen3.5-122B-A10B-oQ5e-fp16-mtp | 125,086B | no disponible | MLX safetensors, 5,748 bits/peso | no disponible | Cuantizacion mixta para Apple Silicon |
| Qwen/Qwen3.5-122B-A10B (modelo base) | 125,086B (segun checkpoint) | no disponible | safetensors | no disponible | Pesos originales sin cuantizar |
| Otras cuantizaciones del mismo modelo base | no disponible | no disponible | no disponible | no disponible | No se han identificado en la informacion proporcionada |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion a 5,748 bits/peso promedio puede degradar la calidad respecto al modelo base, especialmente en tareas sensibles a la precision numerica; no se documenta una evaluacion de la perdida de rendimiento.
- La licencia no esta disponible en la informacion proporcionada; antes de un uso comercial debe verificarse la licencia del modelo base Qwen/Qwen3.5-122B-A10B.
- El checkpoint esta en formato MLX y no es directamente usable en ecosistemas CUDA, lo que limita su despliegue a hardware Apple Silicon.
- El repositorio ocupa 178,6 GB, lo que exige planificacion de almacenamiento y ancho de banda de descarga considerables.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de contexto o idioma en la informacion proporcionada; estos aspectos deben consultarse en la model card del modelo base.
- La model card indica que hubo una recuantizacion el 2026-11-11; copias anteriores pueden diferir en calidad o distribucion de bits.
- El numero de descargas (50) y likes (0) es bajo, por lo que la validacion comunitaria del checkpoint es limitada.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Qwen3.5-122B-A10B-oQ5e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
