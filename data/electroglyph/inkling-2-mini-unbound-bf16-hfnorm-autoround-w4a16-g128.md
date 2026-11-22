# electroglyph/Inkling-2-Mini-Unbound-BF16-HFNORM-AutoRound-W4A16-G128

## Resumen

Inkling-2-Mini-Unbound-BF16-HFNORM-AutoRound-W4A16-G128 es una cuantizacion de 4 bits del modelo multimodal electroglyph/Inkling-2-Mini-Unbound-BF16-HFNORM, realizada por el usuario electroglyph con la herramienta Intel AutoRound. El modelo es de tipo image-text-to-text, es decir, acepta imagenes y texto como entrada y genera texto, y esta pensado para uso conversacional. Su arquitectura, etiquetada como `inkling2_loop` en la libreria transformers, no dispone de documentacion publica detallada en la informacion proporcionada.

La relevancia de esta ficha radica en que se trata de una cuantizacion W4A16 (pesos de 4 bits, activaciones de 16 bits, grupo de 128 y simetrica) que reduce el peso del modelo a aproximadamente 15,6 GB en safetensors, frente a los pesos BF16 originales. Esto permite desplegar un modelo de unos 4.616 millones de parametros en hardware mas modesto, manteniendo las activaciones en BF16 para preservar calidad. La cuantizacion emplea SignRound con ajuste real sobre datos de calibracion, no redondeo simple (RTN).

El modelo esta publicado con fecha de creacion de noviembre de 2026, no tiene descargas ni likes, y no declara licencia ni idiomas soportados. La model card indica que requiere una version Git de transformers (o un build de vLLM con soporte de `inkling2_loop`) para su ejecucion, ya que la arquitectura no esta incluida en ninguna version publicada en PyPI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | inkling2_loop (multimodal image-text-to-text) |
| Parametros totales | 4.616.256.320 (~4,62 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card usa `--max-model-len 32768` como ejemplo de despliegue, no como especificacion confirmada) |
| Tipos de cuantizacion | W4A16G128, 4 bits, simetrica, group_size 128, formato auto_round |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (auto_round); sin GGUF |

## Arquitectura y entrenamiento

La arquitectura se identifica como `inkling2_loop`, un tipo de modelo multimodal image-text-to-text que en transformers se carga mediante `AutoModelForImageTextToText`. La informacion disponible no detalla si se trata de un transformer denso, MoE, SSM o hibrido, ni el numero de tokens de entrenamiento, la composicion del dataset o si hubo RLHF o DPO. Lo unico que se indica es que el modelo base fue entrenado en BF16 y que heredo una configuracion de cuantizacion obsoleta (`modelopt/NVFP4`) que fue eliminada antes de la cuantizacion.

Sobre el proceso de cuantizacion: se aplico Intel AutoRound con esquema W4A16 y formato `auto_round`, usando SignRound con ajuste real sobre datos de calibracion. La calibracion empleo `HuggingFaceH4/ultrachat_200k` (384 muestras) y `nvidia/OpenCodeInstruct` (128 muestras), con nsamples=512, seqlen=2048, iters=1000, batch_size=16 y semilla 42. Todos los modulos lineales se cuantizaron a 4 bits de forma uniforme, sin overrides de `layer_config`; el embedding se mantiene en BF16. La model card menciona que el modelo dispone de "thinking effort" configurable, ajustable en el system prompt o mediante el parametro `reasoning_effort` de la plantilla de chat, y recomienda esfuerzo alto para tareas de codigo y agenticas.

## Capacidades

- Generacion de texto conversacional en modo multi-turno, segun la pipeline image-text-to-text y la etiqueta `conversational`.
- Procesamiento de imagenes junto con texto (entrada multimodal image-text-to-text).
- Razonamiento con esfuerzo configurable ("thinking effort") a traves del system prompt o del parametro `reasoning_effort` de la plantilla de chat.
- Recomendado por el autor para tareas de codigo y agenticas cuando se usa esfuerzo alto.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada, aunque la model card menciona tareas agenticas.
- Capacidades multilingues: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Despliegue de un asistente multimodal conversacional en produccion: el modelo acepta imagenes y texto y puede mantener conversaciones multi-turno; la version W4A16 reduce el peso a unos 15,6 GB, lo que facilita su servicio en una unica GPU con vLLM.
- Prototipado de aplicaciones de vision-lenguaje: al cargarse con `AutoProcessor` y `AutoModelForImageTextToText`, permite construir rapidamente demos de descripcion de imagenes o respuesta a preguntas sobre imagenes, aunque no se detallan capacidades visuales especificas.
- Tareas de codigo asistido: la model card recomienda esfuerzo de razonamiento alto para coding, por lo que puede emplearse en generacion y revision de codigo dentro de pipelines de desarrollo.
- Flujos agenticos con razonamiento extendido: el parametro `reasoning_effort` permite ajustar la profundidad de razonamiento, util para agentes que necesitan planificacion multi-paso.
- Evaluacion de cuantizacion: sirve como referencia para comparar el rendimiento de W4A16 AutoRound frente al modelo base BF16 en tareas conversacionales y multimodales.
- Investigacion sobre arquitecturas `inkling2_loop`: al requerir transformers Git, es util para quien quiera experimentar con esta arquitectura emergente y su integracion en vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 15,6 GB en safetensors, por lo que se necesita aproximadamente esa cantidad de VRAM para cargar los pesos, mas el espacio para el contexto y las activaciones en BF16.
- GPU recomendadas: no disponible de forma explicita; por tamano, una GPU con 24 GB o mas (por ejemplo, RTX 4090, A100 40 GB, H100) es un punto de partida razonable, aunque no esta confirmado por el autor.
- Cabe en GPU de consumo: probable en tarjetas con 24 GB o mas, segun el tamano del repo, aunque no confirmado.
- Opciones de despliegue: vLLM (soporte nativo de auto_round W4A16 en el kernel de Intel Quantization Support, sin flag `--quantization`), y transformers con `auto-round` instalado. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; es un riesgo importante para produccion.
- Idiomas soportados no declarados: no se puede garantizar cobertura multilingue.
- Requiere transformers Git o un build de vLLM con soporte de `inkling2_loop`; las versiones publicadas en PyPI no incluyen esta arquitectura, lo que complica el despliegue estandar.
- Al ser una cuantizacion de 4 bits, puede haber perdida de calidad frente al modelo BF16 original, especialmente en tareas sensibles; no se aportan metricas de degradacion.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni limitaciones de contexto del modelo base.
- El modelo tiene 0 descargas y 0 likes, y fue creado y actualizado con un minuto de diferencia, lo que sugiere que no ha sido validado por la comunidad.
- La model card advierte de que la configuracion de cuantizacion heredada del modelo base era obsoleta y fue eliminada; conviene verificar la integridad de los pesos antes de usarlos en produccion.
- No hay formato GGUF disponible, lo que limita el uso en llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/electroglyph/Inkling-2-Mini-Unbound-BF16-HFNORM-AutoRound-W4A16-G128
- Modelo base: https://huggingface.co/electroglyph/Inkling-2-Mini-Unbound-BF16-HFNORM
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Documentacion de vLLM sobre cuantizacion Intel: https://docs.vllm.ai/en/stable/features/quantization/inc/
- Dataset de calibracion ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset de calibracion OpenCodeInstruct: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
