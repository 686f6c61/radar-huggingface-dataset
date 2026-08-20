# Kiskacsa/SmolVLM2-500M-Video-Instruct

## Resumen

SmolVLM2-500M-Video-Instruct es un modelo multimodal ligero desarrollado por Hugging Face (publicado en el repositorio de Kiskacsa) que procesa entradas de vídeo, imágenes y texto para generar respuestas textuales. Está basado en la arquitectura Idefics3, que combina un codificador visual SigLIP con un modelo de lenguaje SmolLM2 de 500 millones de parámetros, y ha sido ajustado específicamente para tareas de instrucción sobre vídeo e imágenes. Su principal ventaja es su reducido tamaño: requiere solo 1,8 GB de VRAM para inferencia de vídeo, lo que lo hace adecuado para despliegue en dispositivos con recursos limitados.

El modelo resuelve el problema de análisis de contenido audiovisual en entornos con restricciones de cómputo, permitiendo tareas como respuesta a preguntas sobre vídeos, descripción de escenas, comparación de imágenes o transcripción de texto en imágenes. Su relevancia actual radica en la creciente demanda de modelos multimodales eficientes que puedan ejecutarse en hardware de consumo o en el borde, sin sacrificar demasiado rendimiento. La licencia Apache 2.0 facilita su uso comercial y su integración en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Idefics3 (vision encoder SigLIP + LLM SmolLM2) |
| Parametros totales | 507.482.304 (aprox. 507M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16, cuantizable posteriormente) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Idefics3, que combina un codificador de vision SigLIP (para extraer caracteristicas visuales de imagenes y frames de video) con un modelo de lenguaje SmolLM2 de 500M parametros. El procesador de video divide el contenido en frames y los proyecta al espacio de embeddings del LLM mediante un proyector. No es un modelo MoE, sino denso, lo que simplifica su despliegue.

El entrenamiento se realizo en dos fases: primero un pre-entrenamiento sobre datos multimodales generales (The Cauldron, Docmatix, LLaVA-OneVision-Data, M4-Instruct-Data) y posteriormente un ajuste fino instructivo con datasets especificos de video como FineVideo, LLaVA-Video-178K, Video-STaR, Vript, VISTA-400K, MovieChat-1K y ShareGPT4Video. No se menciona el uso de RLHF o DPO; el ajuste se basa en instrucciones supervisadas. El modelo base es HuggingFaceTB/SmolVLM-500M-Instruct, al que se le anade la capacidad de procesar video.

## Capacidades

- Generacion de texto a partir de video, imagenes o combinaciones de ambos, con soporte para entradas intercaladas (texto + imagen + video).
- Respuesta a preguntas visuales (VQA) sobre contenido de video e imagenes.
- Descripcion detallada de escenas, objetos y acciones en video.
- Comparacion de multiples imagenes o frames.
- Transcripcion de texto presente en imagenes (OCR ligero).
- Capacidad de seguir instrucciones multimodales mediante chat template.
- No soporta generacion de video ni de imagenes.

## Casos de uso

- Analisis de video en tiempo real en dispositivos edge: el modelo puede procesar secuencias de video capturadas por camaras de seguridad o drones, generando descripciones o alertas textuales con un consumo de VRAM de solo 1,8 GB, viable en hardware embebido.
- Asistente de accesibilidad para personas con discapacidad visual: dado un video o imagen, el modelo genera descripciones verbales detalladas que pueden ser leidas en voz alta por un sintetizador.
- Moderacion de contenido audiovisual: clasificacion y descripcion de contenido en videos generados por usuarios para detectar material inapropiado, integrándose en pipelines de revision con transformers.
- Transcripcion y extraccion de informacion de documentos escaneados: al recibir imagenes de documentos, el modelo extrae el texto y responde preguntas sobre su contenido, util para automatizar procesos de gestion documental.
- Generacion de subtitulos descriptivos para video: el modelo puede producir narraciones o subtitulos en ingles para videos, facilitando la creacion de contenido accesible.
- Comparacion visual de productos en comercio electronico: dado dos imagenes de productos, el modelo identifica diferencias y similitudes, ayudando en sistemas de recomendacion o control de calidad.
- Asistente educativo interactivo: los estudiantes pueden subir capturas de pantalla o videos de problemas y el modelo explica los pasos o responde preguntas, funcionando en portatiles con GPU modesta.

