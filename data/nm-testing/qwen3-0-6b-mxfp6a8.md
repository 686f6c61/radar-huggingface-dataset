# nm-testing/Qwen3-0.6B-MXFP6A8

## Resumen

Qwen3-0.6B-MXFP6A8 es un checkpoint cuantizado publicado por la organizacion nm-testing (equipo de Neural Magic, integrado en Red Hat) a partir de Qwen/Qwen3-0.6B. No se trata de un modelo entrenado desde cero, sino de un artefacto de cuantizacion post-entrenamiento generado con LLM Compressor y pensado explicitamente como checkpoint de prueba para la integracion continua (CI) de vLLM. Su relevancia es, por tanto, tecnica y de infraestructura: sirve para validar el soporte del formato microscaling MX (especialmente MXFP6 en pesos y MXFP8 en activaciones) dentro del ecosistema compressed-tensors.

El modelo conserva la arquitectura del Qwen3-0.6B original, un transformer decoder denso, y aplica el esquema MXFP6A8: todas las capas lineales salvo `lm_head` pasan a pesos MXFP6 con formato de elemento E2M3, mientras que las activaciones se cuantizan dinamicamente a MXFP8. Los embeddings (`embed_tokens`) tambien quedan excluidos de la cuantizacion. El recuento real de parametros segun los safetensors es de 751.632.384, coherente con el total del modelo base (la denominacion comercial "0.6B" de Qwen se refiere a los parametros no pertenecientes a embeddings).

Al estar publicado bajo licencia Apache 2.0 y con 0 descargas y 0 likes en el momento de la consulta, debe interpretarse como un artefacto de referencia para pruebas de kernels y pipelines de cuantizacion, no como un modelo recomendado para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (arquitectura Qwen3, modelo base Qwen/Qwen3-0.6B) |
| Parametros totales | 751.632.384 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la ficha del checkpoint; el modelo base Qwen3-0.6B trabaja con 32.768 tokens nativos |
| Tipos de cuantizacion | MXFP6 (E2M3) en pesos de capas lineales + MXFP8 dinamico en activaciones (esquema MXFP6A8, `mxfp6-pack-quantized`); `lm_head` y `embed_tokens` sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato compressed-tensors) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen/Qwen3-0.6B y no incluye entrenamiento adicional: es el resultado de una cuantizacion post-entrenamiento (PTQ) sin ajuste fino posterior. El procedimiento documentado por el autor usa la funcion `model_free_ptq` de LLM Compressor con el esquema `MXFP6A8` y una lista de exclusion que omite `lm_head` y cualquier parametro que coincida con `re:.*embed_tokens`. El resultado se serializa en el formato compressed-tensors, que almacena los pesos empaquetados junto con las escalas compartidas por bloque propias de los formatos MX (microscaling) definidos en la especificacion OCP Microscaling Formats.

La arquitectura subyacente es la del Qwen3-0.6B: decoder transformer denso con normalizacion RMSNorm, activacion SwiGLU, atencion con RoPE y QK-Norm, y atencion por consultas agrupadas (GQA). No se dispone de informacion en la ficha sobre el numero de tokens de preentrenamiento, la composicion del dataset original ni las etapas de alineacion (RLHF, DPO) del modelo base; esos datos corresponden a la documentacion de Qwen3 y no se reproducen aqui. La innovacion tecnica del checkpoint es unicamente el formato de cuantizacion: el uso de bloques MX con exponente compartido permite resoluciones de 6 y 8 bits con granularidad fina, orientado a kernels de bajo nivel en GPUs con soporte nativo de estos formatos.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, heredadas del modelo base Qwen3-0.6B.
- Razonamiento con modo "thinking" (razonamiento explicito antes de la respuesta), caracteristica de la familia Qwen3.
- Generacion de codigo y resolucion de problemas matematicos basicos, con la salvedad de que el tamano de 0.6B limita fuertemente el rendimiento frente a modelos mayores.
- Soporte de tool calling / function calling segun las capacidades del modelo base (no verificado especificamente en este checkpoint cuantizado).
- Capacidades multilingues heredadas de Qwen3 (la ficha no lista idiomas concretos, por lo que no se puede confirmar la cobertura exacta).
- No se documentan capacidades de vision, audio ni multimodalidad en este checkpoint.
- Capacidad instrumental destacada: servir como caso de prueba para validar kernels MXFP6/MXFP8 en vLLM y en el ecosistema compressed-tensors.

## Casos de uso

