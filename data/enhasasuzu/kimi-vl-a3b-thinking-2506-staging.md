# enhasasuzu/Kimi-VL-A3B-Thinking-2506-staging

## Resumen

Kimi-VL-A3B-Thinking-2506 es un modelo vision-language (VLM) de tipo Mixture-of-Experts (MoE) desarrollado por MoonshotAI, publicado originalmente en el repositorio `moonshotai/Kimi-VL-A3B-Thinking-2506`. La ficha que nos ocupa corresponde a un espejo/staging alojado por el usuario `enhasasuzu` (`enhasasuzu/Kimi-VL-A3B-Thinking-2506-staging`), que se declara como fine-tune del modelo base `moonshotai/Kimi-VL-A3B-Instruct`. Se trata, por tanto, de una copia derivada y no del artefacto oficial de MoonshotAI.

El modelo original resuelve tareas de razonamiento multimodal, matemáticas visuales, comprensión de video y grounding de agentes (interacción con interfaces gráficas), manteniendo un coste computacional contenido: el decoder de lenguaje activa solo 2,8B parámetros pese a ser MoE. La versión 2506 mejora la precisión en benchmarks de razonamiento (MathVision 56,9; MathVista 80,1; MMMU-Pro 46,3) reduciendo en torno al 20 % la longitud media de "thinking", y amplía la resolución de imagen soportada hasta 3,2 millones de píxeles totales (4 veces más que la versión anterior).

Es relevante ahora porque combina cadena de pensamiento (thinking), percepción visual de alta resolución, video y capacidades de agente en un modelo open source con licencia MIT, lo que permite despliegues comerciales sin restricciones de licencia, algo poco habitual en VLMs de este nivel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language Mixture-of-Experts (MoE); decoder de lenguaje MoE con activación de 2,8B parámetros (ID `kimi_vl`, `custom_code` en transformers) |
| Parametros totales | no disponible (el sufijo "A3B" indica ~3B activos; el total no se explicita en la información proporcionada) |
| Parametros activos | 2,8B en el decoder de lenguaje |
| Longitud de contexto | no disponible en la información proporcionada (el modelo original se describe como de "long-context") |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card no lista idiomas; los benchmarks reportados son principalmente en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo sigue la estela de Kimi-VL, un VLM open source basado en un decoder de lenguaje Mixture-of-Experts que activa únicamente 2,8B parámetros por token, combinado con un codificador visual (no se detalla su arquitectura exacta en la información disponible). El pipeline es `image-text-to-text` y integra un modo de razonamiento explícito ("thinking") que genera cadenas de pensamiento antes de responder.

La versión 2506 se presenta como una mejora de `Kimi-VL-A3B-Thinking` con tres ejes: (1) thinking más eficiente (mejor precisión con ~20 % menos tokens de razonamiento), (2) capacidades de percepción visual general equiparables o superiores al modelo no-thinking (Kimi-VL-A3B-Instruct), y (3) extensión a video y a mayor resolución (3,2 millones de píxeles por imagen). No se dispone en la información proporcionada del número de tokens de entrenamiento, composición del dataset ni detalles sobre RLHF/DPO. El artefacto aquí descrito es un fine-tune/staging del modelo base `moonshotai/Kimi-VL-A3B-Instruct`, por lo que sus pesos pueden diferir de los del modelo oficial de MoonshotAI.

## Capacidades

