# rkcth/Huihui-Gemma-4-26B-A4B-it-Abliterated-Radiance-INT8

## Resumen

Huihui-Gemma-4-26B-A4B-it-Abliterated-Radiance-INT8 es una cuantizacion INT8 del modelo huihui-ai/Huihui-gemma-4-26B-A4B-it-abliterated, publicada por el usuario rkcth. Se trata de una variante "abliterated" (es decir, con las direcciones de rechazo eliminadas del espacio de activaciones) del Gemma 4 26B-A4B, un transformer de tipo Mixture of Experts con 26.000 millones de parametros totales y aproximadamente 4.000 millones activos por token. El checkpoint original procede de Google DeepMind y ha pasado por un proceso de abliteracion y posterior cuantizacion por parte de la comunidad.

La peculiaridad de esta publicacion es que no es una cuantizacion generica: emplea el formato propietario Radiance (extensions .rad) desarrollado para GPUs AMD, con las proyecciones gate y up de los expertos cuantizadas a INT8 mediante rotacion y las proyecciones down de los expertos mantenidas en BF16. El autor verifica el funcionamiento en dos Radeon AI PRO R9700 como modelo secundario junto a Qwen Flash Next, lo que la convierte en una opcion especifica para despliegues en hardware AMD con el fork de Radiance.

Su relevancia es doble: por un lado demuestra la viabilidad de servir un MoE de 26B en INT8 sobre GPUs de consumo profesional AMD sin depender de CUDA; por otro, la abliteracion elimina los mecanismos de rechazo del modelo original, algo que interesa a investigadores de seguridad y a quienes necesitan un modelo sin filtros para tareas de generacion creativa o analisis de contenido sensible. La licencia Apache 2.0 facilita su uso comercial, aunque con las cautelas habituales sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), derivado de Gemma 4 26B-A4B |
| Parametros totales | 26.000 millones (26B) |
| Parametros activos | 4.000 millones (4B) aproximadamente |
| Longitud de contexto | 8192 tokens configurados en el ejemplo de despliegue (no se especifica el maximo nativo) |
| Tipos de cuantizacion | INT8 con rotacion en gate y up de expertos; down de expertos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Radiance (.rad), checkpoint de 33,07 GiB; repo de 35,5 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture of Experts con 26B parametros totales y unos 4B activos por token, siguiendo la estela de la familia Gemma de Google DeepMind. La variante huihui-ai aplica abliteracion, una tecnica que identifica la direccion en el espacio de activaciones asociada al rechazo de peticiones y la resta de los pesos, de modo que el modelo deja de negarse a responder a ciertos temas. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original.

La innovacion tecnica de esta publicacion concreta es la cuantizacion Radiance: las proyecciones gate y up de los expertos se cuantizan a INT8 aplicando una rotacion previa (para reducir el error de cuantizacion), mientras que las proyecciones down se mantienen en BF16. El autor indica que el checkpoint esta verificado para chat en dos Radeon AI PRO R9700 con el fork de Radiance, usando colocacion `expert_tiered` y un pool de host de 16384 MiB. La configuracion de ejemplo fija `max-model-len` a 8192, `max-num-seqs` a 2 y `max-num-batched-tokens` a 512, con `num-speculative-tokens` a 0 (sin decodificacion especulativa).

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a chat.
- Razonamiento y respuesta a instrucciones (variante `it`, instruction-tuned).
- Capacidades de codigo y matematicas heredadas del modelo base Gemma 4 26B-A4B (no se detallan en la model card).
- Sin filtros de rechazo gracias a la abliteracion: responde a peticiones que el modelo original rechazaria.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponible.

## Casos de uso

