# Shayannasiri/MedFrame-R1-4B

## Resumen

MedFrame-R1-4B es un modelo multimodal de razonamiento medico desarrollado por Shayannasiri, obtenido mediante ajuste fino del modelo Qwen/Qwen3-VL-4B-Instruct. El modelo parte de una arquitectura Qwen3-VL (transformer multimodal con vision encoder y decoder de lenguaje) y ha sido entrenado con el framework MedFrame-R1, que combina un arranque en frio supervisado con aprendizaje por refuerzo (DAPO con recompensa de juez condicionada por embeddings) durante 200 pasos. El objetivo es mejorar la fiabilidad del razonamiento en tareas medicas que combinan imagen y texto, como VQA medica y QA clinico.

El modelo maneja tanto entradas de imagen como de texto y genera una traza de razonamiento explicita antes de la respuesta final, lo que resulta relevante para aplicaciones donde la interpretabilidad del proceso diagnostico es importante. Cuenta con aproximadamente 4.830 millones de parametros (4.826.771.968 segun los pesos en safetensors) y un repositorio de 9,7 GB.

Su relevancia actual radica en que aplica tecnicas de RL con recompensas verificables (judge reward) al dominio medico multimodal sobre una base relativamente pequena (4B), buscando un equilibrio entre capacidad de razonamiento y coste de despliegue. La licencia Apache 2.0 facilita su uso y adaptacion, aunque el autor restringe explicitamente el uso previsto a investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL: vision encoder + decoder de lenguaje) |
| Parametros totales | 4.826.771.968 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no indicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MedFrame-R1-4B se construye sobre Qwen3-VL-4B-Instruct, un modelo multimodal que procesa entradas de imagen y texto y genera texto. El ajuste se realiza en dos fases: un arranque en frio supervisado (supervised cold start) seguido de aprendizaje por refuerzo durante 200 pasos, empleando el algoritmo DAPO con una recompensa basada en un juez condicionado por embeddings (embedding-gated judge reward). Este esquema de RL busca mejorar la calidad y fiabilidad de las cadenas de razonamiento en el dominio medico.

Los datos de entrenamiento provienen de MBZUAI/medix-rl-data (51.335 muestras) y las trazas de razonamiento se publican en el dataset Shayannasiri/MedFrame-R1-CoT. El modelo escribe su razonamiento antes de la respuesta final. No se dispone de informacion detallada sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni la configuracion del vision encoder.

## Capacidades

- Generacion de texto y razonamiento multimodal: responde preguntas sobre imagenes medicas (por ejemplo, radiografias) combinando vision y lenguaje.
- Razonamiento explicito: produce una traza de razonamiento antes de la respuesta final.
- VQA medica: responde preguntas visuales sobre imagenes clinicas.
- QA medico basado en texto: responde preguntas clinicas en formato texto.
- Conversacion multi-turno: formato de chat mediante plantillas de conversacion (apply_chat_template).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: si, el modelo escribe su razonamiento antes de la respuesta.

## Casos de uso

- Investigacion en razonamiento medico multimodal: el modelo sirve como base para estudiar tecnicas de RL (DAPO con judge reward) aplicadas a MLLMs en el dominio clinico, comparando trazas de razonamiento con las del dataset MedFrame-R1-CoT.
- Evaluacion de VQA medica: uso en pipelines de investigacion que miden la precision del modelo sobre benchmarks de preguntas visuales medicas, aprovechando su capacidad de procesar imagen y texto conjuntamente.
- Analisis de imagenes radiologicas en entornos de investigacion: responder preguntas como la deteccion de neumotorax sobre imagenes, tal y como muestra el ejemplo de uso de la model card, siempre con fines de investigacion.
- Generacion de explicaciones clinicas asistidas: el modelo produce una cadena de razonamiento antes de la respuesta, util para estudiar la interpretabilidad de las decisiones en tareas de QA medico.
- Prototipado de asistentes de documentacion clinica: integracion en entornos de investigacion para generar respuestas razonadas a partir de texto e imagenes medicas.
- Benchmarking de modelos multimodales pequenos: con ~4,8B de parametros, sirve como referencia para comparar el efecto del RL en la precision sobre 17 benchmarks medicos (VQA y QA).

## Benchmarks y rendimiento

La model card menciona resultados de precision (%) sobre 17 benchmarks medicos (19.200 items), evaluados con reglas deterministas y un panel de tres jueces, con medias para VQA (6 benchmarks de imagen), QA (11 de texto), Macro (media sobre los 17) y Micro (agregado sobre todas las muestras). Sin embargo, los valores numericos concretos no se incluyen en la informacion proporcionada (la model card los presenta en una imagen, `results.png`).

No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 4,83B de parametros, una estimacion orientativa en fp16 seria de aproximadamente 9,7 GB de pesos, mas overhead de activaciones y del vision encoder; en cuantizacion de 8 bits rondaria los 5 GB y en 4 bits los 2,5-3 GB. Estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la informacion; por tamano, seria plausible en GPUs consumer con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: transformers (AutoModelForImageTextToText y AutoProcessor, segun el ejemplo de la model card). Soporte de vLLM, llama.cpp, Ollama o TGI no disponible en la informacion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| MedFrame-R1-4B | 4,83B | no disponible | imagen-texto | Apache 2.0 | Ajuste RL sobre Qwen3-VL-4B-Instruct; resultados en 17 benchmarks medicos sin valores publicados en texto |
| Qwen/Qwen3-VL-4B-Instruct (base) | ~4B | no disponible | imagen-texto | no disponible en esta ficha | Modelo base sobre el que se entrena MedFrame-R1-4B |
| Alternativas medicas multimodales de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Uso previsto exclusivamente para investigacion: el autor indica explicitamente que no debe usarse para toma de decisiones clinicas.
- Riesgo de alucinacion: como modelo generativo, puede producir respuestas o razonamientos incorrectos, especialmente en contextos clinicos de alta responsabilidad.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se especifican.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor restringe el uso previsto a investigacion; conviene revisar la model card antes de cualquier despliegue en produccion.
- Validacion insuficiente: el modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, y el paper esta pendiente de publicacion ("Paper coming soon"), por lo que la validacion externa es limitada.
- Datos de benchmarks no verificables en texto: los resultados se presentan en una imagen, lo que dificulta su comprobacion y comparacion directa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shayannasiri/MedFrame-R1-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/MBZUAI/medix-rl-data
- Dataset de trazas de razonamiento: https://huggingface.co/datasets/Shayannasiri/MedFrame-R1-CoT
