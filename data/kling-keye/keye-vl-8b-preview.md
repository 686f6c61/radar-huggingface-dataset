# Kling-Keye/Keye-VL-8B-Preview

## Resumen

Kwai Keye-VL es un modelo fundacional multimodal de 8.700 millones de parametros desarrollado por el equipo Kwai Keye de Kuaishou, disenado especificamente para la comprension de videos cortos manteniendo capacidades solidas de vision-lenguaje de proposito general. El modelo aborda una limitacion conocida de los MLLM actuales: su rendimiento inferior en videos dinamicos y densos en informacion, un formato dominante en el ecosistema digital actual. La version publicada en Hugging Face bajo el identificador `Kling-Keye/Keye-VL-8B-Preview` corresponde a la preview del modelo, con pipeline `video-text-to-text` y pesos en formato safetensors.

La relevancia del modelo reside en su receta de entrenamiento: un corpus de mas de 600.000 millones de tokens con fuerte enfasis en video, un preentrenamiento en cuatro etapas para alineacion vision-lenguaje y un postentrenamiento en dos fases que incluye una innovadora mezcla de datos de "cold-start" en cinco modos (thinking, non-thinking, auto-think, think with image y video de alta calidad). Esto le permite decidir cuando y como razonar, con modos de pensamiento controlables mediante los tokens `/think` y `/no_think`, siguiendo el mecanismo de Qwen3.

El modelo se distribuye con licencia Apache 2.0, lo que facilita su uso comercial, y viene acompanado de un benchmark propio (KC-MMBench) orientado a escenarios reales de video corto. Su tamano de 8.700 millones de parametros lo situa en un rango desplegable en hardware de gama alta de consumo con cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) con modos de razonamiento; detalles internos no disponibles |
| Parametros totales | 8.696.828.736 (8,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones comunitarias no confirmadas) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Keye-VL es un modelo multimodal de tipo vision-lenguaje construido sobre un transformer (los detalles exactos de la arquitectura interna no se especifican en la informacion disponible). El desarrollo se apoya en dos pilares: un corpus de mas de 600.000 millones de tokens con fuerte peso del video, y una receta de entrenamiento en varias etapas. El preentrenamiento consta de cuatro fases orientadas a una alineacion solida vision-lenguaje; el postentrenamiento se divide en dos fases: la primera refuerza capacidades fundamentales como el seguimiento de instrucciones y la segunda estimula el razonamiento avanzado.

La innovacion principal es la mezcla de datos de "cold-start" en cinco modos: thinking, non-thinking, auto-think, think with image y video de alta calidad. Esta mezcla ensena al modelo a decidir cuando y como razonar. Posteriormente se aplican etapas de aprendizaje por refuerzo (RL) y alineacion que mejoran el razonamiento y corrigen comportamientos anomalos como las salidas repetitivas. El modelo admite un mecanismo de conmutacion suave de los modos de pensamiento mediante `/think` y `/no_think`, y procesa entradas visuales con un rango configurable de tokens visuales por imagen (por defecto 4-16384, ajustable mediante `min_pixels` y `max_pixels`).

## Capacidades

- Comprension de video corto: analisis de contenido dinamico y denso en informacion, principal foco del modelo.
- Comprension de imagen estatica: tareas generales de vision-lenguaje con rendimiento competitivo.
- Razonamiento multimodal con modos de pensamiento controlables (`/think`, `/no_think`, auto-think).
- Razonamiento "think with image": razonamiento guiado por la imagen de entrada.
- Generacion de texto y respuesta a instrucciones multimodales.
- Procesamiento de entradas intercaladas de imagenes y videos (base64, URLs, contenido intercalado via `keye-vl-utils`).
- Extraccion de caracteristicas (`feature-extraction` segun los tags del repositorio).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el modo thinking sugiere razonamiento multi-paso interno.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Moderacion y analisis de contenido en plataformas de video corto: el modelo puede inspeccionar clips y describir o clasificar su contenido, aprovechando su entrenamiento especifico en video denso en informacion y el benchmark KC-MMBench orientado a escenarios reales.
- Generacion automatica de descripciones y subtitulos para videos: dada su capacidad video-text-to-text, permite producir texto descriptivo a partir de clips, util para accesibilidad y SEO.
- Busqueda y recuperacion semantica de video: mediante extraccion de caracteristicas (tag `feature-extraction`) se pueden generar embeddings multimodales para indexar y recuperar clips por similitud semantica.
- Asistentes de analisis de contenido audiovisual: con modos de razonamiento controlables, se puede ajustar el coste computacional (non-thinking) frente a la profundidad analitica (thinking) segun la tarea.
- Analisis de imagenes en pipelines de vision-lenguaje: a pesar de su foco en video, mantiene capacidades de imagen competitivas para tareas de VQA, captioning o descripcion detallada.
- Investigacion en razonamiento multimodal: la mezcla de cinco modos de cold-start y las etapas de RL lo convierten en una base para estudiar cuando y como razonan los MLLM.
- Prototipado rapido con Transformers: integracion directa mediante `AutoModel`, `AutoProcessor` y `keye-vl-utils`, con soporte de FlashAttention-2 para escenarios multi-imagen y video.

