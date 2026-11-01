# el4/Ornith-1.5-9B-DFlash-GGUF

## Resumen

Ornith-1.5-9B-DFlash-GGUF es un repositorio de cuantización GGUF que contiene el modelo borrador (draft) DFlash del proyecto Ornith-1.5, publicado por el usuario el4 a partir del checkpoint original de ornith-ai. No se trata de un modelo de lenguaje autónomo: su función es proponer bloques de tokens en paralelo mediante decodificación especulativa, que el modelo objetivo Ornith-1.5-9B verifica posteriormente, acelerando el throughput de inferencia sin alterar la distribución de salida del modelo principal.

Ornith-1.5-9B, el modelo objetivo, es un modelo denso de 9B parámetros orientado a razonamiento, entrenado mediante un bucle de auto-mejora end-to-end que genera tareas de entrenamiento, descubre estrategias de resolución y optimiza la política con aprendizaje por refuerzo. Se construyó sobre Qwen3.5 y Gemma4 con preentrenamiento continuado, mid-training y post-training adicionales.

Este repositorio es relevante para quien ya despliegue Ornith-1.5-9B y quiera mejorar la latencia de servido con DFlash en runtimes como vLLM o SGLang. El dato de safetensors del repositorio indica 1.291.904.512 parámetros, correspondientes al borrador ligero, no al modelo objetivo de 9B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo borrador block-diffusion para decodificacion especulativa (DFlash); no es un LM autonomo |
| Parametros totales | 1.291.904.512 (dato real de safetensors del checkpoint DFlash); el modelo objetivo Ornith-1.5-9B tiene 9B |
| Parametros activos | no disponible (el modelo objetivo es denso; el borrador no publica este dato) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no detalladas en la model card) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado desde safetensors de ornith-ai/Ornith-1.5-9B-DFlash) |

## Arquitectura y entrenamiento

El checkpoint DFlash emplea una arquitectura de difusion por bloques (block-diffusion) ligera que propone multiples tokens en paralelo durante la decodificacion especulativa. El modelo objetivo, Ornith-1.5-9B, verifica esas propuestas token a token, lo que garantiza que la salida final sea identica a la que produciria el modelo objetivo ejecutandose solo. Esta separacion de roles (borrador rapido + verificador preciso) es la tecnica clasica de speculative decoding, adaptada aqui a un borrador de tipo difusion.

Respecto al entrenamiento del ecosistema Ornith-1.5: el modelo objetivo extiende Ornith-1.0 (desarrollado sobre Qwen3.5 y Gemma4) con preentrenamiento continuado, mid-training y post-training, y amplia el bucle de auto-mejora para optimizar conjuntamente la generacion de tareas, la construccion de scaffolds y los rollouts de solucion mediante aprendizaje por refuerzo. Los detalles del entrenamiento especifico del borrador DFlash (numero de tokens, dataset, destilacion desde el modelo objetivo) no estan disponibles en la informacion proporcionada.

## Capacidades

Capacidades del checkpoint DFlash en si:

- Generacion especulativa de bloques de tokens en paralelo para acelerar la inferencia de Ornith-1.5-9B.
- Preservacion exacta de la distribucion de salida del modelo objetivo (verificacion por parte del target).
- Integracion con runtimes de servido con soporte DFlash (vLLM >= 0.20.2, probado con 0.28.0; SGLang 0.5.18).

Capacidades del modelo objetivo que este borrador acelera (segun la model card):

- Razonamiento con cadena de pensamiento: emite por defecto un bloque `<think> ... </think>` antes de la respuesta final.
- Tool calling: genera bloques `<tool_call>` que los parsers de vLLM/SGLang exponen como `tool_calls` estilo OpenAI.
- Generacion de codigo y tareas generales (se recomiendan parametros de muestreo distintos para cada caso).
- Despliegue en GPU unica y, en su variante cuantizada Ornith-1.5-9B-Mobile, en dispositivos moviles.

## Casos de uso

- Servido de alta latencia reducida de Ornith-1.5-9B: al cargar el borrador junto al modelo objetivo en vLLM o SGLang, se aumenta el throughput de decodificacion sin cambiar la calidad de las respuestas, util en endpoints con muchas peticiones concurrentes.
- Chatbot con razonamiento visible: el modelo objetivo abre cada turno con un bloque de razonamiento separado en el campo `reasoning_content`, adecuado para asistentes que deben mostrar su cadena de pensamiento al usuario o a un sistema de auditoria.
- Agentes con llamadas a herramientas: el soporte de `<tool_call>` con parser a formato OpenAI permite integrar el modelo en bucles de agente (function calling multi-paso) beneficiandose de la aceleracion DFlash en cada paso.
- Generacion de codigo precisa: con los parametros de muestreo recomendados para codigo (temperature=0.6, top_p=0.95, top_k=20), puede integrarse en pipelines de asistencia o revision de codigo.
- Despliegue en GPU unica: al ser el modelo objetivo denso de 9B pensado para una sola GPU, este par borrador-target encaja en servidores de inferencia de coste contenido.
- Experimentacion con decodificacion especulativa por difusion: el repositorio sirve como caso de estudio para equipos que investiguen draft models de tipo block-diffusion y su integracion en stacks de servido modernos.

