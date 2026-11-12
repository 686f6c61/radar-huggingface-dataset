# gcube-ai/granite-4.0-h-micro-nvfp4

## Resumen

Granite 4.0 H Micro NVFP4 es una cuantizacion de 4 bits del modelo IBM Granite 4.0 H Micro, publicada por gcube-ai. No se trata de un modelo nuevo ni de un algoritmo de cuantizacion propio: es el modelo base de IBM comprimido con la receta NVFP4 de NVIDIA mediante la herramienta llm-compressor del proyecto vLLM. Su interes radica en que reduce los pesos a aproximadamente una cuarta parte del tamano original, lo que permite servir el modelo completo en una unica GPU de consumo con 8 GB de VRAM, en concreto una RTX 5060.

El modelo base emplea una arquitectura hibrida denominada granitemoehybrid, con 3.191.396.096 parametros totales y una longitud de contexto de 131.072 tokens. La cuantizacion a NVFP4 mantiene esa ventana de contexto y el formato de pesos safetensors, y se sirve con vLLM usando el backend compressed-tensors. El repositorio ocupa 2,1 GB.

La relevancia de esta ficha es practica: el autor aporta mediciones reales de rendimiento y de perdida de calidad sobre hardware de consumo, algo poco habitual en publicaciones de modelos cuantizados. Con ello, un desarrollador puede decidir si el modelo le sirve antes de desplegarlo, sabiendo de antemano el throughput agregado, la latencia de primer token y la degradacion observada en tareas de tool calling, razonamiento y salida estructurada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | granitemoehybrid (hibrida, segun tag del repositorio) |
| Parametros totales | 3.191.396.096 |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | NVFP4 (4 bits), formato compressed-tensors |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es IBM Granite 4.0 H Micro, identificado en el repositorio con la arquitectura granitemoehybrid, lo que sugiere una combinacion de componentes tipo Mezcla de Expertos (MoE) y capas hibridas (posiblemente atencion y estado recurrente). No se dispone en la informacion proporcionada de detalles sobre el numero de parametros activos, la composicion exacta del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica de esta publicacion no esta en la arquitectura ni en el entrenamiento, sino en el proceso de cuantizacion: se parte del modelo original en bf16 y se aplica la receta NVFP4 con llm-compressor, herramienta mantenida por el proyecto vLLM y la comunidad de Red Hat, mientras que el metodo NVFP4 es de NVIDIA. El autor realizo la calibracion y la verificacion de calidad por tarea, y documenta explicitamente la perdida de cuantizacion comparando bf16 frente a NVFP4 sobre las mismas preguntas.

## Capacidades

- Generacion de texto conversacional en ingles, con pipeline declarado text-generation.
- Razonamiento: el autor mide la tarea de razonamiento con GPQA-Diamond, lo que indica capacidad para preguntas de nivel experto, aunque con resultados modestos.
- Tool calling / function calling: medido explicitamente por el autor, con una tasa del 88 % en NVFP4.
- Salida estructurada: evaluada de forma separada, con un 48 % en la version cuantizada.
- Ventana de contexto larga de 131.072 tokens, mantenida tras la cuantizacion.
- Despliegue en GPU de consumo: cabe en 8 GB de VRAM y se sirve con vLLM.
- No se documentan capacidades de vision, audio, modo thinking explicito ni soporte multilingue mas alla del ingles.

## Casos de uso

- Servicio de chat en una unica GPU de consumo: con 115 tok/s en modo monousuario y hasta 64 peticiones concurrentes a 1.235 tok/s agregados, el modelo es adecuado para prototipos, demos y entornos de desarrollo donde no hay presupuesto para GPUs de datacenter. La RTX 5060 de 8 GB es suficiente para servirlo completo.
- Atencion al cliente automatizada en ingles: la ventana de 131.072 tokens permite mantener conversaciones multi-turno con historial largo y documentos adjuntos, y el throughput agregado de 1.016 tok/s a 32 peticiones concurrentes cubre cargas de un equipo pequeno.
- Pipelines de agentes con tool calling: la tasa medida del 88 % en llamada de herramientas permite integrar el modelo como planificador que invoca APIs, aunque conviene validar las llamadas en produccion por la perdida de 4 puntos porcentuales frente a bf16.
- Extraccion de datos y generacion de JSON: la salida estructurada obtiene un 48 % en la version cuantizada, por lo que es util para tareas de formateo simple y extraccion de campos, no para esquemas complejos sin validacion posterior.
- Evaluacion y prototipado de modelos en local: al caber en una GPU de consumo, sirve para experimentar con la familia Granite 4.0 sin infraestructura dedicada, comparando resultados frente a la version bf16 con las mismas preguntas.
- Backend de bajo coste para herramientas internas: con prefix caching activado y vLLM v0.32.0, el modelo mantiene el 100 % de exito hasta 64 peticiones concurrentes dentro del SLO de primer token por debajo de 5 segundos, lo que resulta adecuado para asistentes internos de documentacion o busqueda en ingles.

