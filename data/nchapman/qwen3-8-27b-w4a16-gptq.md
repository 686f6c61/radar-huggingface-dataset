# nchapman/Qwen3.8-27B-W4A16-GPTQ

## Resumen

Qwen3.8-27B-W4A16-GPTQ es una cuantizacion INT4 del modelo Qwen/Qwen3.8-27B publicada por el usuario nchapman. Se trata de una cuantizacion GPTQ de solo pesos (W4A16: pesos INT4, activaciones en BF16) con tamano de grupo 128 y ordenacion por activaciones (act-order), empaquetada en el formato compressed-tensors y pensada para servir el modelo en una unica GPU de 24 GB dejando espacio para la cache KV. El checkpoint resultante ocupa 19,4 GB en el repositorio y declara 27.356.728.560 parametros totales.

El modelo conserva la licencia Apache-2.0 del checkpoint original y se distribuye en safetensors bajo el pipeline image-text-to-text, lo que indica que el modelo base es multimodal (entrada de imagen y texto). La cuantizacion fue calibrada con 999 conversaciones muestreadas de nvidia/Nemotron-Cascade-2-SFT-Data, con aproximadamente 2,6 millones de tokens efectivos repartidos entre chat, matematicas, ciencia, seguimiento de instrucciones, agente conversacional, agente de terminal y SWE.

Su relevancia practica es doble: por un lado reduce el requisito de VRAM de un modelo de ~27.000 millones de parametros hasta el rango de una RTX 4090 o RTX 3090; por otro, el autor publica una evaluacion de fidelidad frente al modelo BF16 con metricas de divergencia KL por dominio, algo poco habitual en cuantizaciones subidas a HuggingFace. La contrapartida documentada es que la mayor divergencia aparece en texto estructurado de tool calling, precisamente el caso de uso mas sensible a errores de sintaxis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Etiqueta de repositorio qwen3_5; transformer multimodal (pipeline image-text-to-text). No se detalla mas en la informacion disponible |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A16 (pesos INT4, activaciones BF16), GPTQ, group size 128, act-order; formato compressed-tensors (pack-quantized) |
| Idiomas soportados | No disponible. La evaluacion de fidelidad cubre 9 idiomas, pero no se enumeran |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con metadatos compressed-tensors (pack-quantized) |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamano del repositorio | 19,4 GB |
| Plantilla de chat | froggeric v22.5 (qwen3.8-froggeric-v22.5) |
| Parametros de muestreo recomendados | temperature 1.0, top_p 0.95, top_k 20, do_sample (heredados del modelo base en generation_config.json) |
| Fecha de publicacion | 2026-10-10 |

## Arquitectura y entrenamiento

Esta ficha describe una cuantizacion, no un entrenamiento. La arquitectura subyacente es la del checkpoint Qwen/Qwen3.8-27B, del que la informacion disponible solo aporta la etiqueta qwen3_5, el pipeline image-text-to-text y el recuento de parametros (27.356.728.560). No hay datos publicados sobre el numero de tokens de entrenamiento del modelo original, la composicion de su dataset ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento.

