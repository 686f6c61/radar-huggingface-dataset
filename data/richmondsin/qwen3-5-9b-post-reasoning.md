# richmondsin/Qwen3.5-9B-Post-Reasoning

## Resumen

Qwen3.5-9B-Post-Reasoning es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-9B, desarrollado por richmondsin y publicado bajo licencia Apache 2.0. El modelo aplica la tecnica "Post-Reasoning" descrita en el paper arXiv:2605.06165, que entrena al modelo para emitir primero la respuesta final y justificarla despues. Esto permite detener la generacion en el marcador de fin de respuesta y leer el resultado sin que se hayan consumido tokens de razonamiento previos.

El modelo conserva la arquitectura y el tamano del base: 9.409.813.744 parametros en formato safetensors (bf16), con capacidad image-text-to-text segun los tags del repositorio. El ajuste se realizo mediante LoRA (r 16, alpha 32, dropout 0.05) sobre problemas de NuminaMath con justificaciones autodestiladas, y posteriormente se fusiono en los pesos base.

Su relevancia radica en que propone una alternativa de bajo coste a los modelos con modo "thinking": en lugar de generar cadenas de razonamiento antes de responder, el modelo responde directamente y justifica a continuacion, lo que reduce la latencia y el numero de tokens generados en tareas de matematicas y razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; cuantizaciones GGUF/AWQ no indicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer de ~9.4 mil millones de parametros. El ajuste fino se realizo con LoRA de rango 16, alpha 32 y dropout 0.05, con learning rate 2e-5, 3 epocas y schedule coseno, tras lo cual la adaptacion se fusiono en los pesos base en bf16 (checkpoint local `Qwen35-9B-numina-Reflection-Merged-v4`).

Los datos de entrenamiento son problemas de NuminaMath acompanados de justificaciones posteriores a la respuesta generadas por autodestilacion (fichero `post_reflective_data/qwen35_9b_numina_v4.json`). La innovacion clave es el enmascaramiento de la loss tanto en el prompt como en la respuesta: el modelo solo aprende a producir la justificacion que sigue a la respuesta, de modo que la respuesta final se emite primero y puede leerse (y detener la generacion) en el marcador de fin de respuesta. No se indica en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones.
- Razonamiento matematico con formato "respuesta primero, justificacion despues".
- Capacidad image-text-to-text segun los tags del repositorio (no documentada en la model card).
- Detencion temprana de generacion mediante marcadores de fin de respuesta (por ejemplo `stop=["Explanation"]`), lo que permite obtener solo la respuesta.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no; el diseno es precisamente el opuesto (post-reasoning sin tokens de razonamiento previos).

## Casos de uso

- Resolucion de problemas matematicos con justificacion: el modelo responde primero y explica despues, lo que permite integrarlo en pipelines que solo necesitan la respuesta y descartan la justificacion deteniendo la generacion en el marcador.
- Evaluacion comparativa de tecnicas de razonamiento: util para reproducir los experimentos del paper Post-Reasoning y comparar latencia y precision frente a modelos con modo thinking.
- Sistemas de respuesta de baja latencia: al no generar tokens de razonamiento antes de la respuesta, reduce el numero de tokens necesarios para obtener el resultado final en consultas de tipo matematico.
- Generacion de explicaciones auditables: la justificacion posterior sirve como traza verificable de como se obtuvo la respuesta, util en entornos educativos o de verificacion.
- Fine-tuning adicional sobre dominios especificos: al estar bajo Apache 2.0 y en safetensors, puede servir como punto de partida para SFT con LoRA en otros conjuntos de datos.
- Despliegue en infraestructura propia con vLLM: la model card incluye ejemplo de uso con vLLM y `llm.chat`, adecuado para servir el modelo en entornos con GPU propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18-19 GB solo para pesos (9.409.813.744 parametros x 2 bytes), mas overhead de KV cache y activaciones.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-11 GB (estimacion a partir del numero de parametros; no confirmada por el autor).
- VRAM estimada en cuantizacion de 4 bits: en torno a 6-7 GB (estimacion a partir del numero de parametros; no confirmada por el autor).
- GPU recomendadas: A100 40/80 GB, H100 para servicio de alta concurrencia; en consumer, RTX 4090 (24 GB) permite bf16 ajustado o cuantizaciones de 8/4 bits.
- Cabe en GPU consumer: si, en RTX 4090 con bf16 (ajustado) y con mas margen en cuantizaciones de 8 o 4 bits; en GPUs de 12-16 GB probablemente solo en 4 bits (estimacion).
- Opciones de despliegue: vLLM (documentado en la model card); llama.cpp, Ollama o TGI no estan confirmados por el autor y requeririan conversion a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque de razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Post-Reasoning | 9.409.813.744 | no disponible | Post-reasoning (respuesta primero, justificacion despues) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | ~9.4 B (no confirmado en la informacion) | no disponible | Modelo base sin ajuste post-reasoning | Apache 2.0 (segun tag del modelo derivado) | Hugging Face |
| Modelos con modo thinking de la misma familia | no disponible | no disponible | Razonamiento previo a la respuesta | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- El ajuste se entreno exclusivamente con problemas de NuminaMath y justificaciones autodestiladas; el comportamiento fuera de dominios matematicos o de razonamiento no esta documentado.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad de las justificaciones; la justificacion posterior podria no reflejar el proceso real de derivacion de la respuesta.
- Idiomas soportados no declarados; el rendimiento multilingue es desconocido.
- Longitud de contexto no especificada en la informacion disponible.
- No se documentan capacidades de tool calling ni de agentes; no deben asumirse.
- La capacidad image-text-to-text aparece solo en los tags del repositorio y no esta descrita en la model card; conviene verificarla antes de usarla en produccion.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base y debe respetarse cualquier termino adicional de Qwen/Qwen3.5-9B.
- El modelo tiene un numero muy bajo de descargas (297) y 0 likes en el momento de la consulta; no hay evidencia de validacion independiente.
- El uso de detencion temprana con `stop=["Explanation"]` depende de que el modelo respete el formato; pueden aparecer variaciones en la salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richmondsin/Qwen3.5-9B-Post-Reasoning
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper: https://arxiv.org/abs/2605.06165
- Repositorio de codigo y evaluacion: https://github.com/richmondsin/Post-Reasoning
