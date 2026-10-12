# Gurningllama/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-INT8-ConvRot

## Resumen

Qwen3-VL-32B Ultra Heretic H3 ComfyUI INT8 ConvRot es un repositorio de pesos publicado por el usuario Gurningllama que reempaqueta el modelo `llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic` (a su vez derivado de Qwen3-VL-32B-Instruct) para su uso como codificador de condicionamiento y cola de generacion dentro de ComfyUI. No es un modelo entrenado desde cero ni un repositorio Transformers convencional: el autor divide los pesos de un modelo vision-lenguaje de aproximadamente 32 000 millones de parametros en dos piezas complementarias.

La primera pieza es el codificador de condicionamiento, que contiene el embedding, las capas de lenguaje 0-49 y la torre de vision completa, y se ofrece en BF16 (47,97 GiB) y en INT8 ConvRot (24,55 GiB). La segunda es una cola de generacion con las capas 50-63, la normalizacion final y el LM head, disponible en BF16, INT8 ConvRot y, para la variante Instruct, en NVFP4/AWQ. Esta division responde a que el nodo H3 consume el estado oculto sin normalizar tras la capa 49, por lo que el codificador se carga de forma permanente mientras la cola puede cargarse y descargarse segun se necesite.

Su relevancia es practica: permite ejecutar generacion de texto y vision-lenguaje con un Qwen3-VL de 32B en flujos de ComfyUI, con variantes cuantizadas pensadas para equipos con VRAM limitada. El repositorio declara licencia apache-2.0, soporte solo para ingles y formato safetensors, y en el momento de la consulta no registra descargas ni valoraciones, por lo que no existe validacion independiente de su comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador decoder con torre de vision (familia Qwen3-VL). La model card no detalla la arquitectura; describe la division en embedding, capas de lenguaje 0-49, capas 50-63, normalizacion final, LM head y torre de vision |
| Parametros totales | Aproximadamente 32 000 millones, heredados de Qwen3-VL-32B. En el repositorio se reparten entre el codificador (47,97 GiB en BF16) y la cola (15,21 GB en BF16) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, INT8 ConvRot (group size 256), NVFP4/AWQ (solo cola de la variante Instruct) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoints para ComfyUI) |
| Tamano total del repositorio | 128,9 GB |
| Pipeline | image-text-to-text |
| Libreria | comfyui |

## Arquitectura y entrenamiento

La model card no documenta ningun proceso de entrenamiento: este repositorio es una operacion de reempaquetado y cuantizacion sobre un modelo preexistente. Los pesos proceden de `llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic`, una variante "abliterated" (con los mecanismos de rechazo suprimidos) de Qwen3-VL-32B-Instruct. No se indica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el fine-tune base.

Tecnicamente, el modelo conserva la estructura de un decoder transformer con torre de vision: el codificador incluye 902 tensores en BF16 con el embedding, las capas 0-49 y la torre de vision completa, mientras que la cola aporta las capas 50-63, la normalizacion final y el LM head. La innovacion del repositorio no esta en la arquitectura sino en el formato: las matrices de lenguaje aprendidas se almacenan en INT8 con "ConvRot" y tamano de grupo 256, con 350 matrices cuantizadas y 551 tensores que se mantienen en BF16 (incluida toda la torre de vision y las normalizaciones) en el codificador. La cola INT8 ConvRot contiene 98 matrices y un LM head INT8 que el nodo evalua por trozos. Se incluyen 351 escalas FP32 y 351 descriptores de cuantizacion para ComfyUI.

## Capacidades

