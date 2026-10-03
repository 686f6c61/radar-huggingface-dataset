# lazybrick/Qwen3.5-4B-Kiln-INT8-W8A8

## Resumen

Qwen3.5-4B-Kiln-INT8-W8A8 es una versión cuantizada del modelo multimodal Qwen/Qwen3.5-4B, publicada por el usuario lazybrick dentro de la colección "Kiln". Se trata de una compresión a 8 bits de pesos y activaciones (W8A8) obtenida mediante SmoothQuant con fuerza de suavizado 0,8 seguida de GPTQ, aplicada sobre un transformer denso multimodal de aproximadamente 4.000 millones de parámetros con pipeline image-text-to-text. El objetivo es reducir el coste de memoria y aumentar el throughput de inferencia en vLLM sin retreinar el modelo.

La relevancia de esta ficha es doble. Por un lado, documenta un método de cuantización concreto (INT8 simétrico por canal de salida en pesos y dinámico por token en activaciones) que deja fuera de la cuantización el `lm_head`, los embeddings de tokens y el codificador de visión, que permanecen en BF16. Por otro, y de forma crítica, el repositorio está marcado explícitamente como "work in progress": el tamaño del repo es de 0,0 GB y ni los pesos cuantizados ni los resultados de evaluación de esta variante están publicados todavía.

El autor ha fijado un protocolo de evaluación único y comparable contra el modelo base en BF16, con métricas de referencia ya publicadas (MMLU-Pro 74,6; GSM8K 83,2; MATH-500 83,4; MMMU 69,6; DocVQA 95,3), mientras que la columna correspondiente a la variante INT8 aparece como pendiente. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3.5): modelo de lenguaje + codificador de visión. El pipeline declarado es image-text-to-text |
| Parametros totales | 4B (heredados de Qwen/Qwen3.5-4B; no se publica desglose por componente) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens según la receta de vLLM para el modelo base (dato de búsqueda web, no confirmado en la model card); el ejemplo de uso del autor fija `--max-model-len 32768` |
| Tipos de cuantizacion | INT8 W8A8: pesos INT8 simétricos por canal de salida, activaciones INT8 simétricas dinámicas por token. Método: SmoothQuant (smoothing strength 0,8) + GPTQ. No cuantizados: `lm_head`, embeddings de tokens y codificador de visión (`re:.*visual.*`), que quedan en BF16. Variante única, no hay otras recetas publicadas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | `compressed-tensors` sobre safetensors (toolkit `llm-compressor` 0.13.0, `compressed-tensors` 0.18.0). No hay GGUF |

## Arquitectura y entrenamiento

No hay entrenamiento: se trata de una cuantización post-entrenamiento (PTQ) del modelo Qwen/Qwen3.5-4B, del que no se detallan en esta ficha la composición del dataset ni las fases de RLHF/DPO, ya que corresponden al modelo base y no se incluyen en la información proporcionada. La arquitectura subyacente es un transformer denso multimodal con decodificador de lenguaje y codificador de visión, con pipeline image-text-to-text.

La innovación técnica de esta variante es el pipeline de cuantización: se aplicó `SmoothQuantModifier(smoothing_strength=0.8)` para redistribuir la dificultad de cuantización entre pesos y activaciones, seguido de `GPTQModifier(scheme="W8A8")` con una lista de exclusión que preserva en BF16 la cabeza de salida, los embeddings y el codificador visual. La calibración se realizó con 512 conversaciones de HuggingFaceH4/ultrachat_200k (`train_sft`, revisión `8049631`), muestreadas con semilla 42, con la plantilla de chat aplicada y truncadas a 2.048 tokens. Todas las variantes de la colección Kiln usan el mismo conjunto de calibración, lo que permite comparar el efecto de cada esquema de cuantización por separado. El resultado se empaqueta en formato `compressed-tensors`, que vLLM carga seleccionando automáticamente los kernels cuantizados correspondientes.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat de Qwen3.5 y modo instruct mediante `chat_template_kwargs={"enable_thinking": false}`.
- Razonamiento y matemáticas: el modelo base BF16 obtiene 83,2 en GSM8K y 83,4 en MATH-500 bajo el protocolo del autor.
- Comprensión multimodal de imagen y texto: MMBench-EN dev v1.1, MMMU (val), MathVista (mini), OCRBench, DocVQA (val) y TextVQA (val) se evalúan con VLMEvalKit sobre esta familia de modelos.
- OCR y comprensión de documentos: el modelo base registra 86,3 en OCRBench y 95,3 de ANLS en DocVQA bajo el protocolo indicado.
- Seguimiento de instrucciones: 82,3 de prompt-level strict en IFEval (modelo base BF16).
- Capacidad de procesar contexto largo (hasta 262.144 tokens según la receta de vLLM del modelo base; el ejemplo del autor limita a 32.768).
- Tool calling y comportamiento de agente: no disponible en la información proporcionada para esta variante.
- Idiomas soportados: no disponible.
- El codificador de visión no está cuantizado, por lo que la ruta visual se ejecuta en BF16.

