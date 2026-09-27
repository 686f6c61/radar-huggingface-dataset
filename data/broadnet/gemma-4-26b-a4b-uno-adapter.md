# Broadnet/gemma-4-26B-A4B-uno-adapter

## Resumen

Broadnet/gemma-4-26B-A4B-uno-adapter es un adaptador LoRA de rango 16 entrenado con el metodo Uno para actuar como drafter de decodificacion especulativa sobre el modelo google/gemma-4-26B-A4B-it. No es un modelo de chat autonomo ni una mejora de calidad: es un componente de inferencia que propone tokens que el modelo base acepta o rechaza mediante rejection sampling, de modo que la distribucion de salida es la del modelo original. Lo publica Broadnet, que lo usa en produccion para cargas de trabajo de agentes en ingles y arabe (prompts de sistema largos, llamadas a herramientas, JSON estructurado y coordinacion multi-paso).

El adaptador ocupa 75.627.016 bytes en `adapter_model.safetensors` y se entreno con 10.000 prompts abiertos, 2 epocas y 20.000 actualizaciones sobre una unica RTX 3090 de 24 GB, atravesando el mismo checkpoint AWQ de 4 bits con el que luego se sirve. Los modulos objetivo son las proyecciones de atencion (q, k, v, o) y el MLP compartido (gate, up, down) de las 30 capas del decodificador; los expertos MoE empaquetados permanecen congelados. Se sirve con Uno for vLLM v0.4.0.

Su relevancia esta en la relacion entre coste y ganancia: los drafters especulativos suelen exigir clusters y miles de millones de tokens de entrenamiento, mientras que este declara 1,52x de aceleracion sobre decodificacion plana en trafico de produccion y entre 1,26x y 1,47x en prompts de 2.000 a 28.000 tokens, entrenado con una sola GPU consumer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT LoRA sobre un transformer MoE (los expertos MoE empaquetados permanecen congelados); usado como drafter de decodificacion especulativa |
| Parametros totales | Adaptador: `adapter_model.safetensors` de 75.627.016 bytes (recuento de parametros no disponible). Modelo base: nomenclatura "26B-A4B", no confirmado de forma explicita en la informacion disponible |
| Parametros activos | No disponible de forma explicita; la nomenclatura A4B del modelo base sugiere del orden de 4B activos |
| Longitud de contexto | 32k tokens en el perfil de servicio `gemma4` (vLLM con hybrid KV cache manager y split-KV draft attention); ventana nativa del modelo base no disponible |
| Tipos de cuantizacion | AWQ 4-bit en el checkpoint medido (`cyankiwi/gemma-4-26B-A4B-it-AWQ-4bit`, revision `0ef577a5710035bd2d3a3f27e4f5cb2e86a9a9ba`); el adaptador se publica sin cuantizar en safetensors |
| Idiomas soportados | `en` declarado en la model card; BroadNet indica uso en produccion en ingles y arabe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |
| Rango LoRA / alpha / dropout | 16 / 256 / 0, sin bias |
| Modulos objetivo | Atencion q, k, v, o y MLP compartido gate, up, down en las 30 capas del decodificador |
| Vocabulario de draft | 64k tokens (segun la configuracion de servicio) |
| Checkpoint publicado | Paso 20.000 |
| SHA-256 del adaptador | `2f9e7c8f3db6f0259bbf7699ab0fc2f36e19185956f3364d97cef56e11544629` |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 256, sin dropout ni bias, aplicado sobre las proyecciones de atencion y sobre el MLP compartido de las 30 capas del decodificador del modelo base. Los expertos MoE empaquetados no se tocan, lo que concentra el entrenamiento en las rutas densas y compartidas. El entrenamiento consistio en 10.000 filas, 2 epocas y 20.000 actualizaciones con tasa de aprendizaje 1e-5, ejecutado en una sola RTX 3090 de 24 GB y, de forma destacable, a traves del mismo checkpoint AWQ 4-bit sobre el que despues se sirve, lo que evita la discrepancia habitual entre el modelo de entrenamiento y el cuantizado en produccion.

