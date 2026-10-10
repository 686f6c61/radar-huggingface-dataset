# saidutta69/LFM2.5-1.2B-Instruct-heretic

## Resumen

LFM2.5-1.2B-Instruct-heretic es una variante descensurada (abliterated) del modelo instructivo LiquidAI/LFM2.5-1.2B-Instruct, publicada por el usuario saidutta69. El modelo original pertenece a la familia LFM2.5 de Liquid AI, disenada especificamente para despliegue en el dispositivo (on-device) y entornos edge. Esta version concreta se ha generado aplicando la herramienta Heretic v1.4.0, que elimina selectivamente la direccion de rechazo del modelo original mediante modificaciones en las proyecciones de atencion (attn.o_proj) y en las proyecciones de bajada del MLP (mlp.down_proj).

Se trata de un transformer hibrido de 1.170.340.608 parametros (aproximadamente 1,17B) con 16 capas, de las cuales 10 son bloques de convolucion con doble puerta (double-gated convolution) y 6 son bloques de atencion con consultas agrupadas (GQA). El modelo dispone de una ventana de contexto de 32.768 tokens y un vocabulario de 65.536 entradas, y fue entrenado con un presupuesto de 28 billones de tokens (28T). Esta pensado para tareas agenticas, extraccion de datos y RAG, no para tareas intensivas en conocimiento ni programacion.

