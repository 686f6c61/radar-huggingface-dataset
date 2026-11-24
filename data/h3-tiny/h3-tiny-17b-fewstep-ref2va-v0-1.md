# H3-Tiny/H3-Tiny-17B-FewStep-Ref2VA-v0.1

## Resumen

H3-Tiny-17B-FewStep-Ref2VA-v0.1 es un modelo de generación conjunta de vídeo y audio a partir de texto e imágenes de referencia, desarrollado por el proyecto independiente H3-Tiny. Se trata de una versión podada y destilada del transformer MiniMax-H3 Ref2VA de MiniMax, reducido de 33B a 17,08B de parámetros mediante poda estructurada y posteriormente sometido a destilación few-step, de modo que genera secuencias con tan solo 6 pasos de muestreo por defecto (4 o más válidos).

El modelo resuelve el coste computacional de la generación conjunta vídeo+audio: mantener la calidad del modelo original con la mitad de parámetros y una fracción de los pasos de inferencia. Es relevante porque demuestra que la poda estructurada sobre transformers de difusión multimodales es viable sin reentrenar desde cero, y porque el checkpoint es compatible con el ecosistema diffusers y con ComfyUI.

El repositorio contiene únicamente el transformer en formato diffusers (`config.json` + safetensors fragmentados); el text encoder, los VAE y los procesadores se toman del checkpoint oficial MiniMax-H3. El proyecto no está afiliado ni respaldado por MiniMax.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (layout diffusers) para generación conjunta de vídeo y audio; poda estructurada del MiniMax-H3 Ref2VA |
| Parametros totales | 17.082.950.608 (17,08B, solo transformer) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (condicionado por número de frames; ejemplo de la model card: 124 frames) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (MiniMax H3 Community License Agreement) |
| Formato de pesos | safetensors (fragmentados) + config.json; versión single-file para ComfyUI en repo aparte |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión derivado de MiniMax-H3 Ref2VA, cuyo flujo de trabajo acepta imágenes de referencia (referenced-to-video + audio) y texto para producir vídeo con audio sincronizado. La cadena de construcción es explícita en la model card: primero una poda estructurada del transformer original de 33B hasta 17B (MiniMax-H3-Tiny-17B-Pruned-Ref2VA) y después una destilación few-step que reduce el número de pasos de muestreo necesarios. El proyecto contempla además una etapa posterior de 14B.

La innovación principal es la combinación de poda estructurada con destilación few-step: el resultado mantiene el pipeline Ref2VA pero con 6 pasos por defecto en lugar de los muestreos largos habituales en difusión de vídeo. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO (no aplicables habitualmente a difusión, pero no confirmados).

## Capacidades

