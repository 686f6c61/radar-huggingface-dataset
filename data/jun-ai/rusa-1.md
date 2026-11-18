# jun-ai/Rusa-1

## Resumen

Rusa-1 es un modelo de lenguaje de 350 millones de parámetros desarrollado por jun-ai, especializado en reescribir texto generado por IA para que suene a escritura humana, preservando íntegramente los hechos, cifras, nombres y citas del original. Se construye sobre LiquidAI/LFM2-350M, un transformer compacto de la familia LFM2 de Liquid AI, y se distribuye con pesos en safetensors, GGUF y ONNX, lo que permite ejecutarlo en CPU, en un teléfono o directamente en el navegador mediante Transformers.js.

El modelo resuelve un problema muy concreto: la detección de texto sintético y la uniformidad estilística de las salidas de LLM. En lugar de competir en capacidades generales, Rusa-1 se entrena específicamente para la tarea de "humanización" con preservación factual, mediante destilación desde un modelo profesor de 12B y un ajuste de preferencias con un profesor que ordena muestras y un verificador de hechos que las filtra.

Su relevancia actual radica en el tamaño: con 354 millones de parámetros y cuantizaciones de 229 MB en Q4_K_M, ofrece un pipeline de reescritura desplegable en entornos con recursos muy limitados, incluido el navegador, algo poco habitual en tareas de estilo que suelen requerir modelos mucho mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LFM2 de Liquid AI) |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de entrenamiento hasta ~450 palabras) |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF); fp32, fp16, q8, q4, q4f16 (ONNX); builds ternarios experimentales en Rusa-1-Small |
| Idiomas soportados | Ingles |
| Licencia | LFM Open License v1.0 (heredada de LFM2-350M) |
| Formato de pesos | safetensors (BF16), GGUF, ONNX |

## Arquitectura y entrenamiento

Rusa-1 parte de LiquidAI/LFM2-350M, un transformer decoder-only de la familia LFM2. Sobre esa base, el autor aplica un proceso de destilación desde un modelo profesor de 12B especializado en reescritura, seguido de un ajuste de preferencias sobre muestras generadas por el propio modelo. En esa fase, el profesor de 12B actúa como ranker de las muestras y un verificador de hechos filtra aquellas que no preservan números, fechas, nombres o citas.

El resultado es un modelo de 350M que, según la evaluación del autor, supera a su profesor de 12B en preservación factual (83/209 frente a 67/209 en una sola muestra) y se queda ligeramente por detrás en puntuación de detector de IA (0,236 frente a 0,190). El entrenamiento no emplea una plantilla de chat: usa un prompt en texto plano con instrucciones explícitas y el marcador `### Rewritten:`, y el modelo termina la generación con `<|im_end|>`. No se detallan en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Reescritura de texto para reducir la probabilidad de ser clasificado como generado por IA, manteniendo el contenido factual.
- Preservación de hechos, números, unidades, fechas, nombres y citas textuales del borrador original.
- Reorganización libre del texto: variación deliberada de la longitud de frase y eliminación de hedging y frases de relleno.
- Generación de múltiples muestras por borrador; el autor recomienda muestrear varias reescrituras y quedarse con la mejor.
- Ejecución en CPU, en dispositivos móviles y en navegador (Transformers.js con WebGPU o WASM).
- Compatibilidad con endpoints y despliegue en llama.cpp, LM Studio, Ollama, vLLM y ONNX Runtime.
- Capacidad multilingüe: no disponible (solo inglés).
- Tool calling / function calling: no disponible.
- Modo de razonamiento o thinking: no disponible.
- Visión o audio: no disponible.

## Casos de uso

