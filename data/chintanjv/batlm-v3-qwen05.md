# chintanjv/BatLM-v3-qwen05

## Resumen

BatLM-v3-qwen05 es un ajuste fino de tipo LoRA del modelo SmolLM2-360M-Instruct, desarrollado por el usuario chintanjv como proyecto educativo y de demostración. Su propósito es responder preguntas sobre el universo de Batman a partir de pasajes recuperados mediante RAG (Retrieval-Augmented Generation), y está diseñado específicamente para ejecutarse en el navegador mediante transformers.js, ONNX y WebGPU. No es un modelo de propósito general: es un artefacto especializado que solo funciona correctamente cuando el prompt incluye los pasajes recuperados.

El modelo parte de una base de 360 millones de parámetros y se ha afinado con LoRA (r=16, todas las capas lineales, 2 épocas) sobre un corpus de aproximadamente 2.000 preguntas generadas a partir de 286 hechos verificados y las frases iniciales de 333 páginas de Wikipedia. El resultado se distribuye en formato ONNX cuantizado (q4f16 para WebGPU, q4 para CPU/WASM), con un tamaño de repositorio de 1,6 GB.

Su relevancia es fundamentalmente didáctica y técnica: demuestra un pipeline completo de RAG en el navegador con un modelo tiny-LLM, cuantización mixta 4/8 bits y evaluación rigurosa sobre un conjunto de 161 preguntas retenidas, con una tasa de acierto del 95,7%. No está pensado para producción general ni para uso comercial sin atender a las restricciones de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, base SmolLM2-360M-Instruct) |
| Parametros totales | 360M (aproximado, heredado de SmolLM2-360M-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX q4f16 (WebGPU, 347 MB), ONNX q4 (CPU/WASM); cuantizacion k-quant con block size 16, matrices de atencion, matriz de salida de cada MLP y LM head en 8 bits, resto de matrices MLP en 4 bits |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors y ONNX (model_q4f16.onnx, model_q4.onnx) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en SmolLM2-360M-Instruct (arquitectura Qwen2), afinado mediante LoRA con rango 16 aplicado a todas las capas lineales durante 2 épocas, y posteriormente fusionado con los pesos base. El corpus de entrenamiento se compone de aproximadamente 2.000 preguntas generadas a partir de 286 hechos escritos y verificados contra fuentes, más las frases iniciales de 333 páginas de Wikipedia. Cada prompt de entrenamiento incluye los tres pasajes que el propio sistema de búsqueda del proyecto devuelve para esa pregunta, de modo que el modelo aprende a responder condicionado a contexto recuperado.

La innovación técnica principal no está en la arquitectura sino en el pipeline de despliegue: cuantización mixta mediante onnxruntime-genai builder (atención, salida de MLP y LM head en 8 bits; resto de MLP en 4 bits), con dos variantes optimizadas para WebGPU y para CPU/WASM. El prompt sigue el formato ChatML con etiquetas `<|im_start|>` y `<|im_end|>`, y la decodificación recomendada es greedy con parada en `<|im_end|>`. No se menciona uso de RLHF ni DPO en la información disponible.

## Capacidades

- Generación de texto breve y directo (una o dos frases, o listas numeradas cortas) condicionada a pasajes recuperados.
- Respuesta fundamentada en contexto (RAG): responde exclusivamente a partir de los CASE FILES incluidos en el prompt.
- Capacidad de declinar: responde que no puede contestar cuando los pasajes no contienen la respuesta o cuando la pregunta está fuera de tema.
- Especialización temática en el universo de Batman (personajes, tramas, publicaciones).
- Ejecución en navegador mediante transformers.js, ONNX Runtime Web y WebGPU.
- No soporta tool calling ni function calling (no disponible en la información).
- No soporta agentes ni razonamiento multi-paso (el propio autor indica que no sigue conversaciones y que las preguntas compuestas suelen quedar respondidas a medias).
- Capacidades multilingües limitadas al inglés.
- Sin modo thinking, visión ni audio.

## Casos de uso

- Demostración educativa de RAG en el navegador: el modelo sirve como ejemplo completo de pipeline retrieval + generación ejecutándose íntegramente en el cliente con WebGPU, útil para cursos y tutoriales sobre LLMs tiny y despliegue web.
- Asistente temático de fans de Batman: integrado en una web con un índice de pasajes de Wikipedia y fichas de hechos, responde preguntas concretas sobre personajes y tramas citando el pasaje recuperado.
- Prototipado de chatbots con base documental cerrada: permite validar la mecánica de "responder solo con las fuentes" y de "declinar cuando no hay evidencia" antes de invertir en modelos mayores.
- Evaluación de estrategias de cuantización: las dos variantes (q4f16 y q4) y la comparación documentada entre 8 bits solo en atención (89,4%) y cuantización mixta (95,7%) permiten estudiar el impacto de la cuantización en la calidad de respuesta.
- Benchmark de latencia en cliente: al ejecutarse en Chrome headless con WebGPU, sirve para medir tiempos de inferencia de un modelo de 360M cuantizado en hardware de usuario final.
- Base para fine-tuning de dominio con LoRA: el enfoque (LoRA r=16 sobre SmolLM2-360M-Instruct con datos sintéticos condicionados a contexto) es replicable para otros dominios con corpus pequeño y verificado.

## Benchmarks y rendimiento

Evaluación sobre 161 preguntas retenidas, respondidas por `model_q4f16.onnx` en Chrome headless con WebGPU, usando el mismo código de búsqueda y prompt que el sitio web. Se considera correcta una respuesta que contiene todos los hechos requeridos, no incluye afirmaciones falsas listadas, no es un rechazo y termina antes del límite de tokens.

| Categoria | n | Correctas |
|---|---|---|
| Ejemplos obligatorios (must-pass) | 13 | 100% |
| Hechos entrenados, nueva formulación | 59 | 93,2% |
| Hechos nunca vistos en entrenamiento | 38 | 94,7% |
| Páginas de Wikipedia sin ficha de hechos | 18 | 94,4% |
| Preguntas de Batman que los pasajes no pueden responder (debe declinar) | 13 | 100% |
| Fuera de tema (debe declinar) | 20 | 100% |
| **Total** | **161** | **95,7%** |

El modelo en precisión completa obtiene el mismo 95,7%. Una variante con solo la atención en 8 bits (306 MB) obtiene 89,4%. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que el modelo se ejecuta en el navegador; el archivo WebGPU ocupa 347 MB y el de CPU/WASM es menor (tamaño exacto no disponible).
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU en Chrome para la variante q4f16; la variante q4 funciona en CPU mediante WASM.
- Cabe en GPU de consumo: sí, con amplio margen, dado el tamaño de 360M parámetros y la cuantización 4/8 bits.
- Opciones de despliegue: transformers.js con ONNX Runtime Web (WebGPU o WASM); el repositorio está etiquetado con `transformers.js` y `onnx`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Despliegue |
|---|---|---|---|---|---|
| BatLM-v3-qwen05 | 360M | no disponible | RAG temático Batman, fine-tune LoRA | CC BY-SA 4.0 | transformers.js / ONNX (WebGPU, WASM) |
| SmolLM2-360M-Instruct (base) | 360M | no disponible | LLM generalista de instrucciones | Apache 2.0 | transformers, llama.cpp, ONNX, etc. |
| SmolLM2-135M-Instruct | 135M | no disponible | LLM generalista tiny | Apache 2.0 | transformers, llama.cpp, ONNX, etc. |
| Qwen2-0.5B-Instruct | 500M | no disponible | LLM generalista multilingüe | Apache 2.0 | transformers, llama.cpp, vLLM, etc. |

La comparación relevante es con su modelo base: BatLM hereda el tamaño y la arquitectura de SmolLM2-360M-Instruct, pero sustituye la capacidad generalista por una especialización estrecha en un dominio y un formato de prompt concretos. Frente a alternativas generalistas del mismo orden de magnitud, BatLM no compite en cobertura ni en multilingüismo; su valor está en el pipeline RAG en navegador y en la evaluación específica de dominio.

## Limitaciones y advertencias

- Modelo de 360M parámetros: puede seleccionar una frase relacionada pero incorrecta cuando la pregunta tiene una formulación inusual.
- Dependencia total del contexto recuperado: sin los pasajes en el prompt, se comporta como SmolLM2 con tendencia a respuestas cortas; no es un modelo de conocimiento autónomo.
- No mantiene conversaciones multi-turno; las preguntas compuestas suelen recibir solo una respuesta parcial.
- Solo inglés; no hay soporte documentado para castellano ni otros idiomas.
- Riesgo de alucinación mitigado pero no eliminado: el autor recomienda verificar los pasajes citados.
- Licencia CC BY-SA 4.0: impone atribución y compartir bajo la misma licencia las obras derivadas; el corpus proviene de Wikipedia (CC BY-SA 4.0) y el modelo base es Apache 2.0. Revisar compatibilidad antes de uso comercial.
- Proyecto no oficial de fans: Batman es marca registrada de DC Comics; el proyecto no está afiliado a DC ni a Warner Bros.
- Sin datos publicados sobre sesgos específicos más allá de los inherentes al corpus de Wikipedia y al modelo base.
- Contexto máximo no documentado en la información disponible; conviene validar el comportamiento con prompts largos antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chintanjv/BatLM-v3-qwen05
- Demo: https://batlm.vercel.app
- Código fuente: https://github.com/chintanjv/BatLM
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