- Generación de texto y razonamiento multimodal con modo "thinking" (cadena de pensamiento previa a la respuesta).
- Razonamiento matemático visual (MathVision, MathVista) y razonamiento sobre diagramas y figuras.
- Comprensión de imágenes de alta resolución (hasta 3,2 millones de píxeles totales por imagen).
- Comprensión y razonamiento sobre video (VideoMMMU, MMVU, Video-MME).
- OCR y comprensión de documentos (OCRBench 869).
- Grounding de agentes: localización de elementos en interfaces gráficas (ScreenSpot-Pro, ScreenSpot-V2, OSWorld-G).
- Percepción visual general (MMBench, MMStar, RealWorldQA, MMVet).
- Capacidades multilingües: no disponibles de forma explícita en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Razonamiento matemático asistido: resolución de problemas de geometría y cálculo a partir de imágenes de pizarras o exámenes, apoyándose en el modo thinking y en los resultados reportados en MathVision (56,9) y MathVista (80,1).
- Automatización de agentes de interfaz (GUI agents): localización de botones, campos y elementos en capturas de pantalla para pilotar aplicaciones de escritorio o web, gracias a ScreenSpot-Pro (52,8) y OSWorld-G (52,5).
- Análisis de documentos y OCR: extracción de texto y estructura de facturas, formularios o PDFs escaneados, con OCRBench de 869 y soporte de imágenes de alta resolución.
- Comprensión de video para análisis de contenido: resumen y respuesta a preguntas sobre vídeos (VideoMMMU 65,2, Video-MME 71,9), útil en moderación, catalogación o asistencia audiovisual.
- Asistencia técnica multimodal: diagnóstico de errores a partir de capturas de pantalla o fotografías de equipos, con razonamiento paso a paso y contexto visual.
- Evaluación y anotación de datasets multimodales: generación de descripciones y razonamientos sobre imágenes para etiquetado asistido o control de calidad de corpus.
- Investigación en eficiencia de VLMs: al activar solo 2,8B parámetros, sirve como referencia para estudiar trade-offs entre coste y precisión en MoE multimodales.

## Benchmarks y rendimiento

Resultados reportados en la model card (modelo original Kimi-VL-A3B-Thinking-2506; GPT-4o se muestra en cursiva como referencia):

| Benchmark (métrica) | GPT-4o | Qwen2.5-VL-7B | Gemma3-12B-IT | Kimi-VL-A3B-Instruct | Kimi-VL-A3B-Thinking | Kimi-VL-A3B-Thinking-2506 |
|---|---|---|---|---|---|---|
| MMBench-EN-v1.1 (Acc) | 83,1 | 83,2 | 74,6 | 82,9 | 76,0 | 84,4 |
| RealWorldQA (Acc) | 75,4 | 68,5 | 59,1 | 68,1 | 64,0 | 70,0 |
| OCRBench (Acc) | 815 | 864 | 702 | 864 | 864 | 869 |
| MMStar (Acc) | 64,7 | 63,0 | 56,1 | 61,7 | 64,2 | 70,4 |
| MMVet (Acc) | 69,1 | 67,1 | 64,9 | 66,7 | 69,5 | 78,1 |
| MMMU (val, Pass@1) | 69,1 | 58,6 | 59,6 | 57,0 | 61,7 | 64,0 |
| MMMU-Pro (Pass@1) | 51,7 | 38,1 | 32,1 | 36,0 | 43,2 | 46,3 |
| MATH-Vision (Pass@1) | 30,4 | 25,0 | 32,1 | 21,7 | 36,8 | 56,9 |
| MathVista_MINI (Pass@1) | 63,8 | 68,0 | 56,1 | 68,6 | 71,7 | 80,1 |
| VideoMMMU (Pass@1) | 61,2 | 47,4 | 57,0 | 52,1 | 55,5 | 65,2 |
| MMVU (Pass@1) | 67,4 | 50,1 | 57,0 | 52,7 | 53,0 | 57,5 |
| Video-MME (w/ sub.) | 77,2 | 71,6 | 62,1 | 72,7 | 66,0 | 71,9 |
| ScreenSpot-Pro (Acc) | 0,8 | 29,0 | — | 35,4 | — | 52,8 |
| ScreenSpot-V2 (Acc) | 18,1 | 84,2 | — | 92,8 | — | 91,4 |
| OSWorld-G (Acc) | — | 31,5 | — | 41,6 | — | 52,5 |