- Humanización de borradores en pipelines editoriales: dado un texto generado por un LLM, Rusa-1 lo reescribe con un estilo menos uniforme antes de la revisión humana, reduciendo la carga de edición de estilo.
- Preprocesado en aplicaciones de publicación asistida: integrado como paso previo a la publicación de contenido en blogs o newsletters, con verificación manual de cifras y citas tras la reescritura.
- Ejecución en el navegador para herramientas de escritura: mediante Transformers.js y el modelo ONNX q4f16 (248 MB), se puede ofrecer reescritura local sin enviar el texto a un servidor, lo que resulta adecuado para contenido sensible.
- Aplicaciones móviles o de escritorio offline: con GGUF Q8_0 (379 MB) o Q4_K_M (229 MB) en llama.cpp u Ollama, se puede desplegar en equipos sin GPU dedicada.
- Generación de variantes de copy para marketing: muestrear varias reescrituras (por ejemplo, 8) y seleccionar la que mejor preserve los datos del producto y suene más natural.
- Normalización de texto en corpus de entrenamiento: reescribir grandes volúmenes de texto sintético para reducir el sesgo estilístico de modelos generadores en datasets posteriores, procesando párrafo a párrafo por la limitación de ~450 palabras.
- Filtrado y preprocesado en sistemas de detección de IA: usar el modelo como generador de ejemplos negativos para entrenar o evaluar clasificadores de texto sintético.

## Benchmarks y rendimiento

Evaluación sobre 209 borradores escritos por IA (ensayos, correos, reseñas, posts de foro y tutoriales), con una reescritura muestreada por borrador. La puntuación de IA proviene del clasificador desklib/ai-text-detector-v1.01 (menor es mejor); se marca como detectado si la puntuación supera 0,5. "Conserva los hechos" significa que todos los números, fechas, nombres y citas del borrador sobreviven.

| Modelo | Tamano | Puntuacion media IA ↓ | Marcados como IA ↓ | Conserva todos los hechos ↑ | Conserva todos los hechos, mejor de 8 ↑ |
|---|---|---|---|---|---|
| Profesor 12B | 12B | 0,190 | 30 / 209 | 67 / 209 | 146 / 209 |
| Rusa | 350M | 0,236 | 46 / 209 | 83 / 209 | 185 / 209 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 (unos 710 MB de pesos); en Q8_0 unos 380 MB; en Q4_K_M unos 230 MB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; no requiere A100 ni H100. Funciona en RTX 4090, RTX 3060 o GPUs integradas sin problema.
- Cabe en GPU de consumo: sí, en todas las GPU consumer actuales e incluso en iGPU y en CPU.
- Despliegue: Transformers (BF16 safetensors), vLLM, llama.cpp, LM Studio, Ollama, ONNX Runtime y Transformers.js v4 (WebGPU o WASM).
- Latencia y throughput: no disponibles en la información proporcionada. El autor indica que es suficientemente pequeño para ejecutarse en CPU, teléfono y navegador, pero no publica cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rusa-1 (jun-ai) | 350M | no disponible (~450 palabras de entrada) | Reescritura con preservación factual | LFM Open License v1.0 | Hugging Face (safetensors, GGUF, ONNX) |
| Profesor 12B de Rusa-1 | 12B | no disponible | Reescritura con preservación factual | no disponible | no disponible (referenciado solo en la evaluación) |
| LiquidAI/LFM2-350M | 350M | no disponible | Generación de texto general | LFM Open License v1.0 | Hugging Face |

No se dispone de información sobre otros modelos comparables de humanización de texto en la documentación proporcionada.

## Limitaciones y advertencias

- Solo inglés; no soporta otros idiomas.
- La preservación de hechos es buena pero no perfecta: hay que verificar números, nombres y citas antes de publicar una reescritura.
- Entradas de más de ~450 palabras quedan fuera del rango de entrenamiento; hay que dividir documentos largos en párrafos.
- La cuantización a 4 bits degrada la calidad de forma notable a este tamaño; el autor recomienda Q8_0 como GGUF por defecto.
- No debe usarse para atribuirse autoría de forma fraudulenta donde esté prohibido, como en trabajos académicos.
- Riesgo de alucinación no cuantificado en la información disponible; el filtro de hechos del entrenamiento no garantiza la preservación en inferencia.
- Licencia LFM Open License v1.0: conviene revisar el texto de la licencia antes de uso comercial, ya que no es una licencia permisiva estándar.
- El modelo está diseñado para una única tarea; no es un modelo de propósito general y no ofrece tool calling ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jun-ai/Rusa-1
- Modelo base: https://huggingface.co/LiquidAI/LFM2-350M
- Build ternario experimental: https://huggingface.co/jun-ai/Rusa-1-Small
- Clasificador de detección usado en la evaluación: https://huggingface.co/desklib/ai-text-detector-v1.01
- Licencia LFM Open License v1.0: https://huggingface.co/jun-ai/Rusa-1/blob/main/LICENSE