## Casos de uso

- Despliegue de un asistente conversacional multimodal en una GPU de consumo: la cuantización INT8 W8A8 reduce el peso de los pesos del modelo de lenguaje a aproximadamente 4 GB (estimación aritmética sobre 4B parámetros en 8 bits, más embeddings, `lm_head` y codificador visual en BF16), lo que permite servir el modelo en una única GPU de 16 GB junto con la caché KV.
- Extracción de datos de documentos escaneados: el modelo base alcanza 95,3 de ANLS en DocVQA, por lo que la variante cuantizada es candidata para pipelines de digitalización de facturas, formularios y contratos donde el throughput importa más que la latencia de un único token.
- OCR en producción: con 86,3 de score en OCRBench en el modelo base, se puede integrar en flujos de indexación de archivos y búsqueda documental, siempre que se valide previamente la degradación introducida por INT8.
- Análisis de imágenes con preguntas en lenguaje natural (VQA): atención a usuario final sobre capturas, fotografías de producto o imágenes técnicas, apoyándose en TextVQA (82,8 en el modelo base) y MMBench-EN (85,4).
- Motores de razonamiento matemático con verificación de pasos: 83,2 en GSM8K y 83,4 en MATH-500 en BF16 lo sitúan como base para tutores automáticos o generación de ejercicios resueltos, con la advertencia de que la degradación por cuantización en tareas de razonamiento está sin medir.
- Servicio de inferencia de alto rendimiento en vLLM: al usar `compressed-tensors` W8A8, vLLM selecciona kernels INT8, lo que reduce el ancho de banda de memoria por token generado y aumenta el throughput agregado en comparación con el modelo BF16 en la misma GPU.
- Evaluación comparativa de recetas de cuantización: al compartir conjunto de calibración y protocolo de evaluación con el resto de la colección Kiln, sirve como referencia para medir el coste en precisión de W8A8 frente a otras compresiones del mismo modelo.

## Benchmarks y rendimiento

La model card publica únicamente la columna de referencia del modelo base en BF16. La columna de la variante INT8 W8A8 figura como "WIP" (pendiente), por lo que no existen resultados de esta variante en la información disponible.

| Tarea | Métrica | BF16 (referencia) | INT8 W8A8 |
|---|---|---:|---:|
| MMLU-Pro | exact match | 74,6 | Pendiente |
| GSM8K | exact match, extracción flexible | 83,2 | Pendiente |
| MATH-500 | math_verify | 83,4 | Pendiente |
| IFEval | prompt-level strict | 82,3 | Pendiente |
| HellaSwag | acc_norm | 65,4 | Pendiente |
| ARC-Challenge | acc_norm | 51,1 | Pendiente |
| WikiText-2 | perplejidad de palabra (menor es mejor) | 10,95 | Pendiente |
| MMBench-EN dev v1.1 | accuracy | 85,4 | Pendiente |
| MMMU (val) | accuracy | 69,6 | Pendiente |
| MathVista (mini) | accuracy | 81,0 | Pendiente |
| OCRBench | score | 86,3 | Pendiente |
| DocVQA (val) | ANLS | 95,3 | Pendiente |
| TextVQA (val) | accuracy | 82,8 | Pendiente |

Protocolo declarado por el autor: modo instruct (`enable_thinking=False`), decodificación greedy, hasta 8.192 tokens generados. Tareas de texto con lm-evaluation-harness 0.4.13 (0-shot, plantilla de chat) sobre vLLM 0.29.0. Tareas de visión con VLMEvalKit (revisión `34a64e6`) contra un servidor vLLM. TextVQA, OCRBench y DocVQA se puntúan con las reglas de VLMEvalKit. Para MMBench, MMMU y MathVista, un extractor de respuestas fijo (`gpt-4o-mini`) lee la opción elegida; es el mismo para todos los modelos y nunca el modelo evaluado. Revisión del modelo base: `851bf6e`. El propio autor advierte de que estas cifras no son comparables con las de la model card de Qwen3.5-4B, que reporta modo thinking con sampling y presupuestos de 32.768 a 81.920 tokens.

## Requisitos de hardware