Los prompts de entrenamiento proceden de datasets publicos (smoltalk2, oasst2, CodeFeedback-Filtered-Instruction, Nemotron-Post-Training-Dataset-v1, ToolACE, hermes-function-calling-v1, OpenThoughts3-1.2M y OpenMathReasoning) y las respuestas con las que aprendio el drafter las genero el propio Gemma 4. No se usaron datos privados ni de produccion. No se documenta en la informacion disponible el uso de RLHF o DPO en el entrenamiento del adaptador.

La innovacion tecnica es doble. Por un lado, el metodo Uno con rejection sampling contra el modelo completo garantiza que la distribucion de salida sea la del modelo original, sin perdida de calidad. Por otro, el drafter mantiene su ventaja en prompts largos, un regimen donde el DFlash medido en la misma tarjeta cae por debajo de la decodificacion plana.

## Capacidades

- Aceleracion de decodificacion: actua como drafter especulativo del modelo base, no genera respuestas por si mismo; el modelo grande decide cada token.
- Decodificacion sin perdida: la aceptacion por rejection sampling preserva la distribucion de salida del modelo subyacente.
- Preservacion de la ventaja en contexto largo: de 1,47x a 1,26x de aceleracion entre 2.000 y 28.000 tokens de prompt.
- Compatibilidad con cargas de agente: el autor lo despliega para prompts de sistema largos, llamadas a herramientas, JSON estructurado y coordinacion multi-paso.
- Rendimiento en produccion declarado: 4,934 ms por token de salida frente a 7,489 ms de la decodificacion plana, con 3,72 tokens por ciclo y un 99 % de ciclos con al menos un token de draft aceptado.
- Idiomas: el modelo base se usa en ingles y arabe en produccion, aunque la model card solo declara `en`.
- Capacidades funcionales (tool calling, codigo, matematicas, razonamiento) heredadas del modelo base, no anadidas por el adaptador.
- No aporta capacidades multimodales, de audio ni modo thinking propias: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de agentes en produccion: reducir la latencia por token de un asistente con prompts de sistema largos, llamadas a herramientas y JSON estructurado, manteniendo exactamente la distribucion de salida del modelo base.
- Atencion al cliente multilingue (ingles y arabe): al bajar los milisegundos por token de 7,489 a 4,934 en la misma GPU, se atienden mas conversaciones por tarjeta sin cambiar una sola palabra generada.
- Procesamiento de documentos largos: con prompts de 14.000 a 28.000 tokens la aceleracion se mantiene en 1,33x a 1,26x, util para resumen y extraccion sobre contratos, informes o expedientes.
- Pipelines RAG con contexto extenso: el drafter evita la degradacion que sufre DFlash a partir de 6.000 tokens (0,94x y bajando), por lo que es la opcion adecuada cuando el contexto recuperado es largo.
- Despliegue en hardware limitado: permite ganar velocidad de decodificacion en una unica RTX 3090 de 24 GB, sin cluster de entrenamiento ni de inferencia.
- Generacion de codigo asistida en IDE o CI/CD: cualquier tarea de generacion token a token del modelo base se beneficia de la reduccion de latencia, siempre que el checkpoint sea el fijado por el perfil `gemma4`.
- Reduccion de coste por GPU: al aumentar los tokens por segundo por tarjeta, se puede consolidar la flota de inferencia de un servicio existente de Gemma 4 26B A4B.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: el repositorio incluye validacion frente a decodificacion plana y frente a DFlash, util como referencia metodologica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas cifras publicadas son mediciones de latencia y aceptacion, realizadas en una RTX 3090 con Uno for vLLM v0.4.0, K=4 y el vocabulario de draft de 64k, comparando contra decodificacion plana medida en la misma sesion e imagen.