Además, la model card cita V* Benchmark (83,2 sin herramientas extra) y mejoras relativas: +20,1 en MathVision, +8,4 en MathVista, +3,3 en MMMU-Pro y +2,1 en MMMU respecto a la versión Thinking anterior.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con ~3B parámetros activos y un total no publicado, la inferencia en bf16 requiere previsiblemente del orden de decenas de GB, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar GPUs de 24 GB (RTX 4090, A5000) en cuantizaciones reducidas, pero no se aporta dato verificado.
- ¿Cabe en GPU consumer?: no disponible con confirmación; el tamaño activo (2,8B) sugiere que sí en cuantización, pero no se especifica.
- Opciones de despliegue: transformers con `custom_code` (ID `kimi_vl`). No se documentan recetas para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. La model card menciona una reducción media del ~20 % en longitud de thinking, lo que implica menor coste de decodificación, pero sin cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kimi-VL-A3B-Thinking-2506 (este artefacto, staging) | ~3B activos (2,8B decoder) | no disponible | MIT | HF (espejo de terceros) | Fine-tune/staging de Kimi-VL-A3B-Instruct |
| Kimi-VL-A3B-Instruct | ~3B activos | no disponible | MIT (según repo oficial) | HF oficial MoonshotAI | Versión no-thinking; referencia en percepción general |
| Qwen2.5-VL-7B | 7B | no disponible | no disponible | HF | Inferior en MATH-Vision (25,0) y MMMU-Pro (38,1) frente a 2506 |
| Gemma3-12B-IT | 12B | no disponible | no disponible | HF | Inferior en la mayoría de benchmarks multimodales reportados |
| GPT-4o (referencia) | no disponible | no disponible | propietaria | API | Referencia externa, no open source |

## Limitaciones y advertencias

- Artefacto no oficial: se trata de un staging/espejo publicado por `enhasasuzu`, no del repositorio oficial de MoonshotAI; los pesos pueden diferir del modelo canónico y no hay garantía de integridad o actualización.
- Idiomas: no se documenta cobertura multilingüe; los benchmarks reportados son mayoritariamente en inglés, por lo que el rendimiento en castellano no está verificado.
- Longitud de contexto: no disponible, pese a que el modelo original se describe como de contexto largo; conviene validar empíricamente antes de usarlo en producción.
- Riesgo de alucinación: inherente a los VLM generativos; el modo thinking puede producir razonamientos plausibles pero incorrectos, especialmente en matemáticas visuales complejas.
- Sesgos: no se documentan análisis de sesgos en la información proporcionada; persisten los sesgos típicos de los datasets de entrenamiento.
- Licencia MIT: permite uso comercial, pero al ser un modelo derivado conviene revisar las condiciones del modelo base `moonshotai/Kimi-VL-A3B-Instruct` y de sus dependencias.
- Requiere `trust_remote_code`/`custom_code` (`kimi_vl`) en transformers, lo que implica ejecutar código del repositorio; auditar antes de desplegar.
- Sin datos de hardware, latencia ni cuantización oficiales: planificar el despliegue requiere pruebas propias.
- Grounding de agentes: los resultados de ScreenSpot/OSWorld son sensibles a la resolución y al preprocesado; no extrapolar directamente a cualquier entorno de escritorio.

## Enlaces

- Repositorio de este artefacto: https://huggingface.co/enhasasuzu/Kimi-VL-A3B-Thinking-2506-staging
- Modelo oficial: https://huggingface.co/moonshotai/Kimi-VL-A3B-Thinking-2506
- Versión Thinking anterior: https://huggingface.co/moonshotai/Kimi-VL-A3B-Thinking
- Modelo base declarado: https://huggingface.co/moonshotai/Kimi-VL-A3B-Instruct
- Tech report (arXiv): https://arxiv.org/abs/2504.07491
- Repositorio GitHub: https://github.com/MoonshotAI/Kimi-VL
- Blog técnico de la versión 2506: https://huggingface.co/blog/moonshotai/kimi-vl-a3b-thinking-2506
- Demo chat: https://huggingface.co/spaces/moonshotai/Kimi-VL-A3B-Thinking
