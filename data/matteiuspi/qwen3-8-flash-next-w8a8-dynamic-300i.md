# matteiuspi/Qwen3.8-Flash-Next-W8A8-DYNAMIC-300i

## Resumen

Qwen3.8-Flash-Next-W8A8-DYNAMIC-300i es un checkpoint experimental publicado por el usuario matteiuspi en HuggingFace: una conversion cuantizada del modelo base Qwen/Qwen3.8-Flash-Next, fijado en la revision de4b8e4d43b917e7706784d8bb445c9af86a3540. La conversion se ha realizado con la ruta W8A8_DYNAMIC de Ascend ModelSlim y esta especificamente orientada a ejecutarse sobre dos tarjetas Atlas 300I Duo, expuestas como cuatro dispositivos Ascend 310P3, con tensor parallelism repartido entre los cuatro chips. No es un modelo nuevo ni un fine-tune: es un artefacto de despliegue pensado para servir el modelo base en hardware Ascend en lugar de GPU NVIDIA.

El modelo conserva la arquitectura experimental que el autor denomina Qwen4: 48 capas de decoder, 512 expertos enrutados, atencion hibrida que combina Gated DeltaNet con Qwen Sparse Attention, embeddings n-gram PLE, un codificador de vision y pesos MTP (multi-token prediction) para decodificacion especulativa. La cuantizacion solo afecta a las proyecciones lineales de los expertos enrutados (73.728 proyecciones con pesos INT8 y escalas/offsets FP32 por canal de salida); el resto de componentes permanece en FP16, por lo que el resultado no es un checkpoint homogeneamente INT8.

Su relevancia es acotada pero clara: es evidencia practica de que un modelo MoE de gran tamano con atencion dispersa puede servirse en aceleradores Ascend de gama de inferencia, con un limite de servicio de 131.072 tokens configurado y una tasa de decodificacion medida de 14,8 a 16,0 tokens/s en peticiones individuales. Conviene subir el nivel de cautela: la propia model card se autodenomina borrador, advierte de que el checkpoint requiere un fork de vLLM no publico y pide explicitamente no hacer publico el repositorio hasta completar la lista de verificacion de release.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE experimental (Qwen4): 48 capas de decoder, 512 expertos enrutados, atencion hibrida Gated DeltaNet + Qwen Sparse Attention, embeddings PLE n-gram, encoder de vision, cabezas MTP |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE con 512 expertos enrutados; no se especifica el numero de expertos activos por token) |
| Longitud de contexto | 131.072 tokens como limite de servicio seleccionado para el hito de cuatro chips (`--max-model-len`); capacidad KV asignada en NPU: 142.237 tokens. No es el maximo arquitectonico del modelo |
| Tipos de cuantizacion | W8A8_DYNAMIC (Ascend ModelSlim): pesos INT8 en las proyecciones de expertos enrutados, con escalas y offsets FP32 por canal de salida; activaciones cuantizadas dinamicamente en tiempo de ejecucion. Resto de componentes en FP16. Checkpoint no uniformemente INT8 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `license: other` en HuggingFace) |
| Formato de pesos | Safetensors (254 shards) |
| Tamano del repositorio | 198,0 GB segun HuggingFace; 240,06 GB (223,57 GiB) segun el export descrito en la model card |
| Modelo base | Qwen/Qwen3.8-Flash-Next (relacion: quantized) |
| Libreria de despliegue | vLLM (fork OpenSensor) |
| Fecha de creacion | 23 de septiembre de 2026 |
| Ultima actualizacion | 26 de septiembre de 2026 |
| Descargas / likes | 0 / 2 |

## Arquitectura y entrenamiento

El checkpoint reproduce la arquitectura del modelo base sin modificar su topologia: 48 capas de decoder con un esquema de mezcla de expertos de 512 expertos enrutados, atencion hibrida que combina Gated DeltaNet (una variante de estado recurrente lineal) con Qwen Sparse Attention, tablas de embeddings n-gram PLE, un encoder de vision y pesos de multi-token prediction. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base paso por fases de RLHF o DPO: esos datos corresponderian a la model card de Qwen/Qwen3.8-Flash-Next, que no forma parte de la informacion proporcionada.

