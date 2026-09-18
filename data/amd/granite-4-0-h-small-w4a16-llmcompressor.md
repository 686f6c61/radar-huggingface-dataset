# amd/granite-4.0-h-small-w4a16-llmcompressor

## Resumen

`amd/granite-4.0-h-small-w4a16-llmcompressor` es una version cuantizada del modelo `ibm-granite/granite-4.0-h-small` de IBM, publicada por AMD y orientada a inferencia en CPU sobre procesadores AMD EPYC. La cuantizacion se ha realizado con LLM Compressor v0.13.0 mediante GPTQ en esquema W4A16: pesos en INT4 simetrico con group_size de 128 y activaciones en BF16, lo que reduce el peso en disco de 60,0 GiB a 16,1 GiB (aproximadamente un 73 % menos).

El modelo base es una arquitectura hibrida Mamba-MoE (`GraniteMoeHybridForCausalLM`) de 32.207.337.984 parametros totales: de sus 40 capas, 4 son bloques de atencion completa y 36 son bloques Mamba de atencion lineal, y cada capa incorpora un bloque MoE de 72 expertos con enrutamiento top-10 junto a una MLP compartida. La ficha se publico el 18 de septiembre de 2026 y, en el momento de la consulta, acumulaba 0 descargas y 0 likes.

