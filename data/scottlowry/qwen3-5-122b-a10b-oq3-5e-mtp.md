# scottlowry/Qwen3.5-122B-A10B-oQ3.5e-mtp

## Resumen

Qwen3.5-122B-A10B-oQ3.5e-mtp es una cuantizacion mixta de precision del modelo Qwen/Qwen3.5-122B-A10B, publicada por el usuario scottlowry. El checkpoint conserva la arquitectura original Qwen3.5 MoE (mezcla de expertos) con un total de 125.086 millones de parametros logicos, e incorpora una cabeza MTP (multi-token prediction) de 2.524 millones de parametros y un modulo de vision de 0.451 millones. La cuantizacion se ha realizado con la herramienta oQ de oMLX (version v0.7.4.dev1), que asigna precision variable por tensor en lugar de aplicar una sola tasa a todo el modelo.

El resultado es un checkpoint con un promedio efectivo de 4.059 bits por peso y un almacenamiento total de 59.111 GiB (63.470 GB), lo que reduce drasticamente el peso en disco frente a los pesos BF16 originales. La distribucion es muy asimetrica: el 61,8 % de los pesos logicos se guarda en 3 bits (grupo 64), el 33,2 % en 4 bits, y solo un 0,4 % permanece en BF16. Esta estrategia busca preservar la calidad en las capas mas sensibles mientras comprime agresivamente el resto.

El modelo esta empaquetado en formato MLX (safetensors), por lo que su uso esta orientado al ecosistema Apple Silicon y a la libreria MLX. Es relevante para desarrolladores que quieran ejecutar un MoE de gran tamano en hardware de consumo o estaciones de trabajo Mac con memoria unificada, a costa de una licencia no declarada y de una documentacion tecnica muy limitada mas alla de la tabla de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (mezcla de expertos) con cabeza MTP y modulo de vision |
| Parametros totales | 125.086.497.008 (125,086 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 3, 4, 5, 6 y 8 bits (grupo 64/128) y BF16; promedio 4,059 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-122B-A10B, un transformer con arquitectura de mezcla de expertos (MoE). El checkpoint cuantizado conserva tres componentes diferenciados: el modelo de lenguaje (122,112 B de pesos logicos, 56,918 GiB de almacenamiento), el modulo de vision (0,451 B, 0,841 GiB) y la cabeza MTP (2,524 B, 1,353 GiB). La presencia de la cabeza MTP sugiere soporte para prediccion multi-token, una tecnica que puede acelerar la decodificacion especulativa, aunque la model card no detalla como se activa ni que ganancia de throughput ofrece.

La cuantizacion se realizo con oQ (oMLX v0.7.4.dev1) en modo de precision mixta. La distribucion de bits es la siguiente: 77,309 B en affine 3 bits (grupo 64, 3,50 bits efectivos), 41,491 B en affine 4 bits (grupo 64, 4,50 bits efectivos), 1,414 B en 5 bits, 1,219 B en 6 bits, 0,462 B en 8 bits (grupo 128), 2,680 B en 8 bits (grupo 64) y 0,511 B en BF16. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, el proceso de alineacion (RLHF/DPO) ni las innovaciones tecnicas del modelo base, ya que la model card solo documenta el proceso de cuantizacion.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.5-122B-A10B, aunque no se detallan en la model card.
- Procesamiento de vision: el checkpoint incluye un modulo de vision de 0,451 B de parametros, lo que indica capacidad multimodal imagen-texto.
- Prediccion multi-token: la cabeza MTP de 2,524 B esta disenada para predecir varios tokens por paso, lo que puede reducir la latencia de decodificacion.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint en formato MLX y 59,111 GiB de almacenamiento permite ejecutar un MoE de 125 B en Macs con memoria unificada alta (por ejemplo, configuraciones de 64 GB o mas), algo inviable con los pesos BF16 originales.
- Prototipado de aplicaciones multimodales: el modulo de vision incluido permite experimentar con tareas imagen-texto en local sin depender de APIs externas, usando MLX como runtime.
- Investigacion sobre cuantizacion mixta: la distribucion detallada de bits por tensor sirve como caso de estudio para evaluar el impacto de la precision variable en la calidad de un MoE grande.
- Evaluacion de decodificacion especulativa: la cabeza MTP permite medir en la practica la ganancia de throughput de la prediccion multi-token frente a la decodificacion autoregresiva clasica.
- Despliegue en estaciones de trabajo Mac para tareas de generacion de texto de larga duracion, aprovechando la memoria unificada y el menor peso del checkpoint.
- Pruebas de regresion de pipelines MLX: util para validar que una aplicacion basada en MLX funciona correctamente con un modelo cuantizado de gran tamano antes de pasar a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 59,111 GiB de almacenamiento para los pesos; se necesita memoria unificada suficiente para cargar el checkpoint completo mas el overhead de inferencia (KV cache y activaciones), por lo que se recomienda un minimo practico de 64 GB.
- GPU recomendadas: el formato MLX esta pensado para Apple Silicon (series M1/M2/M3/M4 con memoria unificada alta); no es compatible de forma nativa con CUDA.
- Cabe en consumer GPU: no en GPUs consumer convencionales (RTX 4090 con 24 GB, etc.) por el tamano del checkpoint; si en Macs con 64 GB o mas de memoria unificada.
- Opciones de despliegue: MLX y oMLX; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-122B-A10B-oQ3.5e-mtp | 125,086 B | no disponible | Mixta 3-8 bits + BF16 | no disponible | safetensors (MLX) |
| Qwen/Qwen3.5-122B-A10B (base) | 122,112 B (LM) | no disponible | BF16 | no disponible | safetensors |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del checkpoint ni la del modelo base, lo que impide confirmar si el uso comercial esta permitido.
- Cuantizacion agresiva: el 61,8 % de los pesos esta en 3 bits, lo que puede degradar la calidad en tareas sensibles (razonamiento complejo, matematicas, codigo) frente al modelo BF16.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluaciones publicadas que cuantifiquen el impacto de la cuantizacion en este aspecto.
- Sesgos: no documentados en la model card.
- Limitaciones de contexto e idioma: no disponibles.
- Dependencia de MLX: el checkpoint solo es utilizable en el ecosistema Apple Silicon; no hay pesos GGUF ni compatibilidad con CUDA.
- Model card incompleta: no se documentan capacidades, benchmarks, idiomas ni instrucciones de uso detalladas.
- Actualizacion reciente: la model card indica una recuantizacion el 2026-11-11; versiones anteriores deben descargarse de nuevo.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Qwen3.5-122B-A10B-oQ3.5e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