La innovacion tecnica del artefacto esta en la ruta de cuantizacion y en la integracion con el runtime, no en el modelo. Ascend ModelSlim aplica W8A8_DYNAMIC unicamente a las 73.728 proyecciones lineales de los expertos enrutados, manteniendo embeddings, tablas PLE, atencion, Gated DeltaNet, expertos compartidos, componentes de vision y la cabeza del modelo en FP16. La ruta de servicio emplea decodificacion especulativa con MTP (profundidad de borrador de 1 token), prefix caching, chunked prefill y grafos exclusivos de decodificacion completa. La integracion de la cabeza MTP y del runner para 310P se incorporo en el fork vLLM Ascend en el commit 839b6657f.

## Capacidades

- Generacion de texto conversacional: la model card etiqueta el checkpoint como `conversational` y `text-generation`; se ha validado el endpoint `/v1/chat/completions` con respuesta HTTP 200.
- Razonamiento y generacion de codigo: no hay evaluacion de calidad publicada, pero la model card menciona sesiones reales de KiloCode (un agente de codigo) como carga de trabajo observada.
- Procesamiento de contexto largo: el runtime acepta peticiones de hasta 131.072 tokens de limite de servicio, con 142.237 tokens de capacidad KV asignada. La peticion mas larga registrada en los logs revisados fue de 43.603 tokens de prompt.
- Decodificacion especulativa mediante MTP: soportada en el build `qwen38-mtp-grouped-qsa-r21`, con profundidad de borrador de 1 token y caracter provisional.
- Atencion dispersa (Qwen Sparse Attention) combinada con Gated DeltaNet.
- Componentes multimodales presentes en los pesos (encoder de vision), pero no soportados: la ruta de servicio en Ascend solo se ha ejercitado para generacion de texto y la model card no reclama ejecucion multimodal.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponibles como capacidad declarada; las sesiones de KiloCode se citan como carga de trabajo, no como funcionalidad validada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Servicio de inferencia en hardware Ascend: el caso de uso central del artefacto es desplegar un modelo MoE de gran tamano sobre dos Atlas 300I Duo (cuatro Ascend 310P3) con tensor parallelism de 4, evitando depender de GPU NVIDIA. Es adecuado porque el checkpoint esta cuantizado y validado especificamente para esa topologia.
- Evaluacion de stacks de cuantizacion en Ascend: equipos de infraestructura pueden usar este checkpoint como banco de pruebas para medir el impacto de W8A8_DYNAMIC en peso de memoria (33,93 GiB por rank), memoria de activaciones (1,56 GiB de pico) y memoria de grafo de decodificacion (0,32 GiB).
- Analisis de documentos largos: con un limite de servicio de 131.072 tokens y capacidad KV de 142.237 tokens, el modelo esta pensado para ingerir prompts extensos (informes, repositorios, expedientes) en una sola peticion, siempre que se complete la validacion de correctitud a esa longitud.
- Agentes de codigo en terminal: la carga de trabajo citada en la model card son sesiones de KiloCode (agente de codigo), lo que apunta a su uso como backend de asistentes que leen contextos de repositorio y generan parches de codigo de forma iterativa.
- Atencion al cliente automatizada multi-turno: el modo conversacional y el prefix caching permiten reutilizar prefijos de conversacion entre turnos, reduciendo el coste de prefill en dialogos largos.
- Resumen y extraccion de informacion en pipelines por lotes: para lotes de baja concurrencia donde encaje la tasa medida (14,8-16,0 tokens/s en batch uno) y el hardware Ascend ya este amortizado.
- Investigacion sobre MoE y atencion dispersa: el checkpoint permite estudiar el comportamiento de 512 expertos enrutados con atencion Gated DeltaNet + Sparse Attention bajo cuantizacion INT8 de los expertos, sin necesidad de un cluster de GPU.
- Validacion de runtimes alternativos: sirve como caso de prueba para los forks OpenSensor de vLLM y vLLM Ascend, incluida la integracion del runner 310P y de la cabeza MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica explicitamente que las cifras recogidas son mediciones de ingenieria provisionales, no un benchmark publico controlado. Se reproducen tal cual:

