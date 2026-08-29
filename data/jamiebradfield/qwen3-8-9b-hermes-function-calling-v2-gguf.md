# JamieBradfield/qwen3.8-9b-hermes-function-calling-v2-GGUF

## Resumen

El modelo `JamieBradfield/qwen3.8-9b-hermes-function-calling-v2-GGUF` es una cuantizacion ROCmFPX en formato GGUF de un merge BF16 basado en la arquitectura Qwen 3.5/3.8, especializado en function calling mediante entrenamiento de estilo Hermes. Lo desarrolla JamieBradfield, que publica tanto el merge BF16 original como esta conversion cuantizada, disenada especificamente para ejecutarse en GPUs AMD RDNA3 a traves del fork `llama-rocmfpx`.

El modelo conserva la cabecera MTP (multi-token prediction) del modelo base, lo que permite decodificacion especulativa, pero elimina la torre de vision en el merge BF16, por lo que se trata de un modelo puramente textual. Con 9.195 millones de parametros y un peso cuantizado de 4,92 GB, esta orientado a despliegue local en hardware AMD de gama media, como la RX 7700 XT mencionada en la documentacion.

La relevancia de esta ficha radica en que es una de las pocas cuantizaciones GGUF que aprovecha kernels ROCmFP4 para AMD, un ecosistema menos cubierto que CUDA. Su principal limitacion es la falta de portabilidad: requiere el fork `llama-rocmfpx` y no funciona en CUDA ni en builds solo CPU sin modificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen 3.5/3.8), con cabecera MTP preservada y torre de vision eliminada |
| Parametros totales | 9.195.119.616 (~9,2 B) |
| Parametros activos | no disponible (no se especifica si es MoE; por el tamano, probablemente denso) |
| Longitud de contexto | no disponible (hereda del modelo base Qwen3.8-9B, no especificada en la model card) |
| Tipos de cuantizacion | Q4_0_ROCMFP4_FAST (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizacion ROCmFP4, convertido desde BF16) |

## Arquitectura y entrenamiento

El modelo es un merge BF16 sobre la arquitectura Qwen 3.5/3.8, especializado en function calling con tecnicas de estilo Hermes. La conversion a GGUF se realizo con `convert_hf_to_gguf.py --outtype bf16` y posterior cuantizacion con `llama-quantize` usando el tipo `Q4_0_ROCMFP4_FAST`, que emplea kernels ROCmFP4 del fork `llama-rocmfpx` optimizados para GPUs AMD RDNA3.

Un aspecto destacable es que la cabecera MTP (multi-token prediction) se preserva en el GGUF, lo que permite prediccion de multiples tokens por paso y acelera la inferencia en hardware compatible. El merge BF16 elimina la torre de vision del modelo base, por lo que las capacidades multimodales originales se pierden. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento basado en la familia Qwen 3.5/3.8.
- Function calling / tool calling, principal proposito del fine-tuning estilo Hermes.
- Soporte de agentes y razonamiento multi-paso mediante invocacion de herramientas.
- Decodificacion especulativa gracias a la cabecera MTP preservada en la cuantizacion.
- Capacidades multilingues: no disponibles en la documentacion, aunque se heredan del modelo base Qwen.
- Sin capacidades de vision (la torre de vision se elimino en el merge BF16).
- Sin capacidades de audio ni otras modalidades.

## Casos de uso