- Investigacion en seguridad de IA: el modelo permite estudiar como la abliteracion afecta a la tasa de rechazo y a la calidad de las respuestas, comparando con el Gemma 4 original en tareas de red teaming controlado.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que requiera tratar temas sensibles sin que el modelo se niegue, usando la ventana de 8192 tokens para mantener coherencia en escenas largas.
- Despliegue en hardware AMD: servir un MoE de 26B en INT8 sobre dos Radeon AI PRO R9700 con el fork de Radiance, como modelo secundario junto a otro modelo principal en el mismo nodo, segun la configuracion verificada por el autor.
- Prototipado de chat en entornos con GPUs AMD: uso del endpoint de chat de Radiance con el identificador `gemma4-26b-abliterated` para validar integraciones antes de pasar a produccion.
- Analisis de contenido sensible: clasificacion y resumen de textos que tratan violencia, contenido adulto o temas controvertidos, donde un modelo con rechazos sistematicos degradaria la utilidad.
- Experimentacion con cuantizacion INT8 en MoE: evaluar el impacto de cuantizar solo gate y up manteniendo down en BF16 sobre la perplejidad y la calidad de generacion, comparando con el checkpoint BF16 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 33,07 GiB; con overhead de ejecucion y cache KV para 8192 tokens, se recomienda un minimo de 40-48 GB de VRAM agregada.
- GPU verificadas por el autor: dos Radeon AI PRO R9700 (32 GB cada una) con tensor parallelism `tp: 2`.
- GPUs NVIDIA: el formato Radiance y el fork estan orientados a AMD; no se documenta soporte para CUDA en la informacion disponible.
- Cabe en GPU de consumo: no en una sola; dos Radeon AI PRO R9700 son el minimo verificado. No se documenta funcionamiento en RTX 4090 (24 GB) ni en GPUs de 16 GB.
- Opciones de despliegue: exclusivamente el fork de Radiance (https://github.com/rkcth/radiance), compilando ejecutable y plugins juntos. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Configuracion recomendada: `placement: expert_tiered`, `host-pool-mib: 16384`, `max-model-len: 8192`, `max-num-seqs: 2`, `max-num-batched-tokens: 512`, `num-speculative-tokens: 0`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| Huihui-Gemma-4-26B-A4B-Abliterated-Radiance-INT8 | 26B totales / 4B activos | 8192 (config.) | Radiance INT8/BF16 | Apache 2.0 | 2x Radeon AI PRO R9700 |
| huihui-ai/Huihui-gemma-4-26B-A4B-it-abliterated (base) | 26B totales / 4B activos | no disponible | safetensors BF16 | Apache 2.0 | Multi-GPU, mayor VRAM |
| Gemma 4 26B-A4B original | 26B totales / 4B activos | no disponible | safetensors | Gemma Terms | Multi-GPU |
| Qwen Flash Next (mencionado por el autor) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La abliteracion elimina los rechazos del modelo: puede generar contenido ofensivo, ilegal o peligroso sin filtros. No apto para aplicaciones de cara al publico sin moderacion externa.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; al ser una cuantizacion INT8, puede introducir degradacion adicional respecto al BF16.
- La cuantizacion INT8 solo afecta a gate y up de expertos; la mezcla INT8/BF16 puede producir comportamientos numericos distintos al checkpoint original.
- Limitaciones de contexto: la configuracion verificada fija 8192 tokens; no se documenta el maximo nativo ni el rendimiento mas alla de esa longitud.
- Idiomas soportados: no disponible; no se puede garantizar calidad multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Gemma puede arrastrar terminos adicionales de Google; conviene revisar LICENSE y NOTICE del repo.
- Despliegue limitado al fork de Radiance y a hardware AMD verificado; no hay soporte documentado para CUDA, vLLM ni llama.cpp.
- Repo con 0 descargas y 0 likes: sin validacion de la comunidad; el autor solo reporta verificacion en dos R9700.
- Verificar el checkpoint con `sha256sum -c SHA256SUMS` antes de usarlo; el autor lo indica explicitamente.

## Enlaces

- Hugging Face: https://huggingface.co/rkcth/Huihui-Gemma-4-26B-A4B-it-Abliterated-Radiance-INT8
- Modelo base: https://huggingface.co/huihui-ai/Huihui-gemma-4-26B-A4B-it-abliterated
- Checkpoint fuente fijado: https://huggingface.co/huihui-ai/Huihui-gemma-4-26B-A4B-it-abliterated/tree/bfa658000df7d734e0946595ab832abb7e34b1be
- Fork de Radiance: https://github.com/rkcth/radiance