- Pesos: el repositorio está actualmente vacío (0,0 GB) y los pesos están en proceso de publicación, por lo que hoy no es ejecutable. Estimación aritmética para cuando se publiquen: unos 4 GB para los pesos INT8 del modelo de lenguaje, más los embeddings, `lm_head` y el codificador de visión en BF16, más la caché KV del contexto configurado.
- Contexto: con `--max-model-len 32768` (ejemplo del autor) la caché KV es notablemente menor que con los 262.144 tokens del modelo base; a contexto completo, la caché KV domina el consumo de memoria.
- GPU: no hay requisitos publicados para esta variante. vLLM requiere kernels INT8, disponibles en GPUs con soporte de tensor cores INT8 (Turing o posterior). No hay datos de compatibilidad verificados en la información proporcionada.
- Cabe en GPU de consumo: según la receta de vLLM para el modelo base, Qwen3.5-4B cabe en GPUs de consumo de 16 GB con el contexto completo; para esta variante INT8 no hay confirmación publicada.
- Opciones de despliegue: vLLM con `vllm serve lazybrick/Qwen3.5-4B-Kiln-INT8-W8A8 --max-model-len 32768`. El formato `compressed-tensors` no es compatible con llama.cpp, Ollama ni formatos GGUF. TGI: no disponible.
- Latencia y throughput: no disponible. El autor no publica mediciones de rendimiento de esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lazybrick/Qwen3.5-4B-Kiln-INT8-W8A8 | 4B (denso, multimodal) | 262K según receta de vLLM del base; ejemplo del autor a 32K | INT8 W8A8 (SmoothQuant + GPTQ), compressed-tensors | Apache 2.0 | Repositorio vacío, pesos pendientes |
| Qwen/Qwen3.5-4B | 4B (denso, multimodal) | 262K según receta de vLLM | BF16 | Apache 2.0 | Publicado; referencia de evaluación del autor |
| vistralis/Qwen3-4B-INT8 | 4B (Qwen3, generación anterior) | No disponible | W8A8, capas lineales salvo `lm_head`, calibrado con 256 muestras de C4 | No disponible | Publicado |
| zhiqing/Qwen3-4B-INT8 | 4B (Qwen3, generación anterior) | No disponible | INT8 | No disponible | Publicado |
| Qwen3.5-4B en GGUF cuantizado (Q4) | 4B | Según runner | Q4, ~2,5-3 GB | Apache 2.0 | Publicado por terceros |

Las variantes de Qwen3-4B (generación anterior) no son directamente comparables: no son multimodales y pertenecen a una familia distinta. No se dispone de otras cuantizaciones W8A8 publicadas de Qwen3.5-4B en la información consultada.

## Limitaciones y advertencias

- Estado "work in progress": los pesos cuantizados y los resultados de evaluación de esta variante aún no están publicados. El repositorio tiene 0,0 GB y no es utilizable en la práctica.
- No hay ninguna medición de la degradación introducida por la cuantización: la columna INT8 de la tabla de benchmarks está marcada como pendiente en todos los casos.
- La calibración usa solo 512 conversaciones de `ultrachat_200k` truncadas a 2.048 tokens. Es un conjunto de dominio conversacional generalista, por lo que el comportamiento fuera de ese dominio (código, matemáticas largas, documentos con estructura compleja, otras lenguas) puede degradarse más de lo que reflejaría una calibración específica.
- El codificador de visión, los embeddings y el `lm_head` permanecen en BF16: la cuantización no es homogénea y el ahorro de memoria es menor que el nominal de un W8A8 completo.
- Riesgo de alucinación inherente al modelo base, no mitigado por la cuantización. Las tareas de OCR y VQA son especialmente sensibles a inventar texto o contenido no presente en la imagen.
- Idiomas soportados: no disponible. No hay evaluación multilingüe y no se puede asumir el comportamiento del modelo base en castellano u otras lenguas.
- Los datos de benchmark publicados corresponden al modelo base en modo instruct con decodificación greedy; no son extrapolables a modo thinking ni a configuraciones con sampling.
- Compatibilidad limitada: el formato `compressed-tensors` exige vLLM (o una versión de transformers con soporte de compressed-tensors). No hay ruta GGUF ni soporte de llama.cpp/Ollama.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado de Qwen3.5-4B conviene revisar y citar el trabajo del equipo Qwen según indica la propia model card.
- No se documentan sesgos específicos del proceso de cuantización ni auditorías de sesgo del modelo base en esta información.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lazybrick/Qwen3.5-4B-Kiln-INT8-W8A8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Colección Kiln (Qwen3.5-4B): https://huggingface.co/collections/lazybrick/kiln-qwen35-4b-fired-small-6ac04982f4f1ce50a97da56d
- Resultados de evaluación por muestra: https://huggingface.co/datasets/lazybrick/kiln-evals
- Conjunto de calibración: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Entrada de blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Receta de vLLM para Qwen3.5-4B: https://recipes.vllm.ai/Qwen/Qwen3.5-4B
- Especificaciones y requisitos de VRAM de Qwen3.5-4B: https://apxml.com/models/qwen35-4b
- Guía local de Qwen 3.5 4B: https://theaibench.ai/models/qwen-3-5-4b/
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- VLMEvalKit: https://github.com/open-compass/VLMEvalKit
- Comparativa de cuantización W8A8 de Qwen3-4B (generación anterior): https://huggingface.co/vistralis/Qwen3-4B-INT8
- Otra cuantización INT8 de Qwen3-4B: https://huggingface.co/zhiqing/Qwen3-4B-INT8