- Validacion continua (CI) de vLLM: este checkpoint existe precisamente para comprobar que la ruta de ejecucion de modelos MXFP6A8 produce resultados correctos en cada version del motor de inferencia.
- Pruebas de regresion de kernels de cuantizacion: permite comparar la salida de un kernel MXFP6 frente a una referencia en mayor precision para detectar errores numericos.
- Verificacion de pipelines de LLM Compressor: sirve como ejemplo reproducible del flujo `model_free_ptq` con esquema MXFP6A8 y patrones de exclusion.
- Inferencia en entornos con VRAM muy limitada: con alrededor de 0.6 GB de pesos cuantizados cabe en GPUs de gama baja o incluso en iGPU con suficiente memoria compartida, aunque el rendimiento practico dependera del soporte de los kernels MX.
- Prototipado de agentes y asistentes conversacionales de bajo coste: para pruebas de integracion de APIs y cadenas de herramientas donde la calidad del texto no es critica.
- Evaluacion comparativa de formatos de cuantizacion: permite medir el impacto de MXFP6A8 frente a FP8, INT8 o INT4 en la misma red base, util en laboratorios de optimizacion.
- Educacion y reproduccion de experimentos: al ser un modelo pequeno y con licencia permisiva, facilita la reproduccion de estudios sobre cuantizacion en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint no incluye metricas de perplejidad, MMLU, HumanEval, GSM8K ni comparaciones de degradacion respecto al modelo base en BF16.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 0.56 GB en MXFP6 (751,6 M de parametros a 6 bits), aunque el repositorio ocupa 1,0 GB por el empaquetado, las escalas y los metadatos de compressed-tensors.
- VRAM minima estimada para inferencia: en el orden de 1 GB para los pesos mas overhead del runtime; anadiendo cache KV, se recomienda al menos 2-4 GB para contextos cortos. Estimacion orientativa, no verificada en la ficha.
- Cache KV (estimacion para el modelo base en FP16): del orden de 0,1 MB por token; a 32.768 tokens de contexto se situaria en varios gigabytes, cantidad que crece linealmente con la longitud de secuencia.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas (por ejemplo, RTX 3050, RTX 4060, RTX 3060) siempre que el runtime soporte el formato MXFP6.
- Soporte de hardware critico: los formatos MXFP6/MXFP8 cuentan con aceleracion nativa en GPUs de arquitectura Blackwell (serie B200/B100 y equivalentes); en arquitecturas anteriores es previsible que se requiera descompresion o kernels emulados, con la consiguiente perdida de rendimiento.
- Opciones de despliegue: vLLM es el destino principal del checkpoint (integracion con compressed-tensors); la etiqueta `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y con los endpoints gestionados de Hugging Face. No se proporcionan pesos GGUF, por lo que su uso en llama.cpp u Ollama exigiria reconversion y no esta garantizado para MXFP6.
- Latencia y throughput: no disponibles; no se publican mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nm-testing/Qwen3-0.6B-MXFP6A8 | 751.632.384 | no disponible (base: 32.768) | MXFP6A8 (compressed-tensors) | apache-2.0 | Hugging Face (nm-testing) |
| Qwen/Qwen3-0.6B | 751.632.384 | 32.768 tokens nativos | BF16 (sin cuantizar) | apache-2.0 | Hugging Face (Qwen) |
| meta-llama/Llama-3.2-1B | 1.240 millones aprox. | 131.072 tokens | BF16, variantes cuantizadas de la comunidad | Llama 3.2 Community License | Hugging Face (Meta) |
| Qwen/Qwen2.5-0.5B | 494 millones aprox. | 32.768 tokens | BF16, variantes GGUF/AWQ | apache-2.0 | Hugging Face (Qwen) |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Naturaleza del artefacto: es un checkpoint de prueba para CI de vLLM, no un modelo destinado a produccion; su model card lo declara explicitamente como "test checkpoint".
- Ausencia de adopcion: registra 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- Perdida de precision por cuantizacion: la cuantizacion a 6 bits en pesos y 8 bits en activaciones introduce degradacion respecto al modelo base en BF16; no se han publicado metricas que cuantifiquen esa perdida.
- Dependencia de hardware: sin GPUs con soporte nativo de formatos MX, el rendimiento puede degradarse notablemente o requerir rutas de descompresion no optimizadas.
- Capacidad intrinseca limitada: con ~0,6 B de parametros activos, el modelo base comete errores frecuentes en razonamiento multi-paso, matematicas complejas y generacion de codigo extenso, ademas de mostrar una propension alta a la alucinacion.
- Idiomas: la ficha no especifica idiomas soportados, por lo que no se puede garantizar un comportamiento correcto fuera del ingles o del chino.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero el usuario debe verificar las condiciones del modelo base Qwen3-0.6B y de las dependencias (compressed-tensors, LLM Compressor, vLLM).
- Caveat de fecha y trazabilidad: el repositorio figura creado y actualizado el 14 de octubre de 2026, con dos unicos commits separados por segundos, lo que refuerza su caracter de artefacto automatizado de pruebas y no de release mantenido.
- No hay garantia de compatibilidad con toolchains distintas de vLLM/compressed-tensors.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/nm-testing/Qwen3-0.6B-MXFP6A8
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- LLM Compressor (repositorio): https://github.com/vllm-project/llm-compressor
- compressed-tensors (repositorio): https://github.com/neuralmagic/compressed-tensors
- vLLM (repositorio): https://github.com/vllm-project/vllm
- Organizacion nm-testing en Hugging Face: https://huggingface.co/nm-testing
- Nota sobre la busqueda web: los resultados recuperados (Wikipedia sobre el nanometro, convertidores de unidades, articulo sobre el newton metro) no guardan relacion con el modelo y no aportan informacion adicional utilizable.