| Medicion (25 de septiembre de 2026, build `qwen38-mtp-grouped-qsa-r21`) | Valor observado |
|---|---:|
| Limite de servicio (`--max-model-len`) | 131.072 tokens |
| Capacidad KV asignada en NPU | 142.237 tokens |
| Rangos TP / secuencias activas | 4 / 1 |
| Memoria de pesos por rank | 33,93 GiB |
| Memoria de activaciones de pico por rank | 1,56 GiB |
| Memoria de grafo de decodificacion por rank | 0,32 GiB |
| Profundidad de borrador MTP | 1 token |
| Decodificacion por peticion representativa | 14,8-16,0 tokens/s |
| Muestra sostenida de decodificacion de 1.359 tokens | 14,8 tokens/s |
| Completaciones de 201-328 tokens | 15,3-16,0 tokens/s |
| Prefill en frio de prompts de 24K tokens | 61,5-83,3 s (aprox. 291-394 tokens de prompt/s) |

Linea base de smoke test (23 de septiembre de 2026), conservada como evidencia historica de puesta en marcha y ya superada: contexto probado de 2.304 tokens, carga de pesos de 33,363 GB por rank TP, `/v1/models` y `/v1/chat/completions` con HTTP 200, aproximadamente 7 tokens de prompt/s y generacion entre 0,2 y 1,9 tokens/s. El autor advierte que estas cifras no son mediciones en regimen estacionario ni controladas.

## Requisitos de hardware

- Hardware objetivo: 2 tarjetas Atlas 300I Duo, expuestas como 4 dispositivos Ascend 310P3, con tensor parallelism de 4.
- Memoria de pesos por rank: 33,93 GiB en el build del 25 de septiembre; 33,363 GB por rank en el smoke test del 23 de septiembre.
- Memoria adicional por rank: 1,56 GiB de pico de activaciones y 0,32 GiB de grafo de decodificacion.
- Capacidad KV asignada en NPU: 142.237 tokens, suficiente para el limite de servicio de 131.072 tokens configurado.
- GPU consumer: no aplicable. No hay soporte declarado para CUDA ni para GPU de consumo; el checkpoint esta cuantizado para el formato y runtime de Ascend.
- Opciones de despliegue: exclusivamente el fork OpenSensor de vLLM junto con la rama `main` de OpenSensor vLLM Ascend. No es un modelo drop-in para vLLM Ascend estandar ni para vLLM convencional. Revisiones citadas: vLLM `opensensor/vllm@3ab5dda29` (build del 25 de septiembre), vLLM `3756b28a3c63d7d5c5503912cdc5e9dfbbe3c7f6` y vLLM Ascend `e3091d23015e3fa4a75471fc9d57f45e8b6c7a6b` (smoke test), con CANN / `npu-smi` 26.0.rc1.
- Latencia y throughput medidos: 14,8-16,0 tokens/s de decodificacion por peticion con una unica secuencia activa. Se trata de tiempos por peticion en batch uno, no de un benchmark de throughput con multiples peticiones concurrentes.
- Prefill: el procesamiento de prompts sin cache esta aun en optimizacion; 24K tokens en frio tardan entre 61,5 y 83,3 segundos. El autor pide no tratar estos tiempos como cifras finales.

## Comparativa con modelos similares

No se dispone de datos de benchmarks, parametros totales ni contexto arquitectonico de modelos alternativos dentro de la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento fiable. La unica comparacion documentada es contra el propio modelo base sin cuantizar:

| Aspecto | Qwen3.8-Flash-Next (base) | Qwen3.8-Flash-Next W8A8-DYNAMIC-300i |
|---|---|---|
| Precision de pesos | FP16 (presumiblemente, no confirmado en la informacion) | INT8 en 73.728 proyecciones de expertos enrutados; FP16 en el resto |
| Hardware objetivo | no disponible | 4 x Ascend 310P3 (2 x Atlas 300I Duo) |
| Runtime | no disponible | Fork OpenSensor de vLLM + vLLM Ascend `main` |
| Tamano del repositorio | no disponible | 240,06 GB (223,57 GiB), 254 shards Safetensors |
| Licencia | no disponible | qwen-community-1.0 |
| Rendimiento | no disponible | 14,8-16,0 tokens/s por peticion (medicion provisional) |

Frente a otras alternativas de la misma categoria (modelos MoE grandes con contexto largo), no se han proporcionado datos comparables.

## Limitaciones y advertencias

- Estado experimental: la model card se autodenomina borrador de un checkpoint validado localmente. Incluye una advertencia explicita de no hacer publico el repositorio hasta completar la lista de verificacion de release.
- Dependencia de software no publico: el checkpoint requiere el fork OpenSensor de vLLM y la rama `main` de OpenSensor vLLM Ascend. No funciona sobre vLLM Ascend estandar. La revision publica final de `main` debe registrarse despues de fusionar la correccion de prefill en frio.
- Multimodalidad no soportada: aunque los pesos incluyen un encoder de vision, la ruta de servicio en Ascend solo se ha ejercitado para texto. La ejecucion multimodal no se reclama como soportada.
- MTP provisional: la decodificacion especulativa con multi-token prediction sigue pendiente de comparacion de calidad y de la congelacion final del runtime.
- Correctitud a contexto largo no verificada: el valor de 131.072 tokens es un limite de servicio configurado, no el maximo arquitectonico. El hecho de que la asignacion KV encaje en el presupuesto de memoria no demuestra correctitud de extremo a extremo a esa longitud. La peticion mas larga revisada fue de 43.603 tokens y hay sesiones reales que la superan sin recuento recuperado. Una prueba controlada de 100K/131K sigue siendo una puerta de release.
- Rendimiento de prefill sin consolidar: los tiempos de prefill en frio (61,5-83,3 s para 24K tokens) estan sujetos a cambios tras el arreglo pendiente.
- Sin datos de calidad: no hay benchmarks publicados de MMLU, HumanEval, GSM8K ni equivalentes. No se puede afirmar nada sobre la degradacion introducida por la cuantizacion INT8 de los expertos.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingue del checkpoint.
- Licencia: qwen-community-1.0 (etiquetada como `other` en HuggingFace), lo que implica condiciones especificas para uso comercial que deben revisarse en el fichero LICENSE del repositorio antes de cualquier despliegue productivo.
- Tamano del repositorio: 198,0 GB segun HuggingFace frente a los 240,06 GB (223,57 GiB) declarados para el export; conviene verificar la integridad de la descarga antes de desplegar.
- Coste de hardware y baja madurez: no cabe en GPU de consumo; requiere infraestructura Ascend especifica y una pila de software en evolucion activa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/matteiuspi/Qwen3.8-Flash-Next-W8A8-DYNAMIC-300i
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Revision del modelo base fijada: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/tree/de4b8e4d43b917e7706784d8bb445c9af86a3540
- Fork vLLM de OpenSensor (build del 25 de septiembre de 2026): https://github.com/opensensor/vllm/commit/3ab5dda29acabea01f6a63d0806bdbbb4a27bde5
- Fork vLLM de OpenSensor (smoke test del 23 de septiembre de 2026): https://github.com/opensensor/vllm/commit/3756b28a3c63d7d5c5503912cdc5e9dfbbe3c7f6
- vLLM Ascend (smoke test del 23 de septiembre de 2026): https://github.com/opensensor/vllm-ascend/commit/e3091d23015e3fa4a75471fc9d57f45e8b6c7a6b
- vLLM Ascend (integracion de la cabeza MTP de Qwen4Exp y del runner 310P): https://github.com/opensensor/vllm-ascend/commit/839b6657f2e08b60fcd2d3fa124341003
