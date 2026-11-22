# FarhadSu/Gemma-4-26B-A4B-Uncensored-GGUF

## Resumen

Gemma-4-26B-A4B-Uncensored-GGUF es una cuantizacion GGUF del checkpoint abliterated (sin censura) del modelo instructivo google/gemma-4-26b-a4b-it, publicada por el usuario FarhadSu. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 25.233.142.046 parametros totales, del que la model card indica que solo una fraccion (A4B, aproximadamente 4.000 millones) esta activa por token. El autor lo ha empaquetado en un unico fichero IQ3_XXS de 11,2 GB con importance matrix, pensado para caber en una GPU de 16 GB de VRAM manteniendo contexto largo.

El problema que resuelve es doble: por un lado, ofrecer una version sin rechazos del modelo Gemma 4 MoE para casos donde el filtrado de seguridad del modelo original resulta limitante; por otro, permitir ejecutar un MoE de 26B en hardware consumer modesto mediante cuantizacion agresiva de 3 bits con imatrix. El autor reporta pruebas en llama.cpp con backend Vulkan sobre dos RX 580 de 8 GB, con velocidades de generacion de 27-34 tokens por segundo y carga de contexto de hasta 256K tokens en 14,8 GB de VRAM.

La relevancia actual radica en que demuestra la viabilidad de desplegar modelos MoE grandes en GPUs de gama media mediante tecnicas de cuantizacion avanzada (IQ3_XXS con imatrix y tensor de salida IQ4_NL), aunque con limitaciones claras en idiomas de bajos recursos y en la verificacion de retrieval mas alla de 30K tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer, basada en google/gemma-4-26b-a4b-it |
| Parametros totales | 25.233.142.046 |
| Parametros activos | A4B (aproximadamente 4.000 millones activos por token, segun nomenclatura del modelo base) |
| Longitud de contexto | Hasta 256K tokens (carga verificada en llama.cpp con 14,8 GB de VRAM); retrieval verificado solo hasta 30K |
| Tipos de cuantizacion | IQ3_XXS con importance matrix (imatrix), tensor de salida IQ4_NL |
| Idiomas soportados | No disponible (el imatrix de calibracion es solo en ingles) |
| Licencia | other (enlazada a la licencia de google/gemma-4-26b-a4b-it) |
| Formato de pesos | GGUF (fichero unico de 11,2 GB) |

## Arquitectura y entrenamiento

El modelo base es google/gemma-4-26b-a4b-it, un transformer con arquitectura Mixture of Experts de 26B parametros totales y aproximadamente 4B activos por token. El checkpoint publicado por FarhadSu es una version abliterated (sin censura) en FP8, que posteriormente se convirtio a GGUF Q8_0 mediante el script `convert_hf_to_gguf.py` de llama.cpp, parcheado especificamente para escribir y cuantizar correctamente los tensores de expertos fusionados `ffn_gate_up_exps.weight`.

La cuantizacion final se realizo con `llama-quantize IQ3_XXS --imatrix`, usando una importance matrix construida a partir de 66 fragmentos de 512 tokens de un corpus de calibracion en ingles orientado a codigo y agentes. El tensor de salida se cuantizo a IQ4_NL. No se dispone de informacion sobre el proceso de entrenamiento original (numero de tokens, composicion del dataset, RLHF/DPO) ni sobre el metodo exacto de abliteration aplicado, mas alla de que el autor lo describe como "uncensored (abliterated)".

## Capacidades

- Generacion de texto conversacional en formato instruct.
- Razonamiento aritmetico y logico: el autor verifica respuestas correctas en problemas tipo "bat and ball" y de widgets.
- Generacion de codigo: verificado con un test de calculo del n-esimo numero primo.
- Respuestas sin rechazo ante peticiones que el modelo original filtraria (abliterated).
- Retrieval de contexto largo: needle-in-haystack superado en 4K, 16K y 30K tokens.
- Carga de contexto de hasta 256K tokens en llama.cpp (verificado el uso de VRAM, no la calidad del retrieval a esa longitud).
- Compatible con el flag `--jinja` de llama.cpp, lo que habilita plantillas de chat y potencialmente tool calling segun la plantilla del modelo base.
- Capacidades multilingues: no verificadas; el autor advierte de bucles de repeticion en idiomas de bajos recursos (por ejemplo, azerbaiyano).

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de un LLM sin filtros de rechazo, util para analizar sesgos, riesgos y eficacia de mecanismos de seguridad en modelos abliterated.
- Despliegue en hardware consumer con VRAM limitada: con 11,2 GB en IQ3_XXS cabe en GPUs de 16 GB, permitiendo ejecutar un MoE de 26B en equipos de gama media o en configuraciones multi-GPU modestas como las dos RX 580 del autor.
- Procesamiento de documentos largos en local: la ventana de 256K tokens permite cargar contratos, informes o bases de codigo extensas, aunque el retrieval fiable se limita a unos 30K tokens segun las pruebas del autor.
- Asistencia a la programacion en entornos aislados: el modelo genera codigo y razona sobre problemas algoritmicos, adecuado para pipelines de CI/CD o asistentes locales donde no se desea dependencia de APIs externas.
- Generacion de texto creativo sin restricciones editoriales: util para escritura de ficcion, guiones o contenido donde el filtrado del modelo base resulta limitante, siempre con supervision humana.
- Experimentacion con cuantizacion extrema: sirve como caso de estudio de hasta donde se puede comprimir un MoE con imatrix e IQ3_XXS manteniendo coherencia en tareas de codigo y razonamiento.
- Prototipado de agentes conversacionales: la compatibilidad con `--jinja` y el contexto largo permiten construir agentes multi-turno en local, aunque la latencia en hardware antiguo limita su uso interactivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor unicamente reporta pruebas cualitativas y metricas de velocidad en su hardware:

| Prueba | Resultado |
|---|---|
| Codigo (n-esimo primo) | Correcto |
| Razonamiento (bat & ball, widgets) | Correcto |
| Sin censura (explicacion de lock picking) | Responde sin rechazo |
| Needle-in-haystack 4K / 16K / 30K | Correcto / Correcto / Correcto |
| Contexto 256K | Carga con 14,8 GB VRAM; prompt de 117K pico de 15,6 GB |
| Generacion | 27-34 t/s |
| Procesamiento de prompt | 292 t/s @4K, 192 @16K, 128 @30K, ~55 @117K |

Hardware de prueba: llama.cpp con backend Vulkan, 2x RX 580 8 GB, KV cache q8_0, flash-attn activado, `ubatch-size 256`.

## Requisitos de hardware

- VRAM estimada: 11,2 GB para los pesos en IQ3_XXS, mas la KV cache. Con contexto de 256K y KV q8_0 el autor reporta 14,8 GB; un prompt de 117K alcanzo 15,6 GB.
- GPU recomendadas: el autor lo prueba en 2x RX 580 8 GB (Vulkan). Por tamano, cabe en RTX 4080/4090 (16-24 GB), A100 40 GB, H100, y en GPUs de 16 GB como RTX 4060 Ti 16 GB o RX 7600 XT 16 GB.
- Cabe en GPU consumer: si, en modelos con 16 GB o mas de VRAM, o mediante offload parcial a CPU en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), con backend Vulkan o CUDA; compatible con el flag `--jinja`. No se menciona soporte verificado en vLLM, TGI u Ollama.
- Latencia y throughput: 27-34 t/s de generacion y 292 t/s de procesamiento de prompt a 4K en 2x RX 580; el rendimiento decae a ~55 t/s de prompt a 117K tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-Uncensored-GGUF (este) | 25,2B totales / ~4B activos | Hasta 256K (retrieval verificado a 30K) | IQ3_XXS imatrix, 11,2 GB | other (Gemma) | Hugging Face, 0 descargas |
| google/gemma-4-26b-a4b-it (base) | 25,2B totales / ~4B activos | No disponible en la informacion | safetensors, FP8/BF16 | Gemma | Hugging Face oficial |
| Otras cuantizaciones GGUF del mismo base | 25,2B totales / ~4B activos | Depende de la cuantizacion | Q4_K_M, Q5_K_M, etc. | Gemma | Depende del publicador |

No se dispone de datos de benchmarks que permitan comparar rendimiento numerico con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo abliterated: no rechaza peticiones daninas; el autor declara explicitamente que la responsabilidad de uso recae en el usuario.
- Retrieval de contexto largo verificado solo hasta 30K tokens; mas alla no esta probado y el rendimiento decae notablemente en hardware modesto.
- Idiomas de bajos recursos: el imatrix de calibracion es solo en ingles y la cuantizacion de 3 bits agrava el problema; se observan bucles de repeticion en lenguas como el azerbaiyano.
- La cuantizacion IQ3_XXS introduce perdida de calidad frente al modelo original; no se han publicado evaluaciones cuantitativas de esa degradacion.
- Licencia "other" vinculada a la licencia de Gemma: es necesario revisar los terminos de google/gemma-4-26b-a4b-it para uso comercial, que pueden incluir restricciones de uso aceptable incompatibles con la version sin censura.
- Modelo con 0 descargas y 1 like en el momento de la ficha: sin validacion comunitaria ni mantenimiento demostrado.
- Riesgo de alucinacion inherente a los LLM, agravado por la cuantizacion agresiva y la falta de benchmarks publicados.
- No se especifican los idiomas soportados oficialmente; la informacion disponible no permite confirmar cobertura multilingue fiable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FarhadSu/Gemma-4-26B-A4B-Uncensored-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26b-a4b-it
- Licencia del modelo base: https://huggingface.co/google/gemma-4-26b-a4b-it
- llama.cpp (herramienta de conversion y cuantizacion): https://github.com/ggerganov/llama.cpp