Trafico de produccion (72 peticiones reales, una a la vez, reloj HTTP, imagen final):

| Metrica | Uno (dos servidores) | Decodificacion plana |
|---|---:|---:|
| Milisegundos por token de salida | 4,934 / 4,905 | 7,489 |
| Aceleracion sobre plano | 1,52x | 1,00x |
| Tokens por ciclo (tau) | 3,72 / 3,72 | no aplica |
| Ciclos con al menos un draft aceptado | 99 % | no aplica |

Prompts largos (documentos abiertos, mediana de tiempo de decodificacion por token de salida):

| Tokens de prompt | 2k | 6k | 10k | 14k | 20k | 28k |
|---|---:|---:|---:|---:|---:|---:|
| Aceleracion de Uno sobre plano | 1,47x | 1,35x | 1,36x | 1,33x | 1,28x | 1,26x |
| Aceleracion de DFlash sobre plano | 1,14x | 0,94x | 0,86x | 0,75x | 0,74x | 0,69x |

Validacion de ausencia de perdida (distancias de variacion total, Uno frente a plano comparadas con plano frente a plano):

| Escenario | Uno frente a plano | Plano frente a plano |
|---|---:|---:|
| Prompts cortos de produccion (imagen final) | 0,056 a 0,067 | 0,048 a 0,062 |
| Documentos de 3k a 14k tokens (primera imagen) | 0,222 a 0,246 | 0,233 a 0,245 |
| Replays greedy con divergencia | 61 y 57 de 72 respuestas | 60 de 72 respuestas |

## Requisitos de hardware

- Entrenamiento: una unica RTX 3090 de 24 GB, 10.000 filas, 2 epocas y 20.000 actualizaciones a 1e-5.
- Inferencia medida: una RTX 3090 de 24 GB por servidor, con dos servidores Uno y un servidor plano en la prueba de produccion.
- VRAM del modelo completo: no se publica una tabla oficial; el autor sirve el checkpoint AWQ 4-bit de 26B en 24 GB, lo que implica que el peso cuantizado y la cache KV caben en esa tarjeta. La estimacion aritmetica de los pesos (aproximadamente 13 GB a 4 bits para 26B) es una inferencia, no un dato del autor.
- GPU recomendadas: no disponible. El autor solo valida RTX 3090 y advierte que otras GPUs, otros checkpoints y otros tamanos de Gemma 4 necesitan su propia validacion.
- Opciones de despliegue: contenedor `ghcr.io/brntech/vllm-uno:0.4.0` con el perfil `UNO_PROFILE=gemma4`, que fija la revision del checkpoint y sirve a 32k de contexto. No se documenta soporte para llama.cpp, Ollama, TGI ni vLLM estandar sin el fork de Uno.
- Latencia declarada: 4,934 y 4,905 ms por token de salida frente a 7,489 ms en plano (trafico de produccion); 3,72 tokens por ciclo con K=4.
- Configuracion de servicio: cache KV hibrida de vLLM con atencion de draft split-KV y vocabulario de draft de 64k activado; nombre del modelo servido `uno-gemma4-26b-a4b`.
- Advertencia de concurrencia: con varios usuarios enviando prompts largos a la vez, el procesamiento de prompt domina y la decodificacion plana igualo a Uno y a DFlash en la prueba del autor.

## Comparativa con modelos similares

No hay en la informacion disponible especificaciones de otros drafters comparables (Medusa, EAGLE, drafters propios de Gemma) mas alla de DFlash, medido en la misma tarjeta y sesion. La comparacion se limita por tanto a la tecnica de referencia incluida en la propia model card.

