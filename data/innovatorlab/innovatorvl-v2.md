# InnovatorLab/InnovatorVL-v2

## Resumen
InnovatorVL-v2 es un modelo multimodal denso de aproximadamente 9.400 millones de parametros desarrollado por InnovatorLab, construido sobre Qwen3.5-9B-Base y orientado a la comprension visual con enfasis en dominios cientificos. Resuelve el problema de la baja competencia de los modelos vision-language generalistas en tareas de quimica, parsing de estructuras moleculares y comprension de reacciones, manteniendo al mismo tiempo un rendimiento general competitivo.

El modelo se entrena mediante un pipeline centrado en la gobernanza sistematica de datos: automejora recursiva para puntuar y filtrar datos, optimizacion de mezclas basada en rangos, sintesis de datos guiada por fallos y aprendizaje por refuerzo calibrado con evidencia visual (VEC-RL). Segun la model card, obtiene la mejor media en las tres categorias evaluadas (general, ciencia y espacial) sobre 22 benchmarks, con un margen de +12,46 puntos en la media cientifica frente al mejor baseline.

Es relevante ahora porque demuestra que un modelo de 9B puede superar en tareas cientificas especializadas a alternativas de mayor tamano, y porque su enfoque de curacion de datos y RL con calibracion visual es replicable. La ficha se basa unicamente en la informacion publicada en Hugging Face; los datos no presentes se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (vision-language) sobre Qwen3.5-9B-Base |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia personalizada; consultar terminos del repositorio) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento
La arquitectura es un transformer multimodal denso de tipo image-text-to-text, con un codificador visual acoplado a un modelo de lenguaje base Qwen3.5-9B-Base. El tag `qwen3_5` y la nomenclatura del repositorio confirman la base, pero la model card no detalla la configuracion del codificador visual, el numero de capas ni el mecanismo exacto de fusion de modalidades.

El entrenamiento se articula en torno a cuatro componentes declarados: gobernanza de datos con automejora recursiva para puntuar y filtrar muestras, optimizacion de mezclas de datos basada en rangos, sintesis de datos guiada por fallos del modelo y Visual Evidence-Calibrated Reinforcement Learning (VEC-RL), un esquema de RL que calibra las respuestas con evidencia visual. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de SFT, DPO o RLHF adicionales mas alla de VEC-RL. Tampoco se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades
- Comprension de imagen y texto conjunta (pipeline image-text-to-text): descripcion, respuesta a preguntas visuales y extraccion de informacion.
- Razonamiento visual en dominios cientificos: parsing de estructuras moleculares (MolParse) y comprension de reacciones quimicas (OpenRxn).
- Document AI: lectura de documentos, graficos, infografias y diagramas cientificos (DocVQA, ChartQA, InfographicVQA, AI2D).
- OCR y extraccion de texto en imagenes (OCRBench).
- Razonamiento espacial y comprension de escenas (EmbSpatial-Bench, ERQA).
- Capacidades generales de VQA y benchmarks multimodales estandar (MMBench, MMStar, MME-RealWorld).
- Modo de razonamiento (thinking): la evaluacion se realiza con thinking desactivado, lo que implica que el modelo dispone de un modo de pensamiento configurable.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente.
- Capacidades multilingues: no disponible.
- Capacidades de audio o video: no disponible (el repositorio incluye un video promocional, no una capacidad de entrada de video documentada).

## Casos de uso
- Analisis de literatura cientifica con figuras: el modelo puede procesar figuras de papers (diagramas, graficos, esquemas) y responder preguntas sobre ellas, aprovechando sus resultados en AI2D (88,34) y ChartQA (89,24) para extraer datos de graficos y diagramas tecnicos.
- Quimica computacional y parsing molecular: conversion de imagenes de estructuras moleculares a representaciones legibles (por ejemplo, SMILES) y comprension de esquemas de reaccion, respaldado por MolParse 75,40 y OpenRxn 56,50, muy por encima de los baselines comparados.
- Digitalizacion de documentos tecnicos: extraccion de campos, tablas y valores de documentos escaneados e infografias en pipelines de ingestion documental, apoyado en DocVQA 96,76 e InfographicVQA 87,69.
- Automatizacion de OCR en produccion: lectura de texto en capturas, formularios y documentos con OCRBench 88,20, integrable en flujos de captura de datos.
- Asistencia en laboratorio y educacion cientifica: interpretacion de imagenes de experimentos, material de laboratorio o diagramas de montaje, con razonamiento espacial (EmbSpatial-Bench 77,36) para describir disposiciones y relaciones entre objetos.
- Analisis de escenas del mundo real: respuesta a preguntas sobre imagenes complejas y no controladas (MME-RealWorld 71,33) para aplicaciones de inspeccion visual o asistencia en entornos reales.
- Evaluacion comparativa de modelos cientificos: uso como referencia en la seleccion de un VLM para tareas de ciencia, dado su margen de +12,46 puntos en la media cientifica frente al mejor baseline.

## Benchmarks y rendimiento
Resultados publicados en la model card (evaluacion local con thinking desactivado; se muestran los benchmarks con datos completos en la informacion disponible):