Lo que si esta documentado es el proceso de cuantizacion. Se aplico GPTQ en esquema W4A16 con tamano de grupo 128 y act-order, utilizando la herramienta llm-compressor del proyecto vLLM. La calibracion se hizo con 999 conversaciones muestreadas respetando las proporciones nativas del dataset nvidia/Nemotron-Cascade-2-SFT-Data, lo que suma aproximadamente 2,6 millones de tokens efectivos y cubre siete dominios: chat, matematicas, ciencia, seguimiento de instrucciones, agente conversacional, agente de terminal y SWE. El checkpoint se empaqueta en compressed-tensors y esta pensado para ejecutarse con los kernels Marlin de vLLM. No se especifica si el codificador visual del modelo base se cuantiza en INT4 o se mantiene en mayor precision.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta conversational del repositorio.
- Procesamiento de imagen y texto: el pipeline declarado es image-text-to-text, lo que implica entrada multimodal. La model card no detalla el alcance exacto de las capacidades de vision ni si el tower visual se conserva intacto tras la cuantizacion.
- Razonamiento matematico y cientifico: los dominios math y science forman parte del conjunto de calibracion, lo que indica que el modelo base esta orientado a estas tareas (no es evidencia de rendimiento medido en esta cuantizacion).
- Tool calling y uso de agentes: los dominios conversational-agent, terminal-agent y SWE estan representados en la calibracion, lo que apunta a soporte de llamadas a herramientas y flujos multi-paso. Es precisamente el dominio donde la cuantizacion muestra mayor divergencia (KL 0,486 en terminal-agent).
- Multilingue: la sonda de fidelidad del autor evalua 9 idiomas, aunque no se enumeran ni se declara un listado oficial de idiomas soportados.
- Modo thinking: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Servicio de chat en una unica GPU de 24 GB: el modelo cuantizado esta disenado explicitamente para caber en tarjetas como la RTX 4090 o la RTX 3090 con margen para cache KV, lo que permite desplegar un modelo de ~27.000 millones de parametros en hardware de gama alta de consumo sin recurrir a paralelismo de tensor.
- Asistente conversacional multi-turno: la etiqueta conversational y la calibracion sobre datos de dialogo permiten construir interfaces de chat con historial largo, siempre que se respete la plantilla froggeric v22.5 y los parametros de muestreo de generation_config.json.
- Agente de terminal y automatizacion de operaciones: el modelo base se calibro con datos de terminal-agent, por lo que puede emplearse en agentes que ejecutan comandos, aunque conviene validar la salida porque este dominio registra la mayor divergencia de cuantizacion.
- Asistencia en ingenieria de software: tareas de lectura de repositorios, generacion de parches y resolucion de issues (dominio SWE en la calibracion), integradas en pipelines de CI/CD mediante tool calling.
- Analisis de documentos con componente visual: al ser un modelo image-text-to-text, puede emplearse en la extraccion de informacion de capturas, diagramas o documentos escaneados combinados con texto, si se confirma que el tower visual conserva su calidad tras la cuantizacion.
- Razonamiento matematico y cientifico en entornos con VRAM limitada: generacion de resoluciones paso a paso y explicaciones tecnicas en un unico nodo GPU, con la advertencia de que la fidelidad en math y science tiene un KL declarado de 0,098 y 0,097 respectivamente.
- Despliegue en vLLM para alta concurrencia: los kernels Marlin de vLLM permiten servir el checkpoint cuantizado con batching continuo, lo que resulta adecuado para endpoints compartidos por varios usuarios.
- Evaluacion y prototipado de cuantizacion: al publicar metricas de fidelidad por dominio y semilla de calibracion, sirve como referencia para comparar estrategias de cuantizacion sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones equivalentes para esta cuantizacion o para su modelo base.

El autor si publica una evaluacion de fidelidad frente al modelo BF16 sobre una sonda retenida de 378 conversaciones distribuidas en 7 dominios y 9 idiomas:

| Metrica | Valor |
|---|---|
| Delta de perplejidad (agregado) | +1,00% |
| Delta de perplejidad (conjunto guarda fuera de distribucion) | -0,52% |
| KL(base\|\|quant), chat | 0,033 |
| KL(base\|\|quant), seguimiento de instrucciones | 0,053 |
| KL(base\|\|quant), matematicas | 0,098 |
| KL(base\|\|quant), ciencia | 0,097 |
| KL(base\|\|quant), multilingue (9 idiomas) | 0,109 |
| KL(base\|\|quant), terminal-agent | 0,486 |
| KL en cola larga (p99.9) | ~25 |

## Requisitos de hardware