Su relevancia practica esta en el coste de despliegue: al reducir el peso a 16,1 GiB, permite servir un modelo MoE de 32B en CPU EPYC con el stack ZenDNN/ZenTorch/vLLM, sin necesidad de aceleradores GPU. Es, por tanto, una pieza pensada para entornos on-premise, air-gapped o con restricciones de coste de GPU, no para maximizar calidad absoluta frente al modelo en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraniteMoeHybridForCausalLM (hibrida Mamba-MoE: 40 capas, 4 de atencion completa y 36 Mamba de atencion lineal; en cada capa, MoE de 72 expertos con enrutamiento top-10 mas MLP compartida) |
| Parametros totales | 32.207.337.984 (32,2 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16: INT4 simetrico, weight-only, group_size=128, GPTQ; activaciones en BF16 sin cuantizar |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato compressed-tensors (pack-quantized) |

Datos adicionales de publicacion: tamano del repositorio 17,2 GB, libreria `transformers`, pipeline `text-generation`, autor `amd`, relacion con el modelo base `quantized`.

## Arquitectura y entrenamiento

Este repositorio no entrena un modelo nuevo: cuantiza el checkpoint `ibm-granite/granite-4.0-h-small`. La cuantizacion se aplico con GPTQ sobre 128 muestras de calibracion de `HuggingFaceH4/ultrachat_200k` con longitud de secuencia 2048. Se cuantizaron los 72 expertos enrutados de cada capa (`block_sparse_moe.experts.*.{gate,up,down}_proj`), la MLP compartida (`shared_mlp.{input,output}_linear`), las proyecciones de Mamba (`mamba.{in,out}_proj`) y las proyecciones `self_attn.{q,k,v,o}_proj` de las 4 capas de atencion completa. Se mantuvieron en BF16 los enrutadores MoE (`block_sparse_moe.router`), los internals de espacio de estados que no son capas lineales (`conv1d`, `A_log`, `D`, `dt_bias` y la `mamba.norm` con compuerta), `lm_head`, `embed_tokens` y las layer norms.

Hay dos decisiones tecnicas relevantes. La primera es el uso de `load_context()` de LLM Compressor v0.13, la ruta de linearizacion de MoE que expone los tensores fusionados de expertos como submodulos `Linear` individuales, de modo que GPTQ puede construir una matriz de Hessian por experto sin intercambio manual de modulos. La segunda es la exclusion del enrutador: al ser una capa lineal diminuta cuyos logits determinan la asignacion de expertos, un error de redondeo a 4 bits podria alterar la seleccion top-k y cambiar que expertos se ejecutan. No se documenta en la informacion disponible ningun proceso de RLHF o DPO especifico de esta version cuantizada.

## Capacidades

- Generacion de texto en ingles: tarea declarada en el pipeline (`text-generation`) y en los tags del repositorio.
- Uso conversacional: el repositorio incluye el tag `conversational`, y el ejemplo de la model card realiza una prueba de generacion con prompt conversacional.
- Cuantizacion para inferencia en CPU: capacidades de despliegue sobre AMD EPYC con ZenDNN, ZenTorch, PyTorch y vLLM.
- Razonamiento, codigo, matematicas o vision: no disponible en la informacion proporcionada.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el unico idioma declarado es `en`.
- Modo de pensamiento explicito (thinking mode), audio o vision: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia de un modelo MoE de 32B sin GPU: al pasar de 60,0 GiB a 16,1 GiB, el checkpoint se puede cargar en memoria de servidores AMD EPYC y servir con vLLM v0.29.0 y ZenDNN v6.1.0, evitando el coste de aceleradores dedicados.
- Atencion al cliente automatizada en ingles: la etiqueta `conversational` y el soporte multi-turno del stack de vLLM permiten gestionar dialogos encadenados; conviene validar en produccion la degradacion introducida por la cuantizacion a 4 bits.
- Procesamiento por lotes de texto en ingles: resumen, extraccion de informacion o clasificacion sobre volumenes grandes de documentos, donde el coste por token en CPU puede compensar frente a GPU si el throughput agregado es suficiente.
- Despliegues on-premise o air-gapped: entornos con requisitos de privacidad o sin acceso a GPU, donde el modelo puede servirse localmente con el stack Linux documentado (PyTorch 2.13.0.0, ZenTorch 2.13.0.0, vLLM 0.29.0).
- Validacion de pipelines de cuantizacion W4A16 sobre arquitecturas hibridas Mamba-MoE: la model card incluye la receta completa reproducible con `GPTQModifier`, `load_context()` y las listas de modulos cuantizados e ignorados, util como referencia para cuantizar variantes similares.
- Base para evaluar el rendimiento de ZenDNN/ZenTorch en CPU: el modelo sirve como carga de trabajo representativa para medir latencia y throughput del stack de AMD en EPYC con cargas MoE.
- Generacion de texto asistida en herramientas internas de documentacion o respuestas frecuentes en ingles, en escenarios donde la calidad de un modelo cuantizado es suficiente y el determinismo de la infraestructura importa mas que el rendimiento punta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card de esta version cuantizada no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de perplejidad, y tampoco cuantifica la degradacion respecto al modelo base en BF16 mas alla de la reduccion de tamano (60,0 GiB a 16,1 GiB, aproximadamente 73 %).

## Requisitos de hardware

- Hardware objetivo declarado: AMD EPYC para inferencia en CPU. Sistema operativo preferido: Linux.
- VRAM estimada para inferencia: no aplica al escenario objetivo (CPU). Los pesos ocupan 16,1 GiB en disco; en memoria habria que sumar el overhead del runtime y la cache KV, cuyo tamano depende de la longitud de contexto, dato no disponible.
- GPU recomendadas: no especificadas en la informacion disponible. El repositorio esta orientado a CPU y no documenta despliegue en A100, H100 u otras GPU.
- Viabilidad en GPU de consumo: no confirmada. Por tamano de pesos (16,1 GiB) cabria teoricamente en tarjetas de 24 GB como la RTX 4090 o la RTX 3090, pero el soporte del formato compressed-tensors en GPU y el eager/lazy loading del stack no estan documentados para este checkpoint.
- Opciones de despliegue: vLLM v0.29.0 como motor de inferencia, sobre ZenDNN v6.1.0, ZenTorch v2.13.0.0, PyTorch v2.13.0.0 y LLM Compressor v0.13.0. No se documentan variantes GGUF, por lo que llama.cpp, Ollama u otros runtimes basados en GGUF no son aplicables a este repositorio.
- Ajuste de OpenMP: la model card recomienda definir `LD_PRELOAD` con `libomp.so` (LLVM OpenMP) o `libiomp5.so` (Intel OpenMP) para un rendimiento optimo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amd/granite-4.0-h-small-w4a16-llmcompressor | 32,2B totales | W4A16 INT4 GPTQ, group_size 128 | 16,1 GiB | apache-2.0 | HuggingFace |
| ibm-granite/granite-4.0-h-small (modelo base) | 32,2B totales | BF16 sin cuantizar | 60,0 GiB | no disponible en la informacion proporcionada | HuggingFace |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion soportada por la informacion proporcionada es contra el modelo base: misma arquitectura y mismo numero de parametros, con una reduccion de tamano de 60,0 GiB a 16,1 GiB y una perdida de calidad no cuantificada en la documentacion. No se dispone de datos de rendimiento de terceros alternativos en la informacion consultada.

## Limitaciones y advertencias

- Degradacion por cuantizacion: el paso a INT4 weight-only introduce error de redondeo en pesos. La model card no publica metricas de calidad (perplejidad, MMLU, HumanEval) que permitan cuantificar la perdida frente al modelo base en BF16.
- Enrutamiento de expertos: los enrutadores MoE se mantienen deliberadamente en BF16 porque el redondeo a 4 bits puede alterar la seleccion top-k. Cualquier modificacion de la receta que cuantice el router puede degradar el comportamiento del modelo.
- Idioma: el unico idioma declarado es el ingles. No hay soporte multilingue documentado.
- Contexto: la longitud de contexto soportada no se documenta en la informacion disponible, lo que impide planificar cargas con ventanas largas.
- Dependencia de stack: el modelo requiere versiones concretas de software (vLLM 0.29.0, ZenDNN 6.1.0, ZenTorch 2.13.0.0, PyTorch 2.13.0.0, LLM Compressor 0.13.0) y sistema Linux. Esto limita la portabilidad y complica el mantenimiento si esas versiones quedan obsoletas.
- Sin variantes GGUF: al publicarse solo en compressed-tensors, no se puede desplegar con llama.cpp, Ollama ni otros runtimes que dependen de GGUF.
- Riesgo de alucinacion: no hay informacion especifica sobre tasas de alucinacion de esta version cuantizada; se hereda el comportamiento del modelo base, no evaluado en la documentacion disponible.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad para este checkpoint cuantizado.
- Licencia: apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base `ibm-granite/granite-4.0-h-small` antes de un despliegue en produccion.
- Traccion nula en el momento de la consulta: 0 descargas y 0 likes, sin evidencia de uso en produccion por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amd/granite-4.0-h-small-w4a16-llmcompressor
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-small
- LLM Compressor (repositorio): https://github.com/vllm-project/llm-compressor
- Documentacion de vLLM: https://docs.vllm.ai/en/latest/
- Dataset de calibracion: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- AMD (web corporativa): https://www.amd.com/en.html

Nota sobre la busqueda web: los resultados obtenidos corresponden a paginas corporativas y de caracter general sobre AMD (amd.com, Wikipedia, TechSpot), sin informacion tecnica adicional sobre este checkpoint ni benchmarks asociados.