La relevancia de esta ficha radica en que combina dos factores: por un lado, la eficiencia de un modelo de 1,2B optimizado para CPU y NPU (239 tok/s de decodificacion en CPU AMD y 82 tok/s en NPU movil, con menos de 1 GB de memoria en el modelo original); por otro, el proceso de abliteration, que reduce los rechazos del 98/100 del modelo original a 2/100, a costa de una divergencia KL de 0,0657 respecto al checkpoint de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 16 capas (10 bloques de convolucion con doble puerta + 6 bloques GQA) |
| Parametros totales | 1.170.340.608 (aprox. 1,17B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible en esta ficha (el modelo original ofrece GGUF, ONNX y MLX 8-bit en repos separados) |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, japones, coreano y espanol |
| Licencia | lfm1.0 (etiquetada como "other" en HuggingFace) |
| Formato de pesos | Safetensors (libreria transformers) |
| Parametros de generacion | temperature 0,1 / top_k 50 / repetition_penalty 1,05 |
| Vocabulario | 65.536 tokens |
| Corte de conocimiento | Mediados de 2024 |
| Modelo base | LiquidAI/LFM2.5-1.2B-Base |
| Herramienta de abliteration | Heretic v1.4.0 |
| Tamano del repositorio | 2,3 GB |

## Arquitectura y entrenamiento

LFM2.5 es una familia de modelos hibridos que combina bloques de convolucion con doble puerta y bloques de atencion con consultas agrupadas (GQA), una arquitectura disenada para reducir el coste computacional en inferencia respecto a un transformer puramente atencional. El modelo contiene 16 capas en total, de las cuales 10 son convolucionales y 6 de atencion. El entrenamiento incluye un preentrenamiento extendido desde los 10T hasta los 28T tokens y una fase de aprendizaje por refuerzo (RL) multi-etapa a gran escala. El checkpoint instructivo se obtuvo tras esa fase de RL sobre el modelo base.

Sobre el checkpoint instructivo original, el autor de esta ficha aplico Heretic v1.4.0 para llevar a cabo la abliteration. El proceso modifica pesos concretos en `attn.o_proj` y `mlp.down_proj` con parametros como `direction_index` = 10,60, `attn.o_proj.max_weight` = 1,42 en posicion 9,08 y `mlp.down_proj.max_weight` = 1,25 en posicion 12,88. El resultado es una divergencia KL de 0,0657 respecto al modelo original y una reduccion de rechazos de 98/100 a 2/100, segun los datos aportados por el autor. El proceso se documenta como reproducible mediante el directorio `reproduce/` del repositorio.

## Capacidades

- Generacion de texto conversacional multi-turno en ocho idiomas: ingles, arabe, chino, frances, aleman, japones, coreano y espanol.
- Tareas agenticas y de razonamiento multi-paso, segun la recomendacion explicita de Liquid AI para el modelo original.
- Extraccion de datos estructurados a partir de texto.
- Recuperacion aumentada por generacion (RAG), gracias a la ventana de contexto de 32.768 tokens.
- Formato de chat tipo ChatML, compatible con `tokenizer.apply_chat_template()` de Transformers.
- Capacidad de decodificacion especulativa mediante el drafter LFM2.5-1.2B-Instruct-DSpark (296M), con una mejora aproximada de 2,1x en velocidad de decodificacion con salidas identicas.
- No se documenta soporte explicito de tool calling / function calling en la informacion proporcionada.
- No se documenta vision, audio ni modo de razonamiento explicito en esta variante concreta (existen variantes VL, Audio y Thinking en la familia).
- Reduccion significativa de rechazos respecto al modelo original (2/100 frente a 98/100), que amplia el rango de peticiones que el modelo esta dispuesto a responder.

## Casos de uso

- Extraccion de datos estructurados: el modelo esta recomendado explicitamente para esta tarea y su contexto de 32.768 tokens permite procesar documentos largos y devolver campos estructurados en una sola llamada.
- Pipelines RAG de dominio especifico: la ventana de contexto admite concatenar varios fragmentos recuperados junto con la pregunta, y el modelo esta optimizado para esta tarea segun Liquid AI.
- Flujos agenticos ligeros: la recomendacion del fabricante incluye tareas agenticas, por lo que puede emplearse como componente de decision en bucles multi-paso de bajo coste.
- Despliegue en dispositivos edge y moviles: al ejecutarse en menos de 1 GB de memoria y alcanzar 82 tok/s en NPU movil, es adecuado para asistentes locales en telefonos o dispositivos embebidos.
- Atencion al cliente automatizada de baja latencia: las cifras de 239 tok/s en CPU AMD permiten respuestas casi instantaneas en entornos sin GPU.
- Generacion de contenido sin restricciones tematicas: al haberse reducido los rechazos a 2/100, es utilizable en escenarios creativos o de investigacion donde el modelo original declinaba responder.
- Procesamiento por lotes en CPU en servidores sin acelerador: la arquitectura hibrida y el tamano reducido permiten ejecutar el modelo en hardware commodity.
- Traduccion y generacion multilingue entre los ocho idiomas soportados.

## Benchmarks y rendimiento

Los unicos datos de rendimiento aportados en la informacion disponible son los relativos al proceso de abliteration, no a benchmarks estandar (MMLU, HumanEval, GSM8K, etc.):

| Metrica | Este modelo | Modelo original (LFM2.5-1.2B-Instruct) |
|---|---|---|
| Divergencia KL | 0,0657 | 0 (por definicion) |
| Rechazos | 2/100 | 98/100 |

Ademas, el modelo original reporta las siguientes cifras de velocidad de inferencia, que sirven como referencia indirecta para esta variante: 239 tok/s de decodificacion en CPU AMD y 82 tok/s en NPU movil, con un consumo de memoria inferior a 1 GB.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- El modelo original se ejecuta por debajo de 1 GB de memoria en configuraciones cuantizadas; esta variante en safetensors ocupa aproximadamente 2,3 GB en precision de 16 bits, coherente con sus 1,17B parametros.
- Estimacion orientativa de VRAM/RAM para inferencia: aproximadamente 2,3 GB en FP16, en torno a 1,2 GB en cuantizacion de 8 bits y alrededor de 0,7 GB en 4 bits. Estas cifras son estimaciones derivadas del numero de parametros y del dato de "menos de 1 GB" reportado para el modelo original.
- Cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o RTX 4090, e incluso en iGPU y NPU moviles.
- En GPUs de centro de datos (A100, H100) el modelo es muy pequeno y quedaria limitado por el ancho de banda y el coste de lanzamiento de kernels mas que por la memoria.
- Opciones de despliegue soportadas por la familia: llama.cpp, MLX y vLLM con soporte desde el primer dia; el formato safetensors de esta ficha es compatible con Transformers y vLLM.
- Formatos alternativos del modelo original disponibles en repos separados: GGUF (llama.cpp y herramientas compatibles), ONNX Runtime (despliegue multiplataforma) y MLX 8-bit (Apple Silicon).
- Latencia y throughput: no se han publicado cifras especificas para esta variante descensurada; las del modelo original son 239 tok/s en CPU AMD y 82 tok/s en NPU movil.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Instruct-heretic (esta ficha) | 1,17B | 32.768 | 2/100 | lfm1.0 | Safetensors en HuggingFace |
| LiquidAI/LFM2.5-1.2B-Instruct | 1,17B | 32.768 | 98/100 | lfm1.0 | Safetensors, GGUF, ONNX, MLX |
| LiquidAI/LFM2.5-1.2B-Thinking | 1,2B | No disponible | No disponible | lfm1.0 | HuggingFace |
| LiquidAI/LFM2.5-1.2B-Base | 1,2B | No disponible | No disponible | lfm1.0 | HuggingFace |

El modelo comparable mas directo es el Instruct original, del que esta variante deriva y con el que comparte arquitectura, parametros y contexto. La diferencia principal es la tasa de rechazos y la divergencia KL introducida por la abliteration. Las variantes Thinking y Base de la misma familia comparten el mismo presupuesto de parametros, pero no se dispone de datos de contexto ni de rechazos en la informacion proporcionada.

No se dispone de datos de benchmarks estandar para comparar con modelos de otros fabricantes de tamano similar.

## Limitaciones y advertencias

- El proceso de abliteration introduce una divergencia KL de 0,0657 respecto al modelo original, lo que implica un cambio medible en la distribucion de salida que puede degradar la coherencia en algunas tareas.
- La reduccion de rechazos a 2/100 implica que el modelo puede generar contenido que el original declinaba; el responsable del despliegue debe implementar sus propias salvaguardas si el caso de uso lo requiere.
- Liquid AI no recomienda el modelo base para tareas intensivas en conocimiento ni para programacion; estas limitaciones se heredan.
- El corte de conocimiento es de mediados de 2024, por lo que no dispone de informacion posterior.
- Riesgo de alucinacion inherente a un modelo de 1,2B, especialmente en dominios especializados.
- La licencia lfm1.0 esta etiquetada como "other" en HuggingFace; es necesario revisar los terminos exactos del archivo LICENSE antes de un uso comercial.
- El modelo tiene 0 descargas y 0 "likes" en el momento de la ficha, y fue publicado por un autor no oficial (saidutta69), no por Liquid AI; no existe validacion por parte del fabricante original.
- La informacion no confirma soporte explicito de tool calling, function calling ni modo de razonamiento, a diferencia de otras variantes de la familia.
- El soporte multilingue esta declarado para ocho idiomas, pero no se aportan metricas de calidad por idioma; el rendimiento fuera del ingles puede ser desigual.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/saidutta69/LFM2.5-1.2B-Instruct-heretic
- Modelo original: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Base
- Herramienta Heretic: https://heretic-project.org
- Blog de presentacion de LFM2.5: https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground de Liquid AI: https://playground.liquid.ai/
- LEAP (plataforma de Liquid AI): https://leap.liquid.ai/
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- Paper (arXiv): https://arxiv.org/abs/2511.23404
- Variante GGUF: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF
- Variante ONNX: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-ONNX
- Variante MLX 8-bit: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-MLX-8bit
- Drafter de decodificacion especulativa DSpark: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct-DSpark
- Documentacion del chat template: https://docs.liquid.ai/lfm/key-concepts/chat-template
- Variante Thinking: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- Variante JP: https://huggingface.co/LiquidAI/LFM2.5-1.2B-JP
- Variante VL: https://huggingface.co/LiquidAI/LFM2.5-VL-1.6B
- Variante Audio: https://huggingface.co/LiquidAI/LFM2.5-Audio-1.5B