- Peso teorico de los parametros cuantizados a INT4: aproximadamente 13,7 GB (27.356.728.560 parametros x 4 bits / 8). El repositorio ocupa 19,4 GB, probablemente porque algunos tensores no se cuantizan o se almacenan en mayor precision.
- El autor indica que el checkpoint cabe en una tarjeta de 24 GB "con espacio para la cache KV". La VRAM total necesaria depende de la longitud de contexto configurada, del tamano de lote y del numero de secuencias concurrentes.
- GPU de consumo compatibles: RTX 4090 (24 GB), RTX 3090 (24 GB). Quedan fuera tarjetas de 16 GB o menos.
- GPU profesionales recomendadas: A100 40/80 GB, H100, L40S (48 GB), A6000 (48 GB), RTX 6000 Ada. El margen adicional permite contextos mas largos y mayor concurrencia.
- Opciones de despliegue: vLLM es la via de referencia, ya que el formato compressed-tensors (pack-quantized) W4A16 se ejecuta con los kernels Marlin de vLLM. El autor solo documenta el ejemplo `LLM(model="nchapman/Qwen3.8-27B-W4A16-GPTQ")`.
- Otros runners: no se documenta soporte para llama.cpp, Ollama, TGI u otros. Usar llama.cpp u Ollama requeriria una conversion a GGUF que no se proporciona en este repositorio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Solo se dispone de datos del modelo base y de esta cuantizacion. No hay informacion sobre cuantizaciones alternativas (AWQ, GGUF, FP8) del mismo checkpoint ni sobre modelos comparables de la misma categoria.

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| nchapman/Qwen3.8-27B-W4A16-GPTQ | 27.356.728.560 | W4A16 GPTQ, group size 128, act-order | No disponible | apache-2.0 | Solo fidelidad vs BF16 (+1,00% perplejidad agregada) |
| Qwen/Qwen3.8-27B (base) | 27.356.728.560 | BF16 | No disponible | apache-2.0 | No disponible en la informacion proporcionada |
| Otras cuantizaciones del mismo base (AWQ, GGUF, FP8) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Divergencia en tool calling: el propio autor senala que el texto estructurado de llamadas a herramientas (dominios conversational-agent y SWE) presenta la mayor divergencia de cuantizacion, algo tipico de W4 sobre sintaxis de baja entropia. En produccion conviene validar y reparar la salida estructurada.
- Cola larga elevada: el KL en p99.9 se situa en ~25, por lo que puede aparecer inestabilidad a nivel de token en contextos poco frecuentes.
- Sin benchmarks de tareas: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones equivalentes que confirmen que la degradacion medida en perplejidad y KL se traduce (o no) en perdida de calidad en tareas concretas.
- Contexto no documentado: se desconoce la longitud de contexto soportada y como se comporta la cache KV en el presupuesto de 24 GB.
- Idiomas no enumerados: aunque la sonda de fidelidad cubre 9 idiomas, no se publica la lista ni el soporte oficial de idiomas.
- Tratamiento del tower visual desconocido: no se indica si la parte de vision se cuantiza ni con que precision, lo que impide garantizar la calidad multimodal.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- Licencia: el checkpoint se publica bajo apache-2.0, lo que permite uso comercial, pero el usuario debe verificar tambien las condiciones del modelo base Qwen/Qwen3.8-27B en su repositorio original.
- Requisito de kernel especifico: al usar compressed-tensors W4A16, la ruta practica pasa por vLLM con kernels Marlin; desplegarlo en otros motores de inferencia puede requerir conversion adicional.
- Trazabilidad: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo; toda la informacion procede de la model card y de los metadatos del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nchapman/Qwen3.8-27B-W4A16-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de calibracion: https://huggingface.co/datasets/nvidia/Nemotron-Cascade-2-SFT-Data
- Herramienta de cuantizacion llm-compressor: https://github.com/vllm-project/llm-compressor
- Documentacion de vLLM: https://docs.vllm.ai
- Documentacion de compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- La busqueda web no ha proporcionado articulos, papers, blogs ni demos adicionales relevantes sobre este modelo.