## Benchmarks y rendimiento

La model card del autor proporciona resultados en benchmarks de video para la familia SmolVLM2:

| Tamano | Video-MME | MLVU | MVBench |
|--------|-----------|------|---------|
| 2.2B   | 52.1      | 55.2 | 46.27   |
| 500M   | 42.2      | 47.3 | 39.73   |
| 256M   | 33.7      | 40.6 | 32.7    |

El modelo de 500M (el de esta ficha) obtiene 42.2 en Video-MME, 47.3 en MLVU y 39.73 en MVBench, mostrando un rendimiento competitivo para su tamano, aunque inferior al de la variante de 2.2B. No se han publicado comparaciones con otros modelos externos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 1,8 GB para inferencia de video (segun la model card), lo que permite ejecucion en GPUs consumer de gama baja.
- GPUs recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060, o incluso integradas con suficiente memoria compartida. Para mayor velocidad, se recomienda una RTX 4060 o superior.
- Cabe en GPUs consumer: si, en practicamente todas las GPUs modernas de consumo.
- Opciones de despliegue: transformers (con flash-attention opcional), vLLM, TGI, ONNX Runtime, y cuantizacion posterior para reducir aun mas el uso de memoria.
- Latencia y throughput: no disponible en la informacion proporcionada, pero al ser un modelo de 500M, se espera una generacion rapida en hardware consumer (del orden de decenas de tokens por segundo en una RTX 3060).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Video-MME | Licencia | Disponibilidad |
|--------|------------|----------|-----------|----------|----------------|
| SmolVLM2-500M-Video-Instruct | 507M | no disponible | 42.2 | Apache 2.0 | HuggingFace |
| SmolVLM2-2.2B-Video-Instruct | 2.2B | no disponible | 52.1 | Apache 2.0 | HuggingFace |
| SmolVLM2-256M-Video-Instruct | 256M | no disponible | 33.7 | Apache 2.0 | HuggingFace |

La comparativa se limita a la misma familia SmolVLM2, ya que no se dispone de datos de otros modelos multimodales de tamano similar (como Qwen2-VL-2B o Phi-3.5-vision) en la informacion proporcionada. El modelo de 500M ofrece un equilibrio entre rendimiento y eficiencia, siendo notablemente mejor que el de 256M y acercandose al de 2.2B con un coste computacional mucho menor.

## Limitaciones y advertencias

- Solo soporta ingles; no hay soporte multilingue en la version publicada.
- No esta disenado para escenarios de alto riesgo ni para toma de decisiones criticas que afecten al bienestar o sustento de las personas.
- Puede producir contenido que parezca factual pero sea inexacto (alucinaciones), especialmente en videos complejos o ambiguos.
- La longitud de contexto no esta documentada, lo que limita la planificacion de tareas con secuencias largas.
- No genera video ni imagenes; solo texto.
- El rendimiento en video depende de la calidad de los frames extraidos; videos de baja resolucion o con movimiento rapido pueden degradar los resultados.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no incluye garantias de exactitud ni de seguridad para produccion sin evaluacion adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Kiskacsa/SmolVLM2-500M-Video-Instruct
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM-500M-Instruct
- Blog de SmolVLM2: https://huggingface.co/blog/smolvlm2
- Demo (Video Highlight Generator): https://huggingface.co/spaces/HuggingFaceTB/SmolVLM2-HighlightGenerator
- Paper de SmolVLM2 (arXiv 2504.05299): https://arxiv.org/abs/2504.05299
- Tutorial de fine-tuning: https://github.com/huggingface/smollm/blob/main/vision/finetuning/Smol_VLM_FT.ipynb
