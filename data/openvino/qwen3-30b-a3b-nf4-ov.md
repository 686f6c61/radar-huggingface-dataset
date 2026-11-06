# OpenVINO/Qwen3-30B-A3B-nf4-ov

## Resumen

OpenVINO/Qwen3-30B-A3B-nf4-ov es una conversion del modelo Qwen3-30B-A3B de Alibaba Qwen al formato OpenVINO IR (Intermediate Representation), con los pesos comprimidos a 4 bits en formato NF4 mediante NNCF. No se trata de un modelo nuevo, sino de un artefacto de despliegue optimizado para ejecutar el modelo original en hardware Intel, incluyendo NPU, a traves de OpenVINO GenAI. El modelo base es un transformer de mezcla de expertos (MoE) con 30.500 millones de parametros totales y 3.300 millones de parametros activos por token.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 30B con activacion de 3,3B en hardware de consumo o en aceleradores Intel, reduciendo el peso en disco a 15,6 GB gracias a la cuantizacion NF4 canal a canal con AWQ y estimacion de escala. Es una opcion practica para despliegues en CPU y NPU Intel donde no se dispone de GPU de gran VRAM, aunque la compatibilidad NF4 depende del modelo concreto de NPU.

El checkpoint corresponde al Qwen3 original, con modos de razonamiento (thinking) y no-thinking, no a las variantes Base ni Instruct-2507. La licencia es Apache 2.0, lo que facilita su uso comercial, y el repositorio fue creado y actualizado en octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), familia Qwen3 (qwen3_moe) |
| Parametros totales | 30.500 millones (30,5B) |
| Parametros activos | 3.300 millones (3,3B) por token |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-30B-A3B la define; esta exportacion no la declara) |
| Tipos de cuantizacion | NF4 (NormalFloat de 4 bits), canal a canal (group_size -1), ratio 1.0, AWQ y scale_estimation activados, dataset wikitext2 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (comprimido a NF4 mediante NNCF); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3-30B-A3B es un transformer decoder-only con arquitectura de mezcla de expertos: 30,5B parametros totales pero solo 3,3B activos por token, lo que reduce el coste computacional de inferencia manteniendo una capacidad de representacion propia de un modelo de 30B. Esta exportacion no reentrena ni modifica la arquitectura: convierte los pesos originales a OpenVINO IR y aplica compresion de pesos NF4 con NNCF, usando compresion canal a canal (group_size -1), ratio 1.0, AWQ y estimacion de escala sobre wikitext2. NF4 es un formato de pesos de 4 bits NormalFloat, distinto de INT4; la opcion `--sym` no cambia el modo de compresion a INT4_SYM.

El checkpoint es el Qwen3 original con modos thinking y no-thinking, y conserva el chat template del modelo fuente, que permite desactivar el razonamiento mediante `enable_thinking: False`. La exportacion se realizo con OpenVINO 2026.4.0, OpenVINO GenAI 2026.4.0 y OpenVINO Tokenizers 2026.4.0. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO en la informacion proporcionada; esos datos corresponden a la model card del modelo base Qwen3-30B-A3B.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredada del modelo base Qwen3-30B-A3B.
- Modo de razonamiento (thinking) y modo no-thinking, seleccionables a traves del chat template (`enable_thinking`).
- Razonamiento multi-paso y descomposicion de problemas, segun las capacidades del modelo base.
- Generacion de codigo y matematicas: capacidades propias del modelo fuente, no verificadas de forma independiente en esta exportacion.
- Soporte multilingue: no disponible en la informacion proporcionada para esta exportacion; depende del modelo base.
- Tool calling y function calling: no documentado en esta model card; debe consultarse la del modelo base.
- Capacidades de agente: no documentadas en esta model card.
- Inferencia en NPU Intel compatible con NF4 y en CPU mediante OpenVINO GenAI.

## Casos de uso

- Despliegue en equipos con NPU Intel: el modelo esta pensado para ejecutarse con `ov_genai.LLMPipeline` en dispositivo NPU, lo que permite inferencia local de un modelo de 30B en portatiles y mini-PC con NPU compatible con NF4.
- Asistentes conversacionales locales: con el chat template del modelo y el modo no-thinking desactivado, se puede construir un asistente de texto que corre integramente en hardware Intel sin GPU dedicada.
- Razonamiento con modo thinking en entornos sin GPU: activando `enable_thinking`, el modelo puede abordar tareas de razonamiento multi-paso en CPU o NPU, con la latencia adicional que implica generar la cadena de razonamiento.
- Generacion aumentada por recuperacion (RAG): los notebooks de OpenVINO incluyen ejemplos de generacion de texto con RAG; el modelo puede integrarse como generador en un pipeline de recuperacion documental.
- Procesamiento por lotes en servidores Intel: al ser un artefacto OpenVINO IR, puede desplegarse con OpenVINO GenAI en infraestructura Intel para tareas de generacion de texto a escala moderada.
- Prototipado y evaluacion de modelos MoE: util para desarrolladores que quieran probar el comportamiento de Qwen3-30B-A3B con cuantizacion de 4 bits antes de decidir un despliegue mayor.
- Sustitucion de modelos densos de 7B-13B en entornos con poca VRAM: con 15,6 GB de pesos en disco y 3,3B parametros activos, ofrece mas capacidad que un denso pequeno a cambio de mayor huella de memoria total.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de latencia o throughput, y advierte que la precision cuantitativa de esta exportacion NF4 concreta no ha sido validada de forma independiente.

