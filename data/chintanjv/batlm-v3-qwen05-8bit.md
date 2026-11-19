# chintanjv/BatLM-v3-qwen05-8bit

## Resumen

BatLM-v3-qwen05-8bit es un ajuste fino (fine-tune) del modelo SmolLM2-360M-Instruct de HuggingFaceTB, desarrollado por el usuario chintanjv como proyecto educativo y de demostración. Su propósito es responder preguntas sobre el universo de Batman utilizando exclusivamente pasajes recuperados mediante un sistema de generación aumentada por recuperación (RAG). El modelo está diseñado para ejecutarse íntegramente en el navegador mediante transformers.js, ONNX y WebGPU, lo que lo convierte en una pieza interesante para estudiar despliegues de LLM en el cliente.

El modelo parte de una arquitectura transformer de 360 millones de parámetros con una ventana de contexto heredada de SmolLM2. El ajuste se realizó con LoRA (r=16 sobre todas las capas lineales) durante 2 épocas y posteriormente se fusionó en los pesos base. El resultado se distribuye en formato ONNX cuantizado, con variantes de 4 y 8 bits según el hardware objetivo.

La relevancia de este modelo es fundamentalmente pedagógica: demuestra cómo un modelo pequeño, con un corpus muy acotado y un pipeline RAG bien diseñado, puede alcanzar una precisión del 95,7% en su dominio restringido. No obstante, su utilidad generalista es prácticamente nula, ya que sin el contexto recuperado se comporta como SmolLM2 con tendencia a respuestas cortas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, heredada de SmolLM2-360M-Instruct) |
| Parametros totales | 360 millones (aproximado, heredado del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de SmolLM2-360M-Instruct, no especificada en la model card) |
| Tipos de cuantizacion | ONNX k-quant con block size 16: matrices de atención, matriz de salida de cada MLP y LM head en 8 bits; resto de matrices MLP en 4 bits. Variantes: `model_q4f16.onnx` (WebGPU, 347 MB) y `model_q4.onnx` (CPU/WASM) |
| Idiomas soportados | Inglés (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX, safetensors (repo incluye ambos según tags) |

## Arquitectura y entrenamiento

El modelo se basa en SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parámetros. Sobre esta base se aplicó un ajuste fino con LoRA de rango 16 sobre todas las capas lineales, durante 2 épocas, y posteriormente se fusionaron los adaptadores en los pesos del modelo. La arquitectura subyacente es la de la familia Qwen2, según los tags del repositorio.

Los datos de entrenamiento consistieron en aproximadamente 2.000 preguntas generadas a partir de 286 hechos escritos manualmente y verificados con fuentes, junto con las frases iniciales de 333 páginas de Wikipedia. Cada prompt de entrenamiento incluye los tres pasajes que el propio sistema de búsqueda del proyecto devuelve para esa pregunta, de modo que el modelo aprende a responder condicionado al contexto recuperado. No se menciona el uso de RLHF ni DPO en la información disponible. La innovación técnica principal no reside en la arquitectura, sino en el pipeline de cuantización específico para ONNX Runtime GenAI y en el despliegue en navegador mediante WebGPU.

## Capacidades

- Generación de texto condicionada a contexto recuperado (RAG): responde preguntas basándose exclusivamente en los pasajes incluidos en el prompt.
- Dominio restringido al universo de Batman: hechos sobre personajes, tramas y publicaciones.
- Capacidad de declinar responder cuando los pasajes no contienen la respuesta o cuando la pregunta está fuera de tema.
- Respuestas concisas: una o dos frases o una lista numerada corta, por diseño del prompt de sistema.
- Ejecución en navegador mediante transformers.js y ONNX Runtime Web (WebGPU o WASM).
- No soporta tool calling ni function calling de forma nativa.
- No soporta razonamiento multi-paso ni modo de pensamiento (thinking mode).
- No dispone de capacidades de visión ni audio.
- Multilingüismo limitado al inglés.

## Casos de uso

- Demostración educativa de RAG en el navegador: el modelo sirve para ilustrar cómo combinar un motor de búsqueda local con un LLM pequeño y cuantizado para responder preguntas sobre un corpus acotado, sin necesidad de backend.
- Prototipado de asistentes de dominio cerrado: útil como plantilla para construir asistentes sobre documentación técnica, wikis internas o bases de conocimiento específicas, sustituyendo el corpus de Batman por el corpus propio.
- Aplicaciones offline o de privacidad estricta: al ejecutarse íntegramente en el cliente, ningún dato del usuario abandona el navegador, lo que lo hace adecuado para entornos con requisitos de privacidad.
- Benchmarking de cuantización en WebGPU: permite comparar el rendimiento y la precisión entre las variantes de 4 y 8 bits (95,7% frente a 89,4% en la evaluación del autor) en hardware consumer.
- Educación sobre ajuste fino con LoRA: el repositorio y la model card documentan el proceso completo (datos, hiperparámetros, evaluación), lo que lo convierte en material de referencia para aprender a ajustar modelos pequeños.
- Chatbots temáticos de bajo coste: para fans o comunidades de nicho que quieran un asistente especializado en un tema concreto con un coste de inferencia nulo en servidor.

## Benchmarks y rendimiento

El autor publica una evaluación sobre 161 preguntas retenidas, respondidas por `model_q4f16.onnx` en Chrome headless con WebGPU, usando el mismo código de búsqueda y prompt que el sitio web. Se considera correcta una respuesta que contiene todos los hechos requeridos, no incluye afirmaciones falsas listadas, no es un rechazo y termina antes del límite de tokens.

| Categoría | n | Correctas |
|---|---|---|
| Ejemplos obligatorios | 13 | 100% |
| Hechos entrenados, nueva formulación | 59 | 93,2% |
| Hechos nunca vistos en entrenamiento | 38 | 94,7% |
| Páginas de Wikipedia sin ficha de hechos | 18 | 94,4% |
| Preguntas de Batman que los pasajes no pueden responder (debe declinar) | 13 | 100% |
| Fuera de tema (debe declinar) | 20 | 100% |
| **Total** | **161** | **95,7%** |

El modelo en precisión completa obtiene el mismo 95,7%. Una variante con solo la atención en 8 bits (306 MB) obtiene un 89,4%. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional, ya que el modelo está pensado para ejecutarse en el navegador. El archivo `model_q4f16.onnx` ocupa 347 MB y el `model_q4.onnx` es algo menor.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU en el navegador (Chrome, Edge). Para la variante WASM, no se requiere GPU.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con WebGPU habilitado; también en CPU mediante la variante WASM.
- Opciones de despliegue: transformers.js con ONNX Runtime Web (WebGPU o WASM), servidor estático para el sitio de demostración. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| BatLM-v3-qwen05-8bit | ~360M | No disponible | CC BY-SA 4.0 | ONNX | RAG especializado en Batman, navegador |
| SmolLM2-360M-Instruct (base) | 360M | No disponible | Apache 2.0 | Safetensors, GGUF, ONNX | Instrucciones generales, multilingüe |
| Qwen2.5-0.5B-Instruct | 500M | 32K (según documentación pública de Qwen) | Apache 2.0 | Safetensors, GGUF | Instrucciones generales, multilingüe |

La comparación directa con SmolLM2-360M-Instruct es la más relevante, ya que BatLM es un ajuste fino del mismo. La diferencia principal es el dominio restringido y el formato ONNX optimizado para navegador. Frente a Qwen2.5-0.5B-Instruct, BatLM ofrece menor tamaño y especialización, pero carece de capacidades generalistas y de soporte multilingüe.

## Limitaciones y advertencias

- Modelo de 360M parámetros: puede seleccionar una frase relacionada pero incorrecta cuando la pregunta tiene una formulación inusual.
- No mantiene conversaciones multi-turno: está diseñado para preguntas y respuestas de un solo turno.
- Las preguntas compuestas suelen recibir respuesta solo a una de las partes.
- Sin el contexto recuperado, se comporta como SmolLM2 con tendencia a respuestas cortas; no es útil como modelo generalista.
- Entrenado únicamente en inglés; no soporta castellano ni otros idiomas.
- Riesgo de alucinación mitigado por el RAG, pero no eliminado: el autor recomienda verificar los pasajes citados.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y compartir bajo la misma licencia; el modelo base es Apache 2.0.
- Proyecto no oficial: Batman es una marca registrada de DC Comics; el proyecto no está afiliado a DC ni a Warner Bros.
- Corpus derivado de Wikipedia (CC BY-SA 4.0), lo que condiciona la licencia de los pesos.
- Sin datos publicados sobre sesgos específicos más allá de los inherentes al corpus de Wikipedia y al modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chintanjv/BatLM-v3-qwen05-8bit
- Demostración: https://batlm.vercel.app
- Código fuente: https://github.com/chintanjv/BatLM
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
