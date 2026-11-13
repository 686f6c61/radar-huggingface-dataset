# chintanjv/BatLM-v3-trial-qwen15

## Resumen

BatLM-v3-trial-qwen15 es un ajuste fino de tipo LoRA sobre SmolLM2-360M-Instruct, desarrollado por el usuario chintanjv como proyecto educativo y de demostración. El modelo responde preguntas sobre el universo Batman utilizando pasajes recuperados (RAG) y está diseñado para ejecutarse íntegramente en el navegador mediante transformers.js, ONNX y WebGPU. Su propósito no es competir en capacidades generales, sino demostrar un pipeline completo de recuperación y generación de respuestas de bajo coste computacional en el cliente.

El modelo tiene 360 millones de parámetros (arquitectura Qwen2 según los tags, heredada de SmolLM2), ventana de contexto no especificada en la información disponible y pesos distribuidos en formato ONNX cuantizado (q4f16 para WebGPU, q4 para CPU/WASM) junto con safetensors. El repositorio ocupa 4,1 GB, aunque el artefacto de inferencia principal para WebGPU es de 347 MB.

Su relevancia es acotada: se trata de una prueba de concepto de RAG en el navegador con un modelo diminuto, útil para quienes quieran replicar la arquitectura de un asistente especializado con recuperación documental y despliegue sin servidor. No está pensado para uso general ni para producción fuera de ese nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, base SmolLM2-360M-Instruct) |
| Parametros totales | 360M (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX q4f16 (WebGPU), ONNX q4 (CPU/WASM); matrices de atención, matriz de salida de cada MLP y LM head en 8 bits, resto de matrices MLP en 4 bits |
| Idiomas soportados | en |
| Licencia | cc-by-sa-4.0 (base Apache-2.0) |
| Formato de pesos | ONNX, safetensors |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-360M-Instruct, un transformer decoder-only de 360M parámetros. Sobre él se aplicó un ajuste fino con LoRA de rango 16 sobre todas las capas lineales, durante 2 épocas, y los adaptadores se fusionaron en los pesos finales. No se especifica en la información disponible si hubo RLHF, DPO u otras etapas de alineamiento posteriores al ajuste supervisado.

Los datos de entrenamiento consisten en aproximadamente 2.000 preguntas generadas a partir de 286 hechos verificados escritos a mano y de las frases iniciales de 333 páginas de Wikipedia. Cada prompt de entrenamiento incluye los tres pasajes que el propio buscador del proyecto devuelve para esa pregunta, de modo que el modelo aprende a responder condicionado a contexto recuperado. La cuantización se realizó con el builder de onnxruntime-genai usando k-quant con tamaño de bloque 16.

## Capacidades

- Generación de texto breve y directo (una o dos frases o lista numerada corta) condicionada a pasajes recuperados.
- Respuesta fundamentada en contexto (RAG): responde exclusivamente a partir de los CASE FILES incluidos en el prompt.
- Declinación explícita cuando los pasajes no contienen la respuesta o la pregunta está fuera de tema.
- Especialización en el universo Batman: personajes, tramas y hechos del corpus de Wikipedia seleccionado.
- Ejecución en navegador mediante transformers.js, ONNX Runtime y WebGPU.
- No soporta tool calling ni function calling según la información disponible.
- No soporta razonamiento multi-paso ni agentes.
- No mantiene conversaciones multi-turno (limitación declarada por el autor).
- Capacidades multilingües: solo inglés.

## Casos de uso

- Demostración educativa de RAG en el navegador: sirve para ilustrar cómo combinar un índice de búsqueda local, recuperación de pasajes y un LLM pequeño cuantizado que corre en WebGPU sin backend.
- Asistente de consulta sobre un corpus cerrado y verificado: el patrón (hechos curados + pasajes de Wikipedia + instrucción de declinar) es replicable para dominios acotados como documentación interna o bases de conocimiento temáticas.
- Prototipado de chatbots especializados sin infraestructura: al pesar 347 MB en q4f16, puede distribuirse como activo estático y ejecutarse en el cliente, reduciendo costes de servidor en pruebas de concepto.
- Evaluación de pipelines de cuantización: el proyecto compara variantes (q4f16 al 95,7 % frente a solo atención en 8 bits al 89,4 %), lo que lo convierte en un caso de estudio para medir el impacto de la cuantización en tareas de extracción factual.
- Filtrado y abstención controlada: dado que declina correctamente el 100 % en preguntas fuera de alcance y sin respuesta en los pasajes, el patrón es útil para diseñar asistentes que prioricen la abstención sobre la alucinación.
- Base para fine-tuning de dominio: al derivar de SmolLM2-360M-Instruct con LoRA, sirve como plantilla para adaptar un modelo minúsculo a un corpus propio con un coste de entrenamiento bajo.

## Benchmarks y rendimiento

Evaluación del autor sobre 161 preguntas reservadas, con `model_q4f16.onnx` en Chrome headless sobre WebGPU, usando el mismo código de búsqueda y prompt que el sitio web. Se considera correcta una respuesta que contiene todos los hechos requeridos, no emite afirmaciones falsas listadas, no es una negativa y termina antes del límite de tokens.

| Categoría | n | Correctas |
|---|---|---|
| Ejemplos obligatorios | 13 | 100% |
| Hechos entrenados, nueva formulación | 59 | 93,2% |
| Hechos nunca vistos en entrenamiento | 38 | 94,7% |
| Páginas de Wikipedia sin ficha de hechos | 18 | 94,4% |
| Preguntas de Batman sin respuesta en los pasajes (debe declinar) | 13 | 100% |
| Fuera de tema (debe declinar) | 20 | 100% |
| **Total** | **161** | **95,7%** |

El modelo a precisión completa obtiene el mismo 95,7 %. Una variante con solo la atención en 8 bits (306 MB) obtiene el 89,4 %. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto q4f16 para WebGPU ocupa 347 MB, por lo que la inferencia cabe holgadamente en cualquier GPU integrada o dedicada con soporte WebGPU.
- GPU recomendadas: no se especifican modelos concretos; el autor valida el funcionamiento en Chrome headless con WebGPU. Cualquier GPU de escritorio o portátil reciente con WebGPU habilitado debería ser suficiente.
- Cabe en GPU de consumo: sí, con margen amplio, dado el tamaño del modelo (360M parámetros) y la cuantización de 4/8 bits.
- Opciones de despliegue: transformers.js con ONNX Runtime Web (WebGPU para el artefacto q4f16, WASM/CPU para q4). No se documentan despliegues con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BatLM-v3-trial-qwen15 | 360M | no disponible | RAG sobre universo Batman, en navegador | cc-by-sa-4.0 | Hugging Face, ONNX |
| SmolLM2-360M-Instruct (base) | 360M | no disponible | Instrucciones generales | Apache-2.0 | Hugging Face |
| SmolLM2-135M-Instruct | 135M | no disponible | Instrucciones generales, más ligero | Apache-2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | 500M | no disponible | Instrucciones generales multilingües | Apache-2.0 | Hugging Face |

La comparación con alternativas de la misma categoría (modelos minúsculos para despliegue en cliente) es limitada: BatLM está especializado en un dominio concreto y condicionado a recuperación, mientras que los modelos citados son de propósito general. No hay datos de benchmarks comparables entre ellos en la información disponible.

## Limitaciones y advertencias

- Modelo de 360M parámetros: puede seleccionar una frase relacionada pero incorrecta cuando la pregunta se formula de manera atípica.
- No mantiene conversaciones multi-turno; cada consulta es independiente.
- Las preguntas compuestas suelen recibir respuesta solo a una de sus partes.
- Depende críticamente del contexto recuperado: sin pasajes en el prompt se comporta como SmolLM2 con tendencia a respuestas cortas.
- Solo inglés; no hay soporte multilingüe.
- Riesgo de alucinación mitigado por la instrucción de declinar, pero no eliminado; el autor recomienda verificar los pasajes citados.
- Sesgos: no documentados explícitamente; el corpus proviene de Wikipedia, con los sesgos de cobertura y redacción de esa fuente.
- Licencia cc-by-sa-4.0: permite uso comercial con atribución y compartir bajo la misma licencia; el modelo base es Apache-2.0, lo que puede generar obligaciones combinadas a revisar.
- Proyecto no oficial: Batman es una marca de DC Comics; el proyecto no está afiliado a DC ni a Warner Bros., lo que limita el uso comercial de la temática.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.
- Fechas de creación y actualización del repositorio (2026) posteriores a la consulta, lo que sugiere metadatos inconsistentes; conviene verificar la integridad de los artefactos antes de usarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chintanjv/BatLM-v3-trial-qwen15
- Demo: https://batlm.vercel.app
- Código fuente: https://github.com/chintanjv/BatLM
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
