# divinetribe/Hermes-4-14B-abliterated-4bit-mlx

## Resumen

Hermes-4-14B-abliterated-4bit-mlx es una cuantizacion en 4 bits del modelo Babsie/Hermes-4-14B-BF16-abliterated, publicada por el usuario divinetribe en Hugging Face. El modelo original combina la arquitectura Qwen3 de Alibaba con el post-entrenamiento de instrucciones de la familia Hermes 4 de NousResearch, y sobre esa base se ha aplicado una "abliteracion": una proyeccion de la direccion de rechazo (Arditi et al., 2024) que suprime la tendencia del modelo a negarse a responder peticiones benignas pero incomodas. El resultado es un modelo conversacional sin mecanismos de rechazo integrados, orientado a uso local.

La contribucion de esta ficha concreta es la conversion a formato MLX con cuantizacion afina de 4 bits y tamano de grupo 64, pensada para inferencia en Apple Silicon. Con 14.768.307.200 parametros y un peso en disco de aproximadamente 8,3 GB repartido en dos shards de safetensors, el modelo cabe en un Mac de 16 GB de memoria unificada y se mueve con holgura en equipos de 32 GB o mas. La longitud de contexto es de 40.960 tokens, heredada sin cambios del Hermes 4 14B original.

Su relevancia actual es practica: permite ejecutar un modelo de 14B con capacidades de tool calling y salida estructurada de forma completamente local, sin claves de API ni telemetria, y exponerlo mediante un servidor compatible con la API de OpenAI a traves de mlx-lm. Esta pensado para integraciones tipo agente local, como el stack claude-code-local del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso Qwen3 con post-entrenamiento Hermes 4 |
| Parametros totales | 14.768.307.200 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | 4-bit affine, group size 64 (MLX) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (dos shards: 5,35 GB + 2,95 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3, con el tokenizador y la plantilla de chat de Qwen3, sobre el que NousResearch aplico el post-entrenamiento de instrucciones de Hermes 4. Ese post-entrenamiento esta orientado a uso de herramientas, salida estructurada y seguimiento de instrucciones, y es el que aporta el comportamiento conversacional caracteristico de la familia Hermes. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO en la informacion proporcionada.

Sobre los pesos BF16 resultantes, Babsie aplico abliteracion mediante proyeccion de la direccion de rechazo siguiendo el metodo de Arditi et al. (2024), que elimina del espacio de activaciones la direccion asociada a las respuestas de negativa. Posteriormente, divinetribe realizo la conversion a MLX con mlx-lm 0.31.2 aplicando cuantizacion afina de 4 bits con tamano de grupo 64. La abliteracion no anade capacidades nuevas: su efecto es suprimir el rechazo preventivo ante peticiones benignas pero delicadas, dejando la moderacion en manos del usuario.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat Qwen3.
- Seguimiento de instrucciones segun el post-entrenamiento Hermes 4.
- Tool calling y function calling, con soporte para salidas estructuradas.
- Razonamiento multi-paso y flujos de agente local.
- Generacion de codigo y asistencia en tareas de programacion.
- Respuestas sin rechazo preventivo ante peticiones benignas pero incomodas (comportamiento abliterado).
- Inferencia completamente local en Apple Silicon mediante mlx-lm, sin API ni telemetria.
- Exposicion como endpoint compatible con la API de OpenAI a traves de mlx_lm.server.
- Soporte de un unico idioma declarado: ingles.

## Casos de uso

- Asistente de programacion en local: se puede levantar con `mlx_lm.server` y enrutar clientes compatibles con la API de Anthropic u OpenAI hacia el modelo, de modo que herramientas como Claude Code funcionen sin conexion a la nube, aprovechando el soporte de tool calling y los 40.960 tokens de contexto.
- Agente de automatizacion en Mac: con 14B en 4 bits y ~8 GB en disco, el modelo puede mantenerse cargado de forma permanente en un Mac de 16 GB y atender tareas de edicion de ficheros, ejecucion de comandos y consultas encadenadas.
- Procesamiento de documentos largos: la ventana de 40.960 tokens permite resumir o extraer informacion de contratos, informes o transcripciones de varias decenas de paginas en una sola pasada, sin fragmentacion.
- Prototipado de pipelines de IA sin coste de API: util para desarrolladores que necesitan iterar sobre prompts, plantillas de chat y esquemas de herramientas sin incurrir en facturacion por token ni depender de conectividad.
- Entornos con requisitos de privacidad: al ejecutarse integramente en el dispositivo, es apto para flujos con datos sensibles donde no se permite enviar contenido a servicios externos.
- Evaluacion de comportamiento sin censura: investigadores que estudian alineamiento, rechazo y sesgos pueden usar la variante abliterada como contrapunto a la version original de Hermes 4 en experimentos comparativos.
- Despliegue de multiples modelos simultaneos: en equipos con 64 GB o mas de memoria unificada, el reducido peso del modelo permite cargar varias instancias o combinarlo con otros modelos de la misma coleccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 8 GB para los pesos en 4 bits, mas overhead del runtime y de la cache KV; en la practica, un Mac de 16 GB es el minimo comodo y 32 GB o mas ofrece margen amplio.
- Espacio en disco: ~8,3 GB para los dos shards de safetensors.
- GPU recomendadas: Apple Silicon con memoria unificada; el modelo esta disenado para Macs. No hay soporte declarado para CUDA en esta conversion.
- Cabe en GPU de consumo: si, en equipos Apple con 16 GB o mas de memoria unificada (MacBook Air/Pro, Mac mini, Mac Studio). No aplica a GPUs NVIDIA de consumo en este formato.
- Opciones de despliegue: mlx-lm (libreria Python), `mlx_lm.server` como servidor compatible con la API de OpenAI, y el stack claude-code-local mediante `scripts/start-mlx-server.sh`.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Hermes-4-14B-abliterated-4bit-mlx (este) | 14B | 40.960 | MLX safetensors 4-bit | Apache 2.0 | Local en Apple Silicon, sin rechazo, tool use |
| Llama-3.3-70B-Instruct-abliterated-8bit-mlx (divinetribe) | 71B | no disponible | MLX 8-bit | no disponible | Razonamiento mas exigente, requiere 96 GB+ |
| gemma-4-31b-it-abliterated-4bit-mlx (divinetribe) | 31B | no disponible | MLX 4-bit | no disponible | Codigo diario, requiere 32 GB+ |
| Babsie/Hermes-4-14B-BF16-abliterated (modelo base) | 14B | 40.960 | safetensors BF16 | Apache 2.0 | Misma capacidad, ~28 GB, sin cuantizar |

## Limitaciones y advertencias

- La abliteracion suprime el rechazo preventivo: el modelo puede responder a peticiones que el Hermes 4 original declinaria. La moderacion y la responsabilidad de uso recaen integramente en el operador.
- La abliteracion no mejora las capacidades del modelo; es una modificacion de comportamiento, no una mejora de rendimiento.
- Riesgo de alucinacion inherente a un modelo de 14B; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- Idioma declarado unicamente ingles; el rendimiento en castellano no esta garantizado ni documentado.
- La cuantizacion a 4 bits puede degradar la calidad respecto al BF16 original, especialmente en tareas de razonamiento complejo y generacion de codigo largo.
- La licencia Apache 2.0 se hereda de la familia Hermes 4 / Qwen3, pero el uso comercial de una variante abliterada debe evaluarse tambien frente a las politicas de uso de los modelos upstream.
- El formato MLX limita el despliegue a Apple Silicon; no es directamente utilizable en CUDA, vLLM, TGI o llama.cpp sin reconversion.
- El modelo esta pensado para uso local y no se documentan garantias de estabilidad en produccion ni soporte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/Hermes-4-14B-abliterated-4bit-mlx
- Modelo base: https://huggingface.co/Babsie/Hermes-4-14B-BF16-abliterated
- Familia Hermes 4 (NousResearch): https://huggingface.co/NousResearch
- Qwen3 (Alibaba): https://huggingface.co/Qwen
- Paper de abliteracion (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- mlx-lm: https://github.com/ml-explore/mlx-lm
- Repositorio claude-code-local: https://github.com/nicedreamzapp/claude-code-local
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- Perfil del autor en Hugging Face: https://huggingface.co/divinetribe
- Coleccion Abliterated MLX for Apple Silicon: https://huggingface.co/collections/divinetribe/abliterated-mlx-for-apple-silicon