## Benchmarks y rendimiento

Rendimiento medido en RTX 5060 (8 GB) con vLLM v0.32.0, NVFP4 y prefix caching activado. Cada peticion usa 1.024 tokens de entrada y 128 de salida, medido de extremo a extremo a traves de la pasarela de servicio el 2026-10-28.

| Peticiones concurrentes | Tokens de salida/s | Primer token p90 | Exito |
|---:|---:|---:|---:|
| 1 | 115 | 0,6 s | 100 % |
| 8 | 587 | 1,1 s | 100 % |
| 16 | 820 | 1,6 s | 100 % |
| 32 | 1.016 | 2,9 s | 100 % |
| 64 | 1.235 | 4,9 s | 100 % |

Perdida de cuantizacion (NVFP4 frente a bf16 original, mismas preguntas):

| Tarea | bf16 (original) | NVFP4 (esta version) | Delta |
|---|---:|---:|---:|
| Tool calling | 92 % | 88 % | -4 pp |
| Razonamiento (GPQA-Diamond) | 24 % | 20 % | -4 pp |
| Salida estructurada | 36 % | 48 % | +12 pp |

Las muestras son de 50 preguntas con un margen de mas o menos 14 puntos porcentuales. El autor senala que las tres diferencias caen dentro de ese margen y las reporta como "sin cambio significativo", no como ganancias o perdidas reales, y anuncia una ejecucion de 500 preguntas para las tareas cercanas a un limite de decision.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB de pesos en NVFP4, con margen suficiente para cache KV y el contexto largo dentro de los 8 GB de una RTX 5060.
- GPU recomendadas: RTX 5060 (8 GB) es el hardware medido y validado por el autor; cualquier GPU de consumo con al menos 8 GB y soporte de NVFP4 deberia poder servirlo, aunque no se aportan mediciones en otras tarjetas.
- Cabe en GPU de consumo: si, confirmado en RTX 5060 de 8 GB.
- Despliegue: vLLM v0.32.0 con `--quantization compressed-tensors` y `--max-model-len 131072`; compatible con la API OpenAI a traves del servidor de vLLM.
- Latencia y throughput: 115 tok/s en monousuario y 1.235 tok/s agregados con 64 peticiones concurrentes; el primer token p90 pasa de 0,6 s con una peticion a 4,9 s con 64. El autor indica que la velocidad monousuario esta limitada por el ancho de banda de memoria (448 GB/s dividido por el tamano de los pesos), no por los tensor cores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware de referencia |
|---|---|---|---|---|---|
| gcube-ai/granite-4.0-h-micro-nvfp4 | 3.191.396.096 | 131.072 | NVFP4 (4 bits) | apache-2.0 | RTX 5060, 8 GB |
| ibm-granite/granite-4.0-h-micro (base) | 3.191.396.096 | 131.072 | bf16 | apache-2.0 | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones de otras alternativas de la misma categoria, por lo que la comparativa se limita al modelo base frente a su version cuantizada. La unica diferencia documentada es la perdida de calidad en las tres tareas medidas y la reduccion de pesos a aproximadamente una cuarta parte.

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran otros idiomas.
- La cuantizacion introduce perdida de calidad: -4 puntos porcentuales en tool calling y en GPQA-Diamond, con un margen de error de mas o menos 14 puntos porcentuales en muestras de 50 preguntas, por lo que las cifras son orientativas y no concluyentes.
- El rendimiento en razonamiento es bajo en terminos absolutos (20 % en GPQA-Diamond en NVFP4), lo que limita su uso en tareas que exijan razonamiento profundo.
- La tasa de salida estructurada (48 %) implica que no conviene confiar en el formato sin validacion posterior en produccion.
- Los benchmarks de velocidad se midieron unicamente en una RTX 5060 con vLLM v0.32.0 y prefix caching activado; el rendimiento en otro hardware o version de vLLM puede diferir.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base y conviene verificar las condiciones de IBM Granite 4.0.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gcube-ai/granite-4.0-h-micro-nvfp4
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-micro
- Herramienta de cuantizacion llm-compressor: https://github.com/vllm-project/llm-compressor