## Benchmarks y rendimiento

La model card afirma que Keye-VL alcanza resultados state-of-the-art en benchmarks publicos de video y se mantiene competitivo en tareas generales de imagen, ademas de mostrar ventaja significativa en KC-MMBench. Sin embargo, no se proporcionan cifras numericas concretas en la informacion disponible.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,7 B de parametros, en bfloat16 se requieren aproximadamente 17,4 GB solo para pesos, mas overhead de activaciones y tokens visuales; en cuantizacion de 8 bits ~9 GB y en 4 bits ~5 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: A100 o H100 para inferencia en bfloat16 con video de alta resolucion y contexto largo; RTX 4090 (24 GB) viable en bfloat16 con cuidado en el numero de tokens visuales.
- Cabe en GPU de consumo: si, en GPUs con 24 GB o mas en bfloat16; en GPUs de 12-16 GB requeriria cuantizacion (no se publican pesos cuantizados oficiales).
- Opciones de despliegue: Transformers (recomendado con `pip install git+https://github.com/huggingface/transformers`), con soporte de FlashAttention-2. Otras opciones como vLLM, llama.cpp, Ollama o TGI no estan confirmadas en la informacion disponible.
- Latencia y throughput: no disponibles. El modelo recomienda FlashAttention-2 para aceleracion y ahorro de memoria, especialmente en escenarios multi-imagen y video.

## Comparativa con modelos similares

No se dispone de datos numericos de rendimiento para comparar directamente. Se ofrece una comparacion estructural basica:

| Modelo | Parametros | Contexto | Foco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Keye-VL-8B-Preview | 8,7 B | no disponible | Video corto + vision-lenguaje | Apache 2.0 | Hugging Face |
| Keye-VL-1.5-8B | 8 B (aproximado) | no disponible | Video corto + vision-lenguaje | no disponible en la informacion | Hugging Face (Kwai-Keye) |
| Qwen3 (referencia de mecanismo) | no disponible | no disponible | LLM texto | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion: como todo MLLM, puede generar descripciones o respuestas no fundamentadas en el contenido visual; se recomienda verificacion en produccion.
- Comportamientos anomalos: la model card menciona explicitamente que las etapas de RL y alineacion corrigen salidas repetitivas, lo que sugiere que versiones sin alinear pueden presentar este problema.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible; el entrenamiento con datos de video de plataformas puede introducir sesgos de dominio.
- Contexto: la longitud maxima de contexto no se especifica, lo que dificulta planificar cargas de video largas.
- Licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribucion.
- Estado "Preview": al ser una version preview, cabe esperar cambios de API, pesos o comportamiento en versiones posteriores.
- Dependencia de `trust_remote_code=True` y de la libreria `keye-vl-utils`, lo que implica ejecutar codigo del autor y revisar su procedencia.
- Fecha de creacion del repositorio (2026-11-23) posterior a la fecha de lanzamiento anunciada en la model card (2025-06-26); conviene verificar la version exacta de los pesos.

## Enlaces

- Hugging Face: https://huggingface.co/Kling-Keye/Keye-VL-8B-Preview
- Hugging Face (modelo original Kwai): https://huggingface.co/Kwai-Keye/Keye-VL-8B-Preview
- Version 1.5: https://huggingface.co/Kwai-Keye/Keye-VL-1_5-8B/
- Demo: https://huggingface.co/spaces/Kwai-Keye/Keye-VL-8B-Preview
- Informe tecnico (arXiv): https://arxiv.org/abs/2509.01563
- Paper adicional (arXiv): https://arxiv.org/abs/2507.01949
- Repositorio GitHub: https://github.com/Kwai-Keye/Keye
- Pagina principal: https://kwai-keye.github.io/
- X (Twitter): https://x.com/KwaiKeye
- Discord: https://discord.gg/4Q6AmzxpEK
- Kuaishou: https://www.kuaishou.com/