- Asistentes conversacionales con invocacion de herramientas: el modelo puede gestionar dialogos multi-turno en los que necesita llamar a APIs externas (busqueda, consultas a bases de datos, calculo) gracias a su fine-tuning especifico en function calling.
- Automatizacion de tareas de backend: integrable en pipelines que requieran parseo de intenciones y ejecucion de acciones programaticas, como creacion de tickets, consultas de inventario o envio de notificaciones.
- Agentes de razonamiento multi-paso: la combinacion de MTP y function calling permite construir agentes que planifican y ejecutan secuencias de acciones, por ejemplo en flujos de automatizacion empresarial.
- Despliegue local en hardware AMD RDNA3: ideal para entornos que requieren inferencia en local sin depender de CUDA, como estaciones de trabajo con RX 7000 series o servidores con GPUs AMD.
- Prototipado rapido de aplicaciones de tool calling: su licencia Apache 2.0 permite experimentacion sin restricciones de uso comercial, adecuado para pruebas de concepto.
- Generacion de codigo con ejecucion asistida: el modelo puede generar fragmentos de codigo y, mediante tool calling, invocar interpretes o compiladores para validar el resultado en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al repositorio del modelo base para el estado de evaluacion, pero no se proporcionan datos numericos de MMLU, HumanEval, GSM8K ni otras metricas estandar.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa 4,92 GB, por lo que se necesita al menos 6-8 GB de VRAM para inferencia comoda con overhead de contexto.
- GPU recomendadas: AMD RDNA3, concretamente la RX 7700 XT mencionada en la documentacion; compatible con otras GPUs RDNA3 siempre que se use el fork `llama-rocmfpx`.
- No apto para GPUs NVIDIA (CUDA) ni para builds solo CPU sin modificar, ya que los kernels ROCmFP4 son especificos de AMD.
- Opciones de despliegue: exclusivamente mediante el fork `llama-rocmfpx` de llama.cpp; no es compatible con vLLM, Ollama ni TGI en sus versiones estandar sin adaptaciones.
- Latencia y throughput: no disponibles. La decodificacion MTP deberia mejorar el throughput respecto a modelos sin cabecera MTP, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Function calling | Licencia | Formato |
|---|---|---|---|---|---|
| qwen3.8-9b-hermes-function-calling-v2-GGUF | 9,2 B | no disponible | Si (fine-tuning Hermes) | Apache 2.0 | GGUF (ROCmFP4) |
| qwen3.8-9b-hermes-function-calling-v1-GGUF | 9,2 B | no disponible | Si (fine-tuning Hermes) | Apache 2.0 | GGUF (probablemente CUDA-compatible) |
| Qwen3.8-Flash-Next (unsloth) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa es limitada porque la informacion publica sobre los modelos alternativos es escasa. La diferencia principal entre v1 y v2 de este mismo autor es la cuantizacion ROCmFP4 especifica para AMD en la v2. No se dispone de datos de rendimiento comparativo entre ambas versiones.

## Limitaciones y advertencias

- Portabilidad restringida: los kernels ROCmFP4 requieren el fork `llama-rocmfpx` y GPUs AMD RDNA3; no funcionara en CUDA ni en CPUs sin modificaciones sustanciales.
- Sin capacidades de vision: la torre de vision se elimino en el merge BF16, por lo que no se pueden procesar imagenes.
- Datos de entrenamiento desconocidos: no se publica informacion sobre el dataset de fine-tuning, lo que impide evaluar sesgos o calidad de los datos.
- Riesgo de alucinacion: no hay evaluaciones publicas que permitan cuantificar la tasa de alucinacion en tareas de function calling.
- Contexto no especificado: se desconoce la longitud maxima de contexto soportada, lo que dificulta dimensionar cargas de trabajo con historiales largos.
- Soporte limitado: al ser un modelo de un autor independiente con 0 descargas y 0 likes, el soporte y mantenimiento son inciertos.
- Idiomas no documentados: no se especifica que idiomas soporta, aunque probablemente herede las capacidades multilingues de Qwen.

## Enlaces

- Repositorio GGUF: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-function-calling-v2-GGUF
- Modelo base BF16: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-function-calling-v2
- Version v1 del modelo: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-function-calling-v1
- Version v1 en GGUF: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-function-calling-v1-GGUF
- Ficha del modelo en LLM Explorer: https://llm-explorer.com/model/JamieBradfield%2Fqwen3.8-9b-hermes-function-calling-v1,6SuH8bRjECvBVYmLBTrCbl
- Informacion sobre la familia Qwen 3.8: https://openlm.ai/qwen3.8/
- Documentacion de Qwen3.8-Flash-Next (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