- Generación de vídeo a partir de texto e imágenes de referencia (Ref2VA: reference images to video + audio).
- Generación conjunta de audio sincronizado con el vídeo en una sola pasada.
- Muestreo few-step: 6 pasos por defecto, 4 pasos para mayor velocidad y 8 pasos para mayor detalle.
- Control del número de frames generados (ejemplo de la model card: `--num-frames 124`).
- Integración con diffusers mediante `h3tiny.pipeline.load_pipeline`.
- Compatibilidad con ComfyUI a través de un checkpoint single-file y nodos propios.
- Soporte de offloading y distintos backends de atención (mencionados en el README de GitHub).
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Prototipado rápido de vídeo generativo: con 17B y 6 pasos por defecto, permite iterar prompts y referencias en una sola GPU de gama alta sin esperar muestreos largos, útil para equipos que diseñan storyboards o pruebas de concepto.
- Generación de clips con audio integrado: al producir vídeo y audio en la misma pasada, sirve para crear piezas cortas con sonido sincronizado sin un pipeline de audio separado, reduciendo la complejidad del flujo.
- Control por imagen de referencia: el flujo Ref2VA permite fijar la identidad o el estilo de un sujeto mediante `<Picture 1>` y mantenerlo en el vídeo generado, aplicable a contenido de marca o personajes recurrentes.
- Integración en ComfyUI: mediante el checkpoint single-file y los nodos del proyecto, se puede incorporar a grafos de nodos existentes para composición con otros modelos (upscalers, postproceso, etc.).
- Investigación sobre poda y destilación: el repo incluye scripts de poda y el pipeline completo, lo que lo convierte en una base reproducible para estudiar la compresión de transformers de difusión multimodales.
- Despliegue con offloading en hardware limitado: las opciones de offloading documentadas permiten ejecutarlo en configuraciones con menos VRAM a costa de velocidad, adecuado para entornos de laboratorio.
- Evaluación comparativa de calidad frente al modelo base: al ser un derivado directo de MiniMax-H3, permite medir la pérdida de calidad introducida por la poda y la destilación en un mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, un transformer de 17,08B en precisión de 16 bits ocupa aproximadamente 34 GB solo en pesos, a lo que hay que sumar text encoder, VAE y activaciones; el tamaño del repo (34,2 GB) es coherente con pesos en fp16/bf16.
- GPU recomendadas: no especificadas por el autor. Por tamaño, se requiere al menos una GPU con 48-80 GB (A100 80GB, H100) para ejecución sin offloading; no confirmado.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB sin cuantización u offloading agresivo; el autor documenta opciones de offloading en el README de GitHub, pero no se detallan requisitos mínimos.
- Opciones de despliegue: pipeline propio `h3tiny` (Python, diffusers), script `scripts/infer.py`, y ComfyUI mediante el repo MiniMax-H3-Tiny-ComfyUI y sus nodos.
- Latencia y throughput: no disponibles. El uso de 4-8 pasos de muestreo reduce el coste frente a muestreos largos, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Pasos de muestreo | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| H3-Tiny-17B-FewStep-Ref2VA-v0.1 | 17,08B | 6 por defecto (4-8) | Vídeo + audio desde texto y referencias | MiniMax H3 Community License | Hugging Face, diffusers, ComfyUI |
| MiniMax-H3 (base) | 33B (según model card del derivado) | no disponible | Vídeo + audio desde texto y referencias | MiniMax H3 Community License | Checkpoint oficial en diffusers |
| H3-Tiny-14B (etapa posterior del proyecto) | 14B | no disponible | Vídeo + audio desde texto y referencias | MiniMax H3 Community License | Mencionado en el proyecto, no detallado |

No se dispone de datos de benchmarks ni de comparación cuantitativa de calidad frente al modelo base en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos son derivados de MiniMax H3 y se rigen por la MiniMax H3 Community License Agreement, que incluye ámbito territorial y política de uso aceptable; es imprescindible revisar el LICENSE y el NOTICE antes de cualquier uso comercial.
- Solo contiene el transformer: requiere descargar el checkpoint oficial MiniMax-H3 para el text encoder, los VAE y los procesadores; no es un paquete autónomo.
- Proyecto independiente no afiliado a MiniMax; el soporte se limita a GitHub issues, la pestaña Community y el correo del autor.
- Al ser un modelo podado y destilado, es esperable cierta pérdida de calidad frente al base de 33B, aunque no se publican métricas que la cuantifiquen.
- Riesgo de alucinación visual y de artefactos en vídeo y audio no documentado por el autor; no hay evaluación publicada.
- Idiomas soportados no declarados; el comportamiento multilingüe de los prompts depende del text encoder del checkpoint base.
- Requisitos de hardware elevados y no documentados oficialmente; el despliegue en GPUs de consumo requiere offloading y no está garantizado.
- Modelo en versión v0.1, con fecha de creación y actualización muy recientes; la API y el pipeline pueden cambiar.

## Enlaces

- Hugging Face: https://huggingface.co/H3-Tiny/H3-Tiny-17B-FewStep-Ref2VA-v0.1
- Página del proyecto: https://fuyi25.github.io/MiniMax-H3-Tiny/
- GitHub: https://github.com/fuyi25/MiniMax-H3-Tiny
- Colección H3-Tiny v0.1: https://huggingface.co/collections/H3-Tiny/h3-tiny-v01-6afeea67147c27cf3b80820a
- Pesos para ComfyUI: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-ComfyUI
- Nodos ComfyUI: https://github.com/fuyi25/MiniMax-H3-Tiny/tree/main/comfyui
- Licencia: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-FewStep-Ref2VA-v0.1/blob/main/LICENSE-MiniMax-H3
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Contacto: fohoo@outlook.com
- Issues: https://github.com/fuyi25/MiniMax-H3-Tiny/issues
