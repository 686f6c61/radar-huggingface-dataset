# JakTheTrippr/Kimi-VL-A3B-Thinking-2506

## Resumen

Kimi-VL-A3B-Thinking-2506 es un modelo multimodal de tipo imagen-texto desarrollado por Moonshot AI, publicado originalmente como `moonshotai/Kimi-VL-A3B-Thinking-2506` y redistribuido en este repositorio por el usuario JakTheTrippr como un fine-tune sobre `moonshotai/Kimi-VL-A3B-Instruct`. Se trata de una revisión del modelo Kimi-VL-A3B-Thinking que mejora el razonamiento multimodal, la percepción visual general y la comprensión de vídeo, manteniendo un coste de "thinking" reducido en aproximadamente un 20 % respecto a la versión anterior.

El modelo emplea una arquitectura Mixture-of-Experts (MoE) con 16.400 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, lo que explica el sufijo "A3B". Combina un codificador visual con un transformer de lenguaje de tipo MoE, e incorpora un modo de razonamiento explícito ("thinking") que permite resolver tareas de matemáticas visuales, grounding de agentes y comprensión de documentos de alta resolución. Soporta imágenes de hasta 3,2 millones de píxeles totales, cuatro veces más que la versión previa.

La relevancia actual del modelo radica en que ofrece rendimiento cercano a modelos mucho mayores en benchmarks de razonamiento multimodal (MathVision 56,9; MathVista 80,1; MMMU 64,0; VideoMMMU 65,2) con un coste de inferencia contenido gracias a su naturaleza MoE y a la reducción de tokens de pensamiento. Su licencia MIT facilita el uso comercial y la experimentación, si bien este repositorio concreto es una redistribución de terceros con 0 descargas y sin garantías de mantenimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal con codificador visual y transformer de lenguaje; clase `kimi_vl` con código personalizado |
| Parametros totales | 16.407.657.776 (16,4 B) |
| Parametros activos | aproximadamente 3 B (según nomenclatura A3B; no confirmado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (también compatible con transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de tipo Mixture-of-Experts. Combina un codificador de visión con un modelo de lenguaje MoE de aproximadamente 16,4 B de parámetros totales y unos 3 B activos por token, lo que reduce el coste computacional por inferencia frente a un modelo denso del mismo tamaño. La arquitectura exacta (número de capas, dimensión oculta, número de expertos, mecanismo de atención) no se detalla en la información proporcionada; el repositorio declara la clase `kimi_vl` y requiere `trust_remote_code` para cargar el modelo con transformers.

El modelo base es `moonshotai/Kimi-VL-A3B-Instruct`, y esta versión 2506 se presenta como una mejora de `Kimi-VL-A3B-Thinking`. Según la model card, incorpora un modo de razonamiento ("thinking") que reduce la longitud media de pensamiento en un 20 % respecto a la versión anterior manteniendo o mejorando la precisión. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El informe técnico asociado es arXiv:2504.07491.

## Capacidades

- Generación de texto e imagen-texto conversacional (pipeline `image-text-to-text`).
- Razonamiento multimodal con modo "thinking" explícito, orientado a tareas de matemáticas visuales y razonamiento complejo.
- Comprensión de imágenes de alta resolución: hasta 3,2 millones de píxeles totales por imagen (4× respecto a la versión previa).
- Comprensión y razonamiento sobre vídeo, incluyendo benchmarks como VideoMMMU y Video-MME.
- Grounding de agentes y percepción de interfaces: ScreenSpot-Pro, ScreenSpot-V2 y OSWorld-G.
- OCR y comprensión de documentos (OCRBench 869).
- Percepción visual general: MMBench, MMStar, RealWorldQA, MMVet.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: el modelo muestra rendimiento en benchmarks de agentes (OSWorld-G), pero no se detalla soporte explícito de orquestación de herramientas.

## Casos de uso

- Razonamiento matemático sobre imágenes: el modelo resuelve problemas de matemáticas visuales (MathVision 56,9; MathVista 80,1) a partir de diagramas, gráficos y figuras, adecuado para asistentes educativos que interpretan enunciados con imágenes.
- Automatización de agentes de interfaz (GUI agents): con 52,8 en ScreenSpot-Pro y 52,5 en OSWorld-G, puede localizar elementos en capturas de pantalla y guiar interacciones en entornos de escritorio, útil para testing automatizado de aplicaciones.
- Análisis de documentos de alta resolución: al soportar hasta 3,2 M de píxeles por imagen, permite procesar planos, tablas densas, informes escaneados y capturas de pantalla completas sin recortes agresivos.
- Comprensión de vídeo para análisis de contenido: con 65,2 en VideoMMMU y 71,9 en Video-MME, sirve para resumir vídeos, responder preguntas sobre secuencias y extraer información temporal en aplicaciones de moderación o análisis de reuniones.
- Asistencia a la accesibilidad: descripción de imágenes y vídeos de alta resolución para generar texto alternativo detallado, aprovechando su capacidad de percepción visual general (MMVet 78,1).
- Extracción de información de capturas y formularios: OCRBench 869 y grounding de pantalla permiten construir pipelines de digitalización de formularios, facturas o interfaces legacy.
- Investigación en razonamiento multimodal: el modo "thinking" con menor longitud de pensamiento lo hace útil como modelo de referencia para estudiar eficiencia de razonamiento en entornos con recursos limitados.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo original (referencia GPT-4o en cursiva):

| Benchmark (métrica) | GPT-4o | Qwen2.5-VL-7B | Gemma3-12B-IT | Kimi-VL-A3B-Instruct | Kimi-VL-A3B-Thinking | Kimi-VL-A3B-Thinking-2506 |
|---|---|---|---|---|---|---|
| MMBench-EN-v1.1 (Acc) | *83,1* | 83,2 | 74,6 | 82,9 | 76,0 | **84,4** |
| RealWorldQA (Acc) | *75,4* | 68,5 | 59,1 | 68,1 | 64,0 | **70,0** |
| OCRBench (Acc) | *815* | 864 | 702 | 864 | 864 | **869** |
| MMStar (Acc) | *64,7* | 63,0 | 56,1 | 61,7 | 64,2 | **70,4** |
| MMVet (Acc) | *69,1* | 67,1 | 64,9 | 66,7 | 69,5 | **78,1** |
| MMMU (val, Pass@1) | *69,1* | 58,6 | 59,6 | 57,0 | 61,7 | **64,0** |
| MMMU-Pro (Pass@1) | *51,7* | 38,1 | 32,1 | 36,0 | 43,2 | **46,3** |
| MATH-Vision (Pass@1) | *30,4* | 25,0 | 32,1 | 21,7 | 36,8 | **56,9** |
| MathVista_MINI (Pass@1) | *63,8* | 68,0 | 56,1 | 68,6 | 71,7 | **80,1** |
| VideoMMMU (Pass@1) | *61,2* | 47,4 | 57,0 | 52,1 | 55,5 | **65,2** |
| MMVU (Pass@1) | *67,4* | 50,1 | 57,0 | 52,7 | 53,0 | **57,5** |
| Video-MME (w/ sub.) | *77,2* | 71,6 | 62,1 | **72,7** | 66,0 | 71,9 |
| ScreenSpot-Pro (Acc) | *0,8* | 29,0 | — | 35,4 | — | **52,8** |
| ScreenSpot-V2 (Acc) | *18,1* | 84,2 | — | **92,8** | — | 91,4 |
| OSWorld-G (Acc) | — | *31,5* | — | 41,6 | — | **52,5** |

Según la model card, la versión 2506 requiere de media un 20 % menos de tokens de pensamiento que la versión Thinking anterior.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 16,4 B de parámetros en bf16 requiere aproximadamente 33 GB de VRAM solo para pesos, a los que se suman memoria para el codificador visual, el contexto y la caché KV.
- GPU recomendadas: no disponibles de forma explícita. Por tamaño, cabría esperar viabilidad en A100 40/80 GB, H100 80 GB o configuraciones multi-GPU; no se confirma en la información disponible.
- ¿Cabe en GPU de consumo? No confirmado. En cuantizaciones de 4 bits podría aproximarse a 24 GB, pero no se dispone de datos oficiales de cuantización para este repositorio.
- Opciones de despliegue: transformers con `trust_remote_code=True` (declarado en la model card). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMMU | MathVista | VideoMMMU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Kimi-VL-A3B-Thinking-2506 | 16,4 B totales / ~3 B activos | no disponible | 64,0 | 80,1 | 65,2 | MIT | Hugging Face (este repo y original de Moonshot) |
| Qwen2.5-VL-7B | 7 B (denso) | no disponible | 58,6 | 68,0 | 47,4 | no disponible en la información | Hugging Face |
| Gemma3-12B-IT | 12 B (denso) | no disponible | 59,6 | 56,1 | 57,0 | no disponible en la información | Hugging Face |
| Kimi-VL-A3B-Instruct | 16,4 B totales / ~3 B activos | no disponible | 57,0 | 68,6 | 52,1 | MIT | Hugging Face |

## Limitaciones y advertencias

- Este repositorio es una redistribución de terceros (JakTheTrippr) con 0 descargas y 0 likes; no es el repositorio oficial de Moonshot AI y podría no recibir mantenimiento ni actualizaciones.
- La model card del repositorio es una copia de la del modelo original; no se documentan cambios específicos del fine-tune respecto a `moonshotai/Kimi-VL-A3B-Instruct`.
- Riesgo de alucinación inherente a los modelos de lenguaje y visión-lenguaje; no se han publicado evaluaciones específicas de fidelidad factual para esta versión.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto e idioma: no disponibles; no se especifican idiomas soportados ni longitud máxima de contexto.
- Requiere `trust_remote_code=True` para cargar el modelo con transformers, lo que implica ejecutar código personalizado del repositorio.
- Licencia MIT: permite uso comercial, pero el usuario debe verificar las licencias de los componentes base y del codificador visual subyacente.
- No se confirman cifras de latencia, throughput ni soporte de motores de inferencia optimizados (vLLM, TGI), lo que añade incertidumbre para despliegues en producción.
- El tamaño del repositorio (32,8 GB) implica requisitos de almacenamiento y ancho de banda considerables para su descarga.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JakTheTrippr/Kimi-VL-A3B-Thinking-2506
- Modelo original: https://huggingface.co/moonshotai/Kimi-VL-A3B-Thinking-2506
- Modelo base: https://huggingface.co/moonshotai/Kimi-VL-A3B-Instruct
- Versión previa Thinking: https://huggingface.co/moonshotai/Kimi-VL-A3B-Thinking
- Informe técnico (arXiv): https://arxiv.org/abs/2504.07491
- Repositorio GitHub: https://github.com/MoonshotAI/Kimi-VL
- Blog técnico con receta de inferencia: https://huggingface.co/blog/moonshotai/kimi-vl-a3b-thinking-2506
- Demo chat: https://huggingface.co/spaces/moonshotai/Kimi-VL-A3B-Thinking