| Benchmark | InnovatorVL-v2 | Qwen3-VL-8B | Gemma4-12B-IT | InternVL3.5-8B | Step3-VL-10B | Qwen3.5-9B | Qwen3.5-9B-Base |
|---|---|---|---|---|---|---|---|
| AI2D | **88,34** | 83,74 | 77,49 | 82,22 | 83,55 | 85,46 | 63,28 |
| ChartQA | **89,24** | 85,24 | 52,12 | 87,20 | 59,68 | 85,28 | 61,04 |
| InfographicVQA (val) | **87,69** | 83,72 | 53,86 | 74,23 | 71,27 | 83,34 | 76,70 |
| DocVQA (val) | **96,76** | 93,66 | 83,10 | 92,37 | 92,33 | 94,98 | 92,60 |
| MMBench (EN dev) | **87,97** | 83,67 | 81,62 | 83,51 | 85,47 | 85,48 | 86,34 |
| MME-RealWorld | **71,33** | 63,29 | 35,02 | 62,66 | 30,32 | 60,08 | 46,79 |
| MMStar | **73,15** | 59,94 | 67,11 | 66,38 | 63,24 | 70,52 | 71,92 |
| OCRBench | **88,20** | 87,00 | 77,80 | 83,20 | 85,00 (parcial en la fuente) | no disponible | no disponible |

Medias por categoria declaradas por el autor:

| Categoria | InnovatorVL-v2 | Margen sobre el mejor baseline |
|---|---|---|
| General (12 benchmarks) | 80,18 | +3,32 |
| Ciencia (8 benchmarks) | 59,71 | +12,46 |
| Espacial (2 benchmarks) | 61,56 | +1,17 |

Resultados destacados adicionales citados en la model card: V*Bench 90,58, MolParse 75,40 (margen +56,35 sobre el mejor baseline), OpenRxn 56,50 (margen +40,85), EmbSpatial-Bench 77,36 y ERQA 45,75. El modelo queda primero en 18 de los 22 benchmarks y supera a Qwen3.5-9B en 21 de 22 (la excepcion es SimpleVQA). No se dispone de los valores numericos completos de todos los benchmarks en la informacion proporcionada.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16/FP16: aproximadamente 19 GB solo para pesos (9,41B parametros), mas overhead de activaciones y KV cache; en la practica se recomienda 24 GB o mas.
- Cuantizacion a 8 bits: en torno a 10-11 GB de pesos; a 4 bits: en torno a 5-6 GB, mas overhead. Los tipos de cuantizacion no estan documentados por el autor, por lo que las cifras son estimaciones a partir del tamano.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue en BF16 sin cuantizar. En consumer, una RTX 4090 (24 GB) puede alojar los pesos en BF16 con margen ajustado; una RTX 3090 (24 GB) queda al limite. Con cuantizacion a 8 o 4 bits cabe en GPUs de 12-16 GB (RTX 4070 Ti Super, RTX 4080).
- Opciones de despliegue: transformers (libreria declarada), y por compatibilidad con pesos safetensors, servidores tipo vLLM o TGI si el modelo esta soportado por su arquitectura; llama.cpp/Ollama requeririan conversion a GGUF, no publicada. El tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media general | Media ciencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| InnovatorVL-v2 | 9,41B (denso) | no disponible | 80,18 | 59,71 | other | Hugging Face |
| Qwen3.5-9B | ~9B | no disponible | inferior (no detallada) | inferior en 17,70 puntos | no disponible | Hugging Face |
| Qwen3-VL-8B | ~8B | no disponible | inferior (no detallada) | inferior (no detallada) | no disponible | Hugging Face |
| InternVL3.5-8B | ~8B | no disponible | inferior (no detallada) | inferior (no detallada) | no disponible | Hugging Face |

La comparativa se limita a los datos publicados por el autor en la model card; no se dispone de las medias agregadas de los baselines ni de sus especificaciones de contexto o licencia en la informacion proporcionada.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado; como todo VLM, puede generar descripciones o extracciones incorrectas en imagenes ambiguas o de baja calidad, especialmente en documentos densos.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan disponibles, lo que impide garantizar un rendimiento multilingue o conversaciones de contexto largo.
- Licencia `other`: requiere revisar los terminos del repositorio antes de cualquier uso comercial; no se garantiza permiso de uso comercial.
- Resultados autoevaluados: los benchmarks proceden de una evaluacion local del autor con thinking desactivado; no se han verificado de forma independiente y los baselines pueden haberse evaluado con configuraciones distintas.
- Adopcion muy baja: 2 descargas y 1 like en el momento de la consulta, sin ecosistema de cuantizaciones ni herramientas de terceros.
- Falta de documentacion operativa: no se detallan el codigo de inferencia, la plantilla de chat, el preprocesado de imagenes ni el formato de prompts, lo que dificulta la integracion en produccion.
- Modo thinking: los resultados publicados corresponden a thinking desactivado; el rendimiento con thinking activado no esta documentado.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/InnovatorLab/InnovatorVL-v2
- Video promocional: https://huggingface.co/InnovatorLab/InnovatorVL-v2/resolve/main/InnovatorVL-v2-Main-Promo-v7-28s.mp4
- Imagen de resultados: https://huggingface.co/InnovatorLab/InnovatorVL-v2/blob/main/main_result.png
- Imagen de rendimiento por categoria: https://huggingface.co/InnovatorLab/InnovatorVL-v2/blob/main/general_ability.png
- Paper, blog y repositorio de codigo: no disponibles en la informacion proporcionada.
