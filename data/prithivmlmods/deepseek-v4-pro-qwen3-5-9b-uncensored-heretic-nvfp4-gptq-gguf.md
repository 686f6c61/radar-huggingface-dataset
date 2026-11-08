# prithivMLmods/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-NVFP4-GPTQ-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-NVFP4-GPTQ-GGUF es una cuantizacion de 4 bits en formato NVFP4/GPTQ del modelo xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic, un fine-tune de razonamiento de Qwen3.5-9B (atribuido a Jackrong) destilado de DeepSeek-V4-Pro y posteriormente "descensorizado" con la herramienta Heretic v2.0.0.dev0. El autor de la cuantizacion es prithivMLmods, que publica los pesos en GGUF junto con un fichero mmproj para las capacidades de vision. El modelo base declara 9.197.094.384 parametros (aproximadamente 9,2 mil millones) y esta orientado a generacion de texto, razonamiento matematico y STEM, y uso de herramientas.

El interes practico de esta publicacion es la combinacion de tres factores: pesos de 4 bits optimizados para los Tensor Cores FP4 de la arquitectura NVIDIA Blackwell (SM120), decodificacion especulativa MTP integrada en llama.cpp y un pipeline multimodal imagen-texto. El autor reporta una ejecucion de prueba en una RTX PRO 6000 Blackwell con 96 GB de VRAM en la que se alcanzan 280,06 tokens/s de procesamiento de prompt y 223,05 tokens/s de generacion con 28,47 GiB de VRAM pico y 99 capas descargadas a GPU.