- Generacion de texto e imagen-a-texto: la pipeline declarada es `image-text-to-text`, con torre de vision completa en el codificador.
- Generacion vision-lenguaje standalone mediante el nodo externo `ethanfel/ComfyUI-H3-Qwen3VL-TextGen`, que combina el codificador 0-49 con cualquier cola compatible.
- Mejora de prompts: la cola 50-63 puede conectarse al nodo H3 Prompt Enhancer para reescribir prompts antes de pasarlos al nodo guia de H3.
- Modelo sin censura ("uncensored"/"abliterated"): la model card indica que los mecanismos de rechazo han sido suprimidos en el fine-tune base.
- Capacidades multilingues: limitadas a ingles segun la model card.
- Soporte de tool calling, function calling, modo de razonamiento explicito o agentes multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Codificador de condicionamiento en flujos H3 de ComfyUI: el checkpoint se carga con el nodo estandar `CLIPLoader` usando el tipo de text-encoder compatible con H3 y alimenta la guia del pipeline, aprovechando que H3 consume el estado oculto tras la capa 49.
- Mejora automatica de prompts: conectando el codificador (0-49) al nodo H3 Prompt Enhancer y seleccionando una cola 50-63, el modelo reescribe el prompt del usuario antes de la generacion, sin duplicar el embedding ni la torre de vision.
- Generacion de texto y vision-lenguaje local: con el nodo TextGen, el par codificador + cola funciona como generador generalista que acepta lotes de imagenes opcionales, util para descripcion de imagenes, respuesta a preguntas visuales o transcripcion de contenido grafico en entornos offline.
- Despliegue en equipos con VRAM limitada: la variante INT8 ConvRot reduce el codificador de 47,97 GiB a 24,55 GiB, lo que permite mantener el encoder residente en GPU de 48 GB o recurrir a offloading en configuraciones menores.
- Investigacion sobre alineacion y modelos abliterated: al tratarse de una variante con los filtros de rechazo eliminados, sirve para estudiar el comportamiento de modelos sin salvaguardas, medir tasas de cumplimiento ante peticiones sensibles o comparar con la version Instruct original incluida en el mismo repositorio.
- Evaluacion de tecnicas de cuantizacion: el repositorio ofrece BF16, INT8 ConvRot con group size 256 y NVFP4/AWQ sobre la misma cola, lo que permite medir de forma controlada la perdida de fidelidad entre formatos en una carga de trabajo vision-lenguaje.
- Prototipado dentro del grafo de ComfyUI: al integrarse como checkpoint nativo, permite experimentar con un modelo de 32B sin salir del entorno de nodos ni montar un servidor de inferencia aparte.
- Sustitucion temporal de la cola de generacion: como los tails de la familia Ultra Heretic y de Qwen3-VL-32B-Instruct son intercambiables, se puede comparar el comportamiento censurado y no censurado reutilizando el mismo codificador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia (estimaciones derivadas del tamano de los ficheros, sin datos del autor): codificador BF16 47,97 GiB + cola BF16 15,21 GB, lo que exige mas de 64 GB solo en pesos; codificador INT8 ConvRot 24,55 GiB + cola INT8 ConvRot 7,09 GiB; cola NVFP4/AWQ 5,40 GB. Hay que anadir el espacio de activaciones, cache KV y el overhead del nodo.
- GPU recomendadas: para la ruta BF16 completa, A100 80 GB o H100 80 GB. Para la ruta INT8 ConvRot, GPU de 48 GB o superiores.
- GPU de consumo: la ruta INT8 ConvRot no cabe en una RTX 4090 de 24 GB si se mantiene el codificador completo en VRAM (24,55 GiB solo en pesos); seria necesario offloading a RAM. La unica pieza que cabe sin problemas en 24 GB es la cola INT8 ConvRot o la NVFP4/AWQ.
- Opciones de despliegue: ComfyUI con su dependencia `comfy-kitchen` en una version reciente y pineada; el nodo externo `ethanfel/ComfyUI-H3-Qwen3VL-TextGen` para generacion standalone. No se menciona soporte para vLLM, TGI, llama.cpp u Ollama, y al no ser un repositorio Transformers completo no son aplicables de forma directa.
- Gestion de memoria: la cola se carga temporalmente y se descarga tras la generacion, mientras el codificador permanece cargado; el LM head INT8 ConvRot se evalua por trozos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (encoder 0-49 + cola 50-63) | ~32B (repartidos) | no disponible | safetensors BF16 / INT8 ConvRot / NVFP4-AWQ | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen3-VL-32B-Instruct (origen de las colas "instruct") | ~32B | no disponible | Transformers estandar (no detallado aqui) | no disponible en la informacion proporcionada | Modelo publico referenciado en la model card |
| llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic | ~32B | no disponible | no disponible | no disponible en la informacion proporcionada | Modelo base declarado, referenciado en la model card |

No se dispone de datos verificados de otros modelos de la misma categoria (por ejemplo, alternativas vision-lenguaje de ~30 000 millones de parametros de otras familias) en la informacion proporcionada, por lo que no se incluye una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": el fine-tune base ha suprimido los mecanismos de rechazo, por lo que puede producir contenido que los modelos alineados rechazarian. No es apto para aplicaciones expuestas al publico sin moderacion externa.
- Riesgo de alucinacion no cuantificado: no hay benchmarks ni evaluaciones publicadas en la informacion disponible.
- Sesgos: no documentados por el autor. Al derivar de Qwen3-VL-32B-Instruct y de un fine-tune sin censura, hereda los sesgos de ambas fuentes sin que se hayan medido.
- Idioma: la model card solo declara ingles, lo que limita su uso en castellano u otros idiomas.
- Longitud de contexto: no especificada, lo que impide planificar cargas de trabajo con entradas largas.
- No es un repositorio Transformers completo: requiere ComfyUI con `comfy-kitchen` pineado y, para generacion standalone, un nodo de terceros. Los ficheros son checkpoints, no un modelo cargable con `AutoModel`.
- Fragmentacion de pesos: el modelo solo funciona como par codificador + cola; usar el codificador 0-49 de forma aislada no produce texto.
- Compatibilidad de cuantizaciones: la cola NVFP4/AWQ solo existe para la variante Qwen3-VL-32B-Instruct, no para la version Ultra Heretic.
- Licencia: se declara apache-2.0, pero no se detallan los terminos del fine-tune base ni posibles condiciones adicionales del modelo del que deriva.
- Ausencia de validacion: 0 descargas y 0 likes, con fechas de creacion y actualizacion identicas, lo que indica que no hay retroalimentacion de la comunidad ni verificacion de integridad mas alla de los SHA-256 publicados por el autor.
- Coste de almacenamiento: el repositorio completo ocupa 128,9 GB, ya que incluye todas las variantes de codificador y cola.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Gurningllama/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-INT8-ConvRot
- Modelo base del fine-tune: https://huggingface.co/llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic
- Repositorio del nodo de generacion standalone: https://github.com/ethanfel/ComfyUI-H3-Qwen3VL-TextGen
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante; los resultados devueltos no guardan relacion con el modelo ni con desarrollo de IA.