## Benchmarks y rendimiento

La model card incluye una imagen con resultados de evaluacion de Ornith-1.5-9B (`ornith_9b_eval.png`), pero no proporciona los valores numericos en texto, por lo que no es posible reproducirlos aqui de forma fiable.

Para la aceleracion DFlash: no se han publicado cifras concretas de speedup (aceptacion media, tokens/segundo) en la informacion disponible. La model card indica unicamente que el objetivo es mejorar el throughput de decodificacion preservando la distribucion del modelo objetivo.

No se han publicado resultados de benchmarks comparables en la informacion disponible.

## Requisitos de hardware

- VRAM para el borrador GGUF: el repositorio pesa 5,0 GB en total; en funcion de la cuantizacion GGUF elegida, el borrador deberia caber comodamente en GPUs de gama media o incluso en CPU/RAM compartida, aunque la cifra exacta por cuantizacion no esta disponible.
- VRAM para el conjunto completo: hay que sumar la del modelo objetivo Ornith-1.5-9B (denso, 9B parametros; aproximadamente 18 GB en FP16/BF16, sin contar KV cache), mas el borrador. No se publica una cifra oficial.
- GPU recomendadas: no disponible explicitamente; por el tamano del target, una GPU unica de 24 GB (RTX 3090/4090) o superior (A100, H100) es un punto de partida razonable para el par completo en BF16.
- Cabe en GPU de consumo: el borrador por si solo, si; el par completo en BF16 probablemente requiera una GPU de 24 GB o cuantizacion del modelo objetivo (no incluida en este repositorio).
- Despliegue: vLLM >= 0.20.2 (probado con 0.28.0) y SGLang 0.5.18 con soporte DFlash; se requieren ademas Transformers >= 5.8.1. No se menciona soporte para llama.cpp u Ollama pese al formato GGUF.
- Latencia y throughput: no disponible; la model card solo afirma una mejora de throughput respecto al servido sin DFlash.

## Comparativa con modelos similares

| Aspecto | Ornith-1.5-9B-DFlash (borrador) | Draft models EAGLE tipicos | Draft models Medusa tipicos |
|---|---|---|---|
| Rol | Borrador block-diffusion para Ornith-1.5-9B | Borrador especulativo sobre capa de embedding/hidden states | Cabezas de decodificacion multiple |
| Parametros | ~1,29B (dato del repo) | Tipicamente 0,5-1B (variable) | Despreciables (cabezas adicionales) |
| Tipo de propuesta | Bloques de tokens en paralelo (difusion) | Tokens autoregresivos encadenados | Multiples tokens por paso |
| Licencia | MIT | Variable segun proyecto | Variable segun proyecto |
| Runtimes soportados | vLLM >= 0.20.2, SGLang 0.5.18 | vLLM, SGLang, otros | vLLM, otros |

No hay alternativas publicas directamente equivalentes (borradores DFlash para el mismo target) en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje autonomo: cargarlo solo no produce texto util; debe ejecutarse siempre junto a Ornith-1.5-9B como verificador.
- Versiones de runtime estrictas: el servido con DFlash requiere vLLM >= 0.20.2 (probado con 0.28.0), SGLang exactamente 0.5.18 y Transformers >= 5.8.1; versiones distintas pueden fallar.
- Formato GGUF sin soporte documentado de llama.cpp/Ollama: pese a ser GGUF, la model card solo documenta vLLM y SGLang; verificar compatibilidad antes de asumir uso con otros backends.
- Riesgo de alucinacion: no se documentan evaluaciones de alucinacion; al ser el borrador solo un acelerador, la calidad depende del modelo objetivo Ornith-1.5-9B, del que no se publican benchmarks numericos en texto.
- Sesgos: no disponibles; al derivar de Qwen3.5 y Gemma4 con RL, hereda potencialmente los sesgos de sus modelos base.
- Idiomas y longitud de contexto: no disponibles; evaluar antes de usar en entornos multilingues o con documentos largos.
- Licencia MIT: permite uso comercial sin restricciones relevantes, pero conviene revisar las licencias de los modelos base (Qwen3.5, Gemma4) para el modelo objetivo.
- El modelo objetivo es un reasoning model que genera bloques `<think>`: en produccion hay que configurar el reasoning parser para no exponer la cadena de pensamiento al usuario final involuntariamente.

## Enlaces

- Repositorio GGUF del borrador: https://huggingface.co/el4/Ornith-1.5-9B-DFlash-GGUF
- Checkpoint DFlash original: ornith-ai/Ornith-1.5-9B-DFlash (en HuggingFace)
- Modelo objetivo: ornith-ai/Ornith-1.5-9B (en HuggingFace)
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