Es relevante ahora porque demuestra el estado del arte en cuantizacion para hardware Blackwell y porque el modelo base incorpora un proceso de eliminacion de rechazos medido (de 100/100 a 3/100 rechazos con una divergencia KL de 0,0422), lo que lo hace atractivo para investigacion sobre alineacion y para casos donde los guardrails estandar resultan demasiado restrictivos. Conviene subrayar que las cifras de rendimiento del modelo original no han sido verificadas de forma independiente para esta build cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5), multimodal imagen-texto, con modulo MTP para decodificacion especulativa |
| Parametros totales | 9.197.094.384 (aproximadamente 9,2 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens en la prueba publicada (no se especifica el maximo nativo) |
| Tipos de cuantizacion | NVFP4 / GPTQ (4 bits); KV cache q8_0 en la prueba |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (pesos principales de 8,46 GB y mmproj de 922 MB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3.5 con aproximadamente 9,2 mil millones de parametros, adaptado mediante destilacion desde DeepSeek-V4-Pro y afinado para razonamiento con un pipeline que, segun las etiquetas de la model card, incluye SFT, RL y GSPO, ademas de datos orientados a matematicas, STEM, tool use y function calling. El dataset declarado en los metadatos es HuggingFaceH4/ultrachat_200k. Sobre esa base se aplico Heretic v2.0.0.dev0, una tecnica de "descensorizacion" que reduce la tasa de rechazos del modelo (de 100/100 a 3/100) con una divergencia KL de 0,0422 respecto al modelo original, lo que indica una modificacion acotada de la distribucion de salida.

Esta publicacion concreta no reentrena el modelo: aplica una cuantizacion GPTQ a 4 bits en formato NVFP4, calibrada para preservar la precision y aprovechar las instrucciones FP4 nativas de los Tensor Cores de NVIDIA Blackwell (SM120, GB202, B200, B300). El paquete incluye un fichero mmproj que habilita las capacidades de vision, y el modelo soporta decodificacion especulativa mediante el modulo MTP (Multi-Token Prediction), que en la prueba publicada usa un borrador con `draft_n_max=2`.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento matematico y STEM, con modo de razonamiento (tag `reasoning`) heredado del fine-tune.
- Capacidades multimodales imagen-texto (pipeline `image-text-to-text` y fichero mmproj incluido).
- Tool calling y function calling (etiquetas `tool-use` y `function-calling`).
- Capacidades de agente y razonamiento multi-paso.
- Decodificacion especulativa MTP para acelerar la generacion en llama.cpp.
- Modelo "uncensored"/abliterated: guardrails de seguridad reducidos o eliminados de forma deliberada.
- Sin soporte declarado de audio ni de otros idiomas distintos del ingles.

## Casos de uso

- Razonamiento matematico asistido: resolucion de problemas de algebra, aritmetica y logica (el autor prueba problemas de trenes, depositos, edades y combinatoria) aprovechando el modo de razonamiento y los 8.192 tokens de contexto.
- Generacion y explicacion de codigo: insercion de nodos en listas enlazadas, estructuras de datos y ejercicios algoritmicos, con salida en ingles y soporte de function calling para integrarse en asistentes de IDE.
- Agentes con herramientas: pipelines que requieren llamadas a funciones externas (APIs, calculadoras, bases de datos) gracias a las etiquetas de tool-use y function-calling del modelo base.
- Analisis de imagenes con texto: descripcion, extraccion de informacion o respuesta a preguntas sobre capturas y diagramas mediante el fichero mmproj.
- Investigacion sobre alineacion y seguridad: estudio del efecto de la descensorizacion (Heretic) sobre la tasa de rechazos y la calidad, con una metrica publicada de KL de 0,0422.
- Despliegue en hardware Blackwell: inferencia de baja latencia en RTX PRO 6000, RTX 50-series, B200 o B300 aprovechando los Tensor Cores FP4; el autor reporta 223 tokens/s de generacion en una RTX PRO 6000.
- Evaluacion de tecnicas de cuantizacion: comparacion de NVFP4/GPTQ frente a otros formatos (GGUF q4, q8) en terminos de precision y throughput.

## Benchmarks y rendimiento

Resultados reportados para el modelo original (no verificados de forma independiente para esta build cuantizada):

| Benchmark | Resultado |
|---|---|
| GSM8K | 94,50 % |
| MMLU-Pro (muestra STEM) | 90,53 % |

Metricas de la prueba de inferencia publicada (RTX PRO 6000 Blackwell, 96 GB VRAM, llama-cli, `-ngl 99`, contexto 8.192, KV cache q8_0, MTP con `draft_n_max=2`, semilla 42, 5 ejecuciones):

| Metrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 280,06 tokens/s |
| Velocidad media de generacion | 223,05 tokens/s |
| Tiempo total de pared | 42,0 s |
| VRAM pico | 28,47 GiB |
| Utilizacion de GPU pico | 90 % |
| Capas descargadas a GPU | 99 |

No se han publicado resultados de benchmarks independientes para esta cuantizacion NVFP4/GPTQ en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos GGUF ocupan 8,46 GB y el mmproj 922 MB; la prueba publicada alcanza 28,47 GiB pico con contexto de 8.192 tokens y KV cache q8_0.
- GPU recomendadas: NVIDIA Blackwell con soporte FP4 nativo, es decir, RTX PRO 6000 Blackwell, RTX 50-series, B200 y B300 (SM120/GB202). El rendimiento optimo depende de estas instrucciones.
- GPU de consumo: cabe en tarjetas consumer con al menos 10-12 GB de VRAM para los pesos, aunque sin aceleracion FP4 nativa el rendimiento sera inferior; no se han publicado mediciones en GPUs no Blackwell.
- Opciones de despliegue: llama.cpp (probado por el autor con `llama-cli`), y por las etiquetas del repositorio tambien text-generation-inference y transformers; el formato GGUF es compatible con Ollama y otros runners basados en llama.cpp.
- Latencia y throughput: 280,06 tokens/s de prompt y 223,05 tokens/s de generacion en RTX PRO 6000 Blackwell con MTP activado y 99 capas en GPU; el rendimiento varia con el prompt, el build de software y la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-NVFP4-GPTQ-GGUF (este) | 9,2 B | 8.192 en prueba | GGUF NVFP4/GPTQ + mmproj | Apache 2.0 | Optimizado para Blackwell; GSM8K 94,50 % reportado |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (base) | 9,2 B | no disponible | safetensors | Apache 2.0 | Modelo sin cuantizar del que deriva esta build |
| Qwen3.5-9B (familia base) | 9 B aprox. | no disponible | safetensors / GGUF | no disponible en la informacion | Modelo original sobre el que se hizo el fine-tune de razonamiento |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored"/abliterated: los guardrails de seguridad han sido reducidos o eliminados de forma deliberada; puede generar contenido que otros modelos rechazarian. Requiere moderacion externa en produccion.
- Solo soporta ingles segun los metadatos; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion inherente a los modelos de 9 B, especialmente en razonamiento multi-paso y matematicas complejas.
- Las cifras de GSM8K y MMLU-Pro corresponden al modelo original y no han sido verificadas para esta cuantizacion de 4 bits; la cuantizacion puede degradar la precision.
- El contexto probado es de 8.192 tokens; no se especifica la longitud maxima nativa ni su comportamiento mas alla de esa ventana.
- La aceleracion FP4 esta ligada a hardware NVIDIA Blackwell; en otras GPUs el rendimiento sera notablemente inferior.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado y el cumplimiento normativo recaen en el desplegador.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay validacion comunitaria ni resultados independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-NVFP4-GPTQ-GGUF
- Pesos GGUF: https://huggingface.co/prithivMLmods/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-NVFP4-GPTQ-GGUF/blob/main/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-NVFP4-GPTQ.gguf
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor de la cuantizacion: https://huggingface.co/prithivMLmods
- Dataset declarado: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