## Requisitos de hardware

- VRAM o memoria estimada: los pesos ocupan 15,6 GB en el repositorio; hay que anadir memoria para buffers de runtime y cache KV, por lo que el consumo real supera esa cifra. El numero de parametros activos (3,3B) no describe la huella total de memoria.
- GPU recomendadas: no se especifican en la model card; el artefacto esta orientado a NPU y CPU Intel mediante OpenVINO, no a GPU NVIDIA.
- NPU: requiere una NPU Intel compatible con NF4 y un driver de NPU Intel compatible. NF4 no esta soportado en todas las NPU Intel.
- CPU: ejecutable mediante OpenVINO GenAI en CPU Intel, con rendimiento dependiente del numero de nucleos y del ancho de banda de memoria.
- Consumer GPU: no documentado; el formato OpenVINO IR no es directamente compatible con CUDA, por lo que no es la via natural para GPUs de consumo NVIDIA.
- Opciones de despliegue: OpenVINO GenAI (`ov_genai.LLMPipeline`), con versiones 2026.4.0 de openvino, openvino-tokenizers y openvino-genai. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Memoria del sistema: la model card recomienda asegurar memoria suficiente para los pesos completos y los buffers de runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| OpenVINO/Qwen3-30B-A3B-nf4-ov | 30,5B | 3,3B | no disponible | OpenVINO IR NF4 | Apache 2.0 | Optimizado para NPU/CPU Intel |
| Qwen/Qwen3-30B-A3B | 30,5B | 3,3B | no disponible en esta informacion | safetensors | Apache 2.0 | Modelo original sin cuantizar |
| Otras exportaciones OpenVINO de Qwen3 | no disponible | no disponible | no disponible | OpenVINO IR | Apache 2.0 | No se dispone de datos de otras variantes en la informacion |

No se dispone de datos de benchmarks ni de modelos comparables de otros autores en la informacion proporcionada para establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- La precision cuantitativa de esta exportacion NF4 concreta no ha sido validada de forma independiente por el autor de la model card.
- La compatibilidad de esta exportacion MoE con NF4 debe verificarse en el dispositivo NPU objetivo; no todas las NPU Intel soportan NF4.
- Los limites de contexto en NPU dependen de la configuracion del pipeline y no equivalen necesariamente a la longitud de contexto del modelo base.
- El consumo de memoria debe calcularse sobre los 30,5B parametros totales, no sobre los 3,3B activos; el modelo requiere memoria para todos los pesos y para los buffers de runtime.
- Riesgo de alucinacion y sesgos: deben consultarse las limitaciones del modelo base Qwen3-30B-A3B, ya que esta exportacion no las modifica ni las documenta.
- Idiomas soportados no declarados en esta model card; la cobertura linguistica depende del modelo base.
- Uso comercial permitido por la licencia Apache 2.0, con las condiciones de la licencia original del modelo base.
- La cuantizacion a 4 bits puede degradar la calidad frente al modelo original en tareas sensibles, especialmente en razonamiento y codigo; no hay datos publicados que cuantifiquen esa degradacion.
- El formato OpenVINO IR limita el despliegue a la cadena de herramientas de OpenVINO; no es portable a ecosistemas como llama.cpp o vLLM sin conversion adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OpenVINO/Qwen3-30B-A3B-nf4-ov
- Modelo base Qwen3-30B-A3B: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B/blob/main/LICENSE
- Formato OpenVINO IR: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Guia de compresion de pesos de OpenVINO: https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/weight-compression.html
- Guia de OpenVINO GenAI en NPU: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai/inference-with-genai-on-npu.html
- Documentacion de OpenVINO GenAI: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai.html
- Repositorio OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
- Ejemplos de OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai?tab=readme-ov-file#openvino-genai-samples
- NNCF: https://github.com/openvinotoolkit/nncf
- Notebooks de OpenVINO (LLM): https://openvinotoolkit.github.io/openvino_notebooks/?search=LLM
- Notebooks de OpenVINO (RAG): https://openvinotoolkit.github.io/openvino_notebooks/?search=RAG+system&tasks=Text+Generation
- Driver de NPU Intel: https://www.intel.com/content/www/us/en/download/794734/intel-npu-driver-windows.html
- Principios globales de derechos humanos de Intel: https://www.intel.com/content/dam/www/central-libraries/us/en/documents/policy-human-rights.pdf