| Aspecto | Uno (este adaptador) | DFlash | Decodificacion plana |
|---|---|---|---|
| Tipo | Drafter LoRA PEFT sobre Gemma 4 26B A4B | Drafter evaluado en la misma tarjeta | Sin drafter |
| Aceleracion en produccion | 1,52x | no disponible | 1,00x |
| Aceleracion a 2k tokens | 1,47x | 1,14x | 1,00x |
| Aceleracion a 10k tokens | 1,36x | 0,86x | 1,00x |
| Aceleracion a 28k tokens | 1,26x | 0,69x | 1,00x |
| Perdida de calidad | Ninguna (rejection sampling) | no disponible | Ninguna |
| Hardware de entrenamiento | Una RTX 3090 de 24 GB, 10.000 prompts | no disponible | no aplica |
| Licencia | Apache 2.0 | no disponible | no aplica |
| Disponibilidad | Adaptador publicado en HuggingFace y contenedor vLLM | no disponible | no aplica |

Frente a la alternativa de no usar drafter, el adaptador ofrece la misma distribucion de salida con menos milisegundos por token, a cambio de depender de una pila de servicio concreta (Uno for vLLM v0.4.0) y de una revision fija del checkpoint cuantizado.

## Limitaciones y advertencias

- No es una mejora de calidad: el drafter solo propone tokens y el modelo base decide cada uno; no corrige ni mejora las respuestas.
- Medido en un unico tipo de GPU (RTX 3090) y con una peticion a la vez para la cifra de produccion; la extrapolacion a otras tarjetas no esta validada.
- Bajo carga concurrente con prompts largos, el procesamiento de prompt domina y la ventaja desaparece: en las pruebas del autor, la decodificacion plana igualo a Uno y a DFlash.
- Acoplado a un checkpoint concreto: la revision `0ef577a5710035bd2d3a3f27e4f5cb2e86a9a9ba` de `cyankiwi/gemma-4-26B-A4B-it-AWQ-4bit`; otros checkpoints, otros tamanos de Gemma 4 y otras GPUs requieren validacion propia.
- Dependencia de infraestructura: necesita el fork Uno for vLLM v0.4.0; no se documenta funcionamiento en vLLM estandar, llama.cpp, Ollama ni TGI.
- Idiomas: la model card solo declara `en`; el uso en arabe corresponde al despliegue de BroadNet, no a una capacidad declarada del adaptador.
- Sesgos: no documentados en la informacion disponible. Al haberse entrenado con respuestas generadas por Gemma 4 sobre datasets publicos, puede heredar los sesgos del modelo base y de esas fuentes.
- Alucinacion: no se publican evaluaciones de veracidad; el riesgo es el del modelo base, no modificado por el adaptador.
- Licencia: los pesos del adaptador son Apache 2.0, igual que el modelo base, pero los datasets de entrenamiento conservan sus propias licencias (la tabla de licencias de la model card aparece truncada en la informacion disponible y no se pueden verificar todos los terminos).
- Validacion externa practicamente nula: 0 descargas y 0 likes en el momento de la consulta, con repositorio de 0,1 GB.
- Sin benchmarks de calidad publicados, por lo que no se puede comparar su efecto en tareas de razonamiento, codigo o matematicas mas alla de la equivalencia distribucional declarada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Broadnet/gemma-4-26B-A4B-uno-adapter
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Checkpoint AWQ 4-bit medido: https://huggingface.co/cyankiwi/gemma-4-26B-A4B-it-AWQ-4bit
- Codigo de servicio y contenedor (Uno for vLLM v0.4.0): https://github.com/brntech/vllm-uno/releases/tag/v0.4.0
- Imagen de contenedor: `ghcr.io/brntech/vllm-uno:0.4.0`
- Paper del metodo Uno: https://arxiv.org/abs/2609.04010
- Validacion detallada de Uno frente a plano y DFlash: `docs/validation.md` del repositorio vllm-uno v0.4.0
- Datasets de entrenamiento: https://huggingface.co/datasets/HuggingFaceTB/smoltalk2, https://huggingface.co/datasets/OpenAssistant/oasst2, https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction, https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v1, https://huggingface.co/datasets/Team-ACE/ToolACE, https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1, https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M, https://huggingface.co/datasets/nvidia/OpenMathReasoning
