# richmondsin/Qwen3.5-4B-Post-Reasoning

## Resumen

Qwen3.5-4B-Post-Reasoning es un ajuste fino supervisado del modelo Qwen/Qwen3.5-4B, publicado por el autor richmondsin (Richmond Jing Xuan Sin) junto con el articulo "Post-Reasoning: Improving the Performance of Non-Thinking Models at Negligible Cost" (arXiv:2605.06165). El modelo implementa la tecnica de post-reasoning: se le pide al modelo que emita primero la respuesta final y que justifique despues, de modo que la generacion puede detenerse en el marcador de fin de respuesta sin que se hayan consumido tokens de razonamiento previos. El objetivo es mejorar el rendimiento de modelos de tipo no-thinking a un coste de inferencia practicamente nulo.

Arquitectonicamente se trata de un transformer denso de 4.539.265.536 parametros (4,54 mil millones) derivado de la familia Qwen3.5, con pipeline image-text-to-text en los tags de Hugging Face y pipeline declarado text-generation. El ajuste se realizo mediante LoRA (r 16, alpha 32, dropout 0,05) durante 3 epocas con tasa de aprendizaje 2e-5 y schedule coseno, y posteriormente se fusiono en los pesos base en bf16.

Su relevancia actual reside en que propone una alternativa de bajo coste al paradigma de modelos con modo thinking: en lugar de generar cadenas de razonamiento largas antes de la respuesta, el modelo responde de inmediato y justifica a continuacion, lo que permite reducir latencia y tokens de salida manteniendo (segun el autor) la calidad de la respuesta. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), sin datos adicionales sobre atencion o capas |
| Parametros totales | 4.539.265.536 (4,54 mil millones) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers; compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer denso de 4,54 mil millones de parametros. El ajuste se realizo con LoRA de rango 16, lora_alpha 32 y dropout 0,05, tasa de aprendizaje 2e-5, 3 epocas y schedule coseno; posteriormente la adaptacion se fusiono en los pesos base en bf16. El checkpoint local de entrenamiento se denomino `Qwen35-4B-numina-Reflection-Merged-v4`.

Los datos de entrenamiento son problemas de NuminaMath acompanados de justificaciones post-respuesta auto-destiladas (fichero `post_reflective_data/qwen35_4b_numina_v4.json`). La innovacion clave es el enmascaramiento de la loss: se calcula unicamente sobre las justificaciones posteriores a la respuesta, enmascarando tanto el prompt como la respuesta final. De este modo el modelo aprende a justificar despues de responder sin penalizar la emision directa de la respuesta. El formato de salida esperado es del tipo "Answer: ... Explanation: ...", lo que permite detener la generacion en el marcador de inicio de la explicacion para leer solo la respuesta. No se menciona RLHF ni DPO en la informacion disponible.

## Capacidades

- Generacion de texto conversacional con formato de respuesta inmediata seguida de justificacion (post-reasoning).
- Razonamiento matematico, dado que el ajuste se realizo sobre problemas de NuminaMath.
- Salida estructurada con marcadores explicitos ("Answer:" y "Explanation:"), lo que facilita el parseo y la parada temprana de generacion.
- Capacidad multimodal potencial: los tags de Hugging Face incluyen `image-text-to-text`, aunque la model card no detalla el uso de vision.
- Compatibilidad con endpoints (`endpoints_compatible`) y con vLLM mediante `LLM.chat`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no; precisamente el modelo esta disenado para evitar tokens de razonamiento previos a la respuesta.

## Casos de uso

- Respuesta de baja latencia en produccion: al emitir la respuesta final primero y poder detener la generacion con `stop=["Explanation"]`, se eliminan los tokens de razonamiento previos y se reduce el tiempo hasta el primer token util y el coste de salida en APIs de chat.
- Tutoria matematica con justificacion: el modelo responde al problema y a continuacion explica el procedimiento, lo que resulta adecuado para entornos educativos donde se quiere la respuesta y, opcionalmente, la derivacion.
- Evaluacion automatizada con parseo sencillo: el marcador "Answer:" permite extraer la respuesta de forma determinista en pipelines de evaluacion de benchmarks de matematicas.
- Sistemas de Q&A con presupuesto de tokens ajustado: la parada temprana en el marcador de explicacion permite fijar un limite de tokens de salida muy bajo sin sacrificar la respuesta.
- Generacion de explicaciones bajo demanda: el mismo modelo sirve para responder de forma concisa o para producir una justificacion detallada segun se trunque o no la generacion.
- Prototipado e investigacion sobre post-reasoning: sirve como referencia reproducible del metodo descrito en el paper, con scripts de evaluacion disponibles en el repositorio de GitHub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9 GB solo para pesos (4,54 mil millones de parametros a 2 bytes), mas overhead de cache KV y activaciones; el tamano del repo es de 9,1 GB.
- En cuantizacion de 8 bits: alrededor de 4,5-5 GB de pesos; en 4 bits: alrededor de 2,5-3 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: A100, H100 o L40S para despliegue en bf16 con concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en bf16 de una sola instancia.
- Cabe en GPU de consumo: si, en tarjetas con 12-16 GB o mas en bf16, y en tarjetas de 8 GB con cuantizacion de 4 bits (no se proporcionan pesos GGUF oficiales).
- Opciones de despliegue: vLLM (ejemplo oficial en la model card), transformers; llama.cpp, Ollama y TGI no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Post-Reasoning | 4,54 mil millones | no disponible | Post-reasoning (respuesta primero, justificacion despues) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | 4,54 mil millones | no disponible | Modelo instructivo base | Apache 2.0 | Hugging Face |
| Alternativas de razonamiento con modo thinking de tamano similar | no disponible | no disponible | Cadenas de razonamiento previas a la respuesta | no disponible | no disponible |

No se dispone de datos de rendimiento comparado en la informacion proporcionada; la comparativa se limita a parametros, licencia y enfoque.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de Qwen3.5-4B hereda los sesgos del modelo base y de los datos de NuminaMath.
- Riesgo de alucinacion: presente como en cualquier modelo de 4,5 mil millones de parametros; la justificacion posterior a la respuesta puede racionalizar una respuesta incorrecta en lugar de corregirla.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se especifican; el entrenamiento se centro en problemas matematicos, por lo que el rendimiento fuera de ese dominio puede degradarse.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-4B.
- Caveats para produccion: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa; el ajuste se limita a 3 epocas de LoRA sobre un unico dataset (NuminaMath) y el formato de salida depende de que el prompt solicite explicitamente el esquema "respuesta primero, justificacion despues".
- El identificador arXiv:2605.06165 y la fecha de creacion (2026-11-18) corresponden a los metadatos publicados; conviene verificar la disponibilidad del paper y del repositorio antes de adoptar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richmondsin/Qwen3.5-4B-Post-Reasoning
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper: https://arxiv.org/abs/2605.06165
- Repositorio de codigo y evaluacion: https://github.com/richmondsin/Post-Reasoning
