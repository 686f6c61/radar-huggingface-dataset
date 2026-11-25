# scottlowry/Qwen3.5-122B-A10B-oQ6e-fp16-mtp

## Resumen

Qwen3.5-122B-A10B-oQ6e-fp16-mtp es una cuantizacion mixta del modelo Qwen/Qwen3.5-122B-A10B, publicada por el usuario scottlowry en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una version comprimida del checkpoint original de Qwen, orientada a la inferencia en hardware Apple Silicon mediante la libreria MLX. La cuantizacion se ha realizado con la herramienta oQ de oMLX (version v0.7.4.dev1), que aplica precision mixta por capas y grupos de pesos.

El modelo base es un transformer de tipo MoE (mixture of experts) con 125.086.497.008 parametros totales segun los safetensors del repositorio, de los cuales 122.112B corresponden al modelo de lenguaje, 0.451B a la torre de vision y 2.524B a una cabeza MTP (multi-token prediction) que permite decodificacion especulativa. El checkpoint resultante ocupa 104,7 GB en disco (97,487 GiB) con una media efectiva de 6,695 bits por peso, lo que lo situa en un rango de cuantizacion de 6 bits apto para equipos con memoria unificada amplia.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de escala 122B en Macs de gama alta con MLX, manteniendo la torre de vision y la cabeza MTP en precisiones superiores (FP16/FP32) para preservar calidad. Es una ficha de interes para desarrolladores que trabajan en ecosistema Apple y quieren evaluar modelos grandes sin depender de GPUs NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), con torre de vision y cabeza MTP |
| Parametros totales | 125.086.497.008 (122,112B LM + 0,451B vision + 2,524B MTP) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 6-bit grupo 64 (94,639%), affine 8-bit grupo 128 (0,370%), affine 8-bit grupo 64 (4,583%), FP16 (0,048%), FP32 (0,361%); media 6,695 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), 104,7 GB en repo |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-122B-A10B, un transformer con arquitectura de mezcla de expertos (MoE) segun el tag `qwen3_5_moe`. Incluye tres componentes diferenciados: el modelo de lenguaje principal (122,112B parametros logicos), una torre de vision (0,451B) y una cabeza MTP de prediccion multi-token (2,524B). La presencia de la cabeza MTP sugiere soporte para decodificacion especulativa, una tecnica que acelera la generacion al predecir varios tokens por paso y verificarlos en paralelo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. Tampoco se detalla la innovacion arquitectonica interna mas alla de la naturaleza MoE y la cabeza MTP. Esta ficha se centra en la cuantizacion: oQ aplica precision mixta asignando 6 bits a la mayoria de pesos del LM (94,6%), 8 bits a un subconjunto pequeno (4,95%) y manteniendo en FP16/FP32 los tensores sensibles (0,41%), lo que preserva la calidad en capas criticas a costa de un ligero aumento de tamano.

## Capacidades

- Generacion de texto y razonamiento: el modelo base Qwen3.5 esta disenado para tareas de razonamiento complejo, aunque no se detallan capacidades especificas en la informacion disponible.
- Vision: incluye una torre de vision de 0,451B parametros, por lo que se espera soporte de entrada multimodal (imagenes), aunque no se confirma en la model card.
- Decodificacion especulativa: la cabeza MTP de 2,524B permite acelerar la generacion mediante prediccion multi-token.
- Codigo y matematicas: no confirmado explicitamente para esta version; el modelo base Qwen suele incluir estas capacidades, pero no hay datos en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Modo thinking: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y la cuantizacion de 6,695 bits permiten ejecutar un modelo de 122B en Macs con memoria unificada de 128 GB o superior, ideal para desarrolladores que trabajan en ecosistema Apple sin GPUs dedicadas.
- Prototipado de aplicaciones multimodales: la torre de vision integrada permite experimentar con tareas imagen-texto en local, aunque la calidad exacta no esta documentada.
- Aceleracion de generacion con MTP: la cabeza de prediccion multi-token puede usarse para decodificacion especulativa, reduciendo la latencia en tareas de generacion larga como resumenes o redaccion asistida.
- Investigacion en cuantizacion: el desglose detallado de bits por componente lo convierte en un caso de estudio util para evaluar el impacto de la precision mixta en modelos MoE grandes.
- Despliegue en entornos con restricciones de red: al ser un checkpoint local, permite trabajar con modelos de gran escala sin depender de APIs externas, util en entornos sanitarios o financieros con requisitos de privacidad.
- Evaluacion comparativa de tecnicas de compresion: sirve como referencia para comparar oQ frente a otras herramientas de cuantizacion (GGUF, AWQ, GPTQ) en el mismo modelo base.
- Fine-tuning ligero o adaptacion: aunque no se documenta, el checkpoint puede servir como base para experimentos de adaptacion con LoRA en MLX, siempre que el hardware lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 97,487 GiB (104,7 GB) en disco; para inferencia se necesita memoria suficiente para pesos mas cache KV, por lo que se recomienda al menos 128 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: no aplica GPU NVIDIA de forma nativa; el formato es MLX, orientado a Apple Silicon (M-series). Para GPUs NVIDIA habria que reconvertir el modelo.
- Cabe en consumer GPU: no en GPUs de consumo convencionales (RTX 4090 con 24 GB es insuficiente). Requiere Macs con 128 GB o mas (M2 Ultra, M3 Ultra, M4 Max con configuracion alta).
- Opciones de despliegue: MLX (libreria nativa), oMLX para carga del checkpoint; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-122B-A10B-oQ6e-fp16-mtp | 125,086B | no disponible | 6,695 bits/peso (mixta) | no disponible | safetensors MLX |
| Qwen/Qwen3.5-122B-A10B (base) | 122B (aprox.) | no disponible | FP16/BF16 original | no disponible | safetensors |
| Alternativas GGUF de Qwen3.5-122B | no disponible | no disponible | 4-8 bits tipico | no disponible | GGUF |

No se dispone de datos de rendimiento comparativo ni de otras cuantizaciones equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar del modelo base Qwen, podria heredar sesgos de sus datos de entrenamiento, pero no hay informacion al respecto.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de gran escala; no se han publicado evaluaciones especificas para esta cuantizacion.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no estan declarados en la model card.
- Restricciones de licencia: la licencia no esta disponible; es imprescindible consultar la licencia del modelo base Qwen/Qwen3.5-122B-A10B antes de cualquier uso comercial.
- Caveat de produccion: la cuantizacion mixta puede degradar ligeramente la calidad frente al modelo original en FP16; no hay benchmarks que cuantifiquen esta perdida.
- Compatibilidad: el formato MLX limita el despliegue a Apple Silicon; no es portable directamente a GPUs NVIDIA o TPUs sin reconversion.
- Actualizacion reciente: la model card indica que se re-cuantizo el 2026-11-11 con oMLX v0.7.4.dev1; versiones anteriores pueden tener diferencias, por lo que conviene descargar la version actual.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Qwen3.5-122B-A10B-oQ6e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
