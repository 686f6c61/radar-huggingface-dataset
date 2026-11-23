# Shayannasiri/MedFrame-R1-8B

## Resumen

MedFrame-R1-8B es un modelo multimodal de razonamiento medico desarrollado por Shayannasiri, obtenido mediante ajuste fino del modelo Qwen/Qwen3-VL-8B-Instruct. El modelo procesa entradas de imagen y texto para responder preguntas clinicas (image-text-to-text), incorporando una fase de razonamiento explicito antes de emitir la respuesta final. Su entrenamiento combina un arranque supervisado (cold start) con aprendizaje por refuerzo mediante DAPO, una variante de optimizacion de politica proximal, durante 200 pasos.

El modelo cuenta con 8.767.123.696 parametros totales (aproximadamente 8,8 mil millones), lo que lo situa en la categoria de modelos de 8B con capacidad de vision. Se distribuye en formato safetensors con un tamano de repositorio de 17,5 GB, bajo licencia Apache 2.0, lo que facilita su uso y redistribucion. La arquitectura subyacente es la de Qwen3-VL, un transformer multimodal con torre de vision integrada.

Su relevancia radica en la aplicacion de aprendizaje por refuerzo especificamente al dominio medico multimodal, con un mecanismo de recompensa basado en un juez con compuerta de embeddings y una recompensa de longitud. El autor lo posiciona explicitamente como herramienta de investigacion, no apta para decision clinica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL), vision + lenguaje |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-VL-8B-Instruct, un transformer multimodal que combina un codificador de vision con un modelo de lenguaje para tareas image-text-to-text. Sobre esta base, el autor aplica un pipeline de dos fases: primero un arranque supervisado (cold start) para inicializar el comportamiento de razonamiento, y despues aprendizaje por refuerzo con DAPO durante 200 pasos. La funcion de recompensa combina un juez con compuerta de embeddings (embedding-gated judge reward) y una recompensa de longitud, disenada para equilibrar la calidad del razonamiento con la concision de la respuesta.

Los datos de entrenamiento provienen del conjunto MBZUAI/medix-rl-data, con 51.335 muestras, complementado con trazas de razonamiento publicadas en Shayannasiri/MedFrame-R1-CoT. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni la composicion detallada del dataset mas alla de su origen medico. El modelo genera su cadena de razonamiento antes de la respuesta final, comportamiento que el autor describe explicitamente en la model card.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre imagenes medicas y preguntas clinicas.
- Razonamiento explicito: el modelo escribe su cadena de pensamiento antes de la respuesta final.
- Respuesta a preguntas visuales (VQA) de dominio medico, como deteccion de neumotorax en radiografias.
- Respuesta a preguntas textuales (QA) de dominio medico.
- Procesamiento de conversaciones multi-turno mediante plantilla de chat (apply_chat_template).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explicitamente, aunque el razonamiento por pasos esta integrado en la generacion.

## Casos de uso

- Apoyo a la lectura de imagenes radiologicas en investigacion: el modelo recibe una imagen y una pregunta clinica (por ejemplo, presencia de neumotorax) y emite un razonamiento previo a la conclusion, util para estudiar la trazabilidad del razonamiento multimodal.
- Evaluacion de modelos de razonamiento medico: al exponer su cadena de pensamiento, permite analizar como llega a una respuesta y comparar con otras variantes sobre los mismos benchmarks.
- Investigacion en RL para modelos medicos: sirve como referencia reproducible del framework MedFrame-R1 para experimentos de aprendizaje por refuerzo con recompensas basadas en jueces.
- Generacion de conjuntos de datos de razonamiento: sus trazas pueden emplearse para destilar o aumentar datos de entrenamiento en tareas medicas multimodales.
- Prototipado de asistentes de documentacion clinica en entornos de laboratorio: procesa pares imagen-texto y genera explicaciones estructuradas para revision humana.
- Analisis comparativo de VQA medica: con 17 benchmarks reportados por el autor, es adecuado para estudios de evaluacion estandarizada en investigacion.

## Benchmarks y rendimiento

La model card menciona resultados de precision (%) sobre 17 benchmarks medicos (19.200 items), evaluados con reglas deterministas y un panel de tres jueces, con medias para VQA (6 benchmarks de imagen), QA (11 de texto), Macro (media sobre los 17) y Micro (agregado sobre todas las muestras). Sin embargo, los valores numericos no se incluyen en la informacion textual disponible; solo se referencia una imagen (results.png) que no esta accesible en los datos proporcionados.

No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 17,5 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB de VRAM.
- VRAM estimada con cuantizacion de 8 bits: en torno a 9-10 GB para pesos; con 4 bits, en torno a 5-6 GB, aunque la cuantizacion no esta confirmada como soportada en la informacion disponible.
- GPU recomendadas: A100 (40/80 GB), H100, L40S para despliegue en produccion; RTX 4090 (24 GB) viable en BF16 con margen ajustado.
- GPU de consumo: posible en RTX 4090 con precision reducida; en GPUs de 16 GB requeriria cuantizacion, no confirmada.
- Opciones de despliegue: transformers (documentado en la model card con AutoModelForImageTextToText y AutoProcessor); vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MedFrame-R1-8B | 8,77B | no disponible | Apache 2.0 | Multimodal medico con RL (DAPO) |
| Qwen/Qwen3-VL-8B-Instruct (base) | ~8B | no disponible | no disponible en la informacion | Modelo base multimodal generalista |
| Alternativas medicas multimodales de 8B | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion |

No se dispone de datos de rendimiento comparativo con otros modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Uso exclusivamente de investigacion: el autor declara explicitamente que no es apto para decision clinica.
- Riesgo de alucinacion en dominio medico: al ser un modelo generativo, puede producir afirmaciones clinicamente incorrectas con apariencia de plausibilidad.
- Sesgos: no documentados en la informacion disponible; los sesgos del corpus de entrenamiento medico pueden propagarse.
- Idiomas soportados no especificados; el rendimiento fuera del ingles (o de los idiomas del dataset) es desconocido.
- Longitud de contexto no disponible, lo que impide planificar casos de uso con documentos o historiales largos.
- Ausencia de validacion clinica externa: los benchmarks son autoinformados por el autor y evaluados con un panel de jueces, no con validacion prospectiva.
- Licencia Apache 2.0 permite uso comercial, pero la advertencia de uso solo para investigacion debe respetarse en contextos clinicos.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario practicamente inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shayannasiri/MedFrame-R1-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/MBZUAI/medix-rl-data
- Dataset de trazas de razonamiento: https://huggingface.co/datasets/Shayannasiri/MedFrame-R1-CoT
